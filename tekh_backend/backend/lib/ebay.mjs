/**
 * eBay OAuth (client credentials) + Browse API — médiane de prix (annonces USED).
 * Variables : EBAY_CLIENT_ID, EBAY_CLIENT_SECRET (jamais commitées).
 *
 * Note : l’API Browse renvoie des annonces en cours ; pour une médiane « sold »
 * il faudrait Marketing/Analytics ou données internes — ce module suit la charte
 * projet (médiane sur résultats USED, marché EBAY_FR, EUR).
 */

const OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const BROWSE_SEARCH = "https://api.ebay.com/buy/browse/v1/item_summary/search";

const DEFAULT_MARKETPLACE = "EBAY_FR";

/** Contexte acheteur (doc eBay — améliore parfois les résultats selon le marché). */
function endUserCtxForMarketplace(marketplaceId) {
  switch (marketplaceId) {
    case "EBAY_DE":
      return "contextualLocation=country=DE,zip=10115";
    case "EBAY_GB":
      return "contextualLocation=country=GB,zip=SW1A1AA";
    case "EBAY_IT":
      return "contextualLocation=country=IT,zip=00118";
    case "EBAY_ES":
      return "contextualLocation=country=ES,zip=28001";
    default:
      return "contextualLocation=country=FR,zip=75001";
  }
}
/** Taux indicatif EUR → FCFA (charte projet) */
export const EUR_TO_FCFA = 655.957;
/** 1 = PRT = médiane eBay (EUR) × EUR→FCFA, sans décote supplémentaire. */
export const DEFAULT_FACTEUR_AFRIQUE = 1;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Variable manquante : ${name}`);
  return v;
}

/**
 * Access token OAuth2 (client_credentials), mis en cache jusqu’à expiration.
 */
export async function getEbayAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = requireEnv("EBAY_CLIENT_ID");
  const clientSecret = requireEnv("EBAY_CLIENT_SECRET");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`eBay OAuth ${res.status}: ${data.error_description || data.error || res.statusText}`);
  }

  cachedToken = data.access_token;
  const sec = Number(data.expires_in) || 7200;
  cachedTokenExpiresAt = now + sec * 1000;
  return cachedToken;
}

/**
 * Médiane sur une liste de nombres triés.
 */
export function median(sortedNumbers) {
  const n = sortedNumbers.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sortedNumbers[mid];
  return (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
}

/**
 * Recherche d’annonces USED, extrait les prix EUR, retourne la médiane.
 * Doc filtres : https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
 * — utiliser `conditions:{USED}` (pas seulement conditionIds 3000, souvent trop strict / IDs différents par catégorie).
 *
 * @param {string} searchQuery — ex. "Samsung Galaxy A54 128GB"
 * @param {{ limit?: number, marketplaceId?: string, filter?: string | null }} opts
 */
export async function fetchMedianUsedPriceEur(searchQuery, opts = {}) {
  const limit = Math.min(opts.limit ?? 20, 50);
  const q = searchQuery.trim();

  const fallbackMarketplaces = (process.env.EBAY_FALLBACK_MARKETPLACES || "EBAY_DE,EBAY_GB")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const primaryMp = opts.marketplaceId || process.env.EBAY_MARKETPLACE_ID || DEFAULT_MARKETPLACE;
  /** Ordre : marché principal, puis replis (souvent plus d’annonces téléphones sur DE/GB que FR). */
  const marketplaces = [primaryMp, ...fallbackMarketplaces.filter((m) => m !== primaryMp)];

  /**
   * Filtre « USED » large (doc eBay). Sinon second essai : anciens IDs courants.
   */
  const filterStrategies = [
    opts.filter ?? "conditions:{USED}",
    "conditionIds:{3000|4000|5000}",
  ];

  const token = await getEbayAccessToken();
  const qEnc = encodeURIComponent(q);

  let lastMeta = { totalFromApi: null, marketplaceId: null, filterUsed: null };

  for (const marketplaceId of marketplaces) {
    for (const filterRaw of filterStrategies) {
      if (filterRaw == null) continue;
      const filter = encodeURIComponent(filterRaw);
      const url = `${BROWSE_SEARCH}?q=${qEnc}&filter=${filter}&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
          "Content-Type": "application/json",
          "X-EBAY-C-ENDUSERCTX": endUserCtxForMarketplace(marketplaceId),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.errorMessage || JSON.stringify(data);
        throw new Error(`eBay Browse ${res.status} (${marketplaceId}): ${msg}`);
      }

      const items = data.itemSummaries || [];
      const totalFromApi = data.total != null ? Number(data.total) : null;

      if (process.env.EBAY_DEBUG === "1") {
        console.debug("[ebay]", { marketplaceId, filter: filterRaw, totalFromApi, pageCount: items.length });
      }

      const prices = items
        .map((item) => parseFloat(item?.price?.value))
        .filter((p) => Number.isFinite(p) && p > 0)
        .sort((a, b) => a - b);

      lastMeta = { totalFromApi, marketplaceId, filterUsed: filterRaw };

      if (prices.length > 0) {
        const med = median(prices);
        return {
          medianEur: med,
          sampleSize: prices.length,
          rawTotal: items.length,
          totalFromApi,
          marketplaceUsed: marketplaceId,
          filterUsed: filterRaw,
        };
      }
    }
  }

  return {
    medianEur: null,
    sampleSize: 0,
    rawTotal: 0,
    totalFromApi: lastMeta.totalFromApi,
    marketplaceUsed: lastMeta.marketplaceId,
    filterUsed: lastMeta.filterUsed,
  };
}

/**
 * PRT FCFA = médiane_eBay_EUR × facteur_afrique × EUR_TO_FCFA
 */
export function computePrtFcfa(medianEur, facteurAfrique = DEFAULT_FACTEUR_AFRIQUE) {
  if (medianEur == null || !Number.isFinite(medianEur) || medianEur <= 0) return null;
  const f = Number(facteurAfrique) || DEFAULT_FACTEUR_AFRIQUE;
  return Math.round(medianEur * f * EUR_TO_FCFA);
}

/**
 * Requête complète : médiane eBay + PRT FCFA.
 */
export async function fetchPrtForModel(searchQuery, facteurAfrique = DEFAULT_FACTEUR_AFRIQUE) {
  const med = await fetchMedianUsedPriceEur(searchQuery);
  const { medianEur, sampleSize, rawTotal } = med;
  const prtFcfa = computePrtFcfa(medianEur, facteurAfrique);
  return {
    searchQuery,
    medianEur,
    prtFcfa,
    sampleSize,
    rawTotal,
    totalFromApi: med.totalFromApi ?? null,
    marketplaceUsed: med.marketplaceUsed ?? null,
    filterUsed: med.filterUsed ?? null,
    facteurAfrique: Number(facteurAfrique) || DEFAULT_FACTEUR_AFRIQUE,
  };
}
