import cron from "node-cron";

export interface SyncResult {
  filas_actualizadas: number;
  filas_sin_cambios: number;
  errores?: string;
}

export const COLUMN_MAP: Record<number, string> = {
  1: "numero",
  2: "nombre",
  3: "dni",
  4: "fecha_nacimiento",
  5: "tel_emergencias",
  6: "religion",
  7: "categoria_miembro",
  8: "dia_cumple",
  10: "va",
  11: "pdf_url",
  12: "tel_emergencias_2",
  13: "tel_propio",
  14: "equipo",
  15: "promesa",
  16: "etapa",
  17: "elemento",
  18: "raid",
  19: "cordi",
  20: "guardian",
  21: "diario_marcha",
  22: "rol_comunidad",
  23: "tada_puede",
  24: "tada_tiene",
  26: "mistica",
  27: "ingreso_movimiento",
  28: "distrito",
  29: "afiliacion",
  30: "cuota_social",
  31: "retiro_solo",
  32: "ddjj_salud",
  33: "uso_imagen"
};

export async function pullFromSheets(): Promise<SyncResult> {
  return {
    filas_actualizadas: 0,
    filas_sin_cambios: 0,
    errores: "Not implemented: configure GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON and syncing logic"
  };
}

export async function pushToSheets(_scoutId: string, _updatedFields: Record<string, unknown>): Promise<void> {
  return;
}

export function startSyncScheduler() {
  cron.schedule("*/3 * * * *", async () => {
    await pullFromSheets();
  });
}