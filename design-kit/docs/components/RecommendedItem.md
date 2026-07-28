---
category: Video
---

# RecommendedItem

Compact 168px-thumbnail row for the watch page's recommendations column. Stack these in a flex column with a 12px gap.

## Usage

```tsx
import { RecommendedItem } from "@youtwo/ui-kit";

<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {recommended.map((v) => <RecommendedItem key={v.id} video={v} />)}
</div>
```
