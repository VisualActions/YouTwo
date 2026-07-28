"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function rateVideo(videoId: string, value: 1 | -1 | 0) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let error;
  if (value === 0) {
    ({ error } = await supabase
      .from("video_ratings")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", user.id));
  } else {
    ({ error } = await supabase
      .from("video_ratings")
      .upsert({ video_id: videoId, user_id: user.id, value }));
  }
  if (error) return { error: error.message };
  revalidatePath(`/watch/${videoId}`);
  return { error: null };
}

export async function addComment(videoId: string, body: string, parentId?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const text = body.trim();
  if (!text) return { error: "Comment cannot be empty." };

  const { error } = await supabase.from("comments").insert({
    video_id: videoId,
    author_id: user.id,
    parent_id: parentId ?? null,
    body: text.slice(0, 5000),
  });
  if (error) return { error: error.message };
  revalidatePath(`/watch/${videoId}`);
  return { error: null };
}

export async function deleteComment(commentId: string, videoId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/watch/${videoId}`);
  return { error: null };
}
