import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "scout_access_token";
const REFRESH_KEY = "scout_refresh_token";
const USER_KEY = "scout_user";

export interface StoredUser {
  id: string;
  nombre: string;
  email: string;
  role_id?: string | null;
  equipo_asignado?: string | null;
  is_active?: boolean;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

export async function setAuthSession(session: StoredSession) {
  await SecureStore.setItemAsync(ACCESS_KEY, session.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function getStoredUser() {
  const rawUser = await SecureStore.getItemAsync(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    await SecureStore.deleteItemAsync(USER_KEY);
    return null;
  }
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}