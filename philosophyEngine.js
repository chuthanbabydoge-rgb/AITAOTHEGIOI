(function() {
  "use strict";
  var SAVE_KEY = "cgv6_philosophy_v79";

  var PHILOSOPHY_SCHOOLS = [
    { id: "cosmology",   label: "Vũ Trụ Học",      icon: "🌌", domain: "science",   desc: "Nghiên cứu bản chất và nguồn gốc vũ trụ" },
    { id: "ethics",      label: "Đạo Đức Học",     icon: "⚖️",  domain: "society",   desc: "Xây dựng nền tảng đạo đức xã hội" },
    { id: "statecraft",  label: "Trị Quốc Học",    icon: "👑", domain: "politics",  desc: "Lý thuyết về quyền lực và quản trị đất nước" },
    { id: "mysticism",   label: "Thần Bí Học",      icon: "🌀", domain: "religion",  desc: "Tìm kiếm kết nối trực tiếp với thần linh" },
    { id: "naturalism",  label: "Tự Nhiên Học",     icon: "🌿", domain: "science",   desc: "Hiểu thế giới qua quan sát thiên nhiên" },
    { id: "militarism",  label: "Binh Pháp Học",    icon: "⚔️",  domain: "war",       desc: "Nghệ thuật và khoa học chiến tranh" },
    { id: "commerce",    label: "Kinh Tế Học",      icon: "💰", domain: "trade",     desc: "Lý thuyết trao đổi, giá trị và thương mại" },
    { id: "aesthetics",  label: "Mỹ Học",           icon: "🎨", domain: "culture",   desc: "Bản chất của cái đẹp và nghệ thuật" },
    { id: "theology",    label: "Thần Học",         icon: "✨", domain: "religion",  desc: "Hiểu biết về thần thánh qua kinh điển và lý trí" },
    { id: "dialectics",  label: "Biện Chứng Học",   icon: "🔁", domain: "academia",  desc: "Tìm sự thật qua đối thoại và tranh luận" }
  ];

  var RELIGIOUS_REFORMS = [
    { id: "reform_tolerance", label: "Khoan Dung", desc: "Chấp nhận tín ngưỡng khác" },
    { id: "reform_puritan",   label: "Thanh Giáo",  desc: "Quay về giáo lý gốc" },
    { id: "reform_mystic",    label: "Thần Bí",     desc: "Nhấn mạnh trải nghiệm trực tiếp" },
    { id: "reform_political", label: "Thần Quyền",  desc: "Tôn giáo nắm quyền chính trị" },
    { id: "reform_secular",   label: "Thế Tục Hóa", desc: "Tách tôn giáo khỏi nhà nước" }
  ];

  window.philosophyV79Data = {
    civSchools: {},
    debates: [],
    conflicts: [],
    synthesises: [],
    religiousReforms: [],
    totalPhilosophers: 0,
    lastDebateYear: 0
  };

  function save() {
    try {
      var compact = {
        civSchools: window.philosophyV79Data.civSchools,
        debates: window.philosophyV79Data.debates.slice(-15),
        conflicts: window.philosophyV79Data.conflicts.slice(-10),
        synthesises: window.philosophyV79Data.synthesises.slice(-10),
        religiousReforms: window.philosophyV79Data.religiousReforms.slice(-8),
        totalPhilosophers: window.philosophyV79Data.totalPhilosophers,
        lastDebateYear: window.philosophyV79Data.lastDebateYear
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.philosophyV79Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.phil79AssignSchool = function(countryName, schoolId) {
    var data = window.philosophyV79Data;
    if (!data.civSchools[countryName]) data.civSchools[countryName] = { schools: [], dominantSchool: null, philosophers: 0, influence: 0 };
    var school = PHILOSOPHY_SCHOOLS.find(function(s) { return s.id === schoolId; });
    if (!school) {
      var seed = seedHash(countryName + (window.year || 1));
      school = PHILOSOPHY_SCHOOLS[seed % PHILOSOPHY_SCHOOLS.length];
    }
    var existing = data.civSchools[countryName];
    if (!existing.schools.find(function(s) { return s.id === school.id; })) {
      existing.schools.push({ id: school.id, label: school.label, icon: school.icon, desc: school.desc, domain: school.domain, addedYear: window.year || 1 });
      if (!existing.dominantSchool) existing.dominantSchool = school.id;
      existing.philosophers++;
      data.totalPhilosophers++;
    }
    save();
    return existing;
  };

  window.phil79SpawnDebate = function(civA, civB) {
    var data = window.philosophyV79Data;
    var schoolA = data.civSchools[civA];
    var schoolB = data.civSchools[civB];
    if (!schoolA || !schoolB) return null;
    if (schoolA.schools.length === 0 || schoolB.schools.length === 0) return null;
    var domA = PHILOSOPHY_SCHOOLS.find(function(s) { return s.id === schoolA.dominantSchool; });
    var domB = PHILOSOPHY_SCHOOLS.find(function(s) { return s.id === schoolB.dominantSchool; });
    if (!domA || !domB || domA.id === domB.id) return null;

    var isConflict = domA.domain !== domB.domain;
    var year = window.year || 1;
    var event = {
      year: year,
      civA: civA, schA: domA.label, iconA: domA.icon,
      civB: civB, schB: domB.label, iconB: domB.icon,
      isConflict: isConflict,
      outcome: isConflict ? "Xung đột tư tưởng" : "Tổng hợp tri thức"
    };

    if (isConflict) {
      data.conflicts.push(event);
      if (typeof window.cce79AddIdeologicalTension === "function") window.cce79AddIdeologicalTension(civA, civB, 8);
      if (typeof window.htAddEvent === "function") {
        window.htAddEvent({ year: year, type: "ideology_conflict", title: "💥 Xung Đột Tư Tưởng: " + domA.icon + domA.label + " (" + civA + ") vs " + domB.icon + domB.label + " (" + civB + ")", color: "#c0392b" });
      }
    } else {
      data.synthesises.push(event);
      schoolA.influence += 10;
      schoolB.influence += 10;
    }
    data.debates.push(event);
    if (data.debates.length > 15) data.debates.shift();
    save();
    return event;
  };

  window.phil79TriggerReligiousReform = function(countryName) {
    var data = window.philosophyV79Data;
    var seed = seedHash(countryName + (window.year || 1));
    var reform = RELIGIOUS_REFORMS[seed % RELIGIOUS_REFORMS.length];
    var year = window.year || 1;
    var reformEvent = { year: year, country: countryName, reform: reform.id, label: reform.label, desc: reform.desc };
    data.religiousReforms.push(reformEvent);
    if (data.religiousReforms.length > 8) data.religiousReforms.shift();
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "religion_reform", title: "✨ Cải Cách Tôn Giáo: " + reform.label + " tại " + countryName + " — " + reform.desc, color: "#8e44ad" });
    }
    save();
    return reformEvent;
  };

  window.phil79GetCivPhilosophy = function(countryName) { return window.philosophyV79Data.civSchools[countryName] || null; };
  window.phil79GetDebates = function() { return window.philosophyV79Data.debates.slice().reverse(); };
  window.phil79GetConflicts = function() { return window.philosophyV79Data.conflicts.slice().reverse(); };
  window.phil79GetReforms = function() { return window.philosophyV79Data.religiousReforms.slice().reverse(); };
  window.phil79GetStats = function() {
    var d = window.philosophyV79Data;
    return { civSchools: Object.keys(d.civSchools).length, debates: d.debates.length, conflicts: d.conflicts.length, synthesises: d.synthesises.length, reforms: d.religiousReforms.length, totalPhilosophers: d.totalPhilosophers };
  };
  window.PHIL79_SCHOOLS = PHILOSOPHY_SCHOOLS;
  window.PHIL79_REFORMS = RELIGIOUS_REFORMS;

  function autoPhilosophy() {
    var data = window.philosophyV79Data;
    var year = window.year || 1;
    if (year - data.lastDebateYear < 250) return;
    data.lastDebateYear = year;
    if (!window.countries || window.countries.length < 2) return;

    window.countries.slice(0, 10).forEach(function(c) {
      if (!c || !c.name) return;
      if (!data.civSchools[c.name]) window.phil79AssignSchool(c.name);
    });

    var civNames = Object.keys(data.civSchools);
    if (civNames.length >= 2) {
      var a = civNames[Math.floor(Math.random() * civNames.length)];
      var b = civNames[Math.floor(Math.random() * civNames.length)];
      if (a !== b) window.phil79SpawnDebate(a, b);
    }

    if (Math.random() < 0.2 && civNames.length > 0) {
      var c2 = civNames[Math.floor(Math.random() * civNames.length)];
      window.phil79TriggerReligiousReform(c2);
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.004) autoPhilosophy();
    };
    console.log("[PhilosophyEngineV79] 💭 Triết Học khởi động — 10 trường phái · 5 cải cách tôn giáo · Xung đột tư tưởng · Tổng hợp tri thức sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 20900); });
  } else {
    setTimeout(init, 20900);
  }
})();
