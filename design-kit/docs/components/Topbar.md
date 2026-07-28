---
category: Navigation
---

# Topbar

Fixed 56px application header: hamburger, brand, centered search, and account actions. Pass `account` for the signed-in state (upload, notifications, avatar); omit it to render the blue outlined Sign in button.

## Usage

```tsx
import { Topbar } from "@youtwo/ui-kit";

<Topbar account={{ name: "YoStudios", handle: "yostudios" }} notificationCount={12} />
<Topbar />
```
