import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Zap, CheckCircle2, TrendingUp, ArrowRightLeft, AlertCircle } from "lucide-react";
import { cn } from "@/core/api/utils";
import { useTranslation } from "react-i18next";

function labelBatterie(state?: string): string {
    switch (state) {
        case "gte90":    return "Excellente (capacité ≥ 90%)";
        case "gte80_89": return "Bonne (capacité 80–89%)";
        case "gte70_79": return "Correcte (capacité 70–79%)";
        case "gte60_69": return "Faible (capacité 60–69%)";
        case "lt60":     return "Très faible — à remplacer (< 60%)";
        default:         return state || "—";
    }
}
function labelEcran(state?: string): string {
    switch (state) {
        case "parfait": return "Parfait (aucune rayure ni trace)";
        case "raye":    return "Rayé / micro-rayures visibles";
        case "casse":   return "Cassé / écran fissuré";
        default:        return state || "—";
    }
}
function labelChassis(state?: string): string {
    switch (state) {
        case "intact": return "Intact (aucun choc ni marque)";
        case "abime":  return "Endommagé (chocs ou fissures)";
        default:       return state || "—";
    }
}

interface SatisfactionStepProps {
    finalPrice: number | null;
    formatCFA: (n: number) => string;
    isSatisfied: boolean | null;
    setIsSatisfied: (v: boolean | null) => void;
    setStep: (v: any) => void;
    proposedPrice: string;
    setProposedPrice: (v: string) => void;
    isPWA?: boolean;
    brand?: string;
    model?: string;
    storage?: number | null;
    ram?: number | null;
    ecranState?: string;
    chassisState?: string;
    batterieState?: string;
}

export const SatisfactionStep = ({
    finalPrice, formatCFA, isSatisfied, setIsSatisfied, setStep,
    proposedPrice, setProposedPrice, isPWA = false,
    brand, model, storage, ram, ecranState, chassisState, batterieState
}: SatisfactionStepProps) => {
    const { t } = useTranslation();

    const proposedNum = Number(proposedPrice);
    const estimatedNum = finalPrice || 0;
    const isSameAsEstimate = proposedNum > 0 && proposedNum === estimatedNum;
    const canSubmit = proposedNum > 0 && !isSameAsEstimate;

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-in slide-in-from-bottom-12 duration-700 text-center">
            <div className="space-y-4">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border transition-colors",
                    isPWA ? "bg-[#00FF41]/10 border-[#00FF41]/20" : "bg-blue-600/10 dark:bg-primary/20 border-blue-600/20 dark:border-primary/20"
                )}>
                    <Zap className={cn("w-7 h-7 transition-colors", isPWA ? "text-[#00FF41]" : "text-blue-600 dark:text-primary")} />
                </div>
                <div className="text-xl sm:text-3xl font-black tracking-tighter uppercase italic leading-[0.9] text-slate-900 dark:text-white">
                    {t('simulator.offre_reprise', 'Offre de reprise TEKH+')} <br /> <span className={cn("italic", isPWA ? "text-blue-700 dark:text-[#00FF41]" : "text-[#064e3b] dark:text-primary")}>{formatCFA(finalPrice || 0)}</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-500 text-xs font-bold mt-1 max-w-sm mx-auto">{t('simulator.offre_reprise_desc', 'Prix de reprise proposé par TEKH+ selon l\'état de votre appareil.')}</p>
                <p className="text-slate-500 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-widest mt-2">{t('simulator.helper_text')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                    onClick={() => { setIsSatisfied(true); setStep("target_selection"); }}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 p-4 px-6 rounded-2xl border border-white/5 hover:scale-[1.02] active:scale-95 group shadow-sm text-left sm:text-center",
                        isPWA ? "bg-[#00FF41] text-black" : "bg-black text-white hover:bg-zinc-900"
                    )}
                >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow", isPWA ? "bg-black/10" : "bg-[#00FF41]")}>
                        <CheckCircle2 className={cn("h-4 w-4", isPWA ? "text-black" : "text-black")} />
                    </div>
                    <span className="text-sm font-bold tracking-tight uppercase font-sans">{t('simulator.perfect')}</span>
                    <span className="text-[10px] font-medium opacity-90">{t('simulator.perfect_desc', 'J\'accepte ce prix de reprise.')}</span>
                </button>

                <button
                    onClick={() => setIsSatisfied(false)}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1.5 bg-black hover:bg-zinc-900 transition-all duration-300 p-4 px-6 rounded-2xl border border-white/5 hover:scale-[1.02] active:scale-95 group shadow-sm text-left sm:text-center",
                        isSatisfied === false ? "border-amber-500 ring-1 ring-amber-500" : ""
                    )}
                >
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow">
                        <TrendingUp className="text-white h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white uppercase font-sans">{t('simulator.low_estimate')}</span>
                    <span className="text-[10px] font-medium text-zinc-400">{t('simulator.low_estimate_desc', 'Je souhaite proposer un autre montant.')}</span>
                </button>
            </div>

            {isSatisfied === false && (
                <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-6 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-blue-600 dark:text-primary" />
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-400 italic">MON MONTANT PROPOSÉ (FCFA)</Label>
                    </div>
                    <input
                        type="number"
                        placeholder="EX: 450000"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        className={cn(
                            "w-full bg-slate-50 dark:bg-zinc-900 border-2 rounded-2xl h-14 px-6 font-black text-2xl text-[#064e3b] dark:text-primary outline-none transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-center",
                            isSameAsEstimate
                                ? "border-rose-400 dark:border-rose-500 focus:border-rose-500"
                                : "border-zinc-100 dark:border-zinc-700 focus:border-[#064e3b] dark:focus:border-primary"
                        )}
                    />
                    {isSameAsEstimate && (
                        <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Votre montant doit être différent de l'estimation TEKH+
                        </div>
                    )}
                    <Button
                        className={cn(
                            "w-full h-14 rounded-full font-black text-sm uppercase italic tracking-[0.2em] shadow-xl mt-4 transition-all",
                            isPWA ? "bg-[#00FF41] hover:bg-[#00FF41]/90 text-black" : "bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black"
                        )}
                        onClick={() => {
                            const phone = import.meta.env.VITE_WHATSAPP_BUSINESS || "22897628117";
                            const diff = proposedNum - estimatedNum;
                            const diffPct = estimatedNum > 0 ? (diff / estimatedNum) * 100 : 0;
                            const sign = diff >= 0 ? "+" : "";
                            const fmtNum = (n: number) => Math.abs(n).toLocaleString("fr-FR");
                            const msg =
                                `🔔 *DEMANDE DE NÉGOCIATION — TEKH+*\n` +
                                `━━━━━━━━━━━━━━━━━━━━\n` +
                                `📱 *${brand} ${model}*\n` +
                                `   💾 Stockage : ${storage} Go${ram ? ` · RAM : ${ram} Go` : ``}\n\n` +
                                `🔍 *ÉTAT DE L'APPAREIL*\n` +
                                `• Écran    : ${labelEcran(ecranState)}\n` +
                                `• Châssis  : ${labelChassis(chassisState)}\n` +
                                `• Batterie : ${labelBatterie(batterieState)}\n\n` +
                                `💰 *NÉGOCIATION PRIX*\n` +
                                `• Estimation TEKH+ : ${formatCFA(estimatedNum)}\n` +
                                `• Contre-offre     : ${fmtNum(proposedNum)} FCFA\n` +
                                `• Écart             : ${sign}${fmtNum(diff)} FCFA (${sign}${diffPct.toFixed(1)}%)\n` +
                                `━━━━━━━━━━━━━━━━━━━━\n` +
                                `⚡ _Expertise auto-générée · TEKH+ App_`;

                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                            window.open(url, "_blank");
                            setStep("target_selection");
                        }}
                        disabled={!canSubmit}
                    >
                        SOUMETTRE <ArrowRightLeft className="w-5 h-5 ml-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
