# YouTwo design principles

YouTwo is a self-hosted video platform. Its interface deliberately mirrors the
conventions viewers already know from mainstream video sites, so screens should
feel familiar before they feel novel.

## Dark only

There is no light theme. Every surface is drawn from the dark stack, and
contrast comes from stepping up that stack rather than from borders:

| Layer | Token | Used for |
|---|---|---|
| Page | `--yt-bg` `#0f0f0f` | The app background, topbar, sidebar |
| Surface | `--yt-surface` `#212121` | Cards sitting on the page (live cards, description box) |
| Raised | `--yt-raised` `#272727` | Controls and menus on top of surfaces |
| Hover | `--yt-hover` `#3f3f3f` | Hover state for anything raised |

Use `--yt-border` `#303030` for hairlines (table rows, tab underlines, panel
outlines) — never a lighter fill to imply separation.

## Content first

Thumbnails and video titles are the loudest things on any feed screen. Chrome
recedes: secondary metadata is `--yt-text-secondary`, controls are neutral gray
until they are the page's single primary action.

- One white `primary` button per screen at most.
- Blue (`--yt-blue`) means account or link action — sign in, submit a comment.
- Red (`--yt-red`) is reserved for the brand mark and live state. Never use it
  for a generic destructive action; that is `danger`/`ghost-danger`.

## Density

Feed grids use a 16px column gap and a 24px row gap so titles group with their
own thumbnail rather than the row below. Titles clamp to two lines; channel
names and stream titles truncate with an ellipsis rather than wrapping.

## Live state

A channel that is broadcasting is marked three ways, and all three should agree:
a `LiveBadge` on the player and cards, a `LiveDot` in the sidebar subscription
list, and the LIVE pill beside the channel name in `ChannelHeader`.

## Verification

The gray `VerifiedBadge` follows a channel's display name everywhere it appears
— feed cards, search results, comments, the channel header, the sidebar. It is
granted by an admin and never inferred from subscriber count.

## Responsive and mobile

Every component is fluid; none set a fixed pixel width except the deliberate
rails (`--yt-sidebar-width` 240px, `RecommendedItem`'s 168px thumbnail).

- Below the large breakpoint the web app hides `Sidebar`.
- The mobile app uses `MobileTopbar` plus `MobileBottomNav` (Home,
  Subscriptions, Upload, Library) instead of the rail, and reuses every other
  component unchanged.
- Two-column layouts (watch page + recommendations, live + chat) stack to one
  column, with the secondary column moving below the player.

## Writing

Sentence case everywhere except the LIVE badge and status pills. Counts are
abbreviated (`1.2K`, `3.4M`); timestamps are relative (`3 days ago`). Empty
states name the thing that is missing and the action that fixes it.
