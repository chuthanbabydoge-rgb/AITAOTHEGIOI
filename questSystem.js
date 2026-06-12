/* ============================
   QUEST SYSTEM V2.0 — Creator God V6
   HỆ THỐNG NHIỆM VỤ (NPC + PLAYER)
   ============================ */

// ============================
// QUEST DEFINITIONS (NPC system - unchanged)
// ============================

const QUEST_TYPES = {
  hunt_beast: {
    id:          "hunt_beast",
    name:        "Săn Thú",
    icon:        "🐾",
    color:       "#f87171",
    category:    "Chiến Đấu",
    desc:        (q) => `Săn ${q.target} con dã thú tại ${q.region}`,
    generateTarget: (npc) => ({
      target:  Math.max(1, Math.floor((npc.realm + 1) * (2 + Math.random() * 3))),
      region:  npc.region,
    }),
    checkProgress: (npc, q) => {
      const gained = Math.floor(Math.random() * (npc.realm + 1) * 0.5);
      q.progress = Math.min(q.target, (q.progress || 0) + gained);
      return q.progress >= q.target;
    },
    rewards: (npc, q) => ({
      exp:       (q.target) * 80 * (npc.realm + 1),
      wealth:    (q.target) * 50 * (npc.realm + 1),
      prestige:  (q.target) * 20,
      special:   null,
    }),
  },

  collect_herb: {
    id:          "collect_herb",
    name:        "Thu Thập Thảo Dược",
    icon:        "🌿",
    color:       "#4ade80",
    category:    "Thu Thập",
    desc:        (q) => `Thu thập ${q.target} ${q.herbName} tại ${q.region}`,
    generateTarget: (npc) => ({
      target:   Math.max(3, Math.floor(Math.random() * 10 + npc.realm * 2)),
      region:   npc.region,
      herbName: ["Linh Chi","Hỏa Liên","Băng Tâm Thảo","Vạn Niên Nhân Sâm","Thiên Linh Thảo","Độc Tâm Hoa","Đoạt Mệnh Thảo","Hồi Linh Thảo"][Math.floor(Math.random()*8)],
    }),
    checkProgress: (npc, q) => {
      if (!npc.resources) return false;
      const totalHerbs = (npc.resources.lingyao || 0);
      q.progress = Math.min(q.target, totalHerbs + Math.floor(Math.random() * (1 + npc.rootPower * 0.5)));
      return q.progress >= q.target;
    },
    rewards: (npc, q) => ({
      exp:       q.target * 60,
      wealth:    q.target * 80,
      prestige:  q.target * 10,
      special:   null,
    }),
  },

  join_sect: {
    id:          "join_sect",
    name:        "Gia Nhập Môn Phái",
    icon:        "🏯",
    color:       "#fb923c",
    category:    "Xã Hội",
    desc:        (q) => `Gia nhập ${q.sectName || "một môn phái"}`,
    generateTarget: (npc) => {
      const available = (typeof sects !== "undefined") ? sects.filter(s => s.id !== npc.sectId) : [];
      const chosen = available.length ? available[Math.floor(Math.random() * available.length)] : null;
      return { target: 1, sectName: chosen ? chosen.name : "môn phái lớn", sectId: chosen ? chosen.id : null };
    },
    checkProgress: (npc, q) => {
      if (!npc.sectId) return false;
      if (q.sectId && npc.sectId === q.sectId) { q.progress = 1; return true; }
      if (!q.sectId && npc.sectId) { q.progress = 1; return true; }
      return false;
    },
    rewards: (npc, q) => ({
      exp:       500 * (npc.realm + 1),
      wealth:    300,
      prestige:  200,
      special:   null,
    }),
  },

  breakthrough: {
    id:          "breakthrough",
    name:        "Đột Phá Cảnh Giới",
    icon:        "✨",
    color:       "#facc15",
    category:    "Tu Luyện",
    desc:        (q) => `Đột phá đến ${q.targetRealmName}`,
    generateTarget: (npc) => {
      const nextRealm = Math.min(npc.realm + 1, (typeof REALMS !== "undefined" ? REALMS.length - 1 : 8));
      return {
        target:          nextRealm,
        targetRealmName: typeof REALMS !== "undefined" ? REALMS[nextRealm]?.name || "cảnh giới cao hơn" : "cảnh giới cao hơn",
      };
    },
    checkProgress: (npc, q) => {
      q.progress = npc.realm;
      return npc.realm >= q.target;
    },
    rewards: (npc, q) => ({
      exp:       1000 * (npc.realm + 1),
      wealth:    500  * (npc.realm + 1),
      prestige:  300  * (npc.realm + 1),
      special:   npc.realm >= 5 ? "legendary_artifact" : npc.realm >= 3 ? "rare_artifact" : null,
    }),
  },

  revenge: {
    id:          "revenge",
    name:        "Báo Thù",
    icon:        "⚔️",
    color:       "#c084fc",
    category:    "Chiến Đấu",
    desc:        (q) => `Đánh bại ${q.target} kẻ thù của gia tộc`,
    generateTarget: (npc) => ({
      target:  Math.max(1, Math.floor(Math.random() * 3 + 1)),
      region:  npc.region,
    }),
    checkProgress: (npc, q) => {
      const gained = chance(0.3 + npc.luck * 0.002) ? 1 : 0;
      q.progress = Math.min(q.target, (q.progress || 0) + gained);
      return q.progress >= q.target;
    },
    rewards: (npc, q) => ({
      exp:       q.target * 200 * (npc.realm + 1),
      wealth:    q.target * 150,
      prestige:  q.target * 100,
      special:   null,
    }),
  },

  become_elder: {
    id:          "become_elder",
    name:        "Trở Thành Trưởng Lão",
    icon:        "🌟",
    color:       "#67e8f9",
    category:    "Xã Hội",
    desc:        (q) => `Đạt vị trí Trưởng Lão trong môn phái`,
    generateTarget: (npc) => ({ target: 1, minRealm: Math.max(2, npc.realm) }),
    checkProgress: (npc, q) => {
      if (!npc.sectId || typeof sects === "undefined") return false;
      const sect = sects.find(s => s.id === npc.sectId);
      if (!sect) return false;
      const isElder  = sect.elders && sect.elders.includes(npc.id);
      const isLeader = sect.leader === npc.id;
      if (isElder || isLeader) { q.progress = 1; return true; }
      return false;
    },
    rewards: (npc, q) => ({
      exp:       2000 * (npc.realm + 1),
      wealth:    1000,
      prestige:  800,
      special:   "epic_artifact",
    }),
  },
};

const QUEST_TYPE_KEYS = Object.keys(QUEST_TYPES);

// ============================
// QUEST TEMPLATES (Player Quest System)
// ============================

const questTemplates = [
  {
    id:                  "san_huyet_lang",
    name:                "Săn Huyết Lang",
    icon:                "🐺",
    difficulty:          "Common",
    difficultyColor:     "#4ade80",
    description:         "Tiêu diệt bầy Huyết Lang đang hoành hành vùng rừng núi. Thu thập Nanh Huyết Lang để nhận thưởng.",
    target:              5,
    rewardSpiritStone:   100,
    rewardReputation:    10,
    rewardExp:           200,
    successChance:       0.75,
    deathChance:         0.03,
    durationYears:       1,
  },
  {
    id:                  "kham_pha_bi_canh",
    name:                "Khám Phá Bí Cảnh",
    icon:                "🗺️",
    difficulty:          "Rare",
    difficultyColor:     "#60a5fa",
    description:         "Một Bí Cảnh cổ đại vừa xuất hiện. Thám hiểm bên trong để tìm kiếm cơ duyên và bảo vật ẩn giấu.",
    target:              1,
    rewardSpiritStone:   500,
    rewardReputation:    50,
    rewardExp:           800,
    successChance:       0.55,
    deathChance:         0.08,
    durationYears:       2,
  },
  {
    id:                  "tieu_diet_ma_tu",
    name:                "Tiêu Diệt Ma Tu",
    icon:                "👹",
    difficulty:          "Epic",
    difficultyColor:     "#c084fc",
    description:         "Ma Tu từ Hắc Ám Giáo đang làm loạn. Tìm và tiêu diệt tên thủ lĩnh Ma Tu cường đại này.",
    target:              1,
    rewardSpiritStone:   1000,
    rewardReputation:    100,
    rewardExp:           2000,
    successChance:       0.40,
    deathChance:         0.15,
    durationYears:       3,
  },
];

// ============================
// QUEST STATE
// ============================

// NPC quests: { [npcId]: { active: Quest[], completed: Quest[] } }
var npcQuests = {};

// Player quest state
var playerQuests = {
  active:    [],   // Nhiệm vụ đang làm
  completed: [],   // Nhiệm vụ đã hoàn thành
  available: [],   // Nhiệm vụ khả dụng (chờ nhận)
};

// Global quest log
var questLog = [];
var _questIdCounter = 1;

// ============================
// PERSISTENCE PATCH — playerQuests + questLog được lưu QUA multiWorldSystem snapshot
// Chỉ fallback sang localStorage cho single-world save cũ
// ============================
(function patchQuestPersistence() {
  var _origSave = window.save;
  window.save = function () {
    if (_origSave) _origSave();
    try {
      // npcQuests + counter luôn lưu (không per-world)
      localStorage.setItem("cgv6_quests",      JSON.stringify(npcQuests));
      localStorage.setItem("cgv6_questIdCtr",  _questIdCounter);
      // playerQuests/questLog chỉ lưu riêng khi single-world
      if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
        localStorage.setItem("cgv6_questLog",     JSON.stringify((questLog || []).slice(0, 200)));
        localStorage.setItem("cgv6_playerQuests", JSON.stringify(playerQuests));
      }
    } catch(e) {}
  };

  var _origLoad = window.load;
  window.load = function () {
    if (_origLoad) _origLoad();
    try {
      var qs = localStorage.getItem("cgv6_quests");
      if (qs) npcQuests = JSON.parse(qs) || {};
      var qc = localStorage.getItem("cgv6_questIdCtr");
      if (qc) _questIdCounter = parseInt(qc) || 1;
      // playerQuests/questLog chỉ load từ localStorage khi single-world
      if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
        var ql = localStorage.getItem("cgv6_questLog");
        if (ql) questLog = JSON.parse(ql) || [];
        var pq = localStorage.getItem("cgv6_playerQuests");
        if (pq) playerQuests = JSON.parse(pq) || { active:[], completed:[], available:[] };
      }
    } catch(e) {}
  };
})();

// ============================
// HELPERS
// ============================

if (typeof chance === "undefined") { window.chance = function(p) { return Math.random() < p; }; }

function nextQuestId() {
  return "q_" + (_questIdCounter++) + "_" + Date.now().toString(36);
}

function getQuestData(npcId) {
  if (!npcQuests[npcId]) npcQuests[npcId] = { active: [], completed: [] };
  return npcQuests[npcId];
}

function createQuest(npc, typeKey) {
  const qtype = QUEST_TYPES[typeKey];
  if (!qtype) return null;
  const params = qtype.generateTarget(npc);
  return {
    id:        nextQuestId(),
    typeId:    typeKey,
    npcId:     npc.id,
    npcName:   npc.name,
    startYear: (typeof year !== "undefined" ? year : 0),
    progress:  0,
    status:    "active",
    ...params,
  };
}

// ============================
// PLAYER QUEST FUNCTIONS
// ============================

/**
 * generateQuest() — Tạo danh sách nhiệm vụ khả dụng cho Player
 * Refresh available pool dựa theo cảnh giới nhân vật
 */
function generateQuest() {
  if (typeof player === "undefined" || !player || player.status !== "alive") return;

  // Số lượng quest available tối đa = 3 (một mỗi loại)
  // Filter theo realm: Common always, Rare từ realm 1+, Epic từ realm 3+
  playerQuests.available = [];

  questTemplates.forEach(function(tmpl) {
    // Không hiện quest đang active
    const alreadyActive = playerQuests.active.some(q => q.templateId === tmpl.id);
    if (alreadyActive) return;

    // Realm gate
    if (tmpl.difficulty === "Rare"  && player.realm < 1) return;
    if (tmpl.difficulty === "Epic"  && player.realm < 3) return;

    playerQuests.available.push({
      id:          nextQuestId(),
      templateId:  tmpl.id,
      name:        tmpl.name,
      icon:        tmpl.icon,
      difficulty:  tmpl.difficulty,
      difficultyColor: tmpl.difficultyColor,
      description: tmpl.description,
      target:      tmpl.target,
      progress:    0,
      rewardSpiritStone: tmpl.rewardSpiritStone,
      rewardReputation:  tmpl.rewardReputation,
      rewardExp:         tmpl.rewardExp,
      successChance:     tmpl.successChance,
      deathChance:       tmpl.deathChance,
      durationYears:     tmpl.durationYears,
      startYear:   null,
      status:      "available",
    });
  });
}

/**
 * assignQuest(questId) — Player nhận nhiệm vụ từ available
 */
function assignQuest(questId) {
  if (!player || player.status !== "alive") return false;

  const idx = playerQuests.available.findIndex(q => q.id === questId);
  if (idx === -1) return false;

  const quest = playerQuests.available.splice(idx, 1)[0];
  quest.status    = "active";
  quest.startYear = (typeof year !== "undefined" ? year : 0);
  quest.progress  = 0;
  playerQuests.active.push(quest);

  // Log
  addQuestLog(`📜 ${player.name} nhận nhiệm vụ ${quest.name}`);
  if (typeof addLog !== "undefined") {
    addLog(`📜 ${player.name} nhận nhiệm vụ [${quest.icon} ${quest.name}]`, "important");
  }

  // Player biography
  if (player.biography) {
    player.biography.push({
      year: (typeof year !== "undefined" ? year : 0),
      event: `Nhận nhiệm vụ [${quest.name}] — Độ Khó: ${quest.difficulty}.`,
    });
  }

  renderPlayerQuestPanel();
  return true;
}

/**
 * completeQuest(quest, outcome) — Xử lý kết quả nhiệm vụ
 * outcome: "success" | "fail" | "death"
 */
function completeQuest(quest, outcome) {
  if (!player) return;

  quest.status      = outcome;
  quest.completedYear = (typeof year !== "undefined" ? year : 0);

  // Remove from active
  playerQuests.active = playerQuests.active.filter(q => q.id !== quest.id);

  if (outcome === "death") {
    // Player dies
    addQuestLog(`💀 ${player.name} tử vong khi làm nhiệm vụ ${quest.name}`);
    if (typeof addLog !== "undefined") {
      addLog(`💀 ${player.name} tử vong trong khi thực hiện nhiệm vụ [${quest.icon} ${quest.name}]!`, "death");
    }
    playerQuests.completed.unshift(quest);

    // Kill player
    player.status      = "dead";
    player.deathReason = `Tử vong khi thực hiện nhiệm vụ [${quest.name}]`;
    player.deathYear   = (typeof year !== "undefined" ? year : 0);
    if (player.biography) {
      player.biography.push({
        year: player.deathYear,
        event: `☠️ Tử vong trong khi thực hiện nhiệm vụ [${quest.name}].`,
      });
    }

  } else if (outcome === "success") {
    // Grant rewards
    player.wealth     = (player.wealth     || 0) + quest.rewardSpiritStone;
    player.reputation = (player.reputation || 0) + quest.rewardReputation;
    if (typeof player.questsCompleted !== "undefined") player.questsCompleted++;

    // Exp / realm progress
    if (typeof player.realmProgress !== "undefined") {
      player.realmProgress += quest.rewardExp;
    }

    addQuestLog(`🏆 ${player.name} hoàn thành nhiệm vụ`);
    addQuestLog(`💰 +${quest.rewardSpiritStone} linh thạch`);
    addQuestLog(`⭐ +${quest.rewardReputation} danh vọng`);

    if (typeof addLog !== "undefined") {
      addLog(`🏆 ${player.name} hoàn thành nhiệm vụ [${quest.icon} ${quest.name}]! 💰 +${quest.rewardSpiritStone} linh thạch · ⭐ +${quest.rewardReputation} danh vọng`, "important");
    }

    if (player.biography) {
      player.biography.push({
        year: quest.completedYear,
        event: `✅ Hoàn thành nhiệm vụ [${quest.name}]. Nhận +${quest.rewardSpiritStone} linh thạch, +${quest.rewardReputation} danh vọng.`,
      });
    }

    playerQuests.completed.unshift(quest);

  } else {
    // Fail
    addQuestLog(`❌ ${player.name} thất bại nhiệm vụ ${quest.name}`);
    if (typeof addLog !== "undefined") {
      addLog(`❌ ${player.name} thất bại nhiệm vụ [${quest.icon} ${quest.name}].`, "normal");
    }
    if (player.biography) {
      player.biography.push({
        year: quest.completedYear,
        event: `❌ Thất bại nhiệm vụ [${quest.name}].`,
      });
    }
    playerQuests.completed.unshift(quest);
  }

  if (playerQuests.completed.length > 50) playerQuests.completed.pop();

  // Refresh available
  generateQuest();
  renderPlayerQuestPanel();

  // Refresh player panel
  if (typeof renderPlayerPanel === "function") renderPlayerPanel();
}

/**
 * simulateQuestSystem() — Gọi mỗi tick để xử lý tiến trình quest player
 */
function simulateQuestSystem() {
  if (!player || player.status !== "alive") return;

  // Generate available if empty
  if (playerQuests.available.length === 0) generateQuest();

  // AUTO-ACCEPT: tự nhận quest nếu chưa có quest đang làm (tối đa 3 quest cùng lúc)
  while (playerQuests.active.length < 3 && playerQuests.available.length > 0) {
    var q = playerQuests.available[0];
    try { if (typeof acceptQuest === "function") acceptQuest(q.id); } catch(e) { break; }
  }

  // Process active quests
  const toResolve = [];
  playerQuests.active.forEach(function(quest) {
    const curYear = (typeof year !== "undefined" ? year : 0);
    const elapsed = curYear - (quest.startYear || curYear);
    if (elapsed >= quest.durationYears) {
      toResolve.push(quest);
    }
  });

  toResolve.forEach(function(quest) {
    const roll = Math.random();
    if (roll < quest.deathChance) {
      completeQuest(quest, "death");
    } else if (roll < quest.deathChance + quest.successChance) {
      completeQuest(quest, "success");
    } else {
      completeQuest(quest, "fail");
    }
  });
}

// ============================
// QUEST LOG HELPER
// ============================

var playerQuestLog = [];

function addQuestLog(msg) {
  playerQuestLog.unshift({
    year: (typeof year !== "undefined" ? year : 0),
    msg:  msg,
  });
  if (playerQuestLog.length > 100) playerQuestLog.pop();
}

// ============================
// NPC QUEST ASSIGNMENT (unchanged)
// ============================

function assignQuestToNPC(npc) {
  if (npc.status !== "alive") return;
  const data = getQuestData(npc.id);
  if ((data.active || []).length >= 2) return;

  let eligible = [...QUEST_TYPE_KEYS];
  if (npc.sectId) eligible = eligible.filter(k => k !== "join_sect");
  if (npc.realm >= (typeof REALMS !== "undefined" ? REALMS.length - 1 : 8)) {
    eligible = eligible.filter(k => k !== "breakthrough");
  }
  if (!npc.sectId) eligible = eligible.filter(k => k !== "become_elder");

  const activeTypes = (data.active || []).map(q => q.typeId);
  eligible = eligible.filter(k => !activeTypes.includes(k));
  if (!eligible.length) return;

  const typeKey = eligible[Math.floor(Math.random() * eligible.length)];
  const quest   = createQuest(npc, typeKey);
  if (!quest) return;

  if (!data.active) data.active = [];
  data.active.push(quest);
}

// ============================
// NPC QUEST TICK (unchanged)
// ============================

function questTick() {
  if (typeof npcs === "undefined" || !npcs.length) return;

  npcs.forEach(npc => {
    if (npc.status !== "alive") return;
    if (npc.isPlayer) return; // Player handled separately

    if (chance(0.08)) assignQuestToNPC(npc);

    const data = getQuestData(npc.id);
    if (!data.active || !data.active.length) return;

    const toComplete = [];
    data.active.forEach(q => {
      const qtype = QUEST_TYPES[q.typeId];
      if (!qtype) return;
      const done = qtype.checkProgress(npc, q);
      if (done) toComplete.push(q);
    });

    toComplete.forEach(q => completeQuestNPC(npc, q));
  });
}

// Rename internal NPC completeQuest to avoid collision
function completeQuestNPC(npc, q) {
  const qtype = QUEST_TYPES[q.typeId];
  if (!qtype) return;

  q.status      = "completed";
  q.completedYear = (typeof year !== "undefined" ? year : 0);

  const rewards = qtype.rewards(npc, q);

  npc.reputation   = (npc.reputation || 0) + (rewards.exp || 0);
  npc.wealth       = (npc.wealth || 0)     + (rewards.wealth || 0);
  if (typeof heavenPoints !== "undefined") {
    heavenPoints    += Math.floor((rewards.exp || 0) / 500);
  }

  if (rewards.special && typeof rollArtifact !== "undefined") {
    const minRar = rewards.special === "legendary_artifact" ? "legendary"
                 : rewards.special === "epic_artifact"      ? "epic"
                 : rewards.special === "rare_artifact"      ? "rare"
                 : "uncommon";
    const art = rollArtifact(minRar);
    if (art && typeof grantArtifact !== "undefined") {
      grantArtifact(npc, art, `hoàn thành nhiệm vụ "${qtype.name}"`);
    }
  }

  if (npc.biography) {
    npc.biography.push({
      year: (typeof year !== "undefined" ? year : 0),
      event: `Hoàn thành nhiệm vụ [${qtype.name}]. Nhận +${rewards.exp} kinh nghiệm, +${rewards.wealth} linh thạch.`,
    });
  }

  const data = getQuestData(npc.id);
  data.active    = (data.active || []).filter(q2 => q2.id !== q.id);
  if (!data.completed) data.completed = [];
  data.completed.unshift(q);
  if (data.completed.length > 30) data.completed.pop();

  if (typeof addLog !== "undefined") {
    addLog(`📜 ${npc.name} hoàn thành nhiệm vụ [${qtype.icon} ${qtype.name}]! +${rewards.exp} exp, +${rewards.wealth} linh thạch`, "important");
  }

  questLog.unshift({
    year:     (typeof year !== "undefined" ? year : 0),
    npcId:    npc.id,
    npcName:  npc.name,
    typeId:   q.typeId,
    typeName: qtype.name,
    icon:     qtype.icon,
    rewards,
    realm:    npc.realm,
  });
  if (questLog.length > 200) questLog.pop();
}

// ============================
// PATCH simulateWorld
// ============================
(function patchSimulate() {
  function wrapSim(orig) {
    return function () {
      orig();
      questTick();
      simulateQuestSystem();
      var qPanel = document.getElementById("panel-quests");
      if (qPanel && qPanel.classList.contains("active")) renderQuestPanel();
      var pqPanel = document.getElementById("player-quest-section");
      if (pqPanel) renderPlayerQuestPanel();
    };
  }

  function tryPatch() {
    if (typeof window.simulateWorld === "function") {
      // Avoid double-patching
      if (!window.simulateWorld._questPatched) {
        var wrapped = wrapSim(window.simulateWorld);
        wrapped._questPatched = true;
        window.simulateWorld = wrapped;
      }
      return true;
    }
    return false;
  }

  if (!tryPatch()) {
    // Retry on load
    window.addEventListener("load", function () { tryPatch(); });
    // Also retry with polling as safety net
    var _retries = 0;
    var _retryInterval = setInterval(function() {
      _retries++;
      if (tryPatch() || _retries > 20) clearInterval(_retryInterval);
    }, 300);
  }
})();

// ============================
// STYLES
// ============================
(function injectQuestStyles() {
  var style = document.createElement("style");
  style.textContent = [
    /* Nav badge */
    ".quest-nav-badge{display:inline-flex;align-items:center;justify-content:center;background:#f87171;color:#fff;border-radius:999px;font-size:9px;font-weight:700;min-width:16px;height:16px;padding:0 4px;margin-left:5px;letter-spacing:0.3px}",

    /* Panel layout */
    "#panel-quests .panel-grid{grid-template-columns:1fr 1fr}",
    "@media(max-width:768px){#panel-quests .panel-grid{grid-template-columns:1fr}}",

    /* Quest card */
    ".quest-card{background:rgba(255,255,255,0.025);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;transition:all 0.2s;position:relative;overflow:hidden}",
    ".quest-card:hover{border-color:var(--border-hover);background:rgba(255,255,255,0.04);transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,0.4)}",
    ".quest-card-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}",
    ".quest-type-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;border:1px solid}",
    ".quest-title{font-size:13px;font-weight:700;color:var(--white-main);margin-bottom:3px}",
    ".quest-desc{font-size:11px;color:var(--white-dim);line-height:1.5}",
    ".quest-npc-tag{font-size:10px;color:var(--gold);margin-top:4px;display:flex;align-items:center;gap:4px}",
    ".quest-progress-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}",
    ".quest-progress-label{font-size:10px;color:var(--white-dim)}",
    ".quest-progress-val{font-size:11px;font-weight:700;color:var(--white-main)}",
    ".quest-progress-bar{height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;margin-bottom:8px}",
    ".quest-progress-fill{height:100%;border-radius:2px;transition:width 0.5s ease}",
    ".quest-rewards{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}",
    ".qr-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.2);color:var(--gold)}",
    ".qr-chip.exp{background:rgba(96,165,250,0.08);border-color:rgba(96,165,250,0.2);color:#60a5fa}",
    ".qr-chip.wealth{background:rgba(250,204,21,0.08);border-color:rgba(250,204,21,0.2);color:var(--gold)}",
    ".qr-chip.prestige{background:rgba(192,132,252,0.08);border-color:rgba(192,132,252,0.2);color:#c084fc}",
    ".qr-chip.special{background:rgba(249,115,22,0.08);border-color:rgba(249,115,22,0.2);color:#f97316}",
    ".quest-cat-pill{display:inline-flex;align-items:center;padding:1px 8px;border-radius:12px;border:1px solid;font-size:9px;font-weight:700;letter-spacing:0.5px}",
    ".quest-card.completed{opacity:0.65;filter:saturate(0.7)}",
    ".quest-card.completed .quest-progress-fill{background:var(--jade)!important}",
    ".quest-completed-stamp{position:absolute;top:10px;right:10px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:var(--jade);padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;letter-spacing:0.5px}",
    ".qlog-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-left:3px solid;border-radius:8px;margin-bottom:6px;transition:all 0.15s}",
    ".qlog-item:hover{background:rgba(255,255,255,0.04)}",
    ".qlog-icon{font-size:18px;flex-shrink:0}",
    ".qlog-info{flex:1;min-width:0}",
    ".qlog-name{font-size:12px;color:var(--white-main);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".qlog-sub{font-size:10px;color:var(--white-dim);margin-top:1px}",
    ".qlog-year{font-size:10px;color:var(--gold-dim);flex-shrink:0;font-weight:700}",
    ".quest-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}",
    ".quest-stat-box{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center}",
    ".qsb-val{font-size:16px;font-weight:700;color:var(--gold);margin-bottom:3px}",
    ".qsb-label{font-size:10px;color:var(--white-dim)}",
    ".quest-empty{text-align:center;padding:40px 20px;color:var(--white-dim);font-style:italic;font-size:13px;line-height:1.8}",
    ".quest-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}",
    ".qf-btn{padding:4px 12px;font-size:11px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:20px;cursor:pointer;color:var(--white-dim);transition:all 0.15s;font-family:var(--font-cjk),serif}",
    ".qf-btn:hover,.qf-btn.active{border-color:var(--gold);color:var(--gold);background:rgba(250,204,21,0.06)}",

    /* === PLAYER QUEST PANEL === */
    ".pq-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:16px}",
    ".pq-tab{padding:8px 18px;font-size:12px;font-weight:700;cursor:pointer;color:var(--white-dim);border-bottom:2px solid transparent;transition:all 0.2s;font-family:var(--font-cjk),serif;letter-spacing:0.5px}",
    ".pq-tab.active{color:var(--gold);border-bottom-color:var(--gold)}",
    ".pq-tab:hover{color:var(--white-main)}",
    ".pq-tab-content{display:none}.pq-tab-content.active{display:block}",

    /* Player quest card */
    ".pqcard{background:rgba(255,255,255,0.025);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;transition:all 0.2s;position:relative}",
    ".pqcard:hover{border-color:var(--border-hover);transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.4)}",
    ".pqcard-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:10px}",
    ".pqcard-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:rgba(255,255,255,0.04);border:1px solid var(--border)}",
    ".pqcard-title{font-size:14px;font-weight:700;color:var(--white-main);margin-bottom:4px}",
    ".pqcard-desc{font-size:11px;color:var(--white-dim);line-height:1.6}",
    ".pq-diff-badge{display:inline-flex;padding:1px 8px;border-radius:12px;border:1px solid;font-size:9px;font-weight:700;margin-left:8px;letter-spacing:0.5px}",
    ".pq-rewards-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
    ".pq-reward-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600}",
    ".pq-reward-chip.stone{background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.25);color:var(--gold)}",
    ".pq-reward-chip.rep{background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.25);color:#c084fc}",
    ".pq-reward-chip.exp{background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.25);color:#60a5fa}",
    ".pq-accept-btn{width:100%;margin-top:12px;padding:8px;border-radius:8px;background:linear-gradient(135deg,rgba(250,204,21,0.15),rgba(250,204,21,0.08));border:1px solid rgba(250,204,21,0.35);color:var(--gold);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:var(--font-cjk),serif}",
    ".pq-accept-btn:hover{background:linear-gradient(135deg,rgba(250,204,21,0.25),rgba(250,204,21,0.15));border-color:rgba(250,204,21,0.6);box-shadow:0 2px 12px rgba(250,204,21,0.2)}",
    ".pq-status-badge{position:absolute;top:12px;right:12px;padding:2px 10px;border-radius:10px;font-size:9px;font-weight:700;letter-spacing:0.5px}",
    ".pq-status-success{background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.35);color:#4ade80}",
    ".pq-status-fail{background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.35);color:#f87171}",
    ".pq-status-death{background:rgba(100,100,100,0.3);border:1px solid rgba(200,200,200,0.2);color:#aaa}",
    ".pq-status-active{background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.3);color:var(--gold)}",

    /* Progress */
    ".pq-progress-wrap{margin:10px 0 4px}",
    ".pq-progress-row{display:flex;justify-content:space-between;font-size:10px;color:var(--white-dim);margin-bottom:4px}",
    ".pq-progress-bar{height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}",
    ".pq-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#facc15,#fb923c);transition:width 0.5s}",

    /* Quest log mini */
    ".pqlog-item{padding:7px 10px;border-left:3px solid var(--border);margin-bottom:5px;font-size:11px;color:var(--white-dim);background:rgba(255,255,255,0.015);border-radius:0 6px 6px 0}",
    ".pqlog-year{color:var(--gold-dim);font-size:10px;font-weight:700;margin-right:6px}",

    /* Dynasty card fix */
    ".dyn-rank-card{background:rgba(20,15,10,0.6);border:1px solid rgba(250,204,21,0.15)!important;border-radius:14px!important;padding:14px!important;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden}",
    ".dyn-rank-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top left,rgba(250,204,21,0.05),transparent 60%);pointer-events:none}",
    ".dyn-rank-card:hover{border-color:rgba(250,204,21,0.45)!important;background:rgba(250,204,21,0.04)!important;transform:translateX(4px);box-shadow:0 4px 24px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(250,204,21,0.1)}",
    ".dyn-rank-card:nth-child(1){border-color:rgba(250,204,21,0.35)!important;background:linear-gradient(135deg,rgba(250,204,21,0.06),rgba(20,15,10,0.7))!important}",
    ".dyn-rank-card:nth-child(2){border-color:rgba(148,163,184,0.35)!important;background:linear-gradient(135deg,rgba(148,163,184,0.04),rgba(20,15,10,0.7))!important}",
    ".dyn-rank-card:nth-child(3){border-color:rgba(205,127,50,0.35)!important;background:linear-gradient(135deg,rgba(205,127,50,0.04),rgba(20,15,10,0.7))!important}",
    ".dyn-rank-card .dyn-surname{font-size:15px!important;letter-spacing:2px!important}",
    ".dyn-rank-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;margin-top:8px}",
    ".dyn-stat{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;color:var(--white-main);padding:4px}",
    ".dyn-stat span:first-child{font-size:16px}",
    ".dyn-title-chip{background:rgba(250,204,21,0.12)!important;border:1px solid rgba(250,204,21,0.3)!important;color:var(--gold)!important;font-size:10px!important;padding:2px 8px!important;border-radius:12px!important}",
    ".dyn-rank-num{font-size:22px!important;line-height:1}",
    ".dyn-alive-bar-wrap{height:3px;background:rgba(255,255,255,0.07);border-radius:2px;margin-top:10px;overflow:hidden}",
    ".dyn-alive-bar{background:linear-gradient(90deg,rgba(74,222,128,0.6),#4ade80)!important}",
  ].join("");
  document.head.appendChild(style);
})();

// ============================
// HTML INJECTION — NPC Quest Panel (nav + panel)
// ============================
(function injectQuestPanel() {
  function inject() {
    var nav = document.querySelector(".sidebar-nav");
    if (nav && !document.querySelector('[data-panel="quests"]')) {
      var btn = document.createElement("button");
      btn.className = "nav-btn ec-hidden";
      btn.style.display = "none";
      btn.setAttribute("data-panel", "quests");
      btn.setAttribute("onclick", "showPanel('quests')");
      btn.innerHTML = '<span class="nav-icon">📜</span><span>Nhiệm Vụ</span>';
      nav.appendChild(btn);
    }

    var panels = document.querySelector(".panels");
    if (panels && !document.getElementById("panel-quests")) {
      var div = document.createElement("div");
      div.id        = "panel-quests";
      div.className = "panel";
      div.innerHTML = `
        <div style="margin-bottom:14px">
          <div class="dash-section">
            <div class="dash-title">📜 THỐNG KÊ NHIỆM VỤ</div>
            <div class="quest-stat-grid" id="questStats"></div>
          </div>
        </div>

        <div class="panel-grid">
          <!-- LEFT: Active quests -->
          <div>
            <div class="card" style="margin-bottom:14px">
              <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
                <span>⚡ NHIỆM VỤ ĐANG HOẠT ĐỘNG</span>
                <span id="activeQuestCount" style="font-size:11px;color:var(--white-dim)"></span>
              </div>
              <div class="quest-filter-bar" id="questTypeFilter" style="margin-top:10px">
                <button class="qf-btn active" onclick="filterQuests('all',this)">Tất Cả</button>
                <button class="qf-btn" onclick="filterQuests('hunt_beast',this)">🐾 Săn Thú</button>
                <button class="qf-btn" onclick="filterQuests('collect_herb',this)">🌿 Thảo Dược</button>
                <button class="qf-btn" onclick="filterQuests('breakthrough',this)">✨ Tu Luyện</button>
                <button class="qf-btn" onclick="filterQuests('join_sect',this)">🏯 Môn Phái</button>
                <button class="qf-btn" onclick="filterQuests('revenge',this)">⚔️ Báo Thù</button>
                <button class="qf-btn" onclick="filterQuests('become_elder',this)">🌟 Trưởng Lão</button>
              </div>
              <div id="activeQuestList" style="margin-top:10px;max-height:600px;overflow-y:auto"></div>
            </div>
          </div>

          <!-- RIGHT: Completed + Log -->
          <div>
            <div class="card" style="margin-bottom:14px">
              <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
                <span>✅ NHIỆM VỤ ĐÃ HOÀN THÀNH</span>
                <span id="completedQuestCount" style="font-size:11px;color:var(--jade)"></span>
              </div>
              <div id="completedQuestList" style="margin-top:10px;max-height:400px;overflow-y:auto"></div>
            </div>
            <div class="card">
              <div class="card-title">📋 NHẬT KÝ NHIỆM VỤ GẦN ĐÂY</div>
              <div id="questLogList" style="margin-top:10px;max-height:360px;overflow-y:auto"></div>
            </div>
          </div>
        </div>
      `;
      panels.appendChild(div);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();

// ============================
// PLAYER QUEST PANEL INJECTION
// Inject vào panel-player sau khi nó render
// ============================

function renderPlayerQuestPanel() {
  var container = document.getElementById("player-quest-section");
  if (!container) return;

  if (!player || player.status !== "alive") {
    container.innerHTML = "";
    return;
  }

  // Ensure available is populated
  if (playerQuests.available.length === 0) generateQuest();

  var activeCount    = playerQuests.active.length;
  var completedCount = playerQuests.completed.length;
  var availableCount = playerQuests.available.length;

  container.innerHTML = `
    <div class="card" style="margin-top:14px">
      <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span>📜 NHIỆM VỤ CỦA BẠN</span>
        <div style="display:flex;gap:8px;font-size:10px">
          <span style="color:var(--gold)">⚡ ${activeCount} đang làm</span>
          <span style="color:#4ade80">✅ ${completedCount} hoàn thành</span>
          <span style="color:#60a5fa">📋 ${availableCount} khả dụng</span>
        </div>
      </div>

      <!-- TABS -->
      <div class="pq-tabs">
        <div class="pq-tab active" onclick="switchPQTab('active',this)">⚡ Đang Làm (${activeCount})</div>
        <div class="pq-tab" onclick="switchPQTab('available',this)">📋 Khả Dụng (${availableCount})</div>
        <div class="pq-tab" onclick="switchPQTab('completed',this)">✅ Đã Xong (${completedCount})</div>
        <div class="pq-tab" onclick="switchPQTab('log',this)">📝 Nhật Ký</div>
      </div>

      <!-- Tab: Đang Làm -->
      <div class="pq-tab-content active" id="pqtab-active">
        ${renderPQActiveTab()}
      </div>

      <!-- Tab: Khả Dụng -->
      <div class="pq-tab-content" id="pqtab-available">
        ${renderPQAvailableTab()}
      </div>

      <!-- Tab: Đã Xong -->
      <div class="pq-tab-content" id="pqtab-completed">
        ${renderPQCompletedTab()}
      </div>

      <!-- Tab: Nhật Ký -->
      <div class="pq-tab-content" id="pqtab-log">
        ${renderPQLogTab()}
      </div>
    </div>
  `;
}

function switchPQTab(tab, btn) {
  document.querySelectorAll(".pq-tab").forEach(function(t){ t.classList.remove("active"); });
  document.querySelectorAll(".pq-tab-content").forEach(function(c){ c.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  var content = document.getElementById("pqtab-" + tab);
  if (content) content.classList.add("active");
}

function renderPQActiveTab() {
  if (!playerQuests.active.length) {
    return `<div class="quest-empty">🌀 Chưa nhận nhiệm vụ nào.<br><small>Qua tab <b>Khả Dụng</b> để nhận nhiệm vụ mới!</small></div>`;
  }
  return playerQuests.active.map(function(q) {
    const tmpl = questTemplates.find(t => t.id === q.templateId) || {};
    const curYear = (typeof year !== "undefined" ? year : 0);
    const elapsed = curYear - (q.startYear || curYear);
    const pct = Math.min(100, Math.round(elapsed / Math.max(q.durationYears, 1) * 100));
    return `
      <div class="pqcard">
        <div class="pq-status-badge pq-status-active">⚡ ĐANG TIẾN HÀNH</div>
        <div class="pqcard-header">
          <div class="pqcard-icon">${q.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="pqcard-title">${q.name}
              <span class="pq-diff-badge" style="border-color:${q.difficultyColor}44;color:${q.difficultyColor}">${q.difficulty}</span>
            </div>
            <div class="pqcard-desc">${q.description}</div>
          </div>
        </div>
        <div class="pq-progress-wrap">
          <div class="pq-progress-row">
            <span>Tiến độ (Năm ${q.startYear} → Năm ${(q.startYear||0)+q.durationYears})</span>
            <span>${pct}%</span>
          </div>
          <div class="pq-progress-bar"><div class="pq-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="pq-rewards-row">
          <span class="pq-reward-chip stone">💰 +${q.rewardSpiritStone} Linh Thạch</span>
          <span class="pq-reward-chip rep">⭐ +${q.rewardReputation} Danh Vọng</span>
          <span class="pq-reward-chip exp">📈 +${q.rewardExp} EXP</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--white-dim)">
          <span>🎲 Thành công: ${Math.round(q.successChance*100)}%</span>
          <span>💀 Tử vong: ${Math.round(q.deathChance*100)}%</span>
        </div>
      </div>`;
  }).join("");
}

function renderPQAvailableTab() {
  if (!playerQuests.available.length) {
    return `<div class="quest-empty">✅ Không có nhiệm vụ mới.<br><small>Tất cả đang được thực hiện hoặc level chưa đủ.</small></div>`;
  }
  return playerQuests.available.map(function(q) {
    return `
      <div class="pqcard">
        <div class="pqcard-header">
          <div class="pqcard-icon">${q.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="pqcard-title">${q.name}
              <span class="pq-diff-badge" style="border-color:${q.difficultyColor}44;color:${q.difficultyColor}">${q.difficulty}</span>
            </div>
            <div class="pqcard-desc">${q.description}</div>
          </div>
        </div>
        <div class="pq-rewards-row">
          <span class="pq-reward-chip stone">💰 +${q.rewardSpiritStone} Linh Thạch</span>
          <span class="pq-reward-chip rep">⭐ +${q.rewardReputation} Danh Vọng</span>
          <span class="pq-reward-chip exp">📈 +${q.rewardExp} EXP</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--white-dim)">
          <span>⏱ Thời gian: ${q.durationYears} năm</span>
          <span>🎲 Thành công: ${Math.round(q.successChance*100)}%</span>
          <span>💀 Nguy hiểm: ${Math.round(q.deathChance*100)}%</span>
        </div>
        <button class="pq-accept-btn" onclick="assignQuest('${q.id}')">
          📜 Nhận Nhiệm Vụ
        </button>
      </div>`;
  }).join("");
}

function renderPQCompletedTab() {
  if (!playerQuests.completed.length) {
    return `<div class="quest-empty">📜 Chưa hoàn thành nhiệm vụ nào.</div>`;
  }
  return playerQuests.completed.slice(0, 20).map(function(q) {
    const statusClass = q.status === "success" ? "pq-status-success"
                      : q.status === "death"   ? "pq-status-death"
                      : "pq-status-fail";
    const statusLabel = q.status === "success" ? "✔ HOÀN THÀNH"
                      : q.status === "death"   ? "☠ TỬ VONG"
                      : "✘ THẤT BẠI";
    return `
      <div class="pqcard" style="opacity:0.8">
        <div class="pq-status-badge ${statusClass}">${statusLabel}</div>
        <div class="pqcard-header">
          <div class="pqcard-icon">${q.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="pqcard-title">${q.name}
              <span class="pq-diff-badge" style="border-color:${q.difficultyColor}44;color:${q.difficultyColor}">${q.difficulty}</span>
            </div>
            <div class="pqcard-desc" style="color:var(--white-dim)">Năm ${q.startYear||"?"} → Năm ${q.completedYear||"?"}</div>
          </div>
        </div>
        ${q.status === "success" ? `
          <div class="pq-rewards-row">
            <span class="pq-reward-chip stone">💰 +${q.rewardSpiritStone} Linh Thạch</span>
            <span class="pq-reward-chip rep">⭐ +${q.rewardReputation} Danh Vọng</span>
          </div>` : ""}
      </div>`;
  }).join("");
}

function renderPQLogTab() {
  if (!playerQuestLog.length) {
    return `<div class="quest-empty">📋 Chưa có nhật ký nhiệm vụ.</div>`;
  }
  return playerQuestLog.slice(0, 30).map(function(entry) {
    return `<div class="pqlog-item"><span class="pqlog-year">Năm ${entry.year}</span>${entry.msg}</div>`;
  }).join("");
}

// ============================
// HOOK renderPlayerPanel to inject Quest Section
// ============================
(function patchRenderPlayerPanel() {
  function tryPatch() {
    var _orig = window.renderPlayerPanel;
    if (typeof _orig === "function") {
      window.renderPlayerPanel = function() {
        _orig();
        // After rendering, inject quest section into panel-player
        var panel = document.getElementById("panel-player");
        if (!panel) return;
        // Add anchor if not present
        if (!document.getElementById("player-quest-section")) {
          var div = document.createElement("div");
          div.id = "player-quest-section";
          panel.appendChild(div);
        }
        renderPlayerQuestPanel();
      };
    }
  }

  if (typeof window.renderPlayerPanel === "function") {
    tryPatch();
  } else {
    window.addEventListener("load", tryPatch);
  }
})();

// ============================
// NPC QUEST PANEL RENDER FUNCTIONS (unchanged)
// ============================

var _questFilter = "all";

function filterQuests(type, btn) {
  _questFilter = type;
  document.querySelectorAll(".qf-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderQuestPanel();
}

function renderQuestPanel() {
  renderQuestStats();
  renderActiveQuests();
  renderCompletedQuests();
  renderQuestLog();
}

function renderQuestStats() {
  var el = document.getElementById("questStats");
  if (!el) return;

  var totalActive    = 0;
  var totalCompleted = 0;
  Object.values(npcQuests).forEach(function(d) {
    totalActive    += (d.active    || []).length;
    totalCompleted += (d.completed || []).length;
  });

  var typeCounts = {};
  Object.values(npcQuests).forEach(function(d) {
    (d.active || []).forEach(function(q) {
      typeCounts[q.typeId] = (typeCounts[q.typeId] || 0) + 1;
    });
  });
  var topType = Object.entries(typeCounts).sort(function(a,b){return b[1]-a[1];})[0];
  var topTypeDisplay = topType ? (QUEST_TYPES[topType[0]]?.icon + " " + QUEST_TYPES[topType[0]]?.name) : "—";

  el.innerHTML = [
    { icon: "⚡", label: "Đang Hoạt Động", val: totalActive },
    { icon: "✅", label: "Đã Hoàn Thành",  val: totalCompleted },
    { icon: "📊", label: "Phổ Biến Nhất",  val: topTypeDisplay },
  ].map(function(s) {
    return `<div class="quest-stat-box">
      <div style="font-size:20px;margin-bottom:4px">${s.icon}</div>
      <div class="qsb-val">${s.val}</div>
      <div class="qsb-label">${s.label}</div>
    </div>`;
  }).join("");
}

function renderActiveQuests() {
  var el = document.getElementById("activeQuestList");
  if (!el) return;

  var all = [];
  Object.values(npcQuests).forEach(function(d) {
    (d.active || []).forEach(function(q) { all.push(q); });
  });

  if (_questFilter !== "all") {
    all = all.filter(function(q){ return q.typeId === _questFilter; });
  }

  var countEl = document.getElementById("activeQuestCount");
  if (countEl) countEl.textContent = all.length + " nhiệm vụ";

  if (!all.length) {
    el.innerHTML = `<div class="quest-empty">🌀 Chưa có nhiệm vụ nào đang hoạt động.<br><small style="opacity:.5">Để thế giới chạy thêm để NPC nhận nhiệm vụ...</small></div>`;
    return;
  }

  all.sort(function(a, b) {
    var na = typeof npcById === "function" ? npcById(a.npcId) : null;
    var nb = typeof npcById === "function" ? npcById(b.npcId) : null;
    return (nb ? nb.realm : 0) - (na ? na.realm : 0);
  });

  el.innerHTML = all.slice(0, 50).map(function(q) {
    return renderQuestCard(q, false);
  }).join("");
}

function renderCompletedQuests() {
  var el = document.getElementById("completedQuestList");
  if (!el) return;

  var all = [];
  Object.values(npcQuests).forEach(function(d) {
    (d.completed || []).forEach(function(q) { all.push(q); });
  });

  all.sort(function(a, b) { return (b.completedYear || 0) - (a.completedYear || 0); });

  var countEl = document.getElementById("completedQuestCount");
  if (countEl) countEl.textContent = all.length + " đã hoàn thành";

  if (!all.length) {
    el.innerHTML = `<div class="quest-empty">📜 Chưa có nhiệm vụ nào hoàn thành.</div>`;
    return;
  }

  el.innerHTML = all.slice(0, 30).map(function(q) {
    return renderQuestCard(q, true);
  }).join("");
}

function renderQuestCard(q, isCompleted) {
  var qtype  = QUEST_TYPES[q.typeId];
  if (!qtype) return "";
  var npc    = typeof npcById === "function" ? npcById(q.npcId) : null;
  var progress  = q.progress  || 0;
  var target    = q.target    || 1;
  var pct       = Math.min(100, Math.round(progress / Math.max(target, 1) * 100));
  var realmName = (npc && typeof REALMS !== "undefined") ? REALMS[npc.realm]?.name || "?" : "?";
  var rewards = qtype.rewards(npc || { realm: 0, luck: 50 }, q);

  return `<div class="quest-card${isCompleted?" completed":""}">
    ${isCompleted ? '<div class="quest-completed-stamp">✔ HOÀN THÀNH</div>' : ""}
    <div class="quest-card-header">
      <div class="quest-type-icon" style="background:${qtype.color}18;border-color:${qtype.color}44;color:${qtype.color}">${qtype.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="quest-title">${qtype.name}
          <span class="quest-cat-pill" style="background:${qtype.color}10;border-color:${qtype.color}33;color:${qtype.color};margin-left:6px">${qtype.category}</span>
        </div>
        <div class="quest-desc">${qtype.desc(q)}</div>
        <div class="quest-npc-tag">
          <span>🧙</span>
          <span onclick="openNPCModal(${q.npcId})" style="cursor:pointer;text-decoration:underline">${q.npcName}</span>
          <span style="color:var(--white-dim)">·</span>
          <span style="color:${npc ? (typeof realmColor === "function" ? realmColor(npc.realm) : "#facc15") : "#facc15"}">${realmName}</span>
          ${isCompleted ? `<span style="color:var(--white-dim)">· Năm ${q.completedYear || "?"}</span>` : `<span style="color:var(--white-dim)">· Bắt đầu Năm ${q.startYear || "?"}</span>`}
        </div>
      </div>
    </div>
    <div class="quest-progress-row">
      <span class="quest-progress-label">Tiến Độ</span>
      <span class="quest-progress-val">${progress} / ${target} (${pct}%)</span>
    </div>
    <div class="quest-progress-bar">
      <div class="quest-progress-fill" style="width:${pct}%;background:${isCompleted?"var(--jade)":qtype.color}"></div>
    </div>
    <div class="quest-rewards">
      <span class="qr-chip exp">📈 +${rewards.exp} EXP</span>
      <span class="qr-chip wealth">💰 +${rewards.wealth}</span>
      ${rewards.prestige ? `<span class="qr-chip prestige">⭐ +${rewards.prestige} Danh Vọng</span>` : ""}
      ${rewards.special ? `<span class="qr-chip special">🎁 ${rewards.special.replace(/_/g," ").toUpperCase()}</span>` : ""}
    </div>
  </div>`;
}

function renderQuestLog() {
  var el = document.getElementById("questLogList");
  if (!el) return;

  if (!questLog.length) {
    el.innerHTML = `<div class="quest-empty" style="padding:20px">📋 Chưa có nhiệm vụ nào hoàn thành...</div>`;
    return;
  }

  el.innerHTML = questLog.slice(0, 30).map(function(entry) {
    var qtype = QUEST_TYPES[entry.typeId] || { icon: "📜", color: "#facc15" };
    var realmName = (typeof REALMS !== "undefined") ? REALMS[entry.realm]?.name || "?" : "?";
    return `<div class="qlog-item" style="border-left-color:${qtype.color}">
      <div class="qlog-icon">${entry.icon || qtype.icon}</div>
      <div class="qlog-info">
        <div class="qlog-name">${entry.npcName} — ${entry.typeName}</div>
        <div class="qlog-sub">${realmName} · +${entry.rewards.exp} exp · +${entry.rewards.wealth} 💰</div>
      </div>
      <div class="qlog-year">Năm ${entry.year}</div>
    </div>`;
  }).join("");
}

// ============================
// HOOK showPanel
// ============================
(function patchShowPanel() {
  function doWrap(orig) {
    return function(panel) {
      orig(panel);
      if (panel === "quests") renderQuestPanel();
      if (panel === "player") {
        // Re-render player quest panel after tab switch
        setTimeout(renderPlayerQuestPanel, 50);
      }
    };
  }

  if (typeof window.showPanel === "function") {
    window.showPanel = doWrap(window.showPanel);
  } else {
    window.addEventListener("load", function() {
      if (typeof window.showPanel === "function") {
        window.showPanel = doWrap(window.showPanel);
      }
    });
  }
})();

// Dynasty panel refresh hook
(function patchDynastyPanel() {
  var _orig = window.showPanel;
  if (typeof _orig === "function") {
    var _prev = _orig;
    window.showPanel = function(panel) {
      _prev(panel);
      if (panel === "dynasty" && typeof renderDynastyPanel === "function") {
        renderDynastyPanel();
      }
    };
  }
})();

console.log("📜 Quest System V2.0 loaded! (NPC + Player Quest System)");
