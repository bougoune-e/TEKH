import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Package, MapPin, Calendar, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

const MOCK_ORDERS: Array<{ id: string; status: string; items: string; total: string; date: string; carrier: string; tracking: string; address: string }> = [
  { id: "ORD-2025-001", status: "En livraison", items: "iPhone 12 128 Go", total: "185 000 FCFA", date: "22 fév. 2025", carrier: "Livraison TEKH+", tracking: "TK+123456789", address: "Lomé, Agoè" },
  { id: "ORD-2025-002", status: "Livré", items: "Samsung A54", total: "125 000 FCFA", date: "18 fév. 2025", carrier: "Livraison TEKH+", tracking: "TK+987654321", address: "Lomé, Bè" },
];

export default function CommandesPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-2">Commandes</h1>
        <p className="text-muted-foreground text-sm mb-8">Suivez vos achats et livraisons</p>
        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => (
            <Card key={order.id} className="border border-border/50 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-bold">{order.id}</CardTitle>
                  <span className="text-xs font-black uppercase tracking-wider text-primary">{order.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{order.items} • {order.total}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {order.date}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => navigate(`/commandes/${order.id}`)}>
                  Voir le détail et le suivi
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {MOCK_ORDERS.length === 0 && (
          <Card className="border border-border/50">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande. Vos achats apparaîtront ici.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = id ? MOCK_ORDERS.find((o) => o.id === id) : null;
  if (!order) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Commande introuvable.</p>
        <Link to="/commandes" className="text-primary font-bold">Retour aux commandes</Link>
      </div>
    );
  }
  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link to="/commandes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Retour aux commandes
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-2">{order.id}</h1>
        <p className="text-muted-foreground text-sm mb-6">{order.status}</p>
        <Card className="border border-border/50 mb-4">
          <CardHeader>
            <CardTitle className="text-base">Contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{order.items}</p>
            <p className="text-primary font-bold">{order.total}</p>
            <p className="text-xs text-muted-foreground">Commandé le {order.date}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.address}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Suivi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">{order.carrier}</p>
            <p className="text-xs text-muted-foreground">Numéro de suivi : <span className="font-mono font-bold text-foreground">{order.tracking}</span></p>
            <p className="text-xs text-muted-foreground mt-2">Livraison estimée : sous 3–5 jours ouvrés.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
