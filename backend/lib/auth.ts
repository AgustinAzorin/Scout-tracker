// @ts-ignore - bcryptjs lacks proper type definitions
const bcrypt = require("bcryptjs");
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { randomUUID, createHash } from "node:crypto";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "dev-secret-change-this-in-prod";
const JWT_EXPIRY: string = process.env.JWT_EXPIRY ?? "1h";
const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS ?? 7);

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  roleId?: string;
  equipo?: string;
  permisos?: Record<string, unknown>;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRY as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken() {
  const token = randomUUID();
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return { token, hash, expiresAt };
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}