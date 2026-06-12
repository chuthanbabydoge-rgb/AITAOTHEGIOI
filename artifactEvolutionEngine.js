/* ============================================================
   ARTIFACT EVOLUTION ENGINE — V2
   artifactEvolutionEngine.js
   CREATOR GOD V6 · PHASE NEXT

   KHÔNG XÓA / KHÔNG RESET:
   saves · worlds · NPCs · sects · countries · relics · history

   MỞ RỘNG — KHÔNG PHÁ HỆ THỐNG CŨ (artifactSystem.js + legendaryArtifactEngine.js)
   ============================================================ */

'use strict';

// ============================================================
// SAVE KEY
// ============================================================
const AEE_SAVE_KEY = 'cgv6_artifactEvolutionEngine_v2';

// ============================================================
// CONFIG — THRESHOLDS & CONSTANTS
// ============================================================
const AEE_CFG = {
  // Age → Relic tier
  AGE_ANCIENT:    100,   // Ancient Relic
  AGE_LEGENDARY:  500,   // Legendary Relic
  AGE_MYTHICAL:   1000,  // Mythical Relic
  AGE_WORLD_RELIC:5000,  // World Relic

  // Evolution — exp thresholds per evolutionLevel
  EXP_THRESHOLDS: [0, 500, 2000, 6000, 15000, 40000, 100000],

  // Kill milestones → curse/power events
  KILL_CURSE_THRESHOLD: 1000,
  KILL_BLOOD_THRESHOLD: 500,

  // Legend level labels & thresholds (by fame)
  LEGEND_LEVELS: [
    { min: 0,       label: 'Vô Danh',     color: '#64748b' },
    { min: 200,     label: 'Được Biết',    color: '#94a3b8' },
    { min: 1000,    label: 'Nổi Tiếng',   color: '#60a5fa' },
    { min: 5000,    label: 'Huyền Thoại', color: '#facc15' },
    { min: 20000,   label: 'Thế Giới',    color: '#f97316' },
    { min: 60000,   label: 'Thần Thoại',  color: '#e879f9' },
  ],

  // Bond levels (owner + artifact)
  BOND_LEVELS: [
    { min: 0,   label: 'Xa Lạ',      color: '#64748b' },
    { min: 20,  label: 'Quen Thuộc', color: '#94a3b8' },
    { min: 50,  label: 'Đồng Hành',  color: '#4ade80' },
    { min: 100, label: 'Tri Kỷ',     color: '#38bdf8' },
    { min: 200, label: 'Tương Linh', color: '#facc15' },
    { min: 500, label: 'Hợp Nhất',   color: '#e879f9' },
  ],

  // Rarity colors (mirrors legendaryArtifactEngine)
  RARITY: {
    common:    { label:'Phổ Thông',   color:'#94a3b8', glow:'rgba(148,163,184,0.25)' },
    rare:      { label:'Quý Hiếm',    color:'#60a5fa', glow:'rgba(96,165,250,0.28)'  },
    epic:      { label:'Sử Thi',      color:'#c084fc', glow:'rgba(192,132,252,0.30)' },
    legendary: { label:'Huyền Thoại', color:'#facc15', glow:'rgba(250,204,21,0.35)' },
    divine:    { label:'Thần Thánh',  color:'#38bdf8', glow:'rgba(56,189,248,0.40)'  },
    mythic:    { label:'Thần Thoại',  color:'#f97316', glow:'rgba(249,115,22,0.45)'  },
  },

  // Artifact type icons
  TYPE_ICONS: {
    Sword:'⚔️', Spear:'🔱', Bow:'🏹', Axe:'🪓', Dagger:'🗡️',
    Armor:'🛡️', Ring:'💍', Amulet:'🔯', Seal:'☯️',
    Cauldron:'🏺', Pagoda:'🏯', 'Formation Core':'🔮',
    Staff:'🪄', Orb:'🌌', Scroll:'📜', Shield:'🔰',
  },
};

// ============================================================
// EVOLUTION TIER NAMES
// ============================================================
const AEE_EVOLUTION_TIERS = [
  'Phàm Khí',       // 0 — Mortal
  'Linh Khí',       // 1 — Spirit
  'Địa Phẩm',       // 2 — Earth Grade
  'Thiên Phẩm',     // 3 — Heaven Grade
  'Thần Phẩm',      // 4 — Divine Grade
  'Hỗn Nguyên',     // 5 — Primordial
  'Khai Thiên',     // 6 — World-Breaking (max)
];

// ============================================================
// PERSONALITY ARCHETYPES — unlocked by high evolution
// ============================================================
const AEE_PERSONALITIES = [
  { id:'righteous', label:'Chính Nghĩa',  desc:'Chỉ nhận chủ nhân có lòng chính trực', preferAlignment:['good'],      rejectAlignment:['evil'] },
  { id:'bloodthirst',label:'Cuồng Sát',   desc:'Khát máu, thích chiến đấu, tăng lực khi giết',  killBonus:0.2 },
  { id:'proud',      label:'Kiêu Ngạo',   desc:'Chỉ thần phục kẻ mạnh hơn nó', rejectWeakOwners:true },
  { id:'ancient',    label:'Cổ Kính',     desc:'Trầm lặng, nhớ tất cả chủ nhân, không thể bị phá hủy' },
  { id:'demonic',    label:'Ma Tánh',     desc:'Bị nguyền rủa, hút sinh khí chủ nhân', curse:true },
  { id:'holy',       label:'Thánh Linh',  desc:'Được thần thánh ban phúc, tăng sức mạnh khi gặp tà ma' },
  { id:'wanderer',   label:'Lãng Du',     desc:'Tự tìm chủ nhân tiếp theo, không gắn bó lâu dài' },
  { id:'loyal',      label:'Trung Thành', desc:'Tuyệt đối trung thành, không bao giờ rời chủ nhân chính thức', bondBonus:50 },
];

// ============================================================
// ENGINE STATE
// ============================================================
function _aeeDefaultState() {
  return {
    version: 2,
    artifacts: [],           // AEE-tracked artifacts (DNA objects)
    artifactMemory: [],      // Global artifact event log (max 1000)
    rankings: {
      mostKills:     null,   // artifact id
      mostOwners:    null,
      mostBattles:   null,
      oldest:        null,
      mostFamous:    null,
      mostEvolved:   null,
    },
    museum: [],              // { countryName, artifactId, displayYear }
    collections: [],         // { npcName, artifactIds[] }
    destroyedArtifacts: [],  // artifacts that were destroyed (ghost memory)
    fusionEvents: [],        // { year, a, b, result }
    rebirthEvents: [],       // { year, original, reborn }
    stats: {
      totalCreated: 0,
      totalDestroyed: 0,
      totalFusions: 0,
      totalRebirths: 0,
      totalKills: 0,
    },
  };
}

window.aeeState = window.aeeState || null;

// ============================================================
// SAVE / LOAD
// ============================================================
function aeeSave() {
  try { localStorage.setItem(AEE_SAVE_KEY, JSON.stringify(window.aeeState)); }
  catch(e) { console.warn('[AEE] Save failed:', e); }
}

function aeeLoad() {
  try {
    const raw = localStorage.getItem(AEE_SAVE_KEY);
    window.aeeState = raw
      ? Object.assign(_aeeDefaultState(), JSON.parse(raw))
      : _aeeDefaultState();
  } catch(e) {
    window.aeeState = _aeeDefaultState();
  }
}

// ============================================================
// ARTIFACT DNA — CREATION
// ============================================================
/**
 * aeeCreateArtifact(opts)
 * Create a living artifact with full DNA.
 * opts: { name, type, rarity, icon, creator, creatorYear, description,
 *         power, ownerName, powers, sectOwner, isNational }
 * Returns the artifact DNA object.
 */
function aeeCreateArtifact(opts = {}) {
  const curYear   = opts.creatorYear ?? (typeof year !== 'undefined' ? year : 1);
  const rarity    = opts.rarity || 'rare';
  const type      = opts.type   || 'Sword';
  const icon      = opts.icon   || AEE_CFG.TYPE_ICONS[type] || '✨';
  const creator   = opts.creator || _aeeRandomCreator();
  const name      = opts.name   || `${creator.split(' ')[0]}의 ${type}`;

  const dna = {
    // Identity
    id:           'aee_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    name,
    type,
    rarity,
    icon,
    description:  opts.description || `Bảo vật loại ${type} do ${creator} chế tác.`,

    // Creator
    creator,
    creationYear: curYear,

    // Status
    currentOwner:  opts.ownerName || null,
    location:      opts.location  || (opts.ownerName ? `Tay ${opts.ownerName}` : 'Không xác định'),
    isLost:        false,
    isDestroyed:   false,
    isSentient:    false,
    isNationalTreasure: opts.isNational || false,
    sectOwner:     opts.sectOwner || null,

    // History
    ownerHistory:  [],
    battleHistory: [],

    // Progression
    kills:         0,
    evolutionLevel:0,   // 0-6
    exp:           0,
    fame:          _aeeFameBase(rarity),
    legendLevel:   0,   // index into AEE_CFG.LEGEND_LEVELS
    mythLevel:     0,   // 0-5: degree of mythologisation
    power:         opts.power ?? _aeePowerBase(rarity),
    age:           0,

    // Bond (with current owner)
    bond:          0,

    // Personality (unlocked at evolutionLevel >= 3)
    personality:   null,   // { id, label, desc }

    // Spirit
    spirit:        null,   // { name, awakened, personality }

    // Special flags
    isCursed:      false,
    isHoly:        false,
    curseDesc:     null,
    holyDesc:      null,

    // Quest hooks
    questHooks:    [],     // quests generated by this artifact

    // Misc
    powers:        opts.powers || [`${name} Nhất Kích`],
    wars:          [],
    lastOwnerBond: {},     // ownerName → bond history
  };

  // Register first owner
  if (opts.ownerName) {
    dna.ownerHistory.push({
      name: opts.ownerName,
      year: curYear,
      how:  opts.ownerHow || 'Người tạo ra',
      bond: 0,
      cause: null,
    });
    dna.currentOwner = opts.ownerName;
  }

  window.aeeState.artifacts.push(dna);
  window.aeeState.stats.totalCreated++;

  _aeeMemory(dna, `⚔️ [${icon} ${name}] (${AEE_CFG.RARITY[rarity]?.label}) được ${creator} chế tác vào năm ${curYear}.`, 'creation');
  _aeeWorldLog(`⚔️ Bảo vật [${icon} ${name}] ra đời — Người chế tác: ${creator}`, 'important');
  _aeeUpdateRankings();
  aeeSave();
  return dna;
}

function _aeeFameBase(rarity) {
  return { common:10, rare:100, epic:500, legendary:2000, divine:8000, mythic:20000 }[rarity] || 10;
}
function _aeePowerBase(rarity) {
  return { common:50, rare:300, epic:1000, legendary:3000, divine:7000, mythic:15000 }[rarity] || 50;
}

// ============================================================
// ARTIFACT DNA — GETTERS
// ============================================================
function aeeGetArtifact(id) {
  return window.aeeState?.artifacts?.find(a => a.id === id) || null;
}

function aeeGetByName(name) {
  return window.aeeState?.artifacts?.find(a => a.name === name) || null;
}

function aeeGetAll() {
  return window.aeeState?.artifacts || [];
}

// ============================================================
// OWNER TRANSFER
// ============================================================
/**
 * aeeTransferOwner(id, newOwner, how, transferYear)
 */
function aeeTransferOwner(id, newOwner, how, transferYear) {
  const art = aeeGetArtifact(id);
  if (!art || art.isDestroyed) return false;
  const curYear = transferYear ?? (typeof year !== 'undefined' ? year : 0);

  // Close previous owner entry
  if (art.ownerHistory.length > 0) {
    const prev = art.ownerHistory[art.ownerHistory.length - 1];
    if (!prev.cause) prev.cause = how || 'Truyền đi';
    prev.bondEnd = art.bond;
  }

  // Personality checks
  if (art.personality?.id === 'proud') {
    const newNPC = typeof npcs !== 'undefined'
      ? npcs.find(n => n.name === newOwner)
      : null;
    if (newNPC && (newNPC.realm || 0) < 5) {
      _aeeMemory(art, `💢 [${art.name}] kiêu ngạo — phản kháng chủ nhân yếu ${newOwner}!`, 'reject');
      _aeeWorldLog(`💢 Bảo vật [${art.icon} ${art.name}] từ chối chủ nhân ${newOwner} vì quá yếu!`, 'warning');
    }
  }

  // Loyalty — can't leave
  if (art.personality?.id === 'loyal' && art.currentOwner && art.bond >= 200) {
    const prevOwner = art.ownerHistory[art.ownerHistory.length - 1];
    if (prevOwner && prevOwner.name === art.currentOwner) {
      _aeeMemory(art, `🔗 [${art.name}] trung thành tuyệt đối — không thể rời ${art.currentOwner}!`, 'bond');
      return false;
    }
  }

  // Open new owner entry
  art.ownerHistory.push({
    name: newOwner,
    year: curYear,
    how:  how || 'Nhận lãnh',
    bond: 0,
    cause: null,
  });

  art.currentOwner = newOwner;
  art.isLost = false;
  art.location = `Tay ${newOwner}`;
  art.bond = 0;
  art.fame += 300;

  _aeeMemory(art, `🔄 [${art.icon} ${art.name}] truyền đến tay ${newOwner} (${how}) — Năm ${curYear}`, 'transfer');
  _aeeWorldLog(`🔄 Bảo vật [${art.icon} ${art.name}] → ${newOwner} (${how})`, 'important');
  _aeeUpdateRankings();
  aeeSave();
  return true;
}

// ============================================================
// ARTIFACT LOST
// ============================================================
function aeeLoseArtifact(id, cause, location, lostYear) {
  const art = aeeGetArtifact(id);
  if (!art || art.isDestroyed) return false;
  const curYear = lostYear ?? (typeof year !== 'undefined' ? year : 0);

  if (art.ownerHistory.length > 0) {
    const prev = art.ownerHistory[art.ownerHistory.length - 1];
    if (!prev.cause) prev.cause = cause || 'Thất lạc';
  }

  art.currentOwner = null;
  art.isLost = true;
  art.location = location || 'Không xác định';
  art.fame += 1000; // Lost artifacts become MORE legendary

  _aeeMemory(art, `🌑 [${art.icon} ${art.name}] THẤT LẠC — ${cause}. Vị trí: ${art.location}. Năm ${curYear}`, 'lost');
  _aeeWorldLog(`🌑 Bảo vật [${art.icon} ${art.name}] thất lạc — ${cause}`, 'warning');
  _aeeUpdateRankings();
  aeeSave();
  return true;
}

// ============================================================
// ARTIFACT DESTRUCTION
// ============================================================
/**
 * aeeDestroyArtifact(id, cause, year)
 * Marks artifact as destroyed but preserves its full history.
 */
function aeeDestroyArtifact(id, cause, destroyYear) {
  const art = aeeGetArtifact(id);
  if (!art || art.isDestroyed) return false;
  const curYear = destroyYear ?? (typeof year !== 'undefined' ? year : 0);

  art.isDestroyed  = true;
  art.destroyYear  = curYear;
  art.destroyCause = cause || 'Không rõ';
  art.fame += 5000; // Destruction makes it immortal in memory

  // Save ghost memory
  window.aeeState.destroyedArtifacts.push({
    id:          art.id,
    name:        art.name,
    icon:        art.icon,
    rarity:      art.rarity,
    creator:     art.creator,
    creationYear:art.creationYear,
    destroyYear: curYear,
    destroyCause:cause,
    kills:       art.kills,
    ownerCount:  art.ownerHistory.length,
    fame:        art.fame,
    ownerHistory:art.ownerHistory.map(o => o.name).join(' → '),
  });
  window.aeeState.stats.totalDestroyed++;

  _aeeMemory(art, `💥 [${art.icon} ${art.name}] BỊ PHÁ HỦY — ${cause}. Năm ${curYear}. Lịch sử ${art.ownerHistory.length} chủ nhân được thiên địa ghi nhớ mãi mãi.`, 'destroyed');
  _aeeWorldLog(`💥 Bảo vật [${art.icon} ${art.name}] đã bị phá hủy — ${cause}. Nhưng lịch sử bảo vật vẫn sống mãi!`, 'warning');
  addWorldHistory?.('artifact', `Bảo vật [${art.name}] bị phá hủy — ${cause}`, { artifactName: art.name });
  _aeeUpdateRankings();
  aeeSave();
  return true;
}

// ============================================================
// ARTIFACT REBIRTH
// ============================================================
/**
 * aeeRebirthArtifact(destroyedId, newOpts)
 * Reforge a destroyed artifact — inherits history + bonus stats.
 */
function aeeRebirthArtifact(destroyedId, newOpts = {}) {
  const ghost = window.aeeState.destroyedArtifacts.find(a => a.id === destroyedId);
  const oldArt = aeeGetArtifact(destroyedId); // may still be in array as destroyed

  const curYear = typeof year !== 'undefined' ? year : 0;
  const baseName = ghost?.name || newOpts.name || 'Tái Sinh Thần Bảo';

  // New artifact inherits rarity bump + bonus
  const rarityMap = { common:'rare', rare:'epic', epic:'legendary', legendary:'divine', divine:'mythic', mythic:'mythic' };
  const inheritedRarity = newOpts.rarity || rarityMap[ghost?.rarity || 'rare'] || 'legendary';

  const reborn = aeeCreateArtifact({
    name:        newOpts.name        || `${baseName} - Tái Sinh`,
    type:        newOpts.type        || oldArt?.type || 'Sword',
    rarity:      inheritedRarity,
    icon:        newOpts.icon        || ghost?.icon || '🌟',
    creator:     newOpts.creator     || `Người Rèn Lại ${baseName}`,
    description: newOpts.description || `Tái sinh từ xác của [${baseName}] — kế thừa hào quang một nghìn năm.`,
    power:       (ghost ? Math.round(ghost.kills * 10 + ghost.fame / 10) : 0) + _aeePowerBase(inheritedRarity),
    ownerName:   newOpts.ownerName || null,
    ownerHow:    'Tái sinh từ tro tàn',
  });

  // Inherit history notes
  if (ghost) {
    reborn.description += ` Kiếp trước: ${ghost.ownerCount} chủ nhân, ${ghost.kills} mạng sống.`;
    reborn.fame += ghost.fame;
    reborn.evolutionLevel = Math.min(6, (oldArt?.evolutionLevel || 0) + 1);
    reborn.mythLevel = Math.min(5, (oldArt?.mythLevel || 0) + 1);
  }

  window.aeeState.rebirthEvents.push({
    year: curYear,
    originalId:   destroyedId,
    originalName: baseName,
    rebornId:     reborn.id,
    rebornName:   reborn.name,
  });
  window.aeeState.stats.totalRebirths++;

  _aeeMemory(reborn, `🌅 [${reborn.icon} ${reborn.name}] PHỤC SINH từ tro tàn của [${baseName}] — Năm ${curYear}`, 'rebirth');
  _aeeWorldLog(`🌅 Bảo vật [${reborn.icon} ${reborn.name}] phục sinh từ [${baseName}]! Sức mạnh vượt tiền thân!`, 'legendary');
  aeeSave();
  return reborn;
}

// ============================================================
// ARTIFACT FUSION
// ============================================================
/**
 * aeeFuseArtifacts(idA, idB, fusedName, fuserName)
 * Fuse two artifacts into one — rare event.
 */
function aeeFuseArtifacts(idA, idB, fusedName, fuserName) {
  const artA = aeeGetArtifact(idA);
  const artB = aeeGetArtifact(idB);
  if (!artA || !artB || artA.isDestroyed || artB.isDestroyed) return null;

  const curYear = typeof year !== 'undefined' ? year : 0;
  const rarities = ['common','rare','epic','legendary','divine','mythic'];
  const rarityA  = rarities.indexOf(artA.rarity);
  const rarityB  = rarities.indexOf(artB.rarity);
  const newRarityIdx = Math.min(5, Math.max(rarityA, rarityB) + 1);
  const newRarity = rarities[newRarityIdx];

  const fused = aeeCreateArtifact({
    name:        fusedName || `${artA.name} · ${artB.name}`,
    type:        artA.type,
    rarity:      newRarity,
    icon:        '🌟',
    creator:     fuserName || 'Đại Sư Hợp Luyện',
    description: `Dung hợp từ [${artA.name}] và [${artB.name}]. Sức mạnh hai bảo vật hòa quyện thành một.`,
    power:       artA.power + artB.power,
    ownerName:   fuserName || null,
    ownerHow:    'Tự tay hợp luyện',
    powers:      [...(artA.powers || []), ...(artB.powers || [])],
  });

  fused.fame = artA.fame + artB.fame + 5000;
  fused.evolutionLevel = Math.min(6, Math.max(artA.evolutionLevel, artB.evolutionLevel) + 1);
  fused.kills = artA.kills + artB.kills;

  // Destroy both originals
  aeeDestroyArtifact(idA, `Hòa nhập vào [${fused.name}]`, curYear);
  aeeDestroyArtifact(idB, `Hòa nhập vào [${fused.name}]`, curYear);

  window.aeeState.fusionEvents.push({
    year: curYear,
    artAId: idA, artAName: artA.name,
    artBId: idB, artBName: artB.name,
    resultId: fused.id, resultName: fused.name,
  });
  window.aeeState.stats.totalFusions++;

  _aeeMemory(fused, `🌟 HỢP LUYỆN: [${artA.name}] + [${artB.name}] → [${fused.icon} ${fused.name}] — Năm ${curYear}`, 'fusion');
  _aeeWorldLog(`🌟 BẢO VẬT HỢP LUYỆN! [${artA.name}] + [${artB.name}] → [${fused.name}] (${AEE_CFG.RARITY[newRarity]?.label})!`, 'legendary');
  addWorldHistory?.('artifact', `Hợp luyện bảo vật: [${fused.name}] ra đời`, { artifactName: fused.name });
  aeeSave();
  return fused;
}

// ============================================================
// BATTLE RECORD — gain EXP and kills
// ============================================================
/**
 * aeeBattleRecord(id, battleName, ownerName, killCount, won)
 */
function aeeBattleRecord(id, battleName, ownerName, killCount, won) {
  const art = aeeGetArtifact(id);
  if (!art || art.isDestroyed) return false;

  const curYear = typeof year !== 'undefined' ? year : 0;
  killCount = killCount || 0;

  art.battleHistory.push({
    year:      curYear,
    battle:    battleName || 'Vô Danh',
    usedBy:    ownerName  || art.currentOwner || 'Không rõ',
    kills:     killCount,
    won:       !!won,
  });

  art.kills += killCount;
  art.fame  += killCount * 10 + (won ? 200 : 50);
  window.aeeState.stats.totalKills += killCount;

  // Gain EXP
  const expGain = killCount * 20 + (won ? 500 : 100);
  _aeeAddExp(art, expGain);

  // Blood curse threshold
  if (art.kills >= AEE_CFG.KILL_CURSE_THRESHOLD && !art.isCursed && !art.isHoly) {
    art.isCursed   = true;
    art.curseDesc  = `Huyết Nguyền — ${art.kills} linh hồn bị hút vào bảo vật, tạo ra nguyền chú đen tối.`;
    _aeeMemory(art, `🩸 [${art.name}] bị Huyết Nguyền sau ${art.kills} mạng sống! Nguyền chú lan tỏa!`, 'curse');
    _aeeWorldLog(`🩸 Bảo vật [${art.icon} ${art.name}] bị HUYẾT NGUYỀN — ${art.kills} linh hồn!`, 'warning');
  }

  // Personality unlock: bloodthirst bonus
  if (art.personality?.id === 'bloodthirst') {
    art.power = Math.round(art.power * (1 + art.personality.killBonus || 0.1));
  }

  _aeeCheckLegendLevel(art);
  _aeeUpdateRankings();
  aeeSave();
  return true;
}

// ============================================================
// EXP & EVOLUTION
// ============================================================
function _aeeAddExp(art, amount) {
  if (art.evolutionLevel >= 6) return;
  art.exp += amount;
  const threshold = AEE_CFG.EXP_THRESHOLDS[art.evolutionLevel + 1];
  if (threshold && art.exp >= threshold) {
    _aeeEvolve(art);
  }
}

function _aeeEvolve(art) {
  if (art.evolutionLevel >= 6) return;
  art.evolutionLevel++;
  const curYear = typeof year !== 'undefined' ? year : 0;
  const tierName = AEE_EVOLUTION_TIERS[art.evolutionLevel];
  art.power = Math.round(art.power * 1.5);
  art.fame  += 2000;

  // Rarity upgrade at milestones
  const rarityUpgrades = { 2:'epic', 4:'divine', 6:'mythic' };
  if (rarityUpgrades[art.evolutionLevel]) {
    const rarities = ['common','rare','epic','legendary','divine','mythic'];
    const curIdx  = rarities.indexOf(art.rarity);
    const target  = rarities.indexOf(rarityUpgrades[art.evolutionLevel]);
    if (curIdx < target) art.rarity = rarityUpgrades[art.evolutionLevel];
  }

  // Personality unlock at level 3
  if (art.evolutionLevel === 3 && !art.personality) {
    const p = AEE_PERSONALITIES[Math.floor(Math.random() * AEE_PERSONALITIES.length)];
    art.personality = { id: p.id, label: p.label, desc: p.desc };
    _aeeMemory(art, `✨ [${art.name}] đạt ${tierName} — Thức tỉnh tính cách: ${p.label} — ${p.desc}`, 'evolution');
    _aeeWorldLog(`✨ Bảo vật [${art.icon} ${art.name}] tiến hóa lên ${tierName} — Tính cách: ${p.label}!`, 'legendary');
  } else {
    _aeeMemory(art, `✨ [${art.name}] tiến hóa lên cảnh giới ${tierName}! Sức mạnh đạt ${art.power}.`, 'evolution');
    _aeeWorldLog(`✨ Bảo vật [${art.icon} ${art.name}] TIẾN HÓA → ${tierName}!`, 'legendary');
  }

  // Spirit awakening at level 4
  if (art.evolutionLevel === 4 && !art.spirit) {
    art.spirit = {
      name:        `${art.name.split(' ')[0]} Chi Linh`,
      awakened:    true,
      personality: art.personality?.label || 'Huyền bí',
      isSentient:  false,
    };
    _aeeMemory(art, `🌟 [${art.name}] thức tỉnh Khí Linh — ${art.spirit.name} xuất hiện!`, 'spirit');
    _aeeWorldLog(`🌟 Bảo vật [${art.icon} ${art.name}] THỨC TỈNH KHÍ LINH — ${art.spirit.name}!`, 'legendary');
    addWorldHistory?.('artifact', `[${art.name}] thức tỉnh khí linh`, { artifactName: art.name });
  }

  // Sentience at level 6
  if (art.evolutionLevel === 6 && art.spirit) {
    art.spirit.isSentient = true;
    art.isSentient = true;
    _aeeMemory(art, `🧠 [${art.name}] đạt KHAI THIÊN — Bảo vật TỰ Ý THỨC! Có thể tự chọn chủ nhân!`, 'sentient');
    _aeeWorldLog(`🧠 Bảo vật [${art.icon} ${art.name}] đạt KHẾ ĐẠO — HOÀN TOÀN TỰ Ý THỨC! Thiên địa chấn động!`, 'legendary');
    addWorldHistory?.('artifact', `[${art.name}] đạt bảo vật tự ý thức`, { artifactName: art.name });
  }

  addTimeline?.(`⚔️ [${art.name}] tiến hóa → ${tierName}`, 'artifact', art.icon);
  _aeeUpdateRankings();
  aeeSave();
}

// ============================================================
// BOND SYSTEM
// ============================================================
function _aeeBuildBond(art, amount) {
  const prev = art.bond;
  art.bond = Math.min(999, (art.bond || 0) + amount);

  // Bond tier crossed?
  const prevTier = AEE_CFG.BOND_LEVELS.filter(b => b.min <= prev).pop();
  const newTier  = AEE_CFG.BOND_LEVELS.filter(b => b.min <= art.bond).pop();
  if (newTier && prevTier && newTier.min !== prevTier.min && art.currentOwner) {
    _aeeMemory(art, `🔗 [${art.name}] và ${art.currentOwner} đạt Giao Tình: ${newTier.label}!`, 'bond');
    // Loyal bonus
    if (art.personality?.id === 'loyal') art.bond += art.personality.bondBonus || 50;
  }
}

// ============================================================
// SANCTIFY / CURSE (Religion Integration)
// ============================================================
function aeeSanctify(id, religionName, holyDesc) {
  const art = aeeGetArtifact(id);
  if (!art) return false;
  art.isHoly   = true;
  art.isCursed = false; // purified
  art.holyDesc = holyDesc || `Được ${religionName} phong thánh — Thần Thánh Khí bao phủ`;
  art.fame    += 3000;
  if (!art.personality) art.personality = AEE_PERSONALITIES.find(p => p.id === 'holy');
  _aeeMemory(art, `✝️ [${art.name}] được ${religionName} PHONG THÁNH — ${art.holyDesc}`, 'holy');
  _aeeWorldLog(`✝️ Bảo vật [${art.icon} ${art.name}] được ${religionName} phong thánh!`, 'important');
  aeeSave();
  return true;
}

// ============================================================
// MYTHOLOGY INTEGRATION
// ============================================================
function _aaeMythologise(art) {
  if (art.mythLevel >= 5 || art.isDestroyed) return;
  const curYear = typeof year !== 'undefined' ? year : 0;

  // People forget the creator — believe artifact fell from heaven
  const mythStages = [
    `Người đời bắt đầu thêu dệt huyền thoại về [${art.name}].`,
    `Nguồn gốc [${art.name}] dần bị quên lãng — dân gian tin rằng nó giáng từ trời.`,
    `[${art.name}] trở thành huyền thoại — bài thơ và câu chuyện lan khắp thiên hạ.`,
    `Người đời thờ phụng [${art.name}] như thần khí. Đền thờ được xây dựng.`,
    `[${art.name}] được tôn sùng như vật thần linh — câu chuyện về bảo vật vượt xa sự thật.`,
  ];

  art.mythLevel++;
  art.fame += art.mythLevel * 5000;
  const desc = mythStages[art.mythLevel - 1];

  _aeeMemory(art, `📖 Thần Thoại Hóa (Cấp ${art.mythLevel}): ${desc}`, 'myth');
  _aeeWorldLog(`📖 [${art.icon} ${art.name}] THẦN THOẠI HÓA Cấp ${art.mythLevel}: ${desc}`, 'legendary');
  addWorldHistory?.('artifact', desc, { artifactName: art.name });
  aeeSave();
}

// ============================================================
// LEGEND LEVEL CHECK
// ============================================================
function _aeeCheckLegendLevel(art) {
  const prevLevel = art.legendLevel;
  const newLevel  = AEE_CFG.LEGEND_LEVELS.reduce((acc, tier, idx) =>
    art.fame >= tier.min ? idx : acc, 0);
  if (newLevel > prevLevel) {
    art.legendLevel = newLevel;
    const tier = AEE_CFG.LEGEND_LEVELS[newLevel];
    _aeeMemory(art, `⭐ [${art.name}] đạt danh vọng: ${tier.label}!`, 'fame');
    _aeeWorldLog(`⭐ Bảo vật [${art.icon} ${art.name}] đạt danh tiếng: ${tier.label}!`, 'important');
    // Trigger mythology at high legend levels
    if (newLevel >= 4 && art.mythLevel < newLevel - 2) {
      _aaeMythologise(art);
    }
  }
}

// ============================================================
// AGE TICK
// ============================================================
function _aeeAgeTick(art, deltaYears) {
  art.age = (art.age || 0) + deltaYears;
  art.exp += deltaYears * 5; // passive exp from age
  art.fame = Math.max(art.fame, art.age * 0.5); // age slowly builds fame
  _aeeCheckLegendLevel(art);
  _aeeCheckRelicStatus(art);
  if (art.currentOwner) _aeeBuildBond(art, deltaYears * 2);
  if (art.evolutionLevel < 6) _aeeAddExp(art, 0); // Check threshold
  // Rare: mythology
  if (art.age > AEE_CFG.AGE_LEGENDARY && art.mythLevel < 2 && Math.random() < 0.02) {
    _aaeMythologise(art);
  }
}

function _aeeCheckRelicStatus(art) {
  const { AGE_ANCIENT, AGE_LEGENDARY, AGE_MYTHICAL, AGE_WORLD_RELIC } = AEE_CFG;
  let tier = null;
  if (art.age >= AGE_WORLD_RELIC) tier = '🌍 Di Tích Thế Giới';
  else if (art.age >= AGE_MYTHICAL) tier = '🌌 Cổ Vật Thần Thoại';
  else if (art.age >= AGE_LEGENDARY) tier = '⭐ Cổ Vật Huyền Thoại';
  else if (art.age >= AGE_ANCIENT)   tier = '📜 Cổ Vật';
  if (tier && art.relicTier !== tier) {
    art.relicTier = tier;
    _aeeMemory(art, `🏺 [${art.name}] sau ${art.age} năm — đạt cấp ${tier}!`, 'relic');
  }
}

// ============================================================
// SECT / NATIONAL TREASURE INTEGRATION
// ============================================================
function aeeSetSectTreasure(artifactId, sectName) {
  const art = aeeGetArtifact(artifactId);
  if (!art) return false;
  art.sectOwner = sectName;
  art.fame += 500;
  _aeeMemory(art, `🏛️ [${art.name}] trở thành Tông Bảo của [${sectName}]`, 'sect');
  _aeeWorldLog(`🏛️ [${art.icon} ${art.name}] được [${sectName}] xếp vào hàng Tông Bảo!`, 'important');
  aeeSave();
  return true;
}

function aeeSetNationalTreasure(artifactId, countryName) {
  const art = aeeGetArtifact(artifactId);
  if (!art) return false;
  art.isNationalTreasure = true;
  art.location = `Quốc Khố ${countryName}`;
  art.fame += 2000;
  _aeeMemory(art, `🏯 [${art.name}] được ${countryName} công nhận Quốc Bảo!`, 'national');
  _aeeWorldLog(`🏯 [${art.icon} ${art.name}] trở thành QUỐC BẢO của ${countryName}!`, 'legendary');
  aeeSave();
  return true;
}

function aeeAddToMuseum(artifactId, countryName) {
  const art = aeeGetArtifact(artifactId);
  if (!art) return false;
  window.aeeState.museum.push({
    countryName,
    artifactId,
    artifactName: art.name,
    displayYear: typeof year !== 'undefined' ? year : 0,
  });
  art.location = `Bảo Tàng ${countryName}`;
  art.fame += 1000;
  _aeeWorldLog(`🏛️ [${art.icon} ${art.name}] được trưng bày tại Bảo Tàng ${countryName}`, 'important');
  aeeSave();
  return true;
}

// ============================================================
// QUEST GENERATION
// ============================================================
function _aeeGenerateQuest(art) {
  const templates = [
    { title:`Tìm Kiếm [${art.name}]`,       desc:`Bảo vật huyền thoại [${art.name}] đang thất lạc tại ${art.location}. Ai tìm được sẽ nhận trọng thưởng.`, type:'recover' },
    { title:`Bảo Vệ [${art.name}]`,          desc:`[${art.name}] đang bị các thế lực tranh đoạt. Hãy bảo vệ bảo vật cho chủ nhân.`, type:'protect' },
    { title:`Nghiên Cứu [${art.name}]`,      desc:`Cổ vật [${art.name}] ẩn chứa bí mật của thời đại cổ xưa. Hãy khám phá nguồn gốc thực sự.`, type:'research' },
    { title:`Phục Hồi [${art.name}]`,        desc:`[${art.name}] đã bị tổn hại — cần đại sư luyện bảo phục chế lại.`, type:'restore' },
    { title:`Truyền Thừa [${art.name}]`,     desc:`Chủ nhân cuối cùng của [${art.name}] để lại di chúc — tìm kẻ kế thừa xứng đáng.`, type:'inherit' },
  ];
  const quest = templates[Math.floor(Math.random() * templates.length)];
  art.questHooks.push({ ...quest, year: typeof year !== 'undefined' ? year : 0, artifactId: art.id });
  if (typeof window.addLog === 'function') addLog(`📜 Nhiệm Vụ Mới: ${quest.title}`, 'quest');
  return quest;
}

// ============================================================
// YEARLY TICK
// ============================================================
function aeeYearlyTick() {
  if (!window.aeeState) return;
  const curYear = typeof year !== 'undefined' ? year : 0;

  window.aeeState.artifacts.forEach(art => {
    if (art.isDestroyed) return;

    // Age all artifacts
    _aeeAgeTick(art, 1);

    // NPC inheritance check
    _aeeCheckOwnerDeath(art, curYear);

    // Random quest generation (2% per year per lost artifact)
    if (art.isLost && Math.random() < 0.02) {
      _aeeGenerateQuest(art);
    }

    // Passively generate battle EXP if owned
    if (art.currentOwner && Math.random() < 0.15) {
      const kills = Math.floor(Math.random() * 20);
      if (kills > 0) aeeBattleRecord(art.id, '佚名 戰鬥', art.currentOwner, kills, Math.random() > 0.4);
    }

    // Random fame event (1%)
    if (Math.random() < 0.01) {
      art.fame += Math.floor(Math.random() * 500);
      _aeeCheckLegendLevel(art);
    }
  });

  // Rankings update
  _aeeUpdateRankings();

  // Periodic save
  if (curYear % 5 === 0) aeeSave();
}

function _aeeCheckOwnerDeath(art, curYear) {
  if (!art.currentOwner || art.isLost || typeof npcs === 'undefined') return;
  const ownerNPC = npcs.find(n => n.name === art.currentOwner && n.status === 'dead');
  if (!ownerNPC) return;

  const roll = Math.random();
  // Bond-adjusted survival chance
  const bondKeepChance = Math.min(0.5, (art.bond || 0) / 400);

  if (roll < 0.3 + bondKeepChance) {
    // Pass to disciple
    const disciple = npcs.find(n => n.status === 'alive' && n.master === ownerNPC.name);
    if (disciple) {
      aeeTransferOwner(art.id, disciple.name, 'Đệ tử kế thừa di vật', curYear);
      return;
    }
  }
  if (roll < 0.55) {
    // Pass to child
    const child = npcs.find(n => n.status === 'alive' && n.father === ownerNPC.name);
    if (child) {
      aeeTransferOwner(art.id, child.name, 'Con cái kế thừa', curYear);
      return;
    }
  }
  if (roll < 0.70) {
    // Stolen
    const thief = _aeeRandomPower();
    aeeTransferOwner(art.id, thief, 'Cướp đoạt', curYear);
    return;
  }
  // Lost
  aeeLoseArtifact(art.id, 'Chủ nhân qua đời, vô chủ', `Mộ phần ${ownerNPC.name}`, curYear);
}

// ============================================================
// NPC FORGE — NPCs create artifacts naturally
// ============================================================
function _aeeNPCForge() {
  if (typeof npcs === 'undefined') return;
  // High realm NPCs: blacksmiths / sect masters
  const forgers = npcs.filter(n =>
    n.status === 'alive' &&
    (n.realm || 0) >= 7 &&
    Math.random() < 0.01
  );
  forgers.slice(0, 2).forEach(npc => {
    const rarities = ['epic','legendary','divine'];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const types = ['Sword','Spear','Armor','Seal','Cauldron'];
    const type = types[Math.floor(Math.random() * types.length)];
    aeeCreateArtifact({
      name:      `${npc.name.split(' ')[0]} ${type}`,
      type,
      rarity,
      creator:   npc.name,
      ownerName: npc.name,
      ownerHow:  'Tự tay luyện chế',
    });
  });
}

// ============================================================
// RANKINGS
// ============================================================
function _aeeUpdateRankings() {
  const arts = window.aeeState.artifacts.filter(a => !a.isDestroyed);
  if (!arts.length) return;
  const r = window.aeeState.rankings;
  r.mostKills    = arts.reduce((b,a) => (a.kills       > (b?._kills||0)          ? {...a,_kills:a.kills}            : b), null)?.id || null;
  r.mostOwners   = arts.reduce((b,a) => (a.ownerHistory.length > (b?._len||0)    ? {...a,_len:a.ownerHistory.length}: b), null)?.id || null;
  r.mostBattles  = arts.reduce((b,a) => (a.battleHistory.length > (b?._len||0)   ? {...a,_len:a.battleHistory.length}: b), null)?.id || null;
  r.oldest       = arts.reduce((b,a) => (a.age         > (b?._age||0)            ? {...a,_age:a.age}               : b), null)?.id || null;
  r.mostFamous   = arts.reduce((b,a) => (a.fame        > (b?._fame||0)           ? {...a,_fame:a.fame}             : b), null)?.id || null;
  r.mostEvolved  = arts.reduce((b,a) => (a.evolutionLevel > (b?._evo||0)         ? {...a,_evo:a.evolutionLevel}    : b), null)?.id || null;
}

function aeeGetRankings(topN) {
  const arts = window.aeeState.artifacts.filter(a => !a.isDestroyed);
  topN = topN || 10;
  return {
    byKills:      [...arts].sort((a,b) => b.kills - a.kills).slice(0, topN),
    byFame:       [...arts].sort((a,b) => b.fame  - a.fame ).slice(0, topN),
    byAge:        [...arts].sort((a,b) => b.age   - a.age  ).slice(0, topN),
    byPower:      [...arts].sort((a,b) => b.power - a.power).slice(0, topN),
    byOwners:     [...arts].sort((a,b) => b.ownerHistory.length - a.ownerHistory.length).slice(0, topN),
    byEvolution:  [...arts].sort((a,b) => b.evolutionLevel - a.evolutionLevel).slice(0, topN),
  };
}

// ============================================================
// ARTIFACT MEMORY LOG
// ============================================================
function _aeeMemory(art, msg, type) {
  const entry = {
    year: typeof year !== 'undefined' ? year : 0,
    artifactId:   art.id,
    artifactName: art.name,
    msg,
    type,
  };
  window.aeeState.artifactMemory.push(entry);
  if (window.aeeState.artifactMemory.length > 1000) {
    window.aeeState.artifactMemory.shift();
  }
}

function _aeeWorldLog(msg, type) {
  if (typeof addLog       === 'function') addLog(msg, type || 'important');
  if (typeof addTimeline  === 'function') addTimeline(msg, 'artifact', '⚔️');
  if (typeof window.creatorGodHistory !== 'undefined') {
    window.creatorGodHistory.unshift({
      year:   typeof year !== 'undefined' ? year : 0,
      action: '⚔️ Bảo Vật',
      detail: msg,
      type:   'artifact',
    });
  }
}

// ============================================================
// PANEL — ⚔️ ENCYCLOPEDIA / ARTIFACT BOOK
// ============================================================
function aeeInjectPanel() {
  // Nav button
  const navRow = document.querySelector('.nav-row') || document.querySelector('.panels-nav') || document.querySelector('nav');
  if (navRow && !document.getElementById('aee-nav-btn')) {
    const btn = document.createElement('button');
    btn.id = 'aee-nav-btn';
    btn.className = 'nav-btn';
    btn.setAttribute('data-panel', 'aee-panel');
    btn.innerHTML = '📖 <span>Bách Khoa Bảo Vật</span>';
    btn.style.cssText = 'background:linear-gradient(135deg,rgba(232,121,249,0.15),rgba(249,115,22,0.1));border:1px solid rgba(232,121,249,0.4);';
    btn.onclick = () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const panel = document.getElementById('aee-panel');
      if (panel) { panel.classList.add('active'); btn.classList.add('active'); aeeRenderPanel(); }
    };
    navRow.appendChild(btn);
  }

  // Panel container
  const panelsContainer = document.querySelector('.panels');
  if (panelsContainer && !document.getElementById('aee-panel')) {
    const panel = document.createElement('div');
    panel.id = 'aee-panel';
    panel.className = 'panel';
    panelsContainer.appendChild(panel);
  }
}

/**
 * aeeRenderPanel() — renders the full Artifact Encyclopedia
 */
function aeeRenderPanel() {
  const el = document.getElementById('aee-panel');
  if (!el || !window.aeeState) return;

  const arts        = window.aeeState.artifacts;
  const active      = arts.filter(a => !a.isDestroyed && !a.isLost);
  const lost        = arts.filter(a => !a.isDestroyed &&  a.isLost);
  const destroyed   = window.aeeState.destroyedArtifacts;
  const rankings    = aeeGetRankings(5);
  const { stats }   = window.aeeState;

  const legendBadge = (art) => {
    const tier = AEE_CFG.LEGEND_LEVELS[art.legendLevel] || AEE_CFG.LEGEND_LEVELS[0];
    return `<span style="color:${tier.color};font-size:10px;font-weight:700">${tier.label}</span>`;
  };

  const evolutionBadge = (art) => {
    const evo = AEE_EVOLUTION_TIERS[art.evolutionLevel] || '?';
    return `<span style="color:#c084fc;font-size:10px">⬆ ${evo}</span>`;
  };

  const bondBadge = (art) => {
    if (!art.currentOwner) return '';
    const tier = AEE_CFG.BOND_LEVELS.filter(b => b.min <= (art.bond || 0)).pop() || AEE_CFG.BOND_LEVELS[0];
    return `<span style="color:${tier.color};font-size:10px">🔗 ${tier.label}(${art.bond||0})</span>`;
  };

  const rarityColor = (r) => AEE_CFG.RARITY[r]?.color || '#fff';
  const rarityGlow  = (r) => AEE_CFG.RARITY[r]?.glow  || 'transparent';
  const rarityLabel = (r) => AEE_CFG.RARITY[r]?.label  || r;

  const artCard = (art, compact) => {
    const rc = rarityColor(art.rarity);
    const rg = rarityGlow(art.rarity);
    const ownerChain = art.ownerHistory.map(o => o.name).join(' → ') || '—';
    const battleCount = art.battleHistory.length;
    const flags = [
      art.isSentient  && '🧠 Tự Ý Thức',
      art.isHoly      && '✝️ Thánh Bảo',
      art.isCursed    && '🩸 Huyết Nguyền',
      art.isNationalTreasure && '🏯 Quốc Bảo',
      art.sectOwner   && `🏛️ Tông Bảo ${art.sectOwner}`,
      art.relicTier,
    ].filter(Boolean);

    return `
      <div style="
        border:1px solid ${rc};border-radius:10px;padding:10px 12px;margin-bottom:8px;
        background:rgba(10,15,30,0.8);box-shadow:0 0 12px ${rg};
      ">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <span style="font-size:1.7em;min-width:32px;text-align:center">${art.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;color:${rc};font-size:13px">${art.name}</div>
            <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-top:2px">
              <span style="color:${rc};font-size:11px">${rarityLabel(art.rarity)}</span>
              <span style="color:#64748b;font-size:10px">·</span>
              ${legendBadge(art)}
              <span style="color:#64748b;font-size:10px">·</span>
              ${evolutionBadge(art)}
              ${art.currentOwner ? bondBadge(art) : ''}
            </div>
          </div>
          <div style="text-align:right;min-width:60px">
            <div style="color:${rc};font-size:13px;font-weight:700">${art.power.toLocaleString()}</div>
            <div style="color:#facc15;font-size:10px">⭐${art.fame.toLocaleString()}</div>
          </div>
        </div>
        ${!compact ? `<div style="font-size:11px;color:#94a3b8;margin:4px 0">${art.description}</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;font-size:10px">
          <span style="color:#60a5fa">✍ ${art.creator}</span>
          <span style="color:#64748b">· Năm ${art.creationYear}</span>
          <span style="color:#4ade80">· Tuổi ${art.age}</span>
          <span style="color:#f87171">· ☠️${art.kills.toLocaleString()} mạng</span>
          <span style="color:#c084fc">· ⚔️${battleCount} trận</span>
          <span style="color:#facc15">· ${art.ownerHistory.length} chủ nhân</span>
        </div>
        ${flags.length ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">${flags.map(f=>`<span style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:4px;padding:1px 6px;font-size:10px;color:#e2e8f0">${f}</span>`).join('')}</div>` : ''}
        ${!compact && art.spirit ? `<div style="font-size:10px;color:#38bdf8;margin-top:3px">🌟 Khí Linh: ${art.spirit.name}${art.spirit.isSentient?' (Tự Ý Thức)':''}</div>` : ''}
        ${!compact && art.personality ? `<div style="font-size:10px;color:#c084fc;margin-top:2px">✨ Tính Cách: ${art.personality.label} — ${art.personality.desc}</div>` : ''}
        ${!compact ? `<div style="font-size:10px;color:#64748b;margin-top:3px;border-top:1px solid rgba(255,255,255,0.04);padding-top:3px">
          📜 ${ownerChain}
        </div>` : ''}
        ${!compact && art.isLost ? `<div style="font-size:10px;color:#f97316;margin-top:2px">📍 Vị trí: ${art.location}</div>` : ''}
        ${!compact && art.isCursed ? `<div style="font-size:10px;color:#f87171;margin-top:2px">🩸 ${art.curseDesc}</div>` : ''}
        ${!compact && art.isHoly ? `<div style="font-size:10px;color:#4ade80;margin-top:2px">✝️ ${art.holyDesc}</div>` : ''}
      </div>
    `;
  };

  const rankRow = (label, id) => {
    const a = id ? aeeGetArtifact(id) : null;
    if (!a) return `<div style="text-align:center;color:#334155;font-size:12px">—</div>`;
    return `<div style="background:rgba(15,23,42,0.9);border:1px solid ${rarityColor(a.rarity)};border-radius:8px;padding:8px;text-align:center">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:700">${label}</div>
      <div style="font-size:1.5em">${a.icon}</div>
      <div style="font-size:12px;font-weight:700;color:${rarityColor(a.rarity)}">${a.name}</div>
    </div>`;
  };

  el.innerHTML = `
    <div style="padding:16px;max-height:calc(100vh - 80px);overflow-y:auto;font-family:inherit">

      <!-- HEADER -->
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:1.5em;font-weight:900;color:#e879f9;text-shadow:0 0 20px rgba(232,121,249,0.5)">📖 BÁCH KHOA BẢO VẬT</div>
        <div style="color:#94a3b8;font-size:11px;margin-top:3px">Ghi chép toàn bộ lịch sử bảo vật thiên địa từ khi khai thiên tịch địa</div>
      </div>

      <!-- STATS ROW -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
        ${[
          ['📦','Tổng Bảo Vật', arts.filter(a=>!a.isDestroyed).length],
          ['💥','Đã Phá Hủy',   stats.totalDestroyed],
          ['☠️','Tổng Mạng Sống', stats.totalKills.toLocaleString()],
          ['🌟','Hợp Luyện',    stats.totalFusions],
        ].map(([i,l,v]) => `
          <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:1.2em">${i}</div>
            <div style="color:#64748b;font-size:10px">${l}</div>
            <div style="color:#e2e8f0;font-size:14px;font-weight:700">${v}</div>
          </div>
        `).join('')}
      </div>

      <!-- HALL OF FAME -->
      <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(232,121,249,0.3);border-radius:12px;padding:12px;margin-bottom:16px">
        <div style="font-size:12px;font-weight:800;color:#e879f9;margin-bottom:10px">🏆 BẢNG DANH VỌNG</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${rankRow('🔥 Mạnh Nhất',    window.aeeState.rankings.mostFamous)}
          ${rankRow('☠️ Nhiều Mạng',   window.aeeState.rankings.mostKills)}
          ${rankRow('⬆ Tiến Hóa Cao', window.aeeState.rankings.mostEvolved)}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
          ${rankRow('📜 Lâu Đời Nhất',  window.aeeState.rankings.oldest)}
          ${rankRow('👑 Nhiều Chủ',    window.aeeState.rankings.mostOwners)}
          ${rankRow('⚔️ Nhiều Trận',   window.aeeState.rankings.mostBattles)}
        </div>
      </div>

      <!-- CREATOR GOD FORGE -->
      <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(249,115,22,0.4);border-radius:12px;padding:14px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:800;color:#f97316;margin-bottom:10px">🔨 TẠO HÓA LUYỆN CHẾ DNA BẢO VẬT</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
          <input id="aee-forge-name"    placeholder="Tên bảo vật..." style="${_aeeInputStyle()}">
          <select id="aee-forge-type"  style="${_aeeInputStyle()}">
            ${Object.keys(AEE_CFG.TYPE_ICONS).map(t=>`<option value="${t}">${t}</option>`).join('')}
          </select>
          <select id="aee-forge-rarity" style="${_aeeInputStyle()}">
            ${Object.entries(AEE_CFG.RARITY).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}
          </select>
          <input id="aee-forge-creator" placeholder="Người chế tác..." style="${_aeeInputStyle()}">
          <input id="aee-forge-owner"   placeholder="Ban tặng cho... (tùy)" style="${_aeeInputStyle()}">
          <input id="aee-forge-powers"  placeholder="Quyền năng (a,b,c)..." style="${_aeeInputStyle()}">
        </div>
        <textarea id="aee-forge-desc" placeholder="Mô tả bảo vật..." rows="2" style="${_aeeInputStyle()}width:100%;resize:none;"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">
          <button onclick="aeeForgeFromUI()" style="${_aeeBtnStyle('#f97316')}">🌟 Luyện Chế</button>
          <button onclick="aeeSanctifyFromUI()" style="${_aeeBtnStyle('#38bdf8')}">✝️ Phong Thánh</button>
          <button onclick="aeeForceEvolveUI()" style="${_aeeBtnStyle('#e879f9')}">⬆ Ép Tiến Hóa</button>
        </div>
      </div>

      <!-- FUSION / REBIRTH -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(232,121,249,0.3);border-radius:10px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:#e879f9;margin-bottom:8px">🌟 HỢP LUYỆN BẢO VẬT</div>
          <input id="aee-fuse-a"    placeholder="ID/Tên bảo vật A..." style="${_aeeInputStyle()}margin-bottom:4px;">
          <input id="aee-fuse-b"    placeholder="ID/Tên bảo vật B..." style="${_aeeInputStyle()}margin-bottom:4px;">
          <input id="aee-fuse-name" placeholder="Tên bảo vật mới..." style="${_aeeInputStyle()}margin-bottom:6px;">
          <button onclick="aeeFuseUI()" style="${_aeeBtnStyle('#e879f9')}">🌟 Hợp Luyện</button>
        </div>
        <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(74,222,128,0.3);border-radius:10px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:#4ade80;margin-bottom:8px">🌅 PHỤC SINH BẢO VẬT</div>
          <input id="aee-rebirth-id"    placeholder="ID bảo vật đã phá hủy..." style="${_aeeInputStyle()}margin-bottom:4px;">
          <input id="aee-rebirth-name"  placeholder="Tên bảo vật phục sinh..." style="${_aeeInputStyle()}margin-bottom:4px;">
          <input id="aee-rebirth-owner" placeholder="Chủ nhân mới..." style="${_aeeInputStyle()}margin-bottom:6px;">
          <button onclick="aeeRebirthUI()" style="${_aeeBtnStyle('#4ade80')}">🌅 Phục Sinh</button>
        </div>
      </div>

      <!-- TABS -->
      <div id="aee-tabs" style="display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:14px">
        ${[
          ['active',    `⚔️ Đang Lưu Hành (${active.length})`],
          ['lost',      `🌑 Thất Lạc (${lost.length})`],
          ['destroyed', `💥 Đã Phá Hủy (${destroyed.length})`],
          ['memory',    '📜 Ký Ức'],
          ['rankings',  '🏆 Xếp Hạng'],
          ['museum',    '🏛️ Bảo Tàng'],
          ['timeline',  '⏳ Dòng Thời Gian'],
        ].map(([tab, label], i) => `
          <button onclick="aeeSwitchTab('${tab}')" id="aeetab-${tab}" style="
            flex:1;padding:8px 3px;font-size:10px;font-weight:700;
            background:${i===0?'rgba(232,121,249,0.12)':'none'};
            border:none;border-bottom:2px solid ${i===0?'#e879f9':'transparent'};
            color:${i===0?'#e879f9':'#94a3b8'};cursor:pointer;transition:all 0.2s;
          ">${label}</button>
        `).join('')}
      </div>

      <!-- TAB CONTENTS -->
      <div id="aeetab-content-active">
        ${active.length ? active.map(a => artCard(a, false)).join('') : '<div style="color:#334155;text-align:center;padding:24px">Chưa có bảo vật đang lưu hành.</div>'}
      </div>
      <div id="aeetab-content-lost" style="display:none">
        ${lost.length ? lost.map(a => artCard(a, false)).join('') : '<div style="color:#334155;text-align:center;padding:24px">Không có bảo vật thất lạc.</div>'}
      </div>
      <div id="aeetab-content-destroyed" style="display:none">
        ${destroyed.length ? destroyed.map(d => `
          <div style="border:1px solid #374151;border-radius:8px;padding:10px;margin-bottom:6px;background:rgba(10,10,10,0.7);opacity:0.7">
            <div style="display:flex;gap:8px;align-items:center">
              <span style="font-size:1.4em;filter:grayscale(1)">${d.icon}</span>
              <div>
                <div style="font-weight:700;color:#6b7280;text-decoration:line-through">${d.name}</div>
                <div style="font-size:11px;color:#4b5563">
                  Phá hủy năm ${d.destroyYear} — ${d.destroyCause}
                  · ☠️${d.kills} · 👤${d.ownerCount} chủ nhân
                </div>
                <div style="font-size:10px;color:#374151">${d.ownerHistory}</div>
              </div>
            </div>
            <button onclick="aeeRebirthUI('${d.id}')" style="margin-top:6px;${_aeeBtnStyle('#4ade80')}font-size:10px;padding:3px 8px">🌅 Phục Sinh</button>
          </div>
        `).join('') : '<div style="color:#334155;text-align:center;padding:24px">Không có bảo vật bị phá hủy.</div>'}
      </div>
      <div id="aeetab-content-memory" style="display:none">
        ${_aeeRenderMemory()}
      </div>
      <div id="aeetab-content-rankings" style="display:none">
        ${_aeeRenderRankings()}
      </div>
      <div id="aeetab-content-museum" style="display:none">
        ${_aeeRenderMuseum()}
      </div>
      <div id="aeetab-content-timeline" style="display:none">
        ${_aeeRenderTimeline()}
      </div>
    </div>
  `;
}

function _aeeInputStyle() {
  return 'background:rgba(30,41,59,0.8);border:1px solid #334155;border-radius:6px;padding:6px 10px;color:#e2e8f0;font-size:12px;width:100%;box-sizing:border-box;';
}
function _aeeBtnStyle(color) {
  return `padding:7px 14px;background:rgba(0,0,0,0.3);border:1px solid ${color};border-radius:7px;color:${color};font-size:11px;font-weight:700;cursor:pointer;width:100%;`;
}

function aeeSwitchTab(tab) {
  ['active','lost','destroyed','memory','rankings','museum','timeline'].forEach(t => {
    const c = document.getElementById(`aeetab-content-${t}`);
    const b = document.getElementById(`aeetab-${t}`);
    if (!c || !b) return;
    const active = t === tab;
    c.style.display     = active ? 'block' : 'none';
    b.style.background  = active ? 'rgba(232,121,249,0.12)' : 'none';
    b.style.borderBottom= active ? '2px solid #e879f9' : '2px solid transparent';
    b.style.color       = active ? '#e879f9' : '#94a3b8';
  });
}

function _aeeRenderMemory() {
  const entries = window.aeeState.artifactMemory.slice(-50).reverse();
  if (!entries.length) return '<div style="color:#334155;text-align:center;padding:24px">Chưa có ký ức bảo vật.</div>';
  const typeColor = { creation:'#4ade80', transfer:'#60a5fa', lost:'#f97316', evolution:'#e879f9',
    battle:'#f87171', destroyed:'#dc2626', rebirth:'#4ade80', fusion:'#facc15',
    bond:'#38bdf8', curse:'#dc2626', holy:'#4ade80', myth:'#c084fc', fame:'#facc15', relic:'#94a3b8' };
  return entries.map(e => `
    <div style="display:flex;gap:8px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.04)">
      <span style="color:#facc15;font-size:10px;min-width:50px;font-weight:700">Năm ${e.year}</span>
      <span style="font-size:11px;color:${typeColor[e.type]||'#94a3b8'}">${e.msg}</span>
    </div>
  `).join('');
}

function _aeeRenderRankings() {
  const rankings = aeeGetRankings(10);
  const section = (title, arts, key, formatter) => {
    if (!arts.length) return '';
    return `
      <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:#e879f9;margin-bottom:6px">${title}</div>
        ${arts.map((a,i) => `
          <div style="display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
            <span style="color:#facc15;font-weight:700;min-width:20px">#${i+1}</span>
            <span>${a.icon}</span>
            <span style="color:${rarityColor(a.rarity)};font-size:12px;font-weight:700;flex:1">${a.name}</span>
            <span style="color:#94a3b8;font-size:12px">${formatter(a)}</span>
          </div>
        `).join('')}
      </div>
    `;
  };
  const rarityColor = (r) => AEE_CFG.RARITY[r]?.color || '#fff';
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        ${section('☠️ Nhiều Mạng Nhất', rankings.byKills,   'kills',   a => `${a.kills.toLocaleString()} mạng`)}
        ${section('⭐ Nổi Tiếng Nhất',  rankings.byFame,    'fame',    a => `${a.fame.toLocaleString()} danh vọng`)}
        ${section('⬆ Tiến Hóa Cao',    rankings.byEvolution,'evo',    a => AEE_EVOLUTION_TIERS[a.evolutionLevel])}
      </div>
      <div>
        ${section('🔥 Mạnh Nhất',       rankings.byPower,   'power',  a => `${a.power.toLocaleString()} lực`)}
        ${section('📜 Lâu Đời Nhất',    rankings.byAge,     'age',    a => `${a.age} tuổi`)}
        ${section('👑 Nhiều Chủ Nhân',  rankings.byOwners,  'owners', a => `${a.ownerHistory.length} chủ nhân`)}
      </div>
    </div>
  `;
}

function _aeeRenderMuseum() {
  const museum = window.aeeState.museum;
  if (!museum.length) return '<div style="color:#334155;text-align:center;padding:24px">Chưa có bảo tàng nào.</div>';
  return museum.map(m => {
    const art = aeeGetArtifact(m.artifactId);
    return `
      <div style="border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:10px;margin-bottom:6px;background:rgba(15,23,42,0.7)">
        <div style="font-size:12px;font-weight:700;color:#38bdf8">${m.countryName} · Bảo Tàng Quốc Gia</div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
          <span style="font-size:1.4em">${art?.icon || '✨'}</span>
          <div>
            <div style="font-weight:700;color:#e2e8f0">${m.artifactName}</div>
            <div style="font-size:11px;color:#64748b">Trưng bày từ năm ${m.displayYear}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function _aeeRenderTimeline() {
  const memory = window.aeeState.artifactMemory.filter(e =>
    ['creation','transfer','lost','evolution','destroyed','rebirth','fusion','relic'].includes(e.type)
  ).slice(-60).reverse();

  if (!memory.length) return '<div style="color:#334155;text-align:center;padding:24px">Chưa có sự kiện.</div>';
  const typeIcon = { creation:'🔨', transfer:'🔄', lost:'🌑', evolution:'⬆',
    destroyed:'💥', rebirth:'🌅', fusion:'🌟', relic:'🏺' };
  return `<div style="position:relative;padding-left:20px">
    <div style="position:absolute;left:7px;top:0;bottom:0;width:2px;background:rgba(232,121,249,0.2);border-radius:2px"></div>
    ${memory.map(e => `
      <div style="position:relative;margin-bottom:10px">
        <div style="position:absolute;left:-16px;top:3px;width:10px;height:10px;border-radius:50%;background:#e879f9;border:2px solid rgba(232,121,249,0.3)"></div>
        <span style="color:#facc15;font-size:10px;font-weight:700">Năm ${e.year}</span>
        <span style="margin-left:6px;font-size:10px">${typeIcon[e.type]||'·'}</span>
        <div style="font-size:11px;color:#94a3b8;margin-top:1px">${e.msg}</div>
      </div>
    `).join('')}
  </div>`;
}

// ============================================================
// UI HANDLERS
// ============================================================
function aeeForgeFromUI() {
  const name    = document.getElementById('aee-forge-name')?.value.trim();
  const type    = document.getElementById('aee-forge-type')?.value || 'Sword';
  const rarity  = document.getElementById('aee-forge-rarity')?.value || 'legendary';
  const creator = document.getElementById('aee-forge-creator')?.value.trim() || 'Đấng Tạo Hóa';
  const owner   = document.getElementById('aee-forge-owner')?.value.trim() || undefined;
  const powersRaw = document.getElementById('aee-forge-powers')?.value.trim();
  const desc    = document.getElementById('aee-forge-desc')?.value.trim() || undefined;
  const powers  = powersRaw ? powersRaw.split(',').map(s=>s.trim()).filter(Boolean) : undefined;

  if (!name) { alert('Vui lòng nhập tên bảo vật!'); return; }

  const art = aeeCreateArtifact({ name, type, rarity, creator, ownerName: owner, powers, description: desc });
  alert(`✅ [${art.icon} ${art.name}] (${AEE_CFG.RARITY[rarity]?.label}) đã được chế tác!`);
  ['aee-forge-name','aee-forge-creator','aee-forge-owner','aee-forge-powers','aee-forge-desc']
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  aeeRenderPanel();
}

function aeeSanctifyFromUI() {
  const name    = document.getElementById('aee-forge-name')?.value.trim();
  const religion = document.getElementById('aee-forge-creator')?.value.trim() || 'Thiên Đình';
  if (!name) { alert('Nhập tên bảo vật cần phong thánh!'); return; }
  const art = aeeGetByName(name);
  if (!art) { alert('Không tìm thấy bảo vật: ' + name); return; }
  aeeSanctify(art.id, religion);
  alert(`✝️ [${art.name}] đã được phong thánh bởi ${religion}!`);
  aeeRenderPanel();
}

function aeeForceEvolveUI() {
  const name = document.getElementById('aee-forge-name')?.value.trim();
  if (!name) { alert('Nhập tên bảo vật cần ép tiến hóa!'); return; }
  const art = aeeGetByName(name);
  if (!art) { alert('Không tìm thấy: ' + name); return; }
  _aeeAddExp(art, AEE_CFG.EXP_THRESHOLDS[6] + 1); // force max threshold
  _aeeEvolve(art);
  alert(`⬆ [${art.name}] tiến hóa lên ${AEE_EVOLUTION_TIERS[art.evolutionLevel]}!`);
  aeeRenderPanel();
}

function aeeFuseUI() {
  const rawA = document.getElementById('aee-fuse-a')?.value.trim();
  const rawB = document.getElementById('aee-fuse-b')?.value.trim();
  const name = document.getElementById('aee-fuse-name')?.value.trim();
  if (!rawA || !rawB) { alert('Nhập tên/ID của 2 bảo vật!'); return; }
  const artA = aeeGetByName(rawA) || aeeGetArtifact(rawA);
  const artB = aeeGetByName(rawB) || aeeGetArtifact(rawB);
  if (!artA || !artB) { alert('Không tìm thấy một hoặc cả hai bảo vật!'); return; }
  const fused = aeeFuseArtifacts(artA.id, artB.id, name || undefined);
  if (fused) {
    alert(`🌟 Hợp Luyện thành công! → [${fused.name}] (${AEE_CFG.RARITY[fused.rarity]?.label})`);
    aeeRenderPanel();
  }
}

function aeeRebirthUI(prefilledId) {
  const id    = prefilledId || document.getElementById('aee-rebirth-id')?.value.trim();
  const name  = document.getElementById('aee-rebirth-name')?.value.trim()  || undefined;
  const owner = document.getElementById('aee-rebirth-owner')?.value.trim() || undefined;
  if (!id) { alert('Nhập ID bảo vật đã bị phá hủy!'); return; }
  const art = aeeRebirthArtifact(id, { name, ownerName: owner });
  if (art) {
    alert(`🌅 [${art.name}] phục sinh thành công!`);
    aeeRenderPanel();
  } else {
    alert('Không tìm thấy ghost memory của bảo vật này. Kiểm tra ID!');
  }
}

// ============================================================
// HELPERS
// ============================================================
function _aeeRandomCreator() {
  const creators = [
    'Thiên Kiếm Lão Tổ','Hỏa Linh Đại Sư','Vô Danh Thợ Rèn','Lôi Phong Thánh Nhân',
    'Cổ Thiên Tông Chủ','Hư Vô Đạo Nhân','Vạn Năng Luyện Sư','Băng Phong Đại Hiệp',
  ];
  if (typeof npcs !== 'undefined') {
    const alive = npcs.filter(n => n.status === 'alive' && (n.realm||0) >= 8);
    if (alive.length) return alive[Math.floor(Math.random()*alive.length)].name;
  }
  return creators[Math.floor(Math.random() * creators.length)];
}

function _aeeRandomPower() {
  const names = [
    'Thiên Ma Giáo Chủ','Huyết Kiếm Tôn','Vô Danh Khách','Cực Âm Cung Chủ','Thái Cổ Quỷ Đế',
  ];
  if (typeof npcs !== 'undefined') {
    const alive = npcs.filter(n => n.status === 'alive' && (n.realm||0) >= 8);
    if (alive.length) return alive[Math.floor(Math.random()*alive.length)].name;
  }
  return names[Math.floor(Math.random() * names.length)];
}

// ============================================================
// INIT
// ============================================================
function aeeInit() {
  aeeLoad();

  // Seed 3 starter artifacts if world is new
  if (window.aeeState.artifacts.length === 0) {
    const seeds = [
      { name:'Thiên Địa Kiếm', type:'Sword',  rarity:'legendary', creator:'Khai Thiên Thánh Tổ',   icon:'⚔️', description:'Kiếm chứng kiến buổi đầu khai thiên tịch địa — còn đây sau muôn vàn năm.' },
      { name:'Hỗn Nguyên Đỉnh',type:'Cauldron',rarity:'divine',   creator:'Nguyên Thủy Đạo Nhân',  icon:'🏺', description:'Đỉnh nguyên thủy đúc từ khí hỗn nguyên — mọi bảo vật đều phụ bạc trước nó.' },
      { name:'Bất Diệt Ấn',    type:'Seal',   rarity:'mythic',    creator:'Bất Diệt Thiên Đế',     icon:'☯️', description:'Ấn bất diệt từ thời thượng cổ — không có thứ gì có thể phá hủy nó.' },
    ];
    seeds.forEach((s, i) => {
      const art = aeeCreateArtifact({ ...s, creatorYear: 1 });
      // Make them all ancient + lost
      art.age = [3000, 2500, 4000][i];
      art.kills = [850, 620, 1200][i];
      art.fame = _aeeFameBase(s.rarity) * 20;
      art.isLost = true;
      art.location = ['Đỉnh Thiên Kiếm Sơn','Đáy Hỗn Độn Hải','Hư Không Kẽ Hở'][i];
      art.evolutionLevel = [4, 3, 5][i];
      art.exp = AEE_CFG.EXP_THRESHOLDS[art.evolutionLevel] || 0;
      art.relicTier = '🌌 Cổ Vật Thần Thoại';
      art.mythLevel = [3, 2, 4][i];
      art.legendLevel = 4;
      art.ownerHistory = [
        { name: ['Khai Thiên Thánh Tổ','Nguyên Thủy Đạo Nhân','Bất Diệt Thiên Đế'][i], year: 1, how: 'Người chế tác', cause: 'Thất lạc' },
      ];
    });
  }

  _aeeUpdateRankings();
  setTimeout(aeeInjectPanel, 1200);
  window._aeeYearlyHook = aeeYearlyTick;

  console.log(`[AEE] ⚔️ Artifact Evolution Engine V2 loaded — ${window.aeeState.artifacts.length} artifacts tracked.`);
}

// ============================================================
// PATCH INTO WORLD YEARLY TICK
// ============================================================
(function patchYearlyTick() {
  function _tryPatch() {
    if (typeof window.advanceYear === 'function' && !window._aeePatchedYear) {
      const _orig = window.advanceYear;
      window.advanceYear = function() {
        _orig.apply(this, arguments);
        aeeYearlyTick();
        _aeeNPCForge();
      };
      window._aeePatchedYear = true;
    }
    // Also chain into LAE yearly hook if present
    if (typeof window.laeYearlyTick === 'function' && !window._aeePatchedLAE) {
      const _orig = window.laeYearlyTick;
      window.laeYearlyTick = function() {
        _orig.apply(this, arguments);
        aeeYearlyTick();
      };
      window._aeePatchedLAE = true;
    }
  }
  setTimeout(_tryPatch, 2000);
})();

// ============================================================
// BRIDGE — Sync laeState artifacts into AEE on load
// ============================================================
(function bridgeLAE() {
  function _tryBridge() {
    if (!window.laeState?.artifacts?.length) return;
    window.laeState.artifacts.forEach(laeArt => {
      const existing = aeeGetArtifact(laeArt.id) || aeeGetByName(laeArt.name);
      if (existing) return; // already tracked
      // Import LAE artifact as AEE DNA
      aeeCreateArtifact({
        name:        laeArt.name,
        type:        laeArt.type || 'Sword',
        rarity:      laeArt.rarity || 'legendary',
        icon:        laeArt.icon  || '✨',
        creator:     laeArt.ownerHistory?.[0]?.name || 'Cổ Nhân',
        creatorYear: laeArt.createdYear || 1,
        description: laeArt.description || '',
        power:       laeArt.power || 1000,
        ownerName:   laeArt.currentOwner || null,
        powers:      laeArt.powers || [],
      });
    });
  }
  setTimeout(_tryBridge, 2500);
})();

// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.aeeInit             = aeeInit;
window.aeeCreateArtifact   = aeeCreateArtifact;
window.aeeGetArtifact      = aeeGetArtifact;
window.aeeGetByName        = aeeGetByName;
window.aeeGetAll           = aeeGetAll;
window.aeeTransferOwner    = aeeTransferOwner;
window.aeeLoseArtifact     = aeeLoseArtifact;
window.aeeDestroyArtifact  = aeeDestroyArtifact;
window.aeeRebirthArtifact  = aeeRebirthArtifact;
window.aeeFuseArtifacts    = aeeFuseArtifacts;
window.aeeBattleRecord     = aeeBattleRecord;
window.aeeSanctify         = aeeSanctify;
window.aeeSetSectTreasure  = aeeSetSectTreasure;
window.aeeSetNationalTreasure = aeeSetNationalTreasure;
window.aeeAddToMuseum      = aeeAddToMuseum;
window.aeeGetRankings      = aeeGetRankings;
window.aeeRenderPanel      = aeeRenderPanel;
window.aeeSwitchTab        = aeeSwitchTab;
window.aeeForgeFromUI      = aeeForgeFromUI;
window.aeeSanctifyFromUI   = aeeSanctifyFromUI;
window.aeeForceEvolveUI    = aeeForceEvolveUI;
window.aeeFuseUI           = aeeFuseUI;
window.aeeRebirthUI        = aeeRebirthUI;
window.aeeYearlyTick       = aeeYearlyTick;
window.aeeSave             = aeeSave;
window.aeeLoad             = aeeLoad;

// AUTO INIT
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => setTimeout(aeeInit, 1500));
}

console.log('[AEE] ⚔️ Artifact Evolution Engine V2 — registered. Artifacts will live, grow, and become legend.');
