// ═══════════════════════════════════════════════════════════════
// PLAGUE ENGINE V25 — Creator God World Simulator
// Đại Dịch: Cái Chết Đen · Dịch Bệnh Linh Hồn · Suy Thoái Mana
// Kết nối: worldMemoryEngine · historicalTimeline · disasterEngine
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const SAVE_KEY = "cgv6_plague_v25";

const PLAGUE_TYPES = {
  BLACK_DEATH: {
    id:"BLACK_DEATH", name:"Cái Chết Đen", emoji:"💀",
    color:"#7c3aed",
    spreadRate: 0.35, mortalityBase: 0.30,
    stages: ["Ủ Bệnh","Bùng Phát","Đại Dịch","Tận Thế Đen"],
    effects: {
      population: [-15, -30, -50, -75],
      economy: [-10, -25, -45, -70],
      stability: [-20, -40, -65, -90],
      military: [-5, -20, -40, -65]
    },
    cure: { difficulty:0.7, yearsToFind: [5,10,20,null] },
    desc: "Bệnh dịch hắc ám lan rộng, người chết nằm la liệt trên đường phố."
  },
  SOUL_PLAGUE: {
    id:"SOUL_PLAGUE", name:"Dịch Bệnh Linh Hồn", emoji:"👻",
    color:"#06b6d4",
    spreadRate: 0.20, mortalityBase: 0.15,
    stages: ["Khởi Phát","Lan Rộng","Bão Linh Hồn","Sụp Đổ Tâm Linh"],
    effects: {
      population: [-5, -15, -35, -60],
      cultivation: [-30, -55, -80, -100],
      spiritualPower: [-20, -45, -70, -100],
      stability: [-15, -30, -50, -80]
    },
    cure: { difficulty:0.85, yearsToFind: [8,15,30,null] },
    desc: "Linh hồn của các tu tiên sĩ bị ăn mòn, căn cơ tu luyện tan vỡ từ bên trong."
  },
  MANA_DECAY: {
    id:"MANA_DECAY", name:"Suy Thoái Mana", emoji:"✨",
    color:"#f59e0b",
    spreadRate: 0.15, mortalityBase: 0.08,
    stages: ["Rò Rỉ Mana","Khô Cạn Linh Khí","Thiên Địa Mất Cân","Hư Không Sụp Đổ"],
    effects: {
      population: [-2, -8, -20, -45],
      manaConcentration: [-25, -55, -80, -100],
      artifactPower: [-15, -35, -65, -90],
      cultivation: [-20, -45, -75, -100],
      economy: [-5, -15, -30, -60]
    },
    cure: { difficulty:0.95, yearsToFind: [15,25,50,null] },
    desc: "Linh khí thiên địa cạn dần, phép thuật thất linh, đạo lý rối loạn."
  }
};

// ─── STATE ───────────────────────────────────────────────────
window.plagueData = {
  activePlagues: [],
  history: [],
  plagueCount: 0,
  immunity: {},
  cureResearch: {},
  totalDeaths: 0,
  spreadLog: []
};

// ─── SAVE / LOAD ─────────────────────────────────────────────
function plSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.plagueData)); } catch(e) {}
}
function plLoad() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.plagueData = JSON.parse(d);
  } catch(e) {}
}

// ─── TRIGGER PLAGUE ──────────────────────────────────────────
window.plTriggerPlague = function(typeId, originRegion, stageOverride) {
  const type = PLAGUE_TYPES[typeId];
  if (!type) return null;
  const countries = window.countries || [];
  const year = typeof window.year !== "undefined" ? window.year : 0;

  const stage = stageOverride !== undefined
    ? Math.min(stageOverride, type.stages.length - 1)
    : 0;

  const origin = originRegion || (countries.length > 0
    ? countries[Math.floor(Math.random() * countries.length)].name
    : "Vùng Bí Ẩn");

  const plague = {
    id: "plg_" + Date.now(),
    type: typeId,
    name: type.name,
    emoji: type.emoji,
    color: type.color,
    origin: origin,
    affectedRegions: [origin],
    stage: stage,
    stageName: type.stages[stage],
    year: year,
    yearsActive: 0,
    totalDeaths: 0,
    cureProgress: 0,
    cured: false,
    active: true
  };

  window.plagueData.activePlagues.push(plague);
  window.plagueData.plagueCount++;
  window.plagueData.cureResearch[plague.id] = 0;

  _applyPlagueEffects(plague, type, countries);
  _recordPlagueToTimeline(plague, type);
  _recordPlagueToMemory(plague, type);
  _plagueLog(plague, type, "Xuất hiện");

  plSave();
  return plague;
};

function _applyPlagueEffects(plague, type, countries) {
  const e = type.effects;
  const stage = plague.stage;
  countries.forEach(c => {
    if (!plague.affectedRegions.includes(c.name)) return;
    if (e.population && c.population) {
      const loss = Math.floor(Math.abs(e.population[stage]) / 100 * c.population);
      c.population = Math.max(10, c.population - loss);
      plague.totalDeaths += loss;
      window.plagueData.totalDeaths += loss;
    }
    if (e.economy !== undefined && c.economy !== undefined) {
      c.economy = Math.max(0, c.economy + Math.floor(e.economy[stage] / 100 * c.economy));
    }
    if (e.stability !== undefined && c.stability !== undefined) {
      c.stability = Math.max(0, Math.min(100, c.stability + e.stability[stage]));
    }
  });
}

function _spreadPlague(plague, type, countries) {
  if (countries.length <= plague.affectedRegions.length) return;
  const spreadChance = type.spreadRate * (1 + plague.stage * 0.3);
  if (Math.random() > spreadChance) return;

  const unaffected = countries.filter(c => !plague.affectedRegions.includes(c.name));
  if (unaffected.length === 0) return;
  const newRegion = unaffected[Math.floor(Math.random() * unaffected.length)];
  plague.affectedRegions.push(newRegion.name);
  window.plagueData.spreadLog.push({ year: window.year||0, plague: plague.name, newRegion: newRegion.name });
}

function _escalatePlague(plague, type) {
  if (plague.stage >= type.stages.length - 1) return;
  const escalateChance = 0.08 + plague.stage * 0.04;
  if (Math.random() < escalateChance) {
    plague.stage++;
    plague.stageName = type.stages[plague.stage];
    _plagueLog(plague, type, "Leo Thang → " + plague.stageName);
    _recordPlagueToTimeline(plague, type, true);
  }
}

function _researchCure(plague, type) {
  const resKey = plague.id;
  if (!window.plagueData.cureResearch[resKey]) window.plagueData.cureResearch[resKey] = 0;

  // Research speed based on world development
  const hasKingdom = !!(window.kingdomData?.kingdoms?.length);
  const researchSpeed = (hasKingdom ? 3 : 1) + plague.stage;
  window.plagueData.cureResearch[resKey] += researchSpeed;

  const cureThreshold = type.cure.difficulty * 1000;
  if (window.plagueData.cureResearch[resKey] >= cureThreshold) {
    plague.cured = true;
    plague.active = false;
    window.plagueData.history.push({ ...plague, curedYear: window.year||0 });
    _plagueLog(plague, type, "✅ CHỮA KHỎI — Thuốc giải tìm được!");
    _recordPlagueToTimeline(plague, type, false, true);
  }
}

function _recordPlagueToTimeline(plague, type, escalate, cured) {
  try {
    const title = escalate
      ? `⬆️ ${plague.emoji} ${plague.name} leo thang: ${plague.stageName}`
      : cured
        ? `✅ ${plague.emoji} ${plague.name} đã được chữa khỏi`
        : `${plague.emoji} ${plague.name} bùng phát tại ${plague.origin}`;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year:window.year||0, type:"plague", title, color:type.color });
    }
    const tl = window.worldTimeline || window.timeline;
    if (Array.isArray(tl)) tl.push({ year:window.year||0, type:"plague", event:title });
  } catch(e) {}
}

function _recordPlagueToMemory(plague, type) {
  try {
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year:window.year||0, category:"plague",
        title: plague.emoji + " " + plague.name,
        content: "Bùng phát tại " + plague.origin + ". " + type.desc
      });
    }
  } catch(e) {}
}

function _plagueLog(plague, type, note) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      logEl.innerHTML += `<div style="color:${type.color};border-left:3px solid ${type.color};padding:4px 8px;margin:2px 0;">
        [Năm ${window.year||0}] ${plague.emoji} <strong>${plague.name}</strong> (${plague.stageName}) — ${note}
        <span style="color:#475569;"> | ${plague.affectedRegions.length} vùng bị ảnh hưởng</span>
      </div>`;
    }
  } catch(e) {}
}

// ─── TICK ────────────────────────────────────────────────────
window.plTick = function() {
  const countries = window.countries || [];
  if (countries.length === 0) return;

  // Auto-trigger
  if (Math.random() < 0.025 + countries.length * 0.001) {
    const types = Object.keys(PLAGUE_TYPES);
    window.plTriggerPlague(types[Math.floor(Math.random() * types.length)]);
  }

  // Process active plagues
  window.plagueData.activePlagues.forEach(plague => {
    if (!plague.active) return;
    plague.yearsActive++;
    const type = PLAGUE_TYPES[plague.type];
    _spreadPlague(plague, type, countries);
    _escalatePlague(plague, type);
    _applyPlagueEffects(plague, type, countries);
    _researchCure(plague, type);
  });
  window.plagueData.activePlagues = window.plagueData.activePlagues.filter(p => p.active);
  plSave();
};

// ─── GOD POWER ───────────────────────────────────────────────
window.plGodSummonPlague = function(typeId, region, stage) {
  return window.plTriggerPlague(typeId, region, stage !== undefined ? stage : 2);
};
window.plGodCurePlague = function(plagueId) {
  const p = window.plagueData.activePlagues.find(x => x.id === plagueId);
  if (p) { p.cured = true; p.active = false;
    window.plagueData.history.push({...p, curedYear: window.year||0});
    window.plagueData.activePlagues = window.plagueData.activePlagues.filter(x => x.id !== plagueId);
    plSave();
  }
};

// ─── RENDER PANEL ────────────────────────────────────────────
window.plRenderPanel = function() {
  const el = document.getElementById("panel-plague");
  if (!el) return;
  const d = window.plagueData;

  el.innerHTML = `
  <div style="padding:20px;max-width:1000px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">💀</span>
      <div><div style="font-family:var(--font-title);font-size:1.4em;color:#7c3aed;">Đại Dịch Engine V25</div>
      <div style="color:var(--white-dim);font-size:.82em;">Cái Chết Đen · Dịch Bệnh Linh Hồn · Suy Thoái Mana · Lây lan · Chữa Trị AI</div></div>
    </div>

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
      ${[
        {icon:"💀",label:"Tổng Tử Vong",val:d.totalDeaths.toLocaleString(),color:"#f87171"},
        {icon:"🦠",label:"Đại Dịch Hoạt Động",val:d.activePlagues.length,color:"#7c3aed"},
        {icon:"📜",label:"Tổng Đại Dịch",val:d.plagueCount,color:"#a78bfa"},
        {icon:"🌐",label:"Vùng Lây Nhiễm",val:d.activePlagues.reduce((s,p)=>s+p.affectedRegions.length,0),color:"#f97316"},
      ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;">${s.icon}</div>
        <div style="font-size:1.1em;font-weight:700;color:${s.color};">${s.val}</div>
        <div style="font-size:.72em;color:var(--white-dim);margin-top:2px;">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- GOD POWER -->
    <div style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.3);border-radius:12px;padding:14px;margin-bottom:20px;">
      <div style="font-family:var(--font-title);color:#a78bfa;margin-bottom:10px;font-size:.88em;">⚡ Thần Quyền — Triệu Gọi Đại Dịch</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Object.values(PLAGUE_TYPES).map(t=>`
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button onclick="window.plTriggerPlague('${t.id}'); window.plRenderPanel();"
            style="background:${t.color}22;border:1px solid ${t.color}66;color:${t.color};padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.83em;">
            ${t.emoji} ${t.name}
          </button>
          <button onclick="window.plGodSummonPlague('${t.id}'); window.plRenderPanel();"
            style="background:rgba(220,38,38,.2);border:1px solid #dc2626;color:#fca5a5;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.75em;">
            ☠️ Giai Đoạn 3
          </button>
        </div>`).join("")}
      </div>
    </div>

    <!-- ACTIVE PLAGUES -->
    <div style="font-family:var(--font-title);color:#a78bfa;margin-bottom:8px;font-size:.88em;">🦠 Đại Dịch Đang Hoạt Động (${d.activePlagues.length})</div>
    ${d.activePlagues.length===0
      ? `<div style="color:#475569;font-size:.85em;margin-bottom:16px;">Không có đại dịch đang hoạt động.</div>`
      : d.activePlagues.map(p=>{
          const t = PLAGUE_TYPES[p.type];
          const cureRes = d.cureResearch[p.id] || 0;
          const curePct = Math.min(100, Math.floor(cureRes / (t.cure.difficulty * 10)));
          return `<div style="background:${t.color}11;border:1px solid ${t.color}44;border-radius:10px;padding:14px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span style="font-size:22px;">${p.emoji}</span>
              <span style="color:${t.color};font-weight:700;">${p.name}</span>
              <span style="background:${t.color}33;color:${t.color};padding:2px 8px;border-radius:10px;font-size:.78em;">${p.stageName}</span>
              <span style="margin-left:auto;color:var(--white-dim);font-size:.8em;">Năm ${p.year} · ${p.yearsActive} năm</span>
            </div>
            <div style="font-size:.82em;color:var(--white-dim);margin-bottom:8px;">
              📍 Nguồn gốc: ${p.origin} · Ảnh hưởng ${p.affectedRegions.length} vùng: ${p.affectedRegions.slice(0,4).join(", ")}${p.affectedRegions.length>4?"...":""}
            </div>
            <div style="margin-bottom:4px;">
              <div style="font-size:.75em;color:var(--white-dim);margin-bottom:2px;">🔬 Tiến Độ Nghiên Cứu Thuốc Giải: ${curePct}%</div>
              <div style="height:5px;background:var(--bg-secondary);border-radius:3px;">
                <div style="height:5px;background:linear-gradient(90deg,${t.color},#22c55e);border-radius:3px;width:${curePct}%;"></div>
              </div>
            </div>
            <button onclick="window.plGodCurePlague('${p.id}'); window.plRenderPanel();"
              style="margin-top:6px;background:rgba(34,197,94,.15);border:1px solid #22c55e;color:#4ade80;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:.78em;">
              🌿 Can Thiệp Thần — Chữa Khỏi
            </button>
          </div>`;
        }).join("")
    }

    <!-- HISTORY -->
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.88em;">📜 Lịch Sử Đại Dịch (${d.history.length})</div>
    <div style="max-height:200px;overflow-y:auto;">
      ${[...d.history].reverse().slice(0,15).map(p=>
        `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.82em;">
          <span>${p.emoji}</span><span style="color:var(--white-main);">${p.name}</span>
          <span style="color:#475569;">${p.stageName}</span>
          <span style="color:var(--white-dim);">từ ${p.origin}</span>
          <span style="color:#22c55e;margin-left:auto;">${p.curedYear?`Chữa khỏi Năm ${p.curedYear}`:"Tuyệt chủng"}</span>
        </div>`).join("") || `<div style="color:#475569;font-size:.83em;">Chưa có lịch sử đại dịch.</div>`}
    </div>
  </div>`;
};

// ─── INIT ─────────────────────────────────────────────────────
function plInit() {
  plLoad();
  const _origTick = window.gameTick;
  window.gameTick = function() {
    if (_origTick) _origTick();
    if (Math.random() < 0.2) window.plTick();
  };
  console.log("[PlagueEngine V25] 💀 Đại Dịch Hệ Thống khởi động — Cái Chết Đen · Dịch Linh Hồn · Suy Thoái Mana sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(plInit, 3400); });
} else {
  setTimeout(plInit, 3400);
}

})();
