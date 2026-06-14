(function() {
  "use strict";

  var _currentTab = 'events';
  var _updateTimer = null;
  var _injectAttempts = 0;

  function injectStyles() {
    if (document.getElementById('awv92-style')) return;
    var s = document.createElement('style');
    s.id = 'awv92-style';
    s.textContent = [
      '@keyframes awv92-pulse{0%,100%{opacity:.6}50%{opacity:1}}',
      '@keyframes awv92-slide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      '.awv92-tab-btn{flex:1;padding:8px 4px;border:none;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;transition:all .15s;border-radius:0;}',
      '.awv92-tab-btn.active{background:rgba(124,58,237,.25)!important;color:#a78bfa!important;}',
      '.awv92-tab-btn:hover{background:rgba(255,255,255,.05)!important;color:#94a3b8!important;}',
      '.awv92-event-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);animation:awv92-slide .25s ease both;}',
      '.awv92-event-row:last-child{border-bottom:none;}',
      '.awv92-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:6px;animation:awv92-pulse 2s ease-in-out infinite;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function renderTabContent() {
    var el = document.getElementById('awv92-content');
    if (!el) return;

    var html = '';
    if (_currentTab === 'events') {
      var evs = typeof window.aeeV92GetRecentEvents === 'function' ? window.aeeV92GetRecentEvents(8) : [];
      if (!evs.length) {
        html = '<div style="color:#374151;text-align:center;padding:20px;font-size:12px;font-style:italic;">Chưa có sự kiện — thế giới cần thời gian để vận hành...</div>';
      } else {
        evs.forEach(function(ev) {
          html += '<div class="awv92-event-row">';
          html += '<div class="awv92-dot" style="background:' + ev.color + ';box-shadow:0 0 4px ' + ev.color + ';"></div>';
          html += '<span style="font-size:15px;flex-shrink:0;">' + ev.icon + '</span>';
          html += '<div style="flex:1;min-width:0;">';
          html += '<div style="font-size:12px;font-weight:600;color:' + ev.color + ';">' + ev.title + '</div>';
          html += '<div style="font-size:11px;color:#4b5563;margin-top:2px;line-height:1.4;">' + ev.desc + '</div>';
          html += '<div style="font-size:10px;color:#374151;margin-top:3px;">📅 Năm ' + ev.year + ' · ' + ev.label + '</div>';
          html += '</div></div>';
        });
      }
    } else if (_currentTab === 'chronicle') {
      html = typeof window.wchV92RenderHTML === 'function' ? window.wchV92RenderHTML() : '';
    } else if (_currentTab === 'jarvis') {
      html = typeof window.jovV92RenderHTML === 'function' ? window.jovV92RenderHTML() : '';
    }

    el.innerHTML = html;
  }

  window.awv92SwitchTab = function(tab) {
    _currentTab = tab;
    var tabs = ['events', 'chronicle', 'jarvis'];
    tabs.forEach(function(t) {
      var btn = document.getElementById('awv92-tab-' + t);
      if (!btn) return;
      if (t === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderTabContent();
  };

  function updateYearBadge() {
    var badge = document.getElementById('awv92-year-num');
    if (badge) badge.textContent = (window.year || 1).toLocaleString();
    var elapsed = typeof window.wacV92GetElapsed === 'function' ? window.wacV92GetElapsed() : 0;
    var elBadge = document.getElementById('awv92-elapsed');
    if (elBadge) elBadge.textContent = elapsed + ' năm đã trôi qua';
  }

  function buildSection(container) {
    var section = document.createElement('div');
    section.id = 'awv92-section';
    section.style.cssText = 'margin:0 20px 20px;padding:0;animation:awv92-slide .3s ease both;';

    var year = window.year || 1;
    var elapsed = typeof window.wacV92GetElapsed === 'function' ? window.wacV92GetElapsed() : 0;
    var totalEvs = (window.aeeV92Data && window.aeeV92Data.totalEvents) || 0;

    section.innerHTML = [
      '<div style="background:linear-gradient(135deg,rgba(7,17,35,.95),rgba(15,25,50,.95));border:1px solid rgba(124,58,237,.2);border-radius:14px;overflow:hidden;">',

      // Header
      '<div style="padding:14px 16px;border-bottom:1px solid rgba(124,58,237,.12);display:flex;align-items:center;justify-content:space-between;">',
      '<div style="display:flex;align-items:center;gap:8px;">',
      '<div style="width:7px;height:7px;border-radius:50%;background:#22c55e;animation:awv92-pulse 2s ease-in-out infinite;box-shadow:0 0 6px #22c55e;"></div>',
      '<span style="font-size:12px;font-weight:700;color:#a78bfa;letter-spacing:1px;">THẾ GIỚI TỰ VẬN HÀNH</span>',
      '</div>',
      '<div style="font-size:11px;color:#1e3a5f;font-style:italic;" id="awv92-elapsed">' + elapsed + ' năm đã trôi qua</div>',
      '</div>',

      // Year + Stats row
      '<div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;gap:10px;">',

      '<div style="flex:1;background:rgba(124,58,237,.08);border-radius:10px;padding:10px 12px;text-align:center;">',
      '<div style="font-size:10px;color:#4b5563;margin-bottom:4px;letter-spacing:1px;">NĂM HIỆN TẠI</div>',
      '<div style="font-size:22px;font-weight:700;color:#c4b5fd;" id="awv92-year-num">' + year + '</div>',
      '</div>',

      '<div style="flex:1;background:rgba(34,197,94,.05);border-radius:10px;padding:10px 12px;text-align:center;">',
      '<div style="font-size:10px;color:#4b5563;margin-bottom:4px;letter-spacing:1px;">SỰ KIỆN</div>',
      '<div style="font-size:22px;font-weight:700;color:#22c55e;">' + totalEvs + '</div>',
      '</div>',

      '<div style="flex:1;background:rgba(59,130,246,.05);border-radius:10px;padding:10px 12px;text-align:center;">',
      '<div style="font-size:10px;color:#4b5563;margin-bottom:4px;letter-spacing:1px;">SINH LINH</div>',
      '<div style="font-size:22px;font-weight:700;color:#60a5fa;">' + ((window.npcs||[]).length) + '</div>',
      '</div>',

      '</div>',

      // Tab bar
      '<div style="display:flex;border-bottom:1px solid rgba(255,255,255,.06);">',
      '<button class="awv92-tab-btn active" id="awv92-tab-events" onclick="awv92SwitchTab(\'events\')" style="background:rgba(124,58,237,.25);color:#a78bfa;">⚡ Sự Kiện</button>',
      '<button class="awv92-tab-btn" id="awv92-tab-chronicle" onclick="awv92SwitchTab(\'chronicle\')" style="background:transparent;color:#374151;">📜 Biên Niên</button>',
      '<button class="awv92-tab-btn" id="awv92-tab-jarvis" onclick="awv92SwitchTab(\'jarvis\')" style="background:transparent;color:#374151;">🤖 Jarvis</button>',
      '</div>',

      // Content
      '<div id="awv92-content" style="padding:12px 14px;max-height:260px;overflow-y:auto;"></div>',

      '</div>'
    ].join('');

    container.appendChild(section);
    renderTabContent();
  }

  function tryInject() {
    if (document.getElementById('awv92-section')) return true;
    if (!window.world || !window.world.name) return false;

    var main = document.getElementById('puos-main');
    if (!main) return false;

    buildSection(main);
    return true;
  }

  function startLiveUpdate() {
    if (_updateTimer) clearInterval(_updateTimer);
    _updateTimer = setInterval(function() {
      updateYearBadge();
      if (_currentTab === 'events') renderTabContent();

      _injectAttempts++;
      if (!document.getElementById('awv92-section')) {
        tryInject();
      }
    }, 3000);
  }

  function hookRender() {
    var _orig = window.puosRenderMyUniverse;
    window.puosRenderMyUniverse = function(container) {
      if (_orig) _orig(container);
      if (window.world && window.world.name) {
        setTimeout(function() {
          if (!document.getElementById('awv92-section') && container && container.parentNode) {
            buildSection(container);
          }
        }, 80);
      }
    };
  }

  function init() {
    injectStyles();
    hookRender();
    startLiveUpdate();
    setTimeout(tryInject, 500);
    console.log("[AutonomousWorldRegistry V92] 🌍 Registry khởi động — Live World Display · Chronicle · Jarvis Observer sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24600); });
  } else {
    setTimeout(init, 24600);
  }
})();
