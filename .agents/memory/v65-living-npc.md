---
name: V65 Living NPC Architecture
description: 4-file Living NPC System — career/dream/fear/emotions/lifeEvents · 9 relationship types · multi-generation family tree · 5 UI tabs trong player-hub-v28
---

## Files (4 files, init 13400→13700ms)
- npcLifeEngineV65.js (13400ms) — profile(career, dream, fear, emotions, goals, lifeEvents), auto-scan mỗi 5 năm
- npcRelationshipSystemV65.js (13500ms) — 9 loại quan hệ, score system, loveStories, rivalries, auto-scan từ spouse+warsActive+sect
- npcFamilySystemV65.js (13600ms) — genealogy(parentA/B, children, siblings, spouseId, generation), ký ức truyền cho con cháu
- npcLivingRegistryV65.js (13700ms) — UI patch player-hub-v28, 5 sub-tabs, click-to-bio, npcLiving65_showBio()

## Save Keys (3 keys)
cgv6_npc_life_v65 · cgv6_npc_relationship_v65 · cgv6_npc_family_v65

## Global Objects
window.npcLifeV65Data · window.npcRelV65Data · window.npcFamilyV65Data

## Key Public APIs
- npcLife65GetProfile(npcId) / npcLife65GetBiography(npcId)
- npcLife65RecordLifeEvent(npcId, title, content, importance)
- npcRel65RecordRelationship(npcIdA, npcIdB, type, score, reason)
- npcFam65RegisterMember(familyId, npcId, npcName, parentA, parentB)
- npcFam65GetFamilyTree(familyId) / npcFam65GetNpcGenealogy(npcId)
- npcFam65GetFamilyNarrative(familyId)
- npcLiving65_showBio(npcId) — bio modal

## UI Pattern
- Section wrapper ID: `nlv65-section-wrapper`
- Tab IDs: nlv65-tab-npc / family / relation / social / life
- Inject via hubRenderPanel patch (player-hub-v28 only)
- Renders 80ms after hubRenderPanel call (setTimeout 80)

## Extends (KHÔNG ghi đè)
- living-world-engine.js: reads npc.age/lifespan/personality/goal/family/spouse/sect/soul
- V64: calls npcMem64AddMemory(), mem64Record(), dynMem64AddMember()

## Career Selection Logic
realm.includes("Đế/Hoàng") → noble · ambition=conqueror → warrior · ambition=scholar → scholar
goal.includes("giàu/buôn") → merchant · npc.sect → cultivator · else → seeded random from [farmer, merchant, warrior, scholar, priest, artisan]

## Next Version
V66 init từ 13800ms+
