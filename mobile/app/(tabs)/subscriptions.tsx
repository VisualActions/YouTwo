import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import VideoCard from "../../components/VideoCard";
import { Button, EmptyState } from "../../components/ui";
import { useSession } from "../../lib/session";
import { supabase, VIDEO_SELECT, type Video } from "../../lib/supabase";
import { colors, space } from "../../theme";

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user) {
      setVideos([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("channel_id")
      .eq("subscriber_id", session.user.id);

    const ids = (subs ?? []).map((s) => s.channel_id);
    if (ids.length === 0) {
      setVideos([]);
    } else {
      const { data } = await supabase
        .from("videos")
        .select(VIDEO_SELECT)
        .in("channel_id", ids)
        .eq("status", "ready")
        .eq("visibility", "public")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(50);
      setVideos((data ?? []) as Video[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!sessionLoading) load();
  }, [sessionLoading, load]);

  if (sessionLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Sign in to see subscriptions"
          body="Your subscribed channels' newest videos appear here."
        />
        <Button title="Sign in" variant="blue" onPress={() => router.push("/login")} />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => <VideoCard video={item} />}
      contentContainerStyle={{ padding: space[4] }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.textSecondary}
        />
      }
      ListEmptyComponent={
        <EmptyState
          title="No subscriptions yet"
          body="Subscribe to a channel and its newest videos will show up here."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    padding: space[4],
  },
});
