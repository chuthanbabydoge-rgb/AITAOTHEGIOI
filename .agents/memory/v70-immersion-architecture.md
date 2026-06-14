---
name: V70 World Immersion Architecture
description: 8 files · 9 scale levels Universe→NPC · seamless zoom · NPC observation · dynasty tree · walkthrough · historical replay
---

## Rule
V70 là pure visual/immersion layer — KHÔNG hook gameTick. Chỉ đọc window.* globals, không ghi.

**Why:** Tránh lag thêm vào 122 gameTick hooks đã có. UI render on-demand khi user mở tab.

**How to apply:** Nếu cần cập nhật state theo thời gian, dùng requestAnimationFrame trong canvas loops, không dùng gameTick.

---

## 8 Files & Init Timing (16100–16800ms)

| File | Init | Save Key |
|---|---|---|
| immersionEngine.js | 16100ms | cgv6_immersion_engine_v70 |
| worldScaleEngine.js | 16200ms | cgv6_world_scale_v70 |
| dynamicZoomSystem.js | 16300ms | cgv6_dynamic_zoom_v70 |
| cityImmersionSystem.js | 16400ms | cgv6_city_immersion_v70 |
| npcObservationSystem.js | 16500ms | cgv6_npc_observation_v70 |
| dynastyVisualizationSystem.js | 16600ms | cgv6_dynasty_viz_v70 |
| worldWalkthroughSystem.js | 16700ms | cgv6_walkthrough_v70 |
| immersionRegistry.js | 16800ms | — |

Next version V71 init từ 16900ms+.

---

## 9 Scale Levels

Scale 0=Vũ Trụ · 1=Thiên Hà · 2=Hành Tinh (default) · 3=Lục Địa · 4=Vương Quốc · 5=Thành Phố · 6=Khu Phố · 7=Công Trình · 8=NPC

---

## Key APIs

```javascript
window.imm70ZoomTo(level, entityInfo)   // Core zoom
window.imm70ZoomIn() / imm70ZoomOut()
window.imm70ZoomBack()                  // history stack
window.imm70GetContextData()            // context per scale
window.imm70GetJarvisNarration(n)       // Jarvis comment
window.dzm70SetupWheelZoom(el)          // scroll zoom
window.dzm70SetupPinchZoom(el)          // XR pinch
window.dzm70RenderOverlay(ctx, W, H)    // AR layer
window.nos70ObserveNpc(npcIdOrObj)      // observe NPC
window.nos70GetLifeline()               // NPC life events
window.nos70GetProfile(npc)             // stats+relations+memories
window.dv70VisitDynasty(surname)        // load dynasty
window.dv70RenderTree(canvas)           // canvas family tree
window.wwt70Enter()                     // walkthrough mode
window.wwt70StartReplay(fromY, toY)     // historical replay
window.wwt70StepReplay()                // step 1 event
window.imm70RefreshUI()                 // re-render active tab
window.imm70ShowTab(tabId)              // switch tab
```

---

## UI — 5 Tabs trong creator-hub-v32

Section ID: `imm70-section-wrapper`  
Tab IDs: `immview` · `worldzoom` · `npcobs` · `dynasty` · `replay`

Registry patches `window.hubRenderPanel` với const `_origHub` pattern.

---

## Tích Hợp Data (Read-Only)

- V64: `window.npcMemoryV64Data.npcMemories[npc.id]`
- V65: `window.npcFamilyV65Data.families` · `window.npcRelationV65Data`
- V55: `window.histReplayData.events`
- V67: `window.spatialWorldV67Data` (coordinate system)
- V69: `window.xrEngineV69Data` (XR state)

---

## XR Compatibility

Canvas 2D với transparent overlay — hoạt động trong WebXR framebuffer.  
`dzm70SetupPinchZoom` handles XR Hand pinch gesture.  
`wse70SetupCanvas` compatible với XR controller ray cast click.
