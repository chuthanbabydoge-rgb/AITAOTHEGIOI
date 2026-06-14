---
name: V78 Digital Life Architecture
description: Architecture of V78 — Digital Life Pass turning NPCs into Digital Lifeforms with consciousness, personality evolution, ideology and self-reflection
---

# V78 — Digital Life Pass

## Files (6)
| File | Role | Save Key | Init |
|---|---|---|---|
| `digitalLifeEngine.js` | Core identity: 8 philosophies · 8 goals · 15 values · 6 trait pairs · influence score | `cgv6_digital_life_v78` | 19800ms |
| `personalityEvolutionEngine.js` | 10 triggers · 8 dimensions · auto-scan wars/disasters | `cgv6_personality_evo_v78` | 19900ms |
| `selfReflectionEngine.js` | 8 reflection types · thought-change templates · auto-reflect 80yr | `cgv6_self_reflection_v78` | 20000ms |
| `ideologyEngine.js` | 10 ideologies · 12 school names · 4 movement types · auto-spawn 150yr | `cgv6_ideology_v78` | 20100ms |
| `consciousnessLayer.js` | 7 inner states · 6 reasoning patterns · 10 motivation cores · state transitions | `cgv6_consciousness_v78` | 20200ms |
| `digitalLifeRegistryV78.js` | 5 tabs creator-hub-v32 · hook hubRenderPanel const _orig | — | 20300ms |

## Global Objects
- `window.digitalLifeV78Data` · `window.personalityEvoV78Data` · `window.selfReflectionV78Data` · `window.ideologyV78Data` · `window.consciousnessV78Data`
- `window.DL78_PHILOSOPHIES` · `window.DL78_GOALS` · `window.DL78_VALUES`
- `window.PE78_TRIGGERS` · `window.PE78_DIMENSIONS`
- `window.SR78_REFLECTION_TYPES`
- `window.IDEO78_TEMPLATES`
- `window.CS78_INNER_STATES` · `window.CS78_REASONING`

## Public API
- `dl78GetOrCreate(npc)` — creates profile seeded by npc.name
- `pe78ApplyTrigger(npcName, triggerId, intensity)` — modifies 8 personality dimensions
- `sr78Reflect(npcName, typeId, context)` · `sr78ChangeThought(name, eventDesc)`
- `ideo78AssignToNPC(name)` · `ideo78SpawnSchool(founder)` · `ideo78SpawnMovement(leader, type)`
- `cs78GetOrCreate(name)` · `cs78GenerateInnerVoice(name)` → full inner profile string
- `dlr78ShowTab(tab)` · `dlr78SelectNPC(name)` → consciousness tab

## UI: 5 tabs in creator-hub-v32
- 🧬 Digital Life — Top influencers · core values/philosophy/goals · click→consciousness
- 🧠 Tính Cách — 8-dim personality bars · trigger history · top evolved NPCs
- 💡 Tư Tưởng — Schools list · Movements list · ideology distribution
- 🧘 Ý Thức — Selected NPC inner voice · internal dialogue · awareness bar
- 📖 Cuộc Đời — Realtime reflection feed · thought-change log

## KHÔNG trùng với
- V65 `npcLifeEngineV65.js` — career/dream/fear/emotions (V78 extends with philosophy/ideology/consciousness)
- V64 `npcMemorySystemV64.js` — memory archive (V78 adds reflection/inner thought)
- V60 `livingCivilizationAI.js` — civ-level AI (V78 is individual NPC level)
- V66 `prophecyEngineV66.js` — divine prophecies (V78 is NPC internal)

## gameTick hooks (5 added)
- `digitalLifeEngine`: 0.3%/tick seed profiles
- `personalityEvolutionEngine`: 0.8%/tick auto-scan + trigger
- `selfReflectionEngine`: 0.6%/tick auto-reflect every 80yr
- `ideologyEngine`: 0.5%/tick auto-spawn every 150yr
- `consciousnessLayer`: 0.7%/tick auto-thought + state transitions

**Why:** V78 là spiritual/mental layer — bổ sung cho V65 (physical life) chứ không thay thế. 500-year divergence được thực hiện qua chuỗi: trigger→personality change→ideology assign→school spawn→influence accumulate.
