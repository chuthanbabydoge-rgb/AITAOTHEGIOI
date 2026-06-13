(function() {
"use strict";
// ============================================================
// GUILD ALLIANCE V53 — Guild & Empire Online
// Guild-to-Guild Alliances · Pacts · Khác allianceEngine.js V24
// EXPAND ONLY · V24 là nation alliances, V53 là guild alliances
// ============================================================
const SAVE_KEY   = "cgv6_guild_alliance_v53";
const INIT_DELAY = 7400;

// ─── LOẠI HIỆP ƯỚC ────────────────────────────────────────────
const PACT_TYPES = {
  defense:  { id:'defense',  icon:'🛡️', name:'Phòng Thủ Chung',  cost:200,  effect:'Cùng bảo vệ nhau khi bị tấn công', bonusDef:30 },
  trade:    { id:'trade',    icon:'💰', name:'Hiệp Ước Thương Mại',cost:300, effect:'+15% thu nhập cho cả hai bên', bonusIncome:15 },
  military: { id:'military', icon:'⚔️', name:'Liên Minh Quân Sự',  cost:500, effect:'Cùng tấn công kẻ thù chung', bonusAtk:25 },
  grand:    { id:'grand',    icon:'🌟', name:'Đại Liên Minh',     cost:1500, effect:'Chia sẻ lãnh thổ + toàn bộ bonus', bonusDef:40, bonusAtk:35, bonusIncome:20 },
};

// ─── STATE ────────────────────────────────────────────────────
window.guildAllianceV53Data = {
  alliances: [],   // { id, name, type, memberGuilds[], formedYear, status, log[] }
  pacts:     [],   // { id, guildAId, guildBId, type, formedYear, status }
  requests:  [],   // { id, fromGuild, toGuild, pactType, year, status }
  log:       [],
  stats:     { total:0, dissolved:0, wars:0 },
  tickCounter: 0,
  version: "V53"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.guildAllianceV53Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.guildAllianceV53Data = Object.assign(window.guildAllianceV53Data, JSON.parse(d));
  } catch(e) {}
}
function logAlliance(msg, type) {
  window.guildAllianceV53Data.log.unshift({ year:typeof year!=='undefined'?year:0, msg, type:type||'info' });
  if (window.guildAllianceV53Data.log.length > 80) window.guildAllianceV53Data.log.pop();
}

// ─── PUBLIC API ───────────────────────────────────────────────

// Tạo Liên Minh (Đại Bang Liên)
window.ga53FormAlliance = function(allianceName, memberGuilds) {
  const pGuildId = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
  if (!pGuildId) return { ok:false, msg:'Chưa có Bang Hội' };
  if (!Array.isArray(memberGuilds) || memberGuilds.length < 1) memberGuilds = [pGuildId];
  if (!memberGuilds.includes(pGuildId)) memberGuilds.unshift(pGuildId);

  const alliance = {
    id:           'al53_'+Date.now().toString(36),
    name:         allianceName || 'Liên Minh Mới',
    type:         'grand',
    memberGuilds: memberGuilds,
    formedYear:   typeof year!=='undefined'?year:0,
    status:       'active',
    log:          []
  };
  window.guildAllianceV53Data.alliances.push(alliance);
  window.guildAllianceV53Data.stats.total++;
  logAlliance('🤝 Liên Minh thành lập: '+allianceName);
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'alliance', title:'🤝 Liên Minh: '+allianceName, color:'#fbbf24' });
  return { ok:true, msg:'Đã thành lập Liên Minh: '+allianceName, alliance };
};

// Ký hiệp ước với guild cụ thể (AI hoặc player)
window.ga53SignPact = function(targetGuildId, pactTypeId) {
  const pGuildId = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
  if (!pGuildId) return { ok:false, msg:'Chưa có Bang Hội' };
  const pactType = PACT_TYPES[pactTypeId];
  if (!pactType) return { ok:false, msg:'Loại hiệp ước không hợp lệ' };

  // Kiểm tra đã có hiệp ước chưa
  const exists = window.guildAllianceV53Data.pacts.find(function(p) {
    return p.status==='active' && ((p.guildAId===pGuildId&&p.guildBId===targetGuildId)||(p.guildAId===targetGuildId&&p.guildBId===pGuildId));
  });
  if (exists) return { ok:false, msg:'Đã có hiệp ước với bang này' };

  // Trả phí
  if (typeof window.pec52SpendCurrency === 'function') {
    const spend = window.pec52SpendCurrency('bac', pactType.cost, 'Ký hiệp ước: '+pactType.name);
    if (!spend.ok) return spend;
  }

  const pact = {
    id:          'pact53_'+Date.now().toString(36),
    guildAId:    pGuildId,
    guildBId:    targetGuildId,
    type:        pactTypeId,
    typeName:    pactType.name,
    typeIcon:    pactType.icon,
    formedYear:  typeof year!=='undefined'?year:0,
    status:      'active'
  };
  window.guildAllianceV53Data.pacts.push(pact);
  logAlliance(pactType.icon+' Ký '+pactType.name+' với '+targetGuildId);
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'alliance', title:pactType.icon+' '+pactType.name+' ký kết', color:'#a78bfa' });
  return { ok:true, msg:'Đã ký '+pactType.name, pact };
};

window.ga53BreakPact = function(pactId) {
  const pact = window.guildAllianceV53Data.pacts.find(function(p){ return p.id===pactId; });
  if (!pact || pact.status !== 'active') return { ok:false, msg:'Hiệp ước không tồn tại' };
  pact.status = 'broken';
  pact.brokenYear = typeof year!=='undefined'?year:0;
  logAlliance('💔 Phá vỡ '+pact.typeName);
  save();
  return { ok:true, msg:'Đã hủy hiệp ước '+pact.typeName };
};

window.ga53InviteToAlliance = function(allianceId, guildId) {
  const al = window.guildAllianceV53Data.alliances.find(function(a){ return a.id===allianceId && a.status==='active'; });
  if (!al) return { ok:false, msg:'Liên minh không tồn tại' };
  if (al.memberGuilds.includes(guildId)) return { ok:false, msg:'Guild này đã trong liên minh' };
  al.memberGuilds.push(guildId);
  al.log.push({ year:typeof year!=='undefined'?year:0, msg:'Bang '+guildId+' gia nhập liên minh' });
  save();
  return { ok:true, msg:'Đã mời '+guildId+' vào liên minh' };
};

window.ga53GetPactTypes   = function() { return Object.values(PACT_TYPES); };
window.ga53GetAlliances   = function() { return window.guildAllianceV53Data.alliances.filter(function(a){ return a.status==='active'; }); };
window.ga53GetActivePacts = function() { return window.guildAllianceV53Data.pacts.filter(function(p){ return p.status==='active'; }); };

window.ga53GetStats = function() {
  return {
    alliances:    window.guildAllianceV53Data.alliances.filter(function(a){ return a.status==='active'; }).length,
    activePacts:  window.guildAllianceV53Data.pacts.filter(function(p){ return p.status==='active'; }).length,
    totalFormed:  window.guildAllianceV53Data.stats.total,
    dissolved:    window.guildAllianceV53Data.stats.dissolved,
    log:          window.guildAllianceV53Data.log.slice(0,10)
  };
};

window.ga53GetEffectiveBonuses = function() {
  const pGuildId = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
  if (!pGuildId) return { def:0, atk:0, income:0 };
  let def=0, atk=0, income=0;
  window.guildAllianceV53Data.pacts.filter(function(p){
    return p.status==='active' && (p.guildAId===pGuildId||p.guildBId===pGuildId);
  }).forEach(function(p) {
    const pt = PACT_TYPES[p.type];
    if (pt) { def+=(pt.bonusDef||0); atk+=(pt.bonusAtk||0); income+=(pt.bonusIncome||0); }
  });
  return { def, atk, income };
};

window.ga53GetJarvisReport = function() {
  const stats = window.ga53GetStats();
  const bonuses = window.ga53GetEffectiveBonuses();
  const tips = [];
  if (stats.alliances === 0 && stats.activePacts === 0) tips.push('🤝 Chưa có liên minh — ký hiệp ước để nhận bonus chiến đấu');
  if (bonuses.def > 0) tips.push('🛡️ Phòng thủ +'+bonuses.def+'% từ các hiệp ước');
  if (bonuses.income > 0) tips.push('💰 Thu nhập +'+bonuses.income+'% từ hiệp ước thương mại');
  return { tips, stats, bonuses };
};

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  console.log('[GuildAllianceV53] 🤝 Liên Minh Bang Hội V53 — 4 loại hiệp ước · Đại Bang Liên · Khác V24 Nation Alliance · sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
