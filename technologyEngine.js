// ============================================================
// TECHNOLOGY ENGINE V1
// CREATOR GOD V6 — PHASE NEXT
// Công Nghệ Tự Nhiên — NPC phát minh, thế giới tiến hóa
// Tương thích 100% save cũ — KHÔNG reset world, NPC, lịch sử
// ============================================================

const TE_SAVE_KEY = "cgv6_technologyEngine";

// ============================================================
// TECH LEVEL DEFINITIONS
// ============================================================
const TECH_LEVELS = [
  { level: 0, name: "Nguyên Thủy",      icon: "🪨", color: "#8b7355" },
  { level: 1, name: "Thời Đá",          icon: "🗿", color: "#a0855b" },
  { level: 2, name: "Thời Đồng",        icon: "🔶", color: "#cd7f32" },
  { level: 3, name: "Thời Sắt",         icon: "⚔️", color: "#718096" },
  { level: 4, name: "Trung Cổ",         icon: "🏰", color: "#805ad5" },
  { level: 5, name: "Tiền Công Nghiệp", icon: "⚙️",  color: "#d69e2e" },
  { level: 6, name: "Công Nghiệp",      icon: "🏭", color: "#e53e3e" },
  { level: 7, name: "Hiện Đại",         icon: "🌆", color: "#3182ce" },
  { level: 8, name: "Tương Lai",        icon: "🚀", color: "#00b5d8" },
  { level: 9, name: "Liên Tinh",        icon: "🌌", color: "#9f7aea" },
];

// ============================================================
// TECH TREE — Danh sách phát minh, tiên quyết, hiệu ứng
// ============================================================
const TECH_TREE = [
  // === NGUYÊN THỦY (0) ===
  {
    id: "fire",         name: "Lửa",             icon: "🔥",
    category: "survival",
    minLevel: 0,        prerequisites: [],
    description: "Kiểm soát lửa — nấu thức ăn, sưởi ấm, xua thú dữ.",
    effects: { foodProduction: 1.2, lifespan: 3, popGrowth: 1.1 },
    unlocks: ["cooking", "metalwork_basic"],
    baseChance: 0.12,
    requiredIntelligence: 10,
  },
  {
    id: "cooking",      name: "Nấu Ăn",          icon: "🍖",
    category: "survival",
    minLevel: 0,        prerequisites: ["fire"],
    description: "Chế biến thức ăn — giảm bệnh tật, tăng dân số.",
    effects: { lifespan: 5, popGrowth: 1.15, diseaseResist: 1.2 },
    unlocks: ["agriculture"],
    baseChance: 0.10,
    requiredIntelligence: 12,
  },
  {
    id: "tools_basic",  name: "Công Cụ Đá",      icon: "🪨",
    category: "crafting",
    minLevel: 0,        prerequisites: [],
    description: "Công cụ đá thô — săn bắt, canh tác hiệu quả hơn.",
    effects: { resourceGather: 1.2, armyPower: 1.1 },
    unlocks: ["tools_bronze"],
    baseChance: 0.15,
    requiredIntelligence: 8,
  },

  // === ĐÁ (1) ===
  {
    id: "agriculture",  name: "Nông Nghiệp",     icon: "🌾",
    category: "economy",
    minLevel: 1,        prerequisites: ["cooking"],
    description: "Trồng trọt có hệ thống — dân số bùng nổ, đô thị hình thành.",
    effects: { foodProduction: 2.0, popGrowth: 1.5, wealth: 1.2 },
    unlocks: ["cities", "irrigation"],
    baseChance: 0.08,
    requiredIntelligence: 20,
    worldEvent: true,
  },
  {
    id: "irrigation",   name: "Thủy Lợi",        icon: "💧",
    category: "economy",
    minLevel: 1,        prerequisites: ["agriculture"],
    description: "Hệ thống tưới tiêu — sản lượng lương thực nhảy vọt.",
    effects: { foodProduction: 1.5, wealth: 1.15, popGrowth: 1.2 },
    unlocks: ["engineering"],
    baseChance: 0.07,
    requiredIntelligence: 25,
  },
  {
    id: "language",     name: "Ngôn Ngữ Viết",   icon: "📜",
    category: "knowledge",
    minLevel: 1,        prerequisites: ["tools_basic"],
    description: "Chữ viết đầu tiên — lưu trữ tri thức qua nhiều thế hệ.",
    effects: { researchRate: 1.5, educationBonus: 1.3 },
    unlocks: ["writing", "records"],
    baseChance: 0.05,
    requiredIntelligence: 35,
    worldEvent: true,
  },

  // === ĐỒNG (2) ===
  {
    id: "tools_bronze", name: "Luyện Đồng",      icon: "🔶",
    category: "crafting",
    minLevel: 2,        prerequisites: ["tools_basic", "fire"],
    description: "Kim loại đồng — vũ khí và công cụ vượt trội.",
    effects: { armyPower: 1.3, resourceGather: 1.3, artifactQuality: 1.2 },
    unlocks: ["metallurgy"],
    baseChance: 0.06,
    requiredIntelligence: 30,
  },
  {
    id: "cities",       name: "Đô Thị",          icon: "🏙️",
    category: "civilization",
    minLevel: 2,        prerequisites: ["agriculture"],
    description: "Đô thị tập trung — thương mại, chuyên môn hóa bùng nổ.",
    effects: { wealth: 1.4, popGrowth: 1.3, researchRate: 1.2 },
    unlocks: ["trade_routes", "kingdoms"],
    baseChance: 0.06,
    requiredIntelligence: 30,
    worldEvent: true,
  },
  {
    id: "writing",      name: "Hệ Thống Chữ Viết","icon": "✍️",
    category: "knowledge",
    minLevel: 2,        prerequisites: ["language"],
    description: "Hệ chữ hoàn chỉnh — sách, thư viện, học viện.",
    effects: { researchRate: 2.0, educationBonus: 1.5, culture: 1.3 },
    unlocks: ["libraries", "schools", "records"],
    baseChance: 0.05,
    requiredIntelligence: 40,
    worldEvent: true,
  },

  // === SẮT (3) ===
  {
    id: "metallurgy",   name: "Luyện Kim",        icon: "⚒️",
    category: "crafting",
    minLevel: 3,        prerequisites: ["tools_bronze"],
    description: "Luyện sắt thép — quân đội và nông cụ bước lên tầm cao.",
    effects: { armyPower: 1.5, resourceGather: 1.4, artifactQuality: 1.4 },
    unlocks: ["weapons_steel", "engineering"],
    baseChance: 0.05,
    requiredIntelligence: 35,
  },
  {
    id: "kingdoms",     name: "Vương Quốc",       icon: "👑",
    category: "civilization",
    minLevel: 3,        prerequisites: ["cities"],
    description: "Tổ chức nhà nước — luật pháp, thuế, quân đội quốc gia.",
    effects: { armyPower: 1.4, wealth: 1.3, stability: 1.4 },
    unlocks: ["empires", "military_tactics"],
    baseChance: 0.05,
    requiredIntelligence: 40,
    worldEvent: true,
  },
  {
    id: "medicine_basic","name":"Y Học Cổ Truyền","icon": "🌿",
    category: "medicine",
    minLevel: 3,        prerequisites: ["cooking"],
    description: "Thảo dược và y thuật — giảm tỷ lệ tử vong, tăng tuổi thọ.",
    effects: { lifespan: 10, popGrowth: 1.2, diseaseResist: 1.5 },
    unlocks: ["alchemy", "medicine_advanced"],
    baseChance: 0.07,
    requiredIntelligence: 30,
  },
  {
    id: "records",      name: "Thư Tịch",         icon: "📚",
    category: "knowledge",
    minLevel: 3,        prerequisites: ["writing"],
    description: "Lưu trữ lịch sử quốc gia — di sản tri thức truyền đời.",
    effects: { researchRate: 1.3, culture: 1.2 },
    unlocks: ["libraries"],
    baseChance: 0.08,
    requiredIntelligence: 30,
  },

  // === TRUNG CỔ (4) ===
  {
    id: "engineering",  name: "Công Trình",       icon: "🏗️",
    category: "construction",
    minLevel: 4,        prerequisites: ["metallurgy", "irrigation"],
    description: "Đường xá, cầu, tường thành, pháo đài quy mô lớn.",
    effects: { armyDefense: 1.5, tradeBonus: 1.3, wealth: 1.2 },
    unlocks: ["fortresses", "roads", "siege_weapons"],
    baseChance: 0.05,
    requiredIntelligence: 45,
  },
  {
    id: "libraries",    name: "Thư Viện",         icon: "📖",
    category: "knowledge",
    minLevel: 4,        prerequisites: ["writing", "records"],
    description: "Thư viện quốc gia — trung tâm nghiên cứu và giáo dục.",
    effects: { researchRate: 1.8, educationBonus: 1.5 },
    unlocks: ["schools", "academies"],
    baseChance: 0.06,
    requiredIntelligence: 45,
  },
  {
    id: "schools",      name: "Trường Học",       icon: "🏫",
    category: "education",
    minLevel: 4,        prerequisites: ["writing"],
    description: "Hệ thống giáo dục — đào tạo học giả và nhà phát minh.",
    effects: { educationBonus: 1.6, researchRate: 1.4, inventorChance: 1.5 },
    unlocks: ["academies"],
    baseChance: 0.06,
    requiredIntelligence: 40,
  },
  {
    id: "navigation",   name: "Hàng Hải",        icon: "⚓",
    category: "exploration",
    minLevel: 4,        prerequisites: ["trade_routes"],
    description: "Kỹ thuật hàng hải — mở rộng thương mại và lãnh thổ.",
    effects: { tradeBonus: 1.6, wealth: 1.4, newTerritories: true },
    unlocks: ["sea_trade", "exploration"],
    baseChance: 0.04,
    requiredIntelligence: 45,
    worldEvent: true,
  },
  {
    id: "trade_routes", name: "Con Đường Thương Mại","icon":"🏪",
    category: "economy",
    minLevel: 4,        prerequisites: ["cities"],
    description: "Mạng lưới buôn bán — lan truyền văn hóa và công nghệ.",
    effects: { wealth: 1.5, techSpread: 1.4, culture: 1.2 },
    unlocks: ["navigation", "guilds", "banks"],
    baseChance: 0.06,
    requiredIntelligence: 35,
  },
  {
    id: "alchemy",      name: "Luyện Đan",        icon: "⚗️",
    category: "cultivation",
    minLevel: 4,        prerequisites: ["medicine_basic"],
    description: "Nghệ thuật luyện đan — đan dược tăng cường tu luyện.",
    effects: { artifactQuality: 1.5, lifespan: 15, cultivationSpeed: 1.3 },
    unlocks: ["pill_recipes", "alchemy_furnace"],
    baseChance: 0.05,
    requiredIntelligence: 50,
  },

  // === TIỀN CÔNG NGHIỆP (5) ===
  {
    id: "academies",    name: "Học Viện",         icon: "🎓",
    category: "education",
    minLevel: 5,        prerequisites: ["schools", "libraries"],
    description: "Học viện bậc cao — đào tạo nhà khoa học và đại học giả.",
    effects: { researchRate: 2.0, inventorChance: 2.0, educationBonus: 2.0 },
    unlocks: ["universities", "research_institutes"],
    baseChance: 0.04,
    requiredIntelligence: 55,
  },
  {
    id: "printing",     name: "In Ấn",            icon: "🖨️",
    category: "knowledge",
    minLevel: 5,        prerequisites: ["engineering", "writing"],
    description: "Máy in — tri thức lan rộng toàn xã hội.",
    effects: { researchRate: 1.7, educationBonus: 1.8, culture: 1.5, techSpread: 1.6 },
    unlocks: ["mass_literacy"],
    baseChance: 0.04,
    requiredIntelligence: 55,
    worldEvent: true,
  },
  {
    id: "guilds",       name: "Thương Hội",       icon: "🏛️",
    category: "economy",
    minLevel: 5,        prerequisites: ["trade_routes"],
    description: "Tổ chức thương nhân — ổn định kinh tế, tài trợ nghiên cứu.",
    effects: { wealth: 1.6, tradeBonus: 1.4, researchRate: 1.2 },
    unlocks: ["banks", "merchant_empires"],
    baseChance: 0.05,
    requiredIntelligence: 50,
  },
  {
    id: "military_tactics","name":"Binh Pháp",    icon: "📋",
    category: "military",
    minLevel: 5,        prerequisites: ["kingdoms"],
    description: "Chiến thuật quân sự — trận pháp, kỷ luật quân đội.",
    effects: { armyPower: 1.6, armyDefense: 1.4 },
    unlocks: ["siege_weapons", "cultivation_armies"],
    baseChance: 0.06,
    requiredIntelligence: 45,
  },
  {
    id: "spirit_array", name: "Linh Trận Cơ Bản","icon":"✨",
    category: "cultivation",
    minLevel: 5,        prerequisites: ["alchemy"],
    description: "Mảng thu linh khí — tăng tốc tu luyện trong phạm vi.",
    effects: { cultivationSpeed: 1.5, artifactQuality: 1.4 },
    unlocks: ["formation_network", "spirit_array_advanced"],
    baseChance: 0.04,
    requiredIntelligence: 55,
  },

  // === CÔNG NGHIỆP (6) ===
  {
    id: "banks",        name: "Ngân Hàng",        icon: "🏦",
    category: "economy",
    minLevel: 6,        prerequisites: ["guilds"],
    description: "Hệ thống tài chính — cho vay, đầu tư, thúc đẩy kinh tế.",
    effects: { wealth: 2.0, tradeBonus: 1.5, researchFunding: 1.6 },
    unlocks: ["merchant_empires"],
    baseChance: 0.04,
    requiredIntelligence: 60,
  },
  {
    id: "siege_weapons","name":"Vũ Khí Công Thành","icon":"🪃",
    category: "military",
    minLevel: 6,        prerequisites: ["military_tactics", "engineering"],
    description: "Máy bắn đá, đầu voi, pháo công thành.",
    effects: { armyPower: 1.8, siegeBonus: 2.0 },
    unlocks: ["warships", "cannon"],
    baseChance: 0.04,
    requiredIntelligence: 55,
  },
  {
    id: "empires",      name: "Đế Quốc",          icon: "🏛️",
    category: "civilization",
    minLevel: 6,        prerequisites: ["kingdoms", "military_tactics"],
    description: "Đế quốc rộng lớn — quản lý đa dân tộc, kinh tế khổng lồ.",
    effects: { wealth: 1.8, armyPower: 1.5, stability: 1.3, techSpread: 1.5 },
    unlocks: [],
    baseChance: 0.03,
    requiredIntelligence: 60,
    worldEvent: true,
  },
  {
    id: "alchemy_furnace","name":"Lò Đan Tiên",   icon:"🔮",
    category: "cultivation",
    minLevel: 6,        prerequisites: ["alchemy"],
    description: "Lò luyện cấp cao — chế tạo đan dược thượng phẩm.",
    effects: { artifactQuality: 2.0, cultivationSpeed: 1.6, lifespan: 20 },
    unlocks: ["soul_crystal", "immortal_forge"],
    baseChance: 0.03,
    requiredIntelligence: 65,
  },
  {
    id: "medicine_advanced","name":"Y Học Tiên Tiến","icon":"💊",
    category: "medicine",
    minLevel: 6,        prerequisites: ["medicine_basic", "schools"],
    description: "Y học hệ thống — bệnh viện, phẫu thuật, dịch tễ.",
    effects: { lifespan: 20, popGrowth: 1.4, diseaseResist: 2.0 },
    unlocks: [],
    baseChance: 0.04,
    requiredIntelligence: 60,
  },

  // === HIỆN ĐẠI (7) ===
  {
    id: "universities", name: "Đại Học",          icon: "🏛️",
    category: "education",
    minLevel: 7,        prerequisites: ["academies"],
    description: "Đại học nghiên cứu — tri thức đỉnh cao, chuyên môn sâu.",
    effects: { researchRate: 2.5, inventorChance: 2.5, educationBonus: 2.5 },
    unlocks: ["research_institutes"],
    baseChance: 0.03,
    requiredIntelligence: 70,
  },
  {
    id: "formation_network","name":"Trận Pháp Mạng","icon":"🌐",
    category: "cultivation",
    minLevel: 7,        prerequisites: ["spirit_array"],
    description: "Mạng lưới trận pháp phủ cả quốc gia — liên lạc và phòng thủ.",
    effects: { armyDefense: 2.0, techSpread: 1.8, cultivationSpeed: 1.5 },
    unlocks: ["teleport_gate"],
    baseChance: 0.03,
    requiredIntelligence: 70,
  },
  {
    id: "flying_boat",  name: "Phi Thuyền",       icon: "🚢",
    category: "cultivation",
    minLevel: 7,        prerequisites: ["navigation", "spirit_array"],
    description: "Thuyền bay linh khí — vận chuyển và chiến đấu trên không.",
    effects: { armyPower: 1.7, tradeBonus: 1.6, exploration: 1.8 },
    unlocks: [],
    baseChance: 0.03,
    requiredIntelligence: 70,
    worldEvent: true,
  },
  {
    id: "soul_crystal", name: "Linh Hồn Tinh Thạch","icon":"💎",
    category: "cultivation",
    minLevel: 7,        prerequisites: ["alchemy_furnace"],
    description: "Tinh thạch lưu trữ ký ức và năng lượng linh hồn.",
    effects: { cultivationSpeed: 2.0, artifactQuality: 1.8, lifespan: 30 },
    unlocks: ["immortal_forge"],
    baseChance: 0.02,
    requiredIntelligence: 75,
  },

  // === TƯƠNG LAI (8) ===
  {
    id: "research_institutes","name":"Viện Nghiên Cứu","icon":"🔬",
    category: "education",
    minLevel: 8,        prerequisites: ["universities"],
    description: "Trung tâm nghiên cứu đỉnh cao — bước đột phá công nghệ.",
    effects: { researchRate: 3.0, inventorChance: 3.0 },
    unlocks: [],
    baseChance: 0.02,
    requiredIntelligence: 80,
  },
  {
    id: "teleport_gate","name":"Cổng Dịch Chuyển", icon:"🌀",
    category: "cultivation",
    minLevel: 8,        prerequisites: ["formation_network", "soul_crystal"],
    description: "Cổng không gian — dịch chuyển tức thời giữa các địa điểm.",
    effects: { tradeBonus: 2.5, armySpeed: 3.0, techSpread: 2.0 },
    unlocks: ["interstellar_travel"],
    baseChance: 0.02,
    requiredIntelligence: 85,
    worldEvent: true,
  },
  {
    id: "immortal_forge","name":"Tiên Công Lò Luyện","icon":"🔱",
    category: "cultivation",
    minLevel: 8,        prerequisites: ["soul_crystal", "alchemy_furnace"],
    description: "Lò luyện cấp Tiên Nhân — tạo ra bảo vật huyền thoại.",
    effects: { artifactQuality: 3.0, cultivationSpeed: 2.5 },
    unlocks: [],
    baseChance: 0.01,
    requiredIntelligence: 90,
    worldEvent: true,
  },

  // === LIÊN TINH (9) ===
  {
    id: "interstellar_travel","name":"Du Hành Liên Tinh","icon":"🌌",
    category: "exploration",
    minLevel: 9,        prerequisites: ["teleport_gate"],
    description: "Vượt qua không gian — khám phá các tinh cầu khác.",
    effects: { tradeBonus: 5.0, wealth: 3.0, techSpread: 3.0 },
    unlocks: [],
    baseChance: 0.005,
    requiredIntelligence: 95,
    worldEvent: true,
  },
];

// ============================================================
// SCIENTIST RANKS
// ============================================================
const SCIENTIST_RANKS = [
  { minDiscoveries: 1, title: "Học Giả",        icon: "📚" },
  { minDiscoveries: 3, title: "Nhà Nghiên Cứu", icon: "🔬" },
  { minDiscoveries: 5, title: "Nhà Khoa Học",   icon: "⚗️"  },
  { minDiscoveries: 8, title: "Đại Học Sĩ",     icon: "🎓" },
  { minDiscoveries:12, title: "Thánh Nhân Phát Minh", icon: "✨" },
];

// ============================================================
// DEFAULT STATE
// ============================================================
function techEngineDefaultData() {
  return {
    technologyLevel: 0,
    technologyPoints: 0,
    discoveries: [],        // [{ techId, name, year, inventorId, inventorName, countryId, sectId }]
    inventors: {},          // npcId -> { name, discoveries: [], rank, points }
    countryTechLevels: {},  // countryId -> { level, points, discoveries:[] }
    sectTechLevels: {},     // sectId -> { level, points, discoveries:[] }
    lostTechnologies: [],   // techId list
    techSpreadQueue: [],    // [{ techId, fromCountryId, toCountryId, year }]
    revolutions: [],        // [{ name, year, effects }]
    techStats: {
      totalDiscoveries: 0,
      totalInventors: 0,
      mostAdvancedCountry: null,
      mostAdvancedSect: null,
      lostCount: 0,
      rediscoveredCount: 0,
    },
    meta: { version: 1 },
  };
}

window.techEngineData = window.techEngineData || techEngineDefaultData();

// Shorthand
function _ted() { return window.techEngineData; }

// ============================================================
// SAVE / LOAD
// ============================================================
function techEngineSave() {
  try { localStorage.setItem(TE_SAVE_KEY, JSON.stringify(window.techEngineData)); } catch(e) {}
}

function techEngineLoad() {
  try {
    const raw = localStorage.getItem(TE_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate: merge missing keys
      const def = techEngineDefaultData();
      window.techEngineData = Object.assign({}, def, parsed);
      // Deep merge sub-objects
      if (!window.techEngineData.countryTechLevels) window.techEngineData.countryTechLevels = {};
      if (!window.techEngineData.sectTechLevels)    window.techEngineData.sectTechLevels    = {};
      if (!window.techEngineData.inventors)         window.techEngineData.inventors         = {};
      if (!window.techEngineData.techStats)         window.techEngineData.techStats         = def.techStats;
    }
  } catch(e) {}
}
techEngineLoad();

// ============================================================
// HELPERS
// ============================================================
function techHasDiscovered(techId) {
  return _ted().discoveries.some(d => d.techId === techId);
}

function techIsLost(techId) {
  return _ted().lostTechnologies.includes(techId);
}

function techMeetsPrereqs(techDef) {
  return techDef.prerequisites.every(p => techHasDiscovered(p));
}

function techGetLevel() {
  return _ted().technologyLevel;
}

function techGetLevelInfo() {
  return TECH_LEVELS[Math.min(_ted().technologyLevel, TECH_LEVELS.length - 1)];
}

// Get all discovered tech IDs (including lost ones are still "discovered" historically)
function techGetAllDiscoveredIds() {
  return _ted().discoveries.map(d => d.techId);
}

// Get currently ACTIVE (not lost) technologies
function techGetActiveTechs() {
  return _ted().discoveries.filter(d => !_ted().lostTechnologies.includes(d.techId));
}

// Compute discovery chance for a tech
function techDiscoveryChance(techDef) {
  const ted = _ted();
  let chance = techDef.baseChance;

  // Country research bonus
  const avgCountryTech = (countries && countries.length > 0)
    ? countries.reduce((s, c) => s + (c.technology || 0), 0) / countries.length
    : 0;
  chance *= (1 + avgCountryTech * 0.05);

  // Population bonus
  const pop = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive").length : 0;
  chance *= (1 + Math.min(pop / 500, 1.0));

  // Education institutions discovered
  const eduTechs = ["schools","academies","universities","research_institutes","libraries"];
  const eduCount = eduTechs.filter(t => techHasDiscovered(t)).length;
  chance *= (1 + eduCount * 0.2);

  // Tech points bonus
  chance *= (1 + ted.technologyPoints / 1000);

  // Stability modifier from countries
  const avgStability = (countries && countries.length > 0)
    ? countries.reduce((s, c) => s + (c.level || 1), 0) / countries.length
    : 1;
  chance *= (0.5 + avgStability * 0.1);

  return Math.min(chance, 0.4); // cap 40% per tick
}

// Get best NPC inventor candidate
function techFindInventorCandidate(techDef) {
  if (typeof npcs === "undefined") return null;
  const alive = npcs.filter(n => n.status === "alive");
  if (!alive.length) return null;

  // Filter by intelligence proxy (rootPower + luck + realm)
  const scored = alive.map(n => ({
    npc: n,
    score: (n.rootPower || 1) * 3
          + (n.luck || 50) * 0.5
          + (n.realm || 0) * 5
          + (n.reputation || 0) * 0.1,
  })).sort((a, b) => b.score - a.score);

  // Top 20% candidates, pick randomly weighted
  const pool = scored.slice(0, Math.max(1, Math.floor(scored.length * 0.2)));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const minScore = (techDef.requiredIntelligence || 20) * 0.8;
  if (pick && pick.score >= minScore) return pick.npc;
  return null;
}

// ============================================================
// DISCOVERY CORE
// ============================================================
function techDiscover(techDef) {
  const ted = _ted();

  // Already discovered (unless re-discovering lost tech)
  if (techHasDiscovered(techDef.id) && !techIsLost(techDef.id)) return false;

  const inventor = techFindInventorCandidate(techDef);
  const inventorName = inventor ? inventor.name : "Không rõ";
  const inventorId   = inventor ? inventor.id   : null;

  // Country / Sect
  let countryId = null, countryName = null, sectId = null, sectName = null;
  if (inventor) {
    const c = (typeof countries !== "undefined") ? countries.find(c2 => c2.name === inventor.country) : null;
    if (c) { countryId = c.id; countryName = c.name; }
    const s = (typeof sects !== "undefined" && inventor.sectId) ? sects.find(s2 => s2.id === inventor.sectId) : null;
    if (s) { sectId = s.id; sectName = s.name; }
  }

  // Handle re-discovery
  const wasLost = techIsLost(techDef.id);
  if (wasLost) {
    ted.lostTechnologies = ted.lostTechnologies.filter(id => id !== techDef.id);
    ted.techStats.rediscoveredCount++;
  }

  // Record discovery
  const record = {
    techId: techDef.id,
    name:   techDef.name,
    icon:   techDef.icon,
    category: techDef.category,
    year:   (typeof year !== "undefined") ? year : 0,
    inventorId,
    inventorName,
    countryId,
    countryName,
    sectId,
    sectName,
    wasRediscovery: wasLost,
  };

  if (!wasLost) {
    ted.discoveries.push(record);
    ted.techStats.totalDiscoveries++;
  }

  // Inventor profile
  if (inventorId !== null) {
    if (!ted.inventors[inventorId]) {
      ted.inventors[inventorId] = { name: inventorName, discoveries: [], rank: 0, points: 0 };
      ted.techStats.totalInventors++;
    }
    const inv = ted.inventors[inventorId];
    inv.discoveries.push(techDef.id);
    inv.points += 10;
    // Update rank
    const rankDef = [...SCIENTIST_RANKS].reverse().find(r => inv.discoveries.length >= r.minDiscoveries);
    if (rankDef) inv.rank = rankDef.title;

    // Add to NPC biography
    if (inventor) {
      inventor.biography = inventor.biography || [];
      inventor.biography.push({
        year: (typeof year !== "undefined") ? year : 0,
        event: `Phát minh ${techDef.name} — trở thành ${inv.rank || "Học Giả"} thế giới.`,
      });
    }
  }

  // Country tech level
  if (countryId) {
    if (!ted.countryTechLevels[countryId]) ted.countryTechLevels[countryId] = { level: 0, points: 0, discoveries: [] };
    ted.countryTechLevels[countryId].discoveries.push(techDef.id);
    ted.countryTechLevels[countryId].points += 10;
    _techUpdateCountryLevel(countryId);
    _techUpdateMostAdvanced();
  }
  if (sectId) {
    if (!ted.sectTechLevels[sectId]) ted.sectTechLevels[sectId] = { level: 0, points: 0, discoveries: [] };
    ted.sectTechLevels[sectId].discoveries.push(techDef.id);
    ted.sectTechLevels[sectId].points += 10;
  }

  // Apply effects
  _techApplyEffects(techDef.effects);

  // Update world tech level
  _techUpdateWorldLevel();

  // Tech points
  ted.technologyPoints += 10;

  // Log
  const yr = (typeof year !== "undefined") ? year : 0;
  const rediscoveryTag = wasLost ? " [TÁI KHÁM PHÁ]" : "";
  const msg = `${techDef.icon} Năm ${yr}: ${inventorName} phát minh [${techDef.name}]${rediscoveryTag}${countryName ? ` — ${countryName}` : ""}`;
  if (typeof addLog === "function")      addLog(msg, "important");
  if (typeof addTimeline === "function") addTimeline(msg, "invention", techDef.icon);
  if (typeof toast === "function")       toast(`${techDef.icon} Phát minh mới: ${techDef.name}!`);

  // World history
  if (typeof worldHistory !== "undefined" && Array.isArray(worldHistory)) {
    worldHistory.push({ year: yr, event: msg, type: "invention", icon: techDef.icon });
  }

  // World memory
  if (typeof window.worldMemoryData !== "undefined") {
    const wm = window.worldMemoryData.worldMemory;
    if (wm && Array.isArray(wm.famousBetrayals)) {
      // Store in a "greatDiscoveries" bucket (extend worldMemory dynamically)
      if (!wm.greatDiscoveries) wm.greatDiscoveries = [];
      wm.greatDiscoveries.push({ techId: techDef.id, name: techDef.name, inventorName, year: yr });
      if (wm.greatDiscoveries.length > 100) wm.greatDiscoveries.shift();
    }
  }

  // Mythology: ancient tech becomes myth if inventor dies and civilization later forgets
  if (techDef.worldEvent && typeof mythologyEngine_recordEvent === "function") {
    try { mythologyEngine_recordEvent({ type:"invention", name: techDef.name, year: yr, inventor: inventorName }); } catch(e) {}
  }

  // Unlock sidebar button first time
  _techUnlockSidebar();

  // Check revolution
  _techCheckRevolution();

  return true;
}

// ============================================================
// APPLY EFFECTS to world/countries/sects
// ============================================================
function _techApplyEffects(effects) {
  if (!effects) return;
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    if (effects.wealth && c.wealth)           c.wealth        = Math.floor(c.wealth * effects.wealth);
    if (effects.armyPower && c.military)      c.military      = Math.floor(c.military * effects.armyPower);
    if (effects.popGrowth && c.population)    c.population    = Math.floor(c.population * effects.popGrowth);
    if (effects.researchRate && c.technology) c.technology    = Math.min(c.technology + 0.5, 10);
  });
  // Lifespan bonus to alive NPCs (small fraction)
  if (effects.lifespan && typeof npcs !== "undefined") {
    npcs.filter(n => n.status === "alive").forEach(n => {
      n.lifespan = (n.lifespan || 80) + Math.floor(effects.lifespan * 0.1);
    });
  }
}

// ============================================================
// UPDATE WORLD TECH LEVEL based on discoveries
// ============================================================
function _techUpdateWorldLevel() {
  const ted = _ted();
  const count = ted.discoveries.length;

  // Rough threshold: every ~5 discoveries = 1 tech level
  const newLevel = Math.min(9, Math.floor(count / 5));
  if (newLevel > ted.technologyLevel) {
    ted.technologyLevel = newLevel;
    const info = TECH_LEVELS[newLevel];
    const yr = (typeof year !== "undefined") ? year : 0;
    const msg = `🌍 Thế giới tiến lên ${info.icon} Kỷ Nguyên ${info.name}!`;
    if (typeof addLog === "function")      addLog(msg, "important");
    if (typeof addTimeline === "function") addTimeline(msg, "age", info.icon);
    if (typeof toast === "function")       toast(msg);
    if (typeof worldHistory !== "undefined" && Array.isArray(worldHistory)) {
      worldHistory.push({ year: yr, event: msg, type: "era", icon: info.icon });
    }
  }
}

function _techUpdateCountryLevel(countryId) {
  const ted = _ted();
  const ct = ted.countryTechLevels[countryId];
  if (!ct) return;
  ct.level = Math.min(9, Math.floor(ct.discoveries.length / 3));
}

function _techUpdateMostAdvanced() {
  const ted = _ted();
  let best = null, bestScore = -1;
  for (const [cid, ct] of Object.entries(ted.countryTechLevels)) {
    if (ct.discoveries.length > bestScore) {
      bestScore = ct.discoveries.length;
      const c = (typeof countries !== "undefined") ? countries.find(x => x.id === cid || x.id === Number(cid)) : null;
      best = c ? c.name : cid;
    }
  }
  ted.techStats.mostAdvancedCountry = best;

  let bestSect = null, bestSectScore = -1;
  for (const [sid, st] of Object.entries(ted.sectTechLevels)) {
    if (st.discoveries.length > bestSectScore) {
      bestSectScore = st.discoveries.length;
      const s = (typeof sects !== "undefined") ? sects.find(x => x.id === sid || x.id === Number(sid)) : null;
      bestSect = s ? s.name : sid;
    }
  }
  ted.techStats.mostAdvancedSect = bestSect;
}

// ============================================================
// REVOLUTION CHECK
// ============================================================
const _REVOLUTIONS = [
  { name: "Cách Mạng Nông Nghiệp",  triggers: ["agriculture","irrigation","cities"],         effects: { popGrowth: 2.0 } },
  { name: "Cách Mạng Công Nghiệp",  triggers: ["metallurgy","engineering","banks","guilds"],  effects: { wealth: 3.0 }    },
  { name: "Cách Mạng Tu Luyện",     triggers: ["alchemy","spirit_array","alchemy_furnace"],   effects: { cultivationSpeed: 2.0 } },
  { name: "Cách Mạng Huyền Thuật",  triggers: ["teleport_gate","formation_network","soul_crystal"], effects: { artifactQuality: 2.5 } },
  { name: "Cách Mạng Tri Thức",     triggers: ["writing","libraries","academies","printing"], effects: { researchRate: 3.0 } },
];

function _techCheckRevolution() {
  const ted = _ted();
  const discoveredIds = techGetAllDiscoveredIds();
  _REVOLUTIONS.forEach(rev => {
    if (ted.revolutions.some(r => r.name === rev.name)) return;
    if (rev.triggers.every(t => discoveredIds.includes(t))) {
      ted.revolutions.push({ name: rev.name, year: (typeof year !== "undefined") ? year : 0, effects: rev.effects });
      _techApplyEffects(rev.effects);
      const yr = (typeof year !== "undefined") ? year : 0;
      const msg = `🌟 CÁCH MẠNG: ${rev.name} bùng nổ vào năm ${yr}!`;
      if (typeof addLog === "function")      addLog(msg, "important");
      if (typeof addTimeline === "function") addTimeline(msg, "revolution", "🌟");
      if (typeof toast === "function")       toast(msg);
      if (typeof worldHistory !== "undefined" && Array.isArray(worldHistory)) {
        worldHistory.push({ year: yr, event: msg, type: "revolution", icon: "🌟" });
      }
    }
  });
}

// ============================================================
// TECH SPREAD — technology propagates between countries
// ============================================================
function _techSpreadTick() {
  const ted = _ted();
  if (!ted.discoveries.length || typeof countries === "undefined" || countries.length < 2) return;

  // Each tick: 5% chance a random discovered tech spreads to a random country
  if (Math.random() > 0.05) return;

  const discovered = ted.discoveries.filter(d => !techIsLost(d.techId));
  if (!discovered.length) return;
  const techRecord = discovered[Math.floor(Math.random() * discovered.length)];
  const targetCountry = countries[Math.floor(Math.random() * countries.length)];
  if (!targetCountry) return;

  const ct = ted.countryTechLevels[targetCountry.id];
  if (ct && ct.discoveries.includes(techRecord.techId)) return; // already has it

  if (!ted.countryTechLevels[targetCountry.id]) {
    ted.countryTechLevels[targetCountry.id] = { level: 0, points: 0, discoveries: [] };
  }
  ted.countryTechLevels[targetCountry.id].discoveries.push(techRecord.techId);
  ted.countryTechLevels[targetCountry.id].points += 5;
  _techUpdateCountryLevel(targetCountry.id);

  // Apply partial effects
  const techDef = TECH_TREE.find(t => t.id === techRecord.techId);
  if (techDef && techDef.effects) {
    if (targetCountry.technology !== undefined) targetCountry.technology = Math.min(targetCountry.technology + 0.2, 10);
  }
}

// ============================================================
// TECH THEFT — espionage
// ============================================================
function _techTheftTick() {
  const ted = _ted();
  if (typeof countries === "undefined" || countries.length < 2) return;
  if (!ted.discoveries.length) return;
  if (Math.random() > 0.02) return; // 2% per tick

  const c1 = countries[Math.floor(Math.random() * countries.length)];
  const c2 = countries.find(c => c.id !== c1.id);
  if (!c1 || !c2) return;

  // c2 steals from c1 (country with more tech)
  const ct1 = ted.countryTechLevels[c1.id];
  if (!ct1 || !ct1.discoveries.length) return;
  const stolenTechId = ct1.discoveries[Math.floor(Math.random() * ct1.discoveries.length)];

  if (!ted.countryTechLevels[c2.id]) ted.countryTechLevels[c2.id] = { level: 0, points: 0, discoveries: [] };
  if (!ted.countryTechLevels[c2.id].discoveries.includes(stolenTechId)) {
    ted.countryTechLevels[c2.id].discoveries.push(stolenTechId);
    ted.countryTechLevels[c2.id].points += 3;
    const techDef = TECH_TREE.find(t => t.id === stolenTechId);
    const yr = (typeof year !== "undefined") ? year : 0;
    if (techDef) {
      const msg = `🕵️ ${c2.name} đánh cắp bí quyết ${techDef.name} từ ${c1.name}!`;
      if (typeof addLog === "function") addLog(msg, "important");
      if (typeof worldHistory !== "undefined") worldHistory.push({ year: yr, event: msg, type: "espionage", icon: "🕵️" });
    }
  }
}

// ============================================================
// LOST TECHNOLOGY — civilization collapse / war
// ============================================================
function _techLostTick() {
  const ted = _ted();
  if (!ted.discoveries.length) return;
  if (Math.random() > 0.003) return; // ~0.3% per tick

  // Only lose techs in dark ages (many ongoing wars, low population)
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive").length : 100;
  const activeWarCount = (typeof activeWars !== "undefined") ? (activeWars || []).length : 0;
  if (alive > 50 && activeWarCount < 3) return; // Only during chaos

  const activeTechs = techGetActiveTechs();
  if (!activeTechs.length) return;
  const toLoose = activeTechs[Math.floor(Math.random() * activeTechs.length)];

  ted.lostTechnologies.push(toLoose.techId);
  ted.techStats.lostCount++;
  const yr = (typeof year !== "undefined") ? year : 0;
  const msg = `💔 Năm ${yr}: Bí quyết [${toLoose.name}] bị thất truyền do chiến loạn và hỗn mang!`;
  if (typeof addLog === "function")      addLog(msg, "death");
  if (typeof addTimeline === "function") addTimeline(msg, "lost_tech", "💔");
  if (typeof worldHistory !== "undefined") {
    worldHistory.push({ year: yr, event: msg, type: "lost_tech", icon: "💔" });
  }

  // May become mythology
  if (typeof mythologyEngine_recordEvent === "function") {
    try { mythologyEngine_recordEvent({ type:"lost_tech", name: toLoose.name, year: yr }); } catch(e) {}
  }
}

// ============================================================
// RESEARCH POINTS from economy / sects / countries
// ============================================================
function _techResearchPointsTick() {
  const ted = _ted();
  let points = 1; // base

  if (typeof countries !== "undefined") {
    countries.forEach(c => { points += (c.technology || 0) * 0.5; });
  }
  if (typeof sects !== "undefined") {
    sects.forEach(s => { points += (s.power || 0) * 0.1; });
  }

  // Education bonus
  const eduTechs = ["schools","academies","universities","research_institutes","libraries"];
  const eduCount = eduTechs.filter(t => techHasDiscovered(t)).length;
  points *= (1 + eduCount * 0.3);

  ted.technologyPoints = Math.min(ted.technologyPoints + Math.floor(points), 99999);
}

// ============================================================
// MAIN TICK
// ============================================================
function technologyEngine_tick() {
  const ted = _ted();
  if (typeof world === "undefined" || !world) return;

  // Generate research points
  _techResearchPointsTick();

  // Try to discover available technologies
  const discoveredIds = techGetAllDiscoveredIds();
  const lostIds = ted.lostTechnologies;

  for (const techDef of TECH_TREE) {
    // Skip already discovered (unless lost → rediscovery possible)
    if (discoveredIds.includes(techDef.id) && !lostIds.includes(techDef.id)) continue;
    // Skip if world tech level too low
    if (ted.technologyLevel < techDef.minLevel) continue;
    // Skip if prerequisites not met
    if (!techMeetsPrereqs(techDef)) continue;
    // Roll discovery chance
    const dc = techDiscoveryChance(techDef);
    if (Math.random() < dc) {
      techDiscover(techDef);
      break; // one discovery per tick max (keep it dramatic)
    }
  }

  // Tech spread between countries
  _techSpreadTick();

  // Tech theft
  _techTheftTick();

  // Lost tech
  _techLostTick();
}

// ============================================================
// SIDEBAR UNLOCK
// ============================================================
function _techUnlockSidebar() {
  // Handled by emergentCivilization.js ecRenderDynamicSidebar()
  // Fallback: force-show if EC not loaded
  const btn = document.getElementById("btn-technology");
  if (btn) {
    btn.style.display = "";
    btn.classList.remove("ec-hidden");
  }
}

// ============================================================
// PANEL RENDER
// ============================================================
function renderTechnologyPanel() {
  const ted = _ted();
  const panel = document.getElementById("panel-technology");
  if (!panel) return;

  const levelInfo = techGetLevelInfo();
  const activeTechs = techGetActiveTechs();
  const lostTechs = ted.lostTechnologies.map(id => TECH_TREE.find(t => t.id === id)).filter(Boolean);
  const recentDisc = [...ted.discoveries].reverse().slice(0, 10);
  const revolutions = ted.revolutions;

  // Inventors leaderboard
  const inventorList = Object.entries(ted.inventors)
    .map(([id, inv]) => ({ id, ...inv }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  // Country ranking
  const countryRanking = Object.entries(ted.countryTechLevels)
    .map(([cid, ct]) => {
      const c = (typeof countries !== "undefined") ? countries.find(x => x.id === cid || x.id === Number(cid)) : null;
      return { name: c ? c.name : cid, discoveries: ct.discoveries.length, level: ct.level };
    })
    .sort((a, b) => b.discoveries - a.discoveries)
    .slice(0, 6);

  // Available (undiscovered, prereqs met)
  const discoveredIds = techGetAllDiscoveredIds();
  const available = TECH_TREE.filter(t =>
    !discoveredIds.includes(t.id) &&
    t.minLevel <= ted.technologyLevel &&
    techMeetsPrereqs(t)
  ).slice(0, 6);

  panel.innerHTML = `
<div style="padding:16px;max-width:900px;margin:0 auto">

  <!-- HEADER -->
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
    <div style="width:52px;height:52px;border-radius:14px;background:${levelInfo.color}22;border:2px solid ${levelInfo.color}66;display:flex;align-items:center;justify-content:center;font-size:26px">${levelInfo.icon}</div>
    <div>
      <div style="font-size:20px;font-weight:700;color:var(--gold)">⚙️ Hệ Thống Công Nghệ</div>
      <div style="font-size:13px;color:${levelInfo.color};font-weight:600">${levelInfo.icon} Kỷ Nguyên: ${levelInfo.name} (Cấp ${ted.technologyLevel})</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:11px;color:var(--white-dim)">Điểm Nghiên Cứu</div>
      <div style="font-size:18px;font-weight:700;color:#a78bfa">⚗️ ${ted.technologyPoints}</div>
    </div>
  </div>

  <!-- STATS ROW -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
    ${[
      ["📦","Phát Minh",ted.techStats.totalDiscoveries],
      ["🧑‍🔬","Nhà Phát Minh",ted.techStats.totalInventors],
      ["💔","Thất Truyền",ted.techStats.lostCount],
      ["🔄","Tái Khám Phá",ted.techStats.rediscoveredCount],
    ].map(([ic,lb,val])=>`
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:18px">${ic}</div>
      <div style="font-size:16px;font-weight:700;color:var(--gold)">${val}</div>
      <div style="font-size:10px;color:var(--white-dim)">${lb}</div>
    </div>`).join("")}
  </div>

  <!-- ERA PROGRESS BAR -->
  <div style="margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--white-dim);margin-bottom:4px">
      <span>Tiến Độ Kỷ Nguyên</span>
      <span>${activeTechs.length} / ${TECH_TREE.length} phát minh</span>
    </div>
    <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden">
      <div style="height:100%;background:linear-gradient(90deg,${levelInfo.color},${levelInfo.color}88);border-radius:3px;width:${Math.round(activeTechs.length/TECH_TREE.length*100)}%;transition:width 0.5s"></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">

    <!-- RECENT DISCOVERIES -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:12px">
      <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:8px">📜 Phát Minh Gần Đây</div>
      ${recentDisc.length ? recentDisc.map(d => `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="font-size:16px">${d.icon || "⚙️"}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:var(--white-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.name}</div>
            <div style="font-size:10px;color:var(--white-dim)">${d.inventorName} — Năm ${d.year}${d.wasRediscovery?" 🔄":""}</div>
          </div>
        </div>`).join("") : '<div style="font-size:11px;color:var(--white-dim);text-align:center;padding:12px">Chưa có phát minh nào</div>'}
    </div>

    <!-- AVAILABLE TECHS -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:12px">
      <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:8px">🔭 Đang Nghiên Cứu (${available.length})</div>
      ${available.length ? available.map(t => `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="font-size:16px">${t.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:#a78bfa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</div>
            <div style="font-size:10px;color:var(--white-dim)">${Math.round(techDiscoveryChance(t)*100)}% / tick · Cấp ${t.minLevel}</div>
          </div>
        </div>`).join("") : '<div style="font-size:11px;color:var(--white-dim);text-align:center;padding:12px">Cần đạt kỷ nguyên cao hơn</div>'}
    </div>
  </div>

  <!-- INVENTORS -->
  ${inventorList.length ? `
  <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:8px">🧑‍🔬 Bảng Xếp Hạng Nhà Phát Minh</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
      ${inventorList.map((inv,i) => {
        const rankDef = [...SCIENTIST_RANKS].reverse().find(r => (inv.discoveries||[]).length >= r.minDiscoveries) || SCIENTIST_RANKS[0];
        return `
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:8px;display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">${rankDef.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:var(--white-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${inv.name}</div>
            <div style="font-size:10px;color:var(--white-dim)">${rankDef.title} · ${(inv.discoveries||[]).length} phát minh</div>
          </div>
          <div style="font-size:10px;color:var(--gold);font-weight:700">#${i+1}</div>
        </div>`;
      }).join("")}
    </div>
  </div>` : ""}

  <!-- COUNTRY RANKING -->
  ${countryRanking.length ? `
  <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:8px">🏆 Xếp Hạng Công Nghệ Quốc Gia</div>
    ${countryRanking.map((c,i) => {
      const li = TECH_LEVELS[Math.min(c.level, TECH_LEVELS.length-1)];
      return `
      <div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div style="font-size:13px;color:var(--white-dim);width:18px;text-align:right">${i+1}</div>
        <div style="font-size:15px">${li.icon}</div>
        <div style="flex:1;font-size:11px;font-weight:600;color:var(--white-bright)">${c.name}</div>
        <div style="font-size:10px;color:${li.color}">${li.name}</div>
        <div style="font-size:11px;color:var(--gold)">${c.discoveries} phát minh</div>
      </div>`;
    }).join("")}
  </div>` : ""}

  <!-- REVOLUTIONS -->
  ${revolutions.length ? `
  <div style="background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.2);border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:8px">🌟 Cách Mạng Lịch Sử</div>
    ${revolutions.map(r => `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
        <span style="font-size:16px">🌟</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:#fbbf24">${r.name}</div>
          <div style="font-size:10px;color:var(--white-dim)">Năm ${r.year}</div>
        </div>
      </div>`).join("")}
  </div>` : ""}

  <!-- LOST TECHS -->
  ${lostTechs.length ? `
  <div style="background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:600;color:#fc8181;margin-bottom:8px">💔 Công Nghệ Thất Truyền (${lostTechs.length})</div>
    ${lostTechs.map(t => `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
        <span style="font-size:15px;opacity:0.5">${t.icon}</span>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);text-decoration:line-through">${t.name}</div>
        <div style="font-size:10px;color:var(--white-dim)">— chờ tái khám phá</div>
      </div>`).join("")}
  </div>` : ""}

  <!-- FULL TECH TREE -->
  <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:12px">
    <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:10px">🌳 Cây Công Nghệ Đầy Đủ</div>
    ${TECH_LEVELS.map(lvl => {
      const techs = TECH_TREE.filter(t => t.minLevel === lvl.level);
      return `
      <div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:600;color:${lvl.color};margin-bottom:5px">${lvl.icon} ${lvl.name} (Cấp ${lvl.level})</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${techs.map(t => {
            const disc = techHasDiscovered(t.id);
            const lost = techIsLost(t.id);
            const available2 = !disc && t.minLevel <= ted.technologyLevel && techMeetsPrereqs(t);
            let bg = "rgba(255,255,255,0.04)", border = "var(--border)", color = "var(--white-dim)";
            if (disc && !lost) { bg = `${lvl.color}18`; border = `${lvl.color}44`; color = lvl.color; }
            else if (lost)     { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.3)"; color = "rgba(255,255,255,0.3)"; }
            else if (available2) { bg = "rgba(167,139,250,0.08)"; border = "rgba(167,139,250,0.3)"; color = "#a78bfa"; }
            return `<div title="${t.description}" style="background:${bg};border:1px solid ${border};border-radius:6px;padding:3px 7px;font-size:10px;color:${color};cursor:default;${lost?"text-decoration:line-through":""}">
              ${t.icon} ${t.name}${disc&&!lost?" ✓":""}${lost?" 💔":""}
            </div>`;
          }).join("")}
        </div>
      </div>`;
    }).join("")}
  </div>

</div>`;
}

// ============================================================
// HOOK INTO simulateWorld VIA WINDOW HOOK
// ============================================================
(function _techEngineHookInit() {
  if (window._techEngineHooked) return;
  window._techEngineHooked = true;

  // NOTE: tick is called directly from simulateWorld in app.js
  // via: if (typeof technologyEngine_tick === "function") technologyEngine_tick();

  // Patch save() to also persist tech data
  const _origSave = window.save;
  if (typeof _origSave === "function") {
    window.save = function() {
      _origSave.apply(this, arguments);
      techEngineSave();
    };
  }

  // Restore sidebar button if discoveries already exist (page reload)
  setTimeout(function() {
    if (_ted().discoveries.length > 0) _techUnlockSidebar();
  }, 800);
})();

// ============================================================
// EXPORT
// ============================================================
window.technologyEngine = {
  tick:         technologyEngine_tick,
  discover:     techDiscover,
  hasDiscovered: techHasDiscovered,
  isLost:       techIsLost,
  getLevel:     techGetLevel,
  getLevelInfo: techGetLevelInfo,
  getData:      _ted,
  TECH_TREE,
  TECH_LEVELS,
  renderPanel:  renderTechnologyPanel,
  save:         techEngineSave,
  load:         techEngineLoad,
};

console.log("[TechnologyEngine V1] Loaded ✅");
