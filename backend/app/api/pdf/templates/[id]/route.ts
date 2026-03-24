import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await db.from("pdf_templates").select("*").eq("id", params.id).maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) return fail("Template not found", 404);
  return ok({ template: data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await db.from("pdf_templates").update(body).eq("id", params.id).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ template: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await db.from("pdf_templates").delete().eq("id", params.id);
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}