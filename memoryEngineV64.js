(function() {
  "use strict";
  const SAVE_KEY = "cgv6_memory_core_v64";

  window.memoryV64Data = {
    version: 64,
    globalMemories: [],      // [{id, year, category, title, content, importance, tags}]
    memoryIndex: {},         // key=category, value=[ids]
    totalRecorded: 0,
    lastTick: 0
  };

  // Categories
  const CATEGORIES = {
    divine:      { label: "Thần Thánh",    icon: "✨", color: "#facc15" },
    war:         { label: "Chiến Tranh",   icon: "⚔️", color: "#f87171" },
    disaster:    { label: "Thiên Tai",     icon: "🌋", color: "#fb923c" },
    hero:        { label: "Anh Hùng",      icon: "🌟", color: "#4ade80" },
    civilization:{ label: "Văn Minh",     icon: "🏛️", color: "#60a5fa" },
    era:         { label: "Kỷ Nguyên",    icon: "🌅", color: "#67e8f9" },
    creator:     { label: "Tạo Hóa",      icon: "👁️", color: "#c084fc" },
    plague:      { label: "Đại Dịch",     icon: "💀", color: "#94a3b8" },
    economic:    { label: "Kinh Tế",      icon: "💹", color: "#34d399" },
    legend:      { label: "Truyền Thuyết", icon: "📖", color: "#fde68a" }
  };
  window.memoryV64Categories = CATEGORIES;

  function save() {
    try {
      const d = { ...window.memoryV64Data };
      d.globalMemories = d.globalMemories.slice(-500);
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) { console.warn("[MemoryV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        window.memoryV64Data = { ...window.memoryV64Data, ...parsed };
      }
    } catch(e) { console.warn("[MemoryV64] load error:", e); }
  }

  // Core public API
  window.mem64Record = function(category, title, content, importance = 3, tags = []) {
    const id = "mem_" + Date.now() + "_" + Math.random().toString(36).substr(2,5);
    const year = window.year || 0;
    const entry = { id, year, category, title, content, importance, tags, decay: 0 };
    window.memoryV64Data.globalMemories.push(entry);
    if (!window.memoryV64Data.memoryIndex[category]) window.memoryV64Data.memoryIndex[category] = [];
    window.memoryV64Data.memoryIndex[category].push(id);
    window.memoryV64Data.totalRecorded++;
    return id;
  };

  window.mem64GetByCategory = function(category, limit = 20) {
    return window.memoryV64Data.globalMemories
      .filter(m => m.category === category)
      .sort((a,b) => b.importance - a.importance || b.year - a.year)
      .slice(0, limit);
  };

  window.mem64GetRecent = function(limit = 30) {
    return [...window.memoryV64Data.globalMemories]
      .sort((a,b) => b.year - a.year)
      .slice(0, limit);
  };

  window.mem64GetByImportance = function(minImportance = 4, limit = 50) {
    return window.memoryV64Data.globalMemories
      .filter(m => m.importance >= minImportance)
      .sort((a,b) => b.importance - a.importance)
      .slice(0, limit);
  };

  window.mem64Search = function(keyword) {
    const kw = keyword.toLowerCase();
    return window.memoryV64Data.globalMemories
      .filter(m => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw))
      .slice(0, 30);
  };

  window.mem64GetStats = function() {
    const d = window.memoryV64Data;
    const byCat = {};
    Object.keys(CATEGORIES).forEach(c => {
      byCat[c] = d.globalMemories.filter(m => m.category === c).length;
    });
    return {
      total: d.globalMemories.length,
      totalRecorded: d.totalRecorded,
      byCategory: byCat,
      legends: d.globalMemories.filter(m => m.decay >= 80).length,
      highImportance: d.globalMemories.filter(m => m.importance >= 4).length
    };
  };

  // Auto-scan world events on tick
  window.memoryV64Tick = function() {
    const d = window.memoryV64Data;
    const year = window.year || 0;
    if (year - d.lastTick < 10) return;
    d.lastTick = year;

    // Scan active wars
    if (window.warsActive && Array.isArray(window.warsActive)) {
      window.warsActive.forEach(w => {
        const key = "war_" + (w.attacker||'') + "_" + (w.defender||'');
        const exists = d.globalMemories.some(m => m.tags && m.tags.includes(key));
        if (!exists && w.attacker && w.defender) {
          window.mem64Record("war",
            `Chiến Tranh: ${w.attacker} vs ${w.defender}`,
            `Năm ${year}: ${w.attacker} tuyên chiến với ${w.defender}. Nguyên nhân: ${w.reason||'Không rõ'}.`,
            4, [key]);
        }
      });
    }

    // Scan active disasters
    if (window.disasterData && window.disasterData.activeDisasters) {
      window.disasterData.activeDisasters.forEach(dis => {
        const key = "dis_" + dis.id;
        const exists = d.globalMemories.some(m => m.tags && m.tags.includes(key));
        if (!exists) {
          window.mem64Record("disaster",
            `Thiên Tai: ${dis.name||dis.type}`,
            `Năm ${year}: ${dis.name||dis.type} tàn phá ${dis.region||'thế giới'}. Mức độ: ${dis.severity||'Lớn'}.`,
            4, [key]);
        }
      });
    }

    // Save every 50 ticks
    if (year % 50 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.memoryV64Tick();
    };
    console.log("[MemoryEngineV64] ✅ Hệ thống ký ức lõi khởi động — Thế giới bắt đầu ghi nhớ.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12600); });
  } else {
    setTimeout(init, 12600);
  }
})();
