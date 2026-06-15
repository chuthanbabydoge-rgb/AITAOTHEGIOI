(function() {
  "use strict";

  // ============================================================
  // V119 — WorldStateManager (WSM)
  // Single Source of Truth cho toàn bộ Creator God V6
  // KHÔNG lưu localStorage riêng · KHÔNG ghi đè engine nào
  // Đọc từ tất cả SSOT hiện có · Broadcast canonical values
  // ============================================================

  var WSM_VERSION  = 119;
  var WSM_INIT_MS  = 26700;
  var _initDone    = false;
  var _tickCount   = 0;
  var _subscribers = [];
  var _lastRefresh = 0;

  // ── Master State (12 fields theo spec V119) ──────────────────
  var _state = {
    year:              0,
    gameTick:          0,
    population:        0,
    speciesCount:      0,
    civilizationCount: 0,
    cityCount:         0,
    eventCount:        0,
    warCount:          0,
    technologyLevel:   0,
    universeAge:       0,
    lastUpdate:        0,
    // Extended (không trong spec nhưng cần thiết)
    worldName:         "—",
    genre:             "—",
    aliveNPCs:         0,
    kingdoms:          0,
    empires:           0,
    activeCrises:      0,
    activeDisasters:   0,
    activePlagues:     0,
  };

  // ── get() ─────────────────────────────────────────────────────
  function get(key) {
    if (!key) return Object.assign({}, _state);
    return _state[key];
  }

  // ── update() — ghi vào state VÀ sync ngược window globals ─────
  function update(patch) {
    Object.assign(_state, patch);
    _state.lastUpdate = Date.now();

    // Sync ngược window globals để mọi panel đọc đúng
    try {
      // Year
      if (patch.year !== undefined && patch.year > 0) {
        window.year = patch.year;
      }
      // Population → window.world.population (V95 sync bridge sẽ đọc từ đây)
      if (patch.population !== undefined && patch.population > 0) {
        if (window.world && typeof window.world === 'object') {
          window.world.population = patch.population;
        }
      }
    } catch(e) {}

    // Notify tất cả subscribers
    for (var i = 0; i < _subscribers.length; i++) {
      try { _subscribers[i](_state); } catch(e) {}
    }
  }

  // ── subscribe() ───────────────────────────────────────────────
  function subscribe(fn) {
    if (typeof fn !== 'function') return function() {};
    _subscribers.push(fn);
    return function unsubscribe() {
      _subscribers = _subscribers.filter(function(f) { return f !== fn; });
    };
  }

  // ── CANONICAL POPULATION (priority cascade từ V95 sync bridge) ─
  function getCanonicalPop() {
    // Priority 1: V93 Life Engine (lev93GetCurrentPop)
    try {
      if (typeof window.lev93GetCurrentPop === 'function') {
        var p1 = window.lev93GetCurrentPop();
        if (p1 > 0) return p1;
      }
    } catch(e) {}

    // Priority 2: Sum species populations (V93 spv93Data)
    try {
      if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
        var sum2 = 0;
        window.spv93Data.species.forEach(function(s) { sum2 += (s.population || 0); });
        if (sum2 > 0) return sum2;
      }
    } catch(e) {}

    // Priority 3: lev93Data.totalPop
    try {
      if (window.lev93Data && window.lev93Data.totalPop > 0) {
        return window.lev93Data.totalPop;
      }
    } catch(e) {}

    // Priority 4: Alive NPCs
    try {
      if (Array.isArray(window.npcs)) {
        var alive = window.npcs.filter(function(n) {
          return n.status !== 'dead' && n.status !== 'deceased';
        }).length;
        if (alive > 0) return alive;
      }
    } catch(e) {}

    // Priority 5: window.world.population
    try {
      if (window.world && window.world.population > 0) return window.world.population;
    } catch(e) {}

    return 0;
  }

  // ── CANONICAL CIVILIZATIONS ───────────────────────────────────
  function getCanonicalCivs() {
    try {
      if (typeof window.cecV95GetAll === 'function') {
        return (window.cecV95GetAll() || []).length;
      }
    } catch(e) {}
    try {
      if (window.cecV95Data && Array.isArray(window.cecV95Data.civs)) {
        return window.cecV95Data.civs.length;
      }
    } catch(e) {}
    return 0;
  }

  // ── CANONICAL SPECIES ─────────────────────────────────────────
  function getCanonicalSpecies() {
    try {
      if (typeof window.spv93GetAlive === 'function') {
        return (window.spv93GetAlive() || []).length;
      }
    } catch(e) {}
    try {
      if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
        return window.spv93Data.species.filter(function(s) { return (s.population || 0) > 0; }).length;
      }
    } catch(e) {}
    return 0;
  }

  // ── CANONICAL WARS ────────────────────────────────────────────
  function getCanonicalWars() {
    try { return (window.warsActive || []).length; } catch(e) { return 0; }
  }

  // ── CANONICAL EVENTS ──────────────────────────────────────────
  function getCanonicalEvents() {
    try {
      var tl = window.eventTimeline || window.historicalTimeline || [];
      return Array.isArray(tl) ? tl.length : 0;
    } catch(e) { return 0; }
  }

  // ── CANONICAL TECH LEVEL ──────────────────────────────────────
  function getCanonicalTech() {
    try {
      if (typeof window.cecV95GetAll === 'function') {
        var civs = window.cecV95GetAll() || [];
        var maxT = 0;
        civs.forEach(function(c) { if ((c.techStage || 0) > maxT) maxT = c.techStage || 0; });
        if (maxT > 0) return maxT;
      }
    } catch(e) {}
    try { if (window.techData && window.techData.level > 0) return window.techData.level; } catch(e) {}
    return 0;
  }

  // ── CANONICAL CITIES ─────────────────────────────────────────
  function getCanonicalCities() {
    try {
      var ec = window.engCities;
      if (!ec) return 0;
      return Array.isArray(ec) ? ec.length : Object.keys(ec).length;
    } catch(e) { return 0; }
  }

  // ── CANONICAL KINGDOMS / EMPIRES ─────────────────────────────
  function getCanonicalKingdoms() {
    try {
      var kd = window.kingdomData || {};
      var k = Array.isArray(kd.kingdoms) ? kd.kingdoms : (kd.kingdoms ? Object.values(kd.kingdoms) : []);
      return k.length;
    } catch(e) { return 0; }
  }

  function getCanonicalEmpires() {
    try {
      var ed = window.empireData || {};
      var e = Array.isArray(ed.empires) ? ed.empires : (ed.empires ? Object.values(ed.empires) : []);
      return e.length;
    } catch(e) { return 0; }
  }

  // ── refresh() — Đọc TẤT CẢ engines → cập nhật _state ─────────
  function refresh() {
    _lastRefresh = Date.now();
    _tickCount++;

    var yr = window.year || 1;
    var w  = window.world || {};

    var pop  = getCanonicalPop();
    var civs = getCanonicalCivs();
    var sp   = getCanonicalSpecies();
    var wars = getCanonicalWars();
    var evts = getCanonicalEvents();
    var tech = getCanonicalTech();
    var cit  = getCanonicalCities();
    var kng  = getCanonicalKingdoms();
    var emp  = getCanonicalEmpires();

    var aliveNPCs = 0;
    try {
      if (Array.isArray(window.npcs)) {
        aliveNPCs = window.npcs.filter(function(n) { return n.status !== 'dead' && n.status !== 'deceased'; }).length;
      }
    } catch(e) {}

    var crises = 0, disasters = 0, plagues = 0;
    try { crises    = (window.econCrisisData && window.econCrisisData.active) ? window.econCrisisData.active.length : 0; } catch(e) {}
    try { disasters = (window.disasterData   && window.disasterData.active)   ? window.disasterData.active.length   : 0; } catch(e) {}
    try { plagues   = (window.plagueData     && window.plagueData.active)     ? window.plagueData.active.length     : 0; } catch(e) {}

    var uniAge = yr - (w.created || 0);

    update({
      year:              yr,
      gameTick:          _tickCount,
      population:        pop,
      speciesCount:      sp,
      civilizationCount: civs,
      cityCount:         cit,
      eventCount:        evts,
      warCount:          wars,
      technologyLevel:   tech,
      universeAge:       uniAge > 0 ? uniAge : yr,
      worldName:         w.name  || "—",
      genre:             w.genre || "—",
      aliveNPCs:         aliveNPCs,
      kingdoms:          kng,
      empires:           emp,
      activeCrises:      crises,
      activeDisasters:   disasters,
      activePlagues:     plagues,
    });

    return _state;
  }

  // ── Expose public API ─────────────────────────────────────────
  window.WorldStateManager = {
    get:           get,
    update:        update,
    subscribe:     subscribe,
    refresh:       refresh,
    getVersion:    function() { return WSM_VERSION; },
    isReady:       function() { return _initDone; },
    getState:      function() { return Object.assign({}, _state); },
    // Shorthand helpers
    getYear:       function() { return _state.year; },
    getPop:        function() { return _state.population; },
    getCivCount:   function() { return _state.civilizationCount; },
    getWarCount:   function() { return _state.warCount; },
    getWorldName:  function() { return _state.worldName; },
  };

  // Alias ngắn
  window.WSM = window.WorldStateManager;

  // ── Hook vào gameTick (_orig pattern) ─────────────────────────
  function hookGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig.apply(this, arguments);
      try { refresh(); } catch(e) {}
    };
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    refresh();
    hookGameTick();
    _initDone = true;
    console.log("[WorldStateManager V119] ✅ SSOT khởi động — window.WSM / window.WorldStateManager sẵn sàng.");
    console.log("[WorldStateManager V119] State ban đầu:", {
      year: _state.year, pop: _state.population,
      civs: _state.civilizationCount, wars: _state.warCount, species: _state.speciesCount
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, WSM_INIT_MS); });
  } else {
    setTimeout(init, WSM_INIT_MS);
  }
})();
