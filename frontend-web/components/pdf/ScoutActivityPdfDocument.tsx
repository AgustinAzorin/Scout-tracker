import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  aggregateLogistics,
  getEducatorById,
  getEducatorLabel,
  getScheduleMaterialSummary,
  type ActivityPdfData,
  type Annex,
  type ObjectiveItem,
} from "@/lib/pdf/activity-pdf";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 34,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
    lineHeight: 1.45,
    backgroundColor: "#ffffff",
  },
  hero: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    border: "1 solid #bfdbfe",
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
  },
  heroMeta: {
    marginTop: 5,
    fontSize: 10,
    color: "#334155",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 10,
    border: "1 solid #e5e7eb",
    padding: 11,
    marginBottom: 9,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 10,
    color: "#1f2937",
  },
  smallText: {
    fontSize: 9,
    color: "#475569",
  },
  educatorRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 6,
  },
  promptCard: {
    borderLeft: "4 solid #2563eb",
    backgroundColor: "#f8fafc",
    padding: 10,
    marginBottom: 8,
  },
  objectiveCard: {
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1 solid #e2e8f0",
    marginBottom: 8,
  },
  objectiveTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4,
  },
  table: {
    border: "1 solid #cbd5e1",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#dbeafe",
    fontWeight: 700,
  },
  cell: {
    padding: 8,
    borderRight: "1 solid #cbd5e1",
    borderBottom: "1 solid #cbd5e1",
    fontSize: 9,
  },
  noBorderRight: {
    borderRight: "0 solid transparent",
  },
  annexHeader: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    marginBottom: 12,
  },
  annexTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#ffffff",
  },
  annexMeta: {
    marginTop: 6,
    fontSize: 9,
    color: "#cbd5e1",
  },
  materialBullet: {
    marginBottom: 4,
    fontSize: 10,
  },
  logisticsCard: {
    borderRadius: 10,
    backgroundColor: "#fefce8",
    border: "1 solid #fde68a",
    padding: 12,
    marginTop: 14,
  },
});

function renderObjectiveList(items: ObjectiveItem[], emptyText: string) {
  if (items.length === 0) {
    return <Text style={styles.bodyText}>{emptyText}</Text>;
  }

  return items.map((item) => (
    <View key={item.id} style={styles.objectiveCard}>
      <Text style={styles.objectiveTitle}>{item.nombre || "Sin nombre"}</Text>
      <Text style={styles.bodyText}>{item.descripcion || "Sin descripción"}</Text>
    </View>
  ));
}

function renderInstitutionAndDiagnosisPage(data: ActivityPdfData) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{data.actividad.titulo}</Text>
        <Text style={styles.heroMeta}>
          {data.cabecera.grupoScout} | {data.cabecera.comunidad}
        </Text>
        <Text style={styles.heroMeta}>
          Fecha: {data.actividad.fecha || "Sin definir"} | Lugar: {data.actividad.lugar || "Sin definir"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cabecera Institucional</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Grupo Scout</Text>
          <Text style={styles.bodyText}>{data.cabecera.grupoScout}</Text>
          <Text style={[styles.label, { marginTop: 10 }]}>Comunidad</Text>
          <Text style={styles.bodyText}>{data.cabecera.comunidad}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipo de Educadores</Text>
        <View style={styles.card}>
          {data.cabecera.equipoEducadores.filter((item) => item.nombre || item.cargo).map((educator) => (
            <View key={educator.id} style={styles.educatorRow}>
              <Text style={styles.bodyText}>{educator.nombre || "Sin nombre"}</Text>
              <Text style={styles.smallText}>{educator.cargo || "Sin cargo"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnóstico</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Descripción general</Text>
          <Text style={styles.bodyText}>{data.diagnostico.descripcion || "Sin contenido cargado"}</Text>
        </View>
        <View style={styles.promptCard}>
          <Text style={styles.label}>¿Por qué se debe realizar esta actividad?</Text>
          <Text style={styles.bodyText}>{data.diagnostico.porQueActividad || "Sin respuesta"}</Text>
        </View>
        <View style={styles.promptCard}>
          <Text style={styles.label}>¿A qué responde?</Text>
          <Text style={styles.bodyText}>{data.diagnostico.aQueResponde || "Sin respuesta"}</Text>
        </View>
        <View style={styles.promptCard}>
          <Text style={styles.label}>¿Dónde se detectó la necesidad?</Text>
          <Text style={styles.bodyText}>{data.diagnostico.dondeNecesidad || "Sin respuesta"}</Text>
        </View>
        <View style={styles.promptCard}>
          <Text style={styles.label}>¿Por qué se eligió este lugar?</Text>
          <Text style={styles.bodyText}>{data.diagnostico.porQueLugar || "Sin respuesta"}</Text>
        </View>
      </View>
    </Page>
  );
}

function renderObjectivesPage(data: ActivityPdfData) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Objetivos y Áreas</Text>
        <Text style={styles.heroMeta}>
          Definiciones pedagógicas y estratégicas de la actividad.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objetivos Educativos</Text>
        {renderObjectiveList(data.objetivosEducativos, "Sin objetivos educativos definidos")}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objetivos que persigue el dirigente</Text>
        {renderObjectiveList(data.objetivosDirigente, "Sin objetivos del dirigente definidos")}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Áreas a trabajar</Text>
        {renderObjectiveList(data.areasTrabajar, "Sin áreas a trabajar definidas")}
      </View>
    </Page>
  );
}

function renderSchedulePage(data: ActivityPdfData) {
  const logistics = aggregateLogistics(data.anexos);

  return (
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Cronograma General</Text>
        <Text style={styles.heroMeta}>
          Los materiales se resumen automáticamente desde los anexos vinculados.
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { width: "12%" }]}>Hora</Text>
          <Text style={[styles.cell, { width: "24%" }]}>Actividad</Text>
          <Text style={[styles.cell, { width: "18%" }]}>Responsable</Text>
          <Text style={[styles.cell, { width: "12%" }]}>Anexo</Text>
          <Text style={[styles.cell, styles.noBorderRight, { width: "34%" }]}>Materiales</Text>
        </View>
        {data.cronograma.map((row) => (
          <View key={row.id} style={styles.tableRow}>
            <Text style={[styles.cell, { width: "12%" }]}>{row.hora || "-"}</Text>
            <Text style={[styles.cell, { width: "24%" }]}>{row.nombre || "-"}</Text>
            <Text style={[styles.cell, { width: "18%" }]}>
              {getEducatorLabel(getEducatorById(data.cabecera.equipoEducadores, row.responsableId))}
            </Text>
            <Text style={[styles.cell, { width: "12%" }]}>{row.anexoId || "-"}</Text>
            <Text style={[styles.cell, styles.noBorderRight, { width: "34%" }]}>
              {getScheduleMaterialSummary(row, data.anexos)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.logisticsCard}>
        <Text style={styles.sectionTitle}>Lista de Logística Consolidada</Text>
        {logistics.length > 0 ? (
          logistics.map((material) => (
            <Text key={material.nombre} style={styles.materialBullet}>
              • {material.nombre}: {material.cantidad.length > 0 ? material.cantidad.join(" + ") : "cantidad a definir"}
              {material.detalle.length > 0 ? ` | ${material.detalle.join(" | ")}` : ""}
              {material.usadoEn.length > 0 ? ` | Anexos: ${material.usadoEn.join(", ")}` : ""}
            </Text>
          ))
        ) : (
          <Text style={styles.bodyText}>No hay materiales cargados en anexos.</Text>
        )}
      </View>
    </Page>
  );
}

function AnnexSection({ annex }: { annex: Annex }) {
  return (
    <View wrap={false} style={{ marginBottom: 18 }}>
      <View style={styles.annexHeader}>
        <Text style={styles.annexTitle}>{annex.id} · {annex.titulo || "Anexo sin título"}</Text>
        <Text style={styles.annexMeta}>Categoría: {annex.categoria || "Sin categoría"}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.col}>
          <View style={styles.card}>
            <Text style={styles.label}>Ficha Técnica</Text>
            <Text style={styles.bodyText}>Edad: {annex.fichaTecnica.edad || "Sin definir"}</Text>
            <Text style={styles.bodyText}>Participantes: {annex.fichaTecnica.participantes || "Sin definir"}</Text>
            <Text style={styles.bodyText}>Duración: {annex.fichaTecnica.duracion || "Sin definir"}</Text>
          </View>
        </View>
        <View style={styles.col}>
          <View style={styles.card}>
            <Text style={styles.label}>Materiales</Text>
            {annex.materiales.length > 0 ? (
              annex.materiales.map((material) => (
                <Text key={material.id} style={styles.materialBullet}>
                  • {material.cantidad ? `${material.cantidad} ` : ""}{material.nombre || "Material sin nombre"}
                  {material.detalle ? ` (${material.detalle})` : ""}
                </Text>
              ))
            ) : (
              <Text style={styles.bodyText}>Sin materiales definidos.</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Desarrollo Detallado</Text>
        <Text style={styles.bodyText}>{annex.desarrollo || "Sin desarrollo cargado"}</Text>
      </View>
    </View>
  );
}

function renderAnnexPages(data: ActivityPdfData) {
  const chunks: Annex[][] = [];
  for (let index = 0; index < data.anexos.length; index += 2) {
    chunks.push(data.anexos.slice(index, index + 2));
  }

  if (chunks.length === 0) {
    return [
      <Page key="annex-empty" size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Anexos</Text>
          <Text style={styles.heroMeta}>No hay anexos cargados.</Text>
        </View>
      </Page>,
    ];
  }

  return chunks.map((chunk, pageIndex) => (
    <Page key={`annex-page-${pageIndex}`} size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anexos</Text>
      </View>
      {chunk.map((annex) => (
        <AnnexSection key={annex.id} annex={annex} />
      ))}
    </Page>
  ));
}

export function ScoutActivityPdfDocument({ data }: { data: ActivityPdfData }) {
  return (
    <Document title={data.actividad.titulo || "Actividad Scout"}>
      {renderInstitutionAndDiagnosisPage(data)}
      {renderObjectivesPage(data)}
      {renderSchedulePage(data)}
      {renderAnnexPages(data)}
    </Document>
  );
}
