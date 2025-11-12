import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useDeals } from "@/context/DealsContext";
import type { DealPost } from "@/data/mockDeals";
import { estimateValue, type SimpleCondition, type StorageSize, type BatteryHealth } from "@/data/phoneValueData";
import { simulateValue, cacheSimulation, getCachedSimulation } from "@/lib/supabaseApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Simulator = () => {
  const [model, setModel] = useState<string>("");
  const [condition, setCondition] = useState<SimpleCondition | "">("");
  const [storage, setStorage] = useState<StorageSize | undefined>(undefined);
  const [battery, setBattery] = useState<BatteryHealth | undefined>(undefined);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>("");
  const { addDeal, setLastSimulation } = useDeals();

  const calculateEstimate = async () => {
    if (!model || !condition) return;
    const mapBattery = (b?: BatteryHealth) => (b === 'low' ? 70 : b === 'medium' ? 85 : b === 'good' ? 100 : 90);
    const mapCpu = (c: SimpleCondition) => (c === 'like_new' ? 300 : c === 'good' ? 250 : c === 'average' ? 180 : 120);
    const specs = {
      battery: mapBattery(battery),
      storage: typeof storage === 'number' ? storage : 128,
      cpu_score: mapCpu(condition as SimpleCondition),
      model,
      condition,
    } as any;

    const cached = getCachedSimulation(specs);
    if (cached) {
      setEstimate(cached);
      setLastSimulation({ model, condition: condition as SimpleCondition, storage, battery, estimated: cached });
      navigate('/deals-found');
      return;
    }

    try {
      const rpcVal = await simulateValue({ battery: specs.battery, storage: specs.storage, cpu_score: specs.cpu_score });
      const val = typeof rpcVal === 'number' ? rpcVal : estimateValue(model, condition as SimpleCondition, storage, battery);
      setEstimate(val);
      cacheSimulation(specs, val);
      setLastSimulation({ model, condition: condition as SimpleCondition, storage, battery, estimated: val });
      navigate('/deals-found');
    } catch (e: any) {
      const fallback = estimateValue(model, condition as SimpleCondition, storage, battery);
      setEstimate(fallback);
      toast({ title: "Erreur de simulation", description: e?.message || "Impossible d'estimer pour le moment.", variant: "destructive" as any });
    }
  };

  const navigate = useNavigate();

  const handleContinue = () => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentification requise", description: "Créez un compte ou connectez-vous pour continuer." });
      setTimeout(() => navigate('/login'), 800);
      return;
    }
    // Si estimation faite, on passe le contexte au Deals
    if (estimate && model && condition) {
      setLastSimulation({ model, condition: condition as SimpleCondition, storage, battery, estimated: estimate });
    }
    navigate('/deals');
  };

  const handlePublishSimulated = () => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentification requise", description: "Connectez-vous pour publier ce deal." });
      setTimeout(() => navigate('/login'), 800);
      return;
    }
    if (!model || !condition || !estimate) {
      toast({ title: "Informations incomplètes", description: "Calculez d'abord une estimation." });
      return;
    }
    const newDeal: DealPost = {
      id: crypto.randomUUID(),
      title: `Échange ${model}`,
      brand: model.includes("iPhone") ? "Apple" : model.includes("Galaxy") || model.includes("A") ? "Samsung" : "Autre",
      model,
      condition: condition === 'good' ? 'Bon' : condition === 'average' ? 'Correct' : condition === 'damaged' ? 'Endommagé' : 'Très bon',
      description: "Deal créé depuis le simulateur",
      price: 0,
      images: [],
    };
    addDeal(newDeal);
    toast({ title: "Deal ajouté", description: "Votre simulation a été publiée dans les deals." });
    navigate('/deals');
  };

  const goToDealsWithContext = (overridePrice?: number) => {
    if (!model || !condition || !estimate) {
      toast({ title: "Informations incomplètes", description: "Sélectionnez un modèle et un état, puis calculez." });
      return;
    }
    setLastSimulation({ model, condition: condition as SimpleCondition, storage, battery, estimated: estimate, customPrice: overridePrice });
    navigate('/deals');
  };

  return (
    <section id="simulator" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card-hover bg-gradient-card border-border/50 relative overflow-hidden">
            {/* Effet de glow */}
            <div className="absolute inset-0 bg-gradient-glow opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="text-center space-y-3 relative z-10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-hero opacity-30 blur-xl rounded-2xl"></div>
                  <div className="relative bg-gradient-hero p-4 rounded-2xl shadow-glow">
                    <Calculator className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                Estimez votre téléphone
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Obtenez une estimation instantanée de la valeur de votre smartphone
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="model" className="text-foreground font-semibold">Modèle</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex: Samsung S10, iPhone 12…" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-foreground font-semibold">État du téléphone</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as SimpleCondition)}>
                  <SelectTrigger id="condition" className="border-border/50 focus:border-primary">
                    <SelectValue placeholder="Sélectionnez l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like_new">Comme neuf</SelectItem>
                    <SelectItem value="good">Bon</SelectItem>
                    <SelectItem value="average">Correct</SelectItem>
                    <SelectItem value="damaged">Endommagé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold">Stockage (optionnel)</Label>
                  <Select value={(storage !== undefined ? String(storage) : undefined) as any} onValueChange={(v) => setStorage(Number(v) as StorageSize)}>
                    <SelectTrigger className="border-border/50 focus:border-primary">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64">64 Go</SelectItem>
                      <SelectItem value="128">128 Go</SelectItem>
                      <SelectItem value="256">256 Go</SelectItem>
                      <SelectItem value="512">512 Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold">Batterie (optionnel)</Label>
                  <Select value={battery as any} onValueChange={(v) => setBattery(v as BatteryHealth)}>
                    <SelectTrigger className="border-border/50 focus:border-primary">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="good">Bonne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full shadow-glow hover:shadow-glow-accent font-semibold"
                onClick={calculateEstimate}
                disabled={!model || !condition}
              >
                Calculer l'estimation
              </Button>

              {estimate && (
                <div className="mt-6 p-6 bg-gradient-hero rounded-xl text-center space-y-3 border border-primary/20 shadow-glow">
                  <div className="text-sm font-medium text-primary-foreground/90 uppercase tracking-wide">
                    Estimation de votre téléphone
                  </div>
                  <div className="text-4xl font-bold text-primary-foreground">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(estimate)}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    Cette estimation est indicative et peut varier selon l'inspection finale
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                    <Dialog open={customOpen} onOpenChange={setCustomOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="bg-card/80 hover:bg-card border-border/50 hover:border-primary/50">
                          Pas satisfait ? Proposer mon prix
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Proposer votre propre prix</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Label>Montant souhaité (FCFA)</Label>
                          <Input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder={estimate.toString()} />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCustomOpen(false)}>Annuler</Button>
                            <Button onClick={() => { setCustomOpen(false); goToDealsWithContext(customPrice ? Number(customPrice) : estimate); }}>Confirmer</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => goToDealsWithContext()} size="lg" className="shadow-glow">
                      Voir les deals compatibles
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Simulator;
