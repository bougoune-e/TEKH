/**
 * API produits — même source pour web et PWA.
 * En prod, définir VITE_API_URL (ex. backend Railway) pour que PWA et web
 * consomment les mêmes données. Les requêtes utilisent cache: 'no-store'
 * pour ne pas être servies par un éventuel Service Worker.
 */
function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env && typeof env === "string" && env.trim()) {
    let base = env.trim().replace(/\/$/, "");
    // Sans protocole, le navigateur traite l'URL en relative → 404 sur tekh-1.onrender.com/tekh-backend...
    if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
    return base;
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
}

const API_URL = getApiBaseUrl();

export type Produit = Record<string, any>;

/** cache: 'no-store' pour ne jamais servir les API depuis le cache (ex. SW). */
const fetchOpts: RequestInit = { cache: "no-store" };

export async function getProduits(): Promise<Produit[]> {
  const url = `${API_URL}/api/products`;
  try {
    const res = await fetch(url, fetchOpts);
    if (!res.ok) {
      if (import.meta.env.DEV) console.warn("[main_api] getProduits failed", res.status, url);
      throw new Error(`Erreur API /api/products: ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[main_api] getProduits fetch error", url, e);
    throw e;
  }
}

export async function getProduit(id: string | number): Promise<Produit> {
  const res = await fetch(`${API_URL}/produits/${id}`, fetchOpts);
  if (!res.ok) throw new Error(`Produit introuvable`);
  return res.json();
}

export async function updateStock(id: string | number, stock: number) {
  const res = await fetch(`${API_URL}/produits/${id}/stock`, {
    ...fetchOpts,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });
  if (!res.ok) throw new Error(`Erreur mise à jour stock`);
  return res.json();
}
