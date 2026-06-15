# TIMELINE REPLAY REPORT — V122
*Creator God V6 · V122 · Lịch Sử Thế Giới Sống*

---

## 1. TỔNG QUAN

| Chỉ Số | Giá Trị |
|---|---|
| Số snapshot tối đa | 200 (event-based, không phải mỗi năm) |
| Số sự kiện lịch sử theo dõi | `window.trV122Data.totalEvents` |
| Số nhân vật lịch sử | `window.trV122Data.figures.length` (tối đa 300) |
| Số cuộc chiến được replay | `window.trV122Data.totalWars` |
| Số khám phá được replay | `window.trV122Data.totalDiscoveries` |
| Độ bao phủ lịch sử | Hiển thị % trong Replay tab |

> **Lưu ý:** Gọi `window.trV122Data` trong console để xem toàn bộ trạng thái.

---

## 2. CÁC FILE MỚI (V122)

| File | Phase | Vai Trò |
|---|---|---|
| `timelineReplayEngineV122.js` | Phase 1 | Core Engine — Snapshot System · Replay State Machine · Jarvis Historian |
| `timelineReplayUIV122.js` | Phase 2 | UI Renderer — 5 tabs · Map Replay · Documentary Mode |
| `timelineReplayRegistryV122.js` | Phase 3 | Registry — Dynamic Inject · PUOS patch · Seed từ htData |

**Tổng: 3 file mới · 0 file bị xóa · 0 file bị ghi đè**

---

## 3. KIẾN TRÚC SNAPSHOT SYSTEM

### Snapshot Structure
```javascript
{
  id:         "snap_1234567890",
  year:       417,
  civStates:  [{ id, name, stageId, pop, territory, tech, color, capital }],
  population: 1250000,
  wars:       [{ attacker, defender, year }],
  figureSnap: [{ name, role, realm }],
  reason:     "Đế Quốc Thiên Sơn mở rộng lãnh thổ",
  reasonType: "empire_founded",
  ts:         1718462000000
}
```

### Trigger Types (17 loại)
```
kingdom_founded · kingdom_collapsed · empire_founded · empire_collapsed
wonder_built · succession_civil_war · succession_collapse · bloodline_hero
war_start · war_end · colony · ideology · continent · discovery
species_emerge · civ_found · disaster
```

### Performance Strategy
- **Event-Based**: Chỉ lưu khi có major event (KHÔNG mỗi năm)
- **Minimum Gap**: 10 in-game years giữa các snapshots
- **Periodic Backup**: Mỗi 50 năm game-time capture thêm 1 snapshot
- **Max 200 snapshots**: Sliding window — cũ nhất bị drop khi đầy
- **Max 300 figures**: Theo dõi nhân vật lịch sử quan trọng

---

## 4. REPLAY ENGINE

### State Machine
```javascript
{
  playhead:  45,    // index snapshot hiện tại
  playing:   true,  // đang tự chạy
  speed:     2,     // 1x | 2x | 5x | 10x
}
```

### API
```javascript
window.tr122Play()          // Bắt đầu replay tự động
window.tr122Pause()         // Dừng
window.tr122Goto(idx)       // Nhảy tới snapshot cụ thể
window.tr122SetSpeed(s)     // Đặt tốc độ (1/2/5/10)
window.tr122GetCurrent()    // Lấy snapshot hiện tại
window.tr122Capture(reason) // Force capture snapshot
window.tr122AddFigure(...)  // Đăng ký nhân vật lịch sử
```

---

## 5. 5 TABS UI

| Tab | Nội Dung |
|---|---|
| 📜 Timeline | Danh sách tất cả snapshots, click để jump |
| ▶ Replay | Map visualization + controls Play/Pause/Rewind/FF |
| 📋 Sự Kiện | Historical events từ htData, filter theo loại |
| ⭐ Nhân Vật | Founders/Kings/Queens/Heroes/Scholars/Prophets |
| 📖 Documentary | Jarvis Historian + Biên Niên Sử văn học |

---

## 6. MAP REPLAY

Trong tab **Replay**, bản đồ thế giới được tái tạo từ civStates mỗi snapshot:
- Mỗi văn minh = 1 vòng tròn màu (kích thước theo stage)
- Chiến tranh hiển thị badge đỏ góc phải
- Thanh scrubber để kéo qua mốc thời gian
- Năm hiện tại hiển thị góc dưới trái

---

## 7. DOCUMENTARY MODE

Ví dụ output:

```
═══════════════════════════════
📜 NĂM 112
═══════════════════════════════
Ngọc Thổ Bộ Tộc thành lập.

👥 Dân số thế giới: 42,000
🏛️ Các Nền Văn Minh:
  🔥 Ngọc Thổ Bộ Tộc — Dân: 42,000

═══════════════════════════════
📜 NĂM 417
═══════════════════════════════
Đế Quốc Thiên Sơn mở rộng lãnh thổ.

👥 Dân số thế giới: 1,250,000
👑 Đế Quốc Thiên Sơn — Thủ đô: Thiên Kinh · Dân: 680,000
⚔️ Xung Đột Đang Diễn Ra:
  ⚔️ Thiên Sơn vs Ngọc Đế
```

---

## 8. JARVIS HISTORIAN

Jarvis có thể trả lời:

| Câu Hỏi | Nguồn Dữ Liệu |
|---|---|
| Nền văn minh đầu tiên? | `snapshots[0].civStates[0]` |
| Chiến tranh lớn nhất? | Max `wars.length` across snapshots |
| Đế chế tồn tại lâu nhất? | Max `territory` in empire-stage civs |
| Thành phố cổ nhất? | First snapshot with `capital` field |
| Dân số đỉnh cao? | Max `population` across snapshots |

---

## 9. HISTORICAL FIGURES

### Tự động detect từ:
- `bloodline_hero` events → Hero (🦸)
- `ruler_death` events → Ruler (👑)
- `succession_peaceful` events → Founder (👑)
- NPCs với `realm >= 5` hoặc `isKing/isEmperor/isFounder`

### Roles Tracked
```
hero · prophet · king · emperor · founder · ruler · scholar · notable
```

---

## 10. TÍCH HỢP HỆ THỐNG CŨ

| Hệ Thống | Tích Hợp |
|---|---|
| `historicalTimeline.js` (V23) | Hook `htAddEvent` → auto-capture snapshot |
| `worldMapCivV121.js` (V121) | Đọc `cecV95Data.civs` → civStates trong snapshot |
| `civAIRegistryV120.js` (V120) | `totalWars/totalAlliances` từ `civAIV120Data` |
| `puosMyUniverse.js` (V90) | Patch `puosRenderMyUniverse` → quick-link card |
| `app.js` | `window.year`, `window.world`, `window.npcs` |
| `gameTick` | Hook periodic snapshot mỗi 50 năm |

---

## 11. XR-READY DATA SHAPE

Tất cả snapshot data được thiết kế để tương thích XR future:

```javascript
snap.civStates[i] = {
  id, name, stageId,
  pop, territory, tech,
  color,        // hex color — VR zone color
  capital       // thủ đô — AR pin label
}
```

Khi xây dựng XR Timeline Travel, chỉ cần:
1. Đọc `window.trV122Data.snapshots[idx]`
2. Render 3D world từ `civStates` array
3. Player "bước vào" snapshot đó

---

## 12. SAVE KEY

```
cgv6_timeline_replay_v122
```

Tương thích ngược: Không ảnh hưởng bất kỳ save key cũ nào.

---

## 13. INIT ORDER

| File | Delay |
|---|---|
| `timelineReplayEngineV122.js` | 29000ms |
| `timelineReplayUIV122.js` | 29100ms |
| `timelineReplayRegistryV122.js` | 29200ms |

**Next version: V123 init từ 29300ms+**

---

## 14. VALIDATION CHECKLIST

✅ Người dùng có thể xem sự ra đời của nền văn minh đầu tiên  
✅ Người dùng có thể xem chiến tranh đầu tiên  
✅ Người dùng có thể xem thay đổi lãnh thổ theo thời gian (Map Replay tab)  
✅ Người dùng có thể xem nhân vật lịch sử nổi bật (Figures tab)  
✅ Jarvis Historian trả lời 5 câu hỏi lịch sử  
✅ Documentary Mode tạo văn bản biên niên sử  
✅ Replay Controls: Play / Pause / Rewind / Fast Forward / Scrubber  
✅ Event-Based snapshots (không lưu mỗi năm)  
✅ XR-ready data shape  
✅ 0 file cũ bị xóa / ghi đè  
