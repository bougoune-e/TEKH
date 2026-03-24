/**
 * Web Push – TEKH+
 * Enregistrement via RPC Supabase (upsert_push_subscription) pour éviter les blocages RLS.
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

/** Abonnement push + enregistrement base (RPC prioritaire). */
export async function subscribeToPush(_userId: string | null): Promise<string | null> {
  if (!isPushSupported()) return "Les notifications push ne sont pas supportées sur ce navigateur.";
  if (!VAPID_PUBLIC) return "Configuration push manquante (VAPID : VITE_VAPID_PUBLIC_KEY).";

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm === "denied" ? "Notifications refusées." : "Permission non accordée.";

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC.startsWith("B") ? VAPID_PUBLIC : urlBase64ToUint8Array(VAPID_PUBLIC),
  });

  const subscriptionJson = sub.toJSON() as Record<string, unknown>;
  const payloadRpc = {
    p_endpoint: sub.endpoint,
    p_subscription: subscriptionJson,
    p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };

  const { error: rpcErr } = await supabase.rpc("upsert_push_subscription", payloadRpc);
  if (!rpcErr) return null;

  /* Repli historique si la migration RPC n’est pas encore appliquée sur Supabase */
  const payloadTable = {
    endpoint: sub.endpoint,
    subscription: subscriptionJson,
    user_id: _userId || null,
    user_agent: payloadRpc.p_user_agent,
  };
  const { error: upErr } = await supabase.from("push_subscriptions").upsert(payloadTable, {
    onConflict: "endpoint",
  });
  if (upErr) return upErr.message || rpcErr.message || "Échec de l’enregistrement.";
  return null;
}

export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return null;

  const { error: rpcErr } = await supabase.rpc("delete_push_subscription", {
    p_endpoint: sub.endpoint,
  });
  if (!rpcErr) {
    await sub.unsubscribe();
    return null;
  }

  const { error: delErr } = await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  if (delErr) return delErr.message;
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
