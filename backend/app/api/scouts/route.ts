import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, humanizeDbError, humanizeZodIssue, ok } from "@/lib/http";
import { scoutCreateSchema } from "@scout/shared-utils";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 20);
  const offset = (page - 1) * limit;
  const teamScope = req.headers.get("x-user-equipo");

  let query = db.from("scouts").select("*", { count: "exact" }).eq("is_active", true);
  if (teamScope) query = query.eq("equipo", teamScope);
  if (params.get("equipo")) query = query.eq("equipo", params.get("equipo"));
  if (params.get("elemento")) query = query.eq("elemento", params.get("elemento"));
  if (params.get("etapa")) query = query.eq("etapa", params.get("etapa"));
  if (params.get("promesa")) query = query.eq("promesa", params.get("promesa"));

  const search = params.get("search");
  if (search) query = query.or(`nombre.ilike.%${search}%,dni.eq.${Number(search) || 0}`);

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) return fail(error.message, 500);
  return ok({ data: data ?? [], total: count ?? 0, page });
}

export async function POST(req: NextRequest) {
  const parsed = scoutCreateSchema.safeParse(await req.json());
  if (!parsed.success) return fail(humanizeZodIssue(parsed.error.issues[0]), 400);

  const payload = { ...parsed.data };
  if (!payload.nombre?.trim()) return fail("El nombre es obligatorio.", 400);
  if (!payload.equipo?.trim()) return fail("El equipo es obligatorio.", 400);

  if (payload.numero == null) {
    const { data: lastScout, error: lastScoutError } = await db
      .from("scouts")
      .select("numero")
      .order("numero", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastScoutError) return fail(humanizeDbError(lastScoutError.message), 400);

    payload.numero = typeof lastScout?.numero === "number" ? lastScout.numero + 1 : 1;
  }

  const { data, error } = await db.from("scouts").insert(payload).select("*").single();
  if (error) return fail(humanizeDbError(error.message), 400);
  return ok({ scout: data }, 201);
}