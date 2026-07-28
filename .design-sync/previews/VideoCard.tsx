import { VideoCard, type VideoSummary } from "@youtwo/ui-kit";

const VIDEO: VideoSummary = {
  id: "1",
  title: "Building a self-hosted YouTube clone with Next.js and Supabase",
  durationSeconds: 847,
  viewCount: 128000,
  publishedLabel: "3 days ago",
  channelName: "YoStudios",
  channelHandle: "yostudios",
  channelVerified: true,
};

export function Default() {
  return (
    <div style={{ width: 300 }}>
      <VideoCard video={VIDEO} />
    </div>
  );
}

export function LongTitleClampsToTwoLines() {
  return (
    <div style={{ width: 300 }}>
      <VideoCard
        video={{
          ...VIDEO,
          title:
            "A deliberately long video title that runs past two lines so you can see exactly where the clamp lands",
          channelVerified: false,
          channelName: "Dev Channel",
        }}
      />
    </div>
  );
}

export function WithoutChannel() {
  return (
    <div style={{ width: 300 }}>
      <VideoCard video={VIDEO} hideChannel />
    </div>
  );
}

export function LiveVideo() {
  return (
    <div style={{ width: 300 }}>
      <VideoCard
        video={{
          ...VIDEO,
          title: "Friday dev stream — wiring up the RTMP server",
          durationSeconds: null,
          isLive: true,
          viewCount: 412,
          publishedLabel: "streaming now",
        }}
      />
    </div>
  );
}
