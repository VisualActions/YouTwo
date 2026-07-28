import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import { formatCount } from "@/lib/format";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import SubscribeButton from "@/components/SubscribeButton";
import ChannelTabs from "@/components/ChannelTabs";

export default async function ChannelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { handle: string };
}) {
  const handle = decodeURIComponent(params.handle).replace(/^@/, "");
  const supabase = createClient();

  const [{ data: channel }, userRes] = await Promise.all([
    supabase.from("channels").select("*").eq("handle", handle).single(),
    supabase.auth.getUser(),
  ]);
  if (!channel) notFound();
  const c = channel as Channel;
  const user = userRes.data.user;

  let subscribed = false;
  let videoCount = 0;
  const [{ count }, subRes] = await Promise.all([
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("channel_id", c.id)
      .eq("status", "ready")
      .eq("visibility", "public"),
    user && user.id !== c.id
      ? supabase
          .from("subscriptions")
          .select("channel_id")
          .eq("subscriber_id", user.id)
          .eq("channel_id", c.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  videoCount = count ?? 0;
  subscribed = !!subRes.data;

  return (
    <div className="mx-auto max-w-[1200px]">
      {c.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.banner_url}
          alt=""
          className="mb-6 h-32 w-full rounded-2xl object-cover sm:h-44"
        />
      ) : (
        <div className="mb-6 h-24 w-full rounded-2xl bg-gradient-to-r from-yt-surface to-yt-raised sm:h-32" />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ChannelAvatar src={c.avatar_url} name={c.display_name} size={128} />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <span className="truncate">{c.display_name}</span>
            {c.verified && <VerifiedBadge className="h-5 w-5" />}
            {c.is_live && (
              <span className="rounded bg-yt-red px-1.5 py-0.5 text-xs font-semibold uppercase">
                Live
              </span>
            )}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-yt-sub">
            <span className="font-medium text-yt-text">@{c.handle}</span>
            <span>·</span>
            <span>{formatCount(c.subscriber_count)} subscribers</span>
            <span>·</span>
            <span>{formatCount(videoCount)} videos</span>
          </div>
          {c.description && (
            <p className="mt-1 line-clamp-1 max-w-2xl text-sm text-yt-sub">
              {c.description}
            </p>
          )}
          <div className="mt-3">
            {user?.id === c.id ? (
              <Link
                href="/studio/customization"
                className="inline-flex h-9 items-center rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover"
              >
                Customize channel
              </Link>
            ) : (
              <SubscribeButton
                channelId={c.id}
                initialSubscribed={subscribed}
                signedIn={!!user}
              />
            )}
          </div>
        </div>
      </div>

      <ChannelTabs handle={c.handle} />
      <div className="py-6">{children}</div>
    </div>
  );
}
