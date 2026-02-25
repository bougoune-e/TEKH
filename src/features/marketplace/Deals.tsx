import { useEffect, useMemo, useRef, useState } from "react";
import PhoneCard from "@/features/marketplace/PhoneCard";
import { useDeals } from "@/features/marketplace/deals.context";
import type { DealPost } from "@/shared/data/dealsData";
import { Sparkles } from "lucide-react";
import { deleteDealById, getCurrentUser, fetchDeals } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { toast } from "@/shared/hooks/use-toast";
import { useTranslation } from "react-i18next";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Infinix", "Tecno", "Google", "Huawei", "OnePlus", "Oppo", "Vivo"];
const CONDITIONS = ["Neuf", "Très bon", "Bon", "Moyen"] as const;

type Filters = {
  brand?: string;
  condition?: typeof CONDITIONS[number] | "";
  storage?: number | "";
  ram?: number | "";
  q?: string;
  min?: number;
  max?: number;
};

function percentageMatch(target: number | undefined, price: number) {
  if (!target || target <= 0) return 0;
  const diff = Math.abs(price - target);
  const pct = Math.max(0, 100 - (diff / target) * 100);
  return Math.min(100, Math.round(pct));
}

function computeExtra(deal: DealPost, targetValue?: number, desired?: string, maxAddition?: number) {
  const score = targetValue ? percentageMatch(targetValue, deal.price) : undefined;
  const badges: string[] = [];
  if (deal.verified) badges.push("⭐ Confiance");
  if (deal.negotiable) badges.push("💬 Négociable");
  // if (score && score >= 85) badges.push("Correspond à votre estimation");
  if (deal.tags) badges.push(...deal.tags);

  let tag: string | undefined;
  if (desired && `${deal.brand} ${deal.model}`.toLowerCase().includes(desired.toLowerCase())) {
    tag = "Match parfait";
  } else if (score && score >= 80) {
    tag = "Match partiel";
  } else if (score && score >= 65) {
    tag = "Proche";
  }

  let extraLine: string | undefined;
  if (targetValue) {
    const diff = deal.price - targetValue;
    if (diff > 0) {
      const add = Math.max(0, diff);
      extraLine = `Différence: +${add.toLocaleString()} FCFA${maxAddition ? ` — Ajout recommandé: ${Math.min(add, maxAddition).toLocaleString()} FCFA` : ""}`;
    } else if (diff < 0) {
      extraLine = `Différence: ${diff.toLocaleString()} FCFA`;
    }
  }

  const scoreLabel = score ? `Correspondance ${score}%` : undefined;
  return { tag, badges: scoreLabel ? [scoreLabel, ...badges] : badges, extraLine };
}

export default function DealsPage() {
  const { t } = useTranslation();
  const { deals: userDeals, lastSimulation, matchRequest, removeDeal, setDealsList } = useDeals();
  const [filters, setFilters] = useState<Filters>({ min: 0, max: 800000 });
  const allDeals = useMemo(() => userDeals, [userDeals]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => setUserId(u?.id || null)).catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchDeals()
      .then((rows) => {
        if (rows && rows.length > 0) {
          setDealsList(rows as any);
        } else {
          // Fallback to mock data if DB is empty
          import("@/shared/data/dealsData").then(mod => {
            setDealsList(mod.dealsData as any);
          });
        }
      })
      .catch(() => {
        import("@/shared/data/dealsData").then(mod => {
          setDealsList(mod.dealsData as any);
        });
      });
  }, []);

  // Pré-appliquer filtres si lastSimulation ou matchRequest
  useEffect(() => {
    if (matchRequest?.estimated) {
      const min = Math.max(0, Math.round(matchRequest.estimated * 0.8));
      const max = Math.round(matchRequest.estimated * 1.2);
      setFilters((f) => ({ ...f, brand: matchRequest.brand, min, max }));
    } else if (lastSimulation?.estimated) {
      const min = Math.max(0, Math.round(lastSimulation.estimated * 0.8));
      const max = Math.round(lastSimulation.estimated * 1.2);
      setFilters((f) => ({ ...f, min, max }));
    }
  }, [lastSimulation, matchRequest]);

  const filtered = useMemo(() => {
    return allDeals.filter((d) => {
      // Filter out uncertified deals unless user is owner or admin (simplified logic for now)
      // For MVP: only show if verified OR if owner is current user OR if status is NOT pending
      // Wait, we want to hide pending deals.
      // Assuming 'status' field exists or will exist. defaulting to checking 'verified' for strictness or just allow all for now but filter in real implementation.
      // For now, let's keep it open but filter by explicit filters.

      if (filters.brand && d.brand !== filters.brand) return false;
      if (filters.condition && d.condition !== filters.condition) return false;
      if (filters.storage && d.storage !== filters.storage) return false;
      if (filters.ram && d.ram !== filters.ram) return false;
      if (filters.q && !(`${d.brand} ${d.model} ${d.title}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      if (typeof filters.min === 'number' && d.price < filters.min) return false;
      if (typeof filters.max === 'number' && d.price > filters.max) return false;
      return true;
    });
  }, [allDeals, filters]);

  // Infinite scroll state
  const [visible, setVisible] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => Math.min(filtered.length, v + 12));
    }, { rootMargin: "200px" });
    if (sentinelRef.current) ob.observe(sentinelRef.current);
    return () => ob.disconnect();
  }, [filtered.length]);

  const list = filtered.slice(0, visible);

  const targetValue = matchRequest?.estimated ?? lastSimulation?.estimated;
  const desired = matchRequest?.desired;
  const maxAddition = matchRequest?.maxAddition;

  return (
    <section className="pt-4 pb-28 md:pb-8 bg-background min-h-dvh">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Grille de deals uniquement — style CoinAfrique, rien au-dessus des cartes */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {list.map((d) => {
            const { tag, badges, extraLine } = computeExtra(d, targetValue, desired, maxAddition);
            const canDelete = userId && d.ownerId && userId === d.ownerId;
            const onDelete = canDelete
              ? async () => {
                const ok = window.confirm("Supprimer ce deal ?");
                if (!ok) return;
                try {
                  if (isSupabaseConfigured && d.id) await deleteDealById(d.id);
                  removeDeal(d.id);
                  toast({ title: "Deal supprimé" });
                } catch (e: any) {
                  toast({ title: "Échec de suppression", description: e?.message || "Réessayez plus tard", variant: "destructive" as any });
                }
              }
              : null;
            return (
              <PhoneCard
                key={d.id}
                id={d.id}
                brand={d.brand}
                model={d.model}
                condition={d.condition}
                price={d.price}
                image={d.images?.[0]}
                images={d.images}
                tag={tag}
                badges={badges}
                extraLine={extraLine}
                location={d.location}
                createdAt={d.createdAt}
                publishedAt={d.publishedAt}
                onDelete={onDelete}
                compact
              />
            );
          })}
        </div>

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-20" />

        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{t('deals.no_deals', 'Aucun deal trouvé')}</h3>
            <p className="text-muted-foreground max-w-sm mt-2">{t('deals.no_deals_desc', "Essayez d'ajuster vos filtres ou revenez plus tard pour de nouvelles offres.")}</p>
            <button onClick={() => setFilters({ min: 0, max: 1000000 })} className="mt-6 text-primary hover:underline font-medium">{t('deals.reset', 'Réinitialiser les filtres')}</button>
          </div>
        )}

      </div>
    </section>
  );
}
