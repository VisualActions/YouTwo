---
category: Engagement
---

# LiveChat

Realtime chat panel beside the live player: header, scrolling message list, and composer. In the app this is fed by Supabase realtime inserts. Pass `signedIn={false}` to render the disabled signed-out state.

## Usage

```tsx
import { LiveChat } from "@youtwo/ui-kit";

<LiveChat
  messages={[{ id: "1", senderName: "KitCat", body: "how is the latency this low" }]}
  height="calc(100vh - 8.5rem)"
/>
```
