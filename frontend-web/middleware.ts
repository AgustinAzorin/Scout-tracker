import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite rutas públicas sin validación
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Las rutas protegidas serán validadas por la API del backend
  // Si no hay token, la API retornará 401 y se redirigirá a /login desde ahí
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"]
};