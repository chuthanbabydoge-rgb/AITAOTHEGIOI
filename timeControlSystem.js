/* ================================================================
   TIME CONTROL SYSTEM v1.0
   - Pause / Resume
   - Speed: 1x / 10x / 100x / 1000x
   - Timeline Mode (chỉ sự kiện lớn)
   - History Replay (xem lại theo năm)
   - Family Viewer (cây gia phả)
   - NPC Inspector (cha mẹ, vợ chồng, con cái, gia tộc, tài sản, lịch sử)
   - Auto Focus (lập quốc, đế quốc, boss)
   File: timeControlSystem.js
   ================================================================ */

// ================================================================
// CONSTANTS
// ================================================================

// Tốc độ thực (ms mỗi năm mô phỏng)
const TC_SPEEDS = {
  1:    2000,   // 1x  — 1 năm mỗi 2 giây (dễ theo dõi)
  10:   500,    // 10x — 1 năm mỗi 0.5s
  100:  100,    // 100x
  1000: 16,     // 1000x — ~60fps interval
};

// Turbo mode: batch nhiều tick simulateWorld mỗi frame
// key = tên mode, value = { interval(ms), batchSize(ticks/frame) }
const TC_TURBO_MODES = {
  10000: { interval: 16, batchSize: 10,  label: '10,000×' },
  max:   { interval: 16, batchSize: 50,  label: 'MAX ⚡'  },
};

// Các loại sự kiện "lớn" cho Timeline Mode
const TC_BIG_EVENTS = new Set([
  'marriage',       // kết hôn
  'civilization',   // lập gia tộc, lập quốc, đế quốc
  'sect',           // lập tông môn
  'war',            // chiến tranh
  'boss',           // boss xuất hiện / boss bị tiêu diệt
  'era',            // kỷ nguyên mới
]);

// Keyword filter để lọc thêm trong sự kiện civilization
const TC_SMALL_CIV_KEYWORDS = [
  'truyền thừa',     // dynasty milestone — không phải sự kiện lớn mỗi lần
];

// ================================================================
// STATE
// ================================================================

let tcCurrentSpeed    = 1;        // 1 | 10 | 100 | 1000
let tcPaused          = false;
let tcTimelineMode    = false;    // true = chỉ hiện sự kiện lớn trong feed
let tcAutoFocus       = true;     // tự động focus khi có sự kiện quan trọng
let tcReplayYear      = null;     // null = realtime, số = đang xem replay tại năm đó
let tcReplaySnapshot  = null;     // snapshot worldHistory tại thời điểm replay
let tcAutoFocusLocked = false;    // tránh spam focus
let tcTurboMode       = null;     // null | 10000 | 'max' — batch speed mode
let tcTurboTarget     = null;     // số năm cần đạt (khi dùng "Skip to year")

// ================================================================
// INJECT CSS
// ================================================================

function tcInjectCSS() {
  if (document.getElementById('tc-style')) return;
  const s = document.createElement('style');
  s.id = 'tc-style';
  s.textContent = `
/* ──── TIME CONTROL BAR ──── */
#tc-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 9000;
  background: linear-gradient(0deg, rgba(10,13,18,0.98) 0%, rgba(10,13,18,0.92) 100%);
  border-top: 1px solid rgba(250,204,21,0.18);
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  height: 48px;
  backdrop-filter: blur(12px);
  user-select: none;
}

/* Pause Button */
#tc-pause {
  display: flex; align-items: center; justify-content: center;
  width: 56px; height: 48px;
  background: none; border: none; border-right: 1px solid rgba(255,255,255,0.07);
  color: #facc15; font-size: 20px; cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
#tc-pause:hover { background: rgba(250,204,21,0.1); }
#tc-pause.paused { color: #fb923c; }

/* Speed Buttons */
#tc-speeds {
  display: flex; align-items: center;
  border-right: 1px solid rgba(255,255,255,0.07);
  padding: 0 6px; gap: 3px; flex-shrink: 0;
}
.tc-speed-btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 42px; height: 28px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  color: rgba(255,255,255,0.5);
  font-size: 11px; font-weight: 600;
  cursor: pointer; transition: all 0.12s;
}
.tc-speed-btn:hover { background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.3); color: #facc15; }
.tc-speed-btn.active { background: rgba(250,204,21,0.18); border-color: rgba(250,204,21,0.5); color: #facc15; }

/* Turbo Speed Buttons */
.tc-speed-btn.turbo {
  background: rgba(251,113,133,0.06);
  border-color: rgba(251,113,133,0.25);
  color: rgba(251,113,133,0.6);
}
.tc-speed-btn.turbo:hover { background: rgba(251,113,133,0.15); border-color: rgba(251,113,133,0.5); color: #fb7185; }
.tc-speed-btn.turbo.active { background: rgba(251,113,133,0.22); border-color: rgba(251,113,133,0.65); color: #fb7185; box-shadow: 0 0 8px rgba(251,113,133,0.25); }

/* Turbo Progress Bar */
#tc-turbo-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.05);
  z-index: 9999;
  display: none;
}
#tc-turbo-fill {
  height: 100%;
  background: linear-gradient(90deg, #fb7185, #f43f5e);
  width: 0%;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(244,63,94,0.6);
}
#tc-turbo-overlay {
  position: fixed;
  top: 8px; left: 50%; transform: translateX(-50%);
  z-index: 9999;
  background: rgba(10,13,18,0.9);
  border: 1px solid rgba(251,113,133,0.4);
  border-radius: 20px;
  padding: 5px 16px;
  display: none;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #fb7185;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
#tc-turbo-overlay.visible { display: flex; }
#tc-turbo-bar.visible { display: block; }
#tc-turbo-info { font-variant-numeric: tabular-nums; }
.tc-turbo-stop {
  background: rgba(251,113,133,0.15);
  border: 1px solid rgba(251,113,133,0.4);
  border-radius: 10px;
  color: #fb7185;
  font-size: 10px;
  padding: 2px 8px;
  cursor: pointer;
  transition: background 0.12s;
}
.tc-turbo-stop:hover { background: rgba(251,113,133,0.3); }

/* Skip to Year panel */
#tc-skip-panel {
  display: flex; align-items: center; gap: 5px;
  padding: 0 8px; border-right: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
#tc-skip-input {
  width: 64px; height: 24px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  color: rgba(255,255,255,0.75);
  font-size: 11px; text-align: center;
  padding: 0 4px;
}
#tc-skip-input:focus { outline: none; border-color: rgba(251,113,133,0.5); }
.tc-skip-go {
  height: 24px; padding: 0 8px;
  background: rgba(251,113,133,0.12);
  border: 1px solid rgba(251,113,133,0.35);
  border-radius: 4px;
  color: #fb7185; font-size: 10px; font-weight: 600;
  cursor: pointer; transition: background 0.12s; white-space: nowrap;
}
.tc-skip-go:hover { background: rgba(251,113,133,0.25); }

/* Year display */
#tc-year-display {
  display: flex; align-items: center; gap: 6px;
  padding: 0 12px; border-right: 1px solid rgba(255,255,255,0.07);
  font-size: 12px; color: rgba(255,255,255,0.6); flex-shrink: 0;
}
#tc-year-display .tc-year-num {
  font-size: 15px; font-weight: 700; color: #facc15;
  font-variant-numeric: tabular-nums;
}

/* Timeline Mode Toggle */
#tc-timeline-toggle {
  display: flex; align-items: center; gap: 6px;
  padding: 0 12px; border-right: 1px solid rgba(255,255,255,0.07);
  cursor: pointer; font-size: 11px; color: rgba(255,255,255,0.5);
  height: 48px; transition: color 0.15s;
  flex-shrink: 0;
}
#tc-timeline-toggle:hover { color: rgba(255,255,255,0.8); }
#tc-timeline-toggle.active { color: #4ade80; }
.tc-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.2); transition: background 0.15s;
}
#tc-timeline-toggle.active .tc-dot { background: #4ade80; box-shadow: 0 0 6px #4ade8088; }

/* Auto Focus Toggle */
#tc-autofocus-toggle {
  display: flex; align-items: center; gap: 6px;
  padding: 0 12px; border-right: 1px solid rgba(255,255,255,0.07);
  cursor: pointer; font-size: 11px; color: rgba(255,255,255,0.5);
  height: 48px; transition: color 0.15s; flex-shrink: 0;
}
#tc-autofocus-toggle:hover { color: rgba(255,255,255,0.8); }
#tc-autofocus-toggle.active { color: #60a5fa; }
#tc-autofocus-toggle.active .tc-dot { background: #60a5fa; box-shadow: 0 0 6px #60a5fa88; }

/* Replay Section */
#tc-replay {
  display: flex; align-items: center; gap: 6px;
  padding: 0 10px; border-right: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
#tc-replay-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }
.tc-replay-btn {
  padding: 2px 9px; height: 26px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px; color: rgba(255,255,255,0.5); font-size: 10px;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.tc-replay-btn:hover { background: rgba(96,165,250,0.12); border-color: rgba(96,165,250,0.4); color: #60a5fa; }
.tc-replay-btn.active { background: rgba(96,165,250,0.18); border-color: rgba(96,165,250,0.5); color: #60a5fa; }

/* Live Event Feed */
#tc-event-feed {
  flex: 1; overflow: hidden; padding: 0 10px;
  display: flex; align-items: center; gap: 0;
}
.tc-feed-item {
  font-size: 11px; color: rgba(255,255,255,0.6);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  animation: tcFeedSlide 0.4s ease-out;
  max-width: 100%;
}
.tc-feed-item .tc-feed-year { color: rgba(250,204,21,0.6); margin-right: 6px; }
.tc-feed-item .tc-feed-icon { margin-right: 4px; }
.tc-feed-item.big { color: #facc15; font-weight: 600; }
@keyframes tcFeedSlide {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Auto Focus Overlay */
#tc-focus-overlay {
  position: fixed;
  inset: 0;
  z-index: 8500;
  pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.4s;
}
#tc-focus-overlay.visible { opacity: 1; pointer-events: auto; }
#tc-focus-card {
  background: linear-gradient(135deg, rgba(10,13,18,0.97), rgba(15,19,26,0.97));
  border: 1px solid rgba(250,204,21,0.3);
  border-radius: 16px;
  padding: 32px 40px;
  max-width: 480px; width: 90%;
  text-align: center;
  box-shadow: 0 0 60px rgba(250,204,21,0.12);
  animation: tcFocusPop 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes tcFocusPop {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
#tc-focus-icon { font-size: 52px; margin-bottom: 12px; }
#tc-focus-title { font-size: 22px; font-weight: 700; color: #facc15; margin-bottom: 8px; }
#tc-focus-year { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
#tc-focus-desc { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.6; margin-bottom: 20px; }
#tc-focus-close {
  padding: 8px 24px; background: rgba(250,204,21,0.12);
  border: 1px solid rgba(250,204,21,0.35); border-radius: 8px;
  color: #facc15; font-size: 13px; cursor: pointer;
  transition: background 0.15s;
}
#tc-focus-close:hover { background: rgba(250,204,21,0.22); }

/* NPC Inspector Overlay */
#tc-npc-inspector {
  position: fixed;
  inset: 0;
  z-index: 9100;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.25s;
}
#tc-npc-inspector.visible { opacity: 1; pointer-events: auto; }
#tc-npc-inner {
  background: linear-gradient(135deg, #0f141c, #141a24);
  border: 1px solid rgba(250,204,21,0.2);
  border-radius: 16px;
  width: min(700px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
  animation: tcFocusPop 0.3s ease;
}
.tc-npc-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.07);
}
.tc-npc-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(250,204,21,0.1); border: 2px solid rgba(250,204,21,0.3);
  display: flex; align-items: center; justify-content: center; font-size: 26px;
  flex-shrink: 0;
}
.tc-npc-name { font-size: 20px; font-weight: 700; color: #facc15; }
.tc-npc-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 3px; }
.tc-insp-tabs {
  display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap;
}
.tc-insp-tab {
  padding: 5px 12px; border-radius: 6px; font-size: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.12s;
}
.tc-insp-tab:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.25); }
.tc-insp-tab.active { background: rgba(250,204,21,0.12); border-color: rgba(250,204,21,0.4); color: #facc15; }
.tc-insp-content { display: none; }
.tc-insp-content.active { display: block; }

.tc-stat-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap: 8px; margin-bottom: 12px; }
.tc-stat-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px; padding: 8px 10px;
}
.tc-stat-label { font-size: 9px; letter-spacing: 1px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 3px; }
.tc-stat-value { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); }

.tc-rel-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.03); margin-bottom: 6px;
  cursor: pointer; transition: background 0.12s; border: 1px solid rgba(255,255,255,0.06);
}
.tc-rel-item:hover { background: rgba(255,255,255,0.07); }
.tc-rel-badge {
  font-size: 10px; padding: 2px 7px; border-radius: 4px; flex-shrink: 0;
  font-weight: 600;
}
.tc-rel-parent  { background: rgba(96,165,250,0.15); color: #60a5fa; }
.tc-rel-spouse  { background: rgba(244,114,182,0.15); color: #f472b6; }
.tc-rel-child   { background: rgba(74,222,128,0.15); color: #4ade80; }
.tc-rel-sibling { background: rgba(167,139,250,0.15); color: #a78bfa; }

/* Family Tree */
.tc-tree-gen {
  margin-bottom: 16px;
}
.tc-tree-gen-label {
  font-size: 10px; letter-spacing: 1.5px; color: rgba(255,255,255,0.3);
  text-transform: uppercase; margin-bottom: 8px; padding-left: 4px;
}
.tc-tree-members { display: flex; flex-wrap: wrap; gap: 8px; }
.tc-tree-member {
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 10px 12px; min-width: 80px;
  cursor: pointer; transition: all 0.15s; text-align: center;
}
.tc-tree-member:hover { border-color: rgba(250,204,21,0.3); background: rgba(250,204,21,0.05); }
.tc-tree-member.is-focus { border-color: rgba(250,204,21,0.5); background: rgba(250,204,21,0.08); }
.tc-tree-member.dead { opacity: 0.45; }
.tc-tree-avatar { font-size: 22px; margin-bottom: 4px; }
.tc-tree-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 2px; }
.tc-tree-realm { font-size: 9px; color: rgba(255,255,255,0.4); }
.tc-tree-connector { font-size: 18px; color: rgba(255,255,255,0.15); text-align: center; margin: 4px 0; }

/* History timeline in inspector */
.tc-bio-item { display: flex; gap: 10px; margin-bottom: 10px; }
.tc-bio-year {
  font-size: 10px; color: rgba(250,204,21,0.6); font-weight: 600;
  min-width: 50px; flex-shrink: 0; padding-top: 1px;
  font-variant-numeric: tabular-nums;
}
.tc-bio-event { font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.5; }

/* History Replay Banner */
#tc-replay-banner {
  position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
  z-index: 8900;
  background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.35);
  border-radius: 24px; padding: 6px 20px;
  display: none; align-items: center; gap: 10px;
  font-size: 12px; color: #60a5fa; pointer-events: none;
}
#tc-replay-banner.visible { display: flex; }

/* Bottom padding to prevent content going under the bar */
.main-content { padding-bottom: 56px !important; }

/* Close button in inspectors */
.tc-close-btn {
  background: none; border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px; color: rgba(255,255,255,0.5);
  padding: 4px 12px; font-size: 12px; cursor: pointer;
  transition: all 0.12s; float: right; margin-bottom: 4px;
}
.tc-close-btn:hover { border-color: rgba(248,113,113,0.5); color: #f87171; }

/* Responsive */
@media (max-width: 600px) {
  #tc-replay { display: none; }
  #tc-autofocus-toggle span:last-child { display: none; }
  #tc-timeline-toggle span:last-child { display: none; }
}
  `;
  document.head.appendChild(s);
}

// ================================================================
// INJECT DOM
// ================================================================

function tcInjectDOM() {
  if (document.getElementById('tc-bar')) return;

  // ── Bottom Bar ──
  const bar = document.createElement('div');
  bar.id = 'tc-bar';
  bar.innerHTML = `
    <!-- Pause Button -->
    <button id="tc-pause" title="Tạm dừng / Tiếp tục (Space)" onclick="tcTogglePause()">⏸</button>

    <!-- Speed Buttons -->
    <div id="tc-speeds">
      <button class="tc-speed-btn active" data-speed="1"   onclick="tcSetSpeed(1)">1×</button>
      <button class="tc-speed-btn"        data-speed="10"  onclick="tcSetSpeed(10)">10×</button>
      <button class="tc-speed-btn"        data-speed="100" onclick="tcSetSpeed(100)">100×</button>
      <button class="tc-speed-btn"        data-speed="1000" onclick="tcSetSpeed(1000)">1000×</button>
      <button class="tc-speed-btn turbo"  data-speed="10000" onclick="tcSetTurbo(10000)">10K×</button>
      <button class="tc-speed-btn turbo"  data-speed="max"   onclick="tcSetTurbo('max')">MAX⚡</button>
    </div>

    <!-- Skip to Year -->

    <!-- Skip to Year -->
    <div id="tc-skip-panel">
      <span style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:.5px">ĐẾN NĂM</span>
      <input id="tc-skip-input" type="number" min="1" placeholder="…"
        onkeydown="if(event.key==='Enter')tcSkipToYear()" />
      <button class="tc-skip-go" onclick="tcSkipToYear()">→ Go</button>
    </div>

    <!-- Year Display -->
    <div id="tc-year-display">
      📅 Năm <span id="tc-year-num" class="tc-year-num">0</span>
    </div>

    <!-- Timeline Mode -->
    <div id="tc-timeline-toggle" onclick="tcToggleTimelineMode()" title="Timeline Mode — chỉ hiện sự kiện lớn">
      <div class="tc-dot"></div>
      <span>Timeline</span>
    </div>

    <!-- Auto Focus -->
    <div id="tc-autofocus-toggle" class="active" onclick="tcToggleAutoFocus()" title="Auto Focus — tự focus vào sự kiện lớn">
      <div class="tc-dot" style="background:#60a5fa;box-shadow:0 0 6px #60a5fa88"></div>
      <span>Auto Focus</span>
    </div>

    <!-- Replay -->
    <div id="tc-replay">
      <span id="tc-replay-label">Replay:</span>
      <button class="tc-replay-btn" onclick="tcJumpReplayYear(0)">Đầu</button>
      <button class="tc-replay-btn" id="tc-rb-1"   onclick="tcReplayToYear('q1')">Năm ¼</button>
      <button class="tc-replay-btn" id="tc-rb-2"   onclick="tcReplayToYear('half')">½</button>
      <button class="tc-replay-btn" id="tc-rb-3"   onclick="tcReplayToYear('q3')">¾</button>
      <button class="tc-replay-btn active" onclick="tcReplayLive()">🔴 Live</button>
    </div>

    <!-- Live Event Feed -->
    <div id="tc-event-feed">
      <div class="tc-feed-item" id="tc-feed-text"><span style="color:rgba(255,255,255,0.25);font-size:11px">Thiên Đạo đang quan sát...</span></div>
    </div>
  `;
  document.body.appendChild(bar);

  // ── Turbo Progress Bar (top of screen) ──
  const turboBar = document.createElement('div');
  turboBar.id = 'tc-turbo-bar';
  turboBar.innerHTML = `<div id="tc-turbo-fill"></div>`;
  document.body.appendChild(turboBar);

  // ── Turbo Overlay Info ──
  const turboOverlay = document.createElement('div');
  turboOverlay.id = 'tc-turbo-overlay';
  turboOverlay.innerHTML = `
    <span>⚡ TURBO</span>
    <span id="tc-turbo-info">Năm 0</span>
    <span id="tc-turbo-target-info" style="opacity:.5"></span>
    <button class="tc-turbo-stop" onclick="tcStopTurbo()">■ Dừng</button>
  `;
  document.body.appendChild(turboOverlay);

  // ── Focus Overlay ──
  const overlay = document.createElement('div');
  overlay.id = 'tc-focus-overlay';
  overlay.innerHTML = `
    <div id="tc-focus-card">
      <div id="tc-focus-icon">🌟</div>
      <div id="tc-focus-title"></div>
      <div id="tc-focus-year"></div>
      <div id="tc-focus-desc"></div>
      <button id="tc-focus-close" onclick="tcCloseFocus()">Tiếp tục quan sát →</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Replay Banner ──
  const banner = document.createElement('div');
  banner.id = 'tc-replay-banner';
  banner.innerHTML = `⏪ Đang xem lịch sử — <strong id="tc-replay-yr-text">Năm 0</strong> <span style="opacity:.5">| Click "Live" để về hiện tại</span>`;
  document.body.appendChild(banner);

  // ── NPC Inspector ──
  const inspector = document.createElement('div');
  inspector.id = 'tc-npc-inspector';
  inspector.innerHTML = `<div id="tc-npc-inner"></div>`;
  inspector.addEventListener('click', (e) => {
    if (e.target === inspector) tcCloseInspector();
  });
  document.body.appendChild(inspector);
}

// ================================================================
// PAUSE / RESUME
// ================================================================

function tcTogglePause() {
  tcPaused = !tcPaused;
  const btn = document.getElementById('tc-pause');
  if (tcPaused) {
    clearInterval(window.simInterval);
    if (btn) { btn.textContent = '▶'; btn.classList.add('paused'); btn.title = 'Tiếp tục (Space)'; }
    tcFeedUpdate('⏸ Simulation tạm dừng.', false);
    // Sync with existing toggle button if present
    const old = document.getElementById('simToggle');
    if (old) { old.textContent = '▶ Tiếp Tục'; old.classList.add('paused'); }
  } else {
    tcApplySpeed(tcCurrentSpeed);
    if (btn) { btn.textContent = '⏸'; btn.classList.remove('paused'); btn.title = 'Tạm dừng (Space)'; }
    // Sync with existing toggle button if present
    const old = document.getElementById('simToggle');
    if (old) { old.textContent = '⏸ Tạm Dừng'; old.classList.remove('paused'); }
  }
  window.simRunning = !tcPaused;
}

// Keyboard shortcut: Space
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    e.preventDefault();
    tcTogglePause();
  }
  if (e.code === 'Escape') {
    tcCloseFocus();
    tcCloseInspector();
  }
});

// ================================================================
// SPEED CONTROL
// ================================================================

function tcSetSpeed(speed) {
  tcCurrentSpeed = speed;
  // Update button states
  document.querySelectorAll('.tc-speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
  });
  if (!tcPaused) tcApplySpeed(speed);
  // Also sync old simSpeed select if exists
  const sel = document.getElementById('simSpeed');
  if (sel) sel.value = TC_SPEEDS[speed];
  tcFeedUpdate(`⚡ Tốc độ ${speed}×`, false);
}

function tcApplySpeed(speed) {
  clearInterval(window.simInterval);
  const ms = TC_SPEEDS[speed] || 2000;
  window.simInterval = setInterval(tcWrappedSimulate, ms);
}

// ================================================================
// TURBO MODE — batch ticks per frame
// ================================================================

function tcSetTurbo(mode) {
  // Deselect normal speed buttons
  document.querySelectorAll('.tc-speed-btn').forEach(btn => btn.classList.remove('active'));
  const turboBtn = document.querySelector(`.tc-speed-btn[data-speed="${mode}"]`);
  if (turboBtn) turboBtn.classList.add('active');

  tcTurboMode = mode;
  tcTurboTarget = null;
  tcPaused = false;
  window.simRunning = true;

  // Disable auto-focus during turbo (would cause spam pauses)
  const afWasOn = tcAutoFocus;
  if (afWasOn) { tcAutoFocus = false; document.getElementById('tc-autofocus-toggle')?.classList.remove('active'); }
  turboBtn && (turboBtn.dataset.afWas = afWasOn ? '1' : '0');

  const cfg = TC_TURBO_MODES[mode];
  tcFeedUpdate(`⚡ Turbo ${cfg.label} — xử lý ${cfg.batchSize} năm/frame`, false);

  // Show overlay
  document.getElementById('tc-turbo-overlay')?.classList.add('visible');
  document.getElementById('tc-turbo-bar')?.classList.add('visible');

  // Stop any normal interval
  clearInterval(window.simInterval);
  window.simInterval = null;

  // Use requestAnimationFrame for batch ticks
  tcTurboLoop();
}

function tcTurboLoop() {
  if (tcTurboMode === null || tcPaused) return;

  const cfg = TC_TURBO_MODES[tcTurboMode];
  if (!cfg) return;

  const batch = cfg.batchSize;
  for (let i = 0; i < batch; i++) {
    if (tcTurboTarget !== null && (window.year || 0) >= tcTurboTarget) {
      tcStopTurbo(true);
      return;
    }
    if (typeof simulateWorld === 'function') simulateWorld();
    tcOnSimTick();
  }

  // Update overlay info
  const yr = window.year || 0;
  const infoEl = document.getElementById('tc-turbo-info');
  if (infoEl) infoEl.textContent = `Năm ${yr.toLocaleString()}`;

  if (tcTurboTarget !== null) {
    const pct = Math.min(100, Math.round(((yr - tcTurboStartYear) / (tcTurboTarget - tcTurboStartYear)) * 100));
    const fillEl = document.getElementById('tc-turbo-fill');
    if (fillEl) fillEl.style.width = pct + '%';
    const tgtEl = document.getElementById('tc-turbo-target-info');
    if (tgtEl) tgtEl.textContent = `→ Năm ${tcTurboTarget.toLocaleString()} (${pct}%)`;
  }

  window.simInterval = setTimeout(() => requestAnimationFrame(tcTurboLoop), cfg.interval);
}

let tcTurboStartYear = 0;

function tcStopTurbo(reached = false) {
  tcTurboMode = null;
  tcTurboTarget = null;
  clearTimeout(window.simInterval);
  window.simInterval = null;

  // Restore auto-focus if it was on before
  const activeBtn = document.querySelector('.tc-speed-btn.turbo.active');
  if (activeBtn?.dataset.afWas === '1') {
    tcAutoFocus = true;
    document.getElementById('tc-autofocus-toggle')?.classList.add('active');
  }

  // Hide overlay & bar
  document.getElementById('tc-turbo-overlay')?.classList.remove('visible');
  document.getElementById('tc-turbo-bar')?.classList.remove('visible');
  const fill = document.getElementById('tc-turbo-fill');
  if (fill) fill.style.width = '0%';

  // Return to 1000x
  tcSetSpeed(1000);

  const yr = window.year || 0;
  const msg = reached
    ? `✅ Đã đến Năm ${yr.toLocaleString()} — Turbo hoàn thành`
    : `⏹ Turbo dừng tại Năm ${yr.toLocaleString()}`;
  tcFeedUpdate(msg, false);
}

// ================================================================
// SKIP TO YEAR
// ================================================================

function tcSkipToYear() {
  const input = document.getElementById('tc-skip-input');
  if (!input) return;
  const target = parseInt(input.value);
  const current = window.year || 0;
  if (isNaN(target) || target <= current) {
    tcFeedUpdate(`⚠️ Nhập năm lớn hơn năm hiện tại (${current})`, false);
    return;
  }
  input.value = '';

  tcTurboStartYear = current;
  tcTurboTarget = target;

  tcFeedUpdate(`⚡ Nhảy đến Năm ${target.toLocaleString()}…`, false);
  const fill = document.getElementById('tc-turbo-fill');
  if (fill) fill.style.width = '0%';

  // Use max batch for fastest skip
  tcTurboMode = 'max';
  tcPaused = false;
  window.simRunning = true;

  // Update overlay
  document.getElementById('tc-turbo-overlay')?.classList.add('visible');
  document.getElementById('tc-turbo-bar')?.classList.add('visible');
  const tgtEl = document.getElementById('tc-turbo-target-info');
  if (tgtEl) tgtEl.textContent = `→ Năm ${target.toLocaleString()}`;

  clearInterval(window.simInterval);
  window.simInterval = null;
  tcTurboLoop();
}

// Wrap simulateWorld để intercept events
function tcWrappedSimulate() {
  if (typeof simulateWorld === 'function') simulateWorld();
  tcOnSimTick();
}

function tcOnSimTick() {
  // Update year display
  const yr = window.year || 0;
  const el = document.getElementById('tc-year-num');
  if (el) el.textContent = yr;
}

// ================================================================
// TIMELINE MODE — filter world history feed
// ================================================================

function tcToggleTimelineMode() {
  tcTimelineMode = !tcTimelineMode;
  const el = document.getElementById('tc-timeline-toggle');
  if (el) el.classList.toggle('active', tcTimelineMode);
  if (tcTimelineMode) {
    tcFeedUpdate('🗂 Timeline Mode: chỉ hiển thị sự kiện lớn', false);
    // Re-render world history panel if active
    if (typeof renderWorldHistory === 'function') {
      tcPatchWorldHistoryFilter();
      renderWorldHistory();
    }
  } else {
    tcFeedUpdate('📋 Đã tắt Timeline Mode', false);
    tcUnpatchWorldHistoryFilter();
    if (typeof renderWorldHistory === 'function') renderWorldHistory();
  }
}

function tcIsBigEvent(e) {
  if (!TC_BIG_EVENTS.has(e.eventType)) return false;
  // Lọc thêm civilization nhỏ (dynasty milestone ngắn)
  if (e.eventType === 'civilization') {
    const desc = (e.description || '').toLowerCase();
    for (const kw of TC_SMALL_CIV_KEYWORDS) {
      if (desc.includes(kw)) return false;
    }
  }
  return true;
}

// Patch renderWorldHistory để filter khi Timeline Mode bật
let _origRenderWorldHistory = null;
function tcPatchWorldHistoryFilter() {
  if (_origRenderWorldHistory) return; // already patched
  _origRenderWorldHistory = window.renderWorldHistory;
  window.renderWorldHistory = function() {
    if (!tcTimelineMode) { _origRenderWorldHistory && _origRenderWorldHistory(); return; }
    // Temporarily filter worldHistory
    const orig = window.worldHistory;
    window.worldHistory = orig.filter(tcIsBigEvent);
    try { _origRenderWorldHistory && _origRenderWorldHistory(); } finally { window.worldHistory = orig; }
  };
}
function tcUnpatchWorldHistoryFilter() {
  if (_origRenderWorldHistory) {
    window.renderWorldHistory = _origRenderWorldHistory;
    _origRenderWorldHistory = null;
  }
}

// ================================================================
// LIVE FEED — show latest event in bottom bar
// ================================================================

let _tcFeedQueue = [];
let _tcFeedTimer = null;

function tcFeedUpdate(text, isBig = false) {
  const el = document.getElementById('tc-feed-text');
  if (!el) return;
  el.className = 'tc-feed-item' + (isBig ? ' big' : '');
  el.innerHTML = text;
  // Force re-animation
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

// Hook vào addWorldHistory để capture events realtime
const _origAddWorldHistory = window.addWorldHistory;
window.addWorldHistory = function(eventType, description, extra = {}) {
  // Call original
  if (typeof _origAddWorldHistory === 'function') _origAddWorldHistory(eventType, description, extra);

  // Feed display
  const typeInfo = (window.HISTORY_EVENT_TYPES || {})[eventType] || { icon: '📌', label: eventType };
  const yr = window.year || 0;
  const isBig = TC_BIG_EVENTS.has(eventType);

  if (!tcTimelineMode || isBig) {
    tcFeedUpdate(
      `<span class="tc-feed-year">Năm ${yr}</span><span class="tc-feed-icon">${typeInfo.icon || ''}</span>${description.slice(0, 80)}${description.length > 80 ? '…' : ''}`,
      isBig
    );
  }

  // Auto Focus
  if (tcAutoFocus && !tcAutoFocusLocked) {
    tcCheckAutoFocus(eventType, description, yr);
  }
};

// ================================================================
// AUTO FOCUS
// ================================================================

const TC_FOCUS_TRIGGERS = {
  civilization: {
    keywords: ['lập quốc', 'khai lập', 'khai thiên', 'đế quốc', 'trỗi dậy'],
    icon: '👑', title: 'Kỷ Nguyên Mới',
  },
  boss: {
    keywords: [],   // tất cả boss events
    icon: '🐉', title: 'Boss Xuất Thế',
  },
};

function tcCheckAutoFocus(eventType, description, yr) {
  const trigger = TC_FOCUS_TRIGGERS[eventType];
  if (!trigger) return;
  const desc = description.toLowerCase();
  const match = trigger.keywords.length === 0 ||
    trigger.keywords.some(kw => desc.includes(kw));
  if (!match) return;

  tcShowFocus(trigger.icon, trigger.title, yr, description);
}

function tcToggleAutoFocus() {
  tcAutoFocus = !tcAutoFocus;
  const el = document.getElementById('tc-autofocus-toggle');
  if (el) el.classList.toggle('active', tcAutoFocus);
  tcFeedUpdate(tcAutoFocus ? '🔭 Auto Focus bật' : '🔭 Auto Focus tắt', false);
}

function tcShowFocus(icon, title, yr, desc) {
  tcAutoFocusLocked = true;
  // Pause simulation while showing focus
  const wasPaused = tcPaused;
  if (!wasPaused) {
    clearInterval(window.simInterval);
    window.simRunning = false;
  }

  document.getElementById('tc-focus-icon').textContent  = icon;
  document.getElementById('tc-focus-title').textContent = title;
  document.getElementById('tc-focus-year').textContent  = `📅 Năm ${yr}`;
  document.getElementById('tc-focus-desc').textContent  = desc;

  const overlay = document.getElementById('tc-focus-overlay');
  if (overlay) overlay.classList.add('visible');

  // Store state to resume after close
  overlay.dataset.wasPaused = wasPaused ? '1' : '0';
}

function tcCloseFocus() {
  const overlay = document.getElementById('tc-focus-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  tcAutoFocusLocked = false;

  const wasPaused = overlay.dataset.wasPaused === '1';
  if (!wasPaused) {
    tcApplySpeed(tcCurrentSpeed);
    window.simRunning = true;
    const btn = document.getElementById('tc-pause');
    if (btn) { btn.textContent = '⏸'; btn.classList.remove('paused'); }
  }
}

// ================================================================
// HISTORY REPLAY
// ================================================================

let _tcHistorySnapshot = []; // full snapshot before replay

function tcJumpReplayYear(yearVal) {
  // Show start of world history
  const yr = window.year || 0;
  _tcHistorySnapshot = (window.worldHistory || []).slice();
  const target = yearVal === 0 ? 0 : yearVal;
  tcShowReplayAt(target);
}

function tcReplayToYear(mode) {
  const yr = window.year || 1;
  let target;
  if (mode === 'q1')   target = Math.floor(yr * 0.25);
  else if (mode === 'half') target = Math.floor(yr * 0.5);
  else if (mode === 'q3')  target = Math.floor(yr * 0.75);
  else target = yr;

  _tcHistorySnapshot = (window.worldHistory || []).slice();
  tcShowReplayAt(target);
}

function tcShowReplayAt(targetYear) {
  tcReplayYear = targetYear;
  // Show banner
  const banner = document.getElementById('tc-replay-banner');
  const yrText = document.getElementById('tc-replay-yr-text');
  if (banner) banner.classList.add('visible');
  if (yrText) yrText.textContent = `Năm ${targetYear}`;

  // Highlight active replay btn
  document.querySelectorAll('.tc-replay-btn').forEach(b => b.classList.remove('active'));

  // If world-history panel is open, show filtered view
  tcShowReplayPanel(targetYear);
}

function tcReplayLive() {
  tcReplayYear = null;
  const banner = document.getElementById('tc-replay-banner');
  if (banner) banner.classList.remove('visible');
  // Restore live view
  document.querySelectorAll('.tc-replay-btn').forEach(b => b.classList.remove('active'));
  const liveBtn = document.querySelector('.tc-replay-btn:last-child');
  if (liveBtn) liveBtn.classList.add('active');
  if (typeof renderWorldHistory === 'function') renderWorldHistory();
}

function tcShowReplayPanel(targetYear) {
  // Open world-history panel and show events up to targetYear
  if (typeof showPanel === 'function') showPanel('world-history');

  // Temporarily override worldHistory for render
  const orig = window.worldHistory;
  const filtered = orig.filter(e => (e.year || 0) <= targetYear);

  // Sort by year ascending for replay feel
  const sorted = [...filtered].sort((a, b) => (a.year || 0) - (b.year || 0));

  const listEl = document.getElementById('whEventList');
  if (!listEl) { window.worldHistory = orig; return; }

  if (!sorted.length) {
    listEl.innerHTML = `<div class="wh-empty">📜 Không có sự kiện nào trước Năm ${targetYear}.<br><small style="opacity:.4">Thử chọn mốc thời gian xa hơn.</small></div>`;
  } else {
    const tcEvents = tcTimelineMode ? sorted.filter(tcIsBigEvent) : sorted;
    listEl.innerHTML = tcEvents.map((e, idx) => {
      const typeInfo = (window.HISTORY_EVENT_TYPES || {})[e.eventType] || { icon: '📌', color: '#facc15', label: e.eventType };
      return `<div class="wh-timeline-row wh-${idx % 2 === 0 ? 'left' : 'right'}">
        <div class="wh-timeline-node" style="background:${typeInfo.color};box-shadow:0 0 8px ${typeInfo.color}66"></div>
        <div class="wh-entry" style="border-color:${typeInfo.color}33">
          <div class="wh-entry-header">
            <span class="wh-type-pill" style="background:${typeInfo.color}15;color:${typeInfo.color};border-color:${typeInfo.color}44">${typeInfo.icon || '📌'} ${typeInfo.label}</span>
            <span class="wh-year-badge">📅 Năm ${e.year}</span>
          </div>
          <div class="wh-entry-desc">${e.description}</div>
        </div>
      </div>`;
    }).join('');
  }

  const countEl = document.getElementById('whResultCount');
  if (countEl) countEl.textContent = `${sorted.length} sự kiện trước Năm ${targetYear}`;
}

// ================================================================
// NPC INSPECTOR
// ================================================================

function tcOpenInspector(npcId) {
  const npc = (typeof npcById === 'function') ? npcById(npcId) : null;
  if (!npc) return;

  const inspector = document.getElementById('tc-npc-inspector');
  const inner     = document.getElementById('tc-npc-inner');
  if (!inspector || !inner) return;

  inner.innerHTML = tcBuildInspectorHTML(npc);
  inspector.classList.add('visible');

  // Activate first tab
  tcInspectorSwitchTab('tc-it-overview', inner.querySelector('.tc-insp-tab'));
}

function tcBuildInspectorHTML(npc) {
  const REALMS = window.REALMS || [];
  const realmName = REALMS[npc.realm]?.name || `Cảnh ${npc.realm}`;
  const rc = (typeof realmColor === 'function') ? realmColor(npc.realm) : '#facc15';

  // Get family members
  const parents   = (npc.parentIds || []).map(id => (typeof npcById === 'function') ? npcById(id) : null).filter(Boolean);
  const children  = (npc.childrenIds || []).map(id => (typeof npcById === 'function') ? npcById(id) : null).filter(Boolean);
  const spouse    = npc.spouseId ? ((typeof npcById === 'function') ? npcById(npc.spouseId) : null) : null;
  // Siblings: share a parent
  let siblings = [];
  if (parents.length > 0) {
    const pId = parents[0].id;
    siblings = (window.npcs || []).filter(n => n.id !== npc.id && (n.parentIds || []).includes(pId));
  }
  const dynasty = (window.dynasties || {})[npc.family] || null;
  const sect     = (typeof sectById === 'function') ? sectById(npc.sectId) : null;
  const country  = npc.country || '—';

  const renderMiniMember = (m, badge, badgeClass) => {
    if (!m) return '';
    const rName = REALMS[m.realm]?.name || `Cảnh ${m.realm}`;
    const mRc   = (typeof realmColor === 'function') ? realmColor(m.realm) : '#facc15';
    const isDead = m.status !== 'alive';
    return `<div class="tc-rel-item${isDead ? ' dead' : ''}" onclick="tcOpenInspector(${m.id})">
      <span class="tc-rel-badge ${badgeClass}">${badge}</span>
      <span style="font-size:18px">${m.gender === 'Nữ' ? '👸' : '🧙'}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:${isDead ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)'}">${m.name}${isDead ? ' ☠' : ''}</div>
        <div style="font-size:11px;color:${mRc}">${rName} · ${m.age}t</div>
      </div>
    </div>`;
  };

  const relHTML = [
    ...parents.map(p  => renderMiniMember(p,  'Cha/Mẹ', 'tc-rel-parent')),
    spouse ? renderMiniMember(spouse, 'Đạo Lữ', 'tc-rel-spouse') : '',
    ...children.map(c => renderMiniMember(c,  'Con Cái', 'tc-rel-child')),
    ...siblings.map(s => renderMiniMember(s,  'Huynh Đệ', 'tc-rel-sibling')),
  ].join('') || `<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:20px;text-align:center">Chưa có quan hệ nào</div>`;

  // Biography
  const bioHTML = (npc.biography || []).slice().reverse().map(e =>
    `<div class="tc-bio-item">
      <span class="tc-bio-year">Năm ${e.year}</span>
      <span class="tc-bio-event">${e.event}</span>
    </div>`
  ).join('') || `<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:20px;text-align:center">Chưa có lịch sử</div>`;

  // Assets / Stats
  const res = npc.resources || {};
  const RESOURCES = window.RESOURCES || {};

  const assetsHTML = `
    <div class="tc-stat-grid">
      <div class="tc-stat-card"><div class="tc-stat-label">Tài Phú</div><div class="tc-stat-value" style="color:#facc15">${Math.floor(npc.wealth || 0).toLocaleString()}</div></div>
      <div class="tc-stat-card"><div class="tc-stat-label">Danh Vọng</div><div class="tc-stat-value" style="color:#fb923c">${Math.floor(npc.reputation || 0)}</div></div>
      <div class="tc-stat-card"><div class="tc-stat-label">Công Kích</div><div class="tc-stat-value">${npc.attack || 0}</div></div>
      <div class="tc-stat-card"><div class="tc-stat-label">Phòng Thủ</div><div class="tc-stat-value">${npc.defense || 0}</div></div>
      <div class="tc-stat-card"><div class="tc-stat-label">HP</div><div class="tc-stat-value" style="color:#4ade80">${npc.hp || 0}/${npc.maxHp || 0}</div></div>
      <div class="tc-stat-card"><div class="tc-stat-label">Khí Vận</div><div class="tc-stat-value" style="color:#a78bfa">${npc.luck || 0}</div></div>
    </div>
    ${Object.keys(RESOURCES).length ? `<div style="margin-top:8px"><div style="font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px">Tài Nguyên</div>
    <div class="tc-stat-grid">${Object.entries(RESOURCES).map(([k, r]) =>
      `<div class="tc-stat-card"><div class="tc-stat-label">${r.icon} ${r.name}</div><div class="tc-stat-value" style="color:${r.color}">${res[k] || 0}</div></div>`
    ).join('')}</div></div>` : ''}
    ${npc.equipment ? `<div style="margin-top:8px"><div style="font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px">Trang Bị</div>
    <div class="tc-stat-grid">
      ${['weapon','armor','artifact'].map(slot => {
        const item = npc.equipment[slot];
        if (!item) return `<div class="tc-stat-card" style="opacity:.3"><div class="tc-stat-label">${slot}</div><div class="tc-stat-value" style="font-size:12px">Trống</div></div>`;
        return `<div class="tc-stat-card"><div class="tc-stat-label">${item.icon || '⚔️'} ${slot}</div><div class="tc-stat-value" style="font-size:11px">${item.name}</div></div>`;
      }).join('')}
    </div></div>` : ''}
  `;

  // Family / Clan
  const clanHTML = dynasty ? `
    <div style="margin-bottom:12px">
      <div style="font-size:14px;font-weight:600;color:#facc15;margin-bottom:6px">🏠 Gia Tộc ${dynasty.surname}</div>
      <div class="tc-stat-grid">
        <div class="tc-stat-card"><div class="tc-stat-label">Khai Sáng</div><div class="tc-stat-value">Năm ${dynasty.foundedYear}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Thế Hệ</div><div class="tc-stat-value">${dynasty.generations}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Thành Viên</div><div class="tc-stat-value">${dynasty.totalMembers}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Đang Sống</div><div class="tc-stat-value" style="color:#4ade80">${dynasty.aliveMembers}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Tài Phú</div><div class="tc-stat-value" style="color:#facc15">${(dynasty.wealth/1000).toFixed(1)}k</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Thủy Tổ</div><div class="tc-stat-value" style="font-size:11px">${dynasty.founderName || '—'}</div></div>
      </div>
      ${dynasty.history?.length ? `<div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)">Lịch sử gia tộc:</div>
      <div style="max-height:120px;overflow-y:auto;margin-top:4px">${dynasty.history.slice(0,5).map(h =>
        `<div class="tc-bio-item"><span class="tc-bio-year">Năm ${h.year}</span><span class="tc-bio-event">${h.event}</span></div>`
      ).join('')}</div>` : ''}
    </div>
    <button class="tc-close-btn" style="float:none;display:inline-block;margin-top:4px" onclick="showDynastyDetail && showDynastyDetail('${dynasty.surname}')">📜 Xem Cây Gia Phả Đầy Đủ →</button>
  ` : `<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:20px;text-align:center">Chưa thuộc gia tộc nào</div>`;

  return `
    <button class="tc-close-btn" onclick="tcCloseInspector()">✕ Đóng</button>
    <div class="tc-npc-header">
      <div class="tc-npc-avatar">${npc.gender === 'Nữ' ? '👸' : '🧙'}</div>
      <div>
        <div class="tc-npc-name" style="color:${rc}">${npc.name}</div>
        <div class="tc-npc-sub">${realmName} · ${npc.age}t · ${npc.gender} · ${npc.status === 'alive' ? '💚 Còn Sống' : '☠ Đã Ngã'}</div>
        <div class="tc-npc-sub" style="margin-top:4px">${npc.personality || ''} · ${npc.fate || ''}</div>
        <div style="margin-top:5px">${(npc.titles || []).map(t => `<span style="font-size:10px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.2);color:#facc15;padding:1px 6px;border-radius:4px;margin-right:4px">${t}</span>`).join('')}</div>
      </div>
    </div>

    <div class="tc-insp-tabs">
      <button class="tc-insp-tab" data-tab="tc-it-overview"  onclick="tcInspectorSwitchTab('tc-it-overview',this)">📋 Tổng Quan</button>
      <button class="tc-insp-tab" data-tab="tc-it-relations" onclick="tcInspectorSwitchTab('tc-it-relations',this)">👥 Gia Đình</button>
      <button class="tc-insp-tab" data-tab="tc-it-clan"      onclick="tcInspectorSwitchTab('tc-it-clan',this)">🏠 Gia Tộc</button>
      <button class="tc-insp-tab" data-tab="tc-it-assets"    onclick="tcInspectorSwitchTab('tc-it-assets',this)">💰 Tài Sản</button>
      <button class="tc-insp-tab" data-tab="tc-it-history"   onclick="tcInspectorSwitchTab('tc-it-history',this)">📜 Lịch Sử</button>
    </div>

    <div id="tc-it-overview" class="tc-insp-content">
      <div class="tc-stat-grid">
        <div class="tc-stat-card"><div class="tc-stat-label">Cảnh Giới</div><div class="tc-stat-value" style="color:${rc}">${realmName}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Linh Căn</div><div class="tc-stat-value">${npc.root || '—'}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Tuổi / Thọ</div><div class="tc-stat-value">${npc.age} / ${npc.lifespan}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Tông Môn</div><div class="tc-stat-value" style="font-size:11px">${sect ? sect.name : 'Độc Tu'}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Quốc Gia</div><div class="tc-stat-value" style="font-size:11px">${country}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Gia Tộc</div><div class="tc-stat-value" style="font-size:11px">${npc.family || '—'}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Đệ Tử</div><div class="tc-stat-value">${(npc.discipleIds || []).length}</div></div>
        <div class="tc-stat-card"><div class="tc-stat-label">Karma</div><div class="tc-stat-value" style="color:${(npc.karma||0) < 0 ? '#f87171' : '#4ade80'}">${npc.karma || 0}</div></div>
      </div>
      <div style="margin-top:8px">
        <div style="font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:6px">Kỹ Năng</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${(npc.skills || []).length ? npc.skills.map(s => `<span style="font-size:11px;background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);color:#60a5fa;padding:2px 7px;border-radius:4px">${s}</span>`).join('') : '<span style="color:rgba(255,255,255,0.25);font-size:12px">Chưa có kỹ năng</span>'}
        </div>
      </div>
    </div>

    <div id="tc-it-relations" class="tc-insp-content">
      ${relHTML}
    </div>

    <div id="tc-it-clan" class="tc-insp-content">
      ${clanHTML}
    </div>

    <div id="tc-it-assets" class="tc-insp-content">
      ${assetsHTML}
    </div>

    <div id="tc-it-history" class="tc-insp-content">
      <div style="max-height:400px;overflow-y:auto">${bioHTML}</div>
    </div>
  `;
}

function tcInspectorSwitchTab(tabId, btn) {
  const inner = document.getElementById('tc-npc-inner');
  if (!inner) return;
  inner.querySelectorAll('.tc-insp-content').forEach(c => c.classList.remove('active'));
  inner.querySelectorAll('.tc-insp-tab').forEach(b => b.classList.remove('active'));
  const tab = inner.querySelector('#' + tabId) || document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
}

function tcCloseInspector() {
  const inspector = document.getElementById('tc-npc-inspector');
  if (inspector) inspector.classList.remove('visible');
}

// ================================================================
// FAMILY VIEWER (standalone — opens in world-history panel area)
// ================================================================

function tcOpenFamilyViewer(surname) {
  if (!surname) return;
  const dynasty = (window.dynasties || {})[surname];
  if (!dynasty) { tcFeedUpdate(`⚠️ Không tìm thấy gia tộc ${surname}`, false); return; }

  // Hijack panel-dynasty to show family tree via inspector
  if (typeof showPanel === 'function') showPanel('dynasty');
  if (typeof showDynastyDetail === 'function') showDynastyDetail(surname);
}

// Expose globally
window.tcOpenFamilyViewer = tcOpenFamilyViewer;
window.tcOpenInspector    = tcOpenInspector;

// ================================================================
// HOOK: intercept NPC card clicks to open TC Inspector
// (as additional info tab — keeps existing modal too)
// ================================================================

// We add a "🔍 Chi Tiết" button inside the existing openNPCModal
const _tcOrigOpenNPCModal = window.openNPCModal;
window.openNPCModal = function(id) {
  if (typeof _tcOrigOpenNPCModal === 'function') _tcOrigOpenNPCModal(id);
  // Inject a small "Inspect" button into modal header
  setTimeout(() => {
    const header = document.querySelector('.modal-header');
    if (header && !header.querySelector('.tc-modal-inspect-btn')) {
      const btn = document.createElement('button');
      btn.className = 'tc-modal-inspect-btn btn-secondary small';
      btn.style.cssText = 'position:absolute;top:12px;right:50px;font-size:11px;padding:3px 10px';
      btn.textContent = '🔍 Inspector';
      btn.onclick = (e) => { e.stopPropagation(); tcOpenInspector(id); };
      header.style.position = 'relative';
      header.appendChild(btn);
    }
  }, 50);
};

// ================================================================
// SYNC: Replace old sim controls with TC Bar
// ================================================================

function tcSyncOldControls() {
  // Hide old simSpeed select and simToggle — TC bar replaces them
  const oldControls = document.querySelector('.sim-controls');
  if (oldControls) {
    oldControls.style.display = 'none';
  }
  // Override old toggleSimulation / changeSimSpeed to proxy to TC
  window.toggleSimulation = tcTogglePause;
  window.changeSimSpeed   = function() {
    const sel = document.getElementById('simSpeed');
    if (!sel) return;
    const ms = parseInt(sel.value);
    // Map ms → speed multiplier
    const match = Object.entries(TC_SPEEDS).find(([,v]) => v === ms);
    if (match) tcSetSpeed(parseInt(match[0]));
  };
  window.startSim = function() {
    if (!tcPaused) tcApplySpeed(tcCurrentSpeed);
  };
}

// ================================================================
// TICK HOOK — year display update even when external sim runs
// ================================================================

function tcYearWatcher() {
  const el = document.getElementById('tc-year-num');
  if (el) el.textContent = window.year || 0;
}
// Patch simulateWorld to also update year display
const _origSimulateWorld = window.simulateWorld;
window.simulateWorld = function() {
  if (typeof _origSimulateWorld === 'function') _origSimulateWorld();
  tcYearWatcher();
};

// ================================================================
// INIT
// ================================================================

function initTimeControlSystem() {
  tcInjectCSS();
  tcInjectDOM();
  tcSyncOldControls();

  // Start at 1x speed
  tcSetSpeed(1);

  // Initial year display
  tcYearWatcher();

  // If sim was already running, restart with TC-controlled interval
  if (window.simRunning !== false && window.world) {
    clearInterval(window.simInterval);
    tcApplySpeed(tcCurrentSpeed);
  }

  console.log('[TimeControlSystem] Initialized ✓');
}

// Auto-init after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initTimeControlSystem, 400));
} else {
  setTimeout(initTimeControlSystem, 400);
}

// Expose
window.tcTogglePause       = tcTogglePause;
window.tcSetSpeed          = tcSetSpeed;
window.tcToggleTimelineMode = tcToggleTimelineMode;
window.tcToggleAutoFocus   = tcToggleAutoFocus;
window.tcReplayYear        = tcReplayYear;
window.tcJumpReplayYear    = tcJumpReplayYear;
window.tcReplayToYear      = tcReplayToYear;
window.tcReplayLive        = tcReplayLive;
window.tcShowFocus         = tcShowFocus;
window.tcCloseFocus        = tcCloseFocus;
window.tcCloseInspector    = tcCloseInspector;
window.tcInspectorSwitchTab = tcInspectorSwitchTab;
window.initTimeControlSystem = initTimeControlSystem;
