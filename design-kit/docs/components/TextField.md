---
category: Primitives
---

# TextField

Single-line input with optional label, hint, error, and a static prefix box. The prefix is how handle fields render the leading `@`. Passing `error` switches the border to the danger color and renders the message below.

## Usage

```tsx
import { TextField } from "@youtwo/ui-kit";

<TextField label="Title" defaultValue="My new upload" />
<TextField label="Handle" prefix="@" defaultValue="yostudios" error="That handle is already taken." />
```
