// Local test of the transcode pipeline (no Supabase needed).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { probe, transcodeToHls, makeThumbnail } from "./transcode.js";

const src = process.argv[2] ?? path.join(os.tmpdir(), "youtwo-testclip.mp4");
const outDir = path.join(os.tmpdir(), "youtwo-transcode-test");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const info = await probe(src);
console.log("probe:", info);

console.time("transcode");
await transcodeToHls(src, outDir, { hasAudio: info.hasAudio });
console.timeEnd("transcode");

await makeThumbnail(src, path.join(outDir, "thumb.jpg"), info.duration);

const files = fs
  .readdirSync(outDir, { recursive: true })
  .map(String)
  .sort();
console.log("output files:");
for (const f of files) console.log("  " + f);

const master = fs.readFileSync(path.join(outDir, "master.m3u8"), "utf8");
console.log("--- master.m3u8 ---");
console.log(master);

const ok =
  master.includes("1080p/index.m3u8") &&
  master.includes("720p/index.m3u8") &&
  master.includes("480p/index.m3u8") &&
  files.some((f) => f.endsWith(".ts")) &&
  files.includes("thumb.jpg");
console.log(ok ? "TEST PASSED" : "TEST FAILED");
process.exit(ok ? 0 : 1);
