---
category: Engagement
---

# LikeButtons

The segmented like/dislike pill from the watch page. The active side turns blue and its icon fills. `rating` is 1 liked, -1 disliked, 0 none; `onRate` receives the next value (clicking the active side sends 0).

## Usage

```tsx
import { LikeButtons } from "@youtwo/ui-kit";

<LikeButtons likeCount={1240} dislikeCount={24} rating={1} onRate={rate} />
```
