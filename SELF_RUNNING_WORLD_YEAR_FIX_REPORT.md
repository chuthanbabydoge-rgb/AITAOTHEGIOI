# SELF_RUNNING_WORLD_YEAR_FIX_REPORT.md
> Ngày: 2026-06-15 | Version: V115.7

---

## 🐛 VẤN ĐỀ BÁO CÁO

Panel **"Thế Giới Tự Vận Hành"** (awv92-section) hiển thị không nhất quán:

| Chỉ Số | Hiển Thị Sai | Giá Trị Đúng |
|---|---|---|
| NĂM HIỆN TẠI | 589 ✅ | — |
| SỐ NĂM ĐÃ TRÔI QUA | 0 ❌ | 589 |

**Yêu cầu:** Nếu năm hiện tại = 589 và thế giới bắt đầu từ năm 1 (hay tương đương năm 0), số năm đã trôi qua phải bằng 589.

---

## 🔍 PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ

### File bị lỗi: `autonomousWorldRegistryV92.js` + `worldAutonomyClockV92.js`

#### `autonomousWorldRegistryV92.js` (line 73, 84, 96)

```js
// Dùng wacV92GetElapsed() để render badge #awv92-elapsed:
var elapsed = typeof window.wacV92GetElapsed === 'function'
  ? window.wacV92GetElapsed()
  : 0;
elBadge.textContent = elapsed + ' năm đã trôi qua';
```

#### `worldAutonomyClockV92.js` (line 8, 32, 49)

```js
window.wacV92Data = {
  totalYearsElapsed: 0,   // ← SESSION COUNTER, bắt đầu từ 0 mỗi session
  startYear: 1,
  lastYear: 0,
  ...
};

window.wacV92GetElapsed = function() {
  return window.wacV92Data.totalYearsElapsed;   // ← Trả về session counter
};

// Chỉ tăng khi year thay đổi TRONG SESSION này:
if (prev > 0) {
  window.wacV92Data.totalYearsElapsed++;        // ← Đếm tick, không đếm tuổi
}
```

### Root cause

`totalYearsElapsed` là **session tick counter** — chỉ đếm số lần `window.year` thay đổi *trong phiên hiện tại*. Sau mỗi lần tải lại trang:

1. `load()` được gọi → `wacV92Data` (gồm `totalYearsElapsed`) được khôi phục từ localStorage ✅
2. **Nhưng:** `window.wacV92Data.lastYear = window.year || 1` (line 63) — gán ngay `lastYear = cy`
3. Lần tick tiếp theo: `cy === lastYear` → **không increment** → `totalYearsElapsed` không cập nhật
4. Kết quả: Nếu chưa có tick nào trong session → `totalYearsElapsed` vẫn là giá trị cũ từ session trước
5. Khi world mới được load hoặc clock không chạy liên tục → `totalYearsElapsed` ≠ `currentYear - startYear`

**Vấn đề sâu hơn:** `totalYearsElapsed` đếm *số tick*, không đếm *tuổi thế giới*. Nếu user bỏ qua thời gian (time skip, load save), counter không tăng tương ứng.

---

## ✅ GIẢI PHÁP ĐÃ TRIỂN KHAI

### File được cập nhật: `selfRunningWorldFixV115.js` (V115.7)

**Nguyên tắc: EXPAND ONLY — không sửa `worldAutonomyClockV92.js`, chỉ override textContent của `#awv92-elapsed`.**

### Hàm mới: `getElapsedYears()`

```js
function getElapsedYears() {
  // Priority 1: window.year (in-memory, load từ localStorage khi world load)
  var cy = window.year || 0;

  // Priority 2: wacV92Data.lastYear (localStorage — persists qua cgv6_autonomy_clock_v92)
  if (cy <= 0 && window.wacV92Data && window.wacV92Data.lastYear > 0) {
    cy = window.wacV92Data.lastYear;
  }

  // Priority 3: localStorage cgv6_autonomy_clock_v92 trực tiếp
  if (cy <= 0) {
    try {
      var cd = localStorage.getItem('cgv6_autonomy_clock_v92');
      if (cd) { var cp = JSON.parse(cd); cy = cp.lastYear || cp.startYear || 0; }
    } catch(e) {}
  }
  if (cy <= 0) cy = 1;

  // startYear từ wacV92Data (localStorage) | fallback = 1
  var startYear = (window.wacV92Data && window.wacV92Data.startYear > 0)
    ? window.wacV92Data.startYear : 1;

  // localStorage fallback cho startYear
  if (!window.wacV92Data || !(window.wacV92Data.startYear > 0)) {
    try {
      var cd2 = localStorage.getItem('cgv6_autonomy_clock_v92');
      if (cd2) { var cp2 = JSON.parse(cd2); if (cp2.startYear > 0) startYear = cp2.startYear; }
    } catch(e) {}
  }

  // elapsed = cy - startYear + 1
  // Ví dụ: cy=589, startYear=1 → elapsed = 589 ✅
  var elapsed = cy - startYear + 1;
  return elapsed > 0 ? elapsed : 0;
}
```

### Trong `patchValues()` — Override `#awv92-elapsed`

```js
var elapsedEl = document.getElementById('awv92-elapsed');
if (elapsedEl) {
  var newElapsed = fmt(elapsed) + ' năm đã trôi qua';
  if (elapsedEl.textContent !== newElapsed) elapsedEl.textContent = newElapsed;
}
```

`#awv92-elapsed` đã có sẵn id từ `buildSection()` — không cần inject ID mới.

---

## 🗺️ NGUỒN DỮ LIỆU (SAU FIX)

```
SỐ NĂM ĐÃ TRÔI QUA — Priority Cascade:
  1. window.year                           (in-memory — load từ localStorage khi world load)
  2. wacV92Data.lastYear                   (localStorage cgv6_autonomy_clock_v92 — persists)
  3. localStorage cgv6_autonomy_clock_v92  (direct read — lastYear hoặc startYear)

  startYear:
  1. wacV92Data.startYear                  (localStorage cgv6_autonomy_clock_v92)
  2. localStorage cgv6_autonomy_clock_v92  (direct read)
  3. Default = 1

  elapsed = currentYear - startYear + 1
```

---

## 📐 CÔNG THỨC VÀ VÍ DỤ

| currentYear | startYear | elapsed | Ghi chú |
|---|---|---|---|
| 589 | 1 | **589** ✅ | Case của user |
| 1 | 1 | **1** ✅ | Năm đầu tiên |
| 100 | 1 | **100** ✅ | Năm thứ 100 |
| 50 | 25 | **26** ✅ | World bắt đầu giữa chừng |

---

## 🔄 TẠI SAO KHÔNG RESET SAU KHI TẢI LẠI

| | `totalYearsElapsed` (cũ) | `cy - startYear + 1` (mới) |
|---|---|---|
| Sau tải lại | Reset về giá trị cũ, nhưng không tăng tiếp cho đến tick tiếp theo | **Tính lại ngay từ localStorage** |
| Sau time skip | Không tăng | **Tự động phản ánh** |
| Session mới | Chỉ đếm tick trong session | **Luôn = tuổi thực của thế giới** |

---

## ✅ XÁC NHẬN CÁC YÊU CẦU

| Yêu cầu | Trạng Thái |
|---|---|
| 1. Giữ nguyên sau khi tải lại | ✅ `window.year` và `wacV92Data.startYear` load từ localStorage |
| 2. Năm 589 → elapsed = 589 | ✅ `589 - 1 + 1 = 589` |
| 3. Cùng nguồn dữ liệu với Tuổi Vũ Trụ | ✅ `window.year` + `wacV92Data` (cùng `worldAutonomyClockV92`) |
| 4. Không reset khi làm mới | ✅ Tính toán, không dùng session counter |

---

## 📁 FILES LIÊN QUAN

| File | Vai Trò | Hành Động |
|---|---|---|
| `selfRunningWorldFixV115.js` | Fix đã cập nhật (V115.7) | ✏️ BUG FIXED |
| `worldAutonomyClockV92.js` | Nguồn `wacV92Data.startYear` | 🔒 Không sửa |
| `autonomousWorldRegistryV92.js` | Render `#awv92-elapsed` | 🔒 Không sửa (override DOM) |

---

## 📋 RULE TUÂN THỦ

- ✅ **CHỈ MỞ RỘNG** — không xóa, không thay thế, không xây dựng lại
- ✅ Không sửa `worldAutonomyClockV92.js` hay `autonomousWorldRegistryV92.js`
- ✅ Chỉ patch DOM textContent của `#awv92-elapsed` sau khi panel build
- ✅ Tất cả fallback dùng localStorage — không có hành vi đặt lại khi làm mới
