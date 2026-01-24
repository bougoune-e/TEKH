const TOKEN_KEY = "swap:token";
const ROLE_KEY = "swap:role";
const USER_ID_KEY = "swap:user_id";
const USER_EMAIL_KEY = "swap:user_email";
const USER_NAME_KEY = "swap:user_name";
const USER_AVATAR_KEY = "swap:user_avatar";

type SessionPayload = {
  token: string;
  role: "admin" | "superadmin" | string;
  userId?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export function setSession({ token, role, userId, email, name, avatarUrl }: SessionPayload) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
  if (email) localStorage.setItem(USER_EMAIL_KEY, email);
  if (name) localStorage.setItem(USER_NAME_KEY, name);
  if (avatarUrl) localStorage.setItem(USER_AVATAR_KEY, avatarUrl);
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
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_AVATAR_KEY);
}

export function logout() {
  clearSession();
  window.location.href = "/login";
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getUserEmail() {
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY);
}

export function getUserAvatar() {
  return localStorage.getItem(USER_AVATAR_KEY);
}

export function setUserAvatar(url: string) {
  localStorage.setItem(USER_AVATAR_KEY, url);
}
