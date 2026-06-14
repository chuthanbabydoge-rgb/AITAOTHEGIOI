---
name: V93 Life Simulation Architecture
description: 4-file system — Life Engine + Species System + Life Events + UI Registry. Population self-evolves per year.
---

# V93 Life Simulation Architecture

## Rule
Species population evolves each year by registering to wacV92AddListener (NOT a new gameTick hook). Species are auto-seeded from world genre on first load.

**Why:** Centralize year-change detection through V92 Clock. No independent gameTick hooks.

**How to apply:**
- Any future life/biology engine: register via `window.wacV92AddListener(fn)` for year events.
- Check `window.spv93Data.seeded` before re-seeding species.
- Species population is SEPARATE from window.npcs (species = macro civilizational level; npcs = named individuals).

## Files & Init
- `lifeEngineV93.js` — 24700ms, SAVE cgv6_life_engine_v93
- `speciesSystemV93.js` — 24800ms, SAVE cgv6_species_v93
- `lifeEventsV93.js` — 24900ms, SAVE cgv6_life_events_v93
- `lifeRegistryV93.js` — 25000ms, no save key

## Key APIs
```javascript
window.lev93GetCurrentPop()       // Total population
window.lev93GetGrowthRate()       // Growth % vs last year
window.lev93GetSnapshot()         // Full snapshot with history
window.spv93GetAll()              // All species array
window.spv93GetAlive()            // Non-extinct species
window.spv93GetTotal()            // Sum of all populations
window.spv93EvolveAll(year)       // Manually trigger evolution
window.spv93AddCustom(name, type, icon, pop)  // Add custom species
window.lev93GetLifeEvents(n)      // Last N life events
window.lev93FireManual()          // Manually trigger a life event
window.lsv93SwitchTab(tab)        // Switch UI tab
```

## Species Seeding by Genre
- `cultivation` → Nhân Loại (🧑) + Sinh Vật Huyền Bí (🐉) + Linh Thể (✨)
- `fantasy`     → Nhân Loại + Muôn Thú (🦁) + Sinh Vật Huyền Bí
- `scifi`       → Nhân Loại + Ngoại Tinh (👽)
- `mythology`   → Nhân Loại + Sinh Vật Huyền Bí + Linh Thể
- `zombie/custom` → Nhân Loại + Muôn Thú + Sinh Vật Huyền Bí

## UI Pattern
lifeRegistryV93 wraps puosRenderMyUniverse (3rd _orig wrap: V91→V92→V93) with 140ms delay. Injects #lsv93-section below #awv92-section. 3-tab UI: Dân Số / Loài / Sự Kiện. Updates every 4s interval.

## Life Event Pipeline
Each year: lifeEventsV93 fires 1 event (2 if ≥4 species) →
- Apply pop modifier to species
- wchV92AddEvent() → Chronicle V92
- htAddEvent() → Historical Timeline

## Population Math
newPop = pop × (1 + birthRate×rand(0.8-1.2) - deathRate×rand(0.8-1.2))
Species birth rates: Human 9% · Animal 12% · Fantasy 4% · Spirit 3% · Alien 6%
