/* ================================================================
   LIVING WORLD ENGINE — living-world-engine.js
   Creator God V6 — Thiên Đạo AR
   Thế giới tự sống. NPC không còn là dữ liệu tĩnh.
   
   ✦ NPC Soul System (ambition / personality / morality / intelligence / talent / destiny)
   ✦ NPC Memory System (kẻ thù / ân nhân / gia tộc / chiến thắng / thất bại)
   ✦ Autonomous Actions (tu luyện, săn boss, kết hôn, lập gia tộc, phản bội, lập quốc, chiến tranh)
   ✦ Living World Tick — simulateLivingWorld()
   ✦ UI Panel — panel-living-world (tích hợp vào sidebar)
   
   KHÔNG phá hệ thống cũ. Mọi thứ qua hooks + extends.
   ================================================================ */

(function () {
  'use strict';

  // ================================================================
  // CONSTANTS & SOUL TEMPLATES
  // ================================================================

  const LWE_VERSION = '1.0.0';

  const AMBITIONS = [
    'conqueror',   // chinh phục tất cả
    'scholar',     // tìm kiếm tri thức
    'survivor',    // chỉ muốn sống sót
    'protector',   // bảo vệ kẻ yếu
    'avenger',     // báo thù
    'hegemon',     // làm bá chủ
    'immortal',    // đạt bất tử
    'tycoon',      // tích lũy tài phú
    'founder',     // lập gia tộc / tông môn / quốc gia
    'wanderer',    // phiêu du thiên hạ
  ];

  const MORALITY_SCALE = {
    saint:      { min: 80,  max: 100, label: '🌟 Thánh Nhân',    color: '#86efac' },
    good:       { min: 40,  max: 79,  label: '✨ Thiện Lương',    color: '#4ade80' },
    neutral:    { min: -20, max: 39,  label: '⚖️ Trung Lập',     color: '#94a3b8' },
    evil:       { min: -60, max: -21, label: '🔴 Tà Đạo',         color: '#f87171' },
    demon:      { min: -100,max: -61, label: '☠️ Ma Quân',        color: '#c084fc' },
  };

  const PERSONALITY_TRAITS = [
    'aggressive', 'cautious', 'ambitious', 'loyal', 'treacherous',
    'compassionate', 'ruthless', 'cunning', 'honorable', 'cowardly',
    'charismatic', 'reclusive', 'vengeful', 'generous', 'greedy',
  ];

  const DESTINY_TYPES = [
    { id: 'tianming',   label: '☯️ Thiên Mệnh',    desc: 'Số mệnh do trời định, vận khí cực tốt',     bonus: { luck: 30, talent: 10 } },
    { id: 'cangming',   label: '🌑 Thương Mệnh',   desc: 'Số phận đầy bi kịch và thử thách',            bonus: { intelligence: 15, morality: -20 } },
    { id: 'zhanmei',    label: '⚔️ Chiến Mệnh',    desc: 'Sinh ra để chinh phạt, thống trị thiên hạ',  bonus: { attack: 20, ambitionWeight: 2 } },
    { id: 'shuimei',    label: '💧 Thuỷ Mệnh',     desc: 'Linh hoạt, khó nắm bắt, sống lâu',           bonus: { lifespan: 50, speed: 15 } },
    { id: 'longmei',    label: '🐉 Long Mệnh',     desc: 'Dòng máu rồng, tiềm năng vô hạn',            bonus: { talent: 25, realmBoost: 1 } },
    { id: 'common',     label: '🌱 Phàm Mệnh',     desc: 'Số phận bình thường, tự tạo vận mệnh',        bonus: {} },
  ];

  // ================================================================
  // LIVING WORLD STATE
  // ================================================================

  const LWE = {
    initialized:    false,
    tickCount:      0,
    lastTickYear:   0,
    events:         [],       // [{year, type, desc, npcName, icon}]
    clans:          {},       // clanId -> {name, founderId, members[], power, territory, gold}
    nations:        {},       // nationId -> {name, founderId, members[], army, territory, tribute}
    rebellions:     [],       // [{leaderId, sectId, year, reason}]
    memoryDump:     [],       // latest memory events for UI
    actionLog:      [],       // last 200 living-world actions
    _clanCounter:   1,
    _nationCounter: 1,
  };

  // ================================================================
  // SOUL INITIALIZER — inject soul into existing NPCs
  // ================================================================

  function initSoul(npc) {
    if (npc._soulInit) return;
    const talent      = _randInt(10, 100);
    const intelligence= _randInt(10, 100);
    const ambition    = _rand(AMBITIONS);
    const personality = _rand(PERSONALITY_TRAITS);
    const morality    = _randInt(-100, 100);
    const destiny     = _rand(DESTINY_TYPES);

    npc.soul = {
      ambition,
      personality,
      morality,          // -100 ma quân → 100 thánh nhân
      intelligence,
      talent,
      destiny:    destiny.id,
      // Memory
      memory: {
        enemies:     [],   // [{id, name, year, reason, debtScore}]
        benefactors: [],   // [{id, name, year, reason}]
        clan:        null, // clanId
        nation:      null, // nationId
        victories:   [],   // [{year, against, desc}]
        defeats:     [],   // [{year, by, desc}]
        betrayals:   [],   // [{year, targetId, targetName, reason}]
      },
      // Behavioral state
      currentGoal:   null,   // 'cultivate'|'hunt_boss'|'find_spouse'|'found_clan'|'found_nation'|'betray_sect'|'wage_war'|'gather'
      goalTimer:     0,      // years left on this goal
      rage:          0,      // 0-100, increases with insults/defeats
      gratitude:     0,      // 0-100, increases with help received
      ambitionFulfilled: 0,  // 0-100 progress towards ambition
    };

    // Apply destiny bonuses
    _applyDestinyBonus(npc, destiny);

    npc._soulInit = true;
  }

  function _applyDestinyBonus(npc, destiny) {
    const b = destiny.bonus || {};
    if (b.luck)       npc.luck       = Math.min(100, (npc.luck || 50) + b.luck);
    if (b.talent)     npc.soul.talent= Math.min(100, npc.soul.talent + b.talent);
    if (b.intelligence) npc.soul.intelligence = Math.min(100, npc.soul.intelligence + b.intelligence);
    if (b.morality)   npc.soul.morality = Math.max(-100, Math.min(100, npc.soul.morality + b.morality));
    if (b.lifespan)   npc.lifespan   = (npc.lifespan || 120) + b.lifespan;
    if (b.attack)     npc.attack     = (npc.attack || 10) + b.attack;
    if (b.speed)      npc.speed      = (npc.speed || 10) + b.speed;
  }

  function ensureAllSouls() {
    if (typeof npcs === 'undefined') return;
    // Chỉ init NPC chưa có soul — batch 50 cái mỗi lần để không block main thread
    const needSoul = npcs.filter(n => !n._soulInit);
    if (!needSoul.length) return;
    const batch = needSoul.slice(0, 50);
    batch.forEach(npc => initSoul(npc));
    if (needSoul.length > 50) setTimeout(ensureAllSouls, 0);
  }

  // ================================================================
  // MORALITY HELPERS
  // ================================================================

  function getMoralityInfo(morality) {
    for (const [key, m] of Object.entries(MORALITY_SCALE)) {
      if (morality >= m.min && morality <= m.max) return { key, ...m };
    }
    return { key: 'neutral', ...MORALITY_SCALE.neutral };
  }

  function adjustMorality(npc, delta) {
    if (!npc.soul) return;
    npc.soul.morality = Math.max(-100, Math.min(100, npc.soul.morality + delta));
  }

  // ================================================================
  // MEMORY SYSTEM
  // ================================================================

  function rememberEnemy(npc, enemy, reason, debtScore = 10) {
    if (!npc.soul) return;
    const existing = npc.soul.memory.enemies.find(e => e.id === enemy.id);
    if (existing) {
      existing.debtScore += debtScore;
      existing.lastYear = _getYear();
    } else {
      npc.soul.memory.enemies.push({
        id: enemy.id, name: enemy.name,
        year: _getYear(), reason, debtScore,
        lastYear: _getYear(),
      });
    }
    npc.soul.rage = Math.min(100, (npc.soul.rage || 0) + Math.floor(debtScore / 2));
  }

  function rememberBenefactor(npc, benefactor, reason) {
    if (!npc.soul) return;
    const exists = npc.soul.memory.benefactors.find(b => b.id === benefactor.id);
    if (!exists) {
      npc.soul.memory.benefactors.push({
        id: benefactor.id, name: benefactor.name,
        year: _getYear(), reason,
      });
    }
    npc.soul.gratitude = Math.min(100, (npc.soul.gratitude || 0) + 15);
  }

  function rememberVictory(npc, againstName, desc) {
    if (!npc.soul) return;
    npc.soul.memory.victories.push({ year: _getYear(), against: againstName, desc });
    if (npc.soul.memory.victories.length > 20) npc.soul.memory.victories.shift();
  }

  function rememberDefeat(npc, byName, desc) {
    if (!npc.soul) return;
    npc.soul.memory.defeats.push({ year: _getYear(), by: byName, desc });
    if (npc.soul.memory.defeats.length > 20) npc.soul.memory.defeats.shift();
  }

  function getTopEnemy(npc) {
    if (!npc.soul || !npc.soul.memory.enemies.length) return null;
    return npc.soul.memory.enemies.reduce((a, b) => a.debtScore > b.debtScore ? a : b);
  }

  // ================================================================
  // CLAN SYSTEM
  // ================================================================

  function foundClan(npc) {
    const clanId = `clan_${LWE._clanCounter++}`;
    const clanName = `${npc.family} Gia Tộc`;
    LWE.clans[clanId] = {
      id: clanId, name: clanName,
      founderId: npc.id, founderName: npc.name,
      members: [npc.id],
      power: npc.realm * 10 + (npc.soul?.talent || 50),
      territory: npc.region,
      gold: npc.wealth * 0.3,
      foundYear: _getYear(),
      generation: 1,
    };
    npc.soul.memory.clan = clanId;
    npc.soul.ambitionFulfilled = Math.min(100, npc.soul.ambitionFulfilled + 30);
    _lwLog(`🏰 ${npc.name} lập ${clanName}!`, 'clan', npc.name, '🏰');
    _liveEvent(_getYear(), 'clan_founded', `${npc.name} lập ${clanName}`, npc.name, '🏰');
    if (typeof addLog === 'function')      addLog(`🏰 ${npc.name} lập ${clanName}!`, 'important');
    if (typeof addTimeline === 'function') addTimeline(`🏰 ${clanName} thành lập`, 'civilization', '🏰');
  }

  function joinClan(npc, clanId) {
    const clan = LWE.clans[clanId];
    if (!clan || clan.members.includes(npc.id)) return;
    clan.members.push(npc.id);
    if (npc.soul) npc.soul.memory.clan = clanId;
    clan.power += npc.realm * 5;
    _lwLog(`👨‍👩‍👧 ${npc.name} gia nhập ${clan.name}`, 'clan', npc.name, '👨‍👩‍👧');
  }

  function clanInheritance(deadNpc) {
    if (!deadNpc.soul?.memory?.clan) return;
    const clan = LWE.clans[deadNpc.soul.memory.clan];
    if (!clan) return;
    clan.members = clan.members.filter(id => id !== deadNpc.id);
    if (clan.founderId === deadNpc.id && clan.members.length > 0 && typeof npcById === 'function') {
      const heir = npcById(clan.members[0]);
      if (heir) {
        clan.founderId = heir.id;
        clan.generation++;
        _lwLog(`👑 ${heir.name} kế thừa ${clan.name} (Thế hệ ${clan.generation})`, 'clan', heir.name, '👑');
      }
    }
    if (clan.members.length === 0) {
      _lwLog(`💀 ${clan.name} tuyệt tự — gia tộc diệt vong`, 'death', '', '💀');
      delete LWE.clans[clan.id];
    }
  }

  // ================================================================
  // NATION FOUNDING
  // ================================================================

  function foundNation(npc) {
    const nationId = `nation_${LWE._nationCounter++}`;
    const nationName = `${npc.name} Vương Quốc`;
    LWE.nations[nationId] = {
      id: nationId, name: nationName,
      founderId: npc.id, founderName: npc.name,
      members: [npc.id],
      army: npc.realm * 500 + (npc.soul?.talent || 50) * 10,
      territory: npc.region,
      gold: npc.wealth,
      foundYear: _getYear(),
      wars: 0,
    };
    if (npc.soul) {
      npc.soul.memory.nation = nationId;
      npc.soul.ambitionFulfilled = Math.min(100, npc.soul.ambitionFulfilled + 60);
    }
    _lwLog(`🏴 ${npc.name} lập ${nationName}!`, 'nation', npc.name, '🏴');
    _liveEvent(_getYear(), 'nation_founded', `${npc.name} lập ${nationName}`, npc.name, '🏴');
    if (typeof addLog === 'function')      addLog(`🏴 ${npc.name} lập ${nationName}!`, 'important');
    if (typeof addTimeline === 'function') addTimeline(`🏴 ${nationName} lập quốc`, 'nation_war', '🏴');
    if (typeof toast === 'function')       toast(`🏴 ${nationName} ra đời!`);
  }

  // ================================================================
  // SECT BETRAYAL SYSTEM
  // ================================================================

  function betraySect(npc) {
    if (!npc.sectId || typeof sects === 'undefined') return false;
    const sect = sects.find(s => s.id === npc.sectId);
    if (!sect) return false;

    const sectName = sect.name;
    sect.members   = sect.members.filter(id => id !== npc.id);
    sect.disciples = sect.disciples.filter(id => id !== npc.id);
    sect.elders    = sect.elders ? sect.elders.filter(id => id !== npc.id) : [];

    if (npc.soul) {
      npc.soul.memory.betrayals.push({
        year: _getYear(), targetId: sect.id, targetName: sectName, reason: 'ambition',
      });
    }
    adjustMorality(npc, -15);
    npc.sectId = null;

    // Steal resources from sect
    const stolen = Math.floor((sect.resources?.lingshi || 0) * 0.2);
    sect.resources = sect.resources || {};
    sect.resources.lingshi = Math.max(0, (sect.resources.lingshi || 0) - stolen);
    npc.resources = npc.resources || {};
    npc.resources.lingshi = (npc.resources.lingshi || 0) + stolen;

    _lwLog(`🗡️ ${npc.name} phản bội ${sectName}! Trộm ${stolen} linh thạch!`, 'betrayal', npc.name, '🗡️');
    _liveEvent(_getYear(), 'betrayal', `${npc.name} phản bội ${sectName}`, npc.name, '🗡️');
    if (typeof addLog === 'function') addLog(`🗡️ ${npc.name} phản bội ${sectName}!`, 'important');

    // Make members enemies
    sect.members.slice(0, 3).forEach(memberId => {
      const member = typeof npcById === 'function' ? npcById(memberId) : null;
      if (member?.soul) rememberEnemy(member, npc, 'phản bội tông môn', 20);
    });
    return true;
  }

  // ================================================================
  // REVENGE SYSTEM
  // ================================================================

  function attemptRevenge(npc) {
    const enemy = getTopEnemy(npc);
    if (!enemy || typeof npcById !== 'function') return false;
    const target = npcById(enemy.id);
    if (!target || target.status !== 'alive') {
      // Remove from enemies if dead
      npc.soul.memory.enemies = npc.soul.memory.enemies.filter(e => e.id !== enemy.id);
      return false;
    }
    // Stalk across regions — only attack if within range or high rage
    const sameRegion = npc.region === target.region;
    const highRage   = npc.soul.rage >= 70;
    if (!sameRegion && !highRage) return false;

    // Ambush: modified combat
    if (typeof combat === 'function') {
      const yearsWaited = _getYear() - enemy.year;
      if (yearsWaited > 10) {
        npc.attack += Math.floor(yearsWaited * 0.5); // grudge power
      }
      combat(npc, target);
      if (yearsWaited > 10) npc.attack -= Math.floor(yearsWaited * 0.5);
    }

    const revenge_desc = `${npc.name} báo thù ${target.name} (ghi nhớ ${_getYear() - enemy.year} năm)`;
    _lwLog(`🩸 ${revenge_desc}`, 'revenge', npc.name, '🩸');
    _liveEvent(_getYear(), 'revenge', revenge_desc, npc.name, '🩸');
    if (typeof addLog === 'function') addLog(`🩸 ${revenge_desc}`, 'important');
    rememberVictory(npc, target.name, 'báo thù thành công');
    npc.soul.memory.enemies = npc.soul.memory.enemies.filter(e => e.id !== enemy.id);
    npc.soul.rage = Math.max(0, npc.soul.rage - 40);
    return true;
  }

  // ================================================================
  // BOSS HUNT SYSTEM
  // ================================================================

  function huntBoss(npc) {
    if (typeof bosses === 'undefined' || !bosses.length) return false;
    const target = bosses[0];
    if (!target) return false;
    const power = npc.attack + npc.realm * 25 + (npc.soul?.talent || 50) * 0.5;
    const bossHP = target.hp;
    const damage = Math.floor(power * (0.8 + Math.random() * 0.4));
    target.hp = Math.max(0, target.hp - damage);

    _lwLog(`🐉 ${npc.name} săn boss ${target.name} — ${damage} sát thương!`, 'boss', npc.name, '🐉');

    if (target.hp <= 0) {
      // Boss killed
      npc.reputation = (npc.reputation || 0) + 500;
      npc.wealth     += target.gold || 0;
      if (typeof addLog === 'function')      addLog(`🏆 ${npc.name} hạ ${target.name}!`, 'important');
      if (typeof addTimeline === 'function') addTimeline(`🏆 ${npc.name} giết boss ${target.name}`, 'boss', '🏆');
      if (typeof toast === 'function')       toast(`🏆 ${npc.name} tiêu diệt ${target.name}!`);
      _liveEvent(_getYear(), 'boss_kill', `${npc.name} tiêu diệt ${target.name}`, npc.name, '🏆');
      if (typeof bosses !== 'undefined') window.bosses = bosses.filter(b => b !== target);
      rememberVictory(npc, target.name, `hạ boss ${target.name}`);
      npc.soul.ambitionFulfilled = Math.min(100, npc.soul.ambitionFulfilled + 20);
      return true;
    }
    return false;
  }

  // ================================================================
  // WAR DECLARATION (Nation vs Nation, Clan vs Clan)
  // ================================================================

  function declareWar(attackerNpc, targetClanOrNation, type = 'clan') {
    const year = _getYear();
    const name  = targetClanOrNation.name;
    const power = targetClanOrNation.power || targetClanOrNation.army || 100;

    // Outcome based on attacker stats + randomness
    const attackerPower = attackerNpc.realm * 200 + (attackerNpc.soul?.talent || 50) * 5 + attackerNpc.attack;
    const win = attackerPower * (0.7 + Math.random() * 0.6) > power;

    if (win) {
      adjustMorality(attackerNpc, -10);
      attackerNpc.reputation = (attackerNpc.reputation || 0) + 300;
      attackerNpc.wealth    += Math.floor(power * 10);
      if (type === 'clan') delete LWE.clans[targetClanOrNation.id];
      else delete LWE.nations[targetClanOrNation.id];
      _lwLog(`⚔️ ${attackerNpc.name} chiến thắng — ${name} bị xóa sổ!`, 'war', attackerNpc.name, '⚔️');
      _liveEvent(year, 'war_victory', `${attackerNpc.name} diệt ${name}`, attackerNpc.name, '⚔️');
      if (typeof addTimeline === 'function') addTimeline(`⚔️ ${attackerNpc.name} tiêu diệt ${name}`, 'war', '⚔️');
    } else {
      attackerNpc.hp = Math.max(1, attackerNpc.hp - Math.floor(attackerNpc.maxHp * 0.3));
      rememberDefeat(attackerNpc, name, `tấn công ${name} thất bại`);
      _lwLog(`💔 ${attackerNpc.name} tấn công ${name} — thất bại!`, 'war', attackerNpc.name, '💔');
    }
    return win;
  }

  // ================================================================
  // ADVANCED CULTIVATION
  // ================================================================

  function talentCultivation(npc) {
    if (!npc.soul) return;
    const baseMult = 1 + (npc.soul.talent / 100) * 2;
    const intBoost = npc.soul.intelligence / 200;
    npc.realmProgress = (npc.realmProgress || 0) + baseMult + intBoost;

    // Talent breakthrough
    if (npc.realmProgress >= 100 && typeof REALMS !== 'undefined' && npc.realm < REALMS.length - 1) {
      npc.realm++;
      npc.realmProgress = 0;
      if (typeof applyRealmBonus === 'function') applyRealmBonus(npc);
      const realmName = typeof REALMS !== 'undefined' ? (REALMS[npc.realm]?.name || `Cảnh ${npc.realm}`) : `Cảnh ${npc.realm}`;
      _lwLog(`✨ ${npc.name} đột phá ${realmName}! (Thiên tư ${npc.soul.talent})`, 'breakthrough', npc.name, '✨');
      if (typeof addLog === 'function') addLog(`✨ ${npc.name} đột phá ${realmName}!`, 'breakthrough');
    }
  }

  // ================================================================
  // DECISION ENGINE — main per-NPC AI
  // ================================================================

  function decideLivingAction(npc) {
    if (!npc.soul || npc.status !== 'alive') return;
    const s = npc.soul;

    // ─── Priority 1: Revenge if rage is high ───
    if (s.rage >= 60 && s.memory.enemies.length > 0) {
      if (_chance(0.4)) { attemptRevenge(npc); return; }
    }

    // ─── Priority 2: Survival if low HP ───
    if (npc.hp < npc.maxHp * 0.2) {
      npc.hp = Math.min(npc.maxHp, npc.hp + Math.floor(npc.maxHp * 0.15));
      _lwLog(`🌿 ${npc.name} ẩn tu hồi phục`, 'cultivate', npc.name, '🌿');
      return;
    }

    // ─── Goal timer ───
    if (s.currentGoal && s.goalTimer > 0) {
      executeCurrentGoal(npc);
      s.goalTimer--;
      return;
    }

    // ─── Decide new goal based on ambition + personality ───
    s.currentGoal = chooseGoal(npc);
    s.goalTimer   = _randInt(2, 8);
    executeCurrentGoal(npc);
  }

  function chooseGoal(npc) {
    const s = npc.soul;
    const w = []; // weighted choices

    // Ambition weights
    switch (s.ambition) {
      case 'conqueror':  w.push('wage_war','wage_war','hunt_boss','betray_sect'); break;
      case 'scholar':    w.push('cultivate','cultivate','gather','cultivate'); break;
      case 'survivor':   w.push('gather','cultivate','hide'); break;
      case 'protector':  w.push('hunt_boss','cultivate','gather'); break;
      case 'avenger':    w.push('revenge','hunt_boss','cultivate'); break;
      case 'hegemon':    w.push('found_nation','wage_war','hunt_boss'); break;
      case 'immortal':   w.push('cultivate','cultivate','hunt_boss','gather'); break;
      case 'tycoon':     w.push('gather','gather','cultivate'); break;
      case 'founder':    w.push('found_clan','cultivate','gather'); break;
      case 'wanderer':   w.push('gather','cultivate','hunt_boss'); break;
      default:           w.push('cultivate','gather'); break;
    }

    // Personality modifiers
    if (s.personality === 'aggressive')   w.push('wage_war','revenge');
    if (s.personality === 'treacherous')  w.push('betray_sect');
    if (s.personality === 'ambitious')    w.push('found_clan','found_nation');
    if (s.personality === 'cautious')     w.push('cultivate','gather');
    if (s.personality === 'loyal')        w.push('cultivate');
    if (s.personality === 'vengeful' && s.memory.enemies.length > 0) w.push('revenge','revenge');

    // Morality modifiers
    if (s.morality < -50)  w.push('betray_sect','wage_war');
    if (s.morality > 50)   w.push('hunt_boss','cultivate');

    // Life situation
    if (!npc.married && npc.age > 20 && npc.age < 80)     w.push('find_spouse');
    if (!s.memory.clan && npc.realm >= 3)                  w.push('found_clan');
    if (!s.memory.nation && npc.realm >= 6 && s.ambition === 'hegemon') w.push('found_nation');
    if (npc.sectId && s.morality < -30 && _chance(0.15))  w.push('betray_sect');
    if (s.memory.enemies.length > 0)                       w.push('revenge');

    return _rand(w) || 'cultivate';
  }

  function executeCurrentGoal(npc) {
    if (!npc.soul) return;
    switch (npc.soul.currentGoal) {
      case 'cultivate':    talentCultivation(npc); break;
      case 'hunt_boss':    huntBoss(npc); break;
      case 'find_spouse':  tryLivingMarriage(npc); break;
      case 'found_clan':   tryFoundClan(npc); break;
      case 'found_nation': tryFoundNation(npc); break;
      case 'betray_sect':  betraySect(npc); npc.soul.currentGoal = null; break;
      case 'wage_war':     tryWageWar(npc); break;
      case 'revenge':      attemptRevenge(npc); break;
      case 'gather':       livingGather(npc); break;
      case 'hide':         break; // nothing
    }
  }

  // ─── Action helpers ───

  function tryFoundClan(npc) {
    if (npc.soul.memory.clan) return; // already in a clan
    if (npc.realm < 2) return;
    if (npc.wealth < 100) return;
    if (_chance(0.3)) {
      foundClan(npc);
      npc.soul.currentGoal = null;
    }
  }

  function tryFoundNation(npc) {
    if (npc.soul.memory.nation) return;
    if (npc.realm < 5) return;
    if (npc.reputation < 500) return;
    if (_chance(0.2)) {
      foundNation(npc);
      npc.soul.currentGoal = null;
    }
  }

  function tryLivingMarriage(npc) {
    if (npc.married || typeof npcs === 'undefined') return;
    const candidates = npcs.filter(n =>
      n.id !== npc.id &&
      n.status === 'alive' &&
      !n.married &&
      n.age >= 18 &&
      n.age <= 100 &&
      n.gender !== npc.gender &&
      n.region === npc.region
    );
    if (!candidates.length) return;
    const partner = _rand(candidates);
    npc.married     = true;  npc.spouseId     = partner.id;
    partner.married = true;  partner.spouseId = npc.id;
    _lwLog(`💑 ${npc.name} kết hôn với ${partner.name}`, 'marriage', npc.name, '💑');
    if (typeof addLog === 'function') addLog(`💑 ${npc.name} kết hôn với ${partner.name}`);
    npc.soul.currentGoal = null;
    // Join clans if one exists
    if (npc.soul.memory.clan && partner.soul) joinClan(partner, npc.soul.memory.clan);
    if (partner.soul?.memory?.clan && npc.soul) joinClan(npc, partner.soul.memory.clan);
  }

  function tryWageWar(npc) {
    if (npc.realm < 3) return;
    // Try war against a rival clan/nation
    const clans   = Object.values(LWE.clans).filter(c => c.founderId !== npc.id);
    const nations = Object.values(LWE.nations).filter(n => n.founderId !== npc.id);
    const targets = [...clans, ...nations];
    if (!targets.length) { tryFoundClan(npc); return; }
    const target = _rand(targets);
    const type   = LWE.clans[target.id] ? 'clan' : 'nation';
    if (_chance(0.25)) {
      declareWar(npc, target, type);
      npc.soul.currentGoal = null;
    }
  }

  function livingGather(npc) {
    const gain = _randInt(5, 30) + Math.floor((npc.soul?.intelligence || 50) * 0.2);
    npc.resources = npc.resources || {};
    npc.resources.lingshi = (npc.resources.lingshi || 0) + gain;
    npc.wealth += gain * 0.5;
    // Small chance to find rare resource
    if (_chance(0.05)) {
      npc.resources.jingshi = (npc.resources.jingshi || 0) + 1;
      _lwLog(`💎 ${npc.name} tìm được Tinh Thạch!`, 'gather', npc.name, '💎');
    }
  }

  // ================================================================
  // BIRTH — children inherit soul traits
  // ================================================================

  function livingBirth(parent1, parent2) {
    if (!parent1?.soul || !parent2?.soul) return null;
    // Genetic inheritance
    const childTalent = Math.floor(
      (parent1.soul.talent * 0.4 + parent2.soul.talent * 0.4) +
      _randInt(-10, 20)  // mutation
    );
    const childIntelligence = Math.floor(
      (parent1.soul.intelligence * 0.4 + parent2.soul.intelligence * 0.4) +
      _randInt(-10, 15)
    );
    const childMorality = Math.floor(
      (parent1.soul.morality + parent2.soul.morality) / 2 +
      _randInt(-20, 20)
    );
    return {
      talent:      Math.max(1, Math.min(100, childTalent)),
      intelligence:Math.max(1, Math.min(100, childIntelligence)),
      morality:    Math.max(-100, Math.min(100, childMorality)),
      ambition:    _rand(AMBITIONS),
      personality: _rand(PERSONALITY_TRAITS),
      destiny:     _rand(DESTINY_TYPES).id,
    };
  }

  // ================================================================
  // HOOK INTO EXISTING SYSTEMS
  // ================================================================

  // Patch combat to add memory records
  const _origCombat = typeof combat === 'function' ? combat : null;
  if (typeof window !== 'undefined') {
    window._lweCombatHook = function(attacker, defender) {
      if (!attacker?.soul || !defender?.soul) return;
      rememberEnemy(defender, attacker, 'tấn công ta', 10);
      rememberEnemy(attacker, defender, 'giao chiến', 5);
    };
  }

  // Hook NPC generation: inject soul when created
  const _origHookNPCGeneration = typeof hookNPCGeneration === 'function' ? hookNPCGeneration : null;
  if (typeof window !== 'undefined') {
    window.hookNPCGeneration = function() {
      if (_origHookNPCGeneration) _origHookNPCGeneration();
      ensureAllSouls();
    };
  }

  // Hook birth system to pass soul traits
  const _origTryBirth = typeof tryBirth === 'function' ? tryBirth : null;

  // ================================================================
  // MAIN SIMULATION TICK
  // ================================================================

  window.simulateLivingWorld = function () {
    if (typeof npcs === 'undefined' || !npcs) return;
    // KHÔNG gọi ensureAllSouls() mỗi tick — chỉ gọi lúc boot/load

    const alive = npcs.filter(n => n.status === 'alive');
    if (!alive.length) return;

    LWE.tickCount++;
    LWE.lastTickYear = _getYear();

    // ─── Per-NPC decisions (sample to avoid lag: max 30 per tick) ───
    const sample = alive.length > 30 ? _sampleN(alive, 30) : alive;
    sample.forEach(npc => {
      try { decideLivingAction(npc); } catch(e) {}
    });

    // ─── Clan power decay ───
    Object.values(LWE.clans).forEach(clan => {
      clan.power = Math.max(0, clan.power - 1);
      // Remove dead members
      clan.members = clan.members.filter(id => {
        if (typeof npcById !== 'function') return true;
        const n = npcById(id);
        return n && n.status === 'alive';
      });
      if (clan.members.length === 0) {
        _lwLog(`💀 ${clan.name} tuyệt tự`, 'death', '', '💀');
        delete LWE.clans[clan.id];
      }
    });

    // ─── Nation events ───
    Object.values(LWE.nations).forEach(nation => {
      // Chance of uprising
      if (_chance(0.02)) {
        nation.army = Math.max(0, nation.army - _randInt(50, 200));
        _lwLog(`⚡ Nội loạn tại ${nation.name}!`, 'war', '', '⚡');
      }
    });

    // ─── Combat memory patch ───
    alive.forEach(npc => {
      if (npc.soul?.memory?.enemies?.length && _chance(0.05)) {
        attemptRevenge(npc);
      }
    });

    // Render if panel is visible
    _maybePatchRenderLivingPanel();
  };

  // ================================================================
  // HOOK INTO simulateWorld
  // ================================================================

  function patchSimulateWorld() {
    if (typeof window._lwePatched !== 'undefined') return;
    window._lwePatched = true;

    // Patch the combat function to record memories
    if (typeof window.combat === 'function') {
      const orig = window.combat;
      window.combat = function(attacker, defender) {
        orig(attacker, defender);
        // After combat, record memory
        if (attacker?.soul && defender?.status === 'alive') {
          rememberEnemy(defender, attacker, 'bị tấn công', 8);
        }
        if (attacker?.soul && defender?.status !== 'alive') {
          rememberVictory(attacker, defender.name, `đánh bại ${defender.name}`);
        }
      };
    }
  }

  // Inject simulateLivingWorld into simulateWorld via global hook
  if (typeof window !== 'undefined') {
    window._artifactYearlyHook_LWE_orig = window._artifactYearlyHook;
    window._artifactYearlyHook = function() {
      if (typeof window._artifactYearlyHook_LWE_orig === 'function') {
        window._artifactYearlyHook_LWE_orig();
      }
      try { window.simulateLivingWorld(); } catch(e) { console.warn('[LWE] tick error', e); }
    };
  }

  // ================================================================
  // UI — LIVING WORLD PANEL
  // ================================================================

  function renderLivingWorldPanel() {
    const panel = document.getElementById('panel-living-world');
    if (!panel) return;

    const clans   = Object.values(LWE.clans);
    const nations = Object.values(LWE.nations);
    const alive   = typeof npcs !== 'undefined' ? npcs.filter(n => n.status === 'alive' && n.soul) : [];
    const year    = _getYear();

    // Stats bar
    const topSouls = alive
      .sort((a, b) => (b.soul.talent + b.soul.intelligence) - (a.soul.talent + a.soul.intelligence))
      .slice(0, 10);

    const recentEvents = LWE.events.slice(-30).reverse();

    panel.innerHTML = `
      <div class="lwe-panel">
        <!-- Header -->
        <div class="lwe-header">
          <div class="lwe-title">⚡ LIVING WORLD ENGINE</div>
          <div class="lwe-subtitle">Thế Giới Tự Sống — Tick #${LWE.tickCount} · Năm ${year}</div>
        </div>

        <!-- Stats row -->
        <div class="lwe-stats-row">
          <div class="lwe-stat-card">
            <div class="lwe-stat-icon">🧬</div>
            <div class="lwe-stat-val">${alive.length}</div>
            <div class="lwe-stat-label">NPC Có Linh Hồn</div>
          </div>
          <div class="lwe-stat-card">
            <div class="lwe-stat-icon">🏰</div>
            <div class="lwe-stat-val">${clans.length}</div>
            <div class="lwe-stat-label">Gia Tộc</div>
          </div>
          <div class="lwe-stat-card">
            <div class="lwe-stat-icon">🏴</div>
            <div class="lwe-stat-val">${nations.length}</div>
            <div class="lwe-stat-label">Quốc Gia Mới</div>
          </div>
          <div class="lwe-stat-card">
            <div class="lwe-stat-icon">🩸</div>
            <div class="lwe-stat-val">${alive.reduce((s,n)=>s+(n.soul?.memory?.enemies?.length||0),0)}</div>
            <div class="lwe-stat-label">Mối Thù</div>
          </div>
        </div>

        <!-- Two columns -->
        <div class="lwe-grid-2">
          <!-- Left: Top Souls -->
          <div class="lwe-card">
            <div class="lwe-card-title">🌟 Linh Hồn Mạnh Nhất</div>
            <div class="lwe-soul-list">
              ${topSouls.map(npc => {
                const m = getMoralityInfo(npc.soul.morality);
                const destinyObj = DESTINY_TYPES.find(d => d.id === npc.soul.destiny) || DESTINY_TYPES[5];
                const realm = typeof REALMS !== 'undefined' ? (REALMS[npc.realm]?.name || `Cảnh ${npc.realm}`) : `Cảnh ${npc.realm}`;
                return `<div class="lwe-soul-row" onclick="openLivingNPCDetail(${npc.id})">
                  <div class="lwe-soul-main">
                    <span class="lwe-soul-name">${npc.name}</span>
                    <span class="lwe-soul-realm">${realm}</span>
                  </div>
                  <div class="lwe-soul-traits">
                    <span class="lwe-trait-pill" style="color:${m.color}">${m.label}</span>
                    <span class="lwe-trait-pill lwe-gold">✦ ${npc.soul.ambition}</span>
                  </div>
                  <div class="lwe-soul-bars">
                    <div class="lwe-bar-row"><span>天</span><div class="lwe-bar"><div class="lwe-bar-fill lwe-bar-talent" style="width:${npc.soul.talent}%"></div></div><span>${npc.soul.talent}</span></div>
                    <div class="lwe-bar-row"><span>智</span><div class="lwe-bar"><div class="lwe-bar-fill lwe-bar-int" style="width:${npc.soul.intelligence}%"></div></div><span>${npc.soul.intelligence}</span></div>
                  </div>
                  <div class="lwe-soul-meta">${destinyObj.label} · ${npc.soul.memory.enemies.length} kẻ thù · ${npc.soul.memory.victories.length} chiến thắng</div>
                </div>`;
              }).join('') || '<div class="lwe-empty">Chưa có NPC nào</div>'}
            </div>
          </div>

          <!-- Right: Clans & Nations -->
          <div class="lwe-card">
            <div class="lwe-card-title">🏰 Gia Tộc & Quốc Gia</div>
            <div class="lwe-factions">
              ${clans.map(c => `
                <div class="lwe-faction-row">
                  <span class="lwe-faction-icon">🏰</span>
                  <div class="lwe-faction-info">
                    <div class="lwe-faction-name">${c.name}</div>
                    <div class="lwe-faction-meta">${c.members.length} thành viên · Thế hệ ${c.generation} · Năm ${c.foundYear}</div>
                  </div>
                  <div class="lwe-faction-power">${Math.floor(c.power)}</div>
                </div>
              `).join('') || ''}
              ${nations.map(n => `
                <div class="lwe-faction-row lwe-nation-row">
                  <span class="lwe-faction-icon">🏴</span>
                  <div class="lwe-faction-info">
                    <div class="lwe-faction-name">${n.name}</div>
                    <div class="lwe-faction-meta">${n.members.length} thành viên · Quân ${n.army} · Năm ${n.foundYear}</div>
                  </div>
                  <div class="lwe-faction-power lwe-gold">${Math.floor(n.gold)}</div>
                </div>
              `).join('') || ''}
              ${!clans.length && !nations.length ? '<div class="lwe-empty">Chưa có gia tộc hay quốc gia nào</div>' : ''}
            </div>
          </div>
        </div>

        <!-- Event Log -->
        <div class="lwe-card">
          <div class="lwe-card-title">📜 Biên Niên Sử Sống</div>
          <div class="lwe-event-log">
            ${recentEvents.map(ev => `
              <div class="lwe-event-row lwe-ev-${ev.type}">
                <span class="lwe-ev-icon">${ev.icon}</span>
                <span class="lwe-ev-year">Năm ${ev.year}</span>
                <span class="lwe-ev-desc">${ev.desc}</span>
              </div>
            `).join('') || '<div class="lwe-empty">Chưa có sự kiện nào</div>'}
          </div>
        </div>

        <!-- Manual controls -->
        <div class="lwe-card">
          <div class="lwe-card-title">⚙️ Điều Khiển</div>
          <div class="lwe-controls">
            <button class="btn-lwe" onclick="window.simulateLivingWorld();renderLivingWorldPanel()">▶ Tick Thủ Công</button>
            <button class="btn-lwe" onclick="lweForceRevenge()">🩸 Kích Hoạt Báo Thù</button>
            <button class="btn-lwe" onclick="lweForceFoundClan()">🏰 Kích Hoạt Lập Gia Tộc</button>
            <button class="btn-lwe" onclick="lweSpawnGenius()">⭐ Tạo Thiên Tài Có Hồn</button>
            <button class="btn-lwe lwe-btn-danger" onclick="lwePurgeWeakClans()">🗑️ Diệt Gia Tộc Yếu</button>
          </div>
        </div>
      </div>
    `;
  }

  // ================================================================
  // NPC DETAIL MODAL (soul info)
  // ================================================================

  window.openLivingNPCDetail = function(npcId) {
    if (typeof npcById !== 'function') return;
    const npc = npcById(npcId);
    if (!npc || !npc.soul) return;
    const s = npc.soul;
    const m = getMoralityInfo(s.morality);
    const destinyObj = DESTINY_TYPES.find(d => d.id === s.destiny) || DESTINY_TYPES[5];
    const realm = typeof REALMS !== 'undefined' ? (REALMS[npc.realm]?.name || `Cảnh ${npc.realm}`) : `Cảnh ${npc.realm}`;
    const clanObj   = s.memory.clan   ? LWE.clans[s.memory.clan]   : null;
    const nationObj = s.memory.nation ? LWE.nations[s.memory.nation]: null;

    const modal = document.getElementById('lwe-npc-modal');
    if (!modal) return;
    document.getElementById('lwe-modal-body').innerHTML = `
      <div class="lwe-modal-hero">
        <div class="lwe-modal-name">${npc.name}</div>
        <div class="lwe-modal-realm">${realm} · Tuổi ${npc.age}/${npc.lifespan}</div>
        <div class="lwe-modal-destiny">${destinyObj.label} — ${destinyObj.desc}</div>
      </div>
      <div class="lwe-modal-grid">
        <div class="lwe-modal-section">
          <div class="lwe-modal-sec-title">⚡ Linh Hồn</div>
          <div class="lwe-modal-trait-row"><span>Tham Vọng</span><span class="lwe-gold">${s.ambition}</span></div>
          <div class="lwe-modal-trait-row"><span>Tính Cách</span><span>${s.personality}</span></div>
          <div class="lwe-modal-trait-row"><span>Đạo Đức</span><span style="color:${m.color}">${m.label} (${s.morality})</span></div>
          <div class="lwe-modal-trait-row"><span>Thiên Tư</span><span>${s.talent}/100</span></div>
          <div class="lwe-modal-trait-row"><span>Trí Tuệ</span><span>${s.intelligence}/100</span></div>
          <div class="lwe-modal-trait-row"><span>Tức Giận</span><span style="color:${s.rage>60?'#f87171':'#94a3b8'}">${s.rage}/100</span></div>
          <div class="lwe-modal-trait-row"><span>Biết Ơn</span><span style="color:#86efac">${s.gratitude}/100</span></div>
          <div class="lwe-modal-trait-row"><span>Mục Tiêu HT</span><span>${s.currentGoal || 'Không'}</span></div>
        </div>
        <div class="lwe-modal-section">
          <div class="lwe-modal-sec-title">🧠 Ký Ức</div>
          <div class="lwe-modal-sec-sub">Kẻ Thù (${s.memory.enemies.length})</div>
          ${s.memory.enemies.slice(0,5).map(e=>`<div class="lwe-mem-row lwe-mem-enemy">🩸 ${e.name} — Nợ ${e.debtScore} (Năm ${e.year})</div>`).join('')||'<span class="lwe-dim">Không có</span>'}
          <div class="lwe-modal-sec-sub">Ân Nhân (${s.memory.benefactors.length})</div>
          ${s.memory.benefactors.slice(0,3).map(b=>`<div class="lwe-mem-row lwe-mem-benef">💛 ${b.name} — ${b.reason}</div>`).join('')||'<span class="lwe-dim">Không có</span>'}
          <div class="lwe-modal-sec-sub">Chiến Thắng (${s.memory.victories.length})</div>
          ${s.memory.victories.slice(-3).map(v=>`<div class="lwe-mem-row">⚔️ Năm ${v.year}: ${v.desc}</div>`).join('')||'<span class="lwe-dim">Không có</span>'}
          <div class="lwe-modal-sec-sub">Thất Bại (${s.memory.defeats.length})</div>
          ${s.memory.defeats.slice(-3).map(d=>`<div class="lwe-mem-row lwe-mem-enemy">💔 Năm ${d.year}: ${d.desc}</div>`).join('')||'<span class="lwe-dim">Không có</span>'}
          ${s.memory.betrayals.length?`<div class="lwe-modal-sec-sub">Phản Bội (${s.memory.betrayals.length})</div>${s.memory.betrayals.slice(-2).map(b=>`<div class="lwe-mem-row lwe-mem-enemy">🗡️ Năm ${b.year}: ${b.targetName}</div>`).join('')}`:''}
        </div>
      </div>
      <div class="lwe-modal-clan-row">
        ${clanObj   ? `<div class="lwe-clan-badge">🏰 ${clanObj.name} (Thế hệ ${clanObj.generation})</div>` : ''}
        ${nationObj ? `<div class="lwe-clan-badge lwe-gold">🏴 ${nationObj.name}</div>` : ''}
      </div>
    `;
    modal.style.display = 'flex';
  };

  // ================================================================
  // CONTROL BUTTONS
  // ================================================================

  window.lweForceRevenge = function() {
    if (typeof npcs === 'undefined') return;
    let count = 0;
    npcs.filter(n => n.status === 'alive' && n.soul?.memory?.enemies?.length).forEach(npc => {
      if (attemptRevenge(npc)) count++;
    });
    if (typeof toast === 'function') toast(`🩸 ${count} màn báo thù xảy ra!`);
    renderLivingWorldPanel();
  };

  window.lweForceFoundClan = function() {
    if (typeof npcs === 'undefined') return;
    let count = 0;
    npcs.filter(n => n.status === 'alive' && n.soul && !n.soul.memory.clan && n.realm >= 2).slice(0, 3).forEach(npc => {
      foundClan(npc); count++;
    });
    if (typeof toast === 'function') toast(`🏰 ${count} gia tộc mới được lập!`);
    renderLivingWorldPanel();
  };

  window.lweSpawnGenius = function() {
    if (typeof createNPC !== 'function' || typeof npcs === 'undefined') return;
    const npc = createNPC(true);
    initSoul(npc);
    npc.soul.talent      = _randInt(85, 100);
    npc.soul.intelligence= _randInt(80, 100);
    npc.soul.destiny     = _rand(['tianming','longmei','zhanmei']).id || 'tianming';
    const destObj = DESTINY_TYPES.find(d=>d.id===npc.soul.destiny) || DESTINY_TYPES[0];
    _applyDestinyBonus(npc, destObj);
    npcs.push(npc);
    if (typeof addLog === 'function') addLog(`⭐ Thiên Tài ${npc.name} xuất hiện! Thiên tư ${npc.soul.talent}`, 'important');
    if (typeof toast === 'function')  toast(`⭐ ${npc.name} — Thiên Tài Có Hồn ra đời!`);
    renderLivingWorldPanel();
  };

  window.lwePurgeWeakClans = function() {
    let count = 0;
    Object.values(LWE.clans).forEach(c => {
      if (c.power < 20 || c.members.length === 0) { delete LWE.clans[c.id]; count++; }
    });
    if (typeof toast === 'function') toast(`🗑️ Đã giải tán ${count} gia tộc yếu`);
    renderLivingWorldPanel();
  };

  // ================================================================
  // INJECT UI INTO DOM
  // ================================================================

  function injectUI() {
    // ─── CSS ───
    const style = document.createElement('style');
    style.id = 'lwe-styles';
    style.textContent = `
      /* ========= LIVING WORLD ENGINE STYLES ========= */
      #panel-living-world { overflow-y: auto; }

      .lwe-panel { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

      .lwe-header { text-align: center; padding: 12px; background: linear-gradient(135deg, rgba(250,204,21,0.06), rgba(139,92,246,0.06)); border: 1px solid rgba(250,204,21,0.2); border-radius: 12px; }
      .lwe-title  { font-family: var(--font-heading); font-size: 15px; color: var(--gold); letter-spacing: 2px; }
      .lwe-subtitle { font-size: 11px; color: var(--white-dim); margin-top: 4px; letter-spacing: 0.5px; }

      .lwe-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
      @media(max-width:768px){ .lwe-stats-row { grid-template-columns: repeat(2,1fr); } }
      .lwe-stat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 10px; text-align: center; }
      .lwe-stat-icon { font-size: 18px; margin-bottom: 4px; }
      .lwe-stat-val  { font-size: 20px; font-weight: 700; color: var(--gold); }
      .lwe-stat-label{ font-size: 10px; color: var(--white-dim); margin-top: 2px; }

      .lwe-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      @media(max-width:900px){ .lwe-grid-2 { grid-template-columns: 1fr; } }

      .lwe-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
      .lwe-card-title { font-family: var(--font-title); font-size: 12px; color: var(--gold); letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }

      .lwe-soul-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
      .lwe-soul-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(250,204,21,0.08); border-radius: 8px; padding: 8px 10px; cursor: pointer; transition: all 0.2s; }
      .lwe-soul-row:hover { border-color: var(--gold); background: rgba(250,204,21,0.04); }
      .lwe-soul-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
      .lwe-soul-name  { font-size: 13px; color: var(--white-main); font-weight: 600; }
      .lwe-soul-realm { font-size: 11px; color: var(--gold-dim); }
      .lwe-soul-traits { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 5px; }
      .lwe-trait-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
      .lwe-gold { color: var(--gold) !important; }
      .lwe-soul-bars { display: flex; flex-direction: column; gap: 3px; margin-bottom: 4px; }
      .lwe-bar-row { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--white-dim); }
      .lwe-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
      .lwe-bar-fill { height: 100%; border-radius: 2px; }
      .lwe-bar-talent { background: linear-gradient(90deg, #facc15, #f59e0b); }
      .lwe-bar-int    { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
      .lwe-soul-meta { font-size: 10px; color: var(--white-dim); }

      .lwe-factions { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
      .lwe-faction-row { display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
      .lwe-nation-row { border-color: rgba(250,204,21,0.15) !important; }
      .lwe-faction-icon { font-size: 18px; }
      .lwe-faction-info { flex: 1; }
      .lwe-faction-name { font-size: 13px; color: var(--white-main); font-weight: 600; }
      .lwe-faction-meta { font-size: 10px; color: var(--white-dim); }
      .lwe-faction-power { font-size: 14px; font-weight: 700; color: #94a3b8; }

      .lwe-event-log { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
      .lwe-event-row { display: flex; align-items: baseline; gap: 8px; font-size: 12px; padding: 4px 6px; border-radius: 6px; background: rgba(255,255,255,0.015); }
      .lwe-ev-icon  { font-size: 14px; flex-shrink: 0; }
      .lwe-ev-year  { font-size: 10px; color: var(--gold-dim); white-space: nowrap; flex-shrink: 0; }
      .lwe-ev-desc  { color: var(--white-main); flex: 1; }
      .lwe-ev-betrayal { border-left: 2px solid #f87171; }
      .lwe-ev-clan     { border-left: 2px solid #fb923c; }
      .lwe-ev-nation   { border-left: 2px solid #facc15; }
      .lwe-ev-revenge  { border-left: 2px solid #c084fc; }
      .lwe-ev-boss     { border-left: 2px solid #60a5fa; }
      .lwe-ev-war      { border-left: 2px solid #f87171; }
      .lwe-ev-marriage { border-left: 2px solid #f472b6; }
      .lwe-ev-breakthrough { border-left: 2px solid #4ade80; }

      .lwe-controls { display: flex; flex-wrap: wrap; gap: 8px; }
      .btn-lwe { padding: 7px 14px; font-size: 12px; border-radius: 8px; border: 1px solid rgba(250,204,21,0.25); background: rgba(250,204,21,0.06); color: var(--gold); cursor: pointer; transition: all 0.2s; font-family: var(--font-cjk), serif; }
      .btn-lwe:hover { background: rgba(250,204,21,0.12); border-color: var(--gold); }
      .lwe-btn-danger { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.05); color: #f87171; }
      .lwe-btn-danger:hover { background: rgba(248,113,113,0.12); border-color: #f87171; }

      .lwe-empty { font-size: 12px; color: var(--white-dim); font-style: italic; padding: 8px; text-align: center; }
      .lwe-dim   { font-size: 11px; color: var(--white-dim); }

      /* Modal */
      #lwe-npc-modal { display: none; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.75); align-items: center; justify-content: center; padding: 16px; }
      .lwe-modal-inner { background: var(--bg-card); border: 1px solid rgba(250,204,21,0.3); border-radius: 16px; padding: 24px; max-width: 700px; width: 100%; max-height: 85vh; overflow-y: auto; position: relative; }
      .lwe-modal-close { position: absolute; top: 14px; right: 16px; background: none; border: none; color: var(--white-dim); font-size: 20px; cursor: pointer; }
      .lwe-modal-hero  { text-align: center; margin-bottom: 16px; }
      .lwe-modal-name  { font-family: var(--font-heading); font-size: 20px; color: var(--gold); }
      .lwe-modal-realm { font-size: 13px; color: var(--white-dim); margin-top: 4px; }
      .lwe-modal-destiny { font-size: 12px; color: #c084fc; margin-top: 6px; font-style: italic; }
      .lwe-modal-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
      @media(max-width:600px){ .lwe-modal-grid { grid-template-columns: 1fr; } }
      .lwe-modal-section { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
      .lwe-modal-sec-title { font-size: 12px; color: var(--gold); letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
      .lwe-modal-sec-sub   { font-size: 11px; color: var(--white-dim); margin: 8px 0 4px; }
      .lwe-modal-trait-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
      .lwe-mem-row   { font-size: 11px; color: var(--white-main); padding: 3px 0; }
      .lwe-mem-enemy { color: #f87171; }
      .lwe-mem-benef { color: #86efac; }
      .lwe-modal-clan-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .lwe-clan-badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.25); color: #fb923c; }
    `;
    if (!document.getElementById('lwe-styles')) document.head.appendChild(style);

    // ─── Nav button ───
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar && !document.querySelector('[data-panel="living-world"]')) {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.setAttribute('data-panel', 'living-world');
      btn.setAttribute('onclick', "showPanel('living-world')");
      btn.innerHTML = `<span>⚡</span><span>Living World</span>`;
      sidebar.appendChild(btn);
    }

    // ─── Panel ───
    const main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    if (!document.getElementById('panel-living-world')) {
      const panel = document.createElement('div');
      panel.id        = 'panel-living-world';
      panel.className = 'panel';
      main.appendChild(panel);
    }

    // ─── Modal ───
    if (!document.getElementById('lwe-npc-modal')) {
      const modal = document.createElement('div');
      modal.id = 'lwe-npc-modal';
      modal.innerHTML = `
        <div class="lwe-modal-inner">
          <button class="lwe-modal-close" onclick="document.getElementById('lwe-npc-modal').style.display='none'">✕</button>
          <div id="lwe-modal-body"></div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    }

    // ─── Patch showPanel ───
    const origShow = window.showPanel;
    window.showPanel = function(name) {
      origShow(name);
      if (name === 'living-world') renderLivingWorldPanel();
    };

    // Expose render function
    window.renderLivingWorldPanel = renderLivingWorldPanel;

    LWE.initialized = true;
    console.log(`[LWE v${LWE_VERSION}] Living World Engine khởi động ✓`);
  }

  // ================================================================
  // AUTO-REFRESH if panel is active
  // ================================================================

  function _maybePatchRenderLivingPanel() {
    const panel = document.getElementById('panel-living-world');
    if (panel && panel.classList.contains('active')) {
      renderLivingWorldPanel();
    }
  }

  // ================================================================
  // PERSISTENCE — save/load LWE state with main save
  // ================================================================

  function lweSave() {
    try {
      localStorage.setItem('cgv6_lwe_clans',   JSON.stringify(LWE.clans));
      localStorage.setItem('cgv6_lwe_nations', JSON.stringify(LWE.nations));
      localStorage.setItem('cgv6_lwe_events',  JSON.stringify(LWE.events.slice(-500)));
      localStorage.setItem('cgv6_lwe_counters',JSON.stringify({ c: LWE._clanCounter, n: LWE._nationCounter, t: LWE.tickCount }));
    } catch(e) {}
  }

  function lweLoad() {
    try {
      const clans   = localStorage.getItem('cgv6_lwe_clans');
      const nations = localStorage.getItem('cgv6_lwe_nations');
      const events  = localStorage.getItem('cgv6_lwe_events');
      const ctrs    = localStorage.getItem('cgv6_lwe_counters');
      if (clans)   LWE.clans   = JSON.parse(clans);
      if (nations) LWE.nations = JSON.parse(nations);
      if (events)  LWE.events  = JSON.parse(events);
      if (ctrs) {
        const c = JSON.parse(ctrs);
        LWE._clanCounter   = c.c || 1;
        LWE._nationCounter = c.n || 1;
        LWE.tickCount      = c.t || 0;
      }
    } catch(e) {}
  }

  // Hook into main save/load
  const _origSave = typeof window.save === 'function' ? window.save : null;
  if (_origSave) {
    window.save = function() { _origSave(); lweSave(); };
  }
  const _origLoad = typeof window.load === 'function' ? window.load : null;
  if (_origLoad) {
    window.load = function() { _origLoad(); lweLoad(); setTimeout(ensureAllSouls, 200); };
  }

  // ================================================================
  // UTILITIES
  // ================================================================

  function _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function _randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function _chance(p) { return Math.random() < p; }
  function _getYear() { return (typeof year !== 'undefined') ? year : 0; }
  function _sampleN(arr, n) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }
  function _lwLog(msg, type, npcName, icon = '⚡') {
    LWE.actionLog.unshift({ year: _getYear(), msg, type, npcName });
    if (LWE.actionLog.length > 200) LWE.actionLog.pop();
  }
  function _liveEvent(year, type, desc, npcName, icon = '⚡') {
    LWE.events.push({ year, type, desc, npcName, icon });
    if (LWE.events.length > 1000) LWE.events.shift();
  }

  // ================================================================
  // EXPOSE PUBLIC API
  // ================================================================

  window.LWE                  = LWE;
  window.LWE_AMBITIONS        = AMBITIONS;
  window.LWE_DESTINY_TYPES    = DESTINY_TYPES;
  window.LWE_PERSONALITY_TRAITS = PERSONALITY_TRAITS;
  window.initNPCSoul          = initSoul;
  window.ensureAllSouls       = ensureAllSouls;
  window.getMoralityInfo      = getMoralityInfo;
  window.rememberEnemy        = rememberEnemy;
  window.rememberBenefactor   = rememberBenefactor;
  window.rememberVictory      = rememberVictory;
  window.rememberDefeat       = rememberDefeat;
  window.foundClan            = foundClan;
  window.foundNation          = foundNation;
  window.betraySect           = betraySect;
  window.clanInheritance      = clanInheritance;
  window.livingBirth          = livingBirth;
  window.huntBoss             = huntBoss;
  window.talentCultivation    = talentCultivation;

  // ================================================================
  // BOOT
  // ================================================================

  function boot() {
    lweLoad();
    injectUI();
    patchSimulateWorld();
    ensureAllSouls();
    // Integrate with clanInheritance on NPC death
    const origKill = window.killNPC;
    if (origKill && !window._lweKillPatched) {
      window._lweKillPatched = true;
      window.killNPC = function(npc, reason, killerId, force) {
        origKill(npc, reason, killerId, force);
        try { clanInheritance(npc); } catch(e) {}
      };
    }
    console.log(`[LWE v${LWE_VERSION}] Boot hoàn tất. Thế giới đang sống...`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 500); // slight delay to let app.js finish
  }

})();
