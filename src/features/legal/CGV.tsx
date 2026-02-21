import { Link } from "react-router-dom";
import { ChevronLeft, ShoppingBag } from "lucide-react";

const CGV = () => {
  return (
    <main className="pt-24 pb-12 bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </Link>

        <header className="mb-12">
          <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <ShoppingBag className="h-8 w-8 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Conditions Générales de Vente</h1>
          <p className="text-muted-foreground font-bold leading-relaxed">Règles applicables aux achats et échanges sur TΞKΗ+.</p>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Prix et Paiement</h2>
            <p>
              Les prix affichés sont en Francs CFA (XOF). Le paiement est exigible immédiatement à la commande.
              Nous acceptons les paiements via Mobile Money, Carte Bancaire et Virement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Modalités d'Échange (Swap)</h2>
            <p>
              L'échange est basé sur la Valeur de Reprise TEKH+ (VRT) de votre ancien appareil.
              La différence (soulte) entre le prix de l'appareil cible et la VRT doit être réglée par l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Livraison</h2>
            <p>
              Les délais de livraison varient selon votre localisation. TΞKΗ+ s'engage à expédier les produits
              certifiés sous 24h à 48h jours ouvrables après confirmation de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Rétractation et Retours</h2>
            <p>
              Conformément à la réglementation, vous disposez d'un délai de 7 jours pour retourner un produit
              qui ne vous conviendrait pas, à condition qu'il soit dans son état d'origine et avec son package DEALBOX complet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">5. Garantie</h2>
            <p>
              Tous nos produits certifiés bénéficient d'une garantie technique. La durée et les modalités
              spécifiques sont précisées sur la fiche de chaque produit et dans le package DEALBOX.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CGV;
