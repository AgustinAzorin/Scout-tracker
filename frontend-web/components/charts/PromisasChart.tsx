"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type PromesaPoint = {
  promesa: string;
  count: number;
  logo_url?: string | null;
};

type PromesasResponse = {
  data: PromesaPoint[];
};

export default function PromisasChart() {
  const [data, setData] = useState<PromesaPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<PromesasResponse>("/api/graficos/promesas");
        setData((response.data ?? []).sort((a, b) => b.count - a.count));
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las promesas");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Promesas</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Cantidad de scouts por estado de promesa.</p>
      </div>

      {loading ? <p className="text-sm text-neutral-500">Cargando promesas...</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-3">
          {data.length > 0 ? (
            data.map((item) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.promesa} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{item.promesa}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{percentage}% del total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{item.count}</p>
                      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">scouts</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-neutral-500">No hay datos para mostrar.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}