"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/lib/engageActions";

type Props = {
  videoId: string;
  signedIn: boolean;
  parentId?: string;
  onDone?: () => void;
  autoFocus?: boolean;
};

export default function CommentForm({ videoId, signedIn, parentId, onDone, autoFocus }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await addComment(videoId, body, parentId);
      if (res?.error) setError(res.error);
      else {
        setBody("");
        setError(null);
        onDone?.();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit}>
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        autoFocus={autoFocus}
        placeholder={
          signedIn
            ? parentId
              ? "Add a reply..."
              : "Add a comment..."
            : "Sign in to comment"
        }
        className="w-full border-b border-yt-border bg-transparent pb-2 text-sm outline-none placeholder:text-yt-sub focus:border-yt-text"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {(body.trim() || parentId) && (
        <div className="mt-2 flex justify-end gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="h-8 rounded-full px-4 text-sm font-medium hover:bg-yt-raised"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={pending || !body.trim()}
            className="h-8 rounded-full bg-yt-blue px-4 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
          >
            {parentId ? "Reply" : "Comment"}
          </button>
        </div>
      )}
    </form>
  );
}
