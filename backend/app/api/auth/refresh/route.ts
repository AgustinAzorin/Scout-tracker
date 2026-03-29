import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getBearerToken, isMobileClient, fail, ok } from "@/lib/http";
import { hashToken, signAccessToken, signRefreshToken, verifyAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const incomingRefresh = req.cookies.get("scout_refresh")?.value ?? getBearerToken(req);
  if (!incomingRefresh) return fail("Missing refresh token", 401);

  const incomingRefreshHash = hashToken(incomingRefresh);

  let userId = req.headers.get("x-user-id");
  if (!userId) {
    const accessToken = req.cookies.get("scout_access")?.value;
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        userId = payload.userId;
      } catch {
        userId = null;
      }
    }
  }
  let query = db
    .from("users")
    .select("id,role_id,equipo_asignado,refresh_token_hash,refresh_token_expires_at")
    .eq("refresh_token_hash", incomingRefreshHash);

  if (userId) {
    query = query.eq("id", userId);
  }

  const { data: user } = await query.maybeSingle();

  if (!user?.refresh_token_hash || !user.refresh_token_expires_at) return fail("Invalid refresh token", 401);
  if (user.refresh_token_hash !== incomingRefreshHash) return fail("Invalid refresh token", 401);
  if (new Date(user.refresh_token_expires_at).getTime() < Date.now()) return fail("Refresh token expired", 401);

  const newAccess = signAccessToken({ userId: user.id, roleId: user.role_id ?? undefined, equipo: user.equipo_asignado ?? undefined });
  const newRefresh = signRefreshToken();

  await db
    .from("users")
    .update({ refresh_token_hash: newRefresh.hash, refresh_token_expires_at: newRefresh.expiresAt })
    .eq("id", user.id);

  if (isMobileClient(req)) {
    return ok({ accessToken: newAccess, refreshToken: newRefresh.token });
  }

  const res = ok({ success: true });
  res.cookies.set("scout_access", newAccess, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  res.cookies.set("scout_refresh", newRefresh.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}