"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteComment } from "@/lib/engageActions";
import CommentForm from "./CommentForm";

type Props = {
  videoId: string;
  commentId: string;
  canDelete: boolean;
  signedIn: boolean;
};

export default function CommentActions({ videoId, commentId, canDelete, signedIn }: Props) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3 text-xs font-medium text-yt-sub">
        <button onClick={() => setReplying((v) => !v)} className="hover:text-yt-text">
          Reply
        </button>
        {canDelete && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteComment(commentId, videoId);
                router.refresh();
              })
            }
            className="hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
      {replying && (
        <div className="mt-2">
          <CommentForm
            videoId={videoId}
            signedIn={signedIn}
            parentId={commentId}
            autoFocus
            onDone={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
