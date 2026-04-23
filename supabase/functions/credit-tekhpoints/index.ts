// Supabase Edge Function — credit-tekhpoints
// Crédite des TekhPoints à un utilisateur. Réservé aux admins.
// Déploiement : supabase functions deploy credit-tekhpoints

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "tekhswap@gmail.com,owldesmond8@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase());

const TEKH_POINT_VALUE = 500; // 1 TekhPoint = 500 FCFA

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  // 1. Vérifier le JWT — l'appelant doit être admin
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
  if (!isAdmin) return respond({ error: "Accès refusé — admin requis" }, 403);

  // 2. Parser le body
  let body: { user_id: string; amount_fcfa: number; motif?: string };
  try {
    body = await req.json();
  } catch {
    return respond({ error: "JSON invalide" }, 400);
  }

  const { user_id, amount_fcfa, motif = "Crédit admin" } = body;

  if (!user_id) return respond({ error: "user_id requis" }, 400);
  if (!amount_fcfa || amount_fcfa <= 15000) {
    return respond({ error: "amount_fcfa doit être > 15 000 FCFA" }, 400);
  }

  // 3. Insérer avec le client service_role (bypass RLS)
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const points = Math.floor(amount_fcfa / TEKH_POINT_VALUE);

  const { error: insertErr } = await admin.from("tekh_point_credits").insert({
    user_id,
    amount_fcfa,
    expires_at: expiresAt.toISOString(),
    status: "active",
    metadata: {
      motif,
      points_computed: points,
      credited_by_admin: true,
      credited_by_email: user.email,
      credited_at: new Date().toISOString(),
    },
  });

  if (insertErr) return respond({ error: insertErr.message }, 500);

  return respond({ success: true, points, amount_fcfa, user_id });
});
