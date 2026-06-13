---
name: V58 Player Civilization Architecture
description: Architecture của 5-file Player Civilization V58 system — init order, separation from existing civ engines, UI pattern, save keys
---

# V58 Player Civilization Architecture

**Rule:** V58 là PLAYER-owned civilization (người chơi tự xây dựng). Không trùng với:
- `emergentCivilization.js` — world-level NPC AI civ
- `livingCivilizationAI.js` — NPC AI behavior
- `civEvolutionEngineV38.js` — AI civ tự động 6 pillars
- `cultureHeritageEngine.js` — NPC soft power
- `universeLawEngine.js` — V37 vật lý vũ trụ

## Init Order
- playerCivCoreV58: 10200ms
- civCultureLanguageV58: 10300ms
- civLawIdeologyV58: 10400ms
- civHistoryInfluenceV58: 10500ms
- civRegistryV58: 10600ms

**Why:** Chain sau V57 (10100ms), mỗi engine cách nhau 100ms để đảm bảo dependencies đã ready.

## Save Keys
- `cgv6_player_civ_core_v58`
- `cgv6_civ_culture_lang_v58`
- `cgv6_civ_law_ideology_v58`
- `cgv6_civ_history_influence_v58`
- civRegistryV58 KHÔNG có save key riêng

## UI Pattern
- civRegistryV58 dùng `const _orig = window.hubRenderPanel` (giống V52/V53/V54)
- Inject 6 button tabs vào topBar của player-hub-v28 bằng `data-v58tab` attribute
- Active tab = yellow underline + yellow text
- KHÔNG tạo panel-div mới ngoài hub
- KHÔNG tạo sidebar tab mới

## Core Data Objects
- `window.playerCivData` — core civ state (pc58GetStats())
- `window.civCultureData` — culture/lang state
- `window.civLawData` — law/ideology state
- `window.civHistoryData` — history/influence state (events[], influence{}, aiLearners[])

## Key API
- `pc58FoundCivilization(name, symbol, motto, raceId, cultureId)` → {ok, msg}
- `pc58InteractWithAI(entityName, interactType)` → {ok, msg}
- `ch58UpdateInfluence(type, amount)` — type: military/economic/cultural/religious, max 100
- `ch58AddAILearner(entityName)` → auto +5 cultural influence + records history event
- `cl58SetIdeology(id, customName?, customDesc?)` → sets ideology + bonuses
- `cl58EnactLaw(name, cat, desc, effect)` / `cl58RepealLaw(lawId)`

**How to apply:** Khi V59+ cần đọc civ data của player, dùng `window.playerCivData` + các getter functions trên. Không ghi đè các objects này trực tiếp.
