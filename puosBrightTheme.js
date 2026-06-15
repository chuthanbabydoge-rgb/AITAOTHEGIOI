(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // PUOS BRIGHT THEME — CSS Override Layer + Live Toggle
  // - Bright Mode (default) / Classic Dark Mode
  // - Lưu lựa chọn vào localStorage, áp dụng ngay không cần reload
  // - Inject toggle row vào Settings > Giao Diện qua _orig pattern
  // ══════════════════════════════════════════════════════════════════════

  var STYLE_ID  = 'puos-bright-theme-style';
  var SAVE_KEY  = 'cgv6_puos_theme_pref';
  var _isBright = true;

  // ── Load preference ─────────────────────────────────────────────────
  function loadPref() {
    try {
      var v = localStorage.getItem(SAVE_KEY);
      if (v === 'dark') _isBright = false;
      else _isBright = true;
    } catch(e) { _isBright = true; }
  }
  function savePref() {
    try { localStorage.setItem(SAVE_KEY, _isBright ? 'bright' : 'dark'); } catch(e) {}
  }

  // ── CSS sáng (Bright Mode) ───────────────────────────────────────────
  var BRIGHT_CSS = [
    ':root {',
    '  --pb-bg:        #0e1c2f;',
    '  --pb-sidebar:   #111e32;',
    '  --pb-card:      #152537;',
    '  --pb-hover:     #1a3048;',
    '  --pb-border:    #2d4a6a;',
    '  --pb-divider:   #1c3050;',
    '  --pb-text-dim:  #7a98b5;',
    '  --pb-text-mid:  #b0c4d8;',
    '  --pb-text-full: #dce8f5;',
    '  --pb-purple:    #9d5cf6;',
    '  --pb-purple-bg: #7c3aed25;',
    '}',
    'body.puos-mode { background:var(--pb-bg)!important; }',
    '#puos-shell    { background:var(--pb-bg)!important; color:var(--pb-text-full)!important; }',
    '#puos-sidebar  { background:var(--pb-sidebar)!important; border-right-color:var(--pb-border)!important; }',
    '#puos-main     { background:var(--pb-bg)!important; }',
    '.puos-nav-btn        { color:var(--pb-text-dim)!important; border-left-color:transparent!important; }',
    '.puos-nav-btn:hover  { background:var(--pb-hover)!important; color:var(--pb-text-mid)!important; }',
    '.puos-nav-btn.active { background:var(--pb-purple-bg)!important; color:#c4a8ff!important; border-left-color:var(--pb-purple)!important; }',
    '.puos-card       { background:var(--pb-card)!important; border-color:var(--pb-border)!important; }',
    '.puos-card-title { color:var(--pb-purple)!important; }',
    '.puos-stat-lbl  { color:var(--pb-text-dim)!important; }',
    '.puos-stat-val  { color:var(--pb-text-full)!important; }',
    '.puos-row       { border-bottom-color:var(--pb-divider)!important; }',
    '.puos-row-lbl   { color:var(--pb-text-dim)!important; }',
    '.puos-row-val   { color:var(--pb-text-mid)!important; }',
    '.puos-row-val.ok{ color:#34d399!important; }',
    '.puos-tab-bar   { background:var(--pb-sidebar)!important; border-bottom-color:var(--pb-border)!important; }',
    '.puos-tab       { color:var(--pb-text-dim)!important; }',
    '.puos-tab:hover { color:var(--pb-text-mid)!important; }',
    '.puos-tab.active{ color:#c4a8ff!important; border-bottom-color:var(--pb-purple)!important; }',
    '.puos-badge { background:var(--pb-purple-bg)!important; color:#c4a8ff!important; }',
    '#puos-sidebar > div:first-child { border-bottom-color:var(--pb-border)!important; }',
    '#puos-sidebar > div:first-child > div:last-child { color:var(--pb-text-dim)!important; }',
    '#puos-sidebar > div:first-child > div:nth-child(2) { color:#b07ef8!important; }',
    '#puos-sidebar > div:last-child { border-top-color:var(--pb-border)!important; }',
    '#puos-sidebar > div:last-child > div:first-child { color:var(--pb-text-dim)!important; }',
    '#puos-sidebar > div:last-child > button { border-color:var(--pb-border)!important; color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#4a5568"]  { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color: #4a5568"] { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#334155"]  { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#1e293b"]  { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#64748b"]  { color:var(--pb-text-mid)!important; }',
    '#puos-main [style*="background:#0a1020"] { background:var(--pb-divider)!important; }',
    '#puos-main [style*="background:#07111e"] { background:var(--pb-sidebar)!important; }',
    '#puos-main [style*="background:#0d1117"] { background:var(--pb-card)!important; }',
    '#puos-main [style*="background:#050a14"] { background:var(--pb-bg)!important; }',
    '#puos-health-dot-widget:hover { background:var(--pb-hover)!important; border-color:var(--pb-border)!important; }',
    '#puos-hd-divider { background:var(--pb-divider)!important; }',
    '#puos-hd-tooltip { background:var(--pb-card)!important; border-color:var(--pb-border)!important; color:var(--pb-text-mid)!important; }',
    '#puos-hd-label   { color:var(--pb-text-dim)!important; }',
    '#puos-main::-webkit-scrollbar        { width:6px; }',
    '#puos-main::-webkit-scrollbar-track  { background:var(--pb-sidebar); }',
    '#puos-main::-webkit-scrollbar-thumb  { background:var(--pb-border);border-radius:3px; }',
    '#puos-main::-webkit-scrollbar-thumb:hover { background:#4a6a9a; }'
  ].join('\n');

  // ── DOM inject/remove ────────────────────────────────────────────────
  function applyBright() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = BRIGHT_CSS;
    document.head.appendChild(s);
  }

  function removeBright() {
    var el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  function applyTheme() {
    if (_isBright) applyBright(); else removeBright();
    refreshToggleRow();
  }

  // ── Public toggle API ────────────────────────────────────────────────
  window.puosThemeToggle = function() {
    _isBright = !_isBright;
    savePref();
    applyTheme();
  };

  window.puosThemeGet = function() {
    return _isBright ? 'bright' : 'dark';
  };

  // ── Cập nhật live toggle row trong Settings (nếu đang mở) ────────────
  function refreshToggleRow() {
    var row = document.getElementById('puos-theme-toggle-row');
    if (!row) return;
    row.innerHTML = buildToggleRowInner();
  }

  function buildToggleRowInner() {
    var on = _isBright;
    var dotColor  = on ? '#7c3aed' : '#334155';
    var dotBg     = on ? '#7c3aed' : '#1e293b';
    var knobLeft  = on ? '18px' : '2px';
    var trackBg   = on ? '#7c3aed55' : '#1e293b';
    var label     = on ? 'Bright Mode' : 'Classic Dark';
    var sub       = on ? 'Giao diện sáng hơn, dễ đọc' : 'Giao diện tối nguyên bản';
    return [
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1c3050">',
        '<div>',
          '<div class="puos-row-lbl">🎨 Chủ đề giao diện</div>',
          '<div style="font-size:10px;color:#4a6a8a;margin-top:2px">' + sub + '</div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:10px">',
          '<span style="font-size:11px;color:' + (on ? '#c4a8ff' : '#4a5568') + ';font-family:\'Noto Serif SC\',serif">' + label + '</span>',
          '<div onclick="puosThemeToggle()" style="width:38px;height:22px;background:' + trackBg + ';border-radius:11px;position:relative;cursor:pointer;border:1px solid ' + dotBg + ';transition:all 0.25s">',
            '<div style="position:absolute;top:2px;left:' + knobLeft + ';width:16px;height:16px;border-radius:50%;background:' + (on ? '#a78bfa' : '#334155') + ';transition:all 0.25s;box-shadow:0 1px 4px #0006"></div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  // ── Hook puosRenderSettings để inject toggle ─────────────────────────
  function hookSettings() {
    var _origRender = window.puosRenderSettings;
    if (!_origRender) return false;

    window.puosRenderSettings = function(container) {
      _origRender(container);

      // Tìm card "Giao Diện" (chứa text "GIAO DIỆN")
      setTimeout(function() {
        var titles = container.querySelectorAll('.puos-card-title');
        titles.forEach(function(t) {
          if (t.textContent.toUpperCase().indexOf('GIAO DI') !== -1) {
            var card = t.parentElement;
            if (!card) return;

            // Tạo row container rồi inject vào đầu card (sau title)
            var wrapper = document.createElement('div');
            wrapper.id = 'puos-theme-toggle-row';
            wrapper.innerHTML = buildToggleRowInner();
            t.insertAdjacentElement('afterend', wrapper);
          }
        });
      }, 0);
    };
    return true;
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    loadPref();
    applyTheme();

    // Hook settings ngay nếu đã sẵn sàng, hoặc chờ
    if (!hookSettings()) {
      var tries = 0;
      var wait = setInterval(function() {
        tries++;
        if (hookSettings()) { clearInterval(wait); return; }
        if (tries > 60) clearInterval(wait);
      }, 500);
    }

    console.log('[PUOS BrightTheme] ✨ Theme: ' + (_isBright ? 'Bright' : 'Dark') + ' — puosThemeToggle() để đổi.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

})();
