(function() {
  "use strict";

  function statCard(icon, label, val, color) {
    return '<div class="puos-card" style="border-top:2px solid ' + color + '">' +
      '<div style="font-size:24px;margin-bottom:8px">' + icon + '</div>' +
      '<div class="puos-stat-val" style="color:' + color + '">' + val + '</div>' +
      '<div class="puos-stat-lbl">' + label + '</div>' +
    '</div>';
  }

  function actionBtn(icon, label, onclick, color) {
    return '<button class="puos-action" onclick="' + onclick + '" ' +
      'style="color:' + color + ';border-color:' + color + '44;background:' + color + '0f" ' +
      'onmouseover="this.style.background=\'' + color + '22\'" onmouseout="this.style.background=\'' + color + '0f\'">' +
      '<span>' + icon + '</span><span>' + label + '</span>' +
    '</button>';
  }

  function statusRow(icon, label, val, ok) {
    return '<div class="puos-row">' +
      '<span class="puos-row-lbl">' + icon + ' ' + label + '</span>' +
      '<span class="puos-row-val' + (ok ? ' ok' : '') + '">' + val + '</span>' +
    '</div>';
  }

  window.puosRenderMyUniverse = function(container) {
    var yr    = window.year || 1;
    var npcs  = window.npcs || [];
    var ctrs  = window.countries || [];
    var world = window.world || {};

    var healthScore = 70;
    var healthColor = '#10b981';
    try {
      if (typeof window.drs87CheckWorldHealth === 'function') {
        var h = window.drs87CheckWorldHealth();
        healthScore = h.status === 'HEALTHY' ? 88 : h.status === 'WARNING' ? 55 : 30;
      }
    } catch(e) {}
    if (healthScore < 50) healthColor = '#ef4444';
    else if (healthScore < 72) healthColor = '#f59e0b';

    var activeCivs = ctrs.filter(function(c) { return c && c.population > 0; }).length;
    var activeReli = ctrs.filter(function(c) { return c && c.religion; }).length;
    var mvWorlds = 0;
    try {
      var mvd = window.multiverseEvolutionData;
      if (mvd && Array.isArray(mvd.worlds)) mvWorlds = mvd.worlds.length;
    } catch(e) {}
    var xrDev = 'desktop';
    try {
      if (typeof window.xrda89GetDevice === 'function') xrDev = window.xrda89GetDevice();
    } catch(e) {}
    var backupOk = typeof window.be87ForceBackupNow === 'function';
    var aiOk = typeof window.aiCall === 'function';

    var html = '<div class="puos-fade" style="padding:32px 32px 48px;max-width:1080px">';

    html += '<div style="margin-bottom:28px">';
    html += '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:6px">PERSONAL UNIVERSE OS</div>';
    html += '<h1 style="font-size:26px;color:#e2e8f0;margin:0 0 6px;font-weight:400">🪐 Vũ Trụ Của Tôi</h1>';
    html += '<div style="font-size:13px;color:#4a5568">Năm ' + yr.toLocaleString() + ' · ' + ctrs.length + ' thế lực · ' + npcs.length + ' sinh linh đang sống</div>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px">';
    html += statCard('📅', 'Năm Vũ Trụ', yr.toLocaleString(), '#7c3aed');
    html += statCard('👥', 'Sinh Linh', npcs.length.toLocaleString(), '#3b82f6');
    html += statCard('🏛', 'Văn Minh', activeCivs + ' thế lực', '#10b981');
    html += statCard('💚', 'Sức Khỏe', healthScore + '%', healthColor);
    html += '</div>';

    html += '<div style="margin-bottom:28px">';
    html += '<div style="font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:12px">HÀNH ĐỘNG NHANH</div>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    html += actionBtn('✨', 'Tạo Thế Giới',  "puosGo('worlds')",        '#7c3aed');
    html += actionBtn('🤖', 'Hỏi Jarvis',    "puosGo('jarvis')",        '#3b82f6');
    html += actionBtn('🌌', 'Universe Hub',  "puosGo('universe-hub')",  '#8b5cf6');
    html += actionBtn('🗺', 'Bản Đồ Thế Giới', "puosOpenClassicPanel('worldmap')", '#10b981');
    html += actionBtn('🎬', 'XR / Chiều Không Gian', "puosOpenClassicPanel('panel-creator-hub-v32',window.xrwRenderPanel)", '#f59e0b');
    html += '</div>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Trạng Thái Vũ Trụ</div>';
    html += statusRow('🌍', 'Thế Giới', world.name || (ctrs.length > 0 ? 'Đang chạy' : 'Chưa tạo'), ctrs.length > 0);
    html += statusRow('🏛', 'Văn Minh', activeCivs + ' đang hoạt động', activeCivs > 0);
    html += statusRow('👥', 'NPC AI',   npcs.length + ' sinh linh', npcs.length > 0);
    html += statusRow('🛕', 'Tôn Giáo', activeReli + ' tín ngưỡng', activeReli > 0);
    html += statusRow('⚔️', 'Chiến Tranh', (window.warsActive && window.warsActive.length > 0) ? window.warsActive.length + ' xung đột' : 'Hòa bình', !(window.warsActive && window.warsActive.length > 0));
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Hệ Thống</div>';
    html += statusRow('🤖', 'Jarvis AI',  aiOk ? 'Hoạt động · Claude API' : 'Offline', aiOk);
    html += statusRow('🥽', 'XR Mode',   xrDev === 'desktop' ? 'Desktop mode' : xrDev, xrDev !== 'desktop');
    html += statusRow('🌌', 'Multiverse', mvWorlds + ' vũ trụ song song', mvWorlds > 0);
    html += statusRow('💾', 'Auto Backup', backupOk ? 'Bật · Mỗi 500 ticks' : 'Chưa cấu hình', backupOk);
    html += statusRow('📊', 'Analytics',  typeof window.ae88GetDashboard === 'function' ? 'Đang thu thập 27 chỉ số' : 'Offline', typeof window.ae88GetDashboard === 'function');
    html += '</div>';

    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Sự Kiện Gần Đây</div>';
    html += '<div id="puos-mu-events"><div style="color:#1e293b;text-align:center;padding:20px;font-size:12px">Đang tải sự kiện...</div></div>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
    loadRecentEvents();
  };

  function loadRecentEvents() {
    setTimeout(function() {
      var el = document.getElementById('puos-mu-events');
      if (!el) return;
      var events = [];
      try {
        var keys = ['cgv6_historical_timeline','cgv6_world_events_v25','cgv6_world_event_v25'];
        for (var i = 0; i < keys.length; i++) {
          var d = localStorage.getItem(keys[i]);
          if (d) {
            var parsed = JSON.parse(d);
            var arr = parsed.events || parsed.history || [];
            if (arr.length > 0) { events = arr; break; }
          }
        }
      } catch(e) {}
      if (events.length === 0) {
        el.innerHTML = '<div style="color:#1e293b;text-align:center;padding:20px;font-size:12px">Chưa có sự kiện. Hãy tạo thế giới để bắt đầu.</div>';
        return;
      }
      var recent = events.slice(-8).reverse();
      el.innerHTML = recent.map(function(ev) {
        var col = ev.color || '#64748b';
        return '<div class="puos-row">' +
          '<span style="font-size:10px;color:#334155;white-space:nowrap;min-width:60px">Năm ' + (ev.year || '?') + '</span>' +
          '<span style="font-size:10px;color:' + col + ';margin:0 8px">●</span>' +
          '<span style="font-size:12px;color:#94a3b8">' + (ev.title || ev.content || '') + '</span>' +
        '</div>';
      }).join('');
    }, 400);
  }

  console.log('[PUOS My Universe V90] 🪐 My Universe panel sẵn sàng.');
})();
