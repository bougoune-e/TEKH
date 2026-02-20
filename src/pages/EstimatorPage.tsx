import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  fetchBrands,
  fetchModels,
  getModelInfo,
  getAvailableVariants
} from "@/lib/supabaseApi";
import { calculerEstimation } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Camera,
  Battery,
  Fingerprint,
  Monitor,
  Image as ImageIcon,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRightLeft,
  X,
  Plus
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EstimatorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);

  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [storage, setStorage] = useState<number | null>(null);
  const [ram, setRam] = useState<number | null>(null);

  const [screenState, setScreenState] = useState<"intact" | "cracked" | "burned" | "dead" | "">("");
  const [batteryState, setBatteryState] = useState<"good" | "low" | "replace" | "">("");
  const [biometricsState, setBiometricsState] = useState<"ok" | "nok" | "na" | "">("");
  const [cameraState, setCameraState] = useState<"ok" | "degraded" | "nok" | "">("");
  const [aestheticState, setAestheticState] = useState<"very_good" | "visible" | "damaged" | "">("");

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingStorages, setLoadingStorages] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Mandatory image slots
  const [imageSlots, setImageSlots] = useState<{
    front: string | null;
    back: string | null;
    left: string | null;
    right: string | null;
  }>({
    front: null,
    back: null,
    left: null,
    right: null
  });

  const [imageFiles, setImageFiles] = useState<{
    front: File | null;
    back: File | null;
    left: File | null;
    right: File | null;
  }>({
    front: null,
    back: null,
    left: null,
    right: null
  });

  // Workflow steps: estimation -> satisfaction -> target_selection -> comparison
  const [step, setStep] = useState<"estimation" | "satisfaction" | "target_selection" | "comparison">("estimation");
  const [isSatisfied, setIsSatisfied] = useState<boolean | null>(null);
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [exchangeType, setExchangeType] = useState<"upgrade" | "downgrade" | "">("");

  // Target device states
  const [targetBrand, setTargetBrand] = useState<string>("");
  const [targetModels, setTargetModels] = useState<string[]>([]);
  const [targetModel, setTargetModel] = useState<string>("");
  const [targetVariants, setTargetVariants] = useState<any[]>([]);
  const [targetStorage, setTargetStorage] = useState<number | null>(null);
  const [targetModelInfo, setTargetModelInfo] = useState<any>(null);

  const [loadingTargetModels, setLoadingTargetModels] = useState(false);
  const [loadingTargetVariants, setLoadingTargetVariants] = useState(false);

  const [modelInfo, setModelInfoData] = useState<any>(null);
  const basePrice = modelInfo?.base_price_fcfa ?? null;

  const [availableVariants, setAvailableVariants] = useState<any[]>([]);

  // Refs for hidden file inputs
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSlots = { ...imageSlots };
    const newFiles = { ...imageFiles };

    // Fill empty slots sequentially
    let fileIdx = 0;
    const slots: Array<keyof typeof imageSlots> = ["front", "back", "left", "right"];

    for (const slot of slots) {
      if (!newSlots[slot] && fileIdx < files.length) {
        const file = files[fileIdx];
        newSlots[slot] = URL.createObjectURL(file);
        newFiles[slot] = file;
        fileIdx++;
      }
    }

    setImageSlots(newSlots);
    setImageFiles(newFiles);
  };

  const removeImage = (slot: keyof typeof imageSlots) => {
    setImageSlots(prev => ({ ...prev, [slot]: null }));
    setImageFiles(prev => ({ ...prev, [slot]: null }));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les marques.", variant: "destructive" as any });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      setModel("");
      setAvailableVariants([]);
      setStorages([]);
      setStorage(null);
      setRams([]);
      setRam(null);
      setModelInfoData(null);
      return;
    }
    (async () => {
      try {
        setLoadingModels(true);
        const list = await fetchModels(brand);
        setModels(list);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les modèles.", variant: "destructive" as any });
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) {
      setAvailableVariants([]);
      setStorages([]);
      setStorage(null);
      setRams([]);
      setRam(null);
      setModelInfoData(null);
      return;
    }
    (async () => {
      try {
        setLoadingStorages(true);
        const variants = await getAvailableVariants(brand, model);
        setAvailableVariants(variants);
        const uniqueStorages = Array.from(new Set(variants.map(v => v.storage_gb))).sort((a, b) => a - b);
        setStorages(uniqueStorages);

        if (uniqueStorages.length === 1) {
          setStorage(uniqueStorages[0]);
        }
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les variantes.", variant: "destructive" as any });
      } finally {
        setLoadingStorages(false);
      }
    })();
  }, [brand, model]);

  useEffect(() => {
    if (!storage || availableVariants.length === 0) {
      setRams([]);
      setRam(null);
      return;
    }
    const filteredRams = Array.from(new Set(
      availableVariants
        .filter(v => v.storage_gb === storage)
        .map(v => v.ram_gb)
        .filter(Boolean)
    )).sort((a, b) => (a as any) - (b as any));
    setRams(filteredRams as number[]);
    if (filteredRams.length === 1) {
      setRam(filteredRams[0]);
    }
  }, [storage, availableVariants]);

  useEffect(() => {
    if (!brand || !model || !storage) {
      setModelInfoData(null);
      return;
    }
    (async () => {
      try {
        setLoadingPrice(true);
        const variant = availableVariants.find(v => v.storage_gb === storage && (!ram || v.ram_gb === ram));
        let info = await getModelInfo(brand, model, storage);

        // Robustness: if variant not found or price is 0, use a fallback
        if ((!info || !info.base_price_fcfa) && variant) {
          if (!info) info = { base_price_fcfa: variant.base_price_fcfa, release_year: 2022, equivalence_class: 'B' };
          else info.base_price_fcfa = variant.base_price_fcfa;
        }

        // Hard fallback for iPhone 13 or similar if still empty
        if (!info?.base_price_fcfa) {
          const fallbackPrice = brand.toLowerCase() === 'apple' ? 450000 : 250000;
          info = { base_price_fcfa: fallbackPrice, release_year: 2021, equivalence_class: 'A' };
        }

        setModelInfoData(info);
      } catch (e: any) {
        toast({ title: "Note", description: "Utilisation du prix de référence standard." });
        // Fallback on error
        setModelInfoData({ base_price_fcfa: 350000, release_year: 2021, equivalence_class: 'B' });
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, [brand, model, storage, ram, availableVariants]);

  // Effects for Target Selection
  useEffect(() => {
    if (!targetBrand) {
      setTargetModels([]);
      setTargetModel("");
      return;
    }
    (async () => {
      try {
        setLoadingTargetModels(true);
        const list = await fetchModels(targetBrand);
        setTargetModels(list);
      } catch (e: any) {
        toast({ title: "Erreur", description: "Impossible de charger les modèles cibles." });
      } finally {
        setLoadingTargetModels(false);
      }
    })();
  }, [targetBrand]);

  useEffect(() => {
    if (!targetBrand || !targetModel) {
      setTargetVariants([]);
      setTargetStorage(null);
      setTargetModelInfo(null);
      return;
    }
    (async () => {
      try {
        setLoadingTargetVariants(true);
        const variants = await getAvailableVariants(targetBrand, targetModel);
        setTargetVariants(variants);

        if (variants.length > 0) {
          const first = variants[0];
          setTargetStorage(first.storage_gb);
          let info = await getModelInfo(targetBrand, targetModel, first.storage_gb);
          if (info) {
            info.base_price_fcfa = first.base_price_fcfa;
          } else {
            info = { base_price_fcfa: first.base_price_fcfa, release_year: 2022, equivalence_class: 'A' };
          }
          setTargetModelInfo(info);
        } else {
          // Target fallback
          setTargetModelInfo({ base_price_fcfa: 750000, release_year: 2023, equivalence_class: 'A' });
          setTargetStorage(128);
        }
      } catch (e: any) {
        setTargetModelInfo({ base_price_fcfa: 600000, release_year: 2022, equivalence_class: 'B' });
      } finally {
        setLoadingTargetVariants(false);
      }
    })();
  }, [targetBrand, targetModel]);

  const finalPrice = useMemo(() => {
    if (!basePrice || !screenState || !batteryState || !biometricsState || !cameraState || !aestheticState) return null;

    const diagnostics = {
      ecran_casse: screenState !== "intact",
      batterie_faible: batteryState === "low" || batteryState === "replace",
      face_id_hs: biometricsState === "nok",
      camera_hs: cameraState === "nok" || cameraState === "degraded",
      etat_moyen: aestheticState === "visible" || aestheticState === "damaged",
      // Map explicit states for pricing.ts
      screenState,
      batteryState,
      biometricsState,
      cameraState,
      aestheticState
    } as any;

    return calculerEstimation(basePrice, brand, modelInfo?.release_year || 2021, diagnostics);
  }, [basePrice, brand, modelInfo, screenState, batteryState, biometricsState, cameraState, aestheticState]);

  const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  // BYPASS FOR VERIFICATION: If images are missing but we are in dev/test, allow proceeding
  // In production, this would be strict.
  const isStep1Complete = brand && model && storage && ram && screenState && batteryState && biometricsState && cameraState && aestheticState &&
    imageSlots.front && imageSlots.back && imageSlots.left && imageSlots.right;

  const renderProgress = () => {
    const steps = [
      { id: "estimation", label: "Diagnostic" },
      { id: "satisfaction", label: "Valeur" },
      { id: "target_selection", label: "Cible" },
      { id: "comparison", label: "Accord" },
    ];

    const currentIndex = steps.findIndex(s => s.id === step);

    return (
      <div className="flex items-center justify-between mb-8 px-2 max-w-xl mx-auto">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
            {i < steps.length - 1 && (
              <div className={cn(
                "absolute top-4 left-[60%] right-[-40%] h-[2px] transition-all duration-700",
                i < currentIndex ? "bg-blue-600 dark:bg-primary" : "bg-slate-200 dark:bg-zinc-800"
              )} />
            )}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-700 z-10 font-black text-[11px]",
              i <= currentIndex
                ? "border-blue-600 bg-blue-600 dark:border-primary dark:bg-primary text-white shadow-lg scale-105"
                : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-slate-400 dark:text-zinc-600"
            )}>
              {i < currentIndex ? <CheckCircle2 className="w-5 h-5" /> : <span>0{i + 1}</span>}
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.15em] text-center",
              i <= currentIndex ? "text-blue-600 dark:text-primary" : "text-slate-400 dark:text-zinc-600"
            )}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-6 sm:py-12 bg-slate-50 dark:bg-[#05070a] min-h-screen transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-10 flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (step === "comparison") setStep("target_selection");
              else if (step === "target_selection") setStep("satisfaction");
              else if (step === "satisfaction") setStep("estimation");
              else navigate(-1);
            }}
            className="rounded-2xl border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-[#064e3b] dark:text-[#00FF41] mb-1 font-sans">
              Programme d'échange
            </h2>
            <h1 className="text-2xl sm:text-5xl font-black tracking-tight uppercase font-sans text-black dark:text-white">
              Upgrade <span className="text-[#064e3b] dark:text-primary">TEKH+</span>
            </h1>
          </div>
        </div>

        {renderProgress()}

        <Card className="bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/5 shadow-sm rounded-xl overflow-hidden border">
          <CardContent className="p-0">
            {step === "estimation" ? (
              <div className="p-4 sm:p-8 space-y-5 sm:space-y-8 animate-in fade-in duration-700">
                {/* 1. Device Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter uppercase font-sans text-black dark:text-white">1. Identité de l'appareil</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Marque</Label>
                      <Select value={brand || ""} onValueChange={(v) => { setBrand(v); setModel(""); setStorage(null); setRam(null); }}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white hover:border-blue-600/50 dark:hover:border-primary/50 transition-all outline-none">
                          <SelectValue placeholder={loadingBrands ? "..." : "SÉLECTIONNER MARQUE"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Modèle</Label>
                      <Select value={model || ""} onValueChange={(v) => { setModel(v); setStorage(null); setRam(null); }} disabled={!brand || loadingModels}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                          <SelectValue placeholder={!brand ? "—" : loadingModels ? "..." : "SÉLECTIONNER MODÈLE"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Stockage</Label>
                      <Select value={storage ? String(storage) : ""} onValueChange={(v) => { setStorage(Number(v)); setRam(null); }} disabled={!model || loadingStorages}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                          <SelectValue placeholder={!model ? "—" : loadingStorages ? "..." : "CAPACITÉ (GO)"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          {storages.map((s) => <SelectItem key={s} value={String(s)}>{s} Go</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">RAM</Label>
                      <Select value={ram ? String(ram) : ""} onValueChange={(v) => setRam(Number(v))} disabled={!storage || rams.length === 0}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                          <SelectValue placeholder={!storage ? "—" : rams.length === 0 ? "Non applicable" : "RAM (GO)"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          {rams.map((x) => <SelectItem key={x} value={String(x)}>{x} Go</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 2. Condition Diagnostic */}
                <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">2. Diagnostic Technique</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">État de l'affichage</Label>
                      <Select value={screenState || ""} onValueChange={(v) => setScreenState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                          <SelectValue placeholder="ÉCRAN" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <SelectItem value="intact">Intact / Aucun défaut</SelectItem>
                          <SelectItem value="cracked">Fissuré / Rayé</SelectItem>
                          <SelectItem value="burned">Brûlé / Taches LCD</SelectItem>
                          <SelectItem value="dead">Non fonctionnel / Noir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Santé Batterie</Label>
                      <Select value={batteryState || ""} onValueChange={(v) => setBatteryState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                          <SelectValue placeholder="BATTERIE" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <SelectItem value="good">Optimale (&gt; 85%)</SelectItem>
                          <SelectItem value="low">Dégradée (&lt; 85%)</SelectItem>
                          <SelectItem value="replace">Service / À remplacer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Biométrie & Sécurité</Label>
                      <Select value={biometricsState || ""} onValueChange={(v) => setBiometricsState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                          <SelectValue placeholder="FACE ID / TOUCH ID" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <SelectItem value="ok">100% Fonctionnel</SelectItem>
                          <SelectItem value="nok">Désactivé / Panne</SelectItem>
                          <SelectItem value="na">Non disponible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Capture Optique</Label>
                      <Select value={cameraState || ""} onValueChange={(v) => setCameraState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                          <SelectValue placeholder="CAMÉRA" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <SelectItem value="ok">Parfaite</SelectItem>
                          <SelectItem value="degraded">Flou / Taches sombres</SelectItem>
                          <SelectItem value="nok">HS / Lentille cassée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 text-left md:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Esthétique Globale</Label>
                      <Select value={aestheticState || ""} onValueChange={(v) => setAestheticState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                          <SelectValue placeholder="CHÂSSIS / DOS" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <SelectItem value="very_good">Presque Neuf</SelectItem>
                          <SelectItem value="visible">Traces visibles</SelectItem>
                          <SelectItem value="damaged">Chocs / Cassé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">3. Rapport Photo OBLIGATOIRE</h2>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-2 border-dashed border-slate-200 dark:border-white/10">
                      <div className="flex flex-col items-center gap-3 text-center mb-4">
                        <div
                          onClick={() => fileInputRefs.front.current?.click()}
                          className="w-14 h-14 rounded-xl bg-blue-600 dark:bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Plus className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Photos de l'appareil</h4>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Face, Dos, Côtés (4 photos)</p>
                        </div>
                        <input type="file" ref={fileInputRefs.front} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(imageSlots) as Array<keyof typeof imageSlots>).map((slot) => (
                          <div key={slot} className="relative aspect-square">
                            <div
                              onClick={() => !imageSlots[slot] && fileInputRefs.front.current?.click()}
                              className={cn(
                                "w-full h-full rounded-lg border-2 overflow-hidden transition-all flex items-center justify-center",
                                imageSlots[slot]
                                  ? "border-blue-600 dark:border-primary"
                                  : "border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-white/5"
                              )}
                            >
                              {imageSlots[slot] ? (
                                <img src={imageSlots[slot]!} alt={slot} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-300 dark:text-zinc-700" />
                              )}
                            </div>
                            {imageSlots[slot] && (
                              <button
                                onClick={() => removeImage(slot)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col items-center gap-6">
                  {/* The Reprise Value Display */}
                  <div className={cn(
                    "w-full p-8 rounded-[40px] border-2 transition-all duration-700 relative overflow-hidden text-center",
                    finalPrice !== null
                      ? "border-blue-600/20 bg-blue-600/5 dark:border-primary/20 dark:bg-primary/5 shadow-xl"
                      : "border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02] grayscale opacity-40"
                  )}>
                    {!isStep1Complete && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 bg-white dark:bg-black px-4 py-2 rounded-full border border-zinc-100 dark:border-white/10 shadow-xl">
                          <AlertCircle className="w-4 h-4 text-[#064e3b] dark:text-primary animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Diagnostic incomplet</span>
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500 mb-2 italic">estimation indicative</div>
                    <div className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white italic">
                      {finalPrice !== null ? formatCFA(finalPrice) : formatCFA(0)}
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#064e3b] dark:text-primary" />
                      <span className="text-[9px] font-black text-[#374151] dark:text-zinc-500 uppercase tracking-widest">Indexé MARCHÉ V2.4</span>
                    </div>
                  </div>

                  <button
                    disabled={!isStep1Complete}
                    onClick={() => setStep("satisfaction")}
                    className="flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 transition-all duration-300 p-3 px-10 rounded-full border border-white/5 hover:scale-105 active:scale-95 group w-full disabled:opacity-50 disabled:grayscale shadow-lg"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="text-black h-4 w-4 font-bold" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-white uppercase font-sans">Continuer l'Upgrade</span>
                  </button>
                </div>
              </div>
            ) : step === "satisfaction" ? (
              <div className="p-4 sm:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-700 text-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-[28px] bg-blue-600/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-600/20 dark:border-primary/20">
                    <Zap className="w-10 h-10 text-blue-600 dark:text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-slate-900 dark:text-white">
                    {t('simulator.votre_offre')} : <br /> <span className="text-[#064e3b] dark:text-primary">{formatCFA(finalPrice || 0)}</span>
                  </h2>
                  <p className="text-[#374151] dark:text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">{t('simulator.helper_text')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => { setIsSatisfied(true); setStep("target_selection"); }}
                    className="flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 transition-all duration-300 p-3 px-8 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-sm"
                  >
                    <div className="w-8 h-8 bg-[#00FF41] rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="text-black h-4 w-4" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-white uppercase font-sans">{t('simulator.perfect')}</span>
                  </button>

                  <button
                    onClick={() => setIsSatisfied(false)}
                    className={cn(
                      "flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 transition-all duration-300 p-3 px-8 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-sm",
                      isSatisfied === false ? "border-amber-500 ring-1 ring-amber-500" : ""
                    )}
                  >
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow">
                      <TrendingUp className="text-white h-4 w-4" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-white uppercase font-sans">{t('simulator.low_estimate')}</span>
                  </button>
                </div>

                {isSatisfied === false && (
                  <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-6 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-blue-600 dark:text-primary" />
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 italic">VOTRE OFFRE (FCFA)</Label>
                    </div>
                    <input
                      type="number"
                      placeholder="EX: 450,000"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-zinc-100 dark:border-white/10 rounded-2xl h-14 px-6 font-black text-2xl text-[#064e3b] dark:text-primary outline-none focus:border-[#064e3b] dark:focus:border-primary transition-all shadow-inner placeholder:text-slate-200 dark:placeholder:text-zinc-800 text-center"
                    />
                    <Button
                      className="w-full h-14 rounded-full font-black text-sm uppercase italic tracking-[0.2em] shadow-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black mt-4"
                      onClick={() => setStep("target_selection")}
                      disabled={!proposedPrice}
                    >
                      SOUMETTRE <ArrowRightLeft className="w-5 h-5 ml-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : step === "target_selection" ? (
              <div className="p-4 sm:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-700">
                <div className="text-center space-y-4">
                  <p className="text-blue-600 dark:text-primary font-black uppercase text-[10px] tracking-[0.5em]">PHASE 3 / NAVIGATION</p>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-slate-900 dark:text-white">
                    {t('simulator.possession')} <br /> <span className="text-[#064e3b] dark:text-primary">{t('simulator.target')}</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <button
                    onClick={() => setExchangeType("upgrade")}
                    className={cn(
                      "flex items-center gap-3 bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-xl border-2 shadow-sm group",
                      exchangeType === "upgrade" ? "border-[#064e3b] dark:border-primary" : "border-slate-100 dark:border-white/5"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm", exchangeType === "upgrade" ? "bg-[#064e3b] dark:bg-primary text-white dark:text-black" : "bg-white dark:bg-zinc-800 text-slate-400")}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-left font-sans">
                      <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase transition-colors">UPGRADE</span>
                      <span className="text-[8px] font-bold text-[#374151] dark:text-gray-500 uppercase tracking-widest block -mt-1">PERFORMANCE</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setExchangeType("downgrade")}
                    className={cn(
                      "flex items-center gap-3 bg-zinc-50 dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-xl border-2 shadow-sm group opacity-60 grayscale",
                      exchangeType === "downgrade" ? "border-amber-500 ring-1 ring-amber-500" : "border-slate-100 dark:border-white/5"
                    )}
                  >
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                      <TrendingDown className="text-white h-4 h-4" />
                    </div>
                    <div className="text-left font-sans">
                      <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase transition-colors">DOWNGRADE</span>
                      <span className="text-[8px] font-bold text-[#374151] dark:text-gray-500 uppercase tracking-widest block -mt-1">LIQUIDITÉS</span>
                    </div>
                  </button>
                </div>

                {exchangeType && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-700 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Marque cible</Label>
                        <Select value={targetBrand || ""} onValueChange={(v) => { setTargetBrand(v); setTargetModel(""); setTargetStorage(null); }}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="SÉLECTIONNER BRAND" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Modèle cible</Label>
                        <Select value={targetModel || ""} onValueChange={(v) => { setTargetModel(v); setTargetStorage(null); }} disabled={!targetBrand || loadingTargetModels}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                            <SelectValue placeholder={loadingTargetModels ? "..." : "SÉLECTIONNER MODEL"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {targetModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {targetModel && targetVariants.length > 0 && (
                      <div className="space-y-3 animate-in fade-in">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-1">Capacité Requise</Label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(targetVariants.map(v => v.storage_gb))).sort((a, b) => a - b).map(s => (
                            <button
                              key={s}
                              onClick={() => setTargetStorage(s)}
                              className={cn(
                                "px-6 py-3 rounded-lg border-2 font-black text-[11px] transition-all tracking-widest uppercase italic",
                                targetStorage === s
                                  ? "border-blue-600 bg-blue-600 dark:border-primary dark:bg-primary text-white shadow-lg scale-105"
                                  : "border-slate-100 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-zinc-600 hover:border-slate-300"
                              )}
                            >
                              {s} GO
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setStep("comparison")}
                      disabled={!targetModel || !targetStorage}
                      className="flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 transition-all duration-300 p-4 px-10 rounded-full border border-white/5 hover:scale-105 active:scale-95 group w-full disabled:opacity-50 shadow-xl"
                    >
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRightLeft className="text-black h-5 w-5" />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-white uppercase font-sans">Analyser le Deal</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-10 space-y-12 animate-in zoom-in-95 duration-700">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white mb-1">
                    ACCORD DE <span className="text-[#064e3b] dark:text-primary italic">SWAP</span>
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#064e3b] dark:text-primary" />
                    <p className="text-[#374151] dark:text-zinc-500 font-black uppercase text-[9px] tracking-[0.5em]">CERTIFICATION TECHNIQUE TEKH+</p>
                  </div>
                </div>

                {/* THE VISUAL EXCHANGE BOX */}
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 relative max-w-3xl mx-auto">
                    {/* Left Card */}
                    <div className="flex-1 bg-white dark:bg-white/5 rounded-xl p-6 flex flex-col items-center gap-3 border border-zinc-100 dark:border-white/10 shadow-lg group">
                      <div className="w-16 h-16 rounded-full bg-blue-600/10 dark:bg-primary/10 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8 text-blue-600 dark:text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{t('simulator.possession')}</p>
                        <h4 className="text-base font-black tracking-tighter text-black dark:text-white uppercase">{brand} {model}</h4>
                        <p className="text-xl font-black text-blue-600 dark:text-primary mt-0.5">{formatCFA(finalPrice || 0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-[#05070a] border-[3px] border-zinc-50 dark:border-[#0b0e14] flex items-center justify-center z-10 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-[#064e3b] dark:bg-primary flex items-center justify-center">
                          <ArrowRightLeft className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    {/* Right Card */}
                    <div className="flex-1 bg-white dark:bg-white/5 rounded-xl p-6 flex flex-col items-center gap-3 border border-zinc-100 dark:border-white/10 shadow-lg group relative">
                      <div className="w-16 h-16 rounded-full bg-blue-600/10 dark:bg-primary/10 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                        <Zap className="w-8 h-8 text-blue-600 dark:text-primary" fill="currentColor" />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{t('simulator.acquisition')}</p>
                        <h4 className="text-base font-black tracking-tighter text-black dark:text-white uppercase">{targetBrand} {targetModel}</h4>
                        <p className="text-xl font-black text-blue-600 dark:text-primary mt-0.5">{formatCFA(targetModelInfo?.base_price_fcfa || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-1 md:flex items-stretch bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-2 border-slate-100 dark:border-white/5 shadow-xl overflow-hidden max-w-3xl mx-auto">
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3">POSSESSION</span>
                      <div className="space-y-1 font-black text-[11px] text-slate-900 dark:text-white italic uppercase tracking-tighter">
                        <div>{storage} Go Stockage</div>
                        <div>État: {aestheticState === 'very_good' ? 'Premium' : 'Standard'}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 bg-blue-600/5 dark:bg-primary/5 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-primary/60 mb-3">ACQUISITION</span>
                      <div className="space-y-1 font-black text-[11px] text-slate-900 dark:text-white italic uppercase tracking-tighter">
                        <div>{targetStorage} Go Stockage</div>
                        <div>Grade A Certifié</div>
                        <div>Garantie Tekh+ Incluse</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-900 dark:bg-black rounded-[40px] p-10 space-y-8 relative shadow-2xl text-white max-w-4xl mx-auto mt-6">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 dark:bg-primary px-6 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">BILAN FINANCIER</span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 flex-1 w-full max-w-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Apport</span>
                        <span className="text-white text-lg font-black italic">{formatCFA(finalPrice || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cible</span>
                        <span className="text-white text-lg font-black italic">{formatCFA(targetModelInfo?.base_price_fcfa || 0)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-center md:border-l border-white/10 md:pl-10 flex-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 dark:text-primary mb-2 italic">DIFFÉRENCE</div>
                      <div className="text-5xl sm:text-6xl font-black text-white italic tracking-tighter leading-none mb-3">
                        {formatCFA(Math.max(0, (targetModelInfo?.base_price_fcfa || 0) - (finalPrice || 0)))}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] text-center md:text-right">RÈGLEMENT EN AGENCE TEKH+</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      alert("VOTRE DEMANDE DE SWAP EST ENREGISTRÉE ! UN AGENT VA VOUS CONTACTER SUR WHATSAPP.");
                      window.location.href = "/";
                    }}
                    className="w-full h-28 rounded-[48px] bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-black font-black text-4xl italic tracking-tighter hover:scale-[1.01] active:scale-95 transition-all shadow-3xl uppercase flex items-center justify-center gap-6 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <span className="relative z-10">CONFIRMER L'ÉCHANGE</span>
                    <ShieldCheck className="w-10 h-10 relative z-10" />
                  </button>
                  <p className="text-center text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.5em] mt-8">EN CLIQUANT SUR CONFIRMER, VOUS ACCEPTEZ LES CONDITIONS GÉNÉRALES DU PROGRAMME TEKH+</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
