"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, CalendarDays, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Scout = {
  id: string;
  numero: number;
  nombre: string;
  equipo: string;
  categoria_miembro?: string;
  fecha_nacimiento: string;
  is_active: boolean;
};

type EventItem = {
  id: string;
  titulo: string;
  tipo: "reunion" | "cumpleanos" | "campamento" | "raid" | "feriado" | "recordatorio";
  fecha_inicio: string;
  fecha_fin?: string;
  equipo_destinatario?: string;
};

type ScoutsResponse = {
  data: Scout[];
  total: number;
  page: number;
};

type EquiposResponse = {
  equipos: Array<{ id: string; nombre: string }>;
};

type EventsResponse = {
  events: EventItem[];
};

type FeriadoItem = {
  id: string;
  fecha: string;
  nombre: string;
  tipo: "inamovible" | "trasladable" | "puente";
};

type FeriadosResponse = {
  feriados: FeriadoItem[];
};

type CalendarEventMarker = {
  id: string;
  titulo: string;
  tipo: EventItem["tipo"];
};

function getCalendarEventStyles(tipo: EventItem["tipo"]): { badge: string; dot: string; label: string } {
  switch (tipo) {
    case "feriado":
      return {
        badge: "border-violet-300 bg-violet-100/80 text-violet-800",
        dot: "bg-violet-500",
        label: "Feriado"
      };
    case "campamento":
      return {
        badge: "border-emerald-300 bg-emerald-100/80 text-emerald-800",
        dot: "bg-emerald-500",
        label: "Campamento"
      };
    case "reunion":
      return {
        badge: "border-sky-300 bg-sky-100/80 text-sky-800",
        dot: "bg-sky-500",
        label: "Reunión"
      };
    case "raid":
      return {
        badge: "border-amber-300 bg-amber-100/80 text-amber-800",
        dot: "bg-amber-500",
        label: "Raid"
      };
    case "recordatorio":
      return {
        badge: "border-neutral-300 bg-neutral-100/80 text-neutral-800",
        dot: "bg-neutral-500",
        label: "Recordatorio"
      };
    case "cumpleanos":
      return {
        badge: "border-pink-300 bg-pink-100/80 text-pink-800",
        dot: "bg-pink-500",
        label: "Cumpleaños"
      };
    default:
      return {
        badge: "border-indigo-300 bg-indigo-100/80 text-indigo-800",
        dot: "bg-indigo-500",
        label: "Evento"
      };
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextBirthdayDate(birthDate: string): Date {
  const now = new Date();
  const source = new Date(birthDate);
  const next = new Date(now.getFullYear(), source.getMonth(), source.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1);
  }
  return next;
}

function buildMonthDays(baseDate: Date): Array<Date | null> {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startPad = (first.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= last.getDate(); day += 1) cells.push(new Date(year, month, day));

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * Genera un color pastel único para cada equipo basado en un hash del nombre
 */
function getTeamColor(teamName: string): string {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-red-100 text-red-800 border-red-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300"
  ];
  
  let hash = 0;
  for (let i = 0; i < teamName.length; i += 1) {
    hash = ((hash << 5) - hash) + teamName.charCodeAt(i);
    hash = hash & hash; // Convierte a int de 32 bits
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentMonth] = useState(new Date());

  const isAdmin = user?.role?.nombre === "admin";

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const [scoutsRes, equiposRes, eventsRes, feriadosRes] = await Promise.all([
          apiFetch<ScoutsResponse>("/api/scouts?page=1&limit=500"),
          apiFetch<EquiposResponse>("/api/equipos"),
          apiFetch<EventsResponse>("/api/events"),
          apiFetch<FeriadosResponse>(`/api/feriados?start=${monthStart.toISOString().slice(0, 10)}&end=${monthEnd.toISOString().slice(0, 10)}`)
        ]);

        setScouts(scoutsRes.data ?? []);
        setEvents(eventsRes.events ?? []);
        setFeriados(feriadosRes.feriados ?? []);

        const teamNames = (equiposRes.equipos ?? []).map((t) => t.nombre);
        const fallbackTeams = Array.from(new Set((scoutsRes.data ?? []).map((s) => s.equipo)));
        const mergedTeams = teamNames.length > 0 ? teamNames : fallbackTeams;
        setTeams(mergedTeams);
        
        // Solo establece selectedTeam si es admin
        if (isAdmin) {
          setSelectedTeam((prev) => prev ?? mergedTeams[0] ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [isAdmin, currentMonth]);

  const activeScouts = scouts.filter((s) => s.is_active !== false);

  const nextBirthday = useMemo(() => {
    if (activeScouts.length === 0) return null;

    const ranked = activeScouts
      .map((scout) => {
        const nextDate = nextBirthdayDate(scout.fecha_nacimiento);
        return {
          scout,
          nextDate,
          diff: nextDate.getTime() - Date.now()
        };
      })
      .sort((a, b) => a.diff - b.diff);

    return ranked[0] ?? null;
  }, [activeScouts]);

  const nextCamp = useMemo(() => {
    const now = new Date();
    const camps = events
      .filter((ev) => ev.tipo === "campamento")
      .map((ev) => ({ ...ev, date: new Date(ev.fecha_inicio) }))
      .filter((ev) => ev.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return camps[0] ?? null;
  }, [events]);

  const scoutsByTeam = useMemo(() => {
    return activeScouts.reduce<Record<string, Scout[]>>((acc, scout) => {
      if (!acc[scout.equipo]) acc[scout.equipo] = [];
      acc[scout.equipo].push(scout);
      return acc;
    }, {});
  }, [activeScouts]);

  const selectedRoster = selectedTeam ? scoutsByTeam[selectedTeam] ?? [] : [];

  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);

  const monthMarkers = useMemo(() => {
    const markerMap: Record<string, { scouts: Scout[]; eventos: CalendarEventMarker[] }> = {};

    for (const scout of activeScouts) {
      const birth = new Date(scout.fecha_nacimiento);
      if (birth.getMonth() === currentMonth.getMonth()) {
        const key = toDateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), birth.getDate()));
        if (!markerMap[key]) markerMap[key] = { scouts: [], eventos: [] };
        markerMap[key].scouts.push(scout);
      }
    }

    for (const event of events) {
      const eventDate = new Date(event.fecha_inicio);
      if (eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear()) {
        const key = toDateKey(eventDate);
        if (!markerMap[key]) markerMap[key] = { scouts: [], eventos: [] };
        markerMap[key].eventos.push({ id: event.id, titulo: event.titulo, tipo: event.tipo });
      }
    }

    for (const feriado of feriados) {
      const feriadoDate = new Date(`${feriado.fecha}T12:00:00`);
      if (feriadoDate.getMonth() === currentMonth.getMonth() && feriadoDate.getFullYear() === currentMonth.getFullYear()) {
        const key = toDateKey(feriadoDate);
        if (!markerMap[key]) markerMap[key] = { scouts: [], eventos: [] };
        markerMap[key].eventos.push({ id: `feriado-${feriado.id}`, titulo: feriado.nombre, tipo: "feriado" });
      }
    }

    return markerMap;
  }, [activeScouts, events, feriados, currentMonth]);

  if (loading) {
    return <div className="rounded-xl bg-white p-4 shadow">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-red-700 shadow">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link
              href="/scouts"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-white transition hover:opacity-90"
            >
              <FileText size={16} />
              Ver nómina
            </Link>
          )}
          <Link
            href="/graficos"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <BarChart3 size={16} />
            Ver gráficos
          </Link>
          <Link
            href="/calendario"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <CalendarDays size={16} />
            Ver calendario
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-500">Total Scouts Activos</p>
          <p className="mt-2 text-3xl font-semibold">{activeScouts.length}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-500">Proximo Cumpleanos</p>
          {nextBirthday ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold">{nextBirthday.scout.nombre}</p>
              <p className="text-sm text-neutral-600">{formatDate(nextBirthday.nextDate)} · {nextBirthday.scout.equipo}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">Sin datos</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-neutral-500">Proximo Campamento</p>
          {nextCamp ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold">{nextCamp.titulo}</p>
              <p className="text-sm text-neutral-600">{formatDate(nextCamp.date)}{nextCamp.equipo_destinatario ? ` · ${nextCamp.equipo_destinatario}` : ""}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">No hay campamentos programados</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Equipos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {teams.map((team) => {
              const count = scoutsByTeam[team]?.length ?? 0;
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => router.push(`/scouts?team=${encodeURIComponent(team)}`)}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-left shadow transition hover:bg-neutral-50"
                >
                  <p className="font-semibold">{team}</p>
                  <p className="text-sm text-neutral-600">{count} scouts</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-xl font-semibold">Nomina {selectedTeam ? `· ${selectedTeam}` : ""}</h2>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-neutral-600">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Categoria</th>
                  <th className="py-2 pr-3">Fecha Nac.</th>
                </tr>
              </thead>
              <tbody>
                {selectedRoster.map((scout) => (
                  <tr key={scout.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{scout.numero}</td>
                    <td className="py-2 pr-3">{scout.nombre}</td>
                    <td className="py-2 pr-3">{scout.categoria_miembro ?? "-"}</td>
                    <td className="py-2 pr-3">{formatDate(new Date(scout.fecha_nacimiento))}</td>
                  </tr>
                ))}
                {selectedRoster.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-neutral-500">
                      Sin scouts para este equipo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="text-xl font-semibold">Calendario</h2>
        <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs text-neutral-500">
          {"Lun Mar Mie Jue Vie Sab Dom".split(" ").map((day) => (
            <div key={day} className="py-1 font-medium">{day}</div>
          ))}
          {monthDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-24 rounded border border-dashed border-neutral-200" />;

            const key = toDateKey(day);
            const marker = monthMarkers[key];

            return (
              <div key={key} className="h-24 rounded border border-neutral-200 p-2 text-left flex flex-col">
                <p className="text-xs font-medium text-neutral-700">{day.getDate()}</p>
                <div className="mt-1 flex-1 space-y-1 overflow-y-auto">
                  {marker?.scouts && marker.scouts.length > 0 && (
                    <div className="space-y-1">
                      {marker.scouts.map((scout) => (
                        <div
                          key={scout.id}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium truncate border ${getTeamColor(scout.equipo)}`}
                          title={scout.nombre}
                        >
                          {scout.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                  {marker?.eventos?.length ? (
                    <div className="space-y-1">
                      {marker.eventos.slice(0, 2).map((evento) => (
                        <div
                          key={evento.id}
                          className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getCalendarEventStyles(evento.tipo).badge}`}
                          title={`${getCalendarEventStyles(evento.tipo).label}: ${evento.titulo}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${getCalendarEventStyles(evento.tipo).dot}`} />
                          <span className="truncate">{evento.titulo}</span>
                        </div>
                      ))}
                      {marker.eventos.length > 2 ? (
                        <p className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">+{marker.eventos.length - 2} más</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}