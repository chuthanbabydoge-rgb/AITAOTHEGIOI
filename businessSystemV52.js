(function() {
"use strict";
// ============================================================
// BUSINESS SYSTEM V52 — Player Economy & Marketplace
// Doanh Nghiệp · Cửa Hàng · Công Ty · Học Viện · Ngân Hàng
// EXPAND ONLY · Tích hợp với playerEconCoreV52
// ============================================================
const SAVE_KEY   = "cgv6_business_v52";
const INIT_DELAY = 7000;

// ─── LOẠI DOANH NGHIỆP ────────────────────────────────────────────────────
const BUSINESS_TYPES = {
  cuaHang: {
    id:'cuaHang', icon:'🏪', name:'Cửa Hàng', desc:'Bán vật phẩm trực tiếp. Thu nhập ổn định.',
    cost:{ currency:'bac', amount:500 },
    incomeBase:{ currency:'bac', amount:8 }, incomeInterval:5,
    maxLevel:5, upgradeMult:2.5,
    employees:{ base:1, perLevel:1 },
    effects:['Mở khóa danh mục vật phẩm mới theo level','Tăng uy tín thương nhân +5/level']
  },
  congTy: {
    id:'congTy', icon:'🏢', name:'Công Ty', desc:'Tổ chức thương mại lớn. Lợi nhuận cao, chi phí cao.',
    cost:{ currency:'vang', amount:3 },
    incomeBase:{ currency:'vang', amount:1 }, incomeInterval:8,
    maxLevel:5, upgradeMult:3.0,
    employees:{ base:5, perLevel:3 },
    effects:['Quyền truy cập thị trường toàn cầu','Giảm thuế thương mại -10%/level']
  },
  hocVien: {
    id:'hocVien', icon:'🏫', name:'Học Viện', desc:'Đào tạo tu sĩ. Thu nhập từ học phí.',
    cost:{ currency:'vang', amount:5 },
    incomeBase:{ currency:'tinhThach', amount:1 }, incomeInterval:12,
    maxLevel:5, upgradeMult:2.0,
    employees:{ base:3, perLevel:2 },
    effects:['Mỗi level tăng 10% XP kỹ năng','Tạo 1 NPC học viên mỗi 20 tick']
  },
  nganHang: {
    id:'nganHang', icon:'🏦', name:'Ngân Hàng', desc:'Cho vay, nhận tiền gửi. Lãi suất sinh tiền.',
    cost:{ currency:'vang', amount:10 },
    incomeBase:{ currency:'vang', amount:3 }, incomeInterval:6,
    maxLevel:5, upgradeMult:3.5,
    employees:{ base:4, perLevel:2 },
    effects:['Giảm 5% chi phí giao dịch/level','Nhận lãi suất từ tiền gửi NPC']
  }
};

// ─── AI COMPETITION ────────────────────────────────────────────────────────
const AI_COMPANIES = [
  { name:'Vạn Bảo Tập Đoàn',   type:'congTy',   icon:'🏢', level:3, revenue:500 },
  { name:'Thiên Đạo Học Viện', type:'hocVien',  icon:'🏫', level:4, revenue:300 },
  { name:'Kim Long Ngân Hành', type:'nganHang', icon:'🏦', level:3, revenue:800 },
  { name:'Linh Thạch Thương Hội',type:'cuaHang',icon:'🏪', level:2, revenue:200 },
  { name:'Huyền Thiết Công Ty', type:'congTy',  icon:'🏢', level:2, revenue:400 },
];

// ─── STATE ────────────────────────────────────────────────────────────────
window.bizV52Data = {
  businesses: [],    // { id, type, name, level, employees, revenue, expenses, founded, status }
  aiCompanies: AI_COMPANIES.map(function(c){ return Object.assign({},c); }),
  totalRevenue:   0,
  totalExpenses:  0,
  tickCounter:    0,
  version: "V52"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.bizV52Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.bizV52Data = Object.assign(window.bizV52Data, JSON.parse(d));
  } catch(e) {}
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────
window.biz52Found = function(typeId, customName) {
  const bType = BUSINESS_TYPES[typeId];
  if (!bType) return { ok:false, msg:'Loại doanh nghiệp không hợp lệ' };
  if (window.bizV52Data.businesses.filter(function(b){ return b.type===typeId && b.status==='active'; }).length >= 3) {
    return { ok:false, msg:'Tối đa 3 '+bType.name+' mỗi loại' };
  }
  // Deduct cost
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency(bType.cost.currency, bType.cost.amount, 'Thành lập '+bType.name)
    : { ok:true };
  if (!spend.ok) return spend;

  const biz = {
    id:         'biz52_'+Date.now().toString(36),
    type:       typeId,
    icon:       bType.icon,
    name:       customName || bType.name + ' #'+(window.bizV52Data.businesses.length+1),
    level:      1,
    employees:  bType.employees.base,
    revenue:    0,
    expenses:   Math.floor(bType.incomeBase.amount * 0.3),
    founded:    typeof year !== 'undefined' ? year : 0,
    status:     'active',
    totalEarned:0
  };
  window.bizV52Data.businesses.push(biz);
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:biz.founded, type:'economy', title:'🏗️ Thành lập '+biz.name, color:'#22c55e' });
  if (typeof window.wmeAddMemory === 'function') window.wmeAddMemory({ year:biz.founded, category:'economy', title:'Thành lập '+biz.name, content:'Doanh nghiệp mới '+bType.name+' được thành lập.' });
  return { ok:true, msg:'Đã thành lập '+biz.name+'!', biz };
};

window.biz52Upgrade = function(bizId) {
  const biz = window.bizV52Data.businesses.find(function(b){ return b.id===bizId && b.status==='active'; });
  if (!biz) return { ok:false, msg:'Không tìm thấy doanh nghiệp' };
  const bType = BUSINESS_TYPES[biz.type];
  if (biz.level >= bType.maxLevel) return { ok:false, msg:'Đã đạt cấp tối đa' };
  const upgradeCost = Math.floor(bType.cost.amount * Math.pow(bType.upgradeMult, biz.level));
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency(bType.cost.currency, upgradeCost, 'Nâng cấp '+biz.name)
    : { ok:true };
  if (!spend.ok) return spend;
  biz.level++;
  biz.employees = bType.employees.base + bType.employees.perLevel*(biz.level-1);
  save();
  return { ok:true, msg:biz.name+' lên cấp '+biz.level+'!' };
};

window.biz52Close = function(bizId) {
  const biz = window.bizV52Data.businesses.find(function(b){ return b.id===bizId; });
  if (!biz) return { ok:false, msg:'Không tìm thấy' };
  biz.status = 'closed';
  biz.closedYear = typeof year !== 'undefined' ? year : 0;
  // Refund 30%
  const bType = BUSINESS_TYPES[biz.type];
  const refund = Math.floor(bType.cost.amount * 0.3 * biz.level);
  if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency(bType.cost.currency, refund, 'Đóng cửa '+biz.name);
  save();
  return { ok:true, msg:'Đã đóng '+biz.name+'. Hoàn lại '+refund+' '+bType.cost.currency };
};

window.biz52GetAll = function() {
  return window.bizV52Data.businesses.filter(function(b){ return b.status==='active'; });
};

window.biz52GetTypes = function() { return Object.values(BUSINESS_TYPES); };

window.biz52GetAICompanies = function() { return window.bizV52Data.aiCompanies.slice(); };

window.biz52GetTotalValue = function() {
  let total = 0;
  window.bizV52Data.businesses.filter(function(b){ return b.status==='active'; }).forEach(function(b) {
    const bType = BUSINESS_TYPES[b.type];
    if (bType) {
      const rates = typeof window.playerEconV52Data !== 'undefined' ? window.playerEconV52Data.exchangeRates : {dong:1,bac:100,vang:10000,tinhThach:1000000};
      total += bType.cost.amount * (rates[bType.cost.currency]||1) * b.level * 2;
    }
  });
  return total;
};

window.biz52GetStats = function() {
  const active = window.bizV52Data.businesses.filter(function(b){ return b.status==='active'; });
  return {
    totalBusinesses: active.length,
    totalEmployees:  active.reduce(function(s,b){ return s+b.employees; },0),
    totalRevenue:    window.bizV52Data.totalRevenue,
    totalExpenses:   window.bizV52Data.totalExpenses,
    netProfit:       window.bizV52Data.totalRevenue - window.bizV52Data.totalExpenses,
    topBusiness:     active.sort(function(a,b){ return b.totalEarned-a.totalEarned; })[0] || null
  };
};

// ─── INCOME PROCESSING ───────────────────────────────────────────────────
window.biz52ProcessIncome = function() {
  const d = window.bizV52Data;
  d.tickCounter++;
  const active = d.businesses.filter(function(b){ return b.status==='active'; });
  active.forEach(function(biz) {
    const bType = BUSINESS_TYPES[biz.type];
    if (!bType) return;
    if (d.tickCounter % bType.incomeInterval === 0) {
      const baseAmt = bType.incomeBase.amount * biz.level;
      const mkt     = typeof window.playerEconV52Data !== 'undefined' ? window.playerEconV52Data.marketModifier : 1.0;
      const taxRate = typeof window.tax52GetEffectiveRate === 'function' ? window.tax52GetEffectiveRate(biz.type) : 0.1;
      const gross   = Math.ceil(baseAmt * mkt);
      const tax     = Math.floor(gross * taxRate);
      const net     = gross - tax;

      if (typeof window.pec52AddCurrency === 'function') window.pec52AddCurrency(bType.incomeBase.currency, net, biz.name+' — Lợi nhuận');
      biz.revenue    += gross;
      biz.expenses   += Math.floor(gross * 0.2); // operating costs
      biz.totalEarned += net;
      d.totalRevenue  += gross;
      d.totalExpenses += tax + Math.floor(gross*0.2);
    }
  });

  // AI competition fluctuation
  if (d.tickCounter % 30 === 0) {
    d.aiCompanies.forEach(function(c) {
      c.revenue = Math.max(50, c.revenue + Math.floor((Math.random()-0.4)*50));
    });
    save();
  }
};

// ─── JARVIS ECONOMY REPORT ────────────────────────────────────────────────
window.biz52GetJarvisReport = function() {
  const stats  = window.biz52GetStats();
  const active = window.biz52GetAll();
  const tips   = [];
  if (active.length === 0) tips.push('🏗️ Chưa có doanh nghiệp — thành lập Cửa Hàng để bắt đầu kiếm thu nhập thụ động');
  if (stats.totalEmployees > 0 && stats.netProfit < 0) tips.push('⚠️ Lợi nhuận âm — xem xét nâng cấp hoặc đóng doanh nghiệp lỗ lãi');
  if (active.length > 0 && active.every(function(b){ return b.level < 3; })) tips.push('💡 Nâng cấp doanh nghiệp lên cấp 3+ để tăng thu nhập đáng kể');
  const topAI = window.bizV52Data.aiCompanies.sort(function(a,b){ return b.revenue-a.revenue; })[0];
  if (topAI) tips.push('🏆 Công ty lớn nhất thế giới: '+topAI.name+' (doanh thu '+topAI.revenue+'/tick)');
  return { tips, stats };
};

// ─── INIT ──────────────────────────────────────────────────────────────────
function init() {
  load();
  console.log("[BusinessSystemV52] 🏢 Doanh Nghiệp V52 — 4 loại (Cửa Hàng/Công Ty/Học Viện/Ngân Hàng) · AI Competition · Max Level 5 · Thu nhập tự động sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
