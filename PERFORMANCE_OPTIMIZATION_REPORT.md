# PERFORMANCE OPTIMIZATION REPORT
> Creator God V6 | Phân tích kỹ thuật dựa trên source code audit thực tế
> Ngày: 2026-06-13 | Phiên bản: V61

---

## 📊 TÓM TẮT ĐIỂM SỐ

| Hạng Mục | Điểm | Đánh Giá |
|---|---|---|
| **Render System** | 42/100 | 🔴 Kém — innerHTML đồng bộ mỗi tick |
| **State Management** | 55/100 | 🟡 Trung Bình — 200+ global objects, trùng lặp |
| **Memory Usage** | 48/100 | 🔴 Kém — biography arrays không có giới hạn |
| **Save System** | 60/100 | 🟡 Trung Bình — ~351 keys, không nén, lỗi thầm |
| **Tick System** | 50/100 | 🟡 Trung Bình — 64+ hooks, 50+ lớp sâu |
| **Tổng Thể** | 51/100 | 🟡 Có thể chạy được, cần tối ưu trước production |

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG (P0 — Cần Sửa Ngay)

### P0-01: renderAll() gọi mỗi tick dù panel không active
**Vấn đề:** `simulateWorld()` gọi `renderAll()` trên **mọi tick**. Trong `renderAll()`, có nhiều `document.getElementById` + `innerHTML` writes chạy đồng bộ trong event loop.

**Tác động:** Ở tốc độ MAX (50 ticks/frame), game cố gắng render UI 50 lần/frame — hầu hết là vô ích vì chỉ 1 panel visible tại 1 thời điểm.

**Giải pháp đề xuất:**
```javascript
// Thêm dirty flag system
window._renderDirty = {};
function markDirty(panelId) { window._renderDirty[panelId] = true; }
// Chỉ render panel đang active + các panel dirty
function renderAll() {
  const activePanel = document.querySelector('.panel.active');
  if (!activePanel) return;
  // render chỉ panel active
}
```

---

### P0-02: NPC Biography Arrays không có giới hạn
**Vấn đề:** Mỗi NPC có `npc.biography[]` array. Mỗi sự kiện (sinh, đột phá, chiến đấu, kết hôn) đều `push()` vào mà **không có giới hạn**.

**Tác động ước tính:**
- NPC thọ 1000 năm: biography ~500-1000 entries × string data
- 500 NPC sống: ~250,000-500,000 biography strings trong RAM
- Kết hợp với JSON.stringify khi save: lag đột ngột mỗi 10 năm

**Giải pháp đề xuất:**
```javascript
// Thêm vào hàm addBiography() hoặc trực tiếp trước push:
if (npc.biography.length > 50) npc.biography.splice(0, 1); // FIFO cap
```

---

### P0-03: Dead NPCs tồn tại mãi trong array
**Vấn đề:** `killNPC()` set `npc.status = "dead"` nhưng **không remove khỏi `npcs[]`**. Mọi tick loop đều filter: `const aliveNPCs = npcs.filter(n => n.status === "alive")` — tạo array mới mỗi tick.

**Tác động:** Sau 500 năm game với 1000 NPC đã chết, mỗi tick filter phải scan 1000+ dead objects + tạo closure array mới.

**Giải pháp đề xuất:**
```javascript
// Trong simulateWorld, mỗi 100 năm game:
if (year % 100 === 0) {
  // Archive biography rồi purge
  const dead = window.npcs.filter(n => n.status === "dead");
  dead.forEach(n => { n.biography = [n.biography[0]]; n.inventory = []; }); // slim
  // Hoặc remove hoàn toàn nếu đã archive
}
```

---

## 🟡 VẤN ĐỀ TRUNG BÌNH (P1 — Nên Sửa Trước Launch)

### P1-01: gameTick Chain Depth >50 lớp
**Vấn đề:** 64+ systems hook vào `window.gameTick` theo pattern `const _orig = window.gameTick`. Mỗi tick = 50+ nested function calls.

**Hiện trạng:** Hoạt động nhưng tốn memory cho call stack. Không có cách tắt từng bridge riêng lẻ khi debug.

**Giải pháp đề xuất:**
```javascript
// Thay thế hook chain bằng registry (không phá vỡ code cũ):
window._tickRegistry = window._tickRegistry || [];
window._tickRegistry.push({ id: 'mySystem', fn: mySystemTick, priority: 10 });
// Master tick gọi registry theo priority
```
*Lưu ý: Đây là refactor lớn — cân nhắc cho V65+*

---

### P1-02: localStorage ~351 keys, không nén, silent failure
**Vấn đề:** 
- ~351 `cgv6_*` keys không có quản lý tập trung
- Khi đầy localStorage (5MB), tất cả `setItem` fail thầm lặng
- Không có compression — raw JSON string

**Tác động:** User có thể mất data mà không biết.

**Giải pháp đề xuất:**
```javascript
// Thêm vào saveManager.js: quota check
function checkStorageQuota() {
  let total = 0;
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('cgv6_')) total += localStorage.getItem(k).length;
  });
  const pct = (total / (5 * 1024 * 1024)) * 100;
  if (pct > 80) console.warn('[SaveManager] ⚠️ localStorage ' + pct.toFixed(1) + '% đầy!');
  return pct;
}
```

---

### P1-03: innerHTML Full Re-render — Không có diffing
**Vấn đề:** Mọi engine render bằng cách ghi đè toàn bộ `container.innerHTML` với template string mới. Không có virtual DOM, không có partial update.

**Tác động:** 
- Mỗi khi user click một panel, toàn bộ HTML được tạo lại
- Tab với list 100+ item (NPC list, guild list, boss list) = blocking DOM parse

**Giải pháp đề xuất (không phá code cũ):**
```javascript
// Chỉ render khi content thực sự thay đổi:
function renderIfChanged(el, newHtml) {
  if (el && el._lastHtml !== newHtml) {
    el.innerHTML = newHtml;
    el._lastHtml = newHtml;
  }
}
```

---

### P1-04: Population "nhiều nguồn sự thật"
**Vấn đề:** Population được track song song bởi:
- `popStats` (global)
- `countries[].population`
- `world.territories[].population`
- Một số engines có counter riêng

**Tác động:** Sau nhiều năm, các số liệu drift khác nhau. Báo cáo inconsistent.

**Giải pháp:** Designate `popStats.total` là **single source of truth**, các engine khác chỉ reference.

---

## 🟢 VẤN ĐỀ NHỎ (P2 — Tối Ưu Thêm)

### P2-01: setInterval không sync với display refresh
**Vấn đề:** Tick loop dùng `setInterval` — không sync với 60Hz browser refresh.

**Giải pháp:** Ở tốc độ 1x/10x: dùng `setInterval` như hiện tại. Ở tốc độ 1000x+: đã dùng RAF (tốt). Không cần thay đổi lớn.

---

### P2-02: Triple-logging History Events
**Vấn đề:** `logs[]`, `eventTimeline[]`, `worldHistory[]` thường chứa cùng 1 event dưới 3 format khác nhau.

**Giải pháp:** Thống nhất về `eventTimeline[]` làm primary source, `logs[]` chỉ cho UI display.

---

### P2-03: `Date.now() + Math.random()` IDs không nhất quán
**Vấn đề:** Core NPCs dùng `_npcIdCounter` (integer), artifacts/items dùng `Date.now()_random` (string). Lookup functions phải handle cả 2 format.

**Giải pháp:** Standardize tất cả IDs về `cgv6_[type]_[timestamp]_[random4]` format trong các engine mới.

---

## 📈 THƯỚC ĐO HIỆU NĂNG ƯỚC TÍNH

| Scenario | Ước Tính FPS (MAX speed) | Ghi Chú |
|---|---|---|
| Năm 1, 10 NPC | ~55-60 FPS | Bình thường |
| Năm 100, 100 NPC | ~40-50 FPS | Chấp nhận được |
| Năm 500, 500 NPC | ~20-30 FPS | Bắt đầu lag |
| Năm 1000, 1000+ NPC | ~5-15 FPS | **Khó chơi** |
| Năm 2000+ (không purge) | <5 FPS | **Unplayable** |

---

## 🛣️ LỘ TRÌNH TỐI ƯU ĐỀ XUẤT

```
Phase 1 (Tuần 1) — Quick Wins:
  ✓ Biography cap: npc.biography.length <= 50
  ✓ renderIfChanged() helper
  ✓ Storage quota warning

Phase 2 (Tuần 2-3) — Core Fixes:
  ✓ Dead NPC purge mỗi 100 năm (archive slim)
  ✓ renderAll() chỉ render active panel
  ✓ Population single source of truth

Phase 3 (Tháng 2) — Architecture:
  ✓ gameTick registry system
  ✓ Save compression (LZ-string hoặc manual delta)
  ✓ Lazy-load panels khi lần đầu click
```

---

## ✅ ĐIỂM MẠNH CỦA ARCHITECTURE HIỆN TẠI

- IIFE pattern ngăn namespace pollution tốt
- Try/catch guards trên tick loops (hệ thống lỗi không crash game)
- Save key versioning (`_v58`, `_v60`) ngăn conflict
- Turbo mode đã dùng RAF đúng cách
- Tick interval adapts theo tốc độ người dùng chọn

---

*Report: 2026-06-13 | Dựa trên source code audit thực tế · 5 lĩnh vực*
