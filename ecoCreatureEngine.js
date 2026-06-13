(function() {
  "use strict";
  const SAVE_KEY = "cgv6_eco_creature_v45";

  const CREATURE_ARCHETYPES = [
    { id:"wolf",       name:"Sói Rừng",        icon:"🐺", climate:["temperate","highland"],          era:["primitive","medieval"],  rarity:"common",    role:"predator",  power:30,  foodNeed:"deer" },
    { id:"deer",       name:"Nai Rừng",         icon:"🦌", climate:["temperate","tropical"],          era:["primitive","medieval"],  rarity:"common",    role:"prey",      power:10,  foodNeed:"grass" },
    { id:"dragon",     name:"Long Tộc",         icon:"🐉", climate:["highland","divine_realm"],       era:["cultivation","divine"],  rarity:"legendary", role:"apex",      power:100, foodNeed:"prey" },
    { id:"phoenix",    name:"Phượng Hoàng",     icon:"🦅", climate:["divine_realm","tropical"],       era:["divine","golden"],       rarity:"legendary", role:"guardian",  power:90,  foodNeed:"energy" },
    { id:"kraken",     name:"Kraken Đại Dương", icon:"🦑", climate:["tropical","temperate"],          era:["primitive","exploration"],rarity:"epic",      role:"apex",      power:80,  foodNeed:"fish" },
    { id:"sandworm",   name:"Sâu Sa Mạc",       icon:"🐛", climate:["desert"],                        era:["primitive","medieval"],  rarity:"rare",      role:"predator",  power:60,  foodNeed:"mineral" },
    { id:"icebear",    name:"Gấu Băng",         icon:"🐻", climate:["frozen"],                        era:["primitive","medieval"],  rarity:"common",    role:"predator",  power:50,  foodNeed:"fish" },
    { id:"thunderbird",name:"Điểu Lôi",         icon:"⚡", climate:["highland","temperate"],           era:["cultivation","divine"],  rarity:"epic",      role:"predator",  power:70,  foodNeed:"prey" },
    { id:"fox_spirit", name:"Hồ Ly Tinh",       icon:"🦊", climate:["temperate","divine_realm"],      era:["cultivation","divine"],  rarity:"rare",      role:"trickster", power:55,  foodNeed:"prey" },
    { id:"demon_beast",name:"Yêu Thú Ma Giới",  icon:"👹", climate:["demon_realm"],                   era:["chaos","darkness"],      rarity:"epic",      role:"predator",  power:85,  foodNeed:"prey" },
    { id:"unicorn",    name:"Kỳ Lân",           icon:"🦄", climate:["divine_realm","temperate"],      era:["golden","divine"],       rarity:"legendary", role:"guardian",  power:75,  foodNeed:"grass" },
    { id:"serpent",    name:"Đại Xà Thần",      icon:"🐍", climate:["tropical","desert"],             era:["primitive","cultivation"],rarity:"rare",      role:"predator",  power:65,  foodNeed:"prey" },
    { id:"mammoth",    name:"Voi Ma Mút",       icon:"🦣", climate:["frozen","highland"],             era:["primitive"],             rarity:"common",    role:"prey",      power:40,  foodNeed:"grass" },
    { id:"spirit_bird",name:"Linh Điểu",        icon:"🕊️", climate:["divine_realm","temperate"],      era:["divine","golden"],       rarity:"rare",      role:"guardian",  power:45,  foodNeed:"energy" },
    { id:"lava_golem", name:"Dung Nham Tinh",   icon:"🌋", climate:["demon_realm","highland"],        era:["chaos","cultivation"],   rarity:"epic",      role:"predator",  power:80,  foodNeed:"mineral" },
    { id:"sea_turtle", name:"Hải Quy Thần",     icon:"🐢", climate:["tropical","temperate"],          era:["primitive","exploration"],rarity:"rare",      role:"prey",      power:35,  foodNeed:"grass" },
    { id:"wind_spirit",name:"Phong Linh",       icon:"💨", climate:["highland","temperate"],           era:["cultivation","divine"],  rarity:"epic",      role:"guardian",  power:60,  foodNeed:"energy" },
    { id:"mimic_plant", name:"Cây Bắt Mồi",    icon:"🌺", climate:["tropical","demon_realm"],        era:["primitive","chaos"],     rarity:"rare",      role:"predator",  power:25,  foodNeed:"prey" },
    { id:"goldfish",   name:"Kim Ngư Tiên",     icon:"🐟", climate:["tropical","temperate"],          era:["divine","golden"],       rarity:"legendary", role:"guardian",  power:50,  foodNeed:"energy" },
    { id:"shadow_wolf",name:"Ảnh Lang Thần",    icon:"🌑", climate:["demon_realm","temperate"],       era:["darkness","chaos"],      rarity:"epic",      role:"predator",  power:78,  foodNeed:"prey" },
  ];

  function _makeCreatureEntry(arc) {
    return {
      id: arc.id,
      name: arc.name,
      icon: arc.icon,
      population: Math.floor(Math.random() * 80) + 20,
      maxPop: 500,
      alive: true,
      extinctionRisk: 0,
      domainRace: null,
      lastHunt: 0,
      huntCount: 0,
      foodChainScore: 0,
    };
  }

  window.ecoCreatureData = {
    creatures: {},
    foodChain: [],
    extinctions: [],
    tickCount: 0,
    initialized: false,
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ecoCreatureData)); } catch(e) {} }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        Object.keys(p).forEach(function(k){ window.ecoCreatureData[k] = p[k]; });
      }
    } catch(e) {}
  }

  window.ecoGetCreatures      = function() { return Object.values(window.ecoCreatureData.creatures); };
  window.ecoGetCreature       = function(id) { return window.ecoCreatureData.creatures[id] || null; };
  window.ecoGetAliveCreatures = function() { return Object.values(window.ecoCreatureData.creatures).filter(function(c){ return c.alive; }); };
  window.ecoGetCreaturesByClimate = function(climateId) {
    return CREATURE_ARCHETYPES.filter(function(a){ return a.climate.indexOf(climateId) !== -1; })
      .map(function(a){ return window.ecoCreatureData.creatures[a.id]; })
      .filter(Boolean);
  };
  window.ecoGetCreaturesByEra = function(eraId) {
    return CREATURE_ARCHETYPES.filter(function(a){ return a.era.indexOf(eraId) !== -1; })
      .map(function(a){ return window.ecoCreatureData.creatures[a.id]; })
      .filter(Boolean);
  };
  window.ecoGetFoodChain      = function() { return window.ecoCreatureData.foodChain; };
  window.ecoGetExtinctions    = function() { return window.ecoCreatureData.extinctions; };

  window.ecoHuntCreature = function(predId, preyId) {
    var predator = window.ecoCreatureData.creatures[predId];
    var prey     = window.ecoCreatureData.creatures[preyId];
    if (!predator || !prey || !predator.alive || !prey.alive) return false;
    var kill = Math.floor(Math.random() * 5) + 1;
    prey.population = Math.max(0, prey.population - kill);
    predator.population = Math.min(predator.maxPop, predator.population + Math.floor(kill * 0.5));
    predator.lastHunt = window.year || 1;
    predator.huntCount++;
    prey.extinctionRisk = prey.population < 10 ? 0.4 : (prey.population < 30 ? 0.15 : 0.0);
    _checkExtinction(preyId);
    return true;
  };

  window.ecoGetCreatureStats = function() {
    var alive = 0, extinct = 0, endangered = 0, totalPop = 0;
    Object.values(window.ecoCreatureData.creatures).forEach(function(c) {
      if (c.alive) { alive++; totalPop += c.population; if (c.extinctionRisk > 0.2) endangered++; }
      else extinct++;
    });
    return { alive:alive, extinct:extinct, endangered:endangered, totalPop:totalPop, total: alive+extinct };
  };

  function _checkExtinction(id) {
    var c = window.ecoCreatureData.creatures[id];
    if (!c || !c.alive) return;
    if (c.population <= 0) {
      c.alive = false;
      c.population = 0;
      window.ecoCreatureData.extinctions.push({ id:id, name:c.name, year:window.year||1 });
      if (typeof window.htAddEvent === "function") window.htAddEvent({ year:window.year||1, type:"nature", title:"Tuyệt chủng: " + c.name + " " + c.icon, color:"#ef4444" });
      if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year:window.year||1, category:"nature", title:c.name + " tuyệt chủng", content:"Sinh vật " + c.name + " đã biến mất khỏi thế giới vĩnh viễn." });
    }
  }

  function _initCreatures() {
    var climate = (typeof window.ecoClimateData !== "undefined") ? window.ecoClimateData.climate : "temperate";
    var currentEra = null;
    if (typeof window.waeGetCurrentAge === "function") {
      var age = window.waeGetCurrentAge();
      if (age) currentEra = age.id;
    }
    CREATURE_ARCHETYPES.forEach(function(arc) {
      if (!window.ecoCreatureData.creatures[arc.id]) {
        var climatMatch = arc.climate.indexOf(climate) !== -1;
        var eraMatch    = !currentEra || arc.era.indexOf(currentEra) !== -1;
        var entry = _makeCreatureEntry(arc);
        // Start with fewer creatures if not in matching climate/era
        if (!climatMatch) entry.population = Math.floor(entry.population * 0.3);
        if (!eraMatch)    entry.population = Math.floor(entry.population * 0.5);
        window.ecoCreatureData.creatures[arc.id] = entry;
      }
    });
    // Assign domain races from V44
    if (typeof window.recGetAll === "function") {
      var races = window.recGetAll();
      races.forEach(function(race) {
        // Map race to its associated creature type
        var mapping = { human:"deer", elf:"fox_spirit", demon:"demon_beast", dragon:"dragon", mech:"lava_golem", spirit:"spirit_bird", beast:"wolf", sea:"kraken" };
        var cid = mapping[race.id];
        if (cid && window.ecoCreatureData.creatures[cid]) {
          window.ecoCreatureData.creatures[cid].domainRace = race.id;
        }
      });
    }
    // Build food chain
    _buildFoodChain();
  }

  function _buildFoodChain() {
    window.ecoCreatureData.foodChain = [];
    CREATURE_ARCHETYPES.forEach(function(arc) {
      if (arc.role === "predator" || arc.role === "apex") {
        var preyArc = CREATURE_ARCHETYPES.find(function(x){ return x.id === arc.foodNeed; });
        if (preyArc) {
          window.ecoCreatureData.foodChain.push({ predator:arc.id, prey:preyArc.id, predIcon:arc.icon, preyIcon:preyArc.icon, predName:arc.name, preyName:preyArc.name });
        }
      }
    });
  }

  function _tick() {
    window.ecoCreatureData.tickCount++;
    if (window.ecoCreatureData.tickCount % 15 !== 0) return;
    // Natural population changes
    var climate = (typeof window.ecoClimateData !== "undefined") ? window.ecoClimateData.climate : "temperate";
    CREATURE_ARCHETYPES.forEach(function(arc) {
      var c = window.ecoCreatureData.creatures[arc.id];
      if (!c || !c.alive) return;
      var inClimate = arc.climate.indexOf(climate) !== -1;
      var growthRate = inClimate ? 0.05 : -0.03; // grow if in right climate
      c.population = Math.max(0, Math.min(c.maxPop, Math.floor(c.population * (1 + growthRate) + (Math.random() < 0.3 ? 1 : 0))));
      c.extinctionRisk = c.population < 5 ? 0.5 : c.population < 20 ? 0.2 : 0;
      _checkExtinction(arc.id);
    });
    // Auto food chain interactions
    window.ecoCreatureData.foodChain.forEach(function(link) {
      var pred = window.ecoCreatureData.creatures[link.predator];
      var prey = window.ecoCreatureData.creatures[link.prey];
      if (pred && prey && pred.alive && prey.alive && Math.random() < 0.3) {
        window.ecoHuntCreature(link.predator, link.prey);
      }
    });
    if (window.ecoCreatureData.tickCount % 75 === 0) save();
  }

  function init() {
    load();
    _initCreatures();
    window.ecoCreatureData.initialized = true;
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); _tick(); };
    console.log("[EcoCreatureEngine V45] 🦎 Khởi động — " + CREATURE_ARCHETYPES.length + " sinh vật · chuỗi thức ăn sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4100); });
  } else {
    setTimeout(init, 4100);
  }
})();
