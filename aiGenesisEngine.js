(function() {
  "use strict";
  const SAVE_KEY = "cgv6_ai_genesis_v75";

  var WORLD_GENRES = [
    { id: "cultivation", name: "Tu Tiên",     emoji: "⚗️",  keywords: ["tu tiên","tu luyện","tiên","đan","kiếm","pháp","thánh","đạo","tu đạo","huyền","linh"] },
    { id: "fantasy",     name: "Kỳ Huyễn",   emoji: "⚔️",  keywords: ["fantasy","kỳ huyễn","phép thuật","rồng","elf","elfes","dwarf","thiên thần","ma quỷ","phù thủy"] },
    { id: "scifi",       name: "Khoa Học",    emoji: "🚀",  keywords: ["sci-fi","khoa học","không gian","vũ trụ","robot","ai","công nghệ","máy","tương lai","cyberpunk","cơ giới"] },
    { id: "mythology",   name: "Thần Thoại",  emoji: "⚡",  keywords: ["thần thoại","bắc âu","hy lạp","ai cập","norse","viking","zeus","odin","thor","ra","osiris","thần","huyền thoại"] },
    { id: "apocalypse",  name: "Tận Thế",     emoji: "☢️",  keywords: ["tận thế","zombie","apocalypse","hậu tận","sụp đổ","bệnh dịch","hạt nhân","wasteland","sinh tồn"] },
    { id: "cyberpunk",   name: "Cyberpunk",   emoji: "🤖",  keywords: ["cyberpunk","neo","hack","corp","neon","underground","điều khiển","não","implant","matrix"] },
    { id: "hybrid",      name: "Lai Ghép",    emoji: "🌀",  keywords: [] }
  ];

  var CLAUDE_MODEL = "claude-opus-4-5";

  window.aiGenesisV75Data = {
    generationHistory: [],
    currentGeneration: null,
    stats: {
      totalGenerated: 0,
      totalApplied: 0,
      claudeCalls: 0,
      failedCalls: 0
    },
    version: "V75"
  };

  window.GENESIS75_GENRES = WORLD_GENRES;

  function save() {
    try {
      var d = { generationHistory: window.aiGenesisV75Data.generationHistory.slice(-20), stats: window.aiGenesisV75Data.stats, version: "V75" };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        window.aiGenesisV75Data.generationHistory = p.generationHistory || [];
        window.aiGenesisV75Data.stats = p.stats || window.aiGenesisV75Data.stats;
      }
    } catch(e) {}
  }

  window.ag75DetectGenre = function(prompt) {
    var lower = (prompt || "").toLowerCase();
    for (var i = 0; i < WORLD_GENRES.length - 1; i++) {
      var g = WORLD_GENRES[i];
      for (var j = 0; j < g.keywords.length; j++) {
        if (lower.indexOf(g.keywords[j]) !== -1) return g;
      }
    }
    return WORLD_GENRES[WORLD_GENRES.length - 1]; // hybrid
  };

  window.ag75BuildSystemPrompt = function(prompt, genre) {
    return [
      "Bạn là AI Sáng Thế — chuyên gia tạo ra thế giới game mô phỏng.",
      "Nhiệm vụ: Dựa vào yêu cầu của người dùng, tạo ra một thế giới hoàn chỉnh.",
      "Thể loại phát hiện: " + (genre ? genre.name + " " + genre.emoji : "Hybrid 🌀"),
      "",
      "YÊU CẦU NGHIÊM NGẶT:",
      "1. Trả về JSON hợp lệ DUY NHẤT — không có text ngoài JSON.",
      "2. Không dùng markdown code blocks.",
      "3. Tất cả tên phải phù hợp thể loại " + (genre ? genre.name : "Hybrid") + ".",
      "4. Số liệu phải thực tế và nhất quán.",
      "",
      "JSON SCHEMA BẮT BUỘC:",
      JSON.stringify({
        worldName: "string — tên thế giới độc đáo",
        worldDesc: "string — mô tả tổng quan 2-3 câu",
        genre: genre ? genre.id : "hybrid",
        theme: "string — chủ đề cốt lõi",
        magicSystem: "string — hệ thống ma thuật/công nghệ",
        cosmology: "string — cấu trúc vũ trụ của thế giới này",
        countries: [
          { name: "string", government: "string", population: "number(10000-5000000)", power: "number(10-100)", stability: "number(10-100)", religion: "string", culture: "string", capital: "string", specialty: "string" }
        ],
        races: [
          { name: "string", desc: "string 1-2 câu", trait: "string — đặc trưng nổi bật", power: "number", magic: "number", wisdom: "number" }
        ],
        religions: [
          { name: "string", deity: "string — tên thần/đức tin", doctrine: "string 1 câu", followers: "number(1000-1000000)" }
        ],
        creatures: [
          { name: "string", type: "string", desc: "string 1 câu", power: "number(10-100)", rarity: "string" }
        ],
        lore: {
          originMyth: "string — huyền thoại khai thiên lập địa 2-3 câu",
          firstAge: "string — thời đại sơ khai",
          greatWar: "string — cuộc chiến lớn nhất lịch sử",
          prophecy: "string — tiên tri về tương lai",
          legend: "string — truyền thuyết nổi tiếng nhất"
        },
        heroes: [
          { name: "string", title: "string — danh hiệu", backstory: "string 1 câu", power: "number(50-100)" }
        ],
        economy: { type: "string", mainResource: "string", tradeRoutes: "number(1-10)" },
        scale: "string — Tiny/Small/Medium/Large/Massive",
        civScore: "number(1000-20000)"
      }, null, 2),
      "",
      "Tạo thế giới phù hợp yêu cầu: \"" + prompt + "\"",
      "Số lượng: 3-5 quốc gia, 3 chủng tộc, 2-3 tôn giáo, 3 sinh vật, 3 anh hùng."
    ].join("\n");
  };

  window.ag75CallClaude = async function(systemPrompt, userPrompt) {
    window.aiGenesisV75Data.stats.claudeCalls++;
    var body = JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt || "Hãy tạo thế giới theo yêu cầu trên." }]
    });
    try {
      var res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      });
      if (!res.ok) {
        window.aiGenesisV75Data.stats.failedCalls++;
        throw new Error("Claude API lỗi HTTP " + res.status);
      }
      var data = await res.json();
      var text = (data.content && data.content[0] && data.content[0].text) || "";
      return { ok: true, text: text };
    } catch(e) {
      window.aiGenesisV75Data.stats.failedCalls++;
      return { ok: false, error: e.message };
    }
  };

  window.ag75ParseWorldJSON = function(text) {
    try {
      var cleaned = text.trim();
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      var idx1 = cleaned.indexOf("{");
      var idx2 = cleaned.lastIndexOf("}");
      if (idx1 !== -1 && idx2 !== -1) cleaned = cleaned.substring(idx1, idx2 + 1);
      var parsed = JSON.parse(cleaned);
      if (!parsed.worldName || !parsed.countries) throw new Error("Thiếu trường bắt buộc");
      return { ok: true, world: parsed };
    } catch(e) {
      return { ok: false, error: "Không thể phân tích JSON: " + e.message, raw: text };
    }
  };

  window.ag75GetHistory = function() { return window.aiGenesisV75Data.generationHistory; };
  window.ag75GetStats   = function() { return window.aiGenesisV75Data.stats; };
  window.ag75GetCurrent = function() { return window.aiGenesisV75Data.currentGeneration; };
  window.ag75GetGenres  = function() { return WORLD_GENRES; };

  window.ag75SaveGeneration = function(entry) {
    entry.id = "gen_" + Date.now();
    entry.timestamp = new Date().toISOString().slice(0,16);
    window.aiGenesisV75Data.generationHistory.unshift(entry);
    if (window.aiGenesisV75Data.generationHistory.length > 30) {
      window.aiGenesisV75Data.generationHistory.pop();
    }
    window.aiGenesisV75Data.currentGeneration = entry;
    window.aiGenesisV75Data.stats.totalGenerated++;
    save();
  };

  function init() {
    load();
    console.log("[AIGenesisEngine V75] 🤖 AI Genesis Engine khởi động — Claude " + CLAUDE_MODEL + " · " + WORLD_GENRES.length + " thể loại · " + window.aiGenesisV75Data.generationHistory.length + " lịch sử tạo thế giới sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18400); });
  } else { setTimeout(init, 18400); }
})();
