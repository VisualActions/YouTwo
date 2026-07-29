"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Ban, EyeOff, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { formatCount } from "@/lib/format";
import {
  bossDeleteChannel,
  bossDeleteVideo,
  bossSetAdmin,
  bossSetSuspended,
  bossSetVideoVisibility,
} from "@/lib/bossActions";
import { issuePlayButton, type PlayButtonTier } from "@/lib/playButton";

export type OverviewRow = {
  id: string;
  handle: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  verified: boolean;
  is_admin: boolean;
  is_owner: boolean;
  suspended_at: string | null;
  subscriber_count: number;
  video_count: number;
  total_views: number;
  comment_count: number;
  storage_bytes: number;
};

export type VideoRow = {
  id: string;
  title: string;
  status: string;
  visibility: string;
  view_count: number;
  channel_id: string;
  channel_handle: string;
};

function formatBytes(n: number) {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

export default function BossConsole({
  channels,
  videos,
  storageLimitBytes,
}: {
  channels: OverviewRow[];
  videos: VideoRow[];
  storageLimitBytes: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Deleting a channel requires typing its handle, so the target is explicit.
  const [deleting, setDeleting] = useState<OverviewRow | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");

  const [awarding, setAwarding] = useState<OverviewRow | null>(null);
  const [tier, setTier] = useState<PlayButtonTier>("silver");
  const [awardEmail, setAwardEmail] = useState("");
  const [awardNote, setAwardNote] = useState("");

  const totalStorage = channels.reduce((s, c) => s + Number(c.storage_bytes), 0);
  const pct = Math.min(100, (totalStorage / storageLimitBytes) * 100);

  function run(fn: () => Promise<{ error: string | null }>, okText: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setMsg({ kind: "err", text: res.error });
      else {
        setMsg({ kind: "ok", text: okText });
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.kind === "ok"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Storage is the binding constraint on the free plan, so it leads. */}
      <section className="rounded-xl border border-yt-border p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-medium">Storage across all channels</h2>
          <span className="text-sm text-yt-sub">
            {formatBytes(totalStorage)} of {formatBytes(storageLimitBytes)}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-yt-raised">
          <div
            className={`h-full rounded-full ${
              pct > 85 ? "bg-yt-red" : pct > 60 ? "bg-yellow-500" : "bg-yt-blue"
            }`}
            style={{ width: `${Math.max(1, pct)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-yt-sub">
          {pct.toFixed(1)}% used. Deleting a channel or video frees its share immediately.
        </p>
      </section>

      {/* ---------------- channels ---------------- */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Channels</h2>
        <div className="overflow-x-auto rounded-xl border border-yt-border">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-yt-border text-left text-yt-sub">
                <th className="p-3 font-medium">Channel</th>
                <th className="p-3 font-medium">Videos</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Subs</th>
                <th className="p-3 font-medium">Storage</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yt-border">
              {channels.map((c) => (
                <tr key={c.id} className={c.suspended_at ? "opacity-50" : undefined}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <ChannelAvatar src={c.avatar_url} name={c.display_name} size={32} />
                      <div className="min-w-0">
                        <Link
                          href={`/channel/@${c.handle}`}
                          className="flex items-center gap-1 font-medium hover:underline"
                        >
                          {c.display_name}
                          {c.verified && <VerifiedBadge />}
                        </Link>
                        <div className="text-xs text-yt-sub">
                          @{c.handle} · {c.email}
                          {c.is_owner && " · owner"}
                          {c.is_admin && !c.is_owner && " · admin"}
                          {c.suspended_at && " · SUSPENDED"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{c.video_count}</td>
                  <td className="p-3">{formatCount(Number(c.total_views))}</td>
                  <td className="p-3">{formatCount(c.subscriber_count)}</td>
                  <td className="p-3">{formatBytes(Number(c.storage_bytes))}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setAwarding(c);
                          setAwardEmail(c.email);
                        }}
                        disabled={pending}
                        className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium hover:bg-yt-hover"
                      >
                        <Award className="h-3.5 w-3.5" /> Play Button
                      </button>
                      {!c.is_owner && (
                        <>
                          <button
                            onClick={() =>
                              run(
                                () => bossSetAdmin(c.id, !c.is_admin),
                                c.is_admin ? "Admin revoked." : "Admin granted."
                              )
                            }
                            disabled={pending}
                            className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium hover:bg-yt-hover"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {c.is_admin ? "Revoke admin" : "Make admin"}
                          </button>
                          <button
                            onClick={() =>
                              run(
                                () =>
                                  bossSetSuspended(
                                    c.id,
                                    !c.suspended_at,
                                    reason || "No reason given"
                                  ),
                                c.suspended_at ? "Channel restored." : "Channel suspended."
                              )
                            }
                            disabled={pending}
                            className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium hover:bg-yt-hover"
                          >
                            {c.suspended_at ? (
                              <>
                                <Undo2 className="h-3.5 w-3.5" /> Unsuspend
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" /> Suspend
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setDeleting(c);
                              setConfirmText("");
                            }}
                            disabled={pending}
                            className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium text-red-400 hover:bg-yt-hover"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- videos ---------------- */}
      <section>
        <h2 className="mb-3 text-lg font-medium">All videos</h2>
        <div className="overflow-x-auto rounded-xl border border-yt-border">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-yt-border text-left text-yt-sub">
                <th className="p-3 font-medium">Video</th>
                <th className="p-3 font-medium">Channel</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Visibility</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yt-border">
              {videos.map((v) => (
                <tr key={v.id}>
                  <td className="p-3">
                    <Link href={`/watch/${v.id}`} className="font-medium hover:underline">
                      {v.title}
                    </Link>
                  </td>
                  <td className="p-3 text-yt-sub">@{v.channel_handle}</td>
                  <td className="p-3">{v.status}</td>
                  <td className="p-3 capitalize">{v.visibility}</td>
                  <td className="p-3">{formatCount(v.view_count)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {v.visibility !== "private" && (
                        <button
                          onClick={() =>
                            run(
                              () =>
                                bossSetVideoVisibility(
                                  v.id,
                                  "private",
                                  reason || "Hidden by owner"
                                ),
                              "Video hidden."
                            )
                          }
                          disabled={pending}
                          className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium hover:bg-yt-hover"
                        >
                          <EyeOff className="h-3.5 w-3.5" /> Hide
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete "${v.title}" permanently? Its files are removed too. This cannot be undone.`
                            )
                          )
                            run(
                              () => bossDeleteVideo(v.id, reason || "Removed by owner"),
                              "Video deleted."
                            );
                        }}
                        disabled={pending}
                        className="flex h-8 items-center gap-1.5 rounded-full bg-yt-raised px-3 text-xs font-medium text-red-400 hover:bg-yt-hover"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-yt-sub">
                    No videos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (recorded in the audit log)"
            className="h-9 w-full max-w-md rounded-lg border border-yt-border bg-[#121212] px-3 text-sm outline-none focus:border-yt-blue"
          />
        </div>
      </section>

      {/* ---------------- delete channel modal ---------------- */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-yt-border bg-yt-surface p-6">
            <h3 className="text-lg font-semibold text-red-400">Delete @{deleting.handle}</h3>
            <p className="mt-2 text-sm text-yt-sub">
              This deletes the account, {deleting.video_count} video
              {deleting.video_count === 1 ? "" : "s"}, every comment and subscription, and{" "}
              {formatBytes(Number(deleting.storage_bytes))} of stored files.{" "}
              <strong className="text-yt-text">It cannot be undone.</strong> Suspending hides
              the channel instead and is reversible.
            </p>
            <label className="mt-4 block text-sm font-medium">
              Type <code className="text-yt-red">{deleting.handle}</code> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              className="mt-1 h-10 w-full rounded-lg border border-yt-border bg-[#121212] px-3 text-sm outline-none focus:border-yt-red"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="h-9 rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover"
              >
                Cancel
              </button>
              <button
                disabled={pending || confirmText.trim().replace(/^@/, "") !== deleting.handle}
                onClick={() =>
                  run(async () => {
                    const res = await bossDeleteChannel(
                      deleting.id,
                      confirmText,
                      reason || "Removed by owner"
                    );
                    if (!res.error) setDeleting(null);
                    return res;
                  }, `@${deleting.handle} deleted.`)
                }
                className="h-9 rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- play button modal ---------------- */}
      {awarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-yt-border bg-yt-surface p-6">
            <h3 className="text-lg font-semibold">Send Play Button</h3>
            <p className="mt-1 text-sm text-yt-sub">
              To {awarding.display_name} (@{awarding.handle}) ·{" "}
              {formatCount(awarding.subscriber_count)} subscribers
            </p>

            <label className="mt-4 block text-sm font-medium">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as PlayButtonTier)}
              className="mt-1 h-10 w-full rounded-lg border border-yt-border bg-[#121212] px-3 text-sm outline-none focus:border-yt-blue"
            >
              <option value="silver">Silver — 100 subscribers</option>
              <option value="gold">Gold — 1,000 subscribers</option>
              <option value="diamond">Diamond — 10,000 subscribers</option>
            </select>

            <label className="mt-3 block text-sm font-medium">Send to</label>
            <input
              value={awardEmail}
              onChange={(e) => setAwardEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-yt-border bg-[#121212] px-3 text-sm outline-none focus:border-yt-blue"
            />

            <label className="mt-3 block text-sm font-medium">Note (optional)</label>
            <textarea
              value={awardNote}
              onChange={(e) => setAwardNote(e.target.value)}
              rows={2}
              placeholder="Shown in the email above the code"
              className="mt-1 w-full rounded-lg border border-yt-border bg-[#121212] p-3 text-sm outline-none focus:border-yt-blue"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAwarding(null)}
                className="h-9 rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover"
              >
                Cancel
              </button>
              <button
                disabled={pending || !awardEmail.trim()}
                onClick={() => {
                  setMsg(null);
                  startTransition(async () => {
                    const res = await issuePlayButton({
                      channelId: awarding.id,
                      tier,
                      email: awardEmail,
                      note: awardNote,
                    });
                    if (res.error) setMsg({ kind: "err", text: res.error });
                    else {
                      setMsg({
                        kind: "ok",
                        text: res.emailed
                          ? `${tier} Play Button emailed to ${awardEmail}. Code ${res.code}`
                          : `Award created. Code ${res.code} — not emailed (${res.emailError}). Send it manually.`,
                      });
                      setAwarding(null);
                      setAwardNote("");
                      router.refresh();
                    }
                  });
                }}
                className="h-9 rounded-full bg-yt-text px-4 text-sm font-medium text-black hover:bg-white/80 disabled:opacity-40"
              >
                Issue &amp; send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
