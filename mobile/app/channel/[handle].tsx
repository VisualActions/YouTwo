import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import VideoCard from "../../components/VideoCard";
import { Button, ChannelAvatar, EmptyState, LiveBadge, VerifiedBadge } from "../../components/ui";
import { useSession } from "../../lib/session";
import { supabase, VIDEO_SELECT, type Channel, type Video } from "../../lib/supabase";
import { colors, formatCount, radius, space, type } from "../../theme";

export default function ChannelScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const router = useRouter();
  const { session } = useSession();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const clean = String(handle ?? "").replace(/^@/, "");
      const { data: ch } = await supabase.from("channels").select("*").eq("handle", clean).single();
      if (cancelled) return;
      const c = ch as Channel | null;
      setChannel(c);

      if (c) {
        const { data } = await supabase
          .from("videos")
          .select(VIDEO_SELECT)
          .eq("channel_id", c.id)
          .eq("status", "ready")
          .eq("visibility", "public")
          .order("published_at", { ascending: false, nullsFirst: false });
        if (!cancelled) setVideos((data ?? []) as Video[]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  useEffect(() => {
    if (!session?.user || !channel) return;
    supabase
      .from("subscriptions")
      .select("channel_id")
      .eq("subscriber_id", session.user.id)
      .eq("channel_id", channel.id)
      .maybeSingle()
      .then(({ data }) => setSubscribed(!!data));
  }, [session?.user?.id, channel?.id]);

  async function toggleSubscribe() {
    if (!session?.user || !channel) return router.push("/login");
    const next = !subscribed;
    setSubscribed(next);
    if (next) {
      await supabase
        .from("subscriptions")
        .insert({ subscriber_id: session.user.id, channel_id: channel.id });
    } else {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", session.user.id)
        .eq("channel_id", channel.id);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!channel) {
    return <EmptyState title="Channel not found" />;
  }

  const isOwner = session?.user?.id === channel.id;

  return (
    <FlatList
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => <VideoCard video={item} />}
      contentContainerStyle={{ padding: space[4] }}
      ListHeaderComponent={
        <View style={{ marginBottom: space[4] }}>
          {channel.banner_url ? (
            <Image source={{ uri: channel.banner_url }} style={styles.banner} contentFit="cover" />
          ) : (
            <View style={[styles.banner, { backgroundColor: colors.surface }]} />
          )}

          <View style={styles.head}>
            <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={80} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {channel.display_name}
                </Text>
                {channel.verified ? <VerifiedBadge size={16} /> : null}
                {channel.is_live ? <LiveBadge /> : null}
              </View>
              <Text style={styles.sub}>
                @{channel.handle} · {formatCount(channel.subscriber_count)} subscribers
              </Text>
            </View>
          </View>

          {channel.description ? (
            <Text style={styles.description}>{channel.description}</Text>
          ) : null}

          {!isOwner ? (
            <Button
              title={subscribed ? "Subscribed" : "Subscribe"}
              variant={subscribed ? "secondary" : "primary"}
              onPress={toggleSubscribe}
              style={{ marginTop: space[4], alignSelf: "flex-start" }}
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={<EmptyState title="This channel has no videos." />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  banner: { width: "100%", height: 110, borderRadius: radius.lg },
  head: { flexDirection: "row", alignItems: "center", gap: space[4], marginTop: space[4] },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { color: colors.text, fontSize: type.xl, fontWeight: "700" },
  sub: { color: colors.textSecondary, fontSize: type.base, marginTop: 2 },
  description: {
    color: colors.textSecondary,
    fontSize: type.base,
    marginTop: space[3],
    lineHeight: 20,
  },
});
