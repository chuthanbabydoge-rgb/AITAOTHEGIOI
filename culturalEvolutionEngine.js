(function() {
  "use strict";
  var SAVE_KEY = "cgv6_cultural_evo_v79";

  var CULTURE_TRAITS = [
    { id: "martial",     label: "Thượng Võ",     icon: "⚔️",  spread: "war" },
    { id: "scholarly",   label: "Trọng Học",      icon: "📚", spread: "academia" },
    { id: "mercantile",  label: "Trọng Thương",   icon: "💰", spread: "trade" },
    { id: "spiritual",   label: "Trọng Đạo",      icon: "🌀", spread: "religion" },
    { id: "artistic",    label: "Nghệ Thuật",      icon: "🎨", spread: "trade" },
    { id: "agrarian",    label: "Nông Nghiệp",     icon: "🌾", spread: "migration" },
    { id: "maritime",    label: "Hàng Hải",       icon: "⛵", spread: "trade" },
    { id: "nomadic",     label: "Du Mục",         icon: "🐴", spread: "war" },
    { id: "diplomatic",  label: "Ngoại Giao",     icon: "🤝", spread: "trade" },
    { id: "innovative",  label: "Đổi Mới",        icon: "💡", spread: "academia" }
  ];

  var HYBRID_CULTURES = [
    { a: "martial",   b: "scholarly",  result: "Võ Học",   icon: "⚔️📚" },
    { a: "spiritual", b: "artistic",   result: "Đạo Nghệ",  icon: "🌀🎨" },
    { a: "maritime",  b: "mercantile", result: "Hải Thương", icon: "⛵💰" },
    { a: "scholarly", b: "innovative", result: "Khoa Học",  icon: "📚💡" },
    { a: "martial",   b: "nomadic",    result: "Chiến Kỵ",  icon: "⚔️🐴" }
  ];

  var KNOWLEDGE_CHANNELS = [
    { id: "trade",     label: "Thương Mại",  icon: "💰", speed: 1.5 },
    { id: "war",       label: "Chiến Tranh", icon: "⚔️",  speed: 2.0 },
    { id: "religion",  label: "Tôn Giáo",   icon: "⛪", speed: 1.2 },
    { id: "academia",  label: "Học Thuật",  icon: "📚", speed: 0.8 },
    { id: "migration", label: "Di Dân",     icon: "🚶", speed: 0.6 }
  ];

  window.culturalEvoV79Data = {
    civCultures: {},
    hybridizations: [],
    extinctions: [],
    revivals: [],
    propagations: [],
    lastEvoYear: 0,
    totalEvents: 0
  };

  function save() {
    try {
      var compact = {
        civCultures: window.culturalEvoV79Data.civCultures,
        hybridizations: window.culturalEvoV79Data.hybridizations.slice(-15),
        extinctions: window.culturalEvoV79Data.extinctions.slice(-10),
        revivals: window.culturalEvoV79Data.revivals.slice(-10),
        propagations: window.culturalEvoV79Data.propagations.slice(-20),
        lastEvoYear: window.culturalEvoV79Data.lastEvoYear,
        totalEvents: window.culturalEvoV79Data.totalEvents
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.culturalEvoV79Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.cevo79GetOrInit = function(countryName) {
    var data = window.culturalEvoV79Data;
    if (data.civCultures[countryName]) return data.civCultures[countryName];
    var seed = seedHash(countryName);
    var trait1 = CULTURE_TRAITS[seed % CULTURE_TRAITS.length];
    var trait2 = CULTURE_TRAITS[(seed * 3) % CULTURE_TRAITS.length];
    var civ = {
      name: countryName,
      traits: [trait1.id],
      traitLabels: [trait1.label],
      traitIcons: [trait1.icon],
      secondaryTrait: trait2.id !== trait1.id ? trait2.id : null,
      culturalStrength: 30 + (seed % 50),
      hybridized: false,
      hybridName: null,
      extinct: false,
      knowledgeScore: 0,
      receivedFrom: [],
      sentTo: []
    };
    data.civCultures[countryName] = civ;
    return civ;
  };

  window.cevo79Hybridize = function(civA, civB) {
    var data = window.culturalEvoV79Data;
    var cA = window.cevo79GetOrInit(civA);
    var cB = window.cevo79GetOrInit(civB);
    if (cA.hybridized && cB.hybridized) return null;

    var match = HYBRID_CULTURES.find(function(h) {
      return (cA.traits.includes(h.a) && cB.traits.includes(h.b)) ||
             (cA.traits.includes(h.b) && cB.traits.includes(h.a));
    });
    if (!match) return null;

    var event = {
      year: window.year || 1,
      civA: civA, civB: civB,
      result: match.result,
      icon: match.icon,
      beneficiary: civA
    };
    cA.hybridized = true;
    cA.hybridName = match.result + " " + match.icon;
    cA.culturalStrength = Math.min(100, cA.culturalStrength + 20);
    data.hybridizations.push(event);
    data.totalEvents++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: event.year, type: "culture", title: match.icon + " Văn hóa Lai: " + match.result + " — " + civA + " + " + civB, color: "#e67e22" });
    }
    save();
    return event;
  };

  window.cevo79Propagate = function(fromCiv, toCiv, channelId) {
    var data = window.culturalEvoV79Data;
    var src = window.cevo79GetOrInit(fromCiv);
    var dst = window.cevo79GetOrInit(toCiv);
    var channel = KNOWLEDGE_CHANNELS.find(function(c) { return c.id === channelId; }) || KNOWLEDGE_CHANNELS[0];

    if (src.traits.length === 0) return;
    var traitToSpread = src.traits[0];
    if (!dst.traits.includes(traitToSpread)) {
      dst.traits.push(traitToSpread);
      var traitDef = CULTURE_TRAITS.find(function(t) { return t.id === traitToSpread; });
      if (traitDef) { dst.traitLabels.push(traitDef.label); dst.traitIcons.push(traitDef.icon); }
    }
    var gain = Math.round(channel.speed * 5);
    src.knowledgeScore += gain;
    dst.knowledgeScore += Math.round(gain * 0.5);
    src.sentTo.push(toCiv);
    dst.receivedFrom.push(fromCiv);
    if (src.sentTo.length > 10) src.sentTo.shift();
    if (dst.receivedFrom.length > 10) dst.receivedFrom.shift();

    var ev = { year: window.year || 1, from: fromCiv, to: toCiv, channel: channel.label, channelIcon: channel.icon, trait: traitToSpread };
    data.propagations.push(ev);
    if (data.propagations.length > 20) data.propagations.shift();
    data.totalEvents++;
    save();
    return ev;
  };

  window.cevo79Extinct = function(countryName, reason) {
    var data = window.culturalEvoV79Data;
    var civ = data.civCultures[countryName];
    if (!civ || civ.extinct) return;
    civ.extinct = true;
    civ.extinctYear = window.year || 1;
    civ.extinctReason = reason || "Bị đồng hóa";
    data.extinctions.push({ year: civ.extinctYear, name: countryName, reason: civ.extinctReason });
    data.totalEvents++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: civ.extinctYear, type: "culture_extinct", title: "💀 Văn hóa " + countryName + " biến mất: " + civ.extinctReason, color: "#7f8c8d" });
    }
    save();
  };

  window.cevo79Revive = function(countryName) {
    var data = window.culturalEvoV79Data;
    var civ = data.civCultures[countryName];
    if (!civ || !civ.extinct) return;
    civ.extinct = false;
    civ.revivalYear = window.year || 1;
    civ.culturalStrength = 20;
    data.revivals.push({ year: civ.revivalYear, name: countryName });
    data.totalEvents++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: civ.revivalYear, type: "culture_revival", title: "🌱 Văn hóa " + countryName + " hồi sinh!", color: "#27ae60" });
    }
    save();
  };

  window.cevo79GetCulture = function(countryName) { return window.culturalEvoV79Data.civCultures[countryName] || null; };
  window.cevo79GetAll = function() { return Object.values(window.culturalEvoV79Data.civCultures); };
  window.cevo79GetStats = function() {
    var d = window.culturalEvoV79Data;
    return { total: Object.keys(d.civCultures).length, hybridizations: d.hybridizations.length, extinctions: d.extinctions.length, revivals: d.revivals.length, propagations: d.propagations.length, totalEvents: d.totalEvents };
  };
  window.CEVO79_TRAITS = CULTURE_TRAITS;
  window.CEVO79_CHANNELS = KNOWLEDGE_CHANNELS;

  function autoEvolve() {
    var data = window.culturalEvoV79Data;
    var year = window.year || 1;
    if (year - data.lastEvoYear < 120) return;
    data.lastEvoYear = year;
    if (!window.countries || window.countries.length < 2) return;

    window.countries.slice(0, 15).forEach(function(c) { if (c && c.name) window.cevo79GetOrInit(c.name); });

    var civs = Object.keys(data.civCultures);
    if (civs.length < 2) return;

    // Knowledge propagation
    var channels = ["trade", "war", "religion", "academia"];
    if (window.warsActive && window.warsActive.length > 0) channels.push("war", "war");
    var ch = channels[Math.floor(Math.random() * channels.length)];
    var i1 = Math.floor(Math.random() * civs.length);
    var i2 = Math.floor(Math.random() * civs.length);
    if (i1 !== i2) window.cevo79Propagate(civs[i1], civs[i2], ch);

    // Random hybridize
    if (Math.random() < 0.2 && civs.length >= 2) {
      var a = civs[Math.floor(Math.random() * civs.length)];
      var b = civs[Math.floor(Math.random() * civs.length)];
      if (a !== b) window.cevo79Hybridize(a, b);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.006) autoEvolve();
    };
    console.log("[CulturalEvolutionV79] 🎭 Tiến Hóa Văn Hóa khởi động — 10 traits · 5 channels · Lai tạo · Tuyệt diệt · Hồi sinh sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20500); });
  } else {
    setTimeout(init, 20500);
  }
})();
