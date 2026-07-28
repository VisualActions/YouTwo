import { useEvent } from "expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { ChannelAvatar, Button, EmptyState, VerifiedBadge } from "../../components/ui";
import RecommendedItem from "../../components/RecommendedItem";
import { useSession } from "../../lib/session";
import { hlsUrl, supabase, VIDEO_SELECT, type Video } from "../../lib/supabase";
import { colors, formatCount, radius, space, timeAgo, type } from "../../theme";

export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();

  const [video, setVideo] = useState<Video | null>(null);
  const [recommended, setRecommended] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<1 | -1 | 0>(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const source = video?.playback_path ? hlsUrl(video.playback_path) : null;
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    if (source) p.play();
  });
  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("videos").select(VIDEO_SELECT).eq("id", id).single();
      if (cancelled) return;
      const v = data as Video | null;
      setVideo(v);
      setLikes(v?.like_count ?? 0);
      setDislikes(v?.dislike_count ?? 0);
      setLoading(false);

      if (v) {
        // Count the view the same way the web app does.
        supabase.rpc("record_view", { target_video: v.id });

        const filter =
          v.tags.length > 0
            ? `tags.ov.{${v.tags.map((t) => `"${t.replace(/"/g, "")}"`).join(",")}},channel_id.eq.${v.channel_id}`
            : `channel_id.eq.${v.channel_id}`;
        const { data: rec } = await supabase
          .from("videos")
          .select(VIDEO_SELECT)
          .neq("id", v.id)
          .eq("status", "ready")
          .eq("visibility", "public")
          .or(filter)
          .order("view_count", { ascending: false })
          .limit(15);
        if (!cancelled) setRecommended((rec ?? []) as Video[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!session?.user || !video) return;
    supabase
      .from("video_ratings")
      .select("value")
      .eq("video_id", video.id)
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setRating(((data?.value ?? 0) as 1 | -1 | 0)));
    supabase
      .from("subscriptions")
      .select("channel_id")
      .eq("subscriber_id", session.user.id)
      .eq("channel_id", video.channel_id)
      .maybeSingle()
      .then(({ data }) => setSubscribed(!!data));
  }, [session?.user?.id, video?.id]);

  const rate = useCallback(
    async (next: 1 | -1) => {
      if (!session?.user || !video) return router.push("/login");
      const value: 1 | -1 | 0 = rating === next ? 0 : next;
      const prev = rating;
      setRating(value);
      setLikes((n) => n + (value === 1 ? 1 : 0) - (prev === 1 ? 1 : 0));
      setDislikes((n) => n + (value === -1 ? 1 : 0) - (prev === -1 ? 1 : 0));

      if (value === 0) {
        await supabase
          .from("video_ratings")
          .delete()
          .eq("video_id", video.id)
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("video_ratings")
          .upsert({ video_id: video.id, user_id: session.user.id, value });
      }
    },
    [rating, session?.user?.id, video?.id]
  );

  async function toggleSubscribe() {
    if (!session?.user || !video) return router.push("/login");
    const next = !subscribed;
    setSubscribed(next);
    if (next) {
      await supabase
        .from("subscriptions")
        .insert({ subscriber_id: session.user.id, channel_id: video.channel_id });
    } else {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", session.user.id)
        .eq("channel_id", video.channel_id);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!video) {
    return <EmptyState title="Video not found" body="It may have been removed or made private." />;
  }

  const channel = video.channels;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: space[6] }}>
      {source ? (
        <VideoView
          player={player}
          style={styles.player}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          nativeControls
        />
      ) : (
        <View style={[styles.player, styles.playerFallback]}>
          <Text style={styles.sub}>
            {video.status === "failed"
              ? "Processing failed for this video."
              : "This video is still processing."}
          </Text>
        </View>
      )}

      <View style={{ padding: space[4] }}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.sub}>
          {formatCount(video.view_count)} views · {timeAgo(video.published_at ?? video.created_at)}
        </Text>

        <View style={styles.actions}>
          <Pressable onPress={() => rate(1)} style={styles.action}>
            <ThumbIcon active={rating === 1} />
            <Text style={[styles.actionText, rating === 1 && { color: colors.blue }]}>
              {formatCount(likes)}
            </Text>
          </Pressable>
          <Pressable onPress={() => rate(-1)} style={styles.action}>
            <ThumbIcon down active={rating === -1} />
            <Text style={[styles.actionText, rating === -1 && { color: colors.blue }]}>
              {formatCount(dislikes)}
            </Text>
          </Pressable>
        </View>

        {channel ? (
          <View style={styles.channelRow}>
            <Pressable
              onPress={() => router.push(`/channel/${channel.handle}`)}
              style={styles.channelInfo}
            >
              <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.channelName} numberOfLines={1}>
                    {channel.display_name}
                  </Text>
                  {channel.verified ? <VerifiedBadge size={12} /> : null}
                </View>
                <Text style={styles.subSmall}>
                  {formatCount(channel.subscriber_count)} subscribers
                </Text>
              </View>
            </Pressable>
            <Button
              title={subscribed ? "Subscribed" : "Subscribe"}
              variant={subscribed ? "secondary" : "primary"}
              onPress={toggleSubscribe}
            />
          </View>
        ) : null}

        {video.description ? (
          <View style={styles.description}>
            <Text style={styles.descriptionText}>{video.description}</Text>
            {video.tags.length > 0 ? (
              <Text style={styles.tags}>{video.tags.map((t) => `#${t}`).join("  ")}</Text>
            ) : null}
          </View>
        ) : null}

        {recommended.length > 0 ? (
          <View style={{ marginTop: space[5] }}>
            <Text style={styles.sectionTitle}>Up next</Text>
            {recommended.map((r) => (
              <RecommendedItem key={r.id} video={r} />
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function ThumbIcon({ down, active }: { down?: boolean; active?: boolean }) {
  const color = active ? colors.blue : colors.text;
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      style={down ? { transform: [{ rotate: "180deg" }] } : undefined}
    >
      <Path
        d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
        fill={active ? color : "none"}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  player: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  playerFallback: { alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: type.md, fontWeight: "700", lineHeight: 22 },
  sub: { color: colors.textSecondary, fontSize: type.base, marginTop: 4 },
  subSmall: { color: colors.textSecondary, fontSize: type.sm },
  actions: { flexDirection: "row", gap: space[4], marginTop: space[4] },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    backgroundColor: colors.raised,
    borderRadius: radius.pill,
    paddingHorizontal: space[4],
    height: 36,
  },
  actionText: { color: colors.text, fontSize: type.base, fontWeight: "500" },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    marginTop: space[5],
  },
  channelInfo: { flexDirection: "row", alignItems: "center", gap: space[3], flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  channelName: { color: colors.text, fontSize: type.base, fontWeight: "500" },
  description: {
    marginTop: space[4],
    padding: space[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  descriptionText: { color: colors.text, fontSize: type.base, lineHeight: 20 },
  tags: { color: colors.blue, fontSize: type.base, marginTop: space[2] },
  sectionTitle: {
    color: colors.text,
    fontSize: type.md,
    fontWeight: "600",
    marginBottom: space[3],
  },
});
