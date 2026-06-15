# CIV AI V120 REPORT — Autonomous Civilization AI
*Creator God V6 · V120 · Sinh Thành Lịch Sử*

---

## 1. TỔNG QUAN

| Chỉ Số | Giá Trị |
|---|---|
| Số văn minh đang hoạt động | Phụ thuộc vào cecV95Data.civs (tự động sync) |
| Số quyết định AI thực hiện | `window.civAIV120Data.totalDecisions` |
| Số liên minh hình thành | `window.civAIV120Data.totalAlliances` |
| Số chiến tranh nổ ra | `window.civAIV120Data.totalWars` |
| Số công nghệ mới khám phá | `window.civAIV120Data.totalTechDiscoveries` |
| Số sự kiện lịch sử tạo ra | `window.civAIV120Data.history.length` |

> **Lưu ý:** Các con số trên được cập nhật real-time. Gọi `window.civAIReport()` trong console để xem báo cáo đầy đủ.

---

## 2. CÁC FILE MỚI (V120)

| File | Phase | Vai Trò |
|---|---|---|
| `civAIBrainV120.js` | Phase 1 | AI Brain — personality, resources, technology, goals, memories |
| `civDecisionEngineV120.js` | Phase 2 | Decision Engine — 7 strategies, evaluate() mỗi 25 năm |
| `civMemorySystemV120.js` | Phase 3 | Memory System — 60 ký ức/civ, decay, relation tracking |
| `civDiplomacyV120.js` | Phase 4 | Auto Diplomacy — 5 loại hành động ngoại giao tự động |
| `civTechTreeV120.js` | Phase 5 | Tech Tree — 8 branches × 5 levels, personality-driven |
| `civEmergentHistoryV120.js` | Phase 6 | Emergent History — sự kiện tự phát, htAddEvent, wmeAddMemory |
| `civAIRegistryV120.js` | Phase 7 | Registry + UI — inject PUOS My Universe, gameTick hook, report |

**Tổng: 7 file mới · 0 file bị xóa · 0 file bị ghi đè**

---

## 3. KIẾN TRÚC AI BRAIN (Phase 1)

Mỗi civilization có AI brain:

```javascript
{
  id, name,
  personality: {
    archetype:    "Nhà Ngoại Giao",  // 8 archetype
    aggression:   25,    // (0-99)
    curiosity:    65,    // (0-99)
    spirituality: 45,    // (0-99)
    diplomacy:    95,    // (0-99)
    ambition:     70,    // (0-99)
    conservatism: 35,    // (0-99)
    militarism:   20,    // (0-99)
    mercantilism: 65,    // (0-99)
  },
  resources: { food, production, gold, science, culture, faith },
  technology: { military, science, culture, agriculture, maritime, construction, magic, trade },
  goals:         [ ... ],
  memories:      [ ...60 entries max... ],
  currentStrategy: "alliance",
  relations: {
    [civId]: { relation: "ally", score: 70, history: [] }
  },
  stats: {
    decisionsThisEra, totalDecisions, technologiesDiscovered,
    alliancesFormed, warsStarted, treatiesSigned,
  }
}
```

### 8 Personality Archetypes
| Archetype | Đặc Trưng |
|---|---|
| Chiến Binh | Aggression 80, Militarism 90 |
| Học Giả | Curiosity 90, Diplomacy 70 |
| Thương Nhân | Mercantilism 95, Diplomacy 80 |
| Tín Đồ | Spirituality 95, Conservatism 80 |
| Nhà Ngoại Giao | Diplomacy 95, Mercantilism 65 |
| Nhà Khám Phá | Curiosity 95, Ambition 80 |
| Kẻ Chinh Phục | Aggression 90, Militarism 95 |
| Người Thủ Cựu | Conservatism 95, Spirituality 75 |

---

## 4. DECISION ENGINE (Phase 2)

**7 Strategies:**
| Strategy | Trigger | Effects |
|---|---|---|
| 🗺️ Mở Rộng | Ambition + Aggression cao | food +8%, production +6% |
| 🔬 Nghiên Cứu | Curiosity cao | science +15%, unlock tech |
| 💰 Giao Thương | Mercantilism + Diplomacy cao | gold +12%, culture +5% |
| 🤝 Liên Minh | Diplomacy cao, không thù địch | alliancesFormed++ |
| ⚔️ Chiến Tranh | Aggression+Militarism > 65, đủ resources | warsStarted++, production -15% |
| 🙏 Tôn Giáo | Spirituality cao | faith +20%, culture +8% |
| 🧭 Khám Phá | Curiosity cao, không bảo thủ | science +10%, gold +8% |

**Lịch trình:** Mỗi civ evaluate mỗi **25 năm** (với offset để tránh spam).
**Memory influence:** +15% weight nếu strategy đó từng thành công.
**Hook:** `wacV92AddListener` (year-change event) → evaluate all civs.

---

## 5. MEMORY SYSTEM (Phase 3)

- Max **60 ký ức** per civ (sorted by impact × weight)
- **Decay:** 0.95× mỗi thế kỷ (memories cũ mờ dần)
- **14 loại memory:** betrayal, war_attack, war_victory, war_defeat, alliance, trade, aid, treaty, sanction, discover, research, expand, religion, explore

### Ảnh hưởng đến quyết định:
- Memory `alliance + success` → +15% weight khi chọn strategy `alliance`
- Memory `betrayal` → updateRelationScore(targetId, -30) → có thể thành enemy
- Memory `war_attack` → updateRelationScore(targetId, -25)
- Memory `trade + success` → +10 relation score

### Relation scoring:
| Score | Status |
|---|---|
| ≥ 60 | ally |
| 20-59 | friendly |
| -19 to 19 | neutral |
| -20 to -59 | enemy |
| ≤ -60 | war |

---

## 6. AUTO DIPLOMACY (Phase 4)

**5 loại hành động tự động (không cần player):**

| Hành Động | Điều Kiện Kích Hoạt | Tần Suất |
|---|---|---|
| 🤝 Thành Lập Liên Minh | diplo ≥ 55, score ≥ 40 | 25% chance/50 năm |
| 📜 Ký Hiệp Ước Hòa Bình | diplo ≥ 40, đang war | 20% chance/50 năm |
| 💰 Thỏa Thuận Thương Mại | bất kỳ, score ≥ -10 | 30-40% chance |
| ⚔️ Tuyên Chiến | aggr ≥ 65, score ≤ -30 | 15% chance |
| 🚫 Áp Đặt Cấm Vận | aggr ≥ 40, score ≤ -10 | 35% chance |

**Xung đột** được ghi vào `window.warsActive` → UWS V117 + WSM V119 đọc được.

---

## 7. TECHNOLOGY RACE (Phase 5)

**8 Branches × 5 Levels:**

| Branch | Icon | Primary Stat | Max Tech |
|---|---|---|---|
| Quân Sự | ⚔️ | Aggression | Chiến Tranh Hiện Đại |
| Khoa Học | 🔬 | Curiosity | Cách Mạng Khoa Học |
| Văn Hóa | 🎨 | Spirituality | Đế Chế Mềm |
| Nông Nghiệp | 🌾 | Conservatism | Canh Tác Đô Thị |
| Hàng Hải | ⛵ | Mercantilism | Đế Quốc Biển |
| Kiến Trúc | 🏛️ | Ambition | Siêu Đô Thị |
| Thần Thuật | ✨ | Spirituality | Sức Mạnh Nguyên Thủy |
| Thương Nghiệp | 💰 | Mercantilism | Đế Chế Thương Mại |

**Personality-driven:** Civ có curiosity cao → ưu tiên branch Science/Maritime.
**Discovery events:** Mỗi tech unlock → `civAIEmitHistory()` → `htAddEvent()`.

---

## 8. EMERGENT HISTORY (Phase 6)

### Cách tạo lịch sử:
- Mọi quyết định AI → `civAIEmitHistory(yr, type, civName, text)`
- Feed vào `window.htAddEvent()` → Historical Timeline
- Feed vào `window.wmeAddMemory()` → World Memory
- Lưu trong `window.civAIV120Data.history[]` (max 1000)

### Ví dụ sự kiện tự sinh:
```
Năm 782:
"Bước ngoặt khoa học: Đế Quốc Arkan phát minh Thép Hóa Binh Khí [Quân Sự Lv.3]"

Năm 913:
"Bàn tay hòa bình bắt nhịp: Liên Minh Phương Bắc thành lập với Vương Quốc Eilia"

Năm 1205:
"Máu và lửa lan tràn khi Tộc Người Lửa tuyên chiến với Đế Quốc Arkan!"
```

### Passive events:
- 30% chance mỗi 100 năm → 1 passive history event ngẫu nhiên
- Seeded foundation events khi civ mới được tạo

---

## 9. UI PANEL (Phase 7)

**Vị trí:** PUOS My Universe panel (theo V38 rule — inject, không tạo tab mới)
**4 sub-tabs:**
- 🏛️ **Civs** — danh sách civs với personality bars, strategy, relations
- 📜 **Lịch Sử** — emergent history feed (25 sự kiện gần nhất)
- 🌐 **Ngoại Giao** — relation map giữa các cặp civs
- 🔬 **Công Nghệ** — tech matrix (civs × 8 branches)

---

## 10. INIT TIMING

| File | Init Ms |
|---|---|
| civAIBrainV120.js | 27200ms |
| civDecisionEngineV120.js | 27400ms |
| civMemorySystemV120.js | 27600ms |
| civDiplomacyV120.js | 27800ms |
| civTechTreeV120.js | 28000ms |
| civEmergentHistoryV120.js | 28200ms |
| civAIRegistryV120.js | 28400ms |

**Next version (V121+):** Init từ **28500ms+**

---

## 11. SAVE KEYS

| Key | Engine |
|---|---|
| `cgv6_civ_ai_brain_v120` | civAIBrainV120 — civs data |
| `cgv6_civ_ai_registry_v120` | civAIRegistryV120 — global stats |

**Tổng save keys trước V120:** 113 (V119 đã thêm 1)
**Tổng save keys sau V120:** 115 (+2)

---

## 12. CONSOLE API

```javascript
// Xem báo cáo đầy đủ
window.civAIReport()

// Lấy tất cả civs AI
window.civAIGetAll()

// Lấy AI của 1 civ cụ thể
window.civAIGet(civId)

// Force evaluate ngay
window.civAIEvaluateAll(window.year)

// Xem lịch sử
window.civAIGetHistory(50)

// Xem tech tree của 1 civ
window.civAIGetTechTree(civId)

// Xem attitude giữa 2 civs
window.civAIGetAttitude(civAId, civBId)

// Force sync từ V95
window.civAISyncFromV95()
```

---

## 13. TƯƠNG THÍCH

| Hệ Thống | Tương Thích |
|---|---|
| V95 CivEvolution | ✅ Đọc cecV95Data.civs, KHÔNG ghi đè |
| V119 WSM | ✅ Chiến tranh → warsActive → WSM.refresh() đọc được |
| V117 UWS | ✅ Wars count cập nhật qua warsActive |
| V92 Autonomous Clock | ✅ wacV92AddListener cho year-change |
| htAddEvent | ✅ Feed vào Historical Timeline |
| wmeAddMemory | ✅ Feed vào World Memory |
| V93 Life Engine | ✅ Không can thiệp |
| V38+ EXPAND ONLY | ✅ Chỉ tạo file mới, không xóa/ghi đè |

---

*Generated by civAIRegistryV120.js · Creator God V6 V120*
