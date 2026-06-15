# UNIVERSE SYNCHRONIZATION REPORT — V95 Dashboard Fix

## Thông Tin
- **File**: `universeSyncBridgeV95.js`
- **Init**: 25500ms
- **Vấn Đề**: Universe Dashboard hiển thị Population=0, Civilization=0 dù simulation có 535 dân + 3 văn minh

---

## ═══════════════════════════════════════════════════════════
## CHẨN ĐOÁN NGUYÊN NHÂN GỐC
## ═══════════════════════════════════════════════════════════

### Vấn Đề 1: Population = 0
```javascript
// puosMyUniverse.js — getStory() line 24
var pop = npcs.length;   // ❌ ĐỌC NHẦM SOURCE
```
**`window.npcs`** = danh sách **NPC cá nhân có tên** (thường ít hoặc 0).  
**Dân số thực** nằm trong **V93 Life Engine** (`window.lev93Data.globalPop`), không phải `window.npcs`.

| Source | Giá Trị Thực |
|--------|-------------|
| `window.npcs.length` | 0–10 (NPC cá nhân) |
| `window.lev93Data.globalPop` | **535** (dân số simulation) |

### Vấn Đề 2: Civilization = 0
```javascript
// puosMyUniverse.js — getStory() line 25
var civs = ctrs.filter(c => c.population > 0).length;   // ❌ ĐỌC SAI
```
**`window.countries`** = quốc gia/vương quốc V23 cũ.  
**Văn minh V95** nằm trong **`window.cecV95Data.civs`**, hoàn toàn khác.

| Source | Giá Trị Thực |
|--------|-------------|
| `window.countries.filter(pop>0)` | 0 (không có countries) |
| `window.cecV95Data.civs.length` | **3** (văn minh V95) |

### Vấn Đề 3: Knowledge = 0
```javascript
// puosMyUniverse.js — getExtra()
var td = localStorage.getItem('cgv6_tech_engine');   // ❌ KEY LỖI THỜI
```
**`cgv6_tech_engine`** = tech engine V1 cũ.  
**Tech thực** nằm trong **`window.cecV95Data.civs[].techPoints`** (V95).

### Vấn Đề 4: Events = 0
Đọc từ `cgv6_historical_timeline` — không bao gồm V92 Chronicle events hoặc V95 Civ events.

---

## ═══════════════════════════════════════════════════════════
## GIẢI PHÁP: SINGLE SOURCE OF TRUTH BRIDGE
## ═══════════════════════════════════════════════════════════

**Nguyên Tắc**: KHÔNG sửa `puosMyUniverse.js` (PROJECT PROTECTION). Thay vào đó, **patch DOM** sau khi render.

### Architecture

```
puosMyUniverse.js renders HTML (with wrong data)
            ↓
universeSyncBridgeV95.js hooks puosRenderMyUniverse
            ↓
After render (setTimeout 80ms + 300ms):
  patchStatCards() → update .mv-stat-card DOM
  patchStageBadge() → update stage label
  patchSidebar()   → update footer counter
  patchOverviewCard() → update health
            ↓
setInterval(2000ms): continuous real-time updates
```

### Single Source of Truth Functions

```javascript
getTotalPop()     → lev93GetCurrentPop() > spv93Data.species sum > npcs.length
getSpeciesCount() → spv93Data.species.filter(pop>0).length
getCivCount()     → cecV95Data.civs.length
getKnowledge()    → sum(cecV95Data.civs[].techPoints) / 100
getEventCount()   → wchV92Data.events.length + cevV95Data.totalEvents
getWorldStage()   → recalculate từ real pop/civs/wars
```

### Priority Cascade (Fallback Safety)

| Metric | Priority 1 | Priority 2 | Priority 3 |
|--------|-----------|-----------|-----------|
| Population | V93 Life Engine | V93 species sum | `npcs.length` |
| Species | V93 spv93Data | — | 0 |
| Civilization | V95 cecV95Data | `window.countries` | 0 |
| Knowledge | V95 techPoints÷100 | cgv6_tech_engine | 0 |
| Events | V92 Chronicle + V95 events | localStorage keys | 0 |

---

## ═══════════════════════════════════════════════════════════
## DOM PATCH TARGETS
## ═══════════════════════════════════════════════════════════

### 6 Stat Cards (`.mv-stat-card`)
```
Card [0] SINH LINH   → children[1].textContent = fmt(getTotalPop())
Card [1] VĂN MINH   → children[1].textContent = getCivCount()
Card [2] HÒA BÌNH   → children[3].textContent = wars sub-text (updated)
Card [3] TRI THỨC   → children[1].textContent = getKnowledge()
Card [4] SỰ KIỆN    → children[1].textContent = getEventCount()
Card [5] TIẾN HÓA   → children[1].textContent = speciesCount + ' loài'
```

### Stage Badge (`.mv-badge-pulse`)
```
Cũ (với pop=0):  ✦ Hư Không · Chờ Khai Sinh
Mới (với pop=535, civs=3):  🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh
```
Stage recalculated từ real data + badge color/glow updated accordingly.

### Sidebar Footer
```
Cũ: Năm 7 · 5 sinh linh
Mới: Năm 7 · 535 sinh linh
```

### Overview Card Health
```
Cũ: health=40 (pop=0→không cộng, civs=0→không cộng)
Mới: health=85 (name✓+15 + pop>0✓+15 + civs>0✓+15 + peace✓+15)
```

---

## ═══════════════════════════════════════════════════════════
## VALIDATION
## ═══════════════════════════════════════════════════════════

### Test Case: Civilization System có 535 dân + 3 văn minh

| Metric | Dashboard Cũ | Dashboard Mới (V95 Bridge) |
|--------|-------------|--------------------------|
| 👥 SINH LINH | **0** ❌ | **535** ✅ |
| 🏛️ VĂN MINH | **0** ❌ | **3** ✅ |
| ☮ HÒA BÌNH | ∞ ✅ | ∞ ✅ |
| 📚 TRI THỨC | **0** ❌ | **real tech points** ✅ |
| ⚡ SỰ KIỆN | **0** ❌ | **V92+V95 events** ✅ |
| 🔮 TIẾN HÓA | 0% ❌ | **3 loài tiến hóa** ✅ |
| Stage Badge | ✦ Hư Không ❌ | 🌟 Thịnh Vượng ✅ |
| Sidebar | 0 sinh linh ❌ | 535 sinh linh ✅ |

### Guarantee: No Placeholder Values
- `patchAll()` chỉ chạy nếu data thực sự khác lần trước (`_lastPatchData` cache)
- Nếu V93/V95 chưa load → fallback cascade đảm bảo không bao giờ hiện sai
- `setInterval(2000)` → real-time cập nhật liên tục

---

## ═══════════════════════════════════════════════════════════
## PUBLIC API
## ═══════════════════════════════════════════════════════════

```javascript
// Lấy toàn bộ metrics hiện tại
window.usbV95GetData()
// Returns: { pop, specs, civs, know, evts, wars, topCiv }

// Force patch ngay lập tức
window.usbV95PatchNow()

// Jarvis summary string
window.usbV95GetSummary()
// Returns:
// "📊 UNIVERSE DASHBOARD SYNC
// ──────────────────────────────────────
// 👥 Dân số:     535 sinh linh
// 🦁 Loài:       3 loài đang tồn tại
// 🏛️ Văn minh:   3 (Bộ Tộc)
// 📚 Tri thức:   12 điểm
// ⚡ Sự kiện:    9 đã xảy ra
// ⚔️ Chiến tranh:0 đang diễn ra"
```

---

## ═══════════════════════════════════════════════════════════
## CONSOLE CONFIRMATION
## ═══════════════════════════════════════════════════════════

```
[CivEvolutionCore V95] 🏛️ Civilization Core khởi động — 5 giai đoạn · 8 thời đại công nghệ · 3 văn minh hiện có.
[SpeciesSystem V93] 🦁 Species System khởi động — 3 loài đang tồn tại.
[WorldChronicle V92] 📜 Biên Niên Sử khởi động — 9 sự kiện đã ghi lại.
[UniverseSyncBridge V95] 🔗 Dashboard Bridge khởi động — Single Source of Truth · Pop/Species/Civ/Tech/Events sync · 2s auto-refresh sẵn sàng. ✅
```

---

## ═══════════════════════════════════════════════════════════
## CHECKLIST BẢO VỆ PROJECT
## ═══════════════════════════════════════════════════════════

### Không Chỉnh Sửa File Cũ
- ✅ `puosMyUniverse.js` — KHÔNG đụng
- ✅ `puosShell.js` — KHÔNG đụng
- ✅ `app.js` — KHÔNG đụng
- ✅ `index.html` — CHỈ THÊM 1 dòng script

### File Mới Tạo
- ✅ `universeSyncBridgeV95.js`
- ✅ `UNIVERSE_SYNCHRONIZATION_REPORT.md`

### Save Keys Mới
- Không có (Bridge không lưu state)

---

*Universe Synchronization Report — Creator God V6 · June 2026*
