// ═══════════════════════════════════════════════════════════════
// POLITICAL RELIGION ENGINE V1 — Creator God World Simulator V23
// Quốc Giáo · Truyền Bá · Thánh Chiến · Thần Quyền · Dị Giáo
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const STORAGE_KEY = "cgv6_political_religion";

// ─── FAITH DEFINITIONS ───────────────────────────────────────────
const FAITHS = {
  THIEN_DAO: {
    id: "THIEN_DAO", label: "Thiên Đạo", icon: "🌟",
    color: "#fde68a", colorDark: "#78350f",
    desc: "Đạo của Trời Đất — cân bằng, hài hòa vũ trụ.",
    bonuses: { stability: +10, tech: +5 },
    holyWarBonus: 0,
    spreadRate: 0.18,
    doctrines: ["Thiên Mệnh", "Vô Vi", "Nhân Hòa"],
  },
  CHIEN_THAN: {
    id: "CHIEN_THAN", label: "Chiến Thần Giáo", icon: "⚔️",
    color: "#f87171", colorDark: "#7f1d1d",
    desc: "Phụng thờ Chiến Thần — chiến đấu là lời cầu nguyện.",
    bonuses: { military: +15, stability: -5 },
    holyWarBonus: 30,
    spreadRate: 0.14,
    doctrines: ["Vinh Quang Chiến Trận", "Thánh Chiến Bất Bại", "Máu Là Lễ Vật"],
  },
  THUONG_THAN: {
    id: "THUONG_THAN", label: "Thương Thần Giáo", icon: "💰",
    color: "#4ade80", colorDark: "#14532d",
    desc: "Thần Của Cải — thịnh vượng là phúc lành thiêng liêng.",
    bonuses: { economy: +12, military: -3 },
    holyWarBonus: -10,
    spreadRate: 0.20,
    doctrines: ["Phồn Thịnh Thiêng Liêng", "Giao Thương Là Đức Tin", "Kho Báu Của Thần"],
  },
  DIA_MAU: {
    id: "DIA_MAU", label: "Địa Mẫu Giáo", icon: "🌿",
    color: "#86efac", colorDark: "#166534",
    desc: "Tôn thờ Đất Mẹ — đất đai là thân thể của Nữ Thần.",
    bonuses: { population: +10, stability: +8 },
    holyWarBonus: -5,
    spreadRate: 0.16,
    doctrines: ["Đất Thiêng", "Mùa Màng Phước Lành", "Giao Ước Với Thiên Nhiên"],
  },
  HOA_THAN: {
    id: "HOA_THAN", label: "Hỏa Thần Giáo", icon: "🔥",
    color: "#fb923c", colorDark: "#7c2d12",
    desc: "Hỏa Thần thanh tẩy thế giới — cách mạng và tái sinh.",
    bonuses: { military: +8, economy: +5, stability: -10 },
    holyWarBonus: 15,
    spreadRate: 0.22,
    doctrines: ["Lửa Thanh Tẩy", "Cách Mạng Thiêng Liêng", "Tro Tàn Và Tái Sinh"],
  },
  HAI_THAN: {
    id: "HAI_THAN", label: "Hải Thần Giáo", icon: "🌊",
    color: "#38bdf8", colorDark: "#0c4a6e",
    desc: "Thần Biển Cả — thương nhân và thủy thủ tôn thờ.",
    bonuses: { economy: +8, military: +5 },
    holyWarBonus: 5,
    spreadRate: 0.19,
    doctrines: ["Biển Là Con Đường", "Cơn Bão Của Thần", "Tài Sản Dưới Đáy Biển"],
  },
  NGUYET_THAN: {
    id: "NGUYET_THAN", label: "Nguyệt Thần Giáo", icon: "🌙",
    color: "#c084fc", colorDark: "#4c1d95",
    desc: "Thần Mặt Trăng — pháp thuật, bí ẩn và tiên tri.",
    bonuses: { tech: +10, stability: +5 },
    holyWarBonus: -5,
    spreadRate: 0.12,
    doctrines: ["Tiên Tri Nguyệt Thực", "Ma Thuật Đêm Khuya", "Bí Ẩn Vũ Trụ"],
  },
  TINH_TU: {
    id: "TINH_TU", label: "Tinh Tú Giáo", icon: "⭐",
    color: "#93c5fd", colorDark: "#1e3a8a",
    desc: "Vạn Tinh Chủ — các học giả và triết gia tôn thờ bầu trời.",
    bonuses: { tech: +15, population: +5 },
    holyWarBonus: -15,
    spreadRate: 0.10,
    doctrines: ["Thiên Văn Thần Thánh", "Tri Thức Là Đức Hạnh", "Sao Dẫn Đường"],
  },
};

const MISSIONARY_NAMES_FIRST = ["Pháp Sư","Thánh Nhân","Giáo Chủ","Đại Tăng","Thiền Sư","Giảng Sư","Truyền Giáo","Mục Sư","Pháp Vương"];
const MISSIONARY_NAMES_LAST  = ["Ánh Sáng","Từ Bi","Vô Lượng","Phổ Độ","Hải Tâm","Linh Quang","Diệu Pháp","Huyền Không","Chân Như"];
const HOLY_WAR_NAMES = ["Thánh Chiến","Thập Tự Chinh","Cuộc Chiến Đức Tin","Chiến Dịch Thiêng Liêng","Đại Chiến Thần Thánh"];

// ─── STATE ────────────────────────────────────────────────────────
let state = {
  powerFaiths:    {},    // powerName → { faithId, influence, adopted:year, leader, doctrineIdx }
  missionaries:   [],    // { id, owner, faithId, target, name, sentYear, completesYear, status }
  holyWars:       [],    // { id, attacker, defender, faithId, name, year, active, resolvedYear }
  conversions:    [],    // { year, from, to, faithId, how }  history
  holyWarLog:     [],
  religionLog:    [],
  idCounter:      0,
  initialized:    false,
};

// ─── SAVE / LOAD ─────────────────────────────────────────────────
function prSave() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function prLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────
function _year() { return (typeof window.year !== "undefined") ? window.year : 0; }
function _newId() { return "pr_" + (++state.idCounter) + "_" + Date.now(); }

function _log(msg, type) {
  state.religionLog.unshift({ year: _year(), msg, type: type || "info" });
  if (state.religionLog.length > 200) state.religionLog.pop();
  if (typeof addLog === "function") addLog("[Tôn Giáo] " + msg, type || "info");
  if (typeof htAddEvent === "function") htAddEvent({ year: _year(), text: msg, tag: "religion" });
}

function _randomMissionaryName() {
  return MISSIONARY_NAMES_FIRST[Math.floor(Math.random()*MISSIONARY_NAMES_FIRST.length)] + " " +
         MISSIONARY_NAMES_LAST[Math.floor(Math.random()*MISSIONARY_NAMES_LAST.length)];
}

function _getPowers() {
  const powers = [];
  if (window.kingdoms) window.kingdoms.forEach(k => { if (k.active !== false) powers.push({ name: k.name, type: "kingdom" }); });
  if (window.empires)  window.empires.forEach(e  => { if (!e.collapsed) powers.push({ name: e.name, type: "empire" }); });
  if (window.countries && powers.length === 0)
    window.countries.filter(c => !c.collapsed).slice(0,12).forEach(c => powers.push({ name: c.name, type: "nation" }));
  return powers;
}

function _getFaith(powerName) { return state.powerFaiths[powerName] || null; }

function _faithLabel(faithId) {
  const f = FAITHS[faithId];
  return f ? `${f.icon} ${f.label}` : "Vô Thần";
}

// ─── CORE ACTIONS ─────────────────────────────────────────────────
function prAdoptFaith(powerName, faithId) {
  const faith = FAITHS[faithId];
  if (!faith) return { ok: false, msg: "Đức tin không tồn tại" };

  const old = state.powerFaiths[powerName];
  const year = _year();

  state.powerFaiths[powerName] = {
    faithId,
    influence: old ? Math.max(30, old.influence) : 50,
    adopted: year,
    leader: _randomMissionaryName(),
    doctrineIdx: Math.floor(Math.random() * faith.doctrines.length),
  };

  // Apply bonuses to country if exists
  if (window.countries) {
    const c = window.countries.find(x => x.name === powerName);
    if (c) {
      if (faith.bonuses.stability)  c.stability  = Math.max(0, Math.min(100, (c.stability||50) + faith.bonuses.stability));
      if (faith.bonuses.economy)    c.economy    = Math.max(0, (c.economy||10) + faith.bonuses.economy);
      if (faith.bonuses.military)   c.military   = Math.max(0, (c.military||5) + faith.bonuses.military);
      if (faith.bonuses.population) c.population = Math.max(0, (c.population||100) + faith.bonuses.population * 100);
    }
  }

  if (old && old.faithId !== faithId) {
    state.conversions.push({ year, from: old.faithId, to: faithId, power: powerName, how: "edict" });
    _log(`🔄 ${powerName} từ bỏ ${_faithLabel(old.faithId)} → cải đạo sang ${faith.icon} ${faith.label}!`, "important");
    if (typeof toast === "function") toast(`⛪ ${powerName} cải đạo sang ${faith.label}!`, "important");
  } else {
    state.conversions.push({ year, faithId, power: powerName, how: "first" });
    _log(`⛪ ${powerName} tuyên bố Quốc Giáo: ${faith.icon} ${faith.label}`, "important");
    if (typeof toast === "function") toast(`⛪ ${powerName} lập Quốc Giáo: ${faith.label}!`, "important");
  }

  prSave();
  prRenderPanel();
  return { ok: true };
}

function prSendMissionary(ownerName, targetName) {
  const pf = _getFaith(ownerName);
  if (!pf) return { ok: false, msg: `${ownerName} chưa có Quốc Giáo` };

  const existing = state.missionaries.find(m =>
    m.owner === ownerName && m.target === targetName && m.status === "active"
  );
  if (existing) return { ok: false, msg: "Đã có giáo sĩ đang truyền đạo tại " + targetName };

  const faith = FAITHS[pf.faithId];
  const duration = 4 + Math.floor(Math.random() * 4);
  const year = _year();
  const m = {
    id:           _newId(),
    owner:        ownerName,
    faithId:      pf.faithId,
    target:       targetName,
    name:         _randomMissionaryName(),
    sentYear:     year,
    completesYear: year + duration,
    status:       "active",
  };
  state.missionaries.push(m);
  _log(`${faith.icon} ${ownerName} phái Giáo Sĩ ${m.name} sang ${targetName} truyền bá ${faith.label}`);
  prSave();
  return { ok: true, missionary: m };
}

function _resolveMissionary(m) {
  const faith = FAITHS[m.faithId];
  const targetFaith = _getFaith(m.target);
  const year = _year();

  // Base success = faith spreadRate, reduced if target already has different faith
  let chance = faith ? faith.spreadRate : 0.15;
  if (targetFaith && targetFaith.faithId !== m.faithId) chance *= 0.5;

  const success = Math.random() < chance;
  m.status = "returned";

  if (success) {
    const targetPF = state.powerFaiths[m.target];
    if (!targetPF) {
      // New adoption
      prAdoptFaith(m.target, m.faithId);
    } else {
      // Increase influence
      targetPF.influence = Math.min(100, targetPF.influence + 15);
      _log(`✨ Ảnh hưởng ${_faithLabel(m.faithId)} tại ${m.target} tăng lên ${targetPF.influence}%`, "success");
    }
    state.conversions.push({ year, faithId: m.faithId, power: m.target, from: targetFaith?.faithId, how: "missionary" });
    if (typeof toast === "function") toast(`✨ Giáo sĩ ${m.name} truyền đạo thành công tại ${m.target}!`, "success");
  } else {
    _log(`❌ Giáo sĩ ${m.name} thất bại tại ${m.target} — dân chúng không tiếp nhận`);
  }
  prSave();
}

function prDeclareHolyWar(attacker, defender, faithId) {
  const pf = _getFaith(attacker);
  if (!pf) return { ok: false, msg: `${attacker} chưa có Quốc Giáo` };
  if (pf.faithId !== faithId) return { ok: false, msg: "Quốc Giáo không khớp" };

  const defFaith = _getFaith(defender);
  if (defFaith && defFaith.faithId === faithId) {
    return { ok: false, msg: `${defender} cùng đức tin — không thể Thánh Chiến!` };
  }

  const faith = FAITHS[faithId];
  const hwName = HOLY_WAR_NAMES[Math.floor(Math.random()*HOLY_WAR_NAMES.length)];
  const year = _year();

  const hw = {
    id:          _newId(),
    attacker,
    defender,
    faithId,
    name:        hwName + " của " + faith.label,
    year,
    active:      true,
    resolvedYear: null,
  };
  state.holyWars.push(hw);

  // Boost attacker military if faith has holyWarBonus
  if (window.countries && faith.holyWarBonus > 0) {
    const c = window.countries.find(x => x.name === attacker);
    if (c) c.military = (c.military||5) + Math.floor(faith.holyWarBonus / 5);
  }

  // Diplomatic impact
  if (typeof drGetRelation === "function" && typeof drDeclareWar === "function") {
    drDeclareWar(attacker, defender, `Thánh Chiến: ${hw.name}`);
  }

  _log(`${faith.icon} THÁNH CHIẾN! ${attacker} phát động "${hw.name}" chống lại ${defender}!`, "danger");
  if (typeof toast === "function") toast(`⚔️ Thánh Chiến! ${attacker} vs ${defender}!`, "danger");
  prSave();
  prRenderPanel();
  return { ok: true, holyWar: hw };
}

function prEndHolyWar(hwId, winner) {
  const hw = state.holyWars.find(h => h.id === hwId && h.active);
  if (!hw) return { ok: false, msg: "Thánh Chiến không tồn tại" };

  hw.active = false;
  hw.resolvedYear = _year();
  hw.winner = winner;

  if (winner === hw.attacker) {
    // Attacker wins: force convert defender
    const pf = _getFaith(hw.attacker);
    if (pf) {
      prAdoptFaith(hw.defender, pf.faithId);
      _log(`🏆 ${hw.attacker} thắng Thánh Chiến — ${hw.defender} bị cải đạo!`, "important");
    }
  } else {
    _log(`🛡️ ${hw.defender} đã chống đỡ thành công Thánh Chiến của ${hw.attacker}`, "success");
  }

  if (typeof drProposeTreaty === "function") drProposeTreaty(hw.attacker, hw.defender, "PEACE");
  prSave();
  prRenderPanel();
  return { ok: true };
}

function prSuppressHeresy(powerName) {
  const pf = _getFaith(powerName);
  if (!pf) return { ok: false, msg: "Không có Quốc Giáo để bảo vệ" };

  pf.influence = Math.min(100, pf.influence + 10);
  if (window.countries) {
    const c = window.countries.find(x => x.name === powerName);
    if (c) c.stability = Math.max(0, (c.stability||50) - 5);
  }

  _log(`🔒 ${powerName} đàn áp dị giáo — ảnh hưởng ${_faithLabel(pf.faithId)} tăng lên ${pf.influence}%`);
  prSave();
  prRenderPanel();
  return { ok: true };
}

// ─── AI TICK ─────────────────────────────────────────────────────
function prTick() {
  const year = _year();
  const powers = _getPowers();
  if (powers.length === 0) return;

  // Resolve completed missionaries
  state.missionaries.forEach(m => {
    if (m.status === "active" && year >= m.completesYear) _resolveMissionary(m);
  });

  // Natural influence decay
  Object.values(state.powerFaiths).forEach(pf => {
    pf.influence = Math.max(10, pf.influence - 1);
  });

  // AI: powers without faith may adopt one
  powers.forEach(p => {
    if (!state.powerFaiths[p.name] && Math.random() < 0.04) {
      const faithIds = Object.keys(FAITHS);
      prAdoptFaith(p.name, faithIds[Math.floor(Math.random()*faithIds.length)]);
    }
  });

  // AI: powers with faith may send missionaries
  powers.forEach(owner => {
    const pf = _getFaith(owner.name);
    if (!pf) return;
    if (Math.random() < 0.06) {
      const targets = powers.filter(p => p.name !== owner.name);
      const target = targets[Math.floor(Math.random()*targets.length)];
      if (target) prSendMissionary(owner.name, target.name);
    }
  });

  // AI: high-military faith powers may declare holy war
  powers.forEach(attacker => {
    const pf = _getFaith(attacker.name);
    if (!pf) return;
    const faith = FAITHS[pf.faithId];
    if (!faith || faith.holyWarBonus < 10) return;
    if (Math.random() < 0.015) {
      const targets = powers.filter(p => {
        const tf = _getFaith(p.name);
        return p.name !== attacker.name && (!tf || tf.faithId !== pf.faithId);
      });
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random()*targets.length)];
        prDeclareHolyWar(attacker.name, target.name, pf.faithId);
      }
    }
  });

  prSave();
}

// ─── RENDER ──────────────────────────────────────────────────────
function prRenderPanel() {
  const el = document.getElementById("panel-political-religion");
  if (!el) return;

  const powers = _getPowers();
  const activeHW     = state.holyWars.filter(h => h.active);
  const activeMiss   = state.missionaries.filter(m => m.status === "active");
  const faithCounts  = {};
  Object.values(state.powerFaiths).forEach(pf => {
    faithCounts[pf.faithId] = (faithCounts[pf.faithId] || 0) + 1;
  });

  el.innerHTML = `
  <div style="padding:12px 4px 0;">
    <h2 style="color:#fde68a;font-size:1.4em;margin:0 0 4px;text-align:center;">⛪ Tôn Giáo Chính Trị</h2>
    <p style="color:#94a3b8;text-align:center;font-size:.85em;margin:0 0 16px;">
      ${Object.keys(state.powerFaiths).length} quốc gia có đức tin · ${activeMiss.length} giáo sĩ · ${activeHW.length} thánh chiến
    </p>

    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
      ${["faiths","adopt","missionaries","holywars","map","log"].map((tab,i) => `
        <button onclick="prSwitchTab('${tab}')" id="pr-tab-${tab}"
          style="flex:1;min-width:70px;padding:7px 4px;border-radius:8px;border:none;cursor:pointer;font-size:.78em;font-weight:700;
          background:${i===0?'#78350f':'#1a2535'};color:${i===0?'#fde68a':'#94a3b8'};
          border:1px solid ${i===0?'#d97706':'#2d3748'};">
          ${ {faiths:"🛕 Giáo Hội", adopt:"📖 Lập Quốc Giáo", missionaries:"📿 Giáo Sĩ", holywars:"⚔️ Thánh Chiến", map:"🗺️ Đức Tin", log:"📜 Nhật Ký"}[tab] }
        </button>`).join('')}
    </div>

    <div id="pr-content-faiths">${_renderFaithsTab(faithCounts)}</div>
    <div id="pr-content-adopt" style="display:none">${_renderAdoptTab(powers)}</div>
    <div id="pr-content-missionaries" style="display:none">${_renderMissionaryTab(activeMiss, powers)}</div>
    <div id="pr-content-holywars" style="display:none">${_renderHolyWarTab(activeHW, powers)}</div>
    <div id="pr-content-map" style="display:none">${_renderFaithMapTab(powers)}</div>
    <div id="pr-content-log" style="display:none">${_renderLogTab()}</div>
  </div>`;
}

function _renderFaithsTab(faithCounts) {
  return Object.entries(FAITHS).map(([id, f]) => {
    const count = faithCounts[id] || 0;
    const barW  = Math.round((count / Math.max(1, Object.keys(state.powerFaiths).length)) * 100);
    const doctrine = f.doctrines[0];
    const bonusText = Object.entries(f.bonuses).map(([k,v]) => `${k} ${v>0?'+':''}${v}`).join(' · ');
    return `<div style="background:#0f172a;border:1px solid ${f.color}33;border-left:4px solid ${f.color};border-radius:10px;padding:12px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <span style="color:${f.color};font-size:1.05em;font-weight:700;">${f.icon} ${f.label}</span>
        <span style="color:#60a5fa;font-size:.82em;font-weight:700;">${count} quốc gia</span>
      </div>
      <div style="color:#94a3b8;font-size:.8em;margin-bottom:6px;">${f.desc}</div>
      <div style="color:#64748b;font-size:.75em;margin-bottom:6px;">
        Giáo lý: <span style="color:${f.color};">${f.doctrines.join(' · ')}</span>
      </div>
      <div style="color:#4ade80;font-size:.75em;margin-bottom:6px;">Phúc lợi: ${bonusText}</div>
      <div style="height:5px;background:#1e3a5f;border-radius:4px;">
        <div style="height:100%;width:${barW}%;background:${f.color};border-radius:4px;transition:width .3s;"></div>
      </div>
    </div>`;
  }).join('');
}

function _renderAdoptTab(powers) {
  if (powers.length === 0) return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có thế lực nào.</div>`;

  let html = `<div style="background:#0f172a;border:1px solid #78350f;border-radius:10px;padding:14px;margin-bottom:16px;">
    <div style="color:#fde68a;font-weight:700;margin-bottom:12px;font-size:.9em;">📖 Lập / Đổi Quốc Giáo</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Thế lực:</label>
        <select id="pr-adopt-power" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${powers.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Đức Tin:</label>
        <select id="pr-adopt-faith" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${Object.entries(FAITHS).map(([id,f]) => `<option value="${id}">${f.icon} ${f.label}</option>`).join('')}
        </select>
      </div>
    </div>
    <button onclick="prActionAdopt()" style="width:100%;padding:9px;background:#78350f;color:#fde68a;border:1px solid #d97706;border-radius:8px;cursor:pointer;font-size:.86em;font-weight:700;">
      ⛪ Lập Quốc Giáo
    </button>
    <div id="pr-adopt-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  html += `<div style="color:#fde68a;font-weight:700;margin-bottom:10px;font-size:.88em;">🏛️ Quốc Giáo Hiện Tại</div>`;
  powers.forEach(p => {
    const pf = _getFaith(p.name);
    if (!pf) {
      html += `<div style="background:#0a0f1a;border:1px solid #1a2535;border-radius:8px;padding:9px 12px;margin-bottom:6px;opacity:.5;">
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">${p.name}</span><span style="color:#475569;font-size:.8em;">Vô Thần</span></div>
      </div>`;
    } else {
      const faith = FAITHS[pf.faithId];
      html += `<div style="background:#0f172a;border:1px solid ${faith.color}33;border-left:3px solid ${faith.color};border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#e2e8f0;font-weight:600;">${p.name}</span>
          <span style="color:${faith.color};font-size:.82em;">${faith.icon} ${faith.label}</span>
        </div>
        <div style="color:#64748b;font-size:.75em;margin-top:3px;">
          Lãnh đạo: ${pf.leader} · Ảnh hưởng: ${pf.influence}% · Lập năm ${pf.adopted}
        </div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <button onclick="prActionSuppress('${p.name}')"
            style="padding:4px 10px;background:#1a0a0a;color:#fbbf24;border:1px solid #92400e;border-radius:6px;cursor:pointer;font-size:.75em;">
            🔒 Đàn Áp Dị Giáo
          </button>
        </div>
        <div style="height:4px;background:#1e2535;border-radius:4px;margin-top:7px;">
          <div style="height:100%;width:${pf.influence}%;background:${faith.color};border-radius:4px;"></div>
        </div>
      </div>`;
    }
  });
  return html;
}

function _renderMissionaryTab(active, powers) {
  const powerNames = powers.map(p => p.name);
  const hasFaith   = powers.filter(p => _getFaith(p.name));

  let html = `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:14px;margin-bottom:14px;">
    <div style="color:#86efac;font-weight:700;margin-bottom:10px;font-size:.9em;">📿 Phái Giáo Sĩ Truyền Đạo</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Thế lực phái:</label>
        <select id="pr-miss-owner" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${hasFaith.map(p => { const f=_getFaith(p.name); const faith=FAITHS[f?.faithId]||{}; return `<option value="${p.name}">${p.name} (${faith.icon||''}${faith.label||''})</option>`; }).join('') || '<option disabled>Chưa có QG nào có Quốc Giáo</option>'}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Mục tiêu:</label>
        <select id="pr-miss-target" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${powerNames.map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
    </div>
    <button onclick="prActionSendMiss()" style="width:100%;padding:9px;background:#1a3a1a;color:#86efac;border:1px solid #22c55e;border-radius:8px;cursor:pointer;font-size:.86em;font-weight:700;">
      📿 Phái Giáo Sĩ
    </button>
    <div id="pr-miss-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  if (active.length > 0) {
    html += `<div style="color:#86efac;font-weight:700;margin-bottom:8px;font-size:.88em;">⏳ Đang Truyền Đạo (${active.length})</div>`;
    active.forEach(m => {
      const faith = FAITHS[m.faithId] || {};
      const remaining = Math.max(0, m.completesYear - _year());
      html += `<div style="background:#0f172a;border:1px solid ${faith.color||'#1e3a5f'}44;border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#e2e8f0;font-weight:600;">${faith.icon||'📿'} ${m.name}</span>
          <span style="color:#64748b;font-size:.8em;">còn ~${remaining} năm</span>
        </div>
        <div style="color:#94a3b8;font-size:.78em;margin-top:4px;">${m.owner} → ${m.target} · ${faith.label||''}</div>
      </div>`;
    });
  }

  const done = state.missionaries.filter(m => m.status === "returned").slice(0, 10);
  if (done.length > 0) {
    html += `<div style="color:#64748b;font-weight:700;margin:12px 0 6px;font-size:.82em;">📋 Hoàn Thành / Thất Bại</div>`;
    done.forEach(m => {
      const faith = FAITHS[m.faithId] || {};
      html += `<div style="background:#0a0f1a;border-radius:8px;padding:7px 10px;margin-bottom:5px;opacity:.65;">
        <span style="color:#475569;font-size:.78em;">${faith.icon||'📿'} ${m.name} · ${m.owner} → ${m.target}</span>
      </div>`;
    });
  }
  return html;
}

function _renderHolyWarTab(activeHW, powers) {
  const powerNames = powers.map(p => p.name);
  const hasFaith   = powers.filter(p => _getFaith(p.name));

  let html = `<div style="background:#0f172a;border:1px solid #7f1d1d;border-radius:10px;padding:14px;margin-bottom:14px;">
    <div style="color:#f87171;font-weight:700;margin-bottom:10px;font-size:.9em;">⚔️ Phát Động Thánh Chiến</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Kẻ Tấn Công:</label>
        <select id="pr-hw-attacker" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${hasFaith.map(p => { const f=_getFaith(p.name); const faith=FAITHS[f?.faithId]||{}; return `<option value="${p.name}">${p.name} (${faith.icon||''} ${faith.label||''})</option>`; }).join('') || '<option disabled>Cần có Quốc Giáo</option>'}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Kẻ Bị Tấn Công:</label>
        <select id="pr-hw-defender" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${powerNames.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
    </div>
    <button onclick="prActionDeclareHW()" style="width:100%;padding:9px;background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444;border-radius:8px;cursor:pointer;font-size:.86em;font-weight:700;">
      ⚔️ Phát Động Thánh Chiến!
    </button>
    <div id="pr-hw-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  if (activeHW.length > 0) {
    html += `<div style="color:#f87171;font-weight:700;margin-bottom:8px;font-size:.88em;">🔥 Thánh Chiến Đang Diễn Ra (${activeHW.length})</div>`;
    activeHW.forEach(hw => {
      const faith = FAITHS[hw.faithId] || {};
      const dur = _year() - hw.year;
      html += `<div style="background:#1a0505;border:1px solid #7f1d1d;border-radius:10px;padding:12px;margin-bottom:10px;">
        <div style="color:#f87171;font-weight:700;font-size:.95em;">${faith.icon||'⚔️'} ${hw.name}</div>
        <div style="color:#94a3b8;font-size:.8em;margin-top:4px;">${hw.attacker} ⚔️ ${hw.defender} · Năm ${hw.year} (${dur} năm)</div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button onclick="prEndHolyWarUI('${hw.id}','${hw.attacker}')"
            style="flex:1;padding:6px;background:#78350f;color:#fde68a;border:1px solid #d97706;border-radius:8px;cursor:pointer;font-size:.78em;">
            🏆 ${hw.attacker} Thắng
          </button>
          <button onclick="prEndHolyWarUI('${hw.id}','${hw.defender}')"
            style="flex:1;padding:6px;background:#1e3a5f;color:#60a5fa;border:1px solid #3b82f6;border-radius:8px;cursor:pointer;font-size:.78em;">
            🛡️ ${hw.defender} Cầm Cự
          </button>
        </div>
      </div>`;
    });
  }

  const resolved = state.holyWars.filter(h => !h.active).slice(0, 8);
  if (resolved.length > 0) {
    html += `<div style="color:#64748b;font-weight:700;margin:12px 0 6px;font-size:.82em;">📜 Thánh Chiến Đã Kết Thúc</div>`;
    resolved.forEach(hw => {
      const faith = FAITHS[hw.faithId] || {};
      html += `<div style="background:#0a0f1a;border-radius:8px;padding:7px 10px;margin-bottom:5px;opacity:.65;">
        <div style="color:#475569;font-size:.78em;">${faith.icon||'⚔️'} ${hw.name} · ${hw.attacker} vs ${hw.defender} · Năm ${hw.year}–${hw.resolvedYear||'?'} · ${hw.winner ? 'Thắng: ' + hw.winner : ''}</div>
      </div>`;
    });
  }
  return html;
}

function _renderFaithMapTab(powers) {
  if (powers.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có thế lực nào.</div>`;

  const byFaith = {};
  Object.entries(state.powerFaiths).forEach(([name, pf]) => {
    if (!byFaith[pf.faithId]) byFaith[pf.faithId] = [];
    byFaith[pf.faithId].push({ name, influence: pf.influence, leader: pf.leader });
  });

  let html = `<div style="margin-bottom:14px;">`;
  Object.entries(FAITHS).forEach(([id, f]) => {
    const members = byFaith[id] || [];
    if (members.length === 0) return;
    html += `<div style="background:#0f172a;border:1px solid ${f.color}44;border-radius:10px;padding:12px;margin-bottom:10px;">
      <div style="color:${f.color};font-weight:700;font-size:.95em;margin-bottom:8px;">${f.icon} ${f.label} — ${members.length} quốc gia</div>
      ${members.map(m => `<div style="display:flex;justify-content:space-between;padding:5px 8px;background:#0a0f1a;border-radius:6px;margin-bottom:4px;">
        <span style="color:#e2e8f0;font-size:.82em;">${m.name}</span>
        <span style="color:${f.color};font-size:.78em;">${m.influence}% · ${m.leader}</span>
      </div>`).join('')}
    </div>`;
  });

  const noFaith = powers.filter(p => !state.powerFaiths[p.name]);
  if (noFaith.length > 0) {
    html += `<div style="background:#0a0f1a;border:1px solid #1a2535;border-radius:10px;padding:10px;margin-bottom:10px;opacity:.6;">
      <div style="color:#475569;font-size:.88em;font-weight:700;margin-bottom:6px;">🚫 Vô Thần (${noFaith.length})</div>
      ${noFaith.map(p => `<span style="color:#475569;font-size:.78em;margin-right:8px;">${p.name}</span>`).join('')}
    </div>`;
  }
  html += `</div>`;
  return html;
}

function _renderLogTab() {
  if (state.religionLog.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Nhật ký chưa có sự kiện.</div>`;
  const colors = { info:"#94a3b8", success:"#4ade80", danger:"#f87171", important:"#fde68a" };
  return state.religionLog.slice(0, 30).map(e =>
    `<div style="padding:7px 10px;border-left:3px solid ${colors[e.type]||colors.info};background:#0f172a;border-radius:0 8px 8px 0;margin-bottom:6px;">
      <span style="color:#475569;font-size:.78em;">Năm ${e.year}</span>
      <div style="color:${colors[e.type]||colors.info};font-size:.83em;margin-top:2px;">${e.msg}</div>
    </div>`
  ).join('');
}

// ─── GLOBAL UI CALLBACKS ─────────────────────────────────────────
window.prSwitchTab = function(tab) {
  ["faiths","adopt","missionaries","holywars","map","log"].forEach(t => {
    const c = document.getElementById("pr-content-" + t);
    const b = document.getElementById("pr-tab-" + t);
    if (c) c.style.display = (t === tab) ? "" : "none";
    if (b) {
      b.style.background  = (t === tab) ? "#78350f" : "#1a2535";
      b.style.color       = (t === tab) ? "#fde68a" : "#94a3b8";
      b.style.borderColor = (t === tab) ? "#d97706" : "#2d3748";
    }
  });
};

window.prActionAdopt = function() {
  const power  = document.getElementById("pr-adopt-power")?.value;
  const faithId = document.getElementById("pr-adopt-faith")?.value;
  const msg = document.getElementById("pr-adopt-msg");
  if (!power || !faithId) { if(msg) msg.textContent = "⚠️ Chọn đầy đủ thế lực và đức tin"; return; }
  const result = prAdoptFaith(power, faithId);
  if(msg) { msg.style.color = result.ok ? "#fde68a" : "#f87171"; msg.textContent = result.ok ? `✅ ${FAITHS[faithId]?.label} đã được lập làm Quốc Giáo!` : "⚠️ " + result.msg; }
};

window.prActionSendMiss = function() {
  const owner  = document.getElementById("pr-miss-owner")?.value;
  const target = document.getElementById("pr-miss-target")?.value;
  const msg    = document.getElementById("pr-miss-msg");
  if (!owner || !target || owner === target) { if(msg) msg.textContent = "⚠️ Chọn hai thế lực khác nhau"; return; }
  const result = prSendMissionary(owner, target);
  if(msg) { msg.style.color = result.ok ? "#86efac" : "#f87171"; msg.textContent = result.ok ? `✅ Giáo sĩ ${result.missionary.name} lên đường sang ${target}!` : "⚠️ " + result.msg; }
  if(result.ok) setTimeout(prRenderPanel, 300);
};

window.prActionDeclareHW = function() {
  const attacker = document.getElementById("pr-hw-attacker")?.value;
  const defender = document.getElementById("pr-hw-defender")?.value;
  const msg = document.getElementById("pr-hw-msg");
  if (!attacker || !defender || attacker === defender) { if(msg) msg.textContent = "⚠️ Chọn hai thế lực khác nhau"; return; }
  if (!confirm(`Phát động Thánh Chiến: ${attacker} chống lại ${defender}?`)) return;
  const pf = _getFaith(attacker);
  if (!pf) { if(msg) { msg.style.color="#f87171"; msg.textContent = "⚠️ " + attacker + " chưa có Quốc Giáo"; } return; }
  const result = prDeclareHolyWar(attacker, defender, pf.faithId);
  if(msg) { msg.style.color = result.ok ? "#f87171" : "#fbbf24"; msg.textContent = result.ok ? `⚔️ Thánh Chiến ${result.holyWar.name} bắt đầu!` : "⚠️ " + result.msg; }
};

window.prEndHolyWarUI = function(hwId, winner) {
  prEndHolyWar(hwId, winner);
};

window.prActionSuppress = function(powerName) {
  const result = prSuppressHeresy(powerName);
  if (!result.ok && typeof toast === "function") toast("⚠️ " + result.msg, "danger");
};

// ─── PUBLIC API ───────────────────────────────────────────────────
window.prAdoptFaith      = prAdoptFaith;
window.prSendMissionary  = prSendMissionary;
window.prDeclareHolyWar  = prDeclareHolyWar;
window.prEndHolyWar      = prEndHolyWar;
window.prRenderPanel     = prRenderPanel;
window.prTick            = prTick;
window.prGetFaith        = _getFaith;
window.religionState     = state;

// ─── INIT ─────────────────────────────────────────────────────────
(function prInit() {
  prLoad();
  if (state.initialized) return;
  state.initialized = true;

  setInterval(function() {
    if (typeof window.year !== "undefined") prTick();
  }, 10000);

  console.log("[PoliticalReligion V1] ⛪ Hệ thống Tôn Giáo Chính Trị khởi động — 8 Đức Tin · Thánh Chiến · Thần Quyền sẵn sàng.");
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(function() { if (!state.initialized) { prLoad(); state.initialized = true; } }, 2000); });
}

})();
