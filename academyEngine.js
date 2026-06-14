(function() {
  "use strict";
  var SAVE_KEY = "cgv6_academy_v79";

  var ACADEMY_TYPES = [
    { id: "military",   label: "Học Viện Quân Sự",   icon: "⚔️",  focus: "war",      output: "Chiến Lược Gia" },
    { id: "science",    label: "Viện Khoa Học",       icon: "🔬", focus: "academia", output: "Nhà Khoa Học" },
    { id: "philosophy", label: "Trường Phái Triết",   icon: "🤔", focus: "academia", output: "Triết Gia" },
    { id: "arts",       label: "Học Viện Nghệ Thuật", icon: "🎨", focus: "culture",  output: "Nghệ Nhân" },
    { id: "commerce",   label: "Trường Thương Mại",   icon: "💰", focus: "trade",    output: "Thương Gia" },
    { id: "theology",   label: "Trường Thần Học",     icon: "⛪", focus: "religion", output: "Thần Học Gia" },
    { id: "medicine",   label: "Trường Y Khoa",       icon: "⚕️",  focus: "academia", output: "Thầy Thuốc" },
    { id: "engineering",label: "Học Viện Kỹ Thuật",   icon: "⚙️",  focus: "academia", output: "Kỹ Sư" }
  ];

  var SCHOLAR_NAMES_POOL = [
    "Đại Sư Thương Khung", "Hiền Nhân Vô Danh", "Lão Phu Tử Bạch",
    "Học Giả Thiên Cơ", "Triết Nhân Hư Không", "Sư Phụ Nguyên Hạo",
    "Tiên Sinh Phong Vân", "Đạo Nhân Thanh Liên", "Học Sĩ Kim Bảng",
    "Hiền Sĩ Đông Phương", "Trí Giả Tây Sơn", "Đại Hiền Bắc Cực"
  ];

  window.academyV79Data = {
    academies: [],
    scholars: [],
    traditions: {},
    totalKnowledge: 0,
    lastSpawnYear: 0
  };

  function save() {
    try {
      var compact = {
        academies: window.academyV79Data.academies.slice(-25),
        scholars: window.academyV79Data.scholars.slice(-30),
        traditions: window.academyV79Data.traditions,
        totalKnowledge: window.academyV79Data.totalKnowledge,
        lastSpawnYear: window.academyV79Data.lastSpawnYear
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.academyV79Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.acad79FoundAcademy = function(countryName, typeId) {
    var data = window.academyV79Data;
    if (data.academies.length >= 25) data.academies.shift();
    var type = ACADEMY_TYPES.find(function(t) { return t.id === typeId; });
    if (!type) type = ACADEMY_TYPES[Math.floor(Math.random() * ACADEMY_TYPES.length)];
    var year = window.year || 1;
    var seed = seedHash(countryName + year);
    var suffix = ["Hoàng Gia", "Nhân Dân", "Thiên Tài", "Vĩ Đại", "Bất Diệt", "Thần Thánh"][seed % 6];
    var academy = {
      id: "acad_" + Date.now(),
      name: type.icon + " " + type.label + " " + suffix,
      country: countryName,
      type: type.id,
      typeLabel: type.label,
      icon: type.icon,
      focus: type.focus,
      output: type.output,
      foundedYear: year,
      graduates: 0,
      knowledgeOutput: 0,
      active: true
    };
    data.academies.push(academy);

    if (!data.traditions[countryName]) data.traditions[countryName] = [];
    if (!data.traditions[countryName].includes(type.id)) data.traditions[countryName].push(type.id);

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "academy", title: type.icon + " " + countryName + " thành lập " + academy.name, color: "#3498db" });
    }
    save();
    return academy;
  };

  window.acad79SpawnScholar = function(countryName, academyType) {
    var data = window.academyV79Data;
    if (data.scholars.length >= 30) data.scholars.shift();
    var seed = seedHash(countryName + (window.year || 1) + data.scholars.length);
    var name = SCHOLAR_NAMES_POOL[seed % SCHOLAR_NAMES_POOL.length];
    var type = ACADEMY_TYPES.find(function(t) { return t.id === academyType; }) || ACADEMY_TYPES[seed % ACADEMY_TYPES.length];
    var scholar = {
      id: "sch_" + Date.now(),
      name: name,
      country: countryName,
      specialty: type.output,
      specialtyIcon: type.icon,
      academyType: type.id,
      bornYear: window.year || 1,
      discoveries: [],
      influenceScore: 0,
      active: true
    };
    data.scholars.push(scholar);
    data.totalKnowledge += 5;
    save();
    return scholar;
  };

  window.acad79RecordDiscovery = function(scholarId, title, impact) {
    var data = window.academyV79Data;
    var scholar = data.scholars.find(function(s) { return s.id === scholarId; });
    if (!scholar) return;
    scholar.discoveries.push({ year: window.year || 1, title: title, impact: impact || 1 });
    scholar.influenceScore += impact || 1;
    data.totalKnowledge += impact || 1;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "knowledge", title: scholar.specialtyIcon + " " + scholar.name + " (" + scholar.country + "): " + title, color: "#9b59b6" });
    }
    save();
  };

  window.acad79GetAcademies = function(countryName) {
    if (countryName) return window.academyV79Data.academies.filter(function(a) { return a.country === countryName; });
    return window.academyV79Data.academies.slice();
  };
  window.acad79GetScholars = function(countryName) {
    if (countryName) return window.academyV79Data.scholars.filter(function(s) { return s.country === countryName; });
    return window.academyV79Data.scholars.slice();
  };
  window.acad79GetTraditions = function(countryName) { return window.academyV79Data.traditions[countryName] || []; };
  window.acad79GetStats = function() {
    var d = window.academyV79Data;
    return { academies: d.academies.length, scholars: d.scholars.length, totalKnowledge: d.totalKnowledge };
  };
  window.ACAD79_TYPES = ACADEMY_TYPES;

  function autoSpawn() {
    var data = window.academyV79Data;
    var year = window.year || 1;
    if (year - data.lastSpawnYear < 200) return;
    data.lastSpawnYear = year;
    if (!window.countries || window.countries.length === 0) return;
    var c = window.countries[Math.floor(Math.random() * Math.min(window.countries.length, 15))];
    if (!c || !c.name) return;
    var seed = seedHash(c.name + year);
    var type = ACADEMY_TYPES[seed % ACADEMY_TYPES.length];
    var academy = window.acad79FoundAcademy(c.name, type.id);
    if (Math.random() < 0.6) {
      var scholar = window.acad79SpawnScholar(c.name, type.id);
      if (Math.random() < 0.4) {
        var discoveries = ["Lý thuyết trọng lực địa phương", "Phương pháp canh tác mới", "Thuật giả kim nâng cao", "Luận về vũ trụ vô cực", "Bản đồ thiên văn chính xác", "Bài thuốc trị đại dịch"];
        window.acad79RecordDiscovery(scholar.id, discoveries[seed % discoveries.length], 2 + Math.floor(Math.random() * 4));
      }
    }
    // Graduate scholars boost knowledge output
    data.academies.filter(function(a) { return a.active; }).forEach(function(a) {
      a.graduates++;
      a.knowledgeOutput += 2;
      data.totalKnowledge += 2;
    });
    save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.004) autoSpawn();
    };
    console.log("[AcademyEngineV79] 🎓 Học Viện khởi động — 8 loại học viện · 12 tên học giả · Tri thức lan truyền · Auto-spawn 200 năm sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20700); });
  } else {
    setTimeout(init, 20700);
  }
})();
