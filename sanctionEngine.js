// ═══════════════════════════════════════════════════════════════
// SANCTION ENGINE V24 — Creator God World Simulator
// Trừng Phạt Kinh Tế · Quốc Gia Chư Hầu · Quốc Gia Bảo Hộ
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const SE_KEY = "cgv6_sanction_v24";

// ─── LOẠI TRỪNG PHẠT ─────────────────────────────────────────
const SANCTION_TYPES = {
  TRADE_BAN:    { label: "Cấm Vận Thương Mại",    icon: "🚫", color: "#f87171", effect: { trade: -50, relation: -20 } },
  EMBARGO:      { label: "Phong Tỏa Kinh Tế",     icon: "⛔", color: "#ef4444", effect: { trade: -80, resource: -30, relation: -35 } },
  ASSET_FREEZE: { label: "Đóng Băng Tài Sản",     icon: "🧊", color: "#60a5fa", effect: { gold: -40, relation: -25 } },
  TRAVEL_BAN:   { label: "Cấm Đi Lại",            icon: "✈️", color: "#fbbf24", effect: { migration: -100, relation: -15 } },
  ARMS_EMBARGO: { label: "Cấm Vũ Khí",            icon: "🔫", color: "#fb923c", effect: { military: -30, relation: -20 } },
};

// ─── TRẠNG THÁI PHỤ THUỘC ────────────────────────────────────
const DEPENDENCY_TYPES = {
  VASSAL:     { label: "Chư Hầu",     icon: "💎", color: "#c084fc", tribute: 0.15 },  // đóng 15% tài nguyên
  PROTECTORATE: { label: "Bảo Hộ",   icon: "🏯", color: "#fb923c", tribute: 0.05 },  // đóng 5%, được bảo vệ
  TRIBUTARY:  { label: "Triều Cống", icon: "🎁",  color: "#facc15", tribute: 0.10 },
};

// ─── STATE ───────────────────────────────────────────────────
window.sanctionData = window.sanctionData || {
  sanctions: [],     // { id, type, imposer, target, year, duration, active, reason }
  dependencies: [],  // { id, depType, suzerain, subject, year, tribute, active }
  idCounter: 0,
  log: [],
  stats: { sanctionsTotal: 0, vassals: 0, protectorates: 0 }
};

function seSave() {
  try { localStorage.setItem(SE_KEY, JSON.stringify(window.sanctionData)); } catch(e) {}
}

function seLoad() {
  try {
    const raw = localStorage.getItem(SE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      window.sanctionData = Object.assign(window.sanctionData, d);
    }
  } catch(e) {}
}

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

// ─── TRỪNG PHẠT ──────────────────────────────────────────────
function seImposeSanction(type, imposer, target, reason, duration) {
  if (!SANCTION_TYPES[type]) return { ok: false, msg: "Loại trừng phạt không hợp lệ" };
  if (!imposer || !target || imposer === target) return { ok: false, msg: "Hai bên phải khác nhau" };

  const already = window.sanctionData.sanctions.find(s =>
    s.active && s.type === type && s.imposer === imposer && s.target === target
  );
  if (already) return { ok: false, msg: "Đã áp đặt biện pháp này rồi" };

  const def = SANCTION_TYPES[type];
  const id = "sanc_" + (++window.sanctionData.idCounter);
  const yr = _year();

  const sanction = {
    id, type, imposer, target,
    year: yr,
    duration: duration || 20,
    expiresYear: yr + (duration || 20),
    active: true,
    reason: reason || "Không tuân thủ yêu cầu quốc tế"
  };

  window.sanctionData.sanctions.push(sanction);
  window.sanctionData.stats.sanctionsTotal++;

  // Phạt quan hệ
  if (typeof window.drGetRelation === "function") {
    try {
      const rel = window.drGetRelation(imposer, target);
      rel.score = Math.max(-100, rel.score + (def.effect.relation || -20));
    } catch(e) {}
  }

  seSave();
  seLog(`${def.icon} ${imposer} áp đặt ${def.label} lên ${target}: ${sanction.reason}`);
  return { ok: true, sanction };
}

function seLiftSanction(id, reason) {
  const s = window.sanctionData.sanctions.find(x => x.id === id && x.active);
  if (!s) return { ok: false, msg: "Không tìm thấy lệnh trừng phạt" };
  s.active = false;
  s.liftedYear = _year();
  s.liftReason = reason || "Dỡ bỏ";

  // Hồi phục một phần quan hệ
  if (typeof window.drGetRelation === "function") {
    try {
      const def = SANCTION_TYPES[s.type] || {};
      const rel = window.drGetRelation(s.imposer, s.target);
      rel.score = Math.min(100, rel.score + Math.abs((def.effect?.relation || -20)) * 0.5);
    } catch(e) {}
  }

  seSave();
  seLog(`✅ Lệnh ${SANCTION_TYPES[s.type]?.label || s.type} lên ${s.target} được dỡ bỏ`);
  return { ok: true };
}

// ─── CHƯ HẦU / BẢO HỘ ───────────────────────────────────────
function seEstablishDependency(depType, suzerain, subject) {
  if (!DEPENDENCY_TYPES[depType]) return { ok: false, msg: "Loại không hợp lệ" };
  if (!suzerain || !subject || suzerain === subject) return { ok: false, msg: "Hai bên phải khác nhau" };

  const already = window.sanctionData.dependencies.find(d =>
    d.active && d.subject === subject
  );
  if (already) return { ok: false, msg: `${subject} đã là ${DEPENDENCY_TYPES[already.depType].label} của ${already.suzerain}` };

  const def = DEPENDENCY_TYPES[depType];
  const id = "dep_" + (++window.sanctionData.idCounter);

  const dep = {
    id, depType, suzerain, subject,
    year: _year(),
    tribute: def.tribute,
    active: true
  };

  window.sanctionData.dependencies.push(dep);
  if (depType === "VASSAL") window.sanctionData.stats.vassals++;
  else if (depType === "PROTECTORATE") window.sanctionData.stats.protectorates++;

  // Cập nhật quan hệ
  if (typeof window.drGetRelation === "function") {
    try {
      const rel = window.drGetRelation(suzerain, subject);
      rel.score = Math.min(100, rel.score + 10);
      rel.status = "TRIBUTARY";
    } catch(e) {}
  }

  seSave();
  seLog(`${def.icon} ${subject} trở thành ${def.label} của ${suzerain}`);
  return { ok: true, dep };
}

function seFreeDependency(id, reason) {
  const d = window.sanctionData.dependencies.find(x => x.id === id && x.active);
  if (!d) return { ok: false, msg: "Không tìm thấy quan hệ phụ thuộc" };
  d.active = false;
  d.freedYear = _year();
  seSave();
  seLog(`🕊️ ${d.subject} được giải phóng khỏi ${DEPENDENCY_TYPES[d.depType]?.label} của ${d.suzerain}`);
  return { ok: true };
}

// ─── AI TICK ─────────────────────────────────────────────────
function seTick() {
  const yr = _year();

  // Hết hạn trừng phạt
  window.sanctionData.sanctions.forEach(s => {
    if (s.active && s.expiresYear && yr >= s.expiresYear) {
      seLiftSanction(s.id, "Hết thời hạn");
    }
  });

  // Chư hầu đóng cống
  window.sanctionData.dependencies.forEach(dep => {
    if (!dep.active) return;
    // Tìm quốc gia subject, giảm tài nguyên và chuyển cho suzerain
    try {
      const subj = (window.countries || []).find(c => c.name === dep.subject);
      const suz  = (window.countries || []).find(c => c.name === dep.suzerain);
      if (subj && suz && subj.gold > 0) {
        const tribute = Math.floor((subj.gold || 0) * dep.tribute * 0.01);
        if (tribute > 0) {
          subj.gold = (subj.gold || 0) - tribute;
          suz.gold  = (suz.gold  || 0) + tribute;
        }
      }
    } catch(e) {}
  });

  // AI: Các nước thua chiến tranh có thể bị ép làm chư hầu
  if (typeof window.warsHistory !== "undefined" && Math.random() < 0.05) {
    const endedWars = window.warsHistory.filter(w =>
      w.status === "collapsed" && !window.sanctionData.dependencies.some(d => d.subject === w.defender && d.active)
    );
    if (endedWars.length > 0) {
      const w = endedWars[Math.floor(Math.random() * endedWars.length)];
      seEstablishDependency("VASSAL", w.attacker, w.defender);
    }
  }
}

// ─── LOG ─────────────────────────────────────────────────────
function seLog(msg) {
  window.sanctionData.log.unshift({ year: _year(), msg });
  if (window.sanctionData.log.length > 100) window.sanctionData.log.pop();
  if (typeof window.addWorldHistory === "function") window.addWorldHistory(msg, "sanction");
}

// ─── RENDER PANEL ────────────────────────────────────────────
window.seRenderPanel = function() {
  const el = document.getElementById("panel-sanctions-v24");
  if (!el) return;
  const activeSanc = window.sanctionData.sanctions.filter(s => s.active);
  const activeDeps = window.sanctionData.dependencies.filter(d => d.active);
  const powers = _allPowers();

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px">⚡</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.4em;color:var(--gold);">Trừng Phạt & Phụ Thuộc V24</div>
        <div style="color:var(--white-dim);font-size:.85em;">Trừng phạt kinh tế · Chư hầu · Bảo hộ · Triều cống</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <span style="background:rgba(248,113,113,.15);border:1px solid #f87171;color:#f87171;padding:4px 12px;border-radius:20px;font-size:.8em;">${activeSanc.length} Trừng Phạt</span>
        <span style="background:rgba(192,132,252,.15);border:1px solid #c084fc;color:#c084fc;padding:4px 12px;border-radius:20px;font-size:.8em;">${activeDeps.length} Phụ Thuộc</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- TRỪNG PHẠT KINH TẾ -->
      <div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
          <div style="font-family:var(--font-title);color:#f87171;margin-bottom:12px;font-size:.9em;">🚫 Áp Đặt Trừng Phạt</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <select id="se-sanc-type" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${Object.entries(SANCTION_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join("")}
            </select>
            <select id="se-sanc-imposer" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${powers.map(p=>`<option value="${p}">${p} (Người áp đặt)</option>`).join("")}
            </select>
            <select id="se-sanc-target" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${powers.map(p=>`<option value="${p}">${p} (Mục tiêu)</option>`).join("")}
            </select>
            <input id="se-sanc-reason" placeholder="Lý do (tùy chọn)" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
            <button onclick="window.seImposeFromUI()" style="background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer;font-weight:700;font-size:.9em;">⚡ Áp Đặt Trừng Phạt</button>
            <span id="se-sanc-msg" style="font-size:.8em;"></span>
          </div>
        </div>

        <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.85em;">🚫 Đang Bị Trừng Phạt (${activeSanc.length})</div>
        <div style="max-height:250px;overflow-y:auto;">
          ${activeSanc.length === 0 ? `<div style="color:var(--white-dim);font-size:.82em;text-align:center;padding:20px;">Không có trừng phạt nào.</div>` :
            activeSanc.map(s => {
              const def = SANCTION_TYPES[s.type] || { icon:"🚫", label:s.type, color:"#f87171" };
              return `<div style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div>
                    <span style="color:${def.color}">${def.icon} ${def.label}</span>
                    <div style="font-size:.78em;color:var(--white-dim);">${s.imposer} → ${s.target}</div>
                    <div style="font-size:.72em;color:#64748b;">${s.reason} · Còn ${(s.expiresYear||0) - _year()} năm</div>
                  </div>
                  <button onclick="window.seLiftFromUI('${s.id}')" style="background:rgba(74,222,128,.1);border:1px solid #4ade80;color:#4ade80;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:.72em;">Dỡ Bỏ</button>
                </div>
              </div>`;
            }).join("")
          }
        </div>
      </div>

      <!-- CHƯ HẦU & BẢO HỘ -->
      <div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
          <div style="font-family:var(--font-title);color:#c084fc;margin-bottom:12px;font-size:.9em;">💎 Thiết Lập Quan Hệ Phụ Thuộc</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <select id="se-dep-type" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${Object.entries(DEPENDENCY_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label} (Cống ${(v.tribute*100).toFixed(0)}%)</option>`).join("")}
            </select>
            <select id="se-dep-suzerain" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${powers.map(p=>`<option value="${p}">${p} (Tông chủ)</option>`).join("")}
            </select>
            <select id="se-dep-subject" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
              ${powers.map(p=>`<option value="${p}">${p} (Phụ thuộc)</option>`).join("")}
            </select>
            <button onclick="window.seEstablishFromUI()" style="background:linear-gradient(135deg,#c084fc,#7c3aed);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer;font-weight:700;font-size:.9em;">💎 Thiết Lập</button>
            <span id="se-dep-msg" style="font-size:.8em;"></span>
          </div>
        </div>

        <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.85em;">💎 Quan Hệ Phụ Thuộc (${activeDeps.length})</div>
        <div style="max-height:250px;overflow-y:auto;">
          ${activeDeps.length === 0 ? `<div style="color:var(--white-dim);font-size:.82em;text-align:center;padding:20px;">Không có quan hệ phụ thuộc.</div>` :
            activeDeps.map(d => {
              const def = DEPENDENCY_TYPES[d.depType] || { icon:"💎", label:d.depType, color:"#c084fc" };
              return `<div style="background:rgba(192,132,252,.07);border:1px solid rgba(192,132,252,.3);border-radius:8px;padding:10px;margin-bottom:6px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div>
                    <span style="color:${def.color}">${def.icon} ${d.subject}</span>
                    <span style="color:var(--white-dim);font-size:.82em;"> là ${def.label} của </span>
                    <span style="color:var(--gold);font-size:.82em;">${d.suzerain}</span>
                    <div style="font-size:.72em;color:#64748b;">Cống ${(d.tribute*100).toFixed(0)}%/năm · Từ năm ${d.year}</div>
                  </div>
                  <button onclick="window.seFreeFromUI('${d.id}')" style="background:rgba(74,222,128,.1);border:1px solid #4ade80;color:#4ade80;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:.72em;">Giải Phóng</button>
                </div>
              </div>`;
            }).join("")
          }
        </div>
      </div>
    </div>

    <!-- LOG -->
    <div style="margin-top:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px;max-height:150px;overflow-y:auto;">
      <div style="font-size:.78em;color:var(--gold-dim);margin-bottom:6px;">📋 Nhật Ký</div>
      ${window.sanctionData.log.slice(0,20).map(l=>`<div style="font-size:.8em;color:var(--white-dim);margin-bottom:3px;">⏺ Năm ${l.year}: ${l.msg}</div>`).join("") || `<div style="color:var(--white-dim);font-size:.82em;">Chưa có hoạt động.</div>`}
    </div>
  </div>`;
};

window.seImposeFromUI = function() {
  const type    = document.getElementById("se-sanc-type")?.value;
  const imposer = document.getElementById("se-sanc-imposer")?.value;
  const target  = document.getElementById("se-sanc-target")?.value;
  const reason  = document.getElementById("se-sanc-reason")?.value;
  const msg     = document.getElementById("se-sanc-msg");
  const result  = seImposeSanction(type, imposer, target, reason, 20);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? "✅ Đã áp đặt!" : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.seRenderPanel, 300);
};

window.seLiftFromUI = function(id) {
  seLiftSanction(id, "Dỡ bỏ theo lệnh Thiên Chúa");
  setTimeout(window.seRenderPanel, 300);
};

window.seEstablishFromUI = function() {
  const depType  = document.getElementById("se-dep-type")?.value;
  const suzerain = document.getElementById("se-dep-suzerain")?.value;
  const subject  = document.getElementById("se-dep-subject")?.value;
  const msg      = document.getElementById("se-dep-msg");
  const result   = seEstablishDependency(depType, suzerain, subject);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? "✅ Đã thiết lập!" : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.seRenderPanel, 300);
};

window.seFreeFromUI = function(id) {
  if (!confirm("Giải phóng quốc gia này?")) return;
  seFreeDependency(id);
  setTimeout(window.seRenderPanel, 300);
};

// ─── PUBLIC API ──────────────────────────────────────────────
window.seImposeSanction      = seImposeSanction;
window.seLiftSanction        = seLiftSanction;
window.seEstablishDependency = seEstablishDependency;
window.seFreeDependency      = seFreeDependency;
window.seTick                = seTick;
window.SANCTION_TYPES        = SANCTION_TYPES;
window.DEPENDENCY_TYPES      = DEPENDENCY_TYPES;

// ─── INIT ────────────────────────────────────────────────────
function seInit() {
  seLoad();
  setInterval(function() {
    if (typeof window.year !== "undefined" && window.year > 0) seTick();
  }, 15000);
  console.log("[SanctionEngine V24] ⚡ Hệ thống Trừng Phạt & Phụ Thuộc khởi động — Cấm Vận · Chư Hầu · Bảo Hộ sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(seInit, 2200); });
} else {
  setTimeout(seInit, 2200);
}

})();
