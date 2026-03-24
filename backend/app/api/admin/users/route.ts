import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("users").select("id,nombre,email,role_id,coordinador,is_active");
  if (error) return fail(error.message, 500);
  return ok({ users: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.password) body.password_hash = await hashPassword(body.password);
  delete body.password;
  const { data, error } = await db.from("users").insert(body).select("id,nombre,email,role_id,coordinador,is_active").single();
  if (error) return fail(error.message, 500);
  return ok({ user: data }, 201);
}