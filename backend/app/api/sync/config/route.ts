import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("sync_config").select("*").eq("id", 1).maybeSingle();
  if (error) return fail(error.message, 500);
  return ok({ config: data });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await db.from("sync_config").update(body).eq("id", 1).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ config: data });
}