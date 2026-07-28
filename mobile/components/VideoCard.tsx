import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, formatCount, formatDuration, radius, space, timeAgo, type } from "../theme";
import type { Video } from "../lib/supabase";
import { ChannelAvatar, LiveBadge, VerifiedBadge } from "./ui";

export default function VideoCard({ video }: { video: Video }) {
  const router = useRouter();
  const channel = video.channels;

  return (
    <Pressable
      onPress={() => router.push(`/watch/${video.id}`)}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.thumbWrap}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.thumb} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.thumb, { backgroundColor: colors.raised }]} />
        )}
        {video.duration_seconds != null && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(video.duration_seconds)}</Text>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <ChannelAvatar src={channel?.avatar_url} name={channel?.display_name ?? "?"} size={36} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.subRow}>
            <Text style={styles.sub} numberOfLines={1}>
              {channel?.display_name}
            </Text>
            {channel?.verified ? <VerifiedBadge size={12} /> : null}
          </View>
          <Text style={styles.sub}>
            {formatCount(video.view_count)} views · {timeAgo(video.published_at ?? video.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function LiveChannelRow({
  name,
  title,
  avatarUrl,
  verified,
  onPress,
}: {
  name: string;
  title: string;
  avatarUrl?: string | null;
  verified?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.liveRow, { opacity: pressed ? 0.85 : 1 }]}>
      <ChannelAvatar src={avatarUrl} name={name} size={48} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.subRow}>
          <Text style={styles.liveName} numberOfLines={1}>
            {name}
          </Text>
          {verified ? <VerifiedBadge size={12} /> : null}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <LiveBadge />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[3], marginBottom: space[6] },
  thumbWrap: { width: "100%", aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  duration: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: { color: "#fff", fontSize: type.sm, fontWeight: "500" },
  meta: { flexDirection: "row", gap: space[3], paddingHorizontal: space[1] },
  title: { color: colors.text, fontSize: type.base, fontWeight: "500", lineHeight: 20 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  sub: { color: colors.textSecondary, fontSize: type.base },
  liveName: { color: colors.text, fontSize: type.base, fontWeight: "500" },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    marginBottom: space[3],
  },
});
