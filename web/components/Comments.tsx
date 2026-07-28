import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CommentRow } from "@/lib/types";
import { formatCount, timeAgo } from "@/lib/format";
import ChannelAvatar from "./ChannelAvatar";
import CommentForm from "./CommentForm";
import CommentActions from "./CommentActions";

export default async function Comments({ videoId }: { videoId: string }) {
  const supabase = createClient();
  const [{ data }, userRes] = await Promise.all([
    supabase
      .from("comments")
      .select("*, channels!comments_author_id_fkey(*)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);
  const user = userRes.data.user;
  const all = (data ?? []) as CommentRow[];
  const topLevel = all.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, CommentRow[]>();
  for (const c of all) {
    if (c.parent_id) {
      const list = repliesByParent.get(c.parent_id) ?? [];
      list.push(c);
      repliesByParent.set(c.parent_id, list);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold">{formatCount(all.length)} Comments</h2>
      <div className="mt-4">
        <CommentForm videoId={videoId} signedIn={!!user} />
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {topLevel.map((c) => (
          <Comment
            key={c.id}
            comment={c}
            replies={(repliesByParent.get(c.id) ?? []).reverse()}
            videoId={videoId}
            currentUserId={user?.id ?? null}
          />
        ))}
      </div>
    </section>
  );
}

function Comment({
  comment,
  replies,
  videoId,
  currentUserId,
}: {
  comment: CommentRow;
  replies: CommentRow[];
  videoId: string;
  currentUserId: string | null;
}) {
  const author = comment.channels;
  return (
    <div className="flex gap-3">
      <Link href={author ? `/channel/@${author.handle}` : "#"} className="mt-0.5 shrink-0">
        <ChannelAvatar
          src={author?.avatar_url ?? null}
          name={author?.display_name ?? "?"}
          size={40}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            href={author ? `/channel/@${author.handle}` : "#"}
            className="text-sm font-medium hover:underline"
          >
            @{author?.handle ?? "deleted"}
          </Link>
          <span className="text-xs text-yt-sub">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
        <CommentActions
          videoId={videoId}
          commentId={comment.id}
          canDelete={currentUserId === comment.author_id}
          signedIn={!!currentUserId}
        />
        {replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-4 border-l-2 border-yt-border pl-4">
            {replies.map((r) => (
              <Comment
                key={r.id}
                comment={r}
                replies={[]}
                videoId={videoId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
