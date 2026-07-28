import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="watch/[id]" options={{ title: "", headerBackTitle: "Back" }} />
        <Stack.Screen name="channel/[handle]" options={{ title: "" }} />
        <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
