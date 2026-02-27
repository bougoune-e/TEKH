/**
 * Web Push – TEKH+ PWA
 * Demande la permission, abonne l’utilisateur au push, enregistre l’abonnement en base.
 * L’envoi des notifications se fait côté backend quand l’admin publie un deal.
 */

import { supabase } from "@/core/api/supabaseApi";

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function base64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function isPushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** Demande la permission et abonne au push ; enregistre l’abonnement en base. Retourne un message d’erreur ou null si OK. */
export async function subscribeToPush(userId: string | null): Promise<string | null> {
  if (!isPushSupported()) return "Les notifications push ne sont pas supportées sur ce navigateur.";
  if (!VAPID_PUBLIC) return "Configuration push manquante (VAPID).";

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm === "denied" ? "Notifications refusées." : "Permission non accordée.";

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC.startsWith("B") ? VAPID_PUBLIC : urlBase64ToUint8Array(VAPID_PUBLIC),
  });

  const subscriptionJson = sub.toJSON();
  const payload = {
    endpoint: sub.endpoint,
    subscription: subscriptionJson as Record<string, unknown>,
    user_id: userId || null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };

  const { error } = await supabase.from("push_subscriptions").upsert(payload, {
    onConflict: "endpoint",
  });

  if (error) return error.message || "Échec de l’enregistrement.";
  return null;
}

/** Désabonner (supprimer l’entrée en base pour l’endpoint actuel). */
export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return null;
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  if (error) return error.message;
  await sub.unsubscribe();
  return null;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
