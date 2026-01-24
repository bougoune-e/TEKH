import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, Zap } from "lucide-react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";
import { calculerEstimation } from "@/lib/pricing";
import { getProduits } from "@/services/api";

type CSVItem = {
  marque: string;
  nom: string;
  prix_base: string; // CSV numbers are often strings initially
};

const Simulator = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [storage, setStorage] = useState<number | null>(null);

  const [basePrice, setBasePrice] = useState<number | null>(null);

  // États d'évaluation
  const [screenState, setScreenState] = useState<"intact" | "cracked" | "">("");
  const [batteryState, setBatteryState] = useState<"good" | "low" | "replace" | "">("");
  const [aestheticState, setAestheticState] = useState<"very_good" | "visible" | "damaged" | "">("");

  // Chargement initial de TOUTES les données depuis le serveur local
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getProduits();
        setAllProducts(data || []);
      } catch (err) {
        console.error("Erreur chargement simulateur:", err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Dérivations locales des listes
  const brands = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.marque || p.Marques).filter(Boolean));
    return Array.from(set).sort();
  }, [allProducts]);

  const models = useMemo(() => {
    if (!brand) return [];
    const filtered = allProducts.filter((p) => (p.marque || p.Marques) === brand);
    const set = new Set(filtered.map((p) => p.modele_exact || p["Modèle Exact"]).filter(Boolean));
    return Array.from(set).sort();
  }, [brand, allProducts]);

  const storages = useMemo(() => {
    if (!brand || !model) return [];
    const filtered = allProducts.filter(
      (p) =>
        (p.marque || p.Marques) === brand &&
        (p.modele_exact || p["Modèle Exact"]) === model
    );
    const set = new Set(filtered.map((p) => Number(p.stockage_gb || p["Stockages (GB)"])).filter(n => !isNaN(n)));
    return Array.from(set).sort((a, b) => a - b);
  }, [brand, model, allProducts]);

  // Prix de base local
  useEffect(() => {
    if (!brand || !model || !storage) {
      setBasePrice(null);
      return;
    }
    const match = allProducts.find(
      (p) =>
        (p.marque || p.Marques) === brand &&
        (p.modele_exact || p["Modèle Exact"]) === model &&
        Number(p.stockage_gb || p["Stockages (GB)"]) === storage
    );
    if (match) {
      const price = Number(match.prix_neuf_fcfa || match["Prix neuf en FCFA"] || match["Prix neuf en FCFA (prix de référence)"]);
      setBasePrice(!isNaN(price) ? price : null);
    } else {
      setBasePrice(null);
    }
  }, [brand, model, storage, allProducts]);

  const estimate = useMemo(() => {
    if (!basePrice) return null;
    const diagnostics = {
      ecran_casse: !!screenState && screenState !== "intact",
      batterie_faible: batteryState === "low" || batteryState === "replace",
      face_id_hs: false,
      camera_hs: false,
      etat_moyen: aestheticState === "visible" || aestheticState === "damaged",
    } as const;
    return calculerEstimation(basePrice, diagnostics);
  }, [basePrice, screenState, batteryState, aestheticState]);

  const getPriceColor = () => {
    if (!estimate) return "text-gray-500";
    const best = screenState === "intact" && (batteryState === "" || batteryState === "good") && aestheticState === "very_good";
    if (best) return "text-[#00FF41]"; // Electric Green
    if (screenState === "intact") return "text-[#00C2FF]"; // Electric Blue
    return "text-orange-500"; // Warning for degraded
  };

  const selectStyles = "bg-[#111] border-[#333] text-white focus:border-[#E60023] focus:ring-1 focus:ring-[#E60023] h-12 rounded-xl transition-all hover:bg-[#1a1a1a]";

  return (
    <section className="py-12 bg-black min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,43,0.15),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-lg z-10">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Simulateur <span className="text-[#FF002B]">Vivid</span></h1>
          <p className="text-gray-400">Estimez la valeur de votre appareil en temps réel.</p>
        </div>

        <Card className="border-none bg-[#121212] shadow-2xl overflow-hidden rounded-[20px]">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <Zap className="h-5 w-5 text-[#FF002B]" fill="currentColor" />
              Sélecteur Rapide
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF002B] mx-auto"></div>
                <p className="text-gray-400">Chargement des données...</p>
              </div>
            ) : (
              <>
                {/* Brand Select */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Marque</Label>
                  <Select onValueChange={(v) => { setBrand(v); setModel(""); setStorage(null); setBasePrice(null); }} value={(brand || undefined) as any}>
                    <SelectTrigger className={selectStyles}>
                      <SelectValue placeholder="Choisir une marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333] text-white">
                      {brands.map(b => <SelectItem key={b} value={b} className="focus:bg-[#FF002B] focus:text-white">{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Select */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Modèle</Label>
                  <Select onValueChange={setModel} value={(model || undefined) as any} disabled={!brand}>
                    <SelectTrigger className={cn(selectStyles, "disabled:opacity-50 disabled:cursor-not-allowed")}>
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333] text-white">
                      {models.map(m => <SelectItem key={m} value={m} className="focus:bg-[#FF002B] focus:text-white">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage Select */}
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Stockage</Label>
                  <Select onValueChange={(v) => setStorage(Number(v))} value={(storage ? String(storage) : undefined) as any} disabled={!brand || !model}>
                    <SelectTrigger className={cn(selectStyles, "disabled:opacity-50 disabled:cursor-not-allowed")}>
                      <SelectValue placeholder="Choisir un stockage" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333] text-white">
                      {storages.map((s) => (
                        <SelectItem key={s} value={String(s)} className="focus:bg-[#FF002B] focus:text-white">{s} Go</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Select */}
                <div className="space-y-4 pt-2">
                  <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold block mb-2">État de l'appareil</Label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setScreenState("intact")}
                        className={cn(
                          "py-3 rounded-xl border font-medium text-sm transition-all duration-200",
                          screenState === "intact"
                            ? "bg-[#FF002B] border-[#FF002B] text-white shadow-[0_0_15px_rgba(255,0,43,0.4)] transform scale-105"
                            : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-[#252525]"
                        )}
                      >
                        Écran intact
                      </button>
                      <button
                        onClick={() => setScreenState("cracked")}
                        className={cn(
                          "py-3 rounded-xl border font-medium text-sm transition-all duration-200",
                          screenState === "cracked"
                            ? "bg-[#FF002B] border-[#FF002B] text-white shadow-[0_0_15px_rgba(255,0,43,0.4)] transform scale-105"
                            : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-[#252525]"
                        )}
                      >
                        Écran fissuré
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: "good", label: "Batterie OK" },
                        { key: "low", label: "Batterie faible" },
                        { key: "replace", label: "À remplacer" },
                      ] as const).map((o) => (
                        <button
                          key={o.key}
                          onClick={() => setBatteryState(o.key)}
                          className={cn(
                            "py-3 rounded-xl border font-medium text-sm transition-all duration-200",
                            batteryState === o.key
                              ? "bg-[#FF002B] border-[#FF002B] text-white shadow-[0_0_15px_rgba(255,0,43,0.4)] transform scale-105"
                              : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-[#252525]"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: "very_good", label: "Coque TB" },
                        { key: "visible", label: "Rayures" },
                        { key: "damaged", label: "Abîmée" },
                      ] as const).map((o) => (
                        <button
                          key={o.key}
                          onClick={() => setAestheticState(o.key)}
                          className={cn(
                            "py-3 rounded-xl border font-medium text-sm transition-all duration-200",
                            aestheticState === o.key
                              ? "bg-[#FF002B] border-[#FF002B] text-white shadow-[0_0_15px_rgba(255,0,43,0.4)] transform scale-105"
                              : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-[#252525]"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <div className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">Estimation</div>
                  <div className={cn("text-6xl font-black tracking-tighter drop-shadow-lg", getPriceColor())}>
                    {estimate ? (
                      <span className="flex items-center justify-center gap-1">
                        <CountUp end={estimate} duration={0.8} separator=" " />
                        <span className="text-2xl opacity-50 font-medium">FCFA</span>
                      </span>
                    ) : (
                      <span className="text-gray-700 text-4xl">---</span>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full button-vivid h-auto py-4 text-lg mt-4 group"
                  onClick={() => {
                    if (estimate) {
                      localStorage.setItem("tekh_estimate", estimate.toString());
                      window.location.href = "/dealboxes";
                    }
                  }}
                  disabled={!estimate}
                >
                  Voir les offres d'échange (Swap)
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            )}

          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default Simulator;
