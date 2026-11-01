// Talks to the backend (backend/src/dbRoutes.ts). In development, Vite forwards /api to
// http://localhost:3000 (see vite.config.js), so there's nothing to configure here.

export const API_BASE = "/api/accounts";
export const TOKEN_KEY = "aquademia-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Returns { ok, status, data }. Never throws: a network failure gives status 0.
export async function request(path, { method = "GET", body, keepalive = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      keepalive,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: "Can't reach the server. Is the backend running?" },
    };
  }
}
