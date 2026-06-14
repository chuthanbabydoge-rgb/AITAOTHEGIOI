(function() {
  "use strict";
  const SAVE_KEY = "cgv6_ai_cost_manager_v84";

  // ============================================================
  // MODEL PRICING (USD per 1M tokens — cập nhật 2026)
  // ============================================================
  var MODEL_PRICING = {
    "claude-haiku-4-5":            { input: 0.80,  output: 4.00,  tier: "haiku",  label: "Haiku 4.5" },
    "claude-3-5-haiku-20241022":   { input: 0.80,  output: 4.00,  tier: "haiku",  label: "Haiku 3.5" },
    "claude-3-haiku-20240307":     { input: 0.25,  output: 1.25,  tier: "haiku",  label: "Haiku 3" },
    "claude-sonnet-4-20250514":    { input: 3.00,  output: 15.00, tier: "sonnet", label: "Sonnet 4" },
    "claude-3-5-sonnet-20241022":  { input: 3.00,  output: 15.00, tier: "sonnet", label: "Sonnet 3.5" },
    "claude-opus-4-5":             { input: 15.00, output: 75.00, tier: "opus",   label: "Opus 4.5" },
    "claude-opus-4-20250514":      { input: 15.00, output: 75.00, tier: "opus",   label: "Opus 4" },
    "claude-3-opus-20240229":      { input: 15.00, output: 75.00, tier: "opus",   label: "Opus 3" }
  };

  var DEFAULT_PRICING = { input: 3.00, output: 15.00, tier: "sonnet", label: "Unknown" };

  window.aiCostManagerV84 = {
    enabled: true,
    calls: [],
    cache: {},
    cacheHits: 0,
    cacheMisses: 0,
    budget: {
      sessionLimit: 0.50,    // $0.50 mặc định
      alertAt: 0.30,         // cảnh báo khi đạt 60%
      sessionSpend: 0,
      allTimeSpend: 0,
      callCount: 0
    },
    stats: {
      byModel: {},
      byEngine: {},
      totalInputTokens: 0,
      totalOutputTokens: 0,
      savedByCache: 0
    },
    cacheConfig: {
      enabled: true,
      maxEntries: 60,
      defaultTTL: 1800000,    // 30 phút
      oracleTTL: 1800000,
      loreTTL: 7200000,       // 2 giờ
      worldTTL: 3600000       // 1 giờ
    }
  };

  // ============================================================
  // 1. COST CALCULATION
  // ============================================================
  function calcCost(model, inputTokens, outputTokens) {
    var p = MODEL_PRICING[model] || DEFAULT_PRICING;
    var inputCost  = (inputTokens  / 1000000) * p.input;
    var outputCost = (outputTokens / 1000000) * p.output;
    return { input: inputCost, output: outputCost, total: inputCost + outputCost, tier: p.tier };
  }

  function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 3.8);
  }

  // ============================================================
  // 2. CACHE LAYER — LRU với TTL
  // ============================================================
  function cacheKey(model, system, userMsg) {
    var s = (model || "") + "|" + (system || "").substring(0, 180) + "|" + (userMsg || "").substring(0, 180);
    var hash = 0;
    for (var i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return "aicache_" + Math.abs(hash);
  }

  function cacheGet(key) {
    var entry = window.aiCostManagerV84.cache[key];
    if (!entry) return null;
    if (Date.now() - entry.time > entry.ttl) {
      delete window.aiCostManagerV84.cache[key];
      return null;
    }
    entry.hits = (entry.hits || 0) + 1;
    entry.lastAccess = Date.now();
    return entry.value;
  }

  function cacheSet(key, value, ttl) {
    var cache = window.aiCostManagerV84.cache;
    var cfg = window.aiCostManagerV84.cacheConfig;
    var keys = Object.keys(cache);
    // LRU eviction nếu đầy
    if (keys.length >= cfg.maxEntries) {
      var oldest = keys.sort(function(a, b) {
        return (cache[a].lastAccess || 0) - (cache[b].lastAccess || 0);
      })[0];
      delete cache[oldest];
    }
    cache[key] = { value: value, time: Date.now(), lastAccess: Date.now(), ttl: ttl || cfg.defaultTTL, hits: 0 };
  }

  function pickCacheTTL(engine, taskType) {
    var cfg = window.aiCostManagerV84.cacheConfig;
    if (taskType === "oracle" || taskType === "prophecy") return cfg.oracleTTL;
    if (taskType === "lore" || taskType === "narrative") return cfg.loreTTL;
    if (taskType === "world" || taskType === "genesis") return cfg.worldTTL;
    return cfg.defaultTTL;
  }

  // ============================================================
  // 3. MAIN API: window.aiCall() — unified AI caller
  //    Thay thế fetch("/api/claude", ...) trực tiếp
  // ============================================================
  window.aiCall = async function(options) {
    /*
      options: {
        model: string,           // model ID (sẽ được route nếu dùng alias)
        system: string,          // system prompt
        messages: [...],         // messages array
        max_tokens: number,
        engine: string,          // tên engine gọi (để track)
        taskType: string,        // "oracle"|"lore"|"world"|"story"|"genesis"|"chat"
        skipCache: bool,         // bỏ qua cache
        onStream: function       // nếu muốn stream (không cache)
      }
      returns: { content: string, model: string, usage: {...}, cached: bool, cost: {...} }
    */
    var d = window.aiCostManagerV84;
    if (!d.enabled) {
      return _rawFetch(options);
    }

    // Route model nếu có routing engine
    var finalModel = options.model;
    if (typeof window.aiRouteModel === "function") {
      finalModel = window.aiRouteModel(options.taskType, options.model) || options.model;
    }

    // Summarize system prompt nếu quá dài
    var system = options.system || "";
    if (typeof window.aiSummarizePrompt === "function" && system.length > 1500) {
      system = window.aiSummarizePrompt(system, 800);
    }

    // Cache check
    var userMsg = "";
    if (options.messages && options.messages.length > 0) {
      var last = options.messages[options.messages.length - 1];
      userMsg = (last && last.content) ? (typeof last.content === "string" ? last.content : JSON.stringify(last.content)) : "";
    }

    if (!options.skipCache && d.cacheConfig.enabled) {
      var key = cacheKey(finalModel, system, userMsg);
      var cached = cacheGet(key);
      if (cached) {
        d.cacheHits++;
        var savedCost = calcCost(finalModel, estimateTokens(system + userMsg), estimateTokens(cached));
        d.stats.savedByCache += savedCost.total;
        _recordCall({ engine: options.engine || "unknown", model: finalModel, taskType: options.taskType, cached: true, cost: 0, inputTokens: 0, outputTokens: 0 });
        return { content: cached, model: finalModel, usage: { input_tokens: 0, output_tokens: 0 }, cached: true, cost: { total: 0 } };
      }
      d.cacheMisses++;
    }

    // Budget check
    if (d.budget.sessionSpend >= d.budget.sessionLimit) {
      addAlert("budget", "Đã đạt budget session $" + d.budget.sessionLimit.toFixed(3) + " — gọi AI bị tạm dừng");
      return { content: "[Budget exceeded — AI calls paused. Reset in settings.]", model: finalModel, usage: {}, cached: false, cost: { total: 0 }, error: "budget_exceeded" };
    }

    // Real API call
    var payload = {
      model: finalModel,
      max_tokens: options.max_tokens || 1000,
      messages: options.messages || []
    };
    if (system) payload.system = system;

    var startTime = Date.now();
    var result;
    try {
      var resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      var json = await resp.json();
      var elapsed = Date.now() - startTime;

      var outputText = "";
      if (json.content && json.content[0]) outputText = json.content[0].text || "";
      else if (json.error) throw new Error(json.error.message || "API error");

      var usage = json.usage || {};
      var inputTok = usage.input_tokens || estimateTokens(system + userMsg);
      var outputTok = usage.output_tokens || estimateTokens(outputText);
      var cost = calcCost(finalModel, inputTok, outputTok);

      // Update budget
      d.budget.sessionSpend += cost.total;
      d.budget.allTimeSpend += cost.total;
      d.budget.callCount++;
      d.stats.totalInputTokens += inputTok;
      d.stats.totalOutputTokens += outputTok;

      // Alert nếu gần budget
      if (d.budget.sessionSpend >= d.budget.alertAt && d.budget.callCount % 5 === 0) {
        addAlert("warning", "Chi phí AI: $" + d.budget.sessionSpend.toFixed(4) + " / $" + d.budget.sessionLimit.toFixed(2));
      }

      // Cache response
      if (!options.skipCache && d.cacheConfig.enabled && outputText) {
        var ckey = cacheKey(finalModel, system, userMsg);
        var ttl = pickCacheTTL(options.engine, options.taskType);
        cacheSet(ckey, outputText, ttl);
      }

      _recordCall({
        engine: options.engine || "unknown",
        model: finalModel,
        originalModel: options.model,
        taskType: options.taskType || "unknown",
        cached: false,
        cost: cost.total,
        inputTokens: inputTok,
        outputTokens: outputTok,
        elapsed: elapsed
      });

      result = { content: outputText, model: finalModel, usage: { input_tokens: inputTok, output_tokens: outputTok }, cached: false, cost: cost };

    } catch(e) {
      _recordCall({ engine: options.engine || "unknown", model: finalModel, taskType: options.taskType || "unknown", cached: false, cost: 0, error: e.message });
      result = { content: "[AI Error: " + e.message + "]", model: finalModel, usage: {}, cached: false, cost: { total: 0 }, error: e.message };
    }

    return result;
  };

  async function _rawFetch(options) {
    var payload = { model: options.model, max_tokens: options.max_tokens || 1000, messages: options.messages || [] };
    if (options.system) payload.system = options.system;
    var resp = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    var json = await resp.json();
    var text = (json.content && json.content[0]) ? json.content[0].text : "";
    return { content: text, model: options.model, usage: json.usage || {}, cached: false, cost: { total: 0 } };
  }

  function _recordCall(info) {
    var d = window.aiCostManagerV84;
    var entry = { time: Date.now(), year: window.year || 0, ...info };
    d.calls.unshift(entry);
    if (d.calls.length > 100) d.calls.pop();

    // Stats by model
    if (!d.stats.byModel[info.model]) d.stats.byModel[info.model] = { calls: 0, cost: 0, tokens: 0, cacheHits: 0 };
    if (info.cached) d.stats.byModel[info.model].cacheHits++;
    else {
      d.stats.byModel[info.model].calls++;
      d.stats.byModel[info.model].cost += info.cost || 0;
      d.stats.byModel[info.model].tokens += (info.inputTokens || 0) + (info.outputTokens || 0);
    }

    // Stats by engine
    if (!d.stats.byEngine[info.engine]) d.stats.byEngine[info.engine] = { calls: 0, cost: 0, cacheHits: 0 };
    if (info.cached) d.stats.byEngine[info.engine].cacheHits++;
    else {
      d.stats.byEngine[info.engine].calls++;
      d.stats.byEngine[info.engine].cost += info.cost || 0;
    }
  }

  // ============================================================
  // 4. ALERTS
  // ============================================================
  window.aiCostManagerV84.alerts = [];
  function addAlert(level, msg) {
    window.aiCostManagerV84.alerts.unshift({ level: level, msg: msg, time: Date.now() });
    if (window.aiCostManagerV84.alerts.length > 10) window.aiCostManagerV84.alerts.pop();
  }

  // ============================================================
  // 5. PUBLIC UTILITY APIs
  // ============================================================
  window.aiCostGetReport = function() {
    var d = window.aiCostManagerV84;
    var totalCalls = d.calls.filter(function(c) { return !c.cached; }).length;
    var cacheRate = (d.cacheHits + d.cacheMisses) > 0 ? Math.round(d.cacheHits / (d.cacheHits + d.cacheMisses) * 100) : 0;
    return {
      sessionSpend: Math.round(d.budget.sessionSpend * 10000) / 10000,
      allTimeSpend: Math.round(d.budget.allTimeSpend * 10000) / 10000,
      budget: d.budget.sessionLimit,
      budgetPct: Math.round((d.budget.sessionSpend / d.budget.sessionLimit) * 100),
      totalCalls: totalCalls,
      cacheHits: d.cacheHits,
      cacheMisses: d.cacheMisses,
      cacheRate: cacheRate,
      savedByCache: Math.round(d.stats.savedByCache * 10000) / 10000,
      totalTokens: d.stats.totalInputTokens + d.stats.totalOutputTokens,
      recentCalls: d.calls.slice(0, 5),
      byModel: d.stats.byModel,
      byEngine: d.stats.byEngine
    };
  };

  window.aiCostSetBudget = function(limit) { window.aiCostManagerV84.budget.sessionLimit = limit; };
  window.aiCostResetSession = function() {
    var d = window.aiCostManagerV84;
    d.budget.sessionSpend = 0;
    d.calls = [];
    d.cacheHits = 0;
    d.cacheMisses = 0;
    d.stats.savedByCache = 0;
    d.stats.totalInputTokens = 0;
    d.stats.totalOutputTokens = 0;
    d.stats.byModel = {};
    d.stats.byEngine = {};
  };

  window.aiCostClearCache = function() { window.aiCostManagerV84.cache = {}; };
  window.aiCostToggle = function() { window.aiCostManagerV84.enabled = !window.aiCostManagerV84.enabled; };

  // ============================================================
  // 6. SAVE / LOAD
  // ============================================================
  function save() {
    try {
      var d = window.aiCostManagerV84;
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        budget: { allTimeSpend: d.budget.allTimeSpend, sessionLimit: d.budget.sessionLimit, alertAt: d.budget.alertAt },
        stats: { totalInputTokens: d.stats.totalInputTokens, totalOutputTokens: d.stats.totalOutputTokens, savedByCache: d.stats.savedByCache }
      }));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.budget) Object.assign(window.aiCostManagerV84.budget, p.budget);
      if (p.stats) Object.assign(window.aiCostManagerV84.stats, p.stats);
    } catch(e) {}
  }

  // ============================================================
  // 7. UI WIDGET (inject creator-hub-v32)
  // ============================================================
  function buildUI() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildUI, 800); return; }
    if (document.getElementById("aicost84-wrapper")) return;

    var wrapper = document.createElement("div");
    wrapper.id = "aicost84-wrapper";
    wrapper.style.cssText = "margin-top:10px;border-top:1px solid rgba(251,191,36,0.15);padding-top:10px";

    wrapper.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;color:#fbbf24;letter-spacing:1px">💰 AI COST MANAGER V84</div>' +
        '<div style="display:flex;gap:5px">' +
          '<button onclick="window.aiCostResetSession()" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25);color:#fbbf24;border-radius:4px;padding:2px 7px;font-size:9px;cursor:pointer">↺ Reset</button>' +
          '<button onclick="window.aiCostClearCache()" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.25);color:#fbbf24;border-radius:4px;padding:2px 7px;font-size:9px;cursor:pointer">🗑 Cache</button>' +
        '</div>' +
      '</div>' +
      '<div id="aicost84-budget-bar" style="margin-bottom:8px"></div>' +
      '<div id="aicost84-cards" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px"></div>' +
      '<div id="aicost84-by-model" style="margin-bottom:6px"></div>' +
      '<div id="aicost84-log" style="max-height:75px;overflow-y:auto"></div>';

    container.appendChild(wrapper);
    updateUI();
    setInterval(updateUI, 4000);
  }

  function updateUI() {
    var bbar = document.getElementById("aicost84-budget-bar");
    var cards = document.getElementById("aicost84-cards");
    var byModel = document.getElementById("aicost84-by-model");
    var logEl = document.getElementById("aicost84-log");
    if (!bbar) return;

    var r = window.aiCostGetReport();
    var budgetColor = r.budgetPct > 80 ? "#f87171" : r.budgetPct > 50 ? "#facc15" : "#4ade80";

    // Budget bar
    bbar.innerHTML =
      '<div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(232,232,240,0.5);margin-bottom:3px">' +
        '<span>Session Budget</span>' +
        '<span style="color:' + budgetColor + '">$' + r.sessionSpend.toFixed(4) + ' / $' + r.budget.toFixed(2) + ' (' + r.budgetPct + '%)</span>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.06);border-radius:3px;height:5px">' +
        '<div style="width:' + Math.min(100, r.budgetPct) + '%;background:' + budgetColor + ';height:100%;border-radius:3px;transition:width .3s"></div>' +
      '</div>';

    // Cards
    function card(icon, val, label, color) {
      return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px;text-align:center">' +
        '<div style="font-size:12px">' + icon + '</div>' +
        '<div style="color:' + color + ';font-weight:700;font-size:11px">' + val + '</div>' +
        '<div style="font-size:8px;color:rgba(232,232,240,0.3)">' + label + '</div></div>';
    }
    cards.innerHTML =
      card("📞", r.totalCalls, "API Calls", "#60a5fa") +
      card("⚡", r.cacheRate + "%", "Cache Hit", r.cacheRate > 50 ? "#4ade80" : "#facc15") +
      card("💎", r.cacheHits, "Cache Hits", "#a78bfa") +
      card("💸", "$" + r.savedByCache.toFixed(4), "Saved", "#34d399");

    // By Model breakdown
    var modelRows = Object.keys(r.byModel).map(function(m) {
      var s = r.byModel[m];
      var p = MODEL_PRICING[m] || DEFAULT_PRICING;
      var tierColor = p.tier === "haiku" ? "#4ade80" : p.tier === "sonnet" ? "#60a5fa" : "#f87171";
      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:8px;color:rgba(232,232,240,0.5);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">' +
        '<span style="color:' + tierColor + '">' + (p.label || m.substring(0, 20)) + '</span>' +
        '<span>' + s.calls + ' calls</span>' +
        '<span style="color:#fbbf24">$' + (s.cost || 0).toFixed(5) + '</span>' +
        '<span style="color:#a78bfa">' + (s.cacheHits || 0) + ' cached</span>' +
        '</div>';
    });
    byModel.innerHTML = modelRows.length > 0
      ? '<div style="font-size:8px;font-weight:600;color:rgba(232,232,240,0.4);margin-bottom:3px">PER MODEL</div>' + modelRows.join("")
      : '<div style="font-size:8px;color:rgba(232,232,240,0.2)">Chưa có AI call nào</div>';

    // Recent call log
    if (r.recentCalls.length > 0) {
      logEl.innerHTML = r.recentCalls.map(function(c) {
        var p = MODEL_PRICING[c.model] || DEFAULT_PRICING;
        var tierColor = p.tier === "haiku" ? "#4ade80" : p.tier === "sonnet" ? "#60a5fa" : "#f87171";
        var cachedBadge = c.cached ? ' <span style="color:#a78bfa">[cached]</span>' : '';
        return '<div style="font-size:8px;color:rgba(232,232,240,0.4);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03)">' +
          '<span style="color:' + tierColor + '">' + p.label + '</span> · ' +
          '<span style="color:rgba(232,232,240,0.6)">' + (c.engine || "?") + '</span>' +
          cachedBadge +
          (c.cost ? ' · <span style="color:#fbbf24">$' + c.cost.toFixed(5) + '</span>' : '') +
          '</div>';
      }).join("");
    } else {
      logEl.innerHTML = '<div style="font-size:8px;color:rgba(232,232,240,0.2)">Log trống</div>';
    }
  }

  // ============================================================
  // 8. Auto-save mỗi 60 ticks
  // ============================================================
  var _costTick = 0;
  var _origCostTick = window.gameTick;
  window.gameTick = function() {
    if (_origCostTick) _origCostTick();
    _costTick++;
    if (_costTick % 120 === 0) save();
  };

  function init() {
    load();
    setTimeout(buildUI, 2000);
    console.log("[AI Cost Manager V84] Khởi động — Budget: $" + window.aiCostManagerV84.budget.sessionLimit + " · Cache: " + window.aiCostManagerV84.cacheConfig.maxEntries + " entries · window.aiCall() sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22700); });
  } else {
    setTimeout(init, 22700);
  }
})();
