import Link from "next/link";
import { ListVideo } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Playlist } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ChannelPlaylistsPage({
  params,
}: {
  params: { handle: string };
}) {
  const handle = decodeURIComponent(params.handle).replace(/^@/, "");
  const supabase = createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("id")
    .eq("handle", handle)
    .single();
  if (!channel) return null;

  const { data } = await supabase
    .from("playlists")
    .select("*, playlist_videos(count)")
    .eq("channel_id", channel.id)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  const playlists = (data ?? []) as (Playlist & {
    playlist_videos: { count: number }[];
  })[];

  if (playlists.length === 0) {
    return (
      <p className="py-12 text-center text-yt-sub">This channel has no playlists.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {playlists.map((p) => (
        <Link
          key={p.id}
          href={`/playlist/${p.id}`}
          className="rounded-xl bg-yt-surface p-4 hover:bg-yt-raised"
        >
          <div className="flex aspect-video items-center justify-center rounded-lg bg-yt-raised">
            <ListVideo className="h-10 w-10 text-yt-sub" />
          </div>
          <div className="mt-3 font-medium">{p.title}</div>
          <div className="text-sm text-yt-sub">
            {p.playlist_videos?.[0]?.count ?? 0} videos
          </div>
        </Link>
      ))}
    </div>
  );
}
