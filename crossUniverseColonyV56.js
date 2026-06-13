(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cx_colony_v56";

  const COLONY_TYPES = [
    { id: "outpost",    name: "🏕️ Tiền Đồn",         cost: 2000,    upkeep: 50,   income: 100,   pop: 100,   desc: "Điểm dừng chân nhỏ" },
    { id: "settlement", name: "🏘️ Khu Định Cư",       cost: 10000,   upkeep: 200,  income: 500,   pop: 500,   desc: "Khu dân cư nhỏ" },
    { id: "colony",     name: "🏙️ Thuộc Địa",         cost: 50000,   upkeep: 800,  income: 2000,  pop: 5000,  desc: "Thuộc địa đầy đủ" },
    { id: "province",   name: "🏰 Tỉnh Thành",        cost: 200000,  upkeep: 3000, income: 8000,  pop: 20000, desc: "Tỉnh thành lớn" },
    { id: "capital",    name: "👑 Thủ Phủ Liên VT",   cost: 1000000, upkeep: 10000,income: 30000, pop: 100000,desc: "Trung tâm đế quốc liên vũ trụ" }
  ];

  const COLONY_EVENTS = [
    { id: "revolt",     icon: "🔥", name: "Nổi Loạn",         effect: "income-50% · stability-20" },
    { id: "boom",       icon: "📈", name: "Bùng Nổ Kinh Tế",  effect: "income×2 (20 tick)" },
    { id: "plague",     icon: "💀", name: "Dịch Bệnh Lạ",     effect: "pop-30% · upkeep×2" },
    { id: "discovery",  icon: "💎", name: "Mỏ Tài Nguyên",    effect: "income+500 vĩnh viễn" },
    { id: "diplomatic", icon: "🤝", name: "Quan Hệ Tốt",      effect: "stability+30 · income+20%" }
  ];

  const AI_COLONIZERS = [
    "Đế Quốc Thiên Hà", "Liên Đoàn Vũ Trụ", "Hội Đồng Vô Cực",
    "Tông Môn Thần Long", "Bang Phái Thiên Địa", "Chủng Tộc Hỗn Mang"
  ];

  window.colonyV56Data = {
    playerColonies: [],
    aiColonies: [],
    colonyEvents: [],
    totalIncome: 0,
    totalUpkeep: 0,
    tick: 0,
    version: "V56"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.colonyV56Data)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.colonyV56Data, JSON.parse(d)); } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.col56FoundColony = function(universeId, universeName, colonyTypeId, colonyName) {
    var ctype = COLONY_TYPES.find(function(c) { return c.id === colonyTypeId; }) || COLONY_TYPES[0];
    var colony = {
      id: "col_" + Date.now(),
      universeId: universeId || "unknown",
      universeName: universeName || "Vũ Trụ Chưa Biết",
      type: ctype.id, typeName: ctype.name, typeIcon: ctype.name.split(" ")[0],
      name: colonyName || (ctype.name + " tại " + (universeName || "VT-?")),
      cost: ctype.cost, upkeep: ctype.upkeep, income: ctype.income,
      population: ctype.pop, stability: 70,
      totalIncome: 0, totalUpkeep: 0,
      foundedYear: getYear(),
      owner: "player", isActive: true,
      buffs: [], events: []
    };
    window.colonyV56Data.playerColonies.push(colony);
    if (typeof window.hrs55RecordEvent === "function") {
      window.hrs55RecordEvent({ category: "colony", icon: "🏕️", title: "Thành Lập: " + colony.name, detail: "Tại " + universeName, importance: 3 });
    }
    save();
    return { ok: true, colony: colony, msg: ctype.name + " '" + colony.name + "' đã thành lập tại " + (universeName || "Vũ Trụ Mới") + "!" };
  };

  window.col56UpgradeColony = function(colonyId) {
    var col = window.colonyV56Data.playerColonies.find(function(c) { return c.id === colonyId; });
    if (!col) return { ok: false, msg: "Không tìm thấy thuộc địa" };
    var idx = COLONY_TYPES.findIndex(function(c) { return c.id === col.type; });
    if (idx >= COLONY_TYPES.length - 1) return { ok: false, msg: "Đã đạt cấp tối đa" };
    var next = COLONY_TYPES[idx + 1];
    col.type = next.id; col.typeName = next.name; col.upkeep = next.upkeep;
    col.income = next.income; col.population = next.pop;
    save();
    return { ok: true, msg: "Nâng cấp lên " + next.name + "!" };
  };

  window.col56GetStats = function() {
    var pc = window.colonyV56Data.playerColonies.filter(function(c) { return c.isActive; });
    return {
      totalColonies: pc.length,
      totalIncome: window.colonyV56Data.totalIncome,
      totalUpkeep: window.colonyV56Data.totalUpkeep,
      netIncome: window.colonyV56Data.totalIncome - window.colonyV56Data.totalUpkeep,
      totalPopulation: pc.reduce(function(s, c) { return s + c.population; }, 0),
      aiColonies: window.colonyV56Data.aiColonies.length
    };
  };

  window.col56GetPlayerColonies = function() { return window.colonyV56Data.playerColonies; };
  window.col56GetRecentEvents = function(limit) { return window.colonyV56Data.colonyEvents.slice(0, limit || 20); };

  function spawnAIColonies() {
    if (window.colonyV56Data.aiColonies.length < 10 && Math.random() < 0.1) {
      var colType = COLONY_TYPES[Math.floor(Math.random() * 3)];
      var ai = AI_COLONIZERS[Math.floor(Math.random() * AI_COLONIZERS.length)];
      var entry = {
        id: "aicol_" + Date.now(),
        owner: ai, type: colType.id, typeName: colType.name,
        universeName: "Vũ Trụ-" + Math.floor(Math.random() * 999),
        foundedYear: getYear(), population: colType.pop
      };
      window.colonyV56Data.aiColonies.push(entry);
      if (window.colonyV56Data.aiColonies.length > 30) window.colonyV56Data.aiColonies.length = 30;
    }
  }

  function tickColonies() {
    var yr = getYear();
    window.colonyV56Data.playerColonies.forEach(function(col) {
      if (!col.isActive) return;
      col.totalIncome += col.income;
      col.totalUpkeep += col.upkeep;
      window.colonyV56Data.totalIncome += col.income;
      window.colonyV56Data.totalUpkeep += col.upkeep;

      col.stability = Math.max(10, Math.min(100, col.stability + (Math.random() * 2 - 1)));

      if (Math.random() < 0.003) {
        var ev = COLONY_EVENTS[Math.floor(Math.random() * COLONY_EVENTS.length)];
        var evEntry = { year: yr, colonyName: col.name, event: ev.name, effect: ev.effect, icon: ev.icon };
        window.colonyV56Data.colonyEvents.unshift(evEntry);
        col.events = col.events || [];
        col.events.unshift(evEntry);
        if (col.events.length > 10) col.events.length = 10;
        if (window.colonyV56Data.colonyEvents.length > 50) window.colonyV56Data.colonyEvents.length = 50;
        if (typeof window.waeAddAlert === "function") window.waeAddAlert(ev.icon + " Thuộc Địa " + col.name + ": " + ev.name);
      }
    });
    spawnAIColonies();
    if (window.colonyV56Data.tick % 100 === 0) save();
    window.colonyV56Data.tick++;
  }

  window.crossUniverseColonyV56Tick = function() { tickColonies(); };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.crossUniverseColonyV56Tick(); };
    save();
    console.log("[CrossUniverseColonyV56] 🏕️ Thuộc Địa Liên Vũ Trụ V56 — 5 loại · " + window.colonyV56Data.playerColonies.length + " thuộc địa · AI colonization sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9100); });
  } else { setTimeout(init, 9100); }
})();
