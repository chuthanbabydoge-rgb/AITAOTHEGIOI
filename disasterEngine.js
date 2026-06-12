// ═══════════════════════════════════════════════════════════════
// DISASTER ENGINE V25 — Creator God World Simulator
// Thiên Tai: Động Đất · Núi Lửa · Sóng Thần · Lũ Lụt · Hạn Hán
// Kết nối: worldMemoryEngine · historicalTimeline · app.js
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

// ─── CONSTANTS ───────────────────────────────────────────────
const SAVE_KEY = "cgv6_disaster_v25";
const DISASTER_TYPES = {
  EARTHQUAKE: {
    id:"EARTHQUAKE", name:"Động Đất", emoji:"🌋",
    color:"#f97316", severity:["Nhẹ","Trung Bình","Mạnh","Thảm Họa"],
    effects: {
      population: [-3,-10,-25,-45],
      economy: [-5,-15,-30,-50],
      stability: [-10,-20,-40,-70]
    },
    desc:"Mặt đất rung chuyển, thành trì sụp đổ, dân chúng hoảng loạn.",
    triggers: ["tectonic","volcanic","divine_wrath"]
  },
  VOLCANO: {
    id:"VOLCANO", name:"Núi Lửa Phun Trào", emoji:"🌋",
    color:"#dc2626", severity:["Nhỏ","Vừa","Lớn","Siêu Núi Lửa"],
    effects: {
      population: [-5,-18,-40,-80],
      economy: [-10,-25,-50,-90],
      stability: [-15,-35,-60,-95],
      bonus_ash_fertility: [10,5,-10,-50]
    },
    desc:"Dung nham trào tuôn, tro bụi che phủ bầu trời, đất đai bị thiêu rụi.",
    triggers: ["volcanic_zone","divine_anger","mana_surge"]
  },
  TSUNAMI: {
    id:"TSUNAMI", name:"Sóng Thần", emoji:"🌊",
    color:"#0ea5e9", severity:["Nhỏ","Trung","Lớn","Đại Hải Kiếm"],
    effects: {
      population: [-2,-12,-35,-70],
      economy: [-8,-20,-45,-80],
      naval: [-20,-50,-80,-100],
      stability: [-5,-20,-45,-70]
    },
    desc:"Sóng biển khổng lồ ập vào bờ, cuốn trôi mọi thứ trong tầm mắt.",
    triggers: ["earthquake","oceanic","divine_ocean"]
  },
  FLOOD: {
    id:"FLOOD", name:"Lũ Lụt", emoji:"💧",
    color:"#2563eb", severity:["Lũ Nhỏ","Lũ Lớn","Đại Hồng Thủy","Hồng Thủy Thiêng"],
    effects: {
      population: [-1,-6,-18,-40],
      economy: [-5,-15,-35,-60],
      agriculture: [-10,-30,-60,-100],
      stability: [-5,-15,-30,-55]
    },
    desc:"Nước dâng cao, ruộng đồng ngập tràn, kho lương bị phá hủy.",
    triggers: ["heavy_rain","divine_water","dam_break","seasonal"]
  },
  DROUGHT: {
    id:"DROUGHT", name:"Hạn Hán", emoji:"☀️",
    color:"#ca8a04", severity:["Thiếu Nước","Hạn Nặng","Đại Hạn","Hạn Chết"],
    effects: {
      population: [-2,-8,-20,-45],
      economy: [-10,-25,-50,-80],
      agriculture: [-20,-45,-80,-100],
      stability: [-8,-20,-45,-75]
    },
    desc:"Mưa không về, sông hồ cạn dần, mùa màng thất bát, dân đói khát.",
    triggers: ["dry_season","divine_fire","climate_shift"]
  }
};

// ─── STATE ───────────────────────────────────────────────────
window.disasterData = {
  activeDisasters: [],
  history: [],
  disasterCount: 0,
  lastDisasterYear: null,
  regionRisks: {},
  totalDeaths: 0,
  totalEconomicLoss: 0
};

// ─── SAVE / LOAD ─────────────────────────────────────────────
function deSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.disasterData)); } catch(e) {}
}
function deLoad() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.disasterData = JSON.parse(d);
  } catch(e) {}
}

// ─── CORE: TRIGGER DISASTER ──────────────────────────────────
window.deTriggerDisaster = function(typeId, regionName, severityOverride) {
  const type = DISASTER_TYPES[typeId];
  if (!type) return null;
  const countries = window.countries || [];
  if (countries.length === 0 && !regionName) return null;

  const sevIdx = severityOverride !== undefined
    ? Math.min(severityOverride, type.severity.length - 1)
    : _randomSeverity();

  const target = regionName || _pickRegion(countries);
  const year = typeof window.year !== "undefined" ? window.year : 0;

  const disaster = {
    id: "dis_" + Date.now(),
    type: typeId,
    name: type.name,
    emoji: type.emoji,
    severity: sevIdx,
    severityName: type.severity[sevIdx],
    region: target,
    year: year,
    effects: _calcEffects(type, sevIdx),
    duration: _calcDuration(sevIdx),
    active: true,
    resolved: false
  };

  window.disasterData.activeDisasters.push(disaster);
  window.disasterData.disasterCount++;
  window.disasterData.lastDisasterYear = year;

  _applyEffects(disaster, countries);
  _recordToTimeline(disaster);
  _recordToMemory(disaster);
  _addToLog(disaster);

  deSave();
  return disaster;
};

function _randomSeverity() {
  const r = Math.random();
  if (r < 0.45) return 0;
  if (r < 0.75) return 1;
  if (r < 0.92) return 2;
  return 3;
}

function _pickRegion(countries) {
  if (countries.length === 0) return "Vùng Đất Hoang";
  const c = countries[Math.floor(Math.random() * countries.length)];
  return c.name || "Vô Danh";
}

function _calcEffects(type, sevIdx) {
  const e = {};
  for (const [k, vals] of Object.entries(type.effects)) {
    e[k] = vals[sevIdx];
  }
  return e;
}

function _calcDuration(sevIdx) {
  return [1, 2+Math.floor(Math.random()*3), 5+Math.floor(Math.random()*5), 10+Math.floor(Math.random()*10)][sevIdx];
}

function _applyEffects(disaster, countries) {
  const target = countries.find(c => c.name === disaster.region);
  if (!target) return;

  const e = disaster.effects;
  if (e.population && target.population) {
    const loss = Math.floor(Math.abs(e.population) / 100 * target.population);
    target.population = Math.max(100, target.population - loss);
    window.disasterData.totalDeaths += loss;
  }
  if (e.economy && target.economy) {
    const loss = Math.floor(Math.abs(e.economy) / 100 * target.economy);
    target.economy = Math.max(0, target.economy - loss);
    window.disasterData.totalEconomicLoss += loss;
  }
  if (e.stability !== undefined && target.stability !== undefined) {
    target.stability = Math.max(0, Math.min(100, target.stability + e.stability));
  }
}

function _recordToTimeline(d) {
  try {
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({
        year: d.year, type:"disaster",
        title: d.emoji + " " + d.name + " — " + d.severityName,
        desc: "[" + d.region + "] " + DISASTER_TYPES[d.type].desc,
        color: DISASTER_TYPES[d.type].color
      });
    }
    const timeline = window.worldTimeline || window.timeline;
    if (Array.isArray(timeline)) {
      timeline.push({ year:d.year, type:"disaster", event: d.emoji + " " + d.name + " (" + d.severityName + ") tại " + d.region });
    }
  } catch(e) {}
}

function _recordToMemory(d) {
  try {
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({
        year: d.year, category:"disaster",
        title: d.emoji + " " + d.name,
        content: d.severityName + " — " + d.region + ". " + DISASTER_TYPES[d.type].desc
      });
    }
    const worldMemories = window.worldMemories;
    if (Array.isArray(worldMemories)) {
      worldMemories.push({ year:d.year, type:"disaster", text: d.emoji + " " + d.name + " (" + d.severityName + ") xảy ra tại " + d.region });
    }
  } catch(e) {}
}

function _addToLog(d) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      const c = DISASTER_TYPES[d.type].color;
      logEl.innerHTML += `<div style="color:${c};border-left:3px solid ${c};padding:4px 8px;margin:2px 0;">
        [Năm ${d.year}] ${d.emoji} <strong>${d.name}</strong> (${d.severityName}) xảy ra tại <em>${d.region}</em>
      </div>`;
    }
  } catch(e) {}
}

// ─── AI AUTO-TRIGGER ─────────────────────────────────────────
window.deTick = function() {
  const year = typeof window.year !== "undefined" ? window.year : 0;
  const countries = window.countries || [];
  if (countries.length === 0) return;

  // Resolve expired disasters
  window.disasterData.activeDisasters.forEach(d => {
    if (d.active && year >= d.year + d.duration) {
      d.active = false;
      d.resolved = true;
      window.disasterData.history.push(d);
    }
  });
  window.disasterData.activeDisasters = window.disasterData.activeDisasters.filter(d => d.active);

  // Random trigger (roughly every 15-30 years on average)
  const roll = Math.random();
  const baseChance = 0.06 + (countries.length * 0.002);
  if (roll < baseChance) {
    const types = Object.keys(DISASTER_TYPES);
    const t = types[Math.floor(Math.random() * types.length)];
    window.deTriggerDisaster(t);
  }
};

// ─── GOD POWERS ──────────────────────────────────────────────
window.deGodSmite = function(typeId, region, severity) {
  return window.deTriggerDisaster(typeId, region, severity || 3);
};

// ─── RENDER PANEL ────────────────────────────────────────────
window.deRenderPanel = function() {
  const el = document.getElementById("panel-disaster");
  if (!el) return;
  const d = window.disasterData;
  const year = typeof window.year !== "undefined" ? window.year : 0;
  const countries = window.countries || [];

  el.innerHTML = `
  <div style="padding:20px;max-width:1000px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">🌋</span>
      <div><div style="font-family:var(--font-title);font-size:1.4em;color:#f97316;">Thiên Tai Engine V25</div>
      <div style="color:var(--white-dim);font-size:.82em;">5 loại thiên tai · AI tự động · Kết nối Timeline & World Memory</div></div>
    </div>

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
      ${[
        {icon:"💀",label:"Tổng Thiệt Mạng",val:d.totalDeaths.toLocaleString(),color:"#f87171"},
        {icon:"💸",label:"Thiệt Hại Kinh Tế",val:d.totalEconomicLoss.toLocaleString(),color:"#fbbf24"},
        {icon:"📅",label:"Thiên Tai Gần Nhất",val:d.lastDisasterYear||"—",color:"#f97316"},
        {icon:"⚡",label:"Đang Hoạt Động",val:d.activeDisasters.length,color:"#4ade80"},
      ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;">${s.icon}</div>
        <div style="font-size:1.1em;font-weight:700;color:${s.color};">${s.val}</div>
        <div style="font-size:.72em;color:var(--white-dim);margin-top:2px;">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- GOD POWER: TRIGGER -->
    <div style="background:rgba(249,115,22,.07);border:1px solid rgba(249,115,22,.3);border-radius:12px;padding:16px;margin-bottom:20px;">
      <div style="font-family:var(--font-title);color:#f97316;margin-bottom:12px;font-size:.9em;">⚡ Thiên Thần Can Thiệp — Gây Ra Thiên Tai</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        ${Object.values(DISASTER_TYPES).map(t=>`
        <button onclick="window.deTriggerDisaster('${t.id}'); window.deRenderPanel();"
          style="background:${t.color}22;border:1px solid ${t.color}66;color:${t.color};padding:8px 14px;border-radius:8px;cursor:pointer;font-size:.83em;font-family:var(--font-cjk);">
          ${t.emoji} ${t.name}
        </button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Object.values(DISASTER_TYPES).map(t=>`
        <button onclick="window.deGodSmite('${t.id}'); window.deRenderPanel();"
          style="background:rgba(220,38,38,.2);border:1px solid #dc2626;color:#fca5a5;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.78em;">
          ☠️ ${t.name} Cấp 4
        </button>`).join("")}
      </div>
    </div>

    <!-- ACTIVE DISASTERS -->
    <div style="font-family:var(--font-title);color:#f97316;margin-bottom:8px;font-size:.88em;">🔥 Thiên Tai Đang Diễn Ra (${d.activeDisasters.length})</div>
    ${d.activeDisasters.length===0
      ? `<div style="color:#475569;font-size:.85em;margin-bottom:16px;">Không có thiên tai đang hoạt động.</div>`
      : d.activeDisasters.map(dis=>{
          const t = DISASTER_TYPES[dis.type];
          const c = t.color;
          const remaining = dis.year + dis.duration - year;
          return `<div style="background:${c}11;border:1px solid ${c}44;border-radius:10px;padding:12px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:20px;">${dis.emoji}</span>
              <span style="color:${c};font-weight:700;">${dis.name}</span>
              <span style="background:${c}33;color:${c};padding:2px 8px;border-radius:10px;font-size:.78em;">${dis.severityName}</span>
              <span style="margin-left:auto;color:var(--white-dim);font-size:.8em;">Còn ${remaining} năm</span>
            </div>
            <div style="font-size:.82em;color:var(--white-dim);">📍 ${dis.region} · Năm ${dis.year}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${Object.entries(dis.effects).filter(([,v])=>v!==0).map(([k,v])=>
                `<span style="font-size:.75em;color:${v<0?"#f87171":"#4ade80"};">${k}: ${v>0?"+":""}${v}%</span>`
              ).join("")}
            </div>
          </div>`;
        }).join("")
    }

    <!-- HISTORY -->
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.88em;">📜 Lịch Sử Thiên Tai (${d.history.length + (d.disasterCount - d.activeDisasters.length)})</div>
    <div style="max-height:250px;overflow-y:auto;">
      ${[...d.history].reverse().slice(0,20).map(dis=>{
        const t = DISASTER_TYPES[dis.type];
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.82em;">
          <span>${dis.emoji}</span>
          <span style="color:var(--white-main);">${dis.name}</span>
          <span style="color:#475569;">${dis.severityName}</span>
          <span style="color:var(--white-dim);">tại ${dis.region}</span>
          <span style="margin-left:auto;color:#475569;">Năm ${dis.year}</span>
        </div>`;
      }).join("") || `<div style="color:#475569;font-size:.83em;">Chưa có lịch sử thiên tai.</div>`}
    </div>
  </div>`;
};

// ─── INIT ─────────────────────────────────────────────────────
function deInit() {
  deLoad();
  // Hook gameTick
  const _origTick = window.gameTick;
  window.gameTick = function() {
    if (_origTick) _origTick();
    if (Math.random() < 0.3) window.deTick();
  };
  console.log("[DisasterEngine V25] 🌋 Thiên Tai Hệ Thống khởi động — Động Đất · Núi Lửa · Sóng Thần · Lũ Lụt · Hạn Hán sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(deInit, 3200); });
} else {
  setTimeout(deInit, 3200);
}

})();
