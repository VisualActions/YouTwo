import { ChannelHeader } from "@youtwo/ui-kit";

export function VerifiedChannel() {
  return (
    <div style={{ width: 860 }}>
      <ChannelHeader
        name="YoStudios"
        handle="yostudios"
        subscriberCount={128000}
        videoCount={42}
        verified
        description="Building things and filming it. New uploads every week."
      />
    </div>
  );
}

export function LiveAndSubscribed() {
  return (
    <div style={{ width: 860 }}>
      <ChannelHeader
        name="Dev Channel"
        handle="devchannel"
        subscriberCount={9400}
        videoCount={17}
        isLive
        subscribed
        description="Streaming most Fridays."
      />
    </div>
  );
}

export function OwnerView() {
  return (
    <div style={{ width: 860 }}>
      <ChannelHeader
        name="KitCat"
        handle="kitcat"
        subscriberCount={312}
        videoCount={4}
        isOwner
        description="Lofi and late night code."
      />
    </div>
  );
}
