---
name: V77 Prophecy & Fate Architecture
description: Architecture of V77 — Ancient Prophecy & Fate Web Engine injected into creator-hub-v32
---

# V77 — Ancient Prophecy & Fate Web Engine

## Files (5)
| File | Role | Save Key | Init |
|---|---|---|---|
| `ancientProphecyEngineV77.js` | 8 prophecy types · Auto-generate · Auto-fulfill · gameTick hook | `cgv6_ancient_prophecy_v77` | 19300ms |
| `fateThreadSystemV77.js` | 6 thread types · Entity fate web · Auto-scan · gameTick hook | `cgv6_fate_threads_v77` | 19400ms |
| `destinyScoreV77.js` | 6 dimensions · Player/Country/NPC scores · gameTick every 30 | `cgv6_destiny_score_v77` | 19500ms |
| `divineOracleV77.js` | 5 oracle types · Claude claude-opus-4-5 · History 15 entries | `cgv6_divine_oracle_v77` | 19600ms |
| `prophecyRegistryV77.js` | 4 tabs creator-hub-v32 · Canvas fate web · hook hubRenderPanel const _orig | — | 19700ms |

## Global Objects
- `window.ancientProphecyV77Data` · `window.fateThreadV77Data` · `window.destinyScoreV77Data` · `window.divineOracleV77Data`
- `window.AP77_PROPHECY_TYPES` · `window.FT77_THREAD_TYPES` · `window.DS77_DIMENSIONS` · `window.DS77_TIERS` · `window.DO77_ORACLE_TYPES`

## Public API
- `ap77GenerateProphecy(type?)` · `ap77FulfillProphecy(id, desc)` · `ap77GetAll/Active/Fulfilled/Urgent/Stats()`
- `ft77AddThread(eAid, eAname, eAtype, eBid, eBname, eBtype, threadType, reason)` · `ft77GetThreads/ActiveThreads/EntityFate/Web/Stats()`
- `ds77GetPlayerScore/CountryScores/NPCScores/History/All/JarvisReport()`
- `do77Consult(oracleTypeId, customQuestion)` async · `do77GetHistory/Stats()`
- `pr77ShowTab(tab)` · `pr77ConsultOracle()` async

## UI: 4 tabs in creator-hub-v32
- 📜 Tiên Tri — Prophecy cards với urgency bars · Tạo & Ứng Nghiệm buttons
- 🕸️ Vận Mệnh — Canvas 2D fate web + thread list
- ⭐ Định Mệnh — Player/Country/NPC destiny scores với 6 dimension bars
- 🔮 Thần Sấm — Oracle selector + Claude response + consultation history

## Không trùng với
- V51 `prophecySystemV51.js` — Creator-created manual prophecies
- V66 `prophecyEngineV66.js` — Divine punishment/intervention prophecies
- V76 `adaptiveHistoryEngine.js` — Auto-chronicle generation

## gameTick hooks
- `ancientProphecyEngine`: auto-check fulfillment + generate (cooldown-based)
- `fateThreadSystem`: random scan every ~0.5% tick
- `destinyScore`: recalc every 30 ticks

**Why:** V77 là layer riêng biệt — tiên tri CỔ ĐẠI (từ world DNA), sợi duyên giữa entities, và oracle AI khác với V51/V66 (creator-driven interventions).
