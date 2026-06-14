(function() {
  "use strict";

  // Web Worker Registry V83 — UI panel + monitoring
  // Inject vào creator-hub-v32 (KHÔNG tạo panel/tab mới)

  var _uiBuilt = false;
  var _refreshInterval = null;

  function buildUI() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildUI, 800); return; }
    if (document.getElementById("ww83-wrapper")) return;

    var wrapper = document.createElement("div");
    wrapper.id = "ww83-wrapper";
    wrapper.style.cssText = "margin-top:10px;border-top:1px solid rgba(52,211,153,0.12);padding-top:10px";

    wrapper.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;color:#34d399;letter-spacing:1px">🧵 WEB WORKER ENGINE V83</div>' +
        '<div style="display:flex;gap:5px">' +
          '<button onclick="window.ww83RestartWorker()" style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);color:#34d399;border-radius:4px;padding:2px 7px;font-size:9px;cursor:pointer">↺ Restart</button>' +
          '<button onclick="window.ww83ToggleEnabled()" id="ww83-toggle" style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);color:#34d399;border-radius:4px;padding:2px 7px;font-size:9px;cursor:pointer">■ Active</button>' +
        '</div>' +
      '</div>' +
      '<div id="ww83-status-row" style="display:flex;gap:6px;margin-bottom:8px"></div>' +
      '<div id="ww83-stats-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px"></div>' +
      '<div id="ww83-detail" style="margin-bottom:6px"></div>' +
      '<div id="ww83-task-log" style="max-height:70px;overflow-y:auto"></div>';

    container.appendChild(wrapper);
    _uiBuilt = true;
    updateUI();
  }

  function updateUI() {
    if (!_uiBuilt) return;
    var statusRow = document.getElementById("ww83-status-row");
    var statsGrid = document.getElementById("ww83-stats-grid");
    var detail = document.getElementById("ww83-detail");
    var taskLog = document.getElementById("ww83-task-log");
    if (!statusRow) return;

    var d = window.webWorkerV83Data || {};
    var s = d.stats || {};
    var cfg = d.config || {};
    var pool = window.ww83GetPoolStatus ? window.ww83GetPoolStatus() : {};
    var ready = d.workerReady || false;
    var supported = d.supported !== false;

    // Status row
    function badge(icon, label, color, bg) {
      return '<div style="display:flex;align-items:center;gap:4px;background:' + bg + ';border:1px solid ' + color + ';border-radius:4px;padding:3px 8px;font-size:9px;color:' + color + '">' + icon + ' ' + label + '</div>';
    }
    statusRow.innerHTML =
      badge(supported ? "✅" : "❌", supported ? "Supported" : "Not Supported", supported ? "#4ade80" : "#f87171", supported ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)") +
      badge(ready ? "🟢" : "🟡", ready ? "Worker Ready" : "Initializing", ready ? "#4ade80" : "#facc15", "rgba(255,255,255,0.04)") +
      badge("⚙️", cfg.enabled ? "Active" : "Paused", cfg.enabled ? "#34d399" : "#94a3b8", "rgba(255,255,255,0.04)") +
      badge("💻", (pool.hardwareConcurrency || "?") + " Cores", "#60a5fa", "rgba(96,165,250,0.08)");

    // Stats grid
    function statCard(icon, val, label, color) {
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:7px;text-align:center">' +
        '<div style="font-size:11px">' + icon + '</div>' +
        '<div style="color:' + color + ';font-weight:700;font-size:11px">' + val + '</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.35)">' + label + '</div></div>';
    }
    var successRate = s.tasksDispatched > 0 ? Math.round(s.tasksCompleted / s.tasksDispatched * 100) : 100;
    statsGrid.innerHTML =
      statCard("📤", s.tasksDispatched || 0, "Dispatched", "#60a5fa") +
      statCard("✅", s.tasksCompleted || 0, "Completed", "#4ade80") +
      statCard("⏱️", (s.avgProcessTimeMs || 0) + "ms", "Avg Time", s.avgProcessTimeMs < 10 ? "#4ade80" : "#facc15") +
      statCard("🧬", s.npcBatchesProcessed || 0, "NPC Batches", "#a78bfa") +
      statCard("💹", s.econBatchesProcessed || 0, "Econ Batches", "#fb923c") +
      statCard("🏆", successRate + "%", "Success Rate", successRate > 90 ? "#4ade80" : "#facc15");

    // Detail info
    var npcCount = (window.npcs || []).length;
    var pendingCount = pool.pending || 0;
    var queueLen = pool.queueLength || 0;
    detail.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
      '<div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.12);border-radius:6px;padding:7px">' +
        '<div style="font-size:9px;font-weight:600;color:#34d399;margin-bottom:4px">🧬 NPC Processing</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Total NPCs: <b style="color:#e8e8f0">' + npcCount + '</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Batch size: <b style="color:#e8e8f0">' + (cfg.maxNPCPerBatch || 150) + '</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Interval: <b style="color:#e8e8f0">every ' + (cfg.npcBatchInterval || 10) + ' ticks</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Last batch: <b style="color:#e8e8f0">' + (s.lastNPCBatchMs || 0) + 'ms ago</b></div>' +
      '</div>' +
      '<div style="background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.12);border-radius:6px;padding:7px">' +
        '<div style="font-size:9px;font-weight:600;color:#60a5fa;margin-bottom:4px">📋 Task Queue</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Queued: <b style="color:#e8e8f0">' + queueLen + '</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Pending: <b style="color:#e8e8f0">' + pendingCount + '</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Failed: <b style="color:#f87171">' + (s.tasksFailed || 0) + '</b></div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.5)">Total: <b style="color:#e8e8f0">' + (s.tasksDispatched || 0) + '</b></div>' +
      '</div></div>';

    // Task log
    var history = (pool.recentTasks || []).slice().reverse();
    if (history.length > 0) {
      taskLog.innerHTML = history.map(function(t) {
        var age = Math.round((Date.now() - t.time) / 1000);
        var pColor = t.priority === 1 ? "#f87171" : t.priority === 2 ? "#60a5fa" : "#94a3b8";
        return '<div style="display:flex;justify-content:space-between;font-size:8px;color:rgba(232,232,240,0.4);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03)">' +
          '<span style="color:' + pColor + '">P' + t.priority + '</span>' +
          '<span style="color:rgba(232,232,240,0.7)">' + t.type + '</span>' +
          '<span>' + age + 's trước</span></div>';
      }).join("");
    } else {
      taskLog.innerHTML = '<div style="font-size:8px;color:rgba(232,232,240,0.25)">Chưa có task nào được xử lý</div>';
    }
  }

  window.ww83ToggleEnabled = function() {
    var d = window.webWorkerV83Data;
    if (!d) return;
    d.config.enabled = !d.config.enabled;
    var btn = document.getElementById("ww83-toggle");
    if (btn) btn.textContent = d.config.enabled ? "■ Active" : "▶ Paused";
    updateUI();
  };

  window.ww83RefreshUI = updateUI;

  function init() {
    setTimeout(buildUI, 1800);
    _refreshInterval = setInterval(updateUI, 3000);
    console.log("[WebWorker Registry V83] UI monitoring panel sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22600); });
  } else {
    setTimeout(init, 22600);
  }
})();
