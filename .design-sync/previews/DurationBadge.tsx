import { DurationBadge } from "@youtwo/ui-kit";

export function Lengths() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <DurationBadge seconds={58} />
      <DurationBadge seconds={847} />
      <DurationBadge seconds={4207} />
    </div>
  );
}

export function OverAThumbnail() {
  return (
    <div
      style={{
        position: "relative",
        width: 260,
        aspectRatio: "16 / 9",
        borderRadius: 12,
        background: "linear-gradient(135deg, #2a2a2a, #171717)",
      }}
    >
      <span style={{ position: "absolute", bottom: 6, right: 6 }}>
        <DurationBadge seconds={1523} />
      </span>
    </div>
  );
}
