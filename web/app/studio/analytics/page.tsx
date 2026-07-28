import { createClient } from "@/lib/supabase/server";
import type { Channel, Video } from "@/lib/types";
import { formatCount } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since = new Date(Date.now() - 27 * 86400_000);
  since.setHours(0, 0, 0, 0);

  const [{ data: channel }, { data: vids }, { data: viewRows }] = await Promise.all([
    supabase.from("channels").select("*").eq("id", user.id).single(),
    supabase
      .from("videos")
      .select("*")
      .eq("channel_id", user.id)
      .order("view_count", { ascending: false }),
    supabase
      .from("video_views")
      .select("viewed_at, videos!inner(channel_id)")
      .eq("videos.channel_id", user.id)
      .gte("viewed_at", since.toISOString()),
  ]);

  const c = channel as Channel;
  const videos = (vids ?? []) as Video[];
  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);
  const totalLikes = videos.reduce((s, v) => s + v.like_count, 0);

  // views per day, last 28 days
  const days: { label: string; count: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(since.getTime() + i * 86400_000);
    days.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  for (const row of viewRows ?? []) {
    const idx = Math.floor(
      (new Date(row.viewed_at).getTime() - since.getTime()) / 86400_000
    );
    if (idx >= 0 && idx < 28) days[idx].count++;
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Channel analytics</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-yt-border p-5">
          <div className="text-sm text-yt-sub">Subscribers</div>
          <div className="mt-1 text-3xl font-bold">{formatCount(c.subscriber_count)}</div>
        </div>
        <div className="rounded-xl border border-yt-border p-5">
          <div className="text-sm text-yt-sub">Views (all time)</div>
          <div className="mt-1 text-3xl font-bold">{formatCount(totalViews)}</div>
        </div>
        <div className="rounded-xl border border-yt-border p-5">
          <div className="text-sm text-yt-sub">Likes (all time)</div>
          <div className="mt-1 text-3xl font-bold">{formatCount(totalLikes)}</div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yt-border p-5">
        <h2 className="font-medium">Views · last 28 days</h2>
        <div className="mt-6 flex h-40 items-end gap-1">
          {days.map((d, i) => (
            <div key={i} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-yt-blue/70 transition-colors group-hover:bg-yt-blue"
                style={{ height: `${Math.max(2, (d.count / max) * 152)}px` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-yt-raised px-2 py-1 text-xs group-hover:block">
                {d.label}: {d.count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-yt-sub">
          <span>{days[0].label}</span>
          <span>{days[27].label}</span>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yt-border">
        <h2 className="border-b border-yt-border p-4 font-medium">Top videos</h2>
        {videos.length === 0 ? (
          <p className="p-8 text-center text-sm text-yt-sub">No videos yet.</p>
        ) : (
          <div className="divide-y divide-yt-border">
            {videos.slice(0, 10).map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-4 p-4">
                <span className="line-clamp-1 font-medium">{v.title}</span>
                <span className="shrink-0 text-sm text-yt-sub">
                  {formatCount(v.view_count)} views · {formatCount(v.like_count)} likes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
