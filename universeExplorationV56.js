(function() {
  "use strict";
  const SAVE_KEY = "cgv6_cx_exploration_v56";

  const DISCOVERY_TYPES = [
    { id: "universe",  icon: "🌌", name: "Vũ Trụ Mới",      rarity: "common",    reward: "Mở khóa vũ trụ mới · +100 điểm khám phá" },
    { id: "race",      icon: "👥", name: "Chủng Tộc Lạ",    rarity: "uncommon",  reward: "Học kỹ năng chủng tộc · +200 điểm" },
    { id: "god",       icon: "⚡", name: "Thần Linh Cổ Đại", rarity: "rare",      reward: "Cơ hội liên kết thần · +500 điểm" },
    { id: "resource",  icon: "💎", name: "Tài Nguyên Hiếm",  rarity: "uncommon",  reward: "Nguồn tài nguyên mới · +150 điểm" },
    { id: "artifact",  icon: "🏺", name: "Cổ Vật Bí Ẩn",    rarity: "rare",      reward: "Vật phẩm huyền thoại · +400 điểm" },
    { id: "anomaly",   icon: "🌀", name: "Dị Thường Vũ Trụ", rarity: "epic",      reward: "Cơ chế đặc biệt · +1000 điểm" },
    { id: "ruins",     icon: "🏛️", name: "Phế Tích Cổ Đại",  rarity: "uncommon",  reward: "Lịch sử bí ẩn · +250 điểm" },
    { id: "void",      icon: "⬛", name: "Khoảng Trống Vô Cực",rarity:"epic",     reward: "Nguy hiểm cao · nếu thoát: +1500 điểm" }
  ];

  const EXPLORE_MISSIONS = [
    { id: "scout",    name: "🔭 Trinh Sát Sơ Bộ",  duration: 10,  cost: 100,   successRate: 0.9, discoveries: 1 },
    { id: "survey",   name: "📡 Khảo Sát Toàn Diện",duration: 30, cost: 500,   successRate: 0.75, discoveries: 3 },
    { id: "deep",     name: "🌊 Thám Hiểm Sâu",     duration: 60, cost: 2000,  successRate: 0.6,  discoveries: 5 },
    { id: "void",     name: "⬛ Thám Hiểm Khoảng Trống",duration:100,cost:10000,successRate:0.4,  discoveries: 8 }
  ];

  window.explorationV56Data = {
    missions: [],
    completed: [],
    discoveries: [],
    explorationPoints: 0,
    totalMissions: 0,
    exploredUniverses: [],
    tick: 0,
    version: "V56"
  };

  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.explorationV56Data)); } catch(e) {} }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) Object.assign(window.explorationV56Data, JSON.parse(d)); } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 0; }

  window.exp56StartMission = function(missionId, targetUid) {
    var mission = EXPLORE_MISSIONS.find(function(m) { return m.id === missionId; });
    if (!mission) return { ok: false, msg: "Nhiệm vụ không tồn tại" };

    var active = window.explorationV56Data.missions.find(function(m) { return m.status === "active"; });
    if (active) return { ok: false, msg: "Đang có nhiệm vụ thám hiểm đang chạy" };

    var entry = {
      id: "exp_" + Date.now(),
      missionId: missionId,
      missionName: mission.name,
      targetUid: targetUid || "unknown",
      startYear: getYear(),
      endYear: getYear() + mission.duration,
      cost: mission.cost,
      successRate: mission.successRate,
      maxDiscoveries: mission.discoveries,
      status: "active"
    };

    window.explorationV56Data.missions.unshift(entry);
    window.explorationV56Data.totalMissions++;
    save();
    return { ok: true, mission: entry, msg: mission.name + " bắt đầu! Kết thúc năm " + entry.endYear };
  };

  function completeMission(mission) {
    var success = Math.random() < mission.successRate;
    var discoveries = [];
    if (success) {
      var count = mission.maxDiscoveries;
      for (var i = 0; i < count; i++) {
        var rarityRoll = Math.random();
        var pool = rarityRoll < 0.05 ? DISCOVERY_TYPES.filter(function(d) { return d.rarity === "epic"; }) :
                   rarityRoll < 0.2  ? DISCOVERY_TYPES.filter(function(d) { return d.rarity === "rare"; }) :
                   rarityRoll < 0.5  ? DISCOVERY_TYPES.filter(function(d) { return d.rarity === "uncommon"; }) :
                   DISCOVERY_TYPES.filter(function(d) { return d.rarity === "common"; });
        if (pool.length === 0) pool = DISCOVERY_TYPES;
        var disc = pool[Math.floor(Math.random() * pool.length)];
        var entry = {
          id: "disc_" + Date.now() + "_" + i,
          type: disc.id, icon: disc.icon, name: disc.name,
          rarity: disc.rarity, reward: disc.reward,
          universe: mission.targetUid, year: getYear()
        };
        discoveries.push(entry);
        window.explorationV56Data.discoveries.unshift(entry);
        window.explorationV56Data.explorationPoints += (disc.rarity === "epic" ? 1000 : disc.rarity === "rare" ? 400 : disc.rarity === "uncommon" ? 200 : 100);
      }
      if (mission.targetUid && !window.explorationV56Data.exploredUniverses.includes(mission.targetUid)) {
        window.explorationV56Data.exploredUniverses.push(mission.targetUid);
      }
    }
    mission.status = success ? "success" : "failed";
    mission.result = success ? "Thành công · " + discoveries.length + " khám phá" : "Thất bại";
    mission.discoveries = discoveries;
    window.explorationV56Data.completed.unshift(mission);
    window.explorationV56Data.missions = window.explorationV56Data.missions.filter(function(m) { return m.id !== mission.id; });
    if (window.explorationV56Data.discoveries.length > 100) window.explorationV56Data.discoveries.length = 100;
    if (window.explorationV56Data.completed.length > 50) window.explorationV56Data.completed.length = 50;

    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert((success ? "🔭" : "❌") + " Thám Hiểm " + mission.missionName + ": " + mission.result);
    }
    if (typeof window.hrs55RecordEvent === "function") {
      window.hrs55RecordEvent({ category: "exploration", icon: "🔭", title: "Thám Hiểm: " + mission.missionName, detail: mission.result, importance: 2 });
    }
    save();
  }

  window.exp56GetMissions = function() { return window.explorationV56Data.missions; };
  window.exp56GetDiscoveries = function(limit) { return window.explorationV56Data.discoveries.slice(0, limit || 30); };
  window.exp56GetStats = function() {
    return {
      points: window.explorationV56Data.explorationPoints,
      totalMissions: window.explorationV56Data.totalMissions,
      successMissions: window.explorationV56Data.completed.filter(function(m) { return m.status === "success"; }).length,
      discoveries: window.explorationV56Data.discoveries.length,
      exploredUniverses: window.explorationV56Data.exploredUniverses.length
    };
  };
  window.exp56GetJarvisReport = function() {
    var s = window.exp56GetStats();
    return "🔭 **Báo Cáo Khám Phá Đa Vũ Trụ**\n" +
      "📊 Điểm Khám Phá: " + s.points + "\n" +
      "🌌 Vũ Trụ Đã Khám Phá: " + s.exploredUniverses + "\n" +
      "✅ Nhiệm Vụ Thành Công: " + s.successMissions + "/" + s.totalMissions + "\n" +
      "💎 Phát Hiện: " + s.discoveries + " mục";
  };

  function explorationTick() {
    var yr = getYear();
    window.explorationV56Data.missions.forEach(function(m) {
      if (m.status === "active" && yr >= m.endYear) completeMission(m);
    });
    if (window.explorationV56Data.tick % 100 === 0) save();
    window.explorationV56Data.tick++;
  }

  window.universeExplorationV56Tick = function() { explorationTick(); };

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); window.universeExplorationV56Tick(); };
    save();
    console.log("[UniverseExplorationV56] 🔭 Khám Phá Vũ Trụ V56 — 4 loại nhiệm vụ · 8 loại phát hiện · " + window.explorationV56Data.explorationPoints + " điểm khám phá sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 9000); });
  } else { setTimeout(init, 9000); }
})();
