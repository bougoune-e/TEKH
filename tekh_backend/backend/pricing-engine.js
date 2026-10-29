/**
 * Canonical server-side TEKH+ indicative-estimation engine.
 *
 * This module intentionally preserves the business rules in
 * src/core/api/pricing.ts (pricing version 1.0.0). It does not create a
 * commercial offer and it does not persist an estimate.
 */

export const PRICING_VERSION = "1.0.0";
export const PRT_FRESHNESS_DAYS = 30;
export const VRT_FLOOR_RATIO = 0.05;
export const C_MARCHE = 0.85;
export const C_SECURITE = 0.85;

export const SCREEN_CONDITIONS = new Set(["parfait", "raye", "casse"]);
export const CHASSIS_CONDITIONS = new Set(["intact", "abime"]);
export const BATTERY_CONDITIONS = new Set([
  "gte90",
  "gte80_89",
  "gte70_79",
  "gte60_69",
  "lt60",
  "unknown",
]);
export const DIAGNOSTIC_STATUSES = new Set([
  "pending",
  "passed",
  "warning",
  "failed",
  "skipped",
]);

export function roundDownToThousand(amount) {
  return Math.floor(amount / 1000) * 1000;
}

function screenCoefficient(screen) {
  switch (screen) {
    case "parfait":
      return 0.95;
    case "raye":
      return 0.75;
    case "casse":
      return 0.22;
    default:
      return 0.85;
  }
}

function batteryCoefficient(battery) {
  switch (battery) {
    case "gte90":
      return 1;
    case "gte80_89":
      return 0.92;
    case "gte70_79":
      return 0.8;
    case "gte60_69":
      return 0.68;
    case "lt60":
    case "unknown":
    default:
      return 0.5;
  }
}

function bonusMultiplier(bonus = {}) {
  let bonusRate = 0;
  if (bonus.boiteEtAccessoiresComplets) bonusRate += 0.03;
  if (bonus.compatible5g) bonusRate += 0.02;
  if (bonus.debloqueTousOperateurs) bonusRate += 0.015;
  if (bonus.factureAchatOriginale) bonusRate += 0.01;
  return Math.min(0.075, bonusRate);
}

function effectLabelForScreen(screen) {
  return {
    parfait: "Écran en très bon état",
    raye: "Rayures visibles sur l’écran",
    casse: "Écran endommagé",
  }[screen];
}

function effectLabelForBattery(battery) {
  return {
    gte90: "Batterie déclarée à 90 % ou plus",
    gte80_89: "Batterie déclarée entre 80 % et 89 %",
    gte70_79: "Batterie déclarée entre 70 % et 79 %",
    gte60_69: "Batterie déclarée entre 60 % et 69 %",
    lt60: "Batterie déclarée sous 60 %",
    unknown: "Santé de batterie non mesurée",
  }[battery];
}

/**
 * Validates only inputs consumed by the current official formula. Diagnostic
 * statuses are optional context; only failed touch/charging reproduce the
 * existing web overrides.
 */
const UUID_PATTERN = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", "i");
export function validateEstimateInput(body) {
  const errors = [];
  if (!body || typeof body !== "object") return ["Corps JSON requis."];
  if (typeof body.deviceId !== "string" || !UUID_PATTERN.test(body.deviceId.trim())) {
    errors.push("deviceId UUID requis.");
  }

  const condition = body.condition;
  const diagnostic = body.diagnostic;
  if (!condition || typeof condition !== "object") {
    errors.push("condition requis.");
  } else {
    if (!SCREEN_CONDITIONS.has(condition.screen)) errors.push("condition.screen invalide.");
    if (!CHASSIS_CONDITIONS.has(condition.chassis)) errors.push("condition.chassis invalide.");
    if (condition.bonus !== undefined) {
      if (!condition.bonus || typeof condition.bonus !== "object" || Array.isArray(condition.bonus)) {
        errors.push("condition.bonus invalide.");
      } else {
        for (const key of ["boiteEtAccessoiresComplets", "compatible5g", "debloqueTousOperateurs", "factureAchatOriginale"]) {
          if (condition.bonus[key] !== undefined && typeof condition.bonus[key] !== "boolean") {
            errors.push(`condition.bonus.${key} invalide.`);
          }
        }
      }
    }
  }
  if (!diagnostic || typeof diagnostic !== "object") {
    errors.push("diagnostic requis.");
  } else {
    if (!BATTERY_CONDITIONS.has(diagnostic.battery)) errors.push("diagnostic.battery invalide.");
    for (const key of ["touch", "charging"]) {
      if (diagnostic[key] !== undefined && !DIAGNOSTIC_STATUSES.has(diagnostic[key])) {
        errors.push(`diagnostic.${key} invalide.`);
      }
    }
  }
  return errors;
}

/**
 * Applies existing web overrides, without inventing deductions for other
 * diagnostic checks. A failed tactile test means screen=casse; a failed charge
 * check means battery=lt60. Warning, passed and skipped have no price effect.
 */
export function resolveOfficialInputs({ condition, diagnostic }) {
  let screen = condition.screen;
  let battery = diagnostic.battery;
  const notes = [];

  if (diagnostic.touch === "failed" && screen !== "casse") {
    screen = "casse";
    notes.push("Le tactile déclaré défaillant a été traité comme un écran endommagé.");
  }
  if (diagnostic.charging === "failed") {
    battery = "lt60";
    notes.push("La charge déclarée défaillante a été traitée comme une batterie sous 60 %.");
  }

  return { screen, chassis: condition.chassis, battery, notes };
}

export function calculateIndicativeValue(referencePrice, inputs) {
  const { screen, chassis, battery, bonus = {} } = inputs;
  const screenAmount = referencePrice * screenCoefficient(screen);
  const batteryAmount = screenAmount * batteryCoefficient(battery);
  const marketAmount = batteryAmount * C_MARCHE;
  const securityAmount = marketAmount * C_SECURITE;
  const chassisAmount = chassis === "abime" ? securityAmount * 0.85 : securityAmount;
  const bonusRate = bonusMultiplier(bonus);
  const amountBeforeRounding = chassisAmount * (1 + bonusRate);
  const roundedValue = roundDownToThousand(amountBeforeRounding);
  const estimatedValue = roundedValue < referencePrice * VRT_FLOOR_RATIO
    ? 0
    : roundedValue;

  return {
    estimatedValue,
    bonusRate,
    breakdown: [
      { code: "reference_price", label: "Prix de référence", amount: referencePrice },
      { code: "screen", label: effectLabelForScreen(screen), amount: screenAmount },
      { code: "battery", label: effectLabelForBattery(battery), amount: batteryAmount },
      { code: "market", label: "Ajustement marché", amount: marketAmount },
      { code: "security", label: "Contrôle et reconditionnement", amount: securityAmount },
      ...(chassis === "abime"
        ? [{ code: "chassis", label: "Châssis endommagé", amount: chassisAmount }]
        : [{ code: "chassis", label: "Châssis intact", amount: chassisAmount }]),
      ...(bonusRate > 0
        ? [{ code: "bonus", label: "Bonus appareil", amount: amountBeforeRounding }]
        : []),
    ],
  };
}

export function isUsableReferencePrice(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

export function isReferenceStale(updatedAt, now = Date.now()) {
  if (!updatedAt) return true;
  const updatedAtMs = new Date(updatedAt).getTime();
  return !Number.isFinite(updatedAtMs) || now - updatedAtMs > PRT_FRESHNESS_DAYS * 86400000;
}

export function buildIndicativeEstimate(device, request, now = Date.now()) {
  const resolved = resolveOfficialInputs(request);
  const calculation = calculateIndicativeValue(Number(device.prt_fcfa), {
    ...resolved,
    bonus: request.condition.bonus,
  });
  const stale = isReferenceStale(device.prt_updated_at, now);

  return {
    currency: "XOF",
    status: stale ? "INDICATIVE_STALE" : "INDICATIVE",
    referencePrice: Number(device.prt_fcfa),
    estimatedValue: calculation.estimatedValue,
    confidence: {
      level: stale ? "low" : "medium",
      basis: stale
        ? ["Prix de référence ancien ou sans date de mise à jour.", "État déclaré par l’utilisateur."]
        : ["Prix de référence récent.", "État déclaré par l’utilisateur."],
    },
    breakdown: calculation.breakdown,
    notes: resolved.notes,
    pricingVersion: PRICING_VERSION,
    referenceUpdatedAt: device.prt_updated_at ?? null,
    device: {
      id: device.id,
      brand: device.marque,
      model: device.modele,
      variant: device.variante,
    },
  };
}
