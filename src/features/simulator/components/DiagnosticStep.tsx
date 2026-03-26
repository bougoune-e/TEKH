import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Monitor } from "lucide-react";
import type { BatterieTekh, ChassisTekh, EcranTekh } from "@/core/api/pricing";

interface DiagnosticStepProps {
    ecranState: EcranTekh | "";
    setEcranState: (v: EcranTekh) => void;
    chassisState: ChassisTekh | "";
    setChassisState: (v: ChassisTekh) => void;
    batterieState: BatterieTekh | "";
    setBatterieState: (v: BatterieTekh) => void;
}

export const DiagnosticStep = ({
    ecranState, setEcranState,
    chassisState, setChassisState,
    batterieState, setBatterieState,
}: DiagnosticStepProps) => {
    return (
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                </div>
                <div className="text-xl font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">2. Diagnostic technique</div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                L’écran détermine le coût de remise à neuf (Dealbox). Le châssis est évalué à part.
            </p>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 ml-1 italic">État de l’Écran</Label>
                    <Select value={ecranState || ""} onValueChange={(v) => setEcranState(v as EcranTekh)}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white transition-all focus:border-blue-600/30">
                            <SelectValue placeholder="SÉLECTIONNER" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10">
                            <SelectItem value="parfait">Parfait — Aucune rayure</SelectItem>
                            <SelectItem value="raye">Rayé — Rayures visibles</SelectItem>
                            <SelectItem value="casse">Cassé — Fissuré / Fragmenté</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 ml-1 italic">État du Châssis (Bords & Dos)</Label>
                    <Select value={chassisState || ""} onValueChange={(v) => setChassisState(v as ChassisTekh)}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white transition-all focus:border-blue-600/30">
                            <SelectValue placeholder="SÉLECTIONNER" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10">
                            <SelectItem value="intact">Intact — Pas de choc</SelectItem>
                            <SelectItem value="abime">Abîmé — Chocs ou rayures</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 ml-1 italic">Santé Batterie (%)</Label>
                    <Select value={batterieState || ""} onValueChange={(v) => setBatterieState(v as BatterieTekh)}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white transition-all focus:border-blue-600/30">
                            <SelectValue placeholder="SÉLECTIONNER" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10">
                            <SelectItem value="gte90">Capacité ≥ 90 %</SelectItem>
                            <SelectItem value="gte80_89">80 % – 89 %</SelectItem>
                            <SelectItem value="gte70_79">70 % – 79 %</SelectItem>
                            <SelectItem value="gte60_69">60 % – 69 %</SelectItem>
                            <SelectItem value="lt60">&lt; 60 %</SelectItem>
                            <SelectItem value="unknown">Inconnu / Non mesuré</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
