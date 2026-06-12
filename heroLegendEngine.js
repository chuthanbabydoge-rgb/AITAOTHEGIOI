// ============================================================
// HERO & LEGEND ENGINE V1
// CREATOR GOD V6 — PHASE NEXT
// Hệ thống Anh Hùng, Huyền Thoại, Danh Hiệu, Thành Tựu,
// Tượng Đài, Tín Ngưỡng, Pháp Bảo Di Vật, Sổ Sách Huyền Thoại
// Tương thích 100% với save cũ — KHÔNG xóa dữ liệu, KHÔNG reset world
// ============================================================

// ===== GLOBAL STATE (migrate-safe) =====
// window.heroLegendData — lưu vào localStorage key: cgv6_heroLegendEngine

const HLE_SAVE_KEY = "cgv6_heroLegendEngine";

// ===== LEGEND SCORE TIERS =====
const HLE_TIERS = [
  { min: 5000, id: "supreme", name: "Thiên Cổ Truyền Kỳ", color: "#fde047", icon: "👑" },
  { min: 1000, id: "legend",  name: "Huyền Thoại",         color: "#c084fc", icon: "🌟" },
  { min: 500,  id: "hero",    name: "Anh Hùng",            color: "#60a5fa", icon: "⚔️" },
  { min: 100,  id: "notable", name: "Danh Nhân",           color: "#4ade80", icon: "📜" },
  { min: 0,    id: "common",  name: "Người Thường",        color: "#94a3b8", icon: "👤" },
];

function hleClassify(score) {
  score = score || 0;
  for (const t of HLE_TIERS) { if (score >= t.min) return t; }
  return HLE_TIERS[HLE_TIERS.length - 1];
}

// ===== TITLE POOLS =====
const HLE_TITLES = {
  notable: ["📜 Danh Sĩ", "📜 Kỳ Tài Một Phương", "📜 Tiếng Tăm Vang Dội"],
  hero: {
    sword:   ["⚔️ Kiếm Thánh", "🗡️ Kiếm Khách Vô Song"],
    alchemy: ["💊 Đan Thần", "🧪 Dược Vương"],
    ruler:   ["👑 Nhân Hoàng", "🏯 Tông Chủ Một Đời"],
    war:     ["⚔️ Chiến Thần", "🛡️ Thiên Hạ Vô Địch"],
    saint:   ["✨ Đại Hiệp", "🕊️ Hộ Thế Chân Quân"],
    villain: ["👹 Ma Tôn", "🔥 Yêu Đế"],
  },
  legend: {
    sword:   ["🌟 Kiếm Đế", "🌟 Vạn Kiếm Quy Tông"],
    alchemy: ["🌟 Đan Tổ", "🌟 Vạn Dược Chí Tôn"],
    ruler:   ["🌟 Thiên Đế", "🌟 Nhất Thế Quân Vương"],
    war:     ["🌟 Chiến Đế", "🌟 Sát Thần"],
    saint:   ["🌟 Đại Thánh", "🌟 Cứu Thế Chủ"],
    villain: ["🌟 Ma Đế", "🌟 Cửu U Ma Đế", "🌟 Bạo Quân"],
  },
  supreme: {
    sword:   ["👑 Kiếm Tổ Thiên Cổ", "👑 Vạn Cổ Kiếm Thánh"],
    alchemy: ["👑 Đan Đạo Chí Tôn"],
    ruler:   ["👑 Thiên Cổ Nhất Đế", "👑 Vạn Thế Nhân Hoàng"],
    war:     ["👑 Thiên Cổ Chiến Thần", "👑 Vạn Cổ Sát Thần"],
    saint:   ["👑 Vạn Cổ Đại Thánh", "👑 Hộ Thế Thiên Tôn"],
    villain: ["👑 Hủy Diệt Giả", "👑 Đại Ác Nhân", "👑 Thiên Cổ Ma Vương"],
  },
};

// ===== ACHIEVEMENT TYPES & SCORE RULES =====
const HLE_SCORE_RULES = {
  sect_found:        { points: 150,  label: "Sáng lập tông môn" },
  found_nation:      { points: 250,  label: "Lập quốc xưng vương" },
  found_empire:      { points: 600,  label: "Lập đế quốc, trở thành Hoàng Tộc" },
  civ_nation:        { points: 250,  label: "Gia tộc lập quốc xưng vương" },
  civ_empire:        { points: 600,  label: "Gia tộc lập đế quốc, trở thành Hoàng Tộc" },
  empire:            { points: 600,  label: "Kiến lập Đế Quốc" },
  worldlord:         { points: 1500, label: "Thống nhất thiên hạ, xưng Chúa Tể Thế Giới" },
  unify:             { points: 1000, label: "Thống nhất lãnh thổ thiên hạ" },
  boss_kill:         { points: 220,  label: "Đồ sát ác long / boss" },
  war_win:           { points: 90,   label: "Thắng trận chiến tranh" },
  ascend:            { points: 800,  label: "Phi thăng / Cứu thế" },
  religion:          { points: 130,  label: "Sáng lập tôn giáo" },
  breakthrough_high: { points: 40,   label: "Đột phá cảnh giới cao" },
  mass_kill:         { points: 300,  label: "Gây ra đại sát kiếp" },
  genius_born:       { points: 60,   label: "Thiên tài / Yêu nghiệt xuất thế" },
};

// ===== ARTIFACT NAME POOL =====
const HLE_ARTIFACT_POOL = [
  { name: "Thiên Kiếm",        type: "kiếm" },
  { name: "Huyết Long Đao",    type: "đao" },
  { name: "Cửu U Trượng",      type: "pháp bảo" },
  { name: "Thái Cực Đỉnh",     type: "thần khí" },
  { name: "Phá Thiên Cung",    type: "cung" },
  { name: "Vạn Tượng Giáp",    type: "trang bị" },
  { name: "Hỗn Nguyên Châu",   type: "pháp bảo" },
  { name: "Diệt Thế Phù",      type: "pháp bảo" },
  { name: "Tử Vi Tinh Bàn",    type: "thần khí" },
  { name: "Bất Diệt Kim Thân Lệnh", type: "thần khí" },
];

const HLE_MONUMENT_TYPES = [
  { icon: "🗿", name: "Tượng Đài", label: "tượng đài tưởng nhớ" },
  { icon: "🏛", name: "Lăng Mộ",   label: "lăng mộ an táng" },
  { icon: "⛩", name: "Đền Thờ",   label: "đền thờ thờ phụng" },
];

// ============================================================
// DEFAULT STATE
// ============================================================
function hleDefaultData() {
  return {
    heroes: {},          // npcId -> { id, name, legendScore, titles:[], achievements:[] }
    legends: [],         // permanent archive of fallen / retired legends
    monuments: [],
    cults: [],
    artifacts: [],
    legendaryMemory: [], // permanent legend-tier timeline (NOT capped like worldHistory)
    records: {
      strongest: null,   // {id,name,realm,realmName,year}
      richest:   null,   // {id,name,wealth,year}
      mostKills: null,   // {id,name,killCount,year}
      longestLived: null,// {id,name,age,year}
    },
    credited: {
      sects: {}, countries: {}, empires: {},
      dynastiesNation: {}, dynastiesEmpire: {},
      religions: {}, villains: {},
      unifiedTerritory: false,
    },
    meta: { version: 1 },
  };
}

window.heroLegendData = window.heroLegendData || hleDefaultData();

// ============================================================
// HELPERS — FIND NPC ACROSS LIVING / DEAD / LEGEND ARCHIVE
// ============================================================
function hleFindById(id) {
  if (id === null || id === undefined) return null;
  return (window.npcs || []).find(n => n.id === id)
      || (window.hallOfFame || []).find(n => n.id === id)
      || null;
}

function hleFindByName(name) {
  if (!name) return null;
  return (window.npcs || []).find(n => n.name === name)
      || (window.hallOfFame || []).find(n => n.name === name)
      || null;
}

// Accepts an npc id (number), an npc object, or a name (string)
function hleResolveNpc(ref) {
  if (ref === null || ref === undefined) return null;
  if (typeof ref === "object") return ref;
  if (typeof ref === "number") return hleFindById(ref);
  if (typeof ref === "string") {
    // some "owner" fields store ids as strings
    const asNum = Number(ref);
    if (!isNaN(asNum) && String(asNum) === ref) {
      const byId = hleFindById(asNum);
      if (byId) return byId;
    }
    return hleFindByName(ref);
  }
  return null;
}

// ============================================================
// CORE — AWARD LEGEND SCORE
// ============================================================
function hleGetOrCreateHero(npc) {
  const hd = window.heroLegendData;
  let hero = hd.heroes[npc.id];
  if (!hero) {
    hero = {
      id: npc.id,
      name: npc.name,
      family: npc.family,
      legendScore: npc.legendScore || 0,
      titles: [],
      achievements: [],
    };
    hd.heroes[npc.id] = hero;
  }
  return hero;
}

function hleAward(ref, points, type, customLabel) {
  const npc = hleResolveNpc(ref);
  if (!npc || npc.status === "dead") {
    // Dead npc can still be awarded posthumously (rare) — try legends archive
    return hleAwardDead(ref, points, type, customLabel);
  }
  const hero = hleGetOrCreateHero(npc);
  const before = hleClassify(hero.legendScore);
  hero.legendScore += points;
  hero.name = npc.name;
  const rule = HLE_SCORE_RULES[type] || { label: customLabel || "Thành tựu" };
  hero.achievements.push({
    year: window.year || 1,
    type,
    label: customLabel || rule.label,
    points,
  });
  npc.legendScore = hero.legendScore;

  const after = hleClassify(hero.legendScore);
  if (after.id !== before.id) {
    hleAnnounceTierChange(npc, hero, before, after);
  }
  hleAssignTitle(npc, hero, after);
  return hero;
}

function hleAwardDead(ref, points, type, customLabel) {
  const npc = (typeof ref === "object") ? ref : hleFindById(ref) || hleFindByName(ref);
  if (!npc) return null;
  const hero = window.heroLegendData.heroes[npc.id];
  if (!hero) return null;
  hero.legendScore += points;
  const rule = HLE_SCORE_RULES[type] || { label: customLabel || "Thành tựu" };
  hero.achievements.push({ year: window.year || 1, type, label: customLabel || rule.label, points });
  return hero;
}

function hleAnnounceTierChange(npc, hero, before, after) {
  // Only announce promotions, and only Danh Nhân (notable) and above
  if (HLE_TIERS.findIndex(t => t.id === after.id) < HLE_TIERS.findIndex(t => t.id === before.id)) return;
  const msg = `${npc.name} được thiên hạ tôn xưng ${after.icon} ${after.name}!`;
  hleLog(msg, npc, after.id);
}

function hleLog(text, npc, tierId) {
  window.heroLegendData.legendaryMemory.unshift({
    year: window.year || 1,
    npcId: npc ? npc.id : null,
    name: npc ? npc.name : null,
    text,
    tier: tierId || null,
  });
  if (window.heroLegendData.legendaryMemory.length > 2000) window.heroLegendData.legendaryMemory.pop();
  if (typeof window.addWorldHistory === "function") {
    window.addWorldHistory("legend", text, { npcId: npc ? npc.id : null, npcName: npc ? npc.name : null });
  }
  if (typeof window.addLog === "function") window.addLog(`📖 ${text}`, "important");
}

// ============================================================
// TITLE ASSIGNMENT
// ============================================================
function hleAssignTitle(npc, hero, tier) {
  npc.titles = npc.titles || [];
  hero.titles = hero.titles || [];

  if (tier.id === "common") return;

  let pool;
  if (tier.id === "notable") {
    pool = HLE_TITLES.notable;
  } else {
    const category = hleDominantCategory(npc, hero);
    pool = HLE_TITLES[tier.id] ? HLE_TITLES[tier.id][category] : null;
    if (!pool) pool = HLE_TITLES.notable;
  }

  // Already has a title from this pool? skip
  if (pool.some(t => hero.titles.includes(t))) return;

  // Remove any lower-tier auto-titles before granting a higher one (keep only the newest)
  const allAutoTitles = []
    .concat(HLE_TITLES.notable)
    .concat(Object.values(HLE_TITLES.hero).flat())
    .concat(Object.values(HLE_TITLES.legend).flat())
    .concat(Object.values(HLE_TITLES.supreme).flat());

  const newTitle = pool.find(t => !hero.titles.includes(t)) || pool[0];

  hero.titles = hero.titles.filter(t => !allAutoTitles.includes(t));
  npc.titles  = npc.titles.filter(t => !allAutoTitles.includes(t));

  hero.titles.push(newTitle);
  npc.titles.push(newTitle);

  hleLog(`${npc.name} được tấn phong danh hiệu [${newTitle}]!`, npc, tier.id);
}

function hleDominantCategory(npc, hero) {
  // Villains: based on karma & kill achievements
  const karma = (npc.karma === undefined) ? 0 : npc.karma;
  const types = (hero.achievements || []).map(a => a.type);

  if (karma <= -50 || types.includes("mass_kill")) return "villain";
  if (types.includes("ascend")) return "saint";
  if (types.includes("found_empire") || types.includes("civ_empire") ||
      types.includes("found_nation") || types.includes("civ_nation") ||
      types.includes("empire") || types.includes("worldlord")) return "ruler";
  if (types.includes("boss_kill") || types.includes("war_win")) return "war";
  if (types.includes("breakthrough_high")) return "alchemy";
  return "sword";
}

// ============================================================
// WORLD EVENT HOOK — listens to addWorldHistory
// ============================================================
function hleOnWorldEvent(eventType, description, extra) {
  extra = extra || {};
  const hd = window.heroLegendData;

  switch (eventType) {
    case "boss": {
      const target = extra.hero || extra.winner;
      if (target) hleAward(target, HLE_SCORE_RULES.boss_kill.points, "boss_kill",
        `Đồ sát ${extra.boss || extra.dungeon || "ác long hung thú"}`);
      break;
    }

    case "war": {
      if (extra.winner) {
        hleAward(extra.winner, HLE_SCORE_RULES.war_win.points, "war_win",
          `Chiến thắng trong chiến tranh${extra.loser ? ` trước ${extra.loser}` : ""}`);
      }
      if (extra.casualties && extra.casualties >= 500 && extra.winner) {
        hleAward(extra.winner, HLE_SCORE_RULES.mass_kill.points, "mass_kill",
          `Gây đại sát kiếp ${extra.casualties} sinh linh trong chiến tranh`);
      }
      break;
    }

    case "empire": {
      if (extra.hero) hleAward(extra.hero, HLE_SCORE_RULES.empire.points, "empire");
      break;
    }

    case "worldlord": {
      const target = extra.hero || extra.worldLord;
      if (target) hleAward(target, HLE_SCORE_RULES.worldlord.points, "worldlord");
      break;
    }

    case "religion": {
      if (extra.npcName && extra.religionId !== undefined &&
          !hd.credited.religions[extra.religionId]) {
        hd.credited.religions[extra.religionId] = true;
        hleAward(extra.npcName, HLE_SCORE_RULES.religion.points, "religion",
          `Sáng lập tôn giáo`);
      }
      break;
    }

    case "heavenly": {
      if (extra.npcId !== undefined && /thành công|phong/.test(description)) {
        hleAward(extra.npcId, HLE_SCORE_RULES.ascend.points, "ascend");
      }
      break;
    }

    case "breakthrough": {
      if (extra.npcId !== undefined && (extra.realm || 0) >= 6) {
        const realmName = (window.REALMS && window.REALMS[extra.realm]) ? window.REALMS[extra.realm].name : "cảnh giới cao";
        hleAward(extra.npcId, HLE_SCORE_RULES.breakthrough_high.points, "breakthrough_high",
          `Đột phá ${realmName}, chấn động thiên hạ`);
      }
      break;
    }

    case "civilization": {
      if (extra.dynastySurname) {
        const surname = extra.dynastySurname;
        const dyn = (window.dynasties || {})[surname];
        const founderRef = dyn ? dyn.founder : null;
        if (founderRef !== null && founderRef !== undefined) {
          if (/đế quốc|Hoàng Tộc/i.test(description) && !hd.credited.dynastiesEmpire[surname]) {
            hd.credited.dynastiesEmpire[surname] = true;
            hleAward(founderRef, HLE_SCORE_RULES.civ_empire.points, "civ_empire",
              `Gia tộc ${surname} lập đế quốc, trở thành Hoàng Tộc`);
          } else if (/lập quốc/i.test(description) && !hd.credited.dynastiesNation[surname]) {
            hd.credited.dynastiesNation[surname] = true;
            hleAward(founderRef, HLE_SCORE_RULES.civ_nation.points, "civ_nation",
              `Gia tộc ${surname} lập quốc xưng vương`);
          }
        }
      }
      break;
    }

    default:
      break;
  }
}

// ============================================================
// PERIODIC SCANS (run every world tick)
// ============================================================
function hleTickScans() {
  const hd = window.heroLegendData;

  // Reveal Hero & Legend tab on first tick
  if (!hd._tabRevealed) {
    hd._tabRevealed = true;
    const btn = document.querySelector('.nav-btn[data-panel="hero-legend"]');
    if (btn) {
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
      btn.classList.add('ec-unlocked-flash');
      setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
    }
  }

  // --- Sect founders ---
  (window.sects || []).forEach(s => {
    if (s.founder && !hd.credited.sects[s.id]) {
      hd.credited.sects[s.id] = true;
      hleAward(s.founder, HLE_SCORE_RULES.sect_found.points, "sect_found",
        `Sáng lập tông môn ${s.name}`);
    }
  });

  // --- Country founders: lập quốc / lập đế quốc ---
  (window.countries || []).forEach(c => {
    if (c.founderId === undefined || c.founderId === null) return;
    if (!hd.credited.countries[c.id]) {
      hd.credited.countries[c.id] = true;
      hleAward(c.founderId, HLE_SCORE_RULES.found_nation.points, "found_nation",
        `Lập quốc ${c.name}, xưng vương một phương`);
    }
    if (c.isEmpire && !hd.credited.empires[c.id]) {
      hd.credited.empires[c.id] = true;
      hleAward(c.founderId, HLE_SCORE_RULES.found_empire.points, "found_empire",
        `${c.name} trỗi dậy thành Đế Quốc`);
    }
  });

  // --- Territorial unification ---
  if (!hd.credited.unifiedTerritory && window.world && Array.isArray(window.world.territories) &&
      window.world.territories.length >= 4) {
    const owners = {};
    let claimed = 0;
    window.world.territories.forEach(t => {
      if (t.owner) { owners[t.owner] = (owners[t.owner] || 0) + 1; claimed++; }
    });
    const total = window.world.territories.length;
    if (claimed >= total * 0.8) {
      for (const [ownerKey, count] of Object.entries(owners)) {
        if (count / total >= 0.7) {
          hd.credited.unifiedTerritory = true;
          const npc = hleResolveNpc(ownerKey);
          const c = (window.countries || []).find(cc => String(cc.id) === String(ownerKey) || cc.founderId === npc?.id);
          const ownerName = npc ? npc.name : (c ? c.name : ownerKey);
          if (npc) {
            hleAward(npc, HLE_SCORE_RULES.unify.points, "unify",
              `Thống nhất lãnh thổ thiên hạ${c ? ` dưới ${c.name}` : ""}`);
          }
          hleLog(`${ownerName} đã thống nhất phần lớn lãnh thổ thiên hạ, chấm dứt thời kỳ phân tranh!`, npc, "legend");
          break;
        }
      }
    }
  }

  // --- Villains: mass kill counts ---
  (window.npcs || []).forEach(npc => {
    if ((npc.killCount || 0) >= 30 && !hd.credited.villains[npc.id]) {
      hd.credited.villains[npc.id] = true;
      hleAward(npc, HLE_SCORE_RULES.mass_kill.points, "mass_kill",
        `Tay đẫm máu, đã chém giết ${npc.killCount} sinh linh`);
    }
  });

  hleTryGenerateGenius();
  hleUpdateRecords();
}

// ============================================================
// HERO GENERATION — Thiên Tài / Yêu Nghiệt / Kỳ Tài
// ============================================================
function hleTryGenerateGenius() {
  const candidates = (window.npcs || []).filter(n =>
    n.status === "alive" && n.age <= 22 && !n._hleGenius);
  candidates.forEach(npc => {
    if (typeof window.chance !== "function") return;
    if (!window.chance(0.0025)) return;

    const isVillain = window.chance(0.5);
    npc._hleGenius = isVillain ? "deviant" : "genius";
    const mult = 1.35;
    npc.attack  = Math.floor((npc.attack  || 10) * mult);
    npc.defense = Math.floor((npc.defense || 5)  * mult);
    npc.maxHp   = Math.floor((npc.maxHp   || 100) * mult);
    npc.hp      = npc.maxHp;
    npc.luck    = Math.min(100, (npc.luck || 0) + 20);
    if (isVillain) npc.karma = Math.min(npc.karma || 0, -40);

    const label = isVillain ? "💀 Yêu Nghiệt" : "⭐ Kỳ Tài";
    npc.titles = npc.titles || [];
    if (!npc.titles.includes(label)) npc.titles.push(label);

    hleAward(npc, HLE_SCORE_RULES.genius_born.points, "genius_born",
      isVillain ? "Yêu nghiệt giáng sinh, sát khí ngút trời" : "Kỳ tài xuất thế, tư chất kinh người");

    if (typeof window.addLog === "function") {
      window.addLog(`${label} ${npc.name} xuất hiện tại ${npc.country || npc.region || "thiên hạ"}!`, "important");
    }
  });
}

// ============================================================
// ALL-TIME RECORDS (World Book of Legends statistics)
// ============================================================
function hleUpdateRecords() {
  const hd = window.heroLegendData;
  const pool = []
    .concat(window.npcs || [])
    .concat(window.hallOfFame || []);

  pool.forEach(npc => {
    // Strongest (highest realm)
    if (!hd.records.strongest || (npc.realm || 0) > hd.records.strongest.realm) {
      hd.records.strongest = {
        id: npc.id, name: npc.name,
        realm: npc.realm || 0,
        realmName: (window.REALMS && window.REALMS[npc.realm]) ? window.REALMS[npc.realm].name : "?",
        year: window.year || 1,
      };
    }
    // Richest
    if (!hd.records.richest || (npc.wealth || 0) > hd.records.richest.wealth) {
      hd.records.richest = { id: npc.id, name: npc.name, wealth: npc.wealth || 0, year: window.year || 1 };
    }
    // Most kills
    if (!hd.records.mostKills || (npc.killCount || 0) > hd.records.mostKills.killCount) {
      hd.records.mostKills = { id: npc.id, name: npc.name, killCount: npc.killCount || 0, year: window.year || 1 };
    }
    // Longest lived
    const lifeLength = (npc.status === "dead" && npc.deathYear)
      ? (npc.deathYear - (npc.birthYear || 0))
      : ((window.year || 1) - (npc.birthYear || 0));
    if (!hd.records.longestLived || lifeLength > hd.records.longestLived.age) {
      hd.records.longestLived = { id: npc.id, name: npc.name, age: lifeLength, year: window.year || 1 };
    }
  });
}

// ============================================================
// DEATH HOOK — Legend Memory, Monuments, Cults, Artifacts
// ============================================================
function hleHandleDeath(npc, reason) {
  const hd = window.heroLegendData;
  const hero = hd.heroes[npc.id];
  const score = hero ? hero.legendScore : (npc.legendScore || 0);

  if (score < 100) {
    delete hd.heroes[npc.id];
    return; // Người Thường — không lưu vào sổ huyền thoại
  }

  const tier = hleClassify(score);
  const record = {
    id: npc.id, name: npc.name, family: npc.family, gender: npc.gender,
    legendScore: score, tier: tier.id, tierName: tier.name, tierIcon: tier.icon,
    titles: (hero && hero.titles) ? hero.titles.slice() : (npc.titles || []),
    achievements: (hero && hero.achievements) ? hero.achievements.slice() : [],
    birthYear: npc.birthYear, deathYear: window.year || 1,
    deathReason: reason,
    realm: npc.realm,
    realmName: (window.REALMS && window.REALMS[npc.realm]) ? window.REALMS[npc.realm].name : "?",
    karma: npc.karma,
  };
  hd.legends.unshift(record);
  if (hd.legends.length > 300) hd.legends.pop();

  const titleStr = record.titles.length ? ` [${record.titles[record.titles.length - 1]}]` : "";
  const memo = `${tier.icon} ${record.name}${titleStr} (${tier.name}) qua đời — ${reason}. ` +
    `Để lại ${record.achievements.length} đại sự, Legend Score ${score}.`;
  hleLog(memo, npc, tier.id);

  // Monuments — Anh Hùng trở lên, 50% cơ hội
  if (score >= 500 && typeof window.chance === "function" && window.chance(0.5)) {
    hleCreateMonument(npc, record, tier);
  }
  // Hero Cult — Huyền Thoại trở lên, 40% cơ hội
  if (score >= 1000 && typeof window.chance === "function" && window.chance(0.4)) {
    hleCreateCult(npc, record, tier);
  }
  // Legendary Artifact — Huyền Thoại trở lên, 50% cơ hội
  if (score >= 1000 && typeof window.chance === "function" && window.chance(0.5)) {
    hleCreateArtifact(npc, record, tier);
  }

  delete hd.heroes[npc.id];
}

function hleCreateMonument(npc, record, tier) {
  const hd = window.heroLegendData;
  const t = window.rand ? window.rand(HLE_MONUMENT_TYPES) : HLE_MONUMENT_TYPES[0];
  const location = npc.country || npc.region || "Trung Vực";
  const mon = {
    id: "mon_" + Date.now() + "_" + npc.id,
    icon: t.icon, type: t.name,
    name: `${t.name} ${record.name}`,
    forNpcId: npc.id, forName: record.name,
    tier: tier.id, tierName: tier.name,
    location,
    year: window.year || 1,
    desc: `${location} cho xây dựng ${t.label} để tưởng nhớ ${tier.icon} ${record.name}, ${tier.name} của một thời.`,
  };
  hd.monuments.unshift(mon);
  if (hd.monuments.length > 200) hd.monuments.pop();
  hleLog(mon.desc, npc, "monument");
}

function hleCreateCult(npc, record, tier) {
  const hd = window.heroLegendData;
  const location = npc.country || npc.region || "Trung Vực";
  const cult = {
    id: "cult_" + Date.now() + "_" + npc.id,
    heroName: record.name,
    forNpcId: npc.id,
    tier: tier.id, tierName: tier.name,
    location,
    year: window.year || 1,
    followers: (window.randInt ? window.randInt(100, 5000) : 1000),
    desc: `Tại ${location}, dân chúng lập miếu thờ phụng ${tier.icon} ${record.name}, tín ngưỡng dần lan rộng.`,
  };
  hd.cults.unshift(cult);
  if (hd.cults.length > 200) hd.cults.pop();
  hleLog(cult.desc, npc, "monument");
}

function hleCreateArtifact(npc, record, tier) {
  const hd = window.heroLegendData;
  const pick = window.rand ? window.rand(HLE_ARTIFACT_POOL) : HLE_ARTIFACT_POOL[0];
  const art = {
    id: "art_" + Date.now() + "_" + npc.id,
    name: pick.name, type: pick.type,
    formerOwner: record.name, formerOwnerId: npc.id,
    tier: tier.id, tierName: tier.name,
    year: window.year || 1,
    location: npc.country || npc.region || "Không Rõ",
    desc: `${tier.icon} ${record.name} qua đời, để lại ${pick.type} [${pick.name}] lưu lạc nhân gian.`,
  };
  hd.artifacts.unshift(art);
  if (hd.artifacts.length > 200) hd.artifacts.pop();
  hleLog(art.desc, npc, "monument");
}

// ============================================================
// STATISTICS — WORLD BOOK OF LEGENDS
// ============================================================
function hleGetTopLegends(limit) {
  const hd = window.heroLegendData;
  const aliveHeroes = Object.values(hd.heroes).map(h => ({
    id: h.id, name: h.name, family: h.family,
    legendScore: h.legendScore, titles: h.titles, achievements: h.achievements,
    alive: true,
  }));
  const fallenLegends = hd.legends.map(l => ({
    id: l.id, name: l.name, family: l.family,
    legendScore: l.legendScore, titles: l.titles, achievements: l.achievements,
    alive: false, deathYear: l.deathYear,
  }));
  const combined = aliveHeroes.concat(fallenLegends)
    .sort((a, b) => b.legendScore - a.legendScore);
  return combined.slice(0, limit || 100);
}

function hleGetGreatestByCategory(types) {
  const hd = window.heroLegendData;
  const all = Object.values(hd.heroes).concat(hd.legends);
  let best = null;
  all.forEach(h => {
    const hasType = (h.achievements || []).some(a => types.includes(a.type));
    if (hasType && (!best || h.legendScore > best.legendScore)) best = h;
  });
  return best;
}

function hleGetGreatestVillain() {
  const hd = window.heroLegendData;
  const all = Object.values(hd.heroes).concat(hd.legends);
  let best = null;
  all.forEach(h => {
    const karma = (window.npcs || []).concat(window.hallOfFame || []).find(n => n.id === h.id);
    const isVillain = (h.achievements || []).some(a => a.type === "mass_kill")
      || (karma && karma.karma !== undefined && karma.karma <= -40);
    if (isVillain && (!best || h.legendScore > best.legendScore)) best = h;
  });
  return best;
}

function hleGetStatistics() {
  const hd = window.heroLegendData;
  return {
    totalHeroes: Object.keys(hd.heroes).length,
    totalLegends: hd.legends.length,
    monuments: hd.monuments.length,
    cults: hd.cults.length,
    artifacts: hd.artifacts.length,
    records: hd.records,
    topLegends: hleGetTopLegends(100),
    greatestEmperor: hleGetGreatestByCategory(["found_empire", "civ_empire", "empire", "worldlord", "found_nation", "civ_nation"]),
    strongestSectMaster: hleGetGreatestByCategory(["sect_found"]),
    greatestVillain: hleGetGreatestVillain(),
  };
}

// ============================================================
// SAVE / LOAD
// ============================================================
function heroLegendEngine_save() {
  try {
    localStorage.setItem(HLE_SAVE_KEY, JSON.stringify(window.heroLegendData));
  } catch (e) { console.warn("heroLegendEngine save failed:", e); }
}

function heroLegendEngine_load() {
  try {
    const raw = localStorage.getItem(HLE_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.heroLegendData = Object.assign(hleDefaultData(), parsed);
      // ensure nested objects exist after merge
      window.heroLegendData.credited = Object.assign(hleDefaultData().credited, parsed.credited || {});
      window.heroLegendData.records  = Object.assign(hleDefaultData().records,  parsed.records  || {});
    } else {
      window.heroLegendData = hleDefaultData();
    }
  } catch (e) {
    console.warn("heroLegendEngine load failed:", e);
    window.heroLegendData = hleDefaultData();
  }
}

// ============================================================
// MIGRATION — sync existing world with hero data
// ============================================================
function heroLegendEngine_init() {
  heroLegendEngine_load();
  const hd = window.heroLegendData;

  // Migrate existing NPCs: ensure legendScore field exists
  [].concat(window.npcs || []).concat(window.hallOfFame || []).forEach(npc => {
    if (npc.legendScore === undefined) npc.legendScore = 0;
    if (npc.legendScore > 0 && !hd.heroes[npc.id] && npc.status !== "dead") {
      hd.heroes[npc.id] = {
        id: npc.id, name: npc.name, family: npc.family,
        legendScore: npc.legendScore, titles: (npc.titles || []).slice(), achievements: [],
      };
    }
  });

  hleUpdateRecords();
  heroLegendEngine_patch();
}

// ============================================================
// PATCH HOOKS INTO EXISTING ENGINES
// ============================================================
function heroLegendEngine_patch() {
  // --- addWorldHistory hook ---
  if (!window._hle_patchedWorldHistory && typeof window.addWorldHistory === "function") {
    window._hle_patchedWorldHistory = true;
    const orig = window.addWorldHistory;
    window.addWorldHistory = function (eventType, description, extra) {
      const result = orig.apply(this, arguments);
      try { hleOnWorldEvent(eventType, description, extra); } catch (e) { console.warn("hleOnWorldEvent error:", e); }
      return result;
    };
  }

  // --- killNPC hook ---
  if (!window._hle_patchedKillNPC && typeof window.killNPC === "function") {
    window._hle_patchedKillNPC = true;
    const origKill = window.killNPC;
    window.killNPC = function (npc, reason) {
      const result = origKill.apply(this, arguments);
      try { hleHandleDeath(npc, reason); } catch (e) { console.warn("hleHandleDeath error:", e); }
      return result;
    };
  }

  // --- simulateWorld tick hook ---
  if (!window._hle_patchedSim && typeof window.simulateWorld === "function") {
    window._hle_patchedSim = true;
    const origSim = window.simulateWorld;
    window.simulateWorld = function () {
      const result = origSim.apply(this, arguments);
      try { hleTickScans(); } catch (e) { console.warn("hleTickScans error:", e); }
      return result;
    };
  }
}

// ============================================================
// UI — PANEL RENDER: 📖 ANH HÙNG & HUYỀN THOẠI
// ============================================================
let _hleActiveTab = "top";

function renderHeroLegendPanel() {
  const container = document.getElementById("panel-hero-legend");
  if (!container) return;
  const stats = hleGetStatistics();

  container.innerHTML = `
    <div class="hle-wrap">
      <div class="hle-header">
        <div class="hle-title">📖 SỔ SÁCH ANH HÙNG &amp; HUYỀN THOẠI</div>
        <div class="hle-subtitle">Lịch sử ghi danh những con người đã thay đổi thiên hạ</div>
      </div>

      <div class="hle-stats-row">
        <div class="hle-stat"><div class="hle-stat-val">${stats.totalHeroes}</div><div class="hle-stat-label">Đang Sống</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${stats.totalLegends}</div><div class="hle-stat-label">Đã Khuất</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${stats.monuments}</div><div class="hle-stat-label">🗿 Tượng Đài</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${stats.cults}</div><div class="hle-stat-label">⛩ Tín Ngưỡng</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${stats.artifacts}</div><div class="hle-stat-label">🗡 Di Vật</div></div>
      </div>

      <div class="hle-tabs">
        <button class="hle-tab ${_hleActiveTab === 'top' ? 'active' : ''}" onclick="hleSwitchTab('top')">🏆 Top 100</button>
        <button class="hle-tab ${_hleActiveTab === 'records' ? 'active' : ''}" onclick="hleSwitchTab('records')">📊 Kỷ Lục</button>
        <button class="hle-tab ${_hleActiveTab === 'monuments' ? 'active' : ''}" onclick="hleSwitchTab('monuments')">🗿 Tượng Đài</button>
        <button class="hle-tab ${_hleActiveTab === 'cults' ? 'active' : ''}" onclick="hleSwitchTab('cults')">⛩ Tín Ngưỡng</button>
        <button class="hle-tab ${_hleActiveTab === 'artifacts' ? 'active' : ''}" onclick="hleSwitchTab('artifacts')">🗡 Di Vật</button>
        <button class="hle-tab ${_hleActiveTab === 'memory' ? 'active' : ''}" onclick="hleSwitchTab('memory')">📜 Ký Sự</button>
      </div>

      <div class="hle-content" id="hleContent">
        ${hleRenderTab(_hleActiveTab, stats)}
      </div>
    </div>
  `;
}

function hleSwitchTab(name) {
  _hleActiveTab = name;
  renderHeroLegendPanel();
}

function hleRenderTab(name, stats) {
  switch (name) {
    case "top": return hleRenderTopList(stats);
    case "records": return hleRenderRecords(stats);
    case "monuments": return hleRenderMonuments();
    case "cults": return hleRenderCults();
    case "artifacts": return hleRenderArtifacts();
    case "memory": return hleRenderMemory();
    default: return "";
  }
}

function hleRenderTopList(stats) {
  if (!stats.topLegends.length) {
    return `<div class="hle-empty">Thiên hạ chưa sinh ra anh hùng huyền thoại nào. Hãy chờ thời gian trôi qua...</div>`;
  }
  return `
    <div class="hle-list">
      ${stats.topLegends.map((h, i) => {
        const tier = hleClassify(h.legendScore);
        const lastTitle = (h.titles && h.titles.length) ? h.titles[h.titles.length - 1] : "";
        return `
        <div class="hle-row" style="border-left:3px solid ${tier.color}">
          <div class="hle-rank">#${i + 1}</div>
          <div class="hle-info">
            <div class="hle-name">${tier.icon} ${h.name} ${lastTitle ? `<span class="hle-title-tag">${lastTitle}</span>` : ""}</div>
            <div class="hle-meta">${tier.name} · Legend Score: <b style="color:${tier.color}">${h.legendScore}</b>
              · ${h.alive ? '<span class="hle-alive">Đang Sống</span>' : `<span class="hle-dead">Đã Khuất (Năm ${h.deathYear})</span>`}
            </div>
            <div class="hle-achievements">${(h.achievements || []).slice(-3).map(a => `<span class="hle-ach">${a.label}</span>`).join("")}</div>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

function hleRenderRecords(stats) {
  const r = stats.records;
  const rows = [
    { icon: "💪", label: "Người Mạnh Nhất Lịch Sử", value: r.strongest ? `${r.strongest.name} — ${r.strongest.realmName}` : "Chưa có" },
    { icon: "💰", label: "Người Giàu Nhất Lịch Sử", value: r.richest ? `${r.richest.name} — ${(r.richest.wealth || 0).toLocaleString()} linh thạch` : "Chưa có" },
    { icon: "⚔️", label: "Sát Thủ Khét Tiếng Nhất", value: r.mostKills ? `${r.mostKills.name} — ${r.mostKills.killCount} mạng` : "Chưa có" },
    { icon: "⏳", label: "Người Sống Lâu Nhất", value: r.longestLived ? `${r.longestLived.name} — ${r.longestLived.age} năm` : "Chưa có" },
    { icon: "👑", label: "Hoàng Đế Vĩ Đại Nhất", value: stats.greatestEmperor ? `${stats.greatestEmperor.name} (Score ${stats.greatestEmperor.legendScore})` : "Chưa có" },
    { icon: "🏯", label: "Tông Chủ Mạnh Nhất", value: stats.strongestSectMaster ? `${stats.strongestSectMaster.name} (Score ${stats.strongestSectMaster.legendScore})` : "Chưa có" },
    { icon: "👹", label: "Kẻ Phản Diện Khét Tiếng Nhất", value: stats.greatestVillain ? `${stats.greatestVillain.name} (Score ${stats.greatestVillain.legendScore})` : "Chưa có" },
  ];
  return `
    <div class="hle-records">
      ${rows.map(r => `
        <div class="hle-record-row">
          <div class="hle-record-icon">${r.icon}</div>
          <div class="hle-record-label">${r.label}</div>
          <div class="hle-record-value">${r.value}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function hleRenderMonuments() {
  const hd = window.heroLegendData;
  if (!hd.monuments.length) return `<div class="hle-empty">Chưa có tượng đài, lăng mộ hay đền thờ nào được xây dựng.</div>`;
  return `
    <div class="hle-list">
      ${hd.monuments.slice(0, 50).map(m => `
        <div class="hle-row">
          <div class="hle-rank">${m.icon}</div>
          <div class="hle-info">
            <div class="hle-name">${m.name}</div>
            <div class="hle-meta">📍 ${m.location} · Năm ${m.year} · Dành cho ${m.tierName}</div>
            <div class="hle-desc">${m.desc}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function hleRenderCults() {
  const hd = window.heroLegendData;
  if (!hd.cults.length) return `<div class="hle-empty">Chưa có tín ngưỡng anh hùng nào được hình thành.</div>`;
  return `
    <div class="hle-list">
      ${hd.cults.slice(0, 50).map(c => `
        <div class="hle-row">
          <div class="hle-rank">⛩</div>
          <div class="hle-info">
            <div class="hle-name">${c.heroName}</div>
            <div class="hle-meta">📍 ${c.location} · Năm ${c.year} · 👥 ${(c.followers || 0).toLocaleString()} tín đồ</div>
            <div class="hle-desc">${c.desc}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function hleRenderArtifacts() {
  const hd = window.heroLegendData;
  if (!hd.artifacts.length) return `<div class="hle-empty">Chưa có pháp bảo, thần khí huyền thoại nào lưu lạc nhân gian.</div>`;
  return `
    <div class="hle-list">
      ${hd.artifacts.slice(0, 50).map(a => `
        <div class="hle-row">
          <div class="hle-rank">🗡</div>
          <div class="hle-info">
            <div class="hle-name">${a.name} <span class="hle-title-tag">${a.type}</span></div>
            <div class="hle-meta">Chủ nhân cũ: ${a.formerOwner} · Năm ${a.year} · 📍 ${a.location}</div>
            <div class="hle-desc">${a.desc}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function hleRenderMemory() {
  const hd = window.heroLegendData;
  if (!hd.legendaryMemory.length) return `<div class="hle-empty">Thiên hạ chưa ghi lại sự kiện huyền thoại nào.</div>`;
  return `
    <div class="hle-list">
      ${hd.legendaryMemory.slice(0, 100).map(m => {
        const tier = m.tier ? HLE_TIERS.find(t => t.id === m.tier) : null;
        return `
        <div class="hle-mem-row">
          <div class="hle-mem-year">Năm ${m.year}</div>
          <div class="hle-mem-text" style="${tier ? `color:${tier.color}` : ""}">${m.text}</div>
        </div>`;
      }).join("")}
    </div>
  `;
}

// ============================================================
// CSS INJECTION
// ============================================================
(function injectHeroLegendCSS() {
  const style = document.createElement("style");
  style.textContent = `
.hle-wrap { padding: 14px; }
.hle-header { text-align: center; margin-bottom: 14px; }
.hle-title { font-size: 16px; font-weight: 800; letter-spacing: 1px; color: var(--gold, #fbbf24); }
.hle-subtitle { font-size: 11px; color: var(--white-dim, #888); margin-top: 4px; }

.hle-stats-row {
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  margin-bottom: 14px;
}
.hle-stat {
  flex: 1; min-width: 80px; text-align: center;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 6px;
}
.hle-stat-val { font-size: 18px; font-weight: 800; color: var(--gold, #fbbf24); }
.hle-stat-label { font-size: 10px; color: var(--white-dim, #888); margin-top: 2px; }

.hle-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.hle-tab {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border, #2a2a4a);
  color: var(--white-dim, #888); padding: 6px 12px; border-radius: 6px;
  font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.hle-tab.active, .hle-tab:hover {
  background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.4); color: var(--gold, #fbbf24);
}

.hle-empty { text-align: center; padding: 40px 14px; color: var(--white-dim, #888); font-size: 13px; }

.hle-list { display: flex; flex-direction: column; gap: 8px; }
.hle-row {
  display: flex; gap: 10px; align-items: flex-start;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 10px;
}
.hle-rank { font-size: 16px; font-weight: 800; color: var(--white-dim, #888); min-width: 28px; text-align: center; }
.hle-info { flex: 1; }
.hle-name { font-size: 13px; font-weight: 700; color: var(--white-main, #eee); }
.hle-meta { font-size: 11px; color: var(--white-dim, #888); margin-top: 2px; }
.hle-desc { font-size: 11px; color: var(--white-dim, #888); margin-top: 4px; font-style: italic; }
.hle-alive { color: #4ade80; }
.hle-dead { color: #94a3b8; }
.hle-title-tag {
  display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 10px;
  background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3);
  color: var(--gold, #fbbf24); margin-left: 4px;
}
.hle-achievements { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
.hle-ach {
  font-size: 10px; padding: 1px 6px; border-radius: 8px;
  background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.25); color: #93c5fd;
}

.hle-records { display: flex; flex-direction: column; gap: 6px; }
.hle-record-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 10px; font-size: 12px;
}
.hle-record-icon { font-size: 16px; }
.hle-record-label { flex: 1; color: var(--white-dim, #888); }
.hle-record-value { font-weight: 700; color: var(--gold, #fbbf24); text-align: right; }

.hle-mem-row {
  display: flex; gap: 8px; font-size: 11px; padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.hle-mem-year { color: var(--gold, #fbbf24); min-width: 56px; font-weight: 600; }
.hle-mem-text { color: var(--white-dim, #ccc); }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// BOOTSTRAP
// ============================================================
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", heroLegendEngine_init);
  } else {
    heroLegendEngine_init();
  }
})();

// ============================================================
// EXPORTS
// ============================================================
window.heroLegendEngine_save   = heroLegendEngine_save;
window.heroLegendEngine_load   = heroLegendEngine_load;
window.heroLegendEngine_init   = heroLegendEngine_init;
window.hleSwitchTab            = hleSwitchTab;
window.renderHeroLegendPanel    = renderHeroLegendPanel;
window.heroLegendEngine = {
  init:        heroLegendEngine_init,
  save:        heroLegendEngine_save,
  load:        heroLegendEngine_load,
  tick:        hleTickScans,
  award:       hleAward,
  getStats:    hleGetStatistics,
  classify:    hleClassify,
  renderPanel: renderHeroLegendPanel,
  getData:     () => window.heroLegendData,
};
