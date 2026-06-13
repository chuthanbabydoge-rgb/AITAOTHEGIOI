---
name: V62 World Creation Pass
description: worldDNAEngine + originStoryEngine + worldCreationWizard — 5-step wizard trong creator-hub-v32, init 12200→12400ms
---

# V62 World Creation Pass Architecture

## Files (3)
- `worldDNAEngine.js` — init 12200ms · SAVE: cgv6_world_dna_v62
- `originStoryEngine.js` — init 12300ms · SAVE: cgv6_origin_story_v62
- `worldCreationWizard.js` — init 12400ms · SAVE: cgv6_world_wizard_v62

## Hub Integration Pattern
- Wrapper div ID: `wcw62-section-wrapper`
- Appended vào `panel-creator-hub-v32` (không tạo sidebar tab mới)
- Patches `window.hubRenderPanel` (same pattern as V60 lur60)
- setTimeout 100ms (V60 dùng 80ms)

## World Creation Pipeline (wcw62Create)
1. 200ms: Set DOM values (#worldName, #genre, #worldTemplateKey, #territoryCount)
2. 600ms: `createWorld()` — khai sinh thế giới
3. 1000ms: `generateNPCs(false)` × sc.npc + `generateNPCs(true)` × genius (set npcCount=1 trước each genius call)
4. 1400ms: `wdna62GenerateDNA(config)` — sinh DNA + CreatorTitle
5. 1800ms: `ose62GenerateOriginStory(config)` — sinh thần thoại (writes after 500ms delay)
6. 2100ms: `_applyChaosModifiers(chaos)` — stability tweaks
7. 2600ms: Save + switch to Preview tab

## DNA Format
`CGV6-[GC]-[SC][CC]-R[RC]N[NC]-[8HEX]`
- GC: CU/FA/SF/MY/AP/CB/XX
- SC: T/S/M/L/V
- CC: P/B/C/E
- Seeded RNG: `window.wdna62Rng(seed)` — mulberry32

## Scale → Territory + NPC
- Tiny: 5tc / 10npc · Small: 10/15 · Medium: 20/20 · Large: 40/35 · Massive: 80/60

## Next Version Init
V63+ phải init từ **12500ms+**

**Why:** init timing collision causes races conditions (engine không hoàn thành trước khi engine sau gọi API của nó).

**How to apply:** Mỗi V mới tăng init thêm ≥100ms per file.
