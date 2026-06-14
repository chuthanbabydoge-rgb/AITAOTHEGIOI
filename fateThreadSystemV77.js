(function() {
  "use strict";
  var SAVE_KEY = "cgv6_fate_threads_v77";

  var THREAD_TYPES = [
    { id: "destiny",  label: "Định Mệnh",    icon: "⭐", color: "#f1c40f", desc: "Hai thực thể gắn kết bởi số phận" },
    { id: "rival",    label: "Kình Địch",     icon: "⚔️",  color: "#e74c3c", desc: "Một kẻ địch muôn đời" },
    { id: "protege",  label: "Thầy Trò",      icon: "📚", color: "#3498db", desc: "Mối quan hệ dẫn đường" },
    { id: "doom",     label: "Tử Vận",        icon: "💀", color: "#95a5a6", desc: "Chỉ một người tồn tại" },
    { id: "salvation","label": "Cứu Rỗi",     icon: "🕊️",  color: "#2ecc71", desc: "Một người cứu một người" },
    { id: "bound",    label: "Huyết Ước",     icon: "🩸", color: "#9b59b6", desc: "Gắn kết bởi lời thề máu" }
  ];

  window.fateThreadV77Data = {
    threads: [],
    nodes: [],
    totalCreated: 0,
    lastScanYear: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.fateThreadV77Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.fateThreadV77Data = JSON.parse(d);
    } catch(e) {}
  }

  function getOrCreateNode(entityId, entityName, entityType) {
    var data = window.fateThreadV77Data;
    var node = data.nodes.find(function(n) { return n.id === entityId; });
    if (!node) {
      node = { id: entityId, name: entityName, type: entityType, threadCount: 0, fateScore: Math.floor(Math.random() * 60) + 20 };
      data.nodes.push(node);
    }
    return node;
  }

  window.ft77AddThread = function(entityAId, entityAName, entityAType, entityBId, entityBName, entityBType, threadTypeId, reason) {
    var data = window.fateThreadV77Data;
    var exists = data.threads.find(function(t) {
      return (t.entityA.id === entityAId && t.entityB.id === entityBId) ||
             (t.entityA.id === entityBId && t.entityB.id === entityAId);
    });
    if (exists) return exists;
    if (data.threads.length >= 50) data.threads.shift();
    var typeDef = THREAD_TYPES.find(function(t) { return t.id === threadTypeId; }) || THREAD_TYPES[0];
    var nodeA = getOrCreateNode(entityAId, entityAName, entityAType);
    var nodeB = getOrCreateNode(entityBId, entityBName, entityBType);
    nodeA.threadCount++;
    nodeB.threadCount++;
    var thread = {
      id: "thread_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      type: threadTypeId,
      label: typeDef.label,
      icon: typeDef.icon,
      color: typeDef.color,
      entityA: { id: entityAId, name: entityAName, type: entityAType },
      entityB: { id: entityBId, name: entityBName, type: entityBType },
      reason: reason || typeDef.desc,
      strength: Math.floor(Math.random() * 60) + 40,
      birthYear: window.year || 1,
      active: true
    };
    data.threads.push(thread);
    data.totalCreated++;
    save();
    return thread;
  };

  window.ft77GetThreads = function() { return window.fateThreadV77Data.threads.slice(); };
  window.ft77GetActiveThreads = function() { return window.fateThreadV77Data.threads.filter(function(t) { return t.active; }); };
  window.ft77GetEntityFate = function(entityId) {
    return window.fateThreadV77Data.threads.filter(function(t) {
      return t.entityA.id === entityId || t.entityB.id === entityId;
    });
  };
  window.ft77GetWeb = function() {
    return { nodes: window.fateThreadV77Data.nodes.slice(), threads: window.fateThreadV77Data.threads.filter(function(t){return t.active;}) };
  };
  window.ft77GetStats = function() {
    var d = window.fateThreadV77Data;
    var byType = THREAD_TYPES.map(function(t) {
      return { type: t.id, label: t.label, icon: t.icon, count: d.threads.filter(function(th) { return th.type === t.id; }).length };
    });
    return {
      totalThreads: d.threads.length,
      activeThreads: d.threads.filter(function(t){return t.active;}).length,
      totalNodes: d.nodes.length,
      totalCreated: d.totalCreated,
      byType: byType,
      mostConnected: d.nodes.sort(function(a,b){return b.threadCount-a.threadCount;}).slice(0,5)
    };
  };
  window.FT77_THREAD_TYPES = THREAD_TYPES;

  function autoScanFateThreads() {
    var data = window.fateThreadV77Data;
    var year = window.year || 1;
    if (year - data.lastScanYear < 80) return;
    data.lastScanYear = year;

    if (window.countries && window.countries.length >= 2) {
      var idx1 = Math.floor(Math.random() * window.countries.length);
      var idx2 = Math.floor(Math.random() * window.countries.length);
      if (idx1 !== idx2) {
        var ca = window.countries[idx1], cb = window.countries[idx2];
        if (ca && cb && ca.name && cb.name) {
          var tTypes = ["destiny","rival","doom","bound"];
          window.ft77AddThread(
            "country_" + ca.name, ca.name, "country",
            "country_" + cb.name, cb.name, "country",
            tTypes[Math.floor(Math.random() * tTypes.length)],
            "Số phận hai quốc gia giao thoa trong dòng thời gian."
          );
        }
      }
    }

    if (window.npcs && window.npcs.length >= 2) {
      var ni1 = Math.floor(Math.random() * Math.min(window.npcs.length, 30));
      var ni2 = Math.floor(Math.random() * Math.min(window.npcs.length, 30));
      if (ni1 !== ni2) {
        var na = window.npcs[ni1], nb = window.npcs[ni2];
        if (na && nb && na.name && nb.name) {
          var nTypes = ["destiny","rival","protege","salvation","bound"];
          window.ft77AddThread(
            "npc_" + na.name, na.name, "npc",
            "npc_" + nb.name, nb.name, "npc",
            nTypes[Math.floor(Math.random() * nTypes.length)],
            "Hai linh hồn được thần sấm kết nối."
          );
        }
      }
    }
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.005) autoScanFateThreads();
    };
    autoScanFateThreads();
    console.log("[FateThreadSystemV77] 🕸️ Mạng Lưới Vận Mệnh khởi động — " + window.fateThreadV77Data.threads.length + " sợi duyên · 6 loại · Auto-scan sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19400); });
  } else {
    setTimeout(init, 19400);
  }
})();
