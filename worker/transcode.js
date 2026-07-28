import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import path from "node:path";

const ALL_RENDITIONS = [
  { name: "1080p", height: 1080, vBitrate: "5000k", maxrate: "5350k", bufsize: "7500k", aBitrate: "192k" },
  { name: "720p", height: 720, vBitrate: "2800k", maxrate: "2996k", bufsize: "4200k", aBitrate: "128k" },
  { name: "480p", height: 480, vBitrate: "1400k", maxrate: "1498k", bufsize: "2100k", aBitrate: "96k" },
];

// Every rendition is encoded in the same ffmpeg pass, so each one costs CPU.
// On a small single-core box, set HLS_RENDITIONS=720p,480p (or just 720p) to
// keep transcode times sane. Defaults to the full ladder.
const wanted = (process.env.HLS_RENDITIONS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const RENDITIONS = wanted.length
  ? ALL_RENDITIONS.filter((r) => wanted.includes(r.name))
  : ALL_RENDITIONS;

if (RENDITIONS.length === 0) {
  throw new Error(`HLS_RENDITIONS matched no known rendition (valid: ${ALL_RENDITIONS.map((r) => r.name).join(", ")})`);
}

export function probe(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) return reject(err);
      const video = data.streams.find((s) => s.codec_type === "video");
      const audio = data.streams.find((s) => s.codec_type === "audio");
      if (!video) return reject(new Error("File contains no video stream"));
      resolve({
        duration: Number(data.format?.duration ?? video.duration ?? 0),
        hasAudio: !!audio,
        width: video.width,
        height: video.height,
      });
    });
  });
}

/**
 * Transcodes `src` into a 3-rendition HLS ladder inside `outDir`:
 *   outDir/master.m3u8
 *   outDir/{1080p,720p,480p}/index.m3u8 + seg_*.ts
 */
export async function transcodeToHls(src, outDir, { hasAudio, onProgress } = {}) {
  for (const r of RENDITIONS) {
    fs.mkdirSync(path.join(outDir, r.name), { recursive: true });
  }
  // ffmpeg writes these paths verbatim into the playlists, so they must use
  // forward slashes even on Windows
  const outFwd = outDir.split(path.sep).join("/");

  const filters = [
    `[0:v]split=${RENDITIONS.length}${RENDITIONS.map((_, i) => `[v${i}]`).join("")}`,
    ...RENDITIONS.map((r, i) => `[v${i}]scale=-2:${r.height}[v${i}o]`),
  ].join(";");

  const options = ["-preset", "veryfast", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0"];
  RENDITIONS.forEach((r, i) => {
    options.push(
      "-map", `[v${i}o]`,
      `-c:v:${i}`, "libx264",
      `-b:v:${i}`, r.vBitrate,
      `-maxrate:v:${i}`, r.maxrate,
      `-bufsize:v:${i}`, r.bufsize
    );
  });
  if (hasAudio) {
    RENDITIONS.forEach((r, i) => {
      options.push("-map", "a:0", `-b:a:${i}`, r.aBitrate);
    });
    options.push("-c:a", "aac", "-ac", "2", "-ar", "48000");
  }
  options.push(
    "-var_stream_map",
    RENDITIONS.map((r, i) => (hasAudio ? `v:${i},a:${i},name:${r.name}` : `v:${i},name:${r.name}`)).join(" "),
    "-master_pl_name", "master.m3u8",
    "-f", "hls",
    "-hls_time", "4",
    "-hls_playlist_type", "vod",
    "-hls_segment_filename", `${outFwd}/%v/seg_%03d.ts`
  );

  await new Promise((resolve, reject) => {
    ffmpeg(src)
      .complexFilter(filters)
      .outputOptions(options)
      .output(`${outFwd}/%v/index.m3u8`)
      .on("progress", (p) => onProgress?.(p))
      .on("end", resolve)
      .on("error", (err, _stdout, stderr) =>
        reject(new Error(`ffmpeg failed: ${err.message}\n${(stderr || "").slice(-2000)}`))
      )
      .run();
  });
}

export async function makeThumbnail(src, outFile, duration) {
  const at = Math.min(Math.max(duration * 0.25, 1), Math.max(duration - 0.1, 0));
  await new Promise((resolve, reject) => {
    ffmpeg(src)
      .seekInput(at)
      .frames(1)
      .outputOptions(["-vf", "scale=1280:-2", "-q:v", "3"])
      .output(outFile)
      .on("end", resolve)
      .on("error", (err) => reject(new Error(`thumbnail failed: ${err.message}`)))
      .run();
  });
}
