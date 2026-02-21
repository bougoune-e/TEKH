import { Camera, Plus, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoStepProps {
    imageSlots: {
        front: string | null;
        back: string | null;
        left: string | null;
        right: string | null;
    };
    fileInputRefs: {
        front: React.RefObject<HTMLInputElement>;
    };
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (slot: "front" | "back" | "left" | "right") => void;
}

export const PhotoStep = ({
    imageSlots, fileInputRefs, handleImageUpload, removeImage
}: PhotoStepProps) => {
    return (
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">3. Rapport Photo OBLIGATOIRE</h2>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-2 border-dashed border-slate-200 dark:border-white/10">
                <div className="flex flex-col items-center gap-2 text-center mb-3">
                    <div
                        onClick={() => fileInputRefs.front.current?.click()}
                        className="w-14 h-14 rounded-xl bg-blue-600 dark:bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                        <Plus className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Photos de l'appareil</h4>
                        <p className="text-[8px] font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-widest">Face, Dos, Côtés (4 photos)</p>
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
    );
};
