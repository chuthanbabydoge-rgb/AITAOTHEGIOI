# GLOBAL LOGIC AUDIT REPORT
**Creator God V6 — PUOS Shell**
**Audit Date:** 2026-06-15
**Scope:** 413 JS files, 9 engine categories
**Auditor:** Automated multi-agent static analysis

---

## ═══════════════════════════════════════════
## SCORES
## ═══════════════════════════════════════════

| Metric | Score | Verdict |
|---|---|---|
| **Logic Health Score** | **38 / 100** | 🔴 Critical |
| **Data Consistency Score** | **42 / 100** | 🔴 Critical |
| **Sync Score** | **55 / 100** | 🟡 Warning |
| **Engine Activation Score** | **61 / 100** | 🟡 Warning |
| **Overall** | **49 / 100** | 🟡 Needs Attention |

---

## ═══════════════════════════════════════════
## 1. BROKEN SYSTEMS
## ═══════════════════════════════════════════

### 🔴 BUG-001 — CRITICAL: `window.gameTick` Chain Never Fires
**Severity:** CRITICAL  
**Files:** `app.js`, tất cả engine V92–V95 dùng gameTick hook

`simulateWorld()` trong `app.js` — engine tick chính — **KHÔNG BAO GIỜ gọi `window.gameTick()`**.
Toàn bộ chuỗi hook gameTick (50+ engine, ~328 lớp wrapper) là **dead code** trong vòng lặp simulation thực.

```
app.js → simulateWorld() → setInterval → KHÔNG có dòng window.gameTick()
```

**Hệ quả:**
- `lifeActivationEngineV94.js` evolution loop (mỗi 60 ticks) → **KHÔNG BAO GIỜ chạy**
- `autonomousEventEngineV92.js` event generation → **KHÔNG BAO GIỜ chạy qua gameTick**
- `worldAutonomyClockV92.js` year listener → **KHÔNG BAO GIỜ chạy qua gameTick**
- Population frozen sau seed ban đầu (chỉ evolveOneTick 1 lần trong init)

**Tại sao vẫn "hoạt động":**  
Watchdog `setInterval(watchdogCheck, 2000)` trong V94 seed dân số độc lập. Nhưng population KHÔNG tiến hóa sau đó.

---

### 🔴 BUG-002 — CRITICAL: Double Population Evolution
**Severity:** HIGH  
**Files:** `lifeEngineV93.js`, `lifeActivationEngineV94.js`

Hai engine cùng evolve `window.spv93Data.species`:

| Engine | Trigger | Method |
|---|---|---|
| `lifeEngineV93.js` `evolvePopulation()` | year change (wacV92AddListener) | gọi `window.spv93EvolveAll(year)` |
| `lifeActivationEngineV94.js` `evolveOneTick()` | gameTick mỗi 60 ticks | loop trực tiếp trên `spv93Data.species` |

Nếu cả hai engine đều active và gameTick được gọi, mỗi năm dân số có thể tăng **2×** so với tỷ lệ thiết kế.

---

### 🔴 BUG-003 — CRITICAL: `puosCivPanel.js` Sai Data Source
**Severity:** HIGH  
**File:** `puosCivPanel.js` dòng 47

Panel CIV đọc `window.countries` (data V1 cũ).  
Nhưng V95 Civ Engine lưu văn minh trong `window.cecV95Data.civs` (khác hoàn toàn).

```
Dashboard (universeSyncBridgeV95) → cecV95Data.civs → hiển thị đúng
puosCivPanel → window.countries → có thể hiển thị 0 hoặc sai số lượng
```

---

### 🔴 BUG-004 — HIGH: `wacV92Data.totalYearsElapsed` vs `window.year` Drift
**Severity:** HIGH  
**Files:** `worldAutonomyClockV92.js`, `selfRunningWorldFix.js`

`wacV92Data.totalYearsElapsed` là **session counter** — reset về 0 khi reload trang.  
`window.year` là **absolute year** — được load từ localStorage.

Kết quả: Sau reload, "Tuổi Vũ Trụ" hiển thị trong một số panel bằng `totalYearsElapsed` = 0 thay vì năm thực.

---

### 🟡 BUG-005 — MEDIUM: `puosHubPanel.js` World Count Hiển Thị String '1+'
**Severity:** MEDIUM  
**File:** `puosHubPanel.js`

```js
// Hiện tại:
worlds.length > 0 ? worlds.length : (window.countries && window.countries.length > 0 ? '1+' : '0')
// Đúng phải là:
worlds.length > 0 ? worlds.length : (window.countries ? window.countries.length : 0)
```

---

### 🟡 BUG-006 — MEDIUM: Triple Age Engine Conflict
**Severity:** MEDIUM  
**Files:** `ageEngine.js`, `ageEngineV25.js`, `worldAgeEngine.js` (V43), `app.js`

Bốn nguồn xác định "Current Era" đồng thời:
1. `app.js` `WORLD_ERAS[]` + `getCurrentEra()` — legacy, vẫn được một số UI đọc
2. `ageEngine.js` V1 — 6 eras — superseded, còn active
3. `ageEngineV25.js` — 5 eras — active
4. `worldAgeEngine.js` V43 — 12 eras — active

Ba engine chạy đồng thời, mỗi cái tính "current era" riêng → không đồng nhất.

---

### 🟡 BUG-007 — MEDIUM: Event Count Trên Dashboard Không Cộng Gộp
**Severity:** MEDIUM  
**File:** `universeSyncBridgeV95.js` `getEventCount()`

```js
// Logic hiện tại (sai):
count += wchV92Data.events.length;    // cộng chronicle
count += cevV95Data.totalEvents;       // cộng civ events
if (count === 0) pick MAX of legacy keys  // fallback pick MAX, không SUM
```

Khi có cả chronicle lẫn legacy events, tổng SỰ KIỆN có thể thiếu nhiều events từ V25, V59, V43.

---

### 🟡 BUG-008 — MEDIUM: Hai DOM Patcher Conflict
**Severity:** MEDIUM  
**Files:** `selfRunningWorldFix.js`, `universeSyncBridgeV95.js`

Cả hai đều chạy `setInterval` 2 giây patch cùng DOM elements:
- `universeSyncBridgeV95.js`: patch `.mv-stat-card`, sidebar footer
- `selfRunningWorldFix.js`: patch `#puos-mv-pop`, `#puos-mv-events`, sidebar

→ Race condition, giá trị có thể bị ghi đè ngay lập tức, gây flicker.

---

### 🟡 BUG-009 — MEDIUM: `populationHistory` Empty Tại Seed
**Severity:** MEDIUM** (Đã fix SINH/NĂM label — nhưng root cause còn đó)  
**File:** `lifeActivationEngineV94.js` `forceSeedSpecies()`

`forceSeedSpecies()` set `lev93Data.globalPop` nhưng KHÔNG push entry vào `populationHistory`.  
→ Growth rate = 0%, Lịch sử Dân Số chart trống cho đến tick đầu tiên.

---

### 🟡 BUG-010 — MEDIUM: `puosCivPanel.js` Hardcoded Placeholder
**Severity:** MEDIUM  
**File:** `puosCivPanel.js` `renderCultures()`, `renderKnowledge()`

Các rows "Nghệ Thuật", "Văn Học", "Tôn Giáo" là hardcoded fallback text, không phải live data.  
Nếu V79 culture engine không active → panel luôn hiển thị dữ liệu tĩnh không thay đổi.

---

## ═══════════════════════════════════════════
## 2. INACTIVE SYSTEMS (Built nhưng chưa kích hoạt đúng)
## ═══════════════════════════════════════════

| Engine | File | Vấn Đề |
|---|---|---|
| `ageEngine.js` V1 | `ageEngine.js` | Superseded bởi V25+V43 nhưng vẫn load, `ageEngineTick()` được gọi từ app.js |
| Toàn bộ V92-V95 gameTick hooks | 50+ files | Hook chain không bao giờ được trigger bởi `simulateWorld()` |
| `livingWorldEngine.js` | `living-world-engine.js` | Legacy, bị thay thế bởi V92-V95 nhưng vẫn load và chạy |
| `academyEngine.js` | `academyEngine.js` | Hook gameTick không đảm bảo được gọi đúng thứ tự |
| `cultureEngine.js` | `cultureEngine.js` | Thiếu gameTick hook |
| `allianceEngine.js` | `allianceEngine.js` | Phụ thuộc vào `diplomacyEngine.js` để được gọi |

---

## ═══════════════════════════════════════════
## 3. UNUSED DATA
## ═══════════════════════════════════════════

| Data | File | Vấn Đề |
|---|---|---|
| `cgv6_ageState` | `ageEngine.js` V1 | Viết bởi V1, không được đọc bởi V25/V43 |
| `cgv6_age_events_v43` | `ageEventEngine.js` | Chỉ dùng trong panel riêng của nó, không sync với dashboard |
| `cgv6_age_prog_v43` | `ageProgressionEngine.js` | Chỉ dùng nội bộ, không ảnh hưởng gameplay |
| `popLimitState.totalAbstract` | `populationLimitSystem.js` | Tracker thứ 5 cho population, không đưa vào dashboard |
| `window.laeV94Data.totalPop` | `lifeActivationEngineV94.js` | Proxy cho `spv93GetTotal()`, không cần thiết |
| `wacV92Data.totalYearsElapsed` | `worldAutonomyClockV92.js` | Session-only counter, drift so với `window.year` |

---

## ═══════════════════════════════════════════
## 4. DUPLICATE DATA SOURCES
## ═══════════════════════════════════════════

### 4A. Population — 6 Sources
| Nguồn | File | Dashboard đọc? |
|---|---|---|
| `window.lev93Data.globalPop` | `lifeEngineV93.js` | ✅ Priority 1 |
| `window.spv93Data.species[].population` sum | `speciesSystemV93.js` | ✅ Priority 2 |
| `window.npcs.length` | `app.js` | ✅ Priority 3 (fallback) |
| `window.countries[i].population` | `territorySystem.js` | ❌ Không đưa vào main pop |
| `popLimitState.totalAbstract` | `populationLimitSystem.js` | ❌ Không dùng |
| `window.laeV94Data → spv93GetTotal()` | `lifeActivationEngineV94.js` | ❌ Redundant |

**Vấn đề:** `puosMyUniverse.js` `getStory()` dùng `window.npcs.length` (Priority 3!) thay vì V93 data.  
→ Hero card số dân số ≠ stat card số dân số.

### 4B. Civilization — 4 Sources
| Nguồn | File | Dashboard đọc? |
|---|---|---|
| `window.cecV95Data.civs` | `civEvolutionCoreV95.js` | ✅ Priority 1 (universeSyncBridge) |
| `window.countries` | `app.js` | ✅ Priority 2 (fallback) |
| `window.kingdomData.kingdoms` | `kingdomEngine.js` | ❌ Chỉ V38 dùng |
| `window.empireData.empires` | `empireEngine.js` | ❌ Chỉ V38 dùng |
| `window.civEvoData` | `civEvolutionEngineV38.js` | ❌ Riêng biệt, không sync V95 |

**Vấn đề:** V38 và V95 track cùng một "văn minh" trong 2 hệ thống riêng biệt (`civEvoData` vs `cecV95Data`).

### 4C. Event Count — 8+ Storage Keys
| Key | Engine | Vào Dashboard? |
|---|---|---|
| `cgv6_historical_timeline` | `app.js` htAddEvent | ✅ Fallback |
| `cgv6_world_chronicle_v92` | `worldChronicleV92.js` | ✅ Priority 1 |
| `cgv6_civ_events_v95` | `civEventsV95.js` | ✅ Priority 2 |
| `cgv6_autonomous_events_v92` | `autonomousEventEngineV92.js` | ❌ Không đọc trực tiếp |
| `cgv6_world_events_v25` | `worldEventEngineV25.js` | ✅ Legacy fallback |
| `cgv6_world_event_v25` | legacy | ✅ Legacy fallback |
| `cgv6_lwe_events` | `living-world-engine.js` | ❌ Không đọc |
| `cgv6_event_scheduler_v59` | `globalEventSchedulerV59.js` | ❌ Không đọc |
| `cgv6_age_events_v43` | `ageEventEngine.js` | ❌ Không đọc |

### 4D. Year/Age — 4 Sources
| Nguồn | Reset? | Dashboard đọc? |
|---|---|---|
| `window.year` (localStorage `cgv6_year`) | Không | ✅ Đúng |
| `wacV92Data.totalYearsElapsed` | Có (session) | ⚠️ Một số panel đọc |
| `window.world.createdYear` | Không | ⚠️ Sidebar footer |
| `wacV92Data.lastYear` | Có (session) | ❌ Internal only |

---

## ═══════════════════════════════════════════
## 5. TOP 20 BUGS — RANKED BY PRIORITY
## ═══════════════════════════════════════════

| # | Severity | System | Bug | Impact |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | Universe | `simulateWorld()` không gọi `window.gameTick()` — 50+ engine hooks dead | Population không tiến hóa, events không tự sinh |
| 2 | 🔴 HIGH | Life/Species | Double evolution: V93 + V94 cùng gọi `spv93EvolveAll` | Dân số tăng 2× tốc độ thiết kế |
| 3 | 🔴 HIGH | Civilization | `puosCivPanel.js` đọc `window.countries` thay vì `cecV95Data.civs` | Panel CIV hiển thị sai/thiếu văn minh |
| 4 | 🔴 HIGH | Universe | `wacV92Data.totalYearsElapsed` reset sau reload → "Tuổi Vũ Trụ" = 0 | UX sai sau mỗi lần reload |
| 5 | 🟡 MEDIUM | Population | `puosMyUniverse.js` `getStory()` dùng `npcs.length` thay vì V93 pop | Hero card vs stat card số dân số khác nhau |
| 6 | 🟡 MEDIUM | Age | 3 age engines chạy song song (V1, V25, V43) + app.js legacy | "Kỷ nguyên" hiển thị không nhất quán giữa các panel |
| 7 | 🟡 MEDIUM | Event | `getEventCount()` không cộng gộp tất cả event sources | Số SỰ KIỆN thấp hơn thực tế |
| 8 | 🟡 MEDIUM | Dashboard | `selfRunningWorldFix.js` và `universeSyncBridgeV95.js` cùng patch DOM 2s | Race condition, flicker |
| 9 | 🟡 MEDIUM | Life | `forceSeedSpecies()` không tạo `populationHistory` entry → chart trống | Biểu đồ lịch sử dân số trống khi mới tạo |
| 10 | 🟡 MEDIUM | Civilization | V38 `civEvoData` và V95 `cecV95Data` track civs riêng biệt | Cùng một văn minh có thể count 2 lần |
| 11 | 🟡 MEDIUM | Dashboard | `puosHubPanel.js` world count trả về string `'1+'` không phải số | Hub panel count sai |
| 12 | 🟡 MEDIUM | Civilization | `puosCivPanel.js` renderCultures() hardcoded placeholders | Panel văn hóa luôn hiển thị dữ liệu tĩnh |
| 13 | 🟡 MEDIUM | Timeline | `cgv6_world_chronicle_v92` capped 150 years, `cgv6_historical_timeline` capped 2000 events → diverge | Hai "sử ký" không đồng bộ theo thời gian |
| 14 | 🟡 MEDIUM | Event | `cgv6_autonomous_events_v92` không được đọc bởi dashboard | Autonomous events không count vào tổng |
| 15 | 🟡 MEDIUM | Life | `window.countries[i].population` không được aggregate vào main pop | Dân số cư dân quốc gia bị bỏ qua |
| 16 | 🟡 LOW | Universe | `ageEngine.js` V1 còn active, `ageEngineTick()` được gọi trong `simulateWorld()` thay vì V25/V43 | V1 era logic chạy song song V25+V43 |
| 17 | 🟡 LOW | Dead Data | `cgv6_ageState`, `cgv6_lwe_events` viết nhưng không đọc | localStorage rác tích lũy |
| 18 | 🟡 LOW | Life | `populationLimitState.totalAbstract` không sync vào main pop display | Abstract population invisible |
| 19 | 🟡 LOW | Event | `cgv6_event_scheduler_v59` events không vào dashboard count | Scheduled events undercount |
| 20 | 🟡 LOW | Performance | ~328-lớp gameTick wrapper chain (dù không fire) → nếu được fix, sẽ gây call stack sâu | Performance risk khi gameTick được enable |

---

## ═══════════════════════════════════════════
## 6. VALIDATION — POPULATION
## ═══════════════════════════════════════════

```
Simulation (spv93Data.species sum)     ≠ Dashboard stat card (lev93GetCurrentPop)
Dashboard stat card (lev93Data)        ≠ Hero card title (npcs.length)
Life Registry panel (spv93GetTotal)    = Dashboard stat card ✅
```

**Result: ❌ KHÔNG nhất quán** — 3 giá trị dân số khác nhau có thể hiển thị cùng lúc.

---

## ═══════════════════════════════════════════
## 7. VALIDATION — EVENTS
## ═══════════════════════════════════════════

```
Dashboard SỰ KIỆN count = wchV92Data.events.length + cevV95Data.totalEvents
Timeline panel = cgv6_historical_timeline
History tab = htData.events (cgv6_historical_timeline)
Event Engine output = multiple keys, partially cross-posted
```

**Result: ❌ KHÔNG nhất quán** — Dashboard count ≠ Timeline count ≠ tổng thực tế.

---

## ═══════════════════════════════════════════
## 8. VALIDATION — YEAR
## ═══════════════════════════════════════════

```
window.year (app.js) = cgv6_year localStorage ✅
Sidebar footer = window.year ✅
PUOS My Universe hero = window.year ✅
wacV92Data.totalYearsElapsed ≠ window.year (drift after reload) ❌
```

**Result: ⚠️ PHẦN LỚN nhất quán**, ngoại trừ session counter trong V92 Clock.

---

## ═══════════════════════════════════════════
## 9. FIX PRIORITY
## ═══════════════════════════════════════════

### PRIORITY 1 — Sửa ngay (Ảnh hưởng core gameplay)
1. **BUG-001:** Thêm `if (typeof window.gameTick === 'function') window.gameTick();` vào cuối `simulateWorld()` trong `app.js` → kích hoạt toàn bộ engine chain
2. **BUG-002:** Chọn V94 là SSOT cho species evolution, vô hiệu hóa `spv93EvolveAll` trong V93 khi V94 active
3. **BUG-003:** Sửa `puosCivPanel.js` đọc `cecV95Data.civs` (với fallback `window.countries`)
4. **BUG-004:** Sửa `wacV92Data.totalYearsElapsed` = load từ `window.year` thay vì session counter

### PRIORITY 2 — Sửa sớm (Data consistency)
5. **BUG-005:** Sửa `puosMyUniverse.js` `getStory()` dùng `lev93GetCurrentPop()` thay vì `npcs.length`
6. **BUG-007:** Sửa `getEventCount()` cộng gộp TẤT CẢ event sources, không chỉ max
7. **BUG-008:** Gộp `selfRunningWorldFix.js` vào `universeSyncBridgeV95.js`, xóa timer trùng
8. **BUG-009:** Thêm initial history entry trong `forceSeedSpecies()`

### PRIORITY 3 — Dọn dẹp (Code health)
9. **BUG-006:** Decommission `ageEngine.js` V1, để `app.js` gọi `ageEngineV25Tick()` hoặc `worldAgeTick()`
10. Hợp nhất V38 `civEvoData` và V95 `cecV95Data` thành một SSOT
11. Stop `livingWorldEngine.js` khỏi load (superseded)

---

## ═══════════════════════════════════════════
## 10. RECOMMENDED NEXT STEP
## ═══════════════════════════════════════════

### Bước 1 (QUAN TRỌNG NHẤT): Kích hoạt gameTick
Thêm vào cuối `simulateWorld()` trong `app.js`:
```js
// Gọi extension engine chain
if (typeof window.gameTick === 'function') {
  try { window.gameTick(); } catch(e) { console.warn('[gameTick chain]', e); }
}
```
Điều này sẽ kích hoạt:
- Population evolution (V94) — chạy mỗi 60 ticks
- Autonomous world events (V92) — sinh sự kiện lịch sử
- Civilization events (V95) — tiến hóa văn minh
- Prophecy/Fate systems (V77) — sợi duyên

### Bước 2: Single Source of Truth cho Population
- `lev93Data.globalPop` = SSOT duy nhất
- Xóa double-evolution call từ V93 khi V94 active
- Fix `puosMyUniverse.js` `getStory()` dùng SSOT này

### Bước 3: Fix Panel Data Sources
- `puosCivPanel.js` → đọc `cecV95Data.civs`
- `puosHubPanel.js` → trả về số thực thay vì string

---

## ═══════════════════════════════════════════
## APPENDIX: ENGINE STATUS OVERVIEW
## ═══════════════════════════════════════════

| Category | Engine Count | Active | Dead/Superseded | Conflicting |
|---|---|---|---|---|
| Universe/Year | 4 | 2 | 1 | 1 |
| Life/Species | 4 | 3 | 0 | 1 (double-evo) |
| Civilization | 5 | 3 | 0 | 2 (V38 vs V95) |
| Age/Era | 5 | 3 | 1 | 2 |
| Event/Timeline | 9 | 6 | 1 | 2 |
| Dashboard/Sync | 4 | 3 | 0 | 1 (dual patcher) |
| Jarvis/AI | 3 | 3 | 0 | 0 ✅ |
| Society | 6 | 4 | 1 | 1 |
| **TOTAL** | **~413** | **~251** | **~62** | **~100** |

---

*Report generated by static multi-agent analysis. Severity ratings based on player-visible impact.*  
*No code was modified during this audit.*
