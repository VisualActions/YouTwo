# YouTwo

Self-hosted YouTube clone: Next.js 14 (App Router, TypeScript, Tailwind) + Supabase (auth, Postgres, storage), a local ffmpeg transcode worker, and an RTMP ingest server for live streaming.

```
YouTwo/
├─ web/      Next.js app (site + YouTwo Studio + admin)
├─ worker/   VOD pipeline: uploads -> HLS ladder (1080p/720p/480p) + thumbnail
├─ rtmp/     Live: RTMP ingest (port 1935) -> live HLS (port 8000) -> VOD recording
└─ .env      shared secrets for worker/ + rtmp/
```

## Prerequisites

- Node 18+
- `ffmpeg` and `ffprobe` on PATH (`ffmpeg -version` should work)
- OBS (or any RTMP encoder) if you want to stream

## Setup

1. **Install dependencies** (already done if Claude set this up):

   ```powershell
   cd web;    npm install
   cd worker; npm install
   cd rtmp;   npm install
   ```

2. **Secrets.** `web/.env.local` is already configured with the Supabase URL + anon key.
   Copy `.env.example` to `.env` in the repo root and paste your **service_role** key
   (Supabase Dashboard → Project Settings → API keys → `service_role`):

   ```
   SUPABASE_URL=https://mgmqvpilygkapngythkj.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

   Also paste the same key into `SUPABASE_SERVICE_ROLE_KEY=` in `web/.env.local`
   (used only server-side, for storage cleanup when you delete videos).

3. **Auth settings** (Supabase Dashboard → Authentication):
   - *Sign In / Up → Email*: for local dev, turn **off** "Confirm email" so accounts work instantly (the free tier's built-in mailer is heavily rate-limited).
   - *Google OAuth (optional)*: Providers → Google → enable, paste a Google OAuth Client ID/Secret. In Google Cloud Console, add the redirect URI `https://mgmqvpilygkapngythkj.supabase.co/auth/v1/callback`. Email+password works without any of this.

## Running (three terminals)

| What | Where | Command | Serves |
|---|---|---|---|
| Web app | `web/` | `npm run dev` | http://localhost:3000 |
| Transcode worker | `worker/` | `npm start` | (polls the DB) |
| RTMP server | `rtmp/` | `npm start` | rtmp://localhost:1935/live + http://localhost:8000/live |

Production web build: `cd web && npm run build && npm start`.

## First run

1. Open http://localhost:3000, **Sign in → Create account**.
2. Signing up with `rockstarplack@gmail.com` makes that account the **admin** — an Admin page appears (avatar menu → Admin) where you grant/remove verification checkmarks.
3. Every account automatically gets a channel (handle, avatar, banner, description — edit in **Studio → Customization**) and a persistent stream key.

## Uploading a video (VOD pipeline)

1. Studio → **Upload**: pick a file, set title/tags/visibility. The file goes to the private `uploads` bucket and a `videos` row is created with status `processing`.
2. The **worker** claims it, transcodes to a 3-rendition HLS ladder (1080p/720p/480p, 4s segments) + thumbnail, uploads everything to the public `hls`/`thumbnails` buckets, and flips status to `ready`.
3. The video appears on Home / channel / search; the watch page plays it with hls.js and has views, likes/dislikes, and threaded comments.

> Supabase free tier caps uploads at **50 MB per file** — keep test videos (and live streams you want recorded) under that, or raise the cap on a paid plan.

## Going live (OBS)

1. Studio → **Stream settings**: copy the ingest URL and your stream key (regenerate any time; optionally set a stream title).
2. OBS → Settings → Stream:
   - Service: **Custom...**
   - Server: `rtmp://localhost:1935/live`
   - Stream Key: *(paste from Studio)*
3. Start Streaming. The RTMP server validates your key against the DB, transcodes to low-latency HLS (720p, 2s segments), and marks your channel **Live** (badge on home + channel; watch at `/live/@yourhandle` with realtime chat via Supabase Realtime).
4. Stop Streaming. The recording is uploaded to the VOD pipeline and shows up under the channel's **Live** tab once the worker transcodes it.

## Discovery

- **Home**: live channels row, "From your subscriptions", and recent uploads.
- **Search** (top bar): matches video titles, tags, and channel names/handles.
- **Watch page**: recommended column ranks by shared tags + same channel, filled with recent uploads. All plain SQL.

## Architecture notes

- All tables have RLS; the browser only ever holds the anon key. Verification, stream-key regeneration, and view counting go through `security definer` RPCs; counters (subs/likes/comments/views) are trigger-maintained.
- Stream keys live in a separate `stream_keys` table readable only by the owner; the RTMP server checks keys with the service role.
- Live HLS is served from local disk (`rtmp/live-media/`) over http://localhost:8000 — it never touches storage, so latency stays low; recordings do go to storage as regular VODs (`is_live_recording = true`).
