export interface Scout {
  id: string;
  numero: number;
  nombre: string;
  dni: number;
  fecha_nacimiento: string;
  tel_emergencias?: string;
  tel_emergencias_2?: string;
  tel_propio?: string;
  religion?: string;
  categoria_miembro?: string;
  dia_cumple?: number;
  edad: number;
  va: boolean;
  pdf_url?: string;
  equipo: string;
  promesa?: string;
  etapa?: string;
  elemento?: "Fuego" | "Tierra" | "Agua" | "Aire";
  raid?: string;
  cordi?: string;
  guardian?: string;
  diario_marcha?: string;
  rol_comunidad?: string;
  tada_puede: boolean;
  tada_tiene: boolean;
  tada_estado: "Tiene" | "Puede hacer" | "No puede";
  mistica?: string;
  ingreso_movimiento?: "Manada" | "Unidad" | "Caminantes";
  distrito?: boolean;
  afiliacion?: boolean;
  cuota_social?: Record<string, boolean | null>;
  retiro_solo?: string;
  ddjj_salud?: string;
  uso_imagen?: string;
  otros_documentos?: Array<{ name: string; url: string }>;
  logo_elemento?: string;
  logo_promesa?: string;
  is_active: boolean;
}

export interface Equipo {
  id: string;
  nombre: string;
  logo_url?: string;
  descripcion?: string;
}

export interface Role {
  id: string;
  nombre: string;
  permisos: Record<string, Record<"ver" | "editar" | "crear" | "eliminar", boolean>>;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  equipo_asignado?: string;
  is_active: boolean;
}

export interface CalendarEvent {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: "reunion" | "cumpleanos" | "campamento" | "raid" | "feriado" | "recordatorio";
  color?: string;
  equipo_destinatario?: string;
  notificacion_antelacion_minutos?: number;
  es_cumpleanos: boolean;
  scout_id?: string;
}

export interface PdfTemplate {
  id: string;
  nombre_grupo: string;
  nombre_comunidad: string;
  equipo_educadores: Array<{ nombre: string; cargo: string }>;
  diagnostico_rama: string;
}

export interface GrillaRow {
  hora: string;
  actividad: string;
  anexo?: number | null;
}

export interface Anexo {
  numero: number;
  titulo: string;
  categoria: "Juego activo" | "Integracion" | "Construccion" | "Tecnica";
  edad: string;
  participantes: number;
  duracion: string;
  espacio: string;
  educadores: number;
  objetivos: string;
  motivacion: string;
  materiales: string;
  desarrollo: string;
}