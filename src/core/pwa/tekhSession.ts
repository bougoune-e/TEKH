/** Persistance légère (session = onglet ; local = retour après fermeture de l’app). */
const PREFIX = "tekh:";

export function saveJson(key: string, value: unknown, useLocal = false): void {
  try {
    const storage = useLocal ? localStorage : sessionStorage;
    storage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function loadJson<T>(key: string, useLocal = false): T | null {
  try {
    const storage = useLocal ? localStorage : sessionStorage;
    const raw = storage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
