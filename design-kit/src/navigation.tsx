import type { ReactNode } from "react";
import { ChannelAvatar, LiveDot, VerifiedBadge } from "./identity.js";
import { cx } from "./internal/format.js";
import {
  BellIcon,
  HomeIcon,
  LibraryIcon,
  MenuIcon,
  SearchIcon,
  ShieldIcon,
  SignOutIcon,
  StudioIcon,
  SubscriptionsIcon,
  UploadIcon,
  UserIcon,
} from "./internal/icons.js";
import { IconButton } from "./primitives.js";

export interface BrandProps {
  /** Wordmark text. Defaults to "YouTwo". */
  label?: string;
  href?: string;
  className?: string;
}

/**
 * The YouTwo lockup: the red rounded mark carrying a white "2" (You-TWO),
 * followed by the tight-tracking wordmark.
 */
export function Brand({ label = "YouTwo", href = "/", className }: BrandProps) {
  return (
    <a className={cx("yt-brand", className)} href={href}>
      <span className="yt-brand__mark" aria-hidden>
        <span className="yt-brand__glyph">
          <svg viewBox="0 0 24 24">
            <path
              d="M6.5 9 A5.5 5.5 0 1 1 17.5 9 L6.5 19 H18"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className="yt-brand__word">{label}</span>
    </a>
  );
}

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  /** Name of the query field when used inside a GET form. */
  name?: string;
  className?: string;
}

/** The centered pill search field with its attached magnifier button. */
export function SearchBar({ placeholder = "Search", defaultValue, name = "search_query", className }: SearchBarProps) {
  return (
    <div className={cx("yt-search", className)} role="search">
      <input className="yt-search__input" name={name} placeholder={placeholder} defaultValue={defaultValue} />
      <button type="submit" className="yt-search__btn" aria-label="Search">
        <SearchIcon />
      </button>
    </div>
  );
}

export interface TopbarProps {
  /** Signed-in channel. Omit to render the "Sign in" state. */
  account?: { name: string; handle: string; avatarUrl?: string | null };
  /** Show the hamburger that collapses the sidebar. */
  showMenu?: boolean;
  /** Unread notification count shown on the bell. */
  notificationCount?: number;
  className?: string;
}

/**
 * Fixed 56px application header: brand, centered search, and the account
 * actions. Signed-out shows a blue outlined Sign in button instead.
 */
export function Topbar({ account, showMenu = true, notificationCount, className }: TopbarProps) {
  return (
    <header className={cx("yt-topbar", className)}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {showMenu && <IconButton icon={<MenuIcon />} label="Menu" />}
        <Brand />
      </div>
      <SearchBar />
      <div className="yt-topbar__actions">
        {account ? (
          <>
            <IconButton icon={<UploadIcon />} label="Upload video" />
            <span style={{ position: "relative", display: "inline-flex" }}>
              <IconButton icon={<BellIcon />} label="Notifications" />
              {notificationCount ? (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "var(--yt-red)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: "0 4px",
                    minWidth: 16,
                    textAlign: "center",
                  }}
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              ) : null}
            </span>
            <ChannelAvatar src={account.avatarUrl} name={account.name} size={32} />
          </>
        ) : (
          <a className="yt-btn yt-btn--outline" href="/login">
            <UserIcon size={18} />
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}

export interface AccountMenuProps {
  name: string;
  handle: string;
  avatarUrl?: string | null;
  /** Show the Admin entry — only for accounts with the admin flag. */
  showAdmin?: boolean;
  className?: string;
}

/** Dropdown under the topbar avatar: identity header plus account destinations. */
export function AccountMenu({ name, handle, avatarUrl, showAdmin, className }: AccountMenuProps) {
  return (
    <div className={cx("yt-menu", className)}>
      <div className="yt-menu__head">
        <ChannelAvatar src={avatarUrl} name={name} size={40} />
        <div style={{ minWidth: 0 }}>
          <div className="yt-menu__name">{name}</div>
          <div className="yt-menu__handle">@{handle}</div>
        </div>
      </div>
      <hr className="yt-menu__divider" />
      <a className="yt-menu__item" href={`/channel/@${handle}`}>
        <UserIcon />
        Your channel
      </a>
      <a className="yt-menu__item" href="/studio">
        <StudioIcon />
        YouTwo Studio
      </a>
      {showAdmin && (
        <a className="yt-menu__item" href="/admin">
          <ShieldIcon />
          Admin
        </a>
      )}
      <button className="yt-menu__item" type="button">
        <SignOutIcon />
        Sign out
      </button>
    </div>
  );
}

export interface SidebarSubscription {
  handle: string;
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  isLive?: boolean;
}

export interface SidebarProps {
  /** Which primary destination is current. */
  active?: "home" | "channel" | "studio" | "admin";
  /** Subscribed channels listed under the divider. */
  subscriptions?: SidebarSubscription[];
  /** Render the owner-only destinations (channel, studio). */
  signedIn?: boolean;
  showAdmin?: boolean;
  className?: string;
}

/**
 * The 240px left navigation rail: primary destinations, then the subscriptions
 * list with a red dot beside channels that are currently live.
 */
export function Sidebar({ active = "home", subscriptions = [], signedIn = true, showAdmin, className }: SidebarProps) {
  return (
    <nav className={cx("yt-sidebar", className)}>
      <a className={cx("yt-sidebar__item", active === "home" && "yt-sidebar__item--active")} href="/">
        <HomeIcon />
        Home
      </a>
      {signedIn && (
        <>
          <a className={cx("yt-sidebar__item", active === "channel" && "yt-sidebar__item--active")} href="/channel/me">
            <LibraryIcon />
            Your channel
          </a>
          <a className={cx("yt-sidebar__item", active === "studio" && "yt-sidebar__item--active")} href="/studio">
            <StudioIcon />
            Studio
          </a>
          {showAdmin && (
            <a className={cx("yt-sidebar__item", active === "admin" && "yt-sidebar__item--active")} href="/admin">
              <ShieldIcon />
              Admin
            </a>
          )}
        </>
      )}
      {subscriptions.length > 0 && (
        <>
          <hr className="yt-sidebar__divider" />
          <h3 className="yt-sidebar__heading">Subscriptions</h3>
          {subscriptions.map((s) => (
            <a key={s.handle} className="yt-sidebar__sub" href={`/channel/@${s.handle}`}>
              <ChannelAvatar src={s.avatarUrl} name={s.name} size={24} />
              <span className="yt-sidebar__sub-name">
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                {s.verified && <VerifiedBadge size={13} />}
              </span>
              {s.isLive && (
                <span className="yt-sidebar__sub-live">
                  <LiveDot />
                </span>
              )}
            </a>
          ))}
        </>
      )}
    </nav>
  );
}

export interface FilterChipsProps {
  /** Chip labels, in display order. */
  chips: string[];
  /** Which chip is selected — renders white/inverted. */
  active?: string;
  onSelect?: (chip: string) => void;
  className?: string;
}

/** Horizontally scrolling category chips above the home feed. */
export function FilterChips({ chips, active, onSelect, className }: FilterChipsProps) {
  return (
    <div className={cx("yt-chips", className)}>
      {chips.map((c) => (
        <button
          key={c}
          type="button"
          className={cx("yt-chip", c === active && "yt-chip--active")}
          onClick={() => onSelect?.(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export interface MobileTopbarProps {
  /** Signed-in channel; omit for the signed-out state. */
  account?: { name: string; avatarUrl?: string | null };
  className?: string;
}

/**
 * Compact header for the mobile app: brand on the left, search and account on
 * the right. Pairs with `MobileBottomNav`.
 */
export function MobileTopbar({ account, className }: MobileTopbarProps) {
  return (
    <header className={cx("yt-mobile-topbar", className)}>
      <Brand />
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <IconButton icon={<SearchIcon />} label="Search" />
        <IconButton icon={<BellIcon />} label="Notifications" />
        {account ? (
          <ChannelAvatar src={account.avatarUrl} name={account.name} size={28} />
        ) : (
          <a className="yt-btn yt-btn--outline yt-btn--sm" href="/login">
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}

export type MobileNavKey = "home" | "subscriptions" | "upload" | "library";

export interface MobileBottomNavProps {
  /** Which tab is current. */
  active?: MobileNavKey;
  onSelect?: (key: MobileNavKey) => void;
  className?: string;
}

/**
 * Fixed bottom tab bar for the mobile app — Home, Subscriptions, a centered
 * Upload action, and Library.
 */
export function MobileBottomNav({ active = "home", onSelect, className }: MobileBottomNavProps) {
  const items: Array<{ key: MobileNavKey; label: string; icon: ReactNode }> = [
    { key: "home", label: "Home", icon: <HomeIcon size={22} /> },
    { key: "subscriptions", label: "Subscriptions", icon: <SubscriptionsIcon size={22} /> },
    { key: "upload", label: "Upload", icon: <UploadIcon size={22} /> },
    { key: "library", label: "Library", icon: <LibraryIcon size={22} /> },
  ];
  return (
    <nav className={cx("yt-mobile-nav", className)}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          className={cx("yt-mobile-nav__item", it.key === active && "yt-mobile-nav__item--active")}
          onClick={() => onSelect?.(it.key)}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </nav>
  );
}
