(function() {
  "use strict";

  // V117 — UWS World Aggregator
  // Đọc dữ liệu world/age/geography từ SSOT, KHÔNG lưu, KHÔNG ghi đè

  window.uwsGetWorldSnapshot = function() {
    var w = window.world || {};
    var yr = window.year || (w.year) || 1;

    // Age data (V25)
    var age = {};
    try {
      var a = window.ageV25Data || {};
      age = {
        current:    a.currentAge   || a.current   || "Unknown",
        stage:      a.stage        || a.stageName  || "",
        progress:   a.progress     || 0,
        year:       a.ageYear      || yr,
      };
    } catch(e) { age = { current: "Unknown", stage: "", progress: 0, year: yr }; }

    // Climate / world flags
    var climate = {};
    try {
      var ed = window.ecoClimateData || {};
      climate = {
        temp:       ed.globalTemp       || ed.temperature || 0,
        rainfall:   ed.rainfall         || 0,
        stability:  ed.climateStability || 1,
      };
    } catch(e) { climate = {}; }

    // Continent summary
    var continents = [];
    try {
      var cd = window.continentDataV26 || window.continentData || {};
      var list = Array.isArray(cd) ? cd : (cd.continents ? cd.continents : Object.values(cd));
      continents = list.map(function(c) {
        return { id: c.id || c.name, name: c.name, regions: (c.regions || []).length };
      });
    } catch(e) { continents = []; }

    return {
      name:       w.name       || "—",
      genre:      w.genre      || w.type || "unknown",
      year:       yr,
      population: w.population || 0,
      biome:      w.biome      || w.terrain || "",
      magic:      w.magicLevel || w.magic   || 0,
      tech:       w.techLevel  || w.tech    || 0,
      seed:       w.seed       || 0,
      created:    w.created    || w.createdYear || 0,
      age:        age,
      climate:    climate,
      continents: continents,
    };
  };

  function init() {
    console.log("[UWS WorldAgg V117] ✅ World Aggregator sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26100); });
  } else {
    setTimeout(init, 26100);
  }
})();
