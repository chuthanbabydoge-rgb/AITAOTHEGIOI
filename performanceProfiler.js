(function() {
  "use strict";
  const SAVE_KEY = "cgv6_perf_profiler_v82";

  window.perfProfilerV82Data = {
    npcCacheValid: false,
    npcCacheTime: 0,
    renderCacheEnabled: true,
    renderCacheTTL: 5000,
    saveBatchEnabled: true,
    saveBatchDelay: 600,
    lazyTickEnabled: true,
    lazyTickCount: 0,
    idleQueueEnabled: true,
    stats: {
      npcCacheHits: 0,
      npcCacheMisses: 0,
      renderCacheHits: 0,
      renderCacheMisses: 0,
      saveBatchFired: 0,
      saveOpsDeferred: 0,
      idleTasksProcessed: 0,
      lazyTicksSkipped: 0
    }
  };

  // ============================================================
  // 1. NPC CACHE LAYER
  //    window.npcs filter/map được cache lại theo dirty flag
  //    Engines gọi getNPCsAlive() thay vì npcs.filter() mỗi tick
  // ============================================================
  var _npcCacheAlive = null;
  var _npcCacheHeroes = null;
  var _npcCacheDead = null;
  var _npcCacheByJob = {};
  var _npcLastLength = -1;
  var _npcLastTick = 0;

  function invalidateNPCCache() {
    _npcCacheAlive = null;
    _npcCacheHeroes = null;
    _npcCacheDead = null;
    _npcCacheByJob = {};
    window.perfProfilerV82Data.npcCacheValid = false;
  }

  window.npcCacheInvalidate = invalidateNPCCache;

  window.getNPCsAlive = function() {
    var npcs = window.npcs || [];
    if (_npcCacheAlive !== null && npcs.length === _npcLastLength) {
      window.perfProfilerV82Data.stats.npcCacheHits++;
      return _npcCacheAlive;
    }
    window.perfProfilerV82Data.stats.npcCacheMisses++;
    _npcCacheAlive = npcs.filter(function(n) { return n && !n.dead; });
    _npcLastLength = npcs.length;
    window.perfProfilerV82Data.npcCacheValid = true;
    window.perfProfilerV82Data.npcCacheTime = Date.now();
    return _npcCacheAlive;
  };

  window.getNPCsHeroes = function() {
    var npcs = window.npcs || [];
    if (_npcCacheHeroes !== null && npcs.length === _npcLastLength) {
      window.perfProfilerV82Data.stats.npcCacheHits++;
      return _npcCacheHeroes;
    }
    _npcCacheHeroes = npcs.filter(function(n) { return n && !n.dead && (n.isHero || (n.power || 0) > 70); });
    return _npcCacheHeroes;
  };

  window.getNPCsDead = function() {
    if (_npcCacheDead !== null) {
      window.perfProfilerV82Data.stats.npcCacheHits++;
      return _npcCacheDead;
    }
    _npcCacheDead = (window.npcs || []).filter(function(n) { return n && n.dead; });
    return _npcCacheDead;
  };

  window.getNPCsByJob = function(job) {
    if (_npcCacheByJob[job]) {
      window.perfProfilerV82Data.stats.npcCacheHits++;
      return _npcCacheByJob[job];
    }
    _npcCacheByJob[job] = (window.npcs || []).filter(function(n) { return n && !n.dead && n.job === job; });
    return _npcCacheByJob[job];
  };

  // Auto-invalidate when npcs array length changes
  setInterval(function() {
    var npcs = window.npcs || [];
    if (npcs.length !== _npcLastLength) invalidateNPCCache();
  }, 2000);

  // ============================================================
  // 2. RENDER CACHE LAYER
  //    innerHTML results được cache theo panelId + TTL
  //    Chỉ re-render khi cache expire hoặc bị force-flush
  // ============================================================
  var _renderCache = {};

  window.renderCache = {
    get: function(key, worldYear) {
      var entry = _renderCache[key];
      if (!entry) {
        window.perfProfilerV82Data.stats.renderCacheMisses++;
        return null;
      }
      var age = Date.now() - entry.time;
      var stale = worldYear !== undefined && entry.year !== worldYear;
      if (age > window.perfProfilerV82Data.renderCacheTTL || stale) {
        window.perfProfilerV82Data.stats.renderCacheMisses++;
        delete _renderCache[key];
        return null;
      }
      window.perfProfilerV82Data.stats.renderCacheHits++;
      return entry.html;
    },
    set: function(key, html, worldYear) {
      _renderCache[key] = { html: html, time: Date.now(), year: worldYear || (window.year || 0) };
    },
    invalidate: function(key) {
      if (key) delete _renderCache[key];
      else _renderCache = {};
    },
    invalidateAll: function() {
      _renderCache = {};
    },
    size: function() {
      return Object.keys(_renderCache).length;
    }
  };

  window.renderCacheInvalidate = function(key) { window.renderCache.invalidate(key); };
  window.renderCacheInvalidateAll = function() { window.renderCache.invalidateAll(); };

  // ============================================================
  // 3. BATCH SAVE QUEUE (Save Debouncer)
  //    localStorage.setItem gọi nhiều lần/tick → batch với debounce
  //    Engines gọi perfSave(key, data) thay vì trực tiếp localStorage
  // ============================================================
  var _saveQueue = {};
  var _saveTimer = null;

  function flushSaveQueue() {
    _saveTimer = null;
    var count = 0;
    for (var key in _saveQueue) {
      if (!_saveQueue.hasOwnProperty(key)) continue;
      try {
        var serialized = JSON.stringify(_saveQueue[key]);
        localStorage.setItem(key, serialized);
        if (typeof window.perfMon82RecordSave === "function") {
          window.perfMon82RecordSave(key, serialized.length);
        }
        count++;
      } catch(e) {
        console.warn("[PerfProfiler V82] Save error for " + key + ":", e.message);
      }
    }
    _saveQueue = {};
    window.perfProfilerV82Data.stats.saveBatchFired++;
    return count;
  }

  window.perfSave = function(key, data, immediate) {
    _saveQueue[key] = data;
    window.perfProfilerV82Data.stats.saveOpsDeferred++;
    if (immediate) {
      if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
      flushSaveQueue();
      return;
    }
    if (!_saveTimer) {
      _saveTimer = setTimeout(flushSaveQueue, window.perfProfilerV82Data.saveBatchDelay);
    }
  };

  window.perfSaveFlush = flushSaveQueue;

  // ============================================================
  // 4. LAZY TICK SCHEDULER
  //    Phân chia gameTick thành 3 tier: Critical/Normal/Lazy
  //    Lazy chỉ chạy mỗi N ticks → giảm CPU load đáng kể
  // ============================================================
  var _criticalQueue = [];
  var _normalQueue = [];
  var _lazyQueue = [];

  window.perfTick = {
    registerCritical: function(fn, id) {
      _criticalQueue.push({ fn: fn, id: id || "anon" });
    },
    registerNormal: function(fn, id) {
      _normalQueue.push({ fn: fn, id: id || "anon" });
    },
    registerLazy: function(fn, id) {
      _lazyQueue.push({ fn: fn, id: id || "anon" });
    },
    unregister: function(id) {
      _criticalQueue = _criticalQueue.filter(function(e) { return e.id !== id; });
      _normalQueue = _normalQueue.filter(function(e) { return e.id !== id; });
      _lazyQueue = _lazyQueue.filter(function(e) { return e.id !== id; });
    },
    tick: function(globalCount) {
      // Critical: mỗi tick
      for (var i = 0; i < _criticalQueue.length; i++) {
        try { _criticalQueue[i].fn(); } catch(e) {}
      }
      // Normal: mỗi 3 ticks
      if (globalCount % 3 === 0) {
        for (var j = 0; j < _normalQueue.length; j++) {
          try { _normalQueue[j].fn(); } catch(e) {}
        }
      }
      // Lazy: mỗi 15 ticks
      if (globalCount % 15 === 0) {
        for (var k = 0; k < _lazyQueue.length; k++) {
          try { _lazyQueue[k].fn(); } catch(e) {}
        }
        window.perfProfilerV82Data.stats.lazyTicksSkipped += _lazyQueue.length * 14;
      }
    },
    getCounts: function() {
      return { critical: _criticalQueue.length, normal: _normalQueue.length, lazy: _lazyQueue.length };
    }
  };

  // ============================================================
  // 5. BACKGROUND PROCESSING (requestIdleCallback queue)
  //    Heavy operations chạy khi browser rảnh
  // ============================================================
  var _idleQueue = [];
  var _idleRunning = false;

  function processIdleQueue(deadline) {
    _idleRunning = false;
    while (_idleQueue.length > 0) {
      var hasTime = (deadline && deadline.timeRemaining && deadline.timeRemaining() > 1) || !deadline;
      if (!hasTime) break;
      var task = _idleQueue.shift();
      try {
        task.fn();
        window.perfProfilerV82Data.stats.idleTasksProcessed++;
      } catch(e) {}
    }
    if (_idleQueue.length > 0 && !_idleRunning) {
      scheduleIdle();
    }
  }

  function scheduleIdle() {
    if (_idleRunning) return;
    _idleRunning = true;
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(processIdleQueue, { timeout: 1000 });
    } else {
      setTimeout(function() { processIdleQueue(null); }, 200);
    }
  }

  window.perfIdleQueue = {
    push: function(fn, priority) {
      if (priority === "high") {
        _idleQueue.unshift({ fn: fn });
      } else {
        _idleQueue.push({ fn: fn });
      }
      if (!_idleRunning) scheduleIdle();
    },
    size: function() { return _idleQueue.length; },
    clear: function() { _idleQueue = []; }
  };

  // ============================================================
  // 6. VISIBILITY API — dừng heavy renders khi tab ẩn
  // ============================================================
  window.perfProfilerV82Data.tabVisible = !document.hidden;

  document.addEventListener("visibilitychange", function() {
    window.perfProfilerV82Data.tabVisible = !document.hidden;
    if (!document.hidden) {
      invalidateNPCCache();
      window.renderCache.invalidateAll();
    }
  });

  window.perfIsVisible = function() {
    return window.perfProfilerV82Data.tabVisible !== false;
  };

  // ============================================================
  // 7. DOM VIRTUALIZATION HELPER
  //    Render chỉ N items từ danh sách lớn (NPC list, events...)
  // ============================================================
  window.perfVirtualize = function(items, renderFn, pageSize, page) {
    pageSize = pageSize || 20;
    page = page || 0;
    var start = page * pageSize;
    var slice = items.slice(start, start + pageSize);
    var totalPages = Math.ceil(items.length / pageSize);
    return {
      items: slice,
      html: slice.map(renderFn).join(""),
      total: items.length,
      showing: slice.length,
      page: page,
      totalPages: totalPages,
      hasPrev: page > 0,
      hasNext: page < totalPages - 1,
      pagerHtml: totalPages > 1 ?
        '<div style="display:flex;gap:4px;margin-top:6px;font-size:9px;color:rgba(232,232,240,0.5)">Hiển thị ' + (start+1) + '-' + Math.min(start+pageSize, items.length) + '/' + items.length + '</div>' : ""
    };
  };

  // ============================================================
  // 8. PROFILER UI (inject vào creator-hub-v32)
  // ============================================================
  function buildProfilerUI() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildProfilerUI, 800); return; }
    if (document.getElementById("profiler82-wrapper")) return;

    var wrapper = document.createElement("div");
    wrapper.id = "profiler82-wrapper";
    wrapper.style.cssText = "margin-top:10px;border-top:1px solid rgba(96,165,250,0.12);padding-top:10px";

    wrapper.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;color:#60a5fa;letter-spacing:1px">🔬 PERFORMANCE PROFILER V82</div>' +
        '<button onclick="window.perfProfiler82Refresh()" style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.25);color:#60a5fa;border-radius:4px;padding:2px 8px;font-size:9px;cursor:pointer">↺ Refresh</button>' +
      '</div>' +
      '<div id="profiler82-stats" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px"></div>' +
      '<div id="profiler82-opt" style="display:grid;grid-template-columns:1fr 1fr;gap:6px"></div>';

    container.appendChild(wrapper);
    updateProfilerUI();
  }

  function updateProfilerUI() {
    var statsEl = document.getElementById("profiler82-stats");
    var optEl = document.getElementById("profiler82-opt");
    if (!statsEl) return;

    var s = window.perfProfilerV82Data.stats;
    var npcAlive = _npcCacheAlive ? _npcCacheAlive.length : "?";
    var cacheSize = window.renderCache.size();
    var ticks = window.perfTick.getCounts();
    var hitPct = (s.npcCacheHits + s.npcCacheMisses > 0) ? Math.round(s.npcCacheHits / (s.npcCacheHits + s.npcCacheMisses) * 100) : 0;
    var renderHitPct = (s.renderCacheHits + s.renderCacheMisses > 0) ? Math.round(s.renderCacheHits / (s.renderCacheHits + s.renderCacheMisses) * 100) : 0;

    function statCard(icon, val, label, color) {
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:7px;text-align:center">' +
        '<div style="font-size:12px">' + icon + '</div>' +
        '<div style="color:' + color + ';font-weight:700;font-size:11px">' + val + '</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.35)">' + label + '</div></div>';
    }

    statsEl.innerHTML =
      statCard("🧬", npcAlive + " cached", "NPC Cache", hitPct > 70 ? "#4ade80" : "#facc15") +
      statCard("🖼️", cacheSize + " entries", "Render Cache", renderHitPct > 60 ? "#4ade80" : "#facc15") +
      statCard("💾", s.saveBatchFired + " batches", "Save Batches", "#60a5fa") +
      statCard("⚡", ticks.critical + "/" + ticks.normal + "/" + ticks.lazy, "Crit/Norm/Lazy", "#a78bfa") +
      statCard("🔄", s.idleTasksProcessed, "Idle Tasks", "#fb923c") +
      statCard("📈", hitPct + "%", "NPC Hit Rate", hitPct > 70 ? "#4ade80" : "#f87171");

    function optCard(icon, title, status, detail, toggleFn) {
      var active = status;
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">' +
          '<span style="font-size:10px;font-weight:600;color:rgba(232,232,240,0.8)">' + icon + ' ' + title + '</span>' +
          (toggleFn ? '<button onclick="' + toggleFn + '()" style="font-size:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(232,232,240,0.6);border-radius:3px;padding:1px 5px;cursor:pointer">' + (active ? "ON" : "OFF") + '</button>' : '') +
        '</div>' +
        '<div style="font-size:9px;color:rgba(232,232,240,0.4)">' + detail + '</div></div>';
    }

    var d = window.perfProfilerV82Data;
    optEl.innerHTML =
      optCard("🧬", "NPC Cache", d.npcCacheValid, "Hit: " + s.npcCacheHits + " · Miss: " + s.npcCacheMisses, "window.npcCacheInvalidate") +
      optCard("🖼️", "Render Cache", d.renderCacheEnabled, "TTL: " + (d.renderCacheTTL/1000) + "s · " + cacheSize + " entries", "window.renderCacheInvalidateAll") +
      optCard("💾", "Save Batcher", d.saveBatchEnabled, "Delay: " + d.saveBatchDelay + "ms · " + s.saveOpsDeferred + " ops deferred", null) +
      optCard("⚡", "Lazy Tick", d.lazyTickEnabled, "Skipped: " + s.lazyTicksSkipped + " calls", null);
  }

  window.perfProfiler82Refresh = updateProfilerUI;

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ stats: window.perfProfilerV82Data.stats }));
    } catch(e) {}
  }

  var _globalTickCount = 0;

  function init() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      _globalTickCount++;
      if (_orig) _orig();
      window.perfTick.tick(_globalTickCount);
      if (_globalTickCount % 200 === 0) {
        invalidateNPCCache();
        save();
      }
    };

    setTimeout(buildProfilerUI, 2000);
    console.log("[Performance Profiler V82] 4 optimizations active: NPC Cache · Render Cache · Save Batcher · Lazy Tick");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22300); });
  } else {
    setTimeout(init, 22300);
  }
})();
