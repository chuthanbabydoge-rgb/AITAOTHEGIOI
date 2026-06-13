(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_economy_v57";

  const CONTENT_TYPES = [
    { id: "race",    name: "Chủng Tộc",  icon: "👥", cp: 50,   baseIncome: 10 },
    { id: "religion",name: "Tôn Giáo",   icon: "⛪", cp: 80,   baseIncome: 15 },
    { id: "hero",    name: "Anh Hùng",   icon: "🦸", cp: 60,   baseIncome: 12 },
    { id: "city",    name: "Thành Phố",  icon: "🏙️", cp: 40,   baseIncome: 8  },
    { id: "item",    name: "Vật Phẩm",   icon: "⚔️", cp: 30,   baseIncome: 5  },
    { id: "event",   name: "Sự Kiện",    icon: "⚡", cp: 70,   baseIncome: 14 },
    { id: "world",   name: "Thế Giới",   icon: "🌍", cp: 200,  baseIncome: 50 },
    { id: "god",     name: "Thần Linh",  icon: "✨", cp: 150,  baseIncome: 35 },
    { id: "quest",   name: "Nhiệm Vụ",   icon: "📜", cp: 45,   baseIncome: 9  },
    { id: "guild",   name: "Bang Hội",   icon: "🏛️", cp: 100,  baseIncome: 20 },
    { id: "story",   name: "Câu Chuyện", icon: "📖", cp: 90,   baseIncome: 18 },
    { id: "template",name: "Template",   icon: "🗂️", cp: 300,  baseIncome: 75 }
  ];

  window.creatorEconData = {
    creatorPoints: 0,
    totalCPEarned: 0,
    passiveIncome: 0,
    passiveIncomeAccum: 0,
    contentCreated: {},
    contentUsageTotal: 0,
    creationLog: [],
    incomeLog: [],
    tick: 0,
    version: "V57"
  };

  CONTENT_TYPES.forEach(function(ct) {
    window.creatorEconData.contentCreated[ct.id] = 0;
  });

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.creatorEconData)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) { var p = JSON.parse(d); Object.assign(window.creatorEconData, p); } } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.ce57RecordCreation = function(contentType, contentName, creatorId) {
    var ct = CONTENT_TYPES.find(function(c) { return c.id === contentType; });
    if (!ct) return 0;

    window.creatorEconData.contentCreated[contentType] = (window.creatorEconData.contentCreated[contentType] || 0) + 1;
    window.creatorEconData.creatorPoints += ct.cp;
    window.creatorEconData.totalCPEarned += ct.cp;
    window.creatorEconData.passiveIncome += ct.baseIncome;

    var entry = {
      id: "ce_" + Date.now(),
      type: contentType, icon: ct.icon, name: contentName || (ct.name + " Mới"),
      cp: ct.cp, year: getYear(), creatorId: creatorId || "player"
    };
    window.creatorEconData.creationLog.unshift(entry);
    if (window.creatorEconData.creationLog.length > 100) window.creatorEconData.creationLog.length = 100;

    if (typeof window.crs57AddReputation === "function") window.crs57AddReputation(10, "Tạo " + ct.name);
    if (typeof window.cre57CheckMilestones === "function") window.cre57CheckMilestones();
    save();
    return ct.cp;
  };

  window.ce57SpendCP = function(amount) {
    if (window.creatorEconData.creatorPoints < amount) return false;
    window.creatorEconData.creatorPoints -= amount;
    save();
    return true;
  };

  window.ce57GetStats = function() {
    var total = Object.values(window.creatorEconData.contentCreated).reduce(function(s, v) { return s + v; }, 0);
    return {
      cp: window.creatorEconData.creatorPoints,
      totalCPEarned: window.creatorEconData.totalCPEarned,
      passiveIncome: window.creatorEconData.passiveIncome,
      totalContent: total,
      breakdown: window.creatorEconData.contentCreated,
      contentUsage: window.creatorEconData.contentUsageTotal,
      passiveAccum: window.creatorEconData.passiveIncomeAccum
    };
  };

  window.ce57GetContentTypes = function() { return CONTENT_TYPES; };
  window.ce57GetCreationLog = function(limit) { return window.creatorEconData.creationLog.slice(0, limit || 20); };

  function autoDetectCreations() {
    var detected = 0;
    if (typeof window.npcs !== "undefined" && Array.isArray(window.npcs)) {
      var npcCount = window.npcs.length;
      if (!window.creatorEconData._lastNpcCount) window.creatorEconData._lastNpcCount = 0;
      if (npcCount > window.creatorEconData._lastNpcCount) {
        var diff = npcCount - window.creatorEconData._lastNpcCount;
        for (var i = 0; i < Math.min(diff, 5); i++) {
          var npc = window.npcs[window.creatorEconData._lastNpcCount + i];
          if (npc) window.ce57RecordCreation("hero", npc.name || "NPC", "auto");
        }
        window.creatorEconData._lastNpcCount = npcCount;
        detected += diff;
      }
    }
    if (typeof window.creatorGodFactoryData !== "undefined" && window.creatorGodFactoryData.created) {
      var godCount = window.creatorGodFactoryData.created.length;
      if (!window.creatorEconData._lastGodCount) window.creatorEconData._lastGodCount = 0;
      if (godCount > window.creatorEconData._lastGodCount) {
        window.ce57RecordCreation("god", "Thần Mới", "player");
        window.creatorEconData._lastGodCount = godCount;
        detected++;
      }
    }
    return detected;
  }

  function tickCreatorEcon() {
    window.creatorEconData.tick++;
    if (window.creatorEconData.passiveIncome > 0) {
      var income = Math.floor(window.creatorEconData.passiveIncome / 100);
      if (income > 0) {
        window.creatorEconData.creatorPoints += income;
        window.creatorEconData.passiveIncomeAccum += income;
      }
    }
    if (window.creatorEconData.tick % 50 === 0) autoDetectCreations();
    if (window.creatorEconData.tick % 120 === 0) save();
  }

  window.creatorEconomyV57Tick = function() { tickCreatorEcon(); };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.creatorEconomyV57Tick(); };
    save();
    console.log("[CreatorEconomyEngine V57] 💰 Kinh Tế Sáng Tạo — 12 loại nội dung · CP system · Passive income · " + window.creatorEconData.creatorPoints + " CP sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9500); });
  } else { setTimeout(init, 9500); }
})();
