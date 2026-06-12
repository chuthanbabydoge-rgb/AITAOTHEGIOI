// ═══════════════════════════════════════════════════════════════
// DIPLOMACY ENGINE V24 — Creator God World Simulator
// HUB Ngoại Giao V24: Quan Hệ Quốc Tế · Dashboard · Tích Hợp Toàn Diện
// Tích hợp: AllianceEngine · TreatyEngine · SanctionEngine · WorldCouncilEngine
// KHÔNG xóa, KHÔNG ghi đè diplomaticEngine.js V1
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const DE24_KEY = "cgv6_diplomacy_v24";

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

function _getRelScore(a, b) {
  if (typeof window.drGetRelation === "function") {
    try { return window.drGetRelation(a, b).score; } catch(e) {}
  }
  return 0;
}

function _getRelStatus(score) {
  if (score >= 80) return { label: "Liên Minh",    color: "#4ade80", icon: "🤝" };
  if (score >= 40) return { label: "Thân Thiện",   color: "#86efac", icon: "😊" };
  if (score >= -20) return { label: "Trung Lập",   color: "#94a3b8", icon: "😐" };
  if (score >= -50) return { label: "Căng Thẳng",  color: "#fbbf24", icon: "😤" };
  if (score >= -70) return { label: "Thù Địch",    color: "#f87171", icon: "⚡" };
  return { label: "Chiến Tranh",  color: "#ef4444", icon: "⚔️" };
}

// ─── RENDER: PANEL NGOẠI GIAO V24 (Hub tổng hợp) ─────────────
window.de24RenderPanel = function() {
  const el = document.getElementById("panel-diplomacy-v24");
  if (!el) return;
  const powers = _allPowers();

  // Thống kê nhanh
  const activeAlliances = typeof window.aeGetActiveAlliances === "function" ? window.aeGetActiveAlliances().length : 0;
  const activeTreaties  = (window.treatyData?.treaties || []).filter(t => t.active).length;
  const activeSanctions = (window.sanctionData?.sanctions || []).filter(s => s.active).length;
  const activeDeps      = (window.sanctionData?.dependencies || []).filter(d => d.active).length;
  const councilFounded  = window.worldCouncilData?.founded;
  const activeWars      = (window.warsActive || []).filter(w => w.status === "active").length;

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:32px;">🌐</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.5em;color:var(--gold);">Ngoại Giao V24 — Tổng Quan</div>
        <div style="color:var(--white-dim);font-size:.85em;">Hệ thống ngoại giao toàn diện — Năm ${_year()}</div>
      </div>
    </div>

    <!-- THỐNG KÊ NHANH -->
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:20px;">
      ${[
        { icon:"🌍", label:"Thế Lực",    val: powers.length,      color:"#60a5fa" },
        { icon:"🤝", label:"Liên Minh",  val: activeAlliances,    color:"#4ade80" },
        { icon:"📜", label:"Hiệp Ước",   val: activeTreaties,     color:"#facc15" },
        { icon:"⚡", label:"Trừng Phạt", val: activeSanctions,    color:"#f87171" },
        { icon:"💎", label:"Phụ Thuộc",  val: activeDeps,         color:"#c084fc" },
        { icon:"⚔️", label:"Chiến Tranh",val: activeWars,         color:"#ef4444" },
      ].map(s=>`<div style="background:var(--bg-card);border:1px solid ${s.color}33;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:22px;">${s.icon}</div>
        <div style="font-size:1.4em;font-weight:700;color:${s.color};margin:4px 0;">${s.val}</div>
        <div style="font-size:.75em;color:var(--white-dim);">${s.label}</div>
      </div>`).join("")}
    </div>

    <!-- TRẠNG THÁI HỘI ĐỒNG -->
    <div style="background:var(--bg-card);border:1px solid ${councilFounded ? "rgba(250,204,21,.3)" : "var(--border)"};border-radius:12px;padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:16px;">
      <span style="font-size:28px;">🏛</span>
      <div style="flex:1;">
        <div style="font-family:var(--font-title);color:var(--gold);font-size:.95em;">Hội Đồng Thế Giới</div>
        ${councilFounded
          ? `<div style="color:#4ade80;font-size:.82em;">✅ Đang hoạt động từ năm ${councilFounded} · ${window.worldCouncilData.members.length} thành viên · ${window.worldCouncilData.stats?.sessions || 0} phiên họp</div>`
          : `<div style="color:var(--white-dim);font-size:.82em;">⚠️ Chưa được thành lập. Cần ≥5 thế lực.</div>`
        }
      </div>
      <button onclick="showPanel('world-council');if(typeof window.wcRenderPanel==='function')window.wcRenderPanel();" style="background:rgba(250,204,21,.15);border:1px solid var(--gold);color:var(--gold);padding:7px 16px;border-radius:8px;cursor:pointer;font-size:.85em;">🏛 Vào Hội Đồng</button>
    </div>

    <!-- MA TRẬN QUAN HỆ -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.95em;">🌍 Ma Trận Quan Hệ Quốc Tế</div>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:16px;overflow-x:auto;">
      ${powers.length < 2 ? `<div style="color:var(--white-dim);text-align:center;padding:20px;">Cần ít nhất 2 thế lực để hiển thị ma trận quan hệ.</div>` : (() => {
        const show = powers.slice(0, 8);
        return `<table style="width:100%;border-collapse:collapse;font-size:.75em;">
          <tr>
            <th style="padding:6px;color:var(--gold-dim);">Thế Lực</th>
            ${show.map(p=>`<th style="padding:6px;color:var(--white-dim);text-align:center;max-width:80px;overflow:hidden;text-overflow:ellipsis;" title="${p}">${p.slice(0,8)}</th>`).join("")}
          </tr>
          ${show.map(a => `<tr>
            <td style="padding:6px;color:var(--white-main);font-weight:600;white-space:nowrap;">${a.slice(0,12)}</td>
            ${show.map(b => {
              if (a === b) return `<td style="padding:6px;text-align:center;color:#334155;">—</td>`;
              const score = _getRelScore(a, b);
              const st = _getRelStatus(score);
              return `<td style="padding:4px;text-align:center;" title="${a} ↔ ${b}: ${st.label} (${score > 0 ? '+' : ''}${score})">
                <span style="color:${st.color};font-size:1.1em;">${st.icon}</span>
                <div style="color:${st.color};font-size:.8em;">${score > 0 ? '+' : ''}${score}</div>
              </td>`;
            }).join("")}
          </tr>`).join("")}
        </table>
        ${powers.length > 8 ? `<div style="color:var(--white-dim);font-size:.78em;text-align:center;margin-top:8px;">Hiển thị ${show.length}/${powers.length} thế lực. Vào tab "Quan Hệ Quốc Tế" để xem đầy đủ.</div>` : ""}`;
      })()}
    </div>

    <!-- LIÊN MINH ĐANG HOẠT ĐỘNG -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.95em;">🤝 Liên Minh Đang Hoạt Động</div>
    ${activeAlliances === 0
      ? `<div style="color:var(--white-dim);font-size:.85em;margin-bottom:16px;">Chưa có liên minh nào.</div>`
      : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-bottom:16px;">
          ${(typeof window.aeGetActiveAlliances === "function" ? window.aeGetActiveAlliances() : []).slice(0,6).map(a => {
            const def = (typeof window.ALLIANCE_TYPES !== "undefined" ? window.ALLIANCE_TYPES[a.type] : null) || { icon:"🤝", label:a.type, color:"#94a3b8" };
            return `<div style="background:var(--bg-card);border:1px solid ${def.color}44;border-radius:8px;padding:10px;">
              <div style="color:${def.color};font-weight:700;font-size:.88em;">${def.icon} ${a.name}</div>
              <div style="color:var(--white-dim);font-size:.78em;margin-top:4px;">${a.members.join(" · ")}</div>
            </div>`;
          }).join("")}
        </div>`
    }

    <!-- NHANH CHÓNG: Hành động ngoại giao -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;">
      <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:12px;font-size:.9em;">⚡ Hành Động Nhanh</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        <button onclick="showPanel('alliance-v24');if(typeof window.aeRenderPanel==='function')window.aeRenderPanel();" style="background:rgba(74,222,128,.1);border:1px solid #4ade80;color:#4ade80;padding:10px;border-radius:8px;cursor:pointer;font-size:.82em;text-align:center;">🤝<br>Liên Minh</button>
        <button onclick="showPanel('treaties-v24');if(typeof window.teRenderPanel==='function')window.teRenderPanel();" style="background:rgba(250,204,21,.1);border:1px solid var(--gold);color:var(--gold);padding:10px;border-radius:8px;cursor:pointer;font-size:.82em;text-align:center;">📜<br>Hiệp Ước</button>
        <button onclick="showPanel('sanctions-v24');if(typeof window.seRenderPanel==='function')window.seRenderPanel();" style="background:rgba(248,113,113,.1);border:1px solid #f87171;color:#f87171;padding:10px;border-radius:8px;cursor:pointer;font-size:.82em;text-align:center;">⚡<br>Trừng Phạt</button>
        <button onclick="showPanel('world-council');if(typeof window.wcRenderPanel==='function')window.wcRenderPanel();" style="background:rgba(96,165,250,.1);border:1px solid #60a5fa;color:#60a5fa;padding:10px;border-radius:8px;cursor:pointer;font-size:.82em;text-align:center;">🏛<br>Hội Đồng</button>
      </div>
    </div>
  </div>`;
};

// ─── RENDER: PANEL QUAN HỆ QUỐC TẾ (Ma trận đầy đủ) ─────────
window.irRenderPanel = function() {
  const el = document.getElementById("panel-intl-relations");
  if (!el) return;
  const powers = _allPowers();

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px;">🌍</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.4em;color:var(--gold);">Quan Hệ Quốc Tế V24</div>
        <div style="color:var(--white-dim);font-size:.85em;">Tổng quan quan hệ song phương toàn thế giới — ${powers.length} thế lực</div>
      </div>
    </div>

    <!-- CHỌN THẾ LỰC ĐỂ XEM QUAN HỆ -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <div style="font-size:.85em;color:var(--white-dim);">Xem quan hệ của:</div>
        <select id="ir-focus-sel" onchange="window.irRenderFocus(this.value)" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.85em;">
          <option value="">-- Chọn thế lực --</option>
          ${powers.map(p=>`<option value="${p}">${p}</option>`).join("")}
        </select>
        <div id="ir-focus-result" style="flex:1;"></div>
      </div>
    </div>

    <!-- DANH SÁCH QUAN HỆ TẤT CẢ CẶP ĐÔI -->
    <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">📊 Tất Cả Quan Hệ Song Phương</div>
    <div style="max-height:500px;overflow-y:auto;">
      ${powers.length < 2
        ? `<div style="color:var(--white-dim);text-align:center;padding:30px;">Cần ít nhất 2 thế lực.</div>`
        : powers.flatMap((a, i) => powers.slice(i+1).map(b => {
            const score = _getRelScore(a, b);
            const st = _getRelStatus(score);
            const activeTr = (window.treatyData?.treaties || []).filter(t =>
              t.active && ((t.partyA===a&&t.partyB===b)||(t.partyA===b&&t.partyB===a))
            );
            const allied = typeof window.aeAreAllied === "function" ? window.aeAreAllied(a, b) : false;
            const atWar = (window.warsActive || []).some(w =>
              w.status === "active" && ((w.attacker===a&&w.defender===b)||(w.attacker===b&&w.defender===a))
            );
            return `<div style="background:var(--bg-card);border:1px solid ${st.color}22;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:12px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${st.color};flex-shrink:0;"></div>
              <div style="flex:1;">
                <div style="font-size:.88em;"><span style="color:var(--white-main);">${a}</span> <span style="color:#475569;">↔</span> <span style="color:var(--white-main);">${b}</span></div>
                <div style="font-size:.75em;color:var(--white-dim);margin-top:2px;">
                  ${activeTr.map(t => {
                    const td = (typeof window.TREATY_DEFS !== "undefined" ? window.TREATY_DEFS[t.type] : null) || {};
                    return `<span style="color:#60a5fa;">${td.icon||""} ${td.label||t.type}</span>`;
                  }).join(" · ")}
                  ${allied ? `<span style="color:#4ade80;">🤝 Liên Minh</span>` : ""}
                  ${atWar  ? `<span style="color:#f87171;">⚔️ Chiến Tranh</span>` : ""}
                </div>
              </div>
              <div style="text-align:right;">
                <div style="color:${st.color};font-size:.9em;font-weight:700;">${st.icon} ${st.label}</div>
                <div style="color:${st.color};font-size:.82em;">${score > 0 ? '+' : ''}${score}</div>
              </div>
            </div>`;
          })).join("") || `<div style="color:var(--white-dim);text-align:center;padding:20px;">Không có cặp đôi nào.</div>`
      }
    </div>
  </div>`;
};

window.irRenderFocus = function(power) {
  const el = document.getElementById("ir-focus-result");
  if (!el || !power) return;
  const powers = _allPowers().filter(p => p !== power);
  const sorted = powers.map(p => ({ name: p, score: _getRelScore(power, p) })).sort((a,b)=>b.score-a.score);
  el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;">
    ${sorted.map(p => {
      const st = _getRelStatus(p.score);
      return `<span style="background:${st.color}22;border:1px solid ${st.color}66;color:${st.color};padding:3px 10px;border-radius:12px;font-size:.78em;">${st.icon} ${p.name} (${p.score > 0 ? '+' : ''}${p.score})</span>`;
    }).join("")}
  </div>`;
};

// ─── MASTER TICK (tổng hợp tất cả engine con) ────────────────
function de24Tick() {
  if (typeof window.aeTick === "function") window.aeTick();
  if (typeof window.teTick === "function") window.teTick();
  if (typeof window.seTick === "function") window.seTick();
  if (typeof window.wcTick === "function") window.wcTick();
}

// ─── PUBLIC API ──────────────────────────────────────────────
window.de24Tick = de24Tick;

// ─── INIT ────────────────────────────────────────────────────
function de24Init() {
  // Hook vào tick game
  const _origTick = window.gameTick;
  if (typeof _origTick === "function") {
    window.gameTick = function() {
      _origTick();
      if (Math.random() < 0.25) de24Tick();
    };
  } else {
    setInterval(function() {
      if (typeof window.year !== "undefined" && window.year > 0) de24Tick();
    }, 18000);
  }

  console.log("[DiplomacyEngine V24] 🌐 HUB Ngoại Giao V24 khởi động — Alliance · Treaty · Sanction · WorldCouncil tích hợp hoàn chỉnh.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(de24Init, 2600); });
} else {
  setTimeout(de24Init, 2600);
}

})();
