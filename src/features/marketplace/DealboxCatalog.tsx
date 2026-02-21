import { useEffect, useState } from "react";
import { fetchDealboxes } from "@/core/api/supabaseApi";
import DealboxCard, { DealboxProps } from "@/features/marketplace/DealboxCard";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function DealboxCatalog() {
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEstimate, setUserEstimate] = useState<number | undefined>(undefined);

    useEffect(() => {
        // Load user estimate
        const savedEst = localStorage.getItem("tekh_estimate");
        if (savedEst) {
            setUserEstimate(Number(savedEst));
        }

        async function loadDeals() {
            setLoading(true);
            try {
                const data = await fetchDealboxes();
                setDeals(data || []);
            } catch (error) {
                console.error("Error loading deals:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDeals();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 font-sans">
            <header className="max-w-6xl mx-auto py-8 flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="text-yellow-400" /> TEKH DEALBOX
                    </h1>
                    <p className="text-zinc-400 mt-1">Offres exclusives à durée limitée. Échangez votre ancien téléphone.</p>
                </div>
                <Link to="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                    Retour
                </Link>
            </header>

            <main className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Recherche des meilleures offres...</div>
                ) : deals.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 border border-zinc-800 rounded-lg bg-zinc-900/50">
                        Aucune Dealbox disponible pour le moment. Revenez plus tard !
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.map(deal => (
                            <DealboxCard
                                key={deal.id}
                                deal={{ ...deal, userEstimate }}
                                onBuy={(id) => console.log("Buy process started for", id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
