"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function subscribe(channelId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("subscriptions")
    .insert({ subscriber_id: user.id, channel_id: channelId });
  if (error && error.code !== "23505") return { error: error.message };
  revalidatePath("/", "layout");
  return { error: null };
}

export async function unsubscribe(channelId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("subscriber_id", user.id)
    .eq("channel_id", channelId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { error: null };
}

const HANDLE_RE = /^[a-zA-Z0-9._-]{3,30}$/;

export async function updateChannel(input: {
  handle: string;
  display_name: string;
  description: string;
  avatar_url?: string | null;
  banner_url?: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const handle = input.handle.trim();
  const display_name = input.display_name.trim();
  if (!HANDLE_RE.test(handle))
    return { error: "Handle must be 3-30 characters: letters, numbers, . _ -" };
  if (display_name.length < 1 || display_name.length > 80)
    return { error: "Name must be 1-80 characters." };

  const update: Record<string, unknown> = {
    handle,
    display_name,
    description: input.description.slice(0, 5000),
  };
  if (input.avatar_url !== undefined) update.avatar_url = input.avatar_url;
  if (input.banner_url !== undefined) update.banner_url = input.banner_url;

  const { error } = await supabase
    .from("channels")
    .update(update)
    .eq("id", user.id);
  if (error) {
    if (error.code === "23505") return { error: "That handle is already taken." };
    return { error: error.message };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function setVerified(channelId: string, value: boolean) {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_verified", {
    target_channel: channelId,
    value,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateLiveTitle(title: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("channels")
    .update({ live_title: title.trim().slice(0, 120) || null })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/studio/stream");
  return { error: null };
}

export async function regenerateStreamKey() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("regenerate_stream_key");
  if (error) return { key: null, error: error.message };
  revalidatePath("/studio/stream");
  return { key: data as string, error: null };
}
