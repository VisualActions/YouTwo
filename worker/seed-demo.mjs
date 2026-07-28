// Seeds a demo channel + videos through the real pipeline, exactly as the
// Studio upload page does. The worker then transcodes them to HLS.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = process.env.DEMO_EMAIL || "demo@youtwo.local";
const PASSWORD = process.env.DEMO_PASSWORD;
if (!PASSWORD) {
  console.error("set DEMO_PASSWORD in .env (or the environment) before seeding");
  process.exit(1);
}

// 1. Demo account (channel + stream key are created by the auth trigger)
let userId;
const { data: existing } = await admin.auth.admin.listUsers();
const found = existing.users.find((u) => u.email === EMAIL);
if (found) {
  userId = found.id;
  console.log("reusing demo user", userId);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "YouTwo Demo" },
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  userId = data.user.id;
  console.log("created demo user", userId);
}

await admin
  .from("channels")
  .update({
    handle: "youtwodemo",
    display_name: "YouTwo Demo",
    description: "Sample uploads so the site has something to watch.",
    verified: true,
  })
  .eq("id", userId);

const VIDEOS = [
  {
    file: "yt-demo1.mp4",
    title: "Welcome to YouTwo — test pattern in 1080p",
    description: "A 20 second 1080p clip pushed through the real upload pipeline: Supabase storage in, ffmpeg HLS ladder out.",
    tags: ["demo", "test", "1080p"],
  },
  {
    file: "yt-demo2.mp4",
    title: "SMPTE colour bars (720p)",
    description: "Short 720p clip. Useful for checking colour and the duration badge.",
    tags: ["demo", "test", "720p"],
  },
  {
    file: "yt-demo3.mp4",
    title: "Mandelbrot zoom — 25 seconds of fractal",
    description: "A longer render to exercise the transcoder and the recommendations column.",
    tags: ["demo", "fractal", "render"],
  },
];

for (const v of VIDEOS) {
  const src = path.join(os.tmpdir(), v.file);
  if (!fs.existsSync(src)) {
    console.log(`skip ${v.file} (not found)`);
    continue;
  }
  const { data: dupe } = await admin.from("videos").select("id").eq("title", v.title).maybeSingle();
  if (dupe) {
    console.log(`skip "${v.title}" (already seeded)`);
    continue;
  }

  const videoId = crypto.randomUUID();
  const sourcePath = `${userId}/${videoId}/source.mp4`;
  const { error: upErr } = await admin.storage
    .from("uploads")
    .upload(sourcePath, fs.readFileSync(src), { contentType: "video/mp4" });
  if (upErr) throw new Error(`upload ${v.file}: ${upErr.message}`);

  const { error: insErr } = await admin.from("videos").insert({
    id: videoId,
    channel_id: userId,
    title: v.title,
    description: v.description,
    tags: v.tags,
    visibility: "public",
    status: "processing",
    source_path: sourcePath,
  });
  if (insErr) throw new Error(`insert ${v.title}: ${insErr.message}`);
  console.log(`queued "${v.title}" -> ${videoId}`);
}

console.log("\ndemo channel: @youtwodemo");
console.log(`sign-in (if you want it): ${EMAIL} / ${PASSWORD}`);
