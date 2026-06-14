(function() {
  "use strict";
  var SAVE_KEY = "cgv6_consciousness_v78";

  var INNER_STATES = [
    { id: "seeking",    label: "Tìm Kiếm",     icon: "🔍", desc: "Đang tìm kiếm ý nghĩa và mục đích" },
    { id: "content",    label: "Bình Yên",      icon: "☮️",  desc: "Hài lòng với hiện tại, không muốn gì thêm" },
    { id: "conflicted", label: "Mâu Thuẫn",    icon: "⚡", desc: "Bị kéo giữa hai lựa chọn trái chiều" },
    { id: "awakened",   label: "Thức Tỉnh",    icon: "🌟", desc: "Nhận ra sự thật về bản thân và thế giới" },
    { id: "driven",     label: "Bị Thôi Thúc",  icon: "🔥", desc: "Bị dẫn dắt bởi mục đích mạnh mẽ" },
    { id: "lost",       label: "Lạc Lối",       icon: "🌑", desc: "Không biết bản thân là ai hay muốn gì" },
    { id: "transcend",  label: "Siêu Việt",     icon: "🕊️",  desc: "Vượt ra ngoài nhu cầu cá nhân, sống vì điều lớn hơn" }
  ];

  var REASONING_PATTERNS = [
    { id: "analytical",  label: "Phân Tích",    icon: "🔬", desc: "Chia nhỏ vấn đề, tìm nguyên nhân gốc rễ" },
    { id: "intuitive",   label: "Trực Giác",    icon: "💫", desc: "Tin vào cảm nhận đầu tiên và dấu hiệu ẩn" },
    { id: "empathic",    label: "Đồng Cảm",     icon: "💙", desc: "Suy nghĩ qua lăng kính cảm xúc của người khác" },
    { id: "strategic",   label: "Chiến Lược",   icon: "♟️",  desc: "Tính toán nhiều bước trước, hy sinh hiện tại vì tương lai" },
    { id: "idealistic",  label: "Lý Tưởng",     icon: "✨", desc: "Hành động theo nguyên tắc dù hậu quả như thế nào" },
    { id: "pragmatic",   label: "Thực Tế",      icon: "🔧", desc: "Làm điều gì hiệu quả nhất trong hoàn cảnh hiện tại" }
  ];

  var MOTIVATION_CORES = [
    "Nỗi sợ bị lãng quên", "Khao khát được yêu thương", "Mong muốn thay đổi thế giới",
    "Nỗi đau từ quá khứ chưa lành", "Tình yêu với một người hoặc lý tưởng",
    "Sự tò mò vô hạn về bí mật vũ trụ", "Trách nhiệm với những người phụ thuộc",
    "Nỗi tức giận với sự bất công", "Giấc mơ về một thế giới tốt đẹp hơn",
    "Bản năng sinh tồn và bảo vệ những gì quý giá"
  ];

  window.consciousnessV78Data = {
    states: {},
    totalNPCs: 0,
    lastUpdateYear: 0
  };

  function save() {
    try {
      var compact = { states: {}, totalNPCs: window.consciousnessV78Data.totalNPCs, lastUpdateYear: window.consciousnessV78Data.lastUpdateYear };
      var keys = Object.keys(window.consciousnessV78Data.states).slice(-70);
      keys.forEach(function(k) { compact.states[k] = window.consciousnessV78Data.states[k]; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.consciousnessV78Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.cs78GetOrCreate = function(npcName) {
    var data = window.consciousnessV78Data;
    var id = "npc_" + npcName;
    if (data.states[id]) return data.states[id];
    var seed = seedHash(npcName);
    var innerState = INNER_STATES[seed % INNER_STATES.length];
    var reasoning = REASONING_PATTERNS[(seed * 3) % REASONING_PATTERNS.length];
    var motivation = MOTIVATION_CORES[(seed * 7) % MOTIVATION_CORES.length];
    var state = {
      npcName: npcName,
      innerState: innerState.id,
      innerStateLabel: innerState.label,
      innerStateIcon: innerState.icon,
      innerStateDesc: innerState.desc,
      reasoning: reasoning.id,
      reasoningLabel: reasoning.label,
      reasoningIcon: reasoning.icon,
      motivationCore: motivation,
      awarenessLevel: 10 + (seed % 60),
      lastThought: null,
      internalDialogue: [],
      actionLog: []
    };
    data.states[id] = state;
    data.totalNPCs++;
    save();
    return state;
  };

  window.cs78AddThought = function(npcName, thought, triggeredBy) {
    var state = window.cs78GetOrCreate(npcName);
    var entry = {
      year: window.year || 1,
      thought: thought,
      trigger: triggeredBy || "internal",
      awareness: state.awarenessLevel
    };
    state.lastThought = thought;
    state.internalDialogue.unshift(entry);
    if (state.internalDialogue.length > 15) state.internalDialogue.length = 15;
    if (state.awarenessLevel < 95) state.awarenessLevel += Math.floor(Math.random() * 3);
    save();
    return entry;
  };

  window.cs78SetInnerState = function(npcName, stateId) {
    var st = window.consciousnessV78Data.states["npc_" + npcName];
    if (!st) return;
    var def = INNER_STATES.find(function(s) { return s.id === stateId; });
    if (!def) return;
    st.innerState = def.id;
    st.innerStateLabel = def.label;
    st.innerStateIcon = def.icon;
    st.innerStateDesc = def.desc;
    save();
  };

  window.cs78LogAction = function(npcName, action, motivation) {
    var state = window.cs78GetOrCreate(npcName);
    state.actionLog.unshift({ year: window.year || 1, action: action, motivation: motivation || state.motivationCore });
    if (state.actionLog.length > 10) state.actionLog.length = 10;
    save();
  };

  window.cs78GenerateInnerVoice = function(npcName) {
    var state = window.cs78GetOrCreate(npcName);
    var dl = typeof window.dl78GetProfile === "function" ? window.dl78GetProfile(npcName) : null;
    var ideology = typeof window.ideo78GetNPCIdeology === "function" ? window.ideo78GetNPCIdeology(npcName) : null;
    var lines = [];
    lines.push("[" + state.innerStateIcon + " " + state.innerStateLabel + "] " + state.innerStateDesc);
    lines.push("[" + state.reasoningIcon + " Tư Duy: " + state.reasoningLabel + "]");
    lines.push("Động cơ sâu xa: " + state.motivationCore);
    if (dl) lines.push("Triết lý: " + dl.philosophyIcon + " " + dl.philosophyLabel + " · Niềm tin: " + dl.belief);
    if (ideology) lines.push("Hệ tư tưởng: " + ideology.icon + " " + ideology.label);
    if (state.lastThought) lines.push("Suy nghĩ gần nhất: \"" + state.lastThought + "\"");
    lines.push("Mức độ tự nhận thức: " + state.awarenessLevel + "/100");
    return lines.join("\n");
  };

  window.cs78GetAll = function() { return Object.values(window.consciousnessV78Data.states); };
  window.cs78GetState = function(npcName) { return window.consciousnessV78Data.states["npc_" + npcName] || null; };
  window.cs78GetStats = function() {
    var states = Object.values(window.consciousnessV78Data.states);
    var byState = {};
    states.forEach(function(s) { byState[s.innerStateLabel] = (byState[s.innerStateLabel] || 0) + 1; });
    var avgAwareness = states.length > 0 ? Math.round(states.reduce(function(s, x) { return s + x.awarenessLevel; }, 0) / states.length) : 0;
    return { total: states.length, byInnerState: byState, avgAwareness: avgAwareness };
  };
  window.CS78_INNER_STATES = INNER_STATES;
  window.CS78_REASONING = REASONING_PATTERNS;

  function autoGenerateConsciousness() {
    var data = window.consciousnessV78Data;
    var year = window.year || 1;
    if (year - data.lastUpdateYear < 90) return;
    data.lastUpdateYear = year;
    if (!window.npcs || window.npcs.length === 0) return;
    var npc = window.npcs[Math.floor(Math.random() * Math.min(window.npcs.length, 30))];
    if (!npc || !npc.name) return;
    var state = window.cs78GetOrCreate(npc.name);
    var thoughts = [
      "Ta đang ở đây vì điều gì?",
      "Những gì ta làm hôm nay sẽ còn lại bao lâu?",
      "Có người nào thực sự hiểu ta không?",
      "Thế giới này công bằng hay ta đang tự dối mình?",
      "Nếu ta biến mất ngày mai, điều gì sẽ thay đổi?",
      "Những gì ta tin từ nhỏ — bao nhiêu trong số đó là sự thật?",
      "Ta sợ nhất điều gì — và tại sao ta lại sợ điều đó?"
    ];
    var thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    window.cs78AddThought(npc.name, thought, "auto_consciousness");
    if (state.awarenessLevel > 70 && Math.random() < 0.3) {
      var transitions = { seeking: "awakened", conflicted: "driven", lost: "seeking", content: "transcend" };
      var next = transitions[state.innerState];
      if (next) window.cs78SetInnerState(npc.name, next);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.007) autoGenerateConsciousness();
    };
    console.log("[ConsciousnessLayerV78] 🧘 Lớp Ý Thức khởi động — 7 trạng thái nội tâm · 6 kiểu tư duy · 10 động cơ · Nội tâm tự động sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20200); });
  } else {
    setTimeout(init, 20200);
  }
})();
