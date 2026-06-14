(function() {
  "use strict";
  const SAVE_KEY = "cgv6_language_evo_v76";

  var BASE_LANGUAGES = [
    { id: "ancient_tongue",  name: "Cổ Ngữ Nguyên Thủy",   family: "root",      alive: true,  speakers: 500000,  age: 0 },
    { id: "spirit_tongue",   name: "Linh Ngữ",              family: "spiritual", alive: true,  speakers: 200000,  age: 0 },
    { id: "trade_tongue",    name: "Thương Ngữ Chung",      family: "common",    alive: true,  speakers: 800000,  age: 0 },
    { id: "war_tongue",      name: "Chiến Ngữ",             family: "martial",   alive: true,  speakers: 150000,  age: 0 },
    { id: "divine_tongue",   name: "Thần Ngữ Thiêng Liêng", family: "divine",    alive: true,  speakers: 50000,   age: 0 }
  ];

  var LANG_PREFIXES  = ["Cổ","Mới","Hắc","Linh","Huyền","Thiên","Địa","Tân","Biến","Phân"];
  var LANG_SUFFIXES  = ["Ngữ","Lời","Điệu","Âm","Văn","Ký","Chữ","Tiếng"];
  var DEATH_REASONS  = ["Bị Thay Thế","Dân Tộc Diệt Vong","Hòa Nhập Vào Ngôn Ngữ Khác","Quên Lãng Theo Thời Gian","Bị Cấm Đoán"];
  var BRANCH_REASONS = ["Di Dân","Chiến Tranh Phân Ly","Địa Lý Cách Trở","Tôn Giáo Chia Rẽ","Phát Triển Độc Lập"];
  var INFLUENCE_TYPES= ["Giao Thương","Chiến Tranh","Tôn Giáo","Di Dân","Hôn Nhân Hoàng Gia"];

  window.languageEvoV76Data = {
    languages: [],
    languageTree: [],
    deadLanguages: [],
    branchEvents: [],
    influenceMap: [],
    tickCounter: 0,
    stats: { totalBranched: 0, totalDead: 0, totalInfluences: 0, peakLanguages: 0 },
    version: "V76"
  };

  function save() {
    try {
      var d = {
        languages: window.languageEvoV76Data.languages,
        languageTree: window.languageEvoV76Data.languageTree.slice(-50),
        deadLanguages: window.languageEvoV76Data.deadLanguages.slice(-30),
        branchEvents: window.languageEvoV76Data.branchEvents.slice(-30),
        influenceMap: window.languageEvoV76Data.influenceMap.slice(-30),
        stats: window.languageEvoV76Data.stats,
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
        Object.assign(window.languageEvoV76Data, p);
        window.languageEvoV76Data.tickCounter = 0;
      }
    } catch(e) {}
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getYear() { return typeof window.year === "number" ? window.year : 1; }

  function initLanguages() {
    if (window.languageEvoV76Data.languages.length === 0) {
      window.languageEvoV76Data.languages = BASE_LANGUAGES.map(function(l) {
        return Object.assign({}, l, { id: l.id + "_" + Date.now(), born: getYear() });
      });
    }
    window.languageEvoV76Data.stats.peakLanguages = Math.max(
      window.languageEvoV76Data.stats.peakLanguages,
      window.languageEvoV76Data.languages.filter(function(l) { return l.alive; }).length
    );
  }

  window.lang76Branch = function(parentLang) {
    var aliveLangs = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; });
    if (!parentLang) {
      if (aliveLangs.length === 0) return null;
      parentLang = pick(aliveLangs);
    }
    var reason = pick(BRANCH_REASONS);
    var newName = pick(LANG_PREFIXES) + " " + parentLang.name.split(" ").pop() + "-" + pick(LANG_SUFFIXES).toLowerCase();
    var childLang = {
      id: "lang_" + Date.now(),
      name: newName,
      family: parentLang.family,
      parent: parentLang.id,
      parentName: parentLang.name,
      alive: true,
      speakers: Math.floor((parentLang.speakers || 100000) * (0.1 + Math.random() * 0.4)),
      age: 0,
      born: getYear(),
      branchReason: reason
    };
    parentLang.speakers = Math.floor((parentLang.speakers || 100000) * 0.7);
    window.languageEvoV76Data.languages.push(childLang);
    var evt = { year: getYear(), type: "branch", parent: parentLang.name, child: newName, reason: reason };
    window.languageEvoV76Data.branchEvents.push(evt);
    window.languageEvoV76Data.stats.totalBranched++;
    window.languageEvoV76Data.stats.peakLanguages = Math.max(
      window.languageEvoV76Data.stats.peakLanguages,
      window.languageEvoV76Data.languages.filter(function(l) { return l.alive; }).length
    );
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "language", title: "📖 " + parentLang.name + " phân nhánh → " + newName + " (" + reason + ")", color: "#8b5cf6" });
    }
    return childLang;
  };

  window.lang76Evolve = function() {
    var aliveLangs = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; });
    aliveLangs.forEach(function(l) {
      l.age = (l.age || 0) + 1;
      var growth = (Math.random() - 0.45) * 0.1;
      l.speakers = Math.max(100, Math.floor((l.speakers || 10000) * (1 + growth)));
    });
  };

  window.lang76Kill = function(lang) {
    var aliveLangs = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; });
    if (aliveLangs.length <= 2) return null;
    if (!lang) {
      var weakest = null;
      aliveLangs.forEach(function(l) {
        if (!weakest || (l.speakers || 0) < (weakest.speakers || 0)) weakest = l;
      });
      lang = weakest;
    }
    if (!lang) return null;
    var reason = pick(DEATH_REASONS);
    lang.alive = false;
    lang.deathYear = getYear();
    lang.deathReason = reason;
    window.languageEvoV76Data.deadLanguages.push(Object.assign({}, lang));
    window.languageEvoV76Data.stats.totalDead++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "language_death", title: "💀 Ngôn ngữ biến mất: " + lang.name + " — " + reason, color: "#ef4444" });
    }
    return lang;
  };

  window.lang76Influence = function() {
    var aliveLangs = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; });
    if (aliveLangs.length < 2) return null;
    var a = pick(aliveLangs);
    var b = aliveLangs.find(function(l) { return l.id !== a.id; });
    if (!b) return null;
    var type = pick(INFLUENCE_TYPES);
    var transfer = Math.floor((a.speakers || 10000) * 0.05);
    b.speakers = (b.speakers || 10000) + transfer;
    var evt = { year: getYear(), from: a.name, to: b.name, type: type, amount: transfer };
    window.languageEvoV76Data.influenceMap.push(evt);
    window.languageEvoV76Data.stats.totalInfluences++;
    return evt;
  };

  // ─── gameTick hook ──────────────────────────────────────────
  window.lang76Tick = function() {
    window.languageEvoV76Data.tickCounter++;
    var tc = window.languageEvoV76Data.tickCounter;
    window.lang76Evolve();
    if (tc % 180 === 0 && Math.random() < 0.5) window.lang76Branch(null);
    if (tc % 120 === 0 && Math.random() < 0.3) window.lang76Influence();
    var aliveLangs = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; });
    if (tc % 250 === 0 && Math.random() < 0.25 && aliveLangs.length > 4) window.lang76Kill(null);
    if (tc % 300 === 0) save();
  };

  window.lang76GetAlive    = function() { return window.languageEvoV76Data.languages.filter(function(l) { return l.alive; }); };
  window.lang76GetDead     = function() { return window.languageEvoV76Data.deadLanguages; };
  window.lang76GetTree     = function() { return window.languageEvoV76Data.languages; };
  window.lang76GetBranches = function() { return window.languageEvoV76Data.branchEvents; };
  window.lang76GetInfluences= function() { return window.languageEvoV76Data.influenceMap; };
  window.lang76GetStats    = function() { return window.languageEvoV76Data.stats; };

  function init() {
    load();
    initLanguages();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.lang76Tick(); };
    var alive = window.languageEvoV76Data.languages.filter(function(l) { return l.alive; }).length;
    console.log("[LanguageEvolutionSystem V76] 📖 Tiến Hóa Ngôn Ngữ khởi động — " + alive + " ngôn ngữ sống · " + window.languageEvoV76Data.stats.totalDead + " đã chết · " + window.languageEvoV76Data.stats.totalBranched + " phân nhánh · Tự tiến hóa sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19100); });
  } else { setTimeout(init, 19100); }
})();
