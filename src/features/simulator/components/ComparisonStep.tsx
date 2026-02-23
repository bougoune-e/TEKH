import { useEffect } from "react";
import { ShieldCheck, Smartphone, ArrowRightLeft, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/core/api/utils";

interface ComparisonStepProps {
    brand: string;
    model: string;
    finalPrice: number | null;
    targetBrand: string;
    targetModel: string;
    targetModelInfo: any;
    storage: number | null;
    aestheticState: string;
    targetStorage: number | null;
    formatCFA: (n: number) => string;
    isPWA?: boolean;
}

export const ComparisonStep = ({
    brand, model, finalPrice,
    targetBrand, targetModel, targetModelInfo,
    storage, aestheticState, targetStorage,
    formatCFA, isPWA = false
}: ComparisonStepProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Defensive parsing to ensure we have numbers
    const safeFinalPrice = Number(finalPrice) || 0;
    const safeTargetPrice = Number(targetModelInfo?.base_price_fcfa) || 0;
    const difference = Math.max(0, safeTargetPrice - safeFinalPrice);

    // Fallback UI if crucial info is somehow missing (shouldn't happen but prevents white page)
    if (!brand && !targetBrand) {
        return (
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                Initialisation du bilan...
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 space-y-12 animate-in zoom-in-95 duration-700">
            <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-5xl font-black tracking-[0.3em] uppercase leading-[0.9] text-slate-900 dark:text-white mb-1 font-sans">
                    ACCORD DE <span className={cn(isPWA ? "text-blue-600 dark:text-[#00FF41]" : "text-[#064e3b] dark:text-primary", "italic")}>SWAP</span>
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", isPWA ? "text-blue-600 dark:text-[#00FF41]" : "text-[#064e3b] dark:text-primary")} />
                    <p className="text-slate-800 dark:text-zinc-300 font-black uppercase text-[9px] tracking-[0.5em]">CERTIFICATION TECHNIQUE TEKH+</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Deux cartes smartphone face à face — même layout web + PWA */}
                <div className="flex flex-row items-stretch justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
                    {/* Carte 1: Votre appareil (forme smartphone) */}
                    <div className="flex-1 max-w-[180px] sm:max-w-[200px] flex flex-col rounded-[20px] sm:rounded-[24px] overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
                        <div className="aspect-[9/19] min-h-[140px] flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 dark:from-white/10 dark:to-transparent">
                            <Smartphone className="w-12 h-12 sm:w-14 sm:h-14 text-blue-600 dark:text-primary opacity-80" />
                        </div>
                        <div className="p-3 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-white/5">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{t('simulator.possession')}</p>
                            <p className="text-xs sm:text-sm font-black text-black dark:text-white truncate mt-0.5">{model}</p>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1">{storage || '—'} Go · {aestheticState === 'very_good' || aestheticState === 'Premium' ? 'Premium' : 'Standard'}</p>
                            <p className="text-sm sm:text-base font-black text-blue-700 dark:text-primary mt-1">{formatCFA(safeFinalPrice)}</p>
                        </div>
                    </div>

                    {/* Icône échange au centre */}
                    <div className="flex items-center justify-center shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#05070a] border-2 border-zinc-200 dark:border-white/10 flex items-center justify-center z-10 shadow-lg">
                            <div className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center", isPWA ? "bg-[#00FF41]" : "bg-[#064e3b] dark:bg-primary")}>
                                <ArrowRightLeft className={cn("w-3 h-3 sm:w-4 sm:h-4", isPWA ? "text-black" : "text-white dark:text-black")} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Carte 2: Appareil cible (forme smartphone) */}
                    <div className="flex-1 max-w-[180px] sm:max-w-[200px] flex flex-col rounded-[20px] sm:rounded-[24px] overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
                        <div className="aspect-[9/19] min-h-[140px] flex items-center justify-center bg-gradient-to-b from-[#00FF41]/10 to-transparent dark:from-primary/10 dark:to-transparent">
                            <Zap className="w-12 h-12 sm:w-14 sm:h-14 text-blue-600 dark:text-primary opacity-80" fill="currentColor" />
                        </div>
                        <div className="p-3 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-white/5">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{t('simulator.acquisition')}</p>
                            <p className="text-xs sm:text-sm font-black text-black dark:text-white truncate mt-0.5">{targetModel}</p>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1">{targetStorage || '—'} Go · Grade A</p>
                            <p className="text-sm sm:text-base font-black text-blue-700 dark:text-primary mt-1">{formatCFA(safeTargetPrice)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Balance Section */}
            <div className="bg-slate-900 dark:bg-black rounded-[32px] p-6 sm:p-8 md:p-10 space-y-8 relative shadow-2xl text-white max-w-4xl mx-auto mt-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 dark:bg-primary px-6 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">BILAN FINANCIER</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 flex-1 w-full max-w-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Apport</span>
                            <span className="text-white text-lg font-black italic">{formatCFA(safeFinalPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Cible</span>
                            <span className="text-white text-lg font-black italic">{formatCFA(safeTargetPrice)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-center md:border-l border-white/10 md:pl-10 flex-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 dark:text-primary mb-2 italic">DIFFÉRENCE</div>
                        <div className="text-5xl sm:text-6xl font-black text-white italic tracking-tighter leading-none mb-3">
                            {formatCFA(difference)}
                        </div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] text-center md:text-right">RÈGLEMENT EN AGENCE TEKH+</p>
                    </div>
                </div>
            </div>

            {/* CTA — style minimal comme "Estimer mon téléphone" */}
            <div className="pt-6">
                <button
                    onClick={() => {
                        alert("VOTRE DEMANDE DE SWAP EST ENREGISTRÉE ! UN AGENT VA VOUS CONTACTER SUR WHATSAPP.");
                        window.location.href = "/";
                    }}
                    className={cn(
                        "w-full h-12 sm:h-14 rounded-2xl font-black text-sm sm:text-base uppercase tracking-tight hover:scale-[1.01] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2",
                        isPWA ? "bg-[#00FF41] text-black" : "bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary text-white dark:text-black"
                    )}
                >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirmer l'échange</span>
                </button>
                <p className="text-center text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-wider mt-3">En cliquant, vous acceptez les CG du programme TEKH+</p>
            </div>
        </div>
    );
};
