# TOP 20 WORKING FEATURES — Creator God V6 (V124)
**Based on:** execution path tracing, browser console confirmation, gameTick hook verification  
**Definition of "working":** Feature runs every tick OR responds to player input AND produces visible, real output that affects game state.

---

## #1 — NPC Life Simulation (Core Loop)
**What works:** Every game tick, NPCs age, cultivate, fight, marry, have children, and die of old age. Cultivation realm advancement (Luyện Khí → Hóa Thần → Chân Tiên) is real and tracked. NPC wealth accumulates. Skills are learned randomly.

**Evidence:** `simulateWorld()` in app.js runs NPC loop directly — no optional call, no fallback. Browser console confirms `[LWE v1.0.0] Boot hoàn tất. Thế giới đang sống`.

**Player sees:** NPC list with real-time realm, HP, age, wealth. Combat logs appear every tick. Birth/death notifications in log panel.

---

## #2 — NPC Combat System
**What works:** Every tick, 1–4 combat rounds occur (scaled by NPC count). Inter-sect and inter-region NPCs are prioritized as enemies. Combat resolves with real damage, death, and XP transfer.

**Evidence:** Direct call in `simulateWorld()`: `combat(attacker, defender)` — not gated.

**Player sees:** Combat results in the event log, realm changes, death notifications.

---

## #3 — Sect System (Sect Engine V29)
**What works:** Sects have real resources, techniques, and territory. Sect wars trigger (20% chance/tick), resolve with NPC casualties and territory transfers. NPCs gain cultivation bonuses from their sect.

**Evidence:** `seV29Tick()` and `swV29Tick()` both confirmed active with save keys `cgv6_sects_v29` and `cgv6_sect_war_v29`.

**Player sees:** Sect panel with resource counts, technique lists, disciple roster. Sect war panel with active wars and history.

---

## #4 — Country War Engine
**What works:** Countries declare war on each other. Battles are simulated with army attrition, territory conquest, and country collapse. War history is tracked. Territory transfers to victors.

**Evidence:** `warEngine_tick()` called directly in `simulateWorld()`. `window.warsActive` and `window.warsHistory` populated. `warEngine.js` confirmed to write `window.countries`.

**Player sees:** War panel showing active wars, armies, battle outcomes. Country stats change after wars.

---

## #5 — Kingdom & Empire Formation
**What works:** Countries grow from villages to kingdoms to empires. Rulers are tracked with succession. Kingdoms and empires have stability ratings. Rebellions occur when stability drops.

**Evidence:** `window.kingdomData` and `window.empireData` populated, kingdom/empire engines both gameTick-hooked, saved to `cgv6_kingdoms_v23` / `cgv6_empires_v23`.

**Player sees:** Kingdoms panel listing all kingdoms with rulers, stages, stability. Empire panel with empire size and power.

---

## #6 — Technology Engine
**What works:** Countries research technology. Tech levels advance over time. Tech affects economy and military. Technologyengine_tick fires every tick.

**Evidence:** `technologyEngine_tick()` called directly in `simulateWorld()`. Function confirmed in `technologyEngine.js:949`. Tech tree panel renders.

**Player sees:** Technology panel showing tech levels per country. Civilization tech score in PUOS Civilization panel.

---

## #7 — Religion & Mythology Systems
**What works:** Religions spread between countries and NPCs. Holy wars triggered by faith conflicts. Mythology accumulates as NPCs become legends. Myths recorded when NPCs perform extraordinary feats.

**Evidence:** `religionEngine_tick()` and `mythologyEngine_tick()` both called directly in `simulateWorld()`.

**Player sees:** Religion panel with faith distribution. Mythology panel with growing myth database and legend formation.

---

## #8 — God Mode — Direct NPC Intervention
**What works:** Player can cast Heavenly Tribulation (20% realm up / 25% enlightenment / 25% injury / 30% death), Divine Blessing (talent/luck/cultivation boosts), Divine Revelation (command NPC to found sect/country/start war). All directly modify NPC state.

**Evidence:** Buttons in Creator God Control panel call functions that directly write `npc.realm`, `npc.hp`, `npc.karma`, etc. `window.heavenPoints` consumed on use.

**Player sees:** NPC stats change immediately. Timeline entry logged. Toast notification. Real effect visible in NPC list.

---

## #9 — Miracle System (Divine Intervention)
**What works:** 6 V51 miracles + 4 V66 grand miracles, all functional: Cure Plague (clears `window.plagueData`), Resource Rain (+50% resources), Apocalypse Ward (cancels end-world events), Golden Age (ends all wars), Divine Shield (80% war damage reduction), Mass Enlightenment (+500% tech).

**Evidence:** Miracle functions directly write to world state. `window.heavenPoints` (Thần Năng) is the real cost resource.

**Player sees:** Immediate world state changes, dramatic log entries, visual confirmation in panels.

---

## #10 — Disaster & Plague System
**What works:** 5 disaster types (earthquake, flood, volcano, storm, drought) at 4 severity levels. 3 plague types with region-to-region spread. All reduce country population and economy.

**Evidence:** `disasterEngine.js` and `plagueEngine.js` both gameTick-hooked. `window.disasterData` and `window.plagueData` populated. Save keys confirmed.

**Player sees:** Disaster/plague alert panels. Country population drops. Timeline entries for major events.

---

## #11 — Historical Timeline
**What works:** Every major event (war declaration, kingdom founded, ruler died, disaster, era change) is recorded via `htAddEvent()`. Timeline panel shows full scrollable history with emoji, color, importance, and category filters.

**Evidence:** `htAddEvent` called by 15+ different engines. Save key `cgv6_historical_timeline` confirmed. Filter system functional.

**Player sees:** Historical Timeline tab with complete world history — fully browsable, filterable by war/religion/empire/disaster.

---

## #12 — World Chronicle & Event Feed
**What works:** worldChronicleV92 groups events by year in a vertical timeline. eventFeedEngine aggregates real-time news from wars, disasters, bosses, kingdoms into a "World News" panel.

**Evidence:** Both systems gameTick-hooked with save keys. `collectEvents()` pulls from `worldHistory`, `warsActive`, `worldBossEngine`, `kingdomEngine`, `disasterEngine`.

**Player sees:** Chronicle tab with year-grouped event log. News feed panel with recent world headlines.

---

## #13 — Autonomous World Events (V92)
**What works:** 30 types of autonomous world events generate automatically without player input: political coups, cultural renaissances, economic booms, religious reformations, etc. All write to chronicle and timeline.

**Evidence:** `autonomousEventEngineV92.js` gameTick-hooked, save key `cgv6_autonomous_events_v92`. `worldAutonomyClockV92` broadcasts year-change events to all V92+ engines.

**Player sees:** Autonomous event notifications in World Chronicle. World evolves even when player does nothing.

---

## #14 — Creator Powers V123 (32 Divine Powers)
**What works:** All 7 V123 power modules have real effects: terrain editing rewrites map grid, entity spawning/killing modifies `window.npcs` and `window.countries`, time manipulation changes sim speed, divine events trigger disaster/plague/golden-age, experiment system allows cloning timeline branches.

**Evidence:** `creatorPowersCoreV123.js` confirmed gameTick-hooked. 5 timeline save slots functional. Panel UI with all 32 powers rendered.

**Player sees:** Creator Powers panel with 32 buttons, each with real world effect visible immediately.

---

## #15 — Life & Species Simulation (V93/V94)
**What works:** 5 species presets with traits (Humans, Elves, Dwarves, etc.). Population lifecycle with births/deaths by species. Watchdog engine (V94) ensures species re-seed if extinct. Life events fire (migration, extinction warning, population boom).

**Evidence:** `lifeActivationEngineV94.js` runs every 60 ticks with 4-layer self-healing. `lev93GetCurrentPop()` confirmed as population SSOT for PUOS dashboard.

**Player sees:** Species panel listing all species with population counts. Life events in log. Population stat in PUOS My Universe panel.

---

## #16 — Civilization AI (V120)
**What works:** Each civilization has an AI brain with personality traits, memory of past decisions, and strategic evaluations. Civs make decisions (expand, research, defend, diplomacy) every 25 years autonomously. Auto-alliances and auto-wars between AI civs run without player.

**Evidence:** `civAIBrainV120.js`, `civDecisionEngineV120.js`, `civDiplomacyV120.js` all gameTick-hooked. `window.civAIV120Data` populated.

**Player sees:** AI civilization decisions logged in chronicle. Alliance formations and wars between AI civs visible in diplomacy panel.

---

## #17 — NPC Family & Relationship System (V65)
**What works:** NPCs have careers (8 preset types), personal dreams, family trees with multi-generational genealogy, and 9 types of relationships (lovers, rivals, friends, enemies). Children inherit traits from parents.

**Evidence:** All three V65 engines gameTick-hooked via year-change listener. Save keys confirmed. Data accessible via NPC profile views.

**Player sees:** NPC profile panel showing career, dreams, relationships, family tree connections.

---

## #18 — Timeline Replay System (V122)
**What works:** Snapshots captured on 17 trigger events (war declaration, era change, civ stage change, etc.). Up to 200 snapshots stored. 5-tab UI allows scrubbing through world history with population/civ stats.

**Evidence:** `timelineReplayEngineV122.js` gameTick-hooked, save key `cgv6_timeline_replay_v122`. `[TimelineReplayUI V122] UI renderer sẵn sàng` in browser console.

**Player sees:** Timeline Replay panel with history scrubber, population graph, civilization count timeline.

---

## #19 — Heavenly Dao Tribunal (Karma System)
**What works:** Every faction has karma (Sin vs. Virtue) tracked continuously. When thresholds crossed, Heavenly Dao automatically issues punishments (bolt, wrath, annihilate) or graces (minor/major/divine favor). Runs without player input.

**Evidence:** `heavenlyDaoEngine.js` gameTick-hooked. Karma judgements confirmed in browser log console. `[HeavenlyDaoEngine V1] ⚖️ Thiên Đạo Phán Xét khởi động`.

**Player sees:** Karma events in timeline. Divine judgement notifications. Faction power changes after judgements.

---

## #20 — World Share System
**What works:** Player can export full world snapshot via `POST /api/share`. Server saves JSON file in `shared_worlds/`. Generates share link (`/view?id=...`). Recipient loads `worldViewer.html` and sees the world in read-only mode.

**Evidence:** `serve.js` lines 44–58 confirmed. `worldShareEngine.js` confirmed calling real `/api/share` endpoint with proper fallback to Base64 code.

**Player sees:** "Share World" button generates real shareable URL. Others can view the world via the link without the full game loaded.
