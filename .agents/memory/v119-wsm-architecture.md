---
name: V119 WorldStateManager Architecture
description: SSOT master state layer (window.WSM / window.WorldStateManager) — canonical population/year/civs/wars cho toàn bộ game
---

## Kiến trúc

**Files:** `core/WorldStateManager.js`, `core/wsm-adapters.js`, `core/wsm-migration.js`, `core/wsm-crosstest.js`
**Init timing:** 26700ms (WSM core) → 26850ms (adapters) → 27000ms (migration) → 27100ms (crosstest)
**Next version:** V120 init từ 27200ms+

## API

```javascript
window.WSM = window.WorldStateManager = {
  get(key?)         // toàn bộ state hoặc 1 field
  update(patch)     // ghi + sync window.world.population + notify subscribers
  subscribe(fn)     // callback khi state thay đổi, trả về unsub fn
  refresh()         // đọc tất cả engines → canonical state
  getYear() / getPop() / getCivCount() / getWarCount() / getWorldName()
  isReady() / getVersion()
}
```

## Canonical Priority Cascade (population)
1. `window.lev93GetCurrentPop()` (V93 SSOT)
2. `window.spv93Data.species[].population` sum
3. `window.lev93Data.totalPop`
4. `window.npcs.filter(alive).length`
5. `window.world.population`

## Key Behaviors
- WSM KHÔNG có save key riêng — derived state, không persist
- `update()` sync ngược `window.world.population` → V95 sync bridge đọc → panels align
- Hook gameTick via _orig pattern → `refresh()` mỗi tick
- 7 adapters: life-v93, civ-v95, wars, kingdoms, disasters, economy, year
- `window.wsmTest()` — cross-panel consistency test (logs PASS/FAIL + chi tiết)
- `window.wsmRunMigration()` — force re-migrate từ legacy localStorage keys

## Phase 7 Orphan Keys
- 64 keys không xác định (identify-only, KHÔNG xóa per project rules)
- Xem `window.WSM_ORPHAN_KEYS` sau khi trang load
- `window.WSM_MIGRATION_REPORT` — full migration report
- `window.WSM_CROSSTEST_RESULT` — last cross-test result

## Migration Save Key
- `cgv6_wsm_migration_v119_done` — đánh dấu đã chạy migration

**Why:** Dự án có 5 nguồn population khác nhau gây inconsistent UI. WSM tạo 1 canonical layer mà KHÔNG sửa engine cũ.
**How to apply:** Mọi V120+ engine nên đọc từ `window.WSM.getPop()` thay vì đọc trực tiếp engine cũ.
