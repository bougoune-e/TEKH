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

    // Stratégie : on tente le retour arrière pour laisser le ScrollRestorer (ScrollToTop.tsx)
    // restaurer la position EXACTE du footer ou de la section vue précédemment.
    if (window.history.length > 1) {
      navigate(-1);

      // Sécurité : si après 300ms on est toujours sur la même page (cas rare où -1 ne bouge pas)
      // on force le retour vers le footer.
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          navigate("/#footer", { replace: true });
        }
      }, 300);
    } else {
      // Pas d'historique (lien direct externe) : on va à la home au niveau du footer
      navigate("/#footer", { replace: true });
    }
  }, [navigate, pathname]);
}
