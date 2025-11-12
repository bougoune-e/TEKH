const TOKEN_KEY = "swap:token";
const ROLE_KEY = "swap:role";

export function setSession({ token, role }: { token: string; role: "admin" | "superadmin" | string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function logout() {
  clearSession();
  window.location.href = "/login";
}
