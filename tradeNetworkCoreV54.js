(function() {
"use strict";
// ============================================================
// TRADE NETWORK CORE V54 — Marketplace Expansion & Trading Network
// 4 loại tuyến thương mại · Guild routes · Empire routes · Liên vũ trụ
// EXPAND ONLY — Extends oceanTradeEngineV27 (KHÔNG ghi đè)
// ============================================================
const SAVE_KEY   = "cgv6_trade_network_v54";
const INIT_DELAY = 7800;

// ─── LOẠI TUYẾN ───────────────────────────────────────────────
const ROUTE_TYPES = {
  domestic:     { id:'domestic',    icon:'🏘️', name:'Nội Địa',         baseCost:100,  baseIncome:50,   risk:0.05, taxRate:0.08 },
  international:{ id:'international',icon:'🌍', name:'Quốc Tế',         baseCost:500,  baseIncome:200,  risk:0.12, taxRate:0.12 },
  empire:       { id:'empire',      icon:'👑', name:'Đế Quốc',          baseCost:2000, baseIncome:800,  risk:0.08, taxRate:0.10 },
  multiverse:   { id:'multiverse',  icon:'🌌', name:'Liên Vũ Trụ',      baseCost:8000, baseIncome:3000, risk:0.20, taxRate:0.15 },
};

// ─── PHƯƠNG TIỆN VẬN CHUYỂN ─────────────────────────────────
const TRANSPORT_MODES = {
  caravan:  { id:'caravan',  icon:'🐪', name:'Thương Đoàn',    speedMod:1.0, riskMod:1.0,  capacityMod:1.0 },
  ship:     { id:'ship',     icon:'⛵', name:'Thuyền Buôn',    speedMod:1.5, riskMod:0.8,  capacityMod:1.5 },
  airship:  { id:'airship',  icon:'🎈', name:'Phi Thuyền',     speedMod:2.0, riskMod:1.2,  capacityMod:0.8 },
  portal:   { id:'portal',   icon:'🌀', name:'Cổng Dịch Chuyển',speedMod:5.0, riskMod:0.5, capacityMod:2.0 },
  godship:  { id:'godship',  icon:'⚡', name:'Thiên Thuyền',   speedMod:10.0,riskMod:0.1,  capacityMod:3.0 },
};

// ─── SỰ KIỆN TUYẾN ĐƯỜNG ─────────────────────────────────────
const ROUTE_EVENTS = [
  { id:'bandit',    icon:'🗡️', name:'Bị Cướp',          prob:0.06, effect:'income -30%',  incomeMod:-0.30 },
  { id:'storm',     icon:'⛈️', name:'Bão Tố',            prob:0.04, effect:'delay +5y',    incomeMod:-0.10 },
  { id:'boom',      icon:'📈', name:'Thị Trường Bùng Nổ',prob:0.08, effect:'income +50%',  incomeMod:+0.50 },
  { id:'tax',       icon:'📋', name:'Thuế Đặc Biệt',     prob:0.05, effect:'income -20%',  incomeMod:-0.20 },
  { id:'discovery', icon:'✨', name:'Khám Phá Tuyến Mới', prob:0.03, effect:'income +100%', incomeMod:+1.00 },
  { id:'war',       icon:'⚔️', name:'Chiến Sự Trên Đường',prob:0.05, effect:'income -50%',  incomeMod:-0.50 },
];

// ─── STATE ────────────────────────────────────────────────────
window.tradeNetV54Data = {
  routes:       [],   // { id, name, type, transport, from, to, goodsIds[], baseIncome, level, status, ownerId, tax, events[] }
  guildRoutes:  [],   // routes owned by player guild
  empireRoutes: [],   // routes under empire control
  totalRevenue: 0,
  tickCounter:  0,
  log:          [],
  stats:        { routesBuilt:0, totalIncome:0, eventsTriggered:0, taxCollected:0 },
  version: "V54"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.tradeNetV54Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.tradeNetV54Data = Object.assign(window.tradeNetV54Data, JSON.parse(d));
  } catch(e) {}
}
function tnLog(msg, type) {
  window.tradeNetV54Data.log.unshift({ year:typeof year!=='undefined'?year:0, msg, type:type||'info' });
  if (window.tradeNetV54Data.log.length > 80) window.tradeNetV54Data.log.pop();
}

// ─── HELPERS ─────────────────────────────────────────────────
function _rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function getPlayerGuildId() {
  return typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
}
function getEmpireName() {
  return typeof window.playerEmpireV53Data !== 'undefined' ? window.playerEmpireV53Data.imperialName : null;
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.tn54EstablishRoute = function(name, typeId, transportId, fromLoc, toLoc, goodsIds) {
  const routeType = ROUTE_TYPES[typeId];
  if (!routeType) return { ok:false, msg:'Loại tuyến không hợp lệ' };
  const transport = TRANSPORT_MODES[transportId||'caravan'];

  // Chi phí thiết lập
  const cost = Math.floor(routeType.baseCost * (transport.capacityMod||1));
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', cost, 'Thiết lập tuyến: '+name)
    : { ok:true };
  if (!spend.ok) return spend;

  const route = {
    id:          'tn54_'+Date.now().toString(36),
    name:        name || routeType.name+' #'+(window.tradeNetV54Data.routes.length+1),
    type:        typeId,
    typeName:    routeType.name,
    typeIcon:    routeType.icon,
    transport:   transportId||'caravan',
    transportIcon: transport.icon,
    from:        fromLoc||'Thủ Đô',
    to:          toLoc||'Vùng Đất Xa',
    goodsIds:    Array.isArray(goodsIds)?goodsIds:['food','mineral'],
    baseIncome:  Math.floor(routeType.baseIncome * transport.capacityMod),
    risk:        routeType.risk * transport.riskMod,
    tax:         routeType.taxRate,
    level:       1,
    status:      'active',
    ownerId:     getPlayerGuildId()||'player',
    events:      [],
    foundYear:   typeof year!=='undefined'?year:0,
    totalEarned: 0
  };

  window.tradeNetV54Data.routes.push(route);
  window.tradeNetV54Data.stats.routesBuilt++;

  // Ghi vào guild/empire nếu có
  if (typeId === 'empire' && getEmpireName()) window.tradeNetV54Data.empireRoutes.push(route.id);
  if (getPlayerGuildId()) window.tradeNetV54Data.guildRoutes.push(route.id);

  tnLog(routeType.icon+' Tuyến mới: '+route.name+' ('+fromLoc+'→'+toLoc+')');
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'trade', title:'🛤️ Tuyến TM mới: '+name, color:'#22c55e' });
  return { ok:true, msg:'Đã thiết lập tuyến: '+name+' · Thu nhập: '+route.baseIncome+'/tick', route };
};

window.tn54UpgradeRoute = function(routeId) {
  const r = window.tradeNetV54Data.routes.find(function(x){ return x.id===routeId; });
  if (!r) return { ok:false, msg:'Tuyến không tồn tại' };
  if (r.level >= 5) return { ok:false, msg:'Đã đạt cấp tối đa' };
  const cost = ROUTE_TYPES[r.type].baseCost * r.level;
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', cost, 'Nâng cấp tuyến '+r.name)
    : { ok:true };
  if (!spend.ok) return spend;
  r.level++;
  r.baseIncome = Math.floor(r.baseIncome * 1.30);
  tnLog('⬆️ Nâng cấp tuyến '+r.name+' lên cấp '+r.level+' · Thu nhập → '+r.baseIncome);
  save();
  return { ok:true, msg:r.name+' nâng lên cấp '+r.level };
};

window.tn54CloseRoute = function(routeId) {
  const r = window.tradeNetV54Data.routes.find(function(x){ return x.id===routeId; });
  if (!r) return { ok:false, msg:'Tuyến không tồn tại' };
  r.status = 'closed';
  tnLog('❌ Đóng tuyến: '+r.name);
  save();
  return { ok:true, msg:'Đã đóng tuyến '+r.name };
};

window.tn54GetRoutes       = function(typeId) {
  const routes = window.tradeNetV54Data.routes;
  return typeId ? routes.filter(function(r){ return r.type===typeId && r.status==='active'; }) : routes.filter(function(r){ return r.status==='active'; });
};
window.tn54GetRouteTypes   = function() { return Object.values(ROUTE_TYPES); };
window.tn54GetTransports   = function() { return Object.values(TRANSPORT_MODES); };

window.tn54GetStats = function() {
  const activeRoutes = window.tradeNetV54Data.routes.filter(function(r){ return r.status==='active'; });
  const totalIncome  = activeRoutes.reduce(function(s,r){ return s+r.baseIncome; }, 0);
  return {
    totalRoutes:   activeRoutes.length,
    domestic:      activeRoutes.filter(function(r){ return r.type==='domestic'; }).length,
    international: activeRoutes.filter(function(r){ return r.type==='international'; }).length,
    empire:        activeRoutes.filter(function(r){ return r.type==='empire'; }).length,
    multiverse:    activeRoutes.filter(function(r){ return r.type==='multiverse'; }).length,
    incomePerTick: totalIncome,
    totalRevenue:  window.tradeNetV54Data.totalRevenue,
    stats:         window.tradeNetV54Data.stats,
    log:           window.tradeNetV54Data.log.slice(0,8)
  };
};

window.tn54GetJarvisReport = function() {
  const stats = window.tn54GetStats();
  const tips = [];
  if (stats.totalRoutes === 0) tips.push('🛤️ Chưa có tuyến thương mại — thiết lập ngay để có thu nhập thụ động');
  if (stats.multiverse === 0 && getEmpireName()) tips.push('🌌 Đế quốc đủ mạnh để mở tuyến Liên Vũ Trụ — lợi nhuận x30!');
  if (stats.totalRoutes > 0) tips.push('💰 Thu nhập tuyến thương mại: '+stats.incomePerTick+' bạc/tick');
  const richRoute = window.tradeNetV54Data.routes.sort(function(a,b){ return b.totalEarned-a.totalEarned; })[0];
  if (richRoute) tips.push('🏆 Tuyến giàu nhất: '+richRoute.name+' (đã kiếm '+richRoute.totalEarned+')');
  return { tips, stats };
};

// ─── TICK ──────────────────────────────────────────────────────
function tick() {
  const d = window.tradeNetV54Data;
  d.tickCounter++;
  if (d.tickCounter % 6 !== 0) return;

  const activeRoutes = d.routes.filter(function(r){ return r.status==='active'; });
  if (activeRoutes.length === 0) return;

  let totalIncome = 0;
  activeRoutes.forEach(function(r) {
    let income = r.baseIncome;

    // Sự kiện ngẫu nhiên
    ROUTE_EVENTS.forEach(function(ev) {
      if (Math.random() < ev.prob * 0.1) {
        income = Math.floor(income * (1 + ev.incomeMod));
        r.events.unshift({ year:typeof year!=='undefined'?year:0, event:ev.name, icon:ev.icon });
        if (r.events.length > 5) r.events.pop();
        d.stats.eventsTriggered++;
        tnLog(ev.icon+' '+r.name+': '+ev.name);
      }
    });

    // Supply/demand modifier
    if (typeof window.sd54GetPriceModifier === 'function' && r.goodsIds.length > 0) {
      const mod = window.sd54GetPriceModifier(r.goodsIds[0]);
      income = Math.floor(income * mod);
    }

    income = Math.max(0, income);
    r.totalEarned = (r.totalEarned||0) + income;
    totalIncome += income;

    // Tax deduction
    const taxAmt = Math.floor(income * r.tax);
    d.stats.taxCollected += taxAmt;
    income -= taxAmt;
  });

  if (totalIncome > 0 && typeof window.pec52AddCurrency === 'function') {
    window.pec52AddCurrency('bac', totalIncome, 'Thu nhập tuyến thương mại ('+activeRoutes.length+' tuyến)');
  }
  d.totalRevenue += totalIncome;
  d.stats.totalIncome += totalIncome;
  save();
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };
  console.log('[TradeNetworkCoreV54] 🛤️ Mạng Lưới Thương Mại V54 — 4 loại tuyến (Nội Địa/Quốc Tế/Đế Quốc/Liên Vũ Trụ) · 5 phương tiện · 6 sự kiện ngẫu nhiên · Extends oceanTradeEngineV27 sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
