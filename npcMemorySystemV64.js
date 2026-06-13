(function() {
  "use strict";
  const SAVE_KEY = "cgv6_npc_memory_v64";

  window.npcMemoryV64Data = {
    version: 64,
    npcMemories: {},   // key=npcId, value={personal:[], family:[], social:[], historical:[]}
    lastScan: 0
  };

  function save() {
    try {
      const d = window.npcMemoryV64Data;
      // Trim each NPC to 20 memories per category
      const trimmed = { version: d.version, lastScan: d.lastScan, npcMemories: {} };
      Object.keys(d.npcMemories).forEach(id => {
        const nm = d.npcMemories[id];
        trimmed.npcMemories[id] = {
          personal:   (nm.personal   || []).slice(-20),
          family:     (nm.family     || []).slice(-20),
          social:     (nm.social     || []).slice(-20),
          historical: (nm.historical || []).slice(-10)
        };
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(trimmed));
    } catch(e) { console.warn("[NpcMemoryV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.npcMemoryV64Data = { ...window.npcMemoryV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function ensureNpc(npcId) {
    if (!window.npcMemoryV64Data.npcMemories[npcId]) {
      window.npcMemoryV64Data.npcMemories[npcId] = {
        personal: [], family: [], social: [], historical: []
      };
    }
    return window.npcMemoryV64Data.npcMemories[npcId];
  }

  // Public API
  window.npcMem64AddMemory = function(npcId, type, title, content, importance = 3) {
    const mem = ensureNpc(npcId);
    const entry = { year: window.year || 0, title, content, importance, decay: 0 };
    if (mem[type]) mem[type].push(entry);
  };

  window.npcMem64GetMemories = function(npcId, type) {
    const mem = window.npcMemoryV64Data.npcMemories[npcId];
    if (!mem) return [];
    if (type) return mem[type] || [];
    return [...(mem.personal||[]), ...(mem.family||[]), ...(mem.social||[]), ...(mem.historical||[])];
  };

  window.npcMem64GetNpcSummary = function(npcId) {
    const npcs = window.npcs || [];
    const npc = npcs.find(n => (n.id||n.name) === npcId);
    const mem = window.npcMemoryV64Data.npcMemories[npcId];
    if (!npc || !mem) return null;
    const allMems = [...(mem.personal||[]), ...(mem.family||[]), ...(mem.social||[]), ...(mem.historical||[])];
    return {
      name: npc.name,
      realm: npc.realm || npc.level || "?",
      totalMemories: allMems.length,
      mostImportant: allMems.sort((a,b)=>b.importance-a.importance).slice(0,3)
    };
  };

  window.npcMem64GetTopNPCs = function(limit = 10) {
    const d = window.npcMemoryV64Data.npcMemories;
    return Object.entries(d)
      .map(([id, mem]) => ({
        id,
        total: (mem.personal||[]).length + (mem.family||[]).length + (mem.social||[]).length + (mem.historical||[]).length
      }))
      .sort((a,b) => b.total - a.total)
      .slice(0, limit);
  };

  // Scan NPCs each tick
  function scanNpcs() {
    const npcs = window.npcs || [];
    const year = window.year || 0;
    npcs.forEach(npc => {
      const id = npc.id || npc.name;
      if (!id) return;
      const mem = ensureNpc(id);

      // Personal: realm breakthrough
      if (npc.realm && !mem.personal.some(m => m.title.includes(npc.realm))) {
        mem.personal.push({
          year, importance: 4,
          title: `Đột Phá ${npc.realm}`,
          content: `${npc.name} đạt cảnh giới ${npc.realm} vào năm ${year}.`,
          decay: 0
        });
      }

      // Social: sect membership
      if (npc.sect && !mem.social.some(m => m.title.includes(npc.sect))) {
        mem.social.push({
          year, importance: 3,
          title: `Gia Nhập ${npc.sect}`,
          content: `${npc.name} gia nhập tông môn ${npc.sect}.`,
          decay: 0
        });
      }

      // Family: marriage
      if (npc.spouse && !mem.family.some(m => m.title.includes("Kết Đôi"))) {
        const spouse = npcs.find(n => n.name === npc.spouse || n.id === npc.spouse);
        mem.family.push({
          year, importance: 4,
          title: `Kết Đôi Với ${npc.spouse}`,
          content: `${npc.name} kết thành đạo lữ với ${spouse ? spouse.name : npc.spouse} năm ${year}.`,
          decay: 0
        });
      }
    });
  }

  window.npcMemoryV64Tick = function() {
    const year = window.year || 0;
    const d = window.npcMemoryV64Data;
    if (year - d.lastScan < 20) return;
    d.lastScan = year;
    scanNpcs();
    if (year % 100 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.npcMemoryV64Tick();
    };
    console.log("[NpcMemoryV64] ✅ Ký ức sinh linh khởi động — Mỗi NPC bắt đầu ghi nhớ cuộc đời.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 12700); });
  } else {
    setTimeout(init, 12700);
  }
})();
