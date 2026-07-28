---
category: Video
---

# VideoPlayerFrame

The 16:9 player surface — design-system chrome only. The shipping app mounts hls.js into a `<video>` with this same frame. Pass `placeholder` for processing or failed states, and `live` to show the LIVE badge.

## Usage

```tsx
import { VideoPlayerFrame } from "@youtwo/ui-kit";

<VideoPlayerFrame posterUrl={video.thumbnailUrl} />
<VideoPlayerFrame live />
<VideoPlayerFrame placeholder="This video is still processing. Check back soon." />
```
