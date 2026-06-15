---
name: V117 UWS Architecture
description: window.UWS — Unified World State aggregation layer, read-only, no save, no overwrite
---

# V117 — Unified World State (UWS)

**Rule:** window.UWS là aggregation-only layer — KHÔNG lưu localStorage, KHÔNG ghi đè engine nào.

## Files (5)
- uwsWorldAggV117.js — uwsGetWorldSnapshot() · world/age/climate/continents
- uwsEntityAggV117.js — uwsGetEntitySnapshot() · npcs/kingdoms/empires/civs/species/lifePop
- uwsEventAggV117.js — uwsGetEventSnapshot() · wars/disasters/plagues/crises/alliances/council
- uwsCoreV117.js — window.UWS object · gameTick hook · uwsRefresh() · uwsGet() · uwsGetSummary()
- uwsRegistryV117.js — Registry · uwsDiag() · uwsGetForAI() · uwsIsReady() · PUOS patch

## Init Order
26100ms → 26200ms → 26300ms → 26400ms → 26500ms
(Scripts load: WorldAgg → EntityAgg → EventAgg → Core → Registry)

## window.UWS Structure
```
window.UWS = {
  _version: 117, _lastUpdated, _tick, _sessionAge,
  world: { name, genre, year, population, biome, magic, tech, seed, age, climate, continents },
  entities: { npcs, kingdoms, empires, countries, civs, species, lifePop },
  events: { wars, disasters, plagues, crises, worldEvents, alliances, treaties, sanctions, council, autoEvents },
  summary: { totalPopulation, activeWars, activeDisasters, totalKingdoms, ... currentAge, worldName },
  meta: { tickCount, sessionStart, engineCount, refreshRate }
}
```

## Public API
- `window.UWS` — trực tiếp đọc object
- `window.uwsRefresh()` — force refresh, returns UWS
- `window.uwsGet("summary.activeWars")` — dot-path accessor
- `window.uwsGetSummary()` — shortcut summary
- `window.uwsGetForAI()` — compact snapshot cho Jarvis/Claude
- `window.uwsDiag()` — console diagnostic
- `window.uwsIsReady()` — boolean check

## **Why:**
Toàn bộ PUOS panels đều đọc từ nhiều window.* objects khác nhau → inconsistent data. UWS tạo 1 nguồn duy nhất, refresh mỗi 5 tick qua gameTick hook (_orig pattern).

## **How to apply:**
- Mọi UI mới từ V118+ NÊN đọc từ `window.UWS` thay vì đọc trực tiếp window.kingdomData / window.npcs / etc.
- Gọi `window.uwsRefresh()` trước khi render panel nếu cần data mới nhất ngay lập tức
- next version init từ 26600ms+
