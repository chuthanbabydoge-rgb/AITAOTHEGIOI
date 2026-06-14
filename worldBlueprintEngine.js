(function() {
  "use strict";
  const SAVE_KEY = "cgv6_world_blueprints_v74";

  var BLUEPRINT_TYPES = [
    { id: "world",   icon: "🌍", name: "Thế Giới",   desc: "Xuất toàn bộ thế giới thành blueprint" },
    { id: "country", icon: "🏰", name: "Quốc Gia",   desc: "Xuất một quốc gia thành blueprint" },
    { id: "race",    icon: "🧬", name: "Chủng Tộc",  desc: "Xuất chủng tộc thành blueprint" }
  ];

  var DEMO_BLUEPRINTS = [
    { id: "bp001", type: "world", name: "Blueprint: Azureth — Băng Hà", creator: "Creator Thanh Vân", code: "CGV6-BP-AZR001", icon: "🌍", desc: "Blueprint thế giới băng giá hoàn chỉnh — 3 lục địa, 8 vương quốc, hệ pháp thuật băng.", tags: ["băng","pháp sư","hoàn chỉnh"], civScore: 8420, population: 2840000, age: 1200, version: 1, imports: 89, rating: 4.7, isPublic: true, createdYear: 100, worldData: { type: "fantasy", scale: "Large", chaos: "Balanced", continents: 3, kingdoms: 8, specialFeature: "Ice Magic System" } },
    { id: "bp002", type: "world", name: "Blueprint: Draconia — Đất Rồng", creator: "Creator Hỏa Long", code: "CGV6-BP-DRC002", icon: "🌍", desc: "Blueprint thế giới rồng — 1 siêu lục địa, 34 cuộc chiến tranh trong lịch sử, hệ thống anh hùng.", tags: ["rồng","anh hùng","chiến tranh"], civScore: 11200, population: 1560000, age: 2100, version: 2, imports: 167, rating: 4.9, isPublic: true, createdYear: 80, worldData: { type: "fantasy", scale: "Medium", chaos: "Chaotic", continents: 1, kingdoms: 12, specialFeature: "Dragon-Hero Alliance System" } },
    { id: "bp003", type: "country", name: "Đế Quốc Thủy Tinh — Aquarion", creator: "Creator Hải Thần", code: "CGV6-BP-AQU003", icon: "🏰", desc: "Đế quốc đảo quốc nổi tiếng nhất Aquarion — hải quân 500 tàu, cảng thương mại số 1.", tags: ["hải quân","đảo quốc","thương mại"], civScore: 9100, population: 450000, age: 800, version: 1, imports: 45, rating: 4.5, isPublic: true, createdYear: 200, worldData: { type: "naval", scale: "Small", chaos: "Balanced", continents: 1, kingdoms: 1, specialFeature: "Naval Supremacy" } },
    { id: "bp004", type: "race", name: "Long Tộc Bất Diệt", creator: "Creator Hắc Ám", code: "CGV6-BP-LTD004", icon: "🧬", desc: "Chủng tộc long tộc bất tử từ Abyssara — 8 biến thể, khả năng tái sinh sau chết.", tags: ["bất tử","cổ đại","long tộc"], civScore: 15600, population: 120000, age: 3400, version: 3, imports: 234, rating: 5.0, isPublic: true, createdYear: 50, worldData: { type: "dark", scale: "Small", chaos: "Extreme", continents: 0, kingdoms: 1, specialFeature: "Undead Dragon Revival" } }
  ];

  window.worldBlueprintV74Data = {
    myBlueprints: [],
    importedBlueprints: [],
    stats: {
      totalExported: 0,
      totalImported: 0,
      totalShared: 0
    },
    version: "V74"
  };

  window.BLUEPRINT74_TYPES = BLUEPRINT_TYPES;
  window.BLUEPRINT74_DEMOS = DEMO_BLUEPRINTS;

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.worldBlueprintV74Data)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) Object.assign(window.worldBlueprintV74Data, JSON.parse(d));
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 1; }

  function generateCode(prefix) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return "CGV6-BP-" + (prefix || "X") + code;
  }

  window.wbp74ExportWorld = function() {
    if (!window.world || !window.world.name) return { ok: false, msg: "Chưa có thế giới để xuất! Hãy tạo thế giới trước." };
    var countries = Array.isArray(window.countries) ? window.countries : [];
    var bp = {
      id: "wbp_" + Date.now(),
      type: "world",
      name: "Blueprint: " + window.world.name,
      creator: (window.creatorAssetV74Data && window.creatorAssetV74Data.creatorName) || "Bạn",
      code: generateCode("W"),
      icon: "🌍",
      desc: "Blueprint thế giới " + window.world.name + " — Năm " + getYear() + " · " + countries.length + " quốc gia.",
      tags: [window.world.genre || "custom"],
      civScore: window.world.civScore || 0,
      population: window.world.totalPopulation || 0,
      age: getYear(),
      version: 1,
      imports: 0,
      rating: 0,
      isPublic: false,
      createdYear: getYear(),
      worldData: {
        name: window.world.name,
        type: window.world.genre || "custom",
        scale: countries.length > 30 ? "Large" : countries.length > 15 ? "Medium" : "Small",
        chaos: "Balanced",
        continents: (window.continentEngine && window.continentEngine.continents) ? window.continentEngine.continents.length : 1,
        kingdoms: Array.isArray(window.kingdomData && window.kingdomData.kingdoms) ? window.kingdomData.kingdoms.length : (typeof window.kingdomData === "object" ? Object.keys(window.kingdomData.kingdoms || {}).length : 0),
        countries: countries.length,
        year: getYear(),
        dna: (window.wdna62GenerateDNA && window.worldDNAV62Data) ? window.worldDNAV62Data.currentDNA : null
      }
    };
    window.worldBlueprintV74Data.myBlueprints.unshift(bp);
    window.worldBlueprintV74Data.stats.totalExported++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "blueprint", title: "🌍 Blueprint Xuất: " + window.world.name + " · Code: " + bp.code, color: "#8b5cf6" });
    }
    save();
    return { ok: true, blueprint: bp, msg: "🌍 Blueprint thế giới đã xuất!\n📋 Code chia sẻ: " + bp.code };
  };

  window.wbp74ExportCountry = function(countryIndex) {
    var countries = Array.isArray(window.countries) ? window.countries : [];
    var c = countries[countryIndex];
    if (!c) return { ok: false, msg: "Không tìm thấy quốc gia" };
    var bp = {
      id: "wbp_" + Date.now(),
      type: "country",
      name: "Blueprint: " + c.name,
      creator: (window.creatorAssetV74Data && window.creatorAssetV74Data.creatorName) || "Bạn",
      code: generateCode("C"),
      icon: "🏰",
      desc: "Blueprint quốc gia " + c.name + " — Dân số " + (c.population || 0) + " · " + (c.government || "Quân Chủ") + ".",
      tags: [c.government || "quân chủ"],
      civScore: c.power || 0,
      population: c.population || 0,
      age: getYear(),
      version: 1,
      imports: 0,
      rating: 0,
      isPublic: false,
      createdYear: getYear(),
      worldData: {
        name: c.name,
        government: c.government || "Quân Chủ",
        population: c.population || 0,
        power: c.power || 0,
        stability: c.stability || 50,
        religion: c.religion || "Không rõ",
        year: getYear()
      }
    };
    window.worldBlueprintV74Data.myBlueprints.unshift(bp);
    window.worldBlueprintV74Data.stats.totalExported++;
    save();
    return { ok: true, blueprint: bp, msg: "🏰 Blueprint " + c.name + " đã xuất!\n📋 Code: " + bp.code };
  };

  window.wbp74ImportBlueprint = function(bpId) {
    var all = DEMO_BLUEPRINTS.concat(window.worldBlueprintV74Data.myBlueprints);
    var bp = all.find(function(b) { return b.id === bpId; });
    if (!bp) return { ok: false, msg: "Không tìm thấy blueprint" };
    var already = window.worldBlueprintV74Data.importedBlueprints.some(function(b) { return b.sourceId === bpId; });
    if (already) return { ok: false, msg: "Blueprint này đã được import!" };
    var imported = Object.assign({}, bp, {
      id: "bpimp_" + Date.now(),
      sourceId: bpId,
      importedYear: getYear(),
      isImported: true
    });
    window.worldBlueprintV74Data.importedBlueprints.unshift(imported);
    window.worldBlueprintV74Data.stats.totalImported++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "blueprint", title: "📥 Import Blueprint: " + bp.name + " · " + bp.code, color: "#10b981" });
    }
    save();
    return { ok: true, blueprint: imported, msg: "📥 Đã import Blueprint " + bp.name + "!" };
  };

  window.wbp74ShareBlueprint = function(bpId) {
    var bp = window.worldBlueprintV74Data.myBlueprints.find(function(b) { return b.id === bpId; });
    if (!bp) return { ok: false, msg: "Blueprint không tồn tại trong kho của bạn" };
    bp.isPublic = true;
    window.worldBlueprintV74Data.stats.totalShared++;
    save();
    return { ok: true, msg: "✅ Blueprint đã chia sẻ công khai!\nCode: " + bp.code };
  };

  window.wbp74GetAll      = function() { return DEMO_BLUEPRINTS.concat(window.worldBlueprintV74Data.myBlueprints); };
  window.wbp74GetMine     = function() { return window.worldBlueprintV74Data.myBlueprints; };
  window.wbp74GetImported = function() { return window.worldBlueprintV74Data.importedBlueprints; };
  window.wbp74GetDemos    = function() { return DEMO_BLUEPRINTS; };
  window.wbp74GetStats    = function() { return window.worldBlueprintV74Data.stats; };
  window.wbp74GetTypes    = function() { return BLUEPRINT_TYPES; };

  function init() {
    load();
    console.log("[WorldBlueprintEngine V74] 📐 Hệ Thống Blueprint Thế Giới khởi động — " + DEMO_BLUEPRINTS.length + " demo blueprints · " + window.worldBlueprintV74Data.myBlueprints.length + " blueprints của bạn sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18200); });
  } else { setTimeout(init, 18200); }
})();
