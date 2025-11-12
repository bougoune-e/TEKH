import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { Users as UsersIcon, Smartphone, Handshake, Boxes } from "lucide-react";

const Dashboard = () => {
  const loading = false;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Utilisateurs" value={loading ? undefined : 0} loading={loading} icon={<UsersIcon className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="Annonces" value={loading ? undefined : 0} loading={loading} icon={<Smartphone className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="Deals" value={loading ? undefined : 0} loading={loading} icon={<Handshake className="h-5 w-5 text-primary-foreground" />} />
        <StatCard title="DealBox vendues" value={loading ? undefined : 0} loading={loading} icon={<Boxes className="h-5 w-5 text-primary-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Annonces publiées (7j)" data={[]} loading={loading} />
        <ChartCard title="Utilisateurs actifs (7j)" data={[]} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
