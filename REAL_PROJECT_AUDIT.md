# REAL PROJECT AUDIT — Creator God V6
> Tạo bằng cách quét mã nguồn thực tế — KHÔNG dựa vào next-version.md
> Ngày audit: 2026-06-13 (cập nhật sau V51 — Creator God Online)
> Phương pháp: Quét toàn bộ *.js, index.html, localStorage keys, gameTick hooks

---

## 📊 TỔNG QUAN SỐ LIỆU

| Chỉ Số | V50 | V51 (Mới) |
|---|---|---|
| **Tổng file .js trên disk** | 206 | **212** |
| **Tổng file được load trong index.html** | 205 | **211** |
| **File dormant** | 1 (serve.js) | **1 (serve.js)** |
| **Tổng panel divs trong HTML** | 204 | **210** |
| **Tổng nav buttons (data-panel)** | 67 | **67** |
| **Tổng localStorage save keys (unique)** | 130+ | **134+** |
| **Engine hook vào gameTick** | 90 | **93** |
| **Phiên bản hiện tại** | V50 | **V51 — Creator God Online** |

---

## ✅ HỆ THỐNG ĐÃ TRIỂN KHAI ĐẦY ĐỦ

### 👁️ Creator God Online V51 ← NEWEST (6 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `creatorAuthorityEngineV51.js` | 5 Sắc Lệnh · 5 Ban Phước · 4 Trừng Phạt · Thiên Năng system | `cgv6_creator_authority_v51` | 6200ms |
| `miracleSystemV51.js` | 8 Phép Màu · Cooldown · Effect persistence (expiresYear) | `cgv6_miracle_v51` | 6300ms |
| `prophecySystemV51.js` | 4 loại Tiên Tri · Auto-subject · Auto-fulfill theo year | `cgv6_prophecy_v51` | 6400ms |
| `globalEventControlV51.js` | 7 Sự Kiện Toàn Cầu · Duration · htAddEvent integration | `cgv6_global_event_v51` | 6500ms |
| `godAuditPanelV51.js` | Audit 58 hệ thống · Save Inspector · Jarvis God Mode | Passive | 6600ms |
| `creatorDashboardV51.js` | Patches creator-hub-v32 · 6 tabs | Passive | 6700ms |

**Global Objects:** `window.creatorAuthorityV51Data` · `window.miracleV51Data` · `window.prophecyV51Data` · `window.globalEventV51Data`
**Public API:**
- Authority: `cgv51IssueDecree(typeId, target)` · `cgv51BlessEntity(typeId, target)` · `cgv51CurseEntity(typeId, target)` · `cgv51GetEnergy()` · `cgv51GetMaxEnergy()` · `cgv51GetDecreeTypes()` · `cgv51GetBlessingTypes()` · `cgv51GetCurseTypes()` · `cgv51GetStats()`
- Miracle: `cgv51CastMiracle(typeId, target)` · `cgv51GetActiveEffects()` · `cgv51GetMiracleHistory()` · `cgv51GetMiracleStats()` · `cgv51GetMiracleTypes()`
- Prophecy: `cgv51CreateProphecy(typeId, subject, text)` · `cgv51AutoGenerateProphecy()` · `cgv51FulfillProphecy(id)` · `cgv51GetActiveProphecies()` · `cgv51GetFulfilledProphecies()` · `cgv51GetProphecyStats()` · `cgv51GetProphecyTypes()`
- Global Events: `cgv51TriggerGlobalEvent(typeId)` · `cgv51GetActiveGlobalEvents()` · `cgv51GetEventHistory()` · `cgv51GetGlobalEventStats()` · `cgv51GetGlobalEventTypes()`
- Audit: `cgv51GetAuditSystems()` · `cgv51GetAuditStats()` · `cgv51GetSaveReport()` · `cgv51GetJarvisReport()`
- Dashboard Quick: `v51QuickMiracle(typeId)` · `v51QuickEvent(typeId)` · `v51QuickProphecy()`

**UI:** 6 tabs trong creator-hub-v32 · 6 panel divs (panel-god-mode/divine-will/miracles/prophecies/world-events/god-audit-v51)

---

### 🏛️ Chính Trị AI V49 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `governmentSystemV49.js` | 8 chế độ · Leaders 6 stats · 8 personality traits · Succession · Gov Transitions | `cgv6_government_v49` | 5400ms |
| `politicalFactionV49.js` | 5 phe phái · Power Struggle · Coalition Formation · Legislation Passing | `cgv6_faction_v49` | 5500ms |
| `politicalCrisisV49.js` | 5 khủng hoảng · 4 cấp độ · auto-trigger stability/age/disaster · Resolution | `cgv6_crisis_v49` | 5600ms |
| `politicsRegistryV49.js` | Hub Widget · 6 Sub-Panels (Tổng Quan/Chính Phủ/Phe Phái/Ngoại Giao/Gián Điệp/Khủng Hoảng) | Passive | 5700ms |

**Global Objects:** `window.govV49Data` · `window.factionV49Data` · `window.crisisV49Data`
**Public API:**
- Gov: `govV49AssignGovernment(id, name, type, govTypeId)` · `govV49TriggerTransition(entityId, newTypeId, reason)` · `govV49TriggerSuccession(entityId)` · `govV49GetAll()` · `govV49GetLeader(entityId)` · `govV49GetStats()` · `govV49GetTypes()` · `govV49GetTraits()`
- Faction: `facV49GetEntity(entityId)` · `facV49GetAll()` · `facV49GetEvents()` · `facV49GetStats()` · `facV49GetTypes()` · `facV49TriggerStruggle(entityId)`
- Crisis: `criV49Trigger(typeId, entityName, sevIdx, reason)` · `criV49Resolve(crisisId, resolutionIdx)` · `criV49GetActive()` · `criV49GetHistory()` · `criV49GetStats()` · `criV49GetTypes()`
- UI: `politicsV49HubRenderPanel()` · `politicsV49RenderPanel(tab)` (tabs: overview/government/factions/diplomacy/espionage/crisis)

**UI Panel:** `panel-politics-v49` (main) + 5 sub-panels (panel-government-v49, panel-faction-v49, panel-diplomacy-v49, panel-espionage-v49, panel-political-crisis-v49)
**Extends (KHÔNG sửa):** `continentalPoliticsEngine.js` · `espionageEngine.js` · `diplomaticEngine.js` · `kingdomAI.js` · `empireAI.js` · `livingCivilizationAI.js`
**Integration:** `politicalCrisisV49.js` auto-trigger protest từ `disasterData.activeDisasters` (V48) · Reads `drData` (diplomaticEngine) · Reads `cgv6_espionage` localStorage
**8 Chế Độ:** MONARCHY(👑) · EMPIRE(🏛️) · REPUBLIC(🗳️) · THEOCRACY(⛪) · ARISTOCRACY(🎭) · FEDERATION(🔗) · COUNCIL(👥) · CUSTOM(⚙️)
**5 Phe Phái:** CONSERVATIVE(🏰) · REFORMIST(📜) · MILITARIST(⚔️) · RELIGIOUS(⛪) · MERCHANT(💰)
**5 Khủng Hoảng:** COUP(⚔️) · CIVIL_WAR(🔥) · PROTEST(✊) · SUCCESSION_CRISIS(👑) · SECESSION(🗺️)
**8 Leader Traits:** AMBITIOUS · DIPLOMATIC · MILITARIST · CORRUPT · REFORMIST · ISOLATIONIST · EXPANSIONIST · PIOUS

### 🌋 Thiên Tai & Thảm Họa Toàn Cầu V48 (4 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `globalDisasterCoreV48.js` | Chain Reaction 9 loại · Thiên Thạch · Băng Hà · AI Response 6 loại · Warning System | `cgv6_global_disaster_v48` | 5000ms |
| `anomalyEngineV48.js` | 6 Dị Tượng: Cổng KG · Mưa TL · Dị Giới · Thần Linh · Ma Giới · Biến Dạng TG | `cgv6_anomaly_v48` | 5100ms |
| `multiverseDisasterV48.js` | 4 Thảm Họa Đa Vũ Trụ: Sụp Đổ · Va Chạm · Nứt TG · Bão KTG | `cgv6_mv_disaster_v48` | 5200ms |
| `disasterRegistryV48.js` | Hub Widget · 6 Sub-Panels (Thiên Tai/Đại Dịch/Dị Tượng/Khủng Hoảng/Cảnh Báo/Thống Kê) | Passive | 5300ms |

**Global Objects:** `window.globalDisasterV48Data` · `window.anomalyV48Data` · `window.mvDisasterV48Data`
**Public API:** `gdV48TriggerNewDisaster(typeId, region, sev)` · `gdV48TriggerGlobal(typeId)` · `gdV48GetStats()` · `gdV48GetWarnings()` · `gdV48GetAIResponses()` · `gdV48GetChainQueue()` · `anomV48Trigger(typeId, region)` · `anomV48GetActive()` · `anomV48GetHistory()` · `anomV48GetStats()` · `mvdV48Trigger(typeId, univId, sev)` · `mvdV48GetActive()` · `mvdV48GetHistory()` · `mvdV48GetStats()` · `disasterV48HubRenderPanel()` · `disasterV48RenderPanel(tab)`
**UI Panel:** `panel-disaster-v48` (main) + 5 sub-panels (panel-plague-v48, panel-anomaly-v48, panel-crisis-v48, panel-warnings-v48, panel-disaster-stats-v48)
**Extends (KHÔNG sửa):** `disasterEngine.js` V25 · `plagueEngine.js` V25 · `economicCrisisEngine.js` V25 · `ecoDisasterEngine.js` V45
**Chain Reactions:** EQ→TSUNAMI(45%) · EQ→VOLCANO(30%) · VOLCANO→DROUGHT(55%) · VOLCANO→FLOOD(35%) · FLOOD→PLAGUE(40%) · DROUGHT→RECESSION(35%) · METEORITE→EQ(70%) · METEORITE→ICE_AGE(50%) · ICE_AGE→RECESSION(30%)

### ⚔️ Anh Hùng & Huyền Thoại V47 (3 files)
| File | Hệ Thống | Save Key | Init |
|---|---|---|---|
| `legendEngineV47.js` | Sử Thi · Truyền Thuyết · Lời Tiên Tri · Biên Niên Sử | `cgv6_legend_v47` | 4400ms |
| `fameSystemV47.js` | Danh Tiếng 3 Cấp · 10 Archetypes · Legacy 6 Loại · AI Journey · Kình Địch | `cgv6_fame_v47` | 4500ms |
| `heroRegistryV47.js` | Hub Widget · 6 Sub-Panels (heroes/epics/folklore/fame/legacy/rankings) | Passive | 4600ms |

**Global Objects:** `window.legendV47Data` · `window.fameV47Data`
**Public API:** `legV47GetEpics()` · `legV47GetFolklore()` · `legV47GetProphecies()` · `fv47GetProfiles()` · `fv47GetHeroes()` · `fv47GetVillains()` · `fv47GetLegacies()` · `fv47GetTopByFame(type, limit)` · `heroV47HubRenderPanel()` · `heroV47RenderPanel(tab)`
**UI Panel:** `panel-hero-v47` (main) + 5 sub-panels (panel-epics-v47, panel-folklore-v47, panel-fame-v47, panel-legacy-v47, panel-hero-rankings-v47)
**Extends:** `heroLegendEngine.js` (không sửa) — đọc heroLegendData.heroes

### 🔷 Core Engine (6 files)
| File | Chức Năng |
|---|---|
| `app.js` | Core loop · NPC/Sect/Country · Save/Load · gameTick chính |
| `worldTemplates.js` | World initialization templates |
| `worldHub.js` | World Hub V6 · Multi-world UI |
| `multiWorldSystem.js` | Multi-world management |
| `living-world-engine.js` | NPC soul/ambition/memory AI |
| `saveManager.js` | Save/Load manager V1 |

### 💰 Economy (5 files)
`economySystem.js` · `economyEngine.js` · `economyEngineV2.js` · `economyAuditSystem.js` · `worldMarketplace.js`

### ⚔️ War & Territory (3 files)
`warEngine.js` · `territorySystem.js` · `territoryWarSystem.js`

### 🤝 Diplomacy V1 (2 files)
`diplomaticEngine.js` · `espionageEngine.js`

### 🤝 Diplomacy V24 (5 files)
`allianceEngine.js` · `treatyEngine.js` · `sanctionEngine.js` · `worldCouncilEngine.js` · `diplomacyEngine.js`

### 👑 Empire & Kingdom V23 (11 files)
`kingdomEngine.js` · `kingdomAI.js` · `empireEngine.js` · `empireAI.js` · `successionEngine.js`
`nobleHouseEngine.js` · `dynastyEngine.js` · `dynastySystem.js` · `bloodlineEngine.js`
`hereditaryBloodlineEngine.js` · `livingCivilizationAI.js`

### 🌍 World Simulation (14 files)
`worldEventEngine.js` · `worldEventEngineV25.js` · `worldMemoryEngine.js` · `worldAlertEngine.js`
`worldStorySystem.js` · `worldMapSystem.js` · `historicalTimeline.js` · `rankingsEngine.js`
`technologyEngine.js` · `politicalReligionEngine.js` · `cultureHeritageEngine.js`
`religionEngine.js` · `emergentCivilization.js` · `aiWorldGenerator.js`

### 🌋 World Events V25 (5 files) — WORLD-SCALE
`disasterEngine.js` · `plagueEngine.js` · `economicCrisisEngine.js` · `worldEventEngineV25.js` · `ageEngineV25.js`
> ⚠️ V25 = civilization-scale impact. KHÁC với ecoDisasterEngine.js V45 (ecosystem-scale)

### 🌍 Continent V26 (4 files)
`continentEngineV26.js` · `continentEngine.js` · `continentalPoliticsEngine.js` · `migrationEngineV26.js`

### 🌊 Ocean V27 (6 files)
`navalOceanEngine.js` · `navalEngine.js` · `oceanTradeEngine.js` · `fleetEngine.js` · `pirateEngine.js` · `colonyEngine.js`

### 🧘 Player V28 (14 files)
`playerEngine.js` · `playerSystem.js` · `cultivationPlayerEngine.js` · `ascensionEngine.js`
`playerInventory.js` · `playerQuestSystem.js` · `playerReputationEngine.js` · `playerTerritorySystem.js`
`playerMarketplace.js` · `playerPresenceEngine.js` · `playerSessionManager.js`
`playerAdvisor.js` · `autoPlayerAI.js` · `progressionSystem.js`

### ⛩️ Sect V29 (3 files)
`sectEngineV29.js` · `sectWarEngineV29.js` · `guildEngineV29.js`

### 🏛️ Divine V30 (7 files)
`pantheonEngineV30.js` · `divineBeingEngine.js` · `divineWarEngine.js` · `realmEngineV30.js`
`portalEngineV30.js` · `heavenlyDaoEngine.js` · `divineAdministration.js`

### ⚔️ Combat V31 (8 files)
`dungeonEngineV31.js` · `dungeonSystem.js` · `worldBossEngineV31.js` · `invasionEngineV31.js`
`raidEngineV31.js` · `lootEngineV31.js` · `legendaryHuntEngineV31.js` · `bossEvolutionEngineV31.js`

### 👁️ Creator God V32 (9 files)
`creatorGodEngine.js` · `creatorGodControl.js` · `creatorAnalytics.js` · `creatorLibrary.js`
`creatorAdvisor.js` · `hubEngine.js` · `worldAdvisor.js` · `projectStatusEngine.js` · `nextVersionEngine.js`

### 🤖 Thủ Hộ Thần V33 (5 files)
`thuhothanCore.js` · `thuhothanMemory.js` · `thuhothanPersonality.js` · `eventFeedEngine.js` · `worldAlertEngine.js`

### 👥 Multiplayer V34 (8 files)
`multiplayerEngine.js` · `multiplayerEventEngine.js` · `accountEngine.js` · `worldChatEngine.js`
`worldSyncEngine.js` · `antiCheatEngine.js` · `playerSessionManager.js` · `playerMarketplace.js`

### 🌌 Multiverse V35 (8 files)
`multiverseEngine.js` · `universeManager.js` · `universeRegistry.js` · `multiverseMapEngine.js`
`multiverseEconomy.js` · `multiverseWarEngine.js` · `portalNetwork.js` · `universeTravelEngine.js`

### 🌀 Timeline V36 (9 files)
`timelineEngine.js` · `timelineBranchEngine.js` · `timelineEventEngine.js` · `timelineManager.js`
`timelineMergeEngine.js` · `timelineRegistry.js` · `timelineTravelEngine.js`
`timelineWarEngine.js` · `timelineAnalytics.js`

### ♾️ Infinite Universe V37 (4 files)
`universeGeneratorEngine.js` · `universeLawEngine.js` · `universeLifecycleEngine.js` · `universeObservatoryEngine.js`

### 🌟 Civilization Evolution V38 (1 file)
`civEvolutionEngineV38.js`

### ⚔️ Multiverse War V39 (5 files)
`multiverseWarSystemV39.js` · `conquestSystemV39.js` · `multiverseInvasionSystemV39.js`
`multiverseAllianceSystemV39.js` · `multiverseWarAnalyticsV39.js`

### 🏭 Creator Marketplace V40 (6 files)
`creatorRaceFactory.js` · `creatorGodFactory.js` · `creatorNationFactory.js`
`creatorBossFactory.js` · `creatorItemFactory.js` · `creatorUniverseFactory.js`

### 🤖 AI Creator Assistant V41 (7 files)
`creatorBrain.js` · `creatorAI.js` · `creatorSuggestionEngine.js` · `balanceAnalyzer.js`
`loreGenerator.js` · `eventGenerator.js` · `creatorReports.js`

### 📖 Thư Viện Thần Thoại V42 (6 files)
`mythologyDatabase.js` · `mythologyGodSystem.js` · `mythologyCreatureSystem.js`
`mythologyArtifactSystem.js` · `mythologyLoreSystem.js` · `mythologyRegistry.js`

### 🌀 Kỷ Nguyên Thế Giới V43 (5 files)
| File | Save Key |
|---|---|
| `worldAgeEngine.js` | cgv6_world_age_v43 |
| `ageProgressionEngine.js` | cgv6_age_prog_v43 |
| `ageEventEngine.js` | cgv6_age_events_v43 |
| `ageAnalytics.js` | cgv6_age_analytics_v43 |
| `ageRegistry.js` | — |

### 🧬 Chủng Tộc Tiến Hóa V44 (5 files)
| File | Save Key |
|---|---|
| `raceEvolutionCore.js` | cgv6_race_evo_core_v44 |
| `raceAbilityEngine.js` | cgv6_race_ability_v44 |
| `raceWarEngine.js` | cgv6_race_war_v44 |
| `raceRelationEngine.js` | cgv6_race_relation_v44 |
| `raceEvolutionRegistry.js` | — |

### 🌿 Hệ Sinh Thái Thế Giới V45 — NEWEST (5 files)
| File | Chức Năng | Save Key |
|---|---|---|
| `ecoClimateEngine.js` | 8 khí hậu · 4 mùa · effects · V43 age sync | cgv6_eco_climate_v45 |
| `ecoResourceEngine.js` | 5 tài nguyên · regen · trade routes | cgv6_eco_resource_v45 |
| `ecoCreatureEngine.js` | 20 sinh vật · food chain · extinction | cgv6_eco_creature_v45 |
| `ecoDisasterEngine.js` | 5 thiên tai eco-scale · auto-trigger | cgv6_eco_disaster_v45 |
| `ecoRegistry.js` | 6 panels · ecoHubRenderPanel() · ecoRenderPanel(id) | — |

**Panel IDs:** `panel-eco-overview-v45` · `panel-eco-climate-v45` · `panel-eco-seasons-v45` · `panel-eco-creatures-v45` · `panel-eco-resources-v45` · `panel-eco-disasters-v45`

**UI Location:** Section trong mvHubRenderPanel (inline index.html ~dòng 3352) — KHÔNG tạo tab sidebar mới

---

## 🗄️ SAVE KEYS NHÓM V45–V49

```
V45 (Ecosystem):    cgv6_eco_climate_v45 · cgv6_eco_resource_v45
                    cgv6_eco_creature_v45 · cgv6_eco_disaster_v45
V47 (Hero):         cgv6_legend_v47 · cgv6_fame_v47
V48 (Disaster):     cgv6_global_disaster_v48 · cgv6_anomaly_v48 · cgv6_mv_disaster_v48
V49 (Politics):     cgv6_government_v49 · cgv6_faction_v49 · cgv6_crisis_v49
```

*(Các keys V25–V44 xem grep SAVE_KEY *.js)*

---

## 🎮 GAME TICK HOOKS V49 (3 engines mới)

```
governmentSystemV49.js  — mỗi 30 ticks (AI decisions, succession, aging)
politicalFactionV49.js  — mỗi 40 ticks (power struggle, coalition, legislation)
politicalCrisisV49.js   — mỗi 40 ticks (auto-trigger, expire crises)
```

**Tổng cộng: 90 engines hook vào gameTick**

---

## 🌿 V45 GLOBAL API FUNCTIONS

```javascript
// Climate
window.ecoGetClimates()              // Tất cả 8 khí hậu + custom
window.ecoGetClimate(id)             // Khí hậu theo ID
window.ecoGetCurrentClimate()        // Khí hậu hiện tại { name, icon, color, ... }
window.ecoSetClimate(id)             // Thay đổi khí hậu (ghi history)
window.ecoAddCustomClimate(obj)      // Tạo khí hậu tùy chỉnh → return id
window.ecoGetSeasons()               // 4 mùa
window.ecoGetCurrentSeason()         // Mùa hiện tại { name, icon, bonuses }
window.ecoGetEffects()               // { popBonus, agriBonus, econBonus, warBonus, climate, season }

// Resources
window.ecoGetResources()             // Tất cả tài nguyên { current, max, regen, depleted }
window.ecoGetResource(id)            // Tài nguyên theo id
window.ecoGetResourceTypes()         // 5 loại tài nguyên (metadata)
window.ecoExtractResource(id, amt)   // Khai thác → return amount extracted
window.ecoAddTradeRoute(rid, amt, target) // Tuyến thương mại
window.ecoGetResourceStats()         // { total, thriving, depleted, byClimate }

// Creatures
window.ecoGetCreatures()             // Tất cả sinh vật (kể cả đã tuyệt chủng)
window.ecoGetCreature(id)            // Sinh vật theo id
window.ecoGetAliveCreatures()        // Chỉ sinh vật còn sống
window.ecoGetCreaturesByClimate(id)  // Lọc theo khí hậu
window.ecoGetCreaturesByEra(id)      // Lọc theo kỷ nguyên V43
window.ecoHuntCreature(predId, preyId) // Săn mồi thủ công
window.ecoGetFoodChain()             // Danh sách quan hệ predator→prey
window.ecoGetCreatureStats()         // { alive, extinct, endangered, totalPop, total }

// Disasters
window.ecoGetDisasterTypes()         // 5 loại thiên tai (metadata)
window.ecoGetActiveDisasters()       // Thiên tai đang diễn ra
window.ecoGetDisasterHistory()       // Lịch sử 40 vụ gần nhất
window.ecoTriggerDisaster(id, sev)   // Kích hoạt thủ công (sev: 0-3)
window.ecoGetDisasterStats()         // { total, active, byType }

// UI
window.ecoRenderPanel(panelId)       // Render sub-panel theo ID
window.ecoHubRenderPanel()           // Widget HTML cho mvHubRenderPanel
```

---

## 🗂️ HUB STRUCTURE — Multiverse Hub V35

### mvHubRenderPanel Sections (inline index.html ~dòng 3244)
| Section | Version | Widget Function |
|---|---|---|
| Multiverse Portal | V35 | (built-in) |
| Timeline | V36 | (built-in) |
| Universe Generator | V37 | (built-in) |
| CivEvo | V38 | (built-in) |
| MV War | V39 | (built-in) |
| World Age | V43 | `waeHubRenderPanel()` |
| Race Evolution | V44 | `recHubRenderPanel()` |
| Hệ Sinh Thái | V45 | `ecoHubRenderPanel()` |
| Anh Hùng & Huyền Thoại | V47 | `heroV47HubRenderPanel()` |
| Thiên Tai & Thảm Họa | V48 | `disasterV48HubRenderPanel()` |
| **Chính Trị AI** | **V49** | **`politicsV49HubRenderPanel()`** |

---

## ⚠️ LƯU Ý QUAN TRỌNG CHO AGENT

1. **Array Safety (V33):**
   ```javascript
   Array.isArray(x) ? x : Object.values(x||{})
   ```

2. **gameTick Hook Pattern:**
   ```javascript
   const _orig = window.gameTick;
   window.gameTick = function() { if (_orig) _orig(); myTick(); };
   ```

3. **Init Timing (staggered):**
   - V43: 2900ms–3300ms
   - V44: 3400ms–3800ms
   - V45: 3900ms–4300ms
   - V47: 4400ms–4600ms
   - V48: 5000ms–5300ms
   - **V49: 5400ms–5700ms**
   - **V50 trở đi: 5800ms+**

4. **UI Rule (V38+):** KHÔNG tạo tab sidebar mới. Mọi UI → hub hiện có (mvHubRenderPanel).

5. **V49 Politics Scope:**
   - `continentalPoliticsEngine.js` V26 = continental-scale (lục địa)
   - `governmentSystemV49.js` V49 = per-entity (kingdom/empire/country mỗi thực thể riêng)

6. **V49 Crisis Integration:**
   - `politicalCrisisV49.js` đọc `disasterData.activeDisasters` → auto-trigger protest
   - Auto-trigger succession khi `gov.leader.age > 75`
   - Auto-trigger crisis khi `country.stability < 30`

7. **Multiverse Hub:** mvHubRenderPanel là **inline JS trong index.html** ~dòng 3244, KHÔNG trong hubEngine.js. Thêm section VÀO TRƯỚC `+'</div>';` cuối cùng.

8. **V49 espionage reading:** `politicsRegistryV49.js` đọc trực tiếp từ `localStorage.getItem("cgv6_espionage")` — KHÔNG gọi hàm espionageEngine vì state là private closure.

---

## 📁 FILE STATUS SUMMARY

| Trạng Thái | Số Lượng |
|---|---|
| **Active game files (loaded in index.html)** | 205 |
| **Server file** | 1 (serve.js) |
| **Tổng trên disk** | 206 |

---

*Audit tự động từ quét mã nguồn thực — ngày 2026-06-13 — V49*
