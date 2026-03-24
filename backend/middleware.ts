import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8081",
  process.env.FRONTEND_WEB_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

function addCorsHeaders(response: NextResponse, origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Type");
  }
  return response;
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "null",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  const response = NextResponse.next();
  return addCorsHeaders(response, origin);
}

export const config = {
  matcher: ["/api/:path*"]
};
