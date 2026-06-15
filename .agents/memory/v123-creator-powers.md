---
name: V123 Creator Powers Architecture
description: 8-module Creator Powers system — 32 divine powers across Geography/Life/Civ/Divine/Time/Experiment — gives player 92% world control.
---

# V123 Creator Powers

## Files (8)
- `creatorPowersCoreV123.js` (29300ms) — Core: Creator Mode toggle, history log (max 500), undo stack (max 30), snapshot callbacks
- `creatorWorldEditV123.js` (29400ms) — Geography: 6 terrain types via wmV121Data.grid 22×22
- `creatorLifePowersV123.js` (29500ms) — Life: 5 species presets, birthRate/deathRate/lifespan via spv93Data
- `creatorCivPowersV123.js` (29600ms) — Civ: create/tech/knowledge/pop/leader via cecV95Data
- `creatorDivineEventsV123.js` (29700ms) — Divine: 7 events (Blessing/Miracle/GoldenAge/Catastrophe/Plague/Meteor/Flood)
- `creatorTimePowersV123.js` (29800ms) — Time: Pause/Slow/FF/Skip/Jump via simSpeed select + changeSimSpeed()
- `creatorExperimentV123.js` (29900ms) — Experiment: Fork timelines, Compare A vs B, max 5 slots
- `creatorPowersRegistryV123.js` (30000ms) — Registry: dynamic sidebar tab inject, 7-tab UI, PUOS widget, Jarvis analysis

## Save Keys
- `cgv6_creator_powers_v123` — Core history + mode state
- `cgv6_creator_experiment_v123` — Timeline forks (metadata only, not full snapshot)

## Key APIs
```javascript
window.cpv123Enable/Disable/Toggle()       // Creator Mode
window.cpv123LogAction(type, title, detail, snap) // Log + htAddEvent + wmeAddMemory
window.cpv123Undo()                        // Undo last snap action
window.cpv123CreateMountain/River/Sea/Island/Forest/Desert(row,col,radius)
window.cpv123CreateSpecies(name, type)     // 5 presets: humanoid/beast/ancient/divine/cyber
window.cpv123BoostBirth/ReduceDeath/BoostPopulation/ExtendLifespan(spId, val)
window.cpv123CreateCiv/GrantTech/GrantKnowledge/BoostCivPop/ChangeLeader(civId, ...)
window.cpv123TriggerBlessing/Miracle/GoldenAge/Catastrophe/Plague/Meteor/GreatFlood()
window.cpv123PauseTime/SlowTime/FastForward/NormalTime/SkipYears/JumpToEvent()
window.cpv123ForkTimeline(name)            // Fork current world state
window.cpv123CompareWithCurrent(tlId)      // Compare fork vs current
window.cpv123RegistryRender(tab)           // Render UI panel
```

## How to apply
- Time control hooks `simSpeed` select element → `changeSimSpeed()` (NOT direct simInterval manipulation)
- Terrain edit hooks `wmV121Data.grid[row][col]` (KHÔNG overwrite worldMapTerrainV121.js)
- Species edit hooks `spv93Data.species` array (KHÔNG overwrite speciesSystemV93.js)
- Civ edit hooks `cecV95Data.civs` array (KHÔNG overwrite civEvolutionCoreV95.js)
- All actions auto-write to `htAddEvent` + `wmeAddMemory` + `trV122CaptureNow`
- next V124 init từ 30100ms+

**Why:**
Project requires EXPAND ONLY — all V123 power functions extend existing data structures via reference, never replacing or recreating them.
