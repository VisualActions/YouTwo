// Provisions the official YouTwo channel: account, handle, art, description,
// and the welcome video (queued through the normal transcode pipeline).
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(path.dirname(here));
dotenv.config({ path: path.join(rootDir, ".env") });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = "thegameroomytchannel@gmail.com";
const PASSWORD = process.argv[2];
if (!PASSWORD) {
  console.error("usage: node setup-channel.mjs <password>");
  process.exit(1);
}

// 1. Account. email_confirm skips the confirmation mail entirely — nothing is
//    ever sent to this address.
let userId;
const { data: list } = await admin.auth.admin.listUsers();
const found = list.users.find((u) => u.email === EMAIL);
if (found) {
  userId = found.id;
  await admin.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
  console.log("reused existing account", userId);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "YouTwo" },
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  userId = data.user.id;
  console.log("created account", userId);
}

// 2. Channel art -> public buckets
async function putImage(bucket, file, name) {
  const p = `${userId}/${name}`;
  const { error } = await admin.storage.from(bucket).upload(p, fs.readFileSync(file), {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`${bucket}: ${error.message}`);
  return admin.storage.from(bucket).getPublicUrl(p).data.publicUrl;
}

const avatarUrl = await putImage("avatars", path.join(here, "out", "avatar.png"), `avatar-${Date.now()}.png`);
const bannerUrl = await putImage("banners", path.join(here, "out", "banner.png"), `banner-${Date.now()}.png`);
console.log("uploaded channel art");

// 3. Channel profile
const { error: chErr } = await admin
  .from("channels")
  .update({
    handle: "youtwo",
    display_name: "YouTwo",
    description:
      "The official YouTwo channel.\n\n" +
      "YouTwo is a self-hosted video platform — uploads, HLS streaming, live broadcasting, " +
      "and channels, all running on hardware you own. No algorithm deciding what you see, " +
      "no ads, no data harvesting.\n\n" +
      "Built from scratch with Next.js, Supabase, and ffmpeg.",
    avatar_url: avatarUrl,
    banner_url: bannerUrl,
    verified: true,
  })
  .eq("id", userId);
if (chErr) throw new Error(`channel update: ${chErr.message}`);
console.log("channel profile set: @youtwo");

// 4. Welcome video, queued exactly like a Studio upload
const src = path.join(here, "out", "welcome-to-youtwo.mp4");
const TITLE = "Welcome to YouTwo";
const { data: dupe } = await admin
  .from("videos")
  .select("id")
  .eq("channel_id", userId)
  .eq("title", TITLE)
  .maybeSingle();

if (dupe) {
  console.log("welcome video already exists, replacing it");
  await admin.from("videos").delete().eq("id", dupe.id);
}

const videoId = crypto.randomUUID();
const sourcePath = `${userId}/${videoId}/source.mp4`;
const { error: upErr } = await admin.storage
  .from("uploads")
  .upload(sourcePath, fs.readFileSync(src), { contentType: "video/mp4" });
if (upErr) throw new Error(`video upload: ${upErr.message}`);

const { error: insErr } = await admin.from("videos").insert({
  id: videoId,
  channel_id: userId,
  title: TITLE,
  description:
    "A short intro to YouTwo — self-hosted video with no algorithm and no ads.",
  tags: ["youtwo", "welcome", "intro"],
  visibility: "public",
  status: "processing",
  source_path: sourcePath,
});
if (insErr) throw new Error(`video insert: ${insErr.message}`);

console.log(`queued "${TITLE}" -> ${videoId}`);
console.log(`\nchannel: /channel/@youtwo`);
console.log(`sign-in: ${EMAIL}`);
