/* ============================
   CREATOR GOD V6.0 — APP.JS
   World Simulation Cultivation Game
   ============================ */

// ============================
// DATA CONSTANTS
// ============================

// NOTE: REALMS is now a dynamic getter — reads from active world template.
// The static fallback below is used before any world is created.
// TUỔI THỌ THỰC SỰ: LK=100, TC=200, KD=500, NA=1000, HT=3000, Tien=10000
// Base lifespan NPC = 80. lifespanBonus = thêm bao nhiêu khi đạt cảnh giới này (cộng dồn qua breakthrough)
const REALMS_DEFAULT = [
  { name: "Luyện Khí",  exp: 100,  breakthrough: 0.7,  tribulation: 0.0,  lifespanBonus: 20,    hpBonus: 50,   atkBonus: 5,   defBonus: 3   },
  { name: "Trúc Cơ",   exp: 300,  breakthrough: 0.55, tribulation: 0.05, lifespanBonus: 100,   hpBonus: 100,  atkBonus: 15,  defBonus: 8   },
  { name: "Kim Đan",   exp: 800,  breakthrough: 0.4,  tribulation: 0.1,  lifespanBonus: 300,   hpBonus: 200,  atkBonus: 30,  defBonus: 15  },
  { name: "Nguyên Anh",exp: 2000, breakthrough: 0.3,  tribulation: 0.15, lifespanBonus: 500,   hpBonus: 400,  atkBonus: 60,  defBonus: 30  },
  { name: "Hóa Thần",  exp: 5000, breakthrough: 0.2,  tribulation: 0.2,  lifespanBonus: 2000,  hpBonus: 800,  atkBonus: 120, defBonus: 60  },
  { name: "Luyện Hư",  exp: 10000,breakthrough: 0.15, tribulation: 0.25, lifespanBonus: 2000,  hpBonus: 1500, atkBonus: 250, defBonus: 120 },
  { name: "Hợp Thể",   exp: 25000,breakthrough: 0.1,  tribulation: 0.3,  lifespanBonus: 3000,  hpBonus: 3000, atkBonus: 500, defBonus: 250 },
  { name: "Đại Thừa",  exp: 60000,breakthrough: 0.06, tribulation: 0.35, lifespanBonus: 7000,  hpBonus: 6000, atkBonus: 1000,defBonus: 500 },
  { name: "Chân Tiên", exp: Infinity, breakthrough: 0, tribulation: 0,   lifespanBonus: Infinity, hpBonus: 15000, atkBonus: 3000, defBonus: 1500 },
];

// ============================
// DYNAMIC TEMPLATE ACCESSORS
// ============================

function REALMS_ACTIVE() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.realms && t.realms.length) return t.realms;
  }
  return REALMS_DEFAULT;
}

const REALMS = new Proxy(REALMS_DEFAULT, {
  get(target, prop) {
    const live = REALMS_ACTIVE();
    if (prop === "length") return live.length;
    if (prop === Symbol.iterator) return () => live[Symbol.iterator]();
    const n = Number(prop);
    if (!isNaN(n) && String(n) === String(prop)) return live[n];
    if (typeof live[prop] === "function") return live[prop].bind(live);
    return live[prop];
  }
});

function getTemplateNames(gender) {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t) return gender === "male" ? (t.namesMale || NAMES_MALE_DEFAULT) : (t.namesFemale || NAMES_FEMALE_DEFAULT);
  }
  return gender === "male" ? NAMES_MALE_DEFAULT : NAMES_FEMALE_DEFAULT;
}
function getTemplateFamilies() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.families) return t.families;
  }
  return FAMILIES_DEFAULT;
}
function getTemplatePersonalities() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.personalities) return t.personalities;
  }
  return PERSONALITIES;
}
function getTemplateGoals() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.goals) return t.goals;
  }
  return GOALS;
}
function getTemplateCities() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.cities) return t.cities;
  }
  return ["Thanh Van Thanh","Thien Kiem Thanh","Long Uyen Thanh","Huyen Vu Thanh","Van Kiem Thanh","Bang Phong Thanh"];
}
function getTemplateBosses() {
  if (typeof getActiveTemplate === "function") {
    const t = getActiveTemplate();
    if (t && t.bosses && t.bosses.length) return t.bosses;
  }
  return BOSS_POOL;
}

const NAMES_MALE_DEFAULT   = ["Lâm Phàm","Tiêu Viêm","Long Hạo","Tần Phong","Vô Thiên","Kiếm Vô Song","Hàn Lập","Vũ Hạo","Thiên Lang","Mặc Huyền","Lý Thiên","Trần Bình","Dương Khai","Phong Vũ","Hắc Vũ","Hạc Vân","Bạch Vũ","Thương Thiên","Diệp Phàm","Long Thiên"];
const ROOTS = ["Kim","Mộc","Thủy","Hỏa","Thổ","Băng","Lôi","Phong","Ánh Sáng","Hắc Ám","Thiên Linh Căn","Hỗn Độn Căn"];
const ROOT_POWER = [1,1,1,1,1,2,2,2,3,3,5,8];
const SECTS_INIT = [
  { id:"s1", name:"Thanh Vân Tông",  founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800,  treasury:5000,  territory:"🗻 Đông Vực", level:3, warCooldown:0 },
  { id:"s2", name:"Thiên Kiếm Môn", founder:null, leader:null, elders:[], members:[], disciples:[], prestige:750,  treasury:4000,  territory:"🗻 Đông Vực", level:2, warCooldown:0 },
  { id:"s3", name:"Huyết Ma Tông",  founder:null, leader:null, elders:[], members:[], disciples:[], prestige:600,  treasury:3500,  territory:"🌋 Tây Hoang", level:2, warCooldown:0 },
  { id:"s4", name:"Vạn Thú Sơn",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:550,  treasury:3000,  territory:"🌊 Nam Hải",  level:1, warCooldown:0 },
  { id:"s5", name:"Thiên Cơ Các",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:700,  treasury:4500,  territory:"❄️ Bắc Nguyên", level:2, warCooldown:0 },
];
const COUNTRIES_INIT = [
  { id:"c1", name:"Thiên Vũ Quốc",   population:500000, wealth:10000, army:50000, territory:"🗻 Đông Vực",  relations:{}, economy:5000,  military:50000, technology:3, culture:4, level:1, civHistory:[] },
  { id:"c2", name:"Đại Hạ Quốc",    population:600000, wealth:12000, army:60000, territory:"🌊 Nam Hải",   relations:{}, economy:7000,  military:60000, technology:4, culture:3, level:1, civHistory:[] },
  { id:"c3", name:"Thương Lan Quốc", population:400000, wealth:8000,  army:40000, territory:"🌋 Tây Hoang", relations:{}, economy:3500,  military:40000, technology:2, culture:5, level:1, civHistory:[] },
  { id:"c4", name:"Huyền Thiên Quốc",population:450000, wealth:9000,  army:45000, territory:"❄️ Bắc Nguyên",relations:{}, economy:4500,  military:45000, technology:5, culture:2, level:1, civHistory:[] },
];

// Region System — expanded
const REGIONS_DATA = [
  { id:"r1", name:"🗻 Đông Vực",    population:10000, danger:2, resources:{ lingshi:500, lingyao:200, xuantie:100, jingshi:50  }, baseResources:{ lingshi:500, lingyao:200, xuantie:100, jingshi:50 }, tier:"富庶" },
  { id:"r2", name:"🌋 Tây Hoang",   population:6000,  danger:5, resources:{ lingshi:200, lingyao:100, xuantie:400, jingshi:150 }, baseResources:{ lingshi:200, lingyao:100, xuantie:400, jingshi:150 }, tier:"荒野" },
  { id:"r3", name:"🌊 Nam Hải",     population:8000,  danger:3, resources:{ lingshi:350, lingyao:400, xuantie:150, jingshi:80  }, baseResources:{ lingshi:350, lingyao:400, xuantie:150, jingshi:80 }, tier:"富庶" },
  { id:"r4", name:"❄️ Bắc Nguyên", population:5000,  danger:4, resources:{ lingshi:300, lingyao:150, xuantie:200, jingshi:300 }, baseResources:{ lingshi:300, lingyao:150, xuantie:200, jingshi:300 }, tier:"荒野" },
];
const REGIONS = REGIONS_DATA.map(r => r.name);

const PERSONALITIES = ["Kiêu Ngạo","Hiền Hòa","Lạnh Lùng","Nhiệt Huyết","Quỷ Quyệt","Thành Thật","Tàn Nhẫn","Từ Bi","Bí Ẩn","Phóng Khoáng"];
const GOALS = ["Thành Tiên","Báo Thù","Bảo Vệ Gia Tộc","Thống Nhất Thiên Hạ","Tìm Kiếm Đạo Lữ","Lập Tông Môn","Giết Boss","Thu Thập Công Pháp","Tu Luyện Đỉnh Phong"];
const SKILLS_POOL = ["Kiếm Khí Lôi Phong","Hỏa Long Thần Quyền","Băng Vân Bộ","Vạn Kiếm Quy Tông","Huyết Hải Thiên Kiếm","Lôi Đình Vạn Lý","Phong Vũ Song Kiếm","Thiên Cơ Bí Lục","Hắc Ám Lôi Phong","Cửu Dương Thần Công","Âm Dương Hỗn Độn Quyết","Thiên Địa Hợp Nhất"];

// Resource types
const RESOURCES = {
  lingshi:  { name:"Linh Thạch",  icon:"💎", color:"#facc15" },
  lingyao:  { name:"Linh Dược",   icon:"🌿", color:"#4ade80" },
  xuantie:  { name:"Huyền Thiết", icon:"⚙️",  color:"#94a3b8" },
  jingshi:  { name:"Tinh Thạch",  icon:"🔮", color:"#c084fc" },
};

// Equipment system
const WEAPON_POOL = [
  { name:"Phàm Tiết Kiếm",    rarity:"common",    type:"Weapon", icon:"⚔️",  slot:"weapon", atkBonus:15,  defBonus:0,   value:200   },
  { name:"Huyết Nguyệt Đao",  rarity:"uncommon",  type:"Weapon", icon:"🗡️",  slot:"weapon", atkBonus:40,  defBonus:0,   value:800   },
  { name:"Thiên Cương Kiếm",  rarity:"rare",      type:"Weapon", icon:"⚔️",  slot:"weapon", atkBonus:100, defBonus:0,   value:3000  },
  { name:"Thần Kiếm Vô Danh", rarity:"epic",      type:"Weapon", icon:"✨",  slot:"weapon", atkBonus:250, defBonus:0,   value:15000 },
  { name:"Hỗn Độn Kiếm",      rarity:"legendary", type:"Weapon", icon:"🌟", slot:"weapon", atkBonus:600, defBonus:0,   value:80000 },
];
const ARMOR_POOL = [
  { name:"Bố Y",              rarity:"common",    type:"Armor",  icon:"🧥", slot:"armor",  atkBonus:0,   defBonus:10,  value:150   },
  { name:"Huyền Thiết Giáp",  rarity:"uncommon",  type:"Armor",  icon:"🛡", slot:"armor",  atkBonus:0,   defBonus:30,  value:600   },
  { name:"Hỏa Long Giáp",     rarity:"rare",      type:"Armor",  icon:"🔥", slot:"armor",  atkBonus:0,   defBonus:80,  value:5000  },
  { name:"Thiên Ngọc Khải",   rarity:"epic",      type:"Armor",  icon:"💫", slot:"armor",  atkBonus:0,   defBonus:200, value:20000 },
  { name:"Bất Diệt Thần Khải",rarity:"legendary", type:"Armor",  icon:"🌠", slot:"armor",  atkBonus:0,   defBonus:500, value:100000},
];
const ARTIFACT_POOL = [
  { name:"Tụ Linh Bội",       rarity:"uncommon",  type:"Artifact",icon:"🔯", slot:"artifact",atkBonus:10, defBonus:10,  hpBonus:200,  value:1000  },
  { name:"Ngũ Hành Châu",     rarity:"rare",      type:"Artifact",icon:"💠", slot:"artifact",atkBonus:30, defBonus:30,  hpBonus:500,  value:4000  },
  { name:"Thiên Địa Linh Bảo",rarity:"epic",      type:"Artifact",icon:"🌀", slot:"artifact",atkBonus:80, defBonus:80,  hpBonus:2000, value:25000 },
  { name:"Hỗn Nguyên Bảo Kính",rarity:"legendary",type:"Artifact",icon:"🪬", slot:"artifact",atkBonus:200,defBonus:200, hpBonus:8000, value:150000},
];

const ITEM_POOL = [
  { name:"Linh Thạch",         rarity:"common",    type:"Linh Thạch",  icon:"💎", value:100   },
  { name:"Tụ Khí Đan",         rarity:"common",    type:"Đan Dược",    icon:"🔮", value:150   },
  { name:"Hồi Khí Đan",        rarity:"uncommon",  type:"Đan Dược",    icon:"💊", value:300   },
  { name:"Phá Cảnh Đan",       rarity:"rare",      type:"Đan Dược",    icon:"🌀", value:2000  },
  { name:"Cửu Phẩm Linh Đan",  rarity:"legendary", type:"Đan Dược",    icon:"✨", value:50000 },
  { name:"Cửu U Công Pháp",    rarity:"epic",      type:"Công Pháp",   icon:"📖", value:8000  },
  { name:"Bất Tử Thảo",        rarity:"uncommon",  type:"Linh Dược",   icon:"🌿", value:400   },
  { name:"Thiên Linh Lộ Thư",  rarity:"epic",      type:"Bí Tịch",    icon:"📜", value:10000 },
  ...WEAPON_POOL,
  ...ARMOR_POOL,
  ...ARTIFACT_POOL,
];

const BOSS_POOL = [
  { name:"🐉 Cửu U Ma Long",   realm:8, hp:50000, maxHp:50000, skills:["Cửu U Hắc Hỏa","Long Uy Hư Không"], rage:0, loot:["legendary","epic"] },
  { name:"☠️ Vạn Cốt Thần Ma", realm:7, hp:30000, maxHp:30000, skills:["Vạn Cốt Đại Trận","Tử Thần Liêm"],   rage:0, loot:["epic","rare"]      },
  { name:"🌋 Lửa Hỏa Ma Thần", realm:6, hp:20000, maxHp:20000, skills:["Hỏa Hải Thiên Địa","Lửa Hủy Diệt"],  rage:0, loot:["epic","rare"]      },
  { name:"❄️ Băng Phong Thần", realm:5, hp:12000, maxHp:12000, skills:["Vạn Niên Băng Hà","Băng Phong Kiếm"],rage:0, loot:["rare","uncommon"]  },
];

const TITLES_DEF = {
  tianJiao:    "☆ Thiên Kiêu",
  sectMaster:  "🏯 Tông Chủ",
  emperor:     "👑 Đế Vương",
  immortal:    "✨ Chân Tiên",
  bossSlayer:  "🐉 Đồ Long Giả",
  sectFounder: "🌟 Khai Tông Lập Phái",
  luckyStar:   "🌠 Khí Vận Chi Tử",
  warlord:     "⚔️ Chiến Thần",
  realmLord:   "👁 Vùng Chúa",
};

// World Eras
const WORLD_ERAS = [
  { year: 1,    name: "Hồng Hoang Kỷ",   buff: "linh khí dồi dào",   realmMult: 1.5, resourceMult: 1.5 },
  { year: 100,  name: "Thượng Cổ Kỷ",    buff: "anh hùng xuất thế",  realmMult: 1.3, resourceMult: 1.2 },
  { year: 300,  name: "Trung Cổ Kỷ",     buff: "bình thường",        realmMult: 1.0, resourceMult: 1.0 },
  { year: 600,  name: "Mạt Pháp Kỷ",     buff: "linh khí suy giảm",  realmMult: 0.7, resourceMult: 0.8 },
  { year: 1000, name: "Hỗn Loạn Kỷ",     buff: "thiên địa hỗn loạn", realmMult: 0.5, resourceMult: 0.5 },
  { year: 1500, name: "Phục Hưng Kỷ",    buff: "đạo tâm phục hồi",   realmMult: 1.2, resourceMult: 1.3 },
];

// Secret Realm pool
const SECRET_REALM_POOL = [
  { name:"🌀 Cổ Thần Bí Cảnh",  danger:0.15, minRealm:2, rewardRarity:"epic",      duration:5,  capacity:6  },
  { name:"🔥 Hỏa Linh Bí Cảnh", danger:0.10, minRealm:1, rewardRarity:"rare",      duration:3,  capacity:8  },
  { name:"❄️ Băng Hồn Bí Cảnh", danger:0.20, minRealm:3, rewardRarity:"legendary", duration:7,  capacity:4  },
  { name:"🌊 Thâm Hải Bí Cảnh", danger:0.08, minRealm:0, rewardRarity:"uncommon",  duration:2,  capacity:10 },
  { name:"⚡ Lôi Ngục Bí Cảnh", danger:0.25, minRealm:4, rewardRarity:"legendary", duration:10, capacity:3  },
];

// ============================
// STATE
// ============================

var world        = null;
var npcs         = [];
var sects        = [];
var countries    = [];
var bosses       = [];
var regions      = [];
// Territory System
// world.territories holds the array — defined on the world object itself
var secretRealms = [];
var eventTimeline = [];
var logs         = [];
var year         = 1;
var heavenPoints = 1000;
var hallOfFame   = [];
var simRunning   = true;
var simInterval  = null;
var _npcIdCounter = 1;
var currentModal = null;

// World Event System state
let worldEvents       = [];   // history of all triggered events
let activeWorldEvent  = null; // currently active event (with remaining duration)
let _worldEventCooldown = 0;  // years until next auto event

// ============================
// POPULATION STATISTICS (V6 CÂN BẰNG DÂN SỐ)
// ============================
let popStats = {
  births:    0,   // tổng số ca sinh từ đầu
  deaths:    0,   // tổng số ca tử từ đầu
  peakPop:   0,   // dân số đỉnh
  peakYear:  1,   // năm đạt đỉnh
  history:   [],  // [{year, pop, births, deaths}] — mỗi 10 năm ghi 1 lần
  _tickBirths: 0, // sinh trong tick hiện tại
  _tickDeaths: 0, // tử trong tick hiện tại
};

// Dynasty System state
let dynasties = {}; // key = family surname, value = dynasty object

// ============================
// WORLD HISTORY SYSTEM
// ============================
let worldHistory = []; // Permanent record of all major world events

const HISTORY_EVENT_TYPES = {
  breakthrough: { label: "Đột Phá",       icon: "✨", color: "#facc15" },
  war:          { label: "Chiến Tranh",    icon: "⚔️",  color: "#f87171" },
  marriage:     { label: "Đạo Lữ",         icon: "💑", color: "#f472b6" },
  death:        { label: "Tử Vong",        icon: "☠️",  color: "#94a3b8" },
  sect:         { label: "Tông Môn",       icon: "🏯", color: "#fb923c" },
  boss:         { label: "Boss Chiến",     icon: "🐉", color: "#c084fc" },
  heavenly:     { label: "Thiên Sự",       icon: "🌌", color: "#60a5fa" },
  civilization: { label: "Văn Minh",       icon: "🌟", color: "#4ade80" },
  era:          { label: "Kỷ Nguyên",      icon: "🌐", color: "#67e8f9" },
  realm:        { label: "Bí Cảnh",        icon: "🌀", color: "#a78bfa" },
  religion:     { label: "Tôn Giáo",       icon: "✝️",  color: "#fde68a" },
  legend:       { label: "Huyền Thoại",     icon: "📖", color: "#fde047" },
  monument:     { label: "Di Sản",          icon: "🗿", color: "#a3a3a3" },
};

function addWorldHistory(eventType, description, extra = {}) {
  worldHistory.unshift({
    id:          worldHistory.length + 1,
    year,
    eventType,
    description,
    ...extra,
  });
  // Keep max 500 entries (permanent but capped for storage)
  if (worldHistory.length > 500) worldHistory.pop();
}

// ============================
// PERSISTENCE
// ============================

function save() {
  try {
    localStorage.setItem("cgv6_world",       JSON.stringify(world));
    localStorage.setItem("cgv6_npcs",        JSON.stringify(npcs));
    localStorage.setItem("cgv6_sects",       JSON.stringify(sects));
    localStorage.setItem("cgv6_countries",   JSON.stringify(countries));
    localStorage.setItem("cgv6_bosses",      JSON.stringify(bosses));
    localStorage.setItem("cgv6_regions",     JSON.stringify(regions));
    localStorage.setItem("cgv6_realms",      JSON.stringify(secretRealms.slice(0,80)));
    localStorage.setItem("cgv6_timeline",    JSON.stringify(eventTimeline.slice(0, 100)));
    localStorage.setItem("cgv6_logs",        JSON.stringify(logs.slice(0, 200)));
    localStorage.setItem("cgv6_year",        year);
    localStorage.setItem("cgv6_heaven",      heavenPoints);
    localStorage.setItem("cgv6_hof",         JSON.stringify(hallOfFame));
    localStorage.setItem("cgv6_idctr",       _npcIdCounter);
    localStorage.setItem("cgv6_warLogs",     JSON.stringify((sectWarLogs||[]).slice(0,100)));
    localStorage.setItem("cgv6_activeWars",  JSON.stringify(activeWars||[]));
    localStorage.setItem("cgv6_worldEvents", JSON.stringify((worldEvents||[]).slice(0,80)));
    localStorage.setItem("cgv6_activeWorldEvent", JSON.stringify(activeWorldEvent||null));
    localStorage.setItem("cgv6_worldHistory",  JSON.stringify((worldHistory||[]).slice(0,500)));
    localStorage.setItem("cgv6_dynasties",     JSON.stringify(dynasties||{}));
    localStorage.setItem("cgv6_popStats",      JSON.stringify(popStats||{}));
    // Territory System
    if (world && world.territories) {
      localStorage.setItem("cgv6_territories", JSON.stringify(world.territories));
    }
    // Economy System
    if (typeof saveEconomy === "function") saveEconomy();
    if (typeof economyEngine_save === "function") economyEngine_save();
    // War Engine
    if (typeof warEngine_save === "function") warEngine_save();
    // Religion Engine
    if (typeof religionEngine_save === "function") religionEngine_save();
    // Age Engine
    if (typeof ageEngine_save === "function") ageEngine_save();
    // Hero & Legend Engine
    if (typeof heroLegendEngine_save === "function") heroLegendEngine_save();
    // NPC Reputation Engine
    if (typeof npcReputationEngine_save === "function") npcReputationEngine_save();
  } catch(e) { console.warn("Save failed:", e); }
  // Đồng bộ multi-world mỗi lần save
  if (typeof saveWorlds === "function") saveWorlds();
}

function load() {
  try {
    world         = JSON.parse(localStorage.getItem("cgv6_world"))      || null;
    npcs          = JSON.parse(localStorage.getItem("cgv6_npcs"))       || [];
    sects         = JSON.parse(localStorage.getItem("cgv6_sects"))      || [];
    countries     = JSON.parse(localStorage.getItem("cgv6_countries"))  || [];
    bosses        = JSON.parse(localStorage.getItem("cgv6_bosses"))     || [];
    regions       = JSON.parse(localStorage.getItem("cgv6_regions"))    || [];
    secretRealms  = JSON.parse(localStorage.getItem("cgv6_realms"))     || [];
    eventTimeline = JSON.parse(localStorage.getItem("cgv6_timeline"))   || [];
    logs          = JSON.parse(localStorage.getItem("cgv6_logs"))       || [];
    year          = parseInt(localStorage.getItem("cgv6_year"))         || 1;
    heavenPoints  = parseInt(localStorage.getItem("cgv6_heaven"))       || 1000;
    hallOfFame    = JSON.parse(localStorage.getItem("cgv6_hof"))        || [];
    _npcIdCounter = parseInt(localStorage.getItem("cgv6_idctr"))        || 1;
    sectWarLogs   = JSON.parse(localStorage.getItem("cgv6_warLogs"))    || [];
    activeWars    = JSON.parse(localStorage.getItem("cgv6_activeWars")) || [];
    worldEvents       = JSON.parse(localStorage.getItem("cgv6_worldEvents"))     || [];
    activeWorldEvent  = JSON.parse(localStorage.getItem("cgv6_activeWorldEvent"))|| null;
    worldHistory      = JSON.parse(localStorage.getItem("cgv6_worldHistory"))    || [];
    dynasties         = JSON.parse(localStorage.getItem("cgv6_dynasties"))       || {};
    const _savedPopStats = JSON.parse(localStorage.getItem("cgv6_popStats"));
    if (_savedPopStats) Object.assign(popStats, _savedPopStats);
    // Territory System
    const savedTerritories = JSON.parse(localStorage.getItem("cgv6_territories")) || null;
    if (world && savedTerritories) world.territories = savedTerritories;
    // Economy System (after npcs/sects/countries are loaded)
    if (typeof loadEconomy === "function") loadEconomy();
    if (typeof economyEngine_load === "function") economyEngine_load();
    if (typeof economyEngine_init === "function") economyEngine_init();
    // War Engine
    if (typeof warEngine_load === "function") warEngine_load();
    // Religion Engine
    if (typeof religionEngine_load === "function") religionEngine_load();
    // Age Engine
    if (typeof ageEngine_load === "function") ageEngine_load();
    // Hero & Legend Engine
    if (typeof heroLegendEngine_init === "function") heroLegendEngine_init();
    // NPC Reputation Engine
    if (typeof npcReputationEngine_init === "function") npcReputationEngine_init();
    // World Memory Engine
    if (typeof worldMemoryEngine_init === "function") worldMemoryEngine_init();
  } catch(e) {
    console.warn("Load failed, starting fresh:", e);
  }
  // ---- WORLD TEMPLATE MIGRATION ----
  // If existing save has no templateKey, assign default "cultivation"
  if (world && !world.templateKey) {
    world.templateKey = (typeof getTemplateKey === "function")
      ? getTemplateKey(world.genre || "cultivation")
      : "cultivation";
  }

  // EMERGENT: KHÔNG tự động điền SECTS_INIT / COUNTRIES_INIT nếu mảng rỗng
  // Để thế giới mới thực sự bắt đầu trống — NPC tự lập tông môn và quốc gia
  if (!sects.length)     sects     = [];
  if (!countries.length) countries = [];
  else {
    // Migrate existing countries to add civilization fields
    countries.forEach(c => {
      if (c.economy    === undefined) c.economy    = Math.floor(c.wealth * 0.4) || 1000;
      if (c.military   === undefined) c.military   = c.army || 10000;
      if (c.technology === undefined) c.technology = randInt(1, 5);
      if (c.culture    === undefined) c.culture    = randInt(1, 5);
      if (c.level      === undefined) c.level      = 1;
      if (!c.civHistory) c.civHistory = [];
    });
  }
  if (!bosses.length)    bosses    = [];
  if (!regions.length)   regions   = JSON.parse(JSON.stringify(REGIONS_DATA));
  // u2500u2500 EMERGENT CIVILIZATION: init sau load u2500u2500
  setTimeout(function() {
    if (typeof emergentCivilizationInit === "function") emergentCivilizationInit();
  }, 300);
}

// ============================
// UTILS
// ============================

function rand(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function chance(p)     { return Math.random() < p; }
function nextId()      { return _npcIdCounter++; }
function npcById(id)   { return npcs.find(n => n.id === id); }
function sectById(id)  { return sects.find(s => s.id === id); }
function regionByName(name) { return regions.find(r => r.name === name); }

function getCurrentEra() {
  let era = WORLD_ERAS[0];
  for (const e of WORLD_ERAS) { if (year >= e.year) era = e; else break; }
  return era;
}

function realmColor(r) {
  const cols = ["#94a3b8","#4ade80","#facc15","#fb923c","#f472b6","#c084fc","#67e8f9","#ff9e40","#ffffff"];
  return cols[r] || cols[0];
}

// ============================
// TICKER / MARQUEE NOTIFICATION (kiểu game online)
// ============================

const _tickerQueue = [];
let _tickerActive = false;

function _tickerGetClass(msg) {
  if (/boss|chiến thắng|đại chiến|⚔️|🐉|💀/i.test(msg)) return "danger";
  if (/thành lập|khai sinh|hồi sinh|thăng cảnh|🏆|🌟|✨|⭐/i.test(msg)) return "success";
  if (/thiên kiêu|thiên đạo|kỷ nguyên|🌐|💫/i.test(msg)) return "important";
  return "";
}

function _tickerShow(msg) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  container.innerHTML = "";

  const textClass = _tickerGetClass(msg);
  const charWidth = msg.length * 8;
  const totalTravel = (window.innerWidth || 1200) + charWidth;
  const scrollSec = Math.max(6, Math.min(18, totalTravel / 120));

  const wrap = document.createElement("div");
  wrap.className = "toast";
  wrap.innerHTML = `
    <span class="toast-label">📢 Thông Báo</span>
    <span class="toast-track">
      <span class="toast-text${textClass ? " " + textClass : ""}" style="--scroll-duration:${scrollSec}s">${msg}</span>
    </span>`;
  container.appendChild(wrap);

  const totalMs = (scrollSec * 1000) + 300;
  setTimeout(() => {
    wrap.style.transition = "transform 0.25s ease, opacity 0.25s ease";
    wrap.style.transform = "translateY(-100%)";
    wrap.style.opacity = "0";
    setTimeout(() => {
      wrap.remove();
      _tickerActive = false;
      if (_tickerQueue.length > 0) {
        const next = _tickerQueue.shift();
        _tickerActive = true;
        _tickerShow(next);
      }
    }, 280);
  }, totalMs);
}

function toast(msg, duration = 3000) {
  if (!_tickerActive) {
    _tickerActive = true;
    _tickerShow(msg);
  } else {
    if (_tickerQueue.length >= 5) _tickerQueue.shift();
    _tickerQueue.push(msg);
  }
}

// ============================
// LOGGING
// ============================

function addLog(text, type = "normal") {
  logs.unshift({ text, year, type });
  if (logs.length > 300) logs.pop();
  renderLogs();
}

function addTimeline(text, type = "normal", icon = "📌") {
  eventTimeline.unshift({ text, year, type, icon });
  if (eventTimeline.length > 100) eventTimeline.pop();
}

function clearLogs() { logs = []; renderLogs(); save(); }

// ============================
// NPC FACTORY
// ============================

function createNPC(isGenius = false) {
  const gender   = chance(0.5) ? "Nam" : "Nữ";
  const name     = gender === "Nam" ? rand(getTemplateNames("male")) : rand(getTemplateNames("female"));
  const rootIdx  = isGenius ? randInt(6, 11) : Math.floor(Math.pow(Math.random(), 2) * ROOT_POWER.length);
  const root     = ROOTS[Math.min(rootIdx, ROOTS.length - 1)];
  const rootPwr  = ROOT_POWER[Math.min(rootIdx, ROOT_POWER.length - 1)];
  const luck     = isGenius ? randInt(60, 100) : randInt(1, 100);
  const region   = rand(REGIONS);
  const countryInRegion = countries.find(c => c.territory === region);
  const sect     = sects.length ? (sects.find(s => s.territory === region) || rand(sects)) : null;
  const id       = nextId();
  const birthYear = year;

  const npc = {
    id,
    name,
    gender,
    age:         randInt(14, 40),
    family:      rand(getTemplateFamilies()),
    country:     countryInRegion ? countryInRegion.name : (region || '🗻 Đông Vực'),
    city:        rand(getTemplateCities()),
    region,
    sectId:      sect ? sect.id : null,
    root,
    rootPower:   rootPwr,
    realm:       isGenius ? randInt(1, 3) : 0,
    realmProgress: 0,
    hp:          100 + rootPwr * 20 + (isGenius ? 100 : 0),
    maxHp:       100 + rootPwr * 20 + (isGenius ? 100 : 0),
    mp:          50  + rootPwr * 10,
    maxMp:       50  + rootPwr * 10,
    attack:      10  + rootPwr * 3 + randInt(0, 20),
    defense:     5   + rootPwr * 2 + randInt(0, 10),
    speed:       10  + randInt(0, 20),
    luck,
    wealth:      randInt(50, 500),
    reputation:  isGenius ? randInt(100, 500) : randInt(0, 50),
    lifespan:    80 + rootPwr * 2 + (isGenius ? 20 : 0),  // Base Luyện Khí = 100 (80+20bonus)
    married:     false,
    spouseId:    null,
    childrenIds: [],
    parentIds:   [],
    masterId:    null,
    discipleIds: [],
    inventory:   generateStartingInventory(rootPwr),
    equipment:   { weapon: null, armor: null, artifact: null },
    artifacts:   [], // Bảo vật hệ thống v7
    skills:      isGenius ? [rand(SKILLS_POOL), rand(SKILLS_POOL)] : (chance(0.4) ? [rand(SKILLS_POOL)] : []),
    techniques:  [],
    titles:      isGenius ? [TITLES_DEF.tianJiao] : [],
    personality: rand(getTemplatePersonalities()),
    goal:        rand(getTemplateGoals()),
    status:      "alive",
    biography:   [],
    birthYear,
    killCount:   0,
    achievementCount: 0,
    karma:       isGenius ? randInt(20, 80) : randInt(-50, 80),
    fate:        luck > 80 ? "Thiên Mệnh" : (luck > 50 ? "Bình Thường" : "Bạc Mệnh"),
    isTianJiao:  isGenius,
    inSecretRealm: false,
    resources:   { lingshi: randInt(10, 100), lingyao: randInt(0, 20), xuantie: randInt(0, 10), jingshi: 0 },
  };

  npc.biography.push({ year, event: `${name} ra đời tại ${npc.city}, ${npc.country}.` });

  if (sect) {
    sect.members.push(id);
    sect.disciples.push(id);
    npc.biography.push({ year, event: `${name} gia nhập ${sect.name}.` });
  }

  // Register/update dynasty
  registerDynastyMember(npc);

  // Auto-equip starting gear based on rootPower
  autoEquipBestGear(npc);

  return npc;
}

function generateStartingInventory(rootPwr) {
  const inv = [];
  const count = randInt(1, 3 + rootPwr);
  const pool = ITEM_POOL.filter(i => i.rarity === "common" || i.rarity === "uncommon");
  for (let i = 0; i < count; i++) {
    const item = rand(pool);
    inv.push({ ...item, id: `item_${Date.now()}_${Math.random().toString(36).slice(2,6)}` });
  }
  return inv;
}

// ============================
// EQUIPMENT SYSTEM
// ============================

function autoEquipBestGear(npc) {
  const slots = ["weapon","armor","artifact"];
  slots.forEach(slot => {
    const equippable = npc.inventory.filter(i => i.slot === slot);
    if (!equippable.length) return;
    const best = equippable.sort((a,b) => (b.atkBonus||0)+(b.defBonus||0)+(b.hpBonus||0) - ((a.atkBonus||0)+(a.defBonus||0)+(a.hpBonus||0)))[0];
    equipItem(npc, best.id, false);
  });
}

function equipItem(npc, itemId, recalc = true) {
  const item = npc.inventory.find(i => i.id === itemId);
  if (!item || !item.slot) return;
  const slot = item.slot;
  // Unequip old
  if (npc.equipment[slot]) {
    const old = npc.equipment[slot];
    npc.inventory.push(old);
    removeEquipmentStats(npc, old);
  }
  // Equip new
  npc.equipment[slot] = item;
  npc.inventory = npc.inventory.filter(i => i.id !== itemId);
  applyEquipmentStats(npc, item);
}

function applyEquipmentStats(npc, item) {
  if (item.atkBonus) npc.attack  += item.atkBonus;
  if (item.defBonus) npc.defense += item.defBonus;
  if (item.hpBonus)  { npc.maxHp += item.hpBonus; npc.hp = Math.min(npc.hp + item.hpBonus, npc.maxHp); }
}

function removeEquipmentStats(npc, item) {
  if (item.atkBonus) npc.attack  = Math.max(1, npc.attack  - item.atkBonus);
  if (item.defBonus) npc.defense = Math.max(1, npc.defense - item.defBonus);
  if (item.hpBonus)  { npc.maxHp = Math.max(50, npc.maxHp - item.hpBonus); npc.hp = Math.min(npc.hp, npc.maxHp); }
}

// ============================
// WORLD CREATION
// ============================

function createWorld() {
  const worldName    = document.getElementById("worldName").value.trim();
  const genre        = document.getElementById("genre").value;
  const templateKey  = document.getElementById("worldTemplateKey")?.value || "cultivation";
  if (!worldName) { toast("⚠️ Nhập tên thế giới trước!"); return; }

  world = { name: worldName, genre, templateKey, createdYear: year, currentEra: WORLD_ERAS[0].name };
  // Age Engine init
  if (typeof ageEngineInit === "function") ageEngineInit();

  // Assign a world ID immediately so map system can find data
  if (typeof newWorldId === "function" && !currentWorldId) {
    currentWorldId = newWorldId();
  }

  // Load template data into game state
  const tmpl = WORLD_TEMPLATES[templateKey] || WORLD_TEMPLATES.cultivation;
  // EMERGENT: thế giới mới bắt đầu TRỐNG — sects và countries do NPC tự lập
  sects     = [];
  countries = [];
  regions   = JSON.parse(JSON.stringify(tmpl.regions   || REGIONS_DATA));
  // Reset EC unlocks cho thế giới mới
  try { localStorage.removeItem('cgv6_ec_unlocks'); localStorage.removeItem('cgv6_ec_world_state'); } catch(e) {}
  if (typeof ecRenderDynamicSidebar === 'function') setTimeout(ecRenderDynamicSidebar, 100);

  // Territory System — số lãnh địa do người dùng chọn (mặc định 20)
  if (typeof generateTerritories === "function") {
    const tcEl = document.getElementById("territoryCount");
    const tc   = Math.max(5, Math.min(200, parseInt(tcEl ? tcEl.value : 20) || 20));
    world.territories = generateTerritories(tc);
    addLog(`🗺️ Thiên Đạo phân chia thế giới thành ${world.territories.length} lãnh địa.`, "important");
  }

  addLog(`🌍 Thiên Đạo khai sinh thế giới [${worldName}] — ${genre}`, "important");
  addTimeline(`🌍 Thiên Đạo khai sinh thế giới [${worldName}]`, "important", "🌍");
  toast(`✨ Thế giới ${worldName} đã được khai sinh! Simulation bắt đầu...`);
  // Initialize Economy Engine for new world
  engCities = []; engTradeRoutes = []; engGuilds = []; engCrises = [];
  engStats = { totalWorldWealth:0, inflation:1.0, globalProsperity:50, tradeVolume:0, totalCrises:0, ticksElapsed:0 };
  engHistory = [];
  if (typeof economyEngine_init === "function") economyEngine_init();
  renderAll();
  // Render territory panel after world creation
  if (typeof renderTerritories === "function") renderTerritories();
  save();
  if (typeof saveWorlds === "function") saveWorlds();
  simRunning = true;
  const btn = document.getElementById("simToggle");
  if (btn) { btn.textContent = "⏸ Tạm Dừng"; btn.classList.remove("paused"); }
  startSim();
}

// ============================
// NPC GENERATION
// ============================

function regenTerritories() {
  if (!world) { toast("⚠️ Hãy khai sinh thế giới trước!"); return; }
  if (typeof generateTerritories !== "function") { toast("⚠️ Territory system chưa load!"); return; }
  const tcEl = document.getElementById("territoryCount");
  const tc   = Math.max(5, Math.min(200, parseInt(tcEl ? tcEl.value : 20) || 20));
  world.territories = generateTerritories(tc);
  addLog(`🗺️ Thiên Đạo tái phân chia thế giới thành ${world.territories.length} lãnh địa.`, "important");
  toast(`🗺️ Đã tạo ${world.territories.length} lãnh địa!`);
  if (typeof renderTerritories === "function") renderTerritories();
  if (typeof refreshWorldViewer3D === "function") refreshWorldViewer3D();
  if (typeof refreshNPCSpatialEngine === "function") setTimeout(refreshNPCSpatialEngine, 400);
  if (typeof save === "function") save();
}

function generateNPCs(genius = false) {
  if (!world) { toast("⚠️ Hãy khai sinh thế giới trước!"); return; }
  const countEl = document.getElementById("npcCount");
  const count   = parseInt(countEl ? countEl.value : 20) || 20;

  for (let i = 0; i < count; i++) {
    const npc = createNPC(genius);
    npcs.push(npc);
  }

  addLog(`👥 ${count} ${genius ? "thiên kiêu" : "tu sĩ"} xuất hiện trong thiên địa`, "important");
  addTimeline(`👥 ${count} ${genius?"thiên kiêu":"tu sĩ"} xuất hiện`, "important", "👥");
  toast(`✨ Đã triệu hồi ${count} ${genius ? "thiên kiêu" : "tu sĩ"}!`);
  if (typeof mapTick === "function") mapTick();
  if (typeof hookNPCGeneration === "function") hookNPCGeneration();
  renderAll();
  save();
}

// ============================
// NPC ACTIONS (Thiên Đạo)
// ============================

function bless(id) {
  const npc = npcById(id);
  if (!npc || npc.status !== "alive") return;
  if (npc.realm < REALMS.length - 1) {
    npc.realm++;
    applyRealmBonus(npc);
    npc.biography.push({ year, event: `Được Thiên Đạo ban phúc, đột phá ${REALMS[npc.realm].name}.` });
    addLog(`⚡ Thiên Đạo ban phúc: ${npc.name} đột phá ${REALMS[npc.realm].name}!`, "breakthrough");
  }
  renderAll(); save();
}

function tribulation(id) {
  const npc = npcById(id);
  if (!npc || npc.status !== "alive") return;
  if (npc.realm > 0) {
    npc.realm--;
    npc.hp = Math.floor(npc.maxHp * 0.3);
    npc.biography.push({ year, event: `Bị Thiên Đạo giáng kiếp, lùi về ${REALMS[npc.realm].name}.` });
    addLog(`🌩 ${npc.name} bị Thiên Đạo giáng thiên kiếp, tụt xuống ${REALMS[npc.realm].name}`, "death");
  }
  renderAll(); save();
}

function removeNPC(id) {
  const npc = npcById(id);
  if (!npc) return;
  killNPC(npc, "Bị Thiên Đạo xóa khỏi thiên địa", null, true);
  renderAll(); save();
}

function resurrectNPC(id) {
  if (heavenPoints < 200) { toast("⚠️ Không đủ Thiên Đạo Điểm! (Cần 200đ)"); return; }
  const npc = hallOfFame.find(n => n.id === id);
  if (!npc) return;
  heavenPoints -= 200;
  npc.status = "alive";
  npc.hp = npc.maxHp;
  npc.age = Math.max(npc.age - 50, 18);
  npcs.push(npc);
  hallOfFame = hallOfFame.filter(n => n.id !== id);
  npc.biography.push({ year, event: `Được Thiên Đạo hồi sinh từ cõi chết.` });
  addLog(`✨ Thiên Đạo hồi sinh ${npc.name}!`, "important");
  addTimeline(`✨ ${npc.name} được hồi sinh từ cõi chết`, "important", "✨");
  toast(`✨ ${npc.name} đã được hồi sinh!`);
  renderAll(); save();
}

function applyRealmBonus(npc) {
  const r = REALMS[npc.realm];
  npc.maxHp      += r.hpBonus;
  npc.hp          = npc.maxHp;
  npc.attack     += r.atkBonus;
  npc.defense    += r.defBonus;
  npc.lifespan   += r.lifespanBonus;
  npc.realmProgress = 0;
  npc.reputation += 50 * npc.realm;
  // Record in world history
  addWorldHistory("breakthrough", `${npc.name} đột phá thành công ${REALMS[npc.realm].name}`, { npcId: npc.id, npcName: npc.name, realm: npc.realm });
  if (npc.realm >= 8 && !npc.titles.includes(TITLES_DEF.immortal)) {
    npc.titles.push(TITLES_DEF.immortal);
    addLog(`🌟 ${npc.name} phi thăng thành Chân Tiên!`, "important");
    addTimeline(`🌟 ${npc.name} phi thăng Chân Tiên`, "important", "🌟");
  }
}

// ============================
// HEAVEN SYSTEM (Heaven Mode)
// ============================

function useHeavenPoint(action, cost) {
  if (heavenPoints < cost) { toast(`⚠️ Không đủ điểm! Cần ${cost}đ`); return; }
  heavenPoints -= cost;
  const el = document.getElementById("heavenPoints");
  if (el) el.textContent = heavenPoints;

  switch(action) {
    case "bless_all": {
      let count = 0;
      npcs.filter(n => n.status === "alive" && chance(0.3)).forEach(npc => {
        if (npc.realm < REALMS.length - 1) { npc.realm++; applyRealmBonus(npc); count++; }
      });
      addLog(`🌟 Thiên Đạo Hồng Ân — ${count} tu sĩ nhận phúc khí!`, "important");
      addTimeline(`🌟 Ban Phúc — ${count} tu sĩ thăng cảnh`, "important", "🌟");
      toast(`🌟 Hồng Ân ban xuống, ${count} tu sĩ được thăng cảnh!`);
      break;
    }
    case "summon_boss": {
      const boss = JSON.parse(JSON.stringify(rand(getTemplateBosses())));
      boss.hp = boss.maxHp;
      bosses.push(boss);
      addLog(`🐉 Thiên Đạo triệu hồi ${boss.name} xuống trần gian!`, "important");
      addTimeline(`🐉 Boss ${boss.name} giáng thế`, "death", "🐉");
      toast(`🐉 Boss ${boss.name} xuất hiện!`);
      break;
    }
    case "create_secret_realm":
    case "open_secret_realm": {
      spawnSecretRealm(true);
      break;
    }
    case "heavenly_calamity": {
      let count = 0;
      const alive = npcs.filter(n => n.status === "alive");
      alive.forEach(npc => {
        if (chance(0.25)) {
          npc.hp -= randInt(100, Math.floor(npc.maxHp * 0.6));
          if (npc.hp <= 0) { killNPC(npc, "Thiên Kiếp giáng xuống", null, true); count++; }
        }
      });
      addLog(`⚡ Thiên Đạo giáng thiên kiếp — ${count} tu sĩ tử vong!`, "death");
      addTimeline(`⚡ Thiên Kiếp — ${count} tu sĩ tử vong`, "death", "⚡");
      toast(`⚡ Thiên kiếp giáng xuống! ${count} tu sĩ không vượt qua.`);
      break;
    }
    case "create_tianjiao": {
      const genius = createNPC(true);
      npcs.push(genius);
      addLog(`⭐ Thiên Đạo tạo ra Thiên Kiêu [${genius.name}] — ${genius.root}`, "important");
      addTimeline(`⭐ Thiên Kiêu ${genius.name} xuất thế`, "important", "⭐");
      toast(`⭐ Thiên Kiêu ${genius.name} xuất thế!`);
      break;
    }
    case "sect_war": {
      triggerSectWar();
      break;
    }
  }
  renderAll(); save();
}

// ============================
// SECRET REALM SYSTEM
// ============================

function openSecretRealm(fromHeavenMode = true) {
  const template = rand(SECRET_REALM_POOL);
  const eligible = npcs.filter(n =>
    n.status === "alive" && !n.inSecretRealm && n.realm >= template.minRealm
  );
  if (!eligible.length) { toast("⚠️ Không có tu sĩ đủ điều kiện!"); return; }

  const participants = eligible.sort(() => Math.random()-0.5).slice(0, Math.min(template.capacity, eligible.length));
  const results = [];
  const survivors = [];

  participants.forEach(npc => {
    npc.inSecretRealm = true;
    if (chance(template.danger)) {
      // Died in realm
      killNPC(npc, `tử vong trong ${template.name}`);
      results.push(`☠️ ${npc.name} tử vong`);
    } else {
      // Survived and got reward
      const rarities = { common:["common","uncommon"], uncommon:["uncommon","rare"], rare:["rare","epic"], epic:["epic","legendary"], legendary:["legendary"] };
      const rewardPool = ITEM_POOL.filter(i => (rarities[template.rewardRarity]||["rare"]).includes(i.rarity));
      const item = rand(rewardPool);
      if (item) {
        const newItem = { ...item, id: `item_${Date.now()}_${npc.id}` };
        npc.inventory.push(newItem);
        // Auto-equip if better
        if (item.slot) autoEquipBestGear(npc);
        results.push(`✅ ${npc.name} nhận ${item.icon}${item.name}`);
      }
      // Realm breakthrough bonus
      if (chance(0.3) && npc.realm < REALMS.length - 1) {
        npc.realm++;
        applyRealmBonus(npc);
        results.push(`✨ ${npc.name} đột phá ${REALMS[npc.realm].name}`);
      }
      npc.inSecretRealm = false;
      survivors.push(npc.name);
      // Artifact bonus từ bí cảnh
      if (typeof grantDungeonArtifact === "function" && Math.random() < 0.35) {
        const tier = { common:1, uncommon:2, rare:3, epic:4, legendary:5 }[template.rewardRarity] || 2;
        grantDungeonArtifact(npc, tier);
        if (typeof autoEquipArtifactsNPC === "function") autoEquipArtifactsNPC(npc);
      }
    }
  });

  const realm = {
    name: template.name,
    openYear: year,
    closeYear: year + template.duration,
    participants: participants.map(n => n.id),
    results,
    closed: false,
  };
  secretRealms.push(realm);

  addLog(`🌀 ${template.name} khai mở — ${participants.length} tu sĩ vào bí cảnh!`, "important");
  addTimeline(`🌀 Bí Cảnh ${template.name} khai mở`, "important", "🌀");
  results.slice(0, 3).forEach(r => addLog(`  └ ${r}`));
  toast(`🌀 ${template.name} khai mở! ${participants.length} tu sĩ tham gia.`);
}

// ============================
// SECT WAR SYSTEM
// ============================

function triggerSectWar(s1Id, s2Id) {
  const activeSects = sects.filter(s => {
    const members = s.members.map(id => npcById(id)).filter(Boolean).filter(n => n.status === "alive");
    return members.length >= 2 && s.warCooldown <= 0;
  });
  if (activeSects.length < 2) { toast("⚠️ Cần ít nhất 2 tông môn đủ thành viên!"); return; }

  const sect1 = s1Id ? sectById(s1Id) : rand(activeSects);
  const other  = activeSects.filter(s => s.id !== sect1.id);
  const sect2  = s2Id ? sectById(s2Id) : rand(other);
  if (!sect1 || !sect2) return;

  // Calculate war power
  const power1 = sect1.members.reduce((sum, id) => {
    const n = npcById(id);
    return sum + (n && n.status === "alive" ? n.realm * 100 + n.attack : 0);
  }, 0) + sect1.prestige;

  const power2 = sect2.members.reduce((sum, id) => {
    const n = npcById(id);
    return sum + (n && n.status === "alive" ? n.realm * 100 + n.attack : 0);
  }, 0) + sect2.prestige;

  const winner = power1 >= power2 ? sect1 : sect2;
  const loser  = power1 >= power2 ? sect2 : sect1;

  // Casualties
  const loserMembers = loser.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
  let casualties = 0;
  loserMembers.forEach(npc => {
    if (chance(0.25)) { killNPC(npc, `tử trận trong tông môn chiến ${loser.name} vs ${winner.name}`); casualties++; }
    else { npc.hp = Math.floor(npc.maxHp * 0.3); }
  });

  // Prestige/treasury change
  const prestigeGain = randInt(50, 200);
  const treasuryGain = Math.floor(loser.treasury * 0.3);
  winner.prestige += prestigeGain;
  loser.prestige   = Math.max(10, loser.prestige - prestigeGain);
  winner.treasury += treasuryGain;
  loser.treasury  -= treasuryGain;
  loser.treasury   = Math.max(0, loser.treasury);

  // War cooldowns
  sect1.warCooldown = 10;
  sect2.warCooldown = 10;

  addLog(`⚔️ TÔNG MÔN CHIẾN: ${sect1.name} vs ${sect2.name} — ${winner.name} đại thắng! ${casualties} tử vong. Uy danh +${prestigeGain}`, "death");
  addTimeline(`⚔️ ${winner.name} đại bại ${loser.name}`, "death", "⚔️");
  addWorldHistory("war", `${winner.name} đại bại ${loser.name} trong tông môn chiến. ${casualties} tử vong, uy danh +${prestigeGain}`, { winner: winner.name, loser: loser.name, casualties });
  toast(`⚔️ Tông môn chiến kết thúc! ${winner.name} chiến thắng!`);
}

// ============================
// COMBAT SYSTEM
// ============================

function combat(attacker, defender) {
  if (!attacker || !defender || attacker.id === defender.id) return;
  if (attacker.status !== "alive" || defender.status !== "alive") return;

  const skillBonus = attacker.skills.length * 15;
  const damage = Math.max(5,
    (attacker.attack + attacker.realm * 25 + skillBonus) -
    (defender.defense + defender.realm * 10) +
    randInt(-20, 30)
  );

  defender.hp -= damage;

  // Log tất cả giao chiến (không chỉ damage cao)
  if (damage > 200) {
    addLog(`⚔️ ${attacker.name} [${REALMS[attacker.realm].name}] đại chiến ${defender.name} [${REALMS[defender.realm].name}] 💥${damage}!`);
  } else {
    addLog(`⚔️ ${attacker.name} giao chiến ${defender.name} — ${damage} sát thương`);
  }

  if (defender.hp <= 0) {
    attacker.killCount++;
    if (!attacker.titles.includes(TITLES_DEF.warlord) && attacker.killCount >= 10) {
      attacker.titles.push(TITLES_DEF.warlord);
      addLog(`⚔️ ${attacker.name} đạt danh hiệu [Chiến Thần]!`, "important");
    }
    const rewardItems = defender.inventory.filter(() => chance(0.4));
    attacker.inventory.push(...rewardItems);
    rewardItems.forEach(item => { if (item.slot) autoEquipBestGear(attacker); });
    attacker.wealth    += defender.wealth * 0.7;
    attacker.reputation += 20 * (defender.realm + 1);

    if (attacker.realm < REALMS.length - 1 && chance(0.3)) {
      attacker.realm++;
      applyRealmBonus(attacker);
      attacker.biography.push({ year, event: `Đánh bại ${defender.name}, đột phá ${REALMS[attacker.realm].name}.` });
      addLog(`✨ ${attacker.name} đột phá ${REALMS[attacker.realm].name}!`, "breakthrough");
    }

    killNPC(defender, `bị ${attacker.name} đánh chết`, attacker.id);
  }
}

function killNPC(npc, reason, killerId = null, force = false) {
  npc.status      = "dead";
  npc.deathYear   = year;
  npc.deathReason = reason;
  npc.biography.push({ year, event: `${npc.name} qua đời — ${reason}.` });
  npc.inSecretRealm = false;
  // Track death stats
  popStats._tickDeaths++;
  popStats.deaths++;

  sects.forEach(s => {
    s.members   = s.members.filter(id => id !== npc.id);
    s.disciples = s.disciples.filter(id => id !== npc.id);
    s.elders    = s.elders.filter(id => id !== npc.id);
    if (s.founder === npc.id) s.founder = null;
    if (s.leader  === npc.id) s.leader  = null;
  });

  if (npc.spouseId) {
    const spouse = npcById(npc.spouseId);
    if (spouse) { spouse.spouseId = null; spouse.married = false; }
  }

  hallOfFame.unshift({ ...npc });
  if (hallOfFame.length > 50) hallOfFame.pop();

  npcs = npcs.filter(n => n.id !== npc.id);
  addLog(`☠️ ${npc.name} [${REALMS[npc.realm].name}] — ${reason}`, "death");
  addWorldHistory("death", `${npc.name} [${REALMS[npc.realm].name}] — ${reason}`, { npcName: npc.name, realm: npc.realm, reason });
}

// ============================
// BOSS COMBAT
// ============================

function bossAttackNPCs() {
  bosses.forEach(boss => {
    if (boss.hp <= 0) return;
    const alive = npcs.filter(n => n.status === "alive");
    if (!alive.length) return;

    const victim = rand(alive);
    const dmg    = randInt(boss.realm * 30, boss.realm * 100);
    victim.hp   -= dmg;

    if (victim.hp <= 0) {
      killNPC(victim, `bị ${boss.name} tàn sát`);
    }

    const heroes = alive.filter(n => n.realm >= boss.realm - 2);
    if (heroes.length) {
      const hero    = rand(heroes);
      const heroDmg = Math.max(50, hero.attack * 3 + hero.realm * 100);
      boss.hp      -= heroDmg;
      if (boss.hp <= 0) {
        boss.hp = 0;
        addLog(`🌟 ${hero.name} đã đánh bại ${boss.name}!`, "important");
        addTimeline(`🌟 ${hero.name} đánh bại ${boss.name}`, "important", "🏆");
        addWorldHistory("boss", `${hero.name} [${REALMS[hero.realm].name}] đánh bại ${boss.name}`, { hero: hero.name, boss: boss.name });
        hero.killCount++;
        if (!hero.titles.includes(TITLES_DEF.bossSlayer)) {
          hero.titles.push(TITLES_DEF.bossSlayer);
        }
        const lootRarity = rand(boss.loot);
        const allLoot = [...ITEM_POOL, ...WEAPON_POOL, ...ARMOR_POOL, ...ARTIFACT_POOL];
        const loot = rand(allLoot.filter(i => i.rarity === lootRarity));
        if (loot) {
          const newLoot = { ...loot, id: `item_${Date.now()}` };
          hero.inventory.push(newLoot);
          if (loot.slot) autoEquipBestGear(hero);
          addLog(`💎 ${hero.name} nhận được [${loot.name}] từ Boss!`, "important");
        }
        hero.reputation += 5000;
        hero.biography.push({ year, event: `Đánh bại ${boss.name}.` });
        // Artifact bonus từ boss
        if (typeof grantBossArtifact === "function") {
          grantBossArtifact(hero, boss);
          if (typeof autoEquipArtifactsNPC === "function") autoEquipArtifactsNPC(hero);
        }
        // Age Engine: count boss kill
        if (typeof ageEngine_onBossKill === "function") ageEngine_onBossKill();
      }
    }
  });

  bosses = bosses.filter(b => b.hp > 0);
}

// ============================
// CULTIVATION SYSTEM
// ============================

function cultivate(npc) {
  if (npc.status !== "alive") return;
  if (npc.realm >= REALMS.length - 1) return;

  const era  = getCurrentEra();
  const r    = REALMS[npc.realm];
  const gain = (1 + npc.rootPower * 0.5 + npc.luck * 0.01) * randInt(5, 20) * era.realmMult;
  npc.realmProgress += gain;

  if (npc.realmProgress >= r.exp) {
    npc.realmProgress = 0;
    if (chance(r.breakthrough)) {
      if (chance(r.tribulation) && npc.realm >= 2) {
        if (chance(0.3)) {
          killNPC(npc, `vượt không qua thiên kiếp tại ${r.name}`, null);
          return;
        } else {
          npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.2));
          addLog(`🌩 ${npc.name} gặp thiên kiếp tại ${r.name}, bị thương nặng!`);
          npc.biography.push({ year, event: `Gặp thiên kiếp khi đột phá, suýt tử vong.` });
        }
      } else {
        npc.realm++;
        applyRealmBonus(npc);
        npc.biography.push({ year, event: `Đột phá thành công ${REALMS[npc.realm].name}.` });
        addLog(`✨ ${npc.name} đột phá ${REALMS[npc.realm].name}!`, "breakthrough");
        npc.reputation += 100 * npc.realm;
        heavenPoints   += npc.realm * 5;
        if (npc.realm >= 8) {
          addLog(`🌟 ${npc.name} đạt cảnh giới Chân Tiên — phi thăng thành công!`, "important");
        }
      }
    }
  }
}

// ============================
// RESOURCE SYSTEM
// ============================

function gatherResources() {
  regions.forEach(region => {
    const era = getCurrentEra();
    // Replenish region resources
    Object.keys(region.resources).forEach(key => {
      region.resources[key] = Math.min(
        region.baseResources[key] * 2,
        region.resources[key] + Math.floor(region.baseResources[key] * 0.1 * era.resourceMult)
      );
    });

    // NPCs in region gather resources
    const regionNPCs = npcs.filter(n => n.status === "alive" && n.region === region.name && !n.inSecretRealm);
    regionNPCs.forEach(npc => {
      if (!chance(0.3)) return;
      const keys = Object.keys(region.resources).filter(k => region.resources[k] > 0);
      if (!keys.length) return;
      const key = rand(keys);
      const amount = randInt(1, 3 + npc.rootPower);
      const available = Math.min(amount, region.resources[key]);
      if (available <= 0) return;
      region.resources[key] -= available;
      if (!npc.resources) npc.resources = { lingshi:0, lingyao:0, xuantie:0, jingshi:0 };
      npc.resources[key] = (npc.resources[key] || 0) + available;
      // Convert to wealth occasionally
      if (chance(0.2)) {
        const val = available * (RESOURCES[key] ? 50 : 30);
        npc.wealth += val;
      }
    });
  });
}

// ============================
// RELATIONSHIP & MARRIAGE
// ============================

function tryMarriage() {
  const singles = npcs.filter(n => n.status === "alive" && !n.married && n.age >= 16 && n.age < 300);
  if (singles.length < 2) return;

  // Tỷ lệ kết hôn phụ thuộc dân số — dân ít → khuyến khích kết hôn nhiều hơn
  const aliveCount = npcs.filter(n => n.status === "alive").length;
  const popFactor = aliveCount < 50 ? 4.0 : (aliveCount < 100 ? 2.0 : 1.0);

  // Thử kết hôn nhiều cặp mỗi tick
  const attempts = Math.max(2, Math.floor(singles.length / 8));
  for (let i = 0; i < attempts; i++) {
    const a = rand(singles);
    if (a.married) continue;
    // Tìm bạn đời trong cùng vùng, khác giới
    let partners = singles.filter(n => n.id !== a.id && !n.married && n.region === a.region && n.gender !== a.gender);
    // Nếu không có trong vùng, mở rộng tìm toàn bộ
    if (!partners.length) partners = singles.filter(n => n.id !== a.id && !n.married && n.gender !== a.gender);
    if (!partners.length) continue;
    const b = rand(partners);
    // Tỷ lệ kết hôn: ~15% base × popFactor
    if (!chance(0.15 * popFactor)) continue;

    a.married = true; a.spouseId = b.id;
    b.married = true; b.spouseId = a.id;
    a.biography.push({ year, event: `Kết đạo lữ với ${b.name}.` });
    b.biography.push({ year, event: `Kết đạo lữ với ${a.name}.` });
    addLog(`💑 ${a.name} và ${b.name} kết thành đạo lữ!`, "important");
    addWorldHistory("marriage", `${a.name} và ${b.name} kết thành đạo lữ`, { npcName: a.name, partner: b.name });
  }
}

// Tính khả năng sinh sản theo tuổi (phong tục tu tiên: có thể sinh ở tuổi > 100 nếu còn ở Luyện Khí)
function _fertilityRate(mother, father) {
  const aliveCount = npcs.filter(n => n.status === "alive").length;
  // Dân số thấp → tỷ lệ sinh tăng mạnh
  let popBonus = aliveCount < 20 ? 5.0 : (aliveCount < 50 ? 3.0 : (aliveCount < 100 ? 1.8 : 1.0));
  // Tuổi sinh sản tối ưu: 16-60 tuổi (so với tuổi thọ cảnh giới đó)
  const lifeRatio = mother.age / mother.lifespan;
  let ageFactor = lifeRatio < 0.1 ? 0.3 :   // quá trẻ
                  lifeRatio < 0.5 ? 1.0 :    // tuổi sinh đẹp
                  lifeRatio < 0.7 ? 0.6 :    // bắt đầu giảm
                                   0.2;       // già
  // Số con hiện có: nhiều con → giảm tỷ lệ
  const existingChildren = (mother.childrenIds || []).length;
  const childPenalty = Math.max(0.1, 1.0 - existingChildren * 0.15);
  const eraBirthMult = typeof ageBirthMult === "function" ? ageBirthMult() : 1.0;
  return 0.25 * popBonus * ageFactor * childPenalty * eraBirthMult;
}

function _spawnChild(mother, father) {
  const child = createNPC(false);
  child.family   = mother.family;
  child.country  = mother.country;
  child.region   = mother.region;
  child.age      = 0;
  child.parentIds = [mother.id, father.id];
  child.rootPower = Math.max(mother.rootPower, father.rootPower) + (chance(0.1) ? 1 : 0);
  child.luck      = Math.floor((mother.luck + father.luck) / 2) + randInt(-10, 20);
  child.fate      = child.luck > 80 ? "Thiên Mệnh" : "Bình Thường";
  if (child.luck > 90) { child.isTianJiao = true; child.titles.push(TITLES_DEF.tianJiao); }
  const dynasty = dynasties[mother.family];
  if (dynasty) {
    child.wealth     = Math.floor((mother.wealth + father.wealth) * 0.15 + dynasty.wealth * 0.02);
    child.reputation = Math.floor((mother.reputation + father.reputation) * 0.1 + dynasty.reputation * 0.05);
    child.generation = Math.max(mother.generation || 1, father.generation || 1) + 1;
  }
  child.generation = child.generation || (Math.max(mother.generation || 1, father.generation || 1) + 1);
  child.biography = [{ year, event: `Ra đời là con của ${father.name} và ${mother.name} — thế hệ ${child.generation} gia tộc ${mother.family}.` }];
  npcs.push(child);
  mother.childrenIds.push(child.id);
  father.childrenIds.push(child.id);
  popStats._tickBirths++;
  popStats.births++;
  return child;
}

function tryBirth() {
  const couples = npcs.filter(n => n.status === "alive" && n.married && n.spouseId && n.gender === "Nữ" && n.age < n.lifespan * 0.8);
  couples.forEach(mother => {
    const father = npcById(mother.spouseId);
    if (!father || father.status !== "alive") return;
    const rate = _fertilityRate(mother, father);
    if (!chance(rate)) return;

    // Số con sinh lần này: 1-5, thường là 1
    const numChildren = chance(0.1) ? randInt(2, 5) : 1;
    for (let c = 0; c < numChildren; c++) {
      const child = _spawnChild(mother, father);
      mother.biography.push({ year, event: `Sinh hạ ${child.name}.` });
      addLog(`👶 ${mother.name} và ${father.name} sinh hạ ${child.name}!`);
    }
    if (numChildren > 1) addLog(`🍼 ${mother.name} sinh đôi/ba — ${numChildren} đứa trẻ ra đời!`, "important");
    updateDynasty(mother.family);
  });
}

// ============================
// SECT SYSTEM
// ============================

function openCreateSectModal() {
  const html = `
    <h2 style="font-family:var(--font-heading);color:var(--gold);margin-bottom:20px">🏯 Lập Tông Môn Mới</h2>
    <input id="newSectName" class="dao-input" placeholder="Tên tông môn..." style="margin-bottom:10px">
    <select id="newSectTerritory" class="dao-select" style="margin-bottom:16px">
      ${REGIONS.map(r => `<option>${r}</option>`).join("")}
    </select>
    <button class="btn-primary" onclick="createSect()">🌟 Lập Tông Môn</button>
  `;
  openModal(html);
}

function createSect() {
  const name = document.getElementById("newSectName").value.trim();
  const territory = document.getElementById("newSectTerritory").value;
  if (!name) { toast("⚠️ Nhập tên tông môn!"); return; }
  const id = "s" + Date.now();
  sects.push({ id, name, founder:null, leader:null, elders:[], members:[], disciples:[], prestige:100, treasury:500, territory, level:1, warCooldown:0 });
  addLog(`🏯 Tông môn [${name}] được lập tại ${territory}!`, "important");
  addTimeline(`🏯 ${name} được thành lập tại ${territory}`, "important", "🏯");
  addWorldHistory("sect", `Tông môn [${name}] được thành lập tại ${territory}`, { sectName: name, territory });
  toast(`🏯 Tông môn ${name} đã được thành lập!`);
  closeModalBtn();
  renderSects();
  save();
}

function sectEvents() {
  if (!sects.length) return;

  sects.forEach(s => {
    // War cooldown
    if (s.warCooldown > 0) s.warCooldown--;

    // Resource income based on members and level
    const liveMembers = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
    s.treasury  += randInt(5, 30) * (s.level || 1) + liveMembers.length * 2;
    s.prestige  += randInt(0, 5);

    // Level up
    if (s.treasury >= 10000 * (s.level||1) && (s.level||1) < 9) {
      s.level = (s.level || 1) + 1;
      addLog(`🏯 ${s.name} thăng lên cấp ${s.level}!`, "important");
    }

    // Clean dead members
    s.members   = s.members.filter(id => npcById(id) && npcById(id).status === "alive");
    s.disciples = s.disciples.filter(id => npcById(id) && npcById(id).status === "alive");

    // Assign leader from top members
    const topMembers = liveMembers.sort((a,b) => b.realm - a.realm || b.reputation - a.reputation);
    if (topMembers.length) {
      s.elders  = topMembers.slice(0, 3).map(n => n.id);
      s.leader  = topMembers[0].id;
      if (!s.founder) s.founder = topMembers[0].id;
    }

    // Auto-recruit nearby NPCs
    if (chance(0.2)) {
      const loner = npcs.find(n => n.status === "alive" && !n.sectId && n.region === s.territory && n.age >= 14);
      if (loner) {
        loner.sectId = s.id;
        s.members.push(loner.id);
        s.disciples.push(loner.id);
        loner.biography.push({ year, event: `Gia nhập ${s.name}.` });
      }
    }
  });

  // Sect master titles
  sects.forEach(s => {
    if (s.leader) {
      const master = npcById(s.leader);
      if (master && !master.titles.includes(TITLES_DEF.sectMaster)) {
        master.titles.push(TITLES_DEF.sectMaster);
        addLog(`🏯 ${master.name} trở thành Tông Chủ của ${s.name}!`, "important");
        master.biography.push({ year, event: `Trở thành Tông Chủ ${s.name}.` });
      }
    }
  });

  // Random sect war
  const _sectWarChance = typeof ageWarChance === "function" ? ageWarChance(0.03) : 0.03;
  if (chance(_sectWarChance)) { triggerSectWar(); if (typeof ageEngine_onWar === "function") ageEngine_onWar(); }
}

// ============================
// CIVILIZATION SYSTEM (V6.1)
// ============================

const CIV_LEVEL_THRESHOLDS = [
  { level:1, name:"Bộ Lạc",     icon:"🏕️", req:{ population:0,      economy:0,     military:0,     technology:0, culture:0 } },
  { level:2, name:"Thành Bang",  icon:"🏘️", req:{ population:200000,  economy:5000,  military:10000, technology:2, culture:2 } },
  { level:3, name:"Vương Quốc", icon:"🏰", req:{ population:500000,  economy:15000, military:30000, technology:4, culture:4 } },
  { level:4, name:"Đế Quốc",    icon:"🗼", req:{ population:1000000, economy:40000, military:80000, technology:6, culture:6 } },
  { level:5, name:"Thiên Triều", icon:"👑", req:{ population:2000000, economy:100000,military:200000,technology:8, culture:8 } },
];

const CIV_EVENTS = [
  { name:"Hoàng Kim Thời Đại",  icon:"✨", type:"buff",  effect: c => { c.economy*=1.2; c.culture+=1; addLog(`✨ ${c.name}: Hoàng Kim Thời Đại! Kinh tế và văn hóa bùng nổ.`, "important"); } },
  { name:"Đại Dịch",            icon:"☣️", type:"debuff",effect: c => { c.population=Math.floor(c.population*0.88); c.economy=Math.floor(c.economy*0.9); addLog(`☣️ ${c.name} bị Đại Dịch! Dân số và kinh tế suy giảm.`, "death"); } },
  { name:"Kỹ Thuật Đột Phá",   icon:"⚙️", type:"buff",  effect: c => { c.technology+=2; c.military=Math.floor(c.military*1.15); addLog(`⚙️ ${c.name}: Đột phá công nghệ! Quân sự tăng mạnh.`, "important"); } },
  { name:"Khởi Nghĩa Nông Dân", icon:"⚔️", type:"debuff",effect: c => { c.military=Math.floor(c.military*0.85); c.economy=Math.floor(c.economy*0.9); addLog(`⚔️ ${c.name}: Nội loạn! Quân đội và kinh tế bị tổn thất.`, "death"); } },
  { name:"Văn Hóa Phồn Thịnh", icon:"🎭", type:"buff",  effect: c => { c.culture+=2; c.population=Math.floor(c.population*1.05); addLog(`🎭 ${c.name}: Văn hóa phồn thịnh! Dân số tăng trưởng.`, "important"); } },
  { name:"Đại Hạn Hán",        icon:"🔥", type:"debuff",effect: c => { c.population=Math.floor(c.population*0.95); c.economy=Math.floor(c.economy*0.85); addLog(`🔥 ${c.name} gặp Đại Hạn Hán! Kinh tế và dân số bị ảnh hưởng.`, "death"); } },
];

function civilizationTick(c) {
  const liveNPCs = npcs.filter(n => n.country === c.name && n.status === "alive");
  const techBonus  = 1 + (c.technology || 1) * 0.05;
  const cultureBonus = 1 + (c.culture || 1) * 0.04;
  const npcBonus   = liveNPCs.length * 0.001;

  // Economy growth: base + tech + npc practitioners contribute
  const ecoGrowth = Math.floor((50 + randInt(20, 80)) * techBonus + npcBonus * 100);
  c.economy = (c.economy || 1000) + ecoGrowth;
  c.wealth  = (c.wealth  || 1000) + ecoGrowth;

  // Population growth: base + culture + economy driven
  const popGrowth = Math.floor((500 + randInt(100, 900)) * cultureBonus + c.economy * 0.001);
  c.population = (c.population || 100000) + popGrowth;

  // Military growth: economy + technology
  const milGrowth = Math.floor((200 + randInt(50, 300)) * techBonus);
  c.military = (c.military || 10000) + milGrowth;
  c.army     = c.military; // sync old field

  // Technology slow growth (requires economy investment)
  if (c.economy > 10000 * (c.technology || 1) && chance(0.05)) {
    c.technology = (c.technology || 1) + 1;
    addLog(`⚙️ ${c.name} nâng cấp Công Nghệ lên Cấp ${c.technology}!`, "important");
    c.civHistory.push({ year, event: `Công Nghệ đạt Cấp ${c.technology}` });
  }

  // Culture slow growth
  if (liveNPCs.length > 5 && chance(0.04)) {
    c.culture = (c.culture || 1) + 1;
    addLog(`🎭 ${c.name} nâng cao Văn Hóa lên Cấp ${c.culture}!`, "important");
    c.civHistory.push({ year, event: `Văn Hóa đạt Cấp ${c.culture}` });
  }

  // Level up check
  const currentLevel = c.level || 1;
  const nextThreshold = CIV_LEVEL_THRESHOLDS[currentLevel]; // index = next level
  if (nextThreshold &&
      c.population >= nextThreshold.req.population &&
      c.economy    >= nextThreshold.req.economy &&
      c.military   >= nextThreshold.req.military &&
      (c.technology||1) >= nextThreshold.req.technology &&
      (c.culture||1)    >= nextThreshold.req.culture) {
    c.level = currentLevel + 1;
    const lvlData = CIV_LEVEL_THRESHOLDS[c.level - 1];
    addLog(`🌟 QUỐC GIA THĂNG CẤP! ${c.name} tiến lên ${lvlData.icon} ${lvlData.name} (Cấp ${c.level})!`, "important");
    addTimeline(`🌟 ${c.name} → ${lvlData.icon} ${lvlData.name}`, "important", "🌟");
    c.civHistory.push({ year, event: `Thăng cấp lên ${lvlData.name}` });
    heavenPoints += c.level * 20;
  }

  // War between countries
  if (chance(0.03)) {
    const other = rand(countries.filter(x => x.id !== c.id));
    if (other) {
      const myPower    = (c.military || 10000) * (1 + (c.technology||1) * 0.1);
      const theirPower = (other.military || 10000) * (1 + (other.technology||1) * 0.1);
      const myWins     = myPower > theirPower;
      const loss       = randInt(2000, Math.floor((c.military || 10000) * 0.15));
      const otherLoss  = randInt(2000, Math.floor((other.military || 10000) * 0.15));
      c.military     = Math.max(1000, c.military - loss);
      other.military = Math.max(1000, other.military - otherLoss);
      c.army = c.military; other.army = other.military;

      if (myWins) {
        const plunder = Math.floor(other.economy * 0.08);
        c.economy     += plunder;
        other.economy  = Math.max(500, other.economy - plunder);
        addLog(`⚔️ Chiến tranh: ${c.name} đại thắng ${other.name}! Cướp ${plunder.toLocaleString()} tài phú.`, "death");
        addTimeline(`⚔️ ${c.name} chiến thắng ${other.name}`, "death", "⚔️");
        c.civHistory.push({ year, event: `Chiến thắng ${other.name}, cướp ${plunder.toLocaleString()} tài phú` });
      } else {
        addLog(`⚔️ Chiến tranh: ${c.name} vs ${other.name} — đôi bên thương vong nặng nề!`, "death");
      }
    }
  }

  // Random civ event (rare)
  if (chance(0.015)) {
    const evt = rand(CIV_EVENTS);
    evt.effect(c);
    c.civHistory.push({ year, event: `${evt.icon} ${evt.name}` });
  }

  // Emperor title for top NPC
  const topNPC = liveNPCs.sort((a,b) => b.realm - a.realm)[0];
  if (topNPC && topNPC.realm >= 3 && !topNPC.titles.includes(TITLES_DEF.emperor)) {
    topNPC.titles.push(TITLES_DEF.emperor);
    addLog(`👑 ${topNPC.name} xưng đế tại ${c.name}!`, "important");
    addTimeline(`👑 ${topNPC.name} xưng đế`, "important", "👑");
    topNPC.biography.push({ year, event: `Xưng đế tại ${c.name}.` });
  }

  // Cap civHistory
  if (c.civHistory.length > 30) c.civHistory = c.civHistory.slice(-30);
}

function countryEvents() {
  countries.forEach(c => civilizationTick(c));
}

// ============================
// WORLD EVOLUTION (ERAS)
// ============================

function checkWorldEra() {
  const era = getCurrentEra();
  if (world && world.currentEra !== era.name) {
    world.currentEra = era.name;
    addLog(`🌐 Thiên Địa tiến vào [${era.name}] — ${era.buff}`, "important");
    addTimeline(`🌐 Kỷ nguyên mới: ${era.name}`, "important", "🌐");
    addWorldHistory("era", `Thiên Địa tiến vào kỷ nguyên mới: ${era.name} — ${era.buff}`, { era: era.name });
    toast(`🌐 Kỷ nguyên mới: ${era.name}!`, 5000);
  }
}

// ============================
// WORLD EVENT SYSTEM
// ============================

const WORLD_EVENT_POOL = [
  {
    id: "thien_dia_di_tuong",
    name: "🌌 Thiên Địa Dị Tượng",
    type: "THIÊN ĐẠO",
    typeColor: "#c084fc",
    icon: "🌌",
    desc: "Thiên địa đột nhiên biến dị, linh khí hỗn loạn tràn lan khắp bốn phương. Những tu sĩ cảm ngộ được thiên cơ sẽ đột phá phi thường.",
    duration: 5,
    rarity: "epic",
    effects: [
      { label: "Linh Khí Bùng Nổ", icon: "✨", type: "atk", value: +30, desc: "Tất cả tu sĩ: +30 Công Kích" },
      { label: "Phòng Thủ Suy Yếu", icon: "🌀", type: "def", value: -15, desc: "Tất cả tu sĩ: -15 Phòng Thủ" },
      { label: "Tu Luyện Bùng Phát", icon: "🔥", type: "cultivation", value: 2.5, desc: "Tu luyện x2.5 trong thời gian dị tượng" },
    ],
    applyToNPC: (npc) => {
      npc.attack  += 30;
      npc.defense  = Math.max(1, npc.defense - 15);
      if (chance(0.12) && npc.realm < REALMS.length - 1) {
        npc.realm++;
        applyRealmBonus(npc);
        npc.biography.push({ year, event: "Cảm ngộ Thiên Địa Dị Tượng, đột phá cảnh giới!" });
        return { outcome: "buff", label: "Đột Phá!" };
      }
      if (chance(0.05)) {
        const dmg = Math.floor(npc.maxHp * 0.35);
        npc.hp = Math.max(1, npc.hp - dmg);
        npc.biography.push({ year, event: "Bị linh khí hỗn loạn xâm nhập, trọng thương." });
        return { outcome: "injury", label: "Trọng Thương" };
      }
      return { outcome: "buff", label: "+ATK" };
    },
    applyToSect: (sect) => { sect.prestige += randInt(80, 200); sect.treasury += randInt(200, 800); },
    applyToCountry: (c) => { c.wealth += randInt(500, 2000); },
  },
  {
    id: "hac_nhat_giang_lam",
    name: "🌑 Hắc Nhật Giáng Lâm",
    type: "MA ĐẠO",
    typeColor: "#f87171",
    icon: "🌑",
    desc: "Mặt trời đen xuất hiện, hắc khí dày đặc che khuất trời đất. Ma đạo tu sĩ đại hưng, chính phái tu sĩ bị suy giảm sức mạnh. Tử vong tăng cao.",
    duration: 4,
    rarity: "legendary",
    effects: [
      { label: "Hắc Khí Ô Nhiễm", icon: "🌑", type: "death", value: 0.18, desc: "Mỗi tu sĩ có 18% nguy cơ tử vong" },
      { label: "Tông Môn Rối Loạn", icon: "💀", type: "sect", value: -30, desc: "Tất cả tông môn: uy danh -30%" },
      { label: "Quốc Gia Suy Vong", icon: "🏚", type: "country", value: -0.2, desc: "Quốc gia mất 20% tài nguyên" },
    ],
    applyToNPC: (npc) => {
      if (chance(0.18)) {
        killNPC(npc, "bị Hắc Nhật hắc khí xâm thực");
        return { outcome: "death", label: "Tử Vong" };
      }
      const dmg = Math.floor(npc.maxHp * randInt(15, 45) / 100);
      npc.hp = Math.max(1, npc.hp - dmg);
      npc.biography.push({ year, event: "Bị Hắc Nhật hắc khí xâm thực, bị thương nặng." });
      return { outcome: "injury", label: "Bị Thương" };
    },
    applyToSect: (sect) => { sect.prestige = Math.max(10, Math.floor(sect.prestige * 0.7)); sect.treasury = Math.floor(sect.treasury * 0.85); },
    applyToCountry: (c) => { c.wealth = Math.floor(c.wealth * 0.8); c.army = Math.floor(c.army * 0.85); },
  },
  {
    id: "ma_vuc_mo_cua",
    name: "🌋 Ma Vực Mở Cửa",
    type: "MA GIỚI",
    typeColor: "#fb923c",
    icon: "🌋",
    desc: "Cổng ma vực bừng mở, ma khí tràn ngập khắp nơi. Vô số ma tu và ma thú tràn ra đại lục, gây chiến khắp nơi. Tu sĩ đại chiến ma quân!",
    duration: 6,
    rarity: "epic",
    effects: [
      { label: "Ma Quân Xâm Lăng", icon: "👹", type: "war", value: 0.25, desc: "Tu sĩ ngẫu nhiên phải giao chiến ma quân" },
      { label: "Ma Khí Ô Nhiễm", icon: "🌋", type: "def", value: -20, desc: "Tất cả tu sĩ: -20 Phòng Thủ" },
      { label: "Cơ Hội Luyện Ma Pháp", icon: "⚡", type: "atk", value: +50, desc: "Tu sĩ sống sót: +50 Công Kích" },
    ],
    applyToNPC: (npc) => {
      npc.defense = Math.max(1, npc.defense - 20);
      if (chance(0.25)) {
        const maGuanAtk = randInt(npc.realm * 50 + 100, npc.realm * 150 + 300);
        const dmg = Math.max(10, maGuanAtk - npc.defense);
        npc.hp = Math.max(0, npc.hp - dmg);
        if (npc.hp <= 0) {
          killNPC(npc, "bị Ma Quân tiêu diệt khi Ma Vực mở cửa");
          return { outcome: "death", label: "Tử Trận" };
        }
        npc.biography.push({ year, event: "Giao chiến Ma Quân khi Ma Vực mở cửa, trọng thương." });
        return { outcome: "injury", label: "Bại Trận" };
      }
      npc.attack += 50;
      npc.biography.push({ year, event: "Luyện thành Ma Pháp trong Ma Vực, tăng công kích." });
      return { outcome: "buff", label: "+Công Kích" };
    },
    applyToSect: (sect) => {
      const loss = Math.floor(sect.treasury * 0.15);
      sect.treasury = Math.max(0, sect.treasury - loss);
      sect.prestige += randInt(50, 150);
    },
    applyToCountry: (c) => {
      c.army = Math.floor(c.army * 0.75);
      c.population = Math.floor(c.population * 0.92);
    },
  },
  {
    id: "thuy_kiep",
    name: "🌊 Thủy Kiếp",
    type: "THIÊN TAI",
    typeColor: "#60a5fa",
    icon: "🌊",
    desc: "Đại hồng thủy từ thiên ngoại giáng xuống. Vùng đất chìm trong biển nước, tài nguyên bị tàn phá, vô số sinh linh chết chóc.",
    duration: 3,
    rarity: "rare",
    effects: [
      { label: "Hồng Thủy Tàn Phá", icon: "🌊", type: "resource", value: -0.5, desc: "Tài nguyên tất cả vùng giảm 50%" },
      { label: "Dân Chúng Lưu Vong", icon: "🚶", type: "country", value: -0.15, desc: "Dân số giảm 15%" },
      { label: "Tu Sĩ Bị Thương", icon: "💧", type: "injury", value: 0.2, desc: "20% tu sĩ bị thương" },
    ],
    applyToNPC: (npc) => {
      if (chance(0.20)) {
        const dmg = Math.floor(npc.maxHp * randInt(20, 50) / 100);
        npc.hp = Math.max(1, npc.hp - dmg);
        npc.biography.push({ year, event: "Bị cuốn trong Thủy Kiếp, chịu thương nặng." });
        return { outcome: "injury", label: "Thương Nặng" };
      }
      if (chance(0.05)) {
        killNPC(npc, "chết đuối trong Thủy Kiếp");
        return { outcome: "death", label: "Tử Vong" };
      }
      return { outcome: "resource", label: "Tài nguyên -" };
    },
    applyToSect: (sect) => { sect.treasury = Math.floor(sect.treasury * 0.7); },
    applyToCountry: (c) => {
      c.population = Math.floor(c.population * 0.85);
      c.wealth     = Math.floor(c.wealth     * 0.75);
    },
  },
  {
    id: "thien_ngoai_van_thach",
    name: "☄️ Thiên Ngoại Vẫn Thạch",
    type: "THIÊN THẠCH",
    typeColor: "#facc15",
    icon: "☄️",
    desc: "Vẫn thạch từ thiên ngoại giáng xuống, mang theo linh khí cổ đại vô cùng quý hiếm. Có người phá cảnh, có người bị thiên thạch nghiền nát.",
    duration: 2,
    rarity: "legendary",
    effects: [
      { label: "Linh Thạch Cổ Đại", icon: "💎", type: "resource", value: +300, desc: "Mỗi tu sĩ có thể nhận Linh Thạch Cổ Đại" },
      { label: "Tiểu Thiên Địa Rung Chuyển", icon: "☄️", type: "death", value: 0.08, desc: "8% tu sĩ bị thiên thạch đè chết" },
      { label: "Kỳ Duyên Đột Phá", icon: "🌟", type: "breakthrough", value: 0.20, desc: "20% tu sĩ có cơ hội đột phá cảnh giới" },
    ],
    applyToNPC: (npc) => {
      if (chance(0.08)) {
        killNPC(npc, "bị Thiên Ngoại Vẫn Thạch nghiền nát");
        return { outcome: "death", label: "Tử Vong" };
      }
      if (chance(0.20) && npc.realm < REALMS.length - 1) {
        npc.realm++;
        applyRealmBonus(npc);
        npc.biography.push({ year, event: "Hấp thụ linh khí thiên thạch, đột phá cảnh giới!" });
        return { outcome: "buff", label: "Đột Phá!" };
      }
      const lingshi = randInt(100, 400);
      npc.resources.lingshi = (npc.resources.lingshi || 0) + lingshi;
      npc.wealth += lingshi * 50;
      npc.biography.push({ year, event: `Thu nhặt ${lingshi} Linh Thạch Cổ Đại từ vẫn thạch.` });
      return { outcome: "resource", label: `+${lingshi} Linh Thạch` };
    },
    applyToSect: (sect) => { sect.treasury += randInt(1000, 5000); sect.prestige += randInt(100, 300); },
    applyToCountry: (c) => { c.wealth += randInt(2000, 8000); },
  },
  {
    id: "thien_linh_khai_phong",
    name: "🌸 Thiên Linh Khai Phong",
    type: "THIÊN ÂN",
    typeColor: "#4ade80",
    icon: "🌸",
    desc: "Trời đất mở rộng lòng từ bi, Thiên Linh Hoa nở khắp nơi. Linh khí cường thịnh, vạn vật sinh sôi phát triển vô cùng mạnh mẽ.",
    duration: 8,
    rarity: "rare",
    effects: [
      { label: "Thiên Ân Phổ Chiếu", icon: "🌸", type: "atk", value: +20, desc: "Tất cả tu sĩ: +20 Công Kích và +20 Phòng Thủ" },
      { label: "Linh Khí Thịnh Vượng", icon: "✨", type: "cultivation", value: 2.0, desc: "Tu luyện tốc độ x2.0" },
      { label: "Vạn Vật Hồi Phục", icon: "💚", type: "heal", value: 1.0, desc: "Tất cả tu sĩ hồi phục hoàn toàn sinh lực" },
    ],
    applyToNPC: (npc) => {
      npc.attack  += 20;
      npc.defense += 20;
      npc.hp = npc.maxHp;
      npc.biography.push({ year, event: "Được Thiên Ân phổ chiếu, sức mạnh tăng trưởng!" });
      return { outcome: "buff", label: "Thiên Ân" };
    },
    applyToSect: (sect) => { sect.prestige += randInt(100, 400); sect.treasury += randInt(500, 2000); },
    applyToCountry: (c) => { c.wealth += randInt(1000, 4000); c.population += randInt(5000, 20000); },
  },
  {
    id: "co_than_thuc_giac",
    name: "👁 Cổ Thần Thức Giác",
    type: "THẦN LINH",
    typeColor: "#a78bfa",
    icon: "👁",
    desc: "Cổ Thần từ hồng hoang thức tỉnh, ý chí thần linh tràn ngập thiên địa. Tu sĩ yếu hèn tan biến, người mạnh mẽ được thần linh phong ấn.",
    duration: 3,
    rarity: "legendary",
    effects: [
      { label: "Thần Ý Quét Sạch", icon: "👁", type: "death", value: 0.22, desc: "22% tu sĩ yếu bị tiêu diệt" },
      { label: "Phong Ấn Cường Giả", icon: "⚡", type: "atk", value: +100, desc: "Tu sĩ mạnh nhất nhận phong ấn +100 Công Kích" },
      { label: "Tông Môn Rung Chuyển", icon: "🏯", type: "sect", value: -50, desc: "Tông môn yếu bị suy giảm nghiêm trọng" },
    ],
    applyToNPC: (npc) => {
      if (npc.realm <= 1 && chance(0.22)) {
        killNPC(npc, "bị Cổ Thần Thần Ý quét sạch");
        return { outcome: "death", label: "Bị Tiêu Diệt" };
      }
      if (npc.realm >= 5) {
        npc.attack += 100;
        npc.biography.push({ year, event: "Nhận phong ấn Cổ Thần, sức mạnh phi thường!" });
        return { outcome: "buff", label: "Thần Ấn" };
      }
      return { outcome: "injury", label: "Rung Chuyển" };
    },
    applyToSect: (sect) => {
      if (sect.level <= 1) {
        sect.prestige = Math.max(10, sect.prestige - 50);
        sect.treasury = Math.floor(sect.treasury * 0.6);
      } else {
        sect.prestige += randInt(200, 500);
      }
    },
    applyToCountry: (c) => { c.army = Math.floor(c.army * 0.8); },
  },
];

function triggerWorldEvent(eventDef) {
  if (!world) return;
  const evt = eventDef || rand(WORLD_EVENT_POOL);
  const aliveNPCs = npcs.filter(n => n.status === "alive");
  const affectedNPCs     = [];
  const affectedSects    = [];
  const affectedCountries= [];

  // Apply to NPCs (sample up to 60)
  const sample = aliveNPCs.length > 60
    ? aliveNPCs.sort(() => Math.random() - 0.5).slice(0, 60)
    : aliveNPCs;

  sample.forEach(npc => {
    const result = evt.applyToNPC(npc);
    if (result && npc.status === "alive") {
      affectedNPCs.push({ id: npc.id, name: npc.name, realm: npc.realm, ...result });
    } else if (result && result.outcome === "death") {
      affectedNPCs.push({ id: npc.id, name: npc.name, realm: npc.realm, ...result });
    }
  });

  // Apply to sects
  sects.forEach(s => {
    evt.applyToSect(s);
    affectedSects.push({ id: s.id, name: s.name });
  });

  // Apply to countries
  countries.forEach(c => {
    evt.applyToCountry(c);
    affectedCountries.push({ id: c.id, name: c.name });
  });

  // Apply to regions
  regions.forEach(r => {
    if (evt.id === "thuy_kiep") {
      Object.keys(r.resources).forEach(k => { r.resources[k] = Math.floor(r.resources[k] * 0.5); });
    }
    if (evt.id === "thien_ngoai_van_thach") {
      Object.keys(r.resources).forEach(k => { r.resources[k] += randInt(50, 200); });
    }
  });

  // Record the active event
  activeWorldEvent = {
    ...evt,
    triggeredYear: year,
    expiresYear: year + evt.duration,
    affectedNPCs:      affectedNPCs.slice(0, 40),
    affectedSects,
    affectedCountries,
  };

  // Add to history
  const deathCount    = affectedNPCs.filter(n => n.outcome === "death").length;
  const breakthroughs = affectedNPCs.filter(n => n.outcome === "buff" && n.label.includes("Phá")).length;
  worldEvents.unshift({
    ...evt,
    triggeredYear: year,
    expiresYear: year + evt.duration,
    deathCount,
    breakthroughs,
    affectedCount: affectedNPCs.length,
    summary: `${deathCount} tử vong, ${breakthroughs} đột phá, ${affectedNPCs.length} tu sĩ bị ảnh hưởng.`,
  });
  if (worldEvents.length > 60) worldEvents.pop();

  addLog(`${evt.icon} SỰ KIỆN THẾ GIỚI: ${evt.name} — ${evt.desc.slice(0, 60)}...`, "important");
  addTimeline(`${evt.icon} ${evt.name}`, "important", evt.icon);
  addWorldHistory("heavenly", `${evt.name} — ${evt.desc.slice(0, 80)}`, { eventName: evt.name, deathCount: worldEvents[0]?.deathCount || 0, eventType: evt.type });

  // Show dramatic banner
  showWorldEventBanner(evt);

  _worldEventCooldown = randInt(8, 20);
  save();
  if (document.getElementById("panel-events")?.classList.contains("active")) renderEventsPanel();
}

function showWorldEventBanner(evt) {
  const existing = document.getElementById("worldEventBanner");
  if (existing) existing.remove();

  const colors = {
    typeColor: evt.typeColor || "#facc15",
  };
  const banner = document.createElement("div");
  banner.id = "worldEventBanner";
  banner.className = "world-event-banner";
  banner.style.cssText = `background:rgba(10,12,16,0.92);border-color:${colors.typeColor}44;color:var(--white-main);`;
  banner.innerHTML = `
    <span class="web-banner-icon">${evt.icon}</span>
    <div class="web-banner-name" style="color:${colors.typeColor}">${evt.name}</div>
    <div class="web-banner-desc">${evt.desc.slice(0, 80)}...</div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.animation = "we-slide-out 0.5s ease forwards";
    setTimeout(() => banner.remove(), 500);
  }, 6000);
}

function autoWorldEventTick() {
  if (!world) return;
  // Expire active event
  if (activeWorldEvent && year >= activeWorldEvent.expiresYear) {
    addLog(`${activeWorldEvent.icon} ${activeWorldEvent.name} đã kết thúc.`, "normal");
    activeWorldEvent = null;
  }
  // Cooldown
  if (_worldEventCooldown > 0) { _worldEventCooldown--; return; }
  // Random trigger
  if (chance(0.08) && !activeWorldEvent) {
    triggerWorldEvent();
  }
}

function manualTriggerWorldEvent() {
  if (!world) { toast("⚠️ Hãy khai sinh thế giới trước!"); return; }
  triggerWorldEvent();
  toast("🌌 Thiên Địa Dị Tượng đã được kích hoạt!");
  renderEventsPanel();
}

// ============================
// EVENTS PANEL RENDERER
// ============================

function renderEventsPanel() {
  if (!document.getElementById("panel-events")?.classList.contains("active")) return;

  // Stats bar
  const statsEl = document.getElementById("eventsPanelStats");
  if (statsEl) statsEl.textContent = `📜 ${worldEvents.length} sự kiện · ☠️ ${worldEvents.reduce((s,e)=>s+(e.deathCount||0),0)} tử vong`;

  // Current event
  const curEl = document.getElementById("currentWorldEvent");
  if (curEl) {
    if (activeWorldEvent) {
      const evt = activeWorldEvent;
      const remaining  = Math.max(0, evt.expiresYear - year);
      const pct        = Math.max(0, Math.min(100, (remaining / evt.duration) * 100));
      curEl.innerHTML = `
        <div class="world-event-active" style="--event-color:${evt.typeColor||'var(--gold)'}; border:1px solid ${evt.typeColor||'var(--gold)'}22">
          <div class="we-header">
            <div class="we-icon-wrap" style="--event-color:${evt.typeColor||'var(--gold)'}">${evt.icon}</div>
            <div class="we-title-block">
              <div class="we-name" style="--event-color:${evt.typeColor||'var(--gold)'}">${evt.name}</div>
              <span class="we-type-tag" style="color:${evt.typeColor};border-color:${evt.typeColor}44;background:${evt.typeColor}10">${evt.type}</span>
              <div class="we-desc">${evt.desc}</div>
            </div>
          </div>
          <div class="we-meta">
            <div class="we-meta-item">⏳ Bắt đầu: <strong>Năm ${evt.triggeredYear}</strong></div>
            <div class="we-meta-item">🔚 Kết thúc: <strong>Năm ${evt.expiresYear}</strong></div>
            <div class="we-meta-item">⏱ Còn lại: <strong>${remaining} năm</strong></div>
            <div class="we-meta-item">💀 Tử vong: <strong style="color:var(--red)">${worldEvents[0]?.deathCount||0}</strong></div>
            <div class="we-meta-item">✨ Đột Phá: <strong style="color:var(--jade)">${worldEvents[0]?.breakthroughs||0}</strong></div>
          </div>
          <div class="we-duration-bar">
            <div class="we-duration-label"><span>Thời gian còn lại</span><span>${remaining}/${evt.duration} năm</span></div>
            <div class="we-bar-track"><div class="we-bar-fill" style="width:${pct}%;background:${evt.typeColor||'var(--gold)'}"></div></div>
          </div>
        </div>`;
    } else {
      curEl.innerHTML = `<div class="we-empty">☯ Thiên Địa Bình Yên — Không có dị tượng đang diễn ra.<br><small style="opacity:.5">Sự kiện tiếp theo sẽ xuất hiện ngẫu nhiên...</small></div>`;
    }
  }

  // Effects
  const effEl = document.getElementById("worldEventEffects");
  if (effEl) {
    if (activeWorldEvent?.effects?.length) {
      effEl.innerHTML = `<div class="we-effects-list">${activeWorldEvent.effects.map(e => {
        const isPos = typeof e.value === "number" ? e.value > 0 : false;
        const isNeg = typeof e.value === "number" ? e.value < 0 : false;
        const valClass = isPos ? "positive" : isNeg ? "negative" : "neutral";
        const valStr   = typeof e.value === "number"
          ? (e.value > 1 ? `x${e.value}` : (e.value > 0 ? `+${e.value}` : `${e.value}`))
          : String(e.value);
        return `<div class="we-effect-item">
          <div class="we-effect-icon">${e.icon}</div>
          <div class="we-effect-text"><strong>${e.label}</strong><br><small style="color:var(--white-dim)">${e.desc}</small></div>
          <div class="we-effect-val ${valClass}">${valStr}</div>
        </div>`;
      }).join("")}</div>`;
    } else {
      effEl.innerHTML = `<div class="we-empty">Không có hiệu ứng đang hoạt động.</div>`;
    }
  }

  // Affected entities
  const affEl = document.getElementById("worldEventAffected");
  if (affEl) {
    if (activeWorldEvent?.affectedNPCs?.length) {
      const list = activeWorldEvent.affectedNPCs.slice(0, 30);
      affEl.innerHTML = `<div class="we-affected-list">${list.map(n => {
        const realmName = REALMS[n.realm]?.name || "?";
        return `<div class="we-affected-item">
          <div class="we-affected-avatar">🧙</div>
          <div class="we-affected-name">${n.name} <span style="font-size:10px;color:var(--white-dim)">[${realmName}]</span></div>
          <span class="we-affected-outcome ${n.outcome}">${n.label}</span>
        </div>`;
      }).join("")}${activeWorldEvent.affectedNPCs.length > 30 ? `<div style="color:var(--white-dim);font-size:11px;text-align:center;padding:6px">...và ${activeWorldEvent.affectedNPCs.length - 30} tu sĩ khác</div>` : ""}</div>`;
    } else {
      affEl.innerHTML = `<div class="we-empty">Chưa có thực thể nào bị ảnh hưởng.</div>`;
    }
  }

  // History
  const histEl = document.getElementById("worldEventHistory");
  if (histEl) {
    if (worldEvents.length) {
      histEl.innerHTML = `<div class="we-history-list">${worldEvents.map(e => `
        <div class="we-history-entry">
          <div class="we-history-icon">${e.icon}</div>
          <div class="we-history-body">
            <div class="we-history-name" style="color:${e.typeColor||'var(--gold)'}">${e.name}</div>
            <div class="we-history-detail">
              <span class="we-type-tag" style="font-size:9px;color:${e.typeColor};border-color:${e.typeColor}33;background:${e.typeColor}08">${e.type}</span>
              ${e.summary || ""}
            </div>
          </div>
          <div class="we-history-year">Năm ${e.triggeredYear}</div>
        </div>`).join("")}</div>`;
    } else {
      histEl.innerHTML = `<div class="we-empty">📜 Chưa có sự kiện nào xảy ra trong thiên địa này.</div>`;
    }
  }
}

// ============================
// WORLD SIMULATION TICK
// ============================

function simulateWorld() {
  if (!world || !simRunning) return;
  year++;
  heavenPoints += 10;

  // Artifact yearly discovery hook
  if (typeof window._artifactYearlyHook === "function") window._artifactYearlyHook();

  // Check era (Age Engine V1)
  if (typeof ageEngineTick === "function") ageEngineTick();
  else checkWorldEra();

  // Aging & cultivation
  const aliveNPCs = npcs.filter(n => n.status === "alive");
  aliveNPCs.forEach(npc => {
    npc.age++;
    if (npc.age > npc.lifespan) { killNPC(npc, "thọ nguyên cạn kiệt"); return; }
    npc.hp = Math.min(npc.maxHp, npc.hp + Math.floor(npc.maxHp * 0.05));
    npc.mp = Math.min(npc.maxMp, npc.mp + Math.floor(npc.maxMp * 0.1));
    cultivate(npc);
    npc.wealth += Math.floor(npc.realm * 2 + npc.luck * 0.1);
    // Chance to learn skill
    if (chance(0.01) && npc.skills.length < 5) { npc.skills.push(rand(SKILLS_POOL)); }
  });

  // Events
  const alive2 = npcs.filter(n => n.status === "alive");
  if (alive2.length >= 2) {
    // Số trận đấu mỗi tick: tối thiểu 1, tối đa 4 tùy số lượng tu sĩ
    const combatCount = Math.min(4, Math.max(1, Math.floor(alive2.length / 20)));
    for (let ci = 0; ci < combatCount; ci++) {
      if (!chance(0.7)) continue;
      // Ưu tiên đánh tu sĩ khác tông môn hoặc khác vùng
      const attacker = rand(alive2);
      const enemies = alive2.filter(n => n.id !== attacker.id && (n.sectId !== attacker.sectId || n.region !== attacker.region));
      const defender = enemies.length ? rand(enemies) : rand(alive2.filter(n => n.id !== attacker.id));
      if (defender) combat(attacker, defender);
    }
  }
  tryMarriage();
  tryBirth();  // rate controlled by _fertilityRate() internally
  sectEvents();
  sectResourceTick();   // ← faction war: resource income
  autoSectWar();        // ← faction war: random battles
  countryEvents();
  gatherResources();
  // Economy System
  if (typeof simulateEconomy === "function") simulateEconomy();
  if (typeof economyEngine_tick === "function") economyEngine_tick();
  if (typeof mythologyEngine_tick === "function") mythologyEngine_tick();
  if (typeof technologyEngine_tick === "function") { try { technologyEngine_tick(); } catch(e) { console.warn("[TechEngine]", e); } }
  if (bosses.length > 0 && chance(0.5)) bossAttackNPCs();

  // AUTO BOSS SPAWN: ~5% mỗi tick nếu không có boss nào, ~2% nếu đã có boss (tối đa 3)
  if (world && npcs.filter(n=>n.status==="alive").length >= 5) {
    const _bossBase0 = bosses.length === 0 ? 0.05 : (bosses.length < 3 ? 0.02 : 0);
    const bossSpawnChance = typeof ageBossSpawnChance === "function" ? ageBossSpawnChance(_bossBase0) : _bossBase0;
    if (chance(bossSpawnChance)) {
      const newBoss = JSON.parse(JSON.stringify(rand(getTemplateBosses())));
      newBoss.hp = newBoss.maxHp;
      bosses.push(newBoss);
      addLog(`🐉 Thiên Địa biến đổi! ${newBoss.name} xuất hiện!`, "important");
      addTimeline(`🐉 Boss ${newBoss.name} giáng thế`, "death", "🐉");
      toast(`🐉 Boss ${newBoss.name} xuất hiện!`);
    }
  }

  // Secret realm system V2
  tickSecretRealms();
  // Artifact events
  artifactEventTick();
  // Dynasty system
  dynastyTick();

  // ── DUNGEON AUTO-SPAWN & TICK ──
  if (typeof tickDungeons === "function") {
    tickDungeons();
  } else {
    // fallback nếu dungeonSystem chưa load: tự spawn
    if (typeof dungeons !== "undefined" && typeof generateDungeon === "function") {
      const activeDg = dungeons.filter(d => d.status === "active").length;
      if (activeDg === 0 && chance(0.3)) generateDungeon();
      else if (activeDg < 3  && chance(0.08)) generateDungeon();
    }
  }

  // ── THIÊN ĐÌNH AUTO-TICK ──
  if (typeof thiendinhTick === "function") {
    try { thiendinhTick(); } catch(e) {}
  }

  // ── PLAYER AUTO AI TICK ──
  if (typeof window.autoPlayerAI !== "undefined" && typeof window.autoPlayerAI.tick === "function") {
    try { window.autoPlayerAI.tick(); } catch(e) {}
  }

  // Player quest system tick (safety call in case patch missed)
  if (typeof simulateQuestSystem === "function") simulateQuestSystem();
  // Auto-generate quests if queue empty
  if (typeof player !== "undefined" && player && player.status === "alive") {
    if (typeof playerQuests !== "undefined" && playerQuests.available.length === 0) {
      if (typeof generateQuest === "function") generateQuest();
    }
  }

  // ── EMERGENT CIVILIZATION TICK ──
  if (typeof emergentCivilizationTick === "function") {
    try { emergentCivilizationTick(); } catch(e) { console.warn("[EC]", e); }
  }

  // ── WAR ENGINE TICK ──
  if (typeof warEngine_tick === "function") {
    try { warEngine_tick(); } catch(e) { console.warn("[WarEngine]", e); }
  }

  // ── RELIGION ENGINE TICK ──
  if (typeof religionEngine_tick === "function") {
    try { religionEngine_tick(); } catch(e) { console.warn("[ReligionEngine]", e); }
  }

  // ── TERRITORY WAR TICK ──
  if (typeof simulateTerritoryWar === "function") {
    try { simulateTerritoryWar(); } catch(e) { console.warn("[TerritoryWar]", e); }
  }

  // ============================
  // CÂN BẰNG DÂN SỐ V6
  // ============================
  const currentPop = npcs.filter(n => n.status === "alive").length;

  // Cập nhật dân số đỉnh
  if (currentPop > popStats.peakPop) {
    popStats.peakPop  = currentPop;
    popStats.peakYear = year;
  }

  // Ghi lịch sử mỗi 10 năm
  if (year % 10 === 0) {
    popStats.history.push({ year, pop: currentPop, births: popStats._tickBirths, deaths: popStats._tickDeaths });
    if (popStats.history.length > 200) popStats.history.shift();
    popStats._tickBirths = 0;
    popStats._tickDeaths = 0;
  }

  // Cảnh báo dân số thấp (không can thiệp tự động)
  if (currentPop > 0 && currentPop < 30 && year % 30 === 0) {
    addLog(`⚠️ Dân số chỉ còn ${currentPop} người — Nguy cơ tuyệt chủng! Thiên Đình có thể can thiệp.`, "important");
  }

  // ── Kiểm tra tuyệt chủng tự nhiên ──
  if (currentPop === 0 && npcs.length > 0) {
    // Tất cả đã chết — thế giới tuyệt chủng tự nhiên
    if (!world._extinct) {
      world._extinct = true;
      world._extinctYear = year;
      addLog(`💀 Thế giới [${world.name}] đã tuyệt chủng hoàn toàn vào năm ${year}. Nền văn minh kết thúc.`, "death");
      addTimeline(`💀 Tuyệt Chủng — Nền Văn Minh Kết Thúc`, "death", "💀");
      toast(`💀 Thế giới tuyệt chủng! Dùng Thiên Đình để cứu nếu muốn.`);
    }
  } else if (currentPop > 0 && world && world._extinct) {
    // Phục hồi từ tuyệt chủng (nhờ Thiên Đình can thiệp thủ công)
    world._extinct = false;
    addLog(`🌱 Thế giới [${world.name}] phục sinh từ tuyệt chủng!`, "important");
  }

  renderAll();
  if (year % 10 === 0) save();  // save mỗi 10 năm thay vì mỗi tick
}

// ============================
// SIMULATION CONTROL
// ============================

function toggleSimulation() {
  simRunning = !simRunning;
  const btn = document.getElementById("simToggle");
  if (simRunning) {
    startSim();
    if (btn) { btn.textContent = "⏸ Tạm Dừng"; btn.classList.remove("paused"); }
  } else {
    clearInterval(simInterval);
    if (btn) { btn.textContent = "▶ Tiếp Tục"; btn.classList.add("paused"); }
  }
}

function changeSimSpeed() {
  const speed = parseInt(document.getElementById("simSpeed").value);
  if (simRunning) { clearInterval(simInterval); simInterval = setInterval(simulateWorld, speed); }
}

function startSim() {
  clearInterval(simInterval);
  const speed = parseInt(document.getElementById("simSpeed")?.value || 2000);
  simInterval = setInterval(simulateWorld, speed);
}

// ============================
// RENDER: PANELS
// ============================

function showPanel(name) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add("active");
  const btn = document.querySelector(`[data-panel="${name}"]`);
  if (btn) btn.classList.add("active");
  // Render dashboard when switching to it
  if (name === "dashboard")      renderDashboard();
  if (name === "sectwars")       renderSectWars();
  if (name === "secret-realms")  renderSecretRealmsPanel();
  if (name === "world-history")  renderWorldHistory();
  if (name === "dynasty")        renderDynastyPanel();
  if (name === "dynasty-engine") { if (typeof renderDynastyEnginePanel === "function") { try { renderDynastyEnginePanel(); } catch(e) { console.warn("dynastyEngine panel error", e); } } }
  if (name === "religion")       { if (typeof religionEngine_renderPanel === "function") { try { religionEngine_renderPanel(); } catch(e) { console.warn("religionEngine panel error", e); } } }
  if (name === "age")            { if (typeof renderAgePanel === "function") { try { renderAgePanel(); } catch(e) { console.warn("agePanel error", e); } } }
  if (name === "hero-legend")    { if (typeof renderHeroLegendPanel === "function") { try { renderHeroLegendPanel(); } catch(e) { console.warn("heroLegendPanel error", e); } } }
  if (name === "npc-reputation") { if (typeof renderNpcReputationPanel === "function") { try { renderNpcReputationPanel(); } catch(e) { console.warn("npcReputationPanel error", e); } } }
  if (name === "technology")     { if (typeof renderTechnologyPanel === "function")     { try { renderTechnologyPanel();     } catch(e) { console.warn("technologyPanel error", e); } } }
  if (name === "empire")         renderEmpirePanel();
  if (name === "worldmap")       { setTimeout(function(){ if(typeof onMapPanelShow==="function") onMapPanelShow(); }, 30); }
  if (name === "world3d")        {
    setTimeout(function() {
      if (typeof initWorldViewer3D === "function" && (typeof wv3d === "undefined" || !wv3d.initialized)) {
        initWorldViewer3D();
      } else if (typeof refreshWorldViewer3D === "function") {
        refreshWorldViewer3D();
      }
    }, 80);
  }
  if (name === "thiendinh")      { if (typeof renderThiendinhPanel === "function") { try { renderThiendinhPanel(); } catch(e) {} } }
  if (name === "territory-war")  { if (typeof initTerritoryWarPanel  === "function") { try { setTimeout(initTerritoryWarPanel, 50); } catch(e) {} } }
  if (name === "dungeon")        { if (typeof renderDungeonPanel   === "function") { try { renderDungeonPanel();   } catch(e) {} } }
  if (name === "quest")          { if (typeof renderQuestPanel     === "function") { try { renderQuestPanel();     } catch(e) {} } }
}

// ============================
// RENDER: WORLD
// ============================

function renderWorldInfo() {
  const title    = document.getElementById("worldTitle");
  const statsBar = document.getElementById("worldStats");
  if (!world) {
    if (title)    title.textContent = "Chưa Khai Thiên...";
    if (statsBar) statsBar.textContent = "";
    return;
  }
  const era = getCurrentEra();
  if (title)    title.textContent = `☯ ${world.name} — ${world.genre}`;
  if (statsBar) statsBar.innerHTML = `👥 ${npcs.length} tu sĩ  ·  🏯 ${sects.length} tông môn  ·  ⚔️ ${countries.length} quốc gia  ·  🐉 ${bosses.length} boss  ·  <span style="color:${era.color||'#67e8f9'}">${era.name}</span>`;

  const statsCard = document.getElementById("worldStatsCard");
  if (statsCard) {
    const alive   = npcs.filter(n => n.status === "alive");
    const topRealm = alive.length ? REALMS[Math.max(...alive.map(n=>n.realm))].name : "—";
    const totalLS  = alive.reduce((s,n) => s + (n.resources?.lingshi||0), 0);
    const statDefs = [
      { icon:"👥", label:"Tu Sĩ",       value: alive.length,              color:"#7dd3fc" },
      { icon:"⏳", label:"Năm",          value: year,                      color:"#facc15" },
      { icon:"🌐", label:"Kỷ Nguyên",   value: era.name.split(" ")[0],    color:"#c084fc" },
      { icon:"🏯", label:"Tông Môn",    value: sects.length,              color:"#86efac" },
      { icon:"⚔️", label:"Quốc Gia",   value: countries.length,          color:"#fca5a5" },
      { icon:"🐉", label:"Boss",         value: bosses.length,             color:"#f97316" },
      { icon:"🌟", label:"Đỉnh Cảnh",  value: topRealm,                  color:"#facc15" },
      { icon:"⚡", label:"Thiên Điểm",  value: heavenPoints,              color:"#38bdf8" },
      { icon:"☠️", label:"Đã Ngã",     value: hallOfFame.length,         color:"#94a3b8" },
      { icon:"🌀", label:"Bí Cảnh",    value: secretRealms.length,       color:"#818cf8" },
      { icon:"💎", label:"Linh Thạch",  value: totalLS.toLocaleString(),  color:"#34d399" },
    ];
    statsCard.innerHTML = statDefs.map(s => `
      <div class="stat-item">
        <div style="font-size:18px;margin-bottom:4px;line-height:1">${s.icon}</div>
        <div class="s-value" style="color:${s.color};font-size:15px">${s.value}</div>
        <div class="s-label" style="margin-top:4px">${s.label}</div>
      </div>`).join("");
  }
}

function renderRegions() {
  const el = document.getElementById("regions");
  if (!el) return;
  el.innerHTML = regions.map(region => {
    const count     = npcs.filter(n => n.region === region.name && n.status === "alive").length;
    const sectCount = sects.filter(s => s.territory === region.name).length;
    const topNPC    = npcs.filter(n => n.region === region.name && n.status === "alive").sort((a,b) => b.realm-a.realm)[0];
    const res = region.resources;
    return `<div class="region-box">
      <h3>${region.name}</h3>
      <p>👥 <span>${count}</span> tu sĩ · 🏯 <span>${sectCount}</span> tông môn</p>
      <p>⚠️ Nguy Hiểm: <span>${region.danger}/10</span></p>
      <p>👑 <span style="color:var(--gold)">${topNPC ? topNPC.name+" ["+REALMS[topNPC.realm].name+"]" : "—"}</span></p>
      <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:11px">
        ${Object.entries(res).map(([k,v]) => `<span>${RESOURCES[k]?.icon||"?"} ${RESOURCES[k]?.name||k}: <b style="color:var(--gold)">${Math.floor(v)}</b></span>`).join("")}
      </div>
    </div>`;
  }).join("");
}

// ============================
// RENDER: NPCs
// ============================

function filterNPCs() {
  const search      = (document.getElementById("npcSearch")?.value || "").toLowerCase();
  const realmFilter = document.getElementById("npcFilterRealm")?.value;
  const sortBy      = document.getElementById("npcSort")?.value || "realm";

  let filtered = npcs.filter(n => n.status === "alive");
  if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search));
  if (realmFilter !== "") filtered = filtered.filter(n => String(n.realm) === realmFilter);
  filtered.sort((a,b) => (b[sortBy]||0) - (a[sortBy]||0));
  renderNPCList(filtered);
}

function renderNPCs() { filterNPCs(); }

function renderNPCList(list) {
  const el = document.getElementById("npcList");
  if (!el) return;
  if (!list.length) { el.innerHTML = `<div style="color:var(--white-dim);padding:20px;text-align:center">Không có tu sĩ nào</div>`; return; }

  el.innerHTML = list.map(npc => {
    const sect   = sectById(npc.sectId);
    const hpPct  = Math.max(0, Math.min(100, (npc.hp / npc.maxHp) * 100));
    const mpPct  = Math.max(0, Math.min(100, (npc.mp / npc.maxMp) * 100));
    const expPct = Math.min(100, ((npc.realmProgress || 0) / (REALMS[npc.realm]?.exp || 1)) * 100);
    const rc     = realmColor(npc.realm);
    const eqIcons = [npc.equipment?.weapon, npc.equipment?.armor, npc.equipment?.artifact]
      .filter(Boolean).map(e => e.icon).join("");

    const realmIcons = ["🔘","🌿","⚡","🔥","🌸","💜","🌊","🌟","👑"];
    const realmIcon  = realmIcons[npc.realm] || "🔘";
    const genderIcon = npc.gender === "Nữ" ? "👩" : "👨";

    return `<div class="npc-card" onclick="openNPCModal(${npc.id})" style="--realm-color:${rc};background:linear-gradient(135deg,var(--bg-card) 70%,${rc}0d 100%)">
      <div class="npc-card-header">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:32px;height:32px;border-radius:50%;background:${rc}22;border:2px solid ${rc};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${realmIcon}</div>
          <div>
            <div class="npc-name">${genderIcon} ${npc.name}${npc.inSecretRealm ? " 🌀" : ""}</div>
            <div style="font-size:10px;color:${rc};opacity:0.8">${npc.gender} · ${npc.root}</div>
          </div>
        </div>
        <div class="npc-realm-badge realm-${npc.realm}">${REALMS[npc.realm].name}</div>
      </div>
      <div class="npc-info">
        <div class="npc-info-item">🎂 <span>${npc.age}t</span></div>
        <div class="npc-info-item">🏯 <span>${sect ? sect.name : "Độc Tu"}</span></div>
        <div class="npc-info-item">💰 <span>${Math.floor(npc.wealth)}</span></div>
        <div class="npc-info-item">📍 <span>${npc.region || npc.country || "—"}</span></div>
      </div>
      ${eqIcons ? `<div style="font-size:13px;margin-bottom:4px;opacity:0.8">装备: ${eqIcons}</div>` : ""}
      <div class="npc-bars">
        <div class="bar-row"><span class="bar-label">❤️</span><div class="bar-track"><div class="bar-fill hp" style="width:${hpPct}%"></div></div><span class="bar-val">${npc.hp}/${npc.maxHp}</span></div>
        <div class="bar-row"><span class="bar-label">💙</span><div class="bar-track"><div class="bar-fill mp" style="width:${mpPct}%"></div></div><span class="bar-val">${npc.mp}/${npc.maxMp}</span></div>
        <div class="bar-row"><span class="bar-label">✨</span><div class="bar-track"><div class="bar-fill exp" style="width:${expPct}%"></div></div><span class="bar-val">${Math.floor(expPct)}%</span></div>
      </div>
      ${npc.titles.length ? `<div class="npc-titles">${npc.titles.map(t=>`<span class="title-badge">${t}</span>`).join("")}</div>` : ""}
      <div class="npc-actions" onclick="event.stopPropagation()">
        <button class="btn-jade" onclick="bless(${npc.id})">⚡ Ban Phúc</button>
        <button class="btn-secondary small" onclick="tribulation(${npc.id})">🌩 Kiếp</button>
        <button class="btn-danger" onclick="removeNPC(${npc.id})">💀 Xóa</button>
      </div>
    </div>`;
  }).join("");
}

// ============================
// RENDER: NPC MODAL
// ============================

function openNPCModal(id) {
  const npc = npcById(id);
  if (!npc) return;
  currentModal = id;
  const sect     = sectById(npc.sectId);
  const spouse   = npc.spouseId ? npcById(npc.spouseId) : null;
  const master   = npc.masterId ? npcById(npc.masterId) : null;
  const children = npc.childrenIds.map(cid => npcById(cid)).filter(Boolean);

  const eqSlots = ["weapon","armor","artifact"];
  const equipHTML = eqSlots.map(slot => {
    const item = npc.equipment?.[slot];
    if (!item) return `<div class="inv-item" style="opacity:0.3"><div class="inv-item-icon">❓</div><div class="inv-item-name">Trống (${slot})</div></div>`;
    return `<div class="inv-item">
      <div class="inv-item-icon">${item.icon}</div>
      <div class="inv-item-name">${item.name}</div>
      <div class="inv-item-type">${item.type}</div>
      <div class="inv-item-rarity rarity-${item.rarity}">${{common:"Phổ Thông",uncommon:"Bất Phàm",rare:"Quý Hiếm",epic:"Sử Thi",legendary:"Huyền Thoại"}[item.rarity]||item.rarity}</div>
      ${item.atkBonus ? `<div style="font-size:10px;color:#f87171">⚔️+${item.atkBonus}</div>` : ""}
      ${item.defBonus ? `<div style="font-size:10px;color:#60a5fa">🛡+${item.defBonus}</div>` : ""}
      ${item.hpBonus  ? `<div style="font-size:10px;color:#4ade80">❤️+${item.hpBonus}</div>` : ""}
    </div>`;
  }).join("");

  const res = npc.resources || {};

  const html = `
    <div class="modal-header">
      <div class="modal-avatar">${npc.gender === "Nữ" ? "👸" : "🧙"}</div>
      <div>
        <div class="modal-npc-title">${npc.name}${npc.inSecretRealm ? " <span style='color:#c084fc;font-size:14px'>🌀 Trong Bí Cảnh</span>" : ""}</div>
        <div class="modal-npc-subtitle">${npc.personality} · ${npc.fate} · ${npc.goal}</div>
        <div style="margin-top:8px">${npc.titles.map(t=>`<span class="title-badge">${t}</span>`).join(" ")}</div>
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchTab('overview',this)">📋 Tổng Quan</button>
      <button class="modal-tab" onclick="switchTab('cultivation',this)">✨ Tu Luyện</button>
      <button class="modal-tab" onclick="switchTab('equipment',this)">⚔️ Trang Bị</button>
      <button class="modal-tab" onclick="switchTab('inventory',this)">🎒 Tàng Phẩm</button>
      <button class="modal-tab" onclick="switchTab('resources',this)">💎 Tài Nguyên</button>
      <button class="modal-tab" onclick="switchTab('relations',this)">👥 Quan Hệ</button>
      <button class="modal-tab" onclick="switchTab('history',this)">📜 Lịch Sử</button>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="tab-overview" class="modal-tab-content active">
      <div class="modal-grid">
        <div class="modal-stat"><div class="ms-label">CẢNH GIỚI</div><div class="ms-value realm-${npc.realm}">${REALMS[npc.realm].name}</div></div>
        <div class="modal-stat"><div class="ms-label">LINH CĂN</div><div class="ms-value">${npc.root}</div></div>
        <div class="modal-stat"><div class="ms-label">TUỔI</div><div class="ms-value">${npc.age}</div></div>
        <div class="modal-stat"><div class="ms-label">SINH LỰC</div><div class="ms-value">${npc.hp}/${npc.maxHp}</div></div>
        <div class="modal-stat"><div class="ms-label">CÔNG KÍCH</div><div class="ms-value">${npc.attack}</div></div>
        <div class="modal-stat"><div class="ms-label">PHÒNG THỦ</div><div class="ms-value">${npc.defense}</div></div>
        <div class="modal-stat"><div class="ms-label">DANH VỌNG</div><div class="ms-value">${Math.floor(npc.reputation)}</div></div>
        <div class="modal-stat"><div class="ms-label">TÀI PHÚ</div><div class="ms-value">${Math.floor(npc.wealth)}</div></div>
        <div class="modal-stat"><div class="ms-label">KHÍ VẬN</div><div class="ms-value">${npc.luck}</div></div>
        <div class="modal-stat"><div class="ms-label">NGHIỆP LỰC</div><div class="ms-value">${npc.karma}</div></div>
        <div class="modal-stat"><div class="ms-label">TÔNG MÔN</div><div class="ms-value" style="font-size:12px">${sect ? sect.name : "Độc Tu"}</div></div>
        <div class="modal-stat"><div class="ms-label">QUỐC GIA</div><div class="ms-value" style="font-size:12px">${npc.country}</div></div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">KỸ NĂNG</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${npc.skills.length ? npc.skills.map(s=>`<span class="title-badge" style="color:var(--blue);border-color:rgba(96,165,250,0.4);background:rgba(96,165,250,0.08)">${s}</span>`).join("") : '<span style="color:var(--white-dim);font-size:12px">Chưa học kỹ năng</span>'}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">THAO TÁC THIÊN ĐẠO</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-jade" onclick="bless(${npc.id});closeModalBtn()">⚡ Ban Phúc</button>
          <button class="btn-secondary small" onclick="tribulation(${npc.id});closeModalBtn()">🌩 Thiên Kiếp</button>
          <button class="btn-danger" onclick="removeNPC(${npc.id});closeModalBtn()">💀 Xóa Khỏi Thiên Địa</button>
        </div>
      </div>
    </div>

    <!-- CULTIVATION TAB -->
    <div id="tab-cultivation" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">TIẾN TRÌNH TU LUYỆN</div>
        ${REALMS.map((r,i) => {
          const done    = i < npc.realm;
          const current = i === npc.realm;
          const pct     = current ? Math.min(100, ((npc.realmProgress||0)/r.exp)*100) : (done ? 100 : 0);
          return `<div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
              <span style="color:${current ? realmColor(i) : done ? 'var(--jade)' : 'var(--white-dim)'}">${done?"✅":current?"▶":""} ${r.name}</span>
              <span style="color:var(--white-dim)">${current ? Math.floor(pct)+"%" : done ? "完成" : "未达"}</span>
            </div>
            <div class="bar-track" style="height:6px"><div class="bar-fill exp" style="width:${pct}%;background:${done?'var(--jade)':current?'var(--gold)':'transparent'}"></div></div>
          </div>`;
        }).join("")}
      </div>
      <div class="modal-section">
        <div class="modal-section-title">THỌ NGUYÊN</div>
        <div class="bar-row">
          <div class="bar-track" style="height:8px;flex:1">
            <div class="bar-fill" style="width:${Math.min(100,(npc.age/npc.lifespan)*100)}%;background:linear-gradient(90deg,#60a5fa,#a78bfa)"></div>
          </div>
          <span class="bar-val" style="width:80px">${npc.age} / ${npc.lifespan} năm</span>
        </div>
      </div>
    </div>

    <!-- EQUIPMENT TAB -->
    <div id="tab-equipment" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">⚔️ VŨ KHÍ · 🛡 GIÁP · 🪬 PHÁP BẢO</div>
        <div class="inventory-grid">${equipHTML}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">VẬT PHẨM CÓ THỂ TRANG BỊ (trong túi)</div>
        <div class="inventory-grid">
          ${npc.inventory.filter(i=>i.slot).map(item => `
            <div class="inv-item" onclick="equipItemModal(${npc.id},'${item.id}')" style="cursor:pointer;border-color:rgba(250,204,21,0.3)">
              <div class="inv-item-icon">${item.icon}</div>
              <div class="inv-item-name">${item.name}</div>
              <div class="inv-item-rarity rarity-${item.rarity}">${{common:"Phổ Thông",uncommon:"Bất Phàm",rare:"Quý Hiếm",epic:"Sử Thi",legendary:"Huyền Thoại"}[item.rarity]||item.rarity}</div>
              <div style="font-size:10px;color:var(--jade);margin-top:3px">👆 Trang Bị</div>
            </div>
          `).join("") || '<div style="color:var(--white-dim);font-size:12px;padding:10px">Không có trang bị trong túi</div>'}
        </div>
      </div>
    </div>

    <!-- INVENTORY TAB -->
    <div id="tab-inventory" class="modal-tab-content">
      <div class="inventory-grid">
        ${npc.inventory.filter(i=>!i.slot).length ? npc.inventory.filter(i=>!i.slot).map(item => `
          <div class="inv-item">
            <div class="inv-item-icon">${item.icon||"📦"}</div>
            <div class="inv-item-name">${item.name}</div>
            <div class="inv-item-type">${item.type}</div>
            <div class="inv-item-rarity rarity-${item.rarity}">${{common:"Phổ Thông",uncommon:"Bất Phàm",rare:"Quý Hiếm",epic:"Sử Thi",legendary:"Huyền Thoại"}[item.rarity]||item.rarity}</div>
            <div style="font-size:10px;color:var(--gold-dim);margin-top:3px">💰 ${item.value}</div>
          </div>
        `).join("") : '<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Tàng phẩm trống rỗng</div>'}
      </div>
    </div>

    <!-- RESOURCES TAB -->
    <div id="tab-resources" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">TÀI NGUYÊN CÁ NHÂN</div>
        <div class="modal-grid">
          ${Object.entries(RESOURCES).map(([key,info]) => `
            <div class="modal-stat">
              <div class="ms-label">${info.icon} ${info.name}</div>
              <div class="ms-value" style="color:${info.color}">${res[key]||0}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- RELATIONS TAB -->
    <div id="tab-relations" class="modal-tab-content">
      <div class="rel-list">
        ${spouse ? `<div class="rel-item"><span class="rel-type rel-spouse">Đạo Lữ</span><span>${spouse.name} [${REALMS[spouse.realm].name}]</span></div>` : ""}
        ${master ? `<div class="rel-item"><span class="rel-type rel-master">Sư Phụ</span><span>${master.name} [${REALMS[master.realm].name}]</span></div>` : ""}
        ${children.map(c=>`<div class="rel-item"><span class="rel-type rel-child">Con Cái</span><span>${c.name} [${REALMS[c.realm].name}] — ${c.age}t</span></div>`).join("")}
        ${npc.discipleIds.map(did => { const d = npcById(did); return d ? `<div class="rel-item"><span class="rel-type rel-disciple">Đệ Tử</span><span>${d.name} [${REALMS[d.realm].name}]</span></div>` : ""; }).join("")}
        ${!spouse && !master && !children.length && !npc.discipleIds.length ? `<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có quan hệ nào</div>` : ""}
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div id="tab-history" class="modal-tab-content">
      <div class="history-list">
        ${npc.biography.slice().reverse().map(e => `
          <div class="history-item">
            <div class="history-year">Năm ${e.year}</div>
            <div class="history-event">${e.event}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  openModal(html);
}

function equipItemModal(npcId, itemId) {
  const npc = npcById(npcId);
  if (!npc) return;
  equipItem(npc, itemId);
  addLog(`⚔️ ${npc.name} trang bị [${npc.inventory.find(i=>i.id===itemId)?.name || "vật phẩm"}]`);
  openNPCModal(npcId); // refresh modal
  save();
}

function switchTab(name, el) {
  document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".modal-tab-content").forEach(c => c.classList.remove("active"));
  document.getElementById(`tab-${name}`)?.classList.add("active");
  if (el) el.classList.add("active");
}

// ============================
// RENDER: SECTS
// ============================

function renderSects() {
  const el = document.getElementById("sectList");
  if (!el) return;
  const sorted = [...sects].sort((a,b) => b.prestige - a.prestige);
  el.innerHTML = sorted.map((s,i) => {
    const leader    = s.leader ? npcById(s.leader) : null;
    const members   = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
    const topRealm  = members.length ? Math.max(...members.map(n=>n.realm)) : 0;
    const rankIcon  = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
    return `<div class="sect-card">
      <div class="sect-name">🏯 ${rankIcon} ${s.name} <span style="font-size:11px;color:var(--jade)">Lv.${s.level||1}</span></div>
      <div class="sect-info">📍 Vị trí: <span>${s.territory}</span></div>
      <div class="sect-info">👑 Tông Chủ: <span>${leader ? leader.name+" ["+REALMS[leader.realm].name+"]" : "Chưa có"}</span></div>
      <div class="sect-info">👥 Thành Viên: <span>${members.length}</span></div>
      <div class="sect-info">🌟 Đỉnh cảnh: <span>${members.length ? REALMS[topRealm].name : "—"}</span></div>
      <div class="sect-info">⭐ Uy Danh: <span style="color:var(--gold)">${Math.floor(s.prestige)}</span></div>
      <div class="sect-info">💰 Kho Báu: <span>${Math.floor(s.treasury)}</span></div>
      <div class="sect-info">⚔️ Chiến Lạnh: <span>${s.warCooldown > 0 ? s.warCooldown+" năm" : "Sẵn Sàng"}</span></div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="btn-secondary small" onclick="openSectModal('${s.id}')" style="font-size:11px">🔍 Chi Tiết</button>
        <button class="btn-secondary small" onclick="triggerSectWar('${s.id}',null);renderSects()" style="font-size:11px">⚔️ Tuyên Chiến</button>
      </div>
    </div>`;
  }).join("");
}

// ============================
// SECT DETAIL MODAL
// ============================

function openSectModal(id) {
  const s = sectById(id);
  if (!s) return;

  const founder  = s.founder ? npcById(s.founder) : null;
  const leader   = s.leader  ? npcById(s.leader)  : null;
  const elders   = (s.elders   || []).map(eid => npcById(eid)).filter(n => n && n.status === "alive");
  const members  = (s.members  || []).map(mid => npcById(mid)).filter(n => n && n.status === "alive");
  const disciples= (s.disciples|| []).map(did => npcById(did)).filter(n => n && n.status === "alive");
  const topRealm = members.length ? Math.max(...members.map(n=>n.realm)) : 0;
  const res      = s.resources || {};

  // Economy data (from economyEngine V1, if present)
  const econCity = (typeof engCities !== "undefined")
    ? engCities.find(c => c.countryId === s.id) : null;

  // World memory / sect history (if present)
  let memory = null;
  if (typeof window.worldMemoryData !== "undefined" && window.worldMemoryData?.sectMemory) {
    memory = window.worldMemoryData.sectMemory[s.id];
  }

  // Sect-related world history entries
  const sectHistory = (typeof worldHistory !== "undefined")
    ? worldHistory.filter(h => h.sectName === s.name || (h.event && h.event.includes(s.name))).slice(-15).reverse()
    : [];

  const memberRow = (n, roleLabel, roleColor) => `
    <div class="rel-item" style="cursor:pointer" onclick="closeModalBtn();setTimeout(()=>openNPCModal('${n.id}'),50)">
      <span class="rel-type" style="background:${roleColor}1a;color:${roleColor};border-color:${roleColor}55">${roleLabel}</span>
      <span>${n.name} [${REALMS[n.realm].name}] · ⭐${Math.floor(n.reputation||0)} · 💰${Math.floor(n.wealth||0)}</span>
    </div>`;

  const html = `
    <div class="modal-header">
      <div class="modal-avatar">🏯</div>
      <div>
        <div class="modal-npc-title">${s.name} <span style="font-size:13px;color:var(--jade)">Lv.${s.level||1}</span></div>
        <div class="modal-npc-subtitle">📍 ${s.territory} · ⭐ Uy Danh ${Math.floor(s.prestige||0)}</div>
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchTab('sect-overview',this)">📋 Tổng Quan</button>
      <button class="modal-tab" onclick="switchTab('sect-members',this)">👥 Thành Viên</button>
      <button class="modal-tab" onclick="switchTab('sect-resources',this)">💎 Tài Nguyên</button>
      <button class="modal-tab" onclick="switchTab('sect-history',this)">📜 Lịch Sử</button>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="tab-sect-overview" class="modal-tab-content active">
      <div class="modal-grid">
        <div class="modal-stat"><div class="ms-label">CẤP ĐỘ</div><div class="ms-value">Lv.${s.level||1}</div></div>
        <div class="modal-stat"><div class="ms-label">UY DANH</div><div class="ms-value" style="color:var(--gold)">${Math.floor(s.prestige||0)}</div></div>
        <div class="modal-stat"><div class="ms-label">KHO BÁU</div><div class="ms-value">${Math.floor(s.treasury||0)} 💎</div></div>
        <div class="modal-stat"><div class="ms-label">VỊ TRÍ</div><div class="ms-value" style="font-size:13px">${s.territory}</div></div>
        <div class="modal-stat"><div class="ms-label">CHIẾN LẠNH</div><div class="ms-value" style="font-size:13px">${s.warCooldown > 0 ? s.warCooldown+" năm" : "Sẵn Sàng"}</div></div>
        <div class="modal-stat"><div class="ms-label">ĐỈNH CẢNH</div><div class="ms-value" style="font-size:13px">${members.length ? REALMS[topRealm].name : "—"}</div></div>
        <div class="modal-stat"><div class="ms-label">TỔNG THÀNH VIÊN</div><div class="ms-value">${members.length}</div></div>
        <div class="modal-stat"><div class="ms-label">ĐỆ TỬ</div><div class="ms-value">${disciples.length}</div></div>
      </div>

      <div class="rel-list" style="margin-top:12px">
        ${founder ? memberRow(founder, "Khai Tông", "#c084fc") : `<div class="rel-item"><span class="rel-type" style="color:var(--white-dim)">Khai Tông</span><span>Chưa rõ</span></div>`}
        ${leader  ? memberRow(leader, "Tông Chủ", "#facc15") : `<div class="rel-item"><span class="rel-type" style="color:var(--white-dim)">Tông Chủ</span><span>Chưa có</span></div>`}
      </div>

      ${econCity ? `
        <div class="econ-section" style="margin-top:12px">
          <div class="econ-section-title">💰 Kinh Tế (Economy Engine)</div>
          <div class="modal-grid">
            <div class="modal-stat"><div class="ms-label">TÀI PHÚ THÀNH</div><div class="ms-value" style="color:#facc15">${Math.floor(econCity.wealth||0)}</div></div>
            <div class="modal-stat"><div class="ms-label">SẢN XUẤT</div><div class="ms-value" style="color:#60a5fa">${Math.floor(econCity.production||0)}</div></div>
            <div class="modal-stat"><div class="ms-label">THƯƠNG LỰC</div><div class="ms-value" style="color:#fb923c">${Math.floor(econCity.tradePower||0)}</div></div>
            <div class="modal-stat"><div class="ms-label">DÂN SỐ</div><div class="ms-value" style="color:#94a3b8">${Math.floor(econCity.population||0)}</div></div>
          </div>
        </div>` : ""}
    </div>

    <!-- MEMBERS TAB -->
    <div id="tab-sect-members" class="modal-tab-content">
      <div class="rel-list">
        ${elders.length ? elders.map(n => memberRow(n, "Trưởng Lão", "#fb923c")).join("") : ""}
        ${members.length ? members
            .filter(n => !(s.elders||[]).includes(n.id) && n.id !== s.leader && n.id !== s.founder)
            .sort((a,b) => b.realm - a.realm)
            .map(n => memberRow(n, "Thành Viên", "#60a5fa")).join("") : ""}
        ${disciples.length ? disciples.map(n => memberRow(n, "Đệ Tử", "#4ade80")).join("") : ""}
        ${!members.length && !disciples.length ? `<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có thành viên nào</div>` : ""}
      </div>
    </div>

    <!-- RESOURCES TAB -->
    <div id="tab-sect-resources" class="modal-tab-content">
      <div class="modal-grid">
        ${Object.entries(RESOURCES).map(([key, info]) => `
          <div class="modal-stat">
            <div class="ms-label">${info.icon} ${info.name}</div>
            <div class="ms-value" style="color:${info.color}">${Math.floor(res[key]||0)}</div>
          </div>
        `).join("")}
        <div class="modal-stat"><div class="ms-label">🏗️ KHO BÁU TỔNG</div><div class="ms-value" style="color:var(--gold)">${Math.floor(s.treasury||0)}</div></div>
        <div class="modal-stat"><div class="ms-label">📦 RUỘNG TÀI NGUYÊN</div><div class="ms-value">${s.resourceFields||0}</div></div>
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div id="tab-sect-history" class="modal-tab-content">
      <div class="history-list">
        ${memory?.founder ? `<div class="history-item"><div class="history-year">📜</div><div class="history-event">Khai tông bởi ${memory.founder}</div></div>` : ""}
        ${(memory?.heroes||[]).map(h => `<div class="history-item"><div class="history-year">🌟</div><div class="history-event">${h.name || h} — Anh Hùng Tông Môn</div></div>`).join("")}
        ${(memory?.traitors||[]).map(t => `<div class="history-item"><div class="history-year">⚠️</div><div class="history-event">${t.name || t} — Phản Đồ</div></div>`).join("")}
        ${sectHistory.map(h => `
          <div class="history-item">
            <div class="history-year">Năm ${h.year}</div>
            <div class="history-event">${h.event}</div>
          </div>
        `).join("")}
        ${!sectHistory.length && !memory?.founder && !(memory?.heroes||[]).length && !(memory?.traitors||[]).length
          ? `<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có lịch sử ghi nhận</div>` : ""}
      </div>
    </div>
  `;

  openModal(html);
}



// ============================
// RENDER: CIVILIZATION SYSTEM
// ============================

function getCivLevelData(level) {
  return CIV_LEVEL_THRESHOLDS[Math.min((level||1)-1, CIV_LEVEL_THRESHOLDS.length-1)];
}

function renderCivBar(val, max, color, icon) {
  const pct = Math.min(100, Math.round((val / Math.max(max, 1)) * 100));
  return `<div style="margin-bottom:7px">
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;color:var(--white-dim)">
      <span>${icon}</span><span style="color:${color};font-weight:700">${typeof val==='number'&&val>999?val.toLocaleString():val}</span>
    </div>
    <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.4s ease"></div>
    </div>
  </div>`;
}

function renderCountries() {
  const el = document.getElementById("countryList");
  if (!el) return;

  // Compute rankings
  const byEconomy  = [...countries].sort((a,b) => (b.economy||0) - (a.economy||0));
  const byMilitary = [...countries].sort((a,b) => (b.military||0) - (a.military||0));
  const byPop      = [...countries].sort((a,b) => (b.population||0) - (a.population||0));
  const byTech     = [...countries].sort((a,b) => (b.technology||0) - (a.technology||0));

  const richestId   = byEconomy[0]?.id;
  const strongestId = byMilitary[0]?.id;
  const biggestId   = byPop[0]?.id;
  const techLeadId  = byTech[0]?.id;

  const maxEco = byEconomy[0]?.economy  || 1;
  const maxMil = byMilitary[0]?.military || 1;
  const maxPop = byPop[0]?.population    || 1;

  el.innerHTML = `
    <!-- CIV RANKINGS BANNER -->
    <div class="civ-rankings-banner">
      <div class="civ-rank-card rich">
        <div class="crk-icon">💰</div>
        <div class="crk-body">
          <div class="crk-label">GIÀU NHẤT</div>
          <div class="crk-name">${byEconomy[0]?.name || "—"}</div>
          <div class="crk-val">${(byEconomy[0]?.economy||0).toLocaleString()}</div>
        </div>
      </div>
      <div class="civ-rank-card strong">
        <div class="crk-icon">⚔️</div>
        <div class="crk-body">
          <div class="crk-label">MẠNH NHẤT</div>
          <div class="crk-name">${byMilitary[0]?.name || "—"}</div>
          <div class="crk-val">${(byMilitary[0]?.military||0).toLocaleString()}</div>
        </div>
      </div>
      <div class="civ-rank-card pop">
        <div class="crk-icon">👥</div>
        <div class="crk-body">
          <div class="crk-label">ĐÔNG DÂN NHẤT</div>
          <div class="crk-name">${byPop[0]?.name || "—"}</div>
          <div class="crk-val">${((byPop[0]?.population||0)/1000).toFixed(0)}K dân</div>
        </div>
      </div>
      <div class="civ-rank-card tech">
        <div class="crk-icon">⚙️</div>
        <div class="crk-body">
          <div class="crk-label">CÔNG NGHỆ CAO</div>
          <div class="crk-name">${byTech[0]?.name || "—"}</div>
          <div class="crk-val">Tech Lv.${byTech[0]?.technology || 1}</div>
        </div>
      </div>
    </div>

    <!-- COUNTRY CARDS GRID -->
    <div class="civ-grid">
      ${countries.map(c => {
        const lvlData  = getCivLevelData(c.level || 1);
        const nextLvl  = CIV_LEVEL_THRESHOLDS[c.level] || null;
        const liveNPCs = npcs.filter(n => n.country === c.name && n.status === "alive");
        const topNPC   = liveNPCs.sort((a,b) => b.realm - a.realm)[0];
        const isRichest  = c.id === richestId;
        const isStrongest= c.id === strongestId;
        const isBiggest  = c.id === biggestId;
        const isTechLead = c.id === techLeadId;

        const badges = [
          isRichest   ? `<span class="civ-badge gold">💰 Giàu Nhất</span>` : "",
          isStrongest ? `<span class="civ-badge red">⚔️ Mạnh Nhất</span>` : "",
          isBiggest   ? `<span class="civ-badge blue">👥 Đông Nhất</span>` : "",
          isTechLead  ? `<span class="civ-badge purple">⚙️ Tech Lead</span>` : "",
        ].filter(Boolean).join("");

        // Level progress to next
        let nextProgress = 100;
        if (nextLvl) {
          const req = nextLvl.req;
          const fields = ["population","economy","military","technology","culture"];
          const vals = fields.map(f => {
            const cur = f==="technology"?(c.technology||1):f==="culture"?(c.culture||1):(c[f]||0);
            return Math.min(1, cur / Math.max(req[f], 1));
          });
          nextProgress = Math.round(vals.reduce((a,b)=>a+b,0) / fields.length * 100);
        }

        // Tech & culture stars
        const techStars  = "★".repeat(Math.min(c.technology||1, 10)) + "☆".repeat(Math.max(0, 10-(c.technology||1)));
        const cultStars  = "★".repeat(Math.min(c.culture||1, 10))   + "☆".repeat(Math.max(0, 10-(c.culture||1)));

        const recentHistory = (c.civHistory||[]).slice(-3).reverse();

        return `<div class="civ-card${isRichest||isStrongest?" civ-card--highlight":""}">
          <!-- Header -->
          <div class="civ-card-header">
            <div>
              <div class="civ-card-name">${lvlData.icon} ${c.name}</div>
              <div class="civ-level-badge">Cấp ${c.level||1} — ${lvlData.name}</div>
              ${badges ? `<div class="civ-badges">${badges}</div>` : ""}
            </div>
            <div class="civ-level-circle">${c.level||1}</div>
          </div>

          <!-- Card Body -->
          <div class="civ-card-body">

            <!-- Stats Grid -->
            <div class="civ-stats-grid">
              <div class="civ-stat-box">
                <div class="csb-icon">👥</div>
                <div class="csb-val">${((c.population||0)/1000).toFixed(0)}K</div>
                <div class="csb-label">Dân Số</div>
              </div>
              <div class="civ-stat-box">
                <div class="csb-icon">💰</div>
                <div class="csb-val">${((c.economy||0)/1000).toFixed(1)}K</div>
                <div class="csb-label">Kinh Tế</div>
              </div>
              <div class="civ-stat-box">
                <div class="csb-icon">⚔️</div>
                <div class="csb-val">${((c.military||0)/1000).toFixed(0)}K</div>
                <div class="csb-label">Quân Sự</div>
              </div>
              <div class="civ-stat-box">
                <div class="csb-icon">🧙</div>
                <div class="csb-val">${liveNPCs.length}</div>
                <div class="csb-label">Tu Sĩ</div>
              </div>
            </div>

            <!-- Progress Bars -->
            <div class="civ-bars">
              ${renderCivBar(c.population||0, maxPop, "#60a5fa", "👥 Dân Số")}
              ${renderCivBar(c.economy||0,    maxEco, "#facc15", "💰 Kinh Tế")}
              ${renderCivBar(c.military||0,   maxMil, "#f87171", "⚔️ Quân Sự")}
            </div>

            <!-- Tech & Culture -->
            <div class="civ-soft-stats">
              <div class="css-box">
                <span class="css-label">⚙️ Công Nghệ Lv.${c.technology||1}</span>
                <div class="css-row">
                  <span class="css-stars" style="color:#fb923c">${techStars.slice(0,10)}</span>
                </div>
              </div>
              <div class="css-box">
                <span class="css-label">🎭 Văn Hóa Lv.${c.culture||1}</span>
                <div class="css-row">
                  <span class="css-stars" style="color:#c084fc">${cultStars.slice(0,10)}</span>
                </div>
              </div>
            </div>

            <!-- Top NPC -->
            <div class="civ-emperor">
              <span class="ce-label">👑 Hoàng Đế:</span>
              <span class="ce-name">${topNPC ? topNPC.name+" ["+REALMS[topNPC.realm].name+"]" : "Chưa có"}</span>
            </div>

            <!-- Level Up Progress -->
            ${nextLvl ? `
            <div class="civ-nextlevel">
              <div class="cnl-label">
                <span>Tiến đến: ${CIV_LEVEL_THRESHOLDS[c.level]?.icon||""} ${CIV_LEVEL_THRESHOLDS[c.level]?.name||""}</span>
                <span class="cnl-pct">${nextProgress}%</span>
              </div>
              <div class="cnl-bar"><div class="cnl-fill" style="width:${nextProgress}%"></div></div>
            </div>` : `<div class="civ-nextlevel"><div class="cnl-label" style="color:var(--gold)">✦ ĐÃ ĐẠT ĐỈNH PHONG!</div></div>`}

            <!-- Recent Events -->
            ${recentHistory.length ? `
            <div class="civ-history">
              ${recentHistory.map(h => `<div class="ch-item"><span class="ch-year">Năm ${h.year}</span><span class="ch-event">${h.event}</span></div>`).join("")}
            </div>` : ""}

          </div><!-- /civ-card-body -->

          <!-- Territory Footer -->
          <div class="civ-territory">📍 ${c.territory}</div>
          <div style="padding:8px 14px 12px;display:flex;gap:6px">
            <button class="btn-secondary small" onclick="openCountryModal('${c.id}')" style="font-size:11px">🔍 Chi Tiết</button>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

// ============================
// COUNTRY DETAIL MODAL
// ============================

function openCountryModal(id) {
  const c = countries.find(x => x.id === id);
  if (!c) return;

  const lvlData  = getCivLevelData(c.level || 1);
  const liveNPCs = npcs.filter(n => n.country === c.name && n.status === "alive");
  const topNPCs  = [...liveNPCs].sort((a,b) => (b.realm - a.realm) || ((b.wealth||0)-(a.wealth||0))).slice(0, 8);
  const fullHistory = (c.civHistory || []).slice().reverse();

  // Economy Engine V1 data
  const ecCities = (typeof engCities !== "undefined") ? engCities.filter(ci => ci.countryId === c.id) : [];
  const totalCityWealth = ecCities.reduce((s,ci) => s + (ci.wealth||0), 0);

  // Trade wars / embargoes (Economy Engine V2)
  const outgoingTW = (typeof ev2TradeWars !== "undefined") ? ev2TradeWars.filter(tw => tw.fromCountryId === c.id) : [];
  const incomingTW = (typeof ev2TradeWars !== "undefined") ? ev2TradeWars.filter(tw => tw.toCountryId === c.id) : [];
  const bank = (typeof ev2Banks !== "undefined") ? ev2Banks.find(b => b.countryId === c.id) : null;

  const memberRow = (n) => `
    <div class="rel-item" style="cursor:pointer" onclick="closeModalBtn();setTimeout(()=>openNPCModal('${n.id}'),50)">
      <span class="rel-type" style="background:#60a5fa1a;color:#60a5fa;border-color:#60a5fa55">${REALMS[n.realm].name}</span>
      <span>${n.name} · ⭐${Math.floor(n.reputation||0)} · 💰${Math.floor(n.wealth||0)}</span>
    </div>`;

  const twTypeLabel = { embargo:"🚫 Cấm Vận", sanction:"⚖️ Trừng Phạt", blockade:"🛑 Phong Tỏa" };

  const html = `
    <div class="modal-header">
      <div class="modal-avatar">${lvlData.icon}</div>
      <div>
        <div class="modal-npc-title">${c.name} <span style="font-size:13px;color:var(--jade)">Cấp ${c.level||1} — ${lvlData.name}</span></div>
        <div class="modal-npc-subtitle">📍 ${c.territory}${c.currencyName ? ` · 🪙 ${c.currencyName}` : ""}${c.bankrupt ? ` · <span style="color:#f87171">💀 PHÁ SẢN</span>` : ""}</div>
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchTab('country-overview',this)">📋 Tổng Quan</button>
      <button class="modal-tab" onclick="switchTab('country-economy',this)">💰 Kinh Tế</button>
      <button class="modal-tab" onclick="switchTab('country-people',this)">👥 Nhân Vật</button>
      <button class="modal-tab" onclick="switchTab('country-history',this)">📜 Lịch Sử</button>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="tab-country-overview" class="modal-tab-content active">
      <div class="modal-grid">
        <div class="modal-stat"><div class="ms-label">DÂN SỐ</div><div class="ms-value" style="color:#60a5fa">${(c.population||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">KINH TẾ</div><div class="ms-value" style="color:#facc15">${(c.economy||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">QUÂN SỰ</div><div class="ms-value" style="color:#f87171">${(c.military||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">CÔNG NGHỆ</div><div class="ms-value">Lv.${c.technology||1}</div></div>
        <div class="modal-stat"><div class="ms-label">VĂN HÓA</div><div class="ms-value">Lv.${c.culture||1}</div></div>
        <div class="modal-stat"><div class="ms-label">QUÂN ĐỘI</div><div class="ms-value">${(c.army||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">LÃNH THỔ</div><div class="ms-value" style="font-size:13px">${c.territory}</div></div>
        <div class="modal-stat"><div class="ms-label">TU SĨ TRONG QUỐC</div><div class="ms-value">${liveNPCs.length}</div></div>
      </div>
    </div>

    <!-- ECONOMY TAB -->
    <div id="tab-country-economy" class="modal-tab-content">
      <div class="modal-grid">
        <div class="modal-stat"><div class="ms-label">💰 KHO BẠC</div><div class="ms-value" style="color:#facc15">${Math.floor(c.treasury||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">📊 THUẾ</div><div class="ms-value">${c.taxRate ?? "—"}%</div></div>
        <div class="modal-stat"><div class="ms-label">📈 THU NHẬP/NĂM</div><div class="ms-value" style="color:#4ade80">${Math.floor(c.annualIncome||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">📉 CHI PHÍ/NĂM</div><div class="ms-value" style="color:#f87171">${Math.floor(c.annualExpenses||0).toLocaleString()}</div></div>
        <div class="modal-stat"><div class="ms-label">⚠️ BẤT ỔN</div><div class="ms-value" style="color:${(c.unrest||0)>50?'#f87171':'#4ade80'}">${Math.floor(c.unrest||0)}%</div></div>
        <div class="modal-stat"><div class="ms-label">🌟 PHỒN THỊNH</div><div class="ms-value">${Math.floor(c.prosperity||50)}</div></div>
        <div class="modal-stat"><div class="ms-label">🪙 TIỀN TỆ</div><div class="ms-value" style="font-size:13px">${c.currencyName||"—"}</div></div>
        <div class="modal-stat"><div class="ms-label">🏙️ TỔNG TÀI PHÚ THÀNH</div><div class="ms-value" style="color:#facc15">${Math.floor(totalCityWealth).toLocaleString()}</div></div>
      </div>

      ${ecCities.length ? `
        <div class="econ-section" style="margin-top:12px">
          <div class="econ-section-title">🏙️ Thành Phố (${ecCities.length})</div>
          <div class="econ-table-wrap">
            <table class="econ-table">
              <thead><tr><th>Thành Phố</th><th>💰 Tài Phú</th><th>📦 Sản Xuất</th><th>🛤️ Thương Lực</th><th>👥 Dân Số</th></tr></thead>
              <tbody>
                ${ecCities.map(ci => `<tr>
                  <td style="font-weight:600">${ci.name}</td>
                  <td style="color:#facc15">${Math.floor(ci.wealth||0).toLocaleString()}</td>
                  <td style="color:#60a5fa">${Math.floor(ci.production||0).toLocaleString()}</td>
                  <td style="color:#fb923c">${Math.floor(ci.tradePower||0)}</td>
                  <td style="color:#94a3b8">${(ci.population||0).toLocaleString()}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>` : ""}

      ${bank ? `
        <div class="econ-section" style="margin-top:12px">
          <div class="econ-section-title">🏦 ${bank.name}</div>
          <div class="modal-grid">
            <div class="modal-stat"><div class="ms-label">📥 TIỀN GỬI</div><div class="ms-value" style="color:#4ade80">${Math.floor(bank.deposits||0).toLocaleString()}</div></div>
            <div class="modal-stat"><div class="ms-label">📤 TIỀN VAY</div><div class="ms-value" style="color:#f87171">${Math.floor(bank.loans||0).toLocaleString()}</div></div>
            <div class="modal-stat"><div class="ms-label">🏛️ QUỸ NGÂN HÀNG</div><div class="ms-value" style="color:#facc15">${Math.floor(bank.treasury||0).toLocaleString()}</div></div>
          </div>
        </div>` : ""}

      ${(outgoingTW.length || incomingTW.length) ? `
        <div class="econ-section" style="margin-top:12px">
          <div class="econ-section-title">⚔️ Chiến Tranh Thương Mại</div>
          ${outgoingTW.map(tw => `<div class="history-item"><div class="history-year">→</div><div class="history-event">${c.name} ${twTypeLabel[tw.type]||tw.type} đối với ${tw.toName} (còn ${tw.ticksLeft} năm)</div></div>`).join("")}
          ${incomingTW.map(tw => `<div class="history-item"><div class="history-year">←</div><div class="history-event" style="color:#f87171">${tw.fromName} ${twTypeLabel[tw.type]||tw.type} đối với ${c.name} (còn ${tw.ticksLeft} năm)</div></div>`).join("")}
        </div>` : ""}
    </div>

    <!-- PEOPLE TAB -->
    <div id="tab-country-people" class="modal-tab-content">
      <div class="rel-list">
        ${topNPCs.length ? topNPCs.map(memberRow).join("") : `<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có tu sĩ nào</div>`}
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div id="tab-country-history" class="modal-tab-content">
      <div class="history-list">
        ${fullHistory.length ? fullHistory.map(h => `
          <div class="history-item">
            <div class="history-year">Năm ${h.year}</div>
            <div class="history-event">${h.event}</div>
          </div>
        `).join("") : `<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có lịch sử ghi nhận</div>`}
      </div>
    </div>
  `;

  openModal(html);
}



function renderEmpirePanel() {
  const el = document.getElementById("empireList");
  if (!el) return;

  const empires = (window.countries || []).filter(c => (c.level || 1) >= 4);
  if (!empires.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--white-dim)">
      <div style="font-size:40px;margin-bottom:12px">🗼</div>
      <div style="font-size:16px;margin-bottom:6px">Chưa có Đế Quốc nào xuất hiện</div>
      <div style="font-size:13px;opacity:.5">Khi Quốc Gia đạt cấp 4, Đế Quốc sẽ trỗi dậy thống trị thiên hạ</div>
    </div>`;
    return;
  }

  const byMilitary = [...empires].sort((a,b) => (b.military||0)-(a.military||0));

  el.innerHTML = `
    <div style="padding:12px 0 8px;font-size:13px;color:var(--white-dim);font-weight:500;letter-spacing:.05em;text-transform:uppercase">
      🗼 ${empires.length} Đế Quốc đang tồn tại — Thiên hạ rung chuyển
    </div>
    <div class="civ-grid">
    ${empires.map(c => {
      const liveNPCs = (window.npcs||[]).filter(n => n.country === c.name && n.status === "alive");
      const topNPC   = liveNPCs.sort((a,b) => b.realm - a.realm)[0];
      const isStrongest = c.id === byMilitary[0]?.id;
      return `<div class="civ-card empire-card" style="border-color:rgba(250,204,21,0.35);background:rgba(250,204,21,0.04)">
        <div class="civ-card-header">
          <div>
            <div class="civ-name" style="color:#facc15">${c.name}</div>
            <div class="civ-level-badge" style="background:rgba(250,204,21,0.15);color:#facc15;border-color:rgba(250,204,21,0.3)">
              🗼 Đế Quốc — Cấp ${c.level}
            </div>
            ${isStrongest ? `<span class="civ-badge red">⚔️ Hùng Mạnh Nhất</span>` : ""}
          </div>
          <div class="civ-level-circle" style="background:rgba(250,204,21,0.15);border-color:rgba(250,204,21,0.4);color:#facc15">${c.level}</div>
        </div>
        <div class="civ-stats-grid">
          <div class="civ-stat-item"><span class="civ-stat-icon">👥</span><span>${((c.population||0)/1000).toFixed(0)}K dân</span></div>
          <div class="civ-stat-item"><span class="civ-stat-icon">💰</span><span>${(c.economy||0).toLocaleString()}</span></div>
          <div class="civ-stat-item"><span class="civ-stat-icon">⚔️</span><span>${(c.military||0).toLocaleString()}</span></div>
          <div class="civ-stat-item"><span class="civ-stat-icon">⚙️</span><span>Tech ${c.technology||1}</span></div>
        </div>
        ${topNPC ? `<div class="civ-ruler-row"><span class="civ-ruler-label">👑 Hoàng Đế:</span><span class="civ-ruler-name">${topNPC.name}</span><span class="civ-ruler-realm" style="color:${realmColor(topNPC.realm)}">${REALMS[topNPC.realm]?.name||"?"}</span></div>` : ""}
        <div class="civ-bar-row">
          <div class="civ-bar-label">Kinh Tế</div>
          <div class="civ-bar-track"><div class="civ-bar-fill eco" style="width:${Math.min(100,((c.economy||0)/80000)*100).toFixed(0)}%"></div></div>
        </div>
        <div class="civ-bar-row">
          <div class="civ-bar-label">Quân Sự</div>
          <div class="civ-bar-track"><div class="civ-bar-fill mil" style="width:${Math.min(100,((c.military||0)/160000)*100).toFixed(0)}%"></div></div>
        </div>
        ${c.isEmpire ? `<div style="margin-top:8px;font-size:11px;color:rgba(250,204,21,0.5)">✦ Đế Quốc chính thức — thống trị thiên hạ</div>` : ""}
      </div>`;
    }).join("")}
    </div>
  `;
}
window.renderEmpirePanel = renderEmpirePanel;

// RENDER: BOSS
// ============================

function renderBoss() {
  const el = document.getElementById("bossList");
  if (!el) return;
  if (!bosses.length) {
    el.innerHTML = `<div style="color:var(--white-dim);padding:40px;text-align:center;font-family:var(--font-heading);font-size:16px">
      🐉 Hiện không có Boss nào<br>
      <small style="font-size:13px;opacity:0.6">Dùng Thiên Đạo Điểm để triệu hồi Boss</small>
    </div>`;
    return;
  }
  el.innerHTML = bosses.map((boss, i) => {
    const hpPct = (boss.hp / boss.maxHp) * 100;
    return `<div class="boss-card">
      <div class="boss-card-name">${boss.name}</div>
      <div class="sect-info" style="color:rgba(255,180,180,0.7)">⚔️ Cảnh Giới: <span style="color:#ff8080">${REALMS[boss.realm]?.name || "Vô Đỉnh"}</span></div>
      <div class="boss-hp-bar"><div class="boss-hp-fill" style="width:${hpPct}%"></div></div>
      <div class="boss-hp-text">❤️ ${boss.hp.toLocaleString()} / ${boss.maxHp.toLocaleString()}</div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        ${boss.skills.map(s => `<span class="title-badge" style="color:#ff8080;border-color:rgba(255,100,100,0.4);background:rgba(255,68,68,0.08)">${s}</span>`).join("")}
      </div>
    </div>`;
  }).join("");
}

// ============================
// RENDER: LEADERBOARD
// ============================

function renderLeaderboard() {
  const el = document.getElementById("leaderboard");
  if (el) {
    const top = [...npcs].filter(n => n.status === "alive").sort((a,b) => b.realm - a.realm || b.reputation - a.reputation).slice(0, 15);
    el.innerHTML = top.map((npc, i) => `
      <div class="rank-item" onclick="openNPCModal(${npc.id})">
        <div class="rank-num ${i<3 ? "top3" : ""}">${["🥇","🥈","🥉"][i] || "#"+(i+1)}</div>
        <div class="rank-info">
          <div class="rank-name">${npc.name}</div>
          <div class="rank-sub">${npc.root} · ${npc.killCount} chiến thắng · ⭐${Math.floor(npc.reputation)}</div>
        </div>
        <div class="rank-realm realm-${npc.realm}">${REALMS[npc.realm].name}</div>
      </div>`).join("") || `<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có dữ liệu</div>`;
  }

  const geniusEl = document.getElementById("geniusBoard");
  if (geniusEl) {
    const geniuses = npcs.filter(n => n.isTianJiao && n.status === "alive").sort((a,b) => b.realm - a.realm).slice(0, 10);
    geniusEl.innerHTML = geniuses.map((npc,i) => `
      <div class="rank-item" onclick="openNPCModal(${npc.id})">
        <div class="rank-num ${i<3 ? "top3" : ""}">#${i+1}</div>
        <div class="rank-info">
          <div class="rank-name">${npc.name}</div>
          <div class="rank-sub">${npc.root} · Khí Vận ${npc.luck}</div>
        </div>
        <div class="rank-realm realm-${npc.realm}">${REALMS[npc.realm].name}</div>
      </div>`).join("") || `<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có thiên kiêu</div>`;
  }

  const hofEl = document.getElementById("hallOfFame");
  if (hofEl) {
    hofEl.innerHTML = hallOfFame.slice(0, 10).map((npc, i) => `
      <div class="rank-item" style="opacity:0.75" ${npc.realm >= 5 ? `onclick="resurrectNPC(${npc.id})"` : ""}>
        <div class="rank-num">#${i+1}</div>
        <div class="rank-info">
          <div class="rank-name">${npc.name}</div>
          <div class="rank-sub">${npc.deathReason || "Lịch sử"} · Năm ${npc.deathYear || "?"}</div>
        </div>
        <div class="rank-realm realm-${npc.realm}">${REALMS[npc.realm]?.name || "?"}</div>
      </div>`).join("") || `<div style="color:var(--white-dim);padding:20px;text-align:center">Không có anh hùng nào ngã xuống</div>`;
  }
}

// ============================
// RENDER: LOGS
// ============================

function renderLogs() {
  const el = document.getElementById("logs");
  if (!el) return;
  el.innerHTML = logs.slice(0, 150).map(log => `
    <div class="log-item ${log.type === "important" ? "important" : log.type === "death" ? "death" : log.type === "breakthrough" ? "breakthrough" : ""}">
      <span class="log-year">Năm ${log.year}</span>
      <span class="log-text">${log.text}</span>
    </div>`).join("") || `<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có ghi chép nào</div>`;
}

// ============================
// RENDER: YEAR
// ============================

function renderYear() {
  const el = document.getElementById("yearDisplay");
  if (el) el.textContent = `Năm ${year}`;
}

function renderHeavenPoints() {
  const el = document.getElementById("heavenPoints");
  if (el) el.textContent = heavenPoints;
}

// ============================
// RENDER: DASHBOARD
// ============================

function renderDashboard() {
  renderWorldStats();
  renderTopPowerRanking();
  renderFactionRanking();
  renderRegionRanking();
  renderEventTimeline();
  // Dynasty widget
  if (typeof injectDynastyDashboard === "function") {
    try { injectDynastyDashboard(); } catch(e) {}
  }
}

function renderWorldStats() {
  const el = document.getElementById("dashWorldStats");
  if (!el) return;

  const alive = npcs.filter(n => n.status === "alive");
  const era   = getCurrentEra();
  const totalResources = { lingshi:0, lingyao:0, xuantie:0, jingshi:0 };
  alive.forEach(n => {
    if (!n.resources) return;
    Object.keys(totalResources).forEach(k => totalResources[k] += (n.resources[k]||0));
  });

  const realmDist = REALMS.map((r,i) => alive.filter(n=>n.realm===i).length);
  const maxCount  = Math.max(...realmDist, 1);

  el.innerHTML = `
    <div class="dash-section">
      <div class="dash-title">🌐 Thông Tin Thế Giới</div>
      <div class="dash-grid-4">
        <div class="dash-stat"><div class="ds-icon">🌍</div><div class="ds-val">${world ? world.name : "—"}</div><div class="ds-label">Thế Giới</div></div>
        <div class="dash-stat"><div class="ds-icon">⏳</div><div class="ds-val">${year}</div><div class="ds-label">Năm Hiện Tại</div></div>
        <div class="dash-stat"><div class="ds-icon">🌐</div><div class="ds-val">${era.name}</div><div class="ds-label">Kỷ Nguyên</div></div>
        <div class="dash-stat"><div class="ds-icon">⚡</div><div class="ds-val">${era.buff}</div><div class="ds-label">Thiên Đạo Buff</div></div>
        <div class="dash-stat"><div class="ds-icon">👥</div><div class="ds-val">${alive.length}</div><div class="ds-label">Tu Sĩ Sống</div></div>
        <div class="dash-stat"><div class="ds-icon">☠️</div><div class="ds-val">${hallOfFame.length}</div><div class="ds-label">Đã Tử Vong</div></div>
        <div class="dash-stat"><div class="ds-icon">🏯</div><div class="ds-val">${sects.length}</div><div class="ds-label">Tông Môn</div></div>
        <div class="dash-stat"><div class="ds-icon">🌀</div><div class="ds-val">${secretRealms.length}</div><div class="ds-label">Bí Cảnh Khai</div></div>
      </div>
    </div>
    <div class="dash-section">
      <div class="dash-title">💎 Tài Nguyên Thế Giới</div>
      <div class="dash-grid-4">
        ${Object.entries(RESOURCES).map(([key,info]) => {
          const regionTotal = regions.reduce((s,r) => s + (r.resources[key]||0), 0);
          return `<div class="dash-stat"><div class="ds-icon">${info.icon}</div><div class="ds-val" style="color:${info.color}">${Math.floor(regionTotal)}</div><div class="ds-label">${info.name} (Vùng)</div></div>`;
        }).join("")}
        ${Object.entries(RESOURCES).map(([key,info]) => `
          <div class="dash-stat"><div class="ds-icon">${info.icon}</div><div class="ds-val" style="color:${info.color}">${Math.floor(totalResources[key])}</div><div class="ds-label">${info.name} (Tu Sĩ)</div></div>
        `).join("")}
      </div>
    </div>
    <div class="dash-section">
      <div class="dash-title">📊 Phân Bổ Cảnh Giới</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${REALMS.map((r,i) => {
          const count = realmDist[i];
          const pct   = Math.round(count/Math.max(alive.length,1)*100);
          const bar   = Math.round(count/maxCount*100);
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:90px;font-size:12px;color:${realmColor(i)}">${r.name}</div>
            <div class="bar-track" style="flex:1;height:14px"><div class="bar-fill" style="width:${bar}%;background:${realmColor(i)};opacity:0.8"></div></div>
            <div style="width:50px;text-align:right;font-size:12px;color:var(--white-dim)">${count} (${pct}%)</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${renderPopulationAnalytics()}
  `;
}

// ============================
// PHÂN TÍCH DÂN SỐ V6
// ============================
function renderPopulationAnalytics() {
  const alive    = npcs.filter(n => n.status === "alive").length;
  const dead     = popStats.deaths || 0;
  const births   = popStats.births || 0;
  const netGrowth = births - dead;
  const netColor  = netGrowth >= 0 ? "#4ade80" : "#f87171";
  const trend     = popStats.history.length >= 2
    ? popStats.history[popStats.history.length-1].pop - popStats.history[popStats.history.length-2].pop
    : 0;
  const trendIcon = trend > 0 ? "📈" : (trend < 0 ? "📉" : "➡️");
  const trendColor = trend > 0 ? "#4ade80" : (trend < 0 ? "#f87171" : "#94a3b8");

  // Marriages và children
  const married    = npcs.filter(n => n.status === "alive" && n.married).length;
  const hasChildren = npcs.filter(n => n.status === "alive" && (n.childrenIds||[]).length > 0).length;
  const maxGen     = npcs.reduce((m,n) => Math.max(m, n.generation||1), 1);

  // Lịch sử dân số (sparkline text)
  const histPoints = popStats.history.slice(-20);
  const histMax    = Math.max(...histPoints.map(h=>h.pop), alive, 1);
  const sparkBars  = histPoints.map(h => {
    const pct = Math.round(h.pop / histMax * 8);
    const bars = ["▁","▂","▃","▄","▅","▆","▇","█"];
    return `<span style="color:${h.pop > (histPoints[0]?.pop||1) ? '#4ade80' : '#60a5fa'}">${bars[Math.min(pct,7)]}</span>`;
  }).join("");

  // Trạng thái ổn định
  const isExtinct    = world && world._extinct;
  const extinctYear  = world && world._extinctYear ? world._extinctYear : null;
  const stabilityStatus = isExtinct
    ? `<span style="color:#f87171;font-weight:bold">💀 TUYỆT CHỦNG (Năm ${extinctYear}) — Thiên Đình có thể cứu rỗi</span>`
    : alive === 0   ? `<span style="color:#f87171;font-weight:bold">💀 KHÔNG CÒN SINH LINH</span>`
    : alive < 10    ? `<span style="color:#f87171;font-weight:bold">🚨 CẬN TỬ — ${alive} người còn lại!</span>`
    : alive < 30    ? `<span style="color:#f87171;font-weight:bold">⚠️ NGUY HIỂM — Nguy cơ tuyệt chủng</span>`
    : alive < 100   ? `<span style="color:#fbbf24">📊 THẤP — Đang tăng trưởng</span>`
    : alive < 300   ? `<span style="color:#4ade80">✅ ỔN ĐỊNH</span>`
    :                 `<span style="color:#a78bfa">🌟 THỊNH VƯỢNG</span>`;

  return `
    <div class="dash-section" style="border:1px solid #334155;border-radius:8px;padding:12px;background:rgba(15,23,42,0.5)">
      <div class="dash-title">👥 Phân Tích Dân Số</div>
      <div class="dash-grid-4" style="margin-bottom:12px">
        <div class="dash-stat"><div class="ds-icon">🟢</div><div class="ds-val" style="color:#4ade80">${alive}</div><div class="ds-label">Đang Sống</div></div>
        <div class="dash-stat"><div class="ds-icon">🌟</div><div class="ds-val" style="color:#fbbf24">${popStats.peakPop}</div><div class="ds-label">Đỉnh Dân Số (Năm ${popStats.peakYear})</div></div>
        <div class="dash-stat"><div class="ds-icon">👶</div><div class="ds-val" style="color:#4ade80">${births}</div><div class="ds-label">Tổng Số Sinh</div></div>
        <div class="dash-stat"><div class="ds-icon">☠️</div><div class="ds-val" style="color:#f87171">${dead}</div><div class="ds-label">Tổng Số Tử</div></div>
        <div class="dash-stat"><div class="ds-icon">${trendIcon}</div><div class="ds-val" style="color:${trendColor}">${trend > 0 ? '+' : ''}${trend}</div><div class="ds-label">Xu Hướng (10 năm)</div></div>
        <div class="dash-stat"><div class="ds-icon">💑</div><div class="ds-val">${married}</div><div class="ds-label">Đã Kết Đạo Lữ</div></div>
        <div class="dash-stat"><div class="ds-icon">👨‍👩‍👧</div><div class="ds-val">${hasChildren}</div><div class="ds-label">Có Con Cái</div></div>
        <div class="dash-stat"><div class="ds-icon">🧬</div><div class="ds-val">${maxGen}</div><div class="ds-label">Thế Hệ Tối Đa</div></div>
      </div>
      <div style="margin-bottom:8px;font-size:12px;color:var(--white-dim)">
        <span>Trạng thái: </span>${stabilityStatus}
      </div>
      ${alive < 30 ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button onclick="heavenRescue(10)" style="padding:5px 12px;background:#1e3a5f;border:1px solid #3b82f6;border-radius:6px;color:#93c5fd;font-size:12px;cursor:pointer">🌟 Cứu Rỗi 10 người (300đ)</button>
        <button onclick="heavenRescue(20)" style="padding:5px 12px;background:#1e3a5f;border:1px solid #3b82f6;border-radius:6px;color:#93c5fd;font-size:12px;cursor:pointer">🌟 Cứu Rỗi 20 người (600đ)</button>
        <button onclick="heavenRescue(50)" style="padding:5px 12px;background:#1e3a5f;border:1px solid #3b82f6;border-radius:6px;color:#93c5fd;font-size:12px;cursor:pointer">🌟 Cứu Rỗi 50 người (1500đ)</button>
      </div>` : ""}
      ${histPoints.length > 0 ? `
      <div style="margin-top:8px">
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">📈 Lịch Sử Dân Số (${histPoints.length * 10} năm gần nhất)</div>
        <div style="font-size:18px;letter-spacing:2px;font-family:monospace">${sparkBars}</div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim)">
          <span>Năm ${histPoints[0]?.year||1}</span><span>Năm ${histPoints[histPoints.length-1]?.year||year}</span>
        </div>
      </div>` : '<div style="font-size:12px;color:var(--white-dim)">📊 Dữ liệu sẽ hiển thị sau 10 năm đầu tiên...</div>'}
    </div>
  `;
}

function renderTopPowerRanking() {
  const el = document.getElementById("dashTopPower");
  if (!el) return;
  const top = [...npcs].filter(n => n.status === "alive")
    .sort((a,b) => b.realm*10000 + b.attack + b.defense - (a.realm*10000 + a.attack + a.defense))
    .slice(0, 10);

  el.innerHTML = `
    <div class="dash-section">
      <div class="dash-title">⚡ Top 10 Cường Giả</div>
      ${top.map((npc,i) => {
        const sect = sectById(npc.sectId);
        const power = npc.realm*10000 + npc.attack + npc.defense;
        const eqIcons = [npc.equipment?.weapon, npc.equipment?.armor, npc.equipment?.artifact].filter(Boolean).map(e=>e.icon).join("");
        return `<div class="rank-item dash-rank" onclick="openNPCModal(${npc.id})" style="background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:6px;padding:10px 12px">
          <div class="rank-num ${i<3?"top3":""}">${["🥇","🥈","🥉"][i]||"#"+(i+1)}</div>
          <div class="rank-info" style="flex:1">
            <div class="rank-name" style="font-size:14px">${npc.name} ${npc.isTianJiao?"☆":""}</div>
            <div class="rank-sub">${npc.root} · ${sect?sect.name:"Độc Tu"} · 装备${eqIcons||"—"}</div>
          </div>
          <div style="text-align:right">
            <div class="rank-realm realm-${npc.realm}" style="margin-bottom:4px">${REALMS[npc.realm].name}</div>
            <div style="font-size:11px;color:var(--gold-dim)">⚡${power.toLocaleString()}</div>
          </div>
        </div>`;
      }).join("") || '<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có dữ liệu</div>'}
    </div>
  `;
}

function renderFactionRanking() {
  const el = document.getElementById("dashFactionRank");
  if (!el) return;
  const sorted = [...sects].sort((a,b) => b.prestige - a.prestige);

  el.innerHTML = `
    <div class="dash-section">
      <div class="dash-title">🏯 Bảng Xếp Hạng Tông Môn</div>
      ${sorted.map((s,i) => {
        const leader  = s.leader ? npcById(s.leader) : null;
        const members = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
        const topRealm = members.length ? Math.max(...members.map(n=>n.realm)) : 0;
        const totalPower = members.reduce((sum,n) => sum + n.realm*100 + n.attack, 0);
        return `<div class="rank-item" style="background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:6px;padding:10px 12px">
          <div class="rank-num ${i<3?"top3":""}">${["🥇","🥈","🥉"][i]||"#"+(i+1)}</div>
          <div class="rank-info" style="flex:1">
            <div class="rank-name" style="font-size:14px">${s.name} <span style="color:var(--jade);font-size:12px">Lv.${s.level||1}</span></div>
            <div class="rank-sub">👑 ${leader?leader.name:"—"} · 👥 ${members.length} · 🗺️ ${s.territory}</div>
          </div>
          <div style="text-align:right">
            <div style="color:var(--gold);font-size:13px;margin-bottom:2px">⭐${Math.floor(s.prestige)}</div>
            <div style="color:var(--jade);font-size:11px">💰${Math.floor(s.treasury)}</div>
            <div style="color:#c084fc;font-size:11px">⚡${totalPower.toLocaleString()}</div>
          </div>
        </div>`;
      }).join("") || '<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có tông môn</div>'}
    </div>
  `;
}

function renderRegionRanking() {
  const el = document.getElementById("dashRegionRank");
  if (!el) return;
  const sorted = [...regions].map(region => {
    const regionNPCs = npcs.filter(n => n.status === "alive" && n.region === region.name);
    const topNPC     = regionNPCs.sort((a,b) => b.realm - a.realm)[0];
    const totalPower = regionNPCs.reduce((s,n) => s+n.realm*100+n.attack, 0);
    const totalRes   = Object.values(region.resources).reduce((s,v) => s+v, 0);
    return { ...region, npcCount: regionNPCs.length, topNPC, totalPower, totalRes };
  }).sort((a,b) => b.totalPower - a.totalPower);

  el.innerHTML = `
    <div class="dash-section">
      <div class="dash-title">🗺️ Bảng Xếp Hạng Vùng</div>
      ${sorted.map((r,i) => `
        <div class="rank-item" style="background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:6px;padding:10px 12px">
          <div class="rank-num ${i<3?"top3":""}">${["🥇","🥈","🥉"][i]||"#"+(i+1)}</div>
          <div class="rank-info" style="flex:1">
            <div class="rank-name" style="font-size:14px">${r.name}</div>
            <div class="rank-sub">👥 ${r.npcCount} tu sĩ · 👑 ${r.topNPC?r.topNPC.name+"["+REALMS[r.topNPC.realm].name+"]":"—"}</div>
            <div style="font-size:11px;color:var(--white-dim);margin-top:2px">
              💎${Math.floor(r.resources.lingshi)} 🌿${Math.floor(r.resources.lingyao)} ⚙️${Math.floor(r.resources.xuantie)} 🔮${Math.floor(r.resources.jingshi)}
            </div>
          </div>
          <div style="text-align:right">
            <div style="color:#f472b6;font-size:12px">⚠️Nguy ${r.danger}/10</div>
            <div style="color:#c084fc;font-size:11px">⚡${r.totalPower.toLocaleString()}</div>
          </div>
        </div>`
      ).join("")}
    </div>
  `;
}

function renderEventTimeline() {
  const el = document.getElementById("dashTimeline");
  if (!el) return;

  const typeColors = { important:"#facc15", death:"#f87171", normal:"#94a3b8" };
  el.innerHTML = `
    <div class="dash-section">
      <div class="dash-title">📅 Thiên Đạo Niên Biểu</div>
      <div style="position:relative;padding-left:20px">
        <div style="position:absolute;left:7px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--gold),rgba(250,204,21,0.1))"></div>
        ${eventTimeline.slice(0, 25).map(evt => `
          <div style="position:relative;margin-bottom:12px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid ${typeColors[evt.type]||'#94a3b8'}">
            <div style="position:absolute;left:-28px;top:50%;transform:translateY(-50%);width:14px;height:14px;background:${typeColors[evt.type]||'#94a3b8'};border-radius:50%;border:2px solid var(--bg-primary);display:flex;align-items:center;justify-content:center;font-size:9px">${evt.icon||"📌"}</div>
            <div style="font-size:11px;color:var(--gold-dim);margin-bottom:3px">Năm ${evt.year}</div>
            <div style="font-size:13px;color:var(--white-main)">${evt.text}</div>
          </div>
        `).join("") || '<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có sự kiện nào</div>'}
      </div>
    </div>
  `;
}

// ============================
// RENDER: ALL
// ============================

function renderAll() {
  renderWorldInfo();
  renderRegions();
  renderNPCs();
  renderSects();
  renderCountries();
  renderBoss();
  renderLeaderboard();
  renderLogs();
  renderYear();
  renderHeavenPoints();
  // Dashboard renders on demand or if active
  const dashPanel = document.getElementById("panel-dashboard");
  if (dashPanel && dashPanel.classList.contains("active")) renderDashboard();
  // Sect Wars panel update if active
  const swPanel = document.getElementById("panel-sectwars");
  if (swPanel && swPanel.classList.contains("active")) renderSectWars();
  // Territory panel update if active
  const terrPanel = document.getElementById("panel-territories");
  if (terrPanel && terrPanel.classList.contains("active")) {
    if (typeof renderTerritories === "function") renderTerritories();
  }
  // Economy panel update if active
  const econPanel = document.getElementById("panel-economy");
  if (econPanel && econPanel.classList.contains("active")) {
    if (typeof renderEconomyPanel === "function") renderEconomyPanel();
  }
  // Secret Realms panel update if active
  const srPanel = document.getElementById("panel-secret-realms");
  if (srPanel && srPanel.classList.contains("active")) renderSecretRealmsPanel();
  // Thiên Đình panel update if active
  const tdPanel = document.getElementById("panel-thiendinh");
  if (tdPanel && tdPanel.classList.contains("active")) {
    if (typeof renderThiendinhPanel === "function") { try { renderThiendinhPanel(); } catch(e) {} }
  }
  // Dungeon panel update if active
  const dgPanel = document.getElementById("panel-dungeon");
  if (dgPanel && dgPanel.classList.contains("active")) {
    if (typeof renderDungeonPanel === "function") { try { renderDungeonPanel(); } catch(e) {} }
  }
  // Quest panel update if active
  const qPanel = document.getElementById("panel-quest");
  if (qPanel && qPanel.classList.contains("active")) {
    if (typeof renderQuestPanel === "function") { try { renderQuestPanel(); } catch(e) {} }
  }
  // Age Engine panel update if active
  const agePanel = document.getElementById("panel-age");
  if (agePanel && agePanel.classList.contains("active")) {
    if (typeof renderAgePanel === "function") { try { renderAgePanel(); } catch(e) {} }
  }
}

// ============================
// MODAL SYSTEM
// ============================

function openModal(html) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");
  content.innerHTML = html;
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(event) {
  if (event.target.id === "modalOverlay") closeModalBtn();
}

function closeModalBtn() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
  currentModal = null;
}

// ============================
// PARTICLE SYSTEM
// ============================

function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({length: 60}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vy: -(0.2 + Math.random() * 0.5),
    vx: (Math.random() - 0.5) * 0.3,
    radius: 0.5 + Math.random() * 1.5,
    opacity: 0.1 + Math.random() * 0.5,
    color: Math.random() > 0.5 ? "#f8d060" : "#4af0a0",
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  };
  animate();
}

// ============================
// HEAVEN MODE PANEL
// ============================

function renderHeavenModePanel() {
  const el = document.getElementById("heavenModePanel");
  if (!el) return;
  const actions = [
    { key:"bless_all",      icon:"🌟", name:"Ban Phúc Đại Chúng",  cost:200,  desc:"30% tu sĩ thăng cảnh"         },
    { key:"heavenly_calamity",icon:"⚡",name:"Thiên Kiếp Giáng Thế",cost:150,  desc:"25% tu sĩ nhận sát thương nặng"},
    { key:"summon_boss",    icon:"🐉", name:"Triệu Hồi Boss",       cost:300,  desc:"Boss mạnh giáng thế"           },
    { key:"open_secret_realm",icon:"🌀",name:"Mở Bí Cảnh",          cost:250,  desc:"Bí cảnh khai mở ngẫu nhiên"   },
    { key:"create_tianjiao",icon:"⭐", name:"Tạo Thiên Kiêu",       cost:180,  desc:"Tạo một thiên tài xuất thế"   },
    { key:"sect_war",       icon:"⚔️", name:"Tông Môn Chiến",       cost:100,  desc:"Kích hoạt tông môn chiến"     },
  ];
  el.innerHTML = actions.map(a => `
    <div class="heaven-action" onclick="useHeavenPoint('${a.key}',${a.cost})" title="${a.desc}">
      <div class="ha-icon">${a.icon}</div>
      <div class="ha-name">${a.name}</div>
      <div class="ha-cost">⚡ ${a.cost}</div>
      <div class="ha-desc">${a.desc}</div>
    </div>
  `).join("");
}

// ============================
// INIT
// ============================
function init() {
  load();

  // ---- MULTI-WORLD: load worlds list & currentWorldId ----
  if (typeof loadWorlds === "function") {
    loadWorlds();

    // Migrate old single-world saves FIRST (wraps legacy data into worlds array)
    if (typeof migrateLegacySave === "function") {
      migrateLegacySave();
    }

    // If worlds exist, restore the active one
    if (typeof worlds !== "undefined" && worlds.length > 0) {
      // Find the active world
      const activeSnap = currentWorldId
        ? worlds.find(w => w.id === currentWorldId)
        : worlds[0];

      if (activeSnap && typeof restoreWorldSnapshot === "function") {
        restoreWorldSnapshot(activeSnap);
      }
    }

    // If still no currentWorldId but we have a world in memory, assign one now
    if (!currentWorldId && world && typeof newWorldId === "function") {
      currentWorldId = newWorldId();
      if (typeof saveWorlds === "function") saveWorlds();
    }
  }

  migrateDynastyFields();
  dynastyTick();
  initParticles();
  renderAll();
  renderHeavenModePanel();
  if (world) startSim();
  // Đảm bảo sidebar ẩn đúng sau khi load xong
  if (typeof emergentCivilizationInit === 'function') emergentCivilizationInit();
  setTimeout(function() { if (typeof ecRenderDynamicSidebar === 'function') ecRenderDynamicSidebar(); }, 300);
}

document.addEventListener("DOMContentLoaded", init);

// ============================
// FACTION WAR SYSTEM — V6
// Full data model, simulation logic, rendering
// ============================

/* ---- DATA STRUCTURES ----
  Each sect gets:    name, founder, members, territory, resources, prestige, armyPower
  Each warLog entry: { id, year, attackerId, attackerName, defenderId, defenderName,
                        winnerId, winnerName, loserId, loserName,
                        attackerPower, defenderPower,
                        resourcesGained, prestigeGained, territoryCaptured,
                        casualties, log[] }
*/

// --- Migrate existing sects to add war fields ---
function ensureSectWarFields() {
  sects.forEach(s => {
    if (s.resources     === undefined) s.resources   = { lingshi: randInt(200,1000), lingyao: randInt(50,300), xuantie: randInt(30,200), jingshi: randInt(10,80) };
    if (s.armyPower     === undefined) s.armyPower   = randInt(100,500);
    if (s.warCooldown   === undefined) s.warCooldown = 0;
    if (s.totalWars     === undefined) s.totalWars   = 0;
    if (s.totalWins     === undefined) s.totalWins   = 0;
    if (s.totalLosses   === undefined) s.totalLosses = 0;
  });
}

// --- Compute composite battle power for a sect ---
function computeSectBattlePower(sect) {
  const liveMembers = sect.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
  const memberPower = liveMembers.length * 10;
  const realmPower  = liveMembers.reduce((sum, n) => sum + n.realm * 50 + n.attack, 0);
  return (sect.armyPower || 0) + memberPower + realmPower + (sect.prestige || 0);
}

// --- Per-tick resource & prestige income for all sects ---
function sectResourceTick() {
  ensureSectWarFields();
  sects.forEach(s => {
    const liveMembers = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
    const memberCount = liveMembers.length;
    const lvl = s.level || 1;

    // Resource gain
    s.resources.lingshi  = (s.resources.lingshi  || 0) + randInt(5, 15) * lvl + memberCount * 2;
    s.resources.lingyao  = (s.resources.lingyao  || 0) + randInt(2, 8)  * lvl;
    s.resources.xuantie  = (s.resources.xuantie  || 0) + randInt(1, 5)  * lvl;
    s.resources.jingshi  = (s.resources.jingshi  || 0) + randInt(0, 3)  * lvl;

    // Prestige gain
    s.prestige           = (s.prestige || 0) + randInt(1, 5) + Math.floor(memberCount * 0.5);

    // Army power grows slowly
    s.armyPower          = (s.armyPower || 100) + randInt(2, 8) * lvl;
  });
}

// --- Core battle function, called by triggerSectWar & simulateWorld ---
function executeSectBattle(sect1, sect2) {
  ensureSectWarFields();

  const power1 = computeSectBattlePower(sect1);
  const power2 = computeSectBattlePower(sect2);

  // Add randomness for upsets
  const roll1 = power1 * (0.8 + Math.random() * 0.4);
  const roll2 = power2 * (0.8 + Math.random() * 0.4);

  const winner = roll1 >= roll2 ? sect1 : sect2;
  const loser  = roll1 >= roll2 ? sect2 : sect1;

  // Casualties from loser side
  const loserMembers = loser.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
  let casualties = 0;
  loserMembers.forEach(npc => {
    if (chance(0.2)) {
      killNPC(npc, `tử trận trong Tông Môn Đại Chiến (${sect1.name} vs ${sect2.name})`);
      casualties++;
    } else {
      npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.25));
    }
  });

  // Small winner casualties too
  const winnerMembers = winner.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
  winnerMembers.forEach(npc => { if (chance(0.06)) { killNPC(npc, `tử trận trong Tông Môn Đại Chiến`); casualties++; } });

  // Resource transfer: winner takes 30% of loser's resources
  const resourcesGained = {};
  Object.keys(loser.resources).forEach(k => {
    const taken = Math.floor((loser.resources[k] || 0) * 0.3);
    resourcesGained[k]      = taken;
    winner.resources[k]     = (winner.resources[k] || 0) + taken;
    loser.resources[k]      = Math.max(0, (loser.resources[k] || 0) - taken);
  });

  // Prestige transfer
  const prestigeGained = randInt(80, 300);
  winner.prestige  = (winner.prestige || 0) + prestigeGained;
  loser.prestige   = Math.max(10, (loser.prestige || 0) - Math.floor(prestigeGained * 0.6));

  // Army power hit on loser
  loser.armyPower  = Math.max(20, (loser.armyPower || 100) - randInt(30, 80));
  winner.armyPower = (winner.armyPower || 100) + randInt(10, 30);

  // Territory — chance to capture a region
  let territoryCaptured = null;
  if (chance(0.25)) {
    const oldTerritory = loser.territory;
    loser.territory    = winner.territory;
    winner.territory   = winner.territory; // winner keeps theirs
    territoryCaptured  = oldTerritory;
    addLog(`🗺️ ${winner.name} chiếm lĩnh lãnh thổ [${oldTerritory}] của ${loser.name}!`, "important");
  }

  // Cooldowns
  sect1.warCooldown = randInt(8, 15);
  sect2.warCooldown = randInt(8, 15);

  // Stats tracking
  winner.totalWars  = (winner.totalWars  || 0) + 1;
  winner.totalWins  = (winner.totalWins  || 0) + 1;
  loser.totalWars   = (loser.totalWars   || 0) + 1;
  loser.totalLosses = (loser.totalLosses || 0) + 1;

  // Build war log entry
  const warEntry = {
    id:               `war_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    year,
    attackerId:       sect1.id,
    attackerName:     sect1.name,
    defenderId:       sect2.id,
    defenderName:     sect2.name,
    winnerId:         winner.id,
    winnerName:       winner.name,
    loserId:          loser.id,
    loserName:        loser.name,
    attackerPower:    Math.floor(power1),
    defenderPower:    Math.floor(power2),
    resourcesGained,
    prestigeGained,
    territoryCaptured,
    casualties,
  };
  sectWarLogs.unshift(warEntry);
  if (sectWarLogs.length > 100) sectWarLogs.pop();

  // Logs & Timeline
  addLog(`⚔️ ${sect1.name} tấn công ${sect2.name}`, "death");
  addLog(`🏆 ${winner.name} chiến thắng! Uy danh +${prestigeGained} · ${casualties} tử thương`, "important");
  addTimeline(`⚔️ ${winner.name} đại bại ${loser.name}`, "death", "⚔️");
  toast(`⚔️ ${sect1.name} vs ${sect2.name} — ${winner.name} chiến thắng!`);

  return warEntry;
}

// --- Override / extend existing triggerSectWar ---
// Replaces the original minimal implementation
function triggerSectWar(s1Id, s2Id) {
  ensureSectWarFields();
  const eligible = sects.filter(s => {
    const lm = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
    return lm.length >= 1 && (s.warCooldown || 0) <= 0;
  });
  if (eligible.length < 2) { toast("⚠️ Cần ít nhất 2 tông môn sẵn sàng chiến đấu!"); return; }

  const sect1 = s1Id ? sects.find(s => s.id === s1Id) : rand(eligible);
  const pool2 = eligible.filter(s => s.id !== sect1.id);
  const sect2 = s2Id ? sects.find(s => s.id === s2Id) : rand(pool2);
  if (!sect1 || !sect2) return;

  return executeSectBattle(sect1, sect2);
}

// --- Manual heaven-point triggered war ---
function manualTriggerSectWar() {
  triggerSectWar();
  renderSectWars();
  renderAll();
  save();
}

// --- Auto-war inside simulateWorld (called from sectEvents) ---
function autoSectWar() {
  ensureSectWarFields();
  const warChance = typeof ageWarChance === "function" ? ageWarChance(0.06) : 0.06;
  if (chance(warChance)) {
    triggerSectWar();
    if (typeof ageEngine_onWar === "function") ageEngine_onWar();
  }
}

// ============================
// RENDER: SECT WARS PANEL
// ============================

function renderSectWars() {
  if (!document.getElementById("panel-sectwars")) return;
  ensureSectWarFields();
  renderSectWarRanking();
  renderSectWarCurrent();
  renderSectWarHistory();
}

function renderSectWarRanking() {
  const el = document.getElementById("sectWarRanking");
  if (!el) return;

  const sorted = [...sects].sort((a, b) => {
    const pa = computeSectBattlePower(a);
    const pb = computeSectBattlePower(b);
    return pb - pa;
  });

  if (!sorted.length) { el.innerHTML = `<div style="color:var(--white-dim);padding:20px;text-align:center">Chưa có tông môn nào</div>`; return; }

  el.innerHTML = sorted.map((s, i) => {
    const lm       = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive");
    const power    = computeSectBattlePower(s);
    const wins     = s.totalWins   || 0;
    const losses   = s.totalLosses || 0;
    const rank     = ["🥇","🥈","🥉"][i] || `<span style="color:var(--white-dim)">#${i+1}</span>`;
    const winRate  = (wins + losses) > 0 ? Math.round(wins / (wins + losses) * 100) : 0;
    const coolText = (s.warCooldown || 0) > 0 ? `<span style="color:var(--red);font-size:10px">⏳ Hồi chiêu: ${s.warCooldown}</span>` : `<span style="color:var(--jade);font-size:10px">✅ Sẵn sàng</span>`;

    // Resource summary
    const res = s.resources || {};
    const resHTML = Object.entries(RESOURCES).map(([k,v]) =>
      `<span style="font-size:10px;color:var(--white-dim)">${v.icon} ${Math.floor(res[k]||0)}</span>`
    ).join(" ");

    return `<div class="sw-sect-card" style="
      background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;
      padding:12px;margin-bottom:10px;position:relative;overflow:hidden;
    ">
      <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:${i===0?'var(--gold)':i===1?'#94a3b8':i===2?'#cd7f32':'rgba(255,255,255,0.1)'}"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">${rank}</span>
          <div>
            <div style="font-family:var(--font-title);font-size:13px;color:${i===0?'var(--gold)':'var(--white-main)'}">${s.name}</div>
            <div style="font-size:10px;color:var(--white-dim)">${s.territory} · Cấp ${s.level||1}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:700;color:var(--gold)">${Math.floor(power).toLocaleString()}</div>
          <div style="font-size:10px;color:var(--white-dim)">Chiến lực</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
        <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:6px;padding:5px">
          <div style="font-size:12px;font-weight:700;color:var(--jade)">${lm.length}</div>
          <div style="font-size:9px;color:var(--white-dim)">Thành viên</div>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:6px;padding:5px">
          <div style="font-size:12px;font-weight:700;color:var(--gold)">${Math.floor(s.prestige||0)}</div>
          <div style="font-size:9px;color:var(--white-dim)">Uy danh</div>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:6px;padding:5px">
          <div style="font-size:12px;font-weight:700;color:var(--blue)">${wins}W/${losses}L</div>
          <div style="font-size:9px;color:var(--white-dim)">Chiến tích</div>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:6px;padding:5px">
          <div style="font-size:12px;font-weight:700;color:${winRate>=50?'var(--jade)':'var(--red)'}">${winRate}%</div>
          <div style="font-size:9px;color:var(--white-dim)">Tỷ lệ thắng</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">${resHTML}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${coolText}
        <button class="btn-danger" style="padding:3px 10px;font-size:10px" onclick="manualAttack('${s.id}')">⚔️ Tấn Công</button>
      </div>
    </div>`;
  }).join("");
}

function renderSectWarCurrent() {
  const el = document.getElementById("sectWarCurrent");
  if (!el) return;

  // Show sects currently on war cooldown (recently in battle)
  ensureSectWarFields();
  const atWar = sects.filter(s => (s.warCooldown || 0) > 0);

  if (!atWar.length) {
    el.innerHTML = `<div style="color:var(--white-dim);padding:20px;text-align:center;font-style:italic">☮️ Thiên hạ đang thái bình...</div>`;
    return;
  }

  el.innerHTML = atWar.map(s => {
    const recentWar = sectWarLogs.find(w => w.attackerId === s.id || w.defenderId === s.id);
    const isWinner  = recentWar && recentWar.winnerId === s.id;
    return `<div style="
      background:${isWinner ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)'};
      border:1px solid ${isWinner ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'};
      border-radius:8px;padding:10px;margin-bottom:8px;
    ">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span style="font-size:13px;color:var(--white-main)">${s.name}</span>
          <span style="font-size:11px;margin-left:8px;color:${isWinner?'var(--jade)':'var(--red)'}">${isWinner?'🏆 Chiến thắng':'💀 Thất bại'}</span>
        </div>
        <span style="font-size:11px;color:var(--orange)">⏳ ${s.warCooldown} tick</span>
      </div>
      ${recentWar ? `<div style="font-size:10px;color:var(--white-dim);margin-top:4px">
        vs ${recentWar.attackerId === s.id ? recentWar.defenderName : recentWar.attackerName} · Năm ${recentWar.year}
      </div>` : ""}
    </div>`;
  }).join("");
}

function renderSectWarHistory() {
  const el = document.getElementById("sectWarHistory");
  if (!el) return;

  if (!sectWarLogs.length) {
    el.innerHTML = `<div style="color:var(--white-dim);padding:30px;text-align:center;font-style:italic">📜 Chưa có trận chiến nào được ghi lại trong sử sách...</div>`;
    return;
  }

  el.innerHTML = `<div style="max-height:500px;overflow-y:auto">` + sectWarLogs.slice(0,50).map(w => {
    const resText = Object.entries(w.resourcesGained || {})
      .filter(([,v]) => v > 0)
      .map(([k,v]) => `${RESOURCES[k]?.icon||""}${Math.floor(v)}`)
      .join(" ");

    return `<div style="
      display:flex;align-items:flex-start;gap:12px;
      padding:10px 0;border-bottom:1px solid var(--border);
    ">
      <div style="flex-shrink:0;width:36px;height:36px;background:rgba(250,204,21,0.08);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">⚔️</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <div style="font-size:12px;color:var(--white-dim)">Năm ${w.year}</div>
          ${w.territoryCaptured ? `<span style="font-size:10px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.3);border-radius:4px;padding:1px 6px;color:var(--gold)">🗺️ Chiếm lãnh thổ</span>` : ""}
        </div>
        <div style="font-size:13px;color:var(--white-main);margin-bottom:4px">
          <span style="color:var(--red)">${w.attackerName}</span>
          <span style="color:var(--white-dim)"> tấn công </span>
          <span style="color:var(--blue)">${w.defenderName}</span>
        </div>
        <div style="font-size:12px;margin-bottom:4px">
          <span style="color:var(--jade);font-weight:700">🏆 ${w.winnerName}</span>
          <span style="color:var(--white-dim)"> chiến thắng</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:10px;color:var(--white-dim)">
          <span>⚔️ ${Math.floor(w.attackerPower)} vs ${Math.floor(w.defenderPower)}</span>
          <span>☠️ ${w.casualties} tử thương</span>
          <span>✨ +${w.prestigeGained} uy danh</span>
          ${resText ? `<span>💰 ${resText}</span>` : ""}
        </div>
      </div>
    </div>`;
  }).join("") + `</div>`;
}

// --- Allow manually picking a target ---
function manualAttack(attackerId) {
  ensureSectWarFields();
  const attacker = sects.find(s => s.id === attackerId);
  if (!attacker) return;
  if ((attacker.warCooldown || 0) > 0) { toast(`⚠️ ${attacker.name} đang trong thời gian hồi chiêu!`); return; }

  const targets = sects.filter(s => s.id !== attackerId && (s.warCooldown || 0) <= 0);
  if (!targets.length) { toast("⚠️ Không có tông môn nào để tấn công!"); return; }

  // Show target picker
  const optionsHTML = targets.map(t => {
    const power = computeSectBattlePower(t);
    return `<div onclick="executeManualAttack('${attackerId}','${t.id}')" style="
      cursor:pointer;padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;
      transition:all 0.2s;background:rgba(255,255,255,0.02);
    " onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(250,204,21,0.12)'">
      <div style="font-size:13px;color:var(--white-main)">${t.name}</div>
      <div style="font-size:11px;color:var(--white-dim)">${t.territory} · Chiến lực: ${Math.floor(power).toLocaleString()}</div>
    </div>`;
  }).join("");

  openModal(`
    <h2 style="font-family:var(--font-heading);color:var(--gold);margin-bottom:4px">⚔️ Chọn Mục Tiêu</h2>
    <div style="color:var(--white-dim);font-size:12px;margin-bottom:16px">${attacker.name} sẽ tấn công...</div>
    ${optionsHTML}
  `);
}

function executeManualAttack(attackerId, defenderId) {
  closeModalBtn();
  triggerSectWar(attackerId, defenderId);
  renderSectWars();
  renderAll();
  save();
}


// ============================================================
// SECRET REALM SYSTEM V2 — Full Rebuild
// ============================================================

/* ---- EXPANDED REALM POOL ----
   Structure per realm:
   { id, name, icon, level, rewardRarity, danger, minRealm,
     duration, capacity, discovered, discoveredYear,
     status: "active"|"closed",
     openYear, closeYear,
     participants: [{ npcId, entered, result, reward, injury }],
     explorationLog: [string]
   }
*/

const SECRET_REALM_TEMPLATES = [
  // Common
  { name:"Thâm Hải Bí Cảnh",      icon:"🌊", level:"common",    rewardRarity:"uncommon",  danger:0.06, minRealm:0, duration:3,  capacity:10, theme:"water"  },
  { name:"Lâm Hải Linh Cảnh",     icon:"🌿", level:"common",    rewardRarity:"uncommon",  danger:0.05, minRealm:0, duration:2,  capacity:12, theme:"wood"   },
  { name:"Hỏa Linh Bí Cảnh",      icon:"🔥", level:"uncommon",  rewardRarity:"rare",      danger:0.10, minRealm:1, duration:3,  capacity:8,  theme:"fire"   },
  { name:"Phong Vân Cổ Cảnh",     icon:"🌪️", level:"uncommon",  rewardRarity:"rare",      danger:0.12, minRealm:1, duration:4,  capacity:8,  theme:"wind"   },
  // Rare
  { name:"Huyền Thiên Bí Cảnh",   icon:"🌀", level:"rare",      rewardRarity:"rare",      danger:0.15, minRealm:2, duration:5,  capacity:6,  theme:"void"   },
  { name:"Kiếm Vực",              icon:"⚔️", level:"rare",      rewardRarity:"epic",      danger:0.18, minRealm:2, duration:5,  capacity:6,  theme:"sword"  },
  { name:"Băng Hồn Bí Cảnh",      icon:"❄️", level:"rare",      rewardRarity:"epic",      danger:0.20, minRealm:3, duration:7,  capacity:5,  theme:"ice"    },
  { name:"Lôi Ngục Bí Cảnh",      icon:"⚡", level:"rare",      rewardRarity:"epic",      danger:0.22, minRealm:3, duration:6,  capacity:5,  theme:"thunder"},
  // Epic
  { name:"Cổ Thần Bí Cảnh",       icon:"🏛️", level:"epic",      rewardRarity:"epic",      danger:0.25, minRealm:4, duration:8,  capacity:4,  theme:"ancient"},
  { name:"Long Mộ",               icon:"🐉", level:"epic",      rewardRarity:"legendary", danger:0.28, minRealm:4, duration:8,  capacity:4,  theme:"dragon" },
  { name:"Thần Ma Cổ Điện",       icon:"👁️", level:"epic",      rewardRarity:"legendary", danger:0.30, minRealm:5, duration:10, capacity:3,  theme:"demon"  },
  { name:"Thiên Ngoại Lôi Trì",   icon:"🌌", level:"epic",      rewardRarity:"legendary", danger:0.32, minRealm:5, duration:10, capacity:3,  theme:"cosmos" },
  // Legendary
  { name:"Hỗn Nguyên Thần Cung",  icon:"✨", level:"legendary", rewardRarity:"legendary", danger:0.35, minRealm:6, duration:12, capacity:2,  theme:"origin" },
  { name:"Thái Cổ Thần Tích",     icon:"🌟", level:"legendary", rewardRarity:"legendary", danger:0.40, minRealm:7, duration:15, capacity:2,  theme:"primal" },
  { name:"Thiên Đạo Thánh Địa",   icon:"☯️", level:"legendary", rewardRarity:"legendary", danger:0.20, minRealm:8, duration:20, capacity:1,  theme:"dao"    },
];

// Realm-themed reward names per theme
const REALM_REWARD_NAMES = {
  water:   ["Hải Vương Trân Châu","Vực Sâu Huyền Tinh","Thủy Linh Bảo Châu","Ngọc Hải Tiên"],
  wood:    ["Vạn Niên Linh Căn","Tiên Mộc Chi","Linh Thảo Thiên Phẩm","Mộc Linh Quả"],
  fire:    ["Hỏa Linh Thần Tinh","Tam Muội Chân Hỏa","Liệt Dương Hạch","Hỏa Phụng Tinh"],
  wind:    ["Phong Linh Dực","Tốc Phong Đan","Lôi Phong Bảo Châu","Vân Bộ Thiên Thư"],
  void:    ["Hư Không Thần Tinh","Huyền Thiên Linh Ngọc","Vô Cực Thiên Bảo","Hư Vô Đan"],
  sword:   ["Thượng Cổ Kiếm","Kiếm Đạo Chân Tịch","Cửu Tiêu Kiếm Khí","Thần Kiếm Bí Tịch"],
  ice:     ["Vạn Niên Băng Tinh","Băng Linh Hàn Ngọc","Tuyết Hồn Đan","Bắc Minh Băng Châu"],
  thunder: ["Lôi Thiên Thần Tinh","Thiên Lôi Trảm","Cửu Thiên Huyền Lôi","Lôi Đình Bí Lục"],
  ancient: ["Cổ Thần Điển Tịch","Thần Khí Phán Đoán","Cổ Đại Thiên Bảo","Thần Tích Di Vật"],
  dragon:  ["Long Cốt","Long Huyết Đan","Cửu Long Ngọc","Long Vương Bảo Ấn"],
  demon:   ["Ma Thần Tinh Huyết","Thần Ma Chi Tâm","Vạn Ma Chân Nguyên","Ma Đế Di Bảo"],
  cosmos:  ["Thiên Ngoại Thiên Thạch","Vũ Trụ Linh Tinh","Hỗn Độn Nguyên Khí","Tinh Không Thần Đan"],
  origin:  ["Hỗn Nguyên Châu","Khai Thiên Phủ","Vô Thỉ Linh Căn","Nguyên Thủy Thần Hỏa"],
  primal:  ["Thái Cổ Thần Hồn","Thỉ Nguyên Chân Khí","Vạn Cổ Thần Linh","Tiên Thiên Thần Bảo"],
  dao:     ["Thiên Đạo Thánh Điển","Vô Thượng Chứng Đạo Đan","Thiên Địa Hợp Nhất Quyết","Đại Đạo Linh Châu"],
};

const REALM_INJURY_TEXTS = [
  "bị trọng thương do bẫy cổ đại",
  "hấp thu quá nhiều linh khí tà độc",
  "bị ám khí của cổ giả tấn công",
  "kích hoạt cấm chế trong bí cảnh",
  "đấu với yêu thú bị thương nặng",
  "rơi vào không gian dị động",
  "bị ăn mòn bởi huyết khí ma đạo",
  "phá trận thất bại bị phản thương",
];

const REALM_DEATH_TEXTS = [
  "bị huyết quỷ cổ đại nuốt chửng",
  "rơi vào hư không vô tận",
  "bị thiên lôi trong bí cảnh đánh tử",
  "chạm vào phong ấn hóa tro bụi",
  "bị ma thần cổ đại nghiền nát",
  "ngã vào vực sâu không đáy",
  "bị tẩu hỏa nhập ma trong bí cảnh tử vong",
  "cơ thể tan rã vì không chịu được áp lực linh khí",
];

// ---- Explorer stats tracker (per-NPC) ----
// Added to npc: npc.realmExplored (count), npc.realmDeaths (from hof), npc.realmRewards[]

function getNPCExplorerStats(npc) {
  return {
    explored: npc.realmExplored || 0,
    rewards:  (npc.realmRewards || []).length,
  };
}

// ---- Compute success chance for an NPC entering a realm ----
function realmSuccessChance(npc, template) {
  // Base: 1 - danger
  let base = 1 - template.danger;
  // Luck contributes up to +20%
  base += (npc.luck / 100) * 0.20;
  // Realm level above minRealm helps
  const realmBonus = Math.min(0.20, (npc.realm - template.minRealm) * 0.05);
  base += realmBonus;
  // Attack power bonus (normalized, up to +10%)
  const atkBonus = Math.min(0.10, npc.attack / 5000);
  base += atkBonus;
  return Math.min(0.95, Math.max(0.10, base));
}

// ---- Generate reward for a successful run ----
function generateRealmReward(template, npc) {
  const rarityMap = {
    common:    ["common","uncommon"],
    uncommon:  ["uncommon","rare"],
    rare:      ["rare","epic"],
    epic:      ["epic","legendary"],
    legendary: ["legendary"],
  };
  const allowed = rarityMap[template.rewardRarity] || ["rare"];

  // Roll reward type: item, cultivation, wealth, prestige
  const roll = Math.random();

  if (roll < 0.35) {
    // Unique named artifact from theme
    const themeRewards = REALM_REWARD_NAMES[template.theme] || REALM_REWARD_NAMES.ancient;
    const name = rand(themeRewards);
    const allPool = [...ITEM_POOL, ...WEAPON_POOL, ...ARMOR_POOL, ...ARTIFACT_POOL];
    const base   = rand(allPool.filter(i => allowed.includes(i.rarity)));
    if (base) {
      const item = { ...base, name, id: `item_realm_${Date.now()}_${npc.id}`, fromRealm: template.name };
      return { type:"item", item, display:`${base.icon || "✨"} ${name}` };
    }
  }
  if (roll < 0.55) {
    // Cultivation breakthrough
    return { type:"cultivation", display:"✨ Đột phá cảnh giới" };
  }
  if (roll < 0.72) {
    // Wealth
    const amount = randInt(500, 5000) * (["epic","legendary"].includes(template.rewardRarity) ? 5 : 1);
    return { type:"wealth", amount, display:`💰 ${amount} linh thạch` };
  }
  if (roll < 0.85) {
    // Prestige
    const amount = randInt(100, 800) * (["epic","legendary"].includes(template.rewardRarity) ? 3 : 1);
    return { type:"prestige", amount, display:`⭐ +${amount} danh vọng` };
  }
  // Skill
  const skill = rand(SKILLS_POOL);
  return { type:"skill", skill, display:`📖 Học được ${skill}` };
}

// ---- Apply reward to NPC ----
function applyRealmReward(npc, reward, realmName) {
  if (!npc.realmRewards) npc.realmRewards = [];
  switch (reward.type) {
    case "item":
      npc.inventory.push(reward.item);
      if (reward.item.slot) autoEquipBestGear(npc);
      npc.realmRewards.push({ name: reward.item.name, year, realm: realmName });
      break;
    case "cultivation":
      if (npc.realm < REALMS.length - 1) {
        npc.realm++;
        applyRealmBonus(npc);
        npc.biography.push({ year, event: `Đột phá ${REALMS[npc.realm].name} trong ${realmName}.` });
      }
      break;
    case "wealth":
      npc.wealth += reward.amount;
      break;
    case "prestige":
      npc.reputation += reward.amount;
      break;
    case "skill":
      if (!npc.skills.includes(reward.skill) && npc.skills.length < 8) {
        npc.skills.push(reward.skill);
      }
      break;
  }
}

// ---- Apply injury to NPC ----
function applyRealmInjury(npc) {
  const severity = Math.random();
  if (severity < 0.5) {
    // Light injury
    npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.2));
    return `💔 Trọng thương (HP còn 20%)`;
  } else if (severity < 0.8) {
    // Realm drop
    npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.1));
    if (npc.realm > 0) {
      npc.realm--;
      return `💔 Bị thương nặng, lùi cảnh giới về ${REALMS[npc.realm].name}`;
    }
    return `💔 Bị trọng thương nặng nề`;
  } else {
    // Lose items
    npc.hp = Math.max(1, Math.floor(npc.maxHp * 0.15));
    const lost = npc.inventory.splice(0, Math.min(2, npc.inventory.length));
    return `💔 Bị thương, mất ${lost.length} bảo vật`;
  }
}

// ---- Spawn a new secret realm ----
function spawnSecretRealm(forced = false) {
  if (!world) return;
  // Pick a template appropriate to world's current NPCs
  const alive     = npcs.filter(n => n.status === "alive");
  const maxRealm  = alive.length ? Math.max(...alive.map(n => n.realm)) : 0;
  const available = SECRET_REALM_TEMPLATES.filter(t => t.minRealm <= maxRealm);
  if (!available.length) return;

  // Weigh toward mid-tier
  const weights = available.map(t => {
    if (t.level === "common")    return 30;
    if (t.level === "uncommon")  return 25;
    if (t.level === "rare")      return 20;
    if (t.level === "epic")      return 15;
    if (t.level === "legendary") return 10;
    return 10;
  });
  const total  = weights.reduce((a,b) => a+b, 0);
  let r        = Math.random() * total;
  let template = available[available.length - 1];
  for (let i = 0; i < available.length; i++) { r -= weights[i]; if (r <= 0) { template = available[i]; break; } }

  const realmId = `sr_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
  const eligible = alive.filter(n => !n.inSecretRealm && n.realm >= template.minRealm);

  // Auto-send participants (NPCs brave enough to enter)
  const participants = eligible
    .filter(() => chance(0.4))
    .sort(() => Math.random() - 0.5)
    .slice(0, template.capacity);

  const explorationLog = [];
  const participantRecords = [];

  explorationLog.push(`🌀 ${template.icon} ${template.name} xuất hiện tại ${rand(REGIONS)}!`);
  addLog(`🌀 ${template.icon} ${template.name} xuất hiện!`, "important");
  addTimeline(`🌀 ${template.name} khai mở`, "important", "🌀");

  participants.forEach(npc => {
    npc.inSecretRealm = true;
    const successChance = realmSuccessChance(npc, template);
    explorationLog.push(`⚔️ ${npc.name} [${REALMS[npc.realm].name}] tiến vào bí cảnh`);
    addLog(`⚔️ ${npc.name} tiến vào ${template.name}`, "normal");

    const roll = Math.random();
    if (roll < template.danger * 0.6) {
      // Death
      const deathText = rand(REALM_DEATH_TEXTS);
      killNPC(npc, `${deathText} trong ${template.name}`);
      explorationLog.push(`☠️ ${npc.name} tử vong — ${deathText}`);
      addLog(`☠️ ${npc.name} tử vong trong ${template.name}`, "death");
      participantRecords.push({ npcId: npc.id, npcName: npc.name, entered: true, result: "death", reward: null });
    } else if (roll < template.danger) {
      // Injury — survived but hurt
      const injText = rand(REALM_INJURY_TEXTS);
      const injResult = applyRealmInjury(npc);
      npc.inSecretRealm = false;
      npc.biography.push({ year, event: `Thám hiểm ${template.name}, ${injText}.` });
      explorationLog.push(`💔 ${npc.name} bị thương — ${injText}`);
      addLog(`💔 ${npc.name} bị thương trong ${template.name}: ${injText}`, "normal");
      participantRecords.push({ npcId: npc.id, npcName: npc.name, entered: true, result: "injury", injuryText: injText, injuryResult: injResult, reward: null });
      if (!npc.realmExplored) npc.realmExplored = 0;
      npc.realmExplored++;
    } else {
      // Success!
      const reward = generateRealmReward(template, npc);
      applyRealmReward(npc, reward, template.name);
      npc.inSecretRealm = false;
      npc.biography.push({ year, event: `Thám hiểm thành công ${template.name}, nhận ${reward.display}.` });
      explorationLog.push(`🏆 ${npc.name} thu được ${reward.display}`);
      addLog(`🏆 ${npc.name} thu được ${reward.display} trong ${template.name}`, "important");
      participantRecords.push({ npcId: npc.id, npcName: npc.name, entered: true, result: "success", reward });
      if (!npc.realmExplored) npc.realmExplored = 0;
      npc.realmExplored++;
      heavenPoints += template.level === "legendary" ? 50 : template.level === "epic" ? 30 : 15;
    }
  });

  const realm = {
    id:          realmId,
    name:        template.name,
    icon:        template.icon,
    level:       template.level,
    rewardRarity: template.rewardRarity,
    danger:      template.danger,
    minRealm:    template.minRealm,
    duration:    template.duration,
    capacity:    template.capacity,
    theme:       template.theme,
    discovered:  true,
    discoveredYear: year,
    openYear:    year,
    closeYear:   year + template.duration,
    status:      participants.length > 0 ? "active" : "dormant",
    participants: participantRecords,
    explorationLog,
    totalExplored: participantRecords.length,
    survivors: participantRecords.filter(p => p.result !== "death").length,
    deaths:    participantRecords.filter(p => p.result === "death").length,
    successes: participantRecords.filter(p => p.result === "success").length,
  };

  // Replace old basic secretRealms entries / push
  secretRealms.unshift(realm);
  if (secretRealms.length > 80) secretRealms.pop();

  toast(`🌀 ${template.icon} ${template.name} khai mở! ${participants.length} tu sĩ tham gia.`);
  return realm;
}

// ---- Tick: close expired realms ----
function tickSecretRealms() {
  secretRealms.forEach(realm => {
    if (realm.status === "active" && realm.closeYear && year >= realm.closeYear) {
      realm.status = "closed";
      // Free any still-marked participants
      if (realm.participants) {
        realm.participants.forEach(p => {
          const npc = npcById(p.npcId);
          if (npc) npc.inSecretRealm = false;
        });
      }
      addLog(`🔒 ${realm.icon||"🌀"} ${realm.name} đã đóng cửa sau ${realm.duration} năm`, "normal");
    }
  });

  // Random spawn
  if (chance(0.04)) spawnSecretRealm();
}

// ---- Heaven-mode manual trigger ----
// ============================
// THIÊN ĐÌNH CỨU RỖI (tùy chọn thủ công)
// ============================
function heavenRescue(count) {
  if (!world) { toast("⚠️ Chưa có thế giới!"); return; }
  count = count || 10;
  const cost = count * 30;
  if (heavenPoints < cost) { toast(`⚠️ Cần ${cost} Thiên Đạo Điểm! (hiện có ${heavenPoints}đ)`); return; }
  heavenPoints -= cost;

  for (let i = 0; i < count; i++) {
    const settler = createNPC(false);
    settler.age = randInt(16, 35);
    settler.biography = [{ year, event: `Được Thiên Đình phái xuống nhân gian trong thời kỳ tuyệt chủng.` }];
    npcs.push(settler);
    popStats.births++;
    popStats._tickBirths++;
  }
  if (world._extinct) { world._extinct = false; }
  addLog(`🌟 Thiên Đình can thiệp: ${count} định cư mới xuất hiện! (Chi phí ${cost}đ)`, "important");
  addTimeline(`🌟 Thiên Đình cứu rỗi — ${count} định cư mới`, "important", "🌟");
  toast(`🌟 ${count} sinh linh mới xuất hiện từ Thiên Đình!`);
  renderAll(); save();
}

function heavenOpenRealm() {
  if (heavenPoints < 250) { toast("⚠️ Cần 250 Thiên Đạo Điểm!"); return; }
  heavenPoints -= 250;
  spawnSecretRealm(true);
  renderSecretRealmsPanel();
  renderAll();
  save();
}

// ============================
// RENDER: SECRET REALMS PANEL
// ============================

function renderSecretRealmsPanel() {
  const panel = document.getElementById("panel-secret-realms");
  if (!panel) return;
  renderSRActive();
  renderSRTopExplorers();
  renderSRCompleted();
  // Stats bar
  const statsEl = document.getElementById("srPanelStats");
  if (statsEl) {
    const active   = secretRealms.filter(r => r.status !== "closed").length;
    const closed   = secretRealms.filter(r => r.status === "closed").length;
    statsEl.textContent = `🌀 ${active} đang mở · 🔒 ${closed} đã đóng · 📜 ${secretRealms.length} tổng`;
  }
}

function srLevelColor(level) {
  return { legendary:"#facc15", epic:"#c084fc", rare:"#60a5fa", uncommon:"#4ade80", common:"#94a3b8", dormant:"#64748b" }[level] || "#94a3b8";
}

function renderSRActive() {
  const el = document.getElementById("srActive");
  if (!el) return;
  const active = secretRealms.filter(r => r.status !== "closed");

  if (!active.length) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--white-dim);font-style:italic">
      🌌 Thiên địa bình yên, chưa có bí cảnh nào xuất hiện...<br>
      <button class="btn-primary" style="margin-top:12px" onclick="heavenOpenRealm()">🌀 Khai Mở Bí Cảnh (250đ)</button>
    </div>`;
    return;
  }

  el.innerHTML = active.map(realm => {
    const timeLeft     = realm.closeYear ? Math.max(0, realm.closeYear - year) : realm.duration;
    const timeTotal    = realm.duration || 5;
    const timePct      = Math.max(0, Math.min(100, (timeLeft / timeTotal) * 100));
    const levelColor   = srLevelColor(realm.level);
    const successes    = realm.successes || 0;
    const deaths       = realm.deaths    || 0;
    const total        = realm.totalExplored || 0;

    const participantHTML = (realm.participants || []).map(p => {
      const cls = p.result === "death" ? "dead" : p.result === "success" ? "winner" : "alive";
      const icon = p.result === "death" ? "☠️" : p.result === "success" ? "🏆" : "💔";
      return `<span class="sr-participant-tag ${cls}">${icon} ${p.npcName}</span>`;
    }).join("") || `<span style="color:var(--white-dim);font-size:11px">Chưa có ai vào bí cảnh này</span>`;

    const logSnippet = (realm.explorationLog || []).slice(0,4).map(l =>
      `<div class="sr-result-entry"><span style="color:var(--white-dim);flex-shrink:0">→</span><span style="color:var(--white-main)">${l}</span></div>`
    ).join("");

    return `<div class="sr-card active-realm" style="border-color:${levelColor}22">
      <div class="sr-header">
        <div class="sr-icon-wrap ${realm.level}">${realm.icon || "🌀"}</div>
        <div style="flex:1">
          <div class="sr-name">${realm.name}</div>
          <div style="margin-top:3px;display:flex;align-items:center;gap:6px">
            <span class="sr-level-badge ${realm.level}">${{legendary:"☆ Huyền Thoại",epic:"◈ Sử Thi",rare:"◇ Quý Hiếm",uncommon:"○ Bất Phàm",common:"· Bình Thường",dormant:"· Tiềm Ẩn"}[realm.level]||realm.level}</span>
            <span style="font-size:10px;color:var(--white-dim)">Năm ${realm.openYear} · Đóng Năm ${realm.closeYear||"?"}</span>
          </div>
        </div>
        <button class="btn-secondary" style="padding:4px 10px;font-size:11px" onclick="openRealmDetailModal('${realm.id}')">📋 Chi Tiết</button>
      </div>

      <div class="sr-stats-row">
        <div class="sr-stat-chip">⚠️ Nguy hiểm <span>${Math.round(realm.danger*100)}%</span></div>
        <div class="sr-stat-chip">👥 Sức chứa <span>${realm.capacity}</span></div>
        <div class="sr-stat-chip">🏆 Thành công <span>${successes}</span></div>
        <div class="sr-stat-chip">☠️ Tử vong <span>${deaths}</span></div>
        <div class="sr-stat-chip">📊 Tổng <span>${total}</span></div>
      </div>

      <div class="sr-participants">${participantHTML}</div>

      <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;margin-bottom:8px;max-height:100px;overflow-y:auto">${logSnippet || '<span style="color:var(--white-dim);font-size:11px">Chưa có nhật ký...</span>'}</div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:10px;color:var(--white-dim)">⏳ Thời gian còn lại</span>
        <span style="font-size:11px;color:${levelColor}">${timeLeft} năm</span>
      </div>
      <div class="sr-timer-bar">
        <div class="sr-timer-fill" style="width:${timePct}%;background:linear-gradient(90deg,${levelColor}88,${levelColor})"></div>
      </div>
    </div>`;
  }).join("");
}

function renderSRTopExplorers() {
  const el = document.getElementById("srTopExplorers");
  if (!el) return;

  const allNPCs = [...npcs, ...hallOfFame].filter(n => (n.realmExplored || 0) > 0 || (n.realmRewards || []).length > 0);
  allNPCs.sort((a,b) => {
    const scoreA = (a.realmExplored||0)*10 + (a.realmRewards||[]).length*25;
    const scoreB = (b.realmExplored||0)*10 + (b.realmRewards||[]).length*25;
    return scoreB - scoreA;
  });
  const top = allNPCs.slice(0,10);

  if (!top.length) {
    el.innerHTML = `<div style="color:var(--white-dim);padding:20px;text-align:center;font-style:italic">Chưa có thám hiểm gia nào...</div>`;
    return;
  }

  el.innerHTML = top.map((npc,i) => {
    const explored = npc.realmExplored || 0;
    const rewards  = (npc.realmRewards || []).length;
    const score    = explored * 10 + rewards * 25;
    const rank     = ["🥇","🥈","🥉"][i] || `<span style="color:var(--white-dim)">#${i+1}</span>`;
    const isDead   = npc.status === "dead";
    const sect     = sectById(npc.sectId);
    return `<div class="explorer-row ${isDead?"":""}">
      <div class="explorer-rank">${rank}</div>
      <div class="explorer-info">
        <div class="explorer-name" style="${isDead?'text-decoration:line-through;color:var(--white-dim)':''}">${npc.name} ${isDead?"☠️":""}</div>
        <div class="explorer-sub">${REALMS[npc.realm]?.name||"?"} · ${sect?sect.name:"Độc Tu"} · ${explored} lần · ${rewards} phần thưởng</div>
      </div>
      <div class="explorer-score">${score}</div>
    </div>`;
  }).join("");
}

function renderSRCompleted() {
  const el = document.getElementById("srCompleted");
  if (!el) return;
  const closed = secretRealms.filter(r => r.status === "closed").slice(0,20);

  if (!closed.length) {
    el.innerHTML = `<div style="color:var(--white-dim);padding:20px;text-align:center;font-style:italic">Chưa có bí cảnh nào đóng cửa...</div>`;
    return;
  }

  el.innerHTML = `<div style="max-height:520px;overflow-y:auto">` + closed.map(realm => {
    const levelColor = srLevelColor(realm.level);
    return `<div class="sr-card closed-realm" style="cursor:pointer;border-color:rgba(255,255,255,0.06)" onclick="openRealmDetailModal('${realm.id}')">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="sr-icon-wrap ${realm.level}" style="width:36px;height:36px;font-size:16px;opacity:0.7">${realm.icon||"🌀"}</div>
        <div style="flex:1">
          <div style="font-size:13px;color:var(--white-dim)">${realm.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px">Năm ${realm.openYear||"?"} — ${realm.closeYear||"?"} · ${realm.totalExplored||0} thám hiểm</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:12px;color:${levelColor}">🏆 ${realm.successes||0}</div>
          <div style="font-size:10px;color:var(--red)">☠️ ${realm.deaths||0}</div>
        </div>
      </div>
    </div>`;
  }).join("") + `</div>`;
}

// ---- Realm detail modal ----
function openRealmDetailModal(realmId) {
  const realm = secretRealms.find(r => r.id === realmId);
  if (!realm) return;
  const levelColor = srLevelColor(realm.level);
  const levelLabel = {legendary:"☆ Huyền Thoại",epic:"◈ Sử Thi",rare:"◇ Quý Hiếm",uncommon:"○ Bất Phàm",common:"· Bình Thường"}[realm.level] || realm.level;

  const logHTML = (realm.explorationLog||[]).map(l => `
    <div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;color:var(--white-main)">${l}</div>
  `).join("") || `<div style="color:var(--white-dim);font-size:12px">Không có nhật ký</div>`;

  const partsHTML = (realm.participants||[]).map(p => {
    const color = p.result==="death"?"var(--red)":p.result==="success"?"var(--jade)":"var(--orange)";
    const icon  = p.result==="death"?"☠️":p.result==="success"?"🏆":"💔";
    const rewardText = p.reward ? p.reward.display : (p.injuryText||"—");
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div style="font-size:13px;color:${color}">${icon} ${p.npcName}</div>
      <div style="font-size:11px;color:var(--white-dim)">${rewardText}</div>
    </div>`;
  }).join("") || `<div style="color:var(--white-dim);font-size:12px;padding:10px">Chưa có người tham gia</div>`;

  openModal(`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <div style="width:56px;height:56px;border-radius:14px;background:${levelColor}18;border:1px solid ${levelColor}44;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">${realm.icon||"🌀"}</div>
      <div>
        <div style="font-family:var(--font-heading);font-size:16px;color:var(--white-main);margin-bottom:4px">${realm.name}</div>
        <span style="padding:2px 10px;border-radius:10px;font-size:11px;background:${levelColor}18;color:${levelColor};border:1px solid ${levelColor}44">${levelLabel}</span>
        <span style="margin-left:8px;font-size:11px;color:var(--white-dim)">${realm.status==="closed"?"🔒 Đã đóng":"🌀 Đang mở"}</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
      ${[
        ["⏳ Thời gian",`${realm.openYear}—${realm.closeYear||"?"}`],
        ["⚠️ Nguy hiểm",`${Math.round(realm.danger*100)}%`],
        ["👥 Đã vào",`${realm.totalExplored||0}/${realm.capacity}`],
        ["🏆 Thành công",realm.successes||0],
        ["💔 Bị thương",(realm.participants||[]).filter(p=>p.result==="injury").length],
        ["☠️ Tử vong",realm.deaths||0],
      ].map(([l,v])=>`<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:11px;color:var(--white-dim)">${l}</div>
        <div style="font-size:14px;font-weight:700;color:var(--white-main);margin-top:2px">${v}</div>
      </div>`).join("")}
    </div>

    <div style="font-family:var(--font-title);font-size:11px;letter-spacing:1px;color:var(--gold);margin-bottom:8px">NGƯỜI THAM GIA</div>
    <div style="margin-bottom:16px">${partsHTML}</div>

    <div style="font-family:var(--font-title);font-size:11px;letter-spacing:1px;color:var(--gold);margin-bottom:8px">NHẬT KÝ THÁM HIỂM</div>
    <div style="max-height:180px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:10px">${logHTML}</div>
  `);
}


// ============================================================
// ARTIFACT SYSTEM V2 — Full Rebuild
// Creator God V5.0
// ============================================================

/* ---- RARITY SYSTEM (5 tiers including Immortal) ----
   common < uncommon < rare < epic < legendary < immortal
   Each provides: atkBonus, defBonus, luckBonus, hpBonus
   Artifacts also provide cultivation speed bonus
*/

const ARTIFACT_RARITY_DATA = {
  common:    { label:"Phổ Thông",   color:"#94a3b8", glow:"rgba(148,163,184,0.15)", stars:"★",       weight:40 },
  uncommon:  { label:"Bất Phàm",    color:"#4ade80", glow:"rgba(74,222,128,0.15)",  stars:"★★",      weight:25 },
  rare:      { label:"Quý Hiếm",    color:"#60a5fa", glow:"rgba(96,165,250,0.18)",  stars:"★★★",     weight:18 },
  epic:      { label:"Sử Thi",      color:"#c084fc", glow:"rgba(192,132,252,0.2)",  stars:"★★★★",    weight:10 },
  legendary: { label:"Huyền Thoại", color:"#facc15", glow:"rgba(250,204,21,0.22)",  stars:"★★★★★",   weight:5  },
  immortal:  { label:"Bất Tử Thần Bảo", color:"#f97316", glow:"rgba(249,115,22,0.3)", stars:"∞",    weight:2  },
};

// ---- Full Named Artifact Database ----
const ARTIFACT_DATABASE = [
  // ===== WEAPONS =====
  // Common
  { id:"w_c1", name:"Phàm Tiết Kiếm",      type:"Weapon", slot:"weapon", icon:"⚔️",  rarity:"common",    atkBonus:15,  defBonus:0,   luckBonus:0,  hpBonus:0,    desc:"Kiếm phổ thông của tu sĩ mới vào môn.",        value:200   },
  { id:"w_c2", name:"Đồng Tiêu",            type:"Weapon", slot:"weapon", icon:"🗡️",  rarity:"common",    atkBonus:12,  defBonus:2,   luckBonus:0,  hpBonus:0,    desc:"Giản đồng cũ, hình dạng xấu nhưng bền.",      value:180   },
  // Uncommon
  { id:"w_u1", name:"Huyết Nguyệt Đao",    type:"Weapon", slot:"weapon", icon:"🗡️",  rarity:"uncommon",  atkBonus:45,  defBonus:0,   luckBonus:2,  hpBonus:0,    desc:"Đao được rèn từ tinh thạch huyết nguyệt.",     value:900   },
  { id:"w_u2", name:"Phong Lâm Kiếm",      type:"Weapon", slot:"weapon", icon:"⚔️",  rarity:"uncommon",  atkBonus:40,  defBonus:5,   luckBonus:0,  hpBonus:50,   desc:"Kiếm khí phong lâm, khinh linh di chuyển.",   value:850   },
  // Rare
  { id:"w_r1", name:"Thiên Cương Kiếm",    type:"Weapon", slot:"weapon", icon:"⚔️",  rarity:"rare",      atkBonus:110, defBonus:10,  luckBonus:5,  hpBonus:0,    desc:"Kiếm rèn từ thiên cương thạch vạn năm.",      value:3500  },
  { id:"w_r2", name:"Thanh Liên Kiếm",     type:"Weapon", slot:"weapon", icon:"💚",  rarity:"rare",      atkBonus:95,  defBonus:0,   luckBonus:10, hpBonus:200,  desc:"Liên hoa xanh nở trên kiếm, khí vận dâng cao.",value:4000  },
  { id:"w_r3", name:"Lôi Ảnh Thương",      type:"Weapon", slot:"weapon", icon:"⚡",  rarity:"rare",      atkBonus:130, defBonus:0,   luckBonus:3,  hpBonus:0,    desc:"Thương lôi ảnh, sức tấn công như sấm sét.",   value:3800  },
  // Epic
  { id:"w_e1", name:"Trảm Tiên Đao",       type:"Weapon", slot:"weapon", icon:"🔪",  rarity:"epic",      atkBonus:280, defBonus:20,  luckBonus:15, hpBonus:500,  desc:"Đao trảm tiên nhân, sắc bén vô song.",         value:18000 },
  { id:"w_e2", name:"Thần Kiếm Vô Danh",  type:"Weapon", slot:"weapon", icon:"✨",  rarity:"epic",      atkBonus:260, defBonus:30,  luckBonus:20, hpBonus:300,  desc:"Kiếm vô danh, thần uy khó đo lường.",          value:20000 },
  { id:"w_e3", name:"Phá Thiên Côn",       type:"Weapon", slot:"weapon", icon:"🌪️", rarity:"epic",      atkBonus:300, defBonus:0,   luckBonus:10, hpBonus:1000, desc:"Côn phá thiên địa, uy lực kinh người.",        value:22000 },
  // Legendary
  { id:"w_l1", name:"Hỗn Độn Kiếm",       type:"Weapon", slot:"weapon", icon:"🌟",  rarity:"legendary", atkBonus:650, defBonus:50,  luckBonus:30, hpBonus:2000, desc:"Kiếm hỗn độn khai thiên, đứng đầu vũ khí phổ.",value:90000 },
  { id:"w_l2", name:"Cửu Tiêu Thần Kiếm", type:"Weapon", slot:"weapon", icon:"⭐",  rarity:"legendary", atkBonus:600, defBonus:80,  luckBonus:40, hpBonus:1500, desc:"Kiếm tối thượng cõi trời, chín tầng vân.",     value:85000 },
  // Immortal
  { id:"w_i1", name:"Khai Thiên Phủ",     type:"Weapon", slot:"weapon", icon:"🔱",  rarity:"immortal",  atkBonus:2000,defBonus:200, luckBonus:100,hpBonus:10000,desc:"Phủ khai thiên tịch địa, thần vật bất tử.",    value:999999},
  { id:"w_i2", name:"Tru Tiên Kiếm",      type:"Weapon", slot:"weapon", icon:"☄️",  rarity:"immortal",  atkBonus:1800,defBonus:150, luckBonus:80, hpBonus:8000, desc:"Kiếm tru tiên vạn cổ, nhất kiếm phá trời đất.",value:999999},

  // ===== ARMOR =====
  // Common
  { id:"a_c1", name:"Bố Y",               type:"Armor",  slot:"armor",  icon:"🧥",  rarity:"common",    atkBonus:0,   defBonus:12,  luckBonus:0,  hpBonus:50,   desc:"Áo vải phổ thông, không có linh lực.",         value:150   },
  // Uncommon
  { id:"a_u1", name:"Huyền Thiết Giáp",   type:"Armor",  slot:"armor",  icon:"🛡️",  rarity:"uncommon",  atkBonus:0,   defBonus:35,  luckBonus:0,  hpBonus:200,  desc:"Giáp huyền thiết, vững chắc khó phá.",         value:700   },
  { id:"a_u2", name:"Phong Vũ Bào",       type:"Armor",  slot:"armor",  icon:"🌀",  rarity:"uncommon",  atkBonus:10,  defBonus:25,  luckBonus:5,  hpBonus:150,  desc:"Bào phong vũ, linh hoạt như gió.",             value:800   },
  // Rare
  { id:"a_r1", name:"Hỏa Long Giáp",      type:"Armor",  slot:"armor",  icon:"🔥",  rarity:"rare",      atkBonus:20,  defBonus:90,  luckBonus:5,  hpBonus:500,  desc:"Giáp vảy long hỏa, chống lửa tuyệt hảo.",     value:5500  },
  { id:"a_r2", name:"Băng Tâm Giáp",      type:"Armor",  slot:"armor",  icon:"❄️",  rarity:"rare",      atkBonus:0,   defBonus:100, luckBonus:8,  hpBonus:800,  desc:"Giáp băng tâm, tâm thanh như băng tuyết.",     value:5000  },
  // Epic
  { id:"a_e1", name:"Thiên Ngọc Khải",    type:"Armor",  slot:"armor",  icon:"💫",  rarity:"epic",      atkBonus:30,  defBonus:220, luckBonus:15, hpBonus:2000, desc:"Khải thiên ngọc, khí vận vô song.",             value:22000 },
  { id:"a_e2", name:"Huyền Thiên Bào",    type:"Armor",  slot:"armor",  icon:"🌌",  rarity:"epic",      atkBonus:50,  defBonus:200, luckBonus:20, hpBonus:2500, desc:"Bào huyền thiên, hút hấp hết công kích.",      value:25000 },
  // Legendary
  { id:"a_l1", name:"Bất Diệt Thần Khải", type:"Armor",  slot:"armor",  icon:"🌠",  rarity:"legendary", atkBonus:80,  defBonus:550, luckBonus:35, hpBonus:8000, desc:"Khải bất diệt, không hề sợ thiên kiếp.",       value:110000},
  // Immortal
  { id:"a_i1", name:"Hỗn Nguyên Thần Y",  type:"Armor",  slot:"armor",  icon:"🌈",  rarity:"immortal",  atkBonus:300, defBonus:1500,luckBonus:80, hpBonus:30000,desc:"Y phục hỗn nguyên, siêu việt vật chất thiên địa.",value:999999},

  // ===== ARTIFACTS / PHÁP BẢO =====
  // Common
  { id:"f_c1", name:"Tụ Linh Bội",        type:"Artifact",slot:"artifact",icon:"🔯", rarity:"common",    atkBonus:8,   defBonus:8,   luckBonus:3,  hpBonus:100,  desc:"Bội tụ linh, giúp hút linh khí nhanh hơn.",   value:500   },
  // Uncommon
  { id:"f_u1", name:"Ngũ Hành Châu",      type:"Artifact",slot:"artifact",icon:"💠", rarity:"uncommon",  atkBonus:25,  defBonus:25,  luckBonus:8,  hpBonus:400,  desc:"Châu ngũ hành, cân bằng ngũ hành linh lực.",  value:2000  },
  { id:"f_u2", name:"Linh Ô Chi Cốt",     type:"Artifact",slot:"artifact",icon:"🦴", rarity:"uncommon",  atkBonus:30,  defBonus:15,  luckBonus:12, hpBonus:300,  desc:"Cốt linh ô, khí vận trợ lực không ngừng.",   value:1800  },
  // Rare
  { id:"f_r1", name:"Cửu Long Đỉnh",      type:"Artifact",slot:"artifact",icon:"🏺", rarity:"rare",      atkBonus:60,  defBonus:60,  luckBonus:20, hpBonus:1500, desc:"Đỉnh cửu long, chứa linh lực vô biên.",       value:8000  },
  { id:"f_r2", name:"Bát Quái Kính",      type:"Artifact",slot:"artifact",icon:"🪞", rarity:"rare",      atkBonus:40,  defBonus:80,  luckBonus:25, hpBonus:1000, desc:"Kính bát quái, tiên liệu phán đoán cục thế.", value:7500  },
  { id:"f_r3", name:"Thiên Phù Linh Khí", type:"Artifact",slot:"artifact",icon:"🌊", rarity:"rare",      atkBonus:70,  defBonus:50,  luckBonus:15, hpBonus:1200, desc:"Linh khí thiên phù, hộ thể đẳng cấp cao.",   value:7000  },
  // Epic
  { id:"f_e1", name:"Thiên Địa Linh Bảo", type:"Artifact",slot:"artifact",icon:"🌀", rarity:"epic",      atkBonus:100, defBonus:100, luckBonus:35, hpBonus:3000, desc:"Bảo thiên địa, uy lực kinh trời.",             value:30000 },
  { id:"f_e2", name:"Hà Đồ Lạc Thư",     type:"Artifact",slot:"artifact",icon:"📜", rarity:"epic",      atkBonus:80,  defBonus:120, luckBonus:50, hpBonus:2500, desc:"Hà đồ lạc thư, tiên tri vận mệnh thiên hạ.", value:35000 },
  { id:"f_e3", name:"Tam Tài Thiên Ấn",   type:"Artifact",slot:"artifact",icon:"👁️", rarity:"epic",      atkBonus:120, defBonus:80,  luckBonus:40, hpBonus:4000, desc:"Ấn tam tài, thiên địa nhân nhất thể.",         value:40000 },
  // Legendary
  { id:"f_l1", name:"Hỗn Độn Châu",       type:"Artifact",slot:"artifact",icon:"🔮", rarity:"legendary", atkBonus:250, defBonus:250, luckBonus:70, hpBonus:10000,desc:"Châu hỗn độn nguyên thủy, khai thiên chi bảo.", value:200000},
  { id:"f_l2", name:"Hỗn Nguyên Bảo Kính",type:"Artifact",slot:"artifact",icon:"🪬", rarity:"legendary", atkBonus:220, defBonus:280, luckBonus:80, hpBonus:12000,desc:"Kính hỗn nguyên, phản chiếu mọi kỹ năng.",    value:180000},
  { id:"f_l3", name:"Thái Cực Nghi Linh", type:"Artifact",slot:"artifact",icon:"☯️", rarity:"legendary", atkBonus:300, defBonus:200, luckBonus:90, hpBonus:8000, desc:"Nghi linh thái cực, âm dương nhất thể.",       value:220000},
  // Immortal
  { id:"f_i1", name:"Hỗn Nguyên Linh Châu",type:"Artifact",slot:"artifact",icon:"🌌",rarity:"immortal",  atkBonus:800, defBonus:800, luckBonus:200,hpBonus:50000,desc:"Linh châu hỗn nguyên, siêu việt thiên địa.",  value:999999},
  { id:"f_i2", name:"Vô Cực Linh Đài",    type:"Artifact",slot:"artifact",icon:"✴️", rarity:"immortal",  atkBonus:600, defBonus:1000,luckBonus:150,hpBonus:40000,desc:"Linh đài vô cực, đỉnh cao vũ trụ bí bảo.",    value:999999},
];

// ---- Rebuild ITEM_POOL to include full artifact DB + consumables ----
const CONSUMABLE_POOL = [
  { name:"Tụ Khí Đan",        rarity:"common",    type:"Đan Dược",  icon:"🔮", value:150,    effect:"exp",    power:50   },
  { name:"Hồi Khí Đan",       rarity:"uncommon",  type:"Đan Dược",  icon:"💊", value:300,    effect:"hp",     power:500  },
  { name:"Phá Cảnh Đan",      rarity:"rare",      type:"Đan Dược",  icon:"🌀", value:2000,   effect:"realm",  power:1    },
  { name:"Cửu Phẩm Linh Đan", rarity:"legendary", type:"Đan Dược",  icon:"✨", value:50000,  effect:"realm",  power:3    },
  { name:"Bất Tử Thảo",       rarity:"uncommon",  type:"Linh Dược", icon:"🌿", value:400,    effect:"lifespan",power:50  },
  { name:"Cửu U Công Pháp",   rarity:"epic",      type:"Công Pháp", icon:"📖", value:8000,   effect:"skill",  power:1    },
  { name:"Thiên Linh Lộ Thư", rarity:"epic",      type:"Bí Tịch",  icon:"📜", value:10000,  effect:"skill",  power:2    },
  { name:"Linh Thạch Hạch",   rarity:"common",    type:"Linh Thạch",icon:"💎", value:100,    effect:"wealth", power:100  },
  { name:"Vạn Niên Băng Tinh",rarity:"rare",      type:"Tinh Hoa",  icon:"❄️", value:5000,   effect:"luck",   power:10   },
  { name:"Thiên Lôi Trảm",    rarity:"rare",      type:"Linh Vật",  icon:"⚡", value:4000,   effect:"atk",    power:50   },
];

// ---- Helper: get rarity label & color ----
function rarityLabel(r) {
  return ARTIFACT_RARITY_DATA[r]?.label || r;
}
function rarityColor(r) {
  return ARTIFACT_RARITY_DATA[r]?.color || "#94a3b8";
}
function rarityGlow(r) {
  return ARTIFACT_RARITY_DATA[r]?.glow || "transparent";
}

// ---- Compute total power of NPC including all equipment ----
function computeNPCTotalPower(npc) {
  const realmData = REALMS[npc.realm];
  const baseAtk   = npc.attack  || 0;
  const baseDef   = npc.defense || 0;
  const baseHp    = npc.maxHp   || 0;
  const luckMult  = 1 + (npc.luck || 0) / 200;

  // Sum equipment bonuses
  let eqAtk = 0, eqDef = 0, eqHp = 0, eqLuck = 0;
  ["weapon","armor","artifact"].forEach(slot => {
    const item = npc.equipment?.[slot];
    if (item) {
      eqAtk  += item.atkBonus  || 0;
      eqDef  += item.defBonus  || 0;
      eqHp   += item.hpBonus   || 0;
      eqLuck += item.luckBonus || 0;
    }
  });

  const totalAtk  = baseAtk + eqAtk;
  const totalDef  = baseDef + eqDef;
  const totalHp   = baseHp  + eqHp;
  const totalLuck = Math.min(100, (npc.luck || 0) + eqLuck);

  // Power formula
  const power = Math.floor(
    (totalAtk * 2 + totalDef + totalHp * 0.1 + totalLuck * 5)
    * luckMult
    * (1 + npc.realm * 0.5)
    * ((realmData?.rootPower || 1) * 0.1 + 1)
  );
  return { power, totalAtk, totalDef, totalHp, totalLuck, eqAtk, eqDef, eqHp, eqLuck };
}

// ---- Draw/roll a random artifact by rarity weights ----
function rollArtifact(minRarity = "common", type = null) {
  const rarityOrder = ["common","uncommon","rare","epic","legendary","immortal"];
  const minIdx      = rarityOrder.indexOf(minRarity);

  // Build weight table for rarities >= minRarity
  let totalWeight = 0;
  const buckets = [];
  rarityOrder.slice(minIdx).forEach(r => {
    const w = ARTIFACT_RARITY_DATA[r]?.weight || 1;
    totalWeight += w;
    buckets.push({ rarity: r, weight: w });
  });

  let roll = Math.random() * totalWeight;
  let chosen = buckets[0].rarity;
  for (const b of buckets) { roll -= b.weight; if (roll <= 0) { chosen = b.rarity; break; } }

  // Filter by type if specified
  const pool = ARTIFACT_DATABASE.filter(a => a.rarity === chosen && (type ? a.type === type : true));
  if (!pool.length) {
    const fallback = ARTIFACT_DATABASE.filter(a => a.rarity === chosen);
    if (!fallback.length) return null;
    return { ...rand(fallback), id: `art_${Date.now()}_${Math.random().toString(36).slice(2,6)}` };
  }
  return { ...rand(pool), id: `art_${Date.now()}_${Math.random().toString(36).slice(2,6)}` };
}

// ---- Grant artifact to NPC with logs ----
function grantArtifact(npc, artifact, source = "unknown") {
  if (!artifact) return;
  const wasAtk  = npc.attack;
  const wasDef  = npc.defense;
  const wasLuck = npc.luck;

  npc.inventory.push({ ...artifact });
  autoEquipBestGear(npc);

  const gainedAtk  = npc.attack  - wasAtk;
  const gainedDef  = npc.defense - wasDef;
  const gainedLuck = npc.luck    - wasLuck;

  const rdata = ARTIFACT_RARITY_DATA[artifact.rarity] || {};
  npc.biography.push({ year, event: `Nhận được [${artifact.name}] (${rdata.label}) từ ${source}.` });

  addLog(`🗡️ ${npc.name} nhận được ${artifact.icon} ${artifact.name} [${rdata.label}]`, artifact.rarity === "immortal" ? "important" : "normal");
  if (gainedAtk > 50 || gainedDef > 50) {
    addLog(`✨ ${npc.name} chiến lực tăng mạnh! ⚔️+${Math.max(0,gainedAtk)} 🛡+${Math.max(0,gainedDef)}`, "important");
  }
  if (artifact.rarity === "legendary" || artifact.rarity === "immortal") {
    addTimeline(`🌟 ${npc.name} nhận ${artifact.name}`, "important", "🌟");
    toast(`🌟 ${npc.name} nhận được ${artifact.icon} ${artifact.name} [${rdata.label}]!`);
  }
}

// ---- Heaven-mode: gift artifact to random or top NPC ----
function heavenGiftArtifact(rarity = "rare") {
  const alive = npcs.filter(n => n.status === "alive");
  if (!alive.length) { toast("⚠️ Không có tu sĩ nào!"); return; }
  // Prefer high-realm NPCs
  const target = alive.sort((a,b) => b.realm - a.realm)[0];
  const art    = rollArtifact(rarity);
  if (!art) return;
  grantArtifact(target, art, "Thiên Đạo ban thưởng");
  renderAll(); save();
}

// ---- Tick: rare artifact events ----
function artifactEventTick() {
  // Very rare: spontaneous artifact find
  if (chance(0.015)) {
    const alive = npcs.filter(n => n.status === "alive");
    const npc   = rand(alive);
    if (!npc) return;
    const minR  = npc.realm >= 6 ? "epic" : npc.realm >= 4 ? "rare" : npc.realm >= 2 ? "uncommon" : "common";
    const art   = rollArtifact(minR);
    if (art) grantArtifact(npc, art, "cơ duyên thiên địa");
  }
  // Legendary NPCs might find legendary artifacts
  if (chance(0.005)) {
    const elites = npcs.filter(n => n.status === "alive" && n.realm >= 6);
    const npc    = rand(elites);
    if (npc) {
      const art = rollArtifact("legendary");
      if (art) grantArtifact(npc, art, "thiên cơ bí truyền");
    }
  }
}

// ---- Override generateRealmReward to use new artifact system ----
// Wrap the original to replace item generation with ARTIFACT_DATABASE picks
const _origGenerateRealmReward = typeof generateRealmReward === "function" ? generateRealmReward : null;
function generateRealmReward(template, npc) {
  const rarityMap = {
    common:   "common", uncommon: "uncommon",
    rare:     "rare",   epic:     "epic",
    legendary:"legendary",
  };
  const minR = rarityMap[template.rewardRarity] || "common";
  const roll = Math.random();

  if (roll < 0.40) {
    // Named artifact from ARTIFACT_DATABASE
    const art = rollArtifact(minR);
    if (art) return { type:"item", item:art, display:`${art.icon} ${art.name}` };
  }
  if (roll < 0.55) return { type:"cultivation", display:"✨ Đột phá cảnh giới" };
  if (roll < 0.70) {
    const amount = randInt(500,5000) * (["epic","legendary"].includes(template.rewardRarity)?5:1);
    return { type:"wealth", amount, display:`💰 ${amount} linh thạch` };
  }
  if (roll < 0.82) {
    const amount = randInt(100,800) * (["epic","legendary"].includes(template.rewardRarity)?3:1);
    return { type:"prestige", amount, display:`⭐ +${amount} danh vọng` };
  }
  const skill = rand(SKILLS_POOL);
  return { type:"skill", skill, display:`📖 ${skill}` };
}

// ---- Enhance combat to use artifact luck bonus ----
function getEffectiveLuck(npc) {
  let bonus = 0;
  ["weapon","armor","artifact"].forEach(slot => {
    const item = npc.equipment?.[slot];
    if (item) bonus += item.luckBonus || 0;
  });
  return Math.min(100, (npc.luck || 0) + bonus);
}

// ---- Add luckBonus to existing applyEquipmentStats / removeEquipmentStats ----
// Patch them to handle luckBonus
const _origApplyEq = applyEquipmentStats;
applyEquipmentStats = function(npc, item) {
  _origApplyEq(npc, item);
  if (item.luckBonus) npc.luck = Math.min(100, (npc.luck || 0) + item.luckBonus);
};
const _origRemoveEq = removeEquipmentStats;
removeEquipmentStats = function(npc, item) {
  _origRemoveEq(npc, item);
  if (item.luckBonus) npc.luck = Math.max(1, (npc.luck || 0) - item.luckBonus);
};

// ============================
// ENHANCED NPC MODAL — Artifact Tab
// ============================

// Replace openNPCModal with artifact-enhanced version
const _origOpenNPCModal = openNPCModal;
openNPCModal = function(id) {
  const npc = npcById(id);
  if (!npc) return;
  currentModal = id;

  const sect     = sectById(npc.sectId);
  const spouse   = npc.spouseId ? npcById(npc.spouseId) : null;
  const master   = npc.masterId ? npcById(npc.masterId) : null;
  const children = npc.childrenIds.map(cid => npcById(cid)).filter(Boolean);
  const pwrData  = computeNPCTotalPower(npc);

  // ---- Build Equipment Section ----
  function buildEquipSlot(slot, label, emptyIcon) {
    const item = npc.equipment?.[slot];
    if (!item) return `
      <div class="art-slot-card art-slot-empty" data-slot="${slot}">
        <div class="art-slot-icon-wrap empty">${emptyIcon}</div>
        <div class="art-slot-info">
          <div class="art-slot-name" style="color:rgba(255,255,255,0.25)">Trống — ${label}</div>
          <div class="art-slot-rarity" style="color:rgba(255,255,255,0.15)">Chưa trang bị</div>
        </div>
      </div>`;
    const rc   = rarityColor(item.rarity);
    const rg   = rarityGlow(item.rarity);
    const rl   = rarityLabel(item.rarity);
    const stars = ARTIFACT_RARITY_DATA[item.rarity]?.stars || "?";
    return `
      <div class="art-slot-card" style="border-color:${rc}44;box-shadow:0 0 12px ${rg}">
        <div class="art-slot-icon-wrap" style="background:${rc}18;border-color:${rc}44;font-size:22px">${item.icon}</div>
        <div class="art-slot-info">
          <div class="art-slot-name" style="color:${rc}">${item.name}</div>
          <div class="art-slot-rarity" style="color:${rc}">${stars} ${rl}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px">${item.desc||""}</div>
          <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
            ${item.atkBonus  ? `<span class="art-stat-chip atk">⚔️+${item.atkBonus}</span>`  : ""}
            ${item.defBonus  ? `<span class="art-stat-chip def">🛡+${item.defBonus}</span>`  : ""}
            ${item.hpBonus   ? `<span class="art-stat-chip hp">❤️+${item.hpBonus}</span>`   : ""}
            ${item.luckBonus ? `<span class="art-stat-chip luck">🍀+${item.luckBonus}</span>`: ""}
          </div>
        </div>
        <button class="btn-danger" style="padding:3px 8px;font-size:10px;align-self:flex-start;flex-shrink:0" onclick="unequipArtifactModal(${npc.id},'${slot}')">✖</button>
      </div>`;
  }

  const weaponSlot   = buildEquipSlot("weapon",   "Vũ Khí",  "⚔️");
  const armorSlot    = buildEquipSlot("armor",    "Áo Giáp", "🛡️");
  const artifactSlot = buildEquipSlot("artifact", "Pháp Bảo","🔮");

  // ---- Inventory grid with sell/equip actions ----
  const inventoryHTML = npc.inventory.length
    ? npc.inventory.map(item => {
        const rc = rarityColor(item.rarity);
        const rl = rarityLabel(item.rarity);
        const stars = ARTIFACT_RARITY_DATA[item.rarity]?.stars || "?";
        const canEquip = !!item.slot;
        return `
          <div class="art-inv-card" style="border-color:${rc}33;background:${rc}08">
            <div class="art-inv-icon" style="background:${rc}15;border-color:${rc}33">${item.icon||"📦"}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;color:${rc};font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
              <div style="font-size:10px;color:rgba(255,255,255,0.4);margin:1px 0">${stars} ${rl}</div>
              ${item.atkBonus  ? `<span class="art-stat-chip atk" style="font-size:9px">⚔️${item.atkBonus}</span> ` : ""}
              ${item.defBonus  ? `<span class="art-stat-chip def" style="font-size:9px">🛡${item.defBonus}</span> ` : ""}
              ${item.luckBonus ? `<span class="art-stat-chip luck" style="font-size:9px">🍀${item.luckBonus}</span>`: ""}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
              ${canEquip ? `<button class="btn-jade" style="padding:2px 8px;font-size:10px" onclick="equipItemModal(${npc.id},'${item.id}')">装</button>` : ""}
              <button class="btn-secondary small" style="padding:2px 8px;font-size:10px" onclick="sellItemModal(${npc.id},'${item.id}')">💰</button>
            </div>
          </div>`;
      }).join("")
    : `<div style="color:rgba(255,255,255,0.3);padding:30px;text-align:center;font-style:italic;width:100%">🎒 Tàng phẩm trống rỗng</div>`;

  // ---- Total Power Breakdown ----
  const powerBreakdownHTML = `
    <div class="power-breakdown">
      <div class="pb-total">
        <div class="pb-total-val">${pwrData.power.toLocaleString()}</div>
        <div class="pb-total-label">TỔNG CHIẾN LỰC</div>
      </div>
      <div class="pb-grid">
        <div class="pb-stat"><span class="pb-icon">⚔️</span><span class="pb-label">Công Kích</span><span class="pb-val">${pwrData.totalAtk}</span></div>
        <div class="pb-stat"><span class="pb-icon">🛡️</span><span class="pb-label">Phòng Thủ</span><span class="pb-val">${pwrData.totalDef}</span></div>
        <div class="pb-stat"><span class="pb-icon">❤️</span><span class="pb-label">Sinh Lực</span><span class="pb-val">${pwrData.totalHp}</span></div>
        <div class="pb-stat"><span class="pb-icon">🍀</span><span class="pb-label">Khí Vận</span><span class="pb-val">${pwrData.totalLuck}</span></div>
        <div class="pb-stat sub"><span class="pb-icon">🔱</span><span class="pb-label">Trang Bị ⚔️</span><span class="pb-val">+${pwrData.eqAtk}</span></div>
        <div class="pb-stat sub"><span class="pb-icon">🔱</span><span class="pb-label">Trang Bị 🛡</span><span class="pb-val">+${pwrData.eqDef}</span></div>
        <div class="pb-stat sub"><span class="pb-icon">🔱</span><span class="pb-label">Trang Bị ❤️</span><span class="pb-val">+${pwrData.eqHp}</span></div>
        <div class="pb-stat sub"><span class="pb-icon">🔱</span><span class="pb-label">Trang Bị 🍀</span><span class="pb-val">+${pwrData.eqLuck}</span></div>
      </div>
    </div>`;

  // ---- Resources block ----
  const res = npc.resources || {};
  const resourcesBlock = Object.entries(RESOURCES).map(([k,v]) =>
    `<div class="modal-stat"><div class="ms-label">${v.icon} ${v.name}</div><div class="ms-value" style="color:${v.color}">${Math.floor(res[k]||0)}</div></div>`
  ).join("");

  const html = `
    <div class="modal-header">
      <div class="modal-avatar">${npc.gender === "Nữ" ? "👸" : "🧙"}</div>
      <div style="flex:1">
        <div class="modal-npc-title">${npc.name}${npc.inSecretRealm ? " <span style='color:#c084fc;font-size:14px'>🌀</span>" : ""}</div>
        <div class="modal-npc-subtitle">${npc.personality} · ${npc.fate} · ${npc.goal}</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${npc.titles.map(t=>`<span class="title-badge">${t}</span>`).join(" ")}
          <span style="background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.3);border-radius:8px;padding:2px 10px;font-size:11px;color:var(--gold)">⚡ ${pwrData.power.toLocaleString()} Chiến Lực</span>
        </div>
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchTab('overview',this)">📋 Tổng Quan</button>
      <button class="modal-tab" onclick="switchTab('cultivation',this)">✨ Tu Luyện</button>
      <button class="modal-tab" onclick="switchTab('artifacts',this)">🔮 Pháp Bảo</button>
      <button class="modal-tab" onclick="switchTab('inventory',this)">🎒 Tàng Phẩm</button>
      <button class="modal-tab" onclick="switchTab('resources',this)">💎 Tài Nguyên</button>
      <button class="modal-tab" onclick="switchTab('relations',this)">👥 Quan Hệ</button>
      <button class="modal-tab" onclick="switchTab('history',this)">📜 Lịch Sử</button>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="tab-overview" class="modal-tab-content active">
      ${powerBreakdownHTML}
      <div class="modal-grid" style="margin-top:12px">
        <div class="modal-stat"><div class="ms-label">CẢNH GIỚI</div><div class="ms-value realm-${npc.realm}">${REALMS[npc.realm].name}</div></div>
        <div class="modal-stat"><div class="ms-label">LINH CĂN</div><div class="ms-value">${npc.root}</div></div>
        <div class="modal-stat"><div class="ms-label">TUỔI</div><div class="ms-value">${npc.age}</div></div>
        <div class="modal-stat"><div class="ms-label">SINH LỰC</div><div class="ms-value">${npc.hp}/${npc.maxHp}</div></div>
        <div class="modal-stat"><div class="ms-label">CÔNG KÍCH</div><div class="ms-value">${pwrData.totalAtk}</div></div>
        <div class="modal-stat"><div class="ms-label">PHÒNG THỦ</div><div class="ms-value">${pwrData.totalDef}</div></div>
        <div class="modal-stat"><div class="ms-label">DANH VỌNG</div><div class="ms-value">${Math.floor(npc.reputation)}</div></div>
        <div class="modal-stat"><div class="ms-label">TÀI PHÚ</div><div class="ms-value">${Math.floor(npc.wealth)}</div></div>
        <div class="modal-stat"><div class="ms-label">KHÍ VẬN</div><div class="ms-value">${pwrData.totalLuck}</div></div>
        <div class="modal-stat"><div class="ms-label">NGHIỆP LỰC</div><div class="ms-value">${npc.karma}</div></div>
        <div class="modal-stat"><div class="ms-label">TÔNG MÔN</div><div class="ms-value" style="font-size:12px">${sect ? sect.name : "Độc Tu"}</div></div>
        <div class="modal-stat"><div class="ms-label">QUỐC GIA</div><div class="ms-value" style="font-size:12px">${npc.country}</div></div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">KỸ NĂNG</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${npc.skills.length ? npc.skills.map(s=>`<span class="title-badge" style="color:var(--blue);border-color:rgba(96,165,250,0.4);background:rgba(96,165,250,0.08)">${s}</span>`).join("") : '<span style="color:var(--white-dim);font-size:12px">Chưa học kỹ năng</span>'}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">THAO TÁC THIÊN ĐẠO</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-jade" onclick="bless(${npc.id});closeModalBtn()">⚡ Ban Phúc</button>
          <button class="btn-secondary small" onclick="grantArtifact(npcById(${npc.id}),rollArtifact('rare'),'Thiên Đạo');openNPCModal(${npc.id})">🎁 Ban Thánh Vật</button>
          <button class="btn-secondary small" onclick="tribulation(${npc.id});closeModalBtn()">🌩 Thiên Kiếp</button>
          <button class="btn-danger" onclick="removeNPC(${npc.id});closeModalBtn()">💀 Xóa Khỏi Thiên Địa</button>
        </div>
      </div>
    </div>

    <!-- CULTIVATION TAB -->
    <div id="tab-cultivation" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">TIẾN TRÌNH TU LUYỆN</div>
        ${REALMS.map((r,i) => {
          const done    = i < npc.realm;
          const current = i === npc.realm;
          const pct     = current ? Math.min(100, ((npc.realmProgress||0)/r.exp)*100) : (done ? 100 : 0);
          return `<div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
              <span style="color:${current ? realmColor(i) : done ? 'var(--jade)' : 'var(--white-dim)'}">${done?"✅":current?"▶":""} ${r.name}</span>
              <span style="color:var(--white-dim)">${current ? Math.floor(pct)+"%" : done ? "完成" : "未达"}</span>
            </div>
            <div class="bar-track" style="height:6px"><div class="bar-fill exp" style="width:${pct}%;background:${done?'var(--jade)':current?'var(--gold)':'transparent'}"></div></div>
          </div>`;
        }).join("")}
      </div>
      <div class="modal-section">
        <div class="modal-section-title">THỌ NGUYÊN</div>
        <div class="bar-row">
          <div class="bar-track" style="height:8px;flex:1">
            <div class="bar-fill" style="width:${Math.min(100,(npc.age/npc.lifespan)*100)}%;background:linear-gradient(90deg,#60a5fa,#a78bfa)"></div>
          </div>
          <span class="bar-val" style="width:80px">${npc.age} / ${npc.lifespan} năm</span>
        </div>
      </div>
    </div>

    <!-- ARTIFACTS TAB -->
    <div id="tab-artifacts" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">⚔️ VŨ KHÍ ĐANG TRANG BỊ</div>
        ${weaponSlot}
      </div>
      <div class="modal-section">
        <div class="modal-section-title">🛡️ GIÁP ĐANG TRANG BỊ</div>
        ${armorSlot}
      </div>
      <div class="modal-section">
        <div class="modal-section-title">🔮 PHÁP BẢO ĐANG TRANG BỊ</div>
        ${artifactSlot}
      </div>
      <div class="modal-section">
        <div class="modal-section-title">TRANG BỊ TRONG TÚI</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${npc.inventory.filter(i=>i.slot).length
            ? npc.inventory.filter(i=>i.slot).map(item => {
                const rc = rarityColor(item.rarity);
                const rl = rarityLabel(item.rarity);
                return `<div class="art-inv-card" style="border-color:${rc}33;background:${rc}08">
                  <div class="art-inv-icon" style="background:${rc}15;border-color:${rc}33;font-size:16px">${item.icon}</div>
                  <div style="flex:1"><div style="font-size:12px;color:${rc}">${item.name}</div><div style="font-size:10px;color:rgba(255,255,255,0.4)">${ARTIFACT_RARITY_DATA[item.rarity]?.stars||""} ${rl} · ${item.type}</div></div>
                  <button class="btn-jade" style="padding:3px 10px;font-size:11px" onclick="equipItemModal(${npc.id},'${item.id}')">⚡ Trang Bị</button>
                </div>`;
              }).join("")
            : `<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;font-style:italic">Không có trang bị trong túi</div>`
          }
        </div>
      </div>
    </div>

    <!-- INVENTORY TAB -->
    <div id="tab-inventory" class="modal-tab-content">
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:10px">📦 ${npc.inventory.length} vật phẩm · 💰 Tổng trị giá: ${npc.inventory.reduce((s,i)=>s+(i.value||0),0).toLocaleString()} linh thạch</div>
      <div style="display:flex;flex-direction:column;gap:5px">${inventoryHTML}</div>
    </div>

    <!-- RESOURCES TAB -->
    <div id="tab-resources" class="modal-tab-content">
      <div class="modal-section">
        <div class="modal-section-title">TÀI NGUYÊN CÁ NHÂN</div>
        <div class="modal-grid">${resourcesBlock}</div>
      </div>
    </div>

    <!-- RELATIONS TAB -->
    <div id="tab-relations" class="modal-tab-content">
      <div class="rel-list">
        ${(() => {
          const parents = (npc.parentIds || []).map(pid => npcById(pid)).filter(Boolean);
          if (!parents.length) return "";
          return parents.map(p => {
            const grandparents = (p.parentIds || []).map(gid => npcById(gid)).filter(Boolean);
            const lineage = grandparents.length
              ? ` (${p.gender === "Nữ" ? "con gái" : "con trai"} của ${grandparents.map(g=>g.name).join(" & ")})`
              : "";
            const relLabel = p.gender === "Nữ" ? "Mẹ" : "Cha";
            return `<div class="rel-item"><span class="rel-type rel-parent">${relLabel}</span><span>${p.name} [${REALMS[p.realm].name}]${lineage}</span></div>`;
          }).join("");
        })()}
        ${spouse ? `<div class="rel-item"><span class="rel-type rel-spouse">Đạo Lữ</span><span>${spouse.name} [${REALMS[spouse.realm].name}]</span></div>` : ""}
        ${master ? `<div class="rel-item"><span class="rel-type rel-master">Sư Phụ</span><span>${master.name} [${REALMS[master.realm].name}]</span></div>` : ""}
        ${children.map(c=>`<div class="rel-item"><span class="rel-type rel-child">Con Cái</span><span>${c.name} [${REALMS[c.realm].name}] — ${c.age}t</span></div>`).join("")}
        ${npc.discipleIds.map(did=>{const d=npcById(did);return d?`<div class="rel-item"><span class="rel-type rel-disciple">Đệ Tử</span><span>${d.name} [${REALMS[d.realm].name}]</span></div>`:""}).join("")}
        ${!(npc.parentIds||[]).length&&!spouse&&!master&&!children.length&&!npc.discipleIds.length?`<div style="color:var(--white-dim);font-size:13px;padding:20px;text-align:center">Chưa có quan hệ nào</div>`:""}
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div id="tab-history" class="modal-tab-content">
      <div class="history-list">
        ${npc.biography.slice().reverse().map(e=>`<div class="history-item"><div class="history-year">Năm ${e.year}</div><div class="history-event">${e.event}</div></div>`).join("")}
      </div>
    </div>
  `;

  openModal(html);
};

// ---- Helper: unequip from modal ----
function unequipArtifactModal(npcId, slot) {
  const npc = npcById(npcId);
  if (!npc || !npc.equipment?.[slot]) return;
  const item = npc.equipment[slot];
  removeEquipmentStats(npc, item);
  npc.inventory.push(item);
  npc.equipment[slot] = null;
  save();
  openNPCModal(npcId);
}

// ---- Sell item from modal ----
function sellItemModal(npcId, itemId) {
  const npc  = npcById(npcId);
  if (!npc) return;
  const idx  = npc.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const item = npc.inventory[idx];
  const val  = item.value || 0;
  npc.inventory.splice(idx, 1);
  npc.wealth += val;
  npc.resources.lingshi = (npc.resources.lingshi || 0) + Math.floor(val * 0.1);
  addLog(`💰 ${npc.name} bán ${item.icon} ${item.name} được ${val} linh thạch`, "normal");
  save();
  openNPCModal(npcId);
}


// ============================
// WORLD HISTORY PANEL
// ============================

function renderWorldHistory() {
  if (!document.getElementById("panel-world-history")?.classList.contains("active")) return;

  const filterYear   = document.getElementById("whFilterYear")?.value.trim()  || "";
  const filterType   = document.getElementById("whFilterType")?.value          || "";
  const filterSearch = document.getElementById("whFilterSearch")?.value.trim().toLowerCase() || "";

  let events = worldHistory.slice();

  if (filterType)    events = events.filter(e => e.eventType === filterType);
  if (filterYear)    events = events.filter(e => String(e.year).includes(filterYear));
  if (filterSearch)  events = events.filter(e => e.description.toLowerCase().includes(filterSearch));

  // Summary counts
  const typeCounts = {};
  worldHistory.forEach(e => { typeCounts[e.eventType] = (typeCounts[e.eventType] || 0) + 1; });

  const summaryHtml = Object.entries(HISTORY_EVENT_TYPES).map(([key, val]) => {
    const count = typeCounts[key] || 0;
    if (!count) return "";
    return `<div class="wh-stat-chip" style="border-color:${val.color}33;background:${val.color}08">
      <span>${val.icon}</span>
      <span style="color:${val.color};font-weight:700">${count}</span>
      <span style="color:var(--white-dim);font-size:10px">${val.label}</span>
    </div>`;
  }).join("");

  const listEl = document.getElementById("whEventList");
  if (!listEl) return;

  if (!events.length) {
    listEl.innerHTML = `<div class="wh-empty">📜 Chưa có sự kiện nào phù hợp với bộ lọc.<br><small style="opacity:.4">Thử thay đổi bộ lọc hoặc chờ thiên địa phát triển...</small></div>`;
  } else {
    listEl.innerHTML = events.map((e, idx) => {
      const typeInfo = HISTORY_EVENT_TYPES[e.eventType] || { icon:"📌", color:"var(--gold)", label: e.eventType };
      // Alternating timeline node
      const side = idx % 2 === 0 ? "left" : "right";
      return `<div class="wh-timeline-row wh-${side}">
        <div class="wh-timeline-node" style="background:${typeInfo.color};box-shadow:0 0 8px ${typeInfo.color}66"></div>
        <div class="wh-entry" style="border-color:${typeInfo.color}33">
          <div class="wh-entry-header">
            <span class="wh-type-pill" style="background:${typeInfo.color}15;color:${typeInfo.color};border-color:${typeInfo.color}44">${typeInfo.icon} ${typeInfo.label}</span>
            <span class="wh-year-badge">📅 Năm ${e.year}</span>
          </div>
          <div class="wh-entry-desc">${e.description}</div>
        </div>
      </div>`;
    }).join("");
  }

  const statsEl = document.getElementById("whSummaryStats");
  if (statsEl) statsEl.innerHTML = summaryHtml || `<div style="color:var(--white-dim);font-size:12px;font-style:italic">Chưa có sự kiện nào...</div>`;

  const countEl = document.getElementById("whResultCount");
  if (countEl) countEl.textContent = `${events.length} / ${worldHistory.length} sự kiện`;
}

function clearWorldHistory() {
  if (!confirm("Xóa toàn bộ lịch sử thế giới? Hành động này không thể hoàn tác!")) return;
  worldHistory = [];
  save();
  renderWorldHistory();
  toast("🗑 Đã xóa lịch sử thế giới!");
}

// ============================
// DYNASTY SYSTEM
// ============================

// Ensure generation field on all existing NPCs at load time
function migrateDynastyFields() {
  npcs.forEach(npc => {
    if (!npc.generation) npc.generation = 1;
  });
  hallOfFame.forEach(npc => {
    if (!npc.generation) npc.generation = 1;
  });
}

function registerDynastyMember(npc) {
  const surname = npc.family;
  if (!surname) return;
  if (!dynasties[surname]) {
    dynasties[surname] = {
      surname,
      foundedYear:  year,
      founder:      npc.id,
      founderName:  npc.name,
      wealth:       0,
      reputation:   0,
      power:        0,
      totalMembers: 0,
      aliveMembers: 0,
      peakRealm:    0,
      peakName:     npc.name,
      generations:  1,
      history:      [{ year, event: `Gia tộc ${surname} được khai sáng bởi ${npc.name}.` }],
      titles:       [],
    };
    addWorldHistory('civilization', `Gia tộc ${surname} hình thành — ${npc.name} là thủy tổ.`, { dynastySurname: surname, npcName: npc.name });
    addLog(`🏠 Gia tộc [${surname}] vừa được khai sáng bởi ${npc.name}!`, 'important');
  }
  const d = dynasties[surname];
  d.totalMembers++;
  d.aliveMembers++;
}

function updateDynasty(surname) {
  if (!surname || !dynasties[surname]) return;
  const d = dynasties[surname];
  const members = getDynastyMembers(surname);
  const alive   = members.filter(n => n.status === "alive");
  const dead    = members.filter(n => n.status === "dead");

  // Recalculate stats from all current members
  d.aliveMembers = alive.length;
  d.totalMembers = members.length;
  d.wealth       = alive.reduce((s, n) => s + (n.wealth || 0), 0)
                 + dead.reduce((s, n) => s + Math.floor((n.wealth || 0) * 0.1), 0);
  d.reputation   = alive.reduce((s, n) => s + (n.reputation || 0), 0);
  d.power        = alive.reduce((s, n) => s + n.realm * 100 + (n.attack || 0) + (n.defense || 0), 0);

  const topMember = alive.sort((a, b) => b.realm - a.realm)[0];
  if (topMember && topMember.realm > d.peakRealm) {
    d.peakRealm = topMember.realm;
    d.peakName  = topMember.name;
  }

  // Generation depth
  const maxGen = Math.max(...members.map(n => n.generation || 1));
  d.generations = maxGen;

  // Dynasty titles
  d.titles = [];
  if (d.generations >= 3)   d.titles.push("三代傳承");
  if (d.generations >= 5)   d.titles.push("五代名門");
  if (d.generations >= 10)  d.titles.push("十代望族");
  if (d.peakRealm >= 5)     d.titles.push("🌟 Tiên Tông");
  if (d.peakRealm >= 8)     d.titles.push("✨ Chân Tiên Gia Tộc");
  if (d.wealth >= 100000)   d.titles.push("💰 Phú Hào");
  if (d.reputation >= 5000) d.titles.push("🏆 Danh Vọng Thiên Hạ");
  if (alive.length >= 10)   d.titles.push("👥 Gia Tộc Hưng Thịnh");
}

function getDynastyMembers(surname) {
  const alive = npcs.filter(n => n.family === surname);
  const dead  = hallOfFame.filter(n => n.family === surname);
  return [...alive, ...dead];
}

function getDynastyAncestors(surname) {
  // Generation 1 members
  return getDynastyMembers(surname)
    .filter(n => (n.generation || 1) === 1)
    .slice(0, 5);
}

function dynastyTick() {
  // Update all dynasties every tick
  const surnames = new Set([
    ...npcs.map(n => n.family),
    ...hallOfFame.map(n => n.family),
  ].filter(Boolean));

  surnames.forEach(surname => {
    if (!dynasties[surname]) {
      // Bootstrap dynasty for surname that already has members
      const founder = npcs.find(n => n.family === surname) || hallOfFame.find(n => n.family === surname);
      if (founder) registerDynastyMember(founder);
    }
    updateDynasty(surname);
  });

  // Rare dynasty milestone log (once per 10 years roughly)
  if (chance(0.05)) {
    const topDynasties = getDynastyRanking().slice(0, 3);
    topDynasties.forEach(d => {
      if (d.generations > 0 && d.generations % 5 === 0 && chance(0.3)) {
        addLog(`👑 Gia tộc ${d.surname} đạt ${d.generations} thế hệ truyền thừa!`, "important");
        addWorldHistory("civilization", `Gia tộc ${d.surname} truyền thừa ${d.generations} thế hệ`, { dynastySurname: d.surname });
        d.history.push({ year, event: `Đạt ${d.generations} thế hệ truyền thừa huy hoàng.` });
      }
    });
  }
}

function getDynastyRanking() {
  return Object.values(dynasties)
    .filter(d => d.totalMembers > 0)
    .sort((a, b) => {
      // Score = power + wealth/10 + reputation + generations*500 + peakRealm*1000
      const scoreA = a.power + a.wealth / 10 + a.reputation + a.generations * 500 + a.peakRealm * 1000;
      const scoreB = b.power + b.wealth / 10 + b.reputation + b.generations * 500 + b.peakRealm * 1000;
      return scoreB - scoreA;
    });
}

// Build a simple text-based family tree for a dynasty
function buildFamilyTree(surname) {
  const allMembers = getDynastyMembers(surname);
  if (!allMembers.length) return "<div style='color:var(--white-dim);font-style:italic;padding:20px;text-align:center'>Không có thành viên nào.</div>";

  const maxGen = Math.max(...allMembers.map(n => n.generation || 1));
  let html = "";

  for (let gen = 1; gen <= Math.min(maxGen, 8); gen++) {
    const genMembers = allMembers.filter(n => (n.generation || 1) === gen);
    if (!genMembers.length) continue;

    const genLabel = ["Thủy Tổ","Nhị Đại","Tam Đại","Tứ Đại","Ngũ Đại","Lục Đại","Thất Đại","Bát Đại"][gen - 1] || `Thế Hệ ${gen}`;
    html += `<div class="dyn-gen-row">
      <div class="dyn-gen-label">
        <span class="dyn-gen-badge">第${gen}代</span>
        <span class="dyn-gen-name">${genLabel}</span>
      </div>
      <div class="dyn-gen-members">`;

    genMembers.slice(0, 10).forEach(npc => {
      const isAlive   = npc.status === "alive";
      const realmName = REALMS[npc.realm]?.name || "?";
      const realmCol  = realmColor(npc.realm);
      const genderIcon = npc.gender === "Nam" ? "♂" : "♀";
      html += `<div class="dyn-member-node ${isAlive ? "alive" : "dead"}" onclick="openNPCModal(${npc.id})">
        <div class="dyn-member-avatar" style="border-color:${realmCol}44;background:${realmCol}10;color:${realmCol}">${genderIcon}</div>
        <div class="dyn-member-info">
          <div class="dyn-member-name" style="color:${isAlive ? "var(--white-main)" : "var(--white-dim)"}">${npc.name}</div>
          <div class="dyn-member-realm" style="color:${realmCol}">${realmName}</div>
          ${isAlive ? "" : '<div class="dyn-member-dead">☠ Đã Ngã</div>'}
        </div>
      </div>`;
    });

    if (genMembers.length > 10) {
      html += `<div class="dyn-member-more">+${genMembers.length - 10} thành viên</div>`;
    }

    html += `</div></div>`;
    // Connector line between generations
    if (gen < Math.min(maxGen, 8)) {
      html += `<div class="dyn-gen-connector">│</div>`;
    }
  }
  return html;
}

// ============================
// DYNASTY PANEL RENDERER
// ============================

function renderDynastyPanel() {
  if (!document.getElementById("panel-dynasty")?.classList.contains("active")) return;

  const ranking = getDynastyRanking();
  const top10   = ranking.slice(0, 10);

  // Top 10 ranking list
  const rankEl = document.getElementById("dynastyRanking");
  if (rankEl) {
    if (!top10.length) {
      rankEl.innerHTML = `<div class="wh-empty">👑 Chưa có gia tộc nào được hình thành.<br><small style='opacity:.4'>Triệu hồi tu sĩ và để thiên địa phát triển...</small></div>`;
    } else {
      rankEl.innerHTML = top10.map((d, i) => {
        const score     = Math.floor(d.power + d.wealth / 10 + d.reputation + d.generations * 500 + d.peakRealm * 1000);
        const peakColor = realmColor(d.peakRealm);
        const rankIcon  = ["👑","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"][i] || `${i+1}`;
        const aliveBar  = d.totalMembers > 0 ? Math.round((d.aliveMembers / d.totalMembers) * 100) : 0;

        return `<div class="dyn-rank-card" onclick="showDynastyDetail('${d.surname}')">
          <div class="dyn-rank-left">
            <div class="dyn-rank-num">${rankIcon}</div>
            <div>
              <div class="dyn-surname">${d.surname}</div>
              <div class="dyn-founded">Khai sáng Năm ${d.foundedYear} · ${d.generations} thế hệ</div>
              <div class="dyn-titles">${d.titles.slice(0,3).map(t => `<span class="dyn-title-chip">${t}</span>`).join("")}</div>
            </div>
          </div>
          <div class="dyn-rank-stats">
            <div class="dyn-stat"><span>👥</span><span>${d.aliveMembers}/${d.totalMembers}</span></div>
            <div class="dyn-stat"><span>🌟</span><span style="color:${peakColor}">${REALMS[d.peakRealm]?.name||"?"}</span></div>
            <div class="dyn-stat"><span>💰</span><span>${(d.wealth/1000).toFixed(1)}k</span></div>
            <div class="dyn-stat"><span>⚡</span><span>${score.toLocaleString()}</span></div>
          </div>
          <div class="dyn-alive-bar-wrap">
            <div class="dyn-alive-bar" style="width:${aliveBar}%"></div>
          </div>
        </div>`;
      }).join("");
    }
  }

  // Dynasty world stats
  const statsEl = document.getElementById("dynastyWorldStats");
  if (statsEl) {
    const total = ranking.length;
    const totalMembers = ranking.reduce((s, d) => s + d.totalMembers, 0);
    const totalAlive   = ranking.reduce((s, d) => s + d.aliveMembers, 0);
    const oldest = ranking.sort((a,b) => a.foundedYear - b.foundedYear)[0];
    const richest = ranking.sort((a,b) => b.wealth - a.wealth)[0];
    const strongest = ranking.sort((a,b) => b.peakRealm - a.peakRealm)[0];
    statsEl.innerHTML = [
      { icon:"🏰", label:"Tổng Gia Tộc", value: total },
      { icon:"👥", label:"Tổng Thành Viên", value: totalMembers },
      { icon:"🌱", label:"Đang Sống", value: totalAlive },
      { icon:"📜", label:"Lâu Đời Nhất", value: oldest ? oldest.surname : "—" },
      { icon:"💰", label:"Giàu Nhất", value: richest ? richest.surname : "—" },
      { icon:"🌟", label:"Mạnh Nhất", value: strongest ? strongest.surname : "—" },
    ].map(s => `<div class="dyn-world-stat">
      <div class="dyn-ws-icon">${s.icon}</div>
      <div class="dyn-ws-val">${s.value}</div>
      <div class="dyn-ws-label">${s.label}</div>
    </div>`).join("");
  }

  // If a dynasty is selected, render detail
  const selected = document.getElementById("dynastyDetailSurname")?.dataset?.surname;
  if (selected) showDynastyDetail(selected, false);
}

function showDynastyDetail(surname, scroll = true) {
  const d = dynasties[surname];
  if (!d) return;

  const detailEl = document.getElementById("dynastyDetail");
  if (!detailEl) return;

  // Store selection
  const tag = document.getElementById("dynastyDetailSurname");
  if (tag) tag.dataset.surname = surname;

  const members   = getDynastyMembers(surname);
  const alive     = members.filter(n => n.status === "alive");
  const topMember = alive.sort((a,b) => b.realm - a.realm)[0];
  const peakCol   = realmColor(d.peakRealm);

  detailEl.innerHTML = `
    <div class="dyn-detail-header">
      <div>
        <div class="dyn-detail-name">🏰 Gia Tộc ${surname}</div>
        <div class="dyn-detail-sub">Khai sáng Năm ${d.foundedYear} bởi ${d.founderName} · ${d.generations} thế hệ truyền thừa</div>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
          ${d.titles.map(t=>`<span class="dyn-title-chip">${t}</span>`).join("")}
        </div>
      </div>
      <div class="dyn-detail-power-grid">
        <div class="dyn-dp-stat"><div class="dyn-dp-val" style="color:${peakCol}">${REALMS[d.peakRealm]?.name||"?"}</div><div class="dyn-dp-lbl">Đỉnh Cảnh</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${alive.length}</div><div class="dyn-dp-lbl">Còn Sống</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${(d.wealth/1000).toFixed(1)}k</div><div class="dyn-dp-lbl">Tài Phú</div></div>
        <div class="dyn-dp-stat"><div class="dyn-dp-val">${d.reputation.toLocaleString()}</div><div class="dyn-dp-lbl">Danh Vọng</div></div>
      </div>
    </div>

    <div class="card-title" style="margin:14px 0 10px">🌳 Gia Phả Tộc ${surname}</div>
    <div class="dyn-tree-wrap">
      ${buildFamilyTree(surname)}
    </div>

    <div class="card-title" style="margin:14px 0 10px">📜 Triều Đại Sử</div>
    <div class="dyn-history-list">
      ${(d.history||[]).slice().reverse().map(h => `
        <div class="dyn-hist-item">
          <span class="dyn-hist-year">Năm ${h.year}</span>
          <span class="dyn-hist-text">${h.event}</span>
        </div>`).join("") || "<div style='color:var(--white-dim);font-size:12px;padding:12px'>Chưa có sử ký.</div>"}
    </div>
  `;

  if (scroll) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================
// PLAYER FIGHT BOSS (Manual)
// ============================

function playerFightBoss(bossIndex) {
  if (!player || player.status !== "alive") {
    toast("⚠️ Nhân vật chưa tạo hoặc đã tử vong!"); return;
  }
  if (!bosses[bossIndex]) { toast("⚠️ Boss không tồn tại!"); return; }
  const boss = bosses[bossIndex];

  const playerPower = (player.attack || 100) + (player.defense || 50) + player.realm * 150 + (player.luck || 50);
  const bossPower   = (boss.realm || 5) * 400 + (boss.maxHp || 5000) / 8;
  const winChance   = Math.min(0.92, Math.max(0.15, playerPower / (playerPower + bossPower)));

  const roll = Math.random();
  if (roll < winChance) {
    // Thắng
    boss.hp = 0;
    player.killCount = (player.killCount || 0) + 1;
    player.reputation = (player.reputation || 0) + 3000;
    if (!player.titles) player.titles = [];
    if (!player.titles.includes(TITLES_DEF.bossSlayer)) player.titles.push(TITLES_DEF.bossSlayer);

    // Loot
    const lootRarity = rand(boss.loot || ["uncommon"]);
    const allLoot = [...(ITEM_POOL||[]), ...(WEAPON_POOL||[]), ...(ARMOR_POOL||[]), ...(ARTIFACT_POOL||[])];
    const matching = allLoot.filter(i => i.rarity === lootRarity);
    if (matching.length) {
      const loot = rand(matching);
      const newLoot = { ...loot, id: `item_${Date.now()}` };
      if (!player.inventory) player.inventory = [];
      player.inventory.push(newLoot);
      if (loot.slot) autoEquipBestGear(player);
      addLog(`💎 ${player.name} nhận được [${loot.name}] từ Boss!`, "important");
    }
    if (typeof grantBossArtifact === "function") {
      try { grantBossArtifact(player, boss); } catch(e) {}
    }

    heavenPoints += (boss.realm || 5) * 30;
    player.biography = player.biography || [];
    player.biography.push({ year, event: `Đánh bại Boss ${boss.name}!` });
    addLog(`🏆 ${player.name} đã hạ gục Boss ${boss.name}!`, "important");
    addTimeline(`🏆 ${player.name} hạ ${boss.name}`, "important", "🏆");
    toast(`🏆 Bạn đã hạ Boss ${boss.name}!`);
    bosses.splice(bossIndex, 1);
  } else {
    // Thua
    const hpLoss = Math.floor((player.maxHp || 1000) * (0.25 + Math.random() * 0.35));
    player.hp = Math.max(1, (player.hp || 500) - hpLoss);
    addLog(`💔 ${player.name} thất bại trước Boss ${boss.name} (-${hpLoss} HP)`, "normal");
    toast(`💔 Thất bại! HP còn ${player.hp}/${player.maxHp}`);
  }

  save();
  renderBoss();
  renderPlayerPanel();
}
