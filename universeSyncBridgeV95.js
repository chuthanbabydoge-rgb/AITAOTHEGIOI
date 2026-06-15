(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════
  // UNIVERSE SYNC BRIDGE V95
  // Single Source of Truth cho tất cả Dashboard metrics.
  // KHÔNG sửa file cũ — chỉ patch DOM sau khi render.
  // ══════════════════════════════════════════════════════════════════

  var _patchTimer = null;
  var _lastPatchData = null;

  // ── 1. SINGLE SOURCE OF TRUTH ─────────────────────────────────────

  function getTotalPop() {
    // Priority: V93 Life Engine > V93 species sum > V94 watchdog > npcs.length
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

  function getSpeciesCount() {
    if (window.spv93Data && Array.isArray(window.spv93Data.species)) {
      return window.spv93Data.species.filter(function(s) { return s.population > 0; }).length;
    }
    return 0;
  }

  function getCivCount() {
    // Priority: V95 Civ Core > window.countries
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs)) {
      return window.cecV95Data.civs.length;
    }
    var ctrs = window.countries || [];
    return ctrs.filter(function(c) { return c && c.population > 0; }).length;
  }

  function getTopCivStage() {
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs) && window.cecV95Data.civs.length) {
      var top = window.cecV95Data.civs.slice().sort(function(a, b) { return b.stageOrder - a.stageOrder; })[0];
      return top.stageLabel || top.stageId || '';
    }
    return '';
  }

  function getKnowledge() {
    // V95: total tech points across all civs / 100
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs) && window.cecV95Data.civs.length) {
      var total = 0;
      window.cecV95Data.civs.forEach(function(c) { total += (c.techPoints || 0); });
      return Math.floor(total / 100);
    }
    // Fall back to original tech engine localStorage
    try {
      var td = localStorage.getItem('cgv6_tech_engine');
      if (td) { var tp = JSON.parse(td); return Object.keys(tp.unlocked || tp.discovered || {}).length; }
    } catch(e) {}
    return 0;
  }

  function getKnowledgeSub(k) {
    if (k === 0) return 'Chưa khai mở';
    if (window.cecV95Data && Array.isArray(window.cecV95Data.civs) && window.cecV95Data.civs.length) {
      var stages = ['Nguyên Thủy','Nông Nghiệp','Đồng Thau','Sắt Thép','Trung Cổ','Công Nghiệp','Hiện Đại','Tiên Tiến'];
      var topStage = 0;
      window.cecV95Data.civs.forEach(function(c) { if ((c.techStage || 0) > topStage) topStage = c.techStage; });
      return 'đỉnh: ' + (stages[topStage] || 'Nguyên Thủy');
    }
    return 'công nghệ';
  }

  function getEventCount() {
    // Priority: V92 Chronicle > V95 civ events > historical timeline
    var count = 0;
    if (window.wchV92Data && Array.isArray(window.wchV92Data.events)) count += window.wchV92Data.events.length;
    if (window.cevV95Data) count += (window.cevV95Data.totalEvents || 0);
    if (count > 0) return count;
    // Fall back to localStorage
    var keys = ['cgv6_historical_timeline','cgv6_world_events_v25','cgv6_world_event_v25','cgv6_world_chronicle_v92'];
    for (var k = 0; k < keys.length; k++) {
      try {
        var d = localStorage.getItem(keys[k]);
        if (d) { var p = JSON.parse(d); var a = p.events || p.history || []; if (a.length > count) count = a.length; }
      } catch(e) {}
    }
    return count;
  }

  function getWorldStage(pop, civCount, wars) {
    if (!window.world || !window.world.name) return null;
    var labels = {
      void:     '✦ Hư Không · Chờ Khai Sinh',
      dawn:     '🌅 Bình Minh · Sinh Linh Đầu Tiên',
      rise:     '🌱 Thức Tỉnh · Văn Minh Hình Thành',
      conflict: '⚔️ Loạn Thế · Các Thế Lực Đối Đầu',
      growing:  '🔮 Tiến Hóa · Thế Giới Mở Rộng',
      flourish: '🌟 Thịnh Vượng · Vũ Trụ Phồn Thịnh'
    };
    var colors = {
      void:'#64748b', dawn:'#f59e0b', rise:'#10b981', conflict:'#ef4444', growing:'#7c3aed', flourish:'#facc15'
    };
    var stage = 'void';
    if (pop > 0 && civCount === 0) stage = 'dawn';
    else if (pop > 0 && civCount < 3) stage = 'rise';
    else if (wars > 3) stage = 'conflict';
    else if (civCount >= 3 && pop >= 500) stage = 'flourish';
    else if (pop > 0) stage = 'growing';
    return { stage: stage, label: labels[stage], color: colors[stage] };
  }

  // ── 2. FORMAT ─────────────────────────────────────────────────────
  function fmt(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 10000) return Math.round(n/1000) + 'k';
    if (n >= 1000) return (n/1000).toFixed(1) + 'k';
    return String(Math.round(n || 0));
  }

  // ── 3. COLLECT ALL METRICS ────────────────────────────────────────
  function collectMetrics() {
    var pop    = getTotalPop();
    var specs  = getSpeciesCount();
    var civs   = getCivCount();
    var know   = getKnowledge();
    var evts   = getEventCount();
    var wars   = (window.warsActive || []).length;
    var topCiv = getTopCivStage();
    return { pop, specs, civs, know, evts, wars, topCiv };
  }

  // ── 4. PATCH STAT CARDS ───────────────────────────────────────────
  // Card order in puosMyUniverse.js statsRow():
  // [0]=SINH LINH  [1]=VĂN MINH  [2]=HÒA BÌNH  [3]=TRI THỨC  [4]=SỰ KIỆN  [5]=TIẾN HÓA
  function patchStatCards(m) {
    var cards = document.querySelectorAll('.mv-stat-card');
    if (!cards.length) return false;

    function setCard(idx, val, sub) {
      var card = cards[idx];
      if (!card) return;
      // children: [0]=icon, [1]=big-number, [2]=label, [3]=sub
      if (card.children[1]) card.children[1].textContent = val;
      if (card.children[3] && sub !== null) card.children[3].textContent = sub;
    }

    // [0] SINH LINH
    setCard(0,
      fmt(m.pop),
      m.pop === 0 ? 'Chưa xuất hiện' : fmt(m.pop) + ' sinh linh'
    );

    // [1] VĂN MINH
    setCard(1,
      String(m.civs),
      m.civs === 0 ? 'Chưa hình thành' : (m.topCiv ? m.topCiv : m.civs + ' nền văn minh')
    );

    // [2] HÒA BÌNH — keep but update sub if wars changed
    if (cards[2] && cards[2].children[3]) {
      cards[2].children[3].textContent = m.wars === 0 ? 'Thuần khiết' : m.wars + ' chiến tranh';
    }

    // [3] TRI THỨC
    setCard(3,
      String(m.know),
      getKnowledgeSub(m.know)
    );

    // [4] SỰ KIỆN
    setCard(4,
      String(m.evts),
      m.evts === 0 ? 'Chưa xảy ra' : m.evts + ' sự kiện lịch sử'
    );

    // [5] TIẾN HÓA — also update with species count
    if (cards[5] && m.specs > 0) {
      if (cards[5].children[1]) {
        var matPct = 0;
        try { var ms = localStorage.getItem('cgv6_universe_maturity_v60'); if(ms){var md=JSON.parse(ms);matPct=md.score||0;} } catch(e) {}
        // If maturity still 0 but we have species, show species-based progress
        if (matPct === 0 && m.specs > 0) {
          cards[5].children[1].textContent = m.specs + ' loài';
          if (cards[5].children[3]) cards[5].children[3].textContent = 'loài đang tiến hóa';
        }
      }
    }

    return true;
  }

  // ── 5. PATCH STAGE BADGE ──────────────────────────────────────────
  function patchStageBadge(m) {
    var stageInfo = getWorldStage(m.pop, m.civs, m.wars);
    if (!stageInfo) return;

    // The badge has class mv-badge-pulse, contains a dot + text span
    var badge = document.querySelector('.mv-badge-pulse');
    if (!badge) return;

    var spans = badge.querySelectorAll('span');
    if (spans.length >= 2) {
      var labelSpan = spans[spans.length - 1];
      if (labelSpan) labelSpan.textContent = stageInfo.label;
    }

    // Also update badge color
    badge.style.background = stageInfo.color + '1a';
    badge.style.border = '1px solid ' + stageInfo.color + '40';
    badge.style.color = stageInfo.color;
    var dot = badge.querySelector('span[style*="border-radius:50%"]');
    if (dot) {
      dot.style.background = stageInfo.color;
      dot.style.boxShadow = '0 0 7px ' + stageInfo.color;
    }
  }

  // ── 6. PATCH SIDEBAR ──────────────────────────────────────────────
  function patchSidebar(m) {
    var sidebar = document.getElementById('puos-sidebar');
    if (!sidebar) return;
    var footer = sidebar.querySelector('[style*="sinh linh"]');
    if (footer) {
      var yr = window.year || 1;
      footer.textContent = 'Năm ' + yr.toLocaleString() + ' · ' + fmt(m.pop) + ' sinh linh';
    }
    // Also update V92 live display if it exists
    var lsv93Pop = document.getElementById('lsv93-total-pop');
    if (lsv93Pop) lsv93Pop.textContent = fmt(m.pop);
    var lsv93Sp = document.getElementById('lsv93-species-count');
    if (lsv93Sp) lsv93Sp.textContent = m.specs;
  }

  // ── 7. PATCH OVERVIEW CARD ────────────────────────────────────────
  function patchOverviewCard(m) {
    var ovRows = document.querySelectorAll('.mv-overview-row');
    // Format: rows are: Tuổi vũ trụ / Giai đoạn / Độ phức tạp / Tiềm năng / Trạng thái
    // We can add a species row or update complexity
    if (ovRows.length >= 2) {
      var gd = ovRows[1]; // Giai đoạn row
      if (gd) {
        var valEl = gd.querySelector('.mv-overview-val');
        var stageInfo = getWorldStage(m.pop, m.civs, m.wars);
        if (valEl && stageInfo) {
          var stageNames = {void:'Khai Sinh', dawn:'Hình Thành', rise:'Sự Sống', conflict:'Văn Minh', growing:'Kỷ Nguyên', flourish:'Vũ Cực'};
          valEl.textContent = stageNames[stageInfo.stage] || valEl.textContent;
        }
      }
    }

    // Patch health indicator
    if (ovRows.length >= 5) {
      var healthRow = ovRows[4];
      if (healthRow) {
        var valEl2 = healthRow.querySelector('.mv-overview-val');
        if (valEl2) {
          var health = 40;
          if (window.world && window.world.name) health += 15;
          if (m.pop > 0)   health += 15;
          if (m.civs > 0)  health += 15;
          if (m.wars === 0) health += 15;
          var col = health >= 80 ? '#10b981' : health >= 50 ? '#f59e0b' : '#ef4444';
          valEl2.textContent = 'Sức khỏe ' + health + '%';
          valEl2.style.color = col;
        }
      }
    }
  }

  // ── 8. PATCH TIMELINE STAGE ──────────────────────────────────────
  function patchTimelineStage(m) {
    var stageInfo = getWorldStage(m.pop, m.civs, m.wars);
    if (!stageInfo) return;
    var stageMap = { void:0, dawn:1, rise:2, conflict:3, growing:4, flourish:5 };
    var si = stageMap[stageInfo.stage] || 0;

    var nodes = document.querySelectorAll('.mv-tl-node');
    if (!nodes.length) return;

    // Recolor active dots
    var COLORS = ['#64748b','#f59e0b','#10b981','#ef4444','#7c3aed','#facc15'];
    nodes.forEach(function(node, i) {
      var dot = node.querySelector('.mv-tl-dot');
      if (!dot) return;
      var active = i <= si;
      var current = i === si;
      var col = COLORS[i];
      dot.style.background = current ? col : active ? col + '33' : '#0a1426';
      dot.style.borderColor = current ? col : active ? col + '55' : '#0d1e30';
      dot.style.boxShadow = current ? '0 0 16px ' + col + '66' : 'none';
    });
  }

  // ── 9. MASTER PATCH ───────────────────────────────────────────────
  function patchAll() {
    var m = collectMetrics();
    var json = JSON.stringify(m);
    if (json === _lastPatchData) return; // No changes
    _lastPatchData = json;

    patchStatCards(m);
    patchStageBadge(m);
    patchSidebar(m);
    patchOverviewCard(m);
    patchTimelineStage(m);

    // Update V95 civ header if visible
    var cc = document.getElementById('cev95-civ-count');
    if (cc) cc.textContent = m.civs + ' văn minh';
  }

  // ── 10. HOOK RENDER ───────────────────────────────────────────────
  function hookRender() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig(container);
      // Patch right after render
      setTimeout(patchAll, 80);
      setTimeout(patchAll, 300);
    };
  }

  // ── 11. LIVE AUTO-REFRESH ─────────────────────────────────────────
  function startAutoRefresh() {
    if (_patchTimer) clearInterval(_patchTimer);
    _patchTimer = setInterval(function() {
      if (document.querySelector('.mv-stat-card')) {
        patchAll();
      }
    }, 2000);
  }

  // ── 12. PUBLIC API ────────────────────────────────────────────────
  window.usbV95GetData = function() {
    return collectMetrics();
  };

  window.usbV95PatchNow = function() {
    _lastPatchData = null; // force re-patch
    patchAll();
  };

  window.usbV95GetSummary = function() {
    var m = collectMetrics();
    return [
      '📊 UNIVERSE DASHBOARD SYNC',
      '──────────────────────────────────────',
      '👥 Dân số:     ' + fmt(m.pop) + ' sinh linh',
      '🦁 Loài:       ' + m.specs + ' loài đang tồn tại',
      '🏛️ Văn minh:   ' + m.civs + ' (' + (m.topCiv || 'Chưa có') + ')',
      '📚 Tri thức:   ' + m.know + ' điểm',
      '⚡ Sự kiện:    ' + m.evts + ' đã xảy ra',
      '⚔️ Chiến tranh:' + m.wars + ' đang diễn ra'
    ].join('\n');
  };

  // ── 13. INIT ──────────────────────────────────────────────────────
  function init() {
    hookRender();
    startAutoRefresh();

    // Boot patch after all engines are up
    setTimeout(function() {
      _lastPatchData = null;
      patchAll();
    }, 3500);

    // Second pass
    setTimeout(function() {
      _lastPatchData = null;
      patchAll();
    }, 6000);

    console.log("[UniverseSyncBridge V95] 🔗 Dashboard Bridge khởi động — Single Source of Truth · Pop/Species/Civ/Tech/Events sync · 2s auto-refresh sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25500); });
  } else {
    setTimeout(init, 25500);
  }
})();
