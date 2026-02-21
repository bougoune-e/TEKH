import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Cpu, HardDrive, Palette, Hash, Camera, DollarSign, Smartphone, User as UserIcon, Phone as PhoneIcon, MessageCircle, Mail, ShieldCheck } from "lucide-react";
import { useDeals } from "@/features/marketplace/deals.context";
import { useNavigate } from "react-router-dom";
import type { DealPost } from "@/shared/data/dealsData";
import { toast } from "@/shared/hooks/use-toast";
import { uploadImage, insertDeal, getCurrentUser, fetchBrands, fetchModels, fetchStorages, fetchAllStorages, fetchAllRams, fetchRams } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { supabase } from "@/core/api/supabaseApi";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Infinix", "Tecno", "Google", "Huawei", "OnePlus", "Oppo", "Vivo"];
const CONDITIONS = ["Neuf", "Très bon", "Bon", "Moyen"] as const;

export default function PublishPage() {
  const navigate = useNavigate();
  const { addDeal, setMatchRequest } = useDeals();

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [storage, setStorage] = useState<number | "">("");
  const [ram, setRam] = useState<number | "">("");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingStorages, setLoadingStorages] = useState(false);
  const [condition, setCondition] = useState<typeof CONDITIONS[number] | "">("");
  const [color, setColor] = useState<string>("");
  const [imei, setImei] = useState<string>("");
  const [estimated, setEstimated] = useState<number | "">("");
  const [desired, setDesired] = useState<string>("");
  const [maxAddition, setMaxAddition] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [sellerName, setSellerName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactWhatsapp, setContactWhatsapp] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const desiredOptions = useMemo(() => {
    const options = [
      "Apple iPhone 11",
      "Apple iPhone 12",
      "Apple iPhone 13",
      "Samsung Galaxy S21",
      "Samsung Galaxy A54",
      "Xiaomi Redmi Note 12",
      "Google Pixel 6",
      "Huawei P40 Pro",
      "Tecno Spark 10",
      "Infinix Note 12",
    ];
    return options;
  }, []);

  // Dynamic lists (brands/models/storages/rams)
  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list.length ? list : BRANDS);
      } catch {
        setBrands(BRANDS);
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  useEffect(() => {
    // reset dependent fields
    setModel("");
    setModels([]);
    setStorages([]);
    setStorage("");
    setRams([]);
    setRam("");
    if (!brand) return;
    (async () => {
      try {
        setLoadingModels(true);
        const list = await fetchModels(brand);
        setModels(list);
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [brand]);

  useEffect(() => {
    setStorages([]);
    setStorage("");
    setRams([]);
    setRam("");
    if (!brand || !model) return;
    (async () => {
      try {
        setLoadingStorages(true);
        const [byModel, all, byModelRam, allRamsList] = await Promise.all([
          fetchStorages(brand, model),
          fetchAllStorages(),
          fetchRams(brand, model),
          fetchAllRams(),
        ]);
        const uniqStorages = Array.from(new Set([...(byModel || []), ...(all || [])])).sort((a, b) => a - b);
        const uniqRams = Array.from(new Set([...(byModelRam || []), ...(allRamsList || [])])).sort((a, b) => a - b);
        setStorages(uniqStorages);
        setRams(uniqRams);
      } finally {
        setLoadingStorages(false);
      }
    })();
  }, [brand, model]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, 6);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...picked].slice(0, 8));
    setImages((prev) => [...prev, ...urls].slice(0, 8));
  };

  const publish = async () => {
    if (!brand || !model || !storage || !ram || !condition || !estimated) {
      toast({ title: "Champs requis manquants", description: "Veuillez remplir les informations principales (marque, modèle, stockage, RAM, état, estimation).", variant: "destructive" as any });
      return;
    }
    const current = await getCurrentUser();
    if (!current?.id) {
      toast({ title: "Authentification requise", description: "Connectez-vous pour publier un deal." });
      setLoginOpen(true);
      return;
    }
    const estimatedValue = typeof estimated === 'number' ? estimated : 0;
    // If Supabase is configured, attempt to upload selected images and use public URLs
    let finalImages = images;
    if (isSupabaseConfigured && imageFiles.length > 0) {
      try {
        const uploaded = await Promise.all(
          imageFiles.slice(0, 6).map(async (f) => {
            const { publicUrl } = await uploadImage(f);
            return publicUrl;
          })
        );
        finalImages = uploaded.filter(Boolean) as string[];
      } catch (e: any) {
        toast({ title: "Upload partiel", description: e?.message || "Échec de l'upload Supabase. Vos images locales seront utilisées.", variant: "destructive" as any });
      }
    }
    const user = await getCurrentUser();
    const ownerId = user?.id || undefined;
    const deal: DealPost = {
      id: crypto.randomUUID(),
      title: `${brand} ${model} ${storage} Go${condition === 'Neuf' ? ' (Neuf)' : ''}`,
      brand,
      model,
      condition,
      description: description || "Annonce en attente de validation.",
      price: estimatedValue,
      images: finalImages,
      storage: Number(storage),
      ram: Number(ram),
      color,
      verified: false,
      negotiable: true,
      tags: ["En attente"],
      ownerId,
      createdAt: new Date().toISOString(),
      sellerName: sellerName || undefined,
      contactPhone: contactPhone || undefined,
      contactWhatsapp: contactWhatsapp || contactPhone || undefined,
      contactEmail: contactEmail || undefined,
      // @ts-ignore
      status: 'pending_verification', // New field for strict workflow
    };
    try {
      if (isSupabaseConfigured && ownerId) {
        const created = await insertDeal({ ...deal });
        addDeal(created as any);
      } else {
        addDeal(deal);
      }
    } catch (e: any) {
      addDeal(deal);
      toast({ title: "Enregistré localement", description: e?.message || "Échec d'enregistrement en base, annonce sauvegardée localement." });
    }

    // Modification: Don't set match request immediately visible, tell user it's pending
    // setMatchRequest({ brand, estimated: estimatedValue, desired, maxAddition: maxAddition ? Number(maxAddition) : undefined });

    toast({
      title: "Annonce soumise pour certification",
      description: "Votre annonce est en cours d'audit par nos experts (Status: Pending). Elle sera visible après validation.",
      duration: 6000,
    });
    // Navigate to 'My Posts' or Dashboard instead of public feed in a real app, 
    // but for now let's go to /deals where we might filter it out or show it as pending to the user
    navigate("/deals");
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-6">
        {/* Card principale de publication */}
        <Card className="lg:col-span-2 overflow-hidden rounded-2xl shadow-card bg-card border border-border/60">
          <CardHeader className="p-0">
            <div className="bg-muted w-full h-44 sm:h-60 relative flex items-center justify-center rounded-xl">
              {images.length > 0 ? (
                <div className="w-full h-full grid grid-cols-2 gap-1 p-1">
                  {images.map((src, i) => (
                    <img key={i} src={src} alt={`upload-${i}`} className="w-full h-full object-cover rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Smartphone className="w-12 h-12 mx-auto mb-2" />
                  Ajoutez des photos de votre téléphone
                </div>
              )}
              <label className="absolute bottom-3 right-3 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-full text-sm cursor-pointer shadow-md ring-2 ring-emerald-500/30">
                <Camera className="h-4 w-4" />
                Ajouter des images
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border rounded-2xl p-4">
              <div className="space-y-2">
                <Label>Marque</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger><SelectValue placeholder={loadingBrands ? "Chargement..." : "Sélectionner"} /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select value={model || undefined as any} onValueChange={(v) => setModel(v)} disabled={!brand || loadingModels}>
                  <SelectTrigger><SelectValue placeholder={!brand ? "Choisissez une marque" : loadingModels ? "Chargement..." : "Sélectionner"} /></SelectTrigger>
                  <SelectContent>
                    {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Stockage</Label>
                <Select value={storage === '' ? '' : String(storage)} onValueChange={(v) => setStorage(Number(v))} disabled={!model || loadingStorages}>
                  <SelectTrigger><SelectValue placeholder={!model ? "Choisissez un modèle" : loadingStorages ? "Chargement..." : "Choisir"} /></SelectTrigger>
                  <SelectContent>
                    {storages.map((s) => <SelectItem key={s} value={String(s)}>{s} Go</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Cpu className="h-4 w-4" /> RAM</Label>
                <Select value={ram === '' ? '' : String(ram)} onValueChange={(v) => setRam(Number(v))} disabled={!model}>
                  <SelectTrigger><SelectValue placeholder={!model ? "Choisissez un modèle" : "Choisir"} /></SelectTrigger>
                  <SelectContent>
                    {rams.map((r) => <SelectItem key={r} value={String(r)}>{r} Go</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> Couleur</Label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex: Noir, Blanc…" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> IMEI (optionnel)</Label>
                <Input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="IMEI" />
              </div>
              <div className="space-y-2">
                <Label>État</Label>
                <Select value={condition as any} onValueChange={(v) => setCondition(v as any)}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Prix estimé</Label>
                <Input type="number" value={estimated as any} onChange={(e) => setEstimated(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 220000" />
                {typeof estimated === 'number' && (
                  <Badge variant="secondary" className="mt-1">Valeur estimée: {estimated.toLocaleString()} FCFA</Badge>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Téléphone désiré (échange)</Label>
                <Input list="desired-list" value={desired} onChange={(e) => setDesired(e.target.value)} placeholder="Saisissez le modèle souhaité (ex: iPhone 13)" />
                <datalist id="desired-list">
                  {desiredOptions.map((o) => <option key={o} value={o} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Somme que vous pouvez ajouter (optionnel)</Label>
                <Input type="number" value={maxAddition as any} onChange={(e) => setMaxAddition(e.target.value ? Number(e.target.value) : "")} placeholder="Ex: 25000" />
              </div>
            </div>

            <div className="space-y-2 bg-card border border-border rounded-2xl p-4">
              <Label>Description courte</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ajoutez quelques détails utiles (batterie, facture, accessoires…)" />
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex flex-col gap-4">
            <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 bg-primary rounded-full flex items-center justify-center text-white shadow-glow">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">Contrôle de Qualité TEKH</p>
                <p className="text-xs text-muted-foreground leading-tight">Votre annonce sera auditée par notre équipe avant d'être certifiée. Les modèles de confiance se vendent 2x plus vite.</p>
              </div>
            </div>
            <Button onClick={publish} className="w-full text-lg font-black rounded-full h-14 bg-primary hover:scale-[1.02] transition-transform shadow-xl">Certifier et Publier</Button>
          </CardFooter>
        </Card>

        {/* Sidebar récap + coordonnées */}
        <div className="space-y-4">
          <Card className="p-4 rounded-2xl bg-card border border-border shadow-card">
            <div className="text-sm text-muted-foreground mb-2">Récapitulatif</div>
            <div className="space-y-1 text-sm">
              <div><span className="text-muted-foreground">Appareil:</span> {brand} {model}</div>
              <div><span className="text-muted-foreground">Stockage/RAM:</span> {storage || "-"} Go / {ram || "-"} Go</div>
              <div><span className="text-muted-foreground">État:</span> {condition || "-"}</div>
              <div><span className="text-muted-foreground">Couleur:</span> {color || "-"}</div>
              <div><span className="text-muted-foreground">Estimation:</span> {typeof estimated === 'number' ? `${estimated.toLocaleString()} FCFA` : '-'}
              </div>
              <div><span className="text-muted-foreground">Souhait:</span> {desired || "-"}</div>
              <div><span className="text-muted-foreground">Ajout max:</span> {typeof maxAddition === 'number' ? `${maxAddition.toLocaleString()} FCFA` : '-'}</div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-card border border-border">
            <div className="text-sm font-semibold mb-2">Coordonnées vendeur</div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Nom</Label>
                <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Votre nom (optionnel)" />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><PhoneIcon className="h-4 w-4" /> Numéro de téléphone</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Ex: 07000000" />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Label>
                <Input value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="Ex: 22507000000" />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Ex: vous@exemple.com" />
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-card border border-border">
            <div className="text-sm font-semibold mb-2">Conseils</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Des photos nettes augmentent vos chances de matching.</li>
              <li>• Indiquez accessoires et facture si disponibles.</li>
              <li>• Restez ouvert à la négociation pour accélérer l’échange.</li>
            </ul>
          </Card>
        </div>
      </div>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>
              Connectez-vous pour publier votre annonce.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loginError && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-2">
                {loginError}
              </div>
            )}
            {isSupabaseConfigured && (
              <Button
                type="button"
                onClick={async () => {
                  setLoginError("");
                  const redirectTo = window.location.href;
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo } as any,
                  });
                  if (error) setLoginError(error.message);
                }}
                className="w-full justify-center gap-3 bg-[#DB4437] hover:bg-[#C53D32] text-white"
              >
                Continuer avec Google
              </Button>
            )}
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Ou avec e‑mail / mot de passe</Label>
              <div className="mt-2 grid gap-2">
                <Input type="email" placeholder="votre@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                <Input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <div className="flex gap-2">
                  <Button type="button" onClick={async () => {
                    try {
                      setLoginError("");
                      setLoginSubmitting(true);
                      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
                      if (error) throw error;
                      setLoginOpen(false);
                      await publish();
                    } catch (e: any) {
                      setLoginError(e?.message || "Connexion échouée.");
                    } finally {
                      setLoginSubmitting(false);
                    }
                  }} disabled={loginSubmitting} className="flex-1">
                    {loginSubmitting ? 'Connexion...' : 'Se connecter'}
                  </Button>
                  {/* Pas d'inscription ici */}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
