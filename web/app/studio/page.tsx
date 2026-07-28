import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel, Video } from "@/lib/types";
import { formatCount, timeAgo } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function StudioDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: channel }, { data: vids }] = await Promise.all([
    supabase.from("channels").select("*").eq("id", user.id).single(),
    supabase
      .from("videos")
      .select("*")
      .eq("channel_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const c = channel as Channel;
  const videos = (vids ?? []) as Video[];
  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Channel dashboard</h1>
      <p className="mt-1 text-sm text-yt-sub">
        {c.display_name} · @{c.handle}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Subscribers" value={formatCount(c.subscriber_count)} />
        <StatCard label="Total views" value={formatCount(totalViews)} />
        <StatCard label="Videos" value={String(videos.length)} />
      </div>

      <div className="mt-8 rounded-xl border border-yt-border">
        <div className="flex items-center justify-between border-b border-yt-border p-4">
          <h2 className="font-medium">Recent uploads</h2>
          <Link href="/studio/upload" className="text-sm font-medium text-yt-blue">
            Upload video
          </Link>
        </div>
        {videos.length === 0 ? (
          <p className="p-8 text-center text-sm text-yt-sub">
            No uploads yet. Your videos will appear here.
          </p>
        ) : (
          <div className="divide-y divide-yt-border">
            {videos.slice(0, 8).map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-4">
                <div className="h-14 w-24 shrink-0 overflow-hidden rounded bg-yt-raised">
                  {v.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{v.title}</div>
                  <div className="text-sm text-yt-sub">
                    {timeAgo(v.created_at)} · {formatCount(v.view_count)} views
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-yt-border p-5">
      <div className="text-sm text-yt-sub">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}
