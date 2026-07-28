"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  poster?: string | null;
  live?: boolean;
  autoPlay?: boolean;
};

export default function VideoPlayer({ src, poster, live = false, autoPlay = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls(
        live
          ? {
              lowLatencyMode: true,
              liveSyncDurationCount: 2,
              liveMaxLatencyDurationCount: 6,
              maxLiveSyncPlaybackRate: 1.5,
              backBufferLength: 30,
            }
          : { backBufferLength: 90 }
      );
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // for live streams the playlist may briefly 404 between segments
            setTimeout(() => hls.startLoad(), 2000);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
        }
      });
      return () => hls.destroy();
    }
  }, [src, live]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      autoPlay={autoPlay}
      poster={poster ?? undefined}
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}
