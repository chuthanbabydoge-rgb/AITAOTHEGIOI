(function() {
"use strict";
// ============================================================
// GUILD WAR V53 — Guild & Empire Online
// Guild vs Guild · Alliance Wars · Territory War · Battle Log
// EXPAND ONLY · Khác territoryWarSystem.js (world-level wars)
// ============================================================
const SAVE_KEY   = "cgv6_guild_war_v53";
const INIT_DELAY = 7600;

// ─── LOẠI CHIẾN TRANH ────────────────────────────────────────
const WAR_TYPES = {
  guildVsGuild:   { id:'guildVsGuild',   icon:'⚔️',  name:'Đánh Bang',       duration:10, stakes:'treasury_10pct', desc:'Thắng nhận 10% kho quỹ đối thủ' },
  allianceWar:    { id:'allianceWar',    icon:'🏴',  name:'Liên Minh Chiến',  duration:20, stakes:'territory',      desc:'Thắng chiếm 1 lãnh thổ đối thủ' },
  territoryWar:   { id:'territoryWar',   icon:'🗺️',  name:'Lãnh Thổ Chiến',  duration:15, stakes:'territory_perm', desc:'Thắng sở hữu vùng lãnh thổ tranh chấp' },
  annihilation:   { id:'annihilation',   icon:'💥',  name:'Tiêu Diệt Chiến', duration:30, stakes:'dissolve',       desc:'Thắng có thể giải thể bang đối thủ' },
};

// ─── STATE ────────────────────────────────────────────────────
window.guildWarV53Data = {
  activeWars:    [],  // { id, type, attackerId, defenderId, startYear, endYear, status, attackPower, defPower, rounds, log }
  warHistory:    [],  // { id, type, winner, loser, year, stakes }
  rankings:      [],  // { guildId, name, icon, wins, losses, power }
  log:           [],
  tickCounter:   0,
  version: "V53"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.guildWarV53Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.guildWarV53Data = Object.assign(window.guildWarV53Data, JSON.parse(d));
  } catch(e) {}
}
function logWar(msg, type) {
  window.guildWarV53Data.log.unshift({ year:typeof year!=='undefined'?year:0, msg, type:type||'info' });
  if (window.guildWarV53Data.log.length > 100) window.guildWarV53Data.log.pop();
}

// ─── HELPERS ─────────────────────────────────────────────────
function getPlayerGuildId() {
  return typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
}
function getPlayerPower() {
  // V53 guild power + V53 empire army power + alliance bonus
  let power = 100;
  if (typeof window.playerEmpireV53Data !== 'undefined') power += window.playerEmpireV53Data.totalPower||0;
  if (typeof window.ga53GetEffectiveBonuses === 'function') {
    const bonuses = window.ga53GetEffectiveBonuses();
    power = Math.floor(power * (1 + (bonuses.atk||0)/100));
  }
  const level = typeof window.g53GetStats === 'function' ? (window.g53GetStats().guildLevel||1) : 1;
  power += level * 50;
  // Barracks bonus
  if (typeof window.guildV53Data !== 'undefined' && window.guildV53Data.hq.buildings.includes('barracks')) power = Math.floor(power*1.3);
  return Math.max(10, power);
}
function getTargetPower(targetId) {
  const aiGuild = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.aiGuilds.find(function(g){ return g.id===targetId; }) : null;
  if (aiGuild) return aiGuild.power;
  return 200 + Math.floor(Math.random()*400);
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.gw53DeclareWar = function(targetId, warTypeId, targetName) {
  const pGuildId = getPlayerGuildId();
  if (!pGuildId) return { ok:false, msg:'Chưa có Bang Hội' };
  const warType = WAR_TYPES[warTypeId];
  if (!warType) return { ok:false, msg:'Loại chiến tranh không hợp lệ' };

  // Kiểm tra đã có chiến tranh
  const alreadyAtWar = window.guildWarV53Data.activeWars.find(function(w) {
    return w.status==='active' && (w.attackerId===pGuildId||w.defenderId===pGuildId);
  });
  if (alreadyAtWar) return { ok:false, msg:'Đang trong chiến tranh — kết thúc trước khi tuyên chiến mới' };

  const myPower  = getPlayerPower();
  const tgtPower = getTargetPower(targetId);
  const curYear  = typeof year!=='undefined'?year:0;

  const war = {
    id:           'gw53_'+Date.now().toString(36),
    type:         warTypeId,
    typeName:     warType.name,
    typeIcon:     warType.icon,
    attackerId:   pGuildId,
    attackerName: typeof window.guildV53Data !== 'undefined' && typeof window.g53GetStats === 'function' ? window.g53GetStats().guildName : 'Bang Của Bạn',
    defenderId:   targetId,
    defenderName: targetName || targetId,
    startYear:    curYear,
    endYear:      curYear + warType.duration,
    status:       'active',
    attackPower:  myPower,
    defPower:     tgtPower,
    rounds:       [],
    log:          []
  };
  window.guildWarV53Data.activeWars.push(war);
  logWar(warType.icon+' Tuyên chiến với '+war.defenderName+' · Sức mạnh: '+myPower+' vs '+tgtPower,'war');
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:curYear, type:'war', title:warType.icon+' CHIẾN TRANH: '+war.attackerName+' vs '+war.defenderName, color:'#ef4444' });
  return { ok:true, msg:'Đã tuyên chiến với '+war.defenderName+' · Kết thúc năm '+war.endYear, war };
};

window.gw53BoostAttack = function(warId) {
  const war = window.guildWarV53Data.activeWars.find(function(w){ return w.id===warId && w.status==='active'; });
  if (!war) return { ok:false, msg:'Không tìm thấy chiến tranh' };
  const boost = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', 200, 'Tăng cường tấn công')
    : { ok:true };
  if (!boost.ok) return boost;
  war.attackPower = Math.floor(war.attackPower * 1.15);
  war.log.push({ year:typeof year!=='undefined'?year:0, msg:'⬆️ Tăng cường tấn công · Sức mạnh → '+war.attackPower });
  save();
  return { ok:true, msg:'Sức mạnh tấn công → '+war.attackPower };
};

window.gw53SurrenderWar = function(warId) {
  const war = window.guildWarV53Data.activeWars.find(function(w){ return w.id===warId && w.status==='active'; });
  if (!war) return { ok:false, msg:'Không tìm thấy chiến tranh' };
  war.status   = 'surrendered';
  war.winner   = war.defenderId;
  war.loser    = war.attackerId;
  war.endedYear = typeof year!=='undefined'?year:0;
  _applyWarResult(war);
  logWar('🏳️ Đầu hàng: '+war.defenderName+' thắng','war');
  _moveToHistory(war);
  save();
  return { ok:true, msg:'Đã đầu hàng' };
};

function _settleWar(war) {
  const winPct = war.attackPower / (war.attackPower + war.defPower);
  const win = Math.random() < winPct;
  war.status   = 'resolved';
  war.winner   = win ? war.attackerId : war.defenderId;
  war.loser    = win ? war.defenderId : war.attackerId;
  war.endedYear = typeof year!=='undefined'?year:0;
  const resultMsg = win ? '🏆 THẮNG: '+war.attackerName+' chiến thắng!' : '💀 THUA: '+war.defenderName+' giữ vững!';
  war.log.push({ year:war.endedYear, msg:resultMsg });
  logWar(war.typeIcon+' '+resultMsg, win?'win':'loss');
  _applyWarResult(war);
  _moveToHistory(war);
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:war.endedYear, type:'war', title:war.typeIcon+' KẾT QUẢ CHIẾN TRANH: '+(win?'THẮNG':'THUA'), color: win?'#22c55e':'#ef4444' });
}

function _applyWarResult(war) {
  const isAttackerPlayer = war.attackerId === getPlayerGuildId();
  const playerWon = (war.winner === (isAttackerPlayer ? war.attackerId : war.defenderId));
  const warType = WAR_TYPES[war.type];

  if (playerWon && warType && warType.stakes === 'treasury_10pct') {
    // Nhận 10% kho quỹ đối thủ AI
    const loot = 500 + Math.floor(Math.random()*1000);
    if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency('bac', loot, 'Chiến lợi phẩm từ '+war.defenderName);
    if (typeof window.guildV53Data !== 'undefined') window.guildV53Data.treasury.gold += loot;
    logWar('💰 Nhận chiến lợi phẩm: '+loot+' bạc từ '+war.defenderName);
  } else if (!playerWon) {
    // Thua — mất 5-15% kho quỹ
    const loss = 100 + Math.floor(Math.random()*400);
    if (typeof window.pec52SpendCurrency === 'function') window.pec52SpendCurrency('bac', loss, 'Bồi thường chiến tranh');
    logWar('😢 Mất '+loss+' bạc do thua chiến');
  }

  // Cập nhật rankings
  _updateRankings(war.winner, true);
  _updateRankings(war.loser, false);
}

function _moveToHistory(war) {
  window.guildWarV53Data.warHistory.unshift({ id:war.id, type:war.type, typeName:war.typeName, winner:war.winner, loser:war.loser, year:war.endedYear||0, attackerName:war.attackerName, defenderName:war.defenderName });
  if (window.guildWarV53Data.warHistory.length > 30) window.guildWarV53Data.warHistory.pop();
  const idx = window.guildWarV53Data.activeWars.findIndex(function(w){ return w.id===war.id; });
  if (idx >= 0) window.guildWarV53Data.activeWars.splice(idx, 1);
}

function _updateRankings(guildId, won) {
  let entry = window.guildWarV53Data.rankings.find(function(r){ return r.guildId===guildId; });
  if (!entry) {
    const stats = typeof window.g53GetStats === 'function' ? window.g53GetStats() : {};
    entry = { guildId, name:stats.guildName||guildId, icon:'🏛️', wins:0, losses:0, power:getPlayerPower() };
    window.guildWarV53Data.rankings.push(entry);
  }
  if (won) entry.wins++; else entry.losses++;
  entry.power = getPlayerPower();
  window.guildWarV53Data.rankings.sort(function(a,b){ return b.wins-a.wins; });
}

window.gw53GetActiveWars  = function() { return window.guildWarV53Data.activeWars.slice(); };
window.gw53GetWarHistory  = function() { return window.guildWarV53Data.warHistory.slice(0,20); };
window.gw53GetWarTypes    = function() { return Object.values(WAR_TYPES); };
window.gw53GetRankings    = function() { return window.guildWarV53Data.rankings.slice(0,10); };
window.gw53GetLog         = function() { return window.guildWarV53Data.log.slice(0,20); };

window.gw53GetStats = function() {
  const wins = window.guildWarV53Data.warHistory.filter(function(w){ return w.winner===getPlayerGuildId(); }).length;
  const losses = window.guildWarV53Data.warHistory.filter(function(w){ return w.loser===getPlayerGuildId(); }).length;
  return {
    activeWars:  window.guildWarV53Data.activeWars.length,
    totalWars:   window.guildWarV53Data.warHistory.length,
    wins, losses,
    winRate:     wins+losses>0 ? Math.round(wins/(wins+losses)*100)+'%' : 'N/A',
    playerPower: getPlayerPower()
  };
};

window.gw53GetJarvisReport = function() {
  const stats = window.gw53GetStats();
  const tips = [];
  if (stats.activeWars > 0) tips.push('⚔️ Đang có '+stats.activeWars+' chiến tranh — tăng cường tấn công để thắng');
  if (stats.playerPower < 200) tips.push('🏋️ Sức mạnh còn thấp ('+stats.playerPower+') — tuyển thêm quân hoặc nâng cấp HQ');
  if (stats.wins > 3) tips.push('🏆 '+stats.wins+' chiến thắng · Tỷ lệ thắng: '+stats.winRate);
  const top = window.guildWarV53Data.rankings[0];
  if (top) tips.push('🥇 Bang mạnh nhất BXH: '+top.name+' ('+top.wins+' thắng)');
  return { tips, stats };
};

// ─── TICK: Auto-resolve wars ──────────────────────────────────
function tick() {
  window.guildWarV53Data.tickCounter++;
  const curYear = typeof year !== 'undefined' ? year : 0;
  window.guildWarV53Data.activeWars.forEach(function(war) {
    if (war.status === 'active') {
      // Battle round mỗi 5 tick
      if (window.guildWarV53Data.tickCounter % 5 === 0) {
        const roundResult = Math.random() < 0.5 ? 'attacker' : 'defender';
        war.rounds.push({ year:curYear, result:roundResult });
      }
      // Auto-resolve khi đến năm kết thúc
      if (curYear >= war.endYear) {
        _settleWar(war);
        save();
      }
    }
  });
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };
  console.log('[GuildWarV53] ⚔️ Chiến Tranh Bang Hội V53 — 4 loại chiến tranh · Auto-resolve · Loot system · BXH chiến tích sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
