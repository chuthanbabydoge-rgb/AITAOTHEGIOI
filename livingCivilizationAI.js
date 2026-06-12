// ============================================================
// LIVING CIVILIZATION AI (LCAI) V1
// CREATOR GOD — Văn Minh Sống Động · Trí Tuệ AI Nền Văn Minh
// Linh Hồn Văn Minh · Chính Trị Nội Bộ · Tiến Hóa Văn Hóa
// Động Lực Dân Số · Phong Trào Ý Thức · Thời Hoàng Kim / Đen Tối
// ============================================================

const LCAI_SAVE_KEY = "cgv6_living_civ_ai";
const LCAI_VERSION  = 1;

// ── ĐẶC TÍNH VĂN MINH (8 loại) ──────────────────────────────
const LCAI_TRAITS = {
  military:   { id:"military",   name:"Quân Sự",    icon:"⚔️",  color:"#f87171", desc:"Thượng võ, chinh phạt, danh dự chiến trường." },
  commercial: { id:"commercial", name:"Thương Mại", icon:"💰",  color:"#fbbf24", desc:"Tài phú, buôn bán, mở rộng mạng lưới kinh tế." },
  scholarly:  { id:"scholarly",  name:"Học Thuật",  icon:"📚",  color:"#60a5fa", desc:"Trí tuệ, nghiên cứu, tích lũy kiến thức." },
  religious:  { id:"religious",  name:"Thần Đạo",   icon:"🏛️",  color:"#c084fc", desc:"Tôn giáo, tín ngưỡng, thần linh phù hộ." },
  imperial:   { id:"imperial",   name:"Đế Quyền",   icon:"👑",  color:"#f97316", desc:"Tập quyền tuyệt đối, mở rộng đế quốc." },
  hermit:     { id:"hermit",     name:"Ẩn Tu",      icon:"🧘",  color:"#4ade80", desc:"Tu luyện nội tâm, tránh thế gian, bí ẩn." },
  wanderer:   { id:"wanderer",   name:"Du Hiệp",    icon:"🗺️",  color:"#a78bfa", desc:"Tự do phóng túng, hành tẩu giang hồ." },
  heretical:  { id:"heretical",  name:"Dị Đoan",    icon:"💀",  color:"#6b7280", desc:"Đường đi ngược trào lưu, ma đạo, phá chuẩn mực." },
};

// ── CHIẾN LƯỢC AI ────────────────────────────────────────────
const LCAI_STRATEGIES = {
  expand:      { id:"expand",      name:"Bành Trướng",   icon:"🗺️",  desc:"Chiếm đất, mở rộng lãnh thổ." },
  trade:       { id:"trade",       name:"Thương Mại",    icon:"⛵",  desc:"Tập trung giao thương, làm giàu." },
  war:         { id:"war",         name:"Chiến Tranh",   icon:"⚔️",  desc:"Tấn công kẻ thù, tranh bá." },
  diplomacy:   { id:"diplomacy",   name:"Ngoại Giao",    icon:"🤝",  desc:"Xây liên minh, bảo vệ lợi ích." },
  isolate:     { id:"isolate",     name:"Bế Quan",       icon:"🚫",  desc:"Cô lập, tự củng cố nội bộ." },
  consolidate: { id:"consolidate", name:"Củng Cố",       icon:"🏰",  desc:"Ổn định nội bộ, cải cách." },
  cultural:    { id:"cultural",    name:"Ảnh Hưởng VH",  icon:"🎨",  desc:"Phát tán văn hóa, thu phục lòng người." },
  reform:      { id:"reform",      name:"Cải Cách",      icon:"📜",  desc:"Đổi mới thể chế, hiện đại hóa." },
};

// ── THỜI ĐẠI VĂN MINH ───────────────────────────────────────
const LCAI_AGES = [
  { id:"primitive",    name:"Nguyên Thủy",      icon:"🪨", threshold:0,    bonus:"Dân số tăng chậm. Săn bắt hái lượm." },
  { id:"ancient",      name:"Cổ Đại",           icon:"🏛️", threshold:100,  bonus:"Nông nghiệp phát triển. Đô thị nhỏ." },
  { id:"classical",    name:"Cổ Điển",          icon:"⚖️", threshold:250,  bonus:"Luật pháp, triết học, thương mại." },
  { id:"medieval",     name:"Trung Cổ",         icon:"⚔️", threshold:500,  bonus:"Phong kiến, hiệp sĩ, nhà thờ." },
  { id:"renaissance",  name:"Phục Hưng",        icon:"🎨", threshold:900,  bonus:"Nghệ thuật, khoa học, thám hiểm." },
  { id:"enlightened",  name:"Khai Sáng",        icon:"💡", threshold:1500, bonus:"Lý trí, dân chủ, công nghiệp." },
  { id:"transcendent", name:"Siêu Việt",        icon:"✨", threshold:2500, bonus:"Văn minh đạt đỉnh tiên cảnh." },
];

// ── PHONG TRÀO Ý THỨC (8 loại) ──────────────────────────────
const LCAI_MOVEMENT_TYPES = [
  { id:"peasant_uprising",   name:"Nông Dân Khởi Nghĩa",  icon:"🌾", spread:0.3, trigger:"stability<30",  effect:"lowers upper class, boosts stability pressure" },
  { id:"merchant_guild",     name:"Thương Hội Nổi Dậy",   icon:"💼", spread:0.4, trigger:"commercial>60", effect:"boosts commerce, reduces military" },
  { id:"scholar_reform",     name:"Sĩ Phu Cải Cách",       icon:"📖", spread:0.5, trigger:"scholarly>70",  effect:"boosts culture, reduces corruption" },
  { id:"religious_revival",  name:"Tôn Giáo Phục Hưng",   icon:"🙏", spread:0.35,trigger:"religious>65",  effect:"boosts stability, spreads faith" },
  { id:"military_coup",      name:"Võ Tướng Đảo Chính",   icon:"🗡️", spread:0.2, trigger:"stability<20",  effect:"replaces leadership, radical shift" },
  { id:"golden_revolution",  name:"Hoàng Kim Cách Mạng",  icon:"🌟", spread:0.25,trigger:"era==golden",   effect:"accelerates all culture stats" },
  { id:"isolationist_sect",  name:"Ẩn Sĩ Ly Khai",        icon:"🏔️", spread:0.15,trigger:"hermit>60",     effect:"breaks off region, forms sub-civ" },
  { id:"dark_cult",          name:"Tà Giáo Trỗi Dậy",     icon:"👁️", spread:0.3, trigger:"corruption>70", effect:"spreads chaos, buffs heretical civs" },
];

// ── SÁNG KIẾN VĂN HÓA ───────────────────────────────────────
const LCAI_INNOVATIONS = [
  { id:"iron_smelting",    name:"Luyện Sắt",         icon:"⚙️",  req:{military:30},           era:"ancient",      bonus:"Quân sự +15" },
  { id:"sea_trade",        name:"Hải Thương",         icon:"⛵",  req:{commercial:40},         era:"classical",    bonus:"Thương mại +20" },
  { id:"philosophy",       name:"Triết Học",          icon:"🏛️",  req:{scholarly:50},          era:"classical",    bonus:"Học thuật +15, Ổn định +5" },
  { id:"divine_codex",     name:"Thần Kinh Bộ",      icon:"📜",  req:{religious:60},          era:"medieval",     bonus:"Tôn giáo lan truyền 2x" },
  { id:"cultivation_art",  name:"Tu Luyện Pháp",     icon:"🌀",  req:{scholarly:70,hermit:40},era:"medieval",     bonus:"Xuất hiện tu sĩ mạnh hơn" },
  { id:"grand_fleet",      name:"Đại Hạm Đội",       icon:"🚢",  req:{commercial:70,military:50}, era:"renaissance", bonus:"Thương mại biển +30" },
  { id:"printing_press",   name:"Mộc Bản In",        icon:"📰",  req:{scholarly:80},          era:"renaissance",  bonus:"Ý thức phong trào lan nhanh 3x" },
  { id:"alchemy_labs",     name:"Luyện Đan Phòng",   icon:"⚗️",  req:{scholarly:90,hermit:50},era:"enlightened",  bonus:"Linh đan sản xuất, tu sĩ đột phá dễ hơn" },
  { id:"imperial_code",    name:"Đế Quốc Pháp Điển", icon:"⚖️",  req:{imperial:80,scholarly:60},era:"enlightened", bonus:"Tham nhũng -20, Ổn định +15" },
  { id:"heaven_accord",    name:"Thiên Hạ Hòa Ước",  icon:"☯️",  req:{diplomacy:90,religious:70},era:"transcendent",bonus:"Ngừng tất cả chiến tranh 50 năm" },
];

// ── INIT ─────────────────────────────────────────────────────
function lcaiInit() {
  if (!window.lcaiData) {
    const saved = localStorage.getItem(LCAI_SAVE_KEY);
    window.lcaiData = saved ? JSON.parse(saved) : _lcaiBuildDefault();
  }
  _lcaiMigrate();
  lcaiSave();
}

function _lcaiBuildDefault() {
  return {
    civilizations: {},
    movements: [],
    diffusions: [],
    civHistory: [],
    idCounter: 0,
    version: LCAI_VERSION,
    totalDecisions: 0,
    totalMovements: 0,
    totalGoldenAges: 0,
    totalDarkAges: 0,
    totalInnovations: 0,
  };
}

function _lcaiMigrate() {
  const d = window.lcaiData;
  if (!d.civilizations)   d.civilizations   = {};
  if (!d.movements)       d.movements       = [];
  if (!d.diffusions)      d.diffusions      = [];
  if (!d.civHistory)      d.civHistory      = [];
  if (!d.idCounter)       d.idCounter       = 0;
  if (!d.totalDecisions)  d.totalDecisions  = 0;
  if (!d.totalMovements)  d.totalMovements  = 0;
  if (!d.totalGoldenAges) d.totalGoldenAges = 0;
  if (!d.totalDarkAges)   d.totalDarkAges   = 0;
  if (!d.totalInnovations)d.totalInnovations= 0;

  // Sync civilizations from countries + kingdoms
  _lcaiSyncSources();
}

function _lcaiSyncSources() {
  const d = window.lcaiData;

  // From countries
  (window.countries || []).filter(c => !c.collapsed).forEach(c => {
    const exists = Object.values(d.civilizations).find(civ => civ.sourceId === c.id && civ.sourceType === "country");
    if (!exists) _lcaiBuildCiv(c.id, "country", c.name || "Vô Danh", c);
  });

  // From kingdoms
  if (window.kingdomData) {
    Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed).forEach(k => {
      const exists = Object.values(d.civilizations).find(civ => civ.sourceId === k.kingdomId && civ.sourceType === "kingdom");
      if (!exists) _lcaiBuildCiv(k.kingdomId, "kingdom", k.kingdomName, k);
    });
  }

  // Fallback: generate 4 sample civs if none exist
  if (Object.keys(d.civilizations).length === 0) {
    const samples = [
      { id:"civ_sample_0", name:"Đông Phong Đế Quốc",  icon:"🏯", traits:["military","imperial"] },
      { id:"civ_sample_1", name:"Nam Minh Thương Quốc", icon:"⛵", traits:["commercial","wanderer"] },
      { id:"civ_sample_2", name:"Tây Sơn Học Cung",     icon:"📚", traits:["scholarly","hermit"] },
      { id:"civ_sample_3", name:"Bắc Băng Thần Giáo",   icon:"🙏", traits:["religious","imperial"] },
    ];
    samples.forEach(s => {
      const civ = _lcaiBuildCiv(s.id, "independent", s.name, {});
      civ.icon   = s.icon;
      civ.traits = s.traits;
    });
  }
}

function _lcaiBuildCiv(sourceId, sourceType, name, source) {
  const d   = window.lcaiData;
  const id  = "lcai_" + (++d.idCounter);
  const traitPool = Object.keys(LCAI_TRAITS);
  const traits = [
    traitPool[Math.floor(Math.random() * traitPool.length)],
    traitPool[Math.floor(Math.random() * traitPool.length)],
  ].filter((t, i, a) => a.indexOf(t) === i);

  const pop = source.population || Math.floor(Math.random() * 80000 + 10000);

  const civ = {
    id, sourceId, sourceType, name,
    icon: source.icon || "🏛️",
    traits,

    // Linh Hồn Văn Minh
    values: {
      honor:   Math.floor(Math.random() * 60 + 20),
      harmony: Math.floor(Math.random() * 60 + 20),
      power:   Math.floor(Math.random() * 60 + 20),
      wisdom:  Math.floor(Math.random() * 60 + 20),
      freedom: Math.floor(Math.random() * 60 + 20),
      order:   Math.floor(Math.random() * 60 + 20),
    },

    // Văn Hóa
    culture: {
      arts:     Math.floor(Math.random() * 40 + 10),
      science:  Math.floor(Math.random() * 40 + 10),
      religion: Math.floor(Math.random() * 40 + 10),
      military: Math.floor(Math.random() * 40 + 10),
      commerce: Math.floor(Math.random() * 40 + 10),
    },
    cultureScore:  0,
    culturalAge:   LCAI_AGES[0].id,
    innovations:   [],

    // Dân số & Giai cấp
    population: {
      total:       typeof pop === "number" ? pop : 20000,
      upperClass:  Math.floor(Math.random() * 5  + 3),   // % thượng lưu
      middleClass: Math.floor(Math.random() * 20 + 20),  // % trung lưu
      lowerClass:  0,                                     // Sẽ tính toán
      scholars:    Math.floor(Math.random() * 8  + 2),   // %
      warriors:    Math.floor(Math.random() * 12 + 5),   // %
      merchants:   Math.floor(Math.random() * 10 + 3),   // %
      clergy:      Math.floor(Math.random() * 6  + 1),   // %
    },

    // Chính Trị Nội Bộ
    stability:      Math.floor(Math.random() * 40 + 40),
    corruption:     Math.floor(Math.random() * 30 + 5),
    reformPressure: 0,
    factions:       _lcaiBuildFactions(traits),

    // AI Trí Tuệ
    currentStrategy: Object.keys(LCAI_STRATEGIES)[Math.floor(Math.random() * 8)],
    mood:            "peaceful",
    strategyAge:     0,    // Bao nhiêu năm đã duy trì strategy này
    aggressionLevel: Math.floor(Math.random() * 40 + 10),

    // Thời Đại
    era:     "normal",     // normal | golden | dark | chaos
    eraYear: window.year || 1,
    eraProgress: 0,        // Tích lũy điểm dẫn đến golden/dark

    // Lịch Sử
    history:         [],
    decisionHistory: [],
    activeMovements: [],
  };

  // Tính lowerClass
  civ.population.lowerClass = Math.max(0, 100 - civ.population.upperClass - civ.population.middleClass);

  // Cộng điểm văn hóa ban đầu từ traits
  traits.forEach(t => {
    if (t === "military")   civ.culture.military = Math.min(100, civ.culture.military + 20);
    if (t === "commercial") civ.culture.commerce = Math.min(100, civ.culture.commerce + 20);
    if (t === "scholarly")  civ.culture.science  = Math.min(100, civ.culture.science  + 20);
    if (t === "religious")  civ.culture.religion = Math.min(100, civ.culture.religion + 20);
  });

  d.civilizations[id] = civ;
  return civ;
}

function _lcaiBuildFactions(traits) {
  const factionNames = {
    military:   ["Võ Hội","Thiết Vệ Đoàn","Chiến Thần Phái"],
    commercial: ["Thương Hội","Ngân Lâu Bang","Tài Phú Hội"],
    scholarly:  ["Văn Thánh Phái","Khổng Phu Viện","Thư Kiếm Đường"],
    religious:  ["Thiên Môn Đạo","Phật Tông Hội","Linh Sơn Giáo"],
    imperial:   ["Hoàng Thất Phái","Thiên Tử Vệ","Ngai Vàng Đảng"],
    hermit:     ["Ẩn Thế Môn","Vô Vi Phái","Lão Tử Đường"],
    wanderer:   ["Giang Hồ Bang","Tứ Hải Hội","Lãng Nhân Đoàn"],
    heretical:  ["Ma Đạo Hội","Hắc Liên Hoa","Tà Tông Bang"],
  };
  const factions = [];
  const mainTrait = traits[0] || "military";
  const pool = factionNames[mainTrait] || ["Phái A","Phái B"];
  for (let i = 0; i < 3; i++) {
    factions.push({
      name:      pool[i] || ("Phái " + i),
      ideology:  traits[i % traits.length] || "military",
      influence: Math.floor(Math.random() * 40 + 20),
      loyalty:   Math.floor(Math.random() * 50 + 30),
      isRuling:  i === 0,
    });
  }
  return factions;
}

function lcaiSave() {
  try { localStorage.setItem(LCAI_SAVE_KEY, JSON.stringify(window.lcaiData)); } catch(e) {}
}

// ── TICK CHỦ ─────────────────────────────────────────────────
function lcaiTick() {
  if (!window.lcaiData || !window.world) return;
  const year = window.year || 0;
  const d    = window.lcaiData;

  // Sync new civs từ game
  if (year % 15 === 0) _lcaiSyncSources();

  Object.values(d.civilizations).forEach(civ => {
    _lcaiCultureTick(civ, year);
    _lcaiPopulationTick(civ, year);
    _lcaiPoliticsTick(civ, year);
    _lcaiAIDecisionTick(civ, year);
    _lcaiEraTick(civ, year);
  });

  // Phong trào ý thức lây lan
  if (year % 10 === 0) _lcaiMovementTick(year);

  // Khuếch tán văn hóa giữa các nền văn minh
  if (year % 20 === 0) _lcaiDiffusionTick(year);

  // Kiểm tra sáng kiến
  if (year % 30 === 0) _lcaiInnovationTick(year);

  lcaiSave();
}

// ── VĂN HÓA TICK ─────────────────────────────────────────────
function _lcaiCultureTick(civ, year) {
  // Mỗi trait tự nhiên boost stat liên quan
  civ.traits.forEach(t => {
    if (t === "military"  ) civ.culture.military = Math.min(100, civ.culture.military + _lcaiRandInt(1,3));
    if (t === "commercial") civ.culture.commerce = Math.min(100, civ.culture.commerce + _lcaiRandInt(1,3));
    if (t === "scholarly" ) civ.culture.science  = Math.min(100, civ.culture.science  + _lcaiRandInt(1,3));
    if (t === "religious" ) civ.culture.religion = Math.min(100, civ.culture.religion + _lcaiRandInt(1,3));
    if (t === "imperial"  ) civ.culture.arts     = Math.min(100, civ.culture.arts     + _lcaiRandInt(0,2));
  });

  // Stability ảnh hưởng tăng trưởng văn hóa
  const stabilityMult = civ.stability / 100;
  if (Math.random() < 0.4 * stabilityMult) {
    const keys = ["arts","science","religion","military","commerce"];
    const key  = keys[Math.floor(Math.random() * keys.length)];
    civ.culture[key] = Math.min(100, civ.culture[key] + 1);
  }

  // Corruption làm giảm văn hóa
  if (civ.corruption > 50 && Math.random() < 0.2) {
    const keys = ["arts","science","commerce"];
    const key  = keys[Math.floor(Math.random() * keys.length)];
    civ.culture[key] = Math.max(0, civ.culture[key] - 1);
  }

  // Tính tổng điểm văn hóa
  civ.cultureScore = Object.values(civ.culture).reduce((a,b) => a+b, 0);

  // Nâng cấp thời đại văn minh
  for (let i = LCAI_AGES.length - 1; i >= 0; i--) {
    if (civ.cultureScore >= LCAI_AGES[i].threshold) {
      const newAge = LCAI_AGES[i].id;
      if (civ.culturalAge !== newAge) {
        const old = LCAI_AGES.find(a => a.id === civ.culturalAge);
        const now = LCAI_AGES[i];
        civ.culturalAge = newAge;
        const msg = `🌟 [${civ.name}] Bước vào Thời Đại ${now.icon} ${now.name}!`;
        civ.history.push({ year, type:"age_advance", text: msg });
        _lcaiAddHistory(msg, year);
        if (typeof addLog === "function") addLog(msg, "important");
        if (typeof htAddEvent === "function") htAddEvent({ year, type:"civ_age_advance", text: msg });
      }
      break;
    }
  }
}

// ── DÂN SỐ TICK ─────────────────────────────────────────────
function _lcaiPopulationTick(civ, year) {
  const pop = civ.population;

  // Tăng trưởng dân số dựa trên stability và era
  let growthRate = 0.01 + (civ.stability / 100) * 0.02;
  if (civ.era === "golden") growthRate *= 1.8;
  if (civ.era === "dark"  ) growthRate *= 0.4;
  if (civ.era === "chaos" ) growthRate *= 0.2;

  const growth = Math.floor(pop.total * growthRate * (0.8 + Math.random() * 0.4));
  pop.total = Math.max(1000, pop.total + growth);

  // Cải tổ giai cấp theo culture
  if (civ.culture.commerce > 60 && pop.middleClass < 40) {
    pop.middleClass = Math.min(45, pop.middleClass + 1);
    pop.lowerClass  = Math.max(10, pop.lowerClass  - 1);
  }
  if (civ.culture.science > 70 && pop.scholars < 15) {
    pop.scholars = Math.min(20, pop.scholars + 1);
  }
  if (civ.culture.military > 70 && pop.warriors < 20) {
    pop.warriors = Math.min(25, pop.warriors + 1);
  }

  // Kiểm tra áp lực cách mạng
  if (pop.lowerClass > 60 && civ.stability < 35) {
    civ.reformPressure = Math.min(100, civ.reformPressure + 8);
  } else {
    civ.reformPressure = Math.max(0, civ.reformPressure - 2);
  }

  // Tính lại lowerClass
  pop.lowerClass = Math.max(0, 100 - pop.upperClass - pop.middleClass);
}

// ── CHÍNH TRỊ TICK ───────────────────────────────────────────
function _lcaiPoliticsTick(civ, year) {
  // Tham nhũng tự nhiên tăng theo thời gian
  if (Math.random() < 0.3) {
    civ.corruption = Math.min(100, civ.corruption + _lcaiRandInt(0, 2));
  }

  // Cải cách giảm tham nhũng khi strategy là reform/consolidate
  if ((civ.currentStrategy === "reform" || civ.currentStrategy === "consolidate") && Math.random() < 0.4) {
    civ.corruption  = Math.max(0,  civ.corruption  - _lcaiRandInt(2, 5));
    civ.stability   = Math.min(100,civ.stability   + _lcaiRandInt(1, 3));
    civ.reformPressure = Math.max(0, civ.reformPressure - 5);
  }

  // Chiến tranh ảnh hưởng ổn định
  if (civ.currentStrategy === "war" && Math.random() < 0.3) {
    civ.stability = Math.max(0, civ.stability - _lcaiRandInt(1, 4));
  }

  // Faction đấu tranh
  civ.factions.forEach((f, i) => {
    f.influence += _lcaiRandInt(-3, 3);
    f.influence  = Math.max(5, Math.min(95, f.influence));
    f.loyalty   += _lcaiRandInt(-2, 2);
    f.loyalty    = Math.max(10, Math.min(100, f.loyalty));
  });

  // Kiểm tra đảo chính
  const rulingFaction = civ.factions.find(f => f.isRuling);
  const challenger    = civ.factions.find(f => !f.isRuling && f.influence > (rulingFaction?.influence || 50) + 20);
  if (challenger && Math.random() < 0.05 && civ.stability < 40) {
    const old = rulingFaction?.name || "cũ";
    if (rulingFaction) rulingFaction.isRuling = false;
    challenger.isRuling = true;
    civ.stability = Math.max(10, civ.stability - 15);
    const msg = `⚔️ [${civ.name}] Đảo chính! ${challenger.name} lật đổ ${old}, nắm quyền lực!`;
    civ.history.push({ year, type:"coup", text: msg });
    _lcaiAddHistory(msg, year);
    if (typeof addLog === "function") addLog(msg, "warn");
    if (typeof htAddEvent === "function") htAddEvent({ year, type:"political_coup", text: msg });
  }

  // Cải cách khi áp lực đủ cao
  if (civ.reformPressure > 70 && Math.random() < 0.3) {
    const reform = _lcaiRandItem(["Ruộng đất cải cách","Thuế khóa bình đẳng","Giáo dục mở rộng","Thương mại tự do"]);
    civ.stability       = Math.min(100, civ.stability      + 15);
    civ.corruption      = Math.max(0,   civ.corruption     - 10);
    civ.reformPressure  = Math.max(0,   civ.reformPressure - 40);
    civ.population.middleClass = Math.min(45, civ.population.middleClass + 3);
    const msg = `📜 [${civ.name}] Cải cách lớn: ${reform}!`;
    civ.history.push({ year, type:"reform", text: msg });
    _lcaiAddHistory(msg, year);
    if (typeof addLog === "function") addLog(msg, "info");
  }
}

// ── AI QUYẾT ĐỊNH TICK ───────────────────────────────────────
function _lcaiAIDecisionTick(civ, year) {
  civ.strategyAge = (civ.strategyAge || 0) + 1;

  // Thay đổi strategy mỗi 15-30 năm, hoặc khi điều kiện đặc biệt
  const shouldDecide = civ.strategyAge >= _lcaiRandInt(15, 30)
    || civ.stability < 20
    || civ.reformPressure > 80;

  if (!shouldDecide) return;

  const oldStrategy = civ.currentStrategy;
  civ.currentStrategy = _lcaiPickStrategy(civ);
  civ.strategyAge     = 0;
  window.lcaiData.totalDecisions++;

  const strat = LCAI_STRATEGIES[civ.currentStrategy];
  const msg = `🧠 [${civ.name}] Quyết sách: ${strat.icon} ${strat.name} — ${strat.desc}`;
  civ.decisionHistory.unshift({ year, from: oldStrategy, to: civ.currentStrategy, text: msg });
  if (civ.decisionHistory.length > 10) civ.decisionHistory.pop();

  _lcaiAddHistory(msg, year);
  if (typeof addLog === "function") addLog(msg, "info");
  if (typeof htAddEvent === "function") htAddEvent({ year, type:"civ_decision", text: msg });

  // Thực hiện hành động theo strategy
  _lcaiExecuteStrategy(civ, year);
}

function _lcaiPickStrategy(civ) {
  // Logic ưu tiên dựa trên trạng thái civ
  if (civ.stability < 20)          return "consolidate";
  if (civ.reformPressure > 75)     return "reform";
  if (civ.corruption > 70)         return "reform";

  const traitBonus = {};
  civ.traits.forEach(t => {
    if (t === "military")   traitBonus["war"]       = (traitBonus["war"]||0)       + 25;
    if (t === "commercial") traitBonus["trade"]      = (traitBonus["trade"]||0)     + 25;
    if (t === "scholarly")  traitBonus["cultural"]   = (traitBonus["cultural"]||0)  + 20;
    if (t === "religious")  traitBonus["diplomacy"]  = (traitBonus["diplomacy"]||0) + 20;
    if (t === "imperial")   traitBonus["expand"]     = (traitBonus["expand"]||0)    + 30;
    if (t === "hermit")     traitBonus["isolate"]    = (traitBonus["isolate"]||0)   + 30;
    if (t === "wanderer")   traitBonus["trade"]      = (traitBonus["trade"]||0)     + 15;
    if (t === "heretical")  traitBonus["war"]        = (traitBonus["war"]||0)       + 10;
  });

  // Cộng randomness
  const options = Object.keys(LCAI_STRATEGIES).map(s => ({
    id: s,
    score: (traitBonus[s] || 0) + Math.random() * 30,
  }));
  options.sort((a, b) => b.score - a.score);
  return options[0].id;
}

function _lcaiExecuteStrategy(civ, year) {
  switch (civ.currentStrategy) {
    case "expand":
      civ.aggressionLevel = Math.min(100, civ.aggressionLevel + 10);
      civ.population.warriors = Math.min(30, civ.population.warriors + 2);
      break;
    case "trade":
      civ.culture.commerce = Math.min(100, civ.culture.commerce + 5);
      civ.population.merchants = Math.min(20, civ.population.merchants + 1);
      break;
    case "cultural":
      civ.culture.arts    = Math.min(100, civ.culture.arts    + 5);
      civ.culture.science = Math.min(100, civ.culture.science + 3);
      break;
    case "reform":
      civ.corruption  = Math.max(0,   civ.corruption  - 8);
      civ.stability   = Math.min(100, civ.stability   + 8);
      break;
    case "isolate":
      civ.aggressionLevel = Math.max(0,   civ.aggressionLevel - 15);
      civ.stability       = Math.min(100, civ.stability       + 5);
      break;
    case "war":
      civ.culture.military = Math.min(100, civ.culture.military + 8);
      civ.stability        = Math.max(0,   civ.stability        - 5);
      break;
    case "diplomacy":
      civ.stability = Math.min(100, civ.stability + 6);
      civ.aggressionLevel = Math.max(0, civ.aggressionLevel - 10);
      break;
  }
}

// ── THỜI ĐẠI (GOLDEN / DARK) ─────────────────────────────────
function _lcaiEraTick(civ, year) {
  const score = civ.stability * 0.4 + (100 - civ.corruption) * 0.3
              + (civ.cultureScore / 5) * 0.3;

  // Tích lũy điểm era
  civ.eraProgress = (civ.eraProgress || 0) + (score > 70 ? 2 : score < 35 ? -2 : 0);
  civ.eraProgress = Math.max(-100, Math.min(100, civ.eraProgress));

  if (civ.era === "normal") {
    if (civ.eraProgress >= 80  && Math.random() < 0.3) _lcaiEnterGoldenAge(civ, year);
    if (civ.eraProgress <= -80 && Math.random() < 0.3) _lcaiEnterDarkAge(civ, year);
  } else {
    // Thời đại kết thúc sau 50-100 năm
    const duration = year - (civ.eraYear || 0);
    if (duration > _lcaiRandInt(50, 100)) {
      civ.era         = "normal";
      civ.eraProgress = 0;
      const msg = `🌅 [${civ.name}] Kết thúc thời đại ${civ.era === "golden" ? "Hoàng Kim" : "Hắc Ám"}.`;
      civ.history.push({ year, type:"era_end", text: msg });
      _lcaiAddHistory(msg, year);
    }
  }
}

function _lcaiEnterGoldenAge(civ, year) {
  civ.era         = "golden";
  civ.eraYear     = year;
  civ.eraProgress = 0;
  window.lcaiData.totalGoldenAges++;

  // Bonus
  civ.stability = Math.min(100, civ.stability + 15);
  Object.keys(civ.culture).forEach(k => {
    civ.culture[k] = Math.min(100, civ.culture[k] + 8);
  });
  const msg = `✨ [${civ.name}] Bước vào THỜI HOÀNG KIM! Văn minh hưng thịnh!`;
  civ.history.push({ year, type:"golden_age", text: msg });
  _lcaiAddHistory(msg, year);
  if (typeof addLog === "function") addLog(msg, "important");
  if (typeof htAddEvent === "function") htAddEvent({ year, type:"golden_age", text: msg });
}

function _lcaiEnterDarkAge(civ, year) {
  civ.era         = "dark";
  civ.eraYear     = year;
  civ.eraProgress = 0;
  window.lcaiData.totalDarkAges++;

  // Penalty
  civ.stability   = Math.max(0, civ.stability - 20);
  civ.corruption  = Math.min(100, civ.corruption + 15);
  civ.population.total = Math.floor(civ.population.total * 0.85);
  const msg = `💀 [${civ.name}] Chìm vào THỜI ĐEN TỐI. Văn minh suy tàn!`;
  civ.history.push({ year, type:"dark_age", text: msg });
  _lcaiAddHistory(msg, year);
  if (typeof addLog === "function") addLog(msg, "warn");
  if (typeof htAddEvent === "function") htAddEvent({ year, type:"dark_age", text: msg });
}

// ── PHONG TRÀO TICK ──────────────────────────────────────────
function _lcaiMovementTick(year) {
  const civs = Object.values(window.lcaiData.civilizations);
  if (civs.length === 0) return;

  LCAI_MOVEMENT_TYPES.forEach(mtype => {
    if (Math.random() > 0.2) return;

    // Tìm civ phù hợp điều kiện
    const eligible = civs.filter(civ => {
      try { return _lcaiEvalTrigger(mtype.trigger, civ); } catch(e) { return false; }
    });
    if (eligible.length === 0) return;

    const origin = eligible[Math.floor(Math.random() * eligible.length)];
    const existing = window.lcaiData.movements.find(m => m.typeId === mtype.id && m.originId === origin.id);
    if (existing) return;

    const movement = {
      id:         "move_" + (++window.lcaiData.idCounter),
      typeId:     mtype.id,
      name:       mtype.name,
      icon:       mtype.icon,
      originId:   origin.id,
      originName: origin.name,
      spreadTo:   [origin.id],
      startYear:  year,
      strength:   Math.floor(Math.random() * 40 + 20),
      isActive:   true,
    };
    window.lcaiData.movements.push(movement);
    window.lcaiData.totalMovements++;

    // Áp dụng hiệu ứng lên origin
    _lcaiApplyMovement(mtype, origin, year);

    const msg = `${mtype.icon} [${origin.name}] Phong trào "${mtype.name}" nổi dậy!`;
    _lcaiAddHistory(msg, year);
    if (typeof addLog === "function") addLog(msg, "warn");
    if (typeof htAddEvent === "function") htAddEvent({ year, type:"movement", text: msg });
  });

  // Lan truyền phong trào hiện có
  window.lcaiData.movements.filter(m => m.isActive).forEach(m => {
    const mtype = LCAI_MOVEMENT_TYPES.find(t => t.id === m.typeId);
    if (!mtype) return;

    civs.filter(civ => !m.spreadTo.includes(civ.id) && Math.random() < mtype.spread * 0.3)
      .slice(0, 1).forEach(target => {
        m.spreadTo.push(target.id);
        _lcaiApplyMovement(mtype, target, year);
        const msg = `${mtype.icon} Phong trào "${m.name}" lan sang [${target.name}]!`;
        _lcaiAddHistory(msg, year);
      });

    // Phong trào kết thúc sau 50-80 năm
    if (year - m.startYear > _lcaiRandInt(50, 80)) m.isActive = false;
  });
}

function _lcaiEvalTrigger(trigger, civ) {
  if (trigger.includes("stability<")) {
    const val = parseInt(trigger.split("stability<")[1]);
    return civ.stability < val;
  }
  if (trigger.includes("commercial>")) {
    const val = parseInt(trigger.split("commercial>")[1]);
    return civ.culture.commerce > val;
  }
  if (trigger.includes("scholarly>")) {
    const val = parseInt(trigger.split("scholarly>")[1]);
    return civ.culture.science > val;
  }
  if (trigger.includes("religious>")) {
    const val = parseInt(trigger.split("religious>")[1]);
    return civ.culture.religion > val;
  }
  if (trigger.includes("hermit>")) {
    const val = parseInt(trigger.split("hermit>")[1]);
    return civ.traits.includes("hermit") && civ.culture.science > val;
  }
  if (trigger.includes("corruption>")) {
    const val = parseInt(trigger.split("corruption>")[1]);
    return civ.corruption > val;
  }
  if (trigger === "era==golden") return civ.era === "golden";
  return false;
}

function _lcaiApplyMovement(mtype, civ, year) {
  switch (mtype.id) {
    case "peasant_uprising":
      civ.stability        = Math.max(0,   civ.stability        - 12);
      civ.population.upperClass = Math.max(1, civ.population.upperClass - 2);
      civ.reformPressure   = Math.min(100, civ.reformPressure   + 20);
      break;
    case "merchant_guild":
      civ.culture.commerce = Math.min(100, civ.culture.commerce + 10);
      civ.culture.military = Math.max(0,   civ.culture.military -  5);
      civ.population.merchants = Math.min(20, civ.population.merchants + 2);
      break;
    case "scholar_reform":
      civ.culture.science  = Math.min(100, civ.culture.science  + 10);
      civ.corruption       = Math.max(0,   civ.corruption       -  8);
      civ.population.scholars = Math.min(20, civ.population.scholars + 2);
      break;
    case "religious_revival":
      civ.culture.religion = Math.min(100, civ.culture.religion + 12);
      civ.stability        = Math.min(100, civ.stability        +  8);
      civ.population.clergy = Math.min(15, civ.population.clergy + 2);
      break;
    case "military_coup":
      civ.stability        = Math.max(0,   civ.stability        - 15);
      civ.culture.military = Math.min(100, civ.culture.military + 10);
      civ.aggressionLevel  = Math.min(100, civ.aggressionLevel  + 15);
      break;
    case "golden_revolution":
      Object.keys(civ.culture).forEach(k => {
        civ.culture[k] = Math.min(100, civ.culture[k] + 5);
      });
      break;
    case "isolationist_sect":
      civ.aggressionLevel  = Math.max(0,   civ.aggressionLevel  - 20);
      civ.stability        = Math.min(100, civ.stability        + 10);
      break;
    case "dark_cult":
      civ.corruption       = Math.min(100, civ.corruption       + 15);
      civ.stability        = Math.max(0,   civ.stability        - 10);
      break;
  }
}

// ── KHUẾCH TÁN VĂN HÓA ──────────────────────────────────────
function _lcaiDiffusionTick(year) {
  const civs = Object.values(window.lcaiData.civilizations);
  if (civs.length < 2) return;

  // Chọn cặp ngẫu nhiên
  const a = civs[Math.floor(Math.random() * civs.length)];
  const b = civs.find(c => c.id !== a.id);
  if (!a || !b) return;

  // Civ có văn hóa cao hơn truyền cho civ thấp hơn
  const dominant = a.cultureScore >= b.cultureScore ? a : b;
  const receiver  = a.cultureScore >= b.cultureScore ? b : a;

  if (dominant.cultureScore - receiver.cultureScore < 30) return;

  const keys = Object.keys(dominant.culture);
  const key  = keys[Math.floor(Math.random() * keys.length)];
  const diff = Math.floor((dominant.culture[key] - receiver.culture[key]) * 0.1);
  if (diff <= 0) return;

  receiver.culture[key] = Math.min(100, receiver.culture[key] + diff);

  const record = {
    id:           "diff_" + (++window.lcaiData.idCounter),
    year,
    fromName:     dominant.name,
    toName:       receiver.name,
    attribute:    key,
    amount:       diff,
    type:         "cultural_diffusion",
  };
  window.lcaiData.diffusions.unshift(record);
  if (window.lcaiData.diffusions.length > 40) window.lcaiData.diffusions.pop();
}

// ── SÁNG KIẾN TICK ───────────────────────────────────────────
function _lcaiInnovationTick(year) {
  Object.values(window.lcaiData.civilizations).forEach(civ => {
    LCAI_INNOVATIONS.forEach(innov => {
      if (civ.innovations.includes(innov.id)) return;

      // Kiểm tra điều kiện
      const meetsReqs = Object.entries(innov.req).every(([stat, val]) => {
        if (stat === "military")   return civ.culture.military >= val;
        if (stat === "commercial") return civ.culture.commerce >= val;
        if (stat === "scholarly")  return civ.culture.science  >= val;
        if (stat === "religious")  return civ.culture.religion >= val;
        if (stat === "hermit")     return civ.traits.includes("hermit");
        if (stat === "imperial")   return civ.traits.includes("imperial");
        if (stat === "diplomacy")  return civ.stability > val;
        return true;
      });

      if (!meetsReqs) return;
      if (Math.random() > 0.25) return;

      civ.innovations.push(innov.id);
      window.lcaiData.totalInnovations++;
      const msg = `💡 [${civ.name}] Sáng kiến: ${innov.icon} ${innov.name}! (${innov.bonus})`;
      civ.history.push({ year, type:"innovation", text: msg });
      _lcaiAddHistory(msg, year);
      if (typeof addLog === "function") addLog(msg, "info");
      if (typeof htAddEvent === "function") htAddEvent({ year, type:"innovation", text: msg });
    });
  });
}

// ── HELPERS ──────────────────────────────────────────────────
function _lcaiAddHistory(text, year) {
  const d = window.lcaiData;
  d.civHistory.unshift({ year, text });
  if (d.civHistory.length > 100) d.civHistory.pop();
}
function _lcaiRandInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _lcaiRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── RENDER PANEL ─────────────────────────────────────────────
function lcaiRenderPanel() {
  const panel = document.getElementById("panel-living-civ");
  if (!panel) return;
  if (!window.lcaiData) lcaiInit();

  const d    = window.lcaiData;
  const civs = Object.values(d.civilizations);

  panel.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">

      <!-- HEADER -->
      <div style="padding:16px 20px 12px;border-bottom:1px solid rgba(251,191,36,0.2);background:rgba(0,0,0,0.4);flex-shrink:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-title);font-size:18px;color:#fbbf24;letter-spacing:2px">🧠 VĂN MINH SỐNG ĐỘNG AI</div>
            <div style="font-size:11px;color:var(--white-dim);margin-top:2px">Linh hồn văn minh · Chiến lược AI · Văn hóa tiến hóa · Chính trị nội bộ · Phong trào ý thức</div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="lcaiTick();lcaiRenderPanel()" style="padding:6px 14px;border-radius:8px;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.1);color:#fbbf24;cursor:pointer;font-size:11px">▶ Mô phỏng</button>
            <button onclick="lcaiRenderPanel()" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--white-dim);cursor:pointer;font-size:11px">🔄</button>
          </div>
        </div>

        <!-- STATS -->
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px">
          ${[
            ["🏛️","Văn minh",      civs.length,                       "#60a5fa"],
            ["✨","Hoàng Kim",     d.totalGoldenAges,                 "#fbbf24"],
            ["💀","Đen Tối",       d.totalDarkAges,                   "#6b7280"],
            ["🧠","Quyết sách",   d.totalDecisions,                  "#c084fc"],
            ["🌾","Phong trào",   d.totalMovements,                  "#f97316"],
            ["💡","Sáng kiến",    d.totalInnovations,                "#4ade80"],
          ].map(([icon,label,val,color]) => `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:14px">${icon}</div>
              <div style="font-size:14px;font-weight:800;color:${color}">${val}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${label}</div>
            </div>`).join("")}
        </div>

        <!-- TABS -->
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[
            ["civilizations","🏛️ Văn Minh"],
            ["ai_decisions", "🧠 Quyết Sách AI"],
            ["politics",     "⚔️ Chính Trị"],
            ["culture",      "🎨 Văn Hóa"],
            ["chronicle",    "📜 Biên Niên"],
          ].map(([tab,label],i) => `
            <button onclick="lcaiShowTab('${tab}')" id="lcai-tab-${tab}"
              style="padding:5px 14px;border-radius:6px;border:1px solid rgba(251,191,36,${i===0?'0.6':'0.2'});
              background:rgba(251,191,36,${i===0?'0.15':'0.05'});color:${i===0?'#fbbf24':'var(--white-dim)'};
              cursor:pointer;font-size:11px">${label}</button>`).join("")}
        </div>
      </div>

      <!-- CONTENT -->
      <div id="lcai-content" style="flex:1;overflow-y:auto;padding:16px 20px">
        ${lcaiRenderCivTab()}
      </div>
    </div>`;
}

function lcaiShowTab(tab) {
  ["civilizations","ai_decisions","politics","culture","chronicle"].forEach(t => {
    const btn = document.getElementById("lcai-tab-" + t);
    if (!btn) return;
    const active = t === tab;
    btn.style.borderColor = `rgba(251,191,36,${active?'0.6':'0.2'})`;
    btn.style.background  = `rgba(251,191,36,${active?'0.15':'0.05'})`;
    btn.style.color       = active ? "#fbbf24" : "var(--white-dim)";
  });
  const c = document.getElementById("lcai-content");
  if (!c) return;
  if (tab === "civilizations") c.innerHTML = lcaiRenderCivTab();
  if (tab === "ai_decisions")  c.innerHTML = lcaiRenderDecisionsTab();
  if (tab === "politics")      c.innerHTML = lcaiRenderPoliticsTab();
  if (tab === "culture")       c.innerHTML = lcaiRenderCultureTab();
  if (tab === "chronicle")     c.innerHTML = lcaiRenderChronicleTab();
}

// ── TAB: VĂN MINH ────────────────────────────────────────────
function lcaiRenderCivTab() {
  const civs = Object.values(window.lcaiData?.civilizations || {});
  if (civs.length === 0) return `<div style="text-align:center;padding:60px;color:var(--white-dim)"><div style="font-size:48px">🏛️</div><div>Chưa có nền văn minh. Tạo thế giới để bắt đầu.</div></div>`;

  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">
    ${civs.map(civ => {
      const age     = LCAI_AGES.find(a => a.id === civ.culturalAge) || LCAI_AGES[0];
      const strat   = LCAI_STRATEGIES[civ.currentStrategy] || LCAI_STRATEGIES.consolidate;
      const eraColor= { golden:"#fbbf24", dark:"#6b7280", chaos:"#f87171", normal:"#60a5fa" }[civ.era] || "#60a5fa";
      const eraLabel= { golden:"✨ Hoàng Kim", dark:"💀 Đen Tối", chaos:"🌪️ Hỗn Loạn", normal:"⚖️ Bình Thường" }[civ.era] || "Bình Thường";

      return `
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(251,191,36,0.12);border-top:2px solid ${eraColor};border-radius:12px;padding:14px">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-family:var(--font-title);font-size:15px;color:#fbbf24">${civ.icon} ${civ.name}</div>
              <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
                ${civ.traits.map(t => {
                  const td = LCAI_TRAITS[t];
                  return td ? `<span style="font-size:9px;padding:2px 7px;border-radius:8px;background:${td.color}12;border:1px solid ${td.color}35;color:${td.color}">${td.icon} ${td.name}</span>` : "";
                }).join("")}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:9px;padding:3px 9px;border-radius:8px;background:${eraColor}15;border:1px solid ${eraColor}40;color:${eraColor}">${eraLabel}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:3px">${age.icon} ${age.name}</div>
            </div>
          </div>

          <!-- Core stats -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
            ${[
              ["⚖️","Ổn định",   civ.stability,   civ.stability>65?"#4ade80":civ.stability>35?"#fbbf24":"#f87171"],
              ["🦠","Tham nhũng",civ.corruption,  civ.corruption<30?"#4ade80":civ.corruption<60?"#fbbf24":"#f87171"],
              ["🌋","Cải cách",  civ.reformPressure, civ.reformPressure>60?"#f87171":"#60a5fa"],
            ].map(([icon,label,val,color]) => `
              <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px">
                <div style="font-size:9px;color:var(--white-dim)">${icon} ${label}</div>
                <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:5px;margin-top:4px;overflow:hidden">
                  <div style="height:100%;width:${val}%;background:${color};border-radius:4px;transition:width .3s"></div>
                </div>
                <div style="font-size:10px;color:${color};font-weight:700;margin-top:2px">${val}</div>
              </div>`).join("")}
          </div>

          <!-- Strategy AI -->
          <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:8px;margin-bottom:10px">
            <div style="font-size:9px;color:var(--white-dim);margin-bottom:2px">🧠 Chiến lược hiện tại</div>
            <div style="font-size:11px;color:#fbbf24;font-weight:600">${strat.icon} ${strat.name}</div>
            <div style="font-size:9px;color:var(--white-dim);margin-top:2px">${strat.desc}</div>
          </div>

          <!-- Population -->
          <div style="margin-bottom:8px">
            <div style="font-size:9px;color:var(--white-dim);margin-bottom:5px">👥 DÂN SỐ: ${civ.population.total.toLocaleString()}</div>
            <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;gap:1px">
              <div style="flex:${civ.population.upperClass};background:#fbbf24" title="Thượng lưu ${civ.population.upperClass}%"></div>
              <div style="flex:${civ.population.middleClass};background:#60a5fa" title="Trung lưu ${civ.population.middleClass}%"></div>
              <div style="flex:${civ.population.lowerClass};background:#6b7280" title="Hạ dân ${civ.population.lowerClass}%"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:3px">
              <span style="font-size:8px;color:#fbbf24">Thượng ${civ.population.upperClass}%</span>
              <span style="font-size:8px;color:#60a5fa">Trung ${civ.population.middleClass}%</span>
              <span style="font-size:8px;color:#6b7280">Hạ ${civ.population.lowerClass}%</span>
            </div>
          </div>

          <!-- Culture bars -->
          <div style="display:flex;gap:3px;align-items:flex-end;height:40px;margin-bottom:6px">
            ${[
              ["🎨","arts",    "#c084fc"],
              ["🔬","science", "#60a5fa"],
              ["🙏","religion","#fbbf24"],
              ["⚔️","military","#f87171"],
              ["💰","commerce","#4ade80"],
            ].map(([icon,key,color]) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
                <div style="font-size:8px;color:${color};font-weight:700">${civ.culture[key]}</div>
                <div style="width:100%;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;height:${Math.max(4,civ.culture[key]*0.3)}px">
                  <div style="height:100%;background:${color};border-radius:2px"></div>
                </div>
                <div style="font-size:8px">${icon}</div>
              </div>`).join("")}
          </div>

          <!-- Innovations -->
          ${civ.innovations.length > 0 ? `
            <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:6px">
              <div style="font-size:9px;color:var(--white-dim);margin-bottom:3px">💡 Sáng kiến (${civ.innovations.length})</div>
              <div style="display:flex;flex-wrap:wrap;gap:3px">
                ${civ.innovations.map(id => {
                  const inn = LCAI_INNOVATIONS.find(i => i.id === id);
                  return inn ? `<span style="font-size:9px;padding:1px 6px;border-radius:6px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);color:#4ade80">${inn.icon} ${inn.name}</span>` : "";
                }).join("")}
              </div>
            </div>` : ""}
        </div>`;
    }).join("")}
  </div>`;
}

// ── TAB: QUYẾT SÁCH AI ───────────────────────────────────────
function lcaiRenderDecisionsTab() {
  const civs = Object.values(window.lcaiData?.civilizations || {});
  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${civs.map(civ => {
        const strat = LCAI_STRATEGIES[civ.currentStrategy] || {};
        return `
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(251,191,36,0.1);border-radius:10px;padding:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-family:var(--font-title);font-size:13px;color:#fbbf24">${civ.icon} ${civ.name}</div>
              <div style="font-size:11px;padding:3px 10px;border-radius:6px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:#fbbf24">${strat.icon||""} ${strat.name||civ.currentStrategy}</div>
            </div>
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:8px">${strat.desc||""} · Đã thực hiện ${civ.strategyAge||0} năm</div>
            ${civ.decisionHistory?.length > 0 ? `
              <div style="font-size:9px;color:var(--white-dim);margin-bottom:4px">📜 Lịch sử quyết sách</div>
              <div style="display:flex;flex-direction:column;gap:3px">
                ${civ.decisionHistory.slice(0,4).map(dh => `
                  <div style="font-size:9px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:var(--white-dim)">
                    Năm ${dh.year}: ${LCAI_STRATEGIES[dh.from]?.name||dh.from} → ${LCAI_STRATEGIES[dh.to]?.name||dh.to}
                  </div>`).join("")}
              </div>` : ""}
          </div>`;
      }).join("")}

      <!-- Phong trào active -->
      <div>
        <div style="font-size:12px;color:#f97316;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">🌾 PHONG TRÀO ĐANG HOẠT ĐỘNG</div>
        ${(window.lcaiData?.movements||[]).filter(m=>m.isActive).length === 0
          ? `<div style="color:var(--white-dim);font-size:11px;font-style:italic">Không có phong trào nào đang hoạt động.</div>`
          : (window.lcaiData?.movements||[]).filter(m=>m.isActive).map(m => {
              const mt = LCAI_MOVEMENT_TYPES.find(t => t.id === m.typeId);
              return `
                <div style="padding:10px 12px;border-radius:8px;background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,0.15);margin-bottom:6px">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <div style="font-size:12px;color:#f97316">${m.icon} ${m.name}</div>
                    <div style="font-size:9px;color:var(--white-dim)">Lan tới ${m.spreadTo.length} văn minh</div>
                  </div>
                  <div style="font-size:10px;color:var(--white-dim);margin-top:3px">Từ ${m.originName} · Năm ${m.startYear} · ${mt?.effect||""}</div>
                </div>`;
            }).join("")}
      </div>
    </div>`;
}

// ── TAB: CHÍNH TRỊ ───────────────────────────────────────────
function lcaiRenderPoliticsTab() {
  const civs = Object.values(window.lcaiData?.civilizations || {});
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
      ${civs.map(civ => `
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(192,132,252,0.12);border-radius:10px;padding:12px">
          <div style="font-family:var(--font-title);font-size:13px;color:#c084fc;margin-bottom:8px">${civ.icon} ${civ.name}</div>

          <!-- Factions -->
          <div style="margin-bottom:10px">
            <div style="font-size:9px;color:var(--white-dim);margin-bottom:5px">⚔️ PHÁI HỆ NỘI BỘ</div>
            ${civ.factions.map(f => {
              const td = LCAI_TRAITS[f.ideology];
              return `
                <div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;margin-bottom:3px;
                  background:rgba(${f.isRuling?'251,191,36':'255,255,255'},${f.isRuling?'0.06':'0.02'});
                  border:1px solid rgba(${f.isRuling?'251,191,36':'255,255,255'},${f.isRuling?'0.2':'0.06'})">
                  <div style="font-size:9px;${f.isRuling?'color:#fbbf24;font-weight:700':'color:var(--white-dim)'}">
                    ${f.isRuling?"👑 ":""}${f.name}
                  </div>
                  <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:3px;height:4px;overflow:hidden">
                    <div style="height:100%;width:${f.influence}%;background:${td?.color||'#60a5fa'};border-radius:3px"></div>
                  </div>
                  <div style="font-size:9px;color:${td?.color||'#60a5fa'}">${f.influence}%</div>
                </div>`;
            }).join("")}
          </div>

          <!-- Values radar -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
            ${Object.entries(civ.values).map(([key,val]) => {
              const labels = {honor:"Danh Dự",harmony:"Hòa Thuận",power:"Quyền Lực",wisdom:"Trí Tuệ",freedom:"Tự Do",order:"Trật Tự"};
              const color  = val > 70 ? "#4ade80" : val > 40 ? "#60a5fa" : "#6b7280";
              return `
                <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.05);border-radius:6px;padding:5px;text-align:center">
                  <div style="font-size:10px;font-weight:700;color:${color}">${val}</div>
                  <div style="font-size:8px;color:var(--white-dim)">${labels[key]||key}</div>
                </div>`;
            }).join("")}
          </div>

          <!-- Áp lực cải cách -->
          ${civ.reformPressure > 30 ? `
            <div style="margin-top:8px;padding:6px 8px;border-radius:6px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.2)">
              <div style="font-size:9px;color:#f97316">⚠️ Áp lực cải cách: ${civ.reformPressure}/100${civ.reformPressure>70?" — SẮP BÙ NỔ!":""}</div>
            </div>` : ""}
        </div>`).join("")}
    </div>`;
}

// ── TAB: VĂN HÓA ─────────────────────────────────────────────
function lcaiRenderCultureTab() {
  const civs      = Object.values(window.lcaiData?.civilizations || {});
  const diffusions= (window.lcaiData?.diffusions || []).slice(0, 20);
  return `
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Age timeline -->
      <div>
        <div style="font-size:12px;color:#4ade80;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">⏳ THỜI ĐẠI VĂN MINH</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
          ${LCAI_AGES.map(age => {
            const count = civs.filter(c => c.culturalAge === age.id).length;
            const active = count > 0;
            return `
              <div style="padding:6px 12px;border-radius:8px;background:rgba(${active?'74,222,128':'255,255,255'},${active?'0.08':'0.02'});
                border:1px solid rgba(${active?'74,222,128':'255,255,255'},${active?'0.3':'0.06'})">
                <div style="font-size:12px">${age.icon} <span style="font-size:10px;color:${active?'#4ade80':'var(--white-dim)'};font-weight:${active?700:400}">${age.name}</span></div>
                ${active ? `<div style="font-size:9px;color:#4ade80">${count} văn minh</div>` : ""}
              </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Innovation table -->
      <div>
        <div style="font-size:12px;color:#60a5fa;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">💡 BẢNG SÁNG KIẾN</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">
          ${LCAI_INNOVATIONS.map(inn => {
            const discovered = civs.filter(c => c.innovations.includes(inn.id));
            return `
              <div style="padding:10px 12px;border-radius:8px;background:rgba(96,165,250,${discovered.length?'0.06':'0.02'});
                border:1px solid rgba(96,165,250,${discovered.length?'0.25':'0.08'})">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <div style="font-size:11px;color:${discovered.length?'#60a5fa':'var(--white-dim)'}">${inn.icon} ${inn.name}</div>
                  <div style="font-size:8px;color:var(--white-dim)">${inn.era}</div>
                </div>
                <div style="font-size:9px;color:var(--white-dim);margin-bottom:4px">${inn.bonus}</div>
                ${discovered.length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;gap:3px">
                    ${discovered.map(c => `<span style="font-size:8px;padding:1px 6px;border-radius:6px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25);color:#4ade80">${c.name}</span>`).join("")}
                  </div>` : `<div style="font-size:9px;color:var(--white-dim);font-style:italic">Chưa ai khám phá</div>`}
              </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Khuếch tán -->
      ${diffusions.length > 0 ? `
        <div>
          <div style="font-size:12px;color:#c084fc;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">🔄 KHUẾCH TÁN VĂN HÓA GẦN ĐÂY</div>
          <div style="display:flex;flex-direction:column;gap:5px">
            ${diffusions.map(d => `
              <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:7px;background:rgba(192,132,252,0.04);border:1px solid rgba(192,132,252,0.1)">
                <div style="font-size:9px;color:var(--white-dim);flex-shrink:0">Năm ${d.year}</div>
                <div style="font-size:10px;color:var(--white-main);flex:1">${d.fromName} → ${d.toName}</div>
                <div style="font-size:9px;color:#c084fc">+${d.amount} ${d.attribute}</div>
              </div>`).join("")}
          </div>
        </div>` : ""}
    </div>`;
}

// ── TAB: BIÊN NIÊN SỬ ────────────────────────────────────────
function lcaiRenderChronicleTab() {
  const hist = window.lcaiData?.civHistory || [];
  if (hist.length === 0) return `<div style="text-align:center;padding:60px;color:var(--white-dim)"><div style="font-size:48px">📜</div><div>Chưa có sự kiện văn minh nào.</div></div>`;

  const typeIcon = {
    age_advance:"🌟",golden_age:"✨",dark_age:"💀",coup:"⚔️",
    reform:"📜",movement:"🌾",innovation:"💡",civ_decision:"🧠",
    political_coup:"🗡️",era_end:"🌅",era:"🌀",
  };

  return `
    <div style="display:flex;flex-direction:column;gap:5px">
      ${hist.map(ev => {
        const icon = typeIcon[ev.type] || "📝";
        return `
          <div style="display:flex;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.05)">
            <div style="font-size:16px;flex-shrink:0">${icon}</div>
            <div style="flex:1">
              <div style="font-size:10px;color:var(--white-main);line-height:1.5">${ev.text}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:2px">Năm ${ev.year}</div>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

// ── NAV BUTTON ───────────────────────────────────────────────
function lcaiShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="living-civ"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    lcaiInit();
    lcaiShowNavBtn();

    setInterval(function() {
      if (window.world) {
        lcaiTick();
        const active = document.querySelector('.nav-btn.active[data-panel="living-civ"]');
        if (active) lcaiRenderPanel();
      }
    }, 16000);
  }, 4000);
});
