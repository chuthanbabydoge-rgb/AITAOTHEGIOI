(function() {
  "use strict";

  var _tab = 'overview';
  var _timer = null;

  // ── STYLES ───────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cev95-style')) return;
    var s = document.createElement('style');
    s.id = 'cev95-style';
    s.textContent = [
      '@keyframes cev95-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes cev95-pulse{0%,100%{opacity:.5}50%{opacity:1}}',
      '.cev95-tab{flex:1;padding:8px 2px;border:none;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;transition:all .15s;background:transparent;color:#374151;}',
      '.cev95-tab.active{background:rgba(245,158,11,.18)!important;color:#f59e0b!important;}',
      '.cev95-tab:hover{background:rgba(255,255,255,.04)!important;color:#94a3b8!important;}',
      '.cev95-civ-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:11px 13px;margin-bottom:8px;animation:cev95-in .3s ease both;}',
      '.cev95-civ-card:hover{border-color:rgba(255,255,255,.10);}',
      '.cev95-prog-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:5px;}',
      '.cev95-prog-fill{height:100%;border-radius:2px;transition:width .4s ease;}',
      '.cev95-tech-row{display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
      '.cev95-tech-row:last-child{border-bottom:none;}',
      '.cev95-ev-row{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
      '.cev95-ev-row:last-child{border-bottom:none;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function fmt(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return String(Math.round(n || 0));
  }

  // ── TECH PROGRESS ────────────────────────────────────────────────────────
  function getTechProgress(civ) {
    var stages = typeof window.cecV95GetTechStages === 'function' ? window.cecV95GetTechStages() : [];
    var idx = civ.techStage || 0;
    var cur = stages[idx] || { threshold: 0 };
    var next = stages[idx + 1];
    if (!next) return 100;
    var range = next.threshold - cur.threshold;
    var done = (civ.techPoints || 0) - cur.threshold;
    return Math.max(0, Math.min(100, Math.round(done / range * 100)));
  }

  // ── TAB: OVERVIEW ─────────────────────────────────────────────────────────
  function renderOverview() {
    var civs = typeof window.cecV95GetTop === 'function' ? window.cecV95GetTop(6) : [];
    if (!civs.length) {
      return '<div style="color:#374151;text-align:center;padding:24px;font-size:12px;font-style:italic;">Chưa có văn minh nào xuất hiện — dân số cần đạt 50+ sinh linh...</div>';
    }
    var html = '';
    civs.forEach(function(civ, idx) {
      var techLabel = typeof window.cecV95GetTechLabel === 'function' ? window.cecV95GetTechLabel(civ.techStage || 0) : { label: 'Nguyên Thủy', icon: '🪨' };
      var techPct = getTechProgress(civ);
      var cityCount = (civ.cities || []).length;
      html += '<div class="cev95-civ-card" style="animation-delay:' + (idx * 0.04) + 's;border-left:3px solid ' + civ.color + ';">';

      // Header row
      html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
      html += '<div style="display:flex;align-items:center;gap:7px;flex:1;min-width:0;">';
      html += '<span style="font-size:18px;">' + civ.stageIcon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + civ.name + '</div>';
      html += '<div style="font-size:10px;color:#4b5563;margin-top:1px;">' + civ.speciesIcon + ' ' + civ.speciesName + ' · Năm ' + civ.foundedYear + '</div>';
      html += '</div></div>';
      html += '<div style="text-align:right;flex-shrink:0;">';
      html += '<div style="font-size:13px;font-weight:700;color:' + civ.color + ';">' + fmt(civ.population) + '</div>';
      html += '<div style="font-size:10px;color:#374151;">' + civ.stageLabel + '</div>';
      html += '</div></div>';

      // Stats row
      html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px;">';
      var stats = [
        { l: '🏙️ Thành Phố', v: cityCount },
        { l: '🗺️ Lãnh Thổ', v: civ.territory },
        { l: '📚 Tri Thức', v: (civ.knowledge || 0) + '%' },
        { l: '⚖️ Ổn Định', v: (civ.stability || 0) + '%' }
      ];
      stats.forEach(function(st) {
        html += '<div style="background:rgba(255,255,255,.02);border-radius:6px;padding:4px 6px;text-align:center;">';
        html += '<div style="font-size:9px;color:#374151;">' + st.l + '</div>';
        html += '<div style="font-size:12px;font-weight:600;color:#94a3b8;">' + st.v + '</div>';
        html += '</div>';
      });
      html += '</div>';

      // Tech progress bar
      html += '<div style="margin-top:8px;display:flex;align-items:center;gap:6px;">';
      html += '<span style="font-size:12px;">' + techLabel.icon + '</span>';
      html += '<div style="flex:1;">';
      html += '<div style="font-size:10px;color:#374151;margin-bottom:3px;">' + techLabel.label + ' · ' + techPct + '%</div>';
      html += '<div class="cev95-prog-bar"><div class="cev95-prog-fill" style="width:' + techPct + '%;background:' + civ.color + ';"></div></div>';
      html += '</div></div>';

      html += '</div>';
    });
    return html;
  }

  // ── TAB: RANKING ─────────────────────────────────────────────────────────
  function renderRanking() {
    var civs = typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll() : [];
    if (!civs.length) return '<div style="color:#374151;text-align:center;padding:24px;font-size:12px;font-style:italic;">Chưa có văn minh nào...</div>';

    var sorted = civs.slice().sort(function(a, b) { return (b.stageOrder * 10000 + b.population) - (a.stageOrder * 10000 + a.population); });
    var html = '';
    sorted.forEach(function(civ, i) {
      var medals = ['🥇', '🥈', '🥉'];
      var medal = medals[i] || '  ' + (i + 1) + '.';
      var techLabel = typeof window.cecV95GetTechLabel === 'function' ? window.cecV95GetTechLabel(civ.techStage || 0) : { label: '?', icon: '?' };
      html += '<div style="display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
      html += '<span style="font-size:16px;flex-shrink:0;">' + medal + '</span>';
      html += '<span style="font-size:18px;">' + civ.stageIcon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:600;color:#e2e8f0;">' + civ.name + '</div>';
      html += '<div style="font-size:10px;color:#374151;">' + civ.speciesIcon + ' ' + civ.stageLabel + ' · ' + techLabel.icon + ' ' + techLabel.label + '</div>';
      html += '</div>';
      html += '<div style="text-align:right;flex-shrink:0;">';
      html += '<div style="font-size:12px;font-weight:700;color:' + civ.color + ';">' + fmt(civ.population) + '</div>';
      html += '<div style="font-size:10px;color:#374151;">🏙️ ' + (civ.cities || []).length + ' · 🗺️ ' + (civ.territory || 1) + '</div>';
      html += '</div></div>';
    });
    return html;
  }

  // ── TAB: TECHNOLOGY ──────────────────────────────────────────────────────
  function renderTechnology() {
    var civs = typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll() : [];
    var stages = typeof window.cecV95GetTechStages === 'function' ? window.cecV95GetTechStages() : [];
    if (!civs.length) return '<div style="color:#374151;text-align:center;padding:24px;font-size:12px;font-style:italic;">Chưa có văn minh nào...</div>';

    var html = '';
    // Tech timeline header
    html += '<div style="display:flex;gap:4px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;">';
    stages.forEach(function(ts, i) {
      var activeCivs = civs.filter(function(c) { return (c.techStage || 0) >= i; });
      var isActive = activeCivs.length > 0;
      html += '<div style="flex:1;min-width:44px;text-align:center;padding:5px 3px;border-radius:6px;background:' + (isActive ? 'rgba(245,158,11,.15)' : 'rgba(255,255,255,.02)') + ';border:1px solid ' + (isActive ? 'rgba(245,158,11,.3)' : 'rgba(255,255,255,.05)') + ';">';
      html += '<div style="font-size:14px;">' + ts.icon + '</div>';
      html += '<div style="font-size:8px;color:' + (isActive ? '#f59e0b' : '#374151') + ';margin-top:2px;">' + ts.label + '</div>';
      if (isActive) html += '<div style="font-size:9px;color:#22c55e;">' + activeCivs.length + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Per-civ tech rows
    civs.forEach(function(civ) {
      var techLabel = stages[civ.techStage || 0] || stages[0];
      var pct = getTechProgress(civ);
      html += '<div class="cev95-tech-row">';
      html += '<span style="font-size:16px;">' + civ.stageIcon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:11px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + civ.name + '</div>';
      html += '<div style="display:flex;align-items:center;gap:5px;margin-top:4px;">';
      html += '<span style="font-size:11px;">' + techLabel.icon + '</span>';
      html += '<div style="flex:1;"><div class="cev95-prog-bar"><div class="cev95-prog-fill" style="width:' + pct + '%;background:' + civ.color + ';"></div></div></div>';
      html += '<span style="font-size:10px;color:#374151;">' + pct + '%</span>';
      html += '</div></div></div>';
    });
    return html;
  }

  // ── TAB: CIV EVENTS ─────────────────────────────────────────────────────
  function renderEvents() {
    var events = typeof window.cevV95GetEvents === 'function' ? window.cevV95GetEvents(12) : [];
    if (!events.length) return '<div style="color:#374151;text-align:center;padding:24px;font-size:12px;font-style:italic;">Chưa có sự kiện văn minh nào...</div>';
    var html = '';
    events.forEach(function(ev) {
      html += '<div class="cev95-ev-row">';
      html += '<span style="font-size:16px;flex-shrink:0;">' + ev.icon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:600;color:' + ev.color + ';">' + ev.title + '</div>';
      html += '<div style="font-size:11px;color:#4b5563;margin-top:2px;line-height:1.4;">' + ev.desc + '</div>';
      html += '<div style="font-size:10px;color:#374151;margin-top:3px;">📅 Năm ' + ev.year + ' · ' + ev.label + '</div>';
      html += '</div></div>';
    });
    return html;
  }

  function renderContent() {
    var el = document.getElementById('cev95-content');
    if (!el) return;
    if (_tab === 'overview')  el.innerHTML = renderOverview();
    else if (_tab === 'rank') el.innerHTML = renderRanking();
    else if (_tab === 'tech') el.innerHTML = renderTechnology();
    else if (_tab === 'events') el.innerHTML = renderEvents();
  }

  window.cev95SwitchTab = function(tab) {
    _tab = tab;
    ['overview', 'rank', 'tech', 'events'].forEach(function(t) {
      var btn = document.getElementById('cev95-tab-' + t);
      if (!btn) return;
      if (t === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderContent();
  };

  // ── BUILD SECTION ────────────────────────────────────────────────────────
  function buildSection(container) {
    var sect = document.createElement('div');
    sect.id = 'cev95-section';
    sect.style.cssText = 'margin:0 20px 20px;';

    var civCount = typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll().length : 0;
    var topCiv = (typeof window.cecV95GetTop === 'function' ? window.cecV95GetTop(1) : [])[0];

    sect.innerHTML = [
      '<div style="background:linear-gradient(135deg,rgba(15,10,5,.97),rgba(25,18,5,.97));border:1px solid rgba(245,158,11,.15);border-radius:14px;overflow:hidden;">',

      // Header
      '<div style="padding:13px 16px;border-bottom:1px solid rgba(245,158,11,.1);display:flex;align-items:center;justify-content:space-between;">',
      '<div style="display:flex;align-items:center;gap:8px;">',
      '<div style="width:7px;height:7px;border-radius:50%;background:#f59e0b;box-shadow:0 0 6px #f59e0b;animation:cev95-pulse 2.5s ease-in-out infinite;"></div>',
      '<span style="font-size:12px;font-weight:700;color:#f59e0b;letter-spacing:1px;">VĂN MINH ĐANG HÌNH THÀNH</span>',
      '</div>',
      '<div style="display:flex;gap:10px;">',
      '<span style="font-size:11px;color:#374151;" id="cev95-civ-count">' + civCount + ' văn minh</span>',
      topCiv ? '<span style="font-size:11px;color:#f59e0b;font-weight:600;">' + topCiv.stageIcon + ' ' + topCiv.name + '</span>' : '',
      '</div></div>',

      // Tabs
      '<div style="display:flex;border-bottom:1px solid rgba(255,255,255,.05);">',
      '<button class="cev95-tab active" id="cev95-tab-overview" onclick="cev95SwitchTab(\'overview\')" style="color:#f59e0b;background:rgba(245,158,11,.12);">🏛️ Tổng Quan</button>',
      '<button class="cev95-tab" id="cev95-tab-rank" onclick="cev95SwitchTab(\'rank\')">👑 Xếp Hạng</button>',
      '<button class="cev95-tab" id="cev95-tab-tech" onclick="cev95SwitchTab(\'tech\')">🚀 Công Nghệ</button>',
      '<button class="cev95-tab" id="cev95-tab-events" onclick="cev95SwitchTab(\'events\')">🗺️ Sự Kiện</button>',
      '</div>',

      // Content
      '<div id="cev95-content" style="padding:14px;max-height:320px;overflow-y:auto;"></div>',

      '</div>'
    ].join('');

    container.appendChild(sect);
    renderContent();
  }

  function updateHeader() {
    var cc = document.getElementById('cev95-civ-count');
    if (cc) cc.textContent = (typeof window.cecV95GetAll === 'function' ? window.cecV95GetAll().length : 0) + ' văn minh';
    if (_tab === 'overview' || _tab === 'rank') renderContent();
  }

  function tryInject() {
    if (document.getElementById('cev95-section')) return true;
    if (!window.world || !window.world.name) return false;
    var main = document.getElementById('puos-main');
    if (!main) return false;
    buildSection(main);
    return true;
  }

  function hookRender() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig(container);
      if (window.world && window.world.name) {
        setTimeout(function() {
          if (!document.getElementById('cev95-section') && container && container.parentNode) {
            buildSection(container);
          }
        }, 200);
      }
    };
  }

  function startUpdating() {
    if (_timer) clearInterval(_timer);
    _timer = setInterval(function() {
      updateHeader();
      if (!document.getElementById('cev95-section')) tryInject();
    }, 3500);
  }

  function init() {
    injectStyles();
    hookRender();
    startUpdating();
    setTimeout(tryInject, 1200);
    console.log("[CivRegistry V95] 🏛️ Civ Registry khởi động — 4 tabs (Tổng Quan/Xếp Hạng/Công Nghệ/Sự Kiện) · Inject vào PUOS My Universe sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25400); });
  } else {
    setTimeout(init, 25400);
  }
})();
