(function() {
  "use strict";
  const SAVE_KEY = "cgv6_dynasty_memory_v64";

  window.dynastyMemoryV64Data = {
    version: 64,
    dynasties: {},     // key=dynastyId, value={name, founder, members:[], records:[], ancestorMemories:[]}
    familyLegends: [], // [{dynastyId, title, content, importance, year}]
    lastScan: 0
  };

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(window.dynastyMemoryV64Data));
    } catch(e) { console.warn("[DynastyMemoryV64] save error:", e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) window.dynastyMemoryV64Data = { ...window.dynastyMemoryV64Data, ...JSON.parse(raw) };
    } catch(e) {}
  }

  function ensureDynasty(dynastyId, name) {
    if (!window.dynastyMemoryV64Data.dynasties[dynastyId]) {
      window.dynastyMemoryV64Data.dynasties[dynastyId] = {
        id: dynastyId,
        name: name || dynastyId,
        founder: null,
        foundYear: null,
        members: [],
        records: [],
        ancestorMemories: [],
        greatAncestors: []
      };
    }
    return window.dynastyMemoryV64Data.dynasties[dynastyId];
  }

  // Public API
  window.dynMem64RecordFounder = function(dynastyId, dynastyName, founderName, year) {
    const dyn = ensureDynasty(dynastyId, dynastyName);
    if (!dyn.founder) {
      dyn.founder = founderName;
      dyn.foundYear = year || window.year || 0;
      dyn.records.push({
        year: dyn.foundYear, type: "founding", importance: 5,
        title: `Khai Sáng Gia Tộc Bởi ${founderName}`,
        content: `${dynastyName} được thành lập bởi ${founderName} vào năm ${dyn.foundYear}. Vị tổ tiên đầu tiên đặt nền móng cho gia tộc.`
      });
      dyn.greatAncestors.push({ name: founderName, role: "Thủy Tổ", year: dyn.foundYear, importance: 5 });
    }
  };

  window.dynMem64AddMember = function(dynastyId, memberName, role, year) {
    const dyn = ensureDynasty(dynastyId);
    const yr = year || window.year || 0;
    if (!dyn.members.find(m => m.name === memberName)) {
      dyn.members.push({ name: memberName, role: role || "Thành Viên", joinYear: yr });
    }
  };

  window.dynMem64RecordHeroicAncestor = function(dynastyId, ancestorName, deed, year) {
    const dyn = ensureDynasty(dynastyId);
    const yr = year || window.year || 0;
    dyn.greatAncestors.push({ name: ancestorName, role: "Anh Hùng", deed, year: yr, importance: 4 });
    dyn.ancestorMemories.push({
      year: yr, title: `Tiên Tổ ${ancestorName}`,
      content: `Tiên tổ ${ancestorName} của gia tộc đã ${deed} vào năm ${yr}. Con cháu mãi ghi nhớ.`,
      importance: 4
    });
    // Add to family legends
    window.dynastyMemoryV64Data.familyLegends.push({
      dynastyId, year: yr, importance: 4,
      title: `Huyền Thoại Tiên Tổ ${ancestorName}`,
      content: `${ancestorName}, tiên tổ của ${dyn.name}, đã ${deed}. Câu chuyện này được lưu truyền qua nhiều thế hệ.`
    });
  };

  window.dynMem64RecordEvent = function(dynastyId, title, content, importance) {
    const dyn = ensureDynasty(dynastyId);
    const yr = window.year || 0;
    dyn.records.push({ year: yr, title, content, importance: importance || 3 });
  };

  window.dynMem64GetHistory = function(dynastyId) {
    const dyn = window.dynastyMemoryV64Data.dynasties[dynastyId];
    if (!dyn) return null;
    return {
      ...dyn,
      records: dyn.records.sort((a,b) => b.importance - a.importance).slice(0, 15),
      greatAncestors: dyn.greatAncestors.sort((a,b) => b.importance - a.importance).slice(0, 5)
    };
  };

  window.dynMem64GetAllDynasties = function() {
    return Object.values(window.dynastyMemoryV64Data.dynasties)
      .sort((a,b) => b.records.length - a.records.length);
  };

  window.dynMem64GetFamilyLegends = function(limit = 10) {
    return window.dynastyMemoryV64Data.familyLegends
      .sort((a,b) => b.importance - a.importance || b.year - a.year)
      .slice(0, limit);
  };

  window.dynMem64GetAncestorNarrative = function(dynastyId) {
    const dyn = window.dynastyMemoryV64Data.dynasties[dynastyId];
    if (!dyn) return "Gia tộc này chưa được ghi chép.";
    let narrative = `⚰️ **Biên Niên Gia Tộc ${dyn.name}**\n\n`;
    if (dyn.founder) narrative += `Được lập bởi *${dyn.founder}* (Năm ${dyn.foundYear}).\n\n`;
    if (dyn.greatAncestors.length > 0) {
      narrative += `**Tiên Tổ Hiển Hách:**\n`;
      dyn.greatAncestors.slice(0, 3).forEach(a => {
        narrative += `• ${a.name} (${a.role}${a.deed ? ': ' + a.deed : ''})\n`;
      });
    }
    narrative += `\nTổng ${dyn.members.length} thành viên · ${dyn.records.length} sự kiện được ghi chép.`;
    return narrative;
  };

  // Scan dynasty data
  function scanDynasties() {
    const year = window.year || 0;
    const npcs = window.npcs || [];

    // Scan NPC families
    npcs.forEach(npc => {
      if (!npc.family && !npc.dynasty) return;
      const dynId = npc.dynasty || npc.family;
      if (!dynId) return;
      const dyn = ensureDynasty(dynId);
      window.dynMem64AddMember(dynId, npc.name, npc.role || "Thành Viên", year);

      // Auto-set founder from oldest member
      if (!dyn.founder && npc.age && npc.age > 100) {
        window.dynMem64RecordFounder(dynId, dynId, npc.name, year - (npc.age || 0));
      }

      // Record heroic deeds
      if (npc.realm && npc.realm.includes("Đế") && !dyn.greatAncestors.find(a => a.name === npc.name)) {
        window.dynMem64RecordHeroicAncestor(dynId, npc.name, `đạt cảnh giới ${npc.realm}`, year);
      }
    });
  }

  window.dynastyMemoryV64Tick = function() {
    const year = window.year || 0;
    const d = window.dynastyMemoryV64Data;
    if (year - d.lastScan < 50) return;
    d.lastScan = year;
    scanDynasties();
    if (year % 200 === 0) save();
  };

  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      window.dynastyMemoryV64Tick();
    };
    console.log("[DynastyMemoryV64] ✅ Ký ức gia tộc khởi động — Con cháu sẽ nhớ tổ tiên.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 13000); });
  } else {
    setTimeout(init, 13000);
  }
})();
