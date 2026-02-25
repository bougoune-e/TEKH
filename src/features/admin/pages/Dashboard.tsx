import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { Users as UsersIcon, Smartphone, Handshake, Boxes } from "lucide-react";
import { fetchAllDealsForAdmin } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalDeals, setTotalDeals] = useState(0);
  const [draftDeals, setDraftDeals] = useState(0);
  const [publishedDeals, setPublishedDeals] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    fetchAllDealsForAdmin()
      .then((list) => {
        setTotalDeals(list.length);
        setDraftDeals(list.filter((d) => (d as any).status === "draft").length);
        setPublishedDeals(list.filter((d) => (d as any).status === "published").length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Utilisateurs" value={loading ? undefined : 0} loading={loading} icon={<UsersIcon className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="Deals (total)" value={loading ? undefined : totalDeals} loading={loading} icon={<Handshake className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="Brouillons" value={loading ? undefined : draftDeals} loading={loading} icon={<Smartphone className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="Publiés" value={loading ? undefined : publishedDeals} loading={loading} icon={<Boxes className="h-5 w-5 text-primary-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Deals par statut" data={[]} loading={loading} />
        <ChartCard title="Utilisateurs actifs (7j)" data={[]} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
