/**
 * CarbonTrace API Client
 * Typed fetch wrapper — injects JWT from localStorage on every request.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/signin";
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `POST ${path} failed`);
  }
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `PUT ${path} failed`);
  }
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  file: File
): Promise<T> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    const msg = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail ?? "Upload failed");
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Retrieve stored user object (saved during login/register) */
export function getStoredUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ct_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function storeUser(user: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ct_user", JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  ["access_token", "refresh_token", "ct_user"].forEach((k) =>
    localStorage.removeItem(k)
  );
}
