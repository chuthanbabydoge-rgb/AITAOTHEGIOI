(function() {
  "use strict";
  var SAVE_KEY = "cgv6_self_reflection_v78";

  var REFLECTION_TYPES = [
    { id: "regret",    label: "Hối Tiếc",      icon: "😔", trigger: "failure" },
    { id: "pride",     label: "Tự Hào",        icon: "😤", trigger: "success" },
    { id: "doubt",     label: "Nghi Ngờ",      icon: "🤔", trigger: "conflict" },
    { id: "resolve",   label: "Quyết Tâm",     icon: "💪", trigger: "challenge" },
    { id: "wonder",    label: "Kinh Ngạc",     icon: "✨", trigger: "discovery" },
    { id: "sorrow",    label: "Đau Khổ",       icon: "😢", trigger: "loss" },
    { id: "wisdom",    label: "Minh Triết",    icon: "🦉", trigger: "age" },
    { id: "ambition",  label: "Khao Khát",     icon: "🔥", trigger: "inspiration" }
  ];

  var THOUGHT_CHANGE_TEMPLATES = [
    "Trước đây tôi tin {old_belief}. Nhưng sau {event}, tôi nhận ra {new_belief}.",
    "Tôi đã sai khi nghĩ rằng {old_belief}. {event} đã mở mắt cho tôi.",
    "{event} thay đổi tất cả. Bây giờ tôi hiểu rằng {new_belief}.",
    "Bao nhiêu năm tôi sống theo {old_belief}. Rồi {event} xảy ra và mọi thứ sụp đổ.",
    "Từ {event}, tôi học được: {new_belief}. Đây là bài học đắt giá nhất đời."
  ];

  var OLD_BELIEFS_POOL = [
    "quyền lực là tất cả", "không ai đáng tin", "số phận không thể thay đổi",
    "tri thức không có giá trị thực tế", "chiến tranh là không thể tránh khỏi",
    "người mạnh luôn đúng", "hạnh phúc đến từ của cải", "thần thánh không tồn tại"
  ];
  var NEW_BELIEFS_POOL = [
    "tình yêu mạnh hơn quyền lực", "một người bạn thật sự quý hơn ngàn kẻ thù",
    "ý chí có thể thay đổi vận mệnh", "tri thức cứu rỗi linh hồn",
    "hòa bình cần được tranh đấu hàng ngày", "người yếu có thể thay đổi thế giới",
    "hạnh phúc đến từ bên trong", "thần thánh hiện diện trong từng khoảnh khắc"
  ];

  window.selfReflectionV78Data = {
    reflections: {},
    totalReflections: 0,
    thoughtChanges: {},
    lastProcessYear: 0
  };

  function save() {
    try {
      var compact = {
        reflections: {}, thoughtChanges: {},
        totalReflections: window.selfReflectionV78Data.totalReflections,
        lastProcessYear: window.selfReflectionV78Data.lastProcessYear
      };
      var rkeys = Object.keys(window.selfReflectionV78Data.reflections).slice(-50);
      rkeys.forEach(function(k) { compact.reflections[k] = window.selfReflectionV78Data.reflections[k]; });
      var tkeys = Object.keys(window.selfReflectionV78Data.thoughtChanges).slice(-50);
      tkeys.forEach(function(k) { compact.thoughtChanges[k] = window.selfReflectionV78Data.thoughtChanges[k]; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.selfReflectionV78Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.sr78Reflect = function(npcName, reflectionTypeId, context) {
    var data = window.selfReflectionV78Data;
    var id = "npc_" + npcName;
    if (!data.reflections[id]) data.reflections[id] = [];
    var typeDef = REFLECTION_TYPES.find(function(t) { return t.id === reflectionTypeId; }) || REFLECTION_TYPES[0];
    var entry = {
      year: window.year || 1,
      type: reflectionTypeId,
      typeLabel: typeDef.label,
      typeIcon: typeDef.icon,
      context: context || ("Suy ngẫm về " + typeDef.label.toLowerCase()),
      selfAssessment: generateSelfAssessment(npcName, reflectionTypeId)
    };
    data.reflections[id].unshift(entry);
    if (data.reflections[id].length > 20) data.reflections[id].length = 20;
    data.totalReflections++;
    save();
    return entry;
  };

  function generateSelfAssessment(npcName, type) {
    var seed = seedHash(npcName + type + (window.year || 1));
    var assessments = {
      regret: ["Tôi đã có thể làm tốt hơn.", "Nếu được quay lại, tôi sẽ chọn khác.", "Quyết định đó ám ảnh tôi mãi."],
      pride: ["Đây là khoảnh khắc tôi tự hào nhất.", "Tôi đã làm điều mình tin là đúng.", "Không có gì thay được thành tựu này."],
      doubt: ["Liệu con đường này có đúng không?", "Tôi không còn chắc về những gì mình tin.", "Câu hỏi ngày càng nhiều hơn câu trả lời."],
      resolve: ["Không gì ngăn được tôi nữa.", "Tôi đã tìm ra mục đích của mình.", "Từ hôm nay, mọi thứ sẽ khác."],
      wonder: ["Thế giới rộng lớn hơn tôi nghĩ.", "Có bao nhiêu điều tôi chưa biết!", "Sự kỳ diệu hiện diện khắp nơi."],
      sorrow: ["Nỗi đau này sẽ không bao giờ biến mất.", "Mất đi người thân quý — trái tim trống rỗng.", "Nhưng chính đau khổ làm ta mạnh hơn."],
      wisdom: ["Nhiều năm đã qua, tôi hiểu ra rằng...", "Tuổi tác không cho ta câu trả lời — chỉ tốt hơn những câu hỏi.", "Minh triết đến từ những vết thương đã lành."],
      ambition: ["Tôi muốn nhiều hơn thế này.", "Con đường phía trước còn dài nhưng tôi không sợ.", "Ngọn lửa trong tôi chưa bao giờ tắt."]
    };
    var pool = assessments[type] || assessments.wonder;
    return pool[seed % pool.length];
  }

  window.sr78ChangeThought = function(npcName, eventDesc) {
    var data = window.selfReflectionV78Data;
    var id = "npc_" + npcName;
    if (!data.thoughtChanges[id]) data.thoughtChanges[id] = [];
    var seed = seedHash(npcName + (window.year || 1) + data.thoughtChanges[id].length);
    var template = THOUGHT_CHANGE_TEMPLATES[seed % THOUGHT_CHANGE_TEMPLATES.length];
    var oldBelief = OLD_BELIEFS_POOL[seed % OLD_BELIEFS_POOL.length];
    var newBelief = NEW_BELIEFS_POOL[(seed * 3) % NEW_BELIEFS_POOL.length];
    var text = template
      .replace(/\{old_belief\}/g, oldBelief)
      .replace(/\{new_belief\}/g, newBelief)
      .replace(/\{event\}/g, eventDesc || "biến cố lớn");
    var entry = {
      year: window.year || 1,
      text: text,
      oldBelief: oldBelief,
      newBelief: newBelief,
      event: eventDesc || "biến cố lớn"
    };
    data.thoughtChanges[id].unshift(entry);
    if (data.thoughtChanges[id].length > 10) data.thoughtChanges[id].length = 10;
    save();
    return entry;
  };

  window.sr78GetReflections = function(npcName) { return window.selfReflectionV78Data.reflections["npc_" + npcName] || []; };
  window.sr78GetThoughtChanges = function(npcName) { return window.selfReflectionV78Data.thoughtChanges["npc_" + npcName] || []; };
  window.sr78GetAllReflections = function() {
    var all = [];
    Object.keys(window.selfReflectionV78Data.reflections).forEach(function(k) {
      var name = k.replace("npc_", "");
      window.selfReflectionV78Data.reflections[k].slice(0, 2).forEach(function(r) {
        all.push(Object.assign({}, r, { npcName: name }));
      });
    });
    return all.sort(function(a, b) { return b.year - a.year; }).slice(0, 20);
  };
  window.sr78GetStats = function() {
    var d = window.selfReflectionV78Data;
    return { totalNPCs: Object.keys(d.reflections).length, totalReflections: d.totalReflections, thoughtChanges: Object.keys(d.thoughtChanges).length };
  };
  window.SR78_REFLECTION_TYPES = REFLECTION_TYPES;

  function autoReflect() {
    var data = window.selfReflectionV78Data;
    var year = window.year || 1;
    if (year - data.lastProcessYear < 80) return;
    data.lastProcessYear = year;
    if (!window.npcs || window.npcs.length === 0) return;
    var npc = window.npcs[Math.floor(Math.random() * Math.min(window.npcs.length, 30))];
    if (!npc || !npc.name) return;
    var types = ["regret", "pride", "doubt", "resolve", "wonder", "sorrow", "wisdom", "ambition"];
    var t = types[Math.floor(Math.random() * types.length)];
    window.sr78Reflect(npc.name, t);
    if (Math.random() < 0.3 && window.warsActive && window.warsActive.length > 0) {
      window.sr78ChangeThought(npc.name, "Đại chiến " + year);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.006) autoReflect();
    };
    console.log("[SelfReflectionEngineV78] 🪞 Tự Phản Chiếu khởi động — 8 loại suy ngẫm · Thay đổi tư tưởng · Auto-reflect từ sự kiện thế giới sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20000); });
  } else {
    setTimeout(init, 20000);
  }
})();
