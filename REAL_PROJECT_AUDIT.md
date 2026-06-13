# REAL PROJECT AUDIT — Creator God V6
> Tạo bằng cách quét mã nguồn thực tế — KHÔNG dựa vào next-version.md
> Ngày audit: 2026-06-13 (cập nhật sau V43)
> Phương pháp: Quét toàn bộ *.js, index.html, localStorage keys, gameTick hooks

---

## 📊 TỔNG QUAN SỐ LIỆU

| Chỉ Số | Giá Trị |
|---|---|
| **Tổng file .js trên disk** | 185 files |
| **Tổng file được load trong index.html** | 184 files |
| **File dormant** | 1 (serve.js — HTTP server, không phải game engine) |
| **Tổng panel divs trong HTML** | 175 panels |
| **Tổng nav buttons (data-panel)** | 67 buttons |
| **Tổng localStorage save keys** | 115+ keys |
| **Engine hook vào gameTick** | 73 engines |
| **Phiên bản hiện tại** | V43 — Hệ Thống Kỷ Nguyên Thế Giới |

---

## ✅ HỆ THỐNG ĐÃ TRIỂN KHAI ĐẦY ĐỦ

### 🔷 Core Engine (6 files)
| File | Chức Năng | Panel |
|---|---|---|
| `app.js` | Core loop · NPC/Sect/Country · Save/Load · gameTick chính | world, npcs, sects, countries, boss, dungeon, leaderboard, logs, sectwars, secret-realms |
| `worldTemplates.js` | World initialization templates | — |
| `worldHub.js` | World Hub V6 · Multi-world UI | — |
| `multiWorldSystem.js` | Multi-world management | — |
| `living-world-engine.js` | NPC soul/ambition/memory AI · Living World | — |
| `saveManager.js` | Save/Load manager V1 | — |

### 💰 Economy (5 files)
| File | Panel |
|---|---|
| `economySystem.js` | economy |
| `economyEngine.js` | economy-engine |
| `economyEngineV2.js` | — (sub-tab) |
| `economyAuditSystem.js` | dashboard |
| `worldMarketplace.js` | — |

### ⚔️ War & Territory (3 files)
| File | Panel |
|---|---|
| `warEngine.js` | war-engine |
| `territorySystem.js` | territories |
| `territoryWarSystem.js` | territory-war |

### 🤝 Diplomacy V1 (2 files)
| File | Panel |
|---|---|
| `diplomaticEngine.js` | diplomacy |
| `espionageEngine.js` | espionage |

### 🤝 Diplomacy V24 (5 files)
| File | Panel |
|---|---|
| `allianceEngine.js` | alliance-v24 |
| `treatyEngine.js` | treaties-v24 |
| `sanctionEngine.js` | sanctions-v24 |
| `worldCouncilEngine.js` | world-council |
| `diplomacyEngine.js` | diplomacy-v24, intl-relations |

### 👑 Empire & Kingdom V23 (11 files)
| File | Panel |
|---|---|
| `kingdomEngine.js` | kingdoms |
| `kingdomAI.js` | — |
| `empireEngine.js` | empire, empires |
| `empireAI.js` | — |
| `successionEngine.js` | succession |
| `nobleHouseEngine.js` | noble-houses |
| `dynastyEngine.js` | dynasty-engine |
| `dynastySystem.js` | dynasty |
| `bloodlineEngine.js` | bloodlines |
| `hereditaryBloodlineEngine.js` | — (merged vào bloodlines) |
| `livingCivilizationAI.js` | living-civ |

### 🌍 World Simulation (14 files)
| File | Panel |
|---|---|
| `worldEventEngine.js` | world-event |
| `worldEventEngineV25.js` | world-event-v25 |
| `worldMemoryEngine.js` | world-memory |
| `worldAlertEngine.js` | alerts |
| `worldStorySystem.js` | story, world-chronicle |
| `worldMapSystem.js` | worldmap |
| `historicalTimeline.js` | historical-timeline |
| `rankingsEngine.js` | rankings |
| `technologyEngine.js` | technology |
| `politicalReligionEngine.js` | political-religion |
| `cultureHeritageEngine.js` | culture-heritage |
| `religionEngine.js` | religion |
| `emergentCivilization.js` | — |
| `aiWorldGenerator.js` | — |

### 🌋 World Events V25 (5 files) — Save Key: cgv6_*_v25
| File | Panel | Save Key |
|---|---|---|
| `disasterEngine.js` | disaster | cgv6_disaster_v25 |
| `plagueEngine.js` | plague | cgv6_plague_v25 |
| `economicCrisisEngine.js` | econ-crisis | cgv6_econ_crisis_v25 |
| `worldEventEngineV25.js` | world-event-v25 | cgv6_world_event_v25 |
| `ageEngineV25.js` | age-v25 | cgv6_age_v25 |

### 🌅 Continent V26 (4 files)
| File | Panel | Save Key |
|---|---|---|
| `continentEngineV26.js` | continent-v26 | cgv6_continent_v26 |
| `continentEngine.js` | continent | — |
| `continentalPoliticsEngine.js` | cont-politics | cgv6_cont_politics |
| `migrationEngineV26.js` | migration-v26 | cgv6_migration_v26 |

### 🌊 Ocean V27 (5 files)
| File | Panel | Save Key |
|---|---|---|
| `navalOceanEngine.js` | naval-ocean | cgv6_naval_ocean |
| `navalEngine.js` | naval-v27 | cgv6_naval_v27 |
| `oceanTradeEngine.js` | ocean-v27 | cgv6_oceantrade_v27 |
| `fleetEngine.js` | — | cgv6_fleet_v27 |
| `pirateEngine.js` | pirates | cgv6_pirate_v27 |
| `colonyEngine.js` | colonies | cgv6_colony_v27 |

### 🧘 Player V28 (7 files)
| File | Panel | Save Key |
|---|---|---|
| `playerEngine.js` | player-v28 | cgv6_player_v28 |
| `playerSystem.js` | player | — |
| `cultivationPlayerEngine.js` | cultivation-v28 | cgv6_cultivation_v28 |
| `ascensionEngine.js` | ascension-v28 | cgv6_ascension_v28 |
| `playerInventory.js` | inventory-v28 | cgv6_inventory_v28 |
| `playerQuestSystem.js` | player-quest-v28 | cgv6_player_quest_v28 |
| `playerReputationEngine.js` | — | cgv6_player_rep_v28 |
| `playerTerritorySystem.js` | — | cgv6_territory_v28 |
| `playerMarketplace.js` | player-market | — |
| `playerPresenceEngine.js` | — | — |
| `playerSessionManager.js` | — | — |
| `playerAdvisor.js` | — | — |
| `autoPlayerAI.js` | — | — |
| `progressionSystem.js` | — | — |

### ⛩️ Sect V29 (3 files)
| File | Panel | Save Key |
|---|---|---|
| `sectEngineV29.js` | sect-v29 | cgv6_sect_v29 |
| `sectWarEngineV29.js` | sect-war-v29 | cgv6_sectwar_v29 |
| `guildEngineV29.js` | guild-v29 | cgv6_guild_v29 |

### 🏛️ Divine V30 (7 files)
| File | Panel | Save Key |
|---|---|---|
| `pantheonEngineV30.js` | pantheon-v30 | cgv6_pantheon_v30 |
| `divineBeingEngine.js` | divine-v30 | cgv6_divine_v30 |
| `divineWarEngine.js` | divinewar-v30 | cgv6_divinewar_v30 |
| `realmEngineV30.js` | realm-v30 | cgv6_realm_v30 |
| `portalEngineV30.js` | portal-v30 | cgv6_portal_v30 |
| `heavenlyDaoEngine.js` | heavenly-dao | — |
| `divineAdministration.js` | divine-admin | cgv6_divine_admin_v32 |

### ⚔️ Combat V31 (8 files)
| File | Panel | Save Key |
|---|---|---|
| `dungeonEngineV31.js` | dungeon-v31 | cgv6_dungeon_v31 |
| `dungeonSystem.js` | dungeon | — |
| `worldBossEngineV31.js` | worldboss-v31 | cgv6_worldboss_v31 |
| `invasionEngineV31.js` | invasion-v31 | cgv6_invasion_v31 |
| `raidEngineV31.js` | raid-v31 | cgv6_raid_v31 |
| `lootEngineV31.js` | loot-v31 | cgv6_loot_v31 |
| `legendaryHuntEngineV31.js` | hunt-v31 | cgv6_hunt_v31 |
| `bossEvolutionEngineV31.js` | — | cgv6_bossevo_v31 |

### 👁️ Creator God V32 (8 files)
| File | Panel | Save Key |
|---|---|---|
| `creatorGodEngine.js` | creator-hub-v32 | — |
| `creatorGodControl.js` | creator-control | cgv6_creator_control_v32 |
| `creatorAnalytics.js` | creator-analytics | cgv6_creator_analytics_v32 |
| `creatorLibrary.js` | creator-library-v40 | — |
| `creatorAdvisor.js` | — | — |
| `hubEngine.js` | (hub router) | — |
| `worldAdvisor.js` | advisor | — |
| `projectStatusEngine.js` | project-status | — |
| `nextVersionEngine.js` | next-version | — |

### 🤖 Thủ Hộ Thần V33 (5 files)
| File | Panel | Save Key |
|---|---|---|
| `thuhothanCore.js` | thuhothan | cgv6_thuhothan_core_v33 |
| `thuhothanMemory.js` | — | cgv6_thuhothan_mem_v33 |
| `thuhothanPersonality.js` | — | — |
| `eventFeedEngine.js` | — | cgv6_event_feed_v33 |
| `worldAlertEngine.js` | alerts | cgv6_world_alert_v33 |

### 👥 Multiplayer V34 (8 files)
| File | Panel | Save Key |
|---|---|---|
| `multiplayerEngine.js` | multiplayer | cgv6_mp_core_v34 |
| `multiplayerEventEngine.js` | mp-events | cgv6_mp_events_v34 |
| `accountEngine.js` | mp-account | cgv6_mp_accounts_v34 |
| `worldChatEngine.js` | world-chat | cgv6_mp_chat_v34 |
| `worldSyncEngine.js` | — | cgv6_mp_worldsync_v34 |
| `antiCheatEngine.js` | — | cgv6_mp_anticheat_v34 |
| `playerSessionManager.js` | — | cgv6_mp_sessions_v34 |
| `playerMarketplace.js` | player-market | cgv6_mp_market_v34 |

### 🌌 Multiverse V35 (8 files)
| File | Panel | Save Key |
|---|---|---|
| `multiverseEngine.js` | multiverse-v35 | cgv6_multiverse_v35 |
| `universeManager.js` | universes | cgv6_universe_manager_v35 |
| `universeRegistry.js` | — | cgv6_universe_registry_v35 |
| `multiverseMapEngine.js` | multiverse-map | cgv6_multiverse_map_v35 |
| `multiverseEconomy.js` | multiverse-economy | cgv6_multiverse_economy_v35 |
| `multiverseWarEngine.js` | universe-wars | cgv6_multiverse_war_v35 |
| `portalNetwork.js` | portals-v35 | cgv6_portal_network_v35 |
| `universeTravelEngine.js` | universe-travel | cgv6_universe_travel_v35 |

### 🌀 Timeline V36 (9 files)
| File | Panel | Save Key |
|---|---|---|
| `timelineEngine.js` | timeline-v36 | cgv6_timeline_engine_v36 |
| `timelineBranchEngine.js` | — | cgv6_timeline_branch_v36 |
| `timelineEventEngine.js` | — | cgv6_timeline_events_v36 |
| `timelineManager.js` | timeline-map-v36 | cgv6_timeline_manager_v36 |
| `timelineMergeEngine.js` | — | cgv6_timeline_merge_v36 |
| `timelineRegistry.js` | — | cgv6_timeline_registry_v36 |
| `timelineTravelEngine.js` | timeline-travel-v36 | cgv6_timeline_travel_v36 |
| `timelineWarEngine.js` | timeline-wars-v36 | cgv6_timeline_war_v36 |
| `timelineAnalytics.js` | timeline-analytics-v36 | cgv6_timeline_analytics_v36 |

### ♾️ Infinite Universe V37 (5 files)
| File | Panel | Save Key |
|---|---|---|
| `universeGeneratorEngine.js` | universe-generator-v37 | cgv6_universe_generator_v37 |
| `universeLawEngine.js` | universe-laws-v37 | cgv6_universe_laws_v37 |
| `universeLifecycleEngine.js` | — | cgv6_universe_lifecycle_v37 |
| `universeObservatoryEngine.js` | universe-observatory-v37 | cgv6_universe_observatory_v37 |

### 🌟 Civilization Evolution V38 (1 file)
| File | Panel | Save Key |
|---|---|---|
| `civEvolutionEngineV38.js` | civ-overview-v38, civ-evolution-v38, civ-tech-v38, civ-culture-v38, civ-religion-v38, civ-stats-v38 | cgv6_civ_evolution_v38 |

### ⚔️ Multiverse War V39 (4 files)
| File | Panel | Save Key |
|---|---|---|
| `multiverseWarSystemV39.js` | mv-war-v39 | cgv6_mv_war_v39 |
| `conquestSystemV39.js` | — | cgv6_mv_conquest_v39 |
| `multiverseInvasionSystemV39.js` | mv-invasion-v39 | cgv6_mv_invasion_v39 |
| `multiverseAllianceSystemV39.js` | mv-alliance-v39 | cgv6_mv_alliance_v39 |
| `multiverseWarAnalyticsV39.js` | mv-warstats-v39 | — |

### 🏭 Creator Marketplace V40 (6 files)
| File | Panel | Save Key |
|---|---|---|
| `creatorRaceFactory.js` | creator-race-v40 | cgv6_creator_race_v40 |
| `creatorGodFactory.js` | creator-god-v40 | cgv6_creator_god_v40 |
| `creatorNationFactory.js` | creator-nation-v40 | cgv6_creator_nation_v40 |
| `creatorBossFactory.js` | creator-boss-v40 | cgv6_creator_boss_v40 |
| `creatorItemFactory.js` | creator-item-v40 | cgv6_creator_item_v40 |
| `creatorUniverseFactory.js` | creator-universe-v40 | cgv6_creator_universe_v40 |

### 🤖 AI Creator Assistant V41 (7 files)
| File | Panel | Save Key |
|---|---|---|
| `creatorBrain.js` | — | — (passive) |
| `creatorAI.js` | creator-ai-v41 | cgv6_creator_ai_v41 |
| `creatorSuggestionEngine.js` | creator-sugg-v41 | cgv6_creator_sugg_v41 |
| `balanceAnalyzer.js` | creator-balance-v41 | cgv6_balance_v41 |
| `loreGenerator.js` | creator-lore-v41 | cgv6_lore_v41 |
| `eventGenerator.js` | creator-event-v41 | cgv6_event_gen_v41 |
| `creatorReports.js` | creator-reports-v41 | cgv6_creator_reports_v41 |

### 📖 Thư Viện Thần Thoại V42 (6 files)
| File | Panel | Save Key |
|---|---|---|
| `mythologyDatabase.js` | myth-database-v42 | cgv6_myth_db_v42 |
| `mythologyGodSystem.js` | myth-gods-v42 | cgv6_myth_gods_v42 |
| `mythologyCreatureSystem.js` | myth-creatures-v42 | cgv6_myth_creatures_v42 |
| `mythologyArtifactSystem.js` | myth-artifacts-v42 | cgv6_myth_artifacts_v42 |
| `mythologyLoreSystem.js` | myth-lore-v42 | cgv6_myth_lore_v42 |
| `mythologyRegistry.js` | myth-overview-v42 | — (passive) |

### 🌀 Kỷ Nguyên Thế Giới V43 — NEWEST (5 files)
| File | Panel | Save Key |
|---|---|---|
| `worldAgeEngine.js` | age-current-v43 | cgv6_world_age_v43 |
| `ageProgressionEngine.js` | age-transition-v43 | cgv6_age_prog_v43 |
| `ageEventEngine.js` | age-events-v43 | cgv6_age_events_v43 |
| `ageAnalytics.js` | age-analytics-v43 | cgv6_age_analytics_v43 |
| `ageRegistry.js` | age-current/history/transition/events/analytics-v43 | — (passive) |

### 🔧 Misc Systems (các file còn lại)
| File | Chức Năng |
|---|---|
| `mythologyEngine.js` | Tự sinh myth từ gameplay (khác V42 static DB) |
| `artifactSystem.js` | Artifact V7 |
| `artifactEvolutionEngine.js` | Artifact Evolution V2 · SAVE: cgv6_artifactEvolutionEngine_v2 |
| `legendaryArtifactEngine.js` | Legendary Artifact V1 · SAVE: cgv6_legendaryArtifactEngine |
| `heroLegendEngine.js` | Hero Legend · SAVE: cgv6_heroLegendEngine |
| `npcReputationEngine.js` | NPC Reputation · SAVE: cgv6_npcReputationEngine |
| `npcSpatialEngine.js` | NPC Spatial pathing |
| `migrationEngine.js` | Migration V1 |
| `questEngine.js` | Quest Engine V1 |
| `questSystem.js` | Quest System V2 |
| `aiStoryEngine.js` | AI Story Engine |
| `spiritBeastSystem.js` | Spirit Beast |
| `thiendinhSystem.js` | Thiên Đình System V2 |
| `cityVisualization.js` | City Visualization |
| `lodPerformanceSystem.js` | LOD Performance |
| `populationLimitSystem.js` | Population Limit |
| `timeControlSystem.js` | Time Control |
| `globalSearchSystem.js` | Global Search |
| `worldViewer3D.js` | 3D World Viewer |
| `webxrSystem.js` | WebXR VR/AR |
| `catastropheSystem.js` | Catastrophe System V1 |
| `ageEngine.js` | Age Engine V1 (6 eras, predecessor to V25) |
| `divineBeingEngine.js` | Divine Being — direct gameTick hook |

---

## 🗄️ TỔNG HỢP SAVE KEYS (115+ unique keys)

### Nhóm theo version
```
Core app keys (app.js):        cgv6_bloodlines · cgv6_empires · cgv6_kingdoms · cgv6_noble_houses
                                cgv6_rankings · cgv6_succession · cgv6_historical_timeline
Artifact keys:                  cgv6_artifactEvolutionEngine_v2 · cgv6_legendaryArtifactEngine
                                cgv6_mythologyEngine
NPC/Hero keys:                  cgv6_heroLegendEngine · cgv6_npcReputationEngine · cgv6_hereditary_bloodline
                                cgv6_living_civ_ai · cgv6_worldMemoryEngine · cgv6_technologyEngine
V25 (World Events):             cgv6_disaster_v25 · cgv6_plague_v25 · cgv6_econ_crisis_v25
                                cgv6_world_event_v25 · cgv6_age_v25
V26 (Continent):                cgv6_continent_v26 · cgv6_cont_politics · cgv6_migration_v26
V27 (Ocean):                    cgv6_naval_v27 · cgv6_naval_ocean · cgv6_oceantrade_v27
                                cgv6_fleet_v27 · cgv6_pirate_v27 · cgv6_colony_v27
V28 (Player):                   cgv6_player_v28 · cgv6_cultivation_v28 · cgv6_ascension_v28
                                cgv6_inventory_v28 · cgv6_player_quest_v28 · cgv6_player_rep_v28
                                cgv6_territory_v28
V29 (Sect):                     cgv6_sect_v29 · cgv6_sectwar_v29 · cgv6_guild_v29
V30 (Divine):                   cgv6_divine_v30 · cgv6_divinewar_v30 · cgv6_realm_v30
                                cgv6_portal_v30 · cgv6_pantheon_v30
V31 (Combat):                   cgv6_dungeon_v31 · cgv6_worldboss_v31 · cgv6_invasion_v31
                                cgv6_raid_v31 · cgv6_loot_v31 · cgv6_hunt_v31 · cgv6_bossevo_v31
V32 (Creator):                  cgv6_creator_control_v32 · cgv6_creator_analytics_v32
                                cgv6_divine_admin_v32
V33 (Guardian):                 cgv6_thuhothan_core_v33 · cgv6_thuhothan_mem_v33
                                cgv6_world_alert_v33 · cgv6_event_feed_v33
V34 (Multiplayer):              cgv6_mp_core_v34 · cgv6_mp_events_v34 · cgv6_mp_accounts_v34
                                cgv6_mp_chat_v34 · cgv6_mp_worldsync_v34 · cgv6_mp_anticheat_v34
                                cgv6_mp_sessions_v34 · cgv6_mp_market_v34
V35 (Multiverse):               cgv6_multiverse_v35 · cgv6_universe_manager_v35 · cgv6_universe_registry_v35
                                cgv6_multiverse_map_v35 · cgv6_multiverse_economy_v35
                                cgv6_multiverse_war_v35 · cgv6_portal_network_v35 · cgv6_universe_travel_v35
V36 (Timeline):                 cgv6_timeline_engine_v36 · cgv6_timeline_branch_v36 · cgv6_timeline_events_v36
                                cgv6_timeline_manager_v36 · cgv6_timeline_merge_v36
                                cgv6_timeline_registry_v36 · cgv6_timeline_travel_v36
                                cgv6_timeline_war_v36 · cgv6_timeline_analytics_v36
V37 (Universe):                 cgv6_universe_generator_v37 · cgv6_universe_laws_v37
                                cgv6_universe_lifecycle_v37 · cgv6_universe_observatory_v37
V38 (Civ Evolution):            cgv6_civ_evolution_v38
V39 (MV War):                   cgv6_mv_war_v39 · cgv6_mv_conquest_v39 · cgv6_mv_invasion_v39
                                cgv6_mv_alliance_v39
V40 (Creator Factory):          cgv6_creator_race_v40 · cgv6_creator_god_v40 · cgv6_creator_nation_v40
                                cgv6_creator_boss_v40 · cgv6_creator_item_v40 · cgv6_creator_universe_v40
V41 (AI Creator):               cgv6_creator_ai_v41 · cgv6_creator_sugg_v41 · cgv6_balance_v41
                                cgv6_lore_v41 · cgv6_event_gen_v41 · cgv6_creator_reports_v41
V42 (Mythology):                cgv6_myth_db_v42 · cgv6_myth_gods_v42 · cgv6_myth_creatures_v42
                                cgv6_myth_artifacts_v42 · cgv6_myth_lore_v42
V43 (World Age):                cgv6_world_age_v43 · cgv6_age_prog_v43 · cgv6_age_events_v43
                                cgv6_age_analytics_v43
```

---

## 🎮 GAME TICK HOOKS (73 engines)

Các engine sau đây hook vào `window.gameTick` (qua `const _orig = window.gameTick` pattern):
```
ageAnalytics.js             ageEngineV25.js             ageEventEngine.js
ageProgressionEngine.js     aiStoryEngine.js             ascensionEngine.js
bossEvolutionEngineV31.js   civEvolutionEngineV38.js     colonyEngine.js
conquestSystemV39.js        continentalPoliticsEngine.js continentEngineV26.js
creatorAI.js                cultivationPlayerEngine.js   diplomacyEngine.js
diplomaticEngine.js         disasterEngine.js            divineBeingEngine.js
divineWarEngine.js          dungeonEngineV31.js          economicCrisisEngine.js
eventFeedEngine.js          fleetEngine.js               guildEngineV29.js
invasionEngineV31.js        migrationEngineV26.js        multiplayerEngine.js
multiplayerEventEngine.js   multiverseAllianceSystemV39.js multiverseEconomy.js
multiverseEngine.js         multiverseInvasionSystemV39.js multiverseMapEngine.js
multiverseWarEngine.js      multiverseWarSystemV39.js    navalEngine.js
oceanTradeEngine.js         pantheonEngineV30.js         pirateEngine.js
plagueEngine.js             playerEngine.js              playerInventory.js
playerQuestSystem.js        playerReputationEngine.js    playerTerritorySystem.js
portalEngineV30.js          portalNetwork.js             raidEngineV31.js
realmEngineV30.js           sectEngineV29.js             sectWarEngineV29.js
thuhothanCore.js            timelineAnalytics.js         timelineBranchEngine.js
timelineEngine.js           timelineEventEngine.js       timelineManager.js
timelineMergeEngine.js      timelineRegistry.js          timelineTravelEngine.js
timelineWarEngine.js        universeGeneratorEngine.js   universeLawEngine.js
universeLifecycleEngine.js  universeManager.js           universeObservatoryEngine.js
universeRegistry.js         universeTravelEngine.js      worldAgeEngine.js
worldAlertEngine.js         worldBossEngineV31.js        worldChatEngine.js
worldEventEngineV25.js      worldSyncEngine.js
```

---

## 🗂️ HUB STRUCTURE (hubEngine.js + mvHubRenderPanel)

### Sidebar Hubs (8 hubs — KHÔNG thêm mới)
| Hub ID | Icon | Tabs |
|---|---|---|
| `diplomacy-hub-v24` | 🤝 | alliance · treaties · sanctions · world-council · diplomacy-v24 · intl-relations |
| `event-hub-v25` | ⚡ | world-event-v25 · disaster · plague · econ-crisis · age-v25 |
| `continent-hub-v26` | 🌍 | continent-v26 · cont-politics · migration-v26 · colonies |
| `ocean-hub-v27` | 🌊 | naval-v27 · naval-ocean · ocean-v27 · pirates |
| `player-hub-v28` | 👤 | player-v28 · cultivation-v28 · ascension-v28 · inventory-v28 · player-quest-v28 |
| `cultivation-hub-v29` | ⚗️ | sect-v29 · sect-war-v29 · guild-v29 · disciples-v29 · techniques-v29 |
| `divine-hub-v30` | 🏛️ | divine-v30 · divinewar-v30 · realm-v30 · portal-v30 · pantheon-v30 · divine-admin · divine-history-v30 · domain-v30 |
| `combat-hub-v31` | ⚔️ | dungeon-v31 · worldboss-v31 · invasion-v31 · raid-v31 · loot-v31 · hunt-v31 |
| `creator-hub-v32` | 👁️ | creator-control · creator-analytics · creator-god-v40 · creator-race-v40 · creator-nation-v40 · creator-boss-v40 · creator-item-v40 · creator-universe-v40 · creator-library-v40 · creator-ai-v41 · creator-balance-v41 · creator-sugg-v41 · creator-lore-v41 · creator-event-v41 · creator-reports-v41 · **myth-overview-v42 · myth-gods-v42 · myth-creatures-v42 · myth-artifacts-v42 · myth-lore-v42 · myth-database-v42** (22 tabs tổng) |
| `guardian-hub-v33` | 🤖 | thuhothan · advisor |
| `multiverse-hub-v35` | 🌌 | (inline render, không dùng hubEngine) — V35 Multiverse · V36 Timeline · V37 Universe · V38 CivEvo · V39 MV War · **V43 World Age** |

---

## 🌌 MULTIVERSE HUB V35 — Inline Sections

Render qua `window.mvHubRenderPanel` được định nghĩa inline trong `index.html` (không qua hubEngine.js):

| Section | Version | Panels Liên Kết |
|---|---|---|
| Multiverse Portal Network | V35 | multiverse-v35 · portals-v35 · universes · universe-wars · universe-rankings · multiverse-map · universe-travel · multiverse-economy |
| Alternate Timeline System | V36 | timeline-v36 · timeline-map-v36 · timeline-wars-v36 · timeline-travel-v36 · timeline-analytics-v36 |
| Infinite Universe Generator | V37 | universe-generator-v37 · universe-laws-v37 · universe-observatory-v37 |
| Tiến Hóa Nền Văn Minh AI | V38 | civ-overview-v38 · civ-evolution-v38 · civ-tech-v38 · civ-culture-v38 · civ-religion-v38 · civ-stats-v38 |
| Chiến Tranh Đa Vũ Trụ | V39 | mv-war-v39 · mv-alliance-v39 · mv-invasion-v39 · mv-warmap-v39 · mv-warstats-v39 |
| **Kỷ Nguyên Thế Giới** | **V43** | **age-current-v43 · age-history-v43 · age-transition-v43 · age-events-v43 · age-analytics-v43** |

---

## 🔑 GLOBAL API FUNCTIONS (quan trọng nhất)

```javascript
// Core
window.gameTick()                  // Main tick — hook via _orig pattern
window.year                        // Current simulation year
window.world                       // World state object
window.npcs                        // NPC array
window.countries                   // Nations array
window.warsActive                  // Active wars array

// History & Memory
window.htAddEvent({year,type,title,color})           // → Historical Timeline
window.wmeAddMemory({year,category,title,content})   // → World Memory
window.waeAddAlert({type,message,color})             // → World Alert Engine

// Diplomacy
window.drGetRelation(a, b)         // Điểm quan hệ 2 thế lực
window.aeAreAllied(a, b)           // Kiểm tra liên minh (boolean)
window.teHasTreaty(a, b, type)     // Kiểm tra hiệp ước

// Kingdoms/Empires (V33 Array Safety!)
window.kingdomData.kingdoms        // Có thể là Object — dùng Array.isArray()!
window.empireData.empires          // Có thể là Object — dùng Array.isArray()!

// Multiverse
window.mvData.universes            // Array vũ trụ
window.pnGetOpenPortals()          // Cổng portal đang mở
window.mv39DeclareWar(a,b,type)    // Khai chiến đa vũ trụ

// V43 World Age
window.waeGetCurrentAge()          // Kỷ nguyên hiện tại
window.waeForceAge(id)             // Chuyển kỷ nguyên thủ công
window.waeGetHistory()             // Lịch sử chuyển đổi
window.apeGetProgress(ageId)       // Điểm sẵn sàng 0-100
window.apeGetConditionDetail(id)   // Chi tiết điều kiện
window.aeeFireEvent(ageId)         // Kích hoạt sự kiện kỷ nguyên
window.aanGetStats()               // Thống kê kỷ nguyên
window.aanGetForecast()            // Dự báo kỷ nguyên tiếp theo

// V42 Mythology
window.mdbGetPantheons()           // 10 hệ thần thoại
window.mgsGetAll()                 // Tất cả thần linh
window.mcsGetAll()                 // Tất cả sinh vật
window.masGetAll()                 // Tất cả thánh vật
window.mlsGetAll()                 // Tất cả truyền thuyết
```

---

## ⚠️ LƯU Ý QUAN TRỌNG CHO AGENT

1. **Array Safety (V33):** `kingdomData.kingdoms` và `empireData.empires` CÓ THỂ là Object thay vì Array. Luôn dùng `Array.isArray(x) ? x : Object.values(x||{})` trước khi `.filter()`.

2. **gameTick Hook Pattern:** Luôn dùng:
   ```javascript
   const _orig = window.gameTick;
   window.gameTick = function() { if (_orig) _orig(); myTick(); };
   ```

3. **Init Timing (staggered):** V43 dùng timeout 2900ms–3300ms. V44 trở đi dùng 3400ms+.

4. **UI Rule (V38+):** KHÔNG tạo tab sidebar mới. Mọi UI mới phải vào hub hiện có:
   - Creator God features → `creator-hub-v32`
   - Multiverse/Universe features → `multiverse-hub-v35` (inline section)

5. **Multiverse Hub:** `mvHubRenderPanel` là inline JS trong `index.html` dòng ~3184. KHÔNG nằm trong `hubEngine.js`. Thêm section mới VÀO TRƯỚC dòng `+'</div>';` cuối cùng.

6. **IIFE Required:** Mọi engine mới phải bọc trong `(function(){ "use strict"; ... })();`

7. **No Duplicate:** Trước khi tạo file mới, kiểm tra file tương tự đã tồn tại chưa (vd: ageEngineV25.js ≠ worldAgeEngine.js V43).

---

## 📁 FILE STATUS SUMMARY

| Trạng Thái | Số Lượng | Chi Tiết |
|---|---|---|
| **Active game files** | 184 | Tất cả được load trong index.html |
| **Server file** | 1 | serve.js (Node.js HTTP server) |
| **Dormant game files** | 0 | Không có file game nào bị bỏ quên |
| **Tổng trên disk** | 185 | — |

---

*Audit tự động từ quét mã nguồn thực — ngày 2026-06-13 — V43*
