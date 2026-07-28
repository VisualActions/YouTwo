---
category: Primitives
---

# SelectField

Dropdown for small enum choices — visibility is the canonical use.

## Usage

```tsx
import { SelectField } from "@youtwo/ui-kit";

<SelectField
  label="Visibility"
  options={[
    { value: "public", label: "Public" },
    { value: "unlisted", label: "Unlisted" },
    { value: "private", label: "Private" },
  ]}
/>
```
