---
name: V80 Multiverse Evolution Architecture
description: Architecture of V80 — Multiverse Evolution Pass giving the entire multiverse a living, interconnected history with world evolution, cross-world influence, clusters, and XR portals
---

# V80 — Multiverse Evolution Pass

## Files (5)
| File | Role | Save Key | Init |
|---|---|---|---|
| `multiverseEvolutionEngine.js` | 8 world types · 6 evolution stages · score/connections/dominant | `cgv6_multiverse_evo_v80` | 21100ms |
| `crossWorldInfluenceEngine.js` | 6 influence types · 5 strengths · network dominance · auto 100yr | `cgv6_cross_world_v80` | 21200ms |
| `universeClusterEngine.js` | 6 cluster types · auto-form 300yr · power tracking | `cgv6_universe_cluster_v80` | 21300ms |
| `multiverseHistoryEngine.js` | 7 eras · 8 event types · cross-world empires · legends · auto 200yr | `cgv6_multiverse_history_v80` | 21400ms |
| `multiverseTimelineSystem.js` | UI 5 tabs · XR Portal · migration system · dual hook | `cgv6_multiverse_timeline_v80` | 21500ms |

## Global Objects
- `window.multiverseEvoV80Data` · `window.crossWorldV80Data` · `window.universeClusterV80Data`
- `window.multiverseHistoryV80Data` · `window.mvTimelineV80Data`
- `window.MEVO80_TYPES` (8 types) · `window.MEVO80_STAGES` (6 stages)
- `window.CWI80_TYPES` (6 types) · `window.CWI80_STRENGTHS` (5 levels)
- `window.UCLU80_TYPES` (6 types)
- `window.MHIST80_ERAS` (7 eras) · `window.MHIST80_EVENTS` (8 event types)

## Critical Design: mevo80GetAlive() is the data spine
All other V80 modules read `mevo80GetAlive()` as their world source list. This means worlds must first be registered via `mevo80RegisterWorld(name, typeId?)` before they appear in cross-world influence, clusters, or history auto-routines.

## UI Injection Pattern (dual hook)
`multiverseTimelineSystem.js` hooks BOTH `window.uhubV73Render` (Universe Hub V73) and `window.hubRenderPanel` (generic hub):
```js
var _origUHub = window.uhubV73Render;
if (typeof _origUHub === "function") window.uhubV73Render = function() { _origUHub(); setTimeout(mvt80RenderPanel, 300); };
var _origHub = window.hubRenderPanel;
window.hubRenderPanel = function(panelId) { if (_origHub) _origHub(panelId); if (panelId === "universe-hub-v73" || panelId === "creator-hub-v32") setTimeout(mvt80RenderPanel, 400); };
```
This ensures injection works in Universe Hub AND falls back to Creator Hub if Universe Hub is unavailable.

## Public API
- `mevo80RegisterWorld(name, typeId?)` → seeded by name hash
- `mevo80Evolve(name, amount)` → updates score + stage
- `mevo80ConnectWorlds(worldA, worldB)` → bidirectional connection
- `cwi80SendInfluence(from, to, typeId, strengthId, content?)` → boosts dest world evo
- `cwi80GetInfluenceNetwork()` → sorted by dominanceScore
- `uclu80CreateCluster(typeId, leaderWorld?)` + `uclu80AddMember(clusterId, worldName)`
- `mhist80TransitionEra(eraId)` → logs htAddEvent + wmeAddMemory
- `mhist80FormCrossWorldEmpire(leader, members, type?)` → cross-world empire record
- `mhist80RecordLegend(hero, homeWorld, crossedTo, title?)` → legend record
- `mvt80EnterPortal(destWorld)` → xrMode = true, records session
- `mvt80RecordMigration(from, to, what, type)` → 4 migration types

## KHÔNG trùng với
- `universeHubCoreV73.js` — V73 is the hub container; V80 injects into it (hook only)
- `timelineBranchV76.js` — V76 is single-world timeline branching; V80 is cross-world
- `allianceData V24` — V24 is nation-level alliances; V80 is world-level clusters

## gameTick hooks (+4, total ~144)
- `mevo80`: 0.5%/tick — auto-evolve/connect every 150yr
- `cwi80`: 0.6%/tick — auto-influence every 100yr
- `uclu80`: 0.4%/tick — auto-scan every 300yr
- `mhist80`: 0.5%/tick — auto-history every 200yr

**Why:** V80 is the top layer of the world stack. V79 gave each country a soul; V80 connects them across worlds into a living multiverse with shared history, influence, and legends.
