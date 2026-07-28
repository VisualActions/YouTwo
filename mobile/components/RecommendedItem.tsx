import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, formatCount, formatDuration, radius, space, timeAgo, type } from "../theme";
import type { Video } from "../lib/supabase";
import { VerifiedBadge } from "./ui";

/** Compact row used in the watch screen's "Up next" list. */
export default function RecommendedItem({ video }: { video: Video }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/watch/${video.id}`)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.thumbWrap}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.raised }]} />
        )}
        {video.duration_seconds != null && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(video.duration_seconds)}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <View style={styles.nameRow}>
          <Text style={styles.sub} numberOfLines={1}>
            {video.channels?.display_name}
          </Text>
          {video.channels?.verified ? <VerifiedBadge size={11} /> : null}
        </View>
        <Text style={styles.sub}>
          {formatCount(video.view_count)} views · {timeAgo(video.published_at ?? video.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space[2], marginBottom: space[3] },
  thumbWrap: { width: 168, aspectRatio: 16 / 9, borderRadius: radius.md, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  duration: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: radius.sm,
    paddingHorizontal: 4,
  },
  durationText: { color: "#fff", fontSize: type.xs, fontWeight: "500" },
  title: { color: colors.text, fontSize: type.base, fontWeight: "500", lineHeight: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  sub: { color: colors.textSecondary, fontSize: type.sm },
});
