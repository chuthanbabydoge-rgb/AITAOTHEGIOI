(function() {
  "use strict";
  var SAVE_KEY = "cgv6_multiverse_evo_v80";

  var UNIVERSE_TYPES = [
    { id: "standard",    label: "Bình Thường",     icon: "🌍", desc: "Thế giới cân bằng, đa dạng dân tộc" },
    { id: "magical",     label: "Huyền Thuật",      icon: "✨", desc: "Năng lượng phép thuật thấm vào vạn vật" },
    { id: "technological", label: "Công Nghệ",     icon: "⚙️",  desc: "Khoa học và kỹ thuật vượt trội" },
    { id: "spiritual",   label: "Tâm Linh",        icon: "🌀", desc: "Thần thánh hiện diện rõ ràng" },
    { id: "primordial",  label: "Nguyên Thủy",      icon: "🦕", desc: "Thế giới hoang sơ chưa khai hóa" },
    { id: "dying",       label: "Tàn Lụi",          icon: "💀", desc: "Nền văn minh đang sụp đổ" },
    { id: "golden",      label: "Hoàng Kim",        icon: "👑", desc: "Kỷ nguyên vàng tột đỉnh" },
    { id: "chaotic",     label: "Hỗn Loạn",        icon: "⚡", desc: "Không có trật tự, quyền lực thay đổi liên tục" }
  ];

  var EVOLUTION_STAGES = [
    { id: "nascent",     label: "Sơ Khai",     icon: "🌱", threshold: 0 },
    { id: "developing",  label: "Phát Triển",  icon: "🌿", threshold: 100 },
    { id: "flourishing", label: "Thịnh Vượng", icon: "🌳", threshold: 300 },
    { id: "dominant",    label: "Cường Thịnh", icon: "🌟", threshold: 600 },
    { id: "transcendent",label: "Siêu Việt",   icon: "✨", threshold: 1000 },
    { id: "declining",   label: "Suy Tàn",     icon: "🍂", threshold: -1 }
  ];

  window.multiverseEvoV80Data = {
    worlds: {},
    totalRegistered: 0,
    multiverseAge: 0,
    lastEvoYear: 0,
    dominantWorld: null,
    totalInfluenceExchanges: 0
  };

  function save() {
    try {
      var compact = { worlds: window.multiverseEvoV80Data.worlds, totalRegistered: window.multiverseEvoV80Data.totalRegistered, multiverseAge: window.multiverseEvoV80Data.multiverseAge, lastEvoYear: window.multiverseEvoV80Data.lastEvoYear, dominantWorld: window.multiverseEvoV80Data.dominantWorld, totalInfluenceExchanges: window.multiverseEvoV80Data.totalInfluenceExchanges };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.multiverseEvoV80Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.mevo80RegisterWorld = function(worldName, worldType) {
    var data = window.multiverseEvoV80Data;
    if (data.worlds[worldName]) return data.worlds[worldName];
    var seed = seedHash(worldName);
    var type = worldType ? UNIVERSE_TYPES.find(function(t) { return t.id === worldType; }) : UNIVERSE_TYPES[seed % UNIVERSE_TYPES.length];
    if (!type) type = UNIVERSE_TYPES[seed % UNIVERSE_TYPES.length];
    var world = {
      id: "world_" + worldName.replace(/\s+/g, "_"),
      name: worldName,
      type: type.id,
      typeLabel: type.label,
      typeIcon: type.icon,
      typeDesc: type.desc,
      evolutionScore: 10 + (seed % 50),
      stage: "nascent",
      stageLabel: "Sơ Khai",
      stageIcon: "🌱",
      age: 0,
      connections: [],
      receivedInfluences: [],
      sentInfluences: [],
      legends: [],
      clusterId: null,
      prestige: seed % 40,
      isAlive: true,
      registeredYear: window.year || 1
    };
    world = updateStage(world);
    data.worlds[worldName] = world;
    data.totalRegistered++;
    save();
    return world;
  };

  function updateStage(world) {
    var score = world.evolutionScore;
    var stage = EVOLUTION_STAGES[0];
    for (var i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (EVOLUTION_STAGES[i].threshold >= 0 && score >= EVOLUTION_STAGES[i].threshold) {
        stage = EVOLUTION_STAGES[i];
        break;
      }
    }
    world.stage = stage.id;
    world.stageLabel = stage.label;
    world.stageIcon = stage.icon;
    return world;
  }

  window.mevo80Evolve = function(worldName, amount) {
    var data = window.multiverseEvoV80Data;
    var world = data.worlds[worldName];
    if (!world || !world.isAlive) return;
    world.evolutionScore = Math.max(0, world.evolutionScore + amount);
    world.age++;
    world = updateStage(world);
    data.worlds[worldName] = world;
    // Track dominant world
    var allWorlds = Object.values(data.worlds).filter(function(w) { return w.isAlive; });
    if (allWorlds.length > 0) {
      var top = allWorlds.reduce(function(a, b) { return a.evolutionScore > b.evolutionScore ? a : b; });
      data.dominantWorld = top.name;
    }
    save();
    return world;
  };

  window.mevo80ConnectWorlds = function(worldA, worldB) {
    var data = window.multiverseEvoV80Data;
    var wA = data.worlds[worldA], wB = data.worlds[worldB];
    if (!wA || !wB) return false;
    if (!wA.connections.includes(worldB)) wA.connections.push(worldB);
    if (!wB.connections.includes(worldA)) wB.connections.push(worldA);
    if (wA.connections.length > 8) wA.connections.shift();
    if (wB.connections.length > 8) wB.connections.shift();
    data.totalInfluenceExchanges++;
    save();
    return true;
  };

  window.mevo80GetWorld = function(name) { return window.multiverseEvoV80Data.worlds[name] || null; };
  window.mevo80GetAll = function() { return Object.values(window.multiverseEvoV80Data.worlds); };
  window.mevo80GetAlive = function() { return Object.values(window.multiverseEvoV80Data.worlds).filter(function(w) { return w.isAlive; }); };
  window.mevo80GetStats = function() {
    var d = window.multiverseEvoV80Data;
    var worlds = Object.values(d.worlds);
    var alive = worlds.filter(function(w) { return w.isAlive; });
    var byType = {};
    alive.forEach(function(w) { byType[w.typeLabel] = (byType[w.typeLabel] || 0) + 1; });
    return { total: worlds.length, alive: alive.length, dominantWorld: d.dominantWorld, totalInfluenceExchanges: d.totalInfluenceExchanges, byType: byType };
  };
  window.MEVO80_TYPES = UNIVERSE_TYPES;
  window.MEVO80_STAGES = EVOLUTION_STAGES;

  function autoSeedWorlds() {
    var data = window.multiverseEvoV80Data;
    var year = window.year || 1;
    if (year - data.lastEvoYear < 150) return;
    data.lastEvoYear = year;
    data.multiverseAge++;

    // Auto-register from existing worlds
    if (window.world && window.world.name) window.mevo80RegisterWorld(window.world.name);

    // Auto-evolve existing
    var worlds = Object.values(data.worlds).filter(function(w) { return w.isAlive; });
    worlds.forEach(function(w) {
      var gain = w.type === "golden" ? 8 : w.type === "dying" ? -3 : 3 + Math.floor(Math.random() * 5);
      window.mevo80Evolve(w.name, gain);
    });

    // Auto-connect nearby worlds
    if (worlds.length >= 2) {
      var a = worlds[Math.floor(Math.random() * worlds.length)];
      var b = worlds[Math.floor(Math.random() * worlds.length)];
      if (a.name !== b.name && !a.connections.includes(b.name)) window.mevo80ConnectWorlds(a.name, b.name);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.005) autoSeedWorlds();
    };
    if (window.world && window.world.name) setTimeout(function() { window.mevo80RegisterWorld(window.world.name); }, 3000);
    console.log("[MultiverseEvolutionV80] 🌌 Đa Vũ Trụ Tiến Hóa khởi động — 8 loại thế giới · 6 giai đoạn · Auto-connect · Dominant tracking sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21100); });
  } else {
    setTimeout(init, 21100);
  }
})();
