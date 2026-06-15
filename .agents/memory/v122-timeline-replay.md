---
name: V122 Timeline Replay Architecture
description: Event-based historical snapshot system + replay engine with 5-tab UI, Jarvis Historian, Documentary Mode — hooks htAddEvent, dynamic sidebar tab inject.
---

# V122 Timeline Replay

## Files
- `timelineReplayEngineV122.js` — core snapshot + replay state machine + Jarvis historian
- `timelineReplayUIV122.js` — 5-tab panel renderer (Timeline/Replay/Events/Figures/Documentary)
- `timelineReplayRegistryV122.js` — dynamic inject sidebar btn+panel, seed from htData, patch puosRenderMyUniverse

## Save Key
`cgv6_timeline_replay_v122`

## Init Order
- Engine: 29000ms
- UI: 29100ms (loads immediately, no setTimeout — just defines window.tr122RenderPanel)
- Registry: 29200ms

## Key Design Decisions

**Why event-based snapshots (NOT every year):**
Captures only on 17 trigger types (kingdom_founded, empire_collapsed, war_start, etc.) + periodic every 50 in-game years. Max 200 snapshots, sliding window.

**How snapshots are captured:**
Hook wraps `window.htAddEvent` via `const _orig` pattern. When a trigger event fires, `captureSnapshot()` is called with civStates from `cecV95Data.civs`, population from `window.world/WSM/npcs`, wars from `window.warsActive`.

**How sidebar tab is injected:**
Registry dynamically creates `<button id="btn-TIMELINE-REPLAY">` and `<div id="panel-TIMELINE-REPLAY">` via DOM manipulation. Also hooks `window.showPanel` via _orig to handle display logic.

**Jarvis Historian:**
`window.tr122JarvisAnswer(question)` — answers 5 question types by scanning snapshots array (no AI call, pure JS analysis). Fast, offline.

**Documentary Mode:**
`window.tr122Documentary(snap)` — generates HTML biên niên sử text from snap data.

**API:**
```javascript
window.tr122Play()          // start auto-replay
window.tr122Pause()         // pause
window.tr122Goto(idx)       // jump to snapshot index
window.tr122SetSpeed(s)     // 1/2/5/10x
window.tr122Capture(r, t)   // force snapshot
window.tr122AddFigure(...)  // register historical figure
window.tr122JarvisAnswer(q) // answer history question
window.trV122Data           // full state object
```

**How to apply:**
Next version (V123) init từ 29300ms+. SAVE key pattern: cgv6_*_v123.
