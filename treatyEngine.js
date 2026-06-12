// ═══════════════════════════════════════════════════════════════
// TREATY ENGINE V24 — Creator God World Simulator
// Hệ thống Hiệp Ước: Hòa Bình · Thương Mại · Quân Sự · Không Xâm Lược
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const TE_KEY = "cgv6_treaty_v24";
const TE_VERSION = 24;

// ─── LOẠI HIỆP ƯỚC ───────────────────────────────────────────
const TREATY_DEFS = {
  PEACE:        { label: "Hòa Bình",              icon: "🕊️",  color: "#4ade80", duration: 30,  cost: 0,    effects: { relation: 40, war: false } },
  TRADE:        { label: "Thương Mại",            icon: "💰",  color: "#facc15", duration: 40,  cost: 500,  effects: { relation: 20, trade: 35 } },
  MILITARY:     { label: "Tương Trợ Quân Sự",    icon: "⚔️",  color: "#f87171", duration: 50,  cost: 1000, effects: { relation: 30, defense: 25 } },
  NON_AGGR:     { label: "Không Xâm Lược",       icon: "🛡️",  color: "#60a5fa", duration: 25,  cost: 200,  effects: { relation: 25, noAttack: true } },
  OPEN_BORDERS: { label: "Mở Biên Giới",         icon: "🚪",  color: "#a78bfa", duration: 35,  cost: 300,  effects: { relation: 15, migration: true } },
  MARRIAGE:     { label: "Hôn Ước Chính Trị",    icon: "💍",  color: "#f472b6", duration: 60,  cost: 2000, effects: { relation: 50, dynasty: true } },
  SUZERAINTY:   { label: "Bảo Hộ Quốc",          icon: "🏯",  color: "#fb923c", duration: 999, cost: 0,    effects: { relation: 10, suzerain: true } },
  VASSAL:       { label: "Chư Hầu",              icon: "💎",  color: "#c084fc", duration: 999, cost: 0,    effects: { relation: 5,  vassal: true } },
};

// ─── STATE ───────────────────────────────────────────────────
window.treatyData = window.treatyData || {
  treaties: [],    // { id, type, partyA, partyB, signedYear, expiresYear, active, breakPenalty, log[] }
  idCounter: 0,
  pending: [],     // { id, type, from, to, year, status:"pending"|"accepted"|"rejected" }
  version: TE_VERSION,
  stats: { signed: 0, expired: 0, broken: 0 }
};

function teSave() {
  try { localStorage.setItem(TE_KEY, JSON.stringify(window.treatyData)); } catch(e) {}
}

function teLoad() {
  try {
    const raw = localStorage.getItem(TE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      window.treatyData = Object.assign(window.treatyData, d);
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

function _pairKey(a, b) { return [a,b].sort().join("|"); }

function _getActiveTreaties(a, b) {
  return window.treatyData.treaties.filter(t =>
    t.active &&
    ((t.partyA===a&&t.partyB===b)||(t.partyA===b&&t.partyB===a))
  );
}

function _hasTreaty(a, b, type) {
  return _getActiveTreaties(a, b).some(t => t.type === type);
}

// ─── CORE ────────────────────────────────────────────────────
function teSignTreaty(typeKey, partyA, partyB, options) {
  const def = TREATY_DEFS[typeKey];
  if (!def) return { ok: false, msg: "Loại hiệp ước không tồn tại" };
  if (!partyA || !partyB || partyA === partyB) return { ok: false, msg: "Hai bên phải khác nhau" };
  if (_hasTreaty(partyA, partyB, typeKey) && typeKey !== "TRADE") {
    return { ok: false, msg: `Đã có hiệp ước ${def.label} giữa hai bên` };
  }

  const id = "te_" + (++window.treatyData.idCounter);
  const yr = _year();
  const expires = def.duration >= 999 ? null : yr + def.duration;

  const treaty = {
    id, type: typeKey, partyA, partyB,
    signedYear: yr,
    expiresYear: expires,
    active: true,
    breakPenalty: options?.breakPenalty ?? -30,
    log: [{ year: yr, event: `Ký kết bởi ${partyA} và ${partyB}` }]
  };

  window.treatyData.treaties.push(treaty);
  window.treatyData.stats.signed++;

  // Cập nhật quan hệ diplomaticEngine
  if (typeof window.drGetRelation === "function") {
    try {
      const rel = window.drGetRelation(partyA, partyB);
      rel.score = Math.min(100, rel.score + (def.effects.relation || 0));
    } catch(e) {}
  }

  // Kết thúc chiến tranh nếu là hiệp ước hòa bình
  if (def.effects.war === false && typeof window.warsActive !== "undefined") {
    window.warsActive.forEach(w => {
      if (w.status !== "active") return;
      if ((w.attacker===partyA&&w.defender===partyB)||(w.attacker===partyB&&w.defender===partyA)) {
        w.status = "peace";
        w.endYear = yr;
      }
    });
  }

  teSave();
  teLog(`${def.icon} ${partyA} & ${partyB} ký kết Hiệp Ước ${def.label}`);
  return { ok: true, treaty };
}

function teBreakTreaty(id, breaker) {
  const t = window.treatyData.treaties.find(x => x.id === id && x.active);
  if (!t) return { ok: false, msg: "Không tìm thấy hiệp ước" };
  const def = TREATY_DEFS[t.type] || {};
  t.active = false;
  t.brokenYear = _year();
  t.brokenBy = breaker;
  t.log.push({ year: _year(), event: `Bị phá vỡ bởi ${breaker || "không rõ"}` });
  window.treatyData.stats.broken++;

  // Phạt quan hệ
  if (typeof window.drGetRelation === "function") {
    try {
      const rel = window.drGetRelation(t.partyA, t.partyB);
      rel.score = Math.max(-100, rel.score + (t.breakPenalty || -30));
    } catch(e) {}
  }

  teSave();
  teLog(`💔 Hiệp Ước ${def.label||t.type} giữa ${t.partyA} & ${t.partyB} bị phá vỡ bởi ${breaker}`);
  return { ok: true };
}

function teExpireTreaties() {
  const yr = _year();
  window.treatyData.treaties.forEach(t => {
    if (!t.active) return;
    if (t.expiresYear !== null && yr >= t.expiresYear) {
      t.active = false;
      t.expiredYear = yr;
      t.log.push({ year: yr, event: "Hết hạn" });
      window.treatyData.stats.expired++;
      const def = TREATY_DEFS[t.type] || {};
      teLog(`⏰ Hiệp Ước ${def.label||t.type} giữa ${t.partyA} & ${t.partyB} đã hết hạn`);
    }
  });
}

function teProposeTreaty(typeKey, from, to) {
  const id = "tprop_" + Date.now();
  const proposal = { id, type: typeKey, from, to, year: _year(), status: "pending" };
  window.treatyData.pending.push(proposal);
  teSave();
  return { ok: true, proposal };
}

function teRespondProposal(id, accept) {
  const p = window.treatyData.pending.find(x => x.id === id);
  if (!p || p.status !== "pending") return { ok: false };
  p.status = accept ? "accepted" : "rejected";
  if (accept) teSignTreaty(p.type, p.from, p.to);
  teSave();
  return { ok: true };
}

// ─── AI TICK ─────────────────────────────────────────────────
function teTick() {
  teExpireTreaties();
  const powers = _allPowers();
  if (powers.length < 2) return;

  // AI tự động đề xuất hiệp ước hòa bình sau chiến tranh dài
  if (typeof window.warsActive !== "undefined") {
    window.warsActive.forEach(w => {
      if (w.status !== "active") return;
      const yr = _year();
      if (yr - w.startYear > 15 && Math.random() < 0.15) {
        if (!_hasTreaty(w.attacker, w.defender, "PEACE")) {
          teSignTreaty("PEACE", w.attacker, w.defender);
        }
      }
    });
  }

  // Ngẫu nhiên tạo hiệp ước thương mại
  if (Math.random() < 0.05 && powers.length >= 2) {
    const a = powers[Math.floor(Math.random() * powers.length)];
    const b = powers[Math.floor(Math.random() * powers.length)];
    if (a !== b && !_hasTreaty(a, b, "TRADE")) {
      if (typeof window.drGetRelation === "function") {
        try {
          const rel = window.drGetRelation(a, b);
          if (rel.score >= 20) teSignTreaty("TRADE", a, b);
        } catch(e) {}
      }
    }
  }
}

// ─── LOG ─────────────────────────────────────────────────────
const _teLog = [];
function teLog(msg) {
  _teLog.unshift({ year: _year(), msg });
  if (_teLog.length > 100) _teLog.pop();
  if (typeof window.addWorldHistory === "function") window.addWorldHistory(msg, "treaty");
}

// ─── RENDER PANEL ────────────────────────────────────────────
window.teRenderPanel = function() {
  const el = document.getElementById("panel-treaties-v24");
  if (!el) return;
  const active = window.treatyData.treaties.filter(t => t.active);
  const inactive = window.treatyData.treaties.filter(t => !t.active);

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px">📜</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.4em;color:var(--gold);">Hệ Thống Hiệp Ước V24</div>
        <div style="color:var(--white-dim);font-size:.85em;">Ký kết · Theo dõi · Phá vỡ hiệp ước giữa các thế lực</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <span style="background:rgba(74,222,128,.15);border:1px solid #4ade80;color:#4ade80;padding:4px 12px;border-radius:20px;font-size:.8em;">${active.length} Đang hiệu lực</span>
        <span style="background:rgba(100,116,139,.1);border:1px solid #475569;color:#94a3b8;padding:4px 12px;border-radius:20px;font-size:.8em;">${inactive.length} Đã hết hạn/phá vỡ</span>
      </div>
    </div>

    <!-- KÝ HIỆP ƯỚC MỚI -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;">
      <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:12px;font-size:.95em;">✍️ Ký Kết Hiệp Ước Mới</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Loại hiệp ước</div>
          <select id="te-type-sel" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            ${Object.entries(TREATY_DEFS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label} (${v.duration >= 999 ? "Vĩnh viễn" : v.duration + " năm"})</option>`).join("")}
          </select>
        </div>
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Bên A</div>
          <select id="te-a-sel" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            ${_allPowers().map(p=>`<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
        <div>
          <div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;">Bên B</div>
          <select id="te-b-sel" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            ${_allPowers().map(p=>`<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button onclick="window.teSignFromUI()" style="background:linear-gradient(135deg,#facc15,#c4961e);color:#000;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:700;font-size:.9em;">📜 Ký Kết</button>
        <span id="te-msg" style="font-size:.85em;"></span>
      </div>
    </div>

    <!-- HIỆP ƯỚC THEO LOẠI -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
      ${Object.entries(TREATY_DEFS).map(([k,v]) => {
        const cnt = active.filter(t=>t.type===k).length;
        return `<div style="background:var(--bg-card);border:1px solid ${v.color}33;border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:20px;">${v.icon}</div>
          <div style="font-size:.78em;color:${v.color};margin-top:4px;">${v.label}</div>
          <div style="font-size:1.2em;font-weight:700;color:${v.color};margin-top:2px;">${cnt}</div>
        </div>`;
      }).join("")}
    </div>

    <!-- DANH SÁCH HIỆP ƯỚC HIỆN TẠI -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.95em;">📋 Hiệp Ước Đang Hiệu Lực (${active.length})</div>
    ${active.length === 0 ? `<div style="color:var(--white-dim);text-align:center;padding:30px;">Chưa có hiệp ước nào.</div>` :
      `<div style="max-height:350px;overflow-y:auto;">
      ${active.map(t => {
        const def = TREATY_DEFS[t.type] || { icon:"📄", label:t.type, color:"#94a3b8" };
        const remaining = t.expiresYear ? (t.expiresYear - _year()) : null;
        return `<div style="background:var(--bg-card);border:1px solid ${def.color}44;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:20px;">${def.icon}</span>
          <div style="flex:1;">
            <div style="font-weight:700;color:${def.color};">${def.label}</div>
            <div style="font-size:.82em;color:var(--white-dim);">${t.partyA} ↔ ${t.partyB}</div>
            <div style="font-size:.75em;color:var(--white-dim);">Ký năm ${t.signedYear} ${remaining !== null ? `· Còn ${remaining} năm` : "· Vĩnh viễn"}</div>
          </div>
          <button onclick="window.teBreakFromUI('${t.id}')" style="background:rgba(248,113,113,.1);border:1px solid #f87171;color:#f87171;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.75em;">Phá Vỡ</button>
        </div>`;
      }).join("")}
      </div>`
    }

    <!-- LOG -->
    <div style="margin-top:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;max-height:160px;overflow-y:auto;">
      <div style="font-size:.78em;color:var(--gold-dim);margin-bottom:6px;">📋 Nhật Ký Hiệp Ước</div>
      ${_teLog.slice(0,20).map(l=>`<div style="font-size:.8em;color:var(--white-dim);margin-bottom:3px;">⏺ Năm ${l.year}: ${l.msg}</div>`).join("") || `<div style="color:var(--white-dim);font-size:.82em;">Chưa có hoạt động.</div>`}
    </div>
  </div>`;
};

window.teSignFromUI = function() {
  const type = document.getElementById("te-type-sel")?.value;
  const a    = document.getElementById("te-a-sel")?.value;
  const b    = document.getElementById("te-b-sel")?.value;
  const msg  = document.getElementById("te-msg");
  const result = teSignTreaty(type, a, b);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? "✅ Hiệp ước đã ký kết!" : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.teRenderPanel, 300);
};

window.teBreakFromUI = function(id) {
  if (!confirm("Phá vỡ hiệp ước này sẽ bị phạt quan hệ -30. Xác nhận?")) return;
  teBreakTreaty(id, "Thiên Chúa Can Thiệp");
  setTimeout(window.teRenderPanel, 300);
};

// ─── PUBLIC API ──────────────────────────────────────────────
window.teSignTreaty     = teSignTreaty;
window.teBreakTreaty    = teBreakTreaty;
window.teHasTreaty      = _hasTreaty;
window.teGetTreaties    = _getActiveTreaties;
window.teTick           = teTick;
window.TREATY_DEFS      = TREATY_DEFS;

// ─── INIT ────────────────────────────────────────────────────
function teInit() {
  teLoad();
  setInterval(function() {
    if (typeof window.year !== "undefined" && window.year > 0) teTick();
  }, 10000);
  console.log("[TreatyEngine V24] 📜 Hệ thống Hiệp Ước khởi động — Hòa Bình · Thương Mại · Quân Sự · Chư Hầu sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(teInit, 2000); });
} else {
  setTimeout(teInit, 2000);
}

})();
