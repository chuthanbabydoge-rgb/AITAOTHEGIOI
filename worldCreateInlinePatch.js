(function() {
  "use strict";

  /* ============================================================
     WORLD CREATE INLINE PATCH — V122
     Fix 1: tạo thế giới trực tiếp trong PUOS (không cần thoát PUOS)
     Fix 2: đồng bộ window.world → worlds array sau V91 wizard
     Init: 28850ms
  ============================================================ */

  var CSS_ID = "wcip-style";

  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = [
      ".wcip-form{display:flex;flex-direction:column;gap:14px}",
      ".wcip-label{font-size:10px;color:#7c3aed;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}",
      ".wcip-input{width:100%;padding:11px 14px;background:#0a111d;border:1px solid #1e293b;border-radius:8px;color:#e2e8f0;font-size:14px;font-family:'Noto Serif SC',serif;box-sizing:border-box;outline:none;transition:border 0.15s}",
      ".wcip-input:focus{border-color:#7c3aed}",
      ".wcip-select{width:100%;padding:11px 14px;background:#0a111d;border:1px solid #1e293b;border-radius:8px;color:#e2e8f0;font-size:13px;font-family:'Noto Serif SC',serif;box-sizing:border-box;outline:none;cursor:pointer}",
      ".wcip-btn-create{width:100%;padding:14px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:bold;font-family:'Noto Serif SC',serif;cursor:pointer;letter-spacing:1px;transition:all 0.2s}",
      ".wcip-btn-create:hover{background:linear-gradient(135deg,#8b5cf6,#7c3aed);transform:translateY(-1px);box-shadow:0 4px 20px rgba(124,58,237,0.4)}",
      ".wcip-btn-create:disabled{opacity:0.5;cursor:not-allowed;transform:none}",
      ".wcip-tmpl-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}",
      ".wcip-tmpl-card{padding:10px 6px;background:#0d1117;border:1px solid #1e293b;border-radius:8px;text-align:center;cursor:pointer;transition:all 0.15s}",
      ".wcip-tmpl-card:hover{border-color:#7c3aed44;background:#0d1b2e}",
      ".wcip-tmpl-card.active{border-color:#7c3aed;background:#7c3aed18}",
      ".wcip-tmpl-icon{font-size:20px;margin-bottom:4px}",
      ".wcip-tmpl-name{font-size:10px;color:#94a3b8}",
      ".wcip-progress{height:6px;background:#1e293b;border-radius:3px;overflow:hidden;margin-top:6px}",
      ".wcip-progress-bar{height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:3px;width:0%;transition:width 0.4s ease}",
      ".wcip-status{font-size:12px;color:#64748b;text-align:center;margin-top:8px;min-height:18px}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var TEMPLATES = [
    { key: "cultivation", icon: "☯️", name: "Tu Tiên"    },
    { key: "fantasy",     icon: "🧙", name: "Fantasy"    },
    { key: "zombie",      icon: "🧟", name: "Zombie"     },
    { key: "mythology",   icon: "⚡", name: "Thần Thoại" },
    { key: "scifi",       icon: "🚀", name: "Sci-Fi"     }
  ];

  var _selectedTmpl = "cultivation";

  /* ── Render inline creation form ────────────────────────────── */
  function renderInlineCreation() {
    injectCSS();
    var cards = TEMPLATES.map(function(t) {
      return '<div class="wcip-tmpl-card' + (t.key === _selectedTmpl ? ' active' : '') + '" '
        + 'id="wcip-tmpl-' + t.key + '" onclick="wcipSelectTmpl(\'' + t.key + '\')">'
        + '<div class="wcip-tmpl-icon">' + t.icon + '</div>'
        + '<div class="wcip-tmpl-name">' + t.name + '</div>'
        + '</div>';
    }).join('');

    return '<div class="puos-card" style="max-width:600px">'
      + '<div class="puos-card-title">✨ Khai Sinh Thế Giới Mới</div>'
      + '<div class="wcip-form">'
        + '<div><div class="wcip-label">Tên Thế Giới</div>'
        + '<input class="wcip-input" id="wcip-name" placeholder="Nhập tên thế giới..." maxlength="60" '
        + 'onkeydown="if(event.key===\'Enter\')wcipDoCreate()"></div>'

        + '<div><div class="wcip-label">Thể Loại</div>'
        + '<div class="wcip-tmpl-grid">' + cards + '</div></div>'

        + '<div><div class="wcip-label">Dân Số Ban Đầu</div>'
        + '<select class="wcip-select" id="wcip-pop">'
        + '<option value="0">✨ Hư Không (0 NPC)</option>'
        + '<option value="10">🌱 Khai Nguyên (10)</option>'
        + '<option value="20">🌿 Thảo Nguyên (20)</option>'
        + '<option value="50" selected>🌳 Thịnh Vượng (50)</option>'
        + '<option value="100">🌟 Đại Thế (100)</option>'
        + '</select></div>'

        + '<div>'
        + '<button class="wcip-btn-create" id="wcip-create-btn" onclick="wcipDoCreate()">⚡ Khai Sinh Thế Giới</button>'
        + '<div class="wcip-progress" id="wcip-progress-wrap" style="display:none"><div class="wcip-progress-bar" id="wcip-progress-bar"></div></div>'
        + '<div class="wcip-status" id="wcip-status"></div>'
        + '</div>'
      + '</div>'
    + '</div>';
  }

  /* ── Patch puosWorldsTab để show inline form khi tab = 'creation' ── */
  function patchWorldsPanel() {
    var origRenderWorlds = window.puosRenderWorlds;
    if (!origRenderWorlds) return;

    // Wrap puosRenderWorlds: nếu đang ở tab creation → thay thế nội dung
    window.puosRenderWorlds = function(container) {
      origRenderWorlds(container);
      if (window._wcipActiveTab === 'creation') {
        var el = container.querySelector('#puos-worlds-content');
        if (el) el.innerHTML = renderInlineCreation();
      }
    };

    // Wrap puosWorldsTab: theo dõi tab và inject inline form
    var origWorldsTab = window.puosWorldsTab;
    window.puosWorldsTab = function(tabId) {
      window._wcipActiveTab = tabId;
      if (origWorldsTab) origWorldsTab(tabId);
      if (tabId === 'creation') {
        setTimeout(function() {
          var el = document.getElementById('puos-worlds-content');
          if (el) {
            el.innerHTML = renderInlineCreation();
            var inp = document.getElementById('wcip-name');
            if (inp) inp.focus();
          }
        }, 30);
      }
    };
  }

  /* ── Đồng bộ window.world → worlds array (fix V91 wizard) ─── */
  window.wcipSyncWorldToArray = function() {
    try {
      var w = window.world;
      if (!w || !w.name) return;
      var arr = window.worlds;
      if (!Array.isArray(arr)) return;

      // Kiểm tra xem world đã có trong array chưa
      var exists = arr.some(function(entry) {
        return entry && (entry.name === w.name || entry.id === window.currentWorldId);
      });
      if (exists) return;

      // Chưa có → thêm vào bằng captureWorldSnapshot hoặc tạo snapshot thủ công
      var snap;
      if (typeof window.captureWorldSnapshot === 'function') {
        snap = window.captureWorldSnapshot();
      } else {
        snap = {
          id:         window.currentWorldId || ('w_' + Date.now()),
          name:       w.name,
          genre:      w.genre || 'unknown',
          templateKey:w.templateKey || 'cultivation',
          year:       window.year || 1,
          population: (window.npcs || []).filter(function(n){ return n && n.alive !== false; }).length,
          countries:  (window.countries || []).length,
          savedAt:    Date.now()
        };
      }
      if (snap) {
        arr.push(snap);
        if (typeof window.saveWorlds === 'function') window.saveWorlds();
        console.log('[WorldCreateInline V122] 🔄 Đồng bộ window.world → worlds array:', w.name);
      }
    } catch(e) {
      console.warn('[WorldCreateInline V122] wcipSyncWorldToArray lỗi:', e);
    }
  };

  /* ── Chọn template ──────────────────────────────────────────── */
  window.wcipSelectTmpl = function(key) {
    _selectedTmpl = key;
    TEMPLATES.forEach(function(t) {
      var card = document.getElementById('wcip-tmpl-' + t.key);
      if (card) card.className = 'wcip-tmpl-card' + (t.key === key ? ' active' : '');
    });
  };

  /* ── Tạo thế giới ───────────────────────────────────────────── */
  window.wcipDoCreate = function() {
    var nameEl   = document.getElementById('wcip-name');
    var popEl    = document.getElementById('wcip-pop');
    var btn      = document.getElementById('wcip-create-btn');
    var progWrap = document.getElementById('wcip-progress-wrap');
    var progBar  = document.getElementById('wcip-progress-bar');
    var statusEl = document.getElementById('wcip-status');

    var name    = nameEl ? nameEl.value.trim() : '';
    var initPop = popEl ? parseInt(popEl.value) || 0 : 50;

    if (!name) {
      if (nameEl) { nameEl.style.borderColor = '#ef4444'; nameEl.focus(); setTimeout(function(){ nameEl.style.borderColor='#1e293b'; }, 1500); }
      if (statusEl) statusEl.textContent = '⚠️ Vui lòng nhập tên thế giới!';
      return;
    }

    if (btn)      { btn.disabled = true; btn.textContent = '🌌 Đang Khai Sinh...'; }
    if (progWrap) progWrap.style.display = 'block';

    function setProgress(pct, msg) {
      if (progBar)  progBar.style.width = pct + '%';
      if (statusEl) statusEl.textContent = msg;
    }

    setProgress(10, 'Chuẩn bị vũ trụ...');

    // Bước 1 (200ms): inject hidden DOM inputs
    setTimeout(function() {
      setProgress(30, 'Cấu hình thế giới...');

      function getOrCreate(id, tag) {
        var el = document.getElementById(id);
        if (!el) {
          el = document.createElement(tag || 'input');
          el.id = id; el.style.display = 'none';
          document.body.appendChild(el);
        }
        return el;
      }

      var mwName = getOrCreate('mwNewName', 'input');
      var mwTmpl = getOrCreate('mwNewTemplate', 'select');
      var mwPop  = getOrCreate('mwInitialPop', 'input');

      if (!mwTmpl.querySelector('option[value="' + _selectedTmpl + '"]')) {
        ['cultivation','fantasy','zombie','mythology','scifi'].forEach(function(k) {
          var o = document.createElement('option'); o.value = k; o.textContent = k;
          mwTmpl.appendChild(o);
        });
      }

      mwName.value = name;
      mwTmpl.value = _selectedTmpl;
      mwPop.value  = initPop;
    }, 200);

    // Bước 2 (600ms): gọi createNewWorldFromManager
    setTimeout(function() {
      setProgress(55, 'Khai sinh thiên địa...');
      try {
        if (typeof createNewWorldFromManager === 'function') {
          createNewWorldFromManager();
        } else if (typeof createWorld === 'function') {
          createWorld();
        } else {
          throw new Error('Không tìm thấy hàm tạo thế giới');
        }
      } catch(e) {
        console.error('[WorldCreateInline] Lỗi:', e);
        if (statusEl) statusEl.textContent = '❌ Lỗi: ' + e.message;
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Khai Sinh Thế Giới'; }
        return;
      }
    }, 600);

    // Bước 3 (900ms): cập nhật UI
    setTimeout(function() { setProgress(80, 'Gieo hạt giống sự sống...'); }, 900);

    // Bước 4 (1400ms): hoàn tất + điều hướng
    setTimeout(function() {
      setProgress(100, '✅ Thế giới đã được tạo!');

      // Đồng bộ worlds array phòng trường hợp chưa đồng bộ
      setTimeout(window.wcipSyncWorldToArray, 200);

      if (typeof window.toast === 'function') {
        window.toast('🌍 Thế giới "' + name + '" đã khai sinh!', 3000);
      }
      if (typeof window.htAddEvent === 'function') {
        window.htAddEvent({ year: window.year || 1, type: 'world_create', title: '🌍 Thế Giới "' + name + '" Ra Đời', color: '#7c3aed' });
      }

      // Điều hướng về My Universe
      setTimeout(function() {
        if (typeof window.puosGo === 'function') window.puosGo('my-universe');
      }, 600);
    }, 1400);
  };

  /* ── Sync watcher: kiểm tra mỗi 10s nếu window.world chưa trong worlds ── */
  function startSyncWatcher() {
    setInterval(function() {
      if (window.world && window.world.name) {
        window.wcipSyncWorldToArray();
      }
    }, 10000);
  }

  /* ── INIT ───────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    patchWorldsPanel();
    startSyncWatcher();
    console.log('[WorldCreateInline V122] ✨ Inline world creation patch khởi động — Fix 1: inline form trong PUOS · Fix 2: worlds array sync · Fix 3: worlds tab creation redirect.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 28850); });
  } else {
    setTimeout(init, 28850);
  }
})();
