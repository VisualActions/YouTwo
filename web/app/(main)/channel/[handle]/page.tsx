import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function ChannelVideosPage({
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
    .from("videos")
    .select("*, channels!videos_channel_id_fkey(*)")
    .eq("channel_id", channel.id)
    .eq("status", "ready")
    .eq("visibility", "public")
    .eq("is_live_recording", false)
    .order("published_at", { ascending: false, nullsFirst: false });

  const videos = (data ?? []) as Video[];

  if (videos.length === 0) {
    return <p className="py-12 text-center text-yt-sub">This channel has no videos.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} hideChannel />
      ))}
    </div>
  );
}
