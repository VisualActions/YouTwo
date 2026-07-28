"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVideo(input: {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visibility: "public" | "unlisted" | "private";
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = input.title.trim();
  if (!title) return { error: "Title is required." };

  const { error } = await supabase
    .from("videos")
    .update({
      title,
      description: input.description.slice(0, 10000),
      tags: input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 30),
      visibility: input.visibility,
    })
    .eq("id", input.id)
    .eq("channel_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteVideo(videoId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS restricts the delete to the owner's own videos
  const { data: video, error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("channel_id", user.id)
    .select("id, source_path")
    .single();
  if (error) return { error: error.message };

  // best-effort storage cleanup (service role required)
  const admin = createAdminClient();
  if (admin && video) {
    try {
      if (video.source_path) {
        await admin.storage.from("uploads").remove([video.source_path]);
      }
      for (const bucket of ["hls", "thumbnails"] as const) {
        const { data: files } = await admin.storage.from(bucket).list(video.id, { limit: 1000 });
        if (files?.length) {
          await admin.storage
            .from(bucket)
            .remove(files.map((f) => `${video.id}/${f.name}`));
        }
      }
    } catch (e) {
      console.warn("storage cleanup failed", e);
    }
  }

  revalidatePath("/", "layout");
  return { error: null };
}
