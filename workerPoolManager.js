(function() {
  "use strict";

  // Worker Pool Manager V83
  // Quản lý pool nhiều workers, task queue, priority system
  // Không có save key riêng — ephemeral state

  var POOL_SIZE = Math.min(navigator.hardwareConcurrency || 2, 4);

  window.workerPoolV83 = {
    pools: {},
    taskQueue: [],
    taskHistory: [],
    totalProcessed: 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 2
  };

  // ============================================================
  // Task Queue với priority
  // ============================================================
  var _taskQueue = [];
  var _processing = false;

  window.ww83QueueTask = function(task) {
    // task: { type, data, priority (1=high, 2=normal, 3=low), callback }
    task.priority = task.priority || 2;
    task.queueTime = Date.now();
    task.id = "qtask_" + (++window.workerPoolV83.totalProcessed);

    // Priority insert
    var inserted = false;
    for (var i = 0; i < _taskQueue.length; i++) {
      if (task.priority < _taskQueue[i].priority) {
        _taskQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) _taskQueue.push(task);
    processQueue();
    return task.id;
  };

  function processQueue() {
    if (_taskQueue.length === 0) return;
    var d = window.webWorkerV83Data;
    if (!d || !d.workerReady || !d.config.enabled) return;
    var pending = Object.keys(d.pendingTasks || {}).length;
    if (pending >= 3) return; // max 3 concurrent tasks

    var task = _taskQueue.shift();
    if (!task) return;

    var taskId = "pool_" + task.id;
    var payload = { type: task.type, taskId: taskId };
    Object.assign(payload, task.data || {});

    var sent = false;
    if (d.worker && d.workerReady) {
      d.pendingTasks[taskId] = { type: task.type, startTime: Date.now(), callback: task.callback };
      d.worker.postMessage(payload);
      d.stats.tasksDispatched++;
      sent = true;
    }

    if (!sent && task.callback) {
      task.callback(null, new Error("Worker not available"));
    }

    // Log task
    window.workerPoolV83.taskHistory.push({ id: task.id, type: task.type, priority: task.priority, time: Date.now() });
    if (window.workerPoolV83.taskHistory.length > 50) window.workerPoolV83.taskHistory.shift();

    // Process next after short delay
    setTimeout(processQueue, 16);
  }

  // ============================================================
  // High-level convenience dispatchers
  // ============================================================
  window.ww83QueueNPCBatch = function(startIdx, endIdx, callback) {
    var npcs = window.npcs || [];
    var batch = npcs.slice(startIdx || 0, endIdx || npcs.length);
    return window.ww83QueueTask({
      type: "PROCESS_NPC_AI",
      priority: 2,
      data: {
        npcs: JSON.parse(JSON.stringify(batch)),
        world: { population: (window.world || {}).population, wealth: (window.world || {}).wealth },
        year: window.year || 1
      },
      callback: callback
    });
  };

  window.ww83QueueRelationships = function(callback) {
    var npcs = window.npcs || [];
    if (npcs.length < 2) return;
    return window.ww83QueueTask({
      type: "PROCESS_RELATIONSHIPS",
      priority: 3,
      data: {
        npcs: JSON.parse(JSON.stringify(npcs.slice(0, 50))),
        year: window.year || 1
      },
      callback: callback
    });
  };

  // ============================================================
  // Pool status + stats
  // ============================================================
  window.ww83GetPoolStatus = function() {
    var d = window.webWorkerV83Data || {};
    return {
      hardwareConcurrency: window.workerPoolV83.hardwareConcurrency,
      poolSize: POOL_SIZE,
      queueLength: _taskQueue.length,
      totalProcessed: window.workerPoolV83.totalProcessed,
      workerReady: d.workerReady || false,
      pending: Object.keys(d.pendingTasks || {}).length,
      recentTasks: window.workerPoolV83.taskHistory.slice(-5)
    };
  };

  // ============================================================
  // Relationship batch scheduler (mỗi 45 ticks)
  // ============================================================
  var _relTick = 0;
  var _origPoolTick = window.gameTick;
  window.gameTick = function() {
    if (_origPoolTick) _origPoolTick();
    _relTick++;
    if (_relTick % 45 === 0) {
      window.ww83QueueRelationships();
    }
    if (_taskQueue.length > 0) processQueue();
  };

  function init() {
    console.log("[Worker Pool Manager V83] Pool=" + POOL_SIZE + " workers · Hardware cores=" + (navigator.hardwareConcurrency || "N/A") + " · Queue system active.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22500); });
  } else {
    setTimeout(init, 22500);
  }
})();
