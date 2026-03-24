import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

const BUCKET_NAME = "documentos-scouts";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

type UploadType = "ddjj_salud" | "uso_imagen" | "retiro_solo" | "otros_documentos";

function extractPathFromUrl(fileUrl: string): string | null {
  try {
    const parsed = new URL(fileUrl);
    const marker = `/${BUCKET_NAME}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx < 0) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const fileUrl = req.nextUrl.searchParams.get("fileUrl") ?? "";
  const pathParam = req.nextUrl.searchParams.get("path") ?? "";

  const objectPath = pathParam || extractPathFromUrl(fileUrl) || "";
  if (!objectPath) return fail("Path de archivo inválido", 400);

  const { data, error } = await db.storage.from(BUCKET_NAME).createSignedUrl(objectPath, 60 * 5);
  if (error || !data?.signedUrl) return fail(error?.message ?? "No se pudo generar URL firmada", 400);

  return NextResponse.redirect(data.signedUrl);
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^a-z0-9._-]/g, "");
}

function extensionFromMime(type: string): string {
  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function pickFileName(type: UploadType, file: File): string {
  const safeOriginal = sanitizeFileName(file.name);

  if (type === "otros_documentos") {
    return `${Date.now()}-${safeOriginal}`;
  }

  const extension = safeOriginal.includes(".")
    ? safeOriginal.slice(safeOriginal.lastIndexOf(".") + 1) || extensionFromMime(file.type)
    : extensionFromMime(file.type);

  return `${type}.${extension}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const dniRaw = String(formData.get("dni") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim() as UploadType;
    const file = formData.get("file");

    const dni = Number(dniRaw);
    if (!Number.isInteger(dni) || dni <= 0) return fail("DNI inválido", 400);

    if (!type || !["ddjj_salud", "uso_imagen", "retiro_solo", "otros_documentos"].includes(type)) {
      return fail("Tipo de documento inválido", 400);
    }

    if (!(file instanceof File)) return fail("Archivo faltante", 400);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return fail("Formato inválido. Solo se permiten PDF, JPG, PNG o WEBP.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return fail("El archivo supera 5MB. Elegí uno más liviano.", 400);
    }

    const fileName = pickFileName(type, file);
    const path = `dni_${dni}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const payload = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await db.storage.from(BUCKET_NAME).upload(path, payload, {
      contentType: file.type,
      upsert: type !== "otros_documentos",
      cacheControl: "3600"
    });

    if (uploadError) return fail(uploadError.message, 400);

    const { data } = db.storage.from(BUCKET_NAME).getPublicUrl(path);
    if (!data?.publicUrl) return fail("No se pudo obtener la URL pública", 500);

    return ok({ publicUrl: data.publicUrl, path });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Error al subir archivo", 500);
  }
}
