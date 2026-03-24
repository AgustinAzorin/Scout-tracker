"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getDocumentViewUrl, uploadScoutDocument } from "@/lib/storage";
import type { Scout } from "@/types/scout";

type OtrosDocumento = { name: string; url: string };
type MainDocumentField = "ddjj_salud" | "uso_imagen" | "retiro_solo";
type DocumentField = MainDocumentField | "otros_documentos";

interface SaveScoutResponse {
  scout: Scout;
}

interface DocumentUploaderProps {
  scout: Scout;
  field: DocumentField;
  title: string;
  existingUrl?: string;
  otherName?: string;
  onUpdated: (updatedScout: Scout) => void;
  disabled?: boolean;
}

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

export function DocumentUploader({ scout, field, title, existingUrl, otherName, onUpdated, disabled = false }: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persistDocument(file: File) {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const { publicUrl } = await uploadScoutDocument({
        dni: scout.dni ?? 0,
        file,
        type: field
      });

      const payload: {
        ddjj_salud?: string;
        uso_imagen?: string;
        retiro_solo?: string;
        otros_documentos?: OtrosDocumento[];
      } = {};

      if (field === "otros_documentos") {
        const cleanedName = otherName?.trim() || file.name;
        const prev = normalizeOtros(scout.otros_documentos);
        payload.otros_documentos = [...prev, { name: cleanedName, url: publicUrl }];
      } else {
        payload[field] = publicUrl;
      }

      const response = await apiFetch<SaveScoutResponse>(`/api/scouts/${scout.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      onUpdated(response.scout);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openPicker() {
    if (disabled || loading) return;
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {existingUrl ? (
          <a
            href={getDocumentViewUrl(existingUrl)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <FileText size={16} /> Ver actual
          </a>
        ) : null}

        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          title={title}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {existingUrl ? "Reemplazar" : "Subir archivo"}
        </button>

        {success ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 size={16} /> Subido
          </span>
        ) : null}

        <span className="text-xs text-neutral-500 dark:text-neutral-400">Acepta PDF, JPG, PNG o WEBP. Máx. 5MB.</span>
      </div>

      {error ? <p className="text-xs text-red-700 dark:text-red-300">{error}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          void persistDocument(file);
        }}
        disabled={disabled || loading}
      />
    </div>
  );
}
