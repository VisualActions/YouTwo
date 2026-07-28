// Removes all youtwo.test.* accounts and their content (DB rows cascade;
// storage prefixes cleaned explicitly).
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(rootDir, ".env") });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: channels } = await admin
  .from("channels")
  .select("id, handle")
  .like("handle", "youtwo.test%");

for (const ch of channels ?? []) {
  const { data: videos } = await admin.from("videos").select("id, source_path").eq("channel_id", ch.id);
  for (const v of videos ?? []) {
    for (const bucket of ["hls", "thumbnails"]) {
      const { data: files } = await admin.storage.from(bucket).list(v.id, { limit: 1000 });
      const names = (files ?? []).filter((f) => f.id).map((f) => `${v.id}/${f.name}`);
      // hls has per-rendition subfolders
      for (const dir of (files ?? []).filter((f) => !f.id)) {
        const { data: sub } = await admin.storage.from(bucket).list(`${v.id}/${dir.name}`, { limit: 1000 });
        names.push(...(sub ?? []).map((f) => `${v.id}/${dir.name}/${f.name}`));
      }
      if (names.length) await admin.storage.from(bucket).remove(names);
    }
    if (v.source_path) await admin.storage.from("uploads").remove([v.source_path]);
  }
  const { error } = await admin.auth.admin.deleteUser(ch.id);
  console.log(`deleted @${ch.handle}${error ? " (ERROR: " + error.message + ")" : ""}`);
}

const { count } = await admin.from("channels").select("id", { count: "exact", head: true });
console.log(`remaining channels: ${count}`);
