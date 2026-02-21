import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TargetSelectionStepProps {
    exchangeType: "upgrade" | "downgrade" | "";
    setExchangeType: (v: "upgrade" | "downgrade" | "") => void;
    targetBrand: string;
    setTargetBrand: (v: string) => void;
    brands: string[];
    targetModel: string;
    setTargetModel: (v: string) => void;
    targetModels: string[];
    loadingTargetModels: boolean;
    targetStorage: number | null;
    setTargetStorage: (v: number | null) => void;
    targetVariants: any[];
    setStep: (v: any) => void;
}

export const TargetSelectionStep = ({
    exchangeType, setExchangeType,
    targetBrand, setTargetBrand, brands,
    targetModel, setTargetModel, targetModels, loadingTargetModels,
    targetStorage, setTargetStorage, targetVariants,
    setStep
}: TargetSelectionStepProps) => {
    const { t } = useTranslation();

    return (
        <div className="p-4 sm:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-700">
            <div className="text-center space-y-4">
                <p className="text-blue-600 dark:text-primary font-black uppercase text-[10px] tracking-[0.5em]">PHASE 3 / NAVIGATION</p>
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-slate-900 dark:text-white">
                    {t('simulator.possession')} <br /> <span className="text-[#064e3b] dark:text-primary">{t('simulator.target')}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <button
                    onClick={() => setExchangeType("upgrade")}
                    className={cn(
                        "flex items-center gap-3 bg-black dark:bg-black hover:bg-zinc-900 dark:hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-xl border-2 shadow-sm group",
                        exchangeType === "upgrade" ? "border-[#064e3b] dark:border-primary" : "border-slate-800 dark:border-white/5"
                    )}
                >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm", exchangeType === "upgrade" ? "bg-[#064e3b] dark:bg-primary text-white dark:text-black" : "bg-zinc-800 dark:bg-zinc-800 text-slate-400")}>
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-left font-sans">
                        <span className="text-sm font-black tracking-tight text-white dark:text-white uppercase transition-colors">UPGRADE</span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest block -mt-1">PERFORMANCE</span>
                    </div>
                </button>

                <button
                    onClick={() => setExchangeType("downgrade")}
                    className={cn(
                        "flex items-center gap-3 bg-black dark:bg-black hover:bg-zinc-900 dark:hover:bg-zinc-900 transition-all duration-300 p-3 pr-8 rounded-xl border-2 shadow-sm group opacity-60 grayscale",
                        exchangeType === "downgrade" ? "border-amber-500 ring-1 ring-amber-500" : "border-slate-800 dark:border-white/5"
                    )}
                >
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                        <TrendingDown className="text-white h-4 h-4" />
                    </div>
                    <div className="text-left font-sans">
                        <span className="text-sm font-black tracking-tight text-white dark:text-white uppercase transition-colors">DOWNGRADE</span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest block -mt-1">LIQUIDITÉS</span>
                    </div>
                </button>
            </div>

            {exchangeType && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-700 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Marque cible</Label>
                            <Select value={targetBrand || ""} onValueChange={(v) => { setTargetBrand(v); setTargetModel(""); setTargetStorage(null); }}>
                                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                                    <SelectValue placeholder="SÉLECTIONNER BRAND" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                    {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Modèle cible</Label>
                            <Select value={targetModel || ""} onValueChange={(v) => { setTargetModel(v); setTargetStorage(null); }} disabled={!targetBrand || loadingTargetModels}>
                                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                                    <SelectValue placeholder={loadingTargetModels ? "..." : "SÉLECTIONNER MODEL"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                    {targetModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {targetModel && targetVariants.length > 0 && (
                        <div className="space-y-3 animate-in fade-in">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Capacité Requise</Label>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set(targetVariants.map(v => v.storage_gb))).sort((a, b) => a - b).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setTargetStorage(s)}
                                        className={cn(
                                            "px-6 py-3 rounded-lg border-2 font-black text-[11px] transition-all tracking-widest uppercase italic",
                                            targetStorage === s
                                                ? "border-blue-600 bg-blue-600 dark:border-primary dark:bg-primary text-white shadow-lg scale-105"
                                                : "border-slate-100 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-zinc-600 hover:border-slate-300"
                                        )}
                                    >
                                        {s} Go
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {targetStorage && (
                        <button
                            onClick={() => setStep("comparison")}
                            className="w-full h-16 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-xl uppercase italic tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-8"
                        >
                            Calculer le Deal <ArrowRightLeft className="w-6 h-6 ml-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
