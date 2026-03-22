/**
 * Liens WhatsApp (échange, contact pro) — numéro au format international sans + (ex. 22890123456).
 * Définir VITE_WHATSAPP_BUSINESS dans .env (frontend).
 */
export function getWhatsAppBusinessDigits(): string {
  const raw = (import.meta.env.VITE_WHATSAPP_BUSINESS as string | undefined)?.trim() || "";
  return raw.replace(/\D/g, "");
}

export function buildWhatsAppUrl(message: string, phoneDigits?: string): string | null {
  const digits = phoneDigits?.replace(/\D/g, "") || getWhatsAppBusinessDigits();
  if (!digits) return null;
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}
