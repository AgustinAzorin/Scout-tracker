import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { eventSchema } from "@scout/shared-utils";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");
  const tipo = req.nextUrl.searchParams.get("tipo");
  let query = db.from("events").select("*").order("fecha_inicio", { ascending: true });
  if (start) query = query.gte("fecha_inicio", start);
  if (end) query = query.lte("fecha_inicio", end);
  if (tipo) query = query.eq("tipo", tipo);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok({ events: data ?? [] });
}

export async function POST(req: NextRequest) {
  const parsed = eventSchema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid payload", 400);
  const { data, error } = await db.from("events").insert(parsed.data).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ event: data }, 201);
}