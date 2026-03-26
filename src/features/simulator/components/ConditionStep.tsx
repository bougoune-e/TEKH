import { CheckCircle2, Eye, AlertTriangle, X, ShieldCheck, Minus, AlertCircle, Battery, BatteryMedium, BatteryWarning, Camera, HelpCircle, Monitor } from "lucide-react";
import { cn } from "@/core/api/utils";

export type ScreenCondition = "comme_neuf" | "micro_rayures" | "fissure" | "casse";
export type ChassisCondition = "excellent" | "rayures_legeres" | "endommage";
export type BatteryCondition = "tient_bien" | "se_decharge" | "a_remplacer";
export type FunctionalityIssue = "tout_ok" | "probleme_camera" | "probleme_tactile" | "probleme_bouton" | "autre";

interface ConditionStepProps {
    screenCondition: ScreenCondition | "";
    setScreenCondition: (v: ScreenCondition) => void;
    chassisCondition: ChassisCondition | "";
    setChassisCondition: (v: ChassisCondition) => void;
    batteryCondition: BatteryCondition | "";
    setBatteryCondition: (v: BatteryCondition) => void;
    functionalityIssues: FunctionalityIssue[];
    setFunctionalityIssues: (v: FunctionalityIssue[]) => void;
}

function SectionLabel({ num, label }: { num: string; label: string }) {
    return (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary text-[8px] flex items-center justify-center font-black shrink-0">{num}</span>
            {label}
        </p>
    );
}

function OptionCard<T extends string>({
    value, selected, onSelect, icon: Icon, label, sub,
}: {
    value: T; selected: boolean; onSelect: (v: T) => void;
    icon: React.ElementType; label: string; sub?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 flex-1 min-w-0 transition-all duration-150 text-center cursor-pointer",
                selected
                    ? "border-blue-600 bg-blue-50 dark:border-primary dark:bg-primary/10"
                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
            )}
        >
            <Icon className={cn(
                "w-4 h-4 shrink-0",
                selected ? "text-blue-600 dark:text-primary" : "text-slate-400 dark:text-zinc-500"
            )} />
            <span className={cn(
                "text-[10px] font-black leading-none",
                selected ? "text-blue-700 dark:text-primary" : "text-slate-700 dark:text-zinc-300"
            )}>{label}</span>
            {sub && (
                <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-600 leading-tight">{sub}</span>
            )}
        </button>
    );
}

const SCREEN_OPTIONS: { value: ScreenCondition; icon: React.ElementType; label: string; sub: string }[] = [
    { value: "comme_neuf", icon: CheckCircle2, label: "Comme neuf", sub: "Aucune marque" },
    { value: "micro_rayures", icon: Eye, label: "Micro-rayures", sub: "Légères, visibles" },
    { value: "fissure", icon: AlertTriangle, label: "Fissuré", sub: "Fissure présente" },
    { value: "casse", icon: X, label: "Cassé", sub: "Éclat / fragment" },
];

const CHASSIS_OPTIONS: { value: ChassisCondition; icon: React.ElementType; label: string; sub: string }[] = [
    { value: "excellent", icon: ShieldCheck, label: "Excellent", sub: "Sans trace" },
    { value: "rayures_legeres", icon: Minus, label: "Rayures légères", sub: "Légères marques" },
    { value: "endommage", icon: AlertCircle, label: "Endommagé", sub: "Chocs visibles" },
];

const BATTERY_OPTIONS: { value: BatteryCondition; icon: React.ElementType; label: string; sub: string }[] = [
    { value: "tient_bien", icon: Battery, label: "Tient bien", sub: "≥ 80% estimé" },
    { value: "se_decharge", icon: BatteryMedium, label: "Se décharge", sub: "70–79% estimé" },
    { value: "a_remplacer", icon: BatteryWarning, label: "À remplacer", sub: "< 60% estimé" },
];

const FUNC_OPTIONS: { value: FunctionalityIssue; icon: React.ElementType; label: string }[] = [
    { value: "tout_ok", icon: CheckCircle2, label: "Tout fonctionne" },
    { value: "probleme_camera", icon: Camera, label: "Caméra" },
    { value: "probleme_tactile", icon: Monitor, label: "Tactile" },
    { value: "probleme_bouton", icon: AlertCircle, label: "Bouton" },
    { value: "autre", icon: HelpCircle, label: "Autre" },
];

export const ConditionStep = ({
    screenCondition, setScreenCondition,
    chassisCondition, setChassisCondition,
    batteryCondition, setBatteryCondition,
    functionalityIssues, setFunctionalityIssues,
}: ConditionStepProps) => {
    const toggleFunc = (val: FunctionalityIssue) => {
        if (val === "tout_ok") {
            setFunctionalityIssues(["tout_ok"]);
        } else {
            const without = functionalityIssues.filter(f => f !== "tout_ok");
            if (without.includes(val)) {
                setFunctionalityIssues(without.filter(f => f !== val));
            } else {
                setFunctionalityIssues([...without, val]);
            }
        }
    };

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-lg font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">
                        2. État de l'appareil
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Sélectionnez l'état de chaque composant
                    </p>
                </div>
            </div>

            {/* Screen */}
            <div>
                <SectionLabel num="A" label="Écran" />
                <div className="flex gap-2">
                    {SCREEN_OPTIONS.map(opt => (
                        <OptionCard
                            key={opt.value}
                            value={opt.value}
                            selected={screenCondition === opt.value}
                            onSelect={setScreenCondition}
                            icon={opt.icon}
                            label={opt.label}
                            sub={opt.sub}
                        />
                    ))}
                </div>
            </div>

            {/* Chassis */}
            <div>
                <SectionLabel num="B" label="Châssis & dos" />
                <div className="flex gap-2">
                    {CHASSIS_OPTIONS.map(opt => (
                        <OptionCard
                            key={opt.value}
                            value={opt.value}
                            selected={chassisCondition === opt.value}
                            onSelect={setChassisCondition}
                            icon={opt.icon}
                            label={opt.label}
                            sub={opt.sub}
                        />
                    ))}
                </div>
            </div>

            {/* Battery */}
            <div>
                <SectionLabel num="C" label="Batterie" />
                <div className="flex gap-2">
                    {BATTERY_OPTIONS.map(opt => (
                        <OptionCard
                            key={opt.value}
                            value={opt.value}
                            selected={batteryCondition === opt.value}
                            onSelect={setBatteryCondition}
                            icon={opt.icon}
                            label={opt.label}
                            sub={opt.sub}
                        />
                    ))}
                </div>
            </div>

            {/* Functionalities */}
            <div>
                <SectionLabel num="D" label="Fonctionnalités" />
                <div className="grid grid-cols-3 gap-2">
                    {FUNC_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleFunc(opt.value)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-150 cursor-pointer",
                                functionalityIssues.includes(opt.value)
                                    ? "border-blue-600 bg-blue-50 dark:border-primary dark:bg-primary/10"
                                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
                            )}
                        >
                            <opt.icon className={cn(
                                "w-4 h-4 shrink-0",
                                functionalityIssues.includes(opt.value) ? "text-blue-600 dark:text-primary" : "text-slate-400 dark:text-zinc-500"
                            )} />
                            <span className={cn(
                                "text-[9px] font-black text-center leading-none",
                                functionalityIssues.includes(opt.value) ? "text-blue-700 dark:text-primary" : "text-slate-700 dark:text-zinc-300"
                            )}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
