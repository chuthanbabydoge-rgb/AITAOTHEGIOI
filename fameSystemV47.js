(function() {
  "use strict";
  const SAVE_KEY = "cgv6_fame_v47";

  // ============================================================
  // FAME SYSTEM V47 — Danh Tiếng · Di Sản · Phản Diện · AI Hành Trình
  // ============================================================

  const HERO_ARCHETYPES = [
    { id: "hero",       name: "Anh Hùng",             icon: "⚔️",  color: "#f59e0b", fameMultiplier: 1.2 },
    { id: "prophet",    name: "Nhà Tiên Tri",          icon: "🔮",  color: "#8b5cf6", fameMultiplier: 1.0 },
    { id: "saint",      name: "Thánh Nhân",            icon: "☀️",  color: "#fbbf24", fameMultiplier: 1.1 },
    { id: "founder",    name: "Nhà Sáng Lập",          icon: "🏛️", color: "#10b981", fameMultiplier: 1.3 },
    { id: "conqueror",  name: "Kẻ Chinh Phục",         icon: "🌌",  color: "#6366f1", fameMultiplier: 1.5 },
    { id: "scholar",    name: "Học Giả Vĩ Đại",        icon: "📚",  color: "#06b6d4", fameMultiplier: 0.9 },
  ];

  const VILLAIN_ARCHETYPES = [
    { id: "demon_king",    name: "Ma Vương",          icon: "👹",  color: "#dc2626", fameMultiplier: 1.5, karmaThreshold: -60 },
    { id: "tyrant",        name: "Bạo Chúa",          icon: "🔱",  color: "#b91c1c", fameMultiplier: 1.3, karmaThreshold: -40 },
    { id: "fallen_god",    name: "Dị Thần",           icon: "🌑",  color: "#7c3aed", fameMultiplier: 1.4, karmaThreshold: -50 },
    { id: "conqueror_evil","name": "Kẻ Chinh Phạt",    icon: "💀",  color: "#991b1b", fameMultiplier: 1.6, karmaThreshold: -45 },
  ];

  const LEGACY_TYPES = [
    { id: "doctrine",  name: "Học Thuyết",      icon: "📜" },
    { id: "sect",      name: "Tông Môn",         icon: "🏯" },
    { id: "dynasty",   name: "Vương Triều",      icon: "👑" },
    { id: "religion",  name: "Tôn Giáo",         icon: "⛪" },
    { id: "weapon",    name: "Vũ Khí Huyền Thoại", icon: "⚔️" },
    { id: "bloodline", name: "Hậu Duệ",          icon: "🧬" },
  ];

  const JOURNEY_STAGES = [
    { id: "birth",       name: "Xuất Thế",        icon: "🌟", desc: "Thiên tài xuất thế, dị tượng đầy trời." },
    { id: "trial",       name: "Thử Thách",        icon: "⚔️", desc: "Trải qua vô số thử thách, ý chí như thép." },
    { id: "awakening",   name: "Giác Ngộ",         icon: "💡", desc: "Đạt được giác ngộ, tiến vào cảnh giới mới." },
    { id: "rivalry",     name: "Kình Địch",        icon: "🔥", desc: "Đối mặt với kình địch đáng sợ, chiến đấu sinh tử." },
    { id: "sacrifice",   name: "Hy Sinh",          icon: "✨", desc: "Hy sinh vì đại nghĩa, lưu danh sử sách." },
    { id: "ascension",   name: "Siêu Việt",        icon: "🌌", desc: "Vượt qua mọi giới hạn, đạt đến đỉnh cao." },
    { id: "legacy",      name: "Di Sản",           icon: "🏛️", desc: "Để lại di sản lưu truyền ngàn đời." },
  ];

  function defaultData() {
    return {
      fameProfiles: {},    // heroId → {local, world, multiverse, archetype, isVillain}
      legacies: [],        // Di sản để lại
      journeys: [],        // Hành trình anh hùng AI
      villainEvents: [],   // Sự kiện phản diện
      rivalries: [],       // Kình địch giữa các nhân vật
      lastTick: 0,
      stats: { heroesTracked: 0, legaciesCreated: 0, journeysCompleted: 0, villainsRisen: 0 },
    };
  }

  window.fameV47Data = window.fameV47Data || defaultData();

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.fameV47Data)); } catch(e) {}
  }
  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.fameV47Data = Object.assign(defaultData(), JSON.parse(d));
    } catch(e) { window.fameV47Data = defaultData(); }
  }

  // ============================================================
  // FAME PROFILE — tạo hoặc lấy profile danh tiếng
  // ============================================================
  function getOrCreateProfile(npc) {
    const d = window.fameV47Data;
    if (!d.fameProfiles[npc.id]) {
      const score = npc.legendScore || 0;
      const karma = npc.karma || 0;
      const isVillain = karma <= -40 || (npc._hleGenius === "deviant");

      let archetype = null;
      if (isVillain) {
        archetype = VILLAIN_ARCHETYPES.reduce((best, v) => {
          return (karma <= v.karmaThreshold && (!best || v.karmaThreshold > best.karmaThreshold)) ? v : best;
        }, null) || VILLAIN_ARCHETYPES[0];
      } else {
        if ((npc.achievements || []).some(a => ["found_empire","found_nation"].includes(a.type))) archetype = HERO_ARCHETYPES.find(a => a.id === "founder");
        else if ((npc.achievements || []).some(a => a.type === "sect_found")) archetype = HERO_ARCHETYPES.find(a => a.id === "founder");
        else if (score >= 5000) archetype = HERO_ARCHETYPES.find(a => a.id === "conqueror");
        else if (score >= 2000) archetype = HERO_ARCHETYPES.find(a => a.id === "saint");
        else archetype = HERO_ARCHETYPES.find(a => a.id === "hero");
      }

      d.fameProfiles[npc.id] = {
        heroId: npc.id,
        heroName: npc.name,
        isVillain,
        archetype: archetype ? archetype.id : "hero",
        archetypeName: archetype ? archetype.name : "Anh Hùng",
        archetypeIcon: archetype ? archetype.icon : "⚔️",
        archetypeColor: archetype ? archetype.color : "#f59e0b",
        fameLocal: Math.min(100, Math.floor(score / 20)),
        fameWorld: Math.min(100, Math.floor(score / 50)),
        fameMultiverse: Math.min(100, Math.floor(score / 200)),
        journeyStage: 0,
        journeyComplete: false,
        createdYear: window.year || 1,
      };
      d.stats.heroesTracked++;
    }
    return d.fameProfiles[npc.id];
  }

  // ============================================================
  // UPDATE FAME — tăng danh tiếng theo điểm huyền thoại
  // ============================================================
  function updateFame(npcId, points) {
    const d = window.fameV47Data;
    const profile = d.fameProfiles[npcId];
    if (!profile) return;
    profile.fameLocal = Math.min(100, profile.fameLocal + Math.floor(points / 10));
    profile.fameWorld = Math.min(100, profile.fameWorld + Math.floor(points / 30));
    profile.fameMultiverse = Math.min(100, profile.fameMultiverse + Math.floor(points / 100));
    save();
  }

  // ============================================================
  // CREATE LEGACY — để lại di sản
  // ============================================================
  function createLegacy(npc, profile) {
    const d = window.fameV47Data;
    const score = npc.legendScore || 0;

    let legacyType;
    if (score >= 5000) legacyType = LEGACY_TYPES.find(l => l.id === "religion");
    else if (score >= 3000) legacyType = LEGACY_TYPES.find(l => l.id === "dynasty");
    else if (score >= 2000) legacyType = LEGACY_TYPES.find(l => l.id === "sect");
    else if (score >= 1000) legacyType = LEGACY_TYPES.find(l => l.id === "doctrine");
    else if (score >= 500) legacyType = LEGACY_TYPES.find(l => l.id === "weapon");
    else legacyType = LEGACY_TYPES.find(l => l.id === "bloodline");

    const legacyNames = {
      doctrine: `Học Thuyết ${npc.name}`,
      sect: `${npc.name} Tông`,
      dynasty: `Vương Triều ${npc.family || npc.name}`,
      religion: `Đạo ${npc.name}`,
      weapon: `Thần Binh của ${npc.name}`,
      bloodline: `Huyết Mạch ${npc.family || npc.name}`,
    };

    const legacy = {
      id: "leg_" + Date.now() + "_" + npc.id,
      heroId: npc.id,
      heroName: npc.name,
      type: legacyType.id,
      typeName: legacyType.name,
      icon: legacyType.icon,
      name: legacyNames[legacyType.id] || `Di Sản ${npc.name}`,
      year: window.year || 1,
      desc: `${profile.archetypeIcon} ${npc.name} (${profile.archetypeName}) đã để lại ${legacyType.name} lưu truyền thiên cổ.`,
      strength: Math.min(100, Math.floor(score / 100)),
      isActive: true,
    };

    d.legacies.unshift(legacy);
    if (d.legacies.length > 200) d.legacies.pop();
    d.stats.legaciesCreated++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "legacy", title: `${legacyType.icon} Di Sản: ${legacy.name}`, color: "#10b981" });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "legacy", msg: `${legacyType.icon} Di sản mới: ${legacy.name} do ${npc.name} để lại.` });
    }
    save();
    return legacy;
  }

  // ============================================================
  // AI HERO JOURNEY — tự động tạo hành trình
  // ============================================================
  function advanceJourney(npc, profile) {
    if (profile.journeyComplete) return;
    const stage = JOURNEY_STAGES[profile.journeyStage];
    if (!stage) { profile.journeyComplete = true; return; }

    const journey = {
      id: "jour_" + Date.now() + "_" + npc.id,
      heroId: npc.id,
      heroName: npc.name,
      stage: stage.id,
      stageName: stage.name,
      icon: stage.icon,
      desc: `${stage.icon} ${npc.name} — ${stage.name}: ${stage.desc}`,
      year: window.year || 1,
    };

    const d = window.fameV47Data;
    d.journeys.unshift(journey);
    if (d.journeys.length > 500) d.journeys.pop();

    profile.journeyStage++;
    if (profile.journeyStage >= JOURNEY_STAGES.length) {
      profile.journeyComplete = true;
      d.stats.journeysCompleted++;
      if (typeof window.waeAddAlert === "function") {
        window.waeAddAlert({ type: "hero_journey", msg: `🌟 ${npc.name} đã hoàn thành hành trình anh hùng!` });
      }
    }

    if (typeof window.legV47AddChronicle === "function") {
      window.legV47AddChronicle(npc.name, journey.desc, window.year || 1);
    }
    save();
  }

  // ============================================================
  // VILLAIN RISE EVENT
  // ============================================================
  function generateVillainEvent(npc, profile) {
    const d = window.fameV47Data;
    const archetype = VILLAIN_ARCHETYPES.find(v => v.id === profile.archetype) || VILLAIN_ARCHETYPES[0];
    const events = [
      `${archetype.icon} ${npc.name} — ${archetype.name} — tuyên bố thống trị thiên hạ, lập đại ma triều.`,
      `${archetype.icon} ${npc.name} tung đại chiêu hủy diệt, cả một vùng biến thành đất chết.`,
      `${archetype.icon} ${npc.name} thu phục 99 đại ma tướng, thế lực vang danh tứ phương.`,
      `${archetype.icon} ${npc.name} phá vỡ phong ấn ngàn năm, ma khí bao trùm khắp nơi.`,
    ];
    const msg = events[Math.floor(Math.random() * events.length)];
    d.villainEvents.unshift({ id: "vil_" + Date.now(), heroName: npc.name, archetype: archetype.name, icon: archetype.icon, msg, year: window.year || 1 });
    if (d.villainEvents.length > 200) d.villainEvents.pop();
    d.stats.villainsRisen++;

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "villain", title: `${archetype.icon} Ma Vương Xuất Hiện: ${npc.name}`, color: "#dc2626" });
    }
    if (typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "villain", msg });
    }
    save();
  }

  // ============================================================
  // CREATE RIVALRY
  // ============================================================
  function createRivalry(heroA, heroB) {
    const d = window.fameV47Data;
    const existing = d.rivalries.find(r =>
      (r.heroAId === heroA.id && r.heroBId === heroB.id) ||
      (r.heroAId === heroB.id && r.heroBId === heroA.id));
    if (existing) return;

    const rivalry = {
      id: "riv_" + Date.now(),
      heroAId: heroA.id, heroAName: heroA.name,
      heroBId: heroB.id, heroBName: heroB.name,
      year: window.year || 1,
      clashes: 1,
      desc: `⚡ Kình địch thiên định: ${heroA.name} vs ${heroB.name} — hai đỉnh phong chạm nhau tạo sấm sét.`,
      isActive: true,
    };
    d.rivalries.unshift(rivalry);
    if (d.rivalries.length > 100) d.rivalries.pop();

    if (typeof window.htAddEvent === "function") {
      window.htAddEvent({ year: window.year || 1, type: "rivalry", title: `⚡ Kình Địch: ${heroA.name} vs ${heroB.name}`, color: "#f97316" });
    }
    save();
  }

  // ============================================================
  // SYNC từ heroLegendData
  // ============================================================
  function syncFromHeroLegend() {
    if (!window.heroLegendData) return;
    const hd = window.heroLegendData;
    const allHeroes = Object.values(hd.heroes || {});

    allHeroes.forEach(hero => {
      const npc = (window.npcs || []).find(n => n.id === hero.id);
      if (!npc || (hero.legendScore || 0) < 200) return;
      const profile = getOrCreateProfile(Object.assign({}, npc, hero));
      updateFame(npc.id, hero.legendScore || 0);

      // Random chance: villain event
      if (profile.isVillain && Math.random() < 0.005) {
        generateVillainEvent(npc, profile);
      }
      // Journey advance
      if (!profile.journeyComplete && Math.random() < 0.003) {
        advanceJourney(npc, profile);
      }
    });

    // Check rivalries: top 2 living heroes
    const topHeroes = allHeroes.filter(h => (h.legendScore || 0) >= 1000).sort((a,b) => b.legendScore - a.legendScore);
    if (topHeroes.length >= 2) {
      const hA = topHeroes[0], hB = topHeroes[1];
      const nA = (window.npcs || []).find(n => n.id === hA.id);
      const nB = (window.npcs || []).find(n => n.id === hB.id);
      if (nA && nB && Math.random() < 0.002) createRivalry(nA, nB);
    }
  }

  // ============================================================
  // ON HERO DEATH — create legacy
  // ============================================================
  function onHeroDeath(npc) {
    const d = window.fameV47Data;
    const profile = d.fameProfiles[npc.id];
    if (!profile) return;
    if ((npc.legendScore || 0) >= 500) createLegacy(npc, profile);
    if (profile.isVillain && typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "villain_death", msg: `💀 ${profile.archetypeIcon} ${npc.name} — ${profile.archetypeName} — đã bị tiêu diệt!` });
    }
    if (!profile.isVillain && typeof window.waeAddAlert === "function") {
      window.waeAddAlert({ type: "hero_death", msg: `✨ ${profile.archetypeIcon} ${npc.name} — ${profile.archetypeName} — tử trận anh dũng!` });
    }
  }

  // ============================================================
  // GAME TICK
  // ============================================================
  window.fameV47Tick = function() {
    const d = window.fameV47Data;
    d.lastTick = (d.lastTick || 0) + 1;
    if (d.lastTick % 30 === 0) syncFromHeroLegend();
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.fv47GetProfiles = function() { return Object.values(window.fameV47Data.fameProfiles); };
  window.fv47GetHeroes = function() { return Object.values(window.fameV47Data.fameProfiles).filter(p => !p.isVillain); };
  window.fv47GetVillains = function() { return Object.values(window.fameV47Data.fameProfiles).filter(p => p.isVillain); };
  window.fv47GetLegacies = function() { return window.fameV47Data.legacies; };
  window.fv47GetJourneys = function() { return window.fameV47Data.journeys; };
  window.fv47GetVillainEvents = function() { return window.fameV47Data.villainEvents; };
  window.fv47GetRivalries = function() { return window.fameV47Data.rivalries; };
  window.fv47GetStats = function() { return window.fameV47Data.stats; };
  window.fv47GetProfile = function(id) { return window.fameV47Data.fameProfiles[id]; };
  window.fv47GetHeroArchetypes = function() { return HERO_ARCHETYPES; };
  window.fv47GetVillainArchetypes = function() { return VILLAIN_ARCHETYPES; };
  window.fv47OnHeroDeath = onHeroDeath;
  window.fv47CreateLegacy = createLegacy;
  window.fv47GetTopByFame = function(type, limit) {
    const profiles = Object.values(window.fameV47Data.fameProfiles);
    const key = type === "local" ? "fameLocal" : type === "multiverse" ? "fameMultiverse" : "fameWorld";
    return profiles.sort((a,b) => (b[key]||0) - (a[key]||0)).slice(0, limit || 20);
  };

  // ============================================================
  // HOOK vào killNPC để tạo legacy khi hero chết
  // ============================================================
  function patchKillNPC() {
    if (window._fv47PatchedKill) return;
    if (typeof window.killNPC !== "function") return;
    window._fv47PatchedKill = true;
    const orig = window.killNPC;
    window.killNPC = function(npc, reason) {
      const result = orig.apply(this, arguments);
      try { onHeroDeath(npc); } catch(e) {}
      return result;
    };
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    load();
    const _orig = window.gameTick;
    window.gameTick = function() { if (_orig) _orig(); try { window.fameV47Tick(); } catch(e) {} };
    setTimeout(patchKillNPC, 500);
    console.log("[FameSystemV47] 🌟 Danh Tiếng & Di Sản V47 khởi động —", Object.keys(window.fameV47Data.fameProfiles).length, "hồ sơ ·", window.fameV47Data.legacies.length, "di sản ·", window.fameV47Data.stats.villainsRisen, "phản diện.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 4500); });
  } else {
    setTimeout(init, 4500);
  }
})();
