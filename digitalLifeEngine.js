(function() {
  "use strict";
  var SAVE_KEY = "cgv6_digital_life_v78";

  var CORE_VALUES = [
    "Tự Do", "Quyền Lực", "Tri Thức", "Gia Đình", "Danh Dự",
    "Sự Thật", "Công Bằng", "Tôn Giáo", "Phiêu Lưu", "Hòa Bình",
    "Giàu Có", "Nghệ Thuật", "Thiên Nhiên", "Truyền Thống", "Đổi Mới"
  ];

  var BELIEFS = [
    "Số phận đã định — không thể thay đổi",
    "Ý chí con người vượt qua tất cả",
    "Thần thánh hiện diện trong mọi sự vật",
    "Chỉ có sức mạnh mới tạo ra sự thay đổi",
    "Tri thức là con đường đến giải phóng",
    "Gia đình là nền tảng của mọi thứ",
    "Cái đẹp là mục đích tối cao của tồn tại",
    "Chỉ có hiện tại tồn tại — quá khứ là ảo",
    "Thiên nhiên là thầy dạy vĩ đại nhất",
    "Mọi sự đều xuất phát từ nhân quả"
  ];

  var PHILOSOPHIES = [
    { id: "stoic",      label: "Khắc Kỷ",       icon: "🗿", desc: "Kiểm soát nội tâm, chấp nhận ngoại cảnh" },
    { id: "hedonist",   label: "Khoái Lạc",      icon: "🌸", desc: "Tìm kiếm niềm vui và tránh khổ đau" },
    { id: "utilitarian",label: "Vị Lợi",         icon: "⚖️",  desc: "Hành động vì lợi ích tối đa cho nhiều người nhất" },
    { id: "nihilist",   label: "Hư Vô",          icon: "🌑", desc: "Không có ý nghĩa tuyệt đối nào tồn tại" },
    { id: "idealist",   label: "Duy Tâm",        icon: "✨", desc: "Ý tưởng và tinh thần quan trọng hơn vật chất" },
    { id: "pragmatist", label: "Thực Dụng",      icon: "🔧", desc: "Chỉ điều gì hiệu quả mới là đúng" },
    { id: "fatalist",   label: "Định Mệnh Luận",  icon: "🌀", desc: "Mọi thứ đã được định trước" },
    { id: "empiricist", label: "Kinh Nghiệm Luận",icon: "🔬", desc: "Tri thức đến từ trải nghiệm thực tế" }
  ];

  var PERSONAL_GOALS = [
    { id: "power",      label: "Quyền Lực",   icon: "👑", drive: "Thống trị và kiểm soát" },
    { id: "knowledge",  label: "Tri Thức",    icon: "📚", drive: "Hiểu biết và khám phá" },
    { id: "family",     label: "Gia Đình",    icon: "🏠", drive: "Bảo vệ và nuôi dưỡng" },
    { id: "religion",   label: "Tôn Giáo",   icon: "⛪", drive: "Tìm kiếm thiêng liêng" },
    { id: "adventure",  label: "Khám Phá",   icon: "🗺️",  drive: "Đi xa và trải nghiệm" },
    { id: "legacy",     label: "Di Sản",      icon: "📜", drive: "Để lại dấu ấn lịch sử" },
    { id: "revolution", label: "Cách Mạng",  icon: "⚡", drive: "Thay đổi trật tự xã hội" },
    { id: "harmony",    label: "Hòa Hợp",    icon: "🕊️",  drive: "Xây dựng hòa bình" }
  ];

  window.digitalLifeV78Data = {
    profiles: {},
    totalProfiles: 0,
    lastSeedYear: 0
  };

  function save() {
    try {
      var compact = { profiles: {}, totalProfiles: window.digitalLifeV78Data.totalProfiles, lastSeedYear: window.digitalLifeV78Data.lastSeedYear };
      var keys = Object.keys(window.digitalLifeV78Data.profiles).slice(-80);
      keys.forEach(function(k) { compact.profiles[k] = window.digitalLifeV78Data.profiles[k]; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.digitalLifeV78Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.dl78GetOrCreate = function(npc) {
    if (!npc || !npc.name) return null;
    var id = "npc_" + npc.name;
    var data = window.digitalLifeV78Data;
    if (data.profiles[id]) return data.profiles[id];

    var seed = seedHash(npc.name);
    var coreValue1 = CORE_VALUES[seed % CORE_VALUES.length];
    var coreValue2 = CORE_VALUES[(seed + 7) % CORE_VALUES.length];
    var belief = BELIEFS[(seed * 3) % BELIEFS.length];
    var philosophy = PHILOSOPHIES[(seed * 5) % PHILOSOPHIES.length];
    var goalType = PERSONAL_GOALS[(seed * 2) % PERSONAL_GOALS.length];
    var secondGoal = PERSONAL_GOALS[(seed * 4 + 3) % PERSONAL_GOALS.length];

    var profile = {
      npcId: id,
      npcName: npc.name,
      birthYear: npc.birthYear || (window.year || 1),
      coreValues: [coreValue1, coreValue2],
      belief: belief,
      philosophyId: philosophy.id,
      philosophyLabel: philosophy.label,
      philosophyIcon: philosophy.icon,
      primaryGoal: { id: goalType.id, label: goalType.label, icon: goalType.icon, drive: goalType.drive, progress: 0 },
      secondaryGoal: { id: secondGoal.id, label: secondGoal.label, icon: secondGoal.icon },
      personalityTraits: generateTraits(seed),
      lifeExperiences: [],
      influenceScore: 0,
      movements: [],
      schoolsOfThought: [],
      version: 78
    };

    data.profiles[id] = profile;
    data.totalProfiles++;
    save();
    return profile;
  };

  function generateTraits(seed) {
    var traitPairs = [
      ["Dũng Cảm", "Nhút Nhát"],
      ["Thành Thật", "Xảo Trá"],
      ["Khoan Dung", "Nhẫn Tâm"],
      ["Tự Tin", "Tự Ti"],
      ["Tò Mò", "Bảo Thủ"],
      ["Hào Phóng", "Tham Lam"]
    ];
    return traitPairs.map(function(pair, i) {
      var value = ((seed * (i + 1) * 7) % 100);
      return { trait: pair[0], opposite: pair[1], value: value, dominant: value >= 50 ? pair[0] : pair[1] };
    });
  }

  window.dl78GetProfile = function(npcName) {
    return window.digitalLifeV78Data.profiles["npc_" + npcName] || null;
  };

  window.dl78AddExperience = function(npcName, type, title, impact) {
    var p = window.dl78GetProfile(npcName);
    if (!p) return;
    p.lifeExperiences.unshift({ year: window.year || 1, type: type, title: title, impact: impact || 0 });
    if (p.lifeExperiences.length > 30) p.lifeExperiences.length = 30;
    p.influenceScore = Math.min(100, p.influenceScore + Math.abs(impact || 1));
    save();
  };

  window.dl78GetTopInfluencers = function(limit) {
    var profiles = Object.values(window.digitalLifeV78Data.profiles);
    return profiles.sort(function(a, b) { return b.influenceScore - a.influenceScore; }).slice(0, limit || 10);
  };

  window.dl78GetAll = function() { return Object.values(window.digitalLifeV78Data.profiles); };
  window.dl78GetStats = function() {
    var profiles = Object.values(window.digitalLifeV78Data.profiles);
    var byPhilosophy = {};
    profiles.forEach(function(p) { byPhilosophy[p.philosophyLabel] = (byPhilosophy[p.philosophyLabel] || 0) + 1; });
    return { total: profiles.length, byPhilosophy: byPhilosophy, totalInfluence: profiles.reduce(function(s, p) { return s + p.influenceScore; }, 0) };
  };
  window.DL78_PHILOSOPHIES = PHILOSOPHIES;
  window.DL78_GOALS = PERSONAL_GOALS;
  window.DL78_VALUES = CORE_VALUES;

  function seedNPCProfiles() {
    var data = window.digitalLifeV78Data;
    var year = window.year || 1;
    if (year - data.lastSeedYear < 100 && data.totalProfiles > 0) return;
    if (!window.npcs || window.npcs.length === 0) return;
    var pool = window.npcs.slice(0, 25);
    pool.forEach(function(npc) { if (npc && npc.name) window.dl78GetOrCreate(npc); });
    data.lastSeedYear = year;
    save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.003) seedNPCProfiles();
    };
    setTimeout(seedNPCProfiles, 3000);
    console.log("[DigitalLifeEngineV78] 🧬 Digital Life khởi động — " + Object.keys(window.digitalLifeV78Data.profiles).length + " profile · 8 triết học · 8 mục tiêu · 15 giá trị sống sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19800); });
  } else {
    setTimeout(init, 19800);
  }
})();
