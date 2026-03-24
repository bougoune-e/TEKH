import { useEffect, useState, useMemo } from "react";
import { fetchAllDealsForAdmin, updateDeal, deleteDealById } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Trash2, Send, Archive, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

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

export default function Annonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      header: "Vendeur",
      render: (row: Annonce) => (
        <div>
          <div className="font-medium">{row.sellerName || <span className="text-muted-foreground italic">Admin</span>}</div>
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
          <p className="text-sm text-muted-foreground mt-0.5">Modération des annonces utilisateurs</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {counts.all} annonce{counts.all !== 1 ? "s" : ""}
        </div>
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
          description="Les annonces soumises par les utilisateurs apparaîtront ici."
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
    </div>
  );
}
