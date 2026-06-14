(function() {
  "use strict";
  const SAVE_KEY = "cgv6_health_monitor_v81";

  window.universeHealthMonitorV81Data = {
    metrics: {},
    history: [],
    alerts: [],
    lastCheck: null,
    tickCount: 0
  };

  const METRIC_DEFS = [
    {
      id: "world_size",
      label: "World Size",
      icon: "🌍",
      unit: "quốc gia",
      getValue: function() {
        return (window.countries || []).length;
      },
      getMax: function() { return 80; },
      thresholds: { warning: 5, critical: 0 },
      direction: "higher_better"
    },
    {
      id: "npc_count",
      label: "NPC Count",
      icon: "👥",
      unit: "sinh linh",
      getValue: function() {
        return (window.npcs || []).filter(n => n && !n.dead).length;
      },
      getMax: function() { return 200; },
      thresholds: { warning: 5, critical: 0 },
      direction: "higher_better"
    },
    {
      id: "ai_load",
      label: "AI Load",
      icon: "🤖",
      unit: "engines",
      getValue: function() {
        if (typeof window.puos81ScanEngines === "function") {
          return window.puos81ScanEngines().active.length;
        }
        return 0;
      },
      getMax: function() { return 40; },
      thresholds: { warning: 10, critical: 5 },
      direction: "higher_better"
    },
    {
      id: "memory_usage",
      label: "Memory Usage",
      icon: "💾",
      unit: "KB",
      getValue: function() {
        try {
          let total = 0;
          for (let key in localStorage) {
            if (key.startsWith("cgv6_")) {
              total += (localStorage.getItem(key) || "").length;
            }
          }
          return Math.round(total / 1024);
        } catch(e) { return 0; }
      },
      getMax: function() { return 5000; },
      thresholds: { warning: 4500, critical: 4900 },
      direction: "lower_better"
    },
    {
      id: "evolution_status",
      label: "Evolution",
      icon: "🌱",
      unit: "% active",
      getValue: function() {
        let score = 0;
        if (window.universeEvoV76Data) score += 25;
        if (window.emergentCivV76Data && (window.emergentCivV76Data.emergentCountries || []).length > 0) score += 25;
        if (window.multiverseEvoV80Data && (window.multiverseEvoV80Data.worlds || []).length > 0) score += 25;
        if (window.culturalEvoV79Data && (window.culturalEvoV79Data.activeCultures || []).length > 0) score += 25;
        return score;
      },
      getMax: function() { return 100; },
      thresholds: { warning: 25, critical: 0 },
      direction: "higher_better"
    },
    {
      id: "civilization_depth",
      label: "Civ Depth",
      icon: "🏛️",
      unit: "hệ thống",
      getValue: function() {
        let depth = 0;
        if ((window.countries || []).length > 0) depth++;
        if (window.kingdomData) depth++;
        if (window.empireData) depth++;
        if (window.civConsciousnessV79Data) depth++;
        if (window.philosophyV79Data) depth++;
        if (window.collectiveMemoryV79Data) depth++;
        if (window.academyV79Data) depth++;
        if (window.playerCivCoreV58Data) depth++;
        return depth;
      },
      getMax: function() { return 8; },
      thresholds: { warning: 2, critical: 0 },
      direction: "higher_better"
    },
    {
      id: "xr_readiness",
      label: "XR Ready",
      icon: "🥽",
      unit: "%",
      getValue: function() {
        let score = 0;
        if (window.xrEngineV69Data) score += 20;
        if (window.xrWorldV72Data) score += 20;
        if (window.immersionEngineV70Data) score += 20;
        if (window.avatarGodV71Data) score += 20;
        if (window.spatialWorldV67Data) score += 20;
        return score;
      },
      getMax: function() { return 100; },
      thresholds: { warning: 20, critical: 0 },
      direction: "higher_better"
    },
    {
      id: "multiverse_connections",
      label: "Multiverse",
      icon: "🌌",
      unit: "kết nối",
      getValue: function() {
        let conn = 0;
        if (window.universeHubV73Data) conn += (window.universeHubV73Data.portals || []).length;
        if (window.multiverseEvoV80Data) conn += (window.multiverseEvoV80Data.worlds || []).length;
        if (window.universeClusterV80Data) conn += (window.universeClusterV80Data.clusters || []).length;
        return conn;
      },
      getMax: function() { return 30; },
      thresholds: { warning: 0, critical: 0 },
      direction: "higher_better"
    }
  ];

  function getStatus(metric, value) {
    if (metric.direction === "higher_better") {
      if (value <= metric.thresholds.critical) return "critical";
      if (value <= metric.thresholds.warning) return "warning";
      return "healthy";
    } else {
      if (value >= metric.thresholds.critical) return "critical";
      if (value >= metric.thresholds.warning) return "warning";
      return "healthy";
    }
  }

  function save() {
    try {
      const d = Object.assign({}, window.universeHealthMonitorV81Data);
      d.history = d.history.slice(-20);
      d.alerts = d.alerts.slice(-10);
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.universeHealthMonitorV81Data = Object.assign(window.universeHealthMonitorV81Data, JSON.parse(d));
    } catch(e) {}
  }

  window.uhmon81Check = function() {
    const metrics = {};
    let healthyCount = 0;
    for (const def of METRIC_DEFS) {
      let value = 0;
      try { value = def.getValue(); } catch(e) {}
      const max = def.getMax();
      const pct = Math.min(100, Math.round((value / max) * 100));
      const status = getStatus(def, value);
      if (status === "healthy") healthyCount++;
      metrics[def.id] = { id: def.id, label: def.label, icon: def.icon, unit: def.unit, value, max, pct, status };
    }
    window.universeHealthMonitorV81Data.metrics = metrics;
    window.universeHealthMonitorV81Data.lastCheck = Date.now();

    const snapshot = { time: Date.now(), year: window.year || 0, healthScore: Math.round((healthyCount / METRIC_DEFS.length) * 100) };
    window.universeHealthMonitorV81Data.history.push(snapshot);
    if (window.universeHealthMonitorV81Data.history.length > 20) window.universeHealthMonitorV81Data.history.shift();

    return metrics;
  };

  window.uhmon81GetMetrics = function() {
    return window.universeHealthMonitorV81Data.metrics;
  };

  window.uhmon81GetHealthScore = function() {
    const m = window.universeHealthMonitorV81Data.metrics;
    if (!m || !Object.keys(m).length) return 0;
    const healthy = Object.values(m).filter(x => x.status === "healthy").length;
    return Math.round((healthy / Object.keys(m).length) * 100);
  };

  window.uhmon81GetHistory = function() {
    return window.universeHealthMonitorV81Data.history;
  };

  window.uhmon81GetDefs = function() {
    return METRIC_DEFS;
  };

  window.uhmon81GetJarvisReport = function() {
    const score = window.uhmon81GetHealthScore();
    const m = window.universeHealthMonitorV81Data.metrics;
    const critical = Object.values(m).filter(x => x.status === "critical").map(x => x.label);
    const warnings = Object.values(m).filter(x => x.status === "warning").map(x => x.label);
    let report = "🤖 **Jarvis OS — Báo Cáo Sức Khỏe Vũ Trụ**\n\n";
    report += "Điểm sức khỏe tổng thể: **" + score + "%**\n";
    if (score >= 80) report += "✅ Vũ trụ đang hoạt động ổn định.\n";
    else if (score >= 50) report += "⚠️ Một số hệ thống cần chú ý.\n";
    else report += "❌ Vũ trụ đang gặp vấn đề nghiêm trọng.\n";
    if (critical.length) report += "\n❌ **Nguy hiểm:** " + critical.join(", ");
    if (warnings.length) report += "\n⚠️ **Cảnh báo:** " + warnings.join(", ");
    if (!critical.length && !warnings.length) report += "\n✨ Mọi hệ thống vận hành hoàn hảo.";
    return report;
  };

  function tick() {
    window.universeHealthMonitorV81Data.tickCount++;
    if (window.universeHealthMonitorV81Data.tickCount % 100 === 0) {
      window.uhmon81Check();
      save();
    }
  }

  function init() {
    load();
    window.uhmon81Check();

    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      tick();
    };

    console.log("[Universe Health Monitor V81] Khởi động. Sức khỏe: " + window.uhmon81GetHealthScore() + "%");
    save();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22000); });
  } else {
    setTimeout(init, 22000);
  }
})();
