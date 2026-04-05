import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook partagé pour les boutons "Retour" des pages légales.
 * Navigue vers "/" si nécessaire, puis scrolle instantanément
 * vers le footer (pas d'animation pour éviter le défilement visible).
 */
export function useGoToFooter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(() => {
    const jumpToFooter = () => {
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById("footer");
        if (el) {
          // Scroll instantané : pas de défilement visible de toute la page
          el.scrollIntoView({ behavior: "auto", block: "start" });
        } else if (attempts++ < 30) {
          setTimeout(tryScroll, 100);
        }
      };
      setTimeout(tryScroll, 50);
    };

    if (pathname === "/") {
      jumpToFooter();
    } else {
      // Masque brièvement le contenu pour éviter le flash de scroll
      const root = document.getElementById("root");
      if (root) root.style.visibility = "hidden";
      navigate("/");
      setTimeout(() => {
        jumpToFooter();
        if (root) root.style.visibility = "";
      }, 80);
    }
  }, [navigate, pathname]);
}
