import { getAccessToken, getRefreshToken, setAuthSession, clearAuthSession } from "./auth-store";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers
    }
  });

  if (res.status !== 401) {
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthSession();
    throw new Error("Unauthorized");
  }

  const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` }
  });

  if (!refreshRes.ok) {
    await clearAuthSession();
    throw new Error("Unauthorized");
  }

  const refreshed = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
  await setAuthSession({ accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, user: {} });

  const retry = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshed.accessToken}`,
      ...options?.headers
    }
  });
  if (!retry.ok) throw new Error(await retry.text());
  return retry.json() as Promise<T>;
}