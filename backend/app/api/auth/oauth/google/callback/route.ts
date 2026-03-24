import { NextResponse } from "next/server";

export async function GET() {
  const frontendUrl = process.env.FRONTEND_WEB_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${frontendUrl}/`);
}