import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { setAuthSession } from "@/lib/auth-store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    await setAuthSession({ accessToken: "demo", refreshToken: "demo", user: { email } });
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Scout Tracker</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }} />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contrasena"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />
      <Pressable onPress={submit} style={{ backgroundColor: "#0f6c5a", padding: 12, borderRadius: 8 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Entrar</Text>
      </Pressable>
    </View>
  );
}