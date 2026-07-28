import { ChannelAvatar, LiveBadge, VerifiedBadge } from "./identity.js";
import { cx, formatCount } from "./internal/format.js";
import { Button } from "./primitives.js";

export interface SubscribeButtonProps {
  /** Current subscription state — drives the label and styling. */
  subscribed?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * The subscribe toggle: white "Subscribe" pill when not subscribed, neutral
 * gray "Subscribed" pill once the viewer has subscribed.
 */
export function SubscribeButton({ subscribed, onToggle, disabled, className }: SubscribeButtonProps) {
  return (
    <Button
      variant={subscribed ? "secondary" : "primary"}
      onClick={onToggle}
      disabled={disabled}
      className={className}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}

export interface ChannelHeaderProps {
  name: string;
  handle: string;
  /** Subscriber total — formatted to 1.2K / 3.4M for display. */
  subscriberCount: number;
  videoCount: number;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string;
  verified?: boolean;
  /** Currently broadcasting — adds the LIVE pill beside the name. */
  isLive?: boolean;
  /** Render "Customize channel" instead of the subscribe control. */
  isOwner?: boolean;
  subscribed?: boolean;
  onSubscribeToggle?: () => void;
  className?: string;
}

/**
 * Channel page masthead: banner, 128px avatar, name with verification and live
 * state, the handle · subscribers · videos line, and the primary action.
 */
export function ChannelHeader({
  name,
  handle,
  subscriberCount,
  videoCount,
  avatarUrl,
  bannerUrl,
  description,
  verified,
  isLive,
  isOwner,
  subscribed,
  onSubscribeToggle,
  className,
}: ChannelHeaderProps) {
  return (
    <div className={className}>
      {bannerUrl ? (
        <img className="yt-channel-banner" src={bannerUrl} alt="" />
      ) : (
        <div className="yt-channel-banner" />
      )}
      <div className="yt-channel-head">
        <ChannelAvatar src={avatarUrl} name={name} size={128} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="yt-channel-head__name">
            {name}
            {verified && <VerifiedBadge size={20} />}
            {isLive && <LiveBadge />}
          </h1>
          <div className="yt-channel-head__meta">
            <strong>@{handle}</strong> · {formatCount(subscriberCount)} subscribers · {formatCount(videoCount)} videos
          </div>
          {description && <p className="yt-channel-head__desc">{description}</p>}
          <div className="yt-channel-head__actions">
            {isOwner ? (
              <Button variant="secondary">Customize channel</Button>
            ) : (
              <SubscribeButton subscribed={subscribed} onToggle={onSubscribeToggle} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ChannelTabsProps {
  /** Tab labels in display order. */
  tabs?: string[];
  /** Label of the current tab. */
  active?: string;
  onSelect?: (tab: string) => void;
  className?: string;
}

/** Underlined tab bar under the channel masthead. */
export function ChannelTabs({
  tabs = ["Videos", "Live", "Playlists", "About"],
  active = "Videos",
  onSelect,
  className,
}: ChannelTabsProps) {
  return (
    <div className={cx("yt-tabs", className)}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          className={cx("yt-tab", t === active && "yt-tab--active")}
          onClick={() => onSelect?.(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export interface VerifyToggleProps {
  /** Whether the channel currently carries the verification check. */
  verified?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  className?: string;
}

/** Admin-only control that grants or removes a channel's verification check. */
export function VerifyToggle({ verified, onToggle, disabled, className }: VerifyToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cx("yt-btn", className)}
      style={{
        background: verified ? "var(--yt-blue-bg)" : "var(--yt-raised)",
        color: verified ? "var(--yt-blue)" : "var(--yt-text-secondary)",
      }}
    >
      <VerifiedBadge size={16} />
      {verified ? "Verified" : "Verify"}
    </button>
  );
}

export interface ChannelListItemProps {
  name: string;
  handle: string;
  subscriberCount: number;
  avatarUrl?: string | null;
  verified?: boolean;
  description?: string;
  isLive?: boolean;
  /** Trailing control, e.g. a `VerifyToggle` on the admin page. */
  action?: React.ReactNode;
  href?: string;
  className?: string;
}

/** Channel result row — used by search results and the admin channel list. */
export function ChannelListItem({
  name,
  handle,
  subscriberCount,
  avatarUrl,
  verified,
  description,
  isLive,
  action,
  href = "#",
  className,
}: ChannelListItemProps) {
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "var(--yt-space-4)", padding: "var(--yt-space-4)" }}
    >
      <ChannelAvatar src={avatarUrl} name={name} size={56} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <a
          href={href}
          style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "inherit", textDecoration: "none" }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          {verified && <VerifiedBadge size={15} />}
          {isLive && <LiveBadge />}
        </a>
        <div style={{ fontSize: "var(--yt-text-base)", color: "var(--yt-text-secondary)" }}>
          @{handle} · {formatCount(subscriberCount)} subscribers
        </div>
        {description && (
          <p
            style={{
              fontSize: "var(--yt-text-base)",
              color: "var(--yt-text-secondary)",
              margin: "4px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
