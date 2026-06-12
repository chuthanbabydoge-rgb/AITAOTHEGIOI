// ============================================================
// MYTHOLOGY ENGINE V1 — Creator God V6 Phase Next
// ============================================================
// The world creates its own myths. NPC history → Legend →
// Myth. Events, heroes, wars, artifacts all evolve over
// centuries into sacred stories believed by all.
//
// SAVE COMPATIBLE: never deletes worlds / NPCs / saves.
// Uses save key: cgv6_mythologyEngine
// ============================================================

'use strict';

// ── SAVE KEY ─────────────────────────────────────────────────
const MYTH_SAVE_KEY = "cgv6_mythologyEngine";

// ── CONSTANTS ─────────────────────────────────────────────────

// How many years before an event can become a legend / myth
const MYTH_LEGEND_AGE   = 100;
const MYTH_MYTH_AGE     = 500;
const MYTH_DIVINE_AGE   = 1000;

// Distortion per century (% chance story changes)
const MYTH_DISTORT_CHANCE_PER_CENTURY = 0.35;

// MythPower thresholds
const MYTH_POWER_LEGEND = 200;
const MYTH_POWER_MYTH   = 600;
const MYTH_POWER_DIVINE = 1500;

// Sacred location types
const MYTH_SACRED_TYPES = [
  { id: 'battlefield',  name: 'Chiến Trường Thiêng',   icon: '⚔️',  faithGain: 20 },
  { id: 'tomb',         name: 'Thánh Mộ',              icon: '🪦',  faithGain: 30 },
  { id: 'ascension',    name: 'Nơi Phi Thăng',         icon: '✨',  faithGain: 40 },
  { id: 'miracle',      name: 'Đất Kỳ Tích',           icon: '🌟',  faithGain: 25 },
  { id: 'revelation',   name: 'Nơi Khải Thị',          icon: '📜',  faithGain: 35 },
];

// Legendary figure ranks
const MYTH_FIGURE_RANKS = [
  { id: 'saint',       name: 'Thánh Nhân',         icon: '👼', minMythPower: 500  },
  { id: 'sage',        name: 'Tiên Hiền',          icon: '☯️', minMythPower: 800  },
  { id: 'immortal',    name: 'Bất Tử',             icon: '🌙', minMythPower: 1200 },
  { id: 'divineEmp',   name: 'Thiên Đế Huyền Thoại', icon: '👑', minMythPower: 2000 },
  { id: 'mythHero',    name: 'Anh Hùng Thần Thoại', icon: '⚔️', minMythPower: 1000 },
  { id: 'worldSavior', name: 'Cứu Thế Chủ',        icon: '🕊️', minMythPower: 3000 },
  { id: 'worldDestroy',name: 'Kẻ Hủy Diệt Thế Giới', icon: '💀', minMythPower: 2500 },
];

// Distortion templates — truth → exaggeration pool
const MYTH_DISTORTIONS = {
  kill: [
    (n) => `${n} giết 9 con rồng cổ đại`,
    (n) => `${n} đơn thương độc mã diệt trừ vạn ma`,
    (n) => `${n} kiếm chỉ khiến thiên địa biến sắc`,
    (n) => `${n} tay không phá vỡ cửu trọng thiên`,
  ],
  found: [
    (n) => `${n} được Thiên Đạo chọn để khai sáng thế giới`,
    (n) => `${n} giáng thế từ thượng giới để lập quốc`,
    (n) => `${n} nhận thiên mệnh từ trước khi vũ trụ hình thành`,
  ],
  war: [
    (n) => `${n} một mình cản bước triệu hùng binh`,
    (n) => `${n} hét lên khiến núi sông rung chuyển`,
    (n) => `${n} dùng ý chí đè bẹp cả đại lục`,
  ],
  ascend: [
    (n) => `${n} hóa thành tinh tú trên trời cao`,
    (n) => `${n} trở thành vị thần canh giữ thiên hạ`,
    (n) => `${n} đã và đang dõi theo thế gian từ thiên giới`,
  ],
  generic: [
    (n) => `${n} được trời đất chứng kiến khi khai thiên`,
    (n) => `${n} vốn là hiện thân của một vị cổ thần`,
    (n) => `${n} sống nghìn tuổi mà vẫn trẻ trung như lúc đầu`,
    (n) => `${n} tay cầm thiên thư, biết trước vạn sự`,
  ],
};

// Prophecy templates
const MYTH_PROPHECY_TEMPLATES = [
  "Khi {sign}, {hero} sẽ {action}.",
  "Vào {time}, kẻ mang {mark} sẽ {action} và {fate}.",
  "Ba đời sau, một người từ {place} sẽ {action} — đó là {hero}.",
  "{sign} xuất hiện, thế gian biến đổi. {hero} trỗi dậy từ tro tàn.",
  "Thiên Đạo phán rằng: khi {sign}, thì {action}.",
  "Sách thiên cổ chép: {hero} mang {mark}, {fate} sẽ đến.",
];

const MYTH_SIGNS = [
  "Huyết Nguyệt thăng thiên", "sao chổi quét qua thiên hà",
  "biển Đông hóa máu", "núi Thái Cổ sụp đổ",
  "mặt trời mọc ở phía Tây", "vạn thú gào thét một lúc",
  "thiên lôi đánh trong đêm thanh", "hoa vô danh nở rộ khắp nơi",
];
const MYTH_MARKS = [
  "ấn Thiên Mệnh", "vết sẹo rồng trên tay trái",
  "mắt màu tím huyền", "sinh dưới ngôi sao dị thường",
  "dòng máu tiên cổ", "vũ khí không ai khác cầm được",
];
const MYTH_ACTIONS = [
  "thống nhất thiên hạ", "tiêu diệt ác ma cổ đại",
  "mở cổng trời", "phong ấn lại vực thẳm",
  "cứu vớt sinh linh toàn thế giới", "hủy diệt và tái tạo vũ trụ",
  "đánh thức cổ thần ngủ yên", "kết thúc Kỷ Nguyên Đen Tối",
];
const MYTH_FATES = [
  "thiên hạ thái bình", "đại kiếp nạn kết thúc",
  "một kỷ nguyên mới bắt đầu", "vạn linh được giải phóng",
  "thế giới được tái sinh", "ác thần bị phong ấn vĩnh viễn",
];
const MYTH_PLACES = [
  "đất hoang phía Bắc", "hải đảo vô danh",
  "ngọn núi cao nhất thế giới", "thôn làng nhỏ bé vô danh",
  "cung điện sụp đổ từ thiên cổ", "rừng cấm địa không ai dám vào",
];
const MYTH_HEROES_PLACEHOLDER = [
  "Người Được Chọn", "Kẻ Vô Danh", "Đứa Con Của Định Mệnh",
  "Hậu Duệ Thiên Đế", "Người Mang Ấn Cổ",
];
const MYTH_TIMES = [
  "năm Giáp Tý thứ 9", "cuối kỷ nguyên thứ ba",
  "khi trăm năm trôi qua", "ngày mùa đông dài nhất",
  "lúc bình minh của thiên niên kỷ mới",
];

// Apocalypse myth types
const MYTH_APOCALYPSES = [
  { id: 'demon_invasion', name: 'Quỷ Đạo Xâm Lăng',      icon: '👹', desc: 'Quỷ vương cổ đại dẫn đại quân phá vỡ thiên môn, tràn xuống thế gian.' },
  { id: 'heaven_collapse', name: 'Thiên Đình Sụp Đổ',     icon: '🌩️', desc: 'Các vị thần phản loạn lẫn nhau, thiên giới vỡ vụn, mảnh trời rơi xuống trần.' },
  { id: 'void_corruption', name: 'Hư Không Ô Nhiễm',      icon: '🌑', desc: 'Hư không giữa các thế giới bị nhiễm độc, nuốt chửng từng mảnh đất.' },
  { id: 'end_times',       name: 'Mạt Thế Đến Gần',       icon: '⏳', desc: 'Thiên Đạo phán rằng thế giới này đã đến hồi chung kết — vạn vật sẽ trở về hư không.' },
  { id: 'ancient_evil',    name: 'Cổ Ác Trỗi Dậy',        icon: '🐉', desc: 'Ác thần bị phong ấn từ khai thiên tỉnh giấc, vũ trụ rung chuyển.' },
];

// ── DEFAULT STATE ─────────────────────────────────────────────
function mythDefaultData() {
  return {
    // Core myth records
    myths: [],           // { id, title, type, npcId, npcName, originYear, currentYear,
                         //   truthText, legendText, mythText, mythPower, distortionLevel,
                         //   stage: 'truth'|'legend'|'myth'|'divine', tags:[] }
    prophecies: [],      // { id, text, sign, fulfilled, fulfillYear, linkedNpcId }
    sacredPlaces: [],    // { id, name, type, location, originEventId, faithAura, pilgrims }
    holyFigures: [],     // { id, npcId, npcName, rank, worshippers, shrines, cultName }
    ancestorShrines: [], // { id, surname, founderName, founderId, blessings:[] }
    cults: [],           // { id, name, holyFigureId, followers, founded, active }
    apocalypseMyths: [], // active apocalypse beliefs
    mythCreatures: [],   // { id, name, type, desc, basedOnBossId }
    stats: {
      totalMyths: 0, totalProphecies: 0, holyFigureCount: 0,
      sacredPlaceCount: 0, mostWorshipped: null, mostFeared: null,
      oldestMythYear: null, largestCult: null,
    },
    meta: { version: 1, lastTick: 0 },
  };
}

window.mythologyData = window.mythologyData || mythDefaultData();

// ── SAVE / LOAD ───────────────────────────────────────────────
function mythSave() {
  try {
    localStorage.setItem(MYTH_SAVE_KEY, JSON.stringify(window.mythologyData));
  } catch(e) { console.warn("mythologyEngine save error:", e); }
}

function mythLoad() {
  try {
    const raw = localStorage.getItem(MYTH_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate-safe: merge with defaults
      window.mythologyData = Object.assign(mythDefaultData(), parsed);
    }
  } catch(e) {
    console.warn("mythologyEngine load error:", e);
    window.mythologyData = mythDefaultData();
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function mythRand(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }
function mythChance(p)     { return Math.random() < p; }
function mythRandInt(a,b)  { return a + Math.floor(Math.random() * (b - a + 1)); }
let _mythIdCounter = 1;
function mythNewId()       { return _mythIdCounter++; }

function mythCurrentYear() { return window.year || 1; }

function mythAddLog(text, type = 'myth') {
  if (typeof addLog === 'function') addLog(text, type);
}

function mythFindNpc(id) {
  if (id == null) return null;
  return (window.npcs || []).find(n => n.id === id)
      || (window.hallOfFame || []).find(n => n.id === id)
      || null;
}

function mythGetHeroLegendData() {
  return window.heroLegendData || null;
}

// Get legend score for an NPC (from heroLegendEngine)
function mythGetLegendScore(npcId) {
  const hld = mythGetHeroLegendData();
  if (!hld || !hld.heroes) return 0;
  const hero = hld.heroes[npcId];
  return hero ? (hero.legendScore || 0) : 0;
}

// ── MYTH POWER CALCULATION ─────────────────────────────────────
function mythCalcPower(event) {
  let power = 0;
  const legendScore = event.npcId ? mythGetLegendScore(event.npcId) : 0;
  power += Math.floor(legendScore * 0.3);

  // Event type bonuses
  const typeBonuses = {
    boss_kill: 300, found_empire: 250, ascend: 400, unify: 350,
    war_win: 150, religion_found: 200, mass_kill: 200,
    sect_found: 100, world_savior: 500, world_destroy: 450,
    artifact_created: 120, dynasty_fall: 180,
  };
  power += (typeBonuses[event.type] || 50);

  // Age bonus — older events become more powerful myths
  const age = mythCurrentYear() - (event.originYear || mythCurrentYear());
  power += Math.floor(age / 10);

  return power;
}

// ── MYTH CREATION FROM WORLD EVENTS ───────────────────────────

// Called by external systems (heroLegendEngine, warEngine, etc.)
// to register a myth-worthy event
function mythRegisterEvent(eventData) {
  /*
    eventData: {
      type: string,       // boss_kill / found_empire / ascend / war_win / etc.
      npcId: number|null,
      npcName: string,
      description: string, // factual truth
      year: number,
      tags: []            // optional: ['sword','war','religion',...]
    }
  */
  const md = window.mythologyData;
  const power = mythCalcPower({ ...eventData, originYear: eventData.year });

  const myth = {
    id: mythNewId(),
    type: eventData.type || 'generic',
    npcId: eventData.npcId || null,
    npcName: eventData.npcName || '???',
    originYear: eventData.year || mythCurrentYear(),
    currentYear: mythCurrentYear(),
    truthText: eventData.description || `${eventData.npcName} đã làm nên kỳ tích.`,
    legendText: null,
    mythText: null,
    mythPower: power,
    distortionLevel: 0,
    stage: 'truth',
    tags: eventData.tags || [],
    title: `Sự Kiện Năm ${eventData.year || mythCurrentYear()}`,
  };

  // Generate first title
  myth.title = mythGenerateTitle(myth);

  md.myths.push(myth);
  md.stats.totalMyths = md.myths.length;

  // Check if this NPC should become a holy figure
  if (power >= MYTH_POWER_LEGEND) {
    mythCheckHolyFigure(eventData.npcId, eventData.npcName, power);
  }

  return myth;
}

function mythGenerateTitle(myth) {
  const n = myth.npcName;
  const typeTitles = {
    boss_kill:     `Truyền Thuyết ${n} Trảm Long`,
    found_empire:  `Huyền Thoại ${n} Lập Đế Quốc`,
    ascend:        `Thần Thoại ${n} Phi Thăng`,
    war_win:       `Thiên Cổ Đại Chiến Của ${n}`,
    religion_found:`Khai Đạo Chi Thuyết — ${n}`,
    mass_kill:     `Đại Sát Kiếp — ${n}`,
    unify:         `${n} Thống Nhất Thiên Hạ`,
    sect_found:    `Khai Phái Thủy Tổ — ${n}`,
  };
  return typeTitles[myth.type] || `Truyền Kỳ Của ${n}`;
}

// ── EVOLUTION: TRUTH → LEGEND → MYTH → DIVINE ─────────────────

function mythEvolve(myth) {
  const age = mythCurrentYear() - myth.originYear;
  const md  = window.mythologyData;

  // Stage upgrades
  if (myth.stage === 'truth' && age >= MYTH_LEGEND_AGE) {
    myth.stage = 'legend';
    myth.legendText = mythDistort(myth, 'legend');
    myth.mythPower += 100;
    mythAddLog(`📜 Sự kiện năm ${myth.originYear} bắt đầu trở thành truyền thuyết: "${myth.title}"`, 'important');
  }
  if (myth.stage === 'legend' && age >= MYTH_MYTH_AGE) {
    myth.stage = 'myth';
    myth.mythText = mythDistort(myth, 'myth');
    myth.mythPower += 300;
    mythAddLog(`🌟 Truyền thuyết năm ${myth.originYear} đã thành thần thoại: "${myth.title}"`, 'important');
    mythTryUnlockSidebar();
  }
  if (myth.stage === 'myth' && age >= MYTH_DIVINE_AGE && myth.mythPower >= MYTH_POWER_DIVINE) {
    myth.stage = 'divine';
    myth.mythPower += 500;
    mythAddLog(`👑 "${myth.title}" đã đạt cảnh giới THẦN THOẠI THIÊNG — người đời tôn thờ như thánh điển!`, 'important');
  }

  // Distortion every century
  const centuriesPassed = Math.floor(age / 100);
  if (centuriesPassed > myth.distortionLevel) {
    myth.distortionLevel = centuriesPassed;
    if (mythChance(MYTH_DISTORT_CHANCE_PER_CENTURY)) {
      myth.mythText = mythDistort(myth, 'distort');
    }
  }
}

function mythDistort(myth, mode) {
  const n = myth.npcName;
  const type = myth.type;

  let pool;
  if (type === 'boss_kill' || type === 'war_win' || type === 'mass_kill') {
    pool = MYTH_DISTORTIONS.kill;
  } else if (type === 'found_empire' || type === 'sect_found' || type === 'unify') {
    pool = MYTH_DISTORTIONS.found;
  } else if (type === 'ascend') {
    pool = MYTH_DISTORTIONS.ascend;
  } else {
    pool = MYTH_DISTORTIONS.generic;
  }

  const base = mythRand(pool)(n);

  if (mode === 'legend') {
    return `Người ta kể rằng ${myth.truthText.toLowerCase()} Về sau, câu chuyện lan rộng: ${base}`;
  }
  if (mode === 'myth') {
    return `Từ ngàn xưa, thần thoại chép: ${base}. Đó là ${n} — người mà Thiên Đạo chọn từ trước khi thế giới được khai sinh.`;
  }
  // distort mode
  return `Thần thoại truyền rằng: ${base}. Không ai biết thực hư, nhưng tất cả đều tin.`;
}

// ── PROPHECY GENERATION ────────────────────────────────────────

function mythGenerateProphecy() {
  const md = window.mythologyData;

  // Don't generate too many
  if (md.prophecies.filter(p => !p.fulfilled).length >= 8) return;

  const template = mythRand(MYTH_PROPHECY_TEMPLATES);
  const text = template
    .replace('{sign}',   mythRand(MYTH_SIGNS))
    .replace('{hero}',   mythRand(MYTH_HEROES_PLACEHOLDER))
    .replace('{mark}',   mythRand(MYTH_MARKS))
    .replace('{action}', mythRand(MYTH_ACTIONS))
    .replace('{fate}',   mythRand(MYTH_FATES))
    .replace('{place}',  mythRand(MYTH_PLACES))
    .replace('{time}',   mythRand(MYTH_TIMES));

  const prophecy = {
    id: mythNewId(),
    text,
    year: mythCurrentYear(),
    fulfilled: false,
    fulfillYear: null,
    linkedNpcId: null,
    source: mythProphecySource(),
  };

  md.prophecies.push(prophecy);
  md.stats.totalProphecies = md.prophecies.length;
  mythAddLog(`🔮 Một lời tiên tri cổ đại xuất hiện: "${text}"`, 'important');
  return prophecy;
}

function mythProphecySource() {
  const sources = [
    'Thiên Thư Huyền Cổ', 'Miệng Bà Tiên Mù',
    'Giấc Mộng Của Tông Chủ', 'Khắc Trên Vách Đá Cổ',
    'Truyền Khẩu Của Dị Tộc Phương Bắc', 'Tiếng Vọng Từ Hư Không',
  ];
  return mythRand(sources);
}

// Try to fulfill prophecy when big events happen
function mythCheckProphecyFulfillment(eventType, npcId, npcName) {
  const md = window.mythologyData;
  const unfulfilled = md.prophecies.filter(p => !p.fulfilled);
  if (!unfulfilled.length) return;

  // 15% chance any big event fulfills a prophecy
  const bigEvents = ['ascend','unify','found_empire','boss_kill','world_savior','world_destroy'];
  if (!bigEvents.includes(eventType)) return;
  if (!mythChance(0.15)) return;

  const prophecy = mythRand(unfulfilled);
  prophecy.fulfilled  = true;
  prophecy.fulfillYear = mythCurrentYear();
  prophecy.linkedNpcId = npcId || null;

  mythAddLog(`✨ Lời tiên tri năm ${prophecy.year} đã THÀNH SỰ THẬT! "${prophecy.text}" — Ứng với ${npcName || 'một kẻ vô danh'}.`, 'important');
}

// ── HOLY FIGURES ───────────────────────────────────────────────

function mythCheckHolyFigure(npcId, npcName, mythPower) {
  if (!npcId && !npcName) return;
  const md = window.mythologyData;

  // Already a holy figure?
  if (md.holyFigures.find(f => f.npcId === npcId || f.npcName === npcName)) return;

  const rank = MYTH_FIGURE_RANKS.slice().reverse().find(r => mythPower >= r.minMythPower);
  if (!rank) return;

  const figure = {
    id: mythNewId(),
    npcId: npcId || null,
    npcName: npcName || '???',
    rank: rank.id,
    rankName: rank.name,
    rankIcon: rank.icon,
    worshippers: mythRandInt(50, 500),
    shrines: mythRandInt(1, 5),
    cultName: `${npcName} Tín Đồ`,
    year: mythCurrentYear(),
  };

  md.holyFigures.push(figure);
  md.stats.holyFigureCount = md.holyFigures.length;

  mythAddLog(`${rank.icon} ${npcName} được tôn vinh là ${rank.name} trong thần thoại thế giới!`, 'important');
  mythTryCreateCult(figure);
}

function mythTryCreateCult(figure) {
  const md = window.mythologyData;
  if (!mythChance(0.5)) return;

  const cult = {
    id: mythNewId(),
    name: `Giáo Phái ${figure.npcName}`,
    holyFigureId: figure.id,
    followers: figure.worshippers,
    founded: mythCurrentYear(),
    active: true,
    doctrine: mythRand([
      `Tu theo đường của ${figure.npcName}, đạt được bất diệt.`,
      `${figure.npcName} sẽ tái lâm và dẫn dắt tín đồ lên thiên giới.`,
      `Đức hạnh của ${figure.npcName} là kim chỉ nam cho mọi tu sĩ.`,
      `Noi gương ${figure.npcName}, diệt ác trừ ma là bổn phận thiêng liêng.`,
    ]),
  };

  md.cults.push(cult);
  mythAddLog(`🕯️ Giáo phái "${cult.name}" được thành lập — ${cult.followers} tín đồ đầu tiên!`, 'important');
}

// ── SACRED PLACES ──────────────────────────────────────────────

function mythCreateSacredPlace(name, placeType, originDesc) {
  const md = window.mythologyData;
  const type = MYTH_SACRED_TYPES.find(t => t.id === placeType) || MYTH_SACRED_TYPES[0];

  const place = {
    id: mythNewId(),
    name: name || `${type.name} Vô Danh`,
    type: type.id,
    typeName: type.name,
    icon: type.icon,
    originDesc: originDesc || 'Một sự kiện huyền bí đã diễn ra tại đây.',
    year: mythCurrentYear(),
    faithAura: mythRandInt(100, 500),
    pilgrimsPerYear: mythRandInt(10, 200),
    totalPilgrims: 0,
  };

  md.sacredPlaces.push(place);
  md.stats.sacredPlaceCount = md.sacredPlaces.length;
  mythAddLog(`${type.icon} Một thánh địa mới xuất hiện: "${place.name}" — ${originDesc || ''}`, 'important');
  return place;
}

// Pilgrimage tick — NPCs "travel" (simulated)
function mythTickPilgrimages() {
  const md = window.mythologyData;
  for (const place of md.sacredPlaces) {
    place.totalPilgrims = (place.totalPilgrims || 0) + mythRandInt(0, place.pilgrimsPerYear);
  }
}

// ── ANCESTOR SHRINES ───────────────────────────────────────────

function mythCheckAncestorShrine(npc) {
  if (!npc || !npc.surname) return;
  const md = window.mythologyData;

  // Only create shrine for founders / high legend score
  const score = mythGetLegendScore(npc.id);
  if (score < 200) return;

  // Already has shrine?
  if (md.ancestorShrines.find(s => s.surname === npc.surname)) return;
  if (!mythChance(0.3)) return;

  const shrine = {
    id: mythNewId(),
    surname: npc.surname,
    founderName: npc.name,
    founderId: npc.id,
    established: mythCurrentYear(),
    blessings: [`+${mythRandInt(5,20)}% danh tiếng cho hậu duệ ${npc.surname}`, `Kế thừa di sản của ${npc.name}`],
  };

  md.ancestorShrines.push(shrine);
  mythAddLog(`🏮 Tộc ${npc.surname} lập miếu thờ tổ tiên cho ${npc.name}!`, 'important');
}

// ── MYTHICAL CREATURES ─────────────────────────────────────────

function mythGenerateCreature() {
  const md = window.mythologyData;
  if (md.mythCreatures.length >= 12) return;

  const creatures = [
    { name: 'Huyết Hỏa Long Cổ Đại', type: 'rồng', desc: 'Rồng khổng lồ sinh ra từ máu của chiến trận đầu tiên trong lịch sử.' },
    { name: 'Phụng Hoàng Cửu Thiên', type: 'phượng', desc: 'Chim phượng bất tử, mỗi ngàn năm tái sinh một lần từ lửa thiên giới.' },
    { name: 'Thế Giới Mãng', type: 'rắn', desc: 'Con rắn khổng lồ cuốn quanh toàn bộ thế giới, giữ đất liền không rơi vào hư không.' },
    { name: 'Thiên Thú Hỗn Độn', type: 'thú', desc: 'Sinh vật xuất hiện trước khi vũ trụ có hình dạng, vẫn lang thang ở vùng biên giới thực tại.' },
    { name: 'Cửu Đầu Linh Quy', type: 'rùa', desc: 'Rùa thần chín đầu, trên lưng nó là nền tảng của cả thế giới.' },
  ];

  const existing = new Set(md.mythCreatures.map(c => c.name));
  const available = creatures.filter(c => !existing.has(c.name));
  if (!available.length) return;

  const creature = { ...mythRand(available), id: mythNewId(), year: mythCurrentYear() };
  md.mythCreatures.push(creature);
  mythAddLog(`🐉 Thần thoại kể về một sinh vật huyền bí: "${creature.name}" — ${creature.desc}`, 'important');
}

// ── APOCALYPSE MYTHS ───────────────────────────────────────────

function mythGenerateApocalypse() {
  const md = window.mythologyData;
  if (md.apocalypseMyths.length >= 3) return;
  if (!mythChance(0.05)) return; // rare

  const existing = new Set(md.apocalypseMyths.map(a => a.id));
  const available = MYTH_APOCALYPSES.filter(a => !existing.has(a.id));
  if (!available.length) return;

  const apoc = { ...mythRand(available), year: mythCurrentYear() };
  md.apocalypseMyths.push(apoc);
  mythAddLog(`${apoc.icon} MẠT THẾ HUYỀN THOẠI xuất hiện: "${apoc.name}" — ${apoc.desc}`, 'important');
}

// ── SIDEBAR UNLOCK ─────────────────────────────────────────────

function mythTryUnlockSidebar() {
  const btn = document.getElementById('btn-mythology');
  if (btn) {
    btn.style.display = '';
    btn.classList.remove('ec-hidden');
  }
}

// ── STATISTICS ─────────────────────────────────────────────────

function mythUpdateStats() {
  const md = window.mythologyData;
  const s  = md.stats;

  s.totalMyths      = md.myths.length;
  s.totalProphecies = md.prophecies.length;
  s.holyFigureCount = md.holyFigures.length;
  s.sacredPlaceCount = md.sacredPlaces.length;

  // Most worshipped
  if (md.holyFigures.length) {
    const top = md.holyFigures.slice().sort((a,b) => b.worshippers - a.worshippers)[0];
    s.mostWorshipped = top.npcName;
  }

  // Most feared (world destroyer / demon king figures)
  const villains = md.holyFigures.filter(f => f.rank === 'worldDestroy');
  if (villains.length) s.mostFeared = villains[0].npcName;

  // Oldest myth
  if (md.myths.length) {
    const oldest = md.myths.slice().sort((a,b) => a.originYear - b.originYear)[0];
    s.oldestMythYear = oldest.originYear;
  }

  // Largest cult
  if (md.cults.length) {
    const largest = md.cults.slice().sort((a,b) => b.followers - a.followers)[0];
    s.largestCult = largest.name;
  }
}

// ── MAIN TICK ─────────────────────────────────────────────────

function mythologyEngine_tick() {
  const md  = window.mythologyData;
  const yr  = mythCurrentYear();

  // Throttle: run every 5 simulated years
  if (md.meta.lastTick && (yr - md.meta.lastTick) < 5) return;
  md.meta.lastTick = yr;

  // Evolve existing myths
  for (const myth of md.myths) {
    mythEvolve(myth);
  }

  // Pilgrimages
  mythTickPilgrimages();

  // Grow cult followers
  for (const cult of md.cults) {
    if (cult.active) cult.followers += mythRandInt(0, 20);
  }

  // Grow holy figure worshippers
  for (const fig of md.holyFigures) {
    fig.worshippers += mythRandInt(0, 15);
    fig.shrines = Math.min(fig.shrines + (mythChance(0.05) ? 1 : 0), 99);
  }

  // Rare events
  if (mythChance(0.02)) mythGenerateProphecy();
  if (mythChance(0.015)) mythGenerateCreature();
  if (yr > 500) mythGenerateApocalypse();

  // Auto-generate myths from heroLegendData
  mythAutoAbsorbHeroLegends();

  // Update stats
  mythUpdateStats();

  // Save periodically
  if (yr % 20 === 0) mythSave();
}

// Absorb top heroes from heroLegendEngine into myths
function mythAutoAbsorbHeroLegends() {
  const hld = mythGetHeroLegendData();
  if (!hld || !hld.heroes) return;
  const md  = window.mythologyData;

  const top = Object.values(hld.heroes)
    .filter(h => h.legendScore >= 500)
    .sort((a,b) => b.legendScore - a.legendScore)
    .slice(0, 5);

  for (const hero of top) {
    // Already has a myth?
    if (md.myths.find(m => m.npcId === hero.id)) continue;

    // Register a myth
    mythRegisterEvent({
      type: 'legend_hero',
      npcId: hero.id,
      npcName: hero.name,
      description: `${hero.name} đã lập nên những kỳ tích vang danh thiên hạ với điểm truyền kỳ ${hero.legendScore}.`,
      year: mythCurrentYear() - mythRandInt(50, 300),
      tags: ['hero'],
    });
  }

  // Also absorb legends (dead heroes)
  for (const legend of (hld.legends || []).slice(0, 3)) {
    if (md.myths.find(m => m.npcId === legend.id || m.npcName === legend.name)) continue;
    mythRegisterEvent({
      type: 'legend_hero',
      npcId: legend.id,
      npcName: legend.name,
      description: `${legend.name} — huyền thoại đã khuất, để lại danh tiếng ngàn đời.`,
      year: mythCurrentYear() - mythRandInt(100, 500),
      tags: ['legend', 'dead'],
    });
  }
}

// Hook into hleOnWorldEvent for direct integration
const _origHleOnWorldEvent = window.hleOnWorldEvent;
window.hleOnWorldEvent = function(eventType, description, extra) {
  if (_origHleOnWorldEvent) _origHleOnWorldEvent(eventType, description, extra);

  // Register in mythology engine
  const bigTypes = ['boss_kill','found_empire','ascend','unify','war_win','mass_kill','religion','worldlord'];
  if (bigTypes.includes(eventType) && extra && extra.npc) {
    const npc = extra.npc;
    mythRegisterEvent({
      type: eventType,
      npcId: npc.id,
      npcName: npc.name,
      description,
      year: mythCurrentYear(),
      tags: [eventType],
    });
    mythCheckProphecyFulfillment(eventType, npc.id, npc.name);
    mythCheckAncestorShrine(npc);

    // Sacred place for battlefield / ascension
    if (eventType === 'ascend') {
      mythCreateSacredPlace(`Nơi Phi Thăng Của ${npc.name}`, 'ascension', description);
    }
    if (eventType === 'boss_kill') {
      mythCreateSacredPlace(`Chiến Trường ${npc.name} Trảm Long`, 'battlefield', description);
    }
  }
};

// Hook into NPC death for sacred tomb creation
const _origHleHandleDeath = window.hleHandleDeath;
window.hleHandleDeath = function(npc, reason) {
  if (_origHleHandleDeath) _origHleHandleDeath(npc, reason);
  if (!npc) return;
  const score = mythGetLegendScore(npc.id);
  if (score >= 500 && mythChance(0.4)) {
    mythCreateSacredPlace(
      `Thánh Mộ ${npc.name}`,
      'tomb',
      `${npc.name} — huyền thoại đã yên nghỉ tại đây. ${reason || ''}`
    );
  }
};

// ── UI PANEL ──────────────────────────────────────────────────

function mythologyEngine_renderPanel() {
  const panel = document.getElementById('panel-mythology');
  if (!panel) return;
  const md = window.mythologyData;
  mythUpdateStats();

  panel.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">📖 Thần Thoại Thế Giới</h2>
      <p class="panel-subtitle">Lịch sử trở thành huyền thoại — huyền thoại trở thành thần thoại</p>
    </div>
    <div class="myth-tabs">
      <button class="myth-tab active" onclick="mythSwitchTab('myths')">📜 Thần Thoại (${md.myths.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('prophecies')">🔮 Tiên Tri (${md.prophecies.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('holy')">👼 Thánh Nhân (${md.holyFigures.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('sacred')">🏛 Thánh Địa (${md.sacredPlaces.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('cults')">🕯 Giáo Phái (${md.cults.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('creatures')">🐉 Thần Thú (${md.mythCreatures.length})</button>
      <button class="myth-tab" onclick="mythSwitchTab('stats')">📊 Thống Kê</button>
    </div>
    <div id="myth-tab-content"></div>
  `;

  mythRenderTab('myths');
}

function mythSwitchTab(name) {
  document.querySelectorAll('.myth-tab').forEach(b => b.classList.remove('active'));
  const tabs = document.querySelectorAll('.myth-tab');
  const names = ['myths','prophecies','holy','sacred','cults','creatures','stats'];
  const idx = names.indexOf(name);
  if (tabs[idx]) tabs[idx].classList.add('active');
  mythRenderTab(name);
}

function mythRenderTab(name) {
  const cont = document.getElementById('myth-tab-content');
  if (!cont) return;
  const md = window.mythologyData;

  if (name === 'myths') {
    if (!md.myths.length) { cont.innerHTML = `<div class="myth-empty">Chưa có thần thoại nào. Thế giới cần thêm thời gian...</div>`; return; }
    cont.innerHTML = md.myths.slice().sort((a,b)=>b.mythPower-a.mythPower).map(m => {
      const stageColor = { truth:'#94a3b8', legend:'#60a5fa', myth:'#c084fc', divine:'#facc15' }[m.stage] || '#94a3b8';
      const stageIcon  = { truth:'📄', legend:'📜', myth:'🌟', divine:'👑' }[m.stage] || '📄';
      const age = mythCurrentYear() - m.originYear;
      return `
        <div class="myth-card" style="border-left:3px solid ${stageColor}">
          <div class="myth-card-header">
            <span class="myth-stage" style="color:${stageColor}">${stageIcon} ${m.stage.toUpperCase()}</span>
            <span class="myth-power">⚡ ${m.mythPower}</span>
          </div>
          <div class="myth-title">${m.title}</div>
          <div class="myth-meta">Năm ${m.originYear} · ${age} năm trước · ${m.npcName}</div>
          <div class="myth-truth"><b>Sự thật:</b> ${m.truthText}</div>
          ${m.legendText ? `<div class="myth-legend"><b>Truyền thuyết:</b> ${m.legendText}</div>` : ''}
          ${m.mythText   ? `<div class="myth-myth"><b>Thần thoại:</b> ${m.mythText}</div>`   : ''}
          ${m.distortionLevel > 0 ? `<div class="myth-distort">Biến dạng lần ${m.distortionLevel}</div>` : ''}
        </div>`;
    }).join('');
  }

  else if (name === 'prophecies') {
    if (!md.prophecies.length) { cont.innerHTML = `<div class="myth-empty">Chưa có tiên tri nào.</div>`; return; }
    cont.innerHTML = md.prophecies.map(p => `
      <div class="myth-card ${p.fulfilled ? 'myth-fulfilled' : ''}">
        <div class="myth-title">🔮 ${p.fulfilled ? '✅ [ĐÃ THÀNH SỰ THẬT]' : '[CHƯA ỨNG NGHIỆM]'}</div>
        <div class="myth-prophecy-text">"${p.text}"</div>
        <div class="myth-meta">Nguồn: ${p.source} · Năm ${p.year}</div>
        ${p.fulfilled ? `<div class="myth-fulfill-info">✨ Ứng nghiệm năm ${p.fulfillYear}</div>` : ''}
      </div>`).join('');
  }

  else if (name === 'holy') {
    if (!md.holyFigures.length) { cont.innerHTML = `<div class="myth-empty">Chưa có thánh nhân nào.</div>`; return; }
    cont.innerHTML = md.holyFigures.map(f => `
      <div class="myth-card">
        <div class="myth-card-header">
          <span class="myth-rank">${f.rankIcon} ${f.rankName}</span>
          <span class="myth-worshippers">👥 ${f.worshippers.toLocaleString()}</span>
        </div>
        <div class="myth-title">${f.npcName}</div>
        <div class="myth-meta">Tôn vinh năm ${f.year} · ${f.shrines} miếu thờ</div>
        <div class="myth-cult">Tín đồ: ${f.cultName}</div>
      </div>`).join('');
  }

  else if (name === 'sacred') {
    if (!md.sacredPlaces.length) { cont.innerHTML = `<div class="myth-empty">Chưa có thánh địa nào.</div>`; return; }
    cont.innerHTML = md.sacredPlaces.map(p => `
      <div class="myth-card">
        <div class="myth-card-header">
          <span>${p.icon} ${p.typeName}</span>
          <span class="myth-pilgrims">🚶 ${p.totalPilgrims.toLocaleString()} hành hương</span>
        </div>
        <div class="myth-title">${p.name}</div>
        <div class="myth-meta">Xuất hiện năm ${p.year} · Linh khí: ${p.faithAura}</div>
        <div class="myth-origin">${p.originDesc}</div>
      </div>`).join('');
  }

  else if (name === 'cults') {
    if (!md.cults.length) { cont.innerHTML = `<div class="myth-empty">Chưa có giáo phái nào.</div>`; return; }
    cont.innerHTML = md.cults.map(c => `
      <div class="myth-card">
        <div class="myth-card-header">
          <span>🕯 ${c.active ? 'Hoạt động' : 'Tan rã'}</span>
          <span>👥 ${c.followers.toLocaleString()} tín đồ</span>
        </div>
        <div class="myth-title">${c.name}</div>
        <div class="myth-meta">Thành lập năm ${c.founded}</div>
        <div class="myth-doctrine">"${c.doctrine}"</div>
      </div>`).join('');
  }

  else if (name === 'creatures') {
    if (!md.mythCreatures.length) { cont.innerHTML = `<div class="myth-empty">Chưa có thần thú nào.</div>`; return; }
    // Show apocalypse myths too
    const apocHtml = md.apocalypseMyths.map(a => `
      <div class="myth-card" style="border-left:3px solid #f87171">
        <div class="myth-title">${a.icon} ${a.name}</div>
        <div class="myth-origin">${a.desc}</div>
        <div class="myth-meta">Xuất hiện năm ${a.year}</div>
      </div>`).join('');
    const creatureHtml = md.mythCreatures.map(c => `
      <div class="myth-card">
        <div class="myth-title">🐉 ${c.name}</div>
        <div class="myth-origin">${c.desc}</div>
        <div class="myth-meta">Xuất hiện năm ${c.year} · Loại: ${c.type}</div>
      </div>`).join('');
    cont.innerHTML = (apocHtml || '') + creatureHtml;
  }

  else if (name === 'stats') {
    const s = md.stats;
    cont.innerHTML = `
      <div class="myth-stats-grid">
        <div class="myth-stat-card"><div class="myth-stat-val">${s.totalMyths}</div><div class="myth-stat-label">Tổng Thần Thoại</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.totalProphecies}</div><div class="myth-stat-label">Tiên Tri</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.holyFigureCount}</div><div class="myth-stat-label">Thánh Nhân</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.sacredPlaceCount}</div><div class="myth-stat-label">Thánh Địa</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.mostWorshipped || '—'}</div><div class="myth-stat-label">Được Thờ Nhất</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.mostFeared || '—'}</div><div class="myth-stat-label">Đáng Sợ Nhất</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.oldestMythYear != null ? `Năm ${s.oldestMythYear}` : '—'}</div><div class="myth-stat-label">Thần Thoại Cổ Nhất</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${s.largestCult || '—'}</div><div class="myth-stat-label">Giáo Phái Lớn Nhất</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${md.prophecies.filter(p=>p.fulfilled).length}</div><div class="myth-stat-label">Tiên Tri Đã Ứng</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${md.mythCreatures.length}</div><div class="myth-stat-label">Thần Thú</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${md.apocalypseMyths.length}</div><div class="myth-stat-label">Mạt Thế Truyền Thuyết</div></div>
        <div class="myth-stat-card"><div class="myth-stat-val">${md.ancestorShrines.length}</div><div class="myth-stat-label">Miếu Tổ Tiên</div></div>
      </div>`;
  }
}

// ── CSS INJECTION ─────────────────────────────────────────────

(function mythInjectCSS() {
  if (document.getElementById('myth-styles')) return;
  const style = document.createElement('style');
  style.id = 'myth-styles';
  style.textContent = `
    .myth-tabs { display:flex; flex-wrap:wrap; gap:4px; padding:12px 0 8px; }
    .myth-tab  { background:var(--bg-card); border:1px solid var(--border); color:var(--white-dim);
                 padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; transition:.2s; }
    .myth-tab.active, .myth-tab:hover { border-color:var(--gold); color:var(--gold); }

    .myth-card { background:var(--bg-card); border:1px solid var(--border); border-radius:8px;
                 padding:12px 14px; margin-bottom:10px; transition:.2s; }
    .myth-card:hover { border-color:var(--border-hover); }
    .myth-card-header { display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px; }
    .myth-title  { font-size:15px; font-weight:600; color:var(--gold); margin-bottom:4px; }
    .myth-meta   { font-size:11px; color:var(--white-dim); margin-bottom:6px; }
    .myth-truth  { font-size:12px; color:var(--white-main); margin-bottom:4px; }
    .myth-legend { font-size:12px; color:var(--blue); margin-bottom:4px; }
    .myth-myth   { font-size:12px; color:var(--purple); margin-bottom:4px; font-style:italic; }
    .myth-distort{ font-size:10px; color:var(--orange); }
    .myth-stage  { font-size:11px; font-weight:700; letter-spacing:.05em; }
    .myth-power  { font-size:11px; color:var(--gold-dim); }
    .myth-fulfilled { border-color:var(--jade) !important; }
    .myth-fulfill-info { font-size:11px; color:var(--jade); margin-top:4px; }
    .myth-prophecy-text { font-size:13px; color:var(--purple); font-style:italic; margin:6px 0; }
    .myth-rank   { font-size:12px; color:var(--gold); }
    .myth-worshippers { font-size:11px; color:var(--white-dim); }
    .myth-cult   { font-size:11px; color:var(--jade-dim); margin-top:4px; }
    .myth-pilgrims { font-size:11px; color:var(--white-dim); }
    .myth-origin { font-size:12px; color:var(--white-main); margin-top:4px; }
    .myth-doctrine { font-size:11px; color:var(--blue); font-style:italic; margin-top:4px; }
    .myth-empty  { text-align:center; color:var(--white-dim); padding:40px; font-style:italic; }

    .myth-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; padding:4px 0; }
    .myth-stat-card  { background:var(--bg-card); border:1px solid var(--border); border-radius:8px;
                       padding:14px; text-align:center; }
    .myth-stat-val   { font-size:20px; font-weight:700; color:var(--gold); margin-bottom:4px; }
    .myth-stat-label { font-size:11px; color:var(--white-dim); }
  `;
  document.head.appendChild(style);
})();

// ── INITIALIZATION ────────────────────────────────────────────

function mythologyEngine_init() {
  mythLoad();

  // Hook into main simulation tick if available
  const _origTick = window.simulationTick;
  if (typeof _origTick === 'function') {
    window.simulationTick = function(...args) {
      _origTick(...args);
      mythologyEngine_tick();
    };
  }

  // Also expose on window for manual calls from app tick loop
  window.mythologyEngine_tick = mythologyEngine_tick;

  // Auto-unlock sidebar if we already have myths
  if (window.mythologyData.myths.length > 0) {
    // Try on next frame (DOM may not be ready)
    setTimeout(mythTryUnlockSidebar, 500);
  }

  console.log('[MythologyEngine V1] Initialized. Myths:', window.mythologyData.myths.length);
}

// Export public API
window.mythologyEngine_init          = mythologyEngine_init;
window.mythologyEngine_tick          = mythologyEngine_tick;
window.mythologyEngine_renderPanel   = mythologyEngine_renderPanel;
window.mythRegisterEvent             = mythRegisterEvent;
window.mythCreateSacredPlace         = mythCreateSacredPlace;
window.mythCheckProphecyFulfillment  = mythCheckProphecyFulfillment;
window.mythCheckHolyFigure           = mythCheckHolyFigure;
window.mythSwitchTab                 = mythSwitchTab;
window.mythSave                      = mythSave;
window.mythLoad                      = mythLoad;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mythologyEngine_init);
} else {
  mythologyEngine_init();
}
