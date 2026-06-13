// ═══════════════════════════════════════════════════════════════
// AGE ANALYTICS V43 — Creator God World Simulator
// Thống kê, dự báo và phân tích kỷ nguyên
// Save: cgv6_age_analytics_v43
// ═══════════════════════════════════════════════════════════════
(function() {
"use strict";

const SAVE_KEY = "cgv6_age_analytics_v43";
const TICK_RATE = 15;
var _tick = 0;

window.ageAnalyticsData = {
  durationByAge: {},
  stabilityHistory: [],
  forecastAge: null,
  forecastConfidence: 0,
  snapshots: []
};

function save() {
  try {
    var compact = {
      durationByAge: window.ageAnalyticsData.durationByAge,
      stabilityHistory: window.ageAnalyticsData.stabilityHistory.slice(-50),
      forecastAge: window.ageAnalyticsData.forecastAge,
      forecastConfidence: window.ageAnalyticsData.forecastConfidence,
      snapshots: window.ageAnalyticsData.snapshots.slice(-30)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
  } catch(e){}
}
function load() {
  try {
    var d = localStorage.getItem(SAVE_KEY);
    if (d) { var p = JSON.parse(d); window.ageAnalyticsData = Object.assign(window.ageAnalyticsData, p); }
  } catch(e){}
}

// ── Stability Score ───────────────────────────────────────────
function _calcStability() {
  var wars  = window.warsActive ? window.warsActive.length : 0;
  var nats  = window.countries ? window.countries.length : 1;
  var pop   = (window.world && window.world.population) ? window.world.population : 0;
  var score = 100;
  score -= Math.min(40, wars * 8);
  if (pop < 100) score -= 20;
  return Math.max(0, Math.min(100, score));
}

// ── Forecast ─────────────────────────────────────────────────
function _calcForecast() {
  var scores = window.apeGetAllScores ? window.apeGetAllScores() : {};
  var curId  = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
  var allAges = window.waeGetAllAges ? window.waeGetAllAges() : [];

  var best = null, bestScore = -1;
  allAges.forEach(function(age) {
    if (age.id === curId) return;
    var sc = scores[age.id] || 0;
    if (sc > bestScore) { bestScore = sc; best = age.id; }
  });
  window.ageAnalyticsData.forecastAge       = best;
  window.ageAnalyticsData.forecastConfidence = Math.min(99, bestScore);
}

// ── Duration Tracking ─────────────────────────────────────────
function _updateDuration() {
  var curId  = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
  var start  = (window.worldAgeData && window.worldAgeData.startYear)  ? window.worldAgeData.startYear  : 1;
  var yr     = window.year || 1;
  if (!window.ageAnalyticsData.durationByAge[curId]) {
    window.ageAnalyticsData.durationByAge[curId] = 0;
  }
  window.ageAnalyticsData.durationByAge[curId] = Math.max(
    window.ageAnalyticsData.durationByAge[curId],
    yr - start
  );
}

// ── Snapshots ─────────────────────────────────────────────────
function _takeSnapshot() {
  var yr    = window.year || 1;
  var curId = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
  var stab  = _calcStability();
  window.ageAnalyticsData.stabilityHistory.push({ year:yr, score:stab });
  if (window.ageAnalyticsData.stabilityHistory.length > 60) {
    window.ageAnalyticsData.stabilityHistory = window.ageAnalyticsData.stabilityHistory.slice(-60);
  }
  window.ageAnalyticsData.snapshots.push({
    year: yr, age: curId, stability: stab,
    pop: (window.world && window.world.population) ? window.world.population : 0
  });
  if (window.ageAnalyticsData.snapshots.length > 30) {
    window.ageAnalyticsData.snapshots = window.ageAnalyticsData.snapshots.slice(-30);
  }
}

// ── API ───────────────────────────────────────────────────────
window.aanGetStats = function() {
  var curId  = (window.worldAgeData && window.worldAgeData.currentAge) ? window.worldAgeData.currentAge : "CHAOS";
  var start  = (window.worldAgeData && window.worldAgeData.startYear)  ? window.worldAgeData.startYear  : 1;
  var yr     = window.year || 1;
  var hist   = window.waeGetHistory ? window.waeGetHistory() : [];
  return {
    currentAge:     curId,
    currentDuration: yr - start,
    totalTransitions: hist.length,
    stability:      _calcStability(),
    durationByAge:  window.ageAnalyticsData.durationByAge,
    totalFiredEvents: (window.ageEventData && window.ageEventData.totalFired) ? window.ageEventData.totalFired : 0,
    stabilityHistory: window.ageAnalyticsData.stabilityHistory.slice(-20)
  };
};

window.aanGetForecast = function() {
  return {
    nextAge:    window.ageAnalyticsData.forecastAge,
    confidence: window.ageAnalyticsData.forecastConfidence,
    scores:     window.apeGetAllScores ? window.apeGetAllScores() : {}
  };
};

window.aanGetStability = function() { return _calcStability(); };

window.aanGetSnapshots = function() { return window.ageAnalyticsData.snapshots.slice(-20); };

// ── Tick ─────────────────────────────────────────────────────
window.aanV43Tick = function() {
  _tick++;
  if (_tick % TICK_RATE === 0) {
    _updateDuration();
    _calcForecast();
    if (_tick % 30 === 0) {
      _takeSnapshot();
      save();
    }
  }
};

// ── Init ─────────────────────────────────────────────────────
function init() {
  load();
  _updateDuration();
  _calcForecast();
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); window.aanV43Tick(); };
  console.log("[AgeAnalytics V43] 📊 Phân tích & Dự báo Kỷ Nguyên khởi động — ổn định · thời gian · dự báo sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3200); });
} else {
  setTimeout(init, 3200);
}
})();
