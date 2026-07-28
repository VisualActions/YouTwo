"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { rateVideo } from "@/lib/engageActions";
import { formatCount } from "@/lib/format";

type Props = {
  videoId: string;
  likeCount: number;
  dislikeCount: number;
  initialRating: 1 | -1 | 0;
  signedIn: boolean;
};

export default function LikeButtons({
  videoId,
  likeCount,
  dislikeCount,
  initialRating,
  signedIn,
}: Props) {
  const router = useRouter();
  const [rating, setRating] = useState<1 | -1 | 0>(initialRating);
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);
  const [, startTransition] = useTransition();

  function apply(next: 1 | -1 | 0) {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    const prev = rating;
    if (next === prev) next = 0;
    setLikes(likes + (next === 1 ? 1 : 0) - (prev === 1 ? 1 : 0));
    setDislikes(dislikes + (next === -1 ? 1 : 0) - (prev === -1 ? 1 : 0));
    setRating(next);
    startTransition(async () => {
      const res = await rateVideo(videoId, next);
      if (res?.error) {
        setRating(prev);
        setLikes(likeCount);
        setDislikes(dislikeCount);
      }
    });
  }

  return (
    <div className="flex h-9 items-center overflow-hidden rounded-full bg-yt-raised">
      <button
        onClick={() => apply(1)}
        className={`flex h-full items-center gap-2 px-4 text-sm font-medium hover:bg-yt-hover ${
          rating === 1 ? "text-yt-blue" : ""
        }`}
      >
        <ThumbsUp className="h-4 w-4" fill={rating === 1 ? "currentColor" : "none"} />
        {formatCount(likes)}
      </button>
      <span className="h-5 w-px bg-yt-border" />
      <button
        onClick={() => apply(-1)}
        className={`flex h-full items-center gap-2 px-4 text-sm font-medium hover:bg-yt-hover ${
          rating === -1 ? "text-yt-blue" : ""
        }`}
      >
        <ThumbsDown className="h-4 w-4" fill={rating === -1 ? "currentColor" : "none"} />
        {formatCount(dislikes)}
      </button>
    </div>
  );
}
