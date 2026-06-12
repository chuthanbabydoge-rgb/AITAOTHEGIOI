'use strict';
/* ============================================================
   CONTINENT ENGINE V1 — Creator God V6
   Đại Lục Hệ Thống — 6 Đại Lục · Bá Quyền · Kỳ Quan · Sự Kiện

   Sits ABOVE the region/territory layer.
   Each continent wraps multiple regions & countries.
   ============================================================ */

// ─── CONTINENT DEFINITIONS ────────────────────────────────────

const CONTINENT_DEFS = [
  {
    id: 'tianshan',
    name: 'Thiên Sơn Đại Lục',
    icon: '🗻',
    color: '#a78bfa',
    bg: '#1e1b4b',
    climate: 'Sơn Nhạc · Khắc Nghiệt',
    desc: 'Núi non trùng điệp, linh khí cực kỳ dày đặc — thiên đường của tu sĩ nhưng địa ngục của kẻ yếu.',
    regionKeywords: ['bắc', 'sơn', 'đỉnh', 'đông vực', 'bắc châu', 'đông'],
    bonuses: { cultivationMult: 1.5, warMult: 1.2, econMult: 0.8, cultureMult: 1.0, birthMult: 0.9 },
    resourceProfile: { spiritStones: 120, ironOre: 60, herbs: 80, artifacts: 40 },
    wonder: { id: 'thienlongthanh', name: 'Thiên Long Bảo Tháp', icon: '🏯', built: false, cost: { spiritStones: 80, ironOre: 40 }, bonus: { cultivationMult: 0.3 }, desc: 'Tháp chín tầng xuyên mây — tu sĩ luyện công tại đây đột phá nhanh gấp đôi.' },
    events: ['avalanche_purge', 'spirit_peak_open', 'dragon_vein_pulse'],
  },
  {
    id: 'namminh',
    name: 'Nam Minh Hải Châu',
    icon: '🌊',
    color: '#38bdf8',
    bg: '#0c4a6e',
    climate: 'Hải Dương · Ôn Hòa',
    desc: 'Chuỗi đảo và vịnh hải vô tận — thương nhân giàu có, hải tặc hùng mạnh, bí kíp chìm đáy biển.',
    regionKeywords: ['nam', 'hải', 'đảo', 'vịnh', 'nam hải', 'đông hải', 'biển'],
    bonuses: { cultivationMult: 1.0, warMult: 0.9, econMult: 1.6, cultureMult: 1.2, birthMult: 1.1 },
    resourceProfile: { spiritStones: 60, ironOre: 30, herbs: 100, artifacts: 80 },
    wonder: { id: 'haithanthi', name: 'Hải Thần Cự Tượng', icon: '🗽', built: false, cost: { spiritStones: 60, herbs: 60 }, bonus: { econMult: 0.5 }, desc: 'Pho tượng thần biển khổng lồ — thương thuyền từ khắp thiên hạ tự nhiên hội tụ về đây.' },
    events: ['tsunami_trial', 'sea_gate_open', 'pirates_coalition'],
  },
  {
    id: 'huanbac',
    name: 'Huyền Bắc Tuyết Nguyên',
    icon: '❄️',
    color: '#67e8f9',
    bg: '#083344',
    climate: 'Băng Tuyết · Hắc Ám',
    desc: 'Đồng bằng tuyết trắng bạt ngàn — nơi ẩn náu của tà phái và những bí thuật hắc ám xa xưa.',
    regionKeywords: ['bắc nguyên', 'băng', 'tuyết', 'hắc', 'bắc cực', 'huyền'],
    bonuses: { cultivationMult: 1.1, warMult: 1.4, econMult: 0.7, cultureMult: 0.8, birthMult: 0.7 },
    resourceProfile: { spiritStones: 80, ironOre: 100, herbs: 40, artifacts: 60 },
    wonder: { id: 'bangcung', name: 'Băng Cung Vĩnh Cửu', icon: '🏔️', built: false, cost: { ironOre: 80, spiritStones: 50 }, bonus: { warMult: 0.4 }, desc: 'Cung điện băng thiên cổ — chiến binh luyện tại đây, khí phách lạnh như băng không gì phá được.' },
    events: ['blizzard_siege', 'dark_art_revival', 'frozen_ancient_wake'],
  },
  {
    id: 'viemdia',
    name: 'Viêm Địa Hoang Nguyên',
    icon: '🔥',
    color: '#fb923c',
    bg: '#431407',
    climate: 'Hỏa Diệm · Cuồng Bạo',
    desc: 'Núi lửa phun trào bất tận — khoáng thạch quý hiếm vô số, nhưng chỉ kẻ mạnh mới sống sót.',
    regionKeywords: ['tây', 'hoang', 'lửa', 'hỏa', 'tây hoang', 'viêm', 'sa mạc'],
    bonuses: { cultivationMult: 0.9, warMult: 1.7, econMult: 1.1, cultureMult: 0.7, birthMult: 1.0 },
    resourceProfile: { spiritStones: 50, ironOre: 150, herbs: 30, artifacts: 50 },
    wonder: { id: 'hoathanluren', name: 'Hỏa Thần Lò Luyện', icon: '⚒️', built: false, cost: { ironOre: 100, spiritStones: 40 }, bonus: { warMult: 0.4 }, desc: 'Lò luyện thần binh đặt ngay miệng núi lửa — mỗi vũ khí đúc ra mang thần lửa trời bên trong.' },
    events: ['volcanic_eruption_chain', 'forge_god_descent', 'iron_rush'],
  },
  {
    id: 'trungchau',
    name: 'Trung Châu Thịnh Thế',
    icon: '🌿',
    color: '#4ade80',
    bg: '#052e16',
    climate: 'Ôn Đới · Phồn Thịnh',
    desc: 'Trung tâm thiên hạ — văn minh phát triển nhất, thương mại tấp nập, chính trị phức tạp nhất.',
    regionKeywords: ['trung', 'châu', 'trung châu', 'bình', 'nguyên', 'trung châu'],
    bonuses: { cultivationMult: 1.1, warMult: 0.9, econMult: 1.3, cultureMult: 1.8, birthMult: 1.3 },
    resourceProfile: { spiritStones: 90, ironOre: 70, herbs: 90, artifacts: 70 },
    wonder: { id: 'hocung', name: 'Thiên Hạ Học Cung', icon: '🏫', built: false, cost: { herbs: 70, artifacts: 50 }, bonus: { cultureMult: 0.6 }, desc: 'Học viện đỉnh cao thiên hạ — học giả từ mọi nơi hội tụ, kiến thức và văn hóa lan tràn không ngừng.' },
    events: ['grand_congress', 'silk_road_boom', 'cultural_revolution'],
  },
  {
    id: 'huvobidi',
    name: 'Hư Vô Bí Địa',
    icon: '🌌',
    color: '#e879f9',
    bg: '#2d1b69',
    climate: 'Hư Không · Huyền Bí',
    desc: 'Không gian méo mó, thời gian hỗn loạn — nơi sinh ra của những pháp thuật cổ đại nhất còn tồn tại.',
    regionKeywords: ['hư', 'vô', 'bí', 'cổ thần', 'huyền', 'không'],
    bonuses: { cultivationMult: 1.3, warMult: 1.0, econMult: 0.9, cultureMult: 1.4, birthMult: 0.8 },
    resourceProfile: { spiritStones: 100, ironOre: 40, herbs: 70, artifacts: 120 },
    wonder: { id: 'cothantoa', name: 'Cổ Thần Toà', icon: '🗿', built: false, cost: { artifacts: 100, spiritStones: 60 }, bonus: { cultivationMult: 0.1, warMult: 0.1, econMult: 0.1, cultureMult: 0.1 }, desc: 'Ngai toà của thần linh thượng cổ — ai an toạ tại đây, được thiên hạ đại đạo đồng thuận.' },
    events: ['void_rift', 'ancient_god_echo', 'time_anomaly'],
  },
];

// ─── CONTINENTAL EVENTS ───────────────────────────────────────

const CONTINENT_EVENTS = {
  // 🗻 THIÊN SƠN
  avalanche_purge:    { icon:'🏔️', name:'Tuyết Sơn Đại Sập',    cat:'tianshan',  desc:'Núi lửa tuyết đổ xuống — các tông môn ven núi bị xóa sổ, nhưng bí bảo bị lộ ra.',   duration:15, effects:{ warMult:1.3, cultivationMult:0.7 }, onStart(cid){ ceLog(cid, `🏔️ Tuyết Sơn Đại Sập — Linh Khí Thiên Sơn Rối Loạn!`); } },
  spirit_peak_open:   { icon:'⛰️', name:'Linh Phong Khai Sơn',   cat:'tianshan',  desc:'Đỉnh linh phong bí ẩn mở ra — một pháp môn thất truyền xuất hiện trên đỉnh núi.',   duration:20, effects:{ cultivationMult:1.8 },                onStart(cid){ ceLog(cid, `⛰️ Linh Phong Khai Sơn — Pháp Môn Thất Truyền Xuất Hiện!`); } },
  dragon_vein_pulse:  { icon:'🐉', name:'Long Mạch Xung Động',   cat:'tianshan',  desc:'Long mạch thiên sơn rung chuyển — toàn bộ tu sĩ trong đại lục cảm nhận được.',      duration:25, effects:{ cultivationMult:1.5, econMult:1.2 },   onStart(cid){ ceLog(cid, `🐉 Long Mạch Thiên Sơn Xung Động — Tu Sĩ Đồng Loạt Đốn Ngộ!`); } },
  // 🌊 NAM MINH
  tsunami_trial:      { icon:'🌊', name:'Hải Khẩu Thần Phán',   cat:'namminh',   desc:'Sóng thần thần thánh — chỉ thuyền của người có đức hạnh mới không bị nhấn chìm.',   duration:10, effects:{ econMult:0.6, warMult:0.8 },           onStart(cid){ ceLog(cid, `🌊 Hải Khẩu Thần Phán — Biển Nổi Cơn Thịnh Nộ!`); } },
  sea_gate_open:      { icon:'🌀', name:'Hải Môn Khai Mở',      cat:'namminh',   desc:'Cổng biển huyền bí mở ra — tàu thuyền tới được vùng đất chứa đầy bảo vật cổ đại.',  duration:30, effects:{ econMult:1.8, artifactMult:1.5 },      onStart(cid){ ceLog(cid, `🌀 Hải Môn Khai Mở — Thương Nhân Khắp Nơi Đổ Xô!`); } },
  pirates_coalition:  { icon:'🏴', name:'Hải Tặc Đại Liên Minh',cat:'namminh',   desc:'Các băng hải tặc hợp nhất — hải lộ bị phong tỏa, thương mại sụp đổ tạm thời.',   duration:20, effects:{ econMult:0.5, warMult:1.6 },           onStart(cid){ ceLog(cid, `🏴 Hải Tặc Đại Liên Minh — Hải Lộ Bị Phong Tỏa!`); } },
  // ❄️ HUYỀN BẮC
  blizzard_siege:     { icon:'🌨️', name:'Tuyết Bạo Bao Vây',    cat:'huanbac',   desc:'Bão tuyết cực đại bao vây đại lục — mọi giao thương bị cắt đứt, chiến tranh tạm nghỉ.',duration:25, effects:{ warMult:0.4, econMult:0.5 },         onStart(cid){ ceLog(cid, `🌨️ Tuyết Bạo Bao Vây — Huyền Bắc Bị Cô Lập!`); } },
  dark_art_revival:   { icon:'🌑', name:'Hắc Nghệ Phục Hưng',   cat:'huanbac',   desc:'Tà phái cổ đại trỗi dậy — hắc nghệ lan tràn, tu sĩ tà đạo hưng thịnh.',            duration:30, effects:{ warMult:1.5, cultivationMult:1.2 },    onStart(cid){ ceLog(cid, `🌑 Hắc Nghệ Phục Hưng — Tà Phái Thiên Hạ Trỗi Dậy!`); } },
  frozen_ancient_wake:{ icon:'🧊', name:'Băng Cổ Thần Thức Tỉnh',cat:'huanbac',  desc:'Một thực thể cổ đại bị phong ấn trong băng tỉnh giấc — nguy cơ cực độ, phần thưởng khổng lồ.',duration:20, effects:{ warMult:2.0, cultivationMult:0.8 },onStart(cid){ ceLog(cid, `🧊 Băng Cổ Thần Thức Tỉnh — Hiểm Nguy Đại Lục!`); } },
  // 🔥 VIÊM ĐỊA
  volcanic_eruption_chain:{ icon:'🌋', name:'Liên Hoàn Núi Lửa', cat:'viemdia', desc:'Hàng chục núi lửa đồng loạt phun trào — tài nguyên dồi dào nhưng chiến tranh bùng nổ.',duration:20, effects:{ warMult:1.8, econMult:1.3 },      onStart(cid){ ceLog(cid, `🌋 Liên Hoàn Núi Lửa — Viêm Địa Rực Lửa!`); } },
  forge_god_descent:  { icon:'⚒️', name:'Lò Thần Giáng Thế',    cat:'viemdia',   desc:'Thần rèn giáng xuống — mọi vũ khí được rèn trong kỳ này đều có phẩm chất vượt trội.',duration:25, effects:{ warMult:1.4, econMult:1.2 },          onStart(cid){ ceLog(cid, `⚒️ Lò Thần Giáng Thế — Thần Binh Ra Lò Không Ngừng!`); } },
  iron_rush:          { icon:'⛏️', name:'Quặng Sắt Đại Phát',   cat:'viemdia',   desc:'Mỏ quặng khổng lồ được phát hiện — các thế lực đổ xô khai thác, kinh tế bùng nổ.',  duration:35, effects:{ econMult:1.7, warMult:1.2 },           onStart(cid){ ceLog(cid, `⛏️ Quặng Sắt Đại Phát — Viêm Địa Mỏ Vàng Lộ Ra!`); } },
  // 🌿 TRUNG CHÂU
  grand_congress:     { icon:'🏛️', name:'Thiên Hạ Đại Nghị Hội',cat:'trungchau', desc:'Tất cả các thế lực lớn ngồi họp — quyết định vận mệnh thiên hạ trong nhiều thập kỷ.',duration:30, effects:{ warMult:0.2, cultureMult:1.8, econMult:1.4 },onStart(cid){ ceLog(cid, `🏛️ Thiên Hạ Đại Nghị Hội Khai Mạc — Vạn Quốc Hội Tụ!`); } },
  silk_road_boom:     { icon:'🛤️', name:'Tơ Lụa Chi Đạo Hưng Thịnh',cat:'trungchau',desc:'Con đường thương mại mới hình thành — hàng hóa, văn hóa, và ý tưởng lan tràn.',duration:40, effects:{ econMult:1.9, cultureMult:1.4 },      onStart(cid){ ceLog(cid, `🛤️ Tơ Lụa Chi Đạo — Thương Mại Bùng Nổ Toàn Thiên Hạ!`); } },
  cultural_revolution:{ icon:'🌺', name:'Văn Hóa Đại Cách Mạng', cat:'trungchau', desc:'Tư tưởng mới trỗi dậy — cũ thay mới, văn hóa xã hội thay đổi hoàn toàn.',           duration:35, effects:{ cultureMult:2.2, warMult:0.7 },        onStart(cid){ ceLog(cid, `🌺 Văn Hóa Đại Cách Mạng — Trung Châu Thay Đổi Căn Bản!`); } },
  // 🌌 HƯ VÔ BÍ ĐỊA
  void_rift:          { icon:'🌀', name:'Hư Không Rạn Nứt',      cat:'huvobidi',  desc:'Không gian xung quanh đại lục rạn nứt — sinh vật từ hư không tràn vào.',              duration:20, effects:{ warMult:2.0, cultivationMult:1.3 },    onStart(cid){ ceLog(cid, `🌀 Hư Không Rạn Nứt — Sinh Vật Bí Địa Tràn Ra!`); } },
  ancient_god_echo:   { icon:'🗿', name:'Cổ Thần Vang Vọng',     cat:'huvobidi',  desc:'Tiếng vang của thần linh thượng cổ lan khắp đại lục — đại ngộ xảy ra liên tiếp.',   duration:30, effects:{ cultivationMult:1.7, cultureMult:1.5 },  onStart(cid){ ceLog(cid, `🗿 Cổ Thần Vang Vọng — Vạn Tu Sĩ Đốn Ngộ Đồng Loạt!`); } },
  time_anomaly:       { icon:'⏳', name:'Thời Gian Dị Thường',   cat:'huvobidi',  desc:'Thời gian trong đại lục chảy khác — một ngày bên trong bằng mười ngày bên ngoài.',  duration:15, effects:{ cultivationMult:2.5, birthMult:0.5 },    onStart(cid){ ceLog(cid, `⏳ Thời Gian Dị Thường — Hư Vô Bí Địa Ngoài Vòng Thời Gian!`); } },
};

// ─── STATE ────────────────────────────────────────────────────

let ceState = {
  continents:      [],      // cloned + extended from CONTINENT_DEFS
  wars:            [],      // continental wars { id, attacker, defender, tick, phase, outcome }
  globalLog:       [],      // continental history log
  tickCount:       0,
  lastAutoTick:    0,
  autoInterval:    12,
  initialized:     false,
};

// ─── INIT ─────────────────────────────────────────────────────

function ceInit() {
  if (ceState.initialized) return;
  ceState.continents = CONTINENT_DEFS.map(def => ({
    ...def,
    wonder: { ...def.wonder },
    bonuses: { ...def.bonuses },
    resourceProfile: { ...def.resourceProfile },
    resources: { spiritStones: def.resourceProfile.spiritStones, ironOre: def.resourceProfile.ironOre, herbs: def.resourceProfile.herbs, artifacts: def.resourceProfile.artifacts },
    countryIds: [],
    activeEvents: [],
    eventCooldowns: {},
    stability: 75 + Math.floor(Math.random() * 20),
    hegemon: null,
    history: [],
  }));
  ceState.initialized = true;
  ceAssignCountries();
}

// ─── SAVE / LOAD ──────────────────────────────────────────────

(function cePatchSaveLoad() {
  function tryPatch() {
    if (typeof window.save === 'function' && !window._ceSavePatched) {
      window._ceSavePatched = true;
      const _os = window.save;
      window.save = function() {
        _os.apply(this, arguments);
        try { localStorage.setItem('cgv6_ceState', JSON.stringify({
          continents: ceState.continents.map(c => ({ id:c.id, wonder:c.wonder, resources:c.resources, countryIds:c.countryIds, stability:c.stability, history:c.history.slice(0,100), activeEvents:c.activeEvents, eventCooldowns:c.eventCooldowns })),
          wars:       ceState.wars.slice(0,50),
          globalLog:  ceState.globalLog.slice(0,200),
          tickCount:  ceState.tickCount,
        })); } catch(e) {}
      };
    }
    if (typeof window.load === 'function' && !window._ceLoadPatched) {
      window._ceLoadPatched = true;
      const _ol = window.load;
      window.load = function() {
        _ol.apply(this, arguments);
        try {
          const raw = localStorage.getItem('cgv6_ceState');
          if (raw) {
            const d = JSON.parse(raw);
            ceInit();
            (d.continents || []).forEach(saved => {
              const c = ceState.continents.find(x => x.id === saved.id);
              if (c) { Object.assign(c, saved); }
            });
            ceState.wars     = d.wars     || [];
            ceState.globalLog= d.globalLog|| [];
            ceState.tickCount= d.tickCount|| 0;
          }
        } catch(e) {}
      };
    }
  }
  tryPatch();
  document.addEventListener('DOMContentLoaded', () => setTimeout(tryPatch, 1200));
})();

// ─── CORE LOGIC ───────────────────────────────────────────────

function ceAssignCountries() {
  if (!ceState.initialized) ceInit();
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  // Clear all assignments
  ceState.continents.forEach(c => c.countryIds = []);

  cArr.forEach((country, idx) => {
    const territory = (country.territory || country.region || '').toLowerCase();
    let matched = null;
    for (const cont of ceState.continents) {
      if (cont.regionKeywords.some(kw => territory.includes(kw.toLowerCase()))) { matched = cont; break; }
    }
    if (!matched) matched = ceState.continents[idx % ceState.continents.length];
    if (country.continentId) {
      const pinned = ceState.continents.find(c => c.id === country.continentId);
      if (pinned) matched = pinned;
    }
    if (!matched.countryIds.includes(country.name || country.id || idx.toString()))
      matched.countryIds.push(country.name || country.id || `#${idx}`);
    country.continentId = matched.id;
  });

  ceUpdateHegemons();
}

function ceUpdateHegemons() {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  ceState.continents.forEach(cont => {
    let best = null, bestScore = -1;
    cont.countryIds.forEach(cid => {
      const c = cArr.find(x => (x.name || x.id) === cid);
      if (!c) return;
      const score = (c.population || 0) * 0.4 + (c.army || 0) * 0.4 + (c.techLevel || 0) * 10 + (c.economy || 0) * 0.2;
      if (score > bestScore) { bestScore = score; best = c; }
    });
    const prev = cont.hegemon;
    cont.hegemon = best ? (best.name || best.id) : null;
    if (best && prev !== cont.hegemon) ceLog(cont.id, `👑 ${cont.hegemon} trở thành Bá Chủ của ${cont.name}`);
  });
}

function ceBuildWonder(continentId) {
  const cont = ceState.continents.find(c => c.id === continentId);
  if (!cont) return { ok: false, msg: 'Đại lục không tồn tại' };
  if (cont.wonder.built) return { ok: false, msg: `${cont.wonder.name} đã được xây dựng` };
  const cost = cont.wonder.cost;
  for (const [res, amt] of Object.entries(cost)) {
    if ((cont.resources[res] || 0) < amt) return { ok: false, msg: `Thiếu ${res} (cần ${amt}, có ${Math.floor(cont.resources[res] || 0)})` };
  }
  for (const [res, amt] of Object.entries(cost)) cont.resources[res] -= amt;
  cont.wonder.built = true;
  ceLog(continentId, `🏛️ ${cont.wonder.name} đã hoàn thành tại ${cont.name}!`);
  if (typeof addLog === 'function') addLog(`[Đại Lục] 🏛️ KỲ QUAN ${cont.wonder.name} hoàn thành — ${cont.name} rung chuyển thiên hạ!`);
  return { ok: true };
}

function ceLaunchWar(attackerId, defenderId) {
  if (attackerId === defenderId) return { ok: false, msg: 'Không thể tuyên chiến với chính mình' };
  const att = ceState.continents.find(c => c.id === attackerId);
  const def = ceState.continents.find(c => c.id === defenderId);
  if (!att || !def) return { ok: false, msg: 'Đại lục không hợp lệ' };
  const existing = ceState.wars.find(w => w.phase === 'ongoing' &&
    ((w.attacker === attackerId && w.defender === defenderId) || (w.attacker === defenderId && w.defender === attackerId)));
  if (existing) return { ok: false, msg: 'Hai đại lục này đang trong chiến tranh' };

  const war = { id: `cwar_${Date.now()}`, attacker: attackerId, defender: defenderId, tick: ceState.tickCount, phase: 'ongoing', duration: 30 + Math.floor(Math.random() * 30), ticksLeft: 30 + Math.floor(Math.random() * 30), outcome: null };
  ceState.wars.push(war);
  att.stability = Math.max(10, att.stability - 10);
  def.stability = Math.max(10, def.stability - 10);
  const msg = `⚔️ LỤC ĐỊA CHIẾN TRANH — ${att.icon} ${att.name} tuyên chiến với ${def.icon} ${def.name}!`;
  ceLog(attackerId, msg); ceLog(defenderId, msg);
  if (typeof addLog === 'function') addLog(`[Đại Lục] ${msg}`);
  return { ok: true, war };
}

function ceTriggerEvent(continentId, eventId, forced) {
  const cont = ceState.continents.find(c => c.id === continentId);
  const evDef = CONTINENT_EVENTS[eventId];
  if (!cont || !evDef) return { ok: false, msg: '?' };
  if (!forced && (cont.eventCooldowns[eventId] || 0) > 0) return { ok: false, msg: `Hồi chiêu: ${cont.eventCooldowns[eventId]} tích tắc` };
  if (cont.activeEvents.find(e => e.eventId === eventId)) return { ok: false, msg: 'Sự kiện đang diễn ra' };
  cont.activeEvents.push({ eventId, ticksLeft: evDef.duration });
  cont.eventCooldowns[eventId] = 50 + Math.floor(Math.random() * 30);
  try { evDef.onStart(continentId); } catch(e) {}
  return { ok: true };
}

// ─── TICK ─────────────────────────────────────────────────────

function ceTick() {
  if (!ceState.initialized) ceInit();
  ceState.tickCount++;
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];

  // Accumulate resources
  ceState.continents.forEach(cont => {
    const base = cont.resourceProfile;
    const mult = 0.05;
    cont.resources.spiritStones = (cont.resources.spiritStones || 0) + base.spiritStones * mult * (cont.countryIds.length + 1);
    cont.resources.ironOre      = (cont.resources.ironOre || 0)      + base.ironOre      * mult * (cont.countryIds.length + 1);
    cont.resources.herbs        = (cont.resources.herbs || 0)        + base.herbs        * mult * (cont.countryIds.length + 1);
    cont.resources.artifacts    = (cont.resources.artifacts || 0)    + base.artifacts    * mult * (cont.countryIds.length + 1);

    // Tick active events
    cont.activeEvents = cont.activeEvents.filter(e => { e.ticksLeft--; return e.ticksLeft > 0; });

    // Cooldowns
    for (const k in cont.eventCooldowns) { if (cont.eventCooldowns[k] > 0) cont.eventCooldowns[k]--; }

    // Stability drift
    if (Math.random() < 0.05) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3 + 1);
      cont.stability = Math.max(5, Math.min(100, cont.stability + delta));
    }
  });

  // Tick wars
  ceState.wars.filter(w => w.phase === 'ongoing').forEach(w => {
    w.ticksLeft--;
    if (w.ticksLeft <= 0) {
      const att = ceState.continents.find(c => c.id === w.attacker);
      const def = ceState.continents.find(c => c.id === w.defender);
      const attPow = _cePower(w.attacker, cArr);
      const defPow = _cePower(w.defender, cArr);
      const roll = Math.random();
      if (attPow > defPow * 1.2) {
        w.outcome = 'attacker_wins';
        if (att) att.stability = Math.min(100, att.stability + 15);
        if (def) { def.stability = Math.max(5, def.stability - 20); _ceTransferResources(w.defender, w.attacker, 0.15); }
        ceLog(w.attacker, `🏆 ${att?.icon||''}${att?.name||'?'} giành chiến thắng trước ${def?.icon||''}${def?.name||'?'}!`);
      } else if (defPow > attPow * 1.2) {
        w.outcome = 'defender_wins';
        if (def) def.stability = Math.min(100, def.stability + 15);
        if (att) { att.stability = Math.max(5, att.stability - 20); _ceTransferResources(w.attacker, w.defender, 0.15); }
        ceLog(w.defender, `🛡️ ${def?.icon||''}${def?.name||'?'} phòng thủ thành công!`);
      } else {
        w.outcome = 'stalemate';
        ceLog(w.attacker, `🤝 Chiến tranh ${att?.name||'?'} ↔ ${def?.name||'?'} kết thúc bất phân thắng bại.`);
      }
      w.phase = 'ended';
    }
  });

  // Reassign new countries
  if (ceState.tickCount % 5 === 0) ceAssignCountries();

  // Auto-events
  if ((ceState.tickCount - ceState.lastAutoTick) >= ceState.autoInterval) {
    ceState.lastAutoTick = ceState.tickCount;
    _ceAutoEvents();
  }
}

function _cePower(continentId, cArr) {
  const cont = ceState.continents.find(c => c.id === continentId);
  if (!cont) return 0;
  return cont.countryIds.reduce((sum, cid) => {
    const c = cArr.find(x => (x.name || x.id) === cid);
    return sum + (c ? (c.population||0)*0.3 + (c.army||0)*0.5 + (c.techLevel||0)*5 : 0);
  }, 0) + (cont.wonder.built ? 2000 : 0) + cont.stability * 10;
}

function _ceTransferResources(fromId, toId, pct) {
  const from = ceState.continents.find(c => c.id === fromId);
  const to   = ceState.continents.find(c => c.id === toId);
  if (!from || !to) return;
  ['spiritStones','ironOre','herbs','artifacts'].forEach(k => {
    const amt = Math.floor((from.resources[k] || 0) * pct);
    from.resources[k] = Math.max(0, (from.resources[k] || 0) - amt);
    to.resources[k]   = (to.resources[k] || 0) + amt;
  });
}

function _ceAutoEvents() {
  ceState.continents.forEach(cont => {
    if (Math.random() > 0.25) return;
    const candidates = cont.events.filter(evId => {
      const ev = CONTINENT_EVENTS[evId];
      return ev && (!cont.eventCooldowns[evId] || cont.eventCooldowns[evId] <= 0) && !cont.activeEvents.find(e => e.eventId === evId);
    });
    if (candidates.length) {
      const evId = candidates[Math.floor(Math.random() * candidates.length)];
      ceTriggerEvent(cont.id, evId, true);
    }
  });
}

function ceLog(continentId, msg) {
  const cont = ceState.continents.find(c => c.id === continentId);
  const entry = { tick: ceState.tickCount, msg, continent: continentId };
  if (cont) cont.history.unshift(entry);
  ceState.globalLog.unshift(entry);
  if (ceState.globalLog.length > 500) ceState.globalLog.pop();
  if (typeof addLog === 'function') addLog(`[${cont?.name || continentId}] ${msg}`);
}

// ─── RENDER ───────────────────────────────────────────────────

let _ceTab = 'overview';
function ceSwitchTab(t) { _ceTab = t; ceRenderPanel(); }

function ceRenderPanel() {
  if (!ceState.initialized) ceInit();
  const el = document.getElementById('panel-continent');
  if (!el) return;

  const tabs = [
    { id:'overview', label:'🗺️ Đại Lục' },
    { id:'wars',     label:`⚔️ Chiến Tranh (${ceState.wars.filter(w=>w.phase==='ongoing').length})` },
    { id:'wonders',  label:'🏛️ Kỳ Quan' },
    { id:'events',   label:'⚡ Sự Kiện' },
    { id:'log',      label:`📜 Sử Ký (${ceState.globalLog.length})` },
  ];

  el.innerHTML = `
    <div style="padding:12px 16px;background:linear-gradient(135deg,#0a0a1a,#0f172a,#0a0a1a);min-height:100%;font-family:'Segoe UI',sans-serif;color:#e2e8f0;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#c084fc;text-shadow:0 0 12px #a855f7;">🌍 Đại Lục Hệ Thống</h2>
      <p style="margin:0 0 12px;font-size:12px;color:#7c3aed;font-style:italic;">Continent Engine V1 — 6 Đại Lục · Bá Quyền · Kỳ Quan · Lục Địa Chiến</p>
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        ${tabs.map(t=>`<button onclick="ceSwitchTab('${t.id}')" style="padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;background:${_ceTab===t.id?'#581c87':'#1e1b4b'};color:${_ceTab===t.id?'#e9d5ff':'#94a3b8'};border:1px solid ${_ceTab===t.id?'#9333ea':'#374151'};">${t.label}</button>`).join('')}
      </div>
      ${_ceTab==='overview' ? _ceRenderOverview() : ''}
      ${_ceTab==='wars'     ? _ceRenderWars()     : ''}
      ${_ceTab==='wonders'  ? _ceRenderWonders()  : ''}
      ${_ceTab==='events'   ? _ceRenderEvents()   : ''}
      ${_ceTab==='log'      ? _ceRenderLog()      : ''}
    </div>`;
}

function _ceRenderOverview() {
  const cArr = (typeof countries !== 'undefined' && Array.isArray(countries)) ? countries : [];
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    ${ceState.continents.map(cont => {
      const war = ceState.wars.find(w => w.phase==='ongoing' && (w.attacker===cont.id || w.defender===cont.id));
      const evCount = cont.activeEvents.length;
      const totalPop = cont.countryIds.reduce((s,cid)=>{ const c=cArr.find(x=>(x.name||x.id)===cid); return s+(c?.population||0); },0);
      const totalArmy= cont.countryIds.reduce((s,cid)=>{ const c=cArr.find(x=>(x.name||x.id)===cid); return s+(c?.army||0); },0);
      const stabColor= cont.stability>=70?'#4ade80':cont.stability>=40?'#fbbf24':'#f87171';
      return `
      <div style="background:${cont.bg};border:1px solid ${cont.color}44;border-radius:14px;padding:14px;box-shadow:0 0 18px ${cont.color}18;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:22px;">${cont.icon}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
            ${war?`<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:#450a0a;color:#f87171;border:1px solid #7f1d1d;">⚔️ Chiến Tranh</span>`:''}
            ${evCount?`<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:#1e1b4b;color:#818cf8;border:1px solid #3730a3;">⚡ ${evCount} sự kiện</span>`:''}
            ${cont.wonder.built?`<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:#14532d;color:#4ade80;border:1px solid #166534;">🏛️ Kỳ Quan</span>`:''}
          </div>
        </div>
        <div style="font-size:15px;font-weight:700;color:${cont.color};margin-bottom:2px;">${cont.name}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${cont.climate}</div>
        <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-bottom:8px;">${cont.desc}</div>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
          <div style="background:#0f172a;border-radius:6px;padding:6px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Dân số</div>
            <div style="font-size:13px;font-weight:700;color:#e2e8f0;">${totalPop.toLocaleString()}</div>
          </div>
          <div style="background:#0f172a;border-radius:6px;padding:6px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Quân đội</div>
            <div style="font-size:13px;font-weight:700;color:#e2e8f0;">${totalArmy.toLocaleString()}</div>
          </div>
          <div style="background:#0f172a;border-radius:6px;padding:6px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Thế lực</div>
            <div style="font-size:13px;font-weight:700;color:${cont.color};">${cont.countryIds.length}</div>
          </div>
          <div style="background:#0f172a;border-radius:6px;padding:6px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;">Ổn định</div>
            <div style="font-size:13px;font-weight:700;color:${stabColor};">${cont.stability}%</div>
          </div>
        </div>

        <!-- Hegemon -->
        ${cont.hegemon ? `<div style="background:#0f172a;border:1px solid ${cont.color}33;border-radius:8px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:${cont.color};">👑 Bá Chủ: <b>${cont.hegemon}</b></div>` : '<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">👑 Chưa có Bá Chủ</div>'}

        <!-- Bonuses -->
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
          ${Object.entries(cont.bonuses).map(([k,v])=>{
            const label={cultivationMult:'Tu',warMult:'Chiến',econMult:'Kinh',cultureMult:'Văn',birthMult:'Sinh'}[k]||k;
            const color=v>1?'#4ade80':v<1?'#f87171':'#94a3b8';
            return `<span style="font-size:10px;padding:2px 6px;border-radius:20px;background:${v>1?'#14532d':'#450a0a'};color:${color};">×${v} ${label}</span>`;
          }).join('')}
        </div>

        <!-- Resources -->
        <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Tài nguyên:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px;">
          ${Object.entries(cont.resources).map(([k,v])=>{
            const icons={spiritStones:'💎',ironOre:'⚙️',herbs:'🌿',artifacts:'📿'};
            return `<div style="background:#0f172a;border-radius:4px;padding:4px 6px;font-size:10px;color:#94a3b8;">${icons[k]||'•'} ${k==='spiritStones'?'Linh Thạch':k==='ironOre'?'Thiết Khoáng':k==='herbs'?'Linh Thảo':'Cổ Vật'}: <b style="color:${cont.color};">${Math.floor(v)}</b></div>`;
          }).join('')}
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="ceActionBuildWonder('${cont.id}')" style="flex:1;padding:5px 8px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${cont.wonder.built?'#374151':cont.color+'cc'};color:${cont.wonder.built?'#6b7280':'#fff'};">${cont.wonder.built?`✅ ${cont.wonder.icon}`:`🔨 Xây ${cont.wonder.icon}`}</button>
          <button onclick="ceShowWarModal('${cont.id}')" style="padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:#450a0a;color:#f87171;">⚔️ Chiến</button>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- War modal container -->
  <div id="ce-war-modal" style="display:none;margin-top:14px;background:#1a0a0a;border:1px solid #7f1d1d;border-radius:12px;padding:16px;">
    <div style="font-size:14px;font-weight:700;color:#f87171;margin-bottom:10px;">⚔️ Phát Động Lục Địa Chiến Tranh</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12px;color:#94a3b8;">Tấn công từ</span>
      <select id="ce-war-att" style="padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <span style="font-size:12px;color:#94a3b8;">→ tấn công</span>
      <select id="ce-war-def" style="padding:5px 8px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;">
        ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>
      <button onclick="ceActionLaunchWar()" style="padding:5px 14px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:#dc2626;color:#fff;">⚔️ TUYÊN CHIẾN</button>
      <button onclick="document.getElementById('ce-war-modal').style.display='none'" style="padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-size:12px;background:#374151;color:#9ca3af;">✕</button>
    </div>
    <div id="ce-war-msg" style="font-size:11px;margin-top:8px;"></div>
  </div>`;
}

function _ceRenderWars() {
  const ongoing = ceState.wars.filter(w => w.phase === 'ongoing');
  const ended   = ceState.wars.filter(w => w.phase === 'ended').slice(0, 20);

  const contName = id => { const c = ceState.continents.find(x=>x.id===id); return c ? `${c.icon} ${c.name}` : id; };
  const outcomeLabel = o => ({ attacker_wins:'🏆 Tấn Công Thắng', defender_wins:'🛡️ Phòng Thủ Thắng', stalemate:'🤝 Bất Phân' })[o] || o;

  return `
    <div>
      <div style="font-size:14px;font-weight:700;color:#f87171;margin-bottom:10px;">⚔️ Đang Diễn Ra (${ongoing.length})</div>
      ${ongoing.length ? ongoing.map(w => {
        const att = ceState.continents.find(c=>c.id===w.attacker);
        const def = ceState.continents.find(c=>c.id===w.defender);
        const pct = Math.round((1 - w.ticksLeft / w.duration) * 100);
        return `<div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:12px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-size:13px;font-weight:700;color:#f87171;">${att?.icon} ${att?.name} <span style="color:#6b7280;">⚔️</span> ${def?.icon} ${def?.name}</div>
            <span style="font-size:11px;color:#6b7280;">Còn ${w.ticksLeft} tích tắc</span>
          </div>
          <div style="height:6px;background:#1f2937;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#dc2626,#f87171);border-radius:4px;"></div>
          </div>
        </div>`;
      }).join('') : '<div style="color:#6b7280;font-size:12px;padding:20px;text-align:center;">Thiên hạ đang hoà bình — chưa có lục địa chiến tranh.</div>'}

      <div style="font-size:14px;font-weight:700;color:#94a3b8;margin:14px 0 10px;">📜 Lịch Sử Chiến Tranh (${ended.length})</div>
      ${ended.length ? ended.map(w => `
        <div style="display:flex;justify-content:space-between;background:#0f172a;border-radius:8px;padding:10px 12px;margin-bottom:6px;border-left:3px solid ${w.outcome==='stalemate'?'#94a3b8':w.outcome==='attacker_wins'?'#f87171':'#4ade80'};">
          <div style="font-size:12px;color:#94a3b8;">${contName(w.attacker)} ↔ ${contName(w.defender)}</div>
          <div style="font-size:12px;color:#e2e8f0;">${outcomeLabel(w.outcome)}</div>
        </div>`).join('') : '<div style="color:#6b7280;font-size:12px;padding:12px;">Chưa có chiến tranh nào kết thúc.</div>'}

      <!-- Launch war -->
      <div style="margin-top:16px;background:#1a0a0a;border:1px solid #7f1d1d;border-radius:12px;padding:14px;">
        <div style="font-size:13px;font-weight:700;color:#f87171;margin-bottom:10px;">⚔️ Phát Động Chiến Tranh</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <select id="ce-war-att2" style="flex:1;padding:6px 10px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;">
            ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
          <span style="color:#f87171;font-size:14px;">⚔️</span>
          <select id="ce-war-def2" style="flex:1;padding:6px 10px;border-radius:6px;background:#0f172a;color:#e2e8f0;border:1px solid #374151;font-size:12px;">
            ${ceState.continents.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
          <button onclick="ceActionLaunchWar2()" style="padding:6px 16px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:#dc2626;color:#fff;">TUYÊN CHIẾN</button>
        </div>
        <div id="ce-war-msg2" style="font-size:11px;margin-top:8px;"></div>
      </div>
    </div>`;
}

function _ceRenderWonders() {
  return `<div>
    <div style="font-size:12px;color:#94a3b8;margin-bottom:14px;">Mỗi đại lục có 1 kỳ quan độc đáo. Xây dựng bằng tài nguyên đại lục — nhận buff vĩnh viễn!</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${ceState.continents.map(cont => {
        const w = cont.wonder;
        return `<div style="background:${cont.bg};border:1px solid ${cont.color}${w.built?'88':'33'};border-radius:12px;padding:14px;${w.built?`box-shadow:0 0 20px ${cont.color}44`:''}>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:28px;">${w.icon}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:${w.built?'#fbbf24':cont.color};">${w.name}</div>
              <div style="font-size:11px;color:#64748b;">${cont.icon} ${cont.name}</div>
            </div>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin:0 0 10px;line-height:1.5;">${w.desc}</p>
          ${!w.built ? `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">Chi phí xây dựng:</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
            ${Object.entries(w.cost).map(([k,v])=>{
              const icons={spiritStones:'💎',ironOre:'⚙️',herbs:'🌿',artifacts:'📿'};
              const have = Math.floor(cont.resources[k]||0);
              const ok = have >= v;
              return `<span style="font-size:10px;padding:3px 8px;border-radius:20px;background:${ok?'#14532d':'#450a0a'};color:${ok?'#4ade80':'#f87171'};">${icons[k]||'•'} ${v} (có ${have})</span>`;
            }).join('')}
          </div>` : `<div style="font-size:11px;color:#fbbf24;margin-bottom:10px;font-weight:600;">✅ ĐÃ XÂY DỰNG — Buff Vĩnh Viễn Hoạt Động</div>`}
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
            ${Object.entries(w.bonus).map(([k,v])=>{
              const label={cultivationMult:'Tu Luyện',warMult:'Chiến Tranh',econMult:'Kinh Tế',cultureMult:'Văn Hóa'}[k]||k;
              return `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#14532d;color:#4ade80;">+${Math.round(v*100)}% ${label}</span>`;
            }).join('')}
          </div>
          ${!w.built ? `<button onclick="ceActionBuildWonder('${cont.id}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:700;background:${cont.color}cc;color:#fff;">🔨 Xây Dựng Kỳ Quan</button>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function _ceRenderEvents() {
  return `<div>
    <div style="font-size:12px;color:#94a3b8;margin-bottom:14px;">Kích hoạt sự kiện đặc trưng của từng đại lục. AI cũng tự động trigger 25% mỗi chu kỳ.</div>
    ${ceState.continents.map(cont => `
      <div style="margin-bottom:16px;">
        <div style="font-size:13px;font-weight:700;color:${cont.color};margin-bottom:8px;border-bottom:1px solid ${cont.color}33;padding-bottom:4px;">${cont.icon} ${cont.name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          ${cont.events.map(evId => {
            const ev = CONTINENT_EVENTS[evId] || {};
            const active = cont.activeEvents.find(e => e.eventId === evId);
            const cd = cont.eventCooldowns[evId] || 0;
            return `<div style="background:${cont.bg};border:1px solid ${cont.color}33;border-radius:8px;padding:10px;">
              <div style="font-size:16px;">${ev.icon||'❓'}</div>
              <div style="font-size:11px;font-weight:600;color:${cont.color};margin:4px 0;">${ev.name||evId}</div>
              <div style="font-size:10px;color:#6b7280;margin-bottom:6px;line-height:1.3;">${(ev.desc||'').slice(0,60)}${(ev.desc||'').length>60?'…':''}</div>
              <div style="font-size:10px;color:${active?'#4ade80':cd>0?'#fbbf24':'#94a3b8'};margin-bottom:6px;">${active?`🟢 Còn ${active.ticksLeft} tắc`:cd>0?`⏳ ${cd}`:'✅ Sẵn sàng'}</div>
              <button onclick="ceActionTriggerEvent('${cont.id}','${evId}')" style="width:100%;padding:4px;border-radius:6px;border:none;cursor:pointer;font-size:10px;font-weight:600;background:${active?'#374151':cont.color+'bb'};color:${active?'#6b7280':'#fff'};">${active?'Đang xảy ra':'Kích Hoạt'}</button>
            </div>`;
          }).join('')}
        </div>
      </div>`).join('')}
  </div>`;
}

function _ceRenderLog() {
  if (!ceState.globalLog.length) return `<div style="text-align:center;padding:40px;color:#6b7280;">Lịch sử đại lục trống.</div>`;
  return `<div style="max-height:520px;overflow-y:auto;">
    ${ceState.globalLog.slice(0, 80).map(entry => {
      const cont = ceState.continents.find(c => c.id === entry.continent);
      return `<div style="display:flex;gap:8px;padding:8px 10px;background:#0f172a;border-left:3px solid ${cont?.color||'#374151'};border-radius:6px;margin-bottom:5px;">
        <span style="font-size:14px;">${cont?.icon||'🌍'}</span>
        <div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:2px;">${cont?.name||'?'} · Tích tắc ${entry.tick}</div>
          <div style="font-size:12px;color:#e2e8f0;">${entry.msg}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ─── PUBLIC CALLBACKS ─────────────────────────────────────────

window.ceSwitchTab = ceSwitchTab;

window.ceShowWarModal = function(continentId) {
  const modal = document.getElementById('ce-war-modal');
  if (!modal) return;
  modal.style.display = 'block';
  const attSel = document.getElementById('ce-war-att');
  if (attSel) attSel.value = continentId;
};

window.ceActionBuildWonder = function(continentId) {
  const r = ceBuildWonder(continentId);
  const msg = r.ok ? `✅ ${ceState.continents.find(c=>c.id===continentId)?.wonder?.name} đã hoàn thành!` : `⚠️ ${r.msg}`;
  if (typeof addLog === 'function') addLog(`[Đại Lục Kỳ Quan] ${msg}`);
  setTimeout(() => { ceRenderPanel(); ceSwitchTab('wonders'); }, 200);
};

window.ceActionLaunchWar = function() {
  const att = document.getElementById('ce-war-att')?.value;
  const def = document.getElementById('ce-war-def')?.value;
  const msg = document.getElementById('ce-war-msg');
  const r = ceLaunchWar(att, def);
  if (msg) { msg.style.color = r.ok ? '#4ade80' : '#f87171'; msg.textContent = r.ok ? '⚔️ Tuyên chiến thành công!' : `⚠️ ${r.msg}`; }
  setTimeout(() => { ceRenderPanel(); ceSwitchTab('wars'); }, 300);
};

window.ceActionLaunchWar2 = function() {
  const att = document.getElementById('ce-war-att2')?.value;
  const def = document.getElementById('ce-war-def2')?.value;
  const msg = document.getElementById('ce-war-msg2');
  const r = ceLaunchWar(att, def);
  if (msg) { msg.style.color = r.ok ? '#4ade80' : '#f87171'; msg.textContent = r.ok ? '⚔️ Tuyên chiến thành công!' : `⚠️ ${r.msg}`; }
  setTimeout(() => { ceRenderPanel(); ceSwitchTab('wars'); }, 300);
};

window.ceActionTriggerEvent = function(continentId, eventId) {
  const r = ceTriggerEvent(continentId, eventId, true);
  if (!r.ok && typeof addLog === 'function') addLog(`[Đại Lục] ⚠️ ${r.msg}`);
  setTimeout(ceRenderPanel, 150);
};

window.ceTick         = ceTick;
window.ceRenderPanel  = ceRenderPanel;
window.ceInit         = ceInit;
window.ceState        = ceState;
window.ceAssignCountries = ceAssignCountries;

// ─── HOOK INTO MAIN TICK ──────────────────────────────────────

(function ceHookTick() {
  const tryHook = () => {
    if (typeof window.advanceTime === 'function' && !window._ceTickHooked) {
      window._ceTickHooked = true;
      const _oa = window.advanceTime;
      window.advanceTime = function() {
        _oa.apply(this, arguments);
        try { ceTick(); } catch(e) {}
      };
    }
  };
  tryHook();
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryHook, 2500);
    setInterval(() => { try { ceTick(); } catch(e){} }, 5000);
  });
})();

// ─── AUTO-INIT ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => setTimeout(ceInit, 1500));

console.log('[ContinentEngine V1] 🌍 Đại Lục Hệ Thống khởi động — 6 Đại Lục · 6 Kỳ Quan · 18 Sự Kiện · Lục Địa Chiến Tranh sẵn sàng.');
