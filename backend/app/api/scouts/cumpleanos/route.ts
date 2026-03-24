import { db } from "@/lib/db";
import { ok, fail } from "@/lib/http";

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export async function GET() {
  const { data, error } = await db.from("scouts").select("id,nombre,fecha_nacimiento").eq("is_active", true);
  if (error) return fail(error.message, 500);
  const grouped = Object.fromEntries(MONTHS.map((m) => [m, [] as unknown[]]));
  for (const scout of data ?? []) {
    const month = new Date(scout.fecha_nacimiento).getMonth();
    const key = MONTHS[month];
    grouped[key].push(scout);
  }
  return ok(grouped);
}