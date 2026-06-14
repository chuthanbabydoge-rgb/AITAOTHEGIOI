---
name: V76 Universe Evolution Architecture
description: AI Universe Evolution Pass — 5 files, 4 gameTick hooks, thế giới tự tiến hóa (country/race/religion/language/civilization). Timeline branches + Jarvis.
---

# V76 AI Universe Evolution Pass

## 5 Files
- `universeEvolutionEngine.js` — init 18800ms · save: `cgv6_universe_evolution_v76` · **gameTick hook**
- `adaptiveHistoryEngine.js` — init 18900ms · save: `cgv6_adaptive_history_v76` · **gameTick hook**
- `emergentCivilizationEngine.js` — init 19000ms · save: `cgv6_emergent_civ_v76` · **gameTick hook**
- `languageEvolutionSystem.js` — init 19100ms · save: `cgv6_language_evo_v76` · **gameTick hook**
- `timelineBranchEngineV76.js` — init 19200ms · save: `cgv6_timeline_branch_v76` · UI Registry

## CRITICAL: File Naming
`timelineBranchEngine.js` đã tồn tại (V36, save key `cgv6_timeline_branch_v36`) → phải dùng `timelineBranchEngineV76.js` với save key `cgv6_timeline_branch_v76`.

## gameTick Hooks (4 hooks mới → tổng 126)
```javascript
// Pattern chuẩn cho cả 4 engines
var _orig = window.gameTick;
window.gameTick = function() { if (_orig) _orig(); window.uevo76Tick(); };
```

## Evolution Triggers
- Minor (80 tick): culture event 40% + tech 25%
- Major (300 tick): country 35% OR race 25% OR religion 40%
- Surprise (600 tick): hero 60% + save

## Language System
- 5 ngôn ngữ gốc khởi tạo (root/spiritual/common/martial/divine)
- Mỗi tick: speakers ±10% ngẫu nhiên
- 180 tick: 50% branch → ngôn ngữ con với parentName
- 250 tick: 25% death nếu >4 ngôn ngữ sống
- Không xóa ra khỏi array — set `alive: false` + `deathYear`

## Civilization Collapse
```javascript
window.countries = window.countries.filter(c => c.name !== weakest.name);
// Chỉ collapse nếu window.countries.length > 5 (tránh xóa hết)
```

## Timeline Branch Snapshot
Lưu toàn bộ: year · countriesCount · emergentCountries/Races · aliveLangs · evoStats · civStats · histStats

## UI Hook Guard
```javascript
if (window._tbe76Hooked) return true; // Tránh hook 2 lần
```

## Không Trùng Với
- `civEvolutionEngineV38.js` — V38 UI-driven click · V76 gameTick auto
- `timelineBranchEngine.js` V36 — V36 auto-branch on collapse · V76 manual save
- `livingCivilizationAI.js` V58 — V58 AI civ management · V76 emergent generation

## Next Version
V77 init bắt đầu từ **19300ms+**

**Why:** Tách riêng 5 concerns (core/history/civ/language/timeline+UI) để mỗi file dễ maintain. UI Registry luôn là file cuối cùng để inject sau tất cả data engines.
