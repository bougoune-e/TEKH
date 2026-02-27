/**
 * Script de référence – Google Cloud Vision API
 * Inspiré de : https://github.com/codingmoney/google-cloud-vision-api-tutorial
 *
 * Usage : node index.js
 * Prérequis : un fichier de clé JSON (compte de service GCP) dans ce dossier :
 *   - service-account-key.json, ou
 *   - le fichier téléchargé depuis GCP (ex. emerald-griffin-488621-u4-2042ca3edfe7.json)
 */

import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Trouve un fichier de clé GCP dans ce dossier. */
function findKeyFile() {
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
  return null;
}

const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || findKeyFile();
if (!keyFile) {
  console.error("Aucune clé trouvée. Place un fichier JSON de compte de service dans ce dossier (ex. emerald-griffin-xxx.json).");
  process.exit(1);
}

const client = new vision.ImageAnnotatorClient({ keyFilename: keyFile });

async function analyzeImage(imagePathOrUrl) {
  const isUrl = typeof imagePathOrUrl === "string" && (imagePathOrUrl.startsWith("http://") || imagePathOrUrl.startsWith("https://"));
  const request = isUrl
    ? { image: { source: { imageUri: imagePathOrUrl } } }
    : { image: { source: { filename: imagePathOrUrl } } };

  const [labelResult] = await client.labelDetection(request);
  const labels = (labelResult?.labelAnnotations || []).map((a) => ({
    description: a.description,
    score: a.score,
  }));

  console.log("Labels détectés:", labels);
  return labels;
}

const imageUrl = "https://designforceinc.com/wp-content/uploads/2019/09/toy-packaging-sustainability-equals-playability.jpg";
analyzeImage(imageUrl).then(() => console.log("Done")).catch((err) => console.error("Error:", err.message));
