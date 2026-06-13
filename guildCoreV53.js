(function() {
"use strict";
// ============================================================
// GUILD CORE V53 — Guild & Empire Online
// Extends guildEngineV29 (KHÔNG ghi đè)
// Ranks · Treasury · Headquarters · NPC Members · Buildings
// ============================================================
const SAVE_KEY   = "cgv6_guild_core_v53";
const INIT_DELAY = 7300;

// ─── RANKS ────────────────────────────────────────────────────
const MEMBER_RANKS = [
  { id:'member',      icon:'⚪', name:'Thành Viên',     permRecruitNpc:false, permDonate:true,   permMission:true,  permWar:false, permBuild:false },
  { id:'officer',     icon:'🔵', name:'Sĩ Quan',        permRecruitNpc:true,  permDonate:true,   permMission:true,  permWar:false, permBuild:false },
  { id:'elder',       icon:'🟡', name:'Trưởng Lão',     permRecruitNpc:true,  permDonate:true,   permMission:true,  permWar:true,  permBuild:false },
  { id:'viceMaster',  icon:'🔶', name:'Phó Hội Chủ',    permRecruitNpc:true,  permDonate:true,   permMission:true,  permWar:true,  permBuild:true  },
  { id:'guildMaster', icon:'👑', name:'Hội Chủ',        permRecruitNpc:true,  permDonate:true,   permMission:true,  permWar:true,  permBuild:true  },
];

// ─── HEADQUARTERS BUILDINGS ───────────────────────────────────
const HQ_BUILDINGS = {
  hall:     { id:'hall',     icon:'🏛️', name:'Đại Sảnh Bang Hội',    cost:500,  effect:'Tăng tối đa thành viên +20', unlockLevel:1 },
  vault:    { id:'vault',    icon:'🏦', name:'Kho Quỹ',              cost:300,  effect:'Bảo vệ 50% treasury khi thua chiến', unlockLevel:1 },
  barracks: { id:'barracks', icon:'⚔️', name:'Doanh Trại Quân Sự',   cost:800,  effect:'Sức mạnh chiến đấu +30%', unlockLevel:2 },
  market:   { id:'market',   icon:'🏪', name:'Chợ Bang Hội',         cost:600,  effect:'Thu nhập guild +25%/tick', unlockLevel:2 },
  library:  { id:'library',  icon:'📚', name:'Thư Viện Bí Thuật',    cost:1200, effect:'XP thành viên +20%', unlockLevel:3 },
  shrine:   { id:'shrine',   icon:'⛩️',  name:'Đền Thờ Bang',         cost:1500, effect:'Danh tiếng guild +50', unlockLevel:3 },
  fortress: { id:'fortress', icon:'🏰', name:'Pháo Đài Bang Hội',    cost:3000, effect:'Phòng thủ +50%, giảm thiệt hại chiến tranh', unlockLevel:4 },
  palace:   { id:'palace',   icon:'🏯', name:'Cung Điện Bang Chủ',   cost:5000, effect:'Uy quyền tối thượng — mở khóa Đế Quốc Guild', unlockLevel:5 },
};

// ─── GUILD QUESTS V53 (nâng cao hơn V29) ─────────────────────
const V53_QUESTS = [
  { id:'q1', name:'Tuần Tra Lãnh Thổ',        reward:{gold:300,xp:100}, dur:5,  minLevel:0 },
  { id:'q2', name:'Đánh Đuổi Kẻ Xâm Lấn',    reward:{gold:500,xp:200}, dur:8,  minLevel:1 },
  { id:'q3', name:'Thu Thuế Vùng Biên',        reward:{gold:800,xp:150}, dur:10, minLevel:2 },
  { id:'q4', name:'Tìm Kiếm Nhân Tài',        reward:{gold:400,xp:300}, dur:12, minLevel:2 },
  { id:'q5', name:'Hộ Tống Thương Đội Lớn',   reward:{gold:1000,xp:200}, dur:8, minLevel:3 },
  { id:'q6', name:'Thiêu Hủy Căn Cứ Địch',    reward:{gold:1500,xp:500}, dur:15, minLevel:3 },
  { id:'q7', name:'Chinh Phục Bí Cảnh Cấm',   reward:{gold:3000,xp:1000},dur:20, minLevel:4 },
  { id:'q8', name:'Thành Lập Liên Minh',       reward:{gold:2000,xp:800}, dur:15, minLevel:4 },
  { id:'q9', name:'Tuyên Chiến Với Đế Quốc AI',reward:{gold:5000,xp:2000},dur:30, minLevel:5 },
  { id:'q10',name:'Thống Nhất Thiên Hạ',      reward:{gold:10000,xp:5000},dur:50,minLevel:5 },
];

// ─── AI GUILD NAMES ───────────────────────────────────────────
const AI_GUILD_NAMES = [
  { name:'Thiên Long Bang',   icon:'🐉', type:'combat', level:4, power:800, treasury:5000 },
  { name:'Vạn Bảo Hội',       icon:'💰', type:'trade',  level:3, power:400, treasury:8000 },
  { name:'Huyền Kiếm Phái',   icon:'⚔️',  type:'combat', level:5, power:1200,treasury:6000 },
  { name:'Linh Thảo Thương Hội',icon:'🌿', type:'trade', level:2, power:200, treasury:3000 },
  { name:'Thiết Huyết Đoàn',  icon:'🛡️', type:'defense',level:4, power:900, treasury:4000 },
  { name:'Ngọc Long Bang',    icon:'🏆', type:'combat', level:3, power:600, treasury:5500 },
  { name:'Kim Bình Thương Hội',icon:'🪙', type:'trade',  level:2, power:150, treasury:7000 },
];

// ─── STATE ────────────────────────────────────────────────────
window.guildV53Data = {
  playerGuildId:   null,    // ID trong guildV29Data.guilds
  members:         [],      // { id, name, icon, rank, joinYear, xp, contribution }
  treasury:        { gold:0, spiritStones:0, items:[] },
  hq:              { level:1, buildings:[], xp:0 },
  activeQuests:    [],      // { questId, assignedYear, completeYear, assignee }
  completedQuests: [],
  aiGuilds:        AI_GUILD_NAMES.map(function(g){ return Object.assign({},g,{id:'aig_'+Math.random().toString(36).slice(2,7)}); }),
  log:             [],
  stats:           { totalMembers:0, questsDone:0, goldEarned:0, buildingsBuilt:0 },
  tickCounter:     0,
  version: "V53"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.guildV53Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.guildV53Data = Object.assign(window.guildV53Data, JSON.parse(d));
  } catch(e) {}
}
function log53(msg, type) {
  window.guildV53Data.log.unshift({ year:typeof year!=='undefined'?year:0, msg, type:type||'info' });
  if (window.guildV53Data.log.length > 100) window.guildV53Data.log.pop();
}

// ─── HELPERS ─────────────────────────────────────────────────
function getPlayerGuild() {
  if (!window.guildV53Data.playerGuildId) return null;
  if (typeof window.guildV29Data === 'undefined') return null;
  const guilds = Array.isArray(window.guildV29Data.guilds) ? window.guildV29Data.guilds : Object.values(window.guildV29Data.guilds||{});
  return guilds.find(function(g){ return g.id === window.guildV53Data.playerGuildId; }) || null;
}
function getGuildLevel() {
  const g = getPlayerGuild();
  return g ? (g.level||1) : 1;
}

// ─── PUBLIC API ───────────────────────────────────────────────

// Link V53 với V29 guild đã tạo
window.g53LinkGuild = function(guildId) {
  window.guildV53Data.playerGuildId = guildId;
  log53('🔗 Đã liên kết Guild V53 với '+guildId);
  save();
};

// Tạo guild mới qua V29 rồi link V53
window.g53CreateGuild = function(name, type) {
  if (typeof window.guildV29Create !== 'function') return { ok:false, msg:'guildEngineV29 chưa load' };
  const result = window.guildV29Create(name, type||'bangHoi');
  if (!result) return { ok:false, msg:'Tạo guild thất bại' };
  const guilds = Array.isArray(window.guildV29Data.guilds) ? window.guildV29Data.guilds : Object.values(window.guildV29Data.guilds||{});
  const newGuild = guilds[guilds.length-1];
  if (newGuild) window.g53LinkGuild(newGuild.id);
  // Thêm player như Guild Master
  window.g53AddMember(typeof window.playerV28Data !== 'undefined' ? (window.playerV28Data.name||'Player') : 'Player', '👤', 'guildMaster');
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'guild', title:'🏛️ Thành lập Bang Hội: '+name, color:'#60a5fa' });
  return { ok:true, msg:'Đã thành lập Bang Hội: '+name, guildId: newGuild?newGuild.id:null };
};

window.g53AddMember = function(name, icon, rank) {
  rank = rank || 'member';
  const mem = {
    id:            'mem53_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,5),
    name:          name||'Ẩn Danh',
    icon:          icon||'👤',
    rank:          rank,
    rankName:      (MEMBER_RANKS.find(function(r){ return r.id===rank; })||{}).name || rank,
    joinYear:      typeof year!=='undefined'?year:0,
    xp:            0,
    contribution:  0,
    isNpc:         name !== (typeof window.playerV28Data !== 'undefined' ? window.playerV28Data.name : 'Player')
  };
  window.guildV53Data.members.push(mem);
  window.guildV53Data.stats.totalMembers++;
  log53('👋 '+name+' gia nhập Bang ('+mem.rankName+')');
  save();
  return mem;
};

window.g53RecruitNpc = function() {
  if (!window.guildV53Data.playerGuildId) return { ok:false, msg:'Chưa có Bang Hội' };
  const maxMem = 10 + getGuildLevel()*10 + (window.guildV53Data.hq.buildings.includes('hall')?20:0);
  if (window.guildV53Data.members.length >= maxMem) return { ok:false, msg:'Bang Hội đã đầy ('+maxMem+' thành viên)' };

  const npcNames = ['Kiếm Khách','Pháp Sư Già','Thương Nhân Trẻ','Thợ Rèn Tiên','Nữ Tu Sĩ','Cung Thủ Rừng','Đạo Nhân Bạch Phát','Vị Tướng Trẻ','Luyện Đan Sư','Cơ Giới Sĩ'];
  const npcIcons = ['⚔️','🔮','💰','⚒️','🌸','🏹','☯️','🎖️','💊','⚙️'];
  const idx = Math.floor(Math.random()*npcNames.length);
  const mem = window.g53AddMember(npcNames[idx]+' #'+Math.floor(Math.random()*99+1), npcIcons[idx], 'member');
  return { ok:true, msg:'Đã chiêu mộ '+mem.name, member:mem };
};

window.g53PromoteMember = function(memberId, newRank) {
  const mem = window.guildV53Data.members.find(function(m){ return m.id===memberId; });
  if (!mem) return { ok:false, msg:'Không tìm thấy thành viên' };
  if (newRank === 'guildMaster' && window.guildV53Data.members.find(function(m){ return m.rank==='guildMaster'&&m.id!==memberId; })) {
    return { ok:false, msg:'Chỉ có 1 Hội Chủ — hãy giáng cấp Hội Chủ cũ trước' };
  }
  const rankInfo = MEMBER_RANKS.find(function(r){ return r.id===newRank; });
  if (!rankInfo) return { ok:false, msg:'Cấp bậc không hợp lệ' };
  mem.rank = newRank;
  mem.rankName = rankInfo.name;
  log53('⬆️ '+mem.name+' thăng lên '+rankInfo.name);
  save();
  return { ok:true, msg:mem.name+' → '+rankInfo.name };
};

window.g53KickMember = function(memberId) {
  const idx = window.guildV53Data.members.findIndex(function(m){ return m.id===memberId; });
  if (idx < 0) return { ok:false, msg:'Không tìm thấy thành viên' };
  const mem = window.guildV53Data.members[idx];
  if (mem.rank === 'guildMaster') return { ok:false, msg:'Không thể đuổi Hội Chủ' };
  window.guildV53Data.members.splice(idx, 1);
  log53('👢 '+mem.name+' bị đuổi khỏi Bang Hội');
  save();
  return { ok:true, msg:mem.name+' đã bị loại' };
};

window.g53DonateToTreasury = function(currency, amount) {
  if (typeof window.pec52SpendCurrency === 'function') {
    const spend = window.pec52SpendCurrency(currency||'bac', amount||100, 'Đóng góp Bang Hội');
    if (!spend.ok) return spend;
  }
  window.guildV53Data.treasury.gold += (amount||100) * (currency==='vang'?100:1);
  log53('💰 Đóng góp '+(amount||100)+' '+(currency||'bac')+' vào kho quỹ');
  save();
  return { ok:true, msg:'Đã đóng góp vào Kho Quỹ' };
};

window.g53BuildHQ = function(buildingId) {
  const building = HQ_BUILDINGS[buildingId];
  if (!building) return { ok:false, msg:'Công trình không tồn tại' };
  if (window.guildV53Data.hq.buildings.includes(buildingId)) return { ok:false, msg:'Đã xây công trình này' };
  const level = getGuildLevel();
  if (level < building.unlockLevel) return { ok:false, msg:'Yêu cầu Bang cấp '+building.unlockLevel };
  if (window.guildV53Data.treasury.gold < building.cost) return { ok:false, msg:'Không đủ quỹ (cần '+building.cost+' vàng)' };
  window.guildV53Data.treasury.gold -= building.cost;
  window.guildV53Data.hq.buildings.push(buildingId);
  window.guildV53Data.stats.buildingsBuilt++;
  log53('🏗️ Xây dựng hoàn thành: '+building.name);
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'guild', title:'🏗️ '+building.name+' hoàn thành', color:'#22c55e' });
  return { ok:true, msg:building.name+' đã xây xong!' };
};

window.g53AssignQuest = function(questId) {
  if (!window.guildV53Data.playerGuildId) return { ok:false, msg:'Chưa có Bang Hội' };
  const quest = V53_QUESTS.find(function(q){ return q.id===questId; });
  if (!quest) return { ok:false, msg:'Nhiệm vụ không tồn tại' };
  const level = getGuildLevel();
  if (level < quest.minLevel) return { ok:false, msg:'Cần Bang cấp '+quest.minLevel };
  const already = window.guildV53Data.activeQuests.find(function(q){ return q.questId===questId; });
  if (already) return { ok:false, msg:'Nhiệm vụ này đang thực hiện' };
  const currentYear = typeof year!=='undefined'?year:0;
  window.guildV53Data.activeQuests.push({ questId, assignedYear:currentYear, completeYear:currentYear+quest.dur });
  log53('📜 Bang Hội nhận nhiệm vụ: '+quest.name);
  save();
  return { ok:true, msg:'Nhiệm vụ '+quest.name+' bắt đầu · Hoàn thành năm '+(currentYear+quest.dur) };
};

window.g53GetQuests    = function() { return V53_QUESTS.slice(); };
window.g53GetBuildings = function() { return Object.values(HQ_BUILDINGS); };
window.g53GetRanks     = function() { return MEMBER_RANKS.slice(); };
window.g53GetMembers   = function() { return window.guildV53Data.members.slice(); };
window.g53GetAIGuilds  = function() { return window.guildV53Data.aiGuilds.slice(); };
window.g53GetTreasury  = function() { return Object.assign({}, window.guildV53Data.treasury); };
window.g53GetHQ        = function() { return Object.assign({}, window.guildV53Data.hq); };

window.g53GetStats = function() {
  const guild = getPlayerGuild();
  return {
    guildName:    guild ? guild.name : '(Chưa có)',
    guildType:    guild ? guild.type : null,
    guildLevel:   getGuildLevel(),
    memberCount:  window.guildV53Data.members.length,
    maxMembers:   10 + getGuildLevel()*10,
    treasury:     window.guildV53Data.treasury.gold,
    buildings:    window.guildV53Data.hq.buildings.length,
    activeQuests: window.guildV53Data.activeQuests.length,
    aiGuildCount: window.guildV53Data.aiGuilds.length,
    stats:        window.guildV53Data.stats
  };
};

window.g53GetJarvisReport = function() {
  const stats = window.g53GetStats();
  const tips = [];
  if (!window.guildV53Data.playerGuildId) tips.push('🏛️ Chưa có Bang Hội — tạo ngay để bắt đầu mở rộng thế lực');
  if (stats.memberCount < 5) tips.push('👥 Bang Hội quá ít thành viên — chiêu mộ NPC để tăng sức mạnh');
  if (!window.guildV53Data.hq.buildings.includes('barracks')) tips.push('⚔️ Xây Doanh Trại để tăng 30% sức chiến đấu');
  if (stats.activeQuests === 0) tips.push('📜 Không có nhiệm vụ đang thực hiện — giao nhiệm vụ để kiếm vàng');
  const topAI = window.guildV53Data.aiGuilds.sort(function(a,b){ return b.power-a.power; })[0];
  if (topAI) tips.push('🏆 Bang hội mạnh nhất: '+topAI.icon+' '+topAI.name+' (sức mạnh: '+topAI.power+')');
  return { tips, stats };
};

// ─── TICK ──────────────────────────────────────────────────────
function tick() {
  const d = window.guildV53Data;
  d.tickCounter++;

  // Hoàn thành nhiệm vụ
  const curYear = typeof year !== 'undefined' ? year : 0;
  const completed = d.activeQuests.filter(function(aq){ return curYear >= aq.completeYear; });
  completed.forEach(function(aq) {
    const quest = V53_QUESTS.find(function(q){ return q.id===aq.questId; });
    if (quest) {
      d.treasury.gold += quest.reward.gold;
      d.stats.goldEarned += quest.reward.gold;
      d.completedQuests.push(Object.assign({},aq,{completedYear:curYear}));
      d.stats.questsDone++;
      log53('✅ Nhiệm vụ hoàn thành: '+quest.name+' · +'+quest.reward.gold+' vàng');
      if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:curYear, type:'guild', title:'✅ Bang hoàn thành: '+quest.name, color:'#22c55e' });
    }
    const idx = d.activeQuests.indexOf(aq);
    if (idx >= 0) d.activeQuests.splice(idx, 1);
  });

  // Thu nhập chợ bang (nếu có building)
  if (d.tickCounter % 10 === 0 && d.hq.buildings.includes('market')) {
    const income = Math.ceil(50 * getGuildLevel() * 1.25);
    d.treasury.gold += income;
    d.stats.goldEarned += income;
  }

  // AI guild fluctuation
  if (d.tickCounter % 20 === 0) {
    d.aiGuilds.forEach(function(g) {
      g.power = Math.max(50, g.power + Math.floor((Math.random()-0.4)*30));
    });
    save();
  } else if (completed.length > 0) {
    save();
  }
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  // Tự động link nếu V29 đã có guild
  if (!window.guildV53Data.playerGuildId && typeof window.guildV29Data !== 'undefined' && window.guildV29Data.playerGuildId) {
    window.guildV53Data.playerGuildId = window.guildV29Data.playerGuildId;
  }

  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };

  console.log('[GuildCoreV53] 🏛️ Bang Hội V53 — 5 cấp bậc · 8 công trình HQ · '+V53_QUESTS.length+' nhiệm vụ · '+AI_GUILD_NAMES.length+' AI guilds · Extends V29 sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
