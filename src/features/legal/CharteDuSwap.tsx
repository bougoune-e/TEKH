import { Link } from "react-router-dom";
import { ChevronLeft, RefreshCw, Zap, ShieldCheck } from "lucide-react";

const CharteDuSwap = () => {
    return (
        <main className="pt-24 pb-12 bg-white dark:bg-black text-black dark:text-white min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <RefreshCw className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Charte du <span className="text-primary">SWAP</span></h1>
                    <p className="text-muted-foreground font-bold leading-relaxed italic">"Changez de téléphone, pas de budget."</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12 font-bold leading-relaxed text-lg">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Qu'est-ce que le SWAP ?</h2>
                        <p>
                            Le SWAP est le cœur battant de TΞKΗ+. C'est un processus d'échange circulaire qui permet de transformer
                            la valeur de votre téléphone actuel en un crédit immédiat pour l'acquisition d'un modèle supérieur.
                            Finis les tracas de la vente et les négociations sans fin.
                        </p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8 my-12">
                        <div className="p-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-white">
                            <Zap className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-xl font-black mb-2 uppercase">Vitesse</h3>
                            <p className="text-sm opacity-80">Estimation en 30 secondes, échange finalisé en moins de 24h.</p>
                        </div>
                        <div className="p-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-white">
                            <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-xl font-black mb-2 uppercase">Sécurité</h3>
                            <p className="text-sm opacity-80">Chaque appareil est certifié par nos experts avant d'entrer dans le circuit.</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. La Règle d'Or de l'Équité</h2>
                        <p>
                            Notre algorithme calcule la <strong className="text-black dark:text-white">Valeur de Reprise TEKH+ (VRT)</strong>
                            en utilisant des coefficients réels basés sur l'argus du marché et l'état de votre appareil.
                            Nous garantissons que cette valeur est juste et reflète la réalité technologique de votre produit.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Les Étapes du SWAP</h2>
                        <ol className="list-decimal pl-6 space-y-4">
                            <li><span className="font-black">Simulation :</span> Obtenez une estimation instantanée sur l'application.</li>
                            <li><span className="font-black">Diagnostic physique :</span> Un technicien TEKH+ vérifie l'état de l'appareil.</li>
                            <li><span className="font-black">Certification :</span> Votre téléphone reçoit son label DEALBOX.</li>
                            <li><span className="font-black">Échange :</span> Vous repartez avec votre nouveau téléphone.</li>
                        </ol>
                    </section>

                    <section className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-[40px] shadow-2xl">
                        <h2 className="text-2xl font-black mb-4 uppercase">Un impact Durable</h2>
                        <p className="opacity-90">
                            Chaque SWAP réalisé réduit les déchets technologiques et prolonge la durée de vie des appareils.
                            C'est notre contribution à une consommation plus responsable en Afrique.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default CharteDuSwap;
