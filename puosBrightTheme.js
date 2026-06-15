(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // PUOS LIGHT THEME — Full Light Mode
  // Nền trắng/xám nhạt · chữ xanh navy đậm · viền rõ ràng
  // Toggle trong Settings > Chung > Giao Diện
  // ══════════════════════════════════════════════════════════════════════

  var STYLE_ID = 'puos-bright-theme-style';
  var SAVE_KEY = 'cgv6_puos_theme_pref';
  var _isBright = true;

  function loadPref() {
    try {
      var v = localStorage.getItem(SAVE_KEY);
      _isBright = (v !== 'dark');
    } catch(e) { _isBright = true; }
  }
  function savePref() {
    try { localStorage.setItem(SAVE_KEY, _isBright ? 'bright' : 'dark'); } catch(e) {}
  }

  // ── FULL LIGHT MODE CSS ──────────────────────────────────────────────
  var LIGHT_CSS = [
    /* Design tokens */
    ':root {',
    '  --pb-bg:        #f1f5fb;',
    '  --pb-sidebar:   #e4eaf5;',
    '  --pb-card:      #ffffff;',
    '  --pb-hover:     #dde6f7;',
    '  --pb-border:    #c8d8ee;',
    '  --pb-divider:   #dfe8f5;',
    '  --pb-text-dim:  #6880a0;',
    '  --pb-text-mid:  #3a5070;',
    '  --pb-text-full: #1a2840;',
    '  --pb-purple:    #7c3aed;',
    '  --pb-purple-lt: #ede9fe;',
    '  --pb-purple-bg: rgba(124,58,237,0.08);',
    '}',

    /* Shell & layout */
    'body.puos-mode               { background:var(--pb-bg)!important; }',
    '#puos-shell                  { background:var(--pb-bg)!important; color:var(--pb-text-full)!important; }',
    '#puos-sidebar                { background:var(--pb-sidebar)!important; border-right:1px solid var(--pb-border)!important; }',
    '#puos-main                   { background:var(--pb-bg)!important; }',

    /* Nav buttons */
    '.puos-nav-btn                { color:var(--pb-text-dim)!important; border-left:2px solid transparent!important; }',
    '.puos-nav-btn:hover          { background:var(--pb-hover)!important; color:var(--pb-text-mid)!important; }',
    '.puos-nav-btn.active         { background:var(--pb-purple-bg)!important; color:var(--pb-purple)!important; border-left-color:var(--pb-purple)!important; }',

    /* Cards */
    '.puos-card                   { background:var(--pb-card)!important; border:1px solid var(--pb-border)!important; box-shadow:0 1px 6px rgba(0,0,0,0.06)!important; }',
    '.puos-card-title             { color:var(--pb-purple)!important; }',

    /* Stats */
    '.puos-stat-lbl               { color:var(--pb-text-dim)!important; }',
    '.puos-stat-val               { color:var(--pb-text-full)!important; }',

    /* Rows */
    '.puos-row                    { border-bottom:1px solid var(--pb-divider)!important; }',
    '.puos-row-lbl                { color:var(--pb-text-mid)!important; }',
    '.puos-row-val                { color:var(--pb-text-mid)!important; }',
    '.puos-row-val.ok             { color:#059669!important; }',

    /* Tab bar */
    '.puos-tab-bar                { background:var(--pb-sidebar)!important; border-bottom:1px solid var(--pb-border)!important; }',
    '.puos-tab                    { color:var(--pb-text-dim)!important; }',
    '.puos-tab:hover              { color:var(--pb-text-mid)!important; }',
    '.puos-tab.active             { color:var(--pb-purple)!important; border-bottom-color:var(--pb-purple)!important; }',

    /* Badge */
    '.puos-badge                  { background:var(--pb-purple-lt)!important; color:var(--pb-purple)!important; }',

    /* Sidebar header */
    '#puos-sidebar > div:first-child                  { border-bottom:1px solid var(--pb-border)!important; background:var(--pb-sidebar)!important; }',
    '#puos-sidebar > div:first-child > div:nth-child(2){ color:var(--pb-purple)!important; }',
    '#puos-sidebar > div:first-child > div:last-child  { color:var(--pb-text-dim)!important; }',

    /* Sidebar footer */
    '#puos-sidebar > div:last-child                   { border-top:1px solid var(--pb-border)!important; background:var(--pb-sidebar)!important; }',
    '#puos-sidebar > div:last-child > div             { color:var(--pb-text-dim)!important; }',
    '#puos-sidebar > div:last-child > button          { border:1px solid var(--pb-border)!important; color:var(--pb-text-dim)!important; background:transparent!important; }',
    '#puos-sidebar > div:last-child > button:hover    { background:var(--pb-hover)!important; color:var(--pb-text-mid)!important; }',

    /* Panel content — override all hardcoded dark colors */
    '#puos-main [style*="color:#4a5568"]              { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#334155"]              { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#1e293b"]              { color:var(--pb-text-dim)!important; }',
    '#puos-main [style*="color:#64748b"]              { color:var(--pb-text-mid)!important; }',
    '#puos-main [style*="color:#94a3b8"]              { color:var(--pb-text-mid)!important; }',
    '#puos-main [style*="color:#e2e8f0"]              { color:var(--pb-text-full)!important; }',
    '#puos-main [style*="color:#475569"]              { color:var(--pb-text-dim)!important; }',

    /* Panel dark backgrounds → light */
    '#puos-main [style*="background:#050a14"]         { background:var(--pb-bg)!important; }',
    '#puos-main [style*="background:#070e19"]         { background:var(--pb-bg)!important; }',
    '#puos-main [style*="background:#07111e"]         { background:var(--pb-sidebar)!important; }',
    '#puos-main [style*="background:#0a0c10"]         { background:var(--pb-bg)!important; }',
    '#puos-main [style*="background:#0a1020"]         { background:var(--pb-divider)!important; }',
    '#puos-main [style*="background:#0d1117"]         { background:var(--pb-card)!important; }',
    '#puos-main [style*="background:#0d1b2e"]         { background:var(--pb-hover)!important; }',
    '#puos-main [style*="background:#1e3a5f"]         { background:#dbeafe!important; }',
    '#puos-main [style*="background:#13171f"]         { background:var(--pb-card)!important; }',
    '#puos-main [style*="background:#162033"]         { background:var(--pb-card)!important; }',

    /* Panel dark borders → light */
    '#puos-main [style*="border:1px solid #1e293b"]       { border-color:var(--pb-border)!important; }',
    '#puos-main [style*="border-bottom:1px solid #1e293b"]{ border-color:var(--pb-border)!important; }',
    '#puos-main [style*="border-top:1px solid #1e293b"]   { border-color:var(--pb-border)!important; }',
    '#puos-main [style*="border:1px solid #0a1020"]       { border-color:var(--pb-divider)!important; }',

    /* Page header text in panels */
    '#puos-main h1                { color:var(--pb-text-full)!important; }',
    '#puos-main h2                { color:var(--pb-text-full)!important; }',
    '#puos-main h3                { color:var(--pb-text-full)!important; }',

    /* Buttons in panels (dark bg buttons) */
    '#puos-main button[style*="background:#0d1b2e"]   { background:var(--pb-hover)!important; color:var(--pb-text-mid)!important; border-color:var(--pb-border)!important; }',

    /* Health dot widget */
    '#puos-health-dot-widget:hover { background:var(--pb-hover)!important; border-color:var(--pb-border)!important; }',
    '#puos-hd-divider             { background:var(--pb-border)!important; }',
    '#puos-hd-tooltip             { background:var(--pb-card)!important; border-color:var(--pb-border)!important; color:var(--pb-text-mid)!important; box-shadow:0 4px 20px rgba(0,0,0,0.15)!important; }',
    '#puos-hd-label               { color:var(--pb-text-dim)!important; }',

    /* Scrollbar */
    '#puos-main::-webkit-scrollbar        { width:6px; }',
    '#puos-main::-webkit-scrollbar-track  { background:var(--pb-sidebar); }',
    '#puos-main::-webkit-scrollbar-thumb  { background:var(--pb-border);border-radius:3px; }',
    '#puos-main::-webkit-scrollbar-thumb:hover{ background:#a0b4cc; }'
  ].join('\n');

  // ── DOM inject/remove ────────────────────────────────────────────────
  function applyBright() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = LIGHT_CSS;
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

  // ── Public API ───────────────────────────────────────────────────────
  window.puosThemeToggle = function() {
    _isBright = !_isBright;
    savePref();
    applyTheme();
  };
  window.puosThemeGet = function() { return _isBright ? 'bright' : 'dark'; };

  // ── Toggle row trong Settings ────────────────────────────────────────
  function refreshToggleRow() {
    var row = document.getElementById('puos-theme-toggle-row');
    if (row) row.innerHTML = buildToggleRowHTML();
  }

  function buildToggleRowHTML() {
    var on = _isBright;
    return [
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + (on ? '#dfe8f5' : '#1c3050') + '">',
        '<div>',
          '<div class="puos-row-lbl">🎨 Chủ đề giao diện</div>',
          '<div style="font-size:10px;color:' + (on ? '#6880a0' : '#4a6a8a') + ';margin-top:2px">' + (on ? 'Light Mode — nền sáng, chữ tối' : 'Dark Mode — giao diện tối nguyên bản') + '</div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:10px">',
          '<span style="font-size:11px;color:' + (on ? '#7c3aed' : '#4a5568') + ';font-family:\'Noto Serif SC\',serif;font-weight:600">' + (on ? '☀️ Light' : '🌑 Dark') + '</span>',
          '<div onclick="puosThemeToggle()" title="Click để đổi theme" style="width:42px;height:24px;background:' + (on ? '#7c3aed' : '#1e293b') + ';border-radius:12px;position:relative;cursor:pointer;border:1px solid ' + (on ? '#6d28d9' : '#334155') + ';transition:all 0.25s;flex-shrink:0">',
            '<div style="position:absolute;top:3px;left:' + (on ? '20px' : '3px') + ';width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.25s;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  // ── Hook puosRenderSettings ──────────────────────────────────────────
  function hookSettings() {
    if (typeof window.puosRenderSettings !== 'function') return false;
    var _orig = window.puosRenderSettings;
    window.puosRenderSettings = function(container) {
      _orig(container);
      setTimeout(function() {
        var titles = container.querySelectorAll('.puos-card-title');
        for (var i = 0; i < titles.length; i++) {
          if (titles[i].textContent.toUpperCase().indexOf('GIAO DI') !== -1) {
            var wrapper = document.createElement('div');
            wrapper.id = 'puos-theme-toggle-row';
            wrapper.innerHTML = buildToggleRowHTML();
            titles[i].insertAdjacentElement('afterend', wrapper);
            break;
          }
        }
      }, 0);
    };
    return true;
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    loadPref();
    applyTheme();
    if (!hookSettings()) {
      var t = 0;
      var iv = setInterval(function() {
        if (hookSettings() || ++t > 60) clearInterval(iv);
      }, 500);
    }
    console.log('[PUOS Theme] ' + (_isBright ? '☀️ Light Mode' : '🌑 Dark Mode') + ' — puosThemeToggle() để đổi.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

})();
