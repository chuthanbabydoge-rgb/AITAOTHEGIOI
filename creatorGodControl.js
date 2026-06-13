/* ============================================================
   CREATOR GOD CONTROL V32
   Bảng Điều Khiển Đấng Sáng Tạo — World/Kingdom/Empire/
   Disaster/Boss/Artifact/Player/Timeline Controls
   EXPAND ONLY · NEVER REPLACE creatorGodEngine.js
   ============================================================ */
(function() {
  "use strict";
  const SAVE_KEY = "cgv6_creator_control_v32";

  window.creatorControlData = {
    snapshots: [],
    actions: [],
    initialized: false
  };

  /* ── SAVE / LOAD ── */
  function save() {
    try {
      const d = { snapshots: window.creatorControlData.snapshots.slice(0, 20), actions: window.creatorControlData.actions.slice(0, 100) };
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) { const p = JSON.parse(d); window.creatorControlData.snapshots = p.snapshots || []; window.creatorControlData.actions = p.actions || []; }
    } catch(e) {}
  }

  /* ── HELPERS ── */
  function now() { return (typeof year !== 'undefined') ? year : 0; }
  function toast(msg) { if (typeof window.toast === 'function') window.toast(msg); else alert(msg); }
  function log(msg, type) { if (typeof addLog === 'function') addLog(msg, type || 'important'); }
  function recordAction(cat, action, detail) {
    window.creatorControlData.actions.unshift({ year: now(), cat, action, detail, ts: Date.now() });
    if (window.creatorControlData.actions.length > 100) window.creatorControlData.actions.pop();
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: now(), type: 'creator', title: '[Tạo Hóa] ' + action, color: '#facc15' });
    save();
  }
  function getKingdoms() { return (typeof window.kingdomData !== 'undefined' && window.kingdomData.kingdoms) ? window.kingdomData.kingdoms : []; }
  function getEmpires() { return (typeof window.empireData !== 'undefined' && window.empireData.empires) ? window.empireData.empires : []; }
  function getLiveNPCs() { return (typeof npcs !== 'undefined') ? npcs.filter(n => n.status === 'alive') : []; }

  /* ════════════════════════════════════════════════
     KIỂM SOÁT THẾ GIỚI
  ════════════════════════════════════════════════ */

  window.cgcPauseWorld = function() {
    if (typeof window.simRunning !== 'undefined') {
      window.simRunning = false;
      if (typeof window.tcSetPause === 'function') window.tcSetPause(true);
    } else if (typeof window.toggleSim === 'function') { window.toggleSim(); }
    log('⏸ Đấng Tạo Hóa đóng băng thời gian!', 'important');
    recordAction('world', 'Đóng băng thời gian', 'Thế giới tạm dừng');
    toast('⏸ Thế Giới Đã Tạm Dừng');
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcResumeWorld = function() {
    if (typeof window.simRunning !== 'undefined') {
      window.simRunning = true;
      if (typeof window.tcSetPause === 'function') window.tcSetPause(false);
    } else if (typeof window.toggleSim === 'function') { window.toggleSim(); }
    log('▶ Đấng Tạo Hóa tái khởi thời gian!', 'important');
    recordAction('world', 'Tái khởi thời gian', 'Thế giới tiếp tục');
    toast('▶ Thế Giới Tiếp Tục');
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcSetSpeed = function(speed) {
    speed = parseInt(speed);
    if (typeof window.tcSetSpeed === 'function') window.tcSetSpeed(speed);
    else if (typeof window.simSpeed !== 'undefined') window.simSpeed = speed;
    log('⚡ Tạo Hóa điều chỉnh tốc độ thời gian: ' + speed + 'x', 'important');
    recordAction('world', 'Tốc độ thời gian ' + speed + 'x', 'Dòng thời gian gia tốc');
    toast('⚡ Tốc Độ: ' + speed + 'x');
  };

  window.cgcAdvanceTime = function(years) {
    years = parseInt(years) || 10;
    if (typeof window.year !== 'undefined') window.year += years;
    log('⏩ Tạo Hóa cuộn nhanh thời gian +' + years + ' năm!', 'important');
    recordAction('world', 'Cuộn nhanh +' + years + ' năm', 'Nhảy vọt dòng thời gian');
    toast('⏩ Đã nhảy +' + years + ' năm');
    if (typeof renderAll === 'function') renderAll();
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcCreateSnapshot = function(label) {
    if (typeof world === 'undefined' || !world) { toast('⚠️ Không có thế giới để lưu!'); return; }
    label = label || ('Snapshot Năm ' + now());
    try {
      const snap = {
        id: Date.now(),
        label,
        year: now(),
        worldName: world.name || '?',
        npcCount: (typeof npcs !== 'undefined') ? npcs.filter(n=>n.status==='alive').length : 0,
        countryCount: (typeof countries !== 'undefined') ? countries.length : 0,
        data: JSON.stringify({ world, year, npcs: (typeof npcs!=='undefined'?npcs:[]), countries: (typeof countries!=='undefined'?countries:[]) })
      };
      window.creatorControlData.snapshots.unshift(snap);
      if (window.creatorControlData.snapshots.length > 20) window.creatorControlData.snapshots.pop();
      save();
      log('📸 Đấng Tạo Hóa tạo Ảnh Chụp Thế Giới: ' + label, 'important');
      recordAction('timeline', 'Tạo snapshot: ' + label, 'Năm ' + now());
      toast('📸 Đã lưu: ' + label);
      if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
    } catch(e) { toast('⚠️ Lỗi lưu snapshot: ' + e.message); }
  };

  window.cgcRestoreSnapshot = function(snapId) {
    const snap = window.creatorControlData.snapshots.find(s => s.id == snapId);
    if (!snap) { toast('⚠️ Không tìm thấy snapshot!'); return; }
    if (!confirm('Khôi phục về: ' + snap.label + '?\n⚠️ Trạng thái hiện tại sẽ bị mất!')) return;
    try {
      const d = JSON.parse(snap.data);
      if (d.world) window.world = d.world;
      if (d.year !== undefined) window.year = d.year;
      if (d.npcs) window.npcs = d.npcs;
      if (d.countries) window.countries = d.countries;
      if (typeof save === 'function') save();
      if (typeof renderAll === 'function') renderAll();
      log('🔄 Đấng Tạo Hóa khôi phục thế giới từ: ' + snap.label, 'important');
      recordAction('timeline', 'Khôi phục snapshot: ' + snap.label, 'Trở về Năm ' + snap.year);
      toast('🔄 Đã khôi phục: ' + snap.label);
      if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
    } catch(e) { toast('⚠️ Lỗi khôi phục: ' + e.message); }
  };

  /* ════════════════════════════════════════════════
     KIỂM SOÁT VƯƠNG QUỐC
  ════════════════════════════════════════════════ */

  window.cgcCreateKingdom = function(name, ruler) {
    if (!name) { toast('⚠️ Cần nhập tên vương quốc!'); return; }
    try {
      if (typeof window.kingdomData !== 'undefined' && window.kingdomData.kingdoms) {
        const npcsAlive = getLiveNPCs();
        const rulerNpc = npcsAlive.find(n => n.name === ruler) || npcsAlive[Math.floor(Math.random()*npcsAlive.length)];
        const id = 'k_' + Date.now();
        const newK = { id, name, stage: 1, stageName: 'Vương Quốc', population: 10000 + Math.floor(Math.random()*40000), gold: 5000, military: 500 + Math.floor(Math.random()*500), ruler: rulerNpc ? rulerNpc.name : (ruler || 'Vô Danh'), dynasty: rulerNpc ? (rulerNpc.sect || 'Tân Triều') : 'Tân Triều', founded: now(), active: true, creatorMade: true };
        window.kingdomData.kingdoms.push(newK);
        if (typeof window.keSave === 'function') window.keSave();
        log('👑 Tạo Hóa lập nên Vương Quốc: ' + name + ' — Vua: ' + newK.ruler, 'important');
        recordAction('kingdom', 'Tạo Vương Quốc: ' + name, 'Vua: ' + newK.ruler);
        toast('👑 Đã tạo Vương Quốc: ' + name);
      } else { toast('⚠️ Hệ thống vương quốc chưa khởi động!'); }
    } catch(e) { toast('⚠️ Lỗi tạo vương quốc: ' + e.message); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcDestroyKingdom = function(kidId) {
    const kingdoms = getKingdoms();
    const k = kingdoms.find(k => k.id == kidId || k.name == kidId);
    if (!k) { toast('⚠️ Không tìm thấy vương quốc!'); return; }
    if (!confirm('Phá hủy Vương Quốc: ' + k.name + '?')) return;
    k.active = false; k.dissolved = now(); k.dissolvedBy = 'Tạo Hóa';
    if (typeof window.keSave === 'function') window.keSave();
    log('💥 Tạo Hóa phá hủy Vương Quốc: ' + k.name, 'important');
    recordAction('kingdom', 'Phá hủy Vương Quốc: ' + k.name, 'Năm ' + now());
    toast('💥 Đã phá hủy: ' + k.name);
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcUpgradeKingdom = function(kidId) {
    const kingdoms = getKingdoms();
    const k = kingdoms.find(k => k.id == kidId || k.name == kidId);
    if (!k) { toast('⚠️ Không tìm thấy vương quốc!'); return; }
    const stageNames = ['Làng', 'Lãnh Địa', 'Vương Quốc', 'Đại Vương Quốc', 'Đế Quốc'];
    const oldStage = k.stageName || 'Vương Quốc';
    k.stage = Math.min((k.stage || 1) + 1, 5);
    k.stageName = stageNames[k.stage - 1] || 'Đế Quốc';
    k.population = Math.floor((k.population || 10000) * 1.5);
    k.military = Math.floor((k.military || 500) * 1.4);
    k.gold = (k.gold || 5000) + 10000;
    if (typeof window.keSave === 'function') window.keSave();
    log('⬆️ Tạo Hóa nâng tầm ' + k.name + ': ' + oldStage + ' → ' + k.stageName, 'important');
    recordAction('kingdom', 'Nâng tầm: ' + k.name, oldStage + ' → ' + k.stageName);
    toast('⬆️ ' + k.name + ' → ' + k.stageName);
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcChangeKingdomRuler = function(kidId, newRulerName) {
    const kingdoms = getKingdoms();
    const k = kingdoms.find(k => k.id == kidId || k.name == kidId);
    if (!k) { toast('⚠️ Không tìm thấy vương quốc!'); return; }
    const oldRuler = k.ruler;
    k.ruler = newRulerName || 'Vô Danh';
    if (typeof window.keSave === 'function') window.keSave();
    log('👑 Tạo Hóa thay đổi vua ' + k.name + ': ' + oldRuler + ' → ' + k.ruler, 'important');
    recordAction('kingdom', 'Đổi vua: ' + k.name, oldRuler + ' → ' + k.ruler);
    toast('👑 Đổi vua: ' + k.ruler);
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  /* ════════════════════════════════════════════════
     KIỂM SOÁT ĐẾ CHẾ
  ════════════════════════════════════════════════ */

  window.cgcCreateEmpire = function(name, emperor) {
    if (!name) { toast('⚠️ Cần nhập tên đế chế!'); return; }
    try {
      if (typeof window.empireData !== 'undefined' && window.empireData.empires) {
        const npcsAlive = getLiveNPCs();
        const empNpc = npcsAlive.find(n => n.name === emperor) || npcsAlive.sort((a,b)=>(b.realm||0)-(a.realm||0))[0];
        const id = 'e_' + Date.now();
        const newE = { id, name, emperor: empNpc ? empNpc.name : (emperor || 'Vô Danh'), population: 100000 + Math.floor(Math.random()*200000), gold: 50000, military: 5000 + Math.floor(Math.random()*5000), founded: now(), active: true, territories: 5, prestige: 80, creatorMade: true };
        window.empireData.empires.push(newE);
        if (typeof window.eeSave === 'function') window.eeSave();
        log('🏛 Tạo Hóa kiến lập Đế Chế: ' + name + ' — Hoàng Đế: ' + newE.emperor, 'important');
        recordAction('empire', 'Tạo Đế Chế: ' + name, 'Hoàng Đế: ' + newE.emperor);
        toast('🏛 Đã tạo Đế Chế: ' + name);
      } else { toast('⚠️ Hệ thống đế chế chưa khởi động!'); }
    } catch(e) { toast('⚠️ Lỗi tạo đế chế: ' + e.message); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcDestroyEmpire = function(empId) {
    const empires = getEmpires();
    const e = empires.find(e => e.id == empId || e.name == empId);
    if (!e) { toast('⚠️ Không tìm thấy đế chế!'); return; }
    if (!confirm('Phá hủy Đế Chế: ' + e.name + '?')) return;
    e.active = false; e.collapsed = now(); e.collapsedBy = 'Tạo Hóa';
    if (typeof window.eeSave === 'function') window.eeSave();
    log('💥 Tạo Hóa phá hủy Đế Chế: ' + e.name, 'important');
    recordAction('empire', 'Phá hủy Đế Chế: ' + e.name, 'Năm ' + now());
    toast('💥 Đã phá hủy: ' + e.name);
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcMergeEmpires = function(empId1, empId2) {
    const empires = getEmpires();
    const e1 = empires.find(e => e.id == empId1 || e.name == empId1);
    const e2 = empires.find(e => e.id == empId2 || e.name == empId2);
    if (!e1 || !e2) { toast('⚠️ Cần 2 đế chế hợp lệ!'); return; }
    e1.population = (e1.population||0) + (e2.population||0);
    e1.military = (e1.military||0) + (e2.military||0);
    e1.gold = (e1.gold||0) + (e2.gold||0);
    e1.territories = (e1.territories||1) + (e2.territories||1);
    e1.prestige = Math.min(100, ((e1.prestige||50) + (e2.prestige||50)) / 2 + 20);
    e2.active = false; e2.mergedInto = e1.name; e2.mergedYear = now();
    if (typeof window.eeSave === 'function') window.eeSave();
    log('🔗 Tạo Hóa sáp nhập Đế Chế: ' + e2.name + ' → ' + e1.name, 'important');
    recordAction('empire', 'Sáp nhập: ' + e2.name + ' → ' + e1.name, 'Đế Chế ' + e1.name + ' mở rộng');
    toast('🔗 Đã sáp nhập vào: ' + e1.name);
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  /* ════════════════════════════════════════════════
     KIỂM SOÁT THẢM HỌA
  ════════════════════════════════════════════════ */

  window.cgcTriggerDisaster = function(type) {
    const disasterTypes = {
      earthquake: { name: '🌋 Động Đất', fn: 'disasterTriggerEarthquake', fallback: function() { _genericDisaster('Động Đất', 'earthquake'); } },
      volcano:    { name: '🔥 Núi Lửa',  fn: 'disasterTriggerVolcano',    fallback: function() { _genericDisaster('Núi Lửa', 'volcano'); } },
      tsunami:    { name: '🌊 Sóng Thần', fn: 'disasterTriggerTsunami',   fallback: function() { _genericDisaster('Sóng Thần', 'tsunami'); } },
      plague:     { name: '💀 Đại Dịch',  fn: 'plagueTriggerManual',      fallback: function() { _genericDisaster('Đại Dịch', 'plague'); } },
      famine:     { name: '🌾 Nạn Đói',   fn: 'disasterTriggerFamine',    fallback: function() { _genericDisaster('Nạn Đói', 'famine'); } },
      meteor:     { name: '☄️ Thiên Thạch', fn: 'disasterTriggerMeteor',  fallback: function() { _genericDisaster('Thiên Thạch', 'meteor'); } },
      invasion:   { name: '👾 Xâm Lược',  fn: 'invasionTriggerManual',    fallback: function() { _genericDisaster('Xâm Lược', 'invasion'); } }
    };
    const d = disasterTypes[type];
    if (!d) { toast('⚠️ Loại thảm họa không hợp lệ!'); return; }
    if (typeof window[d.fn] === 'function') { window[d.fn](); }
    else { d.fallback(); }
    log(d.name + ' — Tạo Hóa giáng họa lên thế giới!', 'important');
    recordAction('disaster', d.name, 'Tạo Hóa kích hoạt ' + d.name);
    toast(d.name + ' đã được kích hoạt!');
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  function _genericDisaster(name, type) {
    if (typeof countries !== 'undefined' && countries.length > 0) {
      const target = countries[Math.floor(Math.random() * countries.length)];
      if (target) {
        target.population = Math.floor((target.population || 1000) * 0.75);
        target.stability = Math.max(0, (target.stability || 50) - 20);
        if (type === 'plague' && typeof window.plagueData !== 'undefined') {
          if (!window.plagueData.activePlagues) window.plagueData.activePlagues = [];
          window.plagueData.activePlagues.push({ id: 'p_' + Date.now(), name: 'Đại Dịch Tạo Hóa', region: target.name, severity: 3, year: now(), type: 'plague' });
        }
        if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: now(), type: 'disaster', title: name + ' tàn phá ' + target.name, color: '#ef4444' });
        if (typeof addLog === 'function') addLog('💥 ' + name + ' tàn phá ' + target.name + ' — Dân số -25%', 'danger');
      }
    }
  }

  /* ════════════════════════════════════════════════
     KIỂM SOÁT TRÙM (BOSS)
  ════════════════════════════════════════════════ */

  window.cgcSummonBoss = function(tier) {
    tier = tier || 'legendary';
    if (typeof window.worldBossSpawnManual === 'function') {
      window.worldBossSpawnManual(tier);
      log('👹 Tạo Hóa triệu hồi Boss: ' + tier, 'important');
      recordAction('boss', 'Triệu hồi Boss ' + tier, 'Tier: ' + tier);
      toast('👹 Boss ' + tier + ' đã xuất hiện!');
    } else if (typeof window.worldBossData !== 'undefined') {
      const bossTemplates = { rare: '妖獸', epic: '魔王', legendary: '上古魔神', mythic: '天魔', divine: '神魔', creator: '創造神' };
      const tiers = { rare: 1, epic: 2, legendary: 3, mythic: 4, divine: 5, creator: 6 };
      if (!window.worldBossData.activeBosses) window.worldBossData.activeBosses = [];
      const boss = { id: 'b_' + Date.now(), name: (bossTemplates[tier] || 'Boss Tạo Hóa'), tier, tierLevel: tiers[tier] || 3, hp: 100000 * (tiers[tier] || 3), maxHp: 100000 * (tiers[tier] || 3), spawnYear: now(), active: true, creatorSummoned: true };
      window.worldBossData.activeBosses.push(boss);
      if (typeof window.wbSave === 'function') window.wbSave();
      log('👹 Tạo Hóa triệu hồi Boss [' + tier + ']: ' + boss.name, 'important');
      recordAction('boss', 'Triệu hồi Boss: ' + boss.name, 'Tier: ' + tier);
      toast('👹 Boss ' + boss.name + ' xuất hiện!');
    } else { toast('⚠️ Hệ thống Boss V31 chưa khởi động!'); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcTriggerInvasion = function(type) {
    type = type || 'demon';
    if (typeof window.invasionTriggerManual === 'function') {
      window.invasionTriggerManual(type);
      log('🌋 Tạo Hóa kích hoạt Xâm Lược: ' + type, 'important');
    } else if (typeof window.invasionData !== 'undefined') {
      if (!window.invasionData.activeInvasions) window.invasionData.activeInvasions = [];
      const typeNames = { demon: 'Ma Tộc Xâm Lược', undead: 'Quân Đội Vong Linh', divine: 'Thiên Binh Trừng Phạt', void: 'Hư Không Ma Quân', titan: 'Thần Tộc Hắc Ám' };
      window.invasionData.activeInvasions.push({ id: 'inv_' + Date.now(), type, name: typeNames[type] || 'Xâm Lược', startYear: now(), wave: 1, active: true, creatorTriggered: true });
      if (typeof window.invSave === 'function') window.invSave();
      log('🌋 Tạo Hóa kích hoạt ' + (typeNames[type] || 'Xâm Lược'), 'important');
    }
    recordAction('boss', 'Kích hoạt xâm lược: ' + type, 'Xâm lược bắt đầu');
    toast('🌋 Xâm Lược ' + type + ' bắt đầu!');
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  /* ════════════════════════════════════════════════
     KIỂM SOÁT CỔ VẬT
  ════════════════════════════════════════════════ */

  window.cgcCreateArtifact = function(name, tier) {
    tier = tier || 'legendary';
    try {
      if (typeof window.artifactData !== 'undefined') {
        const tierPower = { common: 100, rare: 500, epic: 2000, legendary: 8000, divine: 30000 };
        const art = { id: 'art_' + Date.now(), name: name || ('Thần Khí Tạo Hóa ' + now()), tier, power: tierPower[tier] || 8000, created: now(), creatorMade: true, owner: null };
        if (!window.artifactData.artifacts) window.artifactData.artifacts = [];
        window.artifactData.artifacts.push(art);
        if (typeof window.artSave === 'function') window.artSave();
        log('💎 Tạo Hóa tạo Cổ Vật: ' + art.name + ' [' + tier + ']', 'important');
        recordAction('artifact', 'Tạo Cổ Vật: ' + art.name, 'Tier: ' + tier);
        toast('💎 Đã tạo: ' + art.name);
      } else { toast('⚠️ Hệ thống cổ vật chưa khởi động!'); }
    } catch(e) { toast('⚠️ Lỗi tạo cổ vật: ' + e.message); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcAssignArtifact = function(artId, npcName) {
    try {
      if (typeof window.artifactData !== 'undefined' && window.artifactData.artifacts) {
        const art = window.artifactData.artifacts.find(a => a.id == artId || a.name == artId);
        const npc = getLiveNPCs().find(n => n.name === npcName);
        if (!art) { toast('⚠️ Không tìm thấy cổ vật!'); return; }
        if (!npc) { toast('⚠️ Không tìm thấy tu sĩ: ' + npcName); return; }
        const oldOwner = art.owner;
        art.owner = npc.name;
        npc.attack = Math.floor((npc.attack||10) * 1.2);
        if (!npc.artifacts) npc.artifacts = [];
        npc.artifacts.push(art.name);
        if (typeof window.artSave === 'function') window.artSave();
        log('💎 Tạo Hóa trao ' + art.name + ' cho ' + npc.name, 'important');
        recordAction('artifact', 'Trao Cổ Vật: ' + art.name, oldOwner + ' → ' + npc.name);
        toast('💎 Đã trao cho: ' + npc.name);
      }
    } catch(e) { toast('⚠️ ' + e.message); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  /* ════════════════════════════════════════════════
     KIỂM SOÁT NGƯỜI CHƠI
  ════════════════════════════════════════════════ */

  window.cgcPlayerLevelUp = function(levels) {
    levels = parseInt(levels) || 1;
    try {
      const playerObj = window.playerData || window.player || (typeof player !== 'undefined' ? player : null);
      if (playerObj) {
        playerObj.realm = Math.min((playerObj.realm || 0) + levels, 9);
        if (typeof window.REALMS !== 'undefined') playerObj.realmName = window.REALMS[playerObj.realm]?.name || 'Cảnh Giới ' + playerObj.realm;
        playerObj.attack = Math.floor((playerObj.attack || 100) * Math.pow(1.3, levels));
        playerObj.maxHp = Math.floor((playerObj.maxHp || 1000) * Math.pow(1.2, levels));
        playerObj.hp = playerObj.maxHp;
        if (typeof window.playerSave === 'function') window.playerSave();
        log('⭐ Tạo Hóa thăng cấp Người Chơi lên Cảnh Giới ' + playerObj.realm, 'important');
        recordAction('player', 'Thăng cấp người chơi +' + levels, 'Cảnh Giới: ' + playerObj.realm);
        toast('⭐ Thăng Cấp! Cảnh Giới: ' + playerObj.realm);
      } else { toast('⚠️ Người chơi chưa khởi tạo!'); }
    } catch(e) { toast('⚠️ ' + e.message); }
    if (typeof window.creatorControlRenderPanel === 'function') window.creatorControlRenderPanel();
  };

  window.cgcGrantPlayerTitle = function(title) {
    if (!title) { toast('⚠️ Cần nhập danh hiệu!'); return; }
    try {
      const playerObj = window.playerData || (typeof player !== 'undefined' ? player : null);
      if (playerObj) {
        if (!playerObj.titles) playerObj.titles = [];
        playerObj.titles.unshift(title);
        if (typeof window.playerSave === 'function') window.playerSave();
        log('🏆 Tạo Hóa ban Danh Hiệu: ' + title, 'important');
        recordAction('player', 'Ban danh hiệu: ' + title, 'Người chơi nhận danh hiệu');
        toast('🏆 Ban danh hiệu: ' + title);
      } else { toast('⚠️ Người chơi chưa khởi tạo!'); }
    } catch(e) { toast('⚠️ ' + e.message); }
  };

  window.cgcGrantPlayerResources = function(gold, spirit) {
    gold = parseInt(gold) || 0; spirit = parseInt(spirit) || 0;
    try {
      const playerObj = window.playerData || (typeof player !== 'undefined' ? player : null);
      if (playerObj) {
        playerObj.gold = (playerObj.gold || 0) + gold;
        playerObj.spiritStones = (playerObj.spiritStones || 0) + spirit;
        if (typeof window.playerSave === 'function') window.playerSave();
        log('💰 Tạo Hóa ban tặng: Vàng +' + gold + ' | Linh Thạch +' + spirit, 'important');
        recordAction('player', 'Ban tài nguyên', 'Vàng +' + gold + ', Linh Thạch +' + spirit);
        toast('💰 Nhận: ' + gold + ' Vàng + ' + spirit + ' Linh Thạch');
      } else { toast('⚠️ Người chơi chưa khởi tạo!'); }
    } catch(e) { toast('⚠️ ' + e.message); }
  };

  /* ════════════════════════════════════════════════
     RENDER PANEL
  ════════════════════════════════════════════════ */

  window.creatorControlRenderPanel = function() {
    const panel = document.getElementById('panel-creator-control');
    if (!panel) return;

    const kingdoms = getKingdoms().filter(k => k.active !== false);
    const empires = getEmpires().filter(e => e.active !== false);
    const activeBosses = (typeof window.worldBossData !== 'undefined' && window.worldBossData.activeBosses) ? window.worldBossData.activeBosses.filter(b => b.active !== false) : [];
    const snaps = window.creatorControlData.snapshots;
    const simRunning = typeof window.simRunning !== 'undefined' ? window.simRunning : true;
    const curYear = now();

    panel.innerHTML = `
<div style="padding:16px;max-width:900px;margin:0 auto">
  <div style="text-align:center;margin-bottom:16px">
    <div style="font-family:var(--font-heading);font-size:20px;color:var(--gold);text-shadow:0 0 20px rgba(250,204,21,0.4)">👁 BẢNG ĐIỀU KHIỂN ĐẤNG SÁNG TẠO V32</div>
    <div style="font-size:12px;color:var(--white-dim);margin-top:4px">Năm ${curYear} · ${kingdoms.length} Vương Quốc · ${empires.length} Đế Chế · ${activeBosses.length} Boss · Sim: ${simRunning?'▶ Đang chạy':'⏸ Tạm dừng'}</div>
  </div>

  <!-- TABS -->
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    ${['world','kingdom','empire','disaster','boss','artifact','player','timeline'].map((t,i) => {
      const labels = ['🌍 Thế Giới','👑 Vương Quốc','🏛 Đế Chế','💥 Thảm Họa','👹 Boss','💎 Cổ Vật','🧘 Người Chơi','⏳ Timeline'];
      return `<button onclick="document.querySelectorAll('.cgc-tab-content').forEach(e=>e.style.display='none');document.getElementById('cgc-tab-${t}').style.display='block';this.parentElement.querySelectorAll('button').forEach(b=>b.style.borderColor='rgba(255,255,255,0.1)');this.style.borderColor='var(--gold)'" style="padding:6px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--white-dim);cursor:pointer;font-size:11px">${labels[i]}</button>`;
    }).join('')}
  </div>

  <!-- WORLD CONTROL TAB -->
  <div id="cgc-tab-world" class="cgc-tab-content">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:13px;color:var(--gold);margin-bottom:10px;font-weight:700">🌍 KIỂM SOÁT THẾ GIỚI</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button onclick="cgcPauseWorld()" class="btn-danger small" style="padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px">⏸ Tạm Dừng</button>
        <button onclick="cgcResumeWorld()" class="btn-jade small" style="padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px">▶ Tiếp Tục</button>
        <button onclick="cgcSetSpeed(1)" class="btn-secondary small">1x</button>
        <button onclick="cgcSetSpeed(5)" class="btn-secondary small">5x</button>
        <button onclick="cgcSetSpeed(10)" class="btn-secondary small">10x</button>
        <button onclick="cgcSetSpeed(50)" class="btn-secondary small">50x</button>
        <button onclick="cgcSetSpeed(100)" class="btn-secondary small">100x</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="cgc-advance-years" type="number" value="50" min="1" max="10000" style="width:80px;padding:6px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px">
        <button onclick="cgcAdvanceTime(document.getElementById('cgc-advance-years').value)" class="btn-primary small">⏩ Nhảy Năm</button>
      </div>
    </div>
  </div>

  <!-- KINGDOM CONTROL TAB -->
  <div id="cgc-tab-kingdom" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:13px;color:var(--gold);margin-bottom:10px;font-weight:700">👑 KIỂM SOÁT VƯƠNG QUỐC</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-end">
        <input id="cgc-k-name" placeholder="Tên Vương Quốc" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:160px">
        <button onclick="cgcCreateKingdom(document.getElementById('cgc-k-name').value)" class="btn-jade small">+ Lập Vương Quốc</button>
      </div>
      <div style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${kingdoms.length === 0 ? '<div style="color:var(--white-dim);font-size:12px">Chưa có vương quốc nào</div>' :
          kingdoms.slice(0, 15).map(k => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:7px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:12px;color:var(--gold)">${k.name}</div>
                <div style="font-size:11px;color:var(--white-dim)">${k.stageName||'Vương Quốc'} · Vua: ${k.ruler||'?'} · Dân: ${(k.population||0).toLocaleString()}</div>
              </div>
              <div style="display:flex;gap:5px">
                <button onclick="cgcUpgradeKingdom('${k.id||k.name}')" style="padding:4px 8px;background:rgba(250,204,21,0.1);border:1px solid rgba(250,204,21,0.3);border-radius:5px;color:var(--gold);cursor:pointer;font-size:10px">⬆ Nâng</button>
                <button onclick="cgcDestroyKingdom('${k.id||k.name}')" style="padding:4px 8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:5px;color:var(--red);cursor:pointer;font-size:10px">💥 Phá</button>
              </div>
            </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- EMPIRE CONTROL TAB -->
  <div id="cgc-tab-empire" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:13px;color:var(--gold);margin-bottom:10px;font-weight:700">🏛 KIỂM SOÁT ĐẾ CHẾ</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-end">
        <input id="cgc-e-name" placeholder="Tên Đế Chế" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:160px">
        <button onclick="cgcCreateEmpire(document.getElementById('cgc-e-name').value)" class="btn-jade small">+ Lập Đế Chế</button>
      </div>
      <div style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${empires.length === 0 ? '<div style="color:var(--white-dim);font-size:12px">Chưa có đế chế nào</div>' :
          empires.slice(0, 15).map(e => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:7px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:12px;color:#c084fc">${e.name}</div>
                <div style="font-size:11px;color:var(--white-dim)">Hoàng Đế: ${e.emperor||'?'} · Lãnh Thổ: ${e.territories||0}</div>
              </div>
              <div style="display:flex;gap:5px">
                <button onclick="cgcDestroyEmpire('${e.id||e.name}')" style="padding:4px 8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:5px;color:var(--red);cursor:pointer;font-size:10px">💥 Sụp Đổ</button>
              </div>
            </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- DISASTER TAB -->
  <div id="cgc-tab-disaster" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--red);margin-bottom:12px;font-weight:700">💥 KIỂM SOÁT THẢM HỌA</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
        ${[['earthquake','🌋 Động Đất'],['volcano','🔥 Núi Lửa'],['tsunami','🌊 Sóng Thần'],['plague','💀 Đại Dịch'],['famine','🌾 Nạn Đói'],['meteor','☄️ Thiên Thạch'],['invasion','👾 Xâm Lược']].map(([t,n])=>`
          <button onclick="cgcTriggerDisaster('${t}')" style="padding:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:8px;color:var(--red);cursor:pointer;font-size:13px;text-align:center;transition:all 0.2s" onmouseover="this.style.background='rgba(239,68,68,0.18)'" onmouseout="this.style.background='rgba(239,68,68,0.08)'">${n}</button>`).join('')}
      </div>
    </div>
  </div>

  <!-- BOSS TAB -->
  <div id="cgc-tab-boss" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:13px;color:#f87171;margin-bottom:12px;font-weight:700">👹 TRIỆU HỒI BOSS & XÂM LƯỢC</div>
      <div style="margin-bottom:12px">
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:8px">BOSS TIER</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[['rare','⚪ Rare'],['epic','🟢 Epic'],['legendary','🟡 Legendary'],['mythic','🟠 Mythic'],['divine','🔴 Divine'],['creator','⭐ Creator']].map(([t,n])=>`
            <button onclick="cgcSummonBoss('${t}')" style="padding:8px 14px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:7px;color:#fca5a5;cursor:pointer;font-size:12px" onmouseover="this.style.background='rgba(248,113,113,0.18)'" onmouseout="this.style.background='rgba(248,113,113,0.08)'">${n}</button>`).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--white-dim);margin-bottom:8px">KÍCH HOẠT XÂM LƯỢC</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[['demon','😈 Ma Tộc'],['undead','💀 Vong Linh'],['divine','⚡ Thiên Binh'],['void','🌑 Hư Không'],['titan','🔱 Thần Tộc']].map(([t,n])=>`
            <button onclick="cgcTriggerInvasion('${t}')" style="padding:8px 14px;background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.25);border-radius:7px;color:#c084fc;cursor:pointer;font-size:12px">${n}</button>`).join('')}
        </div>
      </div>
      ${activeBosses.length > 0 ? `<div style="margin-top:12px"><div style="font-size:11px;color:var(--white-dim);margin-bottom:6px">BOSS ĐANG HOẠT ĐỘNG (${activeBosses.length})</div>${activeBosses.slice(0,5).map(b=>`<div style="font-size:11px;color:#f87171;padding:4px 8px;background:rgba(248,113,113,0.05);border-radius:4px;margin-bottom:3px">👹 ${b.name} [${b.tier||'?'}] HP: ${((b.hp||0)/(b.maxHp||1)*100).toFixed(0)}%</div>`).join('')}</div>` : ''}
    </div>
  </div>

  <!-- ARTIFACT TAB -->
  <div id="cgc-tab-artifact" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:#67e8f9;margin-bottom:12px;font-weight:700">💎 KIỂM SOÁT CỔ VẬT</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:flex-end">
        <input id="cgc-art-name" placeholder="Tên Cổ Vật" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:140px">
        <select id="cgc-art-tier" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px">
          <option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary" selected>Legendary</option><option value="divine">Divine</option>
        </select>
        <button onclick="cgcCreateArtifact(document.getElementById('cgc-art-name').value,document.getElementById('cgc-art-tier').value)" class="btn-jade small">+ Tạo Cổ Vật</button>
      </div>
    </div>
  </div>

  <!-- PLAYER TAB -->
  <div id="cgc-tab-player" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--jade);margin-bottom:12px;font-weight:700">🧘 KIỂM SOÁT NGƯỜI CHƠI</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button onclick="cgcPlayerLevelUp(1)" class="btn-primary small">⭐ Thăng 1 Cấp</button>
          <button onclick="cgcPlayerLevelUp(3)" class="btn-primary small">⭐⭐ Thăng 3 Cấp</button>
          <button onclick="cgcPlayerLevelUp(9)" class="btn-primary small">⭐⭐⭐ Thăng Tối Đa</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input id="cgc-player-title" placeholder="Danh hiệu" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:160px">
          <button onclick="cgcGrantPlayerTitle(document.getElementById('cgc-player-title').value)" class="btn-jade small">🏆 Ban Danh Hiệu</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input id="cgc-player-gold" type="number" placeholder="Vàng" value="10000" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:100px">
          <input id="cgc-player-spirit" type="number" placeholder="Linh Thạch" value="1000" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:110px">
          <button onclick="cgcGrantPlayerResources(document.getElementById('cgc-player-gold').value,document.getElementById('cgc-player-spirit').value)" class="btn-jade small">💰 Ban Tài Nguyên</button>
        </div>
      </div>
    </div>
  </div>

  <!-- TIMELINE TAB -->
  <div id="cgc-tab-timeline" class="cgc-tab-content" style="display:none">
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:13px;color:var(--purple);margin-bottom:12px;font-weight:700">⏳ DÒNG THỜI GIAN & SNAPSHOT</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-end">
        <input id="cgc-snap-label" placeholder="Tên Snapshot" style="padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:6px;color:var(--white-main);font-size:12px;width:180px">
        <button onclick="cgcCreateSnapshot(document.getElementById('cgc-snap-label').value||null)" class="btn-primary small">📸 Tạo Snapshot</button>
      </div>
      <div style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:5px">
        ${snaps.length === 0 ? '<div style="color:var(--white-dim);font-size:12px">Chưa có snapshot nào</div>' :
          snaps.map(s => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:7px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:12px;color:var(--white-main)">📸 ${s.label}</div>
                <div style="font-size:11px;color:var(--white-dim)">Năm ${s.year} · ${s.npcCount||0} tu sĩ · ${s.countryCount||0} quốc gia</div>
              </div>
              <button onclick="cgcRestoreSnapshot(${s.id})" style="padding:4px 9px;background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.3);border-radius:5px;color:#c084fc;cursor:pointer;font-size:10px">🔄 Khôi Phục</button>
            </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- RECENT ACTIONS -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-top:10px">
    <div style="font-size:12px;color:var(--white-dim);margin-bottom:8px;font-weight:700">📋 HÀNH ĐỘNG GẦN ĐÂY</div>
    <div style="max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:3px">
      ${window.creatorControlData.actions.slice(0,10).map(a=>`
        <div style="font-size:11px;color:var(--white-dim);padding:3px 6px;background:rgba(255,255,255,0.02);border-radius:4px">
          <span style="color:var(--gold-dim)">Năm ${a.year}</span> · <span style="color:var(--white-main)">${a.action}</span> · ${a.detail}
        </div>`).join('') || '<div style="font-size:11px;color:var(--white-dim)">Chưa có hành động nào</div>'}
    </div>
  </div>
</div>`;
  };

  /* ── INIT ── */
  function init() {
    load();
    window.creatorControlData.initialized = true;
    console.log('[CreatorGodControl V32] Khởi động thành công — Bảng Điều Khiển sẵn sàng.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 2000); });
  } else {
    setTimeout(init, 2000);
  }
})();
