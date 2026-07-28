import { VideoGrid, type VideoSummary } from "@youtwo/ui-kit";

const VIDEOS: VideoSummary[] = [
  {
    id: "1",
    title: "Building a self-hosted YouTube clone with Next.js and Supabase",
    durationSeconds: 847,
    viewCount: 128000,
    publishedLabel: "3 days ago",
    channelName: "YoStudios",
    channelHandle: "yostudios",
    channelVerified: true,
  },
  {
    id: "2",
    title: "Every RTMP mistake I made so you don't have to",
    durationSeconds: 4207,
    viewCount: 32400,
    publishedLabel: "1 week ago",
    channelName: "Dev Channel",
    channelHandle: "devchannel",
  },
  {
    id: "3",
    title: "Low-latency HLS in under ten minutes",
    durationSeconds: 58,
    viewCount: 901,
    publishedLabel: "4 hours ago",
    channelName: "KitCat",
    channelHandle: "kitcat",
    channelVerified: true,
  },
  {
    id: "4",
    title: "Reading the ffmpeg docs so you never have to",
    durationSeconds: 1523,
    viewCount: 2400000,
    publishedLabel: "1 year ago",
    channelName: "Seqyr",
    channelHandle: "seqyr",
  },
];

export function HomeFeed() {
  return (
    <div style={{ width: 900 }}>
      <VideoGrid videos={VIDEOS} />
    </div>
  );
}

export function ChannelTab() {
  return (
    <div style={{ width: 900 }}>
      <VideoGrid videos={VIDEOS.slice(0, 3)} hideChannel />
    </div>
  );
}
