// Seeds a fake user upload exactly like the Studio upload page does,
// so the worker can be tested end-to-end.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: channels } = await supabase.from("channels").select("id, handle").limit(1);
if (!channels?.length) {
  console.error("no channel found");
  process.exit(1);
}
const channel = channels[0];
const videoId = crypto.randomUUID();
const src = process.argv[2] ?? path.join(os.tmpdir(), "youtwo-testclip.mp4");
const sourcePath = `${channel.id}/${videoId}/source.mp4`;

const { error: upErr } = await supabase.storage
  .from("uploads")
  .upload(sourcePath, fs.readFileSync(src), { contentType: "video/mp4" });
if (upErr) {
  console.error("upload failed:", upErr.message);
  process.exit(1);
}

const { error: insErr } = await supabase.from("videos").insert({
  id: videoId,
  channel_id: channel.id,
  title: "Worker e2e test video",
  description: "Uploaded by the automated end-to-end test.",
  tags: ["test", "pipeline"],
  visibility: "public",
  status: "processing",
  source_path: sourcePath,
});
if (insErr) {
  console.error("insert failed:", insErr.message);
  process.exit(1);
}
console.log("seeded video", videoId, "for @" + channel.handle);
