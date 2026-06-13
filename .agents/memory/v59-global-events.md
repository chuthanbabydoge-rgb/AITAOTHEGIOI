---
name: V59 Global Events Architecture
description: 8-module Global Events Online system — Scheduler+Impact+MV+Community+Boss+Reward+Archive+Registry · init 10700→11400ms · UI in existing hubs
---

## Modules (init order)

| File | ms | Save Key |
|---|---|---|
| globalEventSchedulerV59.js | 10700 | cgv6_event_scheduler_v59 |
| eventImpactSystemV59.js | 10800 | cgv6_event_impact_v59 |
| multiverseEventSystemV59.js | 10900 | cgv6_mv_event_v59 |
| communityEventSystemV59.js | 11000 | cgv6_community_event_v59 |
| worldBossSystemV59.js | 11100 | cgv6_world_boss_v59 |
| eventRewardEngineV59.js | 11200 | cgv6_event_rewards_v59 |
| eventArchiveSystemV59.js | 11300 | cgv6_event_archive_v59 |
| eventRegistryV59.js | 11400 | (no save — registry) |

## Key Distinctions
- globalEventControlV51.js = Creator-triggered MANUAL events (V59 = auto-scheduled)
- worldBossEngineV31.js = single-world boss V31 (V59 = mega-boss multi-universe tier)
- eventGenerator.js V41 = text-only, no real world impact (V59 = real impact on countries[])
- multiverseWarSystemV39.js = NPC inter-universe wars (V59 = player-facing events + rewards)

## UI Integration
- 7 tabs INSIDE multiverse-hub-v35 (KHÔNG tạo sidebar tab mới)
- Widget in player-hub-v28
- Jarvis panel in creator-hub-v32
- eventRegistryV59.js patches mvHubRenderPanel() + hubRenderPanel('player-hub-v28') + hubRenderPanel('creator-hub-v32') using const _orig pattern

## gameTick Hooks (4 new)
- globalEventSchedulerV59Tick — mỗi 30 tick
- multiverseEventSystemV59Tick — mỗi 50 tick
- communityEventSystemV59Tick — mỗi 25/80 tick
- worldBossSystemV59Tick — mỗi 10/200 tick

## Real Impact Connections
- eventImpactSystemV59 directly mutates countries[i].stability / economy / population
- Triggers: plagueData (great_plague) · gdV48TriggerGlobal (great_disaster) · mvdV48Trigger (multiverse_rift) · criV49Trigger (world_war)
- Rewards connect to: pec52AddCurrency (CP as Tinh Thạch) · playerAddFame (V50 fame)

## Next Version
- V60 — Living Universe: init từ 11500ms+
- V60 sẽ reads eventSchedulerV59Data + eventArchiveV59Data + worldBossV59Data để generate stories/reactions
