# NPC REPORT — Creator God V6 V65
> Ngày tạo: 2026-06-13
> Phiên bản: V65 — Living NPC System
> Triết lý: "Làm Cho Dân Cư Thực Sự Sống"

---

## Tổng Quan

**V65 Living NPC System** mở rộng `living-world-engine.js` (đã có NPC lifecycle cơ bản) thêm 4 module chuyên biệt:
- Hồ sơ cuộc đời chi tiết (nghề nghiệp, cảm xúc, ước mơ, nỗi sợ, mục tiêu)
- Mạng lưới quan hệ (bạn bè, kẻ thù, tình yêu, đối thủ, sư phụ, đệ tử)
- Hệ thống gia tộc & gia phả (3+ thế hệ, cây gia phả tự động)
- UI 5 tabs trong player-hub-v28

---

## 1. NPC Life System — `npcLifeEngineV65.js`

### Dữ Liệu Mỗi NPC (profile)

| Trường | Kiểu | Mô Tả |
|---|---|---|
| `career` | string | Nghề nghiệp (1 trong 8 loại) |
| `birthYear` | number | Năm sinh (tính từ age nếu không có) |
| `dream` | string | Ước mơ cả đời (10 loại) |
| `fear` | string | Nỗi sợ (8 loại) |
| `goals[]` | array | Mục tiêu đang theo đuổi |
| `lifeEvents[]` | array | Sự kiện cuộc đời (max 20) |
| `emotions` | object | `{primary, secondary, intensity}` |
| `happiness` | number | 0-100 |
| `hope` | number | 0-100 |
| `dailyLife` | object | `{lastActivity, mood, wealth}` |

### 8 Nghề Nghiệp

| ID | Tên | Icon | Tăng trưởng từ |
|---|---|---|---|
| farmer | Nông Dân | 🌾 | endurance stat |
| merchant | Thương Nhân | 💰 | charisma stat |
| warrior | Chiến Binh | ⚔️ | power stat |
| scholar | Học Giả | 📚 | intelligence stat |
| priest | Tư Tế | ⛪ | spirit stat |
| noble | Quý Tộc | 👑 | politics stat |
| cultivator | Tu Sĩ | 🌀 | realm stat |
| artisan | Thợ Thủ Công | 🔨 | skill stat |

**Chọn nghề tự động** dựa trên: realm → ambition → goal → sect → ngẫu nhiên seeded.

### 10 Ước Mơ | 8 Nỗi Sợ

Được gán ngẫu nhiên seeded (theo tên NPC) — nhất quán giữa các session.

### Auto Lifecycle Events (scan mỗi 5 năm)
- **Tuổi Già**: khi `age/lifespan > 0.8` → ghi sự kiện, giảm hope
- **Kết Hôn**: khi `npc.spouse` xuất hiện → ghi sự kiện, tăng happiness +20
- **Qua Đời**: khi `status==="dead"` → ghi vào deathRecords, ghi vào V64 global memory

### Public API
```javascript
npcLife65GetProfile(npcId)          // Lấy hồ sơ cuộc đời
npcLife65GetBiography(npcId)        // Tiểu sử đầy đủ
npcLife65RecordLifeEvent(npcId, title, content, importance)
npcLife65SetEmotion(npcId, primary, intensity)
npcLife65AddGoal(npcId, goalTitle, description, deadline)
npcLife65GetTopProfiles(limit)       // NPC có nhiều sự kiện nhất
npcLife65GetDeaths(limit)            // NPC mới qua đời
npcLife65GetStats()                  // Thống kê toàn hệ thống
```

---

## 2. Relationship System — `npcRelationshipSystemV65.js`

### 9 Loại Quan Hệ

| Type | Icon | Màu | Mô Tả |
|---|---|---|---|
| friend | 🤝 | Xanh lá | Bạn bè |
| enemy | ⚔️ | Đỏ | Kẻ thù |
| ally | 🛡️ | Xanh dương | Đồng minh |
| lover | 💕 | Hồng | Người yêu |
| rival | 🔥 | Cam | Đối thủ |
| mentor | 📖 | Tím | Sư phụ |
| apprentice | 🌱 | Ngọc | Đệ tử |
| sibling | 👫 | Vàng | Huynh đệ |
| spouse | 💒 | Tím hồng | Vợ/Chồng |

### Auto-Scan (mỗi 15 năm)
- **Spouse**: từ `npc.spouse`
- **Mentor**: từ NPC cùng tông, lớn hơn 30 tuổi + ambition "scholar"
- **Enemy**: từ NPC nước đối địch trong `warsActive`

### Score System
- Mỗi quan hệ có `score` (-100 đến +100)
- Friend/Ally: tích lũy điểm dương
- Enemy/Rival: tích lũy điểm âm
- Update mỗi lần có sự kiện liên quan

### Public API
```javascript
npcRel65RecordRelationship(npcIdA, npcIdB, type, score, reason)
npcRel65GetRelationships(npcId, type?)
npcRel65GetScore(npcIdA, npcIdB)
npcRel65GetBestFriends(npcId, limit)
npcRel65GetEnemies(npcId, limit)
npcRel65GetSocialProfile(npcId)     // Tóm tắt mạng xã hội
npcRel65GetTopSocial(limit)          // NPC kết nối nhiều nhất
npcRel65GetLoveStories(limit)
npcRel65GetRivalries(limit)
```

---

## 3. Family System — `npcFamilySystemV65.js`

### Cấu Trúc Gia Tộc

```
Family {
  id, name, patriarch, matriarch
  members[]           ← tất cả thành viên (id)
  tree[]              ← chi tiết: {npcId, npcName, parentA, parentB, joinYear}
  founded             ← năm thành lập
  generationCount     ← số thế hệ (tự tăng)
  totalBorn           ← tổng sinh
  totalDied           ← tổng mất
}

Genealogy {
  npcId
  parentA, parentB    ← id cha/mẹ
  spouseId            ← id vợ/chồng
  children[]          ← id con cái
  siblings[]          ← id anh/chị/em
  generation          ← thế hệ (tự tính)
}
```

### Auto-Scan (mỗi 20 năm)
- Tự động đăng ký NPC có `npc.family` hoặc `npc.dynasty`
- Tự động ghi hôn nhân từ `npc.spouse`
- Tự động xử lý cái chết → truyền ký ức gia đình cho con cái

### Truyền Thừa Qua Thế Hệ
Khi NPC cha/mẹ qua đời:
1. Ghi vào `npcFam65RecordDeath()`
2. Tự động gọi `npcMem64AddMemory()` cho **tất cả con cái** — con cái sẽ có ký ức về cha/mẹ đã mất

### Public API
```javascript
npcFam65RegisterMember(familyId, npcId, npcName, parentAId, parentBId)
npcFam65RecordMarriage(npcIdA, npcIdB, familyId)
npcFam65RecordDeath(npcId, familyId)
npcFam65GetFamilyTree(familyId)     // Cây gia phả đầy đủ
npcFam65GetNpcGenealogy(npcId)      // Gia phả của 1 NPC
npcFam65GetAllFamilies()
npcFam65GetStats()
npcFam65GetFamilyNarrative(familyId) // Tự động tạo văn bản biên niên gia tộc
```

---

## 4. UI — `npcLivingRegistryV65.js`

Không tạo tab sidebar mới. Tích hợp vào `player-hub-v28`:

```
👤 Nhân Vật V28 Hub
  └─ 🧬 V65 — Living NPC [MỚI]
       ├─ 👤 NPC          — Hồ sơ + nghề nghiệp + cảm xúc + deaths
       ├─ 👨‍👩‍👧‍👦 Gia Tộc   — Cây gia phả + biên niên gia tộc
       ├─ 💕 Quan Hệ     — Tình yêu + thù địch + mạng xã hội
       ├─ 🌐 Xã Hội      — Phân bổ địa lý + nghề nghiệp + cảm xúc thế giới
       └─ 📅 Cuộc Đời    — Dropdown chọn NPC → timeline đầy đủ + genealogy
```

### Click-to-Bio
Từ tab NPC, click vào bất kỳ NPC nào sẽ hiện **bio modal** gồm:
- Thông tin cơ bản + nghề nghiệp + cảm xúc
- Ước mơ + Nỗi sợ
- Gia phả (cha mẹ, vợ/chồng, con, anh/em)
- Mạng quan hệ (badges màu sắc)
- Timeline cuộc đời (các sự kiện quan trọng)
- Mục tiêu hiện tại

---

## 5. Tích Hợp Với V64 Memory System

V65 tự động gọi V64 APIs:
- `npcMem64AddMemory(npcId, type, ...)` — mọi sự kiện cuộc đời được lưu vào V64 NPC Memory
- `mem64Record("hero", ...)` — cái chết được ghi vào V64 global memory
- `dynMem64AddMember(familyId, ...)` — thành viên gia tộc sync với V64 dynasty memory
- `npcMem64AddMemory(childId, "family", ...)` — ký ức cha/mẹ truyền cho con cái

---

## 6. Mục Tiêu "NPC Sinh Ra Năm 1 → Con Cháu Năm 500"

Luồng đầy đủ:
```
Năm 1: NPC "Lý Vạn Phong" sinh ra
  → npcFam65RegisterMember("Lý", "lyvp", "Lý Vạn Phong", null, null)
  → npcLife65GetProfile("lyvp") → career:"cultivator", dream:"Đạt cảnh giới tối cao"

Năm 50: Kết hôn
  → npcFam65RecordMarriage("lyvp", "tranth", "Lý")
  → npcRel65RecordRelationship("lyvp", "tranth", "spouse", 90)

Năm 80: Con cái sinh ra
  → npcFam65RegisterMember("Lý", "lyconA", "Lý Tiểu Phong", "lyvp", "tranth")
  → generation = 2, lyconA.parentA = "lyvp"

Năm 150: Lý Vạn Phong qua đời
  → npcFam65RecordDeath("lyvp", "Lý")
  → Tự động ghi vào ký ức của Lý Tiểu Phong:
     "Cha ta — Lý Vạn Phong — đã rời khỏi thế giới. Ký ức về Người sẽ mãi trong tim."

Năm 500: Cháu đời 5 (thế hệ 5)
  → npcFam65GetFamilyTree("Lý") → maxGeneration: 5
  → npcFam65GetFamilyNarrative("Lý") → văn bản đầy đủ lịch sử 500 năm gia tộc
  → Người chơi xem được toàn bộ gia phả từ Thủy Tổ → con cháu
```

---

## 7. Save Keys (3 keys mới)

| Key | File | Nội Dung |
|---|---|---|
| `cgv6_npc_life_v65` | npcLifeEngineV65.js | Hồ sơ cuộc đời (20 events/NPC) |
| `cgv6_npc_relationship_v65` | npcRelationshipSystemV65.js | 15 quan hệ/NPC |
| `cgv6_npc_family_v65` | npcFamilySystemV65.js | Gia phả (50 thành viên/gia tộc) |

**100% tương thích ngược** — không sửa bất kỳ save key nào của V1-V64.

---

## 8. Init Timing

| File | Init | gameTick Scan |
|---|---|---|
| npcLifeEngineV65.js | 13400ms | Mỗi 5 năm |
| npcRelationshipSystemV65.js | 13500ms | Mỗi 15 năm |
| npcFamilySystemV65.js | 13600ms | Mỗi 20 năm |
| npcLivingRegistryV65.js | 13700ms | Passive (UI only) |

**Next version init từ 13800ms+**

---

## 9. Kiểm Tra Yêu Cầu

| Yêu Cầu | Đáp Ứng |
|---|---|
| NPC sinh ra | ✅ npcLife65GetProfile() init profile khi NPC được tạo |
| NPC trưởng thành | ✅ lifeEvents ghi nhận đột phá realm |
| NPC kết hôn | ✅ auto-scan spouse, npcRel65RecordRelationship("spouse") |
| NPC sinh con | ✅ npcFam65RegisterMember(parentA, parentB) |
| NPC già đi | ✅ tuổi già event khi age/lifespan > 0.8 |
| NPC chết | ✅ deathRecords + ký ức truyền con |
| Tính cách | ✅ dream/fear/emotions/personality từ living-world-engine |
| Sở thích | ✅ career + dailyLife.lastActivity |
| Nỗi sợ | ✅ fear field (8 loại, seeded) |
| Ước mơ | ✅ dream field (10 loại, seeded) |
| Tham vọng | ✅ goals[] + soul.ambition từ living-world-engine |
| Cha mẹ | ✅ genealogy.parentA/parentB |
| Con cái | ✅ genealogy.children[] |
| Anh chị em | ✅ genealogy.siblings[] |
| Gia tộc | ✅ npcFamilySystemV65 — families{} |
| Bạn bè | ✅ rel type="friend" |
| Kẻ thù | ✅ rel type="enemy" (auto từ warsActive) |
| Đồng minh | ✅ rel type="ally" |
| Người yêu | ✅ rel type="lover/spouse" |
| Nghề nghiệp 6 loại | ✅ 8 nghề (vượt yêu cầu) |
| Mục tiêu | ✅ npcLife65AddGoal() |
| Cảm xúc | ✅ emotions {primary, secondary, intensity} + happiness/hope |
| Không tạo tab sidebar mới | ✅ 5 tabs trong player-hub-v28 |
| Gia phả đến năm 500 | ✅ generationCount tự động tăng, con cháu nhớ tổ tiên |

---

*NPC REPORT V65 — 2026-06-13*
*"Làm Cho Dân Cư Thực Sự Sống"*
