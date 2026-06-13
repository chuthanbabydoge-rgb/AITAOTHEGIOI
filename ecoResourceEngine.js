(function() {
  "use strict";
  const SAVE_KEY = "cgv6_eco_resource_v45";

  const RESOURCE_TYPES = [
    { id:"minerals",     name:"Khoáng Sản",      icon:"⛏️",  color:"#94a3b8", baseRegen:2,  category:"material" },
    { id:"wood",         name:"Gỗ",              icon:"🌲",  color:"#22c55e", baseRegen:3,  category:"organic"  },
    { id:"food",         name:"Thực Phẩm",       icon:"🌾",  color:"#f59e0b", baseRegen:4,  category:"organic"  },
    { id:"energy",       name:"Năng Lượng",      icon:"⚡",  color:"#facc15", baseRegen:1,  category:"energy"   },
    { id:"mythological", name:"Tài Nguyên Thần", icon:"💎",  color:"#c084fc", baseRegen:0.5,category:"arcane"   },
  ];

  // Per-climate resource multipliers
  const CLIMATE_RESOURCE_BONUS = {
    tropical:    { food:1.5, wood:1.4, minerals:0.8, energy:1.0, mythological:0.8 },
    temperate:   { food:1.2, wood:1.2, minerals:1.0, energy:1.0, mythological:0.7 },
    desert:      { food:0.4, wood:0.3, minerals:1.5, energy:1.4, mythological:0.9 },
    frozen:      { food:0.3, wood:0.5, minerals:1.4, energy:1.2, mythological:0.8 },
    highland:    { food:0.7, wood:1.0, minerals:1.6, energy:1.1, mythological:1.0 },
    divine_realm:{ food:1.3, wood:1.1, minerals:0.8, energy:1.5, mythological:2.5 },
    demon_realm: { food:0.6, wood:0.5, minerals:1.1, energy:1.8, mythological:1.8 },
    custom:      { food:1.0, wood:1.0, minerals:1.0, energy:1.0, mythological:1.0 },
  };

  // Per-season resource multipliers
  const SEASON_RESOURCE_BONUS = {
    spring: { food:1.3, wood:1.2, minerals:1.0, energy:1.0, mythological:1.1 },
    summer: { food:1.4, wood:1.0, minerals:1.0, energy:1.3, mythological:0.9 },
    autumn: { food:1.1, wood:1.3, minerals:1.1, energy:1.0, mythological:1.0 },
    winter: { food:0.5, wood:0.7, minerals:1.2, energy:0.8, mythological:1.3 },
  };

  function _makeDefaultResources() {
    var r = {};
    RESOURCE_TYPES.forEach(function(rt) {
      r[rt.id] = { current: 100, max: 1000, regen: rt.baseRegen, depleted: false, trades: 0, extracted: 0 };
    });
    return r;
  }

  window.ecoResourceData = {
    resources: _makeDefaultResources(),
    tradeRoutes: [],
    extractionLog: [],
    totalExtracted: {},
    tickCount: 0,
    initialized: false,
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ecoResourceData)); } catch(e) {} }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        Object.keys(p).forEach(function(k){ window.ecoResourceData[k] = p[k]; });
        // ensure all resource types exist
        RESOURCE_TYPES.forEach(function(rt) {
          if (!window.ecoResourceData.resources[rt.id]) {
            window.ecoResourceData.resources[rt.id] = { current:100, max:1000, regen:rt.baseRegen, depleted:false, trades:0, extracted:0 };
          }
        });
      }
    } catch(e) {}
  }

  window.ecoGetResources    = function() { return window.ecoResourceData.resources; };
  window.ecoGetResource     = function(id) { return window.ecoResourceData.resources[id] || null; };
  window.ecoGetResourceTypes= function() { return RESOURCE_TYPES; };

  window.ecoExtractResource = function(id, amount) {
    var r = window.ecoResourceData.resources[id];
    if (!r) return 0;
    var amt = Math.min(amount, r.current);
    r.current -= amt;
    r.extracted += amt;
    r.depleted = r.current <= 0;
    window.ecoResourceData.extractionLog.push({ id:id, amount:amt, year:window.year||1 });
    if (window.ecoResourceData.extractionLog.length > 50) window.ecoResourceData.extractionLog.shift();
    if (!window.ecoResourceData.totalExtracted[id]) window.ecoResourceData.totalExtracted[id] = 0;
    window.ecoResourceData.totalExtracted[id] += amt;
    if (r.depleted && typeof window.htAddEvent === "function") {
      var rt = RESOURCE_TYPES.find(function(x){ return x.id===id; });
      window.htAddEvent({ year:window.year||1, type:"economy", title:"Cạn kiệt tài nguyên: " + (rt?rt.name:id), color:"#ef4444" });
    }
    return amt;
  };

  window.ecoAddTradeRoute = function(resourceId, amount, target) {
    window.ecoResourceData.tradeRoutes.push({ id:"trade_"+Date.now(), resourceId:resourceId, amount:amount, target:target||"unknown", active:true, since:window.year||1 });
    save();
  };

  window.ecoGetResourceStats = function() {
    var stats = { total:0, depleted:0, thriving:0, byClimate:{} };
    RESOURCE_TYPES.forEach(function(rt) {
      var r = window.ecoResourceData.resources[rt.id];
      stats.total += r.current;
      if (r.depleted) stats.depleted++; else stats.thriving++;
    });
    var climate = (typeof window.ecoClimateData !== "undefined") ? window.ecoClimateData.climate : "temperate";
    stats.byClimate = CLIMATE_RESOURCE_BONUS[climate] || CLIMATE_RESOURCE_BONUS.temperate;
    return stats;
  };

  function _computeRegen(rtId) {
    var rt = RESOURCE_TYPES.find(function(x){ return x.id===rtId; });
    if (!rt) return 1;
    var base = rt.baseRegen;
    var climate = (typeof window.ecoClimateData !== "undefined") ? window.ecoClimateData.climate : "temperate";
    var season  = (typeof window.ecoClimateData !== "undefined") ? window.ecoGetCurrentSeason && window.ecoGetCurrentSeason() ? window.ecoGetCurrentSeason().id : "spring" : "spring";
    var cBonus  = (CLIMATE_RESOURCE_BONUS[climate]  || CLIMATE_RESOURCE_BONUS.temperate)[rtId] || 1.0;
    var sBonus  = (SEASON_RESOURCE_BONUS[season]    || SEASON_RESOURCE_BONUS.spring)[rtId]     || 1.0;
    // V43 World Age sync
    var ageBonus = 1.0;
    if (typeof window.waeGetCurrentAge === "function") {
      var age = window.waeGetCurrentAge();
      if (age && age.id === "golden") ageBonus = 1.5;
      else if (age && age.id === "chaos") ageBonus = 0.7;
    }
    return base * cBonus * sBonus * ageBonus;
  }

  function _tick() {
    window.ecoResourceData.tickCount++;
    // Regen every tick
    RESOURCE_TYPES.forEach(function(rt) {
      var r = window.ecoResourceData.resources[rt.id];
      if (r.current < r.max) {
        r.current = Math.min(r.max, r.current + _computeRegen(rt.id));
        if (r.depleted && r.current > 10) r.depleted = false;
      }
    });
    // Trade routes consume resources
    window.ecoResourceData.tradeRoutes.forEach(function(route) {
      if (route.active) window.ecoExtractResource(route.resourceId, route.amount * 0.1);
    });
    if (window.ecoResourceData.tickCount % 50 === 0) save();
  }

  function init() {
    load();
    window.ecoResourceData.initialized = true;
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); _tick(); };
    console.log("[EcoResourceEngine V45] ⛏️ Khởi động — 5 loại tài nguyên sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4000); });
  } else {
    setTimeout(init, 4000);
  }
})();
