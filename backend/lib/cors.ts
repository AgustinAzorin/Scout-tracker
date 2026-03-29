import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8081",
  process.env.FRONTEND_URL
].filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (!origin) return true; // native apps / no origin
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Expo dev clients often use exp://... or http://<ip>:1900x
  if (origin.startsWith("exp://")) return true;
  if (origin.includes(":1900")) return true;
  return false;
}

export function withCors(handler: (req: NextRequest) => any) {
  return async (req: NextRequest) => {
    const origin = req.headers.get("origin") || "";

    // Handle preflight
    if (req.method === "OPTIONS") {
      if (isAllowedOrigin(origin)) {
        return new NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": origin || "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400"
          }
        });
      }
      return new NextResponse(null, { status: 403 });
    }

    // Call the actual handler
    const response = await handler(req);

    // Add CORS headers to response
    if (isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Type");
    }

    return response;
  };
}
