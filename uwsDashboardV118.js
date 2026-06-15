(function() {
  "use strict";

  // V118 — UWS Live Dashboard Panel
  // Inject nav button vào PUOS · Render real-time stats từ window.UWS
  // KHÔNG lưu localStorage · KHÔNG ghi đè engine nào

  var SECTION_ID  = 'uws-dashboard';
  var NAV_BTN_ID  = 'puos-nav-' + SECTION_ID;
  var _liveTimer  = null;
  var _isActive   = false;
  var _prevValues = {};

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  function fmt(n) {
    if (n === undefined || n === null) return '—';
    if (typeof n === 'number') return n.toLocaleString();
    return String(n);
  }

  function fmtPop(n) {
    if (!n) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }

  function changed(key, val) {
    var changed = (_prevValues[key] !== val);
    _prevValues[key] = val;
    return changed;
  }

  function flashClass(key, val) {
    return changed(key, val) ? ' uws118-flash' : '';
  }

  // ─────────────────────────────────────────────
  // CSS
  // ─────────────────────────────────────────────

  function injectCSS() {
    if (document.getElementById('uws118-style')) return;
    var s = document.createElement('style');
    s.id = 'uws118-style';
    s.textContent = [
      '@keyframes uws118-flash-anim { 0%{background:#7c3aed44} 100%{background:transparent} }',
      '@keyframes uws118-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }',
      '@keyframes uws118-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }',
      '.uws118-flash { animation:uws118-flash-anim 0.6s ease; }',
      '.uws118-live-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:6px;animation:uws118-pulse 1.5s infinite; }',
      '.uws118-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 24px 24px; }',
      '@media(max-width:900px){.uws118-grid{grid-template-columns:1fr;}}',
      '.uws118-card { background:#0a1120;border:1px solid #1e293b;border-radius:12px;padding:18px;animation:uws118-in 0.2s ease; }',
      '.uws118-card-title { font-size:9px;color:#7c3aed;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:6px; }',
      '.uws118-bignum { font-size:36px;font-weight:bold;color:#e2e8f0;line-height:1;margin-bottom:4px; }',
      '.uws118-sublbl { font-size:10px;color:#475569; }',
      '.uws118-row { display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #0d1829; }',
      '.uws118-row:last-child { border-bottom:none; }',
      '.uws118-row-lbl { font-size:12px;color:#475569; }',
      '.uws118-row-val { font-size:12px;font-weight:600;color:#94a3b8; }',
      '.uws118-row-val.hi { color:#10b981; }',
      '.uws118-row-val.warn { color:#f59e0b; }',
      '.uws118-row-val.danger { color:#ef4444; }',
      '.uws118-row-val.purple { color:#a78bfa; }',
      '.uws118-badge { display:inline-block;padding:2px 7px;border-radius:99px;font-size:10px;margin-right:3px;margin-bottom:3px; }',
      '.uws118-badge.war { background:#ef444422;color:#ef4444;border:1px solid #ef444444; }',
      '.uws118-badge.dis { background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b44; }',
      '.uws118-badge.pla { background:#8b5cf622;color:#8b5cf6;border:1px solid #8b5cf644; }',
      '.uws118-badge.eco { background:#06b6d422;color:#06b6d4;border:1px solid #06b6d444; }',
      '.uws118-npc-row { display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #0d1829; }',
      '.uws118-npc-row:last-child { border-bottom:none; }',
      '.uws118-npc-rank { font-size:11px;color:#334155;width:18px; }',
      '.uws118-npc-name { font-size:12px;color:#cbd5e1;flex:1; }',
      '.uws118-npc-stat { font-size:11px;color:#7c3aed;min-width:50px;text-align:right; }',
      '.uws118-npc-realm { font-size:10px;color:#475569;min-width:60px;text-align:right; }',
      '.uws118-refresh-row { display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid #0d1829;margin-bottom:16px; }',
      '.uws118-refresh-btn { padding:6px 14px;border:1px solid #7c3aed55;border-radius:6px;background:transparent;color:#a78bfa;cursor:pointer;font-size:11px;font-family:inherit;transition:all 0.15s; }',
      '.uws118-refresh-btn:hover { background:#7c3aed22; }',
      '.uws118-wide { grid-column:1/-1; }',
      '.uws118-evt-item { padding:7px 0;border-bottom:1px solid #0d1829;font-size:12px;color:#64748b; }',
      '.uws118-evt-item:last-child { border-bottom:none; }',
      '.uws118-evt-year { color:#7c3aed;margin-right:6px; }',
      '.uws118-empty { font-size:12px;color:#334155;text-align:center;padding:16px 0; }',
      '.uws118-progress-bar { height:4px;border-radius:2px;background:#0d1829;margin-top:8px;overflow:hidden; }',
      '.uws118-progress-fill { height:100%;border-radius:2px;background:linear-gradient(90deg,#7c3aed,#a78bfa);transition:width 0.5s ease; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  window.puosRenderUWSDashboard = function(container) {
    if (!container) return;
    injectCSS();

    if (typeof window.uwsRefresh === 'function') window.uwsRefresh();
    var uws = window.UWS || {};
    var s   = (uws.summary) || {};
    var ent = (uws.entities)|| {};
    var evt = (uws.events)  || {};
    var wld = (uws.world)   || {};
    var npcs= (ent.npcs)    || {};
    var top5= (npcs.top5)   || [];

    var worldName = s.worldName || '—';
    var genre     = s.genre     || '—';
    var yr        = s.currentYear || window.year || 1;
    var age       = s.currentAge  || '—';
    var pop       = s.totalPopulation || 0;
    var alive     = s.aliveNPCs  || 0;
    var dead      = (npcs.total||0) - alive;
    var cultivs   = npcs.cultivators || 0;
    var kingdoms  = s.totalKingdoms || 0;
    var empires   = s.totalEmpires  || 0;
    var civs      = s.totalCivs     || 0;
    var species   = s.totalSpecies  || 0;
    var activeWar = s.activeWars    || 0;
    var activeDis = s.activeDisasters|| 0;
    var activePla = s.activePlagues  || 0;
    var activeEco = (evt.crises && evt.crises.active) || 0;
    var alliances = (evt.alliances && evt.alliances.total) || 0;
    var treaties  = (evt.treaties  && evt.treaties.total)  || 0;
    var sanctions = (evt.sanctions && evt.sanctions.total) || 0;
    var council   = (evt.council   && evt.council.active)  || false;
    var recentEvts= (evt.worldEvents && evt.worldEvents.recent) || [];
    var autoEvts  = (evt.autoEvents  && evt.autoEvents.recent)  || [];
    var allEvts   = recentEvts.concat(autoEvts).slice(-6);
    var tick      = (uws.meta && uws.meta.tickCount) || 0;
    var lastUpd   = uws._lastUpdated ? new Date(uws._lastUpdated).toLocaleTimeString() : '—';

    var warColor  = activeWar  > 0 ? 'danger' : 'hi';
    var disColor  = activeDis  > 0 ? 'warn'   : 'hi';
    var plaColor  = activePla  > 0 ? 'purple'  : 'hi';
    var ecoColor  = activeEco  > 0 ? 'warn'   : 'hi';

    // War badges
    var warBadges = '';
    if (evt.wars && evt.wars.list && evt.wars.list.length > 0) {
      evt.wars.list.slice(0, 3).forEach(function(w) {
        warBadges += '<span class="uws118-badge war">⚔️ ' + (w.attacker||'?') + ' vs ' + (w.defender||'?') + '</span>';
      });
    }

    // Top NPCs
    var npcRows = '';
    if (top5.length > 0) {
      top5.forEach(function(n, i) {
        npcRows += '<div class="uws118-npc-row">'
          + '<span class="uws118-npc-rank">' + (i+1) + '</span>'
          + '<span class="uws118-npc-name">' + (n.name||'—') + '</span>'
          + '<span class="uws118-npc-realm">' + (n.realm||'') + '</span>'
          + '<span class="uws118-npc-stat">Lv ' + (n.level||0) + '</span>'
          + '</div>';
      });
    } else {
      npcRows = '<div class="uws118-empty">Chưa có NPC nào</div>';
    }

    // Recent events
    var evtRows = '';
    if (allEvts.length > 0) {
      allEvts.forEach(function(e) {
        evtRows += '<div class="uws118-evt-item">'
          + '<span class="uws118-evt-year">Năm ' + (e.year||'?') + '</span>'
          + (e.title || e.type || '—')
          + '</div>';
      });
    } else {
      evtRows = '<div class="uws118-empty">Chưa có sự kiện</div>';
    }

    // World vitality bar (0-100)
    var vitality = 0;
    try {
      if (worldName !== '—') vitality += 20;
      if (pop > 0)           vitality += 20;
      if (alive > 0)         vitality += 15;
      if (civs > 0)          vitality += 15;
      if (kingdoms > 0)      vitality += 10;
      if (empires > 0)       vitality += 10;
      if (activeWar === 0)   vitality += 10;
    } catch(e) {}

    var html = '';

    // ── Header ──
    html += '<div style="padding:20px 24px 16px;border-bottom:1px solid #0d1829">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between">';
    html += '<div>';
    html += '<h2 style="margin:0;font-size:16px;color:#e2e8f0;font-weight:bold">';
    html += '<span class="uws118-live-dot"></span>Live Dashboard</h2>';
    html += '<div style="font-size:11px;color:#334155;margin-top:3px">V118 · window.UWS · Tick #' + tick + '</div>';
    html += '</div>';
    html += '<div style="text-align:right">';
    html += '<div style="font-size:10px;color:#475569">Cập nhật lúc</div>';
    html += '<div id="uws118-last-upd" style="font-size:11px;color:#7c3aed">' + lastUpd + '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // ── Refresh controls ──
    html += '<div class="uws118-refresh-row">';
    html += '<div style="display:flex;align-items:center;gap:6px">';
    html += '<span class="uws118-live-dot" style="animation-duration:1s"></span>';
    html += '<span style="font-size:11px;color:#475569">Tự cập nhật mỗi 1 giây</span>';
    html += '</div>';
    html += '<button class="uws118-refresh-btn" onclick="if(typeof window.uwsRefresh===\'function\'){window.uwsRefresh();if(typeof window.puosGo===\'function\')window.puosGo(\'uws-dashboard\');}">⟳ Refresh ngay</button>';
    html += '</div>';

    // ── Grid ──
    html += '<div class="uws118-grid">';

    // Card 1 — Thế Giới
    html += '<div class="uws118-card">';
    html += '<div class="uws118-card-title">🌍 Thế Giới</div>';
    html += '<div class="uws118-bignum' + flashClass('worldName', worldName) + '">' + (worldName.length > 14 ? worldName.slice(0,14)+'…' : worldName) + '</div>';
    html += '<div class="uws118-sublbl">' + genre + '</div>';
    html += '<div class="uws118-progress-bar"><div class="uws118-progress-fill" style="width:' + vitality + '%"></div></div>';
    html += '<div style="font-size:10px;color:#475569;margin-top:5px;margin-bottom:12px">Sức sống thế giới: ' + vitality + '%</div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">📅 Năm hiện tại</span><span class="uws118-row-val' + flashClass('year', yr) + '">' + fmt(yr) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🌅 Thời đại</span><span class="uws118-row-val purple">' + age + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">👥 Dân số</span><span class="uws118-row-val hi' + flashClass('pop', pop) + '">' + fmtPop(pop) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🌱 Thể loại</span><span class="uws118-row-val">' + genre + '</span></div>';
    html += '</div>';

    // Card 2 — Thực Thể
    html += '<div class="uws118-card">';
    html += '<div class="uws118-card-title">👤 Thực Thể</div>';
    html += '<div class="uws118-bignum' + flashClass('aliveNPCs', alive) + '">' + fmt(alive) + '</div>';
    html += '<div class="uws118-sublbl">NPC đang sống</div>';
    html += '<div style="margin-bottom:12px"></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">💀 NPC đã chết</span><span class="uws118-row-val' + flashClass('deadNPCs', dead) + '">' + fmt(dead) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">⚡ Tu sĩ</span><span class="uws118-row-val purple">' + fmt(cultivs) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">👑 Vương quốc</span><span class="uws118-row-val' + flashClass('kingdoms', kingdoms) + '">' + fmt(kingdoms) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🏰 Đế chế</span><span class="uws118-row-val' + flashClass('empires', empires) + '">' + fmt(empires) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🏛 Văn minh</span><span class="uws118-row-val' + flashClass('civs', civs) + '">' + fmt(civs) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🧬 Loài</span><span class="uws118-row-val' + flashClass('species', species) + '">' + fmt(species) + '</span></div>';
    html += '</div>';

    // Card 3 — Sự Kiện Đang Diễn Ra
    html += '<div class="uws118-card">';
    html += '<div class="uws118-card-title">⚡ Sự Kiện Đang Diễn Ra</div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">⚔️ Chiến tranh đang diễn ra</span><span class="uws118-row-val ' + warColor + flashClass('activeWar', activeWar) + '">' + fmt(activeWar) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🌋 Thiên tai đang xảy ra</span><span class="uws118-row-val ' + disColor + flashClass('activeDis', activeDis) + '">' + fmt(activeDis) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">💀 Đại dịch đang lây lan</span><span class="uws118-row-val ' + plaColor + flashClass('activePla', activePla) + '">' + fmt(activePla) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">💹 Khủng hoảng kinh tế</span><span class="uws118-row-val ' + ecoColor + flashClass('activeEco', activeEco) + '">' + fmt(activeEco) + '</span></div>';
    if (warBadges) {
      html += '<div style="margin-top:10px">' + warBadges + '</div>';
    }
    html += '</div>';

    // Card 4 — Quan Hệ Quốc Tế
    html += '<div class="uws118-card">';
    html += '<div class="uws118-card-title">🤝 Quan Hệ Quốc Tế</div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🤝 Liên minh hoạt động</span><span class="uws118-row-val hi">' + fmt(alliances) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">📜 Hiệp ước</span><span class="uws118-row-val">' + fmt(treaties) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🚫 Trừng phạt</span><span class="uws118-row-val' + (sanctions>0?' warn':' hi') + '">' + fmt(sanctions) + '</span></div>';
    html += '<div class="uws118-row"><span class="uws118-row-lbl">🏛 Hội đồng thế giới</span><span class="uws118-row-val ' + (council ? 'hi' : '') + '">' + (council ? '✅ Hoạt động' : '—') + '</span></div>';
    html += '</div>';

    // Card 5 — Top NPCs (wide)
    html += '<div class="uws118-card uws118-wide">';
    html += '<div class="uws118-card-title">⭐ Top 5 NPC Mạnh Nhất</div>';
    html += npcRows;
    html += '</div>';

    // Card 6 — Lịch sử gần đây (wide)
    html += '<div class="uws118-card uws118-wide">';
    html += '<div class="uws118-card-title">📜 Sự Kiện Gần Đây</div>';
    html += evtRows;
    html += '</div>';

    html += '</div>'; // end grid

    container.innerHTML = html;
  };

  // ─────────────────────────────────────────────
  // LIVE REFRESH (setInterval khi panel đang mở)
  // ─────────────────────────────────────────────

  function startLive() {
    if (_liveTimer) return;
    _isActive = true;
    _liveTimer = setInterval(function() {
      if (!_isActive) { stopLive(); return; }
      var main = document.getElementById('puos-main');
      if (!main || !main.querySelector('[class*="uws118"]')) { stopLive(); return; }
      if (typeof window.uwsRefresh === 'function') window.uwsRefresh();
      window.puosRenderUWSDashboard(main);
    }, 1000);
  }

  function stopLive() {
    _isActive = false;
    if (_liveTimer) { clearInterval(_liveTimer); _liveTimer = null; }
  }

  // ─────────────────────────────────────────────
  // PATCH puosGo — thêm handler cho 'uws-dashboard'
  // ─────────────────────────────────────────────

  function patchPuosGo() {
    var _orig = window.puosGo;
    window.puosGo = function(sectionId) {
      if (sectionId === SECTION_ID) {
        // Cập nhật active state tất cả nav buttons
        document.querySelectorAll('.puos-nav-btn').forEach(function(b) {
          b.classList.remove('active');
        });
        var ownBtn = document.getElementById(NAV_BTN_ID);
        if (ownBtn) ownBtn.classList.add('active');

        // Render vào #puos-main
        var main = document.getElementById('puos-main');
        if (main) {
          _isActive = true;
          window.puosRenderUWSDashboard(main);
          startLive();
        }
      } else {
        // Nếu chuyển sang tab khác → stop live refresh
        stopLive();
        var ownBtn2 = document.getElementById(NAV_BTN_ID);
        if (ownBtn2) ownBtn2.classList.remove('active');
        if (_orig) _orig.apply(this, arguments);
      }
    };
  }

  // ─────────────────────────────────────────────
  // INJECT NAV BUTTON vào PUOS sidebar
  // ─────────────────────────────────────────────

  function injectNavButton() {
    if (document.getElementById(NAV_BTN_ID)) return; // đã có rồi

    // Tìm nav container trong sidebar (div chứa các .puos-nav-btn)
    var navContainer = null;
    var sidebar = document.getElementById('puos-sidebar');
    if (sidebar) {
      // Tìm div chứa flex:1 (phần nav buttons)
      var divs = sidebar.querySelectorAll('div');
      divs.forEach(function(d) {
        if (!navContainer && d.querySelector('.puos-nav-btn')) {
          navContainer = d;
        }
      });
    }

    if (!navContainer) return; // sidebar chưa render

    var btn = document.createElement('button');
    btn.id        = NAV_BTN_ID;
    btn.className = 'puos-nav-btn';
    btn.innerHTML = '<span style="font-size:15px">🌐</span><span>Live State</span>';
    btn.onclick   = function() { if (typeof window.puosGo === 'function') window.puosGo(SECTION_ID); };
    navContainer.appendChild(btn);
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  function init() {
    injectCSS();
    patchPuosGo();

    // Chờ PUOS shell được tạo rồi inject nav button
    var _tryInject = setInterval(function() {
      var sidebar = document.getElementById('puos-sidebar');
      if (sidebar && sidebar.querySelector('.puos-nav-btn')) {
        injectNavButton();
        clearInterval(_tryInject);
      }
    }, 500);

    // Đảm bảo inject sau khi PUOS open
    var _origOpenPuos = window.openPuos || window.puosOpen;
    if (typeof _origOpenPuos === 'function') {
      window.openPuos = window.puosOpen = function() {
        _origOpenPuos.apply(this, arguments);
        setTimeout(injectNavButton, 300);
      };
    }

    // Patch puosRenderShell để inject sau mỗi lần shell rebuild
    if (typeof window.puosRenderShell === 'function') {
      var _origRS = window.puosRenderShell;
      window.puosRenderShell = function() {
        if (_origRS) _origRS.apply(this, arguments);
        setTimeout(injectNavButton, 100);
      };
    }

    console.log("[UWS Dashboard V118] 🌐 Live Dashboard sẵn sàng — puosGo('uws-dashboard') để mở.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 26600); });
  } else {
    setTimeout(init, 26600);
  }
})();
