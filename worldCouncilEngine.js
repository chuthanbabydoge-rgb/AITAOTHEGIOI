// ═══════════════════════════════════════════════════════════════
// WORLD COUNCIL ENGINE V24 — Creator God World Simulator
// Hội Đồng Thế Giới: Phiên Họp · Nghị Quyết · Bỏ Phiếu · Lịch Sử
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const WC_KEY = "cgv6_worldcouncil_v24";

// ─── LOẠI NGHỊ QUYẾT ─────────────────────────────────────────
const RESOLUTION_TYPES = {
  PEACE_DEMAND:     { label: "Yêu Cầu Hòa Bình",        icon: "🕊️", color: "#4ade80", threshold: 0.5 },
  SANCTIONS_VOTE:   { label: "Bỏ Phiếu Trừng Phạt",     icon: "⚡", color: "#f87171", threshold: 0.6 },
  AID_PACKAGE:      { label: "Viện Trợ Nhân Đạo",       icon: "🎁", color: "#60a5fa", threshold: 0.5 },
  WAR_CRIMES:       { label: "Tội Ác Chiến Tranh",       icon: "⚖️", color: "#fb923c", threshold: 0.7 },
  TRADE_AGREEMENT:  { label: "Thỏa Thuận Thương Mại",   icon: "💰", color: "#facc15", threshold: 0.55 },
  DISARMAMENT:      { label: "Giải Giáp Vũ Khí",        icon: "🔓", color: "#a78bfa", threshold: 0.65 },
  CLIMATE_PACT:     { label: "Hiệp Ước Bảo Vệ Thiên Nhiên", icon: "🌿", color: "#34d399", threshold: 0.5 },
  CONDEMNATION:     { label: "Lên Án Quốc Tế",           icon: "📢", color: "#fbbf24", threshold: 0.6 },
};

// ─── STATE ───────────────────────────────────────────────────
window.worldCouncilData = window.worldCouncilData || {
  founded: null,       // Năm thành lập
  members: [],         // [ memberName ]
  sessions: [],        // { id, year, resolutions[], status:"active"|"concluded" }
  resolutions: [],     // { id, type, proposer, target, votes:{for:[],against:[]}, status, year, outcome }
  councilLog: [],
  idCounter: 0,
  prestige: {},        // memberName → score
  stats: { sessions: 0, resolutionsPassed: 0, resolutionsFailed: 0 }
};

function wcSave() {
  try { localStorage.setItem(WC_KEY, JSON.stringify(window.worldCouncilData)); } catch(e) {}
}

function wcLoad() {
  try {
    const raw = localStorage.getItem(WC_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      window.worldCouncilData = Object.assign(window.worldCouncilData, d);
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

// ─── THÀNH LẬP HỘI ĐỒNG ──────────────────────────────────────
function wcFoundCouncil(foundingMembers) {
  if (window.worldCouncilData.founded) return { ok: false, msg: "Hội Đồng Thế Giới đã tồn tại" };
  if (!foundingMembers || foundingMembers.length < 3) return { ok: false, msg: "Cần ít nhất 3 thành viên sáng lập" };

  window.worldCouncilData.founded = _year();
  window.worldCouncilData.members = [...foundingMembers];
  foundingMembers.forEach(m => { window.worldCouncilData.prestige[m] = 50; });

  wcSave();
  wcLog(`🏛 Hội Đồng Thế Giới được thành lập năm ${_year()} với ${foundingMembers.length} thành viên sáng lập`);
  return { ok: true };
}

function wcAddMember(name) {
  if (!window.worldCouncilData.founded) return { ok: false, msg: "Hội Đồng chưa được thành lập" };
  if (window.worldCouncilData.members.includes(name)) return { ok: false, msg: "Đã là thành viên" };
  window.worldCouncilData.members.push(name);
  window.worldCouncilData.prestige[name] = 30;
  wcSave();
  wcLog(`➕ ${name} gia nhập Hội Đồng Thế Giới`);
  return { ok: true };
}

function wcRemoveMember(name) {
  window.worldCouncilData.members = window.worldCouncilData.members.filter(m => m !== name);
  wcSave();
  wcLog(`➖ ${name} rời khỏi Hội Đồng Thế Giới`);
  return { ok: true };
}

// ─── NGHỊ QUYẾT ──────────────────────────────────────────────
function wcProposeResolution(type, proposer, target) {
  if (!window.worldCouncilData.founded) return { ok: false, msg: "Hội Đồng chưa thành lập" };
  if (!RESOLUTION_TYPES[type]) return { ok: false, msg: "Loại nghị quyết không hợp lệ" };
  if (!window.worldCouncilData.members.includes(proposer)) return { ok: false, msg: `${proposer} không phải thành viên Hội Đồng` };

  const def = RESOLUTION_TYPES[type];
  const id = "wres_" + (++window.worldCouncilData.idCounter);

  const resolution = {
    id, type, proposer, target,
    votes: { for: [], against: [] },
    status: "voting",
    year: _year(),
    outcome: null
  };

  window.worldCouncilData.resolutions.push(resolution);

  // AI vote tự động
  wcAutoVote(resolution);

  wcSave();
  wcLog(`${def.icon} ${proposer} đề xuất: ${def.label}${target ? ` (nhắm vào ${target})` : ""}`);
  return { ok: true, resolution };
}

function wcAutoVote(resolution) {
  const def = RESOLUTION_TYPES[resolution.type];
  const members = window.worldCouncilData.members.filter(m => m !== resolution.proposer && m !== resolution.target);

  members.forEach(m => {
    let forChance = 0.5;

    // Điều chỉnh theo quan hệ
    if (typeof window.drGetRelation === "function") {
      try {
        const relWithProposer = window.drGetRelation(m, resolution.proposer);
        const relWithTarget   = resolution.target ? window.drGetRelation(m, resolution.target) : { score: 0 };
        forChance += relWithProposer.score / 400;
        forChance -= relWithTarget.score / 400;
      } catch(e) {}
    }

    forChance = Math.max(0.1, Math.min(0.9, forChance));
    if (Math.random() < forChance) {
      resolution.votes.for.push(m);
    } else {
      resolution.votes.against.push(m);
    }
  });

  // Proposer luôn vote for
  if (!resolution.votes.for.includes(resolution.proposer)) {
    resolution.votes.for.push(resolution.proposer);
  }
  // Target (nếu là thành viên) thường vote against
  if (resolution.target && window.worldCouncilData.members.includes(resolution.target)) {
    resolution.votes.against.push(resolution.target);
  }

  wcResolve(resolution);
}

function wcResolve(resolution) {
  const def = RESOLUTION_TYPES[resolution.type];
  const total = window.worldCouncilData.members.length;
  const forCount = resolution.votes.for.length;
  const ratio = total > 0 ? forCount / total : 0;

  if (ratio >= def.threshold) {
    resolution.status = "passed";
    resolution.outcome = "Thông qua";
    window.worldCouncilData.stats.resolutionsPassed++;

    // Thi hành nghị quyết
    wcEnforce(resolution);

    // Tăng uy tín người đề xuất
    window.worldCouncilData.prestige[resolution.proposer] =
      Math.min(100, (window.worldCouncilData.prestige[resolution.proposer] || 50) + 10);

    wcLog(`✅ Nghị Quyết "${def.label}" THÔNG QUA (${forCount}/${total} phiếu)`);
  } else {
    resolution.status = "failed";
    resolution.outcome = "Bác bỏ";
    window.worldCouncilData.stats.resolutionsFailed++;
    wcLog(`❌ Nghị Quyết "${def.label}" BỊ BÁC BỎ (${forCount}/${total} phiếu)`);
  }
}

function wcEnforce(resolution) {
  switch(resolution.type) {
    case "PEACE_DEMAND":
      if (resolution.target && typeof window.warsActive !== "undefined") {
        window.warsActive.forEach(w => {
          if (w.status === "active" && (w.attacker === resolution.target || w.defender === resolution.target)) {
            w.status = "peace";
            w.endYear = _year();
            wcLog(`🕊️ Chiến tranh liên quan đến ${resolution.target} kết thúc theo yêu cầu Hội Đồng`);
          }
        });
      }
      break;
    case "SANCTIONS_VOTE":
      if (resolution.target && typeof window.seImposeSanction === "function") {
        window.seImposeSanction("TRADE_BAN", "Hội Đồng Thế Giới", resolution.target, "Nghị quyết Hội Đồng", 30);
      }
      break;
    case "CONDEMNATION":
      if (resolution.target && typeof window.drGetRelation === "function") {
        window.worldCouncilData.members.forEach(m => {
          if (m !== resolution.target) {
            try {
              const rel = window.drGetRelation(m, resolution.target);
              rel.score = Math.max(-100, rel.score - 15);
            } catch(e) {}
          }
        });
      }
      break;
    case "TRADE_AGREEMENT":
      if (typeof window.teSignTreaty === "function") {
        const members = window.worldCouncilData.members;
        for (let i = 0; i < Math.min(members.length, 3); i++) {
          for (let j = i+1; j < Math.min(members.length, 3); j++) {
            window.teSignTreaty("TRADE", members[i], members[j]);
          }
        }
      }
      break;
  }
}

// ─── PHIÊN HỌP ───────────────────────────────────────────────
function wcHoldSession() {
  if (!window.worldCouncilData.founded) return;
  const id = "wsess_" + (++window.worldCouncilData.idCounter);
  const session = {
    id,
    year: _year(),
    resolutions: [],
    status: "concluded"
  };

  // Tự động đề xuất nghị quyết dựa trên tình hình thế giới
  const types = Object.keys(RESOLUTION_TYPES);
  const proposers = [...window.worldCouncilData.members];
  if (proposers.length > 0 && Math.random() < 0.6) {
    const type     = types[Math.floor(Math.random() * types.length)];
    const proposer = proposers[Math.floor(Math.random() * proposers.length)];
    const targets  = _allPowers().filter(p => p !== proposer);
    const target   = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)] : null;
    const res = wcProposeResolution(type, proposer, target);
    if (res.ok) session.resolutions.push(res.resolution.id);
  }

  window.worldCouncilData.sessions.push(session);
  window.worldCouncilData.stats.sessions++;
  wcSave();
  return session;
}

// ─── AI TICK ─────────────────────────────────────────────────
function wcTick() {
  if (!window.worldCouncilData.founded) {
    // Tự động thành lập nếu đủ điều kiện
    const powers = _allPowers();
    if (powers.length >= 5 && Math.random() < 0.02) {
      wcFoundCouncil(powers.slice(0, Math.min(powers.length, 8)));
    }
    return;
  }

  // Cập nhật thành viên
  const powers = _allPowers();
  powers.forEach(p => {
    if (!window.worldCouncilData.members.includes(p) && Math.random() < 0.1) {
      wcAddMember(p);
    }
  });

  // Tổ chức phiên họp định kỳ (mỗi ~20 năm)
  const lastSession = window.worldCouncilData.sessions.slice(-1)[0];
  const yr = _year();
  if (!lastSession || (yr - lastSession.year) >= 20) {
    wcHoldSession();
  }
}

// ─── LOG ─────────────────────────────────────────────────────
function wcLog(msg) {
  window.worldCouncilData.councilLog.unshift({ year: _year(), msg });
  if (window.worldCouncilData.councilLog.length > 150) window.worldCouncilData.councilLog.pop();
  if (typeof window.addWorldHistory === "function") window.addWorldHistory(msg, "council");
}

// ─── RENDER PANEL ────────────────────────────────────────────
window.wcRenderPanel = function() {
  const el = document.getElementById("panel-world-council");
  if (!el) return;
  const wc = window.worldCouncilData;
  const powers = _allPowers();

  if (!wc.founded) {
    el.innerHTML = `
    <div style="padding:40px;text-align:center;max-width:600px;margin:0 auto;">
      <div style="font-size:48px;margin-bottom:16px;">🏛</div>
      <div style="font-family:var(--font-title);font-size:1.6em;color:var(--gold);margin-bottom:12px;">Hội Đồng Thế Giới Chưa Được Thành Lập</div>
      <div style="color:var(--white-dim);margin-bottom:24px;">Cần ít nhất 3 thế lực để thành lập Hội Đồng Thế Giới.</div>
      <div style="margin-bottom:16px;">
        <select id="wc-founding-sel" multiple style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--white-main);padding:8px;border-radius:8px;font-size:.9em;height:120px;">
          ${powers.map(p=>`<option value="${p}">${p}</option>`).join("")}
        </select>
        <div style="color:var(--white-dim);font-size:.78em;margin-top:4px;">Ctrl+Click để chọn nhiều thành viên sáng lập</div>
      </div>
      <button onclick="window.wcFoundFromUI()" style="background:linear-gradient(135deg,#facc15,#c4961e);color:#000;border:none;padding:12px 30px;border-radius:10px;cursor:pointer;font-weight:700;font-size:1em;">🏛 Thành Lập Hội Đồng</button>
      <div id="wc-found-msg" style="margin-top:12px;font-size:.85em;"></div>
    </div>`;
    return;
  }

  const activeRes = wc.resolutions.filter(r => r.status === "voting");
  const passedRes = wc.resolutions.filter(r => r.status === "passed");
  const failedRes = wc.resolutions.filter(r => r.status === "failed");
  const prestigeList = Object.entries(wc.prestige || {}).sort((a,b) => b[1]-a[1]);

  el.innerHTML = `
  <div style="padding:20px;max-width:1100px;margin:0 auto;">
    <!-- HEADER -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px">🏛</span>
      <div>
        <div style="font-family:var(--font-title);font-size:1.4em;color:var(--gold);">Hội Đồng Thế Giới V24</div>
        <div style="color:var(--white-dim);font-size:.85em;">Thành lập năm ${wc.founded} · ${wc.members.length} thành viên · ${wc.stats.sessions} phiên họp</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <span style="background:rgba(74,222,128,.15);border:1px solid #4ade80;color:#4ade80;padding:4px 10px;border-radius:20px;font-size:.78em;">✅ ${wc.stats.resolutionsPassed} Thông qua</span>
        <span style="background:rgba(248,113,113,.1);border:1px solid #f87171;color:#f87171;padding:4px 10px;border-radius:20px;font-size:.78em;">❌ ${wc.stats.resolutionsFailed} Bác bỏ</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
      <div>
        <!-- ĐỀ XUẤT NGHỊ QUYẾT -->
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px;">
          <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:12px;font-size:.9em;">📋 Đề Xuất Nghị Quyết</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
            <select id="wc-res-type" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.82em;">
              ${Object.entries(RESOLUTION_TYPES).map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`).join("")}
            </select>
            <select id="wc-res-proposer" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.82em;">
              ${wc.members.map(m=>`<option value="${m}">${m}</option>`).join("")}
            </select>
            <select id="wc-res-target" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:7px;border-radius:6px;font-size:.82em;">
              <option value="">-- Không có mục tiêu --</option>
              ${powers.map(p=>`<option value="${p}">${p}</option>`).join("")}
            </select>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="window.wcProposeFromUI()" style="background:linear-gradient(135deg,#facc15,#c4961e);color:#000;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:700;font-size:.85em;">🗳️ Bỏ Phiếu</button>
            <button onclick="window.wcHoldSessionFromUI()" style="background:rgba(96,165,250,.15);border:1px solid #60a5fa;color:#60a5fa;padding:7px 16px;border-radius:7px;cursor:pointer;font-size:.85em;">🏛 Tổ Chức Phiên Họp</button>
            <span id="wc-res-msg" style="font-size:.82em;line-height:2.2;"></span>
          </div>
        </div>

        <!-- THÀNH VIÊN -->
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-family:var(--font-title);color:var(--gold);font-size:.9em;">👥 Thành Viên (${wc.members.length})</div>
            <div style="display:flex;gap:6px;">
              <select id="wc-add-mem" style="background:var(--bg-secondary);border:1px solid var(--border);color:var(--white-main);padding:5px;border-radius:5px;font-size:.78em;">
                ${powers.filter(p=>!wc.members.includes(p)).map(p=>`<option value="${p}">${p}</option>`).join("") || `<option value="">-- Tất cả đã gia nhập --</option>`}
              </select>
              <button onclick="window.wcAddMemberFromUI()" style="background:rgba(74,222,128,.15);border:1px solid #4ade80;color:#4ade80;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:.78em;">+ Thêm</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${wc.members.map(m => {
              const pr = wc.prestige[m] || 0;
              const color = pr >= 70 ? "#facc15" : pr >= 40 ? "#4ade80" : "#94a3b8";
              return `<span style="background:${color}22;border:1px solid ${color}66;color:${color};padding:3px 10px;border-radius:12px;font-size:.8em;cursor:pointer;" title="Uy tín: ${pr}">${m} ⭐${pr}</span>`;
            }).join("")}
          </div>
        </div>

        <!-- LỊCH SỬ NGHỊ QUYẾT -->
        <div style="font-family:var(--font-title);color:var(--gold-dim);margin-bottom:8px;font-size:.85em;">📜 Nghị Quyết Gần Đây</div>
        <div style="max-height:280px;overflow-y:auto;">
          ${wc.resolutions.slice().reverse().slice(0,15).map(r => {
            const def = RESOLUTION_TYPES[r.type] || { icon:"📋", label:r.type, color:"#94a3b8" };
            const statusColor = r.status==="passed" ? "#4ade80" : r.status==="failed" ? "#f87171" : "#fbbf24";
            const statusLabel = r.status==="passed" ? "✅ Thông Qua" : r.status==="failed" ? "❌ Bác Bỏ" : "🗳️ Đang Bỏ Phiếu";
            return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">${def.icon}</span>
                <div style="flex:1;">
                  <div style="font-size:.85em;color:${def.color};">${def.label}${r.target ? ` → ${r.target}` : ""}</div>
                  <div style="font-size:.75em;color:var(--white-dim);">Đề xuất bởi ${r.proposer} · Năm ${r.year}</div>
                </div>
                <div style="text-align:right;">
                  <div style="color:${statusColor};font-size:.8em;font-weight:700;">${statusLabel}</div>
                  <div style="font-size:.72em;color:var(--white-dim);">👍${r.votes.for.length} 👎${r.votes.against.length}</div>
                </div>
              </div>
            </div>`;
          }).join("") || `<div style="color:var(--white-dim);text-align:center;padding:20px;">Chưa có nghị quyết nào.</div>`}
        </div>
      </div>

      <!-- BẢNG UY TÍN & LOG -->
      <div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;">
          <div style="font-family:var(--font-title);color:var(--gold);margin-bottom:10px;font-size:.9em;">⭐ Bảng Uy Tín</div>
          ${prestigeList.slice(0,10).map(([name,score], i) => {
            const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"  ";
            const w = Math.max(5, Math.round(score));
            return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:.8em;width:20px;">${medal}</span>
              <div style="flex:1;">
                <div style="font-size:.8em;color:var(--white-main);">${name}</div>
                <div style="height:4px;background:var(--bg-secondary);border-radius:2px;margin-top:2px;">
                  <div style="height:4px;background:linear-gradient(90deg,#facc15,#c4961e);border-radius:2px;width:${w}%;"></div>
                </div>
              </div>
              <span style="font-size:.78em;color:var(--gold);">${score}</span>
            </div>`;
          }).join("") || `<div style="color:var(--white-dim);font-size:.82em;">Chưa có dữ liệu.</div>`}
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:12px;max-height:350px;overflow-y:auto;">
          <div style="font-size:.78em;color:var(--gold-dim);margin-bottom:8px;">📋 Nhật Ký Hội Đồng</div>
          ${wc.councilLog.slice(0,30).map(l=>`<div style="font-size:.78em;color:var(--white-dim);margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.04);">⏺ <span style="color:#475569;">Năm ${l.year}</span> ${l.msg}</div>`).join("") || `<div style="color:var(--white-dim);font-size:.82em;">Chưa có hoạt động.</div>`}
        </div>
      </div>
    </div>
  </div>`;
};

window.wcFoundFromUI = function() {
  const sel = document.getElementById("wc-founding-sel");
  const members = sel ? Array.from(sel.selectedOptions).map(o => o.value) : [];
  const msg = document.getElementById("wc-found-msg");
  const result = wcFoundCouncil(members);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? "✅ Hội Đồng Thế Giới đã được thành lập!" : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.wcRenderPanel, 500);
};

window.wcProposeFromUI = function() {
  const type     = document.getElementById("wc-res-type")?.value;
  const proposer = document.getElementById("wc-res-proposer")?.value;
  const target   = document.getElementById("wc-res-target")?.value || null;
  const msg      = document.getElementById("wc-res-msg");
  const result   = wcProposeResolution(type, proposer, target);
  if (msg) { msg.style.color = result.ok ? "#4ade80" : "#f87171"; msg.textContent = result.ok ? `✅ Nghị quyết: ${result.resolution.outcome}` : "⚠️ " + result.msg; }
  if (result.ok) setTimeout(window.wcRenderPanel, 400);
};

window.wcHoldSessionFromUI = function() {
  const msg = document.getElementById("wc-res-msg");
  const session = wcHoldSession();
  if (msg) { msg.style.color = "#60a5fa"; msg.textContent = `🏛 Phiên họp năm ${_year()} đã diễn ra`; }
  setTimeout(window.wcRenderPanel, 400);
};

window.wcAddMemberFromUI = function() {
  const sel = document.getElementById("wc-add-mem");
  if (!sel || !sel.value) return;
  wcAddMember(sel.value);
  setTimeout(window.wcRenderPanel, 300);
};

// ─── PUBLIC API ──────────────────────────────────────────────
window.wcFoundCouncil      = wcFoundCouncil;
window.wcAddMember         = wcAddMember;
window.wcRemoveMember      = wcRemoveMember;
window.wcProposeResolution = wcProposeResolution;
window.wcHoldSession       = wcHoldSession;
window.wcTick              = wcTick;
window.RESOLUTION_TYPES    = RESOLUTION_TYPES;

// ─── INIT ────────────────────────────────────────────────────
function wcInit() {
  wcLoad();
  setInterval(function() {
    if (typeof window.year !== "undefined" && window.year > 0) wcTick();
  }, 20000);
  console.log("[WorldCouncilEngine V24] 🏛 Hệ thống Hội Đồng Thế Giới khởi động — Phiên Họp · Nghị Quyết · Bỏ Phiếu sẵn sàng.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(wcInit, 2400); });
} else {
  setTimeout(wcInit, 2400);
}

})();
