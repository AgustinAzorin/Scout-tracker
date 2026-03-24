"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type AgesPoint = {
  edad: number;
  count: number;
};

type AgesResponse = {
  data: AgesPoint[];
};

export default function AgesChart() {
  const [data, setData] = useState<AgesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<AgesResponse>("/api/graficos/edades");
        setData((response.data ?? []).sort((a, b) => a.edad - b.edad));
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las edades");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const maxCount = useMemo(() => Math.max(...data.map((item) => item.count), 1), [data]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Edades</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Distribución de scouts activos por edad.</p>
      </div>

      {loading ? <p className="text-sm text-neutral-500">Cargando edades...</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-3">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.edad} className="grid grid-cols-[52px_1fr_36px] items-center gap-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.edad} años</span>
                <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-right text-sm text-neutral-600 dark:text-neutral-400">{item.count}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No hay datos para mostrar.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}