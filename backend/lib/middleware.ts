import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const requestOrigin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const allowed = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] ?? "*";
  res.headers.set("Access-Control-Allow-Origin", allowed);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  return res;
}

export function optionsOk(req: NextRequest): NextResponse {
  return withCors(req, new NextResponse(null, { status: 204 }));
}