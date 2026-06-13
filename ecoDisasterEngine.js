(function() {
  "use strict";
  const SAVE_KEY = "cgv6_eco_disaster_v45";

  // V45 eco-scale disasters (complement V25 world-scale disasterEngine.js)
  // V25 = global civilization impact · V45 = local nature/ecosystem impact
  const ECO_DISASTER_TYPES = [
    {
      id:"earthquake",   name:"Động Đất",       icon:"🌋", color:"#ef4444",
      climates:["highland","temperate","desert"],
      severity:["nhẹ","trung bình","mạnh","thảm họa"],
      resourceHit:["minerals"],  creatureHit:["mammoth","wolf"],
      baseChance:0.04, desc:"Rung chuyển địa tầng, phá hủy khoáng sản và môi trường sinh vật"
    },
    {
      id:"volcano",      name:"Núi Lửa",        icon:"🌋", color:"#f97316",
      climates:["highland","demon_realm"],
      severity:["phun nhỏ","phun trung bình","phun lớn","đại phun"],
      resourceHit:["food","wood"],  creatureHit:["deer","mammoth"],
      baseChance:0.025, desc:"Dung nham bao phủ, tiêu diệt cây cối và sinh vật"
    },
    {
      id:"storm",        name:"Bão Lớn",        icon:"🌪️", color:"#7dd3fc",
      climates:["tropical","temperate"],
      severity:["bão nhỏ","bão trung bình","bão lớn","siêu bão"],
      resourceHit:["food","wood"], creatureHit:["deer","sea_turtle"],
      baseChance:0.06, desc:"Cuồng phong phá hủy mùa màng và môi trường ven biển"
    },
    {
      id:"flood",        name:"Đại Hồng Thủy",  icon:"🌊", color:"#3b82f6",
      climates:["tropical","temperate","frozen"],
      severity:["ngập nhẹ","ngập vừa","lũ lớn","đại hồng thủy"],
      resourceHit:["food","minerals"], creatureHit:["deer","mammoth"],
      baseChance:0.05, desc:"Lũ lụt tàn phá đất nông nghiệp và khoáng sản"
    },
    {
      id:"divine_anomaly",name:"Dị Tượng Thần", icon:"⚡", color:"#c084fc",
      climates:["divine_realm","demon_realm","temperate"],
      severity:["dị tượng nhỏ","dị tượng vừa","dị tượng lớn","khải thị thần minh"],
      resourceHit:["mythological","energy"], creatureHit:["spirit_bird","phoenix"],
      baseChance:0.02, desc:"Năng lượng thần bí làm xáo trộn hệ sinh thái linh giới"
    },
  ];

  window.ecoDisasterData = {
    activeDisasters: [],
    history: [],
    totalDisasters: 0,
    suppressUntil: 0,
    tickCount: 0,
    initialized: false,
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ecoDisasterData)); } catch(e) {} }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) { var p = JSON.parse(d); Object.keys(p).forEach(function(k){ window.ecoDisasterData[k] = p[k]; }); }
    } catch(e) {}
  }

  window.ecoGetDisasterTypes   = function() { return ECO_DISASTER_TYPES; };
  window.ecoGetActiveDisasters = function() { return window.ecoDisasterData.activeDisasters; };
  window.ecoGetDisasterHistory = function() { return window.ecoDisasterData.history; };
  window.ecoGetDisasterStats   = function() {
    var byType = {};
    ECO_DISASTER_TYPES.forEach(function(dt) { byType[dt.id] = 0; });
    window.ecoDisasterData.history.forEach(function(h) { if (byType[h.typeId] !== undefined) byType[h.typeId]++; });
    return { total: window.ecoDisasterData.totalDisasters, active: window.ecoDisasterData.activeDisasters.length, byType: byType };
  };

  window.ecoTriggerDisaster = function(typeId, severityOverride) {
    var dt = ECO_DISASTER_TYPES.find(function(x){ return x.id === typeId; });
    if (!dt) return null;
    var sevIdx = severityOverride !== undefined ? severityOverride : Math.floor(Math.random() * 4);
    sevIdx = Math.min(3, Math.max(0, sevIdx));
    var event = {
      id: "eco_dis_" + Date.now(),
      typeId: typeId,
      name: dt.name,
      icon: dt.icon,
      color: dt.color,
      severity: dt.severity[sevIdx],
      severityIdx: sevIdx,
      year: window.year || 1,
      duration: (sevIdx + 1) * 8,
      ticksLeft: (sevIdx + 1) * 8,
      resolved: false,
      resourceDamage: {},
      creatureDamage: [],
    };
    // Apply damage
    var dmgMulti = [0.1, 0.2, 0.35, 0.5][sevIdx];
    dt.resourceHit.forEach(function(rid) {
      var r = window.ecoResourceData && window.ecoResourceData.resources[rid];
      if (r) {
        var dmg = Math.floor(r.current * dmgMulti);
        r.current = Math.max(0, r.current - dmg);
        event.resourceDamage[rid] = dmg;
      }
    });
    dt.creatureHit.forEach(function(cid) {
      var c = window.ecoCreatureData && window.ecoCreatureData.creatures[cid];
      if (c && c.alive) {
        var popDmg = Math.floor(c.population * dmgMulti);
        c.population = Math.max(0, c.population - popDmg);
        event.creatureDamage.push({ id:cid, name:c.name, damage:popDmg });
        c.extinctionRisk = c.population < 10 ? 0.5 : c.extinctionRisk;
        if (typeof window._checkExtinction === "function") window._checkExtinction(cid);
      }
    });
    window.ecoDisasterData.activeDisasters.push(event);
    window.ecoDisasterData.totalDisasters++;
    window.ecoDisasterData.history.unshift({ typeId:typeId, name:dt.name, icon:dt.icon, severity:event.severity, year:event.year });
    if (window.ecoDisasterData.history.length > 40) window.ecoDisasterData.history.pop();
    // Timeline + Memory
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year||1, type:"disaster", title:"Thiên tai: " + dt.name + " [" + event.severity + "]", color: dt.color });
    }
    if (typeof window.wmeAddMemory === "function" && sevIdx >= 2) {
      window.wmeAddMemory({ year:window.year||1, category:"disaster", title:dt.name + " " + event.severity, content:dt.desc + " — Mức độ: " + event.severity });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type:"danger", icon:dt.icon, title:"Thiên tai " + dt.name + " cấp " + (sevIdx+1), year:window.year||1 });
    }
    save();
    return event;
  };

  function _autoTrigger() {
    if (window.ecoDisasterData.tickCount < window.ecoDisasterData.suppressUntil) return;
    var climate = (typeof window.ecoClimateData !== "undefined") ? window.ecoClimateData.climate : "temperate";
    // Adjust base chance by V43 age
    var ageMulti = 1.0;
    if (typeof window.waeGetCurrentAge === "function") {
      var age = window.waeGetCurrentAge();
      if (age && age.id === "chaos") ageMulti = 2.5;
      else if (age && age.id === "golden") ageMulti = 0.4;
      else if (age && age.id === "divine") ageMulti = 0.6;
    }
    ECO_DISASTER_TYPES.forEach(function(dt) {
      if (dt.climates.indexOf(climate) === -1 && Math.random() > 0.2) return;
      var chance = dt.baseChance * ageMulti;
      if (Math.random() < chance) {
        window.ecoTriggerDisaster(dt.id);
        window.ecoDisasterData.suppressUntil = window.ecoDisasterData.tickCount + 30;
      }
    });
  }

  function _tick() {
    window.ecoDisasterData.tickCount++;
    // Resolve active disasters
    window.ecoDisasterData.activeDisasters = window.ecoDisasterData.activeDisasters.filter(function(d) {
      d.ticksLeft--;
      if (d.ticksLeft <= 0) { d.resolved = true; return false; }
      return true;
    });
    // Auto-trigger every 20 ticks
    if (window.ecoDisasterData.tickCount % 20 === 0) _autoTrigger();
    if (window.ecoDisasterData.tickCount % 60 === 0) save();
  }

  function init() {
    load();
    window.ecoDisasterData.initialized = true;
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); _tick(); };
    console.log("[EcoDisasterEngine V45] 🌪️ Khởi động — 5 loại thiên tai hệ sinh thái sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4200); });
  } else {
    setTimeout(init, 4200);
  }
})();
