import { ChannelAvatar, LiveDot } from "@youtwo/ui-kit";

export function InASubscriptionRow() {
  return (
    <div style={{ width: 240 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 12px", borderRadius: 8 }}>
        <ChannelAvatar name="Dev Channel" size={24} />
        <span style={{ fontSize: 14 }}>Dev Channel</span>
        <span style={{ marginLeft: "auto" }}>
          <LiveDot />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 12px", borderRadius: 8 }}>
        <ChannelAvatar name="KitCat" size={24} />
        <span style={{ fontSize: 14 }}>KitCat</span>
      </div>
    </div>
  );
}

export function Alone() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
      <LiveDot /> streaming now
    </div>
  );
}
