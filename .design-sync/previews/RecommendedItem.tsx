import { RecommendedItem, type VideoSummary } from "@youtwo/ui-kit";

const VIDEOS: VideoSummary[] = [
  {
    id: "1",
    title: "Every RTMP mistake I made so you don't have to",
    durationSeconds: 4207,
    viewCount: 32400,
    publishedLabel: "1 week ago",
    channelName: "Dev Channel",
    channelHandle: "devchannel",
  },
  {
    id: "2",
    title: "Low-latency HLS in under ten minutes",
    durationSeconds: 58,
    viewCount: 901,
    publishedLabel: "4 hours ago",
    channelName: "KitCat",
    channelHandle: "kitcat",
    channelVerified: true,
  },
  {
    id: "3",
    title: "Reading the ffmpeg docs so you never have to",
    durationSeconds: 1523,
    viewCount: 2400000,
    publishedLabel: "1 year ago",
    channelName: "Seqyr",
    channelHandle: "seqyr",
  },
];

export function RecommendationsColumn() {
  return (
    <div style={{ width: 400, display: "flex", flexDirection: "column", gap: 12 }}>
      {VIDEOS.map((v) => (
        <RecommendedItem key={v.id} video={v} />
      ))}
    </div>
  );
}

export function SingleItem() {
  return (
    <div style={{ width: 400 }}>
      <RecommendedItem video={VIDEOS[0]} />
    </div>
  );
}
