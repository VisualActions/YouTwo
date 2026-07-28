import NodeMediaServer from "node-media-server";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import express from "express";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RTMP_PORT = Number(process.env.RTMP_PORT || 1935);
const HTTP_PORT = Number(process.env.LIVE_HTTP_PORT || 8000);

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

const liveDir = path.join(rootDir, "rtmp", "live-media");
const recDir = path.join(rootDir, "rtmp", "recordings");
fs.mkdirSync(liveDir, { recursive: true });
fs.mkdirSync(recDir, { recursive: true });

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

// ---------- HTTP server for live HLS output ----------
const app = express();
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  next();
});
app.use("/live", express.static(liveDir));
app.listen(HTTP_PORT, () =>
  log(`Live HLS server on http://localhost:${HTTP_PORT}/live`)
);

// ---------- RTMP ingest ----------
const nms = new NodeMediaServer({
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  logType: 2,
});

// streamKey -> { channel, ffmpeg, startedAt, recordFile }
const activeStreams = new Map();

function extractKey(streamPath) {
  // OBS publishes to rtmp://host/live/<streamKey> -> "/live/<streamKey>"
  const parts = streamPath.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "live" ? parts[1] : null;
}

nms.on("prePublish", async (id, streamPath) => {
  const session = nms.getSession(id);
  const key = extractKey(streamPath);
  if (!key) {
    log(`reject publish (bad path): ${streamPath}`);
    return session.reject();
  }

  const { data: keyRow, error } = await supabase
    .from("stream_keys")
    .select("channel_id, channels(id, handle, display_name, live_title)")
    .eq("key", key)
    .maybeSingle();
  if (error || !keyRow) {
    log(`reject publish (invalid key): ...${key.slice(-6)}`);
    return session.reject();
  }
  const channel = keyRow.channels;
  if (activeStreams.has(key)) {
    log(`reject publish (already live): @${channel.handle}`);
    return session.reject();
  }

  const outDir = path.join(liveDir, channel.id);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const outFwd = outDir.split(path.sep).join("/");
  const recordFile = path.join(
    recDir,
    `${channel.id}-${Date.now()}.ts`
  );

  // one ffmpeg: transcode to HLS for viewers + keep a mpegts copy as recording
  const args = [
    "-loglevel", "error",
    "-i", `rtmp://127.0.0.1:${RTMP_PORT}${streamPath}`,
    // live HLS rendition (720p)
    "-map", "0:v:0", "-map", "0:a:0?",
    "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency",
    "-vf", "scale=-2:720",
    "-b:v", "2800k", "-maxrate", "3000k", "-bufsize", "4200k",
    "-g", "60", "-sc_threshold", "0",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "6",
    "-hls_flags", "delete_segments+independent_segments",
    "-hls_segment_filename", `${outFwd}/seg_%05d.ts`,
    `${outFwd}/index.m3u8`,
    // recording (stream copy, remuxed to mpegts)
    "-map", "0:v:0", "-map", "0:a:0?",
    "-c", "copy",
    "-f", "mpegts",
    recordFile.split(path.sep).join("/"),
  ];
  const ff = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  let ffErr = "";
  ff.stderr.on("data", (d) => {
    ffErr = (ffErr + d.toString()).slice(-4000);
  });
  ff.on("exit", (code) => {
    if (code !== 0 && activeStreams.has(key)) {
      log(`ffmpeg for @${channel.handle} exited ${code}: ${ffErr.slice(-500)}`);
    }
  });

  activeStreams.set(key, { channel, ffmpeg: ff, startedAt: new Date(), recordFile });

  const { error: liveErr } = await supabase
    .from("channels")
    .update({
      is_live: true,
      live_title: channel.live_title || `${channel.display_name} live`,
    })
    .eq("id", channel.id);
  if (liveErr) log("failed to mark live:", liveErr.message);
  log(`LIVE: @${channel.handle} (${streamPath})`);
});

nms.on("donePublish", async (_id, streamPath) => {
  const key = extractKey(streamPath);
  if (!key) return;
  const stream = activeStreams.get(key);
  if (!stream) return;
  activeStreams.delete(key);
  const { channel, ffmpeg: ff, recordFile, startedAt } = stream;

  log(`OFFLINE: @${channel.handle}`);
  await supabase.from("channels").update({ is_live: false }).eq("id", channel.id);

  // give ffmpeg a moment to flush, then stop it
  await new Promise((r) => setTimeout(r, 1500));
  ff.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 1500));
  if (!ff.killed) ff.kill("SIGKILL");

  // clean the live HLS dir
  fs.rmSync(path.join(liveDir, channel.id), { recursive: true, force: true });

  // keep the recording as a VOD via the regular upload pipeline
  try {
    const stat = fs.statSync(recordFile);
    if (stat.size < 100_000) {
      log(`recording too small, skipping VOD (${stat.size} bytes)`);
      fs.rmSync(recordFile, { force: true });
      return;
    }
    const videoId = crypto.randomUUID();
    const sourcePath = `${channel.id}/${videoId}/source.ts`;
    log(`uploading recording (${(stat.size / 1024 / 1024).toFixed(1)} MB) as VOD ${videoId}`);
    const { error: upErr } = await supabase.storage
      .from("uploads")
      .upload(sourcePath, fs.readFileSync(recordFile), {
        contentType: "video/mp2t",
      });
    if (upErr) throw new Error(upErr.message);

    const title =
      (await supabase.from("channels").select("live_title").eq("id", channel.id).single())
        .data?.live_title ||
      `Live stream — ${startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const { error: insErr } = await supabase.from("videos").insert({
      id: videoId,
      channel_id: channel.id,
      title,
      description: "Recording of a live stream.",
      status: "processing",
      visibility: "public",
      source_path: sourcePath,
      is_live_recording: true,
    });
    if (insErr) throw new Error(insErr.message);
    log(`recording queued for transcode as ${videoId}`);
    fs.rmSync(recordFile, { force: true });
  } catch (err) {
    log(`failed to save recording as VOD: ${err.message} (file kept at ${recordFile})`);
  }
});

nms.run();
log(`RTMP ingest on rtmp://localhost:${RTMP_PORT}/live (OBS: use stream key from Studio)`);

// safety: if the process dies, nothing marks channels offline — do it on boot
const { error: resetErr } = await supabase
  .from("channels")
  .update({ is_live: false })
  .eq("is_live", true);
if (resetErr) log("failed to reset live flags:", resetErr.message);
