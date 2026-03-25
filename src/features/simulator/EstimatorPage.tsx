import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { calculerEstimation, type BatterieTekh, type ChassisTekh, type EcranTekh } from "@/core/api/pricing";
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
import { Search, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import { detectDevice, predictVariants, isMobileUserAgent, getDeviceModelFromClientHints } from "@/core/api/deviceFinder";
import { useDeals } from "@/features/marketplace/deals.context";
import { loadJson, saveJson } from "@/core/pwa/tekhSession";
import { analyzePhoneImage } from "@/core/api/analyzePhone";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

/** Reprise session simulateur (onglet / retour app) — photos non persistées. */
interface EstimatorSessionV1 {
  v: 1;
  step: "estimation" | "satisfaction" | "target_selection" | "comparison";
  brand: string;
  model: string;
  storage: number | null;
  ram: number | null;
  ecranState: string;
  chassisState: string;
  batterieState: string;
  exchangeType: "upgrade" | "downgrade" | "";
  targetBrand: string;
  targetModel: string;
  targetStorage: number | null;
  isSatisfied: boolean | null;
  proposedPrice: string;
  detectionStep: "detecting" | "manual" | "confirmed";
}

export default function EstimatorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLastSimulation } = useDeals();
  const isPWA = usePWA();
  const returnToDealId = (location.state as { returnToDealId?: string } | null)?.returnToDealId;

  // Auto-detection states
  // Default to manual; we will switch to "detecting" via effect only for real PWA context.
  const [detectionStep, setDetectionStep] = useState<"detecting" | "manual" | "confirmed">("manual");
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

  const [ecranState, setEcranState] = useState<EcranTekh | "">("");
  const [chassisState, setChassisState] = useState<ChassisTekh | "">("");
  const [batterieState, setBatterieState] = useState<BatterieTekh | "">("");

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

  // AI photo analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisConfidence, setAnalysisConfidence] = useState(100);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Read files synchronously before any await
    const newSlots = { ...imageSlots };
    const newFiles = { ...imageFiles };
    let firstNewFile: File | null = null;
    let fileIdx = 0;
    const slots: Array<keyof typeof imageSlots> = ["front", "back", "left", "right"];

    for (const slot of slots) {
      if (!newSlots[slot] && fileIdx < files.length) {
        const file = files[fileIdx];
        newSlots[slot] = URL.createObjectURL(file);
        newFiles[slot] = file;
        if (!firstNewFile) firstNewFile = file;
        fileIdx++;
      }
    }

    setImageSlots(newSlots);
    setImageFiles(newFiles);

    // Trigger AI analysis on the first new image (Supabase Edge Function → Claude Haiku)
    if (firstNewFile && isSupabaseConfigured) {
      setIsAnalyzing(true);
      setAnalysisMessage("");
      try {
        const result = await analyzePhoneImage(firstNewFile);
        setEcranState(result.ecran);
        setChassisState(result.chassis);
        setAnalysisConfidence(result.confiance);
        if (result.confiance < 70) {
          setAnalysisMessage(
            `Photo peu claire — ${result.remarques}. Reprenez la photo avec plus de lumière pour une meilleure analyse. Vous pouvez corriger manuellement ci-dessus.`
          );
        } else {
          setAnalysisMessage(`IA : ${result.remarques} — Vous pouvez corriger si besoin.`);
        }
      } catch {
        setAnalysisMessage("Analyse IA indisponible — sélectionnez l'état manuellement dans le diagnostic ci-dessus.");
        setAnalysisConfidence(0);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const removeImage = (slot: keyof typeof imageSlots) => {
    setImageSlots(prev => ({ ...prev, [slot]: null }));
    setImageFiles(prev => ({ ...prev, [slot]: null }));
  };

  // Phone Finder state
  const [isScanning, setIsScanning] = useState(false);

  const estimatorRestoredRef = useRef(false);

  useLayoutEffect(() => {
    if (estimatorRestoredRef.current) return;
    const s = loadJson<EstimatorSessionV1>("estimator-v1", false);
    if (!s || s.v !== 1) return;
    estimatorRestoredRef.current = true;
    setStep(s.step);
    if (s.brand) setBrand(s.brand);
    if (s.model) setModel(s.model);
    if (s.storage != null) setStorage(s.storage);
    if (s.ram != null) setRam(s.ram);
    if (s.ecranState) setEcranState(s.ecranState as EcranTekh);
    if (s.chassisState) setChassisState(s.chassisState as ChassisTekh);
    if (s.batterieState) setBatterieState(s.batterieState as BatterieTekh);
    if (s.exchangeType !== undefined) setExchangeType(s.exchangeType);
    if (s.targetBrand) setTargetBrand(s.targetBrand);
    if (s.targetModel) setTargetModel(s.targetModel);
    if (s.targetStorage != null) setTargetStorage(s.targetStorage);
    if (s.isSatisfied !== undefined) setIsSatisfied(s.isSatisfied);
    if (s.proposedPrice !== undefined) setProposedPrice(s.proposedPrice);
    if (s.detectionStep) setDetectionStep(s.detectionStep);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const payload: EstimatorSessionV1 = {
        v: 1,
        step,
        brand,
        model,
        storage,
        ram,
        ecranState: ecranState || "",
        chassisState: chassisState || "",
        batterieState: batterieState || "",
        exchangeType,
        targetBrand,
        targetModel,
        targetStorage,
        isSatisfied,
        proposedPrice,
        detectionStep,
      };
      saveJson("estimator-v1", payload, false);
    }, 700);
    return () => clearTimeout(t);
  }, [
    step,
    brand,
    model,
    storage,
    ram,
    ecranState,
    chassisState,
    batterieState,
    exchangeType,
    targetBrand,
    targetModel,
    targetStorage,
    isSatisfied,
    proposedPrice,
    detectionStep,
  ]);

  // Détection automatique désactivée : sélection manuelle uniquement (à réactiver plus tard si besoin).
  // useEffect(() => { if (shouldDetect && detectionStep === "manual") setDetectionStep("detecting"); }, [isPWA]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list);

        // Auto-scroll to top on init
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Phone Finder (désactivé : sélection manuelle uniquement)
        if (false && detectionStep === "detecting") {
          setIsScanning(true);

          setTimeout(async () => {
            const detection = detectDevice();
            if (import.meta.env.DEV) {
              console.log("[TEKH detect] RAW UA:", navigator.userAgent);
              console.log("[TEKH detect] detectDevice result:", detection);
            }
            let finalModel = detection.model;

            try {
              const hintModel = await getDeviceModelFromClientHints();
              if (import.meta.env.DEV) console.log("[TEKH detect] ClientHints model:", hintModel);
              if (hintModel) finalModel = hintModel;
            } catch (_) { /* ignore */ }

            // Toujours afficher le résultat (jamais couper vers manuel sans montrer ce qu'on a détecté)
            setDetectedBrand(detection.brand);
            setDetectedModel(finalModel || detection.model);
            if (import.meta.env.DEV) console.log("[TEKH detect] state set → brand:", detection.brand, "model:", finalModel, "confidence:", detection.confidence);

            if (detection.confidence > 0.6) {
              const prediction = predictVariants(detection.brand, finalModel);
              try {
                const variants = await getAvailableVariants(detection.brand, finalModel);
                if (variants && variants.length > 0) {
                  const match = variants.find((v: any) => v.storage_gb === prediction.storage) || variants[0];
                  // gardé pour usage à la confirmation
                }
              } catch (_) { /* ignore */ }
            }
            setIsScanning(false);
          }, 1500);
        }
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les marques.", variant: "destructive" as any });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, [isPWA, detectionStep]);

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
    } else if (filteredRams.length === 0) {
      // Certains modèles n'exposent pas la RAM dans la source CSV/API.
      setRam(null);
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
    if (!basePrice || !ecranState || !chassisState || !batterieState) return null;

    const diagnostics = {
      ecran: ecranState,
      chassis: chassisState,
      batterie: batterieState,
    };

    return calculerEstimation(basePrice, brand, modelInfo?.release_year || 2021, diagnostics, model);
  }, [basePrice, brand, modelInfo, ecranState, chassisState, batterieState]);

  const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  const isIdentityComplete = Boolean(brand && model && storage && (rams.length === 0 || ram));
  const isRamSatisfied = rams.length === 0 ? true : Boolean(ram);
  const isStep1Complete = Boolean(
    brand && model && storage && isRamSatisfied && ecranState && chassisState && batterieState &&
    (imageSlots.front || imageSlots.back || imageSlots.left || imageSlots.right)
  );

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
    <div className="bg-blue-600/5 dark:bg-primary/5 border border-blue-600/20 dark:border-primary/20 rounded-xl p-3 mb-4 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-primary flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-primary">Appareil</p>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate">
              {brand} {model}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500">
              {storage} Go {ram ? `• ${ram} Go RAM` : ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDetectionStep("manual")}
          className="text-[10px] font-black uppercase shrink-0 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-primary h-8 px-3"
        >
          Modifier
        </Button>
      </div>
    </div>
  );

  return (
    <section className="py-2 sm:py-6 bg-slate-50 dark:bg-[#05070a] min-h-dvh transition-colors duration-500 pb-32">
      <div className="container mx-auto px-6 max-w-5xl">
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
            <h1 className="text-3xl sm:text-5xl font-black uppercase font-sans tracking-[0.35em] text-black dark:text-white">
              UPGRADE <span className="text-[#064e3b] dark:text-primary">TEKH+</span>
            </h1>
          </div>
        </div>

        {returnToDealId && (
          <div className="mb-4 p-3 rounded-xl bg-[#064e3b]/10 dark:bg-[#059669]/15 border border-[#064e3b]/30 dark:border-[#059669]/40 text-center">
            <p className="text-xs font-bold text-[#064e3b] dark:text-[#059669] uppercase tracking-wider">
              Vous avez sélectionné un deal dans l’explorateur
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Estimez votre téléphone actuel ci-dessous, puis cliquez sur <strong>« Retour au deal avec cette estimation »</strong> pour reprendre votre achat.
            </p>
          </div>
        )}

        {renderProgress()}

        <Card className="bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/5 shadow-sm rounded-xl overflow-hidden border">
          <CardContent className="p-0">
            {step === "estimation" ? (
              <div className="p-0 animate-in fade-in duration-700">
                {/* Auto-détection : afficher dès qu'on est en phase "detecting" (déclenchée par PWA / viewport / UA mobile) */}
                {detectionStep === "detecting" ? (
                  isScanning ? (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[450px] space-y-8 animate-in fade-in zoom-in duration-500">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-[#00FF41]/10 border-t-[#00FF41] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Smartphone className="w-8 h-8 text-[#00FF41] animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Analyse en cours...</h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Lecture des spécifications hardware</p>
                      </div>
                    </div>
                  ) : detectedModel && detectedBrand !== "Inconnu" ? (
                    <div className="p-3 sm:p-4 flex flex-col items-center py-3 px-3 space-y-3 animate-in slide-in-from-bottom-8 duration-700">
                      <div className="w-full bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF41]">Modèle détecté</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{detectedBrand} {detectedModel}</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Confirmez-vous ce modèle ?</p>
                      </div>
                      <div className="w-full space-y-2">
                        <Button
                          onClick={async () => {
                            const canonicalBrand =
                              brands.find(b => b.toLowerCase() === detectedBrand.toLowerCase()) || detectedBrand;
                            if (import.meta.env.DEV) {
                              console.log("[TEKH confirm] detectedBrand:", detectedBrand, "canonicalBrand:", canonicalBrand, "brands from API:", brands.slice(0, 10));
                            }
                            setBrand(canonicalBrand);
                            setModel(detectedModel);
                            try {
                              const v = await getAvailableVariants(canonicalBrand, detectedModel);
                              if (import.meta.env.DEV) console.log("[TEKH confirm] getAvailableVariants count:", v?.length ?? 0);
                              if (v && v.length > 0) {
                                const pred = predictVariants(detectedBrand, detectedModel);
                                const match = v.find((x: any) => x.storage_gb === pred.storage) || v[0];
                                setStorage(match.storage_gb);
                                setRam(match.ram_gb || null);
                              }
                            } catch (e) { }
                            setDetectionStep("confirmed");
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full h-11 rounded-xl bg-[#00FF41] text-black font-black text-xs uppercase tracking-tight hover:opacity-95 active:scale-[0.98]"
                        >
                          Oui, c'est mon appareil
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetectionStep("manual")}
                          className="w-full h-9 rounded-xl text-slate-500 dark:text-zinc-500 text-[11px] font-bold uppercase hover:text-[#00FF41]"
                        >
                          Non, choisir manuellement
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        {typeof navigator !== "undefined" && /iPhone|iPad/i.test(navigator.userAgent)
                          ? "Détection impossible"
                          : "Modèle non reconnu"}
                      </p>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-500">Choisissez votre appareil manuellement.</p>
                      <Button onClick={() => setDetectionStep("manual")} variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 uppercase font-black text-xs px-6 h-10">Continuer manuellement</Button>
                    </div>
                  )
                ) : (
                  /* 
                     MANUAL OR CONFIRMED FLOW (Shows Identity Step or Diagnostic Step)
                  */
                  <div className="transition-all duration-500">
                    {(!isIdentityComplete || (detectionStep as string) !== "confirmed") ? (
                      <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                        {(isPWA && detectionStep === "confirmed") ? renderDetectedSummary() : (
                          <IdentityStep
                            brand={brand} setBrand={setBrand} brands={brands} loadingBrands={loadingBrands}
                            model={model} setModel={setModel} models={models} loadingModels={loadingModels}
                            storage={storage} setStorage={setStorage} storages={storages} loadingStorages={loadingStorages}
                            ram={ram} setRam={setRam} rams={rams}
                          />
                        )}
                        {(isIdentityComplete && (detectionStep as string) !== "confirmed") && (
                          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
                            <Button
                              onClick={() => {
                                setDetectionStep("confirmed");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="bg-[#00FF41] text-black font-black uppercase rounded-xl h-10 text-xs px-6"
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
                          ecranState={ecranState} setEcranState={setEcranState}
                          chassisState={chassisState} setChassisState={setChassisState}
                          batterieState={batterieState} setBatterieState={setBatterieState}
                        />
                        <PhotoStep
                          imageSlots={imageSlots}
                          fileInputRefs={fileInputRefs}
                          handleImageUpload={handleImageUpload}
                          removeImage={removeImage}
                          isAnalyzing={isAnalyzing}
                          analysisMessage={analysisMessage}
                          analysisConfidence={analysisConfidence}
                        />
                        <div className="pt-4 flex flex-col items-center gap-6">
                          <div id="estimation-result" className={cn(
                            "w-full p-5 rounded-2xl border-2 transition-all duration-700 relative overflow-hidden text-center",
                            finalPrice !== null
                              ? "border-[#00FF41]/20 bg-[#00FF41]/5 shadow-lg shadow-[#00FF41]/5"
                              : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] grayscale opacity-40"
                          )}>
                            {!isStep1Complete && (
                              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                                  <AlertCircle className="w-3 h-3 text-[#00FF41] animate-pulse" />
                                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Diagnostic incomplet</span>
                                </div>
                              </div>
                            )}
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-zinc-500 mb-1 italic">Estimation indicative</div>
                            <div className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white italic">
                              {finalPrice !== null ? formatCFA(finalPrice) : formatCFA(0)}
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-2 opacity-50">
                              <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-[#00FF41]" />
                              <span className="text-[8px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Charte TEKH+</span>
                            </div>
                            {modelInfo?.prt_source === "smartphones" && (
                              <p className={`text-[9px] font-bold mt-2 px-2 text-center max-w-sm mx-auto leading-snug ${modelInfo.prt_stale ? "text-amber-600 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                                {modelInfo.prt_stale
                                  ? "PRT catalogue — index daté de plus de 30 j. (indicatif, resync automatique côté serveur)."
                                  : "PRT catalogue TEKH+ (médiane eBay × facteur Afrique)."}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 w-full">
                            {returnToDealId && isStep1Complete && finalPrice != null && (
                              <Button
                                onClick={() => {
                                  const condition =
                                    ecranState === "parfait" && chassisState === "intact"
                                      ? ("like_new" as const)
                                      : ecranState === "casse"
                                        ? ("damaged" as const)
                                        : ("good" as const);
                                  setLastSimulation({
                                    model: `${brand} ${model}`,
                                    condition,
                                    storage: storage ?? undefined,
                                    battery:
                                      batterieState === "gte90" || batterieState === "gte80_89"
                                        ? "good"
                                        : batterieState === "gte70_79" || batterieState === "gte60_69"
                                          ? "medium"
                                          : "low",
                                    estimated: finalPrice,
                                  });
                                  navigate(`/deal/${returnToDealId}`, { replace: true });
                                }}
                                className="w-full h-14 rounded-2xl bg-[#064e3b] dark:bg-[#059669] text-white font-black text-sm uppercase tracking-tight hover:scale-[1.01] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                <ArrowLeft className="h-5 w-5" /> Retour au deal avec cette estimation
                              </Button>
                            )}
                            <Button
                              disabled={!isStep1Complete}
                              onClick={() => {
                                setStep("satisfaction");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full h-14 rounded-2xl bg-[#00FF41] text-black font-black text-sm uppercase tracking-tight hover:scale-[1.01] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-[#00FF41]/20"
                            >
                              Continuer l'estimation
                            </Button>
                          </div>
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
                ecranState={ecranState}
                chassisState={chassisState}
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
