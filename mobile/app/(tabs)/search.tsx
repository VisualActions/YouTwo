import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import VideoCard from "../../components/VideoCard";
import { ChannelAvatar, EmptyState, VerifiedBadge } from "../../components/ui";
import { supabase, VIDEO_SELECT, type Channel, type Video } from "../../lib/supabase";
import { colors, formatCount, radius, space, type } from "../../theme";

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run() {
    const term = q.trim();
    if (!term) return;
    setBusy(true);
    setSearched(true);
    const like = `%${term.replace(/[%_]/g, "")}%`;

    const [{ data: ch }, { data: byTitle }, { data: byTag }] = await Promise.all([
      supabase
        .from("channels")
        .select("*")
        .or(`handle.ilike.${like},display_name.ilike.${like}`)
        .order("subscriber_count", { ascending: false })
        .limit(5),
      supabase
        .from("videos")
        .select(VIDEO_SELECT)
        .eq("status", "ready")
        .eq("visibility", "public")
        .ilike("title", like)
        .order("view_count", { ascending: false })
        .limit(30),
      supabase
        .from("videos")
        .select(VIDEO_SELECT)
        .eq("status", "ready")
        .eq("visibility", "public")
        .contains("tags", [term.toLowerCase()])
        .order("view_count", { ascending: false })
        .limit(10),
    ]);

    const seen = new Set<string>();
    const merged = [...((byTitle ?? []) as Video[]), ...((byTag ?? []) as Video[])].filter((v) =>
      seen.has(v.id) ? false : (seen.add(v.id), true)
    );
    setChannels((ch ?? []) as Channel[]);
    setVideos(merged);
    setBusy(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.searchRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={run}
          placeholder="Search YouTwo"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      {busy ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => <VideoCard video={item} />}
          contentContainerStyle={{ padding: space[4] }}
          ListHeaderComponent={
            channels.length > 0 ? (
              <View style={{ marginBottom: space[4] }}>
                {channels.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/channel/${c.handle}`)}
                    style={styles.channelRow}
                  >
                    <ChannelAvatar src={c.avatar_url} name={c.display_name} size={48} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.channelName} numberOfLines={1}>
                          {c.display_name}
                        </Text>
                        {c.verified ? <VerifiedBadge size={12} /> : null}
                      </View>
                      <Text style={styles.sub}>
                        @{c.handle} · {formatCount(c.subscriber_count)} subscribers
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            searched && channels.length === 0 ? (
              <EmptyState title={`No results for "${q.trim()}"`} />
            ) : !searched ? (
              <EmptyState title="Search YouTwo" body="Find videos by title or tag, and channels by name." />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { padding: space[4], paddingBottom: space[2] },
  input: {
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.text,
    paddingHorizontal: space[4],
    fontSize: type.md,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[3],
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  channelName: { color: colors.text, fontSize: type.md, fontWeight: "500" },
  sub: { color: colors.textSecondary, fontSize: type.base },
});
