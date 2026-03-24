import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db
    .from("equipos")
    .select("id,nombre,logo_url,descripcion,scouts(count)")
    .order("nombre", { ascending: true });
  if (error) return fail(error.message, 500);
  return ok({ equipos: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await db.from("equipos").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ equipo: data }, 201);
}