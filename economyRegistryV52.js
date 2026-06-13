(function() {
"use strict";
// ============================================================
// ECONOMY REGISTRY V52 — Player Economy & Marketplace
// Patches player-hub-v28 · 6 tabs: Ví/Chợ/Doanh Nghiệp/Đấu Giá/Tiền Tệ/Kinh Tế
// EXPAND ONLY · Không tạo sidebar tab mới
// ============================================================
const INIT_DELAY = 7200;

const V52_TABS = [
  { id:'wallet-v52',   icon:'👛', label:'Ví',          fn:'er52RenderWallet'   },
  { id:'market-v52',   icon:'🏪', label:'Chợ',         fn:'er52RenderMarket'   },
  { id:'biz-v52',      icon:'🏢', label:'Doanh Nghiệp',fn:'er52RenderBusiness' },
  { id:'auction-v52',  icon:'🔨', label:'Đấu Giá',     fn:'er52RenderAuction'  },
  { id:'currency-v52', icon:'💱', label:'Tiền Tệ',     fn:'er52RenderCurrency' },
  { id:'ecostat-v52',  icon:'📊', label:'Kinh Tế',     fn:'er52RenderEcoStats' },
];

// ─── STYLE HELPERS ────────────────────────────────────────────────────────
function card(c,bg) { return '<div style="background:'+(bg||'#0f172a')+';border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:8px">'+c+'</div>'; }
function badge(t,col) { return '<span style="background:'+(col||'#1e293b')+'33;color:'+(col||'#94a3b8')+';border:1px solid '+(col||'#94a3b8')+'44;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:bold">'+t+'</span>'; }
function btn(l,oc,col) { return '<button onclick="'+oc+'" style="background:'+(col||'#1e40af')+'22;border:1px solid '+(col||'#1e40af')+'66;color:'+(col||'#60a5fa')+';border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px;font-family:\'Noto Serif SC\',serif;margin:3px;transition:all 0.2s">'+l+'</button>'; }
function section(t,ic,c,col) { return '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:bold;color:'+(col||'#94a3b8')+';margin-bottom:6px;border-bottom:1px solid #1e293b;padding-bottom:4px">'+ic+' '+t+'</div>'+c+'</div>'; }
function row(items) { return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+items.join('')+'</div>'; }
function statBox(l,v,col) { return '<div style="text-align:center;background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:10px 8px;flex:1;min-width:70px"><div style="font-size:18px;font-weight:bold;color:'+(col||'#e2e8f0')+'">'+v+'</div><div style="font-size:9px;color:#475569;margin-top:2px">'+l+'</div></div>'; }

function fmt(n) {
  if(n>=1e9)  return (n/1e9).toFixed(1)+'T';
  if(n>=1e6)  return (n/1e6).toFixed(1)+'TR';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return String(Math.floor(n));
}
function currIcon(id) { const map={dong:'🟤',bac:'⚪',vang:'🪙',tinhThach:'💎',thanThach:'✨'}; return map[id]||'💰'; }
function currName(id) { const map={dong:'Đồng',bac:'Bạc',vang:'Vàng',tinhThach:'Tinh Thạch',thanThach:'Thần Thạch'}; return map[id]||id; }

// ─── RENDER: VÍ ──────────────────────────────────────────────────────────
window.er52RenderWallet = function() {
  const el = document.getElementById('panel-wallet-v52'); if(!el) return;
  const wallet = typeof window.pec52GetWallet === 'function' ? window.pec52GetWallet() : {};
  const stats  = typeof window.pec52GetStats  === 'function' ? window.pec52GetStats()  : {};
  const income = typeof window.pec52GetIncomeLog === 'function' ? window.pec52GetIncomeLog() : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#facc15;margin-bottom:12px">👛 Ví Tiền — Tài Sản</div>';

  // Net worth
  const nw = stats.netWorth||0;
  html += card('<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;color:#94a3b8">Tổng Tài Sản (quy đồng)</div><div style="font-size:22px;font-weight:bold;color:#facc15">'+fmt(nw)+'</div></div><div style="text-align:right"><div style="font-size:11px;color:#22c55e">'+stats.richestTitle+'</div>'+(stats.netWorthChange>0?'<div style="font-size:10px;color:#22c55e">▲ +'+fmt(stats.netWorthChange)+'</div>':stats.netWorthChange<0?'<div style="font-size:10px;color:#ef4444">▼ '+fmt(stats.netWorthChange)+'</div>':'')+'</div></div>', '#0a0f1a');

  // Wallet per currency
  html += section('Ví Tiền Chi Tiết', '💰',
    ['dong','bac','vang','tinhThach','thanThach'].map(function(cId) {
      const amt = wallet[cId]||0;
      if (amt===0 && cId==='thanThach') return '';
      return card('<div style="display:flex;justify-content:space-between;align-items:center">'+
        '<span style="font-size:13px">'+currIcon(cId)+' <span style="color:#e2e8f0;font-size:11px">'+currName(cId)+'</span></span>'+
        '<span style="font-size:14px;font-weight:bold;color:#facc15">'+fmt(amt)+'</span>'+
      '</div>');
    }).filter(Boolean).join(''), '#fbbf24');

  // Exchange
  html += section('Đổi Tiền', '💱',
    card('<div style="font-size:10px;color:#64748b;margin-bottom:8px">Phí đổi: 5% · Tỷ giá: 1 Vàng = 100 Bạc = 10,000 Đồng</div>'+
      btn('🟤→⚪ 1000 Đồng→Bạc','pec52Exchange("dong","bac",1000);er52RenderWallet()','#94a3b8')+
      btn('⚪→🪙 100 Bạc→Vàng','pec52Exchange("bac","vang",100);er52RenderWallet()','#fbbf24')+
      btn('🪙→💎 10 Vàng→TThạch','pec52Exchange("vang","tinhThach",10);er52RenderWallet()','#60a5fa')+
      btn('🔄 Làm Mới','er52RenderWallet()','#475569')));

  // Income log
  if (income.length > 0) {
    html += section('Thu Nhập Gần Nhất', '📈',
      income.slice(0,8).map(function(i){
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
          '<span style="color:#94a3b8">'+i.source+'</span>'+
          '<span style="color:#22c55e">+'+i.amount+' '+currIcon(i.currency)+'</span>'+
          '<span style="color:#334155">Năm '+i.year+'</span></div>';
      }).join(''));
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: CHỢ ─────────────────────────────────────────────────────────
window.er52RenderMarket = function(filterCat) {
  const el = document.getElementById('panel-market-v52'); if(!el) return;
  const listings = typeof window.pm52GetActiveListings === 'function' ? window.pm52GetActiveListings(filterCat||null) : [];
  const stats    = typeof window.pm52GetStats          === 'function' ? window.pm52GetStats() : {};
  const items    = typeof window.pm52GetItems          === 'function' ? window.pm52GetItems() : [];
  const cats     = [...new Set(items.map(function(i){ return i.category; }))];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:bold;color:#fbbf24">🏪 Chợ Vật Phẩm</span><span style="font-size:10px;color:#64748b">'+stats.activeListings+' mặt hàng · '+stats.totalTrades+' giao dịch</span></div>';

  // Hot items
  if (stats.hotItems && stats.hotItems.length > 0) {
    html += section('Đang Hot 🔥', '🌡️',
      card(stats.hotItems.map(function(h){ return badge(h.icon+' '+h.name,'#ef4444'); }).join(' ')));
  }

  // Category filter
  html += '<div style="margin-bottom:8px">'+
    btn('Tất Cả','er52RenderMarket()','#475569')+
    cats.map(function(c){ return btn(c,'er52RenderMarket("'+c+'")','#1e40af'); }).join('')+
  '</div>';

  // Quick sell
  html += section('Đăng Bán Nhanh', '📦',
    items.slice(0,8).map(function(item){
      return btn(item.icon+' '+item.name,'pm52ListItem("'+item.id+'",1,"'+item.basePrice.currency+'",'+item.basePrice.amount+',"Player","");er52RenderMarket()',item.tier>3?'#f59e0b':'#1e40af');
    }).join('')+
    '<br><div style="font-size:9px;color:#475569;margin-top:4px">Giá mặc định theo giá thị trường hiện tại</div>');

  // Listings
  if (listings.length === 0) {
    html += card('<div style="text-align:center;color:#334155;font-size:11px;padding:8px">Chưa có mặt hàng nào đang bán</div>');
  } else {
    html += section('Đang Bán ('+listings.length+')', '📋',
      listings.slice(0,12).map(function(l){
        const tierColor = l.tier>=4?'#f59e0b':l.tier===3?'#60a5fa':l.tier===2?'#94a3b8':'#475569';
        return card('<div style="display:flex;justify-content:space-between;align-items:center;gap:6px">'+
          '<div style="flex:1"><span style="font-size:13px">'+l.icon+'</span> <span style="font-size:11px;color:'+tierColor+'">'+l.itemName+'</span> x'+l.qty+'<br>'+
          '<span style="font-size:9px;color:#475569">'+l.sellerName+' · Năm '+l.year+'</span></div>'+
          '<div style="text-align:right">'+
            '<div style="font-size:12px;font-weight:bold;color:#fbbf24">'+l.price+' '+currIcon(l.currency)+'</div>'+
            btn('Mua','pm52BuyItem("'+l.id+'","Player");er52RenderMarket()','#22c55e')+
          '</div>'+
        '</div>');
      }).join(''));
  }

  // Recent trades
  const trades = typeof window.pm52GetRecentTrades === 'function' ? window.pm52GetRecentTrades(6) : [];
  if (trades.length > 0) {
    html += section('Giao Dịch Gần Nhất', '📜',
      trades.map(function(t){
        return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b">'+
          '<span style="color:#94a3b8">'+t.itemName+'</span>'+
          '<span style="color:#fbbf24">'+t.amount+' '+currIcon(t.currency)+'</span>'+
          '<span style="color:#334155">'+t.buyer+' · '+t.year+'</span></div>';
      }).join(''));
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: DOANH NGHIỆP ─────────────────────────────────────────────────
window.er52RenderBusiness = function() {
  const el = document.getElementById('panel-biz-v52'); if(!el) return;
  const businesses = typeof window.biz52GetAll      === 'function' ? window.biz52GetAll()      : [];
  const types      = typeof window.biz52GetTypes    === 'function' ? window.biz52GetTypes()    : [];
  const aiComps    = typeof window.biz52GetAICompanies==='function'? window.biz52GetAICompanies():[]; 
  const stats      = typeof window.biz52GetStats    === 'function' ? window.biz52GetStats()    : {};
  const jarvis     = typeof window.biz52GetJarvisReport==='function'?window.biz52GetJarvisReport():{tips:[]};

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:bold;color:#22c55e">🏢 Doanh Nghiệp</span><span style="font-size:10px;color:#64748b">'+stats.totalBusinesses+' DN · '+stats.totalEmployees+' nhân viên</span></div>';

  // Jarvis tips
  if (jarvis.tips && jarvis.tips.length > 0) {
    html += card(jarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''),'#0a1000');
  }

  // My businesses
  if (businesses.length > 0) {
    html += section('Doanh Nghiệp Của Tôi', '🏗️',
      businesses.map(function(b) {
        const bType = types.find(function(t){ return t.id===b.type; });
        return card(
          '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
            '<div>'+
              '<span style="font-size:14px">'+b.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#22c55e">'+b.name+'</span> '+badge('Cấp '+b.level,'#3b82f6')+'<br>'+
              '<span style="font-size:9px;color:#475569">'+b.employees+' nhân viên · Thành lập năm '+b.founded+'</span>'+
            '</div>'+
            '<div style="text-align:right">'+
              '<div style="font-size:10px;color:#22c55e">💰 '+fmt(b.totalEarned)+' kiếm được</div>'+
              btn('⬆️ Nâng Cấp','biz52Upgrade("'+b.id+'");er52RenderBusiness()','#3b82f6')+
              btn('❌ Đóng','if(confirm("Đóng "+\''+b.name+'\'+"?")){biz52Close("'+b.id+'");er52RenderBusiness()}','#ef4444')+
            '</div>'+
          '</div>'+
          (bType?'<div style="font-size:9px;color:#334155;margin-top:4px">'+bType.effects[0]+'</div>':'')
        );
      }).join(''), '#22c55e');
  }

  // Found new
  html += section('Thành Lập Doanh Nghiệp Mới', '✨',
    types.map(function(t) {
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
          '<div>'+
            '<span style="font-size:16px">'+t.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#60a5fa">'+t.name+'</span><br>'+
            '<span style="font-size:10px;color:#64748b">'+t.desc+'</span><br>'+
            '<span style="font-size:9px;color:#334155">Thu nhập: '+t.incomeBase.amount+' '+currName(t.incomeBase.currency)+'/'+t.incomeInterval+' tick</span>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0;margin-left:8px">'+
            '<div style="font-size:10px;color:#fbbf24;margin-bottom:4px">💰 '+t.cost.amount+' '+currName(t.cost.currency)+'</div>'+
            btn('Thành Lập','biz52Found("'+t.id+'",null);er52RenderBusiness()','#22c55e')+
          '</div>'+
        '</div>'
      );
    }).join(''), '#60a5fa');

  // AI competition
  html += section('Cạnh Tranh AI ('+aiComps.length+' công ty)', '🤖',
    aiComps.slice(0,5).map(function(c) {
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+c.icon+' <span style="color:#94a3b8">'+c.name+'</span> '+badge('Cấp '+c.level,'#475569')+'</span>'+
        '<span style="color:#fbbf24">'+c.revenue+'/tick</span></div>';
    }).join(''), '#475569');

  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: ĐẤU GIÁ ─────────────────────────────────────────────────────
window.er52RenderAuction = function() {
  const el = document.getElementById('panel-auction-v52'); if(!el) return;
  const auctions = typeof window.pm52GetActiveAuctions === 'function' ? window.pm52GetActiveAuctions() : [];
  const items    = typeof window.pm52GetItems          === 'function' ? window.pm52GetItems() : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:bold;color:#f59e0b">🔨 Nhà Đấu Giá</span><span style="font-size:10px;color:#64748b">'+auctions.length+' phiên đang mở</span></div>';

  // Create auction
  html += section('Tổ Chức Đấu Giá', '✨',
    card('<div style="font-size:10px;color:#64748b;margin-bottom:8px">Chọn vật phẩm đặc biệt để đấu giá — giá khởi điểm thấp thu hút nhiều người mua</div>'+
      items.filter(function(i){ return i.tier>=3; }).slice(0,6).map(function(item) {
        return btn(item.icon+' '+item.name+' (Bắt đầu: '+item.basePrice.amount+')',
          'pm52CreateAuction("'+item.id+'","'+item.basePrice.currency+'",'+item.basePrice.amount+',5,"Player");er52RenderAuction()',
          item.tier>=5?'#f59e0b':'#7c3aed');
      }).join('')));

  if (auctions.length === 0) {
    html += card('<div style="text-align:center;color:#334155;font-size:11px;padding:12px">Chưa có phiên đấu giá nào đang diễn ra</div>');
  } else {
    html += section('Phiên Đang Mở ('+auctions.length+')', '🔴',
      auctions.map(function(a) {
        return card(
          '<div style="display:flex;justify-content:space-between;align-items:flex-start">'+
            '<div>'+
              '<span style="font-size:14px">'+a.icon+'</span> <span style="font-size:11px;font-weight:bold;color:#f59e0b">'+a.itemName+'</span><br>'+
              '<span style="font-size:9px;color:#475569">Bởi: '+a.sellerName+' · Kết thúc năm '+a.endsYear+'</span>'+
            '</div>'+
            '<div style="text-align:right">'+
              '<div style="font-size:12px;font-weight:bold;color:#fbbf24">'+a.currentBid+' '+currIcon(a.startCurrency)+'</div>'+
              (a.currentBidder?'<div style="font-size:9px;color:#60a5fa">⬆️ '+a.currentBidder+'</div>':'')+
              btn('Đặt Giá +10%','pm52PlaceBid("'+a.id+'","Player",Math.floor('+a.currentBid+'*1.1),"'+a.startCurrency+'");er52RenderAuction()','#f59e0b')+
              btn('Đặt Giá +50%','pm52PlaceBid("'+a.id+'","Player",Math.floor('+a.currentBid+'*1.5),"'+a.startCurrency+'");er52RenderAuction()','#ef4444')+
            '</div>'+
          '</div>',
          '#0a0f1a');
      }).join(''), '#f59e0b');
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: TIỀN TỆ ─────────────────────────────────────────────────────
window.er52RenderCurrency = function() {
  const el = document.getElementById('panel-currency-v52'); if(!el) return;
  const taxStats   = typeof window.tax52GetStats        === 'function' ? window.tax52GetStats()     : {};
  const policies   = typeof window.tax52GetPolicies     === 'function' ? window.tax52GetPolicies()  : [];
  const taxJarvis  = typeof window.tax52GetJarvisReport === 'function' ? window.tax52GetJarvisReport() : { tips:[] };
  const currencies = typeof window.pec52GetCurrencies   === 'function' ? window.pec52GetCurrencies() : [];

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#60a5fa;margin-bottom:12px">💱 Tiền Tệ & Thuế</div>';

  // Exchange rates
  html += section('Tỷ Giá Hối Đoái', '📈',
    card(currencies.map(function(c) {
      const rates = {dong:1,bac:100,vang:10000,tinhThach:1000000,thanThach:1000000000};
      return '<div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #1e293b">'+
        '<span>'+c.icon+' <span style="color:#e2e8f0">'+c.name+'</span></span>'+
        '<span style="color:#fbbf24">1 = '+(rates[c.id]||1).toLocaleString()+' Đồng</span></div>';
    }).join('')));

  // Tax policy
  html += section('Chính Sách Thuế Hiện Tại', '📋',
    card('<div style="display:flex;justify-content:space-between;margin-bottom:6px">'+
      '<span style="font-size:12px;color:#60a5fa">'+taxStats.policyIcon+' '+taxStats.currentPolicy+'</span>'+
      '<span style="font-size:11px;color:#fbbf24">Thuế suất: '+taxStats.effectiveRate+'</span>'+
    '</div>'+
    (taxJarvis.tips.map(function(t){ return '<div style="font-size:10px;color:#fbbf24;margin:2px 0">'+t+'</div>'; }).join(''))));

  // Change policy
  html += section('Thay Đổi Chính Sách', '⚖️',
    policies.map(function(p) {
      const isCurrent = taxStats.currentPolicy === p.name;
      return card(
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<div><span style="font-size:13px">'+p.icon+'</span> <span style="font-size:11px;color:'+(isCurrent?'#22c55e':'#60a5fa')+'">'+p.name+'</span>'+
          (isCurrent?' '+badge('Đang Dùng','#22c55e'):'')+
          '<div style="font-size:9px;color:#64748b">'+p.desc+'</div></div>'+
          '<div style="text-align:right;flex-shrink:0;margin-left:8px">'+
            '<div style="font-size:10px;color:#fbbf24">💰 '+p.cost.amount+' '+currName(p.cost.currency)+'</div>'+
            (isCurrent?'':btn('Áp Dụng','tax52SetPolicy("'+p.id+'");er52RenderCurrency()','#60a5fa'))+
          '</div>'+
        '</div>',
        isCurrent?'#0a1a0a':'#0a0f1a');
    }).join(''), '#60a5fa');

  // Tax ledger
  if (taxStats.recentLedger && taxStats.recentLedger.length > 0) {
    html += section('Lịch Sử Thuế', '📜',
      taxStats.recentLedger.slice(0,6).map(function(t){
        return '<div style="font-size:10px;padding:2px 0;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between">'+
          '<span style="color:#94a3b8">'+t.type+'</span><span style="color:#ef4444">-'+t.amount+'</span><span style="color:#334155">Năm '+t.year+'</span></div>';
      }).join(''));
  }
  html += '</div>';
  el.innerHTML = html;
};

// ─── RENDER: THỐNG KÊ KINH TẾ ────────────────────────────────────────────
window.er52RenderEcoStats = function() {
  const el = document.getElementById('panel-ecostat-v52'); if(!el) return;
  const mktStats = typeof window.pm52GetStats        === 'function' ? window.pm52GetStats()        : {};
  const bizStats = typeof window.biz52GetStats       === 'function' ? window.biz52GetStats()       : {};
  const taxStats = typeof window.tax52GetStats       === 'function' ? window.tax52GetStats()       : {};
  const econStats= typeof window.pec52GetStats       === 'function' ? window.pec52GetStats()       : {};
  const hotItems = mktStats.hotItems || [];
  const wallet   = econStats.wallet || {};

  let html = '<div style="padding:12px;font-family:\'Noto Serif SC\',serif;color:#e2e8f0">';
  html += '<div style="font-size:13px;font-weight:bold;color:#a78bfa;margin-bottom:12px">📊 Thống Kê Kinh Tế Toàn Cầu V52</div>';

  // Overview stats
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+
    statBox('Tài Sản (Đồng)', fmt(econStats.netWorth||0), '#facc15')+
    statBox('Giao Dịch', mktStats.totalTrades||0, '#60a5fa')+
    statBox('Doanh Nghiệp', bizStats.totalBusinesses||0, '#22c55e')+
    statBox('Nhân Viên', bizStats.totalEmployees||0, '#a78bfa')+
    statBox('Thuế Suất', taxStats.effectiveRate||'0%', '#f59e0b')+
  '</div>';

  // Market stats
  html += section('Thị Trường', '🏪',
    card('<div style="font-size:10px;color:#64748b">'+
      '<div>Tổng Mặt Hàng Đang Bán: <span style="color:#fbbf24">'+mktStats.activeListings+'</span></div>'+
      '<div>Phiên Đấu Giá Đang Mở: <span style="color:#f59e0b">'+mktStats.activeAuctions+'</span></div>'+
      '<div>Giao Dịch Cao Nhất: <span style="color:#22c55e">'+(mktStats.highestSale?fmt(mktStats.highestSale)+' Đồng ('+mktStats.highestItem+')':'Chưa có')+'</span></div>'+
      '<div>Tổng Volume: <span style="color:#60a5fa">'+fmt(mktStats.totalVolume||0)+' Đồng</span></div>'+
    '</div>'));

  // Hot items
  if (hotItems.length > 0) {
    html += section('Vật Phẩm Được Tìm Kiếm Nhiều Nhất', '🔥',
      card(hotItems.map(function(h,i){ return (i+1)+'. '+h.icon+' <span style="color:#fbbf24">'+h.name+'</span> (demand: '+h.demand+'%)'; }).join('<br>'), '#0a0a00'));
  }

  // Business stats
  html += section('Doanh Nghiệp', '🏢',
    card('<div style="font-size:10px;color:#64748b">'+
      '<div>Tổng Doanh Thu: <span style="color:#22c55e">'+fmt(bizStats.totalRevenue||0)+'</span></div>'+
      '<div>Tổng Chi Phí: <span style="color:#ef4444">'+fmt(bizStats.totalExpenses||0)+'</span></div>'+
      '<div>Lợi Nhuận Ròng: <span style="color:'+(bizStats.netProfit>=0?'#22c55e':'#ef4444')+'">'+fmt(bizStats.netProfit||0)+'</span></div>'+
      (bizStats.topBusiness?'<div>DN Tốt Nhất: <span style="color:#facc15">'+bizStats.topBusiness.icon+' '+bizStats.topBusiness.name+'</span></div>':'')+
    '</div>'));

  // World economy context
  const warsCount = typeof window.warsActive !== 'undefined' ? (window.warsActive||[]).length : 0;
  const mktMod    = typeof window.playerEconV52Data !== 'undefined' ? window.playerEconV52Data.marketModifier : 1.0;
  html += section('Bối Cảnh Thế Giới', '🌍',
    card('<div style="font-size:10px;color:#64748b">'+
      '<div>Hệ Số Thị Trường: <span style="color:'+(mktMod>=1?'#22c55e':'#ef4444')+'">'+mktMod.toFixed(2)+'x</span>'+(mktMod>1?' (Thịnh vượng)':mktMod<0.8?' (Suy thoái)':' (Bình thường)')+'</div>'+
      '<div>Chiến Tranh Đang Diễn Ra: <span style="color:'+(warsCount>3?'#ef4444':'#fbbf24')+'">'+warsCount+'</span>'+(warsCount>3?' (Ảnh hưởng xấu đến kinh tế)':'')+'</div>'+
      '<div>Chính Sách Thuế: <span style="color:#60a5fa">'+taxStats.currentPolicy+'</span></div>'+
    '</div>'));

  html += btn('🔄 Làm Mới','er52RenderEcoStats()','#475569');
  html += '</div>';
  el.innerHTML = html;
};

// ─── PATCH PLAYER HUB V28 ────────────────────────────────────────────────
function patchPlayerHub() {
  const _orig = window.hubRenderPanel;
  if (typeof _orig !== 'function') return;

  window.hubRenderPanel = function(hubId) {
    _orig(hubId);
    if (hubId !== 'player-hub-v28') return;

    const panel = document.getElementById('panel-player-hub-v28');
    if (!panel) return;

    const topBar = panel.querySelector('div > div:nth-child(1) > div:nth-child(2)');
    if (!topBar) return;
    if (topBar.querySelector('[data-v52tab]')) return;

    V52_TABS.forEach(function(t) {
      const b = document.createElement('button');
      b.setAttribute('data-v52tab', t.id);
      b.innerHTML = t.icon + ' ' + t.label;
      b.style.cssText = 'padding:5px 8px;background:transparent;border:none;border-bottom:2px solid transparent;color:#64748b;cursor:pointer;font-size:11px;white-space:nowrap;transition:all 0.2s;font-family:\'Noto Serif SC\',serif';
      b.onclick = function() {
        topBar.querySelectorAll('button').forEach(function(x) { x.style.borderBottomColor='transparent'; x.style.color='#64748b'; });
        b.style.borderBottomColor='#fbbf24';
        b.style.color='#fbbf24';
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

// ─── JARVIS HUB WIDGET ───────────────────────────────────────────────────
window.econV52HubRenderPanel = function() {
  const stats  = typeof window.pec52GetStats  === 'function' ? window.pec52GetStats()  : {};
  const mktSt  = typeof window.pm52GetStats   === 'function' ? window.pm52GetStats()   : {};
  const bizSt  = typeof window.biz52GetStats  === 'function' ? window.biz52GetStats()  : {};
  const taxSt  = typeof window.tax52GetStats  === 'function' ? window.tax52GetStats()  : {};

  let html = '<div style="background:#0a0f1a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-top:8px">';
  html += '<div style="font-size:11px;font-weight:bold;color:#fbbf24;margin-bottom:6px">💰 Kinh Tế Người Chơi V52</div>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap">'+
    '<span style="background:#fbbf2422;color:#fbbf24;border:1px solid #fbbf2444;border-radius:4px;padding:2px 6px;font-size:10px">💰 Tài sản: '+fmt(stats.netWorth||0)+'</span>'+
    '<span style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;border-radius:4px;padding:2px 6px;font-size:10px">🏢 DN: '+bizSt.totalBusinesses+'</span>'+
    '<span style="background:#60a5fa22;color:#60a5fa;border:1px solid #60a5fa44;border-radius:4px;padding:2px 6px;font-size:10px">🏪 Bán: '+mktSt.activeListings+'</span>'+
    '<span style="background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b44;border-radius:4px;padding:2px 6px;font-size:10px">📋 Thuế: '+taxSt.effectiveRate+'</span>'+
  '</div>';
  html += '</div>';
  return html;
};

// ─── INIT ─────────────────────────────────────────────────────────────────
function init() {
  patchPlayerHub();
  console.log("[EconomyRegistryV52] 💹 Economy Registry V52 — 6 tabs (Ví/Chợ/Doanh Nghiệp/Đấu Giá/Tiền Tệ/Kinh Tế) trong player-hub-v28 · Hub widget sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
