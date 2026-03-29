import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/session-context";

type ScoutsResponse = {
  total: number;
};

type BirthdaysResponse = Record<string, Array<{ id: string; nombre: string; fecha_nacimiento: string }>>;

type EventsResponse = {
  events: Array<{ id: string; titulo: string; fecha_inicio: string; tipo: string }>;
};

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function DashboardScreen() {
  const { user, signOut } = useSession();
  const today = useMemo(() => startOfDay(new Date()), []);
  const next30Days = useMemo(() => addDays(today, 30), [today]);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", today.toISOString()],
    queryFn: async () => {
      const [scouts, birthdays, events] = await Promise.all([
        apiFetch<ScoutsResponse>("/api/scouts?page=1&limit=1"),
        apiFetch<BirthdaysResponse>("/api/scouts/cumpleanos"),
        apiFetch<EventsResponse>(`/api/events?start=${today.toISOString()}&end=${next30Days.toISOString()}`),
      ]);

      return {
        totalScouts: scouts.total,
        birthdays: birthdays[MONTH_NAMES[today.getMonth()]] ?? [],
        upcomingEvents: events.events,
      };
    },
  });

  async function handleSignOut() {
    await signOut();
  }

  if (dashboardQuery.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0f6c5a" />
      </View>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Dashboard</Text>
        <Text style={{ color: "#b91c1c" }}>
          {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "No se pudo cargar el dashboard."}
        </Text>
      </View>
    );
  }

  const summary = dashboardQuery.data;

  if (!summary) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ color: "#6b7280" }}>No hay datos disponibles para el dashboard.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: "700" }}>Dashboard</Text>
          <Text style={{ color: "#4b5563" }}>
            {user ? `Hola, ${user.nombre}` : "Resumen general"}
          </Text>
        </View>
        <Pressable onPress={() => void handleSignOut()} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#111827" }}>
          <Text style={{ color: "white", fontWeight: "600" }}>Salir</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, gap: 6 }}>
        <Text style={{ color: "#6b7280" }}>Scouts activos</Text>
        <Text style={{ fontSize: 32, fontWeight: "700" }}>{summary.totalScouts}</Text>
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Cumpleaños del mes</Text>
        {summary.birthdays.length === 0 ? (
          <Text style={{ color: "#6b7280" }}>No hay cumpleaños este mes.</Text>
        ) : (
          summary.birthdays.slice(0, 5).map((scout) => (
            <Text key={scout.id}>{scout.nombre}</Text>
          ))
        )}
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Próximos eventos</Text>
        {summary.upcomingEvents.length === 0 ? (
          <Text style={{ color: "#6b7280" }}>No hay eventos próximos.</Text>
        ) : (
          summary.upcomingEvents.slice(0, 5).map((event) => (
            <View key={event.id} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
              <Text style={{ fontWeight: "600" }}>{event.titulo}</Text>
              <Text style={{ color: "#6b7280" }}>{new Date(event.fecha_inicio).toLocaleDateString("es-AR")}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}