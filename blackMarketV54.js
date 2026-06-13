(function() {
"use strict";
// ============================================================
// BLACK MARKET V54 — Marketplace Expansion & Trading Network
// Player black market · Smuggling · Contraband · Guild underground
// EXPAND ONLY — Khác ev2BlackMarkets (NPC-level), V54 là player-facing
// ============================================================
const SAVE_KEY   = "cgv6_black_market_v54";
const INIT_DELAY = 8100;

// ─── HÀNG CẤM / CONTRABAND ───────────────────────────────────
const CONTRABAND = [
  { id:'forbidden_art',  icon:'📕', name:'Cấm Thư Tà Đạo',      price:5000,  risk:0.15, profit:2.5, desc:'Bí thuật bị cấm — sức mạnh cực lớn' },
  { id:'soul_crystal',   icon:'💠', name:'Hồn Tinh Nô Lệ',      price:8000,  risk:0.20, profit:3.0, desc:'Linh hồn bị nhốt trong tinh thể' },
  { id:'poison_pill',    icon:'☠️',  name:'Tuyệt Thế Độc Đan',   price:3000,  risk:0.12, profit:2.0, desc:'Linh đan chứa độc thần cực phẩm' },
  { id:'chaos_weapon',   icon:'🔱', name:'Vũ Khí Hỗn Mang',     price:20000, risk:0.25, profit:4.0, desc:'Vũ khí bị cấm vì quá nguy hiểm' },
  { id:'spy_report',     icon:'🕵️', name:'Bí Mật Quân Sự',      price:2000,  risk:0.10, profit:1.8, desc:'Tình báo mật từ các đế quốc' },
  { id:'ancient_relic',  icon:'🏺', name:'Cổ Vật Bị Truy Tìm',  price:15000, risk:0.18, profit:3.5, desc:'Bảo vật quốc gia đánh cắp' },
  { id:'bloodline_pill', icon:'🩸', name:'Đoạt Huyết Tiên Đan',  price:30000, risk:0.30, profit:5.0, desc:'Đan dược chiếm đoạt căn cốt người khác' },
  { id:'void_map',       icon:'🗺️',  name:'Bản Đồ Cấm Địa',     price:10000, risk:0.20, profit:2.8, desc:'Bản đồ dẫn đến vùng đất bị phong ấn' },
];

// ─── MẠNG LƯỚI NGẦM ──────────────────────────────────────────
const UNDERGROUND_TIERS = [
  { tier:1, icon:'🕳️', name:'Giao Dịch Bí Mật',    cost:0,     discount:0.05, riskReduction:0.10, maxStock:5  },
  { tier:2, icon:'🏴', name:'Đường Dây Buôn Lậu',  cost:1000,  discount:0.10, riskReduction:0.20, maxStock:15 },
  { tier:3, icon:'💀', name:'Tổ Chức Bóng Tối',    cost:5000,  discount:0.20, riskReduction:0.35, maxStock:30 },
  { tier:4, icon:'🌑', name:'Đại Liên Minh Ngầm',  cost:20000, discount:0.30, riskReduction:0.50, maxStock:50 },
];

// ─── FENCE (NGƯỜI TRUNG GIAN) ─────────────────────────────────
const FENCES = [
  { id:'fence1', name:'Lão Trương Buôn Đêm',  icon:'🧙', commission:0.15, specialty:'weapon',     rep:30 },
  { id:'fence2', name:'Hắc Liên Thương Hội',  icon:'🏴', commission:0.10, specialty:'mineral',    rep:60 },
  { id:'fence3', name:'Cô Bé Tóc Đen Thần Bí',icon:'🎭', commission:0.20, specialty:'spiritgear', rep:80 },
  { id:'fence4', name:'Thiên Hạ Thương Hội Đen',icon:'💰',commission:0.08, specialty:'all',        rep:100 },
];

// ─── STATE ────────────────────────────────────────────────────
window.blackMarketV54Data = {
  playerRep:      0,        // Danh tiếng chợ đen (0-100)
  networkTier:    1,        // Cấp mạng lưới ngầm (1-4)
  stockpile:      {},       // { contrabandId: qty }
  activeFence:    null,     // ID của fence hiện tại
  transactions:   [],       // { year, goodId, qty, price, type, outcome }
  arrests:        0,        // Số lần bị bắt
  escapes:        0,        // Số lần thoát khỏi truy đuổi
  totalProfit:    0,
  guildBlackMarket: null,   // Guild có chợ đen riêng không
  log:            [],
  tickCounter:    0,
  stats:          { smuggles:0, busts:0, totalContraband:0, totalProfit:0 },
  version: "V54"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.blackMarketV54Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.blackMarketV54Data = Object.assign(window.blackMarketV54Data, JSON.parse(d));
  } catch(e) {}
}
function bmLog(msg, type) {
  window.blackMarketV54Data.log.unshift({ year:typeof year!=='undefined'?year:0, msg, type:type||'info' });
  if (window.blackMarketV54Data.log.length > 60) window.blackMarketV54Data.log.pop();
}

// ─── HELPERS ─────────────────────────────────────────────────
function getCurrentTier() {
  return UNDERGROUND_TIERS.find(function(t){ return t.tier===window.blackMarketV54Data.networkTier; }) || UNDERGROUND_TIERS[0];
}
function calcRisk(contrabandId) {
  const item = CONTRABAND.find(function(c){ return c.id===contrabandId; });
  if (!item) return 0.5;
  const tier = getCurrentTier();
  const repBonus = window.blackMarketV54Data.playerRep * 0.001;
  return Math.max(0.01, item.risk - tier.riskReduction - repBonus);
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.bm54BuyContraband = function(contrabandId, qty) {
  const item = CONTRABAND.find(function(c){ return c.id===contrabandId; });
  if (!item) return { ok:false, msg:'Hàng cấm không tồn tại' };
  qty = Math.max(1, Math.floor(qty||1));
  const tier = getCurrentTier();
  const price = Math.floor(item.price * (1 - tier.discount)) * qty;

  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', price, 'Mua hàng cấm: '+item.name)
    : { ok:true };
  if (!spend.ok) return spend;

  // Kiểm tra bị bắt
  const risk = calcRisk(contrabandId);
  if (Math.random() < risk) {
    window.blackMarketV54Data.arrests++;
    window.blackMarketV54Data.stats.busts++;
    // Mất một nửa tiền (phí hối lộ)
    const bribe = Math.floor(price * 0.5);
    if (typeof window.pec52SpendCurrency === 'function') window.pec52SpendCurrency('bac', bribe, 'Phí hối lộ quan chức');
    bmLog('🚨 Bị bắt khi mua '+item.name+' — mất '+bribe+' bạc hối lộ thoát thân', 'bust');
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'crime', title:'🚨 Bị bắt buôn lậu: '+item.name, color:'#ef4444' });
    save();
    return { ok:false, msg:'BỊ BẮT! Đã hối lộ '+bribe+' bạc để thoát. Cần tăng cấp mạng lưới để giảm rủi ro.', busted:true };
  }

  window.blackMarketV54Data.stockpile[contrabandId] = (window.blackMarketV54Data.stockpile[contrabandId]||0) + qty;
  window.blackMarketV54Data.stats.smuggles++;
  window.blackMarketV54Data.playerRep = Math.min(100, window.blackMarketV54Data.playerRep + 1);
  bmLog('📦 Nhận hàng thành công: '+qty+'x '+item.name, 'success');
  save();
  return { ok:true, msg:'Đã mua '+qty+'x '+item.name+' · Giá: '+price+' bạc · Rep +1' };
};

window.bm54SellContraband = function(contrabandId, qty, fenceId) {
  const item = CONTRABAND.find(function(c){ return c.id===contrabandId; });
  if (!item) return { ok:false, msg:'Hàng cấm không tồn tại' };
  const stock = window.blackMarketV54Data.stockpile[contrabandId]||0;
  if (stock < qty) return { ok:false, msg:'Không đủ hàng (có '+stock+', cần '+qty+')' };

  const fence = FENCES.find(function(f){ return f.id===fenceId; }) || FENCES[0];
  const basePrice = item.price * item.profit;
  const profit = Math.floor(basePrice * qty * (1-fence.commission));

  window.blackMarketV54Data.stockpile[contrabandId] -= qty;
  if (window.blackMarketV54Data.stockpile[contrabandId] <= 0) delete window.blackMarketV54Data.stockpile[contrabandId];

  if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency('bac', profit, 'Chợ đen: bán '+item.name+' qua '+fence.name);
  window.blackMarketV54Data.totalProfit += profit;
  window.blackMarketV54Data.stats.totalProfit += profit;
  window.blackMarketV54Data.playerRep = Math.min(100, window.blackMarketV54Data.playerRep + 2);
  bmLog('💰 Bán '+qty+'x '+item.name+' qua '+fence.name+' · Nhận: '+profit+' bạc', 'success');
  window.blackMarketV54Data.transactions.unshift({ year:typeof year!=='undefined'?year:0, item:item.name, qty, profit, fence:fence.name });
  if (window.blackMarketV54Data.transactions.length > 20) window.blackMarketV54Data.transactions.pop();
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'trade', title:'💀 Chợ Đen: +'+profit+' bạc từ '+item.name, color:'#6366f1' });
  return { ok:true, msg:'Bán thành công · Nhận '+profit+' bạc qua '+fence.name, profit };
};

window.bm54UpgradeNetwork = function() {
  const nextTier = window.blackMarketV54Data.networkTier + 1;
  const tierInfo = UNDERGROUND_TIERS.find(function(t){ return t.tier===nextTier; });
  if (!tierInfo) return { ok:false, msg:'Đã đạt cấp mạng lưới tối đa' };
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', tierInfo.cost, 'Nâng cấp mạng lưới ngầm Cấp '+nextTier)
    : { ok:true };
  if (!spend.ok) return spend;
  window.blackMarketV54Data.networkTier = nextTier;
  bmLog('⬆️ Mạng lưới ngầm nâng lên '+tierInfo.name);
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'crime', title:'🕳️ Mạng lưới ngầm Cấp '+nextTier+': '+tierInfo.name, color:'#6366f1' });
  return { ok:true, msg:'Nâng cấp lên '+tierInfo.name+' · Giảm rủi ro '+Math.floor(tierInfo.riskReduction*100)+'%' };
};

window.bm54SetupGuildBlackMarket = function() {
  const pGuildId = typeof window.guildV53Data !== 'undefined' ? window.guildV53Data.playerGuildId : null;
  if (!pGuildId) return { ok:false, msg:'Cần có Bang Hội trước' };
  if (window.blackMarketV54Data.guildBlackMarket) return { ok:false, msg:'Bang đã có chợ đen riêng' };
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', 5000, 'Thiết lập Chợ Đen Bang Hội')
    : { ok:true };
  if (!spend.ok) return spend;
  window.blackMarketV54Data.guildBlackMarket = { guildId:pGuildId, level:1, income:200, foundYear:typeof year!=='undefined'?year:0 };
  bmLog('🏴 Chợ Đen Bang Hội đã thành lập · Thu nhập 200/tick');
  save();
  return { ok:true, msg:'Chợ Đen Bang Hội hoạt động · Thu nhập thụ động +200 bạc/tick' };
};

window.bm54GetContraband     = function() { return CONTRABAND.slice(); };
window.bm54GetFences         = function() { return FENCES.slice(); };
window.bm54GetNetworkTiers   = function() { return UNDERGROUND_TIERS.slice(); };
window.bm54GetStockpile      = function() {
  return Object.keys(window.blackMarketV54Data.stockpile).map(function(id) {
    const item = CONTRABAND.find(function(c){ return c.id===id; });
    return { id, qty:window.blackMarketV54Data.stockpile[id], item:item||{name:id,icon:'📦'} };
  });
};

window.bm54GetStats = function() {
  const tier = getCurrentTier();
  return {
    rep:          window.blackMarketV54Data.playerRep,
    tier:         window.blackMarketV54Data.networkTier,
    tierName:     tier.name,
    tierIcon:     tier.icon,
    arrests:      window.blackMarketV54Data.arrests,
    escapes:      window.blackMarketV54Data.escapes,
    totalProfit:  window.blackMarketV54Data.totalProfit,
    stockItems:   Object.keys(window.blackMarketV54Data.stockpile).length,
    guildBM:      !!window.blackMarketV54Data.guildBlackMarket,
    stats:        window.blackMarketV54Data.stats,
    log:          window.blackMarketV54Data.log.slice(0,8)
  };
};

window.bm54GetJarvisReport = function() {
  const stats = window.bm54GetStats();
  const tips = [];
  if (stats.rep < 30) tips.push('🕳️ Danh tiếng chợ đen còn thấp — nhiều giao dịch hơn để tăng uy tín');
  if (stats.tier < 3) tips.push('⬆️ Nâng cấp mạng lưới để giảm rủi ro bị bắt');
  if (!stats.guildBM) tips.push('🏴 Thiết lập Chợ Đen Bang Hội để có thu nhập thụ động bí mật');
  if (stats.arrests > 3) tips.push('🚨 Đã bị bắt '+stats.arrests+' lần — hãy nâng cấp mạng lưới ngay');
  tips.push('💰 Tổng lợi nhuận chợ đen: '+stats.totalProfit+' bạc');
  return { tips, stats };
};

// ─── TICK ──────────────────────────────────────────────────────
function tick() {
  const d = window.blackMarketV54Data;
  d.tickCounter++;
  // Guild black market income
  if (d.tickCounter % 8 === 0 && d.guildBlackMarket) {
    const income = d.guildBlackMarket.income || 200;
    if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency('bac', income, 'Thu nhập Chợ Đen Bang Hội (bí mật)');
    d.totalProfit += income;
    save();
  }
}

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if (_orig) _orig(); tick(); };
  console.log('[BlackMarketV54] 💀 Chợ Đen V54 — 8 loại hàng cấm · 4 fence · 4 cấp mạng lưới ngầm · Guild black market · Khác ev2BlackMarkets sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
