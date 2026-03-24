import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const { data, error } = await db.from("sync_log").select("*").order("ejecutado_at", { ascending: false }).limit(50);
  if (error) return fail(error.message, 500);
  return ok({ data: data ?? [] });
}