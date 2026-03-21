import { calculerEstimation, type Diagnostics } from "../../src/core/api/pricing";

const tests = [
  {
    name: "Apple iPhone 15 (2024) — écran parfait, batterie 80–89 %",
    prt: 500_000,
    brand: "Apple",
    year: 2024,
    model: "iPhone 15",
    diag: {
      ecran: "parfait",
      chassis: "intact",
      batterie: "gte80_89",
    } satisfies Diagnostics,
    // 500000 × 0.90 × C_age(2 ans → 0.75) × 0.95 × 0.92 × 0.90 × 0.85
    expected: 225_656,
  },
  {
    name: "Samsung Galaxy S23 (2023) — série S",
    prt: 400_000,
    brand: "Samsung",
    year: 2023,
    model: "Galaxy S23",
    diag: {
      ecran: "parfait",
      chassis: "intact",
      batterie: "gte80_89",
    } satisfies Diagnostics,
    // 400000 × 0.90 × C_age(3 ans → 0.62) × 0.95 × 0.92 × 0.90 × 0.85
    expected: 149_234,
  },
  {
    name: "Infinix (2021) — écran cassé (sous plancher 5 %)",
    prt: 100_000,
    brand: "Infinix",
    year: 2021,
    model: "Hot 12",
    diag: {
      ecran: "casse",
      chassis: "intact",
      batterie: "gte80_89",
    } satisfies Diagnostics,
    expected: 0,
  },
];

let failed = 0;
console.log("Tests moteur pricing TEKH+ (charte métier)...");
tests.forEach((t) => {
  const result = calculerEstimation(t.prt, t.brand, t.year, t.diag, t.model);
  if (Math.abs(result - t.expected) > 2) {
    console.error(`[FAIL] ${t.name}: attendu ~${t.expected}, obtenu ${result}`);
    failed++;
  } else {
    console.log(`[PASS] ${t.name} -> ${result} FCFA`);
  }
});

if (failed > 0) process.exit(1);
console.log("Tous les tests sont passés.");
