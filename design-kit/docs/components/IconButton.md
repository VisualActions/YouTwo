---
category: Primitives
---

# IconButton

Icon-only button. `round` (default) is the 40px circular topbar action; `boxed` is the square gray button used beside copyable fields in Studio. `label` is required and becomes both aria-label and title.

## Usage

```tsx
import { IconButton } from "@youtwo/ui-kit";

<IconButton icon={<SearchIcon />} label="Search" />
<IconButton shape="boxed" icon={<CopyIcon />} label="Copy stream key" />
```
