import { VideoRow, type VideoSummary } from "@youtwo/ui-kit";

const VIDEO: VideoSummary = {
  id: "1",
  title: "Building a self-hosted YouTube clone with Next.js and Supabase",
  durationSeconds: 847,
  viewCount: 128000,
  publishedLabel: "3 days ago",
  channelName: "YoStudios",
  channelHandle: "yostudios",
  channelVerified: true,
  description:
    "Full walkthrough of the upload pipeline, the ffmpeg HLS ladder, and the live RTMP stack.",
};

export function SearchResult() {
  return (
    <div style={{ width: 720 }}>
      <VideoRow video={VIDEO} />
    </div>
  );
}

export function WithoutDescription() {
  return (
    <div style={{ width: 720 }}>
      <VideoRow
        video={{
          ...VIDEO,
          title: "Every RTMP mistake I made so you don't have to",
          description: undefined,
          channelName: "Dev Channel",
          channelVerified: false,
          durationSeconds: 4207,
          viewCount: 32400,
          publishedLabel: "1 week ago",
        }}
      />
    </div>
  );
}
