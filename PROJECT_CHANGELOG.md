# PROJECT CHANGELOG — Creator God V6

> Chỉ THÊM mới. Không xóa entry cũ.

---

## [V24] — 2026-06-12 — Diplomacy Engine

### New Systems Added
- Alliance Engine V24 (`allianceEngine.js`)
- Treaty Engine V24 (`treatyEngine.js`)
- Sanction Engine V24 (`sanctionEngine.js`)
- World Council Engine V24 (`worldCouncilEngine.js`)
- Diplomacy Hub V24 (`diplomacyEngine.js`)

### Files Added
- `allianceEngine.js` — 6 alliance types, AI auto-formation/dissolution
- `treatyEngine.js` — 8 treaty types, expiry, AI peace proposals
- `sanctionEngine.js` — 5 sanction types, Vassal/Protectorate/Tributary
- `worldCouncilEngine.js` — Sessions, 8 resolution types, auto-vote AI
- `diplomacyEngine.js` — Hub V24, relation matrix, intl-relations panel

### Files Modified
- `index.html` — Added 4 nav buttons, 6 panel divs, 5 script tags, updated unlock list

### UI Changes
- Added tab: 🤝 Ngoại Giao V24 (`panel-diplomacy-v24`)
- Added tab: 📜 Hiệp Ước (`panel-treaties-v24`)
- Added tab: 🏛 Hội Đồng (`panel-world-council`)
- Added tab: 🌍 Quan Hệ Quốc Tế (`panel-intl-relations`)
- Hidden panel for alliances (`panel-alliance-v24`) accessible from Ngoại Giao V24
- Hidden panel for sanctions (`panel-sanctions-v24`) accessible from Ngoại Giao V24

### Save Data Changes
- New key: `cgv6_alliance_v24`
- New key: `cgv6_treaty_v24`
- New key: `cgv6_sanction_v24`
- New key: `cgv6_worldcouncil_v24`

### Bug Fixes
- None

### Compatibility Notes
- 100% backward compatible. All V23 save data loads normally.
- `diplomaticEngine.js` V1 untouched. V24 engines extend it via `window.drGetRelation`.

---

## [V23] — Pre-2026-06-12 — Empire & Kingdom Engine

### New Systems Added
- Kingdom Engine V23
- Empire Engine V23
- Succession Engine
- Noble House Engine
- Bloodline Engine
- Hereditary Bloodline Engine
- Living Civilization AI
- Naval Ocean Engine
- Kingdom AI
- Empire AI
- Rankings Engine
- Diplomatic Engine V1
- Espionage Engine V1
- Political Religion Engine V1
- Culture Heritage Engine V1

### Files Added
- `kingdomEngine.js`, `empireEngine.js`, `successionEngine.js`
- `nobleHouseEngine.js`, `bloodlineEngine.js`, `hereditaryBloodlineEngine.js`
- `livingCivilizationAI.js`, `navalOceanEngine.js`
- `kingdomAI.js`, `empireAI.js`, `rankingsEngine.js`
- `diplomaticEngine.js`, `espionageEngine.js`
- `politicalReligionEngine.js`, `cultureHeritageEngine.js`
- `historicalTimeline.js`

### Files Modified
- `index.html` — Added V23 section tabs and unlock script

### UI Changes
- Added V23 tab group: Kingdoms, Empires, Bloodlines, Noble Houses, Succession Wars, Timeline, Rankings, Ngoại Giao, Gián Điệp, Tôn Giáo, Văn Hóa

### Compatibility Notes
- 100% backward compatible with pre-V23 saves.

---

## [V22 and Earlier] — Pre-2026

> Các phiên bản trước V23 được gộp chung. Chi tiết nằm trong source code comments.

### Systems Present from V1–V22
- Core simulation loop (app.js)
- NPC cultivation system
- Sect system
- Country system
- World Map (2D + 3D)
- Economy System (V1, V2)
- War Engine
- Territory System
- Dungeon System
- Quest System (V1, V2)
- AI Story Engine
- Artifact System (V7)
- Catastrophe System
- Age Engine
- Religion Engine
- Mythology Engine
- Technology Engine
- Hero Legend Engine
- World Memory Engine
- Spirit Beast System
- Migration Engine
- Heavenly Dao Engine
- Continent Engine
- World Event Engine
- Player System
- Creator God Engine
- Save Manager
- Multi-World System
- World Hub V6
- LOD Performance System
- Time Control System
- Thiên Đình System V2
- Auto Player AI
- Global Search System
- WebXR System
