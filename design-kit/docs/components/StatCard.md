---
category: Studio
---

# StatCard

Single metric tile for the Studio dashboard and analytics pages. Numeric `value`s are abbreviated (1.2K, 3.4M); `delta` + `trend` add a colored change line.

## Usage

```tsx
import { StatCard } from "@youtwo/ui-kit";

<StatCard label="Subscribers" value={128000} delta="+12% vs last month" trend="up" />
```
