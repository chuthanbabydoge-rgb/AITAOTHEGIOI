(function() {
  "use strict";

  var activeTab = 'worlds';

  var TABS = [
    { id: 'worlds',     label: '🌍 Worlds' },
    { id: 'creators',   label: '👤 Creators' },
    { id: 'portals',    label: '🌀 Portals' },
    { id: 'events',     label: '⚡ Events' },
    { id: 'multiverse', label: '🌌 Multiverse' }
  ];

  window.puosHubTab = function(tabId) {
    activeTab = tabId;
    var main = document.getElementById('puos-main');
    if (main) puosRenderUniverseHub(main);
  };

  window.puosRenderUniverseHub = function(container) {
    var html = '<div class="puos-fade">';
    html += '<div style="padding:24px 32px 0">';
    html += '<div style="font-size:10px;color:#8b5cf6;letter-spacing:3px;margin-bottom:6px">UNIVERSE HUB</div>';
    html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 20px;font-weight:400">🌌 Universe Hub</h1>';
    html += '</div>';

    html += '<div class="puos-tab-bar">';
    TABS.forEach(function(t) {
      html += '<button class="puos-tab' + (t.id === activeTab ? ' active' : '') + '" ';
      html += 'onclick="puosHubTab(\'' + t.id + '\')">' + t.label + '</button>';
    });
    html += '</div>';

    html += '<div style="padding:28px 32px">';
    switch (activeTab) {
      case 'worlds':     html += renderWorlds(); break;
      case 'creators':   html += renderCreators(); break;
      case 'portals':    html += renderPortals(); break;
      case 'events':     html += renderEvents(); break;
      case 'multiverse': html += renderMultiverse(); break;
    }
    html += '</div></div>';
    container.innerHTML = html;
  };

  function renderWorlds() {
    var uhData = window.universeHubData;
    var worlds = [];
    if (uhData && Array.isArray(uhData.worlds)) worlds = uhData.worlds;

    var mvData = window.multiverseEvolutionData;
    var mvWorlds = 0;
    if (mvData && Array.isArray(mvData.worlds)) mvWorlds = mvData.worlds.length;

    var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">';
    html += _hubCard('🌍', 'Thế Giới Đã Tạo', worlds.length > 0 ? worlds.length : (window.countries && window.countries.length > 0 ? '1+' : '0'), '#3b82f6');
    html += _hubCard('🌌', 'Đa Vũ Trụ', mvWorlds + ' vũ trụ', '#8b5cf6');
    html += _hubCard('👤', 'Creators', worlds.filter(function(w) { return w.creator; }).length || 0, '#10b981');
    html += '</div>';

    if (worlds.length === 0) {
      html += '<div class="puos-card" style="text-align:center;padding:48px">';
      html += '<div style="font-size:48px;margin-bottom:16px">🌌</div>';
      html += '<div style="font-size:16px;color:#4a5568;margin-bottom:8px">Universe Hub Đang Trống</div>';
      html += '<div style="font-size:12px;color:#334155;margin-bottom:20px">Tạo thế giới để bắt đầu xây dựng Universe Hub của bạn</div>';
      html += '<div style="display:flex;gap:10px;justify-content:center">';
      html += '<button onclick="puosGo(\'worlds\')" style="padding:10px 20px;background:#7c3aed;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif">✨ Tạo Thế Giới</button>';
      html += '<button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="padding:10px 20px;background:transparent;border:1px solid #1e293b;border-radius:8px;color:#4a5568;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif">🌌 Universe Hub Đầy Đủ</button>';
      html += '</div></div>';
    } else {
      html += '<div class="puos-card">';
      html += '<div class="puos-card-title">World Directory</div>';
      worlds.slice(0, 10).forEach(function(w) {
        html += '<div class="puos-row">';
        html += '<div><div style="font-size:13px;color:#cbd5e1">' + (w.name || 'Unnamed') + '</div>';
        html += '<div style="font-size:10px;color:#334155">' + (w.type || '') + ' · ' + (w.status || 'active') + '</div></div>';
        html += '<span class="puos-badge">' + (w.stage || 'Evolving') + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '<div style="margin-top:14px"><button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="padding:10px 20px;background:#8b5cf614;border:1px solid #8b5cf633;border-radius:8px;color:#a78bfa;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif">🌌 Mở Universe Hub Đầy Đủ →</button></div>';
    return html;
  }

  function renderCreators() {
    var uhData = window.universeHubData;
    var creators = [];
    if (uhData && Array.isArray(uhData.creators)) creators = uhData.creators;

    var html = '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Creator Directory</div>';
    html += '<button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="padding:6px 12px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#4a5568;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Đầy Đủ →</button>';
    html += '</div>';

    if (creators.length === 0) {
      creators = [
        { name: 'Ngươi', worlds: 1, followers: 0, status: 'active', rank: 1 },
        { name: 'Chaos Engine', worlds: 8, followers: 1200, status: 'legend', rank: 2 },
        { name: 'Celestial Forge', worlds: 5, followers: 890, status: 'active', rank: 3 }
      ];
    }

    creators.slice(0, 8).forEach(function(c, i) {
      var statusColor = c.status === 'legend' ? '#f59e0b' : c.status === 'active' ? '#10b981' : '#4a5568';
      html += '<div class="puos-row">';
      html += '<div style="display:flex;align-items:center;gap:12px">';
      html += '<div style="width:32px;height:32px;border-radius:50%;background:#7c3aed22;display:flex;align-items:center;justify-content:center;font-size:14px">' + (i === 0 ? '⭕' : '👤') + '</div>';
      html += '<div>';
      html += '<div style="font-size:13px;color:#cbd5e1">' + c.name + '</div>';
      html += '<div style="font-size:10px;color:#334155">' + (c.worlds || 0) + ' worlds · ' + (c.followers || 0) + ' followers</div>';
      html += '</div></div>';
      html += '<span style="font-size:11px;color:' + statusColor + '">' + (c.status || 'active') + '</span>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderPortals() {
    var portalData = window.universeGateData;
    var portals = [];
    if (portalData && Array.isArray(portalData.gates)) portals = portalData.gates;

    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Cổng Portal Đang Hoạt Động</div>';
    if (portals.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#334155;font-size:12px">Chưa có portal nào<br><span style="font-size:10px">Mở Universe Hub để tạo portal</span></div>';
    } else {
      portals.slice(0, 5).forEach(function(p) {
        html += '<div class="puos-row">';
        html += '<span style="color:#06b6d4;font-size:12px">🌀 ' + (p.name || 'Portal') + '</span>';
        html += '<span class="puos-row-val">' + (p.status || 'active') + '</span>';
        html += '</div>';
      });
    }
    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="width:100%;padding:8px;background:#06b6d414;border:1px solid #06b6d433;border-radius:6px;color:#06b6d4;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Quản Lý Portal →</button></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Du Hành Liên Vũ Trụ</div>';
    var passportData = window.universePassportData;
    var trips = passportData ? (passportData.trips || 0) : 0;
    var rank  = passportData ? (passportData.rank || 'Citizen') : 'Citizen';
    html += '<div class="puos-row"><span class="puos-row-lbl">🛂 Bậc Hộ Chiếu</span><span class="puos-row-val ok">' + rank + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">✈️ Chuyến Đã Đi</span><span class="puos-row-val">' + trips + '</span></div>';
    html += '<div class="puos-row"><span class="puos-row-lbl">🌌 Vũ Trụ Đã Thăm</span><span class="puos-row-val">' + (passportData ? (passportData.visited || []).length : 0) + '</span></div>';
    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="width:100%;padding:8px;background:#10b98114;border:1px solid #10b98133;border-radius:6px;color:#10b981;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Hộ Chiếu Vũ Trụ →</button></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderEvents() {
    var html = '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Sự Kiện Toàn Cầu</div>';
    html += '<button onclick="puosOpenClassicPanel(\'panel-creator-hub-v32\')" style="padding:6px 12px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#4a5568;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Đầy Đủ →</button>';
    html += '</div>';

    var eventTypes = [
      { icon: '⚡', name: 'Sự Kiện Thế Giới', desc: 'Thiên tai, dịch bệnh, biến cố lớn', onclick: "puosOpenClassicPanel('event-hub-v25')" },
      { icon: '🌌', name: 'Sự Kiện Đa Vũ Trụ', desc: 'Va chạm vũ trụ, hội nghị liên thế giới', onclick: "puosOpenClassicPanel('panel-creator-hub-v32')" },
      { icon: '🎊', name: 'Sự Kiện Cộng Đồng', desc: 'Lễ hội, giải đấu, hội chợ', onclick: "puosOpenClassicPanel('panel-creator-hub-v32')" },
      { icon: '👹', name: 'World Boss', desc: 'Mega-boss đe dọa đa vũ trụ', onclick: "puosOpenClassicPanel('combat-hub-v31')" }
    ];

    eventTypes.forEach(function(e) {
      html += '<div class="puos-row" style="cursor:pointer" onclick="' + e.onclick + '">';
      html += '<div style="display:flex;align-items:center;gap:12px">';
      html += '<span style="font-size:20px">' + e.icon + '</span>';
      html += '<div><div style="font-size:13px;color:#cbd5e1">' + e.name + '</div><div style="font-size:11px;color:#334155">' + e.desc + '</div></div>';
      html += '</div>';
      html += '<span style="color:#334155;font-size:12px">→</span>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderMultiverse() {
    var mvd = window.multiverseEvolutionData;
    var worlds = (mvd && Array.isArray(mvd.worlds)) ? mvd.worlds : [];
    var stage = (mvd && mvd.stage) ? mvd.stage : 'Primordial';
    var dominant = (mvd && mvd.dominant) ? mvd.dominant : null;

    var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">';
    html += _hubCard('🌌', 'Vũ Trụ', worlds.length, '#8b5cf6');
    html += _hubCard('🔄', 'Giai Đoạn', stage, '#7c3aed');
    html += _hubCard('👑', 'Dominant', dominant ? dominant.name || dominant : '—', '#f59e0b');
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Các Vũ Trụ Đang Tiến Hóa</div>';

    if (worlds.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">';
      html += '<div style="font-size:40px;margin-bottom:12px">🌌</div>';
      html += 'Đa vũ trụ sẽ hình thành khi thế giới phát triển</div>';
    } else {
      worlds.slice(0, 8).forEach(function(w) {
        var powerPct = w.power ? Math.min(100, Math.round(w.power)) : 0;
        html += '<div class="puos-row">';
        html += '<div style="flex:1">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px">';
        html += '<span style="font-size:12px;color:#cbd5e1">' + (w.name || 'Universe') + '</span>';
        html += '<span style="font-size:10px;color:#4a5568">' + (w.type || '') + ' · Lv.' + (w.stage || 1) + '</span>';
        html += '</div>';
        html += '<div style="height:4px;background:#0d1117;border-radius:2px"><div style="width:' + powerPct + '%;height:100%;background:linear-gradient(90deg,#7c3aed,#8b5cf6);border-radius:2px"></div></div>';
        html += '</div></div>';
      });
    }
    html += '<div style="margin-top:14px"><button onclick="puosOpenClassicPanel(\'panel-universe-hub-v73\')" style="width:100%;padding:8px;background:#7c3aed14;border:1px solid #7c3aed33;border-radius:6px;color:#a78bfa;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🌌 Multiverse Đầy Đủ →</button></div>';
    html += '</div>';
    return html;
  }

  function _hubCard(icon, label, val, color) {
    return '<div class="puos-card" style="border-top:2px solid ' + color + '">' +
      '<div style="font-size:20px;margin-bottom:6px">' + icon + '</div>' +
      '<div style="font-size:18px;font-weight:bold;color:' + color + '">' + val + '</div>' +
      '<div style="font-size:11px;color:#4a5568;margin-top:4px">' + label + '</div>' +
    '</div>';
  }

  console.log('[PUOS Universe Hub V90] 🌌 Universe Hub panel sẵn sàng.');
})();
