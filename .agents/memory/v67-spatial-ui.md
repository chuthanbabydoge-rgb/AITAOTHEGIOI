---
name: V67 Spatial UI Architecture
description: 6-file Spatial UI pass — Canvas 2D holographic world view, hologram map, universe table, draggable timeline, spatial god mode, UI registry · pure visual layer · 4 tabs creator-hub-v32
---

## Files (6 files, init 14600→15100ms)
- spatialWorldEngine.js (14600ms) — 3D isometric canvas, projection pipeline, depth sort, drag/zoom, auto-rotate, node click
- hologramMapSystem.js (14700ms) — top-down hologram map, neon glow nodes, animated war arcs, filter modes
- universeVisualizationEngine.js (14800ms) — sa bàn sống, 200 stars, 5 nebulae, multiverse planets, artifact orbits, energy particles
- hologramTimelineSystem.js (14900ms) — horizontal draggable timeline, past events above/prophecies below, zoom 20-5000y
- spatialGodModeV67.js (15000ms) — 8 god modes, entity selection, calls V66 APIs, action log
- spatialUIRegistryV67.js (15100ms) — 4 tabs in creator-hub-v32, Jarvis Spatial Mode, section wrapper su67-section-wrapper

## Save Keys
NONE — V67 is pure visual layer, no save state.

## Global Objects
window.spatialV67Data · window.hologramMapV67Data · window.universeVisV67Data · window.hologramTimelineV67Data · window.spatialGodModeV67Data

## Key Public APIs
- swe67BuildWorldNodes() — rebuild entity list from world data
- swe67StartLoop(canvasId) — start 3D spatial render loop
- holo67BuildMap(w, h) — rebuild hologram map nodes
- holo67StartLoop(canvasId, onNodeClick) — start hologram render loop
- uv67BuildUniverse(w, h) — build universe table data
- uv67StartLoop(canvasId) — start universe render loop
- htl67BuildData() — collect all events + prophecies
- htl67StartLoop(canvasId) — start timeline render loop
- htl67GoToYear(yr) — center timeline on year
- htl67Zoom(delta) — change year range
- sgm67SetMode(modeId) — set god action mode
- sgm67Execute(entity) — perform divine action on entity
- sge67OnEntitySelect(entity) — entity selected from spatial view → god mode
- su67_showTab(tabId) — switch spatial UI tab

## 3D Projection Math
Nodes: normalized coords (x,y,z) ∈ [-0.5, 0.5]
Pipeline: Y-rotate(rotation°) → X-tilt(25°) → Perspective(FOV 1.5, dist 2.0)
Controls: drag → yaw, scroll → zoom, click → select, dblclick → auto-rotate toggle

## Node Colors (Holographic Palette)
Countries: #00f5ff (cyan) · Kingdoms: #a855f7 (purple) · Empires: #f59e0b (gold)
NPCs alive: #4ade80 (green) · Divine blessed NPCs: #fbbf24 (gold)
Religions: #f472b6 (pink) · Wars: #ef4444 (red arcs) · Alliances: #60a5fa (blue arcs)

## Canvas Loop Pattern
All canvas loops check `document.getElementById(canvasId)` — if null, stop. Store `_stop` function on data object. su67_showTab() calls _stop on all before switching.

## Spatial God Mode — 8 Modes
bless → div66Perform("bless_nation") · smite → div66Perform("smite"/"divine_wrath")
hero → mir66CastGrandMiracle("hero_awakening") · disaster → div66Perform("divine_wrath")
message → divVoice66Send() · artifact → div66CreateArtifact() · prophecy → proph66Create("destiny") · peace → div66Perform("divine_peace")

## VR/AR/XR Readiness
Normalized coords ready for WebXR. Upgrade path: replace swe67Render() canvas calls with WebGL; swe67BuildWorldNodes() data remains unchanged.

## Section Wrapper ID
su67-section-wrapper (used to detect if already injected)

## Tab IDs
su67-tab-{spatial-view, hologram-timeline, universe-table, spatial-god-mode}

## Canvas IDs
sve67-canvas (spatial view) · htl67-canvas (timeline) · uv67-canvas (universe)
hologram map uses: holo67-canvas (injected by holo67StartLoop)

## Jarvis Spatial Mode
Toggle: su67_toggleJarvis() · Refresh: su67_refreshJarvis()
Container: su67-jarvis-container (below tab content in su67-section-wrapper)

## Data Sources (read-only from V51-V66)
window.countries, window.kingdomData.kingdoms, window.empireData.empires
window.warsActive, window.allianceData, window.treatyData, window.npcs
window.historicalTimeline, window.htData, window.prophecyV51Data, window.prophecyV66Data
window.creatorLegacyV66Data, window.disasterData, window.ageV25Data, window.divineArtifactV66Data

## Next Version
V68 init từ 15200ms+
