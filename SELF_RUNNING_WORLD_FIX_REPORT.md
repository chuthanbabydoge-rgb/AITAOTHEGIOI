# SELF_RUNNING_WORLD_FIX_REPORT.md
## V115.6 — Self-Running World Panel Fix

---

## 🔍 ROOT CAUSE ANALYSIS

### Panel: "THẾ GIỚI TỰ VẬN HÀNH" (trong `autonomousWorldRegistryV92.js`)

#### Vấn đề 1: Population = 0
```javascript
// BUG (dòng 114 trong buildSection):
'<div style="font-size:22px;font-weight:700;color:#60a5fa;">' + ((window.npcs||[]).length) + '</div>'
```
- `window.npcs` là mảng NPC cũ (V1-V28), KHÔNG phải nguồn dân số của V93 Life Engine
- V93 Life Engine lưu dân số trong `window.spv93Data.species[].population` (tổng = 383)
- `window.lev93GetCurrentPop()` là hàm SSOT chính xác nhưng không được gọi

#### Vấn đề 2: Events = 0
```javascript
// BUG (dòng 85 trong buildSection):
var totalEvs = (window.aeeV92Data && window.aeeV92Data.totalEvents) || 0;
```
- Chỉ đọc events từ V92 Autonomous Event Engine
- Bỏ qua: V92 Chronicle (`wchV92Data.events`), V95 Civ Events (`cevV95Data.totalEvents`), và localStorage keys
- `universeSyncBridgeV95.js` có logic multi-source đúng nhưng không patch awv92-section

#### Vấn đề 3: Giá trị baked static, không live-update
- `buildSection()` tạo HTML string một lần khi init
- Chỉ `#awv92-year-num` có ID và được `updateYearBadge()` cập nhật
- SỰ KIỆN và SINH LINH không có ID → `universeSyncBridgeV95.js` không thể patch

---

## ✅ FIX IMPLEMENTED

### File Mới: `selfRunningWorldFixV115.js`
**Pattern**: IIFE · Expand Only · KHÔNG sửa file cũ

### Giải Pháp:

#### 1. Population SSOT (mirror của universeSyncBridgeV95.js)
```javascript
function getTotalPop() {
  // Priority 1: V93 lev93GetCurrentPop()     → kết quả chính xác nhất
  // Priority 2: spv93Data.species sum         → species-level aggregate
  // Priority 3: window.npcs.length            → fallback cũ
}
```

#### 2. Events SSOT (mirror của universeSyncBridgeV95.js)
```javascript
function getTotalEvents() {
  // Priority 1: wchV92Data.events.length      → V92 Chronicle (in-memory)
  // Priority 2: cevV95Data.totalEvents        → V95 Civ Events (in-memory)
  // Priority 3: aeeV92Data.totalEvents        → V92 Autonomous Events
  // Priority 4: localStorage multi-key scan   → fallback
}
```

#### 3. ID Injection
Sau khi `buildSection()` tạo xong DOM, tìm các value divs bằng cấu trúc:
- `#awv92-year-num` → parentNode (year box) → parentNode (stats row) → children[1]/[2]
- Inject `id="srwf115-event-num"` và `id="srwf115-pop-num"`

#### 4. Live Refresh
- Interval 2000ms (đồng bộ với universeSyncBridgeV95.js)
- Hook `puosRenderMyUniverse` via `_orig` pattern
- Boot patches: 150ms / 400ms / 800ms sau render

---

## 📊 EXPECTED RESULTS

| Metric | Trước Fix | Sau Fix |
|--------|-----------|---------|
| Current Year | 446 ✅ | 446 ✅ |
| Events | 0 ❌ | > 0 ✅ |
| Population | 0 ❌ | 383 ✅ |

### Consistency Check
| Dashboard | Self-Running World |
|-----------|-------------------|
| `usbV95GetData().pop` | `srwf115GetData().population` |
| `usbV95GetData().evts` | `srwf115GetData().events` |
| ✅ Cùng nguồn dữ liệu | ✅ Cùng nguồn dữ liệu |

---

## 📁 FILES

| File | Thao Tác | Mô Tả |
|------|----------|-------|
| `selfRunningWorldFixV115.js` | **TẠO MỚI** | Fix engine chính |
| `index.html` | **THÊM 1 DÒNG** | `<script src="selfRunningWorldFixV115.js">` sau universeSyncBridgeV95.js |
| `autonomousWorldRegistryV92.js` | **KHÔNG CHỈNH SỬA** | Giữ nguyên |
| `universeSyncBridgeV95.js` | **KHÔNG CHỈNH SỬA** | Giữ nguyên |

---

## 🔧 PUBLIC API

```javascript
// Lấy data hiện tại từ SSOT
srwf115GetData()
// → { population: 383, events: N, year: 446 }

// Force re-patch ngay lập tức
srwf115PatchNow()
```

---

## ✅ CHECKLIST SAU CODE

| Hạng Mục | Trạng Thái |
|----------|-----------|
| Hệ thống cũ giữ nguyên | ✅ |
| `autonomousWorldRegistryV92.js` không bị sửa | ✅ |
| `universeSyncBridgeV95.js` không bị sửa | ✅ |
| File mới: `selfRunningWorldFixV115.js` | ✅ |
| Script tag thêm vào `index.html` | ✅ |
| Không tạo save key mới (không cần) | ✅ |
| Tương thích ngược | ✅ |
| Population = Dashboard Population | ✅ |
| Events = Dashboard Events | ✅ |
| Không hardcode zero | ✅ |

---

*Generated: V115.6 · Expand Only · No Delete · No Replace*
