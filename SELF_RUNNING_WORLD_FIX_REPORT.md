# SELF_RUNNING_WORLD_FIX_REPORT.md
> Ngày: 2026-06-15 | Version: V115.6

---

## 🐛 VẤN ĐỀ BÁO CÁO

Panel **"Thế Giới Tự Vận Hành"** (awv92-section) hiển thị sai:

| Chỉ Số | Hiển Thị Sai | Giá Trị Thực |
|---|---|---|
| SỰ KIỆN | 0 | 7 (từ WorldChronicle V92) |
| SINH LINH | 0 | 383 (từ LifeEngine V93 / SpeciesSystem V93) |
| NĂM HIỆN TẠI | ✅ Đúng (446) | — |

---

## 🔍 PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ

### Nguyên nhân 1: `buildSection()` bake giá trị tĩnh
File: `autonomousWorldRegistryV92.js` (line 85, 109, 114)

```js
// BAKED tại thời điểm khởi tạo — không live-update:
var totalEvs = (window.aeeV92Data && window.aeeV92Data.totalEvents) || 0;  // → 0
'<div>' + totalEvs + '</div>',      // → "0"
'<div>' + ((window.npcs||[]).length) + '</div>',   // → "0"
```

- `aeeV92Data.totalEvents` = 0 vì Autonomous Event Engine chỉ đếm events từ chính nó.
- `window.npcs.length` = 0 vì population thực tế nằm trong V93 SpeciesSystem.
- Các `<div>` value không có `id` → không thể live-update.

### Nguyên nhân 2 (BUG TRONG FIX CŨ): `wchV92Data.events` không tồn tại

File: `selfRunningWorldFixV115.js` (phiên bản trước, line 42-44)

```js
// SAI: wchV92Data KHÔNG có property .events
if (window.wchV92Data && Array.isArray(window.wchV92Data.events)) {
  count += window.wchV92Data.events.length;  // → KHÔNG BAO GIỜ CHẠY
}
```

**Cấu trúc thực tế của `wchV92Data`** (từ `worldChronicleV92.js`):
```js
window.wchV92Data = {
  totalEntries: 7,        // ← ĐÂY là tổng số sự kiện
  yearEntries: [          // ← mỗi năm có mảng events con
    { year: 446, events: [...], summary: '' },
    ...
  ]
};
```

Fix cũ kiểm tra `wchV92Data.events` → `undefined` → `Array.isArray(undefined)` = false → bỏ qua toàn bộ Chronicle. **Luôn trả về 0.**

### Nguyên nhân 3 (BUG TRONG FIX CŨ): localStorage fallback sai cho Chronicle

```js
// SAI: cgv6_world_chronicle_v92 lưu { totalEntries, yearEntries }
//      — KHÔNG có .events / .history ở top-level
var a = p.events || p.history || [];   // → undefined || undefined || [] → []
if (a.length > maxFound) maxFound = a.length;  // → maxFound không thay đổi
```

### Nguyên nhân 4 (BUG TRONG FIX CŨ): Thiếu localStorage fallback cho Population

Trước khi game tick đầu tiên chạy, `window.lev93Data.globalPop` = 0 trong bộ nhớ
ngay cả khi localStorage đã lưu giá trị 383. Fix cũ không đọc trực tiếp từ localStorage khi in-memory = 0.

---

## ✅ GIẢI PHÁP ĐÃ TRIỂN KHAI

File được cập nhật: `selfRunningWorldFixV115.js`

### Fix 1: `getTotalEvents()` — Đọc đúng cấu trúc wchV92Data

```js
// ĐÚNG: dùng .totalEntries hoặc sum từ .yearEntries
if (window.wchV92Data) {
  if ((window.wchV92Data.totalEntries || 0) > 0) {
    count += window.wchV92Data.totalEntries;
  } else if (Array.isArray(window.wchV92Data.yearEntries)) {
    window.wchV92Data.yearEntries.forEach(function(ye) {
      count += (ye.events && ye.events.length) || 0;
    });
  }
}
```

### Fix 2: `getTotalEvents()` localStorage — Đọc đúng schema Chronicle

```js
{ key: 'cgv6_world_chronicle_v92', getter: function(p) {
    if ((p.totalEntries || 0) > 0) return p.totalEntries;
    if (Array.isArray(p.yearEntries)) {
      var t = 0;
      p.yearEntries.forEach(function(ye) { t += (ye.events && ye.events.length) || 0; });
      return t;
    }
    return 0;
  }
},
```

### Fix 3: `getTotalPop()` — Thêm localStorage fallback

```js
// Priority 3: localStorage cgv6_life_engine_v93 (trước khi tick đầu tiên)
try {
  var ld = localStorage.getItem('cgv6_life_engine_v93');
  if (ld) { var lp = JSON.parse(ld); if ((lp.globalPop || 0) > 0) return lp.globalPop; }
} catch(e) {}
// Priority 4: localStorage cgv6_species_v93 — sum species population
try {
  var sd = localStorage.getItem('cgv6_species_v93');
  if (sd) {
    var sp = JSON.parse(sd);
    if (sp.species && sp.species.length) {
      var st = 0;
      sp.species.forEach(function(s) { st += (s.population || 0); });
      if (st > 0) return st;
    }
  }
} catch(e) {}
```

---

## 🗺️ KIẾN TRÚC NGUỒN DỮ LIỆU (SAU FIX)

```
SỰ KIỆN (Priority Cascade):
  1. window.wchV92Data.totalEntries         (WorldChronicle V92 — in-memory) ← FIX
  2. sum wchV92Data.yearEntries[i].events   (nếu totalEntries = 0)           ← FIX
  3. window.cevV95Data.totalEvents          (CivEvents V95 — in-memory)
  4. window.aeeV92Data.totalEvents          (AutonomousEventEngine V92)
  5. localStorage cgv6_world_chronicle_v92  (fallback — schema đúng)         ← FIX
  6. localStorage cgv6_historical_timeline  (fallback)
  7. localStorage cgv6_world_events_v25     (fallback)

SINH LINH (Priority Cascade):
  1. window.lev93GetCurrentPop()            (LifeEngine V93 — in-memory)
  2. sum window.spv93Data.species[].pop     (SpeciesSystem V93 — in-memory)
  3. localStorage cgv6_life_engine_v93      (fallback — trước tick đầu)      ← FIX
  4. localStorage cgv6_species_v93          (fallback — species pop sum)      ← FIX
  5. window.npcs.length                     (legacy fallback)
```

---

## ✅ XÁC NHẬN TÍNH NHẤT QUÁN

| Chỉ Số | Dashboard (universeSyncBridgeV95) | Self-Running World (srwf115) | Nguồn |
|---|---|---|---|
| SINH LINH | `lev93GetCurrentPop()` | Cùng priority cascade | LifeEngine V93 |
| SỰ KIỆN | `wchV92Data.totalEntries` | `wchV92Data.totalEntries` | WorldChronicle V92 |

**Dashboard Population = Self-Running World Population ✅**
**Dashboard Events = Self-Running World Events ✅**

---

## 🔄 CƠ CHẾ LIVE-UPDATE

- Inject ID `srwf115-event-num` và `srwf115-pop-num` vào stat divs sau khi `awv92-section` build.
- Live refresh mỗi **2 giây** — đồng bộ với `universeSyncBridgeV95.js`.
- Hook `puosRenderMyUniverse` → re-inject sau 150ms/400ms/800ms khi panel rebuild.
- Boot patches tại 500ms / 1500ms / 3000ms sau init (init tại 25700ms).

---

## 📁 FILES LIÊN QUAN

| File | Vai Trò | Hành Động |
|---|---|---|
| `selfRunningWorldFixV115.js` | Fix đã cập nhật | ✏️ BUG FIXED |
| `autonomousWorldRegistryV92.js` | Source awv92-section | 🔒 Không sửa |
| `universeSyncBridgeV95.js` | Tham chiếu SSOT Dashboard | 🔒 Không sửa |
| `worldChronicleV92.js` | Schema: totalEntries, yearEntries | 🔒 Không sửa |
| `lifeEngineV93.js` | Schema: lev93Data.globalPop | 🔒 Không sửa |
| `speciesSystemV93.js` | Schema: spv93Data.species[].population | 🔒 Không sửa |

---

## 📋 RULE TUÂN THỦ

- ✅ **CHỈ MỞ RỘNG** — không xóa, không thay thế, không xây dựng lại
- ✅ Không sửa `autonomousWorldRegistryV92.js` — chỉ patch DOM sau khi build
- ✅ Chỉ sửa bug trong `selfRunningWorldFixV115.js` (file của chính fix này)
- ✅ Không tạo file mới — expand file hiện có
