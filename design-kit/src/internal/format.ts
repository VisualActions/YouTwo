// Internal formatting helpers shared by the display components.

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return String(n);
}

function trim(v: number) {
  return v.toFixed(1).replace(/\.0$/, "");
}

export function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "";
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0 ? `${h}:${mm}:${String(sec).padStart(2, "0")}` : `${mm}:${String(sec).padStart(2, "0")}`;
}

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

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
