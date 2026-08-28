const TOKEN_KEY = "ai_learning_token";

export function saveToken(token: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
}