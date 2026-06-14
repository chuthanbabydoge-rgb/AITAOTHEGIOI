(function() {
  "use strict";
  const SAVE_KEY = "cgv6_emergent_civ_v76";

  var PHILOSOPHY_LIST = ["Chủ Nghĩa Thiên Đạo","Thực Dụng Chiến Lược","Hòa Bình Chủ Nghĩa","Bá Quyền Chủ Nghĩa","Tự Do Tư Tưởng","Luân Lý Học Mới","Nhân Đạo Chủ Nghĩa","Huyền Học Cổ Đại"];
  var ARCHITECTURE_STYLES = ["Thiên Tháp Vạn Trượng","Thành Trì Linh Thạch","Hầm Ngầm Thần Bí","Phù Không Kiến Trúc","Cổ Đại Đại Quan","Kim Tự Tháp Linh Lực","Rừng Tháp San Hô","Cung Điện Băng Tuyết"];
  var LAW_TYPES = ["Bộ Luật Thiên Đạo","Hiến Pháp Tự Do","Luật Chiến Binh","Giáo Luật Thần Thánh","Luật Thương Nhân","Bộ Luật Cổ Đại","Hiệp Ước Quốc Tế","Luật Tiến Hóa"];
  var COLLAPSE_REASONS = ["Nội Chiến Kéo Dài","Thiên Tai Liên Tiếp","Tham Nhũng Cao Độ","Xâm Lược Ngoại Bang","Cách Mạng Tôn Giáo","Kinh Tế Sụp Đổ","Đại Dịch Toàn Quốc","Thiếu Người Kế Vị"];
  var MERGE_PREFIXES = ["Đại","Liên","Siêu","Thần","Vạn","Cổ","Tân","Hợp"];

  window.emergentCivV76Data = {
    civEvolutions: [],
    collapsedCivs: [],
    mergedCivs: [],
    inventions: [],
    laws: [],
    philosophies: [],
    architectures: [],
    tickCounter: 0,
    stats: { evolutions: 0, collapses: 0, merges: 0, inventions: 0 },
    version: "V76"
  };

  function save() {
    try {
      var d = {
        civEvolutions: window.emergentCivV76Data.civEvolutions.slice(-30),
        collapsedCivs: window.emergentCivV76Data.collapsedCivs.slice(-20),
        mergedCivs: window.emergentCivV76Data.mergedCivs.slice(-20),
        inventions: window.emergentCivV76Data.inventions.slice(-30),
        laws: window.emergentCivV76Data.laws.slice(-20),
        philosophies: window.emergentCivV76Data.philosophies.slice(-20),
        architectures: window.emergentCivV76Data.architectures.slice(-20),
        stats: window.emergentCivV76Data.stats,
        version: "V76"
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) { var p = JSON.parse(d); Object.assign(window.emergentCivV76Data, p); window.emergentCivV76Data.tickCounter = 0; }
    } catch(e) {}
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getYear() { return typeof window.year === "number" ? window.year : 1; }
  function getCountryName() {
    if (Array.isArray(window.countries) && window.countries.length > 0) {
      var c = pick(window.countries);
      return c && c.name ? c.name : "Vô Danh";
    }
    return "Vô Danh";
  }

  function logCivEvent(type, msg, color) {
    var entry = { year: getYear(), type: type, msg: msg, color: color || "#8b5cf6", time: Date.now() };
    window.emergentCivV76Data.civEvolutions.unshift(entry);
    if (window.emergentCivV76Data.civEvolutions.length > 60) window.emergentCivV76Data.civEvolutions.pop();
    window.emergentCivV76Data.stats.evolutions++;
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: getYear(), type: type, title: msg, color: color || "#8b5cf6" });
  }

  window.eciv76Invent = function() {
    var techs  = ["Linh Khí Động Cơ","Vạn Hoa Kính","Âm Thanh Truyền Tải","Điều Khiển Thời Tiết","Cổng Không Gian","Sinh Mệnh Kết Tinh","Trường Lực Bảo Hộ","Ý Thức Tập Thể"];
    var name = pick(techs) + " Cấp " + (1 + Math.floor(Math.random() * 5));
    var country = getCountryName();
    var entry = { id: "inv_" + Date.now(), name: name, country: country, year: getYear() };
    window.emergentCivV76Data.inventions.push(entry);
    window.emergentCivV76Data.stats.inventions++;
    logCivEvent("invention", "⚙️ " + country + " phát minh: " + name, "#10b981");
    return entry;
  };

  window.eciv76CreateLaw = function() {
    var law = pick(LAW_TYPES) + " (Phiên Bản " + (1 + Math.floor(Math.random() * 10)) + ")";
    var country = getCountryName();
    var entry = { id: "law_" + Date.now(), name: law, country: country, year: getYear() };
    window.emergentCivV76Data.laws.push(entry);
    logCivEvent("law", "📜 " + country + " ban hành: " + law, "#3b82f6");
    return entry;
  };

  window.eciv76SpawnPhilosophy = function() {
    var phil = pick(PHILOSOPHY_LIST);
    var thinker_surnames = ["Khổng","Lão","Mặc","Pháp","Đạo","Thiền","Huyền","Vô"];
    var thinker = pick(thinker_surnames) + " Tử";
    var entry = { id: "phil_" + Date.now(), name: phil, thinker: thinker, year: getYear() };
    window.emergentCivV76Data.philosophies.push(entry);
    logCivEvent("philosophy", "📚 Triết học mới: " + phil + " (do " + thinker + " sáng lập)", "#a78bfa");
    return entry;
  };

  window.eciv76BuildArchitecture = function() {
    var style = pick(ARCHITECTURE_STYLES);
    var country = getCountryName();
    var entry = { id: "arch_" + Date.now(), name: style, country: country, year: getYear() };
    window.emergentCivV76Data.architectures.push(entry);
    logCivEvent("architecture", "🏛️ " + country + " xây dựng: " + style, "#f59e0b");
    return entry;
  };

  window.eciv76CollapseCountry = function() {
    if (!Array.isArray(window.countries) || window.countries.length < 3) return null;
    var weakest = null;
    window.countries.forEach(function(c) {
      if (!weakest || ((c.stability || 50) + (c.power || 50)) < ((weakest.stability || 50) + (weakest.power || 50))) weakest = c;
    });
    if (!weakest) return null;
    var reason = pick(COLLAPSE_REASONS);
    var entry = { id: "col_" + Date.now(), name: weakest.name, reason: reason, year: getYear() };
    window.emergentCivV76Data.collapsedCivs.push(entry);
    window.emergentCivV76Data.stats.collapses++;
    window.countries = window.countries.filter(function(c) { return c.name !== weakest.name; });
    logCivEvent("collapse", "💀 Văn minh sụp đổ: " + weakest.name + " — " + reason, "#ef4444");
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: getYear(), category: "collapse", title: "💀 Sụp Đổ: " + weakest.name, content: "Nguyên nhân: " + reason });
    return entry;
  };

  window.eciv76MergeCivs = function() {
    if (!Array.isArray(window.countries) || window.countries.length < 2) return null;
    var a = window.countries[Math.floor(Math.random() * window.countries.length)];
    var b = window.countries.find(function(c) { return c.name !== a.name; });
    if (!a || !b) return null;
    var mergedName = pick(MERGE_PREFIXES) + " " + a.name.split(" ")[0] + "-" + b.name.split(" ")[0] + " Liên Bang";
    var merged = {
      name: mergedName, government: "Liên Bang",
      population: (a.population || 50000) + (b.population || 50000),
      power: Math.max((a.power || 50), (b.power || 50)) + 10,
      stability: Math.floor(((a.stability || 50) + (b.stability || 50)) / 2),
      merged: true, year: getYear()
    };
    window.countries = window.countries.filter(function(c) { return c.name !== a.name && c.name !== b.name; });
    window.countries.push(merged);
    window.emergentCivV76Data.mergedCivs.push({ id: "mg_" + Date.now(), a: a.name, b: b.name, result: mergedName, year: getYear() });
    window.emergentCivV76Data.stats.merges++;
    logCivEvent("merge", "🤝 Hai văn minh sáp nhập: " + a.name + " + " + b.name + " → " + mergedName, "#10b981");
    return merged;
  };

  // ─── gameTick hook ──────────────────────────────────────────
  window.eciv76Tick = function() {
    window.emergentCivV76Data.tickCounter++;
    var tc = window.emergentCivV76Data.tickCounter;
    if (tc % 90 === 0 && Math.random() < 0.5) window.eciv76Invent();
    if (tc % 150 === 0 && Math.random() < 0.4) window.eciv76CreateLaw();
    if (tc % 200 === 0 && Math.random() < 0.35) window.eciv76SpawnPhilosophy();
    if (tc % 220 === 0 && Math.random() < 0.3) window.eciv76BuildArchitecture();
    if (tc % 350 === 0 && Math.random() < 0.2 && Array.isArray(window.countries) && window.countries.length > 5) window.eciv76CollapseCountry();
    if (tc % 500 === 0 && Math.random() < 0.15 && Array.isArray(window.countries) && window.countries.length >= 2) window.eciv76MergeCivs();
    if (tc % 300 === 0) save();
  };

  window.eciv76GetAll     = function() { return window.emergentCivV76Data; };
  window.eciv76GetStats   = function() { return window.emergentCivV76Data.stats; };
  window.eciv76GetLog     = function() { return window.emergentCivV76Data.civEvolutions; };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.eciv76Tick(); };
    console.log("[EmergentCivilizationEngine V76] 🏛️ Văn Minh Tự Sinh khởi động — " + window.emergentCivV76Data.stats.inventions + " phát minh · " + window.emergentCivV76Data.stats.collapses + " sụp đổ · " + window.emergentCivV76Data.stats.merges + " sáp nhập · Tự tiến hóa sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19000); });
  } else { setTimeout(init, 19000); }
})();
