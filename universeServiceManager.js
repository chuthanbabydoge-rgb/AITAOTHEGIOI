(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_services_v81";

  window.universeServicesV81Data = {
    services: {},
    lastCheck: null
  };

  const SERVICE_DEFINITIONS = [
    {
      id: "world_service",
      label: "🌍 World Service",
      description: "Quản lý trạng thái thế giới cốt lõi",
      icon: "🌍",
      dependencies: ["window.world", "window.countries", "window.year"],
      check: function() {
        return !!(window.world && window.world.name);
      },
      getMetrics: function() {
        const w = window.world || {};
        return {
          worldName: w.name || "–",
          genre: w.genre || "–",
          stability: w.stability || 0,
          year: window.year || 0,
          countries: (window.countries || []).length
        };
      },
      apis: ["window.world", "window.countries", "window.year", "window.gameTick"]
    },
    {
      id: "memory_service",
      label: "🧠 Memory Service",
      description: "Lưu trữ và truy xuất ký ức thế giới — V64",
      icon: "🧠",
      dependencies: ["window.wmeAddMemory", "window.memoryEngineV64Data"],
      check: function() {
        return typeof window.wmeAddMemory === "function";
      },
      getMetrics: function() {
        const d = window.memoryEngineV64Data || {};
        return {
          totalMemories: d.memories ? d.memories.length : 0,
          worldMemories: (d.worldMemories || []).length,
          npcMemories: d.npcMemories ? Object.keys(d.npcMemories).length : 0
        };
      },
      apis: ["window.wmeAddMemory", "window.mem64Record", "window.mem64Get"]
    },
    {
      id: "npc_service",
      label: "👥 NPC Service",
      description: "Quản lý sinh linh — Living NPC V65 + Digital Life V78",
      icon: "👥",
      dependencies: ["window.npcs"],
      check: function() {
        return Array.isArray(window.npcs) && window.npcs.length > 0;
      },
      getMetrics: function() {
        const npcs = window.npcs || [];
        const alive = npcs.filter(n => n && !n.dead).length;
        const heroes = npcs.filter(n => n && (n.isHero || n.power > 70)).length;
        return {
          total: npcs.length,
          alive,
          dead: npcs.length - alive,
          heroes,
          withConsciousness: window.consciousnessV78Data ? Object.keys(window.consciousnessV78Data.entities || {}).length : 0
        };
      },
      apis: ["window.npcs", "window.npcLifeV65Data", "window.digitalLifeV78Data"]
    },
    {
      id: "civilization_service",
      label: "🏛️ Civilization Service",
      description: "Nền văn minh có ý thức — V58 Player Civ + V79 Sentient Civ",
      icon: "🏛️",
      dependencies: ["window.countries"],
      check: function() {
        return (window.countries || []).length > 0;
      },
      getMetrics: function() {
        const countries = window.countries || [];
        const kingdoms = (window.kingdomData && window.kingdomData.kingdoms) ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms)).length : 0;
        const empires = (window.empireData && window.empireData.empires) ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires)).length : 0;
        const cce = window.civConsciousnessV79Data;
        return {
          countries: countries.length,
          kingdoms,
          empires,
          consciousCivs: cce ? Object.keys(cce.civilizations || {}).length : 0,
          philosophies: (window.philosophyV79Data && window.philosophyV79Data.schools) ? window.philosophyV79Data.schools.length : 0
        };
      },
      apis: ["window.countries", "window.kingdomData", "window.empireData", "cce79GetProfile"]
    },
    {
      id: "economy_service",
      label: "💰 Economy Service",
      description: "Kinh tế người chơi + thế giới — V52 + V54",
      icon: "💰",
      dependencies: ["window.playerEconV52Data"],
      check: function() {
        return typeof window.playerEconV52Data !== "undefined" || typeof window.tradeNetworkV54Data !== "undefined";
      },
      getMetrics: function() {
        const econ = window.playerEconV52Data || {};
        const trade = window.tradeNetworkV54Data || {};
        return {
          wallet: econ.wallet ? Object.keys(econ.wallet).length : 0,
          tradeRoutes: trade.routes ? trade.routes.length : 0,
          businesses: (window.businessV52Data && window.businessV52Data.businesses) ? window.businessV52Data.businesses.length : 0
        };
      },
      apis: ["pec52GetWallet", "tn54GetRoutes", "biz52GetTotalValue"]
    },
    {
      id: "xr_service",
      label: "🥽 XR Service",
      description: "VR/AR/MR/XR — V69 Foundation + V72 World + V70 Immersion",
      icon: "🥽",
      dependencies: ["window.xrEngineV69Data"],
      check: function() {
        return !!(window.xrEngineV69Data || window.xrWorldV72Data || window.immersionEngineV70Data);
      },
      getMetrics: function() {
        const readiness = [];
        if (window.xrEngineV69Data) readiness.push("Foundation V69");
        if (window.xrWorldV72Data) readiness.push("World V72");
        if (window.immersionEngineV70Data) readiness.push("Immersion V70");
        if (window.avatarGodV71Data) readiness.push("Avatar V71");
        if (window.spatialWorldV67Data) readiness.push("Spatial V67");
        return {
          readiness: readiness.length,
          maxReadiness: 5,
          score: Math.round((readiness.length / 5) * 100),
          systems: readiness
        };
      },
      apis: ["xrw72ActivateWorldTable", "imm70ZoomTo", "avg71SelectForm", "dps71EnterPresence"]
    },
    {
      id: "multiverse_service",
      label: "🌌 Multiverse Service",
      description: "Đa vũ trụ — V35 core + V73 Hub + V80 Evolution",
      icon: "🌌",
      dependencies: ["window.multiverseData"],
      check: function() {
        return !!(window.multiverseData || window.universeHubV73Data || window.multiverseEvoV80Data);
      },
      getMetrics: function() {
        const hub = window.universeHubV73Data || {};
        const evo = window.multiverseEvoV80Data || {};
        const cluster = window.universeClusterV80Data || {};
        return {
          hubWorlds: (hub.worlds || []).length,
          evoWorlds: (evo.worlds || []).length,
          clusters: (cluster.clusters || []).length,
          portalsOpen: (hub.portals || []).length,
          evolutionActive: !!(evo.worlds && evo.worlds.length > 0)
        };
      },
      apis: ["uhub73OpenPortal", "mevo80RegisterWorld", "uclu80CreateCluster"]
    }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.universeServicesV81Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.universeServicesV81Data = Object.assign(window.universeServicesV81Data, JSON.parse(d));
    } catch(e) {}
  }

  window.usm81GetAll = function() {
    return SERVICE_DEFINITIONS;
  };

  window.usm81CheckHealth = function() {
    const result = {};
    for (const svc of SERVICE_DEFINITIONS) {
      let active = false, metrics = {};
      try { active = svc.check(); } catch(e) {}
      try { if (active) metrics = svc.getMetrics(); } catch(e) {}
      result[svc.id] = { id: svc.id, label: svc.label, icon: svc.icon, description: svc.description, active, metrics, apis: svc.apis };
    }
    window.universeServicesV81Data.services = result;
    window.universeServicesV81Data.lastCheck = Date.now();
    save();
    return result;
  };

  window.usm81GetService = function(id) {
    return window.universeServicesV81Data.services[id] || null;
  };

  window.usm81GetActiveCount = function() {
    const svcs = window.universeServicesV81Data.services;
    return Object.values(svcs).filter(s => s.active).length;
  };

  function init() {
    load();
    window.usm81CheckHealth();
    const active = window.usm81GetActiveCount();
    console.log("[Universe Service Manager V81] " + active + "/" + SERVICE_DEFINITIONS.length + " services hoạt động.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21800); });
  } else {
    setTimeout(init, 21800);
  }
})();
