# AI_MEMORY.md — Creator God V6

> ⚠️ DO NOT DELETE THIS FILE.
> Mục đích: Cho phép bất kỳ AI assistant nào hiểu ngay dự án này.
> Cập nhật sau mỗi version hoàn thành.

---

## 🔷 PROJECT SUMMARY

**Creator God V6 — Nền Tảng Đa Thế Giới** là một game mô phỏng thế giới (World Simulation) dựa trên trình duyệt, viết bằng **Vanilla JavaScript thuần**. Người chơi đóng vai Thần Sáng Tạo, quản lý và quan sát một thế giới tu tiên sống động tự vận hành.

**Tech Stack:**
- HTML5 + CSS3 + JavaScript ES6+ (NO framework, NO build tool)
- Three.js (3D map, loaded dynamically)
- localStorage (persistence — no backend)
- Google Fonts (Cinzel, Noto Serif SC)
- `npx serve` hoặc `serve` để chạy local

**Entry point:** `index.html`
**State:** `window.world`, `window.npcs`, `window.countries`, `window.year` (global)

---

## 🔢 CURRENT VERSION

**V41 — AI Creator Assistant** (2026-06-13)

---

## ✅ COMPLETED SYSTEMS (91+ systems)

### AI Creator Assistant V41 (7 systems) ← NEWEST
- `creatorBrain.js` — Core world analysis · `cbrnAnalyzeWorld()` trả về 10 chiều (population/warfare/economy/religion/technology/divine/multiverse/races/bosses/v40creations) · Passive (no save, no tick)
- `creatorAI.js` — AI Cố Vấn chính · `caiRunAnalysis()` · `caiApplySuggestion()` · gameTick mỗi 20 ticks · Điểm sức khỏe thế giới 0-100 · SAVE: cgv6_creator_ai_v41
- `creatorSuggestionEngine.js` — 12 mẫu đề xuất · Priority 1-5 · One-click thực hiện · `cseApply()` · `cseDismiss()` · SAVE: cgv6_creator_sugg_v41
- `balanceAnalyzer.js` — Phân tích 5 chiều (Kingdoms/Empires/Bosses/Universes/Gods) · Phát hiện bá quyền / sụp đổ / boss quá mạnh · `cbaRunAnalysis()` · SAVE: cgv6_balance_v41
- `loreGenerator.js` — 6 thể loại (Truyền Thuyết/Sử Thi/Huyền Thoại/Biên Niên/Tiên Tri/Chiến Sử) · Template + context thực · `lgGenerateLore()` · htAddEvent+wmeAddMemory · SAVE: cgv6_lore_v41
- `eventGenerator.js` — 5 loại sự kiện (Chiến Tranh/Thiên Tai/Thần Chiến/Xâm Lược/Khủng Hoảng) · `egGenerateEvent()` · Tác động thực lên thế giới (mv39DeclareWar) · SAVE: cgv6_event_gen_v41
- `creatorReports.js` — 4 loại báo cáo (Tình Trạng/Phát Triển/Sụp Đổ/Chiến Tranh) · Auto-generate khi init · `crpGenerateReport()` · SAVE: cgv6_creator_reports_v41
- **UI**: 6 tabs mới trong 👁 Creator God hub (3 tab V32 + 7 tab V40 + 6 tab V41 = 16 tổng) · KHÔNG tạo tab sidebar mới
- **hubEngine.js**: +6 dòng tab (tổng V40+V41 = +13 dòng thêm vào creator-hub-v32)

### Creator Marketplace V40 (7 systems)
- `creatorRaceFactory.js` — 7 mẫu chủng tộc (Người/Tiên/Ma/Thần/Rồng/Thú/Tùy Chỉnh) · 5 thuộc tính · `crfCreateRace()` · `crfRandomRace()` · SAVE_KEY: cgv6_creator_race_v40
- `creatorItemFactory.js` — 5 loại vật phẩm · 6 tier (Phàm→Sáng Thế) · `cifCreateItem()` · `cifRandomItem()` · 12 hiệu ứng ngẫu nhiên · SAVE_KEY: cgv6_creator_item_v40
- `creatorBossFactory.js` — 4 tier boss (World/Divine/Multiverse/Creator) · `cbfCreateBoss()` · `cbfSlayBoss()` · 15 abilities · SAVE_KEY: cgv6_creator_boss_v40
- `creatorGodFactory.js` — 5 tier thần · 23 lĩnh vực · 15 quyền năng · `cgfCreateGod()` · Tích hợp divineAdminData.createdDeities · SAVE_KEY: cgv6_creator_god_v40
- `creatorNationFactory.js` — 6 văn hóa · 7 tech level · `cnfCreateNation()` · `cnfCreateEmpire()` · SAVE_KEY: cgv6_creator_nation_v40
- `creatorUniverseFactory.js` — 8 loại · 9 quy luật · 6 tốc độ thời gian · `cufCreateUniverse()` · Tích hợp mvCreateUniverse() · SAVE_KEY: cgv6_creator_universe_v40
- `creatorLibrary.js` — Tổng hợp 7 factory · Stats cards · Jarvis đề xuất 6 danh mục · Timeline sáng tạo · Passive (no save key)
- **UI**: 7 tabs mới trong 👁 Creator God V32 hub (HUB_CONFIGS mở rộng từ 3→10 tabs) · KHÔNG tạo tab sidebar mới
- **hubEngine.js**: Thêm 7 tab vào creator-hub-v32.tabs (10 dòng thêm, trong giới hạn 20)
- **Jarvis**: waeAddAlert + htAddEvent + wmeAddMemory trong tất cả 6 factory có create function

### Multiverse War System V39 (5 systems)
- `multiverseWarSystemV39.js` — 5 loại chiến tranh (universe/divine/timeline/empire/sect) · `mv39DeclareWar()` · `mv39AutoWar()` · gameTick 8 ticks · Victory board · Hậu quả thực tế → stability/power decay · SAVE_KEY: cgv6_mv_war_v39
- `multiverseInvasionSystemV39.js` — Xâm lược 5 giai đoạn (Portal/Landing/Conquest/Occupation/Assimilation) · Resource absorption · Territory tracking · `mv39StartInvasion()` · Outcomes (great_victory/stalemate/crushed) · SAVE_KEY: cgv6_mv_invasion_v39
- `conquestSystemV39.js` — Lãnh thổ chiếm đóng · Kháng cự tăng dần · Cống nạp · Phản loạn khi resistance≥95 · `mv39RecordConquest()` · SVG bản đồ động · SAVE_KEY: cgv6_mv_conquest_v39
- `multiverseAllianceSystemV39.js` — 5 loại liên minh (mutual_defense/military_pact/trade_treaty/protectorate/grand_coalition) · `mvaFormAlliance()` · AI auto-alliance · Sức mạnh giảm theo thời gian · SAVE_KEY: cgv6_mv_alliance_v39
- `multiverseWarAnalyticsV39.js` — Rankings: vũ trụ/đế quốc/thần linh/tông môn · Tổng hợp stats từ mwData+mv39WarData+mv39InvData+mvaData · Passive (no gameTick)
- **UI**: Section V39 trong 🌌 Đa Vũ Trụ hub — 5 buttons: Chiến Tranh/Liên Minh/Xâm Lược/Bản Đồ/Thống Kê · KHÔNG tạo tab sidebar mới
- **Jarvis**: Tất cả 5 system → htAddEvent + waeAddAlert + wmeAddMemory

### Civilization Evolution Engine V38 (1 system)
- `civEvolutionEngineV38.js` — 6 Trụ Cột (Khoa Học, Văn Hóa, Quân Sự, Tôn Giáo, Công Nghệ, Phép Thuật) · 8 tầng tier · Tích hợp Kingdom/Empire/Sect/Divine/Multiverse/Timeline · gameTick mỗi 5 ticks · Breakthrough events → htAddEvent + wmeAddMemory + waeAddAlert · SAVE_KEY: cgv6_civ_evolution_v38
- **UI**: Section V38 trong 🌌 Đa Vũ Trụ hub — 6 tabs: Nền Văn Minh, Tiến Hóa, Công Nghệ, Văn Hóa, Tôn Giáo, Thống Kê · Không tạo tab sidebar mới

### Alternate Timeline System V36 (9 systems)
- `timelineEngine.js` — Core · 7 loại timeline · CRUD · gameTick · Auto-init 3 timelines
- `timelineManager.js` — Creator God controls · Stabilize/Purge/AlterHistory/Snapshot
- `timelineRegistry.js` — Danh mục · Rankings · Phân loại theo type · Đồng bộ
- `timelineBranchEngine.js` — Tự động phân nhánh · 8 triggers · Auto-branch gameTick
- `timelineTravelEngine.js` — 3 loại traveler (Player/God/Creator) · Danger system · Auto-travel
- `timelineEventEngine.js` — 10 sự kiện lịch sử thay thế · "What if" scenarios · Auto-generate
- `timelineMergeEngine.js` — Hợp nhất · Tách · Lưu trữ · Snapshot archive
- `timelineWarEngine.js` — 4 loại chiến tranh · Auto-resolve · Xâm lược/Chinh phục/Xóa bỏ/Ô nhiễm
- `timelineAnalytics.js` — SVG bản đồ cây nhánh · Phân tích tổng hợp · Báo cáo · Đe dọa

### Core
- `app.js` — Main loop, NPC/Sect/Country, save/load, `window.gameTick`
- `worldTemplates.js` — World templates
- `saveManager.js` — Save manager
- `multiWorldSystem.js` — Multi-world hub
- `worldHub.js` — World Hub V6
- `living-world-engine.js` — NPC soul/ambition/memory AI

### Economy (5 systems)
- `economySystem.js`, `economyEngine.js`, `economyEngineV2.js`, `economyAuditSystem.js`, `worldMarketplace.js`

### War & Territory (3 systems)
- `warEngine.js` — Wars, alliances, peace treaties, country collapse
- `territorySystem.js` — Territory management
- `territoryWarSystem.js` — Territory war

### Diplomacy V1 (2 systems)
- `diplomaticEngine.js` — Relations, ambassadors, treaties, war declaration
- `espionageEngine.js` — Spy networks, missions

### Multiverse Portal Network V35 (8 systems) ← NEWEST
- `multiverseEngine.js` — Core · 10 loại vũ trụ · Tạo/Xóa/Clone/Merge/Split · Auto-spawn · gameTick
- `universeRegistry.js` — Danh mục · Rankings · Phân loại · Thống kê đa vũ trụ
- `universeManager.js` — Creator controls · Boost/Populate/Events/Snapshots
- `portalNetwork.js` — 5 loại cổng · Auto-connect · Stability decay · Traffic log
- `universeTravelEngine.js` — 5 loại phái đoàn · Danger system · Auto-travel
- `multiverseMapEngine.js` — SVG bản đồ động · Animated nodes · Portal routes
- `multiverseWarEngine.js` — 4 loại chiến tranh · Auto-resolve · Hậu quả thực tế
- `multiverseEconomy.js` — 6 hàng hóa · Giá động · Cross-universe trade

### Đa Người Chơi V34 (9 systems)
- `multiplayerEngine.js` — Core hub · BroadcastChannel setup · SessionID · Render panel-multiplayer
- `playerSessionManager.js` — Heartbeat 15s · Online threshold 45s · Presence tracking per tab
- `accountEngine.js` — Register/Login/Profile/Logout · SimpleHash · SessionStorage per tab
- `worldSyncEngine.js` — World snapshot mỗi 30 ticks · Cross-tab kingdom/empire/boss/NPC sync
- `playerPresenceEngine.js` — Online players list · Friend requests · Render panel-players-online
- `worldChatEngine.js` — 6 channels (global/kingdom/empire/guild/sect/divine) · BroadcastChannel · Auto-refresh 5s
- `playerMarketplace.js` — Buy/sell listings · Auction · Cross-tab trading · Render panel-player-market
- `multiplayerEventEngine.js` — 6 event types · Auto-spawn from boss/world · Render panel-mp-events
- `antiCheatEngine.js` — Rate limiting · Time validation · Resource overflow check

### Thủ Hộ Thần V33 (8 systems)
- `thuhothanCore.js` — Main hub · Q&A keyword engine · Chat history · gameTick integration
- `thuhothanMemory.js` — Persistent memory: 200 events · 8 types (war/ascension/empire/collapse/divine/boss/creator/economy)
- `thuhothanPersonality.js` — Personality templates · Message formatting · Tone system (normal/urgent/reflective)
- `worldAlertEngine.js` — Auto-detect 8 event types (war/kingdom/empire/boss/divine/disaster/plague/invasion) → alerts
- `eventFeedEngine.js` — Live news feed from all engines · Filter by source/importance · 300 items max
- `worldAdvisor.js` — World analysis: Strongest Kingdom/Empire · Richest · Wars · Threats · Power Rising · Divine Status
- `playerAdvisor.js` — Player advice: Cultivation · Ascension · Combat · Diplomacy · Trade
- `creatorAdvisor.js` — Creator report: Stability · Dangerous Events · Divine Conflicts · Kingdom Issues · Suggested Actions

### Creator God Control Panel V32 (3 systems)
- `creatorGodControl.js` — World/Kingdom/Empire/Disaster/Boss/Artifact/Player/Timeline/Snapshot controls · 8 sub-tabs
- `divineAdministration.js` — Tạo/Xóa Thần · Phân Định Lãnh Địa · Thần Điện · Khai Chiến Thần Thánh
- `creatorAnalytics.js` — World analytics: Population · Economy · Military · Religion · Tech · Stability · Divine · Boss

### World Boss & Dungeon V31 (7 systems)
- `worldBossEngineV31.js` — 6 boss tiers (Rare→Creator) · 15 templates · Auto-spawn mỗi 80 ticks
- `dungeonEngineV31.js` — 6 dungeon types · Floor layout · Auto NPC explore
- `raidEngineV31.js` — Solo/Party/Guild/Sect/Kingdom/Empire raids · Power calc
- `invasionEngineV31.js` — 5 invasion types · Wave system · Auto-defense
- `bossEvolutionEngineV31.js` — Regional/Continental/World/Realm threat · Tick-based
- `legendaryHuntEngineV31.js` — First Kill · Fastest · Hunter rankings · Dungeon records
- `lootEngineV31.js` — 6 loot categories · Tier-weighted drop tables

### Continental V26 (3 systems)
- `continentEngineV26.js` — Phân cấp TG→LC→VK→LT→TP · Dân số · Tài nguyên · Khí hậu · Ảnh hưởng · Công nghệ · Chiến tranh LC · Xếp hạng
- `migrationEngineV26.js` — Di cư liên lục địa · 8 nguyên nhân · Sóng lớn · Thống kê chi tiết
- `continentalPoliticsEngine.js` — Bá quyền · Liên minh LC · Hội nghị · Sự cố chính trị · Uy danh

### Diplomacy V24 (5 systems)
- `allianceEngine.js` — 6 alliance types, AI auto-formation
- `treatyEngine.js` — 8 treaty types (Peace/Trade/Military/Non-Aggr/Open Borders/Marriage/Suzerainty/Vassal)
- `sanctionEngine.js` — 5 sanction types, Vassal/Protectorate/Tributary
- `worldCouncilEngine.js` — Council, sessions, 8 resolution types, AI voting
- `diplomacyEngine.js` — Hub V24, relation matrix, international relations

### Empire & Kingdom V23 (11 systems)
- `kingdomEngine.js` + `kingdomAI.js`
- `empireEngine.js` + `empireAI.js`
- `successionEngine.js`, `nobleHouseEngine.js`
- `dynastyEngine.js` + `dynastySystem.js`
- `bloodlineEngine.js`, `hereditaryBloodlineEngine.js`
- `livingCivilizationAI.js`

### World Simulation (14 systems)
- `worldEventEngine.js` (30 events, 6 types)
- `continentEngine.js` (6 continents)
- `ageEngine.js` (6 eras)
- `mythologyEngine.js`, `technologyEngine.js`
- `politicalReligionEngine.js` (8 faiths)
- `cultureHeritageEngine.js` (8 styles)
- `migrationEngine.js` (6 types)
- `emergentCivilization.js`, `historicalTimeline.js`
- `worldMemoryEngine.js`, `worldStorySystem.js`
- `aiStoryEngine.js` (V2), `aiWorldGenerator.js`
- `heavenlyDaoEngine.js`
- `navalOceanEngine.js`

### Characters & NPCs (7 systems)
- `npcReputationEngine.js`, `npcSpatialEngine.js`
- `heroLegendEngine.js`, `rankingsEngine.js`
- `progressionSystem.js`, `playerSystem.js`, `creatorGodEngine.js`

### Items & Artifacts (4 systems)
- `artifactSystem.js` (V7), `artifactEvolutionEngine.js` (V2)
- `legendaryArtifactEngine.js`, `spiritBeastSystem.js`

### Misc (10+ systems)
- `catastropheSystem.js`, `dungeonSystem.js`
- `questSystem.js` + `questEngine.js`
- `religionEngine.js`, `worldMapSystem.js`, `worldViewer3D.js`
- `thiendinhSystem.js`, `globalSearchSystem.js`
- `timeControlSystem.js`, `webxrSystem.js`
- `populationLimitSystem.js`, `lodPerformanceSystem.js`, `autoPlayerAI.js`

---

## 🌍 CURRENT WORLD FEATURES

- Tu tiên NPCs với linh hồn, tham vọng, ký ức, dòng họ
- Tông môn (sects) hình thành, phát triển, sụp đổ
- Quốc gia, Vương quốc, Đế chế với nền kinh tế, quân đội, ngoại giao
- Chiến tranh tự động (khai chiến, trận chiến, chiếm đất, diệt quốc)
- Liên minh V24 (6 loại), Hiệp ước V24 (8 loại), Chư hầu/Bảo hộ
- Hội Đồng Thế Giới V24 với nghị quyết và bỏ phiếu AI
- Trừng phạt kinh tế (5 loại)
- 6 Kỷ Nguyên lịch sử, 6 Đại Lục, 30 loại biến cố thế giới
- 8 tôn giáo chính trị, 8 phong cách văn hóa
- Hệ thống thần thoại tự sinh
- AI Story Engine tự viết biên niên sử
- 3D World Map (Three.js)

---

## 🖥️ CURRENT UI TABS (53 tabs)

Xem PROJECT_STATUS.md → "Current UI Tabs" để có danh sách đầy đủ.

**V26 tabs mới nhất:**
- 🌎 Lục Địa V26 (panel-continent-v26)
- 🚶 Di Cư V26 (panel-migration-v26)
- 🏛️ Chính Trị LC (panel-cont-politics)

---

## 📊 CURRENT DASHBOARDS

| Dashboard | Engine | Location |
|---|---|---|
| Economy Audit Dashboard | economyAuditSystem.js | panel-dashboard |
| War Statistics | warEngine.js | panel-war-engine |
| Diplomacy V24 Overview | diplomacyEngine.js | panel-diplomacy-v24 |
| World Council | worldCouncilEngine.js | panel-world-council |
| Rankings | rankingsEngine.js | panel-rankings |
| Hồ Sơ Dự Án | projectStatusEngine.js | panel-project-status |

---

## 💾 CURRENT SAVE STRUCTURE

Tất cả data lưu trong `localStorage` của browser. Không có backend.

**Core keys:**
- `cgv6_worlds` — Danh sách world IDs
- `cgv6_world_{id}` — State của từng world (NPCs, Sects, Countries, year...)

**V24 Diplomacy keys (MỚI):**
- `cgv6_alliance_v24` — `window.allianceData`
- `cgv6_treaty_v24` — `window.treatyData`
- `cgv6_sanction_v24` — `window.sanctionData`
- `cgv6_worldcouncil_v24` — `window.worldCouncilData`

**V1 Diplomacy & War:**
- `cgv6_diplomacy` — `diplomaticState` (V1)
- `cgv6_warEngine` — `warsActive, warsHistory, warAlliances, warStats`

**V23 Empire & Kingdom:**
- `cgv6_kingdoms` — `window.kingdomData`
- `cgv6_empires` — `window.empireData`

**Other:**
- `cgv6_player`, `cgv6_espionage`, `cgv6_economy`, `cgv6_continent`
- `cgv6_mythology`, `cgv6_technology`, `cgv6_culture`
- `cgv6_religion_political`, `cgv6_herolegend`
- `cgv6_worldmemory`, `cgv6_reputation`, `cgv6_artifacts`
- `cgv6_spiritbeast`, `cgv6_migration`

---

## 🗄️ CURRENT DATABASE STRUCTURE

**Không có database server.** Toàn bộ dữ liệu trong localStorage (browser-side).
Để export: dùng nút "Xuất Tất Cả" trong UI (multiWorldSystem.js).

---

## 🌐 CURRENT MULTIPLAYER STATUS

**Không có multiplayer.** Single-player only. State hoàn toàn client-side.

---

## ⚙️ CURRENT WORLD SIMULATION STATUS

- `simRunning` (boolean) — toggle simulation
- Mỗi tick: `year++` → livingWorldTick → economyTick → warTick → diplomacy hooks
- AI NPCs tự quyết định: tu luyện, kết hôn, chiến đấu, lập quốc, di cư
- Hội Đồng Thế Giới họp mỗi ~20 năm (wcTick)
- Liên minh tự hình thành/tan vỡ (aeTick)
- Hiệp ước tự hết hạn (teTick)

---

## 🤖 CURRENT AI SYSTEMS

| System | File | AI Behavior |
|---|---|---|
| NPC Living World AI | living-world-engine.js | NPCs tự quyết định goals/actions |
| Auto Player AI | autoPlayerAI.js | AI plays as Creator God |
| AI Story Engine | aiStoryEngine.js | Generates chronicle narratives |
| AI World Generator | aiWorldGenerator.js | Procedural world creation |
| Kingdom AI | kingdomAI.js | Kingdom foreign policy AI |
| Empire AI | empireAI.js | Empire expansion AI |
| Living Civilization AI | livingCivilizationAI.js | Civilization-level decisions |
| Alliance AI | allianceEngine.js | Auto alliance formation/dissolution |
| Treaty AI | treatyEngine.js | Auto peace proposals |
| World Council AI | worldCouncilEngine.js | Auto voting on resolutions |
| Sanction AI | sanctionEngine.js | Auto vassal assignment |

---

## 💰 CURRENT ECONOMY SYSTEMS

| System | Features |
|---|---|
| economySystem.js | Resources, basic trade |
| economyEngine.js | Production, consumption, prices |
| economyEngineV2.js | Advanced markets, supply chains |
| economyAuditSystem.js | Audit dashboard, anomaly detection |
| worldMarketplace.js | Global marketplace |
| sanctionEngine.js | Economic sanctions, tribute |
| treatyEngine.js | Trade treaties (+35% trade bonus) |

---

## ⚔️ CURRENT WAR SYSTEMS

| System | Features |
|---|---|
| warEngine.js | Declaration, battles, collapse, alliances |
| territoryWarSystem.js | Territory conquest |
| diplomaticEngine.js V1 | War declaration via diplomacy |
| allianceEngine.js V24 | Defensive alliances, mutual defense |
| successionEngine.js | Succession wars |
| worldCouncilEngine.js | Peace demand resolutions |

---

## 🤝 CURRENT DIPLOMACY SYSTEMS

### V1 (diplomaticEngine.js)
- Relation score system (-100 to +100)
- Ambassador sending
- 7 treaty types
- War declaration
- Panel: panel-diplomacy

### V24 (5 new engines)
- **Alliance Engine:** 6 types (Mutual Defense, Military, Economic, Cultural, Grand, Hegemony)
- **Treaty Engine:** 8 types + expiry + AI proposals
- **Sanction Engine:** 5 sanction types + Vassal/Protectorate/Tributary
- **World Council:** Sessions + 8 resolution types + AI voting + prestige system
- **Hub:** Relation matrix, international relations view

---

## 👑 CURRENT EMPIRE SYSTEMS

| System | Features |
|---|---|
| kingdomEngine.js | 5 stages (Village→Empire), auto-migration from countries |
| kingdomAI.js | Kingdom foreign policy |
| empireEngine.js | Empire formation, conquest |
| empireAI.js | Empire expansion strategy |
| dynastyEngine.js | Dynasty creation/fall |
| dynastySystem.js | Dynasty management |
| successionEngine.js | Succession wars, heirs |
| nobleHouseEngine.js | Noble houses, intrigue |
| bloodlineEngine.js | Bloodline tracking |
| hereditaryBloodlineEngine.js | Hereditary traits |
| livingCivilizationAI.js | Civilization-level AI |

---

## 🚀 NEXT RECOMMENDED BUILDS

### V25 — Espionage & Intelligence V2 (Priority: HIGH)
- Spy networks với relationship graph
- Alliance-level intelligence sharing (V24 integration)
- Tech theft từ technologyEngine.js
- Economic sabotage qua sanctionEngine.js
- Counter-intelligence, double agents
- Mission difficulty based on drGetRelation scores

### V26 — Climate & Natural Disaster V2
- Seasonal effects on economy
- Disaster prevention through World Council resolutions

### V27 — Genetics Engine
- DNA traits, mutation, evolution
- Integration with hereditaryBloodlineEngine.js

### V28 — Religion V2
- Schism, Heresy, Crusades
- Religious alliances through allianceEngine.js

### V29 — Trade Route Engine
- Visual trade flows on worldMapSystem.js
- Pirates, raiders affecting trade treaties

### V30 — Cultural Exchange
- Syncretism, language spread
- Cultural alliances through allianceEngine.js

---

## 📐 CODING RULES (PROJECT PROTECTION BLOCK)

```
LUÔN trả lời bằng TIẾNG VIỆT.
Đọc toàn bộ project trước khi code.

TUYỆT ĐỐI KHÔNG:
- Xóa file cũ / Xóa dữ liệu cũ / Đổi tên biến/class/file cũ
- Thay thế hệ thống cũ / Ghi đè logic cũ
- Viết lại app.js / Viết lại index.html

Nếu cần chỉnh sửa: CHỈ mở rộng, CHỈ thêm code, CHỈ tích hợp.
Nếu chuẩn bị sửa hơn 20 dòng code cũ: DỪNG → Tạo extension layer.

PROJECT MODE: EXPAND ONLY · NEVER DELETE · NEVER REPLACE · NEVER REBUILD
```

---

*Last updated: V32 — 2026-06-13*
