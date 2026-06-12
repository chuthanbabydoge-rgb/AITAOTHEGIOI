// ============================================================
// RANKINGS ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Bảng Xếp Hạng Thời Gian Thực — Kingdoms & Empires
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const RK_SAVE_KEY = "cgv6_rankings";
const RK_VERSION  = 23;

// ── INIT ──
function rkInit() {
  if (!window.rankingsData) {
    const saved = localStorage.getItem(RK_SAVE_KEY);
    window.rankingsData = saved ? JSON.parse(saved) : {
      snapshot:  null,
      history:   [],
      version:   RK_VERSION,
    };
  }
  if (!window.rankingsData.history) window.rankingsData.history = [];
}

function rkSave() {
  try { localStorage.setItem(RK_SAVE_KEY, JSON.stringify(window.rankingsData)); } catch(e) {}
}

// ── Tính toán bảng xếp hạng ──
function rkCompute() {
  if (!window.rankingsData) rkInit();

  const kingdoms = window.kingdomData ? Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed) : [];
  const empires  = window.empireData  ? Object.values(window.empireData.empires).filter(e => !e.isCollapsed)   : [];

  // Kingdoms rankings
  const richestKingdom   = [...kingdoms].sort((a,b) => b.treasury - a.treasury)[0]     || null;
  const strongestKingdom = [...kingdoms].sort((a,b) => b.militaryPower - a.militaryPower)[0] || null;
  const largestKingdom   = [...kingdoms].sort((a,b) => b.population - a.population)[0]  || null;
  const highestTech      = [...kingdoms].sort((a,b) => b.technologyLevel - a.technologyLevel)[0] || null;
  const oldestDynasty    = [...kingdoms].sort((a,b) => a.yearFounded - b.yearFounded)[0]  || null;
  const mostInfluential  = [...kingdoms].sort((a,b) => b.influence - a.influence)[0]     || null;
  const mostStable       = [...kingdoms].sort((a,b) => b.stability - a.stability)[0]      || null;
  const mostTerritory    = [...kingdoms].sort((a,b) => b.territoryCount - a.territoryCount)[0] || null;

  // Empires rankings
  const strongestEmpire  = [...empires].sort((a,b) => b.totalArmy - a.totalArmy)[0]        || null;
  const richestEmpire    = [...empires].sort((a,b) => b.totalWealth - a.totalWealth)[0]     || null;
  const largestEmpire    = [...empires].sort((a,b) => b.totalPopulation - a.totalPopulation)[0] || null;
  const mostKingdoms     = [...empires].sort((a,b) => b.memberKingdoms.length - a.memberKingdoms.length)[0] || null;
  const oldestEmpire     = [...empires].sort((a,b) => a.yearFounded - b.yearFounded)[0]     || null;
  const mostInfluentialEmpire = [...empires].sort((a,b) => b.influence - a.influence)[0]   || null;

  const snapshot = {
    computedYear: window.year || 0,
    kingdoms: {
      richest:    richestKingdom,
      strongest:  strongestKingdom,
      largest:    largestKingdom,
      highestTech,
      oldestDynasty,
      mostInfluential,
      mostStable,
      mostTerritory,
      all:        [...kingdoms].sort((a,b) => (b.influence + b.militaryPower/100 + b.population/1000) - (a.influence + a.militaryPower/100 + a.population/1000)).slice(0,10),
    },
    empires: {
      strongest:  strongestEmpire,
      richest:    richestEmpire,
      largest:    largestEmpire,
      mostKingdoms,
      oldest:     oldestEmpire,
      mostInfluential: mostInfluentialEmpire,
      all:        [...empires].sort((a,b) => (b.totalArmy + b.totalWealth/1000 + b.totalPopulation/1000) - (a.totalArmy + a.totalWealth/1000 + a.totalPopulation/1000)).slice(0,5),
    },
    counts: {
      totalKingdoms: kingdoms.length,
      totalEmpires:  empires.length,
      totalNoblHouses: window.nobleHouseData ? Object.values(window.nobleHouseData.houses).filter(h => !h.isExtinct).length : 0,
      totalBloodlines: window.bloodlineData  ? Object.values(window.bloodlineData.bloodlines).filter(bl => !bl.isExtinct).length : 0,
    },
  };

  window.rankingsData.snapshot = snapshot;
  rkSave();
  return snapshot;
}

// ── TICK ──
function rkTick() {
  rkCompute();
}

// ── RENDER PANEL ──
function rkRenderPanel() {
  const panel = document.getElementById("panel-rankings");
  if (!panel) return;
  if (!window.rankingsData) rkInit();

  const snap = rkCompute();
  const k    = snap.kingdoms;
  const e    = snap.empires;
  const c    = snap.counts;

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="rkTick();rkRenderPanel()">🔄 Cập Nhật Xếp Hạng</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">Năm ${snap.computedYear} · ${c.totalKingdoms} vương quốc · ${c.totalEmpires} đế quốc</span>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[
        ["🏰","Vương Quốc",   c.totalKingdoms,  "#facc15"],
        ["👑","Đế Quốc",      c.totalEmpires,   "#c084fc"],
        ["🏛️","Gia Tộc QT",   c.totalNoblHouses,"#60a5fa"],
        ["🧬","Huyết Mạch",   c.totalBloodlines,"#4ade80"],
      ].map(([icon,label,val,color]) => `
        <div class="card" style="padding:10px;text-align:center;border-top:2px solid ${color}">
          <div style="font-size:20px;margin-bottom:4px">${icon}</div>
          <div style="font-size:22px;font-weight:900;color:${color}">${val}</div>
          <div style="font-size:9px;color:var(--white-dim)">${label}</div>
        </div>
      `).join("")}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <!-- Kingdom Rankings -->
      <div class="card">
        <div class="card-title">🏰 Bảng Xếp Hạng Vương Quốc</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${[
            ["💰","Giàu Nhất",    k.richest,      r => r ? (r.treasury/1000).toFixed(0)+"K vàng"     : "—"],
            ["⚔️","Mạnh Nhất",    k.strongest,    r => r ? (r.militaryPower/1000).toFixed(0)+"K quân": "—"],
            ["👥","Đông Nhất",    k.largest,      r => r ? (r.population/1000).toFixed(0)+"K dân"    : "—"],
            ["🔬","Kỹ Thuật Cao", k.highestTech,  r => r ? "Cấp "+r.technologyLevel               : "—"],
            ["📅","Cổ Xưa Nhất",  k.oldestDynasty,r => r ? "Năm "+r.yearFounded                   : "—"],
            ["🌟","Ảnh Hưởng",    k.mostInfluential, r => r ? r.influence+" điểm"                 : "—"],
            ["🛡️","Ổn Định Nhất", k.mostStable,   r => r ? r.stability+"%"                        : "—"],
            ["🗺️","Lãnh Thổ",     k.mostTerritory,r => r ? r.territoryCount+" vùng"               : "—"],
          ].map(([icon, label, rank, fmtFn]) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.04)">
              <span style="font-size:14px;flex-shrink:0">${icon}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:9px;color:var(--white-dim);letter-spacing:.5px">${label}</div>
                <div style="font-size:12px;font-weight:700;color:var(--white-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${rank ? rank.kingdomName : "—"}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:11px;color:var(--gold);font-weight:700">${fmtFn(rank)}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Empire Rankings -->
      <div class="card">
        <div class="card-title">👑 Bảng Xếp Hạng Đế Quốc</div>
        ${e.all.length === 0 ? `
          <div style="text-align:center;padding:30px;color:var(--white-dim)">
            <div style="font-size:36px;margin-bottom:8px">🌌</div>
            <div style="font-size:12px">Chưa có đế quốc nào được hình thành.</div>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${[
              ["⚔️","Quân Đội Mạnh", e.strongest,     r => r ? r.totalArmy.toLocaleString()+" quân" : "—"],
              ["💰","Giàu Nhất",     e.richest,        r => r ? (r.totalWealth/1000).toFixed(0)+"K vàng" : "—"],
              ["👥","Đông Nhất",     e.largest,        r => r ? (r.totalPopulation/1000000).toFixed(1)+"M dân" : "—"],
              ["🏰","Nhiều VQ Nhất", e.mostKingdoms,   r => r ? r.memberKingdoms.length+" kingdoms" : "—"],
              ["📅","Cổ Xưa Nhất",  e.oldest,         r => r ? "Năm "+r.yearFounded : "—"],
              ["🌟","Ảnh Hưởng",    e.mostInfluential, r => r ? r.influence+" điểm" : "—"],
            ].map(([icon,label,rank,fmtFn]) => `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(250,204,21,0.02);border-radius:8px;border:1px solid rgba(250,204,21,0.06)">
                <span style="font-size:14px;flex-shrink:0">${icon}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:9px;color:var(--white-dim);letter-spacing:.5px">${label}</div>
                  <div style="font-size:12px;font-weight:700;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${rank ? rank.empireName : "—"}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:11px;color:var(--white-main);font-weight:700">${fmtFn(rank)}</div>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    </div>

    <!-- Top 10 Kingdoms Leaderboard -->
    <div class="card">
      <div class="card-title">🏆 Top 10 Vương Quốc Hùng Mạnh Nhất</div>
      ${k.all.length === 0 ? `<div style="text-align:center;padding:24px;color:var(--white-dim)">Chưa có vương quốc nào.</div>` : `
        <div style="display:flex;flex-direction:column;gap:4px">
          ${k.all.map((kingdom, idx) => {
            const medals = ["🥇","🥈","🥉"];
            const medal  = medals[idx] || `${idx+1}.`;
            const score  = Math.floor(kingdom.influence + kingdom.militaryPower/100 + kingdom.population/1000);
            const stageColor = ["#94a3b8","#60a5fa","#4ade80","#facc15","#f87171"][kingdom.stageIndex] || "#facc15";
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:8px;transition:background .15s" onmouseenter="this.style.background='rgba(255,255,255,0.04)'" onmouseleave="this.style.background='rgba(255,255,255,0.02)'">
                <span style="font-size:16px;width:28px;text-align:center;flex-shrink:0">${medal}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:700;color:var(--white-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${kingdom.kingdomName}</div>
                  <div style="font-size:10px;color:var(--white-dim)">${kingdom.dynasty} · ${kingdom.capitalCity}</div>
                </div>
                <span style="font-size:9px;padding:2px 8px;border-radius:10px;background:${stageColor}18;border:1px solid ${stageColor}44;color:${stageColor};flex-shrink:0">${["Làng","Thị Trấn","T.Phố","Vương Quốc","Đế Vương"][kingdom.stageIndex]||"?"}</span>
                <div style="text-align:right;flex-shrink:0;min-width:60px">
                  <div style="font-size:14px;font-weight:800;color:var(--gold)">${score.toLocaleString()}</div>
                  <div style="font-size:9px;color:var(--white-dim)">Điểm tổng</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>

    <!-- Top Empires Leaderboard -->
    ${e.all.length > 0 ? `
      <div class="card" style="margin-top:14px">
        <div class="card-title">👑 Bảng Xếp Hạng Đế Quốc — Top ${e.all.length}</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${e.all.map((empire, idx) => {
            const medals = ["🥇","🥈","🥉"];
            const medal  = medals[idx] || `${idx+1}.`;
            const score  = Math.floor(empire.totalArmy + empire.totalWealth/1000 + empire.totalPopulation/1000);
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(250,204,21,0.03);border:1px solid rgba(250,204,21,0.08);border-radius:8px">
                <span style="font-size:16px;width:28px;text-align:center;flex-shrink:0">${medal}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:700;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${empire.empireName}</div>
                  <div style="font-size:10px;color:var(--white-dim)">${empire.imperialDynasty} · ${empire.memberKingdoms.length} kingdoms · Hoàng đế: ${empire.emperor}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:14px;font-weight:800;color:var(--white-main)">${score.toLocaleString()}</div>
                  <div style="font-size:9px;color:var(--white-dim)">Điểm tổng</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    ` : ""}
  `;
}

function rkShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="rankings"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    rkInit();
    rkShowNavBtn();
    setInterval(function() {
      if (window.world) {
        rkTick();
        const active = document.querySelector('.nav-btn.active[data-panel="rankings"]');
        if (active) rkRenderPanel();
      }
    }, 20000);
  }, 2500);
});

// ============================================================
// RANKINGS ENGINE V23 — EXPANSION PACK
// Dynasty Records, Bloodline Heroes, Noble House Prestige,
// Historical Records Panel, Awards & Milestones
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Hồ sơ lịch sử — những kỷ lục vĩnh viễn ──
const RK_RECORDS_KEY = "cgv6_rk_records";

function rkLoadRecords() {
  if (!window.rkRecords) {
    try {
      const saved = localStorage.getItem(RK_RECORDS_KEY);
      window.rkRecords = saved ? JSON.parse(saved) : {
        mostWarsWon:        { id: null, name: "—", value: 0 },
        longestDynasty:     { id: null, name: "—", value: 0, start: 0 },
        greatestConqueror:  { id: null, name: "—", value: 0 },
        richestEver:        { id: null, name: "—", value: 0 },
        mostWonders:        { id: null, name: "—", value: 0 },
        highestLegend:      { id: null, name: "—", value: 0 },
        mostBloodlineMutations: { id: null, name: "—", value: 0 },
        mostHolyWars:       { id: null, name: "—", value: 0 },
      };
    } catch(e) { window.rkRecords = {}; }
  }
  return window.rkRecords;
}

function rkSaveRecords() {
  try { localStorage.setItem(RK_RECORDS_KEY, JSON.stringify(window.rkRecords)); } catch(e) {}
}

// ── Cập nhật kỷ lục lịch sử ──
function rkUpdateRecords() {
  rkLoadRecords();
  const rec = window.rkRecords;
  const kingdoms = window.kingdomData ? Object.values(window.kingdomData.kingdoms) : [];
  const empires  = window.empireData  ? Object.values(window.empireData.empires)   : [];
  const bloodlines = window.bloodlineData ? Object.values(window.bloodlineData.bloodlines) : [];

  // Vương quốc chinh phục nhiều nhất (dựa vào territoryCount)
  kingdoms.forEach(k => {
    if ((k.territoryCount || 0) > (rec.greatestConqueror.value || 0)) {
      rec.greatestConqueror = { id: k.kingdomId, name: k.kingdomName, value: k.territoryCount };
    }
    if ((k.treasury || 0) > (rec.richestEver.value || 0)) {
      rec.richestEver = { id: k.kingdomId, name: k.kingdomName, value: k.treasury };
    }
    // Triều đại lâu đời nhất
    const age = (window.year || 0) - (k.yearFounded || 0);
    if (age > (rec.longestDynasty.value || 0)) {
      rec.longestDynasty = { id: k.kingdomId, name: k.kingdomName + " (" + k.dynasty + ")", value: age, start: k.yearFounded };
    }
    if ((k.convertedProvinces || 0) > (rec.mostHolyWars.value || 0)) {
      rec.mostHolyWars = { id: k.kingdomId, name: k.kingdomName, value: k.convertedProvinces };
    }
  });

  // Đế quốc kỳ quan nhiều nhất
  empires.forEach(e => {
    if ((e.wonders || []).length > (rec.mostWonders.value || 0)) {
      rec.mostWonders = { id: e.empireId, name: e.empireName, value: e.wonders.length };
    }
  });

  // Huyết mạch huyền thoại
  bloodlines.forEach(bl => {
    if ((bl.legendScore || 0) > (rec.highestLegend.value || 0)) {
      rec.highestLegend = { id: bl.bloodlineId, name: bl.bloodlineName, value: bl.legendScore };
    }
    if ((bl.mutations || []).length > (rec.mostBloodlineMutations.value || 0)) {
      rec.mostBloodlineMutations = { id: bl.bloodlineId, name: bl.bloodlineName, value: bl.mutations.length };
    }
  });

  rkSaveRecords();
}

// ── Tab panel mở rộng ──
function rkRenderExtendedPanel() {
  const panel = document.getElementById("panel-rankings");
  if (!panel) return;

  // Lấy tab hiện tại
  const activeTab = (window._rkActiveTab || "overview");

  const snap    = rkCompute();
  const c       = snap.counts;
  rkUpdateRecords();
  const rec     = window.rkRecords || {};

  const TABS = [
    { id:"overview",    label:"📊 Tổng Quan"    },
    { id:"kingdoms",    label:"🏰 Vương Quốc"   },
    { id:"empires",     label:"👑 Đế Quốc"      },
    { id:"houses",      label:"🏛️ Gia Tộc"      },
    { id:"bloodlines",  label:"🧬 Huyết Mạch"   },
    { id:"records",     label:"🏆 Kỷ Lục"       },
  ];

  const tabHtml = `
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
      ${TABS.map(t => `
        <button class="btn-${activeTab===t.id?"primary":"secondary"}" 
          style="padding:5px 12px;font-size:11px"
          onclick="window._rkActiveTab='${t.id}';rkRenderExtendedPanel()">${t.label}</button>
      `).join("")}
      <span style="margin-left:auto;font-size:11px;color:var(--white-dim);align-self:center">Năm ${snap.computedYear}</span>
    </div>
  `;

  let contentHtml = "";

  if (activeTab === "overview") {
    contentHtml = _rkTabOverview(snap, c);
  } else if (activeTab === "kingdoms") {
    contentHtml = _rkTabKingdoms(snap);
  } else if (activeTab === "empires") {
    contentHtml = _rkTabEmpires(snap);
  } else if (activeTab === "houses") {
    contentHtml = _rkTabHouses();
  } else if (activeTab === "bloodlines") {
    contentHtml = _rkTabBloodlines();
  } else if (activeTab === "records") {
    contentHtml = _rkTabRecords(rec);
  }

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="rkTick();rkRenderExtendedPanel()">🔄 Cập Nhật</button>
    </div>
    ${tabHtml}
    ${contentHtml}
  `;
}

function _rkTabOverview(snap, c) {
  const k = snap.kingdoms;
  const e = snap.empires;
  return `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[
        ["🏰","Vương Quốc",  c.totalKingdoms,  "#facc15"],
        ["👑","Đế Quốc",     c.totalEmpires,   "#c084fc"],
        ["🏛️","Gia Tộc",    c.totalNoblHouses,"#60a5fa"],
        ["🧬","Huyết Mạch", c.totalBloodlines,"#4ade80"],
      ].map(([icon,label,val,color]) => `
        <div class="card" style="padding:10px;text-align:center;border-top:2px solid ${color}">
          <div style="font-size:20px;margin-bottom:4px">${icon}</div>
          <div style="font-size:22px;font-weight:900;color:${color}">${val}</div>
          <div style="font-size:9px;color:var(--white-dim)">${label}</div>
        </div>
      `).join("")}
    </div>
    <div class="card">
      <div class="card-title">⚡ Thống Kê Nhanh</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
        <div><span style="color:var(--white-dim)">Vương quốc giàu nhất: </span><b style="color:var(--gold)">${k.richest ? k.richest.kingdomName : "—"}</b></div>
        <div><span style="color:var(--white-dim)">Mạnh nhất: </span><b style="color:#f87171">${k.strongest ? k.strongest.kingdomName : "—"}</b></div>
        <div><span style="color:var(--white-dim)">Đế quốc mạnh nhất: </span><b style="color:#c084fc">${e.strongest ? e.strongest.empireName : "—"}</b></div>
        <div><span style="color:var(--white-dim)">Ổn định nhất: </span><b style="color:#4ade80">${k.mostStable ? k.mostStable.kingdomName : "—"}</b></div>
      </div>
    </div>
    ${_rkReligionStats()}
  `;
}

function _rkReligionStats() {
  if (typeof keGetReligionStats !== "function") return "";
  const stats = keGetReligionStats();
  if (Object.keys(stats).length === 0) return "";
  const total = Object.values(stats).reduce((s,v) => s+v, 0) || 1;
  const KE_REL_COLORS = { tien_dao:"#60a5fa",ma_dao:"#f87171",phat_giao:"#facc15",vo_than:"#94a3b8",than_giao:"#4ade80",long_giao:"#c084fc" };
  const KE_REL_NAMES  = { tien_dao:"Tiên Đạo",ma_dao:"Ma Đạo",phat_giao:"Phật Giáo",vo_than:"Vô Thần",than_giao:"Thần Giáo",long_giao:"Long Giáo" };
  return `
    <div class="card" style="margin-top:12px">
      <div class="card-title">✝️ Phân Bố Tôn Giáo</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(stats).sort((a,b)=>b[1]-a[1]).map(([rid, count]) => {
          const pct = Math.round(count/total*100);
          const color = KE_REL_COLORS[rid] || "#94a3b8";
          const name  = KE_REL_NAMES[rid]  || rid;
          return `
            <div style="flex:1;min-width:90px;padding:8px;background:${color}18;border:1px solid ${color}44;border-radius:8px;text-align:center">
              <div style="font-size:15px;font-weight:800;color:${color}">${count}</div>
              <div style="font-size:9px;color:var(--white-dim)">${name}</div>
              <div style="font-size:9px;color:${color}">${pct}%</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function _rkTabKingdoms(snap) {
  const k = snap.kingdoms;
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div class="card">
        <div class="card-title">🏆 Top Chỉ Số Vương Quốc</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${[
            ["💰","Kho Bạc",   k.richest,       r => r ? (r.treasury/1000).toFixed(0)+"K vàng" : "—"],
            ["⚔️","Quân Sự",   k.strongest,     r => r ? (r.militaryPower/1000).toFixed(0)+"K sức mạnh" : "—"],
            ["👥","Dân Số",    k.largest,       r => r ? (r.population/1000).toFixed(1)+"K dân" : "—"],
            ["🔬","Kỹ Thuật",  k.highestTech,   r => r ? "Cấp "+r.technologyLevel : "—"],
            ["🗺️","Lãnh Thổ",  k.mostTerritory, r => r ? r.territoryCount+" vùng" : "—"],
            ["🌟","Ảnh Hưởng", k.mostInfluential,r => r ? r.influence+" điểm" : "—"],
            ["🛡️","Ổn Định",   k.mostStable,    r => r ? r.stability+"%" : "—"],
            ["📅","Cổ Xưa",    k.oldestDynasty, r => r ? "Năm "+r.yearFounded : "—"],
          ].map(([icon,label,rank,fmt]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(255,255,255,0.02);border-radius:6px">
              <span style="font-size:11px;color:var(--white-dim)">${icon} ${label}</span>
              <span style="font-size:11px;font-weight:700;color:var(--white-main)">${rank ? rank.kingdomName : "—"}</span>
              <span style="font-size:10px;color:var(--gold)">${fmt(rank)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-title">🏰 Top 10 Vương Quốc (Tổng Hợp)</div>
        ${k.all.length === 0 ? `<div style="text-align:center;padding:24px;color:var(--white-dim)">Chưa có dữ liệu.</div>` : `
          <div style="display:flex;flex-direction:column;gap:3px">
            ${k.all.slice(0,10).map((kk,i) => {
              const medals=["🥇","🥈","🥉"];
              const medal=medals[i]||(i+1+".").toString();
              const score=Math.floor(kk.influence+kk.militaryPower/100+kk.population/1000);
              const relColor = typeof KE_RELIGIONS !== "undefined" ? (KE_RELIGIONS.find(r=>r.id===kk.religion)||{color:"#94a3b8"}).color : "#94a3b8";
              const relEmoji = typeof KE_RELIGIONS !== "undefined" ? (KE_RELIGIONS.find(r=>r.id===kk.religion)||{emoji:"📿"}).emoji : "📿";
              return `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px">
                  <span style="font-size:14px;width:22px">${medal}</span>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:700;color:var(--white-main);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${kk.kingdomName}</div>
                    <div style="font-size:9px;color:var(--white-dim)">${kk.dynasty} ${relEmoji}</div>
                  </div>
                  <div style="font-size:13px;font-weight:800;color:var(--gold)">${score.toLocaleString()}</div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    </div>
  `;
}

function _rkTabEmpires(snap) {
  const e = snap.empires;
  if (e.all.length === 0) return `<div class="card"><div style="text-align:center;padding:40px;color:var(--white-dim)"><div style="font-size:36px">👑</div><div style="margin-top:8px">Chưa có đế quốc nào.</div></div></div>`;
  return `
    <div class="card">
      <div class="card-title">👑 Xếp Hạng Đế Quốc</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${e.all.map((emp,i) => {
          const medals=["🥇","🥈","🥉"];
          const medal=medals[i]||(i+1+".");
          const score=Math.floor((emp.totalArmy||0)+(emp.totalWealth||0)/1000+(emp.totalPopulation||0)/1000);
          const vassalCount = (emp.vassalKingdoms||[]).length;
          return `
            <div style="padding:10px 12px;background:rgba(250,204,21,0.04);border:1px solid rgba(250,204,21,0.1);border-radius:8px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                <span style="font-size:16px">${medal}</span>
                <div style="flex:1">
                  <div style="font-size:14px;font-weight:700;color:var(--gold)">${emp.empireName}</div>
                  <div style="font-size:10px;color:var(--white-dim)">${emp.imperialDynasty} · ${emp.emperor}</div>
                </div>
                <div style="font-size:15px;font-weight:800;color:var(--white-main)">${score.toLocaleString()}</div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:10px">
                <div style="text-align:center"><div style="color:var(--gold);font-weight:700">${emp.memberKingdoms.length}</div><div style="color:var(--white-dim)">Thành viên</div></div>
                <div style="text-align:center"><div style="color:#f87171;font-weight:700">${vassalCount}</div><div style="color:var(--white-dim)">Chư hầu</div></div>
                <div style="text-align:center"><div style="color:#4ade80;font-weight:700">${emp.stability}%</div><div style="color:var(--white-dim)">Ổn định</div></div>
                <div style="text-align:center"><div style="color:#c084fc;font-weight:700">${(emp.wonders||[]).length}</div><div style="color:var(--white-dim)">Kỳ quan</div></div>
              </div>
              ${(emp.wonders||[]).length>0?`<div style="margin-top:6px;font-size:9px;color:var(--white-dim)">🏛️ ${emp.wonders.join(" · ")}</div>`:""}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function _rkTabHouses() {
  const rankings = typeof nhGetRankings === "function" ? nhGetRankings() : [];
  if (rankings.length === 0) {
    const raw = window.nobleHouseData ? Object.values(window.nobleHouseData.houses).filter(h=>!h.isExtinct) : [];
    if (raw.length === 0) return `<div class="card"><div style="text-align:center;padding:40px;color:var(--white-dim)"><div style="font-size:36px">🏛️</div><div style="margin-top:8px">Chưa có gia tộc nào.</div></div></div>`;
    return `<div class="card"><div class="card-title">🏛️ Gia Tộc Quý Tộc</div><div style="color:var(--white-dim);padding:12px;font-size:12px">${raw.length} gia tộc đang hoạt động.</div></div>`;
  }
  return `
    <div class="card">
      <div class="card-title">🏛️ Top Gia Tộc Quý Tộc</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${rankings.map((h,i) => {
          const medals=["🥇","🥈","🥉"];
          const medal=medals[i]||(i+1+".");
          const score=Math.floor((h.prestige||0)+(h.wealth||0)/10000+(h.gloryPoints||0));
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(96,165,250,0.04);border:1px solid rgba(96,165,250,0.1);border-radius:8px">
              <span style="font-size:14px;width:22px">${medal}</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:#60a5fa">${h.houseName}</div>
                <div style="font-size:9px;color:var(--white-dim)">${h.faction||"—"} · Prestige ${h.prestige||0} · Chiến: ${h.warCount||0}</div>
              </div>
              <div style="font-size:13px;font-weight:800;color:var(--white-main)">${score.toLocaleString()}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function _rkTabBloodlines() {
  const heroes = typeof blGetHeroRankings === "function" ? blGetHeroRankings() : [];
  if (heroes.length === 0) {
    const raw = window.bloodlineData ? Object.values(window.bloodlineData.bloodlines).filter(b=>!b.isExtinct) : [];
    if (raw.length === 0) return `<div class="card"><div style="text-align:center;padding:40px;color:var(--white-dim)"><div style="font-size:36px">🧬</div><div style="margin-top:8px">Chưa có huyết mạch nào.</div></div></div>`;
    return `<div class="card"><div class="card-title">🧬 Huyết Mạch</div><div style="color:var(--white-dim);padding:12px;font-size:12px">${raw.length} huyết mạch đang hoạt động.</div></div>`;
  }
  return `
    <div class="card">
      <div class="card-title">🧬 Huyết Mạch Huyền Thoại</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${heroes.map((bl,i) => {
          const medals=["🥇","🥈","🥉"];
          const medal=medals[i]||(i+1+".");
          const mutations = typeof blGetMutationDetails==="function" ? blGetMutationDetails(bl) : [];
          const rarityColor = bl.rarity==="Huyền Thoại"?"#f59e0b":bl.rarity==="Siêu Hiếm"?"#c084fc":"#4ade80";
          return `
            <div style="padding:10px 12px;background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.1);border-radius:8px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
                <span style="font-size:14px;width:22px">${medal}</span>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:700;color:#4ade80">${bl.bloodlineName}</div>
                  <div style="font-size:9px;color:${rarityColor}">${bl.rarity||"Thường"} · Trận: ${bl.battleCount||0} · Glory: ${bl.warGlory||0}</div>
                </div>
                <div style="font-size:13px;font-weight:800;color:var(--gold)">${(bl.legendScore||0).toLocaleString()}</div>
              </div>
              ${mutations.length>0?`<div style="font-size:9px;color:var(--white-dim)">Đột biến: ${mutations.map(m=>m.emoji+m.name).join(" · ")}</div>`:""}
              ${(bl.heroTitles||[]).length>0?`<div style="font-size:9px;color:#facc15;margin-top:3px">🌟 ${bl.heroTitles.slice(0,3).join(" · ")}</div>`:""}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function _rkTabRecords(rec) {
  const entries = [
    ["🗺️","Đại Chinh Phục",     rec.greatestConqueror,  r => r.value+" vùng lãnh thổ"],
    ["💰","Kho Bạc Vĩ Đại",      rec.richestEver,         r => (r.value/1000).toFixed(0)+"K vàng"],
    ["📅","Triều Đại Trường Tồn", rec.longestDynasty,      r => r.value+" năm"],
    ["🏛️","Kỳ Quan Nhiều Nhất",  rec.mostWonders,         r => r.value+" kỳ quan"],
    ["🌟","Huyết Mạch Huyền Thoại",rec.highestLegend,     r => r.value+" điểm legend"],
    ["🧬","Đột Biến Nhiều Nhất",  rec.mostBloodlineMutations, r => r.value+" đột biến"],
    ["✝️","Truyền Giáo Nhất",     rec.mostHolyWars,        r => r.value+" tỉnh chuyển đổi"],
  ];
  return `
    <div class="card">
      <div class="card-title">🏆 Kỷ Lục Lịch Sử Muôn Đời</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${entries.map(([icon, label, rec, fmtFn]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(250,204,21,0.03);border:1px solid rgba(250,204,21,0.08);border-radius:8px">
            <span style="font-size:18px;flex-shrink:0">${icon}</span>
            <div style="flex:1">
              <div style="font-size:9px;color:var(--white-dim);letter-spacing:.5px">${label}</div>
              <div style="font-size:13px;font-weight:700;color:var(--white-main)">${rec && rec.value > 0 ? rec.name : "— Chưa xác lập —"}</div>
            </div>
            <div style="font-size:11px;font-weight:700;color:var(--gold);flex-shrink:0">${rec && rec.value > 0 ? fmtFn(rec) : ""}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Patch rkRenderPanel để dùng phiên bản mở rộng ──
window.rkRenderPanel = rkRenderExtendedPanel;
window._rkActiveTab  = "overview";

window.rkRenderExtendedPanel = rkRenderExtendedPanel;
window.rkUpdateRecords       = rkUpdateRecords;
window.rkLoadRecords         = rkLoadRecords;
