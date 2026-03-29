import { getAccessToken, getRefreshToken, getStoredUser, setAuthSession, clearAuthSession, type StoredUser } from "./auth-store";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type RequestOptions = RequestInit & {
  json?: JsonValue;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
};

function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error("Falta configurar EXPO_PUBLIC_BACKEND_URL.");
  }

  return BASE_URL;
}

function buildHeaders(options?: RequestOptions, accessToken?: string) {
  return {
    Accept: "application/json",
    ...(options?.json ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options?.headers,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : typeof payload === "string"
          ? payload
          : "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return payload as T;
}

async function request<T>(path: string, options?: RequestOptions, accessToken?: string) {
  const baseUrl = ensureBaseUrl();

  return fetch(`${baseUrl}${path}`, {
    ...options,
    body: options?.json ? JSON.stringify(options.json) : options?.body,
    headers: buildHeaders(options, accessToken),
  });
}

export async function login(email: string, password: string) {
  const res = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    json: { email, password },
  });

  const payload = await parseResponse<LoginResponse>(res);
  await setAuthSession(payload);
  return payload;
}

export async function fetchCurrentUser() {
  return apiFetch<{ user: StoredUser }>("/api/auth/me");
}

export async function apiFetch<T>(path: string, options?: RequestOptions): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await request<T>(path, options, accessToken ?? undefined);

  if (res.status !== 401) {
    return parseResponse<T>(res);
  }

  const refreshToken = await getRefreshToken();
  const storedUser = await getStoredUser();
  if (!refreshToken) {
    await clearAuthSession();
    throw new Error("Unauthorized");
  }

  const refreshRes = await request<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", {
    method: "POST",
    headers: {
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    },
  }, refreshToken);

  if (!refreshRes.ok) {
    await clearAuthSession();
    throw new Error("Unauthorized");
  }

  const refreshed = await parseResponse<{ accessToken: string; refreshToken: string }>(refreshRes);
  if (!storedUser) {
    await clearAuthSession();
    throw new Error("Unauthorized");
  }

  await setAuthSession({ accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, user: storedUser });

  const retry = await request<T>(path, options, refreshed.accessToken);
  return parseResponse<T>(retry);
}
