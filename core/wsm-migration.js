(function() {
  "use strict";

  // ============================================================
  // V119 — WSM Migration Script (Phase 5)
  // Quét localStorage, tìm giá trị population/year tốt nhất
  // Merge vào WorldStateManager. Chạy 1 lần khi init.
  // KHÔNG xóa key cũ (EXPAND ONLY rule).
  // ============================================================

  var INIT_MS      = 27000;
  var MIGRATION_KEY = 'cgv6_wsm_migration_v119_done';

  // ── Các key chứa population data ─────────────────────────────
  var POPULATION_KEYS = [
    // Trực tiếp
    { key: 'cgv6_life_engine_v93', path: 'totalPop' },
    { key: 'cgv6_species_v93',     path: null, reducer: function(d) {
        var arr = Array.isArray(d) ? d : (d.species || []);
        return arr.reduce(function(s, sp) { return s + (sp.population || 0); }, 0);
    }},
    { key: 'cgv6_world',           path: 'population' },
    { key: 'cgv6_npcs',            path: null, reducer: function(d) {
        var arr = Array.isArray(d) ? d : [];
        return arr.filter(function(n) { return n.status !== 'dead' && n.status !== 'deceased'; }).length;
    }},
    // V95 civilizations
    { key: 'cgv6_civ_core_v95',    path: null, reducer: function(d) {
        return (d.civs || []).reduce(function(s, c) { return s + (c.population || c.popEstimate || 0); }, 0);
    }},
  ];

  // ── Đọc một key từ localStorage an toàn ─────────────────────
  function safeRead(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) { return null; }
  }

  // ── Đọc value theo path (dot notation) ───────────────────────
  function getPath(obj, path) {
    if (!path || !obj) return null;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return (typeof cur === 'number') ? cur : null;
  }

  // ── Phase 5: Migrate population ──────────────────────────────
  function migratePopulation() {
    var candidates = [];
    POPULATION_KEYS.forEach(function(def) {
      try {
        var data = safeRead(def.key);
        if (!data) return;
        var val = def.reducer ? def.reducer(data) : getPath(data, def.path);
        if (typeof val === 'number' && val > 0) {
          candidates.push({ source: def.key, value: val });
        }
      } catch(e) {}
    });

    if (candidates.length === 0) return 0;

    // Chọn giá trị cao nhất làm canonical
    candidates.sort(function(a, b) { return b.value - a.value; });
    var best = candidates[0];

    console.log("[WSM Migration V119] Population candidates:", candidates.map(function(c) {
      return c.source.replace('cgv6_', '') + '=' + c.value;
    }).join(' | '));
    console.log("[WSM Migration V119] ✅ Canonical population:", best.value, "← from", best.source);

    return best.value;
  }

  // ── Phase 5: Migrate year ─────────────────────────────────────
  function migrateYear() {
    var candidates = [];

    // Từ localStorage
    try { var yr = parseInt(localStorage.getItem('cgv6_year')); if (yr > 0) candidates.push(yr); } catch(e) {}

    // Từ window.year
    try { if (window.year > 0) candidates.push(window.year); } catch(e) {}

    // Từ world object
    try { if (window.world && window.world.year > 0) candidates.push(window.world.year); } catch(e) {}

    // Từ saved world
    try {
      var wd = safeRead('cgv6_world');
      if (wd && wd.year > 0) candidates.push(wd.year);
    } catch(e) {}

    if (candidates.length === 0) return 1;
    return Math.max.apply(null, candidates);
  }

  // ── Phase 5: Migrate civilizations ───────────────────────────
  function migrateCivs() {
    // Thứ tự ưu tiên: V95 runtime > V95 saved > V38 emergent
    try {
      if (typeof window.cecV95GetAll === 'function') {
        return (window.cecV95GetAll() || []).length;
      }
    } catch(e) {}
    try {
      var cd = safeRead('cgv6_civ_core_v95');
      if (cd && Array.isArray(cd.civs)) return cd.civs.length;
    } catch(e) {}
    return 0;
  }

  // ── Phase 5: Migrate wars ────────────────────────────────────
  function migrateWars() {
    try { return (window.warsActive || []).length; } catch(e) {}
    try {
      var aw = safeRead('cgv6_activeWars');
      return Array.isArray(aw) ? aw.length : 0;
    } catch(e) {}
    return 0;
  }

  // ── Báo cáo orphan keys (Phase 7: identify-only) ─────────────
  function identifyOrphanKeys() {
    var allKeys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('cgv6_')) allKeys.push(k);
      }
    } catch(e) {}

    // Keys được biết là active (từ app.js + major engines)
    var KNOWN_ACTIVE = [
      'cgv6_world','cgv6_npcs','cgv6_year','cgv6_countries','cgv6_sects',
      'cgv6_bosses','cgv6_regions','cgv6_realms','cgv6_timeline','cgv6_logs',
      'cgv6_heaven','cgv6_hof','cgv6_idctr','cgv6_warLogs','cgv6_activeWars',
      'cgv6_worldEvents','cgv6_activeWorldEvent','cgv6_worldHistory','cgv6_dynasties',
      'cgv6_popStats','cgv6_life_engine_v93','cgv6_species_v93','cgv6_life_activation_v94',
      'cgv6_civ_core_v95','cgv6_civ_events_v95','cgv6_autonomy_clock_v92',
    ];

    var unknown = allKeys.filter(function(k) { return KNOWN_ACTIVE.indexOf(k) < 0; });

    window.WSM_ORPHAN_KEYS = unknown;
    if (unknown.length > 0) {
      console.warn("[WSM Migration V119] ⚠️ Phase 7 — " + unknown.length + " keys không xác định:", unknown.slice(0, 10));
      console.log("[WSM Migration V119] Tất cả unknown keys: window.WSM_ORPHAN_KEYS");
    }
    return { total: allKeys.length, unknown: unknown.length, keys: unknown };
  }

  // ── Chạy migration ────────────────────────────────────────────
  function runMigration() {
    var alreadyDone = localStorage.getItem(MIGRATION_KEY);

    var pop  = migratePopulation();
    var yr   = migrateYear();
    var civs = migrateCivs();
    var wars = migrateWars();
    var orphanReport = identifyOrphanKeys();

    // Cập nhật WSM với canonical values
    if (window.WSM) {
      window.WSM.update({
        population:        pop  > 0 ? pop  : window.WSM.getPop(),
        year:              yr   > 0 ? yr   : window.WSM.getYear(),
        civilizationCount: civs > 0 ? civs : window.WSM.getCivCount(),
        warCount:          wars,
      });
    }

    // Đánh dấu migration đã chạy (lần này)
    try { localStorage.setItem(MIGRATION_KEY, Date.now().toString()); } catch(e) {}

    // Ghi report vào window để wsm-crosstest.js đọc
    window.WSM_MIGRATION_REPORT = {
      ran:           true,
      firstRun:      !alreadyDone,
      timestamp:     Date.now(),
      canonicalPop:  pop,
      canonicalYear: yr,
      canonicalCivs: civs,
      canonicalWars: wars,
      orphanKeys:    orphanReport,
    };

    console.log("[WSM Migration V119] ✅ Migration hoàn thành.",
      "Pop=" + pop, "Year=" + yr, "Civs=" + civs, "Wars=" + wars,
      "| Orphan keys=" + orphanReport.unknown);
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    // Đợi WSM core sẵn sàng
    var _retry = 0;
    var _wait = setInterval(function() {
      _retry++;
      if (window.WSM && window.WSM.isReady()) {
        clearInterval(_wait);
        runMigration();
      } else if (_retry > 30) {
        clearInterval(_wait);
        // Chạy anyway nếu WSM chưa ready
        runMigration();
      }
    }, 500);
    console.log("[WSM Migration V119] 🔄 Migration script khởi động.");
  }

  // Public API
  window.wsmRunMigration = function() { runMigration(); return window.WSM_MIGRATION_REPORT; };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
