"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Counts a view after 3 seconds on the page (throttled server-side per user).
export default function ViewTracker({ videoId }: { videoId: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const supabase = createClient();
      supabase.rpc("record_view", { target_video: videoId }).then(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [videoId]);

  return null;
}
