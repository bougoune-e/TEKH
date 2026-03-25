import { Camera, Plus, X, Loader2, CheckCircle2, AlertTriangle, ScanLine, Smartphone, Zap } from "lucide-react";
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
    performAnalysis: (slot: PhotoSlot) => void;
}

/** Simple list of 4 slots to be displayed on one line */
const SLOTS: { id: PhotoSlot; label: string; Icon: any }[] = [
    { id: "front", label: "Face", Icon: ScanLine },
    { id: "back", label: "Dos", Icon: Smartphone },
    { id: "side1", label: "Côté 1", Icon: Smartphone },
    { id: "side2", label: "Côté 2", Icon: Smartphone },
];

const MiniSlot = ({
    slot,
    image,
    result,
    isAnalyzing,
    fileInputRef,
    onUpload,
    onRemove,
    index,
}: {
    slot: PhotoSlot;
    image: string | null;
    result: PhoneAnalysisResult | null;
    isAnalyzing: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>, slot: PhotoSlot) => void;
    onRemove: (slot: PhotoSlot) => void;
    onAnalyze: (slot: PhotoSlot) => void;
    index: number;
}) => (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest ml-0.5">
            Photo {index + 1}
        </span>
        <div className={cn(
            "relative aspect-square rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-white/5 transition-all",
            image
                ? "border-blue-600/40 dark:border-primary/40 border-solid"
                : "border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-primary/40 cursor-pointer",
            isAnalyzing && "animate-pulse border-blue-400 dark:border-primary"
        )}>
            {image ? (
                <>
                    <img src={image} alt={slot} className="w-full h-full object-cover" />
                    <button
                        onClick={() => onRemove(slot)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-lg z-20 hover:scale-110 active:scale-90 transition-transform"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {image && !result && !isAnalyzing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onAnalyze(slot)}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black px-3 py-2 rounded-xl shadow-xl flex items-center gap-1.5 transform scale-90 hover:scale-100 transition-all"
                            >
                                <Zap className="w-3 h-3 text-amber-400" />
                                CERTIFIER IA
                            </button>
                        </div>
                    )}

                    {result && (
                        <div className={cn(
                            "absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center gap-1.5 text-[9px] font-black backdrop-blur-md",
                            result.isClear && result.isMatch
                                ? "bg-green-500/90 text-white"
                                : "bg-amber-500/90 text-white"
                        )}>
                            {result.isClear && result.isMatch
                                ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                                : <AlertTriangle className="w-3 h-3 shrink-0" />
                            }
                            <span className="truncate">{result.verdict}</span>
                        </div>
                    )}
                </>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 p-2"
                >
                    <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Plus className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                    </div>
                </div>
            )}
            {isAnalyzing && (
                <div className="absolute inset-0 bg-blue-600/40 dark:bg-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
            )}
        </div>

        {result && (!result.isClear || !result.isMatch) && (
            <p className="text-[9px] font-bold text-rose-500 dark:text-rose-400 leading-tight ml-0.5">
                {result.erreur || (result.isMatch === false ? "Marque non concordante" : "Image floue")}
            </p>
        )}

        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => onUpload(e, slot)}
        />
    </div>
);

export const PhotoStep = ({
    imageSlots, analysisResults, analyzingSlots,
    fileInputRefs, handleImageUpload, removeImage, performAnalysis
}: PhotoStepProps) => {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 px-1">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-black tracking-tighter uppercase font-sans text-black dark:text-white italic leading-tight">
                            4. Photos
                        </h2>
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-500">
                            Optionnel
                        </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Renforcez votre certification — étape facultative
                    </p>
                </div>
            </div>

            <div className="flex flex-row overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scrollbar-hide">
                {SLOTS.map(({ id, label, Icon }, i) => (
                    <div key={id} className="min-w-[120px] flex-1 snap-start">
                        <MiniSlot
                            slot={id}
                            index={i}
                            image={imageSlots[id]}
                            result={analysisResults[id]}
                            isAnalyzing={analyzingSlots[id]}
                            fileInputRef={fileInputRefs[id]}
                            onUpload={handleImageUpload}
                            onRemove={removeImage}
                            onAnalyze={performAnalysis}
                        />
                    </div>
                ))}
            </div>

            <div className="bg-blue-600/5 dark:bg-primary/5 rounded-xl p-3 border border-blue-600/10 dark:border-primary/10">
                <p className="text-[10px] leading-relaxed font-bold text-slate-600 dark:text-zinc-400 italic">
                    <span className="text-blue-600 dark:text-primary mr-1 not-italic">Note :</span>
                    L'IA analyse chaque photo pour certifier l'état. Bonne lumière, bords visibles, appareil posé à plat.
                </p>
            </div>
        </div>
    );
};
