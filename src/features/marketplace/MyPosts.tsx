import { useEffect, useMemo, useState } from "react";
import { useDeals } from "@/features/marketplace/deals.context";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import PhoneCard from "@/features/marketplace/PhoneCard";
import { Link } from "react-router-dom";
import { getCurrentUser, deleteDealById } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { toast } from "@/shared/hooks/use-toast";

const MyPosts = () => {
  const { deals, removeDeal } = useDeals();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { getCurrentUser().then((u) => setUserId(u?.id || null)).catch(() => setUserId(null)); }, []);
  const list = useMemo(() => (userId ? deals.filter((d) => d.ownerId === userId) : []), [deals, userId]);

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mes publications {list.length > 0 ? `(${list.length})` : ''}</h1>
          <Button asChild><Link to="/post">Publier un deal</Link></Button>
        </div>

        {list.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-lg font-semibold mb-1">Aucune publication pour l'instant</div>
            <div className="text-muted-foreground mb-4">Créez votre première annonce pour la voir ici.</div>
            <Button asChild><Link to="/post">Publier maintenant</Link></Button>
          </Card>
        ) : (
          <div className="deals-grid grid grid-cols-1 sm:grid-cols-2 md:[grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] gap-3">
            {list.map((d) => {
              const onDelete = async () => {
                const ok = window.confirm("Supprimer ce deal ?");
                if (!ok) return;
                try {
                  if (isSupabaseConfigured && d.id) await deleteDealById(d.id);
                  removeDeal(d.id);
                  toast({ title: "Deal supprimé" });
                } catch (e: any) {
                  toast({ title: "Échec de suppression", description: e?.message || "Réessayez plus tard", variant: "destructive" as any });
                }
              };
              return (
                <PhoneCard
                  key={d.id}
                  id={d.id}
                  brand={d.brand}
                  model={d.model}
                  condition={d.condition}
                  price={d.price}
                  image={d.images?.[0]}
                  location={d.location}
                  createdAt={d.createdAt}
                  onDelete={onDelete}
                  variant="compact"
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPosts;
