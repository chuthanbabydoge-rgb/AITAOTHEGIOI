/* ============================================================
   ARTIFACT & EQUIPMENT SYSTEM — duan2 v7
   artifactSystem.js
   Không phá hệ thống cũ. Mở rộng thêm.
   ============================================================ */

// ============================================================
// ARTIFACT DATABASE — 5 cấp độ: Common → Mythic
// ============================================================

const ARTIFACT_RARITY_CONFIG = {
  common:    { label: "Phổ Thông",   color: "#94a3b8", glow: "rgba(148,163,184,0.2)",  stars: "★",        weight: 45, repBonus: 0     },
  rare:      { label: "Quý Hiếm",    color: "#60a5fa", glow: "rgba(96,165,250,0.25)",   stars: "★★★",      weight: 25, repBonus: 50    },
  epic:      { label: "Sử Thi",      color: "#c084fc", glow: "rgba(192,132,252,0.28)",  stars: "★★★★",     weight: 15, repBonus: 200   },
  legendary: { label: "Huyền Thoại", color: "#facc15", glow: "rgba(250,204,21,0.3)",    stars: "★★★★★",    weight: 10, repBonus: 800   },
  mythic:    { label: "Thần Thoại",  color: "#f97316", glow: "rgba(249,115,22,0.4)",    stars: "✦✦✦✦✦✦",   weight: 5,  repBonus: 3000  },
};

// Named artifact database — mỗi artifact là bảo vật độc nhất
const NAMED_ARTIFACT_DB = [
  // ======================== COMMON ========================
  {
    id: "art_c1", name: "Phàm Tiết Kiếm",     rarity: "common",
    icon: "⚔️",  type: "Weapon", slot: "weapon",
    attack: 18, defense: 0, hp: 0, spiritBonus: 0,
    description: "Kiếm bình thường của tu sĩ mới nhập môn. Tuy phàm nhưng sắc bén.",
  },
  {
    id: "art_c2", name: "Bố Giáp",             rarity: "common",
    icon: "🧥",  type: "Armor",  slot: "armor",
    attack: 0, defense: 15, hp: 80, spiritBonus: 0,
    description: "Áo giáp vải thô, không linh lực. Dùng tạm trong giai đoạn đầu.",
  },
  {
    id: "art_c3", name: "Tụ Linh Bội",         rarity: "common",
    icon: "🔯",  type: "Artifact", slot: "artifact",
    attack: 5, defense: 5, hp: 100, spiritBonus: 2,
    description: "Bội ngọc nhỏ tụ linh khí. Giúp tu luyện nhanh hơn đôi chút.",
  },
  {
    id: "art_c4", name: "Đồng Tiêu",           rarity: "common",
    icon: "🗡️",  type: "Weapon", slot: "weapon",
    attack: 14, defense: 3, hp: 0, spiritBonus: 0,
    description: "Giản đồng cũ, hình thức xấu nhưng bền bỉ không kém.",
  },

  // ======================== RARE ========================
  {
    id: "art_r1", name: "Thanh Long Kiếm",     rarity: "rare",
    icon: "💚",  type: "Weapon", slot: "weapon",
    attack: 120, defense: 10, hp: 200, spiritBonus: 15,
    description: "Kiếm xanh hình rồng, chứa linh lực mộc hệ. Từng là báu vật của một danh gia.",
  },
  {
    id: "art_r2", name: "Bạch Hổ Đao",        rarity: "rare",
    icon: "🐯",  type: "Weapon", slot: "weapon",
    attack: 140, defense: 0, hp: 0, spiritBonus: 12,
    description: "Đao chứa tinh hoa bạch hổ, khí lực vượt trội. Phù hợp với người tu kim hệ.",
  },
  {
    id: "art_r3", name: "Huyền Vũ Giáp",      rarity: "rare",
    icon: "🛡️",  type: "Armor",  slot: "armor",
    attack: 10, defense: 130, hp: 800, spiritBonus: 10,
    description: "Giáp huyền vũ, cứng chắc như mai rùa thần. Giảm phần lớn sát thương.",
  },
  {
    id: "art_r4", name: "Cửu Long Đỉnh",      rarity: "rare",
    icon: "🏺",  type: "Artifact", slot: "artifact",
    attack: 60, defense: 60, hp: 1500, spiritBonus: 20,
    description: "Đỉnh cửu long, chứa linh lực vô biên. Phóng ra chín luồng rồng khí.",
  },
  {
    id: "art_r5", name: "Băng Tâm Giáp",      rarity: "rare",
    icon: "❄️",  type: "Armor",  slot: "armor",
    attack: 0, defense: 110, hp: 1000, spiritBonus: 8,
    description: "Giáp băng tâm, tâm thái bình tĩnh như băng tuyết vĩnh cửu.",
  },

  // ======================== EPIC ========================
  {
    id: "art_e1", name: "Trảm Tiên Đao",      rarity: "epic",
    icon: "🔪",  type: "Weapon", slot: "weapon",
    attack: 300, defense: 20, hp: 500, spiritBonus: 40,
    description: "Đao từng trảm tiên nhân, sắc bén vô song. Chứa oán khí nghìn năm.",
  },
  {
    id: "art_e2", name: "Thần Kiếm Vô Danh",  rarity: "epic",
    icon: "✨",  type: "Weapon", slot: "weapon",
    attack: 280, defense: 30, hp: 300, spiritBonus: 50,
    description: "Kiếm không tên, thần uy khó đo lường. Chỉ người có duyên mới sử dụng được.",
  },
  {
    id: "art_e3", name: "Thiên Ngọc Khải",    rarity: "epic",
    icon: "💫",  type: "Armor",  slot: "armor",
    attack: 30, defense: 250, hp: 2500, spiritBonus: 35,
    description: "Khải thiên ngọc, khí vận vô song. Hộ thể như bức tường thiên địa.",
  },
  {
    id: "art_e4", name: "Hà Đồ Lạc Thư",     rarity: "epic",
    icon: "📜",  type: "Artifact", slot: "artifact",
    attack: 80, defense: 120, hp: 2500, spiritBonus: 55,
    description: "Thiên thư cổ đại, tiên tri vận mệnh thiên hạ. Linh bảo bậc nhất các thế hệ.",
  },
  {
    id: "art_e5", name: "Tam Tài Thiên Ấn",   rarity: "epic",
    icon: "👁️",  type: "Artifact", slot: "artifact",
    attack: 120, defense: 80, hp: 4000, spiritBonus: 45,
    description: "Ấn tam tài — thiên địa nhân nhất thể. Kẻ sở hữu có thể cảm nhận thiên cơ.",
  },

  // ======================== LEGENDARY ========================
  {
    id: "art_l1", name: "Tru Tiên Kiếm",      rarity: "legendary",
    icon: "☄️",  type: "Weapon", slot: "weapon",
    attack: 1800, defense: 150, hp: 8000, spiritBonus: 200,
    description: "Kiếm vạn cổ trừ tiên. Nhất kiếm phá trời đất, vạn tiên cũng khó đỡ. Thần khí đệ nhất.",
  },
  {
    id: "art_l2", name: "Hỗn Độn Chung",      rarity: "legendary",
    icon: "🔔",  type: "Artifact", slot: "artifact",
    attack: 250, defense: 350, hp: 12000, spiritBonus: 180,
    description: "Chuông hỗn độn khai thiên, tiếng ngân vang vạn dặm. Phòng thủ đệ nhất linh bảo.",
  },
  {
    id: "art_l3", name: "Bàn Cổ Phủ",         rarity: "legendary",
    icon: "🪓",  type: "Weapon", slot: "weapon",
    attack: 2000, defense: 100, hp: 5000, spiritBonus: 150,
    description: "Phủ của Bàn Cổ khai thiên tịch địa. Uy lực không gì sánh bằng, một phát khai sơn.",
  },
  {
    id: "art_l4", name: "Bất Diệt Thần Khải", rarity: "legendary",
    icon: "🌠",  type: "Armor",  slot: "armor",
    attack: 80, defense: 600, hp: 10000, spiritBonus: 120,
    description: "Thần khải bất diệt, không sợ thiên kiếp. Kẻ mặc vào như có thiên địa hộ thể.",
  },
  {
    id: "art_l5", name: "Thái Cực Nghi Linh",  rarity: "legendary",
    icon: "☯️",  type: "Artifact", slot: "artifact",
    attack: 300, defense: 250, hp: 9000, spiritBonus: 160,
    description: "Nghi linh thái cực — âm dương nhất thể. Cân bằng vũ trụ, thông thiên địa.",
  },

  // ======================== MYTHIC ========================
  {
    id: "art_m1", name: "Hỗn Độn Linh Châu",  rarity: "mythic",
    icon: "🌌",  type: "Artifact", slot: "artifact",
    attack: 800, defense: 800, hp: 50000, spiritBonus: 500,
    description: "Linh châu nguyên thủy hỗn độn, siêu việt thiên địa. Khai thiên chi bảo tuyệt đỉnh.",
  },
  {
    id: "art_m2", name: "Vô Cực Thiên Đao",   rarity: "mythic",
    icon: "🌠",  type: "Weapon", slot: "weapon",
    attack: 5000, defense: 300, hp: 20000, spiritBonus: 600,
    description: "Đao vô cực xuyên thiên địa. Không gian và thời gian đều cắt đứt trước lưỡi đao này.",
  },
  {
    id: "art_m3", name: "Thiên Địa Huyền Hoàng",rarity: "mythic",
    icon: "🏛️",  type: "Armor",  slot: "armor",
    attack: 200, defense: 2000, hp: 80000, spiritBonus: 400,
    description: "Giáp thiên địa huyền hoàng — bao trùm càn khôn. Vô địch về phòng thủ trong tam giới.",
  },
  {
    id: "art_m4", name: "Khai Thiên Phủ",      rarity: "mythic",
    icon: "🔱",  type: "Weapon", slot: "weapon",
    attack: 4500, defense: 500, hp: 15000, spiritBonus: 700,
    description: "Phủ thần của đấng khai thiên. Mỗi nhát phủ có thể khai sơn phá thạch, chấn động tam giới.",
  },
  {
    id: "art_m5", name: "Vô Lượng Phật Đỉnh",  rarity: "mythic",
    icon: "🪬",  type: "Artifact", slot: "artifact",
    attack: 600, defense: 1000, hp: 60000, spiritBonus: 800,
    description: "Đỉnh phật vô lượng, chứa đựng từ bi của vạn Phật. Kẻ sở hữu tiêu trừ mọi tà ác.",
  },
];

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * generateArtifact(options)
 * Tạo ra một artifact ngẫu nhiên, có thể ép rarity hoặc slot
 * @param {Object} options { rarity, slot, source }
 * @returns artifact object (clone từ DB + id riêng)
 */
function generateArtifact({ rarity = null, slot = null, source = "random" } = {}) {
  // Xác định rarity
  let targetRarity = rarity;
  if (!targetRarity) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [key, cfg] of Object.entries(ARTIFACT_RARITY_CONFIG)) {
      cumulative += cfg.weight;
      if (roll < cumulative) { targetRarity = key; break; }
    }
    targetRarity = targetRarity || "common";
  }

  // Lọc pool
  let pool = NAMED_ARTIFACT_DB.filter(a => a.rarity === targetRarity);
  if (slot) pool = pool.filter(a => a.slot === slot);
  if (!pool.length) pool = NAMED_ARTIFACT_DB.filter(a => a.rarity === targetRarity);
  if (!pool.length) pool = NAMED_ARTIFACT_DB; // fallback

  const template = pool[Math.floor(Math.random() * pool.length)];
  const artifact = {
    ...template,
    uid: `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    source, // "quest", "boss", "dungeon", "discovery"
    obtainedYear: (typeof year !== "undefined" ? year : 0),
    equipped: false,
    // Map bonuses to equipment system format
    atkBonus:    template.attack,
    defBonus:    template.defense,
    hpBonus:     template.hp,
    luckBonus:   template.spiritBonus,
    value:       _artifactValue(template.rarity),
  };
  return artifact;
}

function _artifactValue(rarity) {
  const map = { common: 500, rare: 8000, epic: 40000, legendary: 250000, mythic: 999999 };
  return map[rarity] || 500;
}

/**
 * equipArtifact(entity, artifactUid)
 * Trang bị artifact cho player hoặc NPC
 * @param entity  player object hoặc npc object
 * @param artifactUid uid của artifact trong entity.artifacts
 */
function equipArtifact(entity, artifactUid) {
  if (!entity) return { ok: false, msg: "Không tìm thấy nhân vật." };
  if (!entity.artifacts) entity.artifacts = [];

  const artifact = entity.artifacts.find(a => a.uid === artifactUid);
  if (!artifact) return { ok: false, msg: "Artifact không tồn tại." };
  if (artifact.equipped) return { ok: false, msg: `${artifact.name} đã được trang bị.` };

  const slot = artifact.slot;

  // Tháo artifact cũ ở cùng slot (nếu có)
  const oldEquipped = entity.artifacts.find(a => a.equipped && a.slot === slot);
  if (oldEquipped) {
    unequipArtifact(entity, oldEquipped.uid);
  }

  // Trang bị mới
  artifact.equipped = true;
  _applyArtifactStats(entity, artifact, +1);

  // Danh vọng bonus
  const repBonus = ARTIFACT_RARITY_CONFIG[artifact.rarity]?.repBonus || 0;
  if (repBonus && typeof entity.reputation !== "undefined") {
    entity.reputation = (entity.reputation || 0) + repBonus;
  }

  const isPlayer = (typeof player !== "undefined" && entity === player);
  const logMsg = `🌟 ${entity.name} trang bị [${artifact.icon} ${artifact.name}] (${ARTIFACT_RARITY_CONFIG[artifact.rarity]?.label})`;
  if (typeof addLog === "function") addLog(logMsg, "important");
  if (isPlayer && typeof addQuestLog === "function") addQuestLog(logMsg);

  if (isPlayer) {
    if (typeof renderPlayerPanel === "function") renderPlayerPanel();
    if (typeof save === "function") save();
  }

  return { ok: true, msg: logMsg };
}

/**
 * unequipArtifact(entity, artifactUid)
 * Tháo artifact, trả về túi đồ artifacts
 */
function unequipArtifact(entity, artifactUid) {
  if (!entity || !entity.artifacts) return { ok: false, msg: "Không tìm thấy artifact." };

  const artifact = entity.artifacts.find(a => a.uid === artifactUid);
  if (!artifact) return { ok: false, msg: "Artifact không tồn tại." };
  if (!artifact.equipped) return { ok: false, msg: `${artifact.name} chưa được trang bị.` };

  artifact.equipped = false;
  _applyArtifactStats(entity, artifact, -1);

  // Hoàn lại danh vọng
  const repBonus = ARTIFACT_RARITY_CONFIG[artifact.rarity]?.repBonus || 0;
  if (repBonus && typeof entity.reputation !== "undefined") {
    entity.reputation = Math.max(0, (entity.reputation || 0) - repBonus);
  }

  const isPlayer = (typeof player !== "undefined" && entity === player);
  if (isPlayer) {
    if (typeof renderPlayerPanel === "function") renderPlayerPanel();
    if (typeof save === "function") save();
  }

  return { ok: true, msg: `${artifact.name} đã tháo ra.` };
}

/**
 * dropArtifact(entity, artifactUid)
 * Xóa artifact khỏi entity (vứt đi hoặc cho NPC)
 */
function dropArtifact(entity, artifactUid) {
  if (!entity || !entity.artifacts) return { ok: false, msg: "Không tìm thấy artifact." };

  const idx = entity.artifacts.findIndex(a => a.uid === artifactUid);
  if (idx === -1) return { ok: false, msg: "Artifact không tồn tại." };

  const artifact = entity.artifacts[idx];
  if (artifact.equipped) {
    unequipArtifact(entity, artifactUid);
  }

  entity.artifacts.splice(idx, 1);

  const isPlayer = (typeof player !== "undefined" && entity === player);
  if (isPlayer) {
    if (typeof renderPlayerPanel === "function") renderPlayerPanel();
    if (typeof save === "function") save();
  }

  return { ok: true, msg: `${artifact.icon} ${artifact.name} đã bị vứt bỏ.` };
}

/**
 * grantArtifact(entity, options)
 * Trao artifact cho entity (player hoặc NPC), tự log
 * @param entity
 * @param options generateArtifact options
 */
function grantArtifact(entity, options = {}) {
  if (!entity) return null;
  if (!entity.artifacts) entity.artifacts = [];

  const artifact = generateArtifact(options);
  entity.artifacts.push(artifact);

  const isPlayer = (typeof player !== "undefined" && entity === player);
  const sourceLabel = {
    quest:     "hoàn thành nhiệm vụ",
    boss:      "đánh bại Boss",
    dungeon:   "chinh phục bí cảnh",
    discovery: "khám phá ngẫu nhiên",
  }[artifact.source] || "thu nhận";

  const rarityLabel = ARTIFACT_RARITY_CONFIG[artifact.rarity]?.label || artifact.rarity;
  const logMsg = `⚔ ${entity.name} nhận được [${artifact.icon} ${artifact.name}] (${rarityLabel}) từ ${sourceLabel}!`;

  if (typeof addLog === "function") addLog(logMsg, "important");
  if (isPlayer && typeof addQuestLog === "function") addQuestLog(logMsg);
  if (isPlayer && entity.biography) {
    entity.biography.push({
      year: artifact.obtainedYear,
      event: `⚔ Nhận được thần bảo [${artifact.name}] (${rarityLabel}).`,
    });
  }

  return artifact;
}

// ============================================================
// INTERNAL — Apply / Remove stats
// ============================================================

function _applyArtifactStats(entity, artifact, sign) {
  // sign = +1 (equip) or -1 (unequip)
  if (artifact.attack)      entity.attack  = Math.max(1, (entity.attack  || 0) + sign * artifact.attack);
  if (artifact.defense)     entity.defense = Math.max(0, (entity.defense || 0) + sign * artifact.defense);
  if (artifact.hp) {
    entity.maxHp = Math.max(50, (entity.maxHp || 100) + sign * artifact.hp);
    if (sign > 0) entity.hp = Math.min((entity.hp || 0) + artifact.hp, entity.maxHp);
    else          entity.hp = Math.min(entity.hp || 0, entity.maxHp);
  }
  if (artifact.spiritBonus) entity.luck = Math.max(0, (entity.luck || 0) + sign * artifact.spiritBonus);
}

// ============================================================
// NPC AUTO-EQUIP ARTIFACTS
// ============================================================

/**
 * autoEquipArtifactsNPC(npc)
 * Tự trang bị artifact tốt nhất trong entity.artifacts
 */
function autoEquipArtifactsNPC(npc) {
  if (!npc || !npc.artifacts) return;
  const slots = ["weapon", "armor", "artifact"];
  slots.forEach(slot => {
    const best = npc.artifacts
      .filter(a => !a.equipped && a.slot === slot)
      .sort((a, b) => (b.attack + b.defense + b.hp) - (a.attack + a.defense + a.hp))[0];
    if (best) equipArtifact(npc, best.uid);
  });
}

// ============================================================
// ARTIFACT APPEARANCE IN WORLD EVENTS
// ============================================================

/**
 * rollArtifactDiscovery(npc)
 * Gọi mỗi lượt — xác suất nhỏ NPC khám phá artifact
 */
function rollArtifactDiscovery(npc) {
  if (!npc || npc.status !== "alive") return;
  if (!npc.artifacts) npc.artifacts = [];

  const realmBonus = (npc.realm || 0) * 0.5; // cảnh giới cao hơn → cơ hội cao hơn
  const chance = 0.8 + realmBonus; // % mỗi lượt
  if (Math.random() * 100 > chance) return;

  // Rarity phụ thuộc realm
  let rarity;
  const r = npc.realm || 0;
  if (r >= 12)      rarity = Math.random() < 0.05 ? "mythic"    : "legendary";
  else if (r >= 9)  rarity = Math.random() < 0.08 ? "legendary" : "epic";
  else if (r >= 6)  rarity = Math.random() < 0.12 ? "epic"      : "rare";
  else if (r >= 3)  rarity = Math.random() < 0.20 ? "rare"      : "common";
  else              rarity = "common";

  grantArtifact(npc, { rarity, source: "discovery" });
  autoEquipArtifactsNPC(npc);
}

/**
 * grantBossArtifact(winner, boss)
 * Thưởng artifact sau khi đánh boss
 */
function grantBossArtifact(winner, boss) {
  if (!winner) return;
  const bossRealm = boss?.realm || 5;
  let rarity;
  if (bossRealm >= 12)     rarity = "mythic";
  else if (bossRealm >= 9) rarity = "legendary";
  else if (bossRealm >= 6) rarity = "epic";
  else if (bossRealm >= 3) rarity = "rare";
  else                     rarity = "rare";

  return grantArtifact(winner, { rarity, source: "boss" });
}

/**
 * grantQuestArtifact(player, questDifficulty)
 * Thưởng artifact khi hoàn thành nhiệm vụ
 * questDifficulty: 1=easy, 2=normal, 3=hard, 4=epic, 5=legendary
 */
function grantQuestArtifact(entity, questDifficulty = 2) {
  const rarityMap = { 1: "common", 2: "rare", 3: "epic", 4: "legendary", 5: "mythic" };
  const rarity = rarityMap[questDifficulty] || "rare";
  return grantArtifact(entity, { rarity, source: "quest" });
}

/**
 * grantDungeonArtifact(winner, dungeonTier)
 * Thưởng artifact khi xong bí cảnh
 * dungeonTier: 1-5
 */
function grantDungeonArtifact(entity, dungeonTier = 2) {
  const rarityMap = { 1: "rare", 2: "rare", 3: "epic", 4: "legendary", 5: "mythic" };
  const rarity = rarityMap[dungeonTier] || "rare";
  return grantArtifact(entity, { rarity, source: "dungeon" });
}

// ============================================================
// HOOK INTO EXISTING SYSTEMS (safe, non-destructive)
// ============================================================

// Hook: Quest complete — chance for artifact reward
const _origCompleteQuest = (typeof completeQuest !== "undefined") ? completeQuest : null;

function _artifactQuestHook(quest, outcome) {
  if (outcome === "success" && player && quest) {
    const diff = quest.difficulty || 2;
    // 40% cơ hội nhận artifact khi hoàn thành quest
    if (Math.random() < 0.4) {
      const art = grantQuestArtifact(player, diff);
      if (art && typeof addQuestLog === "function") {
        addQuestLog(`⚔ Phần thưởng đặc biệt: [${art.icon} ${art.name}]!`);
      }
    }
  }
}

// Hook: Boss defeated — grant artifact
function _hookBossDefeated(winner, boss) {
  if (!winner) return;
  grantBossArtifact(winner, boss);
}

// Hook: Dungeon complete
function _hookDungeonComplete(winner, dungeonTier) {
  if (!winner) return;
  grantDungeonArtifact(winner, dungeonTier);
}

// Hook into yearly tick — random discovery for NPCs
function _hookArtifactYearlyTick() {
  if (typeof npcs === "undefined") return;
  const alive = npcs.filter(n => n.status === "alive");
  // Chỉ process 10% NPC mỗi lượt để không nặng
  const sample = alive.filter(() => Math.random() < 0.1);
  sample.forEach(npc => rollArtifactDiscovery(npc));
  // Player có cơ hội khám phá
  if (typeof player !== "undefined" && player && player.status === "alive") {
    rollArtifactDiscovery(player);
  }
}

// Register yearly hook
if (typeof window !== "undefined") {
  window._artifactYearlyHook = _hookArtifactYearlyTick;
}

// ============================================================
// PLAYER PANEL — ARTIFACT UI SECTIONS
// ============================================================

/**
 * renderArtifactPanel(containerId)
 * Render UI artifact vào container
 */
function renderArtifactPanel(containerId = "artifact-panel-content") {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!player) { el.innerHTML = `<div style="color:var(--white-dim);text-align:center;padding:24px">Chưa có nhân vật.</div>`; return; }

  const arts = player.artifacts || [];
  const equipped   = arts.filter(a => a.equipped);
  const unequipped = arts.filter(a => !a.equipped);

  const rarityStyle = (r) => {
    const cfg = ARTIFACT_RARITY_CONFIG[r] || {};
    return `color:${cfg.color||"#fff"};text-shadow:0 0 8px ${cfg.glow||"transparent"}`;
  };

  const artifactCard = (art, showEquipBtn) => `
    <div class="artifact-card rarity-border-${art.rarity}" style="
      background:rgba(15,23,42,0.7);
      border:1px solid ${ARTIFACT_RARITY_CONFIG[art.rarity]?.color || '#444'};
      border-radius:10px;padding:10px 12px;margin-bottom:8px;
      box-shadow:0 0 12px ${ARTIFACT_RARITY_CONFIG[art.rarity]?.glow || 'transparent'};
      display:flex;align-items:center;gap:10px;
    ">
      <div style="font-size:1.8em;min-width:36px;text-align:center">${art.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;${rarityStyle(art.rarity)};font-size:13px">${art.name}</div>
        <div style="font-size:11px;color:#${art.rarity==='mythic'?'f97316':art.rarity==='legendary'?'facc15':'94a3b8'};margin:1px 0">
          ${ARTIFACT_RARITY_CONFIG[art.rarity]?.stars || ''} ${ARTIFACT_RARITY_CONFIG[art.rarity]?.label || art.rarity}
          · ${art.type} · ${art.source || ''}
        </div>
        <div style="font-size:11px;color:var(--white-dim);margin:3px 0">${art.description}</div>
        <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">
          ${art.attack  ? `<span style="color:#f87171;font-size:11px">⚔️+${art.attack}</span>` : ''}
          ${art.defense ? `<span style="color:#60a5fa;font-size:11px">🛡️+${art.defense}</span>` : ''}
          ${art.hp      ? `<span style="color:#4ade80;font-size:11px">❤️+${art.hp}</span>` : ''}
          ${art.spiritBonus ? `<span style="color:#c084fc;font-size:11px">✨+${art.spiritBonus}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;min-width:64px">
        ${showEquipBtn
          ? `<button onclick="equipArtifact(player,'${art.uid}');renderArtifactPanel('${containerId}')" style="padding:4px 8px;font-size:11px;background:rgba(74,222,128,0.15);border:1px solid #4ade80;color:#4ade80;border-radius:6px;cursor:pointer">🌟 Trang Bị</button>`
          : `<button onclick="unequipArtifact(player,'${art.uid}');renderArtifactPanel('${containerId}')" style="padding:4px 8px;font-size:11px;background:rgba(248,113,113,0.12);border:1px solid #f87171;color:#f87171;border-radius:6px;cursor:pointer">↩ Tháo Ra</button>`
        }
        <button onclick="if(confirm('Vứt bỏ ${art.name}?')){dropArtifact(player,'${art.uid}');renderArtifactPanel('${containerId}')}" style="padding:4px 8px;font-size:11px;background:rgba(100,100,100,0.15);border:1px solid #555;color:#888;border-radius:6px;cursor:pointer">🗑 Bỏ</button>
      </div>
    </div>
  `;

  el.innerHTML = `
    <!-- INVENTORY SECTION -->
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--white-dim);margin-bottom:8px;letter-spacing:0.5px">
        🎁 TÚI BẢO VẬT (${unequipped.length} bảo vật)
      </div>
      ${unequipped.length
        ? unequipped.map(a => artifactCard(a, true)).join("")
        : `<div style="color:var(--white-dim);font-size:12px;text-align:center;padding:12px">Chưa có bảo vật trong túi.</div>`
      }
    </div>

    <!-- EQUIPPED SECTION -->
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--white-dim);margin-bottom:8px;letter-spacing:0.5px">
        ⚔️ ĐANG TRANG BỊ (${equipped.length} bảo vật)
      </div>
      ${equipped.length
        ? equipped.map(a => artifactCard(a, false)).join("")
        : `<div style="color:var(--white-dim);font-size:12px;text-align:center;padding:12px">Chưa trang bị bảo vật nào.</div>`
      }
    </div>
  `;
}

/**
 * renderArtifactCollection()
 * Hiện toàn bộ collection gồm cả NPC sở hữu để so sánh
 */
function renderArtifactCollection(containerId = "artifact-collection-content") {
  const el = document.getElementById(containerId);
  if (!el) return;

  const rarityOrder = ["mythic", "legendary", "epic", "rare", "common"];
  const all = [];

  // Thu thập artifact của player
  if (typeof player !== "undefined" && player && player.artifacts) {
    player.artifacts.forEach(a => all.push({ ...a, ownerName: player.name, isPlayer: true }));
  }
  // Thu thập artifact của NPCs (top 20 NPC giàu nhất)
  if (typeof npcs !== "undefined") {
    const topNpcs = npcs.filter(n => n.status === "alive" && n.artifacts?.length).slice(0, 20);
    topNpcs.forEach(npc => {
      (npc.artifacts || []).forEach(a => all.push({ ...a, ownerName: npc.name, isPlayer: false }));
    });
  }

  if (!all.length) {
    el.innerHTML = `<div style="color:var(--white-dim);text-align:center;padding:24px">Chưa có bảo vật nào trong thiên địa.</div>`;
    return;
  }

  // Group by rarity
  const grouped = {};
  rarityOrder.forEach(r => {
    grouped[r] = all.filter(a => a.rarity === r);
  });

  let html = "";
  rarityOrder.forEach(r => {
    if (!grouped[r].length) return;
    const cfg = ARTIFACT_RARITY_CONFIG[r] || {};
    html += `
      <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:${cfg.color};margin-bottom:8px;letter-spacing:0.5px;text-shadow:0 0 8px ${cfg.glow}">
          ${cfg.stars} ${cfg.label?.toUpperCase()} (${grouped[r].length})
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${grouped[r].map(a => `
            <div style="
              padding:6px 10px;border-radius:8px;
              background:rgba(15,23,42,0.7);
              border:1px solid ${cfg.color};
              box-shadow:0 0 8px ${cfg.glow};
              font-size:12px;
            ">
              ${a.icon} <span style="color:${cfg.color};font-weight:600">${a.name}</span>
              <span style="color:var(--white-dim);margin-left:4px">— ${a.ownerName}${a.isPlayer ? ' 👤' : ''}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  });
  el.innerHTML = html;
}

// ============================================================
// OPEN ARTIFACT UI MODAL
// ============================================================

function openArtifactModal() {
  const existingModal = document.getElementById("artifact-modal-overlay");
  if (existingModal) existingModal.remove();

  const overlay = document.createElement("div");
  overlay.id = "artifact-modal-overlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
    display:flex;align-items:flex-start;justify-content:center;
    padding:24px 12px;overflow-y:auto;
  `;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#0a0f1e 0%,#0d1b2e 100%);
      border:1px solid rgba(250,204,21,0.25);border-radius:16px;
      width:100%;max-width:720px;
      box-shadow:0 0 40px rgba(250,204,21,0.12);
      font-family:inherit;
    ">
      <!-- Header -->
      <div style="
        padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.08);
        display:flex;align-items:center;justify-content:space-between;
      ">
        <div>
          <div style="font-size:1.15em;font-weight:700;color:#facc15">✨ Bảo Vật & Trang Bị</div>
          <div style="font-size:11px;color:var(--white-dim);margin-top:2px">${player?.name || "—"}</div>
        </div>
        <button onclick="document.getElementById('artifact-modal-overlay').remove()"
          style="background:none;border:none;color:#94a3b8;font-size:1.4em;cursor:pointer;padding:4px">✕</button>
      </div>

      <!-- Tabs -->
      <div id="art-tabs" style="display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.08)">
        ${[
          ["inventory",   "🎁 Túi Bảo Vật"],
          ["equipment",   "⚔️ Trang Bị"],
          ["collection",  "✨ Bộ Sưu Tập"],
        ].map(([tab, label], i) => `
          <button onclick="switchArtTab('${tab}')" id="arttab-${tab}" style="
            flex:1;padding:10px 6px;font-size:12px;font-weight:600;
            background:${i===0?'rgba(250,204,21,0.12)':'none'};
            border:none;border-bottom:2px solid ${i===0?'#facc15':'transparent'};
            color:${i===0?'#facc15':'#94a3b8'};cursor:pointer;transition:all 0.2s;
          ">${label}</button>
        `).join("")}
      </div>

      <!-- Content -->
      <div style="padding:16px;max-height:65vh;overflow-y:auto">
        <!-- Inventory tab -->
        <div id="arttab-content-inventory">
          <div id="artifact-panel-content"></div>
        </div>
        <!-- Equipment tab -->
        <div id="arttab-content-equipment" style="display:none">
          <div id="artifact-equip-content"></div>
        </div>
        <!-- Collection tab -->
        <div id="arttab-content-collection" style="display:none">
          <div id="artifact-collection-content"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  renderArtifactPanel("artifact-panel-content");
  renderEquipmentTab("artifact-equip-content");
}

function switchArtTab(tab) {
  ["inventory", "equipment", "collection"].forEach(t => {
    const content = document.getElementById(`arttab-content-${t}`);
    const btn = document.getElementById(`arttab-${t}`);
    if (!content || !btn) return;
    const active = t === tab;
    content.style.display = active ? "block" : "none";
    btn.style.background    = active ? "rgba(250,204,21,0.12)" : "none";
    btn.style.borderBottom  = active ? "2px solid #facc15" : "2px solid transparent";
    btn.style.color         = active ? "#facc15" : "#94a3b8";
  });
  if (tab === "inventory")  renderArtifactPanel("artifact-panel-content");
  if (tab === "equipment")  renderEquipmentTab("artifact-equip-content");
  if (tab === "collection") renderArtifactCollection("artifact-collection-content");
}

function renderEquipmentTab(containerId = "artifact-equip-content") {
  const el = document.getElementById(containerId);
  if (!el || !player) return;

  const arts = (player.artifacts || []).filter(a => a.equipped);
  const slots = [
    { key: "weapon",   icon: "⚔️",  label: "Vũ Khí"  },
    { key: "armor",    icon: "🛡️",  label: "Giáp"    },
    { key: "artifact", icon: "💎",  label: "Linh Bảo" },
  ];

  el.innerHTML = `
    <div style="margin-bottom:14px">
      <div style="font-size:12px;color:var(--white-dim);margin-bottom:10px">Tổng thêm từ bảo vật đang trang bị:</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        ${["attack","defense","hp","spiritBonus"].map(stat => {
          const total = arts.reduce((s,a) => s + (a[stat]||0), 0);
          const icons = {attack:"⚔️",defense:"🛡️",hp:"❤️",spiritBonus:"✨"};
          const colors = {attack:"#f87171",defense:"#60a5fa",hp:"#4ade80",spiritBonus:"#c084fc"};
          return total ? `<span style="color:${colors[stat]};font-size:13px;font-weight:700">${icons[stat]}+${total}</span>` : '';
        }).join("")}
      </div>
    </div>

    ${slots.map(s => {
      const equipped = arts.find(a => a.slot === s.key);
      if (equipped) {
        const cfg = ARTIFACT_RARITY_CONFIG[equipped.rarity] || {};
        return `
          <div style="
            border:1px solid ${cfg.color};border-radius:10px;padding:12px;margin-bottom:10px;
            background:rgba(15,23,42,0.7);box-shadow:0 0 12px ${cfg.glow};
          ">
            <div style="font-size:11px;color:var(--white-dim);margin-bottom:4px">${s.icon} ${s.label}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:1.6em">${equipped.icon}</span>
              <div style="flex:1">
                <div style="font-weight:700;color:${cfg.color}">${equipped.name}</div>
                <div style="font-size:11px;color:#94a3b8">${cfg.label}</div>
              </div>
              <button onclick="unequipArtifact(player,'${equipped.uid}');renderEquipmentTab('${containerId}')" style="
                padding:4px 10px;font-size:11px;background:rgba(248,113,113,0.12);
                border:1px solid #f87171;color:#f87171;border-radius:6px;cursor:pointer
              ">↩ Tháo</button>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="
            border:1px dashed #334155;border-radius:10px;padding:12px;margin-bottom:10px;
            background:rgba(15,23,42,0.4);
          ">
            <div style="color:var(--white-dim);font-size:12px">${s.icon} ${s.label} — Trống</div>
          </div>
        `;
      }
    }).join("")}
  `;
}

// ============================================================
// INJECT ARTIFACT BUTTON INTO PLAYER PANEL
// ============================================================

/**
 * injectArtifactButtonToPlayerPanel()
 * Được gọi sau khi renderPlayerPanel để thêm nút Bảo Vật
 */
function injectArtifactButtonToPlayerPanel() {
  const actionsGrid = document.querySelector(".player-actions-grid");
  if (!actionsGrid) return;
  if (actionsGrid.querySelector(".artifact-action-btn")) return; // đã có rồi

  const btn = document.createElement("button");
  btn.className = "player-action-btn artifact-action-btn";
  btn.style.cssText = "background:linear-gradient(135deg,rgba(250,204,21,0.15),rgba(249,115,22,0.1));border:1px solid rgba(250,204,21,0.3);";
  btn.innerHTML = `✨<span>Bảo Vật</span>`;
  btn.onclick = openArtifactModal;
  actionsGrid.appendChild(btn);

  // Thêm badge số lượng artifact
  const artifactCount = (player?.artifacts || []).length;
  if (artifactCount > 0) {
    const badge = document.createElement("span");
    badge.style.cssText = `
      position:absolute;top:-4px;right:-4px;
      background:#facc15;color:#000;
      border-radius:50%;width:16px;height:16px;
      font-size:10px;font-weight:700;
      display:flex;align-items:center;justify-content:center;
    `;
    badge.textContent = artifactCount > 99 ? "99+" : artifactCount;
    btn.style.position = "relative";
    btn.appendChild(badge);
  }
}

// ============================================================
// PATCH renderPlayerPanel to inject artifact button
// ============================================================

(function patchRenderPlayerPanel() {
  if (typeof renderPlayerPanel !== "function") return;
  const _orig = renderPlayerPanel;
  window.renderPlayerPanel = function() {
    _orig.apply(this, arguments);
    setTimeout(injectArtifactButtonToPlayerPanel, 50);
  };
})();

// ============================================================
// PATCH completeQuest to add artifact reward hook
// ============================================================

(function patchCompleteQuest() {
  if (typeof completeQuest !== "function") return;
  const _orig = completeQuest;
  window.completeQuest = function(quest, outcome) {
    _orig.apply(this, arguments);
    _artifactQuestHook(quest, outcome);
  };
})();

// ============================================================
// INIT — Ensure all entities have artifacts array
// ============================================================

function initArtifactSystem() {
  // Khởi tạo artifacts cho player
  if (typeof player !== "undefined" && player && !player.artifacts) {
    player.artifacts = [];
  }
  // Khởi tạo artifacts cho tất cả NPC
  if (typeof npcs !== "undefined") {
    npcs.forEach(npc => {
      if (!npc.artifacts) npc.artifacts = [];
    });
  }

  console.log("[ArtifactSystem] ✅ Khởi tạo hoàn tất.");
}

// Auto-init sau khi DOM sẵn sàng
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(initArtifactSystem, 800);
  });
}

console.log("[ArtifactSystem] 🔮 Loaded — Artifact & Equipment System v7");
