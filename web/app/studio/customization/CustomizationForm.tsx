"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Channel } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { updateChannel } from "@/lib/actions";
import ChannelAvatar from "@/components/ChannelAvatar";

export default function CustomizationForm({ channel }: { channel: Channel }) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(channel.display_name);
  const [handle, setHandle] = useState(channel.handle);
  const [description, setDescription] = useState(channel.description);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(channel.avatar_url);
  const [bannerPreview, setBannerPreview] = useState<string | null>(channel.banner_url);
  const avatarFile = useRef<File | null>(null);
  const bannerFile = useRef<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function pickFile(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "avatar" | "banner"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "avatar") {
      avatarFile.current = file;
      setAvatarPreview(url);
    } else {
      bannerFile.current = file;
      setBannerPreview(url);
    }
  }

  async function uploadImage(file: File, bucket: "avatars" | "banners") {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${channel.id}/${bucket === "avatars" ? "avatar" : "banner"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw new Error(`${bucket} upload failed: ${error.message}`);
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      let avatar_url: string | undefined;
      let banner_url: string | undefined;
      if (avatarFile.current) avatar_url = await uploadImage(avatarFile.current, "avatars");
      if (bannerFile.current) banner_url = await uploadImage(bannerFile.current, "banners");

      const res = await updateChannel({
        handle,
        display_name: displayName,
        description,
        ...(avatar_url !== undefined ? { avatar_url } : {}),
        ...(banner_url !== undefined ? { banner_url } : {}),
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      avatarFile.current = null;
      bannerFile.current = null;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-8 flex flex-col gap-8">
      <section>
        <h2 className="font-medium">Banner image</h2>
        <p className="mb-3 text-sm text-yt-sub">Shown across the top of your channel.</p>
        <div className="overflow-hidden rounded-xl border border-yt-border">
          {bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerPreview} alt="Banner preview" className="h-36 w-full object-cover" />
          ) : (
            <div className="flex h-36 items-center justify-center bg-yt-raised text-sm text-yt-sub">
              No banner
            </div>
          )}
        </div>
        <label className="mt-3 inline-block cursor-pointer rounded-full bg-yt-raised px-4 py-2 text-sm font-medium hover:bg-yt-hover">
          Choose banner
          <input type="file" accept="image/*" hidden onChange={(e) => pickFile(e, "banner")} />
        </label>
      </section>

      <section>
        <h2 className="font-medium">Profile picture</h2>
        <p className="mb-3 text-sm text-yt-sub">Shown next to your videos and comments.</p>
        <div className="flex items-center gap-5">
          <ChannelAvatar src={avatarPreview} name={displayName} size={80} />
          <label className="cursor-pointer rounded-full bg-yt-raised px-4 py-2 text-sm font-medium hover:bg-yt-hover">
            Choose picture
            <input type="file" accept="image/*" hidden onChange={(e) => pickFile(e, "avatar")} />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block font-medium">Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={80}
            className="h-11 w-full rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Handle</label>
          <div className="flex items-center">
            <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-yt-border bg-yt-raised px-3 text-yt-sub">
              @
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
              pattern="[a-zA-Z0-9._\-]{3,30}"
              title="3-30 characters: letters, numbers, . _ -"
              className="h-11 w-full rounded-r-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="Tell viewers about your channel"
            className="w-full rounded-lg border border-yt-border bg-[#121212] p-3 outline-none focus:border-yt-blue"
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Saved.</p>}

      <div>
        <button
          type="submit"
          disabled={busy}
          className="h-10 rounded-full bg-yt-text px-6 font-medium text-black hover:bg-white/80 disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
