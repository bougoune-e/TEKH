import { useEffect, useState } from "react";
import { fetchAllDealsForAdmin, countProfiles } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { TrendingUp, Smartphone, Users, BarChart3 } from "lucide-react";

type MonthStat = { name: string; value: number };

function groupByMonth(items: any[], dateKey = "createdAt"): MonthStat[] {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[d.toLocaleDateString("fr-FR", { month: "short" })] = 0;
  }
  for (const item of items) {
    const raw = item[dateKey] || item.created_at;
    if (!raw) continue;
    const label = new Date(raw).toLocaleDateString("fr-FR", { month: "short" });
    if (label in months) months[label]++;
  }
  return Object.entries(months).map(([name, value]) => ({ name, value }));
}

function topN(items: any[], key: string, n = 5): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    const val = String(item[key] || "Inconnu");
    map[val] = (map[val] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [annonces, setAnnonces] = useState<any[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    Promise.all([fetchAllDealsForAdmin(), countProfiles()])
      .then(([list, users]) => {
        setAnnonces(list);
        setTotalUsers(users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = annonces.filter((a) => a.status === "published");
  const totalValue = published.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const avgPrice = published.length ? Math.round(totalValue / published.length) : 0;

  const byMonth = groupByMonth(annonces, "createdAt");
  const byBrand = topN(annonces, "brand");
  const byCondition = topN(annonces, "condition");
  const byLocation = topN(published, "location");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistiques</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Valeur marché publiée"
          value={loading ? undefined : `${totalValue.toLocaleString()} F`}
          loading={loading}
          icon={<TrendingUp className="h-5 w-5 text-primary-foreground" />}
        />
        <StatCard
          title="Prix moyen"
          value={loading ? undefined : `${avgPrice.toLocaleString()} F`}
          loading={loading}
          icon={<BarChart3 className="h-5 w-5 text-primary-foreground" />}
          accent="bg-emerald-600"
        />
        <StatCard
          title="Annonces publiées"
          value={loading ? undefined : published.length}
          loading={loading}
          icon={<Smartphone className="h-5 w-5 text-primary-foreground" />}
          accent="bg-sky-600"
        />
        <StatCard
          title="Utilisateurs"
          value={loading ? undefined : totalUsers}
          loading={loading}
          icon={<Users className="h-5 w-5 text-primary-foreground" />}
          accent="bg-violet-600"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Annonces par mois (6 derniers mois)" data={byMonth} loading={loading} />
        <ChartCard title="Top 5 marques" data={byBrand} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Répartition par état" data={byCondition} loading={loading} />
        <ChartCard title="Top villes (annonces publiées)" data={byLocation} loading={loading} />
      </div>

      {/* Tableau top marques */}
      {!loading && byBrand.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card p-4">
          <div className="text-sm font-medium text-muted-foreground mb-4">Détail par marque</div>
          <div className="space-y-2">
            {byBrand.map(({ name, value }) => {
              const pct = annonces.length ? Math.round((value / annonces.length) * 100) : 0;
              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium truncate">{name}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-muted-foreground">{value} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
