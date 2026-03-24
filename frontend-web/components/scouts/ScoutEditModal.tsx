"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Scout } from "@/types/scout";

interface ScoutEditModalProps {
  scout: Scout | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedScout: Scout) => void;
  equipos?: string[];
}

interface SaveScoutResponse {
  scout: Scout;
}

const PROMESA_OPTIONS = ["Sin promesa", "Con promesa sin pañuelo", "Con pañuelo"];
const ETAPA_OPTIONS = ["Ini", "1°", "2°", "3°"];
const RAID_OPTIONS = ["1°R", "2°R", "3°R"];
const ELEMENTO_OPTIONS: Array<NonNullable<Scout["elemento"]>> = ["Fuego", "Tierra", "Agua", "Aire"];
const INGRESO_OPTIONS: Array<NonNullable<Scout["ingreso_movimiento"]>> = ["Manada", "Unidad", "Caminantes"];
const PHONE_PREFIX = "+54 9 11";

function formatPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function toPhoneInputValue(value?: string): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  const lastEight = digits.slice(-8);
  return formatPhoneDigits(lastEight);
}

function toStoredPhone(value?: string): string | undefined {
  if (!value) return undefined;
  return `${PHONE_PREFIX} ${value}`;
}

function isPhoneValid(value?: string): boolean {
  if (!value) return true;
  return /^\d{4}-\d{4}$/.test(value);
}

function isOlderThan16(fechaNacimiento?: string): boolean {
  if (!fechaNacimiento) return false;
  const birth = new Date(fechaNacimiento);
  if (Number.isNaN(birth.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age >= 16;
}

export function ScoutEditModal({ scout, isOpen, onClose, onUpdated, equipos = [] }: ScoutEditModalProps) {
  const scoutId = scout?.id;
  const [formData, setFormData] = useState<Partial<Scout>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCreateMode = !scoutId;
  const tadaPuedeCalculado = isOlderThan16(formData.fecha_nacimiento);

  useEffect(() => {
    if (!isOpen) return;

    if (scout) {
      setFormData({
        nombre: scout.nombre,
        dni: scout.dni,
        fecha_nacimiento: scout.fecha_nacimiento,
        equipo: scout.equipo,
        promesa: scout.promesa,
        etapa: scout.etapa,
        raid: scout.raid,
        elemento: scout.elemento,
        ingreso_movimiento: scout.ingreso_movimiento,
        tel_propio: toPhoneInputValue(scout.tel_propio),
        tel_emergencias: toPhoneInputValue(scout.tel_emergencias),
        tel_emergencias_2: toPhoneInputValue(scout.tel_emergencias_2),
        religion: scout.religion,
        va: scout.va,
        tada_tiene: scout.tada_tiene,
        distrito: scout.distrito,
        afiliacion: scout.afiliacion
      });
    } else {
      setFormData({
        nombre: "",
        dni: undefined,
        fecha_nacimiento: "",
        equipo: equipos[0] ?? "",
        promesa: undefined,
        etapa: undefined,
        raid: undefined,
        elemento: undefined,
        ingreso_movimiento: undefined,
        tel_propio: undefined,
        tel_emergencias: undefined,
        tel_emergencias_2: undefined,
        religion: undefined,
        va: false,
        tada_tiene: false,
        distrito: false,
        afiliacion: false
      });
    }
    setError(null);
  }, [scout, isOpen, equipos]);

  if (!isOpen) return null;

  const equipoOptions = Array.from(new Set([...(equipos ?? []), scout?.equipo].filter((value): value is string => Boolean(value))));

  function setField<K extends keyof Partial<Scout>>(key: K, value: Partial<Scout>[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!formData.nombre?.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!formData.equipo?.trim()) {
      setError("El equipo es obligatorio.");
      return;
    }

    if (!isPhoneValid(formData.tel_propio)) {
      setError("El teléfono propio debe tener 8 dígitos en formato 1234-5678.");
      return;
    }

    if (!isPhoneValid(formData.tel_emergencias)) {
      setError("El teléfono de emergencia debe tener 8 dígitos en formato 1234-5678.");
      return;
    }

    if (!isPhoneValid(formData.tel_emergencias_2)) {
      setError("El teléfono de emergencia 2 debe tener 8 dígitos en formato 1234-5678.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      nombre: formData.nombre.trim(),
      dni: formData.dni,
      fecha_nacimiento: formData.fecha_nacimiento,
      equipo: formData.equipo,
      promesa: formData.promesa || undefined,
      etapa: formData.etapa || undefined,
      raid: formData.raid || undefined,
      elemento: formData.elemento || undefined,
      ingreso_movimiento: formData.ingreso_movimiento || undefined,
      tel_propio: toStoredPhone(formData.tel_propio),
      tel_emergencias: toStoredPhone(formData.tel_emergencias),
      tel_emergencias_2: toStoredPhone(formData.tel_emergencias_2),
      religion: formData.religion || undefined,
      va: Boolean(formData.va),
      tada_tiene: Boolean(formData.tada_tiene),
      tada_puede: tadaPuedeCalculado,
      distrito: Boolean(formData.distrito),
      afiliacion: Boolean(formData.afiliacion)
    };

    try {
      const response = await apiFetch<SaveScoutResponse>(isCreateMode ? "/api/scouts" : `/api/scouts/${scoutId}`, {
        method: isCreateMode ? "POST" : "PUT",
        body: JSON.stringify(payload)
      });
      onUpdated(response.scout);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el scout");
    } finally {
      setIsSaving(false);
    }
  }

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
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{isCreateMode ? "Nuevo Scout" : "Editar Scout"}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isCreateMode ? "Completá los datos del nuevo scout" : `Scout #${scout?.numero ?? "-"} - ${scout?.nombre ?? ""}`}
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre</label>
              <input
                type="text"
                value={formData.nombre ?? ""}
                onChange={(e) => setField("nombre", e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">DNI</label>
              <input
                type="number"
                value={formData.dni ?? ""}
                onChange={(e) => setField("dni", parseInt(e.target.value, 10) || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Fecha de nacimiento</label>
              <input
                type="date"
                value={typeof formData.fecha_nacimiento === "string" ? formData.fecha_nacimiento.slice(0, 10) : ""}
                onChange={(e) => setField("fecha_nacimiento", e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Equipo</label>
              <select
                value={formData.equipo ?? ""}
                onChange={(e) => setField("equipo", e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Seleccionar equipo</option>
                {equipoOptions.map((equipo) => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Promesa</label>
              <select
                value={formData.promesa ?? ""}
                onChange={(e) => setField("promesa", e.target.value || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Seleccionar</option>
                {PROMESA_OPTIONS.map((promesa) => (
                  <option key={promesa} value={promesa}>{promesa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Etapa</label>
              <select
                value={formData.etapa ?? ""}
                onChange={(e) => setField("etapa", e.target.value || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Seleccionar</option>
                {ETAPA_OPTIONS.map((etapa) => (
                  <option key={etapa} value={etapa}>{etapa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Raid</label>
              <select
                value={formData.raid ?? ""}
                onChange={(e) => setField("raid", e.target.value || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Sin raid</option>
                {RAID_OPTIONS.map((raid) => (
                  <option key={raid} value={raid}>{raid}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Elemento</label>
              <select
                value={formData.elemento ?? ""}
                onChange={(e) => setField("elemento", (e.target.value as Scout["elemento"]) || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Sin elemento</option>
                {ELEMENTO_OPTIONS.map((elemento) => (
                  <option key={elemento} value={elemento}>{elemento}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Ingreso al movimiento</label>
              <select
                value={formData.ingreso_movimiento ?? ""}
                onChange={(e) => setField("ingreso_movimiento", (e.target.value as Scout["ingreso_movimiento"]) || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Seleccionar</option>
                {INGRESO_OPTIONS.map((ingreso) => (
                  <option key={ingreso} value={ingreso}>{ingreso}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Teléfono propio</label>
              <div className="mt-1 flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800">
                <span className="mr-2 shrink-0 whitespace-nowrap text-sm font-medium text-neutral-500 dark:text-neutral-400">{PHONE_PREFIX}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={formData.tel_propio ?? ""}
                  onChange={(e) => setField("tel_propio", formatPhoneDigits(e.target.value) || undefined)}
                  placeholder="1234-5678"
                  className="w-full bg-transparent text-neutral-900 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Teléfono de emergencia</label>
              <div className="mt-1 flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800">
                <span className="mr-2 shrink-0 whitespace-nowrap text-sm font-medium text-neutral-500 dark:text-neutral-400">{PHONE_PREFIX}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={formData.tel_emergencias ?? ""}
                  onChange={(e) => setField("tel_emergencias", formatPhoneDigits(e.target.value) || undefined)}
                  placeholder="1234-5678"
                  className="w-full bg-transparent text-neutral-900 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Teléfono emergencia 2</label>
              <div className="mt-1 flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800">
                <span className="mr-2 shrink-0 whitespace-nowrap text-sm font-medium text-neutral-500 dark:text-neutral-400">{PHONE_PREFIX}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={formData.tel_emergencias_2 ?? ""}
                  onChange={(e) => setField("tel_emergencias_2", formatPhoneDigits(e.target.value) || undefined)}
                  placeholder="1234-5678"
                  className="w-full bg-transparent text-neutral-900 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Religión</label>
              <input
                type="text"
                value={formData.religion ?? ""}
                onChange={(e) => setField("religion", e.target.value || undefined)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(formData.va)}
                  onChange={(e) => setField("va", e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                Va al siguiente campamento
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(formData.tada_tiene)}
                  onChange={(e) => setField("tada_tiene", e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                TADA tiene
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(formData.distrito)}
                  onChange={(e) => setField("distrito", e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                Cuota del distrito
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(formData.afiliacion)}
                  onChange={(e) => setField("afiliacion", e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                Pago de afiliación
              </label>

              <div className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                <span className="font-medium">TADA puede:</span> {tadaPuedeCalculado ? "Sí" : "No"}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
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
              {isSaving ? "Guardando..." : isCreateMode ? "Crear scout" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
