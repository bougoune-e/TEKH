import { CheckCircle2, AlertCircle } from "lucide-react";
import { Device, DeviceCondition } from "@/types";

interface DeviceCardProps {
  device: Device;
  showValue?: boolean;
  compact?: boolean;
  isTargetDevice?: boolean;
}

const DeviceCard = ({
  device,
  showValue = true,
  compact = false,
  isTargetDevice = false,
}: DeviceCardProps) => {
  const getConditionBadgeColor = (condition: DeviceCondition): string => {
    const colors: Record<DeviceCondition, string> = {
      [DeviceCondition.Poor]: "bg-red-100 text-red-800 border-red-300",
      [DeviceCondition.Fair]: "bg-yellow-100 text-yellow-800 border-yellow-300",
      [DeviceCondition.Good]: "bg-green-100 text-green-800 border-green-300",
      [DeviceCondition.Refurbished]: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[condition];
  };

  const getConditionLabel = (condition: DeviceCondition): string => {
    const labels: Record<DeviceCondition, string> = {
      [DeviceCondition.Poor]: "Mauvais",
      [DeviceCondition.Fair]: "Correct",
      [DeviceCondition.Good]: "Bon",
      [DeviceCondition.Refurbished]: "Reconditionné",
    };
    return labels[condition];
  };

  const formatCFA = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (compact) {
    return (
      <div className="p-2 border border-border/50 rounded bg-card">
        <p className="font-semibold text-sm">
          {device.brand} {device.model}
        </p>
        {device.year && <p className="text-xs text-muted-foreground">{device.year}</p>}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all ${
        isTargetDevice
          ? "border-green-200 bg-green-50 hover:border-green-400"
          : "border-border/60 bg-card hover:border-primary/40"
      }`}
    >
      <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-lg">{device.brand}</p>
          <p className="text-sm text-muted-foreground">{device.model}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{device.brand}</h3>
            <p className="font-semibold">{device.model}</p>
          </div>
          {device.year && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {device.year}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3 text-sm">
          {device.storage && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Stockage:</span> {device.storage}
            </p>
          )}
          {device.color && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Couleur:</span> {device.color}
            </p>
          )}
        </div>

        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getConditionBadgeColor(
              device.condition
            )}`}
          >
            {device.condition === DeviceCondition.Good ? (
              <CheckCircle2 size={14} />
            ) : device.condition === DeviceCondition.Poor ? (
              <AlertCircle size={14} />
            ) : null}
            {getConditionLabel(device.condition)}
          </span>
        </div>

        {showValue && (
          <div className="pt-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-1">Valeur estimée</p>
            <p className="text-xl font-bold">{formatCFA(device.estimatedValue)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;
