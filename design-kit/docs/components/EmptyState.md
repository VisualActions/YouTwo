---
category: Studio
---

# EmptyState

Centered empty-state block for feeds, channel tabs, and Studio tables with no rows. Pass an `action` to offer the obvious next step.

## Usage

```tsx
import { EmptyState } from "@youtwo/ui-kit";

<EmptyState
  title="Nothing here yet"
  body="Videos uploaded through YouTwo Studio will show up here once they finish processing."
  action={<Button>Upload video</Button>}
/>
```
