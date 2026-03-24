#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const { format } = require("date-fns");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const YEARS = [2024, 2025, 2026];
const API_BASE_URL = "https://nolaborables.com.ar/api/v2/feriados";
const ALLOWED_TYPES = new Set(["inamovible", "trasladable", "puente"]);

const STATIC_HOLIDAYS = {
  2024: [
    { fecha: "2024-01-01", nombre: "Año Nuevo", tipo: "inamovible" },
    { fecha: "2024-02-12", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2024-02-13", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2024-03-24", nombre: "Día Nacional de la Memoria por la Verdad y la Justicia", tipo: "inamovible" },
    { fecha: "2024-03-29", nombre: "Viernes Santo", tipo: "inamovible" },
    { fecha: "2024-04-02", nombre: "Día del Veterano y de los Caídos en la Guerra de Malvinas", tipo: "inamovible" },
    { fecha: "2024-05-01", nombre: "Día del Trabajador", tipo: "inamovible" },
    { fecha: "2024-05-25", nombre: "Día de la Revolución de Mayo", tipo: "inamovible" },
    { fecha: "2024-06-17", nombre: "Paso a la Inmortalidad del General Don Martín Miguel de Güemes", tipo: "trasladable" },
    { fecha: "2024-06-20", nombre: "Paso a la Inmortalidad del General Manuel Belgrano", tipo: "inamovible" },
    { fecha: "2024-07-09", nombre: "Día de la Independencia", tipo: "inamovible" },
    { fecha: "2024-08-19", nombre: "Paso a la Inmortalidad del General José de San Martín", tipo: "trasladable" },
    { fecha: "2024-10-11", nombre: "Día del Respeto a la Diversidad Cultural", tipo: "trasladable" },
    { fecha: "2024-11-18", nombre: "Día de la Soberanía Nacional", tipo: "trasladable" },
    { fecha: "2024-12-08", nombre: "Inmaculada Concepción de María", tipo: "inamovible" },
    { fecha: "2024-12-25", nombre: "Navidad", tipo: "inamovible" }
  ],
  2025: [
    { fecha: "2025-01-01", nombre: "Año Nuevo", tipo: "inamovible" },
    { fecha: "2025-03-03", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2025-03-04", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2025-03-24", nombre: "Día Nacional de la Memoria por la Verdad y la Justicia", tipo: "inamovible" },
    { fecha: "2025-04-02", nombre: "Día del Veterano y de los Caídos en la Guerra de Malvinas", tipo: "inamovible" },
    { fecha: "2025-04-18", nombre: "Viernes Santo", tipo: "inamovible" },
    { fecha: "2025-05-01", nombre: "Día del Trabajador", tipo: "inamovible" },
    { fecha: "2025-05-25", nombre: "Día de la Revolución de Mayo", tipo: "inamovible" },
    { fecha: "2025-06-16", nombre: "Paso a la Inmortalidad del General Don Martín Miguel de Güemes", tipo: "trasladable" },
    { fecha: "2025-06-20", nombre: "Paso a la Inmortalidad del General Manuel Belgrano", tipo: "inamovible" },
    { fecha: "2025-07-09", nombre: "Día de la Independencia", tipo: "inamovible" },
    { fecha: "2025-08-18", nombre: "Paso a la Inmortalidad del General José de San Martín", tipo: "trasladable" },
    { fecha: "2025-10-13", nombre: "Día del Respeto a la Diversidad Cultural", tipo: "trasladable" },
    { fecha: "2025-11-24", nombre: "Día de la Soberanía Nacional", tipo: "trasladable" },
    { fecha: "2025-12-08", nombre: "Inmaculada Concepción de María", tipo: "inamovible" },
    { fecha: "2025-12-25", nombre: "Navidad", tipo: "inamovible" }
  ],
  2026: [
    { fecha: "2026-01-01", nombre: "Año Nuevo", tipo: "inamovible" },
    { fecha: "2026-02-16", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2026-02-17", nombre: "Carnaval", tipo: "inamovible" },
    { fecha: "2026-03-24", nombre: "Día Nacional de la Memoria por la Verdad y la Justicia", tipo: "inamovible" },
    { fecha: "2026-04-02", nombre: "Día del Veterano y de los Caídos en la Guerra de Malvinas", tipo: "inamovible" },
    { fecha: "2026-04-03", nombre: "Viernes Santo", tipo: "inamovible" },
    { fecha: "2026-05-01", nombre: "Día del Trabajador", tipo: "inamovible" },
    { fecha: "2026-05-25", nombre: "Día de la Revolución de Mayo", tipo: "inamovible" },
    { fecha: "2026-06-15", nombre: "Paso a la Inmortalidad del General Don Martín Miguel de Güemes", tipo: "trasladable" },
    { fecha: "2026-06-20", nombre: "Paso a la Inmortalidad del General Manuel Belgrano", tipo: "inamovible" },
    { fecha: "2026-07-09", nombre: "Día de la Independencia", tipo: "inamovible" },
    { fecha: "2026-08-17", nombre: "Paso a la Inmortalidad del General José de San Martín", tipo: "trasladable" },
    { fecha: "2026-10-12", nombre: "Día del Respeto a la Diversidad Cultural", tipo: "trasladable" },
    { fecha: "2026-11-23", nombre: "Día de la Soberanía Nacional", tipo: "trasladable" },
    { fecha: "2026-12-08", nombre: "Inmaculada Concepción de María", tipo: "inamovible" },
    { fecha: "2026-12-25", nombre: "Navidad", tipo: "inamovible" }
  ]
};

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function toDateString(year, month, day) {
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return format(utcNoon, "yyyy-MM-dd");
}

function normalizeHoliday(year, rawHoliday) {
  if (!rawHoliday || typeof rawHoliday !== "object") return null;

  const tipo = String(rawHoliday.tipo || "").trim().toLowerCase();
  if (!ALLOWED_TYPES.has(tipo)) return null;

  const day = Number(rawHoliday.dia);
  const month = Number(rawHoliday.mes);
  const nombre = String(rawHoliday.motivo || rawHoliday.nombre || "").trim();

  if (!day || !month || !nombre) return null;

  return {
    fecha: toDateString(year, month, day),
    nombre,
    tipo
  };
}

async function fetchOfficialHolidays(year) {
  const response = await fetch(`${API_BASE_URL}/${year}`);

  if (!response.ok) {
    throw new Error(`No se pudieron obtener los feriados ${year}: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`La API devolvió un formato inválido para ${year}`);
  }

  return data
    .map((item) => normalizeHoliday(year, item))
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function getStaticHolidays(year) {
  const data = STATIC_HOLIDAYS[year] ?? [];
  return data
    .filter((item) => ALLOWED_TYPES.has(item.tipo))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

async function ensureTableExists() {
  const { error } = await db.from("feriados").select("id", { head: true, count: "exact" }).limit(1);

  if (!error) return;

  if (error.message?.toLowerCase().includes("relation") || error.message?.toLowerCase().includes("does not exist")) {
    throw new Error(
      "La tabla 'feriados' no existe. Ejecutá primero las migraciones de Supabase para crearla."
    );
  }

  throw new Error(`No se pudo validar la tabla 'feriados': ${error.message}`);
}

async function seedFeriados() {
  console.log("🌱 Scout Tracker - Seeding de feriados nacionales\n");

  try {
    await ensureTableExists();

    const holidays = [];

    for (const year of YEARS) {
      console.log(`📅 Descargando feriados oficiales ${year}...`);
      let yearHolidays = [];
      try {
        yearHolidays = await fetchOfficialHolidays(year);
      } catch (error) {
        console.warn(`   ⚠️  API no disponible para ${year}. Se usa fallback estático oficial.`);
        yearHolidays = getStaticHolidays(year);
      }
      console.log(`   ${yearHolidays.length} feriado(s) válidos obtenidos`);
      holidays.push(...yearHolidays);
    }

    const uniqueHolidays = Array.from(
      new Map(holidays.map((holiday) => [holiday.fecha, holiday])).values()
    );

    const { data, error } = await db
      .from("feriados")
      .upsert(uniqueHolidays, { onConflict: "fecha" })
      .select("fecha,nombre,tipo");

    if (error) {
      throw new Error(`No se pudieron insertar los feriados: ${error.message}`);
    }

    console.log("\n✅ Seeding completado");
    console.log(`   ${data?.length ?? uniqueHolidays.length} feriado(s) insertado(s)/actualizado(s)`);
    console.log(`   Años cargados: ${YEARS.join(", ")}`);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

seedFeriados();