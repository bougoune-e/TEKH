import { useEffect, useState, useMemo, useRef } from "react";
import { fetchAllDealsForAdmin, updateDeal, deleteDealById, insertDeal, uploadImage } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { supabase } from "@/core/api/supabaseApi";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Trash2, Send, Archive, Phone, MapPin, Plus, X, Image as ImageIcon, Bell } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

function getApiUrl(): string {
  const env = (import.meta.env.VITE_API_URL as string || "").trim().replace(/\/$/, "");
  if (!env) return "";
  return /^https?:\/\//i.test(env) ? env : `https://${env}`;
}
const API_URL = getApiUrl();

type Annonce = {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  status: string;
  condition?: string;
  location?: string;
  sellerName?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  createdAt: string;
};

type StatusFilter = "all" | "draft" | "published" | "archived";

const STATUS_LABELS: Record<string, string> = {
  draft: "En attente",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  draft: "secondary",
  published: "default",
  archived: "destructive",
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "draft", label: "En attente" },
  { key: "published", label: "Publiées" },
  { key: "archived", label: "Archivées" },
];

// ── Formulaire de création d'annonce admin ────────────────────
function AdminAnnonceForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sendPush, setSendPush] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Le titre est obligatoire"); return; }
    setSaving(true);
    try {
      let images: string[] = [];
      if (imageFile) {
        const { publicUrl } = await uploadImage(imageFile);
        images = [publicUrl];
      }

      // Récupérer l'UID de l'admin pour satisfaire la RLS policy (owner_id = auth.uid())
      const { data: { session } } = await supabase.auth.getSession();
      const adminUid = session?.user?.id ?? null;

      await insertDeal({
        title: title.trim(),
        brand: "TEKH+",
        model: "Annonce",
        description: description.trim() || title.trim(),
        price: Number(price) || 0,
        images,
        status: "published",
        sellerName: "Admin",
        ownerId: adminUid,
        publishedAt: new Date().toISOString(),
      });

      // Envoyer une notification push si demandé
      if (sendPush) {
        const { data: { session } } = await supabase.auth.getSession();
        const jwt = session?.access_token;
        if (jwt) {
          await fetch(`${API_URL}/api/push/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({
              title: title.trim(),
              body: description.trim() || "Nouvelle annonce disponible",
              url: "/deals",
              tag: "tekh-annonce",
            }),
          }).catch(() => {});
        }
      }

      toast.success("Annonce publiée" + (sendPush ? " + notification envoyée" : ""));
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la publication");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border/50 p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-base">Publier une annonce</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Visible immédiatement dans l'app</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Titre */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titre *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Promo iPhone 13 ce week-end !"
            maxLength={100}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails de l'annonce..."
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Prix (optionnel) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prix FCFA <span className="normal-case font-normal">(optionnel)</span></label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Image */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photo <span className="normal-case font-normal">(optionnel)</span></label>
          {imagePreview ? (
            <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-border">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Ajouter une photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        {/* Toggle push */}
        <label className="flex items-center gap-3 p-3 rounded-2xl border border-border cursor-pointer hover:bg-muted/50 transition-colors select-none">
          <div
            onClick={() => setSendPush((v) => !v)}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${sendPush ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${sendPush ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-primary" />
              Notifier les abonnés
            </div>
            <div className="text-xs text-muted-foreground">Envoie une push notification en même temps</div>
          </div>
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()} className="flex-1 gap-2 font-black">
            <Send className="h-4 w-4" />
            {saving ? "Publication..." : "Publier"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Annonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    fetchAllDealsForAdmin()
      .then((data) => setAnnonces(data as Annonce[]))
      .catch(() => toast.error("Erreur chargement annonces"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await updateDeal(id, { status });
      toast.success(status === "published" ? "Annonce publiée" : "Annonce archivée");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDealById(id);
      toast.success("Annonce supprimée");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const filtered = useMemo(
    () => filter === "all" ? annonces : annonces.filter((a) => a.status === filter),
    [annonces, filter]
  );

  const counts = useMemo(() => ({
    all: annonces.length,
    draft: annonces.filter((a) => a.status === "draft").length,
    published: annonces.filter((a) => a.status === "published").length,
    archived: annonces.filter((a) => a.status === "archived").length,
  }), [annonces]);

  const columns = [
    {
      key: "title",
      header: "Annonce",
      render: (row: Annonce) => (
        <div>
          <div className="font-medium text-foreground">{row.title}</div>
          <div className="text-xs text-muted-foreground">{row.brand} {row.model} · {row.condition}</div>
        </div>
      ),
    },
    {
      key: "sellerName",
      header: "Source",
      render: (row: Annonce) => (
        <div>
          <div className={`font-medium text-sm ${row.sellerName === "Admin" ? "text-primary" : ""}`}>
            {row.sellerName || <span className="text-muted-foreground italic">—</span>}
          </div>
          {(row.contactPhone || row.contactWhatsapp) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Phone className="h-3 w-3" />
              {row.contactPhone || row.contactWhatsapp}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Prix",
      render: (row: Annonce) => (
        <span className="font-semibold">{(row.price || 0).toLocaleString()} <span className="text-xs text-muted-foreground">FCFA</span></span>
      ),
    },
    {
      key: "location",
      header: "Localisation",
      render: (row: Annonce) => row.location ? (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {row.location}
        </div>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (row: Annonce) => (
        <Badge variant={STATUS_VARIANT[row.status] || "secondary"}>
          {STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row: Annonce) => (
        <span className="text-xs text-muted-foreground">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("fr-FR") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Annonce) => (
        <div className="flex items-center gap-1">
          {row.status === "draft" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setStatus(row.id, "published")}>
              <Send className="h-3 w-3 mr-1" /> Publier
            </Button>
          )}
          {row.status === "published" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setStatus(row.id, "archived")}>
              <Archive className="h-3 w-3 mr-1" /> Archiver
            </Button>
          )}
          {row.status === "archived" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setStatus(row.id, "published")}>
              <Send className="h-3 w-3 mr-1" /> Republier
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Annonces</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Publie et modère les annonces</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 font-black">
          <Plus className="h-4 w-4" />
          Publier une annonce
        </Button>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filter === key ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Chargement des annonces...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "Aucune annonce" : `Aucune annonce ${STATUS_LABELS[filter]?.toLowerCase() || ""}`}
          description={filter === "all" ? "Publie ta première annonce avec le bouton ci-dessus." : "Aucune annonce dans cette catégorie."}
        />
      ) : (
        <Table columns={columns} data={filtered} empty="Aucune annonce" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer cette annonce ?"
        description="Cette action est irréversible. L'annonce sera définitivement supprimée."
        confirmLabel="Supprimer"
        onConfirm={() => deleteId && remove(deleteId)}
      />

      {showForm && (
        <AdminAnnonceForm onClose={() => setShowForm(false)} onCreated={load} />
      )}
    </div>
  );
}
