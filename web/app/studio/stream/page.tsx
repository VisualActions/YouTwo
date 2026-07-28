import { createClient } from "@/lib/supabase/server";
import StreamKeyPanel from "./StreamKeyPanel";
import LiveTitleForm from "./LiveTitleForm";

export const dynamic = "force-dynamic";

export default async function StreamSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: keyRow }, { data: channel }] = await Promise.all([
    supabase.from("stream_keys").select("key").eq("channel_id", user.id).single(),
    supabase.from("channels").select("live_title, handle").eq("id", user.id).single(),
  ]);

  const rtmpUrl = process.env.NEXT_PUBLIC_RTMP_URL || "rtmp://localhost:1935/live";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Stream settings</h1>
      <p className="mt-1 text-sm text-yt-sub">
        Go live by pointing OBS (or any RTMP encoder) at YouTwo.
      </p>

      <StreamKeyPanel rtmpUrl={rtmpUrl} streamKey={keyRow?.key ?? ""} />

      <LiveTitleForm initialTitle={channel?.live_title ?? ""} />

      <div className="mt-8 rounded-xl border border-yt-border p-5 text-sm leading-6">
        <h2 className="mb-2 font-medium">OBS setup</h2>
        <ol className="list-inside list-decimal text-yt-sub">
          <li>Open OBS → Settings → Stream</li>
          <li>
            Service: <span className="text-yt-text">Custom...</span>
          </li>
          <li>
            Server: <code className="rounded bg-yt-raised px-1.5 py-0.5 text-yt-text">{rtmpUrl}</code>
          </li>
          <li>Stream Key: paste the key above</li>
          <li>Click Start Streaming — your channel goes live automatically</li>
        </ol>
      </div>
    </div>
  );
}
