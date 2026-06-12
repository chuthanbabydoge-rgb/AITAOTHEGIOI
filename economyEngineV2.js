/* ================================================================
   ECONOMY & TRADE ENGINE V2 — economyEngineV2.js
   Creator God V6  ·  Phase NEXT
   ----------------------------------------------------------------
   NEW FILE — purely additive on top of economyEngine.js (V1).
   Does NOT modify, delete, or reset anything from V1 or earlier.
   ----------------------------------------------------------------
   ADDS:
     • NPC Occupations (Farmer, Miner, Merchant, Blacksmith,
       Alchemist, Scholar, Soldier, Builder, Fisherman...)
     • Employment System — work generates wealth
     • Wealth Classes (Poor → Legendary Wealth)
     • Banking System — banks, deposits, loans, interest, treasury
     • Currency System — countries mint their own currencies
     • Per-Resource Production / Consumption / Supply & Demand
       dynamic pricing (Food, Wood, Stone, Iron, Gold, Spirit
       Stones, Herbs, Rare Metals, Crystal, Monster Materials)
     • Monopoly System — guilds can monopolize a resource
     • Smuggling & Black Market
     • Investment System — rich NPCs invest, returns vary
     • Trade Wars — embargo / sanction / blockade
     • Merchant Legends — legendary merchant records
     • Extended Economic Rankings panel + tab
   ----------------------------------------------------------------
   SAVE COMPATIBILITY: fully additive; never deletes existing
   fields, worlds, NPCs, sects, countries, dynasties, history.
   ================================================================ */

"use strict";

// ================================================================
// CONSTANTS
// ================================================================

const EV2_RESOURCES = {
  food:      { name:"Lương Thực",     icon:"🌾", basePrice:5,   volatility:0.08 },
  wood:      { name:"Gỗ",             icon:"🪵", basePrice:8,   volatility:0.06 },
  stone:     { name:"Đá",             icon:"🪨", basePrice:6,   volatility:0.05 },
  iron:      { name:"Sắt",            icon:"⚙️", basePrice:30,  volatility:0.10 },
  gold:      { name:"Vàng",           icon:"🪙", basePrice:100, volatility:0.12 },
  spiritStones:{ name:"Linh Thạch",   icon:"💎", basePrice:120, volatility:0.15 },
  herbs:     { name:"Thảo Dược",      icon:"🌿", basePrice:25,  volatility:0.09 },
  rareMetals:{ name:"Khoáng Quý",     icon:"🔮", basePrice:300, volatility:0.18 },
  crystal:   { name:"Pha Lê",         icon:"💠", basePrice:250, volatility:0.16 },
  monsterMat:{ name:"Yêu Thú Liệu",   icon:"🦴", basePrice:80,  volatility:0.20 },
};

const EV2_OCCUPATIONS = [
  { id:"farmer",    name:"Nông Dân",    icon:"🌾", produces:"food",       baseOutput:12, wageBase:8  },
  { id:"miner",     name:"Thợ Mỏ",      icon:"⛏️", produces:"iron",       baseOutput:6,  wageBase:14 },
  { id:"merchant",  name:"Thương Nhân", icon:"🛒", produces:null,         baseOutput:0,  wageBase:20 },
  { id:"blacksmith",name:"Thợ Rèn",     icon:"🔨", produces:"stone",      baseOutput:5,  wageBase:18 },
  { id:"alchemist", name:"Luyện Đan Sư",icon:"⚗️", produces:"herbs",      baseOutput:4,  wageBase:30 },
  { id:"scholar",   name:"Học Giả",     icon:"📚", produces:null,         baseOutput:0,  wageBase:16 },
  { id:"soldier",   name:"Binh Sĩ",     icon:"🗡️", produces:null,         baseOutput:0,  wageBase:12 },
  { id:"builder",   name:"Thợ Xây",     icon:"🏗️", produces:"wood",       baseOutput:7,  wageBase:13 },
  { id:"fisherman", name:"Ngư Dân",     icon:"🎣", produces:"food",       baseOutput:9,  wageBase:9  },
];

const EV2_WEALTH_CLASSES = [
  { min:0,       max:200,      label:"Bần Cùng",        icon:"🥔", color:"#94a3b8" },
  { min:200,     max:1000,     label:"Bình Dân",        icon:"🧺", color:"#a3a3a3" },
  { min:1000,    max:5000,     label:"Khá Giả",         icon:"🏠", color:"#86efac" },
  { min:5000,    max:25000,    label:"Giàu Có",         icon:"💰", color:"#4ade80" },
  { min:25000,   max:100000,   label:"Quý Tộc",         icon:"👑", color:"#facc15" },
  { min:100000,  max:1000000,  label:"Đại Phú Hào",     icon:"🏰", color:"#fb923c" },
  { min:1000000, max:Infinity, label:"Tài Phú Truyền Kỳ", icon:"🌟", color:"#f97316" },
];

const EV2_CURRENCY_NAMES = [
  "Kim Tệ","Linh Tệ","Hoàng Đế Tệ","Ngân Tệ","Thiên Tệ","Long Tệ","Bảo Tệ","Hỏa Tệ",
];

const EV2_LOAN_INTEREST = 0.06;     // 6% per tick on outstanding loans
const EV2_DEPOSIT_INTEREST = 0.015; // 1.5% per tick on deposits

const EV2_BLACKMARKET_GOODS = [
  { id:"forbiddenArtifact", name:"Cấm Vật",        icon:"🗝️", value:5000 },
  { id:"stolenSpiritStone", name:"Linh Thạch Lậu", icon:"💎", value:800  },
  { id:"illegalPill",       name:"Cấm Đan",        icon:"💊", value:1200 },
  { id:"poachedMaterial",   name:"Yêu Liệu Lậu",   icon:"🦴", value:600  },
];

// ================================================================
// STATE
// ================================================================

var ev2Banks          = [];   // one bank per country
var ev2Monopolies     = [];   // { resource, guildId, countryId, ticksLeft }
var ev2BlackMarkets    = [];  // one per region/country with smuggling activity
var ev2Investments     = [];  // { npcId, amount, returnRate, ticksLeft }
var ev2TradeWars       = [];  // { fromCountryId, toCountryId, type, ticksLeft }
var ev2MerchantLegends = [];  // { npcId, name, title, year, description }
var ev2ResourceMarket  = {};  // { resourceKey: { price, supply, demand, history:[] } }
var ev2Stats = {
  totalLoans:        0,
  totalDeposits:     0,
  totalBanks:        0,
  activeMonopolies:  0,
  activeBlackMarkets:0,
  activeTradeWars:   0,
  legendCount:       0,
  ticksElapsed:      0,
};

let _ev2PanelTab = "occupations";

// ================================================================
// INIT
// ================================================================

function economyEngineV2_init() {
  _ev2EnsureNPCFields();
  _ev2EnsureCountryFields();
  _ev2EnsureResourceMarket();
  _ev2EnsureBanks();
}

function _ev2EnsureNPCFields() {
  if (typeof npcs === "undefined") return;
  npcs.forEach(n => {
    if (n.occupation     === undefined) n.occupation     = _ev2RandomOccupation();
    if (n.wage           === undefined) n.wage           = 0;
    if (n.bankDeposit    === undefined) n.bankDeposit    = 0;
    if (n.bankLoan       === undefined) n.bankLoan       = 0;
    if (n.wealthClass    === undefined) n.wealthClass    = _ev2WealthClass(n.wealth || 0).label;
    if (n.isLegend       === undefined) n.isLegend       = false;
  });
}

function _ev2RandomOccupation() {
  const occ = EV2_OCCUPATIONS[Math.floor(Math.random() * EV2_OCCUPATIONS.length)];
  return occ.id;
}

function _ev2EnsureCountryFields() {
  if (typeof countries === "undefined") return;
  countries.forEach((c, i) => {
    if (c.currencyName === undefined) c.currencyName = EV2_CURRENCY_NAMES[i % EV2_CURRENCY_NAMES.length];
    if (c.embargoes    === undefined) c.embargoes    = [];   // array of countryIds
  });
}

function _ev2EnsureResourceMarket() {
  Object.keys(EV2_RESOURCES).forEach(k => {
    if (!ev2ResourceMarket[k]) {
      ev2ResourceMarket[k] = {
        price:   EV2_RESOURCES[k].basePrice,
        supply:  1000,
        demand:  1000,
        history: [],
      };
    }
  });
}

function _ev2EnsureBanks() {
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    if (!ev2Banks.find(b => b.countryId === c.id)) {
      ev2Banks.push({
        id:        `bank_${c.id}`,
        countryId: c.id,
        name:      `${c.name} Ngân Hành`,
        deposits:  0,
        loans:     0,
        treasury:  (c.treasury || 5000) * 0.2,
      });
    }
  });
}

// ================================================================
// MAIN TICK
// ================================================================

function economyEngineV2_tick() {
  if (typeof world === "undefined" || !world) return;

  _ev2EnsureNPCFields();
  _ev2EnsureCountryFields();
  _ev2EnsureResourceMarket();
  _ev2EnsureBanks();

  ev2Stats.ticksElapsed++;

  _ev2TickEmployment();
  _ev2TickWealthClasses();
  _ev2TickResourceMarket();
  _ev2TickBanking();
  _ev2TickMonopolies();
  _ev2TickBlackMarkets();
  _ev2TickInvestments();
  _ev2TickTradeWars();
  _ev2TickMerchantLegends();
  _ev2UpdateStats();

  const panel = document.getElementById("panel-economy-engine");
  if (panel && panel.classList.contains("active") && typeof _engPanelTab !== "undefined"
      && ["occupations","banking","market","monopoly","blackmarket","tradewars","legends","rankings"].includes(_engPanelTab)) {
    economyEngineV2_renderPanel();
  }
}

// ── Employment ──

function _ev2TickEmployment() {
  if (typeof npcs === "undefined") return;
  const alive = _ev2AliveNPCs();
  alive.forEach(n => {
    const occ = EV2_OCCUPATIONS.find(o => o.id === n.occupation);
    if (!occ) return;

    // Wage payment
    const reputationBonus = 1 + ((n.reputation || 0) / 200);
    n.wage = Math.floor(occ.wageBase * reputationBonus);
    n.wealth = (n.wealth || 0) + n.wage;

    // Production -> contributes to resource market supply
    if (occ.produces && ev2ResourceMarket[occ.produces]) {
      const output = Math.floor(occ.baseOutput * reputationBonus);
      ev2ResourceMarket[occ.produces].supply += output;
    }

    // Consumption -> food consumed by everyone
    if (ev2ResourceMarket.food) {
      ev2ResourceMarket.food.demand += 1;
    }
  });
}

// ── Wealth Classes ──

function _ev2WealthClass(wealth) {
  return EV2_WEALTH_CLASSES.find(w => wealth >= w.min && wealth < w.max) || EV2_WEALTH_CLASSES[0];
}

function _ev2TickWealthClasses() {
  _ev2AliveNPCs().forEach(n => {
    n.wealthClass = _ev2WealthClass(n.wealth || 0).label;
  });
}

// ── Resource Market (Supply & Demand) ──

function _ev2TickResourceMarket() {
  Object.keys(EV2_RESOURCES).forEach(k => {
    const m = ev2ResourceMarket[k];
    const def = EV2_RESOURCES[k];

    // Decay demand/supply toward equilibrium so values don't explode
    m.supply = Math.max(50, Math.floor(m.supply * 0.97));
    m.demand = Math.max(50, Math.floor(m.demand * 0.97));

    // Price reacts to supply/demand ratio
    const ratio = m.demand / Math.max(1, m.supply);
    const target = def.basePrice * ratio;
    const drift = (target - m.price) * def.volatility;
    m.price = Math.max(1, Math.floor(m.price + drift));

    m.history.push(m.price);
    if (m.history.length > 50) m.history.shift();

    // Base demand regeneration (consumption of goods, infrastructure use)
    m.demand += Math.floor(5 + Math.random() * 10);
  });
}

// ── Banking ──

function _ev2TickBanking() {
  if (typeof countries === "undefined") return;
  const alive = _ev2AliveNPCs();

  ev2Banks.forEach(bank => {
    const country = countries.find(c => c.id === bank.countryId);
    if (!country) return;

    // NPCs with high wealth deposit a portion
    alive.forEach(n => {
      if ((n.wealth || 0) > 2000 && Math.random() < 0.05) {
        const deposit = Math.floor(n.wealth * 0.1);
        n.wealth -= deposit;
        n.bankDeposit += deposit;
        bank.deposits += deposit;
      }
      // Poor NPCs occasionally take loans
      if ((n.wealth || 0) < 300 && n.bankLoan === 0 && Math.random() < 0.02 && bank.deposits > 500) {
        const loan = 200 + Math.floor(Math.random() * 500);
        n.bankLoan += loan;
        n.wealth += loan;
        bank.loans += loan;
        bank.deposits = Math.max(0, bank.deposits - loan);
      }
      // Loan repayment + interest
      if (n.bankLoan > 0) {
        const interest = Math.ceil(n.bankLoan * EV2_LOAN_INTEREST);
        const payment = Math.min(n.wealth, Math.floor(n.bankLoan * 0.1) + interest);
        if (payment > 0) {
          n.wealth -= payment;
          n.bankLoan = Math.max(0, n.bankLoan - payment);
          bank.treasury += payment;
        }
      }
      // Deposit interest payout
      if (n.bankDeposit > 0) {
        const gain = Math.floor(n.bankDeposit * EV2_DEPOSIT_INTEREST);
        n.bankDeposit += gain;
        bank.deposits += gain;
      }
    });

    // Bank funds country treasury slightly from net interest spread
    const spread = Math.floor(bank.loans * EV2_LOAN_INTEREST * 0.3);
    if (spread > 0 && country.treasury !== undefined) {
      country.treasury += spread;
      bank.treasury = Math.max(0, bank.treasury - spread);
    }
  });
}

// ── Monopolies ──

function _ev2TickMonopolies() {
  // Decay existing monopolies
  ev2Monopolies = ev2Monopolies.filter(m => {
    m.ticksLeft--;
    return m.ticksLeft > 0;
  });

  // Chance for a wealthy guild to form a monopoly on a resource
  if (typeof engGuilds !== "undefined" && engGuilds.length) {
    engGuilds.forEach(g => {
      if ((g.wealth || 0) > 50000 && Math.random() < 0.01) {
        const resKeys = Object.keys(EV2_RESOURCES);
        const resource = resKeys[Math.floor(Math.random() * resKeys.length)];
        if (!ev2Monopolies.find(m => m.resource === resource)) {
          ev2Monopolies.push({
            id: `mono_${g.id}_${resource}`,
            resource,
            guildId: g.id,
            guildName: g.name,
            ticksLeft: 20 + Math.floor(Math.random() * 30),
          });
          if (typeof addWorldHistory === "function") {
            addWorldHistory("economy", `${g.name} thiết lập độc quyền ${EV2_RESOURCES[resource].icon} ${EV2_RESOURCES[resource].name}.`, {});
          }
        }
      }
    });
  }

  // Monopolized resources have inflated prices
  ev2Monopolies.forEach(m => {
    const market = ev2ResourceMarket[m.resource];
    if (market) market.price = Math.floor(market.price * 1.02);
  });
}

// ── Black Markets / Smuggling ──

function _ev2TickBlackMarkets() {
  if (typeof countries === "undefined") return;

  // Black markets emerge during high unrest / inflation
  countries.forEach(c => {
    const exists = ev2BlackMarkets.find(b => b.countryId === c.id);
    const highUnrest = (c.unrest || 0) > 40;
    if (!exists && highUnrest && Math.random() < 0.03) {
      ev2BlackMarkets.push({
        id: `bm_${c.id}`,
        countryId: c.id,
        countryName: c.name,
        volume: 0,
        ticksLeft: 30 + Math.floor(Math.random() * 40),
      });
      if (typeof addWorldHistory === "function") {
        addWorldHistory("economy", `Chợ đen hình thành tại ${c.name} do bất ổn xã hội gia tăng.`, { countryName: c.name });
      }
    }
  });

  ev2BlackMarkets = ev2BlackMarkets.filter(b => {
    b.ticksLeft--;
    const country = countries.find(c => c.id === b.countryId);
    if (country) {
      const good = EV2_BLACKMARKET_GOODS[Math.floor(Math.random() * EV2_BLACKMARKET_GOODS.length)];
      const tradeAmount = Math.floor(good.value * (0.5 + Math.random()));
      b.volume += tradeAmount;
      // Smuggling drains country treasury (lost tax revenue)
      if (country.treasury !== undefined) {
        country.treasury = Math.max(0, country.treasury - Math.floor(tradeAmount * 0.05));
      }
    }
    return b.ticksLeft > 0;
  });
}

// ── Investments ──

function _ev2TickInvestments() {
  // Wealthy NPCs invest occasionally
  const alive = _ev2AliveNPCs();
  alive.forEach(n => {
    if ((n.wealth || 0) > 10000 && Math.random() < 0.015) {
      const amount = Math.floor(n.wealth * (0.05 + Math.random() * 0.15));
      n.wealth -= amount;
      ev2Investments.push({
        id: `inv_${n.id}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        npcId: n.id,
        npcName: n.name,
        amount,
        returnRate: -0.3 + Math.random() * 0.8,  // -30% to +50%
        ticksLeft: 5 + Math.floor(Math.random() * 10),
      });
    }
  });

  // Resolve matured investments
  ev2Investments = ev2Investments.filter(inv => {
    inv.ticksLeft--;
    if (inv.ticksLeft <= 0) {
      const npc = alive.find(n => n.id === inv.npcId);
      if (npc) {
        const payout = Math.floor(inv.amount * (1 + inv.returnRate));
        npc.wealth = (npc.wealth || 0) + Math.max(0, payout);
      }
      return false;
    }
    return true;
  });
}

// ── Trade Wars ──

function _ev2TickTradeWars() {
  if (typeof countries === "undefined" || countries.length < 2) return;

  // Random chance to start an embargo between two countries with low relations
  if (Math.random() < 0.004) {
    const a = countries[Math.floor(Math.random() * countries.length)];
    const b = countries[Math.floor(Math.random() * countries.length)];
    if (a.id !== b.id && !ev2TradeWars.find(tw => tw.fromCountryId === a.id && tw.toCountryId === b.id)) {
      const types = ["embargo","sanction","blockade"];
      const type = types[Math.floor(Math.random() * types.length)];
      ev2TradeWars.push({
        id: `tw_${a.id}_${b.id}`,
        fromCountryId: a.id,
        toCountryId: b.id,
        fromName: a.name,
        toName: b.name,
        type,
        ticksLeft: 15 + Math.floor(Math.random() * 20),
      });
      if (!a.embargoes.includes(b.id)) a.embargoes.push(b.id);
      if (typeof addWorldHistory === "function") {
        const typeLabel = type === "embargo" ? "cấm vận" : type === "sanction" ? "trừng phạt kinh tế" : "phong tỏa thương lộ";
        addWorldHistory("economy", `${a.name} tuyên bố ${typeLabel} đối với ${b.name}.`, { countryName: a.name });
      }
    }
  }

  ev2TradeWars = ev2TradeWars.filter(tw => {
    tw.ticksLeft--;
    const target = countries.find(c => c.id === tw.toCountryId);
    const source = countries.find(c => c.id === tw.fromCountryId);
    if (target) {
      // Trade war reduces target's treasury growth
      if (target.annualIncome) target.annualIncome = Math.floor(target.annualIncome * 0.97);
    }
    if (tw.ticksLeft <= 0) {
      if (source && source.embargoes) source.embargoes = source.embargoes.filter(id => id !== tw.toCountryId);
      return false;
    }
    return true;
  });
}

// ── Merchant Legends ──

function _ev2TickMerchantLegends() {
  const alive = _ev2AliveNPCs();
  alive.forEach(n => {
    if (!n.isLegend && (n.wealth || 0) > 1_000_000 && n.isMerchant) {
      n.isLegend = true;
      const titles = [
        "Thương Mại Đại Đế","Vạn Phú Thương Vương","Hoàng Kim Thương Hội Chủ","Truyền Kỳ Thương Nhân",
      ];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const yr = (typeof year !== "undefined") ? year : 0;
      const entry = {
        npcId: n.id,
        name: n.name,
        title,
        year: yr,
        description: `${n.name} đạt được tài phú vượt hơn 1,000,000, trở thành ${title}, danh tiếng vang khắp thiên hạ.`,
      };
      ev2MerchantLegends.push(entry);
      if (typeof addWorldHistory === "function") {
        addWorldHistory("economy", entry.description, { npcId: n.id, npcName: n.name });
      }
    }
  });
  if (ev2MerchantLegends.length > 100) ev2MerchantLegends = ev2MerchantLegends.slice(-100);
}

// ── Stats ──

function _ev2UpdateStats() {
  ev2Stats.totalLoans         = ev2Banks.reduce((s,b) => s + (b.loans || 0), 0);
  ev2Stats.totalDeposits      = ev2Banks.reduce((s,b) => s + (b.deposits || 0), 0);
  ev2Stats.totalBanks         = ev2Banks.length;
  ev2Stats.activeMonopolies   = ev2Monopolies.length;
  ev2Stats.activeBlackMarkets = ev2BlackMarkets.length;
  ev2Stats.activeTradeWars    = ev2TradeWars.length;
  ev2Stats.legendCount        = ev2MerchantLegends.length;
}

// ================================================================
// HELPERS
// ================================================================

function _ev2AliveNPCs() {
  return (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
}

function _ev2Fmt(n) {
  if (typeof _engFmt === "function") return _engFmt(n);
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

function _ev2OccLabel(id) {
  const occ = EV2_OCCUPATIONS.find(o => o.id === id);
  return occ ? `${occ.icon} ${occ.name}` : "—";
}

// ================================================================
// SAVE / LOAD
// ================================================================

function economyEngineV2_save() {
  try {
    localStorage.setItem("cgv6_ev2Banks",          JSON.stringify(ev2Banks));
    localStorage.setItem("cgv6_ev2Monopolies",     JSON.stringify(ev2Monopolies));
    localStorage.setItem("cgv6_ev2BlackMarkets",   JSON.stringify(ev2BlackMarkets));
    localStorage.setItem("cgv6_ev2Investments",    JSON.stringify(ev2Investments));
    localStorage.setItem("cgv6_ev2TradeWars",      JSON.stringify(ev2TradeWars));
    localStorage.setItem("cgv6_ev2MerchantLegends",JSON.stringify(ev2MerchantLegends));
    localStorage.setItem("cgv6_ev2ResourceMarket", JSON.stringify(ev2ResourceMarket));
    localStorage.setItem("cgv6_ev2Stats",          JSON.stringify(ev2Stats));
  } catch(e) { console.warn("economyEngineV2 save failed:", e); }
}

function economyEngineV2_load() {
  try {
    ev2Banks           = JSON.parse(localStorage.getItem("cgv6_ev2Banks"))           || [];
    ev2Monopolies      = JSON.parse(localStorage.getItem("cgv6_ev2Monopolies"))      || [];
    ev2BlackMarkets    = JSON.parse(localStorage.getItem("cgv6_ev2BlackMarkets"))    || [];
    ev2Investments     = JSON.parse(localStorage.getItem("cgv6_ev2Investments"))     || [];
    ev2TradeWars       = JSON.parse(localStorage.getItem("cgv6_ev2TradeWars"))       || [];
    ev2MerchantLegends = JSON.parse(localStorage.getItem("cgv6_ev2MerchantLegends")) || [];
    ev2ResourceMarket  = JSON.parse(localStorage.getItem("cgv6_ev2ResourceMarket"))  || {};
    ev2Stats           = { ...ev2Stats, ...(JSON.parse(localStorage.getItem("cgv6_ev2Stats")) || {}) };
    _ev2EnsureResourceMarket();
  } catch(e) { console.warn("economyEngineV2 load failed:", e); }
}

// ================================================================
// RENDER — Extends the Economy Engine Panel with extra tabs
// ================================================================

// Hook into existing tab bar (additive — appends new tabs)
var _ev2_origRenderEngTabs = (typeof _renderEngTabs === "function") ? _renderEngTabs : null;

_renderEngTabs = function() {
  if (_ev2_origRenderEngTabs) _ev2_origRenderEngTabs();
  const bar = document.getElementById("engTabBar");
  if (!bar) return;
  const v2tabs = [
    { id:"occupations", label:"👷 Nghề Nghiệp" },
    { id:"market",      label:"📊 Thị Trường"  },
    { id:"banking",     label:"🏦 Ngân Hàng"   },
    { id:"monopoly",    label:"🧿 Độc Quyền"   },
    { id:"blackmarket", label:"🕶️ Chợ Đen"     },
    { id:"tradewars",   label:"⚔️ Thương Chiến"},
    { id:"legends",     label:"📜 Huyền Thoại" },
    { id:"rankings",    label:"🏆 Bảng Xếp Hạng"},
  ];
  bar.innerHTML += v2tabs.map(t => `
    <button class="econ-tab-btn ${_engPanelTab === t.id ? "active" : ""}"
            onclick="switchEngTab('${t.id}')">${t.label}</button>
  `).join("");
};

// Hook into existing render dispatcher (additive)
var _ev2_origRenderPanel = (typeof economyEngine_renderPanel === "function") ? economyEngine_renderPanel : null;

economyEngine_renderPanel = function() {
  const v2Tabs = ["occupations","market","banking","monopoly","blackmarket","tradewars","legends","rankings"];
  if (v2Tabs.includes(_engPanelTab)) {
    _ev2EnsureNPCFields(); _ev2EnsureCountryFields(); _ev2EnsureResourceMarket(); _ev2EnsureBanks();
    _renderEngTabs();
    economyEngineV2_renderPanel();
    return;
  }
  if (_ev2_origRenderPanel) _ev2_origRenderPanel();
};

function economyEngineV2_renderPanel() {
  switch (_engPanelTab) {
    case "occupations": _renderEv2Occupations(); break;
    case "market":      _renderEv2Market();      break;
    case "banking":     _renderEv2Banking();      break;
    case "monopoly":    _renderEv2Monopoly();     break;
    case "blackmarket": _renderEv2BlackMarket();  break;
    case "tradewars":   _renderEv2TradeWars();    break;
    case "legends":     _renderEv2Legends();      break;
    case "rankings":    _renderEv2Rankings();     break;
    default: break;
  }
}

// ── Occupations & Wealth Classes ──

function _renderEv2Occupations() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const alive = _ev2AliveNPCs();

  const occCounts = {};
  EV2_OCCUPATIONS.forEach(o => occCounts[o.id] = 0);
  alive.forEach(n => { if (occCounts[n.occupation] !== undefined) occCounts[n.occupation]++; });

  const wcCounts = {};
  EV2_WEALTH_CLASSES.forEach(w => wcCounts[w.label] = 0);
  alive.forEach(n => { const wc = _ev2WealthClass(n.wealth||0).label; wcCounts[wc] = (wcCounts[wc]||0)+1; });

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">👷 Nghề Nghiệp Tu Sĩ (${alive.length} người)</div>
      <div class="econ-stat-grid" style="grid-template-columns:repeat(3,1fr)">
        ${EV2_OCCUPATIONS.map(o => `
          <div class="econ-stat-card">
            <div class="econ-stat-icon">${o.icon}</div>
            <div class="econ-stat-val" style="color:#facc15">${occCounts[o.id]}</div>
            <div class="econ-stat-lbl">${o.name} · Lương cơ bản ${o.wageBase}</div>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">💰 Phân Bố Giai Cấp Tài Phú</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr><th>Hạng</th><th>Giai Cấp</th><th>Số Lượng</th><th>Khoảng Tài Phú</th></tr></thead>
          <tbody>
            ${EV2_WEALTH_CLASSES.map(w => `
              <tr>
                <td>${w.icon}</td>
                <td style="color:${w.color};font-weight:600">${w.label}</td>
                <td style="color:#60a5fa">${wcCounts[w.label]||0}</td>
                <td style="color:var(--white-dim);font-size:11px">${_ev2Fmt(w.min)} – ${w.max===Infinity?"∞":_ev2Fmt(w.max)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Resource Market ──

function _renderEv2Market() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">📊 Thị Trường Tài Nguyên — Cung & Cầu</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>Tài Nguyên</th><th>💰 Giá</th><th>📦 Cung</th><th>📈 Cầu</th><th>Tỷ Lệ Cầu/Cung</th>
          </tr></thead>
          <tbody>
            ${Object.keys(EV2_RESOURCES).map(k => {
              const def = EV2_RESOURCES[k];
              const m = ev2ResourceMarket[k] || { price:def.basePrice, supply:0, demand:0 };
              const ratio = (m.demand / Math.max(1, m.supply)).toFixed(2);
              const ratioColor = ratio > 1.2 ? "#f87171" : ratio < 0.8 ? "#4ade80" : "#facc15";
              const mono = ev2Monopolies.find(mm => mm.resource === k);
              return `<tr>
                <td>${def.icon} ${def.name} ${mono ? `<span style="color:#f97316;font-size:10px">(Độc quyền: ${mono.guildName})</span>` : ""}</td>
                <td style="color:#facc15;font-weight:700">${_ev2Fmt(m.price)}</td>
                <td style="color:#4ade80">${_ev2Fmt(m.supply)}</td>
                <td style="color:#60a5fa">${_ev2Fmt(m.demand)}</td>
                <td style="color:${ratioColor}">${ratio}x</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Banking ──

function _renderEv2Banking() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const sorted = [...ev2Banks].sort((a,b) => (b.deposits+b.treasury) - (a.deposits+a.treasury));
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏦 Hệ Thống Ngân Hàng</div>
      <div class="econ-stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📥</div>
          <div class="econ-stat-val" style="color:#4ade80">${_ev2Fmt(ev2Stats.totalDeposits)}</div>
          <div class="econ-stat-lbl">Tổng Tiền Gửi</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📤</div>
          <div class="econ-stat-val" style="color:#f87171">${_ev2Fmt(ev2Stats.totalLoans)}</div>
          <div class="econ-stat-lbl">Tổng Tiền Vay</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏛️</div>
          <div class="econ-stat-val" style="color:#facc15">${ev2Stats.totalBanks}</div>
          <div class="econ-stat-lbl">Số Ngân Hàng</div>
        </div>
      </div>
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">🏦 Danh Sách Ngân Hàng (theo quốc gia)</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr><th>Ngân Hàng</th><th>💰 Tiền Gửi</th><th>📤 Tiền Vay</th><th>🏦 Quỹ</th></tr></thead>
          <tbody>
            ${sorted.map(b => `
              <tr>
                <td style="font-weight:600">${b.name}</td>
                <td style="color:#4ade80">${_ev2Fmt(b.deposits)}</td>
                <td style="color:#f87171">${_ev2Fmt(b.loans)}</td>
                <td style="color:#facc15">${_ev2Fmt(b.treasury)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Monopoly ──

function _renderEv2Monopoly() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!ev2Monopolies.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có độc quyền nào được thiết lập.</div>`;
    return;
  }
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🧿 Độc Quyền Tài Nguyên (${ev2Monopolies.length})</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr><th>Tài Nguyên</th><th>Thương Hội</th><th>Còn Lại</th></tr></thead>
          <tbody>
            ${ev2Monopolies.map(m => {
              const def = EV2_RESOURCES[m.resource];
              return `<tr>
                <td>${def.icon} ${def.name}</td>
                <td style="color:#f97316;font-weight:600">${m.guildName}</td>
                <td style="color:#94a3b8">${m.ticksLeft} năm</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Black Market ──

function _renderEv2BlackMarket() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!ev2BlackMarkets.length) {
    el.innerHTML = `<div class="econ-empty">Hiện không có chợ đen nào hoạt động.</div>`;
    return;
  }
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🕶️ Chợ Đen & Buôn Lậu (${ev2BlackMarkets.length})</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr><th>Quốc Gia</th><th>Khối Lượng Buôn Lậu</th><th>Còn Lại</th></tr></thead>
          <tbody>
            ${ev2BlackMarkets.map(b => `
              <tr>
                <td style="font-weight:600">${b.countryName}</td>
                <td style="color:#f87171">${_ev2Fmt(b.volume)}</td>
                <td style="color:#94a3b8">${b.ticksLeft} năm</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--white-dim)">
        Hàng hóa chợ đen: ${EV2_BLACKMARKET_GOODS.map(g => `${g.icon} ${g.name}`).join(", ")}
      </div>
    </div>
  `;
}

// ── Trade Wars ──

function _renderEv2TradeWars() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!ev2TradeWars.length) {
    el.innerHTML = `<div class="econ-empty">Không có chiến tranh thương mại nào đang diễn ra.</div>`;
    return;
  }
  const typeLabels = { embargo:"🚫 Cấm Vận", sanction:"⚖️ Trừng Phạt", blockade:"🛑 Phong Tỏa" };
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">⚔️ Chiến Tranh Thương Mại (${ev2TradeWars.length})</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr><th>Bên Phát Động</th><th>Đối Tượng</th><th>Loại</th><th>Còn Lại</th></tr></thead>
          <tbody>
            ${ev2TradeWars.map(tw => `
              <tr>
                <td style="font-weight:600">${tw.fromName}</td>
                <td style="color:#f87171">${tw.toName}</td>
                <td>${typeLabels[tw.type] || tw.type}</td>
                <td style="color:#94a3b8">${tw.ticksLeft} năm</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Merchant Legends ──

function _renderEv2Legends() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!ev2MerchantLegends.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có thương nhân nào trở thành huyền thoại. Tài phú trên 1,000,000 sẽ tạo huyền thoại.</div>`;
    return;
  }
  const sorted = [...ev2MerchantLegends].reverse();
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">📜 Huyền Thoại Thương Nhân (${sorted.length})</div>
      ${sorted.map(l => `
        <div class="econ-country-card" style="margin-bottom:8px;border-top:3px solid #f97316">
          <div style="font-size:14px;font-weight:700;color:#f97316">${l.title} — ${l.name}</div>
          <div style="font-size:11px;color:var(--white-dim);margin:4px 0">Năm ${l.year}</div>
          <div style="font-size:12px;color:#e2e8f0">${l.description}</div>
        </div>
      `).join("")}
    </div>
  `;
}

// ── Rankings ──

function _renderEv2Rankings() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const alive = _ev2AliveNPCs();
  const topNPCs = [...alive].sort((a,b) => (b.wealth||0)-(a.wealth||0)).slice(0,10);
  const topCountries = (typeof countries !== "undefined")
    ? [...countries].sort((a,b) => (b.treasury||0)-(a.treasury||0)).slice(0,10) : [];
  const topGuilds = (typeof engGuilds !== "undefined")
    ? [...engGuilds].sort((a,b) => (b.wealth||0)-(a.wealth||0)).slice(0,10) : [];
  const topMarkets = (typeof engCities !== "undefined")
    ? [...engCities].sort((a,b) => (b.wealth||0)-(a.wealth||0)).slice(0,5) : [];

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏆 Bảng Xếp Hạng Kinh Tế Toàn Diện</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

        <div>
          <div style="font-size:12px;color:#facc15;font-weight:700;margin-bottom:6px">💰 Tu Sĩ Giàu Nhất</div>
          ${topNPCs.map((n,i) => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span>${i+1}. ${n.name} <span style="color:${_ev2WealthClass(n.wealth||0).color};font-size:10px">${_ev2WealthClass(n.wealth||0).icon}</span></span>
              <span style="color:#facc15">${_ev2Fmt(n.wealth||0)}</span>
            </div>
          `).join("")}
        </div>

        <div>
          <div style="font-size:12px;color:#4ade80;font-weight:700;margin-bottom:6px">🏴 Quốc Gia Giàu Nhất</div>
          ${topCountries.map((c,i) => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span>${i+1}. ${c.name} <span style="color:#94a3b8;font-size:10px">(${c.currencyName||"—"})</span></span>
              <span style="color:#4ade80">${_ev2Fmt(c.treasury||0)}</span>
            </div>
          `).join("")}
        </div>

        <div>
          <div style="font-size:12px;color:#fb923c;font-weight:700;margin-bottom:6px">🏛️ Thương Hội Lớn Nhất</div>
          ${topGuilds.length ? topGuilds.map((g,i) => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span>${i+1}. ${g.name}</span>
              <span style="color:#fb923c">${_ev2Fmt(g.wealth||0)}</span>
            </div>
          `).join("") : `<div class="econ-empty" style="padding:8px 0">Chưa có thương hội.</div>`}
        </div>

        <div>
          <div style="font-size:12px;color:#60a5fa;font-weight:700;margin-bottom:6px">🏙️ Thị Trường Lớn Nhất</div>
          ${topMarkets.length ? topMarkets.map((m,i) => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <span>${i+1}. ${m.name}</span>
              <span style="color:#60a5fa">${_ev2Fmt(m.wealth||0)}</span>
            </div>
          `).join("") : `<div class="econ-empty" style="padding:8px 0">Chưa có thị trường.</div>`}
        </div>

      </div>
    </div>

    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Chỉ Số Kinh Tế Mở Rộng</div>
      <div class="econ-stat-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏦</div>
          <div class="econ-stat-val" style="color:#4ade80">${ev2Stats.totalBanks}</div>
          <div class="econ-stat-lbl">Ngân Hàng</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🧿</div>
          <div class="econ-stat-val" style="color:#f97316">${ev2Stats.activeMonopolies}</div>
          <div class="econ-stat-lbl">Độc Quyền</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🕶️</div>
          <div class="econ-stat-val" style="color:#f87171">${ev2Stats.activeBlackMarkets}</div>
          <div class="econ-stat-lbl">Chợ Đen</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📜</div>
          <div class="econ-stat-val" style="color:#facc15">${ev2Stats.legendCount}</div>
          <div class="econ-stat-lbl">Huyền Thoại</div>
        </div>
      </div>
    </div>
  `;
}

// ================================================================
// HOOK INTO MAIN ECONOMY ENGINE TICK / INIT / SAVE / LOAD
// ================================================================
// NOTE: Using function EXPRESSIONS (not declarations) for the
// wrappers below. Function declarations are hoisted, which would
// make "economyEngine_init" already refer to OUR new version at
// the time _ev2_origInit is captured -> infinite recursion.
// Assigning via "var x = function(){...}" avoids this because the
// right-hand side is evaluated only when this line actually runs,
// by which point the V1 declaration (also hoisted, but defined
// earlier in economyEngine.js, executed first) is still the
// current value of the global binding.

var _ev2_origInit = (typeof economyEngine_init === "function") ? economyEngine_init : null;
economyEngine_init = function() {
  if (_ev2_origInit) _ev2_origInit();
  economyEngineV2_init();
};

var _ev2_origTick = (typeof economyEngine_tick === "function") ? economyEngine_tick : null;
economyEngine_tick = function() {
  if (_ev2_origTick) _ev2_origTick();
  economyEngineV2_tick();
};

var _ev2_origSave = (typeof economyEngine_save === "function") ? economyEngine_save : null;
economyEngine_save = function() {
  if (_ev2_origSave) _ev2_origSave();
  economyEngineV2_save();
};

var _ev2_origLoad = (typeof economyEngine_load === "function") ? economyEngine_load : null;
economyEngine_load = function() {
  if (_ev2_origLoad) _ev2_origLoad();
  economyEngineV2_load();
};
