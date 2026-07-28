import { Button, EmptyState } from "@youtwo/ui-kit";

export function EmptyHomeFeed() {
  return (
    <div style={{ width: 640 }}>
      <EmptyState
        title="Nothing here yet"
        body="Videos uploaded through YouTwo Studio will show up here once they finish processing."
      />
    </div>
  );
}

export function WithAction() {
  return (
    <div style={{ width: 640 }}>
      <EmptyState
        title="No content yet"
        body="Upload your first video and it will appear here as soon as the worker finishes transcoding."
        action={<Button>Upload video</Button>}
      />
    </div>
  );
}

export function ChannelHasNoVideos() {
  return (
    <div style={{ width: 640 }}>
      <EmptyState title="This channel has no videos." />
    </div>
  );
}
