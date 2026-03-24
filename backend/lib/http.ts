import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodIssue } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getBearerToken(req: NextRequest): string | undefined {
  const header = req.headers.get("authorization");
  if (!header) return undefined;
  return header.replace(/^Bearer\s+/i, "");
}

export function isMobileClient(req: NextRequest): boolean {
  const accept = req.headers.get("accept") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";
  return accept.includes("application/json") || /expo|reactnative|okhttp/i.test(userAgent);
}

export function humanizeDbError(message: string): string {
  if (/invalid input syntax for type bigint/i.test(message)) {
    return "El DNI ingresado no es válido. Debe tener 8 dígitos numéricos.";
  }

  if (/duplicate key value violates unique constraint/i.test(message) && /dni/i.test(message)) {
    return "Ya existe un scout con ese DNI.";
  }

  if (/violates not-null constraint/i.test(message) && /nombre/i.test(message)) {
    return "El nombre del scout es obligatorio.";
  }

  if (/violates foreign key constraint/i.test(message) && /equipo/i.test(message)) {
    return "El equipo seleccionado no existe.";
  }

  return "No se pudo guardar los datos. Revisá los campos e intentá de nuevo.";
}

export function humanizeZodIssue(issue: ZodIssue | undefined): string {
  if (!issue) return "Los datos enviados no son válidos.";

  const field = String(issue.path?.[0] ?? "");

  if (field === "dni") {
    return "El DNI debe ser un número de 8 dígitos.";
  }

  if (field === "nombre") {
    return "El nombre es obligatorio.";
  }

  if (field === "equipo") {
    return "El equipo es obligatorio.";
  }

  if (field === "tel_propio") {
    return "El teléfono propio debe tener 8 dígitos en formato 1234-5678.";
  }

  if (field === "tel_emergencias") {
    return "El teléfono de emergencia debe tener 8 dígitos en formato 1234-5678.";
  }

  if (field === "tel_emergencias_2") {
    return "El teléfono de emergencia 2 debe tener 8 dígitos en formato 1234-5678.";
  }

  return "Hay campos con formato inválido. Revisá e intentá nuevamente.";
}