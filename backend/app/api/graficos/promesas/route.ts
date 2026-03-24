import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";
import { normalizePromesa } from "@scout/shared-utils";

export async function GET() {
  const { data, error } = await db.from("scouts").select("promesa").eq("is_active", true);
  if (error) return fail(error.message, 500);

  const grouped = new Map<string, number>();
  for (const row of data ?? []) {
    const key = normalizePromesa(row.promesa);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return ok({ data: [...grouped.entries()].map(([promesa, count]) => ({ promesa, count, logo_url: null })) });
}