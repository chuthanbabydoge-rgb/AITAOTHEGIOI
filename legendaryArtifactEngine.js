/* ============================================================
   LEGENDARY ARTIFACT ENGINE — V1
   legendaryArtifactEngine.js
   CREATOR GOD V6 · PHASE NEXT · ARTIFACT ENGINE V1
   ============================================================
   KHÔNG XÓA: saves, worlds, NPCs, countries, sects, legends
   KHÔNG RESET: hệ thống cũ — chỉ MỞ RỘNG thêm
   ============================================================ */

'use strict';

// ============================================================
// SAVE KEY
// ============================================================
const LAE_SAVE_KEY = 'cgv6_legendaryArtifactEngine';

// ============================================================
// LEGENDARY ARTIFACT TYPES
// ============================================================
const LAE_TYPES = ['Sword','Spear','Bow','Armor','Ring','Pagoda','Seal','Cauldron','Formation Core'];

// ============================================================
// RARITY TIERS (align with existing ARTIFACT_RARITY_CONFIG)
// ============================================================
const LAE_RARITY = {
  common:    { label:'Phổ Thông',   color:'#94a3b8', glow:'rgba(148,163,184,0.25)', weight:45 },
  rare:      { label:'Quý Hiếm',    color:'#60a5fa', glow:'rgba(96,165,250,0.28)',  weight:25 },
  epic:      { label:'Sử Thi',      color:'#c084fc', glow:'rgba(192,132,252,0.3)',  weight:15 },
  legendary: { label:'Huyền Thoại', color:'#facc15', glow:'rgba(250,204,21,0.35)', weight: 8 },
  divine:    { label:'Thần Thánh',  color:'#38bdf8', glow:'rgba(56,189,248,0.4)',  weight: 4 },
  mythic:    { label:'Thần Thoại',  color:'#f97316', glow:'rgba(249,115,22,0.45)', weight: 3 },
};

// ============================================================
// KNOWN LEGENDARY ARTIFACTS — seeded into world on first load
// ============================================================
const LAE_SEED_ARTIFACTS = [
  {
    id: 'lae_thien_kiem',
    name: 'Thiên Kiếm',
    type: 'Sword',
    rarity: 'mythic',
    icon: '⚔️',
    power: 9800,
    description: 'Kiếm của thiên đạo. Một nhát chém rạn nứt bầu trời. Từng xuất hiện trong trận chiến khai thiên tịch địa.',
    spirit: { name:'Kiếm Linh Thiên Đạo', awakened:true, personality:'Kiêu ngạo, chỉ phục kẻ thiên tài tuyệt đỉnh' },
    powers: ['Thiên Đạo Nhất Chém','Phá Không','Kiếm Ý Vô Song'],
    ownerHistory: [
      { name:'Kiếm Thánh', year:1, how:'Rèn bởi thiên lôi', cause:'Tọa hóa đắc đạo' },
      { name:'Lâm Phàm',   year:450, how:'Đấu pháp đoạt thủ', cause:'Truyền cho đệ tử' },
      { name:'Thiên Vũ Đại Đế', year:890, how:'Đệ tử kế thừa', cause:'Phong ấn vào núi' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: true,
    lostYear: 890,
    lostLocation: 'Thiên Kiếm Sơn — đỉnh núi tây bắc',
  },
  {
    id: 'lae_dong_hoang_chung',
    name: 'Đông Hoàng Chung',
    type: 'Cauldron',
    rarity: 'divine',
    icon: '🔔',
    power: 8500,
    description: 'Đại chuông của Đông Hoàng. Tiếng ngân vang suốt tam giới, triệu hồi vạn linh. Phòng thủ đệ nhất.',
    spirit: { name:'Đông Hoàng Linh', awakened:true, personality:'Trầm lặng, bảo vệ chủ nhân đến cùng' },
    powers: ['Thiên Địa Huyền Âm','Vạn Linh Triệu Hồi','Bất Phá Kim Thể'],
    ownerHistory: [
      { name:'Đông Hoàng Thánh Đế', year:1, how:'Thiên mệnh sở hữu', cause:'Thất lạc trong đại chiến' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: true,
    lostYear: 300,
    lostLocation: 'Đáy Hỗn Độn Hải',
  },
  {
    id: 'lae_hon_don_chau',
    name: 'Hỗn Độn Châu',
    type: 'Ring',
    rarity: 'mythic',
    icon: '🌌',
    power: 9999,
    description: 'Bảo châu nguyên thủy từ hỗn độn khai thiên. Chứa đựng nguồn gốc của vũ trụ. Vô địch thiên hạ.',
    spirit: { name:'Nguyên Thủy Linh', awakened:true, personality:'Huyền bí, vô ngôn, thấu hiểu tất cả' },
    powers: ['Hỗn Độn Khai Thiên','Không Gian Vô Lượng','Thời Gian Hồi Chuyển'],
    ownerHistory: [
      { name:'Thái Sơ Đạo Nhân', year:1, how:'Nhặt từ hỗn độn nguyên thủy', cause:'Chủ động phong ấn vào hư không' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: true,
    lostYear: 100,
    lostLocation: 'Hư Không Kẽ Hở — vị trí bất định',
  },
  {
    id: 'lae_tran_thien_thap',
    name: 'Trấn Thiên Tháp',
    type: 'Pagoda',
    rarity: 'divine',
    icon: '🏯',
    power: 8800,
    description: 'Bảo tháp trấn áp thiên địa. Bảy tầng chứa đựng vô số không gian con. Từng trấn áp Tà Thần một mình.',
    spirit: { name:'Tháp Thần Trấn Thiên', awakened:true, personality:'Công bằng, trấn áp tà ác' },
    powers: ['Trấn Ác Phong Thiên','Không Gian Thu Nạp','Thất Tầng Thiên Địa'],
    ownerHistory: [
      { name:'Trấn Thiên Đại Tôn', year:1, how:'Luyện chế ba ngàn năm', cause:'Dùng để phong ấn Tà Thần' },
      { name:'Thiên Đình Giám Sát', year:500, how:'Thiên đình thu hồi', cause:'Thiên đình sụp đổ — thất lạc' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: true,
    lostYear: 600,
    lostLocation: 'Phế Thiên Đình — tọa độ bất minh',
  },
  {
    id: 'lae_tuyet_the_long_phong',
    name: 'Tuyệt Thế Long Phong',
    type: 'Spear',
    rarity: 'legendary',
    icon: '🔱',
    power: 6500,
    description: 'Thương chứa hồn rồng thần. Mỗi đâm phóng ra rồng lửa. Từng thống lĩnh trăm vạn hùng binh.',
    spirit: { name:'Long Thần Chi Linh', awakened:false, personality:'Dữ tợn, khao khát chiến đấu' },
    powers: ['Long Hỏa Bạo Phong','Thần Long Giáng Thế','Trăm Vạn Binh Hồn'],
    ownerHistory: [
      { name:'Long Vương Chiến Đế', year:200, how:'Đoạt từ rồng thần', cause:'Tử trận' },
      { name:'Thiết Huyết Môn Chủ', year:380, how:'Chiến lợi phẩm', cause:'Truyền con trai' },
      { name:'Thiết Huyết Nhị Lang', year:420, how:'Kế thừa', cause:'Bị đánh cắp' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: true,
    lostYear: 450,
    lostLocation: 'Chợ Đen Hỗn Độn Thành — bán cho kẻ vô danh',
  },
  {
    id: 'lae_bat_quai_tien_an',
    name: 'Bát Quái Thiên Ấn',
    type: 'Seal',
    rarity: 'legendary',
    icon: '☯️',
    power: 7200,
    description: 'Ấn trời mang bát quái. Phong ấn bất kỳ thứ gì trong tam giới, kể cả thần linh.',
    spirit: { name:'Ấn Linh Bát Quái', awakened:true, personality:'Trung lập, tuân theo quy tắc vũ trụ' },
    powers: ['Vạn Vật Phong Ấn','Bát Quái Phá Ma','Thiên Địa Trói Buộc'],
    ownerHistory: [
      { name:'Nguyên Thủy Thiên Tôn', year:1, how:'Thiên đạo trao tặng', cause:'Phong ấn Địa Ngục' },
    ],
    currentOwner: null,
    location: 'unknown',
    isLost: false,
    lostYear: null,
    lostLocation: null,
  },
];

// ============================================================
// ENGINE STATE
// ============================================================
function laeDefaultState() {
  return {
    artifacts: [],          // all tracked legendary artifacts
    bookOfArtifacts: {      // ⚔️ BOOK OF ARTIFACTS panel data
      strongestArtifactId: null,
      oldestArtifactId:    null,
      mostFamousArtifactId:null,
    },
    artifactWars:    [],    // wars triggered by artifacts
    treasureHunts:   [],    // active treasure hunts
    ownerTransfers:  [],    // full global ownership transfer log
    lostRelics:      [],    // IDs of currently lost artifacts
    version: 1,
  };
}

window.laeState = window.laeState || null;

// ============================================================
// SAVE / LOAD
// ============================================================
function laeSave() {
  try {
    localStorage.setItem(LAE_SAVE_KEY, JSON.stringify(window.laeState));
  } catch(e) { console.warn('[LAE] Save failed:', e); }
}

function laeLoad() {
  try {
    const raw = localStorage.getItem(LAE_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      window.laeState = Object.assign(laeDefaultState(), parsed);
    } else {
      window.laeState = laeDefaultState();
    }
  } catch(e) {
    window.laeState = laeDefaultState();
  }
}

// ============================================================
// INIT — seed legendary artifacts on first load
// ============================================================
function laeInit() {
  laeLoad();
  // Seed legendary artifacts if not present
  LAE_SEED_ARTIFACTS.forEach(seed => {
    if (!window.laeState.artifacts.find(a => a.id === seed.id)) {
      const artifact = Object.assign({}, seed, {
        createdYear: (typeof year !== 'undefined' ? year : 1),
        fame: _laeFameBase(seed.rarity),
        wars: [],
      });
      window.laeState.artifacts.push(artifact);
      if (artifact.isLost) {
        if (!window.laeState.lostRelics.includes(artifact.id)) {
          window.laeState.lostRelics.push(artifact.id);
        }
      }
    }
  });
  _laeUpdateBook();
  laeSave();
  // Inject ⚔️ ARTIFACTS panel into main nav
  setTimeout(_laeInjectPanel, 900);
  // Register yearly tick hook
  window._laeYearlyHook = laeYearlyTick;
  console.log('[LAE] ✅ Legendary Artifact Engine V1 loaded — ' + window.laeState.artifacts.length + ' artifacts tracked.');
}

function _laeFameBase(rarity) {
  return { common:10, rare:100, epic:500, legendary:2000, divine:8000, mythic:20000 }[rarity] || 10;
}

// ============================================================
// YEARLY TICK — called each world year
// ============================================================
function laeYearlyTick() {
  if (!window.laeState) return;
  const curYear = (typeof year !== 'undefined' ? year : 0);

  // 1. NPC Treasure Hunts — NPCs search for lost relics
  _laeRunTreasureHunts(curYear);

  // 2. Artifact Wars — high-power artifacts cause wars
  _laeCheckArtifactWars(curYear);

  // 3. Artifact Inheritance — owner dies → artifact passes on
  _laeCheckInheritances(curYear);

  // 4. Spirit Awakening — powerful artifacts may awaken spirits
  _laeSpiritAwakenings(curYear);

  // 5. Random discovery
  _laeRandomDiscoveries(curYear);

  // 6. Update Book of Artifacts
  _laeUpdateBook();

  // Periodic save
  if (curYear % 5 === 0) laeSave();
}

// ============================================================
// TRANSFER OWNERSHIP (public API)
// ============================================================
/**
 * laeTransferOwner(artifactId, newOwnerName, how, year)
 * Records a new owner in the artifact's history.
 */
function laeTransferOwner(artifactId, newOwnerName, how, transferYear) {
  const art = laeGetArtifact(artifactId);
  if (!art) return false;
  const curYear = transferYear || (typeof year !== 'undefined' ? year : 0);

  // Close previous owner's record
  if (art.currentOwner && art.ownerHistory.length) {
    const lastEntry = art.ownerHistory[art.ownerHistory.length - 1];
    if (!lastEntry.cause) lastEntry.cause = how || 'Không rõ';
  }

  // Open new owner record
  art.ownerHistory.push({ name: newOwnerName, year: curYear, how: how || 'Thu phục', cause: null });
  art.currentOwner = newOwnerName;
  art.isLost = false;
  art.fame += 500;

  // Global log
  window.laeState.ownerTransfers.push({
    artifactId, artifactName: art.name,
    from: art.ownerHistory.length > 1 ? art.ownerHistory[art.ownerHistory.length - 2].name : 'Vô chủ',
    to: newOwnerName, how, year: curYear,
  });
  if (window.laeState.ownerTransfers.length > 500) window.laeState.ownerTransfers.shift();

  // Remove from lost relics
  window.laeState.lostRelics = window.laeState.lostRelics.filter(id => id !== artifactId);

  // Log to world
  _laeWorldLog(`⚔️ Bảo vật [${art.icon} ${art.name}] đã truyền đến tay ${newOwnerName} (${how})`, 'legendary');
  _laeUpdateBook();
  laeSave();
  return true;
}

/**
 * laeLoseArtifact(artifactId, cause, location, lostYear)
 * Mark artifact as lost — becomes an Ancient Relic.
 */
function laeLoseArtifact(artifactId, cause, location, lostYear) {
  const art = laeGetArtifact(artifactId);
  if (!art) return false;
  const curYear = lostYear || (typeof year !== 'undefined' ? year : 0);

  // Close last owner record
  if (art.ownerHistory.length) {
    const last = art.ownerHistory[art.ownerHistory.length - 1];
    if (!last.cause) last.cause = cause || 'Thất lạc';
  }

  art.currentOwner = null;
  art.isLost = true;
  art.lostYear = curYear;
  art.lostLocation = location || 'Không rõ';
  art.fame += 1000; // lost artifacts become MORE legendary

  if (!window.laeState.lostRelics.includes(artifactId)) {
    window.laeState.lostRelics.push(artifactId);
  }

  _laeWorldLog(`🌑 Bảo vật [${art.icon} ${art.name}] đã THẤT LẠC — trở thành Cổ Tích (${cause}). Vị trí: ${art.lostLocation}`, 'warning');
  _laeUpdateBook();
  laeSave();
  return true;
}

// ============================================================
// CREATOR GOD — CREATE CUSTOM ARTIFACT
// ============================================================
/**
 * laeCreatorGodForge(opts)
 * Creator God personally forges a unique divine artifact.
 * opts: { name, type, rarity, description, powers, ownerName }
 */
function laeCreatorGodForge(opts = {}) {
  const curYear = (typeof year !== 'undefined' ? year : 0);
  const rarity = opts.rarity || 'divine';
  const newArt = {
    id: 'lae_cg_' + Date.now(),
    name:        opts.name        || 'Vô Danh Thần Bảo',
    type:        opts.type        || 'Seal',
    rarity,
    icon:        opts.icon        || '✨',
    power:       opts.power       || (_laeFameBase(rarity) / 2),
    description: opts.description || 'Bảo vật do Đấng Tạo Hóa đích thân luyện chế.',
    spirit: {
      name:      opts.spiritName      || 'Tạo Hóa Chi Linh',
      awakened:  true,
      personality: opts.spiritPersonality || 'Trung thành với người tạo ra mình',
    },
    powers:        opts.powers      || ['Tạo Hóa Thần Lực'],
    ownerHistory: [],
    currentOwner:  null,
    location:      'Tạo Hóa Điện',
    isLost:        false,
    lostYear:      null,
    lostLocation:  null,
    createdYear:   curYear,
    fame:          _laeFameBase(rarity) * 3,
    wars:          [],
    forgedByCreatorGod: true,
  };

  if (opts.ownerName) {
    newArt.ownerHistory.push({ name: opts.ownerName, year: curYear, how: 'Tạo Hóa ban tặng', cause: null });
    newArt.currentOwner = opts.ownerName;
  }

  window.laeState.artifacts.push(newArt);
  _laeWorldLog(`🌟 ĐẤNG TẠO HÓA luyện chế [${newArt.icon} ${newArt.name}] (${LAE_RARITY[rarity]?.label}) — Quyền năng vô song xuất hiện trong thiên địa!`, 'legendary');
  _laeUpdateBook();
  laeSave();
  return newArt;
}

// ============================================================
// ARTIFACT WARS
// ============================================================
function _laeCheckArtifactWars(curYear) {
  if (!window.laeState || !window.laeState.artifacts) return;
  // Once every ~20 years, a divine+ artifact can trigger a war
  if (Math.random() > 0.05) return;
  const divineArts = window.laeState.artifacts.filter(a =>
    (a.rarity === 'divine' || a.rarity === 'mythic') &&
    !a.isLost && a.currentOwner
  );
  if (!divineArts.length) return;

  const art = divineArts[Math.floor(Math.random() * divineArts.length)];
  const warEvent = {
    year: curYear,
    artifactId: art.id,
    artifactName: art.name,
    attacker: _laeRandomPower(),
    defender: art.currentOwner,
    reason: `Tranh đoạt [${art.name}]`,
    outcome: Math.random() < 0.5 ? 'defender_wins' : 'attacker_wins',
  };

  window.laeState.artifactWars.push(warEvent);
  art.wars.push(warEvent);
  art.fame += 3000;

  if (warEvent.outcome === 'attacker_wins') {
    const reason = `Bại trận trong Bảo Vật Chiến — mất [${art.name}]`;
    laeTransferOwner(art.id, warEvent.attacker, 'Cướp đoạt chiến tranh', curYear);
    _laeWorldLog(`⚔️ BẢO VẬT CHIẾN: ${warEvent.attacker} tấn công ${warEvent.defender} để đoạt [${art.icon} ${art.name}] — ${warEvent.attacker} THẮNG!`, 'war');
  } else {
    _laeWorldLog(`⚔️ BẢO VẬT CHIẾN: ${warEvent.attacker} tấn công ${warEvent.defender} để đoạt [${art.icon} ${art.name}] — ${warEvent.defender} bảo vệ thành công!`, 'war');
  }

  if (typeof addLog === 'function') addLog(`⚔️ Bảo Vật Chiến nổ ra vì [${art.name}]!`, 'warning');
}

// ============================================================
// TREASURE HUNTS
// ============================================================
function _laeRunTreasureHunts(curYear) {
  if (!window.laeState.lostRelics.length) return;
  if (Math.random() > 0.12) return; // 12% chance per year

  // Pick a lost relic
  const relicId = window.laeState.lostRelics[Math.floor(Math.random() * window.laeState.lostRelics.length)];
  const art = laeGetArtifact(relicId);
  if (!art) return;

  // Pick a hunter NPC or legendary name
  const hunter = _laeRandomHunter();
  const success = Math.random() < 0.15; // 15% success rate per hunt

  const hunt = {
    year: curYear,
    artifactId: relicId,
    artifactName: art.name,
    hunter,
    success,
    location: art.lostLocation || 'Hư không',
  };
  window.laeState.treasureHunts.push(hunt);
  if (window.laeState.treasureHunts.length > 200) window.laeState.treasureHunts.shift();

  if (success) {
    _laeWorldLog(`🏺 Tầm Bảo Thành Công: ${hunter} phát hiện [${art.icon} ${art.name}] tại ${art.lostLocation}!`, 'legendary');
    laeTransferOwner(relicId, hunter, 'Tầm bảo phát hiện', curYear);
  } else {
    _laeWorldLog(`🔍 ${hunter} đang tìm kiếm [${art.icon} ${art.name}] tại ${art.lostLocation} — chưa thành công...`, 'info');
  }
}

// ============================================================
// ARTIFACT INHERITANCE
// ============================================================
function _laeCheckInheritances(curYear) {
  if (typeof npcs === 'undefined') return;
  window.laeState.artifacts.forEach(art => {
    if (!art.currentOwner || art.isLost) return;
    // Check if current NPC owner has died
    const ownerNPC = npcs.find(n => n.name === art.currentOwner && n.status === 'dead');
    if (!ownerNPC) return;

    const roll = Math.random();
    if (roll < 0.33) {
      // Pass to disciple
      const disciple = npcs.find(n => n.status === 'alive' && n.master === ownerNPC.name);
      if (disciple) {
        laeTransferOwner(art.id, disciple.name, 'Đệ tử kế thừa', curYear);
      } else {
        laeLoseArtifact(art.id, 'Chủ nhân qua đời, không có kẻ kế thừa', 'Mộ phần ' + ownerNPC.name, curYear);
      }
    } else if (roll < 0.55) {
      // Pass to child
      const child = npcs.find(n => n.status === 'alive' && n.father === ownerNPC.name);
      if (child) {
        laeTransferOwner(art.id, child.name, 'Con cái kế thừa', curYear);
      } else {
        laeLoseArtifact(art.id, 'Không người thừa kế', 'Nơi chủ nhân qua đời', curYear);
      }
    } else if (roll < 0.7) {
      // Stolen
      const thief = _laeRandomPower();
      laeTransferOwner(art.id, thief, 'Cướp đoạt sau khi chủ nhân chết', curYear);
    } else {
      // Lost
      laeLoseArtifact(art.id, 'Chủ nhân qua đời', 'Không xác định', curYear);
    }
  });
}

// ============================================================
// SPIRIT AWAKENING
// ============================================================
function _laeSpiritAwakenings(curYear) {
  window.laeState.artifacts.forEach(art => {
    if (art.spirit && !art.spirit.awakened && art.fame >= 5000) {
      if (Math.random() < 0.05) {
        art.spirit.awakened = true;
        art.fame += 2000;
        _laeWorldLog(`🌟 Bảo vật [${art.icon} ${art.name}] thức tỉnh Khí Linh — ${art.spirit.name} xuất hiện! Tính cách: ${art.spirit.personality}`, 'legendary');
      }
    }
  });
}

// ============================================================
// RANDOM DISCOVERIES
// ============================================================
function _laeRandomDiscoveries(curYear) {
  if (Math.random() > 0.03) return;
  // Chance to create a new random legendary artifact in the world
  const rarities = ['legendary','legendary','divine','mythic'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const type = LAE_TYPES[Math.floor(Math.random() * LAE_TYPES.length)];
  const names = [
    'Cửu Long Thần', 'Hư Vô Diệt', 'Thiên Phong', 'Vạn Cổ Bất Diệt',
    'Hỗn Nguyên', 'Thái Cực Nghi', 'Trảm Thần', 'Phá Thiên', 'Vô Cực Hóa',
  ];
  const name = names[Math.floor(Math.random() * names.length)] + ' ' + type;
  const discoverer = _laeRandomHunter();

  const newArt = {
    id: 'lae_rand_' + Date.now(),
    name,
    type,
    rarity,
    icon: _laeTypeIcon(type),
    power: Math.round((_laeFameBase(rarity) / 10) * (0.8 + Math.random() * 0.4) * 10),
    description: `Bảo vật cổ đại ${LAE_RARITY[rarity]?.label} xuất hiện từ hư không trong năm ${curYear}.`,
    spirit: {
      name: name + ' Linh',
      awakened: rarity === 'mythic',
      personality: ['Trầm lặng','Kiêu ngạo','Thân thiện','Bí ẩn'][Math.floor(Math.random()*4)],
    },
    powers: [`${name} Nhất Kích`],
    ownerHistory: [{ name: discoverer, year: curYear, how: 'Cơ duyên kỳ ngộ', cause: null }],
    currentOwner: discoverer,
    location: 'Thiên Địa',
    isLost: false,
    lostYear: null,
    lostLocation: null,
    createdYear: curYear,
    fame: _laeFameBase(rarity),
    wars: [],
  };

  window.laeState.artifacts.push(newArt);
  _laeWorldLog(`✨ Bảo vật [${newArt.icon} ${name}] (${LAE_RARITY[rarity]?.label}) xuất hiện trong thiên địa — ${discoverer} có được nhờ cơ duyên!`, 'legendary');
}

// ============================================================
// BOOK OF ARTIFACTS — Update Rankings
// ============================================================
function _laeUpdateBook() {
  if (!window.laeState || !window.laeState.artifacts.length) return;
  const arts = window.laeState.artifacts;

  const strongest = arts.reduce((best, a) => (a.power > (best?.power || 0) ? a : best), null);
  const oldest    = arts.reduce((best, a) => (a.createdYear < (best?.createdYear ?? Infinity) ? a : best), null);
  const famous    = arts.reduce((best, a) => (a.fame > (best?.fame || 0) ? a : best), null);

  window.laeState.bookOfArtifacts = {
    strongestArtifactId:  strongest?.id  || null,
    oldestArtifactId:     oldest?.id     || null,
    mostFamousArtifactId: famous?.id     || null,
  };
}

// ============================================================
// PANEL — ⚔️ ARTIFACTS
// ============================================================
function _laeInjectPanel() {
  // Add nav button
  const navRow = document.querySelector('.nav-row') || document.querySelector('.panels-nav') || document.querySelector('nav');
  if (navRow && !document.getElementById('lae-nav-btn')) {
    const btn = document.createElement('button');
    btn.id = 'lae-nav-btn';
    btn.className = 'nav-btn';
    btn.setAttribute('data-panel', 'lae-panel');
    btn.innerHTML = '⚔️ <span>Bảo Vật</span>';
    btn.style.cssText = 'background:linear-gradient(135deg,rgba(250,204,21,0.15),rgba(249,115,22,0.12));border:1px solid rgba(250,204,21,0.4);';
    btn.onclick = () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const panel = document.getElementById('lae-panel');
      if (panel) { panel.classList.add('active'); btn.classList.add('active'); laeRenderPanel(); }
    };
    navRow.appendChild(btn);
  }

  // Add panel container
  const panelsContainer = document.querySelector('.panels');
  if (panelsContainer && !document.getElementById('lae-panel')) {
    const panel = document.createElement('div');
    panel.id = 'lae-panel';
    panel.className = 'panel';
    panelsContainer.appendChild(panel);
  }
}

/**
 * laeRenderPanel() — renders the full ⚔️ ARTIFACTS book panel
 */
function laeRenderPanel() {
  const el = document.getElementById('lae-panel');
  if (!el || !window.laeState) return;

  const arts = window.laeState.artifacts;
  const book = window.laeState.bookOfArtifacts;
  const strongest  = arts.find(a => a.id === book.strongestArtifactId);
  const oldest     = arts.find(a => a.id === book.oldestArtifactId);
  const famous     = arts.find(a => a.id === book.mostFamousArtifactId);
  const lost       = arts.filter(a => a.isLost);
  const active     = arts.filter(a => !a.isLost && a.currentOwner);

  const rarityBadge = (r) => {
    const cfg = LAE_RARITY[r] || {};
    return `<span style="color:${cfg.color};font-size:11px;font-weight:700;text-shadow:0 0 6px ${cfg.glow}">${cfg.label || r}</span>`;
  };

  const artifactRow = (a, compact = false) => {
    if (!a) return '';
    const cfg = LAE_RARITY[a.rarity] || {};
    const spiritBadge = a.spirit?.awakened
      ? `<span style="color:#38bdf8;font-size:10px">🌟 ${a.spirit.name}</span>`
      : (a.spirit ? `<span style="color:#64748b;font-size:10px">💤 Chưa thức tỉnh</span>` : '');
    const ownerBadge = a.currentOwner
      ? `<span style="color:#4ade80;font-size:11px">👤 ${a.currentOwner}</span>`
      : `<span style="color:#f97316;font-size:11px">🌑 Thất Lạc</span>`;
    const powerBar = Math.min(100, Math.round((a.power / 9999) * 100));
    const historySummary = a.ownerHistory.length > 0
      ? `<div style="font-size:10px;color:#64748b;margin-top:2px">Chủ nhân qua các đời: ${a.ownerHistory.map(o=>o.name).join(' → ')}</div>`
      : '';
    return `
      <div style="
        border:1px solid ${cfg.color};border-radius:10px;padding:10px 12px;margin-bottom:8px;
        background:rgba(10,15,30,0.75);box-shadow:0 0 12px ${cfg.glow};
        ${compact ? 'display:flex;gap:10px;align-items:center;' : ''}
      ">
        <div style="${compact ? 'font-size:1.8em;min-width:36px;text-align:center' : 'display:flex;align-items:center;gap:10px;margin-bottom:6px'}">${a.icon || '✨'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:${cfg.color};font-size:13px">${a.name}</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:2px 0">
            ${rarityBadge(a.rarity)}
            <span style="color:#94a3b8;font-size:11px">· ${a.type}</span>
            ${ownerBadge}
          </div>
          ${!compact ? `<div style="font-size:11px;color:#94a3b8;margin:3px 0">${a.description}</div>` : ''}
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:4px">
            <div style="display:flex;align-items:center;gap:4px">
              <div style="width:80px;height:5px;background:#1e293b;border-radius:3px;overflow:hidden">
                <div style="width:${powerBar}%;height:100%;background:${cfg.color};transition:width 0.5s"></div>
              </div>
              <span style="color:${cfg.color};font-size:10px;font-weight:700">${a.power}</span>
            </div>
            <span style="color:#facc15;font-size:10px">⭐ Danh vọng: ${a.fame.toLocaleString()}</span>
            ${spiritBadge}
          </div>
          ${!compact ? historySummary : ''}
          ${a.powers?.length ? `<div style="font-size:10px;color:#c084fc;margin-top:3px">⚡ ${a.powers.join(' · ')}</div>` : ''}
          ${a.isLost && a.lostLocation ? `<div style="font-size:10px;color:#f97316;margin-top:3px">📍 Vị trí: ${a.lostLocation}</div>` : ''}
        </div>
      </div>
    `;
  };

  const warRows = window.laeState.artifactWars.slice(-10).reverse().map(w => `
    <div style="border-left:3px solid #f97316;padding:6px 10px;margin-bottom:6px;background:rgba(249,115,22,0.08);border-radius:0 6px 6px 0">
      <span style="color:#facc15;font-size:11px;font-weight:700">Năm ${w.year}</span>
      <span style="color:#f97316;margin-left:8px;font-size:11px">⚔️ ${w.attacker} vs ${w.defender}</span>
      <span style="color:#94a3b8;font-size:11px;margin-left:6px">→ tranh [${w.artifactName}]</span>
      <span style="color:${w.outcome==='attacker_wins'?'#f87171':'#4ade80'};font-size:10px;margin-left:6px">
        ${w.outcome==='attacker_wins'?'⚔️ Kẻ tấn công thắng':'🛡️ Chủ nhân giữ được'}
      </span>
    </div>
  `).join('');

  const huntRows = window.laeState.treasureHunts.slice(-8).reverse().map(h => `
    <div style="border-left:3px solid ${h.success?'#4ade80':'#334155'};padding:6px 10px;margin-bottom:6px;background:rgba(74,222,128,0.06);border-radius:0 6px 6px 0">
      <span style="color:#facc15;font-size:11px">Năm ${h.year}</span>
      <span style="color:#60a5fa;font-size:11px;margin-left:8px">🔍 ${h.hunter}</span>
      <span style="color:#94a3b8;font-size:11px;margin-left:6px">→ tìm [${h.artifactName}]</span>
      <span style="color:${h.success?'#4ade80':'#64748b'};font-size:10px;margin-left:6px">${h.success?'✅ Thành công':'❌ Thất bại'}</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div style="padding:16px;max-height:calc(100vh - 80px);overflow-y:auto;font-family:inherit">

      <!-- HEADER -->
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:1.6em;font-weight:800;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,0.5)">⚔️ THƯ VIỆN BẢO VẬT</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px">Ghi chép mọi bảo vật truyền thế của thiên địa</div>
      </div>

      <!-- BOOK OF ARTIFACTS — HALL OF FAME -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
        ${[
          ['🔥 Mạnh Nhất', strongest],
          ['📜 Lâu Đời Nhất', oldest],
          ['⭐ Nổi Tiếng Nhất', famous],
        ].map(([label, a]) => `
          <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(250,204,21,0.3);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:700">${label}</div>
            ${a ? `
              <div style="font-size:1.8em">${a.icon}</div>
              <div style="font-size:12px;font-weight:700;color:${LAE_RARITY[a.rarity]?.color || '#fff'};margin-top:4px">${a.name}</div>
              <div style="font-size:10px;color:#64748b">${a.currentOwner || '— Thất Lạc —'}</div>
            ` : '<div style="color:#334155;font-size:11px">—</div>'}
          </div>
        `).join('')}
      </div>

      <!-- CREATOR GOD FORGE -->
      <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(249,115,22,0.4);border-radius:12px;padding:14px;margin-bottom:18px">
        <div style="font-size:13px;font-weight:700;color:#f97316;margin-bottom:10px">🔨 TẠO HÓA LUYỆN CHẾ</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <input id="lae-forge-name" placeholder="Tên bảo vật..." style="
            background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;
            padding:7px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box
          ">
          <select id="lae-forge-type" style="
            background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;
            padding:7px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box
          ">
            ${LAE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <select id="lae-forge-rarity" style="
            background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;
            padding:7px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box
          ">
            ${Object.entries(LAE_RARITY).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
          <input id="lae-forge-owner" placeholder="Ban tặng cho... (tùy chọn)" style="
            background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;
            padding:7px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box
          ">
        </div>
        <textarea id="lae-forge-desc" placeholder="Mô tả quyền năng bảo vật..." rows="2" style="
          background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;
          padding:7px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box;resize:none
        "></textarea>
        <button onclick="laeForgeFromUI()" style="
          margin-top:8px;padding:8px 18px;background:linear-gradient(135deg,#f97316,#facc15);
          border:none;border-radius:8px;color:#000;font-weight:800;font-size:12px;cursor:pointer;
          width:100%;letter-spacing:0.5px
        ">🌟 ĐẤNG TẠO HÓA LUYỆN CHẾ BẢO VẬT</button>
      </div>

      <!-- TABS -->
      <div id="lae-tabs" style="display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:14px">
        ${[
          ['active','⚔️ Đang Lưu Hành'],
          ['lost','🌑 Cổ Tích Thất Lạc'],
          ['wars','💥 Bảo Vật Chiến'],
          ['hunts','🔍 Tầm Bảo'],
          ['timeline','📜 Lịch Sử'],
        ].map(([tab, label], i) => `
          <button onclick="laeSwitchTab('${tab}')" id="laetab-${tab}" style="
            flex:1;padding:9px 4px;font-size:11px;font-weight:700;
            background:${i===0?'rgba(250,204,21,0.12)':'none'};
            border:none;border-bottom:2px solid ${i===0?'#facc15':'transparent'};
            color:${i===0?'#facc15':'#94a3b8'};cursor:pointer;transition:all 0.2s;
          ">${label}</button>
        `).join('')}
      </div>

      <!-- TAB: ACTIVE ARTIFACTS -->
      <div id="laetab-content-active">
        ${active.length ? active.map(a => artifactRow(a)).join('') : '<div style="color:#334155;text-align:center;padding:24px">Không có bảo vật đang lưu hành</div>'}
      </div>

      <!-- TAB: LOST RELICS -->
      <div id="laetab-content-lost" style="display:none">
        ${lost.length ? lost.map(a => artifactRow(a)).join('') : '<div style="color:#334155;text-align:center;padding:24px">Không có cổ tích thất lạc</div>'}
      </div>

      <!-- TAB: ARTIFACT WARS -->
      <div id="laetab-content-wars" style="display:none">
        ${warRows || '<div style="color:#334155;text-align:center;padding:24px">Chưa có Bảo Vật Chiến nào</div>'}
      </div>

      <!-- TAB: TREASURE HUNTS -->
      <div id="laetab-content-hunts" style="display:none">
        ${huntRows || '<div style="color:#334155;text-align:center;padding:24px">Chưa có cuộc tầm bảo nào</div>'}
      </div>

      <!-- TAB: TIMELINE / OWNERSHIP HISTORY -->
      <div id="laetab-content-timeline" style="display:none">
        ${_laeRenderTimeline()}
      </div>

    </div>
  `;
}

function laeSwitchTab(tab) {
  ['active','lost','wars','hunts','timeline'].forEach(t => {
    const content = document.getElementById(`laetab-content-${t}`);
    const btn = document.getElementById(`laetab-${t}`);
    if (!content || !btn) return;
    const active = t === tab;
    content.style.display = active ? 'block' : 'none';
    btn.style.background    = active ? 'rgba(250,204,21,0.12)' : 'none';
    btn.style.borderBottom  = active ? '2px solid #facc15' : '2px solid transparent';
    btn.style.color         = active ? '#facc15' : '#94a3b8';
  });
}

function _laeRenderTimeline() {
  const transfers = window.laeState.ownerTransfers.slice(-30).reverse();
  if (!transfers.length) return '<div style="color:#334155;text-align:center;padding:24px">Chưa có lịch sử chuyển nhượng</div>';
  return transfers.map(t => `
    <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.04)">
      <div style="color:#facc15;font-size:11px;font-weight:700;min-width:52px">Năm ${t.year}</div>
      <div>
        <div style="font-size:12px;font-weight:700;color:#e2e8f0">${t.artifactName}</div>
        <div style="font-size:11px;color:#94a3b8">
          <span style="color:#f87171">${t.from}</span>
          <span style="margin:0 6px">→</span>
          <span style="color:#4ade80">${t.to}</span>
          <span style="color:#64748b;margin-left:6px">(${t.how})</span>
        </div>
      </div>
    </div>
  `).join('');
}

function laeForgeFromUI() {
  const name  = (document.getElementById('lae-forge-name')?.value  || '').trim();
  const type  =  document.getElementById('lae-forge-type')?.value  || 'Seal';
  const rarity=  document.getElementById('lae-forge-rarity')?.value || 'divine';
  const owner = (document.getElementById('lae-forge-owner')?.value || '').trim();
  const desc  = (document.getElementById('lae-forge-desc')?.value  || '').trim();

  if (!name) { alert('Vui lòng nhập tên bảo vật!'); return; }

  const art = laeCreatorGodForge({ name, type, rarity, description: desc || undefined, ownerName: owner || undefined });
  if (art) {
    alert(`✅ Bảo vật [${art.name}] (${LAE_RARITY[rarity]?.label}) đã được Đấng Tạo Hóa luyện chế thành công!`);
    // Clear inputs
    ['lae-forge-name','lae-forge-owner','lae-forge-desc'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    laeRenderPanel();
  }
}

// ============================================================
// PUBLIC — Get artifact by ID
// ============================================================
function laeGetArtifact(id) {
  return window.laeState?.artifacts?.find(a => a.id === id) || null;
}

// ============================================================
// INTEGRATION — patch into world yearly tick
// ============================================================
(function patchWorldYearlyTick() {
  // Try to hook into existing year advance functions
  function _tryPatch() {
    // Patch advanceYear if it exists
    if (typeof window.advanceYear === 'function' && !window._laePatchedYear) {
      const _orig = window.advanceYear;
      window.advanceYear = function() {
        _orig.apply(this, arguments);
        laeYearlyTick();
      };
      window._laePatchedYear = true;
    }
    // Also hook _artifactYearlyHook (existing system hook point)
    if (typeof window._artifactYearlyHook === 'function' && !window._laePatchedArtifact) {
      const _orig = window._artifactYearlyHook;
      window._artifactYearlyHook = function() {
        _orig.apply(this, arguments);
        laeYearlyTick();
      };
      window._laePatchedArtifact = true;
    }
  }
  setTimeout(_tryPatch, 1500);
})();

// ============================================================
// INTEGRATION — add ⚔️ ARTIFACTS section to Creator God panel
// ============================================================
(function patchCreatorGodPanel() {
  function _tryInjectCG() {
    if (typeof window.renderCreatorGodPanel !== 'function') return;
    const _orig = window.renderCreatorGodPanel;
    window.renderCreatorGodPanel = function() {
      _orig.apply(this, arguments);
      // Inject artifact summary into CG panel
      setTimeout(() => {
        const cgPanel = document.getElementById('panel-creator-god');
        if (!cgPanel || document.getElementById('lae-cg-summary')) return;
        const arts = window.laeState?.artifacts || [];
        const lost = arts.filter(a => a.isLost).length;
        const div = document.createElement('div');
        div.id = 'lae-cg-summary';
        div.style.cssText = 'margin:12px 0;padding:12px;background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.3);border-radius:10px';
        div.innerHTML = `
          <div style="font-size:12px;font-weight:700;color:#facc15;margin-bottom:8px">⚔️ Bảo Vật Thế Giới</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <span style="color:#94a3b8;font-size:11px">📦 ${arts.length} bảo vật</span>
            <span style="color:#f97316;font-size:11px">🌑 ${lost} thất lạc</span>
            <span style="color:#facc15;font-size:11px">⚔️ ${(window.laeState?.artifactWars||[]).length} bảo vật chiến</span>
          </div>
          <button onclick="document.getElementById('lae-nav-btn')?.click()" style="
            margin-top:8px;padding:5px 12px;background:rgba(250,204,21,0.15);
            border:1px solid rgba(250,204,21,0.4);border-radius:6px;
            color:#facc15;font-size:11px;cursor:pointer
          ">⚔️ Mở Thư Viện Bảo Vật →</button>
        `;
        cgPanel.appendChild(div);
      }, 200);
    };
  }
  setTimeout(_tryInjectCG, 1200);
})();

// ============================================================
// HELPERS
// ============================================================
function _laeWorldLog(msg, type) {
  if (typeof addLog === 'function') addLog(msg, type || 'important');
  if (typeof addTimeline === 'function') addTimeline(msg, 'artifact', '⚔️');
  if (typeof window.creatorGodHistory !== 'undefined') {
    window.creatorGodHistory.unshift({
      year: (typeof year !== 'undefined' ? year : 0),
      action: '⚔️ Bảo Vật', detail: msg, type: 'artifact',
    });
  }
}

function _laeRandomPower() {
  const names = [
    'Thiên Ma Giáo Chủ','Huyết Kiếm Tôn','Vô Danh Khách','Cổ Ác Ma','Hắc Long Vương',
    'Cực Âm Cung Chủ','Hỗn Nguyên Đạo Nhân','Phá Thiên Thánh','Thái Cổ Quỷ Đế',
  ];
  if (typeof npcs !== 'undefined') {
    const alive = npcs.filter(n => n.status === 'alive' && (n.realm || 0) >= 8);
    if (alive.length) return alive[Math.floor(Math.random() * alive.length)].name;
  }
  return names[Math.floor(Math.random() * names.length)];
}

function _laeRandomHunter() {
  const hunters = [
    'Phong Vân Du Hiệp','Thiên Kiếm Hành Giả','Long Thần Thám Bảo Gia','Hư Vô Đạo Nhân',
    'Vô Sắc Kiếm Thánh','Bách Lý Phong Hành','Tuyết Sơn Ẩn Sĩ',
  ];
  if (typeof npcs !== 'undefined') {
    const alive = npcs.filter(n => n.status === 'alive' && (n.realm || 0) >= 6);
    if (alive.length) return alive[Math.floor(Math.random() * alive.length)].name;
  }
  return hunters[Math.floor(Math.random() * hunters.length)];
}

function _laeTypeIcon(type) {
  const icons = {
    Sword:'⚔️', Spear:'🔱', Bow:'🏹', Armor:'🛡️',
    Ring:'💍', Pagoda:'🏯', Seal:'☯️', Cauldron:'🏺', 'Formation Core':'🔮',
  };
  return icons[type] || '✨';
}

// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.laeInit             = laeInit;
window.laeRenderPanel      = laeRenderPanel;
window.laeSwitchTab        = laeSwitchTab;
window.laeForgeFromUI      = laeForgeFromUI;
window.laeTransferOwner    = laeTransferOwner;
window.laeLoseArtifact     = laeLoseArtifact;
window.laeCreatorGodForge  = laeCreatorGodForge;
window.laeGetArtifact      = laeGetArtifact;
window.laeYearlyTick       = laeYearlyTick;

// AUTO INIT
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => setTimeout(laeInit, 1000));
}

console.log('[LAE] ⚔️ Legendary Artifact Engine V1 — registered. Awaiting world load...');
