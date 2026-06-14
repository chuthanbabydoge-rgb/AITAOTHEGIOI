(function() {
  "use strict";
  const SAVE_KEY = "cgv6_universe_lifecycle_v81";

  window.universeLifecycleV81Data = {
    stage: "dormant",
    milestones: [],
    birthYear: null,
    evolutionEvents: [],
    lastTick: 0
  };

  const LIFECYCLE_STAGES = [
    { id: "dormant",     label: "Trống Không",    icon: "🌑", minYear: 0,    desc: "Vũ trụ chưa được tạo" },
    { id: "genesis",     label: "Khai Sinh",       icon: "🌟", minYear: 1,    desc: "Thế giới vừa ra đời — NPC đầu tiên xuất hiện" },
    { id: "primitive",   label: "Nguyên Thủy",     icon: "🌱", minYear: 100,  desc: "Bộ lạc đầu tiên hình thành, ngôn ngữ sơ khai" },
    { id: "ancient",     label: "Thượng Cổ",       icon: "🏛️", minYear: 500,  desc: "Vương quốc đầu tiên, tôn giáo xuất hiện" },
    { id: "classical",   label: "Cổ Điển",         icon: "⚔️", minYear: 2000, desc: "Đế chế, chiến tranh lớn, anh hùng huyền thoại" },
    { id: "medieval",    label: "Trung Cổ",        icon: "🏰", minYear: 5000, desc: "Phong kiến, tôn giáo tổ chức, thương mại" },
    { id: "renaissance", label: "Phục Hưng",       icon: "🎨", minYear: 10000,desc: "Nghệ thuật, khoa học, triết học nở rộ" },
    { id: "modern",      label: "Cận Đại",         icon: "⚗️", minYear: 20000,desc: "Công nghệ cao, đế quốc công nghiệp" },
    { id: "transcendent",label: "Siêu Việt",       icon: "🌌", minYear: 50000,desc: "Văn minh xuyên vũ trụ, kết nối đa chiều" }
  ];

  const MILESTONE_DEFS = [
    { id: "first_world",      label: "Thế Giới Ra Đời",    icon: "🌍", check: () => !!(window.world && window.world.name) },
    { id: "first_npc",        label: "NPC Đầu Tiên",       icon: "👤", check: () => (window.npcs || []).length >= 1 },
    { id: "first_country",    label: "Quốc Gia Đầu Tiên",  icon: "🏳️", check: () => (window.countries || []).length >= 1 },
    { id: "first_kingdom",    label: "Vương Quốc Đầu Tiên",icon: "🏰", check: () => { const k = window.kingdomData; if (!k) return false; const arr = Array.isArray(k.kingdoms) ? k.kingdoms : Object.values(k.kingdoms || {}); return arr.length >= 1; } },
    { id: "first_war",        label: "Chiến Tranh Đầu Tiên",icon: "⚔️", check: () => (window.warsActive || []).length >= 1 || (window.warsHistory && window.warsHistory.length >= 1) },
    { id: "ten_npcs",         label: "10 Sinh Linh",       icon: "👥", check: () => (window.npcs || []).length >= 10 },
    { id: "five_countries",   label: "5 Quốc Gia",         icon: "🗺️", check: () => (window.countries || []).length >= 5 },
    { id: "first_empire",     label: "Đế Chế Đầu Tiên",   icon: "👑", check: () => { const e = window.empireData; if (!e) return false; const arr = Array.isArray(e.empires) ? e.empires : Object.values(e.empires || {}); return arr.length >= 1; } },
    { id: "ai_genesis",       label: "AI Tạo Thế Giới",    icon: "🤖", check: () => { const d = window.aiGenesisV75Data; return !!(d && d.history && d.history.length > 0); } },
    { id: "xr_ready",         label: "XR Sẵn Sàng",        icon: "🥽", check: () => !!(window.xrEngineV69Data || window.xrWorldV72Data) },
    { id: "multiverse_open",  label: "Đa Vũ Trụ Mở Ra",   icon: "🌌", check: () => !!(window.universeHubV73Data && (window.universeHubV73Data.portals || []).length > 0) },
    { id: "dna_created",      label: "DNA Thế Giới",       icon: "🧬", check: () => !!(window.worldDnaV62Data && window.worldDnaV62Data.currentDNA) },
    { id: "sentient_civ",     label: "Văn Minh Có Ý Thức", icon: "🧠", check: () => !!(window.civConsciousnessV79Data && Object.keys(window.civConsciousnessV79Data.civilizations || {}).length > 0) },
    { id: "multiverse_evo",   label: "Tiến Hóa Đa Vũ Trụ",icon: "🌠", check: () => !!(window.multiverseEvoV80Data && (window.multiverseEvoV80Data.worlds || []).length > 0) }
  ];

  function getCurrentStage() {
    const year = window.year || 0;
    if (!window.world || !window.world.name) return LIFECYCLE_STAGES[0];
    let stage = LIFECYCLE_STAGES[1];
    for (const s of LIFECYCLE_STAGES) {
      if (year >= s.minYear) stage = s;
    }
    return stage;
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.universeLifecycleV81Data)); } catch(e) {}
  }

  function load() {
    try {
      const d = localStorage.getItem(SAVE_KEY);
      if (d) window.universeLifecycleV81Data = Object.assign(window.universeLifecycleV81Data, JSON.parse(d));
    } catch(e) {}
  }

  window.ulc81GetStage = function() {
    return getCurrentStage();
  };

  window.ulc81GetAllStages = function() {
    return LIFECYCLE_STAGES;
  };

  window.ulc81CheckMilestones = function() {
    const achieved = window.universeLifecycleV81Data.milestones.map(m => m.id);
    const newOnes = [];
    for (const def of MILESTONE_DEFS) {
      if (achieved.includes(def.id)) continue;
      try {
        if (def.check()) {
          const entry = { id: def.id, label: def.label, icon: def.icon, year: window.year || 0, time: Date.now() };
          window.universeLifecycleV81Data.milestones.push(entry);
          newOnes.push(entry);
          if (typeof window.htAddEvent === "function") {
            window.htAddEvent({ year: window.year || 0, type: "milestone", title: def.icon + " " + def.label, color: "#facc15" });
          }
        }
      } catch(e) {}
    }
    return newOnes;
  };

  window.ulc81GetMilestones = function() {
    return window.universeLifecycleV81Data.milestones;
  };

  window.ulc81GetProgress = function() {
    const achieved = window.universeLifecycleV81Data.milestones.length;
    return { achieved, total: MILESTONE_DEFS.length, pct: Math.round((achieved / MILESTONE_DEFS.length) * 100) };
  };

  window.ulc81AddEvolutionEvent = function(desc) {
    const ev = { year: window.year || 0, desc, time: Date.now() };
    window.universeLifecycleV81Data.evolutionEvents.push(ev);
    if (window.universeLifecycleV81Data.evolutionEvents.length > 30) window.universeLifecycleV81Data.evolutionEvents.shift();
  };

  function tick() {
    const t = window.universeLifecycleV81Data.lastTick || 0;
    window.universeLifecycleV81Data.lastTick = t + 1;
    if (t % 50 === 0) {
      window.ulc81CheckMilestones();
      const stage = getCurrentStage();
      window.universeLifecycleV81Data.stage = stage.id;
    }
  }

  function init() {
    load();
    if (window.world && window.world.name && !window.universeLifecycleV81Data.birthYear) {
      window.universeLifecycleV81Data.birthYear = window.year || 1;
    }
    window.ulc81CheckMilestones();

    const _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      tick();
    };

    console.log("[Universe Lifecycle V81] Khởi động. " + window.universeLifecycleV81Data.milestones.length + " milestones đã đạt.");
    save();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 21900); });
  } else {
    setTimeout(init, 21900);
  }
})();
