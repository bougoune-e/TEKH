import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeals } from "@/context/DealsContext";
import { getSwapGap } from "@/lib/pricing";
import { ArrowRightLeft, Calculator, Smartphone, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function SwapGapWidget({ dealPrice, dealId }: { dealPrice: number; dealId: string }) {
    const { lastSimulation } = useDeals();
    const [userValue, setUserValue] = useState<number>(0);
    const [gapData, setGapData] = useState<{ gap: number; isPositive: boolean; formatted: string } | null>(null);

    useEffect(() => {
        // If we have a simulation from the homepage, use it as default
        if (lastSimulation?.estimated) {
            setUserValue(lastSimulation.estimated);
        }
    }, [lastSimulation]);

    useEffect(() => {
        const data = getSwapGap(userValue, dealPrice);
        setGapData(data);
    }, [userValue, dealPrice]);

    return (
        <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                    <ArrowRightLeft className="h-4 w-4" />
                    Simulateur de Swap
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground">Valeur de votre téléphone actuel</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={userValue || ''}
                                onChange={(e) => setUserValue(Number(e.target.value))}
                                placeholder="Ex: 150000"
                                className="pl-9 bg-background"
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0" title="Estimer mon téléphone"><Calculator className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="p-4 text-center">
                                    <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
                                    <h3 className="font-semibold text-lg">Estimation Rapide</h3>
                                    <p className="text-muted-foreground text-sm mb-4">Utilisez notre simulateur complet pour une valeur précise.</p>
                                    <Button onClick={() => window.location.href = '/#simulateur'}>Aller au simulateur</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {gapData && (
                    <div className={`rounded-xl p-4 border ${gapData.isPositive ? 'bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50' : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium opacity-80">{gapData.isPositive ? 'Reste à payer' : 'Nous vous devons'}</span>
                            <span className={`text-xl font-bold ${gapData.isPositive ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {gapData.formatted}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div
                                className={`h-full ${gapData.isPositive ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (Math.abs(gapData.gap) / dealPrice) * 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Estimation indicative hors frais de service éventuels.
                        </p>
                        <Button className="w-full mt-3 font-semibold" variant={gapData.isPositive ? 'default' : 'secondary'}>
                            Proposer ce Swap
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
