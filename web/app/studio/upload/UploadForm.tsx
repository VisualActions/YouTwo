"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileVideo } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uuid } from "@/lib/browser";

export default function UploadForm() {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    setError(null);
    setPhase("uploading");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/studio/upload");
        return;
      }

      const videoId = uuid();
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const sourcePath = `${user.id}/${videoId}/source.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("uploads")
        .upload(sourcePath, file, { cacheControl: "3600" });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      setPhase("saving");
      const { error: insErr } = await supabase.from("videos").insert({
        id: videoId,
        channel_id: user.id,
        title: title.trim() || file.name,
        description,
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
        visibility,
        status: "processing",
        source_path: sourcePath,
      });
      if (insErr) throw new Error(`Could not save video: ${insErr.message}`);

      router.push("/studio/content");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPhase("idle");
    }
  }

  const busy = phase !== "idle";

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-yt-border py-12 hover:border-yt-sub">
        <FileVideo className="h-10 w-10 text-yt-sub" />
        {file ? (
          <span className="px-4 text-center text-sm">
            {file.name}{" "}
            <span className="text-yt-sub">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
          </span>
        ) : (
          <span className="text-sm text-yt-sub">Click to choose a video file</span>
        )}
        <input type="file" accept="video/*" hidden onChange={pick} />
      </label>

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
          rows={4}
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
      </div>
      <div>
        <label className="mb-1 block font-medium">Visibility</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as typeof visibility)}
          className="h-11 rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={busy || !file}
          className="h-10 rounded-full bg-yt-text px-6 font-medium text-black hover:bg-white/80 disabled:opacity-50"
        >
          {phase === "uploading"
            ? "Uploading..."
            : phase === "saving"
              ? "Finishing..."
              : "Upload"}
        </button>
      </div>
    </form>
  );
}
