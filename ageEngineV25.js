// ═══════════════════════════════════════════════════════════════
// AGE ENGINE V25 — Creator God World Simulator
// Các Thời Đại: Hoàng Kim · Đen Tối · Khám Phá · Công Nghệ · Ma Thuật
// Extension của ageEngine.js V1 — KHÔNG xóa file cũ
// Kết nối: disasterEngine · plagueEngine · worldMemoryEngine · timeline
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const SAVE_KEY = "cgv6_age_v25";

const AGES_V25 = {
  GOLDEN_AGE: {
    id:"GOLDEN_AGE", name:"Thời Đại Hoàng Kim", emoji:"🌟",
    color:"#f59e0b", bgGradient:"linear-gradient(135deg,rgba(245,158,11,.15),rgba(250,204,21,.08))",
    duration: [80,120,200],
    triggers: ["long_peace","trade_boom","divine_blessing","hero_unification"],
    effects: {
      economyBonus: 30,
      populationGrowth: 15,
      cultureBloom: 40,
      stabilityBonus: 20,
      techProgress: 20,
      disasterResistance: 0.5
    },
    events: [
      "Nghệ thuật và văn hóa thăng hoa rực rỡ",
      "Thương mại phồn thịnh khắp thiên hạ",
      "Dân số tăng vọt, thành thị mọc lên như nấm",
      "Các vị anh hùng huyền thoại xuất hiện",
      "Kiến trúc kỳ quan được xây dựng"
    ],
    transitionTo: ["DARK_AGE","TECH_AGE","MAGIC_AGE"],
    desc:"Thịnh vượng vô song — thời đại mà mọi sinh linh đều được hưởng thái bình."
  },
  DARK_AGE: {
    id:"DARK_AGE", name:"Thời Đại Đen Tối", emoji:"🌑",
    color:"#475569", bgGradient:"linear-gradient(135deg,rgba(71,85,105,.2),rgba(30,41,59,.15))",
    duration: [50,100,180],
    triggers: ["war_devastation","plague","disaster_chain","divine_wrath","collapse"],
    effects: {
      economyPenalty: -25,
      populationLoss: -10,
      stabilityPenalty: -30,
      knowledgeLoss: -20,
      disasterAmplify: 1.5,
      plagueChanceBonus: 0.15
    },
    events: [
      "Kiến thức cổ đại bị thất truyền",
      "Chiến tranh liên miên không ngừng",
      "Dịch bệnh hoành hành khắp nơi",
      "Đế quốc vĩ đại sụp đổ thành mảnh vụn",
      "Bóng tối che phủ, ánh sáng văn minh tắt lịm"
    ],
    transitionTo: ["GOLDEN_AGE","DISCOVERY_AGE"],
    desc:"Thời đại hỗn độn — văn minh sụp đổ, bóng tối bao trùm thiên hạ."
  },
  DISCOVERY_AGE: {
    id:"DISCOVERY_AGE", name:"Thời Đại Khám Phá", emoji:"🧭",
    color:"#06b6d4", bgGradient:"linear-gradient(135deg,rgba(6,182,212,.12),rgba(14,165,233,.08))",
    duration: [60,100,150],
    triggers: ["hero_explorer","trade_expansion","naval_growth","new_continent"],
    effects: {
      explorationBonus: 50,
      tradeRouteNew: 3,
      culturalExchange: 30,
      techProgress: 15,
      navalBonus: 40,
      newResourceChance: 0.4
    },
    events: [
      "Các thám hiểm gia khám phá vùng đất mới",
      "Tuyến đường thương mại biển mở rộng",
      "Giao lưu văn hóa với các dân tộc xa lạ",
      "Bản đồ thế giới được vẽ lại hoàn toàn",
      "Nguồn tài nguyên mới được phát hiện"
    ],
    transitionTo: ["TECH_AGE","GOLDEN_AGE","MAGIC_AGE"],
    desc:"Thời đại phiêu lưu — con người vượt đại dương khám phá những chân trời mới."
  },
  TECH_AGE: {
    id:"TECH_AGE", name:"Thời Đại Công Nghệ", emoji:"⚙️",
    color:"#60a5fa", bgGradient:"linear-gradient(135deg,rgba(96,165,250,.12),rgba(59,130,246,.08))",
    duration: [70,120,200],
    triggers: ["tech_breakthrough","multiple_inventions","sage_council","divine_wisdom"],
    effects: {
      techProgress: 60,
      economyBonus: 20,
      militaryStrength: 25,
      populationGrowth: 10,
      disasterResistance: 0.3,
      magicWeakening: -20
    },
    events: [
      "Các phát minh vĩ đại ra đời liên tiếp",
      "Máy móc thay thế lao động thủ công",
      "Vũ khí chiến tranh tiến hóa mạnh mẽ",
      "Y học phát triển, dịch bệnh giảm dần",
      "Giao thông và thông tin liên lạc cách mạng"
    ],
    transitionTo: ["GOLDEN_AGE","MAGIC_AGE","DISCOVERY_AGE"],
    desc:"Thời đại phát minh — tri thức và sáng tạo dẫn dắt nhân loại vượt lên giới hạn."
  },
  MAGIC_AGE: {
    id:"MAGIC_AGE", name:"Thời Đại Ma Thuật", emoji:"✨",
    color:"#a78bfa", bgGradient:"linear-gradient(135deg,rgba(167,139,250,.15),rgba(139,92,246,.08))",
    duration: [50,100,170],
    triggers: ["mana_surge","divine_blessing","artifact_awakening","cultivation_peak"],
    effects: {
      manaConcentration: 80,
      cultivationBonus: 50,
      artifactPowerBonus: 40,
      spiritualPower: 60,
      techWeakening: -15,
      mysticalEventChance: 0.4,
      soulPlagueResistance: 0.3
    },
    events: [
      "Linh khí thiên địa đạt đỉnh cực thịnh",
      "Tu tiên sĩ đạt cảnh giới chưa từng có",
      "Các thần thú huyền bí tái xuất thế gian",
      "Pháp bảo cổ đại tự thức tỉnh",
      "Ranh giới giữa cõi người và tiên giới mờ đi"
    ],
    transitionTo: ["DARK_AGE","GOLDEN_AGE","TECH_AGE"],
    desc:"Thời đại huyền bí — ma thuật và tu luyện đạt đến đỉnh điểm chưa từng thấy."
  }
};

// ─── STATE ───────────────────────────────────────────────────
window.ageV25Data = {
  currentAge: null,
  currentAgeName: "Thời Đại Hỗn Mang",
  ageStartYear: 0,
  ageHistory: [],
  totalAgeCount: 0,
  goldenAgeCount: 0,
  darkAgeCount: 0,
  longestAge: null,
  activeAgeEffects: {}
};

// ─── SAVE / LOAD ─────────────────────────────────────────────
function av25Save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ageV25Data)); } catch(e) {}
}
function av25Load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.ageV25Data = JSON.parse(d);
  } catch(e) {}
}

// ─── ENTER AGE ───────────────────────────────────────────────
window.av25EnterAge = function(ageId, durationOverride) {
  const age = AGES_V25[ageId];
  if (!age) return;

  const year = typeof window.year !== "undefined" ? window.year : 0;
  const durIdx = durationOverride !== undefined ? Math.min(durationOverride, 2) : Math.floor(Math.random() * 3);
  const duration = age.duration[durIdx];

  // Archive old age
  if (window.ageV25Data.currentAge) {
    const oldAge = AGES_V25[window.ageV25Data.currentAge];
    const record = {
      ageId: window.ageV25Data.currentAge,
      name: window.ageV25Data.currentAgeName,
      startYear: window.ageV25Data.ageStartYear,
      endYear: year,
      duration: year - window.ageV25Data.ageStartYear
    };
    window.ageV25Data.ageHistory.push(record);
    if (!window.ageV25Data.longestAge || record.duration > window.ageV25Data.longestAge.duration) {
      window.ageV25Data.longestAge = record;
    }
    _removeAgeEffects(oldAge);
  }

  window.ageV25Data.currentAge = ageId;
  window.ageV25Data.currentAgeName = age.name;
  window.ageV25Data.ageStartYear = year;
  window.ageV25Data.ageDuration = duration;
  window.ageV25Data.ageEndYear = year + duration;
  window.ageV25Data.totalAgeCount++;
  if (ageId === "GOLDEN_AGE") window.ageV25Data.goldenAgeCount++;
  if (ageId === "DARK_AGE") window.ageV25Data.darkAgeCount++;

  _applyAgeEffects(age);
  _recordAgeToTimeline(age, year, duration);
  _recordAgeToMemory(age, year);
  _broadcastAgeChange(age);
  _ageLog(age, year);

  av25Save();
  return { age, duration };
};

function _applyAgeEffects(age) {
  window.ageV25Data.activeAgeEffects = { ...age.effects };
  // Apply to world systems
  try {
    // Disaster engine integration
    if (window.disasterData && age.effects.disasterAmplify) {
      window.ageV25Data._savedDisasterChance = 0.06;
    }
    if (window.disasterData && age.effects.disasterResistance) {
      window.ageV25Data._disasterResistance = age.effects.disasterResistance;
    }
    // Plague engine
    if (window.plagueData && age.effects.plagueChanceBonus) {
      window.ageV25Data._plagueBonus = age.effects.plagueChanceBonus;
    }
    // Economy
    if (age.effects.economyBonus || age.effects.economyPenalty) {
      const bonus = age.effects.economyBonus || age.effects.economyPenalty || 0;
      const countries = window.countries || [];
      countries.forEach(c => {
        if (c.economy !== undefined) {
          c.economy = Math.max(0, Math.floor(c.economy * (1 + bonus/100)));
        }
      });
    }
  } catch(e) {}
}

function _removeAgeEffects(age) {
  window.ageV25Data.activeAgeEffects = {};
  window.ageV25Data._disasterResistance = 0;
  window.ageV25Data._plagueBonus = 0;
}

function _recordAgeToTimeline(age, year, duration) {
  try {
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({
        year, type:"age",
        title: age.emoji + " " + age.name + " bắt đầu (dự kiến " + duration + " năm)",
        color: age.color, isEpoch: true
      });
    }
    const tl = window.worldTimeline || window.timeline;
    if (Array.isArray(tl)) {
      tl.push({ year, type:"age", event: age.emoji + " " + age.name + " bắt đầu", isEpoch:true });
    }
  } catch(e) {}
}

function _recordAgeToMemory(age, year) {
  try {
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({
        year, category:"age",
        title: "🌅 " + age.name + " Bắt Đầu",
        content: age.desc + " Các sự kiện đặc trưng: " + age.events.slice(0,2).join("; ")
      });
    }
  } catch(e) {}
}

function _broadcastAgeChange(age) {
  try {
    // Notify other engines
    const e = new CustomEvent("ageChanged_v25", { detail: { age: age.id, name: age.name } });
    document.dispatchEvent(e);
    // Update worldEventEngine V1 if exists
    if (window.currentAge !== undefined) window.currentAge = age.id;
  } catch(e) {}
}

function _ageLog(age, year) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      logEl.innerHTML += `<div style="color:${age.color};border-left:4px solid ${age.color};padding:8px 12px;margin:4px 0;background:${age.bgGradient};">
        [Năm ${year}] ${age.emoji} <strong style="font-size:1.05em;">${age.name} BẮT ĐẦU</strong>
        <br><span style="font-size:.85em;color:var(--white-dim);">${age.desc}</span>
      </div>`;
    }
  } catch(e) {}
}

// ─── AGE EVENTS ──────────────────────────────────────────────
window.av25TriggerAgeEvent = function() {
  const currentAge = window.ageV25Data.currentAge;
  if (!currentAge) return;
  const age = AGES_V25[currentAge];
  if (!age) return;
  const ev = age.events[Math.floor(Math.random() * age.events.length)];
  _ageEventLog(age, ev);
  _recordAgeToTimeline({ ...age, name: ev }, window.year||0, 0);
};

function _ageEventLog(age, ev) {
  try {
    const logEl = document.getElementById("logs");
    if (logEl) {
      logEl.innerHTML += `<div style="color:${age.color};padding:3px 8px;margin:2px 0;font-size:.85em;">
        ${age.emoji} [${age.name}] ${ev}
      </div>`;
    }
  } catch(e) {}
}

// ─── TICK ────────────────────────────────────────────────────
window.av25Tick = function() {
  const year = typeof window.year !== "undefined" ? window.year : 0;
  const d = window.ageV25Data;

  // Check for age transition
  if (d.currentAge && d.ageEndYear && year >= d.ageEndYear) {
    const age = AGES_V25[d.currentAge];
    const possibleNext = age ? age.transitionTo : Object.keys(AGES_V25);
    const nextAgeId = possibleNext[Math.floor(Math.random() * possibleNext.length)];
    window.av25EnterAge(nextAgeId);
    return;
  }

  // Initial age assignment
  if (!d.currentAge && (window.countries||[]).length > 0) {
    // Start with a random age (weighted toward Golden or Discovery)
    const startAges = ["GOLDEN_AGE","GOLDEN_AGE","DISCOVERY_AGE","DARK_AGE","MAGIC_AGE"];
    window.av25EnterAge(startAges[Math.floor(Math.random() * startAges.length)], 0);
    return;
  }

  // Random age events
  if (d.currentAge && Math.random() < 0.08) {
    window.av25TriggerAgeEvent();
  }

  av25Save();
};

// ─── RENDER PANEL ────────────────────────────────────────────
window.av25RenderPanel = function() {
  const el = document.getElementById("panel-age-v25");
  if (!el) return;
  const d = window.ageV25Data;
  const currentAgeData = d.currentAge ? AGES_V25[d.currentAge] : null;
  const year = typeof window.year !== "undefined" ? window.year : 0;
  const yearsInAge = year - d.ageStartYear;
  const yearsRemaining = d.ageEndYear ? Math.max(0, d.ageEndYear - year) : "—";

  el.innerHTML = `
  <div style="padding:20px;max-width:1000px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">🌅</span>
      <div><div style="font-family:var(--font-title);font-size:1.4em;color:#f59e0b;">Thời Đại V25</div>
      <div style="color:var(--white-dim);font-size:.82em;">Hoàng Kim · Đen Tối · Khám Phá · Công Nghệ · Ma Thuật · Kết nối toàn bộ engine</div></div>
    </div>

    <!-- CURRENT AGE HERO -->
    ${currentAgeData ? `
    <div style="background:${currentAgeData.bgGradient};border:2px solid ${currentAgeData.color}55;border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">${currentAgeData.emoji}</div>
      <div style="font-family:var(--font-title);font-size:1.5em;color:${currentAgeData.color};margin-bottom:6px;">${currentAgeData.name}</div>
      <div style="color:var(--white-dim);font-size:.85em;margin-bottom:12px;">${currentAgeData.desc}</div>
      <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
        <span style="color:var(--white-dim);font-size:.83em;">📅 Bắt Đầu Năm ${d.ageStartYear}</span>
        <span style="color:${currentAgeData.color};font-size:.83em;">⏳ Đã ${yearsInAge} năm</span>
        <span style="color:var(--white-dim);font-size:.83em;">🏁 Còn ≈${yearsRemaining} năm</span>
      </div>
      <!-- Effects badges -->
      <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;">
        ${Object.entries(currentAgeData.effects).filter(([,v])=>typeof v==="number"&&v!==0).map(([k,v])=>
          `<span style="background:${v>0?"rgba(34,197,94,.15)":"rgba(220,38,38,.15)"};border:1px solid ${v>0?"#22c55e":"#dc2626"};color:${v>0?"#4ade80":"#f87171"};padding:2px 10px;border-radius:20px;font-size:.78em;">${k}: ${v>0?"+":""}${v}${Math.abs(v)>1&&Math.abs(v)<10?"%":""}</span>`
        ).join("")}
      </div>
      <!-- Age events -->
      <div style="text-align:left;background:rgba(0,0,0,.2);border-radius:8px;padding:10px;">
        <div style="font-size:.78em;color:var(--gold-dim);margin-bottom:6px;">✨ Sự Kiện Đặc Trưng Thời Đại</div>
        ${currentAgeData.events.map(e=>`<div style="color:var(--white-dim);font-size:.8em;padding:2px 0;">• ${e}</div>`).join("")}
      </div>
    </div>` : `
    <div style="background:var(--bg-card);border:1px dashed var(--border);border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;color:#475569;">
      Chưa bước vào Thời Đại. Cần có thế giới với quốc gia.
    </div>`}

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
      ${[
        {icon:"🌟",label:"Thời Đại Hoàng Kim",val:d.goldenAgeCount,color:"#f59e0b"},
        {icon:"🌑",label:"Thời Đại Đen Tối",val:d.darkAgeCount,color:"#475569"},
        {icon:"📅",label:"Tổng Thời Đại",val:d.totalAgeCount,color:"#60a5fa"},
        {icon:"🏆",label:"Dài Nhất",val:d.longestAge?d.longestAge.duration+" năm":"—",color:"#4ade80"},
      ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;">${s.icon}</div>
        <div style="font-size:1.1em;font-weight:700;color:${s.color};">${s.val}</div>
        <div style="font-size:.72em;color:var(--white-dim);margin-top:2px;">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- ALL AGES OVERVIEW -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">🌍 Tất Cả Thời Đại</div>
    <div style="display:grid;grid-template-columns:repeat(${Object.keys(AGES_V25).length},1fr);gap:8px;margin-bottom:20px;">
      ${Object.values(AGES_V25).map(age=>{
        const isActive = d.currentAge === age.id;
        return `<div style="background:${isActive?age.bgGradient:"var(--bg-card)"};border:${isActive?"2px":"1px"} solid ${isActive?age.color+"88":"var(--border)"};border-radius:10px;padding:12px;text-align:center;cursor:pointer;"
          onclick="window.av25EnterAge('${age.id}'); window.av25RenderPanel();">
          <div style="font-size:22px;">${age.emoji}</div>
          <div style="font-size:.78em;color:${isActive?age.color:"var(--white-dim)"};margin-top:4px;font-weight:${isActive?"700":"400"};">${age.name.replace("Thời Đại ","")}</div>
          ${isActive?`<div style="font-size:.7em;color:${age.color};margin-top:2px;">● ĐANG HOẠT ĐỘNG</div>`:""}
          <div style="margin-top:6px;background:rgba(255,255,255,.04);border-radius:6px;padding:3px;font-size:.68em;color:#475569;">Nhấn để bước vào</div>
        </div>`;
      }).join("")}
    </div>

    <!-- HISTORY -->
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.88em;">📜 Lịch Sử Thời Đại (${d.ageHistory.length})</div>
    <div style="max-height:220px;overflow-y:auto;">
      ${[...d.ageHistory].reverse().slice(0,15).map(h=>{
        const a = AGES_V25[h.ageId];
        return `<div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.04);">
          <span style="font-size:16px;">${a?a.emoji:"🌅"}</span>
          <span style="color:${a?a.color:"var(--white-dim)"};font-size:.85em;">${h.name}</span>
          <span style="color:#475569;font-size:.78em;">Năm ${h.startYear}–${h.endYear}</span>
          <span style="margin-left:auto;color:var(--white-dim);font-size:.78em;">${h.duration} năm</span>
        </div>`;
      }).join("") || `<div style="color:#475569;font-size:.83em;padding:8px;">Chưa có lịch sử thời đại.</div>`}
    </div>
  </div>`;
};

// ─── INIT ─────────────────────────────────────────────────────
function av25Init() {
  av25Load();
  const _origTick = window.gameTick;
  window.gameTick = function() {
    if (_origTick) _origTick();
    if (Math.random() < 0.15) window.av25Tick();
  };
  console.log("[AgeEngineV25] 🌅 Thời Đại V25 khởi động — Hoàng Kim · Đen Tối · Khám Phá · Công Nghệ · Ma Thuật sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(av25Init, 4000); });
} else {
  setTimeout(av25Init, 4000);
}

})();
