---
name: Project Expand-Only Rules
description: Creator God V6 cấm xóa/thay thế code cũ — chỉ mở rộng. gameTick hook pattern và IIFE init pattern bắt buộc.
---

## Rules cứng
- EXPAND ONLY · NEVER DELETE · NEVER REPLACE · NEVER REBUILD
- Không ghi đè app.js (dù 1 dòng)
- Không ghi đè index.html (chỉ THÊM dòng mới)
- Nếu file đã tồn tại → KHÔNG ghi đè, tạo file V2/VXX riêng
- Nếu sửa hơn 20 dòng code cũ → DỪNG, tạo extension layer

## gameTick hook pattern (bắt buộc)
```javascript
const _orig = window.gameTick;
window.gameTick = function() {
  if (_orig) _orig();
  myEngineTick();
};
```

## IIFE + init pattern (bắt buộc)
```javascript
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_tenengine_vXX";
  // ...
  function init() {
    load();
    // hook gameTick
    const _orig = window.gameTick;
    window.gameTick = function() { if(_orig)_orig(); myTick(); };
    console.log("[Engine VXX] khởi động ✓");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, NNNN); });
  } else {
    setTimeout(init, NNNN);
  }
})();
```

## index.html integration checklist
1. Nav button (class="nav-btn ec-hidden" style="display:none" data-panel="PANEL_ID")
2. Panel div (id="panel-PANEL_ID" class="panel")  
3. Script tag (cuối file trước </body>)
4. Thêm "PANEL_ID" vào v23Panels array trong unlock script

**Why:** Project có 100+ file engines, tất cả hook vào cùng window.gameTick chain. Vi phạm pattern gây xung đột hoặc mất chức năng cũ.
