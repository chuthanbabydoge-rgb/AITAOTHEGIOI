---
name: V66 God Experience Architecture
description: 8-file God Experience System — divine intervention/miracle/punishment/voice/artifact/prophecy/legacy/UI · extends V51 (KHÔNG ghi đè) · 5 tabs creator-hub-v32
---

## Files (8 files, init 13800→14500ms)
- divineInterventionEngineV66.js (13800ms) — 12 interventions, Thần Năng 1000max/+5/10y, World Edit (núi/sông/lục địa/biển/vùng cấm)
- miracleSystemV66.js (13900ms) — 7 Grand Miracles, cooldowns, extends cgv51CastMiracle via mir66CastV51()
- divinePunishmentSystemV66.js (14000ms) — 8 punishments, activeCurses, exiledNpcs, erasedFromHistory
- divineVoiceSystemV66.js (14100ms) — divVoice66Send/Declarelaw/Prophesy, 4 msg types, 16 templates
- divineArtifactSystemV66.js (14200ms) — 10 artifacts (3 Legendary/3 Epic/4 Rare), grant to NPC
- prophecyEngineV66.js (14300ms) — 5 types (war/hero/apocalypse/era/destiny), auto-fulfill tracking, extends cgv51CreateProphecy
- creatorLegacySystemV66.js (14400ms) — godScore, 7 ranks, Jarvis auto-commentary, narrative generator
- godExperienceRegistryV66.js (14500ms) — 5 tabs in creator-hub-v32, global handlers (ge66_*)

## Save Keys (7 keys)
cgv6_divine_intervention_v66 · cgv6_miracle_v66 · cgv6_divine_punishment_v66 · cgv6_divine_voice_v66 · cgv6_divine_artifact_v66 · cgv6_prophecy_v66 · cgv6_creator_legacy_v66

## Global Objects
window.divineInterventionV66Data · window.miracleV66Data · window.divinePunishmentV66Data · window.divineVoiceV66Data · window.divineArtifactV66Data · window.prophecyV66Data · window.creatorLegacyV66Data

## Key Public APIs
- div66Perform(typeId, targetName, targetType) → can thiệp thần linh
- div66Punish(typeId, targetName, targetType) → thần phạt
- mir66CastGrandMiracle(miracleId, targetName) → đại thần tích
- mir66CastV51(typeId, targetName) → wrapper V51
- divVoice66Send(target, targetType, msg, msgType) → thần ngôn
- divVoice66Declarelaw(title, text, scope) → luật thiêng
- proph66Create(typeId, subject, customText) → tiên tri
- div66CreateArtifact(templateId, customName, targetNpcName) → thần khí
- creatorLeg66Record(actType, title, target, desc, importance) → ghi legacy
- creatorLeg66GetGodRank() → {rank, title, icon}
- creatorLeg66GenerateNarrative() → biên niên sử text

## V51 Integration Pattern
KHÔNG ghi đè V51 files. Extend via:
- mir66CastV51() wraps cgv51CastMiracle()
- proph66Create() calls cgv51CreateProphecy() afterward
- mir66GetAllHistory() combines V51 + V66 history

## UI Pattern
- Section wrapper ID: ge66-section-wrapper
- Tab IDs: ge66-tab-{godmode,powers,miracles,prophecies,legacy}
- Inject via hubRenderPanel patch (creator-hub-v32 only), setTimeout 100ms
- Global actions: ge66_doIntervention, ge66_doPunishment, ge66_sendMessage, ge66_createArtifact, ge66_castGrandMiracle, ge66_createProphecy

## God Score Weights
intervention:10 · grand_miracle:50 · miracle_v51:20 · punishment:15 · divine_message:8 · divine_law:25 · prophecy:20 · artifact:30

## 7 God Rank Thresholds
<100:🌱Sơ Khai · <300:✨Thần Trẻ · <600:⭐Được Tôn Kính · <1000:👑Thần Vương · <2000:🌟Thiên Đế · <5000:🔮Nguyên Thủy · 5000+:💎Vô Thủy

## Next Version
V67 init từ 14600ms+
