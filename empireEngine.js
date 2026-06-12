// ============================================================
// EMPIRE ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Hệ thống Đế Quốc — Hình thành, Phát triển, Sụp Đổ
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const EE_SAVE_KEY = "cgv6_empires";
const EE_VERSION  = 23;

const EE_EMPIRE_NAMES = [
  "Thiên Long Đế Quốc","Phượng Hoàng Đại Đế","Hắc Ám Đại Đế Quốc","Rồng Vàng Thiên Triều",
  "Lôi Hỏa Đế Quốc","Huyền Vũ Đại Đế","Bạch Đế Thiên Triều","Minh Thiên Đế Quốc",
  "Vạn Giới Đế Quốc","Thái Cổ Thiên Triều","Hỗn Độn Đại Đế","Bắc Minh Đế Quốc",
  "Đông Hoàng Thiên Triều","Nam Thiên Đại Đế","Tây Đế Quốc","Viễn Cổ Thiên Triều"
];

const EE_EMPEROR_NAMES = [
  "Thiên Hoàng Đại Đế","Long Vũ Hoàng Đế","Phượng Nghịch Thiên","Hắc Đế Vô Song",
  "Minh Thiên Chí Tôn","Vũ Hoàng Chí Thượng","Thiên Đế Vạn Cổ","Huyền Hoàng Bất Diệt"
];

const EE_IMPERIAL_DYNASTY = [
  "Thiên Long Triều","Phượng Hoàng Triều","Hắc Ám Triều","Minh Đế Triều",
  "Vạn Kiếm Triều","Thái Cổ Triều","Hỗn Độn Triều","Long Vũ Triều"
];

const EE_WONDERS = [
  "Thiên Long Bảo Tháp","Phượng Hoàng Cung Điện","Hắc Thạch Thành Tường",
  "Vạn Giới Quan Sát Đài","Lôi Đình Đại Điện","Hải Thiên Đại Cầu",
  "Tử Kim Thần Miếu","Bạch Ngọc Bảo Điện"
];

// ── INIT ──
function eeInit() {
  if (!window.empireData) {
    const saved = localStorage.getItem(EE_SAVE_KEY);
    window.empireData = saved ? JSON.parse(saved) : { empires: {}, idCounter: 0, version: EE_VERSION };
  }
  if (!window.empireData.empires)    window.empireData.empires   = {};
  if (!window.empireData.idCounter)  window.empireData.idCounter = 0;
  if (!window.empireData.version)    window.empireData.version   = EE_VERSION;
}

function eeSave() {
  try { localStorage.setItem(EE_SAVE_KEY, JSON.stringify(window.empireData)); } catch(e) {}
}

// ── Tạo đế quốc mới ──
function eeCreateEmpire(opts) {
  if (!window.empireData) eeInit();
  const eId = "e" + (++window.empireData.idCounter);
  const name = opts.empireName || _eeRandItem(EE_EMPIRE_NAMES);
  const emp = {
    empireId:          eId,
    empireName:        name,
    emperor:           opts.emperor || _eeRandItem(EE_EMPEROR_NAMES),
    imperialDynasty:   opts.imperialDynasty || _eeRandItem(EE_IMPERIAL_DYNASTY),
    capital:           opts.capital || "Đế Đô",
    memberKingdoms:    opts.memberKingdoms || [],
    totalPopulation:   opts.totalPopulation || 0,
    totalArmy:         opts.totalArmy || 0,
    totalWealth:       opts.totalWealth || 0,
    influence:         opts.influence || 100,
    age:               0,
    stability:         opts.stability || 80,
    expansionScore:    0,
    collapseRisk:      0,
    wonders:           [],
    history:           [],
    yearFounded:       opts.yearFounded || (window.year || 1),
    isCollapsed:       false,
    // Bonus đế quốc
    tradeBonus:        0.15,
    researchBonus:     0.12,
    militaryBonus:     0.10,
    cultureBonus:      0.08,
    // Vassal kingdoms
    vassalKingdoms:    [],
    // Rebellion risk
    rebellionRisk:     0,
  };
  window.empireData.empires[eId] = emp;

  const msg = `👑 Đế quốc ${name} được khai lập! Hoàng Đế: ${emp.emperor}.`;
  if (typeof addLog === "function") addLog(msg, "important");
  if (typeof toast === "function") toast(`👑 ${name} ra đời!`);
  if (typeof htAddEvent === "function") htAddEvent({ year: window.year || 0, type: "empire_founded", text: msg, empireId: eId });

  eeSave();
  return emp;
}

// ── Kiểm tra và hình thành Đế Quốc từ Kingdoms ──
function eeCheckFormation() {
  if (!window.kingdomData || !window.empireData) return;
  const kingdoms = Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed && !k.empireId);

  // Tìm kingdom đủ mạnh để thành lập đế quốc (stageIndex >= 3 và influence >= 300)
  kingdoms.forEach(k => {
    if (k.stageIndex >= 3 && k.influence >= 300 && k.militaryPower >= 50000) {
      // Tập hợp các kingdom lân cận / yếu hơn làm member
      const members = kingdoms.filter(other =>
        other.kingdomId !== k.kingdomId &&
        other.militaryPower < k.militaryPower * 0.5
      ).slice(0, 3);

      if (members.length >= 2) {
        const totalPop = [k, ...members].reduce((s, m) => s + m.population, 0);
        const totalArmy = [k, ...members].reduce((s, m) => s + m.armySize, 0);
        const totalWealth = [k, ...members].reduce((s, m) => s + m.treasury, 0);

        const empire = eeCreateEmpire({
          empireName:      k.kingdomName.replace("Vương Quốc","").replace("Quốc","").trim() + " Đại Đế Quốc",
          emperor:         k.ruler.name,
          imperialDynasty: k.dynasty,
          capital:         k.capitalCity,
          memberKingdoms:  [k.kingdomId, ...members.map(m => m.kingdomId)],
          totalPopulation: totalPop,
          totalArmy:       totalArmy,
          totalWealth:     totalWealth,
          yearFounded:     window.year || 1,
        });

        // Đánh dấu kingdoms đã tham gia
        k.empireId = empire.empireId;
        k.stageIndex = Math.max(k.stageIndex, 4);
        members.forEach(m => { m.empireId = empire.empireId; });

        if (typeof keSave === "function") keSave();
      }
    }
  });
}

// ── TICK ──
function eeTick() {
  if (!window.empireData) return;
  const year = window.year || 0;

  Object.values(window.empireData.empires).forEach(emp => {
    if (emp.isCollapsed) return;

    emp.age = year - emp.yearFounded;

    // Tổng hợp từ kingdoms thành viên
    if (window.kingdomData) {
      const members = emp.memberKingdoms
        .map(id => window.kingdomData.kingdoms[id])
        .filter(Boolean)
        .filter(k => !k.isCollapsed);

      emp.totalPopulation = members.reduce((s, k) => s + k.population, 0);
      emp.totalArmy       = members.reduce((s, k) => s + k.armySize, 0);
      emp.totalWealth     = members.reduce((s, k) => s + k.treasury, 0);
      emp.memberKingdoms  = members.map(k => k.kingdomId);
    }

    // Tăng ảnh hưởng
    emp.influence += Math.floor(emp.totalArmy / 500) + Math.floor(emp.totalWealth / 100000);

    // Rủi ro nội loạn
    if (emp.memberKingdoms.length > 6) emp.rebellionRisk += 2;
    if (emp.stability < 50) emp.rebellionRisk += 3;
    if (emp.totalWealth < 0) emp.rebellionRisk += 5;

    // Giảm rủi ro khi ổn định
    if (emp.stability >= 80) emp.rebellionRisk = Math.max(0, emp.rebellionRisk - 2);

    // Sự kiện ngẫu nhiên (mỗi 30 năm)
    if (year > 0 && year % 30 === 0 && emp.age > 0) {
      _eeTriggerEvent(emp);
    }

    // Xây kỳ quan (mỗi 50 năm, chi phí cao)
    if (year % 50 === 0 && emp.totalWealth > 500000 && emp.wonders.length < 5) {
      const wonder = _eeRandItem(EE_WONDERS.filter(w => !emp.wonders.includes(w)));
      if (wonder) {
        emp.wonders.push(wonder);
        emp.totalWealth -= 200000;
        emp.influence += 200;
        const msg = `🏛️ ${emp.empireName} xây dựng kỳ quan: ${wonder}!`;
        if (typeof addLog === "function") addLog(msg, "important");
        if (typeof htAddEvent === "function") htAddEvent({ year, type: "wonder_built", text: msg, empireId: emp.empireId });
      }
    }

    // Sụp đổ
    if (emp.rebellionRisk >= 100 || emp.memberKingdoms.length === 0 || emp.stability <= 0) {
      _eeCollapse(emp);
    }
  });

  // Kiểm tra hình thành đế quốc mới mỗi 15 năm
  if (year > 0 && year % 15 === 0) eeCheckFormation();

  eeSave();
}

function _eeTriggerEvent(emp) {
  const year = window.year || 0;
  const roll = Math.random();
  let msg;
  if (roll < 0.2) {
    emp.stability = Math.max(0, emp.stability - 15);
    emp.rebellionRisk += 20;
    msg = `⚔️ ${emp.empireName} bùng phát nội loạn! Ổn định suy giảm.`;
  } else if (roll < 0.4) {
    emp.totalWealth += 100000;
    emp.stability = Math.min(100, emp.stability + 10);
    msg = `💰 ${emp.empireName} trải qua thời kỳ thịnh vượng!`;
  } else if (roll < 0.55) {
    emp.totalArmy += 5000;
    msg = `⚔️ ${emp.empireName} tuyển thêm 5000 đại quân!`;
  } else if (roll < 0.65) {
    emp.rebellionRisk += 30;
    emp.stability = Math.max(0, emp.stability - 10);
    msg = `🔥 Phong trào phản loạn nổi lên trong ${emp.empireName}!`;
  } else {
    emp.influence += 100;
    msg = `🌟 ${emp.empireName} bành trướng ảnh hưởng văn hóa ra các vùng lân cận!`;
  }
  if (typeof addLog === "function") addLog(msg, "important");
  if (typeof htAddEvent === "function") htAddEvent({ year, type: "empire_event", text: msg, empireId: emp.empireId });
  emp.history.push({ year, event: msg });
}

function _eeCollapse(emp) {
  emp.isCollapsed = true;
  const year = window.year || 0;
  const msg = `💀 Đế quốc ${emp.empireName} sụp đổ! (Năm ${year}, thọ ${emp.age} năm)`;
  if (typeof addLog === "function") addLog(msg, "death");
  if (typeof htAddEvent === "function") htAddEvent({ year, type: "empire_collapsed", text: msg, empireId: emp.empireId });
  // Giải phóng kingdoms thành viên
  if (window.kingdomData) {
    emp.memberKingdoms.forEach(kId => {
      const k = window.kingdomData.kingdoms[kId];
      if (k) { k.empireId = null; k.stability = Math.max(0, k.stability - 20); }
    });
    if (typeof keSave === "function") keSave();
  }
}

// ── Thống kê ──
function eeGetStats() {
  if (!window.empireData) return { total: 0, active: 0, totalPop: 0 };
  const all = Object.values(window.empireData.empires);
  const active = all.filter(e => !e.isCollapsed);
  return {
    total:     all.length,
    active:    active.length,
    collapsed: all.length - active.length,
    strongest: active.sort((a,b) => b.totalArmy - a.totalArmy)[0] || null,
    richest:   active.sort((a,b) => b.totalWealth - a.totalWealth)[0] || null,
    largest:   active.sort((a,b) => b.totalPopulation - a.totalPopulation)[0] || null,
  };
}

function eeGetActiveEmpires() {
  if (!window.empireData) return [];
  return Object.values(window.empireData.empires).filter(e => !e.isCollapsed);
}

// ── RENDER PANEL ──
function eeRenderPanel() {
  const panel = document.getElementById("panel-empires");
  if (!panel) return;
  if (!window.empireData) eeInit();

  const empires = eeGetActiveEmpires();
  const stats   = eeGetStats();

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="eeCheckFormation();eeRenderPanel()">👑 Kiểm Tra Hình Thành</button>
      <button class="btn-secondary" onclick="eeRenderPanel()">🔄 Làm Mới</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${stats.active} đế quốc đang tồn tại</span>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      ${[
        ["👑","Đang Tồn Tại", stats.active],
        ["📜","Lịch Sử", stats.total],
        ["💀","Đã Sụp Đổ", stats.collapsed],
      ].map(([icon,label,val]) => `
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-size:22px;margin-bottom:4px">${icon}</div>
          <div style="font-size:18px;font-weight:800;color:var(--gold)">${val}</div>
          <div style="font-size:10px;color:var(--white-dim)">${label}</div>
        </div>
      `).join("")}
    </div>

    <div class="panel-grid">
      ${empires.length === 0 ? `
        <div class="card span-full" style="text-align:center;padding:40px;color:var(--white-dim)">
          <div style="font-size:48px;margin-bottom:12px">🌌</div>
          <div style="font-size:14px;margin-bottom:8px">Chưa có đế quốc nào.</div>
          <div style="font-size:12px;opacity:.7">Khi một vương quốc đủ mạnh và chinh phục đủ lãnh thổ, đế quốc sẽ xuất hiện.</div>
        </div>
      ` : empires.map(e => eeRenderEmpireCard(e)).join("")}
    </div>
  `;
}

function eeRenderEmpireCard(e) {
  const popStr = e.totalPopulation >= 1000000 ? (e.totalPopulation/1000000).toFixed(1)+"M" : (e.totalPopulation/1000).toFixed(0)+"K";
  const goldStr = e.totalWealth >= 1000000 ? (e.totalWealth/1000000).toFixed(1)+"M" : (e.totalWealth/1000).toFixed(0)+"K";
  const stabilityColor = e.stability > 70 ? "#4ade80" : e.stability > 40 ? "#facc15" : "#f87171";
  return `
    <div class="card span-full" style="border-left:3px solid #facc15;background:linear-gradient(160deg,#1a1600 0%,#0f1318 100%)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
        <div>
          <div style="font-family:var(--font-title);font-size:18px;color:var(--gold);margin-bottom:4px">👑 ${e.empireName}</div>
          <div style="font-size:11px;color:var(--white-dim)">${e.imperialDynasty} · Thủ Đô: ${e.capital}</div>
          <div style="font-size:10px;color:var(--white-dim);margin-top:2px">Thành lập: Năm ${e.yearFounded} · Thọ: ${e.age} năm</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--white-dim)">Hoàng Đế</div>
          <div style="font-size:14px;font-weight:700;color:var(--white-main)">${e.emperor}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
        ${[
          ["👥","Dân số",popStr],
          ["⚔️","Đại Quân",e.totalArmy.toLocaleString()],
          ["💰","Quốc Khố",goldStr],
          ["🏰","Kingdoms",e.memberKingdoms.length+""],
        ].map(([icon,label,val]) => `
          <div style="background:rgba(250,204,21,0.05);border:1px solid rgba(250,204,21,0.12);border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:16px;margin-bottom:4px">${icon}</div>
            <div style="font-size:14px;font-weight:800;color:var(--gold)">${val}</div>
            <div style="font-size:9px;color:var(--white-dim)">${label}</div>
          </div>
        `).join("")}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div>
          ${[
            ["Ổn định", e.stability, 100, stabilityColor],
            ["Ảnh hưởng", Math.min(e.influence,2000), 2000, "#c084fc"],
            ["Nguy cơ loạn", e.rebellionRisk, 100, "#f87171"],
          ].map(([label,val,max,color]) => `
            <div style="display:grid;grid-template-columns:80px 1fr 35px;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:10px;color:var(--white-dim)">${label}</span>
              <div style="height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${Math.min(100,val/max*100)}%;background:${color};border-radius:3px"></div>
              </div>
              <span style="font-size:10px;color:${color};text-align:right">${Math.floor(val)}</span>
            </div>
          `).join("")}
        </div>
        <div>
          <div style="font-size:10px;color:var(--white-dim);margin-bottom:6px">⭐ Kỳ Quan (${e.wonders.length})</div>
          ${e.wonders.length > 0 ? e.wonders.map(w => `
            <div style="font-size:10px;color:var(--gold);padding:2px 8px;background:rgba(250,204,21,0.05);border-radius:4px;margin-bottom:3px">🏛️ ${w}</div>
          `).join("") : `<div style="font-size:10px;color:var(--white-dim);opacity:.5;font-style:italic">Chưa có kỳ quan nào</div>`}
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span style="font-size:10px;color:var(--white-dim);padding:3px 0">Bonus:</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);color:var(--gold)">+${Math.floor(e.tradeBonus*100)}% Thương mại</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2);color:var(--blue)">+${Math.floor(e.researchBonus*100)}% Nghiên cứu</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);color:var(--red)">+${Math.floor(e.militaryBonus*100)}% Quân sự</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);color:var(--purple)">+${Math.floor(e.cultureBonus*100)}% Văn hóa</span>
      </div>

      ${e.history.length > 0 ? `
        <div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
          <div style="font-size:10px;color:var(--gold-dim);letter-spacing:1px;margin-bottom:6px">📜 LỊCH SỬ GẦN ĐÂY</div>
          ${e.history.slice(-3).map(h => `
            <div style="display:flex;gap:8px;font-size:11px;padding:3px 0;border-left:2px solid rgba(250,204,21,0.15);padding-left:8px;margin-bottom:3px">
              <span style="color:var(--gold-dim);flex-shrink:0">Năm ${h.year}</span>
              <span style="color:var(--white-dim)">${h.event}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function _eeRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function eeShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="empires"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    eeInit();
    eeShowNavBtn();
    setInterval(function() {
      if (window.world) {
        eeTick();
        const active = document.querySelector('.nav-btn.active[data-panel="empires"]');
        if (active) eeRenderPanel();
      }
    }, 10000);
  }, 1500);
});

// ============================================================
// EMPIRE ENGINE V23 — EXPANSION PACK
// Vassal Tribute, Rebellion mechanics, WarEngine Integration
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Đảm bảo vassalKingdoms tồn tại ──
function eeEnsureVassals(emp) {
  if (!emp.vassalKingdoms) emp.vassalKingdoms = [];
  if (!emp.vassalTribute)  emp.vassalTribute  = {};
  if (!emp.vassalRebellionRisk) emp.vassalRebellionRisk = {};
}

// ── Thu Cống Từ Chư Hầu ──
function eeTributeVassals(emp) {
  if (!emp || emp.isCollapsed || !window.kingdomData) return;
  eeEnsureVassals(emp);

  let totalTribute = 0;
  const toRemove = [];

  emp.vassalKingdoms.forEach(vid => {
    const vassal = window.kingdomData.kingdoms[vid];
    if (!vassal || vassal.isCollapsed) { toRemove.push(vid); return; }

    // Cống phẩm: 8% kho bạc vassal mỗi tick
    const tribute = Math.floor(vassal.treasury * 0.08);
    if (tribute > 0 && vassal.treasury >= tribute) {
      vassal.treasury  -= tribute;
      emp.totalWealth  += tribute;
      totalTribute     += tribute;
      emp.vassalTribute[vid] = (emp.vassalTribute[vid] || 0) + tribute;
    }

    // Tính rủi ro nổi loạn chư hầu
    const loyaltyFactor = vassal.stability || 50;
    const riskDelta = loyaltyFactor < 30 ? 5 : loyaltyFactor > 70 ? -2 : 1;
    emp.vassalRebellionRisk[vid] = Math.max(0, Math.min(100,
      (emp.vassalRebellionRisk[vid] || 20) + riskDelta + Math.floor(Math.random() * 3 - 1)
    ));

    // Chư hầu nổi loạn nếu risk > 85
    if (emp.vassalRebellionRisk[vid] >= 85) {
      emp.vassalRebellionRisk[vid] = 0;
      emp.rebellionRisk = Math.min(100, emp.rebellionRisk + 15);
      emp.stability     = Math.max(0, emp.stability - 10);
      vassal.empireId   = null;
      toRemove.push(vid);

      const msg = `🔥 Chư hầu ${vassal.kingdomName} NỔI LOẠN thoát khỏi ${emp.empireName}!`;
      if (typeof addLog === "function") addLog(msg, "death");
      if (typeof htAddEvent === "function") htAddEvent({ type:"vassal_rebellion", text: msg, empireId: emp.empireId, importance:"high" });
      if (typeof _we_setMutualRelation === "function") {
        try { _we_setMutualRelation(emp.empireId, vid, "hostile"); } catch(e2) {}
      }
      if (typeof wmeRemember_war === "function") {
        try { wmeRemember_war(vid, emp.empireId); } catch(e2) {}
      }
    }
  });

  // Xóa các vassal đã mất
  toRemove.forEach(vid => {
    const idx = emp.vassalKingdoms.indexOf(vid);
    if (idx >= 0) emp.vassalKingdoms.splice(idx, 1);
  });

  if (totalTribute > 0) {
    emp.influence += Math.floor(totalTribute / 5000);
  }
}

// ── Quản lý thành viên chính thức ──
function eeManageMembers(emp) {
  if (!emp || emp.isCollapsed || !window.kingdomData) return;
  const toRemove = [];
  emp.memberKingdoms.forEach(kid => {
    const kingdom = window.kingdomData.kingdoms[kid];
    if (!kingdom || kingdom.isCollapsed) {
      toRemove.push(kid);
      return;
    }
    // Vương quốc thành viên đóng góp vào đế quốc mỗi tick
    const contrib = Math.floor(kingdom.population * 0.001 + kingdom.treasury * 0.002);
    emp.totalWealth     += contrib;
    emp.totalPopulation  = emp.memberKingdoms.reduce((s, mid) => {
      const mk = window.kingdomData.kingdoms[mid];
      return s + (mk && !mk.isCollapsed ? mk.population : 0);
    }, 0);
    // Tăng nguy cơ ly khai nếu ổn định thấp
    if ((kingdom.stability || 50) < 25) {
      kingdom.collapseRisk = (kingdom.collapseRisk || 0) + 3;
      emp.rebellionRisk    = Math.min(100, emp.rebellionRisk + 2);
    }
  });
  toRemove.forEach(kid => {
    const idx = emp.memberKingdoms.indexOf(kid);
    if (idx >= 0) emp.memberKingdoms.splice(idx, 1);
  });
}

// ── Đế quốc chinh phục bằng chiến tranh ──
function eeConquestWar(emp) {
  if (!emp || emp.isCollapsed || !window.kingdomData) return;
  if (emp.memberKingdoms.length >= 10) return; // đã đủ lớn
  if (emp.totalWealth < 120000 || emp.totalArmy < 25000) return;

  const targets = Object.values(window.kingdomData.kingdoms).filter(k =>
    !k.isCollapsed &&
    !k.empireId &&
    k.militaryPower < emp.totalArmy * 0.25 &&
    (k.stability || 50) < 40
  );
  if (targets.length === 0) return;

  const target = targets[Math.floor(Math.random() * targets.length)];
  const year = window.year || 0;

  emp.totalWealth -= 120000;
  emp.totalArmy   -= 15000;
  target.empireId  = emp.empireId;
  target.stability = Math.max(0, (target.stability || 50) - 25);
  emp.memberKingdoms.push(target.kingdomId);
  emp.totalPopulation += target.population;
  emp.totalWealth     += target.treasury * 0.4;
  emp.influence       += 80;

  const msg = `⚔️👑 ${emp.empireName} CHINH PHỤC ${target.kingdomName} qua chiến tranh! (+${emp.memberKingdoms.length} kingdoms)`;
  if (typeof addLog === "function") addLog(msg, "death");
  if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_conquest", text: msg, empireId: emp.empireId, importance:"high" });
  emp.history.push({ year, event: msg });

  if (typeof _we_setMutualRelation === "function") {
    try { _we_setMutualRelation(emp.empireId, target.kingdomId, "conquered"); } catch(e2) {}
  }
  if (typeof wmeRemember_war === "function") {
    try { wmeRemember_war(emp.empireId, target.kingdomId); } catch(e2) {}
  }
  if (typeof keSave === "function") keSave();
}

// ── Kiểm tra sụp đổ đế quốc ──
function eeCheckCollapse_v23(emp) {
  if (!emp || emp.isCollapsed) return;
  // Sụp đổ khi không còn thành viên hoặc rebellion risk cực cao
  if (emp.memberKingdoms.length === 0 && (emp.vassalKingdoms || []).length === 0) {
    emp.stability      = Math.max(0, emp.stability - 5);
    emp.rebellionRisk  = Math.min(100, emp.rebellionRisk + 10);
  }
  if (emp.rebellionRisk >= 95 && emp.stability < 10) {
    emp.isCollapsed = true;
    const year = window.year || 0;
    const msg  = `💀 Đế Quốc ${emp.empireName} SỤPĐỔ sau nổi loạn toàn diện!`;
    if (typeof addLog === "function") addLog(msg, "death");
    if (typeof htAddEvent === "function") htAddEvent({ year, type:"empire_collapsed", text: msg, empireId: emp.empireId, importance:"high" });
    // Giải phóng các thành viên
    if (window.kingdomData) {
      [...(emp.memberKingdoms || []), ...(emp.vassalKingdoms || [])].forEach(kid => {
        const k = window.kingdomData.kingdoms[kid];
        if (k) k.empireId = null;
      });
    }
  }
}

// ── Tick mở rộng Empire V23 ──
function eeTick_v23_expansion() {
  if (!window.empireData) return;
  Object.values(window.empireData.empires).forEach(emp => {
    if (emp.isCollapsed) return;
    eeEnsureVassals(emp);
    eeTributeVassals(emp);
    eeManageMembers(emp);
    // 20% cơ hội thực hiện chiến tranh chinh phục mỗi tick
    if (Math.random() < 0.2) eeConquestWar(emp);
    eeCheckCollapse_v23(emp);
  });
  if (typeof eeSave === "function") eeSave();
}

// ── Patch vào eeTick ──
const _eeTick_orig = typeof eeTick === "function" ? eeTick : null;
function eeTick_patched() {
  if (_eeTick_orig) _eeTick_orig();
  eeTick_v23_expansion();
}
if (typeof eeTick === "function") window.eeTick = eeTick_patched;

// ── Lấy thông tin vassal ──
function eeGetVassalInfo(emp) {
  if (!emp || !window.kingdomData) return [];
  eeEnsureVassals(emp);
  return emp.vassalKingdoms.map(vid => {
    const v = window.kingdomData.kingdoms[vid];
    return {
      id:        vid,
      name:      v ? v.kingdomName : vid,
      tribute:   emp.vassalTribute[vid] || 0,
      rebellion: emp.vassalRebellionRisk[vid] || 0,
      stability: v ? v.stability : 0,
    };
  });
}

window.eeTributeVassals    = eeTributeVassals;
window.eeConquestWar       = eeConquestWar;
window.eeGetVassalInfo     = eeGetVassalInfo;
window.eeTick_v23_expansion = eeTick_v23_expansion;
