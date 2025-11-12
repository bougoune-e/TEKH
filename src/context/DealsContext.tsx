import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { initialDeals, DealPost } from "@/data/mockDeals";
import type { SimpleCondition, StorageSize, BatteryHealth } from "@/data/phoneValueData";

interface DealsContextValue {
  deals: DealPost[];
  addDeal: (deal: DealPost) => void;
  lastSimulation: {
    model: string;
    condition: SimpleCondition;
    storage?: StorageSize;
    battery?: BatteryHealth;
    estimated: number;
    customPrice?: number;
  } | null;
  setLastSimulation: (sim: DealsContextValue["lastSimulation"]) => void;
  desiredDealId: string | null;
  setDesiredDealId: (id: string | null) => void;
}

const DealsContext = createContext<DealsContextValue | undefined>(undefined);

export const DealsProvider = ({ children }: { children: ReactNode }) => {
  const [deals, setDeals] = useState<DealPost[]>(() => {
    try {
      const raw = localStorage.getItem("swap_deals");
      return raw ? (JSON.parse(raw) as DealPost[]) : initialDeals;
    } catch {
      return initialDeals;
    }
  });
  const [lastSimulation, setLastSimulationState] = useState<DealsContextValue["lastSimulation"]>(() => {
    try {
      const raw = localStorage.getItem("swap_simulation");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [desiredDealId, setDesiredDealIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("swap_desired_deal") || null;
    } catch {
      return null;
    }
  });

  const addDeal = (deal: DealPost) => setDeals((prev) => [deal, ...prev]);
  const setLastSimulation = (sim: DealsContextValue["lastSimulation"]) => setLastSimulationState(sim);
  const setDesiredDealId = (id: string | null) => setDesiredDealIdState(id);

  const value = useMemo(
    () => ({ deals, addDeal, lastSimulation, setLastSimulation, desiredDealId, setDesiredDealId }),
    [deals, lastSimulation, desiredDealId]
  );
  useEffect(() => {
    try {
      localStorage.setItem("swap_deals", JSON.stringify(deals));
    } catch {}
  }, [deals]);
  useEffect(() => {
    try {
      if (lastSimulation) localStorage.setItem("swap_simulation", JSON.stringify(lastSimulation));
      else localStorage.removeItem("swap_simulation");
    } catch {}
  }, [lastSimulation]);
  useEffect(() => {
    try {
      if (desiredDealId) localStorage.setItem("swap_desired_deal", desiredDealId);
      else localStorage.removeItem("swap_desired_deal");
    } catch {}
  }, [desiredDealId]);
  return <DealsContext.Provider value={value}>{children}</DealsContext.Provider>;
};

export const useDeals = () => {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
};
