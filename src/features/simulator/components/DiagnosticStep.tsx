import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Monitor } from "lucide-react";

interface DiagnosticStepProps {
    screenState: string;
    setScreenState: (v: any) => void;
    batteryState: string;
    setBatteryState: (v: any) => void;
    biometricsState: string;
    setBiometricsState: (v: any) => void;
    cameraState: string;
    setCameraState: (v: any) => void;
    aestheticState: string;
    setAestheticState: (v: any) => void;
}

export const DiagnosticStep = ({
    screenState, setScreenState,
    batteryState, setBatteryState,
    biometricsState, setBiometricsState,
    cameraState, setCameraState,
    aestheticState, setAestheticState
}: DiagnosticStepProps) => {
    return (
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">2. Diagnostic Technique</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">État de l'affichage</Label>
                    <Select value={screenState || ""} onValueChange={(v) => setScreenState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="ÉCRAN" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <SelectItem value="intact">Intact / Aucun défaut</SelectItem>
                            <SelectItem value="cracked">Fissuré / Rayé</SelectItem>
                            <SelectItem value="burned">Brûlé / Taches LCD</SelectItem>
                            <SelectItem value="dead">Non fonctionnel / Noir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Santé Batterie</Label>
                    <Select value={batteryState || ""} onValueChange={(v) => setBatteryState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="BATTERIE" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <SelectItem value="good">Optimale (&gt; 85%)</SelectItem>
                            <SelectItem value="low">Dégradée (&lt; 85%)</SelectItem>
                            <SelectItem value="replace">Service / À remplacer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Biométrie & Sécurité</Label>
                    <Select value={biometricsState || ""} onValueChange={(v) => setBiometricsState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="FACE ID / TOUCH ID" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <SelectItem value="ok">100% Fonctionnel</SelectItem>
                            <SelectItem value="nok">Désactivé / Panne</SelectItem>
                            <SelectItem value="na">Non disponible</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Capture Optique</Label>
                    <Select value={cameraState || ""} onValueChange={(v) => setCameraState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="CAMÉRA" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <SelectItem value="ok">Parfaite</SelectItem>
                            <SelectItem value="degraded">Flou / Taches sombres</SelectItem>
                            <SelectItem value="nok">HS / Lentille cassée</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Esthétique Globale</Label>
                    <Select value={aestheticState || ""} onValueChange={(v) => setAestheticState(v as any)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white">
                            <SelectValue placeholder="CHÂSSIS / DOS" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <SelectItem value="very_good">Presque Neuf</SelectItem>
                            <SelectItem value="visible">Traces visibles</SelectItem>
                            <SelectItem value="damaged">Chocs / Cassé</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
