(function() {
"use strict";
// ============================================================
// GOODS SYSTEM V54 — Marketplace Expansion & Trading Network
// 6 danh mục · 30+ hàng hóa · Guild/Empire goods · Custom goods
// EXPAND ONLY — Khác ev2Resources (NPC level), V54 là player-facing
// ============================================================
const SAVE_KEY   = "cgv6_goods_v54";
const INIT_DELAY = 7900;

// ─── DANH MỤC HÀNG HÓA ───────────────────────────────────────
const GOODS_CATEGORIES = {
  food:       { id:'food',      icon:'🌾', name:'Thực Phẩm',     color:'#22c55e'  },
  mineral:    { id:'mineral',   icon:'⛏️',  name:'Khoáng Sản',    color:'#60a5fa'  },
  weapon:     { id:'weapon',    icon:'⚔️',  name:'Vũ Khí',        color:'#ef4444'  },
  spiritgear: { id:'spiritgear',icon:'✨',  name:'Thần Khí',      color:'#a78bfa'  },
  rare:       { id:'rare',      icon:'💎',  name:'Tài Nguyên Hiếm',color:'#fbbf24' },
  custom:     { id:'custom',    icon:'🎁',  name:'Hàng Tùy Chỉnh',color:'#94a3b8' },
};

// ─── CATALOG HÀNG HÓA (30+ loại) ─────────────────────────────
const GOODS_CATALOG = [
  // Thực Phẩm
  { id:'rice',       cat:'food',      name:'Gạo Thần',          icon:'🍚', basePrice:20,   rarity:1, weight:5 },
  { id:'herb',       cat:'food',      name:'Linh Thảo',         icon:'🌿', basePrice:80,   rarity:2, weight:1 },
  { id:'beast_meat', cat:'food',      name:'Thịt Linh Thú',     icon:'🍖', basePrice:150,  rarity:3, weight:3 },
  { id:'divine_fruit',cat:'food',     name:'Thiên Phẩm Tiên Quả',icon:'🍑',basePrice:2000, rarity:5, weight:1 },
  { id:'wine',       cat:'food',      name:'Linh Tửu Thiên Niên',icon:'🍷',basePrice:500,  rarity:4, weight:2 },
  // Khoáng Sản
  { id:'iron_ore',   cat:'mineral',   name:'Quặng Sắt',         icon:'⚙️', basePrice:30,   rarity:1, weight:10 },
  { id:'silver',     cat:'mineral',   name:'Bạch Kim Sa',       icon:'🪙', basePrice:200,  rarity:3, weight:5 },
  { id:'spirit_stone',cat:'mineral',  name:'Linh Thạch',        icon:'💎', basePrice:1000, rarity:4, weight:2 },
  { id:'chaos_ore',  cat:'mineral',   name:'Hỗn Độn Nguyên Thạch',icon:'🌑',basePrice:5000,rarity:5, weight:1 },
  { id:'void_crystal',cat:'mineral',  name:'Hư Không Tinh Thể', icon:'🔮', basePrice:8000, rarity:6, weight:1 },
  // Vũ Khí
  { id:'sword',      cat:'weapon',    name:'Linh Kiếm',         icon:'🗡️', basePrice:500,  rarity:2, weight:3 },
  { id:'bow',        cat:'weapon',    name:'Thần Cung',         icon:'🏹', basePrice:400,  rarity:2, weight:2 },
  { id:'spirit_armor',cat:'weapon',   name:'Linh Giáp',         icon:'🛡️', basePrice:1500, rarity:3, weight:5 },
  { id:'divine_blade',cat:'weapon',   name:'Thần Binh Thất Sát',icon:'⚔️', basePrice:10000,rarity:5, weight:2 },
  // Thần Khí
  { id:'pill',       cat:'spiritgear',name:'Thánh Đan',         icon:'💊', basePrice:3000, rarity:4, weight:1 },
  { id:'talisman',   cat:'spiritgear',name:'Linh Phù',          icon:'📜', basePrice:800,  rarity:3, weight:1 },
  { id:'cauldron',   cat:'spiritgear',name:'Luyện Đan Đỉnh',   icon:'🏺', basePrice:5000, rarity:4, weight:8 },
  { id:'jade_slip',  cat:'spiritgear',name:'Ngọc Giản Bí Thuật',icon:'📗', basePrice:2000, rarity:4, weight:1 },
  { id:'heavenly_art',cat:'spiritgear',name:'Thiên Thư Công Pháp',icon:'📕',basePrice:15000,rarity:6, weight:1 },
  // Tài Nguyên Hiếm
  { id:'dragon_bone',cat:'rare',      name:'Xương Rồng Cổ Đại', icon:'🦴', basePrice:20000,rarity:6, weight:3 },
  { id:'phoenix_feather',cat:'rare',  name:'Lông Phượng Bất Tử',icon:'🪶', basePrice:30000,rarity:6, weight:1 },
  { id:'world_tree', cat:'rare',      name:'Thế Giới Thần Mộc',  icon:'🌳', basePrice:50000,rarity:7, weight:20 },
  { id:'divine_blood',cat:'rare',     name:'Huyết Dịch Chân Thần',icon:'🩸',basePrice:80000,rarity:7, weight:1 },
  { id:'cosmos_fragment',cat:'rare',  name:'Vũ Trụ Chi Phiến',  icon:'🌌', basePrice:100000,rarity:8,weight:1 },
  // Hàng Tùy Chỉnh (placeholder)
  { id:'custom_1',   cat:'custom',    name:'Hàng Đặc Biệt A',   icon:'🎁', basePrice:1000, rarity:3, weight:2 },
  { id:'custom_2',   cat:'custom',    name:'Hàng Đặc Biệt B',   icon:'📦', basePrice:2000, rarity:4, weight:2 },
];

// ─── STATE ────────────────────────────────────────────────────
window.goodsV54Data = {
  playerInventory: {},  // { goodsId: quantity }
  guildWarehouse:  {},  // { goodsId: quantity } — guild-owned
  empireStockpile: {},  // { goodsId: quantity } — empire strategic reserve
  customGoods:     [],  // player-created custom goods
  transactions:    [],  // { year, goodsId, qty, price, type, buyer, seller }
  tickCounter:     0,
  stats:           { totalBought:0, totalSold:0, totalVolume:0 },
  version: "V54"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.goodsV54Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.goodsV54Data = Object.assign(window.goodsV54Data, JSON.parse(d));
  } catch(e) {}
}

// ─── PUBLIC API ───────────────────────────────────────────────

window.gs54GetCatalog = function(cat) {
  return cat ? GOODS_CATALOG.filter(function(g){ return g.cat===cat; }) : GOODS_CATALOG.slice();
};
window.gs54GetCategories = function() { return Object.values(GOODS_CATEGORIES); };

window.gs54BuyGoods = function(goodsId, qty, buyer) {
  const good = GOODS_CATALOG.find(function(g){ return g.id===goodsId; });
  if (!good) return { ok:false, msg:'Hàng hóa không tồn tại' };
  qty = Math.max(1, Math.floor(qty||1));

  // Lấy giá từ supply/demand nếu có
  let price = good.basePrice;
  if (typeof window.sd54GetCurrentPrice === 'function') price = window.sd54GetCurrentPrice(goodsId);
  const total = price * qty;

  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency('bac', total, 'Mua '+qty+'x '+good.name)
    : { ok:true };
  if (!spend.ok) return spend;

  buyer = buyer || 'player';
  if (buyer === 'player') {
    window.goodsV54Data.playerInventory[goodsId] = (window.goodsV54Data.playerInventory[goodsId]||0) + qty;
  } else if (buyer === 'guild') {
    window.goodsV54Data.guildWarehouse[goodsId] = (window.goodsV54Data.guildWarehouse[goodsId]||0) + qty;
  } else if (buyer === 'empire') {
    window.goodsV54Data.empireStockpile[goodsId] = (window.goodsV54Data.empireStockpile[goodsId]||0) + qty;
  }

  window.goodsV54Data.transactions.unshift({ year:typeof year!=='undefined'?year:0, goodsId, name:good.name, qty, price:total, type:'buy', buyer });
  if (window.goodsV54Data.transactions.length > 50) window.goodsV54Data.transactions.pop();
  window.goodsV54Data.stats.totalBought += qty;
  window.goodsV54Data.stats.totalVolume += total;
  save();
  return { ok:true, msg:'Đã mua '+qty+'x '+good.name+' · Giá: '+total+' bạc' };
};

window.gs54SellGoods = function(goodsId, qty, owner) {
  const good = GOODS_CATALOG.find(function(g){ return g.id===goodsId; });
  if (!good) return { ok:false, msg:'Hàng hóa không tồn tại' };
  qty = Math.max(1, Math.floor(qty||1));
  owner = owner || 'player';

  const inv = owner==='guild' ? window.goodsV54Data.guildWarehouse :
              owner==='empire' ? window.goodsV54Data.empireStockpile :
              window.goodsV54Data.playerInventory;

  if (!inv[goodsId]||inv[goodsId]<qty) return { ok:false, msg:'Không đủ hàng hóa (có '+( inv[goodsId]||0)+', cần '+qty+')' };

  let price = good.basePrice;
  if (typeof window.sd54GetCurrentPrice === 'function') price = window.sd54GetCurrentPrice(goodsId);
  const total = Math.floor(price * qty * 0.90); // 10% phí bán

  inv[goodsId] -= qty;
  if (inv[goodsId] <= 0) delete inv[goodsId];

  if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency('bac', total, 'Bán '+qty+'x '+good.name);
  window.goodsV54Data.transactions.unshift({ year:typeof year!=='undefined'?year:0, goodsId, name:good.name, qty, price:total, type:'sell', seller:owner });
  if (window.goodsV54Data.transactions.length > 50) window.goodsV54Data.transactions.pop();
  window.goodsV54Data.stats.totalSold += qty;
  window.goodsV54Data.stats.totalVolume += total;
  save();
  return { ok:true, msg:'Đã bán '+qty+'x '+good.name+' · Nhận: '+total+' bạc' };
};

window.gs54CreateCustomGood = function(name, icon, price, category) {
  const good = {
    id:        'cust_'+Date.now().toString(36),
    cat:       category||'custom',
    name:      name||'Hàng Tùy Chỉnh',
    icon:      icon||'🎁',
    basePrice: Math.max(1, Math.floor(price||500)),
    rarity:    3,
    weight:    2,
    isCustom:  true
  };
  window.goodsV54Data.customGoods.push(good);
  GOODS_CATALOG.push(good);
  save();
  return { ok:true, msg:'Đã tạo hàng hóa: '+good.name, good };
};

window.gs54GetInventory = function(owner) {
  const inv = owner==='guild' ? window.goodsV54Data.guildWarehouse :
              owner==='empire' ? window.goodsV54Data.empireStockpile :
              window.goodsV54Data.playerInventory;
  return Object.keys(inv).map(function(id) {
    const good = GOODS_CATALOG.find(function(g){ return g.id===id; });
    const price = typeof window.sd54GetCurrentPrice === 'function' ? window.sd54GetCurrentPrice(id) : (good?good.basePrice:0);
    return { id, qty:inv[id], good:good||{name:id,icon:'📦'}, currentPrice:price, totalValue:(inv[id]||0)*price };
  });
};

window.gs54GetStats = function() {
  const playerInv = Object.keys(window.goodsV54Data.playerInventory).length;
  const guildInv  = Object.keys(window.goodsV54Data.guildWarehouse).length;
  const empireInv = Object.keys(window.goodsV54Data.empireStockpile).length;
  return {
    playerItems:  playerInv,
    guildItems:   guildInv,
    empireItems:  empireInv,
    customGoods:  window.goodsV54Data.customGoods.length,
    stats:        window.goodsV54Data.stats,
    recentTrades: window.goodsV54Data.transactions.slice(0,5)
  };
};

window.gs54GetJarvisReport = function() {
  const tips = [];
  const inv = window.gs54GetInventory('player');
  if (inv.length === 0) tips.push('📦 Kho hàng trống — mua hàng hóa để giao thương kiếm lời');
  const richGoods = inv.sort(function(a,b){ return b.totalValue-a.totalValue; })[0];
  if (richGoods) tips.push('💰 Mặt hàng giá trị nhất: '+richGoods.good.name+' ('+richGoods.qty+'x · '+richGoods.totalValue+' bạc)');
  return { tips, stats: window.gs54GetStats() };
};

// ─── INIT ──────────────────────────────────────────────────────
function init() {
  load();
  console.log('[GoodsSystemV54] 📦 Hàng Hóa V54 — 6 danh mục · '+GOODS_CATALOG.length+' loại hàng hóa · Player/Guild/Empire warehouse · Custom goods sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
