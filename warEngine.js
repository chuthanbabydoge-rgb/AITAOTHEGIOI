/* ============================================================
   WAR ENGINE V1 — warEngine.js
   Creator God V6 — PHASE NEXT
   ============================================================
   HỆ THỐNG:
   - Country Relation (allies / enemies / neutral)
   - War Declaration (tuyên chiến tự động theo logic)
   - Army System (soldiers / generals / militaryPower)
   - Battle System (trận chiến từng trận)
   - Territory Conquest (chiếm thành / lãnh thổ)
   - Alliance System (kết minh / viện trợ)
   - Peace Treaty (hòa ước / bồi thường)
   - Country Collapse (diệt quốc)
   - War History → worldHistory
   - Dynamic Sidebar Panel ⚔️ CHIẾN TRANH
   - Statistics
   KHÔNG reset save / KHÔNG xóa dữ liệu cũ.
   Tương thích 100% save hiện tại.
   ============================================================ */

"use strict";

// ============================================================
// GLOBALS — khởi tạo an toàn (không xóa dữ liệu cũ)
// ============================================================

// Danh sách chiến tranh đang diễn ra
// { id, attacker, defender, startYear, battles:[], status:"active"|"peace"|"collapsed", reason }
window.warsActive   = window.warsActive   || [];

// Lịch sử toàn bộ chiến tranh (bao gồm đã kết thúc)
window.warsHistory  = window.warsHistory  || [];

// Danh sách liên minh
// { id, nation1, nation2, formedYear, type:"alliance"|"truce" }
window.warAlliances = window.warAlliances || [];

// Thống kê chiến tranh
window.warStats = window.warStats || {
  totalWars:        0,
  totalBattles:     0,
  totalCollapsed:   0,
  strongestEver:    null,
  greatestGeneral:  null,
  lastWarYear:      null,
};
if (window.warStats.lastWarYear === undefined) window.warStats.lastWarYear = null;

// Thông tin debug — vì sao quốc gia (chưa) tuyên chiến
// { tickYear, entries: [{ name, ambition, hatredMax, score, threshold,
//   rolledChance, candidatesCount, declared, reason }] }
window.warEngineDebug = window.warEngineDebug || { tickYear: null, entries: [] };

function warEngine_load() {
  try {
    const d = JSON.parse(localStorage.getItem("cgv6_warEngine") || "{}");
    if (d.warsActive)   window.warsActive   = d.warsActive;
    if (d.warsHistory)  window.warsHistory  = d.warsHistory;
    if (d.warAlliances) window.warAlliances = d.warAlliances;
    if (d.warStats)     window.warStats     = Object.assign(window.warStats, d.warStats);
  } catch(e) {}
}

function warEngine_save() {
  try {
    localStorage.setItem("cgv6_warEngine", JSON.stringify({
      warsActive:   window.warsActive,
      warsHistory:  (window.warsHistory || []).slice(0, 300),
      warAlliances: window.warAlliances,
      warStats:     window.warStats,
    }));
  } catch(e) {}
}

// ============================================================
// COUNTRY MIGRATION — thêm fields chiến tranh vào quốc gia cũ
// ============================================================

function warEngine_migrateCountries() {
  if (!window.countries || !window.countries.length) return;
  window.countries.forEach(c => {
    // Quan hệ
    if (!c.relations) c.relations = { allies: [], enemies: [], neutral: [] };
    // Quân sự
    if (c.soldiers     === undefined) c.soldiers     = Math.floor((c.population || 10000) * 0.08);
    if (c.generals     === undefined) c.generals     = Math.max(1, Math.floor((c.level || 1) * 3 + Math.random() * 5));
    if (c.militaryPower === undefined) c.militaryPower = Math.floor((c.military || 10000) + c.soldiers * 10);
    if (c.territory    === undefined) c.territory    = Math.max(1, Math.floor((c.level || 1) * 3 + 2));
    if (c.hatred       === undefined) c.hatred       = {};  // { nationName: 0-100 }
    if (c.ambitionWar  === undefined) c.ambitionWar  = Math.floor(Math.random() * 60 + 40); // min 40, tăng khả năng chiến tranh
    if (c.warCount     === undefined) c.warCount     = 0;
    if (c.conquered    === undefined) c.conquered    = []; // danh sách thành đã chiếm
    if (c.collapsed    === undefined) c.collapsed    = false;
    if (c.collapseYear === undefined) c.collapseYear = null;
  });
}

// ============================================================
// UTILS
// ============================================================

function _we_rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function _we_randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function _we_chance(p) { return Math.random() < p; }

function _we_getLivingCountries() {
  return (window.countries || []).filter(c => !c.collapsed);
}

function _we_warId() {
  return "war_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
}

function _we_getRelation(c1, c2) {
  if (!c1 || !c2) return "neutral";
  const r = c1.relations || {};
  if ((r.allies  || []).includes(c2.name)) return "ally";
  if ((r.enemies || []).includes(c2.name)) return "enemy";
  return "neutral";
}

function _we_setRelation(c1, c2, type) {
  if (!c1 || !c2) return;
  if (!c1.relations) c1.relations = { allies: [], enemies: [], neutral: [] };
  // Xóa khỏi tất cả trước
  ["allies","enemies","neutral"].forEach(k => {
    c1.relations[k] = (c1.relations[k] || []).filter(n => n !== c2.name);
  });
  if (type === "ally")    c1.relations.allies.push(c2.name);
  else if (type === "enemy") c1.relations.enemies.push(c2.name);
  else c1.relations.neutral.push(c2.name);
}

function _we_setMutualRelation(c1, c2, type) {
  _we_setRelation(c1, c2, type);
  _we_setRelation(c2, c1, type);
}

function _we_isAtWar(c1name, c2name) {
  return window.warsActive.some(w =>
    w.status === "active" &&
    ((w.attacker === c1name && w.defender === c2name) ||
     (w.attacker === c2name && w.defender === c1name))
  );
}

function _we_getMilitaryPower(c) {
  return Math.floor(
    (c.militaryPower || 10000) +
    (c.soldiers || 0) * 8 +
    (c.generals || 0) * 500 +
    (c.technology || 1) * 1000
  );
}

function _we_cityNames() {
  const prefixes = ["Thanh","Huyền","Thiên","Bạch","Kim","Hồng","Lam","Tím","Vạn","Long","Phượng","Thương","Ngọc","Linh","Huyết","Trúc","Băng","Hỏa"];
  const suffixes = ["Vân","Sơn","Thành","Quan","Trì","Điện","Môn","Kinh","Cảnh","Phủ","Lâm","Nguyên","Hải","Đạo","Thiên","Linh","Cung"];
  return _we_rand(prefixes) + " " + _we_rand(suffixes) + " Thành";
}

// ============================================================
// WAR DECLARATION SYSTEM
// ============================================================

const WAR_REASONS = [
  "tranh chấp lãnh thổ",
  "xâm phạm biên giới",
  "tham vọng bá chủ",
  "thù hận tích lũy",
  "tranh giành tài nguyên linh khí",
  "phục thù năm xưa",
  "mở rộng lãnh thổ",
  "xâm lược phương nam",
];

// --- Tham số cân bằng chiến tranh (rebalanced) ---
// Trước đây: chance 0.15, ngưỡng score 8 → quá nhiều quốc gia đủ điều kiện
// nhưng vẫn không tuyên chiến vì panel/tab bị ẩn nên dữ liệu không hiển thị.
// Vẫn giữ rebalance nhẹ + thêm cơ chế "war drought" chống thế giới hòa bình mãi mãi.
const WAR_DECLARE_CHANCE   = 0.25; // ~25% mỗi tick mỗi quốc gia (tăng từ 15%)
const WAR_SCORE_THRESHOLD  = 5;    // ngưỡng động lực chiến tranh (giảm từ 8)
const WAR_DROUGHT_YEARS    = 15;   // nếu > X năm không có chiến tranh nào → ép tuyên chiến

function warEngine_tryDeclareWar() {
  const living = _we_getLivingCountries();
  const yr = window.year || 1;
  const debugEntries = [];
  window.warEngineDebug = { tickYear: yr, entries: debugEntries };

  if (living.length < 2) {
    debugEntries.push({ name: "(hệ thống)", reason: `Chỉ còn ${living.length} quốc gia còn sống — cần ít nhất 2 để có chiến tranh.` });
    return;
  }

  // --- Cơ chế chống "thế giới hòa bình mãi mãi" ---
  const hasActiveWar   = window.warsActive.some(w => w.status === "active");
  const yearsSinceWar  = window.warStats.lastWarYear == null ? Infinity : (yr - window.warStats.lastWarYear);
  const droughtForce   = !hasActiveWar && yearsSinceWar >= WAR_DROUGHT_YEARS;

  living.forEach(attacker => {
    const rolledChance = _we_chance(WAR_DECLARE_CHANCE);
    const entry = {
      name: attacker.name,
      ambition: attacker.ambitionWar || 50,
      economy: Math.floor(attacker.economy || 0),
      rolledChance,
      droughtForce,
      declared: false,
      reason: "",
    };

    if (!rolledChance && !droughtForce) {
      entry.reason = `Không trúng tỉ lệ tuyên chiến (${(WAR_DECLARE_CHANCE*100).toFixed(0)}%/lượt).`;
      debugEntries.push(entry);
      return;
    }

    const candidates = living.filter(c =>
      c.id !== attacker.id &&
      !_we_isAtWar(attacker.name, c.name) &&
      _we_getRelation(attacker, c) !== "ally"
    );
    entry.candidatesCount = candidates.length;

    if (!candidates.length) {
      entry.reason = "Không có mục tiêu hợp lệ (mọi nước khác đều là đồng minh hoặc đang giao chiến).";
      debugEntries.push(entry);
      return;
    }

    // Ưu tiên kẻ thù, sau đó neutral
    const enemies  = candidates.filter(c => _we_getRelation(attacker, c) === "enemy");
    const target   = enemies.length ? _we_rand(enemies) : _we_rand(candidates);
    entry.target = target.name;

    // Điều kiện tuyên chiến
    const hatred   = (attacker.hatred || {})[target.name] || 0;
    const ambition = attacker.ambitionWar || 50;
    const lowRes   = (attacker.economy || 5000) < 3000;
    const score    = hatred * 0.4 + ambition * 0.4 + (lowRes ? 20 : 0);
    entry.hatred  = hatred;
    entry.score   = Math.round(score * 10) / 10;
    entry.threshold = WAR_SCORE_THRESHOLD;

    if (score < WAR_SCORE_THRESHOLD && !droughtForce) {
      entry.reason = `Động lực chưa đủ (score=${entry.score} < ${WAR_SCORE_THRESHOLD}).`;
      debugEntries.push(entry);
      return; // Không đủ động lực
    }

    entry.declared = true;
    entry.reason = droughtForce && score < WAR_SCORE_THRESHOLD
      ? "Ép tuyên chiến do thế giới hòa bình quá lâu (war drought failsafe)."
      : "Đủ điều kiện → tuyên chiến!";
    debugEntries.push(entry);

    warEngine_declareWar(attacker, target);
  });
}

function warEngine_declareWar(attacker, defender) {
  const reason = _we_rand(WAR_REASONS);
  const warId  = _we_warId();
  const yr     = window.year || 1;

  const war = {
    id:        warId,
    attacker:  attacker.name,
    defender:  defender.name,
    startYear: yr,
    reason,
    battles:   [],
    status:    "active",
    attackerLosses: 0,
    defenderLosses: 0,
    territoryGained: [],
  };

  window.warsActive.push(war);
  window.warStats.totalWars++;
  window.warStats.lastWarYear = yr;

  // Cập nhật quan hệ
  _we_setMutualRelation(attacker, defender, "enemy");
  attacker.warCount = (attacker.warCount || 0) + 1;

  // Ghi lịch sử
  const msg = `⚔️ Năm ${yr}: ${attacker.name} tuyên chiến với ${defender.name} vì ${reason}.`;
  _we_addWorldHistory("war", msg, { warId, attacker: attacker.name, defender: defender.name });
  if (typeof addLog === "function") addLog(msg, "death");
  if (typeof addTimeline === "function") addTimeline(msg, "death", "⚔️");

  // Mở unlock panel chiến tranh
  if (typeof ecCheckUnlocks === "function") ecCheckUnlocks();

  warEngine_save();
  warEngine_renderPanel();
}

// ============================================================
// ALLY SUPPORT
// ============================================================

function warEngine_checkAllySupport(war) {
  if (!window.countries) return;
  const attacker = window.countries.find(c => c.name === war.attacker);
  const defender = window.countries.find(c => c.name === war.defender);
  if (!attacker || !defender) return;

  // Đồng minh của defender có thể tham chiến bên phòng thủ
  const defAllies = (defender.relations?.allies || []);
  defAllies.forEach(allyName => {
    const ally = window.countries.find(c => c.name === allyName && !c.collapsed);
    if (!ally || _we_isAtWar(ally.name, attacker.name)) return;
    if (_we_chance(0.3)) {
      warEngine_declareWar(ally, attacker);
      const msg = `🤝 ${ally.name} tham chiến hỗ trợ đồng minh ${defender.name} chống ${attacker.name}!`;
      if (typeof addLog === "function") addLog(msg, "important");
    }
  });
}

// ============================================================
// BATTLE SYSTEM
// ============================================================

const BATTLE_LOCATIONS = [
  "Trận Thanh Vân Sơn","Trận Huyền Thiên Quan","Trận Bạch Long Lĩnh",
  "Trận Hỏa Phượng Cốc","Trận Băng Hồ Nguyên","Trận Lôi Điện Đài",
  "Trận Hắc Thủy Hải","Trận Vạn Linh Bình","Trận Thiên Kiếm Phong",
  "Trận Kim Long Đạo","Trận Ngọc Linh Môn","Trận Tử Tiêu Điện",
];

function warEngine_simulateBattle(war) {
  const yr       = window.year || 1;
  const attacker = window.countries?.find(c => c.name === war.attacker);
  const defender = window.countries?.find(c => c.name === war.defender);
  if (!attacker || !defender || attacker.collapsed || defender.collapsed) return;

  const battleName = _we_rand(BATTLE_LOCATIONS);

  const atkPower = _we_getMilitaryPower(attacker) * (0.8 + Math.random() * 0.4);
  const defPower = _we_getMilitaryPower(defender) * (0.8 + Math.random() * 0.4);

  const atkSoldiers = Math.floor((attacker.soldiers || 1000) * (0.2 + Math.random() * 0.3));
  const defSoldiers = Math.floor((defender.soldiers || 1000) * (0.2 + Math.random() * 0.3));

  const atkWins = atkPower > defPower;

  // Thương vong
  const atkLoss = _we_randInt(
    Math.floor(atkSoldiers * 0.1),
    Math.floor(atkSoldiers * 0.35)
  );
  const defLoss = _we_randInt(
    Math.floor(defSoldiers * 0.1),
    Math.floor(defSoldiers * 0.4)
  );

  attacker.soldiers  = Math.max(0, (attacker.soldiers || 1000) - atkLoss);
  defender.soldiers  = Math.max(0, (defender.soldiers || 1000) - defLoss);
  war.attackerLosses += atkLoss;
  war.defenderLosses += defLoss;

  window.warStats.totalBattles++;

  const battle = {
    year: yr,
    name: battleName,
    atkSoldiers, defSoldiers,
    atkLoss, defLoss,
    winner: atkWins ? war.attacker : war.defender,
  };
  war.battles.push(battle);

  // Thông báo
  const resultText = atkWins
    ? `${attacker.name} đại thắng`
    : `${defender.name} phòng thủ thành công`;
  const msg = `⚔️ ${battleName} — ${attacker.name} (${atkSoldiers.toLocaleString()} quân) vs ${defender.name} (${defSoldiers.toLocaleString()} quân) → ${resultText}!`;
  _we_addWorldHistory("war", msg, { warId: war.id });
  if (typeof addLog === "function") addLog(msg, "death");

  // Chiếm lãnh thổ nếu thắng
  if (atkWins) {
    warEngine_conquerTerritory(war, attacker, defender);
  }

  // Cập nhật militaryPower
  attacker.militaryPower = _we_getMilitaryPower(attacker);
  defender.militaryPower = _we_getMilitaryPower(defender);

  // Cập nhật thống kê generals mạnh nhất
  _we_updateGreatestGeneral(attacker, atkWins);

  warEngine_save();
  warEngine_renderPanel();
}

function _we_updateGreatestGeneral(country, won) {
  if (!won) return;
  // Tìm NPC cao cấp nhất trong quốc gia này
  const heroNPCs = (window.npcs || []).filter(n =>
    n.country === country.name && n.status === "alive" && (n.realm || 0) >= 2
  );
  if (!heroNPCs.length) return;
  const hero = heroNPCs.sort((a, b) => (b.realm || 0) - (a.realm || 0))[0];
  const gs   = window.warStats;
  if (!gs.greatestGeneral || (hero.realm || 0) > (gs.greatestGeneral.realm || 0)) {
    gs.greatestGeneral = { name: hero.name, country: country.name, realm: hero.realm || 0 };
  }
}

// ============================================================
// TERRITORY CONQUEST
// ============================================================

function warEngine_conquerTerritory(war, attacker, defender) {
  if ((defender.territory || 1) <= 0) return;
  const yr       = window.year || 1;
  const cityName = _we_cityNames();

  defender.territory  = Math.max(0, (defender.territory || 1) - 1);
  attacker.territory  = (attacker.territory || 1) + 1;

  // Cướp tài nguyên
  const plunder = Math.floor((defender.economy || 1000) * 0.1);
  attacker.economy  = (attacker.economy  || 0) + plunder;
  defender.economy  = Math.max(100, (defender.economy || 1000) - plunder);

  war.territoryGained.push({ city: cityName, year: yr });
  if (!attacker.conquered) attacker.conquered = [];
  attacker.conquered.push({ city: cityName, from: defender.name, year: yr });

  const msg = `🏰 Năm ${yr}: ${attacker.name} chiếm ${cityName} của ${defender.name}! (Cướp ${plunder.toLocaleString()} tài phú)`;
  _we_addWorldHistory("war", msg, { warId: war.id });
  if (typeof addLog === "function") addLog(msg, "death");
  if (typeof addTimeline === "function") addTimeline(`🏰 ${attacker.name} chiếm ${cityName}`, "death", "🏰");

  // Tăng hatred
  if (!defender.hatred) defender.hatred = {};
  defender.hatred[attacker.name] = Math.min(100, ((defender.hatred[attacker.name] || 0) + 20));

  // Cập nhật strongest ever
  const gs = window.warStats;
  const atkPow = _we_getMilitaryPower(attacker);
  if (!gs.strongestEver || atkPow > (gs.strongestEver.power || 0)) {
    gs.strongestEver = { name: attacker.name, power: atkPow, year: yr };
  }

  // Kiểm tra diệt quốc
  if (defender.territory <= 0 || (defender.population || 0) < 500) {
    warEngine_collapseCountry(war, defender, attacker);
  }
}

// ============================================================
// COUNTRY COLLAPSE
// ============================================================

function warEngine_collapseCountry(war, loser, winner) {
  if (loser.collapsed) return;
  const yr = window.year || 1;

  loser.collapsed    = true;
  loser.collapseYear = yr;
  war.status         = "collapsed";

  window.warStats.totalCollapsed++;

  // Kết thúc chiến tranh (xóa khỏi active)
  window.warsActive = window.warsActive.filter(w => w.id !== war.id);
  window.warsHistory.unshift({ ...war, endYear: yr, endReason: "collapsed" });

  // Quốc gia thắng hưởng phần thưởng
  const bonus = Math.floor((loser.economy || 0) * 0.5);
  winner.economy   = (winner.economy   || 0) + bonus;
  winner.territory = (winner.territory || 1) + Math.max(1, loser.territory || 0);
  winner.soldiers  = (winner.soldiers  || 0) + Math.floor((loser.soldiers || 0) * 0.3);

  const msg = `💀 Năm ${yr}: ${loser.name} chính thức diệt vong! ${winner.name} thôn tính toàn bộ lãnh thổ.`;
  _we_addWorldHistory("war", msg, { warId: war.id, collapsed: loser.name, winner: winner.name });
  if (typeof addLog === "function") addLog(msg, "death");
  if (typeof addTimeline === "function") addTimeline(`💀 ${loser.name} diệt vong`, "death", "💀");
  if (typeof addWorldHistory === "function") addWorldHistory("death", msg);

  warEngine_save();
  warEngine_renderPanel();
}

// ============================================================
// PEACE TREATY
// ============================================================

function warEngine_tryPeaceTreaty(war) {
  const attacker = window.countries?.find(c => c.name === war.attacker);
  const defender = window.countries?.find(c => c.name === war.defender);
  if (!attacker || !defender) return;

  const yr        = window.year || 1;
  const warLen    = yr - war.startYear;
  const atkWeak   = (attacker.soldiers || 0) < 500;
  const defWeak   = (defender.soldiers || 0) < 500;
  const bothWeak  = atkWeak && defWeak;
  const longWar   = warLen >= 10;

  // Hòa ước nếu: cả 2 yếu, hoặc chiến tranh quá dài, hoặc random ~1%/yr
  const shouldPeace = bothWeak || (longWar && _we_chance(0.3)) || _we_chance(0.01);
  if (!shouldPeace) return;

  // Xác định ai thắng nhiều hơn
  const atkWins = war.attackerLosses < war.defenderLosses;
  const compensation = Math.floor(((atkWins ? defender : attacker).economy || 500) * 0.15);

  if (atkWins) {
    attacker.economy = (attacker.economy || 0) + compensation;
    defender.economy = Math.max(100, (defender.economy || 500) - compensation);
  } else {
    defender.economy = (defender.economy || 0) + compensation;
    attacker.economy = Math.max(100, (attacker.economy || 500) - compensation);
  }

  // Trạng thái: hòa bình, đặt lại quan hệ về neutral
  war.status = "peace";
  war.endYear = yr;
  war.endReason = "treaty";
  window.warsActive  = window.warsActive.filter(w => w.id !== war.id);
  window.warsHistory.unshift({ ...war });

  _we_setMutualRelation(attacker, defender, "neutral");

  const winner  = atkWins ? attacker.name : defender.name;
  const loser   = atkWins ? defender.name : attacker.name;
  const msg = `🕊️ Năm ${yr}: ${war.attacker} và ${war.defender} ký hòa ước. ${winner} thắng cuộc chiến, ${loser} bồi thường ${compensation.toLocaleString()} tài phú.`;
  _we_addWorldHistory("war", msg, { warId: war.id });
  if (typeof addLog === "function") addLog(msg, "important");
  if (typeof addTimeline === "function") addTimeline(`🕊️ Hòa ước: ${war.attacker} — ${war.defender}`, "important", "🕊️");

  warEngine_save();
  warEngine_renderPanel();
}

// ============================================================
// ALLIANCE SYSTEM
// ============================================================

function warEngine_tryFormAlliance() {
  const living = _we_getLivingCountries();
  if (living.length < 2) return;

  living.forEach(c1 => {
    if (!_we_chance(0.015)) return;
    // Tìm nước phù hợp (cùng kẻ thù chung)
    const candidates = living.filter(c2 =>
      c2.id !== c1.id &&
      _we_getRelation(c1, c2) !== "enemy" &&
      !window.warAlliances.some(a =>
        (a.nation1 === c1.name && a.nation2 === c2.name) ||
        (a.nation1 === c2.name && a.nation2 === c1.name)
      )
    );
    if (!candidates.length) return;
    const c2 = _we_rand(candidates);
    const yr = window.year || 1;

    _we_setMutualRelation(c1, c2, "ally");

    const allianceId = "alc_" + Date.now();
    window.warAlliances.push({ id: allianceId, nation1: c1.name, nation2: c2.name, formedYear: yr, type: "alliance" });

    const msg = `🤝 Năm ${yr}: ${c1.name} và ${c2.name} kết thành đồng minh.`;
    _we_addWorldHistory("civilization", msg, {});
    if (typeof addLog === "function") addLog(msg, "important");
    if (typeof addTimeline === "function") addTimeline(`🤝 Liên minh: ${c1.name} — ${c2.name}`, "important", "🤝");

    warEngine_save();
  });
}

// ============================================================
// ARMY REGENERATION (mỗi năm)
// ============================================================

function warEngine_regenArmies() {
  _we_getLivingCountries().forEach(c => {
    const maxSoldiers = Math.floor((c.population || 10000) * 0.1);
    // Tái sinh 5% quân mỗi năm
    c.soldiers = Math.min(maxSoldiers, (c.soldiers || 0) + Math.floor(maxSoldiers * 0.05));
    // Cập nhật militaryPower
    c.militaryPower = _we_getMilitaryPower(c);
    // Giảm hatred dần
    if (c.hatred) {
      Object.keys(c.hatred).forEach(k => {
        c.hatred[k] = Math.max(0, c.hatred[k] - 1);
      });
    }
  });
}

// ============================================================
// MAIN TICK — gọi mỗi năm game
// ============================================================

function warEngine_tick() {
  warEngine_migrateCountries();
  warEngine_regenArmies();
  warEngine_tryDeclareWar();
  warEngine_tryFormAlliance();

  // Xử lý từng chiến tranh đang diễn ra
  const active = window.warsActive.filter(w => w.status === "active");
  active.forEach(war => {
    if (_we_chance(0.5)) warEngine_simulateBattle(war);  // 50% xảy ra trận đánh mỗi tick
    warEngine_checkAllySupport(war);
    warEngine_tryPeaceTreaty(war);
  });

  warEngine_save();
}

// ============================================================
// WORLD HISTORY HELPER
// ============================================================

function _we_addWorldHistory(type, desc, extra) {
  // Ưu tiên dùng hàm gốc nếu có
  if (typeof addWorldHistory === "function") {
    addWorldHistory(type, desc, extra);
  }
  // Fallback: thêm trực tiếp vào worldHistory
  if (window.worldHistory) {
    window.worldHistory.unshift({
      id:        (window.worldHistory.length || 0) + 1,
      year:      window.year || 1,
      eventType: type,
      description: desc,
      ...extra,
    });
    if (window.worldHistory.length > 500) window.worldHistory.pop();
  }
}

// ============================================================
// PANEL RENDER — ⚔️ CHIẾN TRANH
// ============================================================

function warEngine_renderPanel() {
  const panel = document.getElementById("panel-war-engine");
  if (!panel || !panel.classList.contains("active")) return;
  warEngine_renderPanelContent();
}

function warEngine_renderPanelContent() {
  const container = document.getElementById("warEngineContent");
  if (!container) return;

  const living    = _we_getLivingCountries();
  const active    = window.warsActive.filter(w => w.status === "active");
  const gs        = window.warStats;

  // Quốc gia mạnh nhất / yếu nhất
  let strongest = null, weakest = null;
  if (living.length) {
    const sorted = [...living].sort((a, b) => _we_getMilitaryPower(b) - _we_getMilitaryPower(a));
    strongest = sorted[0];
    weakest   = sorted[sorted.length - 1];
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">

      <!-- THỐNG KÊ CHIẾN TRANH -->
      <div style="background:rgba(15,20,40,0.8);border:1px solid rgba(248,113,113,0.25);border-radius:10px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#f87171;letter-spacing:1px;margin-bottom:10px;">📊 THỐNG KÊ</div>
        <div style="display:grid;gap:6px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Tổng số cuộc chiến</span><span style="color:#fca5a5;font-weight:700;">${gs.totalWars}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Tổng số trận đánh</span><span style="color:#fbbf24;font-weight:700;">${gs.totalBattles}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Quốc gia bị diệt</span><span style="color:#c084fc;font-weight:700;">${gs.totalCollapsed}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Đang giao chiến</span><span style="color:#f87171;font-weight:700;">${active.length}</span></div>
          ${gs.strongestEver ? `<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Mạnh nhất lịch sử</span><span style="color:#facc15;font-weight:700;font-size:11px;">${gs.strongestEver.name}</span></div>` : ""}
          ${gs.greatestGeneral ? `<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Danh tướng</span><span style="color:#22d3ee;font-weight:700;font-size:11px;">${gs.greatestGeneral.name}</span></div>` : ""}
        </div>
      </div>

      <!-- QUỐC GIA MẠNH / YẾU -->
      <div style="background:rgba(15,20,40,0.8);border:1px solid rgba(250,204,21,0.2);border-radius:10px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#facc15;letter-spacing:1px;margin-bottom:10px;">👑 SỨC MẠNH QUỐC GIA</div>
        ${strongest ? `
          <div style="margin-bottom:8px;">
            <div style="font-size:10px;color:#4ade80;letter-spacing:1px;">🏆 MẠNH NHẤT</div>
            <div style="font-size:13px;font-weight:700;color:#facc15;">${strongest.name}</div>
            <div style="font-size:11px;color:#94a3b8;">Quân: ${(strongest.soldiers||0).toLocaleString()} · Lực: ${_we_getMilitaryPower(strongest).toLocaleString()}</div>
          </div>
        ` : ""}
        ${weakest && weakest !== strongest ? `
          <div>
            <div style="font-size:10px;color:#f87171;letter-spacing:1px;">⚠️ YẾU NHẤT</div>
            <div style="font-size:13px;font-weight:700;color:#fca5a5;">${weakest.name}</div>
            <div style="font-size:11px;color:#94a3b8;">Quân: ${(weakest.soldiers||0).toLocaleString()} · Lực: ${_we_getMilitaryPower(weakest).toLocaleString()}</div>
          </div>
        ` : ""}
      </div>

      <!-- CHIẾN TRANH ĐANG DIỄN RA -->
      <div style="grid-column:1/-1;background:rgba(15,20,40,0.8);border:1px solid rgba(248,113,113,0.3);border-radius:10px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#f87171;letter-spacing:1px;margin-bottom:10px;">⚔️ CHIẾN TRANH ĐANG DIỄN RA (${active.length})</div>
        ${active.length === 0 ? `<div style="color:#475569;font-size:12px;font-style:italic;">Hiện tại thiên hạ thái bình…</div>` : active.map(war => _we_renderWarCard(war)).join("")}
      </div>

      <!-- QUAN HỆ QUỐC GIA -->
      <div style="background:rgba(15,20,40,0.8);border:1px solid rgba(96,165,250,0.2);border-radius:10px;padding:14px;max-height:260px;overflow-y:auto;">
        <div style="font-size:12px;font-weight:700;color:#60a5fa;letter-spacing:1px;margin-bottom:10px;">🤝 QUAN HỆ NGOẠI GIAO</div>
        ${living.map(c => _we_renderRelations(c)).join("")}
      </div>

      <!-- LỊCH SỬ CHIẾN TRANH -->
      <div style="background:rgba(15,20,40,0.8);border:1px solid rgba(167,139,250,0.2);border-radius:10px;padding:14px;max-height:260px;overflow-y:auto;">
        <div style="font-size:12px;font-weight:700;color:#a78bfa;letter-spacing:1px;margin-bottom:10px;">📜 LỊCH SỬ CHIẾN TRANH (${window.warsHistory.length})</div>
        ${window.warsHistory.length === 0
          ? `<div style="color:#475569;font-size:12px;font-style:italic;">Chưa có chiến tranh nào kết thúc.</div>`
          : window.warsHistory.slice(0, 20).map(w => `
            <div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px;">
              <span style="color:${w.endReason==='collapsed'?'#f87171':'#4ade80'};font-weight:700;">
                ${w.endReason==='collapsed'?'💀':'🕊️'} Năm ${w.startYear}–${w.endYear||'?'}
              </span>
              <span style="color:#e2e8f0;"> ${w.attacker} vs ${w.defender}</span>
              <span style="color:#64748b;"> · ${w.battles.length} trận</span>
            </div>
          `).join("")
        }
      </div>

      <!-- WAR DEBUG PANEL -->
      <div style="grid-column:1/-1;background:rgba(5,10,20,0.9);border:1px solid rgba(250,204,21,0.3);border-radius:10px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#facc15;letter-spacing:1px;margin-bottom:10px;">🛠️ WAR ENGINE DEBUG — Năm ${window.year||1}</div>
        <div style="margin-bottom:8px;display:flex;gap:16px;font-size:11px;flex-wrap:wrap;">
          <span style="color:#4ade80;">✅ WAR ENGINE ACTIVE</span>
          <span style="color:#94a3b8;">Cuộc chiến đã bắt đầu: <b style="color:#fca5a5;">${gs.totalWars}</b></span>
          <span style="color:#94a3b8;">Trận đánh đã diễn ra: <b style="color:#fbbf24;">${gs.totalBattles}</b></span>
          <span style="color:#94a3b8;">Quốc gia bị diệt: <b style="color:#c084fc;">${gs.totalCollapsed}</b></span>
          <span style="color:#94a3b8;">Năm chiến tranh cuối: <b style="color:#f87171;">${gs.lastWarYear||'(chưa có)'}</b></span>
        </div>
        <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Lần kiểm tra tuyên chiến gần nhất (tick năm ${(window.warEngineDebug||{}).tickYear||'?'}):</div>
        <div style="max-height:200px;overflow-y:auto;">
          ${((window.warEngineDebug||{}).entries||[]).length === 0
            ? '<div style="color:#475569;font-style:italic;font-size:11px;">Chưa có dữ liệu debug. Bắt đầu simulation để xem.</div>'
            : (window.warEngineDebug.entries).map(e => `
              <div style="padding:5px 8px;margin-bottom:3px;border-radius:6px;font-size:11px;background:${e.declared?'rgba(74,222,128,0.08)':e.droughtForce?'rgba(250,204,21,0.08)':'rgba(255,255,255,0.03)'}; border:1px solid ${e.declared?'rgba(74,222,128,0.25)':e.droughtForce?'rgba(250,204,21,0.2)':'rgba(255,255,255,0.06)'}">
                <span style="font-weight:700;color:${e.declared?'#4ade80':'#94a3b8'};">${e.declared?'⚔️ TUYÊN CHIẾN':'🔹'} ${e.name||'(hệ thống)'}</span>
                ${e.target ? `<span style="color:#60a5fa;"> → ${e.target}</span>` : ''}
                ${e.score !== undefined ? `<span style="color:#64748b;"> [score:${e.score}/${e.threshold}]</span>` : ''}
                ${e.ambition !== undefined ? `<span style="color:#64748b;"> [ambition:${e.ambition}]</span>` : ''}
                ${e.hatred !== undefined ? `<span style="color:#64748b;"> [hatred:${e.hatred}]</span>` : ''}
                <div style="color:#475569;margin-top:2px;">${e.reason}</div>
              </div>
            `).join('')
          }
        </div>
      </div>

    </div>
  `;
}

function _we_renderWarCard(war) {
  const yr        = window.year || 1;
  const duration  = yr - war.startYear;
  const battles   = war.battles || [];
  const lastBattle = battles[battles.length - 1];
  return `
    <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:10px 12px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-weight:700;color:#fca5a5;font-size:13px;">⚔️ ${war.attacker} → ${war.defender}</span>
        <span style="font-size:10px;color:#64748b;">Năm ${war.startYear} · ${duration} năm · ${battles.length} trận</span>
      </div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Nguyên nhân: ${war.reason}</div>
      <div style="display:flex;gap:16px;font-size:11px;">
        <span>⚔️ ${war.attacker}: mất ${war.attackerLosses.toLocaleString()} quân</span>
        <span>🛡️ ${war.defender}: mất ${war.defenderLosses.toLocaleString()} quân</span>
      </div>
      ${lastBattle ? `<div style="font-size:10px;color:#60a5fa;margin-top:4px;">Trận gần nhất: ${lastBattle.name} (Năm ${lastBattle.year}) → ${lastBattle.winner} thắng</div>` : ""}
      ${war.territoryGained.length ? `<div style="font-size:10px;color:#facc15;margin-top:2px;">🏰 Đã chiếm: ${war.territoryGained.map(t=>t.city).join(", ")}</div>` : ""}
    </div>
  `;
}

function _we_renderRelations(c) {
  const allies  = (c.relations?.allies  || []);
  const enemies = (c.relations?.enemies || []);
  if (!allies.length && !enemies.length) return "";
  return `
    <div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px;">
      <span style="font-weight:700;color:#e2e8f0;">${c.name}</span>
      ${allies.length  ? `<span style="color:#4ade80;margin-left:8px;">🤝 ${allies.join(", ")}</span>` : ""}
      ${enemies.length ? `<span style="color:#f87171;margin-left:8px;">⚔️ ${enemies.join(", ")}</span>` : ""}
    </div>
  `;
}

// ============================================================
// MANUAL CONTROLS (cho nút trong panel)
// ============================================================

function warEngine_forceWar() {
  const living = _we_getLivingCountries();
  if (living.length < 2) { alert("Cần ít nhất 2 quốc gia!"); return; }
  const pairs = [];
  for (let i = 0; i < living.length; i++)
    for (let j = i + 1; j < living.length; j++)
      if (!_we_isAtWar(living[i].name, living[j].name))
        pairs.push([living[i], living[j]]);
  if (!pairs.length) { alert("Mọi quốc gia đã đang giao chiến!"); return; }
  const [a, b] = _we_rand(pairs);
  warEngine_declareWar(a, b);
}

function warEngine_forceBattle() {
  const active = window.warsActive.filter(w => w.status === "active");
  if (!active.length) { alert("Không có chiến tranh đang diễn ra!"); return; }
  const war = _we_rand(active);
  warEngine_simulateBattle(war);
}

function warEngine_forceAlliance() {
  const living = _we_getLivingCountries();
  if (living.length < 2) { alert("Cần ít nhất 2 quốc gia!"); return; }
  const nonAllied = [];
  for (let i = 0; i < living.length; i++)
    for (let j = i + 1; j < living.length; j++)
      if (_we_getRelation(living[i], living[j]) !== "ally" &&
          _we_getRelation(living[i], living[j]) !== "enemy")
        nonAllied.push([living[i], living[j]]);
  if (!nonAllied.length) { alert("Không tìm được cặp phù hợp!"); return; }
  const [a, b] = _we_rand(nonAllied);
  _we_setMutualRelation(a, b, "ally");
  const yr = window.year || 1;
  window.warAlliances.push({ id: "alc_" + Date.now(), nation1: a.name, nation2: b.name, formedYear: yr, type: "alliance" });
  const msg = `🤝 Năm ${yr}: ${a.name} và ${b.name} kết thành đồng minh!`;
  if (typeof addLog === "function") addLog(msg, "important");
  warEngine_save();
  warEngine_renderPanelContent();
}

// ============================================================
// INIT
// ============================================================

function warEngine_init() {
  warEngine_load();
  warEngine_migrateCountries();
  warEngine_save();

  const living = _we_getLivingCountries();
  console.log("%c⚔️ WAR ENGINE ACTIVE", "color:#f87171;font-size:14px;font-weight:bold;", {
    countries: (window.countries || []).length,
    living: living.length,
    warsActive: window.warsActive.length,
    warsHistory: window.warsHistory.length,
    warStats: window.warStats,
  });

  // Force-show war tab if conditions are met
  function _we_showWarTab() {
    const livingNow = _we_getLivingCountries();
    const hasWars = (window.warsActive && window.warsActive.length > 0) ||
                    (window.warsHistory && window.warsHistory.length > 0);
    const btn = document.getElementById('btn-war-engine') ||
                document.querySelector('.nav-btn[data-panel="war-engine"]');
    if (btn && (livingNow.length >= 1 || hasWars)) {
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
      console.log('[WAR ENGINE] Tab ⚔️ Chiến Tranh đã hiển thị (', livingNow.length, 'QG)');
    }
  }
  _we_showWarTab();
  // Retry after a short delay in case save data loads after init
  setTimeout(_we_showWarTab, 500);
  setTimeout(_we_showWarTab, 2000);

  // Render nếu panel đang active
  warEngine_renderPanel();
}

// ============================================================
// EXPORTS
// ============================================================

window.warEngine_tick            = warEngine_tick;
window.warEngine_init            = warEngine_init;
window.warEngine_renderPanel     = warEngine_renderPanel;
window.warEngine_renderPanelContent = warEngine_renderPanelContent;
window.warEngine_forceWar        = warEngine_forceWar;
window.warEngine_forceBattle     = warEngine_forceBattle;
window.warEngine_forceAlliance   = warEngine_forceAlliance;
window.warEngine_save            = warEngine_save;
window.warEngine_load            = warEngine_load;

// Auto-init sau khi DOM sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", warEngine_init);
} else {
  setTimeout(warEngine_init, 100);
}
