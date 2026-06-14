(function() {
  "use strict";
  var SAVE_KEY = "cgv6_civ_consciousness_v79";

  var CIV_GOALS = [
    { id: "conquest",    label: "Chinh Phục",  icon: "⚔️",  desc: "Mở rộng lãnh thổ và thống trị láng giềng" },
    { id: "peace",       label: "Hòa Bình",   icon: "🕊️",  desc: "Xây dựng thịnh vượng qua hợp tác và thương mại" },
    { id: "exploration", label: "Khai Phá",   icon: "🗺️",  desc: "Khám phá đất mới, ghi lại bản đồ thế giới" },
    { id: "knowledge",   label: "Tri Thức",   icon: "📚", desc: "Tích lũy học thuật và khoa học vượt trội" },
    { id: "spiritual",   label: "Tâm Linh",   icon: "✨", desc: "Tìm kiếm giác ngộ và kết nối thần thánh" }
  ];

  var CIV_VALUES = [
    "Danh Dự", "Quyền Lực", "Tri Thức", "Tự Do", "Trật Tự",
    "Gia Đình", "Đất Đai", "Tôn Giáo", "Thương Mại", "Nghệ Thuật"
  ];

  var CIV_IDENTITY_ARCHETYPES = [
    { id: "warrior",   label: "Chiến Binh",  icon: "⚔️",  desc: "Sức mạnh quân sự là nền tảng tồn tại" },
    { id: "merchant",  label: "Thương Gia",  icon: "💰", desc: "Thịnh vượng qua trao đổi và kết nối" },
    { id: "scholar",   label: "Học Giả",     icon: "📚", desc: "Tri thức là quyền lực tối thượng" },
    { id: "spiritual", label: "Tâm Linh",   icon: "🌀", desc: "Thần thánh hướng dẫn từng quyết định" },
    { id: "builder",   label: "Người Xây Dựng", icon: "🏛️", desc: "Di sản kiến trúc vĩ đại là mục tiêu" },
    { id: "nomad",     label: "Du Mục",      icon: "🌾", desc: "Tự do di chuyển, không bị ràng buộc lãnh thổ" },
    { id: "diplomat",  label: "Nhà Ngoại Giao", icon: "🤝", desc: "Liên minh và hiệp ước là vũ khí mạnh nhất" },
    { id: "rebel",     label: "Cách Mạng",   icon: "⚡", desc: "Thách thức trật tự cũ, tạo ra kỷ nguyên mới" }
  ];

  window.civConsciousnessV79Data = {
    profiles: {},
    totalProfiles: 0,
    lastSeedYear: 0
  };

  function save() {
    try {
      var d = JSON.stringify(window.civConsciousnessV79Data);
      localStorage.setItem(SAVE_KEY, d);
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.civConsciousnessV79Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.cce79GetOrCreate = function(country) {
    if (!country || !country.name) return null;
    var data = window.civConsciousnessV79Data;
    var id = "civ_" + country.name;
    if (data.profiles[id]) return data.profiles[id];

    var seed = seedHash(country.name);
    var goal = CIV_GOALS[seed % CIV_GOALS.length];
    var archetype = CIV_IDENTITY_ARCHETYPES[(seed * 3) % CIV_IDENTITY_ARCHETYPES.length];
    var val1 = CIV_VALUES[seed % CIV_VALUES.length];
    var val2 = CIV_VALUES[(seed * 7) % CIV_VALUES.length];
    if (val2 === val1) val2 = CIV_VALUES[(seed * 7 + 1) % CIV_VALUES.length];

    var profile = {
      civId: id,
      name: country.name,
      foundedYear: country.birthYear || (window.year || 1),
      goal: goal,
      archetype: archetype,
      coreValues: [val1, val2],
      cohesion: 50 + (seed % 40),
      prestige: 10 + (seed % 30),
      ideologicalTension: 0,
      neighborRelations: {},
      uniqueTraits: generateUniqueTraits(seed),
      consciousnessLevel: 20 + (seed % 50),
      lastEvent: null,
      version: 79
    };

    data.profiles[id] = profile;
    data.totalProfiles++;
    save();
    return profile;
  };

  function generateUniqueTraits(seed) {
    var traits = [
      "Kiêu Hãnh Dân Tộc", "Tính Kỷ Luật Cao", "Yêu Thiên Nhiên", "Sùng Bái Tổ Tiên",
      "Ham Học Hỏi", "Trọng Nghĩa Khí", "Trọng Thương Mại", "Thích Phiêu Lưu",
      "Bảo Thủ Truyền Thống", "Cởi Mở Với Ngoại Bang", "Tự Cung Tự Cấp", "Phụ Thuộc Thương Mại"
    ];
    var t1 = traits[seed % traits.length];
    var t2 = traits[(seed * 5) % traits.length];
    return t1 === t2 ? [t1] : [t1, t2];
  }

  window.cce79GetProfile = function(countryName) {
    return window.civConsciousnessV79Data.profiles["civ_" + countryName] || null;
  };

  window.cce79UpdateCohesion = function(countryName, delta) {
    var p = window.cce79GetProfile(countryName);
    if (!p) return;
    p.cohesion = Math.max(0, Math.min(100, p.cohesion + delta));
    p.consciousnessLevel = Math.max(0, Math.min(100, p.consciousnessLevel + Math.abs(delta) * 0.3));
    save();
  };

  window.cce79AddIdeologicalTension = function(civA, civB, amount) {
    var pA = window.cce79GetProfile(civA);
    var pB = window.cce79GetProfile(civB);
    if (pA) { pA.ideologicalTension = Math.min(100, pA.ideologicalTension + amount); pA.neighborRelations[civB] = "conflict"; }
    if (pB) { pB.ideologicalTension = Math.min(100, pB.ideologicalTension + amount); pB.neighborRelations[civA] = "conflict"; }
    save();
  };

  window.cce79GetJarvisAnalysis = function(countryName) {
    var p = window.cce79GetProfile(countryName);
    if (!p) return "Chưa có dữ liệu nền văn minh này.";
    var age = (window.year || 1) - p.foundedYear;
    var tier = p.consciousnessLevel > 75 ? "Thức Tỉnh" : p.consciousnessLevel > 50 ? "Trưởng Thành" : p.consciousnessLevel > 25 ? "Đang Hình Thành" : "Sơ Khai";
    return [
      "📊 PHÂN TÍCH VĂN MINH: " + p.name,
      "Tuổi: " + age + " năm · Cấp độ ý thức: " + tier + " (" + p.consciousnessLevel + "/100)",
      "Căn Tính: " + p.archetype.icon + " " + p.archetype.label + " — " + p.archetype.desc,
      "Mục Tiêu: " + p.goal.icon + " " + p.goal.label + " — " + p.goal.desc,
      "Giá Trị Cốt Lõi: " + p.coreValues.join(" · "),
      "Đặc Tính: " + p.uniqueTraits.join(" · "),
      "Đoàn Kết: " + p.cohesion + "/100 · Uy Tín: " + p.prestige + "/100",
      "Xung Đột Tư Tưởng: " + p.ideologicalTension + "/100",
      p.ideologicalTension > 60 ? "⚠️ Nguy cơ bùng nổ xung đột tư tưởng cao!" : "Tình hình tư tưởng ổn định."
    ].join("\n");
  };

  window.cce79GetAll = function() { return Object.values(window.civConsciousnessV79Data.profiles); };
  window.cce79GetStats = function() {
    var profiles = Object.values(window.civConsciousnessV79Data.profiles);
    var byGoal = {};
    profiles.forEach(function(p) { byGoal[p.goal.label] = (byGoal[p.goal.label] || 0) + 1; });
    return { total: profiles.length, byGoal: byGoal, avgCohesion: profiles.length ? Math.round(profiles.reduce(function(s, p) { return s + p.cohesion; }, 0) / profiles.length) : 0 };
  };
  window.CCE79_GOALS = CIV_GOALS;
  window.CCE79_ARCHETYPES = CIV_IDENTITY_ARCHETYPES;

  function seedCountries() {
    var data = window.civConsciousnessV79Data;
    var year = window.year || 1;
    if (year - data.lastSeedYear < 200 && data.totalProfiles > 0) return;
    if (!window.countries || window.countries.length === 0) return;
    window.countries.slice(0, 20).forEach(function(c) { if (c && c.name) window.cce79GetOrCreate(c); });
    data.lastSeedYear = year;

    // Scan ideological conflict with V78
    Object.values(data.profiles).forEach(function(pA) {
      Object.values(data.profiles).forEach(function(pB) {
        if (pA.name === pB.name) return;
        if (pA.goal.id === "conquest" && pB.goal.id === "peace") {
          window.cce79AddIdeologicalTension(pA.name, pB.name, 5);
        }
      });
    });
    save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.004) seedCountries();
      if (Math.random() < 0.003) {
        var profiles = Object.values(window.civConsciousnessV79Data.profiles);
        if (profiles.length > 0) {
          var p = profiles[Math.floor(Math.random() * profiles.length)];
          if (window.warsActive && window.warsActive.length > 0) window.cce79UpdateCohesion(p.name, -3);
          else window.cce79UpdateCohesion(p.name, 1);
        }
      }
    };
    setTimeout(seedCountries, 3000);
    console.log("[CivConsciousnessV79] 🏛️ Ý Thức Văn Minh khởi động — 5 mục tiêu · 8 căn tính · 10 giá trị · Xung đột tư tưởng sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20400); });
  } else {
    setTimeout(init, 20400);
  }
})();
