import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { probe, transcodeToHls, makeThumbnail } from "./transcode.js";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POLL_MS = Number(process.env.WORKER_POLL_MS || 5000);

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env at repo root.\n" +
      "Get the service_role key from Supabase Dashboard -> Project Settings -> API keys."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CONTENT_TYPES = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
  ".jpg": "image/jpeg",
};

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

async function claimNextVideo() {
  const cutoff = new Date(Date.now() - 30 * 60_000).toISOString();
  const { data: candidates, error } = await supabase
    .from("videos")
    .select("id, source_path, published_at")
    .eq("status", "processing")
    .not("source_path", "is", null)
    .or(`claimed_at.is.null,claimed_at.lt.${cutoff}`)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw new Error(`claim query failed: ${error.message}`);
  if (!candidates?.length) return null;

  const { data: claimed, error: updErr } = await supabase
    .from("videos")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", candidates[0].id)
    .eq("status", "processing")
    .select("id, source_path, published_at")
    .single();
  if (updErr) return null; // raced with another worker
  return claimed;
}

async function uploadDir(bucket, localDir, remotePrefix) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true, recursive: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const full = path.join(entry.parentPath ?? entry.path, entry.name);
    const rel = path.relative(localDir, full).split(path.sep).join("/");
    const ext = path.extname(entry.name).toLowerCase();
    const body = fs.readFileSync(full);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${remotePrefix}/${rel}`, body, {
        contentType: CONTENT_TYPES[ext] ?? "application/octet-stream",
        upsert: true,
      });
    if (error) throw new Error(`upload ${rel} failed: ${error.message}`);
    count++;
  }
  return count;
}

async function processVideo(video) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "youtwo-"));
  const outDir = path.join(tmp, "out");
  fs.mkdirSync(outDir);
  try {
    log(`[${video.id}] downloading ${video.source_path}`);
    const { data: blob, error: dlErr } = await supabase.storage
      .from("uploads")
      .download(video.source_path);
    if (dlErr) throw new Error(`download failed: ${dlErr.message}`);
    const srcFile = path.join(tmp, `source${path.extname(video.source_path) || ".mp4"}`);
    fs.writeFileSync(srcFile, Buffer.from(await blob.arrayBuffer()));

    const info = await probe(srcFile);
    log(`[${video.id}] ${info.width}x${info.height}, ${info.duration.toFixed(1)}s, audio: ${info.hasAudio}`);

    let lastPct = -10;
    await transcodeToHls(srcFile, outDir, {
      hasAudio: info.hasAudio,
      onProgress: (p) => {
        const pct = Math.floor(p.percent ?? 0);
        if (pct >= lastPct + 10) {
          lastPct = pct;
          log(`[${video.id}] transcoding ${pct}%`);
        }
      },
    });

    const thumbFile = path.join(tmp, "thumb.jpg");
    await makeThumbnail(srcFile, thumbFile, info.duration);

    log(`[${video.id}] uploading HLS output`);
    const uploaded = await uploadDir("hls", outDir, video.id);
    log(`[${video.id}] uploaded ${uploaded} files`);

    const thumbPath = `${video.id}/thumb.jpg`;
    const { error: thumbErr } = await supabase.storage
      .from("thumbnails")
      .upload(thumbPath, fs.readFileSync(thumbFile), {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (thumbErr) throw new Error(`thumbnail upload failed: ${thumbErr.message}`);
    const thumbUrl = supabase.storage.from("thumbnails").getPublicUrl(thumbPath).data.publicUrl;

    const { error: updErr } = await supabase
      .from("videos")
      .update({
        status: "ready",
        playback_path: `${video.id}/master.m3u8`,
        thumbnail_url: thumbUrl,
        duration_seconds: info.duration,
        published_at: video.published_at ?? new Date().toISOString(),
        error_message: null,
      })
      .eq("id", video.id);
    if (updErr) throw new Error(`final update failed: ${updErr.message}`);
    log(`[${video.id}] READY`);
  } catch (err) {
    log(`[${video.id}] FAILED: ${err.message}`);
    await supabase
      .from("videos")
      .update({ status: "failed", error_message: String(err.message).slice(0, 2000) })
      .eq("id", video.id);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  log(`YouTwo worker started (poll every ${POLL_MS}ms)`);
  for (;;) {
    try {
      const video = await claimNextVideo();
      if (video) {
        await processVideo(video);
        continue; // check for more work immediately
      }
    } catch (err) {
      log("worker loop error:", err.message);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main();
