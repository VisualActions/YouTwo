import { ChannelListItem, VerifyToggle } from "@youtwo/ui-kit";

export function SearchResults() {
  return (
    <div style={{ width: 720 }}>
      <ChannelListItem
        name="YoStudios"
        handle="yostudios"
        subscriberCount={128000}
        verified
        description="Building things and filming it. New uploads every week."
      />
      <ChannelListItem
        name="Dev Channel"
        handle="devchannel"
        subscriberCount={9400}
        isLive
        description="Streaming most Fridays."
      />
    </div>
  );
}

export function AdminListWithVerifyToggle() {
  return (
    <div style={{ width: 720 }}>
      <ChannelListItem
        name="YoStudios"
        handle="yostudios"
        subscriberCount={128000}
        verified
        action={<VerifyToggle verified />}
      />
      <ChannelListItem name="KitCat" handle="kitcat" subscriberCount={312} action={<VerifyToggle />} />
    </div>
  );
}
