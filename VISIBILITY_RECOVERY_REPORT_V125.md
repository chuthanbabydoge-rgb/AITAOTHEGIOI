# VISIBILITY RECOVERY REPORT — V125
**Creator God V6 — Nền Tảng Đa Thế Giới**
**Ngày tạo:** 2026-06-18
**Phương pháp:** Audit thực tế từ GAMEPLAY_AUDIT_V124, TOP_20_WORKING/NON_WORKING, DORMANT_SYSTEMS_ACTIVATION_REPORT, browser console logs, và source tracing
**Tổng file JS đã load:** 456+

---

## 1. SYSTEMS CONNECTED TO UI

### ✅ CÓ UI ĐẦY ĐỦ — PLAYER NHÌN THẤY & TƯƠNG TÁC ĐƯỢC

| # | Hệ Thống | UI Location | Nav Path |
|---|---|---|---|
| 1 | NPC Lifecycle (app.js) | Panel NPC list, combat log | Tab Nhân Vật / Thế Giới |
| 2 | warEngine.js | War panel — active wars, battle outcomes | Tab Chiến Tranh |
| 3 | economyEngine.js + economySystem.js | Economy tab — country wealth/resources | Tab Kinh Tế |
| 4 | technologyEngine.js | Tech panel — tech levels per country | Tab Công Nghệ |
| 5 | religionEngine.js | Religion panel — faith distribution | Tab Tôn Giáo |
| 6 | mythologyEngine.js | Mythology panel — myth database, legends | Tab Thần Thoại |
| 7 | emergentCivilization.js | Civilization summary in PUOS | PUOS → Civilization |
| 8 | sectEngineV29.js + sectWarEngineV29.js | Sect panel — resources, disciples, sect wars | Tab Môn Phái |
| 9 | guildEngineV29.js + guildCoreV53.js | Guild panel — 6 tabs (Bang Hội/Liên Minh/Đế Quốc/Lãnh Thổ/Chiến Tranh/BXH) | Player Hub → Bang Hội |
| 10 | invasionEngineV31.js | World boss panel — invasions, casualties | Tab Xâm Lược |
| 11 | disasterEngine.js + plagueEngine.js | Disaster alert panel, country pop drops | Tab Thảm Họa |
| 12 | worldEventEngineV25.js + ageEngineV25.js | Event log — coups, revolutions, era transitions | Tab Sự Kiện |
| 13 | continentEngineV26.js | Continental events in timeline | Tab Đại Lục |
| 14 | allianceEngine.js + treatyEngine.js + sanctionEngine.js | Diplomacy hub — Alliance, Treaty, Sanction panels | Tab Ngoại Giao V24 |
| 15 | worldCouncilEngine.js | World council votes, resolutions | Tab Hội Đồng |
| 16 | heavenlyDaoEngine.js | Karma events, divine judgements in log | Tab Thiên Đạo |
| 17 | historicalTimeline.js | Full scrollable history — filterable | Tab Lịch Sử |
| 18 | worldMemoryEngine.js | NPC revenge quests, grudge flags | NPC Profile |
| 19 | eventFeedEngine.js | "World News" live headlines panel | Tab Tin Tức |
| 20 | raceWarEngine.js | Race conflict panel | Tab Chủng Tộc |
| 21 | multiverseWarEngine.js | Multiverse war panel — SVG war map | Multiverse Hub |
| 22 | conquestSystemV39.js | SVG conquest map in Multiverse hub | Multiverse Hub → Map |
| 23 | playerEngine.js | Player rank progression panel, XP | Player Hub → Nhân Vật |
| 24 | playerInventory.js | Inventory — items, artifacts | Player Hub → Kho |
| 25 | playerTerritorySystem.js | Kingdom/Empire management | Player Hub → Lãnh Thổ |
| 26 | questSystem.js + playerQuestSystem.js | Quest log — active quests, rewards | Player Hub → Nhiệm Vụ (**kích hoạt từ Dormant Activation**) |
| 27 | cultivationPlayerEngine.js | Player cultivation stages 6 giai đoạn | Player Hub → Tu Luyện (**kích hoạt từ Dormant Activation**) |
| 28 | worldAutonomyClockV92.js + autonomousEventEngineV92.js | World Chronicle — autonomous events | PUOS → Chronicle |
| 29 | worldChronicleV92.js | Year-grouped world event log | PUOS → Chronicle |
| 30 | lifeEngineV93.js + speciesSystemV93.js + lifeActivationV94.js | Species panel — population counts, events | PUOS → Civilization |
| 31 | civEvolutionCoreV95.js + civEventsV95.js | Civ stages, tech points display | PUOS → Civilization |
| 32 | civAIBrainV120.js + Decision + Diplomacy | AI civ decisions in chronicle, auto alliances/wars | PUOS → Civilization + Chronicle |
| 33 | npcLifeEngineV65.js + Family + Relationship | NPC career, dreams, family tree | NPC Profile |
| 34 | timelineReplayEngineV122.js | 5-tab history scrubber, population graph | Tab Timeline Replay |
| 35 | creatorPowersCoreV123.js + 6 modules | Creator Powers panel — 32 buttons | PUOS → Creator Powers |
| 36 | creatorGodEngine.js + creatorGodControl.js | God Mode panel — Tribulation/Blessing/Revelation | Tab Creator God |
| 37 | miracleSystemV51.js + divineInterventionV66.js | 12 miracles — direct world state change | Tab God Mode |
| 38 | kingdomEngine.js + empireEngine.js | Kingdoms/Empires list, ruler, stability | Tab Vương Quốc |
| 39 | dynastyEngine.js + bloodlineEngine.js | Dynasty formation, succession, bloodline trees | Tab Triều Đại |
| 40 | thiendinhSystem.js | Heavenly Court panel — divine tribulations | Tab Thiên Đình |
| 41 | timeControlSystem.js | Speed control — 1× 10× 100× 1000× MAX | Bottom toolbar |
| 42 | saveManager.js | Save/Load panel | Tab Save |
| 43 | universeHubCore.js + Map + Registry | Universe Hub — 6 sub-tabs | Sidebar → Universe Hub |
| 44 | multiversePortalEngineV124.js + Registry | Portal Hub — Directory/Portals/Rankings/Creators | Multiverse Hub |
| 45 | worldShareEngine.js | "Share World" button → real URL | PUOS → Multiplayer tab |
| 46 | timelineReplayUI V122 | 5 tabs: Overview/Events/Pop/Civ/Replay | Tab Timeline Replay |
| 47 | puosShell.js + all PUOS panels | Main PUOS OS interface — 6 primary sections | PUOS Shell |
| 48 | logicHealthCheck.js + logicHealthPanel.js | Health dot (green/red) + Logic Health panel | PUOS → Settings |
| 49 | uwsDashboardV118.js | UWS Live stats dashboard | PUOS Sidebar → UWS |
| 50 | allianceEngine.js | 🤝 Liên Minh V24 sidebar nav (**kích hoạt từ Dormant Activation**) | Sidebar → Liên Minh V24 |
| 51 | sanctionEngine.js | ⚖️ Trừng Phạt V24 sidebar nav (**kích hoạt từ Dormant Activation**) | Sidebar → Trừng Phạt V24 |
| 52 | lodPerformanceSystem.js | ⚡ Hiệu Suất panel — NPC LOD metrics (**kích hoạt từ Dormant Activation**) | Sidebar → Hiệu Suất |
| 53 | playerReputationEngine.js | Danh Tiếng tab — tier + history (**bug name mismatch đã fix**) | Player Hub → Danh Tiếng |
| 54 | genreSceneEngine.js | Dynamic background canvas — 5 genres | Background |
| 55 | visualMapEngine.js | Visual terrain/territory map | Tab Bản Đồ |
| 56 | worldMap suite V121 | 22×22 terrain grid, civ zones, war fronts, 5 view modes | Tab World Map |

---

## 2. SYSTEMS EXPOSED TO PLAYERS (PLAYER-FACING INTERACTION)

Các hệ thống player có thể **chủ động tương tác** — không chỉ xem:

| Hệ Thống | Loại Tương Tác | Effect Thực |
|---|---|---|
| **creatorGodControl.js** | Click button: Heavenly Tribulation, Divine Blessing, Divine Revelation | Trực tiếp ghi `npc.realm`, `npc.hp`, `npc.karma` |
| **miracleSystemV51.js** | Click button: 8 phép màu (Cure Plague, Resource Rain, Golden Age, v.v.) | Xóa `plagueData`, reset wars, boost resources — real effect |
| **divineInterventionV66.js** | Click button: 4 grand miracles (Apocalypse Ward, Genesis Wave, v.v.) | Large-scale world state changes |
| **creatorPowersCoreV123.js** | 32 buttons: terrain edit, spawn/kill entity, time manipulation, divine events | Ghi vào `window.npcs`, `window.countries`, map grid |
| **timeControlSystem.js** | Speed buttons: 1× 10× 100× 1000× MAX | `setInterval` speed change |
| **questSystem.js + playerQuestSystem.js** | Accept/complete quests | XP/gold/reputation rewards |
| **playerInventory.js** | Use/equip items and artifacts | Buff NPC/player stats |
| **playerTerritorySystem.js** | Declare war, manage kingdom | Territory changes, army dispatch |
| **guildCoreV53.js** | Recruit members, run missions, build HQ | Real guild resource changes |
| **playerMarketplaceV52.js** | Buy/sell 18 items, auctions | Player wallet debit/credit |
| **worldShareEngine.js** | Click "Share World" | POST `/api/share` → real server file → shareable URL |
| **saveManager.js** | Manual save/load/export | localStorage read/write |
| **cultivationPlayerEngine.js** | Cultivation breakthrough attempts | Stage progression, realm unlock |
| **thiendinhSystem.js** | Divine tribulations | Realm transcendence |
| **allianceEngine.js** | Form/break alliances between factions | Alliance data update |
| **creatorAssetEngine.js + worldBlueprintEngine.js** | Create/export assets and blueprints | Blueprint share codes CGV6-BP-* |

---

## 3. AUTOPLAYER AI STATUS

**File:** `autoPlayerAI.js`
**Status:** ✅ ACTIVE — chạy 2 vòng song song

### Execution paths:
1. **`simulateWorld()` → `autoPlayerAI.tick()`** — chạy MỖI TICK (mỗi vài giây)
2. **`setInterval` 800ms** — chạy ĐỘC LẬP, không phụ thuộc gameTick

### Những gì autoPlayerAI làm tự động:
- Kiểm tra nếu `window.world === null` → gọi `createWorld()` tự động
- Quản lý nhân vật người chơi nếu player idle
- Auto-generates player actions (quests, sect activities) nếu không có input người chơi
- Viết vào player state (XP, gold, reputation) theo tick

### Vấn đề với autoPlayerAI:
- **Không có toggle OFF** trong PUOS — player không thể tắt hoàn toàn
- Chạy ngay cả khi player đang tích cực chơi → có thể gây conflict với player input
- Không có save key riêng — state không persist rõ ràng
- Double-execution: gameTick hook + 800ms interval = 2× frequency

### Recommendation:
Thêm toggle `window.autoPlayerAI.enabled = false` button trong PUOS Settings để player kiểm soát.

---

## 4. NEW PLAYER INTERACTIONS ADDED

### Từ Dormant Systems Activation Report (2026-06-13):

| Tương Tác Mới | Engine | Trước | Sau |
|---|---|---|---|
| **🌀 Tu Luyện tab** trong Player Hub | `cultivationPlayerEngine.js` | Invisible (chạy ngầm) | Có tab + render — 6 giai đoạn tu tiên |
| **📋 Nhiệm Vụ tab** trong Player Hub | `playerQuestSystem.js` | Invisible (chạy ngầm) | Có tab + render — 5 loại nhiệm vụ |
| **🤝 Liên Minh V24** sidebar nav | `allianceEngine.js` | Panel exists, NO nav button | Có nav button trực tiếp trên sidebar |
| **⚖️ Trừng Phạt V24** sidebar nav | `sanctionEngine.js` | Panel exists, NO nav button | Có nav button trực tiếp trên sidebar |
| **⚡ Hiệu Suất** tab | `lodPerformanceSystem.js` | File không load | Đã load + panel + nav button |
| **Danh Tiếng tab** (bug fix) | `playerReputationEngine.js` | Tab hiện trắng (name mismatch) | Tab hiển thị đúng tier + history |

### Từ V125 (API Key Activation — 2026-06-18):

| Tương Tác Mới | Engine | Trước | Sau |
|---|---|---|---|
| **AI World Generation** | `aiGenesisEngine.js`, `promptToWorldEngine.js`, `worldGenerationPipeline.js`, `worldLoreGenerator.js` | DEAD — no API key | **LIVE** — ANTHROPIC_API_KEY set |
| **Jarvis AI Chat** | `puosJarvis.js` | Navigation shortcuts only, AI responses broken | **LIVE** — full Claude AI responses |
| **World Narrative Chapters** | `narrativeGeneratorV68.js`, `worldNarrativeCoreV68.js` | Chapter list empty | **LIVE** — AI generates chapters |
| **Divine Oracle** | `divineOracleV77.js` | Prophecy generation only, oracle broken | **LIVE** — AI oracle interpretation |
| **AI World Analysis (Jarvis)** | `jarvisObserverV92.js` | Auto-observations only | **LIVE** — AI query responses enabled |

---

## 5. SCREENS / ROUTES / COMPONENTS CREATED

### Screens / Panels (UI Surfaces):

| Panel ID | Engine | Mô Tả |
|---|---|---|
| `panel-cultivation-v28` | cultivationPlayerEngine.js | Tu Luyện người chơi — **MỚI từ Dormant Activation** |
| `panel-player-quest-v28` | playerQuestSystem.js | Nhiệm Vụ người chơi — **MỚI từ Dormant Activation** |
| `panel-alliance-v24` | allianceEngine.js | Nav button — **MỚI từ Dormant Activation** |
| `panel-sanctions-v24` | sanctionEngine.js | Nav button — **MỚI từ Dormant Activation** |
| `panel-performance` | lodPerformanceSystem.js | NPC LOD metrics — **MỚI từ Dormant Activation** |
| `panel-UNIVERSE-HUB` | universeHubCore.js | Universe Hub sidebar tab (V73) |
| `panel-multiverse-hub-v35` | multiversePortalHub V124 | Portal Hub — Directory/Rankings/Creators |
| `panel-PUOS` | puosShell.js | PUOS OS overlay fullscreen |
| `panel-uws-dashboard` | uwsDashboardV118.js | UWS Live stats |
| `panel-TIMELINE-REPLAY` | timelineReplayUI V122 | 5-tab history scrubber |

### Server Routes (serve.js):

| Route | Method | Chức Năng |
|---|---|---|
| `/api/share` | POST | Lưu world snapshot → `shared_worlds/<id>.json` |
| `/api/share/:id` | GET | Lấy world snapshot |
| `/view` | GET | Trả về `worldViewer.html` (read-only world viewer) |
| `/api/claude` | POST | Proxy Anthropic API — key từ `ANTHROPIC_API_KEY` env |

### Components (Engine Modules tạo ra UI):

| Component | Tạo bởi | Loại |
|---|---|---|
| PUOS Shell (OS overlay) | `puosShell.js` | Fullscreen UI layer |
| World Chronicle timeline | `worldChronicleV92.js` | Year-grouped event feed |
| Timeline Replay scrubber | `timelineReplayUI V122` | 5-tab with graph |
| Creator Powers grid | `creatorPowersCoreV123.js` | 32-button power grid |
| Universe Hub 6-tab panel | `universeHubCore.js` | Multi-tab hub |
| UWS Live Dashboard | `uwsDashboardV118.js` | Real-time stats with flash animation |
| World Map 5-view | `worldMap suite V121` | Canvas-based 22×22 map |
| Genre Scene Background | `genreSceneEngine.js` | Canvas 2D animated background |
| Visual Map Engine | `visualMapEngine.js` | Terrain + territory map |
| Share World Viewer | `worldViewer.html` | Standalone read-only page |

---

## 6. BEFORE vs AFTER COMPARISON

### A. Trước Dormant Activation (pre-2026-06-13) vs Sau

| Chỉ Số | TRƯỚC | SAU |
|---|---|---|
| File được load | 98/111 | **100/111** |
| Hệ thống orphan (mất UI) | 3 | **0** |
| Nav buttons thiếu | 3 | **0** |
| Panel divs thiếu | 3 | **0** |
| Name mismatch bugs | 1 | **0** |
| Sub-tabs trong player-hub-v28 | 7 tabs | **9 tabs** |
| Hệ thống Dormant thực sự | 2 | **0** |

### B. Trước V125 API Key (pre-2026-06-18) vs Sau

| Hệ Thống | TRƯỚC | SAU |
|---|---|---|
| AI World Generation (4 engines) | DEAD CODE — 500 error | **LIVE** |
| Jarvis AI Chat | Navigation only | **Full AI responses** |
| World Narrative Chapters | Empty list | **AI generating chapters** |
| Divine Oracle V77 | Prophecy list, no fulfillment | **AI oracle active** |
| Jarvis Observer | Auto-obs only | **Full AI query mode** |
| Tổng AI engines dead | **8 engines** | **0 engines dead** |
| `/api/claude` response | 500 "API key not configured" | **200 OK** |

### C. Tổng Quan Trạng Thái Hệ Thống (Hiện Tại)

| Trạng Thái | Số Hệ Thống | % |
|---|---|---|
| ✅ ACTIVE (gameTick + visible effect) | 55 | ~38% |
| 🟡 PARTIALLY ACTIVE (chạy nhưng output một phần ẩn) | 15 | ~10% |
| 🖥️ UI ONLY (display, không affect simulation) | 8 | ~6% |
| 📊 DATA ONLY (chạy nhưng zero gameplay) | 6 | ~4% |
| ☠️ DEAD CODE (không chạy được) | 2 | ~1% |
| **Tổng systems tracked** | **~80 engine groups** | — |

> **Ghi chú:** Dead Code còn lại sau V125: Web Worker suite (SharedArrayBuffer chưa implement) + XR suite (requires hardware). AI engines ĐÃ được kích hoạt.

---

## 7. REMAINING INVISIBLE SYSTEMS

Các hệ thống vẫn chạy nhưng **player không thể nhìn thấy output** trong PUOS hiện tại:

### 🔴 HOÀN TOÀN VÔ HÌNH (Data runs, zero UI in PUOS):

| # | Hệ Thống | Save Key | Vấn Đề |
|---|---|---|---|
| 1 | **Digital Life Suite V78** (digitalLifeEngine, personalityEvolution, selfReflection, ideologyEngine, consciousnessLayer — 5 engines) | `cgv6_digital_life_v78` etc. | NPC inner states (happy/anxious/enlightened), philosophy, self-reflection journals — tất cả vô hình. Không có panel trong PUOS |
| 2 | **Player Civilization V58** (playerCivCoreV58, civCultureLanguage, civLawIdeology, civHistoryInfluence — 4 engines) | `cgv6_player_civ_core_v58` etc. | 6 tabs được định nghĩa cho player-hub-v28 nhưng KHÔNG accessible qua PUOS navigation hiện tại |
| 3 | **Memory System V64** (memoryEngine, npcMemory, civMemory, creatorMemory, dynastyMemory, worldMemoryArchive, memoryDecay — 7 engines) | `cgv6_memory_engine_v64` etc. | Memory tabs nằm trong creator-hub-v32 — hub KHÔNG có trong PUOS primary navigation |
| 4 | **Player Economy Core V52** (playerEconomyCoreV52 — 5-currency wallet) | `cgv6_player_economy_v52` | Wallet populated, ticks every gameTick. economyRegistryV52 patches player-hub-v28 nhưng tabs không render đúng |
| 5 | **Player Empire V53** (playerEmpireV53 — army, officials, tax) | `cgv6_player_empire_v53` | Army upkeep và tax chạy ngầm. Không có `peV53RenderPanel()` function |
| 6 | **Player Core V50** (playerCoreV50 — integration layer) | `cgv6_player_core_v50` | Chạy qua integration bridges. Không có direct UI panel |
| 7 | **Sentient Civilization Consciousness V79** (6 engines: civConsciousness, culturalEvolution, collectiveMemory, academy, cultureEngine, philosophyEngine) | `cgv6_civ_consciousness_v79` etc. | Tất cả output trong creator-hub-v32. Player không thấy civ philosophy/consciousness |
| 8 | **Black Market & Trade Network V54** (blackMarketV54, supplyDemandV54, tradeNetworkCoreV54) | `cgv6_black_market_v54` etc. | Chạy dynamic pricing và underground network. UI chỉ trong creator-hub-v32 (Classic mode) |
| 9 | **Ascension Engine** (ascensionEngine.js) | `cgv6_ascension_v28` | `ascTick()` chạy, data tracked. Nav button `ec-hidden` — unlock condition không được met trong PUOS flow |
| 10 | **Ecology Suite** (ecoClimateEngine, ecoResourceEngine, ecoCreatureEngine, ecoDisasterEngine, ecoRegistry — 5 engines) | `cgv6_eco_*` | Panel tồn tại trong Classic mode. KHÔNG accessible từ PUOS |

### 🟡 PARTIALLY VISIBLE (một phần ẩn):

| # | Hệ Thống | Vô Hình Ở Đâu |
|---|---|---|
| 11 | **Ocean Trade / Fleet / Colony / Pirate** (5 engines) | Panels trong Classic mode — player phải tìm mới thấy |
| 12 | **Prophecy Fulfillment V77** | Prophecies listed nhưng không bao giờ "fulfill" — fulfillment checking incomplete |
| 13 | **Multiverse Rankings V124** | Rankings hiển thị nhưng demo universes là static data không bao giờ thay đổi |
| 14 | **Creator Assets V74** | UI tồn tại nhưng blueprint import vào world mới không auto-apply |
| 15 | **Race Evolution Suite** (raceEvolutionCore, raceAbilityEngine, raceRelationEngine) | Race conflicts visible qua raceWarEngine, evolution mechanics invisible |
| 16 | **Jarvis Observer V92** | Auto-observations chạy. AI responses giờ LIVE — nhưng player cần biết cách trigger queries |
| 17 | **Age Progression Analytics V43** (ageProgressionEngine, ageEventEngine, ageAnalytics, worldAgeEngine) | Chạy song song với ageEngine.js. Analytics panel tồn tại nhưng ít được tìm thấy |

### ☠️ DEAD CODE (Không thể kích hoạt không có hardware/infrastructure):

| # | Hệ Thống | Lý Do |
|---|---|---|
| 18 | **Web Worker Suite** (webWorkerEngine, workerPoolManager, npcAIWorker, webWorkerRegistryV83 — 4 files) | Workers chạy isolated — không access được `window.*` global state. Cần SharedArrayBuffer bridge |
| 19 | **XR Suite** (webxrSystem, xrEngine, xrWorldEngine, xrPresenceSystem, xrGodInteraction, visionProBridge, xrDeviceAdapter, + 4 more — 9+ files) | Requires physical VR/AR hardware. `navigator.xr.requestSession()` fails in standard browser |

---

## TỔNG KẾT

| Hạng Mục | Số Lượng |
|---|---|
| Systems có UI đầy đủ (player nhìn thấy & tương tác) | **56 hệ thống** |
| Systems player tương tác chủ động | **16 loại tương tác** |
| New interactions từ Dormant Activation | **6 interactions** |
| New interactions từ V125 API Key | **5 AI interactions** |
| Screens/panels mới | **10 panels** |
| Server routes | **4 routes** |
| Invisible systems còn lại (cần visibility pass) | **10 hệ thống hoàn toàn vô hình + 7 partially** |
| Dead code không kích hoạt được | **2 suites (Web Worker + XR)** |

---

## PRIORITY QUEUE — Visibility Pass Tiếp Theo

Theo impact/effort ratio:

1. **🔴 P0 — Player Economy V52** — Ví 5 tiền tệ chạy ngầm, economyRegistry đã patch player-hub. Chỉ cần fix render. Impact cao vì liên quan đến V53 Guild, V54 Trade.
2. **🔴 P0 — Player Civilization V58** — 4 engines chạy, tabs định nghĩa sẵn trong player-hub-v28. Vấn đề navigation. Fix 1 alias function.
3. **🟠 P1 — Digital Life V78 (NPC Inner Life)** — 5 engines, rich data. Cần thêm section vào NPC profile view trong PUOS.
4. **🟠 P1 — Ascension Engine** — Unlock condition + nav button. Impact lớn với long-term player progression.
5. **🟡 P2 — Memory System V64** — 7 engines, creator-hub-v32 không reachable. Cần inject vào PUOS My Universe hoặc Creator section.
6. **🟡 P2 — Black Market V54** — High player interest. tradeRegistryV54 đã patch player-hub. Cần expose trong PUOS.
7. **🟢 P3 — Ocean Trade / Fleet** — 5 engines running. Classic mode panels cần PUOS shortcuts.
8. **🟢 P3 — Prophecy Fulfillment V77** — Fulfillment checking cần implement (đa phần TODO stubs).

---

*Báo cáo tạo bởi: Replit Agent — 2026-06-18*
*Dựa trên: GAMEPLAY_AUDIT_V124.md · TOP_20_WORKING_FEATURES.md · TOP_20_NON_WORKING_FEATURES.md · DORMANT_SYSTEMS_ACTIVATION_REPORT.md*
