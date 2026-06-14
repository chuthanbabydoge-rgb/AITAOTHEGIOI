(function() {
  "use strict";

  var SAVE_KEY = "cgv6_species_v93";

  window.spv93Data = {
    species: [],
    nextId: 1,
    seeded: false
  };

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(window.spv93Data)); } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.spv93Data = JSON.parse(d);
    } catch(e) {}
  }

  var SPECIES_PRESETS = {
    human: {
      name: 'Nhân Loại', type: 'human', icon: '🧑', color: '#60a5fa',
      birthRate: 0.09, deathRate: 0.05, traits: ['Thích nghi cao', 'Xây dựng văn minh'],
      description: 'Sinh vật có trí tuệ phát triển, xây dựng xã hội và văn minh.'
    },
    animal: {
      name: 'Muôn Thú', type: 'animal', icon: '🦁', color: '#22c55e',
      birthRate: 0.12, deathRate: 0.07, traits: ['Bản năng sinh tồn', 'Đa dạng sinh học'],
      description: 'Các loài động vật từ nhỏ đến lớn, đa dạng và phong phú.'
    },
    fantasy: {
      name: 'Sinh Vật Huyền Bí', type: 'fantasy', icon: '🐉', color: '#a78bfa',
      birthRate: 0.04, deathRate: 0.02, traits: ['Sức mạnh nguyên thủy', 'Tuổi thọ cao'],
      description: 'Các sinh vật huyền bí với sức mạnh vượt trội và tuổi thọ dài.'
    },
    spirit: {
      name: 'Linh Thể', type: 'fantasy', icon: '✨', color: '#f59e0b',
      birthRate: 0.03, deathRate: 0.01, traits: ['Bất tử nguyên chất', 'Năng lượng thuần túy'],
      description: 'Các thực thể tâm linh tồn tại ở dạng năng lượng thuần túy.'
    },
    alien: {
      name: 'Ngoại Tinh', type: 'custom', icon: '👽', color: '#34d399',
      birthRate: 0.06, deathRate: 0.03, traits: ['Công nghệ cao', 'Giao tiếp tâm thần'],
      description: 'Sinh vật đến từ vũ trụ xa xôi với công nghệ tiên tiến.'
    }
  };

  var GENRE_SEEDS = {
    cultivation: ['human', 'fantasy', 'spirit'],
    fantasy:     ['human', 'animal', 'fantasy'],
    scifi:       ['human', 'alien'],
    mythology:   ['human', 'fantasy', 'spirit'],
    zombie:      ['human', 'animal'],
    custom:      ['human', 'animal', 'fantasy']
  };

  function createSpecies(presetKey, initialPop) {
    var preset = SPECIES_PRESETS[presetKey] || SPECIES_PRESETS.human;
    return {
      id: 'sp_' + (window.spv93Data.nextId++),
      name: preset.name,
      type: preset.type,
      icon: preset.icon,
      color: preset.color,
      population: initialPop || Math.floor(Math.random() * 1000) + 100,
      peakPop: 0,
      birthRate: preset.birthRate,
      deathRate: preset.deathRate,
      growthHistory: [],
      status: 'thriving',   // thriving | stable | declining | endangered | extinct
      evolutionLevel: 1,
      traits: preset.traits.slice(),
      description: preset.description,
      appearedYear: window.year || 1
    };
  }

  function seedSpecies() {
    if (window.spv93Data.seeded) return;
    if (!window.world || !window.world.name) return;

    var genre = (window.world.genre || 'custom').toLowerCase();
    var keys = GENRE_SEEDS[genre] || GENRE_SEEDS.custom;
    var basePop = Math.max(500, (window.npcs || []).length * 50);
    var share = Math.floor(basePop / keys.length);

    keys.forEach(function(key, i) {
      var sp = createSpecies(key, share + Math.floor(Math.random() * 200) - 100);
      sp.peakPop = sp.population;
      window.spv93Data.species.push(sp);
    });

    window.spv93Data.seeded = true;
    save();

    // Notify chronicle
    if (typeof window.wchV92AddEvent === 'function') {
      window.spv93Data.species.forEach(function(sp) {
        window.wchV92AddEvent({
          year: window.year || 1,
          type: 'discovery',
          title: sp.icon + ' ' + sp.name + ' xuất hiện',
          desc: sp.description + ' Dân số ban đầu: ' + sp.population.toLocaleString() + '.',
          icon: sp.icon,
          color: sp.color
        });
      });
    }
    if (typeof window.htAddEvent === 'function') {
      window.htAddEvent({ year: window.year || 1, type: 'discovery', title: '🧬 Các loài sinh vật khai sinh', color: '#22c55e' });
    }
  }

  function evolveSpecies(sp, year) {
    var br = sp.birthRate * (0.8 + Math.random() * 0.4);  // ±20% variation
    var dr = sp.deathRate * (0.8 + Math.random() * 0.4);
    var growth = br - dr;
    var oldPop = sp.population;
    sp.population = Math.max(0, Math.round(sp.population * (1 + growth)));
    if (sp.population > sp.peakPop) sp.peakPop = sp.population;

    sp.growthHistory.push({ year: year, pop: sp.population });
    if (sp.growthHistory.length > 100) sp.growthHistory.shift();

    // Update status
    var ratio = sp.population / Math.max(1, sp.peakPop);
    if (sp.population === 0) {
      sp.status = 'extinct';
    } else if (ratio < 0.1) {
      sp.status = 'endangered';
    } else if (ratio < 0.5 || growth < -0.02) {
      sp.status = 'declining';
    } else if (growth < 0.02) {
      sp.status = 'stable';
    } else {
      sp.status = 'thriving';
    }

    return { oldPop: oldPop, newPop: sp.population, growthPct: Math.round(growth * 1000) / 10 };
  }

  window.spv93EvolveAll = function(year) {
    if (!window.spv93Data.seeded) { seedSpecies(); }
    window.spv93Data.species.forEach(function(sp) {
      if (sp.status === 'extinct') return;
      evolveSpecies(sp, year);
    });
    save();
  };

  window.spv93GetAll      = function() { return window.spv93Data.species; };
  window.spv93GetAlive    = function() { return window.spv93Data.species.filter(function(s) { return s.status !== 'extinct'; }); };
  window.spv93GetTotal    = function() {
    var t = 0;
    window.spv93Data.species.forEach(function(s) { t += s.population || 0; });
    return t;
  };
  window.spv93AddCustom   = function(name, type, icon, pop) {
    var sp = {
      id: 'sp_' + (window.spv93Data.nextId++),
      name: name || 'Loài Mới',
      type: type || 'custom',
      icon: icon || '🌟',
      color: '#94a3b8',
      population: pop || 100,
      peakPop: pop || 100,
      birthRate: 0.07,
      deathRate: 0.04,
      growthHistory: [],
      status: 'stable',
      evolutionLevel: 1,
      traits: ['Bí ẩn'],
      description: 'Một loài chưa được khám phá đầy đủ.',
      appearedYear: window.year || 1
    };
    window.spv93Data.species.push(sp);
    save();
    return sp;
  };

  function init() {
    load();
    // Seed after world exists (give world time to load)
    setTimeout(function() {
      if (window.world && window.world.name && !window.spv93Data.seeded) {
        seedSpecies();
      }
    }, 1000);
    console.log("[SpeciesSystem V93] 🦁 Species System khởi động — " + window.spv93Data.species.length + " loài đang tồn tại.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 24800); });
  } else {
    setTimeout(init, 24800);
  }
})();
