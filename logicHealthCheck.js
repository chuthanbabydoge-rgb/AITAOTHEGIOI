(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════
  // LOGIC HEALTH CHECK V96
  // Tự động kiểm tra data consistency mỗi 60 giây
  // Phát hiện drift giữa các data sources và in cảnh báo ra console
  // Không lưu state, không ghi đè engine nào — pure diagnostic
  // ══════════════════════════════════════════════════════════════════

  var VERSION = 'V96';
  var CHECK_INTERVAL = 60000; // 60 giây
  var _checkCount = 0;
  var _lastReport = null;
  var _ticksSeen = 0;
  var _lastTickYear = 0;

  // ── Theo dõi gameTick có thực sự fire không ───────────────────────
  (function hookGameTickMonitor() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      _ticksSeen++;
    };
  })();

  // ── Helpers ───────────────────────────────────────────────────────
  function fmtNum(n) {
    if (n == null) return '?';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }

  function ok(label)   { return '%c✅ ' + label; }
  function warn(label) { return '%c⚠️  ' + label; }
  function err(label)  { return '%c❌ ' + label; }
  var CSS_OK   = 'color:#22c55e;font-weight:bold';
  var CSS_WARN = 'color:#f59e0b;font-weight:bold';
  var CSS_ERR  = 'color:#ef4444;font-weight:bold';

  // ── CHECK 1: Population consistency ───────────────────────────────
  function checkPopulation() {
    var issues = [];
    var sources = {};

    // Source A: V93 Life Engine (SSOT)
    if (typeof window.lev93GetCurrentPop === 'function') {
      sources.lev93 = window.lev93GetCurrentPop();
    } else if (window.lev93Data) {
      sources.lev93 = window.lev93Data.globalPop || 0;
    }

    // Source B: V93 Species sum
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      sources.spv93 = window.spv93Data.species.reduce(function(s, sp) {
        return s + (sp.population || 0);
      }, 0);
    }

    // Source C: app.js npcs
    if (Array.isArray(window.npcs)) {
      sources.npcs = window.npcs.filter(function(n) { return n && n.status === 'alive'; }).length;
    }

    // Source D: countries population sum
    if (Array.isArray(window.countries)) {
      sources.countries = window.countries.reduce(function(s, c) {
        return s + (c && c.population ? c.population : 0);
      }, 0);
    }

    // Kiểm tra drift giữa SSOT (lev93) và spv93
    if (sources.lev93 != null && sources.spv93 != null) {
      var diff = Math.abs(sources.lev93 - sources.spv93);
      var pct  = sources.spv93 > 0 ? (diff / sources.spv93 * 100) : 0;
      if (pct > 20) {
        issues.push('lev93(' + fmtNum(sources.lev93) + ') vs spv93(' + fmtNum(sources.spv93) + ') drift ' + pct.toFixed(0) + '%');
      }
    }

    // Kiểm tra populationHistory trống
    if (window.lev93Data && Array.isArray(window.lev93Data.populationHistory)) {
      if (window.lev93Data.populationHistory.length === 0 && (sources.lev93 || 0) > 0) {
        issues.push('populationHistory trống dù globalPop = ' + fmtNum(sources.lev93));
      }
    }

    return { sources: sources, issues: issues };
  }

  // ── CHECK 2: Civilization consistency ─────────────────────────────
  function checkCivilization() {
    var issues = [];
    var sources = {};

    // Source A: V95 (SSOT)
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs)) {
      sources.v95 = window.cecV95Data.civs.length;
    }

    // Source B: countries (fallback)
    if (Array.isArray(window.countries)) {
      sources.countries = window.countries.filter(function(c) {
        return c && c.population > 0;
      }).length;
    }

    // Source C: V38
    if (window.civEvoData && Array.isArray(window.civEvoData.civilizations)) {
      sources.v38 = window.civEvoData.civilizations.length;
    }

    // Drift V95 vs countries
    if (sources.v95 != null && sources.countries != null) {
      if (Math.abs(sources.v95 - sources.countries) > 3) {
        issues.push('cecV95Data.civs(' + sources.v95 + ') vs countries(' + sources.countries + ') lệch ' + Math.abs(sources.v95 - sources.countries));
      }
    }

    return { sources: sources, issues: issues };
  }

  // ── CHECK 3: Year / elapsed drift ─────────────────────────────────
  function checkYear() {
    var issues = [];
    var windowYear = window.year || 1;
    var wacElapsed = window.wacV92Data ? window.wacV92Data.totalYearsElapsed : null;
    var wacStart   = window.wacV92Data ? (window.wacV92Data.startYear || 1) : 1;
    var expected   = windowYear - wacStart;

    if (wacElapsed != null && expected > 0) {
      var drift = Math.abs(wacElapsed - expected);
      if (drift > 5) {
        issues.push('totalYearsElapsed(' + wacElapsed + ') vs expected(' + expected + ') drift=' + drift + ' năm');
      }
    }

    return {
      windowYear: windowYear,
      wacElapsed: wacElapsed,
      wacStart:   wacStart,
      issues:     issues
    };
  }

  // ── CHECK 4: gameTick chain đang fire ─────────────────────────────
  function checkGameTick() {
    var issues = [];
    var currentYear = window.year || 1;
    var ticksThisPeriod = _ticksSeen;

    if (window.world && window.world.name) {
      // Nếu có world nhưng không có tick nào trong 60s → cảnh báo
      if (ticksThisPeriod === 0 && _checkCount > 1) {
        issues.push('gameTick chain KHÔNG fire trong 60s — simulateWorld() có thể bị dừng');
      }
    }

    // Reset counter
    var snapshot = _ticksSeen;
    _ticksSeen = 0;

    return { ticksThisPeriod: snapshot, issues: issues };
  }

  // ── CHECK 5: Event count consistency ──────────────────────────────
  function checkEvents() {
    var issues = [];
    var sources = {};

    if (window.wchV92Data && Array.isArray(window.wchV92Data.events)) {
      sources.chronicle = window.wchV92Data.events.length;
    }
    if (window.cevV95Data) {
      sources.v95Civ = window.cevV95Data.totalEvents || 0;
    }
    if (window.aeeV92Data && Array.isArray(window.aeeV92Data.events)) {
      sources.autonomous = window.aeeV92Data.events.length;
    }
    try {
      var ht = localStorage.getItem('cgv6_historical_timeline');
      if (ht) { var p = JSON.parse(ht); sources.historicalTimeline = (p.events || []).length; }
    } catch(e) {}

    var total = 0;
    Object.keys(sources).forEach(function(k) { total += sources[k] || 0; });

    if (total === 0 && window.world && window.world.name && (window.year || 1) > 10) {
      issues.push('Tổng sự kiện = 0 sau năm ' + (window.year || 1) + ' — các event engine có thể không fire');
    }

    return { sources: sources, total: total, issues: issues };
  }

  // ── CHECK 6: Double-evolution guard ───────────────────────────────
  function checkDoubleEvolution() {
    var issues = [];
    var v94Active = window.laeV94Data && window.laeV94Data.activated;
    // Không thể kiểm tra runtime trực tiếp, nhưng kiểm tra V94 state
    if (!v94Active && window.world && window.world.name && (window.year || 1) > 5) {
      issues.push('laeV94Data.activated = false — V94 Life Activation chưa khởi động đúng');
    }
    return { v94Active: !!v94Active, issues: issues };
  }

  // ── Tổng hợp & in report ──────────────────────────────────────────
  function runCheck() {
    _checkCount++;
    if (!window.world || !window.world.name) {
      // Chưa có thế giới — chỉ kiểm tra gameTick
      var gt = checkGameTick();
      _lastReport = { status: 'NO_WORLD', checkCount: _checkCount, timestamp: Date.now() };
      return;
    }

    var popResult  = checkPopulation();
    var civResult  = checkCivilization();
    var yearResult = checkYear();
    var tickResult = checkGameTick();
    var evtResult  = checkEvents();
    var devoResult = checkDoubleEvolution();

    var allIssues = [].concat(
      popResult.issues,
      civResult.issues,
      yearResult.issues,
      tickResult.issues,
      evtResult.issues,
      devoResult.issues
    );

    _lastReport = {
      checkCount:  _checkCount,
      timestamp:   Date.now(),
      year:        yearResult.windowYear,
      population:  popResult.sources,
      civilization: civResult.sources,
      events:      evtResult.sources,
      ticksLastPeriod: tickResult.ticksThisPeriod,
      issueCount:  allIssues.length,
      issues:      allIssues
    };

    // ── In ra console ─────────────────────────────────────────────
    var groupLabel = '[LogicHealthCheck ' + VERSION + '] Kiểm Tra #' + _checkCount
      + ' · Năm ' + yearResult.windowYear
      + ' · ' + (allIssues.length === 0 ? '✅ Sạch' : '⚠️ ' + allIssues.length + ' vấn đề');

    console.groupCollapsed(groupLabel);

    // Population
    var popSrc = popResult.sources;
    var popLine = '  lev93=' + fmtNum(popSrc.lev93) + ' | spv93=' + fmtNum(popSrc.spv93)
      + ' | npcs=' + fmtNum(popSrc.npcs);
    if (popResult.issues.length === 0) {
      console.log(ok('Dân Số'), CSS_OK, popLine);
    } else {
      popResult.issues.forEach(function(i) { console.warn(warn('Dân Số'), CSS_WARN, i); });
    }

    // Civilization
    var civSrc = civResult.sources;
    var civLine = '  v95=' + (civSrc.v95 != null ? civSrc.v95 : '?')
      + ' | countries=' + (civSrc.countries != null ? civSrc.countries : '?')
      + ' | v38=' + (civSrc.v38 != null ? civSrc.v38 : '?');
    if (civResult.issues.length === 0) {
      console.log(ok('Văn Minh'), CSS_OK, civLine);
    } else {
      civResult.issues.forEach(function(i) { console.warn(warn('Văn Minh'), CSS_WARN, i); });
    }

    // Year
    var yrLine = '  year=' + yearResult.windowYear
      + ' | elapsed=' + yearResult.wacElapsed
      + ' | start=' + yearResult.wacStart;
    if (yearResult.issues.length === 0) {
      console.log(ok('Năm Tháng'), CSS_OK, yrLine);
    } else {
      yearResult.issues.forEach(function(i) { console.warn(warn('Năm Tháng'), CSS_WARN, i); });
    }

    // gameTick
    var tickLine = '  ticks/60s=' + tickResult.ticksThisPeriod;
    if (tickResult.issues.length === 0) {
      console.log(ok('gameTick Chain'), CSS_OK, tickLine);
    } else {
      tickResult.issues.forEach(function(i) { console.error(err('gameTick Chain'), CSS_ERR, i); });
    }

    // Events
    var evtSrc = evtResult.sources;
    var evtLine = '  chronicle=' + (evtSrc.chronicle || 0)
      + ' | v95civ=' + (evtSrc.v95Civ || 0)
      + ' | autonomous=' + (evtSrc.autonomous || 0)
      + ' | htTimeline=' + (evtSrc.historicalTimeline || 0)
      + ' | TỔNG=' + evtResult.total;
    if (evtResult.issues.length === 0) {
      console.log(ok('Sự Kiện'), CSS_OK, evtLine);
    } else {
      evtResult.issues.forEach(function(i) { console.warn(warn('Sự Kiện'), CSS_WARN, i); });
    }

    // Double-evolution
    var devoLine = '  V94 active=' + devoResult.v94Active;
    if (devoResult.issues.length === 0) {
      console.log(ok('Double-Evolution Guard'), CSS_OK, devoLine);
    } else {
      devoResult.issues.forEach(function(i) { console.warn(warn('Double-Evolution'), CSS_WARN, i); });
    }

    // Tóm tắt issues
    if (allIssues.length > 0) {
      console.warn('%c⚠️ ' + allIssues.length + ' vấn đề phát hiện:', CSS_WARN);
      allIssues.forEach(function(issue, idx) {
        console.warn('  ' + (idx + 1) + '. ' + issue);
      });
    }

    console.groupEnd();
  }

  // ── Public API ────────────────────────────────────────────────────
  window.lhcV96RunCheck    = function() { runCheck(); return _lastReport; };
  window.lhcV96GetReport   = function() { return _lastReport; };
  window.lhcV96GetIssues   = function() { return _lastReport ? _lastReport.issues : []; };

  // Tiện ích nhanh cho Jarvis/console
  window.lhcV96Summary = function() {
    var r = _lastReport;
    if (!r) return 'Chưa có báo cáo. Gọi lhcV96RunCheck() để kiểm tra.';
    if (r.status === 'NO_WORLD') return 'Chưa có thế giới — không cần kiểm tra.';
    return 'Check #' + r.checkCount + ' · Năm ' + r.year
      + ' · Pop=' + fmtNum((r.population || {}).lev93)
      + ' · Civs=' + ((r.civilization || {}).v95 != null ? r.civilization.v95 : '?')
      + ' · Events=' + r.events.total
      + ' · Ticks/60s=' + r.ticksLastPeriod
      + ' · Issues=' + r.issueCount;
  };

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    // Kiểm tra lần đầu sau 5 giây để chờ các engine khởi động
    setTimeout(runCheck, 5000);
    // Kiểm tra định kỳ mỗi 60 giây
    setInterval(runCheck, CHECK_INTERVAL);

    console.log('[LogicHealthCheck ' + VERSION + '] 🩺 Khởi động — Kiểm tra consistency mỗi 60s · lhcV96RunCheck() để kiểm tra ngay.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 26000); });
  } else {
    setTimeout(init, 26000);
  }

})();
