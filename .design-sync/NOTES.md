# design-sync notes — @youtwo/ui-kit

Repo-specific gotchas for future syncs. Read this before re-running.

## Where the design system lives

- The synced package is `design-kit/` — a **standalone presentational kit**, not
  the app. `web/components/*.tsx` are Next.js app components (several are server
  components reading cookies via `@/lib/supabase/server`) and are **not
  syncable**: they can't bundle for a browser runtime. `design-kit` is the
  props-only mirror of that visual language, plus mobile components the web app
  doesn't have yet (`MobileTopbar`, `MobileBottomNav`).
- Build: `cd design-kit && npm run build` (esbuild → `dist/index.js`, tsc →
  `dist/*.d.ts`, concatenated CSS → `dist/styles.css`). `cfg.buildCmd` runs it.
- `design-kit/docs/components/*.md` are **generated** by
  `design-kit/make-docs.mjs` from a hand-written table inside that script.
  Edit the table, re-run the script — never hand-edit the generated `.md` files.
  Frontmatter `category` in each doc sets the component's group in the pane.

## Fixes discovered during the first sync (2026-07-27)

- **Windows + Node 24: `spawnSync npx.cmd` fails with EINVAL.** `build.mjs`
  invokes tsc via `process.execPath` + `node_modules/typescript/bin/tsc`
  instead. Don't "simplify" it back to `npx tsc`.
- **The preview card template hard-codes `<style>body{background:#fff}</style>`
  after the stylesheet link.** A dark-only DS therefore renders light-on-white
  in every card. Fixed by claiming the canvas at higher specificity in
  `components.css`: `html body { background: var(--yt-bg); … }`. A plain `body`
  rule loses to the card's inline style. If cards ever go white again, this
  selector is the first thing to check.
- **Wide previews need `cardMode: "column"`.** Twelve components are flagged by
  `[GRID_OVERFLOW]` when their stories exceed a grid cell; they're all listed in
  `cfg.overrides`. Adding a new wide preview will flag again — apply the same
  override and do ONE targeted `preview-rebuild.mjs --components A,B,C`.
- **Playwright must be 1.58.0.** The machine's cached chromium is build **1208**,
  which 1.58.0 pins. Installing latest (1.62 → chromium 1234) fails with
  `browserType.launch: Executable doesn't exist`. Verify with
  `node_modules/playwright-core/browsers.json` before changing the version.
- **`guidelinesGlob` must exclude the component docs.** The default
  (`docs/*.md`) swept all 41 component docs into `guidelines/`. Component docs
  live in `docs/components/`, real guidelines in `docs/guides/`.

## Known render warns

- `[FONT_REMOTE] "Cascadia Code"` — expected. The stylesheet has a remote
  Google Fonts `@import` for Roboto; the monospace stack in `.yt-code` names
  Cascadia Code, which the host resolves at runtime. No action.
- `tokens/` ships empty and `styles.css` contains only
  `@import "./_ds_bundle.css"`. That's fine: `dist/styles.css` already
  concatenates tokens + components, so all 41 `--yt-*` tokens are defined inside
  `_ds_bundle.css` and reachable through the `styles.css` closure (validate
  confirms "tokens: 47 defined, 40 referenced").

## The app now consumes the kit (2026-07-27, after the first sync)

`web/` depends on `@youtwo/ui-kit` via `file:../design-kit`:

- `web/app/layout.tsx` imports `@youtwo/ui-kit/styles.css` **before** `globals.css`.
- `web/components/ChannelAvatar.tsx` and `StatusBadge.tsx` are now one-line
  re-exports of the kit components; `VerifiedBadge.tsx` is a thin adapter that
  forwards `className` (the app sizes it with Tailwind `h-4 w-4` utilities,
  which override the kit's width/height attributes).
- Consequence: **a CSS or prop change in `design-kit` now changes the shipping
  site**, not just the Design System pane. Run `cd web && npm run build` after
  any kit change, not only `package-validate.mjs`.
- The kit's `html body` canvas rule and Tailwind's preflight coexist fine; both
  set the same dark background and identical box-sizing.
- `design-kit/dist/` is gitignored, so a fresh clone must run
  `cd design-kit && npm run build` before `web` will build.

## Re-sync risks

- **`make-docs.mjs` is the source of truth for docs and groups.** Adding a
  component to `src/` without adding a row to that table gives it a synthesized
  `.prompt.md` and drops it into a default group. Add the row.
- **Preview fixtures are inlined**, not shared. Each
  `.design-sync/previews/<Name>.tsx` carries its own copy of the sample videos
  and channels. A prop rename on `VideoSummary` or `ContentRow` requires editing
  every preview that constructs one (VideoCard, VideoRow, VideoGrid,
  RecommendedItem, ContentTable). A shared `_fixtures.tsx` was deliberately NOT
  used — the converter compiles every file in `previews/` as a component
  preview, so a non-component file there would be treated as one.
- **20 components ship the floor card** (no authored preview): AccountMenu,
  Brand, ChannelAvatar, ChannelTabs, CommentComposer, FileDropzone, LikeButtons,
  MobileBottomNav, MobileTopbar, SearchBar, Sidebar, StatusBadge,
  StreamKeyPanel, SubscribeButton, TextArea, TextField, Topbar, VerifyToggle,
  VideoPlayerFrame, ViewsChart. These render the real component with synthesized
  props, which is honest but plain — the standing offer for incremental
  authoring on any future sync. The user scoped previews out on the first run;
  21 were authored anyway because their cards rendered blank, name-only, or with
  literal "undefined".
- **Remote font dependency.** Roboto is fetched from Google Fonts at render
  time. If designs must be fully offline, ship woff2 files under the package and
  wire `cfg.extraFonts` instead.
- The `web/` app and `design-kit/` can drift. They are intentionally separate;
  nothing enforces that a change to one is mirrored in the other.
