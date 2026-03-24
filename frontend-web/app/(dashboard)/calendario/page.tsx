import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Calendario</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Vista mensual de reuniones, campamentos, recordatorios y demás eventos cargados.
        </p>
      </section>

      <CalendarView />
    </div>
  );
}