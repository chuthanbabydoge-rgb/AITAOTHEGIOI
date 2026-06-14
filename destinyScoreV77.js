(function() {
  "use strict";
  var SAVE_KEY = "cgv6_destiny_score_v77";
  var TICK_INTERVAL = 30;
  var tickCount = 0;

  var DIMENSIONS = [
    { id: "glory",   label: "Vinh Quang",  icon: "✨", color: "#f1c40f" },
    { id: "doom",    label: "Diệt Vong",   icon: "💀", color: "#e74c3c" },
    { id: "balance", label: "Cân Bằng",    icon: "⚖️",  color: "#3498db" },
    { id: "legacy",  label: "Di Sản",      icon: "📜", color: "#9b59b6" },
    { id: "power",   label: "Quyền Năng",  icon: "⚡", color: "#e67e22" },
    { id: "mystery", label: "Bí Ẩn",       icon: "🔮", color: "#1abc9c" }
  ];

  var DESTINY_TIERS = [
    { min: 0,  max: 20,  label: "Tầm Thường",    color: "#95a5a6" },
    { min: 20, max: 40,  label: "Có Tiềm Năng",  color: "#3498db" },
    { min: 40, max: 60,  label: "Định Mệnh Lớn", color: "#2ecc71" },
    { min: 60, max: 80,  label: "Anh Hùng",      color: "#f1c40f" },
    { min: 80, max: 95,  label: "Thần Thánh",    color: "#e67e22" },
    { min: 95, max: 101, label: "Siêu Việt",     color: "#e74c3c" }
  ];

  window.destinyScoreV77Data = {
    playerScore: null,
    countryScores: [],
    npcScores: [],
    history: [],
    lastCalcYear: 0,
    ticksUntilCalc: TICK_INTERVAL
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.destinyScoreV77Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.destinyScoreV77Data = JSON.parse(d);
    } catch(e) {}
  }

  function getTier(score) {
    return DESTINY_TIERS.find(function(t) { return score >= t.min && score < t.max; }) || DESTINY_TIERS[0];
  }

  function calcDimensions(seed, modifiers) {
    var dims = {};
    DIMENSIONS.forEach(function(d) {
      var base = (Math.sin((seed || 1) * d.id.charCodeAt(0) * 0.1) * 0.5 + 0.5) * 70 + 15;
      dims[d.id] = Math.min(100, Math.max(0, Math.round(base + (modifiers[d.id] || 0))));
    });
    dims.overall = Math.round(DIMENSIONS.reduce(function(sum, d) { return sum + dims[d.id]; }, 0) / DIMENSIONS.length);
    return dims;
  }

  function calcPlayerScore() {
    var year = window.year || 1;
    var seed = year * 7 + 13;
    var mods = {
      glory: (window.creatorEconData ? (window.creatorEconData.cp || 0) * 0.01 : 0),
      power: (window.creatorAuthorityV51Data ? (window.creatorAuthorityV51Data.divineEnergy || 0) * 0.05 : 0),
      legacy: (window.histReplayData ? (window.histReplayData.events ? window.histReplayData.events.length * 0.5 : 0) : 0),
      doom: 0, balance: 0, mystery: Math.random() * 10
    };
    var dims = calcDimensions(seed, mods);
    var tier = getTier(dims.overall);
    return {
      entity: "player",
      name: "Đấng Tạo Hóa",
      type: "creator",
      dimensions: dims,
      overall: dims.overall,
      tier: tier.label,
      tierColor: tier.color,
      year: year
    };
  }

  function calcCountryScores() {
    if (!window.countries || window.countries.length === 0) return [];
    var sorted = window.countries.slice(0, 12);
    return sorted.map(function(c, i) {
      var seed = (c.name ? c.name.charCodeAt(0) : i + 1) * 13 + (window.year || 1);
      var mods = {
        glory: (c.power || 0) * 0.1,
        doom: (c.stability !== undefined ? (100 - c.stability) * 0.2 : 0),
        power: (c.military || 0) * 0.1,
        balance: 0, legacy: 0, mystery: 0
      };
      var dims = calcDimensions(seed, mods);
      var tier = getTier(dims.overall);
      return {
        entity: "country_" + (c.name || i),
        name: c.name || ("Quốc gia " + (i + 1)),
        type: "country",
        dimensions: dims,
        overall: dims.overall,
        tier: tier.label,
        tierColor: tier.color,
        year: window.year || 1
      };
    }).sort(function(a, b) { return b.overall - a.overall; }).slice(0, 8);
  }

  function calcNPCScores() {
    if (!window.npcs || window.npcs.length === 0) return [];
    var pool = window.npcs.slice(0, 30);
    return pool.map(function(n, i) {
      var seed = (n.name ? n.name.charCodeAt(0) : i + 1) * 17 + (window.year || 1);
      var mods = {
        glory: (n.cultivation || 0) * 0.05,
        power: (n.level || 0) * 2,
        legacy: 0, doom: 0, balance: 0, mystery: 5
      };
      var dims = calcDimensions(seed, mods);
      var tier = getTier(dims.overall);
      return {
        entity: "npc_" + (n.name || i),
        name: n.name || ("Sinh linh " + (i + 1)),
        type: "npc",
        dimensions: dims,
        overall: dims.overall,
        tier: tier.label,
        tierColor: tier.color,
        year: window.year || 1
      };
    }).sort(function(a, b) { return b.overall - a.overall; }).slice(0, 10);
  }

  function recalcAll() {
    var data = window.destinyScoreV77Data;
    data.playerScore = calcPlayerScore();
    data.countryScores = calcCountryScores();
    data.npcScores = calcNPCScores();
    data.lastCalcYear = window.year || 1;
    data.history.unshift({ year: data.lastCalcYear, playerOverall: data.playerScore.overall });
    if (data.history.length > 20) data.history.length = 20;
    save();
  }

  window.ds77GetPlayerScore = function() { return window.destinyScoreV77Data.playerScore; };
  window.ds77GetCountryScores = function() { return window.destinyScoreV77Data.countryScores; };
  window.ds77GetNPCScores = function() { return window.destinyScoreV77Data.npcScores; };
  window.ds77GetHistory = function() { return window.destinyScoreV77Data.history; };
  window.ds77GetAll = function() {
    var d = window.destinyScoreV77Data;
    return [d.playerScore].concat(d.countryScores).concat(d.npcScores).filter(Boolean);
  };
  window.ds77GetJarvisReport = function() {
    var d = window.destinyScoreV77Data;
    var ps = d.playerScore;
    if (!ps) return "Chưa có dữ liệu định mệnh.";
    var top = d.countryScores[0];
    var lines = [
      "⭐ Điểm Định Mệnh Tổng Thể: " + ps.overall + "/100 — " + ps.tier,
      "✨ Vinh Quang: " + ps.dimensions.glory + " | 💀 Diệt Vong: " + ps.dimensions.doom,
      "⚡ Quyền Năng: " + ps.dimensions.power + " | 📜 Di Sản: " + ps.dimensions.legacy,
      top ? ("🏆 Quốc Gia Cao Điểm Nhất: " + top.name + " (" + top.overall + " — " + top.tier + ")") : "",
      "🔮 Lời Tiên Tri: " + (ps.overall > 70 ? "Bạn đang trên con đường thần thánh. Hãy tiếp tục mở rộng vũ trụ." : ps.overall > 40 ? "Tiềm năng lớn đang chờ được khơi dậy. Hãy tạo thêm anh hùng." : "Vũ trụ cần bàn tay tạo hóa chủ động hơn để thăng hoa.")
    ];
    return lines.filter(Boolean).join("\n");
  };
  window.DS77_DIMENSIONS = DIMENSIONS;
  window.DS77_TIERS = DESTINY_TIERS;

  function ds77Tick() {
    tickCount++;
    if (tickCount % TICK_INTERVAL === 0) {
      recalcAll();
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      ds77Tick();
    };
    recalcAll();
    console.log("[DestinyScoreV77] ⭐ Điểm Định Mệnh khởi động — 6 chiều · Player/Country/NPC scoring · Jarvis báo cáo sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19500); });
  } else {
    setTimeout(init, 19500);
  }
})();
