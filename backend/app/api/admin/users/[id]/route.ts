import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await db
    .from("users")
    .update(body)
    .eq("id", params.id)
    .select("id,nombre,email,role_id,coordinador,is_active")
    .single();
  if (error) return fail(error.message, 500);
  return ok({ user: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await db.from("users").update({ is_active: false }).eq("id", params.id);
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}