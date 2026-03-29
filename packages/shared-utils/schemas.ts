import { z } from "zod";

const PHONE_REGEX = /^(\+54\s9\s11\s)?\d{4}-\d{4}$/;

export const scoutUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  dni: z.number().int().gte(10000000).lte(99999999).optional(),
  fecha_nacimiento: z.string().optional(),
  equipo: z.string().optional(),
  tel_emergencias: z.string().regex(PHONE_REGEX, "Formato inválido").optional(),
  tel_emergencias_2: z.string().regex(PHONE_REGEX, "Formato inválido").optional(),
  tel_propio: z.string().regex(PHONE_REGEX, "Formato inválido").optional(),
  religion: z.string().optional(),
  promesa: z.string().optional(),
  etapa: z.string().optional(),
  raid: z.string().optional(),
  ingreso_movimiento: z.enum(["Manada", "Unidad", "Caminantes"]).optional(),
  elemento: z.enum(["Fuego", "Tierra", "Agua", "Aire"]).optional(),
  va: z.boolean().optional(),
  tada_puede: z.boolean().optional(),
  tada_tiene: z.boolean().optional(),
  cuota_social: z.record(z.boolean().nullable()).optional(),
  distrito: z.boolean().optional(),
  afiliacion: z.boolean().optional(),
  ddjj_salud: z.string().optional(),
  uso_imagen: z.string().optional(),
  retiro_solo: z.string().optional(),
  otros_documentos: z.array(z.union([
    z.object({
      name: z.string().min(1),
      url: z.string().min(1)
    }),
    z.object({
      nombre: z.string().min(1),
      url: z.string().min(1)
    })
  ])).optional(),
  is_active: z.boolean().optional()
});

export const scoutCreateSchema = scoutUpdateSchema.extend({
  numero: z.number().int().positive().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const eventSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime().optional(),
  tipo: z.enum(["reunion", "cumpleanos", "campamento", "raid", "feriado", "recordatorio"]),
  color: z.string().optional(),
  equipo_destinatario: z.string().optional(),
  notificacion_antelacion_minutos: z.number().int().nonnegative().optional()
});