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
