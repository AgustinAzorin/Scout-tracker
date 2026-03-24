"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Scout } from "@/types/scout";
import { MESES_CUOTA, isMesVencido } from "@/lib/cuota-social";

const MESES = MESES_CUOTA;

interface CuotaSocialModalProps {
  scout: Scout | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedScout: Scout) => void;
}

export function CuotaSocialModal({ scout, isOpen, onClose, onUpdated }: CuotaSocialModalProps) {
  const [cuotas, setCuotas] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !scout) return;
    const initial: Record<string, boolean> = {};
    for (const mes of MESES) {
      initial[mes.key] = Boolean(scout.cuota_social?.[mes.key]);
    }
    setCuotas(initial);
    setError(null);
  }, [scout, isOpen]);

  if (!isOpen || !scout) return null;

  function toggleMes(key: string) {
    setCuotas((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await apiFetch<{ scout: Scout }>(`/api/scouts/${scout!.id}`, {
        method: "PUT",
        body: JSON.stringify({ cuota_social: cuotas }),
      });
      onUpdated(response.scout);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setIsSaving(false);
    }
  }

  const pagadasCount = Object.values(cuotas).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
        >
          <X size={20} />
        </button>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Cuota Social</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {scout.nombre} — {pagadasCount}/9 cuotas pagadas
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                <th className="pb-2">Mes</th>
                <th className="pb-2 text-center">Pagado</th>
              </tr>
            </thead>
            <tbody>
              {MESES.map((mes) => {
                const vencido = isMesVencido(mes.mes) && !cuotas[mes.key];
                return (
                  <tr
                    key={mes.key}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                  >
                    <td className={`py-2 ${vencido ? "font-semibold text-red-600 dark:text-red-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                      {mes.label}
                      {vencido && (
                        <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400">
                          atrasado
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => toggleMes(mes.key)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition ${
                          cuotas[mes.key]
                            ? "bg-green-500 text-white"
                            : vencido
                            ? "bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                            : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                        }`}
                      >
                        {cuotas[mes.key] ? "✓" : "✗"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
