# MEMORY REPORT — Creator God V6 V64
> Ngày tạo: 2026-06-13
> Phiên bản: V64 — Memory System
> Triết lý: "Thế Giới Nhớ Người Sáng Thế"

---

## 1. AI Nhớ Được Gì?

### Hệ Thống Lõi: `memoryEngineV64.js`

**Danh Mục Ký Ức (10 loại):**

| Danh Mục | Icon | Mô Tả |
|---|---|---|
| divine | ✨ | Sự kiện thần thánh — phép màu, thần ý |
| war | ⚔️ | Chiến tranh — bên tham chiến, kết quả |
| disaster | 🌋 | Thiên tai — loại, vùng, mức độ |
| hero | 🌟 | Anh hùng — hành động, danh vọng |
| civilization | 🏛️ | Văn minh — khai quốc, phát triển, sụp đổ |
| era | 🌅 | Kỷ nguyên — chuyển đổi thời đại |
| creator | 👁️ | Tạo hóa — mọi hành động của người chơi |
| plague | 💀 | Đại dịch — lây lan, tổn thất |
| economic | 💹 | Sự kiện kinh tế — khủng hoảng, thịnh vượng |
| legend | 📖 | Truyền thuyết — ký ức đã biến đổi |

**API Công Khai:**
- `mem64Record(category, title, content, importance, tags)` — ghi ký ức mới
- `mem64GetByCategory(category, limit)` — lấy theo danh mục
- `mem64GetRecent(limit)` — lấy mới nhất
- `mem64GetByImportance(minImportance)` — lấy theo độ quan trọng
- `mem64Search(keyword)` — tìm kiếm
- `mem64GetStats()` — thống kê toàn bộ

**Auto-scan mỗi 10 năm:** Chiến tranh đang diễn ra, thiên tai đang hoạt động từ `warsActive` và `disasterData`.

---

## 2. NPC Nhớ Được Gì?

### Hệ Thống: `npcMemorySystemV64.js`

Mỗi NPC có **4 loại ký ức riêng biệt:**

| Loại | Nội Dung |
|---|---|
| **Personal** | Đột phá cảnh giới, thành tựu cá nhân |
| **Family** | Kết đôi, sinh con, mất người thân |
| **Social** | Gia nhập tông môn, liên minh, kết giao |
| **Historical** | Các sự kiện thế giới mà NPC chứng kiến |

**Auto-scan mỗi 20 năm từ `window.npcs`:**
- Ghi nhận đột phá cảnh giới mới
- Ghi nhận gia nhập tông môn mới
- Ghi nhận kết đôi (spouse)

**API:**
- `npcMem64AddMemory(npcId, type, title, content, importance)` — thêm ký ức thủ công
- `npcMem64GetMemories(npcId, type)` — lấy ký ức của NPC
- `npcMem64GetNpcSummary(npcId)` — tóm tắt NPC
- `npcMem64GetTopNPCs(limit)` — NPC có nhiều ký ức nhất

---

## 3. Civilization Nhớ Được Gì?

### Hệ Thống: `civilizationMemorySystemV64.js`

Mỗi nền văn minh (`countries[]`, `kingdomData`, `empireData`) nhớ:

| Hạng Mục | Nội Dung |
|---|---|
| **Người Khai Quốc** | Tên, năm khai lập, câu chuyện |
| **Cuộc Chiến** | Kẻ thù, kết quả, năm xảy ra |
| **Anh Hùng** | Tên, hành động, năm |
| **Tín Ngưỡng** | Tôn giáo đã theo từ khi nào |
| **Khoảnh Khắc Đáng Nhớ** | Top 10 sự kiện quan trọng nhất |

**Auto-scan mỗi 30 năm từ `window.countries` và `window.kingdomData`.**

**API:**
- `civMem64RecordFounder(civId, name, founder, year)` — ghi người khai quốc
- `civMem64RecordWar(civId, enemy, outcome, year)` — ghi chiến tranh
- `civMem64RecordHero(civId, heroName, deed, year)` — ghi anh hùng
- `civMem64GetHistory(civId)` — toàn bộ lịch sử
- `civMem64GetNarrative(civId)` — tự động tạo văn bản lịch sử

---

## 4. Creator Được Ghi Nhớ Thế Nào?

### Hệ Thống: `creatorMemorySystemV64.js`

Thế giới ghi nhớ **mọi hành động** của Thần Sáng Thế:

| Loại Hành Động | Nguồn Dữ Liệu | Ví Dụ |
|---|---|---|
| **Phép Màu** | `miracleV51Data.miracles` | "Ngài đã ban Divine Rain lên Thế Giới" |
| **Sắc Lệnh** | `globalEventV51Data.activeEvents` | "Ngài phán lệnh: Golden Age" |
| **Thiên Tai** | Thủ công hoặc V48 | "Ngài gửi thiên tai Đại Hồng Thủy" |
| **Ban Phước/Nguyền Rủa** | V51 Authority | "Ngài ban phước lành cho Linh Tông" |

**Di Sản (Creator Legacy):**
Mỗi hành động tự động tạo ra một "di sản" — cách thế giới nhớ về Ngài:
- `creatorMem64GetWorldPerspective()` → trả về câu trích dẫn từ góc nhìn NPC
- Ví dụ: *"Ngài là vị thần đã ban 5 phép màu cho thế giới chúng tôi."*

**Sync tự động mỗi 25 năm** từ `miracleV51Data` và `globalEventV51Data`.

---

## 5. Ký Ức Biến Thành Truyền Thuyết Ra Sao?

### Hệ Thống: `memoryDecaySystemV64.js`

**Cơ Chế 3 Giai Đoạn:**

```
Ký Ức Gốc (decay: 0%)
       ↓ (sau 100+ năm, importance thấp)
Bóp Méo (decay: 50%)
  → Nội dung được viết lại theo template huyền thoại
  → Ví dụ: "Trận chiến X được kể lại như giao đấu giữa các vị thần"
       ↓ (tiếp tục phai nhạt)
Truyền Thuyết (decay: 80%)
  → Được đặt tên mới hoàn toàn
  → Ví dụ: "Huyết Chiến Muôn Thuở" ← từ "Chiến Tranh Quốc A vs Quốc B"
  → Tự động ghi vào `mem64Record("legend", ...)`
```

**Tốc Độ Phai Nhạt:**
- Tỷ lệ cơ bản: 0.1% / 100 năm
- Ký ức quan trọng (importance 5) phai chậm hơn 5×
- Chạy mỗi 100 năm game

**Template Bóp Méo Theo Danh Mục:**
- **War** → "Trận chiến X được kể lại như giao đấu giữa các vị thần"
- **Miracle** → "Phép màu X nay trở thành tín ngưỡng dân gian"
- **Disaster** → "Thiên tai X được coi là Thiên Phạt của các vị thần"
- **Hero** → "Anh hùng X nay được thờ phụng như một vị thần"

**Dynasty Memory:** `dynastyMemoryEngineV64.js` — Con cháu nhớ tổ tiên qua:
- Người lập tộc (Thủy Tổ)
- Tiên tổ hiển hách (deed + năm)
- Huyền thoại gia tộc tự động

---

## 6. World Memory Archive

### Hệ Thống: `worldMemoryArchiveV64.js`

Kho lưu trữ cấp độ thế giới — sự kiện không thể bị lãng quên:

| Loại | Mô Tả |
|---|---|
| **Kỷ Nguyên** | Tên era, năm bắt đầu/kết thúc, từ `ageV25Data` |
| **Thần Tích** | Mọi hành động của Creator từ V51 |
| **Đại Thảm** | Thiên tai kinh hoàng, boss bị tiêu diệt |
| **Anh Hùng Huyền Thoại** | NPC đạt realm cao nhất |
| **Mốc Thế Giới** | 100 sự kiện quan trọng nhất |

API `wma64GetJarvisChronicle()` tạo biên niên sử tổng hợp.

---

## 7. UI Integration

**Không tạo tab sidebar mới.** Tích hợp hoàn toàn trong `creator-hub-v32`:

```
👁️ Creator God Hub
  └─ [Hiện Có: V51/V57/V59/V60/V62 tabs]
  └─ 🧠 V64 — Memory System [MỚI]
       ├─ 🌍 Thế Giới      — Timeline + thống kê + Jarvis Biên Niên
       ├─ 🏛️ Văn Minh      — Lịch sử từng nền văn minh
       ├─ 👤 Sinh Linh     — NPC có nhiều ký ức nhất
       ├─ 📖 Truyền Thuyết — Ký ức đã biến đổi + Gia tộc
       └─ 👁️ Tạo Hóa      — Di sản của Creator, góc nhìn thế giới
```

---

## 8. Save Keys (5 keys mới)

| Key | File | Nội Dung |
|---|---|---|
| `cgv6_memory_core_v64` | memoryEngineV64.js | 500 ký ức toàn cầu |
| `cgv6_npc_memory_v64` | npcMemorySystemV64.js | 20 ký ức/loại/NPC |
| `cgv6_civ_memory_v64` | civilizationMemorySystemV64.js | Lịch sử mỗi văn minh |
| `cgv6_creator_memory_v64` | creatorMemorySystemV64.js | 200 can thiệp, 100 phép màu |
| `cgv6_dynasty_memory_v64` | dynastyMemoryEngineV64.js | Gia phả và truyền thuyết gia tộc |
| `cgv6_world_memory_archive_v64` | worldMemoryArchiveV64.js | 20 kỷ nguyên, 100 mốc lịch sử |
| `cgv6_memory_decay_v64` | memoryDecaySystemV64.js | Truyền thuyết và ký ức bóp méo |

**100% tương thích ngược** — không sửa bất kỳ save key nào của V1-V63.

---

## 9. Init Timing

| File | Init | gameTick Scan |
|---|---|---|
| memoryEngineV64.js | 12600ms | Mỗi 10 năm |
| npcMemorySystemV64.js | 12700ms | Mỗi 20 năm |
| civilizationMemorySystemV64.js | 12800ms | Mỗi 30 năm |
| creatorMemorySystemV64.js | 12900ms | Mỗi 25 năm |
| dynastyMemoryEngineV64.js | 13000ms | Mỗi 50 năm |
| worldMemoryArchiveV64.js | 13100ms | Mỗi 40 năm |
| memoryDecaySystemV64.js | 13200ms | Mỗi 100 năm |
| memoryRegistryV64.js | 13300ms | Passive (UI only) |

**Next version init từ 13400ms+**

---

## 10. Kiểm Tra Trả Lời Mục Tiêu

| Mục Tiêu | Đáp Ứng |
|---|---|
| AI nhớ người sáng thế | ✅ creatorMemorySystemV64 — sync V51, legacy quotes |
| AI nhớ lịch sử chiến tranh | ✅ memoryEngineV64 auto-scan warsActive |
| AI nhớ người chơi là ai | ✅ creator legacy + worldPerspective() |
| AI nhớ tổ tiên | ✅ dynastyMemoryEngineV64 — Thủy Tổ + Tiên Tổ |
| NPC có ký ức cá nhân | ✅ 4 loại: personal/family/social/historical |
| Văn minh nhớ khai quốc | ✅ civMem64RecordFounder auto + thủ công |
| Ký ức biến thành truyền thuyết | ✅ memoryDecaySystemV64 — 3 giai đoạn 0→50→80% |
| Không tạo tab sidebar mới | ✅ Tất cả trong creator-hub-v32 |
| Tương thích save cũ | ✅ 100% — chỉ thêm keys mới |

---

*MEMORY REPORT V64 — 2026-06-13*
*"Thế Giới Nhớ Người Sáng Thế"*
