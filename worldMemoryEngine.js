// ============================================================
// WORLD MEMORY ENGINE V1
// CREATOR GOD V6 — GIAI ĐOẠN TIẾP THEO
// Bộ Nhớ Thế Giới: NPC, Gia Tộc, Giáo Phái, Quốc Gia ghi nhớ
// quá khứ — trả thù, biết ơn, mối thù lịch sử, di sản anh hùng.
// Tương thích 100% với save cũ — KHÔNG reset world, KHÔNG xóa
// NPC / truyền thuyết / quốc gia / triều đại đã có.
// ============================================================

const WME_SAVE_KEY = "cgv6_worldMemoryEngine";

// ============================================================
// DEFAULT STATE
// ============================================================
function wmeDefaultData() {
  return {
    // 📚 Kho lưu trữ ký ức thế giới (world-level archive)
    worldMemory: {
      famousBetrayals: [],   // phản bội nổi tiếng
      greatFriendships: [],  // tình bạn / ân nhân
      ancientFeuds: [],      // mối thù truyền kiếp (gia tộc / giáo phái / quốc gia)
      legendaryRivalries: [],// đối đầu huyền thoại
    },
    // Hồ sơ cuộc đời cho các NPC quan trọng (Danh Nhân trở lên)
    npcProfiles: {},  // npcId -> { birthYear, mentor, enemies:[], achievements:[], death:null }
    // Ký ức gia tộc — key = surname
    familyMemory: {},
    // Ký ức giáo phái — key = sect id
    sectMemory: {},
    // Ký ức quốc gia — key = country id
    countryMemory: {},
    // Di sản — danh tiếng kế thừa cho hậu duệ
    legacies: {}, // npcId (con/hậu duệ) -> [{ ancestorName, ancestorTier, bonus }]
    meta: { version: 1 },
  };
}

window.worldMemoryData = window.worldMemoryData || wmeDefaultData();

// ============================================================
// HELPERS
// ============================================================
function wmeFindNpc(id) {
  if (id === null || id === undefined) return null;
  return (npcs || []).find(n => n.id === id)
      || (hallOfFame || []).find(n => n.id === id)
      || null;
}

function wmeFindNpcByName(name) {
  if (!name) return null;
  return (npcs || []).find(n => n.name === name)
      || (hallOfFame || []).find(n => n.name === name)
      || null;
}

// Resolve a "killer" reference that may be an id, name embedded in text, or null
function wmeResolveActor(ref) {
  if (ref === null || ref === undefined) return null;
  if (typeof ref === "object") return ref;
  if (typeof ref === "number") return wmeFindNpc(ref);
  if (typeof ref === "string") {
    const asNum = Number(ref);
    if (!isNaN(asNum) && String(asNum) === ref) {
      const byId = wmeFindNpc(asNum);
      if (byId) return byId;
    }
    return wmeFindNpcByName(ref);
  }
  return null;
}

// Try to extract a killer's name from a death reason string like
// "bị Lâm Phàm đánh chết" — used as fallback when killerId is absent
function wmeExtractActorFromReason(reason) {
  if (!reason) return null;
  const m = reason.match(/bị\s+(.+?)\s+(đánh chết|tàn sát|tiêu diệt|chém|giết|sát hại)/);
  if (m && m[1]) return wmeFindNpcByName(m[1]);
  return null;
}

function wmeAddMemory(npc, entry) {
  if (!npc) return;
  npc.memories = npc.memories || [];
  npc.memories.unshift(Object.assign({ year: year || 1 }, entry));
  if (npc.memories.length > 100) npc.memories.pop();
}

// ============================================================
// NPC MEMORY — RELATIONSHIP EVENTS
// ============================================================

// Gọi khi A cứu B
function wmeRemember_saved(savior, target) {
  savior = wmeResolveActor(savior);
  target = wmeResolveActor(target);
  if (!savior || !target) return;
  wmeAddMemory(target, { type: "đã lưu", target: savior.name, targetId: savior.id });
  wmeAddMemory(savior, { type: "đã cứu", target: target.name, targetId: target.id });

  // Hệ thống biết ơn: NPC được cứu có thể trở thành đệ tử / đồng minh / theo dõi
  if (typeof chance === "function" && chance(0.35)) {
    const roll = chance(0.5) ? "follower" : (chance(0.5) ? "disciple" : "ally");
    target.gratitudeBond = target.gratitudeBond || [];
    target.gratitudeBond.push({ towardId: savior.id, towardName: savior.name, type: roll, year: year || 1 });

    let label = "";
    if (roll === "follower") label = `${target.name} cảm tạ ân cứu mạng, nguyện trở thành theo dõi của ${savior.name}.`;
    else if (roll === "disciple") label = `${target.name} cảm tạ ân cứu mạng, xin làm đệ tử của ${savior.name}.`;
    else label = `${target.name} cảm tạ ân cứu mạng, kết minh cùng ${savior.name}.`;

    if (typeof addWorldHistory === "function") {
      addWorldHistory("legend", label, { npcId: target.id, npcName: target.name, relatedId: savior.id, relatedName: savior.name });
    }
    if (typeof addLog === "function") addLog(`🙏 ${label}`, "important");

    wmeRecordWorldMemory("greatFriendships", {
      a: savior.name, b: target.name, desc: label,
    });
  }
}

// Gọi khi A phản bội B
function wmeRemember_betrayed(betrayer, victim, detail) {
  betrayer = wmeResolveActor(betrayer);
  victim = wmeResolveActor(victim);
  if (!betrayer || !victim) return;
  wmeAddMemory(victim, { type: "đã bị phản bội bởi", target: betrayer.name, targetId: betrayer.id, detail });
  wmeAddMemory(betrayer, { type: "đã phản bội", target: victim.name, targetId: victim.id, detail });

  const desc = `${betrayer.name} phản bội ${victim.name}${detail ? ` — ${detail}` : ""}.`;
  if (typeof addWorldHistory === "function") {
    addWorldHistory("legend", desc, { npcId: betrayer.id, npcName: betrayer.name, relatedId: victim.id, relatedName: victim.name });
  }
  wmeRecordWorldMemory("famousBetrayals", { a: betrayer.name, b: victim.name, desc });
}

// Gọi khi A dạy dỗ B (sư phụ — đệ tử)
function wmeRemember_taught(mentor, student) {
  mentor = wmeResolveActor(mentor);
  student = wmeResolveActor(student);
  if (!mentor || !student) return;
  wmeAddMemory(student, { type: "đã dạy dỗ", target: mentor.name, targetId: mentor.id });
  wmeAddMemory(mentor, { type: "đã thu nhận đệ tử", target: student.name, targetId: student.id });

  const prof = wmeGetOrCreateProfile(student);
  prof.mentor = mentor.name;
}

// Gọi khi A làm nhục B
function wmeRemember_humiliated(actor, victim, detail) {
  actor = wmeResolveActor(actor);
  victim = wmeResolveActor(victim);
  if (!actor || !victim) return;
  wmeAddMemory(victim, { type: "đã bị làm nhục bởi", target: actor.name, targetId: actor.id, detail });
  wmeAddMemory(actor, { type: "đã làm nhục", target: victim.name, targetId: victim.id, detail });
}

// ============================================================
// DEATH HOOK — GHI NHỚ TRẢ THÙ + CẬP NHẬT GIA ĐÌNH / GIÁO PHÁI / QUỐC GIA
// ============================================================
function wmeHandleDeath(npc, reason, killerId) {
  if (!npc) return;

  let killer = killerId !== null && killerId !== undefined
    ? wmeFindNpc(killerId)
    : wmeExtractActorFromReason(reason);

  // --- Ghi nhớ cho con cái: cha/mẹ bị giết ---
  if (killer && Array.isArray(npc.childrenIds)) {
    npc.childrenIds.forEach(cid => {
      const child = wmeFindNpc(cid);
      if (!child) return;
      wmeAddMemory(child, {
        type: "gia đình bị giết hại",
        target: killer.name,
        targetId: killer.id,
        victimRole: (npc.gender === "Nữ") ? "mẹ" : "cha",
        victimName: npc.name,
      });
      child.revengeTarget = child.revengeTarget || killer.id;
      const desc = `${child.name} chứng kiến ${npc.name} (${(npc.gender === "Nữ") ? "mẹ" : "cha"}) bị ${killer.name} giết hại — mối thù khắc sâu trong lòng.`;
      if (typeof addWorldHistory === "function") {
        addWorldHistory("legend", desc, { npcId: child.id, npcName: child.name, relatedId: killer.id, relatedName: killer.name });
      }
    });
  }

  // --- Ghi nhớ cho người phối ngẫu ---
  if (killer && npc.spouseId) {
    const spouse = wmeFindNpc(npc.spouseId);
    if (spouse) {
      wmeAddMemory(spouse, {
        type: "gia đình bị giết hại",
        target: killer.name,
        targetId: killer.id,
        victimRole: "đạo lữ",
        victimName: npc.name,
      });
      spouse.revengeTarget = spouse.revengeTarget || killer.id;
    }
  }

  // --- Ký ức gia tộc: ai đã giết hại thành viên ---
  if (killer && npc.family) {
    const fam = wmeGetOrCreateFamilyMemory(npc.family);
    fam.membersKilledBy = fam.membersKilledBy || {};
    const kKey = killer.family || killer.name;
    fam.membersKilledBy[kKey] = fam.membersKilledBy[kKey] || [];
    fam.membersKilledBy[kKey].push({ victim: npc.name, killer: killer.name, year: year || 1 });

    // Nếu kẻ giết thuộc một gia tộc khác → mối thù gia tộc lâu dài
    if (killer.family && killer.family !== npc.family) {
      const enemyFam = wmeGetOrCreateFamilyMemory(killer.family);
      fam.enemies = fam.enemies || [];
      enemyFam.enemies = enemyFam.enemies || [];
      if (!fam.enemies.includes(killer.family)) fam.enemies.push(killer.family);
      if (!enemyFam.enemies.includes(npc.family)) enemyFam.enemies.push(npc.family);

      const desc = `Gia tộc ${npc.family} ghi nhớ: ${killer.name} của gia tộc ${killer.family} đã giết hại ${npc.name} — mối thù gia tộc bắt đầu từ năm ${year || 1}.`;
      wmeRecordWorldMemory("ancientFeuds", {
        a: npc.family, b: killer.family, desc, startYear: year || 1, type: "gia tộc",
      });
    }
  }

  // --- Lưu hồ sơ cuộc đời nếu NPC là Danh Nhân trở lên ---
  wmeFinalizeProfile(npc, reason);

  // --- Di sản: hậu duệ thừa hưởng danh tiếng ---
  wmeApplyLegacy(npc);
}

// ============================================================
// HỆ THỐNG TRẢ THÙ — quét mỗi tick
// ============================================================
function wmeTickRevenge() {
  (npcs || []).forEach(npc => {
    if (npc.status !== "alive") return;
    if (!npc.revengeTarget) return;
    if (typeof chance !== "function") return;

    const target = wmeFindNpc(npc.revengeTarget);
    if (!target) { npc.revengeTarget = null; return; } // kẻ thù đã chết / không còn

    // Cần đủ thực lực mới có thể trả thù — tỷ lệ thấp mỗi tick, tăng theo realm
    const realmGap = (npc.realm || 0) - (target.realm || 0);
    let prob = 0.01;
    if (realmGap >= 0) prob = 0.04;
    if (realmGap >= 2) prob = 0.08;

    if (!chance(prob)) return;

    if (target.status !== "alive") {
      npc.revengeTarget = null;
      return;
    }

    // Thực hiện trả thù: đấu với kẻ thù
    const desc = `${npc.name} sau nhiều năm ẩn nhẫn, tìm đến ${target.name} để báo thù huyết hải sâu thẳm!`;
    if (typeof addLog === "function") addLog(`🗡️ ${desc}`, "important");
    if (typeof addWorldHistory === "function") {
      addWorldHistory("legend", desc, { npcId: npc.id, npcName: npc.name, relatedId: target.id, relatedName: target.name });
    }

    // Nếu hệ thống chiến đấu PvP có sẵn, dùng nó; nếu không, xác định kết quả đơn giản
    if (typeof window.pvpFight === "function") {
      window.pvpFight(npc, target);
    } else {
      const attackerPower = (npc.attack || 10) * (1 + (npc.realm || 0) * 0.3);
      const defenderPower = (target.attack || 10) * (1 + (target.realm || 0) * 0.3);
      const winner = attackerPower >= defenderPower ? npc : target;
      const loser = winner === npc ? target : npc;
      if (typeof killNPC === "function") {
        killNPC(loser, `bị ${winner.name} giết để trả thù gia tộc`, winner.id);
        const resultDesc = `${winner.name} đã báo được thù, hạ sát ${loser.name}!`;
        if (typeof addLog === "function") addLog(`⚔️ ${resultDesc}`, "important");
      }
    }

    npc.revengeTarget = null;
    npc.revengeFulfilled = true;
  });
}

// ============================================================
// NPC LIFE PROFILES — Danh Nhân trở lên có hồ sơ cuộc đời
// ============================================================
function wmeGetOrCreateProfile(npc) {
  const wmd = window.worldMemoryData;
  let prof = wmd.npcProfiles[npc.id];
  if (!prof) {
    prof = {
      id: npc.id, name: npc.name, family: npc.family,
      birthYear: npc.birthYear, mentor: null, enemies: [],
      achievements: [], death: null,
    };
    wmd.npcProfiles[npc.id] = prof;
  }
  prof.name = npc.name;
  return prof;
}

function wmeFinalizeProfile(npc, reason) {
  const wmd = window.worldMemoryData;
  const score = (window.heroLegendData && window.heroLegendData.heroes[npc.id])
    ? window.heroLegendData.heroes[npc.id].legendScore
    : (npc.legendScore || 0);
  if (score < 100) return; // Chỉ lưu hồ sơ Danh Nhân trở lên

  const prof = wmeGetOrCreateProfile(npc);
  prof.death = { year: year || 1, reason };
  prof.enemies = (npc.memories || [])
    .filter(m => m.type === "đã bị phản bội bởi" || m.type === "đã bị làm nhục bởi" || m.type === "gia đình bị giết hại")
    .map(m => m.target);
  if (window.heroLegendData && window.heroLegendData.heroes[npc.id]) {
    prof.achievements = window.heroLegendData.heroes[npc.id].achievements || [];
  }
}

// ============================================================
// DI SẢN — hậu duệ thừa hưởng danh tiếng anh hùng đã khuất
// ============================================================
function wmeApplyLegacy(npc) {
  const wmd = window.worldMemoryData;
  const score = (window.heroLegendData && window.heroLegendData.heroes[npc.id])
    ? window.heroLegendData.heroes[npc.id].legendScore
    : (npc.legendScore || 0);
  if (score < 500) return; // Chỉ Anh Hùng trở lên để lại di sản

  const tier = (typeof hleClassify === "function") ? hleClassify(score) : { id: "hero", name: "Anh Hùng" };
  (npc.childrenIds || []).forEach(cid => {
    const child = wmeFindNpc(cid);
    if (!child) return;
    wmd.legacies[child.id] = wmd.legacies[child.id] || [];
    wmd.legacies[child.id].push({
      ancestorId: npc.id, ancestorName: npc.name, ancestorTier: tier.id, ancestorTierName: tier.name,
      year: year || 1,
    });
    // Cộng dồn chút danh tiếng / phúc khí cho hậu duệ
    child.reputation = (child.reputation || 0) + Math.floor(score * 0.05);
    child.luck = Math.min(100, (child.luck || 0) + 3);
    if (!child.titles) child.titles = [];
    const inheritedTitle = `🧬 Hậu Duệ ${npc.name}`;
    if (!child.titles.includes(inheritedTitle)) child.titles.push(inheritedTitle);

    const desc = `${child.name} được thừa hưởng danh tiếng từ ${tier.icon || ""} ${npc.name} (${tier.name}) — vinh quang tổ tiên còn vang vọng.`;
    if (typeof addWorldHistory === "function") {
      addWorldHistory("legend", desc, { npcId: child.id, npcName: child.name });
    }
  });
}

// ============================================================
// GIA TỘC KÝ ỨC
// ============================================================
function wmeGetOrCreateFamilyMemory(surname) {
  const wmd = window.worldMemoryData;
  if (!wmd.familyMemory[surname]) {
    wmd.familyMemory[surname] = {
      surname,
      founder: null,
      enemies: [],
      allies: [],
      membersKilledBy: {},
    };
  }
  return wmd.familyMemory[surname];
}

function wmeTickFamilyMemory() {
  const wmd = window.worldMemoryData;
  Object.keys(dynasties || {}).forEach(surname => {
    const d = dynasties[surname];
    const fam = wmeGetOrCreateFamilyMemory(surname);
    if (!fam.founder && d.founderName) fam.founder = d.founderName;
  });
}

// ============================================================
// GIÁO PHÁI KÝ ỨC
// ============================================================
function wmeGetOrCreateSectMemory(sectId) {
  const wmd = window.worldMemoryData;
  if (!wmd.sectMemory[sectId]) {
    wmd.sectMemory[sectId] = {
      id: sectId, founder: null, heroes: [], traitors: [], enemies: [],
    };
  }
  return wmd.sectMemory[sectId];
}

function wmeTickSectMemory() {
  (sects || []).forEach(s => {
    const mem = wmeGetOrCreateSectMemory(s.id);
    if (!mem.founder && s.founder) {
      const f = wmeFindNpc(s.founder);
      if (f) mem.founder = f.name;
    }
  });
}

// Gọi khi NPC phản bội giáo phái
function wmeRemember_sectTraitor(npc, sectId, detail) {
  npc = wmeResolveActor(npc);
  if (!npc) return;
  const mem = wmeGetOrCreateSectMemory(sectId);
  mem.traitors = mem.traitors || [];
  mem.traitors.push({ name: npc.name, id: npc.id, year: year || 1, detail });
  const s = (sects || []).find(x => x.id === sectId);
  const desc = `${npc.name} phản bội ${s ? s.name : "tông môn"}${detail ? ` — ${detail}` : ""}. Tông môn ghi nhớ kẻ phản bội này.`;
  if (typeof addWorldHistory === "function") {
    addWorldHistory("legend", desc, { npcId: npc.id, npcName: npc.name });
  }
  wmeRecordWorldMemory("famousBetrayals", { a: npc.name, b: s ? s.name : sectId, desc });
}

// ============================================================
// QUỐC GIA KÝ ỨC — chiến tranh, xâm lược, liên minh, triều đại
// ============================================================
function wmeGetOrCreateCountryMemory(countryId) {
  const wmd = window.worldMemoryData;
  if (!wmd.countryMemory[countryId]) {
    wmd.countryMemory[countryId] = {
      id: countryId, wars: [], invasions: [], alliances: [], dynasties: [],
    };
  }
  return wmd.countryMemory[countryId];
}

// Gọi khi chiến tranh kết thúc — hook qua addWorldHistory eventType "war"
function wmeRemember_war(winnerName, loserName, extra) {
  const wmd = window.worldMemoryData;
  const desc = `Chiến tranh năm ${year || 1}: ${winnerName} đánh bại ${loserName}${extra && extra.casualties ? ` (${extra.casualties} thương vong)` : ""}.`;

  const winnerC = (countries || []).find(c => c.name === winnerName);
  const loserC = (countries || []).find(c => c.name === loserName);

  if (winnerC) {
    const wm = wmeGetOrCreateCountryMemory(winnerC.id);
    wm.wars.push({ year: year || 1, opponent: loserName, result: "thắng", desc });
  }
  if (loserC) {
    const lm = wmeGetOrCreateCountryMemory(loserC.id);
    lm.wars.push({ year: year || 1, opponent: winnerName, result: "thua", desc });
    lm.invasions.push({ year: year || 1, invader: winnerName });
  }

  // Mối thù lịch sử: chiến tranh quốc gia có thể tái diễn 200-500 năm sau
  if (winnerC && loserC) {
    wmeRecordWorldMemory("ancientFeuds", {
      a: winnerC.name, b: loserC.name, desc, startYear: year || 1, type: "quốc gia",
    });
  }
}

// Gọi khi hai quốc gia liên minh
function wmeRemember_alliance(aName, bName) {
  const wmd = window.worldMemoryData;
  const a = (countries || []).find(c => c.name === aName);
  const b = (countries || []).find(c => c.name === bName);
  const desc = `${aName} và ${bName} kết thành liên minh năm ${year || 1}.`;
  if (a) wmeGetOrCreateCountryMemory(a.id).alliances.push({ year: year || 1, ally: bName });
  if (b) wmeGetOrCreateCountryMemory(b.id).alliances.push({ year: year || 1, ally: aName });
  wmeRecordWorldMemory("greatFriendships", { a: aName, b: bName, desc });
}

// ============================================================
// MỐI THÙ LỊCH SỬ — kiểm tra tái phát mỗi tick (200-500 năm sau)
// ============================================================
function wmeTickAncientFeuds() {
  const wmd = window.worldMemoryData;
  const curYear = year || 1;

  wmd.worldMemory.ancientFeuds.forEach(feud => {
    if (feud.reignited) return;
    const age = curYear - feud.startYear;
    if (age < 200) return;
    if (age > 500) { feud.reignited = "expired"; return; }
    if (typeof chance !== "function") return;
    if (!chance(0.002)) return; // rất hiếm mỗi tick, nhưng tích lũy theo thời gian

    feud.reignited = curYear;
    const desc = `Sau ${age} năm, mối thù xưa giữa ${feud.a} và ${feud.b} bùng phát trở lại! ` +
      `Hậu duệ vẫn còn nhớ những gì xảy ra năm ${feud.startYear}.`;
    if (typeof addLog === "function") addLog(`⚔️ ${desc}`, "important");
    if (typeof addWorldHistory === "function") {
      addWorldHistory("legend", desc, { relatedName: feud.a, relatedName2: feud.b });
    }
    wmeRecordWorldMemory("legendaryRivalries", {
      a: feud.a, b: feud.b, desc, startYear: feud.startYear, reignitedYear: curYear, type: feud.type,
    });
  });
}

// ============================================================
// WORLD MEMORY ARCHIVE — 📚 KÝ ỨC THẾ GIỚI
// ============================================================
function wmeRecordWorldMemory(category, entry) {
  const wmd = window.worldMemoryData;
  if (!wmd.worldMemory[category]) wmd.worldMemory[category] = [];
  wmd.worldMemory[category].unshift(Object.assign({ year: year || 1 }, entry));
  if (wmd.worldMemory[category].length > 300) wmd.worldMemory[category].pop();
}

// ============================================================
// MIGRATION — đảm bảo NPC cũ có trường bộ nhớ
// ============================================================
function worldMemoryEngine_migrate() {
  [].concat(npcs || []).concat(hallOfFame || []).forEach(npc => {
    if (!npc.memories) npc.memories = [];
    if (npc.revengeTarget === undefined) npc.revengeTarget = null;
    if (!npc.gratitudeBond) npc.gratitudeBond = [];
  });
  wmeTickFamilyMemory();
  wmeTickSectMemory();
}

// ============================================================
// SAVE / LOAD
// ============================================================
function worldMemoryEngine_save() {
  try {
    localStorage.setItem(WME_SAVE_KEY, JSON.stringify(window.worldMemoryData));
  } catch (e) { console.warn("worldMemoryEngine save failed:", e); }
}

function worldMemoryEngine_load() {
  try {
    const raw = localStorage.getItem(WME_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const def = wmeDefaultData();
      window.worldMemoryData = Object.assign(def, parsed);
      window.worldMemoryData.worldMemory = Object.assign(def.worldMemory, parsed.worldMemory || {});
      window.worldMemoryData.npcProfiles = Object.assign(def.npcProfiles, parsed.npcProfiles || {});
      window.worldMemoryData.familyMemory = Object.assign(def.familyMemory, parsed.familyMemory || {});
      window.worldMemoryData.sectMemory = Object.assign(def.sectMemory, parsed.sectMemory || {});
      window.worldMemoryData.countryMemory = Object.assign(def.countryMemory, parsed.countryMemory || {});
      window.worldMemoryData.legacies = Object.assign(def.legacies, parsed.legacies || {});
    } else {
      window.worldMemoryData = wmeDefaultData();
    }
  } catch (e) {
    console.warn("worldMemoryEngine load failed:", e);
    window.worldMemoryData = wmeDefaultData();
  }
}

// ============================================================
// INIT + PATCH HOOKS
// ============================================================
function worldMemoryEngine_init() {
  if (window._wme_initialized) return;
  window._wme_initialized = true;
  worldMemoryEngine_load();
  worldMemoryEngine_migrate();
  worldMemoryEngine_patch();
}

function worldMemoryEngine_patch() {
  // --- killNPC hook: ghi nhớ trả thù, di sản, ký ức gia tộc ---
  if (!window._wme_patchedKillNPC && typeof window.killNPC === "function") {
    window._wme_patchedKillNPC = true;
    const origKill = window.killNPC;
    window.killNPC = function (npc, reason, killerId, force) {
      const npcSnapshot = npc; // capture before original mutates/removes from arrays
      const result = origKill.apply(this, arguments);
      try { wmeHandleDeath(npcSnapshot, reason, killerId); } catch (e) { console.warn("wmeHandleDeath error:", e); }
      return result;
    };
  }

  // --- addWorldHistory hook: bắt sự kiện chiến tranh / liên minh ---
  if (!window._wme_patchedWorldHistory && typeof window.addWorldHistory === "function") {
    window._wme_patchedWorldHistory = true;
    const orig = window.addWorldHistory;
    window.addWorldHistory = function (eventType, description, extra) {
      const result = orig.apply(this, arguments);
      try {
        extra = extra || {};
        if (eventType === "war" && extra.winner && extra.loser) {
          wmeRemember_war(extra.winner, extra.loser, extra);
        }
        if (eventType === "diplomacy" && /liên minh/i.test(description) && extra.a && extra.b) {
          wmeRemember_alliance(extra.a, extra.b);
        }
      } catch (e) { console.warn("wme addWorldHistory hook error:", e); }
      return result;
    };
  }

  // --- simulateWorld tick hook: trả thù, mối thù lịch sử ---
  if (!window._wme_patchedSim && typeof window.simulateWorld === "function") {
    window._wme_patchedSim = true;
    const origSim = window.simulateWorld;
    window.simulateWorld = function () {
      const result = origSim.apply(this, arguments);
      try {
        if (!window._wme_tabRevealed) {
          window._wme_tabRevealed = true;
          const btn = document.querySelector('.nav-btn[data-panel="world-memory"]');
          if (btn) {
            btn.style.display = '';
            btn.classList.remove('ec-hidden');
            btn.classList.add('ec-unlocked-flash');
            setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
          }
        }
        wmeTickRevenge();
        wmeTickFamilyMemory();
        wmeTickSectMemory();
        wmeTickAncientFeuds();
      } catch (e) { console.warn("worldMemoryEngine tick error:", e); }
      return result;
    };
  }

  // --- save/load hook: persist worldMemoryData alongside world save ---
  if (!window._wme_patchedSave && typeof window.save === "function") {
    window._wme_patchedSave = true;
    const origSave = window.save;
    window.save = function () {
      const result = origSave.apply(this, arguments);
      try { worldMemoryEngine_save(); } catch (e) { console.warn("wme save error:", e); }
      return result;
    };
  }
}

// ============================================================
// UI — PANEL RENDER: 📚 KÝ ỨC THẾ GIỚI
// ============================================================
let _wmeActiveTab = "betrayals";

function renderWorldMemoryPanel() {
  const container = document.getElementById("panel-world-memory");
  if (!container) return;
  const wmd = window.worldMemoryData;

  container.innerHTML = `
    <div class="hle-wrap">
      <div class="hle-header">
        <div class="hle-title">📚 KÝ ỨC THẾ GIỚI</div>
        <div class="hle-subtitle">Thế giới ghi nhớ — phản bội, tình bạn, mối thù truyền kiếp, đối đầu huyền thoại</div>
      </div>

      <div class="hle-stats-row">
        <div class="hle-stat"><div class="hle-stat-val">${wmd.worldMemory.famousBetrayals.length}</div><div class="hle-stat-label">🗡 Phản Bội</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${wmd.worldMemory.greatFriendships.length}</div><div class="hle-stat-label">🤝 Tình Bạn</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${wmd.worldMemory.ancientFeuds.length}</div><div class="hle-stat-label">⚔️ Mối Thù</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${wmd.worldMemory.legendaryRivalries.length}</div><div class="hle-stat-label">🔥 Đối Đầu</div></div>
        <div class="hle-stat"><div class="hle-stat-val">${Object.keys(wmd.npcProfiles).length}</div><div class="hle-stat-label">📜 Hồ Sơ</div></div>
      </div>

      <div class="hle-tabs">
        <button class="hle-tab ${_wmeActiveTab === 'betrayals' ? 'active' : ''}" onclick="wmeSwitchTab('betrayals')">🗡 Phản Bội</button>
        <button class="hle-tab ${_wmeActiveTab === 'friendships' ? 'active' : ''}" onclick="wmeSwitchTab('friendships')">🤝 Tình Bạn</button>
        <button class="hle-tab ${_wmeActiveTab === 'feuds' ? 'active' : ''}" onclick="wmeSwitchTab('feuds')">⚔️ Mối Thù</button>
        <button class="hle-tab ${_wmeActiveTab === 'rivalries' ? 'active' : ''}" onclick="wmeSwitchTab('rivalries')">🔥 Đối Đầu</button>
        <button class="hle-tab ${_wmeActiveTab === 'profiles' ? 'active' : ''}" onclick="wmeSwitchTab('profiles')">📜 Hồ Sơ</button>
        <button class="hle-tab ${_wmeActiveTab === 'families' ? 'active' : ''}" onclick="wmeSwitchTab('families')">🏠 Gia Tộc</button>
      </div>

      <div class="hle-content" id="wmeContent">
        ${wmeRenderTab(_wmeActiveTab, wmd)}
      </div>
    </div>
  `;
}

function wmeSwitchTab(name) {
  _wmeActiveTab = name;
  renderWorldMemoryPanel();
}

function wmeRenderTab(name, wmd) {
  switch (name) {
    case "betrayals": return wmeRenderList(wmd.worldMemory.famousBetrayals, "Chưa có vụ phản bội nổi tiếng nào được ghi nhận.");
    case "friendships": return wmeRenderList(wmd.worldMemory.greatFriendships, "Chưa có tình bạn hay liên minh nào được ghi nhận.");
    case "feuds": return wmeRenderFeuds(wmd.worldMemory.ancientFeuds);
    case "rivalries": return wmeRenderList(wmd.worldMemory.legendaryRivalries, "Chưa có cuộc đối đầu huyền thoại nào tái diễn.");
    case "profiles": return wmeRenderProfiles(wmd.npcProfiles);
    case "families": return wmeRenderFamilies(wmd.familyMemory);
    default: return "";
  }
}

function wmeRenderList(list, emptyMsg) {
  if (!list || !list.length) return `<div class="hle-empty">${emptyMsg}</div>`;
  return `
    <div class="hle-list">
      ${list.slice(0, 100).map(e => `
        <div class="hle-row">
          <div class="hle-info">
            <div class="hle-name">${e.a || ""} ↔ ${e.b || ""}</div>
            <div class="hle-meta">Năm ${e.year} · ${e.desc || ""}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function wmeRenderFeuds(list) {
  if (!list || !list.length) return `<div class="hle-empty">Chưa có mối thù lâu dài nào trong lịch sử thế giới.</div>`;
  return `
    <div class="hle-list">
      ${list.slice(0, 100).map(e => `
        <div class="hle-row">
          <div class="hle-info">
            <div class="hle-name">${e.a || ""} ⚔️ ${e.b || ""} ${e.type ? `<span class="hle-title-tag">${e.type}</span>` : ""}</div>
            <div class="hle-meta">
              Bắt đầu năm ${e.startYear} · ${e.desc || ""}
              ${e.reignited && e.reignited !== "expired" ? `<br><b style="color:#f87171">🔥 Tái phát năm ${e.reignited}!</b>` : ""}
              ${e.reignited === "expired" ? `<br><span style="color:#94a3b8">Mối thù đã nguội theo thời gian.</span>` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function wmeRenderProfiles(profiles) {
  const list = Object.values(profiles || {}).sort((a, b) => (b.death ? b.death.year : 9e9) - (a.death ? a.death.year : 9e9));
  if (!list.length) return `<div class="hle-empty">Chưa có hồ sơ Danh Nhân nào được lưu lại.</div>`;
  return `
    <div class="hle-list">
      ${list.slice(0, 100).map(p => `
        <div class="hle-row">
          <div class="hle-info">
            <div class="hle-name">${p.name}${p.family ? ` <span class="hle-title-tag">${p.family}</span>` : ""}</div>
            <div class="hle-meta">
              Sinh năm ${p.birthYear || "?"} ${p.mentor ? `· Người hướng dẫn: ${p.mentor}` : ""}
              ${p.death ? `<br>Qua đời năm ${p.death.year} — ${p.death.reason}` : "<br><span class=\"hle-alive\">Đang Sống</span>"}
              ${p.enemies && p.enemies.length ? `<br>Kẻ thù: ${p.enemies.join(", ")}` : ""}
              ${p.achievements && p.achievements.length ? `<br>Thành tựu: ${p.achievements.slice(-3).map(a => a.label).join(", ")}` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function wmeRenderFamilies(families) {
  const list = Object.values(families || {});
  if (!list.length) return `<div class="hle-empty">Chưa có gia tộc nào hình thành ký ức.</div>`;
  return `
    <div class="hle-list">
      ${list.slice(0, 100).map(f => `
        <div class="hle-row">
          <div class="hle-info">
            <div class="hle-name">🏠 Gia tộc ${f.surname}</div>
            <div class="hle-meta">
              ${f.founder ? `Người sáng lập: ${f.founder}<br>` : ""}
              ${f.enemies && f.enemies.length ? `Kẻ thù: ${f.enemies.join(", ")}<br>` : ""}
              ${f.allies && f.allies.length ? `Đồng minh: ${f.allies.join(", ")}<br>` : ""}
              ${Object.keys(f.membersKilledBy || {}).length ? `Bị giết bởi: ${Object.entries(f.membersKilledBy).map(([k, v]) => `${k} (${v.length})`).join(", ")}` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// ============================================================
// BOOT
// ============================================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(worldMemoryEngine_init, 600);
  });
} else {
  setTimeout(worldMemoryEngine_init, 600);
}
