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
    if (pathname === "/") {
      // Déjà sur la homepage : sauter directement au footer
      const el = document.getElementById("footer");
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (window.history.length > 1) {
      // Retour navigateur standard — ScrollRestorer restaure la position exacte
      navigate(-1);
    } else {
      // Deep link : pas d'historique, on revient au top de la homepage
      navigate("/");
    }
  }, [navigate, pathname]);
}
