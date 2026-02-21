import { Badge } from "@/shared/ui/badge";
import { ShieldCheck, CheckCircle2, Battery, Smartphone, Eraser } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

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
        <Card className="border-primary/20 bg-primary/5 dark:bg-zinc-900 shadow-2xl rounded-[32px] overflow-hidden">
            <div className="bg-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-glow">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Cette Dealbox est auditée par TEKH</h3>
                        <p className="text-xs text-muted-foreground font-medium">Certification de confiance & Garantie Premium</p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-full border-primary/40 text-primary font-bold hover:bg-primary hover:text-white transition-all">
                    Voir le certificat
                </Button>
            </div>
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">25 Points de Contrôle</h4>
                        <p className="text-[10px] text-muted-foreground">Écran, tactile, boutons, capteurs vérifiés.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Battery className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Santé Batterie {'>'} 85%</h4>
                        <p className="text-[10px] text-muted-foreground">Capacité optimale garantie.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Eraser className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Données Effacées</h4>
                        <p className="text-[10px] text-muted-foreground">Certificat d'effacement sécurisé Blancco®.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Garantie 6 Mois</h4>
                        <p className="text-[10px] text-muted-foreground">Panne matérielle couverte.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
