import { LiveBadge } from "@youtwo/ui-kit";

export function Default() {
  return <LiveBadge />;
}

export function OnAPlayer() {
  return (
    <div
      style={{
        position: "relative",
        width: 320,
        aspectRatio: "16 / 9",
        borderRadius: 12,
        background: "#000",
      }}
    >
      <span style={{ position: "absolute", top: 12, left: 12 }}>
        <LiveBadge />
      </span>
    </div>
  );
}

export function CustomLabel() {
  return <LiveBadge>Premiere</LiveBadge>;
}
