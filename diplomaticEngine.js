// ═══════════════════════════════════════════════════════════════
// DIPLOMATIC RELATIONS ENGINE V1 — Creator God World Simulator V23
// Hệ thống Ngoại Giao: Đại Sứ · Hiệp Ước · Tuyên Chiến · Bản Đồ Quan Hệ
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

// ─── CONSTANTS ───────────────────────────────────────────────────
const STORAGE_KEY = "cgv6_diplomacy";

const RELATION_STATUS = {
  ALLIED:    { label: "Liên Minh",        color: "#4ade80", icon: "🤝", score: 100 },
  FRIENDLY:  { label: "Thân Thiện",       color: "#86efac", icon: "😊", score:  60 },
  NEUTRAL:   { label: "Trung Lập",        color: "#94a3b8", icon: "😐", score:   0 },
  TENSE:     { label: "Căng Thẳng",       color: "#fbbf24", icon: "😤", score: -40 },
  HOSTILE:   { label: "Thù Địch",         color: "#f87171", icon: "⚡", score: -70 },
  WAR:       { label: "Chiến Tranh",      color: "#ef4444", icon: "⚔️", score:-100 },
  TRIBUTARY: { label: "Chư Hầu",         color: "#a78bfa", icon: "💎", score:  30 },
};

const TREATY_TYPES = {
  PEACE:        { label: "Hòa Bình",            icon: "🕊️",  duration: 20, relationBonus: 40 },
  TRADE:        { label: "Thương Mại",          icon: "💰",  duration: 30, relationBonus: 25 },
  ALLIANCE:     { label: "Liên Minh Quân Sự",  icon: "⚔️",  duration: 50, relationBonus: 60 },
  NON_AGGR:     { label: "Không Xâm Phạm",     icon: "🛡️",  duration: 25, relationBonus: 30 },
  TRIBUTARY:    { label: "Triều Cống",          icon: "💎",  duration: 40, relationBonus: 20 },
  MARRIAGE:     { label: "Hôn Ước Chính Trị",  icon: "💍",  duration: 60, relationBonus: 50 },
  OPEN_BORDERS: { label: "Mở Biên Giới",       icon: "🚪",  duration: 35, relationBonus: 15 },
};

const AMBASSADOR_TITLES = [
  "Đại Sứ", "Đặc Phái Viên", "Sứ Thần", "Đại Biểu", "Đặc Sứ", "Toàn Quyền Đại Sứ"
];

// ─── STATE ───────────────────────────────────────────────────────
let state = {
  relations:    {},   // "powerA|powerB" → { score, status, treaties:[], history:[] }
  ambassadors:  [],   // { id, from, to, title, name, sentYear, status }
  treaties:     [],   // { id, type, partyA, partyB, signedYear, expiresYear, active }
  warDeclared:  [],   // { id, attacker, defender, year, reason, resolved }
  diplomacyLog: [],   // { year, msg, type }
  aiCooldown:   {},   // powerName → lastActionYear
  initialized:  false,
};

// ─── SAVE / LOAD ─────────────────────────────────────────────────
function drSave() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

function drLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
    }
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────
function _pairKey(a, b) {
  const [x, y] = [a, b].sort();
  return x + "|" + y;
}

function _getRelation(a, b) {
  const k = _pairKey(a, b);
  if (!state.relations[k]) {
    state.relations[k] = { score: 0, status: "NEUTRAL", treaties: [], history: [] };
  }
  return state.relations[k];
}

function _scoreToStatus(score) {
  if (score >= 80) return "ALLIED";
  if (score >= 40) return "FRIENDLY";
  if (score >= -20) return "NEUTRAL";
  if (score >= -50) return "TENSE";
  if (score >= -80) return "HOSTILE";
  return "WAR";
}

function _getPowers() {
  const powers = [];
  if (window.kingdoms) {
    window.kingdoms.forEach(k => {
      if (k.active !== false) powers.push({ id: k.id || k.name, name: k.name, type: "kingdom", power: (k.armies||0) + (k.population||0)/1000 });
    });
  }
  if (window.empires) {
    window.empires.forEach(e => {
      if (e.collapsed !== true) powers.push({ id: e.id || e.name, name: e.name, type: "empire", power: (e.armies||0) + (e.totalPop||0)/1000 + 50 });
    });
  }
  if (window.countries && powers.length === 0) {
    window.countries.filter(c => !c.collapsed).slice(0, 12).forEach(c => {
      powers.push({ id: c.name, name: c.name, type: "nation", power: (c.military||0) + (c.population||0)/1000 });
    });
  }
  return powers;
}

function _randomName() {
  const firstNames = ["Nguyễn Văn","Trần Thị","Lê Hoàng","Phạm Minh","Vũ Đức","Đặng Thái","Bùi An","Hoàng Kim","Đinh Long","Lý Bạch"];
  const lastNames  = ["Hùng","Minh","Dũng","Anh","Tuấn","Khải","Phong","Thắng","Bình","Quang"];
  return firstNames[Math.floor(Math.random()*firstNames.length)] + " " + lastNames[Math.floor(Math.random()*lastNames.length)];
}

function _currentYear() {
  return (typeof window.year !== "undefined") ? window.year : 0;
}

function _log(msg, type) {
  state.diplomacyLog.unshift({ year: _currentYear(), msg, type: type||"info" });
  if (state.diplomacyLog.length > 200) state.diplomacyLog.pop();
  if (typeof addLog === "function") addLog("[Ngoại Giao] " + msg, type||"info");
  if (typeof htAddEvent === "function") htAddEvent({ year: _currentYear(), text: msg, tag: "diplomacy" });
}

// ─── CORE ACTIONS ────────────────────────────────────────────────
function drSendAmbassador(fromName, toName) {
  const existing = state.ambassadors.find(a =>
    a.from === fromName && a.to === toName && a.status === "active"
  );
  if (existing) return { ok: false, msg: "Đã có đại sứ đang hoạt động tại " + toName };

  const ambassador = {
    id:        "amb_" + Date.now(),
    from:      fromName,
    to:        toName,
    title:     AMBASSADOR_TITLES[Math.floor(Math.random() * AMBASSADOR_TITLES.length)],
    name:      _randomName(),
    sentYear:  _currentYear(),
    status:    "active",
  };
  state.ambassadors.push(ambassador);

  const rel = _getRelation(fromName, toName);
  rel.score = Math.min(100, rel.score + 10);
  rel.status = _scoreToStatus(rel.score);
  rel.history.push({ year: _currentYear(), event: "Phái đại sứ", delta: +10 });

  _log(`🏛 ${fromName} phái ${ambassador.title} ${ambassador.name} tới ${toName}`);
  drSave();
  return { ok: true, ambassador };
}

function drProposeTreaty(partyA, partyB, treatyType) {
  const tDef = TREATY_TYPES[treatyType];
  if (!tDef) return { ok: false, msg: "Loại hiệp ước không hợp lệ" };

  const rel = _getRelation(partyA, partyB);
  if (rel.status === "WAR" && treatyType !== "PEACE") {
    return { ok: false, msg: "Không thể ký hiệp ước khi đang trong chiến tranh. Hãy ký Hòa Bình trước." };
  }

  const existingTreaty = state.treaties.find(t =>
    t.type === treatyType && t.active &&
    ((t.partyA === partyA && t.partyB === partyB) || (t.partyA === partyB && t.partyB === partyA))
  );
  if (existingTreaty) return { ok: false, msg: `Hiệp ước ${tDef.label} đã tồn tại giữa hai bên` };

  const year = _currentYear();
  const treaty = {
    id:          "treaty_" + Date.now(),
    type:        treatyType,
    label:       tDef.label,
    icon:        tDef.icon,
    partyA,
    partyB,
    signedYear:  year,
    expiresYear: year + tDef.duration,
    active:      true,
  };
  state.treaties.push(treaty);

  rel.score = Math.min(100, rel.score + tDef.relationBonus);
  rel.status = _scoreToStatus(rel.score);
  if (treatyType === "ALLIANCE") rel.status = "ALLIED";
  if (treatyType === "TRIBUTARY") rel.status = "TRIBUTARY";
  rel.treaties.push(treaty.id);
  rel.history.push({ year, event: "Ký " + tDef.label, delta: +tDef.relationBonus });

  if (treatyType === "PEACE") {
    state.warDeclared.forEach(w => {
      if (w.active && ((w.attacker===partyA&&w.defender===partyB)||(w.attacker===partyB&&w.defender===partyA))) {
        w.active = false; w.resolvedYear = year;
      }
    });
  }

  _log(`${tDef.icon} ${partyA} & ${partyB} ký kết ${tDef.label} (hết hạn năm ${treaty.expiresYear})`, "important");
  drSave();
  drRenderPanel();
  return { ok: true, treaty };
}

function drDeclareWar(attacker, defender, reason) {
  const rel = _getRelation(attacker, defender);

  state.treaties = state.treaties.map(t => {
    if (t.active && ((t.partyA===attacker&&t.partyB===defender)||(t.partyA===defender&&t.partyB===attacker))) {
      t.active = false;
      t.brokenYear = _currentYear();
      t.brokenBy = attacker;
    }
    return t;
  });

  state.ambassadors = state.ambassadors.map(a => {
    if ((a.from===attacker&&a.to===defender)||(a.from===defender&&a.to===attacker)) {
      a.status = "recalled";
    }
    return a;
  });

  rel.score = -100;
  rel.status = "WAR";
  rel.history.push({ year: _currentYear(), event: "Tuyên chiến", delta: -100 });

  const declaration = {
    id:        "war_" + Date.now(),
    attacker,
    defender,
    year:      _currentYear(),
    reason:    reason || "Tranh chấp lãnh thổ",
    active:    true,
  };
  state.warDeclared.push(declaration);

  _log(`⚔️ ${attacker} TUYÊN CHIẾN với ${defender}! Lý do: ${declaration.reason}`, "danger");
  if (typeof toast === "function") toast(`⚔️ ${attacker} tuyên chiến với ${defender}!`, "danger");
  drSave();
  drRenderPanel();
  return { ok: true, declaration };
}

function drBreakTreaty(partyA, partyB, treatyId) {
  const treaty = state.treaties.find(t => t.id === treatyId && t.active);
  if (!treaty) return { ok: false, msg: "Hiệp ước không tồn tại hoặc đã hết hiệu lực" };

  treaty.active = false;
  treaty.brokenYear = _currentYear();
  treaty.brokenBy = partyA;

  const rel = _getRelation(partyA, partyB);
  rel.score = Math.max(-100, rel.score - 30);
  rel.status = _scoreToStatus(rel.score);
  rel.history.push({ year: _currentYear(), event: "Phá vỡ " + treaty.label, delta: -30 });

  _log(`💔 ${partyA} đã phá vỡ hiệp ước ${treaty.label} với ${partyB}`, "danger");
  drSave();
  drRenderPanel();
  return { ok: true };
}

function drRecallAmbassador(from, to) {
  const amb = state.ambassadors.find(a => a.from===from && a.to===to && a.status==="active");
  if (!amb) return { ok: false, msg: "Không có đại sứ đang hoạt động tại " + to };

  amb.status = "recalled";
  const rel = _getRelation(from, to);
  rel.score = Math.max(-100, rel.score - 15);
  rel.status = _scoreToStatus(rel.score);
  rel.history.push({ year: _currentYear(), event: "Triệu hồi đại sứ", delta: -15 });

  _log(`📩 ${from} triệu hồi đại sứ khỏi ${to}`);
  drSave();
  drRenderPanel();
  return { ok: true };
}

// ─── TICK: Expire treaties & AI diplomacy ────────────────────────
function drTick() {
  const year = _currentYear();
  let changed = false;

  // Expire treaties
  state.treaties.forEach(t => {
    if (t.active && year >= t.expiresYear) {
      t.active = false;
      t.expiredYear = year;
      const rel = _getRelation(t.partyA, t.partyB);
      rel.history.push({ year, event: t.label + " hết hạn", delta: 0 });
      _log(`⏳ Hiệp ước ${t.label} giữa ${t.partyA} & ${t.partyB} đã hết hạn`);
      changed = true;
    }
  });

  // Natural relation drift toward neutral
  Object.keys(state.relations).forEach(k => {
    const rel = state.relations[k];
    if (rel.status !== "WAR") {
      if (rel.score > 0) rel.score = Math.max(0, rel.score - 1);
      else if (rel.score < 0) rel.score = Math.min(0, rel.score + 1);
      rel.status = _scoreToStatus(rel.score);
    }
  });

  // AI diplomatic actions
  _runDiplomacyAI(year);

  if (changed) { drSave(); drRenderPanel(); }
}

function _runDiplomacyAI(year) {
  const powers = _getPowers();
  if (powers.length < 2) return;

  powers.forEach(power => {
    const cooldown = state.aiCooldown[power.name] || 0;
    if (year - cooldown < 5) return;

    const others = powers.filter(p => p.name !== power.name);
    const target = others[Math.floor(Math.random() * others.length)];
    if (!target) return;

    const rel = _getRelation(power.name, target.name);
    const roll = Math.random();

    if (rel.status === "WAR" && roll < 0.08) {
      drProposeTreaty(power.name, target.name, "PEACE");
      state.aiCooldown[power.name] = year;
    } else if (rel.status === "NEUTRAL" && roll < 0.12) {
      const hasAmb = state.ambassadors.some(a => a.from===power.name && a.to===target.name && a.status==="active");
      if (!hasAmb) { drSendAmbassador(power.name, target.name); state.aiCooldown[power.name] = year; }
    } else if (rel.status === "FRIENDLY" && roll < 0.07) {
      drProposeTreaty(power.name, target.name, ["TRADE","NON_AGGR","OPEN_BORDERS"][Math.floor(Math.random()*3)]);
      state.aiCooldown[power.name] = year;
    } else if (rel.status === "ALLIED" && power.power > target.power * 1.5 && roll < 0.04) {
      drProposeTreaty(power.name, target.name, "TRIBUTARY");
      state.aiCooldown[power.name] = year;
    } else if (rel.status === "HOSTILE" && power.power > target.power * 1.3 && roll < 0.05) {
      const warReasons = ["Tranh chấp biên giới","Xúc phạm Hoàng gia","Cướp đoạt thương nhân","Tham vọng bành trướng","Thù hận cũ"];
      drDeclareWar(power.name, target.name, warReasons[Math.floor(Math.random()*warReasons.length)]);
      state.aiCooldown[power.name] = year;
    }
  });
}

// ─── RENDER PANEL ────────────────────────────────────────────────
function drRenderPanel() {
  const el = document.getElementById("panel-diplomacy");
  if (!el) return;

  const powers = _getPowers();
  const activeTreaties = state.treaties.filter(t => t.active);
  const activeAmbassadors = state.ambassadors.filter(a => a.status === "active");
  const activeWars = state.warDeclared.filter(w => w.active);
  const recentLog = state.diplomacyLog.slice(0, 20);

  el.innerHTML = `
  <div style="padding:12px 4px 0;">
    <h2 style="color:#f1c40f;font-size:1.4em;margin:0 0 4px;text-align:center;">🌐 Bản Đồ Ngoại Giao</h2>
    <p style="color:#94a3b8;text-align:center;font-size:.85em;margin:0 0 16px;">
      ${powers.length} thế lực · ${activeTreaties.length} hiệp ước · ${activeAmbassadors.length} đại sứ · ${activeWars.length} chiến tranh
    </p>

    <!-- TABS -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
      ${["map","treaties","ambassadors","wars","log"].map((tab,i) => `
        <button onclick="drSwitchTab('${tab}')" id="dr-tab-${tab}"
          style="flex:1;padding:7px 6px;border-radius:8px;border:none;cursor:pointer;font-size:.82em;font-weight:700;
          background:${i===0?'#1e3a5f':'#1a2535'};color:${i===0?'#60a5fa':'#94a3b8'};
          border:1px solid ${i===0?'#3b82f6':'#2d3748'};">
          ${ {map:"🗺️ Quan Hệ", treaties:"📜 Hiệp Ước", ambassadors:"🏛️ Đại Sứ", wars:"⚔️ Chiến Tranh", log:"📋 Nhật Ký"}[tab] }
        </button>`).join('')}
    </div>

    <!-- MAP TAB (default) -->
    <div id="dr-content-map">
      ${_renderRelationMatrix(powers)}
      ${_renderQuickActions(powers)}
    </div>
    <div id="dr-content-treaties" style="display:none">${_renderTreatiesTab(activeTreaties, powers)}</div>
    <div id="dr-content-ambassadors" style="display:none">${_renderAmbassadorsTab(activeAmbassadors, powers)}</div>
    <div id="dr-content-wars" style="display:none">${_renderWarsTab(activeWars)}</div>
    <div id="dr-content-log" style="display:none">${_renderLogTab(recentLog)}</div>
  </div>`;
}

function _renderRelationMatrix(powers) {
  if (powers.length === 0) {
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">
      Chưa có thế lực nào. Hãy tạo thế giới và để các vương quốc/đế chế xuất hiện.
    </div>`;
  }
  const shown = powers.slice(0, 8);
  let html = `<div style="overflow-x:auto;margin-bottom:14px;">
    <table style="width:100%;border-collapse:collapse;font-size:.78em;">
      <thead><tr><th style="padding:4px;color:#64748b;text-align:left;">Thế Lực</th>
        ${shown.map(p => `<th style="padding:4px 2px;color:#94a3b8;text-align:center;max-width:60px;overflow:hidden;font-size:.85em;" title="${p.name}">${p.name.substring(0,6)}</th>`).join('')}
      </tr></thead><tbody>`;

  shown.forEach(rowPower => {
    html += `<tr><td style="padding:4px 6px;color:#e2e8f0;font-weight:600;white-space:nowrap;">${rowPower.name.substring(0,10)}</td>`;
    shown.forEach(colPower => {
      if (rowPower.name === colPower.name) {
        html += `<td style="text-align:center;padding:4px 2px;color:#475569;">—</td>`;
      } else {
        const rel = _getRelation(rowPower.name, colPower.name);
        const def = RELATION_STATUS[rel.status] || RELATION_STATUS.NEUTRAL;
        html += `<td style="text-align:center;padding:4px 2px;cursor:pointer;" title="${rowPower.name} ↔ ${colPower.name}: ${def.label} (${rel.score})"
          onclick="drShowRelationDetail('${rowPower.name}','${colPower.name}')">
          <span style="font-size:1.1em;">${def.icon}</span>
        </td>`;
      }
    });
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;

  // Legend
  html += `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
    ${Object.entries(RELATION_STATUS).map(([k,v]) =>
      `<span style="padding:2px 8px;border-radius:12px;background:${v.color}22;color:${v.color};font-size:.75em;border:1px solid ${v.color}44;">
        ${v.icon} ${v.label}
      </span>`).join('')}
  </div>`;

  // Relation detail panel
  html += `<div id="dr-relation-detail" style="display:none;background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:12px;margin-bottom:14px;"></div>`;

  return html;
}

function _renderQuickActions(powers) {
  if (powers.length < 2) return "";
  const p = powers.slice(0, 6);
  return `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:12px;">
    <div style="color:#60a5fa;font-weight:700;margin-bottom:10px;font-size:.9em;">⚡ Hành Động Nhanh</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Từ:</label>
        <select id="dr-from-sel" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${p.map(x=>`<option value="${x.name}">${x.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Tới:</label>
        <select id="dr-to-sel" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${p.map((x,i)=>`<option value="${x.name}"${i===1?' selected':''}>${x.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
      <button onclick="drActionSend()" style="flex:1;padding:7px;background:#1e3a5f;color:#60a5fa;border:1px solid #3b82f6;border-radius:8px;cursor:pointer;font-size:.82em;">🏛️ Phái Đại Sứ</button>
      <button onclick="drActionPropose('TRADE')" style="flex:1;padding:7px;background:#1a2e1a;color:#4ade80;border:1px solid #22c55e;border-radius:8px;cursor:pointer;font-size:.82em;">💰 Thương Mại</button>
      <button onclick="drActionPropose('ALLIANCE')" style="flex:1;padding:7px;background:#2d1a4a;color:#a78bfa;border:1px solid #8b5cf6;border-radius:8px;cursor:pointer;font-size:.82em;">⚔️ Liên Minh</button>
      <button onclick="drActionPropose('PEACE')" style="flex:1;padding:7px;background:#1a2e2a;color:#2dd4bf;border:1px solid #14b8a6;border-radius:8px;cursor:pointer;font-size:.82em;">🕊️ Hòa Bình</button>
      <button onclick="drActionDeclareWar()" style="flex:1;padding:7px;background:#2e1a1a;color:#f87171;border:1px solid #ef4444;border-radius:8px;cursor:pointer;font-size:.82em;">⚔️ Tuyên Chiến</button>
      <button onclick="drActionPropose('MARRIAGE')" style="flex:1;padding:7px;background:#2e1a2e;color:#f9a8d4;border:1px solid #ec4899;border-radius:8px;cursor:pointer;font-size:.82em;">💍 Hôn Ước</button>
    </div>
    <div id="dr-action-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;
}

function _renderTreatiesTab(activeTreaties, powers) {
  const inactive = state.treaties.filter(t => !t.active).slice(0, 15);
  if (activeTreaties.length === 0 && inactive.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có hiệp ước nào được ký kết.</div>`;

  let html = "";
  if (activeTreaties.length > 0) {
    html += `<div style="color:#4ade80;font-weight:700;margin-bottom:10px;font-size:.9em;">✅ Hiệp Ước Đang Hiệu Lực (${activeTreaties.length})</div>`;
    activeTreaties.forEach(t => {
      const tDef = TREATY_TYPES[t.type] || {};
      const remaining = t.expiresYear - _currentYear();
      html += `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#e2e8f0;font-weight:600;">${tDef.icon||'📜'} ${t.label}</span>
          <span style="color:#64748b;font-size:.8em;">Còn ${remaining} năm</span>
        </div>
        <div style="color:#94a3b8;font-size:.82em;margin-top:4px;">
          ${t.partyA} ↔ ${t.partyB} · Ký năm ${t.signedYear} · Hết hạn ${t.expiresYear}
        </div>
        <button onclick="drBreakTreatyUI('${t.partyA}','${t.partyB}','${t.id}')"
          style="margin-top:6px;padding:4px 10px;background:#2e1a1a;color:#f87171;border:1px solid #ef4444;border-radius:6px;cursor:pointer;font-size:.78em;">
          💔 Phá Vỡ
        </button>
      </div>`;
    });
  }
  if (inactive.length > 0) {
    html += `<div style="color:#64748b;font-weight:700;margin:14px 0 8px;font-size:.85em;">⏳ Hiệp Ước Đã Hết / Bị Phá Vỡ</div>`;
    inactive.forEach(t => {
      const reason = t.expiredYear ? `Hết hạn năm ${t.expiredYear}` : `Bị ${t.brokenBy} phá vỡ năm ${t.brokenYear}`;
      html += `<div style="background:#0a0f1a;border:1px solid #1a2535;border-radius:8px;padding:8px;margin-bottom:6px;opacity:.65;">
        <div style="color:#64748b;font-size:.82em;">${t.icon||'📜'} ${t.label} · ${t.partyA} ↔ ${t.partyB}</div>
        <div style="color:#475569;font-size:.78em;">${reason}</div>
      </div>`;
    });
  }
  return html;
}

function _renderAmbassadorsTab(activeAmb, powers) {
  const recalled = state.ambassadors.filter(a => a.status==="recalled").slice(0,10);
  if (activeAmb.length === 0 && recalled.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có đại sứ nào được phái đi.</div>`;

  let html = "";
  if (activeAmb.length > 0) {
    html += `<div style="color:#60a5fa;font-weight:700;margin-bottom:10px;font-size:.9em;">🏛️ Đại Sứ Đang Hoạt Động (${activeAmb.length})</div>`;
    activeAmb.forEach(a => {
      const rel = _getRelation(a.from, a.to);
      const def = RELATION_STATUS[rel.status] || RELATION_STATUS.NEUTRAL;
      html += `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#e2e8f0;font-weight:600;">🏛️ ${a.title} ${a.name}</span>
          <span style="color:${def.color};font-size:.82em;">${def.icon} ${def.label}</span>
        </div>
        <div style="color:#94a3b8;font-size:.82em;margin-top:4px;">
          ${a.from} → ${a.to} · Phái năm ${a.sentYear}
        </div>
        <button onclick="drRecallAmbUI('${a.from}','${a.to}')"
          style="margin-top:6px;padding:4px 10px;background:#2e2a1a;color:#fbbf24;border:1px solid #f59e0b;border-radius:6px;cursor:pointer;font-size:.78em;">
          📩 Triệu Hồi
        </button>
      </div>`;
    });
  }
  if (recalled.length > 0) {
    html += `<div style="color:#64748b;font-weight:700;margin:14px 0 8px;font-size:.85em;">📩 Đại Sứ Đã Triệu Hồi</div>`;
    recalled.forEach(a => {
      html += `<div style="background:#0a0f1a;border:1px solid #1a2535;border-radius:8px;padding:8px;margin-bottom:6px;opacity:.65;">
        <div style="color:#64748b;font-size:.82em;">🏛️ ${a.title} ${a.name} · ${a.from} → ${a.to}</div>
      </div>`;
    });
  }
  return html;
}

function _renderWarsTab(activeWars) {
  const resolved = state.warDeclared.filter(w => !w.active).slice(0,10);
  if (activeWars.length === 0 && resolved.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có cuộc chiến tranh nào được tuyên bố chính thức.</div>`;

  let html = "";
  if (activeWars.length > 0) {
    html += `<div style="color:#f87171;font-weight:700;margin-bottom:10px;font-size:.9em;">⚔️ Chiến Tranh Đang Diễn Ra (${activeWars.length})</div>`;
    activeWars.forEach(w => {
      const duration = _currentYear() - w.year;
      html += `<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="color:#f87171;font-weight:700;font-size:1em;">⚔️ ${w.attacker} vs ${w.defender}</div>
        <div style="color:#94a3b8;font-size:.82em;margin-top:4px;">Tuyên bố năm ${w.year} · Đã ${duration} năm · Lý do: ${w.reason}</div>
        <button onclick="drProposeFromWar('${w.attacker}','${w.defender}')"
          style="margin-top:6px;padding:4px 10px;background:#1a2e2a;color:#2dd4bf;border:1px solid #14b8a6;border-radius:6px;cursor:pointer;font-size:.78em;">
          🕊️ Đàm Phán Hòa Bình
        </button>
      </div>`;
    });
  }
  if (resolved.length > 0) {
    html += `<div style="color:#64748b;font-weight:700;margin:14px 0 8px;font-size:.85em;">📜 Chiến Tranh Đã Kết Thúc</div>`;
    resolved.forEach(w => {
      html += `<div style="background:#0a0f1a;border:1px solid #1a2535;border-radius:8px;padding:8px;margin-bottom:6px;opacity:.65;">
        <div style="color:#64748b;font-size:.82em;">⚔️ ${w.attacker} vs ${w.defender} · Năm ${w.year} → ${w.resolvedYear||"?"}</div>
      </div>`;
    });
  }
  return html;
}

function _renderLogTab(log) {
  if (log.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Nhật ký ngoại giao chưa có sự kiện nào.</div>`;
  const colors = { info: "#94a3b8", important: "#60a5fa", danger: "#f87171", success: "#4ade80" };
  return log.map(e =>
    `<div style="padding:7px 10px;border-left:3px solid ${colors[e.type]||colors.info};background:#0f172a;border-radius:0 8px 8px 0;margin-bottom:6px;">
      <span style="color:#475569;font-size:.78em;">Năm ${e.year}</span>
      <div style="color:${colors[e.type]||colors.info};font-size:.83em;margin-top:2px;">${e.msg}</div>
    </div>`
  ).join('');
}

// ─── GLOBAL UI CALLBACKS ─────────────────────────────────────────
window.drSwitchTab = function(tab) {
  ["map","treaties","ambassadors","wars","log"].forEach(t => {
    const content = document.getElementById("dr-content-" + t);
    const btn = document.getElementById("dr-tab-" + t);
    if (content) content.style.display = (t === tab) ? "" : "none";
    if (btn) {
      btn.style.background = (t === tab) ? "#1e3a5f" : "#1a2535";
      btn.style.color = (t === tab) ? "#60a5fa" : "#94a3b8";
      btn.style.borderColor = (t === tab) ? "#3b82f6" : "#2d3748";
    }
  });
};

window.drShowRelationDetail = function(a, b) {
  const rel = _getRelation(a, b);
  const def = RELATION_STATUS[rel.status] || RELATION_STATUS.NEUTRAL;
  const el = document.getElementById("dr-relation-detail");
  if (!el) return;
  el.style.display = "";
  const treaties = state.treaties.filter(t => t.active &&
    ((t.partyA===a&&t.partyB===b)||(t.partyA===b&&t.partyB===a)));
  const ambAtoB = state.ambassadors.find(x => x.from===a && x.to===b && x.status==="active");
  const ambBtoA = state.ambassadors.find(x => x.from===b && x.to===a && x.status==="active");
  el.innerHTML = `
    <div style="font-weight:700;color:${def.color};margin-bottom:8px;">${def.icon} ${a} ↔ ${b}: ${def.label} (${rel.score > 0 ? '+' : ''}${rel.score})</div>
    <div style="color:#94a3b8;font-size:.82em;">
      ${treaties.length > 0 ? treaties.map(t=>`<span style="color:#60a5fa;">${t.icon} ${t.label}</span>`).join(' · ') : 'Không có hiệp ước'}
    </div>
    <div style="color:#64748b;font-size:.78em;margin-top:4px;">
      Đại sứ ${a}→${b}: ${ambAtoB ? ambAtoB.title + ' ' + ambAtoB.name : 'Không'} &nbsp;|&nbsp;
      Đại sứ ${b}→${a}: ${ambBtoA ? ambBtoA.title + ' ' + ambBtoA.name : 'Không'}
    </div>
    ${rel.history.length > 0 ? `<div style="color:#475569;font-size:.75em;margin-top:6px;">
      Lịch sử gần đây: ${rel.history.slice(-3).map(h=>`${h.event} (năm ${h.year})`).join(' · ')}
    </div>` : ''}`;
};

window.drActionSend = function() {
  const from = document.getElementById("dr-from-sel")?.value;
  const to   = document.getElementById("dr-to-sel")?.value;
  const msg  = document.getElementById("dr-action-msg");
  if (!from || !to || from === to) { if(msg) msg.textContent = "⚠️ Chọn hai thế lực khác nhau"; return; }
  const result = drSendAmbassador(from, to);
  if(msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? `✅ Đã phái ${result.ambassador.title} ${result.ambassador.name}` : "⚠️ " + result.msg; }
  if(result.ok) setTimeout(drRenderPanel, 300);
};

window.drActionPropose = function(type) {
  const from = document.getElementById("dr-from-sel")?.value;
  const to   = document.getElementById("dr-to-sel")?.value;
  const msg  = document.getElementById("dr-action-msg");
  if (!from || !to || from === to) { if(msg) msg.textContent = "⚠️ Chọn hai thế lực khác nhau"; return; }
  const result = drProposeTreaty(from, to, type);
  if(msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? `✅ Đã ký kết hiệp ước` : "⚠️ " + result.msg; }
};

window.drActionDeclareWar = function() {
  const from = document.getElementById("dr-from-sel")?.value;
  const to   = document.getElementById("dr-to-sel")?.value;
  const msg  = document.getElementById("dr-action-msg");
  if (!from || !to || from === to) { if(msg) msg.textContent = "⚠️ Chọn hai thế lực khác nhau"; return; }
  if (!confirm(`Tuyên chiến: ${from} vs ${to}?\nHành động này sẽ hủy mọi hiệp ước giữa hai bên!`)) return;
  const reasons = ["Tranh chấp lãnh thổ","Tham vọng bành trướng","Phục thù","Lợi ích kinh tế","Ý thức hệ"];
  const result = drDeclareWar(from, to, reasons[Math.floor(Math.random()*reasons.length)]);
  if(msg) { msg.style.color = result.ok ? "#f87171" : "#fbbf24"; msg.textContent = result.ok ? `⚔️ Đã tuyên chiến!` : "⚠️ " + result.msg; }
};

window.drBreakTreatyUI = function(a, b, id) {
  if (!confirm("Phá vỡ hiệp ước này sẽ gây thiệt hại quan hệ -30. Xác nhận?")) return;
  drBreakTreaty(a, b, id);
};

window.drRecallAmbUI = function(from, to) {
  drRecallAmbassador(from, to);
};

window.drProposeFromWar = function(a, b) {
  const result = drProposeTreaty(a, b, "PEACE");
  if (typeof toast === "function") toast(result.ok ? `🕊️ ${a} & ${b} ký Hòa Bình!` : result.msg, result.ok ? "success" : "danger");
};

// ─── PUBLIC API ───────────────────────────────────────────────────
window.drSendAmbassador    = drSendAmbassador;
window.drProposeTreaty     = drProposeTreaty;
window.drDeclareWar        = drDeclareWar;
window.drBreakTreaty       = drBreakTreaty;
window.drRecallAmbassador  = drRecallAmbassador;
window.drRenderPanel       = drRenderPanel;
window.drTick              = drTick;
window.drGetRelation       = _getRelation;
window.diplomaticState     = state;

// ─── INIT ─────────────────────────────────────────────────────────
function drInit() {
  if (state.initialized) return;
  drLoad();
  state.initialized = true;

  // Hook vào tick của game
  const _origTick = window.gameTick;
  if (typeof _origTick === "function") {
    window.gameTick = function() {
      _origTick();
      if (Math.random() < 0.3) drTick();
    };
  } else {
    setInterval(function() {
      if (typeof window.year !== "undefined") drTick();
    }, 8000);
  }

  console.log("[DiplomaticEngine V1] ✅ Hệ thống Ngoại Giao khởi động — Đại Sứ · Hiệp Ước · Tuyên Chiến sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(drInit, 1600); });
} else {
  setTimeout(drInit, 1600);
}

})();
