import { LiveChat, type ChatMessage } from "@youtwo/ui-kit";

const MESSAGES: ChatMessage[] = [
  { id: "1", senderName: "Dev Channel", body: "yo this stream is clean" },
  { id: "2", senderName: "KitCat", body: "how did you get the latency this low??" },
  { id: "3", senderName: "YoStudios", body: "2s segments + the low-latency config in hls.js" },
  { id: "4", senderName: "Seqyr", body: "W" },
  { id: "5", senderName: "KitCat", body: "ok that's actually smart, stealing it" },
];

export function ActiveChat() {
  return (
    <div style={{ width: 400 }}>
      <LiveChat messages={MESSAGES} height={420} />
    </div>
  );
}

export function EmptyChat() {
  return (
    <div style={{ width: 400 }}>
      <LiveChat messages={[]} height={420} />
    </div>
  );
}

export function SignedOut() {
  return (
    <div style={{ width: 400 }}>
      <LiveChat messages={MESSAGES.slice(0, 3)} height={420} signedIn={false} />
    </div>
  );
}
