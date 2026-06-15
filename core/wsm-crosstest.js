(function() {
  "use strict";

  // ============================================================
  // V119 — WSM Cross-Panel Consistency Test (Phase 6)
  // Kiểm tra tất cả panels hiển thị cùng giá trị
  // SUCCESS: tất cả giống nhau · FAIL: bất kỳ giá trị nào khác nhau
  // ============================================================

  var INIT_MS = 27100;

  // ── Đọc giá trị từ DOM panel ─────────────────────────────────
  function readDOMValue(selector, attr) {
    try {
      var el = document.querySelector(selector);
      if (!el) return null;
      return attr ? el.getAttribute(attr) : (el.textContent || el.innerText || '').trim();
    } catch(e) { return null; }
  }

  // ── Normalize số (xử lý format "1,337" → 1337) ──────────────
  function normNum(str) {
    if (str === null || str === undefined) return null;
    if (typeof str === 'number') return str;
    var cleaned = String(str).replace(/[,.\s]/g, '').replace(/[^0-9]/g, '');
    var n = parseInt(cleaned, 10);
    return isNaN(n) ? null : n;
  }

  // ── Lấy canonical values từ WSM ──────────────────────────────
  function getWSMValues() {
    if (!window.WSM) return null;
    var state = window.WSM.getState();
    return {
      year:       state.year,
      population: state.population,
      wars:       state.warCount,
      civs:       state.civilizationCount,
    };
  }

  // ── Đọc từ PUOS My Universe panel ────────────────────────────
  function readMyUniversePanel() {
    var result = { panel: 'My Universe', values: {} };
    try {
      // Tìm stat cards với các số liệu
      var cards = document.querySelectorAll('.mv-stat-card, .puos-stat, [class*="stat-val"], [class*="stat-num"]');
      var texts = [];
      cards.forEach(function(c) { texts.push((c.textContent || '').trim()); });
      result.rawTexts = texts.slice(0, 10);

      // Year từ sidebar footer
      var footer = document.querySelector('#puos-sidebar > div:last-child > div:first-child');
      if (footer) {
        var yearMatch = (footer.textContent || '').match(/Năm\s*([\d,]+)/);
        if (yearMatch) result.values.year = normNum(yearMatch[1]);
      }

      // UWS Dashboard nếu đang hiển thị
      var bigNum = document.querySelector('.uws118-bignum');
      if (bigNum) result.values.population = normNum(bigNum.textContent);
    } catch(e) {}
    return result;
  }

  // ── Đọc từ UWS Dashboard ─────────────────────────────────────
  function readUWSDashboard() {
    var result = { panel: 'UWS Dashboard (V118)', values: {} };
    try {
      var rows = document.querySelectorAll('.uws118-row');
      rows.forEach(function(row) {
        var lbl = row.querySelector('.uws118-row-lbl');
        var val = row.querySelector('.uws118-row-val');
        if (!lbl || !val) return;
        var lblText = (lbl.textContent || '').toLowerCase();
        var valNum  = normNum(val.textContent);
        if (lblText.includes('năm'))       result.values.year = valNum;
        if (lblText.includes('dân số'))    result.values.population = valNum;
        if (lblText.includes('chiến tranh') && lblText.includes('đang')) result.values.wars = valNum;
        if (lblText.includes('văn minh'))  result.values.civs = valNum;
      });
      // BigNum (population displayed large)
      var bigNum = document.querySelector('.uws118-bignum');
      if (bigNum && !result.values.population) result.values.population = normNum(bigNum.textContent);
    } catch(e) {}
    return result;
  }

  // ── Đọc từ PUOS Worlds panel ─────────────────────────────────
  function readWorldsPanel() {
    var result = { panel: 'Worlds (V90)', values: {} };
    try {
      var yearEl = document.querySelector('#puos-main [class*="year"], #puos-main .year-val');
      if (yearEl) result.values.year = normNum(yearEl.textContent);
      // year from "Năm XXX" text
      var allText = (document.querySelector('#puos-main') || document.body).innerHTML || '';
      var yearMatch = allText.match(/Năm\s*([\d,]+)/);
      if (yearMatch) result.values.year = normNum(yearMatch[1]);
    } catch(e) {}
    return result;
  }

  // ── Đọc từ game sidebar (classic mode) ───────────────────────
  function readClassicSidebar() {
    var result = { panel: 'Classic Sidebar', values: {} };
    try {
      var yearEl = document.querySelector('#year-display, .year-counter, #sidebar-year, [id*="year"]');
      if (yearEl) result.values.year = normNum(yearEl.textContent);
    } catch(e) {}
    return result;
  }

  // ── So sánh các giá trị ──────────────────────────────────────
  function compareValues(readings, canonical) {
    var results = [];
    var fields  = ['year', 'population', 'wars', 'civs'];

    fields.forEach(function(field) {
      var canonVal = canonical[field];
      if (canonVal === undefined || canonVal === null) return;

      readings.forEach(function(r) {
        var panelVal = r.values[field];
        if (panelVal === null || panelVal === undefined) return;

        var match = (panelVal === canonVal);
        results.push({
          panel:     r.panel,
          field:     field,
          canonical: canonVal,
          panelVal:  panelVal,
          match:     match,
        });
      });
    });

    return results;
  }

  // ── Chạy test ─────────────────────────────────────────────────
  function runCrossTest() {
    if (!window.WSM) {
      console.error("[WSM CrossTest V119] ❌ WorldStateManager chưa sẵn sàng.");
      return { pass: false, error: "WSM not ready" };
    }

    // Force refresh trước khi test
    window.WSM.refresh();
    if (typeof window.uwsRefresh === 'function') window.uwsRefresh();

    var canonical  = getWSMValues();
    var readings   = [
      readMyUniversePanel(),
      readUWSDashboard(),
      readWorldsPanel(),
      readClassicSidebar(),
    ].filter(function(r) { return Object.keys(r.values).length > 0; });

    var comparisons = compareValues(readings, canonical);
    var failures    = comparisons.filter(function(c) { return !c.match; });
    var passes      = comparisons.filter(function(c) { return c.match; });
    var pass        = failures.length === 0;

    // Report
    console.group("🧪 WSM Cross-Panel Test V119");
    console.log("WSM Canonical:", canonical);
    console.log("Panels đọc được:", readings.length);
    console.log("Comparisons:", comparisons.length, "| Pass:", passes.length, "| Fail:", failures.length);

    if (pass) {
      console.log("%c✅ PASS — Tất cả panels hiển thị nhất quán", "color:#10b981;font-weight:bold");
    } else {
      console.warn("%c❌ FAIL — Có " + failures.length + " giá trị không khớp", "color:#ef4444;font-weight:bold");
      failures.forEach(function(f) {
        console.warn("  ↳ [" + f.panel + "] " + f.field + ": panel=" + f.panelVal + " ≠ canonical=" + f.canonical);
      });
    }
    console.groupEnd();

    var report = {
      timestamp:   new Date().toISOString(),
      pass:        pass,
      canonical:   canonical,
      readings:    readings,
      comparisons: comparisons,
      failures:    failures,
      summary:     pass ? 'PASS' : 'FAIL — ' + failures.length + ' mismatches',
    };

    window.WSM_CROSSTEST_RESULT = report;
    return report;
  }

  // ── Expose public API ─────────────────────────────────────────
  window.wsmTest = function() {
    return runCrossTest();
  };

  window.wsmTestSummary = function() {
    var r = runCrossTest();
    if (r.pass) {
      alert('✅ PASS — Tất cả panels nhất quán!\nYear=' + r.canonical.year + ' · Pop=' + r.canonical.population + ' · Wars=' + r.canonical.wars + ' · Civs=' + r.canonical.civs);
    } else {
      alert('❌ FAIL — ' + r.failures.length + ' giá trị không khớp!\nXem console để biết chi tiết.');
    }
    return r;
  };

  // ── Tự động test sau khi tất cả init xong ────────────────────
  function init() {
    // Auto-test sau 5s để đủ thời gian panels render
    setTimeout(function() {
      try {
        var result = runCrossTest();
        if (!result.pass) {
          // Force WSM refresh và thử lại lần nữa sau 3s
          if (window.WSM) window.WSM.refresh();
          setTimeout(runCrossTest, 3000);
        }
      } catch(e) {}
    }, 5000);

    console.log("[WSM CrossTest V119] 🧪 Cross-panel test sẵn sàng. Gọi window.wsmTest() để test.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
