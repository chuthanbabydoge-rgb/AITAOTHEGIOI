# PROMPT_TEMPLATE.md — Creator God V6
# Template Onboarding cho AI Assistant Mới

> Copy toàn bộ nội dung trong ô bên dưới và paste vào tin nhắn đầu tiên khi mở project ở tài khoản/session mới.

---

## ═══════════════════════════════════════════════
## COPY TỪ ĐÂY
## ═══════════════════════════════════════════════

```
Xin chào. Đây là project Creator God V6 — Nền Tảng Đa Thế Giới.

Trước khi làm bất cứ điều gì, hãy đọc các file sau theo đúng thứ tự:

1. AI_MEMORY.md          ← ĐỌC ĐẦU TIÊN — Toàn bộ context dự án
2. PROJECT_STATUS.md     ← Danh sách hệ thống, tabs, save keys, roadmap
3. PROJECT_CHANGELOG.md  ← Lịch sử V1→V25, không làm lại những gì đã có
4. PROJECT_ARCHITECTURE.md ← Cấu trúc file, dependencies, UI flow

Sau khi đọc xong, xác nhận bằng cách liệt kê:
- Phiên bản hiện tại
- 5 hệ thống mới nhất
- Tab mới nhất
- Next Recommended Build là gì

═══════════════════════════════════════════════════
PROJECT PROTECTION BLOCK — ĐỌC KỸ TRƯỚC KHI CODE
═══════════════════════════════════════════════════

LUÔN LUÔN trả lời bằng TIẾNG VIỆT.
Đọc TOÀN BỘ project (index.html + tất cả .js files) trước khi code.

TUYỆT ĐỐI KHÔNG:
❌ Xóa file cũ
❌ Xóa dữ liệu cũ
❌ Xóa save cũ
❌ Xóa tab UI cũ
❌ Xóa dashboard cũ
❌ Xóa lịch sử thế giới
❌ Đổi tên file cũ
❌ Đổi tên class cũ
❌ Đổi tên biến cũ
❌ Thay thế hệ thống cũ bằng hệ thống mới
❌ Ghi đè logic cũ
❌ Viết lại app.js (dù 1 dòng)
❌ Viết lại index.html (chỉ được THÊM dòng mới)
❌ Xóa engine cũ dù engine đó có vẻ "lỗi thời"

CHỈ ĐƯỢC PHÉP:
✅ Mở rộng hệ thống cũ
✅ Thêm code mới
✅ Tạo file mới
✅ Tích hợp engine mới vào index.html (thêm script tag, panel, nav button)
✅ Thêm vào danh sách unlock tabs

NẾU CHUẨN BỊ SỬA HƠN 20 DÒNG CODE CŨ:
⚠️ DỪNG NGAY → Tạo extension layer (file mới) thay vì sửa file cũ

NẾU FILE ĐÃ TỒN TẠI (vd: worldEventEngine.js):
⚠️ KHÔNG ghi đè → Tạo file V25/V2 riêng (vd: worldEventEngineV25.js)

═══════════════════════════════════════════════════
TRƯỚC KHI BẮT ĐẦU CODE, PHẢI LIỆT KÊ:
═══════════════════════════════════════════════════

1. Hệ thống hiện có liên quan
2. File hiện có liên quan
3. Tab UI hiện có liên quan
4. Kế hoạch tích hợp (thêm vào đâu trong index.html)
5. Save key mới sẽ dùng (không trùng key cũ)

═══════════════════════════════════════════════════
SAU KHI HOÀN THÀNH, PHẢI BÁO CÁO:
═══════════════════════════════════════════════════

1. Hệ thống cũ đã giữ nguyên (liệt kê)
2. Hệ thống mới đã tạo (liệt kê file + tính năng)
3. File mới đã tạo
4. File đã chỉnh sửa (chỉ thêm, không xóa)
5. Tab UI mới
6. Save key mới
7. Kiểm tra tương thích ngược (save cũ có load được không)

═══════════════════════════════════════════════════
TECH STACK (ĐỌC ĐỂ HIỂU PATTERN):
═══════════════════════════════════════════════════

- Vanilla JS thuần (KHÔNG dùng React/Vue/framework)
- KHÔNG có build tool (webpack/vite/etc)
- localStorage persistence (KHÔNG có backend/database)
- Static file server: `serve . -p 5000 -n`
- Entry point: index.html
- Tất cả script load qua <script src="xxx.js"> trong index.html

Pattern viết engine:
```javascript
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_tenengine_vXX";

  window.tenEngineData = { ... };           // State global

  function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tenEngineData)); }
  function load() { const d = localStorage.getItem(SAVE_KEY); if(d) window.tenEngineData = JSON.parse(d); }

  window.tenEngineTick = function() { ... };          // Hook vào gameTick
  window.tenEngineRenderPanel = function() { ... };    // Render vào panel div

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

Pattern thêm vào index.html:
```html
<!-- NAV BUTTON (trong <nav> sidebar) -->
<button class="nav-btn ec-hidden" style="display:none" id="btn-TENENGINE"
  onclick="showPanel('TENENGINE');if(typeof tenEngineRenderPanel==='function')tenEngineRenderPanel();"
  data-panel="TENENGINE">EMOJI Tên Tab</button>

<!-- PANEL DIV (trong vùng main content) -->
<div id="panel-TENENGINE" class="panel">
  <!-- Rendered by tenEngineRenderPanel() -->
</div>

<!-- SCRIPT TAG (cuối file, trước thẻ đóng </body>) -->
<script src="tenEngine.js"></script>

<!-- THÊM VÀO DANH SÁCH UNLOCK (trong v23UnlockTabs) -->
const v23Panels = [..., "TENENGINE"];
```

═══════════════════════════════════════════════════
GLOBAL OBJECTS QUAN TRỌNG:
═══════════════════════════════════════════════════

window.world          — World state hiện tại
window.npcs           — Mảng NPC
window.countries      — Mảng quốc gia
window.year           — Năm hiện tại của simulation
window.gameTick       — Hàm tick chính (hook vào đây)
window.kingdomData    — Dữ liệu Kingdoms V23
window.empireData     — Dữ liệu Empires V23
window.warsActive     — Danh sách chiến tranh đang hoạt động
window.allianceData   — Dữ liệu liên minh V24
window.treatyData     — Dữ liệu hiệp ước V24
window.sanctionData   — Dữ liệu trừng phạt V24
window.worldCouncilData — Dữ liệu Hội Đồng V24
window.disasterData   — Dữ liệu thiên tai V25
window.plagueData     — Dữ liệu đại dịch V25
window.econCrisisData — Dữ liệu sự kiện kinh tế V25
window.worldEventV25Data — Dữ liệu sự kiện chính trị V25
window.ageV25Data     — Dữ liệu thời đại V25

Hàm tiện ích:
window.drGetRelation(a, b)        — Lấy điểm quan hệ giữa 2 thế lực (-100 đến +100)
window.aeAreAllied(a, b)          — Kiểm tra có liên minh không (boolean)
window.teHasTreaty(a, b, type)    — Kiểm tra loại hiệp ước
window.htAddEvent({year,type,title,color}) — Ghi vào Historical Timeline
window.wmeAddMemory({year,category,title,content}) — Ghi vào World Memory

═══════════════════════════════════════════════════
PROJECT MODE: EXPAND ONLY · NEVER DELETE · NEVER REPLACE · NEVER REBUILD
═══════════════════════════════════════════════════
```

## ═══════════════════════════════════════════════
## HẾT — DÁN ĐẾN ĐÂY
## ═══════════════════════════════════════════════

---

## Hướng Dẫn Chuyển Project

### Bước 1 — Xuất file
Trong game: nhấn nút **"Xuất Tất Cả"** để export ZIP toàn bộ worlds (localStorage data).
Hoặc tải thủ công tất cả file từ Replit.

### Bước 2 — Upload lên tài khoản mới
Upload ZIP vào Replit mới. Đảm bảo giữ nguyên cấu trúc thư mục (tất cả file ở root `/`).

### Bước 3 — Cấu hình workflow
Tạo workflow với lệnh: `serve . -p 5000 -n`

### Bước 4 — Paste prompt onboarding
Copy toàn bộ nội dung trong ô ở trên, paste vào tin nhắn đầu tiên cho AI.

### Bước 5 — Xác nhận AI đã hiểu
AI phải xác nhận đọc xong bằng cách liệt kê version + 5 hệ thống mới nhất.

---

## Checklist File Cần Mang

- [ ] Toàn bộ file JS (~79 files)
- [ ] `index.html`
- [ ] `v6_style_additions.css`
- [ ] `AI_MEMORY.md` ⭐ quan trọng nhất
- [ ] `PROJECT_STATUS.md`
- [ ] `PROJECT_CHANGELOG.md`
- [ ] `PROJECT_ARCHITECTURE.md`
- [ ] `PROMPT_TEMPLATE.md` (file này)

---

*Creator God V6 — V25 — 2026-06-12*
*DO NOT DELETE THIS FILE*
