(function() {
"use strict";
// ============================================================
// PLAYER ACHIEVEMENT V50 — Creator God V6
// Thành Tựu V2: 40+ Achievements · 6 Categories · Auto-check · Rewards
// EXTENDS: playerRepData · playerV28Data · playerCoreV50Data
// KHÔNG GHI ĐÈ bất kỳ hệ thống cũ nào
// ============================================================
const SAVE_KEY = "cgv6_achievement_v50";
const INIT_DELAY = 6000;

// ─── ACHIEVEMENT DEFINITIONS (40 thành tựu) ──────────────────
const ACHIEVEMENTS = [
  // ═══ KHỞI ĐẦU ════════════════════════════════════════════
  { id:"first_breath",   cat:"start",    name:"Hơi Thở Đầu Tiên",     icon:"🌱", color:"#4ade80",  rare:"common",
    desc:"Tạo nhân vật lần đầu tiên.",
    check:()=> !!(window.playerV28Data && window.playerV28Data.id),
    reward:{ xp:50, fame:10 } },
  { id:"first_year",     cat:"start",    name:"Năm Đầu Tiên",          icon:"📅", color:"#4ade80",  rare:"common",
    desc:"Sống sót qua 1 năm đầu.",
    check:()=> (window.year||0) >= 1,
    reward:{ xp:100, fame:20 } },
  { id:"career_start",   cat:"start",    name:"Bước Đầu Tiên",         icon:"🚶", color:"#60a5fa",  rare:"common",
    desc:"Chọn nghề nghiệp đầu tiên.",
    check:()=> !!(window.professionV50Data && window.professionV50Data.currentProfession),
    reward:{ xp:100, fame:30 } },
  { id:"world_created",  cat:"start",    name:"Thế Giới Mới Nở",       icon:"🌍", color:"#4ade80",  rare:"common",
    desc:"Thế giới được tạo ra.",
    check:()=> !!(window.world),
    reward:{ xp:50, fame:5 } },

  // ═══ KHÁM PHÁ ════════════════════════════════════════════
  { id:"explorer_100",   cat:"explore",  name:"Nhà Thám Hiểm",          icon:"🗺️", color:"#fbbf24",  rare:"uncommon",
    desc:"Đạt cấp bậc Nhà Thám Hiểm.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 2),
    reward:{ xp:200, fame:100 } },
  { id:"continent_walk", cat:"explore",  name:"Khắp Nơi Đặt Chân",     icon:"🌐", color:"#fbbf24",  rare:"uncommon",
    desc:"Impact score vượt 500.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.totalScore >= 500),
    reward:{ xp:300, fame:150 } },
  { id:"universe_visit", cat:"explore",  name:"Du Hành Vũ Trụ",         icon:"🌌", color:"#c084fc",  rare:"rare",
    desc:"Thăm ít nhất 3 vũ trụ.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.universes_visited >= 3),
    reward:{ xp:500, fame:300 } },
  { id:"multiverse_lord",cat:"explore",  name:"Chúa Tể Đa Vũ Trụ",    icon:"✨", color:"#c084fc",  rare:"legendary",
    desc:"Đạt career tier 10.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 10),
    reward:{ xp:5000, fame:3000 } },

  // ═══ CHINH PHỤC ══════════════════════════════════════════
  { id:"first_war",      cat:"conquest", name:"Chiến Binh Nhập Trận",   icon:"⚔️", color:"#f87171",  rare:"common",
    desc:"Trải qua 1 cuộc chiến tranh.",
    check:()=> ((window.playerV28Data && window.playerV28Data.warHistory && window.playerV28Data.warHistory.length >= 1) || (window.warsActive && window.warsActive.length >= 1)),
    reward:{ xp:150, fame:80 } },
  { id:"war_5",          cat:"conquest", name:"Chiến Thần",             icon:"🏴", color:"#f87171",  rare:"uncommon",
    desc:"Tham gia 5 cuộc chiến tranh.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.wars_started >= 5),
    reward:{ xp:500, fame:300 } },
  { id:"lord_title",     cat:"conquest", name:"Lãnh Chúa Quyền Uy",    icon:"🏰", color:"#818cf8",  rare:"rare",
    desc:"Đạt career tier Lãnh Chúa.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 5),
    reward:{ xp:1000, fame:600 } },
  { id:"king_title",     cat:"conquest", name:"Vương Quyền Tối Cao",   icon:"♟️", color:"#f59e0b",  rare:"epic",
    desc:"Đạt career tier Vua.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 6),
    reward:{ xp:2000, fame:1200 } },
  { id:"emperor_title",  cat:"conquest", name:"Hoàng Đế Vô Song",      icon:"👑", color:"#f0abfc",  rare:"legendary",
    desc:"Đạt career tier Hoàng Đế.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 7),
    reward:{ xp:5000, fame:3000 } },
  { id:"crisis_solver",  cat:"conquest", name:"Người Giải Khủng Hoảng", icon:"🔥", color:"#f87171",  rare:"rare",
    desc:"Giải quyết 5 khủng hoảng chính trị.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.crises_resolved >= 5),
    reward:{ xp:800, fame:500 } },

  // ═══ KINH TẾ ════════════════════════════════════════════
  { id:"first_gold",     cat:"economy",  name:"Vàng Đầu Tiên",          icon:"💰", color:"#fbbf24",  rare:"common",
    desc:"Tích lũy 1000 vàng.",
    check:()=> (window.playerV28Data && (window.playerV28Data.wealth||0) >= 1000),
    reward:{ xp:100, fame:20 } },
  { id:"rich",           cat:"economy",  name:"Đại Phú Hào",            icon:"💎", color:"#fbbf24",  rare:"uncommon",
    desc:"Tích lũy 50,000 vàng.",
    check:()=> (window.playerV28Data && (window.playerV28Data.wealth||0) >= 50000),
    reward:{ xp:500, fame:100 } },
  { id:"tycoon",         cat:"economy",  name:"Vua Thương Trường",      icon:"🏦", color:"#fbbf24",  rare:"rare",
    desc:"Tích lũy 500,000 vàng.",
    check:()=> (window.playerV28Data && (window.playerV28Data.wealth||0) >= 500000),
    reward:{ xp:2000, fame:500 } },
  { id:"trade_master",   cat:"economy",  name:"Thương Nhân Đại Tài",    icon:"🌐", color:"#fbbf24",  rare:"rare",
    desc:"Gold circulated vượt 100,000.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.gold_circulated >= 100000),
    reward:{ xp:1500, fame:400 } },
  { id:"profession_master",cat:"economy",name:"Bậc Thầy Nghề Nghiệp",  icon:"⚒️", color:"#fb923c",  rare:"epic",
    desc:"Mở khoá tất cả 4 kỹ năng của 1 nghề.",
    check:()=>{
      if(!window.professionV50Data) return false;
      return Object.values(window.professionV50Data.professions).some(pd=>(pd.unlockedSkills||[]).length >= 4);
    },
    reward:{ xp:3000, fame:800 } },

  // ═══ CHÍNH TRỊ ══════════════════════════════════════════
  { id:"first_join",     cat:"politics", name:"Nhập Hội",               icon:"🔗", color:"#818cf8",  rare:"common",
    desc:"Gia nhập 1 tổ chức.",
    check:()=>{
      if(!window.playerCoreV50Data) return false;
      const aff = window.playerCoreV50Data.affiliations;
      return Object.values(aff).some(a => a !== null);
    },
    reward:{ xp:100, fame:30 } },
  { id:"all_affiliations",cat:"politics",name:"Người Của Mọi Phía",    icon:"🌐", color:"#818cf8",  rare:"epic",
    desc:"Gia nhập ≥5 tổ chức khác nhau.",
    check:()=>{
      if(!window.playerCoreV50Data) return false;
      const aff = window.playerCoreV50Data.affiliations;
      return Object.values(aff).filter(a => a !== null).length >= 5;
    },
    reward:{ xp:3000, fame:1000 } },
  { id:"founded_nation",  cat:"politics", name:"Khai Quốc",             icon:"🏳️", color:"#4ade80",  rare:"epic",
    desc:"Thành lập quốc gia riêng.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.founded.nations && window.playerCoreV50Data.founded.nations.length >= 1),
    reward:{ xp:2000, fame:1500 } },
  { id:"founded_empire",  cat:"politics", name:"Khai Đế",               icon:"👑", color:"#f59e0b",  rare:"legendary",
    desc:"Thành lập đế chế riêng.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.founded.empires && window.playerCoreV50Data.founded.empires.length >= 1),
    reward:{ xp:5000, fame:3000 } },
  { id:"diplomat",        cat:"politics", name:"Nhà Ngoại Giao",        icon:"🤝", color:"#818cf8",  rare:"uncommon",
    desc:"Thành lập 3 liên minh.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.alliances_formed >= 3),
    reward:{ xp:400, fame:200 } },
  { id:"gov_changer",     cat:"politics", name:"Kẻ Thay Đổi Thể Chế",  icon:"🏛️", color:"#818cf8",  rare:"rare",
    desc:"Tác động 5 lần thay đổi chính phủ.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.govs_changed >= 5),
    reward:{ xp:1000, fame:600 } },
  { id:"peacemaker",      cat:"politics", name:"Sứ Giả Hòa Bình",      icon:"🕊️", color:"#4ade80",  rare:"rare",
    desc:"Kết thúc 3 cuộc chiến tranh.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.wars_ended >= 3),
    reward:{ xp:800, fame:500 } },

  // ═══ THẦN THÁNH ══════════════════════════════════════════
  { id:"divine_touch",   cat:"divine",   name:"Chạm Đến Thần Thánh",   icon:"⭐", color:"#fde68a",  rare:"rare",
    desc:"Đạt career tier Thần Linh.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.career.currentTier >= 9),
    reward:{ xp:10000, fame:5000 } },
  { id:"disaster_hero",  cat:"divine",   name:"Anh Hùng Thiên Tai",    icon:"🌊", color:"#38bdf8",  rare:"rare",
    desc:"Giúp đỡ trong 5 thiên tai.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.disasters_aided >= 5),
    reward:{ xp:2000, fame:1000 } },
  { id:"npc_savior",     cat:"divine",   name:"Cứu Tinh",              icon:"👼", color:"#4ade80",  rare:"uncommon",
    desc:"Giúp đỡ 20 NPC.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.npcs_helped >= 20),
    reward:{ xp:500, fame:300 } },
  { id:"high_reputation",cat:"divine",   name:"Thiên Hạ Vô Song",     icon:"🌟", color:"#fde68a",  rare:"epic",
    desc:"Đạt Multiverse Rep 50,000.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.multiverseRep >= 50000),
    reward:{ xp:5000, fame:3000 } },
  { id:"history_maker",  cat:"divine",   name:"Người Tạo Lịch Sử",    icon:"📜", color:"#60a5fa",  rare:"epic",
    desc:"World Impact Score vượt 10,000.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.totalScore >= 10000),
    reward:{ xp:5000, fame:3000 } },
  { id:"founded_sect",   cat:"divine",   name:"Khai Tông",             icon:"⛩️", color:"#818cf8",  rare:"rare",
    desc:"Thành lập tông môn riêng.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.founded.sects && window.playerCoreV50Data.founded.sects.length >= 1),
    reward:{ xp:2000, fame:1000 } },

  // ═══ ĐA VŨ TRỤ ══════════════════════════════════════════
  { id:"mv_reputation",  cat:"multiverse",name:"Danh Vang Nhiều Cõi",   icon:"🌌", color:"#c084fc",  rare:"epic",
    desc:"Multiverse Rep vượt 10,000.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.multiverseRep >= 10000),
    reward:{ xp:3000, fame:2000 } },
  { id:"mv_lord",        cat:"multiverse",name:"Chúa Tể Đa Chiều",      icon:"♾️", color:"#c084fc",  rare:"legendary",
    desc:"Thăm 10 vũ trụ khác nhau.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.universes_visited >= 10),
    reward:{ xp:10000, fame:5000 } },
  { id:"impact_legend",  cat:"multiverse",name:"Huyền Thoại Sống",      icon:"⭐", color:"#fde68a",  rare:"legendary",
    desc:"World Impact Score vượt 50,000.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.totalScore >= 50000),
    reward:{ xp:20000, fame:10000 } },
  { id:"titles_collector",cat:"multiverse",name:"Sưu Tầm Danh Hiệu",   icon:"📜", color:"#60a5fa",  rare:"rare",
    desc:"Đạt 10 danh hiệu.",
    check:()=> (window.playerCoreV50Data && window.playerCoreV50Data.worldImpact.titles_earned >= 10),
    reward:{ xp:1000, fame:500 } },
  { id:"all_professions",cat:"multiverse",name:"Bách Nghệ Chi Tôn",    icon:"🎭", color:"#f0abfc",  rare:"legendary",
    desc:"Thử nghiệm tất cả 7 nghề nghiệp.",
    check:()=>{
      if(!window.professionV50Data) return false;
      return Object.keys(window.professionV50Data.professions).length >= 7;
    },
    reward:{ xp:10000, fame:5000 } },
  { id:"total_master",   cat:"multiverse",name:"Toàn Năng Chi Vương",   icon:"🌌", color:"#c084fc",  rare:"legendary",
    desc:"Hoàn thành 30 thành tựu.",
    check:()=> (window.achievementV50Data && window.achievementV50Data.unlocked.length >= 30),
    reward:{ xp:50000, fame:20000 } },
];

const CATEGORIES = {
  start:     { name:"Khởi Đầu",   icon:"🌱", color:"#4ade80"  },
  explore:   { name:"Khám Phá",   icon:"🗺️", color:"#fbbf24"  },
  conquest:  { name:"Chinh Phục", icon:"⚔️", color:"#f87171"  },
  economy:   { name:"Kinh Tế",    icon:"💰", color:"#fbbf24"  },
  politics:  { name:"Chính Trị",  icon:"🏛️", color:"#818cf8"  },
  divine:    { name:"Thần Thánh", icon:"⭐", color:"#fde68a"  },
  multiverse:{ name:"Đa Vũ Trụ", icon:"🌌", color:"#c084fc"  },
};

// ─── STATE ────────────────────────────────────────────────────
window.achievementV50Data = {
  unlocked: [],   // [{ id, year, reward }]
  points: 0,
  tickCount: 0,
  initialized: false,
};

function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(window.achievementV50Data)); }catch(e){} }
function load(){ try{ const d=localStorage.getItem(SAVE_KEY); if(d) Object.assign(window.achievementV50Data, JSON.parse(d)); }catch(e){} }

function unlockAchievement(ach){
  const d = window.achievementV50Data;
  if(d.unlocked.find(u => u.id === ach.id)) return; // Already unlocked

  d.unlocked.push({ id: ach.id, year: window.year||0, reward: ach.reward });
  d.points += ach.reward.xp || 0;

  // Apply reward
  if(ach.reward.xp && typeof window.playerAddXP === "function") window.playerAddXP(ach.reward.xp, "achievement");
  if(ach.reward.fame && typeof window.playerAddFame === "function") window.playerAddFame(ach.reward.fame);

  // Track title
  if(typeof window.pv50AddImpact === "function") window.pv50AddImpact("titles_earned", 1);

  // Timeline + Memory
  if(typeof window.htAddEvent === "function")
    window.htAddEvent({year:window.year||0, type:"player", title:`🏆 Thành Tựu: ${ach.name}`, color:ach.color});
  if(typeof window.wmeAddMemory === "function")
    window.wmeAddMemory({year:window.year||0, category:"player", title:`Thành Tựu: ${ach.name}`, content:ach.desc});

  console.log(`[AchievementV50] 🏆 ${ach.icon} ${ach.name} — Mở khoá!`);
}

function checkAll(){
  ACHIEVEMENTS.forEach(ach => {
    if(window.achievementV50Data.unlocked.find(u => u.id === ach.id)) return;
    try { if(ach.check()) unlockAchievement(ach); } catch(e){}
  });
}

// ─── GET FUNCTIONS ────────────────────────────────────────────
window.ach50GetAll = function(){ return ACHIEVEMENTS; };
window.ach50GetUnlocked = function(){ return window.achievementV50Data.unlocked; };
window.ach50GetByCategory = function(cat){ return ACHIEVEMENTS.filter(a => a.cat === cat); };
window.ach50GetCategories = function(){ return CATEGORIES; };
window.ach50GetStats = function(){
  const d = window.achievementV50Data;
  const total = ACHIEVEMENTS.length;
  const unlocked = d.unlocked.length;
  const byCat = {};
  Object.keys(CATEGORIES).forEach(c => {
    const catAchs = ACHIEVEMENTS.filter(a => a.cat === c);
    const catUnlocked = catAchs.filter(a => d.unlocked.find(u => u.id === a.id));
    byCat[c] = { total: catAchs.length, unlocked: catUnlocked.length };
  });
  return { total, unlocked, percent: Math.floor(unlocked/total*100), points: d.points, byCat };
};
window.ach50GetPoints = function(){ return window.achievementV50Data.points; };

// ─── TICK ─────────────────────────────────────────────────────
function tick(){
  const d = window.achievementV50Data;
  d.tickCount++;
  // Check achievements every 25 ticks
  if(d.tickCount % 25 === 0) checkAll();
  if(d.tickCount % 100 === 0) save();
}

// ─── INIT ─────────────────────────────────────────────────────
function init(){
  load();
  const _orig = window.gameTick;
  window.gameTick = function(){ if(_orig) _orig(); tick(); };
  window.achievementV50Data.initialized = true;
  // Check on startup
  setTimeout(checkAll, 2000);
  console.log(`[PlayerAchievementV50] 🏆 Thành Tựu V50 — ${ACHIEVEMENTS.length} thành tựu · 7 danh mục · Auto-check sẵn sàng.`);
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
