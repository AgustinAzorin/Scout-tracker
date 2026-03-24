import type { Role } from "@scout/shared-types";

export function hasPermission(
  role: Role,
  module: string,
  action: "ver" | "editar" | "crear" | "eliminar"
): boolean {
  return role.permisos?.[module]?.[action] === true;
}