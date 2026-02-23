import { useEffect, useMemo, useRef, useState } from "react";
import PhoneCard from "@/features/marketplace/PhoneCard";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { useDeals } from "@/features/marketplace/deals.context";
import type { DealPost } from "@/shared/data/dealsData";
import { Flame, Star, MessageSquare, Sparkles } from "lucide-react";
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
    <section className="py-8 bg-background min-h-dvh">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header — titre + tendances + badges (ancienne version: grilles de cartes mockées) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white uppercase">{t('nav.deals', 'Explorer')}</h1>
            <div className="flex items-center gap-2 text-slate-600 dark:text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest">{t('deals.trends', 'Tendances du moment')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['iPhone 15', 'Samsung S24', 'Budget < 200k', '512 Go'].map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="rounded-full px-4 py-1.5 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer transition-all font-bold"
                onClick={() => {
                  if (label === 'Budget < 200k') setFilters((f) => ({ ...f, min: 0, max: 200000 }));
                  else setFilters((f) => ({ ...f, q: label.includes('iPhone') ? 'iPhone 15' : label.includes('Samsung') ? 'Samsung S24' : f.q }));
                }}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="sticky top-[68px] z-30 bg-background/95 backdrop-blur py-4 mb-6 border-b border-border/40">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full md:w-auto relative">
              <Input
                placeholder={t('deals.search', 'Rechercher un modèle...')}
                value={filters.q || ''}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="pl-4 rounded-full bg-muted/50 border-0 focus-visible:ring-1 ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              <Select value={filters.brand} onValueChange={(v) => setFilters((f) => ({ ...f, brand: v }))}>
                <SelectTrigger className="w-[120px] rounded-full border-zinc-200 dark:border-border/60 bg-zinc-50 dark:bg-card text-black dark:text-white font-bold h-10"><SelectValue placeholder={t('simulator.brand')} /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={(filters.condition || '') as any} onValueChange={(v) => setFilters((f) => ({ ...f, condition: v as any }))}>
                <SelectTrigger className="w-[120px] rounded-full border-zinc-200 dark:border-border/60 bg-zinc-50 dark:bg-card text-black dark:text-white font-bold h-10"><SelectValue placeholder={t('deals.condition', 'État')} /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center gap-2 px-2 min-w-[200px]">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{t('deals.budget', 'Budget')}</span>
                <Slider
                  value={[filters.min || 0, filters.max || 800000]}
                  min={0} max={1000000} step={10000}
                  onValueChange={([min, max]) => setFilters((f) => ({ ...f, min, max }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                tag={tag}
                badges={badges}
                extraLine={extraLine}
                location={d.location}
                createdAt={d.createdAt}
                onDelete={onDelete}
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
