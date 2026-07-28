import Link from "next/link";
import type { Video } from "@/lib/types";
import { formatCount, timeAgo, formatDuration } from "@/lib/format";
import ChannelAvatar from "./ChannelAvatar";
import VerifiedBadge from "./VerifiedBadge";

export default function VideoCard({
  video,
  hideChannel = false,
}: {
  video: Video;
  hideChannel?: boolean;
}) {
  const channel = video.channels;
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative block aspect-video overflow-hidden rounded-xl bg-yt-raised"
      >
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-yt-raised" />
        )}
        {video.duration_seconds != null && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-xs font-medium">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </Link>
      <div className="flex gap-3">
        {!hideChannel && channel && (
          <Link href={`/channel/@${channel.handle}`} className="mt-0.5">
            <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={36} />
          </Link>
        )}
        <div className="min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-5">{video.title}</h3>
          </Link>
          {!hideChannel && channel && (
            <Link
              href={`/channel/@${channel.handle}`}
              className="mt-1 flex items-center gap-1 text-sm text-yt-sub hover:text-yt-text"
            >
              <span className="truncate">{channel.display_name}</span>
              {channel.verified && <VerifiedBadge />}
            </Link>
          )}
          <div className="text-sm text-yt-sub">
            {formatCount(video.view_count)} views · {timeAgo(video.published_at ?? video.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
