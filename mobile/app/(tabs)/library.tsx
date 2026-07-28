import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, ChannelAvatar, EmptyState, VerifiedBadge } from "../../components/ui";
import { useMyChannel, useSession } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { colors, formatCount, radius, space, type } from "../../theme";

export default function LibraryScreen() {
  const router = useRouter();
  const { session, loading } = useSession();
  const channel = useMyChannel(session);

  if (loading) {
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
          title="You"
          body="Sign in to see your channel, subscriptions, and uploads."
        />
        <Button title="Sign in" variant="blue" onPress={() => router.push("/login")} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: space[4] }}>
      <View style={styles.identity}>
        <ChannelAvatar src={channel?.avatar_url} name={channel?.display_name ?? "?"} size={72} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {channel?.display_name ?? session.user.email}
            </Text>
            {channel?.verified ? <VerifiedBadge size={15} /> : null}
          </View>
          {channel ? (
            <Text style={styles.sub}>
              @{channel.handle} · {formatCount(channel.subscriber_count)} subscribers
            </Text>
          ) : null}
        </View>
      </View>

      {channel ? (
        <Button
          title="View your channel"
          variant="secondary"
          style={{ marginTop: space[4] }}
          onPress={() => router.push(`/channel/${channel.handle}`)}
        />
      ) : null}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Uploading and going live</Text>
        <Text style={styles.noteBody}>
          Uploads, stream keys, and analytics live in YouTwo Studio on the web app. Open your
          YouTwo server in a browser and go to Studio.
        </Text>
      </View>

      <Button
        title="Sign out"
        variant="secondary"
        style={{ marginTop: space[5] }}
        onPress={async () => {
          await supabase.auth.signOut();
        }}
      />
    </ScrollView>
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
  identity: { flexDirection: "row", alignItems: "center", gap: space[4] },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: colors.text, fontSize: type.lg, fontWeight: "700" },
  sub: { color: colors.textSecondary, fontSize: type.base, marginTop: 2 },
  note: {
    marginTop: space[6],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: { color: colors.text, fontSize: type.base, fontWeight: "500" },
  noteBody: {
    color: colors.textSecondary,
    fontSize: type.base,
    marginTop: space[2],
    lineHeight: 20,
  },
});
