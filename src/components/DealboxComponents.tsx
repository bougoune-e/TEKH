import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Battery, Smartphone, Eraser } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DealboxBadge() {
    return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1.5 py-1 px-3 text-sm font-semibold shadow-md">
            <ShieldCheck className="h-4 w-4" />
            DEALBOX CERTIFIE
        </Badge>
    );
}

export function CertificationDetails() {
    return (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    Certification TEKH
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">25 Points de Contrôle</h4>
                        <p className="text-xs text-muted-foreground">Écran, tactile, boutons, capteurs vérifiés.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                        <Battery className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Santé Batterie {'>'} 85%</h4>
                        <p className="text-xs text-muted-foreground">Capacité optimale garantie.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                        <Eraser className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Données Effacées</h4>
                        <p className="text-xs text-muted-foreground">Certificat Blancco® d'effacement sécurisé.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Garantie 6 Mois</h4>
                        <p className="text-xs text-muted-foreground">Panne matérielle couverte.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
