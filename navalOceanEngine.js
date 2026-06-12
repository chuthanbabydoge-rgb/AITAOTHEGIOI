// ============================================================
// NAVAL & OCEAN ENGINE V1
// CREATOR GOD — Đại Dương & Hải Quân Hệ Thống
// Vùng biển · Hạm đội · Hải chiến · Hải tặc · Quái vật biển
// Tuyến thương mại biển · Đảo bí ẩn · Thần Hải sự kiện
// ============================================================

const OE_SAVE_KEY = "cgv6_naval_ocean";
const OE_VERSION  = 1;

// ── VÙNG BIỂN (6 zones) ─────────────────────────────────────
const OE_ZONES = {
  dong_hai: {
    id: "dong_hai", name: "Đông Hải", icon: "🌊",
    color: "#60a5fa", danger: 1, richness: 3,
    climate: "Ôn Hòa", desc: "Vùng biển phía đông, ngư trường phong phú, thương thuyền tấp nập.",
    monsters: ["Hải Xà Vương","Kình Ngư Cổ"],
    events: ["phong_ba","tai_bao","dai_ca","phat_hien_dao"],
    tradeBonus: 25, fishBonus: 30, pirateRate: 0.15,
  },
  nam_minh: {
    id: "nam_minh", name: "Nam Minh Đại Hải", icon: "🏝️",
    color: "#4ade80", danger: 2, richness: 5,
    climate: "Nhiệt Đới", desc: "Biển phía nam ấm áp, hàng ngàn đảo san hô, thiên đường thương mại.",
    monsters: ["Hải Long Vương","Ngư Thần"],
    events: ["thuong_mai_lon","dao_bau","bien_sac","phat_hien_dao"],
    tradeBonus: 50, fishBonus: 20, pirateRate: 0.25,
  },
  tay_duong: {
    id: "tay_duong", name: "Tây Dương Đại Hải", icon: "⚡",
    color: "#f97316", danger: 4, richness: 4,
    climate: "Cuồng Phong", desc: "Vùng biển tây bão tố. Hải tặc hoành hành, vô số kho báu ẩn chứa.",
    monsters: ["Phong Thần Hải Quái","Mộc Thuyền Quái"],
    events: ["bao_to","hai_tac_raid","kho_bau","cuong_phong"],
    tradeBonus: 35, fishBonus: 15, pirateRate: 0.45,
  },
  bac_bang: {
    id: "bac_bang", name: "Bắc Băng Dương", icon: "❄️",
    color: "#a5f3fc", danger: 5, richness: 2,
    climate: "Băng Giá", desc: "Đại dương băng tuyết phương bắc. Hiếm người dám đến, ẩn giấu bí ẩn thiên cổ.",
    monsters: ["Băng Long Hải Thần","Cổ Thần Tiên"],
    events: ["bang_tan","quai_vat_thuc_giac","bau_vat_bang","kho_tien"],
    tradeBonus: 10, fishBonus: 10, pirateRate: 0.05,
  },
  hac_vuc: {
    id: "hac_vuc", name: "Hắc Vực Hải", icon: "🌑",
    color: "#818cf8", danger: 7, richness: 6,
    climate: "Hắc Ám", desc: "Vùng biển đen tối kỳ bí. Ngay cả thần tiên cũng e dè khu vực này.",
    monsters: ["Ma Hải Chí Tôn","Thâm Uyên Cổ Thần","Diêm La Hải Vương"],
    events: ["ma_khoi","dia_nguc_mo","than_bi_xuat_hien","the_gioi_ngam"],
    tradeBonus: 5, fishBonus: 5, pirateRate: 0.1,
  },
  tien_dao: {
    id: "tien_dao", name: "Tiên Đảo Hải Vực", icon: "✨",
    color: "#fbbf24", danger: 3, richness: 8,
    climate: "Tiên Cảnh", desc: "Vùng biển thần tiên với đảo phúc địa. Nơi tu sĩ đến tìm pháp bảo và linh thảo.",
    monsters: ["Tiên Ngư Đại Thần","Bạch Trạch"],
    events: ["tien_linh_xuat_hien","phap_bao_phat_hien","tu_luyen_co_diem","tien_nhan_giang_the"],
    tradeBonus: 15, fishBonus: 50, pirateRate: 0.08,
  },
};

// ── LOẠI THUYỀN ─────────────────────────────────────────────
const OE_SHIP_TYPES = {
  ngu_thuyen: {
    id: "ngu_thuyen", name: "Ngư Thuyền", icon: "🎣",
    cost: 50, upkeep: 5,
    attack: 1, defense: 2, speed: 3, capacity: 10,
    fishPower: 30, tradePower: 5, warPower: 2,
    desc: "Thuyền đánh cá nhỏ. Rẻ, sản xuất lương thực tốt.",
    color: "#4ade80",
  },
  thuong_thuyen: {
    id: "thuong_thuyen", name: "Thương Thuyền", icon: "⛵",
    cost: 150, upkeep: 12,
    attack: 3, defense: 5, speed: 5, capacity: 50,
    fishPower: 10, tradePower: 60, warPower: 5,
    desc: "Thuyền buôn lớn. Chở hàng hoá, mở tuyến thương mại.",
    color: "#fbbf24",
  },
  chien_ham: {
    id: "chien_ham", name: "Chiến Hạm", icon: "⚓",
    cost: 400, upkeep: 35,
    attack: 30, defense: 25, speed: 4, capacity: 20,
    fishPower: 0, tradePower: 10, warPower: 60,
    desc: "Chiến hạm hùng mạnh. Xương sống của hải quân.",
    color: "#f87171",
  },
  hai_tac_thuyen: {
    id: "hai_tac_thuyen", name: "Thuyền Hải Tặc", icon: "☠️",
    cost: 200, upkeep: 18,
    attack: 20, defense: 15, speed: 8, capacity: 30,
    fishPower: 5, tradePower: 25, warPower: 35,
    desc: "Thuyền hải tặc nhanh nhẹn. Cướp biển và tập kích.",
    color: "#f97316",
  },
  tien_thuyen: {
    id: "tien_thuyen", name: "Tiên Thuyền", icon: "🌟",
    cost: 2000, upkeep: 80,
    attack: 100, defense: 80, speed: 12, capacity: 100,
    fishPower: 40, tradePower: 80, warPower: 120,
    desc: "Thuyền tiên dệt bằng gỗ Thiên Ngân. Trên cả thần binh.",
    color: "#c084fc",
  },
};

// ── SỰ KIỆN ĐẠI DƯƠNG ───────────────────────────────────────
const OE_EVENTS = {
  phong_ba:             { name:"Phong Ba Bão Táp",        icon:"🌪️", type:"disaster",   desc:"Bão lớn ập đến, hạm đội chịu tổn thất." },
  tai_bao:              { name:"Thủy Triều Dâng Cao",     icon:"🌊", type:"disaster",   desc:"Thủy triều bất thường, cảng bị ngập." },
  dai_ca:               { name:"Đàn Cá Khổng Lồ",        icon:"🐋", type:"fortune",    desc:"Đàn cá voi xuất hiện, ngư dân trúng đậm." },
  phat_hien_dao:        { name:"Phát Hiện Đảo Bí Ẩn",    icon:"🏝️", type:"discovery",  desc:"Một hòn đảo chưa từng trên bản đồ được tìm ra." },
  thuong_mai_lon:       { name:"Đoàn Thương Thuyền Lớn",  icon:"⛵", type:"fortune",    desc:"Đoàn thuyền buôn từ phương xa cập bến." },
  dao_bau:              { name:"Đảo Kho Báu",             icon:"💰", type:"discovery",  desc:"Kho báu cổ đại được khai quật trên đảo hoang." },
  bien_sac:             { name:"Biển Sắc Linh Khí",       icon:"✨", type:"mystical",   desc:"Linh khí biển cả bùng phát, tu sĩ được hưởng lợi." },
  bao_to:               { name:"Đại Bão Tây Dương",       icon:"⛈️", type:"disaster",   desc:"Cơn bão thế kỷ quét qua Tây Dương." },
  hai_tac_raid:         { name:"Hải Tặc Tấn Công",        icon:"☠️", type:"raid",       desc:"Đội hải tặc đột kích thương cảng." },
  kho_bau:              { name:"Kho Báu Hải Tặc",         icon:"🗺️", type:"discovery",  desc:"Bản đồ kho báu hải tặc rơi vào tay người." },
  cuong_phong:          { name:"Cuồng Phong Tây Hải",     icon:"🌬️", type:"disaster",   desc:"Gió tây cuồng nộ, thuyền không thể ra khơi." },
  bang_tan:             { name:"Băng Tan Lộ Bí Ảnh",     icon:"🧊", type:"discovery",  desc:"Băng tan lộ ra cổ vật tiền sử." },
  quai_vat_thuc_giac:   { name:"Quái Vật Thức Giấc",      icon:"🐉", type:"disaster",   desc:"Quái vật cổ đại dưới đáy biển thức tỉnh." },
  bau_vat_bang:         { name:"Linh Bảo Trong Băng",     icon:"💎", type:"discovery",  desc:"Linh bảo vạn năm đóng trong băng được tìm thấy." },
  kho_tien:             { name:"Kho Báu Tiên Nhân",       icon:"🌟", type:"mystical",   desc:"Di sản của tiên nhân ẩn dưới đáy băng dương." },
  ma_khoi:              { name:"Ma Khí Tràn Biển",        icon:"👻", type:"disaster",   desc:"Ma khí từ Hắc Vực tràn ra biển cả." },
  dia_nguc_mo:          { name:"Địa Ngục Hải Môn Mở",    icon:"🔴", type:"disaster",   desc:"Cổng địa ngục dưới đáy biển hé mở." },
  than_bi_xuat_hien:    { name:"Thần Bí Xuất Hiện",       icon:"🌀", type:"mystical",   desc:"Thực thể không rõ nguồn gốc xuất hiện từ biển." },
  the_gioi_ngam:        { name:"Thế Giới Ngầm Lộ Thiên",  icon:"🏔️", type:"discovery",  desc:"Một thế giới dưới đáy Hắc Vực được khám phá." },
  tien_linh_xuat_hien:  { name:"Tiên Linh Xuất Hiện",     icon:"🦋", type:"mystical",   desc:"Tiên linh từ đảo tiên hiện ra thế gian." },
  phap_bao_phat_hien:   { name:"Pháp Bảo Đảo Tiên",      icon:"⚔️", type:"discovery",  desc:"Pháp bảo thất truyền xuất hiện trên đảo tiên." },
  tu_luyen_co_diem:     { name:"Tu Luyện Cơ Điểm Biển",  icon:"🧘", type:"fortune",    desc:"Điểm linh khí trên biển tiên, tu sĩ đến tu luyện." },
  tien_nhan_giang_the:  { name:"Tiên Nhân Giáng Thế",     icon:"👳", type:"mystical",   desc:"Một tiên nhân từ đảo tiên hạ phàm." },
};

// ── HẠNG MỤC HẢI CHIẾN ──────────────────────────────────────
const OE_BATTLE_OUTCOMES = [
  "Đại Thắng Hải Chiến","Hải Chiến Khốc Liệt","Phong Ba Trận Đấu",
  "Trận Chiến Sấm Sét","Đêm Đen Huyết Chiến","Kình Ngư Trận Thế",
];

// ── INIT ────────────────────────────────────────────────────
function oeInit() {
  if (!window.navalData) {
    const saved = localStorage.getItem(OE_SAVE_KEY);
    window.navalData = saved ? JSON.parse(saved) : _oeBuildDefault();
  }
  _oeMigrate();
  oeSave();
}

function _oeBuildDefault() {
  return {
    zones: _oeInitZones(),
    fleets: {},
    pirates: _oeInitPirates(),
    monsters: _oeInitMonsters(),
    tradeRoutes: [],
    islandDiscoveries: [],
    oceanHistory: [],
    battles: [],
    idCounter: 0,
    version: OE_VERSION,
    totalTrade: 0,
    totalFish: 0,
    totalBattles: 0,
    totalPirateRaids: 0,
  };
}

function _oeMigrate() {
  const d = window.navalData;
  if (!d.zones)           d.zones            = _oeInitZones();
  if (!d.fleets)          d.fleets           = {};
  if (!d.pirates)         d.pirates          = _oeInitPirates();
  if (!d.monsters)        d.monsters         = _oeInitMonsters();
  if (!d.tradeRoutes)     d.tradeRoutes      = [];
  if (!d.islandDiscoveries) d.islandDiscoveries = [];
  if (!d.oceanHistory)    d.oceanHistory     = [];
  if (!d.battles)         d.battles          = [];
  if (!d.idCounter)       d.idCounter        = 0;
  if (!d.totalTrade)      d.totalTrade       = 0;
  if (!d.totalFish)       d.totalFish        = 0;
  if (!d.totalBattles)    d.totalBattles     = 0;
  if (!d.totalPirateRaids)d.totalPirateRaids = 0;

  // Gắn hạm đội vào countries/kingdoms hiện có
  _oeAssignFleetsToFactions();
}

function _oeInitZones() {
  const zones = {};
  Object.values(OE_ZONES).forEach(z => {
    zones[z.id] = {
      ...z,
      discoveredIslands: [],
      activeMonsters: Math.floor(Math.random() * z.danger),
      pirateStrength: Math.floor(Math.random() * 40 * z.pirateRate + 5),
      tradeVolume: Math.floor(Math.random() * z.tradeBonus * 10),
      controlledBy: null,  // Quốc gia kiểm soát
      eventHistory: [],
    };
  });
  return zones;
}

function _oeInitPirates() {
  const names = [
    "Long Hải Bang","Hắc Kỳ Hội","Tử Thần Hải Tặc","Xích Long Bang",
    "Minh Nguyệt Thuyền","Thương Hải Quỷ","Bão Tố Chi Vương",
  ];
  return names.slice(0, 3).map((name, i) => ({
    id: "pirate_" + i,
    name,
    icon: "☠️",
    strength: Math.floor(Math.random() * 80 + 20),
    ships: Math.floor(Math.random() * 15 + 5),
    zone: Object.keys(OE_ZONES)[i % 6],
    wealth: Math.floor(Math.random() * 500 + 100),
    infamy: Math.floor(Math.random() * 50 + 10),
    isDefeated: false,
    raidCount: 0,
    history: [],
  }));
}

function _oeInitMonsters() {
  const pool = [
    { name:"Hải Long Vương",    icon:"🐉", power:800,  zone:"nam_minh", reward:"Long Lân",    desc:"Vua rồng biển ngủ ngàn năm vừa thức tỉnh." },
    { name:"Kình Ngư Thần",     icon:"🐋", power:400,  zone:"dong_hai", reward:"Kình Dầu",    desc:"Cá kình thần linh cỡ núi bảo vệ ngư trường." },
    { name:"Ma Hải Chí Tôn",    icon:"👻", power:1200, zone:"hac_vuc",  reward:"Ma Hạch",     desc:"Thực thể ma đạo tuyệt đỉnh từ Hắc Vực." },
    { name:"Băng Long Hải Thần",icon:"❄️", power:600,  zone:"bac_bang", reward:"Băng Linh",   desc:"Long thần băng tuyết canh giữ Bắc Băng Dương." },
    { name:"Tiên Ngư Đại Thần", icon:"🌟", power:300,  zone:"tien_dao", reward:"Tiên Vảy",    desc:"Cá tiên thần linh từ đảo phúc địa." },
    { name:"Phong Hải Quái",    icon:"🌪️", power:500,  zone:"tay_duong",reward:"Phong Tinh",  desc:"Quái vật gió biển cai trị Tây Dương." },
  ];
  return pool.map((m, i) => ({
    ...m, id: "monster_" + i,
    isSlain: false, slainBy: null, slainYear: null,
    spawnYear: (window.year || 1) - Math.floor(Math.random() * 200),
  }));
}

function _oeAssignFleetsToFactions() {
  const countries = (window.countries || []).filter(c => !c.collapsed).slice(0, 6);
  countries.forEach(c => {
    const existsFleet = Object.values(window.navalData.fleets)
      .find(f => f.ownerId === c.id && f.ownerType === "country");
    if (!existsFleet) {
      oeCreateFleet({
        name:      (c.name || "Vô Danh") + " Hải Quân",
        ownerId:   c.id,
        ownerType: "country",
        ownerName: c.name || "Vô Danh",
        zone:      Object.keys(OE_ZONES)[Math.floor(Math.random() * 3)],
        shipCounts: {
          ngu_thuyen:    Math.floor(Math.random() * 8 + 2),
          thuong_thuyen: Math.floor(Math.random() * 4 + 1),
          chien_ham:     Math.floor(Math.random() * 3),
        },
      });
    }
  });

  // Kingdoms
  if (window.kingdomData) {
    Object.values(window.kingdomData.kingdoms).filter(k => !k.isCollapsed).slice(0, 4)
      .forEach(k => {
        const existsFleet = Object.values(window.navalData.fleets)
          .find(f => f.ownerId === k.kingdomId && f.ownerType === "kingdom");
        if (!existsFleet) {
          oeCreateFleet({
            name:      k.kingdomName + " Vương Hải Quân",
            ownerId:   k.kingdomId,
            ownerType: "kingdom",
            ownerName: k.kingdomName,
            zone:      Object.keys(OE_ZONES)[Math.floor(Math.random() * 4)],
            shipCounts: {
              thuong_thuyen: Math.floor(Math.random() * 5 + 2),
              chien_ham:     Math.floor(Math.random() * 5 + 1),
              tien_thuyen:   Math.random() < 0.1 ? 1 : 0,
            },
          });
        }
      });
  }

  // Nếu chưa đủ 3 hạm đội, tạo thêm
  const count = Object.keys(window.navalData.fleets).length;
  if (count < 3) {
    for (let i = count; i < 3; i++) {
      const names = ["Đông Hải Thương Đoàn","Hải Thần Bang","Nam Minh Hạm Đội"];
      oeCreateFleet({
        name: names[i] || "Hạm Đội " + (i+1),
        ownerId: "independent_" + i,
        ownerType: "independent",
        ownerName: names[i] || "Độc Lập",
        zone: Object.keys(OE_ZONES)[i % 6],
        shipCounts: { thuong_thuyen: 3, chien_ham: 1 },
      });
    }
  }
}

// ── TẠO HẠM ĐỘI ─────────────────────────────────────────────
function oeCreateFleet(opts) {
  if (!window.navalData) oeInit();
  const id = "fleet_" + (++window.navalData.idCounter);

  const shipCounts = opts.shipCounts || { thuong_thuyen: 2 };
  const ships = [];
  let totalPower = 0;

  Object.entries(shipCounts).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      const stype = OE_SHIP_TYPES[type];
      if (!stype) return;
      ships.push({
        id:       id + "_s" + ships.length,
        type,
        name:     stype.name + " " + (i + 1),
        hp:       100, maxHp: 100,
        attack:   stype.attack,
        defense:  stype.defense,
        speed:    stype.speed,
      });
      totalPower += stype.warPower;
    }
  });

  const fleet = {
    id, ships,
    name:       opts.name || "Hạm Đội " + id,
    ownerId:    opts.ownerId || null,
    ownerType:  opts.ownerType || "independent",
    ownerName:  opts.ownerName || "Độc Lập",
    zone:       opts.zone || "dong_hai",
    totalPower,
    tradePower: ships.reduce((s, sh) => s + (OE_SHIP_TYPES[sh.type]?.tradePower || 0), 0),
    fishPower:  ships.reduce((s, sh) => s + (OE_SHIP_TYPES[sh.type]?.fishPower  || 0), 0),
    wealth:     0,
    status:     "patrol",   // patrol | trade | battle | explore | port
    mission:    null,
    isDestroyed: false,
    history:    [],
  };

  window.navalData.fleets[id] = fleet;
  return fleet;
}

function oeSave() {
  try { localStorage.setItem(OE_SAVE_KEY, JSON.stringify(window.navalData)); } catch(e) {}
}

// ── TICK CHÍNH ───────────────────────────────────────────────
function oeTick() {
  if (!window.navalData || !window.world) return;
  const year  = window.year || 0;
  const d     = window.navalData;

  // Cập nhật hạm đội
  Object.values(d.fleets).filter(f => !f.isDestroyed).forEach(fleet => {
    _oeFleetTick(fleet, year);
  });

  // Sự kiện vùng biển
  if (year % 5 === 0) {
    Object.values(d.zones).forEach(zone => _oeZoneEvent(zone, year));
  }

  // Hải tặc tập kích mỗi 8 năm
  if (year % 8 === 0) _oePirateTick(year);

  // Quái vật biển mỗi 15 năm
  if (year % 15 === 0) _oeMonsterTick(year);

  // Tuyến thương mại mỗi 10 năm
  if (year % 10 === 0) _oeTradeRouteTick(year);

  // Migration mỗi 20 năm
  if (year % 20 === 0) _oeAssignFleetsToFactions();

  // Hải chiến giữa hạm đội khác nhau mỗi 12 năm
  if (year % 12 === 0 && Math.random() < 0.4) _oeNavalBattleTick(year);

  oeSave();
}

// ── TICK HẠM ĐỘI ────────────────────────────────────────────
function _oeFleetTick(fleet, year) {
  const zone = window.navalData.zones[fleet.zone];
  if (!zone) return;

  if (fleet.status === "trade" || fleet.status === "patrol") {
    // Thu nhập thương mại
    const tradeIncome = Math.floor(fleet.tradePower * (zone.tradeBonus / 100) * (0.8 + Math.random() * 0.4));
    fleet.wealth += tradeIncome;
    window.navalData.totalTrade += tradeIncome;

    // Thu nhập đánh cá
    const fishIncome = Math.floor(fleet.fishPower * (zone.fishBonus / 100) * (0.8 + Math.random() * 0.4));
    fleet.wealth += fishIncome;
    window.navalData.totalFish += fishIncome;
  }

  // Rủi ro tự nhiên (bão)
  if (Math.random() < 0.05 * zone.danger) {
    const loss = Math.floor(Math.random() * fleet.ships.length * 0.3);
    if (loss > 0 && fleet.ships.length > 0) {
      for (let i = 0; i < loss; i++) {
        const idx = Math.floor(Math.random() * fleet.ships.length);
        fleet.ships.splice(idx, 1);
      }
      fleet.history.push(`Năm ${year}: Bão biển phá hủy ${loss} chiến thuyền.`);
    }
  }

  // Hạm đội tự nhiên phát triển mỗi 25 năm
  if (year % 25 === 0 && Math.random() < 0.4 && fleet.ownerType !== "independent") {
    const newShip = _oePickNewShip(fleet);
    fleet.ships.push(newShip);
    fleet.tradePower += OE_SHIP_TYPES[newShip.type]?.tradePower || 0;
    fleet.fishPower  += OE_SHIP_TYPES[newShip.type]?.fishPower  || 0;
    fleet.totalPower += OE_SHIP_TYPES[newShip.type]?.warPower   || 0;
  }

  if (fleet.ships.length <= 0) {
    fleet.isDestroyed = true;
    fleet.history.push(`Năm ${year}: Hạm đội tan rã hoàn toàn.`);
    if (typeof addLog === "function") addLog(`⚓ Hạm đội ${fleet.name} đã bị phá hủy!`, "death");
  }
}

function _oePickNewShip(fleet) {
  const counts = {};
  fleet.ships.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
  // Thêm loại thuyền phổ biến nhất
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "thuong_thuyen";
  const stype = OE_SHIP_TYPES[mostCommon];
  return {
    id:      "auto_" + Date.now() + Math.random(),
    type:    mostCommon,
    name:    stype.name + " " + (counts[mostCommon] + 1),
    hp: 100, maxHp: 100,
    attack:  stype.attack,
    defense: stype.defense,
    speed:   stype.speed,
  };
}

// ── SỰ KIỆN VÙNG BIỂN ───────────────────────────────────────
function _oeZoneEvent(zone, year) {
  if (!zone.events || zone.events.length === 0) return;
  if (Math.random() > 0.25) return;

  const eventId  = zone.events[Math.floor(Math.random() * zone.events.length)];
  const eventDef = OE_EVENTS[eventId];
  if (!eventDef) return;

  const entry = {
    year, zoneId: zone.id, zoneName: zone.name,
    eventId, name: eventDef.name, icon: eventDef.icon,
    type: eventDef.type, desc: eventDef.desc,
  };
  zone.eventHistory.push(entry);
  window.navalData.oceanHistory.unshift(entry);
  if (window.navalData.oceanHistory.length > 80) window.navalData.oceanHistory.pop();

  // Áp dụng hiệu ứng
  if (eventDef.type === "disaster") {
    zone.tradeVolume = Math.max(0, zone.tradeVolume - Math.floor(Math.random() * 200 + 50));
    zone.pirateStrength += Math.floor(Math.random() * 10);
  } else if (eventDef.type === "fortune") {
    zone.tradeVolume += Math.floor(Math.random() * 300 + 100);
    window.navalData.totalTrade += Math.floor(Math.random() * 200);
  } else if (eventDef.type === "discovery") {
    const islandName = _oeRandIslandName();
    zone.discoveredIslands.push({ name: islandName, year });
    window.navalData.islandDiscoveries.push({ name: islandName, zone: zone.id, zoneName: zone.name, year });
    entry.islandName = islandName;
  } else if (eventDef.type === "mystical") {
    zone.tradeVolume += Math.floor(Math.random() * 150);
  }

  const msg = `${eventDef.icon} [${zone.name}] ${eventDef.name} — ${eventDef.desc}`;
  if (typeof addLog === "function") addLog(msg, eventDef.type === "disaster" ? "warn" : "info");
  if (typeof htAddEvent === "function") {
    htAddEvent({ year, type: "ocean_event", text: msg });
  }
}

// ── HẢI TẶC TICK ────────────────────────────────────────────
function _oePirateTick(year) {
  window.navalData.pirates.filter(p => !p.isDefeated).forEach(pirate => {
    // Tập kích tuyến thương mại
    const fleets = Object.values(window.navalData.fleets)
      .filter(f => !f.isDestroyed && f.zone === pirate.zone && f.status === "trade");

    if (fleets.length > 0 && Math.random() < 0.4) {
      const target = fleets[Math.floor(Math.random() * fleets.length)];
      const loot   = Math.floor(Math.random() * target.wealth * 0.3 + 50);
      target.wealth = Math.max(0, target.wealth - loot);
      pirate.wealth += loot;
      pirate.infamy += 5;
      pirate.raidCount++;
      window.navalData.totalPirateRaids++;

      const msg = `☠️ ${pirate.name} cướp phá ${target.ownerName} — chiếm ${loot} vàng!`;
      target.history.push(`Năm ${year}: Bị ${pirate.name} cướp ${loot} vàng.`);
      pirate.history.push(`Năm ${year}: Cướp ${target.ownerName}, thu ${loot} vàng.`);
      if (typeof addLog === "function") addLog(msg, "warn");
      if (typeof htAddEvent === "function") htAddEvent({ year, type: "pirate_raid", text: msg });
    }

    // Hải tặc lớn mạnh theo thời gian
    if (Math.random() < 0.3) {
      pirate.strength = Math.min(300, pirate.strength + Math.floor(Math.random() * 10));
      pirate.ships    = Math.min(50,  pirate.ships    + Math.floor(Math.random() * 2));
    }
  });
}

// ── QUÁI VẬT BIỂN TICK ──────────────────────────────────────
function _oeMonsterTick(year) {
  window.navalData.monsters.filter(m => !m.isSlain).forEach(monster => {
    // Tấn công hạm đội lân cận
    const nearbyFleets = Object.values(window.navalData.fleets)
      .filter(f => !f.isDestroyed && f.zone === monster.zone);

    if (nearbyFleets.length > 0 && Math.random() < 0.2) {
      const target = nearbyFleets[Math.floor(Math.random() * nearbyFleets.length)];
      const damage = Math.floor(Math.random() * Math.min(target.ships.length, 3) + 1);
      const lost   = Math.min(damage, target.ships.length);

      if (lost > 0) {
        for (let i = 0; i < lost; i++) target.ships.splice(0, 1);
        const msg = `🐉 ${monster.name} tấn công ${target.name} — phá hủy ${lost} thuyền!`;
        target.history.push(`Năm ${year}: ${monster.name} tấn công, mất ${lost} thuyền.`);
        if (typeof addLog === "function") addLog(msg, "warn");
        if (typeof htAddEvent === "function") htAddEvent({ year, type: "monster_attack", text: msg });
      }
    }
  });
}

// ── HẢI CHIẾN TICK ──────────────────────────────────────────
function _oeNavalBattleTick(year) {
  const activeFleets = Object.values(window.navalData.fleets)
    .filter(f => !f.isDestroyed && f.ships.length > 2);
  if (activeFleets.length < 2) return;

  // Chọn 2 hạm đội khác chủ cùng vùng
  const byZone = {};
  activeFleets.forEach(f => {
    if (!byZone[f.zone]) byZone[f.zone] = [];
    byZone[f.zone].push(f);
  });

  for (const [zoneId, zFleets] of Object.entries(byZone)) {
    const rivals = zFleets.filter((f, _, arr) => arr.some(g => g.ownerId !== f.ownerId));
    if (rivals.length < 2) continue;

    // Lấy 2 kẻ thù
    const shuffle = [...rivals].sort(() => Math.random() - 0.5);
    const A = shuffle[0];
    const B = shuffle.find(f => f.ownerId !== A.ownerId);
    if (!A || !B) continue;

    _oeDoNavalBattle(A, B, zoneId, year);
    break;
  }
}

function _oeDoNavalBattle(fleetA, fleetB, zoneId, year) {
  const powerA = fleetA.totalPower + Math.random() * 50;
  const powerB = fleetB.totalPower + Math.random() * 50;
  const winner = powerA >= powerB ? fleetA : fleetB;
  const loser  = powerA >= powerB ? fleetB : fleetA;

  // Tổn thất
  const winnerLoss = Math.floor(Math.random() * winner.ships.length * 0.2 + 1);
  const loserLoss  = Math.floor(Math.random() * loser.ships.length  * 0.4 + 1);

  for (let i = 0; i < Math.min(winnerLoss, winner.ships.length - 1); i++) winner.ships.splice(0, 1);
  for (let i = 0; i < Math.min(loserLoss,  loser.ships.length);      i++) loser.ships.splice(0, 1);

  // Cập nhật power
  winner.totalPower = Math.max(0, winner.totalPower - winnerLoss * 10);
  loser.totalPower  = Math.max(0, loser.totalPower  - loserLoss  * 10);

  const loot = Math.floor(loser.wealth * 0.3);
  winner.wealth += loot;
  loser.wealth   = Math.max(0, loser.wealth - loot);

  const battleName = OE_BATTLE_OUTCOMES[Math.floor(Math.random() * OE_BATTLE_OUTCOMES.length)];
  const zone = OE_ZONES[zoneId];
  const record = {
    id:      "battle_" + (++window.navalData.idCounter),
    year, zoneId, zoneName: zone?.name || zoneId,
    name:    battleName,
    winnerName: winner.name, winnerOwner: winner.ownerName,
    loserName:  loser.name,  loserOwner:  loser.ownerName,
    winnerLoss, loserLoss, loot,
  };
  window.navalData.battles.unshift(record);
  if (window.navalData.battles.length > 30) window.navalData.battles.pop();
  window.navalData.totalBattles++;

  winner.history.push(`Năm ${year}: Thắng ${battleName} tại ${zone?.name}, cướp ${loot} vàng.`);
  loser.history.push(`Năm ${year}: Thua ${battleName} tại ${zone?.name}, mất ${loot} vàng.`);

  const msg = `⚓ [HẢI CHIẾN] ${battleName} tại ${zone?.name} — ${winner.ownerName} THẮNG!`;
  if (typeof addLog === "function") addLog(msg, "important");
  if (typeof htAddEvent === "function") htAddEvent({ year, type: "naval_battle", text: msg });

  if (loser.ships.length <= 0) {
    loser.isDestroyed = true;
    if (typeof addLog === "function") addLog(`⚓ Hạm đội ${loser.name} bị tiêu diệt hoàn toàn!`, "death");
  }
}

// ── THƯƠNG MẠI TUYẾN BIỂN ───────────────────────────────────
function _oeTradeRouteTick(year) {
  // Tự sinh tuyến mới từ các fleets thương mại
  const traders = Object.values(window.navalData.fleets)
    .filter(f => !f.isDestroyed && f.tradePower > 0);

  if (traders.length >= 2 && window.navalData.tradeRoutes.length < 8) {
    const a = traders[Math.floor(Math.random() * traders.length)];
    const b = traders.find(t => t.zone !== a.zone && t.ownerId !== a.ownerId);
    if (a && b) {
      const zoneA = OE_ZONES[a.zone];
      const zoneB = OE_ZONES[b.zone];
      const profit = Math.floor((a.tradePower + b.tradePower) * 0.5 * (zoneA?.tradeBonus || 20) / 100 * 10);
      const route = {
        id:        "route_" + (++window.navalData.idCounter),
        nameA:     a.ownerName, zoneA: a.zone, zoneAName: zoneA?.name,
        nameB:     b.ownerName, zoneB: b.zone, zoneBName: zoneB?.name,
        profitPerYear: profit,
        totalProfit:   0,
        yearEstablished: year,
        isActive:  true,
        raidCount: 0,
      };
      window.navalData.tradeRoutes.push(route);
      if (typeof addLog === "function") {
        addLog(`⛵ Tuyến thương mại biển mới: ${a.ownerName} ↔ ${b.ownerName} (+${profit}/năm)`, "info");
      }
    }
  }

  // Cập nhật lợi nhuận tuyến hiện có
  window.navalData.tradeRoutes.filter(r => r.isActive).forEach(route => {
    const income = Math.floor(route.profitPerYear * (0.7 + Math.random() * 0.6));
    route.totalProfit += income;
    window.navalData.totalTrade += income;
  });
}

// ── ACTION: TIÊU DIỆT HẢI TẶC ───────────────────────────────
function oeAttackPirate(fleetId, pirateId) {
  const fleet  = window.navalData?.fleets[fleetId];
  const pirate = window.navalData?.pirates.find(p => p.id === pirateId);
  if (!fleet || !pirate || pirate.isDefeated) return;

  const year = window.year || 1;
  const fleetPower  = fleet.totalPower + Math.random() * 30;
  const piratePower = pirate.strength  + Math.random() * 30;

  if (fleetPower >= piratePower) {
    pirate.isDefeated = true;
    pirate.history.push(`Năm ${year}: Bị ${fleet.ownerName} tiêu diệt.`);
    fleet.wealth += pirate.wealth;
    fleet.history.push(`Năm ${year}: Tiêu diệt ${pirate.name}, thu ${pirate.wealth} vàng.`);
    const msg = `⚔️ ${fleet.ownerName} tiêu diệt ${pirate.name}! Thu ${pirate.wealth} vàng.`;
    if (typeof addLog === "function") addLog(msg, "important");
    if (typeof htAddEvent === "function") htAddEvent({ year, type: "pirate_defeated", text: msg });
  } else {
    // Hạm đội thất bại
    const loss = Math.floor(Math.random() * 2 + 1);
    for (let i = 0; i < Math.min(loss, fleet.ships.length); i++) fleet.ships.splice(0, 1);
    fleet.history.push(`Năm ${year}: Tấn công ${pirate.name} thất bại, mất ${loss} thuyền.`);
    if (typeof addLog === "function") addLog(`❌ ${fleet.ownerName} tấn công ${pirate.name} thất bại.`, "warn");
  }
  oeSave();
  oeRenderPanel();
}

// ── ACTION: SĂNN QUÁI VẬT ────────────────────────────────────
function oeHuntMonster(fleetId, monsterId) {
  const fleet   = window.navalData?.fleets[fleetId];
  const monster = window.navalData?.monsters.find(m => m.id === monsterId);
  if (!fleet || !monster || monster.isSlain) return;

  const year = window.year || 1;
  const fleetPower   = fleet.totalPower + Math.random() * 50;
  const monsterPower = monster.power    + Math.random() * 100;

  if (fleetPower >= monsterPower) {
    monster.isSlain  = true;
    monster.slainBy  = fleet.ownerName;
    monster.slainYear= year;
    fleet.history.push(`Năm ${year}: Hạ sát ${monster.name}! Nhận ${monster.reward}.`);
    const msg = `🏆 ${fleet.ownerName} hạ sát ${monster.icon} ${monster.name}! Nhận ${monster.reward}!`;
    if (typeof addLog === "function") addLog(msg, "important");
    if (typeof htAddEvent === "function") htAddEvent({ year, type: "monster_slain", text: msg });
  } else {
    const loss = Math.floor(Math.random() * 3 + 1);
    for (let i = 0; i < Math.min(loss, fleet.ships.length); i++) fleet.ships.splice(0, 1);
    fleet.history.push(`Năm ${year}: Tấn công ${monster.name} thất bại, mất ${loss} thuyền.`);
    if (typeof addLog === "function") addLog(`❌ ${fleet.ownerName} thất bại trước ${monster.name}!`, "warn");
  }
  oeSave();
  oeRenderPanel();
}

// ── ACTION: THÊM THUYỀN ──────────────────────────────────────
function oeAddShip(fleetId, shipType) {
  const fleet = window.navalData?.fleets[fleetId];
  const stype = OE_SHIP_TYPES[shipType];
  if (!fleet || !stype) return;

  const year = window.year || 1;
  const newShip = {
    id:      fleetId + "_s" + fleet.ships.length,
    type:    shipType,
    name:    stype.name + " " + (fleet.ships.filter(s => s.type === shipType).length + 1),
    hp: 100, maxHp: 100,
    attack:  stype.attack,
    defense: stype.defense,
    speed:   stype.speed,
  };
  fleet.ships.push(newShip);
  fleet.tradePower += stype.tradePower;
  fleet.fishPower  += stype.fishPower;
  fleet.totalPower += stype.warPower;
  fleet.history.push(`Năm ${year}: Bổ sung thêm ${stype.name}.`);
  oeSave();
  oeRenderPanel();
}

// ── HELPERS ──────────────────────────────────────────────────
function _oeRandIslandName() {
  const prefixes = ["Bích","Hồng","Kim","Ngọc","Lưu Ly","Hắc","Thiên","Vạn","Linh","Thần"];
  const suffixes = ["Châu","Đảo","Lâm","Quần","Cảng","Thần","Tâm","Nguyên","Phong","Hải"];
  return _oeRandItem(prefixes) + " " + _oeRandItem(suffixes);
}
function _oeRandItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── RENDER PANEL CHÍNH ───────────────────────────────────────
function oeRenderPanel() {
  const panel = document.getElementById("panel-naval-ocean");
  if (!panel) return;
  if (!window.navalData) oeInit();

  const d       = window.navalData;
  const fleets  = Object.values(d.fleets).filter(f => !f.isDestroyed);
  const pirates = d.pirates.filter(p => !p.isDefeated);
  const monsters= d.monsters.filter(m => !m.isSlain);
  const routes  = d.tradeRoutes.filter(r => r.isActive);
  const zones   = Object.values(d.zones);

  panel.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">

      <!-- HEADER -->
      <div style="padding:16px 20px 12px;border-bottom:1px solid rgba(96,165,250,0.2);background:rgba(0,0,0,0.4);flex-shrink:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-title);font-size:18px;color:#60a5fa;letter-spacing:2px">🌊 ĐẠI DƯƠNG & HẢI QUÂN</div>
            <div style="font-size:11px;color:var(--white-dim);margin-top:2px">Vùng biển · Hạm đội · Hải chiến · Hải tặc · Quái vật · Thương mại biển</div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="oeTick();oeRenderPanel()" style="padding:6px 14px;border-radius:8px;border:1px solid rgba(96,165,250,0.4);background:rgba(96,165,250,0.1);color:#60a5fa;cursor:pointer;font-size:11px">▶ Mô phỏng</button>
            <button onclick="oeRenderPanel()" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:var(--white-dim);cursor:pointer;font-size:11px">🔄</button>
          </div>
        </div>

        <!-- STAT BAR -->
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px">
          ${[
            ["⚓","Hạm đội",      fleets.length,           "#60a5fa"],
            ["☠️","Hải tặc",      pirates.length,          "#f97316"],
            ["🐉","Quái vật",     monsters.length,         "#c084fc"],
            ["⛵","Tuyến biển",   routes.length,           "#4ade80"],
            ["🏝️","Đảo khai phá", d.islandDiscoveries.length,"#fbbf24"],
            ["⚔️","Hải chiến",   d.totalBattles,          "#f87171"],
          ].map(([icon, label, val, color]) => `
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:14px">${icon}</div>
              <div style="font-size:14px;font-weight:800;color:${color}">${val}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${label}</div>
            </div>`).join("")}
        </div>

        <!-- TABS -->
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="oe-tabs">
          ${[
            ["zones",   "🗺️ Vùng Biển"],
            ["fleets",  "⚓ Hạm Đội"],
            ["combat",  "⚔️ Chiến Sự"],
            ["trade",   "⛵ Thương Mại"],
            ["history", "📜 Lịch Sử"],
          ].map(([tab, label], i) => `
            <button onclick="oeShowTab('${tab}')" id="oe-tab-${tab}"
              style="padding:5px 14px;border-radius:6px;border:1px solid rgba(96,165,250,${i===0?'0.6':'0.2'});
              background:rgba(96,165,250,${i===0?'0.15':'0.05'});color:${i===0?'#60a5fa':'var(--white-dim)'};
              cursor:pointer;font-size:11px">${label}</button>`).join("")}
        </div>
      </div>

      <!-- CONTENT -->
      <div id="oe-content" style="flex:1;overflow-y:auto;padding:16px 20px">
        ${oeRenderZonesTab()}
      </div>
    </div>`;
}

function oeShowTab(tab) {
  ["zones","fleets","combat","trade","history"].forEach(t => {
    const btn = document.getElementById("oe-tab-" + t);
    if (!btn) return;
    const active = t === tab;
    btn.style.borderColor = `rgba(96,165,250,${active?'0.6':'0.2'})`;
    btn.style.background  = `rgba(96,165,250,${active?'0.15':'0.05'})`;
    btn.style.color       = active ? "#60a5fa" : "var(--white-dim)";
  });
  const c = document.getElementById("oe-content");
  if (!c) return;
  if (tab === "zones")   c.innerHTML = oeRenderZonesTab();
  if (tab === "fleets")  c.innerHTML = oeRenderFleetsTab();
  if (tab === "combat")  c.innerHTML = oeRenderCombatTab();
  if (tab === "trade")   c.innerHTML = oeRenderTradeTab();
  if (tab === "history") c.innerHTML = oeRenderHistoryTab();
}

// ── TAB: VÙNG BIỂN ──────────────────────────────────────────
function oeRenderZonesTab() {
  const zones = Object.values(window.navalData?.zones || {});
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">
      ${zones.map(z => {
        const def = OE_ZONES[z.id];
        if (!z || !def) return "";
        const dangerBars  = "▮".repeat(z.activeMonsters)  + "▯".repeat(Math.max(0, def.danger - z.activeMonsters));
        const richnessBars= "▮".repeat(def.richness);
        const pirateLvl   = z.pirateStrength > 80 ? "Cực Nguy" : z.pirateStrength > 50 ? "Nguy Hiểm" : z.pirateStrength > 25 ? "Vừa Phải" : "An Toàn";
        const pirateColor = z.pirateStrength > 80 ? "#f87171" : z.pirateStrength > 50 ? "#f97316" : z.pirateStrength > 25 ? "#fbbf24" : "#4ade80";

        return `
          <div style="background:rgba(0,0,0,0.35);border:1px solid ${def.color}25;border-top:2px solid ${def.color};border-radius:12px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <div>
                <div style="font-family:var(--font-title);font-size:15px;color:${def.color}">${def.icon} ${z.name}</div>
                <div style="font-size:9px;color:var(--white-dim);margin-top:2px">${def.climate}</div>
                <div style="font-size:10px;color:var(--white-dim);margin-top:4px;line-height:1.4">${def.desc}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px">
                <div style="font-size:9px;color:var(--white-dim)">⚠️ Nguy Hiểm</div>
                <div style="font-size:11px;color:#f87171;font-weight:700">${dangerBars} Cấp ${def.danger}</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px">
                <div style="font-size:9px;color:var(--white-dim)">💰 Tài Nguyên</div>
                <div style="font-size:11px;color:#fbbf24;font-weight:700">${richnessBars} Cấp ${def.richness}</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px">
                <div style="font-size:9px;color:var(--white-dim)">☠️ Hải Tặc</div>
                <div style="font-size:11px;color:${pirateColor};font-weight:700">${pirateLvl} (${z.pirateStrength})</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px">
                <div style="font-size:9px;color:var(--white-dim)">⛵ Thương Mại</div>
                <div style="font-size:11px;color:#4ade80;font-weight:700">${z.tradeVolume.toLocaleString()}</div>
              </div>
            </div>
            ${z.discoveredIslands.length > 0 ? `
              <div style="margin-bottom:8px">
                <div style="font-size:9px;color:var(--white-dim);margin-bottom:4px">🏝️ ĐẢO ĐÃ KHÁM PHÁ (${z.discoveredIslands.length})</div>
                <div style="display:flex;flex-wrap:wrap;gap:3px">
                  ${z.discoveredIslands.slice(-4).map(isl => `<span style="font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);color:#fbbf24">${isl.name}</span>`).join("")}
                  ${z.discoveredIslands.length > 4 ? `<span style="font-size:9px;color:var(--white-dim)">+${z.discoveredIslands.length-4}</span>` : ""}
                </div>
              </div>` : ""}
            ${z.eventHistory.length > 0 ? `
              <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px">
                <div style="font-size:9px;color:var(--white-dim);margin-bottom:4px">📜 Sự kiện gần đây</div>
                ${z.eventHistory.slice(-2).map(ev => `
                  <div style="font-size:9px;color:var(--white-dim);padding:2px 0">
                    ${ev.icon} Năm ${ev.year}: ${ev.name}
                  </div>`).join("")}
              </div>` : ""}
          </div>`;
      }).join("")}
    </div>`;
}

// ── TAB: HẠM ĐỘI ────────────────────────────────────────────
function oeRenderFleetsTab() {
  const fleets  = Object.values(window.navalData?.fleets || {}).filter(f => !f.isDestroyed);
  const pirates = (window.navalData?.pirates || []).filter(p => !p.isDefeated);
  const monsters= (window.navalData?.monsters || []).filter(m => !m.isSlain);

  if (fleets.length === 0) return `<div style="text-align:center;padding:60px;color:var(--white-dim)"><div style="font-size:48px">⚓</div><div>Chưa có hạm đội nào.</div></div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${fleets.map(fleet => {
        const zoneDef = OE_ZONES[fleet.zone];
        const shipCounts = {};
        fleet.ships.forEach(s => { shipCounts[s.type] = (shipCounts[s.type]||0)+1; });
        return `
          <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(96,165,250,0.15);border-radius:12px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <div>
                <div style="font-family:var(--font-title);font-size:14px;color:#60a5fa">⚓ ${fleet.name}</div>
                <div style="font-size:10px;color:var(--white-dim);margin-top:2px">Chủ: ${fleet.ownerName} · ${zoneDef?.icon||""} ${zoneDef?.name||fleet.zone}</div>
                <div style="font-size:10px;color:var(--white-dim);margin-top:1px">Trạng thái: <span style="color:#4ade80">${fleet.status}</span></div>
              </div>
              <div style="text-align:right">
                <div style="font-size:16px;font-weight:800;color:#fbbf24">${fleet.wealth.toLocaleString()}</div>
                <div style="font-size:9px;color:var(--white-dim)">Vàng</div>
              </div>
            </div>

            <!-- Ship composition -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">
              ${[["warPower","⚔️ Chiến lực","#f87171"],["tradePower","⛵ Thương mại","#fbbf24"],["fishPower","🎣 Ngư nghiệp","#4ade80"]].map(([key,label,color]) => `
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:6px;text-align:center">
                  <div style="font-size:12px;font-weight:800;color:${color}">${fleet[key]}</div>
                  <div style="font-size:9px;color:var(--white-dim)">${label}</div>
                </div>`).join("")}
            </div>

            <!-- Ships list -->
            <div style="margin-bottom:10px">
              <div style="font-size:9px;color:var(--white-dim);margin-bottom:5px">🚢 THÀNH PHẦN (${fleet.ships.length} thuyền)</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px">
                ${Object.entries(shipCounts).map(([type, count]) => {
                  const st = OE_SHIP_TYPES[type];
                  return st ? `<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:${st.color}12;border:1px solid ${st.color}35;font-size:10px;color:${st.color}">${st.icon} ${st.name} ×${count}</div>` : "";
                }).join("")}
              </div>
            </div>

            <!-- Actions -->
            <div style="display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px">
              <select onchange="oeAddShip('${fleet.id}',this.value);this.value=''"
                style="padding:5px 8px;border-radius:6px;border:1px solid rgba(96,165,250,0.3);background:rgba(96,165,250,0.08);color:#60a5fa;font-size:10px;cursor:pointer">
                <option value="">+ Thêm thuyền</option>
                ${Object.values(OE_SHIP_TYPES).map(st => `<option value="${st.id}">${st.icon} ${st.name} (${st.cost}g)</option>`).join("")}
              </select>
              ${pirates.filter(p => p.zone === fleet.zone).length > 0 ? pirates.filter(p => p.zone === fleet.zone).map(p => `
                <button onclick="oeAttackPirate('${fleet.id}','${p.id}')"
                  style="padding:5px 10px;border-radius:6px;border:1px solid rgba(249,115,22,0.4);background:rgba(249,115,22,0.1);color:#f97316;cursor:pointer;font-size:10px">
                  ☠️ Diệt ${p.name}
                </button>`).join("") : ""}
              ${monsters.filter(m => m.zone === fleet.zone).length > 0 ? monsters.filter(m => m.zone === fleet.zone).map(m => `
                <button onclick="oeHuntMonster('${fleet.id}','${m.id}')"
                  style="padding:5px 10px;border-radius:6px;border:1px solid rgba(192,132,252,0.4);background:rgba(192,132,252,0.1);color:#c084fc;cursor:pointer;font-size:10px">
                  🐉 Săn ${m.name}
                </button>`).join("") : ""}
            </div>

            ${fleet.history.length > 0 ? `
              <div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px">
                <div style="font-size:9px;color:var(--white-dim)">${fleet.history.slice(-2).join(" · ")}</div>
              </div>` : ""}
          </div>`;
      }).join("")}
    </div>`;
}

// ── TAB: CHIẾN SỰ ───────────────────────────────────────────
function oeRenderCombatTab() {
  const pirates  = window.navalData?.pirates  || [];
  const monsters = window.navalData?.monsters || [];
  const battles  = window.navalData?.battles  || [];

  return `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- HẢI TẶC -->
      <div>
        <div style="font-size:12px;color:#f97316;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">☠️ HẢI TẶC BĂNG ĐẢNG</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
          ${pirates.map(p => {
            const zone = OE_ZONES[p.zone];
            const col  = p.isDefeated ? "#6b7280" : "#f97316";
            return `
              <div style="background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,${p.isDefeated?'0.1':'0.2'});border-radius:10px;padding:12px;opacity:${p.isDefeated?'0.5':'1'}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div style="font-family:var(--font-title);font-size:13px;color:${col}">☠️ ${p.name}</div>
                  <div style="font-size:9px;padding:2px 8px;border-radius:8px;background:${p.isDefeated?'#6b728020':'#f9731620'};border:1px solid ${p.isDefeated?'#6b7280':'#f97316'}40;color:${col}">${p.isDefeated?"Đã tiêu diệt":"Hoạt động"}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
                  ${[["⚔️","Sức mạnh",p.strength],["🚢","Thuyền",p.ships],["💀","Danh tiếng",p.infamy]].map(([icon,label,val])=>`
                    <div style="text-align:center;background:rgba(0,0,0,0.3);border-radius:6px;padding:5px">
                      <div style="font-size:10px;font-weight:700;color:${col}">${val}</div>
                      <div style="font-size:8px;color:var(--white-dim)">${icon} ${label}</div>
                    </div>`).join("")}
                </div>
                <div style="font-size:9px;color:var(--white-dim)">📍 ${zone?.icon||""} ${zone?.name||p.zone} · ${p.raidCount} lần tập kích · ${p.wealth} vàng</div>
              </div>`;
          }).join("")}
        </div>
      </div>

      <!-- QUÁI VẬT BIỂN -->
      <div>
        <div style="font-size:12px;color:#c084fc;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">🐉 QUÁI VẬT BIỂN CẢ</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
          ${monsters.map(m => {
            const zone = OE_ZONES[m.zone];
            const col  = m.isSlain ? "#6b7280" : "#c084fc";
            return `
              <div style="background:rgba(192,132,252,0.04);border:1px solid rgba(192,132,252,${m.isSlain?'0.1':'0.2'});border-radius:10px;padding:12px;opacity:${m.isSlain?'0.5':'1'}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <div style="font-family:var(--font-title);font-size:13px;color:${col}">${m.icon} ${m.name}</div>
                  <div style="font-size:9px;padding:2px 8px;border-radius:8px;background:${m.isSlain?'#6b728020':'#c084fc20'};border:1px solid ${col}40;color:${col}">${m.isSlain?`Bị hạ - ${m.slainBy}`:"Đang hoành hành"}</div>
                </div>
                <div style="font-size:10px;color:var(--white-dim);margin-bottom:6px;line-height:1.4">${m.desc}</div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--white-dim)">
                  <span>⚡ Sức mạnh: <span style="color:${col};font-weight:700">${m.power}</span></span>
                  <span>📍 ${zone?.icon||""} ${zone?.name||m.zone}</span>
                  <span>🏆 ${m.reward}</span>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>

      <!-- LỊCH SỬ HẢI CHIẾN -->
      ${battles.length > 0 ? `
        <div>
          <div style="font-size:12px;color:#f87171;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">⚔️ LỊCH SỬ HẢI CHIẾN</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${battles.slice(0, 8).map(b => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;background:rgba(248,113,113,0.04);border:1px solid rgba(248,113,113,0.12)">
                <div style="font-size:10px;color:var(--white-dim);flex-shrink:0">Năm ${b.year}</div>
                <div style="flex:1">
                  <div style="font-size:11px;color:var(--white-main)">${b.name}</div>
                  <div style="font-size:9px;color:var(--white-dim);margin-top:1px">${OE_ZONES[b.zoneId]?.icon||""} ${b.zoneName}</div>
                </div>
                <div style="font-size:10px;color:#4ade80;text-align:center">
                  <div>${b.winnerOwner}</div>
                  <div style="font-size:8px;color:var(--white-dim)">thắng</div>
                </div>
                <div style="font-size:9px;color:var(--white-dim)">vs</div>
                <div style="font-size:10px;color:#f87171;text-align:center">
                  <div>${b.loserOwner}</div>
                  <div style="font-size:8px;color:var(--white-dim)">thua (mất ${b.loot}g)</div>
                </div>
              </div>`).join("")}
          </div>
        </div>` : ""}
    </div>`;
}

// ── TAB: THƯƠNG MẠI ─────────────────────────────────────────
function oeRenderTradeTab() {
  const routes = window.navalData?.tradeRoutes || [];
  const d      = window.navalData;

  return `
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- Tổng thống kê -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${[
          ["💰","Tổng thu thương mại", d.totalTrade.toLocaleString()+"g","#fbbf24"],
          ["🎣","Tổng sản lượng cá",   d.totalFish.toLocaleString()+"g", "#4ade80"],
          ["☠️","Số vụ cướp biển",    d.totalPirateRaids,               "#f97316"],
        ].map(([icon,label,val,color]) => `
          <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;text-align:center">
            <div style="font-size:20px;margin-bottom:4px">${icon}</div>
            <div style="font-size:16px;font-weight:800;color:${color}">${val}</div>
            <div style="font-size:10px;color:var(--white-dim)">${label}</div>
          </div>`).join("")}
      </div>

      <!-- Tuyến biển -->
      <div>
        <div style="font-size:12px;color:#4ade80;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">⛵ TUYẾN THƯƠNG MẠI BIỂN (${routes.length})</div>
        ${routes.length === 0 ? `<div style="text-align:center;padding:30px;color:var(--white-dim);font-size:11px;font-style:italic">Chưa có tuyến thương mại biển nào. Cần hạm đội thương thuyền ở hai vùng biển khác nhau.</div>` : `
          <div style="display:flex;flex-direction:column;gap:8px">
            ${routes.map(r => `
              <div style="padding:12px 14px;border-radius:10px;background:rgba(74,222,128,0.04);border:1px solid rgba(74,222,128,0.15);display:flex;align-items:center;gap:12px">
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span style="font-size:11px;color:var(--white-main)">${r.nameA}</span>
                    <span style="color:#4ade80">⛵⛵⛵</span>
                    <span style="font-size:11px;color:var(--white-main)">${r.nameB}</span>
                  </div>
                  <div style="font-size:9px;color:var(--white-dim)">${OE_ZONES[r.zoneA]?.icon||""} ${r.zoneAName||r.zoneA} ↔ ${OE_ZONES[r.zoneB]?.icon||""} ${r.zoneBName||r.zoneB} · Lập năm ${r.yearEstablished}</div>
                </div>
                <div style="text-align:center;flex-shrink:0">
                  <div style="font-size:13px;font-weight:800;color:#4ade80">+${r.profitPerYear}/năm</div>
                  <div style="font-size:9px;color:var(--white-dim)">Tổng: ${r.totalProfit.toLocaleString()}g</div>
                </div>
              </div>`).join("")}
          </div>`}
      </div>

      <!-- Đảo khám phá -->
      ${window.navalData?.islandDiscoveries?.length > 0 ? `
        <div>
          <div style="font-size:12px;color:#fbbf24;font-family:var(--font-title);margin-bottom:8px;letter-spacing:1px">🏝️ ĐẢO ĐÃ KHÁM PHÁ (${window.navalData.islandDiscoveries.length})</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${window.navalData.islandDiscoveries.map(isl => `
              <div style="padding:5px 12px;border-radius:8px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2)">
                <div style="font-size:10px;color:#fbbf24">🏝️ ${isl.name}</div>
                <div style="font-size:9px;color:var(--white-dim)">${OE_ZONES[isl.zone]?.name||isl.zone} · Năm ${isl.year}</div>
              </div>`).join("")}
          </div>
        </div>` : ""}
    </div>`;
}

// ── TAB: LỊCH SỬ ────────────────────────────────────────────
function oeRenderHistoryTab() {
  const hist = window.navalData?.oceanHistory || [];
  if (hist.length === 0) return `<div style="text-align:center;padding:60px;color:var(--white-dim)"><div style="font-size:48px">📜</div><div>Chưa có sự kiện đại dương nào.</div></div>`;

  const typeColors = {
    disaster:"#f87171", fortune:"#4ade80", discovery:"#fbbf24",
    mystical:"#c084fc", raid:"#f97316", naval_battle:"#f87171",
    pirate_raid:"#f97316", monster_attack:"#c084fc",
    ocean_event:"#60a5fa", pirate_defeated:"#4ade80", monster_slain:"#fbbf24",
  };

  return `
    <div style="display:flex;flex-direction:column;gap:6px">
      ${hist.map(ev => {
        const color = typeColors[ev.type] || "#9ca3af";
        return `
          <div style="display:flex;gap:10px;padding:10px 12px;border-radius:8px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.05);border-left:2px solid ${color}">
            <div style="font-size:16px;flex-shrink:0">${ev.icon||"🌊"}</div>
            <div style="flex:1">
              <div style="font-size:11px;color:var(--white-main)">${ev.name || ev.text}</div>
              <div style="font-size:9px;color:var(--white-dim);margin-top:2px">${ev.zoneName ? `${OE_ZONES[ev.zoneId]?.icon||""} ${ev.zoneName} · ` : ""}Năm ${ev.year}${ev.islandName ? ` · 🏝️ ${ev.islandName}` : ""}</div>
            </div>
            <div style="font-size:8px;padding:2px 7px;border-radius:6px;background:${color}15;border:1px solid ${color}30;color:${color};height:fit-content;flex-shrink:0">${ev.type?.replace("_"," ")}</div>
          </div>`;
      }).join("")}
    </div>`;
}

// ── NAV BUTTON SHOW ──────────────────────────────────────────
function oeShowNavBtn() {
  const btn = document.querySelector('.nav-btn[data-panel="naval-ocean"]');
  if (btn) { btn.style.display = ""; btn.classList.remove("ec-hidden"); }
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    oeInit();
    oeShowNavBtn();

    setInterval(function() {
      if (window.world) {
        oeTick();
        const active = document.querySelector('.nav-btn.active[data-panel="naval-ocean"]');
        if (active) oeRenderPanel();
      }
    }, 13000);
  }, 3200);
});
