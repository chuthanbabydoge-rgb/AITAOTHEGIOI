(function() {
  "use strict";
  const SAVE_KEY = "cgv6_univ_health_v55";

  window.univHealthData = {
    metrics: {
      population:    { score: 50, label: "Dân Số",    icon: "👥", trend: 0 },
      stability:     { score: 50, label: "Ổn Định",   icon: "⚖️", trend: 0 },
      economy:       { score: 50, label: "Kinh Tế",   icon: "💹", trend: 0 },
      military:      { score: 50, label: "Quân Sự",   icon: "⚔️", trend: 0 },
      religion:      { score: 50, label: "Tôn Giáo",  icon: "⛪", trend: 0 },
      environment:   { score: 50, label: "Môi Trường",icon: "🌿", trend: 0 },
      civilization:  { score: 50, label: "Văn Minh",  icon: "🏛️", trend: 0 },
      multiverse:    { score: 50, label: "Đa Vũ Trụ", icon: "🌌", trend: 0 }
    },
    overallScore: 50,
    overallStatus: "Bình Thường",
    alerts: [],
    history: [],
    tickCount: 0,
    version: "V55"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.univHealthData)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        if (parsed.metrics) window.univHealthData.metrics = parsed.metrics;
        if (parsed.overallScore !== undefined) window.univHealthData.overallScore = parsed.overallScore;
        if (parsed.overallStatus) window.univHealthData.overallStatus = parsed.overallStatus;
        if (parsed.alerts) window.univHealthData.alerts = parsed.alerts;
        if (parsed.history) window.univHealthData.history = parsed.history;
        if (parsed.tickCount) window.univHealthData.tickCount = parsed.tickCount;
      }
    } catch(e) {}
  }

  function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  function calcMetrics() {
    var m = window.univHealthData.metrics;

    var popScore = 50;
    if (typeof window.npcs !== "undefined" && Array.isArray(window.npcs)) {
      popScore = clamp(40 + Math.min(window.npcs.length, 30));
    }
    m.population.score = popScore;

    var stabScore = 50;
    var activeWars = (typeof window.warsActive !== "undefined" && Array.isArray(window.warsActive)) ? window.warsActive.length : 0;
    var activeCrises = (typeof window.criV49GetActive === "function") ? window.criV49GetActive().length : 0;
    stabScore = clamp(80 - activeWars * 8 - activeCrises * 10);
    m.stability.score = stabScore;

    var econScore = 50;
    if (typeof window.pec52GetNetWorthInDong === "function") {
      var nw = window.pec52GetNetWorthInDong();
      econScore = clamp(30 + Math.min(Math.floor(nw / 100000), 60));
    } else if (typeof window.world !== "undefined" && window.world && window.world.economy !== undefined) {
      econScore = clamp(30 + Math.min(window.world.economy, 70));
    }
    m.economy.score = econScore;

    var milScore = 50;
    if (typeof window.warsActive !== "undefined" && Array.isArray(window.warsActive)) {
      milScore = clamp(50 + window.warsActive.length * 5);
    }
    m.military.score = milScore;

    var relScore = 50;
    if (typeof window.world !== "undefined" && window.world) {
      relScore = clamp(50 + (window.world.religionStrength || 0));
    }
    m.religion.score = relScore;

    var envScore = 50;
    if (typeof window.ecoGetCurrentClimate === "function") {
      var climate = window.ecoGetCurrentClimate();
      if (climate && climate.id === "tropical") envScore = 75;
      else if (climate && climate.id === "desert") envScore = 25;
      else envScore = 55;
    }
    if (typeof window.ecoGetActiveDisasters === "function") {
      var dis = window.ecoGetActiveDisasters();
      envScore = clamp(envScore - dis.length * 10);
    }
    m.environment.score = envScore;

    var civScore = 50;
    var kingdoms = 0, empires = 0;
    if (typeof window.kingdomData !== "undefined" && window.kingdomData) {
      var kArr = Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {});
      kingdoms = kArr.filter(function(k) { return !k.collapsed; }).length;
    }
    if (typeof window.empireData !== "undefined" && window.empireData) {
      var eArr = Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {});
      empires = eArr.filter(function(e) { return !e.collapsed; }).length;
    }
    civScore = clamp(40 + kingdoms * 3 + empires * 5);
    m.civilization.score = civScore;

    var mvScore = 50;
    if (typeof window.mvData !== "undefined" && window.mvData && window.mvData.universes) {
      var univCount = Object.keys(window.mvData.universes).length;
      mvScore = clamp(30 + univCount * 5);
    }
    m.multiverse.score = mvScore;

    var scores = Object.values(m).map(function(x) { return x.score; });
    window.univHealthData.overallScore = clamp(scores.reduce(function(a, b) { return a + b; }, 0) / scores.length);

    var overall = window.univHealthData.overallScore;
    if (overall >= 80) window.univHealthData.overallStatus = "🟢 Phồn Thịnh";
    else if (overall >= 60) window.univHealthData.overallStatus = "🔵 Ổn Định";
    else if (overall >= 40) window.univHealthData.overallStatus = "🟡 Bình Thường";
    else if (overall >= 20) window.univHealthData.overallStatus = "🟠 Căng Thẳng";
    else window.univHealthData.overallStatus = "🔴 Khủng Hoảng";

    checkAlerts(m, overall);
  }

  function checkAlerts(m, overall) {
    var alerts = [];
    var yr = getYear();
    if (overall < 20) alerts.push({ icon: "🚨", msg: "Vũ trụ đang trong tình trạng khủng hoảng! (Sức khỏe: " + overall + "/100)" });
    if (m.stability.score < 20) alerts.push({ icon: "⚠️", msg: "Ổn định thế giới cực thấp — nguy cơ sụp đổ văn minh" });
    if (m.economy.score < 20) alerts.push({ icon: "💸", msg: "Kinh tế đang sụp đổ — cần can thiệp ngay" });
    if (m.environment.score < 20) alerts.push({ icon: "🌍", msg: "Môi trường bị tàn phá nghiêm trọng" });
    if (m.population.score < 20) alerts.push({ icon: "💀", msg: "Dân số đang suy giảm mạnh" });
    window.univHealthData.alerts = alerts;

    var snap = { year: yr, score: overall, status: window.univHealthData.overallStatus };
    window.univHealthData.history.unshift(snap);
    if (window.univHealthData.history.length > 100) window.univHealthData.history.length = 100;

    if (alerts.length > 0 && typeof window.waeAddAlert === "function") {
      alerts.forEach(function(a) { window.waeAddAlert(a.icon + " " + a.msg); });
    }
  }

  window.uhs55GetMetrics = function() { return window.univHealthData.metrics; };
  window.uhs55GetOverall = function() { return { score: window.univHealthData.overallScore, status: window.univHealthData.overallStatus }; };
  window.uhs55GetAlerts = function() { return window.univHealthData.alerts; };
  window.uhs55GetHistory = function(limit) { return window.univHealthData.history.slice(0, limit || 30); };
  window.uhs55GetStats = function() {
    return { overallScore: window.univHealthData.overallScore, overallStatus: window.univHealthData.overallStatus, alertCount: window.univHealthData.alerts.length, historyLength: window.univHealthData.history.length };
  };
  window.uhs55GetJarvisReport = function() {
    var m = window.univHealthData.metrics;
    var lines = ["🔭 **Sức Khỏe Vũ Trụ** — " + window.univHealthData.overallStatus + " (" + window.univHealthData.overallScore + "/100)"];
    Object.values(m).forEach(function(metric) {
      var bar = metric.score >= 70 ? "🟢" : metric.score >= 40 ? "🟡" : "🔴";
      lines.push(bar + " " + metric.icon + " " + metric.label + ": " + metric.score + "/100");
    });
    if (window.univHealthData.alerts.length > 0) {
      lines.push("\n⚠️ CẢNH BÁO:");
      window.univHealthData.alerts.forEach(function(a) { lines.push(a.icon + " " + a.msg); });
    }
    return lines.join("\n");
  };

  window.universeHealthTick = function() {
    window.univHealthData.tickCount++;
    if (window.univHealthData.tickCount % 30 === 0) {
      calcMetrics();
      save();
    }
  };

  function init() {
    load();
    calcMetrics();

    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.universeHealthTick(); };

    save();
    console.log("[UniverseHealthSystem V55] 🔭 Sức Khỏe Vũ Trụ khởi động — 8 chỉ số · Tổng: " + window.univHealthData.overallScore + "/100 · " + window.univHealthData.overallStatus);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 8600); });
  } else {
    setTimeout(init, 8600);
  }
})();
