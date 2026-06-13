(function() {
"use strict";
// ============================================================
// INTEGRATION BRIDGES V61 — Creator God V6
// Kết nối 10 cặp hệ thống chưa được liên kết
// EXPAND ONLY · KHÔNG GHI ĐÈ bất kỳ file cũ nào
// Hoạt động bằng cách ĐỌC global state + GỌI public APIs
// ============================================================
const SAVE_KEY   = "cgv6_integration_bridges_v61";
const INIT_DELAY = 12100;
const TICK_INTERVAL = 50;

// ─── STATE ────────────────────────────────────────────────────
window.integrationBridgesV61Data = {
  version: "V61",
  bridges: {
    bossToFame:            { active:true, totalBridged:0, _processed:{} },
    eventToGuild:          { active:true, totalBridged:0, _processed:{} },
    causeEffectToCivHistory:{ active:true, totalBridged:0, _lastIdx:0 },
    seasonToProfession:    { active:true, totalBridged:0, _lastSeason:"" },
    bossToAchievement:     { active:true, totalBridged:0, _granted:{} },
    tradeWarSuspension:    { active:true, totalBridged:0, _suspended:{} },
    eventToCouncil:        { active:true, totalBridged:0, _processed:{} },
    bossToHistory:         { active:true, totalBridged:0, _processed:{} },
    healthEnhanced:        { active:true, totalBridged:0 },
    guildToPlayerCore:     { active:true, totalBridged:0, _lastGuildId:null }
  },
  log: [],
  totalConnections: 0,
  tickCount: 0
};

function save() {
  try {
    var slim = {
      version: window.integrationBridgesV61Data.version,
      bridges: {},
      totalConnections: window.integrationBridgesV61Data.totalConnections
    };
    // Save chỉ các counters, không save _processed (tránh quá nặng)
    var b = window.integrationBridgesV61Data.bridges;
    Object.keys(b).forEach(function(k) {
      slim.bridges[k] = { active: b[k].active, totalBridged: b[k].totalBridged };
      if (b[k]._lastIdx !== undefined) slim.bridges[k]._lastIdx = b[k]._lastIdx;
      if (b[k]._lastSeason !== undefined) slim.bridges[k]._lastSeason = b[k]._lastSeason;
      if (b[k]._lastGuildId !== undefined) slim.bridges[k]._lastGuildId = b[k]._lastGuildId;
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
  } catch(e) {}
}

function load() {
  try {
    var d = localStorage.getItem(SAVE_KEY);
    if (!d) return;
    var parsed = JSON.parse(d);
    if (parsed.totalConnections) window.integrationBridgesV61Data.totalConnections = parsed.totalConnections;
    if (parsed.bridges) {
      var b = window.integrationBridgesV61Data.bridges;
      Object.keys(parsed.bridges).forEach(function(k) {
        if (b[k]) {
          if (parsed.bridges[k].totalBridged !== undefined) b[k].totalBridged = parsed.bridges[k].totalBridged;
          if (parsed.bridges[k]._lastIdx !== undefined) b[k]._lastIdx = parsed.bridges[k]._lastIdx;
          if (parsed.bridges[k]._lastSeason !== undefined) b[k]._lastSeason = parsed.bridges[k]._lastSeason;
          if (parsed.bridges[k]._lastGuildId !== undefined) b[k]._lastGuildId = parsed.bridges[k]._lastGuildId;
        }
      });
    }
  } catch(e) {}
}

function logBridge(type, msg) {
  var log = window.integrationBridgesV61Data.log;
  log.unshift({ year: (typeof window.year === "number" ? window.year : 0), type: type, msg: msg });
  if (log.length > 80) log.length = 80;
  window.integrationBridgesV61Data.totalConnections++;
}

// ─── BRIDGE 1: V59 Boss Kills → V47 Fame ─────────────────────
// Gap: fameSystemV47 syncs heroLegendData nhưng không đọc worldBossV59Data
// Fix: boss kill → tăng fame của hero NPCs trong fameV47Data.fameProfiles
function bridgeBossToFame() {
  if (typeof window.worldBossV59Data === "undefined") return;
  if (typeof window.fameV47Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.bossToFame;
  var kills = window.worldBossV59Data.bossKills || [];
  kills.forEach(function(kill) {
    var key = kill.bossId + "_" + (kill.killedYear || kill.year || 0);
    if (b._processed[key]) return;
    b._processed[key] = true;
    // Tìm hero NPCs để trao danh tiếng
    var npcs = window.npcs || [];
    var heroes = npcs.filter(function(n) { return n && n.isHero && n.status === "alive"; });
    if (heroes.length === 0) return;
    var hero = heroes[Math.floor(Math.random() * heroes.length)];
    var heroId = hero.id;
    // Cập nhật fameV47Data.fameProfiles
    var profiles = window.fameV47Data.fameProfiles;
    if (!profiles[heroId]) {
      profiles[heroId] = { local:0, world:0, multiverse:0, archetype:"hero", isVillain:false };
    }
    profiles[heroId].world = (profiles[heroId].world || 0) + 400;
    profiles[heroId].local = (profiles[heroId].local || 0) + 200;
    // Cập nhật NPC fame trực tiếp để heroLegendData sync được
    hero.fame = (hero.fame || 0) + 400;
    b.totalBridged++;
    logBridge("Boss→Fame", (kill.bossName || kill.bossId) + " defeated → " + (hero.name || heroId) + " fame+400");
  });
}

// ─── BRIDGE 2: V59 Events → V53 Guild Reactions ───────────────
// Gap: guildCoreV53 / guildWarV53 hoàn toàn cô lập khỏi world events
// Fix: catastrophic events → guild treasury impact + mobilization log
function bridgeEventToGuild() {
  if (typeof window.eventSchedulerV59Data === "undefined") return;
  if (typeof window.guildV53Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.eventToGuild;
  var events = window.eventSchedulerV59Data.activeEvents || [];
  events.forEach(function(ev) {
    var key = (ev.defId || ev.id) + "_" + (ev.startYear || 0);
    if (b._processed[key]) return;
    b._processed[key] = true;
    var guild = window.guildV53Data;
    var defId = ev.defId || ev.id || "";
    // Thiên tai / Dịch bệnh → guild treasury mất 10% gold (phí cứu trợ)
    if (defId === "great_disaster" || defId === "great_plague") {
      var loss = Math.floor((guild.treasury.gold || 0) * 0.1);
      if (loss > 0) {
        guild.treasury.gold = Math.max(0, (guild.treasury.gold || 0) - loss);
        guild.log = guild.log || [];
        guild.log.unshift({
          year: (typeof window.year === "number" ? window.year : 0),
          msg: "⚠️ [V61] " + (defId === "great_disaster" ? "Thiên tai" : "Đại dịch") + " — quỹ khẩn cấp -" + loss + " vàng",
          type: "warning"
        });
        b.totalBridged++;
        logBridge("Event→Guild", defId + " → treasury -" + loss + " gold");
      }
    }
    // Đại chiến → guild ghi nhận tình trạng chiến tranh
    if (defId === "world_war") {
      guild.log = guild.log || [];
      guild.log.unshift({
        year: (typeof window.year === "number" ? window.year : 0),
        msg: "⚔️ [V61] Đại Chiến Toàn Cầu bùng nổ — bang hội chuẩn bị phòng thủ",
        type: "alert"
      });
      b.totalBridged++;
      logBridge("Event→Guild", "world_war → guild mobilization alert");
    }
    // Kỷ Nguyên Vàng → guild treasury bonus
    if (defId === "golden_era") {
      var bonus = 500;
      guild.treasury.gold = (guild.treasury.gold || 0) + bonus;
      guild.log = guild.log || [];
      guild.log.unshift({
        year: (typeof window.year === "number" ? window.year : 0),
        msg: "✨ [V61] Kỷ Nguyên Vàng — thu nhập bang hội tăng vọt +" + bonus + " vàng",
        type: "success"
      });
      b.totalBridged++;
      logBridge("Event→Guild", "golden_era → guild treasury +" + bonus + " gold");
    }
  });
  // Boss kill → guild award
  var bossKills = (window.worldBossV59Data || {}).bossKills || [];
  bossKills.forEach(function(kill) {
    var key = "bossGuild_" + (kill.bossId) + "_" + (kill.killedYear || kill.year || 0);
    if (b._processed[key]) return;
    b._processed[key] = true;
    var guild = window.guildV53Data;
    var reward = 2000;
    guild.treasury.gold = (guild.treasury.gold || 0) + reward;
    guild.stats = guild.stats || {};
    guild.stats.goldEarned = (guild.stats.goldEarned || 0) + reward;
    guild.log = guild.log || [];
    guild.log.unshift({
      year: (typeof window.year === "number" ? window.year : 0),
      msg: "🐲 [V61] Boss " + (kill.bossName || kill.bossId) + " bị tiêu diệt — bang hội nhận thưởng +" + reward + " vàng",
      type: "success"
    });
    b.totalBridged++;
    logBridge("Boss→Guild", (kill.bossName || kill.bossId) + " → guild +" + reward + " gold");
  });
}

// ─── BRIDGE 3: V60 CauseEffect Chains → V58 CivHistory ────────
// Gap: civHistoryInfluenceV58 hoàn toàn độc lập, không nhận V60 data
// Fix: mỗi chain history entry → ch58RecordEvent()
function bridgeCauseEffectToCivHistory() {
  if (typeof window.causeEffectV60Data === "undefined") return;
  if (typeof window.ch58RecordEvent !== "function") return;
  var b = window.integrationBridgesV61Data.bridges.causeEffectToCivHistory;
  var history = window.causeEffectV60Data.chainHistory || [];
  for (var i = b._lastIdx; i < history.length; i++) {
    var chain = history[i];
    if (!chain) continue;
    // Map chain type → civHistory event type
    var typeId = "war";
    if (chain.chainId && chain.chainId.indexOf("disaster") >= 0) typeId = "crisis";
    else if (chain.chainId && chain.chainId.indexOf("golden") >= 0) typeId = "golden_age";
    else if (chain.chainId && chain.chainId.indexOf("religion") >= 0) typeId = "religion";
    else if (chain.chainId && chain.chainId.indexOf("economy") >= 0) typeId = "cultural";
    else if (chain.chainId && chain.chainId.indexOf("multiverse") >= 0) typeId = "ai_interact";
    // Impact scores
    var impact = {
      military:  (typeId === "war") ? 15 : (typeId === "crisis" ? 5 : 0),
      economic:  (typeId === "golden_age") ? 20 : (typeId === "cultural" ? 10 : (typeId === "crisis" ? -10 : 0)),
      cultural:  (typeId === "golden_age") ? 15 : (typeId === "cultural" ? 15 : 0),
      religious: (typeId === "religion") ? 20 : 0
    };
    var title = "🔗 Nhân Quả: " + (chain.label || chain.chainId || "Chuỗi V60");
    var desc  = "V60 Chuỗi Nhân Quả [" + (chain.chainId || "?") + "] kích hoạt năm " + (chain.year || 0);
    try {
      window.ch58RecordEvent(typeId, title, desc, impact);
    } catch(e) {}
    b._lastIdx = i + 1;
    b.totalBridged++;
    logBridge("CauseEffect→CivHistory", chain.chainId + " → civHistory " + typeId);
  }
}

// ─── BRIDGE 4: V59 Season → V50 Profession Bonuses ────────────
// Gap: professionSystemV50 statBonus hardcoded, không đọc communityEventV59Data
// Fix: season change → pec52AddCurrency bonus cho nghề phù hợp
function bridgeSeasonToProfession() {
  if (typeof window.communityEventV59Data === "undefined") return;
  if (typeof window.pec52AddCurrency !== "function") return;
  if (typeof window.professionV50Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.seasonToProfession;
  var season = window.communityEventV59Data.currentSeason || "";
  if (!season || season === b._lastSeason) return;
  b._lastSeason = season;
  // Profession-season mapping
  var SEASON_MAP = {
    "spring": { prof:"scholar",  amount:300, icon:"🌸", label:"Mùa Xuân" },
    "summer": { prof:"warrior",  amount:400, icon:"☀️", label:"Chiến Dịch Hè" },
    "autumn": { prof:"merchant", amount:500, icon:"🍂", label:"Mùa Thu Hoạch" },
    "winter": { prof:"scholar",  amount:350, icon:"❄️", label:"Đông Chí" }
  };
  var mapping = SEASON_MAP[season];
  if (!mapping) return;
  // Kiểm tra player có đang dùng nghề phù hợp không
  var currentProf = window.professionV50Data.currentProfession || "";
  var bonusAmt = currentProf === mapping.prof ? mapping.amount : Math.floor(mapping.amount * 0.3);
  window.pec52AddCurrency("dong", bonusAmt, mapping.icon + " Bonus " + mapping.label + " [V61 Bridge]");
  if (typeof window.htAddEvent === "function") {
    window.htAddEvent({
      year: (typeof window.year === "number" ? window.year : 0),
      type: "player",
      title: mapping.icon + " Mùa mới: " + mapping.label + " — nghề " + (currentProf || "?") + " nhận +" + bonusAmt + " đồng",
      color: "#fbbf24"
    });
  }
  b.totalBridged++;
  logBridge("Season→Profession", season + " → prof " + (currentProf || "?") + " +" + bonusAmt + " dong");
}

// ─── BRIDGE 5: V59 Boss Kills / Events → V50 Achievements ─────
// Gap: achievementV50Data không check worldBossV59Data hay eventArchiveV59Data
// Fix: inject vào achievementV50Data.unlocked khi đủ điều kiện
function bridgeBossToAchievement() {
  if (typeof window.achievementV50Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.bossToAchievement;
  var ach = window.achievementV50Data;
  var yr  = (typeof window.year === "number" ? window.year : 0);

  function grantAch(id, name, icon, xp, fame, desc) {
    if (b._granted[id]) return;
    if (ach.unlocked && ach.unlocked.find(function(u) { return u.id === id; })) { b._granted[id]=true; return; }
    b._granted[id] = true;
    ach.unlocked = ach.unlocked || [];
    ach.unlocked.push({ id:id, year:yr, reward:{ xp:xp, fame:fame } });
    ach.points = (ach.points || 0) + xp;
    if (typeof window.playerAddXP === "function") window.playerAddXP(xp, "achievement_v61");
    if (typeof window.playerAddFame === "function") window.playerAddFame(fame);
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year:yr, type:"player", title:"🏆 Thành Tựu V61: " + name, color:"#fbbf24" });
    }
    b.totalBridged++;
    logBridge("Boss→Achievement", id + " '" + name + "' granted");
  }

  // Thành tựu: Diệt boss đầu tiên
  var bossKills = (window.worldBossV59Data || {}).bossKills || [];
  if (bossKills.length >= 1) {
    grantAch("v61_first_boss_kill", "Thợ Săn Boss", "🐉", 500, 200, "Lần đầu tiên tham gia tiêu diệt World Boss");
  }
  if (bossKills.length >= 3) {
    grantAch("v61_boss_veteran",   "Cựu Chiến Binh Boss", "👹", 1200, 500, "Đã tham gia diệt 3 World Boss");
  }
  if (bossKills.length >= 5) {
    grantAch("v61_boss_legend",    "Huyền Thoại Boss Slayer", "⭐", 3000, 1000, "Tiêu diệt 5 World Boss — huyền thoại bất diệt");
  }

  // Thành tựu: Tham gia nhiều sự kiện
  var totalEvents = ((window.eventArchiveV59Data || {}).archive || []).length;
  if (totalEvents >= 3) {
    grantAch("v61_event_initiate", "Người Chứng Kiến", "📅", 300, 100, "Thế giới đã trải qua 3 sự kiện lớn");
  }
  if (totalEvents >= 8) {
    grantAch("v61_event_veteran",  "Nhân Chứng Lịch Sử", "📜", 800, 300, "Thế giới đã trải qua 8 sự kiện lớn");
  }

  // Thành tựu: Có guild mạnh (V53 bridge)
  if (typeof window.guildV53Data !== "undefined" && window.guildV53Data.hq && window.guildV53Data.hq.level >= 3) {
    grantAch("v61_guild_lord", "Hội Chủ Bá Đạo", "🏰", 1000, 400, "Xây dựng trụ sở bang hội lên cấp 3");
  }

  // Thành tựu: Có tuyến thương mại chạy
  if (typeof window.tradeNetV54Data !== "undefined") {
    var activeRoutes = (window.tradeNetV54Data.routes || []).filter(function(r) { return r.status === "active"; });
    if (activeRoutes.length >= 2) {
      grantAch("v61_trade_mogul", "Đại Thương Nhân", "🛤️", 700, 250, "Thiết lập 2 tuyến thương mại hoạt động");
    }
  }
}

// ─── BRIDGE 6: V54 Trade Routes ↔ warsActive (War Suspension) ──
// Gap: tradeNetworkCoreV54 chỉ có 5% random war event, KHÔNG đình chỉ route
// Fix: route liên quan quốc gia đang tham chiến → income ×0.3
function bridgeTradeWarSuspension() {
  if (typeof window.tradeNetV54Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.tradeWarSuspension;
  var wars = window.warsActive || [];
  // Tập hợp các quốc gia đang có chiến tranh
  var warSet = {};
  wars.forEach(function(w) {
    if (w.attacker) warSet[w.attacker] = true;
    if (w.defender) warSet[w.defender] = true;
  });
  var routes = window.tradeNetV54Data.routes || [];
  routes.forEach(function(route) {
    if (!route || !route.id) return;
    var fromWar = route.from && warSet[route.from];
    var toWar   = route.to   && warSet[route.to];
    var inWar   = fromWar || toWar;
    if (inWar && !route._v61WarSuspended) {
      // Đình chỉ — giảm income 70%
      route._v61WarSuspended = true;
      route._v61OriginalIncome = route.income || 0;
      route.income = Math.floor((route.income || 0) * 0.3);
      b.totalBridged++;
      logBridge("Trade→War", route.id + ": war zone (" + (route.from||"?") + "↔" + (route.to||"?") + ") → income -70%");
    } else if (!inWar && route._v61WarSuspended) {
      // Hòa bình — phục hồi income
      route.income = route._v61OriginalIncome || route.income;
      route._v61WarSuspended = false;
      logBridge("Trade→War", route.id + ": peace restored → income restored");
    }
  });
}

// ─── BRIDGE 7: V59 Events → V24 WorldCouncil Emergency Session ─
// Gap: worldCouncilEngine chỉ hop mỗi 20 năm, không phản ứng V59 events
// Fix: catastrophic events → wcHoldSession() khẩn cấp
function bridgeEventToCouncil() {
  if (typeof window.worldCouncilData === "undefined") return;
  if (!window.worldCouncilData.founded) return;
  if (typeof window.wcHoldSession !== "function") return;
  var b = window.integrationBridgesV61Data.bridges.eventToCouncil;
  var yr = (typeof window.year === "number" ? window.year : 0);
  // Kiểm tra thời gian session gần nhất (không họp quá thường xuyên — min 5 năm)
  var sessions = window.worldCouncilData.sessions || [];
  var lastSession = sessions[sessions.length - 1];
  if (lastSession && (yr - (lastSession.year || 0)) < 5) return;
  // Tìm V59 event thảm họa chưa được xử lý
  var activeEvents = (window.eventSchedulerV59Data || {}).activeEvents || [];
  var catastrophic = null;
  for (var i = 0; i < activeEvents.length; i++) {
    var ev = activeEvents[i];
    var defId = ev.defId || ev.id || "";
    var key = defId + "_council_" + (ev.startYear || 0);
    if (!b._processed[key] && (defId === "world_war" || defId === "great_disaster" || defId === "great_plague" || defId === "multiverse_rift")) {
      b._processed[key] = true;
      catastrophic = ev;
      break;
    }
  }
  // Boss kill → council celebratory session
  var bossKills = (window.worldBossV59Data || {}).bossKills || [];
  for (var j = 0; j < bossKills.length; j++) {
    var kill = bossKills[j];
    var killKey = "boss_council_" + (kill.bossId) + "_" + (kill.killedYear || kill.year || 0);
    if (!b._processed[killKey]) {
      b._processed[killKey] = true;
      catastrophic = { defId: "boss_kill", bossName: kill.bossName, startYear: kill.killedYear || kill.year || 0 };
      break;
    }
  }
  if (catastrophic) {
    try {
      window.wcHoldSession();
      b.totalBridged++;
      logBridge("Event→Council", (catastrophic.defId || "event") + " → emergency council session called yr=" + yr);
    } catch(e) {}
  }
}

// ─── BRIDGE 8: V59 Boss Kills + V60 Narratives → V55 HistoricalReplay
// Gap: historicalReplaySystem.js không ghi boss kills hay V60 chronicles
// Fix: dùng hrs55RecordEvent({year, category, icon, title, detail, importance})
function bridgeBossToHistory() {
  if (typeof window.hrs55RecordEvent !== "function") return;
  var b = window.integrationBridgesV61Data.bridges.bossToHistory;
  // Boss kills → historical record
  var bossKills = (window.worldBossV59Data || {}).bossKills || [];
  bossKills.forEach(function(kill) {
    var key = "hist_boss_" + (kill.bossId) + "_" + (kill.killedYear || kill.year || 0);
    if (b._processed[key]) return;
    b._processed[key] = true;
    window.hrs55RecordEvent({
      year:       kill.killedYear || kill.year || (typeof window.year === "number" ? window.year : 0),
      category:   "boss_kill",
      icon:       "🐲",
      title:      "World Boss bị tiêu diệt: " + (kill.bossName || kill.bossId || "Quái Thú Vô Danh"),
      detail:     "V59 World Boss System — Boss cấp cao nhất đã bị đánh bại",
      importance: 5
    });
    b.totalBridged++;
    logBridge("Boss→History", (kill.bossName || kill.bossId) + " → hrs55 boss_kill recorded");
  });
  // V60 Chronicles → historical record
  var chronicles = (window.worldNarrativeV60Data || {}).chronicles || [];
  chronicles.forEach(function(chronicle) {
    var key = "hist_chronicle_" + (chronicle.id || chronicle.year || Math.random());
    if (!chronicle.id) { chronicle.id = "chr_" + Date.now(); }
    var key2 = "hist_chronicle_" + chronicle.id;
    if (b._processed[key2]) return;
    b._processed[key2] = true;
    window.hrs55RecordEvent({
      year:       chronicle.year || (typeof window.year === "number" ? window.year : 0),
      category:   "chronicle",
      icon:       "📖",
      title:      chronicle.title || "Biên Niên Ký Thế Giới",
      detail:     chronicle.content || (chronicle.summary || "V60 World Narrative — Biên niên ký tự động"),
      importance: 3
    });
    b.totalBridged++;
    logBridge("Narrative→History", (chronicle.title || "chronicle") + " → hrs55 chronicle recorded");
  });
  // V60 TurningPoints → historical record
  var turningPoints = (window.worldNarrativeV60Data || {}).turningPoints || [];
  turningPoints.forEach(function(tp) {
    if (!tp.id) tp.id = "tp_" + Date.now() + "_" + Math.random();
    var tpKey = "hist_tp_" + tp.id;
    if (b._processed[tpKey]) return;
    b._processed[tpKey] = true;
    window.hrs55RecordEvent({
      year:       tp.year || (typeof window.year === "number" ? window.year : 0),
      category:   "chronicle",
      icon:       "🔀",
      title:      "Bước Ngoặt: " + (tp.title || "Nhân Quả V60"),
      detail:     tp.content || "V60 Cause-Effect turning point",
      importance: 4
    });
    b.totalBridged++;
    logBridge("TurningPoint→History", (tp.title || "tp") + " → hrs55 recorded");
  });
}

// ─── BRIDGE 9: Universe Health Enhanced (V55 + V53/V54/V59) ────
// Gap: universeHealthSystem chỉ dùng kingdoms/empires — thiếu guild/trade/events
// Fix: inject supplementary data vào univHealthData._v61* (V60 Analytics đọc được)
function bridgeHealthEnhanced() {
  if (typeof window.univHealthData === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.healthEnhanced;
  var h = window.univHealthData;
  // Tính V53 Guild contribution → gắn vào _v61GuildScore
  if (typeof window.guildV53Data !== "undefined") {
    var hqLevel = (window.guildV53Data.hq || {}).level || 1;
    var memberCount = (window.guildV53Data.members || []).length;
    h._v61GuildScore = Math.min(100, 20 + hqLevel * 8 + memberCount * 3);
  }
  // Tính V54 Trade contribution → gắn vào _v61TradeScore
  if (typeof window.tradeNetV54Data !== "undefined") {
    var activeRoutes = (window.tradeNetV54Data.routes || []).filter(function(r) { return r && r.status === "active"; });
    h._v61TradeScore = Math.min(100, 25 + activeRoutes.length * 7);
  }
  // Tính V59 Event Activity → gắn vào _v61EventScore
  if (typeof window.eventArchiveV59Data !== "undefined") {
    var archivedCount = (window.eventArchiveV59Data.archive || []).length;
    h._v61EventScore = Math.min(100, 30 + archivedCount * 3);
  }
  // Tính V53 Guild Wars → gắn vào _v61GuildWarScore
  if (typeof window.guildWarV53Data !== "undefined") {
    var guildWins = (window.guildWarV53Data.completedWars || []).filter(function(w) { return w.result === "win"; }).length;
    h._v61GuildWarScore = Math.min(100, 30 + guildWins * 10);
  }
  // Tổng hợp enhanced score
  var extras = [];
  if (h._v61GuildScore  !== undefined) extras.push(h._v61GuildScore);
  if (h._v61TradeScore  !== undefined) extras.push(h._v61TradeScore);
  if (h._v61EventScore  !== undefined) extras.push(h._v61EventScore);
  if (extras.length > 0) {
    var avgExtra = Math.floor(extras.reduce(function(a,x){return a+x;},0) / extras.length);
    // Boost overall score nhẹ (nếu univHealthData có overall property)
    if (h.overall !== undefined) {
      h._v61EnhancedOverall = Math.min(100, Math.floor((h.overall * 0.7 + avgExtra * 0.3)));
    }
  }
  b.totalBridged++;
}

// ─── BRIDGE 10: Guild V53 → playerCoreV50 Affiliation Sync ─────
// Gap: playerCoreV50Data.affiliations.guild = null dù player đã tạo guild V53
// Fix: khi guildV53Data.playerGuildId exists → sync playerCoreV50Data.affiliations.guild
function bridgeGuildToPlayerCore() {
  if (typeof window.guildV53Data === "undefined") return;
  if (typeof window.playerCoreV50Data === "undefined") return;
  var b = window.integrationBridgesV61Data.bridges.guildToPlayerCore;
  var guildId = window.guildV53Data.playerGuildId || null;
  if (guildId === b._lastGuildId) return;
  b._lastGuildId = guildId;
  if (!window.playerCoreV50Data.affiliations) {
    window.playerCoreV50Data.affiliations = {};
  }
  if (guildId) {
    // Lấy tên guild từ V29
    var guildName = guildId;
    if (typeof window.guildV29Data !== "undefined") {
      var guilds = Array.isArray(window.guildV29Data.guilds)
        ? window.guildV29Data.guilds
        : Object.values(window.guildV29Data.guilds || {});
      var found = guilds.find(function(g) { return g.id === guildId; });
      if (found) guildName = (found.icon || "🏛️") + " " + (found.name || guildId);
    }
    window.playerCoreV50Data.affiliations.guild = guildName;
    b.totalBridged++;
    logBridge("Guild→PlayerCore", "guild affiliation synced: " + guildName);
  } else {
    window.playerCoreV50Data.affiliations.guild = null;
  }
}

// ─── MASTER TICK ─────────────────────────────────────────────
window.integrationBridgesV61Tick = function() {
  var d = window.integrationBridgesV61Data;
  d.tickCount = (d.tickCount || 0) + 1;
  if (d.tickCount % TICK_INTERVAL !== 0) return;
  bridgeBossToFame();
  bridgeEventToGuild();
  bridgeCauseEffectToCivHistory();
  bridgeSeasonToProfession();
  bridgeBossToAchievement();
  bridgeTradeWarSuspension();
  bridgeEventToCouncil();
  bridgeBossToHistory();
  bridgeHealthEnhanced();
  bridgeGuildToPlayerCore();
  if (d.tickCount % (TICK_INTERVAL * 10) === 0) save();
};

// ─── PUBLIC API ───────────────────────────────────────────────
window.ib61GetLog     = function() { return window.integrationBridgesV61Data.log; };
window.ib61GetStats   = function() { return window.integrationBridgesV61Data; };
window.ib61GetBridges = function() { return window.integrationBridgesV61Data.bridges; };
window.ib61ForceRun   = function() {
  bridgeBossToFame();
  bridgeEventToGuild();
  bridgeCauseEffectToCivHistory();
  bridgeSeasonToProfession();
  bridgeBossToAchievement();
  bridgeTradeWarSuspension();
  bridgeEventToCouncil();
  bridgeBossToHistory();
  bridgeHealthEnhanced();
  bridgeGuildToPlayerCore();
  save();
  return window.integrationBridgesV61Data;
};

// ─── INIT ─────────────────────────────────────────────────────
function init() {
  load();
  var _orig = window.gameTick;
  window.gameTick = function() {
    if (_orig) _orig();
    window.integrationBridgesV61Tick();
  };
  var totalBridgesFn = Object.keys(window.integrationBridgesV61Data.bridges).length;
  console.log(
    "[IntegrationBridgesV61] 🔗 " + totalBridgesFn + " cầu nối · " +
    window.integrationBridgesV61Data.totalConnections + " kết nối tích lũy · " +
    "Runs mỗi " + TICK_INTERVAL + " tick · V61 khởi động thành công."
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_DELAY); });
} else {
  setTimeout(init, INIT_DELAY);
}

})();
