import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackHomeButton from "@/components/BackHomeButton";
import BackBar from "@/components/BackBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { toast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import TradeOfferCard from "@/components/TradeOfferCard";
import { DeviceCondition, TradeOffer } from "@/types";
import { useDeals } from "@/context/DealsContext";
import type { DealPost } from "@/data/mockDeals";
import { useNavigate } from "react-router-dom";
import { getMatchingDeals, createDeal } from "@/lib/supabaseApi";

const DealsPage = () => {
  const { deals, addDeal, lastSimulation, setDesiredDealId } = useDeals();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    condition: "",
    description: "",
    price: "",
    images: [] as string[],
  });
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);

  const disabledPublish = useMemo(() => {
    return !form.title || !form.brand || !form.model || !form.condition || !form.description || form.images.length === 0;
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const handlePublish = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Authentification requise",
        description: "Connectez-vous pour publier une annonce.",
      });
      setOpen(false);
      setTimeout(() => (window.location.href = "/login"), 800);
      return;
    }
    const proposedPrice = form.price ? Number(form.price) : 0;
    const specs = {
      brand: form.brand,
      model: form.model,
      condition: form.condition,
      description: form.description,
      images: form.images,
      // Pass hints from lastSimulation if present
      storage: lastSimulation?.storage ?? null,
      battery: lastSimulation?.battery ?? null,
    } as any;
    try {
      await createDeal(token, specs, proposedPrice);
      const newDeal: DealPost = {
        id: crypto.randomUUID(),
        title: form.title,
        brand: form.brand,
        model: form.model,
        condition: form.condition,
        description: form.description,
        price: proposedPrice,
        images: form.images,
      };
      addDeal(newDeal);
      setForm({ title: "", brand: "", model: "", condition: "", description: "", price: "", images: [] });
      setOpen(false);
      toast({ title: "Annonce publiée", description: "Votre deal est en ligne." });
    } catch (e: any) {
      toast({ title: "Erreur Supabase", description: e?.message || "Impossible de créer le deal.", variant: "destructive" as any });
    }
  };

  const handleContact = (deal: DealPost) => {
    const token = getToken();
    if (!token) {
      toast({ title: "Connectez-vous", description: "Vous devez être connecté pour contacter le vendeur." });
      setTimeout(() => (window.location.href = "/login"), 800);
      return;
    }
    toast({ title: "Contact ouvert", description: `Vous contactez le vendeur de: ${deal.title}` });
  };

  // Helpers pour convertir nos deals vers des TradeOffer (mock)
  const dealToTradeOffer = (d: DealPost): TradeOffer => {
    const now = new Date().toISOString();
    // Valeurs estimées fictives pour source/cible
    const baseValue = 150000;
    const topUp = typeof d.price === "number" ? d.price : 0;
    return {
      id: d.id,
      createdAt: now,
      offererUsername: "membre-" + d.id.slice(0, 4),
      isVerified: Math.random() > 0.5,
      offererDevice: {
        brand: d.brand,
        model: d.model,
        year: 2021,
        storage: "128 Go",
        color: "Noir",
        estimatedValue: baseValue,
        condition: (d.condition?.toLowerCase() === "très bon" || d.condition?.toLowerCase() === "bon")
          ? DeviceCondition.Good
          : d.condition?.toLowerCase() === "correct"
          ? DeviceCondition.Fair
          : d.condition?.toLowerCase() === "neuf"
          ? DeviceCondition.Refurbished
          : DeviceCondition.Poor,
      },
      targetDevice: {
        brand: d.brand === "Apple" ? "Samsung" : "Apple",
        model: d.brand === "Apple" ? "S21" : "iPhone 12",
        year: 2022,
        storage: "128 Go",
        color: "Bleu",
        estimatedValue: baseValue + topUp,
        condition: DeviceCondition.Refurbished,
      },
      priceTopUp: topUp,
      status: "available",
    };
  };

  const onAccept = (offerId: string) => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentification requise", description: "Connectez-vous pour accepter une offre." });
      setTimeout(() => (window.location.href = "/login"), 800);
      return;
    }
    setAcceptingId(offerId);
    setTimeout(() => {
      setAcceptingId(null);
      toast({ title: "Offre acceptée", description: "Le vendeur a été notifié." });
    }, 800);
  };

  const onContact = (offerId: string) => {
    const found = deals.find((d) => d.id === offerId);
    if (found) handleContact(found);
  };

  const onPropose = (offerId: string) => {
    setDesiredDealId(offerId);
    navigate('/simulateur');
  };

  const allOffers = useMemo(() => deals.map((d) => dealToTradeOffer(d)), [deals]);
  const filteredOffers = useMemo(() => {
    if (!lastSimulation) return allOffers;
    const targetPrice = lastSimulation.customPrice ?? lastSimulation.estimated;
    return allOffers.filter((o) => {
      const modelMatch = o.offererDevice.model.toLowerCase().includes(lastSimulation.model.toLowerCase());
      const priceMatch = Math.abs(o.priceTopUp - targetPrice) <= targetPrice * 0.3; // ±30%
      return modelMatch || priceMatch;
    });
  }, [allOffers, lastSimulation]);

  // Call Supabase matching RPC when we have a simulation context
  useEffect(() => {
    const token = getToken();
    if (!lastSimulation || !token) return;
    const run = async () => {
      try {
        setLoadingMatches(true);
        const price = lastSimulation.customPrice ?? lastSimulation.estimated;
        const specs = {
          model: lastSimulation.model,
          condition: lastSimulation.condition,
          storage: lastSimulation.storage ?? null,
          battery: lastSimulation.battery ?? null,
        } as any;
        const res = await getMatchingDeals(token, price, specs);
        setMatchedCount(Array.isArray(res) ? res.length : 0);
        if (Array.isArray(res)) {
          console.log("[Deals] RPC matched deals:", res);
          if (res.length === 0) {
            toast({ title: "Aucun deal correspondant", description: "Essayez d'ajuster votre prix ou publiez votre offre." });
          }
        }
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les deals.", variant: "destructive" as any });
      } finally {
        setLoadingMatches(false);
      }
    };
    run();
  }, [lastSimulation]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <BackBar />
      <Breadcrumbs />
      <section className="pt-24 md:pt-28 pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Voir les deals</h1>
              <p className="text-muted-foreground">Explorez les annonces d'échange et proposez la vôtre</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">Publier / Poster</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Publier une annonce</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: iPhone 12 contre S21 + compensation" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Marque</Label>
                      <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Apple, Samsung..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Modèle</Label>
                      <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="iPhone 12, S21..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>État</Label>
                      <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Neuf">Neuf</SelectItem>
                          <SelectItem value="Très bon">Très bon</SelectItem>
                          <SelectItem value="Bon">Bon</SelectItem>
                          <SelectItem value="Correct">Correct</SelectItem>
                          <SelectItem value="Endommagé">Endommagé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Compensation (FCFA)</Label>
                      <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0 si échange équitable" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails, accessoires, opérateur, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label>Photos</Label>
                    <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {form.images.map((src, i) => (
                          <img key={i} src={src} alt="preview" className="h-20 w-full object-cover rounded-md border border-border/50" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handlePublish} disabled={disabledPublish}>Publier</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingMatches ? (
            <div className="text-center text-muted-foreground py-20">Chargement des offres…</div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center text-muted-foreground py-20 border border-dashed border-border/50 rounded-xl bg-card/40">
              {lastSimulation ? (
                <div className="space-y-3">
                  <div>Aucune correspondance directe — vous pouvez publier votre offre pour trouver un partenaire SWAP.</div>
                  <Button variant="hero" onClick={() => setOpen(true)}>Créer mon offre</Button>
                </div>
              ) : (
                <div>Aucune annonce pour le moment.</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredOffers.map((offer) => {
                return (
                  <TradeOfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={onAccept}
                    isAccepting={acceptingId === offer.id}
                    onContact={onContact}
                    onPropose={onPropose}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
      <BackHomeButton />
      <Footer />
    </div>
  );
};

export default DealsPage;
