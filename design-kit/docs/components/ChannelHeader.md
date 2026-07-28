---
category: Channel
---

# ChannelHeader

Channel page masthead: banner, 128px avatar, name with verification and live state, the @handle · subscribers · videos line, description, and the primary action. `isOwner` swaps Subscribe for Customize channel.

## Usage

```tsx
import { ChannelHeader } from "@youtwo/ui-kit";

<ChannelHeader
  name="YoStudios"
  handle="yostudios"
  subscriberCount={128000}
  videoCount={42}
  verified
  description="Building things and filming it."
/>
```
