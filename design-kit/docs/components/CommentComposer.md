---
category: Engagement
---

# CommentComposer

Underline-style comment input with its Cancel / Comment action row. Set `showActions` once the field is focused or has text; use `submitLabel="Reply"` inside a thread.

## Usage

```tsx
import { CommentComposer } from "@youtwo/ui-kit";

<CommentComposer showActions />
<CommentComposer submitLabel="Reply" placeholder="Add a reply..." showActions />
```
