(function() {
  "use strict";
  const SAVE_KEY = "cgv6_prompt_world_v75";

  var PROMPT_TEMPLATES = [
    { id: "nordic",    label: "⚡ Thần Thoại Bắc Âu",   prompt: "Tạo thế giới thần thoại Bắc Âu nơi Ragnarok chưa từng xảy ra. Odin vẫn trị vì, nhưng Loki đã lập đế quốc bóng tối riêng." },
    { id: "xianxia",   label: "⚗️ Tu Tiên Hắc Ám",     prompt: "Tạo thế giới tu tiên hắc ám nơi ma đạo thống trị. Chính đạo đang sụp đổ, ma tôn nắm quyền kiểm soát thiên đạo." },
    { id: "scifi",     label: "🚀 Khoa Học Viễn Tưởng",  prompt: "Tạo thế giới khoa học viễn tưởng 5000 năm tương lai. AI đã giác ngộ và cùng tồn tại với loài người trong một liên bang thiên hà." },
    { id: "zombie",    label: "☢️ Tận Thế Sinh Hóa",    prompt: "Tạo thế giới hậu tận thế sau đại dịch zombie 200 năm. Loài người đã tiến hóa miễn dịch nhưng xã hội đã phân mảnh thành các thành bang độc lập." },
    { id: "greek",     label: "🏛️ Hy Lạp Cổ Đại",      prompt: "Tạo thế giới thần thoại Hy Lạp nơi các thần Olympus vẫn trực tiếp can thiệp. Athena và Ares đang trong cuộc chiến lạnh." },
    { id: "cyberpunk", label: "🤖 Cyberpunk Neo",       prompt: "Tạo thế giới cyberpunk năm 2247. Các tập đoàn mega-corp kiểm soát chính phủ, hackers là những anh hùng cuối cùng của tự do." },
    { id: "eastern",   label: "🐉 Đông Phương Kỳ Bí",   prompt: "Tạo thế giới fantasy đông phương với rồng, phượng hoàng, và hệ thống tu luyện nội công. Thiên triều đang sụp đổ sau 1000 năm thịnh vượng." }
  ];

  var KEYWORD_HINTS = {
    dark:    ["hắc ám","tối tăm","bóng tối","ma đạo","tà ác","ác"],
    light:   ["thiên đường","ánh sáng","thánh","chính đạo","hòa bình"],
    war:     ["chiến tranh","xung đột","chinh phạt","bá quyền","loạn"],
    ancient: ["cổ đại","thượng cổ","ngàn năm","huyền sử"],
    fallen:  ["sụp đổ","suy tàn","tàn lụi","diệt vong","mất mát"]
  };

  window.promptToWorldV75Data = {
    savedPrompts: [],
    currentPrompt: "",
    currentAnalysis: null,
    version: "V75"
  };

  window.PROMPT75_TEMPLATES = PROMPT_TEMPLATES;

  function save() {
    try {
      var d = { savedPrompts: window.promptToWorldV75Data.savedPrompts.slice(-10), currentPrompt: window.promptToWorldV75Data.currentPrompt, version: "V75" };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        window.promptToWorldV75Data.savedPrompts = p.savedPrompts || [];
        window.promptToWorldV75Data.currentPrompt = p.currentPrompt || "";
      }
    } catch(e) {}
  }

  window.ptw75AnalyzePrompt = function(prompt) {
    if (!prompt || prompt.trim().length < 3) return { ok: false, msg: "Prompt quá ngắn!" };
    var lower = prompt.toLowerCase();
    var genre = typeof window.ag75DetectGenre === "function" ? window.ag75DetectGenre(prompt) : { id: "hybrid", name: "Lai Ghép", emoji: "🌀" };
    var hints = [];
    Object.keys(KEYWORD_HINTS).forEach(function(k) {
      KEYWORD_HINTS[k].forEach(function(kw) {
        if (lower.indexOf(kw) !== -1) hints.push(k);
      });
    });
    var wordCount = prompt.trim().split(/\s+/).length;
    var complexity = wordCount > 20 ? "Cao" : wordCount > 8 ? "Trung Bình" : "Đơn Giản";
    var analysis = {
      prompt: prompt,
      genre: genre,
      hints: hints,
      wordCount: wordCount,
      complexity: complexity,
      estimatedTime: "15-45 giây",
      features: {
        countries: hints.indexOf("war") !== -1 ? "5 quốc gia (nhiều xung đột)" : "3-4 quốc gia",
        tone: hints.indexOf("dark") !== -1 ? "Hắc Ám / Bi Kịch" : hints.indexOf("light") !== -1 ? "Hùng Tráng / Anh Hùng" : "Cân Bằng",
        era: hints.indexOf("ancient") !== -1 ? "Cổ Đại" : "Trung Đại đến Cận Đại",
        state: hints.indexOf("fallen") !== -1 ? "Thế Giới Đang Sụp Đổ" : "Thế Giới Đang Phát Triển"
      }
    };
    window.promptToWorldV75Data.currentAnalysis = analysis;
    window.promptToWorldV75Data.currentPrompt = prompt;
    save();
    return { ok: true, analysis: analysis };
  };

  window.ptw75BuildFullPrompt = function(userPrompt, extraContext) {
    var analysis = window.ptw75AnalyzePrompt(userPrompt);
    if (!analysis.ok) return null;
    var genre = analysis.analysis.genre;
    var hints = analysis.analysis.hints;
    var sysPrompt = typeof window.ag75BuildSystemPrompt === "function"
      ? window.ag75BuildSystemPrompt(userPrompt, genre)
      : "Tạo thế giới game dựa vào yêu cầu. Trả về JSON.";
    var darkNote = hints.indexOf("dark") !== -1 ? "\nLưu ý đặc biệt: Thế giới cần có tông màu hắc ám, bi kịch. Các quốc gia nên có stability thấp (20-50)." : "";
    var warNote = hints.indexOf("war") !== -1 ? "\nLưu ý đặc biệt: Cần nhiều xung đột, power chênh lệch lớn, nhiều quốc gia thù địch nhau." : "";
    sysPrompt += darkNote + warNote;
    if (extraContext) sysPrompt += "\nContext thêm: " + extraContext;
    return { systemPrompt: sysPrompt, genre: genre, analysis: analysis.analysis };
  };

  window.ptw75SavePrompt = function(prompt, label) {
    var entry = { prompt: prompt, label: label || prompt.substring(0, 40) + "...", timestamp: new Date().toISOString().slice(0, 16) };
    window.promptToWorldV75Data.savedPrompts.unshift(entry);
    if (window.promptToWorldV75Data.savedPrompts.length > 10) window.promptToWorldV75Data.savedPrompts.pop();
    save();
    return { ok: true, msg: "✅ Prompt đã lưu!" };
  };

  window.ptw75GetTemplates  = function() { return PROMPT_TEMPLATES; };
  window.ptw75GetSaved      = function() { return window.promptToWorldV75Data.savedPrompts; };
  window.ptw75GetCurrent    = function() { return window.promptToWorldV75Data.currentPrompt; };
  window.ptw75GetAnalysis   = function() { return window.promptToWorldV75Data.currentAnalysis; };

  function init() {
    load();
    console.log("[PromptToWorldEngine V75] ✏️ Prompt→World Engine khởi động — " + PROMPT_TEMPLATES.length + " template · " + window.promptToWorldV75Data.savedPrompts.length + " prompt đã lưu sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18500); });
  } else { setTimeout(init, 18500); }
})();
