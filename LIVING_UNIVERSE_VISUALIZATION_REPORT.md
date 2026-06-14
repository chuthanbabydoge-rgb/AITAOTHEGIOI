# LIVING_UNIVERSE_VISUALIZATION_REPORT.md
# Creator God V6 — Living Universe Visualization Pass

**Ngày:** 2026-06-14
**Pass:** Living Universe Visualization Pass (updated)
**File sửa:** `puosMyUniverse.js`
**Triết lý:** "Một vũ trụ đang sống" — không chỉ là giao diện quản lý.

---

## 1. MỤC TIÊU ĐẠT ĐƯỢC

| Yêu cầu | Kết quả |
|---|---|
| Cosmic Core / Galaxy Visualization | ✅ Canvas 2D animated, 200×200px |
| Realtime theo dữ liệu hiện có | ✅ Đọc `window.npcs`, `window.countries`, `window.warsActive` |
| World State Visualization trực quan | ✅ 3 SVG arc meters: Sinh Linh / Văn Minh / Hòa Bình |
| Living Timeline | ✅ Horizontal milestone strip + vertical recent feed |
| Ambient Motion nhẹ | ✅ CSS star twinkle + canvas RAF + badge pulse |
| Cảm hứng No Man's Sky / Stellaris / Apple Vision Pro | ✅ |
| Không build engine / AI / XR mới | ✅ |
| Sidebar giữ nguyên | ✅ |

---

## 2. GALAXY CANVAS ANIMATION

### Thành phần

```
Canvas 200×200px, border-radius: 50%
Background: #070e19 (deep space)
Box-shadow: 0 0 50px #7c3aed1a, 0 0 100px #7c3aed0a

┌─────────────────────────────────────┐
│  ★ ·  ·   ★  ·    ·  ★   ·  (44 stars deterministic)
│     ─ ─ ─ ─ ─ (orbit ring r=46)
│        ─ ─ ─ ─ ─ ─ (orbit ring r=68)
│          ─ ─ ─ ─ ─ ─ ─ (orbit ring r=90)
│         ● ● ● (NPC particles on orbits)
│     [arc ██░░░░] [arc ██████] (civ arcs r=110)
│            ✦ (central glow pulse)
│            ● (hard white core)
└─────────────────────────────────────┘
```

### Chi tiết kỹ thuật

| Layer | Mô tả |
|---|---|
| **Star field** | 44 điểm tất định (seed=7919), tọa độ cố định, alpha twinkling |
| **Orbit rings** | 3 vòng r=46/68/90, opacity pulse độc lập từng vòng |
| **NPC particles** | `Math.min(pop, 16)` dots, 3 orbit lanes, tốc độ khác nhau, mini trail |
| **Civ arcs** | `Math.min(civs, 8)` arc segments r=110, màu riêng từng văn minh, slow rotation |
| **Central glow** | Radial gradient `#d2c3ff → #7c3aed55 → transparent`, pulse 16-21px |
| **Hard core** | White dot r=3.5px luôn visible |

### Performance
- `requestAnimationFrame` — 60fps khi active
- `cancelAnimationFrame` khi panel bị re-render → không leak
- t increment = 0.006 mỗi frame → chu kỳ ~17s
- Không có heavy computation, không WebGL

---

## 3. EVOLUTION METERS (SVG Arc)

3 vòng tròn SVG, mỗi vòng là một chỉ số thế giới:

```
        👥              🏛              ☮
    ╔═══════╗       ╔═══════╗       ╔═══════╗
    ║●●●●○○○║       ║●●○○○○○║       ║●●●●●●○║
    ╚═══════╝       ╚═══════╝       ╚═══════╝
   SINH LINH       VĂN MINH       HÒA BÌNH
```

| Meter | Màu | Scale | Công thức |
|---|---|---|---|
| Sinh Linh | `#a78bfa` (purple) | log(pop+1)/log(501) | 0→∞ NPC, log scale |
| Văn Minh | `#10b981` (green) | civs/8 | 0→8 văn minh |
| Hòa Bình | `#38bdf8` (blue) | 1 - wars/6 | nghịch đảo số chiến tranh |

**SVG technique:**
```
stroke-dasharray = 2π×36 ≈ 226.2
stroke-dashoffset = 226.2 × (1 - pct)
transform="rotate(-90 44 44)"   ← bắt đầu từ đỉnh (12h)
```

---

## 4. LIVING TIMELINE

### Horizontal Milestone Strip
```
 ●─────────────●─────────────●─────────────●────────────●NOW
Năm 1         Năm 200       Năm 500       Năm 900      Năm 1234
Khai sinh...  Chiến tranh.. Hòa bình...   Đế quốc...   Thịnh vượng
```

- 5-6 điểm milestone tự động chọn từ events array
- Điểm "NOW" (cuối) lớn hơn, glow mạnh hơn
- Baseline 1px gradient nối các điểm
- Overflow-x: auto nếu quá nhiều events

### Vertical Recent Feed (3 events gần nhất)
```
● Năm 1,234
│ Văn minh Elysion khai sinh tại phía Đông.
│
● Năm 1,100
│ Chiến tranh lớn giữa 3 thế lực kết thúc.
│
● Năm 847
  Thần linh đầu tiên xuất hiện ở Bắc Địa.
```

**Empty state:**
```
───────────── ⭕ ─────────────
Chưa có ký ức nào. Vũ trụ đang chờ câu chuyện đầu tiên.
```

---

## 5. AMBIENT MOTION

### CSS Animations
```css
@keyframes puos-twinkle {
  0%, 100% { opacity: 0.06; transform: scale(1); }
  50%       { opacity: 0.55; transform: scale(1.5); }
}
@keyframes puos-badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 #7c3aed44; }
  60%      { box-shadow: 0 0 0 7px #7c3aed00; }
}
```

| Element | Animation | Duration |
|---|---|---|
| 20 star dots | `puos-twinkle` | 2.6s–5.5s, random delay |
| Stage badge | `puos-badge-pulse` | 2.8s, infinite |
| Canvas stars | Alpha sin wave | ~8.7s cycle |
| Orbit rings | Opacity sin wave | ~15.7s cycle |
| NPC particles | Orbital movement + alpha | Continuous |
| Central glow | Radius pulse 16→21px | ~4.8s cycle |
| Civ arcs | Slow rotation t×0.09 | Continuous |

**Không gây lag:** tất cả animation chạy trên CSS compositor thread hoặc Canvas RAF với t+=0.006.

---

## 6. LAYOUT CUỐI CÙNG

```
┌──────────────────────────────────────────────────────────────┐
│                    [★ Ambient Stars ★]                        │
│  ┌──────────────┐   VŨ TRỤ CỦA TÔI                          │
│  │  ★ Galaxy  ★ │   Hư Không              ← 38px             │
│  │  · · ●  · · │   Năm 1 · 0 sinh linh   ← 12px muted       │
│  │  ●   ✦  · ● │                                             │
│  │  · ·    ● · │   "Một vũ trụ đang chờ  ← 15px italic       │
│  │    ∿∿∿∿∿∿  │    được khai sinh."                         │
│  └──────────────┘   Hãy tạo thế giới...   ← 12px muted       │
│                                                               │
│                     ✦ Hư Không · Chờ... ← badge pulse       │
├──────────────────────────────────────────────────────────────┤
│         👥              🏛              ☮                    │
│     [arc 0%]        [arc 0%]        [arc 100%]              │
│    SINH LINH        VĂN MINH        HÒA BÌNH                │
├──────────────────────────────────────────────────────────────┤
│  HÀNH ĐỘNG                                                   │
│  [✨ Tạo Thế Giới] [🤖 Hỏi Jarvis] [🌌 Universe Hub]        │
├──────────────────────────────────────────────────────────────┤
│  BIÊN NIÊN SỬ · SỐNG                                        │
│  ●──────────────────────────────────────────────●NOW        │
│  Năm 1                                         Năm ?        │
│                                                               │
│  ── Recent 3 events vertical feed ──                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. SO SÁNH TRƯỚC / SAU

| Tiêu chí | Universe Experience Pass | Living Universe Pass |
|---|---|---|
| Galaxy visualization | ❌ Không có | ✅ Canvas 200px animated |
| Evolution metrics | ❌ Text only | ✅ 3 SVG arc meters |
| Ambient motion | ❌ Tĩnh | ✅ Stars + canvas + badge pulse |
| Timeline | Thread line dọc đơn giản | Horizontal milestone + vertical feed |
| NPC data visual | Không | Orbiting particles trên canvas |
| Civ data visual | Không | Colored arcs trên canvas |
| War data visual | Không | Hòa Bình arc nghịch đảo |
| Cảm giác | "Story first" | "Living universe" |

---

## 8. DATA SOURCES ĐỌC

| Data | Source | Dùng để |
|---|---|---|
| `window.npcs.length` | NPC array | Galaxy particle count, Sinh Linh arc |
| `window.countries` | Country array | Văn Minh arc, civ arc count |
| `window.warsActive` | War array | Hòa Bình arc (nghịch đảo) |
| `window.year` | Simulation year | Subline, timeline labels |
| `window.world.name` | World object | Hero title |
| `localStorage` events | cgv6_historical_timeline | Living Timeline feed |

---

## 9. RULES ĐÃ TUÂN THỦ

- ✅ **PROJECT PROTECTION:** Chỉ sửa `puosMyUniverse.js` — không engine mới
- ✅ **Không build engine mới** — canvas/SVG là pure visualization
- ✅ **Không build AI mới** — không gọi Claude
- ✅ **Không build XR mới** — không WebGL/WebXR
- ✅ **Sidebar giữ nguyên** — không thêm tab mới
- ✅ **IIFE pattern** giữ nguyên
- ✅ **`window.puosRenderMyUniverse`** giữ nguyên API name
- ✅ **cancelAnimationFrame** trước mỗi re-render → không memory leak
- ✅ **Star positions tất định** (seed=7919) → không random mỗi render

---

*Living Universe Visualization Pass — Creator God V6 · 2026-06-14*
