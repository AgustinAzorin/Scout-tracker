import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, humanizeDbError, humanizeZodIssue, ok } from "@/lib/http";
import { scoutUpdateSchema } from "@scout/shared-utils";
import { pushToSheets } from "@/lib/sheets-sync";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await db.from("scouts").select("*").eq("id", params.id).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return fail("Scout not found", 404);
  return ok({ scout: data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = scoutUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return fail(humanizeZodIssue(parsed.error.issues[0]), 400);

  const { data, error } = await db.from("scouts").update(parsed.data).eq("id", params.id).select("*").single();
  if (error) return fail(humanizeDbError(error.message), 400);
  await pushToSheets(params.id, parsed.data);
  return ok({ scout: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await db.from("scouts").update({ is_active: false }).eq("id", params.id);
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}