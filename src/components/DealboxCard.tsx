import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ShieldCheck, Gem, Smartphone, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export type DealboxProps = {
    id: string;
    modele: string;
    stockage: number;
    prix_dealbox: number;
    type_box: "KING" | "QUEEN";
    expiration_date: string;
    certifications: any;
    userEstimate?: number;
};

export default function DealboxCard({ deal, onBuy }: { deal: DealboxProps, onBuy: (id: string) => void }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(deal.expiration_date).getTime();
            const dist = end - now;

            if (dist < 0) {
                setExpired(true);
                clearInterval(interval);
                setTimeLeft("00:00:00");
            } else {
                const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((dist % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [deal.expiration_date]);

    if (expired) return null;

    const isKing = deal.type_box === "KING";
    const themeColor = isKing ? "text-yellow-500" : "text-slate-300";
    const borderColor = isKing ? "border-yellow-500/50" : "border-slate-400/50";
    const bgGradient = isKing ? "from-yellow-950/30 to-black" : "from-slate-900/50 to-black";

    const swapGap = deal.userEstimate ? deal.prix_dealbox - deal.userEstimate : null;
    const coverPercent = deal.userEstimate ? Math.min(100, Math.round((deal.userEstimate / deal.prix_dealbox) * 100)) : 0;

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} border ${borderColor} text-white transition-all hover:scale-[1.02] shadow-2xl`}>
            {/* Header Badge */}
            <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold ${isKing ? "bg-yellow-500 text-black" : "bg-slate-200 text-black"} rounded-bl-xl`}>
                {isKing ? "KING EDITION" : "QUEEN EDITION"}
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-1">
                    <Smartphone size={16} />
                    <span>{deal.stockage} Go</span>
                </div>
                <h3 className={`text-2xl font-bold ${themeColor} tracking-tight`}>{deal.modele}</h3>

                {/* Certifications */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {deal.certifications?.data_wipe && (
                        <Badge variant="outline" className="text-xxs border-green-500/50 text-green-400 bg-green-950/20 py-0 h-5">
                            <ShieldCheck size={10} className="mr-1" /> Data-Wipe
                        </Badge>
                    )}
                    {deal.certifications?.diagnostic_50_pts && (
                        <Badge variant="outline" className="text-xxs border-blue-500/50 text-blue-400 bg-blue-950/20 py-0 h-5">
                            <ShieldCheck size={10} className="mr-1" /> 50 Pts Check
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Mystery Box Effect for Queen */}
                {!isKing && (
                    <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-900/20 p-2 rounded border border-purple-500/30">
                        <Gem size={14} /> <span>Contient des accessoires surprises</span>
                    </div>
                )}

                {/* Price & Timer */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Prix Dealbox</p>
                        <p className="text-3xl font-mono font-bold">{deal.prix_dealbox.toLocaleString()} <span className="text-sm font-sans font-normal text-zinc-500">FCFA</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-red-400 flex items-center justify-end gap-1"><Clock size={12} /> Expire dans</p>
                        <p className="font-mono text-red-500 text-lg tabular-nums">{timeLeft}</p>
                    </div>
                </div>

                {/* Swap Simulator */}
                {deal.userEstimate && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Votre téléphone couvre</span>
                            <span className={isKing ? "text-yellow-400" : "text-white"}>{coverPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${isKing ? "bg-yellow-500" : "bg-slate-200"}`}
                                style={{ width: `${coverPercent}%` }}
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <p className="text-xs text-zinc-400">Après échange, vous payez :</p>
                            <p className="text-xl font-bold text-green-400">{Math.max(0, swapGap || 0).toLocaleString()} FCFA</p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    className={`w-full ${isKing ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-white hover:bg-zinc-200 text-black"} font-bold`}
                    onClick={() => onBuy(deal.id)}
                >
                    {deal.userEstimate ? "SWAPPER MAINTENANT" : "ACHETER CE DEAL"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
