(function() {
"use strict";
// ============================================================
// SUPPLY DEMAND V54 — Marketplace Expansion & Trading Network
// Dynamic pricing · Disaster/War/Age/Pop modifiers · Market events
// EXPAND ONLY — Khác ev2ResourceMarket (NPC), V54 là player-facing
// ============================================================
const SAVE_KEY   = "cgv6_supply_demand_v54";
const INIT_DELAY = 8000;

// ─── MARKET EVENTS ───────────────────────────────────────────
const MARKET_EVENTS = {
  boom:          { id:'boom',      icon:'📈', name:'Thị Trường Bùng Nổ',   priceMod:+0.30, prob:0.04, duration:20, color:'#22c55e' },
  crash:         { id:'crash',     icon:'📉', name:'Sụp Đổ Thị Trường',   priceMod:-0.35, prob:0.03, duration:15, color:'#ef4444' },
  shortage:      { id:'shortage',  icon:'⚠️', name:'Khan Hiếm Hàng Hóa',  priceMod:+0.50, prob:0.05, duration:10, color:'#f59e0b' },
  surplus:       { id:'surplus',   icon:'📦', name:'Dư Thừa Hàng Hóa',    priceMod:-0.25, prob:0.04, duration:12, color:'#60a5fa' },
  golden_age:    { id:'golden_age',icon:'✨', name:'Thời Đại Vàng Thương Mại',priceMod:+0.20, prob:0.02, duration:30, color:'#facc15' },
  trade_war:     { id:'trade_war', icon:'⚔️', name:'Chiến Tranh Thương Mại',priceMod:-0.20, prob:0.03, duration:25, color:'#f87171' },
  discovery:     { id:'discovery', icon:'🔍', name:'Phát Hiện Mỏ Khoáng Sản',priceMod:-0.15, prob:0.03, duration:20, color:'#a78bfa' },
};

// ─── MODIFIER FACTORS ────────────────────────────────────────
// Các yếu tố ảnh hưởng đến giá cả
const MODIFIERS = {
  disaster:    { label:'Thiên Tai',      effect:+0.25, desc:'Phá hoại chuỗi cung ứng' },
  war:         { label:'Chiến Tranh',    effect:+0.20, desc:'Nguyên liệu chiến tranh tăng giá' },
  plague:      { label:'Đại Dịch',       effect:+0.15, desc:'Khan hiếm nhân lực sản xuất' },
  golden_age:  { label:'Thịnh Vượng',   effect:-0.15, desc:'Nền kinh tế phát triển' },
  dark_age:    { label:'Hắc Ám Kỷ',     effect:+0.35, desc:'Mọi thứ đều khan hiếm' },
  tech_age:    { label:'Kỷ Công Nghệ',  effect:-0.20, desc:'Sản xuất hàng loạt' },
  high_pop:    { label:'Dân Số Cao',    effect:+0.10, desc:'Nhu cầu tăng cao' },
  low_pop:     { label:'Dân Số Thấp',   effect:-0.05, desc:'Cầu giảm, cung dồi dào' },
};

// ─── STATE ────────────────────────────────────────────────────
window.supplyDemandV54Data = {
  prices:          {},  // { goodsId: currentPrice }
  activeModifiers: [], // [ { id, label, effect, expiresYear } ]
  marketEvents:    [], // { id, name, priceMod, startYear, endYear, affectedGoods[] }
  priceHistory:    {}, // { goodsId: [ { year, price } ] }
  tickCounter:     0,
  stats:           { eventsTriggered:0, biggestSwing:0, currentTrend:'neutral' },
  version: "V54"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.supplyDemandV54Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.supplyDemandV54Data = Object.assign(window.supplyDemandV54Data, JSON.parse(d));
  } catch(e) {}
}
function sdLog(msg, type) {
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'economy', title:msg, color: type==='crash'?'#ef4444':type==='boom'?'#22c55e':'#60a5fa' });
}

// ─── HELPERS ─────────────────────────────────────────────────
function getGoodsCatalog() {
  return typeof window.gs54GetCatalog === 'function' ? window.gs54GetCatalog() : [];
}

function initPrices() {
  const catalog = getGoodsCatalog();
  catalog.forEach(function(g) {
    if (!window.supplyDemandV54Data.prices[g.id]) {
      window.supplyDemandV54Data.prices[g.id] = g.basePrice || 100;
    }
  });
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.sd54GetCurrentPrice = function(goodsId) {
  return window.supplyDemandV54Data.prices[goodsId] || 100;
};

window.sd54GetPriceModifier = function(goodsId) {
  const base = window.supplyDemandV54Data.prices[goodsId] || 100;
  const goods = getGoodsCatalog().find(function(g){ return g.id===goodsId; });
  if (!goods) return 1.0;
  return base / goods.basePrice;
};

window.sd54GetAllPrices = function() {
  return Object.keys(window.supplyDemandV54Data.prices).map(function(id) {
    const goods = getGoodsCatalog().find(function(g){ return g.id===id; });
    const basePrice = goods ? goods.basePrice : 100;
    const currentPrice = window.supplyDemandV54Data.prices[id];
    const pct = Math.round((currentPrice/basePrice - 1)*100);
    return {
      id, name:goods?goods.name:id, icon:goods?goods.icon:'📦',
      basePrice, currentPrice,
      trend: pct > 10?'rising':pct<-10?'falling':'stable',
      pct
    };
  });
};

window.sd54GetActiveEvents = function() {
  const curYear = typeof year!=='undefined'?year:0;
  return window.supplyDemandV54Data.marketEvents.filter(function(e){ return e.endYear > curYear; });
};

window.sd54GetModifiers = function() { return window.supplyDemandV54Data.activeModifiers.slice(); };

window.sd54ApplyExternalModifier = function(modId, durationYears) {
  const mod = MODIFIERS[modId];
  if (!mod) return;
  const curYear = typeof year!=='undefined'?year:0;
  window.supplyDemandV54Data.activeModifiers.push({
    id: modId, label:mod.label, effect:mod.effect,
    expiresYear: curYear + (durationYears||20)
  });
};

window.sd54TriggerMarketEvent = function(eventId, affectedGoods) {
  const ev = MARKET_EVENTS[eventId];
  if (!ev) return;
  const curYear = typeof year!=='undefined'?year:0;
  const goodsToAffect = affectedGoods || getGoodsCatalog().slice(0,8).map(function(g){ return g.id; });

  window.supplyDemandV54Data.marketEvents.unshift({
    id: 'mev_'+Date.now().toString(36),
    eventId, name:ev.name, icon:ev.icon, priceMod:ev.priceMod,
    startYear:curYear, endYear:curYear+ev.duration,
    affectedGoods: goodsToAffect
  });
  if (window.supplyDemandV54Data.marketEvents.length > 20) window.supplyDemandV54Data.marketEvents.pop();
  window.supplyDemandV54Data.stats.eventsTriggered++;

  // Apply price change
  goodsToAffect.forEach(function(id) {
    const oldPrice = window.supplyDemandV54Data.prices[id]||100;
    const newPrice = Math.max(1, Math.floor(oldPrice * (1 + ev.priceMod)));
    window.supplyDemandV54Data.prices[id] = newPrice;
    const goods = getGoodsCatalog().find(function(g){ return g.id===id; });
    if (!window.supplyDemandV54Data.priceHistory[id]) window.supplyDemandV54Data.priceHistory[id] = [];
    window.supplyDemandV54Data.priceHistory[id].push({ year:curYear, price:newPrice });
    if (window.supplyDemandV54Data.priceHistory[id].length > 20) window.supplyDemandV54Data.priceHistory[id].shift();
    const swing = Math.abs(newPrice - oldPrice);
    if (swing > window.supplyDemandV54Data.stats.biggestSwing) window.supplyDemandV54Data.stats.biggestSwing = swing;
  });

  sdLog(ev.icon+' '+ev.name+': '+Math.round(ev.priceMod*100)+'% giá thị trường', ev.priceMod>0?'boom':'crash');
  save();
  return { ok:true, msg:ev.name+' · Ảnh hưởng '+goodsToAffect.length+' mặt hàng' };
};

window.sd54GetStats = function() {
  const prices = window.sd54GetAllPrices();
  const rising  = prices.filter(function(p){ return p.trend==='rising'; }).length;
  const falling = prices.filter(function(p){ return p.trend==='falling'; }).length;
  const trend   = rising>falling ? 'rising' : falling>rising ? 'falling' : 'neutral';
  return {
    totalGoods:   prices.length,
    rising, falling,
    trend,
    trendIcon:    trend==='rising'?'📈':trend==='falling'?'📉':'➡️',
    activeEvents: window.sd54GetActiveEvents().length,
    totalEvents:  window.supplyDemandV54Data.stats.eventsTriggered,
    biggestSwing: window.supplyDemandV54Data.stats.biggestSwing
  };
};

window.sd54GetJarvisReport = function() {
  const stats = window.sd54GetStats();
  const prices = window.sd54GetAllPrices();
  const tips = [];
  if (stats.trend === 'rising') tips.push('📈 Thị trường đang tăng — tốt thời điểm bán hàng hóa');
  if (stats.trend === 'falling') tips.push('📉 Thị trường đang giảm — nên mua vào và chờ phục hồi');
  const topPrice = prices.sort(function(a,b){ return b.pct-a.pct; })[0];
  if (topPrice && topPrice.pct > 20) tips.push('🚀 '+topPrice.name+' đang tăng '+topPrice.pct+'% — bán ngay!');
  const bottomPrice = prices.sort(function(a,b){ return a.pct-b.pct; })[0];
  if (bottomPrice && bottomPrice.pct < -20) tips.push('💰 '+bottomPrice.name+' đang giảm '+Math.abs(bottomPrice.pct)+'% — cơ hội mua!');
  const events = window.sd54GetActiveEvents();
  if (events.length > 0) tips.push('⚡ Có '+events.length+' sự kiện thị trường đang diễn ra');
  return { tips, stats };
};

// ─── TICK: Auto price fluctuation + sync world events ──────────
function tick() {
  const d = window.supplyDemandV54Data;
  d.tickCounter++;
  if (d.tickCounter % 15 !== 0) return;

  initPrices();
  const curYear = typeof year!=='undefined'?year:0;
  const catalog = getGoodsCatalog();

  // Xóa modifier hết hạn
  d.activeModifiers = d.activeModifiers.filter(function(m){ return m.expiresYear > curYear; });

  // Sync với world events (disasters, wars, plagues)
  let envMod = 0;
  if (typeof window.disasterData !== 'undefined' && window.disasterData.active && window.disasterData.active.length > 0) {
    envMod += MODIFIERS.disaster.effect;
  }
  if (typeof window.warsActive !== 'undefined' && Array.isArray(window.warsActive) && window.warsActive.length > 3) {
    envMod += MODIFIERS.war.effect;
  }
  if (typeof window.plagueData !== 'undefined' && window.plagueData.plagues && window.plagueData.plagues.length > 0) {
    envMod += MODIFIERS.plague.effect;
  }

  // Sync Age
  if (typeof window.ageV25Data !== 'undefined') {
    const age = window.ageV25Data.currentAge;
    if (age === 'golden') envMod += MODIFIERS.golden_age.effect;
    if (age === 'dark')   envMod += MODIFIERS.dark_age.effect;
    if (age === 'tech')   envMod += MODIFIERS.tech_age.effect;
  }

  // Total modifier from active list
  const totalMod = d.activeModifiers.reduce(function(s,m){ return s+m.effect; }, 0) + envMod;

  // Random price fluctuation per good
  catalog.forEach(function(g) {
    const base = g.basePrice||100;
    const current = d.prices[g.id]||base;
    const swing = (Math.random()-0.5) * 0.08 + totalMod*0.02;
    const newPrice = Math.max(Math.floor(base*0.2), Math.min(Math.floor(base*5), Math.floor(current*(1+swing))));
    d.prices[g.id] = newPrice;
  });

  // Auto market event (random)
  if (Math.random() < 0.03) {
    const eventKeys = Object.keys(MARKET_EVENTS);
    const eventId = eventKeys[Math.floor(Math.random()*eventKeys.length)];
    const affectedGoods = catalog.slice(Math.floor(Math.random()*5), Math.floor(Math.random()*5)+5).map(function(g){ return g.id; });
    window.sd54TriggerMarketEvent(eventId, affectedGoods);
  }

  d.stats.currentTrend = totalMod > 0.05 ? 'rising' : totalMod < -0.05 ? 'falling' : 'neutral';
  save();
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  initPrices();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };
  console.log('[SupplyDemandV54] 📊 Cung Cầu Giá Cả V54 — 7 loại sự kiện thị trường · Dynamic pricing · Disaster/War/Age/Pop modifiers · Auto fluctuation sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
