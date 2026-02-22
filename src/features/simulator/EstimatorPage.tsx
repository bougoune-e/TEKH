import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/hooks/use-toast";
import {
  fetchBrands,
  fetchModels,
  getModelInfo,
  getAvailableVariants
} from "@/core/api/supabaseApi";
import { calculerEstimation } from "@/core/api/pricing";
import { cn } from "@/core/api/utils";
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

// Sub-components
import { IdentityStep } from "./components/IdentityStep";
import { DiagnosticStep } from "./components/DiagnosticStep";
import { SatisfactionStep } from "./components/SatisfactionStep";
import { TargetSelectionStep } from "./components/TargetSelectionStep";
import { ComparisonStep } from "./components/ComparisonStep";
import { PhotoStep } from "./components/PhotoStep";
import { usePWA } from "@/shared/hooks/usePWA";
import { Search, RotateCcw } from "lucide-react";

export default function EstimatorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isPWA = usePWA();

  // Auto-detection states
  const [detectionStep, setDetectionStep] = useState<"detecting" | "manual" | "confirmed">((isPWA || (typeof window !== 'undefined' && window.innerWidth < 1024)) ? "detecting" : "manual");
  const [detectedBrand, setDetectedBrand] = useState<string>("");
  const [detectedModel, setDetectedModel] = useState<string>("");
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
    if (isPWA && detectionStep === "manual") {
      setDetectionStep("detecting");
    }
  }, [isPWA, detectionStep]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list);

        // Auto-scroll to top on step change
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Best effort auto-detection
        if ((isPWA || window.innerWidth < 1024) && detectionStep === "detecting") {
          const ua = navigator.userAgent;
          let brandGuess = "";
          let modelGuess = "";

          // Broad Brand Detection
          if (ua.includes("iPhone")) {
            brandGuess = "Apple";
            if (ua.includes("iPhone 15")) modelGuess = "iPhone 15";
            else if (ua.includes("iPhone 14")) modelGuess = "iPhone 14";
            else if (ua.includes("iPhone 13")) modelGuess = "iPhone 13";
            else if (ua.includes("iPhone 12")) modelGuess = "iPhone 12";
            else modelGuess = "iPhone 11";
          } else if (ua.includes("Samsung") || ua.includes("SM-")) {
            brandGuess = "Samsung";
            if (ua.includes("SM-G99")) modelGuess = "Galaxy S21";
            else if (ua.includes("SM-G97")) modelGuess = "Galaxy S10";
            else if (ua.includes("SM-S9")) modelGuess = "Galaxy S23/S24";
            else modelGuess = "Galaxy S Series";
          } else if (ua.includes("Xiaomi") || ua.includes("Redmi") || ua.includes("POCO")) {
            brandGuess = "Xiaomi";
            modelGuess = ua.includes("Pro") ? "Redmi Note Pro" : "Redmi Note";
          } else if (ua.includes("Huawei")) {
            brandGuess = "Huawei";
            modelGuess = "P-Series / Mate";
          } else if (ua.includes("Infinix") || ua.includes("X6")) {
            brandGuess = "Infinix";
            modelGuess = "Note / Hot Series";
          } else if (ua.includes("Tecno")) {
            brandGuess = "Tecno";
            modelGuess = "Camon / Spark";
          } else if (ua.includes("Pixel")) {
            brandGuess = "Google";
            modelGuess = "Pixel";
          }

          if (brandGuess) {
            setDetectedBrand(brandGuess);
            setDetectedModel(modelGuess);
          } else {
            // If we can't guess, still show the "detecting" UX but let them pick quickly
            setDetectionStep("manual");
          }
        }
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les marques.", variant: "destructive" as any });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, [isPWA]);

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

        if ((!info || !info.base_price_fcfa) && variant) {
          if (!info) info = { base_price_fcfa: variant.base_price_fcfa, release_year: 2022, equivalence_class: 'B' };
          else info.base_price_fcfa = variant.base_price_fcfa;
        }

        if (!info?.base_price_fcfa) {
          const fallbackPrice = brand.toLowerCase() === 'apple' ? 450000 : 250000;
          info = { base_price_fcfa: fallbackPrice, release_year: 2021, equivalence_class: 'A' };
        }

        setModelInfoData(info);
      } catch (e: any) {
        toast({ title: "Note", description: "Utilisation du prix de référence standard." });
        setModelInfoData({ base_price_fcfa: 350000, release_year: 2021, equivalence_class: 'B' });
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, [brand, model, storage, ram, availableVariants]);

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
      screenState,
      batteryState,
      biometricsState,
      cameraState,
      aestheticState
    } as any;

    return calculerEstimation(basePrice, brand, modelInfo?.release_year || 2021, diagnostics);
  }, [basePrice, brand, modelInfo, screenState, batteryState, biometricsState, cameraState, aestheticState]);

  const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  const isStep1Complete = brand && model && storage && ram && screenState && batteryState && biometricsState && cameraState && aestheticState &&
    (imageSlots.front || imageSlots.back || imageSlots.left || imageSlots.right);

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

  const renderDetectedSummary = () => (
    <div className="bg-blue-600/5 dark:bg-primary/5 border border-blue-600/20 dark:border-primary/20 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-primary flex items-center justify-center text-white shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-primary">Appareil Détecté</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              {brand} {model}
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase">
              {storage} Go {ram ? `• ${ram} Go RAM` : ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDetectionStep("manual")}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-primary"
        >
          Modifier
        </Button>
      </div>
    </div>
  );

  return (
    <section className="py-2 sm:py-6 bg-slate-50 dark:bg-[#05070a] min-h-screen transition-colors duration-500 pb-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-4 sm:mb-8 flex items-center gap-4 sm:gap-6">
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
              <div className="p-0 animate-in fade-in duration-700">
                {(isPWA || window.innerWidth < 1024) && detectionStep === "detecting" && detectedBrand ? (
                  <div className="p-4 sm:p-8 flex flex-col items-center py-6 px-4 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="w-full bg-gradient-to-br from-[#00FF41]/20 via-[#00FF41]/5 to-transparent border border-[#00FF41]/20 rounded-[32px] p-8 text-center relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF41]/10 blur-3xl -translate-y-16 translate-x-16 rounded-full" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00FF41]/5 blur-2xl translate-y-8 -translate-x-8 rounded-full" />

                      <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-[#00FF41]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00FF41]/30">
                          <Zap className="w-8 h-8 text-[#00FF41]" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                          MODÈLE <span className="text-[#00FF41] italic">DÉTECTÉ</span>
                        </h2>
                        <p className="text-zinc-400 font-medium text-sm">
                          Nous pensons que vous utilisez un :
                        </p>
                        <div className="py-2">
                          <span className="text-4xl font-black text-white tracking-tight block">
                            {detectedBrand}
                          </span>
                          <span className="text-2xl font-bold text-[#00FF41] block mt-1 uppercase tracking-tight">
                            {detectedModel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      <Button
                        onClick={async () => {
                          setBrand(detectedBrand);
                          setModel(detectedModel);
                          try {
                            const variants = await getAvailableVariants(detectedBrand, detectedModel);
                            if (variants && variants.length > 0) {
                              const best = variants[0];
                              setStorage(best.storage_gb);
                              setRam(best.ram_gb || null);
                            }
                          } catch (e) { }
                          setDetectionStep("confirmed");
                        }}
                        className="w-full h-20 rounded-3xl bg-[#00FF41] text-black font-black text-xl uppercase italic tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#00FF41]/20"
                      >
                        C'est exact !
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDetectionStep("manual")}
                        className="w-full h-16 rounded-3xl border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 active:scale-95 transition-all"
                      >
                        Non, modifier
                      </Button>
                    </div>

                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] text-center px-8">
                      CETTE DÉTECTION NOUS PERMET DE VOUS OFFRIR LA MEILLEURE OFFRE DE SWAP INSTANTANÉE.
                    </p>
                  </div>
                ) : (
                  <div className="transition-all duration-500">
                    {(!brand || !model || !storage || !ram || detectionStep !== "confirmed") ? (
                      <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                        {(isPWA && detectionStep === "confirmed") ? renderDetectedSummary() : (
                          <IdentityStep
                            brand={brand} setBrand={setBrand} brands={brands} loadingBrands={loadingBrands}
                            model={model} setModel={setModel} models={models} loadingModels={loadingModels}
                            storage={storage} setStorage={setStorage} storages={storages} loadingStorages={loadingStorages}
                            ram={ram} setRam={setRam} rams={rams}
                          />
                        )}
                        {(brand && model && storage && ram && detectionStep !== "confirmed") && (
                          <div className="pt-4 border-t border-white/5 flex justify-end">
                            <Button
                              onClick={() => {
                                setDetectionStep("confirmed");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="bg-[#00FF41] text-black font-black uppercase rounded-xl h-12 px-8"
                            >
                              Confirmer l'appareil
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 sm:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        {renderDetectedSummary()}

                        <DiagnosticStep
                          screenState={screenState} setScreenState={setScreenState}
                          batteryState={batteryState} setBatteryState={setBatteryState}
                          biometricsState={biometricsState} setBiometricsState={setBiometricsState}
                          cameraState={cameraState} setCameraState={setCameraState}
                          aestheticState={aestheticState} setAestheticState={setAestheticState}
                        />

                        <PhotoStep
                          imageSlots={imageSlots}
                          fileInputRefs={fileInputRefs}
                          handleImageUpload={handleImageUpload}
                          removeImage={removeImage}
                        />

                        <div className="pt-4 flex flex-col items-center gap-4">
                          <div className={cn(
                            "w-full p-4 sm:p-8 rounded-[32px] border-2 transition-all duration-700 relative overflow-hidden text-center",
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
                            onClick={() => {
                              setStep("satisfaction");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`flex items-center justify-center gap-3 ${isPWA ? 'bg-[#00FF41] text-black' : 'bg-black text-white'} hover:opacity-90 transition-all duration-300 p-2.5 px-10 rounded-full border border-white/5 hover:scale-105 active:scale-95 group w-full disabled:opacity-50 disabled:grayscale shadow-lg`}
                          >
                            <div className={`w-7 h-7 ${isPWA ? 'bg-black/10' : 'bg-primary'} rounded-full flex items-center justify-center shadow-lg`}>
                              <Zap className={`${isPWA ? 'text-black' : 'text-black'} h-3.5 w-3.5 font-bold`} />
                            </div>
                            <span className="text-sm font-bold tracking-tight uppercase font-sans">Continuer l'Upgrade</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : step === "satisfaction" ? (
              <SatisfactionStep
                finalPrice={finalPrice}
                formatCFA={formatCFA}
                isSatisfied={isSatisfied}
                setIsSatisfied={setIsSatisfied}
                setStep={setStep}
                proposedPrice={proposedPrice}
                setProposedPrice={setProposedPrice}
                isPWA={isPWA}
              />
            ) : step === "target_selection" ? (
              <TargetSelectionStep
                exchangeType={exchangeType}
                setExchangeType={setExchangeType}
                targetBrand={targetBrand}
                setTargetBrand={setTargetBrand}
                brands={brands}
                targetModel={targetModel}
                setTargetModel={setTargetModel}
                targetModels={targetModels}
                loadingTargetModels={loadingTargetModels}
                targetStorage={targetStorage}
                setTargetStorage={setTargetStorage}
                targetVariants={targetVariants}
                setStep={setStep}
              />
            ) : (
              <ComparisonStep
                brand={brand}
                model={model}
                finalPrice={finalPrice}
                targetBrand={targetBrand}
                targetModel={targetModel}
                targetModelInfo={targetModelInfo}
                storage={storage}
                aestheticState={aestheticState}
                targetStorage={targetStorage}
                formatCFA={formatCFA}
                isPWA={isPWA}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
