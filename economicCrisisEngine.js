// ═══════════════════════════════════════════════════════════════
// ECONOMIC CRISIS ENGINE V25 — Creator God World Simulator
// Sự Kiện Kinh Tế: Lạm Phát · Suy Thoái · Bùng Nổ Thương Mại
// Kết nối: economyEngine · worldMemoryEngine · historicalTimeline
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const SAVE_KEY = "cgv6_econ_crisis_v25";

const ECONOMIC_EVENTS = {
  INFLATION: {
    id:"INFLATION", name:"Lạm Phát", emoji:"📈",
    color:"#f97316", type:"negative",
    phases: ["Ổn Định","Lạm Phát Nhẹ","Lạm Phát Nặng","Siêu Lạm Phát"],
    effects: {
      priceMultiplier: [1.0, 1.3, 1.8, 4.0],
      economyGrowth:   [0, -5, -20, -50],
      stability:       [0, -5, -15, -40],
      trade:           [0, -10, -25, -60]
    },
    desc:"Giá cả leo thang, tiền tệ mất giá, dân chúng khốn khổ.",
    triggers:["war","overprinting","trade_deficit","divine_curse"]
  },
  RECESSION: {
    id:"RECESSION", name:"Suy Thoái Kinh Tế", emoji:"📉",
    color:"#dc2626", type:"negative",
    phases: ["Chậm Lại","Suy Thoái","Đại Suy Thoái","Sụp Đổ Hoàn Toàn"],
    effects: {
      economyGrowth:   [-3, -15, -35, -65],
      unemployment:    [5, 15, 35, 60],
      stability:       [-5, -20, -45, -80],
      militaryFunding: [-5, -20, -40, -75]
    },
    desc:"Hoạt động kinh tế đình trệ, thất nghiệp tăng cao, kho bạc cạn kiệt.",
    triggers:["crop_failure","war_debt","plague","overextension"]
  },
  TRADE_BOOM: {
    id:"TRADE_BOOM", name:"Bùng Nổ Thương Mại", emoji:"🏪",
    color:"#22c55e", type:"positive",
    phases: ["Tăng Trưởng","Bùng Nổ","Thịnh Vượng","Kỷ Nguyên Vàng Thương Mại"],
    effects: {
      economyGrowth:  [5, 15, 30, 60],
      trade:          [10, 25, 50, 100],
      stability:      [3, 8, 15, 25],
      population:     [1, 3, 6, 12]
    },
    desc:"Thương mại phồn thịnh, hàng hóa trao đổi khắp thiên hạ, vàng bạc đầy kho.",
    triggers:["peace","trade_treaty","tech_advance","new_route","divine_blessing"]
  },
  MARKET_CRASH: {
    id:"MARKET_CRASH", name:"Sụp Đổ Thị Trường", emoji:"💹",
    color:"#7c3aed", type:"negative",
    phases: ["Điều Chỉnh","Sụp Đổ Nhẹ","Đại Sụp Đổ","Hủy Diệt Kinh Tế"],
    effects: {
      economyGrowth:  [-10, -30, -55, -80],
      trade:          [-15, -40, -70, -95],
      stability:      [-10, -25, -50, -85],
      wealthLoss:     [10, 30, 60, 90]
    },
    desc:"Thị trường giao dịch sụp đổ, tài sản bốc hơi trong chớp mắt.",
    triggers:["speculation","war","inflation","loss_of_confidence"]
  },
  GOLDEN_TRADE: {
    id:"GOLDEN_TRADE", name:"Con Đường Tơ Lụa Mới", emoji:"🛍️",
    color:"#f59e0b", type:"positive",
    phases: ["Khám Phá","Mở Rộng","Thịnh Đạt","Bá Quyền Thương Mại"],
    effects: {
      economyGrowth:  [8, 20, 40, 70],
      trade:          [15, 35, 60, 120],
      cultureSpread:  [5, 15, 30, 60],
      stability:      [2, 6, 12, 20]
    },
    desc:"Tuyến đường thương mại huyền thoại mở ra, nối liền các vùng đất xa xôi.",
    triggers:["exploration","peace_treaty","tech_advance","divine_guidance"]
  }
};

// ─── STATE ───────────────────────────────────────────────────
window.econCrisisData = {
  activeEvents: [],
  history: [],
  eventCount: 0,
  economyIndex: 100,
  inflationRate: 0,
  unemploymentRate: 0,
  tradeVolume: 100,
  gdpGrowth: 0,
  totalBoomYears: 0,
  totalCrisisYears: 0
};

// ─── SAVE / LOAD ─────────────────────────────────────────────
function ecSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.econCrisisData)); } catch(e) {}
}
function ecLoad() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.econCrisisData = JSON.parse(d);
  } catch(e) {}
}

// ─── TRIGGER EVENT ───────────────────────────────────────────
window.ecTriggerEvent = function(eventId, phaseOverride, affectedRegion) {
  const ev = ECONOMIC_EVENTS[eventId];
  if (!ev) return null;
  const year = typeof window.year !== "undefined" ? window.year : 0;
  const countries = window.countries || [];

  const phase = phaseOverride !== undefined
    ? Math.min(phaseOverride, ev.phases.length - 1)
    : _randomPhase(ev);

  const affected = affectedRegion
    ? [affectedRegion]
    : countries.length > 0
      ? [countries[Math.floor(Math.random() * countries.length)].name]
      : ["Toàn Thiên Hạ"];

  const event = {
    id: "ec_" + Date.now(),
    type: eventId, name: ev.name, emoji: ev.emoji,
    color: ev.color, phase, phaseName: ev.phases[phase],
    affectedRegions: affected,
    year, duration: _calcDuration(ev, phase),
    active: true, effects: {}, resolved: false
  };

  // Copy effects for phase
  for (const [k, v] of Object.entries(ev.effects)) {
    event.effects[k] = Array.isArray(v) ? v[phase] : v;
  }

  window.econCrisisData.activeEvents.push(event);
  window.econCrisisData.eventCount++;
  _applyEconEffects(event, ev, countries);
  _updateGlobalIndicators(event, ev);
  _recordEconToTimeline(event, ev);
  _recordEconToMemory(event, ev);
  _econLog(event, ev, "Bắt Đầu");

  ecSave();
  return event;
};

function _randomPhase(ev) {
  const r = Math.random();
  if (ev.type === "positive") {
    if (r < 0.35) return 0;
    if (r < 0.70) return 1;
    if (r < 0.90) return 2;
    return 3;
  } else {
    if (r < 0.40) return 0;
    if (r < 0.72) return 1;
    if (r < 0.92) return 2;
    return 3;
  }
}

function _calcDuration(ev, phase) {
  const base = ev.type === "positive" ? [5,10,20,40] : [3,8,15,30];
  return base[phase] + Math.floor(Math.random() * 5);
}

function _applyEconEffects(event, ev, countries) {
  countries.forEach(c => {
    if (!event.affectedRegions.includes(c.name) && event.affectedRegions[0] !== "Toàn Thiên Hạ") return;
    if (ev.effects.economyGrowth && c.economy !== undefined) {
      const pct = ev.effects.economyGrowth[event.phase] / 100;
      c.economy = Math.max(0, Math.floor(c.economy * (1 + pct)));
    }
    if (ev.effects.stability && c.stability !== undefined) {
      c.stability = Math.max(0, Math.min(100, c.stability + ev.effects.stability[event.phase]));
    }
    if (ev.effects.population && c.population) {
      const pct = ev.effects.population[event.phase] / 100;
      c.population = Math.max(10, Math.floor(c.population * (1 + pct)));
    }
  });
}

function _updateGlobalIndicators(event, ev) {
  const d = window.econCrisisData;
  if (ev.effects.economyGrowth) {
    const g = ev.effects.economyGrowth[event.phase];
    d.gdpGrowth += g;
    d.economyIndex = Math.max(10, d.economyIndex + g * 0.5);
  }
  if (ev.effects.priceMultiplier) {
    const pm = ev.effects.priceMultiplier[event.phase];
    d.inflationRate = Math.max(0, d.inflationRate + (pm - 1) * 20);
  }
  if (ev.effects.trade) {
    d.tradeVolume = Math.max(0, d.tradeVolume + ev.effects.trade[event.phase]);
  }
  if (ev.effects.unemployment) {
    d.unemploymentRate = Math.max(0, Math.min(100, d.unemploymentRate + ev.effects.unemployment[event.phase]));
  }
  if (ev.type === "positive") d.totalBoomYears++;
  else d.totalCrisisYears++;
}

function _recordEconToTimeline(event, ev) {
  try {
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year:window.year||0, type:"economy",
        title: event.emoji + " " + event.name + " — " + event.phaseName,
        color: event.color });
    }
    const tl = window.worldTimeline || window.timeline;
    if (Array.isArray(tl)) tl.push({ year:window.year||0, type:"economy",
      event: event.emoji + " " + event.name + " (" + event.phaseName + ")" });
  } catch(e) {}
}

function _recordEconToMemory(event, ev) {
  try {
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year:window.year||0, category:"economy",
        title: event.emoji + " " + event.name,
        content: event.phaseName + " tại " + event.affectedRegions.join(", ") + ". " + ev.desc });
    }
  } catch(e) {}
}

function _econLog(event, ev, note) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      logEl.innerHTML += `<div style="color:${ev.color};border-left:3px solid ${ev.color};padding:4px 8px;margin:2px 0;">
        [Năm ${window.year||0}] ${event.emoji} <strong>${event.name}</strong> (${event.phaseName}) — ${note}
      </div>`;
    }
  } catch(e) {}
}

// ─── TICK ────────────────────────────────────────────────────
window.ecTick = function() {
  const countries = window.countries || [];
  const year = typeof window.year !== "undefined" ? window.year : 0;

  // Resolve expired
  window.econCrisisData.activeEvents.forEach(ev => {
    if (ev.active && year >= ev.year + ev.duration) {
      ev.active = false;
      ev.resolved = true;
      window.econCrisisData.history.push(ev);
    }
  });
  window.econCrisisData.activeEvents = window.econCrisisData.activeEvents.filter(e => e.active);

  // Gradually normalize indicators
  const d = window.econCrisisData;
  d.inflationRate = Math.max(0, d.inflationRate - 0.5);
  d.unemploymentRate = Math.max(0, d.unemploymentRate - 0.3);
  d.tradeVolume = Math.min(200, d.tradeVolume + 0.2);
  d.gdpGrowth = d.gdpGrowth * 0.95;

  // Auto-trigger
  const roll = Math.random();
  const baseChance = 0.04 + countries.length * 0.001;
  if (roll < baseChance) {
    const types = Object.keys(ECONOMIC_EVENTS);
    const t = types[Math.floor(Math.random() * types.length)];
    window.ecTriggerEvent(t);
  }

  ecSave();
};

// ─── RENDER PANEL ────────────────────────────────────────────
window.ecRenderPanel = function() {
  const el = document.getElementById("panel-econ-crisis");
  if (!el) return;
  const d = window.econCrisisData;

  const indicators = [
    {label:"Chỉ Số Kinh Tế",val:d.economyIndex.toFixed(1),unit:"/100",color:d.economyIndex>=80?"#4ade80":d.economyIndex>=50?"#fbbf24":"#f87171",icon:"📊"},
    {label:"Tỷ Lệ Lạm Phát",val:d.inflationRate.toFixed(1),unit:"%",color:d.inflationRate<5?"#4ade80":d.inflationRate<20?"#fbbf24":"#f87171",icon:"📈"},
    {label:"Thất Nghiệp",val:d.unemploymentRate.toFixed(1),unit:"%",color:d.unemploymentRate<10?"#4ade80":d.unemploymentRate<30?"#fbbf24":"#f87171",icon:"👷"},
    {label:"Khối Lượng TM",val:d.tradeVolume.toFixed(0),unit:"điểm",color:d.tradeVolume>=100?"#4ade80":"#fbbf24",icon:"🏪"},
    {label:"Tăng Trưởng GDP",val:(d.gdpGrowth>=0?"+":"")+d.gdpGrowth.toFixed(1),unit:"%",color:d.gdpGrowth>=0?"#4ade80":"#f87171",icon:"💹"},
    {label:"Sự Kiện Tốt",val:d.totalBoomYears,unit:"lần",color:"#22c55e",icon:"🌟"},
    {label:"Sự Kiện Xấu",val:d.totalCrisisYears,unit:"lần",color:"#f87171",icon:"⚠️"},
    {label:"Tổng Sự Kiện",val:d.eventCount,unit:"",color:"#60a5fa",icon:"📋"},
  ];

  el.innerHTML = `
  <div style="padding:20px;max-width:1000px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">💹</span>
      <div><div style="font-family:var(--font-title);font-size:1.4em;color:#22c55e;">Sự Kiện Kinh Tế V25</div>
      <div style="color:var(--white-dim);font-size:.82em;">Lạm Phát · Suy Thoái · Bùng Nổ TM · Con Đường Tơ Lụa · Kết nối Economy Engine</div></div>
    </div>

    <!-- INDICATORS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;">
      ${indicators.map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:10px;text-align:center;">
        <div style="font-size:16px;">${s.icon}</div>
        <div style="font-size:1.05em;font-weight:700;color:${s.color};">${s.val}<span style="font-size:.65em;font-weight:400;color:var(--white-dim);"> ${s.unit}</span></div>
        <div style="font-size:.7em;color:var(--white-dim);">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- GOD POWER -->
    <div style="background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.3);border-radius:12px;padding:14px;margin-bottom:20px;">
      <div style="font-family:var(--font-title);color:#4ade80;margin-bottom:10px;font-size:.88em;">⚡ Thần Kinh Tế — Kích Hoạt Sự Kiện</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Object.values(ECONOMIC_EVENTS).map(ev=>`
        <button onclick="window.ecTriggerEvent('${ev.id}'); window.ecRenderPanel();"
          style="background:${ev.color}20;border:1px solid ${ev.color}55;color:${ev.color};padding:8px 14px;border-radius:8px;cursor:pointer;font-size:.83em;">
          ${ev.emoji} ${ev.name}
        </button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        ${Object.values(ECONOMIC_EVENTS).map(ev=>`
        <button onclick="window.ecTriggerEvent('${ev.id}',3); window.ecRenderPanel();"
          style="background:${ev.type==="positive"?"rgba(250,204,21,.15)":"rgba(220,38,38,.15)"};border:1px solid ${ev.type==="positive"?"#ca8a04":"#dc2626"};color:${ev.type==="positive"?"#fbbf24":"#fca5a5"};padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.75em;">
          ⭐ ${ev.name} Cấp 4
        </button>`).join("")}
      </div>
    </div>

    <!-- ACTIVE EVENTS -->
    <div style="font-family:var(--font-title);color:#22c55e;margin-bottom:8px;font-size:.88em;">📊 Sự Kiện Đang Diễn Ra (${d.activeEvents.length})</div>
    ${d.activeEvents.length===0
      ? `<div style="color:#475569;font-size:.85em;margin-bottom:16px;">Kinh tế đang ổn định.</div>`
      : d.activeEvents.map(ev=>{
          const t = ECONOMIC_EVENTS[ev.type];
          const remaining = ev.year + ev.duration - (window.year||0);
          return `<div style="background:${ev.color}11;border:1px solid ${ev.color}44;border-radius:10px;padding:12px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:20px;">${ev.emoji}</span>
              <span style="color:${ev.color};font-weight:700;">${ev.name}</span>
              <span style="background:${ev.color}33;color:${ev.color};padding:2px 8px;border-radius:10px;font-size:.78em;">${ev.phaseName}</span>
              <span style="margin-left:auto;color:var(--white-dim);font-size:.8em;">Còn ${remaining} năm</span>
            </div>
            <div style="font-size:.82em;color:var(--white-dim);">📍 ${ev.affectedRegions.join(", ")}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${Object.entries(ev.effects).filter(([,v])=>v!==0).map(([k,v])=>
                `<span style="font-size:.75em;color:${v>0?"#4ade80":"#f87171"};">${k}: ${v>0?"+":""}${v}${typeof v==="number"&&Math.abs(v)<10?"%":""}</span>`
              ).join("")}
            </div>
          </div>`;
        }).join("")
    }

    <!-- HISTORY -->
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.88em;">📜 Lịch Sử Sự Kiện Kinh Tế (${d.history.length})</div>
    <div style="max-height:220px;overflow-y:auto;">
      ${[...d.history].reverse().slice(0,20).map(ev=>
        `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.82em;">
          <span>${ev.emoji}</span>
          <span style="color:var(--white-main);">${ev.name}</span>
          <span style="color:#475569;">${ev.phaseName}</span>
          <span style="margin-left:auto;color:#475569;">Năm ${ev.year}</span>
        </div>`).join("") || `<div style="color:#475569;font-size:.83em;">Chưa có lịch sử.</div>`}
    </div>
  </div>`;
};

// ─── INIT ─────────────────────────────────────────────────────
function ecInit() {
  ecLoad();
  const _origTick = window.gameTick;
  window.gameTick = function() {
    if (_origTick) _origTick();
    if (Math.random() < 0.25) window.ecTick();
  };
  console.log("[EconomicCrisisEngine V25] 💹 Sự Kiện Kinh Tế khởi động — Lạm Phát · Suy Thoái · Bùng Nổ TM · Con Đường Tơ Lụa sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(ecInit, 3600); });
} else {
  setTimeout(ecInit, 3600);
}

})();
