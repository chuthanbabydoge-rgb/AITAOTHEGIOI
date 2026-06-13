(function() {
"use strict";
// ============================================================
// TRADE REGISTRY V54 — Marketplace Expansion & Trading Network
// Patches player-hub-v28 · 6 tabs (Thương Mại/Tuyến Đường/Hàng Hóa/Logistics/Chợ Đen/Thống Kê)
// EXPAND ONLY · Không tạo sidebar tab mới
// ============================================================
const INIT_DELAY = 8200;

const V54_TABS = [
  { id:'trade-v54',    icon:'💹', label:'Thương Mại',  fn:'tr54RenderTrade'     },
  { id:'routes-v54',   icon:'🛤️', label:'Tuyến Đường', fn:'tr54RenderRoutes'    },
  { id:'goods-v54',    icon:'📦', label:'Hàng Hóa',   fn:'tr54RenderGoods'     },
  { id:'logistics-v54',icon:'🏭', label:'Logistics',   fn:'tr54RenderLogistics' },
  { id:'blackmkt-v54', icon:'🕳️', label:'Chợ Đen',    fn:'tr54RenderBlackMkt'  },
  { id:'tradestats-v54',icon:'📊',label:'Thống Kê',    fn:'tr54RenderTradeStats'},
];

// ─── STYLE HELPERS ────────────────────────────────────────────
function card(c,bg)   { return '<div style="background:'+(bg||'#0f172a')+';border:1px solid #1e293b;border-radius:8px;padding:10px;margin-bottom:6px">'+c+'</div>'; }
function badge(t,col) { return '<span style="background:'+(col||'#1e293b')+'33;color:'+(col||'#94a3b8')+';border:1px solid '+(col||'#94a3b8')+'44;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:bold">'+t+'</span>'; }
function btn(l,oc,col){ return '<button onclick="'+oc+'" style="background:'+(col||'#1e40af')+'22;border:1px solid '+(col||'#1e40af')+'66;color:'+(col||'#60a5fa')+';border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;margin:3px;transition:all 0.2s">'+l+'</button>'; }
function section(t,ic,c,col){ return '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:bold;color:'+(col||'#94a3b8')+';margin-bottom:5px;border-bottom:1px solid #1e293b;padding-bottom:3px">'+ic+' '+t+'</div>'+c+'</div>'; }
function fmt(n){ if(n>=1e6)return (n/1e6).toFixed(1)+'M'; if(n>=1000)return (n/1000).toFixed(1)+'K'; return String(Math.floor(n||0)); }

// ─── RENDER: THƯƠNG MẠI (Overview) ────────────────────────────
window.tr54RenderTrade = function() {
  const el = document.getElementById('panel-trade-v54'); if(!el) return;
  const tnStats = typeof window.tn54GetStats   === 'function' ? window.tn54GetStats()  : {};
  const sdStats = typeof window.sd54GetStats   === 'function' ? window.sd54GetStats()  : {};
  const gsStats = typeof window.gs54GetStats   === 'function' ? window.gs54GetStats()  : {};
  const bmStats = typeof window.bm54GetStats   === 'function' ? window.bm54GetStats()  : {};
  const jarvis  = typeof window.tn54GetJarvisReport === 'function' ? window.tn54GetJarvisReport() : { tips:[] };
  const sdJarvis = typeof window.sd54GetJarvisReport === 'function' ? window.sd54GetJarvisReport() : { tips:[] };

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#22c55e">💹 Thương Mại V54</span><span style="font-size:10px;color:#64748b">'+tnStats.totalRoutes+' tuyến · 📦'+gsStats.playerItems+' mặt hàng</span></div>';

  // Tổng hợp Jarvis
  const allTips = (jarvis.tips||[]).concat(sdJarvis.tips||[]).slice(0,4);
  if (allTips.length > 0) html += card(allTips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0f00');

  // KPI cards
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">';
  html += card('<div style="text-align:center"><div style="font-size:16px;color:#22c55e">'+fmt(tnStats.incomePerTick||0)+'</div><div style="font-size:9px;color:#475569">Bạc/tick (tuyến)</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:16px;color:#60a5fa">'+fmt(tnStats.totalRevenue||0)+'</div><div style="font-size:9px;color:#475569">Tổng doanh thu</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:16px;color:'+(sdStats.trend==='rising'?'#22c55e':sdStats.trend==='falling'?'#ef4444':'#94a3b8')+'">'+(sdStats.trendIcon||'➡️')+'</div><div style="font-size:9px;color:#475569">Xu hướng TT</div></div>');
  html += '</div>';

  // Quick actions
  html += section('Tuyến Đường Nhanh', '🛤️',
    card(
      btn('🏘️ Mở Tuyến Nội Địa','tn54EstablishRoute("Tuyến Nội Địa #1","domestic","caravan","Thủ Đô","Vùng Lân Cận",["food","mineral"]);tr54RenderTrade()','#22c55e')+
      btn('🌍 Quốc Tế','tn54EstablishRoute("Tuyến Quốc Tế #1","international","ship","Cảng Chính","Ngoại Quốc",["weapon","spiritgear"]);tr54RenderTrade()','#60a5fa')+
      btn('👑 Đế Quốc','tn54EstablishRoute("Tuyến Đế Quốc #1","empire","airship","Đế Đô","Lãnh Thổ Xa",["rare"]);tr54RenderTrade()','#facc15')+
      btn('🌌 Liên Vũ Trụ','tn54EstablishRoute("Tuyến Liên Vũ Trụ #1","multiverse","portal","Thế Giới Này","Vũ Trụ Láng Giềng",["rare"]);tr54RenderTrade()','#a78bfa')));

  // Market trend
  html += section('Xu Hướng Thị Trường', '📊',
    card('<div style="display:flex;justify-content:space-between;font-size:10px">'+
      '<span>📈 Tăng: <span style="color:#22c55e">'+sdStats.rising+'</span></span>'+
      '<span>📉 Giảm: <span style="color:#ef4444">'+sdStats.falling+'</span></span>'+
      '<span>⚡ Sự kiện: <span style="color:#fbbf24">'+(sdStats.activeEvents||0)+'</span></span></div>'+
      btn('🎯 Kích Hoạt Bùng Nổ','sd54TriggerMarketEvent("boom",null);tr54RenderTrade()','#22c55e')+
      btn('📦 Sự Kiện Khan Hiếm','sd54TriggerMarketEvent("shortage",null);tr54RenderTrade()','#f59e0b')));

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: TUYẾN ĐƯỜNG ──────────────────────────────────────
window.tr54RenderRoutes = function() {
  const el = document.getElementById('panel-routes-v54'); if(!el) return;
  const routes = typeof window.tn54GetRoutes       === 'function' ? window.tn54GetRoutes() : [];
  const types  = typeof window.tn54GetRouteTypes   === 'function' ? window.tn54GetRouteTypes() : [];
  const trans  = typeof window.tn54GetTransports   === 'function' ? window.tn54GetTransports() : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#22c55e;margin-bottom:10px">🛤️ Tuyến Đường Thương Mại ('+routes.length+')</div>';

  if (routes.length === 0) {
    html += card('<div style="text-align:center;color:#334155;padding:10px">Chưa có tuyến thương mại nào.<br>'+
      btn('+ Tạo Tuyến Đầu Tiên','tn54EstablishRoute("Thương Lộ Đầu Tiên","domestic","caravan","Thủ Đô","Vùng Lân Cận",["food"]);tr54RenderRoutes()','#22c55e')+'</div>');
  } else {
    html += section('Tuyến Đang Hoạt Động', '✅',
      routes.slice(0,6).map(function(r) {
        return card('<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div><div style="font-size:11px;color:#e2e8f0">'+r.typeIcon+r.transportIcon+' <span style="color:#22c55e">'+r.name+'</span></div>'+
          '<div style="font-size:9px;color:#475569">'+r.from+' → '+r.to+' · Cấp '+r.level+' · Thu: '+r.baseIncome+'/tick</div></div>'+
          '<div>'+badge('Cấp '+r.level,'#3b82f6')+btn('⬆️','tn54UpgradeRoute("'+r.id+'");tr54RenderRoutes()','#22c55e')+btn('❌','tn54CloseRoute("'+r.id+'");tr54RenderRoutes()','#ef4444')+'</div></div>');
      }).join(''));
  }

  // Thiết lập nhanh theo loại
  html += section('Thiết Lập Tuyến Mới', '➕',
    types.map(function(t) {
      return '<div style="margin-bottom:4px">'+
        card('<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px">'+
          '<div>'+t.icon+' <span style="color:#94a3b8">'+t.name+'</span> · Chi phí: '+t.baseCost+' bạc · Lợi: '+t.baseIncome+'/tick</div>'+
          btn('Thiết Lập','var n=prompt("Tên tuyến:");if(n){tn54EstablishRoute(n,"'+t.id+'","caravan","Điểm A","Điểm B",["food"]);tr54RenderRoutes()}','#22c55e')+
        '</div>');
    }).join(''));

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: HÀNG HÓA ─────────────────────────────────────────
window.tr54RenderGoods = function() {
  const el = document.getElementById('panel-goods-v54'); if(!el) return;
  const cats    = typeof window.gs54GetCategories === 'function' ? window.gs54GetCategories() : [];
  const catalog = typeof window.gs54GetCatalog    === 'function' ? window.gs54GetCatalog()    : [];
  const inv     = typeof window.gs54GetInventory  === 'function' ? window.gs54GetInventory('player') : [];
  const jarvis  = typeof window.gs54GetJarvisReport === 'function' ? window.gs54GetJarvisReport() : { tips:[] };

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#fbbf24;margin-bottom:10px">📦 Hàng Hóa V54 ('+catalog.length+' loại)</div>';

  if (jarvis.tips.length > 0) html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0f00');

  // Kho của người chơi
  if (inv.length > 0) {
    html += section('Kho Hàng Của Bạn', '🎒',
      inv.slice(0,5).map(function(i) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+i.good.icon+' <span style="color:#e2e8f0">'+i.good.name+'</span> x<span style="color:#fbbf24">'+i.qty+'</span></span>'+
          '<div>'+badge(fmt(i.currentPrice)+'B','#3b82f6')+
            btn('-1','gs54SellGoods("'+i.id+'",1,"player");tr54RenderGoods()','#ef4444')+
          '</div></div>';
      }).join(''));
  }

  // Catalog theo danh mục
  cats.slice(0,4).forEach(function(cat) {
    const goods = catalog.filter(function(g){ return g.cat===cat.id && !g.isCustom; }).slice(0,4);
    if (!goods.length) return;
    html += section(cat.name, cat.icon,
      goods.map(function(g) {
        const price = typeof window.sd54GetCurrentPrice === 'function' ? window.sd54GetCurrentPrice(g.id) : g.basePrice;
        const pct   = Math.round((price/g.basePrice-1)*100);
        return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:2px 0">'+
          '<span>'+g.icon+' <span style="color:#94a3b8">'+g.name+'</span></span>'+
          '<div>'+badge(fmt(price)+'B', pct>10?'#22c55e':pct<-10?'#ef4444':'#60a5fa')+
            (pct!==0?'<span style="color:'+(pct>0?'#22c55e':'#ef4444')+';font-size:9px;margin-left:2px">'+(pct>0?'+':'')+pct+'%</span>':'')+
            btn('+1','gs54BuyGoods("'+g.id+'",1,"player");tr54RenderGoods()','#22c55e')+
          '</div></div>';
      }).join(''), cat.color);
  });

  html += btn('🔄','tr54RenderGoods()','#334155');
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: LOGISTICS ────────────────────────────────────────
window.tr54RenderLogistics = function() {
  const el = document.getElementById('panel-logistics-v54'); if(!el) return;
  const tnStats = typeof window.tn54GetStats === 'function' ? window.tn54GetStats() : {};
  const gsStats = typeof window.gs54GetStats === 'function' ? window.gs54GetStats() : {};
  const guildInv = typeof window.gs54GetInventory === 'function' ? window.gs54GetInventory('guild') : [];
  const empireInv = typeof window.gs54GetInventory === 'function' ? window.gs54GetInventory('empire') : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#a78bfa;margin-bottom:10px">🏭 Logistics & Kho Bãi</div>';

  // Logistics summary
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">';
  html += card('<div style="text-align:center"><div style="font-size:16px;color:#60a5fa">'+tnStats.totalRoutes+'</div><div style="font-size:9px;color:#475569">Tuyến TM</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:16px;color:#22c55e">'+gsStats.playerItems+'</div><div style="font-size:9px;color:#475569">Loại HH (Player)</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:16px;color:#fbbf24">'+gsStats.guildItems+'</div><div style="font-size:9px;color:#475569">Loại HH (Guild)</div></div>');
  html += '</div>';

  // Guild warehouse
  html += section('Kho Bang Hội 🏦', '🏛️',
    guildInv.length > 0 ?
    guildInv.slice(0,4).map(function(i) {
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+i.good.icon+' '+i.good.name+' x'+i.qty+'</span>'+
        '<div>'+badge(fmt(i.totalValue)+'B','#60a5fa')+btn('Bán','gs54SellGoods("'+i.id+'",1,"guild");tr54RenderLogistics()','#ef4444')+'</div></div>';
    }).join('')+
    btn('+ Mua HH Guild','gs54BuyGoods("rice",5,"guild");tr54RenderLogistics()','#22c55e')
    :
    card('<div style="color:#334155;font-size:10px">Kho bang trống · '+btn('Nhập Hàng','gs54BuyGoods("iron_ore",10,"guild");tr54RenderLogistics()','#60a5fa')+'</div>'));

  // Empire stockpile
  html += section('Kho Chiến Lược Đế Quốc 👑', '🏯',
    empireInv.length > 0 ?
    empireInv.slice(0,3).map(function(i) {
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+i.good.icon+' '+i.good.name+' x'+i.qty+'</span>'+
        badge(fmt(i.totalValue)+'B','#facc15')+
      '</div>';
    }).join('')+btn('+ Dự Trữ HH','gs54BuyGoods("spirit_stone",1,"empire");tr54RenderLogistics()','#facc15')
    :
    card('<div style="color:#334155;font-size:10px">Kho đế quốc trống · '+btn('Dự Trữ','gs54BuyGoods("iron_ore",20,"empire");tr54RenderLogistics()','#facc15')+'</div>'));

  // Multiverse trade (link V35)
  if (typeof window.meData !== 'undefined') {
    html += section('Giao Thương Liên Vũ Trụ (V35)', '🌌',
      card('<div style="font-size:10px;color:#94a3b8">Kết nối với Multiverse Economy V35 · '+
        '<span style="color:#a78bfa">Tổng giao dịch: '+(window.meData.totalTrades||0)+'</span></div>'));
  }

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: CHỢ ĐEN ──────────────────────────────────────────
window.tr54RenderBlackMkt = function() {
  const el = document.getElementById('panel-blackmkt-v54'); if(!el) return;
  const stats       = typeof window.bm54GetStats      === 'function' ? window.bm54GetStats()      : {};
  const contraband  = typeof window.bm54GetContraband === 'function' ? window.bm54GetContraband() : [];
  const fences      = typeof window.bm54GetFences     === 'function' ? window.bm54GetFences()     : [];
  const stockpile   = typeof window.bm54GetStockpile  === 'function' ? window.bm54GetStockpile()  : [];
  const tiers       = typeof window.bm54GetNetworkTiers === 'function' ? window.bm54GetNetworkTiers() : [];
  const jarvis      = typeof window.bm54GetJarvisReport === 'function' ? window.bm54GetJarvisReport() : { tips:[] };

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="font-size:13px;font-weight:bold;color:#6366f1">🕳️ Chợ Đen V54</span><span style="font-size:10px;color:#64748b">Rep: '+stats.rep+'/100 · Tier '+stats.tier+' '+stats.tierIcon+'</span></div>';

  if (jarvis.tips.length>0) html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#c4b5fd;margin:2px 0">'+t+'</div>'; }).join(''),'#0a0015');

  // Network upgrade
  const nextTier = tiers.find(function(t){ return t.tier===stats.tier+1; });
  if (nextTier) html += section('Mạng Lưới Ngầm', stats.tierIcon||'🕳️',
    card(badge(stats.tierName,'#6366f1')+' → '+btn('⬆️ Nâng Cấp → '+nextTier.name+' ('+fmt(nextTier.cost)+'B)', 'bm54UpgradeNetwork();tr54RenderBlackMkt()', '#a78bfa')));

  // Guild BM setup
  if (!stats.guildBM) html += section('Bang Hội Bóng Tối', '🏴',
    card(btn('🏴 Thiết Lập Chợ Đen Bang Hội (5000B)', 'bm54SetupGuildBlackMarket();tr54RenderBlackMkt()', '#6366f1')));

  // Contraband (hàng cấm)
  html += section('Hàng Cấm ('+contraband.length+' loại)', '☠️',
    contraband.slice(0,5).map(function(c) {
      const risk = Math.floor((c.risk - (tiers.find(function(t){ return t.tier===stats.tier; })||{riskReduction:0}).riskReduction) * 100);
      return card('<div style="display:flex;justify-content:space-between;align-items:center">'+
        '<div><span style="font-size:11px">'+c.icon+'</span> <span style="font-size:10px;color:#e2e8f0">'+c.name+'</span><br>'+
        '<span style="font-size:9px;color:#475569">'+c.desc+'</span></div>'+
        '<div style="text-align:right">'+badge(risk+'% rủi ro','#ef4444')+'<br>'+
          btn('Mua '+fmt(c.price)+'B','bm54BuyContraband("'+c.id+'",1);tr54RenderBlackMkt()','#6366f1')+'</div></div>');
    }).join(''));

  // Stockpile
  if (stockpile.length > 0) {
    html += section('Kho Hàng Cấm', '📦',
      stockpile.map(function(s) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+s.item.icon+' '+s.item.name+' x'+s.qty+'</span>'+
          '<div>'+fences.slice(0,2).map(function(f){
            return btn('💰 '+f.name.slice(0,8),'bm54SellContraband("'+s.id+'",1,"'+f.id+'");tr54RenderBlackMkt()','#22c55e');
          }).join('')+'</div></div>';
      }).join(''));
  }

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: THỐNG KÊ ─────────────────────────────────────────
window.tr54RenderTradeStats = function() {
  const el = document.getElementById('panel-tradestats-v54'); if(!el) return;
  const tn = typeof window.tn54GetStats === 'function' ? window.tn54GetStats() : {};
  const sd = typeof window.sd54GetStats === 'function' ? window.sd54GetStats() : {};
  const gs = typeof window.gs54GetStats === 'function' ? window.gs54GetStats() : {};
  const bm = typeof window.bm54GetStats === 'function' ? window.bm54GetStats() : {};
  const prices = typeof window.sd54GetAllPrices === 'function' ? window.sd54GetAllPrices() : [];
  const routes = typeof window.tn54GetRoutes    === 'function' ? window.tn54GetRoutes()    : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#60a5fa;margin-bottom:10px">📊 Thống Kê Thương Mại V54</div>';

  // Big numbers
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">';
  html += card('<div style="text-align:center"><div style="font-size:18px;color:#22c55e;font-weight:bold">'+fmt(tn.totalRevenue||0)+'</div><div style="font-size:9px;color:#475569">Tổng Doanh Thu</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:18px;color:#a78bfa;font-weight:bold">'+fmt(bm.totalProfit||0)+'</div><div style="font-size:9px;color:#475569">Lợi Nhuận Chợ Đen</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:18px;color:#60a5fa;font-weight:bold">'+(tn.totalRoutes||0)+'</div><div style="font-size:9px;color:#475569">Tuyến Đang Hoạt Động</div></div>');
  html += card('<div style="text-align:center"><div style="font-size:18px;color:#fbbf24;font-weight:bold">'+(sd.totalEvents||0)+'</div><div style="font-size:9px;color:#475569">Sự Kiện Thị Trường</div></div>');
  html += '</div>';

  // Top routes
  if (routes.length > 0) {
    html += section('Top Tuyến Giàu Nhất', '🏆',
      routes.sort(function(a,b){ return (b.totalEarned||0)-(a.totalEarned||0); }).slice(0,4).map(function(r,i) {
        const m = ['🥇','🥈','🥉','🏅'];
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+(m[i]||'#'+(i+1))+' '+r.typeIcon+' '+r.name+'</span>'+
          '<span style="color:#22c55e">'+fmt(r.totalEarned||0)+' bạc</span></div>';
      }).join(''));
  }

  // Top price movers
  const topMovers = prices.filter(function(p){ return Math.abs(p.pct)>5; }).sort(function(a,b){ return Math.abs(b.pct)-Math.abs(a.pct); }).slice(0,5);
  if (topMovers.length > 0) {
    html += section('Biến Động Giá Mạnh', '📈',
      topMovers.map(function(p) {
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
          '<span>'+p.icon+' '+p.name+'</span>'+
          '<span style="color:'+(p.pct>0?'#22c55e':'#ef4444')+'">'+(p.pct>0?'+':'')+p.pct+'% · '+fmt(p.currentPrice)+'B</span></div>';
      }).join(''));
  }

  // Active market events
  const events = typeof window.sd54GetActiveEvents === 'function' ? window.sd54GetActiveEvents() : [];
  if (events.length > 0) {
    html += section('Sự Kiện Đang Diễn Ra ('+events.length+')', '⚡',
      events.slice(0,4).map(function(e) {
        return card('<div style="font-size:10px">'+e.icon+' <span style="color:#fbbf24">'+e.name+'</span> · Kết thúc năm '+(e.endYear||'?')+'</div>');
      }).join(''));
  }

  html += btn('🔄 Làm Mới','tr54RenderTradeStats()','#334155');
  html += '</div>';
  el.innerHTML = html;
};

// ─── PATCH PLAYER HUB V28 ─────────────────────────────────────
function patchPlayerHub() {
  const _origHub = window.hubRenderPanel;
  if (typeof _origHub !== 'function') return;

  window.hubRenderPanel = function(hubId) {
    _origHub(hubId);
    if (hubId !== 'player-hub-v28') return;

    const panel = document.getElementById('panel-player-hub-v28');
    if (!panel) return;
    const topBar = panel.querySelector('div > div:nth-child(1) > div:nth-child(2)');
    if (!topBar) return;
    if (topBar.querySelector('[data-v54tab]')) return;

    V54_TABS.forEach(function(t) {
      const b = document.createElement('button');
      b.setAttribute('data-v54tab', t.id);
      b.innerHTML = t.icon + ' ' + t.label;
      b.style.cssText = 'padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif';
      b.onclick = function() {
        topBar.querySelectorAll('button').forEach(function(x){ x.style.borderBottomColor='transparent'; x.style.color='#64748b'; });
        b.style.borderBottomColor='#22c55e';
        b.style.color='#22c55e';
        const area = document.getElementById('player-hub-v28-content');
        if (!area) return;
        if (typeof window[t.fn] === 'function') window[t.fn]();
        const subPanel = document.getElementById('panel-'+t.id);
        if (subPanel && subPanel.innerHTML.trim().length > 10) area.innerHTML = subPanel.innerHTML;
      };
      topBar.appendChild(b);
    });
  };
}

// ─── HUB WIDGET ───────────────────────────────────────────────
window.tradeV54HubRenderPanel = function() {
  const tn = typeof window.tn54GetStats === 'function' ? window.tn54GetStats() : {};
  const sd = typeof window.sd54GetStats === 'function' ? window.sd54GetStats() : {};
  return '<div style="background:#0a0f0a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-top:8px">'+
    '<div style="font-size:11px;font-weight:bold;color:#22c55e;margin-bottom:4px">💹 Thương Mại V54</div>'+
    '<div style="display:flex;gap:4px;flex-wrap:wrap">'+
      '<span style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:4px;padding:2px 6px;font-size:10px">🛤️ '+(tn.totalRoutes||0)+' tuyến</span>'+
      '<span style="background:#60a5fa22;color:#60a5fa;border:1px solid #60a5fa44;border-radius:4px;padding:2px 6px;font-size:10px">💰 '+fmt(tn.incomePerTick||0)+'/tick</span>'+
      '<span style="background:'+(sd.trend==='rising'?'#22c55e':'#ef4444')+'22;color:'+(sd.trend==='rising'?'#22c55e':'#ef4444')+';border:1px solid '+(sd.trend==='rising'?'#22c55e':'#ef4444')+'44;border-radius:4px;padding:2px 6px;font-size:10px">'+(sd.trendIcon||'➡️')+' TT</span>'+
    '</div></div>';
};

// ─── INIT ─────────────────────────────────────────────────────
function init() {
  patchPlayerHub();
  console.log('[TradeRegistryV54] 💹 Trade Registry V54 — 6 tabs (Thương Mại/Tuyến Đường/Hàng Hóa/Logistics/Chợ Đen/Thống Kê) trong player-hub-v28 · Hub widget sẵn sàng.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
