(function() {
  "use strict";
  const SAVE_KEY = "cgv6_model_router_v84";

  // ============================================================
  // MODEL TIERS
  // ============================================================
  var MODELS = {
    haiku:  "claude-haiku-4-5",
    sonnet: "claude-sonnet-4-20250514",
    opus:   "claude-opus-4-5"
  };

  // ============================================================
  // TASK TYPE → MODEL MAPPING
  // Gán model tier cho từng loại tác vụ AI
  // ============================================================
  var TASK_ROUTING = {
    // Haiku (rẻ nhất — $0.80/$4.00 per 1M)
    "oracle":        MODELS.haiku,   // divineOracleV77 — câu trả lời ngắn 300 tokens
    "prophecy":      MODELS.haiku,   // prophecy short answers
    "npc_name":      MODELS.haiku,   // tạo tên NPC
    "npc_bio":       MODELS.haiku,   // tiểu sử ngắn NPC
    "event_title":   MODELS.haiku,   // tiêu đề sự kiện
    "chat":          MODELS.haiku,   // chat thông thường
    "translate":     MODELS.haiku,   // dịch thuật
    "classify":      MODELS.haiku,   // phân loại text

    // Sonnet (trung bình — $3.00/$15.00 per 1M)
    "story":         MODELS.sonnet,  // worldStorySystem, worldHub
    "lore":          MODELS.sonnet,  // world lore ngắn
    "diplomacy":     MODELS.sonnet,  // diplomatic texts
    "analysis":      MODELS.sonnet,  // phân tích thế giới
    "summary":       MODELS.sonnet,  // tóm tắt memory
    "description":   MODELS.sonnet,  // mô tả địa điểm, vật phẩm
    "history":       MODELS.sonnet,  // ghi chép lịch sử
    "religion":      MODELS.sonnet,  // nội dung tôn giáo

    // Opus (đắt nhất — $15.00/$75.00 per 1M) — chỉ khi thật sự cần
    "genesis":       MODELS.opus,    // world genesis full
    "narrative":     MODELS.opus,    // long narrative generation
    "world_build":   MODELS.opus,    // complex world building
    "civilization":  MODELS.opus,    // civ design
    "deep_lore":     MODELS.opus     // deep mythology/lore creation
  };

  // Override mapping cho engine cụ thể
  // Engine nào gọi model nào theo mặc định → nên dùng gì
  var ENGINE_ROUTING = {
    "divineOracleV77":        MODELS.haiku,   // oracle responses ngắn
    "worldStorySystem":       MODELS.sonnet,  // đã dùng sonnet - giữ
    "worldHub":               MODELS.sonnet,  // đã dùng sonnet - giữ
    "worldLoreGenerator":     MODELS.sonnet,  // lore medium complexity
    "narrativeGeneratorV68":  MODELS.opus,    // complex narrative - cần opus
    "aiGenesisEngine":        MODELS.opus,    // world genesis - cần opus
    "worldGenerationPipeline": MODELS.opus,   // world generation - cần opus
    "aiWorldGenerator":       MODELS.sonnet   // đã dùng sonnet - giữ
  };

  window.modelRouterV84 = {
    enabled: true,
    forceOverride: null,    // null = dùng routing, "haiku"/"sonnet"/"opus" = force
    taskRouting: TASK_ROUTING,
    engineRouting: ENGINE_ROUTING,
    routingHistory: [],
    stats: {
      totalRoutings: 0,
      upgradedToOpus: 0,
      downgradedToHaiku: 0,
      downgradedToSonnet: 0,
      savedByDowngrade: 0
    }
  };

  // ============================================================
  // 1. ROUTING FUNCTION — gọi từ aiCostManager
  // ============================================================
  window.aiRouteModel = function(taskType, requestedModel) {
    var d = window.modelRouterV84;
    if (!d.enabled) return requestedModel;

    // Force override mode
    if (d.forceOverride) {
      return MODELS[d.forceOverride] || requestedModel;
    }

    var target = null;
    if (taskType && TASK_ROUTING[taskType]) {
      target = TASK_ROUTING[taskType];
    } else {
      target = requestedModel;
    }

    // Log routing decision
    if (target && target !== requestedModel) {
      var wasExpensive = requestedModel === MODELS.opus;
      var nowCheaper = target === MODELS.haiku || target === MODELS.sonnet;
      if (wasExpensive && nowCheaper) {
        d.stats.downgradedToSonnet += (target === MODELS.sonnet) ? 1 : 0;
        d.stats.downgradedToHaiku += (target === MODELS.haiku) ? 1 : 0;
        // Estimate savings: opus→sonnet saves ~$12/1M, opus→haiku saves ~$14.2/1M input
        d.stats.savedByDowngrade += (target === MODELS.haiku) ? 0.00142 : 0.0012;
      }
    }

    d.stats.totalRoutings++;
    d.routingHistory.unshift({ from: requestedModel, to: target, taskType: taskType, time: Date.now() });
    if (d.routingHistory.length > 30) d.routingHistory.pop();

    return target || requestedModel;
  };

  window.aiRouteByEngine = function(engineName, requestedModel) {
    var override = ENGINE_ROUTING[engineName];
    return override || requestedModel;
  };

  // ============================================================
  // 2. MEMORY SUMMARIZER
  //    Nén system prompt / world context dài → ngắn hơn
  // ============================================================
  var _summaryCache = {};

  window.aiSummarizePrompt = function(text, maxLength) {
    if (!text || text.length <= (maxLength || 800)) return text;
    maxLength = maxLength || 800;

    // Cache check
    var ckey = "sum_" + text.substring(0, 50).replace(/\W/g, "");
    if (_summaryCache[ckey]) return _summaryCache[ckey];

    // Rule-based compression (không cần thêm AI call)
    var lines = text.split("\n").filter(function(l) { return l.trim().length > 0; });
    var compressed = "";

    // Giữ các dòng quan trọng (có từ khóa)
    var important = ["name", "world", "year", "kingdom", "war", "alliance", "npc", "population", "religion", "task", "goal", "you are", "you must", "important", "critical"];
    var kept = [];
    var rest = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].toLowerCase();
      var isImportant = important.some(function(kw) { return line.indexOf(kw) >= 0; });
      if (isImportant) kept.push(lines[i]);
      else rest.push(lines[i]);
    }

    // Lấy toàn bộ important + một phần rest cho đủ maxLength
    var result = kept.join("\n");
    for (var j = 0; j < rest.length; j++) {
      if ((result + "\n" + rest[j]).length > maxLength) break;
      result += "\n" + rest[j];
    }

    if (result.length > maxLength) result = result.substring(0, maxLength - 3) + "...";
    _summaryCache[ckey] = result;
    return result;
  };

  // ============================================================
  // 3. PROMPT OPTIMIZER — Trim redundant patterns
  // ============================================================
  window.aiOptimizePrompt = function(prompt) {
    if (!prompt) return prompt;
    var p = prompt;
    // Remove multiple newlines
    p = p.replace(/\n{3,}/g, "\n\n");
    // Remove leading/trailing whitespace per line
    p = p.split("\n").map(function(l) { return l.trim(); }).join("\n");
    // Remove repeated phrases (simple dedup of adjacent identical lines)
    var lines = p.split("\n");
    var deduped = [lines[0]];
    for (var i = 1; i < lines.length; i++) {
      if (lines[i] !== lines[i - 1]) deduped.push(lines[i]);
    }
    return deduped.join("\n").trim();
  };

  // ============================================================
  // 4. SMART CALL HELPER — wrapper tiện lợi cho từng engine
  // ============================================================
  window.aiSmartCall = async function(engineName, taskType, system, userMessage, maxTokens) {
    var model = ENGINE_ROUTING[engineName] || TASK_ROUTING[taskType] || MODELS.sonnet;
    var optimizedSystem = window.aiOptimizePrompt(window.aiSummarizePrompt(system, 1200));
    return window.aiCall({
      model: model,
      system: optimizedSystem,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: maxTokens || 800,
      engine: engineName,
      taskType: taskType
    });
  };

  // ============================================================
  // 5. COST ESTIMATOR — tính giá trước khi gọi
  // ============================================================
  window.aiEstimateCost = function(model, systemPrompt, userMsg, expectedOutputTokens) {
    var PRICING = {
      "claude-haiku-4-5": { input: 0.80, output: 4.00 },
      "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
      "claude-opus-4-5": { input: 15.00, output: 75.00 }
    };
    var p = PRICING[model] || PRICING["claude-sonnet-4-20250514"];
    var inputTok = Math.ceil(((systemPrompt || "").length + (userMsg || "").length) / 3.8);
    var outputTok = expectedOutputTokens || 500;
    var inputCost = (inputTok / 1000000) * p.input;
    var outputCost = (outputTok / 1000000) * p.output;
    return {
      model: model,
      inputTokens: inputTok,
      outputTokens: outputTok,
      inputCost: inputCost,
      outputCost: outputCost,
      total: inputCost + outputCost,
      formatted: "$" + (inputCost + outputCost).toFixed(6)
    };
  };

  // ============================================================
  // 6. FORCE OVERRIDE CONTROLS
  // ============================================================
  window.aiForceHaiku  = function() { window.modelRouterV84.forceOverride = "haiku"; console.log("[Router V84] Forced: Haiku only (cheapest)"); };
  window.aiForceSonnet = function() { window.modelRouterV84.forceOverride = "sonnet"; console.log("[Router V84] Forced: Sonnet only"); };
  window.aiForceOpus   = function() { window.modelRouterV84.forceOverride = "opus"; console.log("[Router V84] Forced: Opus only"); };
  window.aiForceAuto   = function() { window.modelRouterV84.forceOverride = null; console.log("[Router V84] Auto routing restored"); };

  window.aiSetTaskModel = function(taskType, modelKey) {
    if (!MODELS[modelKey]) { console.warn("Model key phải là: haiku/sonnet/opus"); return; }
    window.modelRouterV84.taskRouting[taskType] = MODELS[modelKey];
    console.log("[Router V84] Task '" + taskType + "' → " + MODELS[modelKey]);
  };

  window.aiSetEngineModel = function(engineName, modelKey) {
    if (!MODELS[modelKey]) { console.warn("Model key phải là: haiku/sonnet/opus"); return; }
    window.modelRouterV84.engineRouting[engineName] = MODELS[modelKey];
    ENGINE_ROUTING[engineName] = MODELS[modelKey];
    console.log("[Router V84] Engine '" + engineName + "' → " + MODELS[modelKey]);
  };

  // ============================================================
  // 7. UI — inject vào creator-hub-v32
  // ============================================================
  function buildRouterUI() {
    var container = document.getElementById("panel-creator-hub-v32");
    if (!container) { setTimeout(buildRouterUI, 800); return; }
    if (document.getElementById("router84-wrapper")) return;

    var wrapper = document.createElement("div");
    wrapper.id = "router84-wrapper";
    wrapper.style.cssText = "margin-top:10px;border-top:1px solid rgba(167,139,250,0.12);padding-top:10px";

    wrapper.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:11px;font-weight:700;color:#a78bfa;letter-spacing:1px">🧭 MODEL ROUTER V84</div>' +
        '<div style="display:flex;gap:4px">' +
          '<button onclick="window.aiForceHaiku()" title="Force Haiku (cheapest)" style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.25);color:#4ade80;border-radius:4px;padding:2px 6px;font-size:8px;cursor:pointer">⬇ Haiku</button>' +
          '<button onclick="window.aiForceSonnet()" title="Force Sonnet" style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.25);color:#60a5fa;border-radius:4px;padding:2px 6px;font-size:8px;cursor:pointer">≡ Sonnet</button>' +
          '<button onclick="window.aiForceAuto()" title="Auto routing" style="background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);color:#a78bfa;border-radius:4px;padding:2px 6px;font-size:8px;cursor:pointer">⚡ Auto</button>' +
        '</div>' +
      '</div>' +
      '<div id="router84-force-status" style="margin-bottom:8px"></div>' +
      '<div id="router84-task-table" style="margin-bottom:6px"></div>' +
      '<div id="router84-engine-table"></div>';

    container.appendChild(wrapper);
    updateRouterUI();
    setInterval(updateRouterUI, 5000);
  }

  function updateRouterUI() {
    var forceEl = document.getElementById("router84-force-status");
    var taskEl = document.getElementById("router84-task-table");
    var engineEl = document.getElementById("router84-engine-table");
    if (!forceEl) return;

    var d = window.modelRouterV84;
    var forcedText = d.forceOverride ? "🔒 Force: " + d.forceOverride.toUpperCase() : "🔀 Auto Routing";
    var forceColor = d.forceOverride ? "#facc15" : "#4ade80";

    forceEl.innerHTML =
      '<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:5px;padding:5px 8px">' +
        '<span style="font-size:9px;color:' + forceColor + '">' + forcedText + '</span>' +
        '<span style="font-size:8px;color:rgba(232,232,240,0.4)">' + d.stats.totalRoutings + ' routings · saved ~$' + d.stats.savedByDowngrade.toFixed(4) + '</span>' +
      '</div>';

    // Task routing table (compact)
    var taskKeys = ["oracle", "story", "lore", "genesis", "narrative", "npc_bio", "diplomacy", "analysis"];
    taskEl.innerHTML =
      '<div style="font-size:8px;font-weight:600;color:rgba(232,232,240,0.35);margin-bottom:3px">TASK → MODEL</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">' +
      taskKeys.map(function(t) {
        var model = d.taskRouting[t] || "default";
        var isHaiku = model === MODELS.haiku;
        var isSonnet = model === MODELS.sonnet;
        var isOpus = model === MODELS.opus;
        var color = isHaiku ? "#4ade80" : isSonnet ? "#60a5fa" : "#f87171";
        var label = isHaiku ? "Haiku" : isSonnet ? "Sonnet" : isOpus ? "Opus" : "?";
        return '<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.02);border-radius:3px;padding:2px 5px;font-size:8px">' +
          '<span style="color:rgba(232,232,240,0.5)">' + t + '</span>' +
          '<span style="color:' + color + '">' + label + '</span></div>';
      }).join("") +
      '</div>';

    // Engine routing table (compact)
    var engines = Object.keys(ENGINE_ROUTING);
    engineEl.innerHTML =
      '<div style="font-size:8px;font-weight:600;color:rgba(232,232,240,0.35);margin-top:5px;margin-bottom:3px">ENGINE → MODEL</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">' +
      engines.map(function(eng) {
        var model = ENGINE_ROUTING[eng];
        var isHaiku = model === MODELS.haiku;
        var isSonnet = model === MODELS.sonnet;
        var color = isHaiku ? "#4ade80" : isSonnet ? "#60a5fa" : "#f87171";
        var label = isHaiku ? "Haiku" : isSonnet ? "Sonnet" : "Opus";
        var shortName = eng.replace(/Engine|System|Generator|Pipeline|V\d+/g, "").substring(0, 12);
        return '<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.02);border-radius:3px;padding:2px 5px;font-size:8px">' +
          '<span style="color:rgba(232,232,240,0.5)">' + shortName + '</span>' +
          '<span style="color:' + color + '">' + label + '</span></div>';
      }).join("") +
      '</div>';
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ stats: window.modelRouterV84.stats, forceOverride: window.modelRouterV84.forceOverride }));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p.stats) Object.assign(window.modelRouterV84.stats, p.stats);
      if (p.forceOverride !== undefined) window.modelRouterV84.forceOverride = p.forceOverride;
    } catch(e) {}
  }

  var _routerTick = 0;
  var _origRouterTick = window.gameTick;
  window.gameTick = function() {
    if (_origRouterTick) _origRouterTick();
    _routerTick++;
    if (_routerTick % 150 === 0) save();
  };

  function init() {
    load();
    setTimeout(buildRouterUI, 2200);
    console.log("[Model Router V84] Khởi động — Oracle→Haiku · Story→Sonnet · Genesis→Opus · aiSmartCall() sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 22800); });
  } else {
    setTimeout(init, 22800);
  }
})();
