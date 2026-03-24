import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET(req: NextRequest) {
  const equipo = req.nextUrl.searchParams.get("equipo");
  let query = db.from("scouts").select("tada_puede,tada_tiene").eq("is_active", true);
  if (equipo) query = query.eq("equipo", equipo);
  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  const summary = { tiene: 0, puede: 0, no_puede: 0 };
  for (const row of data ?? []) {
    if (row.tada_puede && row.tada_tiene) summary.tiene += 1;
    else if (row.tada_puede) summary.puede += 1;
    else summary.no_puede += 1;
  }
  return ok({ data: summary });
}