import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import { formatCount, joinedDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChannelAboutPage({
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

  const { data: viewsData } = await supabase
    .from("videos")
    .select("view_count")
    .eq("channel_id", c.id)
    .eq("status", "ready");
  const totalViews = (viewsData ?? []).reduce((s, v) => s + (v.view_count ?? 0), 0);

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
      <div>
        <h2 className="mb-3 text-lg font-medium">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-yt-text">
          {c.description || "No description."}
        </p>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-medium">Stats</h2>
        <ul className="flex flex-col gap-2 text-sm text-yt-sub">
          <li className="border-b border-yt-border pb-2">
            Joined {joinedDate(c.created_at)}
          </li>
          <li className="border-b border-yt-border pb-2">
            {formatCount(c.subscriber_count)} subscribers
          </li>
          <li className="border-b border-yt-border pb-2">
            {formatCount(totalViews)} views
          </li>
        </ul>
      </div>
    </div>
  );
}
