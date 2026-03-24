import { ok } from "@/lib/http";
import { pullFromSheets } from "@/lib/sheets-sync";

export async function POST() {
  const result = await pullFromSheets();
  return ok({ result });
}