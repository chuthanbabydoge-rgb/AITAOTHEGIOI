(function() {
"use strict";
// ============================================================
// PROFESSION SYSTEM V50 — Creator God V6
// 7 Nghề Nghiệp · Skill Trees · Profession Actions · XP
// KHÔNG GHI ĐÈ bất kỳ hệ thống cũ nào
// ============================================================
const SAVE_KEY = "cgv6_profession_v50";
const INIT_DELAY = 5900;

// ─── PROFESSIONS (7 loại) ─────────────────────────────────────
const PROFESSIONS = [
  {
    id:"warrior", name:"Chiến Binh", icon:"⚔️", color:"#f87171",
    desc:"Thành thạo chiến đấu, chỉ huy quân đội, bảo vệ thế giới.",
    statBonus:{ power:30, fame:20, wealth:-5 },
    skills:[
      { id:"basic_combat",    name:"Chiến Đấu Cơ Bản",   icon:"⚔️", req:0,    effect:"Sức mạnh chiến đấu +10%" },
      { id:"battle_tactics",  name:"Chiến Thuật Đánh Trận",icon:"🎯", req:100,  effect:"Phản công +20%, Phòng thủ +15%" },
      { id:"war_command",     name:"Chỉ Huy Chiến Tranh", icon:"🏴", req:500,  effect:"Quân đội đồng minh +1000 binh" },
      { id:"legend_warrior",  name:"Huyền Thoại Chiến Binh",icon:"🌟",req:2000, effect:"Danh tiếng chiến đấu x3, Boss không tấn công" },
    ],
    actions:[
      { id:"patrol",    name:"Tuần Tra Biên Giới", cost:0,   reward:{ xp:10, fame:5 },   cooldown:5,  desc:"Bảo vệ lãnh thổ" },
      { id:"challenge", name:"Thách Đấu Lãnh Chúa", cost:100, reward:{ xp:200,fame:100 }, cooldown:30, desc:"Tỉ thí với lãnh chúa" },
      { id:"siege",     name:"Công Thành",          cost:500, reward:{ xp:500,fame:300 }, cooldown:100,desc:"Tấn công thành trì" },
    ]
  },
  {
    id:"mage", name:"Pháp Sư", icon:"🔮", color:"#c084fc",
    desc:"Nghiên cứu phép thuật, kiểm soát nguyên tố, triệu hồi.",
    statBonus:{ power:10, fame:30, wealth:0 },
    skills:[
      { id:"arcane_basics",   name:"Phép Thuật Cơ Bản",   icon:"✨", req:0,    effect:"Kỹ năng phép thuật +15%" },
      { id:"elemental",       name:"Kiểm Soát Nguyên Tố", icon:"🌊", req:100,  effect:"Tạo thiên tai nhỏ (10% chance/tick)" },
      { id:"summoning",       name:"Triệu Hồi",            icon:"👾", req:500,  effect:"Triệu hồi sinh vật hỗ trợ chiến đấu" },
      { id:"archmage",        name:"Đại Pháp Sư",          icon:"🌌", req:2000, effect:"Phép thuật ảnh hưởng toàn thế giới" },
    ],
    actions:[
      { id:"study",    name:"Nghiên Cứu Phép Thuật", cost:0,   reward:{ xp:15, fame:3 },   cooldown:3,  desc:"Học phép thuật mới" },
      { id:"enchant",  name:"Phong Ấn Vật Phẩm",     cost:200, reward:{ xp:100,fame:50 },  cooldown:20, desc:"Tạo đồ phong ấn" },
      { id:"ritual",   name:"Đại Pháp Thuật",         cost:1000,reward:{ xp:800,fame:500 }, cooldown:150,desc:"Nghi lễ phép thuật quy mô lớn" },
    ]
  },
  {
    id:"scholar", name:"Học Giả", icon:"📚", color:"#60a5fa",
    desc:"Thu thập tri thức, viết sử, phát triển công nghệ.",
    statBonus:{ power:-5, fame:25, wealth:15 },
    skills:[
      { id:"research",      name:"Nghiên Cứu",          icon:"🔬", req:0,    effect:"XP nhận +20% từ mọi nguồn" },
      { id:"history",       name:"Sử Học",               icon:"📜", req:100,  effect:"Biết trước 3 sự kiện tương lai" },
      { id:"technology",    name:"Phát Triển Công Nghệ", icon:"⚙️", req:500,  effect:"Công nghệ thế giới +1 cấp" },
      { id:"grand_scholar", name:"Học Giả Vĩ Đại",       icon:"🌟", req:2000, effect:"Lưu danh sử sách 1000 năm" },
    ],
    actions:[
      { id:"write",    name:"Viết Sách",         cost:0,   reward:{ xp:20, fame:10 },  cooldown:5,  desc:"Ghi chép lịch sử" },
      { id:"discover", name:"Khám Phá Bí Ẩn",    cost:100, reward:{ xp:150,fame:80 },  cooldown:25, desc:"Giải mã cổ vật" },
      { id:"innovate", name:"Phát Minh",          cost:500, reward:{ xp:500,fame:300 }, cooldown:80, desc:"Tạo ra công nghệ mới" },
    ]
  },
  {
    id:"merchant", name:"Thương Nhân", icon:"💰", color:"#fbbf24",
    desc:"Kiểm soát kinh tế, buôn bán khắp thiên hạ.",
    statBonus:{ power:-10, fame:15, wealth:50 },
    skills:[
      { id:"trade_basics",  name:"Buôn Bán Cơ Bản",   icon:"💼", req:0,    effect:"Thu nhập thụ động +20%" },
      { id:"trade_routes",  name:"Tuyến Thương Mại",   icon:"🗺️", req:100,  effect:"Thu nhập đường xa +30%" },
      { id:"monopoly",      name:"Độc Quyền",           icon:"🏦", req:500,  effect:"Kiểm soát 1 loại hàng hóa" },
      { id:"trade_empire",  name:"Đế Chế Thương Mại",  icon:"🌐", req:2000, effect:"Thu nhập x5, ảnh hưởng kinh tế toàn cầu" },
    ],
    actions:[
      { id:"trade",    name:"Giao Dịch",         cost:50,  reward:{ xp:10, wealth:100 }, cooldown:2,  desc:"Buôn bán thông thường" },
      { id:"invest",   name:"Đầu Tư",             cost:500, reward:{ xp:50, wealth:800 }, cooldown:15, desc:"Đầu tư vào cơ sở hạ tầng" },
      { id:"cornering",name:"Thao Túng Thị Trường",cost:2000,reward:{ xp:200,wealth:5000},cooldown:60, desc:"Kiểm soát giá thị trường" },
    ]
  },
  {
    id:"blacksmith", name:"Thợ Rèn", icon:"🔨", color:"#fb923c",
    desc:"Rèn vũ khí huyền thoại, nâng cấp trang bị, cung ứng quân đội.",
    statBonus:{ power:20, fame:10, wealth:20 },
    skills:[
      { id:"forging",      name:"Rèn Đúc Cơ Bản",   icon:"🔨", req:0,    effect:"Rèn vũ khí thông thường" },
      { id:"mastercraft",  name:"Tuyệt Kỹ Thợ Rèn", icon:"⚒️", req:100,  effect:"Vũ khí +25% hiệu quả" },
      { id:"divine_forge", name:"Thần Lò Rèn",        icon:"🔥", req:500,  effect:"Rèn thần khí (legendary)" },
      { id:"legendary_smith",name:"Thợ Rèn Huyền Thoại",icon:"🌟",req:2000,effect:"Vũ khí của bạn được cả thế giới tìm kiếm" },
    ],
    actions:[
      { id:"forge_basic",  name:"Rèn Vũ Khí",     cost:50,  reward:{ xp:20, wealth:80 },  cooldown:3,  desc:"Rèn vũ khí thông thường" },
      { id:"forge_rare",   name:"Rèn Đồ Hiếm",    cost:300, reward:{ xp:100,wealth:500 },  cooldown:20, desc:"Rèn trang bị cấp hiếm" },
      { id:"forge_divine", name:"Rèn Thần Khí",   cost:2000,reward:{ xp:1000,wealth:5000}, cooldown:200,desc:"Rèn vũ khí thần thánh" },
    ]
  },
  {
    id:"monk", name:"Tu Sĩ", icon:"🧘", color:"#4ade80",
    desc:"Tu luyện nội tâm, đạt giác ngộ, chữa lành thế giới.",
    statBonus:{ power:5, fame:20, wealth:-10 },
    skills:[
      { id:"meditation",   name:"Thiền Định",         icon:"🧘", req:0,    effect:"XP tu luyện +25%" },
      { id:"healing",      name:"Chữa Lành",           icon:"💚", req:100,  effect:"Hồi phục NPC bị thương" },
      { id:"enlighten",    name:"Giác Ngộ",             icon:"☀️", req:500,  effect:"Giảm khủng hoảng 50% chance" },
      { id:"nirvana",      name:"Niết Bàn",             icon:"🌸", req:2000, effect:"Bất tử trong combat, danh tiếng thần thánh" },
    ],
    actions:[
      { id:"meditate",  name:"Thiền Định",         cost:0,    reward:{ xp:25, fame:5 },    cooldown:3,  desc:"Tu luyện nội tâm" },
      { id:"heal_npc",  name:"Chữa Lành NPC",      cost:0,    reward:{ xp:50, fame:20 },   cooldown:10, desc:"Chữa trị NPC bị thương" },
      { id:"pilgrimage",name:"Hành Hương",          cost:0,    reward:{ xp:200,fame:100 },  cooldown:50, desc:"Hành hương đến thánh địa" },
    ]
  },
  {
    id:"priest", name:"Thần Quan", icon:"⛪", color:"#38bdf8",
    desc:"Phục vụ thần linh, cai quản tôn giáo, phán xét thiên hạ.",
    statBonus:{ power:0, fame:40, wealth:10 },
    skills:[
      { id:"prayer",       name:"Cầu Nguyện",         icon:"🙏", req:0,    effect:"Heaven Points +5/tick" },
      { id:"divine_favor", name:"Ân Sủng Thần Linh",  icon:"✨", req:100,  effect:"Phép thuật thần thánh mạnh hơn 30%" },
      { id:"inquisition",  name:"Dị Giáo Phán Xét",   icon:"⚖️", req:500,  effect:"Phán xét tà đạo, trừng phạt kẻ ác" },
      { id:"prophet",      name:"Tiên Tri",            icon:"🌌", req:2000, effect:"Dự đoán tương lai 5 năm" },
    ],
    actions:[
      { id:"pray",      name:"Cầu Nguyện",         cost:0,    reward:{ xp:15, fame:8 },   cooldown:3,  desc:"Dâng lễ vật cho thần" },
      { id:"preach",    name:"Truyền Giáo",         cost:0,    reward:{ xp:80, fame:50 },  cooldown:20, desc:"Rao giảng tín ngưỡng" },
      { id:"holy_war",  name:"Thánh Chiến",         cost:1000, reward:{ xp:500,fame:300 }, cooldown:100,desc:"Phát động thánh chiến" },
    ]
  },
];

// ─── STATE ────────────────────────────────────────────────────
window.professionV50Data = {
  currentProfession: null,
  professions: {},  // { profId: { xp, level, unlockedSkills, actionCooldowns } }
  actionLog: [],
  tickCount: 0,
  initialized: false,
};

function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(window.professionV50Data)); }catch(e){} }
function load(){ try{ const d=localStorage.getItem(SAVE_KEY); if(d) Object.assign(window.professionV50Data, JSON.parse(d)); }catch(e){} }
function _log(msg, type){
  window.professionV50Data.actionLog.unshift({year:window.year||0, msg, type:type||"info"});
  if(window.professionV50Data.actionLog.length > 100) window.professionV50Data.actionLog.pop();
}

function getOrCreateProfData(profId){
  if(!window.professionV50Data.professions[profId]){
    window.professionV50Data.professions[profId] = { xp:0, level:1, unlockedSkills:[], actionCooldowns:{} };
  }
  return window.professionV50Data.professions[profId];
}

// ─── CHOOSE PROFESSION ───────────────────────────────────────
window.prof50Choose = function(profId){
  const prof = PROFESSIONS.find(p => p.id === profId);
  if(!prof) return { success:false, reason:"Nghề nghiệp không tồn tại" };
  window.professionV50Data.currentProfession = profId;
  getOrCreateProfData(profId);
  _log(`⚒️ Chọn nghề: ${prof.icon} ${prof.name}`, "profession");
  save();
  return { success:true, profession: prof };
};

// ─── DO ACTION ────────────────────────────────────────────────
window.prof50DoAction = function(profId, actionId){
  const prof = PROFESSIONS.find(p => p.id === profId);
  if(!prof) return { success:false, reason:"Nghề nghiệp không tồn tại" };
  const action = prof.actions.find(a => a.id === actionId);
  if(!action) return { success:false, reason:"Hành động không tồn tại" };
  const pd = getOrCreateProfData(profId);

  // Check cooldown
  const now = window.professionV50Data.tickCount;
  if(pd.actionCooldowns[actionId] && now < pd.actionCooldowns[actionId]){
    const rem = pd.actionCooldowns[actionId] - now;
    return { success:false, reason:`Chờ thêm ${rem} ticks` };
  }
  // Check wealth cost
  const v28 = window.playerV28Data || {};
  if(action.cost > 0 && (v28.wealth||0) < action.cost){
    return { success:false, reason:`Cần ${action.cost} vàng` };
  }

  // Apply cost
  if(action.cost > 0 && typeof window.playerAddWealth === "function") window.playerAddWealth(-action.cost);

  // Apply reward
  const r = action.reward;
  if(r.xp && typeof window.playerAddXP === "function") window.playerAddXP(r.xp, profId);
  if(r.fame && typeof window.playerAddFame === "function") window.playerAddFame(r.fame);
  if(r.wealth && typeof window.playerAddWealth === "function") window.playerAddWealth(r.wealth);

  // XP for profession itself
  pd.xp += r.xp || 5;
  checkSkillUnlock(pd, prof);

  // Set cooldown
  pd.actionCooldowns[actionId] = now + action.cooldown;

  // World impact
  if(typeof window.pv50AddImpact === "function"){
    if(actionId === "siege" || actionId === "war_command") window.pv50AddImpact("wars_started", 1);
    if(actionId === "heal_npc") window.pv50AddImpact("npcs_helped", 1);
  }

  _log(`${action.icon||prof.icon} ${action.name}: +${r.xp||0}XP +${r.fame||0}Danh Tiếng`, "action");
  save();
  return { success:true, reward: r };
};

function checkSkillUnlock(pd, prof){
  prof.skills.forEach(skill => {
    if(!pd.unlockedSkills.includes(skill.id) && pd.xp >= skill.req){
      pd.unlockedSkills.push(skill.id);
      _log(`🌟 Kỹ năng mở khoá: ${skill.name}!`, "skill");
      if(typeof window.htAddEvent === "function")
        window.htAddEvent({year:window.year||0, type:"player", title:`Mở khoá: ${skill.name}`, color:prof.color});
    }
  });
}

// ─── GET FUNCTIONS ────────────────────────────────────────────
window.prof50GetAll = function(){ return PROFESSIONS; };
window.prof50GetCurrent = function(){
  const id = window.professionV50Data.currentProfession;
  return id ? PROFESSIONS.find(p => p.id === id) : null;
};
window.prof50GetData = function(profId){ return getOrCreateProfData(profId||window.professionV50Data.currentProfession||"warrior"); };
window.prof50GetStats = function(){
  const total = Object.keys(window.professionV50Data.professions).length;
  const max = PROFESSIONS.reduce((s,p)=>{
    const pd = window.professionV50Data.professions[p.id]||{};
    return s + (pd.unlockedSkills||[]).length;
  },0);
  return { totalProfessions:total, skillsUnlocked:max, current:window.professionV50Data.currentProfession };
};
window.prof50GetLog = function(){ return window.professionV50Data.actionLog; };

// ─── PASSIVE PROFESSION TICK ──────────────────────────────────
function tick(){
  const d = window.professionV50Data;
  d.tickCount++;
  const curId = d.currentProfession;
  if(!curId) return;
  const prof = PROFESSIONS.find(p => p.id === curId);
  if(!prof) return;
  const pd = getOrCreateProfData(curId);

  // Passive XP every 10 ticks
  if(d.tickCount % 10 === 0){
    pd.xp += 1;
    checkSkillUnlock(pd, prof);
  }

  // Passive bonus effects every 50 ticks
  if(d.tickCount % 50 === 0){
    const bonus = prof.statBonus;
    if(bonus.wealth && typeof window.playerAddWealth === "function" && bonus.wealth > 0){
      window.playerAddWealth(Math.abs(bonus.wealth));
    }
    if(bonus.fame && typeof window.playerAddFame === "function" && bonus.fame > 0){
      window.playerAddFame(Math.floor(bonus.fame * 0.1));
    }
  }

  // Priest: prayer bonus
  if(curId === "priest" && d.tickCount % 20 === 0 && typeof window.heavenPoints !== "undefined"){
    window.heavenPoints = (window.heavenPoints||0) + 1;
  }

  if(d.tickCount % 60 === 0) save();
}

// ─── INIT ─────────────────────────────────────────────────────
function init(){
  load();
  const _orig = window.gameTick;
  window.gameTick = function(){ if(_orig) _orig(); tick(); };
  window.professionV50Data.initialized = true;
  console.log("[ProfessionSystemV50] ⚒️ Hệ Thống Nghề Nghiệp V50 — 7 nghề · Skill Trees · Actions sẵn sàng.");
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
