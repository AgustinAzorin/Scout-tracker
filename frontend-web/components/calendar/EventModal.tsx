"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export type CalendarEvent = {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: "reunion" | "cumpleanos" | "campamento" | "raid" | "feriado" | "recordatorio";
  fecha_inicio: string;
  fecha_fin?: string;
  equipo_destinatario?: string;
  isBirthday?: boolean;
};

type SaveEventResponse = {
  event: CalendarEvent;
};

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  mode?: "view" | "create";
  initialDate?: string;
  equipos?: string[];
  onClose: () => void;
  onCreated?: (event: CalendarEvent) => void;
  onUpdated?: (event: CalendarEvent) => void;
  onDeleted?: (eventId: string) => void;
}

type FormState = {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: CalendarEvent["tipo"];
  equipo_destinatario: string;
};

function toDatetimeLocal(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(value));
}

function tipoLabel(tipo: CalendarEvent["tipo"]): string {
  switch (tipo) {
    case "reunion":
      return "Reunión";
    case "cumpleanos":
      return "Cumpleaños";
    case "campamento":
      return "Campamento";
    case "raid":
      return "Raid";
    case "feriado":
      return "Feriado";
    case "recordatorio":
      return "Recordatorio";
    default:
      return tipo;
  }
}

export default function EventModal({
  event,
  isOpen,
  mode = "view",
  initialDate,
  equipos = [],
  onClose,
  onCreated,
  onUpdated,
  onDeleted
}: EventModalProps) {
  const isCreateMode = mode === "create";
  const isSyntheticHoliday = Boolean(event?.id?.startsWith("holiday-"));
  const isEditableEvent = Boolean(event) && !event?.isBirthday && !isSyntheticHoliday;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    tipo: "reunion",
    equipo_destinatario: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !isCreateMode) return;

    const baseDate = initialDate ? new Date(initialDate) : new Date();
    baseDate.setHours(19, 0, 0, 0);
    const endDate = new Date(baseDate);
    endDate.setHours(baseDate.getHours() + 2);

    setForm({
      titulo: "",
      descripcion: "",
      fecha_inicio: toDatetimeLocal(baseDate),
      fecha_fin: toDatetimeLocal(endDate),
      tipo: "reunion",
      equipo_destinatario: ""
    });
    setError(null);
  }, [initialDate, isCreateMode, isOpen]);

  useEffect(() => {
    if (!isOpen || isCreateMode || !event) return;

    setForm({
      titulo: event.titulo ?? "",
      descripcion: event.descripcion ?? "",
      fecha_inicio: toDatetimeLocal(event.fecha_inicio),
      fecha_fin: event.fecha_fin ? toDatetimeLocal(event.fecha_fin) : "",
      tipo: event.tipo,
      equipo_destinatario: event.equipo_destinatario ?? ""
    });
    setIsEditing(false);
    setIsDeleteConfirmOpen(false);
    setError(null);
  }, [event, isCreateMode, isOpen]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.fecha_inicio) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }

    if (form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
      setError("La fecha de fin no puede ser anterior al inicio.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await apiFetch<SaveEventResponse>("/api/events", {
        method: "POST",
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim() || undefined,
          fecha_inicio: new Date(form.fecha_inicio).toISOString(),
          fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : undefined,
          tipo: form.tipo,
          equipo_destinatario: form.equipo_destinatario.trim() || undefined
        })
      });

      onCreated?.(response.event);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el evento");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate() {
    if (!event) return;

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.fecha_inicio) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }

    if (form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
      setError("La fecha de fin no puede ser anterior al inicio.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await apiFetch<SaveEventResponse>(`/api/events/${event.id}`, {
        method: "PUT",
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim() || undefined,
          fecha_inicio: new Date(form.fecha_inicio).toISOString(),
          fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : undefined,
          tipo: form.tipo,
          equipo_destinatario: form.equipo_destinatario.trim() || undefined
        })
      });

      onUpdated?.(response.event);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el evento");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;

    try {
      setIsSaving(true);
      setError(null);
      await apiFetch<{ success: boolean }>(`/api/events/${event.id}`, {
        method: "DELETE"
      });
      onDeleted?.(event.id);
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el evento");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <X size={20} />
        </button>

        {isCreateMode || isEditing ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {isCreateMode ? "Nuevo evento" : "Editar evento"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                {isCreateMode ? "Crear evento" : "Editar evento"}
              </h2>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as CalendarEvent["tipo"] }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  >
                    <option value="reunion">Reunión</option>
                    <option value="campamento">Campamento</option>
                    <option value="raid">Raid</option>
                    <option value="feriado">Feriado</option>
                    <option value="recordatorio">Recordatorio</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Equipo destinatario</label>
                  <select
                    value={form.equipo_destinatario}
                    onChange={(e) => setForm((prev) => ({ ...prev, equipo_destinatario: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  >
                    <option value="">Todos</option>
                    {equipos.map((equipo) => (
                      <option key={equipo} value={equipo}>{equipo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Inicio</label>
                  <input
                    type="datetime-local"
                    value={form.fecha_inicio}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Fin</label>
                  <input
                    type="datetime-local"
                    value={form.fecha_fin}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Descripción</label>
                <textarea
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-[var(--accent)] dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isCreateMode) {
                    onClose();
                    return;
                  }
                  setIsEditing(false);
                  setError(null);
                }}
                className="flex-1 rounded-lg bg-neutral-100 px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={isCreateMode ? handleSave : handleUpdate}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : isCreateMode ? "Crear evento" : "Guardar cambios"}
              </button>
            </div>
          </div>
        ) : event ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {tipoLabel(event.tipo)}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{event.titulo}</h2>
                {isEditableEvent ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setError(null);
                      }}
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      title="Editar evento"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteConfirmOpen(true);
                        setError(null);
                      }}
                      disabled={isSaving}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                      title="Eliminar evento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {isDeleteConfirmOpen ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Eliminar evento</p>
                <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/90">
                  Esta acción no se puede deshacer. ¿Querés eliminar este evento?
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    disabled={isSaving}
                    className="flex-1 rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSaving ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Inicio</p>
                <p className="mt-1 text-sm text-neutral-900 dark:text-white">{formatDateTime(event.fecha_inicio)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Fin</p>
                <p className="mt-1 text-sm text-neutral-900 dark:text-white">{event.fecha_fin ? formatDateTime(event.fecha_fin) : "—"}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Equipo destinatario</p>
                <p className="mt-1 text-sm text-neutral-900 dark:text-white">{event.equipo_destinatario ?? "Todos"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Descripción</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{event.descripcion?.trim() || "Sin descripción"}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-neutral-100 px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              Cerrar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}