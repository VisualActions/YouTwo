import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel, Video } from "@/lib/types";
import { formatCount, timeAgo, formatDuration } from "@/lib/format";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { search_query?: string };
}) {
  const q = (searchParams.search_query ?? "").trim();
  const supabase = createClient();

  if (!q) {
    return <p className="py-24 text-center text-yt-sub">Type something to search.</p>;
  }

  const like = `%${q.replace(/[%_]/g, "")}%`;
  const [{ data: channels }, { data: videos }, { data: tagVideos }] =
    await Promise.all([
      supabase
        .from("channels")
        .select("*")
        .or(`handle.ilike.${like},display_name.ilike.${like}`)
        .order("subscriber_count", { ascending: false })
        .limit(5),
      supabase
        .from("videos")
        .select("*, channels!videos_channel_id_fkey(*)")
        .eq("status", "ready")
        .eq("visibility", "public")
        .ilike("title", like)
        .order("view_count", { ascending: false })
        .limit(30),
      supabase
        .from("videos")
        .select("*, channels!videos_channel_id_fkey(*)")
        .eq("status", "ready")
        .eq("visibility", "public")
        .contains("tags", [q.toLowerCase()])
        .order("view_count", { ascending: false })
        .limit(10),
    ]);

  const seen = new Set<string>();
  const allVideos = [...((videos ?? []) as Video[]), ...((tagVideos ?? []) as Video[])].filter(
    (v) => (seen.has(v.id) ? false : (seen.add(v.id), true))
  );
  const channelResults = (channels ?? []) as Channel[];

  if (channelResults.length === 0 && allVideos.length === 0) {
    return (
      <p className="py-24 text-center text-yt-sub">
        No results for &quot;{q}&quot;.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {channelResults.map((c) => (
        <Link
          key={c.id}
          href={`/channel/@${c.handle}`}
          className="flex items-center gap-6 rounded-xl p-4 hover:bg-yt-surface"
        >
          <div className="flex w-52 justify-center">
            <ChannelAvatar src={c.avatar_url} name={c.display_name} size={88} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-lg font-medium">
              <span className="truncate">{c.display_name}</span>
              {c.verified && <VerifiedBadge />}
              {c.is_live && (
                <span className="rounded bg-yt-red px-1.5 py-0.5 text-xs font-semibold uppercase">
                  Live
                </span>
              )}
            </div>
            <div className="text-sm text-yt-sub">
              @{c.handle} · {formatCount(c.subscriber_count)} subscribers
            </div>
            {c.description && (
              <p className="mt-1 line-clamp-1 text-sm text-yt-sub">{c.description}</p>
            )}
          </div>
        </Link>
      ))}

      {channelResults.length > 0 && allVideos.length > 0 && (
        <hr className="border-yt-border" />
      )}

      {allVideos.map((v) => (
        <div key={v.id} className="flex flex-col gap-4 sm:flex-row">
          <Link
            href={`/watch/${v.id}`}
            className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-yt-raised sm:w-64"
          >
            {v.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
            )}
            {v.duration_seconds != null && (
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-xs font-medium">
                {formatDuration(v.duration_seconds)}
              </span>
            )}
          </Link>
          <div className="min-w-0">
            <Link href={`/watch/${v.id}`} className="text-lg font-medium hover:underline">
              <span className="line-clamp-2">{v.title}</span>
            </Link>
            <div className="mt-1 text-sm text-yt-sub">
              {formatCount(v.view_count)} views · {timeAgo(v.published_at ?? v.created_at)}
            </div>
            {v.channels && (
              <Link
                href={`/channel/@${v.channels.handle}`}
                className="mt-2 flex items-center gap-2 text-sm text-yt-sub hover:text-yt-text"
              >
                <ChannelAvatar
                  src={v.channels.avatar_url}
                  name={v.channels.display_name}
                  size={24}
                />
                <span className="truncate">{v.channels.display_name}</span>
                {v.channels.verified && <VerifiedBadge />}
              </Link>
            )}
            <p className="mt-2 line-clamp-1 text-sm text-yt-sub">{v.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
