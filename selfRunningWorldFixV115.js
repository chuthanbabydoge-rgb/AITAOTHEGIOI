(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════
  // SELF-RUNNING WORLD FIX V115.6
  // Đồng bộ panel "THẾ GIỚI TỰ VẬN HÀNH" với nguồn dữ liệu thực tế.
  // Root cause: buildSection() trong autonomousWorldRegistryV92.js bake
  //   tĩnh giá trị vào HTML khi khởi tạo, dùng sai nguồn dữ liệu:
  //   - Population: (window.npcs||[]).length  → bỏ qua V93 Life Engine
  //   - Events: aeeV92Data.totalEvents        → bỏ qua Chronicle, V95, localStorage
  //   - Không ID nên không thể live-update
  //
  // Fix approach: EXPAND ONLY — không sửa file cũ.
  //   1. Sau khi awv92-section được build, inject ID vào các stat divs.
  //   2. Dùng cùng priority cascade như universeSyncBridgeV95.js để lấy data.
  //   3. Live-update mỗi 2s — đồng bộ với Dashboard.
  // ══════════════════════════════════════════════════════════════════

  var _fixTimer    = null;
  var _injectDone  = false;
  var ID_EVT = 'srwf115-event-num';
  var ID_POP = 'srwf115-pop-num';

  // ── 1. SINGLE SOURCE OF TRUTH (mirror của universeSyncBridgeV95) ──

  function getTotalPop() {
    if (typeof window.lev93GetCurrentPop === 'function') {
      var p = window.lev93GetCurrentPop();
      if (p > 0) return p;
    }
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      var sum = 0;
      window.spv93Data.species.forEach(function(s) { sum += (s.population || 0); });
      if (sum > 0) return sum;
    }
    return (window.npcs || []).length;
  }

  function getTotalEvents() {
    var count = 0;
    // Priority 1: V92 Chronicle (in-memory)
    if (window.wchV92Data && Array.isArray(window.wchV92Data.events)) {
      count += window.wchV92Data.events.length;
    }
    // Priority 2: V95 Civ Events (in-memory)
    if (window.cevV95Data) {
      count += (window.cevV95Data.totalEvents || 0);
    }
    if (count > 0) return count;
    // Priority 3: V92 Autonomous Events (in-memory)
    if (window.aeeV92Data) {
      count += (window.aeeV92Data.totalEvents || 0);
    }
    if (count > 0) return count;
    // Fallback: localStorage scan (mirrors getEventCount in universeSyncBridgeV95)
    var keys = [
      'cgv6_historical_timeline',
      'cgv6_world_chronicle_v92',
      'cgv6_world_events_v25',
      'cgv6_world_event_v25'
    ];
    var maxFound = 0;
    for (var k = 0; k < keys.length; k++) {
      try {
        var d = localStorage.getItem(keys[k]);
        if (d) {
          var p = JSON.parse(d);
          var a = p.events || p.history || [];
          if (a.length > maxFound) maxFound = a.length;
        }
      } catch(e) {}
    }
    return maxFound;
  }

  function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000)   return Math.round(n / 1000) + 'k';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
    return String(Math.round(n || 0));
  }

  // ── 2. INJECT IDs VÀO STAT DIVS CỦA awv92-section ───────────────
  // Cấu trúc buildSection:
  //   #awv92-section > div > [header, stats-row, tab-bar, content]
  //   stats-row > [year-box, events-box, pop-box]
  //   year-box  > [label-div, #awv92-year-num]
  //   events-box > [label-div, VALUE-DIV(no id)]
  //   pop-box    > [label-div, VALUE-DIV(no id)]

  function injectStatIds() {
    if (_injectDone && document.getElementById(ID_EVT) && document.getElementById(ID_POP)) return true;

    var yearNum = document.getElementById('awv92-year-num');
    if (!yearNum) return false;

    var yearBox  = yearNum.parentNode;
    if (!yearBox) return false;
    var statsRow = yearBox.parentNode;
    if (!statsRow) return false;

    var boxes = statsRow.children;
    if (!boxes || boxes.length < 3) return false;

    var evtBox = boxes[1];
    var popBox = boxes[2];

    if (!evtBox || !popBox) return false;

    // events value = 2nd child of evtBox
    var evtVal = evtBox.children[1];
    var popVal = popBox.children[1];

    if (!evtVal || !popVal) return false;

    evtVal.id = ID_EVT;
    popVal.id = ID_POP;

    _injectDone = true;
    console.log('[SelfRunningWorldFix V115.6] ✅ Injected IDs vào awv92 stat divs.');
    return true;
  }

  // ── 3. PATCH VALUES ──────────────────────────────────────────────

  function patchValues() {
    if (!injectStatIds()) return;

    var evtEl = document.getElementById(ID_EVT);
    var popEl = document.getElementById(ID_POP);
    if (!evtEl && !popEl) return;

    var pop  = getTotalPop();
    var evts = getTotalEvents();

    if (evtEl) {
      var newEvt = fmt(evts);
      if (evtEl.textContent !== newEvt) evtEl.textContent = newEvt;
    }

    if (popEl) {
      var newPop = fmt(pop);
      if (popEl.textContent !== newPop) popEl.textContent = newPop;
    }
  }

  // ── 4. HOOK puosRenderMyUniverse ─────────────────────────────────

  function hookRender() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig(container);
      _injectDone = false;
      setTimeout(patchValues, 150);
      setTimeout(patchValues, 400);
      setTimeout(patchValues, 800);
    };
    console.log('[SelfRunningWorldFix V115.6] 🔗 Đã hook puosRenderMyUniverse.');
  }

  // ── 5. LIVE REFRESH (đồng bộ với universeSyncBridgeV95 2s interval) ─

  function startLiveRefresh() {
    if (_fixTimer) clearInterval(_fixTimer);
    _fixTimer = setInterval(function() {
      if (document.getElementById('awv92-section')) {
        patchValues();
      }
    }, 2000);
  }

  // ── 6. PUBLIC API ─────────────────────────────────────────────────

  window.srwf115GetData = function() {
    return {
      population: getTotalPop(),
      events:     getTotalEvents(),
      year:       window.year || 1
    };
  };

  window.srwf115PatchNow = function() {
    _injectDone = false;
    patchValues();
    return srwf115GetData();
  };

  // ── 7. INIT ───────────────────────────────────────────────────────

  function init() {
    hookRender();
    startLiveRefresh();

    // Boot patches — awv92-section có thể đã được build trước khi script này load
    setTimeout(patchValues, 500);
    setTimeout(patchValues, 1500);
    setTimeout(patchValues, 3000);

    console.log('[SelfRunningWorldFix V115.6] 🌍 Fix khởi động — Population SSOT · Events SSOT · Live 2s sync.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 25700); });
  } else {
    setTimeout(init, 25700);
  }

})();
