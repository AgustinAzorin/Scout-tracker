import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return fail("Unauthorized", 401);
  const body = await req.json();
  const payload = { ...body, user_id: userId };
  const { error } = await db.from("push_subscriptions").upsert(payload, { onConflict: "user_id,platform" });
  if (error) return fail(error.message, 500);
  return ok({ success: true });
}