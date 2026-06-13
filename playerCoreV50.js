(function() {
"use strict";
// ============================================================
// PLAYER CORE V50 — Creator God V6
// Kỷ Nguyên Người Chơi: Career Paths · Affiliation · World Impact · Multiverse Rep
// EXTENDS: playerEngine.js V28 · playerReputationEngine.js V28
// KHÔNG GHI ĐÈ bất kỳ hệ thống V28 nào
// ============================================================
const SAVE_KEY = "cgv6_player_core_v50";
const INIT_DELAY = 5800;

// ─── CAREER PATHS (10 tiers) ──────────────────────────────────
const CAREER_PATHS = [
  { id:"citizen",      tier:1,  name:"Thường Dân",          icon:"🚶", color:"#94a3b8",
    desc:"Bắt đầu hành trình trong thế giới.",
    req:{ fame:0,    wealth:0,      rank:1 },
    perks:["Quan sát thế giới","Gia nhập quốc gia"], unlocks:[] },
  { id:"explorer",     tier:2,  name:"Nhà Thám Hiểm",       icon:"🗺️", color:"#4ade80",
    desc:"Khám phá đất đai, bản đồ vùng đất mới.",
    req:{ fame:100,  wealth:200,    rank:2 },
    perks:["Khám phá lục địa","Tìm kho báu","XP khám phá +20%"], unlocks:["explore_action"] },
  { id:"merchant",     tier:3,  name:"Thương Nhân",          icon:"💰", color:"#fbbf24",
    desc:"Làm chủ thương trường, kiểm soát kinh tế.",
    req:{ fame:300,  wealth:1000,   rank:2 },
    perks:["Thiết lập tuyến thương mại","Độc quyền hàng hóa","Thu nhập +30%"], unlocks:["trade_action"] },
  { id:"hero",         tier:4,  name:"Anh Hùng",             icon:"⚔️", color:"#f87171",
    desc:"Chiến đấu cho chính nghĩa, bảo vệ thế giới.",
    req:{ fame:800,  wealth:500,    rank:3 },
    perks:["Thách đấu lãnh chúa","Diệt boss","Danh tiếng chiến đấu +50%"], unlocks:["combat_action"] },
  { id:"lord",         tier:5,  name:"Lãnh Chúa",            icon:"🏰", color:"#818cf8",
    desc:"Cai quản vùng lãnh địa, thu thuế, phát triển.",
    req:{ fame:2000, wealth:5000,   rank:4 },
    perks:["Thành lập làng→thành","Thu thuế","Lãnh địa +1"], unlocks:["found_nation"] },
  { id:"king",         tier:6,  name:"Vua",                   icon:"♟️", color:"#f59e0b",
    desc:"Thống trị vương quốc, ngoại giao, chiến tranh.",
    req:{ fame:5000, wealth:20000,  rank:5 },
    perks:["Thống nhất quốc gia","Tuyên chiến","Ký hiệp ước","Lập liên minh"], unlocks:["declare_war","sign_treaty"] },
  { id:"emperor",      tier:7,  name:"Hoàng Đế",             icon:"👑", color:"#f0abfc",
    desc:"Thiên tử, thống lĩnh nhiều vương quốc.",
    req:{ fame:15000,wealth:100000, rank:6 },
    perks:["Thiên tử quyền năng","Đế chế hóa lãnh thổ","Ngoại giao đa quốc"], unlocks:["found_empire"] },
  { id:"pope",         tier:8,  name:"Giáo Chủ",             icon:"⛪", color:"#38bdf8",
    desc:"Lãnh đạo tôn giáo, kiểm soát tín ngưỡng toàn cầu.",
    req:{ fame:20000,wealth:50000,  rank:6 },
    perks:["Phát động thánh chiến","Phong thánh NPC","Tôn giáo hóa quốc gia"], unlocks:["found_religion"] },
  { id:"deity",        tier:9,  name:"Thần Linh",             icon:"⭐", color:"#fde68a",
    desc:"Vượt qua cõi người, trở thành thần.",
    req:{ fame:50000,wealth:0,      rank:8 },
    perks:["Can thiệp thần thánh","Phước/Phạt","Tạo phép lạ","Thần giới"], unlocks:["divine_action"] },
  { id:"multiverse_lord",tier:10,name:"Chúa Tể Đa Vũ Trụ", icon:"🌌", color:"#c084fc",
    desc:"Thống trị nhiều vũ trụ, ý chí định đoạt vận mệnh.",
    req:{ fame:200000,wealth:0,     rank:10},
    perks:["Điều khiển vũ trụ","Sáng tạo thế giới","Liên kết đa chiều"], unlocks:["multiverse_action"] },
];

// ─── AFFILIATION TYPES ─────────────────────────────────────────
const AFFILIATION_TYPES = {
  nation:    { name:"Quốc Gia",   icon:"🏳️", color:"#4ade80"  },
  empire:    { name:"Đế Chế",     icon:"👑",  color:"#f59e0b"  },
  sect:      { name:"Tông Môn",   icon:"⛩️",  color:"#818cf8"  },
  religion:  { name:"Tôn Giáo",   icon:"⛪",  color:"#38bdf8"  },
  faction:   { name:"Phe Phái",   icon:"⚖️",  color:"#f87171"  },
  guild:     { name:"Bang Hội",   icon:"🛡️",  color:"#fbbf24"  },
  alliance:  { name:"Liên Minh",  icon:"🤝",  color:"#94a3b8"  },
};

// ─── WORLD IMPACT TYPES ───────────────────────────────────────
const IMPACT_TYPES = [
  { id:"wars_started",   name:"Chiến Tranh Khởi Xướng",   icon:"⚔️" },
  { id:"wars_ended",     name:"Chiến Tranh Kết Thúc",     icon:"🕊️" },
  { id:"govs_changed",   name:"Chính Phủ Đổi",            icon:"🏛️" },
  { id:"crises_resolved",name:"Khủng Hoảng Giải Quyết",   icon:"🔥" },
  { id:"disasters_aided",name:"Thiên Tai Cứu Trợ",        icon:"🌊" },
  { id:"npcs_helped",    name:"NPC Được Giúp Đỡ",         icon:"👥" },
  { id:"alliances_formed",name:"Liên Minh Thành Lập",     icon:"🤝" },
  { id:"universes_visited",name:"Vũ Trụ Đã Thăm",         icon:"🌌" },
  { id:"titles_earned",  name:"Danh Hiệu Đạt Được",       icon:"📜" },
  { id:"gold_circulated",name:"Vàng Lưu Thông",           icon:"💰" },
];

// ─── MULTIVERSE REPUTATION TIERS ──────────────────────────────
const MV_REP_TIERS = [
  { min:1000000, name:"Thiên Địa Chúa Tể",   icon:"🌌", color:"#c084fc" },
  { min:500000,  name:"Vũ Trụ Thần",          icon:"⭐", color:"#fde68a" },
  { min:100000,  name:"Đa Chiều Huyền Thoại", icon:"✨", color:"#f0abfc" },
  { min:50000,   name:"Thiên Hà Đệ Nhất",     icon:"👑", color:"#f59e0b" },
  { min:10000,   name:"Anh Hùng Nhiều Cõi",   icon:"🌟", color:"#4ade80" },
  { min:1000,    name:"Danh Trấn Liên Giới",  icon:"🌍", color:"#60a5fa" },
  { min:0,       name:"Vô Danh Tiểu Tốt",     icon:"❓", color:"#475569" },
];

// ─── STATE ────────────────────────────────────────────────────
window.playerCoreV50Data = {
  career: {
    currentTier: 1,
    currentId: "citizen",
    xp: 0,
    xpToNext: 100,
    history: [],
  },
  affiliations: {
    nation: null,
    empire: null,
    sect: null,
    religion: null,
    faction: null,
    guild: null,
    alliance: null,
  },
  founded: {
    nations: [],
    empires: [],
    sects: [],
    religions: [],
    guilds: [],
  },
  worldImpact: {
    wars_started: 0,
    wars_ended: 0,
    govs_changed: 0,
    crises_resolved: 0,
    disasters_aided: 0,
    npcs_helped: 0,
    alliances_formed: 0,
    universes_visited: 0,
    titles_earned: 0,
    gold_circulated: 0,
    totalScore: 0,
  },
  multiverseRep: 0,
  worldRep: 0,
  localRep: 0,
  actions: [],      // recent player actions affecting world
  log: [],
  tickCount: 0,
  initialized: false,
};

function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(window.playerCoreV50Data)); }catch(e){} }
function load(){ try{ const d=localStorage.getItem(SAVE_KEY); if(d) Object.assign(window.playerCoreV50Data, JSON.parse(d)); }catch(e){} }
function _rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function _log(msg, type){
  window.playerCoreV50Data.log.unshift({year:window.year||0, msg, type:type||"info"});
  if(window.playerCoreV50Data.log.length > 200) window.playerCoreV50Data.log.pop();
}

// ─── CAREER PROGRESSION ───────────────────────────────────────
function checkCareerAdvance(){
  const d = window.playerCoreV50Data;
  const v28 = window.playerV28Data || {};
  const repData = window.playerRepData || {};
  const currentTier = d.career.currentTier;
  if(currentTier >= 10) return;

  const nextPath = CAREER_PATHS[currentTier]; // tier is 1-indexed, array 0-indexed
  if(!nextPath) return;

  const req = nextPath.req;
  const playerFame = (v28.fame||0) + (repData.fame||0);
  const playerWealth = v28.wealth || 0;
  const playerRank = v28.rankLevel || 1;

  if(playerFame >= req.fame && playerWealth >= req.wealth && playerRank >= req.rank){
    d.career.currentTier = nextPath.tier;
    d.career.currentId = nextPath.id;
    d.career.history.push({ year: window.year||0, tier: nextPath.tier, name: nextPath.name, icon: nextPath.icon });

    // Multiverse rep bonus on career advance
    d.multiverseRep += nextPath.tier * 1000;
    d.worldRep += nextPath.tier * 500;

    _log(`🌟 THĂNG TIẾN! ${v28.name||"Người Chơi"} trở thành ${nextPath.icon} ${nextPath.name}!`, "career");
    if(typeof window.htAddEvent === "function")
      window.htAddEvent({year:window.year||0, type:"player", title:`Người Chơi đạt danh hiệu: ${nextPath.name}`, color:nextPath.color});
    if(typeof window.wmeAddMemory === "function")
      window.wmeAddMemory({year:window.year||0, category:"player", title:`${nextPath.icon} ${nextPath.name}`, content:`${v28.name||"Người Chơi"} đã tiến đến bậc ${nextPath.name} trong hành trình của mình.`});
  }
}

// ─── AFFILIATION SYSTEM ───────────────────────────────────────
window.pv50JoinAffiliation = function(type, name){
  if(!AFFILIATION_TYPES[type]) return;
  window.playerCoreV50Data.affiliations[type] = { name, joined: window.year||0 };
  _log(`🔗 Gia nhập ${AFFILIATION_TYPES[type].name}: ${name}`, "affiliation");
  window.playerCoreV50Data.worldImpact.alliances_formed++;
  updateImpactScore();
};

window.pv50LeaveAffiliation = function(type){
  if(!AFFILIATION_TYPES[type]) return;
  const aff = window.playerCoreV50Data.affiliations[type];
  if(!aff) return;
  _log(`❌ Rời khỏi ${AFFILIATION_TYPES[type].name}: ${aff.name}`, "affiliation");
  window.playerCoreV50Data.affiliations[type] = null;
};

window.pv50FoundEntity = function(type, name){
  const d = window.playerCoreV50Data;
  const career = CAREER_PATHS[d.career.currentTier - 1];
  if(!career || !career.unlocks.includes("found_" + type)) {
    return { success:false, reason:"Chưa đạt đủ cấp bậc" };
  }
  const entity = { name, founded: window.year||0, type };
  if(!d.founded[type + "s"]) d.founded[type + "s"] = [];
  d.founded[type + "s"].push(entity);
  d.affiliations[type] = { name, joined: window.year||0 };
  d.worldImpact.alliances_formed++;
  updateImpactScore();
  _log(`⚡ Thành lập ${type}: ${name}!`, "founded");
  if(typeof window.htAddEvent === "function")
    window.htAddEvent({year:window.year||0, type:"player", title:`Người Chơi lập ${type}: ${name}`, color:"#fbbf24"});
  return { success:true };
};

// ─── WORLD IMPACT ─────────────────────────────────────────────
window.pv50AddImpact = function(type, amount){
  const d = window.playerCoreV50Data;
  if(d.worldImpact[type] !== undefined){
    d.worldImpact[type] += amount || 1;
    d.worldRep += (amount||1) * 10;
    d.multiverseRep += (amount||1) * 5;
    updateImpactScore();
  }
};

function updateImpactScore(){
  const d = window.playerCoreV50Data;
  const wi = d.worldImpact;
  d.worldImpact.totalScore =
    wi.wars_started * 50 + wi.wars_ended * 100 + wi.govs_changed * 80 +
    wi.crises_resolved * 150 + wi.disasters_aided * 120 + wi.npcs_helped * 20 +
    wi.alliances_formed * 60 + wi.universes_visited * 200 + wi.titles_earned * 40 +
    Math.floor(wi.gold_circulated / 100);
}

// ─── MULTIVERSE REP TIER ──────────────────────────────────────
window.pv50GetMvRepTier = function(){
  const rep = window.playerCoreV50Data.multiverseRep;
  return MV_REP_TIERS.find(t => rep >= t.min) || MV_REP_TIERS[MV_REP_TIERS.length - 1];
};

window.pv50GetCareer = function(){ return CAREER_PATHS[window.playerCoreV50Data.career.currentTier - 1] || CAREER_PATHS[0]; };
window.pv50GetAllCareers = function(){ return CAREER_PATHS; };
window.pv50GetAffiliations = function(){ return window.playerCoreV50Data.affiliations; };
window.pv50GetFounded = function(){ return window.playerCoreV50Data.founded; };
window.pv50GetWorldImpact = function(){ return window.playerCoreV50Data.worldImpact; };
window.pv50GetLog = function(){ return window.playerCoreV50Data.log; };
window.pv50GetData = function(){ return window.playerCoreV50Data; };
window.pv50GetImpactTypes = function(){ return IMPACT_TYPES; };
window.pv50GetAffiliationTypes = function(){ return AFFILIATION_TYPES; };

// ─── AUTO SYNC AFFILIATIONS FROM WORLD STATE ──────────────────
function autoSyncAffiliations(){
  const d = window.playerCoreV50Data;
  const v28 = window.playerV28Data || {};
  // Sync nation from playerV28Data
  if(v28.faction && !d.affiliations.nation){
    d.affiliations.nation = { name: v28.faction, joined: window.year||0 };
  }
  // Sync kingdom/empire from territory data
  if(typeof window.playerTerritoryData !== "undefined"){
    const td = window.playerTerritoryData;
    if(td.playerKingdom && !d.affiliations.nation){
      d.affiliations.nation = { name: td.playerKingdom, joined: window.year||0 };
    }
    if(td.playerEmpire && !d.affiliations.empire){
      d.affiliations.empire = { name: td.playerEmpire, joined: window.year||0 };
    }
  }
  // Sync V49 faction
  if(typeof window.govV49Data !== "undefined" && v28.faction){
    const entityData = typeof window.facV49GetEntity === "function" ? window.facV49GetEntity(v28.faction) : null;
    if(entityData && !d.affiliations.faction){
      d.affiliations.faction = { name: entityData.dominantFaction + " Phe", joined: window.year||0 };
    }
  }
}

// ─── AUTO DETECT WORLD EVENTS ────────────────────────────────
function detectWorldImpact(){
  const d = window.playerCoreV50Data;
  const v28 = window.playerV28Data || {};
  if(!v28.id) return;

  // Detect wars
  if(typeof window.warsActive !== "undefined" && window.warsActive){
    const warCount = window.warsActive.length;
    if(warCount > 0) {
      // passive world-rep from ongoing wars
      d.worldRep += 1;
    }
  }
  // Detect active crises
  if(typeof window.criV49GetActive === "function"){
    const crises = window.criV49GetActive();
    if(crises.length > 0){
      d.worldRep += crises.length;
    }
  }
  // Universe visits
  if(typeof window.multiverseEngine !== "undefined" || typeof window.universeManager !== "undefined"){
    if(d.tickCount % 100 === 0 && Math.random() < 0.1){
      d.worldImpact.universes_visited++;
      d.multiverseRep += 50;
      updateImpactScore();
    }
  }
  // Gold tracking
  if(v28.wealth && d.tickCount % 20 === 0){
    d.worldImpact.gold_circulated += Math.floor((v28.wealth||0) * 0.01);
    updateImpactScore();
  }
}

// ─── TICK ─────────────────────────────────────────────────────
function tick(){
  const d = window.playerCoreV50Data;
  d.tickCount++;

  // Sync affiliations every 30 ticks
  if(d.tickCount % 30 === 0) autoSyncAffiliations();

  // Check career advance every 50 ticks
  if(d.tickCount % 50 === 0) checkCareerAdvance();

  // Detect world impact every 20 ticks
  if(d.tickCount % 20 === 0) detectWorldImpact();

  // Decay world rep slightly
  if(d.tickCount % 100 === 0 && d.worldRep > 0){
    d.worldRep = Math.max(0, d.worldRep - 1);
  }

  if(d.tickCount % 50 === 0) save();
}

// ─── INIT ─────────────────────────────────────────────────────
function init(){
  load();
  const _orig = window.gameTick;
  window.gameTick = function(){ if(_orig) _orig(); tick(); };
  window.playerCoreV50Data.initialized = true;
  console.log("[PlayerCoreV50] 🌟 Kỷ Nguyên Người Chơi V50 — Career Paths · Affiliation · World Impact · Multiverse Rep sẵn sàng.");
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
