import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { DealPost } from "@/shared/data/dealsData";

type BatteryHealth = "low" | "medium" | "good";
type SimpleCondition = "like_new" | "good" | "average" | "damaged";

type LastSimulation = {
  model: string;
  condition: SimpleCondition;
  storage?: number;
  battery?: BatteryHealth;
  estimated: number;
  customPrice?: number;
};

type MatchRequest = {
  brand?: string;
  model?: string;
  condition?: string;
  storage?: number;
  ram?: number;
  estimated?: number;
  desired?: string; // "marque modèle"
  maxAddition?: number; // FCFA
};

type DealsContextValue = {
  deals: DealPost[];
  addDeal: (d: DealPost) => void;
  removeDeal: (id: string) => void;
  setDealsList: (arr: DealPost[]) => void;
  lastSimulation: LastSimulation | null;
  setLastSimulation: (s: LastSimulation | null) => void;
  matchRequest: MatchRequest | null;
  setMatchRequest: (r: MatchRequest | null) => void;
};

const DealsContext = createContext<DealsContextValue | undefined>(undefined);

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<DealPost[]>([]);
  const [lastSimulation, setLastSimulation] = useState<LastSimulation | null>(null);
  const [matchRequest, setMatchRequest] = useState<MatchRequest | null>(null);

  const value = useMemo<DealsContextValue>(
    () => ({
      deals,
      addDeal: (d: DealPost) => setDeals((p) => [d, ...p]),
      removeDeal: (id: string) => setDeals((p) => p.filter((x) => x.id !== id)),
      setDealsList: (arr: DealPost[]) => setDeals(arr),
      lastSimulation,
      setLastSimulation,
      matchRequest,
      setMatchRequest,
    }),
    [deals, lastSimulation, matchRequest],
  );

  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
}
