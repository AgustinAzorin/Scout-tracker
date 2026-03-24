import { View, Text } from "react-native";

export default function ScoutCard({ nombre }: { nombre: string }) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 10, padding: 10 }}>
      <Text>{nombre}</Text>
    </View>
  );
}