(function() {
  "use strict";
  const SAVE_KEY = "cgv6_world_pipeline_v75";

  window.worldPipelineV75Data = {
    pendingWorld: null,
    appliedWorlds: [],
    currentStage: null,
    stageLog: [],
    stats: { totalApplied: 0, totalPreviewed: 0 },
    version: "V75"
  };

  function save() {
    try {
      var d = { appliedWorlds: window.worldPipelineV75Data.appliedWorlds.slice(-10), stats: window.worldPipelineV75Data.stats, version: "V75" };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        window.worldPipelineV75Data.appliedWorlds = p.appliedWorlds || [];
        window.worldPipelineV75Data.stats = p.stats || window.worldPipelineV75Data.stats;
      }
    } catch(e) {}
  }

  function logStage(stage, msg) {
    window.worldPipelineV75Data.currentStage = stage;
    window.worldPipelineV75Data.stageLog.push("[" + stage + "] " + msg);
    if (window.worldPipelineV75Data.stageLog.length > 50) window.worldPipelineV75Data.stageLog.shift();
    var el = document.getElementById("wgp75-stage-log");
    if (el) el.innerHTML = window.worldPipelineV75Data.stageLog.slice(-8).map(function(l) { return '<div style="color:#6b7280;font-size:10px;margin-bottom:2px">' + l + '</div>'; }).join("");
  }

  function setStatus(msg, color) {
    var el = document.getElementById("wgp75-status");
    if (el) { el.textContent = msg; el.style.color = color || "#a78bfa"; }
  }

  // ─── Main generation pipeline ──────────────────────────────
  window.wgp75Generate = async function(prompt) {
    if (!prompt || prompt.trim().length < 3) return { ok: false, msg: "Hãy nhập mô tả thế giới!" };
    setStatus("🔍 Đang phân tích prompt...", "#f59e0b");
    logStage("ANALYZE", "Phân tích: \"" + prompt.substring(0, 50) + "\"");

    var fullPrompt = typeof window.ptw75BuildFullPrompt === "function"
      ? window.ptw75BuildFullPrompt(prompt)
      : { systemPrompt: "Tạo thế giới game. Trả về JSON.", genre: { id: "hybrid", name: "Hybrid" } };
    if (!fullPrompt) return { ok: false, msg: "Không thể phân tích prompt" };

    setStatus("🤖 Đang gọi Claude AI...", "#8b5cf6");
    logStage("CLAUDE", "Gọi Claude " + "claude-opus-4-5" + "...");

    if (typeof window.ag75CallClaude !== "function") return { ok: false, msg: "AIGenesisEngine chưa sẵn sàng" };
    var resp = await window.ag75CallClaude(fullPrompt.systemPrompt, prompt);
    if (!resp.ok) {
      setStatus("❌ " + resp.error, "#ef4444");
      logStage("ERROR", resp.error);
      return { ok: false, msg: "Claude API lỗi: " + resp.error };
    }

    setStatus("📦 Đang phân tích kết quả...", "#3b82f6");
    logStage("PARSE", "Phân tích JSON kết quả...");

    var parsed = typeof window.ag75ParseWorldJSON === "function"
      ? window.ag75ParseWorldJSON(resp.text)
      : { ok: false, error: "Parser chưa sẵn sàng" };
    if (!parsed.ok) {
      setStatus("⚠️ Lỗi cấu trúc JSON — thử lại", "#f59e0b");
      logStage("PARSE_ERR", parsed.error);
      return { ok: false, msg: "Lỗi parse: " + parsed.error, raw: resp.text };
    }

    var worldData = parsed.world;
    worldData._sourcePrompt = prompt;
    worldData._genre = fullPrompt.genre;
    worldData._generatedAt = new Date().toISOString().slice(0, 16);

    setStatus("✅ Đã tạo xong! Xem World Preview →", "#10b981");
    logStage("DONE", "Thế giới \"" + worldData.worldName + "\" đã tạo xong!");

    window.worldPipelineV75Data.pendingWorld = worldData;
    window.worldPipelineV75Data.stats.totalPreviewed++;

    if (typeof window.ag75SaveGeneration === "function") {
      window.ag75SaveGeneration({
        prompt: prompt,
        genre: fullPrompt.genre,
        worldName: worldData.worldName,
        worldData: worldData,
        status: "preview"
      });
    }

    save();
    if (typeof window.wgl75RenderPreview === "function") window.wgl75RenderPreview(worldData);
    if (typeof window.wgl75SwitchTab === "function") window.wgl75SwitchTab("preview75");
    return { ok: true, world: worldData, msg: "🌍 Thế giới \"" + worldData.worldName + "\" đã sẵn sàng xem trước!" };
  };

  // ─── Apply world data to game state ───────────────────────
  window.wgp75ApplyWorld = function(worldData) {
    if (!worldData) worldData = window.worldPipelineV75Data.pendingWorld;
    if (!worldData) return { ok: false, msg: "Không có world data để áp dụng" };
    logStage("APPLY", "Áp dụng \"" + worldData.worldName + "\" vào game...");

    // Apply world base
    if (typeof window.createWorld === "function") {
      try { window.createWorld(); } catch(e) {}
    }
    if (window.world) {
      window.world.name = worldData.worldName || "Thế Giới AI";
      window.world.desc = worldData.worldDesc || "";
      window.world.genre = worldData.genre || "hybrid";
      window.world.civScore = worldData.civScore || 5000;
      window.world.aiGenerated = true;
      window.world.aiPrompt = worldData._sourcePrompt;
    }

    // Apply countries
    if (Array.isArray(worldData.countries) && Array.isArray(window.countries)) {
      worldData.countries.forEach(function(c, i) {
        if (window.countries[i]) {
          window.countries[i].name        = c.name || ("Quốc Gia " + (i + 1));
          window.countries[i].government  = c.government || "Quân Chủ";
          window.countries[i].population  = c.population || 100000;
          window.countries[i].power       = c.power || 50;
          window.countries[i].stability   = c.stability || 60;
          window.countries[i].religion    = c.religion || "Không rõ";
          window.countries[i].culture     = c.culture || "";
          window.countries[i].capital     = c.capital || c.name;
        } else {
          window.countries.push({
            name: c.name, government: c.government, population: c.population || 100000,
            power: c.power || 50, stability: c.stability || 60,
            religion: c.religion, culture: c.culture, capital: c.capital
          });
        }
      });
    }

    // Apply lore to history timeline
    if (worldData.lore) {
      var getYear = function() { return typeof window.year === "number" ? window.year : 1; };
      if (typeof window.htAddEvent === "function") {
        if (worldData.lore.originMyth)  window.htAddEvent({ year: 0, type: "myth",    title: "🌌 Khai Thiên: " + worldData.worldName, color: "#8b5cf6" });
        if (worldData.lore.firstAge)    window.htAddEvent({ year: 100, type: "age",   title: "🌅 Kỷ Nguyên Đầu: " + worldData.lore.firstAge.substring(0, 60), color: "#f59e0b" });
        if (worldData.lore.greatWar)    window.htAddEvent({ year: 500, type: "war",   title: "⚔️ Đại Chiến: " + worldData.lore.greatWar.substring(0, 60), color: "#ef4444" });
        if (worldData.lore.prophecy)    window.htAddEvent({ year: getYear(), type: "prophecy", title: "🔮 Tiên Tri: " + worldData.lore.prophecy.substring(0, 60), color: "#a78bfa" });
      }
      if (typeof window.wmeAddMemory === "function") {
        window.wmeAddMemory({ year: 0, category: "genesis", title: "🤖 AI Genesis: " + worldData.worldName, content: worldData.worldDesc });
        if (worldData.lore.legend) window.wmeAddMemory({ year: 100, category: "legend", title: "📜 Huyền Thoại", content: worldData.lore.legend });
      }
    }

    // Apply heroes as NPCs
    if (Array.isArray(worldData.heroes) && Array.isArray(window.npcs)) {
      worldData.heroes.forEach(function(h, i) {
        if (window.npcs[i]) {
          window.npcs[i].name  = h.name;
          window.npcs[i].title = h.title;
          window.npcs[i].power = h.power || 70;
        }
      });
    }

    // Record in history
    window.worldPipelineV75Data.appliedWorlds.unshift({
      worldName: worldData.worldName,
      genre: worldData.genre,
      prompt: worldData._sourcePrompt,
      appliedAt: new Date().toISOString().slice(0, 16),
      countries: (worldData.countries || []).length,
      races: (worldData.races || []).length
    });
    window.worldPipelineV75Data.stats.totalApplied++;
    if (typeof window.ag75SaveGeneration === "function" && window.aiGenesisV75Data && window.aiGenesisV75Data.currentGeneration) {
      window.aiGenesisV75Data.currentGeneration.status = "applied";
    }

    logStage("APPLIED", "✅ \"" + worldData.worldName + "\" đã được áp dụng vào game!");
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: typeof window.year === "number" ? window.year : 1, type: "genesis", title: "🤖 Thế Giới AI Khai Sinh: " + worldData.worldName, color: "#8b5cf6" });
    }
    save();
    return { ok: true, msg: "✅ Thế giới \"" + worldData.worldName + "\" đã được áp dụng thành công!" };
  };

  window.wgp75GetPending   = function() { return window.worldPipelineV75Data.pendingWorld; };
  window.wgp75GetApplied   = function() { return window.worldPipelineV75Data.appliedWorlds; };
  window.wgp75GetStageLog  = function() { return window.worldPipelineV75Data.stageLog; };
  window.wgp75GetStats     = function() { return window.worldPipelineV75Data.stats; };

  function init() {
    load();
    console.log("[WorldGenerationPipeline V75] 🌍 Pipeline Tạo Thế Giới khởi động — " + window.worldPipelineV75Data.appliedWorlds.length + " thế giới đã tạo trước đó · Sẵn sàng nhận prompt.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18600); });
  } else { setTimeout(init, 18600); }
})();
