---
name: V63 World Cinematic Engine
description: worldCinematicV63.js — fullscreen canvas cinematic intro khi khai sinh thế giới, init 12500ms
---

# V63 World Cinematic Engine

## File (1)
- `worldCinematicV63.js` — init 12500ms · SAVE: cgv6_world_cinematic_v63

## Integration
- Wizard (`worldCreationWizard.js`) gọi `wce63ShowCinematic(cfg)` thay vì `wcw62ShowTab("preview")` trực tiếp
- Sau dismiss (click "Bước Vào Thế Giới" hoặc auto 8s): gọi `wcw62ShowTab("preview")`
- Fallback nếu cinematic không load: trực tiếp `wcw62ShowTab("preview")`

## Architecture
- `buildOverlay(config)` → tạo `#wce63-overlay` (fullscreen fixed, z-index 99999)
- `createParticleSystem(canvas, colors)` → requestAnimationFrame loop, burst(true/false)
- CSS injected via `injectCSS()` → id: `wce63-style`
- `wce63ShowCinematic(config)` — main entry, reads `window.worldDNAData` + `window.originStoryData`

## Animation Timeline (relative to lastTextTime = 600 + (texts.length-1)*900 ms)
- 0ms: overlay fade-in
- 600ms + i*900ms: each text line appears (4 lines total per genre)
- lastText+300ms: particle burst ×2
- lastText+1000ms: world name scale-in + CSS pulse animation
- lastText+1800ms: DNA code slide-in from left
- lastText+2400ms: creator title fade-in
- lastText+2900ms: hero/myth lines fade-in
- lastText+3400ms: enter button + 8s progress bar (auto-dismiss after 8s)

## Genre → Color Mapping
| Genre | Primary | Secondary |
|---|---|---|
| cultivation | #f1c40f (gold) | #e67e22 (orange) |
| fantasy | #3498db (blue) | #9b59b6 (purple) |
| scifi | #2ecc71 (green) | #1abc9c (teal) |
| mythology | #9b59b6 (purple) | #e74c3c (red) |
| zombie | #e74c3c (red) | #e67e22 (orange) |
| custom | #f1c40f (gold) | #c084fc (purple) |

## API
- `window.wce63ShowCinematic(config)` — trigger cinematic
- `window.wce63Toggle()` — toggle enabled/disabled (persisted)
- `window.wce63IsEnabled()` → boolean

## Next Version
V64+ phải init từ **12600ms+**

**Why:** V63 init ở 12500ms, mỗi file cần ≥100ms khoảng cách để tránh race.
