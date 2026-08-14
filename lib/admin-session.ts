export const ADMIN_TOKEN_COOKIE = "ares_admin_token";
export const ADMIN_USER_COOKIE = "ares_admin_user";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
};

type JwtPayload = {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  return apiUrl.replace(/\/+$/, "");
}

export function normalizeAdminUser(value: unknown): AdminUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as Record<string, unknown>;
  const id = user.id || user._id;

  if (typeof id !== "string" || typeof user.email !== "string" || user.role !== "admin") {
    return null;
  }

  return {
    id,
    email: user.email,
    name: typeof user.name === "string" && user.name.trim() ? user.name : "Admin",
    role: "admin",
  };
}

export function encodeAdminUserCookie(user: AdminUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeAdminUserCookie(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return normalizeAdminUser(JSON.parse(decodeURIComponent(value)));
  } catch {
    return null;
  }
}

export function readJwtPayload(token?: string): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAdminJwt(token?: string) {
  const payload = readJwtPayload(token);
  const expiresAt = payload?.exp ? payload.exp * 1000 : 0;

  return Boolean(payload?.role === "admin" && expiresAt > Date.now());
}
