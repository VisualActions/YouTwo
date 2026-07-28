---
category: Channel
---

# VerifyToggle

Admin-only control that grants or removes a channel's verification check. Blue when verified, neutral gray when not.

## Usage

```tsx
import { VerifyToggle } from "@youtwo/ui-kit";

<VerifyToggle verified={channel.verified} onToggle={toggle} />
```
