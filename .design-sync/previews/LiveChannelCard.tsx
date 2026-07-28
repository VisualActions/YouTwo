import { LiveChannelCard } from "@youtwo/ui-kit";

export function LiveNowRow() {
  return (
    <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 12 }}>
      <LiveChannelCard channelName="YoStudios" streamTitle="Friday dev stream — building the app" verified />
      <LiveChannelCard channelName="Dev Channel" streamTitle="Debugging the transcode worker live" />
      <LiveChannelCard channelName="KitCat" streamTitle="Late night code + lofi" verified />
    </div>
  );
}

export function SingleCard() {
  return (
    <div style={{ width: 420 }}>
      <LiveChannelCard channelName="Seqyr" streamTitle="Shipping the mobile app" />
    </div>
  );
}
