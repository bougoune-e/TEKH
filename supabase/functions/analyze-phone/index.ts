// Supabase Edge Function — analyse d'image de smartphone via Claude
// Déploiement : supabase functions deploy analyze-phone
// Secret requis : supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT = `Tu es expert en reconditionnement de smartphones pour TEKH+.
Analyse cette photo de smartphone et retourne UNIQUEMENT un objet JSON valide.
Aucun texte avant ou après le JSON. Aucune explication.

Structure exacte à retourner :
{
  "ecran": "parfait" ou "raye" ou "casse",
  "chassis": "intact" ou "abime",
  "confiance": nombre entre 0 et 100,
  "remarques": "une phrase courte en français décrivant ce que tu vois"
}

Définitions :
- ecran "parfait" = aucune rayure visible, comme neuf
- ecran "raye" = rayures visibles mais écran entier, non fissuré
- ecran "casse" = fissure, éclat ou fragment visible
- chassis "intact" = pas de choc visible sur les bords ou le dos
- chassis "abime" = chocs, bosses ou rayures profondes sur le corps
- confiance = ton niveau de certitude sur l'analyse (100 = très certain)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { imageBase64, mediaType } = await req.json() as {
      imageBase64: string;
      mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    };

    if (!imageBase64 || !mediaType) {
      return new Response(
        JSON.stringify({ error: "imageBase64 et mediaType sont requis" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "" });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: PROMPT },
        ],
      }],
    });

    const raw = (response.content[0] as { text: string }).text.trim();

    // Extract JSON even if Claude wraps it in markdown code fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsed || !["parfait", "raye", "casse"].includes(parsed.ecran) || !["intact", "abime"].includes(parsed.chassis)) {
      throw new Error("Réponse Claude invalide");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Fallback safe value
    const fallback = {
      ecran: "raye",
      chassis: "intact",
      confiance: 25,
      remarques: "Analyse incertaine — vérification manuelle recommandée",
    };
    console.error("analyze-phone error:", err);
    return new Response(JSON.stringify(fallback), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
