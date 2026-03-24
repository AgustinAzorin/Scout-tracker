import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET(_: NextRequest, { params }: { params: { nombre: string } }) {
  const { data, error } = await db.from("equipos").select("*").eq("nombre", params.nombre).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return fail("Team not found", 404);
  return ok({ equipo: data });
}

export async function PUT(req: NextRequest, { params }: { params: { nombre: string } }) {
  const body = await req.json();
  const { data, error } = await db.from("equipos").update(body).eq("nombre", params.nombre).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ equipo: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { nombre: string } }) {
  const { error: scoutError } = await db.from("scouts").update({ equipo: null }).eq("equipo", params.nombre);
  if (scoutError) return fail(scoutError.message, 500);
  const { error } = await db.from("equipos").delete().eq("nombre", params.nombre);
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}