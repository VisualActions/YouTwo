import type { ReactNode } from "react";
import { avatarColor, cx, formatDuration } from "./internal/format.js";

export interface ChannelAvatarProps {
  /** Avatar image URL. When absent, a colored initial is generated from `name`. */
  src?: string | null;
  /** Channel display name — used for alt text and the fallback initial. */
  name: string;
  /** Pixel diameter. 24 sidebar, 36 card, 40 comment, 128 channel header. */
  size?: number;
  className?: string;
}

/**
 * Circular channel avatar. Falls back to a deterministic colored initial when
 * the channel has no picture, so lists never show broken images.
 */
export function ChannelAvatar({ src, name, size = 36, className }: ChannelAvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.44) };
  if (src) {
    return (
      <img src={src} alt={name} className={cx("yt-avatar", className)} style={style} />
    );
  }
  return (
    <span
      className={cx("yt-avatar", className)}
      style={{ ...style, background: avatarColor(name) }}
      aria-label={name}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

export interface VerifiedBadgeProps {
  /** Icon size in px. Defaults to 15 to sit inline with 14px text. */
  size?: number;
  className?: string;
}

/** Gray check badge shown after the names of verified channels. */
export function VerifiedBadge({ size = 15, className }: VerifiedBadgeProps) {
  return (
    <svg
      className={cx("yt-verified", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Verified"
    >
      <path
        fill="currentColor"
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="var(--yt-bg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface LiveBadgeProps {
  /** Badge text. Defaults to "Live". */
  children?: ReactNode;
  className?: string;
}

/** Solid red uppercase LIVE pill used on thumbnails, channel headers, and cards. */
export function LiveBadge({ children = "Live", className }: LiveBadgeProps) {
  return <span className={cx("yt-live-badge", className)}>{children}</span>;
}

/** Small red dot marking a live channel in the subscriptions list. */
export function LiveDot({ className }: { className?: string }) {
  return <span className={cx("yt-live-dot", className)} title="Live" />;
}

export interface DurationBadgeProps {
  /** Runtime in seconds; rendered as m:ss or h:mm:ss. */
  seconds: number;
  className?: string;
}

/** Black runtime chip overlaid on the bottom-right of a thumbnail. */
export function DurationBadge({ seconds, className }: DurationBadgeProps) {
  return <span className={cx("yt-duration", className)}>{formatDuration(seconds)}</span>;
}

export type VideoStatus = "ready" | "processing" | "failed";

export interface StatusBadgeProps {
  /** Processing state of a video in Studio. */
  status: VideoStatus;
  className?: string;
}

/** Colored pill showing a video's transcode state in Studio. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return <span className={cx("yt-status", `yt-status--${status}`, className)}>{status}</span>;
}
