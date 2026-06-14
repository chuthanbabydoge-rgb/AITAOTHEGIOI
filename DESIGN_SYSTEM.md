# DESIGN SYSTEM — Creator God V6 PUOS

> Version: V90 UI Rearchitecture Pass
> Date: 2026-06-14
> Status: Active

---

## 1. TRIẾT LÝ THIẾT KẾ

**Personal Universe Operating System** — không phải admin dashboard.

Khi người dùng mở app, họ không thấy danh sách menu dài vô tận. Họ thấy:
> "Đây là vũ trụ của tôi."

**3 Nguyên Tắc:**
1. **Minimal Navigation** — tối đa 6 mục sidebar cấp cao
2. **Data-First** — hiển thị dữ liệu thực, không placeholder
3. **Progressive Disclosure** — từ tổng quan → chi tiết → expert mode

---

## 2. COLOR SYSTEM

### Primary Palette

| Token | Hex | Mục Đích |
|---|---|---|
| `bg-deep` | `#050a14` | Background chính |
| `bg-card` | `#0d1117` | Cards, panels |
| `bg-sidebar` | `#070e19` | Sidebar background |
| `bg-hover` | `#0d1b2e` | Hover state |
| `bg-tab-bar` | `#07111e` | Tab bar background |
| `border` | `#1e293b` | Borders, dividers |
| `border-subtle` | `#0a1020` | Subtle row dividers |
| `text-primary` | `#e2e8f0` | Main text |
| `text-secondary` | `#cbd5e1` | Secondary text |
| `text-muted` | `#64748b` | Muted text |
| `text-disabled` | `#4a5568` | Disabled/label text |
| `text-ghost` | `#334155` | Ghost/invisible text |
| `text-invisible` | `#1e293b` | Near-invisible |

### Accent Colors

| Token | Hex | Mục Đích |
|---|---|---|
| `accent-purple` | `#7c3aed` | PUOS primary accent |
| `accent-purple-light` | `#a78bfa` | Active states |
| `accent-blue` | `#3b82f6` | Jarvis, info |
| `accent-violet` | `#8b5cf6` | Universe Hub |
| `accent-green` | `#10b981` | Success, Civilization |
| `accent-gold` | `#f59e0b` | Warnings, important |
| `accent-red` | `#ef4444` | Danger, wars |
| `accent-cyan` | `#06b6d4` | Portals, XR |

### Usage Rules
- Sidebar active: `accent-purple` border-left + `accent-purple/10` background
- Cards: `bg-card` + `border` border
- Accent top-border on stat cards theo section color
- Hover: background `+11` lighter (add `14` hex opacity)
- Active button: color + `22` background + `44` border

---

## 3. TYPOGRAPHY SCALE

```
Font Family: 'Noto Serif SC', serif (toàn bộ app)

Display:   26-28px / font-weight: 400 / color: text-primary
H1:        22px    / font-weight: 400 / color: text-primary  
H2:        18px    / font-weight: 400 / color: text-primary
Body:      13px    / font-weight: 400 / color: text-secondary
Small:     12px    / font-weight: 400 / color: text-muted
Caption:   11px    / font-weight: 400 / color: text-disabled
Micro:     10px    / font-weight: 400 / color: text-ghost
Label:     10px    / letter-spacing: 2-3px / UPPERCASE / color: accent
```

---

## 4. CARD SYSTEM

### Standard Card
```html
<div class="puos-card">
  <div class="puos-card-title">SECTION TITLE</div>
  <!-- content -->
</div>
```
CSS: `background:#0d1117; border:1px solid #1e293b; border-radius:12px; padding:20px`

### Stat Card (với accent top border)
```html
<div class="puos-card" style="border-top:2px solid {color}">
  <div style="font-size:24px">{icon}</div>
  <div class="puos-stat-val" style="color:{color}">{value}</div>
  <div class="puos-stat-lbl">{label}</div>
</div>
```

### Launch Card (clickable)
- Thêm `cursor:pointer` + `transition:border 0.15s`
- Hover: `border-color: {color}88`
- Border color: `{color}33` khi không hover

### Danger Card
```html
<div class="puos-card" style="border-color:#ef444433">
```

---

## 5. PANEL SYSTEM

### Hub Panel Structure
```
┌─────────────────────────────────────┐
│ Section Label (10px, accent color)  │
│ H1 Title (22px)                     │
├─────────────────────────────────────┤
│ [Tab 1] [Tab 2] [Tab 3] [Tab 4]    │  ← puos-tab-bar
├─────────────────────────────────────┤
│                                     │
│   Content Area (28px padding)       │
│                                     │
└─────────────────────────────────────┘
```

### Tab Bar
```css
.puos-tab-bar: display:flex; border-bottom:1px solid #1e293b; padding:0 24px; background:#07111e
.puos-tab: padding:12px 18px; border-bottom:2px solid transparent; transition:0.15s
.puos-tab.active: color:#a78bfa; border-bottom-color:#7c3aed
```

---

## 6. NAVIGATION SYSTEM

### PUOS Sidebar (V90+)
- **Width**: 200px
- **Max Items**: 6 (cố định, không mở rộng)
- **Logo area**: 60px height
- **Nav items**: 42px height mỗi item
- **Footer**: Classic Mode toggle

### Nav Item States
```
Default: color:#4a5568; background:transparent; border-left:2px solid transparent
Hover:   color:#94a3b8; background:#0d1b2e
Active:  color:#a78bfa; background:#7c3aed18; border-left:2px solid #7c3aed
```

### 6 Fixed Sections
```
🪐 My Universe    → Dashboard vũ trụ
🌍 Worlds         → Quản lý thế giới
🏛 Civilization   → Văn minh, tôn giáo, lịch sử
🌌 Universe Hub   → Đa vũ trụ, portals
🤖 Jarvis         → AI assistant
⚙ Settings       → Cài đặt hệ thống
```

---

## 7. ROW SYSTEM

### Status Row
```html
<div class="puos-row">
  <span class="puos-row-lbl">{icon} {label}</span>
  <span class="puos-row-val [ok]">{value}</span>
</div>
```
CSS: `display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #0a1020`

`.puos-row-val.ok` → `color:#10b981`

---

## 8. ACTION BUTTON SYSTEM

### Primary Action
```css
padding: 12px 24px
background: {color}  (solid)
border: none
border-radius: 8px
color: #fff
```

### Secondary Action
```css
padding: 10px 16px
background: {color}0f
border: 1px solid {color}44
border-radius: 8px
color: {color}
```
Hover: `background: {color}22`

### Ghost Action
```css
padding: 6px 12px
background: transparent
border: 1px solid #1e293b
border-radius: 6px
color: #4a5568
```

### Pill/Tag
```css
.puos-badge: padding:2px 8px; border-radius:99px; font-size:10px; background:#7c3aed22; color:#a78bfa
```

---

## 9. MODAL SYSTEM

Chưa triển khai trong V90. Dùng browser `confirm()`/`alert()` tạm thời.

Khi triển khai: overlay `position:fixed; z-index:9100; background:#000000aa` + modal card 480px width, centered.

---

## 10. ANIMATION SYSTEM

```css
@keyframes puos-fade {
  from { opacity:0; transform:translateY(8px) }
  to   { opacity:1; transform:translateY(0) }
}
.puos-fade { animation: puos-fade 0.2s ease }
```

Áp dụng vào mỗi panel khi chuyển tab/section.

**Rules:**
- Duration: 150-200ms (không lâu hơn)
- Easing: `ease` hoặc `ease-out`
- Chỉ dùng `opacity` + `transform` (GPU-accelerated)
- Không dùng animation cho interactive elements (buttons, inputs)

---

## 11. GRID SYSTEM

```
4 columns stat grid:  grid-template-columns: repeat(4, 1fr); gap: 14px
2 columns content:    grid-template-columns: 1fr 1fr; gap: 14px
3 columns medium:     grid-template-columns: repeat(3, 1fr); gap: 14px
Single column:        max-width: 720px (settings), 680px (forms)
```

---

## 12. SPACING SYSTEM

```
Page padding:  32px horizontal, 28px-32px vertical
Card padding:  20px
Section gap:   28px between major sections
Card gap:      14px between cards in grid
Button gap:    10px in button groups
Row padding:   8px vertical (status rows)
Tab padding:   12px vertical, 18px horizontal
```

---

## 13. PROGRESSIVE DISCLOSURE

### Level 1 — PUOS Dashboard (Default)
- 6 nav items
- Stat cards với numbers
- Quick action buttons
- Recent events list

### Level 2 — PUOS Panel (Click nav item)
- Tab bar với 4-5 tabs
- Aggregated content từ multiple engines
- "Xem Đầy Đủ →" links

### Level 3 — Classic Panel (Click "Xem Đầy Đủ")
- Full engine UI
- All tabs và sub-tabs
- Expert controls

### Level 4 — Classic Mode (Toggle)
- Full sidebar với tất cả 11 groups
- 249 panels
- Complete power-user access

---

## 14. COMPONENT CHECKLIST

Trước khi thêm UI component mới:
- [ ] Dùng màu từ Color System
- [ ] Font size từ Typography Scale
- [ ] Spacing từ Spacing System
- [ ] Không tạo nav item sidebar mới (max 6)
- [ ] Không thêm global panel mới nếu có thể nhúng vào hub
- [ ] Có `.puos-fade` animation khi render
- [ ] Mobile: tối thiểu hoạt động trên 768px width
