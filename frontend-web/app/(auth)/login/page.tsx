"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold">Scout Tracker</h1>
        <p className="text-sm text-neutral-600">Inicia sesion para continuar</p>
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded border p-2"
          placeholder="Contrasena"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-[var(--accent)] p-2 text-white" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}