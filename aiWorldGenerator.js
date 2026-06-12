/* ============================
   CREATOR GOD V6 — AI WORLD GENERATOR  (Rewritten: Seed-Based Algorithm)
   aiWorldGenerator.js
   Load AFTER multiWorldSystem.js and worldTemplates.js
   ============================ */

"use strict";

// ============================
// GENERATOR STATE
// ============================

const AIGEN_STORAGE_KEY  = "cgv6_aigen_templates";
const AIGEN_HISTORY_KEY  = "cgv6_aigen_history";

let _aigenTemplates = [];
let _aigenHistory   = [];
let _aigenCurrent   = null;
let _aigenLoading   = false;

// ============================
// PERSISTENCE
// ============================

function aigenLoad() {
  try {
    const t = localStorage.getItem(AIGEN_STORAGE_KEY);
    _aigenTemplates = t ? JSON.parse(t) : [];
    const h = localStorage.getItem(AIGEN_HISTORY_KEY);
    _aigenHistory   = h ? JSON.parse(h) : [];
  } catch(e) {
    _aigenTemplates = []; _aigenHistory = [];
  }
}

function aigenSaveStorage() {
  try {
    localStorage.setItem(AIGEN_STORAGE_KEY, JSON.stringify(_aigenTemplates));
    localStorage.setItem(AIGEN_HISTORY_KEY,  JSON.stringify(_aigenHistory.slice(0, 20)));
  } catch(e) { console.warn("aigenSaveStorage failed:", e); }
}

// ============================
// KEYWORD → GENRE DETECTOR
// ============================

const GENRE_KEYWORDS = {
  cultivation: ["tu tiên","tu luyện","tiên","luyện khí","kim đan","nguyên anh","tông môn","kiếm tiên","đan","linh khí","hắc ám tu","huyết tu","tu hành","thiên kiêu","linh căn","pháp bảo"],
  fantasy:     ["fantasy","rồng","dragon","phép thuật","vương quốc","elf","lùn","orc","phù thủy","kiếm sĩ","thần thoại","cung điện","quý tộc","trung cổ","giả tưởng"],
  zombie:      ["zombie","tận thế","sinh tồn","xác chết","dịch bệnh","apocalypse","hậu tận thế","mutant","đột biến","diệt vong","hậu tân thế","hoang tàn"],
  mythology:   ["thần thoại","thiên thần","ác quỷ","thần linh","olympus","norse","cthulhu","titan","linh thần","âm phủ","thiên đình","địa ngục","thần","ma","quỷ"],
  scifi:       ["sci-fi","khoa học","vũ trụ","thiên hà","robot","ai","cyber","không gian","tàu vũ trụ","ngoài hành tinh","tương lai","điều khiển","công nghệ","sao","hành tinh"],
};

function detectGenre(prompt) {
  const p = prompt.toLowerCase();
  let bestGenre = "cultivation";
  let bestScore = 0;
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    const score = keywords.filter(k => p.includes(k)).length;
    if (score > bestScore) { bestScore = score; bestGenre = genre; }
  }
  return bestGenre;
}

// ============================
// SEED-BASED RNG (Mulberry32)
// ============================

function createRNG(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

function rngPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function rngInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function rngFloat(rng, min, max) {
  return min + rng() * (max - min);
}

function rngShuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================
// GENRE CONFIG — defines HOW each world feels
// (drives NPC types, map tokens, stat multipliers, event tables)
// ============================

const GENRE_CONFIG = {
  cultivation: {
    powerCurrency:  "Linh Khí",
    powerUnit:      "Linh Lực",
    tierLabel:      "Cảnh Giới",
    mapTokens:      ["🗻","🌋","🌊","❄️","🌿","🏔️","🌅","🌑"],
    dangerScale:    [1, 2, 3, 4, 5],
    realmMulti:     { expBase: 100, expScale: 3.0, hpBase: 60, hpScale: 2.4, atkBase: 8, atkScale: 2.6 },
    resourceNames:  { r1:"lingshi", r2:"lingyao", r3:"xuantie", r4:"jingshi" },
    resourceProfiles: [
      { lingshi:500, lingyao:200, xuantie:100, jingshi:50  },
      { lingshi:150, lingyao:100, xuantie:450, jingshi:150 },
      { lingshi:320, lingyao:420, xuantie:130, jingshi:80  },
      { lingshi:200, lingyao:120, xuantie:280, jingshi:350 },
    ],
    npcArchetypes: [
      "Đệ Tử Ngoại Môn","Đệ Tử Nội Môn","Trưởng Lão","Trưởng Môn","Thương Nhân Linh Vật",
      "Thợ Luyện Đan","Thợ Rèn Pháp Bảo","Thú Tộc Chiến Sĩ","Hắc Đạo Sát Thủ","Ẩn Thế Cao Nhân",
      "Thiên Tài Tu Sĩ","Phế Vật Tu Sĩ","Cung Đinh Ma Tông","Tà Phái Tông Chủ","Tiên Cốc Thủ Hộ",
      "Đan Đỉnh Thiết Giáo","Chiến Nô","Kiếm Tu Lãng Nhân","Nữ Tu Băng Hệ","Linh Thú Đại Tướng"
    ],
    eventTypes: ["Đột Phá Cảnh Giới","Tông Môn Chiến Tranh","Thiên Kiếp Giáng Lâm","Bí Cảnh Khai Mở","Linh Mạch Xuất Hiện"],
    plotSeeds: ["Linh Căn Giác Thức","Ma Đạo Trỗi Dậy","Cổ Thánh Thức Dậy","Tiên Giới Chi Môn Mở"],
    tierNames: ["Hạ Phẩm","Trung Phẩm","Thượng Phẩm","Tiên Phẩm"],
  },
  fantasy: {
    powerCurrency:  "Vàng",
    powerUnit:      "Pháp Lực",
    tierLabel:      "Cấp Bậc",
    mapTokens:      ["🏰","🌲","🌊","⛰️","🏜️","🌙","🗡️","🔮"],
    dangerScale:    [1, 2, 3, 4, 5],
    realmMulti:     { expBase: 80, expScale: 2.5, hpBase: 50, hpScale: 2.0, atkBase: 6, atkScale: 2.2 },
    resourceNames:  { r1:"gold", r2:"mana", r3:"iron", r4:"crystal" },
    resourceProfiles: [
      { gold:600, mana:150, iron:200, crystal:50  },
      { gold:200, mana:400, iron:100, crystal:300 },
      { gold:350, mana:200, iron:450, crystal:100 },
      { gold:150, mana:350, iron:150, crystal:450 },
    ],
    npcArchetypes: [
      "Kỵ Sĩ Hoàng Gia","Phù Thủy Hắc Ám","Cung Thủ Elfin","Chiến Binh Orc","Thợ Rèn Lùn",
      "Tiểu Thư Quý Tộc","Thám Tử Vương Quốc","Ẩn Sĩ Rừng Già","Thầy Tế Lễ","Hải Tặc Biển Cả",
      "Hắc Thuật Sư","Nhà Thám Hiểm","Vệ Binh Thành Trì","Nông Dân Nổi Dậy","Lái Buôn Hàng Hiếm",
      "Chúa Tể Địa Ngục","Thiên Sứ Sa Ngã","Thợ Săn Quái Vật","Nhà Giả Kim","Tộc Trưởng Thủy Tộc"
    ],
    eventTypes: ["Đại Chiến Vương Quốc","Thức Tỉnh Rồng Cổ","Bầu Cử Vua Mới","Dịch Hắc Tử","Cổng Địa Ngục Mở"],
    plotSeeds: ["Lời Tiên Tri Cổ Xưa","Trái Tim Rồng Mất Tích","Vương Miện Huyền Thoại","Phép Lời Nguyền Tổ Tiên"],
    tierNames: ["Bình Dân","Quý Tộc","Hiệp Sĩ","Huyền Thoại"],
  },
  zombie: {
    powerCurrency:  "Đạn",
    powerUnit:      "Sức Sống",
    tierLabel:      "Cấp Độ Sinh Tồn",
    mapTokens:      ["🏚️","🌆","🏥","🔋","🛢️","☣️","🚧","💀"],
    dangerScale:    [2, 3, 4, 5, 6],
    realmMulti:     { expBase: 50, expScale: 2.0, hpBase: 80, hpScale: 1.8, atkBase: 10, atkScale: 2.0 },
    resourceNames:  { r1:"food", r2:"ammo", r3:"fuel", r4:"medicine" },
    resourceProfiles: [
      { food:600, ammo:200, fuel:150, medicine:50  },
      { food:100, ammo:500, fuel:200, medicine:100 },
      { food:300, ammo:150, fuel:450, medicine:80  },
      { food:150, ammo:100, fuel:100, medicine:450 },
    ],
    npcArchetypes: [
      "Cựu Chiến Binh","Bác Sĩ Sinh Tồn","Trẻ Em Côi","Tên Cướp Đường","Lãnh Đạo Phe Nhóm",
      "Thợ Cơ Khí","Nhà Khoa Học Điên","Cảnh Sát Cuối Cùng","Dân Biệt Thự","Zombie Đột Biến",
      "Zombie Chúa Tể","Zombie Chạy Nhanh","Người Sống Sót Mất Trí","Buôn Lậu Vũ Khí","Thầy Tu Tận Thế",
      "Hacker Mạng Lưới","Lính Đặc Nhiệm Cũ","Nông Dân Vũ Trang","Zombie Bọc Giáp","Nhà Sinh Học Điên"
    ],
    eventTypes: ["Bầy Zombie Tấn Công","Dịch Bệnh Đột Biến","Căn Cứ Thất Thủ","Phát Hiện Vaccine","Nội Chiến Phe Người"],
    plotSeeds: ["Nguồn Gốc Virus","Tín Hiệu Cứu Trợ","Khu Vực Sạch Cuối Cùng","Phòng Thí Nghiệm Bí Ẩn"],
    tierNames: ["Tân Binh","Sinh Tồn Viên","Chiến Sĩ","Huyền Thoại Sống"],
  },
  mythology: {
    powerCurrency:  "Thần Lực",
    powerUnit:      "Thần Năng",
    tierLabel:      "Thần Cấp",
    mapTokens:      ["⛩️","🌋","🌊","☁️","🌑","⚡","🔥","🌙"],
    dangerScale:    [1, 2, 4, 6, 9],
    realmMulti:     { expBase: 200, expScale: 3.5, hpBase: 100, hpScale: 3.0, atkBase: 15, atkScale: 3.0 },
    resourceNames:  { r1:"divinity", r2:"soulstone", r3:"darkore", r4:"ambrosia" },
    resourceProfiles: [
      { divinity:400, soulstone:300, darkore:100, ambrosia:50  },
      { divinity:100, soulstone:150, darkore:600, ambrosia:100 },
      { divinity:500, soulstone:100, darkore:200, ambrosia:200 },
      { divinity:200, soulstone:400, darkore:150, ambrosia:400 },
    ],
    npcArchetypes: [
      "Thiên Sứ","Ác Quỷ Cấp Thấp","Thần Chiến Tranh","Nữ Thần Tình Yêu","Thần Chết",
      "Titan Giam Cầm","Tiên Nữ Hạ Giới","Mã Diện Ngưu Đầu","Phán Quan Địa Phủ","Long Thần",
      "Hải Thần Sứ Giả","Vũ Thần Chiến Mã","Thần Lửa","Thổ Địa","Hành Sơn Thần",
      "Quỷ Vương Sứ Giả","Tinh Linh Cổ Đại","Bán Thần Anh Hùng","Thần Tri Thức","Thần Số Mệnh"
    ],
    eventTypes: ["Thiên Chiến Thần Quỷ","Thần Giáng Thế Gian","Địa Ngục Cổng Mở","Thần Khí Tái Thế","Số Mệnh Thay Đổi"],
    plotSeeds: ["Thần Sấm Trống Thức Dậy","Ác Thần Phong Ấn","Linh Hồn Bất Tử","Lời Tiên Tri Thần Thánh"],
    tierNames: ["Phàm Nhân","Bán Thần","Thần Nhân","Thái Cổ Thần"],
  },
  scifi: {
    powerCurrency:  "Credits",
    powerUnit:      "Năng Lượng",
    tierLabel:      "Cấp Công Nghệ",
    mapTokens:      ["🌌","🪐","⭐","🛸","🏙️","☄️","🔭","💫"],
    dangerScale:    [1, 2, 3, 5, 8],
    realmMulti:     { expBase: 60, expScale: 2.8, hpBase: 40, hpScale: 2.5, atkBase: 5, atkScale: 2.8 },
    resourceNames:  { r1:"credits", r2:"darkmat", r3:"quantum", r4:"neutron" },
    resourceProfiles: [
      { credits:800, darkmat:100, quantum:200, neutron:50  },
      { credits:200, darkmat:600, quantum:100, neutron:200 },
      { credits:400, darkmat:200, quantum:500, neutron:100 },
      { credits:150, darkmat:150, quantum:200, neutron:600 },
    ],
    npcArchetypes: [
      "Phi Công Vũ Trụ","Kỹ Sư Phản Vật Chất","AI Giác Ngộ","Đặc Vụ Cyborg","Nhà Khoa Học Gen",
      "Thương Nhân Hành Tinh","Tướng Liên Minh","Phiến Quân Tự Do","Người Máy Chiến Đấu","Nhà Thực Dân",
      "Cướp Không Gian","Nhà Ngoại Giao Ngoài Hành Tinh","Hacker Lượng Tử","Đột Biến Phóng Xạ","Psi-Chiến Binh",
      "Tư Lệnh Hạm Đội","Thám Tử Không Gian","Nano-Bác Sĩ","Vệ Tinh Sống","Gián Điệp Ngoài Hành Tinh"
    ],
    eventTypes: ["Xâm Lăng Ngoài Hành Tinh","Lỗ Đen Bùng Nổ","Nổi Dậy AI","Khám Phá Hành Tinh Mới","Chiến Tranh Văn Minh"],
    plotSeeds: ["Tín Hiệu Bí Ẩn Từ Thiên Hà Khác","Vũ Khí Phản Vật Chất Thất Lạc","Người Máy Giác Ngộ","Cổng Chiều Không Gian"],
    tierNames: ["Dân Thường","Kỹ Thuật Viên","Chuyên Gia","Công Nghệ Thần"],
  },
};

// ============================
// AI PROMPT BUILDER (Enhanced)
// ============================

function buildAIPrompt(userPrompt) {
  const genre = detectGenre(userPrompt);
  const cfg   = GENRE_CONFIG[genre] || GENRE_CONFIG.cultivation;

  const systemPrompt = `Bạn là một Thần Sáng Tạo Thế Giới cho game mô phỏng. 
Nhiệm vụ: Tạo ra một thế giới game hoàn chỉnh dựa trên mô tả của người dùng.
Thể loại đã xác định: ${genre}
Tiền tệ sức mạnh: ${cfg.powerCurrency}
Đơn vị sức mạnh: ${cfg.powerUnit}

Trả về JSON THUẦN TÚY (không có markdown, không có backtick, không có giải thích).
Cấu trúc JSON CHÍNH XÁC như sau:

{
  "worldName": "string - tên thế giới độc đáo PHÙ HỢP với thể loại ${genre}",
  "worldDescription": "string - mô tả 2-3 câu về thế giới",
  "genre": "${genre}",
  "era": "string - tên kỷ nguyên khởi đầu",
  "worldSeed": "string - 5-8 từ khóa đặc trưng của thế giới này (ví dụ: hắc ám, ma khí, tuyệt vọng)",
  "civilizationLevel": "sơ khai|phát triển|đỉnh cao|suy tàn",
  "dominantForce": "string - lực lượng thống trị thế giới",
  "darkSecret": "string - bí mật tối tăm của thế giới",
  
  "regions": [
    { "id": "r1", "icon": "emoji PHÙ HỢP với ${genre}", "name": "tên khu vực ĐỘC ĐÁO cho ${genre}", "description": "mô tả 1-2 câu", "danger": 2, "tier": "rich|wild", "climate": "string - khí hậu đặc trưng", "specialResource": "tài nguyên đặc biệt" },
    { "id": "r2", "icon": "emoji", "name": "tên khu vực", "description": "mô tả", "danger": 4, "tier": "wild", "climate": "string", "specialResource": "string" },
    { "id": "r3", "icon": "emoji", "name": "tên khu vực", "description": "mô tả", "danger": 3, "tier": "rich", "climate": "string", "specialResource": "string" },
    { "id": "r4", "icon": "emoji", "name": "tên khu vực", "description": "mô tả", "danger": 5, "tier": "wild", "climate": "string", "specialResource": "string" }
  ],
  
  "countries": [
    { "id": "c1", "name": "tên quốc gia/phe nhóm PHÙ HỢP ${genre}", "description": "mô tả", "regionId": "r1", "population": 500000, "wealth": 10000, "army": 50000, "governmentType": "string - kiểu quản trị", "cultureTrait": "string - đặc điểm văn hóa" },
    { "id": "c2", "name": "tên", "description": "mô tả", "regionId": "r2", "population": 400000, "wealth": 8000, "army": 40000, "governmentType": "string", "cultureTrait": "string" },
    { "id": "c3", "name": "tên", "description": "mô tả", "regionId": "r3", "population": 600000, "wealth": 12000, "army": 60000, "governmentType": "string", "cultureTrait": "string" },
    { "id": "c4", "name": "tên", "description": "mô tả", "regionId": "r4", "population": 300000, "wealth": 6000, "army": 30000, "governmentType": "string", "cultureTrait": "string" }
  ],
  
  "cities": ["tên thành 1","tên thành 2","tên thành 3","tên thành 4","tên thành 5","tên thành 6","tên thành 7","tên thành 8"],
  
  "races": [
    { "name": "tên chủng tộc ĐẶC TRƯNG cho ${genre}", "description": "mô tả ngắn", "trait": "đặc điểm nổi bật", "powerType": "loại sức mạnh", "rarity": "common|uncommon|rare" },
    { "name": "tên", "description": "mô tả", "trait": "đặc điểm", "powerType": "string", "rarity": "uncommon" },
    { "name": "tên", "description": "mô tả", "trait": "đặc điểm", "powerType": "string", "rarity": "rare" }
  ],
  
  "factions": [
    { "id": "s1", "name": "tên phe phái/môn phái ĐỘC ĐÁO cho ${genre}", "description": "mô tả", "regionId": "r1", "prestige": 800, "treasury": 5000, "level": 3, "ideology": "string - hệ tư tưởng", "enemyFactionId": "s3" },
    { "id": "s2", "name": "tên", "description": "mô tả", "regionId": "r2", "prestige": 700, "treasury": 4000, "level": 2, "ideology": "string", "enemyFactionId": "s4" },
    { "id": "s3", "name": "tên", "description": "mô tả", "regionId": "r3", "prestige": 600, "treasury": 3500, "level": 2, "ideology": "string", "enemyFactionId": "s1" },
    { "id": "s4", "name": "tên", "description": "mô tả", "regionId": "r1", "prestige": 550, "treasury": 3000, "level": 1, "ideology": "string", "enemyFactionId": "s2" },
    { "id": "s5", "name": "tên", "description": "mô tả", "regionId": "r4", "prestige": 750, "treasury": 4500, "level": 2, "ideology": "string", "enemyFactionId": null }
  ],
  
  "bosses": [
    { "name": "emoji + tên boss ĐẶC TRƯNG ${genre}", "description": "mô tả boss", "realm": 8, "hp": 50000, "skill1": "tên kỹ năng 1", "skill2": "tên kỹ năng 2", "weakness": "điểm yếu", "loreHint": "gợi ý lore" },
    { "name": "emoji + tên boss", "description": "mô tả", "realm": 7, "hp": 30000, "skill1": "tên", "skill2": "tên", "weakness": "string", "loreHint": "string" },
    { "name": "emoji + tên boss", "description": "mô tả", "realm": 6, "hp": 20000, "skill1": "tên", "skill2": "tên", "weakness": "string", "loreHint": "string" }
  ],
  
  "realmSystem": {
    "concept": "string - tên hệ thống sức mạnh ĐẶC TRƯNG cho ${genre} (KHÔNG dùng 'Tu Luyện' nếu không phải cultivation)",
    "realms": [
      { "name": "cấp 1", "description": "mô tả ngắn" },
      { "name": "cấp 2", "description": "mô tả" },
      { "name": "cấp 3", "description": "mô tả" },
      { "name": "cấp 4", "description": "mô tả" },
      { "name": "cấp 5", "description": "mô tả" },
      { "name": "cấp 6", "description": "mô tả" },
      { "name": "cấp 7", "description": "mô tả" },
      { "name": "cấp 8", "description": "mô tả" },
      { "name": "cấp tối cao 9", "description": "mô tả" }
    ]
  },
  
  "npcRoles": [
    { "role": "vai trò NPC đặc trưng cho ${genre}", "description": "mô tả", "raceHint": "chủng tộc thường gặp", "factionHint": "phe phái liên quan" },
    { "role": "vai trò 2", "description": "mô tả", "raceHint": "string", "factionHint": "string" },
    { "role": "vai trò 3", "description": "mô tả", "raceHint": "string", "factionHint": "string" },
    { "role": "vai trò 4", "description": "mô tả", "raceHint": "string", "factionHint": "string" },
    { "role": "vai trò 5", "description": "mô tả", "raceHint": "string", "factionHint": "string" }
  ],
  
  "legends": [
    "Truyền thuyết 1: nội dung hấp dẫn ĐẶC TRƯNG thế giới này",
    "Truyền thuyết 2: nội dung hấp dẫn",
    "Truyền thuyết 3: nội dung hấp dẫn"
  ],
  
  "history": [
    { "year": 1,   "event": "Sự kiện lịch sử thứ 1 THEO ĐÚNG thể loại ${genre}" },
    { "year": 50,  "event": "Sự kiện thứ 2" },
    { "year": 120, "event": "Sự kiện thứ 3" },
    { "year": 200, "event": "Sự kiện thứ 4" },
    { "year": 300, "event": "Sự kiện thứ 5" }
  ],
  
  "namesMale":   ["tên nam 1","tên nam 2","tên nam 3","tên nam 4","tên nam 5","tên nam 6","tên nam 7","tên nam 8","tên nam 9","tên nam 10"],
  "namesFemale": ["tên nữ 1","tên nữ 2","tên nữ 3","tên nữ 4","tên nữ 5","tên nữ 6","tên nữ 7","tên nữ 8","tên nữ 9","tên nữ 10"],
  "families":    ["họ 1","họ 2","họ 3","họ 4","họ 5","họ 6","họ 7","họ 8","họ 9","họ 10"]
}`;

  return {
    genre,
    systemPrompt,
    userMessage: `Tạo thế giới game với mô tả sau: "${userPrompt}"\n\nThể loại: ${genre}\nHãy sáng tạo TỐI ĐA — mỗi yếu tố phải KHÁC BIỆT hoàn toàn với thế giới thông thường. Đặc biệt chú ý:\n- Tên khu vực, quốc gia, thành phố phải phản ánh ĐÚNG thể loại ${genre}\n- Hệ thống sức mạnh phải ĐẶC TRƯNG riêng cho thế giới này\n- NPC roles phải có nghĩa trong bối cảnh ${genre}\nTrả về JSON thuần túy.`
  };
}

// ============================
// CALL CLAUDE API
// ============================

async function callClaudeAPI(systemPrompt, userMessage) {
  const apiKey = window.CLAUDE_API_KEY || localStorage.getItem("claude_api_key") || "";
  if (!apiKey) {
    const key = prompt("🔑 Nhập Anthropic API Key của bạn:\n(Bắt đầu bằng 'sk-ant-...')");
    if (!key) throw new Error("Chưa có API key");
    localStorage.setItem("claude_api_key", key.trim());
    window.CLAUDE_API_KEY = key.trim();
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": window.CLAUDE_API_KEY || localStorage.getItem("claude_api_key"),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }
  const data = await response.json();
  const text = (data.content || []).map(b => b.text || "").join("").trim();
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

// ============================
// MAIN GENERATE FUNCTION
// ============================

async function generateAIWorld() {
  const promptEl = document.getElementById("aigenPromptInput");
  const prompt   = promptEl ? promptEl.value.trim() : "";
  if (!prompt) { toast("⚠️ Nhập mô tả thế giới trước!"); return; }
  if (_aigenLoading) return;

  _aigenLoading = true;
  _aigenCurrent = null;
  setAigenUI("loading");

  try {
    const { systemPrompt, userMessage, genre } = buildAIPrompt(prompt);
    const rawJSON = await callClaudeAPI(systemPrompt, userMessage);

    let parsed;
    try {
      parsed = JSON.parse(rawJSON);
    } catch(e) {
      const match = rawJSON.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Không thể phân tích JSON từ AI");
      parsed = JSON.parse(match[0]);
    }

    parsed._sourcePrompt = prompt;
    parsed._generatedAt  = Date.now();
    parsed.genre         = parsed.genre || genre;

    _aigenCurrent = parsed;

    _aigenHistory.unshift({ prompt, result: parsed, at: Date.now() });
    aigenSaveStorage();

    renderAigenPreview(parsed);
    setAigenUI("preview");

  } catch(err) {
    console.error("AI Generator error:", err);
    setAigenUI("error", err.message);
  } finally {
    _aigenLoading = false;
  }
}

// ============================
// SEED-BASED WORLD DATA BUILDER
// The core algorithm: takes AI-generated world data and uses
// seed-based RNG to create fully differentiated game mechanics
// ============================

function buildSeedFromWorld(parsed) {
  // Create a unique seed from world identity keywords
  const seedStr = [
    parsed.worldName || "",
    parsed.genre     || "",
    parsed.era       || "",
    parsed.worldSeed || "",
    (parsed.darkSecret || "").slice(0, 20),
  ].join("|");
  return strToSeed(seedStr);
}

function deriveRealmStats(parsed, rng, cfg) {
  // Stats derived from: genre config + world seed + realm names
  const aiRealms = (parsed.realmSystem?.realms || []).slice(0, 9);
  const m = cfg.realmMulti;

  // World personality modifiers driven by seed
  const aggression  = rngFloat(rng, 0.6, 1.4);  // high = harder fights
  const mysticism   = rngFloat(rng, 0.5, 1.5);  // high = bigger EXP gaps
  const harshness   = rngFloat(rng, 0.7, 1.3);  // high = lower breakthrough chance

  const realms = [];
  for (let i = 0; i < 9; i++) {
    const factor   = Math.pow(m.expScale * mysticism, i);
    const isLast   = i === 8;
    realms.push({
      name:         aiRealms[i]?.name || `${cfg.tierLabel} ${i + 1}`,
      exp:          isLast ? Infinity : Math.floor(m.expBase * factor),
      breakthrough: isLast ? 0 : Math.max(0.04, (0.75 - i * 0.08) / harshness),
      tribulation:  isLast ? 0 : Math.min(0.6, i * 0.04 * aggression),
      lifespanBonus: isLast ? Infinity : [0,100,300,800,2000,5000,10000,50000][i] || 0,
      hpBonus:      Math.floor(m.hpBase * Math.pow(m.hpScale, i) * aggression),
      atkBonus:     Math.floor(m.atkBase * Math.pow(m.atkScale, i) * aggression),
      defBonus:     Math.floor(m.atkBase * 0.6 * Math.pow(m.atkScale * 0.95, i) * aggression),
    });
  }
  return realms;
}

function deriveRegions(parsed, rng, cfg) {
  const profiles = cfg.resourceProfiles;
  const aiRegions = (parsed.regions || []).slice(0, 4);

  // Shuffle resource profiles so each world distributes resources differently
  const shuffled = rngShuffle(rng, [...profiles]);

  return aiRegions.map((r, i) => {
    const res = JSON.parse(JSON.stringify(shuffled[i] || shuffled[0]));
    // Apply world-specific variance
    for (const k of Object.keys(res)) {
      res[k] = Math.max(20, Math.floor(res[k] * rngFloat(rng, 0.7, 1.3)));
    }
    return {
      id:           r.id || `r${i+1}`,
      name:         `${r.icon || rngPick(rng, cfg.mapTokens)} ${r.name}`,
      population:   rngInt(rng, 3000, 12000),
      danger:       r.danger || rngInt(rng, 1, 6),
      resources:     JSON.parse(JSON.stringify(res)),
      baseResources: JSON.parse(JSON.stringify(res)),
      tier:         r.tier === "wild" ? "荒野" : "富庶",
      climate:      r.climate || "",
      specialResource: r.specialResource || "",
    };
  });
}

function deriveCountries(parsed, rng, regions) {
  return (parsed.countries || []).slice(0, 4).map((c, i) => {
    const region = regions.find(r => r.id === c.regionId) || regions[i % regions.length] || regions[0];
    // Randomize stats around AI-provided baseline
    const pop   = Math.floor((c.population || 400000) * rngFloat(rng, 0.8, 1.2));
    const wealth = Math.floor((c.wealth || 8000) * rngFloat(rng, 0.75, 1.25));
    const army  = Math.floor((c.army || 40000) * rngFloat(rng, 0.75, 1.25));
    return {
      id:           c.id || `c${i+1}`,
      name:         c.name,
      population:   pop,
      wealth:       wealth,
      army:         army,
      territory:    region.name,
      relations:    {},
      economy:      Math.floor(wealth * rngFloat(rng, 0.4, 0.6)),
      military:     army,
      technology:   rngInt(rng, 1, 6),
      culture:      rngInt(rng, 1, 6),
      level:        1,
      civHistory:   [],
      governmentType: c.governmentType || "",
      cultureTrait:   c.cultureTrait   || "",
    };
  });
}

function deriveFactions(parsed, rng, regions) {
  return (parsed.factions || []).slice(0, 5).map((f, i) => {
    const region = regions.find(r => r.id === f.regionId) || regions[i % regions.length] || regions[0];
    return {
      id:          f.id || `s${i+1}`,
      name:        f.name,
      founder:     null, leader: null, elders: [], members: [], disciples: [],
      prestige:    Math.floor((f.prestige || (800 - i * 60)) * rngFloat(rng, 0.85, 1.15)),
      treasury:    Math.floor((f.treasury || (5000 - i * 300)) * rngFloat(rng, 0.8, 1.2)),
      territory:   region.name,
      level:       f.level || Math.max(1, 3 - Math.floor(i / 2)),
      warCooldown: 0,
      ideology:    f.ideology    || "",
      enemyId:     f.enemyFactionId || null,
    };
  });
}

function deriveBosses(parsed, rng, cfg) {
  return (parsed.bosses || []).slice(0, 4).map((b, i) => {
    // HP scaled by world aggression seed
    const baseHP = [50000, 30000, 20000, 12000][i] || 10000;
    const hp     = Math.floor(baseHP * rngFloat(rng, 0.8, 1.3));
    return {
      name:    b.name,
      realm:   b.realm  || (8 - i),
      hp:      hp,
      maxHp:   hp,
      skills:  [b.skill1 || "Kỹ Năng 1", b.skill2 || "Kỹ Năng 2"],
      rage:    0,
      loot:    i === 0 ? ["legendary","epic"] : i === 1 ? ["epic","rare"] : ["rare","uncommon"],
      weakness: b.weakness || "",
      loreHint: b.loreHint || "",
    };
  });
}

function deriveNPCTypes(parsed, rng, cfg) {
  // Build 20 NPC types from:
  // 1. AI-provided npcRoles (up to 5)
  // 2. Genre archetypes (remaining)
  // 3. Race + faction combinations
  const aiRoles = (parsed.npcRoles || []).map(r => r.role);
  const genreArchetypes = rngShuffle(rng, [...cfg.npcArchetypes]);
  const races = (parsed.races || []).map(r => r.name);
  const factions = (parsed.factions || []).map(f => f.name);

  const combined = [
    ...aiRoles,
    ...genreArchetypes,
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Add race-specific roles
  for (const race of races.slice(0, 3)) {
    combined.push(`${race} Chiến Binh`);
    combined.push(`${race} Tu Sĩ`);
  }
  // Add faction-specific roles
  for (const faction of factions.slice(0, 3)) {
    const shortName = faction.split(" ").slice(0, 2).join(" ");
    combined.push(`Đệ Tử ${shortName}`);
  }

  return combined.slice(0, 20);
}

function deriveMapCells(parsed, rng, cfg, regions) {
  // Generate map grid influenced by region terrain
  const cells = {};
  const gridSize = 8;
  const regionCount = regions.length;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const regionIdx = Math.floor((row * gridSize + col) / (gridSize * gridSize / regionCount));
      const region    = regions[Math.min(regionIdx, regionCount - 1)];
      const token     = rngPick(rng, cfg.mapTokens);
      const danger    = Math.max(1, region.danger + rngInt(rng, -1, 1));
      cells[`${row}_${col}`] = {
        token,
        regionId: region.id,
        danger,
        explored: false,
      };
    }
  }
  return cells;
}

function deriveEventTable(parsed, rng, cfg) {
  // Build world-specific event table from genre + world seed
  const genreEvents = rngShuffle(rng, [...cfg.eventTypes]);
  const plotSeeds   = rngShuffle(rng, [...cfg.plotSeeds]);
  const histEvents  = (parsed.history || []).map(h => h.event).slice(0, 3);

  return [
    ...genreEvents,
    ...plotSeeds,
    ...histEvents,
  ].filter(Boolean);
}

// ============================
// MAP AI OUTPUT → GAME DATA (Seed-Based)
// ============================

function mapAIResultToGameData(parsed) {
  const genre = parsed.genre || "cultivation";
  const cfg   = GENRE_CONFIG[genre] || GENRE_CONFIG.cultivation;

  // Create deterministic RNG seeded from this world's content
  const seed = buildSeedFromWorld(parsed);
  const rng  = createRNG(seed);

  // --- Derive all game data algorithmically ---
  const realms      = deriveRealmStats(parsed, createRNG(seed ^ 0xA1B2C3), cfg);
  const regions     = deriveRegions(parsed, createRNG(seed ^ 0xDEADBEEF), cfg);
  const countries   = deriveCountries(parsed, createRNG(seed ^ 0xF00DCAFE), regions);
  const factions    = deriveFactions(parsed, createRNG(seed ^ 0xCAFEBABE), regions);
  const bosses      = deriveBosses(parsed, createRNG(seed ^ 0xBEEF1234), cfg);
  const npcTypes    = deriveNPCTypes(parsed, createRNG(seed ^ 0x12345678), cfg);
  const mapCells    = deriveMapCells(parsed, createRNG(seed ^ 0xABCDEF01), cfg, regions);
  const eventTable  = deriveEventTable(parsed, createRNG(seed ^ 0x99887766), cfg);

  // --- World history ---
  const worldHistory = (parsed.history || []).map((h, i) => ({
    id:          i + 1,
    year:        h.year || (i * 60 + 1),
    eventType:   "civilization",
    description: h.event,
  }));

  // --- Names & Families ---
  const baseTemplate = (typeof WORLD_TEMPLATES !== "undefined" && WORLD_TEMPLATES[genre])
    ? WORLD_TEMPLATES[genre]
    : (typeof WORLD_TEMPLATES !== "undefined" ? WORLD_TEMPLATES.cultivation : null);

  const namesMale   = parsed.namesMale   || (baseTemplate?.namesMale   || NAMES_MALE_DEFAULT   || []);
  const namesFemale = parsed.namesFemale || (baseTemplate?.namesFemale || NAMES_FEMALE_DEFAULT || []);
  const families    = parsed.families    || (baseTemplate?.families    || FAMILIES_DEFAULT     || []);
  const cities      = parsed.cities      || (baseTemplate?.cities      || []);

  // Personalities and goals adjusted by genre
  const personalities = genre === "zombie"
    ? ["Tuyệt Vọng","Sinh Tồn Bằng Mọi Giá","Nhân Đạo","Tàn Nhẫn","Bảo Vệ Người Thân","Cô Đơn","Điên Loạn"]
    : genre === "scifi"
    ? ["Lý Trí","Tham Vọng","Nhân Đạo","Vô Cảm","Khám Phá","Phản Loạn","Trung Thành"]
    : genre === "fantasy"
    ? ["Dũng Cảm","Xảo Quyệt","Cao Quý","Tham Lam","Bí Ẩn","Trung Thực","Tàn Bạo"]
    : baseTemplate?.personalities || ["Kiêu Ngạo","Hiền Hòa","Lạnh Lùng","Nhiệt Huyết","Bí Ẩn"];

  const goals = genre === "zombie"
    ? ["Tìm Vaccine","Xây Căn Cứ An Toàn","Báo Thù","Tìm Gia Đình","Thống Trị Khu Vực","Chế Tạo Vũ Khí"]
    : genre === "scifi"
    ? ["Khám Phá Hành Tinh","Xây Đế Chế","Giải Mã Tín Hiệu","Hòa Bình Thiên Hà","Phát Triển AI","Tìm Nguồn Gốc"]
    : genre === "fantasy"
    ? ["Hủy Diệt Yêu Ma","Giải Lời Nguyền","Tìm Vũ Khí Cổ Đại","Bảo Vệ Vương Quốc","Lên Ngôi Vua","Học Pháp Thuật Cao Cấp"]
    : baseTemplate?.goals || ["Thành Tiên","Báo Thù","Bảo Vệ Gia Tộc"];

  const tKey = "aiworld_" + seed.toString(16);

  return {
    // world meta
    world: {
      name:          parsed.worldName    || "Thế Giới Mới",
      genre,
      templateKey:   tKey,
      createdYear:   1,
      currentEra:    parsed.era          || "Kỷ Nguyên Đầu",
      description:   parsed.worldDescription || "",
      races:         parsed.races        || [],
      legends:       parsed.legends      || [],
      realmConcept:  parsed.realmSystem?.concept || "",
      civilizationLevel: parsed.civilizationLevel || "phát triển",
      dominantForce:    parsed.dominantForce    || "",
      darkSecret:       parsed.darkSecret       || "",
      powerCurrency:    cfg.powerCurrency,
      powerUnit:        cfg.powerUnit,
      tierLabel:        cfg.tierLabel,
      seed,
      npcTypes,
      eventTable,
      mapCells,
    },
    // game arrays
    realms, regions, countries, factions, bosses, worldHistory,
    namesMale, namesFemale, families, cities, personalities, goals,
    // dynamic template
    dynamicTemplate: {
      namesMale, namesFemale, families, personalities, goals, cities,
      realms, factions, countries, regions, bosses,
    },
  };
}

// ============================
// SPAWN WORLD INTO GAME
// ============================

function spawnAIWorld(parsed) {
  if (!parsed) { toast("⚠️ Chưa có dữ liệu thế giới!"); return; }

  const mapped = mapAIResultToGameData(parsed);
  const wName  = mapped.world.name;
  const tKey   = mapped.world.templateKey;

  if (typeof WORLD_TEMPLATES !== "undefined") {
    WORLD_TEMPLATES[tKey] = mapped.dynamicTemplate;
  }

  if (typeof currentWorldId !== "undefined" && currentWorldId && typeof saveWorlds === "function") {
    saveWorlds();
  }

  if (typeof simInterval !== "undefined" && simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }

  const newId = (typeof newWorldId === "function") ? newWorldId() : ("w_ai_" + Date.now());
  if (typeof currentWorldId !== "undefined") currentWorldId = newId;

  // Reset live state
  if (typeof year             !== "undefined") year             = 1;
  if (typeof heavenPoints     !== "undefined") heavenPoints     = 1000;
  if (typeof _npcIdCounter    !== "undefined") _npcIdCounter    = 1;
  if (typeof npcs             !== "undefined") npcs             = [];
  if (typeof bosses           !== "undefined") bosses           = [];
  if (typeof logs             !== "undefined") logs             = [];
  if (typeof eventTimeline    !== "undefined") eventTimeline    = [];
  if (typeof dynasties        !== "undefined") dynasties        = {};
  if (typeof hallOfFame       !== "undefined") hallOfFame       = [];
  if (typeof worldEvents      !== "undefined") worldEvents      = [];
  if (typeof activeWorldEvent !== "undefined") activeWorldEvent = null;
  if (typeof sectWarLogs      !== "undefined") sectWarLogs      = [];
  if (typeof activeWars       !== "undefined") activeWars       = [];
  if (typeof secretRealms     !== "undefined") secretRealms     = [];

  if (typeof sects     !== "undefined") sects     = JSON.parse(JSON.stringify(mapped.factions));
  if (typeof countries !== "undefined") countries = JSON.parse(JSON.stringify(mapped.countries));
  if (typeof regions   !== "undefined") regions   = JSON.parse(JSON.stringify(mapped.regions));
  if (typeof worldHistory !== "undefined") worldHistory = JSON.parse(JSON.stringify(mapped.worldHistory));

  if (typeof world !== "undefined") {
    world = {
      name:          mapped.world.name,
      genre:         mapped.world.genre,
      templateKey:   tKey,
      createdYear:   1,
      currentEra:    mapped.world.currentEra,
      description:   mapped.world.description,
      races:         mapped.world.races,
      legends:       mapped.world.legends,
      realmConcept:  mapped.world.realmConcept,
      civilizationLevel: mapped.world.civilizationLevel,
      dominantForce:     mapped.world.dominantForce,
      darkSecret:        mapped.world.darkSecret,
      powerCurrency:     mapped.world.powerCurrency,
      powerUnit:         mapped.world.powerUnit,
      tierLabel:         mapped.world.tierLabel,
      seed:              mapped.world.seed,
      npcTypes:          mapped.world.npcTypes,
      eventTable:        mapped.world.eventTable,
    };
  }

  if (typeof addLog === "function") {
    addLog(`🌟 AI Thiên Đạo khai sinh thế giới [${wName}] — ${mapped.world.description || ""}`, "important");
    addLog(`⚙️ Hạt nhân thế giới: ${mapped.world.dominantForce || "Chưa xác định"} | Bí mật: ${mapped.world.darkSecret || "—"}`, "lore");
    addLog(`💰 Tiền tệ: ${mapped.world.powerCurrency} | Hệ thống: ${mapped.world.realmConcept || mapped.world.tierLabel}`, "lore");
    (mapped.world.legends || []).forEach(l => addLog(`📜 Truyền Thuyết: ${l}`, "lore"));
  }

  if (typeof worlds !== "undefined" && typeof captureWorldSnapshot === "function") {
    const snap = captureWorldSnapshot();
    snap.id = newId;
    if (!Array.isArray(worlds)) worlds = [];
    worlds.push(snap);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("cgv6_worlds",        JSON.stringify(worlds));
      localStorage.setItem("cgv6_currentWorldId", newId);
    }
  }

  if (typeof simRunning !== "undefined") simRunning = true;
  if (typeof startSim   === "function") startSim();
  if (typeof renderAll  === "function") renderAll();
  if (typeof updateWorldManagerUI === "function") updateWorldManagerUI();

  closeAIGenerator();
  toast(`✨ Thế giới AI "${wName}" đã được khai sinh! [Seed: 0x${mapped.world.seed.toString(16).toUpperCase()}]`);
}

// ============================
// SAVE AS TEMPLATE
// ============================

function saveAITemplate() {
  if (!_aigenCurrent) { toast("⚠️ Chưa có thế giới để lưu!"); return; }
  const nameEl = document.getElementById("aigenTemplateName");
  const name   = (nameEl?.value || "").trim() || (_aigenCurrent.worldName || "Mẫu Chưa Đặt Tên");

  const existing = _aigenTemplates.findIndex(t => t.name === name);
  const entry = { name, prompt: _aigenCurrent._sourcePrompt || "", result: _aigenCurrent, savedAt: Date.now() };
  if (existing >= 0) _aigenTemplates[existing] = entry;
  else _aigenTemplates.unshift(entry);

  aigenSaveStorage();
  renderAigenTemplateList();
  toast(`💾 Đã lưu mẫu "${name}"!`);
}

function deleteAITemplate(idx) {
  _aigenTemplates.splice(idx, 1);
  aigenSaveStorage();
  renderAigenTemplateList();
  toast("🗑 Đã xóa mẫu.");
}

function loadAITemplate(idx) {
  const t = _aigenTemplates[idx];
  if (!t) return;
  _aigenCurrent = t.result;
  const promptEl = document.getElementById("aigenPromptInput");
  if (promptEl) promptEl.value = t.prompt || "";
  renderAigenPreview(t.result);
  setAigenUI("preview");
  toast(`📂 Đã tải mẫu "${t.name}"`);
}

// ============================
// REGENERATE
// ============================

async function regenerateAIWorld() {
  if (_aigenLoading) return;
  const promptEl = document.getElementById("aigenPromptInput");
  const prompt   = promptEl ? promptEl.value.trim() : (_aigenCurrent?._sourcePrompt || "");
  if (!prompt) { toast("⚠️ Nhập mô tả thế giới!"); return; }
  if (promptEl) promptEl.value = prompt;
  await generateAIWorld();
}

// ============================
// UI HELPERS
// ============================

function setAigenUI(state, errMsg = "") {
  const loadingEl   = document.getElementById("aigenLoading");
  const previewEl   = document.getElementById("aigenPreviewSection");
  const errorEl     = document.getElementById("aigenError");
  const generateBtn = document.getElementById("aigenGenerateBtn");
  const regenBtn    = document.getElementById("aigenRegenBtn");

  if (loadingEl)  loadingEl.style.display  = state === "loading" ? "flex" : "none";
  if (previewEl)  previewEl.style.display  = state === "preview" ? "block" : "none";
  if (errorEl) {
    errorEl.style.display = state === "error" ? "block" : "none";
    if (state === "error") errorEl.textContent = "⚠️ Lỗi: " + errMsg;
  }
  if (generateBtn) generateBtn.disabled = state === "loading";
  if (regenBtn)    regenBtn.disabled    = state === "loading";
}

function renderAigenPreview(parsed) {
  const el = document.getElementById("aigenPreviewContent");
  if (!el) return;

  const genre = parsed.genre || "cultivation";
  const cfg   = GENRE_CONFIG[genre] || GENRE_CONFIG.cultivation;
  const seed  = buildSeedFromWorld(parsed);

  const regionRows  = (parsed.regions   || []).map(r => `<div class="aig-chip"><span>${r.icon||"🗺"}</span> ${r.name}<small style="color:var(--white-dim);margin-left:4px">${r.climate||""}</small></div>`).join("");
  const countryRows = (parsed.countries || []).map(c => `<div class="aig-chip">⚔️ ${c.name}<small style="color:var(--white-dim);margin-left:4px">${c.governmentType||""}</small></div>`).join("");
  const cityRows    = (parsed.cities    || []).map(c => `<div class="aig-chip">🏙️ ${c}</div>`).join("");
  const raceRows    = (parsed.races     || []).map(r => `<div class="aig-race-card"><div class="aig-race-name">${r.name} <span style="font-size:9px;color:var(--gold-dim)">${r.rarity||""}</span></div><div class="aig-race-desc">${r.description}</div><div class="aig-race-trait">⚡ ${r.powerType||""} · ✦ ${r.trait}</div></div>`).join("");
  const factionRows = (parsed.factions  || []).map(f => `<div class="aig-chip aig-chip-faction">🏯 ${f.name}<small style="color:var(--white-dim);margin-left:4px">${f.ideology||""}</small></div>`).join("");
  const bossRows    = (parsed.bosses    || []).map(b => `<div class="aig-boss-card"><div class="aig-boss-name">${b.name}</div><div class="aig-boss-meta">Realm ${b.realm} · HP ${(b.hp||0).toLocaleString()} · 弱: ${b.weakness||"—"}</div><div class="aig-boss-skills">${b.skill1||""} / ${b.skill2||""}</div><div style="font-size:9px;color:var(--white-dim);margin-top:3px">💬 ${b.loreHint||""}</div></div>`).join("");
  const realmRows   = (parsed.realmSystem?.realms || []).map((r,i) => `<div class="aig-realm-row"><span class="aig-realm-num">${i+1}</span><span class="aig-realm-name">${r.name}</span><span class="aig-realm-desc">${r.description||""}</span></div>`).join("");
  const legendRows  = (parsed.legends   || []).map(l => `<div class="aig-legend">📜 ${l}</div>`).join("");
  const histRows    = (parsed.history   || []).map(h => `<div class="aig-hist-row"><span class="aig-hist-year">Năm ${h.year}</span><span>${h.event}</span></div>`).join("");
  const npcRows     = (parsed.npcRoles  || []).map(r => `<div class="aig-chip" style="font-size:10px">👤 ${r.role}</div>`).join("");

  el.innerHTML = `
    <div class="aig-world-banner">
      <div class="aig-world-name">${parsed.worldName || "—"}</div>
      <div class="aig-world-desc">${parsed.worldDescription || ""}</div>
      <div class="aig-world-era">🌐 ${parsed.era || ""} · ${genre} · Seed: 0x${seed.toString(16).toUpperCase()}</div>
      ${parsed.dominantForce ? `<div style="font-size:11px;color:var(--gold-dim);margin-top:4px">⚡ Lực Thống Trị: ${parsed.dominantForce}</div>` : ""}
      ${parsed.darkSecret    ? `<div style="font-size:11px;color:rgba(248,113,113,0.8);margin-top:2px">🔒 Bí Mật: ${parsed.darkSecret}</div>` : ""}
      <div style="font-size:10px;color:var(--white-dim);margin-top:4px">💰 ${cfg.powerCurrency} · ${cfg.powerUnit} · ${parsed.realmSystem?.concept||cfg.tierLabel}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">🗺 Khu Vực (${(parsed.regions||[]).length})</div>
      <div class="aig-chip-wrap">${regionRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">⚔️ Quốc Gia / Phe Nhóm (${(parsed.countries||[]).length})</div>
      <div class="aig-chip-wrap">${countryRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">🏙️ Thành Phố (${(parsed.cities||[]).length})</div>
      <div class="aig-chip-wrap">${cityRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">👤 Chủng Tộc</div>
      <div class="aig-race-grid">${raceRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">🏯 Phe Phái / Môn Phái (${(parsed.factions||[]).length})</div>
      <div class="aig-chip-wrap">${factionRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">🐉 Trùm Cuối</div>
      <div class="aig-boss-grid">${bossRows}</div>
    </div>

    <div class="aig-section">
      <div class="aig-section-title">✨ ${parsed.realmSystem?.concept || cfg.tierLabel}</div>
      <div class="aig-realm-list">${realmRows}</div>
    </div>

    ${npcRows ? `<div class="aig-section"><div class="aig-section-title">🧑 Kiểu NPC Thế Giới</div><div class="aig-chip-wrap">${npcRows}</div></div>` : ""}

    <div class="aig-section">
      <div class="aig-section-title">📜 Truyền Thuyết</div>
      ${legendRows}
    </div>

    <div class="aig-section">
      <div class="aig-section-title">🏛️ Lịch Sử Thế Giới</div>
      ${histRows}
    </div>
  `;
}

function renderAigenTemplateList() {
  const el = document.getElementById("aigenTemplateList");
  if (!el) return;
  if (!_aigenTemplates.length) {
    el.innerHTML = `<div style="color:var(--white-dim);font-size:12px;padding:10px;text-align:center;font-style:italic">Chưa có mẫu nào</div>`;
    return;
  }
  el.innerHTML = _aigenTemplates.map((t, i) => `
    <div class="aig-tmpl-row">
      <div class="aig-tmpl-info" onclick="loadAITemplate(${i})" title="Nhấn để tải mẫu này">
        <div class="aig-tmpl-name">${t.name}</div>
        <div class="aig-tmpl-prompt">${t.prompt || "—"}</div>
      </div>
      <div class="aig-tmpl-actions">
        <button class="aig-tmpl-load" onclick="loadAITemplate(${i})">📂</button>
        <button class="aig-tmpl-del"  onclick="deleteAITemplate(${i})">🗑</button>
      </div>
    </div>
  `).join("");
}

// ============================
// EXAMPLE PROMPTS
// ============================

const AIGEN_EXAMPLES = [
  "Thế giới Tu luyện Hắc ám nơi ma khí bao phủ",
  "Vương quốc Rồng thần thoại cổ đại",
  "Trái đất Ngày tận thế Zombie hậu apocalypse",
  "Thiên đình và Địa ngục thần thoại phương Đông",
  "Thiên hà Sci-Fi với chiến tranh văn minh vũ trụ",
  "Thế giới Kiếm Tiên Lạnh Lùng băng phong vĩnh cửu",
  "Vương quốc Fantasy với ma pháp hắc ám và chiến tranh",
  "Thế giới hậu tận thế với các đột biến thể năng",
];

function fillExamplePrompt(text) {
  const el = document.getElementById("aigenPromptInput");
  if (el) { el.value = text; el.focus(); }
}

// ============================
// OPEN / CLOSE
// ============================

function openAIGenerator() {
  const overlay = document.getElementById("aigenOverlay");
  if (!overlay) return;
  aigenLoad();
  renderAigenTemplateList();
  setAigenUI("idle");
  overlay.classList.remove("aig-hidden");
}

function closeAIGenerator() {
  const overlay = document.getElementById("aigenOverlay");
  if (overlay) overlay.classList.add("aig-hidden");
}

// ============================
// DOM INJECTION
// ============================

function injectAIGeneratorButton() {
  // AI Generator button hidden — functionality moved to World Hub
  return;
  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;
  const btn = document.createElement("button");
  btn.id        = "aigenNavBtn";
  btn.className = "nav-btn";
  btn.setAttribute("data-panel", "aigen");
  btn.innerHTML = `<span class="nav-icon">🤖</span><span>AI Tạo Thế Giới</span>`;
  btn.onclick   = openAIGenerator;
  const mgrBtn = document.getElementById("worldManagerNavBtn");
  if (mgrBtn) nav.insertBefore(btn, mgrBtn.nextSibling);
  else nav.insertBefore(btn, nav.firstChild);
}

function injectAIGeneratorDOM() {
  if (document.getElementById("aigenOverlay")) return;

  const exampleBtns = AIGEN_EXAMPLES.map(ex =>
    `<button class="aig-example-btn" onclick="fillExamplePrompt('${ex.replace(/'/g,"\\'")}')">${ex}</button>`
  ).join("");

  const overlay = document.createElement("div");
  overlay.id        = "aigenOverlay";
  overlay.className = "aig-overlay aig-hidden";
  overlay.innerHTML = `
  <div class="aig-panel">
    <div class="aig-header">
      <div class="aig-header-left">
        <span class="aig-logo">🤖</span>
        <div>
          <div class="aig-title">AI Trình Tạo Thế Giới</div>
          <div class="aig-subtitle">Seed-Based · Thuật Toán Thực · Văn Minh Khác Biệt</div>
        </div>
      </div>
      <button class="aig-close-btn" onclick="closeAIGenerator()">✕</button>
    </div>

    <div class="aig-body">
      <div class="aig-left-col">
        <div class="aig-input-section">
          <div class="aig-section-title">✍️ Mô Tả Thế Giới</div>
          <textarea id="aigenPromptInput" class="aig-textarea"
            placeholder="Ví dụ: Thế giới Tu luyện Hắc ám nơi ma khí bao phủ..."
            rows="4"
          ></textarea>
          <div class="aig-example-wrap">
            <div style="font-size:10px;color:var(--white-dim);margin-bottom:6px;letter-spacing:0.5px">💡 GỢI Ý NHANH</div>
            <div class="aig-examples-scroll">${exampleBtns}</div>
          </div>
          <div class="aig-btn-row">
            <button id="aigenGenerateBtn" class="aig-generate-btn" onclick="generateAIWorld()">
              ✨ Tạo Thế Giới
            </button>
            <button id="aigenRegenBtn" class="aig-regen-btn" onclick="regenerateAIWorld()" title="Tái tạo với cùng mô tả">
              🔄 Tái Tạo
            </button>
          </div>
          <div style="margin-top:8px;text-align:center"><button onclick="setAPIKey()" style="background:none;border:1px solid #555;color:#aaa;padding:4px 14px;border-radius:6px;font-size:12px;cursor:pointer" title="Cài đặt API Key">🔑 Đặt API Key</button></div>
        </div>

        <div class="aig-template-section">
          <div class="aig-section-title">💾 Lưu Mẫu Thế Giới</div>
          <div class="aig-save-row">
            <input id="aigenTemplateName" class="dao-input" placeholder="Tên mẫu..." style="flex:1;min-width:0">
            <button class="btn-secondary" style="white-space:nowrap;font-size:12px" onclick="saveAITemplate()">💾 Lưu</button>
          </div>
          <div id="aigenTemplateList" class="aig-template-list"></div>
        </div>
      </div>

      <div class="aig-right-col">
        <div id="aigenLoading" class="aig-loading-state" style="display:none">
          <div class="aig-loading-orb"></div>
          <div class="aig-loading-text">Thiên Đạo đang khai sinh thế giới...</div>
          <div class="aig-loading-sub">AI đang tạo địa hình, phe phái, trùm cuối, seed hạt nhân...</div>
        </div>

        <div id="aigenError" class="aig-error-state" style="display:none"></div>

        <div id="aigenPreviewSection" style="display:none">
          <div id="aigenPreviewContent" class="aig-preview-content"></div>
          <div class="aig-spawn-bar">
            <div class="aig-spawn-note">⚠️ Sẽ tạo thế giới mới — không ghi đè thế giới hiện có</div>
            <button class="aig-spawn-btn" onclick="spawnAIWorld(_aigenCurrent)">
              🚀 Khai Sinh Thế Giới Này
            </button>
          </div>
        </div>

        <div id="aigenIdle" class="aig-idle-state">
          <div style="font-size:56px;margin-bottom:16px">🌌</div>
          <div style="font-size:16px;font-weight:700;color:var(--white-main);margin-bottom:8px">Sẵn Sàng Khai Thiên Tịch Địa</div>
          <div style="font-size:13px;color:var(--white-dim);line-height:1.8">
            Nhập mô tả thế giới của bạn<br>
            AI sẽ tạo văn minh hoàn toàn khác biệt<br>
            Seed-based: mỗi thế giới có DNA riêng
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  overlay.addEventListener("click", e => { if (e.target === overlay) closeAIGenerator(); });
  document.body.appendChild(overlay);
}

// ============================
// CSS INJECTION
// ============================

function injectAIGeneratorCSS() {
  if (document.getElementById("aigenCSS")) return;
  const style = document.createElement("style");
  style.id = "aigenCSS";
  style.textContent = `
.aig-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  z-index: 1200;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.aig-hidden { display: none !important; }
.aig-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-hover);
  border-radius: 20px;
  width: 100%; max-width: 1060px; max-height: 92vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(250,204,21,0.15);
}
.aig-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  background: linear-gradient(135deg, rgba(250,204,21,0.04), transparent);
}
.aig-header-left { display: flex; align-items: center; gap: 12px; }
.aig-logo        { font-size: 30px; }
.aig-title {
  font-family: var(--font-heading); font-size: 18px;
  color: var(--gold); letter-spacing: 2px; line-height: 1;
}
.aig-subtitle { font-size: 10px; color: var(--white-dim); letter-spacing: 1px; margin-top: 3px; }
.aig-close-btn {
  background: transparent; border: 1px solid var(--border); border-radius: 6px;
  color: var(--white-dim); cursor: pointer; padding: 5px 11px; font-size: 14px; transition: all 0.2s;
}
.aig-close-btn:hover { border-color: var(--red); color: var(--red); }
.aig-body {
  display: grid; grid-template-columns: 360px 1fr; gap: 0; flex: 1; overflow: hidden;
}
@media (max-width: 768px) { .aig-body { grid-template-columns: 1fr; } }
.aig-left-col {
  border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto;
}
.aig-input-section { padding: 16px; border-bottom: 1px solid var(--border); }
.aig-section-title {
  font-size: 11px; letter-spacing: 1.5px; color: var(--gold-dim);
  text-transform: uppercase; margin-bottom: 10px;
}
.aig-textarea {
  width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
  color: var(--white-main); padding: 10px 12px; font-size: 13px; font-family: inherit;
  resize: vertical; outline: none; line-height: 1.6; transition: border-color 0.2s; box-sizing: border-box;
}
.aig-textarea:focus { border-color: var(--gold-dim); }
.aig-example-wrap { margin: 10px 0; }
.aig-examples-scroll {
  display: flex; flex-direction: column; gap: 4px; max-height: 130px; overflow-y: auto;
}
.aig-example-btn {
  text-align: left; background: rgba(255,255,255,0.03); border: 1px solid var(--border);
  border-radius: 7px; color: var(--white-dim); font-size: 11px; padding: 5px 10px;
  cursor: pointer; transition: all 0.15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.aig-example-btn:hover { border-color: var(--gold-dim); color: var(--gold); background: rgba(250,204,21,0.05); }
.aig-btn-row { display: flex; gap: 8px; margin-top: 12px; }
.aig-generate-btn {
  flex: 1;
  background: linear-gradient(135deg, rgba(250,204,21,0.25), rgba(196,150,30,0.35));
  border: 1px solid rgba(250,204,21,0.6); color: var(--gold);
  border-radius: 10px; padding: 10px 16px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
}
.aig-generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(250,204,21,0.40), rgba(196,150,30,0.50));
  transform: translateY(-2px); box-shadow: 0 6px 20px rgba(250,204,21,0.2);
}
.aig-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.aig-regen-btn {
  background: var(--bg-card); border: 1px solid var(--border); color: var(--white-dim);
  border-radius: 10px; padding: 10px 14px; font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.aig-regen-btn:hover:not(:disabled) { border-color: var(--gold-dim); color: var(--gold); }
.aig-regen-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.aig-template-section { padding: 16px; flex: 1; }
.aig-save-row { display: flex; gap: 8px; margin-bottom: 12px; }
.aig-template-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.aig-tmpl-row {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; transition: all 0.15s;
}
.aig-tmpl-row:hover { border-color: var(--gold-dim); }
.aig-tmpl-info { flex: 1; min-width: 0; cursor: pointer; }
.aig-tmpl-name { font-size: 12px; font-weight: 600; color: var(--white-main); margin-bottom: 2px; }
.aig-tmpl-prompt { font-size: 10px; color: var(--white-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.aig-tmpl-actions { display: flex; gap: 4px; flex-shrink: 0; }
.aig-tmpl-load, .aig-tmpl-del {
  background: none; border: 1px solid var(--border); border-radius: 5px;
  color: var(--white-dim); cursor: pointer; padding: 3px 7px; font-size: 12px; transition: all 0.15s;
}
.aig-tmpl-load:hover { border-color: var(--gold-dim); color: var(--gold); }
.aig-tmpl-del:hover  { border-color: var(--red); color: var(--red); }
.aig-right-col { overflow-y: auto; position: relative; display: flex; flex-direction: column; }
.aig-loading-state {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 40px; gap: 16px;
}
@keyframes aig-orb-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.6), 0 0 30px rgba(250,204,21,0.2); transform: scale(1); }
  50%      { box-shadow: 0 0 0 20px rgba(250,204,21,0), 0 0 60px rgba(250,204,21,0.4); transform: scale(1.08); }
}
@keyframes aig-orb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.aig-loading-orb {
  width: 64px; height: 64px; border-radius: 50%; border: 3px solid transparent;
  border-top-color: var(--gold); border-right-color: rgba(250,204,21,0.4);
  animation: aig-orb-spin 1s linear infinite, aig-orb-pulse 2s ease-in-out infinite;
  background: radial-gradient(circle, rgba(250,204,21,0.12), transparent);
}
.aig-loading-text { font-family: var(--font-heading); font-size: 16px; color: var(--gold); letter-spacing: 1px; }
.aig-loading-sub  { font-size: 12px; color: var(--white-dim); }
.aig-error-state {
  padding: 24px; margin: 20px; background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.3); border-radius: 10px; color: var(--red);
  font-size: 13px; line-height: 1.6;
}
.aig-idle-state {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 40px 30px; text-align: center;
}
.aig-preview-content { padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }
.aig-world-banner {
  background: linear-gradient(135deg, rgba(250,204,21,0.08), rgba(196,150,30,0.05));
  border: 1px solid rgba(250,204,21,0.25); border-radius: 12px; padding: 16px; text-align: center;
}
.aig-world-name {
  font-family: var(--font-heading); font-size: 22px; color: var(--gold); letter-spacing: 2px; margin-bottom: 6px;
}
.aig-world-desc { font-size: 13px; color: var(--white-main); line-height: 1.6; margin-bottom: 6px; }
.aig-world-era  { font-size: 11px; color: var(--white-dim); }
.aig-section { display: flex; flex-direction: column; gap: 8px; }
.aig-section .aig-section-title { margin-bottom: 4px; }
.aig-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.aig-chip {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 20px;
  font-size: 11px; color: var(--white-main);
}
.aig-chip-faction { background: rgba(250,204,21,0.06); border-color: rgba(250,204,21,0.2); color: var(--gold-dim); }
.aig-race-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
.aig-race-card {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
}
.aig-race-name { font-size: 12px; font-weight: 700; color: var(--white-main); margin-bottom: 3px; }
.aig-race-desc { font-size: 10px; color: var(--white-dim); margin-bottom: 4px; line-height: 1.4; }
.aig-race-trait { font-size: 10px; color: var(--gold-dim); }
.aig-boss-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.aig-boss-card {
  background: rgba(248,113,113,0.04); border: 1px solid rgba(248,113,113,0.2);
  border-radius: 8px; padding: 10px;
}
.aig-boss-name  { font-size: 13px; font-weight: 700; color: var(--white-main); margin-bottom: 4px; }
.aig-boss-meta  { font-size: 10px; color: var(--red); margin-bottom: 3px; }
.aig-boss-skills { font-size: 10px; color: var(--white-dim); }
.aig-realm-list { display: flex; flex-direction: column; gap: 4px; }
.aig-realm-row {
  display: flex; align-items: center; gap: 10px; padding: 5px 10px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 6px; font-size: 12px;
}
.aig-realm-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(250,204,21,0.15); border: 1px solid rgba(250,204,21,0.3);
  color: var(--gold); font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.aig-realm-name { font-weight: 700; color: var(--gold); min-width: 100px; }
.aig-realm-desc { font-size: 11px; color: var(--white-dim); }
.aig-legend {
  padding: 8px 12px; background: rgba(96,165,250,0.05); border: 1px solid rgba(96,165,250,0.15);
  border-radius: 8px; font-size: 12px; color: var(--white-main); line-height: 1.6;
}
.aig-hist-row {
  display: flex; gap: 10px; align-items: baseline; padding: 6px 10px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border);
  border-left: 3px solid rgba(250,204,21,0.3); border-radius: 6px; font-size: 12px;
}
.aig-hist-year { font-size: 10px; color: var(--gold-dim); font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.aig-spawn-bar {
  position: sticky; bottom: 0; padding: 12px 18px; border-top: 1px solid var(--border);
  background: var(--bg-secondary); display: flex; align-items: center;
  justify-content: space-between; gap: 12px; flex-wrap: wrap; flex-shrink: 0;
}
.aig-spawn-note { font-size: 11px; color: var(--white-dim); }
.aig-spawn-btn {
  background: linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.1));
  border: 1px solid rgba(74,222,128,0.5); color: var(--jade);
  border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px; white-space: nowrap;
}
.aig-spawn-btn:hover {
  background: linear-gradient(135deg, rgba(74,222,128,0.35), rgba(74,222,128,0.2));
  transform: translateY(-2px); box-shadow: 0 6px 20px rgba(74,222,128,0.2);
}
  `;
  document.head.appendChild(style);
}

// Override setAigenUI to also handle idle
const _origSetAigenUI = setAigenUI;
setAigenUI = function(state, errMsg = "") {
  _origSetAigenUI(state, errMsg);
  const idle = document.getElementById("aigenIdle");
  if (idle) idle.style.display = (state === "idle") ? "flex" : "none";
};

// ============================
// INIT
// ============================

function initAIWorldGenerator() {
  aigenLoad();
  injectAIGeneratorButton();
  injectAIGeneratorDOM();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectAIGeneratorCSS();
    initAIWorldGenerator();
  });
} else {
  injectAIGeneratorCSS();
  initAIWorldGenerator();
}

// ============================
// API KEY MANAGEMENT
// ============================
function setAPIKey() {
  const current = localStorage.getItem("claude_api_key") || "";
  const hint = current ? `\nKey hiện tại: ${current.slice(0,10)}...` : "";
  const key = prompt(`🔑 Nhập Anthropic API Key của bạn:${hint}\n(Bắt đầu bằng 'sk-ant-...')\n\nĐể trống và nhấn OK để xóa key hiện tại.`);
  if (key === null) return; // cancelled
  if (key.trim() === "") {
    localStorage.removeItem("claude_api_key");
    window.CLAUDE_API_KEY = "";
    toast("🗑️ Đã xóa API Key");
  } else {
    localStorage.setItem("claude_api_key", key.trim());
    window.CLAUDE_API_KEY = key.trim();
    toast("✅ Đã lưu API Key thành công!");
  }
}
