---
category: Navigation
---

# Sidebar

The 240px left navigation rail: primary destinations, then the subscriptions list with a red dot beside channels that are live. Hidden below the lg breakpoint in the web app, where `MobileBottomNav` takes over.

## Usage

```tsx
import { Sidebar } from "@youtwo/ui-kit";

<Sidebar
  active="home"
  subscriptions={[
    { handle: "devchannel", name: "Dev Channel", isLive: true },
    { handle: "kitcat", name: "KitCat", verified: true },
  ]}
/>
```
