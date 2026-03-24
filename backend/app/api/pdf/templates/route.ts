import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("pdf_templates").select("*").order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return ok({ templates: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await db.from("pdf_templates").insert(body).select("*").single();
  if (error) return fail(error.message, 500);
  return ok({ template: data }, 201);
}