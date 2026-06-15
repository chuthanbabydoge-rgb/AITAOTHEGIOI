(function() {
  "use strict";

  // ============================================================
  // V119 — WSM Engine Adapters (Phase 4)
  // Kết nối các engine cũ với WorldStateManager
  // Không sửa engine cũ — chỉ thêm listener/adapter mới
  // ============================================================

  var INIT_MS = 26850;

  // ── Đợi WSM sẵn sàng ─────────────────────────────────────────
  function waitForWSM(fn, retries) {
    retries = retries || 0;
    if (window.WSM && typeof window.WSM.refresh === 'function') {
      fn();
    } else if (retries < 20) {
      setTimeout(function() { waitForWSM(fn, retries + 1); }, 500);
    }
  }

  // ── Adapter: V93 Life Engine ──────────────────────────────────
  function adapterLifeV93() {
    // Patch lev93EvolveTick nếu tồn tại (đọc sau khi evolve)
    if (typeof window.lev93EvolveTick === 'function') {
      var _orig = window.lev93EvolveTick;
      window.lev93EvolveTick = function() {
        var result = _orig.apply(this, arguments);
        // Sau khi evolve xong, cập nhật WSM với pop mới nhất
        try {
          var pop = typeof window.lev93GetCurrentPop === 'function' ? window.lev93GetCurrentPop() : 0;
          if (pop > 0 && window.WSM) window.WSM.update({ population: pop });
        } catch(e) {}
        return result;
      };
    }

    // Subscribe vào wacV92 year-change listener nếu có
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(function(yr) {
        try { if (window.WSM) window.WSM.update({ year: yr }); } catch(e) {}
      });
    }
  }

  // ── Adapter: V95 Civ Engine ───────────────────────────────────
  function adapterCivV95() {
    // Patch cecV95Tick nếu tồn tại
    if (typeof window.cecV95Tick === 'function') {
      var _orig = window.cecV95Tick;
      window.cecV95Tick = function() {
        var result = _orig.apply(this, arguments);
        try {
          var civCount = typeof window.cecV95GetAll === 'function' ? (window.cecV95GetAll() || []).length : 0;
          if (window.WSM) window.WSM.update({ civilizationCount: civCount });
        } catch(e) {}
        return result;
      };
    }
  }

  // ── Adapter: War Engine ───────────────────────────────────────
  function adapterWars() {
    // Watch window.warsActive via Object.defineProperty proxy
    try {
      var _warsProxy = window.warsActive || [];
      Object.defineProperty(window, 'warsActive', {
        get: function() { return _warsProxy; },
        set: function(v) {
          _warsProxy = v;
          try {
            if (window.WSM) window.WSM.update({ warCount: Array.isArray(v) ? v.length : 0 });
          } catch(e) {}
        },
        configurable: true,
        enumerable: true,
      });
    } catch(e) {
      // defineProperty không support → dùng fallback polling (gameTick đã handle)
    }
  }

  // ── Adapter: Kingdom Engine ───────────────────────────────────
  function adapterKingdoms() {
    if (typeof window.kingdomTick === 'function') {
      var _orig = window.kingdomTick;
      window.kingdomTick = function() {
        var result = _orig.apply(this, arguments);
        try {
          var kd = window.kingdomData || {};
          var k = Array.isArray(kd.kingdoms) ? kd.kingdoms : (kd.kingdoms ? Object.values(kd.kingdoms) : []);
          if (window.WSM) window.WSM.update({ kingdoms: k.length });
        } catch(e) {}
        return result;
      };
    }
  }

  // ── Adapter: Disaster Engine ──────────────────────────────────
  function adapterDisasters() {
    // Disasters change via disasterData.active
    if (window.disasterData !== undefined) {
      try {
        var _proxy = window.disasterData;
        Object.defineProperty(window, 'disasterData', {
          get: function() { return _proxy; },
          set: function(v) {
            _proxy = v;
            try {
              var cnt = v && v.active ? v.active.length : 0;
              if (window.WSM) window.WSM.update({ activeDisasters: cnt });
            } catch(e) {}
          },
          configurable: true,
          enumerable: true,
        });
      } catch(e) {}
    }
  }

  // ── Adapter: Economy Crises ───────────────────────────────────
  function adapterEconomy() {
    if (typeof window.econCrisisTick === 'function') {
      var _orig = window.econCrisisTick;
      window.econCrisisTick = function() {
        var result = _orig.apply(this, arguments);
        try {
          var cnt = window.econCrisisData && window.econCrisisData.active ? window.econCrisisData.active.length : 0;
          if (window.WSM) window.WSM.update({ activeCrises: cnt });
        } catch(e) {}
        return result;
      };
    }
  }

  // ── Adapter: App.js year increment ────────────────────────────
  function adapterYear() {
    // Patch gameTick chain để sync year sau mỗi tick
    // (WSM core đã hook gameTick, nhưng chúng ta muốn đảm bảo year luôn đúng)
    // gameTick trong app.js tăng window.year → WSM.refresh() đọc nó → OK
    // Không cần patch thêm
  }

  // ── Đăng ký tất cả adapters ───────────────────────────────────
  function registerAll() {
    var errors = [];
    try { adapterLifeV93();    } catch(e) { errors.push('life-v93: ' + e.message); }
    try { adapterCivV95();     } catch(e) { errors.push('civ-v95: ' + e.message); }
    try { adapterWars();       } catch(e) { errors.push('wars: ' + e.message); }
    try { adapterKingdoms();   } catch(e) { errors.push('kingdoms: ' + e.message); }
    try { adapterDisasters();  } catch(e) { errors.push('disasters: ' + e.message); }
    try { adapterEconomy();    } catch(e) { errors.push('economy: ' + e.message); }
    try { adapterYear();       } catch(e) { errors.push('year: ' + e.message); }

    console.log("[WSM Adapters V119] ✅ " + (7 - errors.length) + "/7 adapters đăng ký thành công.");
    if (errors.length > 0) console.warn("[WSM Adapters V119] Lỗi nhỏ:", errors);
  }

  function init() {
    waitForWSM(function() {
      registerAll();
      // Force refresh sau khi tất cả adapters đăng ký
      setTimeout(function() { if (window.WSM) window.WSM.refresh(); }, 200);
    });
    console.log("[WSM Adapters V119] 🔌 Adapter layer khởi động.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
