// ═══════════════════════════════════════════════════════════════
// ALLIANCE ENGINE V24 — Creator God World Simulator
// Hệ thống Liên Minh: Khối Liên Minh · Điều Kiện · Tan Vỡ · Lịch Sử
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const AE_KEY = "cgv6_alliance_v24";
const AE_VERSION = 24;

// ─── LOẠI LIÊN MINH ──────────────────────────────────────────
const ALLIANCE_TYPES = {
  MUTUAL_DEFENSE: { label: "Phòng Thủ Chung",       icon: "🛡️", color: "#60a5fa", bonus: { defense: 30, relation: 20 } },
  MILITARY:       { label: "Liên Minh Quân Sự",     icon: "⚔️", color: "#f87171", bonus: { attack: 25, defense: 20, relation: 30 } },
  ECONOMIC:       { label: "Liên Minh Kinh Tế",     icon: "💰", color: "#4ade80", bonus: { trade: 40, relation: 25 } },
  CULTURAL:       { label: "Liên Minh Văn Hóa",     icon: "🎨", color: "#c084fc", bonus: { culture: 35, relation: 15 } },
  GRAND:          { label: "Đại Liên Minh",          icon: "🌟", color: "#facc15", bonus: { defense: 40, attack: 30, trade: 30, relation: 50 } },
  HEGEMONY:       { label: "Liên Minh Bá Chủ",      icon: "👑", color: "#fb923c", bonus: { attack: 50, prestige: 60, relation: 40 } },
};

// ─── STATE ───────────────────────────────────────────────────
window.allianceData = window.allianceData || {
  alliances: [],       // { id, name, type, leader, members[], formedYear, dissolved, dissolvYear, log[] }
  idCounter: 0,
  version: AE_VERSION,
  stats: { total: 0, dissolved: 0, wars: 0 }
};

function aeSave() {
  try { localStorage.setItem(AE_KEY, JSON.stringify(window.allianceData)); } catch(e) {}
}

function aeLoad() {
  try {
    const raw = localStorage.getItem(AE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      window.allianceData = Object.assign(window.allianceData, d);
    }
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────
function _year() { return (typeof window.year !== "undefined") ? window.year : 0; }

function _allPowers() {
  const list = [];
  (window.countries || []).forEach(c => { if (!c.collapsed && c.name) list.push(c.name); });
  try {
    Object.values((window.kingdomData || {}).kingdoms || {}).forEach(k => {
      if (k && k.name && !list.includes(k.name)) list.push(k.name);
    });
    Object.values((window.empireData || {}).empires || {}).forEach(e => {
      if (e && e.name && !list.includes(e.name)) list.push(e.name);
    });
  } catch(e) {}
  return list;
}

function _getMemberStrength(name) {
  let power = 100;
  try {
    const c = (window.countries || []).find(x => x.name === name);
    if (c) power = (c.militaryPower || 100) + (c.population || 0) / 1000;
  } catch(e) {}
  return power;
}

// ─── CORE FUNCTIONS ──────────────────────────────────────────
function aeCreateAlliance(type, leader, members, name) {
  if (!ALLIANCE_TYPES[type]) return { ok: false, msg: "Loại liên minh không hợp lệ" };
  if (!leader || !members || members.length < 1) return { ok: false, msg: "Cần ít nhất 2 thành viên" };

  const allMembers = [leader, ...members.filter(m => m !== leader)];
  const allDef = ALLIANCE_TYPES[type];
  const id = "ae_" + (++window.allianceData.idCounter);
  const allianceName = name || (allDef.icon + " " + allDef.label + " " + (allMembers[0] || ""));

  const alliance = {
    id, name: allianceName, type, leader,
    members: allMembers,
    formedYear: _year(),
    dissolved: false,
    dissolvYear: null,
    log: [{ year: _year(), event: `Thành lập bởi ${leader}` }]
  };

  window.allianceData.alliances.push(alliance);
  window.allianceData.stats.total++;

  // Boost relations giữa thành viên qua diplomaticEngine
  if (typeof window.drGetRelation === "function") {
    for (let i = 0; i < allMembers.length; i++) {
      for (let j = i + 1; j < allMembers.length; j++) {
        try {
          const rel = window.drGetRelation(allMembers[i], allMembers[j]);
          rel.score = Math.min(100, rel.score + (allDef.bonus.relation || 20));
        } catch(e) {}
      }
    }
  }

  aeSave();
  aeLog(`${allDef.icon} ${allianceName} được thành lập — ${allMembers.length} thành viên`);
  return { ok: true, alliance };
}

function aeDissolveAlliance(id, reason) {
  const a = window.allianceData.alliances.find(x => x.id === id && !x.dissolved);
  if (!a) return { ok: false, msg: "Không tìm thấy liên minh" };
  a.dissolved = true;
  a.dissolvYear = _year();
  a.log.push({ year: _year(), event: reason || "Tan vỡ" });
  window.allianceData.stats.dissolved++;
  aeSave();
  aeLog(`💔 ${a.name} tan vỡ — ${reason || "Không rõ lý do"}`);
  return { ok: true };
}

function aeAddMember(id, member) {
  const a = window.allianceData.alliances.find(x => x.id === id && !x.dissolved);
  if (!a) return { ok: false, msg: "Không tìm thấy liên minh" };
  if (a.members.includes(member)) return { ok: false, msg: "Đã là thành viên" };
  a.members.push(member);
  a.log.push({ year: _year(), event: `${member} gia nhập` });
  aeSave();
  return { ok: true };
}

function aeRemoveMember(id, member) {
  const a = window.allianceData.alliances.find(x => x.id === id && !x.dissolved);
  if (!a) return { ok: false, msg: "Không tìm thấy liên minh" };
  if (a.leader === member) return aeDissolveAlliance(id, `Lãnh đạo ${member} rút lui`);
  a.members = a.members.filter(m => m !== member);
  a.log.push({ year: _year(), event: `${member} rút khỏi liên minh` });
  if (a.members.length < 2) aeDissolveAlliance(id, "Quá ít thành viên");
  aeSave();
  return { ok: true };
}

function aeGetActiveAlliances() {
  return window.allianceData.alliances.filter(a => !a.dissolved);
}

function aeGetAllianceOf(power) {
  return window.allianceData.alliances.filter(a => !a.dissolved && a.members.includes(power));
}

function aeAreAllied(a, b) {
  return window.allianceData.alliances.some(al =>
    !al.dissolved && al.members.includes(a) && al.members.includes(b)
  );
}

// ─── AI TICK ─────────────────────────────────────────────────
function aeTick() {
  const powers = _allPowers();
  if (powers.length < 2) return;
  const yr = _year();

  // Tự động hình thành liên minh phòng thủ khi có chiến tranh
  if (typeof window.warsActive !== "undefined") {
    window.warsActive.forEach(w => {
      if (w.status !== "active") return;
      const defenders = [w.defender];
      // Các nước thân thiện với kẻ phòng thủ có thể gia nhập
      powers.forEach(p => {
        if (p === w.attacker || p === w.defender) return;
        if (!aeAreAllied(p, w.defender)) return;
        if (!defenders.includes(p)) defenders.push(p);
      });
      if (defenders.length > 1 && Math.random() < 0.3) {
        const existing = aeGetAllianceOf(w.defender).find(a => a.type === "MUTUAL_DEFENSE");
        if (!existing) {
          aeCreateAlliance("MUTUAL_DEFENSE", w.defender, defenders.slice(1),
            `🛡️ Liên Minh Phòng Thủ chống ${w.attacker}`);
        }
      }
    });
  }

  // Ngẫu nhiên hình thành liên minh kinh tế giữa các nước giàu
  if (Math.random() < 0.04 && powers.length >= 3) {
    const shuffled = [...powers].sort(() => Math.random() - 0.5).slice(0, 3);
    const alreadyAllied = shuffled.some((p, i) => shuffled.slice(i+1).some(q => aeAreAllied(p, q)));
    if (!alreadyAllied) {
      aeCreateAlliance("ECONOMIC", shuffled[0], shuffled.slice(1));
    }
  }

  // Tan vỡ liên minh khi thành viên khai chiến nhau
  aeGetActiveAlliances().forEach(a => {
    if (typeof window.warsActive === "undefined") return;
    const atWar = window.warsActive.some(w =>
      w.status === "active" &&
      a.members.includes(w.attacker) &&
      a.members.includes(w.defender)
    );
    if (atWar) {
      aeDissolveAlliance(a.id, "Thành viên khai chiến lẫn nhau");
    }
  });
}

// ─── LOG ─────────────────────────────────────────────────────
const _aeLog = [];
function aeLog(msg) {
  _aeLog.unshift({ year: _year(), msg });
  if (_aeLog.length > 100) _aeLog.pop();
  if (typeof window.addWorldHistory === "function") window.addWorldHistory(msg, "diplomacy");
}

// ─── RENDER PANEL ────────────────────────────────────────────
window.aeRenderPanel = function() {
  const el = document.getElementById("panel-alliance-v24");
  if (!el) return;
  const active = aeGetActiveAlliances();
  const dissolved = window.allianceData.alliances.filter(a => a.dissolved);

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px">🤝</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.4em;color:var(--gold);">Hệ Thống Liên Minh V24</div>
        <div style="color:var(--white-dim);font-size:.85em;">Quản lý các khối liên minh thế giới</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <span style="background:rgba(74,222,128,.15);border:1px solid #4ade80;color:#4ade80;padding:4px 12px;border-radius:20px;font-size:.8em;">${active.length} Đang hoạt động</span>
        <span style="background:rgba(248,113,113,.1);border:1px solid #f87171;color:#f87171;padding:4px 12px;border-radius:20px;font-size:.8em;">${dissolved.length} Tan vỡ</span>
      </div>
    </div>

    <!-- TẠO LIÊN MINH MỚI -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;">
      <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:12px;font-size:.95em;">✨ Thành Lập Liên Minh Mới</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Loại liên minh</div>
          <select id="ae-type-sel" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            ${Object.entries(ALLIANCE_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join("")}
          </select>
        </div>
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Lãnh đạo</div>
          <select id="ae-leader-sel" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            ${_allPowers().map(p=>`<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Tên liên minh (tùy chọn)</div>
          <input id="ae-name-inp" placeholder="Tự động nếu để trống" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Thành viên (Ctrl+Click để chọn nhiều)</div>
        <select id="ae-members-sel" multiple style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;height:80px;">
          ${_allPowers().map(p=>`<option value="${p}">${p}</option>`).join("")}
        </select>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button onclick="window.aeCreateFromUI()" style="background:linear-gradient(135deg,#facc15,#c4961e);color:#000;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:700;font-size:.9em;">⚔️ Thành Lập</button>
        <span id="ae-msg" style="font-size:.85em;"></span>
      </div>
    </div>

    <!-- DANH SÁCH LIÊN MINH HIỆN TẠI -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.95em;">🌟 Liên Minh Đang Hoạt Động (${active.length})</div>
    ${active.length === 0 ? `<div style="color:var(--white-dim);text-align:center;padding:30px;">Chưa có liên minh nào. Thế giới đang trong trạng thái biệt lập.</div>` :
      active.map(a => {
        const def = ALLIANCE_TYPES[a.type] || { icon:"🤝", label:a.type, color:"#94a3b8" };
        return `<div style="background:var(--bg-card);border:1px solid ${def.color}33;border-left:3px solid ${def.color};border-radius:10px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:22px">${def.icon}</span>
            <div>
              <div style="font-weight:700;color:${def.color};">${a.name}</div>
              <div style="font-size:.78em;color:var(--white-dim);">${def.label} · Năm ${a.formedYear} · Lãnh đạo: ${a.leader}</div>
            </div>
            <div style="margin-left:auto;display:flex;gap:6px;">
              <button onclick="window.aeDissolveFromUI('${a.id}')" style="background:rgba(248,113,113,.15);border:1px solid #f87171;color:#f87171;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.78em;">💔 Giải Tán</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
            ${a.members.map(m=>`<span style="background:${def.color}22;border:1px solid ${def.color}55;color:${def.color};padding:2px 10px;border-radius:12px;font-size:.8em;">${m}</span>`).join("")}
          </div>
          <div style="font-size:.75em;color:var(--white-dim);">
            ${a.log.slice(-2).map(l=>`📌 Năm ${l.year}: ${l.event}`).join(" &nbsp;|&nbsp; ")}
          </div>
        </div>`;
      }).join("")
    }

    <!-- LỊCH SỬ LIÊN MINH -->
    ${dissolved.length > 0 ? `
    <div style="font-family:var(--font-title);color:var(--gold-dim);margin:16px 0 10px;font-size:.9em;">📚 Lịch Sử Liên Minh Đã Tan Vỡ (${dissolved.length})</div>
    <div style="max-height:200px;overflow-y:auto;">
    ${dissolved.slice(-10).reverse().map(a => {
      const def = ALLIANCE_TYPES[a.type] || { icon:"🤝", color:"#475569" };
      return `<div style="background:rgba(71,85,105,.1);border:1px solid rgba(71,85,105,.3);border-radius:8px;padding:10px;margin-bottom:6px;opacity:.7;">
        <span style="color:${def.color}">${def.icon} ${a.name}</span>
        <span style="color:var(--white-dim);font-size:.8em;margin-left:8px;">Năm ${a.formedYear}–${a.dissolvYear} · ${a.members.join(", ")}</span>
      </div>`;
    }).join("")}
    </div>` : ""}

    <!-- LOG -->
    <div style="margin-top:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;max-height:180px;overflow-y:auto;">
      <div style="font-size:.78em;color:var(--gold-dim);margin-bottom:8px;">📋 Nhật Ký</div>
      ${_aeLog.slice(0,20).map(l=>`<div style="font-size:.8em;color:var(--white-dim);margin-bottom:3px;">⏺ Năm ${l.year}: ${l.msg}</div>`).join("") || `<div style="color:var(--white-dim);font-size:.82em;">Chưa có hoạt động nào.</div>`}
    </div>
  </div>`;
};

window.aeCreateFromUI = function() {
  const type   = document.getElementById("ae-type-sel")?.value;
  const leader = document.getElementById("ae-leader-sel")?.value;
  const name   = document.getElementById("ae-name-inp")?.value;
  const mSel   = document.getElementById("ae-members-sel");
  const members = mSel ? Array.from(mSel.selectedOptions).map(o => o.value).filter(m => m !== leader) : [];
  const msg = document.getElementById("ae-msg");
  const result = aeCreateAlliance(type, leader, members, name || null);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? `✅ ${result.alliance.name} đã được thành lập!` : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.aeRenderPanel, 300);
};

window.aeDissolveFromUI = function(id) {
  if (!confirm("Giải tán liên minh này?")) return;
  aeDissolveAlliance(id, "Giải tán theo lệnh Thiên Chúa");
  setTimeout(window.aeRenderPanel, 300);
};

// ─── PUBLIC API ──────────────────────────────────────────────
window.aeCreateAlliance   = aeCreateAlliance;
window.aeDissolveAlliance = aeDissolveAlliance;
window.aeAddMember        = aeAddMember;
window.aeRemoveMember     = aeRemoveMember;
window.aeGetActiveAlliances = aeGetActiveAlliances;
window.aeGetAllianceOf    = aeGetAllianceOf;
window.aeAreAllied        = aeAreAllied;
window.aeTick             = aeTick;
window.ALLIANCE_TYPES     = ALLIANCE_TYPES;

// ─── INIT ────────────────────────────────────────────────────
function aeInit() {
  aeLoad();
  setInterval(function() {
    if (typeof window.year !== "undefined" && window.year > 0) aeTick();
  }, 12000);
  console.log("[AllianceEngine V24] 🤝 Hệ thống Liên Minh khởi động — Khối Liên Minh · Tan Vỡ · AI Tự Động sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(aeInit, 1800); });
} else {
  setTimeout(aeInit, 1800);
}

})();
