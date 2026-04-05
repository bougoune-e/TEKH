import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SCROLL_KEY = "tekh:scrollTo";

/**
 * Sur la homepage, scrolle directement vers le footer (instantané).
 * Depuis une autre page, stocke la cible dans sessionStorage puis fait
 * un vrai back() navigateur — la page d'accueil est déjà dans le cache du
 * navigateur, elle réapparaît sans rerendu visible, et le Layout lit la
 * cible au montage pour scroller sans animation.
 */
export function useGoToFooter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(() => {
    const el = document.getElementById("footer");

    if (pathname === "/" && el) {
      // Déjà sur la homepage : saut instantané
      el.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    // Mémorise la cible avant de quitter la page
    sessionStorage.setItem(SCROLL_KEY, "footer");

    if (window.history.length > 1) {
      // Retour navigateur : la homepage réapparaît depuis le cache sans flash
      navigate(-1);
    } else {
      // Pas d'historique (deep link direct) : navigation explicite
      navigate("/");
    }
  }, [navigate, pathname]);
}

/**
 * À appeler dans le Layout au montage de chaque page.
 * Lit sessionStorage et scrolle si une cible est en attente.
 */
export function consumeScrollTarget() {
  const target = sessionStorage.getItem(SCROLL_KEY);
  if (!target) return;
  sessionStorage.removeItem(SCROLL_KEY);

  let attempts = 0;
  const tryScroll = () => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    } else if (attempts++ < 20) {
      setTimeout(tryScroll, 80);
    }
  };
  setTimeout(tryScroll, 60);
}
