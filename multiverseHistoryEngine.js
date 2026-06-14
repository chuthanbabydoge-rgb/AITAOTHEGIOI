(function() {
  "use strict";
  var SAVE_KEY = "cgv6_multiverse_history_v80";

  var MULTIVERSE_ERA_TYPES = [
    { id: "genesis",     label: "Kỷ Nguyên Sáng Thế",    icon: "✨", desc: "Các thế giới mới được tạo ra hàng loạt" },
    { id: "expansion",   label: "Kỷ Nguyên Bành Trướng",  icon: "🌌", desc: "Đế quốc liên thế giới mở rộng không ngừng" },
    { id: "contact",     label: "Kỷ Nguyên Tiếp Xúc",     icon: "🤝", desc: "Lần đầu các thế giới khám phá lẫn nhau" },
    { id: "conflict",    label: "Kỷ Nguyên Đại Chiến",    icon: "⚔️",  desc: "Chiến tranh giữa các thế giới bùng nổ" },
    { id: "harmony",     label: "Kỷ Nguyên Hòa Hợp",      icon: "🕊️",  desc: "Hòa bình và thịnh vượng lan khắp đa vũ trụ" },
    { id: "collapse",    label: "Kỷ Nguyên Sụp Đổ",       icon: "💀", desc: "Một phần đa vũ trụ rơi vào hỗn loạn" },
    { id: "renaissance", label: "Kỷ Nguyên Phục Hưng",    icon: "🌅", desc: "Sau sụp đổ, văn minh mới nổi lên" }
  ];

  var EVENT_TYPES = [
    { id: "world_born",        label: "Thế Giới Ra Đời",         icon: "🌟" },
    { id: "world_died",        label: "Thế Giới Diệt Vong",       icon: "💀" },
    { id: "empire_formed",     label: "Đế Quốc Liên Thế Giới",   icon: "👑" },
    { id: "legend_crossed",    label: "Anh Hùng Vượt Biên Giới", icon: "🦸" },
    { id: "belief_spread",     label: "Đức Tin Lan Rộng",        icon: "⛪" },
    { id: "portal_opened",     label: "Cổng Thần Mở",            icon: "🌀" },
    { id: "era_transition",    label: "Kỷ Nguyên Chuyển Giao",   icon: "⏳" },
    { id: "cluster_war",       label: "Cụm Vũ Trụ Đại Chiến",    icon: "💥" }
  ];

  window.multiverseHistoryV80Data = {
    currentEra: { id: "genesis", label: "Kỷ Nguyên Sáng Thế", icon: "✨", startYear: 1 },
    eraHistory: [],
    events: [],
    crossWorldEmpires: [],
    legends: [],
    totalEvents: 0,
    multiverseYear: 0,
    lastEventYear: 0
  };

  function save() {
    try {
      var compact = {
        currentEra: window.multiverseHistoryV80Data.currentEra,
        eraHistory: window.multiverseHistoryV80Data.eraHistory.slice(-10),
        events: window.multiverseHistoryV80Data.events.slice(-30),
        crossWorldEmpires: window.multiverseHistoryV80Data.crossWorldEmpires.slice(-10),
        legends: window.multiverseHistoryV80Data.legends.slice(-15),
        totalEvents: window.multiverseHistoryV80Data.totalEvents,
        multiverseYear: window.multiverseHistoryV80Data.multiverseYear,
        lastEventYear: window.multiverseHistoryV80Data.lastEventYear
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.multiverseHistoryV80Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.mhist80RecordEvent = function(typeId, title, worldsInvolved, detail) {
    var data = window.multiverseHistoryV80Data;
    var type = EVENT_TYPES.find(function(t) { return t.id === typeId; }) || EVENT_TYPES[0];
    var year = window.year || 1;
    var event = {
      id: "mev_" + Date.now(),
      year: year,
      multiverseYear: data.multiverseYear,
      type: type.id,
      typeLabel: type.label,
      typeIcon: type.icon,
      title: title,
      worlds: worldsInvolved || [],
      detail: detail || "",
      era: data.currentEra.label
    };
    data.events.push(event);
    if (data.events.length > 30) data.events.shift();
    data.totalEvents++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "multiverse_history", title: type.icon + " [Đa VT] " + title, color: "#9b59b6" });
    }
    save();
    return event;
  };

  window.mhist80TransitionEra = function(newEraId) {
    var data = window.multiverseHistoryV80Data;
    var era = MULTIVERSE_ERA_TYPES.find(function(e) { return e.id === newEraId; });
    if (!era) return;
    var year = window.year || 1;
    data.eraHistory.push({ era: data.currentEra, endYear: year });
    data.currentEra = { id: era.id, label: era.label, icon: era.icon, desc: era.desc, startYear: year };
    window.mhist80RecordEvent("era_transition", era.icon + " Chuyển sang " + era.label + ": " + era.desc, [], "");
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: year, category: "multiverse", title: era.icon + " Kỷ Nguyên Mới: " + era.label, content: era.desc });
    }
    save();
    return era;
  };

  window.mhist80FormCrossWorldEmpire = function(leaderWorld, memberWorlds, empireType) {
    var data = window.multiverseHistoryV80Data;
    var seed = seedHash(leaderWorld + (window.year || 1));
    var nameParts = ["Đại", "Thần", "Thiên", "Hùng", "Vĩnh"];
    var nameSuffix = ["Đế Quốc", "Liên Bang", "Vương Quốc", "Liên Minh"];
    var empName = nameParts[seed % nameParts.length] + " " + leaderWorld + " " + nameSuffix[(seed * 3) % nameSuffix.length];
    var empire = {
      id: "emp_" + Date.now(),
      name: empName,
      leader: leaderWorld,
      members: memberWorlds || [leaderWorld],
      type: empireType || "military",
      foundedYear: window.year || 1,
      power: (memberWorlds ? memberWorlds.length : 1) * 15,
      dissolved: false
    };
    data.crossWorldEmpires.push(empire);
    if (data.crossWorldEmpires.length > 10) data.crossWorldEmpires.shift();
    window.mhist80RecordEvent("empire_formed", "👑 " + empName + " thành lập — " + (memberWorlds ? memberWorlds.length : 1) + " thế giới", memberWorlds, "");
    save();
    return empire;
  };

  window.mhist80RecordLegend = function(heroName, homeWorld, crossedTo, legendTitle) {
    var data = window.multiverseHistoryV80Data;
    var year = window.year || 1;
    var legend = {
      id: "leg_" + Date.now(),
      year: year,
      heroName: heroName,
      homeWorld: homeWorld,
      crossedTo: crossedTo,
      title: legendTitle || "Anh hùng " + heroName + " — " + homeWorld + " → " + crossedTo,
      fame: 30 + Math.floor(Math.random() * 70)
    };
    data.legends.push(legend);
    if (data.legends.length > 15) data.legends.shift();
    window.mhist80RecordEvent("legend_crossed", "🦸 " + heroName + " từ " + homeWorld + " trở thành huyền thoại tại " + crossedTo, [homeWorld, crossedTo], legendTitle);
    save();
    return legend;
  };

  window.mhist80GetCurrentEra = function() { return window.multiverseHistoryV80Data.currentEra; };
  window.mhist80GetEvents = function(limit) { return window.multiverseHistoryV80Data.events.slice(-(limit || 10)).reverse(); };
  window.mhist80GetEmpires = function() { return window.multiverseHistoryV80Data.crossWorldEmpires.filter(function(e) { return !e.dissolved; }); };
  window.mhist80GetLegends = function() { return window.multiverseHistoryV80Data.legends.slice().reverse(); };
  window.mhist80GetStats = function() {
    var d = window.multiverseHistoryV80Data;
    return { currentEra: d.currentEra.label, eraCount: d.eraHistory.length + 1, totalEvents: d.totalEvents, empires: d.crossWorldEmpires.filter(function(e) { return !e.dissolved; }).length, legends: d.legends.length };
  };
  window.MHIST80_ERAS = MULTIVERSE_ERA_TYPES;
  window.MHIST80_EVENTS = EVENT_TYPES;

  function autoHistory() {
    var data = window.multiverseHistoryV80Data;
    var year = window.year || 1;
    if (year - data.lastEventYear < 200) return;
    data.lastEventYear = year;
    data.multiverseYear++;

    var worlds = typeof window.mevo80GetAlive === "function" ? window.mevo80GetAlive() : [];
    if (worlds.length === 0) return;

    // Auto era transition every ~5 multiverse years
    if (data.multiverseYear > 0 && data.multiverseYear % 5 === 0) {
      var seed = seedHash("era" + data.multiverseYear);
      var eras = MULTIVERSE_ERA_TYPES.filter(function(e) { return e.id !== data.currentEra.id; });
      if (eras.length > 0) window.mhist80TransitionEra(eras[seed % eras.length].id);
    }

    // Random cross-world event
    var roll = Math.random();
    if (roll < 0.3 && worlds.length >= 2) {
      // Empire
      var leader = worlds[Math.floor(Math.random() * worlds.length)];
      var others = worlds.filter(function(w) { return w.name !== leader.name; }).slice(0, 2).map(function(w) { return w.name; });
      if (others.length > 0) window.mhist80FormCrossWorldEmpire(leader.name, [leader.name].concat(others));
    } else if (roll < 0.5) {
      // Legend
      if (worlds.length >= 2) {
        var hero = worlds[Math.floor(Math.random() * worlds.length)];
        var dest = worlds[Math.floor(Math.random() * worlds.length)];
        if (hero.name !== dest.name) {
          var heroNames = ["Thần Kiếm Vô Song", "Đại Chiến Thần", "Huyền Bí Sứ Giả", "Thiên Tài Triết Nhân", "Chiến Thần Bất Diệt"];
          var seed2 = Math.floor(Math.random() * heroNames.length);
          window.mhist80RecordLegend(heroNames[seed2], hero.name, dest.name);
        }
      }
    } else if (roll < 0.65) {
      // World born event
      window.mhist80RecordEvent("world_born", "🌟 Thế giới mới xuất hiện trong đa vũ trụ", [], "Sự ra đời kỳ diệu từ năng lượng nguyên thủy");
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.005) autoHistory();
    };
    console.log("[MultiverseHistoryV80] 📚 Lịch Sử Đa Vũ Trụ khởi động — 7 kỷ nguyên · 8 loại sự kiện · Đế quốc liên thế giới · Anh hùng xuyên chiều sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21400); });
  } else {
    setTimeout(init, 21400);
  }
})();
