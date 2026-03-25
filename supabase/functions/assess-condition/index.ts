// Supabase Edge Function — assess-condition
// Analyses structured device condition + free text description via Claude Haiku.
// Returns: normalized condition, flags, confidence_score, adjustment (-10..+10).
// Deployment: supabase functions deploy assess-condition

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAFE_FALLBACK = {
  normalized: { ecran: "raye", chassis: "intact", batterie: "gte80_89" },
  flags: [],
  confidence_score: 0,
  adjustment: 0,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json() as {
      device: { brand: string; model: string; storage: number | null; ram: number | null };
      condition: {
        screen: string;
        chassis: string;
        battery: string;
        functionalities: string[];
        booleans: {
          power_on: boolean | null;
          touch_ok: boolean | null;
          charging_ok: boolean | null;
          biometric_ok: boolean | null;
        };
      };
      user_description: string;
    };

    const { device, condition, user_description } = body;
    if (!device || !condition) {
      return new Response(JSON.stringify(SAFE_FALLBACK), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "" });

    const boolStr = (v: boolean | null) => v === true ? "Oui" : v === false ? "Non" : "Non renseigné";

    const userMessage = `
Appareil : ${device.brand} ${device.model}${device.storage ? ` ${device.storage}GB` : ""}
État écran déclaré : ${condition.screen}
État châssis déclaré : ${condition.chassis}
État batterie déclaré : ${condition.battery}
Problèmes fonctionnels : ${condition.functionalities.join(", ") || "aucun"}
S'allume : ${boolStr(condition.booleans.power_on)}
Tactile fonctionne : ${boolStr(condition.booleans.touch_ok)}
Charge correctement : ${boolStr(condition.booleans.charging_ok)}
Biométrie fonctionne : ${boolStr(condition.booleans.biometric_ok)}
Description libre : "${user_description || "(aucune)"}"

Réponds UNIQUEMENT avec ce JSON valide :
{
  "normalized": {
    "ecran": "parfait" | "raye" | "casse",
    "chassis": "intact" | "abime",
    "batterie": "gte90" | "gte80_89" | "gte70_79" | "gte60_69" | "lt60"
  },
  "flags": [],
  "confidence_score": 0.0,
  "adjustment": 0
}
`.trim();

    const systemPrompt = `Tu es un moteur d'analyse d'état de smartphone pour TEKH+, plateforme africaine de reconditionnement.
Tu reçois une description structurée + texte libre et produis une analyse JSON.

RÈGLES STRICTES :
- Retourner UNIQUEMENT un JSON valide, aucun texte hors JSON
- Ne jamais inventer d'information absente
- adjustment : entier entre -10 et +10. Utiliser 0 si incertain. Ajustement négatif si problèmes cachés détectés, positif si description indique meilleur état que déclaré.
- confidence_score : 0.0 à 1.0. Faible si description vide ou peu informative.
- flags : liste de strings courts décrivant problèmes notables (ex: "probleme_tactile_avere", "batterie_degradee", "chute_signalée")`.trim();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = (response.content[0] as { text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify(SAFE_FALLBACK), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Clamp adjustment to -10..+10 just in case
    if (typeof result.adjustment === "number") {
      result.adjustment = Math.max(-10, Math.min(10, Math.round(result.adjustment)));
    } else {
      result.adjustment = 0;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("assess-condition error:", err);
    return new Response(JSON.stringify(SAFE_FALLBACK), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
