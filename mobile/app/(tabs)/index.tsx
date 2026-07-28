import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import VideoCard, { LiveChannelRow } from "../../components/VideoCard";
import { Brand, EmptyState } from "../../components/ui";
import { supabase, VIDEO_SELECT, type Channel, type Video } from "../../lib/supabase";
import { colors, space, type } from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [live, setLive] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [{ data: liveRows, error: liveErr }, { data: videoRows, error: vidErr }] =
      await Promise.all([
        supabase
          .from("channels")
          .select("*")
          .eq("is_live", true)
          .order("subscriber_count", { ascending: false })
          .limit(12),
        supabase
          .from("videos")
          .select(VIDEO_SELECT)
          .eq("status", "ready")
          .eq("visibility", "public")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(50),
      ]);

    if (liveErr || vidErr) setError((liveErr ?? vidErr)!.message);
    setLive((liveRows ?? []) as Channel[]);
    setVideos((videoRows ?? []) as Video[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => <VideoCard video={item} />}
      contentContainerStyle={styles.list}
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
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Brand />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {live.length > 0 && (
            <View style={{ marginBottom: space[5] }}>
              <Text style={styles.sectionTitle}>Live now</Text>
              {live.map((c) => (
                <LiveChannelRow
                  key={c.id}
                  name={c.display_name}
                  title={c.live_title || "Live stream"}
                  avatarUrl={c.avatar_url}
                  verified={c.verified}
                  onPress={() => router.push(`/channel/${c.handle}`)}
                />
              ))}
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="Nothing here yet"
          body="Videos uploaded through YouTwo Studio show up here once they finish processing."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: space[4], paddingBottom: space[6] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: { paddingVertical: space[3] },
  sectionTitle: {
    color: colors.text,
    fontSize: type.lg,
    fontWeight: "600",
    marginBottom: space[3],
  },
  error: { color: colors.danger, fontSize: type.base, marginBottom: space[3] },
});
