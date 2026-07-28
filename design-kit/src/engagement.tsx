import type { ReactNode } from "react";
import { ChannelAvatar, VerifiedBadge } from "./identity.js";
import { cx, formatCount } from "./internal/format.js";
import { ThumbDownIcon, ThumbUpIcon } from "./internal/icons.js";
import { Button } from "./primitives.js";

export type RatingValue = 1 | -1 | 0;

export interface LikeButtonsProps {
  likeCount: number;
  dislikeCount: number;
  /** The viewer's current rating: 1 liked, -1 disliked, 0 none. */
  rating?: RatingValue;
  onRate?: (value: RatingValue) => void;
  className?: string;
}

/**
 * The segmented like/dislike pill from the watch page. The active side turns
 * blue and its icon fills in.
 */
export function LikeButtons({ likeCount, dislikeCount, rating = 0, onRate, className }: LikeButtonsProps) {
  return (
    <div className={cx("yt-like-group", className)}>
      <button
        type="button"
        className={cx("yt-like-group__btn", rating === 1 && "yt-like-group__btn--active")}
        onClick={() => onRate?.(rating === 1 ? 0 : 1)}
      >
        <ThumbUpIcon size={18} filled={rating === 1} />
        {formatCount(likeCount)}
      </button>
      <span className="yt-like-group__divider" />
      <button
        type="button"
        className={cx("yt-like-group__btn", rating === -1 && "yt-like-group__btn--active")}
        onClick={() => onRate?.(rating === -1 ? 0 : -1)}
        aria-label="Dislike"
      >
        <ThumbDownIcon size={18} filled={rating === -1} />
        {formatCount(dislikeCount)}
      </button>
    </div>
  );
}

export interface CommentItemProps {
  /** Author handle, rendered as @handle. */
  handle: string;
  authorName: string;
  avatarUrl?: string | null;
  verified?: boolean;
  body: string;
  /** Pre-formatted relative time, e.g. "2 hours ago". */
  timeLabel: string;
  /** Show the Delete action — only for the viewer's own comments. */
  canDelete?: boolean;
  /** Nested replies, rendered inside the left-bordered thread. */
  replies?: ReactNode;
  onReply?: () => void;
  onDelete?: () => void;
  className?: string;
}

/**
 * A single comment with its author line, body, and actions. Pass rendered
 * `CommentItem`s as `replies` to build a thread.
 */
export function CommentItem({
  handle,
  authorName,
  avatarUrl,
  verified,
  body,
  timeLabel,
  canDelete,
  replies,
  onReply,
  onDelete,
  className,
}: CommentItemProps) {
  return (
    <div className={cx("yt-comment", className)}>
      <ChannelAvatar src={avatarUrl} name={authorName} size={40} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="yt-comment__who">
          @{handle}
          {verified && <VerifiedBadge size={13} />}
          <span className="yt-comment__when">{timeLabel}</span>
        </div>
        <p className="yt-comment__body">{body}</p>
        <div className="yt-comment__actions">
          <button type="button" className="yt-comment__action" onClick={onReply}>
            Reply
          </button>
          {canDelete && (
            <button type="button" className="yt-comment__action yt-comment__action--danger" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
        {replies && <div className="yt-comment__replies">{replies}</div>}
      </div>
    </div>
  );
}

export interface CommentComposerProps {
  /** Avatar of the signed-in viewer. Omit to render without one. */
  avatarUrl?: string | null;
  authorName?: string;
  placeholder?: string;
  /** Show the Cancel/Comment action row (appears once the field has focus or text). */
  showActions?: boolean;
  /** Label for the submit button — "Comment" at top level, "Reply" in a thread. */
  submitLabel?: string;
  onCancel?: () => void;
  className?: string;
}

/** Underline-style comment input with its Cancel / Comment action row. */
export function CommentComposer({
  avatarUrl,
  authorName = "You",
  placeholder = "Add a comment...",
  showActions,
  submitLabel = "Comment",
  onCancel,
  className,
}: CommentComposerProps) {
  return (
    <div className={cx("yt-composer", className)}>
      <ChannelAvatar src={avatarUrl} name={authorName} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <input className="yt-composer__field" placeholder={placeholder} />
        {showActions && (
          <div className="yt-composer__actions">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="blue" size="sm">
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  body: string;
}

export interface LiveChatProps {
  messages: ChatMessage[];
  /** Panel height. Use a viewport-relative value in the real watch layout. */
  height?: number | string;
  /** Disables the composer and shows the signed-out prompt. */
  signedIn?: boolean;
  className?: string;
}

/** Realtime chat panel beside the live player: header, message list, composer. */
export function LiveChat({ messages, height = 480, signedIn = true, className }: LiveChatProps) {
  return (
    <div className={cx("yt-chat", className)} style={{ height }}>
      <div className="yt-chat__head">Live chat</div>
      <div className="yt-chat__list">
        {messages.length === 0 ? (
          <p className="yt-chat__empty">Say hello — chat starts here.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="yt-chat__msg">
              <ChannelAvatar src={m.senderAvatarUrl} name={m.senderName} size={24} />
              <p>
                <span className="yt-chat__who">{m.senderName}</span>
                {m.body}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="yt-chat__foot">
        <input className="yt-chat__input" placeholder={signedIn ? "Chat..." : "Sign in to chat"} disabled={!signedIn} />
        <Button variant="blue" size="sm" disabled={!signedIn}>
          Send
        </Button>
      </div>
    </div>
  );
}
