import { Link } from "react-router-dom";
import { ChevronLeft, ShoppingBag } from "lucide-react";

export default function CGV() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <ShoppingBag className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Conditions Générales de Vente</h1>
                    <p className="text-muted-foreground font-bold italic">Dernière mise à jour : 18 février 2026</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales de Vente (CGV) s’appliquent à toutes les transactions réalisées via la plateforme TEKH+, exploitée par TEKH+ Togo, immatriculée à Lomé, Togo.
                            Elles définissent les droits et obligations de TEKH+ et des utilisateurs (acheteurs et vendeurs) concernant la vente, l’achat, le trade-in, et la certification d’appareils électroniques.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Acceptation des CGV</h2>
                        <p>
                            Toute commande passée sur TEKH+ implique l’acceptation sans réserve des présentes CGV. L’utilisateur reconnaît avoir pris connaissance de ces conditions avant toute transaction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Produits et Services</h2>
                        <p>TEKH+ propose :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>La vente d’appareils électroniques d’occasion certifiés (smartphones, ordinateurs, tablettes, etc.).</li>
                            <li>Le trade-in (reprise d’appareils usagés contre un bon d’achat ou un paiement).</li>
                            <li>La certification des appareils (test, garantie, Dealbox).</li>
                            <li>Les services techniques (réparation, installation, SAV).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Prix et Paiement</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><span className="text-black dark:text-white uppercase font-black">Prix :</span> Les prix sont indiqués en FCFA et toutes taxes comprises (TTC).</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Moyens de paiement :</span> Mobile money (Flooz, TMoney), carte bancaire, virement.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Sécurité :</span> Les paiements sont sécurisés via des partenaires agréés.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Commande et Livraison</h2>
                        <p>Validation : La commande est définitive après confirmation de paiement. Délais et frais de livraison indiqués avant validation.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">6. Certification et Garantie</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><span className="text-black dark:text-white uppercase font-black">Certification :</span> Chaque appareil est certifié après un test technique rigoureux.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Garantie légale :</span> Les appareils certifiés bénéficient d’une garantie couvrant les défauts de fonctionnement non déclarés.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">7. Droit de Rétractation</h2>
                        <p>Conformément à la loi togolaise, vous disposez d’un délai de rétractation pour retourner un appareil non ouvert/non utilisé.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">8. Trade-in (Reprise)</h2>
                        <p>L'estimation est déterminée par l’algorithme de cotation TEKH+ après évaluation de l’état de l’appareil.</p>
                    </section>

                    <section className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] border-2 border-black dark:border-white mt-12">
                        <h2 className="text-2xl font-black mb-4">Une question sur votre commande ?</h2>
                        <p className="mb-6">Notre équipe commerciale est à votre écoute pour toute précision sur les conditions de vente.</p>
                        <Link to="/contact" className="inline-block px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
                            Support Commercial
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
