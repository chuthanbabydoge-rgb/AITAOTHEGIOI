// ═══════════════════════════════════════════════════════════════
// AGE PROGRESSION ENGINE V43 — Creator God World Simulator
// Tính điểm tiến hóa theo 7 điều kiện chuyển đổi kỷ nguyên
// Save: cgv6_age_prog_v43
// ═══════════════════════════════════════════════════════════════
(function() {
"use strict";

const SAVE_KEY = "cgv6_age_prog_v43";
const TICK_RATE = 5;
var _tick = 0;

// ── Thresholds cho từng kỷ nguyên ──────────────────────────────
const AGE_THRESHOLDS = {
  CHAOS:       { population:0,       nations:0,  empires:0, universes:0, portals:0, gods:0,  civs:0 },
  MYTHIC:      { population:100,     nations:1,  empires:0, universes:0, portals:0, gods:3,  civs:0 },
  HEROIC:      { population:500,     nations:3,  empires:0, universes:0, portals:0, gods:0,  civs:0 },
  ANCIENT:     { population:2000,    nations:5,  empires:0, universes:0, portals:0, gods:0,  civs:0 },
  IMPERIAL:    { population:10000,   nations:8,  empires:1, universes:0, portals:0, gods:0,  civs:0 },
  RENAISSANCE: { population:20000,   nations:10, empires:2, universes:0, portals:0, gods:0,  civs:0 },
  INDUSTRIAL:  { population:50000,   nations:12, empires:3, universes:0, portals:0, gods:0,  civs:0 },
  DIGITAL:     { population:100000,  nations:15, empires:3, universes:0, portals:0, gods:0,  civs:1 },
  SPACE:       { population:200000,  nations:15, empires:0, universes:2, portals:0, gods:0,  civs:0 },
  INTERVERSE:  { population:500000,  nations:0,  empires:0, universes:5, portals:3, gods:0,  civs:0 },
  MULTIVERSE:  { population:1000000, nations:0,  empires:0, universes:10,portals:5, gods:0,  civs:0 },
  GENESIS:     { population:5000000, nations:0,  empires:0, universes:20,portals:10,gods:0,  civs:0 }
};

window.apeData = {
  scores: {},
  lastStats: {},
  tick: 0
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.apeData)); } catch(e){}
}
function load() {
  try {
    var d = localStorage.getItem(SAVE_KEY);
    if (d) { var p = JSON.parse(d); window.apeData = Object.assign(window.apeData, p); }
  } catch(e){}
}

function _getStats() {
  var pop  = (window.world && window.world.population) ? window.world.population : 0;
  var nats = window.countries ? window.countries.length : 0;
  var emps = 0;
  if (window.empireData) {
    var e = window.empireData.empires;
    emps = Array.isArray(e)
      ? e.filter(function(x){ return x && x.status !== "fallen"; }).length
      : Object.values(e||{}).filter(function(x){ return x && x.status !== "fallen"; }).length;
  }
  var wars  = window.warsActive ? window.warsActive.length : 0;
  var univs = 0;
  if (window.mvData && window.mvData.universes) {
    univs = window.mvData.universes.filter(function(u){ return u.status === "active"; }).length;
  }
  var ports = window.pnGetOpenPortals ? window.pnGetOpenPortals().length : 0;
  var gods  = window.npcs ? window.npcs.filter(function(n){ return n.type==="god"||n.role==="god"; }).length : 0;
  var civs  = window.civEvoData ? Object.keys(window.civEvoData.civilizations||{}).length : 0;
  return { population:pop, nations:nats, empires:emps, wars:wars, universes:univs, portals:ports, gods:gods, civs:civs };
}

function _calcScore(stats, thresh) {
  var keys = Object.keys(thresh);
  if (keys.length === 0) return 100;
  var total = 0;
  var count = 0;
  keys.forEach(function(k) {
    var req = thresh[k];
    if (req <= 0) { total += 100; count++; return; }
    var val = stats[k] || 0;
    var pct = Math.min(100, Math.round((val / req) * 100));
    total += pct;
    count++;
  });
  return count > 0 ? Math.round(total / count) : 0;
}

function _updateScores() {
  var stats = _getStats();
  window.apeData.lastStats = stats;
  var scores = {};
  Object.keys(AGE_THRESHOLDS).forEach(function(id) {
    scores[id] = _calcScore(stats, AGE_THRESHOLDS[id]);
  });
  window.apeData.scores = scores;
  window.apeData.tick++;
}

// ── API ───────────────────────────────────────────────────────
window.apeGetProgress = function(ageId) {
  return window.apeData.scores[ageId] !== undefined ? window.apeData.scores[ageId] : 0;
};

window.apeGetAllScores = function() {
  return window.apeData.scores || {};
};

window.apeGetCurrentStats = function() {
  return window.apeData.lastStats || {};
};

window.apeGetConditionDetail = function(ageId) {
  var thresh = AGE_THRESHOLDS[ageId];
  if (!thresh) return [];
  var stats = window.apeData.lastStats || _getStats();
  return Object.keys(thresh).map(function(k) {
    var req = thresh[k];
    var val = stats[k] || 0;
    var pct = req <= 0 ? 100 : Math.min(100, Math.round((val/req)*100));
    return { key:k, required:req, current:val, pct:pct, met: val >= req };
  });
};

// ── Tick ──────────────────────────────────────────────────────
window.apeV43Tick = function() {
  _tick++;
  if (_tick % TICK_RATE === 0) {
    _updateScores();
    if (_tick % 25 === 0) save();
  }
};

// ── Init ──────────────────────────────────────────────────────
function init() {
  load();
  _updateScores();
  var _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); window.apeV43Tick(); };
  console.log("[AgeProgressionEngine V43] 📊 Tính điểm tiến hóa 12 kỷ nguyên — 7 điều kiện chuyển đổi sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 3000); });
} else {
  setTimeout(init, 3000);
}
})();
