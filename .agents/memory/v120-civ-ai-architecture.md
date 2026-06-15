---
name: V120 Autonomous Civilization AI Architecture
description: 7-module AI system cho civs tự suy nghĩ · decisions/memory/diplomacy/techTree/emergent history
---

## Files (7 modules)
| File | Init | Vai trò |
|---|---|---|
| civAIBrainV120.js | 27200ms | Brain init + 8 archetypes + personality generator (seeded RNG từ civId) |
| civDecisionEngineV120.js | 27400ms | 7 strategies + evaluate() mỗi 25 năm + wacV92AddListener hook |
| civMemorySystemV120.js | 27600ms | Max 60 memories/civ + decay 0.95x/century + relation score tracking |
| civDiplomacyV120.js | 27800ms | 5 auto-actions (alliance/treaty/trade/war/sanction) mỗi 50 năm |
| civTechTreeV120.js | 28000ms | 8 branches × 5 levels + personality-driven research priority |
| civEmergentHistoryV120.js | 28200ms | Feed htAddEvent + wmeAddMemory + passive events 30% chance/100yr |
| civAIRegistryV120.js | 28400ms | gameTick hook + PUOS My Universe inject + civAIReport() |

## Master Data
`window.civAIV120Data` — {civs:{}, totalDecisions, totalAlliances, totalWars, totalTechDiscoveries, history[]}
`window.civAIBrainData` — alias to civAIV120Data

## Key APIs
- `window.civAIReport()` — báo cáo đầy đủ
- `window.civAIGetAll()` — tất cả civs AI
- `window.civAIGet(id)` — 1 civ
- `window.civAIEvaluateAll(yr)` — force evaluate
- `window.civAIGetHistory(n)` — lịch sử n sự kiện gần nhất
- `window.civAIGetTechTree(id)` — tech tree của 1 civ
- `window.civAIFormAlliance(a, b)` — force tạo liên minh
- `window.civAIDeclareWar(a, b)` — force tuyên chiến
- `window.civAIEmitHistory(yr, type, name, text)` — thêm history event thủ công

## Design Patterns
- Personality từ seeded RNG (civ.id + civ.name) → deterministic, không thay đổi qua sessions
- Civs được sync từ cecV95Data.civs (KHÔNG ghi đè cecV95Data)
- Wars được add vào window.warsActive → WSM V119 đọc được
- UI inject vào PUOS My Universe panel qua puosRenderMyUniverse _orig hook
- Civs bắt đầu = 0 khi chưa tạo thế giới → tự động retry mỗi 3s

## Save Keys
- `cgv6_civ_ai_brain_v120` — civs data
- `cgv6_civ_ai_registry_v120` — global stats

## Next V121 init từ 28500ms+

**Why:** civs cần personality nhất quán qua sessions → seeded RNG từ civId, không random thuần.
**How to apply:** Mọi V121+ engine cần đọc civ personality → dùng `window.civAIGet(civId).personality`, KHÔNG tự generate lại.
