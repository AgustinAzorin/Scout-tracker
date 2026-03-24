import { View, Text } from "react-native";

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Dashboard</Text>
      <View style={{ backgroundColor: "white", borderRadius: 10, padding: 14 }}>
        <Text>Total scouts, cumpleanos y proximos eventos</Text>
      </View>
    </View>
  );
}