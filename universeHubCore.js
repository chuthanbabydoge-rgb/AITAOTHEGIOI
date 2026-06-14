(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_hub_v73";

  window.universeHubV73Data = {
    worldDirectory: {
      myWorlds: [],
      featuredWorlds: [],
      connectedWorlds: []
    },
    creators: [],
    portals: [],
    multiverseEvents: [],
    rankings: [],
    universeMap: {
      clusters: [],
      connections: []
    },
    playerProfile: {
      creatorName: "",
      title: "Đấng Sáng Thế",
      worldCount: 0,
      totalPopulation: 0,
      civilizationScore: 0,
      joinedYear: 0,
      badges: []
    },
    following: [],
    visited: [],
    notifications: [],
    stats: {
      totalWorldsDiscovered: 0,
      totalPortalsOpened: 0,
      totalEventsJoined: 0,
      totalVisits: 0
    }
  };

  var DEMO_WORLDS = [
    { id: "w_001", name: "Azureth — Thế Giới Băng Giá", creator: "Creator Thanh Vân", population: 2840000, age: 1200, civScore: 8420, tags: ["băng giá","ma thuật","đế quốc"], featured: true, description: "Thế giới phủ đầy băng tuyết, nơi các pháp sư kiểm soát thời tiết và đế quốc băng thống trị 3 lục địa.", wars: 12, discoveries: 89, stability: 72 },
    { id: "w_002", name: "Draconia — Đất Của Rồng", creator: "Creator Hỏa Long", population: 1560000, age: 2100, civScore: 11200, tags: ["rồng","chiến tranh","anh hùng"], featured: true, description: "Nơi rồng và người cùng tồn tại, lịch sử 2100 năm chiến tranh và huyền thoại.", wars: 34, discoveries: 145, stability: 55 },
    { id: "w_003", name: "Sylvaria — Cánh Rừng Bất Tận", creator: "Creator Mộc Thần", population: 890000, age: 650, civScore: 5100, tags: ["rừng","bộ lạc","thiên nhiên"], featured: false, description: "Rừng nguyên sinh bao phủ 80% thế giới, các bộ lạc giao tiếp với cây cỏ.", wars: 4, discoveries: 67, stability: 88 },
    { id: "w_004", name: "Mechatopia — Thế Giới Cơ Học", creator: "Creator Kim Loại", population: 3200000, age: 400, civScore: 9800, tags: ["công nghệ","cơ khí","thành phố"], featured: true, description: "Cách mạng công nghiệp bùng nổ, máy móc thay thế pháp thuật, thành phố khổng lồ mọc lên khắp nơi.", wars: 8, discoveries: 210, stability: 65 },
    { id: "w_005", name: "Abyssara — Vương Quốc Bóng Tối", creator: "Creator Hắc Ám", population: 720000, age: 3400, civScore: 15600, tags: ["bóng tối","linh hồn","cổ đại"], featured: true, description: "Thế giới cổ xưa nhất — 3400 năm lịch sử, nơi ranh giới giữa sống và chết rất mong manh.", wars: 67, discoveries: 312, stability: 41 },
    { id: "w_006", name: "Celestara — Thiên Giới Hạ Phàm", creator: "Creator Tiên Tử", population: 1100000, age: 900, civScore: 7300, tags: ["thiên giới","tu luyện","siêu việt"], featured: false, description: "Các tiên nhân tu luyện đắc đạo, thiên giới và nhân giới đan xen phức tạp.", wars: 6, discoveries: 134, stability: 80 },
    { id: "w_007", name: "Sandoria — Sa Mạc Vĩnh Cửu", creator: "Creator Cát Bão", population: 560000, age: 1800, civScore: 6200, tags: ["sa mạc","thương mại","bí ẩn"], featured: false, description: "Sa mạc bao phủ 90% thế giới, nhưng các thương nhân đã xây dựng đế chế thịnh vượng từ đường thương lộ.", wars: 22, discoveries: 98, stability: 60 },
    { id: "w_008", name: "Aquarion — Thế Giới Đại Dương", creator: "Creator Hải Thần", population: 1890000, age: 1500, civScore: 9100, tags: ["đại dương","hải quân","đảo quốc"], featured: true, description: "90% bề mặt là biển, các đảo quốc tranh hùng bằng hải quân, cá kình và long tộc dưới đáy đại dương.", wars: 28, discoveries: 176, stability: 58 }
  ];

  var DEMO_CREATORS = [
    { id: "c_001", name: "Creator Thanh Vân", title: "Băng Pháp Tôn Sư", worlds: 3, totalPop: 4100000, civScore: 8420, reputation: "Legendary", badge: "🥇", online: true },
    { id: "c_002", name: "Creator Hỏa Long", title: "Rồng Tộc Tổ Sư", worlds: 1, totalPop: 1560000, civScore: 11200, reputation: "Legendary", badge: "🏆", online: false },
    { id: "c_003", name: "Creator Mộc Thần", title: "Lâm Thần Sứ Giả", worlds: 4, totalPop: 2340000, civScore: 5100, reputation: "Master", badge: "🌿", online: true },
    { id: "c_004", name: "Creator Kim Loại", title: "Công Nghệ Đại Thần", worlds: 2, totalPop: 5400000, civScore: 9800, reputation: "Legendary", badge: "⚙️", online: false },
    { id: "c_005", name: "Creator Hắc Ám", title: "Cổ Thần Bất Diệt", worlds: 1, totalPop: 720000, civScore: 15600, reputation: "Mythic", badge: "👑", online: false },
    { id: "c_006", name: "Creator Tiên Tử", title: "Thiên Tôn Đại Đế", worlds: 2, totalPop: 1900000, civScore: 7300, reputation: "Elite", badge: "✨", online: true },
    { id: "c_007", name: "Creator Cát Bão", title: "Sa Mạc Thần Vương", worlds: 1, totalPop: 560000, civScore: 6200, reputation: "Master", badge: "🌵", online: false },
    { id: "c_008", name: "Creator Hải Thần", title: "Đại Dương Chi Chúa", worlds: 3, totalPop: 4200000, civScore: 9100, reputation: "Legendary", badge: "🌊", online: true }
  ];

  var DEMO_EVENTS = [
    { id: "ev_001", name: "🌋 Thiên Tai Liên Thế Giới", type: "cross_world", status: "active", desc: "Núi lửa phun trào đồng loạt tại 5 thế giới — các Creator cùng ứng phó", reward: "⭐×500 + Badge Ứng Phó Thiên Tai", endsIn: "2 ngày" },
    { id: "ev_002", name: "🏆 Giải Vô Địch Civilization", type: "platform", status: "upcoming", desc: "So sánh văn minh giữa các thế giới — ai có CivScore cao nhất?", reward: "👑 Badge Văn Minh Tối Thượng", endsIn: "5 ngày" },
    { id: "ev_003", name: "🤝 Tuần Lễ Ngoại Giao", type: "community", status: "active", desc: "Mở 10 portal trong tuần — nhận danh hiệu Đại Sứ Đa Vũ Trụ", reward: "🌟×1000 + Danh Hiệu Đặc Biệt", endsIn: "4 ngày" },
    { id: "ev_004", name: "📜 Cuộc Thi Sử Ký", type: "community", status: "upcoming", desc: "Tạo chapter sử ký bằng Claude AI — được cộng đồng bình chọn", reward: "✍️ Danh Hiệu Sử Gia Vĩ Đại", endsIn: "7 ngày" }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.universeHubV73Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) {
        const p = JSON.parse(d);
        window.universeHubV73Data = Object.assign(window.universeHubV73Data, p);
      }
    } catch(e) {}
  }

  function buildPlayerProfile() {
    var countries = window.countries;
    if (!Array.isArray(countries)) countries = (countries && typeof countries === "object") ? Object.values(countries) : [];
    var npcs = window.npcs;
    if (!Array.isArray(npcs)) npcs = (npcs && typeof npcs === "object") ? Object.values(npcs) : [];
    var totalPop = countries.reduce(function(acc, c) { return acc + (c.population || 0); }, 0);
    var numWars = (window.warsActive && Array.isArray(window.warsActive)) ? window.warsActive.length : 0;
    var year = window.year || 1;
    var civScore = Math.round(
      totalPop / 1000 * 0.4 +
      year * 2 +
      npcs.length * 10 +
      countries.length * 50 +
      (window.htData && window.htData.events ? window.htData.events.length * 5 : 0)
    );
    var godName = (window.avatarGodV71Data && window.avatarGodV71Data.godName) ? window.avatarGodV71Data.godName : "Creator";
    window.universeHubV73Data.playerProfile = {
      creatorName: godName,
      title: (window.avatarGodV71Data && window.avatarGodV71Data.godTitle) ? window.avatarGodV71Data.godTitle : "Đấng Sáng Thế",
      worldCount: countries.length > 0 ? 1 : 0,
      totalPopulation: totalPop,
      civilizationScore: civScore,
      countryCount: countries.length,
      npcCount: npcs.length,
      worldAge: year,
      warCount: numWars,
      badges: []
    };
    save();
  }

  function buildRankings() {
    var profile = window.universeHubV73Data.playerProfile;
    var rankings = DEMO_CREATORS.map(function(c) {
      return { name: c.name, title: c.title, badge: c.badge, civScore: c.civScore, worlds: c.worlds, totalPop: c.totalPop, reputation: c.reputation, isPlayer: false };
    });
    rankings.push({ name: profile.creatorName + " (Bạn)", title: profile.title, badge: "⭐", civScore: profile.civilizationScore, worlds: profile.worldCount, totalPop: profile.totalPopulation, reputation: "Active", isPlayer: true });
    rankings.sort(function(a, b) { return b.civScore - a.civScore; });
    window.universeHubV73Data.rankings = rankings;
  }

  window.uhub73GetWorlds = function() { return DEMO_WORLDS; };
  window.uhub73GetCreators = function() { return DEMO_CREATORS; };
  window.uhub73GetEvents = function() { return DEMO_EVENTS; };
  window.uhub73GetRankings = function() { buildRankings(); return window.universeHubV73Data.rankings; };
  window.uhub73GetProfile = function() { return window.universeHubV73Data.playerProfile; };
  window.uhub73GetData = function() { return window.universeHubV73Data; };
  window.uhub73GetStats = function() { return window.universeHubV73Data.stats; };

  window.uhub73OpenPortal = function(worldId) {
    var world = DEMO_WORLDS.find(function(w) { return w.id === worldId; });
    if (!world) return null;
    var existing = window.universeHubV73Data.portals.find(function(p) { return p.worldId === worldId; });
    if (existing) { existing.status = "open"; existing.lastVisit = window.year || 0; save(); return existing; }
    var portal = { id: "p_" + Date.now(), worldId, worldName: world.name, status: "open", openedYear: window.year || 0, lastVisit: window.year || 0, visits: 0 };
    window.universeHubV73Data.portals.push(portal);
    window.universeHubV73Data.stats.totalPortalsOpened++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 0, type: "portal", title: "Mở Portal đến " + world.name, color: "#8b5cf6" });
    }
    save();
    return portal;
  };

  window.uhub73VisitWorld = function(worldId) {
    var world = DEMO_WORLDS.find(function(w) { return w.id === worldId; });
    if (!world) return null;
    var portal = window.universeHubV73Data.portals.find(function(p) { return p.worldId === worldId; });
    if (portal) { portal.visits++; portal.lastVisit = window.year || 0; }
    if (!window.universeHubV73Data.visited.includes(worldId)) {
      window.universeHubV73Data.visited.push(worldId);
      window.universeHubV73Data.stats.totalWorldsDiscovered++;
      window.universeHubV73Data.stats.totalVisits++;
    } else {
      window.universeHubV73Data.stats.totalVisits++;
    }
    save();
    return world;
  };

  window.uhub73FollowWorld = function(worldId) {
    if (!window.universeHubV73Data.following.includes(worldId)) {
      window.universeHubV73Data.following.push(worldId);
      save();
      return true;
    }
    return false;
  };

  window.uhub73UnfollowWorld = function(worldId) {
    window.universeHubV73Data.following = window.universeHubV73Data.following.filter(function(id) { return id !== worldId; });
    save();
  };

  window.uhub73JoinEvent = function(eventId) {
    var ev = DEMO_EVENTS.find(function(e) { return e.id === eventId; });
    if (!ev) return null;
    window.universeHubV73Data.stats.totalEventsJoined++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 0, type: "event", title: "Tham gia sự kiện: " + ev.name, color: "#f59e0b" });
    }
    save();
    return ev;
  };

  window.uhub73BuildUniverseMap = function() {
    var worlds = DEMO_WORLDS;
    var clusters = [
      { id: "cl_1", name: "Cụm Thiên Hà Alpha", color: "#8b5cf6", worlds: ["w_001","w_002","w_003"] },
      { id: "cl_2", name: "Cụm Thiên Hà Beta",  color: "#3b82f6", worlds: ["w_004","w_005"] },
      { id: "cl_3", name: "Cụm Thiên Hà Gamma", color: "#10b981", worlds: ["w_006","w_007","w_008"] }
    ];
    var connections = [
      { from: "w_001", to: "w_002", type: "portal",  strength: 8 },
      { from: "w_002", to: "w_003", type: "alliance", strength: 5 },
      { from: "w_004", to: "w_005", type: "portal",  strength: 10 },
      { from: "w_006", to: "w_007", type: "trade",   strength: 6 },
      { from: "w_007", to: "w_008", type: "portal",  strength: 7 },
      { from: "w_001", to: "w_006", type: "alliance", strength: 4 }
    ];
    window.universeHubV73Data.universeMap = { clusters, connections };
    return { clusters, connections };
  };

  window.UHUB73_DEMO_WORLDS = DEMO_WORLDS;
  window.UHUB73_DEMO_CREATORS = DEMO_CREATORS;
  window.UHUB73_DEMO_EVENTS = DEMO_EVENTS;

  function init() {
    load();
    buildPlayerProfile();
    buildRankings();
    window.uhub73BuildUniverseMap();
    console.log("[Universe Hub Core V73] 🌌 Khởi động — " + DEMO_WORLDS.length + " thế giới · " + DEMO_CREATORS.length + " Creators · " + DEMO_EVENTS.length + " sự kiện");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 17800); });
  } else {
    setTimeout(init, 17800);
  }
})();
