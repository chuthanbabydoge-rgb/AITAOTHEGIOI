(function() {
  "use strict";

  var SAVE_KEY = "cgv6_life_engine_v93";

  window.lev93Data = {
    globalPop: 0,
    globalBirthRate: 0.08,
    globalDeathRate: 0.04,
    populationHistory: [],   // [{year, total, births, deaths}]
    totalBirths: 0,
    totalDeaths: 0,
    peakPop: 0,
    peakYear: 1,
    initialized: false
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.lev93Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.lev93Data = JSON.parse(d);
    } catch(e) {}
  }

  function calcGlobalPop() {
    var species = window.spv93Data && window.spv93Data.species;
    if (!species || !species.length) return (window.npcs || []).length;
    var total = 0;
    species.forEach(function(sp) { total += sp.population || 0; });
    return total;
  }

  function calcGlobalRates() {
    var species = window.spv93Data && window.spv93Data.species;
    if (!species || !species.length) return;
    var totalBR = 0, totalDR = 0, count = 0;
    species.forEach(function(sp) {
      if (sp.status !== 'extinct') {
        totalBR += sp.birthRate || 0.08;
        totalDR += sp.deathRate || 0.04;
        count++;
      }
    });
    if (count > 0) {
      window.lev93Data.globalBirthRate = Math.round((totalBR / count) * 1000) / 1000;
      window.lev93Data.globalDeathRate = Math.round((totalDR / count) * 1000) / 1000;
    }
  }

  function evolvePopulation(year) {
    if (!window.world || !window.world.name) return;

    // BUG-002 FIX: V94 là SSOT cho species evolution — skip nếu V94 đang active để tránh double-evolution
    var v94Active = window.laeV94Data && window.laeV94Data.activated;
    if (!v94Active && typeof window.spv93EvolveAll === 'function') {
      window.spv93EvolveAll(year);
    }

    calcGlobalRates();
    var total = calcGlobalPop();
    var br = window.lev93Data.globalBirthRate;
    var dr = window.lev93Data.globalDeathRate;
    var births = Math.round(total * br);
    var deaths = Math.round(total * dr);
    var netGrowth = births - deaths;

    window.lev93Data.globalPop = total;
    window.lev93Data.totalBirths += births;
    window.lev93Data.totalDeaths += deaths;

    if (total > window.lev93Data.peakPop) {
      window.lev93Data.peakPop = total;
      window.lev93Data.peakYear = year;
    }

    var snapshot = { year: year, total: total, births: births, deaths: deaths, netGrowth: netGrowth };
    window.lev93Data.populationHistory.push(snapshot);
    if (window.lev93Data.populationHistory.length > 200) window.lev93Data.populationHistory.shift();

    save();
    return snapshot;
  }

  window.lev93GetCurrentPop   = function() { return window.lev93Data.globalPop; };
  window.lev93GetHistory      = function(n) { return window.lev93Data.populationHistory.slice(-(n || 20)); };
  window.lev93GetGrowthRate   = function() {
    var h = window.lev93Data.populationHistory;
    if (h.length < 2) return 0;
    var last = h[h.length - 1];
    var prev = h[h.length - 2];
    if (!prev.total) return 0;
    return Math.round(((last.total - prev.total) / prev.total) * 1000) / 10;
  };

  window.lev93GetSnapshot = function() {
    return {
      globalPop: window.lev93Data.globalPop,
      birthRate: window.lev93Data.globalBirthRate,
      deathRate: window.lev93Data.globalDeathRate,
      growthRate: window.lev93GetGrowthRate(),
      peakPop: window.lev93Data.peakPop,
      peakYear: window.lev93Data.peakYear,
      totalBirths: window.lev93Data.totalBirths,
      totalDeaths: window.lev93Data.totalDeaths,
      history: window.lev93GetHistory(10)
    };
  };

  function onYearChange(year) {
    evolvePopulation(year);
  }

  function initPop() {
    var npcs = (window.npcs || []).length;
    if (npcs > 0 && window.lev93Data.globalPop === 0) {
      window.lev93Data.globalPop = npcs;
    }
    window.lev93Data.initialized = true;
    save();
  }

  function init() {
    load();
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(onYearChange);
    }
    setTimeout(initPop, 500);
    console.log("[LifeEngine V93] 🧬 Life Engine khởi động — Dân Số · Tỷ Lệ Sinh/Tử · Lịch Sử Tăng Trưởng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24700); });
  } else {
    setTimeout(init, 24700);
  }
})();
