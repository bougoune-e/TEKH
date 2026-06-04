import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Package, MapPin, Calendar, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth.context";
import { fetchUserTransactions, subscribeToTransaction } from "@/core/api/supabaseApi";
import { LogisticsTimeline, LogisticsStatus } from "@/shared/components/LogisticsTimeline";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/core/api/utils";

export default function CommandesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserTransactions(user.id)
        .then(setOrders)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-dvh">Chargement...</div>;

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-2">Commandes</h1>
        <p className="text-muted-foreground text-sm mb-8">Suivez vos estimations et transactions</p>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-black truncate max-w-[200px]">ID: {order.id.split('-')[0].toUpperCase()}</CardTitle>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                    order.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                  )}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm font-bold mt-1 text-foreground">{order.device_name} • {order.price_fcfa.toLocaleString()} FCFA</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(order.created_at), "d MMMM yyyy", { locale: fr })}
                </p>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <Button variant="outline" size="sm" className="w-full rounded-xl font-bold h-10" onClick={() => navigate(`/commandes/${order.id}`)}>
                  Voir le suivi en temps réel
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {orders.length === 0 && (
          <Card className="border border-border/50">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">Aucune commande. Vos transactions apparaîtront ici.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function CommandeDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      // 1. Initial fetch
      fetchUserTransactions(user.id).then(all => {
        const found = all.find(o => o.id === id);
        setOrder(found);
        setLoading(false);
      });

      // 2. Real-time subscription
      const sub = subscribeToTransaction(id, (newStatus) => {
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      });

      return () => sub.unsubscribe();
    }
  }, [user, id]);

  if (loading) return <div className="flex items-center justify-center min-h-dvh">Chargement du suivi...</div>;

  if (!order) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-bold mb-4 italic">Commande ou transaction introuvable.</p>
        <Link to="/commandes" className="text-primary font-black uppercase tracking-widest text-xs">Retour aux commandes</Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link to="/commandes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-bold">
          <ChevronLeft className="h-4 w-4" /> Retour aux commandes
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-1">Détails du Suivi</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-8 opacity-60">ID: {order.id}</p>

        {/* Real-time Timeline */}
        <LogisticsTimeline currentStatus={order.status as LogisticsStatus} className="mb-6" />

        <div className="grid grid-cols-1 gap-4">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Appareil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-lg font-black text-foreground">{order.device_name}</p>
              <p className="text-primary font-black text-sm italic">{order.price_fcfa.toLocaleString()} FCFA</p>
              <p className="text-[10px] text-muted-foreground font-bold mt-2">Enregistré le {format(new Date(order.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
            </CardContent>
          </Card>

          {order.tracking_number && (
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Numéro de Suivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="font-mono font-black text-foreground text-sm tracking-tighter bg-muted px-2 py-1 rounded">
                  {order.tracking_number}
                </span>
                <p className="text-[10px] text-muted-foreground font-medium italic mt-2">Utilisez ce numéro pour toute réclamation au guichet.</p>
              </CardContent>
            </Card>
          )}

          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Point de Collecte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-foreground">
                {order.metadata?.location_name || "En recherche d'informations sur le point de collecte..."}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Référez-vous aux instructions envoyées par WhatsApp.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
