# V116 — FULL LOGIC AUDIT
**Creator God V6 · Ngày audit: 2026-06-15**
**Phạm vi: 289 file JS · 288+ localStorage keys · 197+ hệ thống**

---

## 1. ENGINE ĐANG HOẠT ĐỘNG (Active Engines)

### TIER 1 — Core Loop (không thể tắt)
| Engine | File | Vai trò |
|---|---|---|
| **World Simulation** | `app.js` | `year++`, NPC/Country/Sect tick, gameTick chain gốc |
| **Save Manager** | `saveManager.js` | Load/save toàn bộ core data |
| **Kingdom AI** | `kingdomEngine.js` + `kingdomAI.js` | Vương quốc tick |
| **Empire AI** | `empireEngine.js` + `empireAI.js` | Đế chế tick |
| **War Engine** | `warEngine.js` | Chiến tranh tick |

### TIER 2 — Simulation Engines (hook vào gameTick)
| Engine | File | Init (ms) |
|---|---|---|
| World Autonomy Clock | `worldAutonomyClockV92.js` | 24200 |
| Autonomous Event Engine | `autonomousEventEngineV92.js` | 24300 |
| Life Engine V93 | `lifeEngineV93.js` | 24700 |
| Species System V93 | `speciesSystemV93.js` | 24800 |
| Life Events V93 | `lifeEventsV93.js` | 24900 |
| Life Activation V94 | `lifeActivationEngineV94.js` | 25100 |
| Civ Evolution Core V95 | `civEvolutionCoreV95.js` | 25200 |
| Civ Events V95 | `civEventsV95.js` | 25300 |
| Diplomacy Engine V24 | `diplomacyEngine.js` | ~6000 |
| Alliance Engine V24 | `allianceEngine.js` | ~6000 |
| Espionage Engine | `espionageEngine.js` | ~6000 |
| Government V49 | `governmentSystemV49.js` | ~7000 |
| Economy V52 | `playerEconomyCoreV52.js` | 6800 |
| Disaster Engine V25 | `disasterEngine.js` | ~5000 |
| Plague Engine | `plagueEngine.js` | ~5000 |

### TIER 3 — Diagnostic / Infrastructure
| Engine | File | Vai trò |
|---|---|---|
| Logic Health Check | `logicHealthCheck.js` | Monitor 6 data points, 60s |
| Health Check Fix | `healthCheckFixV96.js` | Vá 3 false-positive |
| Universe Sync Bridge | `universeSyncBridgeV95.js` | Sync dashboard stats |
| Self Running World Fix | `selfRunningWorldFixV115.js` | Sync autonomous world panel |
| Performance Monitor | `performanceMonitor.js` | FPS/tick monitoring |
| Backup Engine | `backupEngine.js` | Auto-backup mỗi 500 ticks |
| Analytics Engine | `analyticsEngine.js` | 27 metrics |

### TIER 4 — UI-Only (không tick, chỉ render)
Tất cả Registry files: `lifeRegistryV93.js`, `civRegistryV95.js`, `heroRegistryV47.js`, `ecoRegistry.js`, `disasterRegistryV48.js`, `autonomousWorldRegistryV92.js`, các `puos*Panel.js`...

---

## 2. TOÀN BỘ LOCALSTORAGE KEYS (288 keys)

### CORE DATA (app.js — hardcoded strings)
```
cgv6_world          cgv6_npcs           cgv6_sects
cgv6_countries      cgv6_bosses         cgv6_regions
cgv6_realms         cgv6_timeline       cgv6_logs
cgv6_year           cgv6_heaven         cgv6_hof
cgv6_idctr          cgv6_warLogs        cgv6_activeWars
cgv6_worldEvents    cgv6_activeWorldEvent cgv6_worldHistory
cgv6_dynasties      cgv6_popStats       cgv6_territories
```

### V92–V95 (Autonomous World & Life)
```
cgv6_autonomy_clock_v92     cgv6_world_chronicle_v92
cgv6_autonomous_events_v92  cgv6_auto_world_reg_v92
cgv6_jarvis_observer_v92    cgv6_life_engine_v93
cgv6_species_v93            cgv6_life_events_v93
cgv6_life_reg_v93           cgv6_life_activation_v94
cgv6_civ_core_v95           cgv6_civ_events_v95
cgv6_civ_reg_v95
```

### ECONOMY
```
cgv6_economy            cgv6_economy_v2         cgv6_econAudit
cgv6_player_economy_v52 cgv6_player_market_v52  cgv6_business_v52
cgv6_taxation_v52       cgv6_economy_reg_v52    cgv6_goods_v54
cgv6_trade_registry_v54 cgv6_black_market_v54   cgv6_econ_crisis_v54
cgv6_engCities          cgv6_engTradeRoutes     cgv6_engGuilds
cgv6_ev2Banks           cgv6_ev2Monopolies      cgv6_ev2BlackMarkets
```

### CIVILIZATION & POLITICS
```
cgv6_kingdoms          cgv6_empires            cgv6_living_civ_ai
cgv6_civ_evolution_v38 cgv6_player_civ_v58     cgv6_civ_culture_v58
cgv6_civ_law_v58       cgv6_civ_history_v58    cgv6_civ_registry_v58
cgv6_government_v49    cgv6_cont_politics_v49  cgv6_politics_reg_v49
cgv6_emergent_civ_v76  cgv6_civ_consciousness_v76
```

### EVENTS & HISTORY (⚠️ Trùng lặp nhiều nhất)
```
cgv6_historical_timeline    cgv6_worldMemoryEngine
cgv6_world_chronicle_v92    cgv6_autonomous_events_v92
cgv6_worldChronicle         cgv6_worldEventChains
cgv6_worldLegends           cgv6_aiMemory
cgv6_worldStory             cgv6_storyChapters
cgv6_life_events_v93        cgv6_civ_events_v95
cgv6_event_feed_v33         cgv6_event_gen_v41
cgv6_event_archive_v59      cgv6_event_scheduler_v59
cgv6_lwe_events
```

### WAR & DIPLOMACY
```
cgv6_warEngine (chứa warsActive) cgv6_activeWars
cgv6_diplomacyState    cgv6_diplomacy_v30
cgv6_alliance_v39      cgv6_mv_war_v39
cgv6_conquest_v39      cgv6_mv_invasion_v39
cgv6_mv_alliance_v39   cgv6_guild_war_v53
```

---

## 3. MAP: PANEL UI → NGUỒN DỮ LIỆU

| Panel UI | Đọc từ | Key localStorage | Engine ghi |
|---|---|---|---|
| **Dân Số (Dashboard)** | `npcs.length` | `cgv6_npcs` | `app.js` |
| **Dân Số (Life Panel)** | `lev93GetCurrentPop()` | `cgv6_life_engine_v93` | `lifeEngineV93` |
| **Dân Số (PUOS)** | `lev93GetCurrentPop()` | `cgv6_life_engine_v93` | `lifeEngineV93` |
| **Dân Số (Territory)** | sum `territories[].population` | `cgv6_territories` | `app.js` |
| **Dân Số (Universe Hub)** | `world.population` | `cgv6_world` | `app.js` (STATIC) |
| **Năm hiện tại** | `window.year` | `cgv6_year` | `app.js` |
| **Universe Age** | `wacV92Data.totalYearsElapsed` | `cgv6_autonomy_clock_v92` | `worldAutonomyClockV92` |
| **Văn Minh (PUOS)** | `cecV95Data.civs.length` | `cgv6_civ_core_v95` | `civEvolutionCoreV95` |
| **Văn Minh (Hub)** | `countries.length` (fallback) | `cgv6_countries` | `app.js` |
| **Văn Minh (V38 Panel)** | `civEvoData.civilizations` | `cgv6_civ_evolution_v38` | `civEvolutionEngineV38` |
| **Sự Kiện (Chronicle)** | `wchV92Data.yearEntries` | `cgv6_world_chronicle_v92` | `worldChronicleV92` |
| **Sự Kiện (Health Check)** | `wchV92Data.events` ❌KHÔNG TỒN TẠI | — | BUG |
| **Lịch Sử** | `htData.events` | `cgv6_historical_timeline` | nhiều engines |
| **Ký Ức TG** | `worldMemoryData` | `cgv6_worldMemoryEngine` | `worldMemoryEngine` |
| **Chiến Tranh** | `warsActive` từ `warEngine` | `cgv6_activeWars` | `warEngine.js` |
| **Kingdoms** | `kingdomData.kingdoms` | `cgv6_kingdoms` | `kingdomEngine` |
| **Empires** | `empireData.empires` | `cgv6_empires` | `empireEngine` |
| **Economy** | nhiều engines độc lập | cgv6_economy* | 5 engine kinh tế |
| **Loài Sinh Vật** | `spv93Data.species` | `cgv6_species_v93` | `speciesSystemV93` |

---

## 4. PHÂN TÍCH TRÙNG LẶP DỮ LIỆU

### 4A. POPULATION — 4 bản song song

| Nguồn | Giá trị điển hình | Đơn vị | Cập nhật |
|---|---|---|---|
| `lev93Data.globalPop` | 500K–5M | Sinh linh hư cấu | Mỗi 60 tick |
| `spv93Data.species[].population` | Tổng = globalPop | Theo loài | Mỗi 60 tick |
| `npcs.length` | 50–500 | NPC cá nhân có tên | Event-based |
| `countries[].population` | 10K–500K/nước | Dân số quốc gia | Kingdom tick |
| `world.population` | Không đổi sau tạo | **STATIC — legacy** | KHÔNG bao giờ |

**⚠️ Vấn đề:** Dashboard cũ hiển thị `npcs.length` = 50-500 người. PUOS hiển thị `lev93` = 500K. Người dùng thấy 2 con số rất khác nhau cho cùng "dân số".

### 4B. YEAR — 3 bản song song

| Nguồn | Hành vi | Vấn đề |
|---|---|---|
| `window.year` | Tăng liên tục, persist ✅ | **SSOT thực sự** |
| `wacV92Data.totalYearsElapsed` | Session counter — reset sau reload | Luôn < window.year |
| `window.world.year` | Gán lúc tạo thế giới, không bao giờ update | Mãi = năm 1 |

### 4C. EVENTS — 8 hệ thống ghi sự kiện độc lập

| Key | Loại sự kiện | Giao nhau với |
|---|---|---|
| `cgv6_historical_timeline` | Mọi sự kiện quan trọng | ✅ Được ghi bởi 15+ engine |
| `cgv6_world_chronicle_v92` | Nhóm theo năm (yearEntries) | Nhận từ autonomousEvents |
| `cgv6_autonomous_events_v92` | 5 loại random mỗi năm | Cũng ghi vào chronicle |
| `cgv6_worldChronicle` (aiStory) | AI-generated chains | ⚠️ Key khác với chronicle V92 |
| `cgv6_worldStory` | Narrative chapters | Độc lập |
| `cgv6_life_events_v93` | Sinh/diệt loài | Cũng ghi vào ht + chronicle |
| `cgv6_civ_events_v95` | Văn minh lên cấp/chiến tranh | Cũng ghi vào ht + chronicle |
| `cgv6_lwe_events` (living-world) | NPC soul/clan events | Legacy — không ai đọc |

**Kết luận:** `cgv6_historical_timeline` là bản ghi hợp nhất duy nhất. Các key còn lại là domain-specific stores.

### 4D. CIVILIZATION — 6 bản, mỗi bản đo khía cạnh khác

| Nguồn | Đếm gì | Count điển hình |
|---|---|---|
| `window.countries` | Quốc gia chính trị | 5–20 |
| `cecV95Data.civs` | Văn minh theo loài V95 | 3–8 |
| `civEvoData.civilizations` | V38 evolution metrics | = countries.length |
| `kingdomData.kingdoms` | Vương quốc phong kiến | 4–12 |
| `empireData.empires` | Đế chế lớn | 1–3 |
| `lcaiData` | AI soul/social data | = countries |

**⚠️ Dashboard báo "3 văn minh" (cecV95) trong khi bảng Quốc Gia có 12 nước — gây hiểu lầm.**

---

## 5. BẢNG TỔNG HỢP

| DATA TYPE | SSOT | DUPLICATES | USED BY |
|---|---|---|---|
| **Current Year** | `window.year` (cgv6_year) | `wacV92Data.totalYearsElapsed` ⚠️, `world.year` ❌ | Mọi engine |
| **Global Population** | `lev93Data.globalPop` (cgv6_life_engine_v93) | `npcs.length` (khác đơn vị), `countries[].pop`, `world.population` ❌ | PUOS, Life Panel, Dashboard |
| **Species Data** | `spv93Data.species` (cgv6_species_v93) | Không trùng | Life Panel, Health Check |
| **Civilizations (Chính trị)** | `window.countries` (cgv6_countries) | `cecV95Data.civs` (khác loại), `civEvoData` (metrics), `kingdoms/empires` (sub-type) | 20+ engines |
| **Event Log (Master)** | `htData.events` (cgv6_historical_timeline) | 7 domain stores (chronicle, story, life events, civ events...) | History Panel |
| **Events (Autonomous)** | `aeeV92Data.events` (cgv6_autonomous_events_v92) | Cũng ghi vào chronicle + ht | Chronicle Panel |
| **Active Wars** | `warsActive` (cgv6_activeWars) | `multiverseWarSystemV39`, `guildWarV53` (khác phạm vi) | War Panel |
| **Kingdoms** | `kingdomData.kingdoms` (cgv6_kingdoms) | Không trùng | Kingdoms Panel |
| **Economy State** | KHÔNG CÓ SSOT ❌ | 5 engine độc lập: econV1, econV2, playerEcon, goods, tradeNetwork | Economy Panel |
| **NPC Individuals** | `window.npcs` (cgv6_npcs) | Không trùng (đây là cá nhân, không phải tổng dân) | NPC Panel |

---

## 6. PHÂN LOẠI DỮ LIỆU

### ✅ DỮ LIỆU THẬT — đang hoạt động đúng
- `window.year` / `cgv6_year` — năm thực tế
- `lev93Data.globalPop` + `spv93Data.species` — dân số thực
- `window.countries` — quốc gia thực
- `kingdomData.kingdoms` — vương quốc thực
- `htData.events` (cgv6_historical_timeline) — lịch sử thực
- `aeeV92Data.events` — sự kiện autonomous thực
- `warsActive` — chiến tranh thực
- `cecV95Data.civs` — văn minh V95 thực

### 🟡 DỮ LIỆU LEGACY — cũ nhưng vẫn hiển thị
| Key | Vấn đề |
|---|---|
| `cgv6_worldChronicle` (aiStory) | Tạo ra bởi aiStoryEngine, không phải V92 Chronicle. Tên tương tự nhưng khác hoàn toàn. |
| `cgv6_living_civ_ai` (lcaiData) | V23-era data. Cập nhật nhưng không được PUOS hiển thị trực tiếp. |
| `cgv6_world` → `world.population` | Field KHÔNG bao giờ cập nhật sau khi tạo thế giới. Mãi = dân số ban đầu. |
| `cgv6_ageState` (ageEngine.js) | Key hardcoded cũ. Engine V25 dùng `cgv6_age_v25` riêng. |
| `cgv6_meState` (migrationEngine) | Key hardcoded, không dùng SAVE_KEY variable. |
| `cgv6_lwe_*` (living-world-engine) | V1 engine. Vẫn chạy nhưng output không được kết nối vào UI PUOS. |

### ❌ DỮ LIỆU KHÔNG CÒN DÙNG — orphaned
| Key | Lý do |
|---|---|
| `cgv6_dynasties` (app.js hardcoded) | Bị ghi đè bởi `dynastySystem.js` dùng `cgv6_dynasties_v30`. Hai key song song. |
| `cgv6_timeline` (app.js) | Key cũ. `historicalTimeline.js` dùng `cgv6_historical_timeline`. |
| `cgv6_worldHistory` (app.js) | Legacy. `worldMemoryEngine` dùng `cgv6_worldMemoryEngine`. |
| `cgv6_econAudit` | `economyAuditSystem.js` ghi vào đây nhưng không panel nào đọc trong PUOS. |
| `cgv6_anti_cheat_v50` | Anti-cheat chỉ log, không ai kiểm tra. |
| `cgv6_next_v100` | `nextVersionEngine.js` — file placeholder. |
| `cgv7_dungeons`, `cgv7_dgIdCtr` | Version prefix sai (`cgv7` thay vì `cgv6`). |

### 🔴 DỮ LIỆU GÂY HIỂN THỊ SAI
| Vấn đề | Nguyên nhân | Ảnh hưởng |
|---|---|---|
| Dashboard cũ báo "0 Tu Sĩ" | Đọc `npcs.length` nhưng PUOS dùng lev93 (500K+) | User thấy 2 con số khác nhau 1000x |
| Health Check "Events = 0" | Đọc `wchV92Data.events` không tồn tại | False alarm (đã fix V96) |
| Health Check "Year drift" | So sánh session counter vs real year | False alarm (đã fix V96) |
| PUOS "Universe Age = 86" | `wacV92Data.totalYearsElapsed` reset sau reload | Báo sai tuổi thế giới |
| Universe Hub "Population = 0" | Đọc `world.population` (static từ lúc tạo) | Luôn hiển thị 0 hoặc con số cũ |
| Civilization panel "3 civs" vs "12 nations" | cecV95 (species-based) khác countries | Người dùng nhầm lẫn định nghĩa |

---

## 7. ĐỀ XUẤT V117: UNIFIED WORLD STATE

### Mục tiêu
Một object `window.UWS` (Unified World State) làm **single source of truth** cho 7 data type cốt lõi, được tổng hợp từ các SSOT hiện tại và cập nhật mỗi 60s.

### Kiến trúc

```
window.UWS = {
  // 1. YEAR
  year: {
    current:   window.year,              // SSOT: app.js
    elapsed:   year - world.createdYear, // Tính toán thuần
    worldAge:  year - (startYear || 1)   // Không phụ thuộc wacV92
  },

  // 2. POPULATION
  population: {
    total:     lev93Data.globalPop,       // SSOT: lifeEngineV93
    bySpecies: spv93Data.species[],       // Breakdown
    npcs:      npcs.length,              // Named individuals (khác đơn vị)
    byNation:  countries[].population    // Political distribution
  },

  // 3. EVENTS
  events: {
    total:     htData.events.length,     // SSOT: historicalTimeline
    recent:    htData.events.slice(0,20),
    chronicle: wchV92Data.totalEntries,  // Cross-reference
    autonomous: aeeV92Data.totalEvents   // Cross-reference
  },

  // 4. CIVILIZATIONS
  civilizations: {
    nations:   window.countries.length,  // SSOT: political entities
    kingdoms:  kingdomData.kingdoms,     // Feudal sub-type
    empires:   empireData.empires,       // Imperial sub-type
    species:   cecV95Data.civs.length,   // Bio-civ (khác loại, ghi rõ)
    total:     countries.length          // Số dùng cho UI chính
  },

  // 5. WARS
  wars: {
    active:    warsActive || [],         // SSOT: warEngine
    count:     (warsActive||[]).length
  },

  // 6. SPECIES
  species: {
    all:       spv93Data.species,        // SSOT: speciesSystemV93
    alive:     species.filter(s => s.status !== 'extinct'),
    count:     aliveSpecies.length
  },

  // 7. META
  meta: {
    lastSynced:   Date.now(),
    engineCount:  activeEngineCount,
    saveKeyCount: 288,
    version:      'V117'
  }
}
```

### Nguyên tắc V117
- `window.UWS` chỉ **ĐỌC** từ SSOT, không tự ghi dữ liệu
- Không có SAVE_KEY riêng — không persist (computed từ sources)
- Cập nhật mỗi 60s và mỗi khi `gameTick` detect year change
- Tất cả panel PUOS mới đọc từ `UWS.xxx` thay vì gọi trực tiếp engine
- Các engine cũ giữ nguyên SSOT của mình

### Lợi ích
| Vấn đề hiện tại | Sau V117 |
|---|---|
| Population hiển thị khác nhau ở 3 nơi | Tất cả đọc `UWS.population.total` |
| Year drift giữa các engine | Tất cả đọc `UWS.year.current` |
| "3 civs" vs "12 nations" | `UWS.civilizations` phân biệt rõ: nations vs species-civs |
| Health check false positives | `UWS` là ground truth cho lhcV96 |
| Events đếm sai | `UWS.events.total` từ htData (master log) |

### Files cần tạo (V117)
```
uwsCore.js           — UWS object + sync logic
uwsPopulationReader.js — population aggregator
uwsEventReader.js    — event count aggregator
uwsCivReader.js      — civilization aggregator
uwsRegistry.js       — API + refresh scheduler
```

### Timeline gợi ý
- **V117.1**: `uwsCore.js` + data aggregation + `window.UWS` live
- **V117.2**: Patch `logicHealthCheck.js` đọc từ UWS
- **V117.3**: Patch PUOS panels đọc từ UWS
- **V117.4**: Deprecate `wacV92Data.totalYearsElapsed` (thay bằng `UWS.year.elapsed`)

---

## TÓM TẮT EXECUTIVE

| Metric | Số liệu |
|---|---|
| Tổng file JS | 289 |
| Tổng localStorage key | 288 |
| Engine đang tick vào gameTick | ~45 |
| Data type bị duplicate | 5 (year, population, events, civs, economy) |
| False positives trong Health Check | 3 (đã fix V96) |
| Keys orphaned/không dùng | ~12 |
| Keys gây hiển thị sai | 4 (world.population, wacV92 elapsed, wchV92Data.events, cgv6_timeline) |
| SSOT thực sự | 7 (year, globalPop, species, countries, htData, warsActive, aeeEvents) |

**Kết luận:** Hệ thống hoạt động đúng về logic. Vấn đề chính là UI hiển thị từ nhiều nguồn khác nhau → người dùng thấy số liệu không nhất quán. V117 Unified World State sẽ giải quyết hoàn toàn bằng cách tạo lớp aggregation duy nhất.
