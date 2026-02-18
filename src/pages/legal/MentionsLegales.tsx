import { Link } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

export default function MentionsLegales() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <Info className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Mentions Légales</h1>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Éditeur</h2>
                        <ul className="list-none space-y-2 p-0">
                            <li><span className="text-black dark:text-white uppercase font-black">Nom :</span> TEKH+ Togo</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Siège social :</span> Lomé, Togo</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Immatriculation :</span> [Numéro RC ou équivalent]</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Représentant légal :</span> Desmond</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Hébergement</h2>
                        <ul className="list-none space-y-2 p-0">
                            <li><span className="text-black dark:text-white uppercase font-black">Hébergeur :</span> [Nom de l’hébergeur]</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Adresse :</span> [Adresse de l’hébergeur]</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Contact</h2>
                        <ul className="list-none space-y-2 p-0">
                            <li><span className="text-black dark:text-white uppercase font-black">Email :</span> contact@tekhplus.com</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Téléphone :</span> [numéro]</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Propriété Intellectuelle</h2>
                        <p>Tous les contenus de TEKH+ (logo, design, algorithmes) sont protégés par le droit d’auteur. Toute reproduction ou utilisation non autorisée est strictement interdite.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Responsabilité</h2>
                        <p>TEKH+ s’engage à fournir des services de qualité, mais ne peut être tenu responsable des dommages indirects liés à l’utilisation de la plateforme.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
