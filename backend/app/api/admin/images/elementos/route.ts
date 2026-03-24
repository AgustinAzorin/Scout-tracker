import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { error } = await db.from("element_images").upsert(body, { onConflict: "elemento" });
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}