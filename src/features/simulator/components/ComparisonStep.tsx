import { ShieldCheck, Smartphone, ArrowRightLeft, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

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
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white mb-1">
                    ACCORD DE <span className={cn(isPWA ? "text-[#00FF41]" : "text-[#064e3b] dark:text-primary", "italic")}>SWAP</span>
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", isPWA ? "text-[#00FF41]" : "text-[#064e3b] dark:text-primary")} />
                    <p className="text-slate-800 dark:text-zinc-300 font-black uppercase text-[9px] tracking-[0.5em]">CERTIFICATION TECHNIQUE TEKH+</p>
                </div>
            </div>

            <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 relative max-w-3xl mx-auto">
                    {/* Block 1: Possession */}
                    <div className="flex-1 bg-white dark:bg-white/5 rounded-xl p-6 flex flex-col items-center gap-3 border border-zinc-100 dark:border-white/10 shadow-lg group">
                        <div className="w-16 h-16 rounded-full bg-blue-600/10 dark:bg-primary/10 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-110 transition-transform">
                            <Smartphone className="w-8 h-8 text-blue-600 dark:text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest">{t('simulator.possession')}</p>
                            <h4 className="text-base font-black tracking-tighter text-black dark:text-white uppercase">{brand} {model}</h4>
                            <p className="text-xl font-black text-blue-600 dark:text-primary mt-0.5">{formatCFA(safeFinalPrice)}</p>
                        </div>
                    </div>

                    {/* Transfer Icon */}
                    <div className="flex items-center justify-center shrink-0">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#05070a] border-[3px] border-zinc-50 dark:border-[#0b0e14] flex items-center justify-center z-10 shadow-lg">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isPWA ? "bg-[#00FF41]" : "bg-[#064e3b] dark:bg-primary")}>
                                <ArrowRightLeft className={cn("w-4 h-4", isPWA ? "text-black" : "text-white dark:text-black")} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Acquisition */}
                    <div className="flex-1 bg-white dark:bg-white/5 rounded-xl p-6 flex flex-col items-center gap-3 border border-zinc-100 dark:border-white/10 shadow-lg group relative">
                        <div className="w-16 h-16 rounded-full bg-blue-600/10 dark:bg-primary/10 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                            <Zap className="w-8 h-8 text-blue-600 dark:text-primary" fill="currentColor" />
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest">{t('simulator.acquisition')}</p>
                            <h4 className="text-base font-black tracking-tighter text-black dark:text-white uppercase">{targetBrand} {targetModel}</h4>
                            <p className="text-xl font-black text-blue-600 dark:text-primary mt-0.5">{formatCFA(safeTargetPrice)}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Table */}
                <div className="grid grid-cols-1 md:flex items-stretch bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-2 border-slate-100 dark:border-white/5 shadow-xl overflow-hidden max-w-3xl mx-auto">
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b] dark:text-primary mb-3">POSSESSION</span>
                        <div className="space-y-1 font-black text-[11px] text-slate-900 dark:text-white italic uppercase tracking-tighter">
                            <div>{storage || '—'} Go Stockage</div>
                            <div>État: {aestheticState === 'very_good' || aestheticState === 'Premium' ? 'Premium' : 'Standard'}</div>
                        </div>
                    </div>
                    <div className="flex-1 p-6 bg-blue-600/5 dark:bg-primary/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-primary mb-3">ACQUISITION</span>
                        <div className="space-y-1 font-black text-[11px] text-slate-900 dark:text-white italic uppercase tracking-tighter">
                            <div>{targetStorage || '—'} Go Stockage</div>
                            <div>Grade A Certifié</div>
                            <div>Garantie Tekh+ Incluse</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Balance Section */}
            <div className="bg-slate-900 dark:bg-black rounded-[40px] p-10 space-y-8 relative shadow-2xl text-white max-w-4xl mx-auto mt-6">
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

            {/* CTA Button */}
            <div className="pt-8">
                <button
                    onClick={() => {
                        alert("VOTRE DEMANDE DE SWAP EST ENREGISTRÉE ! UN AGENT VA VOUS CONTACTER SUR WHATSAPP.");
                        window.location.href = "/";
                    }}
                    className={cn(
                        "w-full h-28 rounded-[48px] font-black text-4xl italic tracking-tighter hover:scale-[1.01] active:scale-95 transition-all shadow-3xl uppercase flex items-center justify-center gap-6 overflow-hidden relative group",
                        isPWA ? "bg-[#00FF41] text-black" : "bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary text-white dark:text-black"
                    )}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <span className="relative z-10">CONFIRMER L'ÉCHANGE</span>
                    <ShieldCheck className="w-10 h-10 relative z-10" />
                </button>
                <p className="text-center text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.5em] mt-8">EN CLIQUANT SUR CONFIRMER, VOUS ACCEPTEZ LES CONDITIONS GÉNÉRALES DU PROGRAMME TEKH+</p>
            </div>
        </div>
    );
};
