---
name: V94 Life Activation Engine
description: Single-file completion engine that fixes V93 population staying at 0. 4-layer self-healing watchdog + standalone gameTick hook.
---

# V94 Life Activation Engine

## Why it exists
V93 species seeding only ran once at init and silently skipped if world wasn't ready yet. wacV92AddListener only fires on year-CHANGE — not useful for saved games loaded with fixed year. Result: population permanently 0.

## 4-Layer Self-Healing Architecture

**Layer 1 — Boot (1.5s after init)**
- If world exists + species empty → force-seed immediately

**Layer 2 — Watchdog (every 2s setInterval)**
- species.length === 0 → force-seed
- all pop = 0 → repair each species
- year > 100 AND totalPop = 0 → emergency seed
- every 30 ticks AND year > 50 AND species < 5 → 20% chance spawn new species

**Layer 3 — gameTick hook (own _orig, every 60 ticks)**
- evolveOneTick() — evolves all species with ±15% random variance
- maybeFireLifeEvent() — fires 1 life event per biological year
- checkMilestones() — detects pop thresholds 100→500→1K→5K→10K→50K→100K→1M
- self-heal: every 120 ticks if species empty → force-seed

**Layer 4 — UI Patch (every 2s)**
- Updates #lsv93-species-count and #lsv93-total-pop
- Refreshes Jarvis life summary if panel visible

## forceSeedSpecies()
Built-in GENRE_SEEDS (cultivation/fantasy/scifi/mythology/zombie). Does NOT depend on speciesSystemV93 being ready. Writes directly to `window.spv93Data` and patches `window.lev93Data`.

**Why:** spv93Data seeding was timing-dependent. This function runs at any time safely.

## Population Evolution Math
newPop = pop × (1 + birthRate×rand(0.85-1.15) - deathRate×rand(0.85-1.15))
Runs every 60 gameTick calls (not every year change)

## Key APIs
```javascript
window.laeV94GetJarvisSummary()   // Full Jarvis life report string
window.laeV94GetPublicAPI()       // { activated, firstLifeYear, milestones, totalPop, speciesCount }
```

## Save Key
cgv6_life_activation_v94 (only saves activation metadata — species/pop saved by V93 keys)

## Validation Guarantee
Cannot have Year > 100 AND Population = 0:
- Layer 2 watchdog checks every 2s
- Layer 3 gameTick self-heals every 120 ticks
