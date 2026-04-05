import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook partagé pour les boutons "Retour" des pages légales.
 * - Si déjà sur "/", scrolle directement vers le footer.
 * - Sinon, navigue vers "/" puis scrolle vers le footer dès qu'il est dans le DOM.
 *   Retry pendant 3 secondes (30 × 100ms) pour absorber le lazy-loading et Suspense.
 */
export function useGoToFooter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(() => {
    const scrollToFooter = () => {
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById("footer");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts++ < 30) {
          setTimeout(tryScroll, 100);
        }
      };
      // Premier essai après un tick pour laisser React finir le rendu
      setTimeout(tryScroll, 50);
    };

    if (pathname === "/") {
      scrollToFooter();
    } else {
      navigate("/");
      // Démarre les retries immédiatement — le footer (dans Layout) est
      // rendu dès que pathname === "/" même pendant le chargement de la page.
      scrollToFooter();
    }
  }, [navigate, pathname]);
}
