import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Zap, CheckCircle2, TrendingUp, ArrowRightLeft } from "lucide-react";
import { cn } from "@/core/api/utils";
import { useTranslation } from "react-i18next";

interface SatisfactionStepProps {
    finalPrice: number | null;
    formatCFA: (n: number) => string;
    isSatisfied: boolean | null;
    setIsSatisfied: (v: boolean | null) => void;
    setStep: (v: any) => void;
    proposedPrice: string;
    setProposedPrice: (v: string) => void;
    isPWA?: boolean;
}

export const SatisfactionStep = ({
    finalPrice, formatCFA, isSatisfied, setIsSatisfied, setStep,
    proposedPrice, setProposedPrice, isPWA = false
}: SatisfactionStepProps) => {
    const { t } = useTranslation();

    return (
        <div className="p-4 sm:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-700 text-center">
            <div className="space-y-4">
                <div className={cn(
                    "w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border transition-colors",
                    isPWA ? "bg-[#00FF41]/10 border-[#00FF41]/20" : "bg-blue-600/10 dark:bg-primary/20 border-blue-600/20 dark:border-primary/20"
                )}>
                    <Zap className={cn("w-10 h-10 transition-colors", isPWA ? "text-[#00FF41]" : "text-blue-600 dark:text-primary")} />
                </div>
                <h2 className="text-2xl sm:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-slate-900 dark:text-white">
                    {t('simulator.votre_offre')} : <br /> <span className={isPWA ? "text-[#00FF41]" : "text-[#064e3b] dark:text-primary"}>{formatCFA(finalPrice || 0)}</span>
                </h2>
                <p className="text-slate-700 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-[0.4em]">{t('simulator.helper_text')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                    onClick={() => { setIsSatisfied(true); setStep("target_selection"); }}
                    className={cn(
                        "flex items-center justify-center gap-3 transition-all duration-300 p-3 px-8 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-sm",
                        isPWA ? "bg-[#00FF41] text-black" : "bg-black text-white hover:bg-zinc-900"
                    )}
                >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow", isPWA ? "bg-black/10" : "bg-[#00FF41]")}>
                        <CheckCircle2 className={cn("h-4 w-4", isPWA ? "text-black" : "text-black")} />
                    </div>
                    <span className="text-base font-bold tracking-tight uppercase font-sans">{t('simulator.perfect')}</span>
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
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-400 italic">VOTRE OFFRE (FCFA)</Label>
                    </div>
                    <input
                        type="number"
                        placeholder="EX: 450,000"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border-2 border-zinc-100 dark:border-white/10 rounded-2xl h-14 px-6 font-black text-2xl text-[#064e3b] dark:text-primary outline-none focus:border-[#064e3b] dark:focus:border-primary transition-all shadow-inner placeholder:text-slate-200 dark:placeholder:text-zinc-800 text-center"
                    />
                    <Button
                        className={cn(
                            "w-full h-14 rounded-full font-black text-sm uppercase italic tracking-[0.2em] shadow-xl mt-4 transition-all",
                            isPWA ? "bg-[#00FF41] hover:bg-[#00FF41]/90 text-black" : "bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black"
                        )}
                        onClick={() => setStep("target_selection")}
                        disabled={!proposedPrice}
                    >
                        SOUMETTRE <ArrowRightLeft className="w-5 h-5 ml-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
