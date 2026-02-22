import { getToken, setSession, clearSession } from "./auth";
import { supabase as realClient } from "./supabaseClient";
import { getProduits } from "@/core/api/main_api";

type Credentials = { email: string; password: string };

type Session = { access_token: string } | null;
const PRICES_TABLE: string = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_PRICES_TABLE) || "prix_telephones";
const FALLBACK_TABLE = "produits";

let pendingPhone: string | null = null;
let localUser: any = null;
const localListeners: Array<(ev: string, session: any) => void> = [];
// Cache for products from Railway API
let cachedProduits: any[] | null = null;
async function getApiProduits() {
  if (cachedProduits) return cachedProduits;
  try {
    cachedProduits = await getProduits();
    return cachedProduits;
  } catch (e) {
    console.warn("[supabaseApi] getApiProduits failed", e);
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

// Metadata functions - LOCAL ONLY to avoid 404s
export async function fetchAllStorages(): Promise<number[]> {
  const DEFAULTS = [32, 64, 128, 256, 512, 1024];
  try {
    const rows = await getProduits();
    const set = Array.from(new Set((rows || [])
      .map((r: any) => Number(r.stockage_gb ?? r["Stockages (GB)"] ?? r.storage))
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
  "Apple": ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone XR"],
  "Samsung": ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy S22 Ultra", "Galaxy S22", "Galaxy A54", "Galaxy A34", "Galaxy A14", "Galaxy Note 20 Ultra"],
  "Xiaomi": ["Redmi Note 13 Pro+", "Redmi Note 13", "Xiaomi 14", "Xiaomi 13T Pro", "Poco F5", "Poco X6 Pro"],
  "Tecno": ["Camon 30 Premier", "Camon 30 Pro", "Camon 20 Premier", "Phantom V Flip", "Phantom X2 Pro", "Spark 20 Pro+"],
  "Infinix": ["Zero 30 5G", "Note 40 Pro", "Note 30 VIP", "Hot 40 Pro", "GT 10 Pro"],
  "Google": ["Pixel 8 Pro", "Pixel 8", "Pixel 7 Pro", "Pixel 7", "Pixel 6a"],
  "Huawei": ["P60 Pro", "Mate 50 Pro", "Nova 11", "P40 Pro"]
};

export async function fetchBrands(): Promise<string[]> {
  try {
    if (realClient) {
      const { data, error } = await realClient.from("brands").select("name").order("name");
      if (!error && data && data.length > 0) return data.map(b => b.name);
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const brands = Array.from(new Set(products.map(p => p.marques ?? p.brand ?? p.Marque).filter(Boolean)));
      if (brands.length > 0) return (brands as string[]).sort();
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchBrands failed, using defaults", err);
  }
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

      if (!error && data && data.length > 0) return data.map((m: any) => m.name);
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const models = Array.from(new Set(products
        .filter(p => (p.marques ?? p.brand ?? p.Marque) === brand)
        .map(p => p.modele_exact ?? p.model ?? p["Modèle Exact"])
        .filter(Boolean)));
      if (models.length > 0) return (models as string[]).sort();
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchModels failed", err);
  }
  return STATIC_MODELS[brand] || [];
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
  } catch (err) {
    console.warn("[supabaseApi] fetchStorages failed", err);
  }
  return [64, 128, 256, 512];
}

export interface ModelInfo {
  base_price_fcfa: number | null;
  release_year: number | null;
  equivalence_class: string | null;
}

export async function getModelInfo(brand: string, model: string, storage: number): Promise<ModelInfo | null> {
  try {
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
          equivalence_class: item.models.equivalence_class
        };
      }
    }

    // Fallback: Extract from API
    const products = await getApiProduits();
    if (products && products.length > 0) {
      const item = products.find(p =>
        (p.marques ?? p.brand ?? p.Marque) === brand &&
        (p.modele_exact ?? p.model ?? p["Modèle Exact"]) === model &&
        Number(p.stockage_gb ?? p.storage ?? p["Stockages (GB)"]) === storage
      );

      if (item) {
        return {
          base_price_fcfa: Number(item.prix_neuf_fcfa ?? item.price ?? item["Prix neuf en FCFA"] ?? 0),
          release_year: Number(item.annee ?? item.release_year ?? 2022),
          equivalence_class: item.equivalence_class ?? item.classe ?? "C"
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

export async function getAvailableVariants(brand: string, model: string): Promise<ModelVariant[]> {
  try {
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
      const filtered = products.filter(p =>
        (p.marques ?? p.brand ?? p.Marque) === brand &&
        (p.modele_exact ?? p.model ?? p["Modèle Exact"]) === model
      );

      if (filtered.length > 0) {
        return filtered.map(p => ({
          ram_gb: Number(p.ram_gb ?? p.ram ?? p["RAM (GB)"] ?? 0),
          storage_gb: Number(p.stockage_gb ?? p.storage ?? p["Stockages (GB)"] ?? 0),
          base_price_fcfa: Number(p.prix_neuf_fcfa ?? p.price ?? p["Prix neuf en FCFA"] ?? 0)
        })).sort((a, b) => a.storage_gb - b.storage_gb);
      }
    }
  } catch (err) {
    console.warn("[supabaseApi] getAvailableVariants failed", err);
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
        return Array.from(new Set(data.map(v => v.ram_gb).filter(Boolean)));
      }
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

export async function uploadImage(file: File) {
  if (!realClient) throw new Error("Supabase non configuré");
  const fileName = `${Date.now()}_${file.name}`;
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
  const fileName = `avatar_${Date.now()}_${file.name}`;
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

export async function fetchDeals() {
  if (!realClient) return [];
  const { data, error } = await realClient.from("annonces").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, createdAt: row.created_at, ownerId: row.owner_id, sellerName: row.seller_name, contactPhone: row.contact_phone, contactWhatsapp: row.contact_whatsapp, contactEmail: row.contact_email }));
}

export async function insertDeal(deal: any) {
  if (!realClient) return deal;
  const row = { ...deal, created_at: deal.createdAt ?? new Date().toISOString(), owner_id: deal.ownerId, seller_name: deal.sellerName, contact_phone: deal.contactPhone, contact_whatsapp: deal.contactWhatsapp, contact_email: deal.contactEmail };
  const { data, error } = await realClient.from("annonces").insert(row).select().single();
  if (error) throw error;
  return { ...data, createdAt: data.created_at, ownerId: data.owner_id };
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
        marque: d.marque ?? d.Marques ?? d.brand,
        modele: d.modele_exact ?? d["Modèle Exact"] ?? d.model,
        stockage: d.stockage_gb ?? d["Stockages (GB)"] ?? d.storage,
        prix: d.prix_neuf_fcfa ?? d["Prix neuf en FCFA"] ?? d.price
      }));
    } catch { return []; }
  }
  const { data, error } = await realClient.from(PRICES_TABLE).select("marque, modele_exact, stockage_gb, prix_neuf_fcfa").limit(200);
  if (error) return [];
  return data.map((d: any) => ({ marque: d.marque, modele: d.modele_exact, stockage: d.stockage_gb, prix: d.prix_neuf_fcfa }));
}
