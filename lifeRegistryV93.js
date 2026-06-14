(function() {
  "use strict";

  var _currentTab = 'population';
  var _updateTimer = null;

  // ── STYLES ──────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('lsv93-style')) return;
    var s = document.createElement('style');
    s.id = 'lsv93-style';
    s.textContent = [
      '@keyframes lsv93-grow{from{width:0}to{width:var(--bar-w)}}',
      '@keyframes lsv93-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes lsv93-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}',
      '.lsv93-tab{flex:1;padding:8px 2px;border:none;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;transition:all .15s;background:transparent;color:#374151;}',
      '.lsv93-tab.active{background:rgba(34,197,94,.2)!important;color:#22c55e!important;}',
      '.lsv93-tab:hover{background:rgba(255,255,255,.04)!important;color:#94a3b8!important;}',
      '.lsv93-sp-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:12px;animation:lsv93-in .3s ease both;}',
      '.lsv93-sp-card:hover{border-color:rgba(255,255,255,.12);}',
      '.lsv93-bar-wrap{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin-top:6px;}',
      '.lsv93-bar{height:100%;border-radius:3px;animation:lsv93-grow .6s ease both;}',
      '.lsv93-status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;display:inline-block;}',
      '.lsv93-pop-num{font-size:26px;font-weight:700;animation:lsv93-beat 3s ease-in-out infinite;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  var STATUS_CONFIG = {
    thriving:   { label: 'Phát Triển', color: '#22c55e', dot: '#22c55e' },
    stable:     { label: 'Ổn Định',    color: '#60a5fa', dot: '#60a5fa' },
    declining:  { label: 'Suy Giảm',   color: '#f59e0b', dot: '#f59e0b' },
    endangered: { label: 'Nguy Hiểm',  color: '#ef4444', dot: '#ef4444' },
    extinct:    { label: 'Tuyệt Chủng',color: '#4b5563', dot: '#374151' }
  };

  // ── TAB: POPULATION ──────────────────────────────────────────────────────
  function renderPopulation() {
    var snap = typeof window.lev93GetSnapshot === 'function' ? window.lev93GetSnapshot() : {};
    var total = snap.globalPop || (typeof window.spv93GetTotal === 'function' ? window.spv93GetTotal() : 0);
    var growthRate = snap.growthRate || 0;
    var growthColor = growthRate >= 0 ? '#22c55e' : '#ef4444';
    var growthArrow = growthRate >= 0 ? '▲' : '▼';
    var history = snap.history || [];

    var html = '';

    // Global Population Hero Card
    html += '<div style="text-align:center;padding:16px 8px;margin-bottom:14px;">';
    html += '<div style="font-size:11px;color:#374151;letter-spacing:2px;margin-bottom:6px;">TỔNG DÂN SỐ</div>';
    html += '<div class="lsv93-pop-num" style="color:#22c55e;">' + fmtNum(total) + '</div>';
    html += '<div style="margin-top:4px;font-size:12px;">';
    html += '<span style="color:' + growthColor + ';">' + growthArrow + ' ' + Math.abs(growthRate) + '%</span>';
    html += '<span style="color:#374151;"> so với năm trước</span>';
    html += '</div>';
    html += '</div>';

    // Stats row
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">';
    var stats = [
      { label: 'SINH/NĂM', value: fmtNum(snap.totalBirths || 0), color: '#22c55e' },
      { label: 'TỬ/NĂM', value: fmtNum(snap.totalDeaths || 0), color: '#ef4444' },
      { label: 'ĐỈNH CAO', value: fmtNum(snap.peakPop || total), color: '#a78bfa' }
    ];
    stats.forEach(function(st) {
      html += '<div style="background:rgba(255,255,255,.02);border-radius:8px;padding:8px;text-align:center;">';
      html += '<div style="font-size:9px;color:#374151;letter-spacing:1px;margin-bottom:4px;">' + st.label + '</div>';
      html += '<div style="font-size:14px;font-weight:700;color:' + st.color + ';">' + st.value + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Population history mini chart
    if (history.length > 1) {
      var maxPop = Math.max.apply(null, history.map(function(h) { return h.total || 0; }));
      if (maxPop > 0) {
        html += '<div style="margin-bottom:4px;">';
        html += '<div style="font-size:10px;color:#374151;letter-spacing:1px;margin-bottom:6px;">LỊCH SỬ DÂN SỐ</div>';
        html += '<div style="display:flex;align-items:flex-end;gap:2px;height:40px;">';
        history.slice(-12).forEach(function(h, i) {
          var pct = Math.round((h.total / maxPop) * 100);
          var isLast = i === Math.min(history.length, 12) - 1;
          html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">';
          html += '<div style="width:100%;background:' + (isLast ? '#22c55e' : 'rgba(34,197,94,.3)') + ';border-radius:2px 2px 0 0;height:' + Math.max(3, Math.round(pct * 0.38)) + 'px;transition:height .3s;"></div>';
          html += '</div>';
        });
        html += '</div>';
        html += '<div style="display:flex;justify-content:space-between;margin-top:3px;">';
        if (history.length > 0) html += '<div style="font-size:9px;color:#374151;">Năm ' + history[0].year + '</div>';
        if (history.length > 1) html += '<div style="font-size:9px;color:#374151;">Năm ' + history[history.length - 1].year + '</div>';
        html += '</div>';
        html += '</div>';
      }
    }

    return html;
  }

  // ── TAB: SPECIES ─────────────────────────────────────────────────────────
  function renderSpecies() {
    var species = typeof window.spv93GetAll === 'function' ? window.spv93GetAll() : [];
    if (!species.length) {
      return '<div style="color:#374151;text-align:center;padding:20px;font-size:12px;font-style:italic;">Chưa có loài sinh vật — tạo thế giới để bắt đầu...</div>';
    }

    var totalPop = 0;
    species.forEach(function(sp) { totalPop += sp.population || 0; });
    if (!totalPop) totalPop = 1;

    var html = '';
    species.forEach(function(sp, idx) {
      var cfg = STATUS_CONFIG[sp.status] || STATUS_CONFIG.stable;
      var pct = Math.round((sp.population / totalPop) * 100);
      var history = sp.growthHistory || [];
      var trend = '';
      if (history.length >= 2) {
        var last2 = history.slice(-2);
        var diff = last2[1].pop - last2[0].pop;
        trend = diff > 0 ? ' <span style="color:#22c55e;font-size:10px;">▲' + fmtNum(diff) + '</span>' :
                diff < 0 ? ' <span style="color:#ef4444;font-size:10px;">▼' + fmtNum(Math.abs(diff)) + '</span>' :
                ' <span style="color:#374151;font-size:10px;">─</span>';
      }

      html += '<div class="lsv93-sp-card" style="margin-bottom:8px;animation-delay:' + (idx * 0.05) + 's;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';

      // Left: icon + name + status
      html += '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">';
      html += '<span style="font-size:20px;">' + sp.icon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:13px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sp.name + '</div>';
      html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;">';
      html += '<span class="lsv93-status-dot" style="background:' + cfg.dot + ';"></span>';
      html += '<span style="font-size:10px;color:' + cfg.color + ';">' + cfg.label + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';

      // Right: population
      html += '<div style="text-align:right;flex-shrink:0;">';
      html += '<div style="font-size:14px;font-weight:700;color:' + (sp.color || '#94a3b8') + ';">' + fmtNum(sp.population) + trend + '</div>';
      html += '<div style="font-size:10px;color:#374151;">' + pct + '% tổng dân số</div>';
      html += '</div>';

      html += '</div>';

      // Population bar
      html += '<div class="lsv93-bar-wrap">';
      html += '<div class="lsv93-bar" style="width:' + pct + '%;background:' + (sp.color || '#22c55e') + ';"></div>';
      html += '</div>';

      // Traits
      if (sp.traits && sp.traits.length) {
        html += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">';
        sp.traits.forEach(function(t) {
          html += '<span style="font-size:9px;padding:2px 6px;background:rgba(255,255,255,.04);border-radius:10px;color:#4b5563;">' + t + '</span>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    return html;
  }

  // ── TAB: LIFE EVENTS ─────────────────────────────────────────────────────
  function renderLifeEvents() {
    var events = typeof window.lev93GetLifeEvents === 'function' ? window.lev93GetLifeEvents(10) : [];
    if (!events.length) {
      return '<div style="color:#374151;text-align:center;padding:20px;font-size:12px;font-style:italic;">Chưa có sự kiện sinh học — thế giới cần thời gian phát triển...</div>';
    }
    var html = '';
    events.forEach(function(ev) {
      var modStr = ev.popMod > 0 ? '+' + Math.round(ev.popMod * 100) + '%' :
                   ev.popMod < 0 ? Math.round(ev.popMod * 100) + '%' : '';
      html += '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);">';
      html += '<span style="font-size:16px;flex-shrink:0;">' + ev.icon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:600;color:' + ev.color + ';">' + ev.title + '</div>';
      html += '<div style="font-size:11px;color:#4b5563;margin-top:2px;line-height:1.4;">' + ev.desc + '</div>';
      html += '<div style="font-size:10px;color:#374151;margin-top:3px;display:flex;gap:6px;">';
      html += '<span>📅 Năm ' + ev.year + '</span>';
      html += '<span>· ' + ev.label + '</span>';
      if (modStr) html += '<span style="color:' + ev.color + ';">' + modStr + ' dân số</span>';
      html += '</div>';
      html += '</div></div>';
    });
    return html;
  }

  // ── RENDER TABS ───────────────────────────────────────────────────────────
  function renderContent() {
    var el = document.getElementById('lsv93-content');
    if (!el) return;
    if (_currentTab === 'population') el.innerHTML = renderPopulation();
    else if (_currentTab === 'species') el.innerHTML = renderSpecies();
    else if (_currentTab === 'events') el.innerHTML = renderLifeEvents();
  }

  window.lsv93SwitchTab = function(tab) {
    _currentTab = tab;
    var tabs = ['population', 'species', 'events'];
    tabs.forEach(function(t) {
      var btn = document.getElementById('lsv93-tab-' + t);
      if (!btn) return;
      if (t === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderContent();
  };

  // ── BUILD SECTION ─────────────────────────────────────────────────────────
  function buildSection(container) {
    var section = document.createElement('div');
    section.id = 'lsv93-section';
    section.style.cssText = 'margin:0 20px 20px;';

    var speciesCount = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive().length : 0;
    var totalPop = typeof window.spv93GetTotal === 'function' ? window.spv93GetTotal() : 0;

    section.innerHTML = [
      '<div style="background:linear-gradient(135deg,rgba(5,20,10,.97),rgba(8,28,14,.97));border:1px solid rgba(34,197,94,.15);border-radius:14px;overflow:hidden;">',

      // Header
      '<div style="padding:13px 16px;border-bottom:1px solid rgba(34,197,94,.1);display:flex;align-items:center;justify-content:space-between;">',
      '<div style="display:flex;align-items:center;gap:8px;">',
      '<div style="width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;animation:lsv93-beat 2.5s ease-in-out infinite;"></div>',
      '<span style="font-size:12px;font-weight:700;color:#22c55e;letter-spacing:1px;">SỰ SỐNG ĐANG PHÁT TRIỂN</span>',
      '</div>',
      '<div style="display:flex;gap:10px;">' ,
      '<span style="font-size:11px;color:#374151;" id="lsv93-species-count">' + speciesCount + ' loài</span>',
      '<span style="font-size:11px;color:#22c55e;font-weight:600;" id="lsv93-total-pop">' + fmtNum(totalPop) + ' sinh linh</span>',
      '</div>',
      '</div>',

      // Tab bar
      '<div style="display:flex;border-bottom:1px solid rgba(255,255,255,.05);">',
      '<button class="lsv93-tab active" id="lsv93-tab-population" onclick="lsv93SwitchTab(\'population\')" style="color:#22c55e;background:rgba(34,197,94,.15);">📊 Dân Số</button>',
      '<button class="lsv93-tab" id="lsv93-tab-species" onclick="lsv93SwitchTab(\'species\')">🦁 Loài</button>',
      '<button class="lsv93-tab" id="lsv93-tab-events" onclick="lsv93SwitchTab(\'events\')">🍼 Sự Kiện</button>',
      '</div>',

      // Content
      '<div id="lsv93-content" style="padding:14px;max-height:300px;overflow-y:auto;"></div>',

      '</div>'
    ].join('');

    container.appendChild(section);
    renderContent();
  }

  function updateHeader() {
    var sc = document.getElementById('lsv93-species-count');
    var tp = document.getElementById('lsv93-total-pop');
    if (sc) {
      var cnt = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive().length : 0;
      sc.textContent = cnt + ' loài';
    }
    if (tp) {
      var tot = typeof window.spv93GetTotal === 'function' ? window.spv93GetTotal() : 0;
      tp.textContent = fmtNum(tot) + ' sinh linh';
    }
    if (_currentTab === 'population') renderContent();
  }

  function tryInject() {
    if (document.getElementById('lsv93-section')) return true;
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
          if (!document.getElementById('lsv93-section') && container && container.parentNode) {
            buildSection(container);
          }
        }, 140);
      }
    };
  }

  function startUpdating() {
    if (_updateTimer) clearInterval(_updateTimer);
    _updateTimer = setInterval(function() {
      updateHeader();
      if (!document.getElementById('lsv93-section')) tryInject();
    }, 4000);
  }

  function init() {
    injectStyles();
    hookRender();
    startUpdating();
    setTimeout(tryInject, 800);
    console.log("[LifeRegistry V93] 🌱 Life Registry khởi động — Population · Species · Life Events UI sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25000); });
  } else {
    setTimeout(init, 25000);
  }
})();
