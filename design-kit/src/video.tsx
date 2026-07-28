import type { ReactNode } from "react";
import { ChannelAvatar, DurationBadge, LiveBadge, VerifiedBadge } from "./identity.js";
import { cx, formatCount } from "./internal/format.js";
import { PlayIcon } from "./internal/icons.js";

export interface VideoSummary {
  id: string;
  title: string;
  /** Thumbnail URL. Omit to render the neutral gradient placeholder. */
  thumbnailUrl?: string | null;
  /** Runtime in seconds. Omit for live content. */
  durationSeconds?: number | null;
  viewCount: number;
  /** Pre-formatted relative time, e.g. "3 days ago". */
  publishedLabel: string;
  channelName: string;
  channelHandle: string;
  channelAvatarUrl?: string | null;
  channelVerified?: boolean;
  /** Currently broadcasting — swaps the duration chip for a LIVE badge. */
  isLive?: boolean;
  description?: string;
}

export interface VideoCardProps {
  video: VideoSummary;
  /** Hide the avatar and channel name — use on a channel's own Videos tab. */
  hideChannel?: boolean;
  /** Link target for the thumbnail and title. */
  href?: string;
  /** Link target for the channel avatar and name. */
  channelHref?: string;
  className?: string;
}

/**
 * The standard grid video card: 16:9 thumbnail with a runtime chip, channel
 * avatar, two-line title, and the views · age metadata line.
 */
export function VideoCard({ video, hideChannel, href = "#", channelHref = "#", className }: VideoCardProps) {
  return (
    <div className={cx("yt-video-card", className)}>
      <a className="yt-thumb" href={href}>
        {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" />}
        {video.isLive ? (
          <span className="yt-thumb__live">
            <LiveBadge />
          </span>
        ) : (
          video.durationSeconds != null && (
            <span className="yt-thumb__badge">
              <DurationBadge seconds={video.durationSeconds} />
            </span>
          )
        )}
      </a>
      <div className="yt-video-card__meta">
        {!hideChannel && (
          <a href={channelHref} style={{ marginTop: 2 }}>
            <ChannelAvatar src={video.channelAvatarUrl} name={video.channelName} size={36} />
          </a>
        )}
        <div style={{ minWidth: 0 }}>
          <a href={href} style={{ color: "inherit", textDecoration: "none" }}>
            <h3 className="yt-video-card__title">{video.title}</h3>
          </a>
          {!hideChannel && (
            <a href={channelHref} className="yt-video-card__sub" style={{ textDecoration: "none" }}>
              <span>{video.channelName}</span>
              {video.channelVerified && <VerifiedBadge size={14} />}
            </a>
          )}
          <div className="yt-video-card__sub">
            <span>
              {formatCount(video.viewCount)} views · {video.publishedLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface VideoGridProps {
  videos: VideoSummary[];
  hideChannel?: boolean;
  className?: string;
}

/** Responsive auto-filling grid of `VideoCard`s — the home and channel feed layout. */
export function VideoGrid({ videos, hideChannel, className }: VideoGridProps) {
  return (
    <div className={cx("yt-video-grid", className)}>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} hideChannel={hideChannel} />
      ))}
    </div>
  );
}

export interface VideoRowProps {
  video: VideoSummary;
  href?: string;
  channelHref?: string;
  className?: string;
}

/** Horizontal search-result row: wide thumbnail left, title/metadata/description right. */
export function VideoRow({ video, href = "#", channelHref = "#", className }: VideoRowProps) {
  return (
    <div className={cx("yt-video-row", className)}>
      <a className="yt-thumb yt-video-row__thumb" href={href}>
        {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" />}
        {video.durationSeconds != null && (
          <span className="yt-thumb__badge">
            <DurationBadge seconds={video.durationSeconds} />
          </span>
        )}
      </a>
      <div style={{ minWidth: 0 }}>
        <a href={href} style={{ color: "inherit", textDecoration: "none" }}>
          <h3 className="yt-video-row__title">{video.title}</h3>
        </a>
        <div className="yt-video-row__sub">
          {formatCount(video.viewCount)} views · {video.publishedLabel}
        </div>
        <a
          href={channelHref}
          className="yt-video-row__sub"
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, textDecoration: "none" }}
        >
          <ChannelAvatar src={video.channelAvatarUrl} name={video.channelName} size={24} />
          <span>{video.channelName}</span>
          {video.channelVerified && <VerifiedBadge size={14} />}
        </a>
        {video.description && <p className="yt-video-row__desc">{video.description}</p>}
      </div>
    </div>
  );
}

export interface RecommendedItemProps {
  video: VideoSummary;
  href?: string;
  channelHref?: string;
  className?: string;
}

/** Compact 168px-thumbnail row for the watch page's recommendations column. */
export function RecommendedItem({ video, href = "#", channelHref = "#", className }: RecommendedItemProps) {
  return (
    <div className={cx("yt-rec", className)}>
      <a className="yt-thumb yt-thumb--sm yt-rec__thumb" href={href}>
        {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" />}
        {video.durationSeconds != null && (
          <span className="yt-thumb__badge">
            <DurationBadge seconds={video.durationSeconds} />
          </span>
        )}
      </a>
      <div style={{ minWidth: 0 }}>
        <a href={href} style={{ color: "inherit", textDecoration: "none" }}>
          <h4 className="yt-rec__title">{video.title}</h4>
        </a>
        <a href={channelHref} className="yt-rec__sub" style={{ textDecoration: "none", marginTop: 4 }}>
          <span>{video.channelName}</span>
          {video.channelVerified && <VerifiedBadge size={13} />}
        </a>
        <div className="yt-rec__sub">
          {formatCount(video.viewCount)} views · {video.publishedLabel}
        </div>
      </div>
    </div>
  );
}

export interface LiveChannelCardProps {
  channelName: string;
  /** Current broadcast title. */
  streamTitle: string;
  avatarUrl?: string | null;
  verified?: boolean;
  href?: string;
  className?: string;
}

/** Row card for the home page's "Live now" strip. */
export function LiveChannelCard({
  channelName,
  streamTitle,
  avatarUrl,
  verified,
  href = "#",
  className,
}: LiveChannelCardProps) {
  return (
    <a className={cx("yt-live-card", className)} href={href}>
      <ChannelAvatar src={avatarUrl} name={channelName} size={48} />
      <div style={{ minWidth: 0 }}>
        <div className="yt-live-card__name">
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{channelName}</span>
          {verified && <VerifiedBadge size={14} />}
        </div>
        <div className="yt-live-card__title">{streamTitle}</div>
      </div>
      <span style={{ marginLeft: "auto" }}>
        <LiveBadge />
      </span>
    </a>
  );
}

export interface VideoPlayerFrameProps {
  /** Poster image shown behind the play affordance. */
  posterUrl?: string | null;
  /** Show the red LIVE badge in the top-left corner. */
  live?: boolean;
  /** Replaces the play button with a message — for processing or failed videos. */
  placeholder?: ReactNode;
  className?: string;
}

/**
 * 16:9 player surface. This is the design-system chrome only — the shipping app
 * mounts hls.js into a `<video>` with the same frame.
 */
export function VideoPlayerFrame({ posterUrl, live, placeholder, className }: VideoPlayerFrameProps) {
  return (
    <div className={cx("yt-player", className)}>
      {posterUrl && <img src={posterUrl} alt="" />}
      {placeholder ? (
        <div className="yt-player__overlay">
          <p className="yt-player__placeholder">{placeholder}</p>
        </div>
      ) : (
        <div className="yt-player__overlay">
          <span className="yt-player__play">
            <PlayIcon size={28} style={{ color: "#fff" }} />
          </span>
        </div>
      )}
      {live && (
        <span className="yt-player__live">
          <LiveBadge />
        </span>
      )}
    </div>
  );
}
