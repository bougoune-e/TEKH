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
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRightLeft,
  X,
  Plus,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Search
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Sub-components
import { IdentityStep } from "./components/IdentityStep";
import { DiagnosticStep } from "./components/DiagnosticStep";
import { SatisfactionStep } from "./components/SatisfactionStep";
import { TargetSelectionStep } from "./components/TargetSelectionStep";
import { ComparisonStep } from "./components/ComparisonStep";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { PhotoStep, type PhotoSlot } from "./components/PhotoStep";
import { usePWA } from "@/shared/hooks/usePWA";
import { useDeals } from "@/features/marketplace/deals.context";
import { loadJson, saveJson } from "@/core/pwa/tekhSession";
import { analyzePhoneImage, type PhoneAnalysisResult } from "@/core/api/analyzePhone";
import { detectDevice, predictVariants, getDeviceModelFromClientHints } from "@/core/api/deviceFinder";

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

  // Multi-slot image state for the "Rapport Photo"
  const [imageSlots, setImageSlots] = useState<Record<PhotoSlot, string | null>>({
    front: null,
    back: null,
    side1: null,
    side2: null,
  });
  const [analysisResults, setAnalysisResults] = useState<Record<PhotoSlot, PhoneAnalysisResult | null>>({
    front: null,
    back: null,
    side1: null,
    side2: null,
  });
  const [analyzingSlots, setAnalyzingSlots] = useState<Record<PhotoSlot, boolean>>({
    front: false,
    back: false,
    side1: false,
    side2: false,
  });

  const isAllPhotosAnalyzed = useMemo(() => {
    return Object.values(analysisResults).every(r => r !== null && r.isClear);
  }, [analysisResults]);

  const hasBrandMismatch = useMemo(() => {
    return Object.values(analysisResults).some(r => r?.isMatch === false);
  }, [analysisResults]);

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
    side1: useRef<HTMLInputElement>(null),
    side2: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: PhotoSlot) => {
    const file = e.target.files?.[0];
    if (!file || !isSupabaseConfigured) return;

    // Set local preview
    const previewUrl = URL.createObjectURL(file);
    setImageSlots(prev => ({ ...prev, [slot]: previewUrl }));

    // Start AI analysis
    setAnalyzingSlots(prev => ({ ...prev, [slot]: true }));
    setAnalysisResults(prev => ({ ...prev, [slot]: null }));

    try {
      const result = await analyzePhoneImage(
        file,
        slot === "front" ? "front" : (slot === "back" ? "back" : "side"),
        brand || "Smartphone"
      );

      setAnalysisResults(prev => ({ ...prev, [slot]: result }));

      // Auto-update global state if AI is confident and clear
      if (result.isClear && result.isMatch && result.confiance > 75) {
        if (slot === "front" && result.ecran === "casse") {
          setEcranState("casse");
        } else if ((slot === "back" || slot === "side1" || slot === "side2") && result.chassis === "abime") {
          setChassisState("abime");
        }
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser la photo. Vérifiez votre connexion.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingSlots(prev => ({ ...prev, [slot]: false }));
    }
  };

  const removeImage = (slot: PhotoSlot) => {
    setImageSlots(prev => ({ ...prev, [slot]: null }));
    setAnalysisResults(prev => ({ ...prev, [slot]: null }));
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

  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!brand || !step) return;
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
    if (!brand || !model) return;
    (async () => {
      try {
        setLoadingStorages(true);
        setModelInfoData(null);
        const variants = await getAvailableVariants(brand, model);
        setAvailableVariants(variants);
        const sList = [...new Set(variants.map(v => v.storage_gb))].sort((a, b) => a - b);
        setStorages(sList);
        if (sList.length === 1) setStorage(sList[0]);
      } finally {
        setLoadingStorages(false);
      }
    })();
  }, [brand, model]);

  // Load model info (price) once storage is confirmed
  useEffect(() => {
    if (!brand || !model || !storage) return;
    (async () => {
      const info = await getModelInfo(brand, model, storage);
      setModelInfoData(info);
    })();
  }, [brand, model, storage]);

  useEffect(() => {
    if (!storage || availableVariants.length === 0) return;
    const rList = [...new Set(
      availableVariants
        .filter(v => v.storage_gb === storage)
        .map(v => v.ram_gb)
        .filter((r): r is number => r !== null && Number.isFinite(r) && r > 0)
    )].sort((a, b) => a - b);
    setRams(rList);
    if (rList.length === 1) setRam(rList[0]);
  }, [storage, availableVariants]);

  useEffect(() => {
    if (!targetBrand) return;
    (async () => {
      try {
        setLoadingTargetModels(true);
        const list = await fetchModels(targetBrand);
        setTargetModels(list);
      } finally {
        setLoadingTargetModels(false);
      }
    })();
  }, [targetBrand]);

  useEffect(() => {
    if (!targetBrand || !targetModel) return;
    (async () => {
      try {
        setLoadingTargetVariants(true);
        const variants = await getAvailableVariants(targetBrand, targetModel);
        setTargetVariants(variants);
        const firstStorage = variants[0]?.storage_gb ?? 0;
        const info = await getModelInfo(targetBrand, targetModel, firstStorage);
        if (info) {
          setTargetModelInfo(info);
        } else {
          setTargetModelInfo({ base_price_fcfa: 600000, release_year: 2022, equivalence_class: "B" });
        }
      } catch (e: any) {
        setTargetModelInfo({ base_price_fcfa: 600000, release_year: 2022, equivalence_class: "B" });
      } finally {
        setLoadingTargetVariants(false);
      }
    })();
  }, [targetBrand, targetModel]);

  const finalPriceValue = useMemo(() => {
    if (!basePrice || !ecranState || !chassisState || !batterieState) return null;

    const diagnostics = {
      ecran: ecranState,
      chassis: chassisState,
      batterie: batterieState,
    };

    return calculerEstimation(basePrice, brand, modelInfo?.release_year || 2021, diagnostics, model);
  }, [basePrice, brand, modelInfo, ecranState, chassisState, batterieState]);

  useEffect(() => {
    if (finalPriceValue !== null) {
      setProposedPrice(finalPriceValue.toString());
    }
  }, [finalPriceValue]);

  const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  const isRamSatisfied = rams.length === 0 ? true : Boolean(ram);
  const isIdentityComplete = Boolean(brand && model && storage && isRamSatisfied);
  const isStep1Complete = Boolean(isIdentityComplete && ecranState && chassisState && batterieState && isAllPhotosAnalyzed);

  const renderProgress = () => {
    const steps = [
      { id: "estimation", label: "Diagnostic" },
      { id: "satisfaction", label: "Valeur" },
      { id: "target_selection", label: "Cible" },
      { id: "comparison", label: "Accord" },
    ];

    const currentIndex = steps.findIndex(s => s.id === step);

    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/50 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/5 mx-auto w-fit mb-8">
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isDone = currentIndex > idx;

          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                isActive ? "bg-blue-600 dark:bg-primary scale-125 shadow-lg shadow-blue-500/20" :
                  isDone ? "bg-green-500" : "bg-slate-300 dark:bg-zinc-700"
              )} />
              {isActive && (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white mr-1 italic">
                  {s.label}
                </span>
              )}
              {idx < steps.length - 1 && (
                <div className="w-1.5 h-px bg-slate-200 dark:bg-white/10" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] font-sans pb-32">
      {/* Header Premium */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === "estimation" ? navigate("/") : setStep("estimation")}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Retour</span>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Estimateur TEKH+</h1>
            <p className="text-[8px] font-bold text-blue-600 dark:text-primary tracking-widest uppercase">Version 2.0 • IA Intégrée</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        {renderProgress()}

        {step === "estimation" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <IdentityStep
              brand={brand} setBrand={setBrand}
              model={model} setModel={setModel}
              storage={storage} setStorage={setStorage}
              ram={ram} setRam={setRam}
              brands={brands} models={models} storages={storages} rams={rams}
              loadingBrands={loadingBrands} loadingModels={loadingModels} loadingStorages={loadingStorages}
            />

            {isIdentityComplete && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <DiagnosticStep
                  ecranState={ecranState} setEcranState={setEcranState}
                  chassisState={chassisState} setChassisState={setChassisState}
                  batterieState={batterieState} setBatterieState={setBatterieState}
                />

                <PhotoStep
                  imageSlots={imageSlots}
                  analysisResults={analysisResults}
                  analyzingSlots={analyzingSlots}
                  fileInputRefs={fileInputRefs}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                />

                {/* ESTIMATION INDICATIVE — Gatekeeper logic (Shown only after analysis) */}
                <div className={cn(
                  "transition-all duration-1000 overflow-hidden",
                  isAllPhotosAnalyzed ? "max-h-[800px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-8 pointer-events-none"
                )}>
                  {proposedPrice && (
                    <div className="mt-8 space-y-4">
                      <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-gradient-to-b from-green-500/10 to-transparent dark:from-[#00FF41]/10 border-2 border-[#00FF41]/20 shadow-2xl shadow-[#00FF41]/5 text-center">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 italic">Valeur de Reprise Estimée</h3>
                        <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 flex items-baseline gap-2 italic">
                          {formatCFA(parseInt(proposedPrice)).replace("FCFA", "")}
                          <span className="text-xl opacity-50 font-sans not-italic">XOF</span>
                        </div>

                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md">
                          <ShieldCheck className="w-5 h-5 text-[#00FF41]" />
                          <p className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                            Certification Chartre TEKH+ <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </p>
                        </div>
                      </div>

                      {hasBrandMismatch && (
                        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">Attention concordance marque</h4>
                            <p className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 leading-relaxed mt-1 italic">
                              L'IA suggère que l'appareil en photo pourrait être différent de la marque choisie ({brand}).
                              L'offre pourra être révisée lors de l'inspection physique.
                            </p>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          setStep("satisfaction");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group w-full h-16 rounded-[1.5rem] bg-[#00FF41] hover:bg-[#00D737] text-black font-black text-lg uppercase tracking-tighter italic shadow-xl shadow-[#00FF41]/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Valider cette offre
                          <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        </span>
                      </Button>
                    </div>
                  )}
                </div>

                {!isAllPhotosAnalyzed && (
                  <div className="mt-8 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/20 opacity-60">
                    <Loader2 className="w-10 h-10 text-blue-600/30 dark:text-[#00FF41]/30 animate-spin mb-4" />
                    <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center leading-loose">
                      Veuillez compléter le <br />
                      <span className="text-blue-600 dark:text-[#00FF41]">Rapport Photo Obligatoire</span> <br />
                      pour débloquer la valeur
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {returnToDealId && isStep1Complete && finalPriceValue != null && (
                    <Button
                      onClick={() => {
                        const condition =
                          ecranState === "parfait" && chassisState === "intact"
                            ? ("like_new" as const)
                            : ecranState === "casse"
                              ? ("damaged" as const)
                              : ("good" as const);
                        setLastSimulation({
                          model,
                          storage: storage || undefined,
                          estimated: finalPriceValue,
                          condition,
                        });
                        navigate(`/marketplace/deal/${returnToDealId}`);
                      }}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-bold uppercase tracking-tight"
                    >
                      Appliquer au Deal
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "satisfaction" && (
          <SatisfactionStep
            finalPrice={finalPriceValue}
            formatCFA={formatCFA}
            isSatisfied={isSatisfied}
            setIsSatisfied={setIsSatisfied}
            setStep={setStep}
            proposedPrice={proposedPrice}
            setProposedPrice={setProposedPrice}
            isPWA={isPWA}
          />
        )}

        {step === "target_selection" && (
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
        )}

        {step === "comparison" && (
          <ComparisonStep
            brand={brand}
            model={model}
            finalPrice={finalPriceValue}
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
      </div>
    </div>
  );
}
