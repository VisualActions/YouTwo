---
category: Studio
---

# StreamKeyPanel

Studio → Stream settings panel: RTMP ingest URL, the masked stream key with reveal and copy controls, and the regenerate action. Never render the key unmasked by default.

## Usage

```tsx
import { StreamKeyPanel } from "@youtwo/ui-kit";

<StreamKeyPanel ingestUrl="rtmp://localhost:1935/live" streamKey={key} revealed={false} />
```
