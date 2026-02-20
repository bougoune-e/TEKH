import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, Zap, Target, Search, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Smartphone, Info, CheckCircle2 } from "lucide-react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";
import { calculerEstimation } from "@/lib/pricing";
import { getProduits } from "@/services/api";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";
import { useTranslation } from "react-i18next";

type CSVItem = {
  marque: string;
  nom: string;
  prix_base: string; // CSV numbers are often strings initially
};

const Simulator = () => {
  const { t } = useTranslation();
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

  // Nouveaux états pour le flux d'échange
  const [step, setStep] = useState<"estimation" | "satisfaction" | "target_selection" | "comparison">("estimation");
  const [isSatisfied, setIsSatisfied] = useState<boolean | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [exchangeType, setExchangeType] = useState<"upgrade" | "downgrade" | "">("");
  const [targetBrand, setTargetBrand] = useState<string>("");
  const [targetModel, setTargetModel] = useState<any>(null);
  const [currentModelData, setCurrentModelData] = useState<any>(null);

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
    const set = new Set(allProducts.map((p) => p.marque || p.marques || p.Marques).filter(Boolean));
    return Array.from(set).sort();
  }, [allProducts]);

  const models = useMemo(() => {
    if (!brand) return [];
    const filtered = allProducts.filter((p) => (p.marque || p.marques || p.Marques) === brand);
    const set = new Set(filtered.map((p) => p.modele_exact || p["Modèle Exact"]).filter(Boolean));
    return Array.from(set).sort();
  }, [brand, allProducts]);

  const storages = useMemo(() => {
    if (!brand || !model) return [];
    const filtered = allProducts.filter(
      (p) =>
        (p.marque || p.marques || p.Marques) === brand &&
        (p.modele_exact || p["Modèle Exact"]) === model
    );
    const set = new Set(filtered.map((p) => Number(p.stockage_gb || p.stockages_gb || p["Stockages (GB)"])).filter(n => !isNaN(n)));
    return Array.from(set).sort((a, b) => a - b);
  }, [brand, model, allProducts]);

  const targetModels = useMemo(() => {
    if (!targetBrand) return [];
    const filtered = allProducts.filter((p) => (p.marque || p.marques || p.Marques) === targetBrand);
    const set = new Set(filtered.map((p) => p.modele_exact || p["Modèle Exact"]).filter(Boolean));
    return Array.from(set).sort();
  }, [targetBrand, allProducts]);

  // Prix de base local
  useEffect(() => {
    if (!brand || !model || !storage) {
      setBasePrice(null);
      return;
    }
    const match = allProducts.find(
      (p) =>
        (p.marque || p.marques || p.Marques) === brand &&
        (p.modele_exact || p["Modèle Exact"]) === model &&
        Number(p.stockage_gb || p.stockages_gb || p["Stockages (GB)"]) === storage
    );

    if (match) {
      const price = Number(match.prix_neuf_fcfa || match["Prix neuf en FCFA"] || match["Prix neuf en FCFA (prix de référence)"]);
      setBasePrice(!isNaN(price) ? price : null);
      setCurrentModelData(match);
    } else {
      setBasePrice(null);
      setCurrentModelData(null);
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
    const releaseYear = currentModelData?.annee_sortie || currentModelData?.release_year || null;
    return calculerEstimation(basePrice, brand, releaseYear, diagnostics);
  }, [basePrice, brand, currentModelData, screenState, batteryState, aestheticState]);

  const getPriceColor = () => {
    if (!estimate) return "text-gray-500";
    const best = screenState === "intact" && (batteryState === "" || batteryState === "good") && aestheticState === "very_good";
    if (best) return "text-[#064e3b] dark:text-primary"; // Deep Green in Light Mode
    if (screenState === "intact") return "text-green-500 dark:text-green-300"; // Updated to green
    return "text-orange-600 dark:text-orange-500"; // Warning for degraded
  };

  const selectStyles = "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white h-12 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800";

  return (
    <section className="py-6 sm:py-12 bg-background min-h-screen text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,65,0.15),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-lg z-10">
        <div className="mb-8 text-center space-y-4 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-zinc-900 animate-levitate">
            <video src={mascotVideo} autoPlay loop muted playsInline className="w-full h-full object-cover scale-150" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#064e3b] dark:text-primary mb-1 font-sans">
              {t('simulator.estimate')}
            </h2>
            <h1 className="text-4xl font-black tracking-tight font-sans text-black dark:text-white">TEKH <span className="text-[#064e3b] dark:text-primary">{t('simulator.title')}</span></h1>
            <p className="text-[#374151] dark:text-gray-400 text-sm font-medium font-sans">{t('simulator.subtitle')}</p>
          </div>
        </div>

        <Card className="border-none bg-white dark:bg-[#121212] shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="border-b border-zinc-100 dark:border-white/5 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-black dark:text-white">
              <Zap className="h-5 w-5 text-[#064e3b] dark:text-primary" fill="currentColor" />
              {t('simulator.diagnose')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-400 font-sans">{t('auth.loading')}</p>
              </div>
            ) : step === "estimation" ? (
              <>
                {/* Brand Select */}
                <div className="space-y-2">
                  <Label className="text-[#374151] dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">{t('simulator.brand')}</Label>
                  <Select onValueChange={(v) => { setBrand(v); setModel(""); setStorage(null); setBasePrice(null); }} value={brand || ""}>
                    <SelectTrigger className={cn(selectStyles, "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white")}>
                      <SelectValue placeholder={t('simulator.brand')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111] border-zinc-200 dark:border-[#333] text-black dark:text-white">
                      {brands.map(b => <SelectItem key={b} value={b} className="focus:bg-[#064e3b] focus:text-white">{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Select */}
                <div className="space-y-2">
                  <Label className="text-[#374151] dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">{t('simulator.model', 'Modèle')}</Label>
                  <Select onValueChange={setModel} value={model || ""} disabled={!brand}>
                    <SelectTrigger className={cn(selectStyles, "disabled:opacity-50 disabled:cursor-not-allowed")}>
                      <SelectValue placeholder={t('simulator.select_model', 'Choisir un modèle')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111] border-zinc-200 dark:border-[#333] text-black dark:text-white">
                      {models.map(m => <SelectItem key={m} value={m} className="focus:bg-[#064e3b] focus:text-white">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage Select */}
                <div className="space-y-2">
                  <Label className="text-[#374151] dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">{t('simulator.storage', 'Stockage')}</Label>
                  <Select onValueChange={(v) => setStorage(Number(v))} value={storage ? String(storage) : ""} disabled={!brand || !model}>
                    <SelectTrigger className={cn(selectStyles, "disabled:opacity-50 disabled:cursor-not-allowed")}>
                      <SelectValue placeholder={t('simulator.select_storage', 'Choisir un stockage')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111] border-zinc-200 dark:border-[#333] text-black dark:text-white">
                      {storages.map((s) => (
                        <SelectItem key={s} value={String(s)} className="focus:bg-[#064e3b] focus:text-white">{s} Go</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Select */}
                <div className="space-y-4 pt-2">
                  <Label className="text-[#374151] dark:text-gray-400 text-xs uppercase tracking-wider font-semibold block mb-2">{t('simulator.condition')}</Label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setScreenState("intact")}
                        className={cn(
                          "py-2 px-4 rounded-full border text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap font-sans",
                          screenState === "intact"
                            ? "bg-[#064e3b] dark:bg-primary border-transparent text-white dark:text-black shadow-sm"
                            : "bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-white/5 text-slate-900 dark:text-white"
                        )}
                      >
                        {t('simulator.screen')} OK
                      </button>
                      <button
                        onClick={() => setScreenState("cracked")}
                        className={cn(
                          "py-2 px-4 rounded-full border text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap font-sans",
                          screenState === "cracked"
                            ? "bg-[#064e3b] dark:bg-primary border-transparent text-white dark:text-black shadow-sm"
                            : "bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-white/5 text-slate-900 dark:text-white"
                        )}
                      >
                        {t('simulator.screen')} fissuré
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: "good", label: "OK" },
                        { key: "low", label: "Faible" },
                        { key: "replace", label: "À remplacer" },
                      ] as const).map((o) => (
                        <button
                          key={o.key}
                          onClick={() => setBatteryState(o.key)}
                          className={cn(
                            "py-2 px-4 rounded-full border text-[10px] font-bold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap font-sans",
                            batteryState === o.key
                              ? "bg-[#064e3b] dark:bg-primary border-transparent text-white dark:text-black shadow-sm"
                              : "bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-white/5 text-slate-900 dark:text-white"
                          )}
                        >
                          {t('simulator.battery')} {o.label}
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
                            "py-2 px-4 rounded-full border text-[10px] font-bold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap font-sans",
                            aestheticState === o.key
                              ? "bg-[#064e3b] dark:bg-primary border-transparent text-white dark:text-black shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                              : "bg-black hover:bg-zinc-900 border-transparent text-white hover:text-white"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-white/10 text-center">
                  <div className="text-[#374151] dark:text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">{t('simulator.estimate')}</div>
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

                {/* Action Button - Initial Estimation */}
                <button
                  className="flex items-center justify-center gap-3 bg-black dark:bg-primary hover:opacity-90 transition-all duration-300 p-3 px-8 rounded-full border-0 hover:scale-105 active:scale-95 group w-full disabled:opacity-50 disabled:grayscale shadow-sm"
                  onClick={() => setStep("satisfaction")}
                  disabled={!estimate}
                >
                  <div className="w-8 h-8 bg-white dark:bg-black rounded-full flex items-center justify-center shadow">
                    <Zap className="text-black dark:text-white h-4 w-4 font-bold" />
                  </div>
                  <span className="text-base font-bold tracking-tight text-white dark:text-black uppercase font-sans">{t('simulator.calculate')}</span>
                  <ArrowRight className="ml-auto h-5 w-5 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : step === "satisfaction" ? (
              <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Votre estimation finale</p>
                  <div className={cn("text-6xl font-black tracking-tighter", getPriceColor())}>
                    <CountUp end={estimate || 0} duration={1} separator=" " />
                    <span className="text-2xl opacity-50 ml-2">FCFA</span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 sm:p-6 border border-zinc-100 dark:border-white/10 space-y-6 shadow-sm">
                  <h3 className="text-center font-black text-lg sm:text-xl italic uppercase tracking-tighter text-black dark:text-white">{t('simulator.perfect')} ?</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setIsSatisfied(true); setStep("target_selection"); }}
                      className="flex items-center gap-4 bg-black hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-xl"
                    >
                      <div className="w-10 h-10 bg-[#00FF41] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-black text-xl font-bold font-sans">✓</span>
                      </div>
                      <span className="text-sm font-bold tracking-tight text-white uppercase font-sans">OUI, TOP !</span>
                    </button>

                    <button
                      onClick={() => setIsSatisfied(false)}
                      className={cn(
                        "flex items-center gap-4 bg-black hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-xl",
                        isSatisfied === false ? "border-rose-500 ring-1 ring-rose-500" : ""
                      )}
                    >
                      <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl font-bold font-sans">×</span>
                      </div>
                      <span className="text-sm font-bold tracking-tight text-white uppercase font-sans">PAS VRAIMENT</span>
                    </button>
                  </div>

                  {isSatisfied === false && (
                    <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Quel prix proposez-vous ? (FCFA)</Label>
                      <input
                        type="number"
                        placeholder="Ex: 250 000"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        className="w-full bg-black border-2 border-white/10 rounded-xl h-14 px-4 font-black text-xl text-primary focus:border-primary transition-all outline-none"
                      />
                      <Button
                        className="w-full h-12 rounded-full font-black text-xs uppercase"
                        onClick={() => setStep("target_selection")}
                        disabled={!proposedPrice}
                      >
                        Soumettre ma vision & Continuer
                      </Button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setStep("estimation")}
                  className="w-full text-center text-gray-500 text-xs font-bold hover:text-white transition-colors"
                >
                  ← REVENIR AU DIAGNOSTIC
                </button>
              </div>
            ) : step === "target_selection" ? (
              <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">Quel est votre <span className="text-primary italic">objectif</span> ?</h2>
                  <p className="text-gray-400 text-sm">Choisissez le téléphone que vous souhaitez acquérir.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExchangeType("upgrade")}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                      exchangeType === "upgrade" ? "bg-primary/20 border-primary" : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <ArrowUpCircle className={cn("h-10 w-10 mb-2 transition-transform", exchangeType === "upgrade" ? "text-primary scale-110" : "text-gray-500 group-hover:text-primary")} strokeWidth={1.5} />
                    <span className="font-bold text-sm">UPGRADE</span>
                    <span className="text-[10px] text-gray-500">Monter en gamme</span>
                  </button>

                  <button
                    onClick={() => setExchangeType("downgrade")}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                      exchangeType === "downgrade" ? "bg-orange-500/20 border-orange-500" : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <ArrowDownCircle className={cn("h-10 w-10 mb-2 transition-transform", exchangeType === "downgrade" ? "text-orange-500 scale-110" : "text-gray-500 group-hover:text-orange-500")} strokeWidth={1.5} />
                    <span className="font-bold text-sm">DOWNGRADE</span>
                    <span className="text-[10px] text-gray-500">Récupérer du cash</span>
                  </button>
                </div>

                {exchangeType && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Dynamic Brand Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Search className="h-3 w-3" />
                        Rechercher la marque
                      </Label>
                      <Select
                        onValueChange={(v) => { setTargetBrand(v); setTargetModel(null); }}
                        value={targetBrand || ""}
                      >
                        <SelectTrigger className={selectStyles}>
                          <SelectValue placeholder={t('deals.target_brand', 'Choisir une marque')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111] border-zinc-200 dark:border-[#333] text-black dark:text-white max-h-[300px]">
                          {brands.map(b => (
                            <SelectItem key={b} value={b} className="focus:bg-primary focus:text-white uppercase font-bold text-xs">{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic Model Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        Modèle souhaité
                      </Label>
                      <Select
                        onValueChange={(v) => {
                          const match = allProducts.find(p => (p.modele_exact || p["Modèle Exact"]) === v && (p.marque || p.Marques) === targetBrand);
                          setTargetModel(match);
                        }}
                        value={targetModel?.modele_exact || targetModel?.["Modèle Exact"] || ""}
                        disabled={!targetBrand}
                      >
                        <SelectTrigger className={cn(selectStyles, "disabled:opacity-50")}>
                          <SelectValue placeholder={t('deals.target_model', 'Modèle souhaité')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111] border-zinc-200 dark:border-[#333] text-black dark:text-white max-h-[300px]">
                          {targetModels.map(m => (
                            <SelectItem key={m} value={m} className="focus:bg-primary focus:text-white font-bold text-xs">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {targetModel && (
                      <Button
                        className="w-full bg-primary text-primary-foreground rounded-full h-14 text-lg mt-8 group font-black shadow-lg hover:scale-[1.02] transition-transform"
                        onClick={() => setStep("comparison")}
                      >
                        Comparer le Deal
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep("satisfaction")}
                  className="w-full text-center text-gray-500 text-xs font-bold hover:text-white transition-colors pt-4"
                >
                  ← RETOUR
                </button>
              </div>
            ) : step === "comparison" ? (
              <div className="space-y-10 py-4 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">Récapitulatif du <span className="text-primary">Deal</span></h2>
                  <p className="text-gray-400 text-sm italic font-medium">L'accord parfait pour votre prochain appareil.</p>
                </div>

                {/* VISUAL EXCHANGE BOX */}
                <div className="relative flex items-center justify-between gap-2 px-2">
                  {/* Current Phone Card */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-4 text-center space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-500/50" />
                    <div className="bg-gray-500/10 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-gray-400">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Actuel</p>
                      <h4 className="font-black text-sm leading-tight uppercase truncate">{brand} {model}</h4>
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-1 text-[9px] text-gray-400 font-bold uppercase text-left">
                      <div className="bg-white/5 p-1 rounded">RAM: {currentModelData?.ram_gb || "--"}Go</div>
                      <div className="bg-white/5 p-1 rounded">Stock: {storage}Go</div>
                    </div>
                  </div>

                  {/* Exchange Arrows */}
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)] animate-pulse">
                      <ArrowLeftRight className="h-5 w-5" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Target Phone Card */}
                  <div className="flex-1 bg-primary/5 border-2 border-primary/20 rounded-3xl p-4 text-center space-y-3 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mb-1">Cible</p>
                      <h4 className="font-black text-sm leading-tight uppercase truncate">{targetBrand} {targetModel?.modele_exact || targetModel?.["Modèle Exact"]}</h4>
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-1 text-[9px] text-primary/60 font-bold uppercase text-left">
                      <div className="bg-primary/5 p-1 rounded">RAM: {targetModel?.ram_gb || "--"}Go</div>
                      <div className="bg-primary/5 p-1 rounded">Stock: {targetModel?.storage_gb || "--"}Go</div>
                    </div>
                  </div>
                </div>

                {/* Specs Deep Dive (Optional but beautiful) */}
                <div className="bg-[#1a1a1a] rounded-[24px] p-6 space-y-4 border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-tighter mb-4">
                    <Info className="h-4 w-4" />
                    Détails financiers du deal
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white/2 pb-1 border-b border-white/5">
                      <span className="text-gray-400 text-xs font-bold uppercase">Reprise de votre {brand}</span>
                      <span className="font-black text-sm">{estimate?.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/2 pb-1 border-b border-white/5">
                      <span className="text-gray-400 text-xs font-bold uppercase">Prix cible ({targetBrand})</span>
                      <span className="font-black text-sm">{(targetModel?.prix_neuf_fcfa || targetModel?.["Prix neuf en FCFA"])?.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white text-sm font-black uppercase italic tracking-tighter">Votre reste à payer</span>
                      <span className="text-2xl font-black text-primary italic">
                        {Math.max(0, (targetModel?.prix_neuf_fcfa || targetModel?.["Prix neuf en FCFA"] || 0) - (estimate || 0)).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    className="flex items-center justify-center gap-4 bg-black dark:bg-[#00FF41] hover:bg-zinc-900 dark:hover:bg-[#00e63a] transition-all duration-300 p-4 px-10 rounded-full border border-transparent hover:scale-105 active:scale-95 group w-full shadow-2xl"
                    onClick={() => {
                      alert("Deal validé ! Nous vous contactons par WhatsApp pour finaliser l'échange.");
                      window.location.href = "/";
                    }}
                  >
                    <div className="w-10 h-10 bg-primary dark:bg-black rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="text-black dark:text-primary h-6 w-6 font-bold" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white dark:text-black uppercase font-sans">Confirmer mon exchange</span>
                  </button>

                  <button
                    onClick={() => setStep("target_selection")}
                    className="w-full text-center text-gray-500 text-xs font-bold hover:text-white transition-colors"
                  >
                    ← CHANGER DE TÉLÉPHONE CIBLE
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-400">Flux terminé.</p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Simulator;
