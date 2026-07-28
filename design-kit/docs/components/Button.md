---
category: Primitives
---

# Button

The pill button used for every action in YouTwo. `primary` is the white call-to-action (Save, Upload, Subscribe), `secondary` the neutral gray pill (Cancel, Subscribed), `blue` the sign-in accent, `outline` the signed-out Sign in control, and the two danger variants handle destructive actions.

## Usage

```tsx
import { Button } from "@youtwo/ui-kit";

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="blue" size="lg" block>Sign in</Button>
<Button variant="ghost-danger">Delete video</Button>
```
