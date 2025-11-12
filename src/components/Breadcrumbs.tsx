import { Link, useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Accueil",
  "/deals": "Voir les deals",
  "/simulateur": "Simulateur",
  "/comment-ca-marche": "Comment ça marche",
  "/charte": "Charte",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/").filter(Boolean);

  const crumbs = ["/", ...segments.map((_, i) => `/${segments.slice(0, i + 1).join("/")}`)];

  return (
    <div className="container mx-auto px-4 mt-2 mb-4 text-sm text-muted-foreground">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
        {crumbs.map((p, idx) => {
          const isLast = idx === crumbs.length - 1;
          const label = titles[p] ?? p.split("/").pop();
          return (
            <span key={p} className="flex items-center gap-2">
              {idx > 0 && <span className="opacity-60">/</span>}
              {isLast ? (
                <span className="text-foreground font-medium">{label}</span>
              ) : (
                <Link to={p} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumbs;
