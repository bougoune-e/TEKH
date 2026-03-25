import { Camera, Plus, X, Loader2, CheckCircle2, AlertTriangle, Smartphone, ScanLine, BoxSelect, Frame } from "lucide-react";
import { cn } from "@/core/api/utils";
import type { PhoneAnalysisResult } from "@/core/api/analyzePhone";

export type PhotoSlot = "front" | "back" | "side1" | "side2";

interface PhotoStepProps {
    imageSlots: Record<PhotoSlot, string | null>;
    analysisResults: Record<PhotoSlot, PhoneAnalysisResult | null>;
    analyzingSlots: Record<PhotoSlot, boolean>;
    fileInputRefs: Record<PhotoSlot, React.RefObject<HTMLInputElement>>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, slot: PhotoSlot) => void;
    removeImage: (slot: PhotoSlot) => void;
}

const SLOT_CONFIG: Record<PhotoSlot, { label: string; icon: any; type: string }> = {
    front: { label: "FACE (Écran)", icon: ScanLine, type: "front" },
    back: { label: "DOS (Coque)", icon: Smartphone, type: "back" },
    side1: { label: "CÔTÉ 1", icon: BoxSelect, type: "side" },
    side2: { label: "CÔTÉ 2", icon: Frame, type: "side" },
};

export const PhotoStep = ({
    imageSlots,
    analysisResults,
    analyzingSlots,
    fileInputRefs,
    handleImageUpload,
    removeImage,
}: PhotoStepProps) => {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">3. Rapport Photo OBLIGATOIRE</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">L'estimation finale dépend de la clarté de ces 4 photos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(SLOT_CONFIG) as PhotoSlot[]).map((slot) => {
                    const config = SLOT_CONFIG[slot];
                    const image = imageSlots[slot];
                    const result = analysisResults[slot];
                    const isAnalyzing = analyzingSlots[slot];

                    return (
                        <div key={slot} className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-1">
                                {config.label}
                            </label>

                            <div className={cn(
                                "relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5",
                                image ? "border-blue-600/50 dark:border-primary/50 border-solid" : "border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-primary/40",
                                isAnalyzing && "animate-pulse border-blue-400"
                            )}>
                                {image ? (
                                    <>
                                        <img src={image} alt={slot} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(slot)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-xl z-20 hover:scale-110 active:scale-90 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* Overlay with result summary */}
                                        {result && (
                                            <div className={cn(
                                                "absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 text-[11px] font-bold backdrop-blur-md border-t",
                                                result.isClear && result.isMatch
                                                    ? "bg-green-500/90 text-white border-green-400/20"
                                                    : "bg-amber-500/90 text-white border-amber-400/20"
                                            )}>
                                                {result.isClear && result.isMatch ? (
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                                )}
                                                <span className="line-clamp-1">{result.verdict}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div
                                        onClick={() => fileInputRefs[slot].current?.click()}
                                        className="flex flex-col items-center gap-3 cursor-pointer group p-6"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-zinc-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                                            <config.icon className="w-6 h-6" />
                                        </div>
                                        <div className="bg-blue-600 dark:bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform">
                                            <Plus className="w-3 h-3" />
                                            CAPTURER
                                        </div>
                                    </div>
                                )}

                                {/* Analyzing overlay */}
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-blue-600/40 dark:bg-primary/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-xs font-black uppercase tracking-widest italic">Analyse IA...</span>
                                    </div>
                                )}
                            </div>

                            {/* Error Details */}
                            {result && (!result.isClear || !result.isMatch) && (
                                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span>{result.erreur || (result.isMatch === false ? "Marque non concordante" : "Image trop floue")}</span>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRefs[slot]}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, slot)}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-600/5 dark:bg-primary/5 rounded-2xl p-4 border border-blue-600/10 dark:border-primary/10">
                <p className="text-[10px] leading-relaxed font-bold text-slate-600 dark:text-zinc-400 italic">
                    <span className="text-blue-600 dark:text-primary mr-1 underline">Note :</span>
                    L'IA de TEKH+ analyse vos photos pour certifier l'état. Assurez-vous d'être dans un endroit éclairé et de ne pas cacher les bords de l'appareil.
                </p>
            </div>
        </div>
    );
};
