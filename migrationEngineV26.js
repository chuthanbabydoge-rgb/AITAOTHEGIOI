(function() {
"use strict";
// ============================================================
// MIGRATION ENGINE V26 — Creator God V6
// Mở rộng migrationEngine.js (V1) — KHÔNG ghi đè
// Thêm: Di cư liên lục địa · Khí hậu · Mở rộng lãnh thổ
//       Tích hợp ceV26Data · Sóng di cư lớn · Thống kê V26
// ============================================================

const SAVE_KEY = "cgv6_migration_v26";
const INIT_DELAY = 4000;

// ─── STATE ────────────────────────────────────────────────────
window.meV26Data = {
  waves: [],
  history: [],
  log: [],
  stats: {},        // { continentId: { in, out, net, byClimate, byReason } }
  totalMigrants: 0,
  bigWaves: [],     // Sóng di cư lớn (>50000 người)
  tickCount: 0,
  initialized: false,
};

// ─── MIGRATION REASONS V26 ────────────────────────────────────
const MEV26_REASONS = [
  { id: "war_flee",     icon: "🏃", name: "Tị Nạn Chiến Tranh",  color: "#f87171", trigger: "war",     sizeMult: 1.8 },
  { id: "climate_push", icon: "🌪️", name: "Thiên Tai Đẩy Đi",   color: "#fb923c", trigger: "climate", sizeMult: 1.5 },
  { id: "tech_pull",    icon: "🔬", name: "Công Nghệ Thu Hút",   color: "#38bdf8", trigger: "tech",    sizeMult: 0.8 },
  { id: "econ_push",    icon: "💸", name: "Kinh Tế Suy Thoái",   color: "#facc15", trigger: "econ",    sizeMult: 1.2 },
  { id: "spirit_pull",  icon: "✨", name: "Linh Khí Thu Hút",    color: "#c084fc", trigger: "spirit",  sizeMult: 1.0 },
  { id: "conquest",     icon: "⚔️", name: "Chinh Phục Lãnh Thổ", color: "#fb7185", trigger: "conquest",sizeMult: 2.0 },
  { id: "trade_route",  icon: "💼", name: "Tuyến Thương Mại",    color: "#4ade80", trigger: "trade",   sizeMult: 0.6 },
  { id: "golden_land",  icon: "☀️", name: "Đất Vàng Hứa Hẹn",   color: "#fbbf24", trigger: "golden",  sizeMult: 2.5 },
];

// ─── SAVE / LOAD ──────────────────────────────────────────────
function mev26Save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.meV26Data)); } catch(e) {}
}
function mev26Load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) Object.assign(window.meV26Data, JSON.parse(d));
  } catch(e) {}
}

// ─── HELPERS ──────────────────────────────────────────────────
function _rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function _pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function _getContinents() {
  if (window.ceV26Data && window.ceV26Data.continents) return Object.values(window.ceV26Data.continents);
  if (typeof ceState !== "undefined" && ceState.continents) return ceState.continents;
  return [];
}

function mev26Log(msg, from, to) {
  const e = { year: window.year||0, msg, from, to };
  window.meV26Data.log.unshift(e);
  if (window.meV26Data.log.length > 200) window.meV26Data.log.pop();
}

// ─── GENERATE WAVE ───────────────────────────────────────────
function mev26GenerateWave() {
  const continents = _getContinents();
  if (continents.length < 2) return;

  // Pick source (unstable or at war)
  const sources = continents.filter(c => c.stability < 70 || (c.atWarWith && c.atWarWith.length > 0));
  const from = sources.length ? _pick(sources) : _pick(continents);
  const to = _pick(continents.filter(c => c.id !== from.id && c.stability > 50));
  if (!from || !to) return;

  // Determine reason
  let reason = _pick(MEV26_REASONS);
  if (from.atWarWith && from.atWarWith.length > 0) reason = MEV26_REASONS.find(r => r.id === "war_flee") || reason;
  else if (from.climateEvents && from.climateEvents.length && from.climateEvents[0]?.year === (window.year||0)) reason = MEV26_REASONS.find(r => r.id === "climate_push") || reason;
  else if (to.techLevel > from.techLevel + 2) reason = MEV26_REASONS.find(r => r.id === "tech_pull") || reason;

  const baseSize = _rand(500, 5000);
  const size = Math.floor(baseSize * reason.sizeMult);

  const wave = {
    id: "mv26_" + Date.now() + "_" + _rand(0, 9999),
    fromId: from.id, fromName: from.name,
    toId: to.id, toName: to.name,
    reason: reason.id, reasonName: reason.name, reasonIcon: reason.icon,
    color: reason.color,
    size,
    remaining: size,
    progress: 0,          // 0–100
    startYear: window.year || 0,
    endYear: null,
    status: "active",
  };

  window.meV26Data.waves.push(wave);
  window.meV26Data.totalMigrants += size;

  if (size >= 10000) {
    window.meV26Data.bigWaves.unshift(wave);
    if (window.meV26Data.bigWaves.length > 30) window.meV26Data.bigWaves.pop();
    mev26Log(`🌊 SÓNG DI CƯ LỚN: ${size.toLocaleString()} người từ ${from.name} → ${to.name} (${reason.name})`, from.id, to.id);
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year||0, type: "migration", title: `Sóng di cư ${from.name}→${to.name}: ${size.toLocaleString()} người`, color: reason.color });
    }
  } else {
    mev26Log(`${reason.icon} ${reason.name}: ${size.toLocaleString()} người từ ${from.name} → ${to.name}`, from.id, to.id);
  }
}

// ─── ADVANCE WAVES ───────────────────────────────────────────
function mev26AdvanceWaves() {
  const d = window.meV26Data;
  d.waves.filter(w => w.status === "active").forEach(w => {
    w.progress += _rand(5, 15);
    const arrived = Math.floor(w.size * (w.progress / 100)) - (w.size - w.remaining);
    w.remaining = Math.max(0, w.size - Math.floor(w.size * (w.progress / 100)));

    // Apply effect to destination continent
    if (arrived > 0 && window.ceV26Data && window.ceV26Data.continents) {
      const dest = window.ceV26Data.continents[w.toId];
      const src  = window.ceV26Data.continents[w.fromId];
      if (dest) {
        dest.population += arrived;
        // Tech diffusion
        if (src && src.techLevel > dest.techLevel) dest.techProgress += 5;
        // Economic boost
        dest.resources.food = Math.max(0, dest.resources.food - Math.floor(arrived / 500));
        dest.gdp = Math.floor(dest.gdp * 1.002);
      }
      if (src) {
        src.population = Math.max(1000, src.population - arrived);
      }
    }

    // Update stats
    if (!d.stats[w.fromId]) d.stats[w.fromId] = { in:0, out:0, net:0 };
    if (!d.stats[w.toId])   d.stats[w.toId]   = { in:0, out:0, net:0 };
    d.stats[w.fromId].out += arrived;
    d.stats[w.fromId].net -= arrived;
    d.stats[w.toId].in    += arrived;
    d.stats[w.toId].net   += arrived;

    if (w.progress >= 100) {
      w.status = "ended";
      w.endYear = window.year || 0;
      w.remaining = 0;
      d.history.unshift(w);
      if (d.history.length > 100) d.history.pop();
    }
  });
  d.waves = d.waves.filter(w => w.status === "active");
}

// ─── MAIN TICK ────────────────────────────────────────────────
function mev26Tick() {
  const d = window.meV26Data;
  d.tickCount++;
  if (!d.initialized) return;

  // Try generate new wave every ~3 ticks
  if (d.tickCount % 3 === 0 && Math.random() < 0.35) mev26GenerateWave();
  mev26AdvanceWaves();
  if (d.tickCount % 30 === 0) mev26Save();
}

// ─── RENDER PANEL ─────────────────────────────────────────────
window.mev26RenderPanel = function() {
  const el = document.getElementById("panel-migration-v26");
  if (!el) return;
  const d = window.meV26Data;
  const continents = _getContinents();

  const totalMigrants = d.totalMigrants;
  const activeWaves = d.waves.length;
  const bigWaves = d.bigWaves.length;

  let html = `
  <div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div style="font-size:1.3em;color:#4ade80;font-weight:bold">🚶 Di Cư V26 — Liên Lục Địa</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">🌊 ${activeWaves} sóng đang di chuyển</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">👥 ${totalMigrants.toLocaleString()} tổng di cư</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">⭐ ${bigWaves} sóng lớn</span>
      </div>
    </div>

    <!-- ACTIVE WAVES -->
    <div style="margin-bottom:16px">
      <div style="color:#4ade80;font-weight:bold;margin-bottom:8px">🌊 Sóng Di Cư Đang Hoạt Động (${activeWaves})</div>
      ${activeWaves === 0 ? '<div style="color:#475569;font-size:0.85em;padding:10px 0">Không có sóng di cư nào đang diễn ra.</div>' :
        d.waves.map(w => `
        <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px">
            <span style="color:${w.color};font-weight:bold">${w.reasonIcon} ${w.reasonName}</span>
            <span style="color:#64748b;font-size:0.82em">${w.startYear}</span>
          </div>
          <div style="font-size:0.85em;margin-bottom:6px">
            🏔️ <span style="color:#fbbf24">${w.fromName}</span>
            <span style="color:#64748b"> → </span>
            <span style="color:#4ade80">${w.toName}</span>
            <span style="color:#94a3b8"> · ${w.size.toLocaleString()} người</span>
          </div>
          <div style="background:#1e293b;border-radius:4px;height:8px">
            <div style="background:${w.color};height:8px;border-radius:4px;width:${Math.min(100,w.progress)}%;transition:width 0.3s"></div>
          </div>
          <div style="font-size:0.77em;color:#64748b;margin-top:3px">Tiến độ: ${Math.min(100,w.progress)}% · Còn lại: ${w.remaining.toLocaleString()}</div>
        </div>
      `).join("")}
    </div>

    <!-- CONTINENTAL STATS -->
    <div style="margin-bottom:16px">
      <div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">📊 Thống Kê Di Cư Theo Lục Địa</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82em">
        <tr style="color:#94a3b8;border-bottom:1px solid #334155">
          <th style="text-align:left;padding:5px 8px">Lục Địa</th>
          <th style="text-align:right;padding:5px 8px;color:#4ade80">Nhập cư</th>
          <th style="text-align:right;padding:5px 8px;color:#f87171">Xuất cư</th>
          <th style="text-align:right;padding:5px 8px">Cân bằng</th>
        </tr>
        ${continents.map(c => {
          const s = d.stats[c.id] || { in:0, out:0, net:0 };
          return `
          <tr style="border-bottom:1px solid #1e293b">
            <td style="padding:5px 8px">${c.icon||'🌍'} ${c.name}</td>
            <td style="padding:5px 8px;text-align:right;color:#4ade80">+${(s.in||0).toLocaleString()}</td>
            <td style="padding:5px 8px;text-align:right;color:#f87171">-${(s.out||0).toLocaleString()}</td>
            <td style="padding:5px 8px;text-align:right;color:${(s.net||0)>=0?'#4ade80':'#f87171'}">${(s.net||0)>=0?'+':''}${(s.net||0).toLocaleString()}</td>
          </tr>`;
        }).join("")}
      </table>
    </div>

    <!-- BIG WAVES -->
    ${d.bigWaves.length ? `
    <div style="margin-bottom:16px">
      <div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">⭐ Sóng Di Cư Lớn Trong Lịch Sử</div>
      <div style="max-height:200px;overflow-y:auto;font-size:0.82em">
        ${d.bigWaves.slice(0,20).map(w => `
          <div style="border-bottom:1px solid #1e293b;padding:5px 0;display:flex;justify-content:space-between;gap:8px">
            <span>${w.reasonIcon} <span style="color:${w.color}">${w.reasonName}</span> · ${w.fromName} → ${w.toName}</span>
            <span style="color:#fbbf24;white-space:nowrap">${w.size.toLocaleString()} người · ${w.startYear}</span>
          </div>
        `).join("")}
      </div>
    </div>` : ''}

    <!-- REASON BREAKDOWN -->
    <div style="margin-bottom:16px">
      <div style="color:#94a3b8;font-weight:bold;margin-bottom:8px">📋 Nguyên Nhân Di Cư</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${MEV26_REASONS.map(r => {
          const count = d.history.filter(w => w.reason === r.id).length;
          return `<div style="background:#1e293b;padding:5px 10px;border-radius:8px;font-size:0.8em;border-left:3px solid ${r.color}">
            ${r.icon} ${r.name} <span style="color:#64748b">(${count})</span>
          </div>`;
        }).join("")}
      </div>
    </div>

    <!-- LOG -->
    <div>
      <div style="color:#64748b;font-weight:bold;margin-bottom:8px;font-size:0.9em">📋 Nhật Ký Di Cư V26</div>
      <div style="max-height:180px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">
        ${d.log.slice(0,30).map(e => `<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">[${e.year}] ${e.msg}</div>`).join("") || '<div style="color:#475569">Chưa có sự kiện.</div>'}
      </div>
    </div>
  </div>`;

  el.innerHTML = html;
};

// ─── INIT ─────────────────────────────────────────────────────
function mev26Init() {
  mev26Load();
  window.meV26Data.initialized = true;

  const _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    try { mev26Tick(); } catch(e) {}
  };
  console.log("[MigrationEngineV26] 🚶 V26 khởi động — Di cư liên lục địa · Sóng lớn · Thống kê ✓");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(mev26Init, INIT_DELAY); });
} else {
  setTimeout(mev26Init, INIT_DELAY);
}

})();
