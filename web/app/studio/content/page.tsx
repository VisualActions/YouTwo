import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";
import { formatCount, timeAgo } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function StudioContentPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("channel_id", user.id)
    .order("created_at", { ascending: false });
  const videos = (data ?? []) as Video[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Channel content</h1>
        <Link
          href="/studio/upload"
          className="rounded-full bg-yt-text px-4 py-2 text-sm font-medium text-black hover:bg-white/80"
        >
          Upload video
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="mt-16 text-center text-yt-sub">
          No content yet. Upload your first video.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-yt-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-yt-border text-left text-yt-sub">
                <th className="p-4 font-medium">Video</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Visibility</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium">Likes</th>
                <th className="p-4 font-medium">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yt-border">
              {videos.map((v) => (
                <tr key={v.id} className="hover:bg-yt-surface/50">
                  <td className="p-4">
                    <Link href={`/studio/content/${v.id}`} className="flex items-center gap-3">
                      <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-yt-raised">
                        {v.thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-2 max-w-xs font-medium hover:underline">
                        {v.title}
                      </span>
                    </Link>
                  </td>
                  <td className="p-4"><StatusBadge status={v.status} /></td>
                  <td className="p-4 capitalize">{v.visibility}</td>
                  <td className="p-4 text-yt-sub">{timeAgo(v.created_at)}</td>
                  <td className="p-4">{formatCount(v.view_count)}</td>
                  <td className="p-4">{formatCount(v.like_count)}</td>
                  <td className="p-4">{formatCount(v.comment_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
