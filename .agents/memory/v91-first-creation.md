---
name: V91 First Creation Experience
description: firstCreationExperience.js — 4-step wizard + Genesis animation khi user chưa có thế giới, hook vào puosRenderMyUniverse
---

# V91 First Creation Experience

## Rule
Hook vào `puosRenderMyUniverse` bằng `_orig` pattern. Wizard chỉ hiện khi `!window.world || !window.world.name`.

**Why:** Không modify puosMyUniverse.js (PROJECT PROTECTION). Overlay approach (z-index 2147483647) đảm bảo wizard phủ lên trên PUOS panel mà không cần thay đổi file cũ.

**How to apply:** Mọi "first-time experience" trong PUOS đều dùng pattern này — wrap hàm render hiện có, check state, show overlay nếu cần.

## Key Details
- File: `firstCreationExperience.js`
- Init: 24100ms (100ms sau PUOS Shell 24000ms)
- SAVE key: `cgv6_first_creation_v91`
- Hook: `var _orig = window.puosRenderMyUniverse; window.puosRenderMyUniverse = function(container) { ... }`
- World creation: set DOM inputs (`#worldName`, `#genre`, `#worldTemplateKey`) rồi gọi `window.createWorld()` — fallback: set `window.world` trực tiếp
- Genesis animation: Canvas 2D fullscreen, ~260 frames (~4.3s), 320 particles + 3 rings + burst
- Jarvis toast: `position:fixed; bottom:36px; right:36px`, auto-dismiss 8s
- CSS namespace: `fce-` (không conflict với `puos-`)

## World Type Mapping
| key | genre | templateKey |
|---|---|---|
| fantasy | fantasy | fantasy |
| scifi | scifi | scifi |
| modern | custom | cultivation |
| mythology | mythology | mythology |
| cultivation | cultivation | cultivation |
| custom | custom | cultivation |
