(function() {
"use strict";
// ============================================================
// PLAYER ECONOMY CORE V52 — Player Economy & Marketplace
// Ví đa tiền tệ · Thu nhập thụ động · Tỷ giá · Giao dịch
// EXPAND ONLY · Extends economyEngine/V2 (KHÔNG ghi đè)
// ============================================================
const SAVE_KEY   = "cgv6_player_economy_v52";
const INIT_DELAY = 6800;

// ─── TIỀN TỆ ─────────────────────────────────────────────────────────────────
const CURRENCIES = {
  dong:     { id:"dong",     name:"Đồng",       icon:"🟤", tier:1, baseValue:1    },
  bac:      { id:"bac",      name:"Bạc",        icon:"⚪", tier:2, baseValue:100  },
  vang:     { id:"vang",     name:"Vàng",       icon:"🪙", tier:3, baseValue:10000 },
  tinhThach:{ id:"tinhThach",name:"Tinh Thạch", icon:"💎", tier:4, baseValue:1000000 },
  thanThach: { id:"thanThach",name:"Thần Thạch", icon:"✨", tier:5, baseValue:1000000000 },
};
// Exchange rate (all relative to Đồng)
const BASE_RATES = { dong:1, bac:100, vang:10000, tinhThach:1000000, thanThach:1000000000 };

// Thu nhập thụ động theo nghề (từ professionSystemV50)
const PROFESSION_INCOME = {
  chienBinh: { currency:"bac", amount:5,  interval:10, label:"Tiền thưởng chiến đấu" },
  phapSu:    { currency:"bac", amount:8,  interval:12, label:"Bán phù lục" },
  hocGia:    { currency:"bac", amount:6,  interval:15, label:"Dạy học" },
  thuongNhan:{ currency:"vang",amount:2,  interval:8,  label:"Hoa hồng thương mại" },
  thoRen:    { currency:"bac", amount:10, interval:10, label:"Gia công vũ khí" },
  tuSi:      { currency:"tinhThach",amount:1,interval:20,label:"Phân phát ban phước" },
  thanQuan:  { currency:"tinhThach",amount:2,interval:15,label:"Thuế tâm linh" },
  // V52 mới
  chuXuong:  { currency:"vang",amount:5,  interval:8,  label:"Lợi nhuận xưởng" },
  chuNganHang:{ currency:"vang",amount:8, interval:10, label:"Lãi suất ngân hàng" },
  nhaoDauTu: { currency:"vang",amount:6,  interval:12, label:"Cổ tức đầu tư" },
  chuGuild:  { currency:"vang",amount:4,  interval:8,  label:"Phí guild" },
};

// ─── STATE ────────────────────────────────────────────────────────────────────
window.playerEconV52Data = {
  wallet:       { dong:500, bac:50, vang:5, tinhThach:0, thanThach:0, custom:{} },
  customCurrencies: [],    // { id, name, icon, worldId, rate }
  incomeLog:    [],        // { year, currency, amount, source }
  expenseLog:   [],        // { year, currency, amount, reason }
  totalEarned:  { dong:0, bac:0, vang:0, tinhThach:0, thanThach:0 },
  totalSpent:   { dong:0, bac:0, vang:0, tinhThach:0, thanThach:0 },
  netWorthHistory: [],     // { year, valueInDong }
  tickCounter:  0,
  exchangeRates: Object.assign({}, BASE_RATES),
  marketModifier: 1.0,     // giá thị trường hiện tại
  lastNetWorth: 0,
  version: "V52"
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.playerEconV52Data)); } catch(e) {}
}
function load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) {
      const parsed = JSON.parse(d);
      window.playerEconV52Data = Object.assign(window.playerEconV52Data, parsed);
      if (!window.playerEconV52Data.wallet) window.playerEconV52Data.wallet = { dong:500, bac:50, vang:5, tinhThach:0, thanThach:0, custom:{} };
    }
  } catch(e) {}
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

window.pec52GetWallet = function() {
  return Object.assign({}, window.playerEconV52Data.wallet);
};

window.pec52AddCurrency = function(currencyId, amount, source) {
  const w = window.playerEconV52Data.wallet;
  if (w[currencyId] === undefined && currencyId !== 'custom') return false;
  amount = Math.max(0, Math.floor(amount));
  if (w[currencyId] === undefined) w[currencyId] = 0;
  w[currencyId] += amount;
  window.playerEconV52Data.totalEarned[currencyId] = (window.playerEconV52Data.totalEarned[currencyId]||0) + amount;
  window.playerEconV52Data.incomeLog.unshift({ year: typeof year!=='undefined'?year:0, currency:currencyId, amount, source:source||'Unknown' });
  if (window.playerEconV52Data.incomeLog.length > 200) window.playerEconV52Data.incomeLog.length = 200;
  save();
  return true;
};

window.pec52SpendCurrency = function(currencyId, amount, reason) {
  const w = window.playerEconV52Data.wallet;
  if (w[currencyId] === undefined) return { ok:false, msg:'Không có loại tiền này' };
  amount = Math.max(0, Math.floor(amount));
  if (w[currencyId] < amount) return { ok:false, msg:'Không đủ '+getCurrencyName(currencyId) };
  w[currencyId] -= amount;
  window.playerEconV52Data.totalSpent[currencyId] = (window.playerEconV52Data.totalSpent[currencyId]||0) + amount;
  window.playerEconV52Data.expenseLog.unshift({ year: typeof year!=='undefined'?year:0, currency:currencyId, amount, reason:reason||'Unknown' });
  if (window.playerEconV52Data.expenseLog.length > 200) window.playerEconV52Data.expenseLog.length = 200;
  save();
  return { ok:true, msg:'Đã chi '+amount+' '+getCurrencyName(currencyId) };
};

window.pec52Exchange = function(fromCurrency, toCurrency, fromAmount) {
  const rates = window.playerEconV52Data.exchangeRates;
  if (!rates[fromCurrency] || !rates[toCurrency]) return { ok:false, msg:'Không hỗ trợ tiền tệ này' };
  const spend = window.pec52SpendCurrency(fromCurrency, fromAmount, 'Đổi tiền →'+toCurrency);
  if (!spend.ok) return spend;
  const toAmount = Math.floor((fromAmount * rates[fromCurrency]) / rates[toCurrency] * 0.95); // 5% phí đổi
  window.pec52AddCurrency(toCurrency, toAmount, 'Đổi tiền từ '+getCurrencyName(fromCurrency));
  return { ok:true, msg:'Đổi '+fromAmount+' '+getCurrencyName(fromCurrency)+' → '+toAmount+' '+getCurrencyName(toCurrency), received:toAmount };
};

window.pec52GetNetWorthInDong = function() {
  const w = window.playerEconV52Data.wallet;
  const rates = window.playerEconV52Data.exchangeRates;
  let total = 0;
  Object.keys(w).forEach(function(cId) {
    if (rates[cId]) total += (w[cId]||0) * rates[cId];
  });
  // Business value from businessSystemV52
  if (typeof window.biz52GetTotalValue === 'function') total += window.biz52GetTotalValue();
  return Math.floor(total);
};

window.pec52GetCurrencies = function() {
  return Object.values(CURRENCIES);
};

window.pec52GetIncomeLog = function() {
  return window.playerEconV52Data.incomeLog.slice(0,50);
};

window.pec52GetStats = function() {
  const nw = window.pec52GetNetWorthInDong();
  const prev = window.playerEconV52Data.lastNetWorth || nw;
  const change = nw - prev;
  return {
    netWorth: nw,
    netWorthChange: change,
    wallet: window.pec52GetWallet(),
    totalTransactions: window.playerEconV52Data.incomeLog.length + window.playerEconV52Data.expenseLog.length,
    marketModifier: window.playerEconV52Data.marketModifier,
    richestTitle: nw > 1e10 ? '💫 Vạn Tỷ Phú' : nw > 1e7 ? '🏆 Tỷ Phú' : nw > 1e5 ? '💰 Triệu Phú' : '🪙 Thường Dân'
  };
};

window.pec52AddCustomCurrency = function(name, icon, worldId, rateInDong) {
  const id = 'cc_' + Date.now().toString(36);
  const cc = { id, name:name||'?', icon:icon||'💰', worldId:worldId||'global', rate:rateInDong||1 };
  window.playerEconV52Data.customCurrencies.push(cc);
  window.playerEconV52Data.wallet[id] = 0;
  window.playerEconV52Data.exchangeRates[id] = rateInDong||1;
  save();
  return cc;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getCurrencyName(id) {
  return CURRENCIES[id] ? CURRENCIES[id].name : id;
}

// ─── TICK: Thu Nhập Thụ Động ─────────────────────────────────────────────────
function processPassiveIncome() {
  const d = window.playerEconV52Data;
  d.tickCounter++;

  // Lấy nghề hiện tại từ V50
  let profId = null;
  if (typeof window.professionV50Data !== 'undefined' && window.professionV50Data.current) {
    profId = window.professionV50Data.current;
  }

  if (profId && PROFESSION_INCOME[profId]) {
    const inc = PROFESSION_INCOME[profId];
    if (d.tickCounter % inc.interval === 0) {
      window.pec52AddCurrency(inc.currency, inc.amount, inc.label);
    }
  }

  // Thu nhập từ businesses
  if (typeof window.biz52ProcessIncome === 'function') {
    window.biz52ProcessIncome();
  }

  // Cập nhật market modifier từ worldEventV51 & disasterData
  let mod = 1.0;
  if (typeof window.globalEventV51Data !== 'undefined') {
    const activeEvents = window.globalEventV51Data.activeEvents || [];
    activeEvents.forEach(function(ev) {
      if (ev.id === 'golden_age') mod *= 1.3;
      else if (ev.id === 'divine_invasion') mod *= 0.7;
      else if (ev.id === 'plague_cleanse') mod *= 0.9;
    });
  }
  if (typeof window.disasterData !== 'undefined' && window.disasterData.activeDisasters) {
    if (window.disasterData.activeDisasters.length > 0) mod *= 0.85;
  }
  d.marketModifier = Math.max(0.3, Math.min(3.0, mod));

  // Lưu net worth history mỗi 20 tick
  if (d.tickCounter % 20 === 0) {
    const nw = window.pec52GetNetWorthInDong();
    d.lastNetWorth = nw;
    d.netWorthHistory.push({ year: typeof year!=='undefined'?year:0, value:nw });
    if (d.netWorthHistory.length > 50) d.netWorthHistory.shift();
    save();
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  load();

  const _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    processPassiveIncome();
  };

  console.log("[PlayerEconCoreV52] 💰 Nền Tảng Kinh Tế Người Chơi V52 — Đa tiền tệ (5 loại) · Thu nhập thụ động · Exchange · Net Worth tracking sẵn sàng.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}
})();
