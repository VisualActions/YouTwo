---
category: Identity
---

# StatusBadge

Colored pill showing a video's transcode state in Studio: `processing` (yellow) while the worker builds the HLS ladder, `ready` (green) once it plays, `failed` (red).

## Usage

```tsx
import { StatusBadge } from "@youtwo/ui-kit";

<StatusBadge status="processing" />
<StatusBadge status="ready" />
```
