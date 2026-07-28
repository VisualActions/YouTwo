const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function hlsUrl(path: string) {
  return `${base}/storage/v1/object/public/hls/${path}`;
}

const liveBase =
  process.env.NEXT_PUBLIC_LIVE_HLS_BASE || "http://localhost:8000/live";

export function liveUrl(channelId: string) {
  return `${liveBase}/${channelId}/index.m3u8`;
}
