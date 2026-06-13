(function() {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYER CIVILIZATION CORE V58
  // Nền Văn Minh Người Chơi · Thành Lập · Chủng Tộc · Văn Hóa · AI Tương Tác
  // KHÔNG trùng: emergentCivilization.js (world-level) · livingCivilizationAI.js (NPC AI)
  //              civEvolutionEngineV38.js (AI civ evolution) — đây là PLAYER-FACING
  // ═══════════════════════════════════════════════════════════════════════════

  const SAVE_KEY = "cgv6_player_civ_core_v58";
  const INIT_DELAY = 10200;
  const TICK_INTERVAL = 10;

  const RACES = [
    { id:"human",    name:"Người",      icon:"🧑", bonus:"diplomacy" },
    { id:"cultivator",name:"Tu Sĩ",    icon:"🧘", bonus:"cultivation" },
    { id:"warrior",  name:"Chiến Binh", icon:"⚔️", bonus:"military" },
    { id:"scholar",  name:"Học Giả",    icon:"📚", bonus:"science" },
    { id:"merchant", name:"Thương Nhân",icon:"💰", bonus:"economy" },
    { id:"divine",   name:"Thiên Tộc",  icon:"✨", bonus:"religion" },
    { id:"demon",    name:"Ma Tộc",     icon:"😈", bonus:"power" },
    { id:"beast",    name:"Thú Tộc",    icon:"🐉", bonus:"strength" }
  ];

  const CULTURES = [
    { id:"eastern",   name:"Đông Phương",  icon:"🏮", desc:"Thiền học, tôn ti, nghệ thuật trà đạo" },
    { id:"western",   name:"Tây Phương",   icon:"🏰", desc:"Hiệp sĩ, huy chương, danh dự chiến trường" },
    { id:"nomadic",   name:"Du Mục",       icon:"🐎", desc:"Tự do, di chuyển, chinh phạt thảo nguyên" },
    { id:"maritime",  name:"Hàng Hải",     icon:"⛵", desc:"Buôn bán biển, thám hiểm, thương cảng" },
    { id:"mystical",  name:"Huyền Bí",     icon:"🔮", desc:"Phép thuật, tiên tri, bí ẩn cổ đại" },
    { id:"imperial",  name:"Đế Quốc",      icon:"👑", desc:"Uy quyền, trật tự, quy mô vĩ đại" },
    { id:"scholarly", name:"Học Viện",     icon:"🎓", desc:"Trí tuệ, phát minh, tri thức vạn vật" },
    { id:"divine",    name:"Thần Đạo",     icon:"⛩️", desc:"Thờ phụng, nghi lễ, phụng sự thần linh" }
  ];

  const AI_INTERACT_TYPES = [
    { id:"learn",      name:"Học Hỏi",    icon:"📖", desc:"AI học văn hóa từ văn minh người chơi" },
    { id:"assimilate", name:"Đồng Hóa",   icon:"🌊", desc:"AI hấp thụ hoàn toàn vào văn minh người chơi" },
    { id:"alliance",   name:"Liên Minh",  icon:"🤝", desc:"Hợp tác chiến lược dài hạn" },
    { id:"conflict",   name:"Xung Đột",   icon:"⚔️", desc:"Va chạm văn hóa / tranh giành ảnh hưởng" }
  ];

  window.playerCivData = {
    founded: false,
    name: "",
    symbol: "🏛",
    motto: "",
    mainRace: "",
    mainCulture: "",
    foundingYear: 0,
    foundingStory: "",
    population: 0,
    territory: 0,
    prestige: 0,
    power: 0,
    aiRelations: [],
    tickCount: 0
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.playerCivData)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.playerCivData = Object.assign(window.playerCivData, JSON.parse(d));
    } catch(e) {}
  }

  // ─── PUBLIC API ────────────────────────────────────────────────

  window.pc58FoundCivilization = function(name, symbol, motto, raceId, cultureId) {
    if (!name || !name.trim()) return { ok: false, msg: "Tên văn minh không được để trống." };
    if (window.playerCivData.founded) return { ok: false, msg: "Đã thành lập văn minh rồi." };

    var race = RACES.find(function(r){ return r.id === raceId; }) || RACES[0];
    var culture = CULTURES.find(function(c){ return c.id === cultureId; }) || CULTURES[0];
    var year = window.year || 1;

    window.playerCivData.founded = true;
    window.playerCivData.name = name.trim();
    window.playerCivData.symbol = symbol || "🏛";
    window.playerCivData.motto = motto || "Trường Tồn Cùng Thế Giới";
    window.playerCivData.mainRace = race.id;
    window.playerCivData.mainCulture = culture.id;
    window.playerCivData.foundingYear = year;
    window.playerCivData.population = 1000;
    window.playerCivData.territory = 1;
    window.playerCivData.prestige = 10;
    window.playerCivData.power = 10;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: year, type: "civilization", title: "🏛 Khai Quốc: " + name, color: "#facc15" });
    }
    if (typeof window.ch58RecordEvent === "function") {
      window.ch58RecordEvent("founding", "Khai Quốc " + name, "Nền văn minh " + name + " (" + race.name + " · " + culture.name + ") chính thức được thành lập vào năm " + year + ".", 100);
    }
    if (typeof window.wmeAddMemory === "function") {
      window.wmeAddMemory({ year: year, category: "civilization", title: "🏛 " + name + " khai quốc", content: "Chủng tộc: " + race.name + " · Văn hóa: " + culture.name + " · Khẩu hiệu: " + (motto || "Trường Tồn Cùng Thế Giới") });
    }

    save();
    return { ok: true, msg: "✅ Thành lập " + name + " thành công! Năm " + year + " — " + race.name + " · " + culture.name };
  };

  window.pc58SetFoundingStory = function(story) {
    window.playerCivData.foundingStory = story || "";
    save();
    return { ok: true, msg: "Lịch sử thành lập đã được ghi lại." };
  };

  window.pc58InteractWithAI = function(entityName, interactType) {
    if (!window.playerCivData.founded) return { ok: false, msg: "Chưa thành lập văn minh." };
    var t = AI_INTERACT_TYPES.find(function(x){ return x.id === interactType; });
    if (!t) return { ok: false, msg: "Loại tương tác không hợp lệ." };

    var existing = window.playerCivData.aiRelations.find(function(r){ return r.entity === entityName; });
    if (existing) {
      existing.type = interactType;
      existing.year = window.year || 1;
    } else {
      window.playerCivData.aiRelations.push({
        entity: entityName,
        type: interactType,
        year: window.year || 1
      });
    }

    var infDelta = interactType === "assimilate" ? 15 : interactType === "alliance" ? 10 : interactType === "learn" ? 5 : -5;
    if (typeof window.ch58UpdateInfluence === "function") window.ch58UpdateInfluence("cultural", infDelta);
    if (typeof window.ch58RecordEvent === "function") {
      window.ch58RecordEvent("ai_interact", t.icon + " " + t.name + ": " + entityName,
        "Văn minh " + window.playerCivData.name + " " + t.name.toLowerCase() + " với " + entityName, infDelta);
    }

    window.playerCivData.prestige = Math.min(100, window.playerCivData.prestige + (interactType === "conflict" ? -2 : 3));
    save();
    return { ok: true, msg: "✅ " + t.icon + " " + t.name + " với " + entityName + " thành công!" };
  };

  window.pc58GetStats = function() {
    return JSON.parse(JSON.stringify(window.playerCivData));
  };

  window.pc58GetRaces = function() { return RACES; };
  window.pc58GetCultures = function() { return CULTURES; };
  window.pc58GetInteractTypes = function() { return AI_INTERACT_TYPES; };

  window.pc58GetRaceName = function(id) {
    var r = RACES.find(function(x){ return x.id === id; });
    return r ? r.icon + " " + r.name : id;
  };
  window.pc58GetCultureName = function(id) {
    var c = CULTURES.find(function(x){ return x.id === id; });
    return c ? c.icon + " " + c.name : id;
  };

  window.pc58GetJarvisAnalysis = function() {
    var d = window.playerCivData;
    if (!d.founded) return { icon: "🤖", msg: "Chưa thành lập văn minh. Hãy đặt tên và chọn chủng tộc để bắt đầu." };
    var tips = [];
    if (d.prestige < 30) tips.push("Danh tiếng thấp — nên thực hiện giao thương hoặc liên minh với AI.");
    if (d.aiRelations.length === 0) tips.push("Chưa có quan hệ với AI — nên tương tác để mở rộng ảnh hưởng.");
    if (!d.foundingStory) tips.push("Chưa có lịch sử thành lập — hãy viết câu chuyện khai quốc.");
    if (d.territory < 5) tips.push("Lãnh thổ nhỏ — mở rộng bằng cách chinh phục hoặc đồng hóa.");
    var lawData = window.civLawData || {};
    if (!lawData.ideology) tips.push("Chưa có hệ tư tưởng — chọn ngay trong tab Luật & Tư Tưởng.");

    if (tips.length === 0) tips.push("Văn minh đang phát triển tốt. Tiếp tục mở rộng ảnh hưởng.");
    return { icon: "🤖", msg: tips[0], tips: tips };
  };

  // ─── TICK ────────────────────────────────────────────────────
  function tick() {
    if (!window.playerCivData.founded) return;
    window.playerCivData.tickCount++;
    if (window.playerCivData.tickCount % TICK_INTERVAL !== 0) return;

    var yr = window.year || 1;
    // Grow population slowly
    window.playerCivData.population = Math.floor(window.playerCivData.population * 1.002 + 5);
    // Gain prestige from world stability
    var worldStab = (window.world && window.world.stability) ? window.world.stability : 50;
    if (worldStab > 70) window.playerCivData.prestige = Math.min(100, window.playerCivData.prestige + 0.1);

    // Every 50 ticks, update influence from territory
    if (window.playerCivData.tickCount % 50 === 0) {
      if (typeof window.ch58UpdateInfluence === "function") {
        window.ch58UpdateInfluence("military", window.playerCivData.territory * 0.5);
      }
      save();
    }
  }

  // ─── INIT ────────────────────────────────────────────────────
  function init() {
    load();

    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      tick();
    };

    console.log("[PlayerCivCoreV58] 🏛 Nền Văn Minh Người Chơi V58 — " + RACES.length + " chủng tộc · " + CULTURES.length + " văn hóa · AI tương tác · Jarvis phân tích sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, INIT_DELAY); });
  } else {
    setTimeout(init, INIT_DELAY);
  }
})();
