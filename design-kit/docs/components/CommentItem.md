---
category: Engagement
---

# CommentItem

A single comment: author line with @handle and relative time, body, and Reply / Delete actions. Build threads by passing rendered `CommentItem`s as `replies` — they render inside a left-bordered indent.

## Usage

```tsx
import { CommentItem } from "@youtwo/ui-kit";

<CommentItem
  handle="devchannel"
  authorName="Dev Channel"
  body="This is exactly what I needed."
  timeLabel="2 hours ago"
  replies={<CommentItem handle="yostudios" authorName="YoStudios" body="Thanks!" timeLabel="1 hour ago" canDelete />}
/>
```
