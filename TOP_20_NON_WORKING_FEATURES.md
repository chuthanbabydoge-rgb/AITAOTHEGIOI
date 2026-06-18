# TOP 20 NON-WORKING FEATURES — Creator God V6 (V124)
**Definition of "non-working":** Feature has code, UI, or documentation suggesting it should work — but does NOT produce real gameplay output due to broken connections, missing dependencies, invisible output, or simulation gaps.

---

## #1 — AI World Generation (Claude AI)
**Claimed capability:** Generate entire worlds from a text prompt using Claude. AI Genesis tab exists in PUOS Worlds panel. Prompt-to-World pipeline is fully coded (7 files).

**Why it doesn't work:** Requires `ANTHROPIC_API_KEY` environment variable. No key is set. Server returns `500: "Anthropic API key not configured on server"` for every `/api/claude` call. All 8 AI-dependent engines are completely non-functional.

**Missing connections:**
- `ANTHROPIC_API_KEY` secret not configured
- `aiGenesisEngine.js`, `promptToWorldEngine.js`, `worldGenerationPipeline.js`, `worldLoreGenerator.js`, `narrativeGeneratorV68.js`, `worldNarrativeCoreV68.js`, `divineOracleV77.js` — all dead
- Jarvis AI chat also broken (same dependency)

**What player sees:** AI Genesis tab renders. Prompt input exists. Button click → silent failure or generic error. No world generated.

---

## #2 — Jarvis AI Chat
**Claimed capability:** Natural language AI assistant that answers world questions, analyzes civilizations, and triggers navigation commands.

**Why it doesn't work:** AI responses require Claude API. Zero AI responses possible without key. Only navigation commands (text "map" → opens map) work because they are hardcoded string matches, not AI.

**Missing connections:**
- `ANTHROPIC_API_KEY`
- `window.aiCall()` → `/api/claude` → 500 error
- All `puosJarvisSend()` AI query paths fail silently

**What player sees:** Jarvis panel looks complete. Text input accepts commands. Navigation shortcuts work. AI responses → empty or error.

---

## #3 — Multiplayer (Cross-Player)
**Claimed capability:** Multiple players online simultaneously, world chat, global marketplace, friend system, cross-world trading.

**Why it doesn't work:** Built on `BroadcastChannel` API which is **same-browser, same-machine only**. There is no WebSocket server, no central backend, no cross-network communication. "Players" are just other browser tabs.

**Missing connections:**
- No WebSocket or HTTP real-time server
- `BroadcastChannel` limited to same browser origin
- `accountEngine.js` uses localStorage passwords — single device only
- `worldSyncEngine.js` broadcasts to other tabs only

**What player sees:** "Online players" list (shows other tabs). Chat works between tabs. Cross-device: zero functionality. Status light shows "Connected" even with no other real players.

---

## #4 — Cultivation Player Engine (Player Cultivation Stages)
**Claimed capability:** Player character progresses through 6 cultivation stages with visible skill unlocks, stage-specific powers, and a dedicated UI section.

**Why it doesn't work:** `cultivationPlayerEngine.js` hooks gameTick and runs `culTick()` every tick — but `culRenderSection()` has **no assigned tab in player-hub-v28**. Data accumulates invisibly.

**Missing connections:**
- No nav button for cultivation tab in player hub
- `culRenderSection()` never called from UI navigation
- Player cannot see their own cultivation stage progress

**What player sees:** Nothing. Player cultivation data updates silently. No indication the system is running.

---

## #5 — Player Economy / Multi-Currency Wallet (V52)
**Claimed capability:** Player has multi-currency wallet (Đồng, Bạc, Vàng, Linh Thạch, Thiên Tinh), passive income from businesses, tax collection from territories.

**Why it doesn't work:** `playerEconomyCoreV52.js` has no render function. No UI displays the wallet. `businessSystemV52.js` and `taxationSystemV52.js` also run invisibly.

**Missing connections:**
- `pec52Data` wallet object populated but never rendered
- No "Economy" tab in player-hub-v28 showing currencies
- `businessSystemV52` runs income tick but player sees no result
- V52 currency used by V53 guild system but not shown to player

**What player sees:** Nothing related to their multi-currency wallet. Economy logic runs invisibly in background.

---

## #6 — Player Empire Management (V53)
**Claimed capability:** Player manages an advanced empire with Officials, Army, Tax Collectors, AI Diplomacy, and Court intrigue.

**Why it doesn't work:** `playerEmpireV53.js` runs army upkeep and tax collection every tick but has no render function. Data extends `playerTerritoryData` but these extensions are not displayed.

**Missing connections:**
- No `peV53RenderPanel()` function
- Officials, army composition, court roles not surfaced to player
- V53 empire data visible to no UI element

**What player sees:** Basic territory panel from V28 playerTerritorySystem. Advanced empire management completely hidden.

---

## #7 — XR / VR / AR Mode
**Claimed capability:** Enter the world in full VR (Quest), Apple Vision Pro spatial computing, XR God Mode, holographic timeline, universe visualization.

**Why it doesn't work:** Requires physical XR hardware. `webxrSystem.js` calls `navigator.xr.requestSession()` which fails in any non-XR browser. All 9 XR engine files register gameTick hooks but none can enter an XR session.

**Missing connections:**
- No XR-capable device connected
- `navigator.xr` unavailable in standard browser
- All XR entry points (`XRSystem.enter()`, `xrWorldEngine.enter()`) fail silently
- Vision Pro / Quest bridges are pure stubs

**What player sees:** XR tabs render in hubs. "Enter XR" button exists. Click → nothing happens. No error message shown to player.

---

## #8 — Web Worker NPC AI
**Claimed capability:** NPC AI decisions offloaded to Web Workers for performance. Worker pool manages concurrent NPC processing.

**Why it doesn't work:** Web Workers cannot access `window.*` global state. All NPC data lives on `window.npcs`, `window.world`, etc. Workers run in complete isolation. The worker pool registers gameTick hooks but workers receive no actual game data to process.

**Missing connections:**
- `npcAIWorker.js` is a standalone worker script that cannot read `window.npcs`
- No shared memory (`SharedArrayBuffer`) bridge implemented
- `webWorkerEngine.js` gameTick hook fires but sends no meaningful data to workers
- Workers receive and return empty/stub data

**What player sees:** Nothing. Web Workers run silently in background doing nothing useful.

---

## #9 — Digital Life / NPC Consciousness Layer
**Claimed capability:** NPCs have inner states (happy/anxious/enlightened), philosophical beliefs, self-reflection journal entries, evolving personality, ideological alignment. 5 engines (V78) track all of this.

**Why it doesn't work:** All 5 V78 engines (`digitalLifeEngine.js`, `personalityEvolutionEngine.js`, `selfReflectionEngine.js`, `ideologyEngine.js`, `consciousnessLayer.js`) hook gameTick and generate data — but **no UI panel surfaces this data to the player**.

**Missing connections:**
- No accessible NPC "Inner Life" panel in any hub
- Data stored in `cgv6_digital_life_v78` etc. but never rendered in player-facing UI
- Creator-hub-v32 is not in primary PUOS navigation

**What player sees:** Nothing. 5 engines run, save data, produce rich NPC inner life — completely invisible.

---

## #10 — Player Civilization (V58)
**Claimed capability:** Player builds a unique civilization with its own language, laws, ideology, culture, and history influence system. 6 dedicated tabs in player-hub-v28.

**Why it doesn't work:** 4 engines gameTick-hooked and generating data — but the tabs cannot be reliably accessed. `player-hub-v28` navigation to V58 tabs is broken or tabs simply don't appear in the current sidebar state.

**Missing connections:**
- V58 panel tabs defined but not accessible via current PUOS navigation
- `civCultureLanguageV58`, `civLawIdeologyV58`, `civHistoryInfluenceV58`, `civRegistryV58` all invisible
- `playerCivCoreV58.js` runs culture/law ticks but player never sees outputs

**What player sees:** Generic player panel. No civilization culture/language/law tabs visible.

---

## #11 — World Narrative Engine (V68)
**Claimed capability:** AI generates ongoing novel chapters about the world's history. 4 narrative styles (Epic, Tragic, Romantic, Documentary). Chapter reader UI in creator-hub-v32.

**Why it doesn't work:** Requires Claude API. `narrativeGeneratorV68.js` calls `/api/claude` for every chapter. Without API key: zero chapters generated.

**Missing connections:**
- `ANTHROPIC_API_KEY` missing
- `worldNarrativeCoreV68.js` chapter generation loop produces nothing
- `narrativeBookV68.js` UI renders empty chapter list

**What player sees:** Narrative Book UI renders. Empty chapter list. "Generate Chapter" button → silent fail.

---

## #12 — Prophecy Fulfillment Tracking (V77)
**Claimed capability:** Ancient prophecies are generated, assigned to NPCs/kingdoms, and the system tracks whether the world fulfills them. When fulfilled, dramatic events trigger.

**Why it doesn't work:** Prophecy generation works (random template-based). But **fulfillment checking is incomplete**. The oracle (`divineOracleV77.js`) requires Claude API for interpretation. Prophecy-to-world-event link is not implemented for most prophecy types.

**Missing connections:**
- `divineOracleV77.js` → Claude API → broken
- Most prophecy fulfillment checks are `TODO` stubs
- Prophecies generated but never "fulfilled" — player sees list but no prophecy ever completes

**What player sees:** Prophecy tab with list of generated prophecies. All show as "Pending." None ever trigger fulfillment events.

---

## #13 — Memory Decay & NPC Memory System (V64)
**Claimed capability:** NPCs form memories of events, memories decay over time based on importance, legends emerge from surviving memories. Creator, NPC, Civ, Dynasty, and World memory subsystems all track this.

**Why it doesn't work:** All 7 V64 engines run and save data. But the memory data is not surfaced in NPC profiles, not used by AI decision-making, and the "5 memory tabs in creator-hub-v32" are in a hub that is not in primary PUOS navigation.

**Missing connections:**
- creator-hub-v32 not reachable from main PUOS shell (only accessible via Classic mode)
- NPC profile view does not include V64 memory data
- Memory decay fires but no legend emergence events observed in practice

**What player sees:** Nothing. All 7 memory engines run invisibly. Rich memory data collected, never displayed.

---

## #14 — Ecology System (V-eco suite)
**Claimed capability:** Climate simulation, ecosystem creatures, ecological disasters, resource scarcity driven by ecology. 5 engines tracking world ecology.

**Why it doesn't work:** `ecoClimateEngine.js`, `ecoResourceEngine.js`, `ecoCreatureEngine.js`, `ecoDisasterEngine.js`, `ecoRegistry.js` all hook gameTick and collect data — but no ecology panel is accessible from PUOS. Classic-mode navigation is required.

**Missing connections:**
- Ecology panel buried in Classic mode (not PUOS)
- Ecology data does not feed back into country economy/population in a meaningful visible way
- Eco-disasters do not trigger the main disaster notification system

**What player sees:** No ecology panel in PUOS. Ecology effects on world barely noticeable. System runs but player cannot observe it.

---

## #15 — Ocean Trade / Pirate / Fleet / Colony System
**Claimed capability:** Deep naval simulation: trade routes, pirate raids, fleet battles, colonial expansion across seas. 5 engines handle ocean and naval gameplay.

**Why it doesn't work:** All 5 engines gameTick-hooked and running. But ocean trade panel, fleet panel, and pirate panel are in Classic mode navigation — not accessible from PUOS. Player interaction with these systems (declaring trade routes, launching fleets, raiding) requires finding buried UI elements.

**Missing connections:**
- No PUOS panel for ocean/naval gameplay
- Classic mode navigation to ocean panels is opaque
- Player territory system doesn't integrate sea territory
- Fleet battles are simulated but no player can command fleets

**What player sees:** Occasional pirate/fleet log messages. Cannot actively engage with naval gameplay.

---

## #16 — Universe Travel Engine / Portal Network
**Claimed capability:** Player can travel between universes, use portal networks, experience different worlds directly.

**Why it doesn't work:** `universeTravelEngine.js` and `portalNetwork.js` both gameTick-hooked. But travel "between universes" means switching the active `window.world` object — which resets the entire simulation state. No smooth transition, no persistent state for the "traveler." Portal events fire (V124) but are descriptive text only with no actual universe-switch mechanic.

**Missing connections:**
- No universe-switching UI that preserves player state
- Portal events generate text logs but do not change world state
- "Observation mode" (V124) shows another universe's stats but player cannot act in it

**What player sees:** Portal Hub UI with universe list. "Activate Portal" button creates log entry. Nothing else changes.

---

## #17 — Sentient Civilization Consciousness (V79)
**Claimed capability:** Civilizations develop collective consciousness, cultural evolution, philosophical schools, and academic institutions. 6 more engines on top of V78.

**Why it doesn't work:** `civilizationConsciousnessEngine.js`, `culturalEvolutionEngine.js`, `collectiveMemoryEngine.js`, `academyEngine.js`, `cultureEngine.js`, `philosophyEngine.js` all hook gameTick — but all output goes to `cgv6_civ_consciousness_v79` etc. with no UI access from PUOS.

**Missing connections:**
- All V79 output is in creator-hub-v32 (not PUOS reachable)
- Civ philosophy/consciousness data not integrated into V95 Civ Evolution display
- 6 engines running, data accumulating, player sees nothing

**What player sees:** Civilization panel shows V95 data (civ stages, tech). V79 consciousness/culture/philosophy completely hidden.

---

## #18 — Black Market & Supply/Demand Economy (V54)
**Claimed capability:** Dynamic supply-demand pricing driven by wars, disasters, plagues, and ages. Player-accessible black market for rare items. Trade network connecting world economies.

**Why it doesn't work:** `blackMarketV54.js`, `supplyDemandV54.js`, `tradeNetworkCoreV54.js` all gameTick-hooked. Supply-demand calculations run. But no player-facing UI exists in PUOS for black market or trade network. Player marketplace V52 exists but V54 systems don't connect to it.

**Missing connections:**
- Black market UI exists in creator-hub-v32 (Classic only)
- Supply-demand price changes not visible in any price display
- Trade network panel not in PUOS navigation
- Player cannot buy/sell on black market from current UI

**What player sees:** Player can access the basic playerMarketplace.js (V34) via Multiplayer panel. V54 advanced economy: invisible.

---

## #19 — Multiverse Rankings & Cross-Universe Competition
**Claimed capability:** Live rankings of all universes by age, population, civilization advancement, and creator influence. Rankings affect gameplay by granting buffs to top-ranked universes.

**Why it doesn't work:** `multiverseRankingsV124.js` calculates rankings correctly — but 7 of 8 ranked universes are hardcoded demo data (`Azureth`, `Mechatopia`, etc.) that never change. Rankings are always the same. "Ranking buffs" to player universe are logged but not implemented in actual stat calculations.

**Missing connections:**
- Demo universes have static hardcoded stats — never evolve
- Ranking buffs (speed bonus, resource bonus) are logged but not applied to `window.world` or `window.countries`
- No mechanism to import real universes from other players (no network)

**What player sees:** Rankings panel shows gold/silver/bronze medals. Your world usually loses to demo universes. Winning changes nothing.

---

## #20 — Ascension Engine (Player Transcendence)
**Claimed capability:** Player character can ascend beyond the mortal world, reaching divine realms, unlocking transcendence powers, and becoming a true god entity.

**Why it doesn't work:** `ascensionEngine.js` gameTick-hooked via `ascTick()`. Ascension data tracked in `cgv6_ascension_v28`. But ascension UI panel is not clearly accessible — the panel exists (`#panel-ascension`) but the nav button path to reach it through PUOS is broken or buried.

**Missing connections:**
- Ascension nav button hidden (`ec-hidden` class applied, display:none)
- Unlock condition for ascension tab not met (requires specific `v23UnlockTabs()` trigger)
- Ascension powers (post-transcendence abilities) have no UI even if panel reached
- Cultivation engine (which feeds ascension) has no visible UI either

**What player sees:** Nothing about ascension from PUOS. Player may not even know this system exists.
