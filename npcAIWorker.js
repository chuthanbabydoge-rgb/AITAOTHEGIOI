// npcAIWorker.js — Web Worker (KHÔNG phải IIFE, chạy trong Worker context)
// Không có window, DOM, localStorage — chỉ pure computation
// Giao tiếp với main thread qua postMessage

var WORKER_VERSION = "V83";

self.onmessage = function(e) {
  var msg = e.data;
  if (!msg || !msg.type) return;

  try {
    switch (msg.type) {

      case "PROCESS_NPC_AI":
        var npcResults = processNPCAI(msg.npcs || [], msg.world || {}, msg.year || 1);
        self.postMessage({ type: "NPC_AI_RESULTS", taskId: msg.taskId, results: npcResults, count: npcResults.length });
        break;

      case "PROCESS_ECONOMY":
        var econResult = processEconomy(msg.countries || [], msg.world || {}, msg.year || 1);
        self.postMessage({ type: "ECONOMY_RESULTS", taskId: msg.taskId, results: econResult });
        break;

      case "PROCESS_RELATIONSHIPS":
        var relResult = processRelationships(msg.npcs || [], msg.year || 1);
        self.postMessage({ type: "RELATIONSHIP_RESULTS", taskId: msg.taskId, results: relResult });
        break;

      case "PROCESS_HISTORY_SCORE":
        var histScore = processHistoryScore(msg.events || [], msg.year || 1);
        self.postMessage({ type: "HISTORY_SCORE_RESULTS", taskId: msg.taskId, results: histScore });
        break;

      case "PING":
        self.postMessage({ type: "PONG", taskId: msg.taskId, version: WORKER_VERSION, time: Date.now() });
        break;

      default:
        self.postMessage({ type: "UNKNOWN", taskId: msg.taskId, originalType: msg.type });
    }
  } catch(err) {
    self.postMessage({ type: "ERROR", taskId: msg.taskId, error: err.message });
  }
};

// ============================================================
// 1. NPC AI — Tính mood, happiness, migration intent, job need
// ============================================================
function processNPCAI(npcs, world, year) {
  var results = [];
  var worldPop = world.population || 1000;
  var worldWealth = world.wealth || 500;
  var wealthPerCapita = worldWealth / Math.max(worldPop, 1);

  for (var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];
    if (!npc || npc.dead) { results.push({ id: npc ? npc.id : i, skip: true }); continue; }

    var age = year - (npc.birthYear || year);
    var mood = npc.mood || 50;
    var happiness = npc.happiness || 50;
    var health = npc.health || 80;
    var food = npc.food || 60;
    var wealth = npc.wealth || 0;
    var power = npc.power || 10;

    // --- Mood Delta ---
    var moodDelta = 0;
    if (food > 80) moodDelta += 2;
    else if (food < 20) moodDelta -= 5;
    else if (food < 40) moodDelta -= 2;
    if (health > 70) moodDelta += 1;
    else if (health < 30) moodDelta -= 3;
    else if (health < 50) moodDelta -= 1;
    if (wealth > wealthPerCapita * 2) moodDelta += 1;
    else if (wealth < wealthPerCapita * 0.3) moodDelta -= 2;
    if (age > 70) moodDelta -= 0.5;
    if (npc.job && npc.job !== "none") moodDelta += 0.5;
    moodDelta = clamp(moodDelta, -10, 10);

    // --- Happiness Delta ---
    var happinessDelta = 0;
    if (mood > 60) happinessDelta += 1;
    else if (mood < 40) happinessDelta -= 1;
    if (power > 50) happinessDelta += 0.5;
    if (npc.isHero) happinessDelta += 1;
    happinessDelta = clamp(happinessDelta, -5, 5);

    // --- Health Delta ---
    var healthDelta = 0;
    if (food < 20) healthDelta -= 3;
    else if (food > 60) healthDelta += 0.5;
    if (age > 60) healthDelta -= (age - 60) * 0.05;
    if (age < 20) healthDelta += 0.3;
    healthDelta = clamp(healthDelta, -5, 3);

    // --- Job Need ---
    var needsJob = !npc.job || npc.job === "none" || npc.job === "";

    // --- Migration Intent ---
    var migrationScore = 0;
    if (happiness < 25) migrationScore += 0.05;
    if (happiness < 15) migrationScore += 0.05;
    if (food < 20) migrationScore += 0.03;
    if (health < 20) migrationScore += 0.04;
    var shouldMigrate = Math.random() < migrationScore;

    // --- Social Mobility ---
    var wealthDelta = 0;
    if (npc.job === "merchant") wealthDelta += randomRange(1, 5);
    else if (npc.job === "farmer") wealthDelta += randomRange(0, 2);
    else if (npc.job === "noble") wealthDelta += randomRange(2, 8);
    else if (npc.job === "warrior") wealthDelta += randomRange(0, 3);
    else if (npc.job === "scholar") wealthDelta += randomRange(1, 4);
    else wealthDelta += randomRange(-1, 2);
    if (food < 20) wealthDelta -= 2;

    // --- Power Growth ---
    var powerDelta = 0;
    if (npc.isHero) powerDelta += randomRange(0, 2);
    if (health > 70 && age < 40) powerDelta += 0.3;
    if (age > 60) powerDelta -= 0.2;

    results.push({
      id: npc.id,
      skip: false,
      moodDelta: Math.round(moodDelta * 10) / 10,
      happinessDelta: Math.round(happinessDelta * 10) / 10,
      healthDelta: Math.round(healthDelta * 10) / 10,
      wealthDelta: Math.round(wealthDelta * 10) / 10,
      powerDelta: Math.round(powerDelta * 10) / 10,
      needsJob: needsJob,
      shouldMigrate: shouldMigrate,
      age: Math.floor(age)
    });
  }
  return results;
}

// ============================================================
// 2. ECONOMY — Tính growth, inflation, trade balance per country
// ============================================================
function processEconomy(countries, world, year) {
  var results = [];
  var globalGrowth = world.econGrowth || 0.02;
  var inflation = world.inflation || 0.01;

  for (var i = 0; i < countries.length; i++) {
    var c = countries[i];
    if (!c) continue;
    var wealth = c.wealth || 100;
    var pop = c.population || 100;
    var stability = c.stability || 50;

    var growthRate = globalGrowth + (stability - 50) / 500;
    var tradeBonus = (c.tradeRoutes || 0) * 0.005;
    var newWealth = wealth * (1 + growthRate + tradeBonus - inflation);
    var wealthPerCap = newWealth / Math.max(pop, 1);

    results.push({
      id: c.id || c.name,
      wealthDelta: Math.round((newWealth - wealth) * 10) / 10,
      wealthPerCap: Math.round(wealthPerCap * 100) / 100,
      inflationImpact: Math.round(inflation * wealth * 10) / 10
    });
  }
  return results;
}

// ============================================================
// 3. RELATIONSHIPS — Tính điểm quan hệ NPC (drift theo thời gian)
// ============================================================
function processRelationships(npcs, year) {
  var results = [];
  var sample = npcs.length > 50 ? npcs.slice(0, 50) : npcs;
  for (var i = 0; i < sample.length; i++) {
    var npc = sample[i];
    if (!npc || npc.dead || !npc.relations) continue;
    var relUpdates = {};
    for (var otherId in npc.relations) {
      var score = npc.relations[otherId] || 0;
      var drift = (score > 0) ? -0.1 : 0.1;
      relUpdates[otherId] = Math.round((score + drift + randomRange(-0.5, 0.5)) * 10) / 10;
    }
    if (Object.keys(relUpdates).length > 0) {
      results.push({ id: npc.id, relUpdates: relUpdates });
    }
  }
  return results;
}

// ============================================================
// 4. HISTORY SCORE — Phân tích event log, tính điểm văn minh
// ============================================================
function processHistoryScore(events, year) {
  var warCount = 0, peaceCount = 0, crisisCount = 0, goldAge = 0;
  var recent = events.filter(function(e) { return e && (year - (e.year || 0)) < 50; });
  for (var i = 0; i < recent.length; i++) {
    var t = (recent[i].type || "").toLowerCase();
    if (t.indexOf("war") >= 0 || t.indexOf("battle") >= 0) warCount++;
    else if (t.indexOf("peace") >= 0 || t.indexOf("trade") >= 0) peaceCount++;
    else if (t.indexOf("disaster") >= 0 || t.indexOf("plague") >= 0) crisisCount++;
    else if (t.indexOf("golden") >= 0 || t.indexOf("renaissance") >= 0) goldAge++;
  }
  var civScore = 50 + (peaceCount * 3) - (warCount * 2) - (crisisCount * 4) + (goldAge * 5);
  return {
    warCount: warCount,
    peaceCount: peaceCount,
    crisisCount: crisisCount,
    goldenAgeCount: goldAge,
    civScore: Math.max(0, Math.min(100, civScore)),
    era: civScore > 80 ? "Thời Đại Hoàng Kim" : civScore > 60 ? "Thịnh Vượng" : civScore > 40 ? "Bình Thường" : civScore > 20 ? "Khó Khăn" : "Tăm Tối"
  };
}

// ============================================================
// Helpers
// ============================================================
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function randomRange(min, max) { return min + Math.random() * (max - min); }
