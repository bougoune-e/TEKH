import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";

const PolitiqueConfidentialite = () => {
  return (
    <main className="pt-24 pb-12 bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </Link>

        <header className="mb-12">
          <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <ShieldCheck className="h-8 w-8 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Politique de Confidentialité</h1>
          <p className="text-muted-foreground font-bold leading-relaxed">Comment nous protégeons vos données chez TΞKΗ+.</p>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Collecte des Données</h2>
            <p>
              Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte,
              de l'utilisation du simulateur de trade-in, ou lors de vos transactions. Cela inclut votre nom,
              adresse email, numéro de téléphone et les spécifications de vos appareils.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Utilisation des Données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gérer votre compte et vos transactions.</li>
              <li>Calculer des estimations précises pour vos échanges.</li>
              <li>Améliorer nos services et votre expérience utilisateur.</li>
              <li>Assurer la sécurité de la plateforme et prévenir la fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Partage des Données</h2>
            <p>
              <strong className="text-black dark:text-white uppercase font-black">Nous ne vendons jamais vos données personnelles.</strong>
              Le partage de données se limite à nos partenaires logistiques et de paiement strictement nécessaires
              au bon déroulement de vos commandes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Vos Droits</h2>
            <p>
              Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès,
              de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits
              directement depuis les paramètres de votre compte ou en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles rigoureuses pour
              protéger vos données contre tout accès non autorisé, altération ou destruction.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PolitiqueConfidentialite;
