# Creator God V6 — Nền Tảng Đa Thế Giới

## QUAN TRỌNG: ĐỌC TOÀN BỘ FILE NÀY TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ

Đây là project browser game mô phỏng thế giới, viết bằng Vanilla JS thuần.
Luôn trả lời bằng **TIẾNG VIỆT**.

Sau khi đọc file này, hãy đọc tiếp:
1. `AI_MEMORY.md` — Context chi tiết toàn bộ dự án
2. `PROJECT_STATUS.md` — Danh sách hệ thống, tabs, save keys, roadmap
3. `PROJECT_CHANGELOG.md` — Lịch sử V1→V25

---

## ═══════════════════════════════════════════
## PROJECT PROTECTION BLOCK — BẮT BUỘC TUÂN THỦ
## ═══════════════════════════════════════════

### TUYỆT ĐỐI KHÔNG:
- ❌ Xóa file cũ, xóa dữ liệu cũ, xóa tab UI cũ, xóa engine cũ
- ❌ Đổi tên file, class, biến cũ
- ❌ Thay thế hệ thống cũ bằng hệ thống mới
- ❌ Ghi đè logic cũ
- ❌ Viết lại `app.js` (dù 1 dòng)
- ❌ Viết lại `index.html` (chỉ được THÊM dòng mới)
- ❌ Xóa engine cũ dù có vẻ "lỗi thời"

### CHỈ ĐƯỢC PHÉP:
- ✅ Mở rộng hệ thống cũ
- ✅ Tạo file mới
- ✅ Thêm script tag / panel / nav button vào index.html
- ✅ Thêm vào danh sách unlock tabs

### QUY TẮC ĐẶC BIỆT:
- Nếu chuẩn bị sửa hơn 20 dòng code cũ → **DỪNG**, tạo extension layer (file mới)
- Nếu file đã tồn tại (vd: `worldEventEngine.js`) → **KHÔNG ghi đè**, tạo file V25/V2 riêng

**PROJECT MODE: EXPAND ONLY · NEVER DELETE · NEVER REPLACE · NEVER REBUILD**

---

## Tech Stack

- **Vanilla JS thuần** — KHÔNG React/Vue/framework
- **KHÔNG build tool** — không webpack/vite
- **localStorage** — KHÔNG backend/database
- **Static server**: `serve . -p 5000 -n` (port 5000)
- **Entry point**: `index.html`
- Tất cả scripts load qua `<script src="xxx.js">` trong index.html

---

## Pattern Viết Engine (IIFE)

```javascript
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_tenengine_vXX";

  window.tenEngineData = { /* state */ };

  function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tenEngineData)); }
  function load() { const d = localStorage.getItem(SAVE_KEY); if(d) window.tenEngineData = JSON.parse(d); }

  window.tenEngineTick = function() { /* logic mỗi tick */ };
  window.tenEngineRenderPanel = function() { /* render HTML vào panel div */ };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if(_orig) _orig(); window.tenEngineTick(); };
    console.log("[TenEngine VXX] Khởi động thành công.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, NNNN); });
  } else {
    setTimeout(init, NNNN);
  }
})();
```

## Pattern Tích Hợp index.html

```html
<!-- 1. NAV BUTTON (trong sidebar nav) -->
<button class="nav-btn ec-hidden" style="display:none" id="btn-TENENGINE"
  onclick="showPanel('TENENGINE');if(typeof tenEngineRenderPanel==='function')tenEngineRenderPanel();"
  data-panel="TENENGINE">EMOJI Tên Tab</button>

<!-- 2. PANEL DIV (trong vùng main content) -->
<div id="panel-TENENGINE" class="panel"></div>

<!-- 3. SCRIPT TAG (cuối file trước </body>) -->
<script src="tenEngine.js"></script>

<!-- 4. THÊM VÀO unlock list trong v23UnlockTabs() -->
const v23Panels = [...danh_sách_cũ..., "TENENGINE"];
```

---

## Global Objects Quan Trọng

```
window.world            — World state hiện tại
window.npcs             — Mảng NPC
window.countries        — Mảng quốc gia
window.year             — Năm hiện tại simulation
window.gameTick         — Hàm tick chính (hook vào đây, KHÔNG ghi đè thẳng)
window.kingdomData      — Kingdoms V23
window.empireData       — Empires V23
window.warsActive       — Danh sách chiến tranh
window.allianceData     — Liên minh V24
window.treatyData       — Hiệp ước V24
window.sanctionData     — Trừng phạt V24
window.worldCouncilData — Hội Đồng V24
window.disasterData     — Thiên tai V25
window.plagueData       — Đại dịch V25
window.econCrisisData   — Sự kiện kinh tế V25
window.worldEventV25Data — Sự kiện chính trị V25
window.ageV25Data       — Thời đại V25

Hàm tiện ích:
window.htAddEvent({year,type,title,color})           — Ghi vào Historical Timeline
window.wmeAddMemory({year,category,title,content})   — Ghi vào World Memory
window.drGetRelation(a, b)                           — Điểm quan hệ 2 thế lực
window.aeAreAllied(a, b)                             — Kiểm tra liên minh (boolean)
window.teHasTreaty(a, b, type)                       — Kiểm tra hiệp ước
```

---

## Phiên Bản Hiện Tại: V25

### 5 Hệ Thống Mới Nhất (V25 — World Event System)
| File | Hệ Thống |
|---|---|
| `disasterEngine.js` | 🌋 Thiên Tai — 5 loại, 4 cấp độ |
| `plagueEngine.js` | 💀 Đại Dịch — 3 loại, lây lan vùng |
| `economicCrisisEngine.js` | 💹 Sự Kiện Kinh Tế — 5 loại |
| `worldEventEngineV25.js` | 🗡️ Sự Kiện Chính Trị V25 — 5 loại |
| `ageEngineV25.js` | 🌅 Thời Đại V25 — 5 thời đại |

### Tổng Số File JS: ~79 files

---

## Checklist Trước Khi Code

1. Hệ thống hiện có liên quan là gì?
2. File hiện có liên quan là gì?
3. Tab UI hiện có liên quan là gì?
4. Kế hoạch tích hợp (thêm vào đâu trong index.html)?
5. Save key mới (không trùng key cũ)?

## Checklist Sau Khi Code

1. Hệ thống cũ đã giữ nguyên (liệt kê)
2. File mới đã tạo
3. File đã chỉnh sửa (chỉ thêm, không xóa)
4. Tab UI mới
5. Save key mới
6. Tương thích ngược: save cũ có load được không?

---

## User Preferences

- Trả lời bằng **TIẾNG VIỆT** 100%
- Không xóa bất cứ thứ gì — chỉ mở rộng
- Không viết lại — chỉ tạo file mới khi cần
- Báo cáo đầy đủ sau mỗi task
- Đề xuất tính năng tiếp theo sau khi hoàn thành
