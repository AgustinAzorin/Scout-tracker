import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="scouts/index" options={{ title: "Scouts" }} />
      <Tabs.Screen name="equipos/index" options={{ title: "Equipos" }} />
      <Tabs.Screen name="graficos/index" options={{ title: "Graficos" }} />
      <Tabs.Screen name="calendario/index" options={{ title: "Calendario" }} />
    </Tabs>
  );
}