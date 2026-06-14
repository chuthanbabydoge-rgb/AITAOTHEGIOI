(function() {
  "use strict";
  var SAVE_KEY = "cgv6_cross_world_v80";

  var INFLUENCE_TYPES = [
    { id: "culture",     label: "Văn Hóa",    icon: "🎨", color: "#e67e22", desc: "Phong tục, ngôn ngữ, nghệ thuật lan truyền" },
    { id: "technology",  label: "Công Nghệ",  icon: "⚙️",  color: "#3498db", desc: "Tri thức khoa học và kỹ thuật" },
    { id: "religion",    label: "Tôn Giáo",   icon: "✨", color: "#9b59b6", desc: "Đức tin và thần thánh vượt biên giới thế giới" },
    { id: "philosophy",  label: "Triết Học",  icon: "💭", color: "#1abc9c", desc: "Tư tưởng và hệ thống giá trị" },
    { id: "military",    label: "Quân Sự",   icon: "⚔️",  color: "#e74c3c", desc: "Chiến thuật và vũ khí lan truyền qua chiến tranh" },
    { id: "legend",      label: "Huyền Thoại", icon: "🦸", color: "#f1c40f", desc: "Anh hùng và câu chuyện trở thành truyền thuyết" }
  ];

  var INFLUENCE_STRENGTHS = [
    { id: "whisper",  label: "Thì Thầm",   power: 1 },
    { id: "current",  label: "Dòng Chảy",  power: 3 },
    { id: "wave",     label: "Làn Sóng",   power: 6 },
    { id: "tide",     label: "Thủy Triều", power: 10 },
    { id: "flood",    label: "Lũ Lụt",     power: 20 }
  ];

  window.crossWorldV80Data = {
    influences: [],
    networkNodes: {},
    dominanceMap: {},
    totalInfluences: 0,
    lastInfluenceYear: 0
  };

  function save() {
    try {
      var compact = {
        influences: window.crossWorldV80Data.influences.slice(-40),
        networkNodes: window.crossWorldV80Data.networkNodes,
        dominanceMap: window.crossWorldV80Data.dominanceMap,
        totalInfluences: window.crossWorldV80Data.totalInfluences,
        lastInfluenceYear: window.crossWorldV80Data.lastInfluenceYear
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.crossWorldV80Data = JSON.parse(d);
    } catch(e) {}
  }

  window.cwi80SendInfluence = function(fromWorld, toWorld, influenceTypeId, strengthId, content) {
    var data = window.crossWorldV80Data;
    var infType = INFLUENCE_TYPES.find(function(t) { return t.id === influenceTypeId; });
    var strength = INFLUENCE_STRENGTHS.find(function(s) { return s.id === strengthId; }) || INFLUENCE_STRENGTHS[1];
    if (!infType) infType = INFLUENCE_TYPES[Math.floor(Math.random() * INFLUENCE_TYPES.length)];
    var year = window.year || 1;

    var influence = {
      id: "inf_" + Date.now(),
      year: year,
      from: fromWorld,
      to: toWorld,
      type: infType.id,
      typeLabel: infType.label,
      typeIcon: infType.icon,
      typeColor: infType.color,
      typeDesc: infType.desc,
      strength: strength.id,
      strengthLabel: strength.label,
      power: strength.power,
      content: content || (infType.desc + " từ " + fromWorld),
      absorbed: false
    };
    data.influences.push(influence);
    if (data.influences.length > 40) data.influences.shift();
    data.totalInfluences++;

    // Update network nodes
    if (!data.networkNodes[fromWorld]) data.networkNodes[fromWorld] = { sent: 0, received: 0, dominanceScore: 0 };
    if (!data.networkNodes[toWorld])   data.networkNodes[toWorld]   = { sent: 0, received: 0, dominanceScore: 0 };
    data.networkNodes[fromWorld].sent++;
    data.networkNodes[fromWorld].dominanceScore += strength.power;
    data.networkNodes[toWorld].received++;

    // Update dominance map
    if (!data.dominanceMap[fromWorld]) data.dominanceMap[fromWorld] = {};
    data.dominanceMap[fromWorld][toWorld] = (data.dominanceMap[fromWorld][toWorld] || 0) + strength.power;

    // Boost evolution of influenced world
    if (typeof window.mevo80Evolve === "function") window.mevo80Evolve(toWorld, Math.ceil(strength.power * 0.5));

    // Log to Historical Timeline
    if (typeof window.htAddEvent === "function" && strength.power >= 6) {
      window.htAddEvent({ year: year, type: "cross_world_influence", title: infType.icon + " [Đa VT] " + infType.label + ": " + fromWorld + " → " + toWorld + " — " + strength.label, color: infType.color });
    }
    save();
    return influence;
  };

  window.cwi80AbsorbInfluence = function(influenceId) {
    var inf = window.crossWorldV80Data.influences.find(function(i) { return i.id === influenceId; });
    if (inf) { inf.absorbed = true; save(); }
  };

  window.cwi80GetInfluences = function(world, direction) {
    var infs = window.crossWorldV80Data.influences;
    if (!world) return infs.slice().reverse();
    if (direction === "sent") return infs.filter(function(i) { return i.from === world; }).reverse();
    if (direction === "received") return infs.filter(function(i) { return i.to === world; }).reverse();
    return infs.filter(function(i) { return i.from === world || i.to === world; }).reverse();
  };

  window.cwi80GetDominantInfluencer = function() {
    var nodes = window.crossWorldV80Data.networkNodes;
    var best = null, bestScore = 0;
    Object.keys(nodes).forEach(function(k) {
      if (nodes[k].dominanceScore > bestScore) { best = k; bestScore = nodes[k].dominanceScore; }
    });
    return best ? { name: best, score: bestScore } : null;
  };

  window.cwi80GetInfluenceNetwork = function() {
    return Object.keys(window.crossWorldV80Data.networkNodes).map(function(k) {
      return { world: k, stats: window.crossWorldV80Data.networkNodes[k] };
    }).sort(function(a, b) { return b.stats.dominanceScore - a.stats.dominanceScore; });
  };

  window.cwi80GetStats = function() {
    var d = window.crossWorldV80Data;
    var byType = {};
    d.influences.forEach(function(i) { byType[i.typeLabel] = (byType[i.typeLabel] || 0) + 1; });
    return { total: d.totalInfluences, networkSize: Object.keys(d.networkNodes).length, byType: byType };
  };
  window.CWI80_TYPES = INFLUENCE_TYPES;
  window.CWI80_STRENGTHS = INFLUENCE_STRENGTHS;

  function autoInfluence() {
    var data = window.crossWorldV80Data;
    var year = window.year || 1;
    if (year - data.lastInfluenceYear < 100) return;
    data.lastInfluenceYear = year;

    var worlds = typeof window.mevo80GetAlive === "function" ? window.mevo80GetAlive() : [];
    if (worlds.length < 2) return;

    // Random influence between connected worlds
    for (var i = 0; i < Math.min(2, worlds.length); i++) {
      var src = worlds[Math.floor(Math.random() * worlds.length)];
      if (!src.connections || src.connections.length === 0) continue;
      var destName = src.connections[Math.floor(Math.random() * src.connections.length)];
      if (destName === src.name) continue;
      var seed = Math.floor(Math.random() * INFLUENCE_TYPES.length);
      var strSeed = Math.floor(Math.random() * 3);
      var contents = {
        culture: ["Phong tục lễ hội", "Phong cách kiến trúc", "Âm nhạc truyền thống"],
        technology: ["Bí quyết luyện kim", "Kỹ thuật nông nghiệp mới", "Phương pháp hàng hải"],
        religion: ["Giáo lý mới", "Nghi lễ tâm linh", "Tín ngưỡng thần thánh"],
        philosophy: ["Trường phái tư tưởng", "Đạo lý mới", "Triết luận về vũ trụ"],
        military: ["Chiến thuật kỵ binh", "Vũ khí mới", "Phòng thủ công thành"],
        legend: ["Câu chuyện anh hùng", "Thần thoại sáng thế", "Truyền thuyết chiến binh"]
      };
      var type = INFLUENCE_TYPES[seed];
      var contentList = contents[type.id] || ["Ảnh hưởng không xác định"];
      window.cwi80SendInfluence(src.name, destName, type.id, INFLUENCE_STRENGTHS[strSeed].id, contentList[Math.floor(Math.random() * contentList.length)]);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.006) autoInfluence();
    };
    console.log("[CrossWorldInfluenceV80] 🔀 Ảnh Hưởng Liên Thế Giới khởi động — 6 loại · 5 cấp độ · Auto-propagate · Dominance tracking sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21200); });
  } else {
    setTimeout(init, 21200);
  }
})();
