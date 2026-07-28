---
category: Identity
---

# ChannelAvatar

Circular channel avatar. When `src` is absent it renders a deterministic colored initial derived from `name`, so channel lists never show broken images. Standard sizes: 24 sidebar, 32 topbar, 36 video card, 40 comment, 48 live card, 128 channel header.

## Usage

```tsx
import { ChannelAvatar } from "@youtwo/ui-kit";

<ChannelAvatar src={channel.avatarUrl} name="YoStudios" size={36} />
<ChannelAvatar name="Dev Channel" size={128} />
```
