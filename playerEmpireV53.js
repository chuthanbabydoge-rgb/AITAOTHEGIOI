(function() {
"use strict";
// ============================================================
// PLAYER EMPIRE V53 — Guild & Empire Online
// Extends playerTerritorySystem.js V28 (KHÔNG ghi đè)
// Officials · Army · Tax · Tribute · AI Nation Interaction
// ============================================================
const SAVE_KEY   = "cgv6_player_empire_v53";
const INIT_DELAY = 7500;

// ─── QUAN CHỨC ────────────────────────────────────────────────
const OFFICIAL_ROLES = {
  chancellor:  { id:'chancellor', icon:'📜', name:'Tể Tướng',      salary:200, effect:'Giảm 10% chi phí hành chính', max:1 },
  general:     { id:'general',    icon:'⚔️', name:'Đại Tướng Quân', salary:300, effect:'Quân đội +30% chiến đấu', max:3 },
  treasurer:   { id:'treasurer',  icon:'💰', name:'Tài Chính Quan',  salary:150, effect:'Thuế +15%', max:1 },
  spy:         { id:'spy',        icon:'🕵️', name:'Gián Điệp Trưởng',salary:250, effect:'Phát hiện âm mưu từ AI Nations', max:2 },
  diplomat:    { id:'diplomat',   icon:'🌐', name:'Ngoại Giao Sứ',   salary:100, effect:'Quan hệ AI +20', max:3 },
  governor:    { id:'governor',   icon:'🏛️', name:'Thống Đốc',       salary:80,  effect:'Thu nhập lãnh thổ +20%', max:5 },
};

// ─── QUÂN ĐỘI ─────────────────────────────────────────────────
const ARMY_UNITS = {
  infantry:  { id:'infantry',  icon:'🗡️',  name:'Bộ Binh',    cost:50,  power:10, upkeep:5  },
  cavalry:   { id:'cavalry',   icon:'🐎',  name:'Kỵ Binh',    cost:150, power:30, upkeep:15 },
  archer:    { id:'archer',    icon:'🏹',  name:'Cung Thủ',   cost:80,  power:15, upkeep:8  },
  mage:      { id:'mage',      icon:'🔮',  name:'Pháp Sư Binh',cost:200, power:50, upkeep:25 },
  siege:     { id:'siege',     icon:'💣',  name:'Công Thành Cơ',cost:300,power:70, upkeep:30 },
  elite:     { id:'elite',     icon:'⭐',  name:'Tinh Binh',   cost:500, power:120,upkeep:50 },
};

// ─── AI INTERACTION TYPES ─────────────────────────────────────
const AI_INTERACTIONS = {
  trade:   { id:'trade',   icon:'💰', name:'Thiết Lập Thương Mại', cost:100,  benefit:'Thu nhập +10%/năm' },
  tribute: { id:'tribute', icon:'💎', name:'Yêu Cầu Cống Phẩm',   cost:0,    benefit:'Nhận 200-500 vàng/năm' },
  ally:    { id:'ally',    icon:'🤝', name:'Ký Liên Minh',         cost:500,  benefit:'Phòng thủ chung' },
  war:     { id:'war',     icon:'⚔️', name:'Tuyên Chiến',           cost:0,    benefit:'Cơ hội chiếm lãnh thổ AI' },
};

// ─── STATE ────────────────────────────────────────────────────
window.playerEmpireV53Data = {
  imperialName:  null,    // Tên đế quốc
  imperialTitle: 'Lãnh Chúa',
  officials:     [],      // { id, roleId, name, icon, year }
  army:          {},      // { unitId: count }
  totalPower:    0,
  upkeepPerTick: 0,
  aiRelations:   {},      // { aiEntityId: { relation:0-100, status:'neutral/ally/war' } }
  tribute:       [],      // { from, amount, currency, lastYear }
  taxRevenue:    0,
  expansionLog:  [],
  tickCounter:   0,
  version: "V53"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.playerEmpireV53Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.playerEmpireV53Data = Object.assign(window.playerEmpireV53Data, JSON.parse(d));
  } catch(e) {}
}
function logEmpire(msg) {
  window.playerEmpireV53Data.expansionLog.unshift({ year:typeof year!=='undefined'?year:0, msg });
  if (window.playerEmpireV53Data.expansionLog.length > 100) window.playerEmpireV53Data.expansionLog.pop();
}

// ─── HELPERS ─────────────────────────────────────────────────
function calcTotalPower() {
  const units = ARMY_UNITS;
  let total = 0;
  Object.keys(window.playerEmpireV53Data.army).forEach(function(uid) {
    const unit = units[uid];
    if (unit) total += (window.playerEmpireV53Data.army[uid]||0) * unit.power;
  });
  // General bonus
  const generals = window.playerEmpireV53Data.officials.filter(function(o){ return o.roleId==='general'; });
  total = Math.floor(total * (1 + generals.length*0.1));
  window.playerEmpireV53Data.totalPower = total;
  return total;
}
function calcUpkeep() {
  const units = ARMY_UNITS;
  let upkeep = 0;
  Object.keys(window.playerEmpireV53Data.army).forEach(function(uid) {
    const unit = units[uid];
    if (unit) upkeep += (window.playerEmpireV53Data.army[uid]||0) * unit.upkeep;
  });
  // Official salaries
  window.playerEmpireV53Data.officials.forEach(function(o) {
    const role = OFFICIAL_ROLES[o.roleId];
    if (role) upkeep += Math.floor(role.salary / 10);
  });
  window.playerEmpireV53Data.upkeepPerTick = upkeep;
  return upkeep;
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.emp53SetImperialName = function(name, title) {
  window.playerEmpireV53Data.imperialName = name;
  window.playerEmpireV53Data.imperialTitle = title || 'Hoàng Đế';
  logEmpire('👑 Đế Quốc '+name+' chính thức tuyên bố thành lập!');
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'empire', title:'👑 Đế Quốc: '+name, color:'#facc15' });
  return { ok:true, msg:'Đế Quốc '+name+' đã được thành lập!' };
};

window.emp53AppointOfficial = function(roleId, name, icon) {
  const role = OFFICIAL_ROLES[roleId];
  if (!role) return { ok:false, msg:'Chức vụ không hợp lệ' };
  const current = window.playerEmpireV53Data.officials.filter(function(o){ return o.roleId===roleId; });
  if (current.length >= role.max) return { ok:false, msg:'Đã đạt tối đa '+role.max+' '+role.name };
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', role.salary, 'Bổ nhiệm '+role.name)
    : { ok:true };
  if (!spend.ok) return spend;
  const official = { id:'off53_'+Date.now().toString(36), roleId, roleName:role.name, roleIcon:role.icon, name:name||role.name+' #'+(current.length+1), icon:icon||role.icon, year:typeof year!=='undefined'?year:0 };
  window.playerEmpireV53Data.officials.push(official);
  logEmpire(role.icon+' Bổ nhiệm '+official.name+' làm '+role.name);
  save();
  return { ok:true, msg:official.name+' đã được bổ nhiệm làm '+role.name, official };
};

window.emp53DismissOfficial = function(officialId) {
  const idx = window.playerEmpireV53Data.officials.findIndex(function(o){ return o.id===officialId; });
  if (idx < 0) return { ok:false, msg:'Không tìm thấy quan chức' };
  const o = window.playerEmpireV53Data.officials.splice(idx, 1)[0];
  logEmpire('🗑️ Bãi miễn '+o.name);
  save();
  return { ok:true, msg:o.name+' đã bị bãi miễn' };
};

window.emp53RecruitArmy = function(unitId, count) {
  const unit = ARMY_UNITS[unitId];
  if (!unit) return { ok:false, msg:'Loại quân không hợp lệ' };
  count = Math.max(1, Math.floor(count||1));
  const totalCost = unit.cost * count;
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', totalCost, 'Tuyển '+count+'x '+unit.name)
    : { ok:true };
  if (!spend.ok) return spend;
  window.playerEmpireV53Data.army[unitId] = (window.playerEmpireV53Data.army[unitId]||0) + count;
  calcTotalPower();
  calcUpkeep();
  logEmpire('⚔️ Tuyển '+count+'x '+unit.name+' · Tổng sức mạnh: '+window.playerEmpireV53Data.totalPower);
  save();
  return { ok:true, msg:'Đã tuyển '+count+' '+unit.name+' · Tổng quân lực: '+window.playerEmpireV53Data.totalPower };
};

window.emp53DisbandArmy = function(unitId, count) {
  if (!window.playerEmpireV53Data.army[unitId]) return { ok:false, msg:'Không có loại quân này' };
  count = Math.min(count||1, window.playerEmpireV53Data.army[unitId]);
  window.playerEmpireV53Data.army[unitId] -= count;
  if (window.playerEmpireV53Data.army[unitId] <= 0) delete window.playerEmpireV53Data.army[unitId];
  calcTotalPower();
  calcUpkeep();
  save();
  return { ok:true, msg:'Đã giải tán '+count+' '+unitId };
};

window.emp53InteractAI = function(aiEntityId, interactionId) {
  const interaction = AI_INTERACTIONS[interactionId];
  if (!interaction) return { ok:false, msg:'Hành động không hợp lệ' };
  if (interaction.cost > 0) {
    const spend = typeof window.pec52SpendCurrency === 'function'
      ? window.pec52SpendCurrency('bac', interaction.cost, interaction.name+' ('+aiEntityId+')')
      : { ok:true };
    if (!spend.ok) return spend;
  }
  if (!window.playerEmpireV53Data.aiRelations[aiEntityId]) {
    window.playerEmpireV53Data.aiRelations[aiEntityId] = { relation:50, status:'neutral' };
  }
  const rel = window.playerEmpireV53Data.aiRelations[aiEntityId];
  if (interactionId === 'ally')    { rel.status='ally';    rel.relation=Math.min(100,rel.relation+30); }
  if (interactionId === 'war')     { rel.status='war';     rel.relation=Math.max(0,rel.relation-50);   }
  if (interactionId === 'trade')   { rel.status='trade';   rel.relation=Math.min(100,rel.relation+15); }
  if (interactionId === 'tribute') { rel.relation=Math.max(0,rel.relation-20); }
  logEmpire(interaction.icon+' '+interaction.name+' với '+aiEntityId);
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'empire', title:interaction.icon+' '+interaction.name+' ('+aiEntityId+')', color:'#60a5fa' });
  save();
  return { ok:true, msg:interaction.name+' với '+aiEntityId+' · '+interaction.benefit };
};

window.emp53GetOfficialRoles = function() { return Object.values(OFFICIAL_ROLES); };
window.emp53GetArmyUnits     = function() { return Object.values(ARMY_UNITS); };
window.emp53GetInteractions  = function() { return Object.values(AI_INTERACTIONS); };
window.emp53GetOfficials     = function() { return window.playerEmpireV53Data.officials.slice(); };
window.emp53GetArmy          = function() { return Object.assign({}, window.playerEmpireV53Data.army); };
window.emp53GetAIRelations   = function() { return Object.assign({}, window.playerEmpireV53Data.aiRelations); };

window.emp53GetStats = function() {
  const territories = typeof window.playerTerritoryData !== 'undefined' ? (window.playerTerritoryData.territories||[]).length : 0;
  const empireIncome = typeof window.playerTerritoryData !== 'undefined' ? (window.playerTerritoryData.totalIncome||0) : 0;
  const officialBonus = window.playerEmpireV53Data.officials.some(function(o){ return o.roleId==='treasurer'; }) ? 1.15 : 1.0;
  return {
    imperialName:  window.playerEmpireV53Data.imperialName || '(Chưa thành lập)',
    imperialTitle: window.playerEmpireV53Data.imperialTitle,
    officials:     window.playerEmpireV53Data.officials.length,
    totalPower:    window.playerEmpireV53Data.totalPower,
    upkeep:        window.playerEmpireV53Data.upkeepPerTick,
    territories:   territories,
    taxRevenue:    Math.floor(empireIncome * officialBonus),
    allies:        Object.keys(window.playerEmpireV53Data.aiRelations).filter(function(k){ return window.playerEmpireV53Data.aiRelations[k].status==='ally'; }).length,
    wars:          Object.keys(window.playerEmpireV53Data.aiRelations).filter(function(k){ return window.playerEmpireV53Data.aiRelations[k].status==='war'; }).length,
  };
};

window.emp53GetJarvisReport = function() {
  const stats = window.emp53GetStats();
  const tips = [];
  if (!window.playerEmpireV53Data.imperialName) tips.push('👑 Sở hữu Đế Chế trong V28 rồi đặt tên để mở khóa hệ thống quan chức');
  if (stats.officials < 3) tips.push('📜 Bổ nhiệm thêm quan chức để nhận bonus thuế và quân sự');
  if (stats.totalPower < 500) tips.push('⚔️ Quân lực còn yếu — tuyển thêm Tinh Binh để bảo vệ đế chế');
  if (stats.allies === 0) tips.push('🤝 Chưa có đồng minh AI — ký liên minh để tăng an ninh');
  if (stats.upkeep > 0) tips.push('💰 Chi phí duy trì quân đội: '+stats.upkeep+' bạc/tick');
  return { tips, stats };
};

// ─── TICK ──────────────────────────────────────────────────────
function tick() {
  const d = window.playerEmpireV53Data;
  d.tickCounter++;
  if (d.tickCounter % 8 === 0) {
    // Chi phí quân đội
    const upkeep = calcUpkeep();
    if (upkeep > 0 && typeof window.pec52SpendCurrency === 'function') {
      window.pec52SpendCurrency('bac', upkeep, 'Duy trì quân đội đế chế');
    }
    // Thu cống phẩm
    d.tribute.forEach(function(t) {
      const thisYear = typeof year!=='undefined'?year:0;
      if (thisYear > (t.lastYear||0)) {
        t.lastYear = thisYear;
        if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency(t.currency||'bac', t.amount, 'Cống phẩm từ '+t.from);
        d.taxRevenue += t.amount;
      }
    });
    // Thuế lãnh thổ
    if (typeof window.playerTerritoryData !== 'undefined' && (window.playerTerritoryData.totalIncome||0) > 0) {
      const taxRate = typeof window.tax52GetEffectiveRate === 'function' ? window.tax52GetEffectiveRate('empire') : 0.1;
      const income = Math.floor((window.playerTerritoryData.totalIncome||0) * taxRate);
      if (income > 0 && typeof window.pec52AddCurrency === 'function') {
        window.pec52AddCurrency('bac', income, 'Thuế lãnh thổ đế chế');
        d.taxRevenue += income;
      }
    }
    calcTotalPower();
    save();
  }
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  // Sync với V28 territory
  if (typeof window.playerTerritoryData !== 'undefined' && window.playerTerritoryData.playerEmpire) {
    if (!window.playerEmpireV53Data.imperialName) {
      window.playerEmpireV53Data.imperialName = window.playerTerritoryData.playerEmpire;
    }
  }
  calcTotalPower();
  calcUpkeep();

  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };

  console.log('[PlayerEmpireV53] 👑 Đế Quốc Người Chơi V53 — 6 loại quan chức · 6 loại quân · 4 loại tương tác AI · Extends V28 Territory sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
