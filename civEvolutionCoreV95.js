(function() {
  "use strict";

  var SAVE_KEY = "cgv6_civ_core_v95";

  // ── CIV TYPES ────────────────────────────────────────────────────────────
  var CIV_STAGES = [
    { id: 'tribe',    label: 'Bộ Tộc',    icon: '🏕️', minPop: 50,    color: '#86efac', order: 0 },
    { id: 'town',     label: 'Thị Trấn',  icon: '🏘️', minPop: 300,   color: '#60a5fa', order: 1 },
    { id: 'city',     label: 'Thành Phố', icon: '🏙️', minPop: 1000,  color: '#a78bfa', order: 2 },
    { id: 'kingdom',  label: 'Vương Quốc',icon: '👑', minPop: 4000,  color: '#f59e0b', order: 3 },
    { id: 'empire',   label: 'Đế Chế',    icon: '⚜️', minPop: 10000, color: '#ef4444', order: 4 }
  ];

  var TECH_STAGES = [
    { id: 'primitive',    label: 'Nguyên Thủy',  icon: '🪨', threshold: 0    },
    { id: 'agricultural', label: 'Nông Nghiệp',  icon: '🌾', threshold: 120  },
    { id: 'bronze',       label: 'Đồng Thau',    icon: '⚔️', threshold: 350  },
    { id: 'iron',         label: 'Sắt Thép',     icon: '🛡️', threshold: 800  },
    { id: 'medieval',     label: 'Trung Cổ',     icon: '🏯', threshold: 1800 },
    { id: 'industrial',   label: 'Công Nghiệp',  icon: '⚙️', threshold: 4000 },
    { id: 'modern',       label: 'Hiện Đại',     icon: '🏙️', threshold: 8000 },
    { id: 'advanced',     label: 'Tiên Tiến',    icon: '🚀', threshold: 15000}
  ];

  // ── NAME BANKS ────────────────────────────────────────────────────────────
  var NAME_BANKS = {
    human:   ['Thanh Long','Bạch Hổ','Huyền Vũ','Chu Tước','Kim Ô','Ngọc Thỏ','Thương Long','Xích Phượng','Băng Tuyết','Lửa Thiêng','Thần Phong','Vân Mộng','Thiên Kiêu','Địa Tôn'],
    fantasy: ['Thái Cổ','Hỗn Độn','Nguyên Thủy','Vô Cực','Đại Thiên','Hư Vô','Vô Lượng','Hỗn Mang','Tiên Cổ','Long Uyên','Phượng Minh','Thiên Mộ','Địa Phủ','Hư Không'],
    animal:  ['Sơn Lâm','Đại Thảo Nguyên','Thiên Không','Đại Hải','Sương Mù','Hoang Dã','Băng Nguyên','Sa Mạc Đỏ','Rừng Thiêng','Thảo Nguyên Xanh'],
    custom:  ['Tinh Vân','Thiên Hà','Vũ Trụ','Hư Không','Ngân Hà','Tinh Tú','Ánh Sáng','Bóng Tối','Năng Lượng','Plasma']
  };
  var CITY_PREFIXES = ['Thiên','Địa','Huyền','Vân','Long','Phượng','Kim','Ngọc','Bạch','Tử','Thanh','Ánh','Thái','Nguyên'];
  var CITY_SUFFIXES = ['Thành','Kinh','Đô','Trì','Phủ','Quan','Lĩnh','Nguyên','Sơn','Thủy','Môn','Châu'];

  function randName(bank) {
    return bank[Math.floor(Math.random() * bank.length)];
  }
  function randCityName() {
    return randName(CITY_PREFIXES) + ' ' + randName(CITY_SUFFIXES);
  }
  function civNameForSpecies(sp, stageId) {
    var bank = NAME_BANKS[sp.type] || NAME_BANKS.custom;
    var baseName = randName(bank);
    var stage = CIV_STAGES.find(function(s) { return s.id === stageId; }) || CIV_STAGES[0];
    return baseName + ' ' + stage.label;
  }

  // ── DATA ─────────────────────────────────────────────────────────────────
  window.cecV95Data = {
    civs: [],
    nextId: 1,
    totalCivsEverFounded: 0,
    techHistory: []
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.cecV95Data)); } catch(e) {}
  }
  function load() {
    try { var d = localStorage.getItem(SAVE_KEY); if (d) window.cecV95Data = JSON.parse(d); } catch(e) {}
  }

  // ── CIV CREATION ─────────────────────────────────────────────────────────
  function createCiv(sp, stageId, yr) {
    var stage = CIV_STAGES.find(function(s) { return s.id === stageId; }) || CIV_STAGES[0];
    var name = civNameForSpecies(sp, stageId);
    var capitalName = randCityName();
    var civ = {
      id: 'civ_' + (window.cecV95Data.nextId++),
      speciesId: sp.id,
      speciesName: sp.name,
      speciesIcon: sp.icon,
      name: name,
      stageId: stageId,
      stageOrder: stage.order,
      stageLabel: stage.label,
      stageIcon: stage.icon,
      color: sp.color || stage.color,
      foundedYear: yr,
      population: Math.max(sp.population, stage.minPop),
      territory: 1 + stage.order,
      knowledge: stage.order * 60,
      culture: Math.floor(Math.random() * 30) + 10,
      techPoints: stage.order * 150,
      techStage: stage.order,
      stability: 75 + Math.floor(Math.random() * 15),
      cities: [{ name: capitalName, isCapital: true, pop: Math.floor(sp.population * 0.4), yr: yr }],
      events: [],
      growthHistory: [{ year: yr, pop: sp.population }]
    };
    window.cecV95Data.civs.push(civ);
    window.cecV95Data.totalCivsEverFounded++;
    return civ;
  }

  // ── DETERMINE STAGE FROM POP ─────────────────────────────────────────────
  function stageForPop(pop) {
    for (var i = CIV_STAGES.length - 1; i >= 0; i--) {
      if (pop >= CIV_STAGES[i].minPop) return CIV_STAGES[i].id;
    }
    return null;
  }

  // ── AUTO-FOUND CIVS FROM SPECIES ──────────────────────────────────────────
  function checkAndFoundCivs(yr) {
    var species = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive() : [];
    species.forEach(function(sp) {
      if (!sp.population || sp.population < CIV_STAGES[0].minPop) return;

      // Already has a civ for this species?
      var existing = window.cecV95Data.civs.filter(function(c) { return c.speciesId === sp.id; });

      if (!existing.length) {
        // Found first civ
        var stageId = stageForPop(sp.population);
        if (!stageId) return;
        var civ = createCiv(sp, stageId, yr);
        chronAdd(yr, 'civ_founded', civ.stageIcon + ' ' + civ.name + ' thành lập', civ.speciesIcon + ' ' + civ.speciesName + ' hình thành tổ chức đầu tiên tại ' + civ.cities[0].name + '. Dân số: ' + fmt(civ.population) + '.', civ.stageIcon, civ.color);
        htAdd(yr, 'civ', civ.stageIcon + ' ' + civ.name + ' thành lập (' + civ.stageLabel + ')', civ.color);
      } else {
        // Check if any existing civ should upgrade
        var topCiv = existing.sort(function(a, b) { return b.stageOrder - a.stageOrder; })[0];
        var newStageId = stageForPop(sp.population);
        var newStage = CIV_STAGES.find(function(s) { return s.id === newStageId; });
        if (newStage && newStage.order > topCiv.stageOrder) {
          var oldLabel = topCiv.stageLabel;
          topCiv.stageId = newStage.id;
          topCiv.stageOrder = newStage.order;
          topCiv.stageLabel = newStage.label;
          topCiv.stageIcon = newStage.icon;
          // Add new city
          var newCityName = randCityName();
          topCiv.cities.push({ name: newCityName, isCapital: false, pop: Math.floor(sp.population * 0.1), yr: yr });
          topCiv.territory = 1 + newStage.order;
          topCiv.events.push({ year: yr, text: oldLabel + ' → ' + newStage.label });
          chronAdd(yr, 'civ_advance', newStage.icon + ' ' + topCiv.name + ': ' + oldLabel + ' → ' + newStage.label, topCiv.speciesIcon + ' ' + topCiv.speciesName + ' phát triển lên cấp ' + newStage.label + '. Thành phố mới: ' + newCityName + '.', newStage.icon, topCiv.color);
          htAdd(yr, 'civ', newStage.icon + ' ' + topCiv.name + ' tiến lên ' + newStage.label, topCiv.color);
        }
      }
    });
  }

  // ── TECH EVOLUTION ────────────────────────────────────────────────────────
  function evolveTech(civ, yr) {
    var gainPerYear = 10 + (civ.cities.length * 3) + Math.floor((civ.population || 0) / 500);
    if (civ.stability > 70) gainPerYear = Math.round(gainPerYear * 1.2);
    civ.techPoints = (civ.techPoints || 0) + gainPerYear;

    var oldStage = civ.techStage || 0;
    for (var i = TECH_STAGES.length - 1; i > oldStage; i--) {
      if (civ.techPoints >= TECH_STAGES[i].threshold) {
        civ.techStage = i;
        if (i > oldStage) {
          var ts = TECH_STAGES[i];
          chronAdd(yr, 'tech', ts.icon + ' ' + civ.name + ': Đạt ' + ts.label, civ.speciesIcon + ' ' + civ.name + ' tiến vào thời đại ' + ts.label + ' sau ' + (yr - civ.foundedYear) + ' năm phát triển.', ts.icon, '#f59e0b');
          htAdd(yr, 'tech', ts.icon + ' ' + civ.name + ': ' + ts.label, '#f59e0b');
        }
        break;
      }
    }

    // Knowledge & stability
    civ.knowledge = Math.min(100, (civ.knowledge || 0) + 2);
    civ.culture = Math.min(100, (civ.culture || 0) + 1);
    civ.stability = Math.max(20, Math.min(100, (civ.stability || 70) + (Math.random() > 0.5 ? 1 : -1)));
  }

  // ── YEARLY EVOLUTION ─────────────────────────────────────────────────────
  function evolutionTick(yr) {
    if (!window.world || !window.world.name) return;

    checkAndFoundCivs(yr);

    // Evolve existing civs
    var species = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive() : [];
    window.cecV95Data.civs.forEach(function(civ) {
      var sp = species.find(function(s) { return s.id === civ.speciesId; });
      if (!sp) return;
      civ.population = sp.population;
      civ.growthHistory = civ.growthHistory || [];
      civ.growthHistory.push({ year: yr, pop: sp.population });
      if (civ.growthHistory.length > 100) civ.growthHistory.shift();
      evolveTech(civ, yr);
    });

    save();
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  window.cecV95GetAll          = function() { return window.cecV95Data.civs; };
  window.cecV95GetTop          = function(n) {
    return window.cecV95Data.civs.slice().sort(function(a, b) { return (b.stageOrder * 10000 + b.population) - (a.stageOrder * 10000 + a.population); }).slice(0, n || 5);
  };
  window.cecV95GetTechStages   = function() { return TECH_STAGES; };
  window.cecV95GetCivStages    = function() { return CIV_STAGES; };
  window.cecV95GetTechLabel    = function(idx) { return TECH_STAGES[idx] || TECH_STAGES[0]; };
  window.cecV95ForceCheck      = function() { evolutionTick(window.year || 1); };

  window.cecV95GetJarvis = function() {
    var civs = window.cecV95Data.civs;
    if (!civs.length) return '⏳ Chưa có văn minh nào hình thành.';
    var byPop  = civs.slice().sort(function(a, b) { return b.population - a.population; })[0];
    var byTech = civs.slice().sort(function(a, b) { return b.techStage - a.techStage; })[0];
    var byStg  = civs.slice().sort(function(a, b) { return b.stageOrder - a.stageOrder; })[0];
    var lines = [
      '🏛️ Báo Cáo Văn Minh — Năm ' + (window.year || 1),
      '──────────────────────────────────────',
      '📊 Tổng số văn minh: ' + civs.length,
      '👥 Đông dân nhất: ' + byPop.name + ' (' + fmt(byPop.population) + ')',
      '🚀 Công nghệ cao nhất: ' + byTech.name + ' [' + cecV95GetTechLabel_inner(byTech.techStage).label + ']',
      '⚜️ Phát triển nhất: ' + byStg.name + ' (' + byStg.stageLabel + ')',
      '🏙️ Tổng thành phố: ' + civs.reduce(function(acc, c) { return acc + c.cities.length; }, 0)
    ];
    return lines.join('\n');
  };

  function cecV95GetTechLabel_inner(idx) { return TECH_STAGES[Math.min(idx || 0, TECH_STAGES.length - 1)]; }
  function fmt(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function chronAdd(yr, type, title, desc, icon, color) {
    if (typeof window.wchV92AddEvent === 'function') window.wchV92AddEvent({ year: yr, type: type, title: title, desc: desc, icon: icon || '🏛️', color: color || '#94a3b8' });
  }
  function htAdd(yr, type, title, color) {
    if (typeof window.htAddEvent === 'function') window.htAddEvent({ year: yr, type: type, title: title, color: color || '#94a3b8' });
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    load();

    // Register V92 year-change listener
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(function(yr) { evolutionTick(yr); });
    }

    // Boot check: if world already exists
    setTimeout(function() {
      if (window.world && window.world.name) {
        evolutionTick(window.year || 1);
      }
    }, 2000);

    // Watchdog every 4s
    setInterval(function() {
      if (window.world && window.world.name) {
        var species = typeof window.spv93GetAlive === 'function' ? window.spv93GetAlive() : [];
        var hasPop = species.some(function(s) { return s.population >= CIV_STAGES[0].minPop; });
        if (hasPop && !window.cecV95Data.civs.length) {
          evolutionTick(window.year || 1);
        }
      }
    }, 4000);

    console.log("[CivEvolutionCore V95] 🏛️ Civilization Core khởi động — " + CIV_STAGES.length + " giai đoạn · " + TECH_STAGES.length + " thời đại công nghệ · " + window.cecV95Data.civs.length + " văn minh hiện có.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 25200); });
  } else {
    setTimeout(init, 25200);
  }
})();
