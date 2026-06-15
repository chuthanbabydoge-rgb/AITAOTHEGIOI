---
name: V121 World Map Architecture
description: 3-file extension layer adding terrain grid, civ territories, war fronts, timelapse UI to existing worldMapSystem.js
---

# V121 Dynamic World Map Architecture

**Rule:** NEVER overwrite worldMapSystem.js — V121 wraps global functions via _orig pattern.

## Hook Strategy
- `worldMapTerrainV121.js` wraps `window.drawBiomeBackground` → draws terrain tiles BEFORE biome overlay
- `worldMapCivV121.js` wraps `window.drawCountries` → draws civ territories + war fronts + disaster markers BEFORE countries layer
- `worldMapRegistryV121.js` wraps `window.onMapPanelShow` → injects layer chips + V121 sidebar panel after panel opens

## Data Sources
- Terrain: 22×22 grid seeded from worldId hash (mulberry32 PRNG) — deterministic per world
- Civ zones: `window.cecV95Data.civs[]` — territory radius = `CIV_STAGE_RADIUS[stageId] + territory*0.4`
- Civ positions: spread evenly around circle centered at (50,50), 3 radii rings
- War fronts: `window.warsActive[]` — matched to civs by name substring
- Disasters: `window.disasterData.active`, `window.plagueData.active`, `window.econCrisisData.active`
- Cities: `cecV95Data.civs[].cities[]` — positioned around civ center

## Timelapse
- Uses existing `_timelineSnapshots` (from worldMapSystem.js) 
- Uses existing `applyTimelineSnapshot()` if available
- `wmTlPlay()` / `wmTlPause()` / `wmTlGoLive()` / `wmTlSeek(yr)` / `wmTlSetSpeed(n)`
- Speed options: ×1, ×3, ×10, ×25, ×50

## Fog of War
- Reuses existing `_fogGrid` + `revealFog()` from worldMapSystem.js
- V121 expands fog each 5 years via gameTick hook (each civ reveals 3 cells)

## UI Injection
- Layer chips injected into `.map-filter-row` (5 new purple chips)
- Sidebar section injected into `#panel-worldmap .map-sidebar` BEFORE last child (regen button)
- Section ID: `wm121-sidebar-section`, Panel ID: `wm121-sidebar-panel`
- 4 tabs: Văn Minh | Chiến Tranh | Timelapse | Khám Phá
- Auto-refresh 3s when panel is active

## Save Keys
- `cgv6_worldmap_terrain_v121` — terrain grid + worldId + visible flag
- `cgv6_worldmap_civ_v121` — layer visibility flags
- `cgv6_worldmap_registry_v121` — active sidebar tab
- `cgv6_worldmap_report_v121` — generated markdown report (via `wmV121GenerateReport()`)

## V121b Extension Files (EXPAND ONLY — KHÔNG ghi đè V121)
- `worldMapDiplomacyV121b.js` (28750ms) — wraps drawCountries (AFTER V121 civ wrap) to draw alliance/trade/treaty/rival lines · reads allianceData+treatyData+sanctionData+tradeNetworkV54 · aeAreAllied()+drGetRelation() inferred · window.wmDiploV121 · wmToggleDiplo(layer) · wmGetDiploStats()
- `worldMapViewsV121b.js` (28800ms) — wraps drawBiomeBackground (AFTER V121 terrain wrap) for 5 view modes · Political/Civ/Population/Tech/History overlays · wmV121JarvisQuery(q) 7 categories · window.wmV121XRData 3D coords · wmV121GenerateLivingReport() full markdown

## Init Order
- worldMapTerrainV121.js: 28500ms
- worldMapCivV121.js: 28600ms
- worldMapRegistryV121.js: 28700ms
- worldMapDiplomacyV121b.js: 28750ms
- worldMapViewsV121b.js: 28800ms
- next V122 init từ 28900ms+

**Why:** worldMapSystem.js uses global non-IIFE strict-mode functions, making them patchable via window.xxx = wrap pattern without touching the original file.
