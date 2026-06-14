---
name: V92 Autonomous World Architecture
description: 5-file system — Universe Clock + Event Engine + Chronicle + Jarvis Observer + UI Registry. World self-runs after creation.
---

# V92 Autonomous World Architecture

## Rule
Universe Clock (wacV92) hooks gameTick, detects year change, broadcasts via listener pattern. Other engines register via `window.wacV92AddListener(fn)`.

**Why:** Centralized year-change detection avoids multiple engines independently hooking gameTick. Single source of truth for "year changed" event.

**How to apply:** Any future engine that needs to react to year changes: call `window.wacV92AddListener(function(toYear, fromYear) { ... })` at init. Do NOT hook gameTick independently for year detection.

## Files
- `worldAutonomyClockV92.js` — 24200ms, SAVE cgv6_autonomy_clock_v92
- `autonomousEventEngineV92.js` — 24300ms, SAVE cgv6_autonomous_events_v92
- `worldChronicleV92.js` — 24400ms, SAVE cgv6_world_chronicle_v92
- `jarvisObserverV92.js` — 24500ms, SAVE cgv6_jarvis_observer_v92
- `autonomousWorldRegistryV92.js` — 24600ms, no save

## Public APIs
```javascript
window.wacV92AddListener(fn)          // Register year-change listener
window.wacV92GetCurrentYear()         // Current year
window.wacV92GetElapsed()             // Total years elapsed

window.aeeV92GetRecentEvents(n)       // Last N auto-events
window.aeeV92FireManual()             // Manual trigger

window.wchV92AddEvent(event)          // Add to chronicle
window.wchV92RenderHTML()             // Chronicle HTML

window.jovV92GetLatest()              // Latest Jarvis observation
window.jovV92RenderHTML()             // Jarvis HTML

window.awv92SwitchTab(tab)            // Switch UI tab (events/chronicle/jarvis)
```

## UI Injection Pattern
Registry hooks puosRenderMyUniverse (second _orig wrap after V91). Injects #awv92-section into #puos-main after world exists. 3-tab UI: Events / Biên Niên / Jarvis. setInterval 3s for live updates.

## Event-to-System Pipeline
Each auto-event writes to: htAddEvent() → Historical Timeline + wmeAddMemory() → World Memory + wchV92AddEvent() → Chronicle V92.
