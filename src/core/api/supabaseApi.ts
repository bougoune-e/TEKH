import { getToken, setSession, clearSession } from "./auth";
import { supabase as realClient } from "./supabaseClient";
import { getProduits } from "@/core/api/main_api";
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
  "Apple": ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone XR", "iPhone SE (2022)"],
  "Samsung": ["Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy S22 Ultra", "Galaxy S22", "Galaxy Z Fold6", "Galaxy Z Flip6", "Galaxy A55", "Galaxy A54", "Galaxy A35", "Galaxy A34", "Galaxy A25", "Galaxy A15", "Galaxy A14"],
  "Tecno": ["Pova Slim", "Pova 6 Pro 5G", "Pova 6 Neo", "Pova 5 Pro", "Pova 5", "Camon 30 Premier", "Camon 30 Pro", "Camon 30", "Camon 20 Premier", "Phantom V Fold2", "Phantom V Flip2", "Phantom X2 Pro", "Spark 30 Pro", "Spark 30", "Spark 20 Pro+", "Spark 20 Pro", "Spark Go 2025"],
  "Infinix": ["Zero 40 5G", "Zero 30 5G", "Note 40 Pro", "Note 40", "Note 30 VIP", "Hot 50 Pro+", "Hot 50 Pro", "Hot 40 Pro", "Hot 40i", "GT 20 Pro", "GT 10 Pro", "Smart 9"],
  "Itel": ["P55 5G", "P55+", "P55", "S24", "S23+", "A70", "A60s"],
  "Redmi": ["Note 14 Pro+ 5G", "Note 14 Pro", "Note 14", "Note 13 Pro+ 5G", "Note 13 Pro", "Note 13", "Note 12 Pro", "14C", "13C", "A3", "A2+"],
  "Poco": ["X7 Pro", "X7", "X6 Pro", "X6", "F6 Pro", "F6", "F5", "M6 Pro", "M6", "C65"],
  "Realme": ["GT 7 Pro", "GT 6", "GT Neo 6 SE", "13 Pro+", "13 Pro", "12 Pro+", "12 Pro", "C67", "C55", "Narzo 70 Pro"],
  "Oppo": ["Find X8 Pro", "Find X7 Ultra", "Reno 12 Pro", "Reno 12", "Reno 11 Pro", "Reno 11", "A3 Pro", "A2", "A98"],
  "OnePlus": ["13", "12", "12R", "Nord 4", "Nord CE4", "Nord CE 3 Lite", "Open"],
  "Google": ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 8a", "Pixel 7 Pro", "Pixel 7", "Pixel 7a", "Pixel 6a"],
  "Honor": ["Magic7 Pro", "Magic6 Pro", "Magic V3", "200 Pro", "200", "90", "X9b", "X8b"],
  "Huawei": ["Pura 70 Ultra", "Pura 70 Pro", "Mate 60 Pro", "P60 Pro", "Mate 50 Pro", "Nova 12", "Nova 11"],
  "Nothing": ["Phone (2a) Plus", "Phone (2a)", "Phone (2)", "Phone (1)"],
  "Motorola": ["Edge 50 Ultra", "Edge 50 Pro", "Edge 50 Fusion", "Razr 50 Ultra", "Razr 50", "Moto G85", "Moto G54", "Moto G34", "ThinkPhone"],
  "Sony": ["Xperia 1 VII", "Xperia 1 VI", "Xperia 10 VII", "Xperia 5 VI", "Xperia Pro 2"],
  "Vivo": ["X300 Ultra", "X200 Pro", "X200", "V70 FE", "V60", "V40", "Y300 Pro", "T5x", "X Fold 5", "iQOO Neo 10"],
};

export async function fetchBrands(): Promise<string[]> {
  try {
    if (realClient) {
      const { data, error } = await realClient.from("brands").select("name").order("name");
      if (!error && data && data.length > 0) {
        return data.map(b => b.name).filter(isAllowedBrand);
      }
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const brands = Array.from(new Set(products.map(getBrandName).filter(Boolean).filter(isAllowedBrand)));
      if (brands.length > 0) return (brands as string[]).sort();
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchBrands failed, using STATIC_MODELS", err);
  }
  if (import.meta.env.DEV) console.debug("[supabaseApi] fetchBrands fallback:", Object.keys(STATIC_MODELS).length, "brands");
  return Object.keys(STATIC_MODELS);
}

export async function fetchModels(brand: string): Promise<string[]> {
  try {
    if (realClient) {
      const { data, error } = await realClient
        .from("models")
        .select("name, brands!inner(name)")
        .eq("brands.name", brand)
        .order("name");

      if (!error && data && data.length > 0) {
        const fromDb = data.map((m: any) => m.name);
        const fromSm = await fetchDistinctModelsFromSmartphones(brand);
        return Array.from(new Set([...fromDb, ...fromSm])).sort((a, b) => a.localeCompare(b, "fr"));
      }
    }

    const fromSm = await fetchDistinctModelsFromSmartphones(brand);
    if (fromSm.length > 0) {
      const products = await getApiProduits();
      if (products && products.length > 0) {
        const targetBrand = normalizeLower(brand);
        const fromApi = Array.from(new Set(products
          .filter(p => normalizeLower(getBrandName(p)) === targetBrand)
          .map(getModelName)
          .filter(Boolean))) as string[];
        return Array.from(new Set([...fromSm, ...fromApi])).sort((a, b) => a.localeCompare(b, "fr"));
      }
      return fromSm;
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const targetBrand = normalizeLower(brand);
      const models = Array.from(new Set(products
        .filter(p => normalizeLower(getBrandName(p)) === targetBrand)
        .map(getModelName)
        .filter(Boolean)));
      if (models.length > 0) return (models as string[]).sort();
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchModels failed for brand:", brand, err);
  }
  const fallback = STATIC_MODELS[brand] || [];
  if (import.meta.env.DEV && fallback.length) console.debug("[supabaseApi] fetchModels fallback for", brand, ":", fallback.length);
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
      const m = v.match(/(\d+)\s*(GB|Go)/i);
      if (m) storageGb = parseInt(m[1], 10);
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
  const { count, error } = await realClient.from("deals").select("id", { count: 'exact', head: true }).eq("owner_id", ownerId);
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
export type TekhPointsSummary = {
  balanceFcfa: number;
  nextExpiry: string | null;
  activeLines: number;
};

export async function fetchTekhPointsSummary(userId: string): Promise<TekhPointsSummary> {
  if (!realClient) return { balanceFcfa: 0, nextExpiry: null, activeLines: 0 };
  const now = new Date().toISOString();
  const { data, error } = await realClient
    .from("tekh_point_credits")
    .select("amount_fcfa, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", now);

  if (error || !data?.length) {
    if (import.meta.env.DEV && error) console.warn("[tekh_points]", error.message);
    return { balanceFcfa: 0, nextExpiry: null, activeLines: 0 };
  }

  const balanceFcfa = data.reduce((s, r) => s + (Number(r.amount_fcfa) || 0), 0);
  const sorted = [...data].sort(
    (a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
  );
  return {
    balanceFcfa,
    nextExpiry: sorted[0]?.expires_at ?? null,
    activeLines: data.length,
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
const DEAL_EXPIRATION_HOURS = 72;

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
