(function() {
  "use strict";
  const SAVE_KEY = "cgv6_eco_climate_v45";

  const CLIMATES = [
    { id:"tropical",    name:"Nhiệt Đới",  icon:"🌴", color:"#16a34a", tempRange:[25,40],  rain:"high",   fertileBonus:1.3, warMalus:0.9,  popMalus:1.05, resources:["food","wood"] },
    { id:"temperate",   name:"Ôn Đới",     icon:"🌿", color:"#22c55e", tempRange:[10,25],  rain:"medium", fertileBonus:1.1, warMalus:1.0,  popMalus:1.0,  resources:["food","wood","minerals"] },
    { id:"desert",      name:"Sa Mạc",     icon:"🏜️", color:"#f59e0b", tempRange:[30,50],  rain:"low",    fertileBonus:0.5, warMalus:0.8,  popMalus:0.85, resources:["minerals","energy"] },
    { id:"frozen",      name:"Băng Giá",   icon:"❄️", color:"#7dd3fc", tempRange:[-30,5],  rain:"low",    fertileBonus:0.3, warMalus:0.7,  popMalus:0.8,  resources:["minerals","energy"] },
    { id:"highland",    name:"Núi Cao",    icon:"⛰️", color:"#94a3b8", tempRange:[0,15],   rain:"medium", fertileBonus:0.7, warMalus:0.85, popMalus:0.9,  resources:["minerals","wood"] },
    { id:"divine_realm",name:"Thần Giới",  icon:"✨", color:"#fbbf24", tempRange:[15,30],  rain:"medium", fertileBonus:1.5, warMalus:0.95, popMalus:1.15, resources:["mythological","energy"] },
    { id:"demon_realm", name:"Ma Giới",    icon:"🔥", color:"#ef4444", tempRange:[35,60],  rain:"low",    fertileBonus:0.8, warMalus:1.2,  popMalus:0.95, resources:["energy","mythological"] },
    { id:"custom",      name:"Tùy Chỉnh",  icon:"🌐", color:"#8b5cf6", tempRange:[10,30],  rain:"medium", fertileBonus:1.0, warMalus:1.0,  popMalus:1.0,  resources:["food","minerals"] },
  ];

  const SEASONS = [
    { id:"spring", name:"Xuân", icon:"🌸", popBonus:1.1,  agriBonus:1.2, econBonus:1.1, warBonus:0.9,  duration:25 },
    { id:"summer", name:"Hạ",   icon:"☀️", popBonus:1.0,  agriBonus:1.3, econBonus:1.2, warBonus:1.1,  duration:25 },
    { id:"autumn", name:"Thu",  icon:"🍂", popBonus:1.05, agriBonus:0.9, econBonus:1.0, warBonus:1.0,  duration:25 },
    { id:"winter", name:"Đông", icon:"❄️", popBonus:0.9,  agriBonus:0.5, econBonus:0.8, warBonus:0.85, duration:25 },
  ];

  window.ecoClimateData = {
    climate: "temperate",
    currentSeasonIdx: 0,
    seasonTick: 0,
    seasonYear: 0,
    history: [],
    effects: { popBonus:1.0, agriBonus:1.0, econBonus:1.0, warBonus:1.0 },
    customClimates: [],
    initialized: false,
    tickCount: 0,
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ecoClimateData)); } catch(e) {} }
  function load() { try { var d = localStorage.getItem(SAVE_KEY); if(d) { var p = JSON.parse(d); Object.keys(p).forEach(function(k){ window.ecoClimateData[k] = p[k]; }); } } catch(e) {} }

  window.ecoGetClimates    = function() { return CLIMATES.concat(window.ecoClimateData.customClimates); };
  window.ecoGetClimate     = function(id) { return CLIMATES.find(function(c){ return c.id===id; }) || window.ecoClimateData.customClimates.find(function(c){ return c.id===id; }) || CLIMATES[1]; };
  window.ecoGetCurrentClimate = function() { return window.ecoGetClimate(window.ecoClimateData.climate); };
  window.ecoGetSeasons     = function() { return SEASONS; };
  window.ecoGetCurrentSeason = function() { return SEASONS[window.ecoClimateData.currentSeasonIdx % 4]; };
  window.ecoGetEffects     = function() { return window.ecoClimateData.effects; };

  window.ecoSetClimate = function(id) {
    var found = window.ecoGetClimate(id);
    if (!found) return false;
    var old = window.ecoClimateData.climate;
    if (old === id) return false;
    window.ecoClimateData.climate = id;
    window.ecoClimateData.history.push({ year: window.year||1, from: old, to: id, name: found.name });
    if (window.ecoClimateData.history.length > 30) window.ecoClimateData.history.shift();
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year||1, type:"nature", title:"Khí hậu thay đổi: " + window.ecoGetClimate(old).name + " → " + found.name, color: found.color });
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: window.year||1, category:"nature", title:"Biến đổi khí hậu", content:"Khí hậu thế giới chuyển từ " + window.ecoGetClimate(old).name + " sang " + found.name });
    _updateEffects();
    save();
    return true;
  };

  window.ecoAddCustomClimate = function(obj) {
    if (!obj || !obj.name) return null;
    obj.id = "custom_" + Date.now();
    obj.icon = obj.icon || "🌐";
    obj.color = obj.color || "#8b5cf6";
    obj.fertileBonus = obj.fertileBonus || 1.0;
    obj.warMalus = obj.warMalus || 1.0;
    obj.popMalus = obj.popMalus || 1.0;
    obj.resources = obj.resources || ["food","minerals"];
    window.ecoClimateData.customClimates.push(obj);
    save();
    return obj.id;
  };

  function _updateEffects() {
    var c = window.ecoGetCurrentClimate();
    var s = SEASONS[window.ecoClimateData.currentSeasonIdx % 4];
    window.ecoClimateData.effects = {
      popBonus:   parseFloat((s.popBonus  * c.popMalus).toFixed(2)),
      agriBonus:  parseFloat((s.agriBonus * c.fertileBonus).toFixed(2)),
      econBonus:  parseFloat(s.econBonus.toFixed(2)),
      warBonus:   parseFloat((s.warBonus  * c.warMalus).toFixed(2)),
      climate:    c.id,
      climateName:c.name,
      season:     s.id,
      seasonName: s.name,
      seasonIcon: s.icon,
    };
  }

  function _tick() {
    window.ecoClimateData.tickCount++;
    window.ecoClimateData.seasonTick++;
    var s = SEASONS[window.ecoClimateData.currentSeasonIdx % 4];
    if (window.ecoClimateData.seasonTick >= s.duration) {
      window.ecoClimateData.seasonTick = 0;
      window.ecoClimateData.currentSeasonIdx = (window.ecoClimateData.currentSeasonIdx + 1) % 4;
      var newS = SEASONS[window.ecoClimateData.currentSeasonIdx];
      window.ecoClimateData.seasonYear++;
      if (typeof window.htAddEvent === "function" && window.ecoClimateData.seasonYear % 2 === 0) {
        window.htAddEvent({ year: window.year||1, type:"nature", title:"Chuyển mùa → " + newS.name + " " + newS.icon, color:"#34d399" });
      }
      if (typeof window.waeAddAlert === "function") {
        window.waeAddAlert({ type:"nature", icon:newS.icon, title:"Mùa " + newS.name + " bắt đầu", year: window.year||1 });
      }
      _updateEffects();
    }
    if (window.ecoClimateData.tickCount % 50 === 0) save();
  }

  function init() {
    load();
    // V43 World Age sync — chaos era → demon realm default
    if (typeof window.waeGetCurrentAge === "function") {
      var age = window.waeGetCurrentAge();
      if (age && age.id === "chaos" && window.ecoClimateData.climate === "temperate") {
        window.ecoClimateData.climate = "demon_realm";
      } else if (age && (age.id === "divine" || age.id === "golden") && window.ecoClimateData.climate === "temperate") {
        window.ecoClimateData.climate = "divine_realm";
      }
    }
    _updateEffects();
    window.ecoClimateData.initialized = true;
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); _tick(); };
    console.log("[EcoClimateEngine V45] 🌍 Khởi động — 8 khí hậu · 4 mùa sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 3900); });
  } else {
    setTimeout(init, 3900);
  }
})();
