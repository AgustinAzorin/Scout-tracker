import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { fail, getBearerToken, ok } from "@/lib/http";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("scout_access")?.value ?? getBearerToken(req);
  if (!token) return fail("Unauthorized", 401);

  try {
    const payload = verifyAccessToken(token);
    await db.from("users").update({ refresh_token_hash: null, refresh_token_expires_at: null }).eq("id", payload.userId);

    const res = ok({ success: true });
    res.cookies.set("scout_access", "", { expires: new Date(0), path: "/" });
    res.cookies.set("scout_refresh", "", { expires: new Date(0), path: "/" });
    return res;
  } catch {
    return fail("Unauthorized", 401);
  }
}