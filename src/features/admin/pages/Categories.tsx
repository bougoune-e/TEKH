import { useEffect, useState, useMemo } from "react";
import { fetchAllDealsForAdmin } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { Badge } from "@/shared/ui/badge";
import EmptyState from "../components/EmptyState";
import { ChevronDown, ChevronRight } from "lucide-react";

type ModelEntry = { model: string; count: number; published: number };
type BrandEntry = { brand: string; total: number; published: number; models: ModelEntry[] };

const CONDITIONS: Record<string, string> = {
  like_new: "Comme neuf",
  good: "Bon état",
  average: "Passable",
  damaged: "Endommagé",
};

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandEntry[]>([]);
  const [conditions, setConditions] = useState<{ label: string; count: number }[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    fetchAllDealsForAdmin()
      .then((list) => {
        // Grouper par marque → modèle
        const brandMap: Record<string, Record<string, { total: number; published: number }>> = {};
        const condMap: Record<string, number> = {};

        for (const item of list as any[]) {
          const brand = item.brand || "Inconnu";
          const model = item.model || "Inconnu";
          const status = item.status;
          const cond = item.condition || "unknown";

          if (!brandMap[brand]) brandMap[brand] = {};
          if (!brandMap[brand][model]) brandMap[brand][model] = { total: 0, published: 0 };
          brandMap[brand][model].total++;
          if (status === "published") brandMap[brand][model].published++;

          condMap[cond] = (condMap[cond] || 0) + 1;
        }

        const brandList: BrandEntry[] = Object.entries(brandMap)
          .map(([brand, models]) => {
            const modelList: ModelEntry[] = Object.entries(models)
              .map(([model, s]) => ({ model, count: s.total, published: s.published }))
              .sort((a, b) => b.count - a.count);
            const total = modelList.reduce((s, m) => s + m.count, 0);
            const published = modelList.reduce((s, m) => s + m.published, 0);
            return { brand, total, published, models: modelList };
          })
          .sort((a, b) => b.total - a.total);

        const condList = Object.entries(condMap)
          .map(([key, count]) => ({ label: CONDITIONS[key] || key, count }))
          .sort((a, b) => b.count - a.count);

        setBrands(brandList);
        setConditions(condList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (brand: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  };

  const totalAnnonces = useMemo(() => brands.reduce((s, b) => s + b.total, 0), [brands]);

  if (loading) return <div className="text-muted-foreground text-sm">Chargement des catégories…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catégories</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {brands.length} marque{brands.length !== 1 ? "s" : ""} · {totalAnnonces} annonce{totalAnnonces !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marques & Modèles */}
        <div className="lg:col-span-2 space-y-2">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Marques & Modèles</div>
          {brands.length === 0 ? (
            <EmptyState title="Aucune catégorie" description="Les marques et modèles seront extraits des annonces." />
          ) : (
            brands.map((b) => (
              <div key={b.brand} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                  onClick={() => toggle(b.brand)}
                >
                  <div className="flex items-center gap-3">
                    {expanded.has(b.brand)
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                    <span className="font-semibold">{b.brand}</span>
                    <Badge variant="secondary" className="text-xs">{b.models.length} modèle{b.models.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{b.published} publiée{b.published !== 1 ? "s" : ""}</span>
                    <span className="font-medium text-foreground">{b.total} total</span>
                  </div>
                </button>

                {expanded.has(b.brand) && (
                  <div className="border-t">
                    {b.models.map((m, i) => (
                      <div
                        key={m.model}
                        className={`flex items-center justify-between px-6 py-2 text-sm ${i < b.models.length - 1 ? "border-b border-border/50" : ""}`}
                      >
                        <span className="text-foreground/80">{m.model}</span>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{m.published} publiée{m.published !== 1 ? "s" : ""}</span>
                          <span className="font-medium text-foreground">{m.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* États */}
        <div>
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">États de l'appareil</div>
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
            {conditions.map(({ label, count }) => {
              const pct = totalAnnonces ? Math.round((count / totalAnnonces) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
