---
name: V60 Living Universe Architecture
description: V60 — Living Universe integration layer: 6 modules, save keys, init order, global objects, what it reads/writes
---

# V60 Living Universe Architecture

## Summary
V60 is the "central nervous system" of the project — 6 files that INTEGRATE all existing 190+ systems. No new gameplay systems added.

## Files & Init Order
| File | Global Object | Save Key | Init |
|---|---|---|---|
| `livingUniverseOrchestrator.js` | `window.luOrchestratorV60Data` | `cgv6_universe_orchestrator_v60` | 11500ms |
| `causeEffectEngine.js` | `window.causeEffectV60Data` | `cgv6_cause_effect_v60` | 11600ms |
| `worldNarrativeEngine.js` | `window.worldNarrativeV60Data` | `cgv6_world_narrative_v60` | 11700ms |
| `universeMaturitySystem.js` | `window.universeMaturityV60Data` | `cgv6_universe_maturity_v60` | 11800ms |
| `universeAnalyticsEngine.js` | `window.universeAnalyticsV60Data` | `cgv6_universe_analytics_v60` | 11900ms |
| `livingUniverseRegistryV60.js` | — | — (passive) | 12000ms |

## Key APIs
- `luo60GetState()` · `luo60GetDomainScore(id)` · `luo60GetIntegrationScore()` · `luo60GetDomains()` · `luo60GetStats()`
- `cee60GetActiveChains()` · `cee60GetHistory()` · `cee60TriggerChain(id)` · `cee60GetChainDefs()` · `cee60GetStats()`
- `wne60GenerateChronicle()` · `wne60GenerateLegend(boss)` · `wne60GenerateTurningPoint(cause)` · `wne60GenerateEpochSummary()` · `wne60GetAll()` · `wne60GetJarvisStory()`
- `ums60GetScore()` · `ums60GetDimensions()` · `ums60GetTier()` · `ums60GetJarvisReport()` · `ums60ForceEvaluate()`
- `uae60GetAnalytics()` · `uae60GetTrends()` · `uae60GetDashboard()` · `uae60GetInsights()` · `uae60GetJarvisInsights()` · `uae60ForceSnapshot()`
- `lur60ShowTab(tabId)` · `lur60HubRenderPanel()`

## Cause-Effect Chains (6)
1. `disaster_to_war` — disasterData severity ≥ 80 → new war
2. `war_to_hero` — warsActive[0].intensity ≥ 70 → NPC becomes hero
3. `economy_collapse_to_revolution` — country.economy ≤ 15 → stability crash
4. `religion_rise_to_holy_war` — politicalReligionData spread ≥ 75 → holy war
5. `prosperity_to_golden_age` — country avg prosperity ≥ 75 → golden age
6. `multiverse_rift_to_invasion` — mvEventV59Data active universe_collision → NPC invasion

## Universe Maturity Tiers (6)
- 🌱 Phôi Thai (0-15) · 🌿 Đang Phát Triển (15-30) · 🌳 Trưởng Thành (30-50) · 🌟 Phồn Thịnh (50-70) · ⚡ Huyền Thoại (70-85) · 🌌 Thần Thánh (85-100)

## UI Placement
- 6 tabs in `creator-hub-v32` (👁 Creator God V32)
- Tab IDs: `lur60-living` · `lur60-integration` · `lur60-analytics` · `lur60-story` · `lur60-health` · `lur60-jarvis`
- Patches `hubRenderPanel()` via `const _orig = window.hubRenderPanel` pattern

## Project State After V60
- 265 JS files · 192+ systems · 122 gameTick hooks · 174+ save keys
- Init timing ends at 12000ms — next version must use 12100ms+
- Integration score starts at ~10/100 — increases as world runs

**Why:** V60 is a pure integration/observation layer — it should NEVER write to other systems' core data objects. causeEffectEngine is the only V60 module that writes to external data (countries[].stability etc.) and it does so explicitly as designed.
