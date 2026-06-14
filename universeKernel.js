(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_kernel_v81";

  window.universeKernelV81Data = {
    kernelVersion: "1.0.0",
    layers: {},
    lastSync: null,
    integrationScore: 0
  };

  const KERNEL_LAYERS = [
    {
      id: "world",
      label: "🌍 World Engine",
      description: "Core world state — quốc gia, NPC, năm",
      color: "#4ade80",
      getStatus: function() {
        const w = window.world;
        if (!w || !w.name) return { active: false, data: {} };
        return {
          active: true,
          data: {
            name: w.name,
            genre: w.genre || "?",
            year: window.year || 1,
            countries: (window.countries || []).length,
            npcs: (window.npcs || []).length
          }
        };
      }
    },
    {
      id: "npc",
      label: "👥 NPC Engine",
      description: "Hệ thống NPC sống động — V65 Living NPC",
      color: "#60a5fa",
      getStatus: function() {
        const npcs = window.npcs || [];
        const lifeData = window.npcLifeV65Data;
        return {
          active: npcs.length > 0,
          data: {
            total: npcs.length,
            alive: npcs.filter(n => n && !n.dead).length,
            withMemory: lifeData ? (lifeData.profiles ? Object.keys(lifeData.profiles).length : 0) : 0
          }
        };
      }
    },
    {
      id: "digital_life",
      label: "🧬 Digital Life Engine",
      description: "V78 — triết học, tư tưởng, ý thức NPC",
      color: "#c084fc",
      getStatus: function() {
        const d = window.digitalLifeV78Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            profiles: d.profiles ? Object.keys(d.profiles).length : 0,
            ideologies: (window.ideologyV78Data && window.ideologyV78Data.schools) ? window.ideologyV78Data.schools.length : 0,
            conscious: (window.consciousnessV78Data && window.consciousnessV78Data.entities) ? Object.keys(window.consciousnessV78Data.entities).length : 0
          }
        };
      }
    },
    {
      id: "civilization",
      label: "🏛️ Civilization Engine",
      description: "V79 Sentient Civ — ý thức văn minh, văn hóa, triết học",
      color: "#fb923c",
      getStatus: function() {
        const d = window.civConsciousnessV79Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            civilizations: d.civilizations ? Object.keys(d.civilizations).length : 0,
            culturalTraits: (window.culturalEvoV79Data && window.culturalEvoV79Data.activeCultures) ? window.culturalEvoV79Data.activeCultures.length : 0,
            philosophies: (window.philosophyV79Data && window.philosophyV79Data.schools) ? window.philosophyV79Data.schools.length : 0
          }
        };
      }
    },
    {
      id: "evolution",
      label: "🌱 Evolution Engine",
      description: "V76 — vũ trụ tự tiến hóa, ngôn ngữ, văn minh tự sinh",
      color: "#4ade80",
      getStatus: function() {
        const d = window.universeEvoV76Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            generated: d.generated || 0,
            speed: d.speed || 1,
            emergentCountries: (window.emergentCivV76Data && window.emergentCivV76Data.emergentCountries) ? window.emergentCivV76Data.emergentCountries.length : 0
          }
        };
      }
    },
    {
      id: "genesis",
      label: "🤖 AI Genesis Engine",
      description: "V75 — tạo thế giới từ văn bản qua Claude AI",
      color: "#facc15",
      getStatus: function() {
        const d = window.aiGenesisV75Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            generations: d.history ? d.history.length : 0,
            applied: (window.worldPipelineV75Data && window.worldPipelineV75Data.applied) ? window.worldPipelineV75Data.applied.length : 0
          }
        };
      }
    },
    {
      id: "xr",
      label: "🥽 XR Engine",
      description: "V69-V72 — VR/AR/MR/XR foundation + World immersion",
      color: "#67e8f9",
      getStatus: function() {
        const xrBase = window.xrEngineV69Data;
        const xrWorld = window.xrWorldV72Data;
        return {
          active: !!(xrBase || xrWorld),
          data: {
            foundation: !!xrBase,
            worldMode: !!xrWorld,
            immersion: !!(window.immersionEngineV70Data),
            avatar: !!(window.avatarGodV71Data)
          }
        };
      }
    },
    {
      id: "universe_hub",
      label: "🌌 Universe Hub",
      description: "V73-V74 — đa vũ trụ, assets, blueprints, portals",
      color: "#a78bfa",
      getStatus: function() {
        const d = window.universeHubV73Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            worlds: d.worlds ? d.worlds.length : 0,
            portals: d.portals ? d.portals.length : 0,
            assets: (window.creatorAssetV74Data && window.creatorAssetV74Data.publicAssets) ? window.creatorAssetV74Data.publicAssets.length : 0
          }
        };
      }
    },
    {
      id: "multiverse_evo",
      label: "🌠 Multiverse Evolution",
      description: "V80 — tiến hóa đa vũ trụ, cụm vũ trụ, ảnh hưởng xuyên chiều",
      color: "#f472b6",
      getStatus: function() {
        const d = window.multiverseEvoV80Data;
        if (!d) return { active: false, data: {} };
        return {
          active: true,
          data: {
            worlds: d.worlds ? d.worlds.length : 0,
            clusters: (window.universeClusterV80Data && window.universeClusterV80Data.clusters) ? window.universeClusterV80Data.clusters.length : 0,
            era: (window.multiverseHistoryV80Data && window.multiverseHistoryV80Data.currentEra) ? window.multiverseHistoryV80Data.currentEra : "?"
          }
        };
      }
    }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.universeKernelV81Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.universeKernelV81Data = Object.assign(window.universeKernelV81Data, JSON.parse(d));
    } catch(e) {}
  }

  window.ukernel81GetLayers = function() {
    return KERNEL_LAYERS;
  };

  window.ukernel81SyncAll = function() {
    const layers = {};
    let active = 0;
    for (const layer of KERNEL_LAYERS) {
      try {
        const status = layer.getStatus();
        layers[layer.id] = { ...layer, status };
        if (status.active) active++;
      } catch(e) {
        layers[layer.id] = { ...layer, status: { active: false, data: {}, error: e.message } };
      }
    }
    window.universeKernelV81Data.layers = layers;
    window.universeKernelV81Data.lastSync = Date.now();
    window.universeKernelV81Data.integrationScore = Math.round((active / KERNEL_LAYERS.length) * 100);
    return layers;
  };

  window.ukernel81GetIntegrationScore = function() {
    return window.universeKernelV81Data.integrationScore;
  };

  window.ukernel81GetLayer = function(id) {
    return window.universeKernelV81Data.layers[id] || null;
  };

  function init() {
    load();
    window.ukernel81SyncAll();
    const score = window.universeKernelV81Data.integrationScore;
    console.log("[Universe Kernel V81] Khởi động. Integration Score: " + score + "%");
    save();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21700); });
  } else {
    setTimeout(init, 21700);
  }
})();
