import { Skeleton } from "@/shared/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  title: string;
  data?: Array<{ name: string; value: number }>;
  loading?: boolean;
};

const ChartCard = ({ title, data = [], loading }: Props) => {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <div className="mb-4 text-sm font-medium text-muted-foreground">{title}</div>
      <div className="h-64">
        {loading ? (
          <Skeleton className="h-full w-full" />)
        : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ReTooltip />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
