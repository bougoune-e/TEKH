import { BadgeCheck, ShieldCheck, Heart, Zap, Globe, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const CharteQualite = () => {
    const sections = [
        {
            icon: BadgeCheck,
            title: "Certification Rigoureuse",
            desc: "Chaque appareil entrant dans l'écosystème TEKH+ subit un diagnostic de 50 points de contrôle. De l'intégrité de la batterie à la réactivité tactile, rien n'est laissé au hasard."
        },
        {
            icon: ShieldCheck,
            title: "Protection Anti-Fraude",
            desc: "Nous vérifions systématiquement l'origine des appareils. Tout téléphone listé comme volé, bloqué iCloud/Google ou contrefait est immédiatement banni pour garantir votre sécurité."
        },
        {
            icon: Gauge,
            title: "Transparence de l'Argus",
            desc: "Nos prix sont basés sur un algorithme de cotation en temps réel qui reflète la réalité du marché local et international, assurant une équité totale pour l'acheteur et le vendeur."
        },
        {
            icon: Zap,
            title: "Réactivité Technique",
            desc: "Notre SAV s'engage à traiter toute demande technique sous 24h. Nous ne vendons pas seulement des téléphones, nous vendons la tranquillité d'esprit sur le long terme."
        },
        {
            icon: Globe,
            title: "Engagement Durable",
            desc: "En privilégiant le swap et le reconditionnement, vous participez activement à la réduction des déchets électroniques au Togo et préservez les ressources de notre planète."
        },
        {
            icon: Heart,
            title: "Culture de l'Excellence",
            desc: "La satisfaction client est notre étoile du berger. Nous formons continuellement nos techniciens pour rester à la pointe des innovations mobiles (IA, 5G, Optimisation OS)."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour à l'accueil
                </Link>

                <header className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Notre Charte <br /><span className="text-primary tracking-normal">Qualité & Excellence</span></h1>
                    <p className="text-xl text-slate-500 font-bold max-w-3xl leading-relaxed">
                        Plus qu'un simple document, notre charte est le socle de confiance sur lequel repose TEKH+. Elle définit nos standards d'exigence pour chaque transaction.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {sections.map((sec, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border-2 border-black dark:border-white hover:border-primary transition-all duration-500 shadow-xl group">
                            <div className="h-12 w-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <sec.icon className="h-6 w-6 text-white dark:text-black" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{sec.title}</h3>
                            <p className="text-slate-500 font-bold leading-relaxed">{sec.desc}</p>
                        </div>
                    ))}
                </div>

                <section className="prose prose-zinc dark:prose-invert max-w-none space-y-12 font-bold leading-relaxed text-lg mb-20">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter border-l-8 border-primary pl-6">Le Label DEALBOX</h2>
                        <p>
                            Le label DEALBOX est l'incarnation physique de notre Charte Qualité. Lorsqu'un appareil est certifié par nos experts, il est scellé dans une boîte premium incluant son rapport de santé technique complet et sa carte de garantie.
                        </p>
                        <p>
                            Nous garantissons que chaque composant critique (Écran, Batterie, Appareil Photo) a été audité pour offrir des performances proches du neuf. C'est l'assurance TEKH+ : l'innovation sans le prix du neuf, mais avec la même sécurité.
                        </p>
                    </div>
                </section>

                <div className="p-12 bg-black dark:bg-white text-white dark:text-black rounded-[40px] shadow-2xl text-center">
                    <h3 className="text-3xl font-black mb-4 uppercase">Un standard inaltérable</h3>
                    <p className="text-xl opacity-80 mb-8">Nous mettons à jour nos protocoles tous les trimestres pour intégrer les nouvelles technologies.</p>
                    <Link to="/contact" className="inline-block px-10 py-4 bg-primary text-black rounded-2xl font-black hover:scale-105 transition-transform">
                        Question technique ?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CharteQualite;
