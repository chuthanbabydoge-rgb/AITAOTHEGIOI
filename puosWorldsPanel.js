(function() {
  "use strict";

  var activeTab = 'overview';

  var TABS = [
    { id: 'overview',   label: '🌍 Tổng Quan' },
    { id: 'creation',   label: '✨ Tạo Thế Giới' },
    { id: 'genesis',    label: '🤖 AI Genesis' },
    { id: 'timeline',   label: '📜 Timeline' },
    { id: 'snapshots',  label: '💾 Snapshots' }
  ];

  function tabBar() {
    return '<div class="puos-tab-bar">' +
      TABS.map(function(t) {
        return '<button class="puos-tab' + (t.id === activeTab ? ' active' : '') + '" ' +
          'onclick="puosWorldsTab(\'' + t.id + '\')">' + t.label + '</button>';
      }).join('') +
    '</div>';
  }

  window.puosWorldsTab = function(tabId) {
    activeTab = tabId;
    var main = document.getElementById('puos-main');
    if (main) puosRenderWorlds(main);
  };

  window.puosRenderWorlds = function(container) {
    var html = '<div class="puos-fade">';
    html += '<div style="padding:24px 32px 0">';
    html += '<div style="font-size:10px;color:#7c3aed;letter-spacing:3px;margin-bottom:6px">WORLDS</div>';
    html += '<h1 style="font-size:22px;color:#e2e8f0;margin:0 0 20px;font-weight:400">🌍 Worlds</h1>';
    html += '</div>';
    html += tabBar();
    html += '<div style="padding:28px 32px" id="puos-worlds-content">';

    switch (activeTab) {
      case 'overview':   html += renderOverview(); break;
      case 'creation':   html += renderCreation(); break;
      case 'genesis':    html += renderGenesis(); break;
      case 'timeline':   html += renderTimeline(); break;
      case 'snapshots':  html += renderSnapshots(); break;
    }

    html += '</div></div>';
    container.innerHTML = html;
  };

  function renderOverview() {
    var ctrs = window.countries || [];
    var yr = window.year || 1;
    var warsActive = window.warsActive || [];

    var alive = ctrs.filter(function(c) { return c && c.population > 0; });
    var totalPop = alive.reduce(function(s, c) { return s + (c.population || 0); }, 0);

    var html = '<div style="margin-bottom:20px">';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">';
    html += _wCard('🌍', 'Quốc Gia/Thế Lực', ctrs.length, '#3b82f6');
    html += _wCard('📅', 'Năm Hiện Tại', yr.toLocaleString(), '#7c3aed');
    html += _wCard('⚔️', 'Xung Đột', warsActive.length + ' đang diễn ra', warsActive.length > 0 ? '#ef4444' : '#10b981');
    html += '</div>';

    if (ctrs.length === 0) {
      html += '<div class="puos-card" style="text-align:center;padding:48px">';
      html += '<div style="font-size:48px;margin-bottom:16px">🌌</div>';
      html += '<div style="font-size:18px;color:#4a5568;margin-bottom:8px">Chưa có thế giới nào</div>';
      html += '<div style="font-size:13px;color:#334155;margin-bottom:24px">Hãy tạo thế giới đầu tiên để bắt đầu hành trình</div>';
      html += '<button onclick="puosWorldsTab(\'creation\')" style="padding:12px 28px;background:#7c3aed;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-family:\'Noto Serif SC\',serif">✨ Tạo Thế Giới Mới</button>';
      html += '</div>';
    } else {
      html += '<div class="puos-card">';
      html += '<div class="puos-card-title">Danh Sách Thế Lực</div>';
      var top = alive.slice(0, 15);
      top.forEach(function(c) {
        var pop = (c.population || 0).toLocaleString();
        var rel = c.religion || '—';
        html += '<div class="puos-row">';
        html += '<span style="font-size:13px;color:#cbd5e1">' + (c.name || '?') + '</span>';
        html += '<span style="font-size:11px;color:#4a5568">' + pop + ' dân · ' + rel + '</span>';
        html += '</div>';
      });
      if (alive.length > 15) {
        html += '<div style="font-size:11px;color:#334155;text-align:center;padding:10px">... và ' + (alive.length - 15) + ' thế lực khác</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderCreation() {
    var html = '<div class="puos-card" style="max-width:680px">';
    html += '<div class="puos-card-title">Tạo Thế Giới Mới</div>';
    html += '<p style="font-size:13px;color:#64748b;margin:0 0 20px">Khởi động trình tạo thế giới 5 bước với World DNA, Origin Story và Cinematic intro.</p>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">';
    html += _launchCard('✨', 'World Wizard', 'Trình thuật sĩ 5 bước', "puosOpenClassicPanel('panel-creator-hub-v32',function(){if(window.wcw62ShowWizard)wcw62ShowWizard();})", '#7c3aed');
    html += _launchCard('🧬', 'World DNA', 'Cấu hình gen thế giới', "puosOpenClassicPanel('panel-creator-hub-v32')", '#3b82f6');
    html += _launchCard('📖', 'Origin Story', 'Viết nguồn gốc thế giới', "puosOpenClassicPanel('panel-creator-hub-v32')", '#10b981');
    html += _launchCard('🎬', 'Cinematic Intro', 'Xem màn hình khai sinh', "if(typeof wce63ShowCinematic==='function')wce63ShowCinematic();else alert('Chưa tạo thế giới')", '#f59e0b');
    html += '</div>';

    html += '<div style="border-top:1px solid #1e293b;padding-top:16px">';
    html += '<div style="font-size:11px;color:#334155;margin-bottom:10px">THÊM TỪ TEMPLATE</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    var templates = ['⚔️ Fantasy', '🚀 Sci-Fi', '🌿 Survival', '🔮 Magic', '🌊 Ocean', '🌋 Chaos'];
    templates.forEach(function(t) {
      html += '<button style="padding:6px 12px;background:#0d1b2e;border:1px solid #1e293b;border-radius:6px;color:#64748b;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">' + t + '</button>';
    });
    html += '</div></div></div>';
    return html;
  }

  function renderGenesis() {
    var html = '<div class="puos-card" style="max-width:680px">';
    html += '<div class="puos-card-title">AI Genesis — Tạo Thế Giới Bằng AI</div>';
    html += '<p style="font-size:13px;color:#64748b;margin:0 0 20px">Nhập mô tả bằng ngôn ngữ tự nhiên, Claude AI sẽ tạo ra một thế giới hoàn chỉnh.</p>';

    html += '<div style="margin-bottom:16px">';
    html += '<textarea id="puos-genesis-prompt" placeholder="Ví dụ: Một thế giới fantasy với 3 đế quốc đang tranh chiến, phép thuật nguyên tố, và một lời tiên tri cổ đại..." style="width:100%;height:100px;background:#0a111d;border:1px solid #1e293b;border-radius:8px;color:#e2e8f0;padding:12px;font-size:13px;font-family:\'Noto Serif SC\',serif;resize:vertical;box-sizing:border-box"></textarea>';
    html += '</div>';

    html += '<div style="display:flex;gap:10px;margin-bottom:20px">';
    html += '<button onclick="puosGenesisGenerate()" style="flex:1;padding:12px;background:#7c3aed;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-family:\'Noto Serif SC\',serif">🤖 Tạo Thế Giới với AI</button>';
    html += '<button onclick="puosOpenClassicPanel(\'panel-creator-hub-v32\')" style="padding:12px 16px;background:transparent;border:1px solid #1e293b;border-radius:8px;color:#64748b;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif">Mở Đầy Đủ</button>';
    html += '</div>';

    html += '<div id="puos-genesis-result"></div>';

    html += '<div style="border-top:1px solid #1e293b;padding-top:16px">';
    html += '<div style="font-size:11px;color:#334155;margin-bottom:10px">THỂ LOẠI GỢI Ý</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    var genres = ['⚔️ Sử Thi Chiến Tranh', '🌿 Hòa Bình Thiên Nhiên', '🔮 Huyền Bí', '🌋 Hỗn Mang', '🚀 Viễn Tưởng', '☁️ Thần Thoại'];
    genres.forEach(function(g) {
      var prompt = g.replace(/['"]/g, '');
      html += '<button onclick="document.getElementById(\'puos-genesis-prompt\').value=\'' + prompt + ' — hãy tạo thế giới dựa theo thể loại này\'" style="padding:6px 12px;background:#0d1b2e;border:1px solid #1e293b;border-radius:6px;color:#64748b;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif">' + g + '</button>';
    });
    html += '</div></div></div>';
    return html;
  }

  window.puosGenesisGenerate = function() {
    var prompt = (document.getElementById('puos-genesis-prompt') || {}).value || '';
    if (!prompt.trim()) { alert('Vui lòng nhập mô tả thế giới!'); return; }
    var result = document.getElementById('puos-genesis-result');
    if (result) {
      result.innerHTML = '<div style="padding:16px;background:#0a1020;border-radius:8px;color:#7c3aed;font-size:13px;text-align:center">🤖 Đang chuyển sang AI Genesis với prompt của bạn...</div>';
    }
    setTimeout(function() {
      if (typeof window.aiGenesisData !== 'undefined' && typeof window.aiGenesisData.pendingPrompt !== 'undefined') {
        window.aiGenesisData.pendingPrompt = prompt;
      }
      puosOpenClassicPanel('panel-creator-hub-v32');
    }, 1000);
  };

  function renderTimeline() {
    var html = '<div class="puos-card">';
    html += '<div class="puos-card-title">Timeline & Lịch Sử</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">';
    html += _launchCard('📜', 'Lịch Sử Thế Giới', 'Biên niên sử tự động', "puosOpenClassicPanel('world-history')", '#7c3aed');
    html += _launchCard('🌿', 'Timeline Nhánh', 'Tạo & so sánh dòng thời gian', "puosOpenClassicPanel('panel-timeline-v36')", '#3b82f6');
    html += _launchCard('🎬', 'Tái Hiện Lịch Sử', 'Replay các sự kiện lớn', "puosOpenClassicPanel('panel-creator-hub-v32')", '#10b981');
    html += _launchCard('📊', 'Analytics', 'Thống kê & xu hướng', "puosOpenClassicPanel('panel-creator-hub-v32')", '#f59e0b');
    html += '</div>';

    var yr = window.year || 1;
    html += '<div style="border-top:1px solid #1e293b;padding-top:16px">';
    html += '<div class="puos-card-title">Mốc Thời Gian</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    var milestones = [
      { y: 1, label: 'Khởi Thủy — Thế Giới Ra Đời' },
      { y: Math.floor(yr * 0.25), label: 'Văn Minh Đầu Tiên Xuất Hiện' },
      { y: Math.floor(yr * 0.5),  label: 'Kỷ Nguyên Chiến Tranh' },
      { y: Math.floor(yr * 0.75), label: 'Thời Đại Phát Triển' },
      { y: yr, label: '★ Hiện Tại' }
    ];
    milestones.forEach(function(m) {
      var pct = yr > 0 ? Math.round((m.y / yr) * 100) : 0;
      html += '<div style="display:flex;align-items:center;gap:12px">';
      html += '<span style="font-size:10px;color:#334155;min-width:50px">Năm ' + m.y + '</span>';
      html += '<div style="flex:1;height:4px;background:#0d1117;border-radius:2px"><div style="width:' + pct + '%;height:100%;background:#7c3aed;border-radius:2px"></div></div>';
      html += '<span style="font-size:11px;color:#4a5568;min-width:180px">' + m.label + '</span>';
      html += '</div>';
    });
    html += '</div></div></div>';
    return html;
  }

  function renderSnapshots() {
    var snaps = [];
    try {
      var idx = JSON.parse(localStorage.getItem('cgv6_backup_engine_v87_index') || '[]');
      snaps = Array.isArray(idx) ? idx : [];
    } catch(e) {}

    var html = '<div class="puos-card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
    html += '<div class="puos-card-title" style="margin:0">Snapshots & Backup</div>';
    html += '<button onclick="if(typeof be87ForceBackupNow===\'function\'){be87ForceBackupNow();alert(\'Đã tạo snapshot!\');}else alert(\'Backup engine chưa sẵn sàng\')" style="padding:8px 14px;background:#7c3aed22;border:1px solid #7c3aed44;border-radius:6px;color:#a78bfa;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif">💾 Backup Ngay</button>';
    html += '</div>';

    if (snaps.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:#334155;font-size:13px">Chưa có snapshot nào.<br><span style="font-size:11px">Auto backup sẽ chạy mỗi 500 ticks.</span></div>';
    } else {
      html += '<div style="display:flex;flex-direction:column;gap:6px">';
      snaps.slice(-10).reverse().forEach(function(snap) {
        var date = snap.timestamp ? new Date(snap.timestamp).toLocaleString() : '—';
        html += '<div class="puos-row">';
        html += '<div style="display:flex;flex-direction:column;gap:2px">';
        html += '<span style="font-size:12px;color:#cbd5e1">' + (snap.label || 'Snapshot') + '</span>';
        html += '<span style="font-size:10px;color:#334155">' + date + ' · ' + (snap.size || '?') + '</span>';
        html += '</div>';
        html += '<button onclick="if(confirm(\'Restore snapshot này?\')){be87RestoreSnapshot&&be87RestoreSnapshot(\'' + snap.id + '\')}" style="padding:5px 10px;background:transparent;border:1px solid #1e293b;border-radius:5px;color:#4a5568;cursor:pointer;font-size:11px">Restore</button>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _wCard(icon, label, val, color) {
    return '<div class="puos-card" style="border-top:2px solid ' + color + '">' +
      '<div style="font-size:20px;margin-bottom:6px">' + icon + '</div>' +
      '<div style="font-size:18px;font-weight:bold;color:' + color + '">' + val + '</div>' +
      '<div style="font-size:11px;color:#4a5568;margin-top:4px">' + label + '</div>' +
    '</div>';
  }

  function _launchCard(icon, title, desc, onclick, color) {
    return '<div class="puos-card" style="cursor:pointer;transition:border 0.15s;border-color:' + color + '33" ' +
      'onclick="' + onclick + '" onmouseover="this.style.borderColor=\'' + color + '88\'" onmouseout="this.style.borderColor=\'' + color + '33\'">' +
      '<div style="font-size:22px;margin-bottom:8px">' + icon + '</div>' +
      '<div style="font-size:13px;color:#cbd5e1;margin-bottom:4px">' + title + '</div>' +
      '<div style="font-size:11px;color:#4a5568">' + desc + '</div>' +
    '</div>';
  }

  console.log('[PUOS Worlds V90] 🌍 Worlds panel sẵn sàng.');
})();
