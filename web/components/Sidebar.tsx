import Link from "next/link";
import { Home, Clapperboard, ShieldCheck, UserSquare2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import ChannelAvatar from "./ChannelAvatar";
import VerifiedBadge from "./VerifiedBadge";

export default async function Sidebar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownChannel: Channel | null = null;
  let subs: Channel[] = [];
  if (user) {
    const [{ data: own }, { data: subRows }] = await Promise.all([
      supabase.from("channels").select("*").eq("id", user.id).single(),
      supabase
        .from("subscriptions")
        .select("channels!subscriptions_channel_id_fkey(*)")
        .eq("subscriber_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    ownChannel = own;
    subs = (subRows ?? [])
      .map((r) => r.channels as unknown as Channel)
      .filter(Boolean);
  }

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-60 overflow-y-auto px-3 pb-6 lg:block">
      <nav className="flex flex-col">
        <SideLink href="/" icon={<Home className="h-5 w-5" />} label="Home" />
        {ownChannel && (
          <>
            <SideLink
              href={`/channel/@${ownChannel.handle}`}
              icon={<UserSquare2 className="h-5 w-5" />}
              label="Your channel"
            />
            <SideLink
              href="/studio"
              icon={<Clapperboard className="h-5 w-5" />}
              label="Studio"
            />
            {ownChannel.is_admin && (
              <SideLink
                href="/admin"
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Admin"
              />
            )}
          </>
        )}
      </nav>

      {subs.length > 0 && (
        <>
          <hr className="my-3 border-yt-border" />
          <h3 className="px-3 pb-1 text-base font-medium">Subscriptions</h3>
          <nav className="flex flex-col">
            {subs.map((c) => (
              <Link
                key={c.id}
                href={`/channel/@${c.handle}`}
                className="flex items-center gap-4 rounded-lg px-3 py-2 text-sm hover:bg-yt-raised"
              >
                <ChannelAvatar src={c.avatar_url} name={c.display_name} size={24} />
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate">{c.display_name}</span>
                  {c.verified && <VerifiedBadge />}
                </span>
                {c.is_live && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-yt-red" title="Live" />
                )}
              </Link>
            ))}
          </nav>
        </>
      )}

      {!user && (
        <>
          <hr className="my-3 border-yt-border" />
          <p className="px-3 text-sm text-yt-sub">
            Sign in to subscribe to channels and upload videos.
          </p>
          <Link
            href="/login"
            className="mx-3 mt-3 flex h-9 w-fit items-center gap-2 rounded-full border border-yt-border px-3 text-sm font-medium text-yt-blue hover:bg-yt-blue/10"
          >
            Sign in
          </Link>
        </>
      )}
    </aside>
  );
}

function SideLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 rounded-lg px-3 py-2 text-sm hover:bg-yt-raised"
    >
      {icon}
      {label}
    </Link>
  );
}
