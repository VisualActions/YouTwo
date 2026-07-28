// End-to-end test of engagement flows through RLS as real signed-in users.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });

const URL_ = process.env.SUPABASE_URL;
// The anon key is publishable, but it still belongs in config rather than source.
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL_ || !ANON || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}
const admin = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY);

const VIDEO = "93d6a777-d1ad-4124-bbfc-a77d63cf9a9e";
const USER1 = "a17c2c59-59ee-4e37-ad1f-9e23db56ad61"; // owns the test video
let pass = 0;
let fail = 0;
function check(name, ok, extra = "") {
  if (ok) {
    pass++;
    console.log(`  ok: ${name}`);
  } else {
    fail++;
    console.log(`  FAIL: ${name} ${extra}`);
  }
}

// confirm user1's email so password sign-in works
await admin.auth.admin.updateUserById(USER1, { email_confirm: true });

// create a second confirmed user (channel auto-created by trigger)
const email2 = `youtwo.test2.${Date.now()}@gmail.com`;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: email2,
  password: "test-password-123",
  email_confirm: true,
});
check("admin can create user2", !createErr, createErr?.message);
const USER2 = created.user.id;
const { data: ch2 } = await admin.from("channels").select("*").eq("id", USER2).single();
check("trigger created channel for user2", !!ch2);

const u2 = createClient(URL_, ANON);
const { error: signInErr } = await u2.auth.signInWithPassword({
  email: email2,
  password: "test-password-123",
});
check("user2 can sign in", !signInErr, signInErr?.message);

// --- views ---
const { data: vBefore } = await admin.from("videos").select("view_count, comment_count").eq("id", VIDEO).single();
await u2.rpc("record_view", { target_video: VIDEO });
await u2.rpc("record_view", { target_video: VIDEO }); // throttled duplicate
const { data: vAfter } = await admin.from("videos").select("view_count").eq("id", VIDEO).single();
check(
  "view recorded once (throttled)",
  vAfter.view_count === vBefore.view_count + 1,
  `got ${vAfter.view_count}, was ${vBefore.view_count}`
);

// --- ratings ---
await u2.from("video_ratings").upsert({ video_id: VIDEO, user_id: USER2, value: 1 });
let { data: v } = await admin.from("videos").select("like_count, dislike_count").eq("id", VIDEO).single();
check("like counted", v.like_count === 1 && v.dislike_count === 0, JSON.stringify(v));
await u2.from("video_ratings").upsert({ video_id: VIDEO, user_id: USER2, value: -1 });
({ data: v } = await admin.from("videos").select("like_count, dislike_count").eq("id", VIDEO).single());
check("switch to dislike", v.like_count === 0 && v.dislike_count === 1, JSON.stringify(v));
await u2.from("video_ratings").delete().eq("video_id", VIDEO).eq("user_id", USER2);
({ data: v } = await admin.from("videos").select("like_count, dislike_count").eq("id", VIDEO).single());
check("rating removed", v.like_count === 0 && v.dislike_count === 0, JSON.stringify(v));

// user2 cannot rate as someone else
const { error: forgeErr } = await u2
  .from("video_ratings")
  .insert({ video_id: VIDEO, user_id: USER1, value: 1 });
check("cannot forge rating for another user", !!forgeErr);

// --- comments ---
const { data: c1, error: cErr } = await u2
  .from("comments")
  .insert({ video_id: VIDEO, author_id: USER2, body: "first!" })
  .select()
  .single();
check("comment added", !cErr, cErr?.message);
const { error: rErr } = await u2
  .from("comments")
  .insert({ video_id: VIDEO, author_id: USER2, parent_id: c1.id, body: "replying to myself" });
check("reply added", !rErr, rErr?.message);
const { data: vc } = await admin.from("videos").select("comment_count").eq("id", VIDEO).single();
check(
  "comment_count +2",
  vc.comment_count === vBefore.comment_count + 2,
  `got ${vc.comment_count}, was ${vBefore.comment_count}`
);

// --- subscriptions ---
const { error: subErr } = await u2
  .from("subscriptions")
  .insert({ subscriber_id: USER2, channel_id: USER1 });
check("subscribe works", !subErr, subErr?.message);
let { data: chan } = await admin.from("channels").select("subscriber_count").eq("id", USER1).single();
check("subscriber_count = 1", chan.subscriber_count === 1, `got ${chan.subscriber_count}`);
await u2.from("subscriptions").delete().eq("subscriber_id", USER2).eq("channel_id", USER1);
({ data: chan } = await admin.from("channels").select("subscriber_count").eq("id", USER1).single());
check("unsubscribe decrements", chan.subscriber_count === 0, `got ${chan.subscriber_count}`);

// --- security: privileged fields locked down ---
const { error: verErr } = await u2.from("channels").update({ verified: true }).eq("id", USER2);
check("cannot self-verify (column grant)", !!verErr);
const { error: rpcErr } = await u2.rpc("set_verified", { target_channel: USER2, value: true });
check("set_verified rejects non-admin", !!rpcErr);
const { data: keyLeak } = await u2.from("stream_keys").select("key").neq("channel_id", USER2);
check("cannot read others' stream keys", (keyLeak ?? []).length === 0);
const { data: ownKey } = await u2.from("stream_keys").select("key").eq("channel_id", USER2).single();
check("can read own stream key", !!ownKey?.key);
const { data: newKey } = await u2.rpc("regenerate_stream_key");
check("regenerate_stream_key returns new key", typeof newKey === "string" && newKey !== ownKey.key);

// --- channel edit (granted columns) ---
const { error: editErr } = await u2
  .from("channels")
  .update({ display_name: "Test Two", description: "hey" })
  .eq("id", USER2);
check("owner can edit profile fields", !editErr, editErr?.message);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
