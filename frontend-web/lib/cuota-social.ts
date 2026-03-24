export const MESES_CUOTA = [
  { key: "abril",      label: "Abril",      mes: 4  },
  { key: "mayo",       label: "Mayo",       mes: 5  },
  { key: "junio",      label: "Junio",      mes: 6  },
  { key: "julio",      label: "Julio",      mes: 7  },
  { key: "agosto",     label: "Agosto",     mes: 8  },
  { key: "septiembre", label: "Septiembre", mes: 9  },
  { key: "octubre",    label: "Octubre",    mes: 10 },
  { key: "noviembre",  label: "Noviembre",  mes: 11 },
  { key: "diciembre",  label: "Diciembre",  mes: 12 },
] as const;

/** Returns true if today is past the 5th of that month in the current year. */
export function isMesVencido(mes: number, today: Date = new Date()): boolean {
  const vencimiento = new Date(today.getFullYear(), mes - 1, 5);
  return today >= vencimiento;
}

/**
 * "pagado"    — all overdue months are paid (no arrears).
 * "parcial"   — some overdue months paid, at least one not paid.
 * "no-pagadas"— at least one overdue month with zero months paid.
 */
export type CuotaSocialStatus = "pagado" | "parcial" | "no-pagadas";

export function getCuotaSocialStatus(
  cuotaSocial: Record<string, boolean | null> | undefined,
  today: Date = new Date()
): CuotaSocialStatus {
  const atrasados = MESES_CUOTA.filter(
    (m) => isMesVencido(m.mes, today) && !cuotaSocial?.[m.key]
  );
  const pagadas = MESES_CUOTA.filter((m) => Boolean(cuotaSocial?.[m.key]));

  if (atrasados.length === 0) return "pagado";
  if (pagadas.length === 0) return "no-pagadas";
  return "parcial";
}
