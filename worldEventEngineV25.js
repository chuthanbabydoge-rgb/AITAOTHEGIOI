// ═══════════════════════════════════════════════════════════════
// WORLD EVENT ENGINE V25 — Creator God World Simulator
// Sự Kiện Chính Trị: Ám Sát · Cách Mạng · Nổi Loạn · Đảo Chính
// Extension của worldEventEngine.js V1 — KHÔNG xóa file cũ
// Kết nối: diplomaticEngine · warEngine · worldMemoryEngine · timeline
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const SAVE_KEY = "cgv6_world_event_v25";

const POLITICAL_EVENTS = {
  ASSASSINATION: {
    id:"ASSASSINATION", name:"Ám Sát", emoji:"🗡️", color:"#dc2626",
    targets:["Hoàng Đế","Vua","Tể Tướng","Tướng Quân","Lãnh Tụ Tông Môn"],
    consequences:{
      stability: [-20,-40,-60],
      war_chance: [0.2, 0.4, 0.8],
      succession_crisis: [true,true,true]
    },
    desc:"Một nhân vật quyền lực bị ám sát trong bóng tối, thiên hạ rơi vào hỗn loạn."
  },
  REVOLUTION: {
    id:"REVOLUTION", name:"Cách Mạng", emoji:"⚔️", color:"#f97316",
    phases:["Dấy Loạn","Nổi Dậy","Cách Mạng","Lật Đổ Triều Đại"],
    consequences:{
      stability: [-10,-30,-55,-80],
      governmentChange: [false,true,true,true],
      economyImpact: [-5,-20,-40,-60]
    },
    desc:"Dân chúng vùng lên chống lại kẻ cầm quyền, lật đổ chế độ cũ."
  },
  REBELLION: {
    id:"REBELLION", name:"Nổi Loạn", emoji:"🔥", color:"#f59e0b",
    scales:["Nhỏ","Vừa","Lớn","Toàn Quốc"],
    consequences:{
      stability: [-8,-20,-40,-70],
      territory_loss: [0,0.1,0.25,0.5],
      military_cost: [5,15,30,60]
    },
    desc:"Một bộ phận dân chúng hoặc quân đội nổi dậy, đe dọa quyền lực trung ương."
  },
  COUP: {
    id:"COUP", name:"Đảo Chính", emoji:"👑", color:"#7c3aed",
    types:["Mưu Lật","Binh Biến","Đảo Chính Hoàn Hảo","Đế Quyền Thâu Tóm"],
    consequences:{
      stability: [-15,-35,-50,-20],
      leaderChange: [false,true,true,true],
      economyImpact: [-5,-15,-25,5]
    },
    desc:"Phe quân sự hoặc귀족 tiến hành cướp quyền lực từ người lãnh đạo hiện tại."
  },
  CIVIL_WAR: {
    id:"CIVIL_WAR", name:"Nội Chiến", emoji:"⚔️", color:"#ef4444",
    phases:["Căng Thẳng","Xung Đột","Nội Chiến Toàn Diện","Hủy Diệt Nội Bộ"],
    consequences:{
      stability: [-20,-45,-70,-95],
      population: [-5,-15,-30,-55],
      economyImpact: [-10,-25,-50,-80],
      duration: [3,8,15,30]
    },
    desc:"Quốc gia chìm vào nội chiến, hai phe đối lập tàn sát lẫn nhau."
  }
};

// ─── STATE ───────────────────────────────────────────────────
window.worldEventV25Data = {
  activeEvents: [],
  history: [],
  eventCount: 0,
  politicalInstability: 0,
  regimesOverthrownCount: 0,
  assassinationCount: 0,
  civilWarCount: 0
};

// ─── SAVE / LOAD ─────────────────────────────────────────────
function wev25Save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldEventV25Data)); } catch(e) {}
}
function wev25Load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.worldEventV25Data = JSON.parse(d);
  } catch(e) {}
}

// ─── TRIGGER EVENT ───────────────────────────────────────────
window.wev25TriggerEvent = function(typeId, targetRegion, severityOverride) {
  const type = POLITICAL_EVENTS[typeId];
  if (!type) return null;

  const countries = window.countries || [];
  const year = typeof window.year !== "undefined" ? window.year : 0;

  const sevArr = type.phases || type.scales || type.types || type.targets || [];
  const sev = severityOverride !== undefined
    ? Math.min(severityOverride, sevArr.length - 1)
    : Math.floor(Math.random() * sevArr.length);

  const region = targetRegion || (countries.length > 0
    ? countries[Math.floor(Math.random() * countries.length)].name
    : "Vương Quốc Vô Danh");

  // Generate narrative
  const target = type.targets
    ? type.targets[Math.floor(Math.random() * type.targets.length)]
    : null;

  const event = {
    id: "wev_" + Date.now(),
    type: typeId, name: type.name, emoji: type.emoji, color: type.color,
    region, sev, sevName: sevArr[sev] || sevArr[0],
    target,
    year,
    duration: _calcPoliticalDuration(typeId, sev),
    active: true, consequences: {}
  };

  // Calc consequences
  for (const [k, v] of Object.entries(type.consequences)) {
    event.consequences[k] = Array.isArray(v) ? v[Math.min(sev, v.length-1)] : v;
  }

  window.worldEventV25Data.activeEvents.push(event);
  window.worldEventV25Data.eventCount++;

  _applyPoliticalEffects(event, type, countries);
  _trackPoliticalStats(event);
  _recordPoliticalToTimeline(event, type);
  _recordPoliticalToMemory(event, type);
  _politicalLog(event, type);

  wev25Save();
  return event;
};

function _calcPoliticalDuration(typeId, sev) {
  const map = {
    ASSASSINATION: [1,1,2], REVOLUTION: [3,8,15,30],
    REBELLION: [2,6,12,25], COUP: [1,2,3,5],
    CIVIL_WAR: [3,8,15,30]
  };
  const arr = map[typeId] || [3,5,10,20];
  return arr[Math.min(sev, arr.length-1)] + Math.floor(Math.random()*3);
}

function _applyPoliticalEffects(event, type, countries) {
  const target = countries.find(c => c.name === event.region);
  if (!target) return;

  const c = event.consequences;
  if (c.stability !== undefined && target.stability !== undefined) {
    target.stability = Math.max(0, Math.min(100, target.stability + (typeof c.stability==="number"?c.stability:-20)));
  }
  if (c.economyImpact && target.economy !== undefined) {
    const loss = Math.floor(Math.abs(c.economyImpact) / 100 * target.economy);
    if (c.economyImpact < 0) target.economy = Math.max(0, target.economy - loss);
    else target.economy += loss;
  }
  if (c.population && target.population) {
    const loss = Math.floor(Math.abs(c.population) / 100 * target.population);
    if (typeof c.population === "number" && c.population < 0) {
      target.population = Math.max(10, target.population - loss);
    }
  }
  // Trigger war chance for assassination
  if (c.war_chance && Math.random() < c.war_chance) {
    try {
      if (typeof window.warEngine_declareWar === "function") {
        const others = countries.filter(co => co.name !== event.region);
        if (others.length > 0) {
          const attacker = others[Math.floor(Math.random() * others.length)];
          window.warEngine_declareWar(attacker.name, event.region, "Tranh Quyền Hậu Ám Sát");
        }
      }
    } catch(e) {}
  }
}

function _trackPoliticalStats(event) {
  const d = window.worldEventV25Data;
  if (event.type === "ASSASSINATION") d.assassinationCount++;
  if (event.type === "CIVIL_WAR") d.civilWarCount++;
  if (event.consequences.governmentChange || event.consequences.leaderChange) d.regimesOverthrownCount++;
  d.politicalInstability = Math.min(100, d.politicalInstability + 5);
}

function _recordPoliticalToTimeline(event, type) {
  try {
    const title = event.emoji + " " + event.name + (event.target?" — "+event.target:"") + " tại " + event.region;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year:window.year||0, type:"political", title, color:type.color });
    }
    const tl = window.worldTimeline || window.timeline;
    if (Array.isArray(tl)) tl.push({ year:window.year||0, type:"political", event:title });
  } catch(e) {}
}

function _recordPoliticalToMemory(event, type) {
  try {
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year:window.year||0, category:"political",
        title: event.emoji + " " + event.name + " tại " + event.region,
        content: (event.sevName||"") + ". " + type.desc });
    }
  } catch(e) {}
}

function _politicalLog(event, type) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      logEl.innerHTML += `<div style="color:${type.color};border-left:3px solid ${type.color};padding:4px 8px;margin:2px 0;">
        [Năm ${window.year||0}] ${event.emoji} <strong>${event.name}</strong>${event.sevName?" ("+event.sevName+")":""}
        ${event.target?" — <em>"+event.target+"</em>":""}
        tại <strong>${event.region}</strong>
      </div>`;
    }
  } catch(e) {}
}

// ─── TICK ────────────────────────────────────────────────────
window.wev25Tick = function() {
  const countries = window.countries || [];
  const year = typeof window.year !== "undefined" ? window.year : 0;

  // Resolve
  window.worldEventV25Data.activeEvents.forEach(ev => {
    if (ev.active && year >= ev.year + ev.duration) {
      ev.active = false;
      window.worldEventV25Data.history.push(ev);
    }
  });
  window.worldEventV25Data.activeEvents = window.worldEventV25Data.activeEvents.filter(e => e.active);

  // Decay instability
  window.worldEventV25Data.politicalInstability = Math.max(0, window.worldEventV25Data.politicalInstability - 0.5);

  // Auto-trigger based on instability + random
  const instability = window.worldEventV25Data.politicalInstability;
  const baseChance = 0.03 + (instability / 100) * 0.08 + countries.length * 0.001;
  if (Math.random() < baseChance) {
    const types = Object.keys(POLITICAL_EVENTS);
    window.wev25TriggerEvent(types[Math.floor(Math.random() * types.length)]);
  }

  wev25Save();
};

// ─── RENDER PANEL ────────────────────────────────────────────
window.wev25RenderPanel = function() {
  const el = document.getElementById("panel-world-event-v25");
  if (!el) return;
  const d = window.worldEventV25Data;

  el.innerHTML = `
  <div style="padding:20px;max-width:1000px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">🗡️</span>
      <div><div style="font-family:var(--font-title);font-size:1.4em;color:#dc2626;">Sự Kiện Chính Trị V25</div>
      <div style="color:var(--white-dim);font-size:.82em;">Ám Sát · Cách Mạng · Nổi Loạn · Đảo Chính · Nội Chiến · Kết nối War & Diplomacy Engine</div></div>
    </div>

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
      ${[
        {icon:"🔥",label:"Bất Ổn Chính Trị",val:d.politicalInstability.toFixed(0)+"%",color:d.politicalInstability>70?"#f87171":d.politicalInstability>40?"#fbbf24":"#4ade80"},
        {icon:"🗡️",label:"Ám Sát",val:d.assassinationCount,color:"#dc2626"},
        {icon:"👑",label:"Chế Độ Lật Đổ",val:d.regimesOverthrownCount,color:"#7c3aed"},
        {icon:"⚔️",label:"Nội Chiến",val:d.civilWarCount,color:"#f97316"},
      ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;">${s.icon}</div>
        <div style="font-size:1.1em;font-weight:700;color:${s.color};">${s.val}</div>
        <div style="font-size:.72em;color:var(--white-dim);margin-top:2px;">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- INSTABILITY BAR -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;font-size:.82em;margin-bottom:4px;">
        <span style="color:var(--white-dim);">⚖️ Mức Độ Bất Ổn Chính Trị</span>
        <span style="color:${d.politicalInstability>70?"#f87171":d.politicalInstability>40?"#fbbf24":"#4ade80"};">${d.politicalInstability.toFixed(0)}%</span>
      </div>
      <div style="height:8px;background:var(--bg-secondary);border-radius:4px;">
        <div style="height:8px;background:${d.politicalInstability>70?"linear-gradient(90deg,#dc2626,#f87171)":d.politicalInstability>40?"linear-gradient(90deg,#ca8a04,#fbbf24)":"linear-gradient(90deg,#15803d,#4ade80)"};border-radius:4px;width:${d.politicalInstability}%;transition:width .3s;"></div>
      </div>
    </div>

    <!-- GOD POWER -->
    <div style="background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.3);border-radius:12px;padding:14px;margin-bottom:20px;">
      <div style="font-family:var(--font-title);color:#fca5a5;margin-bottom:10px;font-size:.88em;">⚡ Quyền Năng Thần — Kích Hoạt Sự Kiện Chính Trị</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        ${Object.values(POLITICAL_EVENTS).map(t=>`
        <button onclick="window.wev25TriggerEvent('${t.id}'); window.wev25RenderPanel();"
          style="background:${t.color}20;border:1px solid ${t.color}55;color:${t.color};padding:8px 14px;border-radius:8px;cursor:pointer;font-size:.83em;">
          ${t.emoji} ${t.name}
        </button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Object.values(POLITICAL_EVENTS).map(t=>`
        <button onclick="window.wev25TriggerEvent('${t.id}',null,${(t.phases||t.scales||t.types||t.targets||[]).length-1}); window.wev25RenderPanel();"
          style="background:rgba(220,38,38,.2);border:1px solid #dc2626;color:#fca5a5;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.75em;">
          ☠️ ${t.name} Tối Đại
        </button>`).join("")}
      </div>
    </div>

    <!-- ACTIVE EVENTS -->
    <div style="font-family:var(--font-title);color:#dc2626;margin-bottom:8px;font-size:.88em;">🔥 Sự Kiện Đang Diễn Ra (${d.activeEvents.length})</div>
    ${d.activeEvents.length===0
      ? `<div style="color:#475569;font-size:.85em;margin-bottom:16px;">Chính trị đang ổn định.</div>`
      : d.activeEvents.map(ev=>{
          const t = POLITICAL_EVENTS[ev.type];
          const remaining = ev.year + ev.duration - (window.year||0);
          return `<div style="background:${ev.color}11;border:1px solid ${ev.color}44;border-radius:10px;padding:12px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${ev.emoji}</span>
              <span style="color:${ev.color};font-weight:700;">${ev.name}</span>
              ${ev.sevName?`<span style="background:${ev.color}33;color:${ev.color};padding:2px 8px;border-radius:10px;font-size:.78em;">${ev.sevName}</span>`:""}
              ${ev.target?`<span style="color:var(--white-dim);font-size:.82em;">→ ${ev.target}</span>`:""}
              <span style="margin-left:auto;color:var(--white-dim);font-size:.8em;">Còn ${remaining} năm</span>
            </div>
            <div style="font-size:.82em;color:var(--white-dim);margin-top:4px;">📍 ${ev.region} · Năm ${ev.year}</div>
          </div>`;
        }).join("")
    }

    <!-- HISTORY -->
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.88em;">📜 Lịch Sử Chính Trị (${d.history.length})</div>
    <div style="max-height:220px;overflow-y:auto;">
      ${[...d.history].reverse().slice(0,20).map(ev=>
        `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.82em;">
          <span>${ev.emoji}</span>
          <span style="color:var(--white-main);">${ev.name}</span>
          ${ev.sevName?`<span style="color:#475569;">${ev.sevName}</span>`:""}
          <span style="color:var(--white-dim);">tại ${ev.region}</span>
          <span style="margin-left:auto;color:#475569;">Năm ${ev.year}</span>
        </div>`).join("") || `<div style="color:#475569;font-size:.83em;">Chưa có lịch sử.</div>`}
    </div>
  </div>`;
};

// ─── INIT ─────────────────────────────────────────────────────
function wev25Init() {
  wev25Load();
  const _origTick = window.gameTick;
  window.gameTick = function() {
    if (_origTick) _origTick();
    if (Math.random() < 0.22) window.wev25Tick();
  };
  console.log("[WorldEventEngineV25] 🗡️ Sự Kiện Chính Trị V25 khởi động — Ám Sát · Cách Mạng · Nổi Loạn · Đảo Chính · Nội Chiến sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(wev25Init, 3800); });
} else {
  setTimeout(wev25Init, 3800);
}

})();
