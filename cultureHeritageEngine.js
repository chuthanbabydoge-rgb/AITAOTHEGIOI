// ═══════════════════════════════════════════════════════════════
// CULTURE & HERITAGE ENGINE V1 — Creator God World Simulator V23
// Văn Hóa · Di Sản · Đế Quốc Mềm · Kỳ Quan · Đồng Hóa
// ═══════════════════════════════════════════════════════════════

(function() {
"use strict";

const STORAGE_KEY = "cgv6_culture_heritage";

// ─── CULTURE STYLE DEFINITIONS ────────────────────────────────────
const CULTURE_STYLES = {
  GRAND_ARCH: {
    id: "GRAND_ARCH", label: "Kiến Trúc Hùng Vĩ", icon: "🏛️",
    color: "#fbbf24", desc: "Cung điện, đền đài, thành trì vĩ đại — biểu tượng quyền lực trường tồn.",
    bonuses: { stability: +8, softPower: +12, population: +5 },
    wonderType: "Cung Điện / Đền Thờ",
    spreadChance: 0.14,
  },
  FINE_ARTS: {
    id: "FINE_ARTS", label: "Nghệ Thuật Đỉnh Cao", icon: "🎨",
    color: "#f472b6", desc: "Hội họa, điêu khắc, âm nhạc — tâm hồn của nền văn minh.",
    bonuses: { softPower: +18, tech: +5 },
    wonderType: "Kiệt Tác Nghệ Thuật",
    spreadChance: 0.20,
  },
  LITERATURE: {
    id: "LITERATURE", label: "Văn Học & Triết Học", icon: "📚",
    color: "#a78bfa", desc: "Sách vở, trường học, triết thuyết — tri thức vượt thời gian.",
    bonuses: { tech: +15, softPower: +10 },
    wonderType: "Thư Viện Vĩ Đại / Học Viện",
    spreadChance: 0.16,
  },
  WARRIOR: {
    id: "WARRIOR", label: "Văn Hóa Chiến Binh", icon: "⚔️",
    color: "#f87171", desc: "Bộ luật chiến binh, truyền thống võ thuật, danh dự chiến trường.",
    bonuses: { military: +15, softPower: +6 },
    wonderType: "Chiến Thần Điện / Trường Đào Tạo",
    spreadChance: 0.11,
  },
  MARITIME: {
    id: "MARITIME", label: "Văn Hóa Hàng Hải", icon: "🚢",
    color: "#38bdf8", desc: "Đi biển, thương mại xa xôi, khám phá vùng đất mới.",
    bonuses: { economy: +12, softPower: +8 },
    wonderType: "Hải Cảng Huyền Thoại",
    spreadChance: 0.18,
  },
  MYSTICAL: {
    id: "MYSTICAL", label: "Huyền Bí Học", icon: "🔮",
    color: "#c084fc", desc: "Ma thuật, tiên tri, giả kim thuật — bí ẩn và quyền năng.",
    bonuses: { tech: +8, stability: +6, softPower: +10 },
    wonderType: "Tháp Phù Thủy / Đài Thiên Văn",
    spreadChance: 0.13,
  },
  PERFORMING: {
    id: "PERFORMING", label: "Nghệ Thuật Sân Khấu", icon: "🎭",
    color: "#fb923c", desc: "Hội hè, ca múa nhạc kịch — văn hóa đại chúng thống nhất lòng dân.",
    bonuses: { stability: +12, softPower: +14, population: +3 },
    wonderType: "Đại Nhạc Đường / Vũ Đài Hoàng Gia",
    spreadChance: 0.22,
  },
  AGRARIAN: {
    id: "AGRARIAN", label: "Nông Canh Truyền Thống", icon: "🌾",
    color: "#86efac", desc: "Kỹ thuật canh tác, lễ hội mùa màng, giao ước với đất đai.",
    bonuses: { population: +15, stability: +8 },
    wonderType: "Đại Nông Trường / Đền Thổ Thần",
    spreadChance: 0.15,
  },
};

const WONDER_NAMES = [
  "Cung Điện Vạn Thế","Đại Thư Viện Thiên Hạ","Tháp Trời Cao","Đại Nhạc Đường Hoàng Kim",
  "Vườn Treo Bất Tử","Cổng Thành Sấm Sét","Lăng Mộ Vĩnh Hằng","Đài Thiên Văn Cửu Tinh",
  "Hải Cảng Bốn Biển","Chiến Thần Tượng Đài","Trường Học Muôn Thuở","Pháp Đường Tối Thượng",
];

const HERITAGE_EPITHETS = [
  "Huy Hoàng","Bất Diệt","Thần Thánh","Truyền Kỳ","Cổ Đại","Huyền Bí","Vĩ Đại","Cao Quý",
];

const FESTIVAL_TYPES = {
  GRAND_ARCH:  { name: "Lễ Khánh Thành Cung Điện",    icon: "🏛️", desc: "Mở cửa cung điện đón dân chúng bốn phương.", bonuses: { softPower: 20, stability: 12 }, spreadBoost: 15 },
  FINE_ARTS:   { name: "Đại Hội Nghệ Thuật Hoàng Kim", icon: "🎨", desc: "Triển lãm kiệt tác, nhạc hội, tranh thi.",    bonuses: { softPower: 28, tech: 8 },       spreadBoost: 22 },
  LITERATURE:  { name: "Hội Sách & Triết Học",         icon: "📚", desc: "Học giả khắp nơi hội tụ tranh biện.",         bonuses: { tech: 20, softPower: 12 },      spreadBoost: 18 },
  WARRIOR:     { name: "Võ Đài Thiên Hạ Đệ Nhất",     icon: "⚔️", desc: "Đấu sĩ tứ phương tề tựu tranh tài.",         bonuses: { softPower: 15, military: 18 },  spreadBoost: 12 },
  MARITIME:    { name: "Lễ Hội Biển Lớn",              icon: "🚢", desc: "Đoàn thuyền diễu hành, giao thương mở rộng.", bonuses: { economy: 20, softPower: 14 },   spreadBoost: 20 },
  MYSTICAL:    { name: "Đêm Huyền Bí Ngàn Sao",        icon: "🔮", desc: "Lễ tiên tri, triển lãm phép thuật kỳ bí.",   bonuses: { softPower: 18, stability: 10 }, spreadBoost: 14 },
  PERFORMING:  { name: "Đại Nhạc Hội Hoàng Gia",       icon: "🎭", desc: "Ca vũ kịch trình diễn suốt bảy ngày bảy đêm.", bonuses: { stability: 20, softPower: 24 }, spreadBoost: 26 },
  AGRARIAN:    { name: "Lễ Hội Mùa Màng Bội Thu",      icon: "🌾", desc: "Cúng tế Thổ Thần, chia sẻ sản vật với láng giềng.", bonuses: { population: 18, stability: 14 }, spreadBoost: 16 },
};

// ─── STATE ────────────────────────────────────────────────────────
let state = {
  powerCultures:  {},   // powerName → { styleId, points, level, wonders:[], softPowerMap:{} }
  heritages:      [],   // { id, fromPower, styleId, name, year, adopted:[] }
  wonders:        [],   // { id, owner, styleId, name, year, effect }
  festivals:      [],   // { id, host, styleId, name, year, attendees:[], bonuses, spreadBoost }
  festivalCooldown: {}, // powerName → year of last festival
  influence:      {},   // "powerA|powerB" → softPower score 0-100
  culturalLog:    [],
  idCounter:      0,
  initialized:    false,
};

// ─── SAVE / LOAD ─────────────────────────────────────────────────
function chSave() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function chLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────
function _year() { return (typeof window.year !== "undefined") ? window.year : 0; }
function _newId() { return "ch_" + (++state.idCounter) + "_" + Date.now(); }

function _log(msg, type) {
  state.culturalLog.unshift({ year: _year(), msg, type: type || "info" });
  if (state.culturalLog.length > 200) state.culturalLog.pop();
  if (typeof addLog === "function") addLog("[Văn Hóa] " + msg, type || "info");
  if (typeof htAddEvent === "function") htAddEvent({ year: _year(), text: msg, tag: "culture" });
}

function _getPowers() {
  const powers = [];
  if (window.kingdoms) window.kingdoms.forEach(k => { if (k.active !== false) powers.push({ name: k.name, type: "kingdom", pop: k.population||500 }); });
  if (window.empires)  window.empires.forEach(e  => { if (!e.collapsed) powers.push({ name: e.name, type: "empire", pop: e.totalPop||2000 }); });
  if (window.countries && powers.length === 0)
    window.countries.filter(c => !c.collapsed).slice(0,12).forEach(c => powers.push({ name: c.name, type: "nation", pop: c.population||500 }));
  return powers;
}

function _getCulture(powerName) {
  if (!state.powerCultures[powerName]) return null;
  return state.powerCultures[powerName];
}

function _cultureLevel(points) {
  if (points >= 500) return { level: 5, label: "Đế Quốc Văn Minh" };
  if (points >= 300) return { level: 4, label: "Văn Minh Rực Rỡ" };
  if (points >= 150) return { level: 3, label: "Văn Hóa Phát Triển" };
  if (points >= 50)  return { level: 2, label: "Văn Hóa Định Hình" };
  return { level: 1, label: "Văn Hóa Sơ Khai" };
}

function _pairKey(a, b) { return [a,b].sort().join("|"); }

// ─── CORE ACTIONS ─────────────────────────────────────────────────
function chAdoptStyle(powerName, styleId) {
  const style = CULTURE_STYLES[styleId];
  if (!style) return { ok: false, msg: "Phong cách văn hóa không tồn tại" };

  const existing = state.powerCultures[powerName];
  state.powerCultures[powerName] = {
    styleId,
    points: existing ? Math.max(20, existing.points) : 20,
    level: 1,
    adoptedYear: _year(),
    wonders: existing ? existing.wonders : [],
    softPowerMap: existing ? existing.softPowerMap : {},
  };

  // Apply bonuses
  if (window.countries) {
    const c = window.countries.find(x => x.name === powerName);
    if (c) {
      if (style.bonuses.stability)  c.stability  = Math.max(0, Math.min(100, (c.stability||50)  + style.bonuses.stability));
      if (style.bonuses.economy)    c.economy    = Math.max(0, (c.economy||10)   + style.bonuses.economy);
      if (style.bonuses.military)   c.military   = Math.max(0, (c.military||5)   + style.bonuses.military);
      if (style.bonuses.population) c.population = Math.max(0, (c.population||100) + style.bonuses.population * 100);
    }
  }

  if (existing && existing.styleId !== styleId) {
    _log(`🔄 ${powerName} chuyển từ ${CULTURE_STYLES[existing.styleId]?.icon||''} ${CULTURE_STYLES[existing.styleId]?.label||''} sang ${style.icon} ${style.label}`, "important");
  } else {
    _log(`${style.icon} ${powerName} hình thành nền văn hóa: ${style.label}`, "important");
  }

  if (typeof toast === "function") toast(`${style.icon} ${powerName}: Văn hóa ${style.label}!`, "important");
  chSave();
  chRenderPanel();
  return { ok: true };
}

function chDevelopCulture(powerName, amount) {
  const pc = state.powerCultures[powerName];
  if (!pc) return { ok: false, msg: `${powerName} chưa có nền văn hóa` };

  const gain = amount || (10 + Math.floor(Math.random() * 15));
  pc.points += gain;

  const lvInfo = _cultureLevel(pc.points);
  const wasLevel = pc.level;
  pc.level = lvInfo.level;

  if (lvInfo.level > wasLevel) {
    _log(`⬆️ ${powerName} đạt cấp văn hóa mới: ${lvInfo.label}!`, "important");
    if (typeof toast === "function") toast(`🎨 ${powerName} văn hóa lên cấp: ${lvInfo.label}!`, "success");

    // Level milestone: create a wonder
    if (lvInfo.level >= 3) chCreateWonder(powerName);
  }

  chSave();
  return { ok: true, points: pc.points, level: lvInfo };
}

function chCreateWonder(powerName) {
  const pc = state.powerCultures[powerName];
  if (!pc) return { ok: false };

  const style = CULTURE_STYLES[pc.styleId];
  const name  = WONDER_NAMES[Math.floor(Math.random()*WONDER_NAMES.length)];
  const fullName = name + " " + HERITAGE_EPITHETS[Math.floor(Math.random()*HERITAGE_EPITHETS.length)];

  const wonder = {
    id:       _newId(),
    owner:    powerName,
    styleId:  pc.styleId,
    name:     fullName,
    type:     style.wonderType,
    year:     _year(),
    softPowerBonus: 15 + Math.floor(Math.random() * 20),
  };
  state.wonders.push(wonder);
  if (!pc.wonders) pc.wonders = [];
  pc.wonders.push(wonder.id);

  _log(`✨ ${powerName} hoàn thành kỳ quan: "${fullName}" (${style.wonderType})`, "success");
  if (typeof toast === "function") toast(`✨ Kỳ Quan! ${powerName}: "${fullName}"`, "success");
  chSave();
  return { ok: true, wonder };
}

function chLeaveHeritage(powerName) {
  const pc = state.powerCultures[powerName];
  if (!pc || pc.level < 2) return { ok: false };

  const style = CULTURE_STYLES[pc.styleId];
  const epithet = HERITAGE_EPITHETS[Math.floor(Math.random()*HERITAGE_EPITHETS.length)];
  const heritage = {
    id:       _newId(),
    fromPower: powerName,
    styleId:  pc.styleId,
    name:     `Di Sản ${style?.label||''} ${epithet} của ${powerName}`,
    year:     _year(),
    points:   pc.points,
    adopted:  [],
    wonders:  pc.wonders ? [...pc.wonders] : [],
  };
  state.heritages.push(heritage);
  _log(`🏺 ${powerName} sụp đổ nhưng để lại Di Sản: "${heritage.name}"`, "important");
  if (typeof htAddEvent === "function") htAddEvent({ year: _year(), text: `🏺 Di Sản ${heritage.name} được lưu lại cho hậu thế`, tag: "heritage" });
  chSave();
  return { ok: true, heritage };
}

function chAdoptHeritage(powerName, heritageId) {
  const heritage = state.heritages.find(h => h.id === heritageId);
  if (!heritage) return { ok: false, msg: "Di sản không tồn tại" };
  if (heritage.adopted.includes(powerName)) return { ok: false, msg: `${powerName} đã tiếp nhận di sản này rồi` };

  heritage.adopted.push(powerName);
  const bonus = Math.floor(heritage.points * 0.3);
  chAdoptStyle(powerName, heritage.styleId);
  chDevelopCulture(powerName, bonus);

  _log(`🏺 ${powerName} tiếp nhận "${heritage.name}" (+${bonus} điểm văn hóa)`, "success");
  chSave();
  chRenderPanel();
  return { ok: true, bonus };
}

function chSpreadCulture(fromPower, toPower) {
  const pc = state.powerCultures[fromPower];
  if (!pc) return;

  const style = CULTURE_STYLES[pc.styleId];
  const k = _pairKey(fromPower, toPower);
  state.influence[k] = Math.min(100, (state.influence[k] || 0) + (style?.spreadChance || 0.15) * 30);

  const targetPC = state.powerCultures[toPower];
  if (!targetPC && state.influence[k] > 60 && Math.random() < 0.3) {
    chAdoptStyle(toPower, pc.styleId);
    _log(`🌐 Văn hóa ${style?.label||''} của ${fromPower} lan tới ${toPower} qua Đế Quốc Mềm!`, "success");
  }
  chSave();
}

function chAssimilate(conqueror, conquered) {
  const pc = state.powerCultures[conqueror];
  if (!pc) return { ok: false, msg: `${conqueror} chưa có văn hóa` };
  chAdoptStyle(conquered, pc.styleId);
  chDevelopCulture(conqueror, 20);
  _log(`🔄 ${conqueror} đồng hóa văn hóa ${conquered} — ${CULTURE_STYLES[pc.styleId]?.label} lan rộng!`);
  chSave();
  return { ok: true };
}

// ─── FESTIVAL SYSTEM ──────────────────────────────────────────────
function chHostFestival(powerName) {
  const pc = state.powerCultures[powerName];
  if (!pc) return { ok: false, msg: `${powerName} chưa có văn hóa` };
  if (pc.level < 1) return { ok: false, msg: "Cần đạt ít nhất cấp văn hóa 1" };

  const curYear = _year();
  const cooldown = state.festivalCooldown[powerName] || 0;
  if (curYear - cooldown < 5) {
    return { ok: false, msg: `Cần chờ thêm ${5 - (curYear - cooldown)} năm để tổ chức lễ hội tiếp theo` };
  }

  const festDef = FESTIVAL_TYPES[pc.styleId] || FESTIVAL_TYPES.PERFORMING;
  const style   = CULTURE_STYLES[pc.styleId] || {};

  // Gather attendees from other powers (those with culture or adjacent influence)
  const powers = _getPowers();
  const attendees = powers
    .filter(p => p.name !== powerName)
    .filter(() => Math.random() < 0.55)
    .map(p => p.name)
    .slice(0, 6);

  const festival = {
    id:         _newId(),
    host:       powerName,
    styleId:    pc.styleId,
    name:       `${festDef.icon} ${festDef.name} của ${powerName}`,
    year:       curYear,
    attendees,
    bonuses:    festDef.bonuses,
    spreadBoost: festDef.spreadBoost,
  };

  state.festivals.unshift(festival);
  if (state.festivals.length > 40) state.festivals.length = 40;
  state.festivalCooldown[powerName] = curYear;

  // Apply bonuses: host gains cultural development
  chDevelopCulture(powerName, 15 + Math.floor(Math.random() * 10));

  // Spread culture to all attendees
  attendees.forEach(name => {
    chSpreadCulture(powerName, name);
  });

  const bonusText = Object.entries(festDef.bonuses).map(([k,v]) => `+${v} ${k}`).join(', ');
  _log(`🎪 ${powerName} tổ chức "${festDef.name}"! Khách mời: ${attendees.length > 0 ? attendees.join(', ') : 'không ai'} · ${bonusText}`, "success");

  if (typeof toast === "function")
    toast(`🎪 Lễ Hội! ${powerName}: "${festDef.name}" — ${attendees.length} thế lực tham dự`, "success");

  if (typeof htAddEvent === "function")
    htAddEvent({ year: curYear, text: `🎪 ${powerName} tổ chức ${festDef.name} — ${attendees.length} thế lực tham dự`, tag: "culture" });

  chSave();
  return { ok: true, festival };
}

// ─── TICK ─────────────────────────────────────────────────────────
function chTick() {
  const powers = _getPowers();

  // AI: powers without culture may develop one
  powers.forEach(p => {
    if (!state.powerCultures[p.name] && Math.random() < 0.05) {
      const ids = Object.keys(CULTURE_STYLES);
      chAdoptStyle(p.name, ids[Math.floor(Math.random() * ids.length)]);
    }
  });

  // Develop culture naturally
  powers.forEach(p => {
    if (state.powerCultures[p.name] && Math.random() < 0.25) {
      chDevelopCulture(p.name, 3 + Math.floor(Math.random() * 8));
    }
  });

  // Soft power spread
  if (powers.length >= 2 && Math.random() < 0.20) {
    const from = powers[Math.floor(Math.random()*powers.length)];
    const to   = powers.filter(p => p.name !== from.name);
    if (to.length > 0) chSpreadCulture(from.name, to[Math.floor(Math.random()*to.length)].name);
  }

  // Check for collapsed powers → leave heritage
  if (window.countries) {
    window.countries.filter(c => c.collapsed).forEach(c => {
      const hasHeritage = state.heritages.some(h => h.fromPower === c.name);
      if (!hasHeritage && state.powerCultures[c.name]) {
        chLeaveHeritage(c.name);
      }
    });
  }

  // AI: high-culture powers spontaneously host festivals
  if (Math.random() < 0.12) {
    const eligible = powers.filter(p => {
      const pc = state.powerCultures[p.name];
      if (!pc || pc.level < 1) return false;
      const curYear = _year();
      const cooldown = state.festivalCooldown[p.name] || 0;
      return curYear - cooldown >= 8;
    });
    if (eligible.length > 0) {
      const host = eligible[Math.floor(Math.random() * eligible.length)];
      chHostFestival(host.name);
    }
  }

  chSave();
}

// ─── RENDER ──────────────────────────────────────────────────────
function chRenderPanel() {
  const el = document.getElementById("panel-culture-heritage");
  if (!el) return;

  const powers   = _getPowers();
  const wonders  = state.wonders.slice().reverse();
  const heritages = state.heritages;

  const culturedCount = Object.keys(state.powerCultures).length;
  const softPowerLeader = _getSoftPowerLeader();

  el.innerHTML = `
  <div style="padding:12px 4px 0;">
    <h2 style="color:#f472b6;font-size:1.4em;margin:0 0 4px;text-align:center;">🎨 Văn Hóa & Di Sản</h2>
    <p style="color:#94a3b8;text-align:center;font-size:.85em;margin:0 0 16px;">
      ${culturedCount} nền văn minh · ${wonders.length} kỳ quan · ${heritages.length} di sản · ${softPowerLeader ? '👑 ' + softPowerLeader : ''}
    </p>

    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
      ${["cultures","develop","heritage","wonders","influence","festival","log"].map((tab,i) => `
        <button onclick="chSwitchTab('${tab}')" id="ch-tab-${tab}"
          style="flex:1;min-width:60px;padding:7px 4px;border-radius:8px;border:none;cursor:pointer;font-size:.78em;font-weight:700;
          background:${i===0?'#4a1535':'#1a2535'};color:${i===0?'#f472b6':'#94a3b8'};
          border:1px solid ${i===0?'#db2777':'#2d3748'};">
          ${{cultures:"🎨 Nền Văn Hóa", develop:"⬆️ Phát Triển", heritage:"🏺 Di Sản", wonders:"✨ Kỳ Quan", influence:"🌐 Đế Quốc Mềm", festival:"🎪 Lễ Hội", log:"📜 Nhật Ký"}[tab]}
        </button>`).join('')}
    </div>

    <div id="ch-content-cultures">${_renderCulturesTab(powers)}</div>
    <div id="ch-content-develop" style="display:none">${_renderDevelopTab(powers)}</div>
    <div id="ch-content-heritage" style="display:none">${_renderHeritageTab(powers)}</div>
    <div id="ch-content-wonders" style="display:none">${_renderWondersTab(wonders)}</div>
    <div id="ch-content-influence" style="display:none">${_renderInfluenceTab(powers)}</div>
    <div id="ch-content-festival" style="display:none">${_renderFestivalTab(powers)}</div>
    <div id="ch-content-log" style="display:none">${_renderLogTab()}</div>
  </div>`;
}

function _getSoftPowerLeader() {
  const totals = {};
  Object.entries(state.influence).forEach(([key, score]) => {
    const [a, b] = key.split("|");
    const pcA = state.powerCultures[a];
    const pcB = state.powerCultures[b];
    if (pcA) totals[a] = (totals[a]||0) + score;
    if (pcB) totals[b] = (totals[b]||0) + score;
  });
  const entries = Object.entries(totals);
  if (!entries.length) return null;
  return entries.sort((a,b) => b[1]-a[1])[0][0];
}

function _renderCulturesTab(powers) {
  let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
    ${Object.entries(CULTURE_STYLES).map(([id,s]) => {
      const count = Object.values(state.powerCultures).filter(pc => pc.styleId === id).length;
      return `<div style="background:#0f172a;border:1px solid ${s.color}33;border-left:3px solid ${s.color};border-radius:8px;padding:9px;">
        <div style="color:${s.color};font-weight:700;font-size:.85em;">${s.icon} ${s.label}</div>
        <div style="color:#64748b;font-size:.75em;margin-top:2px;">${count} thế lực · Lan rộng ${Math.round(s.spreadChance*100)}%</div>
        <div style="color:#94a3b8;font-size:.73em;margin-top:3px;">${s.desc.substring(0,50)}…</div>
      </div>`;
    }).join('')}
  </div>`;

  html += `<div style="color:#f472b6;font-weight:700;margin-bottom:10px;font-size:.88em;">🌍 Các Nền Văn Minh</div>`;
  const hasCulture = powers.filter(p => state.powerCultures[p.name]);
  const noCulture  = powers.filter(p => !state.powerCultures[p.name]);

  hasCulture.forEach(p => {
    const pc = state.powerCultures[p.name];
    const style = CULTURE_STYLES[pc.styleId] || {};
    const lvInfo = _cultureLevel(pc.points);
    const bar = Math.min(100, Math.round((pc.points % 150) / 150 * 100));
    html += `<div style="background:#0f172a;border:1px solid ${style.color||'#1e3a5f'}33;border-left:3px solid ${style.color||'#3b82f6'};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#e2e8f0;font-weight:600;">${p.name}</span>
        <span style="color:${style.color||'#94a3b8'};font-size:.8em;">${style.icon||''} ${style.label||''}</span>
      </div>
      <div style="color:#94a3b8;font-size:.78em;margin-top:3px;">${lvInfo.label} · ${pc.points} điểm · ${pc.wonders?.length||0} kỳ quan</div>
      <div style="height:4px;background:#1e2535;border-radius:4px;margin-top:6px;">
        <div style="height:100%;width:${bar}%;background:${style.color||'#3b82f6'};border-radius:4px;"></div>
      </div>
    </div>`;
  });

  if (noCulture.length > 0) {
    html += `<div style="color:#64748b;font-size:.8em;margin-top:8px;opacity:.6;">🌑 Chưa có văn hóa: ${noCulture.map(p=>p.name).join(', ')}</div>`;
  }
  return html;
}

function _renderDevelopTab(powers) {
  const pNames = powers.map(p => p.name);
  return `<div style="background:#0f172a;border:1px solid #4a1535;border-radius:10px;padding:14px;margin-bottom:14px;">
    <div style="color:#f472b6;font-weight:700;margin-bottom:12px;font-size:.9em;">🎨 Lập Nền Văn Hóa / Phát Triển</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Thế lực:</label>
        <select id="ch-dev-power" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${pNames.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Phong Cách Văn Hóa:</label>
        <select id="ch-dev-style" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${Object.entries(CULTURE_STYLES).map(([id,s])=>`<option value="${id}">${s.icon} ${s.label}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="chActionAdopt()" style="flex:1;padding:9px;background:#4a1535;color:#f472b6;border:1px solid #db2777;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
        🎨 Lập Văn Hóa
      </button>
      <button onclick="chActionDevelop()" style="flex:1;padding:9px;background:#1a3a1a;color:#86efac;border:1px solid #22c55e;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
        ⬆️ Phát Triển (+20đ)
      </button>
      <button onclick="chActionWonder()" style="flex:1;padding:9px;background:#2d2a1a;color:#fbbf24;border:1px solid #f59e0b;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
        ✨ Xây Kỳ Quan
      </button>
    </div>
    <div id="ch-dev-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>

  <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:12px;">
    <div style="color:#60a5fa;font-weight:700;margin-bottom:10px;font-size:.9em;">🔄 Đồng Hóa Văn Hóa</div>
    <p style="color:#94a3b8;font-size:.8em;margin:0 0 10px;">Thế lực chinh phục áp đặt văn hóa lên thế lực bị trị.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Kẻ chinh phục:</label>
        <select id="ch-assim-from" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${pNames.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="color:#94a3b8;font-size:.8em;">Bị chinh phục:</label>
        <select id="ch-assim-to" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
          ${pNames.map((n,i)=>`<option value="${n}"${i===1?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
    </div>
    <button onclick="chActionAssim()" style="width:100%;padding:8px;background:#1e3a5f;color:#60a5fa;border:1px solid #3b82f6;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
      🔄 Đồng Hóa Văn Hóa
    </button>
    <div id="ch-assim-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
  </div>`;
}

function _renderHeritageTab(powers) {
  const pNames = powers.map(p => p.name);
  if (state.heritages.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">
      <div style="font-size:2em;margin-bottom:8px;">🏺</div>
      Chưa có di sản nào. Di sản được tạo khi một nền văn minh sụp đổ.
    </div>`;

  return state.heritages.map(h => {
    const style = CULTURE_STYLES[h.styleId] || {};
    const adoptedCount = h.adopted.length;
    const canAdopt = pNames.filter(n => !h.adopted.includes(n) && n !== h.fromPower);
    return `<div style="background:#0f172a;border:1px solid ${style.color||'#1e3a5f'}44;border-left:4px solid ${style.color||'#3b82f6'};border-radius:10px;padding:12px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <span style="color:#e2e8f0;font-weight:700;font-size:.9em;">🏺 ${h.name}</span>
        <span style="color:#64748b;font-size:.75em;">Năm ${h.year}</span>
      </div>
      <div style="color:${style.color||'#94a3b8'};font-size:.8em;margin-bottom:4px;">${style.icon||''} ${style.label||''} · ${h.points} điểm văn hóa · ${h.wonders.length} kỳ quan</div>
      ${adoptedCount > 0 ? `<div style="color:#4ade80;font-size:.75em;margin-bottom:6px;">✅ Đã được tiếp nhận bởi: ${h.adopted.join(', ')}</div>` : ''}
      ${canAdopt.length > 0 ? `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px;">
        <select id="ch-adopt-who-${h.id}" style="flex:2;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:4px;font-size:.78em;">
          ${canAdopt.map(n=>`<option value="${n}">${n}</option>`).join('')}
        </select>
        <button onclick="chActionAdoptHeritage('${h.id}')"
          style="flex:1;padding:5px 8px;background:#2d1a4a;color:#c084fc;border:1px solid #8b5cf6;border-radius:6px;cursor:pointer;font-size:.78em;">
          🏺 Tiếp Nhận
        </button>
      </div>` : `<div style="color:#475569;font-size:.75em;">Tất cả thế lực đã tiếp nhận di sản này.</div>`}
    </div>`;
  }).join('');
}

function _renderWondersTab(wonders) {
  if (wonders.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">
      <div style="font-size:2em;margin-bottom:8px;">✨</div>
      Chưa có kỳ quan nào. Kỳ quan được tạo khi văn hóa đạt cấp 3+.
    </div>`;

  return `<div style="color:#fbbf24;font-weight:700;margin-bottom:10px;font-size:.88em;">✨ ${wonders.length} Kỳ Quan Thế Giới</div>` +
  wonders.map(w => {
    const style = CULTURE_STYLES[w.styleId] || {};
    return `<div style="background:#0f172a;border:1px solid ${style.color||'#1e3a5f'}44;border-radius:10px;padding:12px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span style="color:#fbbf24;font-weight:700;font-size:.9em;">✨ ${w.name}</span>
        <span style="color:#64748b;font-size:.75em;">Năm ${w.year}</span>
      </div>
      <div style="color:${style.color||'#94a3b8'};font-size:.8em;margin-top:4px;">${style.icon||''} ${w.type} · ${w.owner}</div>
      <div style="color:#4ade80;font-size:.75em;margin-top:3px;">+${w.softPowerBonus} Đế Quốc Mềm</div>
    </div>`;
  }).join('');
}

function _renderInfluenceTab(powers) {
  if (powers.length < 2)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Cần ít nhất 2 thế lực có văn hóa để xem ảnh hưởng.</div>`;

  const leader = _getSoftPowerLeader();
  let html = leader
    ? `<div style="background:#0f172a;border:1px solid #db277744;border-radius:10px;padding:12px;margin-bottom:12px;">
        <div style="color:#f472b6;font-weight:700;font-size:.9em;">👑 Đế Quốc Mềm Hàng Đầu: ${leader}</div>
        <div style="color:#94a3b8;font-size:.8em;margin-top:4px;">
          ${(() => { const pc=state.powerCultures[leader]; const s=CULTURE_STYLES[pc?.styleId]; return s ? `${s.icon} ${s.label}` : ''; })()}
        </div>
      </div>` : '';

  // Show influence bars between powers (top pairs)
  const pairs = Object.entries(state.influence)
    .filter(([,v]) => v > 0)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 15);

  if (pairs.length === 0) {
    html += `<div style="color:#64748b;text-align:center;padding:20px 0;">Văn hóa chưa lan rộng đủ để tạo ảnh hưởng. Chờ thêm vài chu kỳ...</div>`;
  } else {
    html += `<div style="color:#60a5fa;font-weight:700;margin-bottom:10px;font-size:.88em;">🌐 Luồng Ảnh Hưởng Văn Hóa</div>`;
    pairs.forEach(([key, score]) => {
      const [a, b] = key.split("|");
      const pcA = state.powerCultures[a];
      const sA  = CULTURE_STYLES[pcA?.styleId];
      const col = sA?.color || "#94a3b8";
      html += `<div style="background:#0f172a;border-radius:8px;padding:9px 12px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#e2e8f0;font-size:.82em;">${sA?.icon||'🌐'} ${a} → ${b}</span>
          <span style="color:${col};font-size:.78em;font-weight:700;">${Math.round(score)}%</span>
        </div>
        <div style="height:5px;background:#1e2535;border-radius:4px;">
          <div style="height:100%;width:${Math.round(score)}%;background:${col};border-radius:4px;"></div>
        </div>
      </div>`;
    });
  }

  // Manual spread button
  const hasCulture = powers.filter(p => state.powerCultures[p.name]);
  if (hasCulture.length >= 1 && powers.length >= 2) {
    html += `<div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:10px;padding:12px;margin-top:12px;">
      <div style="color:#60a5fa;font-weight:700;margin-bottom:8px;font-size:.88em;">📡 Khuếch Đại Ảnh Hưởng</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <div>
          <label style="color:#94a3b8;font-size:.8em;">Từ:</label>
          <select id="ch-spread-from" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
            ${hasCulture.map(p=>{ const pc=state.powerCultures[p.name]; const s=CULTURE_STYLES[pc?.styleId]||{}; return `<option value="${p.name}">${s.icon||''} ${p.name}</option>`; }).join('')}
          </select>
        </div>
        <div>
          <label style="color:#94a3b8;font-size:.8em;">Tới:</label>
          <select id="ch-spread-to" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:5px;font-size:.82em;">
            ${powers.map((p,i)=>`<option value="${p.name}"${i===1?' selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <button onclick="chActionSpread()" style="width:100%;padding:8px;background:#1e3a5f;color:#60a5fa;border:1px solid #3b82f6;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
        🌐 Lan Tỏa Ảnh Hưởng
      </button>
      <div id="ch-spread-msg" style="margin-top:6px;font-size:.82em;color:#94a3b8;text-align:center;"></div>
    </div>`;
  }
  return html;
}

function _renderFestivalTab(powers) {
  const pNames = powers.map(p => p.name);
  const hasCulture = powers.filter(p => state.powerCultures[p.name] && (state.powerCultures[p.name].level || 0) >= 1);
  const curYear = _year();

  let hostSection = `<div style="background:#0f172a;border:1px solid #7c3aed44;border-radius:10px;padding:14px;margin-bottom:14px;">
    <div style="color:#c084fc;font-weight:700;margin-bottom:10px;font-size:.9em;">🎪 Tổ Chức Lễ Hội</div>
    <p style="color:#94a3b8;font-size:.8em;margin:0 0 10px;">Mỗi nền văn minh cần tích lũy ít nhất cấp 1 và chờ 5 năm giữa các lần tổ chức.</p>
    <div style="margin-bottom:10px;">
      <label style="color:#94a3b8;font-size:.8em;">Thế lực tổ chức lễ hội:</label>
      <select id="ch-fest-power" style="width:100%;background:#1a2535;color:#e2e8f0;border:1px solid #2d3748;border-radius:6px;padding:6px;font-size:.82em;margin-top:4px;">
        ${hasCulture.length > 0
          ? hasCulture.map(p => {
              const cd = state.festivalCooldown[p.name] || 0;
              const wait = Math.max(0, 5 - (curYear - cd));
              const festDef = FESTIVAL_TYPES[state.powerCultures[p.name].styleId] || FESTIVAL_TYPES.PERFORMING;
              return `<option value="${p.name}">${festDef.icon} ${p.name}${wait > 0 ? ` (chờ ${wait} năm)` : ' ✅'}</option>`;
            }).join('')
          : `<option value="">— Chưa có văn minh đủ cấp —</option>`}
      </select>
    </div>
    ${hasCulture.length > 0 ? `
    <button onclick="chActionFestival()" style="width:100%;padding:9px;background:#3b0764;color:#c084fc;border:1px solid #7c3aed;border-radius:8px;cursor:pointer;font-size:.84em;font-weight:700;">
      🎪 Khai Mạc Lễ Hội!
    </button>
    <div id="ch-fest-msg" style="margin-top:8px;font-size:.82em;color:#94a3b8;text-align:center;"></div>` : ''}
  </div>`;

  let allFestHtml = '';
  if (state.festivals.length === 0) {
    allFestHtml = `<div style="color:#64748b;text-align:center;padding:30px 0;">
      <div style="font-size:2em;margin-bottom:8px;">🎪</div>
      Chưa có lễ hội nào. Khai mạc lễ hội để lan tỏa văn hóa!
    </div>`;
  } else {
    allFestHtml = `<div style="color:#c084fc;font-weight:700;margin-bottom:10px;font-size:.88em;">🎪 ${state.festivals.length} Lễ Hội Đã Tổ Chức</div>`;
    allFestHtml += state.festivals.map(f => {
      const style = CULTURE_STYLES[f.styleId] || {};
      const bonusStr = Object.entries(f.bonuses || {}).map(([k,v]) => `<span style="color:#4ade80;font-size:.75em;">+${v} ${k}</span>`).join(' ');
      const attendeeStr = f.attendees && f.attendees.length > 0
        ? f.attendees.map(a => `<span style="background:#1e2535;color:#94a3b8;border-radius:4px;padding:1px 5px;font-size:.73em;">${a}</span>`).join(' ')
        : `<span style="color:#475569;font-size:.73em;">Không có khách mời</span>`;
      return `<div style="background:#0f172a;border:1px solid ${style.color||'#7c3aed'}33;border-left:4px solid ${style.color||'#7c3aed'};border-radius:10px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
          <span style="color:#e2e8f0;font-weight:700;font-size:.88em;">${f.name}</span>
          <span style="color:#64748b;font-size:.75em;white-space:nowrap;margin-left:8px;">Năm ${f.year}</span>
        </div>
        <div style="margin-bottom:5px;">${bonusStr} <span style="color:#a78bfa;font-size:.75em;">+${f.spreadBoost||0}% lan truyền</span></div>
        <div style="color:#64748b;font-size:.75em;margin-bottom:4px;">👥 Khách tham dự:</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;">${attendeeStr}</div>
      </div>`;
    }).join('');
  }

  // Festival type reference
  let festRefHtml = `<div style="color:#c084fc;font-weight:700;margin:12px 0 8px;font-size:.88em;">🎭 Loại Lễ Hội Theo Văn Hóa</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
    ${Object.entries(FESTIVAL_TYPES).map(([sid, fd]) => {
      const s = CULTURE_STYLES[sid] || {};
      return `<div style="background:#0f172a;border:1px solid ${s.color||'#7c3aed'}22;border-radius:8px;padding:8px;">
        <div style="color:${s.color||'#c084fc'};font-size:.78em;font-weight:700;">${fd.icon} ${fd.name}</div>
        <div style="color:#64748b;font-size:.72em;margin-top:2px;">${fd.desc.substring(0,45)}…</div>
        <div style="color:#4ade80;font-size:.72em;margin-top:3px;">+${fd.spreadBoost}% lan truyền</div>
      </div>`;
    }).join('')}
  </div>`;

  return hostSection + allFestHtml + festRefHtml;
}

function _renderLogTab() {
  if (state.culturalLog.length === 0)
    return `<div style="color:#64748b;text-align:center;padding:40px 0;">Nhật ký chưa có sự kiện.</div>`;
  const colors = { info:"#94a3b8", success:"#4ade80", danger:"#f87171", important:"#f472b6" };
  return state.culturalLog.slice(0,30).map(e =>
    `<div style="padding:7px 10px;border-left:3px solid ${colors[e.type]||colors.info};background:#0f172a;border-radius:0 8px 8px 0;margin-bottom:6px;">
      <span style="color:#475569;font-size:.78em;">Năm ${e.year}</span>
      <div style="color:${colors[e.type]||colors.info};font-size:.83em;margin-top:2px;">${e.msg}</div>
    </div>`
  ).join('');
}

// ─── GLOBAL UI CALLBACKS ──────────────────────────────────────────
window.chSwitchTab = function(tab) {
  ["cultures","develop","heritage","wonders","influence","festival","log"].forEach(t => {
    const c = document.getElementById("ch-content-"+t);
    const b = document.getElementById("ch-tab-"+t);
    if (c) c.style.display = (t===tab) ? "" : "none";
    if (b) {
      const isFest = t === "festival";
      b.style.background  = (t===tab) ? (isFest ? "#3b0764" : "#4a1535") : "#1a2535";
      b.style.color       = (t===tab) ? (isFest ? "#c084fc" : "#f472b6") : "#94a3b8";
      b.style.borderColor = (t===tab) ? (isFest ? "#7c3aed" : "#db2777") : "#2d3748";
    }
  });
};

window.chActionAdopt = function() {
  const power = document.getElementById("ch-dev-power")?.value;
  const style = document.getElementById("ch-dev-style")?.value;
  const msg   = document.getElementById("ch-dev-msg");
  if (!power || !style) { if(msg) msg.textContent="⚠️ Chọn thế lực và phong cách"; return; }
  const r = chAdoptStyle(power, style);
  if(msg) { msg.style.color=r.ok?"#f472b6":"#f87171"; msg.textContent=r.ok?`✅ Văn hóa ${CULTURE_STYLES[style]?.label} đã được lập!`:"⚠️ "+r.msg; }
};

window.chActionDevelop = function() {
  const power = document.getElementById("ch-dev-power")?.value;
  const msg   = document.getElementById("ch-dev-msg");
  if (!power) return;
  if (!state.powerCultures[power]) {
    const style = document.getElementById("ch-dev-style")?.value;
    chAdoptStyle(power, style || Object.keys(CULTURE_STYLES)[0]);
  }
  const r = chDevelopCulture(power, 20);
  if(msg) { msg.style.color="#86efac"; msg.textContent=r.ok?`✅ +20 điểm văn hóa cho ${power} (tổng: ${r.points})`:"⚠️ "+r.msg; }
  setTimeout(chRenderPanel, 200);
};

window.chActionWonder = function() {
  const power = document.getElementById("ch-dev-power")?.value;
  const msg   = document.getElementById("ch-dev-msg");
  if (!power) return;
  if (!state.powerCultures[power]) { if(msg){msg.style.color="#f87171";msg.textContent="⚠️ Cần lập văn hóa trước";} return; }
  const r = chCreateWonder(power);
  if(msg) { msg.style.color=r.ok?"#fbbf24":"#f87171"; msg.textContent=r.ok?`✨ Kỳ quan "${r.wonder.name}" hoàn thành!`:"⚠️ Lỗi"; }
  setTimeout(chRenderPanel, 200);
};

window.chActionAssim = function() {
  const from = document.getElementById("ch-assim-from")?.value;
  const to   = document.getElementById("ch-assim-to")?.value;
  const msg  = document.getElementById("ch-assim-msg");
  if (!from || !to || from===to) { if(msg) msg.textContent="⚠️ Chọn hai thế lực khác nhau"; return; }
  const r = chAssimilate(from, to);
  if(msg) { msg.style.color=r.ok?"#60a5fa":"#f87171"; msg.textContent=r.ok?`✅ ${to} bị đồng hóa văn hóa!`:"⚠️ "+r.msg; }
  setTimeout(chRenderPanel, 200);
};

window.chActionAdoptHeritage = function(hId) {
  const selEl = document.getElementById("ch-adopt-who-" + hId);
  if (!selEl) return;
  const r = chAdoptHeritage(selEl.value, hId);
  if (typeof toast === "function") toast(r.ok ? `🏺 ${selEl.value} tiếp nhận di sản!` : "⚠️ "+r.msg, r.ok?"success":"danger");
};

window.chActionSpread = function() {
  const from = document.getElementById("ch-spread-from")?.value;
  const to   = document.getElementById("ch-spread-to")?.value;
  const msg  = document.getElementById("ch-spread-msg");
  if (!from || !to || from===to) { if(msg) msg.textContent="⚠️ Chọn hai thế lực khác nhau"; return; }
  chSpreadCulture(from, to);
  const k = _pairKey(from, to);
  if(msg) { msg.style.color="#60a5fa"; msg.textContent=`✅ Ảnh hưởng văn hóa ${from}→${to}: ${Math.round(state.influence[k]||0)}%`; }
  setTimeout(chRenderPanel, 200);
};

window.chActionFestival = function() {
  const power = document.getElementById("ch-fest-power")?.value;
  const msg   = document.getElementById("ch-fest-msg");
  if (!power) { if(msg) { msg.style.color="#f87171"; msg.textContent="⚠️ Chọn thế lực tổ chức lễ hội"; } return; }
  const r = chHostFestival(power);
  if (msg) {
    msg.style.color = r.ok ? "#c084fc" : "#f87171";
    msg.textContent = r.ok
      ? `🎪 Lễ hội "${r.festival.name}" đã khai mạc! ${r.festival.attendees.length} thế lực tham dự.`
      : "⚠️ " + r.msg;
  }
  setTimeout(() => { chRenderPanel(); chSwitchTab("festival"); }, 300);
};

// ─── PUBLIC API ───────────────────────────────────────────────────
window.chAdoptStyle     = chAdoptStyle;
window.chDevelopCulture = chDevelopCulture;
window.chCreateWonder   = chCreateWonder;
window.chLeaveHeritage  = chLeaveHeritage;
window.chAdoptHeritage  = chAdoptHeritage;
window.chSpreadCulture  = chSpreadCulture;
window.chAssimilate     = chAssimilate;
window.chHostFestival   = chHostFestival;
window.chRenderPanel    = chRenderPanel;
window.chTick           = chTick;
window.cultureState     = state;

// ─── INIT ─────────────────────────────────────────────────────────
(function chInit() {
  chLoad();
  if (state.initialized) return;
  state.initialized = true;

  setInterval(function() {
    if (typeof window.year !== "undefined") chTick();
  }, 11000);

  console.log("[CultureHeritageEngine V1] 🎨 Hệ thống Văn Hóa & Di Sản khởi động — 8 phong cách · Kỳ quan · Đế Quốc Mềm sẵn sàng.");
})();

})();
