---
category: Video
---

# VideoCard

The standard grid video card: 16:9 thumbnail with runtime chip, channel avatar, two-line clamped title, and the views · age line. Set `hideChannel` on a channel's own Videos tab where the channel is already implied. A `video.isLive` summary swaps the duration chip for a LIVE badge.

## Usage

```tsx
import { VideoCard } from "@youtwo/ui-kit";

<VideoCard video={video} />
<VideoCard video={video} hideChannel />
```
