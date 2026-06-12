/* ================================================================
   ECONOMY ENGINE V1 — economyEngine.js
   Creator God V6  ·  Phase NEXT
   ----------------------------------------------------------------
   NEW FILE — replaces / supersedes economySystem.js
   ----------------------------------------------------------------
   FEATURES:
     • World Resources per region (Spirit Stones, Iron, Jade, Herbs,
       Rare Minerals, Ancient Artifacts)
     • City Economy  { population, production, wealth, tradePower }
     • Country Treasury { treasury, taxRate, annualIncome, expenses }
     • Sect Economy  { treasury, disciples, donations, resourceFields }
     • Merchant NPCs — travel, trade, get rich, create trade routes
     • Trade Routes  — city↔city, sect↔country, etc.
     • Merchant Guilds — rich merchants form guilds
     • Tax System    — high taxes = more income + more unrest
     • Inflation     — prevents infinite wealth, currency balancing
     • Economic Crises — recession, famine, market crash, trade collapse
     • Prosperity Score per country
     • War Economy   — wars cost resources; bankruptcy possible
     • World History — records founding of guilds, crises, etc.
     • Sidebar stats — richest country/sect/NPC/guild
     • Statistics    — world wealth, inflation, prosperity, trade vol.
   ----------------------------------------------------------------
   SAVE COMPATIBILITY: fully additive; never deletes existing fields.
   Does NOT reset saves, worlds, NPCs, sects, countries, dynasties, wars.
   ================================================================ */

"use strict";

// ================================================================
// CONSTANTS
// ================================================================

const ENG_RESOURCES = {
  spiritStones:  { name:"Linh Thạch",      icon:"💎", color:"#facc15", baseValue:100  },
  iron:          { name:"Sắt",             icon:"⚙️",  color:"#94a3b8", baseValue:30   },
  jade:          { name:"Ngọc Bội",        icon:"🟢", color:"#4ade80", baseValue:200  },
  herbs:         { name:"Thảo Dược",       icon:"🌿", color:"#86efac", baseValue:80   },
  rareMinerals:  { name:"Khoáng Quý",      icon:"🔮", color:"#c084fc", baseValue:500  },
  ancientArtifacts:{ name:"Cổ Vật",       icon:"🏺", color:"#f97316", baseValue:5000 },
};

// Which resources each region is rich in (multiplier)
const ENG_REGION_RESOURCES = {
  "🗻 Đông Vực":   { spiritStones:1.5, iron:0.8,  jade:1.2, herbs:1.0, rareMinerals:0.6, ancientArtifacts:0.4 },
  "🌋 Tây Hoang":  { spiritStones:0.6, iron:2.0,  jade:0.4, herbs:0.7, rareMinerals:1.8, ancientArtifacts:0.8 },
  "🌊 Nam Hải":    { spiritStones:1.0, iron:0.6,  jade:1.8, herbs:2.0, rareMinerals:0.5, ancientArtifacts:0.6 },
  "❄️ Bắc Nguyên": { spiritStones:0.9, iron:1.2,  jade:0.5, herbs:0.4, rareMinerals:1.5, ancientArtifacts:2.0 },
};

const ENG_CITY_NAMES = [
  "Thiên Phong Thành","Vạn Linh Trấn","Kim Lăng Phố","Huyết Nguyệt Cảng",
  "Lưu Ly Đài","Ngọc Tuyền Thị","Hắc Thiết Quan","Băng Tâm Đô",
  "Hỏa Vân Trấn","Thần Phong Cảng","Linh Khí Thị","Cửu Long Thành",
];

const ENG_GUILD_NAMES = [
  "Vạn Bảo Thương Hội","Thiên Hạ Tài Nguyên Hội","Kim Ngân Thương Đoàn",
  "Linh Thạch Thương Liên","Huyền Thiết Thương Hội","Bách Bảo Thương Khố",
  "Ngọc Đường Thương Hội","Thần Phong Thương Đoàn",
];

const ENG_CRISIS_TYPES = [
  { id:"recession",     name:"Kinh Tế Suy Thoái",    icon:"📉", wealthMult:0.75, durationMax:8,  tradeMult:0.70, chance:0.012 },
  { id:"famine",        name:"Đại Nạn Đói Kém",       icon:"🌾", wealthMult:0.85, durationMax:6,  tradeMult:0.80, chance:0.010 },
  { id:"marketCrash",   name:"Thị Trường Sụp Đổ",     icon:"💥", wealthMult:0.60, durationMax:4,  tradeMult:0.50, chance:0.008 },
  { id:"tradeCollapse", name:"Thương Mại Tê Liệt",     icon:"🚫", wealthMult:0.90, durationMax:10, tradeMult:0.20, chance:0.009 },
  { id:"inflation",     name:"Siêu Lạm Phát",          icon:"💸", wealthMult:0.80, durationMax:7,  tradeMult:0.90, chance:0.011 },
  { id:"war_economy",   name:"Chiến Tranh Kinh Tế",    icon:"⚔️", wealthMult:0.70, durationMax:12, tradeMult:0.60, chance:0.007 },
];

const ENG_PROSPERITY_BONUS = [
  { min:0,   max:20,  label:"Bần Cùng",    icon:"💀", popMult:0.95, tradeMult:0.70, wealthMult:0.90 },
  { min:20,  max:40,  label:"Nghèo Khổ",   icon:"😔", popMult:0.98, tradeMult:0.85, wealthMult:0.95 },
  { min:40,  max:60,  label:"Bình Thường", icon:"😐", popMult:1.00, tradeMult:1.00, wealthMult:1.00 },
  { min:60,  max:80,  label:"Phồn Thịnh",  icon:"😊", popMult:1.02, tradeMult:1.15, wealthMult:1.10 },
  { min:80,  max:101, label:"Thịnh Vượng", icon:"🌟", popMult:1.05, tradeMult:1.30, wealthMult:1.20 },
];

// ================================================================
// STATE  (always initialized safely)
// ================================================================

var engCities       = [];   // Array of city objects
var engTradeRoutes  = [];   // Active trade routes
var engGuilds       = [];   // Merchant guilds
var engCrises       = [];   // Active economic crises { type, countryId, ticksLeft }
var engStats = {
  totalWorldWealth: 0,
  inflation:        1.0,    // multiplier; >1 = inflation
  globalProsperity: 50,
  tradeVolume:      0,
  totalCrises:      0,
  ticksElapsed:     0,
};
var engHistory      = [];   // Snapshot per tick (last 100)

// Internal cache
let _engMerchants   = [];   // NPCs with isMerchant === true
let _engPanelTab    = "overview";

// ================================================================
// INIT / MIGRATION  (called once after world loads)
// ================================================================

function economyEngine_init() {
  _ensureCountryEconomy();
  _ensureSectEconomy();
  _ensureNPCEconomy();
  _ensureCities();
  _ensureRegionResources();
  // Restore panel button visibility
  const btn = document.getElementById("btn-economy-engine");
  if (btn) {
    btn.style.display = "";
    btn.classList.remove("ec-hidden");
  }
}

// ─── Countries ───

function _ensureCountryEconomy() {
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    if (c.treasury      === undefined) c.treasury      = (c.wealth || 5000) * 10;
    if (c.taxRate       === undefined) c.taxRate        = 15;   // %
    if (c.annualIncome  === undefined) c.annualIncome   = 0;
    if (c.annualExpenses=== undefined) c.annualExpenses = 0;
    if (c.unrest        === undefined) c.unrest         = 0;
    if (c.prosperity    === undefined) c.prosperity     = 50;
    if (c.bankrupt      === undefined) c.bankrupt       = false;
    if (!c.resource) {
      c.resource = {
        gold: c.wealth || 5000, grain: 2000, iron: 1000, spirit: 500,
        goldRate:0, grainRate:0, ironRate:0, spiritRate:0,
      };
    }
  });
}

// ─── Sects ───

function _ensureSectEconomy() {
  if (typeof sects === "undefined") return;
  sects.forEach(s => {
    if (!s.resources)       s.resources     = { lingshi:200, lingyao:80, xuantie:50, jingshi:20 };
    if (s.treasury          === undefined)  s.treasury     = s.resources.lingshi || 200;
    if (s.donations         === undefined)  s.donations    = 0;
    if (!s.resourceFields)  s.resourceFields = Math.floor((s.level || 1) * 2);
    // Alias
    if (!Object.getOwnPropertyDescriptor(s, "resource") || !Object.getOwnPropertyDescriptor(s, "resource").get) {
      Object.defineProperty(s, "resource", {
        get()  { return this.resources; },
        set(v) { this.resources = v; },
        configurable: true, enumerable: false,
      });
    }
  });
}

// ─── NPCs ───

function _ensureNPCEconomy() {
  if (typeof npcs === "undefined") return;
  npcs.forEach(n => {
    if (n.wealth      === undefined) n.wealth      = 100;
    if (n.spiritStone === undefined) n.spiritStone = 0;
    if (n.reputation  === undefined) n.reputation  = 0;
    if (n.isMerchant  === undefined) n.isMerchant  = false;
    if (n.merchantTier=== undefined) n.merchantTier= 0;  // 0=none,1=peddler,2=trader,3=magnate
    if (n.tradeRoutes === undefined) n.tradeRoutes = [];
    if (n.guildId     === undefined) n.guildId     = null;
  });
}

// ─── Cities ───

function _ensureCities() {
  if (engCities.length > 0) return; // already built
  if (typeof countries === "undefined") return;
  countries.forEach((c, ci) => {
    const numCities = 2 + Math.floor((c.population || 100000) / 200000);
    for (let i = 0; i < numCities; i++) {
      engCities.push({
        id:         `city_${c.id}_${i}`,
        name:       ENG_CITY_NAMES[(ci * 3 + i) % ENG_CITY_NAMES.length],
        countryId:  c.id,
        region:     c.territory || "🗻 Đông Vực",
        population: Math.floor((c.population || 100000) / numCities),
        production: 100 + Math.floor(Math.random() * 200),
        wealth:     1000 + Math.floor(Math.random() * 5000),
        tradePower: 10 + Math.floor(Math.random() * 40),
        prosperity: 50,
      });
    }
  });
}

// ─── Region World Resources ───

function _ensureRegionResources() {
  if (typeof regions === "undefined") return;
  regions.forEach(r => {
    if (!r.worldResources) {
      const mults = ENG_REGION_RESOURCES[r.name] || { spiritStones:1,iron:1,jade:1,herbs:1,rareMinerals:1,ancientArtifacts:1 };
      r.worldResources = {};
      Object.keys(ENG_RESOURCES).forEach(k => {
        const base = 200 + Math.floor(Math.random() * 300);
        r.worldResources[k] = Math.floor(base * (mults[k] || 1));
      });
    }
  });
}

// ================================================================
// MAIN TICK
// ================================================================

function economyEngine_tick() {
  if (typeof world === "undefined" || !world) return;

  _ensureCountryEconomy();
  _ensureSectEconomy();
  _ensureNPCEconomy();
  if (!engCities.length) _ensureCities();

  engStats.ticksElapsed++;

  _tickInflation();
  _tickRegionResources();
  _tickCityEconomy();
  _tickCountryTreasury();
  _tickSectEconomy();
  _tickMerchants();
  _tickTradeRoutes();
  _tickGuilds();
  _tickCrises();
  _tickProsperity();
  _tickWarEconomy();
  _updateEngStats();
  _recordSnapshot();

  // Refresh panel if open
  const panel = document.getElementById("panel-economy-engine");
  if (panel && panel.classList.contains("active")) economyEngine_renderPanel();
}

// ─── Inflation ───

function _tickInflation() {
  const alive = _aliveNPCs();
  const totalWealth = alive.reduce((s, n) => s + (n.wealth || 0), 0);
  // Target: ~1000 per NPC on average. If above target, inflate.
  const target = alive.length * 1500;
  if (totalWealth > target * 1.5) {
    engStats.inflation = Math.min(3.0, engStats.inflation + 0.02);
    // Apply wealth sink: drain 0.3% of excess from everyone
    alive.forEach(n => {
      n.wealth = Math.floor(n.wealth * 0.997);
    });
  } else if (engStats.inflation > 1.0) {
    engStats.inflation = Math.max(1.0, engStats.inflation - 0.005);
  }
  // Currency balancing: countries lose gold proportional to inflation above 1
  if (engStats.inflation > 1.1 && typeof countries !== "undefined") {
    countries.forEach(c => {
      if (c.resource?.gold) c.resource.gold = Math.floor(c.resource.gold * 0.995);
    });
  }
}

// ─── Region Resources ───

function _tickRegionResources() {
  if (typeof regions === "undefined") return;
  regions.forEach(r => {
    if (!r.worldResources) return;
    const mults = ENG_REGION_RESOURCES[r.name] || {};
    Object.keys(ENG_RESOURCES).forEach(k => {
      // Natural regeneration
      const cap = 2000 * (mults[k] || 1);
      r.worldResources[k] = Math.min(cap, (r.worldResources[k] || 0) + Math.floor(cap * 0.03));
    });
  });
}

// ─── City Economy ───

function _tickCityEconomy() {
  const inf = engStats.inflation;
  engCities.forEach(city => {
    const country = (typeof countries !== "undefined") ? countries.find(c => c.id === city.countryId) : null;
    const prosperityBonus = _prosperityRecord(city.prosperity);

    // Production generates wealth
    const produced = Math.floor(city.production * prosperityBonus.wealthMult * (1 / inf));
    city.wealth += produced;

    // Trade power drives trade; nearby cities generate volume
    const tradeGain = Math.floor(city.tradePower * 2 * prosperityBonus.tradeMult);
    city.wealth += tradeGain;
    engStats.tradeVolume += tradeGain;

    // Population growth from prosperity
    city.population = Math.floor(city.population * prosperityBonus.popMult);

    // Prosperity drift
    const targetProsperity = country ? _calcCountryProsperity(country) : 50;
    city.prosperity += (targetProsperity - city.prosperity) * 0.05;
    city.prosperity = Math.max(0, Math.min(100, city.prosperity));

    // Wealth sink — old wealth decays slowly
    city.wealth = Math.floor(city.wealth * 0.98);
  });
}

// ─── Country Treasury ───

function _tickCountryTreasury() {
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    const taxRate = c.taxRate || 15;
    const pop = c.population || 100000;
    const tech = c.technology || 1;

    // Base income from cities in this country
    const myCities = engCities.filter(ct => ct.countryId === c.id);
    const cityWealth = myCities.reduce((s, ct) => s + ct.wealth, 0);

    // Tax income
    const taxIncome = Math.floor(cityWealth * (taxRate / 100));
    // Trade income
    const tradeIncome = Math.floor(myCities.reduce((s, ct) => s + ct.tradePower, 0) * 10);
    // NPC income (existing wealth tax in NPC tier)
    const npcIncome = _aliveNPCs().filter(n => n.country === c.name)
      .reduce((s, n) => s + Math.floor((n.wealth || 0) * 0.005), 0);

    c.annualIncome = taxIncome + tradeIncome + npcIncome;

    // Expenses: military upkeep + admin
    const militaryUpkeep = Math.floor((c.military || 0) * 0.02);
    const adminCost = Math.floor(pop * 0.001);
    c.annualExpenses = militaryUpkeep + adminCost;

    c.treasury = (c.treasury || 0) + c.annualIncome - c.annualExpenses;

    // Unrest from high taxes
    if (taxRate > 25) {
      c.unrest = Math.min(100, (c.unrest || 0) + Math.floor((taxRate - 25) * 0.5));
    } else {
      c.unrest = Math.max(0, (c.unrest || 0) - 1);
    }

    // Bankruptcy check
    if (c.treasury < 0) {
      c.bankrupt = true;
      c.treasury = 0;
      if (typeof addLog === "function")
        addLog(`💸 ${c.name} lâm vào phá sản! Kho bạc cạn kiệt.`, "death");
      if (typeof addTimeline === "function")
        addTimeline(`💸 ${c.name} phá sản`, "death", "💸");
      if (typeof addWorldHistory === "function")
        addWorldHistory("economy", `${c.name} tuyên bố phá sản — kho bạc quốc gia cạn kiệt.`, { countryName: c.name });
    } else {
      c.bankrupt = false;
    }

    // Sync legacy fields
    c.wealth  = Math.floor(c.treasury / 10);
    c.economy = c.wealth;
    if (c.resource) c.resource.gold = c.treasury;
  });
}

// ─── Sect Economy ───

function _tickSectEconomy() {
  if (typeof sects === "undefined") return;
  sects.forEach(s => {
    const lvl = s.level || 1;
    const alive = _aliveNPCs().filter(n => (s.members || []).includes(n.id));
    const memberCount = alive.length;
    const fields = s.resourceFields || lvl * 2;

    // Resource generation
    const inc = {
      lingshi: Math.floor((10 + memberCount * 3 + fields * 5) * lvl),
      lingyao: Math.floor((3  + memberCount * 1 + fields * 2) * lvl),
      xuantie: Math.floor((2  + memberCount * 0.5 + fields * 1) * lvl),
      jingshi: Math.floor((1  + lvl * 0.5) * lvl),
    };
    if (!s.resources) s.resources = { lingshi:0, lingyao:0, xuantie:0, jingshi:0 };
    Object.keys(inc).forEach(k => { s.resources[k] = (s.resources[k] || 0) + inc[k]; });

    // Disciple donations (5% chance each member donates)
    let totalDonations = 0;
    alive.forEach(n => {
      if (Math.random() < 0.05) {
        const donation = Math.floor((n.wealth || 0) * 0.02);
        if (donation > 0) {
          n.wealth -= donation;
          s.resources.lingshi += donation;
          totalDonations += donation;
        }
      }
    });
    s.donations = (s.donations || 0) + totalDonations;

    // Treasury = lingshi total
    s.treasury = s.resources.lingshi;
    // Wealth sink on sects
    s.resources.lingshi = Math.floor(s.resources.lingshi * 0.995);
  });
}

// ─── Merchant NPCs ───

function _tickMerchants() {
  const alive = _aliveNPCs();
  // Promote wealthy NPCs to merchants
  alive.forEach(n => {
    if (!n.isMerchant && (n.wealth || 0) > 5000 && Math.random() < 0.005) {
      n.isMerchant = true;
      n.merchantTier = 1; // peddler
      if (typeof addLog === "function")
        addLog(`🛒 ${n.name} trở thành thương nhân!`, "normal");
    }
  });

  _engMerchants = alive.filter(n => n.isMerchant);

  _engMerchants.forEach(m => {
    const wealthBonus = 1 + (m.merchantTier || 1) * 0.3;
    // Trade profit
    const profit = Math.floor((50 + Math.random() * 200) * wealthBonus / engStats.inflation);
    m.wealth += profit;
    engStats.tradeVolume += profit;

    // Tier upgrades
    if ((m.wealth || 0) > 50000  && m.merchantTier < 2) { m.merchantTier = 2; }
    if ((m.wealth || 0) > 200000 && m.merchantTier < 3) {
      m.merchantTier = 3;
      if (typeof addLog === "function")
        addLog(`💰 ${m.name} trở thành đại thương nhân vĩ đại!`, "important");
      if (typeof addTimeline === "function")
        addTimeline(`💰 ${m.name} trở thành đại thương nhân`, "important", "💰");
    }

    // Occasionally create a trade route
    if (Math.random() < 0.02 && engCities.length >= 2) {
      _createTradeRoute(m);
    }

    // Try to found a guild
    if (!m.guildId && m.merchantTier >= 3 && Math.random() < 0.01) {
      _foundGuild(m);
    }
  });
}

// ─── Trade Routes ───

function _createTradeRoute(merchant) {
  if (engCities.length < 2) return;
  const cityA = engCities[Math.floor(Math.random() * engCities.length)];
  const cityB = engCities[Math.floor(Math.random() * engCities.length)];
  if (cityA.id === cityB.id) return;

  // Don't duplicate
  const exists = engTradeRoutes.find(r => r.cityA === cityA.id && r.cityB === cityB.id);
  if (exists) return;

  engTradeRoutes.push({
    id:         `route_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    cityA:      cityA.id,
    cityB:      cityB.id,
    merchantId: merchant.id,
    volume:     Math.floor(100 + Math.random() * 400),
    active:     true,
    yearCreated: typeof year !== "undefined" ? year : 0,
  });

  if (engTradeRoutes.length <= 30 && typeof addLog === "function") {
    addLog(`🛤️ Tuyến thương lộ mới: ${cityA.name} ↔ ${cityB.name} (${merchant.name})`, "normal");
  }
}

function _tickTradeRoutes() {
  let totalVolume = 0;
  engTradeRoutes = engTradeRoutes.filter(r => r.active);

  engTradeRoutes.forEach(r => {
    const cityA = engCities.find(c => c.id === r.cityA);
    const cityB = engCities.find(c => c.id === r.cityB);
    if (!cityA || !cityB) { r.active = false; return; }

    const crisisMult = _getActiveCrisisMult();
    const vol = Math.floor(r.volume * crisisMult);
    totalVolume += vol;

    // Both cities benefit from trade
    cityA.wealth      += Math.floor(vol * 0.3);
    cityB.wealth      += Math.floor(vol * 0.3);
    cityA.tradePower   = Math.min(100, cityA.tradePower + 0.1);
    cityB.tradePower   = Math.min(100, cityB.tradePower + 0.1);
    cityA.prosperity   = Math.min(100, cityA.prosperity + 0.2);
    cityB.prosperity   = Math.min(100, cityB.prosperity + 0.2);

    // Merchant who owns the route gets a cut
    const merchant = _aliveNPCs().find(n => n.id === r.merchantId);
    if (merchant) merchant.wealth += Math.floor(vol * 0.1);

    // Occasionally collapse
    if (Math.random() < 0.002) { r.active = false; }
  });

  engStats.tradeVolume = totalVolume;
}

// ─── Merchant Guilds ───

function _foundGuild(merchant) {
  if (engGuilds.length >= 8) return; // world cap
  const guildName = ENG_GUILD_NAMES[engGuilds.length % ENG_GUILD_NAMES.length];
  const guild = {
    id:         `guild_${Date.now()}`,
    name:       guildName,
    founderId:  merchant.id,
    founderName:merchant.name,
    wealth:     Math.floor((merchant.wealth || 0) * 0.1),
    members:    [merchant.id],
    tradeRoutes:[],
    yearFounded: typeof year !== "undefined" ? year : 0,
    prestige:   100,
  };
  engGuilds.push(guild);
  merchant.guildId = guild.id;
  merchant.wealth  -= guild.wealth;

  if (typeof addLog === "function")
    addLog(`🏛️ Thương hội [${guildName}] được thành lập bởi ${merchant.name}!`, "important");
  if (typeof addTimeline === "function")
    addTimeline(`🏛️ ${guildName} thành lập`, "important", "🏛️");
  if (typeof addWorldHistory === "function") {
    addWorldHistory("economy",
      `Năm ${typeof year !== "undefined" ? year : "??"} — ${guildName} được thành lập bởi đại thương nhân ${merchant.name}.`,
      { guildName, founderName: merchant.name });
  }
}

function _tickGuilds() {
  engGuilds.forEach(g => {
    // Guild wealth grows from member activity
    const memberNPCs = _aliveNPCs().filter(n => g.members.includes(n.id));
    const income = memberNPCs.reduce((s, n) => s + Math.floor((n.wealth || 0) * 0.001), 0);
    g.wealth += income;
    g.wealth  = Math.floor(g.wealth * 0.998); // slight decay

    // Attract new rich merchants
    const nonMembers = _aliveNPCs().filter(n => n.isMerchant && !n.guildId && (n.wealth||0) > 20000);
    nonMembers.forEach(n => {
      if (Math.random() < 0.01) {
        g.members.push(n.id);
        n.guildId = g.id;
      }
    });

    g.prestige = Math.min(1000, g.prestige + memberNPCs.length * 0.1);
  });
}

// ─── Crises ───

function _tickCrises() {
  // Tick down active crises
  engCrises = engCrises.filter(cr => {
    cr.ticksLeft--;
    if (cr.ticksLeft <= 0) {
      const country = (typeof countries !== "undefined") ? countries.find(c => c.id === cr.countryId) : null;
      if (country && typeof addLog === "function")
        addLog(`✅ ${country.name} thoát khỏi khủng hoảng ${cr.icon} ${cr.name}.`, "important");
      return false;
    }
    return true;
  });

  // Roll for new crises
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    if (engCrises.find(cr => cr.countryId === c.id)) return; // already in crisis
    ENG_CRISIS_TYPES.forEach(type => {
      let chance = type.chance;
      // Higher unrest = more likely
      if ((c.unrest || 0) > 50) chance *= 2;
      // War increases crisis chance
      if ((typeof wars !== "undefined") && wars.some(w => w.attackerId === c.id || w.defenderId === c.id)) chance *= 1.5;

      if (Math.random() < chance) {
        engCrises.push({
          ...type,
          countryId: c.id,
          ticksLeft: Math.floor(Math.random() * type.durationMax) + 2,
        });
        engStats.totalCrises++;

        if (typeof addLog === "function")
          addLog(`${type.icon} ${c.name} rơi vào ${type.name}!`, "death");
        if (typeof addTimeline === "function")
          addTimeline(`${type.icon} ${c.name}: ${type.name}`, "death", type.icon);
        if (typeof addWorldHistory === "function")
          addWorldHistory("economy",
            `Năm ${typeof year !== "undefined" ? year : "??"} — ${c.name} rơi vào khủng hoảng kinh tế: ${type.name}.`,
            { countryName: c.name, crisisType: type.id });

        // Immediate impact
        c.treasury = Math.floor((c.treasury || 0) * type.wealthMult);
        if (c.resource) c.resource.gold = c.treasury;
        c.unrest = Math.min(100, (c.unrest || 0) + 15);
        // Also hit cities
        engCities.filter(ct => ct.countryId === c.id).forEach(ct => {
          ct.wealth     = Math.floor(ct.wealth     * type.wealthMult);
          ct.prosperity = Math.max(0, ct.prosperity - 15);
        });
      }
    });
  });
}

function _getActiveCrisisMult() {
  if (!engCrises.length) return 1.0;
  return engCrises.reduce((m, cr) => m * cr.tradeMult, 1.0);
}

// ─── Prosperity ───

function _calcCountryProsperity(c) {
  let score = 50;
  score += Math.min(20, (c.treasury || 0) / 100000 * 20);
  score += Math.min(15, (c.technology || 0) * 2);
  score += Math.min(10, (c.culture    || 0) * 1.5);
  score -= Math.min(30, (c.unrest     || 0) * 0.3);
  if (engCrises.find(cr => cr.countryId === c.id)) score -= 20;
  if (c.bankrupt) score -= 30;
  return Math.max(0, Math.min(100, score));
}

function _tickProsperity() {
  if (typeof countries === "undefined") return;
  let total = 0;
  countries.forEach(c => {
    const target = _calcCountryProsperity(c);
    c.prosperity = (c.prosperity || 50) + (target - c.prosperity) * 0.1;
    c.prosperity = Math.max(0, Math.min(100, c.prosperity));
    total += c.prosperity;
  });
  engStats.globalProsperity = countries.length ? total / countries.length : 50;
}

function _prosperityRecord(score) {
  return ENG_PROSPERITY_BONUS.find(b => score >= b.min && score < b.max) || ENG_PROSPERITY_BONUS[2];
}

// ─── War Economy ───

function _tickWarEconomy() {
  if (typeof wars === "undefined" || !wars) return;
  wars.forEach(w => {
    if (!w.active) return;
    const attacker = (typeof countries !== "undefined") ? countries.find(c => c.id === w.attackerId) : null;
    const defender = (typeof countries !== "undefined") ? countries.find(c => c.id === w.defenderId) : null;
    const warCost = Math.floor(500 + Math.random() * 1000);

    if (attacker) {
      attacker.treasury = Math.max(0, (attacker.treasury || 0) - warCost);
      if (attacker.resource) attacker.resource.gold = attacker.treasury;
      if (attacker.treasury <= 0 && !attacker.bankrupt) {
        attacker.bankrupt = true;
        if (typeof addLog === "function")
          addLog(`💸 ${attacker.name} phá sản vì chiến tranh!`, "death");
        if (typeof addWorldHistory === "function")
          addWorldHistory("economy", `${attacker.name} phá sản do chi phí chiến tranh.`, { countryName: attacker.name });
      }
    }
    if (defender) {
      defender.treasury = Math.max(0, (defender.treasury || 0) - Math.floor(warCost * 0.7));
      if (defender.resource) defender.resource.gold = defender.treasury;
    }
  });
}

// ─── Stats ───

function _updateEngStats() {
  const alive = _aliveNPCs();
  engStats.totalWorldWealth =
    alive.reduce((s, n) => s + (n.wealth || 0), 0) +
    (typeof sects !== "undefined" ? sects.reduce((s, sect) => s + (sect.treasury || 0), 0) : 0) +
    (typeof countries !== "undefined" ? countries.reduce((s, c) => s + (c.treasury || 0), 0) : 0);
}

function _recordSnapshot() {
  if (typeof year === "undefined") return;
  engHistory.push({
    year:          year,
    totalWealth:   engStats.totalWorldWealth,
    inflation:     engStats.inflation,
    prosperity:    engStats.globalProsperity,
    tradeVolume:   engStats.tradeVolume,
    crises:        engCrises.length,
    merchants:     _engMerchants.length,
    guilds:        engGuilds.length,
    routes:        engTradeRoutes.filter(r => r.active).length,
  });
  if (engHistory.length > 100) engHistory.shift();
}

// ================================================================
// SAVE / LOAD
// ================================================================

function economyEngine_save() {
  try {
    localStorage.setItem("cgv6_engCities",      JSON.stringify(engCities));
    localStorage.setItem("cgv6_engTradeRoutes", JSON.stringify(engTradeRoutes));
    localStorage.setItem("cgv6_engGuilds",      JSON.stringify(engGuilds));
    localStorage.setItem("cgv6_engCrises",      JSON.stringify(engCrises));
    localStorage.setItem("cgv6_engStats",       JSON.stringify(engStats));
    localStorage.setItem("cgv6_engHistory",     JSON.stringify(engHistory.slice(0, 100)));
  } catch(e) { console.warn("economyEngine save failed:", e); }
}

function economyEngine_load() {
  try {
    engCities      = JSON.parse(localStorage.getItem("cgv6_engCities"))      || [];
    engTradeRoutes = JSON.parse(localStorage.getItem("cgv6_engTradeRoutes")) || [];
    engGuilds      = JSON.parse(localStorage.getItem("cgv6_engGuilds"))      || [];
    engCrises      = JSON.parse(localStorage.getItem("cgv6_engCrises"))      || [];
    engStats       = { ...engStats, ...(JSON.parse(localStorage.getItem("cgv6_engStats")) || {}) };
    engHistory     = JSON.parse(localStorage.getItem("cgv6_engHistory"))     || [];
  } catch(e) { console.warn("economyEngine load failed:", e); }
}

// ================================================================
// HELPERS
// ================================================================

function _aliveNPCs() {
  return (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
}

function _richestCountry() {
  if (typeof countries === "undefined" || !countries.length) return null;
  return [...countries].sort((a, b) => (b.treasury || 0) - (a.treasury || 0))[0];
}

function _richestSect() {
  if (typeof sects === "undefined" || !sects.length) return null;
  return [...sects].sort((a, b) => (b.treasury || 0) - (a.treasury || 0))[0];
}

function _richestNPC() {
  const alive = _aliveNPCs();
  if (!alive.length) return null;
  return [...alive].sort((a, b) => (b.wealth || 0) - (a.wealth || 0))[0];
}

function _largestGuild() {
  if (!engGuilds.length) return null;
  return [...engGuilds].sort((a, b) => b.members.length - a.members.length)[0];
}

function _engFmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

// ================================================================
// RENDER — Economy Engine Panel
// ================================================================

function economyEngine_renderPanel() {
  _ensureCountryEconomy();
  _renderEngTabs();
  switch (_engPanelTab) {
    case "overview":   _renderEngOverview();   break;
    case "cities":     _renderEngCities();     break;
    case "merchants":  _renderEngMerchants();  break;
    case "guilds":     _renderEngGuilds();     break;
    case "routes":     _renderEngRoutes();     break;
    case "crises":     _renderEngCrises();     break;
    case "countries":  _renderEngCountries();  break;
    case "stats":      _renderEngStats();      break;
    default:           _renderEngOverview();
  }
}

function switchEngTab(tab) { _engPanelTab = tab; economyEngine_renderPanel(); }

function _renderEngTabs() {
  const bar = document.getElementById("engTabBar");
  if (!bar) return;
  const tabs = [
    { id:"overview",  label:"📊 Tổng Quan"    },
    { id:"cities",    label:"🏙️ Thành Phố"    },
    { id:"merchants", label:"🛒 Thương Nhân"  },
    { id:"guilds",    label:"🏛️ Thương Hội"  },
    { id:"routes",    label:"🛤️ Thương Lộ"   },
    { id:"crises",    label:"⚠️ Khủng Hoảng" },
    { id:"countries", label:"🏴 Quốc Gia"     },
    { id:"stats",     label:"📈 Thống Kê"     },
  ];
  bar.innerHTML = tabs.map(t => `
    <button class="econ-tab-btn ${_engPanelTab === t.id ? "active" : ""}"
            onclick="switchEngTab('${t.id}')">${t.label}</button>
  `).join("");
}

// ── Overview ──

function _renderEngOverview() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;

  const rc = _richestCountry(), rs = _richestSect(), rn = _richestNPC(), lg = _largestGuild();
  const activeCrises = engCrises.length;
  const infl = engStats.inflation;
  const inflColor = infl > 1.5 ? "#f87171" : infl > 1.1 ? "#fb923c" : "#4ade80";
  const prosColor = engStats.globalProsperity > 60 ? "#4ade80" : engStats.globalProsperity > 40 ? "#facc15" : "#f87171";

  const activeCrisesHTML = activeCrises > 0
    ? `<div style="padding:8px 12px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:8px;margin-bottom:12px;font-size:12px;color:#fca5a5">
         ⚠️ ${activeCrises} khủng hoảng đang diễn ra: ${engCrises.map(cr => `${cr.icon}${cr.name.split(" ").slice(0,2).join(" ")}`).join(", ")}
       </div>` : "";

  el.innerHTML = `
    ${activeCrisesHTML}
    <div class="econ-section">
      <div class="econ-section-title">🌐 Kinh Tế Thế Giới — Tổng Quan</div>
      <div class="econ-stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💰</div>
          <div class="econ-stat-val" style="color:#facc15">${_engFmt(engStats.totalWorldWealth)}</div>
          <div class="econ-stat-lbl">Tổng Tài Phú Thế Giới</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📈</div>
          <div class="econ-stat-val" style="color:${inflColor}">${infl.toFixed(2)}x</div>
          <div class="econ-stat-lbl">Lạm Phát</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🌟</div>
          <div class="econ-stat-val" style="color:${prosColor}">${Math.floor(engStats.globalProsperity)}</div>
          <div class="econ-stat-lbl">Phồn Thịnh Toàn Cầu</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🛤️</div>
          <div class="econ-stat-val" style="color:#60a5fa">${_engFmt(engStats.tradeVolume)}</div>
          <div class="econ-stat-lbl">Khối Lượng Thương Mại</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⚠️</div>
          <div class="econ-stat-val" style="color:${activeCrises > 0 ? "#f87171":"#4ade80"}">${engStats.totalCrises}</div>
          <div class="econ-stat-lbl">Tổng Khủng Hoảng</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🛒</div>
          <div class="econ-stat-val" style="color:#c084fc">${_engMerchants.length}</div>
          <div class="econ-stat-lbl">Thương Nhân Đang Hoạt Động</div>
        </div>
      </div>
    </div>

    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">🏆 Bảng Xếp Hạng Giàu Nhất</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="econ-country-card" style="border-top:3px solid #facc15">
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">👑 QUỐC GIA GIÀU NHẤT</div>
          <div style="font-size:14px;font-weight:700;color:#facc15">${rc ? rc.name : "—"}</div>
          <div style="color:#94a3b8;font-size:12px">Kho bạc: ${rc ? _engFmt(rc.treasury||0) : "—"}</div>
          ${rc ? `<div style="color:${(rc.unrest||0)>50?"#f87171":"#4ade80"};font-size:11px">Bất ổn: ${Math.floor(rc.unrest||0)}%</div>` : ""}
        </div>
        <div class="econ-country-card" style="border-top:3px solid #4ade80">
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">🏯 TÔNG MÔN GIÀU NHẤT</div>
          <div style="font-size:14px;font-weight:700;color:#4ade80">${rs ? rs.name : "—"}</div>
          <div style="color:#94a3b8;font-size:12px">Kho báu: ${rs ? _engFmt(rs.treasury||0) : "—"}</div>
        </div>
        <div class="econ-country-card" style="border-top:3px solid #c084fc">
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">💰 TU SĨ GIÀU NHẤT</div>
          <div style="font-size:14px;font-weight:700;color:#c084fc">${rn ? rn.name : "—"}</div>
          <div style="color:#94a3b8;font-size:12px">Tài phú: ${rn ? _engFmt(rn.wealth||0) : "—"}</div>
          ${rn?.isMerchant ? `<div style="color:#fb923c;font-size:11px">🛒 Thương Nhân Hạng ${rn.merchantTier}</div>` : ""}
        </div>
        <div class="econ-country-card" style="border-top:3px solid #fb923c">
          <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">🏛️ THƯƠNG HỘI LỚN NHẤT</div>
          <div style="font-size:14px;font-weight:700;color:#fb923c">${lg ? lg.name : "Chưa thành lập"}</div>
          <div style="color:#94a3b8;font-size:12px">${lg ? `${lg.members.length} thành viên · Tài sản: ${_engFmt(lg.wealth||0)}` : "—"}</div>
        </div>
      </div>
    </div>

    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Xu Hướng Tài Phú</div>
      ${_engSparkline(engHistory.map(h => h.totalWealth), "#facc15", "Tài Phú")}
    </div>
  `;
}

// ── Cities ──

function _renderEngCities() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!engCities.length) { el.innerHTML = `<div class="econ-empty">Chưa có thành phố nào.</div>`; return; }
  const sorted = [...engCities].sort((a, b) => b.wealth - a.wealth);
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏙️ Kinh Tế Thành Phố (${engCities.length} thành phố)</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>#</th><th>Thành Phố</th><th>Quốc Gia</th>
            <th style="color:#facc15">💰 Tài Phú</th>
            <th style="color:#4ade80">🌟 Phồn Thịnh</th>
            <th style="color:#60a5fa">📦 Sản Xuất</th>
            <th style="color:#fb923c">🛤️ Thương Lực</th>
            <th style="color:#94a3b8">👥 Dân Số</th>
          </tr></thead>
          <tbody>
            ${sorted.map((city, i) => {
              const c = (typeof countries !== "undefined") ? countries.find(x => x.id === city.countryId) : null;
              const pr = _prosperityRecord(city.prosperity);
              return `<tr class="${i < 3 ? "econ-top-row" : ""}">
                <td style="color:var(--gold-dim)">${i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td>
                <td style="font-weight:600">${city.name}</td>
                <td style="font-size:11px;color:var(--white-dim)">${c ? c.name : "?"}</td>
                <td style="color:#facc15;font-weight:700">${_engFmt(city.wealth)}</td>
                <td><span style="color:${pr.icon === "🌟" ? "#4ade80" : pr.icon === "😊" ? "#86efac" : pr.icon === "😐" ? "#94a3b8" : "#f87171"}">${pr.icon} ${pr.label}</span></td>
                <td style="color:#60a5fa">${_engFmt(city.production)}</td>
                <td style="color:#fb923c">${Math.floor(city.tradePower)}</td>
                <td style="color:#94a3b8">${_engFmt(city.population)}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Merchants ──

function _renderEngMerchants() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const merchants = _aliveNPCs().filter(n => n.isMerchant).sort((a, b) => (b.wealth||0) - (a.wealth||0));
  if (!merchants.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có thương nhân nào. Tu sĩ giàu hơn 5000 tài phú sẽ tự trở thành thương nhân.</div>`;
    return;
  }
  const tierLabels = ["—","Tiểu Thương","Đại Thương","Thương Nhân Vĩ Đại"];
  const tierColors = ["#94a3b8","#4ade80","#facc15","#f97316"];
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🛒 Thương Nhân (${merchants.length} người)</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>#</th><th>Tên</th><th>Hạng</th>
            <th style="color:#facc15">💰 Tài Phú</th>
            <th>🛤️ Tuyến Đường</th><th>🏛️ Thương Hội</th>
          </tr></thead>
          <tbody>
            ${merchants.slice(0,50).map((m, i) => {
              const tier = m.merchantTier || 1;
              const guild = engGuilds.find(g => g.id === m.guildId);
              const routeCount = engTradeRoutes.filter(r => r.merchantId === m.id && r.active).length;
              return `<tr class="${i < 3 ? "econ-top-row" : ""}">
                <td style="color:var(--gold-dim)">${i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td>
                <td style="font-weight:600">${m.name}</td>
                <td style="color:${tierColors[tier]}">${tierLabels[tier]}</td>
                <td style="color:#facc15;font-weight:700">${_engFmt(m.wealth||0)}</td>
                <td style="color:#60a5fa">${routeCount}</td>
                <td style="color:#fb923c;font-size:11px">${guild ? guild.name : "—"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Guilds ──

function _renderEngGuilds() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (!engGuilds.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có thương hội nào. Thương nhân hạng Vĩ Đại (tài phú >200K) sẽ tự thành lập thương hội.</div>`;
    return;
  }
  const sorted = [...engGuilds].sort((a, b) => b.wealth - a.wealth);
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏛️ Thương Hội (${engGuilds.length} hội)</div>
      <div class="econ-sect-grid">
        ${sorted.map((g, i) => {
          const founder = _aliveNPCs().find(n => n.id === g.founderId);
          const activeRoutes = engTradeRoutes.filter(r => g.members.includes(r.merchantId) && r.active).length;
          return `<div class="econ-sect-card" style="border-left:3px solid ${i===0?"#facc15":i===1?"#94a3b8":i===2?"#fb923c":"var(--border)"}">
            <div class="econ-sect-name">${i===0?"🥇":i===1?"🥈":i===2?"🥉":""} ${g.name}</div>
            <div class="econ-sect-meta">Thành lập năm ${g.yearFounded} · ${g.members.length} thành viên · Uy danh: ${_engFmt(g.prestige||0)}</div>
            <div style="color:var(--white-dim);font-size:11px">Người sáng lập: ${founder ? founder.name : g.founderName || "?"}</div>
            <div class="econ-res-row" style="margin-top:8px">
              <span class="econ-res-chip">💰 ${_engFmt(g.wealth)}</span>
              <span class="econ-res-chip">🛤️ ${activeRoutes} tuyến</span>
              <span class="econ-res-chip">👥 ${g.members.length} thành viên</span>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

// ── Trade Routes ──

function _renderEngRoutes() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const activeRoutes = engTradeRoutes.filter(r => r.active);
  if (!activeRoutes.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có tuyến thương lộ nào. Thương nhân sẽ tự tạo khi đủ giàu.</div>`;
    return;
  }
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🛤️ Tuyến Thương Lộ Đang Hoạt Động (${activeRoutes.length})</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>Từ</th><th>→</th><th>Đến</th>
            <th style="color:#60a5fa">📦 Khối Lượng</th>
            <th>Thương Nhân</th>
            <th style="color:#94a3b8">Năm TL</th>
          </tr></thead>
          <tbody>
            ${activeRoutes.slice(0,40).map(r => {
              const cA = engCities.find(c => c.id === r.cityA);
              const cB = engCities.find(c => c.id === r.cityB);
              const m  = _aliveNPCs().find(n => n.id === r.merchantId);
              return `<tr>
                <td style="font-weight:600">${cA ? cA.name : "?"}</td>
                <td style="color:#4ade80">⇌</td>
                <td style="font-weight:600">${cB ? cB.name : "?"}</td>
                <td style="color:#60a5fa">${_engFmt(r.volume)}</td>
                <td style="font-size:11px;color:var(--white-dim)">${m ? m.name : "?"}</td>
                <td style="color:#94a3b8">${r.yearCreated}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Khối Lượng Thương Mại</div>
      ${_engSparkline(engHistory.map(h => h.tradeVolume), "#60a5fa", "Thương Mại")}
    </div>
  `;
}

// ── Crises ──

function _renderEngCrises() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  const allCrises = engCrises;
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">⚠️ Khủng Hoảng Đang Diễn Ra (${allCrises.length})</div>
      ${allCrises.length ? `<div style="display:grid;gap:10px">${allCrises.map(cr => {
        const c = (typeof countries !== "undefined") ? countries.find(x => x.id === cr.countryId) : null;
        return `<div style="padding:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.35);border-radius:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:700;color:#fca5a5">${cr.icon} ${cr.name}</span>
            <span style="color:#94a3b8;font-size:11px">Còn ${cr.ticksLeft} tick</span>
          </div>
          <div style="color:#94a3b8;font-size:12px;margin-top:4px">🏴 ${c ? c.name : "?"} · Thương mại ×${cr.tradeMult}</div>
        </div>`;
      }).join("")}</div>` : `<div class="econ-empty">✅ Không có khủng hoảng kinh tế nào đang diễn ra.</div>`}
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📋 Lịch Sử Khủng Hoảng</div>
      ${_engSparkline(engHistory.map(h => h.crises), "#f87171", "Khủng Hoảng")}
      <div style="margin-top:8px;color:var(--white-dim);font-size:12px">Tổng khủng hoảng đã xảy ra: <strong style="color:#fca5a5">${engStats.totalCrises}</strong></div>
    </div>
  `;
}

// ── Countries ──

function _renderEngCountries() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  if (typeof countries === "undefined" || !countries.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có quốc gia nào.</div>`; return;
  }
  const sorted = [...countries].sort((a, b) => (b.treasury||0) - (a.treasury||0));
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏴 Kinh Tế Quốc Gia</div>
      <div class="econ-country-grid">
        ${sorted.map((c, i) => {
          const crisis = engCrises.find(cr => cr.countryId === c.id);
          const pr = _prosperityRecord(c.prosperity || 50);
          return `<div class="econ-country-card" style="border-top:3px solid ${i===0?"#facc15":i===1?"#94a3b8":"var(--border)"}">
            <div class="econ-country-name">${i===0?"👑":c.bankrupt?"💸":"🏴"} ${c.name}${c.bankrupt ? " <span style='color:#f87171;font-size:10px'>PHÁ SẢN</span>" : ""}</div>
            <div class="econ-country-meta">Lv.${c.level||1} · Dân số: ${_engFmt(c.population||0)} · ${pr.icon} ${pr.label}</div>
            ${crisis ? `<div style="color:#fca5a5;font-size:11px;margin:4px 0">${crisis.icon} ${crisis.name} (còn ${crisis.ticksLeft} tick)</div>` : ""}
            <div style="display:flex;flex-direction:column;gap:6px;margin:10px 0">
              ${_engMiniBar("💰 Kho Bạc",    c.treasury||0, sorted[0]?.treasury||1, "#facc15", c.annualIncome||0)}
              ${_engMiniBar("💹 Thu Nhập/Tick",c.annualIncome||0, (sorted[0]?.annualIncome||0)+1, "#4ade80", 0)}
              ${_engMiniBar("💸 Chi Phí/Tick",c.annualExpenses||0, (sorted[0]?.annualExpenses||0)+1, "#f87171", 0)}
              ${_engMiniBar("😤 Bất Ổn",     c.unrest||0, 100, "#fb923c", 0)}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="econ-res-chip">💰 Thuế: ${c.taxRate||15}%</span>
              <span class="econ-res-chip">📊 Phồn Thịnh: ${Math.floor(c.prosperity||50)}</span>
              <span class="econ-res-chip">${crisis ? "⚠️ Khủng Hoảng" : "✅ Ổn Định"}</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
              <button class="btn-secondary" style="font-size:11px;padding:4px 10px"
                onclick="engSetTaxRate('${c.id}',${Math.min(50,(c.taxRate||15)+5)})">📈 Tăng Thuế</button>
              <button class="btn-secondary" style="font-size:11px;padding:4px 10px"
                onclick="engSetTaxRate('${c.id}',${Math.max(5,(c.taxRate||15)-5)})">📉 Giảm Thuế</button>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

// ── Stats ──

function _renderEngStats() {
  const el = document.getElementById("engPanelContent");
  if (!el) return;
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">📊 Thống Kê Kinh Tế</div>
      <div class="econ-stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💰</div>
          <div class="econ-stat-val" style="color:#facc15">${_engFmt(engStats.totalWorldWealth)}</div>
          <div class="econ-stat-lbl">Tổng Tài Phú</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">📈</div>
          <div class="econ-stat-val" style="color:${engStats.inflation>1.3?"#f87171":"#4ade80"}">${engStats.inflation.toFixed(3)}x</div>
          <div class="econ-stat-lbl">Chỉ Số Lạm Phát</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🌟</div>
          <div class="econ-stat-val" style="color:#4ade80">${Math.floor(engStats.globalProsperity)}</div>
          <div class="econ-stat-lbl">Phồn Thịnh</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🛤️</div>
          <div class="econ-stat-val" style="color:#60a5fa">${_engFmt(engStats.tradeVolume)}</div>
          <div class="econ-stat-lbl">Thương Mại/Tick</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⚠️</div>
          <div class="econ-stat-val" style="color:#fb923c">${engStats.totalCrises}</div>
          <div class="econ-stat-lbl">Tổng Khủng Hoảng</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏙️</div>
          <div class="econ-stat-val" style="color:#c084fc">${engCities.length}</div>
          <div class="econ-stat-lbl">Thành Phố</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🛒</div>
          <div class="econ-stat-val" style="color:#4ade80">${_engMerchants.length}</div>
          <div class="econ-stat-lbl">Thương Nhân</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏛️</div>
          <div class="econ-stat-val" style="color:#fb923c">${engGuilds.length}</div>
          <div class="econ-stat-lbl">Thương Hội</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🚗</div>
          <div class="econ-stat-val" style="color:#60a5fa">${engTradeRoutes.filter(r=>r.active).length}</div>
          <div class="econ-stat-lbl">Tuyến Thương Lộ</div>
        </div>
      </div>
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Tài Phú Thế Giới (100 Tick)</div>
      ${_engSparkline(engHistory.map(h=>h.totalWealth), "#facc15", "Tài Phú")}
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Phồn Thịnh</div>
      ${_engSparkline(engHistory.map(h=>h.prosperity), "#4ade80", "Phồn Thịnh")}
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📈 Lạm Phát</div>
      ${_engSparkline(engHistory.map(h=>h.inflation*100), "#f87171", "Lạm Phát ×100")}
    </div>
  `;
}

// ================================================================
// CREATOR GOD CONTROLS
// ================================================================

/** Manually set a country's tax rate */
function engSetTaxRate(countryId, rate) {
  const c = (typeof countries !== "undefined") ? countries.find(x => x.id === countryId) : null;
  if (!c) return;
  c.taxRate = Math.max(0, Math.min(50, rate));
  if (typeof addLog === "function")
    addLog(`📊 ${c.name}: Thuế suất → ${c.taxRate}%`, "important");
  economyEngine_renderPanel();
}

/** Manually trigger an economic crisis on a country */
function engTriggerCrisis(countryId, crisisId) {
  const type = ENG_CRISIS_TYPES.find(t => t.id === crisisId);
  const c = (typeof countries !== "undefined") ? countries.find(x => x.id === countryId) : null;
  if (!type || !c) return;
  engCrises.push({ ...type, countryId, ticksLeft: type.durationMax });
  engStats.totalCrises++;
  if (typeof addLog === "function")
    addLog(`${type.icon} Thiên Đạo giáng khủng hoảng ${type.name} lên ${c.name}!`, "death");
  economyEngine_renderPanel();
}

/** Manually inject wealth into a country treasury */
function engInjectWealth(countryId, amount) {
  const c = (typeof countries !== "undefined") ? countries.find(x => x.id === countryId) : null;
  if (!c) return;
  c.treasury = (c.treasury || 0) + amount;
  if (c.resource) c.resource.gold = c.treasury;
  if (typeof addLog === "function")
    addLog(`💰 Thiên Đạo ban ${_engFmt(amount)} vàng cho ${c.name}`, "important");
  economyEngine_renderPanel();
}

// ================================================================
// RENDER HELPERS
// ================================================================

function _engSparkline(values, color, label) {
  if (!values || !values.length) return `<div class="econ-empty">Chưa đủ dữ liệu.</div>`;
  const W = 520, H = 80, pad = 10;
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const lastVal = values[values.length - 1];
  return `<div style="overflow-x:auto">
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:${H}px;display:block">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" opacity="0.9"/>
      <text x="${W - pad}" y="${H - pad + 2}" text-anchor="end" font-size="10" fill="${color}">${_engFmt(lastVal)}</text>
      <text x="${pad}" y="${pad + 8}" font-size="9" fill="rgba(255,255,255,0.4)">${label}</text>
    </svg>
  </div>`;
}

function _engMiniBar(label, val, maxVal, color, rate) {
  const pct = Math.min(100, Math.round(val / Math.max(maxVal, 1) * 100));
  const rateStr = rate > 0 ? `<span style="color:#4ade80;font-size:10px">+${_engFmt(rate)}/tick</span>` : "";
  return `<div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
      <span style="color:var(--white-dim)">${label}</span>
      <div style="display:flex;gap:6px;align-items:center">${rateStr}<span style="color:${color};font-weight:700">${_engFmt(val)}</span></div>
    </div>
    <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.4s"></div>
    </div>
  </div>`;
}
