import { Tabs } from "expo-router";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { colors } from "../../theme";

import type { ColorValue } from "react-native";

type IconProps = { color: ColorValue; size?: number };

const stroke = (color: ColorValue) => ({
  fill: "none",
  stroke: color as string,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...stroke(color)} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <Path
        {...stroke(color)}
        d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      />
    </Svg>
  );
}

function SubsIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...stroke(color)} d="M4 7h16M6 4h12" />
      <Rect {...stroke(color)} x="2" y="10" width="20" height="11" rx="2" />
      <Path {...stroke(color)} d="m10 13 5 2.5-5 2.5z" />
    </Svg>
  );
}

function SearchIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle {...stroke(color)} cx="11" cy="11" r="8" />
      <Path {...stroke(color)} d="m21 21-4.34-4.34" />
    </Svg>
  );
}

function LibraryIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...stroke(color)} d="M3 5v14M8 5v14" />
      <Rect {...stroke(color)} x="12" y="5" width="9" height="14" rx="2" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{ title: "Subscriptions", tabBarIcon: ({ color }) => <SubsIcon color={color} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: "Search", tabBarIcon: ({ color }) => <SearchIcon color={color} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: "You", tabBarIcon: ({ color }) => <LibraryIcon color={color} /> }}
      />
    </Tabs>
  );
}
