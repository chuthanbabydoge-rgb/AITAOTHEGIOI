(function() {
  "use strict";
  var SAVE_KEY = "cgv6_collective_memory_v79";

  var MEMORY_CATEGORIES = [
    { id: "war",        label: "Chiến Tranh",    icon: "⚔️",  color: "#e74c3c", importance: 3 },
    { id: "hero",       label: "Anh Hùng",       icon: "🦸", color: "#f1c40f", importance: 2 },
    { id: "enemy",      label: "Kẻ Thù",         icon: "💀", color: "#8e44ad", importance: 3 },
    { id: "disaster",   label: "Thảm Họa",       icon: "🌋", color: "#e67e22", importance: 2 },
    { id: "golden_age", label: "Kỷ Nguyên Vàng", icon: "✨", color: "#f39c12", importance: 3 },
    { id: "founding",   label: "Lập Quốc",       icon: "🏛️",  color: "#3498db", importance: 3 },
    { id: "betrayal",   label: "Phản Bội",       icon: "🗡️",  color: "#95a5a6", importance: 2 },
    { id: "alliance",   label: "Liên Minh",      icon: "🤝", color: "#2ecc71", importance: 1 },
    { id: "discovery",  label: "Khám Phá",       icon: "🔭", color: "#1abc9c", importance: 1 },
    { id: "plague",     label: "Đại Dịch",       icon: "☣️",  color: "#7f8c8d", importance: 2 }
  ];

  window.collectiveMemoryV79Data = {
    memories: {},
    totalMemories: 0,
    lastScanYear: 0
  };

  function save() {
    try {
      var compact = { memories: {}, totalMemories: window.collectiveMemoryV79Data.totalMemories, lastScanYear: window.collectiveMemoryV79Data.lastScanYear };
      Object.keys(window.collectiveMemoryV79Data.memories).forEach(function(k) {
        compact.memories[k] = window.collectiveMemoryV79Data.memories[k].slice(-30);
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.collectiveMemoryV79Data = JSON.parse(d);
    } catch(e) {}
  }

  window.cmem79Record = function(countryName, categoryId, title, detail, importance) {
    var data = window.collectiveMemoryV79Data;
    var cat = MEMORY_CATEGORIES.find(function(c) { return c.id === categoryId; }) || MEMORY_CATEGORIES[0];
    if (!data.memories[countryName]) data.memories[countryName] = [];
    var entry = {
      year: window.year || 1,
      category: cat.id,
      categoryLabel: cat.label,
      categoryIcon: cat.icon,
      color: cat.color,
      title: title,
      detail: detail || "",
      importance: importance || cat.importance,
      fade: 0
    };
    data.memories[countryName].unshift(entry);
    if (data.memories[countryName].length > 30) data.memories[countryName].length = 30;
    data.totalMemories++;
    save();
    return entry;
  };

  window.cmem79GetMemories = function(countryName, categoryId) {
    var mems = window.collectiveMemoryV79Data.memories[countryName] || [];
    if (categoryId) return mems.filter(function(m) { return m.category === categoryId; });
    return mems;
  };

  window.cmem79GetTopMemories = function(countryName, limit) {
    var mems = window.collectiveMemoryV79Data.memories[countryName] || [];
    return mems.sort(function(a, b) { return b.importance - a.importance || b.year - a.year; }).slice(0, limit || 5);
  };

  window.cmem79HasMemoryOf = function(countryName, categoryId) {
    return (window.collectiveMemoryV79Data.memories[countryName] || []).some(function(m) { return m.category === categoryId; });
  };

  window.cmem79GetGoldenAges = function(countryName) {
    return (window.collectiveMemoryV79Data.memories[countryName] || []).filter(function(m) { return m.category === "golden_age"; });
  };

  window.cmem79GetNarrativeSummary = function(countryName) {
    var mems = window.collectiveMemoryV79Data.memories[countryName] || [];
    if (mems.length === 0) return countryName + " chưa có ký ức tập thể.";
    var lines = ["📜 KÝ ỨC TẬP THỂ: " + countryName + " (" + mems.length + " sự kiện)"];
    var top = mems.slice(0, 5);
    top.forEach(function(m) {
      lines.push(m.categoryIcon + " Năm " + m.year + " — " + m.title);
    });
    var categories = {};
    mems.forEach(function(m) { categories[m.categoryLabel] = (categories[m.categoryLabel] || 0) + 1; });
    lines.push("Phân bố: " + Object.keys(categories).map(function(k) { return k + "×" + categories[k]; }).join(" · "));
    return lines.join("\n");
  };

  window.cmem79GetAll = function() {
    var data = window.collectiveMemoryV79Data;
    return Object.keys(data.memories).map(function(k) { return { name: k, count: data.memories[k].length, latest: data.memories[k][0] }; });
  };
  window.cmem79GetStats = function() {
    var data = window.collectiveMemoryV79Data;
    return { totalCountries: Object.keys(data.memories).length, totalMemories: data.totalMemories };
  };
  window.CMEM79_CATEGORIES = MEMORY_CATEGORIES;

  function autoScanWorld() {
    var data = window.collectiveMemoryV79Data;
    var year = window.year || 1;
    if (year - data.lastScanYear < 100) return;
    data.lastScanYear = year;

    // Scan wars
    if (window.warsActive && window.warsActive.length > 0) {
      window.warsActive.slice(0, 3).forEach(function(war) {
        if (war.attacker) window.cmem79Record(war.attacker, "war", "Đại chiến năm " + year + " chống " + (war.defender || "kẻ thù"), "", 3);
        if (war.defender) window.cmem79Record(war.defender, "war", "Chống lại " + (war.attacker || "xâm lăng") + " năm " + year, "", 3);
      });
    }

    // Scan disasters
    if (window.disasterData && window.disasterData.activeDisasters) {
      window.disasterData.activeDisasters.slice(0, 2).forEach(function(d) {
        if (d.country) window.cmem79Record(d.country, "disaster", d.name || "Thiên tai năm " + year, d.description || "", 2);
      });
    }

    // Scan plague
    if (window.plagueData && window.plagueData.activePlagues) {
      window.plagueData.activePlagues.slice(0, 1).forEach(function(p) {
        if (p.origin) window.cmem79Record(p.origin, "plague", p.name || "Đại dịch năm " + year, "", 2);
      });
    }

    // Golden age detection — country with high stability
    if (window.countries) {
      window.countries.slice(0, 10).forEach(function(c) {
        if (!c || !c.name) return;
        var stability = c.stability || c.peace || 0;
        if (stability > 80 && Math.random() < 0.1) {
          if (!window.cmem79HasMemoryOf(c.name, "golden_age") || Math.random() < 0.05) {
            window.cmem79Record(c.name, "golden_age", "Kỷ Nguyên Vàng — Năm " + year, "Thời đại thịnh vượng và yên bình", 3);
          }
        }
      });
    }

    // Founding memory for new countries
    if (window.countries) {
      window.countries.forEach(function(c) {
        if (!c || !c.name) return;
        var mems = window.collectiveMemoryV79Data.memories[c.name] || [];
        if (mems.length === 0) {
          window.cmem79Record(c.name, "founding", "Lập Quốc " + c.name, "Buổi đầu dựng nước", 3);
        }
      });
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.007) autoScanWorld();
    };
    setTimeout(autoScanWorld, 4000);
    console.log("[CollectiveMemoryV79] 📜 Ký Ức Tập Thể khởi động — 10 thể loại · Auto-scan wars/disasters/golden ages · Lịch sử dân tộc sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20600); });
  } else {
    setTimeout(init, 20600);
  }
})();
