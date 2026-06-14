(function() {
  "use strict";

  var activeTab = 'overview';

  var TABS = [
    { id: 'overview',  label: '🌟 Tổng Quan' },
    { id: 'cultures',  label: '🎨 Văn Hóa' },
    { id: 'religions', label: '🛕 Tôn Giáo' },
    { id: 'knowledge', label: '📚 Tri Thức' },
    { id: 'history',   label: '📜 Lịch Sử' }
  ];

  window.puosCivTab = function(tabId) {
    activeTab = tabId;
    var main = document.getElementById('puos-main');
    if (main) puosRenderCivilization(main);
  };

  window.puosRenderCivilization = function(container) {
    var html = '<div class="puos-fade">';
    html += '<div style="padding:24px 32px 0">';
    html += '<div style="font-size:10px;color:#10b981;letter-spacing:3px;margin-bottom:6px">CIVILIZATION</div>';
    html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 20px;font-weight:400">🏛 Civilization</h1>';
    html += '</div>';

    html += '<div class="puos-tab-bar">';
    TABS.forEach(function(t) {
      html += '<button class="puos-tab' + (t.id === activeTab ? ' active' : '') + '" ';
      html += 'onclick="puosCivTab(\'' + t.id + '\')">' + t.label + '</button>';
    });
    html += '</div>';

    html += '<div style="padding:28px 32px">';
    switch (activeTab) {
      case 'overview':  html += renderOverview(); break;
      case 'cultures':  html += renderCultures(); break;
      case 'religions': html += renderReligions(); break;
      case 'knowledge': html += renderKnowledge(); break;
      case 'history':   html += renderHistory(); break;
    }
    html += '</div></div>';
    container.innerHTML = html;
  };

  function renderOverview() {
    var ctrs = window.countries || [];
    var alive = ctrs.filter(function(c) { return c && c.population > 0; });

    var techLevels = {};
    alive.forEach(function(c) {
      var t = c.techLevel || c.technology || 1;
      techLevels[Math.floor(t)] = (techLevels[Math.floor(t)] || 0) + 1;
    });
    var avgTech = alive.length > 0 ? (alive.reduce(function(s, c) { return s + (c.techLevel || 1); }, 0) / alive.length).toFixed(1) : 0;

    var religions = {};
    alive.forEach(function(c) { if (c.religion) religions[c.religion] = (religions[c.religion] || 0) + 1; });
    var relCount = Object.keys(religions).length;

    var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">';
    html += _civCard('🏛', 'Văn Minh', alive.length, '#10b981');
    html += _civCard('🛕', 'Tôn Giáo', relCount, '#f59e0b');
    html += _civCard('⚙️', 'Tech TB', 'Lv. ' + avgTech, '#3b82f6');
    html += _civCard('⚔️', 'Xung Đột', (window.warsActive || []).length, '#ef4444');
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Văn Minh Mạnh Nhất</div>';
    var sorted = alive.sort(function(a, b) { return (b.population || 0) - (a.population || 0); }).slice(0, 6);
    sorted.forEach(function(c, i) {
      var pop = (c.population || 0).toLocaleString();
      html += '<div class="puos-row">';
      html += '<span style="color:#cbd5e1;font-size:12px"><span style="color:#334155;margin-right:6px">' + (i + 1) + '.</span>' + (c.name || '?') + '</span>';
      html += '<span class="puos-row-val">' + pop + '</span>';
      html += '</div>';
    });
    if (alive.length === 0) {
      html += '<div style="text-align:center;color:#334155;padding:20px;font-size:12px">Chưa có văn minh nào</div>';
    }
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Tôn Giáo Phổ Biến</div>';
    var relArr = Object.keys(religions).map(function(k) { return { name: k, count: religions[k] }; });
    relArr.sort(function(a, b) { return b.count - a.count; }).slice(0, 6).forEach(function(r) {
      var pct = Math.round((r.count / alive.length) * 100);
      html += '<div class="puos-row">';
      html += '<span style="color:#cbd5e1;font-size:12px">🛕 ' + r.name + '</span>';
      html += '<span class="puos-row-val">' + r.count + ' quốc gia (' + pct + '%)</span>';
      html += '</div>';
    });
    if (relArr.length === 0) {
      html += '<div style="text-align:center;color:#334155;padding:20px;font-size:12px">Chưa có tôn giáo nào</div>';
    }
    html += '</div>';

    html += '</div>';

    html += '<div style="margin-top:14px">';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    html += _openBtn('🎨 Văn Hóa Chi Tiết',  "puosCivTab('cultures')",  '#10b981');
    html += _openBtn('🏛 Civ Overview', "puosOpenClassicPanel('panel-civ-overview-v38',window.civEvoRenderOverview)", '#3b82f6');
    html += _openBtn('📊 Thống Kê', "puosOpenClassicPanel('panel-civ-stats-v38',window.civEvoRenderStats)", '#7c3aed');
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderCultures() {
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Các Truyền Thống Văn Hóa</div>';
    var ctrs = (window.countries || []).filter(function(c) { return c && c.culture; });
    var cultures = {};
    ctrs.forEach(function(c) { cultures[c.culture] = (cultures[c.culture] || 0) + 1; });
    var cArr = Object.keys(cultures).sort(function(a, b) { return cultures[b] - cultures[a]; });
    if (cArr.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#334155;font-size:12px">Chưa có dữ liệu văn hóa<br><span style="font-size:10px">Dữ liệu sẽ xuất hiện khi thế giới phát triển</span></div>';
    } else {
      cArr.slice(0, 8).forEach(function(k) {
        html += '<div class="puos-row"><span style="color:#cbd5e1;font-size:12px">🎨 ' + k + '</span><span class="puos-row-val">' + cultures[k] + ' quốc gia</span></div>';
      });
    }
    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'panel-civ-culture-v38\',window.civEvoRenderCulture)" style="width:100%;padding:8px;background:#10b98114;border:1px solid #10b98133;border-radius:6px;color:#10b981;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Đầy Đủ →</button></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Mức Độ Phát Triển Văn Hóa</div>';
    var civEvo = window.culturalEvolutionV79Data;
    if (civEvo && Array.isArray(civEvo.traits) && civEvo.traits.length > 0) {
      civEvo.traits.slice(0, 8).forEach(function(t) {
        html += '<div class="puos-row">';
        html += '<span style="font-size:12px;color:#cbd5e1">' + (t.name || t.id || '?') + '</span>';
        html += '<div style="flex:1;margin:0 12px;height:4px;background:#0d1117;border-radius:2px"><div style="width:' + Math.min(100, t.strength || 50) + '%;height:100%;background:#10b981;border-radius:2px"></div></div>';
        html += '<span class="puos-row-val">' + (t.strength || '?') + '%</span>';
        html += '</div>';
      });
    } else {
      var techRows = [
        { name: 'Nghệ Thuật', pct: 45 },
        { name: 'Văn Học', pct: 38 },
        { name: 'Âm Nhạc', pct: 52 },
        { name: 'Kiến Trúc', pct: 61 }
      ];
      techRows.forEach(function(r) {
        html += '<div class="puos-row">';
        html += '<span style="font-size:12px;color:#64748b">' + r.name + '</span>';
        html += '<div style="flex:1;margin:0 12px;height:4px;background:#0d1117;border-radius:2px"><div style="width:' + r.pct + '%;height:100%;background:#1e293b;border-radius:2px"></div></div>';
        html += '<span class="puos-row-val" style="color:#334155">—</span>';
        html += '</div>';
      });
      html += '<div style="font-size:10px;color:#1e293b;text-align:center;margin-top:8px">Dữ liệu sẽ cập nhật khi văn minh phát triển</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderReligions() {
    var ctrs = window.countries || [];
    var alive = ctrs.filter(function(c) { return c && c.religion; });
    var religions = {};
    alive.forEach(function(c) {
      if (!religions[c.religion]) religions[c.religion] = { count: 0, pop: 0 };
      religions[c.religion].count++;
      religions[c.religion].pop += (c.population || 0);
    });

    var html = '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Tôn Giáo Trong Thế Giới</div>';
    html += '<button onclick="puosOpenClassicPanel(\'panel-civ-religion-v38\',window.civEvoRenderReligion)" style="padding:6px 12px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#4a5568;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Đầy Đủ →</button>';
    html += '</div>';

    var rArr = Object.keys(religions).map(function(k) {
      return { name: k, count: religions[k].count, pop: religions[k].pop };
    }).sort(function(a, b) { return b.pop - a.pop; });

    if (rArr.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">Chưa có tôn giáo nào xuất hiện</div>';
    } else {
      var maxPop = rArr[0].pop || 1;
      rArr.forEach(function(r) {
        var pct = Math.round((r.pop / maxPop) * 100);
        html += '<div style="margin-bottom:14px">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px">';
        html += '<span style="color:#cbd5e1;font-size:13px">🛕 ' + r.name + '</span>';
        html += '<span style="color:#4a5568;font-size:11px">' + r.count + ' quốc gia · ' + r.pop.toLocaleString() + ' tín đồ</span>';
        html += '</div>';
        html += '<div style="height:6px;background:#0d1117;border-radius:3px"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#f59e0b,#f59e0b88);border-radius:3px"></div></div>';
        html += '</div>';
      });
    }
    html += '</div>';
    return html;
  }

  function renderKnowledge() {
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Trình Độ Công Nghệ</div>';
    var ctrs = (window.countries || []).filter(function(c) { return c && c.population > 0; });
    var techBuckets = { 'Thô Sơ (1-2)': 0, 'Cổ Đại (3-4)': 0, 'Trung Cổ (5-6)': 0, 'Hiện Đại (7+)': 0 };
    ctrs.forEach(function(c) {
      var t = c.techLevel || 1;
      if (t <= 2) techBuckets['Thô Sơ (1-2)']++;
      else if (t <= 4) techBuckets['Cổ Đại (3-4)']++;
      else if (t <= 6) techBuckets['Trung Cổ (5-6)']++;
      else techBuckets['Hiện Đại (7+)']++;
    });
    Object.keys(techBuckets).forEach(function(k) {
      html += '<div class="puos-row"><span style="font-size:12px;color:#64748b">⚙️ ' + k + '</span><span class="puos-row-val">' + techBuckets[k] + ' quốc gia</span></div>';
    });
    html += '<div style="margin-top:12px"><button onclick="puosOpenClassicPanel(\'panel-civ-tech-v38\',window.civEvoRenderTechnology)" style="width:100%;padding:8px;background:#3b82f614;border:1px solid #3b82f633;border-radius:6px;color:#3b82f6;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">Xem Đầy Đủ →</button></div>';
    html += '</div>';

    html += '<div class="puos-card">';
    html += '<div class="puos-card-title">Học Viện & Triết Học</div>';
    var acData = window.academyEngineV79Data;
    if (acData && Array.isArray(acData.academies) && acData.academies.length > 0) {
      acData.academies.slice(0, 5).forEach(function(a) {
        html += '<div class="puos-row"><span style="font-size:12px;color:#cbd5e1">🎓 ' + (a.name || '?') + '</span><span class="puos-row-val">' + (a.type || '') + '</span></div>';
      });
    } else {
      html += '<div style="text-align:center;padding:20px;color:#334155;font-size:12px">Học Viện sẽ xuất hiện khi văn minh phát triển</div>';
    }
    var phData = window.philosophyEngineV79Data;
    if (phData && Array.isArray(phData.schools) && phData.schools.length > 0) {
      html += '<div style="border-top:1px solid #1e293b;margin-top:8px;padding-top:8px">';
      phData.schools.slice(0, 4).forEach(function(s) {
        html += '<div class="puos-row"><span style="font-size:12px;color:#94a3b8">💭 ' + (s.name || '?') + '</span><span class="puos-row-val">' + (s.followers || 0) + ' tín đồ</span></div>';
      });
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderHistory() {
    var html = '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Biên Niên Sử</div>';
    html += '<div style="display:flex;gap:8px">';
    html += '<button onclick="puosOpenClassicPanel(\'world-history\')" style="padding:6px 12px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#4a5568;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">📜 Biên Niên Sử Đầy Đủ</button>';
    html += '<button onclick="puosOpenClassicPanel(\'world-memory\')" style="padding:6px 12px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#4a5568;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">🧠 Ký Ức Thế Giới</button>';
    html += '</div></div>';

    var events = [];
    try {
      var keys = ['cgv6_historical_timeline','cgv6_world_events_v25'];
      for (var i = 0; i < keys.length; i++) {
        var d = localStorage.getItem(keys[i]);
        if (d) {
          var p = JSON.parse(d);
          var arr = p.events || p.history || [];
          if (arr.length > 0) { events = arr; break; }
        }
      }
    } catch(e) {}

    if (events.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">Lịch sử sẽ được ghi lại khi thế giới phát triển</div>';
    } else {
      var recent = events.slice(-20).reverse();
      recent.forEach(function(ev) {
        var col = ev.color || '#4a5568';
        var typeIcons = { war: '⚔️', disaster: '🌋', religion: '🛕', trade: '💰', default: '📌' };
        var icon = typeIcons[ev.type] || typeIcons.default;
        html += '<div class="puos-row">';
        html += '<div style="display:flex;align-items:center;gap:10px;flex:1">';
        html += '<span style="font-size:12px;min-width:20px">' + icon + '</span>';
        html += '<div>';
        html += '<div style="font-size:12px;color:#cbd5e1">' + (ev.title || ev.content || '(sự kiện)') + '</div>';
        html += '<div style="font-size:10px;color:#334155">Năm ' + (ev.year || '?') + '</div>';
        html += '</div></div>';
        html += '</div>';
      });
    }
    html += '</div>';
    return html;
  }

  function _civCard(icon, label, val, color) {
    return '<div class="puos-card" style="border-top:2px solid ' + color + '">' +
      '<div style="font-size:20px;margin-bottom:6px">' + icon + '</div>' +
      '<div style="font-size:18px;font-weight:bold;color:' + color + '">' + val + '</div>' +
      '<div style="font-size:11px;color:#4a5568;margin-top:4px">' + label + '</div>' +
    '</div>';
  }

  function _openBtn(label, onclick, color) {
    return '<button onclick="' + onclick + '" style="padding:8px 14px;background:' + color + '14;border:1px solid ' + color + '33;border-radius:6px;color:' + color + ';cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">' + label + '</button>';
  }

  console.log('[PUOS Civilization V90] 🏛 Civilization panel sẵn sàng.');
})();
