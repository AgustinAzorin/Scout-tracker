import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await db.from("events").select("*").eq("id", params.id).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return fail("Event not found", 404);
  return ok({ event: data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await db.from("events").update(body).eq("id", params.id).eq("es_cumpleanos", false).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ event: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await db.from("events").delete().eq("id", params.id).eq("es_cumpleanos", false);
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}