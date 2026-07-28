import { VerifiedBadge } from "@youtwo/ui-kit";

export function AfterChannelName() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 500 }}>
      YoStudios <VerifiedBadge />
    </div>
  );
}

export function OnAChannelHeading() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 30, fontWeight: 700 }}>
      Dev Channel <VerifiedBadge size={20} />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <VerifiedBadge size={13} />
      <VerifiedBadge size={15} />
      <VerifiedBadge size={20} />
      <VerifiedBadge size={28} />
    </div>
  );
}
