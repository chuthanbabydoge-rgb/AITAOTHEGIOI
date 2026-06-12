/* ============================================================
   DUNGEON & SECRET REALM SYSTEM — V7
   dungeonSystem.js
   Không sửa các hệ thống hiện có.
   ============================================================ */

// ============================================================
// STATE
// ============================================================

let dungeons = [];   // Dungeon array (persistent)
let _dungeonIdCtr = 1;

// ============================================================
// DUNGEON TEMPLATES — per genre
// ============================================================

const DUNGEON_TEMPLATES_BY_GENRE = {
  cultivation: [
    { name:"Huyết Ma Động", icon:"🩸", difficulty:"easy", levelRequired:0, theme:"blood", bossPool:["Huyết Ma Tướng","Tà Ma Quỷ Vương","Huyết Linh Cổ Thú"], rewardRarity:"uncommon", dangerRate:0.08, floors:3, desc:"Hang động tẩm máu ma đạo, tà khí nghi ngút." },
    { name:"Cô Hồn Miếu",   icon:"👻", difficulty:"easy", levelRequired:0, theme:"ghost", bossPool:["U Linh Quỷ Chủ","Mê Hồn Quỷ Nữ","Vong Linh Cổ Thần"], rewardRarity:"uncommon", dangerRate:0.07, floors:3, desc:"Miếu cổ linh hồn vất vưởng, oán khí ngàn năm." },
    { name:"Linh Thú Sơn",   icon:"🐾", difficulty:"easy", levelRequired:0, theme:"beast", bossPool:["Ngũ Sắc Linh Hổ","Vương Giả Linh Thú","Cổ Thú Chúa"], rewardRarity:"rare", dangerRate:0.10, floors:4, desc:"Sơn lâm linh thú hung hãn, ẩn chứa linh thảo quý." },
    { name:"Vạn Cốt Mộ",     icon:"💀", difficulty:"medium", levelRequired:2, theme:"undead", bossPool:["Xương Cốt Đại Vương","Vạn Cốt Ác Linh","Tử Thần Cổ Vương"], rewardRarity:"rare", dangerRate:0.18, floors:5, desc:"Mộ địa vạn xương, nơi chôn vùi vô số anh hùng." },
    { name:"Hỏa Diệm Sơn Phủ",icon:"🌋",difficulty:"medium", levelRequired:3, theme:"fire", bossPool:["Hỏa Linh Thần Thú","Viêm Ma Đại Thánh","Chân Hỏa Cổ Thần"], rewardRarity:"epic", dangerRate:0.20, floors:6, desc:"Phủ điện dưới núi lửa, linh hỏa thiên niên bảo vật." },
    { name:"Băng Hồn Cổ Mộ",  icon:"❄️", difficulty:"medium", levelRequired:3, theme:"ice", bossPool:["Băng Linh Cổ Ma","Hàn Băng Vương Giả","Vạn Niên Băng Hồn"], rewardRarity:"epic", dangerRate:0.22, floors:6, desc:"Cổ mộ đóng băng vĩnh cửu, linh tài vô số." },
    { name:"Long Thần Điện",   icon:"🐉", difficulty:"hard", levelRequired:5, theme:"dragon", bossPool:["Long Thần Phân Thân","Cổ Long Chi Tổ","Vương Giả Thần Long"], rewardRarity:"epic", dangerRate:0.28, floors:8, desc:"Điện đường thần long cổ đại, long khí ngàn dặm." },
    { name:"Thiên Ma Cổ Tháp", icon:"🏯", difficulty:"hard", levelRequired:5, theme:"demon", bossPool:["Ma Thần Phân Thân","Thiên Ma Chi Tổ","Vạn Ma Chí Tôn"], rewardRarity:"legendary", dangerRate:0.30, floors:9, desc:"Cổ tháp ma thần, mỗi tầng một cõi địa ngục." },
    { name:"Thái Cổ Thần Lăng",icon:"🌌", difficulty:"extreme", levelRequired:7, theme:"primal", bossPool:["Thái Cổ Thần Vương","Thỉ Nguyên Đại Ma","Khai Thiên Cổ Thần"], rewardRarity:"legendary", dangerRate:0.42, floors:15, desc:"Lăng mộ thần minh thái cổ, uy áp trấn vũ trụ." },
  ],
  fantasy: [
    { name:"Mê Cung Goblin",   icon:"👺", difficulty:"easy", levelRequired:0, theme:"goblin", bossPool:["Goblin Đại Vương","Trộm Bóng Tối","Tên Lính Tiền Tiêu"], rewardRarity:"uncommon", dangerRate:0.08, floors:3, desc:"Hang ổ goblin nhộn nhịp, đầy bẫy và cạm bẫy." },
    { name:"Hầm Ngục Tử Thần", icon:"⛓️", difficulty:"easy", levelRequired:0, theme:"dungeon", bossPool:["Cai Ngục Ác Quỷ","Hồn Ma Tù Nhân","Cai Xác Chết"], rewardRarity:"uncommon", dangerRate:0.09, floors:3, desc:"Hầm ngục bỏ hoang, hồn ma vẫn còn lảng vảng." },
    { name:"Rừng Yêu Tinh",    icon:"🌲", difficulty:"easy", levelRequired:0, theme:"fey", bossPool:["Nữ Hoàng Yêu Tinh","Ma Rừng Cổ Đại","Hắc Long Xanh"], rewardRarity:"rare", dangerRate:0.10, floors:4, desc:"Rừng phép thuật, nơi yêu tinh cai trị." },
    { name:"Lâu Đài Ma Cà Rồng",icon:"🏰",difficulty:"medium", levelRequired:2, theme:"vampire", bossPool:["Bá Tước Ma Cà Rồng","Quỷ Đêm Cổ Đại","Chúa Quỷ Bóng Tối"], rewardRarity:"rare", dangerRate:0.18, floors:5, desc:"Lâu đài cổ, lãnh địa ma cà rồng ngàn năm." },
    { name:"Sào Huyệt Rồng",   icon:"🐲", difficulty:"hard", levelRequired:4, theme:"dragon", bossPool:["Rồng Lửa Cổ Đại","Rồng Băng Khổng Lồ","Rồng Vàng Huyền Thoại"], rewardRarity:"epic", dangerRate:0.28, floors:8, desc:"Sào huyệt rồng cổ, kho báu vô tận chờ đợi." },
    { name:"Mê Cung Thiêng Liêng",icon:"⛪",difficulty:"hard", levelRequired:5, theme:"holy", bossPool:["Thần Binh Sa Ngã","Thiên Sứ Phản Loạn","Chúa Quỷ Thánh Giá"], rewardRarity:"legendary", dangerRate:0.30, floors:9, desc:"Thánh đường bị ô uế, thần binh trở thành ác quỷ." },
    { name:"Vực Thẳm Địa Ngục", icon:"🔥", difficulty:"extreme", levelRequired:6, theme:"hell", bossPool:["Vua Địa Ngục","Ác Quỷ Tối Thượng","Chúa Quỷ Đệ Nhất"], rewardRarity:"legendary", dangerRate:0.40, floors:12, desc:"Vực thẳm địa ngục thực sự, nơi chúa quỷ ngự trị." },
  ],
  zombie: [
    { name:"Bệnh Viện Tử Thần", icon:"🏥", difficulty:"easy", levelRequired:0, theme:"hospital", bossPool:["Zombie Bác Sĩ","Zombie Bệnh Binh","Siêu Lây Nhiễm"], rewardRarity:"uncommon", dangerRate:0.10, floors:3, desc:"Bệnh viện bỏ hoang, zombie nghễu nghện đầy lối." },
    { name:"Trường Học Ma",     icon:"🏫", difficulty:"easy", levelRequired:0, theme:"school", bossPool:["Zombie Giáo Viên","Đám Học Sinh Xác","Zombie To Lớn"], rewardRarity:"uncommon", dangerRate:0.09, floors:3, desc:"Trường học từng nhộn nhịp, nay đầy xác sống." },
    { name:"Khu Dân Cư Dịch",  icon:"🏘️", difficulty:"medium", levelRequired:2, theme:"suburb", bossPool:["Zombie Tiến Hóa","Đầu Đàn Bầy Dịch","Xác Đột Biến"], rewardRarity:"rare", dangerRate:0.18, floors:5, desc:"Khu dân cư nhiễm virus, zombie biến thể hung ác." },
    { name:"Căn Cứ Quân Sự",   icon:"🏗️", difficulty:"hard", levelRequired:4, theme:"military", bossPool:["Zombie Lính Đặc Nhiệm","Zombie Vũ Trang","Chỉ Huy Nhiễm Dịch"], rewardRarity:"epic", dangerRate:0.28, floors:7, desc:"Căn cứ quân sự bị chiếm, vũ khí chờ đón người dũng cảm." },
    { name:"Phòng Thí Nghiệm Nguồn Gốc",icon:"🔬",difficulty:"extreme", levelRequired:6, theme:"lab", bossPool:["Virus Nguyên Thủy","Siêu Zombie Thể Nghiệm","Bác Sĩ Điên Nhiễm Dịch"], rewardRarity:"legendary", dangerRate:0.42, floors:12, desc:"Nơi virus bắt đầu — nguồn gốc tận diệt nhân loại." },
  ],
  mythology: [
    { name:"Đền Thần Cổ",     icon:"🛕", difficulty:"easy", levelRequired:0, theme:"temple", bossPool:["Linh Hồn Tư Tế","Thần Vệ Binh","Ác Thần Nhỏ"], rewardRarity:"uncommon", dangerRate:0.08, floors:3, desc:"Đền thần cổ đại bị ô uế, linh hồn cổ giữ kho báu." },
    { name:"Mê Cung Minotaur", icon:"🐂", difficulty:"medium", levelRequired:2, theme:"labyrinth", bossPool:["Minotaur Cổ Đại","Quái Vật Mê Cung","Bóng Tối Olympus"], rewardRarity:"rare", dangerRate:0.20, floors:6, desc:"Mê cung huyền thoại, Minotaur lùng sục con mồi." },
    { name:"Hang Rắn Medusa",  icon:"🐍", difficulty:"hard", levelRequired:4, theme:"medusa", bossPool:["Medusa Thực Sự","Rắn Cổ Đại Khổng Lồ","Quỷ Đá Hóa"], rewardRarity:"epic", dangerRate:0.28, floors:8, desc:"Hang ổ Medusa, một cái nhìn sẽ hóa đá." },
    { name:"Cổng Địa Ngục Tartarus",icon:"⚫",difficulty:"extreme",levelRequired:7,theme:"tartarus", bossPool:["Cerberus","Titan Cổ Đại","Hades Phân Thân"], rewardRarity:"legendary", dangerRate:0.45, floors:15, desc:"Cổng địa ngục sâu nhất, nơi Titan bị giam cầm." },
  ],
  scifi: [
    { name:"Trạm Vũ Trụ Bỏ Hoang",icon:"🛸",difficulty:"easy", levelRequired:0, theme:"station", bossPool:["Robot Hỏng","AI Nổi Loạn Nhỏ","Người Ngoài Hành Tinh Yếu"], rewardRarity:"uncommon", dangerRate:0.09, floors:3, desc:"Trạm vũ trụ bỏ hoang, robot điên và kẻ ngoại lai." },
    { name:"Tàu Chiến Bị Chiếm", icon:"🚀",difficulty:"medium", levelRequired:2, theme:"ship", bossPool:["Chỉ Huy Alien","Máy Giết Người","Mutant Không Gian"], rewardRarity:"rare", dangerRate:0.18, floors:5, desc:"Tàu chiến liên hành tinh bị alien chiếm đóng." },
    { name:"Phòng Thí Nghiệm Sinh Học",icon:"🧬",difficulty:"hard",levelRequired:4,theme:"biolab", bossPool:["Thực Thể Tiến Hóa","Siêu Virus AI","Thí Nghiệm Thất Bại"], rewardRarity:"epic", dangerRate:0.28, floors:7, desc:"Phòng thí nghiệm sinh học vũ trụ, quái vật thoát ra." },
    { name:"Lõi Trí Tuệ Nhân Tạo",icon:"🤖",difficulty:"extreme",levelRequired:6,theme:"ai_core", bossPool:["Siêu AI Cấp Thần","Mạng Lưới Ý Thức","Máy Chúa Tể"], rewardRarity:"legendary", dangerRate:0.40, floors:12, desc:"Lõi siêu AI tự tiến hóa, kiểm soát cả thiên hà." },
  ],
};

// Fallback chung nếu genre không có
const DUNGEON_TEMPLATES = DUNGEON_TEMPLATES_BY_GENRE.cultivation;

// ── Reward name pools per theme ──
const DUNGEON_REWARD_NAMES = {
  blood:     ["Huyết Ma Đan","Tà Ma Tinh Huyết","Huyết Linh Bảo","Huyết Thần Kỳ"],
  ghost:     ["U Linh Ngọc","Cô Hồn Tinh Thạch","Mê Hồn Bảo","Vong Linh Dược"],
  beast:     ["Linh Thú Nội Đan","Vương Giả Thú Cốt","Thiên Linh Thú Huyết","Thú Chúa Tinh"],
  undead:    ["Tử Ma Tinh Cốt","Vạn Cốt Đan","Âm Linh Thần Ngọc","Bất Diệt Chi Cốt"],
  construct: ["Cổ Cơ Hạch Tâm","Thiết Giáp Thánh Kim","Vạn Cơ Trận Đồ","Bất Hủy Chi Thể"],
  fire:      ["Tam Muội Chân Hỏa","Hỏa Linh Thần Đan","Thiên Hỏa Tinh Ngọc","Liệt Dương Bảo"],
  ice:       ["Vạn Niên Hàn Tinh","Băng Hồn Ngọc Châu","Tuyết Linh Thần Đan","Bắc Minh Hàn Ngọc"],
  dragon:    ["Long Cốt Tinh","Cửu Long Thần Đan","Long Vương Bảo Ấn","Thần Long Huyết"],
  demon:     ["Thiên Ma Tâm","Ma Thần Tinh Huyết","Vạn Ma Chi Nguyên","Ma Đế Thánh Dược"],
  sword:     ["Thần Kiếm Tinh","Kiếm Đạo Bí Điển","Cửu Tiêu Kiếm Khí","Chí Tôn Kiếm Hồn"],
  void:      ["Hư Không Bảo Tinh","U Minh Thần Châu","Vô Cực Hắc Tinh","Hư Vô Đan Vương"],
  primal:    ["Thái Cổ Thần Hồn","Khai Thiên Phủ Bảo","Vạn Cổ Chí Tôn Đan","Nguyên Thủy Thần Bảo"],
};

// ── Boss loot specials (inheritance / techniques) ──
const BOSS_INHERITANCE = [
  "Tru Tiên Kiếm Quyết","Cửu Âm Chân Kinh","Bất Tử Thánh Thể","Hỗn Độn Công","Thiên Ma Vô Cực Công",
  "Long Vương Bá Thể","Cửu Thiên Lôi Pháp","Vạn Tướng Thần Công","Tiên Thiên Bát Quái Trận","Ma Đạo Thiên Thư",
  "Thần Kiếm Thiên Pháp","Bất Diệt Kim Thân","Vô Thượng Chứng Đạo Quyết","Cửu U Huyền Công",
];

const DUNGEON_CLEAR_TEXTS = [
  "tảo sạch toàn bộ dungeon",
  "hạ gục boss cường đại",
  "phá trận cổ đại, thâu tóm bảo vật",
  "xuyên qua chín tầng địa ngục",
  "khuất phục thần thú cổ đại",
];

// ============================================================
// SECRET REALM ADDITIONS (named realms as per request)
// ============================================================

const NAMED_SECRET_REALMS = [
  {
    name: "Thượng Cổ Bí Cảnh",  icon: "🌟", dangerLevel: "legendary",
    danger: 0.30, minRealm: 6, duration: 15, capacity: 2,
    rewardRarity: "legendary", theme: "primal",
    desc: "Bí cảnh từ thời thượng cổ, ẩn chứa di bảo thiên địa.",
  },
  {
    name: "Thiên Đế Truyền Thừa", icon: "👑", dangerLevel: "legendary",
    danger: 0.20, minRealm: 7, duration: 20, capacity: 1,
    rewardRarity: "legendary", theme: "dao",
    desc: "Truyền thừa của Thiên Đế, chỉ kẻ có duyên mới tiếp nhận.",
  },
  {
    name: "Thần Long Di Tích",    icon: "🐉", dangerLevel: "epic",
    danger: 0.25, minRealm: 5, duration: 12, capacity: 3,
    rewardRarity: "legendary", theme: "dragon",
    desc: "Di tích thần long ngàn năm, long cốt và long huyết ẩn sâu.",
  },
  {
    name: "Thiên Kiếm Bí Địa",   icon: "⚔️", dangerLevel: "epic",
    danger: 0.22, minRealm: 4, duration: 10, capacity: 4,
    rewardRarity: "epic", theme: "sword",
    desc: "Bí địa nơi thiên kiếm trường an, kiếm đạo chí lý.",
  },
  {
    name: "Tứ Tượng Linh Địa",   icon: "🌈", dangerLevel: "rare",
    danger: 0.15, minRealm: 3, duration: 8,  capacity: 5,
    rewardRarity: "epic", theme: "ancient",
    desc: "Thánh địa bốn linh thú bảo hộ, linh khí sung mãn.",
  },
  {
    name: "Lôi Nguyên Cổ Cảnh",  icon: "⚡", dangerLevel: "rare",
    danger: 0.18, minRealm: 3, duration: 7,  capacity: 5,
    rewardRarity: "epic", theme: "thunder",
    desc: "Nguyên bản lôi pháp, thiên lôi bất tuyệt.",
  },
];

// ============================================================
// GENERATE DUNGEON
// ============================================================

function generateDungeon() {
  if (!world) return null;
  // Chọn template theo genre của thế giới hiện tại
  const genreKey = (world.templateKey || world.genre || "cultivation");
  const pool = DUNGEON_TEMPLATES_BY_GENRE[genreKey] || DUNGEON_TEMPLATES_BY_GENRE.cultivation;
  const template = rand(pool);

  const diffMap = { easy: 1, medium: 2, hard: 3, extreme: 4 };
  const id = `dg_${_dungeonIdCtr++}_${Date.now().toString(36).slice(-4)}`;

  const dungeon = {
    id,
    name:          template.name,
    icon:          template.icon,
    difficulty:    template.difficulty,
    difficultyNum: diffMap[template.difficulty] || 1,
    levelRequired: template.levelRequired,
    theme:         template.theme,
    boss:          rand(template.bossPool),
    bossDefeated:  false,
    floors:        template.floors,
    floorsCleared: 0,
    dangerRate:    template.dangerRate,
    rewardRarity:  template.rewardRarity,
    desc:          template.desc,
    discoveredYear: year,
    status:        "active",    // active | cleared | collapsed
    explorers:     [],          // { npcId, npcName, result, reward, year }
    clearLog:      [],
    totalAttempts: 0,
    totalClears:   0,
    firstClearBy:  null,
  };

  dungeons.unshift(dungeon);
  if (dungeons.length > 100) dungeons.pop();

  addLog(`🏰 ${template.icon} ${template.name} [${_diffLabel(template.difficulty)}] xuất hiện!`, "important");
  addTimeline(`🏰 ${template.name} khai mở`, "important", "🏰");

  if (typeof addWorldHistory === "function") {
    addWorldHistory("boss", `Dungeon ${template.name} xuất hiện, boss ${dungeon.boss} trấn giữ.`, { dungeon: dungeon.name });
  }

  return dungeon;
}

// ── Generate a named secret realm ──
function generateSecretRealm(forcedTemplate = null) {
  if (!world) return null;

  const alive = npcs.filter(n => n.status === "alive");
  const maxRealm = alive.length ? Math.max(...alive.map(n => n.realm)) : 0;

  let template = forcedTemplate;
  if (!template) {
    const pool = NAMED_SECRET_REALMS.filter(t => t.minRealm <= maxRealm);
    if (!pool.length) return null;
    template = rand(pool);
  }

  // Delegate to existing spawnSecretRealm-style logic but with the named template
  const realmId = `nsr_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const eligible = alive.filter(n => !n.inSecretRealm && n.realm >= template.minRealm);
  const participants = eligible.filter(() => chance(0.45))
    .sort(() => Math.random() - 0.5)
    .slice(0, template.capacity);

  const explorationLog = [];
  const participantRecords = [];

  explorationLog.push(`🌀 ${template.icon} ${template.name} xuất hiện — ${template.desc}`);
  addLog(`🌀 ${template.icon} ${template.name} khai mở!`, "important");
  addTimeline(`🌀 ${template.name} mở cửa`, "important", "🌀");

  participants.forEach(npc => {
    npc.inSecretRealm = true;
    const roll = Math.random();
    if (roll < template.danger * 0.5) {
      killNPC(npc, `tử vong trong ${template.name}`);
      explorationLog.push(`☠️ ${npc.name} đã vĩnh viễn ngủ trong ${template.name}`);
      addLog(`☠️ ${npc.name} tử vong trong ${template.name}`, "death");
      participantRecords.push({ npcId: npc.id, npcName: npc.name, result: "death", reward: null });
    } else {
      const reward = generateRealmReward(template, npc);
      applyRealmReward(npc, reward, template.name);
      npc.inSecretRealm = false;
      if (!npc.realmExplored) npc.realmExplored = 0;
      npc.realmExplored++;
      npc.biography = npc.biography || [];
      npc.biography.push({ year, event: `Thám hiểm ${template.name}, nhận ${reward.display}.` });
      explorationLog.push(`🏆 ${npc.name} thu được ${reward.display}`);
      addLog(`🏆 ${npc.name} thu được ${reward.display} trong ${template.name}`, "important");
      participantRecords.push({ npcId: npc.id, npcName: npc.name, result: "success", reward });
    }
  });

  const realm = {
    id:           realmId,
    name:         template.name,
    icon:         template.icon,
    level:        template.dangerLevel,
    rewardRarity: template.rewardRarity,
    danger:       template.danger,
    dangerLevel:  template.dangerLevel,
    minRealm:     template.minRealm,
    duration:     template.duration,
    capacity:     template.capacity,
    theme:        template.theme,
    desc:         template.desc,
    discovered:   true,
    discoveredYear: year,
    openYear:     year,
    closeYear:    year + template.duration,
    status:       participants.length > 0 ? "active" : "dormant",
    participants: participantRecords,
    explorationLog,
    totalExplored: participantRecords.length,
    survivors:    participantRecords.filter(p => p.result !== "death").length,
    deaths:       participantRecords.filter(p => p.result === "death").length,
    successes:    participantRecords.filter(p => p.result === "success").length,
  };

  if (typeof secretRealms !== "undefined") {
    secretRealms.unshift(realm);
    if (secretRealms.length > 80) secretRealms.pop();
  }

  toast(`🌀 ${template.icon} ${template.name} khai mở! ${participants.length} tu sĩ tham gia.`);
  return realm;
}

// ============================================================
// ENTER DUNGEON (Player action)
// ============================================================

function enterDungeon(dungeonId) {
  if (!player || player.status !== "alive") {
    toast("⚠️ Nhân vật chưa tạo hoặc đã tử vong!"); return;
  }
  const dg = dungeons.find(d => d.id === dungeonId);
  if (!dg) { toast("⚠️ Dungeon không tồn tại!"); return; }
  if (dg.status === "cleared" || dg.status === "collapsed") {
    toast("⚠️ Dungeon này đã đóng cửa!"); return;
  }
  if (player.realm < dg.levelRequired) {
    toast(`⚠️ Cần đạt ${REALMS[dg.levelRequired].name} để vào dungeon này!`); return;
  }
  if (player.inDungeon) {
    toast("⚠️ Đang trong dungeon khác!"); return;
  }

  // Combat simulation
  const playerPower  = player.attack + player.defense + player.realm * 100 + player.luck;
  const dungeonPower = dg.difficultyNum * 300 + dg.floors * 80;
  const winChance    = Math.min(0.92, Math.max(0.15,
    playerPower / (playerPower + dungeonPower) + (player.luck / 200)
  ));

  dg.totalAttempts++;
  const log = [];
  log.push(`⚔️ ${player.name} tiến vào ${dg.icon} ${dg.name}...`);

  if (chance(1 - winChance)) {
    // Failure — injured, lose some HP
    const hpLoss = Math.floor(player.maxHp * (0.3 + Math.random() * 0.4));
    player.hp = Math.max(1, player.hp - hpLoss);
    log.push(`💔 ${player.name} bị đánh bại trong ${dg.name}, HP -${hpLoss}`);
    addLog(`💔 ${player.name} thất bại tại ${dg.name}`, "normal");
    toast(`💔 Thất bại tại ${dg.name}! HP còn ${player.hp}/${player.maxHp}`);

    dg.explorers.push({ npcId: player.id, npcName: player.name, result: "fail", reward: null, year });
    player.manualActions = player.manualActions || [];
    player.manualActions.push({ year, action: `Thất bại tại ${dg.name}` });
    if (player.manualActions.length > 20) player.manualActions.shift();

    renderDungeonPanel();
    renderPlayerPanel();
    save();
    return;
  }

  // Success — clear dungeon!
  clearDungeon(dungeonId, true /* player cleared */);
}

// ============================================================
// CLEAR DUNGEON
// ============================================================

function clearDungeon(dungeonId, byPlayer = false) {
  const dg = dungeons.find(d => d.id === dungeonId);
  if (!dg) return;

  const clearer = byPlayer && player ? player : (() => {
    const alive = npcs.filter(n => n.status === "alive" && n.realm >= dg.levelRequired);
    return alive.length ? rand(alive) : null;
  })();
  if (!clearer) return;

  dg.floorsCleared  = dg.floors;
  dg.bossDefeated   = true;
  dg.status         = "cleared";
  dg.clearedYear    = year;
  dg.totalClears++;
  if (!dg.firstClearBy) dg.firstClearBy = clearer.name;

  const clearText = rand(DUNGEON_CLEAR_TEXTS);

  // Build rewards
  const rewards = _generateDungeonRewards(dg, clearer);
  dg.clearLog.push(`🏆 Năm ${year}: ${clearer.name} ${clearText}`);

  // Apply rewards
  rewards.forEach(r => _applyDungeonReward(clearer, r, dg));

  // If player cleared
  if (byPlayer && clearer === player) {
    player.manualActions = player.manualActions || [];
    player.manualActions.push({ year, action: `Thám hiểm ${dg.name}, hạ boss ${dg.boss}! Nhận: ${rewards.map(r=>r.display).join(", ")}` });
    if (player.manualActions.length > 20) player.manualActions.shift();
    player.biography = player.biography || [];
    player.biography.push({ year, event: `Thám hiểm ${dg.name}, hạ gục ${dg.boss}, nhận ${rewards[0]?.display || "bảo vật"}.` });
    if (player.dungeonClears === undefined) player.dungeonClears = 0;
    player.dungeonClears++;
    heavenPoints += dg.difficultyNum * 20;
  }

  dg.explorers.push({
    npcId:   clearer.id,
    npcName: clearer.name,
    result:  "clear",
    boss:    dg.boss,
    rewards: rewards.map(r => r.display),
    year,
  });

  const rewardStr = rewards.slice(0, 2).map(r => r.display).join("、");
  addLog(`🏆 ${clearer.name} thám hiểm ${dg.icon} ${dg.name} — hạ ${dg.boss}! Nhận: ${rewardStr}`, "important");
  addTimeline(`🏆 ${clearer.name} hạ gục ${dg.boss}`, "important", "🏆");

  if (typeof addWorldHistory === "function") {
    addWorldHistory("boss", `${clearer.name} hạ gục ${dg.boss} trong ${dg.name}, thu bảo vật.`, { winner: clearer.name, dungeon: dg.name });
  }

  toast(`🏆 ${clearer.name} thám hiểm ${dg.name}! Hạ boss ${dg.boss}!`);

  renderDungeonPanel();
  if (byPlayer) renderPlayerPanel();
  save();
}

// ── Internal: build reward list ──
function _generateDungeonRewards(dg, npc) {
  const rewards = [];
  const count = dg.difficultyNum + 1; // easy=2, medium=3, hard=4, extreme=5

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const rarityMap = {
      uncommon:  ["uncommon","rare"],
      rare:      ["rare","epic"],
      epic:      ["epic","legendary"],
      legendary: ["legendary"],
    };
    const allowed = rarityMap[dg.rewardRarity] || ["rare"];

    if (roll < 0.20 && i === 0) {
      // Boss inheritance (techniques)
      const tech = rand(BOSS_INHERITANCE);
      rewards.push({ type: "inheritance", name: tech, display: `📖 ${tech}` });
    } else if (roll < 0.40) {
      // Named dungeon weapon/artifact
      const themeNames = DUNGEON_REWARD_NAMES[dg.theme] || DUNGEON_REWARD_NAMES.ancient || ["Cổ Thần Bảo"];
      const name = rand(themeNames);
      const allPool = [...(ITEM_POOL||[]), ...(WEAPON_POOL||[]), ...(ARMOR_POOL||[])];
      const base = rand(allPool.filter(it => allowed.includes(it.rarity)));
      if (base) {
        rewards.push({ type: "item", item: { ...base, name, id: `dg_item_${Date.now()}_${i}`, fromDungeon: dg.name }, display: `${base.icon||"⚔️"} ${name}` });
      }
    } else if (roll < 0.58) {
      // Linh thạch
      const amt = randInt(1000, 8000) * dg.difficultyNum;
      rewards.push({ type: "wealth", amount: amt, display: `💎 ${amt} linh thạch` });
    } else if (roll < 0.74) {
      // Danh vọng
      const amt = randInt(200, 1000) * dg.difficultyNum;
      rewards.push({ type: "prestige", amount: amt, display: `⭐ +${amt} danh vọng` });
    } else if (roll < 0.87) {
      // Cultivation boost
      rewards.push({ type: "cultivation", display: "✨ Đột phá cảnh giới" });
    } else {
      // Artifact từ hệ thống cũ
      if (typeof grantDungeonArtifact === "function") {
        const tier = { uncommon:1, rare:2, epic:3, legendary:4 }[dg.rewardRarity] || 2;
        grantDungeonArtifact(npc, tier);
        rewards.push({ type: "artifact", display: `💠 Tiên Khí Thần Bảo` });
      } else {
        const amt = randInt(500, 3000) * dg.difficultyNum;
        rewards.push({ type: "wealth", amount: amt, display: `💎 ${amt} linh thạch` });
      }
    }
  }

  return rewards;
}

// ── Apply reward to any NPC/player ──
function _applyDungeonReward(npc, reward, dg) {
  switch (reward.type) {
    case "item":
      npc.inventory = npc.inventory || [];
      npc.inventory.push(reward.item);
      if (typeof autoEquipBestGear === "function" && reward.item.slot) autoEquipBestGear(npc);
      break;
    case "inheritance":
      npc.skills = npc.skills || [];
      if (!npc.skills.includes(reward.name) && npc.skills.length < 12) {
        npc.skills.push(reward.name);
      }
      break;
    case "wealth":
      npc.wealth = (npc.wealth || 0) + reward.amount;
      break;
    case "prestige":
      npc.reputation = (npc.reputation || 0) + reward.amount;
      break;
    case "cultivation":
      if (npc.realm < REALMS.length - 1) {
        npc.realm++;
        if (typeof applyRealmBonus === "function") applyRealmBonus(npc);
        npc.biography = npc.biography || [];
        npc.biography.push({ year, event: `Đột phá ${REALMS[npc.realm].name} sau khi thám hiểm ${dg.name}.` });
      }
      break;
  }
}

// ============================================================
// NPC AUTO-EXPLORE DUNGEONS
// ============================================================

function tickDungeons() {
  if (!world) return;

  const activeDungeons = dungeons.filter(d => d.status === "active");
  const activeCount = activeDungeons.length;

  // Luôn đảm bảo có dungeon — spawn mạnh hơn khi ít dungeon
  if (activeCount === 0)      { generateDungeon(); if (chance(0.5)) generateDungeon(); }
  else if (activeCount < 2)   { if (chance(0.40)) generateDungeon(); }
  else if (activeCount < 4)   { if (chance(0.15)) generateDungeon(); }
  else                        { if (chance(0.04)) generateDungeon(); }

  // Thỉnh thoảng sinh bí cảnh
  if (chance(0.03)) generateSecretRealm();

  // NPCs tự động thám hiểm dungeon
  activeDungeons.forEach(dg => {
    if (chance(0.20)) {
      const eligible = npcs.filter(n =>
        n.status === "alive" && n.realm >= dg.levelRequired && !n.inSecretRealm
      );
      if (eligible.length) {
        const npc = rand(eligible);
        const power    = npc.attack + npc.defense + npc.realm * 100;
        const required = dg.difficultyNum * 250;
        if (power >= required * 0.6 || chance(0.2)) {
          clearDungeon(dg.id, false);
        }
      }
    }
    // Dungeon sụp đổ sau 50 năm
    if (year - (dg.discoveredYear || year) > 50 && chance(0.02)) {
      dg.status = "collapsed";
      addLog(`💥 ${dg.icon} ${dg.name} sụp đổ sau nhiều năm.`, "normal");
    }
  });
}

// ============================================================
// PLAYER ENTER SECRET REALM
// ============================================================

function playerEnterSecretRealm(realmId) {
  if (!player || player.status !== "alive") {
    toast("⚠️ Nhân vật chưa tạo hoặc đã tử vong!"); return;
  }
  if (typeof secretRealms === "undefined") { toast("⚠️ Hệ thống bí cảnh chưa khởi tạo!"); return; }

  const realm = secretRealms.find(r => r.id === realmId);
  if (!realm) { toast("⚠️ Bí cảnh không tồn tại!"); return; }
  if (realm.status === "closed" || realm.status === "collapsed") {
    toast("⚠️ Bí cảnh này đã đóng cửa!"); return;
  }
  if (player.realm < (realm.minRealm || 0)) {
    toast(`⚠️ Cần đạt ${REALMS[realm.minRealm || 0].name} để vào!`); return;
  }
  if (player.inSecretRealm) {
    toast("⚠️ Đang ở trong bí cảnh!"); return;
  }

  // Use existing generateRealmReward / applyRealmReward
  const template = { ...realm, level: realm.level || "rare" };
  const roll = Math.random();

  addLog(`🌀 ${player.name} tiến vào ${realm.icon||"🌀"} ${realm.name}`, "important");

  if (roll < (realm.danger || 0.15) * 0.5) {
    // Injury
    const hpLoss = Math.floor(player.maxHp * (0.25 + Math.random() * 0.3));
    player.hp = Math.max(1, player.hp - hpLoss);
    toast(`💔 ${player.name} bị thương trong ${realm.name}!`);
    addLog(`💔 ${player.name} bị thương trong ${realm.name}, HP -${hpLoss}`, "normal");
    player.manualActions = player.manualActions || [];
    player.manualActions.push({ year, action: `Bị thương trong ${realm.name}` });
  } else if (typeof generateRealmReward === "function") {
    const reward = generateRealmReward(template, player);
    applyRealmReward(player, reward, realm.name);
    player.realmExplored = (player.realmExplored || 0) + 1;
    player.biography = player.biography || [];
    player.biography.push({ year, event: `Thám hiểm ${realm.name}, nhận ${reward.display}.` });
    player.manualActions = player.manualActions || [];
    player.manualActions.push({ year, action: `Vào ${realm.name}, nhận ${reward.display}` });
    if (player.manualActions.length > 20) player.manualActions.shift();
    addLog(`🏆 ${player.name} thu được ${reward.display} trong ${realm.name}`, "important");
    toast(`🏆 ${player.name} nhận được ${reward.display} trong ${realm.name}!`);
    heavenPoints += 20;
  }

  realm.participants = realm.participants || [];
  realm.participants.push({ npcId: player.id, npcName: player.name, result: "success", year });

  renderPlayerPanel();
  if (typeof renderSecretRealmsPanel === "function") renderSecretRealmsPanel();
  save();
}

// ============================================================
// RENDER: DUNGEON PANEL
// ============================================================

function renderDungeonPanel() {
  const panel = document.getElementById("panel-dungeon");
  if (!panel || !panel.classList.contains("active")) return;

  if (!world) {
    panel.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--white-dim)">Hãy tạo thế giới trước.</div>`;
    return;
  }

  const active    = dungeons.filter(d => d.status === "active");
  const cleared   = dungeons.filter(d => d.status === "cleared");
  const collapsed = dungeons.filter(d => d.status === "collapsed");

  panel.innerHTML = `
  <div class="panel-toolbar">
    <button class="btn-primary" onclick="generateDungeon();renderDungeonPanel();save()">⚡ Triệu Hồi Dungeon</button>
    <button class="btn-secondary" onclick="generateSecretRealm();if(typeof renderSecretRealmsPanel==='function')renderSecretRealmsPanel();save()">🌀 Mở Bí Cảnh Mới</button>
    <button class="btn-secondary" onclick="renderDungeonPanel()">🔄 Làm Mới</button>
    <div style="margin-left:auto;font-size:12px;color:var(--white-dim)">
      🏰 ${active.length} đang mở · ✅ ${cleared.length} đã clear · 💥 ${collapsed.length} sụp đổ
    </div>
  </div>

  <div class="panel-grid">

    <!-- ACTIVE DUNGEONS -->
    <div class="card span-full">
      <h2 class="card-title">🏰 Dungeon Đang Hoạt Động</h2>
      <div id="dg-active-list">
        ${active.length ? active.map(dg => _renderDungeonCard(dg)).join("") : `<div style="color:var(--white-dim);padding:16px">Chưa có dungeon nào đang hoạt động.</div>`}
      </div>
    </div>

    <!-- DUNGEON RANKING -->
    <div class="card">
      <h2 class="card-title">🏆 Bảng Xếp Hạng Dungeon</h2>
      <div id="dg-ranking">
        ${_renderDungeonRanking()}
      </div>
    </div>

    <!-- SECRET REALM QUICK ACCESS -->
    <div class="card">
      <h2 class="card-title">🌀 Bí Cảnh Nổi Bật</h2>
      <div id="dg-secretrealm-quick">
        ${_renderSecretRealmQuick()}
      </div>
    </div>

    <!-- CLEARED HISTORY -->
    <div class="card span-full">
      <h2 class="card-title">📜 Lịch Sử Thám Hiểm</h2>
      <div id="dg-cleared-list" style="max-height:320px;overflow-y:auto">
        ${cleared.length ? cleared.slice(0, 20).map(dg => _renderDungeonHistoryRow(dg)).join("") : `<div style="color:var(--white-dim);padding:12px">Chưa có dungeon nào được thám hiểm.</div>`}
      </div>
    </div>

  </div>
  `;
}

function _renderDungeonCard(dg) {
  const diffColor = { easy: "#4ade80", medium: "#facc15", hard: "#fb923c", extreme: "#f87171" };
  const col = diffColor[dg.difficulty] || "#94a3b8";
  const playerCanEnter = player && player.status === "alive" && player.realm >= dg.levelRequired;
  const topExplorers = dg.explorers.filter(e => e.result === "clear").slice(0, 3);

  return `
  <div class="dg-card" style="border-left:3px solid ${col};background:var(--bg-card2);border-radius:8px;padding:14px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:1.8em">${dg.icon}</span>
      <div style="flex:1">
        <div style="font-weight:700;color:var(--white)">${dg.name}</div>
        <div style="font-size:12px;color:${col};margin-top:2px">[${_diffLabel(dg.difficulty)}] · Boss: ${dg.boss} · ${dg.floors} tầng</div>
      </div>
      <div style="text-align:right;font-size:12px;color:var(--white-dim)">
        <div>Yêu cầu: ${REALMS[dg.levelRequired]?.name || "Luyện Khí"}</div>
        <div>Phần thưởng: <span style="color:#facc15">${_rarityLabel(dg.rewardRarity)}</span></div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--white-dim);margin-bottom:10px">${dg.desc}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${playerCanEnter
        ? `<button class="btn-primary" style="font-size:12px;padding:5px 12px" onclick="enterDungeon('${dg.id}')">⚔️ Thám Hiểm</button>`
        : `<button class="btn-secondary" style="font-size:12px;padding:5px 12px;opacity:0.5" disabled title="Cần ${REALMS[dg.levelRequired]?.name}">⚔️ Cần ${REALMS[dg.levelRequired]?.name}</button>`
      }
      <button class="btn-secondary" style="font-size:12px;padding:5px 12px" onclick="clearDungeon('${dg.id}',false);renderDungeonPanel();save()">🤖 NPC Thám Hiểm</button>
      <span style="font-size:11px;color:var(--white-dim)">
        Nguy hiểm: ${Math.round(dg.dangerRate*100)}% · Năm ${dg.discoveredYear}
      </span>
    </div>
    ${topExplorers.length ? `
      <div style="margin-top:8px;font-size:11px;color:var(--white-dim)">
        🏆 Đã clear bởi: ${topExplorers.map(e => e.npcName).join("、")}
      </div>` : ""}
  </div>`;
}

function _renderDungeonRanking() {
  const heroes = [];

  // Count clears per character
  dungeons.forEach(dg => {
    dg.explorers.filter(e => e.result === "clear").forEach(e => {
      const existing = heroes.find(h => h.name === e.npcName);
      if (existing) {
        existing.clears++;
        if (dg.difficulty === "extreme" || dg.difficulty === "hard") existing.score += 3;
        else existing.score += 1;
      } else {
        heroes.push({ name: e.npcName, clears: 1, score: dg.difficulty === "extreme" ? 3 : dg.difficulty === "hard" ? 2 : 1 });
      }
    });
  });

  heroes.sort((a, b) => b.score - a.score);
  const top = heroes.slice(0, 10);

  if (!top.length) return `<div style="color:var(--white-dim);padding:12px">Chưa có anh hùng nào.</div>`;

  return `
  <table style="width:100%;font-size:13px;border-collapse:collapse">
    <thead>
      <tr style="color:var(--white-dim);border-bottom:1px solid var(--border)">
        <th style="text-align:left;padding:6px 4px">#</th>
        <th style="text-align:left;padding:6px 4px">Tên</th>
        <th style="text-align:center;padding:6px 4px">Clears</th>
        <th style="text-align:center;padding:6px 4px">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${top.map((h, i) => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:6px 4px;color:${i===0?"#facc15":i===1?"#94a3b8":i===2?"#fb923c":"var(--white-dim)"}">
          ${i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
        </td>
        <td style="padding:6px 4px;color:var(--white)">${h.name}</td>
        <td style="padding:6px 4px;text-align:center;color:var(--white)">${h.clears}</td>
        <td style="padding:6px 4px;text-align:center;color:#facc15">${h.score}</td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function _renderSecretRealmQuick() {
  if (typeof secretRealms === "undefined") return `<div style="color:var(--white-dim);padding:12px">Chưa có bí cảnh.</div>`;
  const active = secretRealms.filter(r => r.status !== "closed").slice(0, 5);
  if (!active.length) return `<div style="color:var(--white-dim);padding:12px">Hiện không có bí cảnh nào đang mở.</div>`;

  return active.map(r => {
    const playerCanEnter = player && player.status === "alive" && player.realm >= (r.minRealm || 0) && !player.inSecretRealm;
    return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span style="font-size:1.4em">${r.icon||"🌀"}</span>
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px;color:var(--white)">${r.name}</div>
        <div style="font-size:11px;color:var(--white-dim)">
          Đóng: Năm ${r.closeYear||"?"} · ${r.participants?.length||0} tu sĩ đã vào
        </div>
      </div>
      ${playerCanEnter
        ? `<button class="btn-primary" style="font-size:11px;padding:4px 8px" onclick="playerEnterSecretRealm('${r.id}')">🌀 Vào</button>`
        : `<span style="font-size:11px;color:var(--white-dim)">${player && player.realm < (r.minRealm||0) ? `Cần ${REALMS[r.minRealm||0]?.name||"cao hơn"}` : "Đủ điều kiện"}</span>`
      }
    </div>`;
  }).join("");
}

function _renderDungeonHistoryRow(dg) {
  const lastClear = dg.explorers.filter(e => e.result === "clear").slice(-1)[0];
  return `
  <div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.05)">
    <span style="font-size:1.4em">${dg.icon}</span>
    <div style="flex:1">
      <span style="font-weight:600;color:var(--white)">${dg.name}</span>
      <span style="margin-left:8px;font-size:11px;color:${dg.status==="cleared"?"#4ade80":"#94a3b8"}">[${dg.status==="cleared"?"✅ Đã Clear":"💥 Sụp Đổ"}]</span>
    </div>
    <div style="font-size:12px;color:var(--white-dim);text-align:right">
      ${lastClear ? `🏆 ${lastClear.npcName} · Năm ${lastClear.year}` : `Năm ${dg.clearedYear||dg.discoveredYear}`}
    </div>
  </div>`;
}

// ── Helper labels ──
function _diffLabel(d) {
  return { easy:"Dễ", medium:"Trung Bình", hard:"Khó", extreme:"Cực Khó" }[d] || d;
}
function _rarityLabel(r) {
  return { common:"Phổ Thông", uncommon:"Bất Thường", rare:"Hiếm", epic:"Sử Thi", legendary:"Huyền Thoại" }[r] || r;
}

// ============================================================
// PERSISTENCE HOOKS
// ============================================================

(function patchDungeonSystem() {
  document.addEventListener("DOMContentLoaded", function() {

    // Patch save
    const _origSave = window.save;
    if (typeof _origSave === "function") {
      window.save = function() {
        _origSave.call(this);
        try {
          localStorage.setItem("cgv7_dungeons",    JSON.stringify(dungeons.slice(0, 100)));
          localStorage.setItem("cgv7_dgIdCtr",     _dungeonIdCtr);
        } catch(e) { console.warn("Dungeon save failed:", e); }
      };
    }

    // Patch load — chỉ dùng cho single-world save cũ (multi-world dùng snapshot)
    const _origLoad = window.load;
    if (typeof _origLoad === "function") {
      window.load = function() {
        _origLoad.call(this);
        // Chỉ load từ localStorage nếu không có multi-world
        if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
          try {
            dungeons      = JSON.parse(localStorage.getItem("cgv7_dungeons"))  || [];
            _dungeonIdCtr = parseInt(localStorage.getItem("cgv7_dgIdCtr"))     || 1;
          } catch(e) { dungeons = []; _dungeonIdCtr = 1; }
        }
      };
    }

    // tickDungeons và renderDungeonPanel đã được gọi trực tiếp từ simulateWorld / showPanel / renderAll trong app.js
    // Không patch lại ở đây để tránh double-call

    // Load dungeon data on startup (single-world compat)
    if (typeof worlds === "undefined" || !worlds || worlds.length <= 1) {
      try {
        const saved = localStorage.getItem("cgv7_dungeons");
        if (saved) {
          dungeons      = JSON.parse(saved) || [];
          _dungeonIdCtr = parseInt(localStorage.getItem("cgv7_dgIdCtr")) || 1;
        }
      } catch(e) { dungeons = []; }
    }
  });
})();
