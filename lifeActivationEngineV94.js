(function() {
  "use strict";

  var SAVE_KEY = "cgv6_life_activation_v94";

  window.laeV94Data = {
    activated: false,
    firstLifeYear: null,
    milestones: [],           // [{pop, year, label}] reached
    tickCounter: 0,
    forcedSeed: false,
    jarvisReports: []
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.laeV94Data)); } catch(e) {}
  }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) window.laeV94Data = JSON.parse(d); } catch(e) {}
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function getYear() { return window.year || 1; }
  function getTotalPop() {
    if (typeof window.spv93GetTotal === 'function') return window.spv93GetTotal();
    return 0;
  }
  function getSpecies() {
    return (typeof window.spv93GetAll === 'function') ? window.spv93GetAll() : [];
  }
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  // ── FORCE SEED ────────────────────────────────────────────────────────────
  // Directly seeds species without depending on speciesSystemV93's init timing
  var GENRE_SEEDS = {
    cultivation: [
      { name: 'Nhân Loại',          type: 'human',   icon: '🧑', color: '#60a5fa', br: 0.09, dr: 0.05, traits: ['Thích nghi cao', 'Xây dựng văn minh'], desc: 'Sinh vật trí tuệ, xây dựng văn minh tu luyện.' },
      { name: 'Sinh Vật Huyền Bí',  type: 'fantasy', icon: '🐉', color: '#a78bfa', br: 0.04, dr: 0.02, traits: ['Sức mạnh nguyên thủy', 'Tuổi thọ dài'],  desc: 'Sinh vật huyền bí với sức mạnh vượt trội.' },
      { name: 'Linh Thể',           type: 'fantasy', icon: '✨', color: '#f59e0b', br: 0.03, dr: 0.01, traits: ['Bất tử', 'Năng lượng thuần túy'],        desc: 'Thực thể tâm linh tồn tại dưới dạng năng lượng.' }
    ],
    fantasy: [
      { name: 'Nhân Loại',          type: 'human',   icon: '🧑', color: '#60a5fa', br: 0.09, dr: 0.05, traits: ['Thích nghi cao', 'Dũng cảm'],            desc: 'Con người dũng cảm sống trong thế giới kỳ ảo.' },
      { name: 'Muôn Thú',           type: 'animal',  icon: '🦁', color: '#22c55e', br: 0.12, dr: 0.07, traits: ['Bản năng sinh tồn', 'Đa dạng'],           desc: 'Các loài thú phong phú đa dạng.' },
      { name: 'Sinh Vật Huyền Bí',  type: 'fantasy', icon: '🐉', color: '#a78bfa', br: 0.04, dr: 0.02, traits: ['Ma thuật', 'Cổ xưa'],                    desc: 'Sinh vật ma thuật từ thuở hồng hoang.' }
    ],
    scifi: [
      { name: 'Nhân Loại',          type: 'human',   icon: '🧑', color: '#60a5fa', br: 0.07, dr: 0.03, traits: ['Công nghệ cao', 'Khoa học'],              desc: 'Con người tiến hóa với khoa học kỹ thuật.' },
      { name: 'Ngoại Tinh',         type: 'custom',  icon: '👽', color: '#34d399', br: 0.05, dr: 0.02, traits: ['Tâm thần', 'Năng lượng plasma'],          desc: 'Sinh vật từ vũ trụ xa xôi.' }
    ],
    mythology: [
      { name: 'Nhân Loại',          type: 'human',   icon: '🧑', color: '#60a5fa', br: 0.09, dr: 0.05, traits: ['Tín ngưỡng', 'Dũng cảm'],                desc: 'Con người sùng bái thần linh.' },
      { name: 'Thần Tộc',           type: 'fantasy', icon: '⚡', color: '#f59e0b', br: 0.03, dr: 0.01, traits: ['Bất tử', 'Quyền năng'],                   desc: 'Các vị thần và bán thần với quyền năng vô hạn.' },
      { name: 'Quái Vật Thần Thoại',type: 'fantasy', icon: '🦄', color: '#a78bfa', br: 0.04, dr: 0.02, traits: ['Huyền thoại', 'Sức mạnh khổng lồ'],      desc: 'Các sinh vật huyền thoại xuất hiện trong truyện cổ.' }
    ],
    zombie: [
      { name: 'Sống Sót',           type: 'human',   icon: '🧑', color: '#60a5fa', br: 0.05, dr: 0.08, traits: ['Kiên cường', 'Cảnh giác cao'],            desc: 'Con người còn sót lại trong thế giới tận thế.' },
      { name: 'Muôn Thú Hoang Dã',  type: 'animal',  icon: '🐺', color: '#22c55e', br: 0.10, dr: 0.06, traits: ['Hoang dã', 'Thích nghi'],                  desc: 'Các loài thú sống trong thế giới hậu tận thế.' }
    ]
  };
  GENRE_SEEDS.custom = GENRE_SEEDS.fantasy;

  function forceSeedSpecies(reason) {
    if (!window.world || !window.world.name) return false;
    var sp = typeof window.spv93Data !== 'undefined' ? window.spv93Data : null;
    if (sp && sp.seeded && sp.species && sp.species.length > 0) return true; // already done

    var genre = ((window.world && window.world.genre) || 'custom').toLowerCase();
    var presets = GENRE_SEEDS[genre] || GENRE_SEEDS.custom;
    var basePop = Math.max(500, (window.npcs || []).length * 50);
    var share = Math.floor(basePop / presets.length);
    var yr = getYear();

    // Ensure spv93Data exists
    if (!window.spv93Data) window.spv93Data = { species: [], nextId: 1, seeded: false };

    // Clear stale empty seeds
    window.spv93Data.species = (window.spv93Data.species || []).filter(function(s) { return s.population > 0; });

    if (window.spv93Data.species.length === 0) {
      presets.forEach(function(p) {
        var pop = share + Math.floor(Math.random() * 200) - 100;
        if (pop < 50) pop = 50;
        window.spv93Data.species.push({
          id: 'sp_lae_' + (window.spv93Data.nextId++),
          name: p.name, type: p.type, icon: p.icon, color: p.color,
          population: pop, peakPop: pop,
          birthRate: p.br, deathRate: p.dr,
          growthHistory: [{ year: yr, pop: pop }],
          status: 'thriving',
          evolutionLevel: 1,
          traits: p.traits.slice(),
          description: p.desc,
          appearedYear: yr
        });
      });
      window.spv93Data.seeded = true;
      try { localStorage.setItem('cgv6_species_v93', JSON.stringify(window.spv93Data)); } catch(e) {}

      if (typeof window.lev93Data !== 'undefined') {
        var initPop = calcSpeciesTotal();
        window.lev93Data.globalPop = initPop;
        // BUG-009 FIX: push initial populationHistory entry để chart không bị trống
        if (!Array.isArray(window.lev93Data.populationHistory)) window.lev93Data.populationHistory = [];
        if (window.lev93Data.populationHistory.length === 0) {
          window.lev93Data.populationHistory.push({ year: yr, total: initPop, births: 0, deaths: 0, netGrowth: 0 });
        }
        try { localStorage.setItem('cgv6_life_engine_v93', JSON.stringify(window.lev93Data)); } catch(e) {}
      }

      window.laeV94Data.activated = true;
      window.laeV94Data.forcedSeed = true;
      if (!window.laeV94Data.firstLifeYear) window.laeV94Data.firstLifeYear = yr;

      // Write chronicle entries
      window.spv93Data.species.forEach(function(s) {
        chronAdd(yr, 'discovery', s.icon + ' ' + s.name + ' xuất hiện', 'Dân số ban đầu: ' + fmtNum(s.population) + '. ' + s.description, s.icon, s.color);
      });
      chronAdd(yr, 'life', '🧬 Sự Sống Khởi Đầu', reason + ' · ' + presets.length + ' loài xuất hiện · Tổng dân số: ' + fmtNum(calcSpeciesTotal()), '🧬', '#22c55e');
      htAdd(yr, 'discovery', '🧬 Sự sống đầu tiên xuất hiện (' + reason + ')', '#22c55e');

      console.log("[LifeActivation V94] 🌱 Force-seeded " + presets.length + " species. Reason: " + reason);
    }
    return true;
  }

  function calcSpeciesTotal() {
    if (!window.spv93Data || !window.spv93Data.species) return 0;
    var t = 0; window.spv93Data.species.forEach(function(s) { t += s.population || 0; }); return t;
  }

  function chronAdd(yr, type, title, desc, icon, color) {
    if (typeof window.wchV92AddEvent === 'function') window.wchV92AddEvent({ year: yr, type: type, title: title, desc: desc, icon: icon || '📜', color: color || '#94a3b8' });
  }
  function htAdd(yr, type, title, color) {
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: yr, type: type, title: title, color: color || '#94a3b8' });
  }

  // ── POPULATION EVOLUTION ─────────────────────────────────────────────────
  function evolveOneTick() {
    if (!window.world || !window.world.name) return;
    if (!window.spv93Data || !window.spv93Data.species || !window.spv93Data.species.length) return;

    var yr = getYear();

    // Evolve each species
    window.spv93Data.species.forEach(function(sp) {
      if (sp.status === 'extinct') return;
      var br = (sp.birthRate || 0.08) * (0.85 + Math.random() * 0.30);
      var dr = (sp.deathRate || 0.04) * (0.85 + Math.random() * 0.30);
      var growth = br - dr;
      sp.population = Math.max(0, Math.round(sp.population * (1 + growth)));
      if (sp.population > (sp.peakPop || 0)) sp.peakPop = sp.population;
      sp.growthHistory = sp.growthHistory || [];
      sp.growthHistory.push({ year: yr, pop: sp.population });
      if (sp.growthHistory.length > 100) sp.growthHistory.shift();
      // Update status
      var ratio = sp.population / Math.max(1, sp.peakPop);
      if (sp.population === 0)     sp.status = 'extinct';
      else if (ratio < 0.1)        sp.status = 'endangered';
      else if (ratio < 0.5)        sp.status = 'declining';
      else if (growth < 0.02)      sp.status = 'stable';
      else                         sp.status = 'thriving';
    });

    // Update life engine global data
    var total = calcSpeciesTotal();
    if (typeof window.lev93Data !== 'undefined') {
      var prev = window.lev93Data.globalPop || total;
      var births = Math.round(total * (window.lev93Data.globalBirthRate || 0.08));
      var deaths = Math.round(total * (window.lev93Data.globalDeathRate || 0.04));
      window.lev93Data.globalPop = total;
      window.lev93Data.totalBirths = (window.lev93Data.totalBirths || 0) + births;
      window.lev93Data.totalDeaths = (window.lev93Data.totalDeaths || 0) + deaths;
      if (total > (window.lev93Data.peakPop || 0)) { window.lev93Data.peakPop = total; window.lev93Data.peakYear = yr; }
      var popHist = window.lev93Data.populationHistory || [];
      popHist.push({ year: yr, total: total, births: births, deaths: deaths, netGrowth: births - deaths });
      if (popHist.length > 200) popHist.shift();
      window.lev93Data.populationHistory = popHist;
    }

    checkMilestones(total, yr);

    // Persist
    try { localStorage.setItem('cgv6_species_v93', JSON.stringify(window.spv93Data)); } catch(e) {}
    try { if (window.lev93Data) localStorage.setItem('cgv6_life_engine_v93', JSON.stringify(window.lev93Data)); } catch(e) {}
  }

  // ── LIFE EVENTS (standalone, independent of lifeEventsV93) ───────────────
  var LIFE_EV = [
    { type: 'reproduction', icon: '🍼', color: '#22c55e', label: 'Sinh Sản',  titles: ['Bùng Nổ Sinh Sản','Thế Hệ Mới Ra Đời','Mùa Sinh Sản Bội Thu'],                  popMod:  0.22 },
    { type: 'adaptation',   icon: '🔬', color: '#a78bfa', label: 'Tiến Hóa',  titles: ['Đột Biến Tiến Hóa','Kháng Bệnh Tự Nhiên','Tiến Hóa Vượt Bậc'],                  popMod:  0.08 },
    { type: 'migration',    icon: '🚶', color: '#3b82f6', label: 'Di Cư',     titles: ['Làn Sóng Di Cư Lớn','Tái Định Cư','Mở Rộng Lãnh Thổ'],                           popMod:  0.05 },
    { type: 'plague',       icon: '💀', color: '#ef4444', label: 'Bệnh Dịch', titles: ['Dịch Bệnh Bùng Phát','Nạn Đói Kéo Dài','Ký Sinh Trùng Nguy Hiểm'],              popMod: -0.15 },
    { type: 'extinction',   icon: '☠️', color: '#6b7280', label: 'Suy Tàn',   titles: ['Nguy Cơ Tuyệt Chủng','Sụp Đổ Quần Thể','Mất Cân Bằng Sinh Thái'],              popMod: -0.30 }
  ];

  var _lastLifeEventYear = 0;
  function maybeFireLifeEvent(yr) {
    if (yr === _lastLifeEventYear) return;
    _lastLifeEventYear = yr;

    var species = (window.spv93Data && window.spv93Data.species || []).filter(function(s) { return s.status !== 'extinct'; });
    if (!species.length) return;

    var sp = species[Math.floor(Math.random() * species.length)];

    // Weight: reproduction 30 · adaptation 25 · migration 25 · plague 15 · extinction 5
    var roll = Math.random() * 100;
    var ev;
    if (roll < 30) ev = LIFE_EV[0];
    else if (roll < 55) ev = LIFE_EV[1];
    else if (roll < 80) ev = LIFE_EV[2];
    else if (roll < 95) ev = LIFE_EV[3];
    else if (sp.population < 200) ev = LIFE_EV[4]; // extinction only if small pop
    else ev = LIFE_EV[0];

    var title = ev.titles[Math.floor(Math.random() * ev.titles.length)];

    if (ev.popMod !== 0) {
      sp.population = Math.max(1, Math.round(sp.population * (1 + ev.popMod)));
    }

    // Record in V93 events if available
    if (typeof window.lev93EventData !== 'undefined') {
      window.lev93EventData.events = window.lev93EventData.events || [];
      window.lev93EventData.events.unshift({ year: yr, type: ev.type, speciesName: sp.name, speciesIcon: sp.icon, title: sp.icon + ' ' + sp.name + ': ' + title, desc: ev.label + ' sự kiện', icon: ev.icon, color: ev.color, label: ev.label, popMod: ev.popMod, timestamp: Date.now() });
      if (window.lev93EventData.events.length > 200) window.lev93EventData.events.pop();
      window.lev93EventData.totalEvents = (window.lev93EventData.totalEvents || 0) + 1;
    }

    chronAdd(yr, ev.type, sp.icon + ' ' + sp.name + ': ' + title, ev.label + ' xảy ra · Dân số: ' + fmtNum(sp.population), ev.icon, ev.color);
    htAdd(yr, ev.type, ev.icon + ' ' + sp.name + ': ' + title, ev.color);
  }

  // ── MILESTONE DETECTION ──────────────────────────────────────────────────
  var MILESTONES = [
    { pop: 100,       label: 'Dân số vượt 100',          icon: '👥', color: '#60a5fa' },
    { pop: 500,       label: 'Dân số vượt 500',          icon: '👥', color: '#60a5fa' },
    { pop: 1000,      label: 'Dân số vượt 1.000',        icon: '🌟', color: '#f59e0b' },
    { pop: 5000,      label: 'Dân số vượt 5.000',        icon: '🌟', color: '#f59e0b' },
    { pop: 10000,     label: 'Dân số vượt 10.000',       icon: '🏆', color: '#a78bfa' },
    { pop: 50000,     label: 'Dân số vượt 50.000',       icon: '🏆', color: '#a78bfa' },
    { pop: 100000,    label: 'Dân số vượt 100.000',      icon: '👑', color: '#f59e0b' },
    { pop: 1000000,   label: 'Dân số vượt 1.000.000',    icon: '👑', color: '#f59e0b' }
  ];

  function checkMilestones(totalPop, yr) {
    var reached = window.laeV94Data.milestones.map(function(m) { return m.pop; });
    MILESTONES.forEach(function(ms) {
      if (totalPop >= ms.pop && reached.indexOf(ms.pop) === -1) {
        window.laeV94Data.milestones.push({ pop: ms.pop, year: yr, label: ms.label });
        chronAdd(yr, 'milestone', ms.icon + ' ' + ms.label, 'Tổng dân số thế giới đạt ' + fmtNum(ms.pop) + ' sinh linh — một cột mốc lịch sử.', ms.icon, ms.color);
        htAdd(yr, 'milestone', ms.icon + ' ' + ms.label, ms.color);
        addJarvisReport(ms.icon + ' ' + ms.label + ' (Năm ' + yr + ')');
      }
    });
  }

  function addJarvisReport(msg) {
    window.laeV94Data.jarvisReports.unshift({ year: getYear(), msg: msg, at: Date.now() });
    if (window.laeV94Data.jarvisReports.length > 50) window.laeV94Data.jarvisReports.pop();
  }

  // ── JARVIS LIFE SUMMARY ──────────────────────────────────────────────────
  window.laeV94GetJarvisSummary = function() {
    var species = getSpecies();
    var total = calcSpeciesTotal();
    var yr = getYear();
    var alive = species.filter(function(s) { return s.status !== 'extinct'; });
    var endangered = species.filter(function(s) { return s.status === 'endangered'; });
    var thriving = species.filter(function(s) { return s.status === 'thriving'; });
    var growthRate = typeof window.lev93GetGrowthRate === 'function' ? window.lev93GetGrowthRate() : 0;
    var growthArrow = growthRate >= 0 ? '▲' : '▼';

    var lines = [
      '🧬 Báo cáo Sự Sống — Năm ' + yr,
      '─────────────────────────────────────',
      '👥 Tổng dân số: ' + fmtNum(total) + ' sinh linh',
      '📈 Tốc độ tăng trưởng: ' + growthArrow + ' ' + Math.abs(growthRate) + '%',
      '🦁 Số loài: ' + alive.length + ' đang sinh tồn'
    ];
    if (thriving.length) lines.push('🟢 Phát triển mạnh: ' + thriving.map(function(s) { return s.icon + s.name; }).join(', '));
    if (endangered.length) lines.push('🔴 Nguy cấp: ' + endangered.map(function(s) { return s.icon + s.name; }).join(', '));
    var latestMs = window.laeV94Data.milestones.slice(-1)[0];
    if (latestMs) lines.push('🏆 Cột mốc gần nhất: ' + latestMs.label + ' (Năm ' + latestMs.year + ')');
    return lines.join('\n');
  };

  window.laeV94GetPublicAPI = function() {
    return {
      activated: window.laeV94Data.activated,
      firstLifeYear: window.laeV94Data.firstLifeYear,
      milestones: window.laeV94Data.milestones,
      totalPop: calcSpeciesTotal(),
      speciesCount: getSpecies().length,
      jarvisReports: window.laeV94Data.jarvisReports.slice(0, 5)
    };
  };

  // ── WATCHDOG ─────────────────────────────────────────────────────────────
  var _watchTick = 0;
  function watchdogCheck() {
    _watchTick++;
    if (!window.world || !window.world.name) return;

    var species = getSpecies();
    var yr = getYear();

    // Case 1: No species at all → force seed immediately
    if (!species.length) {
      forceSeedSpecies('Watchdog (năm ' + yr + ')');
      return;
    }

    // Case 2: Species exist but all have 0 population → fix
    var total = calcSpeciesTotal();
    if (total === 0 && species.length > 0) {
      species.forEach(function(sp) {
        if (!sp.population || sp.population <= 0) {
          sp.population = Math.max(100, Math.floor(Math.random() * 500) + 200);
          sp.status = 'thriving';
        }
      });
    }

    // Case 3: Year > 100 and population still 0 → emergency seed
    if (yr > 100 && calcSpeciesTotal() === 0) {
      forceSeedSpecies('Khẩn Cấp (năm ' + yr + ' · dân số = 0)');
    }

    // Case 4: New species appearance check (every 30 watchdog ticks ≈ ~60s)
    if (_watchTick % 30 === 0 && species.length < 5 && yr > 50) {
      maybeSpawnNewSpecies(yr);
    }
  }

  function maybeSpawnNewSpecies(yr) {
    // 20% chance of new species appearing
    if (Math.random() > 0.20) return;
    var newOpts = [
      { name: 'Loài Đột Biến', icon: '🦋', color: '#34d399', br: 0.10, dr: 0.06 },
      { name: 'Sinh Linh Mới',  icon: '🌿', color: '#86efac', br: 0.08, dr: 0.05 },
      { name: 'Giống Loài Lạ',  icon: '🔮', color: '#c084fc', br: 0.06, dr: 0.03 }
    ];
    var opt = newOpts[Math.floor(Math.random() * newOpts.length)];
    var sp = {
      id: 'sp_lae2_' + Date.now(),
      name: opt.name, type: 'custom', icon: opt.icon, color: opt.color,
      population: Math.floor(Math.random() * 200) + 50,
      peakPop: 200, birthRate: opt.br, deathRate: opt.dr,
      growthHistory: [{ year: yr, pop: 100 }],
      status: 'thriving', evolutionLevel: 1,
      traits: ['Tiến hóa tự phát', 'Bí ẩn'],
      description: 'Một loài mới bất ngờ xuất hiện do tiến hóa tự phát.',
      appearedYear: yr
    };
    if (!window.spv93Data) return;
    window.spv93Data.species.push(sp);
    chronAdd(yr, 'discovery', opt.icon + ' Loài Mới Xuất Hiện: ' + opt.name, 'Tiến hóa tự phát tạo ra một loài mới sau ' + yr + ' năm. Đây là một bước ngoặt lịch sử.', opt.icon, opt.color);
    htAdd(yr, 'discovery', opt.icon + ' Loài Mới: ' + opt.name, opt.color);
    addJarvisReport('Loài mới ' + opt.icon + ' ' + opt.name + ' xuất hiện (Năm ' + yr + ')');
  }

  // ── GAMETICK HOOK ────────────────────────────────────────────────────────
  // Runs every tick (1 game "second"). Evolves every 60 ticks ≈ 1 biological year
  var EVOLVE_EVERY = 60;  // ticks between evolution cycles

  function hookGameTick() {
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();

      window.laeV94Data.tickCounter++;
      var tc = window.laeV94Data.tickCounter;

      if (!window.world || !window.world.name) return;

      // Ensure species exist (self-healing)
      if (tc % 120 === 0 && (!window.spv93Data || !window.spv93Data.species || !window.spv93Data.species.length)) {
        forceSeedSpecies('Auto-heal tick ' + tc);
      }

      // Evolution cycle
      if (tc % EVOLVE_EVERY === 0) {
        evolveOneTick();
        var yr = getYear();
        maybeFireLifeEvent(yr);
        if (tc % 300 === 0) save();  // save periodically
      }
    };
  }

  // ── ENHANCED UI PATCH ────────────────────────────────────────────────────
  // Refresh V93 UI stats more aggressively and inject Jarvis life summary
  function patchV93UI() {
    // Refresh lsv93 header every 2s (V93 does 4s)
    setInterval(function() {
      var sc = document.getElementById('lsv93-species-count');
      var tp = document.getElementById('lsv93-total-pop');
      if (sc) sc.textContent = getSpecies().filter(function(s) { return s.status !== 'extinct'; }).length + ' loài';
      if (tp) {
        var t = calcSpeciesTotal();
        if (!tp.textContent.includes(t > 999 ? fmtNum(t).charAt(0) : t.toString())) {
          tp.textContent = fmtNum(t) + ' sinh linh';
        }
      }

      // Inject Jarvis life into PUOS jarvis panel if visible
      var jPanel = document.getElementById('laeV94-jarvis-block');
      if (jPanel) {
        jPanel.textContent = window.laeV94GetJarvisSummary();
      }
    }, 2000);
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();
    hookGameTick();

    // Watchdog: poll every 2s
    setInterval(watchdogCheck, 2000);

    // First check after 1.5s — quick seed if world already exists
    setTimeout(function() {
      if (window.world && window.world.name) {
        var species = getSpecies();
        if (!species.length || calcSpeciesTotal() === 0) {
          forceSeedSpecies('Khởi Tạo (Load World)');
          evolveOneTick();
        }
      }
    }, 1500);

    patchV93UI();

    console.log("[LifeActivation V94] 🌱 Life Activation Engine khởi động — Watchdog · gameTick hook · Force-seed · Milestone detection · Jarvis Life sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25100); });
  } else {
    setTimeout(init, 25100);
  }
})();
