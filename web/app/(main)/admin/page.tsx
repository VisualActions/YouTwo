import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import { formatCount } from "@/lib/format";
import ChannelAvatar from "@/components/ChannelAvatar";
import VerifyToggle from "@/components/VerifyToggle";

export const dynamic = "force-dynamic";

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
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) redirect("/");

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
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-1 text-sm text-yt-sub">
        Grant or remove the verification checkmark.
      </p>

      <form className="mt-6">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search channels by name or handle"
          className="h-10 w-full max-w-md rounded-full border border-yt-border bg-[#121212] px-4 text-sm outline-none focus:border-yt-blue"
        />
      </form>

      <div className="mt-6 divide-y divide-yt-border rounded-xl border border-yt-border">
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
    </div>
  );
}
