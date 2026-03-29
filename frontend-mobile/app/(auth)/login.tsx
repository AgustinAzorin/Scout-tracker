import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSession } from "@/lib/session-context";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError("Completá email y contraseña.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Scout Tracker</Text>
      <Text style={{ color: "#4b5563" }}>Iniciá sesión con tu cuenta del sistema.</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }} />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />
      {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}
      <Pressable
        onPress={() => void submit()}
        disabled={submitting}
        style={{ backgroundColor: "#0f6c5a", padding: 12, borderRadius: 8, opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Entrar</Text>
        )}
      </Pressable>
    </View>
  );
}