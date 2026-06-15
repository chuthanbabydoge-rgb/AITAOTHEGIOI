(function() {
  "use strict";

  // V117 — UWS Entity Aggregator
  // Đọc NPC/Kingdom/Empire/Civilization/Species từ SSOT, KHÔNG lưu, KHÔNG ghi đè

  window.uwsGetEntitySnapshot = function() {

    // ── NPCs ──
    var npcSnap = { total: 0, alive: 0, dead: 0, cultivators: 0, top5: [] };
    try {
      var npcs = Array.isArray(window.npcs) ? window.npcs : [];
      var alive = npcs.filter(function(n) { return n.status !== "dead" && n.status !== "deceased"; });
      var dead  = npcs.filter(function(n) { return n.status === "dead" || n.status === "deceased"; });
      var cultivators = alive.filter(function(n) { return n.realm || n.cultivation || n.level; });
      var top5 = alive
        .sort(function(a, b) { return ((b.level||b.power||0) - (a.level||a.power||0)); })
        .slice(0, 5)
        .map(function(n) { return { id: n.id, name: n.name, level: n.level||0, realm: n.realm||"", country: n.country||"" }; });
      npcSnap = { total: npcs.length, alive: alive.length, dead: dead.length, cultivators: cultivators.length, top5: top5 };
    } catch(e) {}

    // ── Kingdoms (V23) ──
    var kingSnap = { total: 0, list: [] };
    try {
      var kd = window.kingdomData || {};
      var kingdoms = Array.isArray(kd.kingdoms) ? kd.kingdoms : (kd.kingdoms ? Object.values(kd.kingdoms) : []);
      kingSnap = {
        total: kingdoms.length,
        list: kingdoms.slice(0, 10).map(function(k) {
          return { id: k.id, name: k.name, power: k.power||0, ruler: k.ruler||"", territory: k.territory||0 };
        })
      };
    } catch(e) {}

    // ── Empires (V23) ──
    var empSnap = { total: 0, list: [] };
    try {
      var ed = window.empireData || {};
      var empires = Array.isArray(ed.empires) ? ed.empires : (ed.empires ? Object.values(ed.empires) : []);
      empSnap = {
        total: empires.length,
        list: empires.slice(0, 10).map(function(e) {
          return { id: e.id, name: e.name, power: e.power||0, emperor: e.emperor||"", vassal: (e.vassals||[]).length };
        })
      };
    } catch(e) {}

    // ── Countries (general) ──
    var countrySnap = { total: 0, list: [] };
    try {
      var countries = Array.isArray(window.countries) ? window.countries : [];
      countrySnap = {
        total: countries.length,
        list: countries.slice(0, 10).map(function(c) {
          return { id: c.id||c.name, name: c.name, level: c.level||1, population: c.population||0 };
        })
      };
    } catch(e) {}

    // ── Civilizations (V95) ──
    var civSnap = { total: 0, list: [] };
    try {
      if (typeof window.cecV95GetAll === "function") {
        var civs = window.cecV95GetAll() || [];
        civSnap = {
          total: civs.length,
          list: civs.slice(0, 10).map(function(c) {
            return { id: c.id, name: c.name, stage: c.stage||0, tech: c.tech||0, speciesId: c.speciesId||"" };
          })
        };
      }
    } catch(e) {}

    // ── Species (V93) ──
    var speciesSnap = { total: 0, list: [] };
    try {
      if (typeof window.spv93GetAlive === "function") {
        var species = window.spv93GetAlive() || [];
        speciesSnap = {
          total: species.length,
          list: species.slice(0, 8).map(function(s) {
            return { id: s.id, name: s.name, population: s.population||0, stage: s.stage||0 };
          })
        };
      } else if (window.spv93Data) {
        var sp = Array.isArray(window.spv93Data.species) ? window.spv93Data.species : [];
        speciesSnap = {
          total: sp.length,
          list: sp.slice(0, 8).map(function(s) {
            return { id: s.id, name: s.name, population: s.population||0, stage: s.stage||0 };
          })
        };
      }
    } catch(e) {}

    // ── Life Population (V93/V94) ──
    var lifePop = 0;
    try {
      if (typeof window.lev93GetCurrentPop === "function") {
        lifePop = window.lev93GetCurrentPop() || 0;
      } else if (window.lev93Data) {
        lifePop = window.lev93Data.totalPop || window.lev93Data.population || 0;
      }
    } catch(e) {}

    return {
      npcs:      npcSnap,
      kingdoms:  kingSnap,
      empires:   empSnap,
      countries: countrySnap,
      civs:      civSnap,
      species:   speciesSnap,
      lifePop:   lifePop,
    };
  };

  function init() {
    console.log("[UWS EntityAgg V117] ✅ Entity Aggregator sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26200); });
  } else {
    setTimeout(init, 26200);
  }
})();
