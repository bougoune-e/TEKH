import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  accent?: string;
  loading?: boolean;
};

const StatCard = ({ title, value, icon, accent = "bg-gradient-hero", loading }: Props) => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-card">
      <div className="absolute inset-0 opacity-10 blur-2xl pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold">
            {loading ? <Skeleton className="h-7 w-20" /> : value ?? "—"}
          </div>
        </div>
        <div className={`h-10 w-10 rounded-lg grid place-items-center ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
