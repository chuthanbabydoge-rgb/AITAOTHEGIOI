(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_assets_v74";

  const ASSET_TYPES = [
    { id: "race",         icon: "🧬", name: "Chủng Tộc",    desc: "Chủng tộc mới với văn hóa và ngôn ngữ riêng" },
    { id: "creature",     icon: "🐉", name: "Sinh Vật",     desc: "Sinh vật, quái vật, thần thú" },
    { id: "religion",     icon: "⛩️",  name: "Tôn Giáo",    desc: "Đức tin, thần học, nghi lễ" },
    { id: "technology",   icon: "⚙️",  name: "Công Nghệ",   desc: "Khoa học, phép thuật, phát minh" },
    { id: "civilization", icon: "🏛️",  name: "Văn Minh",    desc: "Nền văn minh hoàn chỉnh" },
    { id: "lore",         icon: "📜",  name: "Truyền Thuyết", desc: "Huyền thoại, lịch sử, tiên tri" }
  ];

  const RARITY = [
    { id: "common",    name: "Phổ Thông",  color: "#9ca3af", min: 0 },
    { id: "uncommon",  name: "Hiếm",       color: "#10b981", min: 20 },
    { id: "rare",      name: "Quý Hiếm",   color: "#3b82f6", min: 50 },
    { id: "epic",      name: "Sử Thi",     color: "#8b5cf6", min: 100 },
    { id: "legendary", name: "Huyền Thoại",color: "#f59e0b", min: 200 },
    { id: "mythic",    name: "Thần Thoại", color: "#ef4444", min: 500 }
  ];

  var DEMO_ASSETS = [
    { id: "a001", type: "race", name: "Long Tộc Băng Hà", creator: "Creator Thanh Vân", worldOrigin: "Azureth", icon: "🧬", tags: ["rồng","băng","pháp sư"], desc: "Chủng tộc lai giữa rồng và người, sống trên những đỉnh núi băng. Tuổi thọ 800 năm, có thể kiểm soát thời tiết.", stats: { power: 85, magic: 92, agility: 60, wisdom: 78 }, ratings: 4.8, imports: 312, isPublic: true, isOfficial: true, rarity: "legendary", createdYear: 200, downloadCount: 1240 },
    { id: "a002", type: "creature", name: "Hỏa Long Sơn Thần", creator: "Creator Hỏa Long", worldOrigin: "Draconia", icon: "🐉", tags: ["rồng","lửa","boss"], desc: "Rồng lửa cổ đại 5000 tuổi, sải cánh 200m, có thể thiêu rụi cả thành phố trong 1 lần thở.", stats: { power: 98, magic: 75, agility: 55, wisdom: 45 }, ratings: 4.9, imports: 589, isPublic: true, isOfficial: true, rarity: "mythic", createdYear: 150, downloadCount: 2890 },
    { id: "a003", type: "lore", name: "Truyền Thuyết Cây Thế Giới", creator: "Creator Mộc Thần", worldOrigin: "Sylvaria", icon: "📜", tags: ["rừng","thần thoại","cổ thụ"], desc: "Cây Thế Giới Yggdrasil của Sylvaria — cây cổ thụ 10.000 năm tuổi kết nối mọi sinh linh trong rừng nguyên sinh.", stats: { power: 20, magic: 99, agility: 5, wisdom: 95 }, ratings: 4.7, imports: 201, isPublic: true, isOfficial: false, rarity: "epic", createdYear: 100, downloadCount: 876 },
    { id: "a004", type: "technology", name: "Động Cơ Thanh Long", creator: "Creator Kim Loại", worldOrigin: "Mechatopia", icon: "⚙️", tags: ["cơ khí","năng lượng","phát minh"], desc: "Động cơ hơi nước thế hệ 5 dùng tinh thể ma năng, công suất gấp 1000 lần động cơ thường.", stats: { power: 70, magic: 30, agility: 85, wisdom: 60 }, ratings: 4.5, imports: 445, isPublic: true, isOfficial: false, rarity: "rare", createdYear: 80, downloadCount: 1567 },
    { id: "a005", type: "civilization", name: "Đế Quốc Bóng Tối Abyssara", creator: "Creator Hắc Ám", worldOrigin: "Abyssara", icon: "🏛️", tags: ["bóng tối","linh hồn","cổ đại"], desc: "Đế quốc 3400 năm tuổi, nơi ranh giới sống chết mờ nhạt. Dân số 720K nhưng quân đội bất tử.", stats: { power: 95, magic: 90, agility: 65, wisdom: 88 }, ratings: 5.0, imports: 778, isPublic: true, isOfficial: true, rarity: "mythic", createdYear: 50, downloadCount: 3210 },
    { id: "a006", type: "religion", name: "Đạo Tiên Thiên", creator: "Creator Tiên Tử", worldOrigin: "Celestara", icon: "⛩️", tags: ["tu luyện","siêu việt","thiên giới"], desc: "Tôn giáo tu luyện 9 tầng — từ Luyện Khí đến Hóa Thần. Hơn 100.000 tín đồ trên 5 thế giới.", stats: { power: 40, magic: 95, agility: 50, wisdom: 99 }, ratings: 4.6, imports: 334, isPublic: true, isOfficial: false, rarity: "legendary", createdYear: 300, downloadCount: 1890 },
    { id: "a007", type: "race", name: "Cát Sa Nhân", creator: "Creator Cát Bão", worldOrigin: "Sandoria", icon: "🧬", tags: ["sa mạc","thương nhân","bí ẩn"], desc: "Chủng tộc người cát có thể hòa tan vào cát bụi, bất tử trong sa mạc. Thương nhân bẩm sinh.", stats: { power: 55, magic: 70, agility: 90, wisdom: 75 }, ratings: 4.3, imports: 156, isPublic: true, isOfficial: false, rarity: "epic", createdYear: 420, downloadCount: 678 },
    { id: "a008", type: "creature", name: "Long Cá Đại Dương", creator: "Creator Hải Thần", worldOrigin: "Aquarion", icon: "🐉", tags: ["đại dương","long tộc","hải chiến"], desc: "Long cá khổng lồ dài 500m sống dưới đáy đại dương, có thể tạo ra sóng thần.", stats: { power: 92, magic: 65, agility: 70, wisdom: 50 }, ratings: 4.7, imports: 423, isPublic: true, isOfficial: true, rarity: "mythic", createdYear: 600, downloadCount: 1980 }
  ];

  window.creatorAssetV74Data = {
    myAssets: [],
    importedAssets: [],
    publicMarket: [],
    stats: {
      totalCreated: 0,
      totalImported: 0,
      totalPublished: 0,
      totalRatings: 0
    },
    version: "V74"
  };

  window.ASSET74_TYPES   = ASSET_TYPES;
  window.ASSET74_RARITY  = RARITY;
  window.ASSET74_DEMOS   = DEMO_ASSETS;

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.creatorAssetV74Data)); } catch(e) {}
  }
  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) Object.assign(window.creatorAssetV74Data, JSON.parse(d));
    } catch(e) {}
  }

  function getYear() { return (typeof window.year === "number") ? window.year : 1; }

  function getRarity(importCount) {
    var r = RARITY.slice().reverse().find(function(r) { return importCount >= r.min; });
    return r || RARITY[0];
  }

  window.ca74CreateAsset = function(typeId, name, desc, tags, stats) {
    var atype = ASSET_TYPES.find(function(t) { return t.id === typeId; });
    if (!atype) return { ok: false, msg: "Loại asset không hợp lệ" };
    if (!name || name.trim().length < 2) return { ok: false, msg: "Tên asset quá ngắn" };
    var asset = {
      id: "my_" + Date.now(),
      type: typeId,
      name: name.trim(),
      desc: desc || "",
      tags: tags || [],
      stats: stats || { power: 50, magic: 50, agility: 50, wisdom: 50 },
      creator: (window.creatorAssetV74Data.creatorName || "Bạn"),
      worldOrigin: (window.world && window.world.name) || "Thế Giới Của Bạn",
      icon: atype.icon,
      ratings: 0,
      imports: 0,
      isPublic: false,
      rarity: "common",
      createdYear: getYear(),
      downloadCount: 0
    };
    window.creatorAssetV74Data.myAssets.unshift(asset);
    window.creatorAssetV74Data.stats.totalCreated++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "creator", title: atype.icon + " Asset Mới: " + name, color: "#8b5cf6" });
    }
    save();
    return { ok: true, asset: asset, msg: atype.icon + " " + name + " đã được tạo!" };
  };

  window.ca74PublishAsset = function(assetId) {
    var asset = window.creatorAssetV74Data.myAssets.find(function(a) { return a.id === assetId; });
    if (!asset) return { ok: false, msg: "Không tìm thấy asset" };
    asset.isPublic = true;
    window.creatorAssetV74Data.stats.totalPublished++;
    save();
    return { ok: true, msg: "✅ " + asset.name + " đã được công khai trên thị trường!" };
  };

  window.ca74ImportAsset = function(assetId) {
    var all = DEMO_ASSETS.concat(window.creatorAssetV74Data.publicMarket);
    var asset = all.find(function(a) { return a.id === assetId; });
    if (!asset) return { ok: false, msg: "Không tìm thấy asset" };
    var alreadyImported = window.creatorAssetV74Data.importedAssets.some(function(a) { return a.sourceId === assetId; });
    if (alreadyImported) return { ok: false, msg: "Asset này đã được import rồi!" };
    var imported = Object.assign({}, asset, {
      id: "imp_" + Date.now(),
      sourceId: assetId,
      importedYear: getYear(),
      isImported: true
    });
    window.creatorAssetV74Data.importedAssets.unshift(imported);
    window.creatorAssetV74Data.stats.totalImported++;
    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: getYear(), type: "import", title: "📥 Đã Import: " + asset.name + " từ " + asset.worldOrigin, color: "#10b981" });
    }
    save();
    return { ok: true, asset: imported, msg: "📥 Đã import " + asset.name + " vào thế giới của bạn!" };
  };

  window.ca74RateAsset = function(assetId, score) {
    var all = DEMO_ASSETS.concat(window.creatorAssetV74Data.publicMarket);
    var asset = all.find(function(a) { return a.id === assetId; });
    if (!asset) return { ok: false, msg: "Không tìm thấy asset" };
    if (score < 1 || score > 5) return { ok: false, msg: "Điểm đánh giá phải từ 1-5" };
    asset.ratings = Math.round(((asset.ratings * (asset.downloadCount || 1)) + score) / ((asset.downloadCount || 1) + 1) * 10) / 10;
    window.creatorAssetV74Data.stats.totalRatings++;
    save();
    return { ok: true, msg: "⭐ Đã đánh giá " + score + "/5 cho " + asset.name };
  };

  window.ca74GetAllPublic = function() { return DEMO_ASSETS.concat(window.creatorAssetV74Data.publicMarket); };
  window.ca74GetMyAssets  = function() { return window.creatorAssetV74Data.myAssets; };
  window.ca74GetImported  = function() { return window.creatorAssetV74Data.importedAssets; };
  window.ca74GetByType    = function(typeId) { return ca74GetAllPublic().filter(function(a) { return a.type === typeId; }); };
  window.ca74GetStats     = function() { return window.creatorAssetV74Data.stats; };
  window.ca74GetTypes     = function() { return ASSET_TYPES; };

  window.ca74SetCreatorName = function(name) {
    window.creatorAssetV74Data.creatorName = name;
    save();
  };

  function init() {
    load();
    console.log("[CreatorAssetEngine V74] 🧬 Hệ Thống Asset Tạo Hóa khởi động — " + ASSET_TYPES.length + " loại asset · " + DEMO_ASSETS.length + " demo assets · " + window.creatorAssetV74Data.myAssets.length + " assets của bạn sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 18100); });
  } else { setTimeout(init, 18100); }
})();
