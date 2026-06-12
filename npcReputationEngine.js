// ============================================================
// NPC REPUTATION ENGINE V1
// CREATOR GOD V6 — PHASE NEXT
// Hệ thống Danh Tiếng, Hình Ảnh Công Chúng, Sợ Hãi, Tin Đồn,
// Truy Nã, Anh Hùng / Kẻ Phản Diện, Danh Tiếng Môn Phái /
// Quốc Gia / Triều Đại, Bảng Xếp Hạng Danh Tiếng
// Tương thích 100% với save cũ — KHÔNG xóa dữ liệu, KHÔNG reset world
// ============================================================

// ===== GLOBAL STATE (migrate-safe) =====
// window.npcReputationData — lưu vào localStorage key: cgv6_npcReputationEngine

const NRE_SAVE_KEY = "cgv6_npcReputationEngine";

// ===== REPUTATION / IMAGE TIERS =====
const NRE_REP_TIERS = [
  { min: 800,  id: "saint",     name: "Thánh Nhân",       color: "#fde047", icon: "✨" },
  { min: 400,  id: "hero",      name: "Anh Hùng",          color: "#4ade80", icon: "⚔️" },
  { min: 150,  id: "respected", name: "Được Kính Trọng",  color: "#60a5fa", icon: "🌟" },
  { min: -149, id: "neutral",   name: "Bình Thường",       color: "#94a3b8", icon: "👤" },
  { min: -399, id: "disliked",  name: "Bị Ghét",           color: "#fb923c", icon: "⚠️" },
  { min: -799, id: "villain",   name: "Kẻ Phản Diện",     color: "#f87171", icon: "👹" },
  { min: -999999, id: "demon",  name: "Ma Đầu",            color: "#9333ea", icon: "💀" },
];

function nreClassifyReputation(rep) {
  rep = rep || 0;
  for (const t of NRE_REP_TIERS) { if (rep >= t.min) return t; }
  return NRE_REP_TIERS[NRE_REP_TIERS.length - 1];
}

// ===== FEAR TIERS =====
const NRE_FEAR_TIERS = [
  { min: 2000, id: "terrifying", name: "Khiếp Sợ Toàn Thiên Hạ", color: "#9333ea", icon: "💀" },
  { min: 800,  id: "dreaded",    name: "Bị Khiếp Sợ",            color: "#f87171", icon: "😱" },
  { min: 300,  id: "feared",     name: "Bị Sợ Hãi",              color: "#fb923c", icon: "😨" },
  { min: 0,    id: "none",       name: "Không Đáng Sợ",          color: "#94a3b8", icon: "🙂" },
];

function nreClassifyFear(fear) {
  fear = fear || 0;
  for (const t of NRE_FEAR_TIERS) { if (fear >= t.min) return t; }
  return NRE_FEAR_TIERS[NRE_FEAR_TIERS.length - 1];
}

// ===== HERO / VILLAIN TITLE POOLS =====
const NRE_HERO_TITLES   = ["Người Bảo Vệ", "Thánh Nhân", "Anh Hùng", "Hiền Triết"];
const NRE_VILLAIN_TITLES = ["Chúa Tể Quỷ", "Bạo Chúa", "Đồ Tể", "Kẻ Diệt"];

// ===== KARMA ACTION RULES =====
// type -> { karma, reputation, fame, infamy, fear, label }
const NRE_ACTION_RULES = {
  save_life:        { karma: 8,   reputation: 6,   fame: 2,  infamy: 0,  fear: 0,   label: "Cứu mạng người khác" },
  help_sect:        { karma: 12,  reputation: 10,  fame: 4,  infamy: 0,  fear: 0,   label: "Giúp đỡ giáo phái" },
  defeat_evil_boss: { karma: 40,  reputation: 35,  fame: 25, infamy: 0,  fear: 0,   label: "Đánh bại ông trùm độc ác" },
  protect_city:     { karma: 30,  reputation: 28,  fame: 15, infamy: 0,  fear: 0,   label: "Bảo vệ thành phố" },

  murder:           { karma: -20, reputation: -18, fame: 5,  infamy: 25, fear: 40,  label: "Giết người" },
  massacre:         { karma: -120,reputation: -100,fame: 30, infamy: 150,fear: 400, label: "Thảm sát" },
  betrayal:         { karma: -35, reputation: -30, fame: 8,  infamy: 35, fear: 20,  label: "Phản bội" },
  enslavement:      { karma: -45, reputation: -40, fame: 10, infamy: 45, fear: 60,  label: "Nô lệ hóa" },
  corruption:       { karma: -25, reputation: -22, fame: 5,  infamy: 25, fear: 10,  label: "Tham nhũng" },
};

// ===== WANTED CRIMES =====
const NRE_WANTED_CRIMES = {
  murder:    { label: "Giết người",  severity: 1 },
  treason:   { label: "Phản quốc",   severity: 2 },
  rebellion: { label: "Nổi loạn",    severity: 3 },
};

// ===== RUMOR TEMPLATES =====
const NRE_RUMOR_TEMPLATES = [
  { text: (n) => `${n} sở hữu một bảo vật thần thánh.`, kind: "treasure" },
  { text: (n) => `${n} đã đột phá lên cảnh giới mới trong bí mật.`, kind: "power" },
  { text: (n) => `${n} có quan hệ bí mật với một thế lực hắc ám.`, kind: "scandal" },
  { text: (n) => `${n} từng cứu cả một thị trấn khỏi diệt vong.`, kind: "heroism" },
  { text: (n) => `${n} đang truy tìm một di tích cổ đại thất lạc.`, kind: "quest" },
  { text: (n) => `${n} thực ra là hậu duệ của một dòng dõi hoàng tộc đã mất.`, kind: "lineage" },
];

const NRE_RUMOR_VERACITY = ["true", "false", "exaggerated"];

// ============================================================
// DEFAULT STATE
// ============================================================
function nreDefaultData() {
  return {
    npcRep: {},        // npcId -> { reputation, fame, infamy, karma, fear, titles:[], wanted:[], lastTier, lastFearTier }
    sectRep: {},       // sectId -> { reputation, fame }
    countryRep: {},    // countryId -> { reputation, fame }
    dynastyRep: {},    // dynastyKey -> { reputation }
    rumors: [],        // { id, npcId, npcName, text, kind, veracity, year }
    reputationMemory: [], // permanent reputation/fame/wanted event log
    records: {
      mostFamous:      null, // { id, name, fame, year }
      mostFeared:      null, // { id, name, fear, year }
      mostRespected:   null, // { id, name, reputation, year }
      mostEvil:        null, // { id, name, reputation, year }
      highestKarmaEver:null, // { id, name, karma, year }
      lowestKarmaEver: null, // { id, name, karma, year }
    },
    meta: { version: 1 },
  };
}

window.npcReputationData = window.npcReputationData || nreDefaultData();

// ============================================================
// HELPERS — FIND NPC / SECT / COUNTRY
// ============================================================
function nreFindNpcById(id) {
  if (id === null || id === undefined) return null;
  return (window.npcs || []).find(n => n.id === id)
      || (window.hallOfFame || []).find(n => n.id === id)
      || null;
}

function nreFindNpcByName(name) {
  if (!name) return null;
  return (window.npcs || []).find(n => n.name === name)
      || (window.hallOfFame || []).find(n => n.name === name)
      || null;
}

function nreResolveNpc(ref) {
  if (ref === null || ref === undefined) return null;
  if (typeof ref === "object") return ref;
  if (typeof ref === "number") return nreFindNpcById(ref);
  if (typeof ref === "string") {
    const asNum = Number(ref);
    if (!isNaN(asNum) && String(asNum) === ref) {
      const byId = nreFindNpcById(asNum);
      if (byId) return byId;
    }
    return nreFindNpcByName(ref);
  }
  return null;
}

function nreFindSectById(id) {
  return (window.sects || []).find(s => s.id === id) || null;
}

function nreFindCountryById(id) {
  return (window.countries || []).find(c => c.id === id) || null;
}

// ============================================================
// CORE — GET OR CREATE REPUTATION RECORD
// ============================================================
function nreGetOrCreateNpcRep(npc) {
  const rd = window.npcReputationData;
  let rec = rd.npcRep[npc.id];
  if (!rec) {
    rec = {
      id: npc.id,
      name: npc.name,
      reputation: npc.reputation || 0,
      fame: npc.fame || 0,
      infamy: npc.infamy || 0,
      karma: (npc.karma !== undefined) ? npc.karma : 0,
      fear: npc.fear || 0,
      titles: [],
      wanted: [],
      lastTier: null,
      lastFearTier: null,
    };
    rd.npcRep[npc.id] = rec;
  }
  return rec;
}

function nreGetOrCreateSectRep(sect) {
  const rd = window.npcReputationData;
  let rec = rd.sectRep[sect.id];
  if (!rec) {
    rec = { id: sect.id, name: sect.name, reputation: 0, fame: 0 };
    rd.sectRep[sect.id] = rec;
  }
  return rec;
}

function nreGetOrCreateCountryRep(country) {
  const rd = window.npcReputationData;
  let rec = rd.countryRep[country.id];
  if (!rec) {
    rec = { id: country.id, name: country.name, reputation: 0, fame: 0 };
    rd.countryRep[country.id] = rec;
  }
  return rec;
}

function nreGetOrCreateDynastyRep(dynastyKey, dynastyName) {
  const rd = window.npcReputationData;
  let rec = rd.dynastyRep[dynastyKey];
  if (!rec) {
    rec = { key: dynastyKey, name: dynastyName || dynastyKey, reputation: 0 };
    rd.dynastyRep[dynastyKey] = rec;
  }
  return rec;
}

// ============================================================
// CORE — APPLY ACTION (karma / reputation / fame / infamy / fear)
// ============================================================
function nreApplyAction(ref, actionType, customLabel, extraData) {
  const npc = nreResolveNpc(ref);
  if (!npc) return null;

  const rule = NRE_ACTION_RULES[actionType];
  if (!rule) {
    console.warn("npcReputationEngine: unknown action type", actionType);
    return null;
  }

  const rec = nreGetOrCreateNpcRep(npc);
  const beforeTier = nreClassifyReputation(rec.reputation);
  const beforeFearTier = nreClassifyFear(rec.fear);

  rec.karma      = (rec.karma || 0) + rule.karma;
  rec.reputation = (rec.reputation || 0) + rule.reputation;
  rec.fame       = (rec.fame || 0) + rule.fame;
  rec.infamy     = (rec.infamy || 0) + rule.infamy;
  rec.fear       = Math.max(0, (rec.fear || 0) + rule.fear);
  rec.name       = npc.name;

  // mirror onto live NPC object for UI/save compatibility
  npc.reputation = rec.reputation;
  npc.fame       = rec.fame;
  npc.infamy     = rec.infamy;
  npc.karma      = rec.karma;
  npc.fear       = rec.fear;

  nreLog(`${npc.name}: ${customLabel || rule.label}`, npc, "action");

  const afterTier = nreClassifyReputation(rec.reputation);
  if (afterTier.id !== beforeTier.id) {
    nreHandleTierChange(npc, rec, beforeTier, afterTier);
  }

  const afterFearTier = nreClassifyFear(rec.fear);
  if (afterFearTier.id !== beforeFearTier.id) {
    nreHandleFearTierChange(npc, rec, beforeFearTier, afterFearTier);
  }

  // wanted system hook
  if (extraData && extraData.wantedCrime) {
    nreMarkWanted(npc, extraData.wantedCrime, extraData.countryId);
  }

  nreUpdateRecords();
  nreAssignTitles(npc, rec, afterTier);

  return rec;
}

// ============================================================
// TIER CHANGE HANDLERS
// ============================================================
function nreHandleTierChange(npc, rec, before, after) {
  const beforeIdx = NRE_REP_TIERS.findIndex(t => t.id === before.id);
  const afterIdx  = NRE_REP_TIERS.findIndex(t => t.id === after.id);
  const improved = afterIdx < beforeIdx; // lower index in array = higher rank (array ordered best->worst)

  let msg;
  if (improved) {
    msg = `${npc.name} được thiên hạ biết đến với danh tiếng ${after.icon} ${after.name}.`;
  } else {
    msg = `${npc.name} đã trở thành ${after.icon} ${after.name} trong mắt thiên hạ.`;
  }
  nreLog(msg, npc, "tier");
}

function nreHandleFearTierChange(npc, rec, before, after) {
  const beforeIdx = NRE_FEAR_TIERS.findIndex(t => t.id === before.id);
  const afterIdx  = NRE_FEAR_TIERS.findIndex(t => t.id === after.id);
  if (afterIdx <= beforeIdx) return; // only announce increasing fear
  const msg = `${npc.name} khiến thiên hạ ${after.icon} ${after.name}.`;
  nreLog(msg, npc, "fear");
}

// ============================================================
// HERO / VILLAIN TITLE ASSIGNMENT
// ============================================================
function nreAssignTitles(npc, rec, repTier) {
  npc.titles = npc.titles || [];
  rec.titles = rec.titles || [];

  // Hero: high karma + good reputation
  if ((rec.karma || 0) >= 300 && (rec.reputation || 0) >= 400) {
    const title = NRE_HERO_TITLES[Math.min(NRE_HERO_TITLES.length - 1,
      Math.floor(((rec.reputation || 0) - 400) / 200))];
    if (!rec.titles.includes(title)) {
      rec.titles.push(title);
      if (!npc.titles.includes(title)) npc.titles.push(title);
      nreLog(`${npc.name} được thiên hạ tôn xưng là "${title}"!`, npc, "hero_title");
    }
  }

  // Villain: high infamy + negative karma
  if ((rec.infamy || 0) >= 100 && (rec.karma || 0) <= -100) {
    const title = NRE_VILLAIN_TITLES[Math.min(NRE_VILLAIN_TITLES.length - 1,
      Math.floor(((rec.infamy || 0) - 100) / 200))];
    if (!rec.titles.includes(title)) {
      rec.titles.push(title);
      if (!npc.titles.includes(title)) npc.titles.push(title);
      nreLog(`${npc.name} bị thiên hạ gọi là "${title}"!`, npc, "villain_title");
    }
  }
}

// ============================================================
// WANTED SYSTEM
// ============================================================
function nreMarkWanted(npc, crimeType, countryId) {
  const rec = nreGetOrCreateNpcRep(npc);
  const crime = NRE_WANTED_CRIMES[crimeType];
  if (!crime) return;

  rec.wanted = rec.wanted || [];
  const already = rec.wanted.find(w => w.crime === crimeType && w.countryId === countryId);
  if (already) return;

  const country = countryId !== undefined ? nreFindCountryById(countryId) : null;
  rec.wanted.push({
    crime: crimeType,
    label: crime.label,
    severity: crime.severity,
    countryId: countryId !== undefined ? countryId : null,
    countryName: country ? country.name : null,
    year: window.year || 1,
  });

  npc.wanted = rec.wanted;

  const msg = country
    ? `${npc.name} bị ${country.name} treo thưởng truy nã vì tội ${crime.label}!`
    : `${npc.name} bị truy nã vì tội ${crime.label}!`;
  nreLog(msg, npc, "wanted");
}

function nreIsWanted(ref) {
  const npc = nreResolveNpc(ref);
  if (!npc) return false;
  const rec = window.npcReputationData.npcRep[npc.id];
  return !!(rec && rec.wanted && rec.wanted.length > 0);
}

// ============================================================
// RUMOR SYSTEM
// ============================================================
function nreSpreadRumor(ref, kind, veracity) {
  const npc = nreResolveNpc(ref);
  if (!npc) return null;

  const pool = kind
    ? NRE_RUMOR_TEMPLATES.filter(t => t.kind === kind)
    : NRE_RUMOR_TEMPLATES;
  const template = pool[Math.floor(Math.random() * pool.length)] || NRE_RUMOR_TEMPLATES[0];

  veracity = veracity || NRE_RUMOR_VERACITY[Math.floor(Math.random() * NRE_RUMOR_VERACITY.length)];

  const rumor = {
    id: `rumor_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    npcId: npc.id,
    npcName: npc.name,
    text: template.text(npc.name),
    kind: template.kind,
    veracity,
    year: window.year || 1,
  };

  window.npcReputationData.rumors.unshift(rumor);
  if (window.npcReputationData.rumors.length > 500) window.npcReputationData.rumors.pop();

  // exaggerated/true rumors give a small fame bump
  if (veracity !== "false") {
    const rec = nreGetOrCreateNpcRep(npc);
    rec.fame = (rec.fame || 0) + (veracity === "true" ? 3 : 1);
    npc.fame = rec.fame;
  }

  return rumor;
}

function nreTryGenerateRumors() {
  if (typeof window.chance !== "function") return;
  (window.npcs || []).forEach(npc => {
    if (npc.status !== "alive") return;
    const rec = window.npcReputationData.npcRep[npc.id];
    if (!rec) return;
    // famous or infamous npcs are more likely to spawn rumors
    const noteworthy = Math.abs(rec.reputation || 0) + (rec.fame || 0) + (rec.infamy || 0);
    if (noteworthy < 100) return;
    if (!window.chance(0.003)) return;
    nreSpreadRumor(npc);
  });
}

// ============================================================
// FACTION (SECT / COUNTRY / DYNASTY) REPUTATION
// ============================================================
function nreAdjustSectReputation(sectRef, repDelta, fameDelta) {
  const sect = (typeof sectRef === "object") ? sectRef : nreFindSectById(sectRef);
  if (!sect) return null;
  const rec = nreGetOrCreateSectRep(sect);
  rec.reputation += (repDelta || 0);
  rec.fame += (fameDelta || 0);
  rec.name = sect.name;
  sect.reputation = rec.reputation;
  sect.fame = rec.fame;
  return rec;
}

function nreAdjustCountryReputation(countryRef, repDelta, fameDelta) {
  const country = (typeof countryRef === "object") ? countryRef : nreFindCountryById(countryRef);
  if (!country) return null;
  const rec = nreGetOrCreateCountryRep(country);
  rec.reputation += (repDelta || 0);
  rec.fame += (fameDelta || 0);
  rec.name = country.name;
  country.reputation = rec.reputation;
  country.fame = rec.fame;
  return rec;
}

function nreAdjustDynastyReputation(dynastyKey, dynastyName, repDelta) {
  const rec = nreGetOrCreateDynastyRep(dynastyKey, dynastyName);
  rec.reputation += (repDelta || 0);
  if (window.dynasties && window.dynasties[dynastyKey]) {
    window.dynasties[dynastyKey].reputation = rec.reputation;
  }
  return rec;
}

// Country/ruler quality hook: good rulers raise dynasty prestige, bad rulers lower it
function nreEvaluateRulerReputation(ruler, dynastyKey, dynastyName) {
  const rec = nreGetOrCreateNpcRep(ruler);
  const repTier = nreClassifyReputation(rec.reputation);
  let delta = 0;
  if (repTier.id === "saint" || repTier.id === "hero") delta = 15;
  else if (repTier.id === "respected") delta = 8;
  else if (repTier.id === "disliked") delta = -8;
  else if (repTier.id === "villain" || repTier.id === "demon") delta = -15;
  if (delta !== 0) nreAdjustDynastyReputation(dynastyKey, dynastyName, delta);
}

// ============================================================
// LOGGING / WORLD HISTORY INTEGRATION
// ============================================================
function nreLog(text, npc, eventKind) {
  window.npcReputationData.reputationMemory.unshift({
    year: window.year || 1,
    npcId: npc ? npc.id : null,
    name: npc ? npc.name : null,
    text,
    kind: eventKind || null,
  });
  if (window.npcReputationData.reputationMemory.length > 2000) {
    window.npcReputationData.reputationMemory.pop();
  }
  if (typeof window.addWorldHistory === "function") {
    window.addWorldHistory("reputation", text, { npcId: npc ? npc.id : null, npcName: npc ? npc.name : null });
  }
  if (typeof window.addLog === "function") {
    window.addLog(`🌟 ${text}`, "important");
  }
}

// ============================================================
// ALL-TIME RECORDS
// ============================================================
function nreUpdateRecords() {
  const rd = window.npcReputationData;
  const recs = Object.values(rd.npcRep);

  const tryUpdate = (key, value, field) => {
    const cur = rd.records[key];
    if (value === undefined || value === null) return;
    if (!cur || value > cur[field]) {
      // build replacement using same field naming
    }
  };

  recs.forEach(rec => {
    if (rec.fame !== undefined) {
      if (!rd.records.mostFamous || rec.fame > rd.records.mostFamous.fame) {
        rd.records.mostFamous = { id: rec.id, name: rec.name, fame: rec.fame, year: window.year || 1 };
      }
    }
    if (rec.fear !== undefined) {
      if (!rd.records.mostFeared || rec.fear > rd.records.mostFeared.fear) {
        rd.records.mostFeared = { id: rec.id, name: rec.name, fear: rec.fear, year: window.year || 1 };
      }
    }
    if (rec.reputation !== undefined) {
      if (!rd.records.mostRespected || rec.reputation > rd.records.mostRespected.reputation) {
        rd.records.mostRespected = { id: rec.id, name: rec.name, reputation: rec.reputation, year: window.year || 1 };
      }
      if (!rd.records.mostEvil || rec.reputation < rd.records.mostEvil.reputation) {
        rd.records.mostEvil = { id: rec.id, name: rec.name, reputation: rec.reputation, year: window.year || 1 };
      }
    }
    if (rec.karma !== undefined) {
      if (!rd.records.highestKarmaEver || rec.karma > rd.records.highestKarmaEver.karma) {
        rd.records.highestKarmaEver = { id: rec.id, name: rec.name, karma: rec.karma, year: window.year || 1 };
      }
      if (!rd.records.lowestKarmaEver || rec.karma < rd.records.lowestKarmaEver.karma) {
        rd.records.lowestKarmaEver = { id: rec.id, name: rec.name, karma: rec.karma, year: window.year || 1 };
      }
    }
  });
}

// ============================================================
// LEADERBOARDS / STATISTICS
// ============================================================
function nreGetTopList(field, limit, sortDesc) {
  const rd = window.npcReputationData;
  const entries = Object.values(rd.npcRep)
    .map(rec => {
      const npc = nreFindNpcById(rec.id);
      return {
        id: rec.id,
        name: rec.name,
        value: rec[field] || 0,
        status: npc ? npc.status : "unknown",
        titles: rec.titles || [],
      };
    })
    .sort((a, b) => sortDesc === false ? a.value - b.value : b.value - a.value);
  return entries.slice(0, limit || 20);
}

function nreGetStatistics() {
  const rd = window.npcReputationData;
  const recs = Object.values(rd.npcRep);

  const heroes = recs.filter(r => (r.titles || []).some(t => NRE_HERO_TITLES.includes(t)));
  const villains = recs.filter(r => (r.titles || []).some(t => NRE_VILLAIN_TITLES.includes(t)));

  return {
    totalHeroes: heroes.length,
    totalVillains: villains.length,
    totalRumors: rd.rumors.length,
    totalWanted: recs.filter(r => (r.wanted || []).length > 0).length,
    records: rd.records,
    mostFamous:    nreGetTopList("fame", 100, true),
    mostFeared:    nreGetTopList("fear", 100, true),
    mostRespected: nreGetTopList("reputation", 100, true),
    mostEvil:      nreGetTopList("reputation", 100, false),
    highestKarma:  nreGetTopList("karma", 100, true),
    lowestKarma:   nreGetTopList("karma", 100, false),
  };
}

// ============================================================
// TICK — PERIODIC SCANS
// ============================================================
function nreTickScans() {
  const rd = window.npcReputationData;

  // Reveal Reputation tab on first tick
  if (!rd._tabRevealed) {
    rd._tabRevealed = true;
    const btn = document.querySelector('.nav-btn[data-panel="npc-reputation"]');
    if (btn) {
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
      btn.classList.add('ec-unlocked-flash');
      setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
    }
  }

  // Sync any new NPCs that have reputation/fame/karma fields but no record yet
  (window.npcs || []).forEach(npc => {
    if (npc.reputation !== undefined || npc.fame !== undefined ||
        npc.infamy !== undefined || npc.karma !== undefined || npc.fear !== undefined) {
      if (!rd.npcRep[npc.id]) nreGetOrCreateNpcRep(npc);
    }
  });

  // Killer -> murder/massacre karma hooks based on killCount deltas
  (window.npcs || []).forEach(npc => {
    if (npc.status !== "alive") return;
    const rec = rd.npcRep[npc.id];
    const killCount = npc.killCount || 0;
    if (!rec) return;
    rec._lastKillCount = rec._lastKillCount || 0;
    const delta = killCount - rec._lastKillCount;
    if (delta > 0) {
      rec._lastKillCount = killCount;
      if (killCount >= 30 && !rec._massacreCredited) {
        rec._massacreCredited = true;
        nreApplyAction(npc, "massacre", `${npc.name} đã gây ra một cuộc đại thảm sát, sát hại ${killCount} sinh linh`,
          { wantedCrime: "murder" });
      }
    }
  });

  // Dynasty ruler reputation evaluation
  if (window.dynasties) {
    Object.entries(window.dynasties).forEach(([key, dyn]) => {
      if (!dyn || !dyn.currentRulerId) return;
      const ruler = nreFindNpcById(dyn.currentRulerId);
      if (ruler) nreEvaluateRulerReputation(ruler, key, dyn.name);
    });
  }

  nreTryGenerateRumors();
  nreUpdateRecords();
}

// ============================================================
// SAVE / LOAD
// ============================================================
function npcReputationEngine_save() {
  try {
    localStorage.setItem(NRE_SAVE_KEY, JSON.stringify(window.npcReputationData));
  } catch (e) { console.warn("npcReputationEngine save failed:", e); }
}

function npcReputationEngine_load() {
  try {
    const raw = localStorage.getItem(NRE_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.npcReputationData = Object.assign(nreDefaultData(), parsed);
      window.npcReputationData.records = Object.assign(nreDefaultData().records, parsed.records || {});
    } else {
      window.npcReputationData = nreDefaultData();
    }
  } catch (e) {
    console.warn("npcReputationEngine load failed:", e);
    window.npcReputationData = nreDefaultData();
  }
}

// ============================================================
// MIGRATION / INIT
// ============================================================
function npcReputationEngine_init() {
  npcReputationEngine_load();
  const rd = window.npcReputationData;

  // Migrate existing NPCs: ensure reputation fields exist on both npc and record
  [].concat(window.npcs || []).concat(window.hallOfFame || []).forEach(npc => {
    if (npc.reputation === undefined) npc.reputation = 0;
    if (npc.fame === undefined) npc.fame = 0;
    if (npc.infamy === undefined) npc.infamy = 0;
    if (npc.fear === undefined) npc.fear = 0;
    if (npc.karma === undefined) npc.karma = 0;

    if (!rd.npcRep[npc.id]) {
      rd.npcRep[npc.id] = {
        id: npc.id, name: npc.name,
        reputation: npc.reputation, fame: npc.fame, infamy: npc.infamy,
        karma: npc.karma, fear: npc.fear,
        titles: [], wanted: npc.wanted ? npc.wanted.slice() : [],
        lastTier: null, lastFearTier: null,
      };
    }
  });

  nreUpdateRecords();
  npcReputationEngine_patch();
}

// ============================================================
// PATCH HOOKS INTO EXISTING ENGINES
// ============================================================
function npcReputationEngine_patch() {
  // --- killNPC hook: murder karma for killer ---
  if (!window._nre_patchedKillNPC && typeof window.killNPC === "function") {
    window._nre_patchedKillNPC = true;
    const origKill = window.killNPC;
    window.killNPC = function (npc, reason) {
      const result = origKill.apply(this, arguments);
      try { nreHandleDeath(npc, reason); } catch (e) { console.warn("nreHandleDeath error:", e); }
      return result;
    };
  }

  // --- simulateWorld tick hook ---
  if (!window._nre_patchedSim && typeof window.simulateWorld === "function") {
    window._nre_patchedSim = true;
    const origSim = window.simulateWorld;
    window.simulateWorld = function () {
      const result = origSim.apply(this, arguments);
      try { nreTickScans(); } catch (e) { console.warn("nreTickScans error:", e); }
      return result;
    };
  }
}

function nreHandleDeath(npc, reason) {
  if (!npc) return;
  // If killed in war / by another NPC with reason "killed_by", credit the killer with murder karma
  if (reason && reason.killerId !== undefined && reason.killerId !== null) {
    const killer = nreFindNpcById(reason.killerId);
    if (killer && killer.id !== npc.id) {
      nreApplyAction(killer, "murder", `${killer.name} đã giết ${npc.name}`);
    }
  }
}

// ============================================================
// UI — PANEL RENDER: 🌟 DANH TIẾNG
// ============================================================
let _nreActiveTab = "famous";

function renderNpcReputationPanel() {
  const container = document.getElementById("panel-npc-reputation");
  if (!container) return;
  const stats = nreGetStatistics();

  container.innerHTML = `
    <div class="nre-wrap">
      <div class="nre-header">
        <div class="nre-title">🌟 DANH TIẾNG THIÊN HẠ</div>
        <div class="nre-subtitle">Ai được kính trọng, ai bị khiếp sợ, ai là kẻ phản diện</div>
      </div>

      <div class="nre-stats-row">
        <div class="nre-stat"><div class="nre-stat-val">${stats.totalHeroes}</div><div class="nre-stat-label">⚔️ Anh Hùng</div></div>
        <div class="nre-stat"><div class="nre-stat-val">${stats.totalVillains}</div><div class="nre-stat-label">👹 Phản Diện</div></div>
        <div class="nre-stat"><div class="nre-stat-val">${stats.totalWanted}</div><div class="nre-stat-label">🚨 Truy Nã</div></div>
        <div class="nre-stat"><div class="nre-stat-val">${stats.totalRumors}</div><div class="nre-stat-label">💬 Tin Đồn</div></div>
      </div>

      <div class="nre-tabs">
        <button class="nre-tab ${_nreActiveTab === 'famous' ? 'active' : ''}" onclick="nreSwitchTab('famous')">🌟 Nổi Tiếng</button>
        <button class="nre-tab ${_nreActiveTab === 'feared' ? 'active' : ''}" onclick="nreSwitchTab('feared')">😱 Đáng Sợ</button>
        <button class="nre-tab ${_nreActiveTab === 'respected' ? 'active' : ''}" onclick="nreSwitchTab('respected')">✨ Kính Trọng</button>
        <button class="nre-tab ${_nreActiveTab === 'evil' ? 'active' : ''}" onclick="nreSwitchTab('evil')">👹 Ác Độc</button>
        <button class="nre-tab ${_nreActiveTab === 'karma' ? 'active' : ''}" onclick="nreSwitchTab('karma')">☯ Nghiệp</button>
        <button class="nre-tab ${_nreActiveTab === 'wanted' ? 'active' : ''}" onclick="nreSwitchTab('wanted')">🚨 Truy Nã</button>
        <button class="nre-tab ${_nreActiveTab === 'rumors' ? 'active' : ''}" onclick="nreSwitchTab('rumors')">💬 Tin Đồn</button>
        <button class="nre-tab ${_nreActiveTab === 'memory' ? 'active' : ''}" onclick="nreSwitchTab('memory')">📜 Ký Sự</button>
        <button class="nre-tab ${_nreActiveTab === 'records' ? 'active' : ''}" onclick="nreSwitchTab('records')">📊 Kỷ Lục</button>
      </div>

      <div class="nre-content" id="nreContent">
        ${nreRenderTab(_nreActiveTab, stats)}
      </div>
    </div>
  `;
}

function nreSwitchTab(name) {
  _nreActiveTab = name;
  renderNpcReputationPanel();
}

function nreRenderTab(name, stats) {
  switch (name) {
    case "famous":    return nreRenderRankList(stats.mostFamous, "fame", "Danh Tiếng");
    case "feared":    return nreRenderRankList(stats.mostFeared, "fear", "Sợ Hãi");
    case "respected": return nreRenderRankList(stats.mostRespected, "reputation", "Danh Vọng");
    case "evil":      return nreRenderRankList(stats.mostEvil, "reputation", "Danh Vọng");
    case "karma":     return nreRenderKarmaTab(stats);
    case "wanted":    return nreRenderWantedTab();
    case "rumors":    return nreRenderRumorsTab();
    case "memory":    return nreRenderMemory();
    case "records":   return nreRenderRecords(stats);
    default: return "";
  }
}

function nreRenderRankList(list, field, fieldLabel) {
  if (!list || !list.length) return `<div class="nre-empty">Chưa có dữ liệu danh tiếng.</div>`;
  return `
    <div class="nre-list">
      ${list.slice(0, 50).map((entry, i) => {
        const tier = field === "fear" ? nreClassifyFear(entry.value) : nreClassifyReputation(entry.value);
        return `
        <div class="nre-row">
          <div class="nre-rank">#${i + 1}</div>
          <div class="nre-info">
            <div class="nre-name">${entry.name} <span class="nre-status ${entry.status === 'dead' ? 'nre-dead' : 'nre-alive'}">${entry.status === 'dead' ? '🪦' : '🟢'}</span></div>
            <div class="nre-meta" style="color:${tier.color}">${tier.icon} ${tier.name} · ${fieldLabel}: ${entry.value}</div>
            ${(entry.titles && entry.titles.length) ? `<div class="nre-titles">${entry.titles.map(t => `<span class="nre-title-tag">${t}</span>`).join("")}</div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

function nreRenderKarmaTab(stats) {
  return `
    <div class="nre-karma-grid">
      <div class="nre-karma-col">
        <div class="nre-karma-header" style="color:#4ade80">☯ Nghiệp Cao Nhất</div>
        ${nreRenderRankList(stats.highestKarma, "karma", "Nghiệp")}
      </div>
      <div class="nre-karma-col">
        <div class="nre-karma-header" style="color:#f87171">☯ Nghiệp Thấp Nhất</div>
        ${nreRenderRankList(stats.lowestKarma, "karma", "Nghiệp")}
      </div>
    </div>
  `;
}

function nreRenderWantedTab() {
  const rd = window.npcReputationData;
  const wantedEntries = Object.values(rd.npcRep).filter(r => (r.wanted || []).length > 0);
  if (!wantedEntries.length) return `<div class="nre-empty">Hiện không có ai bị truy nã.</div>`;
  return `
    <div class="nre-list">
      ${wantedEntries.map(rec => `
        <div class="nre-row">
          <div class="nre-rank">🚨</div>
          <div class="nre-info">
            <div class="nre-name">${rec.name}</div>
            <div class="nre-meta">
              ${rec.wanted.map(w => `<span class="nre-wanted-tag">${w.label}${w.countryName ? ` (${w.countryName})` : ""} · Năm ${w.year}</span>`).join(" ")}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function nreRenderRumorsTab() {
  const rd = window.npcReputationData;
  if (!rd.rumors.length) return `<div class="nre-empty">Thiên hạ chưa có tin đồn nào.</div>`;
  const veracityLabel = { true: "✅ Sự thật", false: "❌ Bịa đặt", exaggerated: "📢 Phóng đại" };
  return `
    <div class="nre-list">
      ${rd.rumors.slice(0, 100).map(r => `
        <div class="nre-mem-row">
          <div class="nre-mem-year">Năm ${r.year}</div>
          <div class="nre-mem-text">${r.text} <span class="nre-title-tag">${veracityLabel[r.veracity] || r.veracity}</span></div>
        </div>
      `).join("")}
    </div>
  `;
}

function nreRenderMemory() {
  const rd = window.npcReputationData;
  if (!rd.reputationMemory.length) return `<div class="nre-empty">Thiên hạ chưa ghi lại sự kiện danh tiếng nào.</div>`;
  return `
    <div class="nre-list">
      ${rd.reputationMemory.slice(0, 100).map(m => `
        <div class="nre-mem-row">
          <div class="nre-mem-year">Năm ${m.year}</div>
          <div class="nre-mem-text">${m.text}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function nreRenderRecords(stats) {
  const r = stats.records;
  const row = (icon, label, data, field) => `
    <div class="nre-record-row">
      <div class="nre-record-icon">${icon}</div>
      <div class="nre-record-label">${label}</div>
      <div class="nre-record-value">${data ? `${data.name} (${data[field]})` : "—"}</div>
    </div>`;
  return `
    <div class="nre-records">
      ${row("🌟", "Danh Tiếng Cao Nhất Từ Trước Đến Nay", r.mostFamous, "fame")}
      ${row("😱", "Sợ Hãi Cao Nhất Từ Trước Đến Nay", r.mostFeared, "fear")}
      ${row("✨", "Được Kính Trọng Nhất", r.mostRespected, "reputation")}
      ${row("👹", "Ác Độc Nhất", r.mostEvil, "reputation")}
      ${row("☯", "Nghiệp Cao Nhất Từ Trước Đến Nay", r.highestKarmaEver, "karma")}
      ${row("💀", "Nghiệp Thấp Nhất Từ Trước Đến Nay", r.lowestKarmaEver, "karma")}
    </div>
  `;
}

// ============================================================
// CSS INJECTION
// ============================================================
(function injectNpcReputationCSS() {
  const style = document.createElement("style");
  style.textContent = `
.nre-wrap { padding: 14px; }
.nre-header { text-align: center; margin-bottom: 14px; }
.nre-title { font-size: 16px; font-weight: 800; letter-spacing: 1px; color: var(--gold, #fbbf24); }
.nre-subtitle { font-size: 11px; color: var(--white-dim, #888); margin-top: 4px; }

.nre-stats-row {
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  margin-bottom: 14px;
}
.nre-stat {
  flex: 1; min-width: 80px; text-align: center;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 6px;
}
.nre-stat-val { font-size: 18px; font-weight: 800; color: var(--gold, #fbbf24); }
.nre-stat-label { font-size: 10px; color: var(--white-dim, #888); margin-top: 2px; }

.nre-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.nre-tab {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border, #2a2a4a);
  color: var(--white-dim, #888); padding: 6px 12px; border-radius: 6px;
  font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.nre-tab.active, .nre-tab:hover {
  background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.4); color: var(--gold, #fbbf24);
}

.nre-empty { text-align: center; padding: 40px 14px; color: var(--white-dim, #888); font-size: 13px; }

.nre-list { display: flex; flex-direction: column; gap: 8px; }
.nre-row {
  display: flex; gap: 10px; align-items: flex-start;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 10px;
}
.nre-rank { font-size: 14px; font-weight: 800; color: var(--white-dim, #888); min-width: 28px; text-align: center; }
.nre-info { flex: 1; }
.nre-name { font-size: 13px; font-weight: 700; color: var(--white-main, #eee); }
.nre-meta { font-size: 11px; color: var(--white-dim, #888); margin-top: 2px; }
.nre-alive { color: #4ade80; }
.nre-dead { color: #94a3b8; }
.nre-titles { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
.nre-title-tag {
  display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 10px;
  background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3);
  color: var(--gold, #fbbf24); margin-left: 4px;
}
.nre-wanted-tag {
  display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 8px;
  background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3);
  color: #f87171; margin-right: 4px;
}

.nre-karma-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.nre-karma-col { flex: 1; min-width: 220px; }
.nre-karma-header { font-size: 12px; font-weight: 700; margin-bottom: 8px; }

.nre-records { display: flex; flex-direction: column; gap: 6px; }
.nre-record-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border, #2a2a4a);
  border-radius: 8px; padding: 8px 10px; font-size: 12px;
}
.nre-record-icon { font-size: 16px; }
.nre-record-label { flex: 1; color: var(--white-dim, #888); }
.nre-record-value { font-weight: 700; color: var(--gold, #fbbf24); text-align: right; }

.nre-mem-row {
  display: flex; gap: 8px; font-size: 11px; padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.nre-mem-year { color: var(--gold, #fbbf24); min-width: 56px; font-weight: 600; }
.nre-mem-text { color: var(--white-dim, #ccc); }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// BOOTSTRAP
// ============================================================
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", npcReputationEngine_init);
  } else {
    npcReputationEngine_init();
  }
})();

// ============================================================
// EXPORTS
// ============================================================
window.npcReputationEngine_save = npcReputationEngine_save;
window.npcReputationEngine_load = npcReputationEngine_load;
window.npcReputationEngine_init = npcReputationEngine_init;
window.nreSwitchTab             = nreSwitchTab;
window.renderNpcReputationPanel = renderNpcReputationPanel;
window.npcReputationEngine = {
  init:          npcReputationEngine_init,
  save:          npcReputationEngine_save,
  load:          npcReputationEngine_load,
  tick:          nreTickScans,
  applyAction:   nreApplyAction,
  markWanted:    nreMarkWanted,
  isWanted:      nreIsWanted,
  spreadRumor:   nreSpreadRumor,
  adjustSectReputation:    nreAdjustSectReputation,
  adjustCountryReputation: nreAdjustCountryReputation,
  adjustDynastyReputation: nreAdjustDynastyReputation,
  classifyReputation: nreClassifyReputation,
  classifyFear:       nreClassifyFear,
  getStats:      nreGetStatistics,
  renderPanel:   renderNpcReputationPanel,
  getData:       () => window.npcReputationData,
};
