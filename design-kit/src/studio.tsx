import type { ReactNode } from "react";
import { StatusBadge, type VideoStatus } from "./identity.js";
import { cx, formatCount } from "./internal/format.js";
import { CopyIcon, EyeIcon, EyeOffIcon, RefreshIcon } from "./internal/icons.js";
import { Button, IconButton } from "./primitives.js";

export interface StatCardProps {
  /** Metric name, e.g. "Subscribers". */
  label: string;
  /** Pre-formatted or raw value. Numbers are abbreviated (1.2K, 3.4M). */
  value: string | number;
  /** Optional change line under the value, e.g. "+12% vs last month". */
  delta?: string;
  /** Direction of `delta` — colors it green or red. */
  trend?: "up" | "down";
  className?: string;
}

/** Single metric tile used across the Studio dashboard and analytics pages. */
export function StatCard({ label, value, delta, trend, className }: StatCardProps) {
  return (
    <div className={cx("yt-stat-card", className)}>
      <div className="yt-stat-card__label">{label}</div>
      <div className="yt-stat-card__value">{typeof value === "number" ? formatCount(value) : value}</div>
      {delta && <div className={cx("yt-stat-card__delta", trend && `yt-stat-card__delta--${trend}`)}>{delta}</div>}
    </div>
  );
}

export interface StatGridProps {
  children: ReactNode;
  className?: string;
}

/** Responsive row of `StatCard`s. */
export function StatGrid({ children, className }: StatGridProps) {
  return <div className={cx("yt-stat-grid", className)}>{children}</div>;
}

export interface ViewsChartProps {
  /** One value per day, oldest first. */
  data: number[];
  title?: string;
  /** Label under the left edge of the axis. */
  startLabel?: string;
  /** Label under the right edge of the axis. */
  endLabel?: string;
  className?: string;
}

/** Bar chart of daily views for the Studio analytics page. */
export function ViewsChart({
  data,
  title = "Views · last 28 days",
  startLabel,
  endLabel,
  className,
}: ViewsChartProps) {
  const max = Math.max(1, ...data);
  return (
    <div className={cx("yt-chart", className)}>
      <div className="yt-chart__title">{title}</div>
      <div className="yt-chart__bars">
        {data.map((v, i) => (
          <div key={i} className="yt-chart__bar" style={{ height: `${Math.max(2, (v / max) * 100)}%` }} title={String(v)} />
        ))}
      </div>
      {(startLabel || endLabel) && (
        <div className="yt-chart__axis">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}

export interface ContentRow {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  status: VideoStatus;
  visibility: "public" | "unlisted" | "private";
  dateLabel: string;
  views: number;
  likes: number;
  comments: number;
}

export interface ContentTableProps {
  rows: ContentRow[];
  className?: string;
}

/** The Studio → Content table listing every upload with its processing state. */
export function ContentTable({ rows, className }: ContentTableProps) {
  return (
    <div className={cx("yt-table-wrap", className)}>
      <table className="yt-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Date</th>
            <th>Views</th>
            <th>Likes</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <div className="yt-table__video">
                  <div className="yt-table__thumb">{r.thumbnailUrl && <img src={r.thumbnailUrl} alt="" />}</div>
                  <span className="yt-table__title">{r.title}</span>
                </div>
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td style={{ textTransform: "capitalize" }}>{r.visibility}</td>
              <td style={{ color: "var(--yt-text-secondary)" }}>{r.dateLabel}</td>
              <td>{formatCount(r.views)}</td>
              <td>{formatCount(r.likes)}</td>
              <td>{formatCount(r.comments)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface StreamKeyPanelProps {
  /** RTMP ingest URL, e.g. rtmp://localhost:1935/live. */
  ingestUrl: string;
  /** The channel's stream key. Masked unless `revealed`. */
  streamKey: string;
  /** Show the key in plain text. */
  revealed?: boolean;
  onToggleReveal?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

/**
 * Studio → Stream settings panel: ingest URL, masked stream key with reveal and
 * copy controls, and the regenerate action.
 */
export function StreamKeyPanel({
  ingestUrl,
  streamKey,
  revealed,
  onToggleReveal,
  onRegenerate,
  className,
}: StreamKeyPanelProps) {
  return (
    <div className={cx("yt-panel", className)}>
      <div>
        <label className="yt-field__label">Ingest URL</label>
        <div className="yt-panel__row">
          <code className="yt-code">{ingestUrl}</code>
          <IconButton shape="boxed" icon={<CopyIcon size={16} />} label="Copy ingest URL" />
        </div>
      </div>
      <div>
        <label className="yt-field__label">Stream key</label>
        <div className="yt-panel__row">
          <code className="yt-code">{revealed ? streamKey : "•".repeat(Math.min(streamKey.length, 40))}</code>
          <IconButton
            shape="boxed"
            icon={revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            label={revealed ? "Hide key" : "Reveal key"}
            onClick={onToggleReveal}
          />
          <IconButton shape="boxed" icon={<CopyIcon size={16} />} label="Copy stream key" />
        </div>
        <p className="yt-field__hint">Keep this secret. Anyone with the key can stream as your channel.</p>
      </div>
      <div>
        <Button variant="secondary" startIcon={<RefreshIcon size={16} />} onClick={onRegenerate}>
          Regenerate key
        </Button>
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  /** Supporting sentence under the title. */
  body?: string;
  /** Optional call-to-action rendered under the copy. */
  action?: ReactNode;
  className?: string;
}

/** Centered empty-state block for feeds, tabs, and Studio tables with no rows. */
export function EmptyState({ title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cx("yt-empty", className)}>
      <h2 className="yt-empty__title">{title}</h2>
      {body && <p className="yt-empty__body">{body}</p>}
      {action}
    </div>
  );
}
