
import { Mail, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logos/robott.jpeg";
import { buildWhatsAppUrl } from "@/core/utils/whatsapp";
import { useTranslation } from "react-i18next";
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);


const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const waHref =
    buildWhatsAppUrl("Bonjour TEKH+, je vous contacte depuis le site.") || "/contact";

  return (
    <footer id="footer" className="bg-background border-t border-border/50 relative overflow-hidden">
      {/* Overlay très léger pour la texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TΞKΗ+" className="h-9 w-9 rounded-xl ring-1 ring-border" />
              <span className="text-xl font-black tracking-tighter text-black dark:text-white">TΞKΗ+</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/50 mb-5">{t("footer.quickNavigation")}</h3>
            <nav>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/a-propos" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">{t("footer.about")}</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">{t("footer.contact")}</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-smooth font-medium inline-block">{t("footer.news")}</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/50 mb-5">{t("footer.legal")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/charte-qualite" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.quality")}</Link></li>
              <li><Link to="/charte-du-swap" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.swapCharter")}</Link></li>
              <li><Link to="/cgu" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.terms")}</Link></li>
              <li><Link to="/cgv" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.salesTerms")}</Link></li>
              <li><Link to="/politique-confidentialite" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.privacy")}</Link></li>
              <li><Link to="/aide-et-faq" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.help")}</Link></li>
              <li><Link to="/mentions-legales" className="text-muted-foreground hover:text-primary transition-smooth font-medium">{t("footer.notices")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/50 mb-5">{t("footer.social")}</h3>
            <div className="flex items-center gap-3 mb-5">
              <a href="https://www.facebook.com/profile.php?id=61587680237623" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent hover:border-primary/20 transition-all">
                <Facebook className="h-5 w-5 text-[#1877F2]" />
              </a>
              <a href="https://www.tiktok.com/@tekh228?_r=1&_t=ZS-94xayuFa6LN" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-10 w-10 p-1.5 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent transition-all">
                <TikTokIcon className="h-5 w-5 text-black dark:text-white" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent hover:border-primary/20 transition-all">
                <Instagram className="h-5 w-5 text-[#E4405F]" />
              </a>
              <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent hover:border-primary/20 transition-all">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              </a>
            </div>
            <a href="mailto:tekhswap@gmail.com" className="text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth">
              <Mail className="h-4 w-4" /> tekhswap@gmail.com
            </a>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{t("footer.location")}</p>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} TΞKΗ+. {t("footer.rights")}</p>
          <p className="mt-2 text-xs text-muted-foreground/70 max-w-xl mx-auto leading-relaxed">
            {t("footer.betaNotice")} {t("footer.betaContact")} {" "}
            <a href="mailto:tekhswap@gmail.com" className="hover:text-primary transition-colors underline underline-offset-2">
              tekhswap@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
