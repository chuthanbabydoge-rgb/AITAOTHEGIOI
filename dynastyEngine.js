// ============================================================
// DYNASTY ENGINE V1
// CREATOR GOD V6 — PHASE NEXT
// Hệ thống Triều Đại, Hoàng Tộc, Kế Vị, Tranh Ngôi, Nội Chiến
// Tương thích 100% với save cũ — KHÔNG xóa dữ liệu
// ============================================================

// ===== GLOBAL STATE (migrate-safe) =====
// window.dynastyData = { [countryId]: DynastyRecord }
// Được lưu vào localStorage key: cgv6_dynastyEngine

// ===== CONSTANTS =====
const DE_RULER_TITLE = {
  emperor:  { male: "Hoàng Đế",   female: "Nữ Hoàng"  },
  empress:  { male: "Hoàng Hậu",  female: "Hoàng Hậu" },
  prince:   { male: "Hoàng Tử",   female: "Công Chúa"  },
  crown:    { male: "Thái Tử",    female: "Thái Nữ"    },
};

const DE_RULER_TYPE = {
  WISE:    { id:"wise",    label:"🌟 Minh Quân",       color:"#4ade80", effect: { population:0.05, economy:0.08, military:0.03, prestige: 500 } },
  TYRANT:  { id:"tyrant",  label:"🔥 Bạo Quân",        color:"#f87171", effect: { population:-0.08, economy:-0.05, military:0.10, prestige:-200 } },
  LEGEND:  { id:"legend",  label:"👑 Thiên Cổ Nhất Đế", color:"#fde047", effect: { population:0.12, economy:0.15, military:0.12, prestige:2000 } },
  WEAK:    { id:"weak",    label:"😔 Hôn Quân",         color:"#94a3b8", effect: { population:-0.03, economy:-0.04, military:-0.05, prestige:-100 } },
  NORMAL:  { id:"normal",  label:"⚖️ Bình Quân",        color:"#60a5fa", effect: { population:0.02, economy:0.02, military:0.01, prestige: 50 } },
};

const DE_CIVIL_WAR_OUTCOMES = [
  { label:"Bắc", suffix:" Bắc" },
  { label:"Nam", suffix:" Nam" },
  { label:"Đông", suffix:" Đông" },
  { label:"Tây", suffix:" Tây" },
  { label:"Thượng", suffix:" Thượng" },
  { label:"Hạ", suffix:" Hạ" },
];

const DE_PRINCE_AMBITION_NAMES = [
  "Nhất Hoàng Tử", "Nhị Hoàng Tử", "Tam Hoàng Tử",
  "Tứ Hoàng Tử", "Ngũ Hoàng Tử", "Lục Hoàng Tử",
];

// ===== INIT & MIGRATE =====

function deInit() {
  if (!window.dynastyData) {
    const saved = localStorage.getItem("cgv6_dynastyEngine");
    window.dynastyData = saved ? JSON.parse(saved) : {};
  }
  // Migrate all existing countries
  (window.countries || []).forEach(c => deMigrateCountry(c));
}

function deMigrateCountry(c) {
  if (!window.dynastyData) window.dynastyData = {};
  if (window.dynastyData[c.id]) {
    // Already exists — just patch missing fields
    const dd = window.dynastyData[c.id];
    if (!dd.dynastyName)   dd.dynastyName  = `${c.name} Triều`;
    if (!dd.founder)       dd.founder      = c.founderName || "Khuyết Danh";
    if (!dd.startYear)     dd.startYear    = c.yearFounded || 1;
    if (!dd.rulers)        dd.rulers       = [];
    if (!dd.royalFamily)   dd.royalFamily  = [];
    if (!dd.heirs)         dd.heirs        = [];
    if (!dd.throneContests) dd.throneContests = [];
    if (!dd.civilWars)     dd.civilWars    = [];
    if (!dd.marriages)     dd.marriages    = [];
    if (!dd.dynastyHistory) dd.dynastyHistory = [];
    if (!dd.prestige)      dd.prestige     = 0;
    if (dd.fallen === undefined) dd.fallen = false;
    return;
  }

  // NEW record for this country
  const founderName = c.founderName || "Khuyết Danh";
  const startYear   = c.yearFounded || (window.year || 1);
  const dynastyName = _deGenerateDynastyName(c.name, founderName);

  // Try to find founder NPC
  const founderNpc = (window.npcs || []).find(n => n.id === c.founderId);

  window.dynastyData[c.id] = {
    countryId:      c.id,
    countryName:    c.name,
    dynastyName:    dynastyName,
    founder:        founderName,
    startYear:      startYear,
    endYear:        null,
    fallen:         false,
    // Current ruler
    emperor:        founderNpc ? _deNpcRef(founderNpc) : _deCreateEmperor(founderName, startYear, c),
    empress:        null,
    crownPrince:    null,
    // Royal family
    royalFamily:    [],
    heirs:          [],   // [{name, gender, ambition, order}]
    // History
    rulers:         [],
    throneContests: [],
    civilWars:      [],
    marriages:      [],
    dynastyHistory: [{ year: startYear, event: `${dynastyName} khai triều. Người sáng lập: ${founderName}.`, type:"found" }],
    prestige:       (c.economy || 5000) + (c.military || 10000),
    // Stats
    totalRulers:    1,
    totalContests:  0,
    totalCivilWars: 0,
    longestRuler:   null,
  };

  // Record first ruler
  _deRecordRulerStart(window.dynastyData[c.id], startYear);
}

function _deGenerateDynastyName(countryName, founderName) {
  // Extract family from founderName (first character(s) often = surname)
  const surname = founderName.split(" ")[0] || countryName.slice(0, 2);
  return `${surname} Triều`;
}

function _deNpcRef(npc) {
  return {
    npcId:     npc.id,
    name:      npc.name,
    gender:    npc.gender || "Nam",
    realm:     npc.realm  || 1,
    crownedYear: window.year || 1,
    age:       npc.age    || 30,
    rulerType: _deComputeRulerType(npc),
  };
}

function _deCreateEmperor(name, yr, c) {
  return {
    npcId:     null,
    name:      name,
    gender:    "Nam",
    realm:     1,
    crownedYear: yr,
    age:       35,
    rulerType: "normal",
  };
}

function _deComputeRulerType(npc) {
  if (!npc) return "normal";
  const rep  = npc.reputation || 0;
  const realm= npc.realm || 1;
  const luck = npc.luck  || 50;
  if (realm >= 10 && rep >= 50000) return "legend";
  if (realm >= 7  && rep >= 10000 && luck >= 70) return "wise";
  if (luck < 20   || rep < 0)  return "tyrant";
  if (realm <= 2  && rep < 100) return "weak";
  return "normal";
}

function _deRecordRulerStart(dd, yr) {
  if (!dd.emperor) return;
  dd.rulers.push({
    name:        dd.emperor.name,
    npcId:       dd.emperor.npcId,
    gender:      dd.emperor.gender || "Nam",
    crownedYear: yr,
    deathYear:   null,
    rulerType:   dd.emperor.rulerType || "normal",
    reignLength: 0,
  });
  dd.totalRulers = dd.rulers.length;
}

// ===== SAVE =====
function deSave() {
  if (window.dynastyData) {
    try {
      localStorage.setItem("cgv6_dynastyEngine", JSON.stringify(window.dynastyData));
    } catch(e) { console.warn("dynastyEngine save failed", e); }
  }
}

// ===== PER-TICK ENGINE =====
function dynastyEngineTick() {
  if (!window.countries || !window.countries.length) return;
  deInit();

  window.countries.forEach(c => {
    deMigrateCountry(c);
    const dd = window.dynastyData[c.id];
    if (!dd || dd.fallen) return;

    _deUpdateReign(dd, c);
    _deTryGenerateHeirs(dd, c);
    _deTryThroneContest(dd, c);
    _deTryRoyalMarriage(dd, c);
    _deApplyRulerEffect(dd, c);
  });

  // Check civil wars resolution
  _deResolveCivilWars();
  deSave();
}

// ===== REIGN UPDATE =====
function _deUpdateReign(dd, c) {
  if (!dd.emperor) return;
  const curRuler = dd.rulers[dd.rulers.length - 1];
  if (curRuler && !curRuler.deathYear) {
    curRuler.reignLength = (window.year || 1) - curRuler.crownedYear;
    dd.longestRuler = dd.rulers.reduce((best, r) =>
      (r.reignLength || 0) > (best?.reignLength || 0) ? r : best, dd.longestRuler);
  }

  // Emperor NPC death check
  if (dd.emperor.npcId) {
    const npc = (window.npcs || []).find(n => n.id === dd.emperor.npcId);
    if (npc && npc.status === "dead") {
      _deEmperorDied(dd, c, npc);
      return;
    }
    // Sync ruler type in case NPC evolved
    if (npc) dd.emperor.rulerType = _deComputeRulerType(npc);
  }

  // Random death chance for non-NPC emperors (very low)
  if (!dd.emperor.npcId && typeof chance === "function" && chance(0.002)) {
    _deEmperorDied(dd, c, null);
  }
}

// ===== EMPEROR DIED =====
function _deEmperorDied(dd, c, npc) {
  const yr    = window.year || 1;
  const deadName = dd.emperor.name;

  // Record death in rulers list
  const curRuler = dd.rulers[dd.rulers.length - 1];
  if (curRuler) {
    curRuler.deathYear  = yr;
    curRuler.reignLength = yr - curRuler.crownedYear;
    if (!dd.longestRuler || curRuler.reignLength > (dd.longestRuler.reignLength || 0)) {
      dd.longestRuler = { ...curRuler };
    }
  }

  dd.dynastyHistory.push({ year: yr, event: `${deadName} băng hà. Triều đình rung động.`, type:"death" });
  if (typeof addWorldHistory === "function") {
    addWorldHistory("civilization", `Hoàng Đế ${deadName} của ${c.name} băng hà. (Năm ${yr})`, { countryId: c.id });
  }
  if (typeof addLog === "function") addLog(`☠️ Hoàng Đế ${deadName} của ${c.name} băng hà!`, "death");
  if (typeof toast === "function") toast(`☠️ ${deadName} — Hoàng Đế ${c.name} băng hà!`);

  // Succession
  _deSuccession(dd, c, yr);
}

// ===== SUCCESSION =====
function _deSuccession(dd, c, yr) {
  // If crown prince exists → immediate succession
  if (dd.crownPrince) {
    _deCoronate(dd, c, dd.crownPrince, yr);
    dd.crownPrince = null;
    return;
  }

  // Find heirs
  if (dd.heirs && dd.heirs.length > 0) {
    // Sort by order (lower = higher priority)
    const sorted = [...dd.heirs].sort((a, b) => (a.order || 99) - (b.order || 99));

    if (sorted.length >= 2 && sorted[0].ambition > 60 && sorted[1].ambition > 50) {
      // Throne contest!
      _deThroneContest(dd, c, sorted, yr);
    } else {
      _deCoronate(dd, c, sorted[0], yr);
      dd.heirs = dd.heirs.filter(h => h !== sorted[0]);
    }
    return;
  }

  // No heirs → find a live NPC in the country
  const candidates = (window.npcs || []).filter(n =>
    n.country === c.name && n.status === "alive" && n.realm >= 3
  ).sort((a, b) => b.realm - a.realm);

  if (candidates.length > 0) {
    const newRuler = candidates[0];
    dd.dynastyHistory.push({ year: yr, event: `${newRuler.name} lên ngôi sau khi hoàng tộc tuyệt tự.`, type:"succession" });
    _deSetEmperor(dd, c, _deNpcRef(newRuler), yr);
    // New dynasty if different family
    if (newRuler.family && newRuler.family !== dd.founder.split(" ")[0]) {
      _deNewDynasty(dd, c, newRuler, yr);
    }
  } else {
    // Dynasty ends
    _deDynastyFall(dd, c, yr, "hoàng tộc tuyệt tự");
  }
}

function _deCoronate(dd, c, heir, yr) {
  dd.dynastyHistory.push({ year: yr, event: `${heir.name} đăng cơ, trở thành Hoàng Đế ${c.name}.`, type:"coronate" });
  if (typeof addWorldHistory === "function") {
    addWorldHistory("civilization", `${heir.name} lên ngôi Hoàng Đế ${c.name}. (Năm ${yr})`, { countryId: c.id });
  }
  if (typeof addLog === "function") addLog(`👑 ${heir.name} đăng cơ — Hoàng Đế mới của ${c.name}!`, "important");
  if (typeof toast === "function") toast(`👑 ${heir.name} đăng cơ!`);

  // Find NPC
  let npcRef = null;
  if (heir.npcId) {
    const npc = (window.npcs || []).find(n => n.id === heir.npcId);
    if (npc) npcRef = _deNpcRef(npc);
  }
  _deSetEmperor(dd, c, npcRef || { name: heir.name, gender: heir.gender || "Nam", npcId: heir.npcId, crownedYear: yr, rulerType: "normal" }, yr);
}

function _deSetEmperor(dd, c, rulerObj, yr) {
  dd.emperor = { ...rulerObj, crownedYear: yr };
  _deRecordRulerStart(dd, yr);
  dd.totalRulers = dd.rulers.length;
  // Update prestige
  const typeData = DE_RULER_TYPE[(rulerObj.rulerType || "normal").toUpperCase()] || DE_RULER_TYPE.NORMAL;
  dd.prestige = (dd.prestige || 0) + typeData.effect.prestige;
}

// ===== GENERATE HEIRS =====
function _deTryGenerateHeirs(dd, c) {
  if (!dd.emperor) return;
  if ((dd.heirs || []).length >= 6) return;
  if (!chance(0.025)) return; // ~2.5% per tick per country

  const yr   = window.year || 1;
  const idx  = (dd.heirs || []).length;
  const name = _deHeirName(dd.emperor, idx);
  const ambition = randInt(20, 95);

  if (!dd.heirs) dd.heirs = [];
  dd.heirs.push({
    name:      name,
    gender:    chance(0.7) ? "Nam" : "Nữ",
    npcId:     null,
    order:     idx + 1,
    ambition:  ambition,
    bornYear:  yr,
  });

  // Assign empress if none
  if (!dd.empress && chance(0.4)) {
    dd.empress = { name: _deEmpressName(), gender: "Nữ", npcId: null };
  }

  dd.dynastyHistory.push({ year: yr, event: `${name} ra đời — Hoàng tử/Công chúa thứ ${idx + 1} của ${dd.emperor.name}.`, type:"birth" });
}

function _deHeirName(emperor, idx) {
  const maleNames  = ["Hạo Thiên", "Long Vũ", "Thiên Kiếm", "Bách Chiến", "Vạn Lý", "Thiên Long"];
  const femaleNames = ["Ngọc Lạc", "Thiên Hoa", "Băng Tuyết", "Nguyệt Nga", "Phượng Nhi", "Thiên Ý"];
  const surname = (emperor.name || "Lâm").split(" ")[0];
  if (idx % 2 === 0) {
    return `${surname} ${maleNames[idx % maleNames.length]}`;
  }
  return `${surname} ${femaleNames[idx % femaleNames.length]}`;
}

function _deEmpressName() {
  const surnames = ["Mộ Dung", "Thượng Quan", "Âu Dương", "Độc Cô", "Tây Môn", "Đông Phương"];
  const names    = ["Tuyết", "Linh", "Hoa", "Nguyệt", "Băng", "Lan"];
  return `${rand(surnames)} ${rand(names)}`;
}

// ===== THRONE CONTEST =====
function _deTryThroneContest(dd, c) {
  if ((dd.heirs || []).length < 2) return;
  if (!chance(0.005)) return; // rare

  const yr = window.year || 1;
  const sorted = [...dd.heirs].sort((a, b) => b.ambition - a.ambition);
  const highAmb = sorted.filter(h => h.ambition > 65);
  if (highAmb.length < 2) return;

  _deThroneContest(dd, c, highAmb, yr);
}

function _deThroneContest(dd, c, contestants, yr) {
  const winner = contestants.reduce((w, h) => h.ambition > w.ambition ? h : w);
  const losers = contestants.filter(h => h !== winner);

  dd.totalContests = (dd.totalContests || 0) + 1;
  dd.throneContests.push({ year: yr, winner: winner.name, losers: losers.map(l => l.name) });
  dd.dynastyHistory.push({ year: yr, event: `TRANH NGÔI! ${winner.name} đấu với ${losers.map(l => l.name).join(", ")}!`, type:"contest" });

  if (typeof addWorldHistory === "function") {
    addWorldHistory("war", `Tranh Ngôi tại ${c.name}! ${winner.name} vs ${losers.map(l=>l.name).join(", ")}. (Năm ${yr})`, { countryId: c.id });
  }
  if (typeof addLog === "function") addLog(`⚔️ TRANH NGÔI tại ${c.name}! ${winner.name} đang tạo phản!`, "important");
  if (typeof toast === "function") toast(`⚔️ Tranh ngôi tại ${c.name}!`);

  // Winner gets crown
  dd.crownPrince = winner;
  dd.heirs = dd.heirs.filter(h => !contestants.includes(h));

  // Losers may spark civil war
  const rebelLoser = losers.find(l => l.ambition > 75);
  if (rebelLoser && chance(0.45)) {
    _deCivilWarStart(dd, c, rebelLoser, yr);
  } else {
    dd.dynastyHistory.push({ year: yr, event: `${winner.name} giành chiến thắng. Các hoàng tử khác quy phục.`, type:"victory" });
    _deCoronate(dd, c, winner, yr);
    dd.crownPrince = null;
  }
}

// ===== CIVIL WAR =====
function _deCivilWarStart(dd, c, rebel, yr) {
  dd.totalCivilWars = (dd.totalCivilWars || 0) + 1;
  const splitA = c.name + rand(DE_CIVIL_WAR_OUTCOMES).suffix;
  const splitB = c.name + rand(DE_CIVIL_WAR_OUTCOMES.filter(o => o.suffix !== splitA.replace(c.name, ""))).suffix;

  dd.civilWars.push({
    id:        `cw_${c.id}_${yr}`,
    year:      yr,
    rebelName: rebel.name,
    factionA:  splitA,
    factionB:  splitB,
    resolved:  false,
    resolveIn: yr + randInt(5, 20),
  });

  dd.dynastyHistory.push({ year: yr, event: `NỘI CHIẾN! ${rebel.name} tạo phản! ${c.name} chia đôi thành ${splitA} và ${splitB}.`, type:"civil_war" });
  if (typeof addWorldHistory === "function") {
    addWorldHistory("war", `NỘI CHIẾN tại ${c.name}! Chia thành ${splitA} và ${splitB}. (Năm ${yr})`, { countryId: c.id });
  }
  if (typeof addLog === "function") addLog(`🔥 NỘI CHIẾN tại ${c.name}! Thiên hạ đại loạn!`, "death");
  if (typeof toast === "function") toast(`🔥 ${c.name} nội chiến!`);

  // Weaken country
  c.military  = Math.floor((c.military  || 10000) * 0.6);
  c.economy   = Math.floor((c.economy   || 5000)  * 0.7);
  c.population= Math.floor((c.population||100000)  * 0.85);
  if (c.army !== undefined) c.army = c.military;
}

function _deResolveCivilWars() {
  const yr = window.year || 1;
  (window.countries || []).forEach(c => {
    const dd = window.dynastyData?.[c.id];
    if (!dd) return;
    (dd.civilWars || []).forEach(cw => {
      if (cw.resolved || cw.resolveIn > yr) return;
      cw.resolved = true;
      // Random outcome
      if (chance(0.6)) {
        // Unity restored
        dd.dynastyHistory.push({ year: yr, event: `Nội chiến kết thúc. ${c.name} tái thống nhất.`, type:"peace" });
        if (typeof addLog === "function") addLog(`☮️ ${c.name} tái thống nhất sau nội chiến!`, "important");
      } else {
        // Dynasty falls if civil war unresolved
        _deDynastyFall(dd, c, yr, "nội chiến kéo dài");
      }
    });
  });
}

// ===== DYNASTY FALL =====
function _deDynastyFall(dd, c, yr, reason) {
  dd.fallen  = true;
  dd.endYear = yr;
  dd.dynastyHistory.push({ year: yr, event: `${dd.dynastyName} sụp đổ — ${reason}. Kết thúc ${yr - dd.startYear} năm trị vì.`, type:"fall" });
  if (typeof addWorldHistory === "function") {
    addWorldHistory("tragedy", `${dd.dynastyName} của ${c.name} sụp đổ sau ${yr - dd.startYear} năm. Nguyên nhân: ${reason}.`, { countryId: c.id });
  }
  if (typeof addLog === "function") addLog(`💀 ${dd.dynastyName} sụp đổ! ${c.name} mất người cai trị!`, "death");
  if (typeof toast === "function") toast(`💀 ${dd.dynastyName} diệt vong!`);
}

function _deNewDynasty(dd, c, newRulerNpc, yr) {
  const oldName = dd.dynastyName;
  dd.dynastyName  = _deGenerateDynastyName(c.name, newRulerNpc.name);
  dd.founder      = newRulerNpc.name;
  dd.startYear    = yr;
  dd.endYear      = null;
  dd.fallen       = false;
  dd.dynastyHistory.push({ year: yr, event: `${oldName} chấm dứt. ${dd.dynastyName} khai triều bởi ${newRulerNpc.name}.`, type:"new_dynasty" });
  if (typeof addLog === "function") addLog(`👑 ${dd.dynastyName} ra đời! Thiên hạ đổi chủ!`, "important");
}

// ===== ROYAL MARRIAGE =====
function _deTryRoyalMarriage(dd, c) {
  if (!chance(0.008)) return;
  if ((window.countries || []).length < 2) return;

  const yr        = window.year || 1;
  const others    = (window.countries || []).filter(o => o.id !== c.id && window.dynastyData?.[o.id] && !window.dynastyData[o.id].fallen);
  if (!others.length) return;
  const partner   = rand(others);
  const partnerDD = window.dynastyData[partner.id];

  // Already married?
  if ((dd.marriages || []).some(m => m.partnerId === partner.id)) return;

  if (!dd.marriages)       dd.marriages       = [];
  if (!partnerDD.marriages) partnerDD.marriages = [];

  const princess = _dePrincessName();
  dd.marriages.push({ year: yr, partnerId: partner.id, partnerName: partner.name, princess });
  partnerDD.marriages.push({ year: yr, partnerId: c.id, partnerName: c.name, princess });

  dd.dynastyHistory.push({ year: yr, event: `Liên hôn với ${partner.name}. Công chúa ${princess} xuất giá.`, type:"marriage" });
  if (typeof addWorldHistory === "function") {
    addWorldHistory("marriage", `${c.name} liên hôn với ${partner.name}. Công chúa ${princess} xuất giá. (Năm ${yr})`, { countryA: c.id, countryB: partner.id });
  }
  if (typeof addLog === "function") addLog(`💍 ${c.name} và ${partner.name} liên hôn! Thiên hạ thêm ổn định.`, "important");
}

function _dePrincessName() {
  const s = ["Lâm", "Mộ Dung", "Thượng Quan", "Tống", "Triệu", "Lý"];
  const n = ["Băng Tuyết", "Nguyệt Hoa", "Thiên Hương", "Lan Chi", "Linh Nhi", "Phượng Nghi"];
  return `${rand(s)} ${rand(n)}`;
}

// ===== RULER EFFECT =====
function _deApplyRulerEffect(dd, c) {
  if (!dd.emperor) return;
  if (!chance(0.03)) return; // apply occasionally
  const typeKey  = (dd.emperor.rulerType || "normal").toUpperCase();
  const typeData = DE_RULER_TYPE[typeKey] || DE_RULER_TYPE.NORMAL;
  const eff      = typeData.effect;

  if (eff.population) c.population = Math.max(1000, Math.floor((c.population || 100000) * (1 + eff.population)));
  if (eff.economy)    c.economy    = Math.max(100,  Math.floor((c.economy    || 5000)   * (1 + eff.economy)));
  if (eff.military)   c.military   = Math.max(100,  Math.floor((c.military   || 10000)  * (1 + eff.military)));
  if (c.army !== undefined) c.army = c.military;
  dd.prestige = (dd.prestige || 0) + (eff.prestige || 0);
}

// ===== STATISTICS =====
function deGetStatistics() {
  const all = Object.values(window.dynastyData || {});

  let strongestEmperor = null, strongestRealm = 0;
  let longestDynasty = null, longestYears = 0;
  let oldestCountry = null, oldestYear = Infinity;
  let totalChanges = 0, totalContests = 0, totalCivilWars = 0;

  all.forEach(dd => {
    // Strongest emperor (by realm from NPC)
    const curNpc = dd.emperor?.npcId ? (window.npcs || []).find(n => n.id === dd.emperor.npcId) : null;
    if (curNpc && (curNpc.realm || 0) > strongestRealm) {
      strongestRealm   = curNpc.realm;
      strongestEmperor = { name: dd.emperor.name, realm: curNpc.realm, countryName: dd.countryName };
    }
    // Longest dynasty
    const dyLen = (dd.endYear || (window.year || 1)) - (dd.startYear || 1);
    if (dyLen > longestYears) {
      longestYears   = dyLen;
      longestDynasty = { name: dd.dynastyName, years: dyLen, countryName: dd.countryName };
    }
    // Oldest country
    if ((dd.startYear || 9999) < oldestYear) {
      oldestYear    = dd.startYear;
      oldestCountry = { name: dd.countryName, year: dd.startYear };
    }
    totalChanges  += (dd.totalRulers || 1) - 1;
    totalContests += dd.totalContests || 0;
    totalCivilWars += (dd.civilWars || []).length;
  });

  return { strongestEmperor, longestDynasty, oldestCountry, totalChanges, totalContests, totalCivilWars, totalDynasties: all.length };
}

// ===== PANEL RENDERING =====

function renderDynastyEnginePanel() {
  const el = document.getElementById("panel-dynasty-engine");
  if (!el) return;
  deInit();

  const stats = deGetStatistics();
  const allDD = Object.values(window.dynastyData || {});

  el.innerHTML = `
    <!-- Stats Header -->
    <div class="card de-stats-header" style="margin-bottom:14px">
      <div class="card-title">👑 TRIỀU ĐẠI — Lịch Sử Thực Thụ</div>
      <div class="de-stats-grid">
        ${_deStatCard("👑", "Hoàng Đế Mạnh Nhất", stats.strongestEmperor ? `${stats.strongestEmperor.name} (${stats.strongestEmperor.countryName})` : "—", "#fde047")}
        ${_deStatCard("📜", "Triều Đại Lâu Nhất",  stats.longestDynasty  ? `${stats.longestDynasty.name} — ${stats.longestDynasty.years} năm` : "—", "#4ade80")}
        ${_deStatCard("🏛️", "Quốc Gia Cổ Nhất",    stats.oldestCountry   ? `${stats.oldestCountry.name} (Năm ${stats.oldestCountry.year})` : "—", "#60a5fa")}
        ${_deStatCard("🔄", "Số Lần Đổi Ngôi",     stats.totalChanges, "#c084fc")}
        ${_deStatCard("⚔️", "Số Cuộc Tranh Ngôi",   stats.totalContests, "#f87171")}
        ${_deStatCard("🔥", "Số Cuộc Nội Chiến",     stats.totalCivilWars, "#fb923c")}
        ${_deStatCard("🏰", "Tổng Triều Đại",        stats.totalDynasties, "#94a3b8")}
      </div>
    </div>

    <!-- All Countries Dynasty Cards -->
    <div class="de-dynasty-grid">
      ${allDD.map(dd => _deRenderDynastyCard(dd)).join("") || "<div class='wh-empty'>👑 Chưa có quốc gia nào. Hãy để thiên địa phát triển...</div>"}
    </div>
  `;
}

function _deStatCard(icon, label, value, color) {
  return `<div class="de-stat-card">
    <div class="de-stat-icon">${icon}</div>
    <div class="de-stat-val" style="color:${color}">${value}</div>
    <div class="de-stat-label">${label}</div>
  </div>`;
}

function _deRenderDynastyCard(dd) {
  if (!dd) return "";
  const typeKey = (dd.emperor?.rulerType || "normal").toUpperCase();
  const rtData  = DE_RULER_TYPE[typeKey] || DE_RULER_TYPE.NORMAL;
  const fallen  = dd.fallen;
  const activeCW = (dd.civilWars || []).filter(cw => !cw.resolved);

  const emperorTitle = dd.emperor?.gender === "Nữ"
    ? DE_RULER_TITLE.emperor.female
    : DE_RULER_TITLE.emperor.male;

  const recentHistory = (dd.dynastyHistory || []).slice(-5).reverse();

  return `<div class="de-dynasty-card ${fallen ? "de-fallen" : ""}">
    <!-- Header -->
    <div class="de-dc-header">
      <div>
        <div class="de-dc-dynasty-name" style="color:${fallen ? "#f87171" : "#fde047"}">${dd.dynastyName} ${fallen ? "☠" : ""}</div>
        <div class="de-dc-country-name">🏛️ ${dd.countryName}</div>
        <div class="de-dc-founded">Khai triều: Năm ${dd.startYear} · ${dd.totalRulers || 1} đời vua</div>
      </div>
      <div class="de-dc-prestige">
        <div style="font-size:11px;color:var(--white-dim)">Uy Danh</div>
        <div style="color:#fde047;font-weight:700">${((dd.prestige||0)/1000).toFixed(1)}k</div>
      </div>
    </div>

    ${activeCW.length ? `<div class="de-civil-war-badge">🔥 NỘI CHIẾN: ${activeCW.map(cw=>`${cw.factionA} vs ${cw.factionB}`).join(" | ")}</div>` : ""}

    <!-- Emperor Row -->
    ${dd.emperor && !fallen ? `<div class="de-ruler-row">
      <div class="de-ruler-crown">👑</div>
      <div class="de-ruler-info">
        <div class="de-ruler-name">${emperorTitle}: <strong>${dd.emperor.name}</strong></div>
        <div class="de-ruler-type" style="color:${rtData.color}">${rtData.label}</div>
        <div class="de-ruler-reign" style="color:var(--white-dim);font-size:11px">Lên ngôi Năm ${dd.emperor.crownedYear}</div>
      </div>
    </div>` : ""}

    <!-- Empress & Crown Prince -->
    ${dd.empress ? `<div class="de-royal-row"><span>👸 Hoàng Hậu:</span> <span>${dd.empress.name}</span></div>` : ""}
    ${dd.crownPrince ? `<div class="de-royal-row"><span>🎖️ Thái Tử:</span> <span>${dd.crownPrince.name}</span></div>` : ""}

    <!-- Heirs -->
    ${(dd.heirs||[]).length > 0 ? `<div class="de-heirs-row">
      <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">🧬 Hoàng Tộc (${dd.heirs.length}):</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${dd.heirs.map(h => `<span class="de-heir-chip" title="Tham vọng: ${h.ambition}">${h.gender==="Nam"?"♂":"♀"} ${h.name}</span>`).join("")}
      </div>
    </div>` : ""}

    <!-- Marriages -->
    ${(dd.marriages||[]).length > 0 ? `<div class="de-marriage-row">
      <span style="color:var(--white-dim);font-size:11px">💍 Liên Hôn: </span>
      ${dd.marriages.slice(-3).map(m => `<span class="de-heir-chip" style="border-color:#c084fc44;background:#c084fc12;color:#c084fc">${m.partnerName}</span>`).join("")}
    </div>` : ""}

    <!-- Rulers list button -->
    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
      <button class="btn-secondary small" onclick="dePanelShowRulers('${dd.countryId}')">📜 Lịch Sử Vua</button>
      <button class="btn-secondary small" onclick="dePanelShowHistory('${dd.countryId}')">🕰️ Triều Đại Sử</button>
      ${(dd.throneContests||[]).length ? `<button class="btn-secondary small" onclick="dePanelShowContests('${dd.countryId}')">⚔️ Tranh Ngôi (${dd.throneContests.length})</button>` : ""}
    </div>

    <!-- Recent history -->
    <div class="de-recent-history">
      ${recentHistory.map(h => `<div class="de-hist-item de-hist-${h.type||""}">
        <span class="de-hist-yr">Năm ${h.year}</span>
        <span>${h.event}</span>
      </div>`).join("") || "<div style='color:var(--white-dim);font-size:11px;font-style:italic'>Chưa có lịch sử.</div>"}
    </div>
  </div>`;
}

// ===== MODAL POPUP FUNCTIONS =====
function dePanelShowRulers(countryId) {
  deInit();
  const dd = window.dynastyData?.[countryId];
  if (!dd) return;

  const html = `<div style="max-height:400px;overflow-y:auto;padding:8px">
    <div style="font-size:16px;font-weight:700;color:#fde047;margin-bottom:10px">📜 Danh Sách Hoàng Đế — ${dd.dynastyName}</div>
    ${(dd.rulers || []).slice().reverse().map((r, i) => {
      const typeData = DE_RULER_TYPE[(r.rulerType||"normal").toUpperCase()] || DE_RULER_TYPE.NORMAL;
      return `<div style="padding:8px;border-radius:6px;background:var(--bg-hover);border:1px solid var(--border);margin-bottom:6px">
        <div style="font-weight:600;color:var(--white-main)">${dd.rulers.length - i}. ${r.name} <span style="color:${typeData.color};font-size:11px">${typeData.label}</span></div>
        <div style="color:var(--white-dim);font-size:11px">Năm ${r.crownedYear}${r.deathYear ? ` — ${r.deathYear}` : " — Đương trị"} · ${r.reignLength || 0} năm tại vị</div>
      </div>`;
    }).join("") || "<div style='color:var(--white-dim)'>Chưa có.</div>"}
  </div>`;
  _deShowModal(html);
}

function dePanelShowHistory(countryId) {
  deInit();
  const dd = window.dynastyData?.[countryId];
  if (!dd) return;

  const typeColors = { found:"#4ade80", death:"#f87171", coronate:"#fde047", contest:"#fb923c", civil_war:"#ef4444", marriage:"#c084fc", fall:"#f87171", birth:"#60a5fa", victory:"#4ade80", peace:"#4ade80", new_dynasty:"#fde047" };
  const html = `<div style="max-height:400px;overflow-y:auto;padding:8px">
    <div style="font-size:16px;font-weight:700;color:#fde047;margin-bottom:10px">🕰️ Triều Đại Sử — ${dd.dynastyName}</div>
    ${(dd.dynastyHistory || []).slice().reverse().map(h => `
      <div style="padding:6px 8px;border-left:3px solid ${typeColors[h.type]||"#60a5fa"}44;margin-bottom:4px;background:var(--bg-hover);border-radius:0 6px 6px 0">
        <span style="color:${typeColors[h.type]||"#60a5fa"};font-size:11px;font-weight:700">Năm ${h.year}</span>
        <span style="color:var(--white-main);font-size:12px;margin-left:8px">${h.event}</span>
      </div>`).join("") || "<div style='color:var(--white-dim)'>Chưa có lịch sử.</div>"}
  </div>`;
  _deShowModal(html);
}

function dePanelShowContests(countryId) {
  deInit();
  const dd = window.dynastyData?.[countryId];
  if (!dd) return;

  const html = `<div style="max-height:400px;overflow-y:auto;padding:8px">
    <div style="font-size:16px;font-weight:700;color:#f87171;margin-bottom:10px">⚔️ Các Cuộc Tranh Ngôi — ${dd.dynastyName}</div>
    ${(dd.throneContests || []).slice().reverse().map(tc => `
      <div style="padding:8px;border-radius:6px;background:#f871711a;border:1px solid #f8717144;margin-bottom:6px">
        <div style="color:#fde047;font-weight:700">Năm ${tc.year}</div>
        <div style="color:#4ade80;font-size:12px">🏆 Thắng: ${tc.winner}</div>
        <div style="color:#f87171;font-size:12px">❌ Thua: ${tc.losers.join(", ")}</div>
      </div>`).join("") || "<div style='color:var(--white-dim)'>Chưa có tranh ngôi.</div>"}
    ${(dd.civilWars || []).length ? `<div style="margin-top:12px;font-size:14px;font-weight:700;color:#fb923c">🔥 Nội Chiến</div>` : ""}
    ${(dd.civilWars || []).map(cw => `
      <div style="padding:8px;border-radius:6px;background:#fb923c1a;border:1px solid #fb923c44;margin-bottom:6px">
        <div style="color:#fde047;font-weight:700">Năm ${cw.year}</div>
        <div style="color:var(--white-main);font-size:12px">${cw.factionA} vs ${cw.factionB}</div>
        <div style="color:${cw.resolved?"#4ade80":"#f87171"};font-size:11px">${cw.resolved ? "Đã giải quyết" : `Đang chiến — kết thúc dự kiến Năm ${cw.resolveIn}`}</div>
      </div>`).join("")}
  </div>`;
  _deShowModal(html);
}

function _deShowModal(html) {
  let overlay = document.getElementById("de-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "de-modal-overlay";
    overlay.style.cssText = `position:fixed;inset:0;background:#000a;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px`;
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div style="background:var(--bg-card,#1a1a2e);border:1px solid var(--border,#2a2a4a);border-radius:12px;padding:16px;max-width:560px;width:100%;position:relative">
    <button onclick="document.getElementById('de-modal-overlay').remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;color:var(--white-dim);font-size:18px;cursor:pointer">✕</button>
    ${html}
  </div>`;
  overlay.style.display = "flex";
}

// ===== CSS INJECTION =====
(function injectDynastyEngineCSS() {
  const style = document.createElement("style");
  style.id = "dynasty-engine-css";
  style.textContent = `
/* Dynasty Engine Panel */
#panel-dynasty-engine { padding-bottom: 30px; }

.de-stats-header {}
.de-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.de-stat-card {
  background: var(--bg-hover, #1e1e3a);
  border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
}
.de-stat-icon { font-size: 18px; margin-bottom: 2px; }
.de-stat-val  { font-size: 13px; font-weight: 700; word-break: break-word; }
.de-stat-label { font-size: 10px; color: var(--white-dim, #888); margin-top: 2px; }

/* Dynasty Cards Grid */
.de-dynasty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}
.de-dynasty-card {
  background: var(--bg-card, #111128);
  border: 1px solid var(--border, #2a2a4a);
  border-radius: 10px;
  padding: 14px 16px;
  transition: border-color .15s;
}
.de-dynasty-card:hover { border-color: rgba(253,224,71,.3); }
.de-fallen { border-color: rgba(248,113,113,.3) !important; opacity: .7; }

.de-dc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.de-dc-dynasty-name { font-size: 15px; font-weight: 700; }
.de-dc-country-name { font-size: 12px; color: var(--white-dim, #888); margin-top: 2px; }
.de-dc-founded      { font-size: 11px; color: var(--white-dim, #888); margin-top: 2px; }
.de-dc-prestige     { text-align: right; }

.de-civil-war-badge {
  background: #ef44441a; border: 1px solid #ef444444; border-radius: 6px;
  padding: 5px 10px; font-size: 12px; color: #f87171; margin-bottom: 8px;
  font-weight: 600;
}

.de-ruler-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  background: rgba(253,224,71,.06); border: 1px solid rgba(253,224,71,.15);
  margin-bottom: 8px;
}
.de-ruler-crown { font-size: 20px; }
.de-ruler-name  { font-size: 13px; color: var(--white-main, #eee); }
.de-ruler-type  { font-size: 11px; margin-top: 2px; }
.de-ruler-reign { }

.de-royal-row {
  display: flex; gap: 8px; align-items: center;
  font-size: 12px; color: var(--white-dim, #888);
  padding: 3px 4px;
}
.de-royal-row span:last-child { color: var(--white-main, #eee); }

.de-heirs-row, .de-marriage-row { margin-top: 6px; }
.de-heir-chip {
  display: inline-block; padding: 2px 7px; border-radius: 12px;
  font-size: 11px; border: 1px solid rgba(250,204,21,.3);
  background: rgba(250,204,21,.08); color: var(--white-main, #eee);
  cursor: default;
}

.de-recent-history {
  margin-top: 10px; border-top: 1px solid var(--border, #2a2a4a); padding-top: 8px;
}
.de-hist-item {
  display: flex; gap: 6px; font-size: 11px; padding: 3px 0;
  color: var(--white-dim, #888); border-bottom: 1px solid rgba(255,255,255,.03);
}
.de-hist-yr  { color: var(--gold, #fbbf24); min-width: 56px; font-weight: 600; }
.de-hist-death   { color: #f87171; }
.de-hist-contest { color: #fb923c; }
.de-hist-civil_war { color: #ef4444; }
.de-hist-coronate  { color: #fde047; }
.de-hist-marriage  { color: #c084fc; }
.de-hist-found, .de-hist-new_dynasty { color: #4ade80; }
  `;
  document.head.appendChild(style);
})();

// ===== INJECT INTO GAME TICK =====
(function patchGameTick() {
  // Hook into gameTick or countryEvents if present
  const _origCountryEvents = typeof countryEvents === "function" ? countryEvents : null;
  window.countryEvents = function() {
    if (_origCountryEvents) _origCountryEvents();
    try { dynastyEngineTick(); } catch(e) { console.warn("dynastyEngineTick error", e); }
  };
})();

// ===== INIT ON LOAD =====
(function() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", deInit);
  } else {
    deInit();
  }
})();

// Export for external use
window.dynastyEngine = {
  init:         deInit,
  save:         deSave,
  tick:         dynastyEngineTick,
  getStats:     deGetStatistics,
  renderPanel:  renderDynastyEnginePanel,
  getData:      () => window.dynastyData,
};