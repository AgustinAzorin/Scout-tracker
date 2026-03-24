import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, signAccessToken, signRefreshToken } from "@/lib/auth";
import { loginSchema } from "@scout/shared-utils";
import { fail, isMobileClient, ok } from "@/lib/http";

export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) return fail("Invalid payload", 400);

  const { data: user, error } = await db
    .from("users")
    .select("id,nombre,email,password_hash,role_id,equipo_asignado")
    .eq("email", parsed.data.email)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !user?.password_hash) return fail("Invalid credentials", 401);
  const valid = await comparePassword(parsed.data.password, user.password_hash);
  if (!valid) return fail("Invalid credentials", 401);

  const accessToken = signAccessToken({
    userId: user.id,
    roleId: user.role_id ?? undefined,
    equipo: user.equipo_asignado ?? undefined
  });
  const refreshToken = signRefreshToken();

  await db
    .from("users")
    .update({
      refresh_token_hash: refreshToken.hash,
      refresh_token_expires_at: refreshToken.expiresAt
    })
    .eq("id", user.id);

  if (isMobileClient(req)) {
    return ok({
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role_id: user.role_id,
        equipo_asignado: user.equipo_asignado
      }
    });
  }

  const res = ok({
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role_id: user.role_id,
      equipo_asignado: user.equipo_asignado
    }
  });

  res.cookies.set("scout_access", accessToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  res.cookies.set("scout_refresh", refreshToken.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}