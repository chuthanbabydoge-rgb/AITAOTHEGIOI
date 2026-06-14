(function() {
  "use strict";
  const SAVE_KEY = "cgv6_adaptive_history_v76";

  var CHRONICLE_TEMPLATES = [
    { type: "war",       tmpl: function(a,b) { return "⚔️ Năm {y}: " + a + " tuyên chiến với " + b + ". Cuộc chiến kéo dài {d} năm."; } },
    { type: "alliance",  tmpl: function(a,b) { return "🤝 Năm {y}: " + a + " và " + b + " ký hiệp ước liên minh lịch sử."; } },
    { type: "disaster",  tmpl: function(a)   { return "🌋 Năm {y}: Thiên tai khủng khiếp giáng xuống " + a + ", hàng triệu người thiệt mạng."; } },
    { type: "golden",    tmpl: function(a)   { return "✨ Năm {y}: " + a + " bước vào thời hoàng kim — dân số tăng gấp đôi, văn hóa nở rộ."; } },
    { type: "prophecy",  tmpl: function(n)   { return "🔮 Năm {y}: Nhà tiên tri " + n + " phán rằng thế giới sẽ trải qua biến cố lớn."; } },
    { type: "discovery", tmpl: function(t)   { return "🔬 Năm {y}: Phát minh vĩ đại — " + t + " — thay đổi cục diện thế giới."; } },
    { type: "religion",  tmpl: function(r)   { return "⛩️ Năm {y}: " + r + " chia giáo phái, dẫn đến xung đột tôn giáo kéo dài."; } },
    { type: "hero",      tmpl: function(h)   { return "⚔️ Năm {y}: " + h + " xuất hiện, thay đổi dòng chảy lịch sử."; } }
  ];

  var PROPHET_NAMES = ["Huyền Cơ Tử","Thiên Mệnh Đạo Nhân","Vô Danh Lão Tổ","Linh Cốt Tiên","Ảo Nguyệt Chân Nhân","Hắc Vân Sứ","Thiên Phong Dự Ngôn Giả"];
  var TECH_LIST     = ["Kim Cương Luyện Thể Pháp","Hàng Không Phi Thuyền","Vạn Linh Trận Pháp","Thần Cơ Cung Nỏ","Cổ Đại Truyền Tống Trận","Linh Nguyên Bùa Chú Hệ"];

  window.adaptiveHistoryV76Data = {
    chronicles: [],
    emergentCharacters: [],
    worldForecast: [],
    tickCounter: 0,
    totalChronicles: 0,
    version: "V76"
  };

  function save() {
    try {
      var d = {
        chronicles: window.adaptiveHistoryV76Data.chronicles.slice(-80),
        emergentCharacters: window.adaptiveHistoryV76Data.emergentCharacters.slice(-30),
        worldForecast: window.adaptiveHistoryV76Data.worldForecast.slice(-10),
        totalChronicles: window.adaptiveHistoryV76Data.totalChronicles,
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
        Object.assign(window.adaptiveHistoryV76Data, p);
        window.adaptiveHistoryV76Data.tickCounter = 0;
      }
    } catch(e) {}
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getYear() { return typeof window.year === "number" ? window.year : 1; }
  function getCountryName(fallback) {
    var countries = window.universeEvoV76Data ? window.universeEvoV76Data.emergentCountries : [];
    if (Array.isArray(window.countries) && window.countries.length > 0) {
      var c = window.countries[Math.floor(Math.random() * window.countries.length)];
      if (c && c.name) return c.name;
    }
    if (countries.length > 0) return pick(countries).name;
    return fallback || "Vô Danh Quốc";
  }
  function getReligionName() {
    var rels = window.universeEvoV76Data ? window.universeEvoV76Data.emergentReligions : [];
    if (rels.length > 0) return pick(rels).name;
    return "Cổ Tôn Giáo";
  }

  function addChronicle(type, text) {
    var entry = {
      id: "chr_" + Date.now(),
      year: getYear(),
      type: type,
      text: text.replace("{y}", getYear()).replace("{d}", 3 + Math.floor(Math.random() * 20)),
      time: Date.now()
    };
    window.adaptiveHistoryV76Data.chronicles.unshift(entry);
    if (window.adaptiveHistoryV76Data.chronicles.length > 100) window.adaptiveHistoryV76Data.chronicles.pop();
    window.adaptiveHistoryV76Data.totalChronicles++;
    if (typeof window.wmeAddMemory === "function") window.wmeAddMemory({ year: getYear(), category: type, title: entry.text.substring(0, 60), content: entry.text });
    return entry;
  }

  window.ah76GenerateChronicle = function() {
    var tmplEntry = pick(CHRONICLE_TEMPLATES);
    var text = "";
    switch (tmplEntry.type) {
      case "war":       text = tmplEntry.tmpl(getCountryName("Bắc Quốc"), getCountryName("Nam Quốc")); break;
      case "alliance":  text = tmplEntry.tmpl(getCountryName("Đông Quốc"), getCountryName("Tây Quốc")); break;
      case "disaster":  text = tmplEntry.tmpl(getCountryName("Trung Quốc")); break;
      case "golden":    text = tmplEntry.tmpl(getCountryName("Hưng Quốc")); break;
      case "prophecy":  text = tmplEntry.tmpl(pick(PROPHET_NAMES)); break;
      case "discovery": text = tmplEntry.tmpl(pick(TECH_LIST)); break;
      case "religion":  text = tmplEntry.tmpl(getReligionName()); break;
      case "hero":
        var heroes = window.universeEvoV76Data ? window.universeEvoV76Data.emergentHeroes : [];
        var heroName = heroes.length > 0 ? pick(heroes).name : "Vô Danh Đại Nhân";
        text = tmplEntry.tmpl(heroName); break;
      default: text = "📜 Năm " + getYear() + ": Sự kiện lịch sử xuất hiện."; break;
    }
    return addChronicle(tmplEntry.type, text);
  };

  window.ah76GenerateCharacter = function() {
    var surnames = ["Lý","Vương","Trần","Triệu","Hàn","Lưu","Đặng","Hầu","Yến","Phạm"];
    var titles   = ["Thiên Tài","Quỷ Tài","Dị Tài","Kỳ Nhân","Thánh Nhân","Đại Hiền","Phù Thủy","Kiếm Thánh"];
    var roles    = window.universeEvoV76Data ? [] : [];
    var roleList = ["Anh Hùng","Phản Diện","Nhà Cải Cách","Nhà Tiên Tri","Hoàng Đế","Ma Đầu","Thần Sứ","Hội Trưởng"];
    var char = {
      id: "char_" + Date.now(),
      name: pick(surnames) + " " + pick(["Thiên","Vạn","Linh","Huyền","Cổ"]) + pick(["Phong","Long","Hổ","Phượng","Lân"]),
      title: pick(titles),
      role: pick(roleList),
      power: 40 + Math.floor(Math.random() * 60),
      origin: getCountryName("Vô Danh"),
      born: getYear(),
      emergent: true
    };
    window.adaptiveHistoryV76Data.emergentCharacters.push(char);
    if (typeof window.htAddEvent === "function") window.htAddEvent({ year: getYear(), type: "character", title: "⚔️ Nhân Vật Mới: " + char.name + " [" + char.role + "]", color: "#ef4444" });
    return char;
  };

  window.ah76GenerateForecast = function() {
    var forecasts = [
      "🔮 Tiên tri: Trong {n} năm, một đế quốc mới sẽ thống nhất phương Bắc.",
      "🔮 Dự báo: Đại chiến giữa 3 thế lực lớn sắp bùng nổ.",
      "🔮 Cảnh báo: Một thần khí cổ đại sẽ được khai phong, thay đổi cán cân quyền lực.",
      "🔮 Dự đoán: Tôn giáo mới sẽ lan rộng khắp thế giới trong {n} năm.",
      "🔮 Tiên tri: Một chủng tộc ẩn thế sẽ xuất hiện và đảo lộn trật tự hiện tại.",
      "🔮 Cảnh báo: Thảm họa thiên nhiên quy mô lớn sắp giáng xuống phương Nam.",
      "🔮 Dự báo: Kỷ nguyên mới sắp bắt đầu — Thế Giới Cổ Đại sắp kết thúc.",
      "🔮 Tiên tri: Nhân vật mang số phận thay đổi thế giới sẽ xuất hiện trong {n} năm."
    ];
    var text = pick(forecasts).replace("{n}", 10 + Math.floor(Math.random() * 50));
    var entry = { year: getYear(), text: text, time: Date.now() };
    window.adaptiveHistoryV76Data.worldForecast.unshift(entry);
    if (window.adaptiveHistoryV76Data.worldForecast.length > 15) window.adaptiveHistoryV76Data.worldForecast.pop();
    return entry;
  };

  // ─── gameTick hook ──────────────────────────────────────────
  window.ah76Tick = function() {
    window.adaptiveHistoryV76Data.tickCounter++;
    var tc = window.adaptiveHistoryV76Data.tickCounter;
    if (tc % 120 === 0) window.ah76GenerateChronicle();
    if (tc % 250 === 0) window.ah76GenerateCharacter();
    if (tc % 400 === 0) { window.ah76GenerateForecast(); save(); }
    if (tc % 500 === 0) save();
  };

  window.ah76GetChronicles   = function() { return window.adaptiveHistoryV76Data.chronicles; };
  window.ah76GetCharacters   = function() { return window.adaptiveHistoryV76Data.emergentCharacters; };
  window.ah76GetForecast     = function() { return window.adaptiveHistoryV76Data.worldForecast; };
  window.ah76GetStats        = function() { return { totalChronicles: window.adaptiveHistoryV76Data.totalChronicles, characters: window.adaptiveHistoryV76Data.emergentCharacters.length, forecasts: window.adaptiveHistoryV76Data.worldForecast.length }; };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.ah76Tick(); };
    console.log("[AdaptiveHistoryEngine V76] 📜 Lịch Sử Thích Nghi khởi động — " + window.adaptiveHistoryV76Data.totalChronicles + " biên niên · " + window.adaptiveHistoryV76Data.emergentCharacters.length + " nhân vật · Tự sinh lịch sử mỗi 120 tick sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18900); });
  } else { setTimeout(init, 18900); }
})();
