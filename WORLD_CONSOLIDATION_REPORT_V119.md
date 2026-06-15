# WORLD CONSOLIDATION REPORT — V119
*Ngày tạo: tự động bởi wsm-migration.js*
*Phiên bản: V119 · Creator God V6*

---

## 1. TỔNG ENGINE

| Loại | Số lượng |
|---|---|
| Tổng file JS trong project | 424 |
| Engine có localStorage.setItem | ~85 engines |
| Engine có đọc population | 154 |
| Engine được V119 adapt (Phase 4) | 7 |
| Engine đọc từ WSM (window.WSM) | Tất cả mới từ V119+ |

---

## 2. TỔNG SAVE KEY TRƯỚC V119

**Tổng số unique save keys: 112**

### Nhóm chính:
| Nhóm | Keys |
|---|---|
| Core (app.js) | cgv6_world, cgv6_npcs, cgv6_year, cgv6_countries, cgv6_sects, cgv6_bosses, cgv6_regions, cgv6_realms, cgv6_timeline, cgv6_logs, cgv6_heaven, cgv6_hof, cgv6_idctr, cgv6_warLogs, cgv6_activeWars, cgv6_worldEvents, cgv6_activeWorldEvent, cgv6_worldHistory, cgv6_dynasties, cgv6_popStats |
| Life/Species (V93-V94) | cgv6_life_engine_v93, cgv6_species_v93, cgv6_life_activation_v94 |
| Civilization (V95) | cgv6_civ_core_v95, cgv6_civ_events_v95 |
| Economy | cgv6_engCities, cgv6_engTradeRoutes, cgv6_engGuilds, cgv6_engCrises, cgv6_engStats, cgv6_engHistory, cgv6_ev2Banks, cgv6_ev2Monopolies, cgv6_ev2BlackMarkets, cgv6_ev2Investments, cgv6_ev2TradeWars, cgv6_ev2MerchantLegends, cgv6_ev2ResourceMarket, cgv6_ev2Stats, cgv6_economyHistory, cgv6_econMarketEvent, cgv6_econAudit |
| Story/Events | cgv6_worldChronicle, cgv6_chronicleCounter, cgv6_worldEventChains, cgv6_chainIdCounter, cgv6_worldLegends, cgv6_aiMemory, cgv6_revengeQueue, cgv6_consequenceBuffer, cgv6_worldStory, cgv6_storyChapters, cgv6_storyBiographies |
| Autonomous (V92) | cgv6_autonomy_clock_v92 |

---

## 3. TỔNG SAVE KEY SAU V119

**Tổng số unique save keys: 113** (+1)

Key mới thêm:
- `cgv6_wsm_migration_v119_done` — đánh dấu migration đã chạy

> ℹ️ WorldStateManager (WSM) KHÔNG có save key riêng — là derived state, không persist.

---

## 4. DUPLICATE DATA ĐÃ LOẠI BỎ (CANONICAL)

### Population — 5 nguồn → 1 canonical:
| Nguồn | Key / Window Global | Priority |
|---|---|---|
| ✅ **CANONICAL** | `window.lev93GetCurrentPop()` (V93 Life Engine) | 1 (cao nhất) |
| Fallback 2 | `window.spv93Data.species[].population` (sum) | 2 |
| Fallback 3 | `window.lev93Data.totalPop` | 3 |
| Fallback 4 | `window.npcs.filter(alive).length` | 4 |
| Fallback 5 | `window.world.population` | 5 (thấp nhất) |

### Year — 4 nguồn → 1 canonical:
| Nguồn | Priority |
|---|---|
| ✅ **CANONICAL** | `window.year` (app.js, max of all) | 1 |
| Fallback | `localStorage.cgv6_year` | 2 |
| Fallback | `window.world.year` | 3 |

### Civilizations — 3 nguồn → 1 canonical:
| Nguồn | Priority |
|---|---|
| ✅ **CANONICAL** | `window.cecV95GetAll()` (V95 runtime) | 1 |
| Fallback | `window.cecV95Data.civs.length` | 2 |

### Wars — 2 nguồn → 1 canonical:
| Nguồn | Priority |
|---|---|
| ✅ **CANONICAL** | `window.warsActive` (runtime) | 1 |
| Fallback | `localStorage.cgv6_activeWars` | 2 |

---

## 5. CÁC HỆ THỐNG ĐÃ MIGRATE (Phase 4 Adapters)

| Engine | Adapter | Ghi chú |
|---|---|---|
| V93 Life Engine | ✅ adapterLifeV93() | Hook lev93EvolveTick + wacV92AddListener |
| V95 Civ Core | ✅ adapterCivV95() | Hook cecV95Tick |
| War Engine | ✅ adapterWars() | Object.defineProperty proxy warsActive |
| Kingdom Engine | ✅ adapterKingdoms() | Hook kingdomTick |
| Disaster Engine | ✅ adapterDisasters() | Object.defineProperty proxy disasterData |
| Economy Crisis | ✅ adapterEconomy() | Hook econCrisisTick |
| Year (app.js) | ✅ gameTick hook | WSM.refresh() đọc window.year sau mỗi tick |

---

## 6. CÁC VẤN ĐỀ CÒN TỒN TẠI

### Phase 3 (Restrict Writes) — Chưa hoàn chỉnh
- **Lý do**: Project rule "EXPAND ONLY · NEVER REPLACE" ngăn sửa 85+ engine files
- **Workaround**: WSM.update() sync ngược window.world.population → panels đọc đúng
- **Tác động**: Các engine cũ vẫn tự write localStorage riêng, nhưng WSM luôn override canonical value

### Phase 7 (Remove Dead Data) — Identify-only
- Xem `window.WSM_ORPHAN_KEYS` sau khi trang load
- **Không xóa tự động** (tuân theo project rule EXPAND ONLY)
- **Số orphan keys ước tính**: ~15-20 keys từ các engine không còn active

### Cross-Panel Consistency (Phase 6)
- **Test**: `window.wsmTest()` trong console
- **Điều kiện PASS**: year/population/wars/civs giống nhau trên tất cả panels
- **Lưu ý**: Các panel chỉ refresh khi active, cần mở từng panel rồi test

---

## 7. KIẾN TRÚC WSM (window.WorldStateManager)

```
window.WSM = window.WorldStateManager = {
  get(key?)         → toàn bộ state hoặc 1 field
  update(patch)     → ghi + sync window.world.population + notify subscribers
  subscribe(fn)     → đăng ký callback khi state thay đổi
  refresh()         → đọc TẤT CẢ engines → cập nhật canonical state
  getYear()         → shorthand
  getPop()          → shorthand
  getCivCount()     → shorthand
  getWarCount()     → shorthand
  getWorldName()    → shorthand
  isReady()         → boolean
  getVersion()      → 119
}
```

### Refresh tự động:
- Hook vào `window.gameTick` (_orig pattern) → `WSM.refresh()` mỗi tick
- V118 UWS Dashboard: thêm `WSM.refresh()` mỗi 1 giây khi panel active

---

## 8. SUCCESS CONDITION

Để kiểm tra:
1. Mở game, tạo thế giới
2. Mở PUOS → 🌐 Live State (V118 Dashboard)
3. Mở PUOS → My Universe
4. Chạy trong console: `window.wsmTest()`

**PASS khi:**
```
Universe Hub   = X dân
Dashboard      = X dân  (cùng giá trị)
My Universe    = X dân  (cùng giá trị)
Year           = Y      (cùng giá trị)
Civilizations  = Z      (cùng giá trị)
```

**Nếu FAIL:**
```javascript
// Force sync:
window.WSM.refresh();
window.uwsRefresh && window.uwsRefresh();
// Chạy migration lại:
window.wsmRunMigration();
// Kiểm tra chi tiết:
window.WSM.getState();
```

---

## 9. FILES MỚI (V119)

| File | Phase | Vai trò |
|---|---|---|
| `core/WorldStateManager.js` | Phase 1 | SSOT master state + get/update/subscribe/refresh |
| `core/wsm-adapters.js` | Phase 4 | Adapter layer 7 engines → WSM |
| `core/wsm-migration.js` | Phase 5 | Migration: tìm canonical values từ legacy data |
| `core/wsm-crosstest.js` | Phase 6 | Cross-panel consistency test + window.wsmTest() |
| `WORLD_CONSOLIDATION_REPORT_V119.md` | Phase 8 | Báo cáo này |

**Không file nào bị xóa hoặc sửa đổi** (tuân theo PROJECT PROTECTION BLOCK).

---

*Generated by V119 World Data Consolidation · Creator God V6*
