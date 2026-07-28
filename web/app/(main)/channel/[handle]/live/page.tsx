import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel, Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";
import ChannelAvatar from "@/components/ChannelAvatar";

export const dynamic = "force-dynamic";

export default async function ChannelLivePage({
  params,
}: {
  params: { handle: string };
}) {
  const handle = decodeURIComponent(params.handle).replace(/^@/, "");
  const supabase = createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("handle", handle)
    .single();
  if (!channel) return null;
  const c = channel as Channel;

  const { data } = await supabase
    .from("videos")
    .select("*, channels!videos_channel_id_fkey(*)")
    .eq("channel_id", c.id)
    .eq("status", "ready")
    .eq("visibility", "public")
    .eq("is_live_recording", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  const recordings = (data ?? []) as Video[];

  return (
    <div className="flex flex-col gap-8">
      {c.is_live ? (
        <Link
          href={`/live/@${c.handle}`}
          className="flex w-fit items-center gap-4 rounded-xl bg-yt-surface p-4 hover:bg-yt-raised"
        >
          <ChannelAvatar src={c.avatar_url} name={c.display_name} size={56} />
          <div>
            <div className="font-medium">{c.live_title || "Live stream"}</div>
            <div className="text-sm text-yt-sub">Streaming now — click to watch</div>
          </div>
          <span className="ml-4 rounded bg-yt-red px-1.5 py-0.5 text-xs font-semibold uppercase">
            Live
          </span>
        </Link>
      ) : recordings.length === 0 ? (
        <p className="py-12 text-center text-yt-sub">
          This channel isn&apos;t live right now and has no past streams.
        </p>
      ) : null}

      {recordings.length > 0 && (
        <div>
          <h3 className="mb-4 font-medium">Past live streams</h3>
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {recordings.map((v) => (
              <VideoCard key={v.id} video={v} hideChannel />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
