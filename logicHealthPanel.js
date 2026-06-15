(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // LOGIC HEALTH PANEL V96
  // UI hiển thị kết quả logicHealthCheck V96 trong PUOS Settings
  // - Inject section vào puosRenderSettings() via _orig pattern
  // - Nút "Kiểm Tra Ngay" chạy lhcV96RunCheck()
  // - Lưu lịch sử 20 lần kiểm tra gần nhất
  // - Tự làm mới display mỗi 30s nếu đang mở
  // ══════════════════════════════════════════════════════════════════════

  var SAVE_KEY = "cgv6_health_panel_v96";

  window.lhpV96Data = window.lhpV96Data || {
    history: []
  };

  // ── Load / Save lịch sử ──────────────────────────────────────────────
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ history: window.lhpV96Data.history }));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        if (Array.isArray(p.history)) window.lhpV96Data.history = p.history;
      }
    } catch(e) {}
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function fmtNum(n) {
    if (n == null || n === undefined) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }
  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return d.getHours().toString().padStart(2,'0') + ':' +
           d.getMinutes().toString().padStart(2,'0') + ':' +
           d.getSeconds().toString().padStart(2,'0');
  }

  // ── Build HTML cho toàn bộ Health Section ───────────────────────────
  function buildSection() {
    var report = (typeof window.lhcV96GetReport === 'function') ? window.lhcV96GetReport() : null;
    var issues = report ? (report.issues || []) : [];
    var hasWorld = report && report.status !== 'NO_WORLD' && report.year;

    // Status badge
    var statusColor, statusBg, statusText, statusIcon;
    if (!report) {
      statusColor = '#64748b'; statusBg = '#1e293b'; statusIcon = '❔';
      statusText = 'Chưa kiểm tra lần nào';
    } else if (report.status === 'NO_WORLD') {
      statusColor = '#64748b'; statusBg = '#0a1020'; statusIcon = '🌑';
      statusText = 'Chưa có thế giới';
    } else if (issues.length === 0) {
      statusColor = '#10b981'; statusBg = '#064e3b'; statusIcon = '✅';
      statusText = 'Tất cả hệ thống hoạt động bình thường';
    } else {
      statusColor = '#f59e0b'; statusBg = '#451a03'; statusIcon = '⚠️';
      statusText = issues.length + ' vấn đề cần chú ý';
    }

    var html = '<div id="lhp96-section" style="padding:0 32px 32px;max-width:720px">';

    // ── Header ──────────────────────────────────────────────────────
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;margin-top:4px">';
    html += '<div>';
    html += '<div style="font-size:10px;color:#4a5568;letter-spacing:3px;margin-bottom:3px">LOGIC HEALTH CHECK V96</div>';
    html += '<div style="font-size:13px;color:#94a3b8">Giám sát tính nhất quán dữ liệu toàn hệ thống</div>';
    html += '</div>';
    html += '<button onclick="window.lhpV96RunNow()" style="padding:9px 20px;background:#1e3a5f;border:1px solid #3b82f6;border-radius:8px;color:#60a5fa;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;transition:all 0.2s" onmouseover="this.style.background=\'#1e40af\'" onmouseout="this.style.background=\'#1e3a5f\'">🔄 Kiểm Tra Ngay</button>';
    html += '</div>';

    // ── Status Banner ────────────────────────────────────────────────
    html += '<div style="background:' + statusBg + '33;border:1px solid ' + statusColor + '55;border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px">';
    html += '<div style="font-size:22px">' + statusIcon + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="font-size:13px;color:' + statusColor + ';font-weight:600">' + statusText + '</div>';
    if (report && report.checkCount) {
      html += '<div style="font-size:10px;color:#4a5568;margin-top:2px">Lần kiểm tra #' + report.checkCount + ' · Lúc ' + fmtTime(report.timestamp) + ' · Năm thế giới ' + (report.year || '?') + '</div>';
    }
    html += '</div>';
    if (hasWorld) {
      html += '<div style="text-align:right">';
      html += '<div style="font-size:18px;color:' + statusColor + ';font-weight:700">' + (report.ticksLastPeriod || 0) + '</div>';
      html += '<div style="font-size:9px;color:#4a5568">ticks/60s</div>';
      html += '</div>';
    }
    html += '</div>';

    // ── 6 Checks Chi Tiết ────────────────────────────────────────────
    if (hasWorld) {
      html += '<div class="puos-card" style="margin-bottom:14px">';
      html += '<div class="puos-card-title">Chi Tiết 6 Kiểm Tra</div>';

      var pop = report.population || {};
      var civ = report.civilization || {};
      var evt = report.events || {};
      var checks = [
        {
          icon: '🧬', name: 'Dân Số',
          ok: !issues.some(function(i){ return i.indexOf('Dân Số') !== -1 || i.indexOf('lev93') !== -1 || i.indexOf('spv93') !== -1 || i.indexOf('populationHistory') !== -1; }),
          detail: 'SSOT=' + fmtNum(pop.lev93) + ' · species=' + fmtNum(pop.spv93) + ' · NPCs=' + fmtNum(pop.npcs)
        },
        {
          icon: '🏛️', name: 'Văn Minh',
          ok: !issues.some(function(i){ return i.indexOf('cecV95') !== -1 || i.indexOf('countries') !== -1 || i.indexOf('Văn Minh') !== -1; }),
          detail: 'V95=' + (civ.v95 != null ? civ.v95 : '—') + ' · countries=' + (civ.countries != null ? civ.countries : '—') + ' · V38=' + (civ.v38 != null ? civ.v38 : '—')
        },
        {
          icon: '📅', name: 'Năm Tháng',
          ok: !issues.some(function(i){ return i.indexOf('elapsed') !== -1 || i.indexOf('năm') !== -1 || i.indexOf('Năm') !== -1; }),
          detail: 'window.year=' + (report.year || '?')
        },
        {
          icon: '⚙️', name: 'gameTick Chain',
          ok: !issues.some(function(i){ return i.indexOf('gameTick') !== -1 || i.indexOf('simulateWorld') !== -1; }),
          detail: report.ticksLastPeriod + ' ticks trong 60s qua'
        },
        {
          icon: '📜', name: 'Sự Kiện',
          ok: !issues.some(function(i){ return i.indexOf('sự kiện') !== -1 || i.indexOf('Sự Kiện') !== -1 || i.indexOf('event') !== -1 || i.indexOf('Event') !== -1; }),
          detail: 'chronicle=' + (evt.chronicle || 0) + ' · autonomous=' + (evt.autonomous || 0) + ' · tổng=' + (evt.total || 0)
        },
        {
          icon: '🌱', name: 'Life Activation',
          ok: !issues.some(function(i){ return i.indexOf('V94') !== -1 || i.indexOf('laeV94') !== -1 || i.indexOf('Double') !== -1; }),
          detail: 'V94 activated=' + (window.laeV94Data ? (window.laeV94Data.activated ? 'true' : 'false') : 'N/A')
        }
      ];

      checks.forEach(function(c) {
        var okColor = c.ok ? '#10b981' : '#f59e0b';
        var okText  = c.ok ? 'OK' : 'CẢNH BÁO';
        var okIcon  = c.ok ? '✅' : '⚠️';
        html += '<div class="puos-row">';
        html += '<div style="flex:1">';
        html += '<div class="puos-row-lbl">' + c.icon + ' ' + c.name + '</div>';
        html += '<div style="font-size:10px;color:#334155;margin-top:1px">' + c.detail + '</div>';
        html += '</div>';
        html += '<span style="color:' + okColor + ';font-size:11px;font-weight:600;white-space:nowrap">' + okIcon + ' ' + okText + '</span>';
        html += '</div>';
      });

      html += '</div>';

      // Issues list
      if (issues.length > 0) {
        html += '<div class="puos-card" style="margin-bottom:14px;border-color:#f59e0b33">';
        html += '<div class="puos-card-title" style="color:#f59e0b">⚠️ Danh Sách Vấn Đề (' + issues.length + ')</div>';
        issues.forEach(function(issue, idx) {
          html += '<div style="padding:6px 0;border-bottom:1px solid #0f172a;font-size:11px;color:#fbbf24;display:flex;gap:8px;align-items:flex-start">';
          html += '<span style="color:#64748b;min-width:18px">' + (idx + 1) + '.</span>';
          html += '<span>' + issue + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }
    } else if (report && report.status !== 'NO_WORLD' && !hasWorld) {
      html += '<div class="puos-card" style="margin-bottom:14px;text-align:center;padding:28px">';
      html += '<div style="font-size:28px;margin-bottom:8px">🌑</div>';
      html += '<div style="color:#4a5568;font-size:12px">Chưa có thế giới nào được tạo.<br>Tạo thế giới để bắt đầu kiểm tra.</div>';
      html += '</div>';
    } else if (!report) {
      html += '<div class="puos-card" style="margin-bottom:14px;text-align:center;padding:28px">';
      html += '<div style="font-size:28px;margin-bottom:8px">🩺</div>';
      html += '<div style="color:#94a3b8;font-size:13px;margin-bottom:4px">Chưa có dữ liệu kiểm tra</div>';
      html += '<div style="color:#4a5568;font-size:11px">Nhấn nút "Kiểm Tra Ngay" hoặc chờ tự động kiểm tra sau 60 giây.</div>';
      html += '</div>';
    }

    // ── Lịch Sử ─────────────────────────────────────────────────────
    var hist = window.lhpV96Data.history;
    if (hist.length > 0) {
      html += '<div class="puos-card">';
      html += '<div class="puos-card-title">📋 Lịch Sử Kiểm Tra</div>';

      var last = hist.slice(-8).reverse();
      last.forEach(function(h) {
        var dot = h.issueCount === 0 ? '🟢' : '🟡';
        var dotColor = h.issueCount === 0 ? '#10b981' : '#f59e0b';
        html += '<div class="puos-row">';
        html += '<div style="display:flex;align-items:center;gap:8px;flex:1">';
        html += '<span style="font-size:14px">' + dot + '</span>';
        html += '<div>';
        html += '<div class="puos-row-lbl">Kiểm Tra #' + h.checkCount + ' · Năm ' + (h.worldYear || '?') + '</div>';
        html += '<div style="font-size:10px;color:#334155">' + h.issueCount + ' vấn đề · Ticks=' + (h.ticks || '—') + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<span style="color:#4a5568;font-size:10px;white-space:nowrap">' + (h.time || '') + '</span>';
        html += '</div>';
      });

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ── Chạy check ngay và refresh UI ────────────────────────────────────
  window.lhpV96RunNow = function() {
    if (typeof window.lhcV96RunCheck !== 'function') {
      console.warn('[HealthPanel V96] logicHealthCheck V96 chưa sẵn sàng.');
      return;
    }
    window.lhcV96RunCheck();

    setTimeout(function() {
      var r = window.lhcV96GetReport ? window.lhcV96GetReport() : null;
      if (r && r.checkCount) {
        window.lhpV96Data.history.push({
          checkCount: r.checkCount,
          worldYear:  r.year || 0,
          issueCount: (r.issues || []).length,
          ticks:      r.ticksLastPeriod,
          time:       fmtTime(r.timestamp)
        });
        if (window.lhpV96Data.history.length > 20) {
          window.lhpV96Data.history = window.lhpV96Data.history.slice(-20);
        }
        save();
      }
      // Refresh section nếu đang hiển thị
      var sec = document.getElementById('lhp96-section');
      if (sec) {
        var tmp = document.createElement('div');
        tmp.innerHTML = buildSection();
        sec.replaceWith(tmp.firstElementChild);
      }
    }, 600);
  };

  // ── Refresh tự động mỗi 30s nếu section đang visible ──────────────
  function startAutoRefresh() {
    setInterval(function() {
      var sec = document.getElementById('lhp96-section');
      if (!sec) return;
      var tmp = document.createElement('div');
      tmp.innerHTML = buildSection();
      sec.replaceWith(tmp.firstElementChild);
    }, 30000);
  }

  // ── Hook vào puosRenderSettings via _orig ─────────────────────────
  function patchSettings() {
    var _orig = window.puosRenderSettings;
    window.puosRenderSettings = function(container) {
      if (_orig) _orig(container);
      var old = document.getElementById('lhp96-section');
      if (old) old.remove();
      var tmp = document.createElement('div');
      tmp.innerHTML = buildSection();
      var el = tmp.firstElementChild;
      if (el && container) container.appendChild(el);
    };
  }

  // ── Tự ghi lịch sử khi lhcV96 tự động chạy (60s interval) ─────────
  function hookAutoRecord() {
    var _origRunCheck = window.lhcV96RunCheck;
    if (typeof _origRunCheck !== 'function') return;
    window.lhcV96RunCheck = function() {
      var result = _origRunCheck();
      // Ghi lịch sử sau khi check xong
      setTimeout(function() {
        var r = window.lhcV96GetReport ? window.lhcV96GetReport() : null;
        if (!r || !r.checkCount) return;
        var last = window.lhpV96Data.history;
        if (last.length > 0 && last[last.length - 1].checkCount === r.checkCount) return;
        last.push({
          checkCount: r.checkCount,
          worldYear:  r.year || 0,
          issueCount: (r.issues || []).length,
          ticks:      r.ticksLastPeriod,
          time:       fmtTime(r.timestamp)
        });
        if (last.length > 20) window.lhpV96Data.history = last.slice(-20);
        save();
      }, 300);
      return result;
    };
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    load();
    patchSettings();
    startAutoRefresh();
    // Delay hook vì lhcV96RunCheck chưa chắc sẵn sàng
    setTimeout(hookAutoRecord, 2000);
    console.log('[LogicHealthPanel V96] 🩺 Health Panel khởi động — inject PUOS Settings · Nút Kiểm Tra Ngay · Lịch sử 20 lần · Auto-refresh 30s.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 26100); });
  } else {
    setTimeout(init, 26100);
  }
})();
