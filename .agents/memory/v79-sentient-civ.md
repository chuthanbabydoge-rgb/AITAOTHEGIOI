---
name: V79 Sentient Civilization Architecture
description: Architecture of V79 — Sentient Civilization Pass giving each country a soul: consciousness, cultural evolution, collective memory, academies, art, and philosophy
---

# V79 — Sentient Civilization Pass

## Files (7)
| File | Role | Save Key | Init |
|---|---|---|---|
| `civilizationConsciousnessEngine.js` | 5 goals · 8 archetypes · 10 values · cohesion · ideological tension · Jarvis | `cgv6_civ_consciousness_v79` | 20400ms |
| `culturalEvolutionEngine.js` | 10 culture traits · 5 hybrids · 5 channels · extinct/revive | `cgv6_cultural_evo_v79` | 20500ms |
| `collectiveMemoryEngine.js` | 10 memory categories · auto-scan wars/disasters/plagues · narrative summary | `cgv6_collective_memory_v79` | 20600ms |
| `academyEngine.js` | 8 academy types · 12 scholar names · discoveries · auto-spawn 200yr | `cgv6_academy_v79` | 20700ms |
| `cultureEngine.js` | 10 art styles · 8 landmark types · auto-generate 180yr | `cgv6_culture_art_v79` | 20800ms |
| `philosophyEngine.js` | 10 philosophical schools · 5 religious reforms · debates · conflicts | `cgv6_philosophy_v79` | 20900ms |
| `sentientCivRegistryV79.js` | 5 tabs creator-hub-v32 · hook hubRenderPanel const _orig | — | 21000ms |

## Global Objects
- `window.civConsciousnessV79Data` · `window.culturalEvoV79Data` · `window.collectiveMemoryV79Data`
- `window.academyV79Data` · `window.cultureArtV79Data` · `window.philosophyV79Data`
- `window.CCE79_GOALS` · `window.CCE79_ARCHETYPES`
- `window.CEVO79_TRAITS` · `window.CEVO79_CHANNELS`
- `window.CMEM79_CATEGORIES`
- `window.ACAD79_TYPES`
- `window.CULT79_STYLES` · `window.CULT79_LANDMARKS`
- `window.PHIL79_SCHOOLS` · `window.PHIL79_REFORMS`

## Public API
- `cce79GetOrCreate(country)` — seeded by country.name
- `cce79AddIdeologicalTension(civA, civB, amount)` — raises tension, marks neighborRelations
- `cce79GetJarvisAnalysis(name)` → multi-line analysis string
- `cevo79Hybridize(civA, civB)` → creates hybrid culture if traits match
- `cevo79Propagate(from, to, channelId)` → spread trait with knowledge gain
- `cmem79Record(country, catId, title, detail, importance)` → add memory entry
- `cmem79GetNarrativeSummary(name)` → formatted summary string
- `acad79FoundAcademy(country, typeId?)` → creates academy, logs htAddEvent
- `acad79SpawnScholar(country, type?)` → creates scholar
- `acad79RecordDiscovery(scholarId, title, impact)` → logs htAddEvent
- `cult79GenerateWork(country, styleId?, title?)` → creates art work
- `cult79BuildLandmark(country, typeId?)` → creates landmark, logs htAddEvent
- `phil79SpawnDebate(civA, civB)` → if conflict: adds tension + htAddEvent
- `phil79TriggerReligiousReform(country)` → logs htAddEvent

## UI: 5 tabs in creator-hub-v32
- 🏛️ Căn Tính — all civs · archetype/goal/values · cohesion/tension bars · click→Ký Ức
- 🎨 Văn Hóa — hybrid cultures · art works · landmarks · knowledge propagation
- 💭 Triết Học — assign school · debate · conflicts · religious reforms
- 🎓 Học Viện — found academy · summon scholar · discovery log
- 📜 Ký Ức — all civs sorted by memory count · selected civ narrative

## KHÔNG trùng với
- `cultureHeritageEngine.js` — V1 heritage system (V79 cevo/cult are independent layers)
- `technologyEngine.js` — tech tree (V79 academy is narrative/cultural, not tech-tree)
- `politicalReligionEngine.js` — religion system (V79 phil79 adds reform layer on top)
- `historicalTimelineEngine.js` — V79 ghi vào htAddEvent() KHÔNG ghi đè engine
- V78 digitalLife/ideology — V78 is NPC-level, V79 is civilization-level

## gameTick hooks (6 added, total ~140)
- `cce79`: 0.4%/tick — seed countries + cohesion drift
- `cevo79`: 0.6%/tick — auto-evolve every 120yr
- `cmem79`: 0.7%/tick — auto-scan every 100yr
- `acad79`: 0.4%/tick — auto-spawn every 200yr
- `cult79`: 0.5%/tick — auto-generate every 180yr
- `phil79`: 0.4%/tick — auto-debate every 250yr

**Why:** V79 is civilization-level soul. V78 was individual NPC soul. Together they form a complete spiritual stack: NPC consciousness → family/dynasty → civilization identity.
