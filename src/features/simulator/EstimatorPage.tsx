import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRightLeft,
  ArrowLeft,
  RotateCcw,
  Loader2,
} from "lucide-react";

// Sub-components
import { IdentityStep } from "./components/IdentityStep";
import { ConditionStep, type ScreenCondition, type ChassisCondition, type BatteryCondition, type FunctionalityIssue } from "./components/ConditionStep";
import { BooleanQuestionsStep, type BooleanAnswers, type InconsistencyFlag } from "./components/BooleanQuestionsStep";
import { SatisfactionStep } from "./components/SatisfactionStep";
import { TargetSelectionStep } from "./components/TargetSelectionStep";
import { ComparisonStep } from "./components/ComparisonStep";
import { PhotoStep, type PhotoSlot } from "./components/PhotoStep";
import { usePWA } from "@/shared/hooks/usePWA";
import { useDeals } from "@/features/marketplace/deals.context";
import { loadJson, saveJson } from "@/core/pwa/tekhSession";
import { analyzePhoneImage, type PhoneAnalysisResult } from "@/core/api/analyzePhone";
import { assessConditionWithCache } from "@/core/api/assessCondition";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

// ─── Session schema v2 ────────────────────────────────────────────────────────
interface EstimatorSessionV2 {
  v: 2;
  step: "estimation" | "satisfaction" | "target_selection" | "comparison";
  brand: string;
  model: string;
  storage: number | null;
  ram: number | null;
  screenCondition: string;
  chassisCondition: string;
  batteryCondition: string;
  functionalityIssues: string[];
  booleanAnswers: BooleanAnswers;
  userDescription: string;
  exchangeType: "upgrade" | "downgrade" | "";
  targetBrand: string;
  targetModel: string;
  targetStorage: number | null;
  isSatisfied: boolean | null;
  proposedPrice: string;
  detectionStep: "detecting" | "manual" | "confirmed";
}

// ─── Condition mappings ───────────────────────────────────────────────────────
function mapScreen(sc: ScreenCondition | ""): EcranTekh | "" {
  if (sc === "comme_neuf") return "parfait";
  if (sc === "micro_rayures") return "raye";
  if (sc === "fissure") return "raye";
  if (sc === "casse") return "casse";
  return "";
}
function mapChassis(cc: ChassisCondition | ""): ChassisTekh | "" {
  if (cc === "excellent" || cc === "rayures_legeres") return "intact";
  if (cc === "endommage") return "abime";
  return "";
}
function mapBattery(bc: BatteryCondition | ""): BatterieTekh | "" {
  if (bc === "tient_bien") return "gte90";
  if (bc === "se_decharge") return "gte70_79";
  if (bc === "a_remplacer") return "lt60";
  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EstimatorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLastSimulation } = useDeals();
  const isPWA = usePWA();
  const returnToDealId = (location.state as { returnToDealId?: string } | null)?.returnToDealId;

  // Identity
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<number | null>(null);
  const [ram, setRam] = useState<number | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingStorages, setLoadingStorages] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<any[]>([]);
  const [modelInfo, setModelInfoData] = useState<any>(null);
  const basePrice = modelInfo?.base_price_fcfa ?? null;

  // New condition states (raw vocabulary)
  const [screenCondition, setScreenCondition] = useState<ScreenCondition | "">("");
  const [chassisCondition, setChassisCondition] = useState<ChassisCondition | "">("");
  const [batteryCondition, setBatteryCondition] = useState<BatteryCondition | "">("");
  const [functionalityIssues, setFunctionalityIssues] = useState<FunctionalityIssue[]>([]);
  const [booleanAnswers, setBooleanAnswers] = useState<BooleanAnswers>({
    power_on: null, touch_ok: null, charging_ok: null, biometric_ok: null,
  });
  const [userDescription, setUserDescription] = useState("");

  // AI enrichment
  const [aiAdjustment, setAiAdjustment] = useState(0);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiEnrichmentLoading, setAiEnrichmentLoading] = useState(false);
  const [aiEnrichmentFailed, setAiEnrichmentFailed] = useState(false);

  // Photos (optional, non-blocking)
  const [imageSlots, setImageSlots] = useState<Record<PhotoSlot, string | null>>({
    front: null, back: null, side1: null, side2: null,
  });
  const [analysisResults, setAnalysisResults] = useState<Record<PhotoSlot, PhoneAnalysisResult | null>>({
    front: null, back: null, side1: null, side2: null,
  });
  const [analyzingSlots, setAnalyzingSlots] = useState<Record<PhotoSlot, boolean>>({
    front: false, back: false, side1: false, side2: false,
  });
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    side1: useRef<HTMLInputElement>(null),
    side2: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: PhotoSlot) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImageSlots(prev => ({ ...prev, [slot]: previewUrl }));
    setAnalysisResults(prev => ({ ...prev, [slot]: null }));
    (window as any)[`file_${slot}`] = file;
  };

  const performAnalysis = async (slot: PhotoSlot) => {
    const file = (window as any)[`file_${slot}`];
    if (!file || !isSupabaseConfigured) return;
    setAnalyzingSlots(prev => ({ ...prev, [slot]: true }));
    try {
      const result = await analyzePhoneImage(
        file,
        slot === "front" ? "front" : slot === "back" ? "back" : "side",
        brand || "Smartphone"
      );
      setAnalysisResults(prev => ({ ...prev, [slot]: result }));
    } catch (error) {
      console.error("Photo analysis error:", error);
      toast({ title: "Analyse photo échouée", description: "Vérifiez votre connexion.", variant: "destructive" });
    } finally {
      setAnalyzingSlots(prev => ({ ...prev, [slot]: false }));
    }
  };

  const removeImage = (slot: PhotoSlot) => {
    setImageSlots(prev => ({ ...prev, [slot]: null }));
    setAnalysisResults(prev => ({ ...prev, [slot]: null }));
  };

  // Workflow
  const [step, setStep] = useState<"estimation" | "satisfaction" | "target_selection" | "comparison">("estimation");
  const [isSatisfied, setIsSatisfied] = useState<boolean | null>(null);
  const [proposedPrice, setProposedPrice] = useState("");
  const [exchangeType, setExchangeType] = useState<"upgrade" | "downgrade" | "">("");
  const [detectionStep, setDetectionStep] = useState<"detecting" | "manual" | "confirmed">("manual");

  // Target device
  const [targetBrand, setTargetBrand] = useState("");
  const [targetModels, setTargetModels] = useState<string[]>([]);
  const [targetModel, setTargetModel] = useState("");
  const [targetVariants, setTargetVariants] = useState<any[]>([]);
  const [targetStorage, setTargetStorage] = useState<number | null>(null);
  const [targetModelInfo, setTargetModelInfo] = useState<any>(null);
  const [loadingTargetModels, setLoadingTargetModels] = useState(false);
  const [loadingTargetVariants, setLoadingTargetVariants] = useState(false);

  // ─── Resolved condition (mapping + boolean overrides) ──────────────────────
  const resolvedCondition = useMemo(() => {
    let ecran = mapScreen(screenCondition);
    let chassis = mapChassis(chassisCondition);
    let batterie = mapBattery(batteryCondition);
    const flags: InconsistencyFlag[] = [];
    let isNonFonctionnel = false;

    if (booleanAnswers.power_on === false) {
      isNonFonctionnel = true;
      flags.push("appareil_non_fonctionnel");
    }
    if (booleanAnswers.touch_ok === false && ecran !== "casse") {
      ecran = "casse";
      flags.push("incoherence_ecran_tactile");
    }
    if (booleanAnswers.charging_ok === false) {
      batterie = "lt60";
      flags.push("incoherence_batterie_charge");
    }

    return { ecran, chassis, batterie, flags, isNonFonctionnel };
  }, [screenCondition, chassisCondition, batteryCondition, booleanAnswers]);

  // ─── Price calculation ──────────────────────────────────────────────────────
  const finalPriceValue = useMemo(() => {
    if (resolvedCondition.isNonFonctionnel) return 0;
    if (!basePrice || !resolvedCondition.ecran || !resolvedCondition.chassis || !resolvedCondition.batterie) return null;
    return calculerEstimation(
      basePrice, brand, modelInfo?.release_year || 2021,
      { ecran: resolvedCondition.ecran as EcranTekh, chassis: resolvedCondition.chassis as ChassisTekh, batterie: resolvedCondition.batterie as BatterieTekh },
      model
    );
  }, [basePrice, brand, modelInfo, resolvedCondition, model]);

  const adjustedFinalPrice = useMemo(() => {
    if (resolvedCondition.isNonFonctionnel) return 0;
    if (finalPriceValue === null) return null;
    if (aiAdjustment === 0 || aiConfidence === null || aiConfidence < 0.5) return finalPriceValue;
    const capped = Math.max(-0.10, Math.min(0.10, aiAdjustment / 100));
    return Math.round(finalPriceValue * (1 + capped));
  }, [finalPriceValue, aiAdjustment, aiConfidence, resolvedCondition.isNonFonctionnel]);

  useEffect(() => {
    if (adjustedFinalPrice !== null) setProposedPrice(adjustedFinalPrice.toString());
  }, [adjustedFinalPrice]);

  // ─── Gate conditions ────────────────────────────────────────────────────────
  const isRamSatisfied = rams.length === 0 ? true : Boolean(ram);
  const isIdentityComplete = Boolean(brand && model && storage && isRamSatisfied);
  const isAllMandatoryAnswered = Object.values(booleanAnswers).every(v => v !== null);
  const isStep1Complete = Boolean(
    isIdentityComplete && screenCondition && chassisCondition &&
    batteryCondition && functionalityIssues.length > 0 && isAllMandatoryAnswered
  );

  // ─── AI enrichment trigger ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isStep1Complete) return;
    const hasIssues = functionalityIssues.some(f => f !== "tout_ok");
    if (!hasIssues && !userDescription.trim()) return;
    setAiEnrichmentLoading(true);
    setAiEnrichmentFailed(false);
    assessConditionWithCache({
      device: { brand, model, storage, ram },
      condition: {
        screen: screenCondition,
        chassis: chassisCondition,
        battery: batteryCondition,
        functionalities: functionalityIssues,
        booleans: booleanAnswers,
      },
      user_description: userDescription,
    })
      .then(r => {
        setAiAdjustment(r.adjustment ?? 0);
        setAiConfidence(r.confidence_score ?? null);
      })
      .catch(() => {
        setAiEnrichmentFailed(true);
        setAiAdjustment(0);
      })
      .finally(() => setAiEnrichmentLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStep1Complete, userDescription, JSON.stringify(functionalityIssues)]);

  // ─── Session persistence ────────────────────────────────────────────────────
  const estimatorRestoredRef = useRef(false);
  useLayoutEffect(() => {
    if (estimatorRestoredRef.current) return;
    const s = loadJson<EstimatorSessionV2>("estimator-v1", false);
    if (!s || s.v !== 2) return;
    estimatorRestoredRef.current = true;
    setStep(s.step);
    if (s.brand) setBrand(s.brand);
    if (s.model) setModel(s.model);
    if (s.storage != null) setStorage(s.storage);
    if (s.ram != null) setRam(s.ram);
    if (s.screenCondition) setScreenCondition(s.screenCondition as ScreenCondition);
    if (s.chassisCondition) setChassisCondition(s.chassisCondition as ChassisCondition);
    if (s.batteryCondition) setBatteryCondition(s.batteryCondition as BatteryCondition);
    if (s.functionalityIssues?.length) setFunctionalityIssues(s.functionalityIssues as FunctionalityIssue[]);
    if (s.booleanAnswers) setBooleanAnswers(s.booleanAnswers);
    if (s.userDescription) setUserDescription(s.userDescription);
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
      saveJson<EstimatorSessionV2>("estimator-v1", {
        v: 2, step, brand, model, storage, ram,
        screenCondition, chassisCondition, batteryCondition,
        functionalityIssues, booleanAnswers, userDescription,
        exchangeType, targetBrand, targetModel, targetStorage,
        isSatisfied, proposedPrice, detectionStep,
      }, false);
    }, 700);
    return () => clearTimeout(t);
  }, [
    step, brand, model, storage, ram,
    screenCondition, chassisCondition, batteryCondition,
    functionalityIssues, booleanAnswers, userDescription,
    exchangeType, targetBrand, targetModel, targetStorage,
    isSatisfied, proposedPrice, detectionStep,
  ]);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        setBrands(await fetchBrands());
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!brand) return;
    (async () => {
      try {
        setLoadingModels(true);
        setModels(await fetchModels(brand));
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
        setTargetModels(await fetchModels(targetBrand));
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
        setTargetModelInfo(info ?? { base_price_fcfa: 600000, release_year: 2022, equivalence_class: "B" });
      } catch {
        setTargetModelInfo({ base_price_fcfa: 600000, release_year: 2022, equivalence_class: "B" });
      } finally {
        setLoadingTargetVariants(false);
      }
    })();
  }, [targetBrand, targetModel]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  // ─── Progress indicator ─────────────────────────────────────────────────────
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
              {idx < steps.length - 1 && <div className="w-1.5 h-px bg-slate-200 dark:bg-white/10" />}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] font-sans pb-32">
      {/* Header Premium — Floating & Detached */}
      <div className="sticky top-14 md:top-20 z-50 px-4">
        <div className="max-w-xl mx-auto bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-slate-100 dark:border-white/10 shadow-lg rounded-2xl h-12 relative flex items-center px-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === "estimation" ? navigate("/") : setStep("estimation")}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 h-8 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-[10px] font-black uppercase tracking-tight">Retour</span>
          </Button>

          {/* Centrage absolu garanti, indépendant des largeurs des boutons */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="text-[10px] font-black tracking-tight uppercase italic text-black dark:text-white">Estimateur</span>
            <span className="text-[10px] font-black tracking-tight uppercase italic text-blue-600 dark:text-primary">TEKH+</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 h-8 w-8 p-0 ml-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        {renderProgress()}

        {/* ── STEP: ESTIMATION ── */}
        {step === "estimation" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Section 1: Identity */}
            <IdentityStep
              brand={brand} setBrand={setBrand}
              model={model} setModel={setModel}
              storage={storage} setStorage={setStorage}
              ram={ram} setRam={setRam}
              brands={brands} models={models} storages={storages} rams={rams}
              loadingBrands={loadingBrands} loadingModels={loadingModels} loadingStorages={false}
            />

            {isIdentityComplete && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-0">
                {/* Section 2: Condition */}
                <ConditionStep
                  screenCondition={screenCondition} setScreenCondition={setScreenCondition}
                  chassisCondition={chassisCondition} setChassisCondition={setChassisCondition}
                  batteryCondition={batteryCondition} setBatteryCondition={setBatteryCondition}
                  functionalityIssues={functionalityIssues} setFunctionalityIssues={setFunctionalityIssues}
                />

                {/* Section 3: Boolean questions + description */}
                <BooleanQuestionsStep
                  answers={booleanAnswers} setAnswers={setBooleanAnswers}
                  userDescription={userDescription} setUserDescription={setUserDescription}
                  inconsistencyFlags={resolvedCondition.flags}
                />

                {/* Section 4: Photos (optional) */}
                <PhotoStep
                  imageSlots={imageSlots}
                  analysisResults={analysisResults}
                  analyzingSlots={analyzingSlots}
                  fileInputRefs={fileInputRefs}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                  performAnalysis={performAnalysis}
                />

                {/* Price card (visible as soon as mandatory fields are complete) */}
                <div className={cn(
                  "transition-all duration-700 overflow-hidden",
                  isStep1Complete && adjustedFinalPrice !== null
                    ? "max-h-[800px] opacity-100 translate-y-0 mt-8"
                    : "max-h-0 opacity-0 translate-y-4 pointer-events-none"
                )}>
                  {adjustedFinalPrice !== null && (
                    <div className="space-y-4">
                      {/* Main price card */}
                      <div className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-gradient-to-b from-green-500/10 to-transparent dark:from-[#00FF41]/10 border-2 border-[#00FF41]/20 shadow-2xl shadow-[#00FF41]/5 text-center">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 italic">Valeur de Reprise Estimée</h3>
                        <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 flex items-baseline gap-2 italic">
                          {adjustedFinalPrice === 0
                            ? "0"
                            : formatCFA(adjustedFinalPrice).replace("FCFA", "")}
                          <span className="text-xl opacity-50 font-sans not-italic">XOF</span>
                        </div>

                        {adjustedFinalPrice === 0 && (
                          <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 mb-3">
                            Appareil non fonctionnel — reprise non possible
                          </p>
                        )}

                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                          <ShieldCheck className="w-5 h-5 text-[#00FF41]" />
                          <p className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                            Certification Charte TEKH+ <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </p>
                        </div>
                      </div>

                      {/* AI enrichment badge */}
                      {aiEnrichmentLoading && (
                        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Affinage IA en cours...
                        </div>
                      )}
                      {!aiEnrichmentLoading && aiAdjustment !== 0 && !aiEnrichmentFailed && (
                        <div className={cn(
                          "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit mx-auto border",
                          aiAdjustment > 0
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}>
                          {aiAdjustment > 0
                            ? <TrendingUp className="w-3 h-3" />
                            : <TrendingDown className="w-3 h-3" />}
                          IA : {aiAdjustment > 0 ? "+" : ""}{aiAdjustment}% appliqué
                        </div>
                      )}

                      {adjustedFinalPrice > 0 && (
                        <Button
                          onClick={() => {
                            setStep("satisfaction");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="group w-full h-16 rounded-[1.5rem] bg-[#00FF41] hover:bg-[#00D737] text-black font-black text-lg uppercase tracking-tighter italic shadow-xl shadow-[#00FF41]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Valider cette offre
                            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                          </span>
                        </Button>
                      )}

                      {returnToDealId && adjustedFinalPrice > 0 && (
                        <Button
                          onClick={() => {
                            const condition =
                              resolvedCondition.ecran === "parfait" && resolvedCondition.chassis === "intact"
                                ? ("like_new" as const)
                                : resolvedCondition.ecran === "casse"
                                  ? ("damaged" as const)
                                  : ("good" as const);
                            setLastSimulation({ model, storage: storage || undefined, estimated: adjustedFinalPrice, condition });
                            navigate(`/deal/${returnToDealId}`);
                          }}
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-bold uppercase tracking-tight"
                        >
                          Appliquer au Deal
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Hint while mandatory fields are still incomplete */}
                {!isStep1Complete && (
                  <div className="mt-6 flex flex-col items-center p-6 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center leading-loose">
                      Complétez les sections ci-dessus <br />
                      <span className="text-blue-600 dark:text-primary">pour débloquer l'estimation</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP: SATISFACTION ── */}
        {step === "satisfaction" && (
          <SatisfactionStep
            finalPrice={adjustedFinalPrice}
            formatCFA={formatCFA}
            isSatisfied={isSatisfied}
            setIsSatisfied={setIsSatisfied}
            setStep={setStep}
            proposedPrice={proposedPrice}
            setProposedPrice={setProposedPrice}
            isPWA={isPWA}
            brand={brand}
            model={model}
            storage={storage}
            ram={ram}
            ecranState={resolvedCondition.ecran}
            chassisState={resolvedCondition.chassis}
            batterieState={resolvedCondition.batterie}
          />
        )}

        {/* ── STEP: TARGET SELECTION ── */}
        {step === "target_selection" && (
          <TargetSelectionStep
            exchangeType={exchangeType} setExchangeType={setExchangeType}
            targetBrand={targetBrand} setTargetBrand={setTargetBrand}
            brands={brands}
            targetModel={targetModel} setTargetModel={setTargetModel}
            targetModels={targetModels} loadingTargetModels={loadingTargetModels}
            targetStorage={targetStorage} setTargetStorage={setTargetStorage}
            targetVariants={targetVariants}
            setStep={setStep}
          />
        )}

        {/* ── STEP: COMPARISON ── */}
        {step === "comparison" && (
          <ComparisonStep
            brand={brand} model={model}
            finalPrice={adjustedFinalPrice}
            targetBrand={targetBrand} targetModel={targetModel}
            targetModelInfo={targetModelInfo}
            storage={storage}
            ecranState={resolvedCondition.ecran as EcranTekh | ""}
            chassisState={resolvedCondition.chassis as ChassisTekh | ""}
            batterieState={resolvedCondition.batterie as BatterieTekh | ""}
            targetStorage={targetStorage}
            formatCFA={formatCFA}
            isPWA={isPWA}
          />
        )}
      </div>
    </div>
  );
}
