# PROJECT CHANGELOG — Creator God V6

> Chỉ THÊM mới. Không xóa entry cũ.

---

## [V45] — 2026-06-13 — Hệ Sinh Thái Thế Giới

### New Systems Added (5 files)
- `ecoClimateEngine.js` — 8 khí hậu (Nhiệt Đới/Ôn Đới/Sa Mạc/Băng Giá/Núi Cao/Thần Giới/Ma Giới/Tùy Chỉnh) · 4 mùa (Xuân/Hạ/Thu/Đông) · `ecoSetClimate()` · `ecoGetCurrentSeason()` · `ecoGetEffects()` (pop/agri/econ/war bonus) · `ecoAddCustomClimate()` · V43 age sync (chaos→demon_realm, divine→divine_realm) · gameTick mỗi tick · SAVE: cgv6_eco_climate_v45
- `ecoResourceEngine.js` — 5 loại tài nguyên (⛏️Khoáng/🌲Gỗ/🌾Thực Phẩm/⚡Năng Lượng/💎Thần Giới) · regen theo climate×season×age bonus · `ecoExtractResource(id,amount)` · `ecoAddTradeRoute()` · `ecoGetResourceStats()` · tuyến thương mại · SAVE: cgv6_eco_resource_v45
- `ecoCreatureEngine.js` — 20 archetypes sinh vật (Sói/Nai/Long/Phượng/Kraken/Sâu Sa Mạc/Gấu Băng/Điểu Lôi...) · chuỗi thức ăn predator/prey/apex · `ecoHuntCreature()` · `ecoGetCreaturesByClimate()` · `ecoGetCreaturesByEra()` · nguy cơ tuyệt chủng · sync V44 race domain + V43 era · gameTick mỗi 15 ticks · SAVE: cgv6_eco_creature_v45
- `ecoDisasterEngine.js` — 5 loại thiên tai eco-scale (Động Đất/Núi Lửa/Bão/Đại Hồng Thủy/Dị Tượng Thần) · KHÁC V25 (V25=world-scale, V45=local ecosystem) · `ecoTriggerDisaster(id,severity)` · auto-trigger mỗi 20 ticks · V43 age multiplier (chaos×2.5, golden×0.4) · `ecoGetActiveDisasters()` · SAVE: cgv6_eco_disaster_v45
- `ecoRegistry.js` — 6 panel renders + `ecoHubRenderPanel()` widget mvHub · `ecoRenderPanel(id)` public API · Passive (no save/tick)

### index.html Updates
- Thêm 6 panel divs V45: panel-eco-overview-v45 → panel-eco-disasters-v45
- Thêm 5 script tags nhóm V45 (trước V44)
- Thêm section V45 vào `mvHubRenderPanel` (trước closing `+'</div>';`)

### UI Integration
- Tích hợp bên trong 🌌 Đa Vũ Trụ V35 hub (mvHubRenderPanel) — KHÔNG tạo tab sidebar mới
- 6 sub-panels: 🌿 Tổng Quan · 🌤️ Khí Hậu · 🌸 Mùa · 🦎 Sinh Vật · ⛏️ Tài Nguyên · 🌪️ Thiên Tai

### Save Keys Mới
- `cgv6_eco_climate_v45` · `cgv6_eco_resource_v45` · `cgv6_eco_creature_v45` · `cgv6_eco_disaster_v45`

### Integration Points
- `waeGetCurrentAge()` → V43 sync: climate default by age · resource regen bonus · disaster frequency
- `recGetAll()` → V44 sync: domain race → linked creature (e.g. dragon race → dragon creature)
- `ecoGetEffects()` → pop/agri/econ/war bonus từ climate×season → tích hợp vào world simulation
- `htAddEvent()` + `wmeAddMemory()` + `waeAddAlert()` cho mọi sự kiện sinh thái lớn
- KHÔNG trùng với `disasterEngine.js` V25 (V25=civilization scale, V45=ecosystem scale)
- `mdbGetPantheons()` V42 → mythological resources phân bổ theo pantheon khu vực

### Số Liệu Sau V45
- JS files: 190 → **195** · Panels: 180 → **186** · gameTick hooks: 78 → **82**

---

## [V44] — 2026-06-13 — Hệ Thống Chủng Tộc Tiến Hóa

### New Systems Added (5 files)
- `raceEvolutionCore.js` — Core 8 chủng tộc (Nhân/Tiên/Ma/Long/Cơ Khí/Linh/Thú/Hải) · 5 giai đoạn tiến hóa · `recGetAll()` · `recEvolveRace()` · `recGetStats()` · Sync với crfData V40 · Gán patron deity V42 · gameTick mỗi 5/15/20 ticks · SAVE: cgv6_race_evo_core_v44
- `raceAbilityEngine.js` — 50+ kỹ năng pool · 12 kỷ nguyên × 4-5 abilities · `raeUnlockAbility()` · `raeCheckMutation()` · `raeAutoUnlockForAge()` · 4 loại đột biến · gameTick mỗi 25 ticks · SAVE: cgv6_race_ability_v44
- `raceWarEngine.js` — 6 loại xung đột · `rweStartConflict()` · `rweGetDominance()` · `rweCheckExtinction()` · Auto-conflict mỗi 30 ticks · SAVE: cgv6_race_war_v44
- `raceRelationEngine.js` — Ma trận quan hệ 28 cặp default · 7 mức quan hệ · 4 loại liên minh · `rreFormAlliance()` · `rreStartAssimilation()` · Auto-ally nếu score≥60 · gameTick mỗi 20 ticks · SAVE: cgv6_race_relation_v44
- `raceEvolutionRegistry.js` — 5 panel renders + `recHubRenderPanel()` widget cho mvHub · Passive (no save/tick)

### index.html Updates
- Thêm 5 panel divs V44: panel-race-overview-v44 → panel-race-relations-v44
- Thêm 5 script tags nhóm V44 (trước V43)
- Thêm section V44 vào `mvHubRenderPanel` (trước closing `+'</div>';`)

### UI Integration
- Tích hợp bên trong 🌌 Đa Vũ Trụ V35 hub (mvHubRenderPanel) — KHÔNG tạo tab sidebar mới
- 5 sub-panels: 🧬 Tổng Quan · 📈 Tiến Hóa · ⚡ Kỹ Năng · ⚔️ Xung Đột · 🤝 Quan Hệ

### Save Keys Mới
- `cgv6_race_evo_core_v44` · `cgv6_race_ability_v44` · `cgv6_race_war_v44` · `cgv6_race_relation_v44`

### Integration Points
- `recEvolveRace()` → trigger `raeCheckMutation()` tự động
- `waeGetCurrentAge()` → V43 age sync: evolution bonus theo kỷ nguyên
- `window.crfData.races` → sync chủng tộc từ Creator Factory V40
- `mgsGetAll()` → gán patron deity từ Mythology V42
- `rreGetRelation()` → tương thích `drGetRelation()` pattern
- `htAddEvent()` + `wmeAddMemory()` + `waeAddAlert()` cho mọi sự kiện lớn
- KHÔNG trùng với `creatorRaceFactory.js` V40 (V40=tạo thủ công, V44=tiến hóa tự động)

---

## [V43] — 2026-06-13 — Hệ Thống Kỷ Nguyên Thế Giới

### New Systems Added (5 files)
- `worldAgeEngine.js` — Core 12 kỷ nguyên (Hỗn Mang→Sáng Thế) · Điều kiện chuyển đổi tự động · `waeGetCurrentAge()` · `waeForceAge()` · `waeGetHistory()` · gameTick mỗi 10 ticks · htAddEvent + wmeAddMemory khi chuyển · SAVE: cgv6_world_age_v43
- `ageProgressionEngine.js` — Điểm sẵn sàng 12 kỷ nguyên · 7 điều kiện (dân số/quốc gia/đế quốc/vũ trụ/cổng/thần/văn minh) · `apeGetProgress(id)` · `apeGetConditionDetail(id)` · gameTick mỗi 5 ticks · SAVE: cgv6_age_prog_v43
- `ageEventEngine.js` — Pool sự kiện theo từng kỷ nguyên (12 × 3-5 sự kiện = 50+ mẫu) · `aeeFireEvent(ageId)` · `aeeGetRecentEvents()` · 15% chance mỗi 20 ticks · SAVE: cgv6_age_events_v43
- `ageAnalytics.js` — Ổn định thế giới · Snapshot định kỳ · `aanGetStats()` · `aanGetForecast()` · Dự báo kỷ nguyên tiếp theo · SAVE: cgv6_age_analytics_v43
- `ageRegistry.js` — 5 panel renders: Kỷ Nguyên/Lịch Sử/Chuyển Đổi/Sự Kiện/Phân Tích · `waeHubRenderPanel()` (widget cho mvHub) · Passive (no save/tick)

### index.html Updates
- Thêm 5 panel divs V43: panel-age-current-v43 → panel-age-analytics-v43
- Thêm 5 script tags nhóm V43 (trước V42)
- Thêm section V43 vào `mvHubRenderPanel` (trong 🌌 Đa Vũ Trụ hub)

### UI Integration
- Tích hợp bên trong 🌌 Đa Vũ Trụ V35 hub — KHÔNG tạo tab sidebar mới
- 5 sub-panels: 🌀 Kỷ Nguyên · 📜 Lịch Sử · ⚡ Chuyển Đổi · 🗓️ Sự Kiện · 📊 Phân Tích
- Quick-navigate từ mvHub widget

### Save Keys Mới
- `cgv6_world_age_v43` · `cgv6_age_prog_v43` · `cgv6_age_events_v43` · `cgv6_age_analytics_v43`

### Integration Points
- `waeForceAge()` → can thiệp thủ công chuyển kỷ nguyên (UI button)
- `waeV43Tick()` → auto-check điều kiện mỗi 10 gameTicks
- htAddEvent + wmeAddMemory khi chuyển kỷ nguyên
- `apeGetConditionDetail()` đọc: world.population · countries · empireData · warsActive · mvData.universes · pnGetOpenPortals · civEvoData
- `aeeFireCurrentAgeEvent()` gọi được từ UI Sự Kiện
- KHÔNG trùng với ageEngineV25.js (V25 có 5 loại era khác: Hoàng Kim/Đen Tối/Khám Phá/Công Nghệ/Ma Thuật)

---

## [V42] — 2026-06-13 — Thư Viện Thần Thoại Toàn Cầu

### New Systems Added (6 files)
- `mythologyDatabase.js` — Core database 10 hệ thần thoại (Việt Nam/Hy Lạp/Bắc Âu/Ai Cập/Trung Hoa/Nhật Bản/Ấn Độ/Maya/Celtic/Tùy Chỉnh) · `mdbGetPantheons()` · `mdbUpdateStats()` · SAVE: cgv6_myth_db_v42
- `mythologyGodSystem.js` — 30 thần linh mặc định · CRUD · filter theo pantheon · Form thêm thần mới · `mgsAddGod()` · `mgsFilterByPantheon()` · SAVE: cgv6_myth_gods_v42
- `mythologyCreatureSystem.js` — 20 sinh vật huyền thoại (Rồng/Phượng/Kraken/Griffin/Kỳ Lân/Yêu Thú...) · threat level color · CRUD · SAVE: cgv6_myth_creatures_v42
- `mythologyArtifactSystem.js` — 20 thánh vật/thần khí · owner tracking · effect desc · CRUD · SAVE: cgv6_myth_artifacts_v42
- `mythologyLoreSystem.js` — 15 truyền thuyết/sử thi mặc định · moral tracking · CRUD + lưu vào wmeAddMemory · SAVE: cgv6_myth_lore_v42
- `mythologyRegistry.js` — Hub UI tổng hợp · Quick nav 5 tab · Pantheon overview stats · AI Suggest 4 loại · Passive (no save/gameTick)

### index.html Updates
- Thêm 6 panel divs V42: panel-myth-overview-v42 → panel-myth-database-v42
- Thêm 6 script tags nhóm V42 (sau creatorReports.js, trước V40)

### hubEngine.js Update
- creator-hub-v32: 16 → 22 tabs (+6 dòng V42)
- Tabs mới: 📖 Thần Thoại · ✨ Thần Linh · 🐉 Sinh Vật · ⚔️ Thánh Vật · 📜 Truyền Thuyết · 🗄️ Database

### Save Keys Mới
- `cgv6_myth_db_v42` · `cgv6_myth_gods_v42` · `cgv6_myth_creatures_v42` · `cgv6_myth_artifacts_v42` · `cgv6_myth_lore_v42`

### Integration Points
- `mdbUpdateStats()` ← được gọi bởi Gods/Creatures/Artifacts/Lore systems để sync stats
- `mgsFilterByPantheon(id)` ← được gọi từ Database panel để quick-filter
- `mlsAddLore()` → gọi `wmeAddMemory()` (World Memory) + `htAddEvent()` (Historical Timeline)
- `mgsAddGod()` / `mcsAddCreature()` / `masAddArtifact()` → gọi `htAddEvent()`
- `mregAISuggestGod/Creature/Artifact/Lore()` — AI suggestion pool 15+ gợi ý

---

## [V41] — 2026-06-13 — AI Creator Assistant

### New Systems Added (7 systems)
- `creatorBrain.js` — Core analysis engine · `cbrnAnalyzeWorld()` phân tích 10 chiều (population/warfare/economy/religion/technology/divine/multiverse/races/bosses/v40creations) · topThreats + topOpps · Passive
- `creatorAI.js` — AI Cố Vấn chính · `caiRunAnalysis()` · `caiApplySuggestion()` · gameTick mỗi 20 ticks · Điểm sức khỏe thế giới 0-100 · Tự động phân tích 2s sau init · Save: cgv6_creator_ai_v41
- `creatorSuggestionEngine.js` — 12 mẫu đề xuất chia 6 danh mục · Priority 1-5 · `cseApply()` thực sự gọi factory functions · `cseDismiss()` · Save: cgv6_creator_sugg_v41
- `balanceAnalyzer.js` — Phân tích 5 chiều · Phát hiện bá quyền/sụp đổ/boss quá mạnh/vũ trụ bất ổn · `cbaRunAnalysis()` · waeAddAlert khi phát hiện critical · Save: cgv6_balance_v41
- `loreGenerator.js` — 6 thể loại (Truyền Thuyết/Sử Thi/Huyền Thoại/Biên Niên/Tiên Tri/Chiến Sử) · Template fill với context thực (tên kingdom, NPC) · htAddEvent + wmeAddMemory · Save: cgv6_lore_v41
- `eventGenerator.js` — 5 loại sự kiện (Chiến Tranh/Thiên Tai/Thần Chiến/Xâm Lược ĐVT/Khủng Hoảng KT) · `egGenerateEvent()` · Tác động thực: mv39DeclareWar khi war event · htAddEvent + waeAddAlert + wmeAddMemory · Save: cgv6_event_gen_v41
- `creatorReports.js` — 4 loại báo cáo (Tình Trạng/Phát Triển/Nguy Cơ Sụp Đổ/Nguy Cơ Chiến Tranh) · `crpGenerateReport()` · Auto-generate world_state report khi init · Save: cgv6_creator_reports_v41

### index.html Updates
- Thêm 6 panel divs V41: panel-creator-ai-v41 → panel-creator-reports-v41
- Thêm 7 script tags (nhóm V41 trước V40, để creatorBrain init trước)

### hubEngine.js Update
- creator-hub-v32: 10 → 16 tabs (+6 dòng V41)
- Tabs mới: 🤖 AI Cố Vấn · ⚖️ Phân Tích · 💡 Đề Xuất · 📜 Lore · ⚡ Sự Kiện · 📊 Báo Cáo

### Integration Points
- `creatorBrain` → data source cho caiData, cseData, cbaData, crpData
- `caiApplySuggestion()` → gọi trực tiếp V40 factory functions (cnfCreateNation, cgfRandomGod, crfRandomRace...)
- `eventGenerator` → `mv39DeclareWar()` khi war event (V39 compat)
- Jarvis: htAddEvent + waeAddAlert + wmeAddMemory trong creatorAI, eventGenerator, loreGenerator, balanceAnalyzer

### Save Keys
- cgv6_creator_ai_v41, cgv6_creator_sugg_v41, cgv6_balance_v41
- cgv6_lore_v41, cgv6_event_gen_v41, cgv6_creator_reports_v41

---

## [V40] — 2026-06-13 — Chợ Sáng Thế Chủ

### New Systems Added (7 systems)
- `creatorRaceFactory.js` — 7 mẫu chủng tộc (Người/Tiên/Ma/Thần/Rồng/Thú/Tùy Chỉnh) · 5 thuộc tính (Tuổi thọ/Sức mạnh/Trí tuệ/Sinh sản/Tiến hóa) · `crfCreateRace()` · `crfRandomRace()` · Save: cgv6_creator_race_v40
- `creatorItemFactory.js` — 5 loại (Vũ Khí/Giáp/Thánh Vật/Thần Khí/Di Vật) · 6 tier (Phàm→Sáng Thế) · 12 hiệu ứng ngẫu nhiên · `cifCreateItem()` · Save: cgv6_creator_item_v40
- `creatorBossFactory.js` — 4 tier (World/Divine/Multiverse/Creator) · 15 abilities · `cbfCreateBoss()` · `cbfSlayBoss()` · Tích hợp wbv31SpawnCustomBoss · Save: cgv6_creator_boss_v40
- `creatorGodFactory.js` — 5 tier thần (Bán Thần→Thái Cổ) · 23 lĩnh vực · 15 quyền năng · `cgfCreateGod()` · Tích hợp divineAdminData.createdDeities · Save: cgv6_creator_god_v40
- `creatorNationFactory.js` — 6 văn hóa (Võ Học/Học Thuật/Thương Mại/Tôn Giáo/Phép Thuật/Du Mục) · 7 tech level · `cnfCreateNation()` · `cnfCreateEmpire()` · Save: cgv6_creator_nation_v40
- `creatorUniverseFactory.js` — 8 loại vũ trụ · 9 quy luật vật lý · 6 tốc độ thời gian · `cufCreateUniverse()` · Tích hợp mvCreateUniverse() · Save: cgv6_creator_universe_v40
- `creatorLibrary.js` — Tổng hợp 7 factory · Stats cards (7 danh mục) · Jarvis đề xuất 6 loại · Timeline sáng tạo 30 mục gần nhất · Passive (no gameTick, no save key)

### index.html Updates
- Thêm 7 panel divs: panel-creator-race-v40 → panel-creator-library-v40
- Thêm 7 script tags (nhóm V40 Creator Marketplace)

### hubEngine.js Update
- creator-hub-v32 tabs: 3 → 10 tabs (+7 dòng, trong giới hạn 20)
- Tabs mới: Chủng Tộc · Vật Phẩm · Boss · Thần · Quốc Gia · Vũ Trụ · Thư Viện

### Integration Points
- `creatorGodFactory` → `divineAdminData.createdDeities.push()` (V32 compatibility)
- `creatorBossFactory` → `wbv31SpawnCustomBoss()` (V31 compatibility, optional)
- `creatorUniverseFactory` → `mvCreateUniverse()` (V35 compatibility, optional)
- Jarvis: htAddEvent + waeAddAlert + wmeAddMemory trong tất cả 6 factory

### Save Keys
- cgv6_creator_race_v40, cgv6_creator_item_v40, cgv6_creator_boss_v40
- cgv6_creator_god_v40, cgv6_creator_nation_v40, cgv6_creator_universe_v40

---

## [V39] — 2026-06-13 — Chiến Tranh Đa Vũ Trụ

### New Systems Added (5 systems)
- `multiverseWarSystemV39.js` — 5 loại chiến tranh (Vũ Trụ/Thần Giới/Dòng Thời Gian/Đế Quốc/Tông Môn) · `mv39DeclareWar()` · `mv39AutoWar()` · Victory board · Hậu quả thực tế lên universe.stability/power · gameTick mỗi 8 ticks · Save: cgv6_mv_war_v39
- `multiverseInvasionSystemV39.js` — Xâm lược 5 giai đoạn (Mở Cổng/Đổ Bộ/Chinh Phạt/Chiếm Đóng/Đồng Hóa) · Hấp thụ tài nguyên vũ trụ bị xâm lược · 5 kết quả (Đại Thắng→Bị Tiêu Diệt) · Kích hoạt mv39RecordConquest khi thắng · Save: cgv6_mv_invasion_v39
- `conquestSystemV39.js` — Lãnh thổ chiếm đóng · Kháng cự tăng dần (0.5/tick) · Cống nạp · Phản loạn khi resistance≥95 · SVG bản đồ động hiển thị nodes+edges chiến tranh · Save: cgv6_mv_conquest_v39
- `multiverseAllianceSystemV39.js` — 5 loại liên minh (Phòng Thủ Chung/Quân Sự/Thương Mại/Bảo Hộ/Đại Liên Minh) · AI auto-detect shared enemies · `mvaIsAllied()` bonus trong chiến tranh/xâm lược · Sức mạnh giảm dần → tan rã · Save: cgv6_mv_alliance_v39
- `multiverseWarAnalyticsV39.js` — Rankings 4 loại: Vũ Trụ/Đế Quốc/Thần Linh/Tông Môn · Tổng hợp từ mwData(V35)+mv39WarData+mv39InvData+mvaData · Stats cards: Chiến Tranh/Xâm Lược/Liên Minh/Bị Chiếm · Passive engine (no gameTick)

### index.html Updates
- Thêm 5 script tags: multiverseWarSystemV39.js, multiverseInvasionSystemV39.js, conquestSystemV39.js, multiverseAllianceSystemV39.js, multiverseWarAnalyticsV39.js
- Thêm 5 panel divs: panel-mv-war-v39, panel-mv-invasion-v39, panel-mv-warmap-v39, panel-mv-alliance-v39, panel-mv-warstats-v39
- Extend mvHubRenderPanel() — thêm V39 section với stats counter + 5 navigation buttons (KHÔNG tạo tab sidebar mới)

### Integration Points
- `window.mv39RecordConquest()` được gọi từ cả warSystemV39 lẫn invasionSystemV39 khi thắng trận
- `window.mvaData.alliances` được tham chiếu bởi warSystemV39 và invasionSystemV39 để tính alliance bonus
- Jarvis (waeAddAlert + htAddEvent + wmeAddMemory): tất cả 5 systems đều notify
- Array safety V33 pattern: kingdomData/empireData dùng Array.isArray + Object.values

### Save Keys
- `cgv6_mv_war_v39`, `cgv6_mv_invasion_v39`, `cgv6_mv_conquest_v39`, `cgv6_mv_alliance_v39`

---

## [V38] — 2026-06-13 — Tiến Hóa Nền Văn Minh AI

### New Systems Added
- Civilization Evolution Engine (`civEvolutionEngineV38.js`) — 6 Trụ Cột tiến hóa (Khoa Học/Văn Hóa/Quân Sự/Tôn Giáo/Công Nghệ/Phép Thuật) · 8 tier (Nguyên Thủy→Vĩnh Cửu) · 8 thời đại văn minh (Hồng Hoang→Siêu Việt) · Tích hợp 7 nguồn dữ liệu: lcaiData/kingdomData/empireData/sectV29Data/divV30Data/mvData/countries · gameTick mỗi 5 ticks · Breakthrough events → htAddEvent + wmeAddMemory + waeAddAlert · Save: cgv6_civ_evolution_v38

### index.html Updates
- Thêm `<script src="civEvolutionEngineV38.js">` 
- Thêm 6 panel divs: panel-civ-overview-v38, panel-civ-evolution-v38, panel-civ-tech-v38, panel-civ-culture-v38, panel-civ-religion-v38, panel-civ-stats-v38
- Extend `mvHubRenderPanel()` — thêm section V38 với stats cards + 6 tab buttons (KHÔNG tạo tab sidebar mới)

### Integration Points
- Tích hợp `window.lcaiData.civilizations` (livingCivilizationAI) — đọc traits để boost pillar tương ứng
- Tích hợp `window.kingdomData`, `window.empireData` — dùng Array.isArray + Object.values safety (V33 pattern)
- Tích hợp `window.sectV29Data.sects`, `window.divV30Data.beings` — sects boost magic/science, divine boost religion/magic
- Tích hợp `window.mvData.universes` — universes tiến hóa nhanh hơn (+0.5 rate)
- Tích hợp `window.techData.globalTechLevel` (technologyEngine) — boost technology pillar
- Fire events → Historical Timeline, World Memory, World Alert (Jarvis)

### UI (trong 🌌 Đa Vũ Trụ hub — KHÔNG sidebar mới)
- 🌟 Nền Văn Minh — tổng quan cards với 6 pillar bars + thời đại
- 📈 Tiến Hóa — biên niên sử 200 sự kiện đột phá
- ⚙️ Công Nghệ — xếp hạng pillar technology với tier distribution
- 🎨 Văn Hóa — xếp hạng pillar culture với tier distribution
- 🛕 Tôn Giáo — xếp hạng pillar religion với tier distribution
- 📊 Thống Kê — tổng hợp 6 pillars + phân loại + Top 10 văn minh

### Save Keys
- `cgv6_civ_evolution_v38`

---

## [V37] — 2026-06-13 — Infinite Universe Generator

### New Systems Added
- Universe Generator Engine (`universeGeneratorEngine.js`) — Seed-based procedural generation · Batch · 5 Presets · Tích hợp V35 mvCreateUniverse · Tích hợp V36 tlCreateTimeline · panel-universe-generator-v37
- Universe Law Engine (`universeLawEngine.js`) — 8 quy luật vật lý (lingqi/gravity/slow_time/chaos/neg_entropy/mechanical/divine_dom/dark_qi) · Per-tick effects · Sự kiện đặc biệt ngẫu nhiên · panel-universe-laws-v37
- Universe Lifecycle Engine (`universeLifecycleEngine.js`) — 7 giai đoạn (BigBang→Lạm Phát→Hình Thành Sao→Kỷ Nguyên Vàng→Suy Thoái→Hấp Hối→Nhiệt Chết) · Auto-tick · Heat Death trigger · ulcAccelerate/ulcRestore
- Universe Observatory Engine (`universeObservatoryEngine.js`) — Đài quan sát · Bất thường detection · Kỷ lục vũ trụ · So sánh · Vũ trụ nguy hiểm alert · panel-universe-observatory-v37

### index.html Updates
- Added 4 `<script>` tags (V37 scripts — đặt TRƯỚC V36 scripts)
- Added 3 panel divs (panel-universe-generator-v37, panel-universe-laws-v37, panel-universe-observatory-v37)
- Extended `mvHubRenderPanel()` with V37 section (3 internal tab buttons + live stats) — NO new sidebar tab

### Integration
- Kết nối V35 Multiverse: gọi `window.mvCreateUniverse()` — KHÔNG sửa multiverseEngine.js
- Kết nối V36 Timeline: tự động `window.tlCreateTimeline()` cho mỗi vũ trụ mới
- Kết nối Historical Timeline: `window.htAddEvent()` cho mọi sự kiện vũ trụ
- Gắn physics law (.physicsLaw, .physicsLawName, .physicsLawColor) vào universe object của V35
- Gắn lifecycle (.lifecyclePhase, .lifecycleAge, .heatDeathRisk) vào universe object của V35
- gameTick chain: 4 hooks mới (ugData, ulData, ulcData, uobData)

### Save Keys
- cgv6_universe_generator_v37, cgv6_universe_laws_v37, cgv6_universe_lifecycle_v37, cgv6_universe_observatory_v37

---

## [V36] — 2026-06-13 — Alternate Timeline System

### New Systems Added
- Timeline Engine (`timelineEngine.js`) — Core · 7 loại (canonical/dark/golden/divine/apocalypse/demon/lost) · CRUD · Auto-init · gameTick · panel-timeline-v36
- Timeline Manager (`timelineManager.js`) — Creator controls · Stabilize/Purge/AlterHistory/AddGods/AddKingdoms/Snapshot · Intervention log
- Timeline Registry (`timelineRegistry.js`) — Danh mục · Rankings · Đồng bộ tự động · panel-timeline-analytics-v36
- Timeline Branch Engine (`timelineBranchEngine.js`) — 8 triggers · Auto-branch 200 ticks · tbRegisterEvent · tlBranchFromWorld
- Timeline Travel Engine (`timelineTravelEngine.js`) — 3 loại (Player/God/Creator) · Danger/Risk system · Auto-travel 150 ticks · panel-timeline-travel-v36
- Timeline Event Engine (`timelineEventEngine.js`) — 10 "what if" scenarios · Auto-generate 180 ticks · teeGenerateEvent · teeAutoGenerate
- Timeline Merge Engine (`timelineMergeEngine.js`) — Merge · Split · Archive · Snapshot · tmeMerge · tmeSplit · tmeArchive
- Timeline War Engine (`timelineWarEngine.js`) — 4 loại (invasion/conquest/erasure/corruption) · Auto-resolve · Auto-war 200 ticks · panel-timeline-wars-v36
- Timeline Analytics (`timelineAnalytics.js`) — SVG tree map · Comprehensive stats · Reports · Threat detection · panel-timeline-map-v36 + panel-timeline-analytics-v36

### index.html Updates
- Added 9 `<script>` tags (timelineEngine → timelineAnalytics)
- Added 5 panel divs (panel-timeline-v36, panel-timeline-map-v36, panel-timeline-wars-v36, panel-timeline-travel-v36, panel-timeline-analytics-v36)
- Extended `mvHubRenderPanel()` with V36 Timeline section (5 internal tab buttons) — NO new sidebar tab

### Integration
- Kết nối với V35 Multiverse (window.mvData.activeUId)
- Kết nối với Historical Timeline (htAddEvent)
- Kết nối với World Memory (wmAddMemory)
- Kết nối với gameTick chain (9 hooks)

### Compatibility
- 100% backward compatible. Tất cả save data V35 và trước đó load bình thường.
- 9 localStorage keys mới với prefix cgv6_timeline_*_v36

---

## [V35] — 2026-06-13 — Multiverse Portal Network

### New Systems Added
- Multiverse Engine (`multiverseEngine.js`) — Core đa vũ trụ · 10 loại vũ trụ · Tạo/Xóa/Clone/Merge/Split · gameTick · Auto-spawn · Render panel-multiverse-v35
- Universe Registry (`universeRegistry.js`) — Danh mục vũ trụ · Rankings · Thống kê · Phân loại theo type · panel-universe-rankings
- Universe Manager (`universeManager.js`) — Creator God controls · Boost/Populate/Event/Snapshot · Panel-universes · Intervention log
- Portal Network (`portalNetwork.js`) — 5 loại cổng (Local/Realm/World/Universe/Creator) · Auto-connect · Stability decay · panel-portals-v35
- Universe Travel Engine (`universeTravelEngine.js`) — 5 loại phái đoàn (Player/Guild/Sect/Kingdom/God) · Danger system · Auto-travel · panel-universe-travel
- Multiverse Map Engine (`multiverseMapEngine.js`) — SVG bản đồ động · Animated universe nodes · Portal routes · Traveler dots · panel-multiverse-map
- Multiverse War Engine (`multiverseWarEngine.js`) — 4 loại chiến tranh · Auto-resolve · Hậu quả thực tế · panel-universe-wars
- Multiverse Economy (`multiverseEconomy.js`) — 6 hàng hóa · Giá thị trường động · Mua/Bán liên vũ trụ · panel-multiverse-economy

### Files Added (8 files)
- `multiverseEngine.js`, `universeRegistry.js`, `universeManager.js`
- `portalNetwork.js`, `universeTravelEngine.js`, `multiverseMapEngine.js`
- `multiverseWarEngine.js`, `multiverseEconomy.js`

### Files Modified
- `index.html` — Added 8 script tags, 1 nav button (hub), 9 panel divs, mvHubRenderPanel(), updated v23Panels unlock array (+multiverse-hub-v35)

### UI Tabs Added (1 hub → 8 sub-panels)
- 🌌 Đa Vũ Trụ V35 (`panel-multiverse-hub-v35`) — Hub chính với 8 sub-panels
- 🌌 Multiverse (`panel-multiverse-v35`) — Danh sách & quản lý vũ trụ
- 🌀 Portals (`panel-portals-v35`) — Mạng lưới cổng
- 🌍 Universes (`panel-universes`) — Creator God controls
- ⚔️ Universe Wars (`panel-universe-wars`) — Chiến tranh liên vũ trụ
- 📊 Universe Rankings (`panel-universe-rankings`) — Bảng xếp hạng
- 🗺 Multiverse Map (`panel-multiverse-map`) — Bản đồ SVG động
- ✈️ Universe Travel (`panel-universe-travel`) — Du hành
- 💰 Multiverse Economy (`panel-multiverse-economy`) — Thương mại

### Universe Types (10 types)
- 🏰 Fantasy · ⚡ Cultivation · ✨ Divine · 👹 Demon · ⚙️ Technology
- 🌆 Cyberpunk · 🌊 Mythology · ☠️ Apocalypse · 🌊 Ocean · 🐉 Beast

### Portal Types (5 types)
- 🔵 Local · 🟣 Realm · 🟡 World · 🔴 Universe · ⚪ Creator (vô hạn)

### War Types (4 types)
- ⚔️ Universe War · 🌋 Realm War · ✨ Divine Invasion · 🏰 Empire Expand

### Trade Goods (6 types)
- 💎 Linh Khí Tinh · ✨ Thần Kim Sa · 🌑 Hắc Ám Bảo Thạch · ⚙️ Lõi Công Nghệ · 📜 Thần Thoại Thánh Khí · ⚡ Mảnh Hư Không

### Save Keys Added
- `cgv6_multiverse_v35` — Multiverse core (universes, log)
- `cgv6_universe_registry_v35` — Registry & rankings
- `cgv6_universe_manager_v35` — Interventions & snapshots
- `cgv6_portal_network_v35` — Portals, routes, traffic
- `cgv6_universe_travel_v35` — Journeys, travelers
- `cgv6_multiverse_map_v35` — Map positions
- `cgv6_multiverse_war_v35` — Wars, history
- `cgv6_multiverse_economy_v35` — Trades, listings, market

### Integration
- multiverseEngine → historicalTimeline (htAddEvent) + worldMemoryEngine (wmAddMemory)
- portalNetwork → historicalTimeline (portal opened events)
- universeTravelEngine → historicalTimeline (arrivals)
- multiverseWarEngine → historicalTimeline (war declared/ended)
- multiverseEconomy → historicalTimeline (trade events)
- All engines → gameTick chain (LIFO wrap pattern)
- All engines → addLog (nhật ký game)
- Extends portalEngineV30.js — KHÔNG xóa, KHÔNG ghi đè

### Compatibility
- 100% backward compatible. Tất cả save data V34 và trước đó load bình thường.
- portalEngineV30.js giữ nguyên, V35 là extension độc lập.

---

## [V34] — 2026-06-13 — Hệ Thống Thế Giới Đa Người Chơi

### New Systems Added
- Multiplayer Engine (`multiplayerEngine.js`) — BroadcastChannel API · SessionID per tab · panel-multiplayer · Navigation hub
- Player Session Manager (`playerSessionManager.js`) — Heartbeat 15s · Online threshold 45s · Tab-based presence
- Account Engine (`accountEngine.js`) — Đăng ký/Đăng nhập/Đăng xuất · SimpleHash · SessionStorage · Đổi màu avatar
- World Sync Engine (`worldSyncEngine.js`) — Snapshot mỗi 30 ticks · Cross-tab sync Kingdom/Empire/Boss/NPC · BroadcastChannel
- Player Presence Engine (`playerPresenceEngine.js`) — Online list · Friend requests · panel-players-online · Friend management
- World Chat Engine (`worldChatEngine.js`) — 6 kênh (Global/Kingdom/Empire/Guild/Sect/Divine) · Real-time · Auto-refresh 5s
- Player Marketplace (`playerMarketplace.js`) — Đăng bán · Mua · Cross-tab trading · panel-player-market
- Multiplayer Event Engine (`multiplayerEventEngine.js`) — 6 loại sự kiện · Auto-spawn Boss Hunt · panel-mp-events
- Anti-Cheat Engine (`antiCheatEngine.js`) — Rate limit · Time validation · Resource overflow · Session flagging

### Files Added (9 files)
- `multiplayerEngine.js`, `playerSessionManager.js`, `accountEngine.js`
- `worldSyncEngine.js`, `playerPresenceEngine.js`, `worldChatEngine.js`
- `playerMarketplace.js`, `multiplayerEventEngine.js`, `antiCheatEngine.js`

### Files Modified
- `index.html` — Added 9 script tags, 9 nav buttons, 9 panel divs, updated v23Panels unlock array (+9 panels)

### UI Tabs Added (9 tabs)
- 🌐 Đa Người Chơi (`panel-multiplayer`) — Main hub, account quick-access, online players, nav shortcuts
- 👥 Người Chơi (`panel-players-online`) — Online player list, friend requests, accounts in device
- 💬 Trò Chuyện (`panel-world-chat`) — Real-time chat 6 channels, send/receive cross-tab
- 🤝 Bạn Bè (`panel-mp-friends`) — Friend list, remove friends, link to player presence
- 🏛 Chính Phủ (`panel-player-gov`) — Voting/election stub, V35 placeholder
- 🏪 Chợ (`panel-player-market`) — Buy/sell listings, cross-tab marketplace, transaction history
- 🏆 Sự Kiện (`panel-mp-events`) — Active events, join events, create events, ended events history
- 👤 Tài Khoản (`panel-mp-account`) — Login/Register forms, profile view, avatar color picker

### Save Keys Added
- `cgv6_mp_core_v34` — Multiplayer core state
- `cgv6_mp_sessions_v34` — Session tracking (cross-tab)
- `cgv6_mp_accounts_v34` — Account data (multi-account support)
- `cgv6_mp_worldsync_v34` — World sync snapshots
- `cgv6_mp_chat_v34` — Chat messages (200 max)
- `cgv6_mp_market_v34` — Marketplace listings & transactions
- `cgv6_mp_events_v34` — Multiplayer events & participations
- `cgv6_mp_anticheat_v34` — Anti-cheat violations & session flags

### Technical Architecture
- **BroadcastChannel API** — Real-time cross-tab sync (chat, presence, market, events, world data)
- **sessionStorage** — Unique session ID per browser tab (= unique player per tab)
- **localStorage** — Shared state: accounts, sessions, chat, marketplace, events
- **No backend required** — Pure browser-based multiplayer

### Features
- Nhiều tab trình duyệt = nhiều người chơi khác nhau trong cùng thế giới
- Mỗi player có tài khoản riêng với username, password hash, avatar color
- Chat real-time giữa các tab với 6 kênh khác nhau
- Marketplace: đăng bán vật phẩm, người chơi khác (tab khác) có thể mua
- Sự kiện toàn cầu: Boss Hunt, Kingdom War, Sect Tournament...
- Anti-cheat: rate limiting, time manipulation detection, resource overflow check
- Tương thích hoàn toàn với save data cũ

---

## [V33] — 2026-06-13 — Thủ Hộ Thần (AI Advisor System)

### New Systems Added
- Thủ Hộ Thần Core (`thuhothanCore.js`) — Main AI hub · Q&A engine (keyword-based, 12+ queries) · Chat history · Panel coordinator
- Bộ Nhớ Thủ Hộ Thần (`thuhothanMemory.js`) — Persistent memory 200 sự kiện · 8 loại · Tìm kiếm · Lọc theo năm/loại
- Tính Cách Thần (`thuhothanPersonality.js`) — Personality system · Message formatting (normal/urgent/reflective) · Number formatter
- Cảnh Báo Thế Giới (`worldAlertEngine.js`) — Phát hiện tự động 8 loại sự kiện · Critical/High/Medium/Low alerts
- Bản Tin Sự Kiện (`eventFeedEngine.js`) — Live news feed từ tất cả engines · Filter · 300 items
- Phân Tích Thế Giới (`worldAdvisor.js`) — Strongest Kingdom/Empire · Wars · Threats · Economic Issues · Divine Status · Stability Score
- Cố Vấn Người Chơi (`playerAdvisor.js`) — Tu Luyện · Thăng Thiên · Chiến Đấu · Ngoại Giao · Thương Mại
- Cố Vấn Tạo Hóa (`creatorAdvisor.js`) — World Stability Report · Dangerous Events · Suggested Actions · Divine Conflicts

### Files Added (8 files)
- `thuhothanCore.js`, `thuhothanMemory.js`, `thuhothanPersonality.js`
- `worldAlertEngine.js`, `eventFeedEngine.js`
- `worldAdvisor.js`, `playerAdvisor.js`, `creatorAdvisor.js`

### Files Modified
- `index.html` — Added 8 script tags, 5 nav buttons, 5 panel divs, updated v23Panels unlock array (+5 panels)

### UI Tabs Added (5 tabs)
- 🤖 Thủ Hộ Thần (`panel-thuhothan`) — Main AI hub + Q&A + Creator advisor
- 📢 Tin Tức TG (`panel-world-news`) — Live event feed from all engines
- 🚨 Cảnh Báo (`panel-alerts`) — Alert center (Critical/High/Medium/Low)
- 📊 Cố Vấn (`panel-advisor`) — Player advisor (6 domains)
- 📖 Báo Cáo TG (`panel-world-report`) — World report (full analysis)

### Save Keys Added (4 keys)
- `cgv6_thuhothan_mem_v33` — Bộ nhớ Thủ Hộ Thần
- `cgv6_world_alert_v33` — Cảnh báo thế giới
- `cgv6_event_feed_v33` — Bản tin sự kiện
- `cgv6_thuhothan_core_v33` — Core state + chat history

### Features
- Q&A Engine: "Vương quốc mạnh nhất?", "Chiến tranh?", "Boss nguy hiểm?", "100 năm qua?", "Thần lửa?", v.v.
- Auto-detect world changes mỗi tick và tạo cảnh báo/tin tức tự động
- Voice-ready architecture (không cần external API)
- Tương thích hoàn toàn với tất cả save data cũ

---

## [V32] — 2026-06-13 — Creator God Control Panel

### New Systems Added
- Creator God Control V32 (`creatorGodControl.js`) — Kiểm soát Thế Giới/Vương Quốc/Đế Chế/Thảm Họa/Boss/Cổ Vật/Người Chơi/Timeline
- Divine Administration V32 (`divineAdministration.js`) — Tạo/Xóa Thần · Lãnh Địa · Thần Điện · Thần Chiến
- Creator Analytics V32 (`creatorAnalytics.js`) — Phân Tích Thế Giới toàn diện 8 chỉ số

### Files Added
- `creatorGodControl.js` — World/Kingdom/Empire/Disaster/Boss/Artifact/Player/Timeline controls + Snapshot system
- `divineAdministration.js` — Divine creation · Domain assignment · Pantheon · Divine War
- `creatorAnalytics.js` — Population · Economy · Military · Religion · Technology · Stability · Divine · Boss analytics

### Files Modified
- `index.html` — Added 3 script tags, 3 nav buttons, 3 panel divs, updated v23Panels unlock array

### UI Tabs Added
- 👁 Bảng ĐK Creator (`panel-creator-control`) — creatorGodControl.js (8 sub-tabs)
- 👼 Kiểm Soát Thần (`panel-divine-admin`) — divineAdministration.js
- 📊 Phân Tích TG (`panel-creator-analytics`) — creatorAnalytics.js

### Integration
- creatorGodControl.js → kingdomEngine.js (kingdom CRUD)
- creatorGodControl.js → empireEngine.js (empire CRUD)
- creatorGodControl.js → disasterEngine.js + plagueEngine.js (disaster triggers)
- creatorGodControl.js → worldBossEngineV31.js (boss summon)
- creatorGodControl.js → invasionEngineV31.js (invasion trigger)
- creatorGodControl.js → artifactSystem.js (artifact creation)
- creatorGodControl.js → playerEngine.js (player level/title/resources)
- divineAdministration.js → divineBeingEngine.js + divineWarEngine.js + pantheonEngineV30.js
- creatorAnalytics.js → all global data (read-only aggregation)
- All engines → historicalTimeline (htAddEvent hook)

### Save Keys (localStorage)
- `cgv6_creator_control_v32` — Snapshots + action history
- `cgv6_divine_admin_v32` — Deities + divine wars + pantheons
- `cgv6_creator_analytics_v32` — Analytics cache

### EXPAND ONLY — creatorGodEngine.js (V1) kept intact, V32 extends it

---

## [V31] — 2026-06-13 — World Boss & Dungeon System

### New Systems Added
- World Boss Engine V31 (`worldBossEngineV31.js`) — 6 tiers boss · Auto-spawn · Auto-kill · Boss evolution trigger
- Dungeon Engine V31 (`dungeonEngineV31.js`) — 6 loại dungeon · Floor layout · Auto-explore NPC
- Raid Engine V31 (`raidEngineV31.js`) — 6 loại raid: Solo/Party/Guild/Sect/Kingdom/Empire
- Invasion Engine V31 (`invasionEngineV31.js`) — 5 loại xâm lược · Auto-defense · Wave system
- Boss Evolution Engine V31 (`bossEvolutionEngineV31.js`) — Regional→Continental→World→Realm threat
- Legendary Hunt Engine V31 (`legendaryHuntEngineV31.js`) — First Kill · Fastest · Rankings · Dungeon records
- Loot Engine V31 (`lootEngineV31.js`) — 6 loại loot · Drop tables per boss tier · Apply loot to NPC/Player

### Files Added
- `lootEngineV31.js` — Gold/Spirit Stones/Artifacts/Divine Relics/Techniques/Rare Materials
- `worldBossEngineV31.js` — Rare/Epic/Legendary/Mythic/Divine/Creator tiers · 15 boss templates
- `dungeonEngineV31.js` — Ancient Ruins/Demon Cave/Spirit Forest/Divine Temple/Heavenly Palace/Void Labyrinth
- `raidEngineV31.js` — 6 raid types · Power calculation · Casualty system
- `invasionEngineV31.js` — Demon/Undead/Divine/Void/Titan invasions · Effect system
- `bossEvolutionEngineV31.js` — 4 threat levels · Tick-based evolution
- `legendaryHuntEngineV31.js` — Kill records · First Kill · Fastest Kill · Hunter leaderboard

### Files Modified
- `index.html` — Added 7 script tags, 6 nav buttons, 6 panel divs, updated v23Panels unlock array

### UI Tabs Added
- 👹 World Boss (`panel-worldboss-v31`) — worldBossEngineV31.js
- 🏛 Dungeon V31 (`panel-dungeon-v31`) — dungeonEngineV31.js
- ⚔️ Raid V31 (`panel-raid-v31`) — raidEngineV31.js
- 🌋 Xâm Lược (`panel-invasion-v31`) — invasionEngineV31.js
- 🏆 Săn Boss (`panel-hunt-v31`) — legendaryHuntEngineV31.js
- 🎁 Loot V31 (`panel-loot-v31`) — lootEngineV31.js

### Integration
- worldBossEngine → lootEngine (auto generate loot on kill)
- worldBossEngine → legendaryHuntEngine (record first kill, fastest kill)
- worldBossEngine → bossEvolutionEngine (trigger evolution, on kill hook)
- dungeonEngine → legendaryHuntEngine (record dungeon clears)
- invasionEngine → worldBossEngine (spawn boss on invasion)
- raidEngine → worldBossEngine (attack/kill boss via raid)
- All engines → historicalTimeline + worldMemoryEngine (addWorldHistory hook)
- All engines → gameTick (chained wrap pattern)

### Save Keys (localStorage)
- `cgv6_worldboss_v31` — World Boss state
- `cgv6_dungeon_v31` — Dungeon V31 state
- `cgv6_raid_v31` — Raid history
- `cgv6_invasion_v31` — Invasion state
- `cgv6_bossevo_v31` — Boss evolution log
- `cgv6_hunt_v31` — Hunt records & rankings
- `cgv6_loot_v31` — Loot history

---

## [V24] — 2026-06-12 — Diplomacy Engine

### New Systems Added
- Alliance Engine V24 (`allianceEngine.js`)
- Treaty Engine V24 (`treatyEngine.js`)
- Sanction Engine V24 (`sanctionEngine.js`)
- World Council Engine V24 (`worldCouncilEngine.js`)
- Diplomacy Hub V24 (`diplomacyEngine.js`)

### Files Added
- `allianceEngine.js` — 6 alliance types, AI auto-formation/dissolution
- `treatyEngine.js` — 8 treaty types, expiry, AI peace proposals
- `sanctionEngine.js` — 5 sanction types, Vassal/Protectorate/Tributary
- `worldCouncilEngine.js` — Sessions, 8 resolution types, auto-vote AI
- `diplomacyEngine.js` — Hub V24, relation matrix, intl-relations panel

### Files Modified
- `index.html` — Added 4 nav buttons, 6 panel divs, 5 script tags, updated unlock list

### UI Changes
- Added tab: 🤝 Ngoại Giao V24 (`panel-diplomacy-v24`)
- Added tab: 📜 Hiệp Ước (`panel-treaties-v24`)
- Added tab: 🏛 Hội Đồng (`panel-world-council`)
- Added tab: 🌍 Quan Hệ Quốc Tế (`panel-intl-relations`)
- Hidden panel for alliances (`panel-alliance-v24`) accessible from Ngoại Giao V24
- Hidden panel for sanctions (`panel-sanctions-v24`) accessible from Ngoại Giao V24

### Save Data Changes
- New key: `cgv6_alliance_v24`
- New key: `cgv6_treaty_v24`
- New key: `cgv6_sanction_v24`
- New key: `cgv6_worldcouncil_v24`

### Bug Fixes
- None

### Compatibility Notes
- 100% backward compatible. All V23 save data loads normally.
- `diplomaticEngine.js` V1 untouched. V24 engines extend it via `window.drGetRelation`.

---

## [V23] — Pre-2026-06-12 — Empire & Kingdom Engine

### New Systems Added
- Kingdom Engine V23
- Empire Engine V23
- Succession Engine
- Noble House Engine
- Bloodline Engine
- Hereditary Bloodline Engine
- Living Civilization AI
- Naval Ocean Engine
- Kingdom AI
- Empire AI
- Rankings Engine
- Diplomatic Engine V1
- Espionage Engine V1
- Political Religion Engine V1
- Culture Heritage Engine V1

### Files Added
- `kingdomEngine.js`, `empireEngine.js`, `successionEngine.js`
- `nobleHouseEngine.js`, `bloodlineEngine.js`, `hereditaryBloodlineEngine.js`
- `livingCivilizationAI.js`, `navalOceanEngine.js`
- `kingdomAI.js`, `empireAI.js`, `rankingsEngine.js`
- `diplomaticEngine.js`, `espionageEngine.js`
- `politicalReligionEngine.js`, `cultureHeritageEngine.js`
- `historicalTimeline.js`

### Files Modified
- `index.html` — Added V23 section tabs and unlock script

### UI Changes
- Added V23 tab group: Kingdoms, Empires, Bloodlines, Noble Houses, Succession Wars, Timeline, Rankings, Ngoại Giao, Gián Điệp, Tôn Giáo, Văn Hóa

### Compatibility Notes
- 100% backward compatible with pre-V23 saves.

---

## [V22 and Earlier] — Pre-2026

> Các phiên bản trước V23 được gộp chung. Chi tiết nằm trong source code comments.

### Systems Present from V1–V22
- Core simulation loop (app.js)
- NPC cultivation system
- Sect system
- Country system
- World Map (2D + 3D)
- Economy System (V1, V2)
- War Engine
- Territory System
- Dungeon System
- Quest System (V1, V2)
- AI Story Engine
- Artifact System (V7)
- Catastrophe System
- Age Engine
- Religion Engine
- Mythology Engine
- Technology Engine
- Hero Legend Engine
- World Memory Engine
- Spirit Beast System
- Migration Engine
- Heavenly Dao Engine
- Continent Engine
- World Event Engine
- Player System
- Creator God Engine
- Save Manager
- Multi-World System
- World Hub V6
- LOD Performance System
- Time Control System
- Thiên Đình System V2
- Auto Player AI
- Global Search System
- WebXR System
