"use client";

import { useState, useTransition } from "react";
import { updateLiveTitle } from "@/lib/actions";

export default function LiveTitleForm({ initialTitle }: { initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await updateLiveTitle(title);
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={save} className="mt-6 rounded-xl border border-yt-border p-5">
      <label className="mb-1 block text-sm font-medium">Stream title</label>
      <p className="mb-3 text-xs text-yt-sub">
        Shown on your live page and used as the title of the saved recording.
      </p>
      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="My awesome stream"
          className="h-10 flex-1 rounded-lg border border-yt-border bg-[#121212] px-3 text-sm outline-none focus:border-yt-blue"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-full bg-yt-text px-5 text-sm font-medium text-black hover:bg-white/80 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {saved && <p className="mt-2 text-sm text-green-400">Saved.</p>}
    </form>
  );
}
