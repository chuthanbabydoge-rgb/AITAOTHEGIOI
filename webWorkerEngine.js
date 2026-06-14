(function() {
  "use strict";
  const SAVE_KEY = "cgv6_web_worker_v83";

  window.webWorkerV83Data = {
    supported: typeof Worker !== "undefined",
    worker: null,
    workerReady: false,
    taskIdCounter: 0,
    pendingTasks: {},
    stats: {
      tasksDispatched: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      npcBatchesProcessed: 0,
      econBatchesProcessed: 0,
      avgProcessTimeMs: 0,
      totalTimeSaved: 0,
      lastNPCBatchMs: 0
    },
    config: {
      npcBatchInterval: 10,
      econBatchInterval: 30,
      maxNPCPerBatch: 150,
      enabled: true
    },
    processTimes: []
  };

  var _tickCount = 0;
  var _lastNPCBatchTime = 0;

  // ============================================================
  // 1. Khởi tạo Worker
  // ============================================================
  function createWorker() {
    if (!window.webWorkerV83Data.supported) {
      console.warn("[WebWorker V83] Trình duyệt không hỗ trợ Web Worker — chạy fallback mode.");
      return;
    }
    try {
      var worker = new Worker("npcAIWorker.js");
      worker.onmessage = handleWorkerMessage;
      worker.onerror = function(e) {
        console.error("[WebWorker V83] Worker error:", e.message);
        window.webWorkerV83Data.stats.tasksFailed++;
        window.webWorkerV83Data.workerReady = false;
        // Auto-respawn sau 3 giây
        setTimeout(createWorker, 3000);
      };
      // Ping để xác nhận worker sẵn sàng
      worker.postMessage({ type: "PING", taskId: "init-ping" });
      window.webWorkerV83Data.worker = worker;
    } catch(e) {
      console.warn("[WebWorker V83] Không thể tạo worker:", e.message);
      window.webWorkerV83Data.supported = false;
    }
  }

  // ============================================================
  // 2. Xử lý message từ Worker
  // ============================================================
  function handleWorkerMessage(e) {
    var msg = e.data;
    if (!msg) return;
    var d = window.webWorkerV83Data;

    switch (msg.type) {
      case "PONG":
        d.workerReady = true;
        console.log("[WebWorker V83] Worker sẵn sàng. Version:", msg.version);
        break;

      case "NPC_AI_RESULTS":
        applyNPCAIResults(msg.results || []);
        d.stats.npcBatchesProcessed++;
        d.stats.tasksCompleted++;
        finishTask(msg.taskId);
        break;

      case "ECONOMY_RESULTS":
        applyEconomyResults(msg.results || []);
        d.stats.econBatchesProcessed++;
        d.stats.tasksCompleted++;
        finishTask(msg.taskId);
        break;

      case "RELATIONSHIP_RESULTS":
        applyRelationshipResults(msg.results || []);
        d.stats.tasksCompleted++;
        finishTask(msg.taskId);
        break;

      case "HISTORY_SCORE_RESULTS":
        applyHistoryScore(msg.results);
        d.stats.tasksCompleted++;
        finishTask(msg.taskId);
        break;

      case "ERROR":
        console.warn("[WebWorker V83] Task error [" + msg.taskId + "]:", msg.error);
        d.stats.tasksFailed++;
        finishTask(msg.taskId);
        break;
    }
  }

  function finishTask(taskId) {
    var d = window.webWorkerV83Data;
    var task = d.pendingTasks[taskId];
    if (task) {
      var elapsed = Date.now() - task.startTime;
      d.processTimes.push(elapsed);
      if (d.processTimes.length > 20) d.processTimes.shift();
      d.stats.avgProcessTimeMs = Math.round(d.processTimes.reduce(function(a, b) { return a + b; }, 0) / d.processTimes.length);
      delete d.pendingTasks[taskId];
    }
  }

  // ============================================================
  // 3. Apply Results về main thread
  // ============================================================
  function applyNPCAIResults(results) {
    var npcs = window.npcs;
    if (!npcs || !npcs.length) return;

    // Build lookup map từ id → npc index (chỉ build 1 lần mỗi batch)
    var idMap = {};
    for (var i = 0; i < npcs.length; i++) {
      if (npcs[i] && npcs[i].id !== undefined) idMap[npcs[i].id] = i;
    }

    var applied = 0;
    for (var j = 0; j < results.length; j++) {
      var r = results[j];
      if (!r || r.skip) continue;
      var idx = idMap[r.id];
      if (idx === undefined) continue;
      var npc = npcs[idx];
      if (!npc || npc.dead) continue;

      if (r.moodDelta) npc.mood = Math.max(0, Math.min(100, (npc.mood || 50) + r.moodDelta));
      if (r.happinessDelta) npc.happiness = Math.max(0, Math.min(100, (npc.happiness || 50) + r.happinessDelta));
      if (r.healthDelta) npc.health = Math.max(0, Math.min(100, (npc.health || 80) + r.healthDelta));
      if (r.wealthDelta) npc.wealth = Math.max(0, (npc.wealth || 0) + r.wealthDelta);
      if (r.powerDelta) npc.power = Math.max(0, Math.min(100, (npc.power || 10) + r.powerDelta));
      if (r.age !== undefined) npc.ageCalculated = r.age;
      applied++;
    }
    window.webWorkerV83Data.stats.lastNPCBatchMs = Date.now() - _lastNPCBatchTime;
    if (typeof window.npcCacheInvalidate === "function") window.npcCacheInvalidate();
  }

  function applyEconomyResults(results) {
    var countries = window.countries;
    if (!countries || !countries.length) return;
    var nameMap = {};
    for (var i = 0; i < countries.length; i++) {
      if (countries[i]) {
        nameMap[countries[i].id || countries[i].name] = i;
      }
    }
    for (var j = 0; j < results.length; j++) {
      var r = results[j];
      if (!r) continue;
      var idx = nameMap[r.id];
      if (idx === undefined) continue;
      var c = countries[idx];
      if (!c) continue;
      if (r.wealthDelta) c.wealth = Math.max(0, (c.wealth || 0) + r.wealthDelta);
      if (r.wealthPerCap !== undefined) c.wealthPerCapita = r.wealthPerCap;
    }
  }

  function applyRelationshipResults(results) {
    var npcs = window.npcs;
    if (!npcs || !npcs.length) return;
    var idMap = {};
    for (var i = 0; i < npcs.length; i++) {
      if (npcs[i] && npcs[i].id !== undefined) idMap[npcs[i].id] = i;
    }
    for (var j = 0; j < results.length; j++) {
      var r = results[j];
      if (!r || !r.relUpdates) continue;
      var idx = idMap[r.id];
      if (idx === undefined) continue;
      var npc = npcs[idx];
      if (!npc) continue;
      if (!npc.relations) npc.relations = {};
      for (var otherId in r.relUpdates) {
        npc.relations[otherId] = r.relUpdates[otherId];
      }
    }
  }

  function applyHistoryScore(result) {
    if (!result) return;
    if (window.world) {
      window.world.civScore = result.civScore;
      window.world.currentEra = result.era;
    }
    window.webWorkerV83Data.lastHistoryScore = result;
  }

  // ============================================================
  // 4. Dispatch Tasks
  // ============================================================
  function nextTaskId(type) {
    window.webWorkerV83Data.taskIdCounter++;
    return type + "_" + window.webWorkerV83Data.taskIdCounter;
  }

  function dispatch(payload) {
    var d = window.webWorkerV83Data;
    if (!d.worker || !d.workerReady || !d.config.enabled) return false;
    var taskId = payload.taskId || nextTaskId(payload.type);
    payload.taskId = taskId;
    d.pendingTasks[taskId] = { type: payload.type, startTime: Date.now() };
    d.stats.tasksDispatched++;
    d.worker.postMessage(payload);
    return true;
  }

  window.ww83DispatchNPCAI = function() {
    var npcs = window.npcs || [];
    if (!npcs.length) return;
    var cfg = window.webWorkerV83Data.config;
    var taskId = nextTaskId("NPC_AI");
    var batch = npcs.length > cfg.maxNPCPerBatch ? npcs.slice(0, cfg.maxNPCPerBatch) : npcs;
    var world = { population: (window.world || {}).population, wealth: (window.world || {}).wealth, econGrowth: (window.world || {}).econGrowth };
    _lastNPCBatchTime = Date.now();
    dispatch({ type: "PROCESS_NPC_AI", taskId: taskId, npcs: JSON.parse(JSON.stringify(batch)), world: world, year: window.year || 1 });
  };

  window.ww83DispatchEconomy = function() {
    var countries = window.countries || [];
    if (!countries.length) return;
    dispatch({ type: "PROCESS_ECONOMY", taskId: nextTaskId("ECON"), countries: JSON.parse(JSON.stringify(countries.slice(0, 30))), world: window.world || {}, year: window.year || 1 });
  };

  window.ww83DispatchHistoryScore = function() {
    var events = [];
    if (window.historicalTimeline && window.historicalTimeline.events) events = window.historicalTimeline.events.slice(-200);
    else if (window.htData && window.htData.events) events = window.htData.events.slice(-200);
    dispatch({ type: "PROCESS_HISTORY_SCORE", taskId: nextTaskId("HIST"), events: JSON.parse(JSON.stringify(events)), year: window.year || 1 });
  };

  window.ww83TerminateWorker = function() {
    if (window.webWorkerV83Data.worker) {
      window.webWorkerV83Data.worker.terminate();
      window.webWorkerV83Data.worker = null;
      window.webWorkerV83Data.workerReady = false;
      console.log("[WebWorker V83] Worker terminated.");
    }
  };

  window.ww83RestartWorker = function() {
    window.ww83TerminateWorker();
    setTimeout(createWorker, 500);
  };

  window.ww83GetStatus = function() {
    var d = window.webWorkerV83Data;
    return {
      supported: d.supported,
      ready: d.workerReady,
      enabled: d.config.enabled,
      pending: Object.keys(d.pendingTasks).length,
      stats: d.stats
    };
  };

  // ============================================================
  // 5. Hook vào gameTick — dispatch batches theo interval
  // ============================================================
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ stats: window.webWorkerV83Data.stats, config: window.webWorkerV83Data.config }));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var parsed = JSON.parse(d);
        if (parsed.stats) window.webWorkerV83Data.stats = Object.assign(window.webWorkerV83Data.stats, parsed.stats);
        if (parsed.config) window.webWorkerV83Data.config = Object.assign(window.webWorkerV83Data.config, parsed.config);
      }
    } catch(e) {}
  }

  function init() {
    load();
    createWorker();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      _tickCount++;
      var cfg = window.webWorkerV83Data.config;
      if (!cfg.enabled || !window.webWorkerV83Data.workerReady) return;

      if (_tickCount % cfg.npcBatchInterval === 0) {
        window.ww83DispatchNPCAI();
      }
      if (_tickCount % cfg.econBatchInterval === 0) {
        window.ww83DispatchEconomy();
      }
      if (_tickCount % 60 === 0) {
        window.ww83DispatchHistoryScore();
        save();
      }
    };

    console.log("[WebWorker Engine V83] Khởi động — NPC AI offloaded to background thread.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22400); });
  } else {
    setTimeout(init, 22400);
  }
})();
