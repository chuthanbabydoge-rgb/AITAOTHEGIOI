(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_analytics_v60";

  window.universeAnalyticsV60Data = {
    snapshots: [],
    metrics: {
      activeSystems: 0,
      integrationScore: 0,
      eventDensity: 0,
      economicActivity: 0,
      populationGrowth: 0,
      civGrowth: 0
    },
    trends: {},
    insights: [],
    tickCount: 0,
    totalSnapshots: 0,
    version: "V60"
  };

  const METRICS_DEF = [
    { id: "activeSystems",    label: "Hệ Thống Hoạt Động",  icon: "⚙️",  unit: "hệ thống" },
    { id: "integrationScore", label: "Điểm Kết Nối",         icon: "🔗",  unit: "/100" },
    { id: "eventDensity",     label: "Mật Độ Sự Kiện",       icon: "📅",  unit: "events" },
    { id: "economicActivity", label: "Hoạt Động Kinh Tế",    icon: "💹",  unit: "/100" },
    { id: "populationGrowth", label: "Dân Số",               icon: "👥",  unit: "k dân" },
    { id: "civGrowth",        label: "Tăng Trưởng Văn Minh", icon: "🏛️", unit: "/100" }
  ];

  function countActiveSystems() {
    let count = 0;
    const checks = [
      window.kingdomData, window.empireData, window.allianceData, window.treatyData,
      window.disasterData, window.plagueData, window.econCrisisData, window.worldEventV25Data,
      window.guildCoreV53Data, window.tradeNetV54Data, window.playerEconCoreV52Data,
      window.playerCoreV50Data, window.eventSchedulerV59Data, window.mvEventV59Data,
      window.worldBossV59Data, window.playerCivCoreV58Data, window.luOrchestratorV60Data,
      window.causeEffectV60Data, window.worldNarrativeV60Data, window.universeMaturityV60Data
    ];
    checks.forEach(c => { if (c) count++; });
    return count;
  }

  function getEconomicActivity() {
    const countries = window.countries || [];
    if (!countries.length) return 20;
    const avg = countries.reduce((s,c) => s + (c.economy || 50), 0) / countries.length;
    const hasMarket = window.playerMarketplaceV52Data ? 10 : 0;
    const hasTrade = window.tradeNetV54Data ? 10 : 0;
    return Math.min(100, Math.round(avg + hasMarket + hasTrade));
  }

  function getTotalPopulation() {
    const countries = window.countries || [];
    const total = countries.reduce((s,c) => s + (c.population || 0), 0);
    return Math.round(total / 1000);
  }

  function getCivGrowth() {
    const hasCiv = window.playerCivCoreV58Data && window.playerCivCoreV58Data.founded ? 30 : 0;
    const countries = window.countries || [];
    const avgCulture = countries.length ? countries.reduce((s,c) => s + (c.culture || 50), 0) / countries.length : 50;
    const kds = window.kingdomData ? (Array.isArray(window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : Object.values(window.kingdomData.kingdoms || {})) : [];
    const emps = window.empireData ? (Array.isArray(window.empireData.empires) ? window.empireData.empires : Object.values(window.empireData.empires || {})) : [];
    return Math.min(100, Math.round(hasCiv + avgCulture * 0.4 + (kds.length + emps.length) * 2));
  }

  function getEventDensity() {
    const arch = window.eventArchiveV59Data || {};
    const total = Array.isArray(arch.archive) ? arch.archive.length : 0;
    const scheduler = window.eventSchedulerV59Data || {};
    return total + (scheduler.totalFired || 0);
  }

  function takeSnapshot() {
    const year = window.year || 0;
    const metrics = {
      activeSystems: countActiveSystems(),
      integrationScore: window.luo60GetIntegrationScore ? window.luo60GetIntegrationScore() : 0,
      eventDensity: getEventDensity(),
      economicActivity: getEconomicActivity(),
      populationGrowth: getTotalPopulation(),
      civGrowth: getCivGrowth()
    };
    window.universeAnalyticsV60Data.metrics = metrics;

    const snap = { year, metrics: Object.assign({}, metrics), timestamp: Date.now() };
    window.universeAnalyticsV60Data.snapshots.push(snap);
    if (window.universeAnalyticsV60Data.snapshots.length > 20) window.universeAnalyticsV60Data.snapshots.shift();
    window.universeAnalyticsV60Data.totalSnapshots++;

    computeTrends();
    generateInsights(metrics);
  }

  function computeTrends() {
    const snaps = window.universeAnalyticsV60Data.snapshots;
    if (snaps.length < 2) {
      METRICS_DEF.forEach(m => { window.universeAnalyticsV60Data.trends[m.id] = "stable"; });
      return;
    }
    const last = snaps[snaps.length - 1].metrics;
    const prev = snaps[snaps.length - 2].metrics;
    METRICS_DEF.forEach(m => {
      const diff = last[m.id] - prev[m.id];
      window.universeAnalyticsV60Data.trends[m.id] = diff > 2 ? "up" : diff < -2 ? "down" : "stable";
    });
  }

  function generateInsights(metrics) {
    const insights = [];
    if (metrics.activeSystems >= 18) insights.push("✅ Hệ sinh thái phong phú — " + metrics.activeSystems + " hệ thống đang hoạt động.");
    if (metrics.integrationScore > 60) insights.push("🔗 Kết nối hệ thống tốt — score " + metrics.integrationScore + "/100.");
    if (metrics.integrationScore < 25) insights.push("⚠️ Kết nối yếu (" + metrics.integrationScore + "/100) — nhiều hệ thống chưa kết nối.");
    if (metrics.economicActivity > 70) insights.push("💹 Kinh tế phát triển mạnh — " + metrics.economicActivity + "/100.");
    if (metrics.economicActivity < 30) insights.push("⚠️ Kinh tế trì trệ — cần thương mại/doanh nghiệp.");
    if (metrics.eventDensity > 50) insights.push("📅 Thế giới sôi động — " + metrics.eventDensity + " sự kiện đã xảy ra.");
    if (metrics.populationGrowth > 100) insights.push("👥 Dân số hùng mạnh — " + metrics.populationGrowth + "k dân.");
    if (metrics.civGrowth > 60) insights.push("🏛️ Văn minh đang phát triển vượt bậc.");
    const wars = (window.warsActive || []).length;
    if (wars >= 3) insights.push("⚔️ Cảnh báo: " + wars + " cuộc chiến đang diễn ra — ổn định thấp.");
    window.universeAnalyticsV60Data.insights = insights;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        snapshots: window.universeAnalyticsV60Data.snapshots.slice(-20),
        totalSnapshots: window.universeAnalyticsV60Data.totalSnapshots,
        tickCount: window.universeAnalyticsV60Data.tickCount
      }));
    } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        Object.assign(window.universeAnalyticsV60Data, p);
      }
    } catch(e) {}
  }

  window.uae60GetAnalytics = function() { return window.universeAnalyticsV60Data.metrics; };
  window.uae60GetTrends = function() { return window.universeAnalyticsV60Data.trends; };
  window.uae60GetSnapshots = function() { return window.universeAnalyticsV60Data.snapshots; };
  window.uae60GetInsights = function() { return window.universeAnalyticsV60Data.insights; };
  window.uae60GetMetricsDef = function() { return METRICS_DEF; };
  window.uae60ForceSnapshot = function() { takeSnapshot(); save(); };
  window.uae60GetDashboard = function() {
    const data = window.universeAnalyticsV60Data;
    return {
      metrics: data.metrics,
      trends: data.trends,
      insights: data.insights,
      totalSnapshots: data.totalSnapshots,
      snapshotCount: data.snapshots.length
    };
  };
  window.uae60GetJarvisInsights = function() {
    const ins = window.universeAnalyticsV60Data.insights;
    if (!ins.length) return "Analytics chưa đủ dữ liệu. Hãy để thế giới vận hành.";
    return "🤖 Jarvis Analytics: " + ins.slice(0,3).join(" | ");
  };

  function tick() {
    window.universeAnalyticsV60Data.tickCount++;
    if (window.universeAnalyticsV60Data.tickCount % 150 === 0) {
      takeSnapshot();
      save();
    }
  }

  function init() {
    load();
    takeSnapshot();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); tick(); };
    console.log("[UniverseAnalyticsEngineV60] 📊 Analytics Vũ Trụ V60 khởi động — " + METRICS_DEF.length + " chỉ số · " + window.universeAnalyticsV60Data.metrics.activeSystems + " hệ thống hoạt động · Snapshot mỗi 150 tick sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 11900); });
  } else {
    setTimeout(init, 11900);
  }
})();
