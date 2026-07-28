# YouTwo — screenshots

Captured from a live instance with `node worker/capture-previews.mjs <baseUrl>`.
Only demo content is shown.

## Web

| | |
|---|---|
| **Home feed** | ![Home](01-home.png) |
| **Watch page** — HLS playback, recommendations, likes, comments | ![Watch](02-watch.png) |
| **Channel page** — banner, avatar, verification, tabs | ![Channel](03-channel.png) |
| **Search** — titles, tags, and channels | ![Search](04-search.png) |
| **Sign in** | ![Login](05-login.png) |

## YouTwo Studio

| | |
|---|---|
| **Dashboard** | ![Dashboard](06-studio-dashboard.png) |
| **Content** — every upload with its processing state | ![Content](07-studio-content.png) |
| **Upload** | ![Upload](08-studio-upload.png) |
| **Analytics** | ![Analytics](09-studio-analytics.png) |
| **Stream settings** — RTMP ingest URL and stream key | ![Stream](10-studio-stream.png) |
| **Customization** — banner, avatar, handle, description | ![Customization](11-studio-customization.png) |
| **Admin** — grant and revoke verification | ![Admin](12-admin.png) |

## Mobile web

| | | |
|---|---|---|
| ![Mobile home](13-mobile-home.png) | ![Mobile watch](14-mobile-watch.png) | ![Mobile channel](15-mobile-channel.png) |

## Regenerating

```bash
# with the site running
PREVIEW_EMAIL=you@example.com PREVIEW_PASSWORD=... \
  node worker/capture-previews.mjs http://localhost:3000
```

The script signs in to capture the Studio and admin screens, and fails loudly
if the sign-in does not take, so a broken login can't quietly produce a folder
of identical login screenshots.
