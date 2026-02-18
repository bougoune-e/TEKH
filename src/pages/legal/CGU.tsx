import { Link } from "react-router-dom";
import { ChevronLeft, Scale } from "lucide-react";

export default function CGU() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <Scale className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Conditions Générales d'Utilisation</h1>
                    <p className="text-muted-foreground font-bold italic">Dernière mise à jour : 18 février 2026</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales d’Utilisation (CGU) définissent les droits et obligations des utilisateurs de la plateforme TEKH+ (ci-après « la Plateforme »), exploitée par TEKH+, immatriculée à Lomé, Togo.
                            La Plateforme permet aux utilisateurs d’acheter, vendre, échanger, faire certifier et reconditionner des appareils électroniques, ainsi que d’accéder à des services techniques et de formation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Acceptation des CGU</h2>
                        <p>
                            L’accès et l’utilisation de la Plateforme sont subordonnés à l’acceptation sans réserve des présentes CGU. En créant un compte ou en utilisant les services de TEKH+, vous acceptez pleinement ces conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Création de Compte</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><span className="text-black dark:text-white uppercase font-black">Éligibilité :</span> L’utilisation de la Plateforme est réservée aux personnes majeures (18 ans et plus) ou aux mineurs accompagnés d’un représentant légal.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Informations exactes :</span> Vous vous engagez à fournir des informations exactes et à jour lors de la création de votre compte.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Responsabilité :</span> Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Services Proposés</h2>
                        <p>TEKH+ propose les services suivants :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Achat/Vente d’appareils électroniques d’occasion certifiés.</li>
                            <li>Trade-in : estimation et reprise d’appareils usagés.</li>
                            <li>Reconditionnement et certification des appareils.</li>
                            <li>Services techniques (réparation, installations OS, SAV).</li>
                            <li>Formations en métiers de l'informatique (Coding, IA, Systèmes et Réseaux).</li>
                            <li>API de cotation pour les professionnels.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Obligations des Utilisateurs</h2>
                        <p>Respect des lois : Vous vous engagez à utiliser la Plateforme conformément aux lois en vigueur au Togo et en Afrique de l’Ouest.</p>
                        <p className="mt-4 uppercase font-black">Interdictions : Il est interdit de :</p>
                        <ul className="list-disc pl-6 space-y-2 text-rose-500">
                            <li>Publier des annonces frauduleuses ou trompeuses.</li>
                            <li>Utiliser la Plateforme à des fins illégales.</li>
                            <li>Contourner les processus de certification ou de paiement.</li>
                            <li>Harceler ou menacer d’autres utilisateurs.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">6. Certification et Garantie</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><span className="text-black dark:text-white uppercase font-black">Processus de certification :</span> TEKH+ certifie les appareils selon des critères techniques précis (état, fonctionnalités, authenticité).</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Garantie :</span> Les appareils certifiés bénéficient d’une garantie limitée couvrant les défauts de fonctionnement non déclarés.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Exclusions :</span> La garantie ne couvre pas les dommages causés par une mauvaise utilisation, chute, ou modification non autorisée.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">7. Paiements et Transactions</h2>
                        <p>Moyens de paiement : Mobile money, carte bancaire, et virement. Toutes les transactions sont sécurisées.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">8. Protection des Données</h2>
                        <p>TEKH+ collecte les données nécessaires à la fourniture des services (nom, email, etc.). Vos données ne sont pas vendues à des tiers.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">9. Propriété Intellectuelle</h2>
                        <p>Tous les contenus de la Plateforme (logo, design, algorithmes) sont la propriété exclusive de TEKH+.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">10. Litiges</h2>
                        <p>Tout litige sera soumis aux tribunaux compétents de Lomé, Togo, conformément au droit togolais.</p>
                    </section>

                    <section className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] border-2 border-black dark:border-white mt-12">
                        <h2 className="text-2xl font-black mb-4">Besoin d'assistance ?</h2>
                        <p className="mb-6">Pour toute question relative aux présentes conditions ou pour une demande d'assistance technique.</p>
                        <Link to="/contact" className="inline-block px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
                            Contacter le Support
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
