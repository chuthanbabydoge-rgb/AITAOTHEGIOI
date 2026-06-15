(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mv_rankings_v124";

  window.mvRankingsV124Data = {
    rankings: { oldest: [], largestPop: [], mostAdvanced: [], mostInfluential: [] },
    creatorProfiles: [],
    lastBuilt: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvRankingsV124Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.mvRankingsV124Data = JSON.parse(d);
    } catch(e) {}
  }

  window.mvrank124Build = function() {
    var universes = window.mvr124GetAll ? window.mvr124GetAll() : [];
    if (!universes.length) return;

    window.mvRankingsV124Data.rankings.oldest = universes
      .slice().sort(function(a, b) { return b.age - a.age; })
      .slice(0, 5)
      .map(function(u, i) { return { rank: i + 1, id: u.universeId, name: u.universeName, value: u.age + " năm", raw: u.age, creator: u.creatorName, isPlayer: !!u.isPlayer }; });

    window.mvRankingsV124Data.rankings.largestPop = universes
      .slice().sort(function(a, b) { return b.population - a.population; })
      .slice(0, 5)
      .map(function(u, i) { return { rank: i + 1, id: u.universeId, name: u.universeName, value: (u.population || 0).toLocaleString() + " dân", raw: u.population, creator: u.creatorName, isPlayer: !!u.isPlayer }; });

    window.mvRankingsV124Data.rankings.mostAdvanced = universes
      .slice().sort(function(a, b) {
        var scoreA = (a.civilizationCount || 0) * 1000 + (a.age || 0) * 2;
        var scoreB = (b.civilizationCount || 0) * 1000 + (b.age || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(function(u, i) {
        var score = (u.civilizationCount || 0) * 1000 + (u.age || 0) * 2;
        return { rank: i + 1, id: u.universeId, name: u.universeName, value: score + " điểm · " + u.civilizationCount + " civ", raw: score, creator: u.creatorName, isPlayer: !!u.isPlayer };
      });

    // Influential Creator: group universes by creatorId, count total pop + civs
    var creatorMap = {};
    universes.forEach(function(u) {
      if (!creatorMap[u.creatorId]) {
        creatorMap[u.creatorId] = { creatorId: u.creatorId, creatorName: u.creatorName, universeCount: 0, totalPop: 0, totalCiv: 0, oldestAge: 0 };
      }
      creatorMap[u.creatorId].universeCount++;
      creatorMap[u.creatorId].totalPop += (u.population || 0);
      creatorMap[u.creatorId].totalCiv += (u.civilizationCount || 0);
      if ((u.age || 0) > creatorMap[u.creatorId].oldestAge) creatorMap[u.creatorId].oldestAge = u.age || 0;
    });
    var creators = Object.values(creatorMap);
    creators.sort(function(a, b) {
      var scoreA = a.universeCount * 500 + a.totalCiv * 100 + a.totalPop / 10000;
      var scoreB = b.universeCount * 500 + b.totalCiv * 100 + b.totalPop / 10000;
      return scoreB - scoreA;
    });
    window.mvRankingsV124Data.rankings.mostInfluential = creators.slice(0, 5).map(function(c, i) {
      return { rank: i + 1, creatorId: c.creatorId, name: c.creatorName, value: c.universeCount + " universe · " + c.totalCiv + " civ", raw: c.universeCount, isPlayer: c.creatorId === "c_player" };
    });
    window.mvRankingsV124Data.creatorProfiles = creators;
    window.mvRankingsV124Data.lastBuilt = Date.now();
    save();
  };

  window.mvrank124GetTop = function(category) {
    window.mvrank124Build();
    return window.mvRankingsV124Data.rankings[category] || [];
  };

  window.mvrank124GetCreatorProfile = function(creatorId) {
    return window.mvRankingsV124Data.creatorProfiles.find(function(c) { return c.creatorId === creatorId; });
  };

  window.mvrank124GetAllCreators = function() { return window.mvRankingsV124Data.creatorProfiles; };

  window.mvrank124JarvisQuery = function(question) {
    window.mvrank124Build();
    var universes = window.mvr124GetAll ? window.mvr124GetAll() : [];
    var q = (question || "").toLowerCase();
    var ans = "";

    if (q.indexOf("lớn nhất") !== -1 || q.indexOf("dân") !== -1 || q.indexOf("largest") !== -1) {
      var top = window.mvRankingsV124Data.rankings.largestPop[0];
      ans = top ? "🌍 Universe lớn nhất về dân số là **" + top.name + "** với " + top.value + " (Creator: " + top.creator + ")." : "Chưa có dữ liệu.";
    } else if (q.indexOf("già nhất") !== -1 || q.indexOf("cổ nhất") !== -1 || q.indexOf("oldest") !== -1) {
      var top2 = window.mvRankingsV124Data.rankings.oldest[0];
      ans = top2 ? "⏰ Universe cổ nhất là **" + top2.name + "** với " + top2.value + " tồn tại (Creator: " + top2.creator + ")." : "Chưa có dữ liệu.";
    } else if (q.indexOf("văn minh") !== -1 || q.indexOf("phát triển") !== -1 || q.indexOf("advanced") !== -1) {
      var top3 = window.mvRankingsV124Data.rankings.mostAdvanced[0];
      ans = top3 ? "🏛️ Universe phát triển nhất là **" + top3.name + "** — " + top3.value + " (Creator: " + top3.creator + ")." : "Chưa có dữ liệu.";
    } else if (q.indexOf("creator") !== -1 || q.indexOf("ảnh hưởng") !== -1 || q.indexOf("influential") !== -1) {
      var top4 = window.mvRankingsV124Data.rankings.mostInfluential[0];
      ans = top4 ? "👑 Creator ảnh hưởng nhất là **" + top4.name + "** với " + top4.value + "." : "Chưa có dữ liệu.";
    } else if (q.indexOf("portal") !== -1 || q.indexOf("kết nối") !== -1) {
      var portals = window.mpe124GetPortals ? window.mpe124GetPortals() : [];
      ans = "🌀 Hiện có **" + portals.length + " portals** trong Multiverse. " + portals.filter(function(p) { return p.status === "open"; }).length + " đang mở.";
    } else if (q.indexOf("tổng") !== -1 || q.indexOf("bao nhiêu") !== -1 || q.indexOf("total") !== -1) {
      ans = "🌌 Multiverse hiện có **" + universes.length + " universes** · " + window.mvRankingsV124Data.creatorProfiles.length + " Creators · " + (window.mpe124GetTotalConnections ? window.mpe124GetTotalConnections() : 0) + " portals.";
    } else {
      ans = "🤖 Jarvis Multiverse Mode: Tôi có thể trả lời về universe lớn nhất, già nhất, phát triển nhất, creator ảnh hưởng nhất, tổng số portals. Hãy hỏi cụ thể hơn!";
    }
    return ans;
  };

  function init() {
    load();
    setTimeout(function() {
      window.mvrank124Build();
    }, 2000);
    console.log("[MultiverseRankings V124] 📊 Rankings Engine khởi động — 4 bảng xếp hạng · Creator Profiles · Jarvis Multiverse Mode sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30400); });
  } else {
    setTimeout(init, 30400);
  }
})();
