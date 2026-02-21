export type SimpleCondition = "like_new" | "good" | "average" | "damaged";
export type StorageSize = 64 | 128 | 256 | 512;
export type BatteryHealth = "low" | "medium" | "good";

export function estimateValue(
  model: string,
  condition: SimpleCondition,
  storage?: StorageSize,
  battery?: BatteryHealth
) {
  const base = model.toLowerCase().includes("iphone") ? 250 : 200;
  const cond = condition === "like_new" ? 150 : condition === "good" ? 100 : condition === "average" ? 50 : 20;
  const stor = storage ?? 128;
  const storBonus = stor / 2;
  const batt = battery === "good" ? 50 : battery === "medium" ? 20 : battery === "low" ? -20 : 0;
  return Math.max(50, Math.round(base + cond + storBonus + batt));
}
