"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import EventModal, { type CalendarEvent } from "@/components/calendar/EventModal";

type EventsResponse = {
  events: CalendarEvent[];
};

type CalendarScout = {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  equipo: string;
};

type ScoutsResponse = {
  data: CalendarScout[];
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

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
}

function tipoColor(tipo: CalendarEvent["tipo"]): string {
  switch (tipo) {
    case "campamento":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "reunion":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300";
    case "cumpleanos":
      return "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300";
    case "raid":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "feriado":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300";
    default:
      return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  }
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scouts, setScouts] = useState<CalendarScout[]>([]);
  const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const [eventsResponse, scoutsResponse, feriadosResponse] = await Promise.all([
          apiFetch<EventsResponse>(
            `/api/events?start=${encodeURIComponent(startOfMonth(currentMonth).toISOString())}&end=${encodeURIComponent(endOfMonth(currentMonth).toISOString())}`
          ),
          apiFetch<ScoutsResponse>("/api/scouts?page=1&limit=500"),
          apiFetch<FeriadosResponse>(
            `/api/feriados?start=${startOfMonth(currentMonth).toISOString().slice(0, 10)}&end=${endOfMonth(currentMonth).toISOString().slice(0, 10)}`
          )
        ]);

        setEvents(eventsResponse.events ?? []);
        setScouts(scoutsResponse.data ?? []);
        setFeriados(feriadosResponse.feriados ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los eventos");
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, [currentMonth]);

  const birthdayEvents = useMemo(() => {
    return scouts
      .filter((scout) => {
        const birthDate = new Date(scout.fecha_nacimiento);
        return birthDate.getMonth() === currentMonth.getMonth();
      })
      .map((scout) => {
        const birthDate = new Date(scout.fecha_nacimiento);
        const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), birthDate.getDate(), 9, 0, 0, 0);
        const newAge = currentMonth.getFullYear() - birthDate.getFullYear();

        return {
          id: `birthday-${scout.id}-${currentMonth.getFullYear()}`,
          titulo: `Cumpleaños de ${scout.nombre}`,
          descripcion: `${scout.nombre} cumple ${newAge} años. Equipo: ${scout.equipo}.`,
          tipo: "cumpleanos" as const,
          fecha_inicio: eventDate.toISOString(),
          fecha_fin: undefined,
          equipo_destinatario: scout.equipo,
          isBirthday: true
        } satisfies CalendarEvent;
      });
  }, [currentMonth, scouts]);

  const holidayEvents = useMemo(() => {
    return feriados.map((feriado) => ({
      id: `holiday-${feriado.id}`,
      titulo: feriado.nombre,
      descripcion: `Feriado ${feriado.tipo}`,
      tipo: "feriado" as const,
      fecha_inicio: new Date(`${feriado.fecha}T12:00:00`).toISOString(),
      fecha_fin: undefined,
      equipo_destinatario: undefined,
      isBirthday: false
    }));
  }, [feriados]);

  const allEvents = useMemo(
    () => [...events, ...birthdayEvents, ...holidayEvents].sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()),
    [birthdayEvents, events, holidayEvents]
  );

  const equipos = useMemo(
    () => Array.from(new Set(scouts.map((scout) => scout.equipo).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [scouts]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of allEvents) {
      const key = toDateKey(new Date(event.fecha_inicio));
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }
    return map;
  }, [allEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const firstWeekDay = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstWeekDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [currentMonth]);

  const todayKey = toDateKey(new Date());

  return (
    <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold capitalize text-neutral-900 dark:text-white">{formatMonthTitle(currentMonth)}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{allEvents.length} evento(s) y cumpleaños en el mes seleccionado</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateDate(new Date().toISOString())}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} />
            Añadir evento
          </button>
          <button
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? <p className="mb-4 text-sm text-neutral-500">Cargando eventos...</p> : null}
      {error ? <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="px-2 py-1">{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-7">
        {calendarDays.map((date) => {
          const key = toDateKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              onClick={() => setCreateDate(date.toISOString())}
              className={`min-h-32 rounded-xl border p-2 transition hover:border-[var(--accent)]/40 ${
                isCurrentMonth
                  ? "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                  : "border-dashed border-neutral-200 bg-[linear-gradient(180deg,rgba(245,245,245,0.9),rgba(250,250,250,0.75))] text-neutral-400 dark:border-neutral-800 dark:bg-[linear-gradient(180deg,rgba(23,23,23,0.9),rgba(10,10,10,0.75))]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday
                      ? "bg-[var(--accent)] text-white"
                      : isCurrentMonth
                      ? "text-neutral-700 dark:text-neutral-200"
                      : "bg-white/80 text-neutral-400 dark:bg-neutral-900/70 dark:text-neutral-500"
                  }`}
                >
                  {date.getDate()}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setCreateDate(date.toISOString());
                  }}
                  className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  title="Crear evento"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(buttonEvent) => {
                      buttonEvent.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className={`block w-full rounded-lg px-2 py-1 text-left text-xs font-medium transition hover:opacity-85 ${tipoColor(event.tipo)}`}
                  >
                    <div className="truncate">{event.titulo}</div>
                    <div className="truncate text-[11px] opacity-80">
                      {new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.fecha_inicio))}
                    </div>
                  </button>
                ))}

                {dayEvents.length > 3 ? (
                  <div className="px-1 text-[11px] text-neutral-500 dark:text-neutral-400">+{dayEvents.length - 3} más</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <EventModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        equipos={equipos}
        onClose={() => setSelectedEvent(null)}
        onUpdated={(updatedEvent) => {
          setEvents((prev) => prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)));
          setSelectedEvent(updatedEvent);
        }}
        onDeleted={(eventId) => {
          setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
          setSelectedEvent(null);
        }}
      />
      <EventModal
        event={null}
        isOpen={Boolean(createDate)}
        mode="create"
        initialDate={createDate ?? undefined}
        equipos={equipos}
        onClose={() => setCreateDate(null)}
        onCreated={(event) => setEvents((prev) => [...prev, event])}
      />
    </section>
  );
}