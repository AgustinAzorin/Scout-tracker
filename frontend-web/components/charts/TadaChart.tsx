"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type TadaSummary = {
  tiene: number;
  puede: number;
  no_puede: number;
};

type TadaResponse = {
  data: TadaSummary;
};

const TADA_ITEMS = [
  { key: "tiene", label: "Tiene", color: "bg-emerald-500" },
  { key: "puede", label: "Puede hacer", color: "bg-amber-500" },
  { key: "no_puede", label: "No puede", color: "bg-rose-500" }
] as const;

export default function TadaChart() {
  const [data, setData] = useState<TadaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<TadaResponse>("/api/graficos/tada");
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos de TADA");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const total = useMemo(() => {
    if (!data) return 0;
    return data.tiene + data.puede + data.no_puede;
  }, [data]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Estado TADA</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Resumen de quienes ya lo tienen, pueden hacerlo o todavía no pueden.</p>
      </div>

      {loading ? <p className="text-sm text-neutral-500">Cargando TADA...</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {!loading && !error && data ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {TADA_ITEMS.map((item) => {
              const value = data[item.key];
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

              return (
                <div key={item.key} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className={`mb-3 h-2 rounded-full ${item.color}`} />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-neutral-900 dark:text-white">{value}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{percentage}% del total</p>
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div className="flex h-4 w-full">
              {TADA_ITEMS.map((item) => {
                const value = data[item.key];
                const width = total > 0 ? (value / total) * 100 : 0;
                return <div key={item.key} className={item.color} style={{ width: `${width}%` }} />;
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}