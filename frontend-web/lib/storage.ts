const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

type MainDocumentType = "ddjj_salud" | "uso_imagen" | "retiro_solo";
export type ScoutDocumentType = MainDocumentType | "otros_documentos";

function validateFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Formato inválido. Solo se permiten PDF, JPG, PNG o WEBP.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("El archivo supera 5MB. Elegí uno más liviano.");
  }
}

interface UploadScoutDocumentInput {
  dni: number;
  file: File;
  type: ScoutDocumentType;
}

interface UploadScoutDocumentResult {
  publicUrl: string;
  path: string;
}

export function getDocumentViewUrl(fileUrl: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return fileUrl;
  if (!fileUrl || fileUrl.startsWith("data:")) return fileUrl;

  return `${backendUrl}/api/storage/scout-document?fileUrl=${encodeURIComponent(fileUrl)}`;
}

export async function uploadScoutDocument({ dni, file, type }: UploadScoutDocumentInput): Promise<UploadScoutDocumentResult> {
  if (!Number.isFinite(dni) || dni <= 0) {
    throw new Error("El scout no tiene un DNI válido para organizar el archivo.");
  }

  validateFile(file);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error("Falta NEXT_PUBLIC_BACKEND_URL en frontend-web/.env.local");

  const formData = new FormData();
  formData.append("dni", String(dni));
  formData.append("type", type);
  formData.append("file", file);

  const response = await fetch(`${backendUrl}/api/storage/scout-document`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  const payload = (await response.json().catch(() => null)) as
    | { publicUrl?: string; path?: string; error?: string }
    | null;

  if (!response.ok) {
    const message = payload?.error || "No se pudo subir el archivo";
    throw new Error(message);
  }

  if (!payload?.publicUrl || !payload.path) {
    throw new Error("No se recibió la URL pública del archivo");
  }

  return { publicUrl: payload.publicUrl, path: payload.path };
}

export function isSupportedDocument(file: File): boolean {
  return ALLOWED_MIME_TYPES.includes(file.type);
}
