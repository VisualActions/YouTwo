import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Brand, Button } from "../components/ui";
import { supabase } from "../lib/supabase";
import { colors, radius, space, type } from "../theme";

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setError(error.message);
        else router.back();
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) setError(error.message);
        else if (data.session) router.back();
        else setNotice("Check your email for a confirmation link, then sign in.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginBottom: space[6] }}>
          <Brand />
        </View>

        <Text style={styles.title}>
          {mode === "signin" ? "Sign in" : "Create your account"}
        </Text>
        <Text style={styles.subtitle}>
          {mode === "signin" ? "to continue to YouTwo" : "you'll get a channel too"}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Button
          title={busy ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
          variant="blue"
          disabled={busy || !email || !password}
          onPress={submit}
          style={{ marginTop: space[3], height: 44 }}
        />

        <Text
          style={styles.toggle}
          onPress={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "signin" ? "New to YouTwo? Create account" : "Already have an account? Sign in"}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: space[6], paddingTop: space[6] },
  title: { color: colors.text, fontSize: type.lg, fontWeight: "600", textAlign: "center" },
  subtitle: {
    color: colors.textSecondary,
    fontSize: type.base,
    textAlign: "center",
    marginTop: 4,
    marginBottom: space[5],
  },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.text,
    paddingHorizontal: space[3],
    fontSize: type.md,
    marginBottom: space[3],
  },
  error: { color: colors.danger, fontSize: type.base, marginBottom: space[2] },
  notice: { color: colors.green, fontSize: type.base, marginBottom: space[2] },
  toggle: {
    color: colors.blue,
    fontSize: type.base,
    textAlign: "center",
    marginTop: space[5],
  },
});
