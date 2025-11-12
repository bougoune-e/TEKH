export type SimpleCondition = "like_new" | "good" | "average" | "damaged";
export type StorageSize = 64 | 128 | 256 | 512;
export type BatteryHealth = "low" | "medium" | "good";

// Import JSON reference of phone prices per condition (ranges)
import pricesJson from "@/data/phone_prices.json";

type PhoneRef = {
  name: string;
  conditions: Record<SimpleCondition, [number, number]>;
};

const refs: PhoneRef[] = (pricesJson as any).models;

export const models: string[] = refs.map((r) => r.name);

const clampMin = 20000;

const storageAdjust: Record<StorageSize, number> = {
  64: 0.95,   // -5%
  128: 1,
  256: 1.05,  // +5%
  512: 1.1,   // +10% (légèrement plus pour très grand stockage)
};

const batteryAdjust: Record<BatteryHealth, number> = {
  low: 0.95,    // -5%
  medium: 1,
  good: 1.05,   // +5%
};

export function estimateValue(
  model: string,
  condition: SimpleCondition,
  storage?: StorageSize,
  battery?: BatteryHealth
): number {
  // Find closest reference by simple includes-insensitive match if exact not found
  const lower = model.toLowerCase();
  let ref = refs.find((r) => r.name.toLowerCase() === lower);
  if (!ref) ref = refs.find((r) => lower.includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(lower));

  const range = ref?.conditions?.[condition];
  const base = range ? Math.round((range[0] + range[1]) / 2) : 150000;
  const s = storage ? storageAdjust[storage] : 1;
  const b = battery ? batteryAdjust[battery] : 1;
  const value = Math.round(base * s * b);
  return Math.max(clampMin, value);
}
