import { Link } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

const MentionsLegales = () => {
  return (
    <main className="pt-24 pb-12 bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </Link>

        <header className="mb-12">
          <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Info className="h-8 w-8 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Mentions Légales</h1>
          <p className="text-muted-foreground font-bold leading-relaxed">Informations obligatoires concernant l'éditeur du site.</p>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 font-bold leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">1. Éditeur du Site</h2>
            <p>
              Le site TΞKΗ+ est édité par la société <strong className="text-black dark:text-white">TEKH SOLUTIONS</strong>,
              Société à Responsabilité Limitée (SARL) au capital de 1 000 000 FCFA.
              <br />Siège social : Quartier Agoè, Lomé, Togo.
              <br />Immatriculation : RCCM TG-LOM 2024 B XXXX.
              <br />Directeur de la publication : Kizerbo Desmond.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">2. Hébergement</h2>
            <p>
              La plateforme est hébergée par <strong className="text-black dark:text-white">Vercel Inc.</strong>,
              situé au 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">3. Propriété Intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation internationale sur le droit d'auteur et la propriété intellectuelle.
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations
              iconographiques et photographiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-primary">4. Contact</h2>
            <p>
              Pour toute question ou réclamation, vous pouvez nous contacter :
              <br />Par email : <a href="mailto:owldesmond8@gmail.com" className="text-primary underline">owldesmond8@gmail.com</a>
              <br />Par téléphone : +228 XX XX XX XX
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MentionsLegales;
