---
name: V71 Avatar of God Architecture
description: 5 files · Creator bước vào thế giới với hình thể vật lý · NPC phản ứng · Tôn giáo tiến hóa · Truyền thuyết 1000 năm
---

## Rule
V71 là pure interactive layer — KHÔNG hook gameTick. Mọi update state qua user click, không auto-update.

**Why:** Tránh performance overhead. Avatar chỉ "hiện diện" khi user chủ động kích hoạt.

**How to apply:** Nếu cần auto-effect theo năm, dùng mem64Record sau khi user trigger, không dùng gameTick.

---

## 5 Files & Init Timing (16900–17300ms)

| File | Init | Save Key |
|---|---|---|
| avatarOfGodEngine.js | 16900ms | cgv6_avatar_god_v71 |
| divinePresenceSystem.js | 17000ms | cgv6_divine_presence_v71 |
| creatorManifestationSystem.js | 17100ms | cgv6_manifestation_v71 |
| divineAppearanceSystem.js | 17200ms | cgv6_divine_appearance_v71 |
| avatarOfGodRegistry.js | 17300ms | — |

Next version V72 init từ 17400ms+.

---

## Key APIs

```javascript
// Avatar Core
window.avg71SelectForm(formId)        // "human"|"angel"|"dragon"|"light"|"hologram"|"custom"
window.avg71SpendEnergy(amount)       // boolean — false if insufficient
window.avg71RegenEnergy()             // +5 + bonus/followers per cycle
window.avg71SetGodName(name, title)
window.avg71GetDisplayName()          // "icon Name"
window.avg71GetJarvisComment()        // Context-aware comment

// Divine Presence
window.dps71EnterPresence(location, avatarForm)  // Triggers NPC reactions
window.dps71TriggerReligionEvolution(evolType, loc) // Creates cult
window.dps71ExitPresence()
window.dps71GetSummary()              // {totalFollowers, totalCults, religiousImpact, ...}

// Manifestation (consumes energy!)
window.mfst71Perform(typeId, {location, text})  // Returns {success, result, entry}
window.mfst71GetTypes()               // Array of 8 types with cost

// Divine Appearance
window.das71TriggerAppearance(eventId, opts)  // Returns {success, narrative, entry}
window.das71AssignRole(npcId, role)   // "disciple"|"prophet"|"priest"|"guardian"|"historian"
window.das71GetLegendLog()            // Auto-created legends
window.das71GetAllFollowers()         // {disciples, prophets, ..., total}
```

---

## NPC Reaction Logic (dps71EnterPresence)

Career-based:
- priest → 50% worship, 30% venerate, 20% skeptic
- scholar → 60% skeptic, 20% venerate, 20% fear
- warrior → 30% rebel, 30% fear, 40% venerate
- power>70 → 40% rebel, 60% venerate
- power<30 → 60% fear, 40% worship

Seeded random by NPC name charCode sum % 100.

---

## Religion Cult Auto-Generation

`dps71TriggerReligionEvolution(evolType)` auto-generates:
- Cult name from prefix pool per evolType
- Doctrine string per evolType
- followers: random 5–24
- Writes to mem64Record + htAddEvent

5 evolTypes: worship_god · creator_supreme · destroyer · new_doctrine · prophet_born

---

## Manifestation Cost Table

🌟 Giáng Thế=100 · 🛡️ Cứu Thế=150 · 🔮 Tiên Tri=80 · ✨ Phúc Lành=120  
💥 Hủy Diệt=200 · ⚔️ Triệu Anh Hùng=180 · 📣 Thần Ngôn=60 · 🌈 Phép Màu=130

---

## UI — 5 Tabs trong creator-hub-v32

Section ID: `avg71-section-wrapper`  
Tabs: `avatar71` · `presence71` · `manifest71` · `followers71` · `legacy71`

Registry patches `window.hubRenderPanel` với const `_origHub` pattern.  
JS callbacks prefix: `window._avg71*`

---

## Tích Hợp Data

**Ghi vào (write):**
- `mem64Record("divine", title, content, 8-10, tags)` — V64 memory
- `window.htAddEvent({year, type:"divine", title, color:"#c084fc"})` — timeline
- `window.disasterData.activeDisasters` — shift()[0] khi Cứu Thế
- `window.plagueData.activePlagues[0].active = false` khi Chữa Bệnh
- `window.countries[x].stability += 15` khi Trừng Phạt Bạo Chúa

**Đọc (read-only):**
- `window.npcs` — for reactions (career, power, faith, status)
- `window.countries` — for location dropdown
- `window.warsActive` — active wars for Chiến Trường event
- `window.avatarGodV71Data.divineEnergy` — energy gate

---

## Extends V66 (KHÔNG ghi đè)

- Gọi `window.proph66Create()` nếu có (prophecy manifestation)
- Gọi `window.divVoice66Send()` nếu có (thần ngôn manifestation)
- Gọi `window.div66CreateArtifact()` nếu có (triệu anh hùng)
- KHÔNG ghi đè `window.creatorLegacyV66Data`
