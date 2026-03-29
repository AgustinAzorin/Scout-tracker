import type { NextRequest } from "next/server";
import { generateActivityPdf } from "@/lib/pdf-generator";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pdfBuffer = await generateActivityPdf("Planificacion de Actividad", JSON.stringify(body));
  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=actividad.pdf"
    }
  });
}