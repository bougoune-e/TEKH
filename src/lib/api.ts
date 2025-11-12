import { getToken, logout } from "./auth";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export async function api(path: string, init?: RequestInit) {
  if (!baseURL) return { ok: false, status: 0, json: async () => null } as Response;
  const headers: HeadersInit = {
    ...(init?.headers || {}),
    Authorization: `Bearer ${getToken() || ""}`,
    "Content-Type": "application/json",
  };
  const res = await fetch(`${baseURL}${path}`, { ...init, headers });
  if (res.status === 401) logout();
  return res;
}
