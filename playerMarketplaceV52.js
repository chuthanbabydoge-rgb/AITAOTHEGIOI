(function() {
"use strict";
// ============================================================
// PLAYER MARKETPLACE V52 — Player Economy & Marketplace
// Chợ Vật Phẩm · Đấu Giá · Lịch Sử Giá · Demand Tracking
// Extends playerMarketplace.js V34 (KHÔNG ghi đè)
// ============================================================
const SAVE_KEY   = "cgv6_player_marketplace_v52";
const INIT_DELAY = 6900;
const MAX_LISTINGS = 200;
const MAX_AUCTIONS  = 50;
const MAX_HISTORY   = 500;

// ─── ITEM CATALOG ──────────────────────────────────────────────────────────
const V52_ITEMS = [
  // Vũ khí
  { id:"vu_khi_thuong",   name:"Vũ Khí Thường",     icon:"⚔️",  category:"Vũ Khí",    tier:1, basePrice:{currency:"bac",amount:10}  },
  { id:"vu_khi_quy",      name:"Vũ Khí Quý",        icon:"🗡️",  category:"Vũ Khí",    tier:2, basePrice:{currency:"bac",amount:100} },
  { id:"vu_khi_than",     name:"Thần Binh",          icon:"⚡",  category:"Vũ Khí",    tier:3, basePrice:{currency:"vang",amount:5}  },
  // Đan dược
  { id:"linh_dan",        name:"Linh Đan",           icon:"💊",  category:"Đan Dược",  tier:1, basePrice:{currency:"bac",amount:50}  },
  { id:"than_dan",        name:"Thần Đan",           icon:"🔮",  category:"Đan Dược",  tier:3, basePrice:{currency:"vang",amount:10} },
  { id:"bao_linh_dan",    name:"Bảo Linh Đan",      icon:"🌙",  category:"Đan Dược",  tier:4, basePrice:{currency:"tinhThach",amount:1} },
  // Khoáng thạch
  { id:"linh_thach",      name:"Linh Thạch",         icon:"💎",  category:"Khoáng",    tier:2, basePrice:{currency:"bac",amount:120} },
  { id:"tinh_thach",      name:"Tinh Thạch",         icon:"🌟",  category:"Khoáng",    tier:4, basePrice:{currency:"tinhThach",amount:1} },
  { id:"than_thach_manh", name:"Thần Thạch Mảnh",   icon:"✨",  category:"Khoáng",    tier:5, basePrice:{currency:"tinhThach",amount:10} },
  // Pháp bảo
  { id:"bi_thuat",        name:"Bí Thuật Cuốn",      icon:"📜",  category:"Pháp Bảo", tier:2, basePrice:{currency:"bac",amount:200} },
  { id:"than_bien_phap_bao",name:"Thần Biến Pháp Bảo",icon:"🏺",category:"Pháp Bảo", tier:4, basePrice:{currency:"vang",amount:50} },
  // Nguyên liệu
  { id:"thao_duoc",       name:"Thảo Dược",          icon:"🌿",  category:"Nguyên Liệu",tier:1,basePrice:{currency:"dong",amount:500}},
  { id:"quang_thach",     name:"Khoáng Thạch",       icon:"🪨",  category:"Nguyên Liệu",tier:1,basePrice:{currency:"dong",amount:200}},
  { id:"yeu_thu_lieu",    name:"Yêu Thú Liệu",       icon:"🦴",  category:"Nguyên Liệu",tier:2,basePrice:{currency:"bac",amount:80} },
  // Đất đai
  { id:"lanh_tho",        name:"Lãnh Thổ Nhỏ",       icon:"🏔️",  category:"Bất Động Sản",tier:3,basePrice:{currency:"vang",amount:20}},
  { id:"dia_mach",        name:"Địa Mạch Linh Khí",  icon:"🌋",  category:"Bất Động Sản",tier:5,basePrice:{currency:"tinhThach",amount:5}},
  // Thú cưng / đệ tử
  { id:"linh_thu",        name:"Linh Thú Nhỏ",       icon:"🐉",  category:"Linh Thú",  tier:2, basePrice:{currency:"bac",amount:300} },
  { id:"than_thu",        name:"Thần Thú",            icon:"🦄",  category:"Linh Thú",  tier:5, basePrice:{currency:"tinhThach",amount:20} },
];

// ─── STATE ──────────────────────────────────────────────────────────────────
window.pmV52Data = {
  listings:    [],   // { id, sellerId, sellerName, itemId, itemName, icon, category, tier, currency, price, qty, desc, year, status, views }
  auctions:    [],   // { id, itemId, itemName, icon, startCurrency, startPrice, currentBid, currentBidder, bids[], endsYear, status }
  transactions:[],   // { id, type, itemId, itemName, currency, amount, seller, buyer, year }
  priceHistory:{},   // { itemId: [{year, price, currency}] }
  demandScore: {},   // { itemId: 0-100 }
  hotItems:    [],   // top 5 by demand
  tickCounter: 0,
  stats: { totalVolume:0, totalTrades:0, highestSale:0, mostTraded:'' },
  version: "V52"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.pmV52Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) {
      const p = JSON.parse(d);
      window.pmV52Data = Object.assign(window.pmV52Data, p);
    }
  } catch(e) {}
}

// ─── ITEM HELPERS ────────────────────────────────────────────────────────────
function getItem(itemId) {
  return V52_ITEMS.find(function(i){ return i.id === itemId; });
}
function getDynPrice(itemId, baseCurrency, baseAmount) {
  const demand = (window.pmV52Data.demandScore[itemId]||50) / 50; // 1.0 = normal
  const mkt    = typeof window.playerEconV52Data !== 'undefined' ? window.playerEconV52Data.marketModifier : 1.0;
  return Math.max(1, Math.round(baseAmount * demand * mkt));
}

// ─── LISTING API ─────────────────────────────────────────────────────────────
window.pm52ListItem = function(itemId, qty, currency, price, sellerName, desc) {
  const item = getItem(itemId);
  if (!item) return { ok:false, msg:'Vật phẩm không tồn tại' };
  qty   = Math.max(1, Math.floor(qty||1));
  price = Math.max(1, Math.floor(price||item.basePrice.amount));
  const listing = {
    id:        'lst52_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,5),
    itemId:    itemId,
    itemName:  item.name,
    icon:      item.icon,
    category:  item.category,
    tier:      item.tier,
    currency:  currency || item.basePrice.currency,
    price:     price,
    qty:       qty,
    desc:      (desc||'').substring(0,100),
    sellerName:sellerName || 'Ẩn Danh',
    year:      typeof year !== 'undefined' ? year : 0,
    status:    'active',
    views:     0
  };
  window.pmV52Data.listings.unshift(listing);
  if (window.pmV52Data.listings.length > MAX_LISTINGS) window.pmV52Data.listings.length = MAX_LISTINGS;
  // Demand boost
  window.pmV52Data.demandScore[itemId] = Math.min(100, (window.pmV52Data.demandScore[itemId]||50) + 2);
  _updateHotItems();
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: typeof year!=='undefined'?year:0, type:'economy', title:'📦 Đăng Bán: '+item.name, color:'#fbbf24' });
  return { ok:true, msg:'Đã đăng bán '+qty+'x '+item.name, listing };
};

window.pm52BuyItem = function(listingId, buyerName) {
  const listing = window.pmV52Data.listings.find(function(l){ return l.id===listingId && l.status==='active'; });
  if (!listing) return { ok:false, msg:'Mặt hàng không còn hoặc đã bán' };
  if (buyerName === listing.sellerName) return { ok:false, msg:'Không thể mua hàng của chính mình' };

  // Deduct currency from buyer wallet
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency(listing.currency, listing.price, 'Mua '+listing.itemName)
    : { ok:true };
  if (!spend.ok) return spend;

  listing.status   = 'sold';
  listing.buyerName = buyerName || 'Ẩn Danh';
  listing.soldYear  = typeof year !== 'undefined' ? year : 0;

  const tx = {
    id:        'tx52_'+Date.now().toString(36),
    type:      'buy',
    itemId:    listing.itemId,
    itemName:  listing.itemName,
    currency:  listing.currency,
    amount:    listing.price,
    seller:    listing.sellerName,
    buyer:     listing.buyerName,
    year:      listing.soldYear
  };
  window.pmV52Data.transactions.unshift(tx);
  if (window.pmV52Data.transactions.length > MAX_HISTORY) window.pmV52Data.transactions.length = MAX_HISTORY;

  // Revenue to seller if it's the player
  if (typeof window.pec52AddCurrency === 'function') {
    window.pec52AddCurrency(listing.currency, listing.price, 'Bán '+listing.itemName);
  }

  // Price history
  if (!window.pmV52Data.priceHistory[listing.itemId]) window.pmV52Data.priceHistory[listing.itemId] = [];
  window.pmV52Data.priceHistory[listing.itemId].push({ year: listing.soldYear, price:listing.price, currency:listing.currency });
  if (window.pmV52Data.priceHistory[listing.itemId].length > 20) window.pmV52Data.priceHistory[listing.itemId].shift();

  // Stats
  const inDong = (window.playerEconV52Data ? window.playerEconV52Data.exchangeRates[listing.currency]||1 : 1) * listing.price;
  window.pmV52Data.stats.totalVolume  += inDong;
  window.pmV52Data.stats.totalTrades++;
  if (inDong > window.pmV52Data.stats.highestSale) { window.pmV52Data.stats.highestSale = inDong; window.pmV52Data.stats.highestItem = listing.itemName; }
  window.pmV52Data.demandScore[listing.itemId] = Math.min(100, (window.pmV52Data.demandScore[listing.itemId]||50)+5);
  _updateHotItems();
  save();
  return { ok:true, msg:'Đã mua '+listing.itemName+' · Giá: '+listing.price+' '+listing.currency, tx };
};

// ─── AUCTION API ─────────────────────────────────────────────────────────────
window.pm52CreateAuction = function(itemId, startCurrency, startPrice, durationYears, sellerName) {
  const item = getItem(itemId);
  if (!item) return { ok:false, msg:'Vật phẩm không tồn tại' };
  const currentYear = typeof year !== 'undefined' ? year : 0;
  const auction = {
    id:             'auc52_'+Date.now().toString(36),
    itemId:         itemId,
    itemName:       item.name,
    icon:           item.icon,
    sellerName:     sellerName || 'Ẩn Danh',
    startCurrency:  startCurrency || item.basePrice.currency,
    startPrice:     Math.max(1, Math.floor(startPrice||item.basePrice.amount)),
    currentBid:     Math.max(1, Math.floor(startPrice||item.basePrice.amount)),
    currentBidder:  null,
    bids:           [],
    startYear:      currentYear,
    endsYear:       currentYear + (durationYears||5),
    status:         'active'
  };
  window.pmV52Data.auctions.unshift(auction);
  if (window.pmV52Data.auctions.length > MAX_AUCTIONS) window.pmV52Data.auctions.length = MAX_AUCTIONS;
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:currentYear, type:'economy', title:'🔨 Đấu Giá: '+item.name+' (khởi điểm: '+auction.startPrice+')', color:'#f59e0b' });
  return { ok:true, msg:'Đấu giá '+item.name+' bắt đầu · Kết thúc năm '+auction.endsYear, auction };
};

window.pm52PlaceBid = function(auctionId, bidderName, bidAmount, currency) {
  const auction = window.pmV52Data.auctions.find(function(a){ return a.id===auctionId && a.status==='active'; });
  if (!auction) return { ok:false, msg:'Phiên đấu giá không còn' };
  if (bidAmount <= auction.currentBid) return { ok:false, msg:'Giá đặt phải cao hơn giá hiện tại: '+auction.currentBid };
  if (bidderName === auction.sellerName) return { ok:false, msg:'Không thể đặt giá vật phẩm của mình' };

  // Hoàn tiền cọc cho bidder cũ
  if (auction.currentBidder && typeof window.pec52AddCurrency === 'function') {
    window.pec52AddCurrency(auction.startCurrency, auction.currentBid, 'Hoàn tiền đặt cọc ('+auction.itemName+')');
  }
  // Trừ tiền bidder mới
  if (typeof window.pec52SpendCurrency === 'function') {
    const spend = window.pec52SpendCurrency(currency||auction.startCurrency, bidAmount, 'Đặt cọc đấu giá '+auction.itemName);
    if (!spend.ok) return spend;
  }

  auction.currentBid     = bidAmount;
  auction.currentBidder  = bidderName || 'Ẩn Danh';
  auction.bids.push({ bidder:auction.currentBidder, amount:bidAmount, year:typeof year!=='undefined'?year:0 });

  save();
  return { ok:true, msg:auction.currentBidder+' đặt '+bidAmount+' '+auction.startCurrency+' cho '+auction.itemName };
};

window.pm52SettleAuctions = function() {
  const currentYear = typeof year !== 'undefined' ? year : 0;
  const settled = [];
  window.pmV52Data.auctions.forEach(function(auction) {
    if (auction.status === 'active' && currentYear >= auction.endsYear) {
      if (auction.currentBidder) {
        auction.status = 'won';
        auction.winner = auction.currentBidder;
        // Give gold to seller
        if (typeof window.pec52AddCurrency === 'function') {
          window.pec52AddCurrency(auction.startCurrency, auction.currentBid, 'Thắng đấu giá - '+auction.itemName);
        }
        const tx = { id:'tx52a_'+Date.now().toString(36), type:'auction', itemId:auction.itemId, itemName:auction.itemName, currency:auction.startCurrency, amount:auction.currentBid, seller:auction.sellerName, buyer:auction.winner, year:currentYear };
        window.pmV52Data.transactions.unshift(tx);
        if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:currentYear, type:'economy', title:'🏆 '+auction.winner+' thắng đấu giá '+auction.itemName+' ('+auction.currentBid+')', color:'#facc15' });
        settled.push(auction);
      } else {
        auction.status = 'expired';
      }
    }
  });
  if (settled.length > 0) save();
  return settled;
};

// ─── QUERY API ───────────────────────────────────────────────────────────────
window.pm52GetActiveListings = function(category) {
  let listings = window.pmV52Data.listings.filter(function(l){ return l.status==='active'; });
  if (category) listings = listings.filter(function(l){ return l.category===category; });
  return listings;
};

window.pm52GetActiveAuctions = function() {
  return window.pmV52Data.auctions.filter(function(a){ return a.status==='active'; });
};

window.pm52GetItems = function() { return V52_ITEMS.slice(); };

window.pm52GetPriceHistory = function(itemId) {
  return (window.pmV52Data.priceHistory[itemId]||[]).slice();
};

window.pm52GetStats = function() {
  return Object.assign({}, window.pmV52Data.stats, {
    activeListings:  window.pmV52Data.listings.filter(function(l){ return l.status==='active'; }).length,
    activeAuctions:  window.pmV52Data.auctions.filter(function(a){ return a.status==='active'; }).length,
    hotItems:        window.pmV52Data.hotItems.slice()
  });
};

window.pm52GetRecentTrades = function(n) {
  return window.pmV52Data.transactions.slice(0, n||20);
};

// ─── AI SELLERS (NPCs đăng bán tự động) ──────────────────────────────────────
function _aiNpcListings() {
  const active = window.pmV52Data.listings.filter(function(l){ return l.status==='active' && l.sellerName !== 'Player'; });
  if (active.length > 30) return; // Đã đủ NPC listings

  const npcNames = ['Vạn Bảo Thương Hội','Thiên Hạ Thương Đoàn','Kim Ngân Hội','Linh Thạch Thương Liên','Bách Bảo Khố'];
  const randomItem = V52_ITEMS[Math.floor(Math.random()*V52_ITEMS.length)];
  const npc = npcNames[Math.floor(Math.random()*npcNames.length)];
  const dynPrice = getDynPrice(randomItem.id, randomItem.basePrice.currency, randomItem.basePrice.amount);
  window.pm52ListItem(randomItem.id, Math.floor(Math.random()*5)+1, randomItem.basePrice.currency, dynPrice, npc, 'Hàng NPC tự động');
}

function _updateHotItems() {
  const scores = window.pmV52Data.demandScore;
  const sorted = Object.keys(scores).sort(function(a,b){ return (scores[b]||0)-(scores[a]||0); });
  window.pmV52Data.hotItems = sorted.slice(0,5).map(function(id) {
    const item = getItem(id);
    return { id, name:item?item.name:id, icon:item?item.icon:'📦', demand:scores[id] };
  });
}

// ─── TICK ──────────────────────────────────────────────────────────────────
function tick() {
  window.pmV52Data.tickCounter = (window.pmV52Data.tickCounter||0)+1;
  if (window.pmV52Data.tickCounter % 15 === 0) {
    _aiNpcListings();
    window.pm52SettleAuctions();
    // Decay demand over time
    Object.keys(window.pmV52Data.demandScore).forEach(function(id) {
      window.pmV52Data.demandScore[id] = Math.max(10, (window.pmV52Data.demandScore[id]||50) - 1);
    });
    _updateHotItems();
    save();
  }
}

// ─── INIT ──────────────────────────────────────────────────────────────────
function init() {
  load();
  // Khởi tạo demand scores
  V52_ITEMS.forEach(function(item) {
    if (!window.pmV52Data.demandScore[item.id]) window.pmV52Data.demandScore[item.id] = 50;
  });
  _updateHotItems();
  _aiNpcListings();

  const _orig = window.gameTick;
  window.gameTick = function() { if(_orig) _orig(); tick(); };

  console.log("[PlayerMarketplaceV52] 🏪 Chợ Vật Phẩm V52 — "+V52_ITEMS.length+" loại vật phẩm · Listing · Đấu Giá · Price History · NPC AI Sellers sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
