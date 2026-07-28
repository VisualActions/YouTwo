import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Values come from app.config / EXPO_PUBLIC_* env vars so the same build can
// point at a different YouTwo instance without a code change.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? "";
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // There is no URL to parse in a native app.
    detectSessionInUrl: false,
  },
});

/** Public URL of an HLS master playlist for a ready video. */
export function hlsUrl(playbackPath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/hls/${playbackPath}`;
}

export type Channel = {
  id: string;
  handle: string;
  display_name: string;
  description: string;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  subscriber_count: number;
  is_live: boolean;
  live_title: string | null;
};

export type Video = {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  tags: string[];
  status: "processing" | "ready" | "failed";
  playback_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  created_at: string;
  published_at: string | null;
  channels?: Channel;
};

/** Videos embed channels twice (author + raters), so the FK must be named. */
export const VIDEO_SELECT = "*, channels!videos_channel_id_fkey(*)";
