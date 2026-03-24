import { View, Text, FlatList } from "react-native";

const data = [{ id: "1", nombre: "Ejemplo Scout" }];

export default function ScoutsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "white", borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <Text>{item.nombre}</Text>
          </View>
        )}
      />
    </View>
  );
}