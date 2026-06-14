(function() {
  "use strict";
  var SAVE_KEY = "cgv6_culture_art_v79";

  var ART_STYLES = [
    { id: "epic",       label: "Sử Thi",          icon: "📜", domain: "literature" },
    { id: "lyric",      label: "Trữ Tình",        icon: "🎵", domain: "music" },
    { id: "martial",    label: "Chiến Ca",         icon: "🥁", domain: "music" },
    { id: "sacred",     label: "Thánh Nhạc",       icon: "🎶", domain: "music" },
    { id: "monumental", label: "Hoành Tráng",      icon: "🏛️",  domain: "architecture" },
    { id: "organic",    label: "Tự Nhiên",         icon: "🌿", domain: "architecture" },
    { id: "mosaic",     label: "Tranh Khảm",       icon: "🎨", domain: "visual" },
    { id: "fresco",     label: "Bích Họa",         icon: "🖼️",  domain: "visual" },
    { id: "mythology",  label: "Thần Thoại",       icon: "⚡", domain: "literature" },
    { id: "philosophy", label: "Triết Luận",       icon: "📖", domain: "literature" }
  ];

  var LANDMARK_TYPES = [
    { id: "temple",    label: "Đền Thờ",     icon: "⛩️",  prestige: 3 },
    { id: "palace",    label: "Cung Điện",   icon: "🏰", prestige: 3 },
    { id: "library",   label: "Thư Viện",    icon: "📚", prestige: 2 },
    { id: "monument",  label: "Tượng Đài",   icon: "🗿", prestige: 2 },
    { id: "theater",   label: "Nhà Hát",     icon: "🎭", prestige: 2 },
    { id: "aqueduct",  label: "Cống Dẫn Nước", icon: "🌊", prestige: 1 },
    { id: "wall",      label: "Trường Thành", icon: "🧱", prestige: 2 },
    { id: "market",    label: "Chợ Hoàng Gia", icon: "🏪", prestige: 1 }
  ];

  window.cultureArtV79Data = {
    civCultures: {},
    globalWorks: [],
    landmarks: [],
    totalWorks: 0,
    lastGenYear: 0
  };

  function save() {
    try {
      var compact = {
        civCultures: window.cultureArtV79Data.civCultures,
        globalWorks: window.cultureArtV79Data.globalWorks.slice(-25),
        landmarks: window.cultureArtV79Data.landmarks.slice(-20),
        totalWorks: window.cultureArtV79Data.totalWorks,
        lastGenYear: window.cultureArtV79Data.lastGenYear
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.cultureArtV79Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.cult79GetOrInit = function(countryName) {
    var data = window.cultureArtV79Data;
    if (data.civCultures[countryName]) return data.civCultures[countryName];
    var seed = seedHash(countryName);
    var style = ART_STYLES[seed % ART_STYLES.length];
    var civ = {
      name: countryName,
      primaryStyle: style.id,
      primaryStyleLabel: style.label,
      primaryStyleIcon: style.icon,
      culturalOutput: 0,
      works: [],
      landmarks: []
    };
    data.civCultures[countryName] = civ;
    return civ;
  };

  window.cult79GenerateWork = function(countryName, styleId, title) {
    var data = window.cultureArtV79Data;
    var civ = window.cult79GetOrInit(countryName);
    var style = ART_STYLES.find(function(s) { return s.id === styleId; }) || ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];
    var year = window.year || 1;
    var seed = seedHash(countryName + year + data.totalWorks);

    var titlePrefixes = {
      literature: ["Thiên Hùng Ca về", "Sử Ký của", "Truyện Thần của", "Bài Thơ Đại của"],
      music:      ["Bản Nhạc Hùng Tráng", "Điệu Nhạc Cổ Đại", "Hòa Âm Thiêng Liêng", "Khúc Nhạc Huyền Bí"],
      architecture: ["Kiến Trúc Hoành Tráng", "Công Trình Vĩ Đại", "Tháp Ngà", "Đền Đài Thần Thánh"],
      visual:     ["Bức Họa Huyền Thoại", "Tranh Toàn Cảnh", "Phù Điêu Lịch Sử", "Tác Phẩm Thiên Tài"]
    };
    var domain = style.domain;
    var prefixes = titlePrefixes[domain] || titlePrefixes.literature;
    var autoTitle = title || (prefixes[seed % prefixes.length] + " " + countryName);

    var work = {
      id: "work_" + Date.now(),
      country: countryName,
      style: style.id,
      styleLabel: style.label,
      styleIcon: style.icon,
      domain: domain,
      title: autoTitle,
      year: year,
      fame: 10 + (seed % 60)
    };
    civ.works.unshift(work);
    if (civ.works.length > 10) civ.works.length = 10;
    civ.culturalOutput += work.fame;
    data.globalWorks.push(work);
    data.totalWorks++;
    save();
    return work;
  };

  window.cult79BuildLandmark = function(countryName, typeId) {
    var data = window.cultureArtV79Data;
    var civ = window.cult79GetOrInit(countryName);
    var type = LANDMARK_TYPES.find(function(t) { return t.id === typeId; }) || LANDMARK_TYPES[Math.floor(Math.random() * LANDMARK_TYPES.length)];
    var year = window.year || 1;
    var seed = seedHash(countryName + year + typeId);
    var suffixes = ["Hoàng Gia", "Vĩnh Cửu", "Thần Thánh", "Bất Diệt", "Ngàn Năm", "Vĩ Đại"];
    var name = type.icon + " " + type.label + " " + suffixes[seed % suffixes.length] + " của " + countryName;
    var landmark = { id: "lm_" + Date.now(), name: name, country: countryName, type: type.id, typeLabel: type.label, icon: type.icon, builtYear: year, prestige: type.prestige };
    civ.landmarks.push(landmark.id);
    data.landmarks.push(landmark);
    if (data.landmarks.length > 20) data.landmarks.shift();
    civ.culturalOutput += type.prestige * 10;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "architecture", title: type.icon + " " + name + " hoàn thành", color: "#e67e22" });
    }
    save();
    return landmark;
  };

  window.cult79GetCivCulture = function(countryName) { return window.cultureArtV79Data.civCultures[countryName] || null; };
  window.cult79GetGlobalWorks = function(limit) { return window.cultureArtV79Data.globalWorks.slice(-(limit || 10)).reverse(); };
  window.cult79GetLandmarks = function(countryName) {
    if (countryName) return window.cultureArtV79Data.landmarks.filter(function(l) { return l.country === countryName; });
    return window.cultureArtV79Data.landmarks.slice();
  };
  window.cult79GetStats = function() {
    var d = window.cultureArtV79Data;
    return { civilizations: Object.keys(d.civCultures).length, totalWorks: d.totalWorks, landmarks: d.landmarks.length };
  };
  window.CULT79_STYLES = ART_STYLES;
  window.CULT79_LANDMARKS = LANDMARK_TYPES;

  function autoGenerate() {
    var data = window.cultureArtV79Data;
    var year = window.year || 1;
    if (year - data.lastGenYear < 180) return;
    data.lastGenYear = year;
    if (!window.countries || window.countries.length === 0) return;
    var c = window.countries[Math.floor(Math.random() * Math.min(window.countries.length, 15))];
    if (!c || !c.name) return;
    var seed = seedHash(c.name + year);
    var style = ART_STYLES[seed % ART_STYLES.length];
    window.cult79GenerateWork(c.name, style.id);
    if (Math.random() < 0.25) {
      var lmType = LANDMARK_TYPES[seed % LANDMARK_TYPES.length];
      window.cult79BuildLandmark(c.name, lmType.id);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.005) autoGenerate();
    };
    console.log("[CultureEngineV79] 🎨 Nghệ Thuật & Văn Hóa khởi động — 10 phong cách · 8 công trình · Tác phẩm tự động · Công trình vĩ đại sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20800); });
  } else {
    setTimeout(init, 20800);
  }
})();
