(function() {
"use strict";
// ============================================================
// CONTINENT ENGINE V26 — Creator God V6
// Mở rộng continentEngine.js (V2) — KHÔNG ghi đè
// Thêm: Dân số · Tài nguyên · Khí hậu · Ảnh hưởng · Công nghệ
//       Chiến tranh lục địa · Xếp hạng · Mở rộng lãnh thổ
//       Phân cấp: Thế Giới → Lục Địa → Vương Quốc → Lãnh Thổ → Thành Phố
// ============================================================

const SAVE_KEY = "cgv6_continent_v26";
const INIT_DELAY = 3500;

// ─── STATE ────────────────────────────────────────────────────
window.ceV26Data = {
  continents: {},   // keyed by continent id
  wars: [],         // active continental wars
  warHistory: [],
  rankings: [],     // sorted continent ranking snapshots
  log: [],
  tickCount: 0,
  initialized: false,
};

// ─── CONTINENT BASE DATA ──────────────────────────────────────
const CEV26_BASE = {
  tianshan: { climate: "Sơn Nhạc", baseTemp: -5,  rainMult: 0.6, techBonus: 1.3, infBonus: 1.1 },
  namminh:  { climate: "Hải Dương", baseTemp: 22,  rainMult: 1.4, techBonus: 1.0, infBonus: 1.5 },
  huanbac:  { climate: "Băng Tuyết", baseTemp: -20, rainMult: 0.4, techBonus: 0.8, infBonus: 0.7 },
  viemdia:  { climate: "Hỏa Diệm", baseTemp: 35,  rainMult: 0.3, techBonus: 1.1, infBonus: 0.9 },
  linhvuong:{ climate: "Linh Vân", baseTemp: 15,  rainMult: 1.1, techBonus: 1.4, infBonus: 1.3 },
  huyen:    { climate: "Huyền Bí", baseTemp: 10,  rainMult: 0.8, techBonus: 1.2, infBonus: 1.2 },
};

const WAR_CAUSES = ["Tranh chấp lãnh thổ","Tài nguyên cạn kiệt","Bá quyền lục địa","Báo thù huyết hận","Ý thức hệ xung đột","Tôn giáo thánh chiến","Thương mại đổ vỡ"];
const CLIMATE_EVENTS = {
  "Sơn Nhạc":  ["Tuyết lở đại quy mô","Linh mạch dịch chuyển","Địa chấn Thiên Sơn"],
  "Hải Dương": ["Đại triều thần","Bão biển hung hãn","San hô linh khí nở rộ"],
  "Băng Tuyết":["Băng hà tiến sâu","Đêm vĩnh cửu 30 năm","Tuyết quỷ thức tỉnh"],
  "Hỏa Diệm": ["Núi lửa liên hoàn","Mưa lửa thiên thạch","Sa mạc lan rộng"],
  "Linh Vân":  ["Linh vũ tứ mùa","Mây linh kết tụ","Thiên địa linh khí bùng phát"],
  "Huyền Bí":  ["Không gian rạn nứt","Thế giới song song xuất hiện","Bí cảnh tự mở"],
};

// ─── SAVE / LOAD ──────────────────────────────────────────────
function cev26Save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.ceV26Data)); } catch(e) {}
}
function cev26Load() {
  try {
    const d = localStorage.getItem(SAVE_KEY);
    if (d) {
      const p = JSON.parse(d);
      Object.assign(window.ceV26Data, p);
    }
  } catch(e) {}
}

// ─── LOG ──────────────────────────────────────────────────────
function cev26Log(msg, type) {
  const entry = { year: window.year || 0, msg, type: type || "info", tick: window.ceV26Data.tickCount };
  window.ceV26Data.log.unshift(entry);
  if (window.ceV26Data.log.length > 300) window.ceV26Data.log.pop();
  if (typeof window.htAddEvent === "function") window.htAddEvent({ year: window.year || 0, type: "continent", title: msg, color: "#a78bfa" });
}

// ─── HELPERS ──────────────────────────────────────────────────
function _rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function _getBaseContinents() {
  if (typeof ceState !== "undefined" && ceState.continents) return ceState.continents;
  return [];
}
function _getKingdoms() {
  if (typeof window.kingdomData !== "undefined" && window.kingdomData.kingdoms) return Object.values(window.kingdomData.kingdoms);
  return [];
}
function _getEmpires() {
  if (typeof window.empireData !== "undefined" && window.empireData.empires) return Object.values(window.empireData.empires);
  return [];
}
function _getCountries() {
  if (typeof window.countries !== "undefined") return window.countries;
  return [];
}

// ─── INIT CONTINENT DATA ──────────────────────────────────────
function cev26InitContinent(c) {
  const base = CEV26_BASE[c.id] || { climate: "Ôn Hòa", baseTemp: 15, rainMult: 1.0, techBonus: 1.0, infBonus: 1.0 };
  const pop = _rand(50000, 500000);
  return {
    id: c.id,
    name: c.name,
    icon: c.icon || "🌍",
    climate: base.climate,
    baseTemp: base.baseTemp,
    // Population
    population: pop,
    popGrowthRate: 0.02 + Math.random() * 0.03,
    populationHistory: [pop],
    // Resources
    resources: {
      spiritStones: _rand(80, 200),
      food: _rand(100, 300),
      ironOre: _rand(50, 180),
      gold: _rand(30, 120),
      lumber: _rand(60, 200),
    },
    resourceProd: {
      spiritStones: _rand(3, 12),
      food: _rand(8, 25),
      ironOre: _rand(4, 15),
      gold: _rand(2, 10),
      lumber: _rand(5, 18),
    },
    // Technology
    techLevel: _rand(1, 5),
    techProgress: Math.random() * 100,
    techBonus: base.techBonus,
    techFields: { military: _rand(1,5), agriculture: _rand(1,5), commerce: _rand(1,5), cultivation: _rand(1,5) },
    // Influence (0-100)
    influence: _rand(20, 80),
    infBonus: base.infBonus,
    influenceHistory: [],
    // Climate effects
    climateHealth: 100,
    climateEvents: [],
    lastClimateEvent: 0,
    // Hierarchy
    kingdoms: [],
    empires: [],
    territories: [],
    cities: [],
    // War
    atWarWith: [],
    warScore: 0,
    militaryStrength: _rand(100, 1000),
    // Economy
    gdp: _rand(1000, 10000),
    tradeBalance: 0,
    // Status
    stability: _rand(50, 100),
    dominantPower: null,
    age: 0,
  };
}

// ─── BUILD HIERARCHY ──────────────────────────────────────────
function cev26BuildHierarchy() {
  const d = window.ceV26Data;
  const baseContinents = _getBaseContinents();
  if (!baseContinents.length) return;

  // Init any missing continents
  baseContinents.forEach(c => {
    if (!d.continents[c.id]) {
      d.continents[c.id] = cev26InitContinent(c);
    }
  });

  // Assign kingdoms to continents based on region keywords
  const kingdoms = _getKingdoms();
  const empires = _getEmpires();
  const countries = _getCountries();

  baseContinents.forEach(c => {
    const cd = d.continents[c.id];
    if (!cd) return;
    const keywords = c.regionKeywords || [];

    cd.kingdoms = kingdoms.filter(k =>
      k && k.name && keywords.some(kw => k.name.toLowerCase().includes(kw.toLowerCase()))
    ).map(k => k.id || k.name);

    cd.empires = empires.filter(e =>
      e && e.name && keywords.some(kw => e.name.toLowerCase().includes(kw.toLowerCase()))
    ).map(e => e.id || e.name);

    // Count territories and cities from countries
    const assigned = countries.filter(co =>
      co && co.name && keywords.some(kw => co.name.toLowerCase().includes(kw.toLowerCase()))
    );
    cd.territories = assigned.map(co => co.name);
    cd.cities = assigned.reduce((acc, co) => {
      if (co.cities && Array.isArray(co.cities)) acc.push(...co.cities.map(ci => ci.name || ci));
      else if (co.capital) acc.push(co.capital);
      return acc;
    }, []);

    // Dominant power: empire > kingdom > country
    if (cd.empires.length) cd.dominantPower = { type: "empire", name: cd.empires[0] };
    else if (cd.kingdoms.length) cd.dominantPower = { type: "kingdom", name: cd.kingdoms[0] };
    else if (cd.territories.length) cd.dominantPower = { type: "country", name: cd.territories[0] };
    else cd.dominantPower = null;
  });
}

// ─── TICK: POPULATION ─────────────────────────────────────────
function cev26TickPopulation(cd) {
  if (!cd) return;
  const base = cd.popGrowthRate;
  const stabilityFactor = cd.stability / 100;
  const foodFactor = cd.resources.food > 50 ? 1.1 : 0.9;
  const warFactor = cd.atWarWith.length > 0 ? 0.85 : 1.0;
  const growth = Math.floor(cd.population * base * 0.01 * stabilityFactor * foodFactor * warFactor);
  cd.population = Math.max(1000, cd.population + growth);
  cd.populationHistory.push(cd.population);
  if (cd.populationHistory.length > 50) cd.populationHistory.shift();
}

// ─── TICK: RESOURCES ──────────────────────────────────────────
function cev26TickResources(cd) {
  if (!cd) return;
  Object.keys(cd.resourceProd).forEach(res => {
    const prod = cd.resourceProd[res];
    const consumption = Math.floor(prod * 0.6 + (cd.population / 100000) * 0.5);
    const warDrain = cd.atWarWith.length > 0 ? Math.floor(prod * 0.3) : 0;
    const techBoost = Math.floor(prod * (cd.techLevel * 0.05));
    cd.resources[res] = Math.max(0, (cd.resources[res] || 0) + prod + techBoost - consumption - warDrain);
    if (cd.resources[res] > 9999) cd.resources[res] = 9999;
  });
  // GDP
  const totalRes = Object.values(cd.resources).reduce((a,b) => a+b, 0);
  cd.gdp = Math.floor(totalRes * 10 * cd.techLevel * (cd.stability / 100));
}

// ─── TICK: TECHNOLOGY ─────────────────────────────────────────
function cev26TickTech(cd) {
  if (!cd) return;
  if (cd.techLevel >= 10) return;
  const gain = (cd.resources.gold > 30 ? 2 : 1) * cd.techBonus;
  cd.techProgress += gain;
  if (cd.techProgress >= 100) {
    cd.techProgress = 0;
    cd.techLevel = Math.min(10, cd.techLevel + 1);
    Object.keys(cd.techFields).forEach(f => { cd.techFields[f] = Math.min(10, cd.techFields[f] + 1); });
    cev26Log(`🔬 ${cd.name} đạt Cấp Độ Công Nghệ ${cd.techLevel}!`, "tech");
  }
}

// ─── TICK: INFLUENCE ──────────────────────────────────────────
function cev26TickInfluence(cd) {
  if (!cd) return;
  const cultFactor = (cd.techLevel / 10) * 0.3;
  const gdpFactor = (cd.gdp / 50000) * 0.2;
  const warFactor = cd.atWarWith.length > 0 ? -5 : 2;
  cd.influence = Math.max(0, Math.min(100, cd.influence + cultFactor + gdpFactor + warFactor));
  cd.influenceHistory.push(Math.round(cd.influence));
  if (cd.influenceHistory.length > 30) cd.influenceHistory.shift();
}

// ─── TICK: CLIMATE ────────────────────────────────────────────
function cev26TickClimate(cd) {
  if (!cd) return;
  if ((window.year || 0) - cd.lastClimateEvent < 30) return;
  if (Math.random() > 0.04) return;
  const evts = CLIMATE_EVENTS[cd.climate] || ["Thời tiết bất thường"];
  const evt = _pick(evts);
  cd.climateEvents.unshift({ year: window.year || 0, event: evt });
  if (cd.climateEvents.length > 20) cd.climateEvents.pop();
  cd.lastClimateEvent = window.year || 0;
  // Impact
  const impact = _rand(-15, -5);
  cd.stability = Math.max(10, cd.stability + impact);
  cd.resources.food = Math.max(0, cd.resources.food + _rand(-20, -10));
  cev26Log(`🌪️ ${cd.name}: ${evt}! Ổn định -${Math.abs(impact)}`, "climate");
}

// ─── CONTINENTAL WARS ─────────────────────────────────────────
function cev26TryStartWar() {
  if (!window.ceV26Data.continents) return;
  if (Math.random() > 0.015) return;

  const cids = Object.keys(window.ceV26Data.continents);
  if (cids.length < 2) return;

  // Pick two random continents not already at war with each other
  const a = _pick(cids);
  const b = _pick(cids.filter(x => x !== a));
  if (!a || !b) return;
  const ca = window.ceV26Data.continents[a];
  const cb = window.ceV26Data.continents[b];
  if (!ca || !cb) return;
  if (ca.atWarWith.includes(b)) return;

  const cause = _pick(WAR_CAUSES);
  const war = {
    id: "cw_" + Date.now(),
    attacker: a, attackerName: ca.name,
    defender: b, defenderName: cb.name,
    cause,
    startYear: window.year || 0,
    endYear: null,
    attackerScore: 0,
    defenderScore: 0,
    status: "active",
  };
  window.ceV26Data.wars.push(war);
  ca.atWarWith.push(b);
  cb.atWarWith.push(a);
  cev26Log(`⚔️ CHIẾN TRANH LỤC ĐỊA: ${ca.name} tuyên chiến ${cb.name}! Nguyên nhân: ${cause}`, "war");
}

function cev26TickWars() {
  const d = window.ceV26Data;
  d.wars.filter(w => w.status === "active").forEach(w => {
    const ca = d.continents[w.attacker];
    const cb = d.continents[w.defender];
    if (!ca || !cb) return;

    // Battle roll
    const atkPow = (ca.militaryStrength * (ca.techFields.military / 5)) + _rand(-50, 50);
    const defPow = (cb.militaryStrength * (cb.techFields.military / 5)) + _rand(-50, 50);

    if (atkPow > defPow) {
      w.attackerScore += _rand(3, 10);
      cb.stability = Math.max(5, cb.stability - _rand(1, 4));
      cb.resources.food = Math.max(0, cb.resources.food - _rand(5, 15));
    } else {
      w.defenderScore += _rand(3, 10);
      ca.stability = Math.max(5, ca.stability - _rand(1, 4));
      ca.resources.food = Math.max(0, ca.resources.food - _rand(5, 15));
    }

    // End war after score threshold or 100 years
    const yearsPassed = (window.year || 0) - w.startYear;
    const threshold = 150;
    if (w.attackerScore >= threshold || w.defenderScore >= threshold || yearsPassed >= 100) {
      w.status = "ended";
      w.endYear = window.year || 0;
      ca.atWarWith = ca.atWarWith.filter(x => x !== w.defender);
      cb.atWarWith = cb.atWarWith.filter(x => x !== w.attacker);
      const winner = w.attackerScore >= threshold ? ca.name : cb.name;
      const loser = w.attackerScore >= threshold ? cb.name : ca.name;
      // Winner gains influence and resources
      const winC = w.attackerScore >= threshold ? ca : cb;
      const loseC = w.attackerScore >= threshold ? cb : ca;
      winC.influence = Math.min(100, winC.influence + 10);
      winC.militaryStrength += 50;
      loseC.stability = Math.max(10, loseC.stability - 20);
      loseC.resources.gold = Math.max(0, loseC.resources.gold - 30);
      winC.resources.gold += 20;

      d.warHistory.unshift(w);
      if (d.warHistory.length > 50) d.warHistory.pop();
      cev26Log(`🏆 CHIẾN TRANH KẾT THÚC: ${winner} đánh bại ${loser}!`, "war_end");
    }
  });
  // Remove ended wars from active list
  d.wars = d.wars.filter(w => w.status === "active");
}

// ─── CONTINENTAL RANKINGS ─────────────────────────────────────
function cev26UpdateRankings() {
  const cids = Object.keys(window.ceV26Data.continents);
  const rankings = cids.map(id => {
    const c = window.ceV26Data.continents[id];
    if (!c) return null;
    const power = Math.floor(
      (c.population / 1000) * 0.3 +
      c.techLevel * 200 +
      c.militaryStrength * 0.5 +
      c.gdp * 0.01 +
      c.influence * 5
    );
    return { id, name: c.name, icon: c.icon, power, pop: c.population, tech: c.techLevel, influence: Math.round(c.influence), gdp: c.gdp, stability: Math.round(c.stability) };
  }).filter(Boolean);

  rankings.sort((a, b) => b.power - a.power);
  window.ceV26Data.rankings = rankings;
}

// ─── EXPANSION ────────────────────────────────────────────────
function cev26TickExpansion(cd) {
  if (!cd) return;
  if (cd.stability < 60) return;
  if (cd.techLevel < 3) return;
  if (Math.random() > 0.02) return;
  // Gain a new territory
  const newTerrName = `${cd.name.split(" ")[0]} ${_pick(["Vùng Biên","Thuộc Địa","Tân Lãnh","Đất Chiếm","Tiền Đồn"])}`;
  cd.territories.push(newTerrName);
  cd.population += _rand(5000, 20000);
  cd.resources.food += _rand(10, 30);
  cev26Log(`🗺️ ${cd.name} mở rộng lãnh thổ: thêm ${newTerrName}`, "expand");
}

// ─── STABILITY RECOVERY ───────────────────────────────────────
function cev26TickStability(cd) {
  if (!cd) return;
  if (cd.atWarWith.length === 0 && cd.stability < 100) {
    cd.stability = Math.min(100, cd.stability + 0.5);
  }
}

// ─── MAIN TICK ────────────────────────────────────────────────
function cev26Tick() {
  const d = window.ceV26Data;
  d.tickCount++;
  if (!d.initialized) return;

  // Rebuild hierarchy every 20 ticks
  if (d.tickCount % 20 === 0) cev26BuildHierarchy();

  Object.values(d.continents).forEach(cd => {
    cev26TickPopulation(cd);
    cev26TickResources(cd);
    cev26TickTech(cd);
    cev26TickInfluence(cd);
    cev26TickStability(cd);
    if (d.tickCount % 5 === 0) cev26TickClimate(cd);
    if (d.tickCount % 3 === 0) cev26TickExpansion(cd);
  });

  if (d.tickCount % 2 === 0) cev26TryStartWar();
  cev26TickWars();
  if (d.tickCount % 10 === 0) cev26UpdateRankings();
  if (d.tickCount % 30 === 0) cev26Save();
}

// ─── RENDER PANEL ─────────────────────────────────────────────
window.cev26RenderPanel = function() {
  const el = document.getElementById("panel-continent-v26");
  if (!el) return;
  const d = window.ceV26Data;
  const cids = Object.keys(d.continents);
  if (!cids.length) {
    el.innerHTML = `<div style="color:#94a3b8;text-align:center;padding:40px">⏳ Đang khởi tạo dữ liệu lục địa V26...</div>`;
    return;
  }

  const totalPop = cids.reduce((s,id) => s + (d.continents[id]?.population || 0), 0);
  const activeWars = d.wars.length;

  let html = `
  <div style="padding:16px;font-family:'Noto Serif SC',serif;color:#e2e8f0">
    <!-- HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div style="font-size:1.3em;color:#a78bfa;font-weight:bold">🌎 Lục Địa V26 — Hệ Thống Phân Cấp</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">👥 ${(totalPop/10000).toFixed(1)}万 dân</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">⚔️ ${activeWars} chiến tranh</span>
        <span style="background:#1e293b;padding:4px 10px;border-radius:8px;font-size:0.85em">📅 Năm ${window.year || 0}</span>
      </div>
    </div>

    <!-- HIERARCHY LEGEND -->
    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px;margin-bottom:14px;font-size:0.82em;color:#94a3b8">
      🌐 <b>Thế Giới</b> → 🌍 <b>Lục Địa</b> → 👑 <b>Vương Quốc / Đế Chế</b> → 🏳️ <b>Lãnh Thổ</b> → 🏙️ <b>Thành Phố</b>
    </div>

    <!-- RANKINGS TABLE -->
    <div style="margin-bottom:16px">
      <div style="color:#fbbf24;font-weight:bold;margin-bottom:8px;font-size:1em">🏆 Bảng Xếp Hạng Lục Địa</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82em">
        <tr style="color:#94a3b8;border-bottom:1px solid #334155">
          <th style="text-align:left;padding:5px 8px">#</th>
          <th style="text-align:left;padding:5px 8px">Lục Địa</th>
          <th style="text-align:right;padding:5px 8px">Dân Số</th>
          <th style="text-align:right;padding:5px 8px">Công Nghệ</th>
          <th style="text-align:right;padding:5px 8px">Ảnh Hưởng</th>
          <th style="text-align:right;padding:5px 8px">GDP</th>
          <th style="text-align:right;padding:5px 8px">Ổn Định</th>
        </tr>
        ${d.rankings.map((r, i) => `
          <tr style="border-bottom:1px solid #1e293b;background:${i===0?'rgba(167,139,250,0.08)':''}">
            <td style="padding:5px 8px;color:${i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#b45309':'#64748b'}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
            <td style="padding:5px 8px">${r.icon || '🌍'} ${r.name}</td>
            <td style="padding:5px 8px;text-align:right;color:#4ade80">${(r.pop/10000).toFixed(1)}万</td>
            <td style="padding:5px 8px;text-align:right;color:#38bdf8">Lv.${r.tech}</td>
            <td style="padding:5px 8px;text-align:right;color:#c084fc">${r.influence}%</td>
            <td style="padding:5px 8px;text-align:right;color:#facc15">${r.gdp.toLocaleString()}</td>
            <td style="padding:5px 8px;text-align:right;color:${r.stability>70?'#4ade80':r.stability>40?'#facc15':'#f87171'}">${r.stability}%</td>
          </tr>
        `).join("")}
      </table>
    </div>

    <!-- CONTINENT CARDS -->
    <div style="margin-bottom:16px">
      <div style="color:#a78bfa;font-weight:bold;margin-bottom:10px;font-size:1em">🗺️ Chi Tiết Lục Địa</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">
        ${cids.map(id => {
          const c = d.continents[id];
          if (!c) return "";
          const isAtWar = c.atWarWith.length > 0;
          const warEnemies = c.atWarWith.map(eid => d.continents[eid]?.name || eid).join(", ");
          return `
          <div style="background:#0f172a;border:1px solid ${isAtWar?'#f87171':'#334155'};border-radius:10px;padding:12px;position:relative">
            ${isAtWar ? `<div style="position:absolute;top:8px;right:8px;background:#7f1d1d;color:#fca5a5;font-size:0.75em;padding:2px 7px;border-radius:10px">⚔️ Chiến tranh</div>` : ''}
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <span style="font-size:1.5em">${c.icon || '🌍'}</span>
              <div>
                <div style="color:#e2e8f0;font-weight:bold">${c.name}</div>
                <div style="color:#64748b;font-size:0.8em">🌡️ ${c.climate} · ${c.baseTemp}°C</div>
              </div>
            </div>

            <!-- STATS ROW -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.8em;margin-bottom:10px">
              <div style="background:#1e293b;padding:5px 8px;border-radius:6px">
                <span style="color:#94a3b8">👥 Dân số</span><br>
                <span style="color:#4ade80;font-weight:bold">${c.population.toLocaleString()}</span>
              </div>
              <div style="background:#1e293b;padding:5px 8px;border-radius:6px">
                <span style="color:#94a3b8">🔬 Công nghệ</span><br>
                <span style="color:#38bdf8;font-weight:bold">Lv.${c.techLevel} <span style="color:#64748b">(${Math.round(c.techProgress)}%)</span></span>
              </div>
              <div style="background:#1e293b;padding:5px 8px;border-radius:6px">
                <span style="color:#94a3b8">💫 Ảnh hưởng</span><br>
                <div style="background:#0f172a;border-radius:4px;height:6px;margin-top:4px">
                  <div style="background:#c084fc;height:6px;border-radius:4px;width:${c.influence}%"></div>
                </div>
                <span style="color:#c084fc">${Math.round(c.influence)}%</span>
              </div>
              <div style="background:#1e293b;padding:5px 8px;border-radius:6px">
                <span style="color:#94a3b8">⚖️ Ổn định</span><br>
                <div style="background:#0f172a;border-radius:4px;height:6px;margin-top:4px">
                  <div style="background:${c.stability>70?'#4ade80':c.stability>40?'#facc15':'#f87171'};height:6px;border-radius:4px;width:${c.stability}%"></div>
                </div>
                <span style="color:${c.stability>70?'#4ade80':c.stability>40?'#facc15':'#f87171'}">${Math.round(c.stability)}%</span>
              </div>
            </div>

            <!-- RESOURCES -->
            <div style="font-size:0.78em;color:#94a3b8;margin-bottom:8px">
              <span style="color:#64748b">📦 Tài nguyên:</span>
              💎${c.resources.spiritStones} 🍞${c.resources.food} ⚙️${c.resources.ironOre} 🪙${c.resources.gold} 🪵${c.resources.lumber}
            </div>

            <!-- HIERARCHY -->
            <div style="font-size:0.78em;margin-bottom:8px;background:#1e293b;padding:6px 8px;border-radius:6px">
              <div style="color:#fbbf24">⛓️ Phân cấp:</div>
              ${c.empires.length ? `<div>👑 Đế chế: ${c.empires.slice(0,2).join(", ")}${c.empires.length>2?' ...':''}</div>` : ''}
              ${c.kingdoms.length ? `<div>🏰 Vương quốc: ${c.kingdoms.slice(0,2).join(", ")}${c.kingdoms.length>2?' ...':''}</div>` : ''}
              <div>🏳️ Lãnh thổ: ${c.territories.length} vùng</div>
              <div>🏙️ Thành phố: ${c.cities.length}</div>
              ${c.dominantPower ? `<div>⚡ Bá chủ: <span style="color:#fbbf24">${c.dominantPower.name}</span></div>` : ''}
            </div>

            <!-- TECH FIELDS -->
            <div style="font-size:0.77em;color:#94a3b8;margin-bottom:8px">
              ⚔️Quân sự ${c.techFields.military} &nbsp;🌾Nông nghiệp ${c.techFields.agriculture} &nbsp;💹Thương mại ${c.techFields.commerce} &nbsp;🌀Tu luyện ${c.techFields.cultivation}
            </div>

            ${isAtWar ? `<div style="background:#450a0a;color:#fca5a5;font-size:0.78em;padding:4px 8px;border-radius:5px">⚔️ Đang chiến tranh với: ${warEnemies}</div>` : ''}
            ${c.climateEvents.length ? `<div style="color:#64748b;font-size:0.77em;margin-top:6px">🌪️ Sự kiện gần nhất: ${c.climateEvents[0].event} (${c.climateEvents[0].year})</div>` : ''}
          </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- ACTIVE WARS -->
    ${d.wars.length ? `
    <div style="margin-bottom:16px">
      <div style="color:#f87171;font-weight:bold;margin-bottom:8px">⚔️ Chiến Tranh Đang Diễn Ra (${d.wars.length})</div>
      ${d.wars.map(w => `
        <div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px;margin-bottom:8px;font-size:0.85em">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#fca5a5">⚔️ ${w.attackerName} <span style="color:#64748b">vs</span> ${w.defenderName}</span>
            <span style="color:#64748b">Năm ${w.startYear}</span>
          </div>
          <div style="color:#94a3b8;margin-bottom:6px">Nguyên nhân: ${w.cause}</div>
          <div style="display:flex;gap:16px">
            <div>🗡️ Tấn công: <span style="color:#fb923c">${w.attackerScore}/150</span></div>
            <div>🛡️ Phòng thủ: <span style="color:#38bdf8">${w.defenderScore}/150</span></div>
          </div>
          <div style="background:#0f172a;border-radius:4px;height:6px;margin-top:6px;position:relative">
            <div style="background:#fb923c;height:6px;border-radius:4px 0 0 4px;width:${Math.min(100, w.attackerScore/150*50)}%"></div>
          </div>
        </div>
      `).join("")}
    </div>` : ''}

    <!-- WAR HISTORY -->
    ${d.warHistory.length ? `
    <div style="margin-bottom:16px">
      <div style="color:#94a3b8;font-weight:bold;margin-bottom:8px">📜 Lịch Sử Chiến Tranh Lục Địa (${d.warHistory.length})</div>
      <div style="max-height:200px;overflow-y:auto;font-size:0.82em">
        ${d.warHistory.slice(0,15).map(w => {
          const winner = w.attackerScore >= 150 ? w.attackerName : w.defenderName;
          return `<div style="border-bottom:1px solid #1e293b;padding:5px 0;color:#64748b">🏆 <span style="color:#fbbf24">${winner}</span> thắng · ${w.attackerName} vs ${w.defenderName} · ${w.cause} · ${w.startYear}–${w.endYear}</div>`;
        }).join("")}
      </div>
    </div>` : ''}

    <!-- LOG -->
    <div>
      <div style="color:#64748b;font-weight:bold;margin-bottom:8px;font-size:0.9em">📋 Nhật Ký Lục Địa V26</div>
      <div style="max-height:180px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;font-size:0.8em">
        ${d.log.slice(0,30).map(e => `<div style="border-bottom:1px solid #1e293b;padding:3px 0;color:#94a3b8">[${e.year}] ${e.msg}</div>`).join("") || '<div style="color:#475569">Chưa có sự kiện.</div>'}
      </div>
    </div>
  </div>`;

  el.innerHTML = html;
};

// ─── INIT ─────────────────────────────────────────────────────
function cev26Init() {
  cev26Load();
  cev26BuildHierarchy();
  cev26UpdateRankings();
  window.ceV26Data.initialized = true;

  // Hook vào gameTick
  const _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    try { cev26Tick(); } catch(e) {}
  };
  console.log("[ContinentEngineV26] 🌎 V26 khởi động — Phân cấp · Chiến tranh · Xếp hạng · Mở rộng ✓");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(cev26Init, INIT_DELAY); });
} else {
  setTimeout(cev26Init, INIT_DELAY);
}

})();
