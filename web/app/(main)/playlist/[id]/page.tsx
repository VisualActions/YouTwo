import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Playlist, Video } from "@/lib/types";
import { formatCount, timeAgo, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("*, channels(handle, display_name)")
    .eq("id", params.id)
    .single();
  if (!playlist) notFound();
  const p = playlist as Playlist & { channels: { handle: string; display_name: string } };

  const { data: items } = await supabase
    .from("playlist_videos")
    .select("position, videos(*, channels!videos_channel_id_fkey(*))")
    .eq("playlist_id", p.id)
    .order("position");

  const videos = (items ?? [])
    .map((i) => i.videos as unknown as Video)
    .filter((v) => v && v.status === "ready");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">{p.title}</h1>
      <p className="mt-1 text-sm text-yt-sub">
        by{" "}
        <Link href={`/channel/@${p.channels.handle}`} className="text-yt-text hover:underline">
          {p.channels.display_name}
        </Link>{" "}
        · {videos.length} videos
      </p>
      {p.description && <p className="mt-2 text-sm text-yt-sub">{p.description}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {videos.length === 0 && (
          <p className="py-12 text-center text-yt-sub">This playlist is empty.</p>
        )}
        {videos.map((v, i) => (
          <Link
            key={v.id}
            href={`/watch/${v.id}`}
            className="flex items-center gap-4 rounded-xl p-2 hover:bg-yt-surface"
          >
            <span className="w-6 text-center text-sm text-yt-sub">{i + 1}</span>
            <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-yt-raised">
              {v.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
              )}
              {v.duration_seconds != null && (
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs">
                  {formatDuration(v.duration_seconds)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="line-clamp-2 font-medium">{v.title}</div>
              <div className="text-sm text-yt-sub">
                {v.channels?.display_name} · {formatCount(v.view_count)} views ·{" "}
                {timeAgo(v.published_at ?? v.created_at)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
