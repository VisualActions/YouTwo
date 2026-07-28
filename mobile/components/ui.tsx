import { Image } from "expo-image";
import { Text, View, StyleSheet, Pressable, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { avatarColor, colors, radius, space, type } from "../theme";

/** The YouTwo mark: gradient-red badge carrying the "2" glyph. */
export function Brand({ size = 1 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 * size }}>
      <View
        style={{
          width: 38 * size,
          height: 26 * size,
          borderRadius: 9 * size,
          backgroundColor: colors.red,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width={17 * size} height={17 * size} viewBox="0 0 24 24">
          <Path
            d="M6.5 9 A5.5 5.5 0 1 1 17.5 9 L6.5 19 H18"
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: type.lg * size,
          fontWeight: "700",
          letterSpacing: -1 * size,
        }}
      >
        YouTwo
      </Text>
    </View>
  );
}

export function ChannelAvatar({
  src,
  name,
  size = 36,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={150}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColor(name),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.44, fontWeight: "500" }}>
        {(name || "?").charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export function VerifiedBadge({ size = 13 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={colors.textSecondary}
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      />
      <Path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke={colors.bg}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LiveBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <View style={styles.liveBadge}>
      <Text style={styles.liveBadgeText}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "blue";
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg =
    variant === "primary" ? colors.text : variant === "blue" ? colors.blue : colors.raised;
  const fg = variant === "secondary" ? colors.text : colors.textInverse;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: "500", fontSize: type.base }}>{title}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  liveBadge: {
    backgroundColor: colors.red,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: type.xs,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  button: {
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: space[4],
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 96,
    paddingHorizontal: space[6],
    gap: space[2],
  },
  emptyTitle: { color: colors.text, fontSize: type.lg, fontWeight: "600" },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: type.base,
    textAlign: "center",
    maxWidth: 320,
  },
});
