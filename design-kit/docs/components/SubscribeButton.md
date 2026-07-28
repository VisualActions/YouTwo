---
category: Channel
---

# SubscribeButton

The subscribe toggle: white "Subscribe" pill when not subscribed, neutral gray "Subscribed" once the viewer subscribes. Drive it from server state and flip optimistically.

## Usage

```tsx
import { SubscribeButton } from "@youtwo/ui-kit";

<SubscribeButton subscribed={false} onToggle={toggle} />
<SubscribeButton subscribed />
```
