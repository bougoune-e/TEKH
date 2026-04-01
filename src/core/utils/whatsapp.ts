/**
 * Liens WhatsApp Business — numéro au format international sans + (ex. 22890123456).
 * Variable Vite : VITE_WHATSAPP_BUSINESS (injectée au **build** ; définir aussi sur Render / CI).
 */
export function normalizeWhatsAppDigits(input: string | undefined | null): string {
  if (!input) return "";
  let s = String(input).trim();
  if (s.startsWith("+")) s = s.slice(1);
  return s.replace(/\D/g, "");
}

export function getWhatsAppBusinessDigits(): string {
  const raw = (import.meta.env.VITE_WHATSAPP_BUSINESS as string | undefined)?.trim() || "";
  const d = normalizeWhatsAppDigits(raw);
  if (import.meta.env.DEV && !d) {
    console.warn("[TEKH] VITE_WHATSAPP_BUSINESS manquant ou invalide — liens WhatsApp désactivés.");
  }
  return d;
}

/**
 * Liens possibles : wa.me (universel) et api.whatsapp.com (certains navigateurs / in-app).
 */
export function buildWhatsAppUrl(message: string, phoneDigits?: string): string | null {
  const digits = phoneDigits ? normalizeWhatsAppDigits(phoneDigits) : getWhatsAppBusinessDigits();
  if (!digits || digits.length < 8) return null;
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function buildWhatsAppUrlAlt(message: string, phoneDigits?: string): string | null {
  const digits = phoneDigits ? normalizeWhatsAppDigits(phoneDigits) : getWhatsAppBusinessDigits();
  if (!digits || digits.length < 8) return null;
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${digits}&text=${text}`;
}

/**
 * Ouvre WhatsApp via navigation directe (window.location.href).
 * Évite le popup blocker des PWA/in-app browsers et le dialog
 * "choisir une application" sur Android (l'intent est déclenché
 * par la navigation courante, pas par une popup).
 */
export function openWhatsApp(message: string, phoneDigits?: string): boolean {
  const u = buildWhatsAppUrl(message, phoneDigits);
  if (!u) return false;
  window.location.href = u;
  return true;
}
