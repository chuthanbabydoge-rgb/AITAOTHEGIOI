(function() {
  "use strict";
  const SAVE_KEY = "cgv6_thuhothan_mem_v33";
  const MAX_MEMORIES = 200;

  window.thuhothanMemoryData = {
    memories: [],
    importantEvents: [],
    version: "V33"
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.thuhothanMemoryData)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        window.thuhothanMemoryData = Object.assign(window.thuhothanMemoryData, parsed);
      }
    } catch(e) {}
  }

  // Thêm ký ức mới
  window.thtAddMemory = function(type, title, content, year) {
    const mem = {
      id: Date.now(),
      type: type || "general", // war | ascension | empire | collapse | divine | creator | economy | boss
      title: title || "",
      content: content || "",
      year: year || (window.year || 0),
      ts: Date.now()
    };
    window.thuhothanMemoryData.memories.unshift(mem);
    if (window.thuhothanMemoryData.memories.length > MAX_MEMORIES) {
      window.thuhothanMemoryData.memories = window.thuhothanMemoryData.memories.slice(0, MAX_MEMORIES);
    }
    // Mark important events
    const importantTypes = ["war","ascension","empire","collapse","divine","boss","creator"];
    if (importantTypes.includes(type)) {
      window.thuhothanMemoryData.importantEvents.unshift(mem);
      if (window.thuhothanMemoryData.importantEvents.length > 50) {
        window.thuhothanMemoryData.importantEvents = window.thuhothanMemoryData.importantEvents.slice(0, 50);
      }
    }
    save();
    return mem;
  };

  // Lấy ký ức gần đây
  window.thtGetRecentMemories = function(n) {
    return (window.thuhothanMemoryData.memories || []).slice(0, n || 20);
  };

  // Tìm kiếm ký ức
  window.thtSearchMemories = function(keyword) {
    const kw = (keyword || "").toLowerCase();
    return (window.thuhothanMemoryData.memories || []).filter(m =>
      (m.title || "").toLowerCase().includes(kw) ||
      (m.content || "").toLowerCase().includes(kw)
    ).slice(0, 20);
  };

  // Lấy ký ức theo loại
  window.thtGetMemoriesByType = function(type) {
    return (window.thuhothanMemoryData.memories || []).filter(m => m.type === type).slice(0, 30);
  };

  // Lấy ký ức trong N năm gần đây
  window.thtGetMemoriesInYears = function(recentYears) {
    const currentYear = window.year || 0;
    const since = currentYear - recentYears;
    return (window.thuhothanMemoryData.memories || []).filter(m => m.year >= since);
  };

  // Xóa ký ức cũ (> 500 năm)
  window.thtPruneOldMemories = function() {
    const currentYear = window.year || 0;
    if (currentYear < 500) return;
    const cutoff = currentYear - 500;
    // Chỉ prune non-important
    const important = window.thuhothanMemoryData.memories.filter(m =>
      ["war","ascension","empire","collapse","divine","boss"].includes(m.type) || m.year >= cutoff
    );
    window.thuhothanMemoryData.memories = important.slice(0, MAX_MEMORIES);
    save();
  };

  function init() {
    load();
    console.log("[ThuHoThanMemory V33] 🧠 Bộ Nhớ Thủ Hộ Thần khởi động —", window.thuhothanMemoryData.memories.length, "ký ức.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 1800); });
  } else {
    setTimeout(init, 1800);
  }
})();
