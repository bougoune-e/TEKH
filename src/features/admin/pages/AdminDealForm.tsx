import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchDealById, fetchBrands, fetchModels, getAvailableVariants, insertDeal, updateDeal, uploadImage, getCurrentUser } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import type { DealPost, DealStatus } from "@/shared/data/dealsData";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { ArrowLeft, Camera } from "lucide-react";
import { toast } from "sonner";

const CONDITIONS = ["Neuf", "Très bon", "Bon", "Moyen"] as const;

export default function AdminDealForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<number | "">("");
  const [ram, setRam] = useState<number | "">("");
  const [condition, setCondition] = useState<typeof CONDITIONS[number] | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<DealStatus>("draft");
  const [sellerName, setSellerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetchDealById(id)
        .then((d) => {
          if (!d) return;
          setBrand(d.brand || "");
          setModel(d.model || "");
          setStorage((d.storage as number) ?? "");
          setRam((d.ram as number) ?? "");
          setCondition((d.condition as any) || "");
          setPrice(d.price ?? "");
          setDescription(d.description || "");
          setImages(d.images || []);
          setStatus((d.status as DealStatus) || "draft");
          setSellerName(d.sellerName || "");
          setContactPhone(d.contactPhone || "");
        })
        .catch(() => toast.error("Deal introuvable"))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [id, isEdit]);

  useEffect(() => {
    if (!brand) return;
    fetchModels(brand).then(setModels).catch(() => setModels([]));
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) return;
    getAvailableVariants(brand, model)
      .then((v: any[]) => {
        const s = Array.from(new Set((v || []).map((x: any) => x.storage_gb).filter(Boolean))).sort((a, b) => a - b);
        const r = Array.from(new Set((v || []).map((x: any) => x.ram_gb).filter(Boolean))).sort((a, b) => a - b);
        setStorages(s);
        setRams(r);
      })
      .catch(() => { setStorages([]); setRams([]); });
  }, [brand, model]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const picked = Array.from(files).slice(0, 6);
    setImageFiles((prev) => [...prev, ...picked].slice(0, 8));
    setImages((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))].slice(0, 8));
  };

  const submit = async () => {
    if (!brand || !model || !condition || price === "" || price === 0) {
      toast.error("Remplissez marque, modèle, état et prix.");
      return;
    }
    setSaving(true);
    try {
      const user = await getCurrentUser();
      const ownerId = user?.id || undefined;
      const existingUrls = images.filter((s) => typeof s === "string" && s.startsWith("http"));
      let finalImages = existingUrls;
      if (isSupabaseConfigured && imageFiles.length > 0) {
        const uploaded = await Promise.all(
          imageFiles.slice(0, 6).map(async (f) => (await uploadImage(f)).publicUrl)
        );
        finalImages = [...existingUrls, ...uploaded.filter(Boolean)].slice(0, 8);
      }
      const title = `${brand} ${model}${storage ? ` ${storage} Go` : ""}${condition === "Neuf" ? " (Neuf)" : ""}`;
      const payload: any = {
        title,
        brand,
        model,
        condition,
        description: description || title,
        price: Number(price),
        images: finalImages,
        storage: storage || undefined,
        ram: ram || undefined,
        ownerId,
        sellerName: sellerName || undefined,
        contactPhone: contactPhone || undefined,
        status,
      };
      if (isEdit && id) {
        await updateDeal(id, payload);
        toast.success("Deal mis à jour.");
      } else {
        payload.id = crypto.randomUUID();
        payload.createdAt = new Date().toISOString();
        await insertDeal(payload);
        toast.success("Deal créé (brouillon).");
      }
      navigate("/admin/deals");
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/deals"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? "Modifier le deal" : "Nouveau deal"}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">Informations appareil</CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marque</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="Marque" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modèle</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue placeholder="Modèle" /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stockage (Go)</Label>
              <Select value={String(storage)} onValueChange={(v) => setStorage(v ? Number(v) : "")}>
                <SelectTrigger><SelectValue placeholder="Stockage" /></SelectTrigger>
                <SelectContent>
                  {storages.map((s) => (<SelectItem key={s} value={String(s)}>{s} Go</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>RAM (Go)</Label>
              <Select value={String(ram)} onValueChange={(v) => setRam(v ? Number(v) : "")}>
                <SelectTrigger><SelectValue placeholder="RAM" /></SelectTrigger>
                <SelectContent>
                  {rams.map((r) => (<SelectItem key={r} value={String(r)}>{r} Go</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>État</Label>
              <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
                <SelectTrigger><SelectValue placeholder="État" /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prix (FCFA)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} placeholder="Prix" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              ))}
              <label className="w-20 h-20 border border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFiles} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v: DealStatus) => setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact vendeur (optionnel)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Nom" />
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Téléphone" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={submit} disabled={saving} className="bg-[#064e3b] hover:bg-[#065f46]">
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le deal"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/deals">Annuler</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
