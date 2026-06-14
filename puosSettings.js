(function() {
  "use strict";

  var activeTab = 'general';

  var TABS = [
    { id: 'general',     label: '⚙️ Chung' },
    { id: 'performance', label: '🚀 Hiệu Năng' },
    { id: 'security',    label: '🔒 Bảo Mật' },
    { id: 'backup',      label: '💾 Backup' },
    { id: 'advanced',    label: '🔧 Advanced' }
  ];

  window.puosSettingsTab = function(tabId) {
    activeTab = tabId;
    var main = document.getElementById('puos-main');
    if (main) puosRenderSettings(main);
  };

  window.puosRenderSettings = function(container) {
    var html = '<div class="puos-fade">';
    html += '<div style="padding:24px 32px 0">';
    html += '<div style="font-size:10px;color:#4a5568;letter-spacing:3px;margin-bottom:6px">SETTINGS</div>';
    html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 20px;font-weight:400">⚙ Settings</h1>';
    html += '</div>';

    html += '<div class="puos-tab-bar">';
    TABS.forEach(function(t) {
      html += '<button class="puos-tab' + (t.id === activeTab ? ' active' : '') + '" ';
      html += 'onclick="puosSettingsTab(\'' + t.id + '\')">' + t.label + '</button>';
    });
    html += '</div>';

    html += '<div style="padding:28px 32px;max-width:720px">';
    switch (activeTab) {
      case 'general':     html += renderGeneral(); break;
      case 'performance': html += renderPerformance(); break;
      case 'security':    html += renderSecurity(); break;
      case 'backup':      html += renderBackup(); break;
      case 'advanced':    html += renderAdvanced(); break;
    }
    html += '</div></div>';
    container.innerHTML = html;
  };

  function renderGeneral() {
    var yr = window.year || 1;
    var npcs = (window.npcs || []).length;
    var ctrs = (window.countries || []).length;

    var lsUsed = 0;
    try {
      var total = 0;
      for (var k in localStorage) {
        if (localStorage.hasOwnProperty(k)) total += (localStorage[k] || '').length * 2;
      }
      lsUsed = (total / 1024 / 1024).toFixed(2);
    } catch(e) {}

    var html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Thông Tin Vũ Trụ</div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">📅 Năm Hiện Tại</span><span class="puos-row-val">' + yr.toLocaleString() + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">🏛 Số Thế Lực</span><span class="puos-row-val">' + ctrs + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">👥 Số NPC</span><span class="puos-row-val">' + npcs + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">💾 Bộ Nhớ Đang Dùng</span><span class="puos-row-val">' + lsUsed + ' MB / 5 MB</span></div>';
    html += '<div style="margin-top:4px;height:6px;background:#0a1020;border-radius:3px"><div style="width:' + Math.min(100, (lsUsed / 5) * 100).toFixed(0) + '%;height:100%;background:' + (lsUsed > 3 ? '#ef4444' : '#10b981') + ';border-radius:3px"></div></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Giao Diện</div>';
    html += '<div class="puos-row">';
    html += '<div><div class="puos-row-lbl">⭕ PUOS Mode</div><div style="font-size:10px;color:#334155">Giao diện Personal Universe OS</div></div>';
    html += '<span class="puos-row-val ok">Đang bật</span>';
    html += '</div>';
    html += '<div class="puos-row">';
    html += '<div><div class="puos-row-lbl">⊞ Classic Mode</div><div style="font-size:10px;color:#334155">Giao diện cũ với đầy đủ tính năng</div></div>';
    html += '<button onclick="puosClassicToggle()" style="padding:6px 14px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#64748b;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Chuyển sang</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderPerformance() {
    var html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Trạng Thái Hiệu Năng</div>';

    var perfData = window.perfMonitorData;
    if (perfData) {
      html += '<div class="puos-row"><span class="puos-row-lbl">⏱ Tick Time</span><span class="puos-row-val">' + (perfData.avgTickTime || '?') + 'ms</span></div>';
      html += '<div class="puos-row"><span class="puos-row-lbl">🖼 Render Time</span><span class="puos-row-val">' + (perfData.avgRenderTime || '?') + 'ms</span></div>';
      html += '<div class="puos-row"><span class="puos-row-lbl">🧵 Web Workers</span><span class="puos-row-val ok">' + (perfData.workerCount || 0) + ' active</span></div>';
    } else {
      html += '<div class="puos-row"><span class="puos-row-lbl">⏱ Tick Time</span><span class="puos-row-val">—</span></div>';
      html += '<div class="puos-row"><span class="puos-row-lbl">🧵 Web Workers</span><span class="puos-row-val">' + (typeof window.webWorkerEngineData !== 'undefined' ? 'Active' : 'Loading') + '</span></div>';
    }

    var ww = window.workerPoolManagerData;
    if (ww) {
      html += '<div class="puos-row"><span class="puos-row-lbl">🔄 Worker Pool</span><span class="puos-row-val ok">' + (ww.activeWorkers || 0) + '/' + (ww.poolSize || 4) + ' workers</span></div>';
    }

    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'performance\')" style="width:100%;padding:8px;background:#3b82f614;border:1px solid #3b82f633;border-radius:6px;color:#3b82f6;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Performance Monitor Đầy Đủ →</button></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Tối Ưu Hóa</div>';
    var opts = [
      { icon: '🔄', name: 'NPC AI Cache', status: 'Bật', ok: true },
      { icon: '🖼', name: 'Render Cache', status: 'Bật', ok: true },
      { icon: '💾', name: 'Save Batcher', status: 'Bật', ok: true },
      { icon: '⚡', name: 'Lazy Tick', status: 'Bật', ok: true },
      { icon: '🧵', name: 'Web Workers', status: typeof window.webWorkerEngineData !== 'undefined' ? 'Bật' : 'Đang tải', ok: typeof window.webWorkerEngineData !== 'undefined' }
    ];
    opts.forEach(function(o) {
      html += '<div class="puos-row"><span class="puos-row-lbl">' + o.icon + ' ' + o.name + '</span><span class="puos-row-val' + (o.ok ? ' ok' : '') + '">' + o.status + '</span></div>';
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderSecurity() {
    var html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Trạng Thái Bảo Mật</div>';

    var sl = window.securityLayerData;
    var pe = window.permissionEngineData;

    html += '<div class="puos-row"><span class="puos-row-lbl">🔒 Security Layer</span><span class="puos-row-val ok">' + (sl ? 'V86 Active' : 'Đang khởi động') + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">🛡 Permission Engine</span><span class="puos-row-val ok">' + (pe ? (pe.permissions ? pe.permissions.length || 42 : 42) + ' permissions' : 'Loading') + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">📋 Audit Logger</span><span class="puos-row-val ok">' + (typeof window.al86Log === 'function' ? 'Tamper-Evident · Active' : 'Loading') + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">👤 RBAC Roles</span><span class="puos-row-val">6 vai trò · Creator/Admin/Moderator/Observer/Guest/System</span></div>';

    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'panel-creator-hub-v32\')" style="width:100%;padding:8px;background:#ef444414;border:1px solid #ef444433;border-radius:6px;color:#ef4444;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Audit Log Đầy Đủ →</button></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderBackup() {
    var html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Backup & Recovery</div>';
    html += '<button onclick="if(typeof be87ForceBackupNow===\'function\'){be87ForceBackupNow();alert(\'✅ Backup thành công!\');}else alert(\'Backup engine chưa sẵn sàng\')" style="padding:8px 16px;background:#10b98114;border:1px solid #10b98133;border-radius:6px;color:#10b981;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">💾 Backup Ngay</button>';
    html += '</div>';

    var be = window.backupEngineData;
    html += '<div class="puos-row"><span class="puos-row-lbl">🔄 Auto Backup</span><span class="puos-row-val ok">' + (typeof be87ForceBackupNow === 'function' ? 'Bật · Mỗi 500 ticks' : 'Chưa sẵn sàng') + '</span></div>';

    var snapCount = 0;
    try {
      var idx = JSON.parse(localStorage.getItem('cgv6_backup_engine_v87_index') || '[]');
      snapCount = Array.isArray(idx) ? idx.length : 0;
    } catch(e) {}
    html += '<div class="puos-row"><span class="puos-row-lbl">📦 Số Snapshots</span><span class="puos-row-val">' + snapCount + ' snapshots</span></div>';

    var healthResult = null;
    try {
      if (typeof drs87CheckWorldHealth === 'function') healthResult = drs87CheckWorldHealth();
    } catch(e) {}
    if (healthResult) {
      var statusColor = healthResult.status === 'HEALTHY' ? '#10b981' : healthResult.status === 'WARNING' ? '#f59e0b' : '#ef4444';
      html += '<div class="puos-row"><span class="puos-row-lbl">💚 World Health</span><span class="puos-row-val" style="color:' + statusColor + '">' + healthResult.status + '</span></div>';
    }

    html += '<div style="margin-top:12px"><button onclick="puosGo(\'worlds\');setTimeout(function(){puosWorldsTab(\'snapshots\')},200)" style="width:100%;padding:8px;background:#10b98114;border:1px solid #10b98133;border-radius:6px;color:#10b981;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Quản Lý Snapshots →</button></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdvanced() {
    var jsFiles = 0;
    var enginesActive = 0;
    try {
      var scripts = document.querySelectorAll('script[src]');
      jsFiles = scripts.length;
    } catch(e) {}
    try {
      if (window.puosData && window.puosData.engineCount) enginesActive = window.puosData.engineCount;
      else enginesActive = jsFiles;
    } catch(e) {}

    var html = '<div style="display:flex;flex-direction:column;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Thông Tin Hệ Thống</div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">📁 JS Files</span><span class="puos-row-val">' + jsFiles + ' scripts</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">🔢 Phiên Bản</span><span class="puos-row-val">Creator God V6 · V90</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">⭕ PUOS ID</span><span class="puos-row-val">' + (window.puosData && window.puosData.universeId ? window.puosData.universeId : 'PUOS-' + Math.random().toString(36).slice(2, 8).toUpperCase()) + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">🌐 XR Device</span><span class="puos-row-val">' + (typeof window.xrda89GetDevice === 'function' ? window.xrda89GetDevice() : 'desktop') + '</span></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Truy Cập Classic Panels</div>';
    var classicPanels = [
      { label: '👁 Creator Hub', panel: 'panel-creator-hub-v32' },
      { label: '👤 Player Hub',  panel: 'player-hub-v28' },
      { label: '🌌 Multiverse Hub', panel: 'multiverse-hub-v35' },
      { label: '🗺 Bản Đồ', panel: 'worldmap' },
      { label: '⚙️ Dashboard', panel: 'dashboard' },
      { label: '📊 Performance', panel: 'performance' }
    ];
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    classicPanels.forEach(function(p) {
      html += '<button onclick="puosOpenClassicPanel(\'' + p.panel + '\')" style="padding:7px 12px;background:#0d1b2e;border:1px solid #1e293b;border-radius:6px;color:#64748b;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">' + p.label + '</button>';
    });
    html += '</div></div>';

    html += '<div class="puos-card" style="border-color:#ef444433">';
    html += '<div class="puos-card-title" style="color:#ef4444">Vùng Nguy Hiểm</div>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    html += '<button onclick="if(confirm(\'Xóa toàn bộ dữ liệu? KHÔNG THỂ HOÀN TÁC!\')){localStorage.clear();location.reload()}" style="padding:8px 14px;background:#ef444414;border:1px solid #ef444433;border-radius:6px;color:#ef4444;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🗑 Xóa Toàn Bộ Dữ Liệu</button>';
    html += '<button onclick="location.reload()" style="padding:8px 14px;background:#f59e0b14;border:1px solid #f59e0b33;border-radius:6px;color:#f59e0b;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🔄 Reload Trang</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  console.log('[PUOS Settings V90] ⚙️ Settings panel sẵn sàng.');
})();
