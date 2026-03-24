import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET(req: NextRequest) {
  const equipo = req.nextUrl.searchParams.get("equipo");
  let query = db.from("scouts").select("fecha_nacimiento").eq("is_active", true);
  if (equipo) query = query.eq("equipo", equipo);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  const counts = new Map<number, number>();
  for (const scout of data ?? []) {
    const age = Math.floor((Date.now() - new Date(scout.fecha_nacimiento).getTime()) / 31557600000);
    counts.set(age, (counts.get(age) ?? 0) + 1);
  }

  return ok({ data: [...counts.entries()].map(([edad, count]) => ({ edad, count })) });
}