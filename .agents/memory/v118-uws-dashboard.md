---
name: V118 UWS Live Dashboard
description: Real-time PUOS panel đọc window.UWS, inject nav button, auto-refresh 1s
---

# V118 — UWS Live Dashboard Panel

## File
- uwsDashboardV118.js — 1 file duy nhất

## Cách hoạt động
- Inject nav button "🌐 Live State" vào #puos-sidebar bằng setInterval polling (chờ sidebar render)
- Patch `window.puosGo` (_orig pattern): nếu sectionId === 'uws-dashboard' thì render và startLive(); nếu tab khác thì stopLive()
- `startLive()`: setInterval 1000ms → uwsRefresh() → puosRenderUWSDashboard(main)
- `stopLive()`: clearInterval khi chuyển tab hoặc sidebar element biến mất

## UI gồm 6 cards
1. 🌍 Thế Giới — name/genre/year/age/pop + vitality progress bar
2. 👤 Thực Thể — NPCs alive/dead/cultivators + kingdoms/empires/civs/species
3. ⚡ Sự Kiện Đang Diễn Ra — wars/disasters/plagues/crises + war badges
4. 🤝 Quan Hệ Quốc Tế — alliances/treaties/sanctions/council
5. ⭐ Top 5 NPC Mạnh Nhất (wide)
6. 📜 Sự Kiện Gần Đây (wide)

## Flash animation
- `_prevValues` dict lưu giá trị lần trước
- `flashClass(key, val)` so sánh → trả về ' uws118-flash' nếu changed
- CSS @keyframes uws118-flash-anim: background #7c3aed44 → transparent 0.6s

## **Why:**
PUOS panels không tự refresh — cần live layer đọc UWS mỗi 1s để hiển thị trạng thái real-time.

## **How to apply:**
- Gọi `puosGo('uws-dashboard')` từ bất kỳ đâu để mở dashboard
- Nếu cần inject thêm section vào dashboard, patch `window.puosRenderUWSDashboard` (_orig pattern)
- init 26600ms · next V119 từ 26700ms+
