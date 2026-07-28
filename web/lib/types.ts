export type Channel = {
  id: string;
  handle: string;
  display_name: string;
  description: string;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  is_admin: boolean;
  subscriber_count: number;
  is_live: boolean;
  live_title: string | null;
  created_at: string;
};

export type Video = {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  tags: string[];
  status: "processing" | "ready" | "failed";
  visibility: "public" | "unlisted" | "private";
  source_path: string | null;
  playback_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  is_live_recording: boolean;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  created_at: string;
  published_at: string | null;
  channels?: Channel;
};

export type CommentRow = {
  id: string;
  video_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  channels?: Channel;
};

export type Playlist = {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  visibility: "public" | "unlisted" | "private";
  created_at: string;
};
