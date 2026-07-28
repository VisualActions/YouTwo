"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Videos", path: "" },
  { label: "Live", path: "/live" },
  { label: "Playlists", path: "/playlists" },
  { label: "About", path: "/about" },
];

export default function ChannelTabs({ handle }: { handle: string }) {
  const pathname = usePathname();
  const base = `/channel/@${handle}`;

  return (
    <div className="mt-6 flex gap-6 border-b border-yt-border">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}`;
        const active =
          tab.path === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);
        return (
          <Link
            key={tab.label}
            href={href}
            className={`border-b-2 pb-2 text-base font-medium ${
              active
                ? "border-yt-text text-yt-text"
                : "border-transparent text-yt-sub hover:text-yt-text"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
