---
name: V38 UI Pattern — No New Sidebar Tabs
description: Quy tắc UI từ V38 — mọi feature mới phải nằm trong hub hiện có, không thêm tab sidebar
---

# V38 UI Pattern — No New Sidebar Tabs

**Rule:** Từ V38 trở đi, KHÔNG tạo nav button mới trong sidebar. Mọi UI phải nằm bên trong các hub hiện có.

**Why:** User instruction "Không tạo thêm tab sidebar mới" — sidebar đã quá nhiều tab.

**How to apply:**
- Ưu tiên tích hợp vào `mvHubRenderPanel()` (inline script trong index.html) bằng cách thêm section mới trước `+'</div>';` cuối cùng (closing outer container)
- Pattern: `+'<div style="margin-top:28px;padding-top:20px;border-top:1px solid #1e293b">'` + header + stats + button grid + `+'</div>'`
- Render functions gọi `showPanel('panel-xxx')` để switch sang panel div riêng (panel divs phải được thêm vào index.html)
- Không thêm vào v23Panels unlock list (chỉ accessible từ bên trong hub)
