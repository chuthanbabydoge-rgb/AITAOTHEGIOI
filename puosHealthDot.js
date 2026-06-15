(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // PUOS HEALTH DOT V96
  // Widget nhỏ hiển thị 🟢/🟡/🔴 real-time trong sidebar PUOS Shell
  // - Tự cập nhật mỗi 5 giây
  // - Click → mở Settings > Logic Health Check
  // - Tooltip tóm tắt nhanh trạng thái
  // ══════════════════════════════════════════════════════════════════════

  var DOT_ID    = 'puos-health-dot-widget';
  var PULSE_ID  = 'puos-health-dot-pulse';
  var REFRESH_MS = 5000;
  var _timer = null;

  // ── Tính trạng thái từ dữ liệu health ──────────────────────────────
  function computeStatus() {
    var report = null;
    try {
      if (typeof window.lhcV96GetReport === 'function') {
        report = window.lhcV96GetReport();
      }
    } catch(e) {}

    if (!report) {
      return { dot: '⚫', color: '#334155', label: 'Chưa kiểm tra', tip: 'Chưa có dữ liệu health check.\nVào Settings để chạy kiểm tra.', level: 'unknown' };
    }
    if (report.status === 'NO_WORLD') {
      return { dot: '⚫', color: '#334155', label: 'Chưa có thế giới', tip: 'Chưa tạo thế giới nào.\nTạo thế giới để bắt đầu giám sát.', level: 'unknown' };
    }

    var issues = report.issues || [];
    var ticks  = report.ticksLastPeriod || 0;

    if (ticks === 0 && report.year > 1) {
      return { dot: '🔴', color: '#ef4444', label: 'gameTick dừng!', tip: '🔴 NGUY HIỂM: gameTick không chạy!\n0 ticks trong 60s qua.\nVào Settings để kiểm tra.', level: 'critical' };
    }
    if (issues.length === 0) {
      return { dot: '🟢', color: '#10b981', label: 'Hệ thống ổn định', tip: '🟢 Tất cả hệ thống hoạt động tốt.\nNăm ' + (report.year || '?') + ' · ' + ticks + ' ticks/60s', level: 'ok' };
    }
    if (issues.length <= 2) {
      return { dot: '🟡', color: '#f59e0b', label: issues.length + ' vấn đề nhỏ', tip: '🟡 ' + issues.length + ' vấn đề:\n' + issues.slice(0,2).join('\n'), level: 'warn' };
    }
    return { dot: '🔴', color: '#ef4444', label: issues.length + ' vấn đề!', tip: '🔴 ' + issues.length + ' vấn đề:\n' + issues.slice(0,3).join('\n') + (issues.length > 3 ? '\n...và ' + (issues.length-3) + ' vấn đề khác' : ''), level: 'critical' };
  }

  // ── Tạo/cập nhật DOM widget ─────────────────────────────────────────
  function injectDotStyle() {
    if (document.getElementById('puos-hd-style')) return;
    var s = document.createElement('style');
    s.id = 'puos-hd-style';
    s.textContent = [
      '#' + DOT_ID + ' { display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background 0.2s;margin-bottom:6px;border:1px solid transparent;position:relative; }',
      '#' + DOT_ID + ':hover { background:#0d1b2e!important;border-color:#1e293b!important; }',
      '#' + DOT_ID + ':hover #puos-hd-tooltip { opacity:1;pointer-events:auto;transform:translateY(0); }',
      '#puos-hd-emoji { font-size:14px;line-height:1;flex-shrink:0; }',
      '#puos-hd-label { font-size:10px;color:#475569;font-family:\'Noto Serif SC\',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0; }',
      '#' + PULSE_ID + ' { width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:hd-pulse 2.5s ease-in-out infinite; }',
      '@keyframes hd-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }',
      '#puos-hd-tooltip { position:absolute;bottom:calc(100% + 6px);left:8px;right:8px;background:#07111e;border:1px solid #1e3a5f;border-radius:8px;padding:10px 12px;font-size:10px;color:#94a3b8;font-family:\'Noto Serif SC\',serif;white-space:pre-line;line-height:1.6;z-index:99999;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity 0.2s,transform 0.2s;box-shadow:0 4px 20px #00000088; }',
      '#puos-hd-divider { height:1px;background:#0d1b2e;margin:0 10px 8px; }'
    ].join('\n');
    document.head.appendChild(s);
  }

  function buildDotHTML(status) {
    var pulseColor = status.level === 'ok' ? '#10b981' : status.level === 'warn' ? '#f59e0b' : status.level === 'critical' ? '#ef4444' : '#334155';
    var html = '';
    html += '<div id="puos-hd-tooltip">' + status.tip + '</div>';
    html += '<div id="puos-hd-emoji">' + status.dot + '</div>';
    html += '<div id="puos-hd-label">' + status.label + '</div>';
    html += '<div id="' + PULSE_ID + '" style="background:' + pulseColor + '"></div>';
    return html;
  }

  function findOrCreateDot() {
    var existing = document.getElementById(DOT_ID);
    if (existing) return existing;

    var sidebar = document.getElementById('puos-sidebar');
    if (!sidebar) return null;

    // Tìm footer (div cuối cùng trong sidebar)
    var children = sidebar.children;
    var footer = children[children.length - 1];
    if (!footer) return null;

    // Divider
    var divider = document.createElement('div');
    divider.id = 'puos-hd-divider';
    footer.insertBefore(divider, footer.firstChild);

    // Dot widget
    var dot = document.createElement('div');
    dot.id = DOT_ID;
    dot.setAttribute('title', '');
    dot.onclick = function() {
      if (typeof window.puosGo === 'function') {
        window.puosGo('settings');
      }
    };
    footer.insertBefore(dot, divider.nextSibling);

    return dot;
  }

  function updateDot() {
    var dot = document.getElementById(DOT_ID);
    if (!dot) {
      dot = findOrCreateDot();
      if (!dot) return;
    }
    var status = computeStatus();
    dot.innerHTML = buildDotHTML(status);
  }

  // ── Chạy update vòng lặp ────────────────────────────────────────────
  function startLoop() {
    if (_timer) clearInterval(_timer);
    updateDot();
    _timer = setInterval(updateDot, REFRESH_MS);
  }

  // ── Hook puosGo để re-inject nếu sidebar bị render lại ──────────────
  function hookPuosGo() {
    var _orig = window.puosGo;
    window.puosGo = function(sectionId) {
      if (typeof _orig === 'function') _orig(sectionId);
      // Sau khi nav re-render sidebar, re-inject dot
      setTimeout(function() {
        if (!document.getElementById(DOT_ID)) {
          findOrCreateDot();
          updateDot();
        }
      }, 150);
    };
  }

  function init() {
    injectDotStyle();
    // Chờ sidebar PUOS sẵn sàng
    var attempts = 0;
    var waitForShell = setInterval(function() {
      attempts++;
      if (document.getElementById('puos-sidebar')) {
        clearInterval(waitForShell);
        hookPuosGo();
        startLoop();
        console.log('[PUOS HealthDot V96] 🟢 Health Dot khởi động — cập nhật mỗi 5s · Click để xem chi tiết.');
      } else if (attempts > 60) {
        clearInterval(waitForShell);
        console.warn('[PUOS HealthDot V96] Không tìm thấy PUOS sidebar sau 30s.');
      }
    }, 500);
  }

  // Public API để force-refresh từ bên ngoài
  window.puosHealthDotRefresh = function() { updateDot(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 14200); });
  } else {
    setTimeout(init, 14200);
  }
})();
