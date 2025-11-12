import { useState } from "react";
import { ArrowRight, Check, Clock, CheckCircle, ShieldCheck } from "lucide-react";
import DeviceCard from "@/components/DeviceCard";
import { TradeOffer } from "@/types";

interface TradeOfferCardProps {
  offer: TradeOffer;
  onAccept?: (offerId: string) => void;
  isAccepting?: boolean;
  onContact?: (offerId: string) => void;
  onPropose?: (offerId: string) => void;
}

const TradeOfferCard = ({ offer, onAccept, isAccepting = false, onContact, onPropose }: TradeOfferCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatCFA = (value: number): string =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(value);

  const getStatusBadge = (status: TradeOffer["status"]) => {
    const badges: Record<TradeOffer["status"], { bg: string; text: string; label: string; icon: JSX.Element }> = {
      available: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Disponible", icon: <CheckCircle size={16} /> },
      pending: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", label: "En attente", icon: <Clock size={16} /> },
      accepted: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Acceptée", icon: <Check size={16} /> },
      completed: { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", label: "Terminé", icon: <CheckCircle size={16} /> },
    };
    return badges[status] ?? badges.available;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return "À l’instant";
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR");
  };

  const statusBadge = getStatusBadge(offer.status);

  return (
    <div
      className="rounded-xl border border-border/50 overflow-hidden bg-card transition-all hover:shadow-card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* En-tête */}
      <div className="px-4 sm:px-6 py-4 border-b border-border/40 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold">Offre #{offer.id.slice(-4)}</p>
            {offer.isVerified && (
              <span aria-label="Vendeur vérifié" className="inline-flex items-center">
                <ShieldCheck size={16} className="text-blue-600" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(offer.createdAt)}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusBadge.bg}`}>
          <span className={`text-sm font-semibold ${statusBadge.text}`}>{statusBadge.label}</span>
        </div>
      </div>

      {/* Info vendeur */}
      <div className="px-4 sm:px-6 py-3 bg-muted/40 border-b border-border/40">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">De:</span> <span className="font-medium">{offer.offererUsername}</span>
          {offer.isVerified && <span className="text-xs ml-2 text-blue-600">✓ Vendeur vérifié</span>}
        </p>
      </div>

      {/* Comparatif */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Appareil source */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Vous échangez</p>
            <DeviceCard device={offer.offererDevice} showValue isTargetDevice={false} />
          </div>

          {/* Flèche + Complément */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={`transition-transform ${isHovered ? "scale-110" : ""}`}>
              <ArrowRight size={28} className="text-muted-foreground rotate-90 sm:rotate-0" />
            </div>
            <div className="text-center bg-primary/10 px-4 py-3 rounded-lg border border-primary/30 w-full">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Complément à payer</p>
              <p className="text-2xl font-bold text-primary">{formatCFA(offer.priceTopUp)}</p>
              <p className="text-xs text-muted-foreground mt-2">CFA</p>
            </div>
          </div>

          {/* Appareil cible */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Vous recevez</p>
            <DeviceCard device={offer.targetDevice} showValue isTargetDevice />
          </div>
        </div>
      </div>

      {/* Actions */}
      {offer.status === "available" && (
        <div className="px-4 sm:px-6 py-4 bg-muted/40 border-t border-border/40 flex gap-3">
          {onAccept && (
            <button
              onClick={() => onAccept(offer.id)}
              disabled={isAccepting}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isAccepting ? "Traitement…" : "Accepter l’offre"}
            </button>
          )}
          {onContact && (
            <button
              onClick={() => onContact(offer.id)}
              className="flex-1 border border-border/50 hover:bg-muted text-foreground font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Contacter le vendeur
            </button>
          )}
          {onPropose && (
            <button
              onClick={() => onPropose(offer.id)}
              className="flex-1 border border-dashed border-border/50 hover:bg-muted text-foreground font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Proposer mon téléphone
            </button>
          )}
        </div>
      )}

      {offer.status === "pending" && (
        <div className="px-4 sm:px-6 py-4 bg-yellow-50 border-t border-yellow-100">
          <p className="text-sm text-yellow-700 font-medium">En attente de confirmation du vendeur (24h).</p>
        </div>
      )}

      {offer.status === "completed" && (
        <div className="px-4 sm:px-6 py-4 bg-green-50 border-t border-green-100">
          <p className="text-sm text-green-700 font-medium">Échange terminé ! Laissez une évaluation.</p>
        </div>
      )}
    </div>
  );
};

export default TradeOfferCard;
