import { cn } from "@/core/api/utils";
import { CheckCircle2, Circle } from "lucide-react";

export type LogisticsStatus =
    | 'Estimé'
    | 'Déposé en Point Relais'
    | 'En Transit'
    | 'En Réparation'
    | 'Prêt'
    | 'completed';

interface Step {
    id: LogisticsStatus;
    label: string;
    description: string;
}

const STEPS: Step[] = [
    { id: 'Estimé', label: 'Appareil Estimé', description: 'Prix simulé en ligne validé.' },
    { id: 'Déposé en Point Relais', label: 'Déposé en Point Relais', description: 'En attente de prise en charge par notre coursier.' },
    { id: 'En Transit', label: 'En Transit', description: 'Votre appareil est en route vers notre laboratoire technique.' },
    { id: 'En Réparation', label: 'En Diagnostic / Réparation', description: 'Nos techniciens certifiés reconditionnent votre téléphone.' },
    { id: 'Prêt', label: 'Prêt / Validé', description: "L'appareil est prêt. Vos Tekhpoints/Avantages sont disponibles !" },
];

const statusOrder: LogisticsStatus[] = ['Estimé', 'Déposé en Point Relais', 'En Transit', 'En Réparation', 'Prêt', 'completed'];

interface LogisticsTimelineProps {
    currentStatus: LogisticsStatus;
    className?: string;
}

export const LogisticsTimeline = ({ currentStatus, className }: LogisticsTimelineProps) => {
    const currentIdx = statusOrder.indexOf(currentStatus);

    return (
        <div className={cn("p-6 bg-card border border-border/60 rounded-3xl shadow-xl max-w-md mx-auto my-4 overflow-hidden relative", className)}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />

            <h3 className="text-xl font-black text-foreground mb-8 tracking-tighter uppercase italic flex items-center gap-2">
                <span className="h-4 w-1 bg-[#059669] rounded-full" />
                Suivi Logistique
            </h3>

            <div className="relative pl-8 space-y-10">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-zinc-800" />

                {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIdx || String(currentStatus) === 'completed';
                    const isCurrent = idx === currentIdx && String(currentStatus) !== 'completed';
                    const isUpcoming = idx > currentIdx && String(currentStatus) !== 'completed';

                    return (
                        <div key={step.id} className="relative group">
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 border-card z-10 transition-all duration-500 flex items-center justify-center",
                                isCompleted ? "bg-[#059669] scale-110 shadow-[0_0_15px_rgba(52,211,153,0.4)]" :
                                    isCurrent ? "bg-[#059669] animate-pulse scale-125 shadow-[0_0_20px_rgba(52,211,153,0.6)]" :
                                        "bg-slate-200 dark:bg-zinc-700"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-3 w-3 text-white" /> :
                                    isCurrent ? <Circle className="h-2 w-2 text-white fill-current" /> : null}
                            </div>

                            {/* Connecting Line (active part) */}
                            {idx < STEPS.length - 1 && (isCompleted || (isCurrent && String(currentStatus) !== 'completed')) && (
                                <div className={cn(
                                    "absolute -left-[28px] top-7 w-0.5 h-10 z-0 bg-[#059669] transition-all duration-1000 origin-top",
                                    isCompleted ? "scale-y-100" : "scale-y-0"
                                )} />
                            )}

                            <div className={cn(
                                "transition-all duration-500",
                                isUpcoming ? "opacity-40 grayscale" : "opacity-100"
                            )}>
                                <p className={cn(
                                    "font-black text-sm uppercase tracking-tight font-sans transition-colors duration-500",
                                    isCompleted || isCurrent ? "text-[#059669] dark:text-[#34d399]" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-bold mt-1 leading-snug">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {String(currentStatus) === 'completed' && (
                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest italic">
                        Processus terminé avec succès
                    </p>
                </div>
            )}
        </div>
    );
};
