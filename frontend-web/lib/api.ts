import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers }
  });

  if (res.status === 401) redirect("/login");
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}