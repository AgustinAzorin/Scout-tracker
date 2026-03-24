import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("notifications_log").select("*").order("enviado_at", { ascending: false }).limit(100);
  if (error) return fail(error.message, 500);
  return ok({ data: data ?? [] });
}