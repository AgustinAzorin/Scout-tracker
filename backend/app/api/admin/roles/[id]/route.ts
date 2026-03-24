import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await db.from("roles").update(body).eq("id", params.id).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ role: data });
}