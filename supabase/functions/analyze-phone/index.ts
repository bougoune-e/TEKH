// Supabase Edge Function — analyse d'image de smartphone via Claude (V2 - Strict)
// Déploiement : supabase functions deploy analyze-phone

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { imageBase64, mediaType, photoType, expectedBrand } = await req.json() as {
      imageBase64: string;
      mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      photoType: "front" | "back" | "side";
      expectedBrand: string;
    };

    if (!imageBase64 || !mediaType) {
      return new Response(
        JSON.stringify({ error: "imageBase64 et mediaType sont requis" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "" });

    const PROMPT = `Tu es expert en reconditionnement de smartphones pour TEKH+.
Analyse cette photo de type "${photoType}" pour un smartphone censé être de marque "${expectedBrand}".

Instructions critiques :
1. Vérifie si l'image est FLOU, trop sombre ou ILLISIBLE.
2. Vérifie si le téléphone dans l'image est bien de marque "${expectedBrand}".
3. Analyse l'état physique selon le type "${photoType}" :
   - Si front : vérifie l'écran (parfait, raye, casse).
   - Si back/side : vérifie le châssis (intact, abime).

Retourne UNIQUEMENT un objet JSON valide :
{
  "isClear": boolean (false si flou/illisible),
  "isMatch": boolean (false si la marque visible ne semble pas être "${expectedBrand}"),
  "ecran": "parfait" | "raye" | "casse",
  "chassis": "intact" | "abime",
  "confiance": 0-100,
  "verdict": "phrase très courte stipulant l'état détecté (ex: Écran fissuré détecté)",
  "erreur": "explication si isClear ou isMatch est false"
}

Définitions :
- ecran "casse" = fissure, éclat ou fragment visible.
- ecran "raye" = rayures visibles mais écran entier.
- chassis "abime" = chocs, grosses bosses ou rayures profondes.
- isMatch = compare le design/logo visible avec "${expectedBrand}". Si tu as un doute raisonnable, mets true mais baisse la confiance.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: PROMPT },
        ],
      }],
    });

    const raw = (response.content[0] as { text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-phone error:", err);
    return new Response(JSON.stringify({
      isClear: true, isMatch: true, ecran: "raye", chassis: "intact",
      confiance: 0, verdict: "Erreur technique d'analyse", erreur: err.message
    }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
