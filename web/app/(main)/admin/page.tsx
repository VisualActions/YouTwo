import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import { formatCount, timeAgo } from "@/lib/format";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifyToggle from "@/components/VerifyToggle";
import BossConsole, { type OverviewRow, type VideoRow } from "./BossConsole";

export const dynamic = "force-dynamic";

// Supabase free plan file-storage allowance, used for the usage bar.
const STORAGE_LIMIT_BYTES = 1024 ** 3;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: me } = await supabase
    .from("channels")
    .select("is_admin, is_owner")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin && !me?.is_owner) redirect("/");

  const isOwner = !!me?.is_owner;

  // ---- owner console data ----
  let overview: OverviewRow[] = [];
  let videos: VideoRow[] = [];
  let audit: {
    id: number;
    actor_handle: string | null;
    action: string;
    target_handle: string | null;
    detail: Record<string, unknown>;
    created_at: string;
  }[] = [];
  let awards: {
    id: string;
    tier: string;
    claim_code: string;
    recipient_email: string;
    emailed_at: string | null;
    claimed_at: string | null;
    created_at: string;
    channels: { handle: string } | null;
  }[] = [];

  if (isOwner) {
    const [ov, vids, aud, awd] = await Promise.all([
      supabase.rpc("admin_channel_overview"),
      supabase
        .from("videos")
        .select("id, title, status, visibility, view_count, channel_id, channels!videos_channel_id_fkey(handle)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("admin_audit")
        .select("id, actor_handle, action, target_handle, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("play_button_awards")
        .select("id, tier, claim_code, recipient_email, emailed_at, claimed_at, created_at, channels(handle)")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    overview = (ov.data ?? []) as OverviewRow[];
    videos = ((vids.data ?? []) as unknown as (VideoRow & { channels: { handle: string } })[]).map(
      (v) => ({ ...v, channel_handle: v.channels?.handle ?? "?" })
    );
    audit = (aud.data ?? []) as typeof audit;
    awards = (awd.data ?? []) as unknown as typeof awards;
  }

  // ---- plain admin list (verification only) ----
  let query = supabase
    .from("channels")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const q = searchParams.q?.trim();
  if (q) query = query.or(`handle.ilike.%${q}%,display_name.ilike.%${q}%`);
  const { data } = await query;
  const channels = (data ?? []) as Channel[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{isOwner ? "Boss Admin" : "Admin"}</h1>
        {isOwner && (
          <span className="rounded-full bg-yt-red/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-yt-red">
            Owner
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-yt-sub">
        {isOwner
          ? "Full control over channels, videos, and Play Button awards. Destructive actions are logged."
          : "Grant or remove the verification checkmark."}
      </p>

      {isOwner && (
        <div className="mt-8">
          <BossConsole
            channels={overview}
            videos={videos}
            storageLimitBytes={STORAGE_LIMIT_BYTES}
          />
        </div>
      )}

      {/* ---- verification (all admins) ---- */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-medium">Verification</h2>
        <form>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search channels by name or handle"
            className="h-10 w-full max-w-md rounded-full border border-yt-border bg-[#121212] px-4 text-sm outline-none focus:border-yt-blue"
          />
        </form>

        <div className="mt-4 divide-y divide-yt-border rounded-xl border border-yt-border">
          {channels.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4">
              <ChannelAvatar src={c.avatar_url} name={c.display_name} size={40} />
              <div className="min-w-0 flex-1">
                <Link href={`/channel/@${c.handle}`} className="font-medium hover:underline">
                  {c.display_name}
                </Link>
                <div className="text-sm text-yt-sub">
                  @{c.handle} · {formatCount(c.subscriber_count)} subscribers
                  {c.is_admin && " · admin"}
                </div>
              </div>
              <VerifyToggle channelId={c.id} verified={c.verified} />
            </div>
          ))}
          {channels.length === 0 && (
            <p className="p-8 text-center text-sm text-yt-sub">No channels found.</p>
          )}
        </div>
      </section>

      {isOwner && (
        <>
          {/* ---- awards ---- */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-medium">Play Button awards</h2>
            <div className="overflow-x-auto rounded-xl border border-yt-border">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-yt-border text-left text-yt-sub">
                    <th className="p-3 font-medium">Channel</th>
                    <th className="p-3 font-medium">Tier</th>
                    <th className="p-3 font-medium">Code</th>
                    <th className="p-3 font-medium">Sent to</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yt-border">
                  {awards.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3">@{a.channels?.handle ?? "?"}</td>
                      <td className="p-3 capitalize">{a.tier}</td>
                      <td className="p-3 font-mono text-xs">{a.claim_code}</td>
                      <td className="p-3 text-yt-sub">{a.recipient_email}</td>
                      <td className="p-3">
                        {a.claimed_at ? (
                          <span className="text-green-400">claimed</span>
                        ) : a.emailed_at ? (
                          <span className="text-yt-blue">emailed</span>
                        ) : (
                          <span className="text-yellow-400">not sent</span>
                        )}
                      </td>
                      <td className="p-3 text-yt-sub">{timeAgo(a.created_at)}</td>
                    </tr>
                  ))}
                  {awards.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-yt-sub">
                        No awards issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---- audit ---- */}
          <section className="mt-10 mb-10">
            <h2 className="mb-3 text-lg font-medium">Audit log</h2>
            <div className="divide-y divide-yt-border rounded-xl border border-yt-border">
              {audit.map((a) => (
                <div key={a.id} className="flex items-baseline gap-3 p-3 text-sm">
                  <span className="font-mono text-xs text-yt-blue">{a.action}</span>
                  <span className="text-yt-sub">
                    by @{a.actor_handle ?? "?"}
                    {a.target_handle ? ` → @${a.target_handle}` : ""}
                    {typeof a.detail?.reason === "string" && a.detail.reason
                      ? ` · "${a.detail.reason}"`
                      : ""}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-yt-sub">
                    {timeAgo(a.created_at)}
                  </span>
                </div>
              ))}
              {audit.length === 0 && (
                <p className="p-6 text-center text-sm text-yt-sub">Nothing logged yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
