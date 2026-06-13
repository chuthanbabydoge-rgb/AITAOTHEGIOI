(function() {
"use strict";
// ============================================================
// TAXATION SYSTEM V52 — Player Economy & Marketplace
// Thuế Quốc Gia · Đế Chế · Thương Mại · Policy Effects
// EXPAND ONLY · Reads kingdomData/empireData (KHÔNG ghi đè)
// ============================================================
const SAVE_KEY   = "cgv6_taxation_v52";
const INIT_DELAY = 7100;

// ─── LOẠI THUẾ ───────────────────────────────────────────────────────────
const TAX_TYPES = {
  quocGia:    { id:'quocGia',   icon:'🏰', name:'Thuế Quốc Gia',   base:0.08, desc:'Thu 8% doanh thu vào ngân khố quốc gia'    },
  deChé:      { id:'deChé',     icon:'👑', name:'Thuế Đế Chế',     base:0.12, desc:'Thu 12% − dành cho các lãnh thổ đế chế'   },
  thuongMai:  { id:'thuongMai', icon:'🚢', name:'Thuế Thương Mại', base:0.05, desc:'Thu 5% mỗi giao dịch trên chợ'            },
  daoLuyen:   { id:'daoLuyen',  icon:'🧘', name:'Thuế Tu Luyện',   base:0.03, desc:'Thu 3% tinh thạch từ tu sĩ cao cấp'       },
};

// ─── POLICY (Chính Sách) ─────────────────────────────────────────────────
const TAX_POLICIES = [
  { id:'freeTrade',  icon:'🌐', name:'Tự Do Thương Mại', thuongMaiMult:0.5, quocGiaMult:1.0, desc:'Giảm 50% thuế thương mại, kích thích trao đổi', cost:{currency:'vang',amount:2} },
  { id:'warEconomy', icon:'⚔️', name:'Kinh Tế Chiến Tranh', quocGiaMult:1.5, thuongMaiMult:0.8, desc:'Tăng 50% thuế quốc gia cho chiến tranh', cost:{currency:'bac',amount:300} },
  { id:'prosperity', icon:'🌟', name:'Thịnh Vượng Kinh Tế', quocGiaMult:0.7, daoLuyenMult:0.5, desc:'Giảm thuế toàn diện, kích thích phát triển', cost:{currency:'vang',amount:5} },
  { id:'taxReform',  icon:'📋', name:'Cải Cách Thuế',   quocGiaMult:0.9, thuongMaiMult:0.9, daoLuyenMult:0.9, desc:'Cắt giảm tất cả thuế 10%', cost:{currency:'vang',amount:3} },
  { id:'taxHaven',   icon:'🏝️', name:'Thiên Đường Thuế',  quocGiaMult:0.1, thuongMaiMult:0.1, daoLuyenMult:0.1, desc:'Thuế gần bằng 0 − thu hút thương nhân', cost:{currency:'tinhThach',amount:2} },
];

// ─── STATE ────────────────────────────────────────────────────────────────
window.taxV52Data = {
  currentPolicy:  null,    // policy id hiện tại
  policyHistory:  [],      // { policyId, year }
  taxCollected:   { quocGia:0, deChé:0, thuongMai:0, daoLuyen:0 },
  taxPaid:        0,
  taxLedger:      [],      // { year, type, amount, currency }
  politicalStatus:'independent', // independent/kingdom/empire
  kingdomId:      null,
  empireId:       null,
  tickCounter:    0,
  version: "V52"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.taxV52Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) window.taxV52Data = Object.assign(window.taxV52Data, JSON.parse(d));
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────────────
function getMultiplier(taxTypeId) {
  const policy = window.taxV52Data.currentPolicy;
  if (!policy) return 1.0;
  const pol = TAX_POLICIES.find(function(p){ return p.id===policy; });
  if (!pol) return 1.0;
  return pol[taxTypeId+'Mult'] || 1.0;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────
window.tax52GetEffectiveRate = function(businessType) {
  const base = TAX_TYPES.quocGia.base;
  const tradeBonus = businessType==='cuaHang'||businessType==='congTy' ? TAX_TYPES.thuongMai.base : 0;
  const qgMult  = getMultiplier('quocGia');
  const tmMult  = getMultiplier('thuongMai');
  let effective = base * qgMult + tradeBonus * tmMult;

  // Nếu thuộc đế chế thì thêm thuế đế chế
  if (window.taxV52Data.politicalStatus === 'empire') {
    effective += TAX_TYPES.deChé.base * getMultiplier('deChé');
  }
  return Math.max(0.01, Math.min(0.5, effective));
};

window.tax52SetPolicy = function(policyId) {
  const pol = TAX_POLICIES.find(function(p){ return p.id===policyId; });
  if (!pol) return { ok:false, msg:'Chính sách không tồn tại' };
  const spend = typeof window.pec52SpendCurrency === 'function'
    ? window.pec52SpendCurrency(pol.cost.currency, pol.cost.amount, 'Áp dụng chính sách: '+pol.name)
    : { ok:true };
  if (!spend.ok) return spend;
  window.taxV52Data.currentPolicy = policyId;
  window.taxV52Data.policyHistory.push({ policyId, year: typeof year!=='undefined'?year:0 });
  if (window.taxV52Data.policyHistory.length > 20) window.taxV52Data.policyHistory.shift();
  save();
  if (typeof window.htAddEvent === 'function') window.htAddEvent({ year:typeof year!=='undefined'?year:0, type:'politics', title:'📋 Chính sách thuế: '+pol.name, color:'#60a5fa' });
  return { ok:true, msg:'Đã áp dụng chính sách: '+pol.name };
};

window.tax52GetCurrentPolicy = function() {
  if (!window.taxV52Data.currentPolicy) return null;
  return TAX_POLICIES.find(function(p){ return p.id===window.taxV52Data.currentPolicy; }) || null;
};

window.tax52GetPolicies = function() { return TAX_POLICIES.slice(); };
window.tax52GetTypes    = function() { return Object.values(TAX_TYPES); };

window.tax52GetStats = function() {
  const pol  = window.tax52GetCurrentPolicy();
  const rate = window.tax52GetEffectiveRate('general');
  return {
    currentPolicy:  pol ? pol.name : 'Không có',
    policyIcon:     pol ? pol.icon : '⚖️',
    effectiveRate:  (rate*100).toFixed(1)+'%',
    totalCollected: window.taxV52Data.taxCollected,
    totalPaid:      window.taxV52Data.taxPaid,
    politicalStatus:window.taxV52Data.politicalStatus,
    recentLedger:   window.taxV52Data.taxLedger.slice(0,10)
  };
};

window.tax52RecordPayment = function(taxTypeId, amount, currency) {
  window.taxV52Data.taxCollected[taxTypeId] = (window.taxV52Data.taxCollected[taxTypeId]||0) + amount;
  window.taxV52Data.taxPaid += amount;
  window.taxV52Data.taxLedger.unshift({ year:typeof year!=='undefined'?year:0, type:taxTypeId, amount, currency });
  if (window.taxV52Data.taxLedger.length > 50) window.taxV52Data.taxLedger.length = 50;
};

window.tax52GetJarvisReport = function() {
  const rate = window.tax52GetEffectiveRate('general');
  const pol  = window.tax52GetCurrentPolicy();
  const tips = [];
  if (rate > 0.25) tips.push('⚠️ Thuế suất cao ('+Math.round(rate*100)+'%) — thương nhân đang rời đi');
  if (rate < 0.05) tips.push('💡 Thuế suất thấp — thu nhập ngân khố ít nhưng thương nghiệp phát triển');
  if (!pol) tips.push('📋 Chưa có chính sách thuế — áp dụng "Tự Do Thương Mại" để kích thích kinh tế');
  if (pol && pol.id === 'taxHaven') tips.push('🏝️ Thiên Đường Thuế đang hoạt động — thu hút thương nhân từ khắp thế giới');
  return { tips, effectiveRate:rate, policy:pol };
};

// ─── TICK: Kiểm tra chính trị ─────────────────────────────────────────────
function tick() {
  window.taxV52Data.tickCounter++;
  if (window.taxV52Data.tickCounter % 25 === 0) {
    // Sync political status
    if (typeof window.playerTerritoryData !== 'undefined') {
      if (window.playerTerritoryData.playerEmpire) {
        window.taxV52Data.politicalStatus = 'empire';
        window.taxV52Data.empireId = window.playerTerritoryData.playerEmpire;
      } else if (window.playerTerritoryData.playerKingdom) {
        window.taxV52Data.politicalStatus = 'kingdom';
        window.taxV52Data.kingdomId = window.playerTerritoryData.playerKingdom;
      } else {
        window.taxV52Data.politicalStatus = 'independent';
      }
    }
    save();
  }
}

// ─── INIT ──────────────────────────────────────────────────────────────────
function init() {
  load();
  const _orig = window.gameTick;
  window.gameTick = function() { if(_orig) _orig(); tick(); };
  console.log("[TaxationSystemV52] 📋 Hệ Thống Thuế V52 — 4 loại thuế · 5 chính sách · Quốc gia/Đế chế/Thương mại · Jarvis cảnh báo sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
