"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getDocumentViewUrl } from "@/lib/storage";
import type { Scout } from "@/types/scout";
import { DocumentUploader } from "@/components/scouts/DocumentUploader";

type OtrosDocumento = { name: string; url: string };

interface ScoutDocumentationModalProps {
  scout: Scout | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedScout: Scout) => void;
}

interface SaveScoutResponse {
  scout: Scout;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function normalizeOtros(value: Scout["otros_documentos"]): OtrosDocumento[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const rawName = (item as { name?: unknown; nombre?: unknown }).name ?? (item as { nombre?: unknown }).nombre;
      return {
        name: typeof rawName === "string" ? rawName : "",
        url: typeof (item as { url?: unknown }).url === "string" ? (item as { url: string }).url : ""
      };
    })
    .filter((item) => item.name.length > 0 && item.url.length > 0);
}

export function ScoutDocumentationModal({ scout, isOpen, onClose, onUpdated }: ScoutDocumentationModalProps) {
  const scoutId = scout?.id;
  const [ddjjSalud, setDdjjSalud] = useState("");
  const [usoImagen, setUsoImagen] = useState("");
  const [retiroSolo, setRetiroSolo] = useState("");
  const [otros, setOtros] = useState<OtrosDocumento[]>([]);
  const [otroNombre, setOtroNombre] = useState("");
  const [otroUrl, setOtroUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scout) return;
    setDdjjSalud(scout.ddjj_salud ?? "");
    setUsoImagen(scout.uso_imagen ?? "");
    setRetiroSolo(scout.retiro_solo ?? "");
    setOtros(normalizeOtros(scout.otros_documentos));
    setOtroNombre("");
    setOtroUrl("");
    setError(null);
  }, [scout]);

  const docsResumen = useMemo(() => {
    let total = 0;
    if (ddjjSalud) total += 1;
    if (usoImagen) total += 1;
    if (retiroSolo) total += 1;
    total += otros.length;
    return total;
  }, [ddjjSalud, usoImagen, retiroSolo, otros]);

  if (!isOpen || !scout) return null;

  function handleScoutUpdated(updatedScout: Scout) {
    onUpdated(updatedScout);
    setDdjjSalud(updatedScout.ddjj_salud ?? "");
    setUsoImagen(updatedScout.uso_imagen ?? "");
    setRetiroSolo(updatedScout.retiro_solo ?? "");
    setOtros(normalizeOtros(updatedScout.otros_documentos));
    setError(null);
  }

  async function saveChanges(next: { ddjj_salud?: string; uso_imagen?: string; retiro_solo?: string; otros_documentos?: OtrosDocumento[] }) {
    if (!scoutId) return;
    setSaving(true);
    setError(null);

    try {
      const response = await apiFetch<SaveScoutResponse>(`/api/scouts/${scoutId}`, {
        method: "PUT",
        body: JSON.stringify(next)
      });
      handleScoutUpdated(response.scout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los documentos");
    } finally {
      setSaving(false);
    }
  }

  async function clearMain(kind: "ddjj_salud" | "uso_imagen" | "retiro_solo") {
    await saveChanges({
      ddjj_salud: kind === "ddjj_salud" ? "" : ddjjSalud,
      uso_imagen: kind === "uso_imagen" ? "" : usoImagen,
      retiro_solo: kind === "retiro_solo" ? "" : retiroSolo,
      otros_documentos: otros
    });
  }

  async function addOtroByLink() {
    const nombre = otroNombre.trim();
    const url = otroUrl.trim();
    if (!nombre || !url) {
      setError("Para agregar en Otros, completá nombre y enlace.");
      return;
    }

    const next = [...otros, { name: nombre, url }];
    await saveChanges({
      ddjj_salud: ddjjSalud,
      uso_imagen: usoImagen,
      retiro_solo: retiroSolo,
      otros_documentos: next
    });
    setOtroNombre("");
    setOtroUrl("");
  }

  async function removeOtro(index: number) {
    const next = otros.filter((_, idx) => idx !== index);
    await saveChanges({
      ddjj_salud: ddjjSalud,
      uso_imagen: usoImagen,
      retiro_solo: retiroSolo,
      otros_documentos: next
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X size={20} />
        </button>

        <div className="mb-5 pr-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Documentación</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {scout.nombre} · {docsResumen} documento{docsResumen === 1 ? "" : "s"} cargado{docsResumen === 1 ? "" : "s"}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Declaración jurada de salud</h3>
              {ddjjSalud ? (
                <button
                  type="button"
                  onClick={() => clearMain("ddjj_salud")}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              ) : null}
            </div>
            <div className="mt-3">
              <DocumentUploader
                scout={scout}
                field="ddjj_salud"
                title="Subir DDJJ"
                existingUrl={ddjjSalud || undefined}
                onUpdated={handleScoutUpdated}
                disabled={saving}
              />
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Autorización de uso de imagen</h3>
              {usoImagen ? (
                <button
                  type="button"
                  onClick={() => clearMain("uso_imagen")}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              ) : null}
            </div>
            <div className="mt-3">
              <DocumentUploader
                scout={scout}
                field="uso_imagen"
                title="Subir autorización de imagen"
                existingUrl={usoImagen || undefined}
                onUpdated={handleScoutUpdated}
                disabled={saving}
              />
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Autorización para retirarse solo</h3>
              {retiroSolo ? (
                <button
                  type="button"
                  onClick={() => clearMain("retiro_solo")}
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              ) : null}
            </div>
            <div className="mt-3">
              <DocumentUploader
                scout={scout}
                field="retiro_solo"
                title="Subir autorización de retiro"
                existingUrl={retiroSolo || undefined}
                onUpdated={handleScoutUpdated}
                disabled={saving}
              />
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Otros</h3>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                type="text"
                value={otroNombre}
                onChange={(e) => setOtroNombre(e.target.value)}
                placeholder="Nombre del documento"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
              <input
                type="text"
                value={otroUrl}
                onChange={(e) => setOtroUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void addOtroByLink();
                  }
                }}
                placeholder="Enlace del documento"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Para agregar por enlace en Otros, completá nombre y enlace y presioná Enter.</p>

            <div className="mt-3">
              <DocumentUploader
                scout={scout}
                field="otros_documentos"
                title="Subir documento en Otros"
                otherName={otroNombre}
                onUpdated={handleScoutUpdated}
                disabled={saving}
              />
            </div>

            <div className="mt-4 space-y-2">
              {otros.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Sin documentos en Otros.</p>
              ) : (
                otros.map((doc, index) => (
                  <div key={`${doc.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{doc.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={getDocumentViewUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        <ExternalLink size={14} /> Ver
                      </a>
                      <button
                        type="button"
                        onClick={() => removeOtro(index)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
