import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import { formatCount } from "@/lib/format";
import { liveUrl } from "@/lib/storage";
import VideoPlayer from "@/components/VideoPlayer";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import SubscribeButton from "@/components/SubscribeButton";
import LiveChat from "@/components/LiveChat";

export const dynamic = "force-dynamic";

export default async function LivePage({ params }: { params: { handle: string } }) {
  const handle = decodeURIComponent(params.handle).replace(/^@/, "");
  const supabase = createClient();

  const [{ data: channel }, userRes] = await Promise.all([
    supabase.from("channels").select("*").eq("handle", handle).single(),
    supabase.auth.getUser(),
  ]);
  if (!channel) notFound();
  const c = channel as Channel;
  const user = userRes.data.user;

  const subRes =
    user && user.id !== c.id
      ? await supabase
          .from("subscriptions")
          .select("channel_id")
          .eq("subscriber_id", user.id)
          .eq("channel_id", c.id)
          .maybeSingle()
      : { data: null };

  return (
    <div className="mx-auto flex max-w-[1700px] flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        {c.is_live ? (
          <VideoPlayer src={liveUrl(c.id)} live autoPlay />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-yt-raised">
            <p className="text-lg font-medium">
              {c.display_name} isn&apos;t live right now
            </p>
            <Link href={`/channel/@${c.handle}`} className="text-sm text-yt-blue">
              Browse their videos
            </Link>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-xl font-bold">{c.live_title || `${c.display_name} live`}</h1>
          {c.is_live && (
            <span className="rounded bg-yt-red px-1.5 py-0.5 text-xs font-semibold uppercase">
              Live
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Link href={`/channel/@${c.handle}`}>
            <ChannelAvatar src={c.avatar_url} name={c.display_name} size={40} />
          </Link>
          <div>
            <Link
              href={`/channel/@${c.handle}`}
              className="flex items-center gap-1 font-medium"
            >
              {c.display_name}
              {c.verified && <VerifiedBadge />}
            </Link>
            <div className="text-xs text-yt-sub">
              {formatCount(c.subscriber_count)} subscribers
            </div>
          </div>
          <div className="ml-3">
            {user?.id === c.id ? (
              <Link
                href="/studio/stream"
                className="flex h-9 items-center rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover"
              >
                Stream settings
              </Link>
            ) : (
              <SubscribeButton
                channelId={c.id}
                initialSubscribed={!!subRes.data}
                signedIn={!!user}
              />
            )}
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 xl:w-[400px]">
        <LiveChat channelId={c.id} signedIn={!!user} />
      </aside>
    </div>
  );
}
