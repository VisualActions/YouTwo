"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { updateVideo, deleteVideo } from "@/lib/videoActions";
import StatusBadge from "@/components/StatusBadge";

export default function EditVideoForm({ video }: { video: Video }) {
  const router = useRouter();
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [tags, setTags] = useState(video.tags.join(", "));
  const [visibility, setVisibility] = useState(video.visibility);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateVideo({
        id: video.id,
        title,
        description,
        tags: tags.split(","),
        visibility,
      });
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteVideo(video.id);
      if (res?.error) setError(res.error);
      else router.push("/studio/content");
    });
  }

  return (
    <form onSubmit={save} className="mt-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 text-sm text-yt-sub">
        Status: <StatusBadge status={video.status} />
        {video.status === "ready" && (
          <Link href={`/watch/${video.id}`} className="text-yt-blue hover:underline">
            View on YouTwo
          </Link>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className="h-11 w-full rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
        />
      </div>
      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-yt-border bg-[#121212] p-3 outline-none focus:border-yt-blue"
        />
      </div>
      <div>
        <label className="mb-1 block font-medium">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="gaming, tutorial, music"
          className="h-11 w-full rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
        />
        <p className="mt-1 text-xs text-yt-sub">Comma-separated. Used for search and recommendations.</p>
      </div>
      <div>
        <label className="mb-1 block font-medium">Visibility</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Video["visibility"])}
          className="h-11 rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Saved.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-yt-text px-6 font-medium text-black hover:bg-white/80 disabled:opacity-50"
        >
          {pending ? "Working..." : "Save"}
        </button>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="h-10 rounded-full bg-red-600 px-5 font-medium hover:bg-red-500 disabled:opacity-50"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="h-10 rounded-full bg-yt-raised px-5 font-medium hover:bg-yt-hover"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="h-10 rounded-full bg-yt-raised px-5 font-medium text-red-400 hover:bg-yt-hover"
          >
            Delete video
          </button>
        )}
      </div>
    </form>
  );
}
