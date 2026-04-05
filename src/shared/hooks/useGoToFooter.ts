import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Bouton "Retour" des pages légales liées depuis le footer.
 *
 * Stratégie :
 * - Si l'utilisateur a un historique (il vient de la homepage) → navigate(-1).
 *   Le ScrollRestorer restaure automatiquement la position exacte du scroll
 *   (y compris au niveau du footer si c'est de là qu'il vient).
 * - Si pas d'historique (deep link direct) → navigate("/") vers le haut de la homepage.
 *
 * On n'utilise PLUS sessionStorage ni scrollIntoView ici : le ScrollRestorer
 * (ScrollToTop.tsx) gère tout ça nativement via les location.key.
 */
export function useGoToFooter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(() => {
    // Si déjà sur la homepage, scroller directement au footer
    if (pathname === "/") {
      const el = document.getElementById("footer");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Stratégie hybride : on tente le retour arrière pour préserver le scroll exact (via ScrollRestorer)
    // Mais on ajoute un fallback immédiat vers le hash #footer si on ne vient pas de la home.
    if (window.history.length > 1) {
      navigate(-1);

      // Fallback de sécurité : si après 200ms on est toujours sur la même page, 
      // on force le retour vers la home.
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          navigate("/#footer");
        }
      }, 200);
    } else {
      // Pas d'historique (deep link) : retour direct home
      navigate("/#footer");
    }
  }, [navigate, pathname]);
}
