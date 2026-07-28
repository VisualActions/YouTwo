"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck, User, Clapperboard } from "lucide-react";
import type { Channel } from "@/lib/types";
import { signOut } from "@/lib/actions";
import ChannelAvatar from "./ChannelAvatar";

export default function AvatarMenu({ channel }: { channel: Channel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="block rounded-full"
      >
        <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={32} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-72 overflow-hidden rounded-xl bg-yt-raised py-2 shadow-xl">
          <div className="flex gap-4 px-4 py-2">
            <ChannelAvatar src={channel.avatar_url} name={channel.display_name} size={40} />
            <div className="min-w-0">
              <div className="truncate font-medium">{channel.display_name}</div>
              <div className="truncate text-sm text-yt-sub">@{channel.handle}</div>
            </div>
          </div>
          <hr className="my-2 border-yt-border" />
          <MenuLink
            href={`/channel/@${channel.handle}`}
            icon={<User className="h-5 w-5" />}
            label="Your channel"
            close={() => setOpen(false)}
          />
          <MenuLink
            href="/studio"
            icon={<Clapperboard className="h-5 w-5" />}
            label="YouTwo Studio"
            close={() => setOpen(false)}
          />
          {channel.is_admin && (
            <MenuLink
              href="/admin"
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Admin"
              close={() => setOpen(false)}
            />
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-4 px-4 py-2 text-sm hover:bg-yt-hover"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  close,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  close: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      className="flex items-center gap-4 px-4 py-2 text-sm hover:bg-yt-hover"
    >
      {icon}
      {label}
    </Link>
  );
}
