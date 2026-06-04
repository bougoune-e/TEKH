import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { Users as UsersIcon, Smartphone, Handshake, Boxes, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { fetchAllDealsForAdmin, countProfiles } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

type MonthStat = { name: string; value: number };

function groupByMonth(items: any[], dateKey = "createdAt"): MonthStat[] {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    months[label] = 0;
  }
  for (const item of items) {
    const raw = item[dateKey] || item.created_at;
    if (!raw) continue;
    const d = new Date(raw);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    if (label in months) months[label]++;
  }
  return Object.entries(months).map(([name, value]) => ({ name, value }));
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [draftDeals, setDraftDeals] = useState(0);
  const [publishedDeals, setPublishedDeals] = useState(0);
  const [dealsChart, setDealsChart] = useState<MonthStat[]>([]);
  const [publishedChart, setPublishedChart] = useState<MonthStat[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }

    Promise.all([fetchAllDealsForAdmin(), countProfiles()])
      .then(([list, userCount]) => {
        setTotalDeals(list.length);
        setDraftDeals(list.filter((d: any) => d.status === "draft").length);
        setPublishedDeals(list.filter((d: any) => d.status === "published").length);
        setTotalUsers(userCount);
        setDealsChart(groupByMonth(list, "createdAt"));
        setPublishedChart(groupByMonth(
          list.filter((d: any) => d.status === "published"),
          "publishedAt"
        ));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs"
          value={loading ? undefined : totalUsers}
          loading={loading}
          icon={<UsersIcon className="h-5 w-5 text-primary-foreground" />}
        />
        <StatCard
          title="Annonces (total)"
          value={loading ? undefined : totalDeals}
          loading={loading}
          icon={<Handshake className="h-5 w-5 text-primary-foreground" />}
        />
        <StatCard
          title="En attente"
          value={loading ? undefined : draftDeals}
          loading={loading}
          icon={<Smartphone className="h-5 w-5 text-primary-foreground" />}
          accent="bg-amber-500"
        />
        <StatCard
          title="Publiées"
          value={loading ? undefined : publishedDeals}
          loading={loading}
          icon={<Boxes className="h-5 w-5 text-primary-foreground" />}
          accent="bg-emerald-600"
        />
      </div>

      {/* Quick Action: Scanner */}
      <div className="bg-emerald-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-600/20 group">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md group-hover:scale-110 transition-transform">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Scanner de Validation</h3>
            <p className="text-sm font-bold opacity-80 leading-snug max-w-sm">
              Validez les dépôts d&apos;appareils et les retraits de cadeaux clients en un instant.
            </p>
          </div>
        </div>
        <Link to="/admin/scan" className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-white text-emerald-600 hover:bg-emerald-50 font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-lg ring-offset-emerald-600">
            Lancer le scanner
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Annonces créées (6 derniers mois)" data={dealsChart} loading={loading} />
        <ChartCard title="Annonces publiées (6 derniers mois)" data={publishedChart} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
