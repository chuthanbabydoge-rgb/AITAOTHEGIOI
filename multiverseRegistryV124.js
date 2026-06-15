(function() {
  "use strict";
  const SAVE_KEY = "cgv6_mv_registry_v124";

  window.mvRegistryV124Data = {
    universes: [],
    totalConnections: 0,
    lastSync: 0
  };

  var DEMO_UNIVERSES = [
    { universeId:"u_001", universeName:"Azureth — Thế Giới Băng Giá",    creatorId:"c_001", creatorName:"Creator Thanh Vân",  age:1200, population:2840000, civilizationCount:4,  worldSeed:"CGV6-ICE-0001", genre:"fantasy",     maturityTier:"Trưởng Thành", isPublic:true,  tags:["băng giá","ma thuật","đế quốc"], description:"Thế giới phủ đầy băng tuyết, nơi các pháp sư kiểm soát thời tiết." },
    { universeId:"u_002", universeName:"Draconia — Đất Của Rồng",         creatorId:"c_002", creatorName:"Creator Hỏa Long",   age:2100, population:1560000, civilizationCount:6,  worldSeed:"CGV6-DRG-0002", genre:"fantasy",     maturityTier:"Hùng Mạnh",    isPublic:true,  tags:["rồng","chiến tranh","anh hùng"], description:"Nơi rồng và người cùng tồn tại, 2100 năm chiến tranh huyền thoại." },
    { universeId:"u_003", universeName:"Sylvaria — Cánh Rừng Bất Tận",   creatorId:"c_003", creatorName:"Creator Mộc Thần",   age:650,  population:890000,  civilizationCount:3,  worldSeed:"CGV6-SYL-0003", genre:"fantasy",     maturityTier:"Phát Triển",   isPublic:true,  tags:["rừng","bộ lạc","thiên nhiên"], description:"Rừng nguyên sinh bao phủ 80% thế giới." },
    { universeId:"u_004", universeName:"Mechatopia — Thế Giới Cơ Học",   creatorId:"c_004", creatorName:"Creator Kim Loại",   age:400,  population:3200000, civilizationCount:5,  worldSeed:"CGV6-MCH-0004", genre:"scifi",       maturityTier:"Phát Triển",   isPublic:true,  tags:["công nghệ","cơ khí","thành phố"], description:"Cách mạng công nghiệp bùng nổ, máy móc thay thế pháp thuật." },
    { universeId:"u_005", universeName:"Abyssara — Vương Quốc Bóng Tối", creatorId:"c_005", creatorName:"Creator Hắc Ám",    age:3400, population:720000,  civilizationCount:8,  worldSeed:"CGV6-ABY-0005", genre:"mythology",   maturityTier:"Thần Thánh",   isPublic:true,  tags:["bóng tối","linh hồn","cổ đại"], description:"Thế giới cổ xưa nhất — 3400 năm lịch sử." },
    { universeId:"u_006", universeName:"Celestara — Thiên Giới Hạ Phàm", creatorId:"c_006", creatorName:"Creator Tiên Tử",   age:900,  population:1100000, civilizationCount:4,  worldSeed:"CGV6-CEL-0006", genre:"cultivation", maturityTier:"Hùng Mạnh",    isPublic:true,  tags:["thiên giới","tu luyện","siêu việt"], description:"Các tiên nhân tu luyện đắc đạo." },
    { universeId:"u_007", universeName:"Sandoria — Sa Mạc Vĩnh Cửu",    creatorId:"c_007", creatorName:"Creator Cát Bão",   age:1800, population:560000,  civilizationCount:3,  worldSeed:"CGV6-SND-0007", genre:"fantasy",     maturityTier:"Trưởng Thành", isPublic:false, tags:["sa mạc","thương mại","bí ẩn"], description:"Sa mạc bao phủ 90%, nhưng thương nhân xây đế chế thịnh vượng." },
    { universeId:"u_008", universeName:"Aquarion — Thế Giới Đại Dương",  creatorId:"c_008", creatorName:"Creator Hải Thần",  age:1500, population:1890000, civilizationCount:5,  worldSeed:"CGV6-AQU-0008", genre:"fantasy",     maturityTier:"Trưởng Thành", isPublic:true,  tags:["đại dương","hải quân","đảo quốc"], description:"90% bề mặt là biển, các đảo quốc tranh hùng bằng hải quân." }
  ];

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.mvRegistryV124Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.mvRegistryV124Data = JSON.parse(d);
    } catch(e) {}
  }

  function syncPlayerUniverse() {
    var w = window.world;
    if (!w || !w.name) return;
    var countries = window.countries;
    if (!Array.isArray(countries)) countries = (countries && typeof countries === "object") ? Object.values(countries) : [];
    var totalPop = countries.reduce(function(a, c) { return a + (c.population || 0); }, 0);
    var civCount = countries.length;
    var seed = (window.wdna62GetDNA && window.wdna62GetDNA()) ? window.wdna62GetDNA().dna : ("CGV6-PL-" + (window.year || 1));
    var godName = (window.avatarGodV71Data && window.avatarGodV71Data.godName) ? window.avatarGodV71Data.godName : "Bạn";

    var existing = window.mvRegistryV124Data.universes.find(function(u) { return u.universeId === "u_player"; });
    var entry = {
      universeId: "u_player",
      universeName: w.name,
      creatorId: "c_player",
      creatorName: godName,
      age: window.year || 1,
      population: totalPop,
      civilizationCount: civCount,
      worldSeed: seed,
      genre: w.genre || "custom",
      maturityTier: getMaturityTier(window.year || 1, totalPop),
      isPublic: true,
      isPlayer: true,
      tags: [w.genre || "custom", "player"],
      description: "Thế giới của bạn — " + civCount + " quốc gia · " + totalPop.toLocaleString() + " dân"
    };

    if (existing) {
      Object.assign(existing, entry);
    } else {
      window.mvRegistryV124Data.universes.unshift(entry);
    }
    save();
  }

  function getMaturityTier(age, pop) {
    var score = age * 2 + pop / 100000;
    if (score > 10000) return "Thần Thánh";
    if (score > 5000) return "Hùng Mạnh";
    if (score > 2000) return "Trưởng Thành";
    if (score > 500) return "Phát Triển";
    return "Phôi Thai";
  }

  window.mvr124GetAll = function() { return window.mvRegistryV124Data.universes; };
  window.mvr124GetPublic = function() {
    return window.mvRegistryV124Data.universes.filter(function(u) { return u.isPublic; });
  };
  window.mvr124GetFeatured = function() {
    return window.mvRegistryV124Data.universes.slice(0, 4);
  };
  window.mvr124GetById = function(id) {
    return window.mvRegistryV124Data.universes.find(function(u) { return u.universeId === id; });
  };
  window.mvr124GetPlayerUniverse = function() {
    return window.mvRegistryV124Data.universes.find(function(u) { return u.universeId === "u_player"; });
  };
  window.mvr124SyncPlayer = syncPlayerUniverse;
  window.mvr124GetMaturityTier = getMaturityTier;

  function init() {
    load();
    // Seed demo universes if empty
    if (!window.mvRegistryV124Data.universes.length) {
      window.mvRegistryV124Data.universes = DEMO_UNIVERSES.slice();
      save();
    } else {
      // Merge in any missing demos
      DEMO_UNIVERSES.forEach(function(demo) {
        if (!window.mvRegistryV124Data.universes.find(function(u) { return u.universeId === demo.universeId; })) {
          window.mvRegistryV124Data.universes.push(demo);
        }
      });
    }
    syncPlayerUniverse();
    // Hook gameTick to sync player universe every 50 ticks
    var _tick = 0;
    var _origTick = window.gameTick;
    window.gameTick = function() {
      if (_origTick) _origTick();
      _tick++;
      if (_tick % 50 === 0) syncPlayerUniverse();
    };
    console.log("[MultiverseRegistry V124] 🌌 Khởi động — " + window.mvRegistryV124Data.universes.length + " universe đã đăng ký.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 30100); });
  } else {
    setTimeout(init, 30100);
  }
})();
