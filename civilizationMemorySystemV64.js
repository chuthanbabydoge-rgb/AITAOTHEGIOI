(function() {
  "use strict";
  const SAVE_KEY = "cgv6_civ_memory_v64";

  window.civMemoryV64Data = {
    version: 64,
    civMemories: {},  // key=civId (country/kingdom name), value={founder, wars:[], heroes:[], religions:[], events:[]}
    lastScan: 0
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(window.civMemoryV64Data));
    } catch(e) { console.warn("[CivMemoryV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.civMemoryV64Data = { ...window.civMemoryV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function ensureCiv(civId) {
    if (!window.civMemoryV64Data.civMemories[civId]) {
      window.civMemoryV64Data.civMemories[civId] = {
        founder: null,
        foundYear: null,
        wars: [],
        heroes: [],
        religions: [],
        events: [],
        memorableMoments: []
      };
    }
    return window.civMemoryV64Data.civMemories[civId];
  }

  // Public API
  window.civMem64RecordFounder = function(civId, founderName, year) {
    const civ = ensureCiv(civId);
    if (!civ.founder) {
      civ.founder = founderName;
      civ.foundYear = year || window.year || 0;
      civ.events.push({
        year: civ.foundYear, type: "founding",
        title: `Khai Quốc Bởi ${founderName}`,
        content: `${civId} được khai sáng bởi ${founderName} vào năm ${civ.foundYear}.`,
        importance: 5
      });
    }
  };

  window.civMem64RecordWar = function(civId, enemy, outcome, year) {
    const civ = ensureCiv(civId);
    const yr = year || window.year || 0;
    civ.wars.push({ year: yr, enemy, outcome, importance: 4 });
    civ.memorableMoments.push({
      year: yr, importance: 4,
      title: `Chiến Tranh Với ${enemy}`,
      content: `${civId} ${outcome === 'won' ? 'đại thắng' : outcome === 'lost' ? 'thất bại' : 'giao chiến'} với ${enemy} năm ${yr}.`
    });
  };

  window.civMem64RecordHero = function(civId, heroName, deed, year) {
    const civ = ensureCiv(civId);
    const yr = year || window.year || 0;
    civ.heroes.push({ name: heroName, deed, year: yr });
    civ.memorableMoments.push({
      year: yr, importance: 4,
      title: `Anh Hùng ${heroName}`,
      content: `${heroName} của ${civId} đã ${deed} vào năm ${yr}.`
    });
  };

  window.civMem64RecordEvent = function(civId, title, content, importance) {
    const civ = ensureCiv(civId);
    const yr = window.year || 0;
    civ.events.push({ year: yr, title, content, importance: importance || 3 });
    civ.memorableMoments.push({ year: yr, title, content, importance: importance || 3 });
  };

  window.civMem64GetHistory = function(civId) {
    const civ = window.civMemoryV64Data.civMemories[civId];
    if (!civ) return null;
    return {
      civId,
      founder: civ.founder,
      foundYear: civ.foundYear,
      warCount: civ.wars.length,
      heroCount: civ.heroes.length,
      memorableMoments: civ.memorableMoments.sort((a,b)=>b.importance-a.importance).slice(0,10),
      allEvents: civ.events.sort((a,b)=>b.year-a.year).slice(0,20)
    };
  };

  window.civMem64GetAllCivs = function() {
    return Object.keys(window.civMemoryV64Data.civMemories);
  };

  window.civMem64GetNarrative = function(civId) {
    const h = window.civMem64GetHistory(civId);
    if (!h) return `${civId} chưa có ký ức văn minh.`;
    let story = `📜 **${civId}**\n`;
    if (h.founder) story += `Được khai sáng bởi *${h.founder}* vào năm ${h.foundYear}.\n`;
    story += `Đã trải qua ${h.warCount} cuộc chiến, ${h.heroCount} anh hùng được ghi nhận.\n`;
    if (h.memorableMoments.length > 0) {
      story += `\nKhoảnh Khắc Đáng Nhớ:\n`;
      h.memorableMoments.slice(0,3).forEach(m => story += `• ${m.title} (Năm ${m.year})\n`);
    }
    return story;
  };

  function scanCivs() {
    const year = window.year || 0;
    const countries = window.countries || [];

    countries.forEach(c => {
      const id = c.name;
      if (!id) return;
      const civ = ensureCiv(id);

      // Record founder from leader
      if (c.leader && !civ.founder) {
        window.civMem64RecordFounder(id, c.leader, year);
      }

      // Record religion
      if (c.religion && !civ.religions.includes(c.religion)) {
        civ.religions.push(c.religion);
        civ.events.push({
          year, importance: 3,
          title: `Tín Ngưỡng ${c.religion}`,
          content: `${id} tôn thờ ${c.religion} từ năm ${year}.`
        });
      }
    });

    // Scan kingdoms
    if (window.kingdomData) {
      const kingdoms = Array.isArray(window.kingdomData.kingdoms)
        ? window.kingdomData.kingdoms
        : Object.values(window.kingdomData.kingdoms || {});
      kingdoms.forEach(k => {
        if (!k || !k.name) return;
        const civ = ensureCiv(k.name);
        if (k.ruler && !civ.founder) {
          window.civMem64RecordFounder(k.name, k.ruler, year);
        }
      });
    }
  }

  window.civMemoryV64Tick = function() {
    const year = window.year || 0;
    const d = window.civMemoryV64Data;
    if (year - d.lastScan < 30) return;
    d.lastScan = year;
    scanCivs();
    if (year % 150 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.civMemoryV64Tick();
    };
    console.log("[CivMemoryV64] ✅ Ký ức văn minh khởi động — Mỗi nền văn minh bắt đầu ghi nhớ lịch sử.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12800); });
  } else {
    setTimeout(init, 12800);
  }
})();
