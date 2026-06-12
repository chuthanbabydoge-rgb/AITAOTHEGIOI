/* ============================================================
   PROGRESSION SYSTEM — V7
   progressionSystem.js

   Kết nối vòng gameplay hoàn chỉnh:
   Player → Quest → Dungeon → Boss → Artifact → Tông Môn
   → Faction War → Territory → Empire → World Lord

   Không sửa bất kỳ hệ thống nào đã có.
   ============================================================ */

// ============================================================
// PROGRESSION STATE
// ============================================================

let progressionState = {
  // Milestones đã đạt (dùng để mở khóa stage tiếp theo)
  milestones: {
    questCompleted:      false,  // Hoàn thành quest đầu tiên
    dungeonCleared:      false,  // Thám hiểm dungeon đầu tiên
    bossDefeated:        false,  // Hạ boss lần đầu
    artifactEquipped:    false,  // Trang bị artifact đầu tiên
    sectJoined:          false,  // Gia nhập tông môn
    factionWarJoined:    false,  // Tham chiến lần đầu
    territoryOwned:      false,  // Chiếm lãnh thổ đầu tiên
    empireFound:         false,  // Thành lập đế quốc
    dynastyBuilt:        false,  // Xây dựng dòng tộc 3+ thế hệ
    worldLord:           false,  // Trở thành Chúa Tể Thế Giới
  },
  // Player's empire (nếu thành lập)
  playerEmpire: null,
  // Player's territories
  playerTerritories: [],
  // Faction war history of player
  playerWarHistory: [],
  // World Lord status
  worldLordYear: null,
};

// ============================================================
// QUEST TYPES — DUNGEON & BOSS & TERRITORY & EMPIRE
// Inject vào QUEST_TYPES sau khi questSystem.js load
// ============================================================

(function injectQuestTypes() {
  document.addEventListener("DOMContentLoaded", function() {
    if (typeof QUEST_TYPES === "undefined") return;

    // ── Thám Hiểm Dungeon ──
    QUEST_TYPES.clear_dungeon = {
      id:       "clear_dungeon",
      name:     "Thám Hiểm Dungeon",
      icon:     "🏰",
      color:    "#fb923c",
      category: "Chiến Đấu",
      desc:     (q) => `Thám hiểm ${q.dungeonName || "một dungeon"}`,
      generateTarget: (npc) => {
        if (typeof dungeons !== "undefined" && dungeons.length) {
          const eligible = dungeons.filter(d => d.status === "active" && d.levelRequired <= npc.realm);
          const dg = eligible.length ? eligible[Math.floor(Math.random() * eligible.length)] : dungeons[0];
          return { target: 1, dungeonId: dg?.id, dungeonName: dg?.name || "Dungeon Bí Ẩn" };
        }
        return { target: 1, dungeonName: "Dungeon Bí Ẩn" };
      },
      checkProgress: (npc, q) => {
        if (typeof dungeons === "undefined") return false;
        if (q.dungeonId) {
          const dg = dungeons.find(d => d.id === q.dungeonId);
          if (dg && dg.explorers.some(e => e.npcId === npc.id && e.result === "clear")) {
            q.progress = 1; return true;
          }
        }
        const recentClear = dungeons.find(d =>
          d.explorers.some(e => e.npcId === npc.id && e.result === "clear" && e.year >= (q.assignedYear || year))
        );
        if (recentClear) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      1500 * (npc.realm + 1),
        wealth:   2000 * (npc.realm + 1),
        prestige: 500,
        special:  npc.realm >= 4 ? "epic_artifact" : "rare_artifact",
      }),
    };

    // ── Đánh Boss ──
    QUEST_TYPES.defeat_boss = {
      id:       "defeat_boss",
      name:     "Hạ Gục Boss",
      icon:     "⚔️",
      color:    "#f87171",
      category: "Chiến Đấu",
      desc:     (q) => `Hạ gục ${q.bossName || "một boss hung ác"}`,
      generateTarget: (npc) => {
        if (typeof dungeons !== "undefined" && dungeons.length) {
          const eligible = dungeons.filter(d => d.status === "active" && d.levelRequired <= npc.realm + 1);
          const dg = eligible.length ? eligible[Math.floor(Math.random() * eligible.length)] : null;
          return { target: 1, dungeonId: dg?.id, bossName: dg?.boss || "Boss Hắc Ám", dungeonName: dg?.name };
        }
        return { target: 1, bossName: "Boss Hắc Ám" };
      },
      checkProgress: (npc, q) => {
        if (typeof dungeons === "undefined") return false;
        const cleared = dungeons.find(d =>
          d.bossDefeated && d.explorers.some(e => e.npcId === npc.id && e.result === "clear" && e.year >= (q.assignedYear || year))
        );
        if (cleared) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      3000 * (npc.realm + 1),
        wealth:   5000,
        prestige: 1000 * (npc.realm + 1),
        special:  "legendary_artifact",
      }),
    };

    // ── Nhập Bí Cảnh ──
    QUEST_TYPES.enter_secret_realm = {
      id:       "enter_secret_realm",
      name:     "Thám Hiểm Bí Cảnh",
      icon:     "🌀",
      color:    "#a78bfa",
      category: "Thám Hiểm",
      desc:     (q) => `Vào bí cảnh ${q.realmName || "huyền bí"}`,
      generateTarget: (npc) => {
        if (typeof secretRealms !== "undefined" && secretRealms.length) {
          const r = secretRealms.filter(s => s.status !== "closed" && (s.minRealm || 0) <= npc.realm);
          const chosen = r.length ? r[Math.floor(Math.random() * r.length)] : secretRealms[0];
          return { target: 1, realmId: chosen?.id, realmName: chosen?.name || "Bí Cảnh" };
        }
        return { target: 1, realmName: "Bí Cảnh" };
      },
      checkProgress: (npc, q) => {
        if (typeof secretRealms === "undefined") return false;
        const explored = (npc.realmExplored || 0);
        if (explored > (q._baseExplored || 0)) { q.progress = 1; return true; }
        if (!q._baseExplored) q._baseExplored = explored;
        return false;
      },
      rewards: (npc, q) => ({
        exp:      2000 * (npc.realm + 1),
        wealth:   3000,
        prestige: 600,
        special:  "epic_artifact",
      }),
    };

    // ── Tham Chiến Tông Môn ──
    QUEST_TYPES.join_faction_war = {
      id:       "join_faction_war",
      name:     "Tham Chiến Tông Môn",
      icon:     "⚔️",
      color:    "#f43f5e",
      category: "Chiến Đấu",
      desc:     (q) => `Tham gia tông môn chiến, giành chiến thắng`,
      generateTarget: (npc) => ({ target: 1 }),
      checkProgress: (npc, q) => {
        if (!progressionState.playerWarHistory.length) return false;
        const recent = progressionState.playerWarHistory.find(w => w.year >= (q.assignedYear || year));
        if (recent) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      4000 * (npc.realm + 1),
        wealth:   8000,
        prestige: 2000,
        special:  "epic_artifact",
      }),
    };

    // ── Chiếm Lãnh Thổ ──
    QUEST_TYPES.claim_territory = {
      id:       "claim_territory",
      name:     "Chiếm Lãnh Thổ",
      icon:     "🗺️",
      color:    "#10b981",
      category: "Bá Chủ",
      desc:     (q) => `Chinh phục và kiểm soát lãnh thổ`,
      generateTarget: (npc) => ({ target: 1 }),
      checkProgress: (npc, q) => {
        if (progressionState.playerTerritories.length > 0) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      6000 * (npc.realm + 1),
        wealth:   10000,
        prestige: 3000,
        special:  "legendary_artifact",
      }),
    };

    // ── Thành Lập Đế Quốc ──
    QUEST_TYPES.found_empire = {
      id:       "found_empire",
      name:     "Thành Lập Đế Quốc",
      icon:     "👑",
      color:    "#facc15",
      category: "Bá Chủ",
      desc:     (q) => `Thành lập vương triều, xưng bá một phương`,
      generateTarget: (npc) => ({ target: 1, minRealm: 5 }),
      checkProgress: (npc, q) => {
        if (progressionState.playerEmpire) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      20000 * (npc.realm + 1),
        wealth:   50000,
        prestige: 10000,
        special:  "legendary_artifact",
      }),
    };

    // ── Trở Thành Chúa Tể ──
    QUEST_TYPES.become_world_lord = {
      id:       "become_world_lord",
      name:     "Chúa Tể Thế Giới",
      icon:     "🌍",
      color:    "#facc15",
      category: "Bá Chủ",
      desc:     (q) => `Thống nhất thiên hạ, trở thành Chúa Tể`,
      generateTarget: (npc) => ({ target: 1, minRealm: 7 }),
      checkProgress: (npc, q) => {
        if (progressionState.milestones.worldLord) { q.progress = 1; return true; }
        return false;
      },
      rewards: (npc, q) => ({
        exp:      100000,
        wealth:   200000,
        prestige: 50000,
        special:  "legendary_artifact",
      }),
    };

    // Cũng inject vào QUEST_TYPE_KEYS nếu là array
    if (Array.isArray(window.QUEST_TYPE_KEYS)) {
      ["clear_dungeon","defeat_boss","enter_secret_realm","join_faction_war","claim_territory","found_empire","become_world_lord"]
        .forEach(k => { if (!window.QUEST_TYPE_KEYS.includes(k)) window.QUEST_TYPE_KEYS.push(k); });
    }
  });
})();

// ============================================================
// PLAYER ACTIONS — FACTION WAR
// ============================================================

function playerActionFactionWar() {
  if (!_checkPlayerAlive()) return;
  if (!player.sectId) {
    _playerNotify("⚠️ Cần gia nhập tông môn trước khi tham chiến!");
    return;
  }

  const playerSect = sects.find(s => s.id === player.sectId);
  if (!playerSect) { _playerNotify("⚠️ Tông môn không tồn tại!"); return; }

  const enemies = sects.filter(s =>
    s.id !== player.sectId &&
    s.members.map(id => npcById(id)).filter(n => n && n.status === "alive").length >= 1 &&
    s.warCooldown <= 0
  );

  if (!enemies.length) {
    _playerNotify("⚠️ Không có tông môn nào có thể giao chiến lúc này!");
    return;
  }

  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">⚔️ Tham Chiến Tông Môn</h3>
      <p style="color:var(--white-dim);font-size:13px;margin-bottom:12px">
        Chọn tông môn để ${playerSect.name} tấn công:
      </p>
      ${enemies.map(s => {
        const members = s.members.map(id => npcById(id)).filter(n => n && n.status === "alive").length;
        return `
        <div class="player-action-choice" onclick="playerConfirmFactionWar('${s.id}')">
          <b>${s.name}</b>
          <span style="color:var(--white-dim);font-size:12px">
            ${s.territory} — ${members} tu sĩ sống — uy danh ${s.prestige}
          </span>
        </div>`;
      }).join("")}
      <button class="btn-secondary" style="margin-top:12px;width:100%" onclick="closeModalBtn()">Hủy</button>
    </div>`;
  openModal(html);
}

function playerConfirmFactionWar(enemySectId) {
  if (!_checkPlayerAlive()) return;
  closeModalBtn();
  const playerSect = sects.find(s => s.id === player.sectId);
  const enemySect  = sects.find(s => s.id === enemySectId);
  if (!playerSect || !enemySect) return;

  // Player contributes combat power
  const playerPower  = player.attack + player.defense + player.realm * 150 + player.luck * 2;
  const sectPower    = playerSect.members.reduce((sum, id) => {
    const n = npcById(id);
    return sum + (n && n.status === "alive" && n.id !== player.id ? n.realm * 100 + n.attack : 0);
  }, 0) + playerSect.prestige + playerPower;

  const enemyPower = enemySect.members.reduce((sum, id) => {
    const n = npcById(id);
    return sum + (n && n.status === "alive" ? n.realm * 100 + n.attack : 0);
  }, 0) + enemySect.prestige;

  const winChance = Math.min(0.90, Math.max(0.15, sectPower / (sectPower + enemyPower)));
  const won = chance(winChance);

  const warEntry = {
    year,
    playerSect: playerSect.name,
    enemySect:  enemySect.name,
    result:     won ? "win" : "lose",
    contribution: playerPower,
  };
  progressionState.playerWarHistory.unshift(warEntry);
  progressionState.milestones.factionWarJoined = true;

  if (won) {
    const prestige = randInt(200, 800);
    const wealth   = randInt(1000, 5000);
    playerSect.prestige += prestige;
    enemySect.prestige   = Math.max(10, enemySect.prestige - prestige);
    playerSect.treasury += Math.floor(enemySect.treasury * 0.25);
    enemySect.treasury   = Math.floor(enemySect.treasury * 0.75);
    playerSect.warCooldown = 8;
    enemySect.warCooldown  = 8;

    // Player receives personal reward
    player.wealth     += wealth;
    player.reputation  = (player.reputation || 0) + prestige;
    player.killCount++;

    addLog(`⚔️🎮 ${player.name} dẫn đầu ${playerSect.name} đại bại ${enemySect.name}! +${prestige} uy danh`, "important");
    player.biography.push({ year, event: `Dẫn đầu ${playerSect.name} chinh phạt ${enemySect.name}, đại thắng.` });
    player.manualActions.push({ year, action: `Dẫn quân đánh ${enemySect.name}, thắng lợi! +${prestige} danh vọng` });

    // Chance to get artifact from war
    if (chance(0.4) && typeof grantDungeonArtifact === "function") {
      grantDungeonArtifact(player, 3);
    }

    // Check if player can become sect leader
    if (!playerSect.leader || playerSect.leader !== player.id) {
      if (player.reputation > (playerSect.prestige * 0.5) && player.realm >= 3) {
        playerSect.leader = player.id;
        if (!player.titles.includes("Môn Chủ")) player.titles.push("Môn Chủ");
        addLog(`🏆🎮 ${player.name} trở thành Môn Chủ của ${playerSect.name}!`, "important");
        player.biography.push({ year, event: `Trở thành Môn Chủ của ${playerSect.name}.` });
      }
    }

    toast(`⚔️ Đại Thắng! ${playerSect.name} đánh bại ${enemySect.name}! +${prestige} danh vọng`);
  } else {
    // Loss — take damage
    const hpLoss = Math.floor(player.maxHp * (0.2 + Math.random() * 0.3));
    player.hp = Math.max(1, player.hp - hpLoss);
    playerSect.warCooldown = 8;
    enemySect.warCooldown  = 8;

    addLog(`⚔️🎮 ${player.name} tham chiến nhưng ${playerSect.name} thua ${enemySect.name}. HP -${hpLoss}`, "normal");
    player.manualActions.push({ year, action: `Tham chiến với ${enemySect.name}, thất bại. HP -${hpLoss}` });
    toast(`💔 Thua trận! ${playerSect.name} thất bại trước ${enemySect.name}`);
  }

  _trimManualActions();
  _checkProgressionMilestones();
  save();
  renderPlayerPanel();
  renderProgressionPanel();
}

// ============================================================
// PLAYER ACTIONS — CLAIM TERRITORY
// ============================================================

function playerActionClaimTerritory() {
  if (!_checkPlayerAlive()) return;
  if (player.realm < 2) {
    _playerNotify(`⚠️ Cần đạt ${REALMS[2].name} để chiếm lãnh thổ!`);
    return;
  }

  const regions = typeof REGIONS !== "undefined" ? REGIONS : ["Đông Vực","Tây Hoang","Nam Hải","Bắc Nguyên"];
  const owned   = progressionState.playerTerritories.map(t => t.region);
  const available = regions.filter(r => !owned.includes(r));

  if (!available.length) {
    _playerNotify("🗺️ Bạn đã kiểm soát tất cả vùng đất!");
    return;
  }

  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">🗺️ Chiếm Lãnh Thổ</h3>
      <p style="color:var(--white-dim);font-size:13px;margin-bottom:12px">
        Đang sở hữu: ${owned.length} vùng. Chọn vùng để chinh phạt:
      </p>
      ${available.map(r => `
        <div class="player-action-choice" onclick="playerConfirmClaimTerritory('${r}')">
          <b>${r}</b>
          <span style="color:var(--white-dim);font-size:12px">
            Cần sức mạnh để chinh phục
          </span>
        </div>`).join("")}
      <button class="btn-secondary" style="margin-top:12px;width:100%" onclick="closeModalBtn()">Hủy</button>
    </div>`;
  openModal(html);
}

function playerConfirmClaimTerritory(region) {
  closeModalBtn();
  if (!_checkPlayerAlive()) return;

  const power    = player.attack + player.defense + player.realm * 200 + (player.reputation || 0) * 0.5;
  const required = 500 + progressionState.playerTerritories.length * 300;
  const winChance = Math.min(0.85, Math.max(0.20, power / (power + required)));

  if (chance(winChance)) {
    const territory = {
      region,
      claimedYear: year,
      taxRate:  0.10,
      garrison: Math.floor(player.realm * 500 + 200),
      income:   randInt(500, 2000) * (player.realm + 1),
    };
    progressionState.playerTerritories.push(territory);
    progressionState.milestones.territoryOwned = true;

    const rep = randInt(500, 2000);
    player.reputation = (player.reputation || 0) + rep;
    if (!player.titles.includes("Lãnh Địa Chủ")) player.titles.push("Lãnh Địa Chủ");

    addLog(`🗺️🎮 ${player.name} chinh phục ${region}! Tổng lãnh thổ: ${progressionState.playerTerritories.length}`, "important");
    player.biography.push({ year, event: `Chinh phục ${region}, đặt dưới trướng.` });
    player.manualActions.push({ year, action: `Chiếm ${region}! Tổng: ${progressionState.playerTerritories.length} vùng` });

    toast(`🗺️ Chinh phục ${region}! +${rep} danh vọng`);
    _checkProgressionMilestones();
  } else {
    const hpLoss = Math.floor(player.maxHp * 0.15);
    player.hp = Math.max(1, player.hp - hpLoss);
    toast(`💔 Thất bại khi chinh phục ${region}! HP -${hpLoss}`);
    player.manualActions.push({ year, action: `Thất bại chiếm ${region}` });
  }

  _trimManualActions();
  save();
  renderPlayerPanel();
  renderProgressionPanel();
}

// ============================================================
// PLAYER ACTION — FOUND EMPIRE
// ============================================================

function playerActionFoundEmpire() {
  if (!_checkPlayerAlive()) return;

  if (progressionState.playerEmpire) {
    _playerNotify(`👑 Đã có đế quốc: ${progressionState.playerEmpire.name}!`);
    return;
  }
  if (player.realm < 5) {
    _playerNotify(`⚠️ Cần đạt ${REALMS[5]?.name || "Luyện Hư"} để thành lập đế quốc!`);
    return;
  }
  if (progressionState.playerTerritories.length < 2) {
    _playerNotify("⚠️ Cần kiểm soát ít nhất 2 lãnh thổ để lập đế quốc!");
    return;
  }

  const defaultName = `${player.family} Vương Triều`;
  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">👑 Thành Lập Đế Quốc</h3>
      <div style="color:var(--white-dim);font-size:13px;margin-bottom:16px">
        <div>✅ Cảnh giới: ${REALMS[player.realm].name}</div>
        <div>✅ Lãnh thổ: ${progressionState.playerTerritories.length} vùng</div>
        <div>✅ Danh vọng: ${player.reputation || 0}</div>
      </div>
      <label style="color:var(--white);font-size:13px;display:block;margin-bottom:6px">Tên Đế Quốc:</label>
      <input id="empire-name-input" class="dao-input" style="width:100%;margin-bottom:12px"
        placeholder="${defaultName}" value="${defaultName}">
      <div style="display:flex;gap:8px">
        <button class="btn-primary" style="flex:1" onclick="playerConfirmFoundEmpire()">👑 Xưng Đế</button>
        <button class="btn-secondary" style="flex:1" onclick="closeModalBtn()">Hủy</button>
      </div>
    </div>`;
  openModal(html);
}

function playerConfirmFoundEmpire() {
  const nameInput = document.getElementById("empire-name-input");
  const empireName = (nameInput?.value || "").trim() || `${player.family} Vương Triều`;
  closeModalBtn();

  progressionState.playerEmpire = {
    id:          `emp_${Date.now()}`,
    name:        empireName,
    foundYear:   year,
    ruler:       player.name,
    territories: [...progressionState.playerTerritories.map(t => t.region)],
    military:    player.realm * 5000 + (player.reputation || 0) * 2,
    treasury:    player.wealth * 0.3,
    level:       1,
    history:     [],
  };
  progressionState.milestones.empireFound = true;

  // Empire founding rewards
  player.wealth += 20000;
  player.reputation = (player.reputation || 0) + 5000;
  if (!player.titles.includes("Hoàng Đế")) {
    player.titles = player.titles.filter(t => t !== "Lãnh Địa Chủ" && t !== "Môn Chủ");
    player.titles.unshift("Hoàng Đế");
  }

  // Add country to world countries list
  window.countries = window.countries || [];
  {
    window.countries.push({
      id:         progressionState.playerEmpire.id,
      name:       empireName,
      population: 500000 + player.realm * 100000,
      wealth:     progressionState.playerEmpire.treasury,
      army:       progressionState.playerEmpire.military,
      territory:  progressionState.playerTerritories[0]?.region || "Trung Thổ",
      relations:  {},
      economy:    5000 * player.realm,
      military:   progressionState.playerEmpire.military,
      technology: Math.min(5, player.realm),
      culture:    Math.min(5, Math.floor(player.reputation / 2000)),
      level:      1,
      civHistory: [],
      isPlayer:   true,
    });
  }

  addLog(`👑🎮 ${player.name} thành lập ${empireName}! Xưng Hoàng Đế bá chủ một phương!`, "important");
  addTimeline(`👑 ${empireName} thành lập`, "important", "👑");
  if (typeof addWorldHistory === "function") {
    addWorldHistory("civilization", `${player.name} lập ${empireName}, xưng đế một phương.`, { empireName });
  }
  player.biography.push({ year, event: `Thành lập ${empireName}, xưng Hoàng Đế.` });
  player.manualActions.push({ year, action: `Thành lập ${empireName}! 👑 Xưng Đế!` });

  toast(`👑 ${empireName} thành lập! ${player.name} xưng Hoàng Đế!`);
  _trimManualActions();
  _checkProgressionMilestones();
  save();
  renderPlayerPanel();
  renderProgressionPanel();
}

// ============================================================
// PLAYER ACTION — BUILD DYNASTY
// ============================================================

function playerActionBuildDynasty() {
  if (!_checkPlayerAlive()) return;

  const dynasty = dynasties && dynasties[player.family];
  if (!dynasty) {
    _playerNotify("⚠️ Chưa có dòng tộc! Hệ thống dòng tộc tự tạo khi có con cháu.");
    return;
  }

  const members = npcs.filter(n => n.family === player.family && n.status === "alive");
  const html = `
    <div style="padding:8px">
      <h3 class="card-title" style="margin-bottom:12px">🏰 Dòng Tộc ${player.family}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="pstat"><span class="pstat-icon">👥</span><span class="pstat-val">${members.length}</span><span class="pstat-label">Thành Viên</span></div>
        <div class="pstat"><span class="pstat-icon">🏛️</span><span class="pstat-val">${dynasty.generations || 1}</span><span class="pstat-label">Thế Hệ</span></div>
        <div class="pstat"><span class="pstat-icon">⭐</span><span class="pstat-val">${dynasty.reputation || 0}</span><span class="pstat-label">Danh Vọng</span></div>
        <div class="pstat"><span class="pstat-icon">💰</span><span class="pstat-val">${dynasty.wealth || 0}</span><span class="pstat-label">Gia Sản</span></div>
      </div>
      <h4 style="color:var(--white-dim);font-size:12px;margin-bottom:8px">Thành Viên Nổi Bật:</h4>
      ${members.slice(0,5).map(m => `
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px">
          <span style="color:var(--white)">${m.name === player.name ? "⭐ " : ""}${m.name}</span>
          <span style="color:var(--white-dim)">${REALMS[m.realm]?.name || "?"}</span>
        </div>`).join("")}
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn-primary" style="flex:1" onclick="playerInvestDynasty()">💰 Đầu Tư Gia Tộc</button>
        <button class="btn-secondary" style="flex:1" onclick="closeModalBtn()">Đóng</button>
      </div>
    </div>`;
  openModal(html);
}

function playerInvestDynasty() {
  closeModalBtn();
  if (!_checkPlayerAlive()) return;
  const cost = 5000;
  if (player.wealth < cost) { _playerNotify("⚠️ Cần 5000 linh thạch!"); return; }

  player.wealth -= cost;
  const dynasty = dynasties[player.family];
  if (dynasty) {
    dynasty.wealth     = (dynasty.wealth || 0) + cost * 2;
    dynasty.reputation = (dynasty.reputation || 0) + 200;
  }
  player.reputation = (player.reputation || 0) + 100;
  player.manualActions.push({ year, action: `Đầu tư 5000 linh thạch cho dòng tộc ${player.family}` });
  _trimManualActions();

  if ((dynasty?.generations || 0) >= 3) {
    progressionState.milestones.dynastyBuilt = true;
  }

  toast(`🏰 Đầu tư thành công! Dòng tộc ${player.family} phồn thịnh hơn.`);
  _checkProgressionMilestones();
  save();
  renderPlayerPanel();
}

// ============================================================
// WORLD LORD CHECK
// ============================================================

function checkWorldLord() {
  if (!player || player.status !== "alive") return;
  if (progressionState.milestones.worldLord) return;

  const {
    dungeonCleared, bossDefeated, sectJoined,
    factionWarJoined, territoryOwned, empireFound,
  } = progressionState.milestones;

  // Requirements: realm 7+, empire, 3+ territories, won a war, high rep
  const realmOk      = player.realm >= 7;
  const empireOk     = !!progressionState.playerEmpire;
  const territoryOk  = progressionState.playerTerritories.length >= 3;
  const warOk        = factionWarJoined;
  const repOk        = (player.reputation || 0) >= 10000;
  const dungeonOk    = dungeonCleared;

  if (realmOk && empireOk && territoryOk && warOk && repOk && dungeonOk) {
    progressionState.milestones.worldLord = true;
    progressionState.worldLordYear = year;

    player.titles = player.titles.filter(t => t !== "Hoàng Đế");
    player.titles.unshift("⭐ Chúa Tể Thế Giới");
    player.reputation = (player.reputation || 0) + 50000;
    player.wealth     += 100000;

    addLog(`🌍👑🎮 ${player.name} thống nhất thiên hạ! Trở thành CHÚA TỂ THẾ GIỚI! 🌍`, "important");
    addTimeline(`🌍 ${player.name} — Chúa Tể Thế Giới`, "important", "🌍");
    if (typeof addWorldHistory === "function") {
      addWorldHistory("era", `${player.name} thống nhất thiên hạ, xưng Chúa Tể Thế Giới. Kỷ nguyên mới bắt đầu.`, { worldLord: player.name });
    }
    player.biography.push({ year, event: `Thống nhất thiên hạ. Trở thành Chúa Tể Thế Giới.` });
    toast(`🌍 ${player.name} — CHÚA TỂ THẾ GIỚI! Vòng gameplay hoàn thành!`);

    renderProgressionPanel();
    save();
  }
}

// ============================================================
// MILESTONE CHECKER
// ============================================================

function _checkProgressionMilestones() {
  if (!player || player.status !== "alive") return;
  const m = progressionState.milestones;

  // Quest completed
  if (!m.questCompleted && player.questsCompleted > 0) {
    m.questCompleted = true;
    _milestoneNotify("📜 Milestone: Hoàn thành quest đầu tiên!");
  }
  // Dungeon cleared
  if (!m.dungeonCleared && typeof dungeons !== "undefined") {
    if (dungeons.some(d => d.explorers.some(e => e.npcId === player.id && e.result === "clear"))) {
      m.dungeonCleared = true;
      _milestoneNotify("🏰 Milestone: Thám hiểm dungeon thành công!");
    }
  }
  // Boss defeated
  if (!m.bossDefeated && typeof dungeons !== "undefined") {
    if (dungeons.some(d => d.bossDefeated && d.explorers.some(e => e.npcId === player.id && e.result === "clear"))) {
      m.bossDefeated = true;
      _milestoneNotify("⚔️ Milestone: Hạ gục boss đầu tiên!");
    }
  }
  // Artifact equipped
  if (!m.artifactEquipped && player.artifactSlots) {
    const hasArt = Object.values(player.artifactSlots || {}).some(Boolean);
    if (hasArt) { m.artifactEquipped = true; _milestoneNotify("💠 Milestone: Trang bị artifact!"); }
  }
  // Sect joined
  if (!m.sectJoined && player.sectId) {
    m.sectJoined = true;
    _milestoneNotify("🏯 Milestone: Gia nhập tông môn!");
  }
  // Dynasty
  if (!m.dynastyBuilt && dynasties) {
    const d = dynasties[player.family];
    if (d && (d.generations || 0) >= 3) {
      m.dynastyBuilt = true;
      _milestoneNotify("🏰 Milestone: Dòng tộc 3 thế hệ!");
    }
  }

  checkWorldLord();
  renderProgressionPanel();
}

function _milestoneNotify(msg) {
  addLog(`🎮🌟 ${msg}`, "important");
  toast(msg);
}

// ============================================================
// RENDER: PROGRESSION PANEL (World Domination Progress)
// ============================================================

function renderProgressionPanel() {
  const panel = document.getElementById("panel-progression");
  if (!panel || !panel.classList.contains("active")) return;

  if (!world) {
    panel.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--white-dim)">Hãy tạo thế giới trước.</div>`;
    return;
  }
  if (!player || player.status !== "alive") {
    panel.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--white-dim)">
      Hãy tạo nhân vật để bắt đầu hành trình.
      <br><button class="btn-primary" style="margin-top:16px" onclick="openPlayerCreationModal()">✨ Tạo Nhân Vật</button>
    </div>`;
    return;
  }

  const m     = progressionState.milestones;
  const steps = [
    { key: "questCompleted",   icon: "📜", label: "Nhận & Hoàn Thành Quest",   done: m.questCompleted,   action: "showPanel('quests')", btnLabel: "📜 Xem Quest" },
    { key: "dungeonCleared",   icon: "🏰", label: "Đi Dungeon & Thám Hiểm",    done: m.dungeonCleared,   action: "showPanel('dungeon');renderDungeonPanel()", btnLabel: "🏰 Vào Dungeon" },
    { key: "bossDefeated",     icon: "⚔️", label: "Đánh Hạ Boss",              done: m.bossDefeated,     action: "showPanel('dungeon');renderDungeonPanel()", btnLabel: "⚔️ Tìm Boss" },
    { key: "artifactEquipped", icon: "💠", label: "Nhặt & Trang Bị Artifact",  done: m.artifactEquipped, action: "showPanel('player');renderPlayerPanel()", btnLabel: "💠 Xem Trang Bị" },
    { key: "sectJoined",       icon: "🏯", label: "Gia Nhập Tông Môn",         done: m.sectJoined,       action: "playerActionJoinSect()", btnLabel: "🏯 Gia Nhập Tông" },
    { key: "factionWarJoined", icon: "⚔️", label: "Tham Gia Faction War",      done: m.factionWarJoined, action: "playerActionFactionWar()", btnLabel: "⚔️ Tham Chiến" },
    { key: "territoryOwned",   icon: "🗺️", label: "Chiếm Territory",           done: m.territoryOwned,   action: "playerActionClaimTerritory()", btnLabel: "🗺️ Chiếm Đất" },
    { key: "empireFound",      icon: "👑", label: "Thành Lập Đế Quốc",         done: m.empireFound,      action: "playerActionFoundEmpire()", btnLabel: "👑 Lập Đế Quốc" },
    { key: "dynastyBuilt",     icon: "🏰", label: "Xây Dựng Dòng Tộc 3+ Thế Hệ", done: m.dynastyBuilt,  action: "playerActionBuildDynasty()", btnLabel: "🏰 Dòng Tộc" },
    { key: "worldLord",        icon: "🌍", label: "Trở Thành Chúa Tể Thế Giới", done: m.worldLord,       action: "checkWorldLord()", btnLabel: "🌍 Xưng Bá Thiên Hạ" },
  ];

  const completed = steps.filter(s => s.done).length;
  const pct       = Math.round((completed / steps.length) * 100);

  // Territory income
  const territoryIncome = progressionState.playerTerritories.reduce((s, t) => s + (t.income || 0), 0);
  const empire = progressionState.playerEmpire;

  panel.innerHTML = `
  <div class="panel-grid">

    <!-- HEADER CARD -->
    <div class="card span-full" style="background:linear-gradient(135deg,rgba(250,204,21,0.08),rgba(167,139,250,0.08))">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="font-size:3em">${m.worldLord ? "🌍" : player.realm >= 7 ? "👑" : player.realm >= 5 ? "🏯" : "⚔️"}</div>
        <div style="flex:1">
          <div style="font-size:1.3em;font-weight:700;color:var(--white)">
            ${m.worldLord ? `👑 CHÚA TỂ THẾ GIỚI — ${player.name}` : player.name}
            ${player.titles.length ? `<span style="font-size:0.7em;color:#facc15;margin-left:8px">${player.titles[0]}</span>` : ""}
          </div>
          <div style="color:var(--white-dim);font-size:13px;margin-top:2px">
            ${REALMS[player.realm]?.name || ""} · Danh vọng: ${player.reputation || 0} · Linh thạch: ${player.wealth || 0}
          </div>
          <div style="margin-top:10px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#facc15,#f59e0b);border-radius:4px;transition:width 0.5s"></div>
              </div>
              <span style="font-size:13px;color:#facc15;font-weight:700">${pct}%</span>
            </div>
            <div style="font-size:11px;color:var(--white-dim);margin-top:4px">${completed}/${steps.length} mốc hoàn thành</div>
          </div>
        </div>
        ${m.worldLord ? `<div style="text-align:center">
          <div style="font-size:1.8em">🌍</div>
          <div style="font-size:11px;color:#facc15">Năm ${progressionState.worldLordYear}</div>
        </div>` : ""}
      </div>
    </div>

    <!-- GAMEPLAY LOOP STEPS -->
    <div class="card" style="grid-column:span 2">
      <h2 class="card-title">⚔️ Vòng Gameplay — Hành Trình Bá Chủ</h2>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${steps.map((s, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:6px;
          background:${s.done ? "rgba(74,222,128,0.06)" : i === completed ? "rgba(250,204,21,0.06)" : "rgba(255,255,255,0.02)"};
          border:1px solid ${s.done ? "rgba(74,222,128,0.25)" : i === completed ? "rgba(250,204,21,0.25)" : "rgba(255,255,255,0.06)"}">
          <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;
            background:${s.done ? "rgba(74,222,128,0.2)" : i === completed ? "rgba(250,204,21,0.2)" : "rgba(255,255,255,0.05)"}">
            ${s.done ? "✅" : i === completed ? "▶️" : `${i+1}`}
          </div>
          <span style="font-size:1.1em">${s.icon}</span>
          <span style="flex:1;font-size:13px;color:${s.done ? "#4ade80" : i === completed ? "#facc15" : "var(--white-dim)"}">
            ${s.label}
          </span>
          ${!s.done ? `<button class="btn-${i===completed?"primary":"secondary"}" style="font-size:11px;padding:4px 10px;white-space:nowrap"
            onclick="${s.action}">${s.btnLabel}</button>` : `<span style="font-size:11px;color:#4ade80">✓ Xong</span>`}
        </div>`).join("")}
      </div>
    </div>

    <!-- PLAYER STATS CARD -->
    <div class="card">
      <h2 class="card-title">📊 Thống Kê Nhân Vật</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="pstat"><span class="pstat-icon">🏰</span><span class="pstat-val">${typeof dungeons !== "undefined" ? dungeons.filter(d => d.explorers.some(e => e.npcId === player.id && e.result === "clear")).length : 0}</span><span class="pstat-label">Dungeon Clear</span></div>
        <div class="pstat"><span class="pstat-icon">🌀</span><span class="pstat-val">${player.realmExplored || 0}</span><span class="pstat-label">Bí Cảnh</span></div>
        <div class="pstat"><span class="pstat-icon">⚔️</span><span class="pstat-val">${progressionState.playerWarHistory.filter(w => w.result === "win").length}</span><span class="pstat-label">Chiến Thắng</span></div>
        <div class="pstat"><span class="pstat-icon">🗺️</span><span class="pstat-val">${progressionState.playerTerritories.length}</span><span class="pstat-label">Lãnh Thổ</span></div>
        <div class="pstat"><span class="pstat-icon">📜</span><span class="pstat-val">${player.questsCompleted || 0}</span><span class="pstat-label">Quest Xong</span></div>
        <div class="pstat"><span class="pstat-icon">👑</span><span class="pstat-val">${empire ? "Có" : "Chưa"}</span><span class="pstat-label">Đế Quốc</span></div>
      </div>

      ${empire ? `
      <div style="margin-top:12px;padding:10px;background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.2);border-radius:6px">
        <div style="font-weight:700;color:#facc15;margin-bottom:4px">👑 ${empire.name}</div>
        <div style="font-size:12px;color:var(--white-dim)">Thành lập: Năm ${empire.foundYear}</div>
        <div style="font-size:12px;color:var(--white-dim)">Lãnh thổ: ${empire.territories.join("、")}</div>
        <div style="font-size:12px;color:var(--white-dim)">Quân đội: ${empire.military.toLocaleString()}</div>
      </div>` : ""}

      ${progressionState.playerTerritories.length ? `
      <div style="margin-top:12px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:6px">🗺️ Lãnh Thổ Đang Nắm Giữ:</div>
        ${progressionState.playerTerritories.map(t => `
          <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:var(--white)">${t.region}</span>
            <span style="color:#facc15">+${t.income}/năm</span>
          </div>`).join("")}
        <div style="margin-top:6px;font-size:12px;color:#4ade80">💎 Tổng thu nhập: +${territoryIncome} linh thạch/năm</div>
      </div>` : ""}
    </div>

    <!-- QUICK ACTIONS CARD -->
    <div class="card">
      <h2 class="card-title">🎮 Hành Động Bá Chủ</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="player-action-btn challenge" onclick="showPanel('quests')" style="font-size:12px">
          📜<span>Xem Quest</span>
        </button>
        <button class="player-action-btn cultivate" onclick="showPanel('dungeon');renderDungeonPanel()" style="font-size:12px">
          🏰<span>Dungeon</span>
        </button>
        <button class="player-action-btn challenge" onclick="playerActionFactionWar()" style="font-size:12px">
          ⚔️<span>Chiến Tông</span>
        </button>
        <button class="player-action-btn gather" onclick="playerActionClaimTerritory()" style="font-size:12px">
          🗺️<span>Chiếm Đất</span>
        </button>
        <button class="player-action-btn sect" onclick="playerActionFoundEmpire()" style="font-size:12px">
          👑<span>Lập Đế Quốc</span>
        </button>
        <button class="player-action-btn move" onclick="playerActionBuildDynasty()" style="font-size:12px">
          🏰<span>Dòng Tộc</span>
        </button>
      </div>

      <!-- War History -->
      ${progressionState.playerWarHistory.length ? `
      <div style="margin-top:14px">
        <div style="font-size:12px;color:var(--white-dim);margin-bottom:6px">⚔️ Lịch Sử Chiến Tranh:</div>
        ${progressionState.playerWarHistory.slice(0,5).map(w => `
          <div style="font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color:${w.result==="win"?"#4ade80":"#f87171"}">${w.result==="win"?"⚔️ Thắng":"💔 Thua"}</span>
            <span style="color:var(--white-dim);margin-left:6px">${w.playerSect} vs ${w.enemySect}</span>
            <span style="color:var(--white-dim);float:right">Năm ${w.year}</span>
          </div>`).join("")}
      </div>` : ""}
    </div>

  </div>`;
}

// ============================================================
// TERRITORY INCOME TICK
// ============================================================

function tickProgressionIncome() {
  if (!player || player.status !== "alive") return;

  // Territory income
  progressionState.playerTerritories.forEach(t => {
    const income = Math.floor((t.income || 0) / 10); // per tick (1/10 year)
    player.wealth = (player.wealth || 0) + income;
    // Increase empire military/treasury
    if (progressionState.playerEmpire) {
      progressionState.playerEmpire.treasury  += income;
      progressionState.playerEmpire.military  += Math.floor(player.realm * 10);
    }
  });

  // Empire level up
  if (progressionState.playerEmpire) {
    const emp = progressionState.playerEmpire;
    if (emp.military > emp.level * 50000 && emp.level < 10) {
      emp.level++;
      addLog(`👑🎮 ${emp.name} thăng lên Cấp ${emp.level}!`, "important");
    }
  }

  _checkProgressionMilestones();
}

// ============================================================
// PATCH PLAYER PANEL — ADD PROGRESSION ACTIONS
// ============================================================

(function patchPlayerPanel() {
  document.addEventListener("DOMContentLoaded", function() {
    // Patch renderPlayerPanel to add new action buttons
    const _orig = window.renderPlayerPanel;
    if (typeof _orig !== "function") return;

    window.renderPlayerPanel = function() {
      _orig.call(this);
      // Inject extra action buttons into the player actions grid
      const panel = document.getElementById("panel-player");
      if (!panel || !panel.classList.contains("active")) return;
      const grid = panel.querySelector(".player-actions-grid");
      if (!grid) return;

      // Add buttons if not already there
      if (grid.querySelector(".btn-faction-war")) return;

      const extraBtns = [
        { cls: "btn-faction-war challenge", onclick: "playerActionFactionWar()", icon: "⚔️", label: "Tông Môn Chiến" },
        { cls: "btn-claim-territory gather", onclick: "playerActionClaimTerritory()", icon: "🗺️", label: "Chiếm Đất" },
        { cls: "btn-found-empire sect", onclick: "playerActionFoundEmpire()", icon: "👑", label: "Lập Đế Quốc" },
        { cls: "btn-build-dynasty move", onclick: "playerActionBuildDynasty()", icon: "🏰", label: "Dòng Tộc" },
        { cls: "btn-progression detail", onclick: "showPanel('progression');renderProgressionPanel()", icon: "🌍", label: "Bá Chủ" },
      ];

      extraBtns.forEach(b => {
        const btn = document.createElement("button");
        btn.className   = `player-action-btn ${b.cls}`;
        btn.setAttribute("onclick", b.onclick);
        btn.innerHTML   = `${b.icon}<span>${b.label}</span>`;
        grid.appendChild(btn);
      });
    };

    // Patch simulateWorld
    const _origSim = window.simulateWorld;
    if (typeof _origSim === "function") {
      window.simulateWorld = function() {
        _origSim.call(this);
        tickProgressionIncome();
      };
    }

    // Patch showPanel
    const _origShow = window.showPanel;
    if (typeof _origShow === "function") {
      window.showPanel = function(name) {
        _origShow.call(this, name);
        if (name === "progression") renderProgressionPanel();
      };
    }

    // Patch renderAll
    const _origRenderAll = window.renderAll;
    if (typeof _origRenderAll === "function") {
      window.renderAll = function() {
        _origRenderAll.call(this);
        if (document.getElementById("panel-progression")?.classList.contains("active")) {
          renderProgressionPanel();
        }
      };
    }

    // Patch save
    const _origSave = window.save;
    if (typeof _origSave === "function") {
      window.save = function() {
        _origSave.call(this);
        try {
          localStorage.setItem("cgv7_progression", JSON.stringify(progressionState));
        } catch(e) { console.warn("Progression save failed:", e); }
      };
    }

    // Patch load
    const _origLoad = window.load;
    if (typeof _origLoad === "function") {
      window.load = function() {
        _origLoad.call(this);
        try {
          const raw = localStorage.getItem("cgv7_progression");
          if (raw) {
            const saved = JSON.parse(raw);
            progressionState = Object.assign(progressionState, saved);
          }
        } catch(e) { console.warn("Progression load failed:", e); }
      };
    }

    // Load on startup
    try {
      const raw = localStorage.getItem("cgv7_progression");
      if (raw) progressionState = Object.assign(progressionState, JSON.parse(raw));
    } catch(e) {}
  });
})();

// ============================================================
// INJECT PANEL & NAV INTO DOM
// ============================================================

(function injectProgressionUI() {
  document.addEventListener("DOMContentLoaded", function() {
    // Inject nav button
    const nav = document.querySelector("nav.sidebar-nav") || document.querySelector("nav");
    if (nav && !document.querySelector('[data-panel="progression"]')) {
      const btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.setAttribute("data-panel", "progression");
      btn.setAttribute("onclick", "showPanel('progression');renderProgressionPanel()");
      btn.innerHTML = `<span class="nav-icon">🌍</span><span>Bá Chủ</span>`;
      nav.appendChild(btn);
    }

    // Inject panel div
    const panels = document.querySelector(".panels-container") || document.querySelector("main");
    if (panels && !document.getElementById("panel-progression")) {
      const div = document.createElement("div");
      div.id        = "panel-progression";
      div.className = "panel";
      div.innerHTML = `<div style="text-align:center;padding:40px;color:var(--white-dim)">Đang tải...</div>`;
      panels.appendChild(div);
    }

    // Inject CSS for progression panel
    const style = document.createElement("style");
    style.textContent = `
      #panel-progression .player-action-btn {
        background: rgba(250,204,21,0.07);
        border: 1px solid rgba(250,204,21,0.2);
      }
      #panel-progression .player-action-btn:hover {
        background: rgba(250,204,21,0.14);
        border-color: rgba(250,204,21,0.4);
      }
      .btn-faction-war { border-color: rgba(248,113,113,0.3) !important; }
      .btn-claim-territory { border-color: rgba(16,185,129,0.3) !important; }
      .btn-found-empire { border-color: rgba(250,204,21,0.3) !important; }
    `;
    document.head.appendChild(style);
  });
})();
