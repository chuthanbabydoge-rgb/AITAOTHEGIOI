(function() {
  "use strict";
  var SAVE_KEY = "cgv6_universe_cluster_v80";

  var CLUSTER_TYPES = [
    { id: "civilization", label: "Văn Minh",    icon: "🏛️",  color: "#8e44ad", desc: "Thế giới có nền văn minh phát triển mạnh nhất" },
    { id: "technology",   label: "Công Nghệ",   icon: "⚙️",  color: "#3498db", desc: "Khoa học và kỹ thuật là sức mạnh thống trị" },
    { id: "mythology",    label: "Thần Thoại",  icon: "⚡", color: "#f39c12", desc: "Các thế giới gắn kết bởi thần linh chung" },
    { id: "warfare",      label: "Chiến Tranh", icon: "⚔️",  color: "#e74c3c", desc: "Liên minh quân sự xuyên thế giới" },
    { id: "spiritual",    label: "Tâm Linh",   icon: "🌀", color: "#1abc9c", desc: "Các thế giới tìm kiếm giác ngộ cùng nhau" },
    { id: "mercantile",   label: "Thương Mại",  icon: "💰", color: "#e67e22", desc: "Mạng lưới trao đổi kinh tế xuyên chiều không gian" }
  ];

  window.universeClusterV80Data = {
    clusters: {},
    worldClusterMap: {},
    clusterHistory: [],
    lastScanYear: 0,
    totalClusters: 0
  };

  function save() {
    try {
      var compact = {
        clusters: window.universeClusterV80Data.clusters,
        worldClusterMap: window.universeClusterV80Data.worldClusterMap,
        clusterHistory: window.universeClusterV80Data.clusterHistory.slice(-20),
        lastScanYear: window.universeClusterV80Data.lastScanYear,
        totalClusters: window.universeClusterV80Data.totalClusters
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.universeClusterV80Data = JSON.parse(d);
    } catch(e) {}
  }

  function seedHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
  }

  window.uclu80CreateCluster = function(typeId, leaderWorld) {
    var data = window.universeClusterV80Data;
    var type = CLUSTER_TYPES.find(function(t) { return t.id === typeId; }) || CLUSTER_TYPES[0];
    var year = window.year || 1;
    var id = "cluster_" + typeId + "_" + Date.now();
    var namePrefixes = ["Hội", "Liên Minh", "Đế Quốc", "Nhóm", "Khối"];
    var seed = seedHash(typeId + year);
    var cluster = {
      id: id,
      name: namePrefixes[seed % namePrefixes.length] + " " + type.label,
      type: type.id,
      typeLabel: type.label,
      typeIcon: type.icon,
      typeColor: type.color,
      typeDesc: type.desc,
      leader: leaderWorld || null,
      members: leaderWorld ? [leaderWorld] : [],
      foundedYear: year,
      power: 10,
      age: 0,
      dissolved: false
    };
    data.clusters[id] = cluster;
    data.totalClusters++;
    if (leaderWorld) data.worldClusterMap[leaderWorld] = id;
    data.clusterHistory.push({ year: year, event: "founded", clusterId: id, name: cluster.name, icon: type.icon });
    if (data.clusterHistory.length > 20) data.clusterHistory.shift();
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "cluster_formed", title: type.icon + " [Đa VT] Cụm " + type.label + " hình thành: " + cluster.name, color: type.color });
    }
    save();
    return cluster;
  };

  window.uclu80AddMember = function(clusterId, worldName) {
    var data = window.universeClusterV80Data;
    var cluster = data.clusters[clusterId];
    if (!cluster || cluster.dissolved) return false;
    if (!cluster.members.includes(worldName)) {
      cluster.members.push(worldName);
      cluster.power += 8;
      data.worldClusterMap[worldName] = clusterId;
    }
    save();
    return true;
  };

  window.uclu80GetWorldCluster = function(worldName) {
    var data = window.universeClusterV80Data;
    var cId = data.worldClusterMap[worldName];
    return cId ? data.clusters[cId] : null;
  };

  window.uclu80GetClustersByType = function(typeId) {
    return Object.values(window.universeClusterV80Data.clusters).filter(function(c) { return c.type === typeId && !c.dissolved; });
  };

  window.uclu80GetAllClusters = function() {
    return Object.values(window.universeClusterV80Data.clusters).filter(function(c) { return !c.dissolved; });
  };

  window.uclu80GetStats = function() {
    var d = window.universeClusterV80Data;
    var active = Object.values(d.clusters).filter(function(c) { return !c.dissolved; });
    var byType = {};
    active.forEach(function(c) { byType[c.typeLabel] = (byType[c.typeLabel] || 0) + 1; });
    return { total: d.totalClusters, active: active.length, byType: byType };
  };
  window.UCLU80_TYPES = CLUSTER_TYPES;

  function autoScan() {
    var data = window.universeClusterV80Data;
    var year = window.year || 1;
    if (year - data.lastScanYear < 300) return;
    data.lastScanYear = year;

    var worlds = typeof window.mevo80GetAlive === "function" ? window.mevo80GetAlive() : [];
    if (worlds.length < 2) return;

    // Create a cluster if fewer than 3 active
    var activeClusters = Object.values(data.clusters).filter(function(c) { return !c.dissolved; });
    if (activeClusters.length < 3 && worlds.length >= 2) {
      var seed = Math.floor(Math.random() * CLUSTER_TYPES.length);
      var leaderIdx = Math.floor(Math.random() * worlds.length);
      var cluster = window.uclu80CreateCluster(CLUSTER_TYPES[seed].id, worlds[leaderIdx].name);

      // Add 1-2 more members
      worlds.slice(0, Math.min(3, worlds.length)).forEach(function(w, i) {
        if (i > 0 && w.name !== worlds[leaderIdx].name && !data.worldClusterMap[w.name]) {
          window.uclu80AddMember(cluster.id, w.name);
        }
      });
    }

    // Grow existing clusters
    activeClusters.forEach(function(cluster) {
      cluster.age++;
      cluster.power += 2;
      // Add unmapped world
      var unmapped = worlds.filter(function(w) { return !data.worldClusterMap[w.name]; });
      if (unmapped.length > 0 && Math.random() < 0.4) {
        window.uclu80AddMember(cluster.id, unmapped[0].name);
      }
    });
    save();
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.004) autoScan();
    };
    console.log("[UniverseClusterV80] 🔭 Cụm Vũ Trụ khởi động — 6 loại cụm · Auto-form · Power tracking · Leader tracking sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21300); });
  } else {
    setTimeout(init, 21300);
  }
})();
