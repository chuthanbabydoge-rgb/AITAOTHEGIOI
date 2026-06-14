(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_evolution_v76";

  var EVO_TYPES = ["country","race","religion","technology","culture","language","creature"];
  var EVO_TRIGGERS = { minor: 80, major: 300, surprise: 600 };

  // Country name parts for procedural generation
  var NAME_PREFIX = ["Đại","Vạn","Thiên","Địa","Long","Phượng","Hắc","Kim","Huyền","Bạch","Hồng","Thái","Linh","Cổ","Thần"];
  var NAME_SUFFIX = ["Quốc","Vương","Đế","Bang","Triều","Hải","Sơn","Lâm","Thành","Tông","Môn","Phái","Liên","Minh"];
  var GOV_TYPES   = ["Quân Chủ","Cộng Hòa","Thần Quyền","Liên Bang","Đế Chế","Dân Chủ","Bộ Tộc","Hội Đồng"];
  var RACE_TRAITS = ["Trường Thọ","Sức Mạnh","Trí Tuệ","Tốc Độ","Phép Thuật","Sinh Tồn","Giao Thương","Chiến Đấu"];
  var TECH_NAMES  = ["Luyện Kim Tiên Tiến","Phép Thuật Nguyên Tố","Hàng Không Thuyền","Kết Tinh Linh Lực","Đan Dược Cao Cấp","Trận Pháp Hộ Thành","Nông Nghiệp Linh Thổ","Vũ Khí Cổ Đại"];
  var CULTURE_EVT = ["Lễ Hội Ra Đời","Nghệ Thuật Nở Rộ","Ngôn Ngữ Phân Nhánh","Phong Tục Mới","Triết Học Xuất Hiện","Kiến Trúc Cách Mạng"];
  var RELIGION_EVT= ["Giáo Phái Mới","Cuộc Cải Cách","Sụp Đổ Tín Ngưỡng","Phục Hưng Tôn Giáo","Thánh Chiến","Thần Mới Xuất Hiện"];
  var HERO_ROLES  = ["Anh Hùng","Phản Diện","Nhà Cải Cách","Nhà Tiên Tri","Hoàng Đế Mới","Ma Đầu","Thần Sứ","Bá Chủ"];

  window.universeEvoV76Data = {
    enabled: true,
    tickCounter: 0,
    totalEvolutions: 0,
    surpriseEvents: [],
    evolutionLog: [],
    emergentCountries: [],
    emergentRaces: [],
    emergentReligions: [],
    emergentTech: [],
    emergentHeroes: [],
    evolutionSpeed: 1,
    stats: { countries: 0, races: 0, religions: 0, tech: 0, heroes: 0, cultures: 0 },
    version: "V76"
  };

  function save() {
    try {
      var d = {
        enabled: window.universeEvoV76Data.enabled,
        totalEvolutions: window.universeEvoV76Data.totalEvolutions,
        evolutionLog: window.universeEvoV76Data.evolutionLog.slice(-50),
        emergentCountries: window.universeEvoV76Data.emergentCountries.slice(-20),
        emergentRaces: window.universeEvoV76Data.emergentRaces.slice(-20),
        emergentReligions: window.universeEvoV76Data.emergentReligions.slice(-20),
        emergentTech: window.universeEvoV76Data.emergentTech.slice(-20),
        emergentHeroes: window.universeEvoV76Data.emergentHeroes.slice(-30),
        surpriseEvents: window.universeEvoV76Data.surpriseEvents.slice(-30),
        stats: window.universeEvoV76Data.stats,
        version: "V76"
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) {
        var p = JSON.parse(d);
        Object.assign(window.universeEvoV76Data, p);
        window.universeEvoV76Data.tickCounter = 0;
      }
    } catch(e) {}
  }

  function rng(max) { return Math.floor(Math.random() * max); }
  function pick(arr) { return arr[rng(arr.length)]; }
  function randName() { return pick(NAME_PREFIX) + " " + pick(NAME_SUFFIX); }
  function getYear() { return typeof window.year === "number" ? window.year : 1; }

  function logEvo(type, msg, color) {
    var entry = { year: getYear(), type: type, msg: msg, color: color || "#a78bfa", time: Date.now() };
    window.universeEvoV76Data.evolutionLog.unshift(entry);
    if (window.universeEvoV76Data.evolutionLog.length > 100) window.universeEvoV76Data.evolutionLog.pop();
    window.universeEvoV76Data.totalEvolutions++;
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: getYear(), type: type, title: msg, color: color || "#8b5cf6" });
  }

  // ─── Evolution Generators ───────────────────────────────────
  window.uevo76GenerateCountry = function() {
    var name = randName() + "Quốc";
    var entry = {
      id: "ec_" + Date.now(),
      name: name,
      government: pick(GOV_TYPES),
      population: 10000 + rng(200000),
      power: 20 + rng(60),
      stability: 30 + rng(50),
      year: getYear(),
      emergent: true
    };
    window.universeEvoV76Data.emergentCountries.push(entry);
    window.universeEvoV76Data.stats.countries++;
    if (Array.isArray(window.countries)) window.countries.push(entry);
    logEvo("country", "🏰 Quốc gia mới xuất hiện: " + name + " (" + entry.government + ")", "#3b82f6");
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: getYear(), category: "emergence", title: "🏰 " + name + " khai quốc", content: "Quốc gia tự hình thành từ tiến hóa thế giới." });
    return entry;
  };

  window.uevo76GenerateRace = function() {
    var prefixes = ["Linh","Ảo","Huyền","Thiên","Địa","Minh","Ám","Cổ","Thần","Vạn"];
    var suffixes = ["Tộc","Nhân","Linh","Thể","Giống","Chủng","Hệ"];
    var name = pick(prefixes) + pick(suffixes);
    var entry = {
      id: "er_" + Date.now(),
      name: name,
      trait: pick(RACE_TRAITS),
      power: 20 + rng(60),
      magic: 10 + rng(80),
      wisdom: 20 + rng(70),
      population: 5000 + rng(50000),
      year: getYear(),
      emergent: true
    };
    window.universeEvoV76Data.emergentRaces.push(entry);
    window.universeEvoV76Data.stats.races++;
    logEvo("race", "🧬 Chủng tộc mới xuất hiện: " + name + " · Đặc trưng: " + entry.trait, "#a78bfa");
    return entry;
  };

  window.uevo76GenerateReligion = function() {
    var deityPfx = ["Thiên","Hắc","Linh","Cổ","Vạn","Thái","Huyền","Kim"];
    var deitySfx = ["Thần","Đế","Tôn","Chủ","Vương","Linh"];
    var relPfx   = ["Đạo","Tông","Giáo","Hội","Môn","Phái"];
    var deity = pick(deityPfx) + " " + pick(deitySfx);
    var relName = deity + " " + pick(relPfx);
    var events = [pick(RELIGION_EVT)];
    var entry = {
      id: "erel_" + Date.now(),
      name: relName,
      deity: deity,
      event: events[0],
      followers: 1000 + rng(100000),
      year: getYear(),
      emergent: true
    };
    window.universeEvoV76Data.emergentReligions.push(entry);
    window.universeEvoV76Data.stats.religions++;
    logEvo("religion", "⛩️ Tôn giáo mới: " + relName + " · " + events[0], "#f59e0b");
    return entry;
  };

  window.uevo76GenerateTech = function() {
    var tech = pick(TECH_NAMES) + " (Cấp " + (1 + rng(5)) + ")";
    var entry = { id: "et_" + Date.now(), name: tech, year: getYear(), emergent: true };
    window.universeEvoV76Data.emergentTech.push(entry);
    window.universeEvoV76Data.stats.tech++;
    logEvo("tech", "⚙️ Công nghệ mới phát minh: " + tech, "#10b981");
    return entry;
  };

  window.uevo76GenerateHero = function() {
    var heroNames = ["Lý Thiên","Vô Danh","Thiên Phong","Ảo Nguyệt","Hắc Long","Huyền Vũ","Kim Cương","Linh Tâm","Bạch Hổ","Thanh Kiếm"];
    var name = pick(heroNames) + " " + (pick(["Đại","Tiểu","Vạn","Thiên","Địa"])) + pick(["Tôn","Chủ","Hào","Kiếm","Đao"]);
    var role = pick(HERO_ROLES);
    var entry = {
      id: "eh_" + Date.now(),
      name: name,
      role: role,
      power: 50 + rng(50),
      country: window.universeEvoV76Data.emergentCountries.length > 0 ? pick(window.universeEvoV76Data.emergentCountries).name : "Vô Danh",
      year: getYear(),
      emergent: true
    };
    window.universeEvoV76Data.emergentHeroes.push(entry);
    window.universeEvoV76Data.stats.heroes++;
    logEvo("hero", "⚔️ Nhân vật mới xuất hiện: " + name + " [" + role + "]", "#ef4444");
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: getYear(), category: "hero", title: "⚔️ " + name + " — " + role, content: "Tự sinh từ tiến hóa thế giới. Quyền lực: " + entry.power + "/100." });
    return entry;
  };

  window.uevo76GenerateCultureEvent = function() {
    var evt = pick(CULTURE_EVT);
    window.universeEvoV76Data.stats.cultures++;
    logEvo("culture", "🎭 Văn hóa tiến hóa: " + evt, "#ec4899");
    return evt;
  };

  window.uevo76GenerateSurprise = function() {
    var surprises = [
      function() { return window.uevo76GenerateCountry(); },
      function() { return window.uevo76GenerateRace(); },
      function() { return window.uevo76GenerateReligion(); },
      function() { return window.uevo76GenerateTech(); },
      function() { return window.uevo76GenerateHero(); },
      function() { return window.uevo76GenerateCultureEvent(); }
    ];
    var result = pick(surprises)();
    var entry = { year: getYear(), result: result, time: Date.now() };
    window.universeEvoV76Data.surpriseEvents.push(entry);
    if (window.universeEvoV76Data.surpriseEvents.length > 50) window.universeEvoV76Data.surpriseEvents.shift();
    save();
    if (typeof window.uevo76RenderRefresh === "function") window.uevo76RenderRefresh();
    return result;
  };

  // ─── gameTick hook ──────────────────────────────────────────
  window.uevo76Tick = function() {
    if (!window.universeEvoV76Data.enabled) return;
    window.universeEvoV76Data.tickCounter++;
    var tc = window.universeEvoV76Data.tickCounter;
    var speed = window.universeEvoV76Data.evolutionSpeed || 1;

    // Minor evolution: culture/tech
    if (tc % Math.max(1, Math.floor(EVO_TRIGGERS.minor / speed)) === 0) {
      if (Math.random() < 0.4) window.uevo76GenerateCultureEvent();
      if (Math.random() < 0.25) window.uevo76GenerateTech();
    }
    // Major evolution: country/race/religion
    if (tc % Math.max(1, Math.floor(EVO_TRIGGERS.major / speed)) === 0) {
      var roll = Math.random();
      if (roll < 0.35) window.uevo76GenerateCountry();
      else if (roll < 0.6) window.uevo76GenerateRace();
      else window.uevo76GenerateReligion();
    }
    // Surprise event
    if (tc % Math.max(1, Math.floor(EVO_TRIGGERS.surprise / speed)) === 0) {
      if (Math.random() < 0.6) window.uevo76GenerateHero();
      save();
    }
    // Auto-save every 200 ticks
    if (tc % 200 === 0) save();
  };

  window.uevo76SetEnabled = function(v) { window.universeEvoV76Data.enabled = !!v; save(); };
  window.uevo76SetSpeed   = function(v) { window.universeEvoV76Data.evolutionSpeed = Math.max(0.1, Math.min(10, v)); save(); };
  window.uevo76GetLog     = function() { return window.universeEvoV76Data.evolutionLog; };
  window.uevo76GetStats   = function() { return window.universeEvoV76Data.stats; };
  window.uevo76GetAll     = function() { return window.universeEvoV76Data; };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.uevo76Tick(); };
    console.log("[UniverseEvolutionEngine V76] 🌱 Tiến Hóa Vũ Trụ khởi động — " + window.universeEvoV76Data.totalEvolutions + " tiến hóa đã xảy ra · Speed: " + window.universeEvoV76Data.evolutionSpeed + "x · " + (window.universeEvoV76Data.enabled ? "🟢 Đang chạy" : "🔴 Tắt") + " sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18800); });
  } else { setTimeout(init, 18800); }
})();
