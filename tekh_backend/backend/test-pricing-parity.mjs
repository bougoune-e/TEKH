import assert from "node:assert/strict";
import { calculerEstimation } from "../../src/core/api/pricing.ts";
import {
  buildIndicativeEstimate,
  calculateIndicativeValue,
  isReferenceStale,
  isUsableReferencePrice,
  resolveOfficialInputs,
  validateEstimateInput,
} from "./pricing-engine.js";

const referenceDevice = {
  id: "1f8c0a24-b485-4bc8-90b5-2c1db0c86e2a",
  marque: "Samsung",
  modele: "Galaxy S23",
  variante: "256GB",
  prt_fcfa: 400000,
  prt_updated_at: "2026-10-20T00:00:00.000Z",
};

const vectors = [
  { name: "appareil parfait", diag: { ecran: "parfait", chassis: "intact", batterie: "gte90" } },
  { name: "écran rayé", diag: { ecran: "raye", chassis: "intact", batterie: "gte80_89" } },
  { name: "écran fortement dégradé", diag: { ecran: "casse", chassis: "intact", batterie: "gte80_89" } },
  { name: "batterie faible", diag: { ecran: "parfait", chassis: "intact", batterie: "lt60" } },
  { name: "châssis abîmé", diag: { ecran: "parfait", chassis: "abime", batterie: "gte80_89" } },
  {
    name: "bonus plafonné",
    diag: {
      ecran: "parfait",
      chassis: "intact",
      batterie: "gte90",
      bonus: {
        boiteEtAccessoiresComplets: true,
        compatible5g: true,
        debloqueTousOperateurs: true,
        factureAchatOriginale: true,
      },
    },
  },
];

for (const vector of vectors) {
  const webValue = calculerEstimation(
    referenceDevice.prt_fcfa,
    referenceDevice.marque,
    2023,
    vector.diag,
    referenceDevice.modele,
  );
  const serverValue = calculateIndicativeValue(referenceDevice.prt_fcfa, {
    screen: vector.diag.ecran,
    chassis: vector.diag.chassis,
    battery: vector.diag.batterie,
    bonus: vector.diag.bonus,
  }).estimatedValue;
  assert.equal(serverValue, webValue, `${vector.name}: server value must match the active web engine`);
}

const touchFailure = resolveOfficialInputs({
  condition: { screen: "parfait", chassis: "intact" },
  diagnostic: { battery: "gte90", touch: "failed", charging: "passed" },
});
assert.equal(touchFailure.screen, "casse");

const chargingFailure = resolveOfficialInputs({
  condition: { screen: "parfait", chassis: "intact" },
  diagnostic: { battery: "gte90", touch: "passed", charging: "failed" },
});
assert.equal(chargingFailure.battery, "lt60");

const unchanged = resolveOfficialInputs({
  condition: { screen: "raye", chassis: "intact" },
  diagnostic: { battery: "gte80_89", touch: "warning", charging: "skipped" },
});
assert.deepEqual(unchanged, {
  screen: "raye",
  chassis: "intact",
  battery: "gte80_89",
  notes: [],
});

const validRequest = {
  deviceId: referenceDevice.id,
  condition: { screen: "parfait", chassis: "intact" },
  diagnostic: { battery: "gte90", touch: "passed", charging: "passed" },
};
assert.deepEqual(validateEstimateInput(validRequest), []);
assert.ok(validateEstimateInput({}).length > 0, "missing input must be rejected");

const estimate = buildIndicativeEstimate(referenceDevice, validRequest, Date.parse("2026-10-29T00:00:00.000Z"));
assert.equal(estimate.status, "INDICATIVE");
assert.equal(estimate.currency, "XOF");
assert.equal(estimate.referencePrice, 400000);
assert.equal(estimate.estimatedValue, calculerEstimation(400000, "Samsung", 2023, {
  ecran: "parfait",
  chassis: "intact",
  batterie: "gte90",
}, "Galaxy S23"));
assert.equal(estimate.pricingVersion, "1.0.0");
assert.ok(estimate.breakdown.length >= 6);

assert.equal(isUsableReferencePrice(null), false);
assert.equal(isUsableReferencePrice(0), false);
assert.equal(isUsableReferencePrice(400000), true);

assert.equal(isReferenceStale("2026-09-01T00:00:00.000Z", Date.parse("2026-10-29T00:00:00.000Z")), true);
assert.equal(isReferenceStale(null, Date.parse("2026-10-29T00:00:00.000Z")), true);
assert.equal(isReferenceStale("2026-10-20T00:00:00.000Z", Date.parse("2026-10-29T00:00:00.000Z")), false);

console.log("Pricing parity tests passed.");
