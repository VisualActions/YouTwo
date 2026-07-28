import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel, Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: liveChannels }, { data: recent }, subscribedIds] =
    await Promise.all([
      supabase
        .from("channels")
        .select("*")
        .eq("is_live", true)
        .order("subscriber_count", { ascending: false })
        .limit(12),
      supabase
        .from("videos")
        .select("*, channels!videos_channel_id_fkey(*)")
        .eq("status", "ready")
        .eq("visibility", "public")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(48),
      user
        ? supabase
            .from("subscriptions")
            .select("channel_id")
            .eq("subscriber_id", user.id)
            .then(({ data }) => new Set((data ?? []).map((r) => r.channel_id)))
        : Promise.resolve(new Set<string>()),
    ]);

  const videos = (recent ?? []) as Video[];
  const fromSubs = user
    ? videos.filter((v) => subscribedIds.has(v.channel_id)).slice(0, 12)
    : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      {(liveChannels ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Live now</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {(liveChannels as Channel[]).map((c) => (
              <Link
                key={c.id}
                href={`/live/@${c.handle}`}
                className="flex items-center gap-3 rounded-xl bg-yt-surface p-3 hover:bg-yt-raised"
              >
                <ChannelAvatar src={c.avatar_url} name={c.display_name} size={48} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-medium">{c.display_name}</span>
                    {c.verified && <VerifiedBadge />}
                  </div>
                  <div className="truncate text-sm text-yt-sub">
                    {c.live_title || "Live stream"}
                  </div>
                </div>
                <span className="ml-auto rounded bg-yt-red px-1.5 py-0.5 text-xs font-semibold uppercase">
                  Live
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {fromSubs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">From your subscriptions</h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {fromSubs.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {videos.length === 0 && (liveChannels ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-xl font-semibold">Nothing here yet</h2>
          <p className="mt-2 text-yt-sub">
            Videos uploaded through YouTwo Studio will show up here once they finish
            processing.
          </p>
        </div>
      ) : (
        <section>
          {fromSubs.length > 0 && (
            <h2 className="mb-4 text-xl font-semibold">Recent</h2>
          )}
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
