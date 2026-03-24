import type { Scout } from "@scout/shared-types";

export const PROMESA_OPTIONS = ["Sin promesa", "Con promesa sin pañuelo", "Con pañuelo"] as const;

export function normalizePromesa(promesa?: string | null): typeof PROMESA_OPTIONS[number] {
  const value = promesa?.trim();
  if (!value) return "Sin promesa";

  if (value === "Sin promesa") return "Sin promesa";
  if (value === "Con promesa sin pañuelo") return "Con promesa sin pañuelo";
  if (value === "Con pañuelo") return "Con pañuelo";

  if (value === "Promesa de Scout") return "Con pañuelo";
  if (value === "Promesa de Ventor") return "Con pañuelo";
  if (value === "Master Scout") return "Con pañuelo";

  return "Con pañuelo";
}

export function computeEdad(fechaNacimiento?: string): number {
  if (!fechaNacimiento) return 0;
  const age = ((Date.now() - new Date(fechaNacimiento).getTime()) / 31557600000) * 10;
  return Math.floor(age) / 10;
}

export function computeTadaEstado(tadaPuede?: boolean, tadaTiene?: boolean): Scout["tada_estado"] {
  if (tadaPuede && tadaTiene) return "Tiene";
  if (tadaPuede) return "Puede hacer";
  return "No puede";
}

export function normalizeTadaPuede(edad: number, explicitValue?: boolean): boolean {
  return explicitValue ?? edad >= 16;
}