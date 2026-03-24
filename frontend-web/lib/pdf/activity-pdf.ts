export type Educator = {
  id: string;
  nombre: string;
  cargo: string;
};

export type MaterialItem = {
  id: string;
  nombre: string;
  cantidad: string;
  detalle?: string;
};

export type Annex = {
  id: string;
  titulo: string;
  categoria: string;
  fichaTecnica: {
    edad: string;
    participantes: string;
    duracion: string;
  };
  materiales: MaterialItem[];
  desarrollo: string;
};

export type ObjectiveItem = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type DiagnosticData = {
  descripcion: string;
  porQueActividad: string;
  aQueResponde: string;
  dondeNecesidad: string;
  porQueLugar: string;
};

export type ScheduleRow = {
  id: string;
  hora: string;
  nombre: string;
  responsableId: string;
  anexoId?: string;
};

export type ActivityPdfData = {
  actividad: {
    titulo: string;
    fecha: string;
    lugar: string;
  };
  cabecera: {
    grupoScout: string;
    comunidad: string;
    equipoEducadores: Educator[];
  };
  diagnostico: DiagnosticData;
  objetivosEducativos: ObjectiveItem[];
  objetivosDirigente: ObjectiveItem[];
  areasTrabajar: ObjectiveItem[];
  cronograma: ScheduleRow[];
  anexos: Annex[];
};

export type AggregatedMaterial = {
  nombre: string;
  cantidad: string[];
  detalle: string[];
  usadoEn: string[];
};

function normalizeKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function getAnnexById(anexos: Annex[], anexoId?: string) {
  if (!anexoId) return null;
  return anexos.find((anexo) => anexo.id === anexoId) ?? null;
}

export function getEducatorById(educators: Educator[], educatorId?: string) {
  if (!educatorId) return null;
  return educators.find((educator) => educator.id === educatorId) ?? null;
}

export function getEducatorLabel(educator: Educator | null) {
  if (!educator) return "Sin asignar";
  const nombre = educator.nombre.trim() || "Educador";
  const cargo = educator.cargo.trim();
  return cargo ? `${nombre} (${cargo})` : nombre;
}

export function summarizeMaterials(materiales: MaterialItem[]) {
  if (materiales.length === 0) {
    return "Sin materiales definidos";
  }

  return materiales
    .map((material) => {
      const base = material.cantidad ? `${material.cantidad} ${material.nombre}` : material.nombre;
      return material.detalle ? `${base} (${material.detalle})` : base;
    })
    .join(", ");
}

export function getScheduleMaterialSummary(row: ScheduleRow, anexos: Annex[]) {
  const anexo = getAnnexById(anexos, row.anexoId);
  if (!anexo) {
    return "Sin anexo";
  }
  return summarizeMaterials(anexo.materiales);
}

export function aggregateLogistics(anexos: Annex[]) {
  const map = new Map<string, AggregatedMaterial>();

  for (const anexo of anexos) {
    for (const material of anexo.materiales) {
      const key = normalizeKey(material.nombre);
      const existing = map.get(key);

      if (existing) {
        if (material.cantidad) existing.cantidad.push(material.cantidad);
        if (material.detalle) existing.detalle.push(material.detalle);
        existing.usadoEn.push(anexo.titulo);
        continue;
      }

      map.set(key, {
        nombre: material.nombre,
        cantidad: material.cantidad ? [material.cantidad] : [],
        detalle: material.detalle ? [material.detalle] : [],
        usadoEn: [anexo.titulo],
      });
    }
  }

  return Array.from(map.values()).sort((left, right) => left.nombre.localeCompare(right.nombre));
}

export function createEmptyEducator(index: number): Educator {
  return {
    id: `educator-${index}`,
    nombre: "",
    cargo: "",
  };
}

export function createEmptyMaterial(index: number): MaterialItem {
  return {
    id: `material-${index}`,
    nombre: "",
    cantidad: "",
    detalle: "",
  };
}

export function createEmptyAnnex(index: number): Annex {
  return {
    id: `A${index + 1}`,
    titulo: "",
    categoria: "Juego",
    fichaTecnica: {
      edad: "",
      participantes: "",
      duracion: "",
    },
    materiales: [createEmptyMaterial(index)],
    desarrollo: "",
  };
}

export function createEmptyScheduleRow(index: number): ScheduleRow {
  return {
    id: `schedule-${index}`,
    hora: "",
    nombre: "",
    responsableId: "",
    anexoId: "",
  };
}

export function createEmptyObjective(index: number): ObjectiveItem {
  return {
    id: `objective-${index}`,
    nombre: "",
    descripcion: "",
  };
}

export function createInitialPdfData(): ActivityPdfData {
  return {
    actividad: {
      titulo: "Actividad de Comunidad Caminantes",
      fecha: "",
      lugar: "",
    },
    cabecera: {
      grupoScout: "Grupo Scout General Paz",
      comunidad: "Comunidad Caminantes Posta Antártida Argentina",
      equipoEducadores: [
        { id: "educator-1", nombre: "Marta Cáceres", cargo: "Subjefe" },
        { id: "educator-2", nombre: "", cargo: "" },
      ],
    },
    diagnostico: {
      descripcion: "",
      porQueActividad: "",
      aQueResponde: "",
      dondeNecesidad: "",
      porQueLugar: "",
    },
    objetivosEducativos: [createEmptyObjective(1)],
    objetivosDirigente: [createEmptyObjective(2)],
    areasTrabajar: [createEmptyObjective(3)],
    cronograma: [createEmptyScheduleRow(1), createEmptyScheduleRow(2)],
    anexos: [createEmptyAnnex(0)],
  };
}
