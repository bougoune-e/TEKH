import { Link } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    Retour
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <Lock className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Politique de Confidentialité</h1>
                    <p className="text-muted-foreground font-bold italic">Dernière mise à jour : 18 février 2026</p>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Introduction</h2>
                        <p>
                            TEKH+ (« nous », « notre ») s’engage à protéger la vie privée de ses utilisateurs. Cette Politique de Confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos données personnelles lorsque vous utilisez notre plateforme.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Données Collectées</h2>
                        <p>Nous collectons les données suivantes :</p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><span className="text-black dark:text-white uppercase font-black">Informations d’inscription :</span> nom, email, numéro de téléphone, adresse.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Données de transaction :</span> historique d’achat/vente, moyens de paiement (sans stockage des détails bancaires).</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Données techniques :</span> adresse IP, type de navigateur, pages visitées.</li>
                            <li><span className="text-black dark:text-white uppercase font-black">Données de certification :</span> état des appareils, résultats des tests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Utilisation des Données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Fournir et améliorer nos services.</li>
                            <li>Traiter vos commandes et paiements.</li>
                            <li>Vous contacter (confirmation, SAV, promotions).</li>
                            <li>Analyser l’utilisation de la plateforme.</li>
                            <li>Respecter nos obligations légales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Partage des Données</h2>
                        <p>Nous ne vendons pas vos données. Nous les partageons uniquement avec :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Partenaires logistiques (livraison, paiement).</li>
                            <li>Prestataires techniques (hébergement, sécurité).</li>
                            <li>Autorités légales si requis par la loi togolaise.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Sécurité</h2>
                        <p>Nous mettons en place des mesures de sécurité (chiffrement, accès restreint) pour protéger vos données contre toute perte ou accès non autorisé.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">6. Vos Droits</h2>
                        <p>Conformément à la loi togolaise, vous avez le droit de :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Accéder, modifier ou supprimer vos données.</li>
                            <li>Vous opposer à leur utilisation.</li>
                            <li>Demander leur portabilité.</li>
                        </ul>
                        <p className="mt-4 font-black">Contact : privacy@tekhplus.com</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">7. Cookies</h2>
                        <p>Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez les désactiver dans les paramètres de votre navigateur.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
