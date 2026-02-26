import { Link } from "react-router-dom";
import { ChevronLeft, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function HistoriquePage() {
  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-2">Historique</h1>
        <p className="text-muted-foreground text-sm mb-8">Vos transactions passées</p>
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune transaction pour le moment. Vos achats et échanges apparaîtront ici.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
