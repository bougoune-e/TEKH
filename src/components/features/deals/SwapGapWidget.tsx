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
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-[28px] border-2 border-dashed border-border/60">
                            <div className="flex items-center gap-3 text-sm font-black tracking-tighter uppercase opacity-60">
                                <span>Apport</span>
                                <span>+</span>
                                <span>Reste à payer</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xl font-bold text-foreground">{(userValue || 0).toLocaleString()} <span className="text-[10px]">F</span></span>
                                <span className="text-primary font-black">+</span>
                                <span className="text-2xl font-black text-primary">{(gapData.gap > 0 ? gapData.gap : 0).toLocaleString()} <span className="text-[10px]">FCFA</span></span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-border shadow-sm">
                                = Valeur de cette Dealbox
                            </div>
                        </div>

                        <div className={`rounded-[32px] p-6 border-2 shadow-xl ${gapData.isPositive ? 'bg-zinc-900 border-primary/40 text-white' : 'bg-emerald-600 border-emerald-400 text-white'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black uppercase tracking-widest opacity-80">{gapData.isPositive ? 'Votre Budget Gap' : 'Crédit TΞKΗ+'}</span>
                                <span className="text-2xl font-black italic">
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
                            <Button className="w-full mt-4 font-black rounded-full h-12 uppercase tracking-tighter bg-primary text-primary-foreground hover:scale-105 transition-transform" variant="default">
                                Demander un Swap Certifié
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
