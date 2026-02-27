/**
 * Google Cloud Vision API – analyse d'images pour TEKH+
 * Source unique : dossier google-vision-api à la racine de TEKH.
 * La clé JSON peut être dans ce dossier : service-account-key.json ou le fichier téléchargé depuis GCP (ex. emerald-griffin-xxx.json).
 * Référence : https://github.com/codingmoney/google-cloud-vision-api-tutorial
 */

import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let client = null;

/** Cherche un fichier de clé GCP dans le dossier google-vision-api (service-account-key.json ou tout *.json sauf package*.json). */
function findKeyFileInDir() {
  try {
    const dir = __dirname;
    const serviceAccount = path.join(dir, "service-account-key.json");
    if (fs.existsSync(serviceAccount)) return serviceAccount;
    const names = fs.readdirSync(dir);
    for (const name of names) {
      if (!name.endsWith(".json")) continue;
      if (name === "package.json" || name === "package-lock.json") continue;
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile()) continue;
      const content = fs.readFileSync(full, "utf8");
      if (content.includes('"type"') && content.includes("service_account")) return full;
    }
  } catch (e) {
    console.warn("[Vision] findKeyFileInDir:", e.message);
  }
  return null;
}

function getClient() {
  if (client) return client;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyJson = process.env.GOOGLE_VISION_KEY_JSON;
  const options = {};
  if (keyPath) {
    options.keyFilename = keyPath;
  } else if (keyJson) {
    try {
      options.credentials = JSON.parse(keyJson);
    } catch (e) {
      console.warn("[Vision] GOOGLE_VISION_KEY_JSON invalid JSON");
      return null;
    }
  } else {
    const localKey = findKeyFileInDir();
    if (localKey) {
      options.keyFilename = localKey;
    } else {
      console.warn("[Vision] No GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_VISION_KEY_JSON, or key JSON in google-vision-api/");
      return null;
    }
  }
  client = new vision.ImageAnnotatorClient(options);
  return client;
}

/** Labels pouvant indiquer un écran endommagé ou à vérifier */
const DAMAGE_KEYWORDS = [
  "crack", "cracked", "scratch", "scratched", "broken", "shattered",
  "damage", "damaged", "defect", "cracked screen", "broken screen",
  "fissure", "fracture", "rayure", "cassé", "fêlé"
];

/** Labels indiquant un téléphone / écran (contexte valide) */
const DEVICE_LABELS = [
  "smartphone", "mobile phone", "cell phone", "phone", "electronic device",
  "screen", "display", "gadget", "mobile", "handset", "telephone"
];

/**
 * Analyse une image (buffer ou URL) et retourne labels + suggestion d'état écran.
 * @param {Buffer|string} input - Image en Buffer ou URL publique
 * @param {{ source?: 'buffer' | 'url' }} opts - source: 'buffer' (default) ou 'url'
 * @returns {{ labels: Array<{description:string, score:number}>, suggestedCondition: string, message: string } | null }
 */
export async function analyzeImageForScreen(input, opts = {}) {
  const source = opts.source || (Buffer.isBuffer(input) ? "buffer" : "url");
  const annotator = getClient();
  if (!annotator) return null;

  const request = source === "url"
    ? { image: { source: { imageUri: input } } }
    : { image: { content: input.toString("base64") } };

  try {
    const [labelResult] = await annotator.labelDetection(request);
    const labelAnnotations = labelResult?.labelAnnotations || [];
    const labels = labelAnnotations.map((a) => ({
      description: (a.description || "").toLowerCase(),
      score: a.score ?? 0,
    }));

    const allDescriptions = labels.map((l) => l.description).join(" ");
    const hasDamage = DAMAGE_KEYWORDS.some((kw) => allDescriptions.includes(kw));
    const hasDevice = DEVICE_LABELS.some((kw) => labels.some((l) => l.description.includes(kw)));

    let suggestedCondition = "Bon";
    let message = "Aucun indice de dommage détecté. Vérifiez que l'état correspond à votre déclaration.";

    if (hasDamage) {
      suggestedCondition = "À vérifier";
      message = "Des éléments pouvant indiquer un écran endommagé ont été détectés. Merci de confirmer l'état ou d'ajouter une photo plus claire.";
    } else if (!hasDevice && labels.length > 0) {
      message = "Photo analysée. Assurez-vous que l'écran du téléphone est bien visible pour une meilleure détection.";
    } else if (hasDevice) {
      message = "Téléphone/écran détecté. État suggéré : bon. Confirmez que l'état déclaré correspond à la photo.";
    }

    return {
      labels: labels.slice(0, 15).map((l) => ({ description: l.description, score: l.score })),
      suggestedCondition,
      message,
    };
  } catch (err) {
    console.error("[Vision] analyzeImageForScreen error:", err.message);
    throw err;
  }
}
