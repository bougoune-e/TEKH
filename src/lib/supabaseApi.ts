import { getToken, setSession, clearSession } from "./auth";
import { supabase as realClient } from "./supabaseClient";
import { getProduits } from "@/services/api";

type Credentials = { email: string; password: string };

type Session = { access_token: string } | null;
const PRICES_TABLE: string = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_PRICES_TABLE) || "prix_telephones";
const FALLBACK_TABLE = "produits";

let pendingPhone: string | null = null;
let localUser: any = null;
const localListeners: Array<(ev: string, session: any) => void> = [];
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

export async function fetchBrands(): Promise<string[]> {
  try {
    const rows = await getProduits();
    if (rows && rows.length > 0) {
      const set = Array.from(new Set((rows || []).map((r: any) => r.marque ?? r["Marques"] ?? r.brand).filter(Boolean)));
      return set.sort((a, b) => String(a).localeCompare(String(b)));
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchBrands failed, using defaults", err);
  }
  return ["Apple", "Samsung", "Xiaomi", "Huawei", "Tecno", "Infinix", "Google", "OnePlus", "Oppo", "Vivo"];
}

export async function fetchModels(brand: string): Promise<string[]> {
  try {
    const rows = await getProduits();
    if (rows && rows.length > 0) {
      const list = (rows || [])
        .filter((r: any) => (r.marque ?? r["Marques"] ?? r.brand ?? "") === brand)
        .map((r: any) => r.modele_exact ?? r["Modèle Exact"] ?? r.model) as string[];
      const set = Array.from(new Set(list.filter(Boolean)));
      return set.sort((a, b) => String(a).localeCompare(String(b)));
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchModels failed", err);
  }
  return [];
}

export async function fetchStorages(brand: string, model: string): Promise<number[]> {
  try {
    const rows = await getProduits();
    if (rows && rows.length > 0) {
      const set = Array.from(new Set(
        (rows || [])
          .filter((r: any) => (r.marque ?? r["Marques"] ?? r.brand ?? "") === brand && (r.modele_exact ?? r["Modèle Exact"] ?? r.model ?? "") === model)
          .map((r: any) => Number(r.stockage_gb ?? r["Stockages (GB)"] ?? r.storage))
          .filter((n) => Number.isFinite(n))
      ));
      return set.sort((a, b) => a - b);
    }
  } catch (err) {
    console.warn("[supabaseApi] fetchStorages failed", err);
  }
  return [64, 128, 256, 512];
}

export async function getBasePriceCFA(brand: string, model: string, storage: number): Promise<number | null> {
  try {
    const rows = await getProduits();
    if (rows && rows.length > 0) {
      const row = (rows || []).find((r: any) =>
        (r.marque ?? r["Marques"] ?? r.brand ?? "") === brand &&
        (r.modele_exact ?? r["Modèle Exact"] ?? r.model ?? "") === model &&
        Number(r.stockage_gb ?? r["Stockages (GB)"] ?? r.storage) === Number(storage)
      );
      if (row) {
        const p = Number(row.prix_neuf_fcfa ?? row["Prix neuf en FCFA"] ?? row["Prix neuf en FCFA (prix de référence)"] ?? row.price);
        if (Number.isFinite(p)) return p;
      }
    }
  } catch (err) {
    console.warn("[supabaseApi] getBasePriceCFA failed", err);
  }
  return null;
}

export async function fetchRams(brand: string, model: string): Promise<number[]> {
  try {
    const rows = await getProduits();
    if (rows && rows.length > 0) {
      const set = Array.from(new Set(
        (rows || [])
          .filter((r: any) => (r.marque ?? r["Marques"] ?? r.brand ?? "") === brand && (r.modele_exact ?? r["Modèle Exact"] ?? r.model ?? "") === model)
          .map((r: any) => Number(r.ram ?? r.ram_gb ?? r['"RAM (GB)"'] ?? r["RAM (GB)"]))
          .filter((n) => Number.isFinite(n))
      ));
      return set.sort((a, b) => a - b);
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
  const channel = realClient.channel("realtime:deals").on("postgres_changes", { event: "INSERT", schema: "public", table: "deals" } as any, (payload) => cb(payload)).subscribe();
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
  const { data, error } = await realClient.from("deals").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({ ...row, createdAt: row.created_at, ownerId: row.owner_id, sellerName: row.seller_name, contactPhone: row.contact_phone, contactWhatsapp: row.contact_whatsapp, contactEmail: row.contact_email }));
}

export async function insertDeal(deal: any) {
  if (!realClient) return deal;
  const row = { ...deal, created_at: deal.createdAt ?? new Date().toISOString(), owner_id: deal.ownerId, seller_name: deal.sellerName, contact_phone: deal.contactPhone, contact_whatsapp: deal.contactWhatsapp, contact_email: deal.contactEmail };
  const { data, error } = await realClient.from("deals").insert(row).select().single();
  if (error) throw error;
  return { ...data, createdAt: data.created_at, ownerId: data.owner_id };
}

export async function deleteDealById(id: string) {
  if (!realClient) return { success: true };
  const { error } = await realClient.from("deals").delete().eq("id", id);
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
