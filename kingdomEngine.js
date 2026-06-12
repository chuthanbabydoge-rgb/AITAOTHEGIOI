// ============================================================
// KINGDOM ENGINE V23
// CREATOR GOD — V23 EMPIRE & KINGDOM ENGINE
// Hệ thống Vương Quốc sống động — Sinh từ làng đến Đế Quốc
// Tương thích 100% save cũ — KHÔNG xóa dữ liệu
// ============================================================

const KE_SAVE_KEY = "cgv6_kingdoms";
const KE_VERSION  = 23;

// ── Cấp độ phát triển ──
const KE_STAGES = ["Làng", "Thị Trấn", "Thành Phố", "Vương Quốc", "Đế Vương"];
const KE_STAGE_POP = [0, 1000, 5000, 20000, 100000];

// ── Danh hiệu vua theo cấp ──
const KE_RULER_TITLE = ["Trưởng Làng", "Thị Trưởng", "Lãnh Chúa", "Quốc Vương", "Hoàng Đế"];

// ── Tên triều đại mẫu ──
const KE_DYNASTY_PREFIXES = ["Kim","Ngọc","Thiên","Long","Phượng","Hắc","Bạch","Hồng","Thanh","Tử","Huyền","Minh"];
const KE_DYNASTY_SUFFIXES = ["Triều","Đại","Vương Triều","Quốc","Đế"];

// ── Tên vương quốc mẫu ──
const KE_KINGDOM_NAMES = [
  "Thiên Long Quốc","Phượng Hoàng Đế Quốc","Hắc Ám Vương Quốc","Thần Kiếm Quốc",
  "Rồng Vàng Vương Quốc","Băng Hỏa Đế Quốc","Lôi Phong Quốc","Mặt Trời Quốc",
  "Huyền Vũ Vương Quốc","Thanh Long Đế Quốc","Bạch Hổ Quốc","Chu Tước Vương Quốc",
  "Đông Phương Đế Quốc","Tây Vực Vương Quốc","Nam Thiên Quốc","Bắc Minh Đế Quốc",
  "Vạn Kiếm Vương Quốc","Tiên Đào Quốc","Hỗn Độn Đế Quốc","Thái Cực Vương Quốc"
];

// ── Tên thủ đô mẫu ──
const KE_CAPITAL_NAMES = [
  "Thiên Kinh","Long Đô","Phượng Thành","Hắc Thành","Thần Kinh",
  "Kim Lăng","Ngọc Kinh","Thanh Đô","Băng Thành","Lôi Thành",
  "Minh Kinh","Huyền Đô","Tử Kinh","Bạch Thành","Hồng Đô"
];

// ── INIT ──
function keInit() {
  if (!window.kingdomData) {
    const saved = localStorage.getItem(KE_SAVE_KEY);
    window.kingdomData = saved ? JSON.parse(saved) : { kingdoms: {}, idCounter: 0, version: KE_VERSION };
  }
  if (!window.kingdomData.kingdoms)    window.kingdomData.kingdoms   = {};
  if (!window.kingdomData.idCounter)   window.kingdomData.idCounter  = 0;
  if (!window.kingdomData.version)     window.kingdomData.version    = KE_VERSION;

  // Ánh xạ countries hiện có thành kingdoms
  (window.countries || []).forEach(c => {
    if (!c.collapsed) keMigrateFromCountry(c);
  });
}

function keSave() {
  try { localStorage.setItem(KE_SAVE_KEY, JSON.stringify(window.kingdomData)); } catch(e) {}
}

// ── Tạo kingdom từ country hiện có ──
function keMigrateFromCountry(c) {
  if (!window.kingdomData) return;
  const existingId = Object.keys(window.kingdomData.kingdoms).find(k =>
    window.kingdomData.kingdoms[k].sourceCountryId === c.id
  );
  if (existingId) return; // đã có

  const pop  = c.population || Math.floor(Math.random() * 50000 + 5000);
  const stageIdx = keGetStage(pop);
  const kId  = "k" + (++window.kingdomData.idCounter);

  window.kingdomData.kingdoms[kId] = keCreateKingdom({
    kingdomId:       kId,
    kingdomName:     c.name || _keRandItem(KE_KINGDOM_NAMES),
    capitalCity:     c.capital || _keRandItem(KE_CAPITAL_NAMES),
    sourceCountryId: c.id,
    dynasty:         keGenerateDynastyName(c.name || ""),
    population:      pop,
    treasury:        c.economy    || Math.floor(Math.random() * 50000 + 10000),
    militaryPower:   c.military   || Math.floor(Math.random() * 30000 + 5000),
    technologyLevel: Math.floor(Math.random() * 5 + 1),
    religion:        c.religion   || "Vô Tôn Giáo",
    territoryCount:  Math.floor(Math.random() * 8 + 1),
    stability:       Math.floor(Math.random() * 40 + 60),
    stageIndex:      stageIdx,
    yearFounded:     c.yearFounded || (window.year ? window.year - Math.floor(Math.random() * 200) : 1),
  });
}

// ── Tạo kingdom từ scratch ──
function keCreateKingdomFresh() {
  if (!window.kingdomData) keInit();
  const kId = "k" + (++window.kingdomData.idCounter);
  const name = _keRandItem(KE_KINGDOM_NAMES);
  const pop  = Math.floor(Math.random() * 30000 + 5000);
  const k = keCreateKingdom({
    kingdomId:       kId,
    kingdomName:     name,
    capitalCity:     _keRandItem(KE_CAPITAL_NAMES),
    dynasty:         keGenerateDynastyName(name),
    population:      pop,
    treasury:        Math.floor(Math.random() * 50000 + 10000),
    militaryPower:   Math.floor(Math.random() * 20000 + 5000),
    technologyLevel: Math.floor(Math.random() * 3 + 1),
    religion:        "Tự Nhiên Đạo",
    territoryCount:  Math.floor(Math.random() * 5 + 1),
    stability:       Math.floor(Math.random() * 30 + 60),
    stageIndex:      keGetStage(pop),
    yearFounded:     window.year || 1,
  });
  window.kingdomData.kingdoms[kId] = k;
  htAddEvent({ year: window.year || 0, type: "kingdom_founded", text: `🏰 Vương quốc ${k.kingdomName} được thành lập tại ${k.capitalCity}.`, kingdomId: kId });
  if (typeof addLog === "function") addLog(`🏰 Vương quốc ${k.kingdomName} được khai lập!`, "important");
  keSave();
  return k;
}

function keCreateKingdom(opts) {
  return {
    kingdomId:       opts.kingdomId,
    kingdomName:     opts.kingdomName,
    kingdomTitle:    KE_RULER_TITLE[opts.stageIndex] || "Quốc Vương",
    capitalCity:     opts.capitalCity,
    sourceCountryId: opts.sourceCountryId || null,
    ruler:           opts.ruler || keGenerateRuler(opts.stageIndex),
    dynasty:         opts.dynasty,
    treasury:        opts.treasury       || 10000,
    population:      opts.population     || 5000,
    territoryCount:  opts.territoryCount || 1,
    militaryPower:   opts.militaryPower  || 5000,
    influence:       opts.influence      || Math.floor(opts.militaryPower / 100) || 50,
    religion:        opts.religion       || "Vô Tôn Giáo",
    technologyLevel: opts.technologyLevel || 1,
    stability:       opts.stability      || 75,
    age:             0,
    stageIndex:      opts.stageIndex     || 0,
    yearFounded:     opts.yearFounded    || (window.year || 1),
    history:         [],
    allies:          [],
    enemies:         [],
    vassals:         [],
    empireId:        null,
    isCollapsed:     false,
    taxes:           Math.floor(Math.random() * 20 + 10),
    armySize:        Math.floor((opts.militaryPower || 5000) / 100),
    collapseRisk:    0,
  };
}

function keGenerateRuler(stageIdx) {
  const firstNames = ["Thiên","Long","Phượng","Hắc","Bạch","Kim","Ngọc","Huyền","Minh","Thanh"];
  const lastNames  = ["Đế","Vương","Quân","Tôn","Hoàng","Bá"];
  return {
    name:       _keRandItem(firstNames) + " " + _keRandItem(lastNames),
    age:        Math.floor(Math.random() * 40 + 20),
    gender:     Math.random() > 0.3 ? "Nam" : "Nữ",
    rulerType:  _keRandItem(["Minh Quân","Bạo Quân","Hôn Quân","Bình Quân"]),
    crownedYear: window.year || 1,
    ambition:   Math.floor(Math.random() * 100),
    legitimacy: Math.floor(Math.random() * 50 + 50),
  };
}

function keGenerateDynastyName(baseName) {
  const prefix = baseName.slice(0,2) || _keRandItem(KE_DYNASTY_PREFIXES);
  return prefix + " " + _keRandItem(KE_DYNASTY_SUFFIXES);
}

function keGetStage(pop) {
  for (let i = KE_STAGE_POP.length - 1; i >= 0; i--) {
    if (pop >= KE_STAGE_POP[i]) return i;
  }
  return 0;
}

// ── TICK: Chạy mỗi năm ──
function keTick() {
  if (!window.kingdomData) return;
  const kingdoms = window.kingdomData.kingdoms;
  const year = window.year || 0;

  Object.values(kingdoms).forEach(k => {
    if (k.isCollapsed) return;

    k.age = year - k.yearFounded;

    // Thu thuế
    const taxIncome = Math.floor(k.population * k.taxes / 1000);
    k.treasury += taxIncome;

    // Tăng dân số
    const growthRate = (k.stability / 1000) + 0.02;
    k.population = Math.floor(k.population * (1 + growthRate));

    // Tăng ảnh hưởng
    k.influence += Math.floor(k.militaryPower / 5000) + Math.floor(k.technologyLevel / 2);

    // Chi phí quân sự
    const militaryCost = Math.floor(k.armySize * 10);
    k.treasury -= militaryCost;

    // Ổn định
    if (k.treasury < 0) {
      k.stability = Math.max(0, k.stability - 5);
      k.collapseRisk += 5;
    } else {
      k.stability = Math.min(100, k.stability + 1);
      k.collapseRisk = Math.max(0, k.collapseRisk - 1);
    }

    // Nâng cấp giai đoạn
    const newStage = keGetStage(k.population);
    if (newStage > k.stageIndex) {
      k.stageIndex = newStage;
      k.kingdomTitle = KE_RULER_TITLE[newStage] || "Quốc Vương";
      const stageLabel = KE_STAGES[newStage] || "Vương Quốc";
      const msg = `🏰 ${k.kingdomName} phát triển lên cấp: ${stageLabel}!`;
      if (typeof addLog === "function") addLog(msg, "important");
      htAddEvent({ year, type: "kingdom_upgrade", text: msg, kingdomId: k.kingdomId });
      k.history.push({ year, event: msg });
    }

    // Sụp đổ
    if (k.collapseRisk >= 100 || k.stability <= 0) {
      k.isCollapsed = true;
      const msg = `💀 Vương quốc ${k.kingdomName} sụp đổ! (Năm ${year})`;
      if (typeof addLog === "function") addLog(msg, "death");
      htAddEvent({ year, type: "kingdom_collapsed", text: msg, kingdomId: k.kingdomId });
    }

    // Sync với country nguồn nếu có
    if (k.sourceCountryId && window.countries) {
      const src = window.countries.find(c => c.id === k.sourceCountryId);
      if (src && src.collapsed) k.isCollapsed = true;
    }
  });

  // Mỗi 20 năm tự sinh thêm kingdom mới
  if (year > 0 && year % 20 === 0) {
    const activeCount = Object.values(kingdoms).filter(k => !k.isCollapsed).length;
    if (activeCount < 15) keCreateKingdomFresh();
  }

  keSave();
}

// ── Thống kê ──
function keGetStats() {
  if (!window.kingdomData) return { total: 0, active: 0, kingdoms: 0, collapsed: 0 };
  const all = Object.values(window.kingdomData.kingdoms);
  const active = all.filter(k => !k.isCollapsed);
  return {
    total:     all.length,
    active:    active.length,
    kingdoms:  active.filter(k => k.stageIndex >= 3).length,
    collapsed: all.length - active.length,
    richest:   active.sort((a,b) => b.treasury - a.treasury)[0] || null,
    strongest: active.sort((a,b) => b.militaryPower - a.militaryPower)[0] || null,
    largest:   active.sort((a,b) => b.population - a.population)[0] || null,
  };
}

function keGetActiveKingdoms() {
  if (!window.kingdomData) return [];
  return Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed);
}

// ── RENDER PANEL ──
function keRenderPanel() {
  const panel = document.getElementById("panel-kingdoms");
  if (!panel) return;
  if (!window.kingdomData) keInit();

  const kingdoms = keGetActiveKingdoms();
  const stats    = keGetStats();

  panel.innerHTML = `
    <div class="panel-toolbar">
      <button class="btn-primary" onclick="keCreateKingdomFresh();keRenderPanel()">🏰 Thêm Vương Quốc</button>
      <button class="btn-secondary" onclick="keInit();keRenderPanel()">🔄 Làm Mới</button>
      <span style="margin-left:auto;font-size:12px;color:var(--white-dim)">${stats.active} vương quốc đang tồn tại</span>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      ${[
        ["🏰","Tổng","vương quốc", stats.total],
        ["✅","Đang Tồn Tại","quốc gia", stats.active],
        ["👑","Cấp Vương Quốc","& cao hơn", stats.kingdoms],
        ["💀","Đã Sụp Đổ","lịch sử", stats.collapsed],
      ].map(([icon,label,sub,val]) => `
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-size:22px;margin-bottom:4px">${icon}</div>
          <div style="font-size:18px;font-weight:800;color:var(--gold)">${val}</div>
          <div style="font-size:10px;color:var(--white-dim)">${label}</div>
          <div style="font-size:9px;color:var(--white-dim);opacity:.6">${sub}</div>
        </div>
      `).join("")}
    </div>

    <div class="panel-grid">
      ${kingdoms.length === 0 ? `
        <div class="card span-full" style="text-align:center;padding:32px;color:var(--white-dim)">
          <div style="font-size:48px;margin-bottom:12px">🏚️</div>
          <div style="font-size:14px">Chưa có vương quốc nào. Nhấn "Thêm Vương Quốc" để bắt đầu!</div>
        </div>
      ` : kingdoms.map(k => keRenderKingdomCard(k)).join("")}
    </div>
  `;
}

function keRenderKingdomCard(k) {
  const stageLabel = KE_STAGES[k.stageIndex] || "Làng";
  const stageColor = ["#94a3b8","#60a5fa","#4ade80","#facc15","#f87171"][k.stageIndex] || "#facc15";
  const stabilityColor = k.stability > 70 ? "#4ade80" : k.stability > 40 ? "#facc15" : "#f87171";
  const popStr  = k.population >= 1000000 ? (k.population/1000000).toFixed(1)+"M" : k.population >= 1000 ? (k.population/1000).toFixed(1)+"K" : k.population;
  const goldStr = k.treasury   >= 1000000 ? (k.treasury/1000000).toFixed(1)+"M"   : k.treasury   >= 1000 ? (k.treasury/1000).toFixed(1)+"K"   : k.treasury;
  return `
    <div class="card" style="border-left:3px solid ${stageColor}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div style="font-family:var(--font-title);font-size:15px;color:var(--gold);margin-bottom:3px">🏰 ${k.kingdomName}</div>
          <div style="font-size:10px;color:var(--white-dim)">${k.dynasty} · ${k.capitalCity}</div>
          <div style="font-size:9px;color:var(--white-dim);margin-top:2px">Thành lập: Năm ${k.yearFounded} · Tuổi: ${k.age} năm</div>
        </div>
        <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(255,255,255,0.05);border:1px solid ${stageColor};color:${stageColor}">${stageLabel}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(250,204,21,0.04);border:1px solid rgba(250,204,21,0.1);border-radius:8px;margin-bottom:10px">
        <span style="font-size:13px">👑</span>
        <span style="font-size:11px;color:var(--white-dim)">${k.kingdomTitle}:</span>
        <span style="font-size:12px;font-weight:700;color:var(--white-main)">${k.ruler.name}</span>
        <span style="margin-left:auto;font-size:10px;color:var(--white-dim)">${k.ruler.rulerType}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
        ${[
          ["👥","Dân số",popStr],
          ["💰","Ngân khố",goldStr],
          ["⚔️","Quân sự",(k.militaryPower/1000).toFixed(1)+"K"],
          ["🗺️","Lãnh thổ",k.territoryCount+" vùng"],
        ].map(([icon,label,val]) => `
          <div style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px 5px;text-align:center">
            <div style="font-size:14px;margin-bottom:3px">${icon}</div>
            <div style="font-size:13px;font-weight:800;color:var(--white-main)">${val}</div>
            <div style="font-size:9px;color:var(--white-dim)">${label}</div>
          </div>
        `).join("")}
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${[
          ["Ổn định", k.stability, 100, stabilityColor],
          ["Ảnh hưởng", Math.min(k.influence, 1000), 1000, "#c084fc"],
          ["Công nghệ", k.technologyLevel * 20, 100, "#60a5fa"],
        ].map(([label,val,max,color]) => `
          <div style="display:grid;grid-template-columns:70px 1fr 35px;align-items:center;gap:6px">
            <span style="font-size:10px;color:var(--white-dim)">${label}</span>
            <div style="height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,(val/max*100))}%;background:${color};border-radius:3px;transition:width .5s"></div>
            </div>
            <span style="font-size:10px;color:var(--white-dim);text-align:right">${Math.floor(val/max*100)}%</span>
          </div>
        `).join("")}
      </div>
      ${k.empireId ? `<div style="margin-top:8px;font-size:10px;color:#c084fc;padding:4px 8px;background:rgba(192,132,252,0.08);border-radius:6px">👑 Thành viên đế quốc: ${k.empireId}</div>` : ""}
    </div>
  `;
}

// ── Helpers ──
function _keRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Hiện nav tab ──
function keShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="kingdoms"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

// ── Auto-init ──
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    keInit();
    keShowNavBtn();
    setInterval(function() {
      if (window.world) {
        keTick();
        const active = document.querySelector('.nav-btn.active[data-panel="kingdoms"]');
        if (active) keRenderPanel();
      }
    }, 8000);
  }, 1200);
});

// ============================================================
// KINGDOM ENGINE V23 — EXPANSION PACK
// Tôn Giáo (Spread/Conversion), EconomyV2 Sync, Rebellion Hook
// EXPAND ONLY — không xóa dữ liệu cũ
// ============================================================

// ── Danh sách tôn giáo ──
const KE_RELIGIONS = [
  { id:"tien_dao",  name:"Tiên Đạo",   color:"#60a5fa", emoji:"🌀" },
  { id:"ma_dao",    name:"Ma Đạo",      color:"#f87171", emoji:"🔥" },
  { id:"phat_giao", name:"Phật Giáo",   color:"#facc15", emoji:"☸️"  },
  { id:"vo_than",   name:"Vô Thần",     color:"#94a3b8", emoji:"⚫" },
  { id:"than_giao", name:"Thần Giáo",   color:"#4ade80", emoji:"⚡" },
  { id:"long_giao", name:"Long Giáo",   color:"#c084fc", emoji:"🐉" },
];

// ── Khởi tạo religion cho kingdom ──
function keInitReligion(k) {
  if (!k.religion) {
    const r = KE_RELIGIONS[Math.floor(Math.random() * KE_RELIGIONS.length)];
    k.religion          = r.id;
    k.religionName      = r.name;
    k.religiousFervor   = 30 + Math.floor(Math.random() * 40); // 30-70
    k.holyWarRisk       = 0;
    k.missionaryCount   = 0;
    k.convertedProvinces = 0;
  }
  if (k.religiousFervor === undefined) k.religiousFervor = 50;
  if (k.holyWarRisk     === undefined) k.holyWarRisk     = 0;
  if (k.missionaryCount === undefined) k.missionaryCount = 0;
  if (k.convertedProvinces === undefined) k.convertedProvinces = 0;
}

// ── Lan truyền tôn giáo: kingdom cố gắng chuyển đổi láng giềng ──
function keSpreadReligion(k) {
  if (!window.kingdomData) return;
  if (!k || k.isCollapsed || !k.religion) return;

  const fervor = k.religiousFervor || 50;
  if (fervor < 40) return; // không đủ nhiệt tình tôn giáo

  const others = Object.values(window.kingdomData.kingdoms).filter(o =>
    !o.isCollapsed &&
    o.kingdomId !== k.kingdomId &&
    o.religion !== k.religion &&
    o.religiousFervor < 70
  );
  if (others.length === 0) return;

  const target = others[Math.floor(Math.random() * others.length)];
  const spreadChance = (fervor - 30) / 100; // 0.1 → 0.7
  if (Math.random() < spreadChance * 0.3) {
    const oldReligion = target.religionName || target.religion;
    target.religion     = k.religion;
    target.religionName = k.religionName;
    target.religiousFervor = Math.max(20, (target.religiousFervor || 50) - 10);
    k.convertedProvinces = (k.convertedProvinces || 0) + 1;
    k.influence += 15;
    k.religiousFervor = Math.min(100, k.religiousFervor + 2);

    const msg = `✝️ ${k.kingdomName} truyền bá ${k.religionName} → ${target.kingdomName} (cũ: ${oldReligion})`;
    if (typeof addLog === "function") addLog(msg, "info");
    if (typeof htAddEvent === "function") htAddEvent({ type:"faith_spread", text: msg, kingdomId: k.kingdomId });
  }
}

// ── Đánh giá nguy cơ thánh chiến ──
function keUpdateHolyWarRisk(k) {
  if (!k || !k.religion || !window.kingdomData) return;
  const neighbors = Object.values(window.kingdomData.kingdoms).filter(o =>
    !o.isCollapsed && o.kingdomId !== k.kingdomId && o.religion !== k.religion
  );
  const fervor = k.religiousFervor || 50;
  // Tăng nguy cơ thánh chiến nếu fervor cao và có kẻ thù dị giáo
  if (fervor > 70 && neighbors.length > 0) {
    k.holyWarRisk = Math.min(100, (k.holyWarRisk || 0) + Math.floor(Math.random() * 5 + 1));
  } else {
    k.holyWarRisk = Math.max(0, (k.holyWarRisk || 0) - 1);
  }

  // Thánh chiến khi risk > 80
  if ((k.holyWarRisk || 0) >= 80 && neighbors.length > 0) {
    const enemy = neighbors.sort((a,b) => (b.religiousFervor||0) - (a.religiousFervor||0))[0];
    k.holyWarRisk = 0;
    k.religiousFervor = Math.max(20, k.religiousFervor - 20);
    enemy.stability   = Math.max(0, (enemy.stability || 50) - 15);
    enemy.collapseRisk = (enemy.collapseRisk || 0) + 15;
    k.militaryPower  -= Math.floor(k.militaryPower * 0.08);
    k.influence      += 40;
    const msg = `⚔️🔥 THÁNH CHIẾN: ${k.kingdomName} (${k.religionName}) tấn công ${enemy.kingdomName} (${enemy.religionName || enemy.religion})!`;
    if (typeof addLog === "function") addLog(msg, "death");
    if (typeof htAddEvent === "function") htAddEvent({ type:"holy_war", text: msg, kingdomId: k.kingdomId, importance:"high" });
    // Hook warEngine nếu có
    if (typeof warEngine_declareWar === "function") {
      try { warEngine_declareWar(k.kingdomId, enemy.kingdomId); } catch(e) {}
    }
    if (typeof _we_setMutualRelation === "function") {
      try { _we_setMutualRelation(k.kingdomId, enemy.kingdomId, "war"); } catch(e) {}
    }
  }
}

// ── Sync kho bạc với economyEngineV2 ──
function keV2SyncTreasury(k) {
  if (!k || !window.ev2Banks) return;
  const bank = window.ev2Banks[k.kingdomId];
  if (bank && typeof bank.treasury === "number") {
    // Nhập thu nhập từ ngân hàng vào kho bạc kingdom (10% mỗi tick)
    const income = Math.floor(bank.treasury * 0.001);
    k.treasury += income;
    bank.treasury = Math.max(0, bank.treasury - income);
  }
}

// ── Hook LWE rebellions ──
function keCheckRebellions(k) {
  if (!k || k.isCollapsed || !window.LWE) return;
  if (!window.LWE.rebellions || !Array.isArray(window.LWE.rebellions)) return;

  const rebelsHere = window.LWE.rebellions.filter(r =>
    r.nation === k.kingdomId || r.nation === k.kingdomName
  );
  if (rebelsHere.length > 0) {
    k.stability    = Math.max(0, (k.stability || 50) - rebelsHere.length * 5);
    k.collapseRisk = (k.collapseRisk || 0) + rebelsHere.length * 8;
    k.militaryPower = Math.floor(k.militaryPower * (1 - rebelsHere.length * 0.02));
  }
}

// ── Tick tôn giáo (được gọi trong keTick) ──
function keReligionTick(k) {
  if (!k || k.isCollapsed) return;
  keInitReligion(k);
  // Tự nhiên tăng fervor theo thời gian nếu triều đình ổn định
  if ((k.stability || 50) > 60) {
    k.religiousFervor = Math.min(100, k.religiousFervor + 1);
  } else if ((k.stability || 50) < 30) {
    k.religiousFervor = Math.max(10, k.religiousFervor - 2);
  }
  keSpreadReligion(k);
  keUpdateHolyWarRisk(k);
  keV2SyncTreasury(k);
  keCheckRebellions(k);
}

// ── Patch keTick để gọi keReligionTick ──
const _keTick_original = typeof keTick === "function" ? keTick : null;
function keTick_v23_religion() {
  if (_keTick_original) _keTick_original();
  if (!window.kingdomData) return;
  Object.values(window.kingdomData.kingdoms).forEach(k => keReligionTick(k));
}
// Override keTick nếu đã load
if (typeof keTick === "function") {
  window.keTick = keTick_v23_religion;
}

// ── Religion stats cho kingdom info ──
function keGetReligionInfo(k) {
  if (!k || !k.religion) return null;
  const r = KE_RELIGIONS.find(x => x.id === k.religion) || { emoji:"📿", color:"#94a3b8" };
  return {
    id:     k.religion,
    name:   k.religionName || k.religion,
    emoji:  r.emoji,
    color:  r.color,
    fervor: k.religiousFervor || 50,
    holyWarRisk: k.holyWarRisk || 0,
    converted: k.convertedProvinces || 0,
  };
}

// ── Thống kê tôn giáo toàn server ──
function keGetReligionStats() {
  if (!window.kingdomData) return {};
  const stats = {};
  Object.values(window.kingdomData.kingdoms).forEach(k => {
    if (k.isCollapsed || !k.religion) return;
    stats[k.religion] = (stats[k.religion] || 0) + 1;
  });
  return stats;
}

// Expose
window.keReligionTick     = keReligionTick;
window.keGetReligionInfo  = keGetReligionInfo;
window.keGetReligionStats = keGetReligionStats;
window.keSpreadReligion   = keSpreadReligion;
