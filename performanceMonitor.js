(function() {
  "use strict";
  const SAVE_KEY = "cgv6_perf_monitor_v82";
  const VERSION = "V82";

  window.perfMonitorV82Data = {
    enabled: true,
    tickTimes: [],
    renderTimes: {},
    saveTimes: [],
    fps: 0,
    avgTickMs: 0,
    peakTickMs: 0,
    totalTicks: 0,
    droppedTicks: 0,
    lastTickTime: 0,
    alerts: [],
    samples: {
      tick: [],
      render: [],
      save: []
    },
    thresholds: {
      tickWarning: 16,
      tickCritical: 50,
      renderWarning: 20,
      renderCritical: 100,
      saveWarning: 10,
      saveCritical: 50
    },
    history: []
  };

  var _tickStart = 0;
  var _fpsFrames = 0;
  var _fpsLast = Date.now();
  var _snapshotInterval = null;

  function addAlert(level, msg) {
    var alert = { time: Date.now(), level: level, msg: msg };
    window.perfMonitorV82Data.alerts.unshift(alert);
    if (window.perfMonitorV82Data.alerts.length > 20) window.perfMonitorV82Data.alerts.pop();
  }

  function pushSample(arr, val, maxLen) {
    arr.push(val);
    if (arr.length > maxLen) arr.shift();
  }

  function average(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
  }

  window.perfMon82BeginTick = function() {
    _tickStart = performance.now();
  };

  window.perfMon82EndTick = function() {
    if (!_tickStart) return;
    var ms = performance.now() - _tickStart;
    _tickStart = 0;
    var d = window.perfMonitorV82Data;
    d.totalTicks++;
    d.lastTickTime = ms;
    pushSample(d.samples.tick, ms, 60);
    d.avgTickMs = Math.round(average(d.samples.tick) * 100) / 100;
    if (ms > d.peakTickMs) d.peakTickMs = Math.round(ms * 100) / 100;
    if (ms > d.thresholds.tickCritical) {
      d.droppedTicks++;
      if (d.totalTicks % 50 === 0) addAlert("critical", "Tick chậm: " + Math.round(ms) + "ms (ngưỡng " + d.thresholds.tickCritical + "ms)");
    } else if (ms > d.thresholds.tickWarning && d.totalTicks % 100 === 0) {
      addAlert("warning", "Tick cảnh báo: " + Math.round(ms) + "ms");
    }
    _fpsFrames++;
    var now = Date.now();
    if (now - _fpsLast >= 1000) {
      d.fps = _fpsFrames;
      _fpsFrames = 0;
      _fpsLast = now;
    }
  };

  window.perfMon82BeginRender = function(panelId) {
    window.perfMonitorV82Data.renderTimes[panelId] = performance.now();
  };

  window.perfMon82EndRender = function(panelId) {
    var start = window.perfMonitorV82Data.renderTimes[panelId];
    if (!start) return;
    var ms = performance.now() - start;
    window.perfMonitorV82Data.renderTimes[panelId] = ms;
    pushSample(window.perfMonitorV82Data.samples.render, ms, 30);
    if (ms > window.perfMonitorV82Data.thresholds.renderCritical) {
      addAlert("critical", "Render chậm [" + panelId + "]: " + Math.round(ms) + "ms");
    }
  };

  window.perfMon82RecordSave = function(key, byteSize) {
    pushSample(window.perfMonitorV82Data.samples.save, byteSize, 30);
    if (byteSize > 100000) {
      addAlert("warning", "Save lớn [" + key + "]: " + Math.round(byteSize / 1024) + "KB");
    }
  };

  window.perfMon82GetReport = function() {
    var d = window.perfMonitorV82Data;
    return {
      fps: d.fps,
      avgTickMs: d.avgTickMs,
      peakTickMs: d.peakTickMs,
      totalTicks: d.totalTicks,
      droppedTicks: d.droppedTicks,
      droppedPct: d.totalTicks ? Math.round((d.droppedTicks / d.totalTicks) * 100) : 0,
      avgRenderMs: Math.round(average(d.samples.render) * 100) / 100,
      avgSaveKB: Math.round(average(d.samples.save) / 1024 * 10) / 10,
      alerts: d.alerts.slice(0, 5),
      score: calcScore()
    };
  };

  function calcScore() {
    var d = window.perfMonitorV82Data;
    var score = 100;
    if (d.avgTickMs > d.thresholds.tickCritical) score -= 40;
    else if (d.avgTickMs > d.thresholds.tickWarning) score -= 20;
    if (d.droppedTicks > 0) score -= Math.min(30, d.droppedTicks);
    var avgRender = average(d.samples.render);
    if (avgRender > d.thresholds.renderCritical) score -= 20;
    else if (avgRender > d.thresholds.renderWarning) score -= 10;
    return Math.max(0, score);
  }

  window.perfMon82GetLocalStorageSize = function() {
    try {
      var total = 0;
      var cgv6Count = 0;
      for (var key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        var size = (localStorage.getItem(key) || "").length;
        total += size;
        if (key.startsWith("cgv6_")) cgv6Count++;
      }
      return { totalKB: Math.round(total / 1024), cgv6Keys: cgv6Count, totalBytes: total };
    } catch(e) { return { totalKB: 0, cgv6Keys: 0, totalBytes: 0 }; }
  };

  window.perfMon82GetNPCStats = function() {
    var npcs = window.npcs || [];
    return {
      total: npcs.length,
      alive: npcs.filter(function(n) { return n && !n.dead; }).length,
      dead: npcs.filter(function(n) { return n && n.dead; }).length,
      arraySize: JSON.stringify(npcs).length,
      arraySizeKB: Math.round(JSON.stringify(npcs).length / 1024)
    };
  };

  function takeSnapshot() {
    var report = window.perfMon82GetReport();
    var storage = window.perfMon82GetLocalStorageSize();
    var snap = {
      time: Date.now(),
      year: window.year || 0,
      fps: report.fps,
      avgTickMs: report.avgTickMs,
      peakTickMs: report.peakTickMs,
      droppedPct: report.droppedPct,
      score: report.score,
      storageKB: storage.totalKB,
      npcCount: (window.npcs || []).length
    };
    window.perfMonitorV82Data.history.push(snap);
    if (window.perfMonitorV82Data.history.length > 30) window.perfMonitorV82Data.history.shift();
    try {
      var saveData = { history: window.perfMonitorV82Data.history, thresholds: window.perfMonitorV82Data.thresholds, peakTickMs: window.perfMonitorV82Data.peakTickMs };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        if (parsed.history) window.perfMonitorV82Data.history = parsed.history;
        if (parsed.thresholds) window.perfMonitorV82Data.thresholds = parsed.thresholds;
        if (parsed.peakTickMs) window.perfMonitorV82Data.peakTickMs = parsed.peakTickMs;
      }
    } catch(e) {}
  }

  function buildUI() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildUI, 800); return; }
    var existing = document.getElementById("perfmon82-wrapper");
    if (existing) return;

    var wrapper = document.createElement("div");
    wrapper.id = "perfmon82-wrapper";
    wrapper.style.cssText = "margin-top:12px;border-top:1px solid rgba(248,113,113,0.15);padding-top:12px";

    wrapper.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:11px;font-weight:700;color:#f87171;letter-spacing:1px">⚡ PERFORMANCE MONITOR V82</div>' +
        '<button onclick="window.perfMon82Toggle()" id="perfmon82-toggle" style="background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#f87171;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer">■ Live</button>' +
      '</div>' +
      '<div id="perfmon82-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px"></div>' +
      '<div id="perfmon82-bars" style="margin-bottom:8px"></div>' +
      '<div id="perfmon82-alerts" style="max-height:80px;overflow-y:auto"></div>';

    container.appendChild(wrapper);
    updateUI();
  }

  function updateUI() {
    var grid = document.getElementById("perfmon82-grid");
    var bars = document.getElementById("perfmon82-bars");
    var alertsEl = document.getElementById("perfmon82-alerts");
    if (!grid) return;

    var report = window.perfMon82GetReport();
    var storage = window.perfMon82GetLocalStorageSize();
    var scoreColor = report.score >= 80 ? "#4ade80" : report.score >= 50 ? "#facc15" : "#f87171";

    function metricCard(icon, val, label, color) {
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px;text-align:center">' +
        '<div style="font-size:14px">' + icon + '</div>' +
        '<div style="color:' + color + ';font-weight:700;font-size:11px">' + val + '</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.35)">' + label + '</div></div>';
    }

    var tickColor = report.avgTickMs > 50 ? "#f87171" : report.avgTickMs > 16 ? "#facc15" : "#4ade80";
    grid.innerHTML =
      metricCard("⚡", report.fps + "/s", "Tick/Giây", "#60a5fa") +
      metricCard("⏱️", report.avgTickMs + "ms", "Avg Tick", tickColor) +
      metricCard("💾", storage.totalKB + "KB", "Storage", storage.totalKB > 4000 ? "#f87171" : "#4ade80") +
      metricCard("🏆", report.score + "%", "Perf Score", scoreColor);

    function perfBar(label, val, max, unit, warnVal, critVal) {
      var pct = Math.min(100, Math.round((val / max) * 100));
      var color = val >= critVal ? "#f87171" : val >= warnVal ? "#facc15" : "#4ade80";
      return '<div style="margin-bottom:5px"><div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(232,232,240,0.5);margin-bottom:2px"><span>' + label + '</span><span style="color:' + color + '">' + val + unit + '</span></div>' +
        '<div style="background:rgba(255,255,255,0.06);border-radius:3px;height:4px"><div style="width:' + pct + '%;background:' + color + ';height:100%;border-radius:3px;transition:width .3s"></div></div></div>';
    }

    bars.innerHTML =
      perfBar("Avg Tick Time", report.avgTickMs, 100, "ms", 16, 50) +
      perfBar("Peak Tick", report.peakTickMs, 200, "ms", 30, 100) +
      perfBar("Dropped Ticks", report.droppedPct, 100, "%", 5, 20) +
      perfBar("localStorage", storage.totalKB, 5000, "KB", 3500, 4500);

    if (report.alerts.length > 0) {
      alertsEl.innerHTML = report.alerts.map(function(a) {
        var c = a.level === "critical" ? "#f87171" : "#facc15";
        return '<div style="font-size:8px;color:' + c + ';padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">' + a.msg + '</div>';
      }).join("");
    } else {
      alertsEl.innerHTML = '<div style="font-size:8px;color:rgba(232,232,240,0.3)">✅ Không có cảnh báo hiệu năng</div>';
    }
  }

  var _uiInterval = null;
  window.perfMon82Toggle = function() {
    if (_uiInterval) {
      clearInterval(_uiInterval);
      _uiInterval = null;
      var btn = document.getElementById("perfmon82-toggle");
      if (btn) btn.textContent = "▶ Paused";
    } else {
      _uiInterval = setInterval(updateUI, 2000);
      var btn = document.getElementById("perfmon82-toggle");
      if (btn) btn.textContent = "■ Live";
    }
  };

  function wrapGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      window.perfMon82BeginTick();
      if (_orig) _orig();
      window.perfMon82EndTick();
    };
  }

  function init() {
    load();
    wrapGameTick();
    _snapshotInterval = setInterval(takeSnapshot, 30000);
    setTimeout(buildUI, 1500);
    _uiInterval = setInterval(updateUI, 2000);
    console.log("[Performance Monitor V82] Khởi động — đo tick time, render time, localStorage size.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22200); });
  } else {
    setTimeout(init, 22200);
  }
})();
