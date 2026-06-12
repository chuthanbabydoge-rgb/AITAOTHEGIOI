# PROJECT ARCHITECTURE — Creator God V6

> Cập nhật sau mỗi version. Không xóa nội dung cũ.

---

## 📁 Folder & File Structure

```
/ (root)
├── index.html              ← Entry point — UI, CSS, all <script> tags
├── worldTimelineViewer.html ← Standalone timeline viewer
├── v6_style_additions.css  ← Additional CSS styles
│
├── app.js                  ← CORE — State, save/load, main loop, NPC/Sect/Country
├── worldTemplates.js       ← World initialization templates
├── saveManager.js          ← Save/Load management
├── multiWorldSystem.js     ← Multi-world hub UI
├── worldHub.js             ← World Hub V6
│
├── [Economy]
│   ├── economySystem.js
│   ├── economyEngine.js
│   ├── economyEngineV2.js
│   ├── economyAuditSystem.js
│   └── worldMarketplace.js
│
├── [War & Territory]
│   ├── warEngine.js
│   ├── territorySystem.js
│   └── territoryWarSystem.js
│
├── [Diplomacy V1]
│   ├── diplomaticEngine.js
│   └── espionageEngine.js
│
├── [Diplomacy V24]
│   ├── allianceEngine.js
│   ├── treatyEngine.js
│   ├── sanctionEngine.js
│   ├── worldCouncilEngine.js
│   └── diplomacyEngine.js  ← Hub/coordinator
│
├── [Empire & Kingdom V23]
│   ├── kingdomEngine.js + kingdomAI.js
│   ├── empireEngine.js + empireAI.js
│   ├── successionEngine.js
│   ├── nobleHouseEngine.js
│   ├── dynastyEngine.js + dynastySystem.js
│   ├── bloodlineEngine.js
│   ├── hereditaryBloodlineEngine.js
│   └── livingCivilizationAI.js
│
├── [World Simulation]
│   ├── living-world-engine.js
│   ├── worldEventEngine.js
│   ├── continentEngine.js
│   ├── ageEngine.js
│   ├── mythologyEngine.js
│   ├── technologyEngine.js
│   ├── politicalReligionEngine.js
│   ├── cultureHeritageEngine.js
│   ├── migrationEngine.js
│   ├── emergentCivilization.js
│   ├── historicalTimeline.js
│   ├── worldMemoryEngine.js
│   ├── worldStorySystem.js
│   ├── aiStoryEngine.js
│   ├── aiWorldGenerator.js
│   └── heavenlyDaoEngine.js
│
├── [Characters]
│   ├── npcReputationEngine.js
│   ├── npcSpatialEngine.js
│   ├── heroLegendEngine.js
│   ├── rankingsEngine.js
│   ├── progressionSystem.js
│   ├── playerSystem.js
│   └── creatorGodEngine.js
│
├── [Items]
│   ├── artifactSystem.js
│   ├── artifactEvolutionEngine.js
│   ├── legendaryArtifactEngine.js
│   └── spiritBeastSystem.js
│
├── [Misc Systems]
│   ├── catastropheSystem.js
│   ├── dungeonSystem.js
│   ├── questSystem.js + questEngine.js
│   ├── religionEngine.js
│   ├── navalOceanEngine.js
│   ├── worldMapSystem.js
│   ├── worldViewer3D.js
│   ├── cityVisualization.js
│   ├── thiendinhSystem.js
│   ├── globalSearchSystem.js
│   ├── timeControlSystem.js
│   ├── webxrSystem.js
│   ├── populationLimitSystem.js
│   ├── lodPerformanceSystem.js
│   └── autoPlayerAI.js
│
└── [Documentation]
    ├── PROJECT_STATUS.md
    ├── PROJECT_ARCHITECTURE.md
    ├── PROJECT_CHANGELOG.md
    └── AI_MEMORY.md
```

---

## 🔗 System Dependencies

```
app.js
  ├── worldTemplates.js       (init)
  ├── saveManager.js          (persistence)
  ├── living-world-engine.js  (NPC tick)
  ├── economyEngine.js        (economy tick)
  ├── warEngine.js            (war tick)
  └── [all engines via window.gameTick hook]

warEngine.js
  └── diplomaticEngine.js    (relation scores)

diplomaticEngine.js V1
  ├── app.js                 (window.countries, window.year)
  └── warEngine.js           (war declaration)

Diplomacy V24 (allianceEngine, treatyEngine, sanctionEngine, worldCouncilEngine)
  ├── diplomaticEngine.js V1  (window.drGetRelation)
  ├── warEngine.js            (window.warsActive, window.warsHistory)
  ├── kingdomEngine.js        (window.kingdomData.kingdoms)
  ├── empireEngine.js         (window.empireData.empires)
  └── app.js                  (window.countries, window.year)

diplomacyEngine.js (V24 Hub)
  ├── allianceEngine.js       (window.aeGetActiveAlliances, window.aeTick)
  ├── treatyEngine.js         (window.teTick)
  ├── sanctionEngine.js       (window.seTick)
  └── worldCouncilEngine.js   (window.wcTick)

kingdomEngine.js
  ├── app.js                  (window.countries)
  └── diplomaticEngine.js    (relation scores)
```

---

## ⚡ Event Flow

```
1. Page Load
   └── index.html loads all <script> tags sequentially

2. DOMContentLoaded
   └── Each engine calls init() with setTimeout(init, N)
       (staggered: 1600ms, 1800ms, 2000ms... to avoid race conditions)

3. World Load / Create
   └── app.js: load() or createWorld()
       └── triggers all engine init hooks
       └── v23UnlockTabs() shows V23/V24 tab buttons

4. Simulation Tick (app.js setInterval)
   └── window.gameTick() called every tick
       └── living-world-engine: NPC decisions
       └── economyTick()
       └── warTick()
       └── Hooked engines (diplomacy V24, espionage, etc.)
```

---

## 💾 Save / Load Flow

```
SAVE:
app.js save()
  └── localStorage.setItem("cgv6_world_" + worldId, JSON.stringify(world))
  └── Each engine: engineSave() → localStorage.setItem(ENGINE_KEY, ...)

LOAD:
app.js load()
  └── localStorage.getItem("cgv6_world_" + worldId)
  └── Each engine: engineLoad() on init (DOMContentLoaded + delay)
```

---

## 🖥️ UI Flow

```
Sidebar nav-btn.onclick
  └── showPanel(panelId)        — hides all panels, shows target
  └── engineRenderPanel()       — engine renders its UI into the panel div

Panel pattern:
  <div id="panel-X" class="panel">
    <!-- Engine renders here via innerHTML -->
  </div>

Auto-unlock (v23UnlockTabs):
  └── Polls for window.world.name every 3s
  └── When found: removes ec-hidden/display:none from V23+V24 tab buttons
```

---

## 🌍 World Simulation Flow

```
Per Tick:
1. year++
2. livingWorldTick() — NPC decisions (cultivate/hunt/marry/found)
3. economyTick() — resource generation/trade
4. warTick() — battle resolution, territory conquest
5. Hook: de24Tick() — alliance AI, treaty expiry, council sessions
6. Hook: espionageTick() — spy missions
7. Auto-save every N ticks
```

---

## 📋 Engine Quick Reference

| Engine | Purpose | Public Methods | Data Key | Panel |
|---|---|---|---|---|
| `allianceEngine.js` | Alliance management | `aeCreateAlliance`, `aeDissolveAlliance`, `aeAreAllied`, `aeTick` | `cgv6_alliance_v24` | panel-alliance-v24 |
| `treatyEngine.js` | Treaty management | `teSignTreaty`, `teBreakTreaty`, `teHasTreaty`, `teTick` | `cgv6_treaty_v24` | panel-treaties-v24 |
| `sanctionEngine.js` | Sanctions & dependencies | `seImposeSanction`, `seLiftSanction`, `seEstablishDependency`, `seTick` | `cgv6_sanction_v24` | panel-sanctions-v24 |
| `worldCouncilEngine.js` | World Council | `wcFoundCouncil`, `wcProposeResolution`, `wcHoldSession`, `wcTick` | `cgv6_worldcouncil_v24` | panel-world-council |
| `diplomacyEngine.js` | V24 Hub | `de24RenderPanel`, `irRenderPanel`, `de24Tick` | — | panel-diplomacy-v24, panel-intl-relations |
| `diplomaticEngine.js` | V1 Relations | `drSendAmbassador`, `drProposeTreaty`, `drDeclareWar`, `drGetRelation` | `cgv6_diplomacy` | panel-diplomacy |
| `warEngine.js` | War system | `warEngine_load`, `warTick` | `cgv6_warEngine` | panel-war-engine |
| `kingdomEngine.js` | Kingdoms | `keInit`, `keRenderPanel`, `keTick` | `cgv6_kingdoms` | panel-kingdoms |
| `empireEngine.js` | Empires | `eeInit`, `eeRenderPanel`, `eeTick` | `cgv6_empires` | panel-empires |
