import Link from "next/link";
import { Search, Upload } from "lucide-react";
import { Brand } from "@youtwo/ui-kit";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import AvatarMenu from "./AvatarMenu";

export default async function Topbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let channel: Channel | null = null;
  if (user) {
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("id", user.id)
      .single();
    channel = data;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-4 bg-yt-bg px-4">
      <Brand />

      <form
        action="/results"
        className="flex h-10 w-full max-w-xl items-center"
        role="search"
      >
        <input
          type="text"
          name="search_query"
          placeholder="Search"
          className="h-full w-full rounded-l-full border border-yt-border bg-[#121212] px-4 text-base outline-none placeholder:text-yt-sub focus:border-yt-blue"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-full w-16 shrink-0 items-center justify-center rounded-r-full border border-l-0 border-yt-border bg-yt-raised hover:bg-yt-hover"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      <div className="flex shrink-0 items-center gap-2">
        {channel ? (
          <>
            <Link
              href="/studio"
              title="YouTwo Studio"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-yt-raised"
            >
              <Upload className="h-5 w-5" />
            </Link>
            <AvatarMenu channel={channel} />
          </>
        ) : (
          <Link
            href="/login"
            className="flex h-9 items-center gap-2 rounded-full border border-yt-border px-3 text-sm font-medium text-yt-blue hover:bg-yt-blue/10"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
