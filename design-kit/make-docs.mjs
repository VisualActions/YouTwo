// Emits design-kit/docs/<Name>.md — the per-component reference the Claude Design
// agent reads as <Name>.prompt.md. Frontmatter `category` sets the component's group.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "docs", "components");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

/** @type {Array<[string, string, string, string]>} name, category, summary, example */
const DOCS = [
  // ---------- Primitives ----------
  ["Button", "Primitives",
    "The pill button used for every action in YouTwo. `primary` is the white call-to-action (Save, Upload, Subscribe), `secondary` the neutral gray pill (Cancel, Subscribed), `blue` the sign-in accent, `outline` the signed-out Sign in control, and the two danger variants handle destructive actions.",
    `<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="blue" size="lg" block>Sign in</Button>
<Button variant="ghost-danger">Delete video</Button>`],
  ["IconButton", "Primitives",
    "Icon-only button. \`round\` (default) is the 40px circular topbar action; \`boxed\` is the square gray button used beside copyable fields in Studio. \`label\` is required and becomes both aria-label and title.",
    `<IconButton icon={<SearchIcon />} label="Search" />
<IconButton shape="boxed" icon={<CopyIcon />} label="Copy stream key" />`],
  ["TextField", "Primitives",
    "Single-line input with optional label, hint, error, and a static prefix box. The prefix is how handle fields render the leading `@`. Passing `error` switches the border to the danger color and renders the message below.",
    `<TextField label="Title" defaultValue="My new upload" />
<TextField label="Handle" prefix="@" defaultValue="yostudios" error="That handle is already taken." />`],
  ["TextArea", "Primitives",
    "Multi-line input for video descriptions and channel bios. Defaults to 4 rows.",
    `<TextArea label="Description" rows={5} placeholder="Tell viewers about your video" />`],
  ["SelectField", "Primitives",
    "Dropdown for small enum choices — visibility is the canonical use.",
    `<SelectField
  label="Visibility"
  options={[
    { value: "public", label: "Public" },
    { value: "unlisted", label: "Unlisted" },
    { value: "private", label: "Private" },
  ]}
/>`],
  ["FileDropzone", "Primitives",
    "Dashed drop target for the Studio upload flow. Shows the prompt until a file is chosen, then the file name and size.",
    `<FileDropzone />
<FileDropzone fileName="devlog-07.mp4" fileSize="248.3 MB" />`],

  // ---------- Identity ----------
  ["ChannelAvatar", "Identity",
    "Circular channel avatar. When `src` is absent it renders a deterministic colored initial derived from `name`, so channel lists never show broken images. Standard sizes: 24 sidebar, 32 topbar, 36 video card, 40 comment, 48 live card, 128 channel header.",
    `<ChannelAvatar src={channel.avatarUrl} name="YoStudios" size={36} />
<ChannelAvatar name="Dev Channel" size={128} />`],
  ["VerifiedBadge", "Identity",
    "The gray check badge that follows the names of verified channels. Place it immediately after the name inside the same flex row; size 13-15 sits inline with body text, 20 with the channel header's 30px name.",
    `<span style={{ display: "flex", alignItems: "center", gap: 4 }}>
  YoStudios <VerifiedBadge />
</span>`],
  ["LiveBadge", "Identity",
    "Solid red uppercase LIVE pill. Used on thumbnails, the channel header, live cards, and the player's top-left corner.",
    `<LiveBadge />`],
  ["LiveDot", "Identity",
    "Small red dot marking a currently-live channel in the sidebar subscriptions list — the compact form of `LiveBadge`.",
    `<LiveDot />`],
  ["DurationBadge", "Identity",
    "Black runtime chip overlaid on the bottom-right of a thumbnail. Takes seconds and formats to m:ss or h:mm:ss.",
    `<DurationBadge seconds={847} />   {/* 14:07 */}
<DurationBadge seconds={4207} />  {/* 1:10:07 */}`],
  ["StatusBadge", "Identity",
    "Colored pill showing a video's transcode state in Studio: `processing` (yellow) while the worker builds the HLS ladder, `ready` (green) once it plays, `failed` (red).",
    `<StatusBadge status="processing" />
<StatusBadge status="ready" />`],

  // ---------- Video ----------
  ["VideoCard", "Video",
    "The standard grid video card: 16:9 thumbnail with runtime chip, channel avatar, two-line clamped title, and the views · age line. Set `hideChannel` on a channel's own Videos tab where the channel is already implied. A `video.isLive` summary swaps the duration chip for a LIVE badge.",
    `<VideoCard video={video} />
<VideoCard video={video} hideChannel />`],
  ["VideoGrid", "Video",
    "Responsive auto-filling grid of `VideoCard`s — the home feed and channel Videos tab layout. Columns reflow from 4 down to 1 with no props.",
    `<VideoGrid videos={videos} />`],
  ["VideoRow", "Video",
    "Horizontal search-result row: 256px thumbnail on the left, title, metadata, channel line, and a two-line description on the right. Stacks vertically under 640px.",
    `<VideoRow video={video} />`],
  ["RecommendedItem", "Video",
    "Compact 168px-thumbnail row for the watch page's recommendations column. Stack these in a flex column with a 12px gap.",
    `<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {recommended.map((v) => <RecommendedItem key={v.id} video={v} />)}
</div>`],
  ["LiveChannelCard", "Video",
    "Row card for the home page's \"Live now\" strip: avatar, channel name, current stream title, and a trailing LIVE badge.",
    `<LiveChannelCard channelName="YoStudios" streamTitle="Friday dev stream" verified />`],
  ["VideoPlayerFrame", "Video",
    "The 16:9 player surface — design-system chrome only. The shipping app mounts hls.js into a `<video>` with this same frame. Pass `placeholder` for processing or failed states, and `live` to show the LIVE badge.",
    `<VideoPlayerFrame posterUrl={video.thumbnailUrl} />
<VideoPlayerFrame live />
<VideoPlayerFrame placeholder="This video is still processing. Check back soon." />`],

  // ---------- Navigation ----------
  ["Brand", "Navigation",
    "The YouTwo lockup: red rounded play mark plus the tight-tracking wordmark. Use it in the topbar, mobile header, and auth card.",
    `<Brand />`],
  ["SearchBar", "Navigation",
    "The centered pill search field with its attached magnifier button. Wrap in a `<form action=\"/results\">` to make it submit.",
    `<form action="/results"><SearchBar /></form>`],
  ["Topbar", "Navigation",
    "Fixed 56px application header: hamburger, brand, centered search, and account actions. Pass `account` for the signed-in state (upload, notifications, avatar); omit it to render the blue outlined Sign in button.",
    `<Topbar account={{ name: "YoStudios", handle: "yostudios" }} notificationCount={12} />
<Topbar />`],
  ["AccountMenu", "Navigation",
    "Dropdown under the topbar avatar: identity header, then Your channel / YouTwo Studio / Admin / Sign out. `showAdmin` is gated on the account's admin flag.",
    `<AccountMenu name="YoStudios" handle="yostudios" showAdmin />`],
  ["Sidebar", "Navigation",
    "The 240px left navigation rail: primary destinations, then the subscriptions list with a red dot beside channels that are live. Hidden below the lg breakpoint in the web app, where `MobileBottomNav` takes over.",
    `<Sidebar
  active="home"
  subscriptions={[
    { handle: "devchannel", name: "Dev Channel", isLive: true },
    { handle: "kitcat", name: "KitCat", verified: true },
  ]}
/>`],
  ["FilterChips", "Navigation",
    "Horizontally scrolling category chips above the home feed. The active chip inverts to white-on-dark.",
    `<FilterChips chips={["All", "Gaming", "Music", "Live", "Tutorials"]} active="All" />`],
  ["MobileTopbar", "Navigation",
    "Compact header for the mobile app: brand left, search / notifications / avatar right. Pairs with `MobileBottomNav`.",
    `<MobileTopbar account={{ name: "YoStudios" }} />`],
  ["MobileBottomNav", "Navigation",
    "Fixed bottom tab bar for the mobile app — Home, Subscriptions, Upload, Library. Pin it to the bottom of the viewport and pad the scroll container by `--yt-mobile-nav-height`.",
    `<MobileBottomNav active="home" />`],

  // ---------- Channel ----------
  ["SubscribeButton", "Channel",
    "The subscribe toggle: white \"Subscribe\" pill when not subscribed, neutral gray \"Subscribed\" once the viewer subscribes. Drive it from server state and flip optimistically.",
    `<SubscribeButton subscribed={false} onToggle={toggle} />
<SubscribeButton subscribed />`],
  ["ChannelHeader", "Channel",
    "Channel page masthead: banner, 128px avatar, name with verification and live state, the @handle · subscribers · videos line, description, and the primary action. `isOwner` swaps Subscribe for Customize channel.",
    `<ChannelHeader
  name="YoStudios"
  handle="yostudios"
  subscriberCount={128000}
  videoCount={42}
  verified
  description="Building things and filming it."
/>`],
  ["ChannelTabs", "Channel",
    "Underlined tab bar under the channel masthead. Defaults to the product's four tabs: Videos, Live, Playlists, About.",
    `<ChannelTabs active="Videos" onSelect={setTab} />`],
  ["VerifyToggle", "Channel",
    "Admin-only control that grants or removes a channel's verification check. Blue when verified, neutral gray when not.",
    `<VerifyToggle verified={channel.verified} onToggle={toggle} />`],
  ["ChannelListItem", "Channel",
    "Channel result row used by search results and the admin channel list. Pass a trailing control via `action` — a `VerifyToggle` on the admin page.",
    `<ChannelListItem
  name="YoStudios"
  handle="yostudios"
  subscriberCount={128000}
  verified
  action={<VerifyToggle verified />}
/>`],

  // ---------- Engagement ----------
  ["LikeButtons", "Engagement",
    "The segmented like/dislike pill from the watch page. The active side turns blue and its icon fills. `rating` is 1 liked, -1 disliked, 0 none; `onRate` receives the next value (clicking the active side sends 0).",
    `<LikeButtons likeCount={1240} dislikeCount={24} rating={1} onRate={rate} />`],
  ["CommentItem", "Engagement",
    "A single comment: author line with @handle and relative time, body, and Reply / Delete actions. Build threads by passing rendered `CommentItem`s as `replies` — they render inside a left-bordered indent.",
    `<CommentItem
  handle="devchannel"
  authorName="Dev Channel"
  body="This is exactly what I needed."
  timeLabel="2 hours ago"
  replies={<CommentItem handle="yostudios" authorName="YoStudios" body="Thanks!" timeLabel="1 hour ago" canDelete />}
/>`],
  ["CommentComposer", "Engagement",
    "Underline-style comment input with its Cancel / Comment action row. Set `showActions` once the field is focused or has text; use `submitLabel=\"Reply\"` inside a thread.",
    `<CommentComposer showActions />
<CommentComposer submitLabel="Reply" placeholder="Add a reply..." showActions />`],
  ["LiveChat", "Engagement",
    "Realtime chat panel beside the live player: header, scrolling message list, and composer. In the app this is fed by Supabase realtime inserts. Pass `signedIn={false}` to render the disabled signed-out state.",
    `<LiveChat
  messages={[{ id: "1", senderName: "KitCat", body: "how is the latency this low" }]}
  height="calc(100vh - 8.5rem)"
/>`],

  // ---------- Studio ----------
  ["StatCard", "Studio",
    "Single metric tile for the Studio dashboard and analytics pages. Numeric `value`s are abbreviated (1.2K, 3.4M); `delta` + `trend` add a colored change line.",
    `<StatCard label="Subscribers" value={128000} delta="+12% vs last month" trend="up" />`],
  ["StatGrid", "Studio",
    "Responsive row of `StatCard`s — auto-fits from 3 columns down to 1.",
    `<StatGrid>
  <StatCard label="Subscribers" value={128000} />
  <StatCard label="Total views" value={2400000} />
  <StatCard label="Videos" value={42} />
</StatGrid>`],
  ["ViewsChart", "Studio",
    "Bar chart of daily views for Studio analytics. Pass one value per day, oldest first; bars scale to the series maximum.",
    `<ViewsChart data={dailyViews} startLabel="Jun 30" endLabel="Jul 27" />`],
  ["ContentTable", "Studio",
    "The Studio → Content table listing every upload with its thumbnail, processing state, visibility, and engagement counts. Scrolls horizontally below 640px.",
    `<ContentTable rows={videos} />`],
  ["StreamKeyPanel", "Studio",
    "Studio → Stream settings panel: RTMP ingest URL, the masked stream key with reveal and copy controls, and the regenerate action. Never render the key unmasked by default.",
    `<StreamKeyPanel ingestUrl="rtmp://localhost:1935/live" streamKey={key} revealed={false} />`],
  ["EmptyState", "Studio",
    "Centered empty-state block for feeds, channel tabs, and Studio tables with no rows. Pass an `action` to offer the obvious next step.",
    `<EmptyState
  title="Nothing here yet"
  body="Videos uploaded through YouTwo Studio will show up here once they finish processing."
  action={<Button>Upload video</Button>}
/>`],
];

for (const [name, category, summary, example] of DOCS) {
  const body = `---
category: ${category}
---

# ${name}

${summary}

## Usage

\`\`\`tsx
import { ${name} } from "@youtwo/ui-kit";

${example}
\`\`\`
`;
  fs.writeFileSync(path.join(outDir, `${name}.md`), body, "utf8");
}

console.log(`wrote ${DOCS.length} docs -> design-kit/docs/`);
