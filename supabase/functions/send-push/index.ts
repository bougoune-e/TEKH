// Supabase Edge Function — send-push
// Envoie une notification push à tous les abonnés. Réservé aux admins.
// Déploiement : supabase functions deploy send-push

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import webpush from "npm:web-push";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "tekhswap@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase());

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:tekhswap@gmail.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  // 1. Vérifier le JWT admin
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "").trim();
  if (!jwt) return respond({ error: "Non autorisé" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || "",
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return respond({ error: "Token invalide" }, 401);

  const email = (user.email || "").toLowerCase();
  const appRole = (user.app_metadata?.role || user.user_metadata?.role || "").toLowerCase();
  const isAdmin = appRole === "admin" || ADMIN_EMAILS.includes(email);
  if (!isAdmin) return respond({ error: "Accès refusé" }, 403);

  // 2. Parser le body
  let body: { title: string; body: string; url?: string; tag?: string; dealId?: string | null };
  try {
    body = await req.json();
  } catch {
    return respond({ error: "JSON invalide" }, 400);
  }

  if (!body.title?.trim() || !body.body?.trim()) {
    return respond({ error: "title et body sont requis" }, 400);
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return respond({ error: "VAPID keys manquantes côté serveur" }, 500);
  }

  // 3. Charger toutes les souscriptions (service role)
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  const { data: subs, error: subsErr } = await admin
    .from("push_subscriptions")
    .select("endpoint, subscription");

  if (subsErr) return respond({ error: subsErr.message }, 500);

  const payload = JSON.stringify({
    title: body.title.trim(),
    body: body.body.trim(),
    url: body.url || "/deals",
    tag: body.tag || "tekh-push",
    dealId: body.dealId || null,
  });

  // 4. Envoyer en parallèle par batch de 50
  let sent = 0;
  let failed = 0;
  const invalid: string[] = [];
  const list = subs || [];

  const CHUNK = 50;
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent++;
        } catch (e: any) {
          failed++;
          if (e.statusCode === 410 || e.statusCode === 404) {
            invalid.push(sub.endpoint);
          }
        }
      })
    );
  }

  // 5. Supprimer les abonnements expirés
  if (invalid.length > 0) {
    await admin.from("push_subscriptions").delete().in("endpoint", invalid);
  }

  // 6. Enregistrer la campagne
  await admin.from("notification_campaigns").insert({
    title: body.title.trim(),
    body: body.body.trim(),
    url: body.url || "/deals",
    tag: body.tag || "tekh-push",
    sent_count: sent,
    failed_count: failed,
    total_subs: list.length,
    sent_by: user.email,
  });

  return respond({ sent, failed, total: list.length });
});
