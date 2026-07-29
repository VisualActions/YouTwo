"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Boss console actions.
 *
 * Every one of these runs with the service-role key, which bypasses RLS
 * entirely, so authorisation is enforced here rather than by the database:
 * the caller's own session is checked for is_owner before anything happens.
 * Never call these from anywhere that hasn't been through requireOwner().
 */
type Actor = { id: string; handle: string };

async function requireOwner(): Promise<
  { ok: true; actor: Actor } | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data } = await supabase
    .from("channels")
    .select("handle, is_owner")
    .eq("id", user.id)
    .single();

  if (!data?.is_owner) return { ok: false, error: "Owner access required." };
  return { ok: true, actor: { id: user.id, handle: data.handle } };
}

async function audit(
  actor: Actor,
  action: string,
  fields: {
    target_channel?: string | null;
    target_handle?: string | null;
    target_video?: string | null;
    detail?: Record<string, unknown>;
  }
) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("admin_audit").insert({
    actor_id: actor.id,
    actor_handle: actor.handle,
    action,
    target_channel: fields.target_channel ?? null,
    target_handle: fields.target_handle ?? null,
    target_video: fields.target_video ?? null,
    detail: fields.detail ?? {},
  });
}

/** Removes every stored object belonging to a video (HLS, thumbnail, source). */
async function purgeVideoStorage(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  video: { id: string; source_path: string | null }
) {
  for (const bucket of ["hls", "thumbnails"] as const) {
    const { data: entries } = await admin.storage.from(bucket).list(video.id, { limit: 1000 });
    const paths = (entries ?? []).filter((e) => e.id).map((e) => `${video.id}/${e.name}`);
    for (const dir of (entries ?? []).filter((e) => !e.id)) {
      const { data: sub } = await admin.storage
        .from(bucket)
        .list(`${video.id}/${dir.name}`, { limit: 1000 });
      paths.push(...(sub ?? []).map((e) => `${video.id}/${dir.name}/${e.name}`));
    }
    if (paths.length) await admin.storage.from(bucket).remove(paths);
  }
  if (video.source_path) await admin.storage.from("uploads").remove([video.source_path]);
}

export async function bossDeleteVideo(videoId: string, reason: string) {
  const gate = await requireOwner();
  if (!gate.ok) return { error: gate.error };
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };

  const { data: video } = await admin
    .from("videos")
    .select("id, title, source_path, channel_id, channels!videos_channel_id_fkey(handle)")
    .eq("id", videoId)
    .single();
  if (!video) return { error: "Video not found." };

  await purgeVideoStorage(admin, video);
  const { error } = await admin.from("videos").delete().eq("id", videoId);
  if (error) return { error: error.message };

  await audit(gate.actor, "video.delete", {
    target_channel: video.channel_id,
    target_handle: (video.channels as unknown as { handle: string })?.handle,
    target_video: videoId,
    detail: { title: video.title, reason },
  });

  revalidatePath("/", "layout");
  return { error: null };
}

/** Softer than deleting: hides the video without destroying the files. */
export async function bossSetVideoVisibility(
  videoId: string,
  visibility: "public" | "unlisted" | "private",
  reason: string
) {
  const gate = await requireOwner();
  if (!gate.ok) return { error: gate.error };
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };

  const { data: video } = await admin
    .from("videos")
    .select("id, title, channel_id")
    .eq("id", videoId)
    .single();
  if (!video) return { error: "Video not found." };

  const { error } = await admin.from("videos").update({ visibility }).eq("id", videoId);
  if (error) return { error: error.message };

  await audit(gate.actor, "video.visibility", {
    target_channel: video.channel_id,
    target_video: videoId,
    detail: { title: video.title, visibility, reason },
  });

  revalidatePath("/", "layout");
  return { error: null };
}

/**
 * Suspending hides everything a channel published without destroying it, and
 * is reversible. Prefer this to deletion — deletion cannot be undone.
 */
export async function bossSetSuspended(channelId: string, suspend: boolean, reason: string) {
  const gate = await requireOwner();
  if (!gate.ok) return { error: gate.error };
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };

  const { data: channel } = await admin
    .from("channels")
    .select("id, handle, is_owner")
    .eq("id", channelId)
    .single();
  if (!channel) return { error: "Channel not found." };
  if (channel.is_owner) return { error: "Owner channels cannot be suspended." };

  const { error } = await admin
    .from("channels")
    .update({
      suspended_at: suspend ? new Date().toISOString() : null,
      suspended_reason: suspend ? reason : null,
      is_live: suspend ? false : undefined,
    })
    .eq("id", channelId);
  if (error) return { error: error.message };

  // Hide or restore their catalogue alongside the flag.
  await admin
    .from("videos")
    .update({ visibility: suspend ? "private" : "public" })
    .eq("channel_id", channelId);

  await audit(gate.actor, suspend ? "channel.suspend" : "channel.unsuspend", {
    target_channel: channelId,
    target_handle: channel.handle,
    detail: { reason },
  });

  revalidatePath("/", "layout");
  return { error: null };
}

/**
 * Deletes the auth user, which cascades to the channel, videos, comments,
 * subscriptions and ratings, after clearing the storage those rows point at.
 * Irreversible.
 */
export async function bossDeleteChannel(
  channelId: string,
  confirmHandle: string,
  reason: string
) {
  const gate = await requireOwner();
  if (!gate.ok) return { error: gate.error };
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };

  if (channelId === gate.actor.id) return { error: "You cannot delete your own channel." };

  const { data: channel } = await admin
    .from("channels")
    .select("id, handle, is_owner")
    .eq("id", channelId)
    .single();
  if (!channel) return { error: "Channel not found." };
  if (channel.is_owner) return { error: "Owner channels cannot be deleted." };
  if (confirmHandle.trim().replace(/^@/, "") !== channel.handle) {
    return { error: `Type the handle "${channel.handle}" exactly to confirm.` };
  }

  const { data: videos } = await admin
    .from("videos")
    .select("id, source_path")
    .eq("channel_id", channelId);
  for (const v of videos ?? []) await purgeVideoStorage(admin, v);

  // Channel art lives under <channel_id>/ in its own buckets.
  for (const bucket of ["avatars", "banners", "uploads"] as const) {
    const { data: entries } = await admin.storage.from(bucket).list(channelId, { limit: 1000 });
    const paths = (entries ?? []).filter((e) => e.id).map((e) => `${channelId}/${e.name}`);
    if (paths.length) await admin.storage.from(bucket).remove(paths);
  }

  const { error } = await admin.auth.admin.deleteUser(channelId);
  if (error) return { error: error.message };

  await audit(gate.actor, "channel.delete", {
    target_channel: channelId,
    target_handle: channel.handle,
    detail: { reason, videos_removed: (videos ?? []).length },
  });

  revalidatePath("/", "layout");
  return { error: null };
}

export async function bossSetAdmin(channelId: string, makeAdmin: boolean) {
  const gate = await requireOwner();
  if (!gate.ok) return { error: gate.error };
  const admin = createAdminClient();
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };

  const { data: channel } = await admin
    .from("channels")
    .select("handle, is_owner")
    .eq("id", channelId)
    .single();
  if (!channel) return { error: "Channel not found." };
  if (channel.is_owner) return { error: "Owner channels always keep admin." };

  const { error } = await admin.from("channels").update({ is_admin: makeAdmin }).eq("id", channelId);
  if (error) return { error: error.message };

  await audit(gate.actor, makeAdmin ? "channel.grant_admin" : "channel.revoke_admin", {
    target_channel: channelId,
    target_handle: channel.handle,
  });

  revalidatePath("/admin");
  return { error: null };
}
