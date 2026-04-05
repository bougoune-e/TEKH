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
    console.log("[useGoToFooter] Clicked. Current pathname:", pathname, "History length:", window.history.length);

    if (pathname === "/") {
      console.log("[useGoToFooter] Already on home, scrolling to footer.");
      const el = document.getElementById("footer");
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (window.history.length > 1) {
      console.log("[useGoToFooter] History > 1, calling navigate(-1)");
      navigate(-1);

      // Fallback au cas où navigate(-1) ne déclenche rien après 500ms
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          console.log("[useGoToFooter] navigate(-1) fallback: going to /#footer");
          navigate("/#footer");
        }
      }, 500);
    } else {
      console.log("[useGoToFooter] History <= 1, calling navigate('/')");
      navigate("/");
    }
  }, [navigate, pathname]);
}
