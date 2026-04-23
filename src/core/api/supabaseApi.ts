import { getToken, setSession, clearSession } from "./auth";
import { supabase as realClient } from "./supabaseClient";
import { getProduits } from "@/core/api/main_api";
import { lookupCsvVariants } from "@/core/api/csvCatalog";
import {
  fetchSmartphonesForBrandModel,
  fetchDistinctModelsFromSmartphones,
  pickSmartphoneForStorage,
  smartphoneRowToPrtMeta,
  type SmartphoneRow,
} from "@/core/api/smartphonesCatalog";
import { ALLOWED_BRANDS, isAllowedBrand } from "@/core/api/brandConfig";

type Credentials = { email: string; password: string };

type Session = { access_token: string } | null;
const PRICES_TABLE: string = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_PRICES_TABLE) || "prix_telephones";
const FALLBACK_TABLE = "produits";

let pendingPhone: string | null = null;
let localUser: any = null;
const localListeners: Array<(ev: string, session: any) => void> = [];
const CURRENT_YEAR = new Date().getFullYear();
// Cache for products from Railway API
let cachedProduits: any[] | null = null;
// In-memory cache for brands and models (survive component remounts, instant second load)
let cachedBrands: string[] | null = null;
const cachedModels: Map<string, string[]> = new Map();

// ── localStorage cache helpers (TTL 24h) ────────────────────────────────
const LS_TTL = 24 * 60 * 60 * 1000; // 24 hours
const LS_BRANDS_KEY = "tekh:px:brands:v1";
const LS_MODELS_PFX = "tekh:px:models:v1:";

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; }
}
function lsSet(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { }
}
export function getPriceFromCache(brand: string, model: string, storage: number): { prt_fcfa: number; classe_tekh: string | null; annee_sortie: number | null } | null {
  const key = `tekh:px:price:v1:${brand}|${model}|${storage}`;
  return lsGet(key);
}
export function setPriceCache(brand: string, model: string, storage: number, data: { prt_fcfa: number; classe_tekh: string | null; annee_sortie: number | null }) {
  const key = `tekh:px:price:v1:${brand}|${model}|${storage}`;
  lsSet(key, data);
}
async function getApiProduits() {
  if (cachedProduits) return cachedProduits;
  try {
    cachedProduits = await getProduits();
    if (import.meta.env.DEV && cachedProduits?.length !== undefined) {
      console.debug("[supabaseApi] getApiProduits ok, count:", cachedProduits.length);
    }
    return cachedProduits;
  } catch (e) {
    console.warn("[supabaseApi] getApiProduits failed (fallback to static lists)", e);
    return [];
  }
}

function emitLocal(ev: string) {
  const token = getToken();
  const session = localUser ? { access_token: token, user: localUser } : null;
  for (const fn of localListeners) {
    try { fn(ev, session); } catch { }
  }
}

function normalizeStr(value: any): string {
  return String(value ?? "").trim();
}

function normalizeLower(value: any): string {
  return normalizeStr(value).toLowerCase();
}

function getBrandName(p: any): string {
  return normalizeStr(p.marques ?? p.brand ?? p.Marque);
}

function getModelName(p: any): string {
  return normalizeStr(p.modele_exact ?? p.model ?? p["Modèle Exact"]);
}

function toPositiveNumber(value: any): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getStorageGb(p: any): number | null {
  return toPositiveNumber(p.stockages_gb ?? p.stockage_gb ?? p.storage ?? p["Stockages (GB)"]);
}

function getRamGb(p: any): number | null {
  return toPositiveNumber(p.ram_gb ?? p.ram ?? p["RAM (GB)"]);
}

function getBasePriceFcfa(p: any): number {
  return Number(p.prix_neuf_en_fcfa ?? p.prix_neuf_fcfa ?? p.price ?? p["Prix neuf en FCFA"] ?? 0) || 0;
}

function sanitizeReleaseYear(raw: any): number | null {
  const y = Number(raw);
  if (!Number.isFinite(y)) return null;
  if (y < 2000) return null;
  // Tolère l'année suivante (annonces), bloque les valeurs aberrantes (ex: 2064)
  if (y > CURRENT_YEAR + 1) return CURRENT_YEAR;
  return y;
}

// Metadata functions - LOCAL ONLY to avoid 404s
export async function fetchAllStorages(): Promise<number[]> {
  const DEFAULTS = [32, 64, 128, 256, 512, 1024];
  try {
    const rows = await getProduits();
    const set = Array.from(new Set((rows || [])
      .map((r: any) => Number(r.stockages_gb ?? r.stockage_gb ?? r["Stockages (GB)"] ?? r.storage))
      .filter((n) => Number.isFinite(n))));
    const merged = Array.from(new Set([...set, ...DEFAULTS]));
    return merged.sort((a, b) => a - b);
  } catch {
    return DEFAULTS;
  }
}

export async function fetchAllRams(): Promise<number[]> {
  const DEFAULTS = [1, 2, 3, 4, 6, 8, 12, 16, 18, 24];
  try {
    const rows = await getProduits();
    const vals = (rows || [])
      .map((r: any) => Number(r.ram ?? r.ram_gb ?? r["RAM (GB)"]))
      .filter((n) => Number.isFinite(n));
    const merged = Array.from(new Set([...vals, ...DEFAULTS]));
    return merged.sort((a, b) => a - b);
  } catch {
    return DEFAULTS;
  }
}

const STATIC_MODELS: Record<string, string[]> = {
  "Apple": ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 6", "iPhone 6 Plus", "iPhone 6S", "iPhone 6S Plus", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus", "iPhone SE (1ere Gen.)", "iPhone SE (2eme Gen.)", "iPhone SE (3eme Gen.)", "iPhone X", "iPhone Xr", "iPhone Xs", "iPhone Xs Max"],
  "Samsung": ["A01", "A01 Core", "A02", "A02S", "A03", "A03 Core", "A03S", "A04", "A04E", "A04S", "A05", "A05S", "A06", "A10", "A10S", "A11", "A12", "A12 Nacho", "A13 4G", "A13 5G", "A14 4G", "A14 5G", "A15 4G", "A15 5G", "A16 5G", "A20", "A20S", "A21", "A21S", "A22 4G", "A22 5G", "A23 4G", "A23 5G", "A24 4G", "A25 5G", "A3 (2017)", "A30", "A30S", "A31", "A32 4G", "A32 5G", "A33 5G", "A34 5G", "A35 5G", "A40", "A5 (2017)", "A50", "A50S", "A51 4G", "A51 5G", "A52 4G", "A52 5G", "A52S 5G", "A53 5G", "A54 5G", "A6 (2018)", "A6+ (2018)", "A60", "A7 (2017)", "A7 (2018)", "A70", "A70S", "A71 4G", "A71 5G", "A72 4G", "A72 5G", "A73 5G", "A8 (2018)", "A8+ (2018)", "A80", "A9 (2018)", "Flip", "Flip 5G", "Fold", "Note 10", "Note 10 Lite", "Note 10 Plus", "Note 20", "Note 20 Ultra", "S10", "S10 5G", "S10 Lite", "S10+", "S10E", "S20", "S20 FE", "S20 Ultra", "S20+", "S21", "S21 FE", "S21 Ultra", "S21+", "S22", "S22 Ultra", "S22+", "S23", "S23 FE", "S23 Ultra", "S23+", "S24", "S24 Ultra", "S24+", "S8", "S8 Active", "S8+", "S9", "S9 Active", "S9+", "Z Flip 3", "Z Flip 4", "Z Flip 5", "Z Flip 6", "Z Fold 2", "Z Fold 3", "Z Fold 4", "Z Fold 5", "Z Fold 6"],
  "Google Pixel": ["Pixel", "Pixel 2", "Pixel 2 XL", "Pixel 3", "Pixel 3 XL", "Pixel 3A", "Pixel 3A XL", "Pixel 4", "Pixel 4 XL", "Pixel 4A", "Pixel 4A (5G)", "Pixel 5", "Pixel 5A (5G)", "Pixel 6", "Pixel 6 Pro", "Pixel 6A", "Pixel 7", "Pixel 7 Pro", "Pixel 7A", "Pixel 8", "Pixel 8 Pro", "Pixel 8A", "Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro Fold", "Pixel 9 Pro XL", "Pixel XL"],
  "Huawei": ["Mate 40", "Mate 40 Pro", "Mate 40 Pro+", "Mate 60", "Mate 60 Pro", "Mate 60 Pro+", "Nova 10", "Nova 10 Pro", "Nova 11", "Nova 11 Pro", "Nova 11 Ultra", "Nova 12 Pro", "Nova 12 SE", "Nova 12 Ultra", "Nova 12i", "Nova 12S", "Nova 13", "Nova 13 Pro", "Nova 8", "Nova 9", "Nova 9 SE", "P30", "P30 Lite", "P30 Pro", "P40", "P40 Pro", "P40 Pro+", "P50", "P50 Pocket", "P50 Pro", "P60", "P60 Pro", "Pura 70", "Pura 70 Pro", "Pura 70 Ultra", "Y7A", "Y8P", "Y8S", "Y9 (2019)", "Y9 Prime (2019)", "Y9A", "Y9S"],
  "Honor": ["70", "80", "80 Pro", "90", "Magic 4", "Magic 4 Pro", "Magic 4 Ultimate", "Magic 5", "Magic 5 Pro", "Magic 5 Ultimate", "Magic 6", "Magic 6 Pro", "Magic 6 Ultimate", "X7B", "X8B", "X9B"],
  "OnePlus": ["2", "3", "3T", "5", "5T", "6", "6T", "6T McLaren", "7", "7 Pro", "7 Pro 5G", "7T", "7T Pro", "7T Pro McLaren", "8", "8 Pro", "8T", "9", "9 Pro", "9RT", "10 Pro", "10R", "10T", "11", "11R", "12", "12R", "Nord", "Nord 2", "Nord 2T", "Nord 3", "Nord CE 2", "Nord CE 2 Lite", "Nord CE 3", "Nord CE 3 Lite", "Nord CE 4", "One", "Open"],
  "Xiaomi": ["Mi 10", "Mi 10 Lite 5G", "Mi 10 Pro", "Mi 10 Ultra", "Mi 10T", "Mi 10T Lite", "Mi 10T Pro", "Mi 11i", "Mi 11 Lite (4G)", "Mi 11 Lite 5G", "Mi 11 Lite 5G NE", "11", "11 Pro", "11 Ultra", "11T", "11T Pro", "12", "12 Lite", "12 Pro", "12S Ultra", "12T", "12T Pro", "13", "13 Lite", "13 Pro", "13 Ultra", "13T", "13T Pro", "14", "14 Pro", "14 Ultra", "14T", "14T Pro", "15", "15 Pro", "15 Ultra", "15T", "15T Pro"],
  "Redmi": ["12C", "13C", "14C", "15C", "Note 7", "Note 7 Pro", "Note 8", "Note 8 Pro", "Note 9", "Note 9 Pro", "Note 9 Pro Max", "Note 9S", "Note 10", "Note 10 5G", "Note 10 Pro", "Note 10 Pro Max", "Note 10S", "Note 11", "Note 11 Pro", "Note 11 Pro +", "Note 11 Pro 5G", "Note 11S", "Note 12", "Note 12 5G", "Note 12 Pro 5G", "Note 12 Pro+", "Note 12S", "Note 13 4G", "Note 13 5G", "Note 13 Pro 4G", "Note 13 Pro 5G", "Note 13 Pro+ 5G"],
  "Poco": ["M2", "M2 Pro", "M3", "M3 Pro 5G", "M4 5G", "M4 Pro 4G", "M4 Pro 5G", "M5", "M5 S", "M6 4G", "M6 5G", "M6 Pro 4G", "M6 Pro 5G", "M7", "M7 Pro 5G", "X2", "X3 GT", "X3 NFC", "X3 Pro", "X4 GT", "X4 Pro 5G", "X5 5G", "X5 Pro 5G", "X6 5G", "X6 Pro 5G", "F4", "F4 GT", "F5", "F5 Pro", "F6", "F6 Pro", "C65"],
  "Oppo": ["A1", "A1K", "A3", "A3 5G", "A3 Pro 5G", "A3S", "A3X 4G", "A5", "A5 (2020)", "A5 5G", "A5 Pro", "A5 Pro 5G", "A5X", "A6", "A6 Pro", "A6 Pro 5G", "A6X", "A6X 5G", "A7", "A7N", "A8", "A12", "A12E", "A15", "A15S", "A16", "A16K", "A16S", "A17", "A17K", "A18", "A31 (2020)", "A38", "A52", "A53", "A53 5G", "A53S", "A53S 5G", "A54", "A54 5G", "A55", "A55 5G", "A57", "A57S", "A58", "A71", "A71 (2018)", "A72", "A72 5G", "A74", "A74 5G", "A76", "A77 5G", "A78", "A78 5G", "A79 5G", "A83", "A83 Pro", "A91", "A92", "A92S 5G", "A93", "A93 5G", "A94", "A94 5G", "A95", "A95 5G", "A96", "A97 5G", "A98 5G", "A9 (2020)", "F11", "F11 Pro", "F15", "F17", "F17 Pro", "F19", "F19 Pro", "F19 Pro+ 5G", "F21 Pro (4G/5G)", "F23", "Find X2", "Find X2 Lite", "Find X2 Neo", "Find X2 Pro", "Find X3", "Find X3 Lite", "Find X3 Neo", "Find X3 Pro", "Find X5", "Find X5 Pro", "Find X6", "Find X6 Pro", "Find X7", "Find X7 Ultra", "Find X8", "Find X8 Ultra", "Reno 2F", "Reno 6", "Reno 6 Pro", "Reno 7", "Reno 7 Pro", "Reno 8", "Reno 8 Pro", "Reno 10", "Reno 10 Pro", "Reno 10 Pro+", "Reno 11", "Reno 11 Pro", "Reno 12", "Reno 12 F", "Reno 12 FS", "Reno 12 Pro", "Reno 13 F", "Reno 13 FS"],
  "Realme": ["9 Pro+", "10 Pro", "10 Pro+", "11 Pro", "11 Pro+", "12", "12 Pro", "12 Pro+", "12+ 5G", "GT 2", "GT 2 Pro", "GT 3", "GT 5", "GT 5 Pro", "GT 6"],
  "Vivo": ["V25", "V25 Lite", "V25 Pro", "V27", "V27 Pro", "V27E", "V29", "V29 Lite", "V29 Pro", "V30", "V30 Lite", "V30 Pro", "T3X", "X80", "X80 Lite", "X80 Pro", "X90", "X90 Pro", "X100", "X100 Pro", "X100 Ultra", "Y22S", "Y27", "Y35", "Y36", "Y78", "Y100", "Y200 5G"],
  "Motorola": ["Edge (2020)", "Edge+ (2020)", "Edge (2022)", "Edge+ (2022)", "Edge 20", "Edge 20 Lite", "Edge 20 Fusion", "Edge 20 Pro", "Edge 30", "Edge 30 Neo", "Edge 30 Fusion", "Edge 30 Pro", "Edge 30 Ultra", "Edge 40", "Edge 40 Neo", "Edge 40 Fusion", "Edge 40 Pro", "Edge 50", "Edge 50 Neo", "Edge 50 Fusion", "Edge 50 Pro", "Edge 50 Ultra", "Edge 60 Fusion", "Edge 60 Pro", "Edge 60 Ultra", "Moto E13", "Moto E20", "Moto E22", "Moto E22S", "Moto E40", "Moto G13", "Moto G14", "Moto G23", "Moto G32", "Moto G34 5G", "Moto G53 5G", "Moto G54 5G", "Moto G73 5G", "Moto G84 5G", "Razr 40", "Razr 40 Ultra"],
  "Tecno": ["Camon 11", "Camon 11 Pro", "Camon 12", "Camon 12 Air", "Camon 12 Pro", "Camon 15", "Camon 15 Air", "Camon 15 Premier", "Camon 15 Pro", "Camon 16", "Camon 16 Premier", "Camon 16 Pro", "Camon 16 SE", "Camon 17", "Camon 17 P", "Camon 17 Pro", "Camon 18", "Camon 18 P", "Camon 18 Premier", "Camon 19", "Camon 19 Pro", "Camon 20", "Camon 20 Premier 5G", "Camon 20 Pro 5G", "Camon 30", "Camon 30 5G", "Camon 30 Premier 5G", "Camon 30 Pro 5G", "Camon 30S", "Camon 40", "Camon 40 Premier", "Camon 40 Pro", "Phantom X", "Phantom X2", "Phantom X2 Pro", "Pop 3", "Pop 3 LTE", "Pop 3 Plus", "Pop 4", "Pop 4 LTE", "Pop 4 Pro", "Pop 5", "Pop 5 LTE", "Pop 5 Pro", "Pop 6", "Pop 6 LTE", "Pop 6 Pro", "Pop 7", "Pop 7 LTE", "Pop 7 Pro", "Pop 8", "Pop 8 LTE", "Pop 8 Pro", "Pop 9", "Pop 9 5G", "Pop 9 Pro", "Pop 10", "Pop 10 C", "Pop 10 Pro", "Pova 5", "Pova 5 Pro", "Pova 6 Pro", "Spark 7", "Spark 7 Pro", "Spark 8", "Spark 8 Pro", "Spark 9", "Spark 9 Pro", "Spark 9T", "Spark 10", "Spark 10C", "Spark 10 Pro", "Spark 15", "Spark 15 Air", "Spark 15 Pro", "Spark 16", "Spark 16 Pro", "Spark 20", "Spark 20 5G", "Spark 20C", "Spark 20 Pro", "Spark 20 Pro+", "Spark 30 4G", "Spark 30 5G", "Spark 30C", "Spark 40", "Spark 40C", "Spark 40 Pro", "Spark 40 Pro+"],
  "Infinix": ["Hot 9", "Hot 9 Play", "Hot 10", "Hot 10 Play", "Hot 10S", "Hot 10T", "Hot 11", "Hot 11S NFC", "Hot 12 Play", "Hot 12 Pro", "Hot 20", "Hot 20 5G", "Hot 20S", "Hot 30", "Hot 30i", "Hot 40 5G", "Hot 40i", "Hot 40 Pro", "Note 6", "Note 7", "Note 8", "Note 10", "Note 10 Pro", "Note 11", "Note 11 Pro", "Note 12", "Note 12 Pro 4G", "Note 12 Pro 5G", "Note 30", "Note 30i", "Note 30 Pro", "Note 40 4G", "Note 40 5G", "Note 40 Pro 4G", "Note 40 Pro 5G", "Note 40 Pro+ 5G", "S4", "S5 Pro", "Smart 4", "Smart 4 Plus", "Smart 6", "Smart 6 Plus", "Smart 8", "Smart 8 Pro", "GT 10 Pro", "GT 20 Pro", "Zero 8", "Zero 20", "Zero 30 4G", "Zero 30 5G", "Zero Ultra", "Zero X Pro"],
  "Asus": ["ROG Phone 6", "ROG Phone 6 Pro", "ROG Phone 6D Ultimate", "ROG Phone 7", "ROG Phone 7 Ultimate", "ROG Phone 8", "ROG Phone 8 Pro"],
  "LG": ["G6", "G7 ThinQ", "G8 ThinQ", "G8X ThinQ", "K41S", "K51S", "K61", "K92 5G", "Stylo 6", "V30", "V30S ThinQ", "V40 ThinQ", "V50 ThinQ 5G", "V60 ThinQ 5G", "Velvet 4G", "Velvet 5G", "Wing 5G"],
  "Lenovo": ["Legion Phone Duel 2"],
  "Red Magic": ["3S", "5G", "5S Pro", "6", "6 Pro", "6R", "7", "7 Pro", "7S Pro", "8 Pro", "8S Pro", "9 Pro", "9S Pro", "10 Pro", "10S Pro", "11 Pro"],
  "ZTE": ["Axon 50 5G", "Axon 60 Pro", "Axon 60 Ultra", "Blade V40 Pro", "Blade V40 Vita", "Blade V50 Design"],
};

export async function fetchBrands(): Promise<string[]> {
  if (cachedBrands) return cachedBrands;
  // ── localStorage fast-path ─────────────────────────────────────────────
  const lsBrands = lsGet<string[]>(LS_BRANDS_KEY);
  if (lsBrands && lsBrands.length > 0) {
    cachedBrands = lsBrands;
    // Refresh from Supabase in background (stale-while-revalidate)
    setTimeout(() => fetchBrands_fromSupabase(), 0);
    return cachedBrands;
  }
  return fetchBrands_fromSupabase();
}
async function fetchBrands_fromSupabase(): Promise<string[]> {
  try {
    if (realClient) {
      // Pagination — PostgREST cap à 1000 lignes, on boucle pour tout récupérer
      const PAGE = 1000;
      const all: string[] = [];
      let from = 0;
      for (;;) {
        const { data, error } = await realClient
          .from("smartphones")
          .select("marque")
          .not("marque", "is", null)
          .range(from, from + PAGE - 1);
        if (error || !data?.length) break;
        all.push(...data.map((r: any) => r.marque));
        if (data.length < PAGE) break;
        from += PAGE;
      }
      if (all.length > 0) {
        const brands = Array.from(new Set(all.filter(Boolean)))
          .sort((a: any, b: any) => a.localeCompare(b, "fr")) as string[];
        if (brands.length > 0) { cachedBrands = brands; lsSet(LS_BRANDS_KEY, brands); return brands; }
      }
    }
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const brands = Array.from(new Set(products.map(getBrandName).filter(Boolean).filter(isAllowedBrand))).sort() as string[];
      if (brands.length > 0) { cachedBrands = brands; lsSet(LS_BRANDS_KEY, brands); return brands; }
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchBrands failed, using STATIC_MODELS", err);
  }
  cachedBrands = Object.keys(STATIC_MODELS);
  lsSet(LS_BRANDS_KEY, cachedBrands);
  return cachedBrands;
}

export async function fetchModels(brand: string): Promise<string[]> {
  if (cachedModels.has(brand)) return cachedModels.get(brand)!;
  // ── localStorage fast-path ─────────────────────────────────────────────
  const lsKey = `${LS_MODELS_PFX}${brand}`;
  const lsModels = lsGet<string[]>(lsKey);
  if (lsModels && lsModels.length > 0) {
    cachedModels.set(brand, lsModels);
    setTimeout(() => fetchModels_fromSupabase(brand), 0);
    return lsModels;
  }
  return fetchModels_fromSupabase(brand);
}
async function fetchModels_fromSupabase(brand: string): Promise<string[]> {
  try {
    const fromSm = await fetchDistinctModelsFromSmartphones(brand);
    if (fromSm.length > 0) {
      cachedModels.set(brand, fromSm);
      lsSet(`${LS_MODELS_PFX}${brand}`, fromSm);
      return fromSm;
    }
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const targetBrand = normalizeLower(brand);
      const fromApi = Array.from(new Set(
        products.filter(p => normalizeLower(getBrandName(p)) === targetBrand).map(getModelName).filter(Boolean)
      )).sort((a: any, b: any) => a.localeCompare(b, "fr")) as string[];
      if (fromApi.length > 0) { cachedModels.set(brand, fromApi); lsSet(`${LS_MODELS_PFX}${brand}`, fromApi); return fromApi; }
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchModels failed for brand:", brand, err);
  }
  const fallback = STATIC_MODELS[brand] || [];
  if (fallback.length > 0) lsSet(`${LS_MODELS_PFX}${brand}`, fallback);
  return fallback;
}

export async function fetchStorages(brand: string, model: string): Promise<number[]> {
  try {
    if (realClient) {
      const { data, error } = await realClient
        .from("variants")
        .select("storage_gb, models!inner(name, brands!inner(name))")
        .eq("models.name", model)
        .eq("models.brands.name", brand)
        .order("storage_gb");

      if (!error && data) {
        return Array.from(new Set(data.map(v => v.storage_gb)));
      }
    }
    const variants = await getAvailableVariants(brand, model);
    if (variants.length > 0) {
      return Array.from(new Set(variants.map((v) => v.storage_gb).filter((n) => Number.isFinite(n) && n > 0))).sort((a, b) => a - b);
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchStorages failed", brand, model, err);
  }
  // CSV catalogue as authoritative fallback
  const csv = lookupCsvVariants(brand, model);
  if (csv && csv.storages.length > 0) return csv.storages;
  return [64, 128, 256, 512];
}

export interface ModelInfo {
  base_price_fcfa: number | null;
  release_year: number | null;
  equivalence_class: string | null;
  /** PRT issu de la table `smartphones` (prioritaire) */
  prt_source?: "smartphones" | "variants" | "api";
  prt_updated_at?: string | null;
  /** True si prt_updated_at > ~30 jours */
  prt_stale?: boolean;
}

function modelInfoFromSmartphoneRow(row: SmartphoneRow): ModelInfo {
  const meta = smartphoneRowToPrtMeta(row);
  return {
    base_price_fcfa: row.prt_fcfa,
    release_year: row.annee_sortie ?? null,
    equivalence_class: row.classe_tekh ?? null,
    prt_source: "smartphones",
    prt_updated_at: row.prt_updated_at,
    prt_stale: meta.prt_stale,
  };
}

export async function getModelInfo(brand: string, model: string, storage: number): Promise<ModelInfo | null> {
  try {
    if (realClient) {
      const smRows = await fetchSmartphonesForBrandModel(brand, model);
      const sm = pickSmartphoneForStorage(smRows, storage);
      if (sm && sm.prt_fcfa != null && sm.prt_fcfa > 0) {
        return modelInfoFromSmartphoneRow(sm);
      }
    }

    if (realClient) {
      const { data, error } = await realClient
        .from("variants")
        .select(`
          base_price_fcfa,
          models!inner(
            name,
            release_year,
            equivalence_class,
            brands!inner(name)
          )
        `)
        .eq("models.name", model)
        .eq("models.brands.name", brand)
        .eq("storage_gb", storage)
        .maybeSingle();

      if (!error && data) {
        const item: any = data;
        return {
          base_price_fcfa: item.base_price_fcfa,
          release_year: item.models.release_year,
          equivalence_class: item.models.equivalence_class,
          prt_source: "variants",
        };
      }
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const targetBrand = normalizeLower(brand);
      const targetModel = normalizeLower(model);
      const item = products.find(p =>
        normalizeLower(getBrandName(p)) === targetBrand &&
        normalizeLower(getModelName(p)) === targetModel &&
        getStorageGb(p) === storage
      );

      if (item) {
        return {
          base_price_fcfa: getBasePriceFcfa(item),
          release_year: sanitizeReleaseYear(item.annee_sortie ?? item.annee ?? item.release_year ?? 2022),
          equivalence_class: item.classe_equivalence ?? item.equivalence_class ?? item.classe ?? "C",
          prt_source: "api",
        };
      }
    }
  } catch (err) {
    console.warn("[supabaseApi] getModelInfo failed", err);
  }
  return null;
}

export interface ModelVariant {
  ram_gb: number | null;
  storage_gb: number;
  base_price_fcfa: number;
}

function variantsFromSmartphoneRows(rows: SmartphoneRow[]): ModelVariant[] {
  const out: ModelVariant[] = [];
  for (const row of rows) {
    if (row.prt_fcfa == null || row.prt_fcfa <= 0) continue;
    const specs = (row.specs || {}) as Record<string, unknown>;
    const ram = Number(specs.ram_gb ?? specs.ram ?? specs["RAM (GB)"]) || null;
    let storageGb: number | null = null;
    const v = (row.variante || "").trim();
    if (v) {
      const mTb = v.match(/(\d+)\s*(TB|To)/i);
      if (mTb) storageGb = parseInt(mTb[1], 10) * 1024;
      else {
        const m = v.match(/(\d+)\s*(GB|Go)/i);
        if (m) storageGb = parseInt(m[1], 10);
      }
    }
    if (storageGb == null) {
      const g = Number(specs.stockage_gb ?? specs.storage_gb ?? specs["Stockages (GB)"]);
      if (Number.isFinite(g) && g > 0) storageGb = g;
    }
    if (storageGb == null || !Number.isFinite(storageGb)) continue;
    out.push({
      ram_gb: ram,
      storage_gb: storageGb,
      base_price_fcfa: row.prt_fcfa,
    });
  }
  return out.sort((a, b) => a.storage_gb - b.storage_gb || (a.ram_gb || 0) - (b.ram_gb || 0));
}

export async function getAvailableVariants(brand: string, model: string): Promise<ModelVariant[]> {
  try {
    const smRows = await fetchSmartphonesForBrandModel(brand, model);
    const fromSm = variantsFromSmartphoneRows(smRows);
    if (fromSm.length > 0) return fromSm;

    if (realClient) {
      const { data, error } = await realClient
        .from("variants")
        .select(`
          ram_gb,
          storage_gb,
          base_price_fcfa,
          models!inner(name, brands!inner(name))
        `)
        .eq("models.name", model)
        .eq("models.brands.name", brand)
        .order("storage_gb");

      if (!error && data && data.length > 0) return data as any[];
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const targetBrand = normalizeLower(brand);
      const targetModel = normalizeLower(model);
      const filtered = products.filter(p =>
        normalizeLower(getBrandName(p)) === targetBrand &&
        normalizeLower(getModelName(p)) === targetModel
      );

      if (filtered.length > 0) {
        const variants = filtered
          .map((p) => ({
            ram_gb: getRamGb(p),
            storage_gb: getStorageGb(p),
            base_price_fcfa: getBasePriceFcfa(p),
          }))
          .filter((v) => Number.isFinite(v.storage_gb as number) && (v.storage_gb as number) > 0) as ModelVariant[];
        const dedup = new Map<string, ModelVariant>();
        for (const v of variants) {
          const key = `${v.storage_gb}:${v.ram_gb ?? "na"}`;
          if (!dedup.has(key) || (dedup.get(key)?.base_price_fcfa || 0) < v.base_price_fcfa) {
            dedup.set(key, v);
          }
        }
        return Array.from(dedup.values()).sort((a, b) => a.storage_gb - b.storage_gb || (a.ram_gb || 0) - (b.ram_gb || 0));
      }
    }
  } catch (err) {
    console.warn("[supabaseApi] getAvailableVariants failed", brand, model, err);
  }
  return [];
}

/** @deprecated Use getModelInfo */
export async function getBasePriceCFA(brand: string, model: string, storage: number): Promise<number | null> {
  const info = await getModelInfo(brand, model, storage);
  return info?.base_price_fcfa ?? null;
}

export async function fetchRams(brand: string, model: string): Promise<number[]> {
  try {
    if (realClient) {
      const { data, error } = await realClient
        .from("variants")
        .select("ram_gb, models!inner(name, brands!inner(name))")
        .eq("models.name", model)
        .eq("models.brands.name", brand)
        .order("ram_gb");

      if (!error && data) {
        return Array.from(new Set(data.map(v => v.ram_gb).filter((n) => Number.isFinite(n) && n > 0)));
      }
    }
    const variants = await getAvailableVariants(brand, model);
    if (variants.length > 0) {
      return Array.from(new Set(variants.map((v) => v.ram_gb).filter((n) => Number.isFinite(n as number) && (n as number) > 0) as number[])).sort((a, b) => a - b);
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchRams failed", err);
  }
  // CSV catalogue as authoritative fallback
  const csv = lookupCsvVariants(brand, model);
  if (csv && csv.rams.length > 0) return csv.rams;
  return [];
}

// Auth & Supabase code - keep as is for features that genuinely need Supabase (if any)
const localAuth = {
  async signUp(creds: Credentials) {
    const token = `local.signup.${btoa(creds.email)}`;
    localUser = { id: creds.email, email: creds.email };
    setSession({ token, role: "user", userId: creds.email, email: creds.email });
    emitLocal('SIGNED_IN');
    return { data: { user: localUser }, error: null } as any;
  },
  async signInWithPassword(creds: Credentials) {
    const token = `local.${btoa(creds.email)}`;
    localUser = { id: creds.email, email: creds.email };
    setSession({ token, role: "user", userId: creds.email, email: creds.email });
    emitLocal('SIGNED_IN');
    return { data: { user: localUser }, error: null } as any;
  },
  async signInWithOtp({ phone }: { phone: string }) {
    pendingPhone = phone;
    return { data: { session: null }, error: null } as any;
  },
  async verifyOtp({ phone, token: _token, type }: { phone: string; token: string; type: 'sms' | 'magiclink' }) {
    if (!pendingPhone || pendingPhone !== phone) {
      return { data: null, error: { message: 'Aucun OTP en attente pour ce numéro.' } } as any;
    }
    const token = `local.otp.${btoa(phone)}`;
    localUser = { id: phone, phone } as any;
    setSession({ token, role: "user", userId: phone });
    pendingPhone = null;
    emitLocal('SIGNED_IN');
    return { data: { user: localUser }, error: null } as any;
  },
  async signOut() {
    clearSession();
    localUser = null;
    emitLocal('SIGNED_OUT');
    return { error: null } as any;
  },
  async getSession(): Promise<{ data: { session: Session } }> {
    const token = getToken();
    return { data: { session: token && localUser ? { access_token: token, user: localUser } as any : null } } as any;
  },
  onAuthStateChange(cb: (ev: string, session: any) => void) {
    localListeners.push(cb);
    return {
      data: {
        subscription: {
          unsubscribe() {
            const i = localListeners.indexOf(cb);
            if (i >= 0) localListeners.splice(i, 1);
          },
        },
      },
    } as any;
  },
};

export const supabase: any = realClient ? realClient : { auth: localAuth };

export async function simulateValue({ battery, storage, cpu_score }: { battery: number; storage: number; cpu_score: number }) {
  if (realClient) {
    try {
      const { data, error } = await realClient.rpc("simulate_value", { battery, storage, cpu_score });
      if (!error && typeof data === "number") return data;
    } catch { }
  }
  const val = Math.round(storage * 0.8 + battery * 0.5 + cpu_score * 1.2 + 100);
  return val;
}

const CACHE_KEY = "swap:simulations";
function getCache(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch { return {}; }
}
function setCache(map: Record<string, number>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch { }
}
export function cacheSimulation(specs: any, value: number) {
  const key = JSON.stringify(specs);
  const map = getCache();
  map[key] = value;
  setCache(map);
}
export function getCachedSimulation(specs: any): number | null {
  const key = JSON.stringify(specs);
  const map = getCache();
  return typeof map[key] === "number" ? map[key] : null;
}

/** Génère une clé Storage sûre (ASCII uniquement) pour éviter "Invalid key" avec noms de fichier non-ASCII. */
function safeStorageKey(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ext || "jpg";
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
}

export async function uploadImage(file: File) {
  if (!realClient) throw new Error("Supabase non configuré");
  const fileName = safeStorageKey(file);
  const { error } = await realClient.storage.from("phones").upload(fileName, file);
  if (error) throw error;
  const { data: pub } = realClient.storage.from("phones").getPublicUrl(fileName);
  return { path: fileName, publicUrl: pub.publicUrl };
}

export async function createPhone(ownerId: string, phoneData: any, file: File) {
  if (!realClient) throw new Error("Supabase non configuré");
  const { path, publicUrl } = await uploadImage(file);
  const { data: img, error: imgErr } = await realClient.from("images").insert({ bucket: "phones", path, public_url: publicUrl, uploaded_by: ownerId }).select().single();
  if (imgErr) throw imgErr;
  const { data: phone, error: phoneErr } = await realClient.from("phones").insert({ owner_id: ownerId, brand: phoneData.brand, model: phoneData.model, storage: phoneData.storage, ram: phoneData.ram, color: phoneData.color, condition: phoneData.condition, base_value_cfa: phoneData.base_value_cfa, image_ids: [img.id] }).select().single();
  if (phoneErr) throw phoneErr;
  return phone;
}

export async function matchDeals(params: any) {
  if (!realClient) throw new Error("Supabase non configuré");
  const { data, error } = await realClient.rpc("match_deals", params);
  if (error) throw error;
  return data;
}

export function subscribeDeals(cb: (payload: any) => void) {
  if (!realClient) return { unsubscribe() { } };
  const channel = realClient.channel("realtime:deals").on("postgres_changes", { event: "INSERT", schema: "public", table: "annonces" } as any, (payload) => cb(payload)).subscribe();
  return { unsubscribe: () => realClient.removeChannel(channel) };
}

export async function getCurrentUser() {
  if (realClient) {
    const { data } = await realClient.auth.getSession();
    return data.session?.user ?? null;
  }
  try {
    const id = localStorage.getItem("swap:user_id") || localStorage.getItem("swap:user_email");
    if (!id) return null;
    return { id, email: localStorage.getItem("swap:user_email") } as any;
  } catch { return null; }
}

export async function uploadAvatar(file: File) {
  if (!realClient) throw new Error("Supabase non configuré");
  const fileName = `avatar_${safeStorageKey(file)}`;
  const { error } = await realClient.storage.from("avatars").upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data: pub } = realClient.storage.from("avatars").getPublicUrl(fileName);
  return pub.publicUrl as string;
}

export async function upsertProfile(profile: any) {
  if (!realClient) return null;
  const { data, error } = await realClient.from("profiles").upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function getProfileById(id: string) {
  if (!realClient) return null;
  const { data, error } = await realClient.from("profiles").select("id, full_name, avatar_url, updated_at").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureProfileForUser(user: any) {
  if (!realClient || !user?.id) return null;
  const existing = await getProfileById(user.id);
  if (existing) return existing;
  const meta = user?.user_metadata || {};
  const payload = { id: user.id, full_name: meta.full_name || meta.name || null, avatar_url: meta.avatar_url || null };
  const { data, error } = await realClient.from("profiles").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function countDealsByOwner(ownerId: string) {
  if (!realClient) return 0;
  const { count, error } = await realClient.from("annonces").select("id", { count: 'exact', head: true }).eq("owner_id", ownerId);
  if (error) return 0;
  return count || 0;
}

/** Compte le nombre de profils enregistrés (utilisateurs ayant un profil). */
export async function countProfiles(): Promise<number> {
  if (!realClient) return 0;
  const { count, error } = await realClient.from("profiles").select("id", { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
}

/** Admin : liste tous les profils utilisateurs. */
export async function fetchAllProfiles() {
  if (!realClient) return [];
  const { data, error } = await realClient
    .from("profiles")
    .select("id, full_name, avatar_url, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Admin : supprime un profil utilisateur (sans toucher à auth.users). */
export async function deleteProfile(id: string) {
  if (!realClient) return;
  const { error } = await realClient.from("profiles").delete().eq("id", id);
  if (error) throw error;
}

/** Solde TekhPoints (crédits actifs non expirés) — table `tekh_point_credits`. */
export type TekhPointsCreditLine = {
  id: string;
  amount_fcfa: number;
  expires_at: string;
  motif: string;
};

export type TekhPointsSummary = {
  balanceFcfa: number;
  points: number;
  nextExpiry: string | null;
  activeLines: number;
  lines: TekhPointsCreditLine[];
};

const TEKH_POINT_VALUE = 500;

export async function fetchTekhPointsSummary(userId: string): Promise<TekhPointsSummary> {
  const empty = { balanceFcfa: 0, points: 0, nextExpiry: null, activeLines: 0, lines: [] };
  if (!realClient) return empty;
  const now = new Date().toISOString();
  const { data, error } = await realClient
    .from("tekh_point_credits")
    .select("id, amount_fcfa, expires_at, metadata")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", now)
    .order("expires_at", { ascending: true });

  if (error || !data?.length) {
    if (import.meta.env.DEV && error) console.warn("[tekh_points]", error.message);
    return empty;
  }

  const balanceFcfa = data.reduce((s, r) => s + (Number(r.amount_fcfa) || 0), 0);
  const lines: TekhPointsCreditLine[] = data.map((r) => ({
    id: r.id,
    amount_fcfa: Number(r.amount_fcfa) || 0,
    expires_at: r.expires_at,
    motif: (r.metadata as any)?.motif || "Crédit",
  }));

  return {
    balanceFcfa,
    points: Math.floor(balanceFcfa / TEKH_POINT_VALUE),
    nextExpiry: data[0]?.expires_at ?? null,
    activeLines: data.length,
    lines,
  };
}

function mapAnnonceRow(row: any) {
  return {
    ...row,
    createdAt: row.created_at,
    ownerId: row.owner_id,
    sellerName: row.seller_name,
    contactPhone: row.contact_phone,
    contactWhatsapp: row.contact_whatsapp,
    contactEmail: row.contact_email,
    publishedAt: row.published_at,
  };
}

/** Délai d’expiration des annonces en heures (après publication). */
const DEAL_EXPIRATION_HOURS = 720; // 30 jours

/** App publique : uniquement les deals publiés et non expirés (72h après publication). */
export async function fetchDeals() {
  if (!realClient) return [];
  let data: any[] = [];
  let error: any = null;
  try {
    const r = await realClient.from("annonces").select("*").eq("status", "published").neq("seller_name", "Admin").order("created_at", { ascending: false });
    data = r.data || [];
    error = r.error;
  } catch {
    const r = await realClient.from("annonces").select("*").neq("seller_name", "Admin").order("created_at", { ascending: false });
    data = (r.data || []).filter((row: any) => row.status !== "draft" && row.status !== "archived");
    error = r.error;
  }
  if (error) throw error;
  const cutoff = new Date(Date.now() - DEAL_EXPIRATION_HOURS * 60 * 60 * 1000);
  const notExpired = (row: any) => {
    const t = row.published_at || row.created_at;
    return t && new Date(t) >= cutoff;
  };
  return data.filter(notExpired).map(mapAnnonceRow);
}

/** Admin : tous les deals (tous statuts) */
export async function fetchAllDealsForAdmin() {
  if (!realClient) return [];
  const { data, error } = await realClient.from("annonces").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAnnonceRow);
}

/** Admin : un deal par id */
export async function fetchDealById(id: string) {
  if (!realClient) return null;
  const { data, error } = await realClient.from("annonces").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapAnnonceRow(data) : null;
}

export async function insertDeal(deal: any) {
  if (!realClient) return deal;
  const row: Record<string, unknown> = {
    ...(deal.id && { id: deal.id }),
    title: deal.title,
    brand: deal.brand,
    model: deal.model,
    condition: deal.condition,
    description: deal.description,
    price: deal.price ?? 0,
    images: deal.images ?? [],
    storage: deal.storage ?? null,
    ram: deal.ram ?? null,
    color: deal.color ?? null,
    location: deal.location ?? null,
    status: deal.status ?? "draft",
    created_at: deal.createdAt ?? new Date().toISOString(),
    owner_id: deal.ownerId ?? null,
    seller_name: deal.sellerName ?? null,
    contact_phone: deal.contactPhone ?? null,
    contact_whatsapp: deal.contactWhatsapp ?? null,
    contact_email: deal.contactEmail ?? null,
    published_at: deal.publishedAt ?? (deal.status === "published" ? new Date().toISOString() : null),
  };
  const { data, error } = await realClient.from("annonces").insert(row).select().single();
  if (error) throw error;
  return mapAnnonceRow(data);
}

export async function updateDeal(id: string, updates: any) {
  if (!realClient) return null;
  const map: Record<string, string> = {
    ownerId: "owner_id", sellerName: "seller_name", contactPhone: "contact_phone",
    contactWhatsapp: "contact_whatsapp", contactEmail: "contact_email",
    createdAt: "created_at", publishedAt: "published_at",
  };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    row[map[k] || k] = v;
  }
  if (updates.status === "published" && row.published_at == null) row.published_at = new Date().toISOString();
  const { data, error } = await realClient.from("annonces").update(row).eq("id", id).select().single();
  if (error) throw error;
  return data ? mapAnnonceRow(data) : null;
}

export async function deleteDealById(id: string) {
  if (!realClient) return { success: true };
  const { error } = await realClient.from("annonces").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function fetchDealboxes() {
  if (!realClient) return [];
  const { data, error } = await realClient.from("produits_certifies").select("*").eq("status", "available").order("created_at", { ascending: false });
  return data || [];
}

export async function insertDealbox(dealbox: any) {
  if (!realClient) throw new Error("Supabase non configuré");
  const { data, error } = await realClient.from("produits_certifies").insert(dealbox).select().single();
  if (error) throw error;
  return data;
}

export async function fetchCatalogItems() {
  if (!realClient) {
    try {
      const rows = await getProduits();
      return (rows || []).slice(0, 200).map((d: any) => ({
        marque: d.marques ?? d.marque ?? d.Marques ?? d.brand,
        modele: d.modele_exact ?? d["Modèle Exact"] ?? d.model,
        stockage: d.stockages_gb ?? d.stockage_gb ?? d["Stockages (GB)"] ?? d.storage,
        prix: d.prix_neuf_en_fcfa ?? d.prix_neuf_fcfa ?? d["Prix neuf en FCFA"] ?? d.price
      }));
    } catch { return []; }
  }
  const { data, error } = await realClient.from(PRICES_TABLE).select("marque, modele_exact, stockage_gb, prix_neuf_fcfa").limit(200);
  if (error) return [];
  return data.map((d: any) => ({ marque: d.marque, modele: d.modele_exact, stockage: d.stockage_gb, prix: d.prix_neuf_fcfa }));
}
