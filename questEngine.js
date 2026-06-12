/* ============================================================
   QUEST ENGINE V1 — Creator God V6 — PHASE NEXT
   HỆ THỐNG NHIỆM VỤ THIÊN THỜI (EMERGENT QUEST ENGINE)
   ------------------------------------------------------------
   - KHÔNG xóa save / world / NPC / sect / country / dynasty /
     hero / artifact / world history.
   - Hoàn toàn ADDITIVE: chỉ thêm dữ liệu mới (emergentQuests),
     không đụng tới npcQuests / playerQuests của questSystem.js.
   - Quest sinh ra TỰ ĐỘNG từ các sự kiện thế giới
     (war, boss, artifact, disaster, religion, dynasty...),
     KHÔNG do người chơi giao nhiệm vụ.
   ============================================================ */

(function () {

// ============================================================
// 1. GLOBAL STATE
// ============================================================

window.emergentQuests = window.emergentQuests || {
  active:    [],   // đang diễn ra
  completed: [],   // hoàn thành
  failed:    [],   // thất bại
  epic:      [],   // nhiệm vụ cấp thế giới (mọi trạng thái, để hiển thị riêng)
};

window._eqIdCounter = window._eqIdCounter || 1;

function nextEQId() {
  return "eq_" + (window._eqIdCounter++) + "_" + Date.now().toString(36);
}

function curYear() { return (typeof year !== "undefined") ? year : 0; }

// ============================================================
// 2. QUEST TYPE DEFINITIONS  (per PHASE NEXT spec)
// ============================================================

const EQ_TYPES = {
  exploration: {
    id: "exploration", name: "Thám Hiểm", icon: "🗺️", color: "#60a5fa",
    title: (q) => `Thám hiểm ${q.location || "vùng đất bí ẩn"}`,
  },
  artifact_hunt: {
    id: "artifact_hunt", name: "Săn Bảo Vật", icon: "⚔️", color: "#facc15",
    title: (q) => `Tìm kiếm [${q.artifactName || "Bảo Vật Cổ"}]`,
  },
  boss_hunt: {
    id: "boss_hunt", name: "Diệt Hung Thú", icon: "🐉", color: "#f87171",
    title: (q) => `Tiêu diệt ${q.bossName || "Hung Thú"}`,
  },
  revenge: {
    id: "revenge", name: "Báo Thù", icon: "🗡️", color: "#c084fc",
    title: (q) => `Báo thù cho ${q.victimName || "người thân"} — diệt ${q.enemyName || "kẻ thù"}`,
  },
  rescue: {
    id: "rescue", name: "Cứu Viện", icon: "🆘", color: "#4ade80",
    title: (q) => `Cứu ${q.targetName || "người mất tích"} tại ${q.location || "vùng nguy hiểm"}`,
  },
  escort: {
    id: "escort", name: "Hộ Tống", icon: "🛡️", color: "#38bdf8",
    title: (q) => `Hộ tống ${q.targetName || "đoàn người"} đến ${q.location || "đích đến"}`,
  },
  war_campaign: {
    id: "war_campaign", name: "Chiến Dịch", icon: "⚔️", color: "#ef4444",
    title: (q) => `${q.sideName || "Quân đội"}: ${q.objective || "phòng thủ biên giới"}`,
  },
  sect_mission: {
    id: "sect_mission", name: "Tông Môn Vụ", icon: "🏯", color: "#fb923c",
    title: (q) => `${q.sectName || "Tông môn"} cần ${q.objective || "thu thập tài nguyên"}`,
  },
  dynasty_mission: {
    id: "dynasty_mission", name: "Vương Triều Vụ", icon: "👑", color: "#eab308",
    title: (q) => `${q.dynastyName || "Vương triều"}: ${q.objective || "dẹp loạn"}`,
  },
  religious_mission: {
    id: "religious_mission", name: "Thánh Vụ", icon: "🙏", color: "#a78bfa",
    title: (q) => `${q.religionName || "Giáo hội"}: ${q.objective || "bảo vệ thánh vật"}`,
  },
};

const EPIC_TYPES = [
  { id: "unify_world",   name: "Thống Nhất Thiên Hạ", icon: "🌍", desc: "Chinh phục và thống nhất toàn bộ các quốc gia." },
  { id: "demon_emperor", name: "Diệt Ma Đế",          icon: "👹", desc: "Đánh bại Ma Đế đang đe dọa nhân gian." },
  { id: "apocalypse",    name: "Ngăn Chặn Tận Thế",   icon: "☄️", desc: "Ngăn chặn thảm họa hủy diệt thế giới." },
  { id: "chaos_gate",    name: "Phong Ấn Hỗn Loạn Môn", icon: "🌀", desc: "Phong ấn cánh cổng dẫn đến Hỗn Loạn Giới." },
];

// ============================================================
// 3. CORE: CREATE / ASSIGN QUEST
// ============================================================

/**
 * Tạo một emergent quest mới.
 * @param {string} typeId   - key trong EQ_TYPES
 * @param {object} data     - dữ liệu bổ sung (artifactName, bossName, location, npc, ...)
 * @param {object} opts     - { chainOf, isEpic, sourceEvent }
 */
function spawnEmergentQuest(typeId, data, opts) {
  data = data || {};
  opts = opts || {};
  const type = EQ_TYPES[typeId];
  if (!type) return null;

  const quest = {
    id:          nextEQId(),
    typeId:      typeId,
    status:      "active",
    startYear:   curYear(),
    completedYear: null,
    progress:    0,
    target:      data.target || 100,
    chainOf:     opts.chainOf || null,   // id của quest trước trong chuỗi
    nextChain:   null,                   // id của quest kế tiếp (gán sau khi sinh)
    isEpic:      !!opts.isEpic,
    sourceEvent: opts.sourceEvent || null,
    holders:     [],                     // npcIds đang theo đuổi quest này
    ...data,
  };
  quest.title = type.title(quest);

  emergentQuests.active.push(quest);
  if (quest.isEpic) emergentQuests.epic.push(quest);

  // Liên kết chuỗi nhiệm vụ
  if (opts.chainOf) {
    const prev = findEQById(opts.chainOf);
    if (prev) prev.nextChain = quest.id;
  }

  // Gán NPC theo đuổi (nếu có ứng viên)
  assignHoldersToQuest(quest);

  // Ghi log
  logEmergentQuest(quest, "📜 sinh ra", `Năm ${quest.startYear}: ${quest.title} đã xuất hiện.`);

  // Tích hợp Timeline
  if (typeof addTimeline === "function") {
    addTimeline(`📜 Nhiệm vụ mới: ${quest.title}`, "normal", type.icon);
  }

  refreshQuestBoard();
  return quest;
}

function findEQById(id) {
  return emergentQuests.active.find(q => q.id === id)
      || emergentQuests.completed.find(q => q.id === id)
      || emergentQuests.failed.find(q => q.id === id)
      || emergentQuests.epic.find(q => q.id === id);
}

/**
 * Tìm NPC còn sống phù hợp để theo đuổi quest (dựa trên longTermGoals
 * hoặc realm cao, hoặc liên quan trực tiếp tới sự kiện).
 */
function assignHoldersToQuest(quest) {
  if (typeof npcs === "undefined" || !npcs.length) return;

  let pool = npcs.filter(n => n.status === "alive" && !n.isPlayer);

  // Nếu quest có npc liên quan trực tiếp (vd revenge -> con của người chết)
  if (quest.relatedNpcId) {
    const rel = npcById(quest.relatedNpcId);
    if (rel && rel.status === "alive") {
      attachHolder(quest, rel);
    }
  }

  // Ưu tiên NPC có longTermGoal khớp loại quest
  const goalMatch = pool.filter(n => (n.longTermGoals || []).some(g => g.questType === quest.typeId && !g.fulfilled));
  const candidates = goalMatch.length ? goalMatch : pool;

  if (!candidates.length) return;

  const count = quest.isEpic ? Math.min(3, candidates.length) : 1;
  const sorted = [...candidates].sort((a, b) => (b.realm || 0) - (a.realm || 0));
  for (let i = 0; i < count; i++) {
    const cand = sorted[i] || candidates[Math.floor(Math.random() * candidates.length)];
    if (cand) attachHolder(quest, cand);
  }
}

function attachHolder(quest, npc) {
  if (quest.holders.includes(npc.id)) return;
  quest.holders.push(npc.id);
  ensureNpcQuestStory(npc);
  npc._questStory.active.push(quest.id);

  // Gắn longTermGoal nếu chưa có
  npc.longTermGoals = npc.longTermGoals || [];
  if (!npc.longTermGoals.some(g => g.questId === quest.id)) {
    npc.longTermGoals.push({
      questId:   quest.id,
      questType: quest.typeId,
      title:     quest.title,
      fulfilled: false,
    });
  }
}

function ensureNpcQuestStory(npc) {
  if (!npc._questStory) {
    npc._questStory = { active: [], completed: [], failed: [] };
  }
}

function logEmergentQuest(quest, tag, msg) {
  quest.log = quest.log || [];
  quest.log.unshift({ year: curYear(), tag, msg });
  if (quest.log.length > 20) quest.log.pop();
}

// ============================================================
// 4. WORLD EVENT → QUEST GENERATION (hook addWorldHistory)
// ============================================================

const NPC_NAME_POOL_FALLBACK = ["Vô Danh Hiệp Khách", "Lãng Khách", "Tu Sĩ Lưu Lạc"];

function pickRandomLivingNpc(excludeIds) {
  if (typeof npcs === "undefined" || !npcs.length) return null;
  const pool = npcs.filter(n => n.status === "alive" && !n.isPlayer && !(excludeIds || []).includes(n.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomRegion() {
  if (typeof regions !== "undefined" && regions.length) {
    return regions[Math.floor(Math.random() * regions.length)].name || "vùng đất xa xôi";
  }
  return "vùng đất xa xôi";
}

/**
 * Phân tích worldHistory event và sinh quest tương ứng.
 * Được gọi mỗi khi addWorldHistory() chạy.
 */
function reactToWorldEvent(eventType, description, extra) {
  extra = extra || {};

  switch (eventType) {

    // ---------- ARTIFACT DISCOVERY ----------
    case "artifact": {
      if (!chance(0.5)) return;
      const artName = extra.artifactName || extra.itemName || "Cổ Vật Thất Truyền";
      spawnEmergentQuest("artifact_hunt", {
        artifactName: artName,
        location: extra.location || pickRandomRegion(),
        target: 1,
        rewardHint: "Bảo Vật + Danh Vọng",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- BOSS APPEARANCE ----------
    case "boss": {
      const bossName = extra.boss || extra.dungeon || "Hung Thú Cổ Đại";
      const q = spawnEmergentQuest("boss_hunt", {
        bossName: bossName,
        location: extra.location || pickRandomRegion(),
        target: 1,
        rewardHint: "Cường Hóa + Bảo Vật Hiếm",
        failConsequence: "city_destroyed",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- DEATH → REVENGE QUEST ----------
    case "death": {
      if (!chance(0.25)) return;
      // Tìm con của người đã chết để báo thù
      const victimName = extra.npcName;
      let child = null;
      if (typeof npcs !== "undefined" && victimName) {
        child = npcs.find(n => n.status === "alive" && (n.parentName === victimName ||
                  (n.parentIds && typeof npcById === "function" &&
                   n.parentIds.some(pid => { const p = npcById(pid); return p && p.name === victimName; }))));
      }
      const enemyName = extra.reason && /([\p{L}\s]+) (giết|sát hại|tiêu diệt)/u.test(extra.reason)
        ? extra.reason.match(/([\p{L}\s]+) (giết|sát hại|tiêu diệt)/u)[1].trim()
        : (extra.winner || "kẻ thù bí ẩn");

      const q = spawnEmergentQuest("revenge", {
        victimName: victimName || "người đã khuất",
        enemyName:  enemyName,
        target: 1,
        relatedNpcId: child ? child.id : null,
        rewardHint: "Sức Mạnh + Truyền Thừa Gia Tộc",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- WAR → CAMPAIGN QUEST ----------
    case "war": {
      if (!chance(0.35)) return;
      const side = extra.attacker || extra.defender || extra.winner || "Quân Đội";
      spawnEmergentQuest("war_campaign", {
        sideName: side,
        objective: chance(0.5) ? "phòng thủ biên giới" : "chiếm lĩnh lãnh thổ địch",
        location: pickRandomRegion(),
        target: 100,
        rewardHint: "Quân Công + Lãnh Thổ",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- INVASION / TRAGEDY → ESCORT or RESCUE ----------
    case "tragedy": {
      if (!chance(0.4)) return;
      const isRescue = chance(0.5);
      if (isRescue) {
        const target = pickRandomLivingNpc();
        spawnEmergentQuest("rescue", {
          targetName: target ? target.name : rand(NPC_NAME_POOL_FALLBACK),
          location: pickRandomRegion(),
          relatedNpcId: target ? target.id : null,
          target: 1,
          rewardHint: "Danh Vọng + Lòng Trung Thành",
        }, { sourceEvent: eventType });
      } else {
        spawnEmergentQuest("escort", {
          targetName: "Đoàn Dân Tị Nạn",
          location: pickRandomRegion(),
          target: 1,
          rewardHint: "Danh Vọng + Vật Tư",
        }, { sourceEvent: eventType });
      }
      break;
    }

    // ---------- ECONOMY / SECT NEEDS ----------
    case "sect": {
      if (!chance(0.4)) return;
      spawnEmergentQuest("sect_mission", {
        sectName: extra.sectName || "Tông Môn",
        objective: rand(["thu thập 100 Linh Thảo", "tuần tra lãnh địa", "xây dựng trận pháp phòng ngự"]),
        target: 100,
        rewardHint: "Cống Hiến Tông Môn",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- DYNASTY EVENTS ----------
    case "civilization": {
      if (!chance(0.3)) return;
      const dynName = extra.dynastySurname ? `Gia Tộc ${extra.dynastySurname}` : "Vương Triều";
      const isRebellion = /Tranh Ngôi|NỘI CHIẾN|nội chiến|rebellion/i.test(description);
      spawnEmergentQuest("dynasty_mission", {
        dynastyName: dynName,
        objective: isRebellion ? "dẹp loạn nội bộ" : "ổn định triều chính",
        target: 1,
        rewardHint: "Quan Tước + Bổng Lộc",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- RELIGION EVENTS ----------
    case "religion": {
      if (!chance(0.4)) return;
      spawnEmergentQuest("religious_mission", {
        religionName: extra.religionId ? `Giáo Hội #${extra.religionId}` : "Giáo Hội",
        objective: rand(["bảo vệ Thánh Vật", "trừ tà ác đang quấy nhiễu tín đồ", "hộ tống Thánh Tích về Tổng Đàn"]),
        target: 1,
        rewardHint: "Thánh Lực + Tín Ngưỡng",
      }, { sourceEvent: eventType });
      break;
    }

    // ---------- HEAVENLY DISASTER ----------
    case "heavenly": {
      if (!chance(0.3)) return;
      spawnEmergentQuest("exploration", {
        location: pickRandomRegion(),
        title2: "khảo sát dị biến thiên địa",
        target: 1,
        rewardHint: "Cơ Duyên Thiên Địa",
      }, { sourceEvent: eventType });

      // Cơ hội kích hoạt EPIC QUEST từ thảm họa lớn
      maybeTriggerEpicQuest(eventType, description);
      break;
    }

    default:
      break;
  }

  // Mọi sự kiện era / worldlord lớn đều có cơ hội nhỏ sinh EPIC quest
  if (eventType === "era" || eventType === "empire" || eventType === "worldlord") {
    maybeTriggerEpicQuest(eventType, description);
  }
}

// ============================================================
// 5. EPIC QUESTS (world-scale, rare)
// ============================================================

function maybeTriggerEpicQuest(eventType, description) {
  // Không sinh epic nếu đang có epic active cùng loại
  const activeEpicIds = emergentQuests.active.filter(q => q.isEpic).map(q => q.epicId);
  const available = EPIC_TYPES.filter(e => !activeEpicIds.includes(e.id));
  if (!available.length) return;
  if (!chance(0.06)) return;

  const epic = rand(available);
  spawnEmergentQuest("exploration", {
    title2: epic.name,
    epicId: epic.id,
    epicIcon: epic.icon,
    epicDesc: epic.desc,
    location: pickRandomRegion(),
    target: 100,
    rewardHint: "Danh Hiệu Vĩ Đại + Thiên Mệnh",
  }, { isEpic: true, sourceEvent: eventType });

  if (typeof addLog !== "undefined") {
    addLog(`🌟 NHIỆM VỤ SỬ THI: ${epic.icon} ${epic.name} đã xuất hiện!`, "important");
  }
}

// ============================================================
// 6. QUEST CHAIN: Find Map → Find Tomb → Open Tomb → Artifact → War
// ============================================================

const ARTIFACT_CHAIN_STEPS = [
  { typeId: "exploration",   build: (prev) => ({ title2: "tìm Cổ Bản Đồ dẫn tới mộ cổ", location: prev.location, target: 1 }) },
  { typeId: "exploration",   build: (prev) => ({ title2: "tìm ra Cổ Mộ ẩn giấu",         location: prev.location, target: 1 }) },
  { typeId: "artifact_hunt", build: (prev) => ({ title2: "mở Cổ Mộ và đoạt được bảo vật", artifactName: prev.artifactName, location: prev.location, target: 1 }) },
];

/**
 * Khởi tạo một chuỗi quest "Find Map → ... → Artifact War"
 * Gọi khi artifact_hunt quest hoàn thành thành công với xác suất nhỏ.
 */
function maybeSpawnArtifactChain(parentQuest) {
  if (!chance(0.15)) return;
  const step = spawnEmergentQuest("exploration", {
    title2: "tìm Cổ Bản Đồ dẫn tới mộ cổ thất lạc",
    artifactName: parentQuest.artifactName,
    location: parentQuest.location,
    target: 1,
    chainStage: 1,
    chainTotal: 4,
  }, { chainOf: parentQuest.id });
}

function advanceChain(prevQuest) {
  const stage = (prevQuest.chainStage || 0);
  if (stage === 0) return; // không thuộc chain đã định nghĩa
  if (stage === 1) {
    spawnEmergentQuest("exploration", {
      title2: "khai quật Cổ Mộ vừa tìm thấy",
      artifactName: prevQuest.artifactName,
      location: prevQuest.location,
      target: 1, chainStage: 2, chainTotal: 4,
    }, { chainOf: prevQuest.id });
  } else if (stage === 2) {
    spawnEmergentQuest("artifact_hunt", {
      artifactName: prevQuest.artifactName || "Bảo Vật Trong Mộ",
      location: prevQuest.location,
      target: 1, chainStage: 3, chainTotal: 4,
    }, { chainOf: prevQuest.id });
  } else if (stage === 3) {
    // Artifact War — sinh war_campaign
    spawnEmergentQuest("war_campaign", {
      sideName: "Các Thế Lực Tranh Đoạt",
      objective: `tranh đoạt [${prevQuest.artifactName || "Bảo Vật"}] vừa khai quật`,
      location: prevQuest.location,
      target: 100, chainStage: 4, chainTotal: 4,
    }, { chainOf: prevQuest.id });
    if (typeof addWorldHistory === "function") {
      addWorldHistory("war", `Chiến tranh tranh đoạt [${prevQuest.artifactName || "Bảo Vật Cổ"}] bùng nổ sau khi cổ mộ bị khai quật!`, {});
    }
  }
}

// ============================================================
// 7. TICK — TIẾN TRÌNH / HOÀN THÀNH / THẤT BẠI
// ============================================================

function emergentQuestTick() {
  if (typeof npcs === "undefined") return;

  const toResolve = [];

  emergentQuests.active.forEach(quest => {
    // Loại bỏ holder đã chết
    quest.holders = quest.holders.filter(id => {
      const n = npcById(id);
      return n && n.status === "alive";
    });

    // Nếu không còn ai theo đuổi, cơ hội nhỏ tìm người mới
    if (!quest.holders.length && chance(0.1)) {
      assignHoldersToQuest(quest);
    }

    // Tính tốc độ tiến triển dựa trên realm trung bình của holders
    let speed = 1;
    if (quest.holders.length) {
      const totalRealm = quest.holders.reduce((s, id) => {
        const n = npcById(id);
        return s + (n ? (n.realm || 0) : 0);
      }, 0);
      speed = 1 + (totalRealm / quest.holders.length) * 0.4;
    }
    if (quest.isEpic) speed *= 0.3; // epic luôn chậm, cần nhiều năm

    quest.progress += speed * (1 + Math.random());

    if (quest.progress >= quest.target) {
      toResolve.push({ quest, outcome: "success" });
    } else if (curYear() - quest.startYear > (quest.isEpic ? 60 : 15) && chance(0.04)) {
      toResolve.push({ quest, outcome: "fail" });
    }
  });

  toResolve.forEach(({ quest, outcome }) => resolveEmergentQuest(quest, outcome));

  if (toResolve.length) refreshQuestBoard();
}

function resolveEmergentQuest(quest, outcome) {
  const type = EQ_TYPES[quest.typeId] || {};
  quest.status = outcome;
  quest.completedYear = curYear();
  emergentQuests.active = emergentQuests.active.filter(q => q.id !== quest.id);

  quest.holders.forEach(id => {
    const npc = npcById(id);
    if (!npc) return;
    ensureNpcQuestStory(npc);
    npc._questStory.active = npc._questStory.active.filter(qid => qid !== quest.id);

    const goal = (npc.longTermGoals || []).find(g => g.questId === quest.id);
    if (goal) goal.fulfilled = true;

    if (outcome === "success") {
      npc._questStory.completed.push(quest.id);
      npc.wealth     = (npc.wealth || 0) + 200 * (npc.realm + 1);
      npc.reputation = (npc.reputation || 0) + 50 * (npc.realm + 1);
      if (npc.biography) {
        npc.biography.push({ year: curYear(), event: `Hoàn thành nhiệm vụ Thiên Thời [${quest.title}].` });
      }
      // Cơ hội nhận bảo vật cho artifact_hunt / boss_hunt
      if ((quest.typeId === "artifact_hunt" || quest.typeId === "boss_hunt") && typeof rollArtifact === "function" && typeof grantArtifact === "function") {
        const rar = quest.isEpic ? "legendary" : (chance(0.4) ? "epic" : "rare");
        const art = rollArtifact(rar);
        if (art) grantArtifact(npc, art, `hoàn thành nhiệm vụ [${quest.title}]`);
      }
    } else {
      npc._questStory.failed.push(quest.id);
      if (npc.biography) {
        npc.biography.push({ year: curYear(), event: `Thất bại nhiệm vụ Thiên Thời [${quest.title}].` });
      }
    }
  });

  if (outcome === "success") {
    emergentQuests.completed.unshift(quest);
    if (emergentQuests.completed.length > 200) emergentQuests.completed.pop();

    logEmergentQuest(quest, "✅ hoàn thành", `Năm ${quest.completedYear}: ${quest.title} đã hoàn thành.`);
    if (typeof addLog !== "undefined") addLog(`✅ Nhiệm vụ hoàn thành: ${quest.title}`, "important");
    if (typeof addWorldHistory === "function") {
      addWorldHistory("quest", `Nhiệm vụ [${quest.title}] đã được hoàn thành.`, { questId: quest.id, questType: quest.typeId });
    }
    if (typeof addTimeline === "function") addTimeline(`✅ ${quest.title} — hoàn thành`, "important", type.icon || "📜");

    // Chuỗi nhiệm vụ
    if (quest.chainStage) {
      advanceChain(quest);
    } else if (quest.typeId === "artifact_hunt" && !quest.chainOf) {
      maybeSpawnArtifactChain(quest);
    }

  } else {
    emergentQuests.failed.unshift(quest);
    if (emergentQuests.failed.length > 200) emergentQuests.failed.pop();

    logEmergentQuest(quest, "❌ thất bại", `Năm ${quest.completedYear}: ${quest.title} đã thất bại.`);
    if (typeof addLog !== "undefined") addLog(`❌ Nhiệm vụ thất bại: ${quest.title}`, "normal");
    if (typeof addWorldHistory === "function") {
      addWorldHistory("quest", `Nhiệm vụ [${quest.title}] đã thất bại.`, { questId: quest.id, questType: quest.typeId, failed: true });
    }
    if (typeof addTimeline === "function") addTimeline(`❌ ${quest.title} — thất bại`, "normal", type.icon || "📜");

    // QUEST FAILURE → consequences
    if (quest.failConsequence === "city_destroyed" && typeof addWorldHistory === "function") {
      const region = quest.location || pickRandomRegion();
      addWorldHistory("tragedy", `${quest.bossName || "Hung Thú"} tàn phá ${region} sau khi không bị tiêu diệt. Dân chúng lâm vào cảnh tị nạn.`, { location: region });
      spawnEmergentQuest("rescue", {
        targetName: "Dân Tị Nạn",
        location: region,
        target: 1,
        rewardHint: "Danh Vọng",
      }, { sourceEvent: "tragedy" });
    }
  }

  // epic list giữ cả completed/failed để hiển thị lịch sử
  if (quest.isEpic) {
    const idx = emergentQuests.epic.findIndex(q => q.id === quest.id);
    if (idx >= 0) emergentQuests.epic[idx] = quest;
  }
}

// ============================================================
// 8. STATISTICS
// ============================================================

function computeQuestStatistics() {
  const all = [...emergentQuests.completed, ...emergentQuests.failed, ...emergentQuests.active];
  const stats = {
    total:     all.length,
    completed: emergentQuests.completed.length,
    failed:    emergentQuests.failed.length,
    active:    emergentQuests.active.length,
    epicCount: emergentQuests.epic.length,
    longest:   null,
    heroSuccess: {},
    heroFail:    {},
  };

  let longestDur = -1;
  all.forEach(q => {
    const end = q.completedYear || curYear();
    const dur = end - q.startYear;
    if (dur > longestDur) { longestDur = dur; stats.longest = q; }
  });

  emergentQuests.completed.forEach(q => {
    q.holders.forEach(id => {
      const n = npcById(id);
      const name = n ? n.name : ("NPC#" + id);
      stats.heroSuccess[name] = (stats.heroSuccess[name] || 0) + 1;
    });
  });
  emergentQuests.failed.forEach(q => {
    q.holders.forEach(id => {
      const n = npcById(id);
      const name = n ? n.name : ("NPC#" + id);
      stats.heroFail[name] = (stats.heroFail[name] || 0) + 1;
    });
  });

  const mostSuccessful = Object.entries(stats.heroSuccess).sort((a,b)=>b[1]-a[1])[0];
  const mostFailed     = Object.entries(stats.heroFail).sort((a,b)=>b[1]-a[1])[0];
  stats.mostSuccessfulHero = mostSuccessful ? { name: mostSuccessful[0], count: mostSuccessful[1] } : null;
  stats.mostFailedHero     = mostFailed     ? { name: mostFailed[0],     count: mostFailed[1] }     : null;

  // "most important quest" = epic nếu có, nếu không thì quest có nhiều holders nhất
  stats.mostImportant = emergentQuests.epic[0] || [...all].sort((a,b)=>b.holders.length - a.holders.length)[0] || null;

  return stats;
}

// ============================================================
// 9. UI — QUEST BOARD SIDEBAR (📜 QUESTS)
// ============================================================

var _eqFilter = "active";

function injectQuestEngineUI() {
  var nav = document.querySelector(".sidebar-nav");
  if (nav && !document.querySelector('[data-panel="emergent-quests"]')) {
    var btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.setAttribute("data-panel", "emergent-quests");
    btn.setAttribute("onclick", "showPanel('emergent-quests')");
    btn.innerHTML = '<span class="nav-icon">📜</span><span>Thiên Thời Vụ</span>';
    nav.appendChild(btn);
  }

  var panels = document.querySelector(".panels");
  if (panels && !document.getElementById("panel-emergent-quests")) {
    var div = document.createElement("div");
    div.id = "panel-emergent-quests";
    div.className = "panel";
    div.innerHTML = `
      <div class="dash-section" style="margin-bottom:14px">
        <div class="dash-title">📜 THỐNG KÊ THIÊN THỜI VỤ</div>
        <div id="eqStats" class="quest-stat-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
      </div>

      <div class="quest-filter-bar" id="eqFilterBar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <button class="qf-btn active" data-eqf="active"    onclick="filterEmergentQuests('active',this)">⚡ Đang Diễn Ra</button>
        <button class="qf-btn"        data-eqf="completed" onclick="filterEmergentQuests('completed',this)">✅ Hoàn Thành</button>
        <button class="qf-btn"        data-eqf="failed"    onclick="filterEmergentQuests('failed',this)">❌ Thất Bại</button>
        <button class="qf-btn"        data-eqf="epic"      onclick="filterEmergentQuests('epic',this)">🌟 Sử Thi</button>
      </div>

      <div id="eqList"></div>
    `;
    panels.appendChild(div);
  }
}

function filterEmergentQuests(f, btn) {
  _eqFilter = f;
  document.querySelectorAll("#eqFilterBar .qf-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderQuestBoard();
}

function refreshQuestBoard() {
  var panel = document.getElementById("panel-emergent-quests");
  if (panel && panel.classList.contains("active")) renderQuestBoard();
}

function renderQuestBoard() {
  injectQuestEngineUI();
  renderEQStats();
  renderEQList();
}

function renderEQStats() {
  var el = document.getElementById("eqStats");
  if (!el) return;
  var s = computeQuestStatistics();
  var boxes = [
    { icon: "📜", label: "Tổng Nhiệm Vụ",  val: s.total },
    { icon: "⚡", label: "Đang Diễn Ra",   val: s.active },
    { icon: "✅", label: "Hoàn Thành",     val: s.completed },
    { icon: "❌", label: "Thất Bại",       val: s.failed },
    { icon: "🌟", label: "Sử Thi",         val: s.epicCount },
    { icon: "⏳", label: "Lâu Nhất",       val: s.longest ? (s.longest.title) : "—" },
    { icon: "🏆", label: "Anh Hùng Xuất Sắc", val: s.mostSuccessfulHero ? `${s.mostSuccessfulHero.name} (${s.mostSuccessfulHero.count})` : "—" },
    { icon: "💀", label: "Anh Hùng Thất Bại Nhiều Nhất", val: s.mostFailedHero ? `${s.mostFailedHero.name} (${s.mostFailedHero.count})` : "—" },
  ];
  el.innerHTML = boxes.map(b => `
    <div class="quest-stat-box">
      <div style="font-size:18px;margin-bottom:4px">${b.icon}</div>
      <div class="qsb-val" style="font-size:12px;line-height:1.4">${b.val}</div>
      <div class="qsb-label">${b.label}</div>
    </div>`).join("");
}

function renderEQList() {
  var el = document.getElementById("eqList");
  if (!el) return;

  var list = _eqFilter === "epic" ? emergentQuests.epic : emergentQuests[_eqFilter] || [];
  if (!list.length) {
    el.innerHTML = `<div class="quest-empty">🌀 Chưa có nhiệm vụ Thiên Thời nào trong danh mục này.<br><small style="opacity:.6">Để thế giới vận hành, các sự kiện lớn sẽ tự sinh ra nhiệm vụ...</small></div>`;
    return;
  }

  el.innerHTML = list.slice(0, 60).map(q => renderEQCard(q)).join("");
}

function renderEQCard(q) {
  var type = EQ_TYPES[q.typeId] || { icon: "📜", color: "#facc15", name: "Nhiệm Vụ" };
  var pct = Math.min(100, Math.round((q.progress / Math.max(q.target,1)) * 100));
  var holdersHTML = (q.holders || []).map(id => {
    var n = npcById(id);
    if (!n) return "";
    return `<span onclick="openNPCModal(${n.id})" style="cursor:pointer;text-decoration:underline;color:var(--gold)">${n.name}</span>`;
  }).filter(Boolean).join(", ") || "<i style='opacity:.5'>chưa có người theo đuổi</i>";

  var statusBadge = q.status === "success" ? '<span class="quest-completed-stamp">✔ HOÀN THÀNH</span>'
                  : q.status === "fail"    ? '<span class="quest-completed-stamp" style="background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.3);color:#f87171">✘ THẤT BẠI</span>'
                  : "";

  var displayTitle = q.title2 ? (q.title2.charAt(0).toUpperCase() + q.title2.slice(1)) : q.title;
  if (q.isEpic) displayTitle = `${q.epicIcon || "🌟"} ${q.epicId ? (EPIC_TYPES.find(e=>e.id===q.epicId)?.name || displayTitle) : displayTitle}`;

  return `<div class="quest-card${q.status!=="active"?" completed":""}" style="${q.isEpic?"border-color:rgba(250,204,21,0.4);box-shadow:0 0 16px rgba(250,204,21,0.08)":""}">
    ${statusBadge}
    <div class="quest-card-header">
      <div class="quest-type-icon" style="background:${type.color}18;border-color:${type.color}44;color:${type.color}">${q.isEpic ? "🌟" : type.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="quest-title">${displayTitle}
          <span class="quest-cat-pill" style="background:${type.color}10;border-color:${type.color}33;color:${type.color};margin-left:6px">${q.isEpic ? "SỬ THI" : type.name}</span>
          ${q.chainStage ? `<span class="quest-cat-pill" style="background:rgba(96,165,250,0.08);border-color:rgba(96,165,250,0.3);color:#60a5fa;margin-left:4px">Chuỗi ${q.chainStage}/${q.chainTotal||"?"}</span>` : ""}
        </div>
        ${q.epicDesc ? `<div class="quest-desc">${q.epicDesc}</div>` : ""}
        ${q.location ? `<div class="quest-desc">📍 ${q.location}</div>` : ""}
        <div class="quest-npc-tag"><span>🧙</span><span>${holdersHTML}</span></div>
      </div>
    </div>
    <div class="quest-progress-row">
      <span class="quest-progress-label">Tiến Độ (từ Năm ${q.startYear}${q.completedYear?` đến Năm ${q.completedYear}`:""})</span>
      <span class="quest-progress-val">${pct}%</span>
    </div>
    <div class="quest-progress-bar">
      <div class="quest-progress-fill" style="width:${pct}%;background:${q.status!=='active'?(q.status==='success'?'var(--jade)':'#f87171'):type.color}"></div>
    </div>
    ${q.rewardHint ? `<div class="quest-rewards"><span class="qr-chip">🎁 ${q.rewardHint}</span></div>` : ""}
  </div>`;
}

window.filterEmergentQuests = filterEmergentQuests;

// ============================================================
// 10. NPC STORY PAGE INTEGRATION (openNPCModal)
// ============================================================

function patchOpenNPCModal() {
  var _orig = window.openNPCModal;
  if (typeof _orig !== "function" || _orig._eqPatched) return;

  window.openNPCModal = function (id) {
    _orig(id);
    var npc = npcById(id);
    if (!npc) return;
    ensureNpcQuestStory(npc);

    var historyTab = document.getElementById("tab-history");
    if (!historyTab) return;
    if (historyTab.querySelector("#eq-npc-story")) historyTab.querySelector("#eq-npc-story").remove();

    var goals     = npc.longTermGoals || [];
    var active    = npc._questStory.active.map(findEQById).filter(Boolean);
    var completed = npc._questStory.completed.map(findEQById).filter(Boolean);
    var failed    = npc._questStory.failed.map(findEQById).filter(Boolean);

    var box = document.createElement("div");
    box.id = "eq-npc-story";
    box.style.marginTop = "14px";
    box.innerHTML = `
      <div class="dash-section">
        <div class="dash-title">📜 THIÊN THỜI VỤ — ${npc.name}</div>

        <div style="margin-bottom:8px"><b>🎯 Mục Tiêu Dài Hạn:</b>
          ${goals.length ? goals.map(g => `<span class="quest-cat-pill" style="margin:2px;${g.fulfilled?'opacity:.5;text-decoration:line-through':''}">${g.title}</span>`).join("") : "<i style='opacity:.6'>Chưa xác định</i>"}
        </div>

        <div style="margin-bottom:8px"><b>⚡ Đang Theo Đuổi (${active.length}):</b><br>
          ${active.length ? active.map(q => `• ${q.title || q.title2}`).join("<br>") : "<i style='opacity:.6'>Không có</i>"}
        </div>

        <div style="margin-bottom:8px"><b>✅ Đã Hoàn Thành (${completed.length}):</b><br>
          ${completed.length ? completed.slice(0,10).map(q => `• ${q.title || q.title2} (Năm ${q.completedYear})`).join("<br>") : "<i style='opacity:.6'>Chưa có</i>"}
        </div>

        <div><b>❌ Thất Bại (${failed.length}):</b><br>
          ${failed.length ? failed.slice(0,10).map(q => `• ${q.title || q.title2} (Năm ${q.completedYear})`).join("<br>") : "<i style='opacity:.6'>Chưa có</i>"}
        </div>
      </div>
    `;
    historyTab.appendChild(box);
  };
  window.openNPCModal._eqPatched = true;
}

// ============================================================
// 11. PATCH addWorldHistory / simulateWorld / save / load / showPanel
// ============================================================

function patchAddWorldHistory() {
  var _orig = window.addWorldHistory;
  if (typeof _orig !== "function" || _orig._eqPatched) return;

  window.addWorldHistory = function (eventType, description, extra) {
    _orig(eventType, description, extra);
    try { reactToWorldEvent(eventType, description, extra || {}); }
    catch (e) { console.warn("QuestEngine reactToWorldEvent error:", e); }
  };
  window.addWorldHistory._eqPatched = true;
}

function patchSimulateWorld() {
  function wrap(orig) {
    return function () {
      orig();
      try { emergentQuestTick(); } catch (e) { console.warn("emergentQuestTick error:", e); }
    };
  }
  function tryPatch() {
    if (typeof window.simulateWorld === "function" && !window.simulateWorld._eqPatched) {
      var wrapped = wrap(window.simulateWorld);
      wrapped._eqPatched = true;
      window.simulateWorld = wrapped;
      return true;
    }
    return typeof window.simulateWorld === "function";
  }
  if (!tryPatch()) {
    window.addEventListener("load", tryPatch);
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (tryPatch() || tries > 20) clearInterval(iv);
    }, 300);
  }
}

function patchShowPanel() {
  function wrap(orig) {
    return function (panel) {
      orig(panel);
      if (panel === "emergent-quests") renderQuestBoard();
    };
  }
  function tryPatch() {
    if (typeof window.showPanel === "function" && !window.showPanel._eqPatched2) {
      var wrapped = wrap(window.showPanel);
      wrapped._eqPatched2 = true;
      window.showPanel = wrapped;
      return true;
    }
    return typeof window.showPanel === "function";
  }
  if (!tryPatch()) window.addEventListener("load", tryPatch);
}

// ---- PERSISTENCE (full save compatibility — additive only) ----
function patchPersistence() {
  var _origSave = window.save;
  window.save = function () {
    if (_origSave) _origSave();
    try {
      localStorage.setItem("cgv6_emergentQuests", JSON.stringify(emergentQuests));
      localStorage.setItem("cgv6_eqIdCtr", window._eqIdCounter);
    } catch (e) {}
  };

  var _origLoad = window.load;
  window.load = function () {
    if (_origLoad) _origLoad();
    try {
      var raw = localStorage.getItem("cgv6_emergentQuests");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed) {
          emergentQuests.active    = parsed.active    || [];
          emergentQuests.completed = parsed.completed || [];
          emergentQuests.failed    = parsed.failed    || [];
          emergentQuests.epic      = parsed.epic       || [];
        }
      }
      var ctr = localStorage.getItem("cgv6_eqIdCtr");
      if (ctr) window._eqIdCounter = parseInt(ctr, 10) || 1;

      // Khôi phục _questStory cho từng NPC từ emergentQuests đã lưu
      if (typeof npcs !== "undefined") {
        npcs.forEach(npc => { ensureNpcQuestStory(npc); npc._questStory = { active: [], completed: [], failed: [] }; });
        [...emergentQuests.active, ...emergentQuests.completed, ...emergentQuests.failed].forEach(q => {
          (q.holders || []).forEach(id => {
            var n = npcById(id);
            if (!n) return;
            ensureNpcQuestStory(n);
            if (q.status === "active")   n._questStory.active.push(q.id);
            if (q.status === "success")  n._questStory.completed.push(q.id);
            if (q.status === "fail")     n._questStory.failed.push(q.id);
          });
        });
      }
    } catch (e) { console.warn("QuestEngine load error:", e); }
  };
}

// ============================================================
// 12. STYLES (reuse questSystem.js classes; add minor extras)
// ============================================================

function injectStyles() {
  var style = document.createElement("style");
  style.textContent = `
    #panel-emergent-quests .quest-stat-box{min-width:0}
    #panel-emergent-quests .qsb-val{word-break:break-word}
  `;
  document.head.appendChild(style);
}

// ============================================================
// 13. INIT
// ============================================================

function init() {
  injectStyles();
  patchAddWorldHistory();
  patchSimulateWorld();
  patchShowPanel();
  patchPersistence();
  patchOpenNPCModal();

  function tryUI() {
    if (document.querySelector(".sidebar-nav") && document.querySelector(".panels")) {
      injectQuestEngineUI();
      return true;
    }
    return false;
  }
  if (!tryUI()) {
    document.addEventListener("DOMContentLoaded", tryUI);
    var iv = setInterval(function () { if (tryUI()) clearInterval(iv); }, 300);
  }

  // re-patch openNPCModal nếu app.js load sau
  var iv2 = setInterval(function () {
    patchOpenNPCModal();
    if (window.openNPCModal && window.openNPCModal._eqPatched) clearInterval(iv2);
  }, 300);

  console.log("📜 Quest Engine V1 (Emergent Quest System) loaded!");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})();
