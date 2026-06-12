/**
 * ============================================================
 *  EMERGENT CIVILIZATION ENGINE  —  Creator God V6 / Phase Next
 *  File: emergentCivilization.js
 *
 *  Tương thích 100% với hệ thống hiện tại.
 *  KHÔNG xóa dữ liệu cũ. KHÔNG reset localStorage.
 *  Chỉ thêm vào — migrate khi cần.
 * ============================================================
 */

// ============================================================
//  WORLD STATE EXTENSIONS  (gắn vào world object khi cần)
// ============================================================

/** Khởi tạo các chỉ số văn minh nếu chưa có */
function ecInitWorldState() {
  if (!window.world) return;
  if (world.ecInitialized) return; // đã khởi tạo rồi

  world.worldCorruption  = world.worldCorruption  ?? 0;   // 0-100
  world.worldProsperity  = world.worldProsperity  ?? 50;  // 0-100
  world.worldChaos       = world.worldChaos       ?? 0;   // 0-100
  world.evilPoints       = world.evilPoints       ?? 0;
  world.negativeKarma    = world.negativeKarma    ?? 0;
  world.ecInitialized    = true;
}

// ============================================================
//  DYNAMIC SIDEBAR UNLOCK SYSTEM
// ============================================================

/**
 * Trạng thái mở khóa sidebar — lưu vào localStorage
 * Cấu trúc: { sects: bool, war: bool, countries: bool, empire: bool, boss: bool }
 */
function ecGetUnlocks() {
  try {
    return JSON.parse(localStorage.getItem('cgv6_ec_unlocks') || '{}');
  } catch { return {}; }
}

function ecSaveUnlocks(u) {
  try { localStorage.setItem('cgv6_ec_unlocks', JSON.stringify(u)); } catch {}
}

function ecCheckUnlocks() {
  if (!window.world) return;
  const u = ecGetUnlocks();
  let changed = false;
  const p = window.player || {};
  const realm = p.realm || 0;
  const yr = window.year || 0;

  /** Helper: mở khóa 1 mục menu kèm hiệu ứng toast + log + biên niên sử */
  const unlock = (key, condition, icon, label, historyText) => {
    if (!u[key] && condition) {
      u[key] = true; changed = true;
      addLog(`🔓 KHÁM PHÁ: [${icon} ${label}] được mở khóa!`, 'important');
      toast(`${icon} ${label} đã được khai mở trong thiên địa!`);
      if (historyText) ecAddWorldHistory('civilization', historyText);
    }
  };

  // Nhân Vật — bước chân vào thế giới ngay khi sinh linh đầu tiên xuất hiện
  unlock('player', window.npcs && npcs.length > 0,
    '🎮', 'Nhân Vật', `Nhân vật của Thiên Đạo chính thức bước chân vào thế giới.`);

  // Nhiệm Vụ — mở cùng lúc với Nhân Vật
  unlock('quests', u.player === true,
    '📜', 'Nhiệm Vụ', null);

  // Tông Môn khi có sect đầu tiên
  unlock('sects', window.sects && sects.length > 0,
    '🏯', 'Tông Môn', `Tông Môn đầu tiên xuất hiện trong thiên địa — hệ thống tu tiên bắt đầu!`);

  // Chiến Tranh Tông Môn khi có war trong activeWars
  unlock('war', window.activeWars && activeWars.length > 0,
    '⚔️', 'Tông Môn Chiến', null);

  // Quốc Gia
  unlock('countries', window.countries && countries.length > 0,
    '👑', 'Quốc Gia', `Quốc gia đầu tiên khai quốc — nền văn minh bắt đầu hình thành.`);

  // Đế Quốc khi có country level 4+
  unlock('empire', window.countries && countries.some(c => (c.level || 1) >= 4),
    '🗼', 'Đế Quốc', `Đế Quốc đầu tiên vươn lên thống trị thiên hạ — lịch sử sang trang mới!`);

  // Boss
  unlock('boss', window.bosses && bosses.length > 0,
    '🐉', 'Boss', `Ác ma xuất thế, đe dọa thiên hạ.`);

  // Bản Đồ Thế Giới — khi thiên địa đã trải qua vài năm
  unlock('worldmap', yr >= 2,
    '🗺', 'Bản Đồ Thế Giới', `Hình hài thiên địa dần hiện rõ trên bản đồ.`);

  // Dashboard — tổng quan thiên địa
  unlock('dashboard', yr >= 2,
    '📊', 'Dashboard', null);

  // Dungeon — mở ra khi nhân vật đột phá cảnh giới đầu tiên
  unlock('dungeon', realm >= 1,
    '🏰', 'Dungeon', `Những bí cảnh hiểm trở đầu tiên xuất hiện, chờ người có duyên khám phá.`);

  // Kinh Tế
  unlock('economy', realm >= 2,
    '💹', 'Kinh Tế', `Mạng lưới giao thương trong thiên hạ bắt đầu hình thành.`);

  // Lãnh Địa
  unlock('territories', realm >= 2,
    '🏔', 'Lãnh Địa', `Các thế lực bắt đầu tranh giành lãnh địa.`);

  // Bí Cảnh
  unlock('realms', realm >= 3 || (window.secretRealms && secretRealms.length > 0),
    '🌀', 'Bí Cảnh', `Những bí cảnh kỳ bí dần lộ diện giữa trời đất.`);

  // Lịch Sử Thế Giới
  unlock('history', yr >= 3,
    '📖', 'Lịch Sử Thế Giới', `Sử sách bắt đầu được ghi chép lại.`);

  // Chiến Tranh Lãnh Địa — mở khi có chiến tranh (không cần chờ territories)
  unlock('territorywar', window.activeWars && activeWars.length > 0,
    '⚔️', 'Chiến Tranh', `Chiến hỏa lan rộng khắp các lãnh địa.`);

  // Bảng Xếp Hạng
  unlock('leaderboard', yr >= 3,
    '🏆', 'Bảng Xếp Hạng', null);

  // Vương Triều
  unlock('dynasty', realm >= 3 || (window.countries && countries.length > 0),
    '🏰', 'Vương Triều', `Những vương triều đầu tiên bắt đầu được dựng nên.`);

  // AI Biên Niên Sử — mở muộn nhất, khi thiên địa đã có đủ chiều sâu lịch sử
  unlock('chronicle', yr >= 5,
    '🖋️', 'AI Biên Niên Sử', `Thiên Đạo bắt đầu sai sứ giả ghi lại biên niên sử của thế giới.`);

  // Công Nghệ — mở ngay khi thế giới được tạo (năm 1)
  unlock('technology', yr >= 1,
    '⚙️', 'Công Nghệ', `Bánh xe lịch sử bắt đầu xoay — nền văn minh đang hình thành.`);

  if (changed) {
    ecSaveUnlocks(u);
    ecRenderDynamicSidebar();
  }
}

/** Render sidebar theo trạng thái unlock */
function ecRenderDynamicSidebar() {
  const u = ecGetUnlocks();

  // Helper: hiện/ẩn nav-btn theo data-panel
  const setVisible = (panelKey, visible) => {
    const btn = document.querySelector(`.nav-btn[data-panel="${panelKey}"]`);
    if (!btn) return;
    if (visible) {
      if (btn.style.display === 'none') {
        // Unlock animation chỉ chạy khi chuyển từ ẩn -> hiện
        btn.classList.add('ec-unlocked-flash');
        setTimeout(() => btn.classList.remove('ec-unlocked-flash'), 1200);
      }
      btn.style.display = '';
      btn.classList.remove('ec-hidden');
    } else {
      btn.style.display = 'none';
      btn.classList.add('ec-hidden');
    }
  };

  // Luôn hiện: world, npcs (Sinh Linh), logs (Nhật Ký) — đặt sẵn trong index.html
  // Theo unlock — thế giới hé lộ dần dần:
  setVisible('player',        u.player      === true);
  setVisible('quests',        u.quests      === true);
  setVisible('sects',         u.sects       === true);
  setVisible('sectwars',      u.war         === true || u.sects === true);
  setVisible('countries',     u.countries   === true);
  setVisible('empire',        u.empire      === true);
  setVisible('boss',          u.boss        === true);
  setVisible('worldmap',      u.worldmap    === true);
  setVisible('dashboard',     u.dashboard   === true);
  setVisible('dungeon',       u.dungeon     === true);
  setVisible('economy',       u.economy     === true);
  setVisible('territories',   u.territories === true);
  setVisible('territory-war', u.territorywar === true);
  setVisible('secret-realms', u.realms      === true);
  setVisible('world-history', u.history     === true);
  setVisible('leaderboard',   u.leaderboard === true);
  setVisible('dynasty',       u.dynasty     === true);
  setVisible('dynasty-engine', u.dynasty    === true);
  setVisible('world-chronicle', u.chronicle === true);
  setVisible('religion',        u.religion  === true);
  setVisible('technology',      u.technology === true);

  // 3D World Viewer — phần thưởng cuối cùng
  const realm = (window.player && window.player.realm) || 0;
  setVisible('world3d', realm >= 5 || u.world3d === true);

  // Hub / Manager / Marketplace — mở sau khi thế giới có sinh linh (dashboard mở)
  const setVisibleById = (id, visible) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (visible) { el.style.display = ''; el.classList.remove('ec-hidden'); }
    else { el.style.display = 'none'; el.classList.add('ec-hidden'); }
  };
  setVisibleById('worldHubNavBtn',      u.dashboard === true);
  setVisibleById('worldManagerNavBtn',  u.dashboard === true);
  setVisibleById('mktNavBtn',           u.economy   === true);
  // Cũng ẩn hint text dưới Hub button
  const hubHint = document.querySelector('.sidebar-nav .ec-hidden + .ec-hidden');
  if (hubHint) { hubHint.style.display = u.dashboard === true ? '' : 'none'; }
}

// ============================================================
//  NPC LIFE ENRICHMENT
//  Đảm bảo NPC có đầy đủ fields mà Emergent engine cần
// ============================================================

function ecEnrichNPC(npc) {
  if (!npc) return;
  npc.followers      = npc.followers      ?? 0;
  npc.disciples      = npc.discipleIds    ? npc.discipleIds.length : 0; // alias
  npc.territory      = npc.territory      ?? null;  // id lãnh địa sở hữu
  npc.ambition       = npc.ambition       ?? Math.floor(Math.random() * 100);
  npc.evilKarma      = npc.evilKarma      ?? 0;
  npc.sectFoundAttempt = npc.sectFoundAttempt ?? false;
}

// ============================================================
//  SECT FOUNDATION SYSTEM
//  NPC đủ điều kiện tự lập Tông Môn
// ============================================================

const EC_SECT_NAME_PREFIXES = ['Thanh','Huyền','Thiên','Hắc','Bạch','Hồng','Tím','Kim','Ngọc','Vạn','Cửu','Thái'];
const EC_SECT_NAME_MIDS     = ['Vân','Kiếm','Lôi','Hỏa','Băng','Phong','Huyết','Long','Thiên','Địa'];
const EC_SECT_NAME_SUFFS    = ['Tông','Môn','Các','Phủ','Sơn','Cung','Điện','Lâu'];

function ecRandomSectName() {
  const p = EC_SECT_NAME_PREFIXES[Math.floor(Math.random() * EC_SECT_NAME_PREFIXES.length)];
  const m = EC_SECT_NAME_MIDS[Math.floor(Math.random() * EC_SECT_NAME_MIDS.length)];
  const s = EC_SECT_NAME_SUFFS[Math.floor(Math.random() * EC_SECT_NAME_SUFFS.length)];
  return `${p} ${m} ${s}`;
}

function ecTrySectFoundation() {
  if (!window.world || !window.npcs) return;
  const alive = npcs.filter(n => n.status === 'alive');

  for (const npc of alive) {
    ecEnrichNPC(npc);
    // Điều kiện: Hóa Thần (realm 4) trở lên, đủ followers/wealth/reputation
    if (npc.sectFoundAttempt) continue;
    if (npc.sectId) continue; // đã có tông môn
    if ((npc.realm || 0) < 4) continue;
    if ((npc.reputation || 0) < 100) continue;
    if ((npc.wealth || 0) < 1000) continue;

    // Đếm followers = số NPC không có sect + gần region
    const followCount = npcs.filter(n =>
      n.status === 'alive' && !n.sectId && n.id !== npc.id && n.region === npc.region
    ).length;

    if (followCount < 5) continue; // cần ít nhất 5 tu sĩ không sect cùng region

    // Kiểm tra chance (xác suất mỗi năm)
    if (Math.random() > 0.15) continue;

    // LẬP TÔNG MÔN!
    const sectId  = `ec_s${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
    const sectName = ecRandomSectName();
    const newSect = {
      id:           sectId,
      name:         sectName,
      founder:      npc.id,
      leader:       npc.id,
      elders:       [npc.id],
      members:      [npc.id],
      disciples:    [npc.id],
      prestige:     200 + (npc.reputation || 0),
      treasury:     Math.floor((npc.wealth || 0) * 0.5),
      territory:    npc.region || (window.regions && regions[0]?.name) || '🗻 Đông Vực',
      level:        1,
      warCooldown:  0,
      yearFounded:  window.year || 1,
      ecFounded:    true,     // đánh dấu do Emergent engine sinh ra
    };

    window.sects = window.sects || [];
    sects.push(newSect);

    // Gắn sect cho founder
    npc.sectId = sectId;
    npc.sectFoundAttempt = true;
    if (!npc.titles) npc.titles = [];
    if (typeof TITLES_DEF !== 'undefined' && !npc.titles.includes(TITLES_DEF.sectFounder)) {
      npc.titles.push(TITLES_DEF.sectFounder);
    }

    // Thu nhận followers trong region
    const recruits = npcs.filter(n =>
      n.status === 'alive' && !n.sectId && n.id !== npc.id && n.region === npc.region
    ).slice(0, Math.min(8, followCount));

    for (const r of recruits) {
      r.sectId = sectId;
      newSect.members.push(r.id);
      newSect.disciples.push(r.id);
      if (r.biography) r.biography.push({ year: window.year || 1, event: `Gia nhập ${sectName} khi tông môn mới thành lập.` });
    }

    // Ghi lịch sử
    npc.biography && npc.biography.push({ year: window.year || 1, event: `Lập ${sectName}, thành lập tông môn riêng với ${recruits.length} đệ tử đầu tiên.` });

    const logMsg = `🏯 ${npc.name} lập ${sectName}! (${recruits.length} đệ tử gia nhập, năm ${window.year || 1})`;
    if (typeof addLog === 'function') addLog(logMsg, 'important');
    if (typeof addTimeline === 'function') addTimeline(`🏯 ${npc.name} lập ${sectName}`, 'important', '🏯');
    if (typeof toast === 'function') toast(`🏯 ${sectName} được thành lập!`);

    ecAddWorldHistory('sect', `${npc.name} lập ${sectName} tại ${npc.region}. ${recruits.length} tu sĩ gia nhập.`);

    // Cập nhật world state
    ecInitWorldState();
    world.worldProsperity = Math.min(100, (world.worldProsperity || 50) + 3);

    // Chỉ lập 1 sect mỗi tick để tránh spam
    break;
  }
}

// ============================================================
//  DISCIPLE SYSTEM
//  NPC mạnh thu nhận đệ tử từ NPC yếu hơn
// ============================================================

function ecTryRecruitDisciple() {
  if (!window.npcs || !window.sects) return;
  const alive = npcs.filter(n => n.status === 'alive');
  if (alive.length < 4) return;

  // Chọn ngẫu nhiên 1 "master" candidate
  const masters = alive.filter(n => (n.realm || 0) >= 2 && (!n.discipleIds || n.discipleIds.length < 5) && n.reputation >= 30);
  if (!masters.length) return;
  const master = masters[Math.floor(Math.random() * masters.length)];

  // Tìm disciple potential trong cùng region hoặc cùng sect
  const candidates = alive.filter(n =>
    n.id !== master.id &&
    (!n.masterId) &&
    (n.realm || 0) < (master.realm || 0) &&
    (n.region === master.region || n.sectId === master.sectId)
  );
  if (!candidates.length) return;
  if (Math.random() > 0.3) return;

  const disciple = candidates[Math.floor(Math.random() * candidates.length)];
  disciple.masterId = master.id;
  if (!master.discipleIds) master.discipleIds = [];
  master.discipleIds.push(disciple.id);

  // Truyền kỹ năng
  if (master.skills && master.skills.length && (!disciple.skills || disciple.skills.length < 3)) {
    const skill = master.skills[Math.floor(Math.random() * master.skills.length)];
    if (!disciple.skills) disciple.skills = [];
    if (!disciple.skills.includes(skill)) {
      disciple.skills.push(skill);
      disciple.biography && disciple.biography.push({
        year: window.year || 1,
        event: `Bái ${master.name} làm sư phụ, học được ${skill}.`
      });
    }
  }

  master.reputation = (master.reputation || 0) + 5;
  master.followers  = (master.followers  || 0) + 1;
}

// ============================================================
//  FAMILY SYSTEM (ENHANCED)
//  NPC kết hôn → sinh con → gia tộc
// ============================================================

function ecFamilyTick() {
  if (!window.npcs) return;
  const alive = npcs.filter(n => n.status === 'alive');

  // Kết hôn (bổ sung logic cho NPC không sect)
  const singles = alive.filter(n => !n.married && n.age >= 18 && n.age <= 60);
  if (singles.length >= 2 && Math.random() < 0.08) {
    const idx1 = Math.floor(Math.random() * singles.length);
    let   idx2 = Math.floor(Math.random() * singles.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * singles.length);
    const a = singles[idx1], b = singles[idx2];
    if (a.gender !== b.gender && !a.spouseId && !b.spouseId) {
      a.married = true; a.spouseId = b.id;
      b.married = true; b.spouseId = a.id;
      a.biography && a.biography.push({ year: window.year || 1, event: `Kết hôn với ${b.name}.` });
      b.biography && b.biography.push({ year: window.year || 1, event: `Kết hôn với ${a.name}.` });
      ecAddWorldHistory('marriage', `${a.name} và ${b.name} kết hôn, tạo mối liên kết gia tộc ${a.family} - ${b.family}.`);
    }
  }

  // Sinh con (logic cơ bản — tryBirth trong app.js xử lý chính, đây là bổ sung)
  const couples = alive.filter(n => n.married && n.spouseId && n.gender === 'Nữ' && n.age >= 18 && n.age <= 45);
  for (const mother of couples) {
    if (Math.random() > 0.04) continue;
    const father = npcs.find(n => n.id === mother.spouseId && n.status === 'alive');
    if (!father) continue;
    if ((mother.childrenIds || []).length >= 3) continue;

    // Tạo con
    if (typeof createNPC !== 'function') continue;
    const child = createNPC(false);
    child.parentIds = [mother.id, father.id];
    child.family    = mother.family;
    child.region    = mother.region;
    child.country   = mother.country;
    child.age       = 0;
    child.lifespan  = Math.floor((mother.lifespan + father.lifespan) / 2) + Math.floor(Math.random() * 20);
    child.biography = [{ year: window.year || 1, event: `Ra đời trong gia tộc ${child.family}, con của ${mother.name} và ${father.name}.` }];

    // Inherit sect
    if (mother.sectId) { child.sectId = mother.sectId; }
    else if (father.sectId) { child.sectId = father.sectId; }

    npcs.push(child);
    if (!mother.childrenIds) mother.childrenIds = [];
    if (!father.childrenIds) father.childrenIds = [];
    mother.childrenIds.push(child.id);
    father.childrenIds.push(child.id);

    mother.biography && mother.biography.push({ year: window.year || 1, event: `Sinh ${child.name}, con của ${father.name} và ${mother.name}.` });
  }
}

// ============================================================
//  TERRITORY SYSTEM (NPC chiếm lãnh địa)
// ============================================================

function ecNPCTerritoryExpansion() {
  if (!window.world || !window.world.territories) return;
  const alive = npcs.filter(n => n.status === 'alive' && (n.realm || 0) >= 3);

  for (const npc of alive) {
    ecEnrichNPC(npc);
    if (Math.random() > 0.05) continue;

    // Tìm territory không có owner
    const unclaimed = world.territories.filter(t => !t.owner);
    if (!unclaimed.length) continue;

    const territory = unclaimed[Math.floor(Math.random() * unclaimed.length)];
    territory.owner      = npc.id;
    territory.ownerName  = npc.name;
    territory.population = territory.population || Math.floor(Math.random() * 1000) + 100;
    npc.territory        = territory.id;
    npc.reputation       = (npc.reputation || 0) + 20;
    npc.wealth           = (npc.wealth || 0) + 200;

    npc.biography && npc.biography.push({ year: window.year || 1, event: `Chiếm lãnh địa ${territory.name || territory.id}.` });
    if (typeof addLog === 'function') addLog(`🗺️ ${npc.name} chiếm lãnh địa ${territory.name || territory.id}!`, 'important');

    ecAddWorldHistory('civilization', `${npc.name} chiếm lãnh địa ${territory.name || territory.id}, mở rộng thế lực.`);
    break; // 1 mỗi tick
  }
}

// ============================================================
//  COUNTRY FOUNDATION SYSTEM
//  NPC có đủ territory + reputation + followers tự lập quốc
// ============================================================

const EC_COUNTRY_PREFIXES = ['Đại','Thiên','Huyền','Vạn','Thần','Cửu','Long','Phượng'];
const EC_COUNTRY_SUFFIXES = ['Quốc','Triều','Bang','Vương Quốc','Đế Quốc'];

function ecRandomCountryName() {
  const p = EC_COUNTRY_PREFIXES[Math.floor(Math.random() * EC_COUNTRY_PREFIXES.length)];
  const s = EC_COUNTRY_SUFFIXES[Math.floor(Math.random() * EC_COUNTRY_SUFFIXES.length)];
  return `${p} ${s}`;
}

function ecTryFoundCountry() {
  if (!window.npcs || !window.world) return;
  const alive = npcs.filter(n => n.status === 'alive');

  for (const npc of alive) {
    ecEnrichNPC(npc);
    if ((npc.reputation || 0) < 150) continue;
    if ((npc.realm     || 0) < 2) continue;

    // Kiểm tra số territories NPC hoặc sect đang kiểm soát
    let ownedTerritoryCount = 0;
    if (world.territories) {
      ownedTerritoryCount = world.territories.filter(t => t.owner === npc.id).length;
      // Cộng territory của sect members nếu là sect leader
      const mySect = (window.sects || []).find(s => s.leader === npc.id);
      if (mySect) {
        ownedTerritoryCount += world.territories.filter(t =>
          mySect.members.includes(t.owner)
        ).length;
      }
    }

    if (ownedTerritoryCount < 1) continue;

    // Followers (disciples + sect members)
    const mySect = (window.sects || []).find(s => s.leader === npc.id);
    const followCount = (npc.discipleIds || []).length + (mySect ? mySect.members.length : 0);
    if (followCount < 5) continue;

    // Không có country rồi
    if ((window.countries || []).some(c => c.founderId === npc.id)) continue;

    if (Math.random() > 0.3) continue;

    // LẬP QUỐC!
    const countryName = ecRandomCountryName();
    const newCountry = {
      id:           `ec_c${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      name:         countryName,
      founderId:    npc.id,
      founderName:  npc.name,
      yearFounded:  window.year || 1,
      population:   100000 + followCount * 500,
      wealth:       (npc.wealth || 0) + followCount * 100,
      army:         followCount * 200,
      territory:    npc.region || 'Đông Vực',
      relations:    {},
      economy:      5000 + followCount * 50,
      military:     followCount * 200,
      technology:   Math.floor((npc.realm || 1) / 2) + 1,
      culture:      Math.floor((npc.reputation || 0) / 100) + 1,
      level:        1,
      civHistory:   [{ year: window.year || 1, event: `Khai quốc bởi ${npc.name}` }],
      ecFounded:    true,
    };

    window.countries = window.countries || [];
    window.countries.push(newCountry);

    // Assign NPC country
    npc.country = countryName;
    if (!npc.titles) npc.titles = [];
    if (typeof TITLES_DEF !== 'undefined' && !npc.titles.includes(TITLES_DEF.emperor)) {
      npc.titles.push(TITLES_DEF.emperor);
    }

    npc.biography && npc.biography.push({ year: window.year || 1, event: `Khai quốc ${countryName}, trở thành vị quân chủ đầu tiên.` });

    const logMsg = `👑 ${npc.name} khai quốc ${countryName}! (Năm ${window.year || 1})`;
    if (typeof addLog === 'function') addLog(logMsg, 'important');
    if (typeof addTimeline === 'function') addTimeline(`👑 ${countryName} lập quốc`, 'important', '👑');
    if (typeof toast === 'function') toast(`👑 ${countryName} ra đời!`);

    ecAddWorldHistory('civilization', `${npc.name} khai lập ${countryName} sau ${ownedTerritoryCount} vùng lãnh thổ và ${followCount} đệ tử + tông môn đồ.`);

    ecInitWorldState();
    world.worldProsperity = Math.min(100, (world.worldProsperity || 50) + 5);

    break; // 1 quốc mỗi tick
  }
}

// ============================================================
//  EMPIRE DETECTION
//  Khi country level >= 4 → coi là đế quốc
// ============================================================

function ecCheckEmpire() {
  if (!window.countries) return;
  const empire = countries.find(c => (c.level || 1) >= 4);
  if (!empire) return;
  if (empire.isEmpire) return; // đã thông báo rồi

  empire.isEmpire = true;
  if (typeof addLog === 'function')
    addLog(`🗼 ${empire.name} trỗi dậy thành ĐẾ QUỐC! Thiên hạ rung chuyển!`, 'important');
  if (typeof addTimeline === 'function')
    addTimeline(`🗼 ${empire.name} → ĐẾ QUỐC`, 'important', '🗼');
  if (typeof toast === 'function')
    toast(`🗼 ${empire.name} đã trở thành ĐẾ QUỐC!`);

  ecAddWorldHistory('civilization', `${empire.name} đã phát triển đủ mạnh để trở thành ĐẾ QUỐC — thống trị thiên hạ.`);

  ecInitWorldState();
  world.worldProsperity = Math.min(100, (world.worldProsperity || 50) + 10);
}

// ============================================================
//  BOSS EVOLUTION SYSTEM
//  Boss chỉ sinh ra khi corruption / evilPoints đủ cao
// ============================================================

const EC_BOSS_NAMES = [
  { name:'☠️ Ma Thần Hắc Ám',    realm:7, hp:35000, skills:['Hắc Ám Ma Lực','Ma Khí Thiên Địa'] },
  { name:'🌑 Cửu U Ma Long',      realm:8, hp:50000, skills:['Cửu U Hắc Hỏa','Long Uy Hư Không'] },
  { name:'👁 Thiên Ngoại Tà Ma',  realm:9, hp:80000, skills:['Tà Khí Phong Thiên','Thực Hồn Đại Pháp'] },
  { name:'🔥 Hỏa Ngục Quỷ Vương',realm:6, hp:22000, skills:['Hỏa Địa Ngục','Quỷ Hỏa Thiêu Thiên'] },
  { name:'❄️ Băng Ngục Thần Ma', realm:5, hp:15000, skills:['Vạn Niên Băng Hà','Băng Phong Thiên Nha'] },
];

function ecCheckBossEmergence() {
  if (!window.world) return;
  ecInitWorldState();

  // Tăng worldCorruption dựa theo negative karma của NPC
  const aliveBadNPCs = (window.npcs || []).filter(n =>
    n.status === 'alive' && (n.karma || 0) < -30
  );
  world.worldCorruption  = Math.min(100, (world.worldCorruption  || 0) + aliveBadNPCs.length * 0.05);
  world.negativeKarma    = Math.min(10000, (world.negativeKarma  || 0) + aliveBadNPCs.length * 2);
  world.evilPoints       = world.negativeKarma;

  // Boss chỉ spawn khi đủ điều kiện
  const corruption  = world.worldCorruption  || 0;
  const evilPts     = world.evilPoints       || 0;
  const chaos       = world.worldChaos       || 0;

  const threshold = 40; // ngưỡng cơ bản

  if (corruption < threshold && evilPts < 500 && chaos < 30) return;

  // Giới hạn số boss
  const currentBossCount = (window.bosses || []).length;
  if (currentBossCount >= 3) return;

  // Chance spawn
  const spawnChance = Math.min(0.15, (corruption - threshold) / 200 + 0.02);
  if (Math.random() > spawnChance) return;

  const template   = EC_BOSS_NAMES[Math.floor(Math.random() * EC_BOSS_NAMES.length)];
  const lootRarity = template.realm >= 8 ? ['legendary','epic'] : (template.realm >= 6 ? ['epic','rare'] : ['rare','uncommon']);

  const newBoss = {
    name:   template.name,
    realm:  template.realm,
    hp:     template.hp,
    maxHp:  template.hp,
    skills: template.skills,
    rage:   0,
    loot:   lootRarity,
    ecBoss: true,
    bornYear: window.year || 1,
    bornCorruption: corruption,
  };

  window.bosses = window.bosses || [];
  bosses.push(newBoss);

  // Reset một phần corruption khi boss xuất hiện
  world.worldCorruption = Math.max(0, world.worldCorruption - 20);
  world.worldChaos      = Math.min(100, (world.worldChaos || 0) + 15);

  if (typeof addLog === 'function')
    addLog(`🐉 ÁC MA XUẤT THẾ! ${template.name} giáng lâm từ nguồn Corruption ${corruption.toFixed(0)}%!`, 'important');
  if (typeof addTimeline === 'function')
    addTimeline(`🐉 ${template.name} xuất thế`, 'death', '🐉');
  if (typeof toast === 'function')
    toast(`🐉 ${template.name} xuất hiện do thế giới Ô Nhiễm!`);

  ecAddWorldHistory('boss', `Thế giới tích tụ quá nhiều nghiệp chướng (Corruption: ${corruption.toFixed(0)}%). ${template.name} phá thiên nhai giáng thế!`);
}

// ============================================================
//  WORLD CORRUPTION / PROSPERITY TICK
// ============================================================

function ecWorldStateTick() {
  if (!window.world) return;
  ecInitWorldState();

  // Prosperity tăng khi có sect và country
  const sectCount    = (window.sects    || []).length;
  const countryCount = (window.countries || []).length;
  const aliveCount   = (window.npcs     || []).filter(n => n.status === 'alive').length;

  world.worldProsperity = Math.max(0, Math.min(100,
    (world.worldProsperity || 50) +
    (sectCount * 0.1) + (countryCount * 0.2) - (world.worldChaos || 0) * 0.05
  ));

  // Chaos tăng khi có wars
  const warCount = (window.activeWars || []).length;
  world.worldChaos = Math.max(0, Math.min(100,
    (world.worldChaos || 0) + (warCount * 0.5) - 0.2
  ));

  // Corruption tự giảm dần
  world.worldCorruption = Math.max(0, (world.worldCorruption || 0) - 0.1);
}

// ============================================================
//  WORLD HISTORY LOGGING
// ============================================================

function ecAddWorldHistory(type, event) {
  // Ưu tiên dùng addWorldHistory của app.js nếu có — đảm bảo 1 nguồn sự thật
  if (typeof addWorldHistory === 'function') {
    addWorldHistory(type || 'civilization', event);
    return;
  }
  // Fallback: ghi trực tiếp nếu app.js chưa load
  if (typeof worldHistory === 'undefined') {
    window.worldHistory = [];
  }
  worldHistory.push({
    year:  window.year || 1,
    type:  type || 'civilization',
    event: event,
    icon:  ecHistoryIcon(type),
  });
  if (worldHistory.length > 500) worldHistory = worldHistory.slice(-500);
}

function ecHistoryIcon(type) {
  const icons = {
    sect: '🏯', civilization: '🌟', boss: '🐉', marriage: '💑',
    war: '⚔️', death: '☠️', breakthrough: '✨', era: '🌐',
    country: '👑', empire: '🗼',
  };
  return icons[type] || '📜';
}

// ============================================================
//  WORLD PANEL — HIỆN THỊ CORRUPTION / PROSPERITY / CHAOS
// ============================================================

function ecRenderWorldStatePanel() {
  const el = document.getElementById('ec-world-state-panel');
  if (!el) return;
  if (!window.world) { el.innerHTML = '<p style="color:#666;font-size:12px">Chưa có thế giới</p>'; return; }

  ecInitWorldState();
  const c  = (world.worldCorruption  || 0).toFixed(1);
  const p  = (world.worldProsperity  || 50).toFixed(1);
  const ch = (world.worldChaos       || 0).toFixed(1);

  el.innerHTML = `
    <div class="ec-state-row">
      <span class="ec-state-label">🌟 Phồn Thịnh</span>
      <div class="ec-bar-wrap"><div class="ec-bar ec-bar-prosperity" style="width:${p}%"></div></div>
      <span class="ec-state-val">${p}%</span>
    </div>
    <div class="ec-state-row">
      <span class="ec-state-label">☠️ Ô Nhiễm</span>
      <div class="ec-bar-wrap"><div class="ec-bar ec-bar-corruption" style="width:${c}%"></div></div>
      <span class="ec-state-val">${c}%</span>
    </div>
    <div class="ec-state-row">
      <span class="ec-state-label">⚔️ Hỗn Loạn</span>
      <div class="ec-bar-wrap"><div class="ec-bar ec-bar-chaos" style="width:${ch}%"></div></div>
      <span class="ec-state-val">${ch}%</span>
    </div>
    <div class="ec-state-hint" style="margin-top:6px;font-size:11px;color:#888;">
      Ô Nhiễm ≥ 40% → Boss xuất thế &nbsp;|&nbsp; Tông Môn & Quốc Gia tự phát sinh theo NPC
    </div>
  `;
}

// ============================================================
//  MAIN TICK  —  gọi từ simulateWorld mỗi năm
// ============================================================

function emergentCivilizationTick() {
  try {
    ecWorldStateTick();
    ecFamilyTick();
    ecNPCTerritoryExpansion();
    ecTrySectFoundation();
    ecTryRecruitDisciple();
    ecTryFoundCountry();
    ecCheckEmpire();
    ecCheckBossEmergence();
    ecCheckUnlocks();
    ecRenderWorldStatePanel();
    ecSaveState();
  } catch (err) {
    console.warn('[EmergentCiv] tick error:', err);
  }
}

// ============================================================
//  SAVE / LOAD  —  persist extra state
// ============================================================

function ecSaveState() {
  try {
    if (window.world) {
      localStorage.setItem('cgv6_ec_world_state', JSON.stringify({
        worldCorruption: world.worldCorruption,
        worldProsperity: world.worldProsperity,
        worldChaos:      world.worldChaos,
        evilPoints:      world.evilPoints,
        negativeKarma:   world.negativeKarma,
        ecInitialized:   world.ecInitialized,
      }));
    }
  } catch {}
}

function ecLoadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('cgv6_ec_world_state') || '{}');
    if (window.world && saved && saved.ecInitialized) {
      world.worldCorruption = saved.worldCorruption ?? world.worldCorruption ?? 0;
      world.worldProsperity = saved.worldProsperity ?? world.worldProsperity ?? 50;
      world.worldChaos      = saved.worldChaos      ?? world.worldChaos      ?? 0;
      world.evilPoints      = saved.evilPoints      ?? world.evilPoints      ?? 0;
      world.negativeKarma   = saved.negativeKarma   ?? world.negativeKarma   ?? 0;
      world.ecInitialized   = true;
    }
  } catch {}
}

// ============================================================
//  INIT  —  gọi sau khi load game
// ============================================================

function emergentCivilizationInit() {
  ecLoadState();
  ecCheckUnlocks();
  // Init sidebar state ngay lập tức (ẩn/hiện đúng)
  setTimeout(ecRenderDynamicSidebar, 200);
}

// ============================================================
//  EXPOSE
// ============================================================
window.emergentCivilizationTick = emergentCivilizationTick;
window.emergentCivilizationInit  = emergentCivilizationInit;
window.ecAddWorldHistory         = ecAddWorldHistory;
window.ecRenderWorldStatePanel   = ecRenderWorldStatePanel;
window.ecCheckUnlocks            = ecCheckUnlocks;
window.ecRenderDynamicSidebar    = ecRenderDynamicSidebar;

console.log('[EmergentCiv] Module loaded ✓');

// ============================================================
//  MIGRATION: Nếu save cũ đã có sects/countries → unlock ngay
// ============================================================
function ecMigrateOldSave() {
  const u = ecGetUnlocks();
  let changed = false;
  const hasUnlockData = localStorage.getItem('cgv6_ec_unlocks') !== null;
  const hasExistingSave = (window.year || 1) > 1 || (window.npcs && npcs.length > 0);

  // Lần đầu chạy bản cập nhật "ẩn menu dần" trên save đã chơi từ trước
  // → mở khóa hết các mục tương ứng với tiến trình hiện tại, không toast/log
  if (!hasUnlockData && hasExistingSave) {
    const p = window.player || {};
    const realm = p.realm || 0;
    const yr = window.year || 0;

    u.player = true; // đã có nhân vật từ trước
    u.quests = true;
    if (yr >= 2) { u.worldmap = true; u.dashboard = true; }
    if (yr >= 3) { u.history = true; u.leaderboard = true; }
    if (yr >= 5) u.chronicle = true;
    if (realm >= 1) u.dungeon = true;
    if (realm >= 2) { u.economy = true; u.territories = true; }
    if (realm >= 3 || (window.secretRealms && secretRealms.length > 0)) u.realms = true;
    if (realm >= 3 || (window.countries && countries.length > 0)) u.dynasty = true;
    if (window.activeWars && activeWars.length > 0) u.territorywar = true;
    if (realm >= 5) u.world3d = true;
    changed = true;
    console.log('[EC] Migration: existing save → unlocked panels matching current progress');
  }

  // Nếu đã có sects từ save cũ (không phải do EC tạo ra) → unlock silently
  if (!u.sects && window.sects && sects.length > 0) {
    u.sects = true; changed = true;
    console.log('[EC] Migration: sects unlocked from old save');
  }
  if (!u.countries && window.countries && countries.length > 0) {
    u.countries = true; changed = true;
    console.log('[EC] Migration: countries unlocked from old save');
  }
  if (!u.empire && window.countries && countries.some(c => (c.level||1) >= 4)) {
    u.empire = true; changed = true;
    console.log('[EC] Migration: empire unlocked from old save');
  }
  if (!u.boss && window.bosses && bosses.length > 0) {
    u.boss = true; changed = true;
    console.log('[EC] Migration: boss unlocked from old save');
  }
  if (!u.war && window.activeWars && activeWars.length > 0) {
    u.war = true; changed = true;
  }
  if (changed) {
    ecSaveUnlocks(u);
    ecRenderDynamicSidebar();
  }
}

// Override init để chạy migration trước
const _origInit = window.emergentCivilizationInit;
window.emergentCivilizationInit = function() {
  ecLoadState();
  ecMigrateOldSave(); // ← migrate trước, không toast
  ecCheckUnlocks();
  setTimeout(ecRenderDynamicSidebar, 200);
};
