import { calculerEstimation, Diagnostics } from "../../src/lib/pricing";

const tests = [
    {
        name: "Apple iPhone 15 (2024) - Excellent",
        prt: 500000,
        brand: "Apple",
        year: 2024,
        diag: { screenState: "intact", batteryState: "good", biometricsState: "ok", cameraState: "ok", aestheticState: "very_good" },
        // v2.1 -> C_marque(0.90) * C_age(0.75) * C_etat(0.95) * C_batterie(0.92) * C_marche(0.9) * C_securite(0.85)
        expected: 225656
    },
    {
        name: "Samsung S23 (2023) - Bon",
        prt: 400000,
        brand: "Samsung",
        year: 2023,
        diag: { screenState: "intact", batteryState: "good", biometricsState: "ok", cameraState: "ok", aestheticState: "bon" },
        // v2.1 -> Samsung S/Z = 0.90 in charter, but brand-only input falls back conservatively to 0.84
        expected: 130653
    },
    {
        name: "Infinix (2021) - Critique (Ecran)",
        prt: 100000,
        brand: "Infinix",
        year: 2021,
        diag: { screenState: "cracked", batteryState: "good", biometricsState: "ok", cameraState: "ok", aestheticState: "very_good" },
        // v2.1 floor: if VRT < 5% PRT then refused -> 0
        expected: 0
    }
];

let failed = 0;
console.log("Running Pricing Charter v1.0 Tests (Corrected for 2026 context)...");
tests.forEach(t => {
    const result = calculerEstimation(t.prt, t.brand, t.year, t.diag as any);
    if (Math.abs(result - t.expected) > 5) { // Strict check
        console.error(`[FAIL] ${t.name}: Expected approx ${t.expected}, got ${result}`);
        failed++;
    } else {
        console.log(`[PASS] ${t.name} -> ${result} FCFA`);
    }
});

if (failed > 0) process.exit(1);
console.log("All tests passed!");
