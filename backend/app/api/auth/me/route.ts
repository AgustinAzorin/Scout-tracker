import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { fail, getBearerToken, ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("scout_access")?.value ?? getBearerToken(req);
  if (!token) return fail("Unauthorized", 401);

  try {
    const payload = verifyAccessToken(token);
    const { data: user } = await db
      .from("users")
      .select("id,nombre,email,role_id,equipo_asignado,is_active")
      .eq("id", payload.userId)
      .maybeSingle();

    if (!user) return fail("User not found", 404);
    return ok({ user });
  } catch {
    return fail("Unauthorized", 401);
  }
}