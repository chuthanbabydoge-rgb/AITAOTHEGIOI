# UI_REARCHITECTURE_REPORT.md
# Creator God V6 — Nền Tảng Đa Thế Giới
**Ngày cập nhật:** 2026-06-14
**Phiên bản:** V90 (PUOS — Personal Universe Operating System)
**Ảnh chụp giao diện:** `screenshots/ui_current.jpg`

---

## 1. TỔNG QUAN HIỆN TRẠNG

### 1.1 Thông số kỹ thuật

| Hạng mục | Số lượng |
|---|---|
| Tổng dòng code `index.html` | **3.730 dòng** |
| Thẻ `<script>` trong HTML | **398 thẻ** |
| File Engine (`*Engine.js`) | **130 file** |
| File System (`*System.js`) | **50 file** |
| Tổng file JavaScript | **397 file** |
| File CSS ngoài | `v6_style_additions.css` |
| CSS nhúng trong HTML | > 1.400 dòng |
| Panel/View riêng biệt | **65+ panel** |
| File HTML | 2 (`index.html`, `worldTimelineViewer.html`) |

### 1.2 Stack hiện tại
- **Framework UI:** Không có — Vanilla HTML/CSS/JavaScript thuần
- **State management:** Global `window` object (`window.world`, `window.npcs`, v.v.)
- **Rendering:** Imperative DOM manipulation + `innerHTML` injection
- **Persistence:** `localStorage` với prefix `cgv6_*`
- **AI Backend:** Node.js `serve.js` proxy → Anthropic Claude API
- **Runtime:** Node.js 20 trên Replit Nix

---

## 2. KIẾN TRÚC UI HIỆN TẠI

### 2.1 Sơ đồ layout tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│  #particleCanvas (background layer — canvas animation)          │
├──────────────┬──────────────────────────────────────────────────┤
│              │  .top-bar (world name · year · tick stats)       │
│  .sidebar    ├──────────────────────────────────────────────────┤
│  (240px)     │                                                  │
│              │  .panels  (chỉ 1 .active hiển thị tại 1 thời điểm)│
│  sidebar-    │                                                  │
│  logo        │  #panel-world | #panel-npcs | #panel-worldmap    │
│              │  #panel-world3d | ... (65+ panels)               │
│  sidebar-    │                                                  │
│  nav         │                                                  │
│  (nav-btn×N) ├──────────────────────────────────────────────────┤
│              │  .sim-controls (speed: 1× 10× 100× 1000× MAX)   │
│  sidebar-    │  bottom-bar (Timeline · AutoFocus · Replay)      │
│  heaven      │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
│  #modalOverlay (global modal — NPC detail · World create · etc) │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Danh sách đầy đủ 65+ Panel (Classic Mode)

#### Nhóm Core / Thế Giới
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `world` | 🌐 Thế Giới Của Tôi | Luôn hiện |
| `npcs` | 👥 Tu Sĩ | Luôn hiện |
| `logs` | 📜 Nhật Ký | Luôn hiện |
| `world-history` | 📖 Lịch Sử | Mở khóa theo tiến trình |
| `world-chronicle` | 📰 Biên Niên Sử | Mở khóa theo tiến trình |
| `world-memory` | 🧠 Ký Ức Thế Giới | Mở khóa theo tiến trình |

#### Nhóm Chính Trị / Tổ Chức
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `sects` | 🏯 Tông Môn | Mở khóa theo tiến trình |
| `countries` | 🏛 Quốc Gia | Mở khóa theo tiến trình |
| `empire` | 👑 Đế Quốc | Mở khóa theo tiến trình |
| `kingdoms` | 🗺 Vương Quốc | Mở khóa theo tiến trình |
| `empires` | 🌐 Đế Chế | Mở khóa theo tiến trình |
| `dynasty` | 👑 Triều Đại | Mở khóa theo tiến trình |
| `dynasty-engine` | ⚙️ Dynasty Engine | Mở khóa theo tiến trình |
| `noble-houses` | 🏰 Danh Gia | Mở khóa theo tiến trình |
| `succession` | 👑 Kế Thừa | Mở khóa theo tiến trình |
| `political-religion` | ⛪ Tôn Giáo Chính Trị | Mở khóa theo tiến trình |
| `espionage` | 🕵️ Tình Báo | Mở khóa theo tiến trình |

#### Nhóm Chiến Tranh / Xung Đột
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `sectwars` | ⚔️ Chiến Tranh Tông Môn | Mở khóa theo tiến trình |
| `war-engine` | ⚔️ War Engine | Mở khóa theo tiến trình |
| `territory-war` | 🏴 Chiến Tranh Lãnh Thổ | Mở khóa theo tiến trình |
| `combat-hub-v31` | ⚔️ Combat Hub | Mở khóa theo tiến trình |
| `event-hub-v25` | ⚡ Event Hub | Mở khóa theo tiến trình |

#### Nhóm Kinh Tế / Thương Mại
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `economy` | 💰 Kinh Tế | Mở khóa theo tiến trình |
| `economy-engine` | 📊 Economy Engine | Mở khóa theo tiến trình |
| `ocean-hub-v27` | 🌊 Đại Dương | Mở khóa theo tiến trình |
| `naval-ocean` | 🚢 Hải Quân | Mở khóa theo tiến trình |

#### Nhóm Tu Luyện / Nhân Vật
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `player` | 👤 Người Chơi | Mở khóa theo tiến trình |
| `player-hub-v28` | 🎮 Player Hub | Mở khóa theo tiến trình |
| `cultivation-hub-v29` | 🧘 Tu Luyện | Mở khóa theo tiến trình |
| `bloodlines` | 🩸 Huyết Mạch | Mở khóa theo tiến trình |
| `spirit-beast` | 🐉 Linh Thú | Mở khóa theo tiến trình |
| `hero-legend` | ⚔️ Anh Hùng & Huyền Thoại | Mở khóa theo tiến trình |
| `npc-reputation` | 🌟 Danh Tiếng NPC | Mở khóa theo tiến trình |
| `leaderboard` | 🏆 Bảng Xếp Hạng | Mở khóa theo tiến trình |

#### Nhóm Vũ Trụ / Siêu Việt
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `multiverse-hub-v35` | 🌌 Đa Vũ Trụ | Mở khóa theo tiến trình |
| `divine-hub-v30` | ✨ Thần Thánh | Mở khóa theo tiến trình |
| `guardian-hub-v33` | 🛡️ Thủ Hộ Thần | Mở khóa theo tiến trình |
| `heavenly-dao` | ⚖️ Thiên Đạo | Mở khóa theo tiến trình |
| `mythology` | 📜 Thần Thoại | Mở khóa theo tiến trình |
| `religion` | ⛪ Tôn Giáo | Mở khóa theo tiến trình |

#### Nhóm Bản Đồ / Trực Quan
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `worldmap` | 🗺 Bản Đồ Thế Giới | Mở khóa theo tiến trình |
| `world3d` | 🌐 3D World Viewer (WebGL) | Mở khóa theo tiến trình |
| `territories` | 🏴 Lãnh Thổ | Mở khóa theo tiến trình |
| `continent` | 🌍 Đại Lục | Mở khóa theo tiến trình |
| `continent-hub-v26` | 🌎 Continent Hub | Mở khóa theo tiến trình |
| `migration` | 🚶 Di Cư | Mở khóa theo tiến trình |
| `historical-timeline` | 📅 Dòng Thời Gian | Mở khóa theo tiến trình |

#### Nhóm Sinh Thái / Khoa Học
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `technology` | 🔬 Công Nghệ | Mở khóa theo tiến trình |
| `living-civ` | 🌱 Văn Minh Sống | Mở khóa theo tiến trình |
| `culture-heritage` | 🎨 Văn Hóa & Di Sản | Mở khóa theo tiến trình |
| `age` | 🌅 Kỷ Nguyên | Mở khóa theo tiến trình |
| `world-event` | 🌌 Thiên Hạ Đại Sự | Mở khóa theo tiến trình |

#### Nhóm Đặc Biệt / Creator
| Panel ID | Tên hiển thị | Trạng thái |
|---|---|---|
| `dungeon` | 🏛 Dungeon | Mở khóa theo tiến trình |
| `boss` | 👹 World Boss | Mở khóa theo tiến trình |
| `secret-realms` | 🌀 Bí Cảnh | Mở khóa theo tiến trình |
| `creator-hub-v32` | ✨ Creator Hub (~50 sub-tabs) | Mở khóa theo tiến trình |
| `alliance-v24` | 🤝 Liên Minh | Mở khóa theo tiến trình |
| `diplomacy-hub-v24` | 🌐 Diplomacy Hub | Mở khóa theo tiến trình |
| `multiplayer` | 👥 Đa Người Chơi | Mở khóa theo tiến trình |
| `story` | 📖 Câu Chuyện | Mở khóa theo tiến trình |
| `dashboard` / `performance` | ⚙️ Hệ Thống | Luôn hiện |
| `project-status` / `next-version` | 📋 Dev Info | Luôn hiện |

---

## 3. KIẾN TRÚC UI MỚI — PUOS V90

### 3.1 Triết lý thiết kế lại

> **"Admin Dashboard" → "Personal Universe Operating System"**
> Giảm cognitive load từ 60+ sidebar items xuống còn 6 items rõ ràng,
> trong khi vẫn giữ nguyên 100% tính năng cũ qua Classic Mode escape hatch.

### 3.2 Sidebar mới — 6 items cố định

```
Trước (V89 và cũ hơn)         Sau (PUOS V90)
─────────────────────         ──────────────────────
🌍 Thế Giới       (12+)  →   🪐 My Universe     (1 dashboard)
🏰 Văn Minh       (12+)  →   🌍 Worlds          (5 tabs)
⚔️ Chiến Tranh    (6+)   →   🏛 Civilization    (5 tabs)
🤝 Ngoại Giao     (9+)   →   🌌 Universe Hub    (5 tabs)
🌌 Thiên Địa      (8+)   →   🤖 Jarvis          (AI chat)
🏯 Tu Tiên        (5+)   →   ⚙ Settings        (5 tabs)
📜 Lịch Sử        (7+)
💰 Kinh Tế        (4+)      Tổng: 6 items, 26 tabs
👤 Nhân Vật       (2+)
👁 Tạo Hóa        (2 hubs)   vs. 11 groups, 100+ buttons
⚙️ Hệ Thống       (5+)
─────────────────────
Tổng: 60+ items sidebar
```

### 3.3 Sơ đồ hợp nhất panel

#### 🪐 My Universe — Dashboard tổng quan
| Nguồn cũ | Tích hợp vào |
|---|---|
| PUOS registry V81 (overview) | My Universe stats cards |
| analyticsEngine V88 (metrics) | My Universe metrics |
| universeHealthSystem V55 | Health status card |
| disasterRecovery V87 | Health check indicator |
| historical timeline events | Recent Events feed |

#### 🌍 Worlds — 5 tabs
| Nguồn cũ | Tab mới |
|---|---|
| creator-hub-v32 > World Creation Wizard | Creation tab |
| creator-hub-v32 > AI Genesis (V75) | Genesis tab |
| creator-hub-v32 > World DNA (V62) | Creation tab |
| creator-hub-v32 > Timeline V76 | Timeline tab |
| backupEngine V87 | Snapshots tab |

#### 🏛 Civilization — 5 tabs
| Nguồn cũ | Tab mới |
|---|---|
| panel-civ-culture-v38 | Cultures tab |
| panel-civ-religion-v38 | Religions tab |
| academyEngineV79 + philosophyEngineV79 | Knowledge tab |
| world-history + world-chronicle | History tab |
| panel-civ-overview-v38 | Overview tab |

#### 🌌 Universe Hub — 5 tabs
| Nguồn cũ | Tab mới |
|---|---|
| universeHubCore V73 (Worlds) | Worlds tab |
| universeHubCore V73 (Creators) | Creators tab |
| universeGateSystemV56 (portals) | Portals tab |
| eventRegistryV59 | Events tab |
| multiverseEvolutionV80 | Multiverse tab |

#### 🤖 Jarvis — AI Chat Center
| Nguồn cũ | Tích hợp |
|---|---|
| guardian-hub-v33 (AI Advisor) | Jarvis panel |
| creator-hub-v32 > AI Advisor (V41) | Jarvis shortcuts |
| DivineOracle V77 | Claude routing |
| worldAdvisorData | Context injection |

#### ⚙ Settings — 5 tabs
| Nguồn cũ | Tab mới |
|---|---|
| dashboard panel | General tab |
| performance panel (V82) | Performance tab |
| securityLayer V86 | Security tab |
| backupEngine V87 | Backup tab |
| project-status + next-version | Advanced tab |

### 3.4 Classic Mode Escape Hatch

**Không có gì bị xóa.** Tất cả panels cũ vẫn tồn tại trong DOM:

| Cách truy cập | Mô tả |
|---|---|
| Classic Mode toggle (sidebar footer) | Khôi phục 100% UI cũ ngay lập tức |
| "Xem Đầy Đủ →" button trong mỗi PUOS panel | Mở đúng classic hub tương ứng |
| Settings > Advanced > Quick Access | Nhanh chóng vào 6 classic panels |

---

## 4. HỆ THỐNG THIẾT KẾ (Design System)

### 4.1 Theme & Màu sắc

```css
:root {
  --gold:       #c9a227;   /* Tiêu đề chính, accent chủ đạo */
  --jade:       #4a9e6b;   /* Nút hành động, trạng thái tích cực */
  --bg-main:    #0d0e12;   /* Nền tổng thể */
  --bg-card:    #13151c;   /* Background thẻ/panel */
  --bg-hover:   #1a1d27;   /* Hover state */
  --border:     #2a2d3a;   /* Đường viền */
  --white-main: #e8e9ef;   /* Text chính */
  --sidebar-w:  240px;     /* Chiều rộng sidebar */
}
```

**Theme:** Dark charcoal + Gold + Jade — phong cách Tiên Hiệp Đông Phương.

### 4.2 Typography
- **Tiêu đề:** Cinzel Decorative (Google Fonts)
- **Nội dung CJK/Tiếng Việt:** Noto Serif SC
- **Số liệu/Stats:** system monospace

### 4.3 Component Library (Vanilla CSS)

| Component | CSS Class | Mô tả |
|---|---|---|
| Card | `.card` | Bo góc 12px, border 1px, bg-card |
| Card Title | `.card-title` | Chữ vàng, font Cinzel |
| Button chính | `.btn-primary` | Gradient vàng |
| Button jade | `.btn-jade` | Gradient xanh lá |
| Input | `.dao-input` | Input tối, border gold khi focus |
| Select | `.dao-select` | Dropdown custom style |
| NPC Card | `.npc-card` | Avatar + progress bars HP/MP/EXP |
| Progress Bar | `.progress-bar` | Thanh tiến trình gradient |
| Panel Toolbar | `.panel-toolbar` | Flexbox header toolbar |
| Panel Grid | `.panel-grid` | 2-column responsive grid |
| Modal Overlay | `#modalOverlay` | Full-screen modal toàn cục |

### 4.4 Responsive Breakpoints

```css
@media (max-width: 900px) { --sidebar-w: 200px; .panel-grid → 1 column }
@media (max-width: 640px) { --sidebar-w: 56px;  sidebar icon-only mode }
```

---

## 5. KIẾN TRÚC RENDERING

### 5.1 Luồng khởi tạo

```
index.html load
  → 398 <script> tags (tuần tự, ~24 giây)
    → mỗi Engine/System đăng ký vào window.*
  → DOMContentLoaded → initApp() / app.js
      → khởi tạo world state
      → bắt đầu gameTick() interval
        → tick toàn bộ Engines
        → render active panel
  → setTimeout(24000ms) → PUOS V90 Shell init
      → overlay PUOS lên toàn bộ classic UI
```

### 5.2 Pattern render (hiện tại)

```javascript
function renderDungeonPanel() {
  const el = document.getElementById('panel-dungeon');
  el.innerHTML = `...toàn bộ HTML string...`;
}
showPanel('dungeon');
renderDungeonPanel();
```

Vấn đề: Toàn bộ panel bị xóa và viết lại mỗi lần — không có virtual DOM, không có diffing.

### 5.3 State Management

```javascript
window.world    = { name, year, population, ... }
window.npcs     = [ ...array of NPC objects ]
window.sects    = [ ...array ]
window.economy  = { gdp, trade, ... }
```

Không có encapsulation — toàn bộ state là global trên `window`.

---

## 6. FILES PUOS V90 ĐÃ TẠO

| File | Chức năng | Init delay |
|---|---|---|
| `puosShell.js` | Main shell · 6-item sidebar · routing · Classic Mode | 24000ms |
| `puosMyUniverse.js` | My Universe dashboard · stats · quick actions | 24100ms |
| `puosWorldsPanel.js` | Worlds · 5 tabs · Creation/Genesis/Timeline/Snapshots | 24200ms |
| `puosCivPanel.js` | Civilization · 5 tabs · Culture/Religion/Knowledge/History | 24300ms |
| `puosHubPanel.js` | Universe Hub · 5 tabs · Worlds/Creators/Portals/Events | 24400ms |
| `puosJarvis.js` | Jarvis AI · chat · Claude API bridge · command routing | 24500ms |
| `puosSettings.js` | Settings · 5 tabs · General/Performance/Security/Backup | 24600ms |

**Rules đã tuân thủ:**
- EXPAND ONLY — không xóa file cũ
- IIFE pattern với staggered setTimeout init
- Không sửa `app.js` hoặc bất kỳ engine nào
- Classic Mode cho phép truy cập 100% UI cũ

---

## 7. VẤN ĐỀ UI HIỆN TẠI

### Critical
1. **398 script tags** tải tuần tự → khởi động chậm (~24 giây)
2. **`innerHTML` toàn panel** mỗi tick → garbage collection nặng
3. **localStorage 5MB limit** — chưa có auto-cleanup

### High Priority
4. **Mobile UX** — sidebar + content chật trên màn hình nhỏ
5. **Tab state không persist** — reset khi navigate qua lại
6. **XSS tiềm năng** — `innerHTML` với dữ liệu AI chưa được sanitize nhất quán

### Medium Priority
7. **Jarvis chat history** — chỉ in-memory, mất khi refresh
8. **Classic Mode state** — không nhớ panel đang mở khi toggle
9. **No loading indicator** — không có spinner khi AI đang xử lý

---

## 8. UX SCORECARD

| Dimension | Trước V90 | Sau V90 (PUOS) | Mục tiêu V95+ |
|---|---|---|---|
| Navigation Clarity | 12/25 | 22/25 | 24/25 |
| First-Time Experience | 5/20 | 13/20 | 18/20 |
| Feature Discoverability | 10/20 | 16/20 | 18/20 |
| Visual Consistency | 14/20 | 17/20 | 19/20 |
| Task Completion Speed | 5/15 | 11/15 | 13/15 |
| **Tổng** | **46/100** | **79/100** | **92/100** |

| Metric | Trước | Sau |
|---|---|---|
| Sidebar items cấp cao | 60+ | 6 |
| Tabs trong hub phổ biến nhất | ~50 | 5 |
| Clicks để thấy universe health | 4–5 | 0 (hiển thị ngay) |
| Clicks để hỏi Jarvis | 3 | 1 |
| Clicks để tạo thế giới | 2 | 1 |

---

## 9. ẢNH CHỤP GIAO DIỆN

**File lưu:** `screenshots/ui_current.jpg`
**Thời điểm chụp:** 2026-06-14

**Mô tả:** Màn hình khởi đầu "Thế Giới Của Tôi" — trạng thái trước khi tạo thế giới đầu tiên.

**Các thành phần hiển thị:**
- Header: Logo "Thần Sáng Tạo / Creator God V6" + tabs điều hướng trên
- Counter: "0 thế giới" | "0 Tu Sĩ Tổng"
- Action buttons: Tạo Thế Giới Mới · Nhập · Xuất Tất Cả
- Search bar: Tìm kiếm thế giới
- Empty state: "Hư Không Chưa Có Gì — Chưa có thế giới nào"
- Bottom bar: Speed controls (1× 10× 100× 1000× MAX) · Năm 1 · Timeline · AutoFocus · Replay · Live

---

## 10. ROADMAP ĐỀ NGHỊ (V95+)

### Phase 1 — Quick Wins (1–2 tuần)
- [ ] Onboarding wizard lần đầu mở app
- [ ] Tab state persist qua `sessionStorage`
- [ ] `sanitizeHTML()` wrapper trước mọi `innerHTML`
- [ ] Loading spinner khi Jarvis/AI đang xử lý

### Phase 2 — Performance (3–4 tuần)
- [ ] Bundle 397 JS files với esbuild → 1 file (giảm từ 398 request xuống 1)
- [ ] Lazy load panels chỉ khi cần
- [ ] Virtualize danh sách NPC lớn (>500 NPC)

### Phase 3 — Architecture (6–8 tuần)
- [ ] ES Modules — bỏ global `window.*`
- [ ] TypeScript cho Engine/System core
- [ ] Unit test cho game logic (gameTick, economy, war)
- [ ] Mobile optimization pass

---

*Báo cáo được tạo từ phân tích codebase Creator God V6 — cập nhật 2026-06-14*
