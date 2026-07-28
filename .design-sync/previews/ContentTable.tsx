import { ContentTable, type ContentRow } from "@youtwo/ui-kit";

const ROWS: ContentRow[] = [
  {
    id: "1",
    title: "Building a self-hosted YouTube clone with Next.js and Supabase",
    status: "ready",
    visibility: "public",
    dateLabel: "3 days ago",
    views: 128000,
    likes: 9400,
    comments: 1280,
  },
  {
    id: "2",
    title: "Friday dev stream — wiring up the RTMP server",
    status: "processing",
    visibility: "public",
    dateLabel: "12 minutes ago",
    views: 0,
    likes: 0,
    comments: 0,
  },
  {
    id: "3",
    title: "Scrapped intro take (do not publish)",
    status: "failed",
    visibility: "private",
    dateLabel: "2 weeks ago",
    views: 0,
    likes: 0,
    comments: 0,
  },
  {
    id: "4",
    title: "Low-latency HLS in under ten minutes",
    status: "ready",
    visibility: "unlisted",
    dateLabel: "1 month ago",
    views: 32400,
    likes: 2100,
    comments: 184,
  },
];

export function StudioContent() {
  return (
    <div style={{ width: 900 }}>
      <ContentTable rows={ROWS} />
    </div>
  );
}
