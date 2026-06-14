(function() {
  "use strict";
  var SAVE_KEY = "cgv6_divine_oracle_v77";

  var ORACLE_TYPES = [
    { id: "world_fate",    label: "Vận Mệnh Thế Giới",  icon: "🌍", prompt: "Hãy tiên tri về vận mệnh tổng thể của thế giới này dựa trên lịch sử và trạng thái hiện tại." },
    { id: "npc_destiny",  label: "Số Phận NPC",         icon: "👤", prompt: "Hãy mô tả số phận của các nhân vật anh hùng đáng chú ý trong thế giới này." },
    { id: "war_outcome",  label: "Kết Cục Chiến Tranh",  icon: "⚔️",  prompt: "Hãy dự đoán kết cục của các cuộc chiến đang diễn ra trong thế giới." },
    { id: "divine_will",  label: "Thiên Ý Tạo Hóa",     icon: "✨", prompt: "Hãy giải thích ý chí của đấng tạo hóa trong vũ trụ này và con đường phía trước." },
    { id: "custom",       label: "Câu Hỏi Tự Do",        icon: "🔮", prompt: "" }
  ];

  window.divineOracleV77Data = {
    consultations: [],
    totalConsults: 0,
    isConsulting: false,
    lastConsultYear: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.divineOracleV77Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.divineOracleV77Data = JSON.parse(d);
    } catch(e) {}
  }

  function buildWorldContext() {
    var ctx = [];
    if (window.world && window.world.name) ctx.push("Thế giới: " + window.world.name);
    ctx.push("Năm hiện tại: " + (window.year || 1));
    if (window.countries) ctx.push("Số quốc gia: " + window.countries.length);
    if (window.npcs) ctx.push("Số sinh linh: " + window.npcs.length);
    if (window.warsActive && window.warsActive.length > 0) ctx.push("Chiến tranh đang diễn ra: " + window.warsActive.length);

    var prophecies = typeof window.ap77GetActive === "function" ? window.ap77GetActive() : [];
    if (prophecies.length > 0) {
      ctx.push("Tiên tri đang hoạt động: " + prophecies.slice(0, 3).map(function(p) { return p.text; }).join(" | "));
    }

    var playerScore = typeof window.ds77GetPlayerScore === "function" ? window.ds77GetPlayerScore() : null;
    if (playerScore) {
      ctx.push("Điểm định mệnh tạo hóa: " + playerScore.overall + "/100 (" + playerScore.tier + ")");
    }

    var topCountry = typeof window.ds77GetCountryScores === "function" ? window.ds77GetCountryScores()[0] : null;
    if (topCountry) {
      ctx.push("Quốc gia có vận mệnh cao nhất: " + topCountry.name + " (" + topCountry.overall + " điểm)");
    }

    if (window.ageV25Data && window.ageV25Data.currentAge) {
      ctx.push("Thời đại hiện tại: " + window.ageV25Data.currentAge.name);
    }

    return ctx.join("\n");
  }

  window.do77Consult = async function(oracleTypeId, customQuestion, onChunk) {
    var data = window.divineOracleV77Data;
    if (data.isConsulting) return { error: "Thần Sấm đang trả lời. Hãy chờ..." };
    data.isConsulting = true;

    var typeDef = ORACLE_TYPES.find(function(t) { return t.id === oracleTypeId; }) || ORACLE_TYPES[4];
    var question = (oracleTypeId === "custom" && customQuestion) ? customQuestion : typeDef.prompt;
    var worldCtx = buildWorldContext();

    var systemPrompt = [
      "Bạn là Thần Sấm Cổ Đại — một tiên tri huyền bí tồn tại từ trước khi vũ trụ hình thành.",
      "Bạn nói chuyện bằng tiếng Việt, theo phong cách cổ điển, huyền bí và sâu sắc.",
      "Mỗi câu trả lời dài 3-5 câu, giàu hình ảnh và ẩn dụ, mang tính tiên tri.",
      "Bạn không biết tất cả — đôi khi bạn đưa ra lời cảnh báo, đôi khi lời hứa hẹn.",
      "Context thế giới:\n" + worldCtx
    ].join("\n");

    var messages = [{ role: "user", content: question }];

    try {
      var resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 300, system: systemPrompt, messages: messages })
      });
      var json = await resp.json();
      var answer = (json.content && json.content[0]) ? json.content[0].text : "Thần Sấm im lặng. Vận mệnh chưa hé lộ.";

      var entry = {
        id: "oracle_" + Date.now(),
        type: oracleTypeId,
        typeLabel: typeDef.label,
        typeIcon: typeDef.icon,
        question: question,
        answer: answer,
        year: window.year || 1,
        timestamp: Date.now()
      };
      data.consultations.unshift(entry);
      if (data.consultations.length > 15) data.consultations.length = 15;
      data.totalConsults++;
      data.lastConsultYear = window.year || 1;
      data.isConsulting = false;
      save();
      return entry;
    } catch(e) {
      data.isConsulting = false;
      var fallback = {
        id: "oracle_" + Date.now(),
        type: oracleTypeId,
        typeLabel: typeDef.label,
        typeIcon: typeDef.icon,
        question: question,
        answer: "Màn đêm che phủ lời tiên tri. Hãy thử lại khi bầu trời quang đãng hơn.",
        year: window.year || 1,
        timestamp: Date.now()
      };
      data.consultations.unshift(fallback);
      if (data.consultations.length > 15) data.consultations.length = 15;
      data.isConsulting = false;
      save();
      return fallback;
    }
  };

  window.do77GetHistory = function() { return window.divineOracleV77Data.consultations.slice(); };
  window.do77GetStats = function() {
    var d = window.divineOracleV77Data;
    return {
      totalConsults: d.totalConsults,
      consultHistory: d.consultations.length,
      isConsulting: d.isConsulting,
      lastConsultYear: d.lastConsultYear
    };
  };
  window.DO77_ORACLE_TYPES = ORACLE_TYPES;

  function init() {
    load();
    console.log("[DivineOracleV77] 🔮 Thần Sấm Cổ Đại khởi động — " + window.divineOracleV77Data.totalConsults + " lần tham vấn · Claude claude-opus-4-5 · 5 loại câu hỏi sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19600); });
  } else {
    setTimeout(init, 19600);
  }
})();
