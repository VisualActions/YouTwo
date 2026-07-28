import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";
import { formatCount, timeAgo, formatDuration } from "@/lib/format";
import { hlsUrl } from "@/lib/storage";
import VideoPlayer from "@/components/VideoPlayer";
import ViewTracker from "@/components/ViewTracker";
import LikeButtons from "@/components/LikeButtons";
import SubscribeButton from "@/components/SubscribeButton";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import Comments from "@/components/Comments";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: video }, userRes] = await Promise.all([
    supabase.from("videos").select("*, channels!videos_channel_id_fkey(*)").eq("id", params.id).single(),
    supabase.auth.getUser(),
  ]);
  if (!video) notFound();
  const v = video as Video;
  const user = userRes.data.user;
  const channel = v.channels!;
  const isOwner = user?.id === v.channel_id;

  if (v.status !== "ready" && !isOwner) notFound();
  if (v.visibility === "private" && !isOwner) notFound();

  const [{ data: recRows }, subRes, ratingRes] = await Promise.all([
    supabase
      .from("videos")
      .select("*, channels!videos_channel_id_fkey(*)")
      .neq("id", v.id)
      .eq("status", "ready")
      .eq("visibility", "public")
      .or(
        v.tags.length > 0
          ? `tags.ov.{${v.tags.map((t) => `"${t.replace(/"/g, "")}"`).join(",")}},channel_id.eq.${v.channel_id}`
          : `channel_id.eq.${v.channel_id}`
      )
      .order("view_count", { ascending: false })
      .limit(15),
    user && user.id !== v.channel_id
      ? supabase
          .from("subscriptions")
          .select("channel_id")
          .eq("subscriber_id", user.id)
          .eq("channel_id", v.channel_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("video_ratings")
          .select("value")
          .eq("video_id", v.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const recommended = (recRows ?? []) as Video[];
  if (recommended.length < 8) {
    const { data: fill } = await supabase
      .from("videos")
      .select("*, channels!videos_channel_id_fkey(*)")
      .neq("id", v.id)
      .eq("status", "ready")
      .eq("visibility", "public")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(15);
    const seen = new Set(recommended.map((r) => r.id));
    for (const f of (fill ?? []) as Video[]) {
      if (!seen.has(f.id) && recommended.length < 15) recommended.push(f);
    }
  }

  const rating = (ratingRes.data?.value ?? 0) as 1 | -1 | 0;

  return (
    <div className="mx-auto flex max-w-[1700px] flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        {v.status === "ready" && v.playback_path ? (
          <VideoPlayer src={hlsUrl(v.playback_path)} poster={v.thumbnail_url} autoPlay />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-yt-raised">
            <p className="text-yt-sub">
              {v.status === "failed"
                ? "Processing failed for this video."
                : "This video is still processing. Check back soon."}
            </p>
          </div>
        )}
        <ViewTracker videoId={v.id} />

        <h1 className="mt-3 text-xl font-bold">{v.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/channel/@${channel.handle}`}>
              <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={40} />
            </Link>
            <div>
              <Link
                href={`/channel/@${channel.handle}`}
                className="flex items-center gap-1 font-medium"
              >
                {channel.display_name}
                {channel.verified && <VerifiedBadge />}
              </Link>
              <div className="text-xs text-yt-sub">
                {formatCount(channel.subscriber_count)} subscribers
              </div>
            </div>
            <div className="ml-3">
              {isOwner ? (
                <Link
                  href={`/studio/content/${v.id}`}
                  className="flex h-9 items-center rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover"
                >
                  Edit video
                </Link>
              ) : (
                <SubscribeButton
                  channelId={channel.id}
                  initialSubscribed={!!subRes.data}
                  signedIn={!!user}
                />
              )}
            </div>
          </div>
          <LikeButtons
            videoId={v.id}
            likeCount={v.like_count}
            dislikeCount={v.dislike_count}
            initialRating={rating}
            signedIn={!!user}
          />
        </div>

        <div className="mt-4 rounded-xl bg-yt-surface p-3 text-sm">
          <div className="font-medium">
            {formatCount(v.view_count)} views · {timeAgo(v.published_at ?? v.created_at)}
            {v.tags.length > 0 && (
              <span className="ml-2 font-normal text-yt-blue">
                {v.tags.slice(0, 5).map((t) => `#${t}`).join(" ")}
              </span>
            )}
          </div>
          {v.description && (
            <p className="mt-2 whitespace-pre-wrap text-yt-text">{v.description}</p>
          )}
        </div>

        <Comments videoId={v.id} />
      </div>

      <aside className="w-full shrink-0 xl:w-[400px]">
        <div className="flex flex-col gap-3">
          {recommended.map((r) => (
            <div key={r.id} className="flex gap-2">
              <Link
                href={`/watch/${r.id}`}
                className="relative block aspect-video w-42 shrink-0 overflow-hidden rounded-lg bg-yt-raised"
                style={{ width: 168 }}
              >
                {r.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnail_url} alt="" className="h-full w-full object-cover" />
                )}
                {r.duration_seconds != null && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs">
                    {formatDuration(r.duration_seconds)}
                  </span>
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/watch/${r.id}`}>
                  <h3 className="line-clamp-2 text-sm font-medium leading-5">{r.title}</h3>
                </Link>
                {r.channels && (
                  <Link
                    href={`/channel/@${r.channels.handle}`}
                    className="mt-1 flex items-center gap-1 text-xs text-yt-sub hover:text-yt-text"
                  >
                    <span className="truncate">{r.channels.display_name}</span>
                    {r.channels.verified && <VerifiedBadge className="h-3 w-3" />}
                  </Link>
                )}
                <div className="text-xs text-yt-sub">
                  {formatCount(r.view_count)} views · {timeAgo(r.published_at ?? r.created_at)}
                </div>
              </div>
            </div>
          ))}
          {recommended.length === 0 && (
            <p className="text-sm text-yt-sub">No related videos yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
