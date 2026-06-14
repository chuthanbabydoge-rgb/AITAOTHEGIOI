(function() {
  "use strict";
  const SAVE_KEY = "cgv6_puos_core_v81";
  const VERSION = "V81";

  window.puosCoreV81Data = {
    version: VERSION,
    initialized: false,
    initTime: null,
    systemName: "Personal Universe Operating System",
    systemVersion: "1.0.0",
    owner: null,
    universeId: null,
    registeredEngines: [],
    registeredServices: [],
    bootLog: [],
    stats: {
      totalEngines: 0,
      activeEngines: 0,
      totalServices: 0,
      uptime: 0
    }
  };

  const KNOWN_ENGINES = [
    { id: "world_core",        label: "World Core",           check: () => typeof window.world !== "undefined" && window.world },
    { id: "npc_engine",        label: "NPC Engine",           check: () => Array.isArray(window.npcs) && window.npcs.length > 0 },
    { id: "living_world",      label: "Living World",         check: () => typeof window.livingWorldTick === "function" },
    { id: "kingdom",           label: "Kingdom Engine",       check: () => typeof window.kingdomData !== "undefined" },
    { id: "empire",            label: "Empire Engine",        check: () => typeof window.empireData !== "undefined" },
    { id: "diplomacy_v24",     label: "Diplomacy V24",        check: () => typeof window.allianceData !== "undefined" },
    { id: "war_engine",        label: "War Engine",           check: () => typeof window.warsActive !== "undefined" },
    { id: "disaster_v25",      label: "Disaster V25",         check: () => typeof window.disasterData !== "undefined" },
    { id: "plague_v25",        label: "Plague V25",           check: () => typeof window.plagueData !== "undefined" },
    { id: "age_v25",           label: "Age V25",              check: () => typeof window.ageV25Data !== "undefined" },
    { id: "multiverse_v35",    label: "Multiverse V35",       check: () => typeof window.multiverseData !== "undefined" },
    { id: "creator_v51",       label: "Creator Authority",    check: () => typeof window.creatorAuthorityV51Data !== "undefined" },
    { id: "player_core_v50",   label: "Player Core V50",      check: () => typeof window.playerCoreV50Data !== "undefined" },
    { id: "economy_v52",       label: "Economy V52",          check: () => typeof window.playerEconV52Data !== "undefined" },
    { id: "guild_v53",         label: "Guild V53",            check: () => typeof window.guildCoreV53Data !== "undefined" },
    { id: "trade_v54",         label: "Trade V54",            check: () => typeof window.tradeNetworkV54Data !== "undefined" },
    { id: "persistent_v55",    label: "Persistent V55",       check: () => typeof window.persistentUnivV55Data !== "undefined" },
    { id: "creator_econ_v57",  label: "Creator Economy V57",  check: () => typeof window.creatorEconV57Data !== "undefined" },
    { id: "player_civ_v58",    label: "Player Civ V58",       check: () => typeof window.playerCivCoreV58Data !== "undefined" },
    { id: "global_events_v59", label: "Global Events V59",    check: () => typeof window.eventSchedulerV59Data !== "undefined" },
    { id: "living_univ_v60",   label: "Living Universe V60",  check: () => typeof window.luOrchestratorV60Data !== "undefined" },
    { id: "integration_v61",   label: "Integration V61",      check: () => typeof window.integrationBridgesV61Data !== "undefined" },
    { id: "world_dna_v62",     label: "World DNA V62",        check: () => typeof window.worldDnaV62Data !== "undefined" },
    { id: "cinematic_v63",     label: "Cinematic V63",        check: () => typeof window.cinematicV63Data !== "undefined" },
    { id: "memory_v64",        label: "Memory System V64",    check: () => typeof window.memoryEngineV64Data !== "undefined" },
    { id: "living_npc_v65",    label: "Living NPC V65",       check: () => typeof window.npcLifeV65Data !== "undefined" },
    { id: "god_exp_v66",       label: "God Experience V66",   check: () => typeof window.divineInterventionV66Data !== "undefined" },
    { id: "spatial_v67",       label: "Spatial UI V67",       check: () => typeof window.spatialWorldV67Data !== "undefined" },
    { id: "narrative_v68",     label: "Narrative V68",        check: () => typeof window.worldNarrativeV68Data !== "undefined" },
    { id: "xr_v69",            label: "XR Foundation V69",    check: () => typeof window.xrEngineV69Data !== "undefined" },
    { id: "immersion_v70",     label: "World Immersion V70",  check: () => typeof window.immersionEngineV70Data !== "undefined" },
    { id: "avatar_v71",        label: "Avatar of God V71",    check: () => typeof window.avatarGodV71Data !== "undefined" },
    { id: "xr_world_v72",      label: "XR World V72",         check: () => typeof window.xrWorldV72Data !== "undefined" },
    { id: "universe_hub_v73",  label: "Universe Hub V73",     check: () => typeof window.universeHubV73Data !== "undefined" },
    { id: "creator_asset_v74", label: "Creator Asset V74",    check: () => typeof window.creatorAssetV74Data !== "undefined" },
    { id: "ai_genesis_v75",    label: "AI Genesis V75",       check: () => typeof window.aiGenesisV75Data !== "undefined" },
    { id: "universe_evo_v76",  label: "Universe Evo V76",     check: () => typeof window.universeEvoV76Data !== "undefined" },
    { id: "prophecy_v77",      label: "Prophecy V77",         check: () => typeof window.ancientProphecyV77Data !== "undefined" },
    { id: "digital_life_v78",  label: "Digital Life V78",     check: () => typeof window.digitalLifeV78Data !== "undefined" },
    { id: "sentient_civ_v79",  label: "Sentient Civ V79",     check: () => typeof window.civConsciousnessV79Data !== "undefined" },
    { id: "multiverse_evo_v80",label: "Multiverse Evo V80",   check: () => typeof window.multiverseEvoV80Data !== "undefined" }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.puosCoreV81Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.puosCoreV81Data = Object.assign(window.puosCoreV81Data, parsed);
      }
    } catch(e) {}
  }

  function bootLog(msg) {
    const entry = { time: Date.now(), msg };
    window.puosCoreV81Data.bootLog.push(entry);
    if (window.puosCoreV81Data.bootLog.length > 50) window.puosCoreV81Data.bootLog.shift();
    console.log("[PUOS V81] " + msg);
  }

  window.puos81ScanEngines = function() {
    const active = [], inactive = [];
    for (const eng of KNOWN_ENGINES) {
      try {
        if (eng.check()) active.push(eng);
        else inactive.push(eng);
      } catch(e) { inactive.push(eng); }
    }
    window.puosCoreV81Data.registeredEngines = KNOWN_ENGINES;
    window.puosCoreV81Data.stats.totalEngines = KNOWN_ENGINES.length;
    window.puosCoreV81Data.stats.activeEngines = active.length;
    return { active, inactive };
  };

  window.puos81GetSystemProfile = function() {
    const world = window.world || {};
    const npcs = window.npcs || [];
    const countries = window.countries || [];
    const year = window.year || 1;
    const scan = window.puos81ScanEngines();
    return {
      worldName: world.name || "Chưa đặt tên",
      worldYear: year,
      worldAge: year,
      population: npcs.length,
      countries: countries.length,
      activeEngines: scan.active.length,
      totalEngines: scan.active.length + scan.inactive.length,
      systemVersion: window.puosCoreV81Data.systemVersion,
      initTime: window.puosCoreV81Data.initTime
    };
  };

  window.puos81GetBootLog = function() {
    return window.puosCoreV81Data.bootLog;
  };

  window.puos81GetStats = function() {
    return window.puosCoreV81Data.stats;
  };

  function init() {
    load();
    window.puosCoreV81Data.initialized = true;
    window.puosCoreV81Data.initTime = Date.now();

    if (!window.puosCoreV81Data.universeId) {
      window.puosCoreV81Data.universeId = "PUOS-" + Date.now().toString(36).toUpperCase();
    }

    const scan = window.puos81ScanEngines();
    bootLog("PUOS Core V81 khởi động. " + scan.active.length + "/" + KNOWN_ENGINES.length + " engines hoạt động.");
    bootLog("Universe ID: " + window.puosCoreV81Data.universeId);

    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.puosCoreV81Data.stats.uptime = (window.puosCoreV81Data.stats.uptime || 0) + 1;
    };

    save();
    console.log("[PUOS Core V81] Hệ điều hành vũ trụ cá nhân khởi động thành công.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21600); });
  } else {
    setTimeout(init, 21600);
  }
})();
