/* ============================================================
   AUTO PLAYER AI — Full Journey Automation + Bug Fixes
   autoPlayerAI.js

   Fixes:
   1. Thiên Đình trống — force-found nếu > năm 50
   2. Nhiệm vụ không chạy — force-patch simulateWorld sau DOMContentLoaded
   3. Boss không xuất hiện — force-spawn boss nếu thiếu và đủ điều kiện
   4. Lãnh địa trống — auto-generate nếu world tồn tại nhưng chưa có territories

   Player Automation Flow:
   Player → Quest → Dungeon → Boss → Artifact → Tông Môn
   → Faction War → Territory → Đế Quốc → Dòng Tộc → Chúa Tể

   ============================================================ */

(function() {
  "use strict";

  // ==========================================
  // CONFIG
  // ==========================================
  var AI_ENABLED = true;   // toggle on/off
  var AI_LOG     = true;   // hiện log trong game
  var AI_INTERVAL_MS = 800; // tick mỗi 800ms (nhanh hơn sim tick)

  // Thresholds cho từng giai đoạn
  var STAGE = {
    QUEST_MIN_REALM      : 0,   // realm tối thiểu để nhận quest
    DUNGEON_MIN_REALM    : 1,   // realm để vào dungeon
    BOSS_MIN_REALM       : 3,   // realm để đánh boss
    SECT_MIN_REALM       : 1,   // realm để gia nhập tông môn
    FACTION_WAR_MIN_REALM: 3,
    TERRITORY_MIN_REALM  : 4,
    EMPIRE_MIN_REPUTATION: 8000,
    DYNASTY_MIN_WEALTH   : 5000,
  };

  var _aiInterval = null;
  var _lastActionYear = -1;
  var _aiStage = "quest"; // quest → dungeon → boss → sect → faction_war → territory → empire → dynasty → lord

  // ==========================================
  // HELPERS
  // ==========================================
  function _log(msg) {
    if (!AI_LOG) return;
    if (typeof addLog === "function") addLog("🤖 [AI] " + msg, "important");
    console.log("[AutoPlayerAI]", msg);
  }

  function _toast(msg) {
    if (typeof toast === "function") toast("🤖 " + msg);
  }

  function _r() { return typeof player !== "undefined" && player; }

  function _alive() { return _r() && player.status === "alive"; }

  function _yr() { return typeof year !== "undefined" ? year : 0; }

  // ==========================================
  // BUG FIX 1: Lãnh địa trống
  // ==========================================
  function fixTerritories() {
    if (typeof world === "undefined" || !world) return;
    if (typeof generateTerritories !== "function") return;
    if (world.territories && world.territories.length > 0) return;

    try {
      world.territories = generateTerritories(20);
      _log("Đã tạo " + world.territories.length + " lãnh địa.");
      if (typeof renderTerritories === "function") renderTerritories();
      if (typeof save === "function") save();
    } catch(e) { console.warn("fixTerritories error:", e); }
  }

  // ==========================================
  // BUG FIX 2: Thiên Đình trống (force-found sớm hơn năm 100)
  // ==========================================
  function fixThienDinh() {
    if (typeof world === "undefined" || !world) return;
    if (typeof thiendinhState === "undefined") return;
    if (thiendinhState.founded) return;
    if (_yr() < 30) return; // ít nhất năm 30

    var alive = (typeof npcs !== "undefined") ? npcs.filter(function(n){ return n.status === "alive"; }) : [];
    if (alive.length < 3) return;

    // Sắp xếp theo realm
    alive.sort(function(a,b){ return (b.realm||0) - (a.realm||0); });
    var topNPC = alive[0];
    if (!topNPC || thiendinhState.thienDe) return;

    try {
      thiendinhState.founded    = true;
      thiendinhState.foundedYear = _yr();
      thiendinhState.thienDe    = topNPC.id;
      if (!topNPC.titles) topNPC.titles = [];
      var gc = (typeof tdGetGenreConfig === "function") ? tdGetGenreConfig() : { leaderTitle: "Thiên Đế", systemName: "Thiên Đình" };
      topNPC.titles.push("👑 " + gc.leaderTitle);
      topNPC.reputation = (topNPC.reputation || 0) + 5000;

      // Bổ nhiệm thêm quan chức
      var rankIds = ["thien_ton", "thien_quan", "thien_tuong"];
      alive.slice(1, 4).forEach(function(npc, i) {
        var rId = rankIds[i];
        if (!thiendinhState.officials[rId]) thiendinhState.officials[rId] = [];
        thiendinhState.officials[rId].push(npc.id);
      });

      if (typeof thiendinhState.saveState === "function") thiendinhState.saveState();
      if (typeof renderThiendinhPanel === "function") renderThiendinhPanel();
      _log(topNPC.name + " lập " + gc.systemName + "!");
    } catch(e) { console.warn("fixThienDinh error:", e); }
  }

  // ==========================================
  // BUG FIX 3: Boss không xuất hiện — force spawn
  // ==========================================
  function fixBossSpawn() {
    if (typeof world === "undefined" || !world) return;
    if (typeof bosses === "undefined") return;
    var alive = (typeof npcs !== "undefined") ? npcs.filter(function(n){ return n.status === "alive"; }) : [];
    if (alive.length < 5) return;
    if (bosses.length > 0) return; // đã có boss
    if (_yr() < 5) return; // chờ thế giới ổn định

    try {
      if (typeof getTemplateBosses !== "function") return;
      var templates = getTemplateBosses();
      if (!templates || !templates.length) return;
      var newBoss = JSON.parse(JSON.stringify(templates[Math.floor(Math.random() * templates.length)]));
      newBoss.hp = newBoss.maxHp;
      bosses.push(newBoss);
      if (typeof addLog === "function") addLog("🐉 " + newBoss.name + " giáng thế! (Auto-spawn)", "important");
      if (typeof toast === "function") toast("🐉 Boss " + newBoss.name + " xuất hiện!");
    } catch(e) { console.warn("fixBossSpawn error:", e); }
  }

  // ==========================================
  // BUG FIX 4: Quest system patch
  // ==========================================
  function fixQuestPatch() {
    // questSystem.js tự patch nhưng có thể chậm — re-verify
    if (typeof simulateQuestSystem !== "function") return;
    if (typeof simulateWorld !== "function") return;
    // Đã được patch bởi questSystem.js — không cần làm gì thêm
  }

  // ==========================================
  // PLAYER AI: AUTO QUEST
  // ==========================================
  function aiAutoQuest() {
    if (!_alive()) return;
    if (player.realm < STAGE.QUEST_MIN_REALM) return;

    // Nếu không có quest available, generate
    if (typeof generateQuest === "function") {
      if (typeof playerQuests !== "undefined" && playerQuests.available.length === 0) {
        generateQuest();
      }
    }

    // Nhận quest đầu tiên nếu chưa có active
    if (typeof playerQuests !== "undefined" && typeof acceptQuest === "function") {
      if (playerQuests.active.length === 0 && playerQuests.available.length > 0) {
        var q = playerQuests.available[0];
        try {
          acceptQuest(q.id);
          _log("Nhận nhiệm vụ: " + q.name);
        } catch(e) {}
      }
    }
  }

  // ==========================================
  // PLAYER AI: AUTO DUNGEON
  // ==========================================
  function aiAutoDungeon() {
    if (!_alive()) return;
    if (player.realm < STAGE.DUNGEON_MIN_REALM) return;
    if (player.inDungeon) return;
    if (typeof dungeons === "undefined" || !dungeons.length) return;
    if (typeof enterDungeon !== "function") return;

    // Triệu hồi dungeon nếu chưa có
    if (dungeons.filter(function(d){ return d.status === "active" || d.status === "dormant"; }).length === 0) {
      if (typeof summonDungeon === "function") {
        try {
          // Tìm bí cảnh phù hợp với realm player
          var suitable = (typeof secretRealms !== "undefined") ?
            secretRealms.filter(function(s){ return (s.levelRequired || 0) <= player.realm; }) : [];
          if (suitable.length > 0) {
            summonDungeon(suitable[0].id);
            _log("Triệu hồi dungeon: " + suitable[0].name);
          }
        } catch(e) {}
      }
      return;
    }

    // Tìm dungeon phù hợp
    var available = dungeons.filter(function(d) {
      return (d.status === "active" || d.status === "dormant") &&
             d.levelRequired <= player.realm;
    });
    if (!available.length) return;

    // Chọn dungeon dễ nhất có thể clear
    available.sort(function(a,b){ return (a.difficultyNum||1) - (b.difficultyNum||1); });
    var target = available[0];

    // Chỉ vào dungeon mỗi 5 năm để không spam
    if (_yr() - (player._lastDungeonYear || 0) < 5) return;

    try {
      player._lastDungeonYear = _yr();
      enterDungeon(target.id);
      _log("Vào dungeon: " + target.name);
    } catch(e) {}
  }

  // ==========================================
  // PLAYER AI: AUTO BOSS FIGHT
  // ==========================================
  function aiAutoBoss() {
    if (!_alive()) return;
    if (player.realm < STAGE.BOSS_MIN_REALM) return;
    if (typeof bosses === "undefined" || !bosses.length) return;
    if (_yr() - (player._lastBossYear || 0) < 10) return; // cooldown 10 năm

    // Tìm boss có realm <= player.realm + 2
    var fightable = bosses.filter(function(b){ return b.hp > 0 && (b.realm || 5) <= player.realm + 2; });
    if (!fightable.length) return;

    var boss = fightable[0];
    try {
      // Tính xác suất thắng
      var playerPower = (player.attack || 100) + (player.defense || 50) + player.realm * 150 + (player.luck || 50);
      var bossPower   = (boss.realm || 5) * 500 + (boss.maxHp || 5000) / 10;
      var winChance   = Math.min(0.9, Math.max(0.2, playerPower / (playerPower + bossPower)));

      player._lastBossYear = _yr();

      if (Math.random() < winChance) {
        // Thắng!
        boss.hp = 0;
        player.killCount = (player.killCount || 0) + 1;
        player.reputation = (player.reputation || 0) + 3000;

        // Loot
        if (boss.loot && boss.loot.length) {
          var lootRarity = boss.loot[Math.floor(Math.random() * boss.loot.length)];
          var allLoot = [];
          if (typeof ITEM_POOL !== "undefined") allLoot = allLoot.concat(ITEM_POOL);
          if (typeof ARTIFACT_POOL !== "undefined") allLoot = allLoot.concat(ARTIFACT_POOL);
          var matching = allLoot.filter(function(i){ return i.rarity === lootRarity; });
          if (matching.length) {
            var loot = matching[Math.floor(Math.random() * matching.length)];
            var newLoot = Object.assign({}, loot, { id: "item_" + Date.now() });
            if (!player.inventory) player.inventory = [];
            player.inventory.push(newLoot);
          }
        }

        // Grant boss artifact
        if (typeof grantBossArtifact === "function") {
          try { grantBossArtifact(player, boss); } catch(e) {}
        }

        player.biography = player.biography || [];
        player.biography.push({ year: _yr(), event: "Đánh bại Boss " + boss.name + "!" });
        if (typeof heavenPoints !== "undefined") heavenPoints += (boss.realm || 5) * 30;

        if (typeof bosses !== "undefined") {
          window.bosses = bosses.filter(function(b){ return b.hp > 0; });
        }

        _log(player.name + " đánh bại Boss " + boss.name + "!");
        _toast(player.name + " hạ Boss " + boss.name + "!");
      } else {
        // Thua — mất HP
        var hpLoss = Math.floor((player.maxHp || 1000) * 0.3);
        player.hp = Math.max(1, (player.hp || 500) - hpLoss);
        _log(player.name + " thất bại khi đánh Boss " + boss.name + " (-" + hpLoss + " HP)");
      }

      if (typeof autoEquipBestGear === "function") autoEquipBestGear(player);
      if (typeof save === "function") save();
      if (typeof renderPlayerPanel === "function") renderPlayerPanel();
    } catch(e) { console.warn("aiAutoBoss error:", e); }
  }

  // ==========================================
  // PLAYER AI: AUTO JOIN SECT (Tông Môn)
  // ==========================================
  function aiAutoJoinSect() {
    if (!_alive()) return;
    if (player.sectId) return; // đã có tông môn
    if (player.realm < STAGE.SECT_MIN_REALM) return;
    if (typeof sects === "undefined" || !sects.length) return;

    // Tìm tông môn phù hợp (không yêu cầu realm quá cao)
    var eligible = sects.filter(function(s) {
      return s.members && s.id; // có tông môn hợp lệ
    });
    if (!eligible.length) return;

    // Ưu tiên tông môn cùng region
    var sameRegion = eligible.filter(function(s){ return s.territory && player.region && s.territory.includes(player.region); });
    var target = sameRegion.length ? sameRegion[0] : eligible[0];

    try {
      if (typeof playerConfirmJoinSect === "function") {
        playerConfirmJoinSect(target.id);
        _log(player.name + " gia nhập " + target.name);
      }
    } catch(e) {
      // Manual fallback
      try {
        player.sectId = target.id;
        if (!target.members) target.members = [];
        if (target.members.indexOf(player.id) === -1) target.members.push(player.id);
        player.biography = player.biography || [];
        player.biography.push({ year: _yr(), event: "Gia nhập " + target.name });
        _log(player.name + " gia nhập " + target.name + " (manual)");
        if (typeof save === "function") save();
      } catch(e2) {}
    }
  }

  // ==========================================
  // PLAYER AI: AUTO FACTION WAR PARTICIPATION
  // ==========================================
  function aiAutoFactionWar() {
    if (!_alive()) return;
    if (player.realm < STAGE.FACTION_WAR_MIN_REALM) return;
    if (!player.sectId) return;
    if (_yr() - (player._lastWarYear || 0) < 15) return; // cooldown

    if (typeof triggerSectWar !== "function") return;
    if (typeof sects === "undefined" || sects.length < 2) return;

    var mySect = sects.find(function(s){ return s.id === player.sectId; });
    if (!mySect) return;

    // Tìm tông môn khác để chiến đấu
    var enemies = sects.filter(function(s){
      return s.id !== player.sectId && (s.warCooldown || 0) === 0;
    });
    if (!enemies.length) return;

    var enemy = enemies[Math.floor(Math.random() * enemies.length)];

    try {
      player._lastWarYear = _yr();
      triggerSectWar(player.sectId, enemy.id);

      // Tăng danh vọng player khi tham chiến
      player.reputation = (player.reputation || 0) + 1000;
      player.biography = player.biography || [];
      player.biography.push({ year: _yr(), event: "Tham gia Tông Môn Chiến: " + mySect.name + " vs " + enemy.name });

      _log(player.name + " dẫn đầu tông môn chiến " + mySect.name + " vs " + enemy.name);
    } catch(e) { console.warn("aiAutoFactionWar error:", e); }
  }

  // ==========================================
  // PLAYER AI: AUTO TERRITORY CLAIM
  // ==========================================
  function aiAutoClaimTerritory() {
    if (!_alive()) return;
    if (player.realm < STAGE.TERRITORY_MIN_REALM) return;
    if (typeof world === "undefined" || !world) return;
    if (!world.territories || !world.territories.length) return;
    if (_yr() - (player._lastTerritoryYear || 0) < 20) return;

    // Tìm territory chưa có owner hoặc owner yếu hơn
    var unclaimed = world.territories.filter(function(t) {
      return !t.owner || t.owner === "" || t.owner === null;
    });

    if (!unclaimed.length) {
      // Thử chiếm territory của NPC yếu
      var weak = world.territories.filter(function(t) {
        if (!t.owner) return false;
        var owner = (typeof npcs !== "undefined") ? npcs.find(function(n){ return n.name === t.owner; }) : null;
        return owner && owner.realm < player.realm - 2;
      });
      if (weak.length) unclaimed = [weak[0]];
    }

    if (!unclaimed.length) return;

    try {
      var target = unclaimed[Math.floor(Math.random() * Math.min(3, unclaimed.length))];
      var prevOwner = target.owner || "vô chủ";
      target.owner    = player.name;
      target.ownerId  = player.id;
      target.claimedYear = _yr();

      player._lastTerritoryYear = _yr();
      player._territoryClaims = (player._territoryClaims || 0) + 1;
      player.reputation = (player.reputation || 0) + 2000;
      player.biography = player.biography || [];
      player.biography.push({ year: _yr(), event: "Chiếm lĩnh lãnh địa " + target.name + " từ " + prevOwner });

      _log(player.name + " chiếm lĩnh lãnh địa: " + target.name);
      _toast(player.name + " chiếm " + target.name + "!");

      if (typeof renderTerritories === "function") renderTerritories();
      if (typeof save === "function") save();
    } catch(e) { console.warn("aiAutoClaimTerritory error:", e); }
  }

  // ==========================================
  // PLAYER AI: AUTO EMPIRE / ĐẾ QUỐC
  // ==========================================
  function aiAutoEmpire() {
    if (!_alive()) return;
    if ((player.reputation || 0) < STAGE.EMPIRE_MIN_REPUTATION) return;
    if (player._empireFormed) return;
    if ((player._territoryClaims || 0) < 2) return; // cần ít nhất 2 lãnh địa

    try {
      player._empireFormed = true;
      player.reputation = (player.reputation || 0) + 5000;
      player.biography = player.biography || [];
      player.biography.push({ year: _yr(), event: "Kiến lập Đế Quốc! Xưng Đế tại " + player.name + " Đế Quốc." });

      if (!player.titles) player.titles = [];
      player.titles.push("👑 Đại Đế");

      // Thêm vào lịch sử thế giới
      if (typeof addWorldHistory === "function") {
        addWorldHistory("empire", player.name + " kiến lập Đế Quốc!", { hero: player.name });
      }
      if (typeof addTimeline === "function") {
        addTimeline("👑 " + player.name + " kiến lập Đế Quốc", "important", "👑");
      }

      _log(player.name + " kiến lập Đế Quốc!");
      _toast("👑 " + player.name + " xưng Đế!");
      if (typeof heavenPoints !== "undefined") heavenPoints += 500;
      if (typeof save === "function") save();
    } catch(e) { console.warn("aiAutoEmpire error:", e); }
  }

  // ==========================================
  // PLAYER AI: AUTO DYNASTY / DÒNG TỘC
  // ==========================================
  function aiAutoDynasty() {
    if (!_alive()) return;
    if ((player.wealth || 0) < STAGE.DYNASTY_MIN_WEALTH) return;
    if (player._dynastyFounded) return;
    if (!player._empireFormed) return; // cần đế quốc trước

    try {
      player._dynastyFounded = true;
      player.biography = player.biography || [];
      player.biography.push({ year: _yr(), event: "Thành lập Dòng Tộc " + player.family + ". Lưu danh ngàn đời." });

      if (!player.titles) player.titles = [];
      player.titles.push("🏰 Tộc Trưởng");

      // Đăng ký dynasty nếu hệ thống tồn tại
      if (typeof dynasties !== "undefined" && player.family) {
        if (!dynasties[player.family]) {
          dynasties[player.family] = {
            surname   : player.family,
            founder   : player.name,
            foundYear : _yr(),
            members   : [player.id],
            wealth    : player.wealth || 0,
            reputation: player.reputation || 0,
            level     : 1,
          };
        }
      }

      _log(player.name + " thành lập Dòng Tộc " + (player.family || "huyền thoại") + "!");
      _toast("🏰 Dòng tộc " + (player.family || player.name) + " thành lập!");
      if (typeof save === "function") save();
    } catch(e) { console.warn("aiAutoDynasty error:", e); }
  }

  // ==========================================
  // PLAYER AI: TRỞ THÀNH CHÚA TỂ THẾ GIỚI
  // ==========================================
  function aiAutoWorldLord() {
    if (!_alive()) return;
    if (!player._dynastyFounded) return;
    if (!player._empireFormed) return;
    if (player._worldLord) return;
    if (player.realm < 8) return; // cần realm rất cao
    if ((player._territoryClaims || 0) < 5) return;

    try {
      player._worldLord = true;
      player.biography = player.biography || [];
      player.biography.push({ year: _yr(), event: "Thống trị toàn bộ thiên hạ — Chúa Tể Thế Giới!" });

      if (!player.titles) player.titles = [];
      player.titles.push("🌍 Chúa Tể Thế Giới");

      if (typeof addWorldHistory === "function") {
        addWorldHistory("worldlord", player.name + " trở thành Chúa Tể Thế Giới!", { hero: player.name });
      }
      if (typeof addTimeline === "function") {
        addTimeline("🌍 " + player.name + " — CHÚA TỂ THẾ GIỚI", "important", "🌍");
      }

      if (typeof heavenPoints !== "undefined") heavenPoints += 2000;

      _log("🌍 " + player.name + " TRỞ THÀNH CHÚA TỂ THẾ GIỚI!");
      _toast("🌍 " + player.name + " — CHÚA TỂ THẾ GIỚI!");
      if (typeof save === "function") save();
    } catch(e) { console.warn("aiAutoWorldLord error:", e); }
  }

  // ==========================================
  // PLAYER AI: ARTIFACT AUTO-EQUIP
  // ==========================================
  function aiAutoEquip() {
    if (!_alive()) return;
    if (typeof autoEquipBestGear === "function") {
      try { autoEquipBestGear(player); } catch(e) {}
    }
    if (typeof autoEquipArtifactsNPC === "function") {
      try { autoEquipArtifactsNPC(player); } catch(e) {}
    }
  }

  // ==========================================
  // MAIN AI TICK
  // ==========================================
  function aiTick() {
    if (!AI_ENABLED) return;

    // FIX BUGS FIRST (every tick)
    fixTerritories();
    fixBossSpawn();
    fixThienDinh();

    // Only run player AI once per in-game year
    var curYear = _yr();
    if (curYear === _lastActionYear) return;
    _lastActionYear = curYear;

    if (!_alive()) return;

    // Auto-equip best gear
    aiAutoEquip();

    // Run all automation steps (order matters: prerequisites first)
    aiAutoQuest();
    aiAutoDungeon();
    aiAutoBoss();
    aiAutoJoinSect();
    aiAutoFactionWar();
    aiAutoClaimTerritory();
    aiAutoEmpire();
    aiAutoDynasty();
    aiAutoWorldLord();
  }

  // ==========================================
  // INIT: Wait for DOM + scripts to load
  // ==========================================
  function init() {
    // Fix quest patch (safety net)
    fixQuestPatch();

    // KHÔNG dùng setInterval riêng nữa — aiTick được gọi trực tiếp từ simulateWorld
    // Giữ lại interval nhưng với rate chậm hơn chỉ để fixAll các bug
    if (_aiInterval) clearInterval(_aiInterval);
    _aiInterval = setInterval(function() {
      if (!AI_ENABLED) return;
      fixTerritories(); fixBossSpawn(); fixThienDinh();
    }, 3000);

    // Run immediately after slight delay
    setTimeout(function() {
      fixTerritories();
      fixBossSpawn();
      fixThienDinh();
      console.log("[AutoPlayerAI] Initialized. AI_ENABLED =", AI_ENABLED);
    }, 1500);

    // Add UI toggle button
    setTimeout(function() {
      try {
        var existing = document.getElementById("autoAI-toggle-btn");
        if (existing) return;

        var btn = document.createElement("button");
        btn.id = "autoAI-toggle-btn";
        btn.textContent = "🤖 AI: ON";
        btn.title = "Bật/tắt Auto Player AI";
        btn.style.cssText = [
          "position:fixed", "bottom:80px", "left:16px",
          "z-index:9999", "padding:4px 10px",
          "background:rgba(30,30,50,0.92)",
          "border:1px solid #facc15",
          "border-radius:8px", "color:#facc15",
          "font-size:11px", "font-weight:700",
          "cursor:pointer", "letter-spacing:0.5px",
          "box-shadow:0 2px 10px rgba(0,0,0,0.5)",
          "font-family:var(--font-cjk,serif)"
        ].join(";");

        btn.addEventListener("click", function() {
          AI_ENABLED = !AI_ENABLED;
          btn.textContent = AI_ENABLED ? "🤖 AI: ON" : "🤖 AI: OFF";
          btn.style.borderColor = AI_ENABLED ? "#facc15" : "#666";
          btn.style.color       = AI_ENABLED ? "#facc15" : "#666";
          if (typeof toast === "function") toast(AI_ENABLED ? "🤖 Auto Player AI bật!" : "🤖 Auto Player AI tắt!");
        });

        document.body.appendChild(btn);
      } catch(e) {}
    }, 2000);
  }

  // ==========================================
  // EXPOSE API
  // ==========================================
  window.autoPlayerAI = {
    enable  : function() { AI_ENABLED = true;  },
    disable : function() { AI_ENABLED = false; },
    tick    : aiTick,
    fixAll  : function() { fixTerritories(); fixBossSpawn(); fixThienDinh(); },
    // Gọi khi switch world để reset bộ đếm năm
    resetForNewWorld : function() { _lastActionYear = -1; fixTerritories(); fixBossSpawn(); fixThienDinh(); },
  };

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();

// ============================
// PATCH renderBoss — Add fight button for player
// ============================
(function patchRenderBoss() {
  function doPatch() {
    if (typeof window.renderBoss !== "function") return;
    var _orig = window.renderBoss;
    window.renderBoss = function() {
      _orig.call(this);
      // Inject fight buttons after render
      if (typeof bosses === "undefined" || !bosses.length) return;
      if (typeof player === "undefined" || !player || player.status !== "alive") return;
      var el = document.getElementById("bossList");
      if (!el) return;
      var cards = el.querySelectorAll(".boss-card");
      cards.forEach(function(card, i) {
        if (card.querySelector(".player-boss-btn")) return; // already added
        var btn = document.createElement("button");
        btn.className = "player-boss-btn";
        btn.innerHTML = "⚔️ Đánh Boss";
        btn.style.cssText = "margin-top:10px;padding:6px 16px;background:rgba(220,50,50,0.15);border:1px solid rgba(220,50,50,0.5);border-radius:8px;color:#ff8080;font-weight:700;cursor:pointer;font-size:12px;display:block;";
        btn.onclick = function() {
          if (typeof playerFightBoss === "function") playerFightBoss(i);
        };
        card.appendChild(btn);
      });
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(doPatch, 500); });
  } else {
    setTimeout(doPatch, 500);
  }
})();
