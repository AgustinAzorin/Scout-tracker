import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("roles").select("*");
  if (error) return fail(error.message, 500);
  return ok({ roles: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await db.from("roles").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ role: data }, 201);
}