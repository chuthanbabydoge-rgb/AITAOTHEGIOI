# UI REARCHITECTURE REPORT — V90

> Date: 2026-06-14
> Pass: UI Rearchitecture Pass
> Objective: Biến "Admin Dashboard" thành "Personal Universe Operating System"

---

## 1. SIDEBAR MỚI GỒM GÌ

### Trước (11 groups, 100+ buttons)
```
🌍 Thế Giới       → world, npcs, logs, worldmap, world3d
🏰 Văn Minh       → countries, empire, kingdoms, empires, dynasty... (12 panels)
⚔️ Chiến Tranh    → sectwars, territories, war-engine... (6 panels)
🤝 Ngoại Giao     → diplomacy, alliance, sanctions... (9 panels)
🌌 Thiên Địa      → continent, naval, event-hub... (8 panels)
🏯 Tu Tiên        → sects, spirit-beast, cultivation... (5 panels)
📜 Lịch Sử       → world-history, chronicle, timeline... (7 panels)
💰 Kinh Tế       → economy, dungeon, technology (4 panels)
👤 Nhân Vật       → player, player-hub-v28 (2 panels)
👁 Tạo Hóa       → creator-hub-v32, guardian-hub-v33 (2 panels, mỗi hub 50+ sub-tabs)
⚙️ Hệ Thống      → dashboard, performance, project-status... (5 panels)
```
**Tổng: ~60 mục sidebar cấp cao, 249 panels, 102 nav buttons**

### Sau (6 items cố định — PUOS V90)
```
🪐 My Universe    → Dashboard tổng quan vũ trụ
🌍 Worlds         → Tạo, quản lý, AI Genesis, Timeline, Snapshots
🏛 Civilization   → Văn minh, Văn hóa, Tôn giáo, Tri thức, Lịch sử
🌌 Universe Hub   → Worlds, Creators, Portals, Events, Multiverse
🤖 Jarvis         → AI assistant với Claude API + command routing
⚙ Settings       → Chung, Hiệu năng, Bảo mật, Backup, Advanced
```
**Tổng: 6 items, mỗi item 4-5 sub-tabs = 26 tabs tổng**

### Escape Hatch
- **Classic Mode button** ở footer sidebar → khôi phục 100% UI cũ
- **"Xem Đầy Đủ →"** trong mỗi panel → mở đúng classic hub
- Advanced Settings → quick access 6 classic panels

---

## 2. MÀN HÌNH NÀO BỊ HỢP NHẤT

### Gộp vào "Worlds" (5 tabs)
| Cũ | Mới |
|---|---|
| creator-hub-v32 > World Creation Wizard | Worlds > Creation tab |
| creator-hub-v32 > AI Genesis (V75) | Worlds > Genesis tab |
| creator-hub-v32 > World DNA (V62) | Worlds > Creation tab |
| creator-hub-v32 > Timeline V76 | Worlds > Timeline tab |
| backupEngine (V87) | Worlds > Snapshots tab |
| worldmap panel | Quick action button |

### Gộp vào "Civilization" (5 tabs)
| Cũ | Mới |
|---|---|
| panel-civ-culture-v38 | Civilization > Cultures tab |
| panel-civ-religion-v38 | Civilization > Religions tab |
| panel-civ-tech-v38 | Civilization > Knowledge tab |
| academyEngineV79 | Civilization > Knowledge tab |
| philosophyEngineV79 | Civilization > Knowledge tab |
| world-history, world-chronicle | Civilization > History tab |
| panel-civ-overview-v38 | Civilization > Overview tab |

### Gộp vào "Universe Hub" (5 tabs)
| Cũ | Mới |
|---|---|
| universeHubCore V73 (Worlds tab) | Universe Hub > Worlds |
| universeHubCore V73 (Creators) | Universe Hub > Creators |
| universeGateSystemV56 (portals) | Universe Hub > Portals |
| universePassportData | Universe Hub > Portals |
| eventRegistryV59 | Universe Hub > Events |
| multiverseEvolutionV80 | Universe Hub > Multiverse |
| crossWorldInfluenceV80 | Universe Hub > Multiverse |

### Gộp vào "My Universe" (single dashboard)
| Cũ | Mới |
|---|---|
| PUOS registry V81 (overview) | My Universe stats |
| analyticsEngine V88 (metrics) | My Universe stats |
| universeHealthSystem V55 | My Universe health card |
| disasterRecovery V87 (health check) | My Universe health |
| historical timeline events | My Universe recent events |

### Gộp vào "Jarvis" (chat center)
| Cũ | Mới |
|---|---|
| guardian-hub-v33 (AI Advisor) | Jarvis panel |
| creator-hub-v32 > AI Advisor (V41) | Jarvis shortcuts |
| DivineOracle V77 | Jarvis Claude routing |
| worldAdvisorData | Jarvis context |

### Gộp vào "Settings" (5 tabs)
| Cũ | Mới |
|---|---|
| dashboard panel | Settings > General |
| performance panel (V82) | Settings > Performance |
| securityLayer V86 | Settings > Security |
| backupEngine V87 | Settings > Backup |
| project-status, next-version | Settings > Advanced |

---

## 3. COMPONENT NÀO BỊ LOẠI BỎ (ẨN, KHÔNG XÓA)

**Không có gì bị xóa.** Tất cả đều vẫn tồn tại trong DOM, chỉ bị ẩn bởi PUOS overlay.

### Ẩn (nhưng truy cập được qua Classic Mode):
- 11 sidebar groups với 100+ nav buttons
- guardian-hub-v33 (5 tabs)
- 22 tab gốc của creator-hub-v32
- 27 file inject thêm vào creator-hub-v32
- player-hub-v28 (10+ tabs)
- multiverse-hub-v35 (8+ tabs)

### Cách truy cập UI cũ:
1. Classic Mode toggle (sidebar footer) → khôi phục 100%
2. "Xem Đầy Đủ →" buttons trong PUOS panels
3. Settings > Advanced > Quick Access buttons

---

## 4. UX ĐƠN GIẢN HƠN THẾ NÀO

### Before (Pain Points)
- Sidebar có 11 groups, phải scroll để thấy hết
- creator-hub-v32 có ~50 tabs trong 1 hub → không biết dùng tab nào
- player-hub-v28 có tabs từ 8 file khác nhau inject vào → thứ tự ngẫu nhiên
- Không có "home page" — mở app là thấy dashboard/thế giới rỗng
- Không có hướng dẫn "làm gì tiếp theo"
- Jarvis bị chôn vùi trong creator-hub-v32 > AI Advisor tab

### After (PUOS UX)
- Mở app → thấy ngay My Universe dashboard với stats thật
- 6 items rõ ràng theo mental model: Vũ Trụ → Thế Giới → Văn Minh → Hub → Trợ Lý → Cài Đặt
- Jarvis là section riêng, accessible từ Quick Actions
- Quick action buttons trên My Universe: không cần nhớ panel nào
- "Xem Đầy Đủ →" pattern: overview trước, detail sau
- Classic Mode để power users không mất tính năng nào

### Cognitive Load Reduction
| Metric | Before | After |
|---|---|---|
| Sidebar items (cấp cao) | 60+ | 6 |
| Tabs trong hub phổ biến nhất | ~50 | 5 |
| Clicks để thấy universe health | 4-5 | 0 (hiển thị ngay) |
| Clicks để hỏi Jarvis | 3 | 1 |
| Clicks để tạo thế giới | 2 | 1 |

---

## 5. VẤN ĐỀ UI CÒN TỒN TẠI

### Critical
1. **localStorage limit** — 5MB limit, lsUsed indicator trong Settings nhưng chưa có auto-cleanup
2. **Classic Mode mặc định** — người dùng cũ sẽ cảm thấy "lost" khi load lần đầu thấy PUOS shell

### High Priority
3. **Mobile UX** — PUOS sidebar 200px + content area chật trên mobile (<768px)
4. **Tab state không persist** — khi navigate sang section khác rồi quay lại, tab active bị reset
5. **Loading time 24 giây** — PUOS shell chỉ hiện sau 24000ms (chờ tất cả engines load)

### Medium Priority
6. **Jarvis chat history** — không persist khi refresh (chỉ in-memory)
7. **My Universe "recent events"** — đọc từ localStorage keys, có thể miss events nếu key không match
8. **Classic Mode không nhớ state** — khi toggle Classic→PUOS, không nhớ đang ở panel nào trong Classic

### Low Priority
9. **PUOS animations** — chỉ có fade-in, chưa có slide transitions
10. **Dark/Light mode** — chỉ có dark mode

---

## 6. ĐIỂM UX HIỆN TẠI / 100

### Điểm Cũ (trước V90)
| Dimension | Điểm | Lý Do |
|---|---|---|
| Navigation Clarity | 12/25 | 60+ items, không có hierarchy rõ |
| First-Time Experience | 5/20 | Không có onboarding, overwhelming |
| Feature Discoverability | 10/20 | Tính năng hay bị chôn trong hubs |
| Visual Consistency | 14/20 | Mỗi engine có style riêng |
| Task Completion Speed | 5/15 | Phải click nhiều để làm 1 việc |
| **Tổng** | **46/100** | **"Admin Dashboard"** |

### Điểm Mới (sau V90 PUOS)
| Dimension | Điểm | Lý Do |
|---|---|---|
| Navigation Clarity | 22/25 | 6 items rõ ràng, mental model tốt |
| First-Time Experience | 13/20 | Dashboard ngay lập tức, nhưng còn thiếu onboarding |
| Feature Discoverability | 16/20 | Quick actions + "Xem Đầy Đủ" pattern |
| Visual Consistency | 17/20 | Design System thống nhất cho PUOS panels |
| Task Completion Speed | 11/15 | 1-2 clicks cho common tasks |
| **Tổng** | **79/100** | **"Personal Universe OS"** |

### Điểm Mục Tiêu (V95+)
- Onboarding wizard: +5 điểm First-Time Experience  
- Tab state persistence: +2 điểm Task Completion Speed
- Mobile optimization: +2 điểm Visual Consistency
- **Mục tiêu: 88+/100**

---

## 7. FILES ĐÃ TẠO (V90)

| File | Chức Năng | Init |
|---|---|---|
| `puosShell.js` | Main overlay shell · 6-item sidebar · routing · Classic Mode | 24000ms |
| `puosMyUniverse.js` | My Universe dashboard · stats · quick actions · events | 24100ms |
| `puosWorldsPanel.js` | Worlds · 5 tabs · Creation/Genesis/Timeline/Snapshots | 24200ms |
| `puosCivPanel.js` | Civilization · 5 tabs · Culture/Religion/Knowledge/History | 24300ms |
| `puosHubPanel.js` | Universe Hub · 5 tabs · Worlds/Creators/Portals/Events/Multiverse | 24400ms |
| `puosJarvis.js` | Jarvis AI · chat · Claude bridge · command routing | 24500ms |
| `puosSettings.js` | Settings · 5 tabs · General/Performance/Security/Backup/Advanced | 24600ms |

### Rules Đã Tuân Thủ
- ✅ EXPAND ONLY — không xóa file cũ
- ✅ IIFE pattern với staggered init
- ✅ Không sửa app.js
- ✅ Không xóa panels cũ — chỉ ẩn bằng CSS overlay
- ✅ Classic Mode cho phép truy cập 100% UI cũ
- ✅ Không tạo gameTick hooks mới (UI-only)
