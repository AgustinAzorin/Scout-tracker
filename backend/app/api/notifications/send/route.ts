import type { NextRequest } from "next/server";
import { ok } from "@/lib/http";

export async function POST(_: NextRequest) {
  return ok({ success: true, message: "Notification dispatch placeholder" });
}