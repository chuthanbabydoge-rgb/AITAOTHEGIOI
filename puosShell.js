(function() {
  "use strict";

  var PUOS_CURRENT = 'my-universe';
  var PUOS_CLASSIC = false;

  var PUOS_NAV = [
    { id: 'my-universe',  icon: '🪐', label: 'My Universe' },
    { id: 'worlds',       icon: '🌍', label: 'Worlds' },
    { id: 'civilization', icon: '🏛',  label: 'Civilization' },
    { id: 'universe-hub', icon: '🌌', label: 'Universe Hub' },
    { id: 'jarvis',       icon: '🤖', label: 'Jarvis' },
    { id: 'settings',     icon: '⚙',  label: 'Settings' }
  ];

  function injectStyle() {
    if (document.getElementById('puos-style')) return;
    var s = document.createElement('style');
    s.id = 'puos-style';
    s.textContent = [
      /* CSS class trên body ẩn toàn bộ body children trừ puos-shell — beats JS element.style.display */
      'body.puos-mode > *:not(#puos-shell) { display:none!important; visibility:hidden!important; }',
      'body.puos-mode { background:#050a14!important; overflow:hidden!important; }',
      '#puos-shell { position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;display:flex!important;background:#050a14!important;font-family:\'Noto Serif SC\',serif;color:#e2e8f0;box-sizing:border-box; }',
      '#puos-sidebar { width:200px!important;min-width:200px!important;background:#070e19!important;border-right:1px solid #1e293b!important;display:flex!important;flex-direction:column!important;flex-shrink:0!important;height:100vh!important;overflow:hidden!important;box-sizing:border-box!important; }',
      '#puos-main { flex:1!important;overflow:auto!important;background:#050a14!important;height:100vh!important;box-sizing:border-box!important; }',
      '.puos-nav-btn { width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border:none;border-radius:8px;background:transparent;color:#4a5568;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif;text-align:left;transition:all 0.15s;margin-bottom:2px;border-left:2px solid transparent; }',
      '.puos-nav-btn:hover { background:#0d1b2e;color:#94a3b8; }',
      '.puos-nav-btn.active { background:#7c3aed18;color:#a78bfa;border-left-color:#7c3aed; }',
      '.puos-card { background:#0d1117;border:1px solid #1e293b;border-radius:12px;padding:20px; }',
      '.puos-card-title { font-size:10px;color:#7c3aed;letter-spacing:2px;margin-bottom:14px;text-transform:uppercase; }',
      '.puos-stat { display:flex;flex-direction:column;gap:4px; }',
      '.puos-stat-val { font-size:22px;font-weight:bold; }',
      '.puos-stat-lbl { font-size:11px;color:#4a5568; }',
      '.puos-row { display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #0a1020; }',
      '.puos-row:last-child { border-bottom:none; }',
      '.puos-row-lbl { font-size:12px;color:#4a5568; }',
      '.puos-row-val { font-size:11px;color:#94a3b8; }',
      '.puos-row-val.ok { color:#10b981; }',
      '.puos-action { display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-family:\'Noto Serif SC\',serif;transition:all 0.15s;border:1px solid; }',
      '.puos-tab-bar { display:flex;gap:0;border-bottom:1px solid #1e293b;padding:0 24px;background:#07111e; }',
      '.puos-tab { padding:12px 18px;border:none;background:transparent;color:#4a5568;cursor:pointer;font-size:12px;font-family:\'Noto Serif SC\',serif;border-bottom:2px solid transparent;transition:all 0.15s; }',
      '.puos-tab:hover { color:#94a3b8; }',
      '.puos-tab.active { color:#a78bfa;border-bottom-color:#7c3aed; }',
      '.puos-badge { padding:2px 8px;border-radius:99px;font-size:10px;background:#7c3aed22;color:#a78bfa; }',
      '@keyframes puos-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }',
      '.puos-fade { animation:puos-fade 0.2s ease; }'
    ].join('\n');
    document.head.appendChild(s);
  }

  function buildSidebar() {
    var yr = window.year || 1;
    var npcs = window.npcs || [];
    var countries = window.countries || [];

    var html = '';
    html += '<div style="padding:18px 14px 12px;border-bottom:1px solid #1e293b;text-align:center">';
    html += '<div style="font-size:20px;margin-bottom:4px">⭕</div>';
    html += '<div style="font-size:10px;font-weight:bold;color:#7c3aed;letter-spacing:3px">PUOS</div>';
    html += '<div style="font-size:9px;color:#1e293b;margin-top:2px">Personal Universe OS</div>';
    html += '</div>';

    html += '<div style="padding:10px 8px;flex:1">';
    PUOS_NAV.forEach(function(n) {
      html += '<button class="puos-nav-btn' + (n.id === PUOS_CURRENT ? ' active' : '') + '" ';
      html += 'id="puos-nav-' + n.id + '" ';
      html += 'onclick="puosGo(\'' + n.id + '\')">';
      html += '<span style="font-size:15px">' + n.icon + '</span>';
      html += '<span>' + n.label + '</span>';
      html += '</button>';
    });
    html += '</div>';

    html += '<div style="padding:10px 8px;border-top:1px solid #1e293b">';
    html += '<div style="font-size:9px;color:#1e293b;text-align:center;margin-bottom:6px">Năm ' + yr.toLocaleString() + ' · ' + npcs.length + ' sinh linh</div>';
    html += '<button onclick="puosClassicToggle()" style="width:100%;padding:7px;border:1px solid #1e293b;border-radius:6px;background:transparent;color:#334155;cursor:pointer;font-size:10px;font-family:\'Noto Serif SC\',serif;transition:all 0.15s" onmouseover="this.style.color=\'#64748b\'" onmouseout="this.style.color=\'#334155\'">';
    html += '⊞ Classic Mode</button>';
    html += '</div>';

    return html;
  }

  function createShell() {
    if (document.getElementById('puos-shell')) return;

    var shell = document.createElement('div');
    shell.id = 'puos-shell';
    shell.style.position = 'fixed';
    shell.style.top = '0';
    shell.style.left = '0';
    shell.style.width = '100vw';
    shell.style.height = '100vh';
    shell.style.zIndex = '9999999';
    shell.style.display = 'flex';
    shell.style.background = '#050a14';
    shell.style.fontFamily = "'Noto Serif SC', serif";
    shell.style.color = '#e2e8f0';
    shell.style.boxSizing = 'border-box';

    var sidebar = document.createElement('div');
    sidebar.id = 'puos-sidebar';
    sidebar.style.width = '200px';
    sidebar.style.minWidth = '200px';
    sidebar.style.background = '#070e19';
    sidebar.style.borderRight = '1px solid #1e293b';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.flexShrink = '0';
    sidebar.style.height = '100vh';
    sidebar.style.overflow = 'hidden';
    sidebar.style.boxSizing = 'border-box';
    sidebar.innerHTML = buildSidebar();

    var main = document.createElement('div');
    main.id = 'puos-main';
    main.style.flex = '1';
    main.style.overflow = 'auto';
    main.style.background = '#050a14';
    main.style.height = '100vh';
    main.style.boxSizing = 'border-box';

    shell.appendChild(sidebar);
    shell.appendChild(main);
    document.body.appendChild(shell);
  }

  function refreshNav() {
    PUOS_NAV.forEach(function(n) {
      var btn = document.getElementById('puos-nav-' + n.id);
      if (!btn) return;
      btn.className = 'puos-nav-btn' + (n.id === PUOS_CURRENT ? ' active' : '');
    });
  }

  window.puosGo = function(sectionId) {
    PUOS_CURRENT = sectionId;
    refreshNav();
    var main = document.getElementById('puos-main');
    if (!main) return;
    main.innerHTML = '<div style="padding:40px;color:#1e293b;font-size:12px;text-align:center">Đang tải...</div>';

    switch (sectionId) {
      case 'my-universe':
        if (typeof puosRenderMyUniverse === 'function') puosRenderMyUniverse(main); break;
      case 'worlds':
        if (typeof puosRenderWorlds === 'function') puosRenderWorlds(main); break;
      case 'civilization':
        if (typeof puosRenderCivilization === 'function') puosRenderCivilization(main); break;
      case 'universe-hub':
        if (typeof puosRenderUniverseHub === 'function') puosRenderUniverseHub(main); break;
      case 'jarvis':
        if (typeof puosRenderJarvis === 'function') puosRenderJarvis(main); break;
      case 'settings':
        if (typeof puosRenderSettings === 'function') puosRenderSettings(main); break;
      default:
        main.innerHTML = '<div style="padding:60px;text-align:center;color:#334155">Sắp ra mắt...</div>';
    }
  };

  window.puosClassicToggle = function() {
    PUOS_CLASSIC = !PUOS_CLASSIC;
    var shell = document.getElementById('puos-shell');
    if (PUOS_CLASSIC) {
      exitPuosMode();
    } else {
      enterPuosMode();
      puosGo(PUOS_CURRENT);
    }
  };

  window.puosOpenClassicPanel = function(panelId, renderFn) {
    PUOS_CLASSIC = true;
    exitPuosMode();
    if (typeof window.showPanel === 'function') window.showPanel(panelId);
    if (typeof renderFn === 'function') setTimeout(renderFn, 100);
  };

  function enterPuosMode() {
    document.body.classList.add('puos-mode');
  }

  function exitPuosMode() {
    document.body.classList.remove('puos-mode');
  }

  function init() {
    injectStyle();
    createShell();
    enterPuosMode();
    setTimeout(function() { puosGo('my-universe'); }, 300);
    console.log('[PUOS Shell V90] 🪐 Personal Universe OS khởi động — 6 sections · Classic Mode available.');
  }

  function refreshSidebarFooter() {
    var footer = document.querySelector('#puos-sidebar > div:last-child > div:first-child');
    if (footer) {
      var yr = window.year || 1;
      var npcs = window.npcs || [];
      footer.textContent = 'Năm ' + yr.toLocaleString() + ' · ' + npcs.length + ' sinh linh';
    }
  }

  var _origPuosGo = window.puosGo;
  window.puosGo = function(sectionId) {
    refreshSidebarFooter();
    if (_origPuosGo) _origPuosGo(sectionId);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 13000); });
  } else {
    setTimeout(init, 13000);
  }
})();
