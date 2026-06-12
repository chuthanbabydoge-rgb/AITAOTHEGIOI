/* ============================
   CREATOR GOD V6 — WORLD TEMPLATES
   worldTemplates.js
   Định nghĩa WORLD_TEMPLATES, getActiveTemplate(), và các hằng số còn thiếu
   ============================ */

"use strict";

// ============================
// MISSING CONSTANTS (referenced in app.js but never defined)
// ============================

const NAMES_FEMALE_DEFAULT = [
  "Tiêu Vân","Lưu Ly","Hàn Tuyết","Băng Nhi","Linh Nhi","Tử Yên","Bạch Liên",
  "Ngọc Thanh","Mộng Dao","Thiên Hương","Sương Nhi","Hoa Vũ","Kim Linh","Phượng Nhi",
  "Lạc Vân","Thủy Tiên","Yên Nhiên","Ngọc Nhi","Lam Nhi","Tuyết Nhi"
];

const FAMILIES_DEFAULT = [
  "Lâm","Tiêu","Long","Tần","Hàn","Diệp","Mặc","Đường","Vũ","Lý",
  "Trần","Dương","Phong","Bạch","Hắc","Thương","Hoa","Kim","Ngọc","Vân"
];

// ============================
// WORLD TEMPLATES
// ============================

const WORLD_TEMPLATES = {

  // ---- TU TIÊN (Cultivation) ----
  cultivation: {
    namesMale: [
      "Lâm Phàm","Tiêu Viêm","Long Hạo","Tần Phong","Vô Thiên","Kiếm Vô Song","Hàn Lập",
      "Vũ Hạo","Thiên Lang","Mặc Huyền","Lý Thiên","Trần Bình","Dương Khai","Phong Vũ",
      "Hắc Vũ","Hạc Vân","Bạch Vũ","Thương Thiên","Diệp Phàm","Long Thiên"
    ],
    namesFemale: [
      "Tiêu Vân","Lưu Ly","Hàn Tuyết","Băng Nhi","Linh Nhi","Tử Yên","Bạch Liên",
      "Ngọc Thanh","Mộng Dao","Thiên Hương","Sương Nhi","Hoa Vũ","Kim Linh","Phượng Nhi",
      "Lạc Vân","Thủy Tiên","Yên Nhiên","Ngọc Nhi","Lam Nhi","Tuyết Nhi"
    ],
    families: [
      "Lâm","Tiêu","Long","Tần","Hàn","Diệp","Mặc","Đường","Vũ","Lý",
      "Trần","Dương","Phong","Bạch","Hắc","Thương","Hoa","Kim","Ngọc","Vân"
    ],
    personalities: [
      "Kiêu Ngạo","Hiền Hòa","Lạnh Lùng","Nhiệt Huyết","Quỷ Quyệt",
      "Thành Thật","Tàn Nhẫn","Từ Bi","Bí Ẩn","Phóng Khoáng"
    ],
    goals: [
      "Thành Tiên","Báo Thù","Bảo Vệ Gia Tộc","Thống Nhất Thiên Hạ",
      "Tìm Kiếm Đạo Lữ","Lập Tông Môn","Giết Boss","Thu Thập Công Pháp","Tu Luyện Đỉnh Phong"
    ],
    cities: [
      "Thanh Vân Thành","Thiên Kiếm Thành","Long Uyên Thành","Huyền Vũ Thành",
      "Vạn Kiếm Thành","Băng Phong Thành","Hỏa Linh Thành","Lôi Ngục Thành"
    ],
    realms: [
      { name:"Luyện Khí",   exp:100,   breakthrough:0.70, tribulation:0.00, lifespanBonus:0,      hpBonus:50,    atkBonus:5,    defBonus:3   },
      { name:"Trúc Cơ",    exp:300,   breakthrough:0.55, tribulation:0.05, lifespanBonus:100,    hpBonus:100,   atkBonus:15,   defBonus:8   },
      { name:"Kim Đan",    exp:800,   breakthrough:0.40, tribulation:0.10, lifespanBonus:300,    hpBonus:200,   atkBonus:30,   defBonus:15  },
      { name:"Nguyên Anh", exp:2000,  breakthrough:0.30, tribulation:0.15, lifespanBonus:800,    hpBonus:400,   atkBonus:60,   defBonus:30  },
      { name:"Hóa Thần",   exp:5000,  breakthrough:0.20, tribulation:0.20, lifespanBonus:2000,   hpBonus:800,   atkBonus:120,  defBonus:60  },
      { name:"Luyện Hư",   exp:10000, breakthrough:0.15, tribulation:0.25, lifespanBonus:5000,   hpBonus:1500,  atkBonus:250,  defBonus:120 },
      { name:"Hợp Thể",    exp:25000, breakthrough:0.10, tribulation:0.30, lifespanBonus:10000,  hpBonus:3000,  atkBonus:500,  defBonus:250 },
      { name:"Đại Thừa",   exp:60000, breakthrough:0.06, tribulation:0.35, lifespanBonus:50000,  hpBonus:6000,  atkBonus:1000, defBonus:500 },
      { name:"Chân Tiên",  exp:Infinity, breakthrough:0, tribulation:0,   lifespanBonus:Infinity,hpBonus:15000, atkBonus:3000, defBonus:1500},
    ],
    factions: [
      { id:"s1", name:"Thanh Vân Tông",  founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800, treasury:5000,  territory:"🗻 Đông Vực",   level:3, warCooldown:0 },
      { id:"s2", name:"Thiên Kiếm Môn", founder:null, leader:null, elders:[], members:[], disciples:[], prestige:750, treasury:4000,  territory:"🗻 Đông Vực",   level:2, warCooldown:0 },
      { id:"s3", name:"Huyết Ma Tông",  founder:null, leader:null, elders:[], members:[], disciples:[], prestige:600, treasury:3500,  territory:"🌋 Tây Hoang",  level:2, warCooldown:0 },
      { id:"s4", name:"Vạn Thú Sơn",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:550, treasury:3000,  territory:"🌊 Nam Hải",    level:1, warCooldown:0 },
      { id:"s5", name:"Thiên Cơ Các",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:700, treasury:4500,  territory:"❄️ Bắc Nguyên", level:2, warCooldown:0 },
    ],
    countries: [
      { id:"c1", name:"Thiên Vũ Quốc",    population:500000, wealth:10000, army:50000, territory:"🗻 Đông Vực",   relations:{}, economy:5000,  military:50000, technology:3, culture:4, level:1, civHistory:[] },
      { id:"c2", name:"Đại Hạ Quốc",      population:600000, wealth:12000, army:60000, territory:"🌊 Nam Hải",    relations:{}, economy:7000,  military:60000, technology:4, culture:3, level:1, civHistory:[] },
      { id:"c3", name:"Thương Lan Quốc",   population:400000, wealth:8000,  army:40000, territory:"🌋 Tây Hoang", relations:{}, economy:3500,  military:40000, technology:2, culture:5, level:1, civHistory:[] },
      { id:"c4", name:"Huyền Thiên Quốc",  population:450000, wealth:9000,  army:45000, territory:"❄️ Bắc Nguyên",relations:{}, economy:4500,  military:45000, technology:5, culture:2, level:1, civHistory:[] },
    ],
    regions: [
      { id:"r1", name:"🗻 Đông Vực",    population:10000, danger:2, resources:{ lingshi:500, lingyao:200, xuantie:100, jingshi:50  }, baseResources:{ lingshi:500, lingyao:200, xuantie:100, jingshi:50  }, tier:"富庶" },
      { id:"r2", name:"🌋 Tây Hoang",   population:6000,  danger:5, resources:{ lingshi:200, lingyao:100, xuantie:400, jingshi:150 }, baseResources:{ lingshi:200, lingyao:100, xuantie:400, jingshi:150 }, tier:"荒野" },
      { id:"r3", name:"🌊 Nam Hải",     population:8000,  danger:3, resources:{ lingshi:350, lingyao:400, xuantie:150, jingshi:80  }, baseResources:{ lingshi:350, lingyao:400, xuantie:150, jingshi:80  }, tier:"富庶" },
      { id:"r4", name:"❄️ Bắc Nguyên", population:5000,  danger:4, resources:{ lingshi:300, lingyao:150, xuantie:200, jingshi:300 }, baseResources:{ lingshi:300, lingyao:150, xuantie:200, jingshi:300 }, tier:"荒野" },
    ],
    bosses: [
      { name:"🐉 Cửu U Ma Long",   realm:8, hp:50000, maxHp:50000, skills:["Cửu U Hắc Hỏa","Long Uy Hư Không"], rage:0, loot:["legendary","epic"] },
      { name:"☠️ Vạn Cốt Thần Ma", realm:7, hp:30000, maxHp:30000, skills:["Vạn Cốt Đại Trận","Tử Thần Liêm"],   rage:0, loot:["epic","rare"]      },
      { name:"🌋 Hỏa Ma Thần",     realm:6, hp:20000, maxHp:20000, skills:["Hỏa Hải Thiên Địa","Lửa Hủy Diệt"],  rage:0, loot:["epic","rare"]      },
      { name:"❄️ Băng Phong Thần", realm:5, hp:12000, maxHp:12000, skills:["Vạn Niên Băng Hà","Băng Phong Kiếm"],rage:0, loot:["rare","uncommon"]   },
    ],
  },

  // ---- FANTASY ----
  fantasy: {
    namesMale: [
      "Aldric","Thorian","Gareth","Leoric","Darian","Kael","Zephyr","Magnus",
      "Orion","Caelum","Dorian","Evander","Lucian","Theron","Varian","Alaric",
      "Cedric","Hadrian","Roan","Sylvian"
    ],
    namesFemale: [
      "Lyra","Seraphine","Elara","Zara","Mira","Thalia","Isolde","Vivienne",
      "Aria","Celia","Daphne","Eryn","Fiona","Gwyneth","Helena","Irene",
      "Jessamine","Kaela","Luna","Myra"
    ],
    families: [
      "Stoneheart","Ironwood","Brightblade","Moonwhisper","Shadowveil","Goldmantle",
      "Stormborn","Ashwood","Dragonkin","Silvermane","Nightshade","Sunforge",
      "Frostweave","Emberveil","Thornwood","Riverstone","Cloudwalker","Starfall",
      "Dawnbringer","Duskmantle"
    ],
    personalities: [
      "Noble","Cunning","Fierce","Wise","Reckless","Compassionate",
      "Ruthless","Mysterious","Jovial","Stoic"
    ],
    goals: [
      "Slay the Dragon","Reclaim the Throne","Find the Artifact","Break the Curse",
      "Protect the Kingdom","Master Magic","Forge an Alliance","Defeat the Demon Lord",
      "Discover Ancient Ruins"
    ],
    cities: [
      "Ironhaven","Silverkeep","Goldshire","Stormgard","Ashfield","Moonvale",
      "Brightspire","Shadowmere","Dawnport","Frostholm"
    ],
    realms: [
      { name:"Squire",      exp:100,   breakthrough:0.70, tribulation:0.00, lifespanBonus:0,     hpBonus:60,    atkBonus:8,    defBonus:5   },
      { name:"Knight",      exp:300,   breakthrough:0.55, tribulation:0.05, lifespanBonus:20,    hpBonus:150,   atkBonus:20,   defBonus:12  },
      { name:"Champion",    exp:800,   breakthrough:0.40, tribulation:0.10, lifespanBonus:50,    hpBonus:300,   atkBonus:40,   defBonus:20  },
      { name:"Hero",        exp:2000,  breakthrough:0.30, tribulation:0.15, lifespanBonus:100,   hpBonus:600,   atkBonus:80,   defBonus:40  },
      { name:"Legend",      exp:5000,  breakthrough:0.20, tribulation:0.20, lifespanBonus:200,   hpBonus:1200,  atkBonus:160,  defBonus:80  },
      { name:"Myth",        exp:10000, breakthrough:0.15, tribulation:0.25, lifespanBonus:500,   hpBonus:2500,  atkBonus:320,  defBonus:160 },
      { name:"Demigod",     exp:25000, breakthrough:0.10, tribulation:0.30, lifespanBonus:1000,  hpBonus:5000,  atkBonus:640,  defBonus:320 },
      { name:"Deity",       exp:60000, breakthrough:0.06, tribulation:0.35, lifespanBonus:5000,  hpBonus:10000, atkBonus:1200, defBonus:600 },
      { name:"Transcendent",exp:Infinity,breakthrough:0,  tribulation:0,   lifespanBonus:Infinity,hpBonus:20000,atkBonus:3000,defBonus:1500},
    ],
    factions: [
      { id:"s1", name:"Knights of Dawn",    founder:null, leader:null, elders:[], members:[], disciples:[], prestige:900, treasury:6000,  territory:"🗻 Đông Vực",   level:3, warCooldown:0 },
      { id:"s2", name:"Mages Guild",         founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800, treasury:5000,  territory:"🌊 Nam Hải",    level:2, warCooldown:0 },
      { id:"s3", name:"Thieves Brotherhood", founder:null, leader:null, elders:[], members:[], disciples:[], prestige:500, treasury:4000,  territory:"🌋 Tây Hoang",  level:2, warCooldown:0 },
      { id:"s4", name:"Druid Circle",        founder:null, leader:null, elders:[], members:[], disciples:[], prestige:650, treasury:3500,  territory:"❄️ Bắc Nguyên", level:1, warCooldown:0 },
      { id:"s5", name:"Dark Conclave",       founder:null, leader:null, elders:[], members:[], disciples:[], prestige:700, treasury:5500,  territory:"🌋 Tây Hoang",  level:2, warCooldown:0 },
    ],
    countries: [
      { id:"c1", name:"Kingdom of Aurum",   population:500000, wealth:10000, army:50000, territory:"🗻 Đông Vực",   relations:{}, economy:5000,  military:50000, technology:3, culture:4, level:1, civHistory:[] },
      { id:"c2", name:"Elvish Dominion",    population:300000, wealth:15000, army:30000, territory:"🌊 Nam Hải",    relations:{}, economy:8000,  military:30000, technology:5, culture:5, level:1, civHistory:[] },
      { id:"c3", name:"Dwarven Holds",      population:200000, wealth:20000, army:40000, territory:"🌋 Tây Hoang",  relations:{}, economy:12000, military:40000, technology:5, culture:2, level:1, civHistory:[] },
      { id:"c4", name:"Orcish Clans",       population:400000, wealth:5000,  army:70000, territory:"❄️ Bắc Nguyên", relations:{}, economy:3000,  military:70000, technology:1, culture:2, level:1, civHistory:[] },
    ],
    regions: [
      { id:"r1", name:"🗻 Đông Vực",    population:10000, danger:2, resources:{ lingshi:400, lingyao:300, xuantie:200, jingshi:100 }, baseResources:{ lingshi:400, lingyao:300, xuantie:200, jingshi:100 }, tier:"富庶" },
      { id:"r2", name:"🌋 Tây Hoang",   population:5000,  danger:5, resources:{ lingshi:150, lingyao:100, xuantie:500, jingshi:200 }, baseResources:{ lingshi:150, lingyao:100, xuantie:500, jingshi:200 }, tier:"荒野" },
      { id:"r3", name:"🌊 Nam Hải",     population:7000,  danger:3, resources:{ lingshi:300, lingyao:500, xuantie:100, jingshi:80  }, baseResources:{ lingshi:300, lingyao:500, xuantie:100, jingshi:80  }, tier:"富庶" },
      { id:"r4", name:"❄️ Bắc Nguyên", population:4000,  danger:4, resources:{ lingshi:200, lingyao:100, xuantie:300, jingshi:400 }, baseResources:{ lingshi:200, lingyao:100, xuantie:300, jingshi:400 }, tier:"荒野" },
    ],
    bosses: [
      { name:"🐉 Ancient Dragon",       realm:8, hp:60000, maxHp:60000, skills:["Dragon Breath","Wing Buffet"],        rage:0, loot:["legendary","epic"] },
      { name:"💀 Lich King",             realm:7, hp:35000, maxHp:35000, skills:["Death Coil","Army of the Dead"],      rage:0, loot:["epic","rare"]      },
      { name:"👹 Demon Prince",          realm:6, hp:25000, maxHp:25000, skills:["Hellfire","Chaos Strike"],            rage:0, loot:["epic","rare"]      },
      { name:"🧟 Undead Giant",          realm:5, hp:15000, maxHp:15000, skills:["Ground Smash","Decay Aura"],          rage:0, loot:["rare","uncommon"]  },
    ],
  },

  // ---- ZOMBIE (Post-Apocalypse) ----
  zombie: {
    namesMale: [
      "Rex","Kane","Dex","Zane","Marco","Rook","Axel","Colt","Drake","Finn",
      "Grim","Hugo","Ivan","Jake","Leon","Max","Nash","Oscar","Pax","Quinn"
    ],
    namesFemale: [
      "Raven","Sasha","Vex","Nyx","Blair","Cass","Dani","Eden","Faye","Gray",
      "Hana","Iris","Jade","Kira","Luna","Maya","Nova","Ora","Piper","Quinn"
    ],
    families: [
      "Cross","Stone","Blake","Reeve","Hunt","Cole","Fox","Ward","Burns","Nash",
      "Grant","Hart","Holt","Reed","Shaw","Wade","Wolf","York","Zane","Ash"
    ],
    personalities: [
      "Ruthless","Pragmatic","Paranoid","Loyal","Reckless","Cunning",
      "Hopeful","Cold","Aggressive","Calm"
    ],
    goals: [
      "Find Safe Zone","Eliminate Zombie Horde","Rescue Survivors","Build Shelter",
      "Gather Medicine","Dominate Territory","Find a Cure","Escape the City",
      "Protect Family"
    ],
    cities: [
      "Deadfall","Greyport","Ashwick","Ruinvale","Dusthaven","Wreckshore",
      "Ironwall","Crestfall","Blackmoor","Scraptown"
    ],
    realms: [
      { name:"Survivor",    exp:100,   breakthrough:0.70, tribulation:0.00, lifespanBonus:0,    hpBonus:80,   atkBonus:10,  defBonus:5   },
      { name:"Fighter",     exp:300,   breakthrough:0.55, tribulation:0.05, lifespanBonus:0,    hpBonus:200,  atkBonus:25,  defBonus:15  },
      { name:"Raider",      exp:800,   breakthrough:0.40, tribulation:0.10, lifespanBonus:0,    hpBonus:400,  atkBonus:50,  defBonus:25  },
      { name:"Mutant",      exp:2000,  breakthrough:0.30, tribulation:0.15, lifespanBonus:100,  hpBonus:800,  atkBonus:100, defBonus:50  },
      { name:"Enhanced",    exp:5000,  breakthrough:0.20, tribulation:0.20, lifespanBonus:200,  hpBonus:1500, atkBonus:200, defBonus:100 },
      { name:"Super",       exp:10000, breakthrough:0.15, tribulation:0.25, lifespanBonus:500,  hpBonus:3000, atkBonus:400, defBonus:200 },
      { name:"Apex",        exp:25000, breakthrough:0.10, tribulation:0.30, lifespanBonus:1000, hpBonus:6000, atkBonus:800, defBonus:400 },
      { name:"Evolved",     exp:60000, breakthrough:0.06, tribulation:0.35, lifespanBonus:2000, hpBonus:12000,atkBonus:1500,defBonus:750 },
      { name:"Post-Human",  exp:Infinity,breakthrough:0,  tribulation:0,   lifespanBonus:Infinity,hpBonus:25000,atkBonus:4000,defBonus:2000},
    ],
    factions: [
      { id:"s1", name:"Ironwall Militia",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800, treasury:5000,  territory:"🗻 Đông Vực",   level:3, warCooldown:0 },
      { id:"s2", name:"Scavenger Guild",    founder:null, leader:null, elders:[], members:[], disciples:[], prestige:600, treasury:3000,  territory:"🌋 Tây Hoang",  level:2, warCooldown:0 },
      { id:"s3", name:"Bloodhound Raiders", founder:null, leader:null, elders:[], members:[], disciples:[], prestige:700, treasury:4000,  territory:"🌊 Nam Hải",    level:2, warCooldown:0 },
      { id:"s4", name:"Last Hope Colony",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:900, treasury:6000,  territory:"❄️ Bắc Nguyên", level:3, warCooldown:0 },
      { id:"s5", name:"Mutant Brotherhood", founder:null, leader:null, elders:[], members:[], disciples:[], prestige:500, treasury:2500,  territory:"🌋 Tây Hoang",  level:1, warCooldown:0 },
    ],
    countries: [
      { id:"c1", name:"Fort Ironwall",   population:20000,  wealth:8000,  army:5000,  territory:"🗻 Đông Vực",   relations:{}, economy:3000,  military:5000,  technology:4, culture:2, level:1, civHistory:[] },
      { id:"c2", name:"Deadzone Alpha",  population:5000,   wealth:3000,  army:2000,  territory:"🌊 Nam Hải",    relations:{}, economy:1500,  military:2000,  technology:2, culture:1, level:1, civHistory:[] },
      { id:"c3", name:"Ruinvale Camp",   population:8000,   wealth:4000,  army:3000,  territory:"🌋 Tây Hoang",  relations:{}, economy:2000,  military:3000,  technology:3, culture:1, level:1, civHistory:[] },
      { id:"c4", name:"Arctic Refuge",   population:3000,   wealth:6000,  army:1500,  territory:"❄️ Bắc Nguyên", relations:{}, economy:4000,  military:1500,  technology:5, culture:3, level:1, civHistory:[] },
    ],
    regions: [
      { id:"r1", name:"🗻 Đông Vực",    population:20000, danger:3, resources:{ lingshi:300, lingyao:400, xuantie:300, jingshi:100 }, baseResources:{ lingshi:300, lingyao:400, xuantie:300, jingshi:100 }, tier:"富庶" },
      { id:"r2", name:"🌋 Tây Hoang",   population:5000,  danger:7, resources:{ lingshi:100, lingyao:200, xuantie:600, jingshi:200 }, baseResources:{ lingshi:100, lingyao:200, xuantie:600, jingshi:200 }, tier:"荒野" },
      { id:"r3", name:"🌊 Nam Hải",     population:10000, danger:4, resources:{ lingshi:200, lingyao:500, xuantie:200, jingshi:150 }, baseResources:{ lingshi:200, lingyao:500, xuantie:200, jingshi:150 }, tier:"富庶" },
      { id:"r4", name:"❄️ Bắc Nguyên", population:3000,  danger:5, resources:{ lingshi:150, lingyao:100, xuantie:400, jingshi:500 }, baseResources:{ lingshi:150, lingyao:100, xuantie:400, jingshi:500 }, tier:"荒野" },
    ],
    bosses: [
      { name:"🧟 Zombie Titan",         realm:8, hp:70000, maxHp:70000, skills:["Decay Wave","Infection Burst"],      rage:0, loot:["legendary","epic"] },
      { name:"☣️ Plague Alpha",          realm:7, hp:40000, maxHp:40000, skills:["Toxic Cloud","Mutagen Surge"],       rage:0, loot:["epic","rare"]      },
      { name:"💀 Mutant Behemoth",       realm:6, hp:28000, maxHp:28000, skills:["Shockwave","Bone Crush"],            rage:0, loot:["epic","rare"]      },
      { name:"🔥 Irradiated Hulk",       realm:5, hp:16000, maxHp:16000, skills:["Radiation Pulse","Smash"],           rage:0, loot:["rare","uncommon"]  },
    ],
  },

  // ---- MYTHOLOGY (Thần Thoại) ----
  mythology: {
    namesMale: [
      "Triệu Tử","Hắc Đế","Thần Vương","Thiên Đế","Long Thần","Hải Thần","Chiến Thần",
      "Lôi Thần","Phong Thần","Hỏa Thần","Ác Ma","Tiên Đế","Phật Tổ","Ngọc Hoàng",
      "Diêm Vương","Mộc Thần","Thổ Thần","Thủy Thần","Kim Thần","Nhật Thần"
    ],
    namesFemale: [
      "Thiên Hậu","Hằng Nga","Quan Âm","Tây Vương Mẫu","Nữ Thần","Hoa Thần",
      "Nguyệt Thần","Tinh Thần","Băng Thần","Lôi Thần Nữ","Phong Thần Nữ","Hỏa Thần Nữ",
      "Thủy Thần Nữ","Địa Mẫu","Tiên Nữ","Vũ Thần","Nhạc Thần","Văn Thần","Võ Thần","Ái Thần"
    ],
    families: [
      "Thiên","Địa","Nhân","Thần","Tiên","Ma","Quỷ","Long","Phượng","Lân",
      "Hổ","Ưng","Hạc","Quy","Xà","Ngưu","Mã","Dương","Heo","Chuột"
    ],
    personalities: [
      "Thần Thánh","Từ Bi","Uy Nghiêm","Phóng Túng","Tàn Nhẫn","Bí Ẩn",
      "Nhiệt Huyết","Kiêu Ngạo","Vô Tình","Nhân Từ"
    ],
    goals: [
      "Thống Trị Tam Giới","Đăng Tiên","Trở Thành Thần","Báo Thù Thiên Đình",
      "Bảo Vệ Hạ Giới","Thu Phục Yêu Ma","Khai Thiên Tịch Địa","Tìm Kiếm Thần Khí",
      "Phá Thủ Thiên Luật"
    ],
    cities: [
      "Thiên Đình","Long Cung","Địa Phủ","Linh Sơn","Côn Lôn","Bồng Lai",
      "Phù Tang","Nhược Thủy","Tam Đảo","Tứ Hải"
    ],
    realms: [
      { name:"Phàm Nhân",    exp:100,    breakthrough:0.70, tribulation:0.00, lifespanBonus:0,       hpBonus:50,    atkBonus:5,    defBonus:3   },
      { name:"Tiên Nhân",    exp:500,    breakthrough:0.55, tribulation:0.05, lifespanBonus:500,     hpBonus:200,   atkBonus:30,   defBonus:15  },
      { name:"Địa Tiên",     exp:2000,   breakthrough:0.40, tribulation:0.10, lifespanBonus:2000,    hpBonus:500,   atkBonus:80,   defBonus:40  },
      { name:"Thiên Tiên",   exp:8000,   breakthrough:0.30, tribulation:0.15, lifespanBonus:10000,   hpBonus:1200,  atkBonus:200,  defBonus:100 },
      { name:"Kim Tiên",     exp:30000,  breakthrough:0.20, tribulation:0.20, lifespanBonus:50000,   hpBonus:3000,  atkBonus:500,  defBonus:250 },
      { name:"Đại La Tiên",  exp:100000, breakthrough:0.15, tribulation:0.25, lifespanBonus:100000,  hpBonus:8000,  atkBonus:1200, defBonus:600 },
      { name:"Thần Linh",    exp:300000, breakthrough:0.10, tribulation:0.30, lifespanBonus:500000,  hpBonus:20000, atkBonus:3000, defBonus:1500},
      { name:"Thượng Thần",  exp:1000000,breakthrough:0.06, tribulation:0.35, lifespanBonus:1000000, hpBonus:50000, atkBonus:8000, defBonus:4000},
      { name:"Hỗn Độn Thần", exp:Infinity,breakthrough:0,   tribulation:0,   lifespanBonus:Infinity, hpBonus:200000,atkBonus:30000,defBonus:15000},
    ],
    factions: [
      { id:"s1", name:"Thiên Đình",      founder:null, leader:null, elders:[], members:[], disciples:[], prestige:1000, treasury:99999, territory:"🗻 Đông Vực",   level:5, warCooldown:0 },
      { id:"s2", name:"Phật Môn",        founder:null, leader:null, elders:[], members:[], disciples:[], prestige:950,  treasury:80000, territory:"🌊 Nam Hải",    level:4, warCooldown:0 },
      { id:"s3", name:"Ma Cung",         founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800,  treasury:60000, territory:"🌋 Tây Hoang",  level:3, warCooldown:0 },
      { id:"s4", name:"Long Tộc",        founder:null, leader:null, elders:[], members:[], disciples:[], prestige:900,  treasury:70000, territory:"🌊 Nam Hải",    level:4, warCooldown:0 },
      { id:"s5", name:"Yêu Tộc Liên Minh",founder:null,leader:null, elders:[], members:[], disciples:[], prestige:700,  treasury:50000, territory:"❄️ Bắc Nguyên", level:3, warCooldown:0 },
    ],
    countries: [
      { id:"c1", name:"Thiên Giới",   population:1000000, wealth:99999, army:100000, territory:"🗻 Đông Vực",   relations:{}, economy:50000, military:100000, technology:5, culture:5, level:1, civHistory:[] },
      { id:"c2", name:"Nhân Giới",    population:800000,  wealth:20000, army:60000,  territory:"🌊 Nam Hải",    relations:{}, economy:10000, military:60000,  technology:3, culture:4, level:1, civHistory:[] },
      { id:"c3", name:"Ma Giới",      population:500000,  wealth:40000, army:80000,  territory:"🌋 Tây Hoang",  relations:{}, economy:20000, military:80000,  technology:4, culture:2, level:1, civHistory:[] },
      { id:"c4", name:"Âm Giới",      population:300000,  wealth:30000, army:50000,  territory:"❄️ Bắc Nguyên", relations:{}, economy:15000, military:50000,  technology:3, culture:3, level:1, civHistory:[] },
    ],
    regions: [
      { id:"r1", name:"🗻 Đông Vực",    population:50000, danger:3, resources:{ lingshi:1000, lingyao:500, xuantie:200, jingshi:500  }, baseResources:{ lingshi:1000, lingyao:500, xuantie:200, jingshi:500  }, tier:"富庶" },
      { id:"r2", name:"🌋 Tây Hoang",   population:20000, danger:7, resources:{ lingshi:300,  lingyao:200, xuantie:800, jingshi:1000 }, baseResources:{ lingshi:300,  lingyao:200, xuantie:800, jingshi:1000 }, tier:"荒野" },
      { id:"r3", name:"🌊 Nam Hải",     population:30000, danger:4, resources:{ lingshi:600,  lingyao:800, xuantie:300, jingshi:300  }, baseResources:{ lingshi:600,  lingyao:800, xuantie:300, jingshi:300  }, tier:"富庶" },
      { id:"r4", name:"❄️ Bắc Nguyên", population:10000, danger:6, resources:{ lingshi:500,  lingyao:300, xuantie:500, jingshi:800  }, baseResources:{ lingshi:500,  lingyao:300, xuantie:500, jingshi:800  }, tier:"荒野" },
    ],
    bosses: [
      { name:"😈 Hỗn Độn Ma Thần",  realm:8, hp:100000, maxHp:100000, skills:["Hỗn Độn Lôi","Hư Vô Lệ"],        rage:0, loot:["legendary","epic"] },
      { name:"🔱 Ác Long Thần Vương",realm:7, hp:60000,  maxHp:60000,  skills:["Thiên Long Phá","Long Uy"],       rage:0, loot:["epic","rare"]      },
      { name:"💀 Địa Phủ Minh Vương", realm:6, hp:40000,  maxHp:40000,  skills:["Âm Hồn Triệu Hoán","Tử Khí"],   rage:0, loot:["epic","rare"]      },
      { name:"🌋 Thái Cổ Yêu Thần",  realm:5, hp:25000,  maxHp:25000,  skills:["Yêu Hỏa","Cổ Yêu Pháp"],        rage:0, loot:["rare","uncommon"]  },
    ],
  },

  // ---- SCI-FI ----
  scifi: {
    namesMale: [
      "Zephyr-7","Axon","Rho","Kaelen","Drex","Voss","Niko","Orin","Ryker","Zane",
      "Caden","Dax","Echo","Flux","Galen","Halo","Ion","Jett","Kron","Lyric"
    ],
    namesFemale: [
      "Nova","Lyra","Vega","Astra","Pix","Zara","Kira","Nyx","Rho","Sera",
      "Aria","Blaze","Cyan","Dara","Echo","Flux","Gaia","Hana","Iris","Juni"
    ],
    families: [
      "Nexus","Vortex","Axiom","Cipher","Zenith","Praxis","Helix","Quasar","Photon","Vector",
      "Matrix","Sigma","Delta","Omega","Alpha","Beta","Gamma","Theta","Lambda","Kappa"
    ],
    personalities: [
      "Logical","Aggressive","Tactical","Empathic","Cold","Innovative",
      "Reckless","Calculated","Curious","Militant"
    ],
    goals: [
      "Conquer Galaxy","Find Alien Life","Upgrade to Cyborg","Destroy Rival Fleet",
      "Discover Dark Matter","Build Megastructure","Overthrow AI Overlord",
      "Colonize New World","Achieve Singularity"
    ],
    cities: [
      "Nexus Prime","Orbital-7","Voidgate","Sector Zero","Helix Station","Arc City",
      "Nova Hub","Quantum Base","Stellar Port","Iron Citadel"
    ],
    realms: [
      { name:"Initiate",    exp:100,    breakthrough:0.70, tribulation:0.00, lifespanBonus:0,     hpBonus:80,    atkBonus:10,   defBonus:5   },
      { name:"Operative",   exp:400,    breakthrough:0.55, tribulation:0.05, lifespanBonus:10,    hpBonus:200,   atkBonus:30,   defBonus:15  },
      { name:"Specialist",  exp:1200,   breakthrough:0.40, tribulation:0.10, lifespanBonus:30,    hpBonus:450,   atkBonus:70,   defBonus:35  },
      { name:"Elite",       exp:3000,   breakthrough:0.30, tribulation:0.15, lifespanBonus:80,    hpBonus:900,   atkBonus:150,  defBonus:75  },
      { name:"Cyber-Evolved",exp:8000,  breakthrough:0.20, tribulation:0.20, lifespanBonus:200,   hpBonus:2000,  atkBonus:350,  defBonus:175 },
      { name:"Augmented",   exp:20000,  breakthrough:0.15, tribulation:0.25, lifespanBonus:500,   hpBonus:4500,  atkBonus:750,  defBonus:375 },
      { name:"Transhuman",  exp:60000,  breakthrough:0.10, tribulation:0.30, lifespanBonus:2000,  hpBonus:10000, atkBonus:1500, defBonus:750 },
      { name:"Singularity", exp:200000, breakthrough:0.06, tribulation:0.35, lifespanBonus:10000, hpBonus:25000, atkBonus:4000, defBonus:2000},
      { name:"Omniscient",  exp:Infinity,breakthrough:0,   tribulation:0,   lifespanBonus:Infinity,hpBonus:80000,atkBonus:15000,defBonus:7500},
    ],
    factions: [
      { id:"s1", name:"Galactic Union",    founder:null, leader:null, elders:[], members:[], disciples:[], prestige:900, treasury:99999, territory:"🗻 Đông Vực",   level:4, warCooldown:0 },
      { id:"s2", name:"AI Collective",     founder:null, leader:null, elders:[], members:[], disciples:[], prestige:850, treasury:80000, territory:"🌊 Nam Hải",    level:3, warCooldown:0 },
      { id:"s3", name:"Pirate Syndicate",  founder:null, leader:null, elders:[], members:[], disciples:[], prestige:600, treasury:40000, territory:"🌋 Tây Hoang",  level:2, warCooldown:0 },
      { id:"s4", name:"Rebel Alliance",    founder:null, leader:null, elders:[], members:[], disciples:[], prestige:750, treasury:55000, territory:"❄️ Bắc Nguyên", level:3, warCooldown:0 },
      { id:"s5", name:"Cybercorp Nexus",   founder:null, leader:null, elders:[], members:[], disciples:[], prestige:800, treasury:70000, territory:"🗻 Đông Vực",   level:3, warCooldown:0 },
    ],
    countries: [
      { id:"c1", name:"Terran Republic",   population:2000000, wealth:50000, army:200000, territory:"🗻 Đông Vực",   relations:{}, economy:40000, military:200000, technology:5, culture:3, level:1, civHistory:[] },
      { id:"c2", name:"Zorg Hive",         population:1500000, wealth:30000, army:300000, territory:"🌊 Nam Hải",    relations:{}, economy:20000, military:300000, technology:4, culture:1, level:1, civHistory:[] },
      { id:"c3", name:"Free Colonies",     population:500000,  wealth:25000, army:80000,  territory:"🌋 Tây Hoang",  relations:{}, economy:15000, military:80000,  technology:5, culture:4, level:1, civHistory:[] },
      { id:"c4", name:"Cryo Dominion",     population:300000,  wealth:60000, army:50000,  territory:"❄️ Bắc Nguyên", relations:{}, economy:45000, military:50000,  technology:5, culture:5, level:1, civHistory:[] },
    ],
    regions: [
      { id:"r1", name:"🗻 Đông Vực",    population:200000, danger:3, resources:{ lingshi:800,  lingyao:200, xuantie:600, jingshi:400  }, baseResources:{ lingshi:800,  lingyao:200, xuantie:600, jingshi:400  }, tier:"富庶" },
      { id:"r2", name:"🌋 Tây Hoang",   population:50000,  danger:6, resources:{ lingshi:200,  lingyao:100, xuantie:900, jingshi:800  }, baseResources:{ lingshi:200,  lingyao:100, xuantie:900, jingshi:800  }, tier:"荒野" },
      { id:"r3", name:"🌊 Nam Hải",     population:100000, danger:4, resources:{ lingshi:500,  lingyao:600, xuantie:300, jingshi:300  }, baseResources:{ lingshi:500,  lingyao:600, xuantie:300, jingshi:300  }, tier:"富庶" },
      { id:"r4", name:"❄️ Bắc Nguyên", population:30000,  danger:5, resources:{ lingshi:300,  lingyao:100, xuantie:500, jingshi:1000 }, baseResources:{ lingshi:300,  lingyao:100, xuantie:500, jingshi:1000 }, tier:"荒野" },
    ],
    bosses: [
      { name:"🤖 Omega AI Overlord",    realm:8, hp:80000,  maxHp:80000,  skills:["System Purge","Laser Barrage"],   rage:0, loot:["legendary","epic"] },
      { name:"👾 Alien Leviathan",       realm:7, hp:50000,  maxHp:50000,  skills:["Psionic Blast","Void Rift"],      rage:0, loot:["epic","rare"]      },
      { name:"💣 Rogue Titan Mech",      realm:6, hp:35000,  maxHp:35000,  skills:["Nuke Strike","Mech Slam"],        rage:0, loot:["epic","rare"]      },
      { name:"☢️ Irradiated Colossus",   realm:5, hp:20000,  maxHp:20000,  skills:["Radiation Wave","Core Blast"],    rage:0, loot:["rare","uncommon"]  },
    ],
  },
};

// ============================
// getActiveTemplate — used by app.js accessor functions
// ============================

function getActiveTemplate() {
  // world is declared in app.js as a global let
  if (typeof world === "undefined" || !world || !world.templateKey) return null;
  return WORLD_TEMPLATES[world.templateKey] || WORLD_TEMPLATES.cultivation;
}

// Helper used in multiWorldSystem.js migration
function getTemplateKey(genre) {
  const map = {
    "Tu Tiên":      "cultivation",
    "Huyền Huyễn":  "fantasy",
    "Zombie":       "zombie",
    "Thần Thoại":   "mythology",
    "Sci-Fi":       "scifi",
  };
  return map[genre] || "cultivation";
}
