"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, Trash2, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";

type EquipoApi = {
  id: string;
  nombre: string;
  logo_url?: string | null;
  descripcion?: string | null;
  scouts?: Array<{ count: number }>;
};

type Equipo = {
  id: string;
  nombre: string;
  logo_url?: string | null;
  descripcion?: string | null;
  scoutCount: number;
};

export default function AdminEquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingEquipo, setDeletingEquipo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    loadEquipos();
  }, []);

  const equiposOrdenados = useMemo(
    () => [...equipos].sort((left, right) => left.nombre.localeCompare(right.nombre)),
    [equipos]
  );

  const loadEquipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch<{ equipos: EquipoApi[] }>("/api/equipos", {
        method: "GET",
      });

      const normalized = (response.equipos ?? []).map((equipo) => ({
        id: equipo.id,
        nombre: equipo.nombre,
        logo_url: equipo.logo_url,
        descripcion: equipo.descripcion,
        scoutCount: Array.isArray(equipo.scouts) && equipo.scouts[0]?.count ? equipo.scouts[0].count : 0,
      }));

      setEquipos(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando equipos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const nombre = formData.nombre.trim();
    const descripcion = formData.descripcion.trim();

    if (!nombre) {
      setError("El nombre del equipo es obligatorio");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await apiFetch<{ equipo: EquipoApi }>("/api/equipos", {
        method: "POST",
        body: JSON.stringify({ nombre, descripcion: descripcion || null }),
      });
      setFormData({ nombre: "", descripcion: "" });
      await loadEquipos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando equipo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (nombre: string) => {
    try {
      setDeletingEquipo(nombre);
      setError(null);
      await apiFetch<{ success: boolean }>(`/api/equipos/${encodeURIComponent(nombre)}`, {
        method: "DELETE",
      });
      await loadEquipos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando equipo");
    } finally {
      setDeletingEquipo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando equipos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Equipos</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Crea nuevos equipos y elimina los que ya no deban estar disponibles.
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo equipo</h2>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
              placeholder="Ej: Unidad Scout"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(event) => setFormData({ ...formData, descripcion: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
              placeholder="Descripción opcional"
            />
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            {saving ? "Creando..." : "Crear equipo"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Equipos disponibles</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {equiposOrdenados.length} equipo{equiposOrdenados.length === 1 ? "" : "s"} registrados
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {equiposOrdenados.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay equipos cargados todavía.
            </div>
          ) : (
            equiposOrdenados.map((equipo) => (
              <div
                key={equipo.id}
                className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Users size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{equipo.nombre}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {equipo.descripcion?.trim() || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {equipo.scoutCount} scout{equipo.scoutCount === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(equipo.nombre)}
                    disabled={deletingEquipo === equipo.nombre}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    <Trash2 size={16} />
                    {deletingEquipo === equipo.nombre ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
