"use client";

import { X } from "lucide-react";
import type { Scout } from "@/types/scout";

interface ScoutDetailModalProps {
  scout: Scout | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function ScoutDetailModal({ scout, isOpen, onClose }: ScoutDetailModalProps) {
  if (!isOpen || !scout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{scout.nombre}</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Equipo</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.equipo}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Promesa</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.promesa ?? "—"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Etapa</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.etapa ?? "—"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Ingreso al Movimiento</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.ingreso_movimiento ?? "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Fecha de Nacimiento</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{formatDate(scout.fecha_nacimiento)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">DNI</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.dni ?? "—"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Elemento</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.elemento ?? "—"}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Raid</label>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">{scout.raid ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {scout.tel_propio && (
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Teléfono Propio</label>
                <p className="mt-1 font-medium text-neutral-900 dark:text-white">{scout.tel_propio}</p>
              </div>
            )}

            {scout.tel_emergencias && (
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Teléfono Emergencias</label>
                <p className="mt-1 font-medium text-neutral-900 dark:text-white">{scout.tel_emergencias}</p>
              </div>
            )}

            {scout.religion && (
              <div>
                <label className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Religión</label>
                <p className="mt-1 font-medium text-neutral-900 dark:text-white">{scout.religion}</p>
              </div>
            )}

          </div>

          <div className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <p className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Pagos</p>
            <p className="text-sm text-neutral-900 dark:text-white">Cuota del distrito: {scout.distrito ? "Pagado" : "Pendiente"}</p>
            <p className="text-sm text-neutral-900 dark:text-white">Pago de afiliación: {scout.afiliacion ? "Pagado" : "Pendiente"}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <p className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">Estado de Documentos</p>
            <p className="text-sm text-neutral-900 dark:text-white">Declaración jurada de salud: {scout.ddjj_salud ? "Cargada" : "Pendiente"}</p>
            <p className="text-sm text-neutral-900 dark:text-white">Autorización uso de imagen: {scout.uso_imagen ? "Cargada" : "Pendiente"}</p>
            <p className="text-sm text-neutral-900 dark:text-white">Autorización retirarse solo: {scout.retiro_solo ? "Cargada" : "Pendiente"}</p>
            <p className="text-sm text-neutral-900 dark:text-white">Otros: {(scout.otros_documentos?.length ?? 0) > 0 ? `${scout.otros_documentos?.length ?? 0} cargado(s)` : "Sin documentos"}</p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
