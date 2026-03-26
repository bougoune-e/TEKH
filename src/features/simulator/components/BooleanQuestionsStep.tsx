import { Power, Touchpad, BatteryCharging, Fingerprint, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/core/api/utils";
import { Textarea } from "@/shared/ui/textarea";

export interface BooleanAnswers {
    power_on: boolean | null;
    touch_ok: boolean | null;
    charging_ok: boolean | null;
    biometric_ok: boolean | null;
}

export type InconsistencyFlag =
    | "incoherence_ecran_tactile"
    | "incoherence_batterie_charge"
    | "appareil_non_fonctionnel";

interface BooleanQuestionsStepProps {
    answers: BooleanAnswers;
    setAnswers: (v: BooleanAnswers) => void;
    userDescription: string;
    setUserDescription: (v: string) => void;
    inconsistencyFlags: InconsistencyFlag[];
}

const QUESTIONS: {
    key: keyof BooleanAnswers;
    icon: React.ElementType;
    question: string;
}[] = [
    { key: "power_on", icon: Power, question: "Le téléphone s'allume-t-il ?" },
    { key: "touch_ok", icon: Touchpad, question: "L'écran tactile fonctionne-t-il ?" },
    { key: "charging_ok", icon: BatteryCharging, question: "Le téléphone charge-t-il correctement ?" },
    { key: "biometric_ok", icon: Fingerprint, question: "Face ID / empreinte fonctionne-t-il ?" },
];

const FLAG_MESSAGES: Record<InconsistencyFlag, string> = {
    appareil_non_fonctionnel: "Appareil non fonctionnel — la valeur de reprise sera nulle.",
    incoherence_ecran_tactile: "Incohérence détectée : écran déclaré en bon état mais tactile non fonctionnel. L'état écran a été ajusté automatiquement.",
    incoherence_batterie_charge: "Incohérence détectée : batterie déclarée bonne mais charge défaillante. L'état batterie a été ajusté automatiquement.",
};

export const BooleanQuestionsStep = ({
    answers, setAnswers,
    userDescription, setUserDescription,
    inconsistencyFlags,
}: BooleanQuestionsStepProps) => {
    const set = (key: keyof BooleanAnswers, value: boolean) => {
        setAnswers({ ...answers, [key]: value });
    };

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tighter uppercase font-sans text-black dark:text-white italic">
                        3. Vérifications rapides
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                        4 questions — répondez par oui ou non
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {QUESTIONS.map(({ key, icon: Icon, question }) => {
                    const val = answers[key];
                    const isNonFonctionnel = key === "power_on" && val === false;

                    return (
                        <div key={key} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3 px-4 py-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-zinc-400" />
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 leading-snug">{question}</span>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => set(key, true)}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-wider transition-all",
                                            val === true
                                                ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                                                : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-500 hover:border-slate-300"
                                        )}
                                    >
                                        Oui
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => set(key, false)}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-wider transition-all",
                                            val === false
                                                ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-900/20 dark:text-rose-300"
                                                : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-500 hover:border-slate-300"
                                        )}
                                    >
                                        Non
                                    </button>
                                </div>
                            </div>

                            {isNonFonctionnel && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 leading-snug">
                                        Un appareil qui ne s'allume pas a une valeur de reprise de 0 FCFA.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Inconsistency flags */}
            {inconsistencyFlags.filter(f => f !== "appareil_non_fonctionnel").map(flag => (
                <div key={flag} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 leading-snug">
                        {FLAG_MESSAGES[flag]}
                    </p>
                </div>
            ))}

            {/* Optional description */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                        5. Description libre
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-500">
                        Optionnel
                    </span>
                </div>
                <Textarea
                    value={userDescription}
                    onChange={e => setUserDescription(e.target.value)}
                    placeholder="Décrivez réparations antérieures, chutes, problèmes spécifiques... L'IA utilisera ces infos pour affiner l'estimation."
                    className="min-h-[80px] rounded-xl border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-medium text-slate-700 dark:text-zinc-300 resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
            </div>
        </div>
    );
};
