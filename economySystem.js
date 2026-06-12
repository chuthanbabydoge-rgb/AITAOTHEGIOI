/* ============================================================
   ECONOMY SYSTEM — economySystem.js
   Creator God V6.0
   ─────────────────────────────────────────────────────────────
   Fields added / guaranteed:
     npc.wealth        — already in app.js, ensured here
     npc.spiritStone   — NEW: linh thạch tinh luyện (high-grade)
     npc.reputation    — already in app.js, ensured here
     sect.resource     — alias/mirror of sect.resources (object)
     country.resource  — NEW: rich economy object per country

   Main tick function: simulateEconomy()
   ─────────────────────────────────────────────────────────────
   DOES NOT TOUCH: territorySystem.js or world.territories
   ============================================================ */

// ============================
// ECONOMY CONSTANTS
// ============================

const ECONOMY_TRADE_GOODS = [
  { name:"Linh Thạch Khối",   icon:"💎", value: 500,  rarity:"common"   },
  { name:"Tinh Thần Đan",     icon:"🔮", value: 1200, rarity:"uncommon" },
  { name:"Huyền Thiết Tinh",  icon:"⚙️",  value: 800,  rarity:"uncommon" },
  { name:"Linh Dược Thượng",  icon:"🌿", value: 950,  rarity:"rare"     },
  { name:"Thần Thạch Mảnh",   icon:"✨", value: 3000, rarity:"rare"     },
  { name:"Hỗn Nguyên Khoáng", icon:"🌀", value: 8000, rarity:"epic"     },
];

const ECONOMY_MARKET_EVENTS = [
  { name:"Thị Trường Phồn Thịnh", icon:"📈", mult: 1.4,  chance: 0.10 },
  { name:"Linh Khí Suy Giảm",     icon:"📉", mult: 0.7,  chance: 0.08 },
  { name:"Chiến Tranh Thương Mại", icon:"⚔️",  mult: 0.85, chance: 0.07 },
  { name:"Phát Hiện Khoáng Mỏ",   icon:"⛏️",  mult: 1.25, chance: 0.09 },
  { name:"Dịch Bệnh Linh Thảo",   icon:"🦠", mult: 0.80, chance: 0.06 },
  { name:"Thiên Tài Xuất Thế",     icon:"🌟", mult: 1.3,  chance: 0.08 },
];

// Market multiplier this tick (shared state)
let _econMarketMult = 1.0;
let _econMarketEvent = null;
// Economy history (last 50 ticks)
let economyHistory = [];
// Economy panel tab state
let _econPanelTab = "overview";

// ============================
// INITIALIZATION / MIGRATION
// ============================

/** Ensure all NPC, sect, country fields exist. Safe to call every tick. */
function ensureEconomyFields() {
  // NPCs
  if (typeof npcs !== "undefined") {
    npcs.forEach(npc => {
      if (npc.wealth     === undefined) npc.wealth     = 100;
      if (npc.spiritStone === undefined) npc.spiritStone = 0;
      if (npc.reputation === undefined) npc.reputation = 0;
    });
  }

  // Sects — sect.resource is the canonical alias (same object reference as sect.resources)
  if (typeof sects !== "undefined") {
    sects.forEach(s => {
      if (!s.resources) s.resources = { lingshi: 200, lingyao: 80, xuantie: 50, jingshi: 20 };
      // Alias: sect.resource mirrors sect.resources
      Object.defineProperty(s, "resource", {
        get()  { return this.resources; },
        set(v) { this.resources = v; },
        configurable: true, enumerable: false,
      });
      if (s.treasury === undefined) s.treasury = s.resources.lingshi;
    });
  }

  // Countries — country.resource is a full economy resource object
  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      if (!c.resource) {
        c.resource = {
          gold:      c.wealth  || 5000,
          grain:     Math.floor((c.population || 100000) * 0.01),
          iron:      Math.floor((c.military   || 10000)  * 0.05),
          spirit:    Math.floor((c.economy    || 3000)   * 0.1),
          // Growth rates (per tick)
          goldRate:  0,
          grainRate: 0,
          ironRate:  0,
          spiritRate:0,
        };
      } else {
        // Migrate missing fields
        if (c.resource.gold    === undefined) c.resource.gold    = c.wealth   || 5000;
        if (c.resource.grain   === undefined) c.resource.grain   = 1000;
        if (c.resource.iron    === undefined) c.resource.iron    = 500;
        if (c.resource.spirit  === undefined) c.resource.spirit  = 200;
        if (c.resource.goldRate   === undefined) c.resource.goldRate   = 0;
        if (c.resource.grainRate  === undefined) c.resource.grainRate  = 0;
        if (c.resource.ironRate   === undefined) c.resource.ironRate   = 0;
        if (c.resource.spiritRate === undefined) c.resource.spiritRate = 0;
      }
    });
  }
}

// ============================
// MAIN TICK  —  simulateEconomy()
// ============================

function simulateEconomy() {
  if (typeof world === "undefined" || !world) return;
  ensureEconomyFields();

  // Roll market event (random chance each tick)
  _econMarketEvent = null;
  _econMarketMult  = 1.0;
  for (const evt of ECONOMY_MARKET_EVENTS) {
    if (Math.random() < evt.chance) {
      _econMarketEvent = evt;
      _econMarketMult  = evt.mult;
      if (typeof addLog === "function")
        addLog(`${evt.icon} Sự kiện kinh tế: ${evt.name} (×${evt.mult})`, "important");
      break;
    }
  }

  _tickNPCEconomy();
  _tickSectEconomy();
  _tickCountryEconomy();
  _tickTrade();
  _recordEconomySnapshot();

  // Refresh economy panel if visible
  const panel = document.getElementById("panel-economy");
  if (panel && panel.classList.contains("active")) renderEconomyPanel();
}

// ────────────────────────────
// NPC ECONOMY TICK
// ────────────────────────────

function _tickNPCEconomy() {
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];

  alive.forEach(npc => {
    const realmBonus = (npc.realm || 0) + 1;
    const luckMult   = 1 + (npc.luck || 50) / 200;

    // Base wealth income (cultivation income)
    const wealthGain = Math.floor((realmBonus * 3 + Math.random() * 10) * luckMult * _econMarketMult);
    npc.wealth = (npc.wealth || 0) + wealthGain;

    // SpiritStone conversion: high-realm NPCs condense lingshi → spiritStone
    if ((npc.realm || 0) >= 3 && (npc.resources?.lingshi || 0) >= 50) {
      const condensed = Math.floor(npc.resources.lingshi * 0.05);
      npc.resources.lingshi  -= condensed;
      npc.spiritStone = (npc.spiritStone || 0) + Math.floor(condensed / 10);
    }

    // Reputation drift: slowly decays toward neutral if inactive
    if (npc.reputation > 0) {
      npc.reputation = Math.max(0, npc.reputation - Math.floor(npc.reputation * 0.002));
    }

    // Reputation gain from realm
    npc.reputation = (npc.reputation || 0) + Math.floor(realmBonus * 0.5 * _econMarketMult);

    // Occasional wealth from trade
    if (Math.random() < 0.05) {
      const tradeGain = Math.floor(Math.random() * 200 * realmBonus * _econMarketMult);
      npc.wealth += tradeGain;
    }

    // Wealth cap loosely at realm-based tier
    const wealthCap = realmBonus * 50000;
    if (npc.wealth > wealthCap) npc.wealth = Math.floor(npc.wealth * 0.98); // bleed excess off slowly
  });
}

// ────────────────────────────
// SECT ECONOMY TICK
// ────────────────────────────

function _tickSectEconomy() {
  if (typeof sects === "undefined") return;
  sects.forEach(s => {
    if (!s.resources) s.resources = { lingshi:0, lingyao:0, xuantie:0, jingshi:0 };
    const lvl = s.level || 1;
    const members = (typeof npcById === "function")
      ? (s.members || []).map(id => npcById(id)).filter(n => n && n.status === "alive")
      : [];
    const memberCount = members.length;

    // Resource income (sect.resource is the same object)
    const income = {
      lingshi: Math.floor((10 + memberCount * 3) * lvl * _econMarketMult),
      lingyao: Math.floor((3  + memberCount * 1) * lvl * _econMarketMult),
      xuantie: Math.floor((2  + memberCount * 0.5) * lvl * _econMarketMult),
      jingshi: Math.floor((1  + lvl * 0.5) * _econMarketMult),
    };
    Object.keys(income).forEach(k => {
      s.resources[k] = (s.resources[k] || 0) + income[k];
    });

    // Treasury mirrors lingshi
    s.treasury = s.resources.lingshi;

    // Prestige from active members
    s.prestige = (s.prestige || 0) + Math.floor(memberCount * 0.3 * lvl * _econMarketMult);
  });
}

// ────────────────────────────
// COUNTRY ECONOMY TICK
// ────────────────────────────

function _tickCountryEconomy() {
  if (typeof countries === "undefined") return;
  countries.forEach(c => {
    if (!c.resource) return;
    const tech    = c.technology || 1;
    const culture = c.culture    || 1;
    const pop     = c.population || 100000;
    const mult    = _econMarketMult;

    // Growth rates
    const goldRate   = Math.floor((100 + tech * 50 + pop * 0.001) * mult);
    const grainRate  = Math.floor((50  + culture * 20 + pop * 0.0005) * mult);
    const ironRate   = Math.floor((30  + tech * 30) * mult);
    const spiritRate = Math.floor((10  + (c.level||1) * 15) * mult);

    c.resource.goldRate   = goldRate;
    c.resource.grainRate  = grainRate;
    c.resource.ironRate   = ironRate;
    c.resource.spiritRate = spiritRate;

    c.resource.gold   = (c.resource.gold   || 0) + goldRate;
    c.resource.grain  = (c.resource.grain  || 0) + grainRate;
    c.resource.iron   = (c.resource.iron   || 0) + ironRate;
    c.resource.spirit = (c.resource.spirit || 0) + spiritRate;

    // Sync legacy wealth field
    c.wealth  = c.resource.gold;
    c.economy = c.resource.gold;
  });
}

// ────────────────────────────
// INTER-ENTITY TRADE
// ────────────────────────────

function _tickTrade() {
  if (typeof npcs === "undefined" || typeof sects === "undefined") return;
  const alive = npcs.filter(n => n.status === "alive");
  if (!alive.length) return;

  // 5% of rich NPCs donate to their sect
  alive.forEach(npc => {
    if (!npc.sectId || Math.random() > 0.05) return;
    const sect = (typeof sects !== "undefined") ? sects.find(s => s.id === npc.sectId) : null;
    if (!sect) return;
    const tithe = Math.floor((npc.wealth || 0) * 0.03);
    if (tithe <= 0) return;
    npc.wealth -= tithe;
    if (sect.resources) sect.resources.lingshi = (sect.resources.lingshi || 0) + tithe;
    sect.treasury = sect.resources.lingshi;
  });

  // Country taxation: 1% of total NPC wealth in region flows to country
  if (typeof countries !== "undefined") {
    countries.forEach(c => {
      const citizens = alive.filter(n => n.country === c.name);
      const totalWealth = citizens.reduce((s, n) => s + (n.wealth || 0), 0);
      const tax = Math.floor(totalWealth * 0.01);
      if (tax > 0 && c.resource) {
        c.resource.gold = (c.resource.gold || 0) + tax;
        c.wealth = c.resource.gold;
      }
    });
  }
}

// ────────────────────────────
// ECONOMY SNAPSHOT (history)
// ────────────────────────────

function _recordEconomySnapshot() {
  if (typeof year === "undefined") return;
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  const snap = {
    year: year,
    totalWealth:      alive.reduce((s, n) => s + (n.wealth      || 0), 0),
    totalSpiritStone: alive.reduce((s, n) => s + (n.spiritStone || 0), 0),
    totalReputation:  alive.reduce((s, n) => s + (n.reputation  || 0), 0),
    sectLingshi:      (typeof sects !== "undefined")
      ? sects.reduce((s, sect) => s + (sect.resources?.lingshi || 0), 0) : 0,
    countryGold:      (typeof countries !== "undefined")
      ? countries.reduce((s, c) => s + (c.resource?.gold || 0), 0) : 0,
    marketEvent:      _econMarketEvent ? _econMarketEvent.name : null,
  };
  economyHistory.push(snap);
  if (economyHistory.length > 50) economyHistory.shift();
}

// ============================
// SAVE / LOAD HOOKS
// ============================

function saveEconomy() {
  try {
    localStorage.setItem("cgv6_economyHistory", JSON.stringify(economyHistory.slice(0, 50)));
    // Persist spiritStone on npcs (already inside npcs save, but explicit backup)
    localStorage.setItem("cgv6_econMarketEvent", JSON.stringify(_econMarketEvent || null));
  } catch(e) { console.warn("Economy save failed:", e); }
}

function loadEconomy() {
  try {
    economyHistory  = JSON.parse(localStorage.getItem("cgv6_economyHistory"))  || [];
    _econMarketEvent = JSON.parse(localStorage.getItem("cgv6_econMarketEvent")) || null;
    _econMarketMult  = _econMarketEvent ? _econMarketEvent.mult : 1.0;
    ensureEconomyFields();
  } catch(e) { console.warn("Economy load failed:", e); }
}

// ============================
// RENDER — Economy Panel
// ============================

function renderEconomyPanel() {
  ensureEconomyFields();
  _renderEconTabs();
  switch (_econPanelTab) {
    case "overview":   _renderEconOverview();   break;
    case "npcs":       _renderEconNPCs();       break;
    case "sects":      _renderEconSects();      break;
    case "countries":  _renderEconCountries();  break;
    case "history":    _renderEconHistory();    break;
    default:           _renderEconOverview();
  }
}

function switchEconTab(tab) {
  _econPanelTab = tab;
  renderEconomyPanel();
}

function _renderEconTabs() {
  const bar = document.getElementById("econTabBar");
  if (!bar) return;
  const tabs = [
    { id:"overview",  label:"📊 Tổng Quan" },
    { id:"npcs",      label:"👥 Tu Sĩ" },
    { id:"sects",     label:"🏯 Tông Môn" },
    { id:"countries", label:"⚔️ Quốc Gia" },
    { id:"history",   label:"📈 Lịch Sử" },
  ];
  bar.innerHTML = tabs.map(t => `
    <button class="econ-tab-btn ${_econPanelTab === t.id ? "active" : ""}"
            onclick="switchEconTab('${t.id}')">${t.label}</button>
  `).join("");
}

// ── Overview ──

function _renderEconOverview() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;

  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  const totalWealth      = alive.reduce((s, n) => s + (n.wealth      || 0), 0);
  const totalSpirit      = alive.reduce((s, n) => s + (n.spiritStone || 0), 0);
  const totalReputation  = alive.reduce((s, n) => s + (n.reputation  || 0), 0);
  const sectLingshi      = (typeof sects !== "undefined")
    ? sects.reduce((s, sect) => s + (sect.resources?.lingshi || 0), 0) : 0;
  const countryGold      = (typeof countries !== "undefined")
    ? countries.reduce((s, c) => s + (c.resource?.gold || 0), 0) : 0;

  const marketHTML = _econMarketEvent
    ? `<div class="econ-market-badge" style="background:${_econMarketMult >= 1 ? "#14532d" : "#450a0a"}">
         ${_econMarketEvent.icon} ${_econMarketEvent.name}
         <span style="color:${_econMarketMult >= 1 ? "#4ade80" : "#f87171"}">×${_econMarketMult}</span>
       </div>`
    : `<div class="econ-market-badge" style="background:#1e293b">📊 Thị Trường Ổn Định</div>`;

  // Mini chart (history sparkline)
  const spark = _buildSparkline(economyHistory.map(h => h.totalWealth), "#facc15", "Tài Phú");

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🌐 Trạng Thái Kinh Tế Thế Giới</div>
      ${marketHTML}
      <div class="econ-stat-grid">
        <div class="econ-stat-card">
          <div class="econ-stat-icon">💰</div>
          <div class="econ-stat-val" style="color:#facc15">${_fmt(totalWealth)}</div>
          <div class="econ-stat-lbl">Tổng Tài Phú Tu Sĩ</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🔮</div>
          <div class="econ-stat-val" style="color:#c084fc">${_fmt(totalSpirit)}</div>
          <div class="econ-stat-lbl">Tổng Linh Thạch Tinh</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">⭐</div>
          <div class="econ-stat-val" style="color:#fb923c">${_fmt(totalReputation)}</div>
          <div class="econ-stat-lbl">Tổng Danh Vọng</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏯</div>
          <div class="econ-stat-val" style="color:#4ade80">${_fmt(sectLingshi)}</div>
          <div class="econ-stat-lbl">Linh Thạch Tông Môn</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">🏛️</div>
          <div class="econ-stat-val" style="color:#60a5fa">${_fmt(countryGold)}</div>
          <div class="econ-stat-lbl">Vàng Quốc Gia</div>
        </div>
        <div class="econ-stat-card">
          <div class="econ-stat-icon">👥</div>
          <div class="econ-stat-val">${alive.length}</div>
          <div class="econ-stat-lbl">Tu Sĩ Đang Sống</div>
        </div>
      </div>
    </div>
    <div class="econ-section">
      <div class="econ-section-title">📈 Xu Hướng Tài Phú (50 Tick Gần Nhất)</div>
      ${spark}
    </div>
    <div class="econ-section">
      <div class="econ-section-title">🏆 Top 5 Tu Sĩ Giàu Nhất</div>
      ${_renderTopNPCsWealth(5)}
    </div>
  `;
}

// ── NPC Tab ──

function _renderEconNPCs() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  if (!alive.length) { el.innerHTML = `<div class="econ-empty">Chưa có tu sĩ nào.</div>`; return; }

  const sorted = [...alive].sort((a, b) => (b.wealth || 0) - (a.wealth || 0)).slice(0, 50);
  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">💰 Bảng Xếp Hạng Tài Phú Tu Sĩ (Top 50)</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>#</th><th>Tên</th><th>Cảnh Giới</th>
            <th style="color:#facc15">💰 Tài Phú</th>
            <th style="color:#c084fc">🔮 Linh Thạch Tinh</th>
            <th style="color:#fb923c">⭐ Danh Vọng</th>
          </tr></thead>
          <tbody>
            ${sorted.map((npc, i) => {
              const realmName = (typeof REALMS !== "undefined") ? REALMS[npc.realm]?.name || "?" : npc.realm;
              return `<tr class="${i < 3 ? "econ-top-row" : ""}">
                <td style="color:var(--gold-dim)">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i+1}</td>
                <td style="font-weight:600">${npc.name}</td>
                <td style="font-size:11px;color:var(--white-dim)">${realmName}</td>
                <td style="color:#facc15;font-weight:700">${_fmt(npc.wealth || 0)}</td>
                <td style="color:#c084fc">${_fmt(npc.spiritStone || 0)}</td>
                <td style="color:#fb923c">${_fmt(npc.reputation || 0)}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="econ-section" style="margin-top:16px">
      <div class="econ-section-title">📊 Phân Phối Tài Phú</div>
      ${_renderWealthDistribution(alive)}
    </div>
  `;
}

// ── Sect Tab ──

function _renderEconSects() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;
  if (typeof sects === "undefined" || !sects.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có tông môn nào.</div>`; return;
  }
  const sorted = [...sects].sort((a, b) => (b.resources?.lingshi || 0) - (a.resources?.lingshi || 0));

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏯 Tài Nguyên Tông Môn</div>
      <div class="econ-sect-grid">
        ${sorted.map((s, i) => {
          const r = s.resources || {};
          const memberCount = (typeof npcById === "function")
            ? (s.members || []).map(id => npcById(id)).filter(n => n && n.status === "alive").length
            : (s.members || []).length;
          return `<div class="econ-sect-card" style="border-left:3px solid ${i===0?"#facc15":i===1?"#94a3b8":i===2?"#fb923c":"var(--border)"}">
            <div class="econ-sect-name">${i===0?"🥇":i===1?"🥈":i===2?"🥉":""} ${s.name}</div>
            <div class="econ-sect-meta">Lv.${s.level||1} · ${memberCount} thành viên · Uy danh: ${_fmt(s.prestige||0)}</div>
            <div class="econ-res-row">
              <span class="econ-res-chip">💎 ${_fmt(r.lingshi||0)}</span>
              <span class="econ-res-chip">🌿 ${_fmt(r.lingyao||0)}</span>
              <span class="econ-res-chip">⚙️ ${_fmt(r.xuantie||0)}</span>
              <span class="econ-res-chip">🔮 ${_fmt(r.jingshi||0)}</span>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

// ── Country Tab ──

function _renderEconCountries() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;
  if (typeof countries === "undefined" || !countries.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có quốc gia nào.</div>`; return;
  }
  const sorted = [...countries].sort((a, b) => (b.resource?.gold || 0) - (a.resource?.gold || 0));

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">🏛️ Kinh Tế Quốc Gia</div>
      <div class="econ-country-grid">
        ${sorted.map((c, i) => {
          const r = c.resource || {};
          return `<div class="econ-country-card" style="border-top:3px solid ${i===0?"#facc15":i===1?"#94a3b8":"var(--border)"}">
            <div class="econ-country-name">${i===0?"👑":"🏴"} ${c.name}</div>
            <div class="econ-country-meta">Lv.${c.level||1} · Dân số: ${_fmt(c.population||0)}</div>
            <div style="margin:10px 0;display:flex;flex-direction:column;gap:6px">
              ${_miniBar("💰 Vàng",    r.gold   ||0, sorted[0]?.resource?.gold   ||1, "#facc15", r.goldRate  ||0)}
              ${_miniBar("🌾 Lương Thực", r.grain  ||0, sorted[0]?.resource?.grain ||1, "#4ade80", r.grainRate ||0)}
              ${_miniBar("⚒️ Sắt",      r.iron   ||0, sorted[0]?.resource?.iron   ||1, "#94a3b8", r.ironRate  ||0)}
              ${_miniBar("✨ Linh Lực", r.spirit ||0, sorted[0]?.resource?.spirit ||1, "#c084fc", r.spiritRate||0)}
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

// ── History Tab ──

function _renderEconHistory() {
  const el = document.getElementById("econPanelContent");
  if (!el) return;
  if (!economyHistory.length) {
    el.innerHTML = `<div class="econ-empty">Chưa có dữ liệu lịch sử.</div>`; return;
  }
  const last20 = [...economyHistory].reverse().slice(0, 20);

  el.innerHTML = `
    <div class="econ-section">
      <div class="econ-section-title">📈 Biểu Đồ Tài Phú (Tu Sĩ)</div>
      ${_buildSparkline(economyHistory.map(h => h.totalWealth), "#facc15", "Tài Phú Tu Sĩ")}
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">🏯 Biểu Đồ Linh Thạch (Tông Môn)</div>
      ${_buildSparkline(economyHistory.map(h => h.sectLingshi), "#4ade80", "Linh Thạch Tông")}
    </div>
    <div class="econ-section" style="margin-top:14px">
      <div class="econ-section-title">📋 Nhật Ký Kinh Tế</div>
      <div class="econ-table-wrap">
        <table class="econ-table">
          <thead><tr>
            <th>Năm</th><th>Tài Phú</th><th>Linh Thạch Tinh</th>
            <th>Danh Vọng</th><th>Tông Môn LS</th><th>Sự Kiện</th>
          </tr></thead>
          <tbody>
            ${last20.map(h => `<tr>
              <td style="color:var(--gold-dim)">${h.year}</td>
              <td style="color:#facc15">${_fmt(h.totalWealth)}</td>
              <td style="color:#c084fc">${_fmt(h.totalSpiritStone)}</td>
              <td style="color:#fb923c">${_fmt(h.totalReputation)}</td>
              <td style="color:#4ade80">${_fmt(h.sectLingshi)}</td>
              <td style="font-size:11px;color:var(--white-dim)">${h.marketEvent || "—"}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================
// HELPER RENDERERS
// ============================

function _renderTopNPCsWealth(n) {
  const alive = (typeof npcs !== "undefined") ? npcs.filter(n => n.status === "alive") : [];
  const top = [...alive].sort((a, b) => (b.wealth || 0) - (a.wealth || 0)).slice(0, n);
  if (!top.length) return `<div class="econ-empty">Chưa có dữ liệu.</div>`;
  return top.map((npc, i) => {
    const realmName = (typeof REALMS !== "undefined") ? REALMS[npc.realm]?.name || "?" : npc.realm;
    return `<div class="econ-topnpc-row">
      <span class="econ-topnpc-rank">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1)}</span>
      <span class="econ-topnpc-name">${npc.name}</span>
      <span class="econ-topnpc-realm" style="color:var(--white-dim)">${realmName}</span>
      <span class="econ-topnpc-val" style="color:#facc15">💰 ${_fmt(npc.wealth||0)}</span>
      <span class="econ-topnpc-val" style="color:#c084fc">🔮 ${_fmt(npc.spiritStone||0)}</span>
      <span class="econ-topnpc-val" style="color:#fb923c">⭐ ${_fmt(npc.reputation||0)}</span>
    </div>`;
  }).join("");
}

function _renderWealthDistribution(alive) {
  if (!alive.length) return "";
  const buckets = [
    { label:"Bần Cùng",   min:0,      max:500,   color:"#94a3b8" },
    { label:"Bình Dân",   min:500,    max:2000,  color:"#4ade80" },
    { label:"Tiểu Phú",   min:2000,   max:10000, color:"#facc15" },
    { label:"Phú Hào",    min:10000,  max:50000, color:"#fb923c" },
    { label:"Cự Phú",     min:50000,  max:Infinity, color:"#c084fc" },
  ];
  const counts = buckets.map(b => alive.filter(n => (n.wealth||0) >= b.min && (n.wealth||0) < b.max).length);
  const maxCount = Math.max(...counts, 1);
  return buckets.map((b, i) => {
    const pct = Math.round(counts[i] / alive.length * 100);
    const bar = Math.round(counts[i] / maxCount * 100);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <div style="width:80px;font-size:11px;color:${b.color}">${b.label}</div>
      <div style="flex:1;height:12px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${bar}%;background:${b.color};border-radius:4px;opacity:0.8;transition:width 0.4s"></div>
      </div>
      <div style="width:60px;text-align:right;font-size:11px;color:${b.color}">${counts[i]} (${pct}%)</div>
    </div>`;
  }).join("");
}

function _buildSparkline(values, color, label) {
  if (!values.length) return `<div class="econ-empty">Chưa đủ dữ liệu.</div>`;
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
      <text x="${W - pad}" y="${H - pad + 2}" text-anchor="end" font-size="10" fill="${color}">${_fmt(lastVal)}</text>
      <text x="${pad}" y="${pad + 8}" font-size="9" fill="rgba(255,255,255,0.4)">${label}</text>
    </svg>
  </div>`;
}

function _miniBar(label, val, maxVal, color, rate) {
  const pct = Math.min(100, Math.round(val / Math.max(maxVal, 1) * 100));
  const rateStr = rate > 0 ? `<span style="color:#4ade80;font-size:10px">+${_fmt(rate)}/tick</span>`
                           : rate < 0 ? `<span style="color:#f87171;font-size:10px">${_fmt(rate)}/tick</span>` : "";
  return `<div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
      <span style="color:var(--white-dim)">${label}</span>
      <div style="display:flex;gap:6px;align-items:center">
        ${rateStr}
        <span style="color:${color};font-weight:700">${_fmt(val)}</span>
      </div>
    </div>
    <div style="height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.4s"></div>
    </div>
  </div>`;
}

function _fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}
