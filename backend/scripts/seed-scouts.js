#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SCOUTS_DATA = [
  {
    numero: 1,
    nombre: "Carlos Alberto López",
    dni: 35234567,
    fecha_nacimiento: "2008-03-15",
    tel_emergencias: "1123456789",
    tel_propio: "1198765432",
    religion: "Católica",
    categoria_miembro: "Scouts",
    va: true,
    equipo: "Baden Powell",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Fuego",
    raid: "Ruta 1",
    cordi: "Coordinador de Patrulla",
    guardian: null,
    diario_marcha: "2026-03-20",
    rol_comunidad: "Patrullero",
    tada_puede: true,
    tada_tiene: false,
    mistica: "Valores scouts",
    ingreso_movimiento: "Unidad",
    distrito: true,
    afiliacion: true,
    uso_imagen: true,
  },
  {
    numero: 2,
    nombre: "Martina Rodríguez Fernández",
    dni: 38456789,
    fecha_nacimiento: "2009-07-22",
    tel_emergencias: "1125678901",
    tel_propio: "1195432109",
    religion: "Católica",
    categoria_miembro: "Scouts",
    va: false,
    equipo: "Frida Kahlo",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Agua",
    raid: "Ruta 2",
    cordi: null,
    guardian: "María Rodríguez",
    diario_marcha: "2026-03-19",
    rol_comunidad: "Segunda Patrulla",
    tada_puede: false,
    tada_tiene: true,
    mistica: "Espíritu de aventura",
    ingreso_movimiento: "Unidad",
    distrito: false,
    afiliacion: true,
    uso_imagen: false,
  },
  {
    numero: 3,
    nombre: "Diego Martínez",
    dni: 40123456,
    fecha_nacimiento: "2007-11-08",
    tel_emergencias: "1187654321",
    tel_propio: "1191234567",
    religion: "Evangélica",
    categoria_miembro: "Ventores",
    va: true,
    equipo: "Lola Mora",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Tierra",
    raid: "Ruta 3",
    cordi: "Coordinador de Equipo",
    guardian: null,
    diario_marcha: "2026-03-18",
    rol_comunidad: "Ventorista",
    tada_puede: true,
    tada_tiene: true,
    mistica: "Liderazgo joven",
    ingreso_movimiento: "Caminantes",
    distrito: true,
    afiliacion: true,
    uso_imagen: true,
  },
  {
    numero: 4,
    nombre: "Sofía González",
    dni: 36789012,
    fecha_nacimiento: "2010-01-14",
    tel_emergencias: "1134567890",
    tel_propio: "1196789012",
    religion: "Católica",
    categoria_miembro: "Castores",
    va: true,
    equipo: "Baden Powell",
    promesa: null,
    etapa: "Iniciación",
    elemento: "Aire",
    raid: null,
    cordi: null,
    guardian: "Jorge González",
    diario_marcha: null,
    rol_comunidad: "Castor",
    tada_puede: false,
    tada_tiene: false,
    mistica: "Diversión y amistad",
    ingreso_movimiento: "Manada",
    distrito: false,
    afiliacion: true,
    uso_imagen: true,
  },
  {
    numero: 5,
    nombre: "Lucas Pérez Gutiérrez",
    dni: 37654321,
    fecha_nacimiento: "2008-05-30",
    tel_emergencias: "1145678901",
    tel_propio: "1192345678",
    religion: "Católica",
    categoria_miembro: "Scouts",
    va: true,
    equipo: "Tupac Amaru",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Fuego",
    raid: "Ruta 1",
    cordi: null,
    guardian: null,
    diario_marcha: "2026-03-20",
    rol_comunidad: "Patrullero",
    tada_puede: true,
    tada_tiene: true,
    mistica: "Naturaleza y aventura",
    ingreso_movimiento: "Unidad",
    distrito: true,
    afiliacion: true,
    uso_imagen: false,
  },
  {
    numero: 6,
    nombre: "Julia Ramírez",
    dni: 39234567,
    fecha_nacimiento: "2009-09-03",
    tel_emergencias: "1156789012",
    tel_propio: "1193456789",
    religion: "Católica",
    categoria_miembro: "Scouts",
    va: false,
    equipo: "Frida Kahlo",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Agua",
    raid: "Ruta 2",
    cordi: "Coordinadora de Patrulla",
    guardian: null,
    diario_marcha: "2026-03-19",
    rol_comunidad: "Guía de Patrulla",
    tada_puede: true,
    tada_tiene: false,
    mistica: "Responsabilidad social",
    ingreso_movimiento: "Unidad",
    distrito: true,
    afiliacion: false,
    uso_imagen: true,
  },
  {
    numero: 7,
    nombre: "Tomás Álvarez",
    dni: 41567890,
    fecha_nacimiento: "2006-12-25",
    tel_emergencias: "1167890123",
    tel_propio: "1194567890",
    religion: "Agnóstico",
    categoria_miembro: "Ventores",
    va: true,
    equipo: "Lola Mora",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Tierra",
    raid: "Ruta 3",
    cordi: "Coordinador General",
    guardian: null,
    diario_marcha: "2026-03-17",
    rol_comunidad: "Líder Scout",
    tada_puede: true,
    tada_tiene: true,
    mistica: "Excelencia y servicio",
    ingreso_movimiento: "Caminantes",
    distrito: true,
    afiliacion: true,
    uso_imagen: true,
  },
  {
    numero: 8,
    nombre: "Valentina Silva",
    dni: 36123456,
    fecha_nacimiento: "2010-04-18",
    tel_emergencias: "1178901234",
    tel_propio: "1195678901",
    religion: "Católica",
    categoria_miembro: "Castores",
    va: true,
    equipo: "Tupac Amaru",
    promesa: null,
    etapa: "Iniciación",
    elemento: "Aire",
    raid: null,
    cordi: null,
    guardian: "Patricia Silva",
    diario_marcha: null,
    rol_comunidad: "Castor",
    tada_puede: true,
    tada_tiene: false,
    mistica: "Aprendizaje lúdico",
    ingreso_movimiento: "Manada",
    distrito: false,
    afiliacion: true,
    uso_imagen: false,
  },
  {
    numero: 9,
    nombre: "Andrés Sánchez López",
    dni: 38901234,
    fecha_nacimiento: "2007-06-07",
    tel_emergencias: "1189012345",
    tel_propio: "1196789023",
    religion: "Católica",
    categoria_miembro: "Ventores",
    va: true,
    equipo: "Baden Powell",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Tierra",
    raid: "Ruta 1",
    cordi: null,
    guardian: null,
    diario_marcha: "2026-03-16",
    rol_comunidad: "Ventorista",
    tada_puede: false,
    tada_tiene: true,
    mistica: "Compromiso comunitario",
    ingreso_movimiento: "Caminantes",
    distrito: true,
    afiliacion: true,
    uso_imagen: true,
  },
  {
    numero: 10,
    nombre: "Lucía Moreno",
    dni: 37456789,
    fecha_nacimiento: "2008-10-12",
    tel_emergencias: "1190123456",
    tel_propio: "1197890123",
    religion: "Católica",
    categoria_miembro: "Scouts",
    va: false,
    equipo: "Frida Kahlo",
    promesa: "Con pañuelo",
    etapa: "Activo",
    elemento: "Agua",
    raid: "Ruta 2",
    cordi: null,
    guardian: "Rosa Moreno",
    diario_marcha: "2026-03-15",
    rol_comunidad: "Patrullera",
    tada_puede: true,
    tada_tiene: false,
    mistica: "Comunidad y servicio",
    ingreso_movimiento: "Unidad",
    distrito: false,
    afiliacion: true,
    uso_imagen: true,
  },
];

async function seedScouts() {
  console.log("\n🌱 Scout Tracker - Seeding 10 Scouts\n");

  try {
    console.log("📝 Inserting scouts...\n");

    const { data, error } = await db.from("scouts").insert(SCOUTS_DATA).select();

    if (error) {
      console.error("❌ Error inserting scouts:", error);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} scouts\n`);

    console.log("📋 Scout Summary:\n");
    console.log("┌─────────┬─────────────────────────────┬──────────────┬──────────────────┐");
    console.log("│ Número  │ Nombre                      │ Equipo       │ Categoría        │");
    console.log("├─────────┼─────────────────────────────┼──────────────┼──────────────────┤");

    for (const scout of SCOUTS_DATA) {
      const nombre = (scout.nombre || "").padEnd(27);
      const equipo = (scout.equipo || "").padEnd(12);
      const categoria = (scout.categoria_miembro || "").padEnd(16);
      console.log(`│ ${scout.numero} │ ${nombre} │ ${equipo} │ ${categoria} │`);
    }

    console.log("└─────────┴─────────────────────────────┴──────────────┴──────────────────┘\n");

    console.log("🎯 Totals by Team:");
    const byTeam = {};
    for (const scout of SCOUTS_DATA) {
      byTeam[scout.equipo] = (byTeam[scout.equipo] || 0) + 1;
    }
    for (const [team, count] of Object.entries(byTeam)) {
      console.log(`   • ${team}: ${count} scouts`);
    }

    console.log("\n✨ Ready to view in http://localhost:3000\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seedScouts();
