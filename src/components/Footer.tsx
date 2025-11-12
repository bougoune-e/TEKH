import { Smartphone, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-card border-t border-border/50 relative">
      {/* Effet de fond subtil */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-lg rounded-lg"></div>
                <div className="relative bg-gradient-hero p-2.5 rounded-lg shadow-glow">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
                SWAP
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Plateforme d'échange de smartphones entre utilisateurs, avec compensation sécurisée.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#deals" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">
                  Nos deals
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#charte" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">
                  Charte
                </a>
              </li>
              <li>
                <a href="#simulator" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">
                  Simulateur
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Légal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#charte" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">
                  Conditions & Charte
                </a>
              </li>
              <li>
                <span className="text-muted-foreground inline-block">Politique de confidentialité (à venir)</span>
              </li>
              <li>
                <span className="text-muted-foreground inline-block">Garanties (à venir)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Pour toute question, consultez la section Charte & Conditions. Les coordonnées officielles seront publiées prochainement.
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} SWAP. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
