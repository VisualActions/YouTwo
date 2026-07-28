// YouTwo design tokens, mirrored from @youtwo/ui-kit's tokens.css.
// The web kit is DOM-based so it can't be imported here, but the values are
// the same so both platforms look like one product.
export const colors = {
  bg: "#0f0f0f",
  surface: "#212121",
  raised: "#272727",
  hover: "#3f3f3f",
  input: "#121212",
  border: "#303030",
  text: "#f1f1f1",
  textSecondary: "#aaaaaa",
  textInverse: "#0f0f0f",
  red: "#ff0033",
  blue: "#3ea6ff",
  green: "#4ade80",
  yellow: "#facc15",
  danger: "#f87171",
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const type = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
} as const;

const AVATAR_COLORS = [
  "#7c4dff", "#e91e63", "#009688", "#3f51b5", "#f4511e",
  "#00897b", "#5e35b1", "#c2185b", "#00acc1", "#8e24aa",
];

export function avatarColor(seed: string): string {
  const key = seed || "?";
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatDuration(totalSeconds?: number | null): string {
  if (totalSeconds == null || !isFinite(totalSeconds)) return "";
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0
    ? `${h}:${mm}:${String(sec).padStart(2, "0")}`
    : `${mm}:${String(sec).padStart(2, "0")}`;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [31536000, "year"], [2592000, "month"], [604800, "week"],
    [86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"],
  ];
  for (const [secs, name] of units) {
    const v = Math.floor(seconds / secs);
    if (v >= 1) return `${v} ${name}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
