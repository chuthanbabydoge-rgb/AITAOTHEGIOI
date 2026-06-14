(function() {
  "use strict";
  var SAVE_KEY = "cgv6_ideology_v78";

  var IDEOLOGY_TEMPLATES = [
    { id: "egalitarian",   label: "Bình Đẳng Luận",   icon: "⚖️",  domain: "politics",   desc: "Mọi người sinh ra bình đẳng và đáng có quyền lợi như nhau." },
    { id: "hierarchist",  label: "Đẳng Cấp Luận",    icon: "👑", domain: "politics",   desc: "Trật tự xã hội dựa trên tài năng và đức hạnh là tất yếu." },
    { id: "naturalist",   label: "Tự Nhiên Luận",     icon: "🌿", domain: "philosophy", desc: "Con người là một phần của thiên nhiên và nên sống hòa hợp với nó." },
    { id: "rationalist",  label: "Duy Lý Luận",       icon: "🔬", domain: "philosophy", desc: "Lý trí là công cụ duy nhất để hiểu thế giới." },
    { id: "mysticism",    label: "Thần Bí Luận",       icon: "🌀", domain: "religion",   desc: "Thực tại tối thượng nằm ngoài giới hạn của lý trí thông thường." },
    { id: "collectivism", label: "Tập Thể Luận",      icon: "🤝", domain: "social",     desc: "Lợi ích cộng đồng phải đặt trên lợi ích cá nhân." },
    { id: "individualism",label: "Cá Nhân Luận",      icon: "🦅", domain: "social",     desc: "Tự do cá nhân là giá trị tối cao không thể xâm phạm." },
    { id: "revolutionism",label: "Cách Mạng Luận",    icon: "⚡", domain: "politics",   desc: "Chỉ có thay đổi triệt để mới cải thiện được xã hội." },
    { id: "traditionalism",label: "Truyền Thống Luận", icon: "🏛️",  domain: "culture",    desc: "Trí tuệ của tổ tiên cần được gìn giữ và truyền lại." },
    { id: "progressivism", label: "Tiến Bộ Luận",     icon: "🚀", domain: "culture",    desc: "Nhân loại luôn tiến về phía trước — tốt hơn, mạnh hơn, sáng hơn." }
  ];

  var SCHOOL_NAMES = [
    "Học Phái Ánh Sáng", "Trường Phái Bóng Tối", "Môn Phái Thiên Sơn",
    "Tông Phái Hư Không", "Trường Phái Lửa Đỏ", "Học Phái Thiết Kiếm",
    "Môn Phái Ngọc Bích", "Học Viện Tinh Thần", "Trường Phái Đại Đạo",
    "Tông Phái Vô Vi", "Học Phái Kim Cương", "Môn Phái Thanh Phong"
  ];

  window.ideologyV78Data = {
    npcIdeologies: {},
    schools: [],
    movements: [],
    totalCreated: 0,
    lastSpawnYear: 0
  };

  function save() {
    try {
      var compact = {
        npcIdeologies: {}, schools: window.ideologyV78Data.schools.slice(-20),
        movements: window.ideologyV78Data.movements.slice(-15),
        totalCreated: window.ideologyV78Data.totalCreated,
        lastSpawnYear: window.ideologyV78Data.lastSpawnYear
      };
      var keys = Object.keys(window.ideologyV78Data.npcIdeologies).slice(-60);
      keys.forEach(function(k) { compact.npcIdeologies[k] = window.ideologyV78Data.npcIdeologies[k]; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.ideologyV78Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.ideo78AssignToNPC = function(npcName, ideologyId) {
    var data = window.ideologyV78Data;
    var id = "npc_" + npcName;
    var template = IDEOLOGY_TEMPLATES.find(function(t) { return t.id === ideologyId; });
    if (!ideologyId || !template) {
      var seed = seedHash(npcName);
      template = IDEOLOGY_TEMPLATES[seed % IDEOLOGY_TEMPLATES.length];
    }
    var existing = data.npcIdeologies[id];
    var prev = existing ? existing.label : null;
    data.npcIdeologies[id] = {
      npcName: npcName,
      ideologyId: template.id,
      label: template.label,
      icon: template.icon,
      domain: template.domain,
      desc: template.desc,
      adoptedYear: window.year || 1,
      previousIdeology: prev,
      influence: 0,
      followers: []
    };
    if (!existing) data.totalCreated++;
    save();
    return data.npcIdeologies[id];
  };

  window.ideo78GetNPCIdeology = function(npcName) {
    return window.ideologyV78Data.npcIdeologies["npc_" + npcName] || null;
  };

  window.ideo78SpawnSchool = function(founderName, ideologyId) {
    var data = window.ideologyV78Data;
    if (data.schools.length >= 20) data.schools.shift();
    var seed = seedHash((founderName || "anon") + (window.year || 1));
    var name = SCHOOL_NAMES[seed % SCHOOL_NAMES.length];
    var template = IDEOLOGY_TEMPLATES.find(function(t) { return t.id === ideologyId; }) || IDEOLOGY_TEMPLATES[seed % IDEOLOGY_TEMPLATES.length];
    var school = {
      id: "school_" + Date.now(),
      name: name,
      founder: founderName || "Vô Danh",
      ideology: template.label,
      ideologyIcon: template.icon,
      domain: template.domain,
      foundedYear: window.year || 1,
      doctrine: "Dựa trên " + template.desc,
      members: [founderName || "Vô Danh"],
      spread: Math.floor(Math.random() * 30) + 5,
      active: true
    };
    data.schools.push(school);
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: school.foundedYear, type: "ideology", title: template.icon + " Học Phái " + name + " thành lập bởi " + school.founder, color: "#9b59b6" });
    }
    save();
    return school;
  };

  window.ideo78SpawnMovement = function(npcName, type) {
    var data = window.ideologyV78Data;
    if (data.movements.length >= 15) data.movements.shift();
    var ideology = window.ideo78GetNPCIdeology(npcName);
    var types = { social: "Phong Trào Xã Hội", political: "Phong Trào Chính Trị", religious: "Phong Trào Tôn Giáo", academic: "Trường Phái Học Thuật" };
    var label = types[type] || types.social;
    var movement = {
      id: "mvmt_" + Date.now(),
      type: type || "social",
      label: label,
      leader: npcName,
      ideology: ideology ? ideology.label : "Không rõ",
      ideologyIcon: ideology ? ideology.icon : "🌀",
      startYear: window.year || 1,
      followers: 1 + Math.floor(Math.random() * 50),
      active: true
    };
    data.movements.push(movement);
    if (ideology) {
      ideology.influence += 10;
      ideology.followers.push(npcName);
    }
    if (typeof window.dl78AddExperience === "function") {
      window.dl78AddExperience(npcName, "movement", "Lãnh đạo " + label, 15);
    }
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: movement.startYear, type: "movement", title: "⚡ " + npcName + " khởi xướng " + label, color: "#e74c3c" });
    }
    save();
    return movement;
  };

  window.ideo78GetAll = function() { return Object.values(window.ideologyV78Data.npcIdeologies); };
  window.ideo78GetSchools = function() { return window.ideologyV78Data.schools.slice(); };
  window.ideo78GetMovements = function() { return window.ideologyV78Data.movements.slice(); };
  window.ideo78GetStats = function() {
    var d = window.ideologyV78Data;
    var byType = {};
    Object.values(d.npcIdeologies).forEach(function(n) { byType[n.label] = (byType[n.label] || 0) + 1; });
    return {
      totalNPCs: Object.keys(d.npcIdeologies).length,
      schools: d.schools.length,
      movements: d.movements.length,
      totalCreated: d.totalCreated,
      byIdeology: byType,
      templates: IDEOLOGY_TEMPLATES.map(function(t) { return { id: t.id, label: t.label, icon: t.icon }; })
    };
  };
  window.IDEO78_TEMPLATES = IDEOLOGY_TEMPLATES;

  function autoSpawnIdeology() {
    var data = window.ideologyV78Data;
    var year = window.year || 1;
    if (year - data.lastSpawnYear < 150) return;
    data.lastSpawnYear = year;
    if (!window.npcs || window.npcs.length === 0) return;
    var idx = Math.floor(Math.random() * Math.min(window.npcs.length, 30));
    var npc = window.npcs[idx];
    if (!npc || !npc.name) return;
    var existing = window.ideo78GetNPCIdeology(npc.name);
    if (!existing) {
      window.ideo78AssignToNPC(npc.name);
    }
    if (Math.random() < 0.25 && data.schools.length < 12) {
      window.ideo78SpawnSchool(npc.name, existing ? existing.ideologyId : null);
    }
    if (Math.random() < 0.15 && data.movements.length < 10) {
      var types = ["social", "political", "religious", "academic"];
      window.ideo78SpawnMovement(npc.name, types[Math.floor(Math.random() * types.length)]);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.005) autoSpawnIdeology();
    };
    console.log("[IdeologyEngineV78] 💡 Hệ Tư Tưởng khởi động — 10 hệ tư tưởng · Học phái · Phong trào · Auto-spawn sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20100); });
  } else {
    setTimeout(init, 20100);
  }
})();
