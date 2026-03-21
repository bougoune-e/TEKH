import { config } from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Racine du repo TEKH (scripts/prt → ../..) */
export const REPO_ROOT = join(__dirname, "../..");

/**
 * Charge .env racine puis tekh_backend/backend/.env (sans écraser les clés déjà définies).
 */
export function loadRepoEnv() {
  const paths = [
    join(REPO_ROOT, ".env"),
    join(REPO_ROOT, "tekh_backend/backend/.env"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      config({ path: p, override: true });
    }
  }
}
