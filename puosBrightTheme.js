(function() {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // PUOS BRIGHT THEME — CSS Override Layer
  // Làm sáng toàn bộ PUOS Shell mà KHÔNG chỉnh sửa file gốc
  // Dùng !important để ghi đè cả inline styles lẫn CSS classes cũ
  // ══════════════════════════════════════════════════════════════════════

  var STYLE_ID = 'puos-bright-theme-style';

  function injectBrightTheme() {
    if (document.getElementById(STYLE_ID)) return;

    var s = document.createElement('style');
    s.id = STYLE_ID;

    s.textContent = [

      /* ── CSS VARIABLES (design tokens) ── */
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

      /* ── SHELL BACKGROUNDS ── */
      'body.puos-mode { background:var(--pb-bg)!important; }',
      '#puos-shell    { background:var(--pb-bg)!important;    color:var(--pb-text-full)!important; }',
      '#puos-sidebar  { background:var(--pb-sidebar)!important; border-right-color:var(--pb-border)!important; }',
      '#puos-main     { background:var(--pb-bg)!important; }',

      /* ── NAV BUTTONS ── */
      '.puos-nav-btn        { color:var(--pb-text-dim)!important;   border-left-color:transparent!important; }',
      '.puos-nav-btn:hover  { background:var(--pb-hover)!important; color:var(--pb-text-mid)!important; }',
      '.puos-nav-btn.active { background:var(--pb-purple-bg)!important; color:#c4a8ff!important; border-left-color:var(--pb-purple)!important; }',

      /* ── CARDS ── */
      '.puos-card       { background:var(--pb-card)!important;    border-color:var(--pb-border)!important; }',
      '.puos-card-title { color:var(--pb-purple)!important; }',

      /* ── STAT / ROW LABELS ── */
      '.puos-stat-lbl  { color:var(--pb-text-dim)!important; }',
      '.puos-stat-val  { color:var(--pb-text-full)!important; }',
      '.puos-row       { border-bottom-color:var(--pb-divider)!important; }',
      '.puos-row-lbl   { color:var(--pb-text-dim)!important; }',
      '.puos-row-val   { color:var(--pb-text-mid)!important; }',
      '.puos-row-val.ok{ color:#34d399!important; }',

      /* ── TAB BAR ── */
      '.puos-tab-bar   { background:var(--pb-sidebar)!important; border-bottom-color:var(--pb-border)!important; }',
      '.puos-tab       { color:var(--pb-text-dim)!important; }',
      '.puos-tab:hover { color:var(--pb-text-mid)!important; }',
      '.puos-tab.active{ color:#c4a8ff!important; border-bottom-color:var(--pb-purple)!important; }',

      /* ── BADGE ── */
      '.puos-badge { background:var(--pb-purple-bg)!important; color:#c4a8ff!important; }',

      /* ── SIDEBAR FOOTER & HEADER (inline-styled → !important wins) ── */
      /* Header border */
      '#puos-sidebar > div:first-child { border-bottom-color:var(--pb-border)!important; }',
      /* "Personal Universe OS" subtitle — was #1e293b (invisible!) */
      '#puos-sidebar > div:first-child > div:last-child { color:var(--pb-text-dim)!important; }',
      /* "PUOS" wordmark */
      '#puos-sidebar > div:first-child > div:nth-child(2) { color:#b07ef8!important; }',
      /* Footer container */
      '#puos-sidebar > div:last-child { border-top-color:var(--pb-border)!important; }',
      /* Year / NPC counter — was #1e293b (invisible!) */
      '#puos-sidebar > div:last-child > div:first-child { color:var(--pb-text-dim)!important; }',
      /* Classic Mode button */
      '#puos-sidebar > div:last-child > button { border-color:var(--pb-border)!important; color:var(--pb-text-dim)!important; }',

      /* ── PANEL PAGE HEADERS (hardcoded inline gray text in panels) ── */
      /* Breadcrumb labels like "SETTINGS", "MY UNIVERSE", etc. */
      '#puos-main [style*="color:#4a5568"]  { color:var(--pb-text-dim)!important; }',
      '#puos-main [style*="color: #4a5568"] { color:var(--pb-text-dim)!important; }',
      '#puos-main [style*="color:#334155"]  { color:var(--pb-text-dim)!important; }',
      '#puos-main [style*="color:#1e293b"]  { color:var(--pb-text-dim)!important; }',
      '#puos-main [style*="color:#64748b"]  { color:var(--pb-text-mid)!important; }',

      /* ── INNER CARD BACKGROUNDS (inline style="#0a1020" etc.) ── */
      '#puos-main [style*="background:#0a1020"] { background:var(--pb-divider)!important; }',
      '#puos-main [style*="background:#07111e"] { background:var(--pb-sidebar)!important; }',
      '#puos-main [style*="background:#0d1117"] { background:var(--pb-card)!important; }',
      '#puos-main [style*="background:#13171f"] { background:var(--pb-card)!important; }',
      '#puos-main [style*="background:#0a0c10"] { background:var(--pb-bg)!important; }',
      '#puos-main [style*="background:#050a14"] { background:var(--pb-bg)!important; }',

      /* ── BORDER OVERRIDES (inline border colors) ── */
      '#puos-main [style*="border:1px solid #1e293b"]      { border-color:var(--pb-border)!important; }',
      '#puos-main [style*="border-bottom:1px solid #1e293b"]{ border-color:var(--pb-border)!important; }',

      /* ── HEALTH DOT widget brightening ── */
      '#puos-health-dot-widget { border-color:transparent!important; }',
      '#puos-health-dot-widget:hover { background:var(--pb-hover)!important; border-color:var(--pb-border)!important; }',
      '#puos-hd-divider { background:var(--pb-divider)!important; }',
      '#puos-hd-tooltip { background:var(--pb-card)!important; border-color:var(--pb-border)!important; color:var(--pb-text-mid)!important; }',
      '#puos-hd-label   { color:var(--pb-text-dim)!important; }',

      /* ── SCROLLBAR (Webkit) ── */
      '#puos-main::-webkit-scrollbar        { width:6px; }',
      '#puos-main::-webkit-scrollbar-track  { background:var(--pb-sidebar); }',
      '#puos-main::-webkit-scrollbar-thumb  { background:var(--pb-border);border-radius:3px; }',
      '#puos-main::-webkit-scrollbar-thumb:hover { background:#4a6a9a; }'

    ].join('\n');

    document.head.appendChild(s);
    console.log('[PUOS BrightTheme] ✨ Giao diện sáng hơn đã áp dụng.');
  }

  function init() {
    injectBrightTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

})();
