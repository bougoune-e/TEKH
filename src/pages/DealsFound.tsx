import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackHomeButton from "@/components/BackHomeButton";
import BackBar from "@/components/BackBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useDeals } from "@/context/DealsContext";
import { useMemo, useState } from "react";
import { TradeOffer } from "@/types";
import { DeviceCondition } from "@/types";
import TradeOfferCard from "@/components/TradeOfferCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getToken } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import type { DealPost } from "@/data/mockDeals";
import { useNavigate } from "react-router-dom";

const DealsFound = () => {
  const { deals, lastSimulation, setDesiredDealId } = useDeals();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: lastSimulation?.model || "",
    condition: "",
    description: "",
    price: "",
    images: [] as string[],
  });

  const dealToTradeOffer = (d: DealPost): TradeOffer => {
    const now = new Date().toISOString();
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

  const allOffers = useMemo(() => deals.map(dealToTradeOffer), [deals]);

  const matches = useMemo(() => {
    if (!lastSimulation) return [] as TradeOffer[];
    const price = lastSimulation.customPrice ?? lastSimulation.estimated;
    const min = price - 10000;
    const max = price + 10000;
    return allOffers.filter((o) => {
      const modelMatch = o.offererDevice.model.toLowerCase().includes(lastSimulation.model.toLowerCase());
      const priceMatch = o.priceTopUp >= min && o.priceTopUp <= max;
      return modelMatch || priceMatch;
    });
  }, [allOffers, lastSimulation]);

  const onPropose = (offerId: string) => {
    setDesiredDealId(offerId);
    navigate('/simulateur');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const handlePublish = () => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentification requise", description: "Connectez-vous pour publier une annonce." });
      setOpen(false);
      setTimeout(() => (window.location.href = "/login"), 800);
      return;
    }
    // Simply navigate to /deals and open publish there for now
    navigate('/deals');
    setTimeout(() => {
      toast({ title: "Publiez votre offre", description: "Ouvrez le formulaire de publication sur la page deals." });
    }, 200);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <BackBar />
      <Breadcrumbs />
      <section className="pt-24 md:pt-28 pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Deals correspondants</h1>
            {lastSimulation && (
              <p className="text-muted-foreground">Pour {lastSimulation.model} · ~{(lastSimulation.customPrice ?? lastSimulation.estimated).toLocaleString()} CFA</p>
            )}
          </div>

          {!lastSimulation ? (
            <div className="text-center text-muted-foreground py-20 border border-dashed border-border/50 rounded-xl bg-card/40">
              Renseignez d'abord votre téléphone dans le simulateur.
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center text-muted-foreground py-20 border border-dashed border-border/50 rounded-xl bg-card/40 space-y-4">
              <div>Aucune correspondance directe — vous pouvez publier votre offre pour trouver un partenaire SWAP.</div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">Créer mon offre</Button>
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
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                      <Button onClick={handlePublish}>Publier</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {matches.map((offer) => (
                <TradeOfferCard key={offer.id} offer={offer} onPropose={(id) => onPropose(id)} />
              ))}
            </div>
          )}
        </div>
      </section>
      <BackHomeButton />
      <Footer />
    </div>
  );
};

export default DealsFound;
