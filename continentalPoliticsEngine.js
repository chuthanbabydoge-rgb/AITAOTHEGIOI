(function() {
"use strict";
// ============================================================
// CONTINENTAL POLITICS ENGINE — Creator God V6
// Chính Trị Lục Địa — Liên Minh · Bá Quyền · Hội Nghị · Mở Rộng
// Tích hợp: ceV26Data · allianceEngine · diplomacyEngine · economyEngine
// ============================================================

const SAVE_KEY = "cgv6_cont_politics";
const INIT_DELAY = 4500;

// ─── STATE ────────────────────────────────────────────────────
window.cpData = {
  alliances: [],       // Continental alliances (separate from V24)
  hegemony: null,      // Dominant continent id
  hegemonyChallenges: [],
  councils: [],        // Continental council sessions
  sanctions: [],       // Economic sanctions between continents
  incidents: [],       // Political incidents
  log: [],
  prestige: {},        // { continentId: score }
  tickCount: 0,
  initialized: false,
};

const COUNCIL_RESOLUTIONS = [
  "Cấm Vũ Trang Đơn Phương", "Mở Tuyến Thương Mại Mới", "Tuyên Bố Lãnh Thổ Trung Lập",
  "Thành Lập Quỹ Tái Thiết", "Hạn Chế Mở Rộng Lãnh Thổ", "Chia Sẻ Công Nghệ",
  "Trừng Phạt Kẻ Gây Chiến", "Giải Phóng Chư Hầu", "Lập Vùng Phi Quân Sự",
];
const INCIDENT_TYPES = [
  { name: "Ám Sát Đại Sứ", severity: "high",   effect: "relations_down" },
  { name: "Vi Phạm Biên Giới", severity: "med", effect: "stability_down" },
  { name: "Gián Điệp Bị Bắt",  severity: "med", effect: "tension_up" },
  { name: "Cướp Thương Thuyền", severity: "low", effect: "trade_down" },
  { name: "Phỉ Báng Vua Lân Bang", severity: "low", effect: "relations_down" },
  { name: "Tranh Giành Linh Mạch", severity: "high", effect: "war_risk" },
];
const BLOC_NAMES = ["Liên Minh Phương Bắc","Khối Thương Mại Nam Châu","Đại Liên Minh Trung Châu","Minh Ước Thiên Sơn","Hiệp Ước Biển Đông","Liên Bang Linh Vũ","Đồng Minh Hắc Đạo"];

// ─── SAVE / LOAD ──────────────────────────────────────────────
function cpSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cpData)); } catch(e) {}
}
function cpLoad() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) Object.assign(window.cpData, JSON.parse(d));
  } catch(e) {}
}

// ─── HELPERS ──────────────────────────────────────────────────
function _rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function _pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function _getContinents() {
  if (window.ceV26Data && window.ceV26Data.continents) return Object.values(window.ceV26Data.continents);
  return [];
}
function cpLog(msg, type) {
  window.cpData.log.unshift({ year: window.year||0, msg, type: type||"info" });
  if (window.cpData.log.length > 250) window.cpData.log.pop();
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({ year: window.year||0, type:"politics", title: msg, color:"#fbbf24" });
  }
}

// ─── PRESTIGE ─────────────────────────────────────────────────
function cpUpdatePrestige() {
  const conts = _getContinents();
  conts.forEach(c => {
    const base = (c.influence || 0) * 0.4 + (c.techLevel || 1) * 20 + (c.gdp || 0) * 0.001 + (c.stability || 50) * 0.3;
    const warPenalty = (c.atWarWith && c.atWarWith.length) ? -30 : 0;
    const allianceBonus = window.cpData.alliances.filter(a => a.members.includes(c.id)).length * 10;
    window.cpData.prestige[c.id] = Math.max(0, Math.round(base + warPenalty + allianceBonus));
  });
}

// ─── HEGEMONY ─────────────────────────────────────────────────
function cpUpdateHegemony() {
  const p = window.cpData.prestige;
  const ids = Object.keys(p);
  if (!ids.length) return;
  ids.sort((a,b) => (p[b]||0) - (p[a]||0));
  const topId = ids[0];
  const topScore = p[topId] || 0;
  const secondScore = p[ids[1]] || 0;

  if (topScore > secondScore * 1.5 && topScore > 100) {
    if (window.cpData.hegemony !== topId) {
      const old = window.cpData.hegemony;
      window.cpData.hegemony = topId;
      const conts = _getContinents();
      const topCont = conts.find(c => c.id === topId);
      const oldCont = old ? conts.find(c => c.id === old) : null;
      cpLog(`👑 BÁ QUYỀN: ${topCont?.name || topId} trở thành cường quốc bá chủ thiên hạ!`, "hegemony");
      if (old && oldCont) cpLog(`📉 ${oldCont.name} mất vị thế bá chủ.`, "hegemony");
    }
  } else {
    if (window.cpData.hegemony) {
      const conts = _getContinents();
      const oldCont = conts.find(c => c.id === window.cpData.hegemony);
      window.cpData.hegemony = null;
      if (oldCont) cpLog(`⚖️ Thế giới trở về trạng thái đa cực — không còn bá chủ.`, "hegemony");
    }
  }
}

// ─── CONTINENTAL ALLIANCES ────────────────────────────────────
function cpTryFormAlliance() {
  if (Math.random() > 0.02) return;
  const conts = _getContinents().filter(c => !c.atWarWith?.length && c.stability > 55);
  if (conts.length < 2) return;

  const a = _pick(conts);
  const b = _pick(conts.filter(c => c.id !== a.id));
  if (!a || !b) return;

  // Check not already allied
  const alreadyAllied = window.cpData.alliances.some(al =>
    al.members.includes(a.id) && al.members.includes(b.id)
  );
  if (alreadyAllied) return;

  const name = _pick(BLOC_NAMES);
  const types = ["Phòng Thủ Chung","Thương Mại Ưu Đãi","Liên Minh Văn Hóa","Đại Liên Minh Quân Sự","Hiệp Ước Không Xâm Phạm"];
  const type = _pick(types);
  const alliance = {
    id: "cp_al_" + Date.now(),
    name,
    type,
    members: [a.id, b.id],
    memberNames: [a.name, b.name],
    formed: window.year || 0,
    strength: _rand(30, 80),
    status: "active",
  };
  window.cpData.alliances.push(alliance);
  // Boost prestige
  window.cpData.prestige[a.id] = (window.cpData.prestige[a.id]||0) + 15;
  window.cpData.prestige[b.id] = (window.cpData.prestige[b.id]||0) + 15;
  cpLog(`🤝 LIÊN MINH MỚI: ${name} (${type}) — ${a.name} + ${b.name}`, "alliance");
}

function cpTickAlliances() {
  window.cpData.alliances.forEach(al => {
    // Alliances weaken if members go to war
    const conts = _getContinents();
    const m0 = conts.find(c => c.id === al.members[0]);
    const m1 = conts.find(c => c.id === al.members[1]);
    if (!m0 || !m1) return;

    if (m0.atWarWith?.includes(al.members[1]) || m1.atWarWith?.includes(al.members[0])) {
      al.strength -= 30;
    } else if (al.strength < 100) {
      al.strength = Math.min(100, al.strength + 0.5);
    }

    if (al.strength <= 0) {
      al.status = "dissolved";
      cpLog(`💔 LIÊN MINH TAN VỠ: ${al.name} — ${al.memberNames.join(" & ")} chia rẽ.`, "alliance");
    }
  });
  window.cpData.alliances = window.cpData.alliances.filter(al => al.status === "active");
}

// ─── COUNCIL SESSIONS ─────────────────────────────────────────
function cpHoldCouncil() {
  if (Math.random() > 0.01) return;
  const conts = _getContinents();
  if (conts.length < 3) return;

  const resolution = _pick(COUNCIL_RESOLUTIONS);
  const proposer = _pick(conts);
  const votes = conts.map(c => ({
    id: c.id, name: c.name, vote: Math.random() > 0.35 ? "yes" : "no",
  }));
  const yesCount = votes.filter(v => v.vote === "yes").length;
  const passed = yesCount >= Math.ceil(conts.length / 2);

  const session = {
    id: "cp_council_" + Date.now(),
    year: window.year || 0,
    resolution,
    proposer: proposer.name,
    votes,
    result: passed ? "passed" : "rejected",
  };
  window.cpData.councils.unshift(session);
  if (window.cpData.councils.length > 30) window.cpData.councils.pop();

  if (passed) {
    cpLog(`🏛️ HỘI NGHỊ THÔNG QUA: "${resolution}" — ${yesCount}/${conts.length} phiếu`, "council");
    // Apply effect
    conts.forEach(c => {
      if (resolution.includes("Thương Mại")) c.resources.gold = Math.min(9999, (c.resources.gold||0) + 10);
      if (resolution.includes("Công Nghệ")) c.techProgress += 10;
      if (resolution.includes("Tái Thiết")) c.stability = Math.min(100, (c.stability||50) + 5);
    });
  } else {
    cpLog(`🏛️ HỘI NGHỊ BÁC BỎ: "${resolution}" — chỉ ${yesCount}/${conts.length} phiếu thuận.`, "council");
  }
}

// ─── INCIDENTS ────────────────────────────────────────────────
function cpTryIncident() {
  if (Math.random() > 0.025) return;
  const conts = _getContinents();
  if (conts.length < 2) return;
  const a = _pick(conts);
  const b = _pick(conts.filter(c => c.id !== a.id));
  if (!a || !b) return;

  const incident = _pick(INCIDENT_TYPES);
  const entry = {
    id: "cp_inc_" + Date.now(),
    year: window.year || 0,
    type: incident.name,
    severity: incident.severity,
    fromId: a.id, fromName: a.name,
    toId: b.id, toName: b.name,
  };
  window.cpData.incidents.unshift(entry);
  if (window.cpData.incidents.length > 50) window.cpData.incidents.pop();

  // Apply effect
  const sev = { high: 0.08, med: 0.04, low: 0.02 }[incident.severity] || 0.02;
  if (incident.effect === "relations_down") {
    if (typeof window.drGetRelation === "function") { /* relations handled by diplomaticEngine */ }
    b.stability = Math.max(5, (b.stability||50) - _rand(3,8));
  }
  if (incident.effect === "stability_down") b.stability = Math.max(5, (b.stability||50) - _rand(5,12));
  if (incident.effect === "trade_down") b.resources.gold = Math.max(0, (b.resources.gold||0) - _rand(5,20));
  if (incident.effect === "war_risk" && Math.random() < sev * 5 && b.ceV26Data) b.stability -= 15;

  const sevLabel = { high:"🔴 CAO", med:"🟡 TRUNG", low:"🟢 THẤP" }[incident.severity] || "";
  cpLog(`⚡ SỰ CỐ ${sevLabel}: ${incident.name} — ${a.name} vs ${b.name}`, "incident");
}

// ─── MAIN TICK ────────────────────────────────────────────────
function cpTick() {
  const d = window.cpData;
  d.tickCount++;
  if (!d.initialized) return;

  if (d.tickCount % 5 === 0) cpUpdatePrestige();
  if (d.tickCount % 15 === 0) cpUpdateHegemony();
  cpTryFormAlliance();
  cpTickAlliances();
  cpHoldCouncil();
  if (d.tickCount % 2 === 0) cpTryIncident();
  if (d.tickCount % 30 === 0) cpSave();
}

// ─── RENDER PANEL ─────────────────────────────────────────────
window.cpRenderPanel = function() {
  const el = document.getElementById("panel-cont-politics");
  if (!el) return;
  const d = window.cpData;
  const conts = _getContinents();

  const hegCont = d.hegemony ? conts.find(c => c.id === d.hegemony) : null;
  const sortedPrestige = Object.entries(d.prestige).sort((a,b) => b[1]-a[1]);

  let html = `
  <div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
    <!-- HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div style="font-size:1.3em;color:#fbbf24;font-weight:bold">🏛️ Chính Trị Lục Địa</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">🤝 ${d.alliances.length} liên minh</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">⚡ ${d.incidents.length} sự cố</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">🏛️ ${d.councils.length} hội nghị</span>
      </div>
    </div>

    <!-- HEGEMONY -->
    <div style="background:${hegCont?'#1a1000':'#0f172a'};border:1px solid ${hegCont?'#fbbf24':'#334155'};border-radius:10px;padding:14px;margin-bottom:14px">
      <div style="color:#fbbf24;font-weight:bold;margin-bottom:6px">👑 Bá Quyền Thiên Hạ</div>
      ${hegCont ? `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:2em">${hegCont.icon||'🌍'}</span>
          <div>
            <div style="color:#fbbf24;font-size:1.1em;font-weight:bold">${hegCont.name}</div>
            <div style="color:#94a3b8;font-size:0.85em">Uy Danh: ${d.prestige[d.hegemony]||0} điểm · Ảnh hưởng: ${Math.round(hegCont.influence||0)}%</div>
            <div style="color:#64748b;font-size:0.8em">Công nghệ Lv.${hegCont.techLevel||1} · Dân số ${(hegCont.population||0).toLocaleString()}</div>
          </div>
        </div>
      ` : `<div style="color:#64748b;font-style:italic">Thế giới đang trong trạng thái đa cực — không có bá chủ.</div>`}
    </div>

    <!-- PRESTIGE RANKINGS -->
    <div style="margin-bottom:14px">
      <div style="color:#fbbf24;font-weight:bold;margin-bottom:8px">⭐ Uy Danh Lục Địa</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${sortedPrestige.map(([id, score], i) => {
          const c = conts.find(x => x.id === id);
          if (!c) return "";
          const pct = Math.min(100, (score / (sortedPrestige[0][1]||1)) * 100);
          return `
          <div style="display:flex;align-items:center;gap:8px">
            <span style="color:${i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#b45309':'#64748b'};min-width:20px">${i===0?'👑':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
            <span style="min-width:130px;font-size:0.88em">${c.icon||'🌍'} ${c.name}</span>
            <div style="flex:1;background:#1e293b;border-radius:4px;height:8px">
              <div style="background:${i===0?'#fbbf24':i===1?'#94a3b8':'#64748b'};height:8px;border-radius:4px;width:${pct}%"></div>
            </div>
            <span style="color:#94a3b8;font-size:0.85em;min-width:45px;text-align:right">${score}</span>
          </div>`;
        }).join("")}
      </div>
    </div>

    <!-- ALLIANCES -->
    <div style="margin-bottom:14px">
      <div style="color:#4ade80;font-weight:bold;margin-bottom:8px">🤝 Liên Minh Lục Địa (${d.alliances.length})</div>
      ${d.alliances.length === 0 ? '<div style="color:#475569;font-size:0.85em">Chưa có liên minh nào.</div>' :
        d.alliances.map(al => `
        <div style="background:#0f2318;border:1px solid #166534;border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
            <span style="color:#4ade80;font-weight:bold">🤝 ${al.name}</span>
            <span style="color:#64748b;font-size:0.82em">${al.type} · Năm ${al.formed}</span>
          </div>
          <div style="color:#94a3b8;font-size:0.85em;margin:4px 0">Thành viên: ${al.memberNames.join(" + ")}</div>
          <div style="background:#1e293b;border-radius:4px;height:6px;margin-top:4px">
            <div style="background:#4ade80;height:6px;border-radius:4px;width:${al.strength}%"></div>
          </div>
          <div style="color:#64748b;font-size:0.78em;margin-top:2px">Sức mạnh liên minh: ${al.strength}%</div>
        </div>
      `).join("")}
    </div>

    <!-- COUNCIL SESSIONS -->
    <div style="margin-bottom:14px">
      <div style="color:#38bdf8;font-weight:bold;margin-bottom:8px">🏛️ Hội Nghị Gần Nhất (${d.councils.length})</div>
      ${d.councils.length === 0 ? '<div style="color:#475569;font-size:0.85em">Chưa có hội nghị nào.</div>' :
        d.councils.slice(0,5).map(s => `
        <div style="background:#071a2e;border:1px solid #1e3a5f;border-radius:8px;padding:10px;margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
            <span style="color:#38bdf8;font-weight:bold">"${s.resolution}"</span>
            <span style="background:${s.result==='passed'?'#064e3b':'#450a0a'};color:${s.result==='passed'?'#4ade80':'#f87171'};padding:2px 8px;border-radius:10px;font-size:0.78em">${s.result==='passed'?'✅ Thông qua':'❌ Bác bỏ'}</span>
          </div>
          <div style="color:#64748b;font-size:0.8em;margin-top:4px">
            Đề xuất bởi ${s.proposer} · ${s.votes.filter(v=>v.vote==="yes").length}/${s.votes.length} phiếu · Năm ${s.year}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px">
            ${s.votes.map(v => `<span style="background:${v.vote==='yes'?'#064e3b':'#450a0a'};color:${v.vote==='yes'?'#4ade80':'#f87171'};font-size:0.72em;padding:1px 6px;border-radius:8px">${v.name}${v.vote==='yes'?' ✓':' ✗'}</span>`).join("")}
          </div>
        </div>
      `).join("")}
    </div>

    <!-- INCIDENTS -->
    <div style="margin-bottom:14px">
      <div style="color:#fb923c;font-weight:bold;margin-bottom:8px">⚡ Sự Cố Chính Trị Gần Nhất</div>
      ${d.incidents.length === 0 ? '<div style="color:#475569;font-size:0.85em">Chưa có sự cố.</div>' :
        d.incidents.slice(0,8).map(inc => {
          const sevColor = {high:'#f87171',med:'#facc15',low:'#4ade80'}[inc.severity]||'#94a3b8';
          return `<div style="border-bottom:1px solid #1e293b;padding:5px 0;font-size:0.83em;display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap">
            <span><span style="color:${sevColor}">⚡ ${inc.type}</span> — <span style="color:#94a3b8">${inc.fromName} → ${inc.toName}</span></span>
            <span style="color:#64748b">Năm ${inc.year}</span>
          </div>`;
        }).join("")}
    </div>

    <!-- LOG -->
    <div>
      <div style="color:#64748b;font-weight:bold;margin-bottom:8px;font-size:0.9em">📋 Nhật Ký Chính Trị Lục Địa</div>
      <div style="max-height:200px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">
        ${d.log.slice(0,30).map(e => {
          const col = {hegemony:'#fbbf24',alliance:'#4ade80',council:'#38bdf8',incident:'#fb923c'}[e.type]||'#94a3b8';
          return `<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:${col}">[${e.year}] ${e.msg}</div>`;
        }).join("") || '<div style="color:#475569">Chưa có sự kiện.</div>'}
      </div>
    </div>
  </div>`;

  el.innerHTML = html;
};

// ─── INIT ─────────────────────────────────────────────────────
function cpInit() {
  cpLoad();
  window.cpData.initialized = true;
  const _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    try { cpTick(); } catch(e) {}
  };
  console.log("[ContinentalPoliticsEngine] 🏛️ Chính Trị Lục Địa khởi động — Bá quyền · Liên minh · Hội nghị · Sự cố ✓");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(cpInit, INIT_DELAY); });
} else {
  setTimeout(cpInit, INIT_DELAY);
}

})();
