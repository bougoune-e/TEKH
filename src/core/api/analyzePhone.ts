/**
 * Frontend module — appelle la Supabase Edge Function "analyze-phone"
 * qui utilise Claude Haiku pour analyser l'état d'un smartphone depuis une photo.
 *
 * La clé API Anthropic reste côté serveur (secret Supabase), jamais dans le bundle.
 */

import { supabase } from "@/core/api/supabaseClient";
import type { EcranTekh, ChassisTekh } from "@/core/api/pricing";

export interface PhoneAnalysisResult {
  isClear: boolean;
  isMatch: boolean;
  ecran: EcranTekh;
  chassis: ChassisTekh;
  confiance: number; // 0–100
  verdict: string;
  erreur?: string;
}

/** Convert a browser File to a base64 string (no data-URL prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]); // strip "data:image/jpeg;base64,"
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file: File): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const t = file.type.toLowerCase();
  if (t === "image/png") return "image/png";
  if (t === "image/gif") return "image/gif";
  if (t === "image/webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Analyse a phone image using Claude (via Supabase Edge Function).
 * Returns detected screen/chassis condition and confidence score.
 */
export async function analyzePhoneImage(
  file: File,
  photoType: "front" | "back" | "side",
  expectedBrand: string
): Promise<PhoneAnalysisResult> {
  if (!supabase) throw new Error("Supabase non configuré");

  const [imageBase64, mediaType] = await Promise.all([
    fileToBase64(file),
    Promise.resolve(getMediaType(file)),
  ]);

  const { data, error } = await supabase.functions.invoke("analyze-phone", {
    body: { imageBase64, mediaType, photoType, expectedBrand },
  });

  if (error) throw error;
  return data as PhoneAnalysisResult;
}
