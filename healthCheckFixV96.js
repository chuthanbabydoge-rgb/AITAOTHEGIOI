(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════
  // HEALTH CHECK FIX V96
  // Sửa 3 false-positive trong logicHealthCheck V96:
  //
  // [FIX 1] Năm Tháng drift
  //   Root cause: wacV92Data.totalYearsElapsed là session counter —
  //   chỉ đếm số năm kể từ lần tải trang hiện tại, reset sau reload.
  //   Fix: sync lại totalYearsElapsed = window.year - startYear mỗi 10s.
  //
  // [FIX 2] Sự Kiện = 0
  //   Root cause: logicHealthCheck đọc wchV92Data.events (không tồn tại).
  //   Chronicle V92 thực tế lưu trong wchV92Data.yearEntries[i].events[].
  //   Fix: tạo computed wchV92Data.events = flatten(yearEntries) để lhcV96 đọc được.
  //
  // [FIX 3] Life Activation = false
  //   Root cause: laeV94Data.activated chỉ được set khi V94 tự seed loài.
  //   Nếu V93 đã seed sẵn ở phiên trước, V94 trả về sớm → flag mãi false.
  //   Fix: nếu spv93Data.seeded=true và species.length>0 → force activated=true.
  //
  // EXPAND ONLY — không sửa bất kỳ file cũ nào
  // ══════════════════════════════════════════════════════════════════

  // ── FIX 1: Đồng bộ year elapsed ──────────────────────────────────
  function fixYearDrift() {
    if (!window.wacV92Data) return;
    var cy = window.year || 1;
    var startY = window.wacV92Data.startYear || 1;
    var correct = Math.max(0, cy - startY);
    var current = window.wacV92Data.totalYearsElapsed || 0;
    if (Math.abs(current - correct) > 5) {
      window.wacV92Data.totalYearsElapsed = correct;
      try {
        localStorage.setItem('cgv6_autonomy_clock_v92', JSON.stringify(window.wacV92Data));
      } catch(e) {}
      console.log('[HealthCheckFix V96] ✅ Year sync: ' + current + ' → ' + correct + ' (window.year=' + cy + ')');
    }
  }

  // ── FIX 2: Tạo wchV92Data.events từ yearEntries ──────────────────
  function fixChronicleEvents() {
    if (!window.wchV92Data) return;
    var yearEntries = window.wchV92Data.yearEntries;
    if (!Array.isArray(yearEntries)) return;

    var flat = [];
    yearEntries.forEach(function(ye) {
      if (Array.isArray(ye.events)) {
        ye.events.forEach(function(ev) {
          flat.push({
            year:  ye.year,
            type:  ev.type  || 'event',
            title: ev.title || '',
            desc:  ev.desc  || '',
            icon:  ev.icon  || '📜',
            color: ev.color || '#94a3b8'
          });
        });
      }
    });

    // Sắp xếp mới nhất trước để nhất quán với aeeV92Data.events
    flat.sort(function(a, b) { return b.year - a.year; });
    window.wchV92Data.events = flat;
  }

  // ── FIX 3: Đồng bộ V94 activated flag ────────────────────────────
  function fixLifeActivation() {
    if (!window.laeV94Data) return;
    if (window.laeV94Data.activated) return;
    if (!window.world || !window.world.name) return;
    var sp = window.spv93Data;
    if (sp && sp.seeded && Array.isArray(sp.species) && sp.species.length > 0) {
      window.laeV94Data.activated = true;
      if (!window.laeV94Data.firstLifeYear) {
        window.laeV94Data.firstLifeYear = window.year || 1;
      }
      try {
        localStorage.setItem('cgv6_life_activation_v94', JSON.stringify(window.laeV94Data));
      } catch(e) {}
      console.log('[HealthCheckFix V96] ✅ Life Activation sync: V93 đã seed ' + sp.species.length + ' loài → activated=true');
    }
  }

  // ── Chạy tất cả fixes ─────────────────────────────────────────────
  function runAllFixes() {
    fixYearDrift();
    fixChronicleEvents();
    fixLifeActivation();
  }

  // ── Public API (để gọi thủ công từ console) ───────────────────────
  window.hcfV96RunFixes = runAllFixes;
  window.hcfV96Status = function() {
    var yr = window.year || 1;
    var startY = (window.wacV92Data && window.wacV92Data.startYear) || 1;
    var elapsed = (window.wacV92Data && window.wacV92Data.totalYearsElapsed) || 0;
    var chronicleEvts = (window.wchV92Data && window.wchV92Data.events) ? window.wchV92Data.events.length : '?';
    var aeeEvts = (window.aeeV92Data && window.aeeV92Data.events) ? window.aeeV92Data.events.length : '?';
    var v94ok = window.laeV94Data && window.laeV94Data.activated;
    return '[HealthCheckFix V96] year=' + yr + ' elapsed=' + elapsed + '/' + (yr-startY)
      + ' | chronicle.events=' + chronicleEvts
      + ' | autonomous.events=' + aeeEvts
      + ' | v94.activated=' + v94ok;
  };

  // ── Init: chạy TRƯỚC lần kiểm tra đầu tiên của lhcV96 (31000ms) ──
  function init() {
    // Chạy fix ngay (27200ms — sau tất cả engine, trước lhcV96 check lần 1)
    setTimeout(runAllFixes, 500);
    // Đồng bộ định kỳ mỗi 15 giây
    setInterval(runAllFixes, 15000);
    console.log('[HealthCheckFix V96] 🔧 Khởi động — vá 3 false-positive health warnings.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 27200); });
  } else {
    setTimeout(init, 27200);
  }
})();
