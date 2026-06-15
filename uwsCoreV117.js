(function() {
  "use strict";

  // V117 — UWS Core
  // Tạo window.UWS — single read-only aggregation object cho toàn bộ UI
  // KHÔNG lưu localStorage, KHÔNG ghi đè engine nào

  var _tickCount = 0;
  var _sessionStart = Date.now();
  var _refreshInterval = 5; // refresh mỗi N tick

  // ── Build UWS snapshot ──
  function buildUWS() {
    var worldSnap  = (typeof window.uwsGetWorldSnapshot  === "function") ? window.uwsGetWorldSnapshot()  : {};
    var entitySnap = (typeof window.uwsGetEntitySnapshot === "function") ? window.uwsGetEntitySnapshot() : {};
    var eventSnap  = (typeof window.uwsGetEventSnapshot  === "function") ? window.uwsGetEventSnapshot()  : {};

    // Tính tổng population từ nhiều nguồn
    var totalPop = 0;
    try {
      var lifePop = entitySnap.lifePop || 0;
      var npcPop  = entitySnap.npcs ? entitySnap.npcs.alive : 0;
      var worldPop = worldSnap.population || 0;
      totalPop = Math.max(lifePop, worldPop, npcPop);
    } catch(e) {}

    // Đếm engines đang chạy
    var engineCount = 0;
    try {
      var engineProbes = [
        "gameTick","kingdomData","empireData","warsActive","allianceData",
        "disasterData","plagueData","ageV25Data","cecV95Data","spv93Data",
        "lev93Data","wacV92Data","aeeData","puosData"
      ];
      engineProbes.forEach(function(k) { if (window[k] !== undefined) engineCount++; });
    } catch(e) {}

    window.UWS = {
      _version:     117,
      _lastUpdated: Date.now(),
      _tick:        _tickCount,
      _sessionAge:  Math.floor((Date.now() - _sessionStart) / 1000),

      // === WORLD LAYER ===
      world: worldSnap,

      // === ENTITY LAYER ===
      entities: entitySnap,

      // === EVENT LAYER ===
      events: eventSnap,

      // === SUMMARY (computed) ===
      summary: {
        totalPopulation: totalPop,
        activeWars:      (eventSnap.wars     ? eventSnap.wars.active     : 0),
        activeDisasters: (eventSnap.disasters ? eventSnap.disasters.active : 0),
        activePlagues:   (eventSnap.plagues   ? eventSnap.plagues.active   : 0),
        totalKingdoms:   (entitySnap.kingdoms ? entitySnap.kingdoms.total  : 0),
        totalEmpires:    (entitySnap.empires  ? entitySnap.empires.total   : 0),
        totalCivs:       (entitySnap.civs     ? entitySnap.civs.total      : 0),
        totalSpecies:    (entitySnap.species  ? entitySnap.species.total   : 0),
        totalNPCs:       (entitySnap.npcs     ? entitySnap.npcs.total      : 0),
        aliveNPCs:       (entitySnap.npcs     ? entitySnap.npcs.alive      : 0),
        currentAge:      (worldSnap.age       ? worldSnap.age.current      : "—"),
        currentYear:     worldSnap.year || window.year || 1,
        worldName:       worldSnap.name || "—",
        genre:           worldSnap.genre || "—",
      },

      // === META ===
      meta: {
        tickCount:    _tickCount,
        sessionStart: _sessionStart,
        engineCount:  engineCount,
        refreshRate:  _refreshInterval,
      }
    };
  }

  // ── Hook vào gameTick (KHÔNG ghi đè, dùng _orig pattern) ──
  function hookGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig.apply(this, arguments);
      _tickCount++;
      if (_tickCount % _refreshInterval === 0) {
        try { buildUWS(); } catch(e) {}
      }
    };
  }

  // ── Public API ──
  window.uwsRefresh = function() {
    try { buildUWS(); } catch(e) { console.warn("[UWS V117] refresh error:", e); }
    return window.UWS;
  };

  window.uwsGet = function(path) {
    if (!window.UWS) return undefined;
    if (!path) return window.UWS;
    var parts = path.split(".");
    var obj = window.UWS;
    for (var i = 0; i < parts.length; i++) {
      if (obj == null) return undefined;
      obj = obj[parts[i]];
    }
    return obj;
  };

  window.uwsGetSummary = function() {
    if (!window.UWS) window.uwsRefresh();
    return window.UWS ? window.UWS.summary : {};
  };

  function init() {
    // Build lần đầu
    buildUWS();
    // Hook vào gameTick để tự động refresh
    hookGameTick();
    console.log("[UWS Core V117] 🌐 window.UWS khởi động — Single Source of Truth cho toàn bộ UI.");
    console.log("[UWS Core V117] Summary:", window.UWS ? window.UWS.summary : "(empty)");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26400); });
  } else {
    setTimeout(init, 26400);
  }
})();
