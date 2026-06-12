/* ================================================================
   AI STORY ENGINE V2.0 — Event Chain Engine
   Hệ thống lịch sử có nhân quả: Nguyên nhân → Diễn biến → Hậu quả
   Tương thích hoàn toàn với V1, không phá vỡ localStorage cũ
   File: aiStoryEngine.js
   ================================================================ */

// ================================================================
// WORLD HISTORY DATABASE — Event Chain Store
// ================================================================

let worldChronicle = [];        // V1 compat: [{id, year, type, title, body, tags, npcs, sects, countries, dynasty}]
let _chronicleIdCounter = 1;

// V2 NEW: Event chain database with cause/consequence links
let worldEventChains = [];      // [{id, year, type, title, description, location, participants, causeId, consequenceIds, chainDepth}]
let _chainIdCounter = 1;

// V2 NEW: AI Memory System
let aiMemory = {
  kills:       [],   // [{killerId, killerName, victimId, victimName, year, reason}]
  founders:    [],   // [{npcName, entityType, entityName, year}]  — lập tông/lập quốc
  betrayals:   [],   // [{betrayerId, betrayerName, victimName, year, context}]
  alliances:   [],   // [{npc1, npc2, year, type}]  — kết đạo lữ / liên minh
  revenges:    [],   // [{avengerId, targetName, year, success}]
  sectHistory: {},   // key=sectId: {founders, leaders, peaks, declines, destructions, revivals}
  dynastyHistory: {}, // key=surname: {founded, peaks, declines, destructions, revivals}
  kingdomHistory: {}, // key=countryName: {founder, rulers, wars, expansions, falls}
};

// V2 NEW: Legends table
let worldLegends = [];  // [{name, title, deeds, year, type}]

// V2 NEW: Pending revenge queue
let revengeQueue = [];  // [{avengerId/avengerName, targetId/targetName, triggerYear, reason, power}]

// ================================================================
// V1 COMPAT: NARRATIVE TEMPLATES
// ================================================================

const NARRATIVE_PLACES = [
  "Tây Hoang","Đông Vực","Nam Hải","Bắc Nguyên","Trung Châu",
  "Thiên Sơn","Thần Đảo","Hư Không Vực","Hắc Uyên","Linh Kiếm Cốc",
  "Vạn Ma Sơn","Thiên Đình","Tử Tiêu Cung","Hỗn Mang Đại Lục",
  "Tứ Tượng Điện","Băng Hỏa Lĩnh","Thiên Kiếm Đỉnh","Ma Ngục",
  "Bồng Lai Tiên Đảo","Vô Cực Hải","Lưu Ly Thiên","Thiên Mộ Bình Nguyên",
];
const NARRATIVE_ADJECTIVES = ["hùng mạnh","thần bí","cổ xưa","tàn độc","siêu việt","vô song","kinh thiên","bách chiến","bất thế","vô địch","huyền ảo","truyền kỳ","thống trị","kiêu hùng","bất tử"];
const NARRATIVE_WEAPONS = ["Thiên Kiếm","Hủy Diệt Thương","Linh Bảo Đao","Vạn Ma Kích","Băng Hỏa Song Kiếm","Cửu Long Thần Côn","Thiên Lôi Cung","Huyết Ma Kiếm","Ngọc Hư Thần Giáo","Hắc Ám Chi Nhẫn"];
const NARRATIVE_SKILLS = ["Vạn Kiếm Quy Tông","Thiên Phong Lôi Ảnh","Hỏa Long Tuyệt Kỹ","Cửu Dương Thần Công","Huyết Hải Thiên Kiếm","Băng Vân Bộ Pháp","Lôi Đình Vạn Lý","Thiên Ma Thân","Hắc Ám Lôi Phong","Âm Dương Hợp Nhất","Thiên Địa Sát Trận","Tam Thiên Kiếm Khí","Thiên Kiếm Vũ","Phong Lôi Song Pháp"];
const NARRATIVE_TITLES = ["Thiên Tài","Quái Vật","Hủy Diệt Giả","Tiên Nhân","Thánh Nhân","Ma Vương","Kiếm Thánh","Đạo Tổ","Thiên Mệnh Giả","Vô Địch Thiên Hạ","Thần Cơ Mệnh Thế","Thiên Cơ Chi Tử","Diệt Thế Giả","Vạn Cổ Đệ Nhất"];
const RETREAT_REASONS = ["tu luyện bí pháp cổ xưa","cảm ngộ thiên đạo","tổng kết võ đạo","hóa giải tâm ma","phục hồi thương thế","tham ngộ Đại Đạo","chiết phục Linh Bảo","luyện chế thần đan","hòa giải ngũ hành chi lực"];
const REALM_NAMES_EXTRA = ["Luyện Khí","Trúc Cơ","Kim Đan","Nguyên Anh","Hóa Thần","Luyện Hư","Hợp Thể","Đại Thừa","Chân Tiên","Tiên Hoàng","Thiên Đạo"];
const BEAST_NAMES = ["Cổ Long","Thần Phượng","Kỳ Lân","Hỏa Hổ","Băng Gấu Thần","Hắc Ám Chi Long","Thiên Lôi Đại Bàng","Vạn Niên Huyết Ngao","Tứ Tượng Thần Thú","Cửu Vĩ Thiên Hồ","Ma Thú Vương","Tinh Huyết Thú"];
const ERA_NAMES = ["Kỷ Nguyên Hỗn Mang","Thời Đại Thần Cổ","Kỷ Nguyên Tranh Phong","Thời Đại Đế Vương","Kỷ Nguyên Bình Định","Thời Loạn Thế Quần Hùng","Kỷ Nguyên Huyết Chiến","Thời Đại Đại Thống","Kỷ Nguyên Phi Thăng","Thời Đại Thiên Kiếm","Kỷ Nguyên Thiên Ma","Thời Đại Cửu Trùng Thiên"];
const WAR_CAUSES = ["tranh đoạt Linh Mạch","phục thù huyết thù cổ đại","cướp đoạt Tông Môn Thánh Địa","tàn sát đệ tử","xâm phạm lãnh thổ","đoạt thủ Thiên Tài Địa Bảo","thanh trừ dị đoan","thống nhất một phương","báo thù sư phụ","tranh đoạt Đạo Thống","chiếm đoạt cổ trận","huyết hải thâm thù"];
const WAR_OUTCOMES = ["bị san phẳng hoàn toàn","rút lui thua trận","tan rã hoàn toàn","đầu hàng quy phụ","bị sáp nhập","tổn thất nặng nề nhưng thoát được","chạy trốn về phương xa","bị diệt môn","đổi chủ trở thành chi nhánh"];
const LEGEND_DEEDS = ["một mình phá trận Thiên La Địa Võng của 10 đại cường giả","tay không đánh hạ Thần Thú Cổ Long trấn giữ Linh Mạch","khắc phá Thiên Đạo Sấm Ách thăng lên cảnh giới vô thượng","mở ra Tiên Giới Chi Môn cho toàn bộ tu sĩ trong thiên hạ","một kiếm chém đứt Sơn Hà — núi non vỡ vụn muôn dặm","dùng công pháp bá đạo phá tan toàn bộ Thiên Kiêu của thế hệ ấy","đơn thương độc mã hạ được ba đại Thánh Nhân cùng một lúc","để lại Thiên Kiếm đạo ý — hậu thế ngàn năm vẫn chưa hiểu hết","cứu vãn toàn bộ đại lục khỏi kiếp nạn Thiên Ma xâm thực","khai sáng một võ đạo hoàn toàn mới — vạn người theo học"];

// ================================================================
// HELPERS
// ================================================================

function _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function _randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _chance(p) { return Math.random() < p; }

function _randName() {
  if (typeof npcs !== "undefined" && npcs.length) {
    const alive = npcs.filter(n => n.status === "alive");
    if (alive.length) return _rand(alive).name;
    return _rand(npcs).name;
  }
  return _rand(["Lâm Phàm","Tiêu Viêm","Long Hạo","Tần Phong","Vô Thiên","Hàn Lập","Vũ Hạo","Mặc Huyền","Hạc Vân","Diệp Phàm"]);
}
function _randName2() {
  const n1 = _randName(); let n2 = _randName(); let t = 0;
  while (n2 === n1 && t++ < 5) n2 = _randName();
  return [n1, n2];
}
function _randSect() {
  if (typeof sects !== "undefined" && sects.length) return _rand(sects).name;
  return _rand(["Thanh Vân Tông","Huyết Ma Tông","Thiên Kiếm Môn","Vạn Thú Sơn","Thiên Cơ Các"]);
}
function _randSect2() {
  const s1 = _randSect(); let s2 = _randSect(); let t = 0;
  while (s2 === s1 && t++ < 5) s2 = _randSect();
  return [s1, s2];
}
function _randSectObj() {
  if (typeof sects !== "undefined" && sects.length) return _rand(sects);
  return null;
}
function _randNPCObj() {
  if (typeof npcs !== "undefined" && npcs.length) {
    const alive = npcs.filter(n => n.status === "alive");
    return alive.length ? _rand(alive) : _rand(npcs);
  }
  return null;
}
function _randRealm() {
  if (typeof REALMS !== "undefined") {
    const r = REALMS[_randInt(0, Math.min(REALMS.length - 1, 8))];
    return r ? r.name : _rand(REALM_NAMES_EXTRA);
  }
  return _rand(REALM_NAMES_EXTRA);
}
function _randHighRealm() {
  if (typeof REALMS !== "undefined" && REALMS.length >= 6) {
    const r = REALMS[_randInt(4, REALMS.length - 1)];
    return r ? r.name : "Đại Thừa";
  }
  return _rand(["Hóa Thần","Luyện Hư","Hợp Thể","Đại Thừa","Chân Tiên"]);
}
function _currentYear() {
  if (window._storyOverrideYear !== undefined && window._storyOverrideYear !== null) return window._storyOverrideYear;
  return (typeof year !== "undefined") ? year : _randInt(100, 10000);
}
function _retreatYears() { return _randInt(10, 500); }
function _battleDays() { return _randInt(1, 30); }
function _casualties() { return _randInt(100, 50000); }
function _futureYear(minGap, maxGap) { return _currentYear() + _randInt(minGap, maxGap); }

// ================================================================
// V2: EVENT CHAIN PUSH — lưu sự kiện có nhân quả
// ================================================================

function _pushChain(type, title, description, meta = {}) {
  const yr = _currentYear();
  const chainId = "event_" + (_chainIdCounter++);
  const entry = {
    id:             chainId,
    year:           yr,
    type,
    title,
    description,
    location:       meta.location    || _rand(NARRATIVE_PLACES),
    participants:   meta.participants|| [],
    causeId:        meta.causeId     || null,
    consequenceIds: [],
    chainDepth:     meta.chainDepth  || 0,
    tags:           meta.tags        || [],
    npcs:           meta.npcs        || [],
    sects:          meta.sects       || [],
    countries:      meta.countries   || [],
    dynasty:        meta.dynasty     || null,
  };

  // Link back to cause
  if (meta.causeId) {
    const causeEvent = worldEventChains.find(e => e.id === meta.causeId);
    if (causeEvent) causeEvent.consequenceIds.push(chainId);
  }

  worldEventChains.push(entry);

  // Also push to V1 worldChronicle for full backward compat
  _pushChronicleFromChain(entry);

  _saveChronicle();
  return entry;
}

function _pushChronicleFromChain(chainEntry) {
  const v1 = {
    id:        _chronicleIdCounter++,
    year:      chainEntry.year,
    type:      chainEntry.type,
    title:     chainEntry.title,
    body:      chainEntry.description,
    tags:      chainEntry.tags,
    npcs:      chainEntry.npcs,
    sects:     chainEntry.sects,
    countries: chainEntry.countries,
    dynasty:   chainEntry.dynasty,
    chainId:   chainEntry.id,           // V2 link
    causeId:   chainEntry.causeId,
  };
  worldChronicle.push(v1);

  if (typeof addWorldHistory === "function") {
    addWorldHistory(chainEntry.type, chainEntry.title + " — " + chainEntry.description.slice(0, 100), {
      npcName:  chainEntry.npcs?.[0]  || null,
      sectName: chainEntry.sects?.[0] || null,
      chainId:  chainEntry.id,
    });
  }
  return v1;
}

// V1 legacy push (used by old callers still referencing _pushChronicle)
function _pushChronicle(type, title, body, meta = {}) {
  return _pushChain(type, title, body, meta);
}

// ================================================================
// V2: AI MEMORY SYSTEM
// ================================================================

function _rememberKill(killerName, victimName, year, reason) {
  aiMemory.kills.push({ killerName, victimName, year: year || _currentYear(), reason: reason || "chiến đấu" });
  _saveAIMemory();
}
function _rememberFounder(npcName, entityType, entityName) {
  aiMemory.founders.push({ npcName, entityType, entityName, year: _currentYear() });
  _saveAIMemory();
}
function _rememberBetrayal(betrayerName, victimName, context) {
  aiMemory.betrayals.push({ betrayerName, victimName, year: _currentYear(), context });
  _saveAIMemory();
}
function _rememberAlliance(npc1, npc2, type) {
  aiMemory.alliances.push({ npc1, npc2, year: _currentYear(), type });
  _saveAIMemory();
}

// Check if there's a pending revenge for a given killer
function _checkRevengeAvailable(targetName) {
  return revengeQueue.filter(r => r.targetName === targetName && r.triggerYear <= _currentYear());
}

// Queue a revenge event for future
function _queueRevenge(avengerName, targetName, triggerYear, reason, power) {
  revengeQueue.push({
    avengerName, targetName,
    triggerYear: triggerYear || _futureYear(10, 50),
    reason, power: power || 50,
    queued: _currentYear(),
  });
  _saveAIMemory();
}

// ================================================================
// V2: CONSEQUENCE ENGINE — tạo hậu quả dựa trên sự kiện gốc
// ================================================================

/**
 * scheduleConsequence — Lên lịch hậu quả tương lai
 * Sẽ tạo sự kiện kế tiếp khi _consequenceBuffer được xử lý
 */
let _consequenceBuffer = []; // [{triggerYear, generatorFn, causeId, meta}]

function _scheduleConsequence(triggerYear, generatorFn, causeId, meta = {}) {
  _consequenceBuffer.push({ triggerYear, generatorFn, causeId, meta });
}

function _processConsequenceBuffer() {
  const yr = _currentYear();
  const toFire = _consequenceBuffer.filter(c => c.triggerYear <= yr);
  _consequenceBuffer = _consequenceBuffer.filter(c => c.triggerYear > yr);
  toFire.forEach(c => {
    try { c.generatorFn(c.causeId, c.meta); } catch(e) {}
  });
}

// ================================================================
// V2: WORLD HISTORY GENERATORS — Based on real world data
// ================================================================

/**
 * generateWarChain — Chuỗi chiến tranh thực sự có nhân quả
 * Năm 0: Khai chiến
 * Năm +3..5: Hậu quả (mất lãnh địa, suy yếu)
 * Năm +7..12: Diệt môn hoặc phục hồi
 * Năm +20..30: Báo thù (nếu có)
 */
function generateWarChain() {
  // Try to use REAL sect data
  let sect1Obj = _randSectObj();
  let sect2Obj = null;
  if (typeof sects !== "undefined" && sects.length >= 2) {
    const pool = sects.filter(s => s !== sect1Obj);
    sect2Obj = pool.length ? _rand(pool) : null;
  }
  const sect1 = sect1Obj ? sect1Obj.name : _randSect();
  const sect2 = sect2Obj ? sect2Obj.name : _randSect();
  const [hero1, hero2] = _randName2();
  const place = sect1Obj ? (sect1Obj.territory || _rand(NARRATIVE_PLACES)) : _rand(NARRATIVE_PLACES);
  const cause = _rand(WAR_CAUSES);
  const days = _battleDays();
  const dead = _casualties();
  const skill = _rand(NARRATIVE_SKILLS);
  const winnerIsSect1 = Math.random() > 0.5;
  const winner = winnerIsSect1 ? sect1 : sect2;
  const loser  = winnerIsSect1 ? sect2 : sect1;
  const winHero = winnerIsSect1 ? hero1 : hero2;
  const loseHero = winnerIsSect1 ? hero2 : hero1;

  // EVENT 1: Khai chiến
  const warTitle = `${winner} phát động chiến tranh diệt ${loser}`;
  const warBody  =
    `Năm ${_currentYear()}, tại ${place}.\n` +
    `${winner} lấy cớ ${cause}, phát binh tiến đánh ${loser}.\n` +
    `${winHero} thống lĩnh đại quân — ${loseHero} tử thủ tại tông môn.\n` +
    `Trận chiến kéo dài ${days} ngày. Hơn ${dead.toLocaleString()} tu sĩ tử trận.\n` +
    `${winHero} thi triển ${skill} — ${loser} tổn thất nặng nề, buộc phải rút lui.`;

  const warEvent = _pushChain("war", warTitle, warBody, {
    location:     place,
    participants: [winner, loser, winHero, loseHero],
    npcs:         [winHero, loseHero],
    sects:        [winner, loser],
    tags:         ["war", "sect_battle", place],
    chainDepth:   0,
  });

  // Remember kill
  _rememberKill(winner, loseHero, _currentYear(), `chiến tranh vì ${cause}`);

  // EVENT 2: Hậu quả ngắn hạn — mất lãnh địa (3-5 năm sau)
  _scheduleConsequence(_futureYear(3, 5), (causeId) => {
    const yr = _currentYear();
    const lostTerritories = _randInt(1, 3);
    const body =
      `Năm ${yr}, hậu quả từ trận đại chiến năm ${warEvent.year}.\n` +
      `${loser} mất ${lostTerritories} lãnh địa chiến lược về tay ${winner}.\n` +
      `${loseHero} buộc phải rút về ẩn cư tại ${_rand(NARRATIVE_PLACES)}, chờ cơ hội phục hưng.\n` +
      `Nội bộ ${loser} phân rã — nhiều đệ tử bỏ tông quy phụ ${winner}.`;
    _pushChain("war", `${loser} mất ${lostTerritories} lãnh địa sau chiến bại`, body, {
      causeId, location: place, participants: [loser, winner],
      npcs: [loseHero], sects: [loser, winner], tags: ["war", "territory_loss"], chainDepth: 1,
    });
    // Update sect in world if possible
    if (sect2Obj && sect1Obj) {
      sect2Obj.prestige = Math.max(10, (sect2Obj.prestige || 100) - _randInt(200, 500));
      if (typeof save === "function") save();
    }
  }, warEvent.id);

  // EVENT 3: Suy yếu hoặc diệt môn (7-15 năm sau)
  const destroyLoser = _chance(0.45);
  _scheduleConsequence(_futureYear(7, 15), (causeId) => {
    const yr = _currentYear();
    if (destroyLoser) {
      const body =
        `Năm ${yr}, điều không thể tránh đã xảy ra.\n` +
        `${loser} — tông môn ${_randInt(50, 300)} năm tuổi — chính thức bị diệt môn.\n` +
        `${loseHero} — môn chủ cuối cùng — tử chiến bảo vệ tông môn, ngã xuống trong bi tráng.\n` +
        `${winner} thu toàn bộ tài sản, điển tịch, và Linh Mạch của ${loser}.\n` +
        `Một tông môn lừng lẫy đã biến mất khỏi lịch sử thiên hạ.`;
      _pushChain("sect", `${loser} diệt môn — kết thúc ${_randInt(50,300)} năm lịch sử`, body, {
        causeId, location: place, participants: [loser, winner, loseHero],
        npcs: [loseHero], sects: [loser, winner], tags: ["sect", "destroyed", "war_consequence"], chainDepth: 2,
      });
      _rememberKill(winner, loseHero, yr, "diệt tông");

      // Update worldLegends
      worldLegends.push({
        name: loseHero, title: `Môn chủ cuối cùng của ${loser}`,
        deeds: `Tử chiến bảo vệ ${loser} trước ${winner}`, year: yr, type: "fallen_hero",
      });

      // Queue revenge: hậu duệ báo thù (20-40 năm sau)
      if (_chance(0.6)) {
        _queueRevenge(`Hậu duệ ${loser}`, winner, _futureYear(20, 40),
          `báo thù cho ${loseHero} và ${loser}`, 60);
      }
    } else {
      const body =
        `Năm ${yr}, ${loser} vẫn tồn tại nhưng suy yếu nghiêm trọng sau chiến bại ${_currentYear() - 7} năm trước.\n` +
        `Số đệ tử giảm còn ${_randInt(10, 50)} người — không đủ sức phục thù.\n` +
        `${loseHero} đóng cửa ẩn tu, tìm kiếm cơ duyên đột phá để chấn hưng tông môn.\n` +
        `Huyết thù giữa ${loser} và ${winner} vẫn âm ỉ cháy — chờ ngày bùng phát.`;
      _pushChain("sect", `${loser} suy yếu — ${loseHero} ẩn tu phục thù`, body, {
        causeId, location: place, participants: [loser, loseHero],
        npcs: [loseHero], sects: [loser], tags: ["sect", "weakened", "war_consequence"], chainDepth: 2,
      });
      // Queue revenge (30-60 năm sau)
      _queueRevenge(loseHero, winner, _futureYear(30, 60), `phục thù ${loser}`, 70);
    }
  }, warEvent.id);

  renderWorldChronicle && renderWorldChronicle();
  return warEvent;
}

/**
 * generateRevengeChain — Báo thù từ revengeQueue
 */
function generateRevengeChain(causeId = null, meta = {}) {
  const yr = _currentYear();
  const pending = revengeQueue.filter(r => r.triggerYear <= yr);
  if (!pending.length) return null;

  const rev = pending[0];
  revengeQueue = revengeQueue.filter(r => r !== rev);

  const success = _chance(rev.power / 100);
  const place = _rand(NARRATIVE_PLACES);
  const skill = _rand(NARRATIVE_SKILLS);

  if (success) {
    const body =
      `Năm ${yr}, máu và lửa báo thù bùng cháy.\n` +
      `${rev.avengerName} — sau ${yr - rev.queued} năm ẩn nhẫn chờ đợi — cuối cùng xuất hiện.\n` +
      `Mục tiêu: ${rev.targetName}. Lý do: ${rev.reason}.\n` +
      `${rev.avengerName} thi triển ${skill}, phá tan phòng thủ ${rev.targetName}.\n` +
      `Huyết thù ${yr - rev.queued} năm được trả — thiên hạ kinh hoàng trước màn báo thù này.`;
    const revEvent = _pushChain("war", `${rev.avengerName} báo thù ${rev.targetName} thành công`, body, {
      causeId: causeId || rev.causeId || null,
      location: place, participants: [rev.avengerName, rev.targetName],
      npcs: [rev.avengerName], tags: ["revenge", "success"], chainDepth: (meta.chainDepth || 0) + 1,
    });
    aiMemory.revenges.push({ avengerId: rev.avengerName, targetName: rev.targetName, year: yr, success: true });
    _rememberKill(rev.avengerName, rev.targetName, yr, `báo thù — ${rev.reason}`);

    // Hậu quả tiếp theo: kẻ bị báo thù có hậu duệ không?
    if (_chance(0.4)) {
      _scheduleConsequence(_futureYear(15, 35), (cid) => {
        const body2 =
          `Năm ${_currentYear()}, vòng xoáy báo thù tiếp tục.\n` +
          `Hậu duệ của ${rev.targetName} trưởng thành, nghe tin về cái chết của tổ tiên.\n` +
          `Họ thề sẽ báo thù ${rev.avengerName} — một chu kỳ máu mới bắt đầu.`;
        _pushChain("war", `Hậu duệ ${rev.targetName} thề báo thù ${rev.avengerName}`, body2, {
          causeId: cid, participants: [rev.targetName, rev.avengerName],
          tags: ["revenge", "cycle"], chainDepth: (meta.chainDepth || 0) + 2,
        });
        _queueRevenge(`Hậu duệ ${rev.targetName}`, rev.avengerName, _futureYear(20, 50), "báo thù tổ tiên", 50);
      }, revEvent.id);
    }
    return revEvent;
  } else {
    const body =
      `Năm ${yr}, ${rev.avengerName} phát động báo thù nhưng thất bại thảm hại.\n` +
      `Sau ${yr - rev.queued} năm chuẩn bị, ${rev.avengerName} vẫn không đủ sức đối đầu ${rev.targetName}.\n` +
      `${rev.avengerName} bị thương nặng, buộc phải tháo chạy.\n` +
      `Huyết thù chưa được trả — nhưng ngọn lửa báo thù vẫn cháy trong lòng.`;
    const failEvent = _pushChain("war", `${rev.avengerName} báo thù thất bại`, body, {
      causeId: causeId || null,
      location: place, participants: [rev.avengerName, rev.targetName],
      npcs: [rev.avengerName], tags: ["revenge", "failed"], chainDepth: (meta.chainDepth || 0) + 1,
    });
    aiMemory.revenges.push({ avengerName: rev.avengerName, targetName: rev.targetName, year: yr, success: false });
    // Retry revenge later
    _queueRevenge(rev.avengerName, rev.targetName, _futureYear(20, 40), rev.reason, Math.min(95, rev.power + 20));
    return failEvent;
  }
}

/**
 * generateDynastyChain — Lịch sử gia tộc có arc dài
 */
function generateDynastyChain() {
  let dynastySurname = null;
  if (typeof dynasties !== "undefined") {
    const keys = Object.keys(dynasties);
    if (keys.length) dynastySurname = _rand(keys);
  }
  if (!dynastySurname) dynastySurname = _rand(["Lâm","Long","Hàn","Tần","Mặc","Thiên","Vô","Kiếm"]);
  const dynastyName = `Gia Tộc ${dynastySurname}`;
  const hero = _randName();
  const place = _rand(NARRATIVE_PLACES);

  // Determine dynasty phase based on real data
  const dynastyObj = (typeof dynasties !== "undefined") ? dynasties[dynastySurname] : null;
  const status = dynastyObj ? (dynastyObj.status || "stable") : _rand(["rising","stable","declining","fallen"]);

  // Initialize dynasty history if not exists
  if (!aiMemory.dynastyHistory[dynastySurname]) {
    aiMemory.dynastyHistory[dynastySurname] = {
      founded: _currentYear() - _randInt(50, 500),
      founders: [hero],
      peaks: [], declines: [], destructions: [], revivals: [],
    };
  }
  const dh = aiMemory.dynastyHistory[dynastySurname];

  let title, body, eventType = "civilization";

  if (status === "rising" || status === "thriving") {
    // Thời kỳ cực thịnh
    dh.peaks.push(_currentYear());
    const gen = dynastyObj ? dynastyObj.generations : _randInt(3, 15);
    const realm = _randHighRealm();
    title = `${dynastyName} đạt đỉnh cực thịnh — ${gen} thế hệ hưng vượng`;
    body =
      `Năm ${_currentYear()}, ${dynastyName} bước vào thời kỳ hoàng kim.\n` +
      `Trải qua ${gen} thế hệ, gia tộc sản sinh ra vô số thiên tài, trong đó có ${hero}.\n` +
      `${hero} đạt cảnh giới ${realm}, trở thành trụ cột vững chắc của ${dynastyName}.\n` +
      `Thiên hạ bắt đầu tôn gọi "${dynastyName}" là Thiên Hạ Đệ Nhất Gia Tộc.\n` +
      `Lãnh thổ mở rộng đến ${place} — ảnh hưởng bao trùm cả vùng.`;

    // Schedule future decline
    _scheduleConsequence(_futureYear(80, 200), (causeId) => {
      const body2 =
        `Năm ${_currentYear()}, ${dynastyName} bắt đầu suy tàn sau thời kỳ cực thịnh.\n` +
        `Thế hệ kế tiếp không có thiên tài nổi bật như ${hero}.\n` +
        `Nội bộ phân tranh, tài nguyên cạn dần. Các thế lực bên ngoài nhòm ngó.\n` +
        `Một kỷ nguyên huy hoàng dần khép lại.`;
      _pushChain("civilization", `${dynastyName} bắt đầu suy tàn`, body2, {
        causeId, dynasty: dynastySurname, npcs: [hero],
        tags: ["dynasty", "decline"], chainDepth: 1,
      });
      aiMemory.dynastyHistory[dynastySurname]?.declines.push(_currentYear());
    }, null);

  } else if (status === "declining") {
    dh.declines.push(_currentYear());
    title = `${dynastyName} suy tàn — thế hệ cuối chống đỡ`;
    body =
      `Năm ${_currentYear()}, ${dynastyName} không còn là cường gia năm xưa.\n` +
      `${hero} — hậu duệ dòng chính — cố gắng gánh vác giang sơn đang sụp đổ.\n` +
      `Số thành viên giảm mạnh. Kẻ thù từ bốn phương nhân cơ hội đánh chiếm lãnh địa.\n` +
      `${hero} thề trước bàn thờ tổ tiên: "Sẽ không để ${dynastyName} tuyệt diệt!"`;

    // Schedule destruction or revival
    if (_chance(0.5)) {
      _scheduleConsequence(_futureYear(30, 80), (causeId) => {
        const body2 =
          `Năm ${_currentYear()}, ${dynastyName} bị diệt tộc hoàn toàn.\n` +
          `${hero} ngã xuống trong trận chiến tuyệt vọng bảo vệ gia tộc.\n` +
          `Huyết mạch cuối cùng của ${dynastyName} đã dứt — lịch sử khép lại trang bi tráng.\n` +
          `Nhưng... tương truyền có một hài nhi được bí mật đưa ra ngoài trước khi gia tộc sụp đổ.`;
        _pushChain("civilization", `${dynastyName} bị diệt tộc — huyết mạch tuyệt diệt`, body2, {
          causeId, dynasty: dynastySurname, npcs: [hero],
          tags: ["dynasty", "destroyed"], chainDepth: 2,
        });
        aiMemory.dynastyHistory[dynastySurname]?.destructions.push(_currentYear());
        // Queue revival after long time
        _queueRevenge(`Hậu duệ bí ẩn ${dynastySurname}`, `Kẻ diệt ${dynastyName}`, _futureYear(50, 150), "phục hưng gia tộc", 40);
      }, null);
    }

  } else if (status === "fallen") {
    title = `Hậu duệ ${dynastyName} xuất hiện — phục hưng gia tộc`;
    body =
      `Năm ${_currentYear()}, một tin chấn động lan khắp thiên hạ.\n` +
      `${hero} — người tự xưng là hậu duệ cuối cùng của ${dynastyName} đã bị diệt tộc năm xưa — xuất hiện.\n` +
      `Hắn mang theo Tộc Ấn và bí lục của gia tộc, tuyên bố phục hưng ${dynastyName}.\n` +
      `Không ai tin vào thành công — nhưng ngọn lửa hy vọng đã được thắp lên.`;
    eventType = "civilization";
    dh.revivals.push(_currentYear());
    worldLegends.push({
      name: hero, title: `Người phục hưng ${dynastyName}`,
      deeds: `Tái thiết gia tộc sau khi bị diệt tộc`, year: _currentYear(), type: "revival",
    });

  } else {
    // Default: foundation story
    const years = _randInt(50, 300);
    title = `${dynastyName} lập quốc — kỷ nguyên mới bắt đầu`;
    body =
      `Năm ${_currentYear()}, tại ${place}.\n` +
      `Sau ${years} năm tích lũy qua nhiều thế hệ, ${dynastyName} đủ mạnh để xưng quốc.\n` +
      `${hero} — người kế thừa kiệt xuất — tuyên bố lập quốc, đặt tên Vương Quốc.\n` +
      `Vạn dân quy tụ. Một thế lực mới đã ra đời.`;
    dh.founders.push(hero);
    _rememberFounder(hero, "quốc gia", dynastyName);
    worldLegends.push({
      name: hero, title: `Người lập quốc ${dynastyName}`,
      deeds: `Sáng lập vương triều sau ${years} năm tích lũy`, year: _currentYear(), type: "founder",
    });
  }

  const ev = _pushChain(eventType, title, body, {
    dynasty: dynastySurname, location: place, participants: [dynastyName, hero],
    npcs: [hero], tags: ["dynasty", "civilization", dynastySurname],
  });
  _saveAIMemory();
  return ev;
}

/**
 * generateSectChain — Lịch sử tông môn có arc dài
 */
function generateSectChain() {
  const sectObj = _randSectObj();
  const sectName = sectObj ? sectObj.name : _rand(["Thiên Hư Tông","Vạn Linh Môn","Cửu Thiên Các","Hắc Ám Hội","Linh Kiếm Tông","Tiêu Dao Phái","Cổ Nguyên Tông","Thái Hư Cung"]);
  const place = sectObj ? (sectObj.territory || _rand(NARRATIVE_PLACES)) : _rand(NARRATIVE_PLACES);
  const founder = _randName();
  const currentLeader = _randName();

  if (!aiMemory.sectHistory[sectName]) {
    aiMemory.sectHistory[sectName] = {
      founder, foundYear: _currentYear() - _randInt(20, 500),
      leaders: [founder], peaks: [], declines: [], destructions: [], revivals: [],
    };
  }
  const sh = aiMemory.sectHistory[sectName];

  const phase = _rand(["founding", "peak", "decline", "destroyed", "revival"]);
  let title, body;

  if (phase === "founding") {
    sh.leaders.push(currentLeader);
    _rememberFounder(founder, "tông môn", sectName);
    const members = _randInt(100, 5000);
    title = `${founder} sáng lập ${sectName} tại ${place}`;
    body =
      `Năm ${_currentYear()}, tại ${place}.\n` +
      `${founder} — sau nhiều năm độc hành thiên hạ — quyết định lập tông môn.\n` +
      `${sectName} khai môn với ${members.toLocaleString()} đệ tử ban đầu. Tông chỉ: "Đạo Tâm Vĩnh Cửu".\n` +
      `Thiên hạ chú mục đến ngôi tông môn mới đầy triển vọng này.`;
    // Schedule future events
    _scheduleConsequence(_futureYear(50, 150), (causeId) => {
      sh.peaks.push(_currentYear());
      const body2 =
        `Năm ${_currentYear()}, ${sectName} đạt đỉnh cực thịnh.\n` +
        `Dưới sự lãnh đạo của ${currentLeader} — kế thừa ${founder} — tông môn sản sinh ${_randInt(3,10)} Đại Thừa cao thủ.\n` +
        `Thiên hạ xếp ${sectName} vào hàng Tiên Tông — danh tiếng vang dội bốn phương.`;
      _pushChain("sect", `${sectName} đạt đỉnh cực thịnh dưới tay ${currentLeader}`, body2, {
        causeId, sects: [sectName], npcs: [currentLeader], tags: ["sect", "peak"], chainDepth: 1,
      });
    }, null);

  } else if (phase === "peak") {
    sh.peaks.push(_currentYear());
    const realmName = _randHighRealm();
    const disciples = _randInt(3, 15);
    title = `${sectName} kỷ nguyên hưng thịnh — ${disciples} Đại Thừa xuất thế`;
    body =
      `Năm ${_currentYear()}, ${sectName} bước vào thời kỳ hoàng kim chưa từng có.\n` +
      `${currentLeader} — tông chủ đời thứ ${sh.leaders.length} — dẫn dắt ${disciples} cao thủ cảnh giới ${realmName}.\n` +
      `Lãnh thổ ${sectName} trải dài từ ${place} đến ${_rand(NARRATIVE_PLACES)}.\n` +
      `Các đại tông phái đều phải kiêng nể — đây là thời đại hoàng kim của ${sectName}.`;

  } else if (phase === "decline") {
    sh.declines.push(_currentYear());
    const [rival] = _randSect2();
    title = `${sectName} suy yếu — ${rival} nhân cơ đánh chiếm`;
    body =
      `Năm ${_currentYear()}, ${sectName} bước vào giai đoạn suy tàn.\n` +
      `Tông chủ ${currentLeader} bị thương nặng trong trận chiến chống ${rival}.\n` +
      `Nội bộ lục đục — nhiều trưởng lão có ý đồ riêng. Đệ tử ưu tú lần lượt rời bỏ.\n` +
      `${rival} nhân cơ hội chiếm đoạt hai vùng lãnh địa chiến lược.`;
    _queueRevenge(currentLeader, rival, _futureYear(20, 50), `phục thù ${sectName}`, 55);

  } else if (phase === "destroyed") {
    sh.destructions.push(_currentYear());
    const [attacker] = _randSect2();
    title = `${sectName} bị diệt môn — bi kịch thiên hạ`;
    body =
      `Năm ${_currentYear()}, tin dữ truyền khắp giang hồ.\n` +
      `${sectName} — tông môn ${_currentYear() - sh.foundYear} năm lịch sử — bị ${attacker} xóa sổ.\n` +
      `${currentLeader} chiến đấu đến hơi thở cuối cùng để bảo vệ đệ tử và điển tịch.\n` +
      `Toàn bộ Thánh Địa ${sectName} bị thiêu rụi. Huyết hận này chắc chắn sẽ được báo thù.`;
    _rememberKill(attacker, currentLeader, _currentYear(), `diệt tông ${sectName}`);
    _queueRevenge(`Hậu nhân ${sectName}`, attacker, _futureYear(30, 80), `báo thù diệt tông`, 65);
    worldLegends.push({
      name: currentLeader, title: `Tông chủ cuối cùng của ${sectName}`,
      deeds: `Tử chiến bảo vệ ${sectName}`, year: _currentYear(), type: "fallen_hero",
    });

  } else { // revival
    sh.revivals.push(_currentYear());
    title = `${sectName} phục hưng — lửa đạo không tắt`;
    body =
      `Năm ${_currentYear()}, thiên hạ kinh ngạc trước tin ${sectName} phục hưng.\n` +
      `${currentLeader} — người tự xưng là truyền nhân cuối cùng — thu thập di tịch và đệ tử cũ.\n` +
      `${sectName} tái khai môn tại ${place} với quyết tâm "Không Để Đạo Thống Đứt Đoạn".\n` +
      `Hành trình phục hưng đầy gian nan đã bắt đầu.`;
    worldLegends.push({
      name: currentLeader, title: `Người phục hưng ${sectName}`,
      deeds: `Tái thiết tông môn sau thời kỳ hủy diệt`, year: _currentYear(), type: "revival",
    });
  }

  const ev = _pushChain("sect", title, body, {
    sects: [sectName], npcs: [currentLeader, founder].filter((v,i,a) => a.indexOf(v) === i),
    location: place, tags: ["sect", phase], chainDepth: 0,
  });
  _saveAIMemory();
  return ev;
}

/**
 * generateKingdomChain — Lịch sử quốc gia
 */
function generateKingdomChain() {
  let countryName = null;
  if (typeof countries !== "undefined" && countries.length) {
    countryName = _rand(countries).name;
  }
  if (!countryName) countryName = _rand(["Đại Hạ","Thiên Đế","Huyết Nguyệt","Thần Phong","Vạn Kiếm","Bắc Minh"]) + " Quốc";

  if (!aiMemory.kingdomHistory[countryName]) {
    aiMemory.kingdomHistory[countryName] = {
      founder: null, foundYear: _currentYear() - _randInt(50, 1000),
      rulers: [], wars: [], expansions: [], falls: [],
    };
  }
  const kh = aiMemory.kingdomHistory[countryName];

  const founder = _randName();
  const currentRuler = _randName();
  const rival = typeof countries !== "undefined" && countries.length >= 2
    ? _rand(countries.filter(c => c.name !== countryName))?.name || _rand(["Đông Minh","Tây Phong","Nam Hoàng"]) + " Quốc"
    : _rand(["Đông Minh","Tây Phong","Nam Hoàng"]) + " Quốc";

  const phase = kh.founder ? _rand(["war", "expansion", "succession", "fall"]) : "founding";
  let title, body;

  if (phase === "founding") {
    kh.founder = founder;
    kh.rulers.push({ name: founder, yearStart: _currentYear(), yearEnd: null });
    _rememberFounder(founder, "quốc gia", countryName);
    worldLegends.push({
      name: founder, title: `Khai Quốc Đế của ${countryName}`,
      deeds: `Thống nhất các thế lực, sáng lập ${countryName}`, year: _currentYear(), type: "founder",
    });
    title = `${founder} sáng lập ${countryName} — kỷ nguyên mới`;
    body =
      `Năm ${_currentYear()}, thiên hạ thay đổi mãi mãi.\n` +
      `${founder} — sau ${_randInt(10, 50)} năm chinh chiến — thống nhất các thế lực phân tán.\n` +
      `${countryName} chính thức được lập quốc. ${founder} lên ngôi Khai Quốc Đế.\n` +
      `Quốc hiệu "${countryName}" từ nay trở thành biểu tượng của một thời đại.`;

  } else if (phase === "war") {
    kh.wars.push({ year: _currentYear(), against: rival });
    title = `${countryName} phát động quốc chiến với ${rival}`;
    body =
      `Năm ${_currentYear()}, Hoàng Đế ${currentRuler} của ${countryName} tuyên chiến với ${rival}.\n` +
      `Lý do: tranh đoạt ${_rand(["vùng đất màu mỡ","Linh Mạch chiến lược","thương lộ quan trọng","vùng biển khoáng sản"])}.\n` +
      `Hàng vạn quân tinh nhuệ xuất chinh. Cả hai bên đều huy động tất cả cường giả tu tiên.\n` +
      `Đây là cuộc chiến sẽ định hình lại bản đồ thiên hạ trong nhiều thế kỷ tới.`;
    kh.wars.at(-1).outcome = _chance(0.55) ? "victory" : "defeat";
    if (kh.wars.at(-1).outcome === "victory") {
      _scheduleConsequence(_futureYear(5, 15), (causeId) => {
        kh.expansions.push(_currentYear());
        _pushChain("civilization", `${countryName} mở rộng lãnh thổ sau chiến thắng`, 
          `Năm ${_currentYear()}, ${countryName} sáp nhập lãnh thổ ${rival}.\n${currentRuler} trở thành vị vua vĩ đại nhất lịch sử ${countryName}.`,
          { causeId, countries: [countryName], tags: ["kingdom", "expansion"], chainDepth: 1 });
      }, null);
    }

  } else if (phase === "succession") {
    const newRuler = _randName();
    kh.rulers.push({ name: newRuler, yearStart: _currentYear(), yearEnd: null });
    title = `${countryName} thay đổi quyền lực — ${newRuler} lên ngôi`;
    body =
      `Năm ${_currentYear()}, Hoàng Đế ${currentRuler} của ${countryName} băng hà sau ${_randInt(20,80)} năm trị vì.\n` +
      `Cuộc tranh giành kế vị bùng nổ giữa nhiều hoàng tử. Máu đổ trong cung đình.\n` +
      `Cuối cùng, ${newRuler} đánh bại tất cả đối thủ, lên ngôi Hoàng Đế.\n` +
      `Kỷ nguyên mới của ${countryName} bắt đầu — vận mệnh quốc gia sẽ về đâu?`;
    if (_chance(0.3)) {
      _rememberBetrayal(_randName(), currentRuler, `tranh giành ngôi vị ${countryName}`);
    }

  } else { // fall
    kh.falls.push(_currentYear());
    title = `${countryName} sụp đổ — kết thúc một triều đại`;
    body =
      `Năm ${_currentYear()}, đế quốc ${countryName} sụp đổ hoàn toàn.\n` +
      `${currentRuler} — vị Hoàng Đế cuối cùng — không thể ngăn chặn làn sóng xâm lăng của ${rival}.\n` +
      `Kinh đô thất thủ. ${currentRuler} tự mình chọn cái chết thay vì đầu hàng.\n` +
      `${countryName} — ${_currentYear() - kh.foundYear} năm lịch sử — chính thức đi vào quá khứ.`;
    worldLegends.push({
      name: currentRuler, title: `Hoàng Đế cuối cùng của ${countryName}`,
      deeds: `Tử vì quốc, từ chối đầu hàng trước ${rival}`, year: _currentYear(), type: "fallen_hero",
    });
    _rememberKill(rival, currentRuler, _currentYear(), `diệt quốc ${countryName}`);
    _queueRevenge(`Dòng tộc Hoàng Gia ${countryName}`, rival, _futureYear(30, 100), "phục quốc", 45);
  }

  const ev = _pushChain("civilization", title, body, {
    countries: [countryName], npcs: [currentRuler, founder],
    tags: ["kingdom", phase, countryName], chainDepth: 0,
  });
  _saveAIMemory();
  return ev;
}

// ================================================================
// V1 COMPAT GENERATORS — Kept intact, now backed by chain system
// ================================================================

function generateBreakthroughStory() {
  const npcObj = _randNPCObj();
  const name = npcObj ? npcObj.name : _randName();
  const realm = npcObj ? (typeof REALMS !== "undefined" ? (REALMS[Math.min((npcObj.realm||0)+1, REALMS.length-1)]?.name || _randHighRealm()) : _randHighRealm()) : _randHighRealm();
  const place = _rand(NARRATIVE_PLACES);
  const years = _retreatYears();
  const reason = _rand(RETREAT_REASONS);
  const skill = _rand(NARRATIVE_SKILLS);
  const title = _rand(NARRATIVE_TITLES);

  const templates = [
    {
      title: `${name} đột phá ${realm} sau ${years} năm bế quan`,
      body: `Năm ${_currentYear()}, tại ${place}.\n${name} sau ${years} năm bế quan ${reason}, cuối cùng đã khai phá cảnh giới ${realm}.\nHào quang trời đất kết tụ, thiên lôi chín lần giáng xuống — hắn vượt qua tất cả, xuất quan với thần thông ${skill}.\nThiên hạ chấn động. Người ta gọi hắn là ${title} của thế hệ này.`,
    },
    {
      title: `${name} cảm ngộ Thiên Đạo tại ${place}`,
      body: `Năm ${_currentYear()}, tại ${place}.\n${name} độc tọa dưới cổ thụ vạn năm, tâm thần trống rỗng, nhất niệm không khởi.\nBa năm sau đó, khi hắn mở mắt — cảnh giới ${realm} đã trong tầm tay.\n${skill} khai sáng, đạo ý thuần thục. Vô số tu sĩ ngưỡng vọng từ xa.`,
    },
  ];
  const chosen = _rand(templates);
  const ev = _pushChain("breakthrough", chosen.title, chosen.body, {
    npcs: [name], tags: ["breakthrough", "cultivation", place], location: place,
    participants: [name],
  });

  // Check if this NPC will become a legend
  if (npcObj && npcObj.realm >= 7) {
    worldLegends.push({
      name, title: `${title} - ${realm}`,
      deeds: `Đột phá ${realm} tại ${place}`, year: _currentYear(), type: "cultivator",
    });
  }
  return ev;
}

function generateWarStory() {
  // V2: prefer chain war (30% chance), else fallback to V1-style
  if (_chance(0.4) && (typeof sects !== "undefined" && sects.length >= 2)) {
    return generateWarChain();
  }
  const [sect1, sect2] = _randSect2();
  const [hero1, hero2] = _randName2();
  const place = _rand(NARRATIVE_PLACES);
  const days = _battleDays();
  const dead = _casualties();
  const cause = _rand(WAR_CAUSES);
  const outcome = _rand(WAR_OUTCOMES);
  const skill = _rand(NARRATIVE_SKILLS);
  const winner = Math.random() > 0.5 ? sect1 : sect2;
  const loser  = winner === sect1 ? sect2 : sect1;
  const winHero = winner === sect1 ? hero1 : hero2;
  const body =
    `Năm ${_currentYear()}, tại ${place}.\n` +
    `${sect1} dẫn đại quân tiến đánh ${sect2} vì ${cause}.\n` +
    `${hero1} thống lĩnh tiền quân, ${hero2} tử thủ tại cổng tông môn.\n` +
    `Trận chiến kéo dài ${days} ngày. Hơn ${dead.toLocaleString()} tu sĩ tử trận.\n` +
    `Cuối cùng, ${winHero} thi triển ${skill} — ${loser} ${outcome}.`;
  return _pushChain("war", `Đại chiến ${sect1} vs ${sect2} tại ${place}`, body, {
    npcs: [hero1, hero2], sects: [sect1, sect2], tags: ["war", place],
    location: place, participants: [sect1, sect2, hero1, hero2],
  });
}

function generateDynastyStory() {
  return generateDynastyChain();
}

function generateSectStory() {
  return generateSectChain();
}

function generateLegendStory() {
  const name = _randName();
  const title = _rand(NARRATIVE_TITLES);
  const realm = _randHighRealm();
  const place = _rand(NARRATIVE_PLACES);
  const deed = _rand(LEGEND_DEEDS);
  const weapon = _rand(NARRATIVE_WEAPONS);
  const years = _retreatYears();
  const era = _rand(ERA_NAMES);

  const body =
    `Năm ${_currentYear()}, tại ${place}.\n` +
    `${name} — người được thiên hạ tôn xưng là ${title} — đạt đến cảnh giới ${realm}.\n` +
    `Hắn ${deed}.\n` +
    `Cây ${weapon} của hắn được lưu truyền ngàn năm. Sau đó, ${name} ẩn thân vào ${place}, không ai biết tung tích.`;

  worldLegends.push({ name, title: `${title} - ${era}`, deeds: deed, year: _currentYear(), type: "legend" });

  return _pushChain("heavenly", `Truyền thuyết ${name} — ${title} của ${era}`, body, {
    npcs: [name], tags: ["legend", "myth", title, place], location: place,
    participants: [name],
  });
}

function generateBossStory() {
  const hero = _randName();
  const beast = _rand(BEAST_NAMES);
  const place = _rand(NARRATIVE_PLACES);
  const days = _battleDays();
  const skill = _rand(NARRATIVE_SKILLS);
  const nDeaths = _randInt(10, 500);
  const [sect1] = _randSect2();
  const body =
    `Năm ${_currentYear()}, ${beast} xuất hiện tại ${place}, tàn phá muôn dặm.\n` +
    `Vô số tu sĩ đã thử sức nhưng đều thất bại — ${nDeaths} người tử trận.\n` +
    `Cuối cùng, ${hero} từ ${sect1} một mình xuất chiến.\n` +
    `Trận chiến kéo dài ${days} ngày. ${hero} thi triển ${skill} — ${beast} tử trận.\n` +
    `Thần thú huyết tủy được ${hero} hấp thụ, cảnh giới đột phá vượt bậc.`;
  return _pushChain("boss", `${hero} một mình hạ ${beast} tại ${place}`, body, {
    npcs: [hero], sects: [sect1], tags: ["boss", "beast", place, beast],
    location: place, participants: [hero, beast],
  });
}

function generateMarriageStory() {
  const [name1, name2] = _randName2();
  const place = _rand(NARRATIVE_PLACES);
  const [sect1, sect2] = _randSect2();
  _rememberAlliance(name1, name2, "đạo lữ");
  const body =
    `Năm ${_currentYear()}, tại ${place}.\n` +
    `${name1} của ${sect1} và ${name2} của ${sect2} chính thức kết thành đạo lữ.\n` +
    `Hai người từng là đối thủ, nhưng cùng trải qua sinh tử chiến, tâm ý tương thông.\n` +
    `Lễ thành đạo có sự chứng kiến của hàng nghìn tu sĩ. Thiên hoa rơi, linh khí kết tụ.\n` +
    `Từ đây, liên minh ${sect1} và ${sect2} được thiết lập — cục diện thiên hạ thay đổi.`;
  return _pushChain("marriage", `${name1} và ${name2} kết đạo lữ tại ${place}`, body, {
    npcs: [name1, name2], sects: [sect1, sect2], tags: ["marriage", "alliance", place],
    location: place, participants: [name1, name2],
  });
}

function generateDeathStory() {
  const npcObj = _randNPCObj();
  const name = npcObj ? npcObj.name : _randName();
  const realm = npcObj ? (typeof REALMS !== "undefined" ? REALMS[npcObj.realm]?.name : _randHighRealm()) : _randHighRealm();
  const place = _rand(NARRATIVE_PLACES);
  const cause = _rand(["tâm ma phát tác trong lúc đột phá","trúng độc bởi kẻ thù ám toán","hy sinh để phong ấn Ma Vương","ngã xuống khi bảo vệ tông môn","thất bại trước Thiên Kiếm Ách","cứu đại lục khỏi kiếp diệt thế","tử chiến cùng cổ địch vạn năm","thiêu thân mình để phá giải đại trận"]);
  const body =
    `Năm ${_currentYear()}, tại ${place}.\n` +
    `${name} — tu sĩ cảnh giới ${realm || "cao cấp"} — đã từ biệt thiên địa.\n` +
    `Nguyên nhân: ${cause}.\n` +
    `Trước khi ngã xuống, hắn để lại một câu: "Đạo Tâm Bất Diệt — Ta Vô Hối Hận."\n` +
    `Toàn thiên hạ để tang.`;

  // Check if NPC has family/sect that might want revenge
  if (npcObj) {
    const killerHint = cause.includes("kẻ thù") ? _randName() : null;
    if (killerHint) {
      _rememberKill(killerHint, name, _currentYear(), cause);
      if (npcObj.childrenIds?.length || npcObj.discipleIds?.length) {
        _queueRevenge(
          npcObj.childrenIds?.length ? `Con ${name}` : `Đệ tử ${name}`,
          killerHint, _futureYear(15, 40), `báo thù cho ${name}`, 50
        );
      }
    }
  }

  return _pushChain("death", `${name} [${realm||"Cao Thủ"}] ngã xuống tại ${place}`, body, {
    npcs: [name], tags: ["death", "tragedy", place],
    location: place, participants: [name],
  });
}

function generateHeavenlyStory() {
  const era = _rand(ERA_NAMES);
  const place = _rand(NARRATIVE_PLACES);
  const name = _randName();
  const years = _randInt(100, 1000);
  const templates = [
    {
      title: `Thiên Địa khai mở — ${era} bắt đầu`,
      body: `Năm ${_currentYear()}, Thiên Đạo biến chuyển.\nMột kỷ nguyên mới bắt đầu: ${era}.\nLinh khí thiên địa tăng gấp đôi, vô số tu sĩ nhân đó đột phá.\nTại ${place}, trụ thiên linh nhật xuất hiện — báo hiệu vận hội ngàn năm mới.`,
    },
    {
      title: `Thiên Kiếp giáng xuống — ${years} năm đại loạn`,
      body: `Năm ${_currentYear()}, thiên địa biến sắc.\nThiên Đạo giáng Kiếp — bắt đầu thời kỳ đại loạn ${years} năm.\nLinh khí cạn kiệt, thiên tai liên tiếp. Vô số tông môn suy vong.\n${name} được tiên tri là người có thể kết thúc Thiên Kiếp — hành trình của hắn bắt đầu.`,
    },
  ];
  const chosen = _rand(templates);
  return _pushChain("heavenly", chosen.title, chosen.body, {
    npcs: [name], tags: ["heavenly", "era", "divine", era], location: place, participants: [name, era],
  });
}

// ================================================================
// MAIN ENTRY: generateStoryEvent — V2 Smart Dispatcher
// ================================================================

function generateStoryEvent() {
  // Process any pending consequences first
  _processConsequenceBuffer();

  // Check revenge queue (15% chance to fire a revenge if available)
  const yr = _currentYear();
  const pendingRevenge = revengeQueue.filter(r => r.triggerYear <= yr);
  if (pendingRevenge.length && _chance(0.3)) {
    return generateRevengeChain();
  }

  // Weight by world state
  const weights = _buildEventWeights();
  const roll = Math.random();
  let cum = 0;
  for (const [type, weight] of weights) {
    cum += weight;
    if (roll < cum) {
      const generators = {
        breakthrough: generateBreakthroughStory,
        war:          generateWarStory,
        sect:         generateSectChain,
        boss:         generateBossStory,
        marriage:     generateMarriageStory,
        death:        generateDeathStory,
        heavenly:     generateHeavenlyStory,
        civilization: generateDynastyChain,
        kingdom:      generateKingdomChain,
        legend:       generateLegendStory,
      };
      return (generators[type] || generateBreakthroughStory)();
    }
  }
  return generateBreakthroughStory();
}

function _buildEventWeights() {
  // Dynamic weights based on world state
  const hasSects = typeof sects !== "undefined" && sects.length >= 2;
  const hasNPCs  = typeof npcs  !== "undefined" && npcs.length  >= 3;
  const hasDynasties = typeof dynasties !== "undefined" && Object.keys(dynasties).length >= 1;
  const hasCountries = typeof countries !== "undefined" && countries.length >= 1;
  const pendingRevenge = revengeQueue.filter(r => r.triggerYear <= _currentYear()).length;

  return [
    ["breakthrough", hasNPCs  ? 0.22 : 0.28],
    ["war",          hasSects ? 0.20 : 0.10],
    ["sect",         hasSects ? 0.12 : 0.08],
    ["boss",         0.08],
    ["marriage",     hasNPCs  ? 0.07 : 0.03],
    ["death",        hasNPCs  ? 0.08 : 0.04],
    ["heavenly",     0.07],
    ["civilization", hasDynasties ? 0.08 : 0.04],
    ["kingdom",      hasCountries ? 0.06 : 0.02],
    ["legend",       0.02],
  ];
}

// ================================================================
// BATCH GENERATION
// ================================================================

function generateWorldChronicleEpoch(startYear, endYear, density = 1) {
  if (typeof year === "undefined") return [];
  const events = [];
  const span = endYear - startYear;
  const count = Math.floor(span * density / 100) + _randInt(3, 8);
  for (let i = 0; i < count; i++) {
    window._storyOverrideYear = startYear + Math.floor(Math.random() * span);
    events.push(generateStoryEvent());
    window._storyOverrideYear = null;
  }
  return events;
}

// ================================================================
// PERSISTENCE
// ================================================================

function _saveChronicle() {
  try {
    localStorage.setItem("cgv6_worldChronicle",   JSON.stringify(worldChronicle.slice(-3000)));
    localStorage.setItem("cgv6_chronicleCounter", String(_chronicleIdCounter));
    localStorage.setItem("cgv6_worldEventChains", JSON.stringify(worldEventChains.slice(-2000)));
    localStorage.setItem("cgv6_chainIdCounter",   String(_chainIdCounter));
    localStorage.setItem("cgv6_worldLegends",     JSON.stringify(worldLegends.slice(-500)));
  } catch(e) { console.warn("Chronicle save failed:", e); }
}

function _saveAIMemory() {
  try {
    localStorage.setItem("cgv6_aiMemory",       JSON.stringify(aiMemory));
    localStorage.setItem("cgv6_revengeQueue",   JSON.stringify(revengeQueue.slice(-200)));
    localStorage.setItem("cgv6_consequenceBuffer", JSON.stringify(_consequenceBuffer.slice(-100)));
  } catch(e) { console.warn("AI Memory save failed:", e); }
}

function loadWorldChronicle() {
  try {
    const saved = localStorage.getItem("cgv6_worldChronicle");
    if (saved) worldChronicle = JSON.parse(saved);
    const cnt = localStorage.getItem("cgv6_chronicleCounter");
    if (cnt) _chronicleIdCounter = parseInt(cnt) || 1;
    // V2
    const chains = localStorage.getItem("cgv6_worldEventChains");
    if (chains) worldEventChains = JSON.parse(chains);
    const chainCnt = localStorage.getItem("cgv6_chainIdCounter");
    if (chainCnt) _chainIdCounter = parseInt(chainCnt) || 1;
    const legends = localStorage.getItem("cgv6_worldLegends");
    if (legends) worldLegends = JSON.parse(legends);
    // AI Memory
    const mem = localStorage.getItem("cgv6_aiMemory");
    if (mem) aiMemory = { ...aiMemory, ...JSON.parse(mem) };
    const rev = localStorage.getItem("cgv6_revengeQueue");
    if (rev) revengeQueue = JSON.parse(rev);
    const buf = localStorage.getItem("cgv6_consequenceBuffer");
    if (buf) _consequenceBuffer = JSON.parse(buf).map(c => ({
      ...c,
      generatorFn: _resolveGeneratorFn(c.generatorFnName),
    })).filter(c => c.generatorFn);
  } catch(e) { worldChronicle = []; worldEventChains = []; console.warn("Chronicle load error:", e); }
}

// Consequence buffer can't serialize functions; use name mapping
function _resolveGeneratorFn(name) {
  const map = {
    generateWarChain, generateRevengeChain, generateDynastyChain,
    generateSectChain, generateKingdomChain,
  };
  return map[name] || null;
}

// ================================================================
// QUERY API — V1 compat + V2 chain queries
// ================================================================

function getChronicleByYear(yr, range = 0) { return worldChronicle.filter(e => Math.abs(e.year - yr) <= range); }
function getChronicleByNPC(name) {
  const n = name.toLowerCase();
  return worldChronicle.filter(e => e.npcs.some(x => x.toLowerCase().includes(n)) || e.title.toLowerCase().includes(n) || e.body.toLowerCase().includes(n));
}
function getChronicleByCountry(country) {
  const c = country.toLowerCase();
  return worldChronicle.filter(e => (e.countries||[]).some(x => x.toLowerCase().includes(c)) || e.body.toLowerCase().includes(c));
}
function getChronicleByType(type)    { return worldChronicle.filter(e => e.type === type); }
function getChronicleByTag(tag)      { const t = tag.toLowerCase(); return worldChronicle.filter(e => (e.tags||[]).some(x => x.toLowerCase().includes(t))); }
function getChronicleByDynasty(sur)  { const s = sur.toLowerCase(); return worldChronicle.filter(e => (e.dynasty && e.dynasty.toLowerCase().includes(s)) || e.body.toLowerCase().includes(s)); }
function getChronicleSearch(query)   {
  const q = query.toLowerCase();
  return worldChronicle.filter(e =>
    e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) ||
    (e.tags||[]).some(t => t.toLowerCase().includes(q)) ||
    (e.npcs||[]).some(n => n.toLowerCase().includes(q)) ||
    (e.sects||[]).some(s => s.toLowerCase().includes(q))
  );
}

// V2: Get event chain tree for a given chainId
function getEventChainTree(chainId) {
  const root = worldEventChains.find(e => e.id === chainId);
  if (!root) return null;
  function buildTree(ev, depth = 0) {
    if (depth > 10) return { ...ev, children: [] };
    const children = (ev.consequenceIds || [])
      .map(cid => worldEventChains.find(e => e.id === cid))
      .filter(Boolean)
      .map(child => buildTree(child, depth + 1));
    return { ...ev, children };
  }
  return buildTree(root);
}

// V2: Get event context (cause chain upward)
function getEventContext(chainId) {
  const chain = [];
  let current = worldEventChains.find(e => e.id === chainId);
  while (current) {
    chain.unshift(current);
    current = current.causeId ? worldEventChains.find(e => e.id === current.causeId) : null;
    if (chain.length > 20) break;
  }
  return chain; // [root_cause, ..., this_event]
}

// ================================================================
// RENDER — World Chronicle Panel V2
// ================================================================

function renderWorldChronicle() {
  const panel = document.getElementById("panel-world-chronicle");
  if (!panel || !panel.classList.contains("active")) return;

  const filterYear    = document.getElementById("wcFilterYear")?.value.trim()            || "";
  const filterType    = document.getElementById("wcFilterType")?.value                    || "";
  const filterNPC     = document.getElementById("wcFilterNPC")?.value.trim().toLowerCase() || "";
  const filterSect    = document.getElementById("wcFilterSect")?.value.trim().toLowerCase() || "";
  const filterCountry = document.getElementById("wcFilterCountry")?.value.trim().toLowerCase() || "";
  const filterSearch  = document.getElementById("wcFilterSearch")?.value.trim().toLowerCase()  || "";

  let events = worldChronicle.slice().reverse();

  if (filterType)    events = events.filter(e => e.type === filterType);
  if (filterYear)    events = events.filter(e => String(e.year).includes(filterYear));
  if (filterNPC)     events = events.filter(e => (e.npcs||[]).some(n => n.toLowerCase().includes(filterNPC)) || e.body.toLowerCase().includes(filterNPC));
  if (filterSect)    events = events.filter(e => (e.sects||[]).some(s => s.toLowerCase().includes(filterSect)) || e.body.toLowerCase().includes(filterSect));
  if (filterCountry) events = events.filter(e => (e.countries||[]).some(c => c.toLowerCase().includes(filterCountry)) || e.body.toLowerCase().includes(filterCountry));
  if (filterSearch)  events = events.filter(e => e.title.toLowerCase().includes(filterSearch) || e.body.toLowerCase().includes(filterSearch));

  const listEl = document.getElementById("wcEventList");
  if (!listEl) return;

  const TYPE_META = {
    breakthrough: { icon:"✨", color:"#facc15", label:"Đột Phá" },
    war:          { icon:"⚔️",  color:"#f87171", label:"Chiến Tranh" },
    sect:         { icon:"🏯",  color:"#fb923c", label:"Tông Môn" },
    boss:         { icon:"🐉",  color:"#c084fc", label:"Boss Chiến" },
    marriage:     { icon:"💑",  color:"#f472b6", label:"Đạo Lữ" },
    death:        { icon:"☠️",  color:"#94a3b8", label:"Tử Vong" },
    heavenly:     { icon:"🌌",  color:"#60a5fa", label:"Thiên Sự" },
    civilization: { icon:"🌟",  color:"#4ade80", label:"Văn Minh" },
    legend:       { icon:"📜",  color:"#fde68a", label:"Huyền Thoại" },
    revenge:      { icon:"🔥",  color:"#ff6b35", label:"Báo Thù" },
  };

  // Stats bar
  const typeCounts = {};
  worldChronicle.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const statsEl = document.getElementById("wcStats");
  if (statsEl) {
    statsEl.innerHTML = Object.entries(typeCounts).map(([k, v]) => {
      const m = TYPE_META[k] || { icon:"📌", color:"var(--gold)", label:k };
      return `<div class="wh-stat-chip" style="border-color:${m.color}33;background:${m.color}08">
        <span>${m.icon}</span>
        <span style="color:${m.color};font-weight:700">${v}</span>
        <span style="color:var(--white-dim);font-size:10px">${m.label}</span>
      </div>`;
    }).join("") || `<span style="color:var(--white-dim);font-size:12px;font-style:italic">Chưa có sự kiện nào</span>`;
  }

  // V2: Legends bar
  const legendsEl = document.getElementById("wcLegends");
  if (legendsEl && worldLegends.length) {
    legendsEl.innerHTML = worldLegends.slice(-6).reverse().map(l => {
      const typeColor = l.type === "founder" ? "#4ade80" : l.type === "revival" ? "#60a5fa" : l.type === "fallen_hero" ? "#f87171" : "#fde68a";
      return `<div class="wc-legend-chip" style="border-color:${typeColor}44;background:${typeColor}08;cursor:pointer" onclick="wcFilterByLegend('${l.name}')">
        <span style="color:${typeColor};font-weight:700;font-size:12px">📜 ${l.name}</span>
        <span style="color:var(--white-dim);font-size:10px;display:block">${l.title}</span>
      </div>`;
    }).join("");
  }

  // V2: Revenge queue indicator
  const revengeEl = document.getElementById("wcRevengeQueue");
  if (revengeEl) {
    const pending = revengeQueue.filter(r => r.triggerYear <= _currentYear()).length;
    const future  = revengeQueue.filter(r => r.triggerYear > _currentYear()).length;
    revengeEl.innerHTML = pending > 0
      ? `<span style="color:#ff6b35;font-weight:700">🔥 ${pending} vụ báo thù đang chờ</span> <button class="btn-secondary" style="padding:3px 10px;font-size:11px" onclick="generateRevengeChain();renderWorldChronicle()">Kích Hoạt</button>`
      : future > 0
        ? `<span style="color:var(--white-dim);font-size:11px">⏳ ${future} huyết thù đang ủ mưu...</span>`
        : "";
  }

  const countEl = document.getElementById("wcCount");
  if (countEl) countEl.textContent = `${events.length} / ${worldChronicle.length} sự kiện`;

  if (!events.length) {
    listEl.innerHTML = `<div class="wh-empty">📜 Chưa có lịch sử nào.<br><small style="opacity:.4">Bấm "Sinh Truyện" để AI tự tạo lịch sử thế giới...</small></div>`;
    return;
  }

  listEl.innerHTML = events.map((e, idx) => {
    const m = TYPE_META[e.type] || { icon:"📌", color:"var(--gold)", label:e.type };
    const side = idx % 2 === 0 ? "left" : "right";
    const npcBadges = (e.npcs||[]).map(n => `<span class="wc-badge npc-badge">👤 ${n}</span>`).join("");
    const sectBadges = (e.sects||[]).map(s => `<span class="wc-badge sect-badge">🏯 ${s}</span>`).join("");
    const dynBadge = e.dynasty ? `<span class="wc-badge dyn-badge">🏛 ${e.dynasty}</span>` : "";

    // V2: Chain indicators
    const hasCause       = e.causeId;
    const chainEntry     = worldEventChains.find(ce => ce.id === e.chainId);
    const hasConsequences = chainEntry && chainEntry.consequenceIds?.length > 0;
    const chainDepth     = chainEntry?.chainDepth || 0;

    const chainBadge = hasCause
      ? `<span class="wc-badge chain-badge" style="background:#ff6b3514;border-color:#ff6b3540;color:#ff6b35;cursor:pointer" onclick="wcShowChainTree('${e.chainId}')">🔗 Hậu quả</span>`
      : hasConsequences
        ? `<span class="wc-badge chain-badge" style="background:#4ade8014;border-color:#4ade8040;color:#4ade80;cursor:pointer" onclick="wcShowChainTree('${e.chainId}')">⛓ ${chainEntry.consequenceIds.length} hệ quả</span>`
        : "";
    const depthBadge = chainDepth > 0 ? `<span style="font-size:9px;color:var(--white-dim);margin-left:4px">↳ lv${chainDepth}</span>` : "";

    const bodyLines = (e.body||"").split("\n").map(l => l.trim()).filter(Boolean);
    const bodyHtml = bodyLines.map((l, i) => {
      if (i === 0) return `<div class="wc-body-header">${l}</div>`;
      return `<div class="wc-body-line">${l}</div>`;
    }).join("");

    return `<div class="wh-timeline-row wh-${side}">
      <div class="wh-timeline-node" style="background:${m.color};box-shadow:0 0 8px ${m.color}66"></div>
      <div class="wh-entry wc-entry" style="border-color:${m.color}33">
        <div class="wh-entry-header">
          <span class="wh-type-pill" style="background:${m.color}15;color:${m.color};border-color:${m.color}44">${m.icon} ${m.label}</span>
          <span class="wh-year-badge">📅 Năm ${e.year}</span>
          ${depthBadge}
        </div>
        <div class="wc-entry-title">${e.title}</div>
        <div class="wc-entry-body">${bodyHtml}</div>
        <div class="wc-badges">${npcBadges}${sectBadges}${dynBadge}${chainBadge}</div>
      </div>
    </div>`;
  }).join("");
}

// ================================================================
// V2: CHAIN TREE MODAL — hiển thị cây nhân quả
// ================================================================

function wcShowChainTree(chainId) {
  const context = getEventContext(chainId);
  const tree    = getEventChainTree(chainId);
  if (!tree) return;

  const TYPE_META = {
    breakthrough:"✨", war:"⚔️", sect:"🏯", boss:"🐉", marriage:"💑",
    death:"☠️", heavenly:"🌌", civilization:"🌟", legend:"📜",
  };

  function renderNode(node, depth = 0) {
    const icon = TYPE_META[node.type] || "📌";
    const indent = depth * 18;
    const isCurrent = node.id === chainId;
    const childrenHtml = (node.children || []).map(c => renderNode(c, depth + 1)).join("");
    return `<div style="margin-left:${indent}px;margin-bottom:6px">
      <div style="background:${isCurrent ? "rgba(250,204,21,0.1)" : "rgba(255,255,255,0.03)"};border:1px solid ${isCurrent ? "rgba(250,204,21,0.35)" : "var(--border)"};border-radius:7px;padding:8px 12px;${depth > 0 ? "border-left:3px solid rgba(250,204,21,0.3);" : ""}">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
          <span>${depth > 0 ? "↳" : "⚡"}</span>
          <span style="font-size:10px;color:var(--white-dim)">Năm ${node.year}</span>
          <span style="font-size:10px;color:var(--gold)">${icon} ${node.type}</span>
        </div>
        <div style="font-size:12px;color:var(--white-main);font-weight:600">${node.title}</div>
        ${node.consequenceIds?.length ? `<div style="font-size:10px;color:var(--white-dim);margin-top:3px">→ ${node.consequenceIds.length} hậu quả tiếp theo</div>` : ""}
      </div>
      ${childrenHtml}
    </div>`;
  }

  // Build context chain (cause path)
  const contextHtml = context.length > 1
    ? `<div style="margin-bottom:12px;padding:10px;background:rgba(96,165,250,0.06);border:1px solid rgba(96,165,250,0.2);border-radius:8px">
        <div style="font-size:11px;color:#60a5fa;margin-bottom:8px;font-weight:600">📖 Chuỗi Nhân Quả</div>
        ${context.map((ev, i) => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:11px">
          ${i > 0 ? '<span style="color:var(--white-dim)">↓</span>' : ""}
          <span style="color:${ev.id === chainId ? "var(--gold)" : "var(--white-dim)"};${ev.id === chainId ? "font-weight:700" : ""}">
            Năm ${ev.year}: ${ev.title}
          </span>
        </div>`).join("")}
       </div>`
    : "";

  const html = `
    <h2 style="font-family:var(--font-heading);color:var(--gold);margin-bottom:14px">⛓ Cây Sự Kiện — Nhân Quả</h2>
    ${contextHtml}
    <div style="font-size:11px;color:var(--white-dim);margin-bottom:10px">Cây hậu quả từ sự kiện này:</div>
    <div style="max-height:60vh;overflow-y:auto">${renderNode(tree)}</div>
    <div style="margin-top:14px;font-size:11px;color:var(--white-dim)">
      🔥 Huyết thù đang chờ: ${revengeQueue.length} | 📜 Huyền thoại: ${worldLegends.length}
    </div>
  `;
  if (typeof openModal === "function") openModal(html);
}

function wcFilterByLegend(name) {
  const el = document.getElementById("wcFilterNPC");
  if (el) { el.value = name; renderWorldChronicle(); }
}

// ================================================================
// V2: LEGENDS PANEL RENDER
// ================================================================

function renderLegendsPanel() {
  const el = document.getElementById("wcLegendsDetail");
  if (!el) return;
  if (!worldLegends.length) {
    el.innerHTML = `<div style="color:var(--white-dim);font-style:italic;padding:20px;text-align:center">📜 Chưa có huyền thoại nào xuất hiện...</div>`;
    return;
  }
  const typeColor = { founder:"#4ade80", revival:"#60a5fa", fallen_hero:"#f87171", legend:"#fde68a", cultivator:"#facc15" };
  el.innerHTML = worldLegends.slice().reverse().map(l => {
    const color = typeColor[l.type] || "#fde68a";
    return `<div class="wc-legend-row" style="border-color:${color}33;background:${color}06" onclick="wcFilterByLegend('${l.name}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="color:${color};font-weight:700;font-size:13px">📜 ${l.name}</span>
        <span style="font-size:11px;color:var(--white-dim)">Năm ${l.year}</span>
      </div>
      <div style="font-size:11px;color:var(--white-main);margin-bottom:3px">${l.title}</div>
      <div style="font-size:11px;color:var(--white-dim)">${l.deeds}</div>
    </div>`;
  }).join("");
}

// ================================================================
// CLEAR
// ================================================================

function clearWorldChronicle() {
  if (!confirm("Xóa toàn bộ World Chronicle? Hành động này không thể hoàn tác!")) return;
  worldChronicle = [];
  worldEventChains = [];
  worldLegends = [];
  revengeQueue = [];
  _consequenceBuffer = [];
  aiMemory = { kills:[], founders:[], betrayals:[], alliances:[], revenges:[], sectHistory:{}, dynastyHistory:{}, kingdomHistory:{} };
  _saveChronicle();
  _saveAIMemory();
  renderWorldChronicle();
  if (typeof toast === "function") toast("🗑 Đã xóa World Chronicle!");
}

// ================================================================
// AUTO GENERATION
// ================================================================

let _chronicleAutoCounter = 0;
let _chronicleAutoInterval = 50;

function autoGenerateChronicle() {
  _chronicleAutoCounter++;
  if (_chronicleAutoCounter >= _chronicleAutoInterval) {
    _chronicleAutoCounter = 0;
    generateStoryEvent();
    if (document.getElementById("panel-world-chronicle")?.classList.contains("active")) {
      renderWorldChronicle();
    }
  }
}

(function patchTick() {
  if (typeof tick === "function") {
    const _origTick = tick;
    window.tick = function() { _origTick(); autoGenerateChronicle(); };
  }
  setTimeout(function() {
    if (typeof gameTick === "function") {
      const _origGameTick = gameTick;
      window.gameTick = function() { _origGameTick(); autoGenerateChronicle(); };
    }
  }, 2000);
})();

// ================================================================
// INIT
// ================================================================

function initAIStoryEngine() {
  loadWorldChronicle();
  console.log(`[AI Story Engine V2] Loaded ${worldChronicle.length} chronicle entries, ${worldEventChains.length} chains, ${worldLegends.length} legends, ${revengeQueue.length} pending revenges.`);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAIStoryEngine);
} else {
  setTimeout(initAIStoryEngine, 100);
}
