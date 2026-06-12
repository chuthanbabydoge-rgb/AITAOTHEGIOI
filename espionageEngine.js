// ═══════════════════════════════════════════════════════════════
// ESPIONAGE ENGINE V1 — Creator God World Simulator V23
// Hệ thống Gián Điệp: Tuyển Mộ · Nhiệm Vụ · Phản Gián · Ám Sát
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const STORAGE_KEY = "cgv6_espionage";

// ─── OPERATION DEFINITIONS ────────────────────────────────────────
const OPERATIONS = {
  INTEL: {
    label: "Thu Thập Tin Tức", icon: "🔍", risk: 0.10, duration: 3,
    desc: "Thu thập thông tin quân sự, kinh tế và chính trị của mục tiêu.",
    reward: "Tiết lộ stats ẩn của thế lực địch",
    skillReq: 1,
  },
  STEAL: {
    label: "Đánh Cắp Tài Nguyên", icon: "💰", risk: 0.22, duration: 5,
    desc: "Lấy cắp vàng, lương thực hoặc bí mật thương mại.",
    reward: "Chuyển tài nguyên sang bên ta",
    skillReq: 2,
  },
  SABOTAGE: {
    label: "Phá Hoại Kinh Tế", icon: "⚙️", risk: 0.28, duration: 4,
    desc: "Đốt kho lương, phá cầu đường, làm gián đoạn thương mại.",
    reward: "Giảm sức mạnh kinh tế địch -15%",
    skillReq: 2,
  },
  AGITATE: {
    label: "Kích Động Nội Loạn", icon: "🔥", risk: 0.30, duration: 6,
    desc: "Kích động dân chúng nổi dậy, làm suy yếu ổn định nội bộ.",
    reward: "Gây bất ổn, tiêu hao binh lực địch",
    skillReq: 3,
  },
  ASSASSINATE: {
    label: "Ám Sát Lãnh Đạo", icon: "🗡️", risk: 0.45, duration: 8,
    desc: "Loại bỏ vua, tướng lĩnh hoặc quý tộc cấp cao.",
    reward: "Gây khủng hoảng lãnh đạo cho địch",
    skillReq: 4,
  },
  COUP: {
    label: "Lật Đổ Chính Quyền", icon: "👑", risk: 0.65, duration: 15,
    desc: "Cài cắm phe thân ta lên nắm quyền. Cực kỳ nguy hiểm.",
    reward: "Đổi chính quyền — thế lực địch trở thành đồng minh",
    skillReq: 5,
  },
};

// ─── SPY SKILL NAMES ──────────────────────────────────────────────
const SKILL_NAMES = ["Tập Sự","Gián Điệp","Đặc Vụ","Bậc Thầy","Huyền Thoại"];
const SPY_NAMES_FIRST = ["Nguyễn","Trần","Lê","Phạm","Hoàng","Vũ","Đặng","Bùi","Đinh","Lý","Phan","Dương"];
const SPY_NAMES_LAST  = ["Hắc Ảnh","Thần Nhanh","Vô Hình","Bóng Tối","Sắc Lạnh","Mặt Nạ","Thiên Biến","Ẩn Long","Sa Mạc","Phong Ba"];
const CAUGHT_OUTCOMES  = ["Bị xử tử", "Bị trục xuất", "Bị tra tấn rồi thả", "Bị giam cầm", "Bỏ trốn bị thương"];

// ─── STATE ────────────────────────────────────────────────────────
let state = {
  spies:           [],   // { id, name, owner, skill, status, mission, target, deployedYear, ... }
  operations:      [],   // completed/failed ops log
  counterIntel:    {},   // powerName → { level, caughtCount }
  espionageLog:    [],   // { year, msg, type }
  idCounter:       0,
  initialized:     false,
};

// ─── SAVE / LOAD ─────────────────────────────────────────────────
function esSave() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function esLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────
function _currentYear() { return (typeof window.year !== "undefined") ? window.year : 0; }

function _log(msg, type) {
  state.espionageLog.unshift({ year: _currentYear(), msg, type: type || "info" });
  if (state.espionageLog.length > 200) state.espionageLog.pop();
  if (typeof addLog === "function") addLog("[Gián Điệp] " + msg, type || "info");
  if (typeof htAddEvent === "function") htAddEvent({ year: _currentYear(), text: msg, tag: "espionage" });
}

function _newId() { return "spy_" + (++state.idCounter) + "_" + Date.now(); }

function _randomSpyName() {
  return SPY_NAMES_FIRST[Math.floor(Math.random()*SPY_NAMES_FIRST.length)] + " " +
         SPY_NAMES_LAST[Math.floor(Math.random()*SPY_NAMES_LAST.length)];
}

function _getPowers() {
  const powers = [];
  if (window.kingdoms) window.kingdoms.forEach(k => { if (k.active !== false) powers.push({ name: k.name, type: "kingdom" }); });
  if (window.empires)  window.empires.forEach(e  => { if (!e.collapsed) powers.push({ name: e.name, type: "empire" }); });
  if (window.countries && powers.length === 0) {
    window.countries.filter(c => !c.collapsed).slice(0, 12).forEach(c => powers.push({ name: c.name, type: "nation" }));
  }
  return powers;
}

function _getCounterIntel(powerName) {
  if (!state.counterIntel[powerName]) state.counterIntel[powerName] = { level: 1 + Math.floor(Math.random()*3), caughtCount: 0 };
  return state.counterIntel[powerName];
}

// ─── CORE ACTIONS ─────────────────────────────────────────────────
function esRecruitSpy(ownerName, skillLevel) {
  const skill = Math.max(1, Math.min(5, skillLevel || 1));
  const spy = {
    id:          _newId(),
    name:        _randomSpyName(),
    owner:       ownerName,
    skill:       skill,
    skillLabel:  SKILL_NAMES[skill - 1],
    status:      "standby",   // standby | on_mission | caught | dead | retired
    mission:     null,
    target:      null,
    deployedYear: null,
    completesYear: null,
    successCount: 0,
    failCount:    0,
    history:      [],
  };
  state.spies.push(spy);
  _log(`🕵️ ${ownerName} tuyển mộ gián điệp ${spy.name} [${spy.skillLabel}]`);
  esSave();
  return { ok: true, spy };
}

function esDeployMission(spyId, targetPower, opType) {
  const spy = state.spies.find(s => s.id === spyId);
  if (!spy) return { ok: false, msg: "Không tìm thấy gián điệp" };
  if (spy.status !== "standby") return { ok: false, msg: "Gián điệp đang bận hoặc không còn hoạt động" };

  const op = OPERATIONS[opType];
  if (!op) return { ok: false, msg: "Nhiệm vụ không hợp lệ" };
  if (spy.skill < op.skillReq) return { ok: false, msg: `Cần kỹ năng tối thiểu ${SKILL_NAMES[op.skillReq-1]} cho nhiệm vụ này` };

  const year = _currentYear();
  spy.status      = "on_mission";
  spy.mission     = opType;
  spy.target      = targetPower;
  spy.deployedYear= year;
  spy.completesYear = year + op.duration;

  _log(`${op.icon} ${spy.owner}: ${spy.name} được phái tới ${targetPower} — nhiệm vụ "${op.label}"`);
  esSave();
  return { ok: true, spy, completesYear: spy.completesYear };
}

function _resolveOperation(spy) {
  const op  = OPERATIONS[spy.mission];
  const ci  = _getCounterIntel(spy.target);
  const year = _currentYear();

  // Success chance = spy skill vs counter intel
  const baseSuccess = 0.40 + (spy.skill * 0.12) - (ci.level * 0.08);
  const caught      = Math.random() < (op.risk + (ci.level * 0.05) - (spy.skill * 0.06));
  const success     = !caught && (Math.random() < Math.max(0.1, Math.min(0.9, baseSuccess)));

  const opRecord = {
    id:        "op_" + Date.now(),
    spyId:     spy.id,
    spyName:   spy.name,
    owner:     spy.owner,
    target:    spy.target,
    type:      spy.mission,
    label:     op.label,
    icon:      op.icon,
    year,
    success,
    caught,
    outcome:   "",
    effects:   [],
  };

  if (caught) {
    const cOutcome = CAUGHT_OUTCOMES[Math.floor(Math.random()*CAUGHT_OUTCOMES.length)];
    opRecord.outcome = cOutcome;
    ci.caughtCount++;
    spy.failCount++;
    spy.history.push({ year, result: "caught", target: spy.target, op: op.label });

    const isDead = cOutcome === "Bị xử tử";
    spy.status = isDead ? "dead" : "standby";
    if (isDead) {
      _log(`💀 ${spy.name} (${spy.owner}) bị ${spy.target} bắt và ${cOutcome}!`, "danger");
    } else {
      _log(`⚠️ ${spy.name} (${spy.owner}) bị ${spy.target} phát hiện — ${cOutcome}`, "danger");
    }

    // Diplomatic penalty
    if (typeof drProposeTreaty !== "undefined" && typeof drGetRelation === "function") {
      const rel = drGetRelation(spy.owner, spy.target);
      if (rel) {
        rel.score = Math.max(-100, rel.score - 25);
        rel.status = rel.score <= -80 ? "WAR" : rel.score <= -50 ? "HOSTILE" : "TENSE";
        rel.history.push({ year, event: `Gián điệp bị bắt: ${cOutcome}`, delta: -25 });
      }
    }
    if (typeof toast === "function") toast(`⚠️ Gián điệp ${spy.name} bị bắt tại ${spy.target}!`, "danger");

  } else if (success) {
    spy.successCount++;
    spy.history.push({ year, result: "success", target: spy.target, op: op.label });
    spy.status = "standby";

    // Apply effects
    const effects = _applyOpEffects(spy.mission, spy.owner, spy.target);
    opRecord.effects = effects;
    opRecord.outcome = "Thành công";
    _log(`✅ ${spy.name} hoàn thành "${op.label}" tại ${spy.target}!${effects.length ? " " + effects[0] : ""}`, "success");

    // Skill up chance
    if (Math.random() < 0.25 && spy.skill < 5) {
      spy.skill++;
      spy.skillLabel = SKILL_NAMES[spy.skill - 1];
      _log(`⬆️ ${spy.name} thăng cấp lên [${spy.skillLabel}]!`, "important");
    }

    if (typeof toast === "function") toast(`✅ Gián điệp ${spy.name} thành công: ${op.label}!`, "success");
  } else {
    // Fail silently — spy returns empty-handed
    spy.failCount++;
    spy.history.push({ year, result: "fail", target: spy.target, op: op.label });
    spy.status = "standby";
    opRecord.outcome = "Thất bại — không có kết quả";
    _log(`❌ ${spy.name} thất bại nhiệm vụ "${op.label}" tại ${spy.target}`);
  }

  spy.mission      = null;
  spy.target       = null;
  spy.deployedYear = null;
  spy.completesYear= null;

  state.operations.unshift(opRecord);
  if (state.operations.length > 100) state.operations.pop();
  esSave();
  return opRecord;
}

function _applyOpEffects(opType, owner, target) {
  const effects = [];
  try {
    switch (opType) {
      case "INTEL":
        effects.push("Thông tin tình báo được tổng hợp.");
        break;
      case "STEAL": {
        const amount = 50 + Math.floor(Math.random() * 200);
        if (window.countries) {
          const t = window.countries.find(c => c.name === target);
          const o = window.countries.find(c => c.name === owner);
          if (t && t.gold > 0) { t.gold = Math.max(0, (t.gold||0) - amount); }
          if (o) { o.gold = (o.gold||0) + amount; }
        }
        effects.push(`Đánh cắp ${amount} vàng từ ${target}`);
        break;
      }
      case "SABOTAGE": {
        if (window.countries) {
          const t = window.countries.find(c => c.name === target);
          if (t) { t.economy = Math.max(0, (t.economy||10) - 2); }
        }
        effects.push(`Phá hoại kinh tế ${target} —2`);
        break;
      }
      case "AGITATE": {
        if (window.countries) {
          const t = window.countries.find(c => c.name === target);
          if (t) { t.stability = Math.max(0, (t.stability||50) - 15); }
        }
        effects.push(`Gây bất ổn tại ${target} —15 ổn định`);
        break;
      }
      case "ASSASSINATE": {
        const titles = ["Quốc Vương","Tướng Lĩnh","Đại Thần","Hoàng Tử","Công Tước"];
        const victim = titles[Math.floor(Math.random()*titles.length)];
        effects.push(`${victim} của ${target} bị ám sát. Khủng hoảng lãnh đạo!`);
        if (window.countries) {
          const t = window.countries.find(c => c.name === target);
          if (t) { t.stability = Math.max(0, (t.stability||50) - 25); t.military = Math.max(0, (t.military||10) - 5); }
        }
        if (typeof htAddEvent === "function") htAddEvent({ year: _currentYear(), text: `⚰️ ${victim} của ${target} bị ám sát bởi gián điệp ${owner}`, tag: "assassination" });
        break;
      }
      case "COUP": {
        effects.push(`Chính biến tại ${target}! Chính quyền thân ${owner} lên nắm quyền.`);
        if (window.countries) {
          const t = window.countries.find(c => c.name === target);
          if (t) { t.stability = Math.max(0, (t.stability||50) - 40); }
        }
        if (typeof htAddEvent === "function") htAddEvent({ year: _currentYear(), text: `👑 Chính biến tại ${target} — ${owner} giật dây lật đổ chính quyền!`, tag: "coup" });
        break;
      }
    }
  } catch(e) {}
  return effects;
}

// ─── TICK ─────────────────────────────────────────────────────────
function esTick() {
  const year = _currentYear();
  let changed = false;

  // Resolve completed missions
  state.spies.forEach(spy => {
    if (spy.status === "on_mission" && spy.completesYear !== null && year >= spy.completesYear) {
      _resolveOperation(spy);
      changed = true;
    }
  });

  // AI: auto-recruit and deploy for existing powers occasionally
  if (Math.random() < 0.15) {
    const powers = _getPowers();
    if (powers.length >= 2) {
      const owner = powers[Math.floor(Math.random()*powers.length)];
      const others = powers.filter(p => p.name !== owner.name);
      const target = others[Math.floor(Math.random()*others.length)];

      // Only if owner has no active spy against this target
      const hasActiveMission = state.spies.some(s =>
        s.owner === owner.name && s.target === target.name && s.status === "on_mission"
      );
      if (!hasActiveMission) {
        const ownerSpies = state.spies.filter(s => s.owner === owner.name && s.status === "standby");
        if (ownerSpies.length === 0 && Math.random() < 0.4) {
          esRecruitSpy(owner.name, Math.ceil(Math.random()*3));
        } else if (ownerSpies.length > 0) {
          const spy = ownerSpies[Math.floor(Math.random()*ownerSpies.length)];
          const availableOps = Object.keys(OPERATIONS).filter(k => spy.skill >= OPERATIONS[k].skillReq);
          if (availableOps.length > 0) {
            const op = availableOps[Math.floor(Math.random()*availableOps.length)];
            esDeployMission(spy.id, target.name, op);
          }
        }
      }
    }
  }

  if (changed) { esSave(); esRenderPanel(); }
}

// ─── RENDER PANEL ─────────────────────────────────────────────────
function esRenderPanel() {
  const el = document.getElementById("panel-espionage");
  if (!el) return;

  const powers = _getPowers();
  const mySpies      = state.spies.filter(s => s.status !== "dead" && s.status !== "retired");
  const onMission    = state.spies.filter(s => s.status === "on_mission");
  const recentOps    = state.operations.slice(0, 30);
  const caughtSpies  = state.spies.filter(s => s.status === "caught");

  el.innerHTML = `
  <div style="padding:12px 4px 0;">
    <h2 style="color:#c084fc;font-size:1.4em;margin:0 0 4px;text-align:center;">🕵️ Mạng Lưới Gián Điệp</h2>
    <p style="color:#94a3b8;text-align:center;font-size:.85em;margin:0 0 16px;">
      ${mySpies.length} điệp viên · ${onMission.length} đang nhiệm vụ · ${state.operations.length} chiến dịch
    </p>

    <!-- TABS -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
      ${["agents","deploy","ops","ci","log"].map((tab,i) => `
        <button onclick="esSwitchTab('${tab}')" id="es-tab-${tab}"
          style="flex:1;padding:7px 6px;border-radius:8px;border:none;cursor:pointer;font-size:.82em;font-weight:700;
          background:${i===0?'#2d1a4a':'#1a2535'};color:${i===0?'#c084fc':'#94a3b8'};
          border:1px solid ${i===0?'#8b5cf6':'#2d3748'};">
          ${ {agents:"🕵️ Điệp Viên", deploy:"🎯 Triển Khai", ops:"📋 Chiến Dịch", ci:"🛡️ Phản Gián", log:"📜 Nhật Ký"}[tab] }
        </button>`).join('')}
    </div>

    <div id="es-content-agents">${_renderAgentsTab(mySpies, powers)}</div>
    <div id="es-content-deploy" style="display:none">${_renderDeployTab(mySpies, powers)}</div>
    <div id="es-content-ops" style="display:none">${_renderOpsTab(recentOps)}</div>
    <div id="es-content-ci" style="display:none">${_renderCITab(powers)}</div>
    <div id="es-content-log" style="display:none">${_renderLogTab()}</div>
  </div>`;
}

// ─── TAB RENDERERS ────────────────────────────────────────────────
function _renderAgentsTab(spies, powers) {
  const powerNames = powers.map(p => p.name);

  let html = `<div style="background:#0f172a;border:1px solid #2d1a4a;border-radius:10px;padding:12px;margin-bottom:14px;">
    <div style="color:#c084fc;font-weight:700;margin-bottom:10px;font-size:.9em;">➕ Tuyển Mộ Điệp Viên Mới</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Thế lực:</label>
        <select id="es-recruit-owner" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${powerNames.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Cấp độ:</label>
        <select id="es-recruit-skill" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${SKILL_NAMES.map((n,i)=>`<option value="${i+1}">${n} (Lv.${i+1})</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;align-items:flex-end;">
        <button onclick="esActionRecruit()" style="width:100%;padding:7px;background:#2d1a4a;color:#c084fc;border:1px solid #8b5cf6;border-radius:8px;cursor:pointer;font-size:.82em;font-weight:700;">
          🕵️ Tuyển
        </button>
      </div>
    </div>
    <div id="es-recruit-msg" style="font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  if (spies.length === 0) {
    html += `<div style="color:#64748b;text-align:center;padding:30px 0;">Chưa có điệp viên nào. Hãy tuyển mộ!</div>`;
    return html;
  }

  const statusColors = { standby:"#4ade80", on_mission:"#fbbf24", caught:"#f87171", dead:"#475569", retired:"#64748b" };
  const statusLabels = { standby:"Sẵn Sàng", on_mission:"Đang Nhiệm Vụ", caught:"Bị Bắt", dead:"Đã Chết", retired:"Nghỉ Hưu" };

  spies.forEach(spy => {
    const col = statusColors[spy.status] || "#94a3b8";
    const lbl = statusLabels[spy.status] || spy.status;
    const skillStars = "★".repeat(spy.skill) + "☆".repeat(5 - spy.skill);
    const missionInfo = spy.status === "on_mission" && spy.mission
      ? `<div style="color:#fbbf24;font-size:.78em;margin-top:4px;">${OPERATIONS[spy.mission]?.icon||''} ${OPERATIONS[spy.mission]?.label||''} → ${spy.target} (hết năm ${spy.completesYear})</div>`
      : "";
    const histSummary = spy.successCount > 0 || spy.failCount > 0
      ? `<span style="color:#4ade80;font-size:.75em;">✅${spy.successCount}</span> <span style="color:#f87171;font-size:.75em;">❌${spy.failCount}</span>`
      : "";

    html += `<div style="background:#0f172a;border:1px solid ${col}44;border-left:3px solid ${col};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#e2e8f0;font-weight:700;">🕵️ ${spy.name}</span>
        <span style="color:${col};font-size:.8em;font-weight:700;">${lbl}</span>
      </div>
      <div style="color:#94a3b8;font-size:.8em;margin-top:3px;">
        ${spy.owner} · <span style="color:#a78bfa;">${spy.skillLabel}</span> <span style="color:#fbbf24;letter-spacing:1px;">${skillStars}</span> ${histSummary}
      </div>
      ${missionInfo}
    </div>`;
  });

  const dead = state.spies.filter(s => s.status === "dead");
  if (dead.length > 0) {
    html += `<div style="color:#475569;font-size:.82em;font-weight:700;margin:12px 0 6px;">💀 Điệp Viên Đã Hy Sinh (${dead.length})</div>`;
    dead.forEach(spy => {
      html += `<div style="background:#0a0f1a;border-radius:8px;padding:7px 10px;margin-bottom:5px;opacity:.6;">
        <span style="color:#475569;font-size:.8em;">🕵️ ${spy.name} [${spy.skillLabel}] · ${spy.owner} · ✅${spy.successCount}/❌${spy.failCount}</span>
      </div>`;
    });
  }

  return html;
}

function _renderDeployTab(spies, powers) {
  const standby = spies.filter(s => s.status === "standby");
  if (standby.length === 0) {
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Không có điệp viên ở trạng thái Sẵn Sàng. Hãy tuyển mộ hoặc chờ nhiệm vụ hoàn thành.</div>`;
  }

  const powerNames = powers.map(p => p.name);
  let html = `<div style="background:#0f172a;border:1px solid #2d1a4a;border-radius:10px;padding:12px;margin-bottom:14px;">
    <div style="color:#c084fc;font-weight:700;margin-bottom:10px;font-size:.9em;">🎯 Ra Lệnh Nhiệm Vụ</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Điệp viên:</label>
        <select id="es-deploy-spy" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;" onchange="esUpdateOps()">
          ${standby.map(s=>`<option value="${s.id}">${s.name} [${s.skillLabel}]</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Mục tiêu:</label>
        <select id="es-deploy-target" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${powerNames.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="margin-bottom:10px;">
      <label style="color:#94a3b8;font-size:.8em;">Nhiệm vụ:</label>
      <div id="es-ops-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
        ${_renderOpsGrid(standby[0])}
      </div>
    </div>
    <button onclick="esActionDeploy()" style="width:100%;padding:9px;background:#2d1a4a;color:#c084fc;border:1px solid #8b5cf6;border-radius:8px;cursor:pointer;font-size:.86em;font-weight:700;">
      🎯 Triển Khai Gián Điệp
    </button>
    <div id="es-deploy-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  // Active missions
  const onMission = spies.filter(s => s.status === "on_mission");
  if (onMission.length > 0) {
    html += `<div style="color:#fbbf24;font-weight:700;margin-bottom:8px;font-size:.88em;">⏳ Đang Thực Hiện (${onMission.length})</div>`;
    onMission.forEach(spy => {
      const op = OPERATIONS[spy.mission] || {};
      const remaining = (spy.completesYear || 0) - _currentYear();
      const ci = _getCounterIntel(spy.target);
      html += `<div style="background:#1a150a;border:1px solid #78350f;border-radius:10px;padding:10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#fbbf24;font-weight:600;">${op.icon||'🎯'} ${op.label||spy.mission}</span>
          <span style="color:#64748b;font-size:.8em;">còn ~${Math.max(0,remaining)} năm</span>
        </div>
        <div style="color:#94a3b8;font-size:.8em;margin-top:4px;">
          🕵️ ${spy.name} → 🏰 ${spy.target} · Phản gián địch: ${"🛡".repeat(ci.level)}
        </div>
      </div>`;
    });
  }

  return html;
}

function _renderOpsGrid(spy) {
  if (!spy) return "";
  return Object.entries(OPERATIONS).map(([k, op]) => {
    const canUse = spy.skill >= op.skillReq;
    const riskPct = Math.round(op.risk * 100);
    return `<label style="cursor:${canUse?'pointer':'not-allowed'};opacity:${canUse?1:.45};">
      <input type="radio" name="es-op-select" value="${k}" ${k==='INTEL'?'checked':''} ${canUse?'':'disabled'}
        style="accent-color:#8b5cf6;">
      <span style="color:${canUse?'#e2e8f0':'#64748b'};font-size:.8em;"> ${op.icon} ${op.label}</span>
      <span style="color:#f87171;font-size:.73em;display:block;margin-left:14px;">⚠️ ${riskPct}% nguy hiểm · ${op.duration} năm</span>
    </label>`;
  }).join('');
}

function _renderOpsTab(ops) {
  if (ops.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có chiến dịch nào được thực hiện.</div>`;

  return ops.map(op => {
    const col = op.caught ? "#f87171" : op.success ? "#4ade80" : "#fbbf24";
    const badge = op.caught ? "BỊ BẮT" : op.success ? "THÀNH CÔNG" : "THẤT BẠI";
    return `<div style="background:#0f172a;border:1px solid ${col}33;border-left:3px solid ${col};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#e2e8f0;font-weight:600;">${op.icon} ${op.label}</span>
        <span style="color:${col};font-size:.75em;font-weight:700;padding:2px 7px;background:${col}22;border-radius:10px;">${badge}</span>
      </div>
      <div style="color:#94a3b8;font-size:.78em;margin-top:4px;">
        🕵️ ${op.spyName} · ${op.owner} → ${op.target} · Năm ${op.year}
      </div>
      ${op.effects && op.effects.length > 0 ? `<div style="color:#86efac;font-size:.78em;margin-top:3px;">→ ${op.effects.join('; ')}</div>` : ''}
      ${op.outcome ? `<div style="color:${col};font-size:.76em;margin-top:2px;opacity:.8;">${op.outcome}</div>` : ''}
    </div>`;
  }).join('');
}

function _renderCITab(powers) {
  if (powers.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Chưa có thế lực nào.</div>`;

  let html = `<div style="color:#60a5fa;font-weight:700;margin-bottom:12px;font-size:.9em;">🛡️ Năng Lực Phản Gián Các Thế Lực</div>`;
  html += `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:12px;margin-bottom:14px;">
    <p style="color:#94a3b8;font-size:.82em;margin:0 0 12px;">Thêm điểm phản gián cho thế lực của bạn để chống lại gián điệp địch.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      <select id="es-ci-power" style="flex:2;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
        ${powers.map(p=>`<option value="${p.name}">${p.name}</option>`).join('')}
      </select>
      <button onclick="esBoostCI()" style="flex:1;padding:7px;background:#1e3a5f;color:#60a5fa;border:1px solid #3b82f6;border-radius:8px;cursor:pointer;font-size:.82em;">
        +1 Phản Gián
      </button>
    </div>
    <div id="es-ci-msg" style="font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;

  powers.slice(0,10).forEach(p => {
    const ci = _getCounterIntel(p.name);
    const shields = "🛡".repeat(ci.level) + "○".repeat(Math.max(0, 5 - ci.level));
    html += `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#e2e8f0;font-weight:600;">${p.name}</span>
        <span style="font-size:1em;" title="Cấp ${ci.level}">${shields}</span>
      </div>
      <div style="color:#94a3b8;font-size:.78em;margin-top:3px;">
        Cấp phản gián: ${ci.level}/5 · Đã bắt: ${ci.caughtCount} gián điệp
      </div>
      <div style="height:4px;background:#1e3a5f;border-radius:4px;margin-top:6px;">
        <div style="height:100%;width:${(ci.level/5)*100}%;background:#3b82f6;border-radius:4px;"></div>
      </div>
    </div>`;
  });

  return html;
}

function _renderLogTab() {
  if (state.espionageLog.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Nhật ký chưa có sự kiện nào.</div>`;
  const colors = { info:"#94a3b8", success:"#4ade80", danger:"#f87171", important:"#c084fc" };
  return state.espionageLog.slice(0, 30).map(e =>
    `<div style="padding:7px 10px;border-left:3px solid ${colors[e.type]||colors.info};background:#0f172a;border-radius:0 8px 8px 0;margin-bottom:6px;">
      <span style="color:#475569;font-size:.78em;">Năm ${e.year}</span>
      <div style="color:${colors[e.type]||colors.info};font-size:.83em;margin-top:2px;">${e.msg}</div>
    </div>`
  ).join('');
}

// ─── GLOBAL UI CALLBACKS ─────────────────────────────────────────
window.esSwitchTab = function(tab) {
  ["agents","deploy","ops","ci","log"].forEach(t => {
    const c = document.getElementById("es-content-" + t);
    const b = document.getElementById("es-tab-" + t);
    if (c) c.style.display = (t === tab) ? "" : "none";
    if (b) {
      b.style.background   = (t === tab) ? "#2d1a4a" : "#1a2535";
      b.style.color        = (t === tab) ? "#c084fc" : "#94a3b8";
      b.style.borderColor  = (t === tab) ? "#8b5cf6" : "#2d3748";
    }
  });
};

window.esUpdateOps = function() {
  const sel   = document.getElementById("es-deploy-spy");
  const grid  = document.getElementById("es-ops-grid");
  if (!sel || !grid) return;
  const spy = state.spies.find(s => s.id === sel.value);
  if (spy) grid.innerHTML = _renderOpsGrid(spy);
};

window.esActionRecruit = function() {
  const owner = document.getElementById("es-recruit-owner")?.value;
  const skill = parseInt(document.getElementById("es-recruit-skill")?.value || "1");
  const msg   = document.getElementById("es-recruit-msg");
  if (!owner) { if(msg) msg.textContent = "⚠️ Chọn thế lực"; return; }
  const result = esRecruitSpy(owner, skill);
  if(msg) { msg.style.color = "#4ade80"; msg.textContent = `✅ Đã tuyển ${result.spy.name} [${result.spy.skillLabel}]`; }
  setTimeout(esRenderPanel, 300);
};

window.esActionDeploy = function() {
  const spyId  = document.getElementById("es-deploy-spy")?.value;
  const target = document.getElementById("es-deploy-target")?.value;
  const opSel  = document.querySelector('input[name="es-op-select"]:checked');
  const msg    = document.getElementById("es-deploy-msg");
  if (!spyId || !target || !opSel) { if(msg) msg.textContent = "⚠️ Chọn đầy đủ điệp viên, mục tiêu và nhiệm vụ"; return; }
  const spy = state.spies.find(s => s.id === spyId);
  if (spy && spy.owner === target) { if(msg) { msg.style.color="#f87171"; msg.textContent = "⚠️ Không thể gián điệp chính mình"; } return; }
  const result = esDeployMission(spyId, target, opSel.value);
  if(msg) {
    msg.style.color = result.ok ? "#c084fc" : "#f87171";
    msg.textContent = result.ok
      ? `🎯 ${result.spy.name} đã lên đường → ${target} (xong năm ${result.completesYear})`
      : "⚠️ " + result.msg;
  }
  if (result.ok) setTimeout(esRenderPanel, 300);
};

window.esBoostCI = function() {
  const powerName = document.getElementById("es-ci-power")?.value;
  const msg = document.getElementById("es-ci-msg");
  if (!powerName) return;
  const ci = _getCounterIntel(powerName);
  if (ci.level >= 5) { if(msg) { msg.style.color="#f87171"; msg.textContent = "⚠️ Đã đạt cấp tối đa (5)"; } return; }
  ci.level++;
  _log(`🛡️ ${powerName} nâng cấp phản gián lên Cấp ${ci.level}`, "important");
  esSave();
  if(msg) { msg.style.color="#60a5fa"; msg.textContent = `✅ ${powerName} — Phản gián Cấp ${ci.level}`; }
  setTimeout(esRenderPanel, 200);
};

// ─── PUBLIC API ───────────────────────────────────────────────────
window.esRecruitSpy    = esRecruitSpy;
window.esDeployMission = esDeployMission;
window.esRenderPanel   = esRenderPanel;
window.esTick          = esTick;
window.espionageState  = state;

// ─── INIT ─────────────────────────────────────────────────────────
function esInit() {
  if (state.initialized) return;
  esLoad();
  state.initialized = true;

  setInterval(function() {
    if (typeof window.year !== "undefined") esTick();
  }, 9000);

  console.log("[EspionageEngine V1] 🕵️ Hệ thống Gián Điệp khởi động — Tuyển Mộ · Nhiệm Vụ · Phản Gián sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(esInit, 1800); });
} else {
  setTimeout(esInit, 1800);
}

})();
