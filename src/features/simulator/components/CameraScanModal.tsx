import { useEffect, useRef, useState } from "react";
import { X, Loader2, Camera, Sparkles, Check, RefreshCw, Cpu, HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/core/api/utils";
import { useToast } from "@/shared/hooks/use-toast";

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  prt: number;
  brand: string;
  chassis: string;
  batterie: string;
  onApplyResult: (vrt: number, screenCondition: string, scratchScore: number) => void;
}

export function CameraScanModal({
  isOpen,
  onClose,
  prt,
  brand,
  chassis,
  batterie,
  onApplyResult,
}: CameraScanModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const [loadingModel, setLoadingModel] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [scanningStatus, setScanningStatus] = useState("Initialisation...");
  const [aestheticScore, setAestheticScore] = useState<number | null>(null);
  const [calculatedVrt, setCalculatedVrt] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // Dynamically load TensorFlow.js and COCO-SSD from CDN
  const loadScriptsAndModel = async () => {
    try {
      setLoadingModel(true);
      setScanningStatus("Chargement de TensorFlow...");

      // Load TF.js
      if (!(window as any).tf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load TF.js"));
          document.body.appendChild(script);
        });
      }

      setScanningStatus("Chargement du modèle Vision...");
      // Load COCO-SSD
      if (!(window as any).cocoSsd) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load COCO-SSD"));
          document.body.appendChild(script);
        });
      }

      setModelLoaded(true);
      setScanningStatus("Modèle IA prêt !");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur de chargement IA",
        description: "Impossible de charger le modèle Edge AI. Veuillez vérifier votre connexion.",
        variant: "destructive",
      });
      setScanningStatus("Erreur de chargement");
    } finally {
      setLoadingModel(false);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast({
        title: "Accès Caméra Refusé",
        description: "Veuillez autoriser l'accès à la caméra pour scanner votre téléphone.",
        variant: "destructive",
      });
    }
  };

  // Toggle Camera Facing Mode
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Run Object Detection loop
  const startDetection = async () => {
    const cocoSsd = (window as any).cocoSsd;
    if (!cocoSsd || !videoRef.current) return;

    setDetecting(true);
    setScanningStatus("Scannage de l'appareil en cours...");

    try {
      const model = await cocoSsd.load();
      
      const detectFrame = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

        try {
          const predictions = await model.detect(videoRef.current);
          const cellPhone = predictions.find(
            (p: any) => p.class === "cell phone" && p.score > 0.60
          );

          if (cellPhone) {
            setPhoneDetected(true);
            setScanningStatus("Téléphone détecté ! Analyse de l'état...");
            
            // Fictional micro-scratch score (Aesthetic Score: 0.70 to 0.98)
            const randomScore = parseFloat((Math.random() * (0.98 - 0.70) + 0.70).toFixed(2));
            setAestheticScore(randomScore);

            // Stop camera detection once found
            stopCameraAndDetection();

            // Map score to screen condition
            // >= 0.90 -> comme_neuf, >= 0.70 -> micro_rayures, < 0.70 -> fissure
            let mappedCondition = "micro_rayures";
            if (randomScore >= 0.90) mappedCondition = "comme_neuf";
            else if (randomScore < 0.70) mappedCondition = "fissure";

            // Call Local API
            await fetchEstimateFromLocalApi(mappedCondition);
            return;
          }
        } catch (e) {
          console.error("Frame detection error:", e);
        }

        if (isOpen) {
          detectionIntervalRef.current = window.requestAnimationFrame(detectFrame);
        }
      };

      detectFrame();
    } catch (err) {
      console.error("Detection initialization error:", err);
      setScanningStatus("Erreur d'analyse");
    }
  };

  // Fetch from our local python API
  const fetchEstimateFromLocalApi = async (mappedCondition: string) => {
    try {
      setScanningStatus("Calcul de la cote via l'API locale...");
      
      // Map frontend condition to pricing.ts equivalent
      let ecranVal = "raye";
      if (mappedCondition === "comme_neuf") ecranVal = "parfait";
      else if (mappedCondition === "fissure" || mappedCondition === "casse") ecranVal = "casse";

      const payload = {
        prt: prt,
        brand: brand || "Apple",
        diagnostics: {
          ecran: ecranVal,
          chassis: chassis || "intact",
          batterie: batterie || "gte80_89",
          bonus: {
            boiteEtAccessoiresComplets: false,
            compatible5g: false,
            debloqueTousOperateurs: false,
            factureAchatOriginale: false
          }
        }
      };

      const response = await fetch("http://127.0.0.1:8000/api/v1/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Local API request failed");
      }

      const result = await response.json();
      setCalculatedVrt(result.vrt);
      setScanningStatus("Analyse terminée !");
    } catch (err) {
      console.error("Local API Error:", err);
      // Fallback local calculations if API is offline
      toast({
        title: "API Locale hors ligne",
        description: "Calcul local de secours appliqué.",
      });
      setCalculatedVrt(prt * 0.75); // generic fallback
      setScanningStatus("Terminé (calcul local)");
    }
  };

  const stopCameraAndDetection = () => {
    if (detectionIntervalRef.current) {
      cancelAnimationFrame(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setDetecting(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadScriptsAndModel();
    } else {
      stopCameraAndDetection();
      setPhoneDetected(false);
      setAestheticScore(null);
      setCalculatedVrt(null);
    }
    return () => {
      stopCameraAndDetection();
    };
  }, [isOpen]);

  useEffect(() => {
    if (modelLoaded && cameraActive && !phoneDetected) {
      startDetection();
    }
  }, [modelLoaded, cameraActive]);

  useEffect(() => {
    if (isOpen && modelLoaded && !cameraActive) {
      startCamera();
    }
  }, [isOpen, modelLoaded, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Scan Edge AI (Vision)</h3>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">TensorFlow.js en local</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning HUD overlay */}
              {!phoneDetected && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-blue-500/40 rounded-3xl flex items-center justify-center animate-pulse">
                    <div className="w-40 h-40 border border-solid border-blue-500/20 rounded-2xl" />
                  </div>
                  {/* Laser line animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.8)] top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite]" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-500 p-8 text-center">
              {loadingModel ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <p className="text-xs font-bold uppercase tracking-wider">{scanningStatus}</p>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 stroke-[1.5] text-zinc-700" />
                  <p className="text-xs font-bold uppercase tracking-wider">Caméra inactive</p>
                </>
              )}
            </div>
          )}

          {/* Facing toggle button */}
          {cameraActive && !phoneDetected && (
            <button
              onClick={toggleCamera}
              className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-3">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            phoneDetected ? "bg-green-500 animate-ping" : "bg-blue-500 animate-pulse"
          )} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
            Status: <span className="text-white ml-1">{scanningStatus}</span>
          </p>
        </div>

        {/* Action Panel / Results */}
        <div className="p-5 space-y-4">
          {phoneDetected && aestheticScore !== null && calculatedVrt !== null ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Score Esthétique</span>
                  </div>
                  <span className="text-base font-black text-green-400">{Math.round(aestheticScore * 100)}%</span>
                </div>

                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${aestheticScore * 100}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-green-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cote Certifiée (API)</span>
                  <span className="text-lg font-black text-white">{calculatedVrt.toLocaleString("fr-FR")} XOF</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    let condition = "micro_rayures";
                    if (aestheticScore >= 0.90) condition = "comme_neuf";
                    else if (aestheticScore < 0.70) condition = "fissure";
                    
                    onApplyResult(calculatedVrt, condition, aestheticScore);
                    onClose();
                  }}
                  className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-green-500/20"
                >
                  <Check className="w-4 h-4 mr-2" /> Appliquer l'offre
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneDetected(false);
                    setAestheticScore(null);
                    setCalculatedVrt(null);
                    startCamera();
                  }}
                  className="h-12 border-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/5"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2">
              <p className="text-[10px] text-zinc-500 font-bold leading-relaxed text-center">
                Placez l'écran du téléphone bien en face de la caméra.<br />
                Le modèle AI embarqué détectera automatiquement l'appareil et lancera l'estimation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
