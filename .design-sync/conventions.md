# Building with the YouTwo UI Kit

YouTwo is a self-hosted video platform. This kit is its complete visual
language: feed, watch, channel, live, Studio, and mobile surfaces.

## No provider, no wrapper needed

Every component is a plain function of its props. There is no theme provider,
no context, and no client-side store — import a component and render it. All
styling comes from the stylesheet; nothing is injected at runtime.

```tsx
import { VideoCard, Topbar, Sidebar } from "@youtwo/ui-kit";
```

## The canvas is dark, and the system owns it

YouTwo is **dark only** — there is no light theme, and you should never build
one. The stylesheet sets the page surface itself:

```css
html body { background: var(--yt-bg); color: var(--yt-text); font-family: var(--yt-font); }
```

So a page needs no wrapper to look right. If you are rendering the system
inside a host that already owns `<body>`, put `class="yt-root"` on your
container instead — it applies the same background, color, and font locally.

Body text is Roboto, loaded by a remote `@import` at the top of the stylesheet.

## Styling idiom: `yt-` classes and `--yt-` tokens

Components carry their own `yt-`-prefixed classes; you do not need to style
them. For **your own layout glue around them**, use the CSS custom properties —
never hard-coded hex values, and never Tailwind or utility classes (there is no
utility layer in this system).

| Group | Tokens |
|---|---|
| Surfaces | `--yt-bg` `--yt-surface` `--yt-raised` `--yt-hover` `--yt-input` `--yt-border` |
| Text | `--yt-text` `--yt-text-secondary` `--yt-text-inverse` |
| Accent | `--yt-red` (brand + live) `--yt-blue` (links, account actions) `--yt-green` `--yt-yellow` `--yt-danger` |
| Type | `--yt-font` `--yt-text-xs` … `--yt-text-2xl` |
| Space | `--yt-space-1` (4px) … `--yt-space-6` (24px) |
| Radius | `--yt-radius-sm` `--yt-radius-md` `--yt-radius-lg` `--yt-radius-xl` `--yt-radius-pill` |
| Chrome | `--yt-topbar-height` (56px) `--yt-sidebar-width` (240px) `--yt-mobile-nav-height` |

```tsx
<section style={{ display: "grid", gap: "var(--yt-space-4)", padding: "var(--yt-space-6)" }}>
```

Every class and token is defined in `styles.css` and the `_ds_bundle.css` it
imports — read those before inventing a style. Per-component APIs are in each
`<Name>.d.ts`, and usage in `<Name>.prompt.md`.

## Composing a screen

`Topbar` and `Sidebar` are the web chrome; `MobileTopbar` and
`MobileBottomNav` are the mobile equivalents. Feeds are `VideoGrid`; the watch
page pairs `VideoPlayerFrame` with a column of `RecommendedItem`; the live page
swaps that column for `LiveChat`.

```tsx
<>
  <Topbar account={{ name: "YoStudios", handle: "yostudios" }} />
  <div style={{ display: "flex" }}>
    <Sidebar active="home" subscriptions={subs} />
    <main style={{ flex: 1, padding: "var(--yt-space-6)" }}>
      <FilterChips chips={["All", "Gaming", "Live"]} active="All" />
      <div style={{ marginTop: "var(--yt-space-6)" }}>
        <VideoGrid videos={videos} />
      </div>
    </main>
  </div>
</>
```

## Rules that make a screen read as YouTwo

- **One** white `Button variant="primary"` per screen. Everything else is
  `secondary`. `blue` is for account actions (sign in, submit a comment).
- `--yt-red` is reserved for the brand mark and live state. Destructive actions
  use `variant="danger"` or `"ghost-danger"`, never brand red.
- A verified channel shows `VerifiedBadge` after its name **everywhere** it
  appears — cards, search, comments, sidebar, channel header.
- A live channel is marked consistently: `LiveBadge` on players and cards,
  `LiveDot` in the sidebar list, the LIVE pill in `ChannelHeader`.
- Counts are abbreviated by the components (`128K`, `2.4M`) — pass raw numbers.
  Timestamps are pre-formatted relative strings you supply (`"3 days ago"`).
- Depth comes from stepping the surface stack, not from borders or shadows.
  Use `--yt-border` for hairlines only.

## Responsive and mobile

Components are fluid; only `--yt-sidebar-width` and `RecommendedItem`'s 168px
thumbnail are fixed. Hide `Sidebar` on narrow screens and use
`MobileBottomNav`; stack two-column layouts (watch + recommendations, live +
chat) with the secondary column below the player. Every other component is
reused unchanged between web and mobile.
