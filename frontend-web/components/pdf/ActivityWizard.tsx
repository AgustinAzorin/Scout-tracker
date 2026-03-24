"use client";

import { pdf } from "@react-pdf/renderer";
import { AlertCircle, Download, FileText, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { ScoutActivityPdfDocument } from "@/components/pdf/ScoutActivityPdfDocument";
import {
  createEmptyAnnex,
  createEmptyEducator,
  createEmptyMaterial,
  createEmptyObjective,
  createEmptyScheduleRow,
  createInitialPdfData,
  getEducatorLabel,
  type ActivityPdfData,
  type Annex,
  type ObjectiveItem,
} from "@/lib/pdf/activity-pdf";

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

type ObjectiveSectionKey = "objetivosEducativos" | "objetivosDirigente" | "areasTrabajar";

const objectiveSectionLabels: Record<ObjectiveSectionKey, string> = {
  objetivosEducativos: "Objetivos educativos",
  objetivosDirigente: "Objetivos que persigue el dirigente",
  areasTrabajar: "Áreas a trabajar",
};

export default function ActivityWizard() {
  const [data, setData] = useState<ActivityPdfData>(() => createInitialPdfData());
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateActividad = (field: keyof ActivityPdfData["actividad"], value: string) => {
    setData((current) => ({
      ...current,
      actividad: { ...current.actividad, [field]: value },
    }));
  };

  const updateCabecera = (field: "grupoScout" | "comunidad", value: string) => {
    setData((current) => ({
      ...current,
      cabecera: { ...current.cabecera, [field]: value },
    }));
  };

  const updateEducator = (id: string, field: "nombre" | "cargo", value: string) => {
    setData((current) => ({
      ...current,
      cabecera: {
        ...current.cabecera,
        equipoEducadores: current.cabecera.equipoEducadores.map((educator) =>
          educator.id === id ? { ...educator, [field]: value } : educator
        ),
      },
    }));
  };

  const addEducator = () => {
    setData((current) => ({
      ...current,
      cabecera: {
        ...current.cabecera,
        equipoEducadores: [
          ...current.cabecera.equipoEducadores,
          { ...createEmptyEducator(current.cabecera.equipoEducadores.length + 1), id: generateId("educator") },
        ],
      },
    }));
  };

  const removeEducator = (id: string) => {
    setData((current) => ({
      ...current,
      cabecera: {
        ...current.cabecera,
        equipoEducadores: current.cabecera.equipoEducadores.filter((educator) => educator.id !== id),
      },
      cronograma: current.cronograma.map((row) =>
        row.responsableId === id ? { ...row, responsableId: "" } : row
      ),
    }));
  };

  const updateDiagnostico = (field: keyof ActivityPdfData["diagnostico"], value: string) => {
    setData((current) => ({
      ...current,
      diagnostico: { ...current.diagnostico, [field]: value },
    }));
  };

  const addObjective = (section: ObjectiveSectionKey) => {
    setData((current) => ({
      ...current,
      [section]: [
        ...current[section],
        { ...createEmptyObjective(current[section].length + 1), id: generateId("objective") },
      ],
    }));
  };

  const updateObjective = (
    section: ObjectiveSectionKey,
    objectiveId: string,
    field: keyof ObjectiveItem,
    value: string
  ) => {
    setData((current) => ({
      ...current,
      [section]: current[section].map((objective) =>
        objective.id === objectiveId ? { ...objective, [field]: value } : objective
      ),
    }));
  };

  const removeObjective = (section: ObjectiveSectionKey, objectiveId: string) => {
    setData((current) => ({
      ...current,
      [section]: current[section].filter((objective) => objective.id !== objectiveId),
    }));
  };

  const updateSchedule = (
    id: string,
    field: "hora" | "nombre" | "responsableId" | "anexoId",
    value: string
  ) => {
    setData((current) => ({
      ...current,
      cronograma: current.cronograma.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const addScheduleRow = () => {
    setData((current) => ({
      ...current,
      cronograma: [
        ...current.cronograma,
        { ...createEmptyScheduleRow(current.cronograma.length + 1), id: generateId("schedule") },
      ],
    }));
  };

  const removeScheduleRow = (id: string) => {
    setData((current) => ({
      ...current,
      cronograma: current.cronograma.filter((row) => row.id !== id),
    }));
  };

  const updateAnnex = (id: string, field: keyof Annex, value: string) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.map((annex) => (annex.id === id ? { ...annex, [field]: value } : annex)),
    }));
  };

  const updateAnnexFicha = (id: string, field: keyof Annex["fichaTecnica"], value: string) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.map((annex) =>
        annex.id === id
          ? { ...annex, fichaTecnica: { ...annex.fichaTecnica, [field]: value } }
          : annex
      ),
    }));
  };

  const addAnnex = () => {
    setData((current) => ({
      ...current,
      anexos: [
        ...current.anexos,
        {
          ...createEmptyAnnex(current.anexos.length),
          id: `A${current.anexos.length + 1}`,
          materiales: [{ ...createEmptyMaterial(current.anexos.length + 1), id: generateId("material") }],
        },
      ],
    }));
  };

  const removeAnnex = (id: string) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.filter((annex) => annex.id !== id),
      cronograma: current.cronograma.map((row) => (row.anexoId === id ? { ...row, anexoId: "" } : row)),
    }));
  };

  const addMaterial = (annexId: string) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.map((annex) =>
        annex.id === annexId
          ? {
              ...annex,
              materiales: [...annex.materiales, { ...createEmptyMaterial(annex.materiales.length + 1), id: generateId("material") }],
            }
          : annex
      ),
    }));
  };

  const updateMaterial = (
    annexId: string,
    materialId: string,
    field: "nombre" | "cantidad" | "detalle",
    value: string
  ) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.map((annex) =>
        annex.id === annexId
          ? {
              ...annex,
              materiales: annex.materiales.map((material) =>
                material.id === materialId ? { ...material, [field]: value } : material
              ),
            }
          : annex
      ),
    }));
  };

  const removeMaterial = (annexId: string, materialId: string) => {
    setData((current) => ({
      ...current,
      anexos: current.anexos.map((annex) =>
        annex.id === annexId
          ? { ...annex, materiales: annex.materiales.filter((material) => material.id !== materialId) }
          : annex
      ),
    }));
  };

  const handleGenerate = async () => {
    if (!data.actividad.titulo.trim()) {
      setError("El título de la actividad es obligatorio.");
      return;
    }
    if (!data.actividad.fecha.trim()) {
      setError("La fecha es obligatoria.");
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);

      const blob = await pdf(<ScoutActivityPdfDocument data={data} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = data.actividad.titulo.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "");

      link.href = blobUrl;
      link.download = `${safeTitle || "actividad-scout"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "No se pudo generar el PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderObjectiveSection = (section: ObjectiveSectionKey) => {
    const items = data[section];

    return (
      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{objectiveSectionLabels[section]}</h3>
          <button
            type="button"
            onClick={() => addObjective(section)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sin elementos cargados.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(event) => updateObjective(section, item.id, "nombre", event.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Nombre"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(section, item.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={item.descripcion}
                  onChange={(event) => updateObjective(section, item.id, "descripcion", event.target.value)}
                  rows={3}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Descripción"
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const educatorOptions = data.cabecera.equipoEducadores.filter(
    (educator) => educator.nombre.trim() || educator.cargo.trim()
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generador de PDF Scout</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Planificación modular con salida uniforme para diagnóstico, objetivos, cronograma, anexos y logística.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={18} />
            {isGenerating ? "Generando PDF..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Datos generales</h2>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la actividad</label>
                <input
                  type="text"
                  value={data.actividad.titulo}
                  onChange={(event) => updateActividad("titulo", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                <input
                  type="date"
                  value={data.actividad.fecha}
                  onChange={(event) => updateActividad("fecha", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lugar</label>
                <input
                  type="text"
                  value={data.actividad.lugar}
                  onChange={(event) => updateActividad("lugar", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cabecera persistente</h2>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo Scout</label>
                <input
                  type="text"
                  value={data.cabecera.grupoScout}
                  onChange={(event) => updateCabecera("grupoScout", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comunidad</label>
                <input
                  type="text"
                  value={data.cabecera.comunidad}
                  onChange={(event) => updateCabecera("comunidad", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Equipo de educadores</h3>
                <button
                  type="button"
                  onClick={addEducator}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Plus size={16} /> Agregar educador
                </button>
              </div>

              {data.cabecera.equipoEducadores.map((educator) => (
                <div key={educator.id} className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-[1fr_0.8fr_auto] dark:border-gray-700">
                  <input
                    type="text"
                    value={educator.nombre}
                    onChange={(event) => updateEducator(educator.id, "nombre", event.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={educator.cargo}
                    onChange={(event) => updateEducator(educator.id, "cargo", event.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Cargo"
                  />
                  <button
                    type="button"
                    onClick={() => removeEducator(educator.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Diagnóstico</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                <textarea
                  value={data.diagnostico.descripcion}
                  onChange={(event) => updateDiagnostico("descripcion", event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">¿Por qué se debe realizar esta actividad?</label>
                <textarea
                  value={data.diagnostico.porQueActividad}
                  onChange={(event) => updateDiagnostico("porQueActividad", event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">¿A qué responde?</label>
                <textarea
                  value={data.diagnostico.aQueResponde}
                  onChange={(event) => updateDiagnostico("aQueResponde", event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">¿Dónde se detectó la necesidad?</label>
                <textarea
                  value={data.diagnostico.dondeNecesidad}
                  onChange={(event) => updateDiagnostico("dondeNecesidad", event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">¿Por qué se eligió este lugar?</label>
                <textarea
                  value={data.diagnostico.porQueLugar}
                  onChange={(event) => updateDiagnostico("porQueLugar", event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Objetivos y áreas</h2>
            <div className="mt-4 space-y-4">
              {renderObjectiveSection("objetivosEducativos")}
              {renderObjectiveSection("objetivosDirigente")}
              {renderObjectiveSection("areasTrabajar")}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cronograma</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  El responsable se elige desde el equipo de educadores de cabecera.
                </p>
              </div>
              <button
                type="button"
                onClick={addScheduleRow}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Plus size={16} /> Agregar fila
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {data.cronograma.map((row) => (
                <div key={row.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[0.7fr_1.2fr_1.2fr_1fr_auto]">
                    <input
                      type="time"
                      value={row.hora}
                      onChange={(event) => updateSchedule(row.id, "hora", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      value={row.nombre}
                      onChange={(event) => updateSchedule(row.id, "nombre", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Nombre de actividad"
                    />
                    <select
                      value={row.responsableId}
                      onChange={(event) => updateSchedule(row.id, "responsableId", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Seleccionar responsable</option>
                      {educatorOptions.map((educator) => (
                        <option key={educator.id} value={educator.id}>
                          {getEducatorLabel(educator)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={row.anexoId ?? ""}
                      onChange={(event) => updateSchedule(row.id, "anexoId", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Sin anexo</option>
                      {data.anexos.map((annex) => (
                        <option key={annex.id} value={annex.id}>
                          {annex.id} - {annex.titulo || "Sin título"}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeScheduleRow(row.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Anexos</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Cada anexo se renderiza con el mismo diseño y aporta materiales a logística.
                </p>
              </div>
              <button
                type="button"
                onClick={addAnnex}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={16} /> Agregar anexo
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {data.anexos.map((annex) => (
                <div key={annex.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{annex.id}</p>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{annex.titulo || "Anexo sin título"}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAnnex(annex.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={annex.titulo}
                      onChange={(event) => updateAnnex(annex.id, "titulo", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Título del anexo"
                    />
                    <input
                      type="text"
                      value={annex.categoria}
                      onChange={(event) => updateAnnex(annex.id, "categoria", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Juego, Técnica, Celebración..."
                    />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <input
                      type="text"
                      value={annex.fichaTecnica.edad}
                      onChange={(event) => updateAnnexFicha(annex.id, "edad", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Edad"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={annex.fichaTecnica.participantes}
                      onChange={(event) =>
                        updateAnnexFicha(
                          annex.id,
                          "participantes",
                          event.target.value.replace(/[^0-9]/g, "")
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Participantes"
                    />
                    <input
                      type="text"
                      value={annex.fichaTecnica.duracion}
                      onChange={(event) => updateAnnexFicha(annex.id, "duracion", event.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Duración"
                    />
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Materiales</h4>
                      <button
                        type="button"
                        onClick={() => addMaterial(annex.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Plus size={16} /> Agregar material
                      </button>
                    </div>

                    <div className="mt-3 space-y-3">
                      {annex.materiales.map((material) => (
                        <div key={material.id} className="grid gap-3 md:grid-cols-[1fr_0.5fr_0.8fr_auto]">
                          <input
                            type="text"
                            value={material.nombre}
                            onChange={(event) => updateMaterial(annex.id, material.id, "nombre", event.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            placeholder="Nombre del material"
                          />
                          <input
                            type="text"
                            value={material.cantidad}
                            onChange={(event) => updateMaterial(annex.id, material.id, "cantidad", event.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            placeholder="Cantidad"
                          />
                          <input
                            type="text"
                            value={material.detalle ?? ""}
                            onChange={(event) => updateMaterial(annex.id, material.id, "detalle", event.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            placeholder="Detalle opcional"
                          />
                          <button
                            type="button"
                            onClick={() => removeMaterial(annex.id, material.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desarrollo detallado</label>
                    <textarea
                      value={annex.desarrollo}
                      onChange={(event) => updateAnnex(annex.id, "desarrollo", event.target.value)}
                      rows={6}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Describe el paso a paso del anexo, consignas, variantes y cuidados"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
