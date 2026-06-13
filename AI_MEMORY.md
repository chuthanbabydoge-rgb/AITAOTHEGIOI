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

**V33 — Thủ Hộ Thần (AI Advisor System)** (2026-06-13)

---

## ✅ COMPLETED SYSTEMS (62+ systems)

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

### Thủ Hộ Thần V33 (8 systems) ← NEWEST
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
