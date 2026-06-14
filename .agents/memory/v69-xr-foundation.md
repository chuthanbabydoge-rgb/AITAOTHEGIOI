---
name: V69 XR Foundation Architecture
description: XR Foundation Pass — 5 files, device abstraction, God Hand, World Table Mode, camera system, UI in creator-hub-v32
---

## Files (5)
- `xrEngine.js` — core: capability detection, device profiling, session management, World Table state (init 15600ms)
- `xrInteractionSystem.js` — God Hand: Pinch/Grab/Rotate/Scale/Point, touch gestures, XRHand API (init 15700ms)
- `xrInputSystem.js` — input abstraction: Keyboard/Touch/Controller/Gaze unified event bus (init 15800ms)
- `xrCameraSystem.js` — camera: Orbit/WorldTable/GodView/Flythrough, smooth animation, XR rig (init 15900ms)
- `xrFoundationRegistry.js` — UI registry: 5 tabs in creator-hub-v32, patches hubRenderPanel() (init 16000ms)

## Key Rules
- KHÔNG ghi đè `webxrSystem.js` (V1) — V69 là layer mới phía trên
- Bridge với V67: `sge67OnEntitySelect()` called from `xr69OnEntitySelect()`
- patches `hubRenderPanel()` bằng const _orig pattern
- Section wrapper ID: `xrf69-section-wrapper`

## Device Profiles
| Device | Tier | Hand | Eye | FPS |
|---|---|---|---|---|
| Meta Quest 3 | vr | ✅ | — | 90 |
| Apple Vision Pro | mr | ✅ | ✅ | 90 |
| AR Glasses Android | ar | — | — | 60 |
| Desktop | flat | — | — | 60 |
| Mobile | flat | — | — | 60 |

## XR Readiness Score (0-100)
WebXR+20 · ImmVR+25 · ImmAR+25 · Hand+15 · Plane+10 · Eye+5

## World Table Mode
scale=0.01, tableHeight=0.8m, tableRadius=0.3m — world shrunk to fit on table

## God Hand Gestures
- Pinch: thumb-tip + index-finger-tip < 3cm (XRHand API)
- Grab: thumb-tip + middle-finger-tip < 6cm
- Rotate: 2-finger angle delta (touch) or mouse drag
- Scale: 2-finger distance ratio (touch) or scroll wheel
- Point: controller ray cast

## Input Event Bus
`xr69InputOn(event, fn)` — events: selectStart/grabStart/thumbstick/rotate/scale/resetWorldTable/enterVR/enterAR/exitXR

## Camera System
4 modes: orbit / worldTable / godView / flythrough
5 presets: topDown / isometric / godView / groundLevel / closeUp
World Tour: auto-generates waypoints from window.countries[]

## Save Keys
- `cgv6_xr_engine_v69` — slim state (device profile + log only)
- No save keys for interaction/input/camera (pure session state)

**Why:** V69 is a pure foundation layer like V67 — reads from existing globals, exposes new APIs for V70+ to build real VR/AR gameplay on top.

**How to apply:** Next XR version (V70+) should init from 16100ms+, import xr69 APIs, and build actual Three.js WebXR rendering on top of this foundation.
