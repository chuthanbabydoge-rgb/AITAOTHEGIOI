---
name: V64 Memory System Architecture
description: 8-file Memory System — AI ghi nhớ lịch sử/creator/NPC/gia tộc/văn minh · decay pipeline · 5 UI tabs trong creator-hub-v32
---

## Files (8 files, init 12600→13300ms)
- memoryEngineV64.js (12600ms) — lõi ký ức, 10 categories, auto-scan wars+disasters
- npcMemorySystemV64.js (12700ms) — 4 loại ký ức NPC (personal/family/social/historical)
- civilizationMemorySystemV64.js (12800ms) — văn minh nhớ khai quốc/chiến tranh/anh hùng
- creatorMemorySystemV64.js (12900ms) — sync V51 miracles+events, worldPerspective()
- dynastyMemoryEngineV64.js (13000ms) — Thủy Tổ, Tiên Tổ, huyền thoại gia tộc
- worldMemoryArchiveV64.js (13100ms) — kỷ nguyên/thần tích/đại thảm/anh hùng huyền thoại
- memoryDecaySystemV64.js (13200ms) — phai nhạt 0→50%→80%, bóp méo → truyền thuyết
- memoryRegistryV64.js (13300ms) — UI patch creator-hub-v32, 5 sub-tabs

## Save Keys (7 keys)
cgv6_memory_core_v64 · cgv6_npc_memory_v64 · cgv6_civ_memory_v64 · cgv6_creator_memory_v64 · cgv6_dynasty_memory_v64 · cgv6_world_memory_archive_v64 · cgv6_memory_decay_v64

## Global Objects
window.memoryV64Data · window.npcMemoryV64Data · window.civMemoryV64Data · window.creatorMemoryV64Data · window.dynastyMemoryV64Data · window.worldMemoryArchiveV64Data · window.memoryDecayV64Data

## Key Public APIs
- mem64Record(category, title, content, importance, tags)
- npcMem64AddMemory(npcId, type, title, content, importance)
- civMem64RecordFounder/War/Hero/Event(civId, ...)
- creatorMem64RecordMiracle/Disaster/Decree/Intervention(...)
- dynMem64RecordFounder/HeroicAncestor(dynastyId, ...)
- wma64RecordEra/DivineAct/Disaster/LegendaryHero(...)
- decay64GetLegends() / decay64GetDistorted()

## Memory Decay Pipeline
**Why:** Ký ức không nên tồn tại vĩnh cửu ở dạng gốc — cần cơ chế biến đổi thành huyền thoại.
**How:** decay tăng theo age/100 × decayRate × (1/importance). Ngưỡng 50%→bóp méo, 80%→truyền thuyết.

## UI Pattern
- UI section wrapper ID: `mem64-section-wrapper`
- Tab active toggle: border-bottom 2px solid #67e8f9
- Patch via: window.hubRenderPanel override (creator-hub-v32 only)
- Tab IDs: world-memory / civ-memory / npc-memory / legends / creator-legacy

## Next Version
V65 init từ 13400ms+
