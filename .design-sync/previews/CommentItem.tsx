import { CommentItem } from "@youtwo/ui-kit";

export function SingleComment() {
  return (
    <div style={{ width: 560 }}>
      <CommentItem
        handle="devchannel"
        authorName="Dev Channel"
        body="This is exactly what I needed, the HLS ladder part especially. Subscribed."
        timeLabel="2 hours ago"
      />
    </div>
  );
}

export function ThreadWithReply() {
  return (
    <div style={{ width: 560 }}>
      <CommentItem
        handle="kitcat"
        authorName="KitCat"
        verified
        body="How are you getting the latency this low? Mine sits around 12 seconds."
        timeLabel="1 day ago"
        replies={
          <CommentItem
            handle="yostudios"
            authorName="YoStudios"
            body="2 second segments plus the low-latency config in hls.js. Writeup coming next week."
            timeLabel="22 hours ago"
            canDelete
          />
        }
      />
    </div>
  );
}

export function OwnComment() {
  return (
    <div style={{ width: 560 }}>
      <CommentItem
        handle="yostudios"
        authorName="YoStudios"
        verified
        body="Pinning this — the worker script is in the repo under worker/."
        timeLabel="3 days ago"
        canDelete
      />
    </div>
  );
}
