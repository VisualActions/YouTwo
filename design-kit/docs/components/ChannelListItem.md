---
category: Channel
---

# ChannelListItem

Channel result row used by search results and the admin channel list. Pass a trailing control via `action` — a `VerifyToggle` on the admin page.

## Usage

```tsx
import { ChannelListItem } from "@youtwo/ui-kit";

<ChannelListItem
  name="YoStudios"
  handle="yostudios"
  subscriberCount={128000}
  verified
  action={<VerifyToggle verified />}
/>
```
