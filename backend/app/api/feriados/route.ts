import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  let query = db.from("feriados").select("id,fecha,nombre,tipo").order("fecha", { ascending: true });
  if (start) query = query.gte("fecha", start);
  if (end) query = query.lte("fecha", end);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  return ok({ feriados: data ?? [] });
}
