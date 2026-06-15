(function() {
  "use strict";

  const SPECIES_PRESETS = [
    { type: "humanoid", icon: "👤", name: "Nhân Tộc Mới", birthRate: 0.09, deathRate: 0.05, traits: ["Thích nghi cao", "Xây dựng xã hội"], color: "#60a5fa" },
    { type: "beast", icon: "🐉", name: "Dã Thú Thần", birthRate: 0.12, deathRate: 0.07, traits: ["Bản năng sinh tồn", "Sức mạnh vật lý"], color: "#34d399" },
    { type: "ancient", icon: "⚗️", name: "Sinh Vật Cổ Đại", birthRate: 0.03, deathRate: 0.01, traits: ["Tuổi thọ cực cao", "Sức mạnh nguyên thủy"], color: "#a78bfa" },
    { type: "divine", icon: "✨", name: "Thần Tộc", birthRate: 0.02, deathRate: 0.005, traits: ["Bất tử nguyên chất", "Năng lượng thuần túy"], color: "#fbbf24" },
    { type: "cyber", icon: "🤖", name: "Sinh Vật Cơ Học", birthRate: 0.06, deathRate: 0.03, traits: ["Công nghệ cao", "Giao tiếp tâm thần"], color: "#38bdf8" }
  ];

  function getSpecies() {
    return window.spv93Data && Array.isArray(window.spv93Data.species) ? window.spv93Data.species : [];
  }

  function saveSpecies() {
    if (window.spv93Data && typeof window.spv93Data.save === "function") {
      window.spv93Data.save();
    } else {
      try { localStorage.setItem("cgv6_species_v93", JSON.stringify(window.spv93Data)); } catch(e) {}
    }
  }

  window.cpv123CreateSpecies = function(name, type) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var preset = SPECIES_PRESETS.find(function(p) { return p.type === type; }) || SPECIES_PRESETS[0];
    if (!window.spv93Data) return;
    var sp = {
      id: "sp_creator_" + Date.now(),
      name: name || (preset.icon + " " + preset.name),
      type: preset.type,
      icon: preset.icon,
      color: preset.color,
      description: "Loài được tạo bởi Creator God năm " + (window.year || 1),
      population: Math.floor(Math.random() * 2000) + 500,
      birthRate: preset.birthRate,
      deathRate: preset.deathRate,
      traits: preset.traits.slice(),
      lifespan: Math.floor(60 + Math.random() * 40),
      peakPop: 500,
      status: "thriving",
      growthHistory: [{ year: window.year || 1, pop: 500 }],
      createdByCreator: true,
      createdYear: window.year || 1
    };
    sp.peakPop = sp.population;
    window.spv93Data.species.push(sp);
    window.spv93Data.nextId = (window.spv93Data.nextId || 0) + 1;
    saveSpecies();
    window.cpv123LogAction("life", "🧬 Tạo Loài Mới: " + sp.name, "Dân số: " + sp.population + " · Sinh: " + sp.birthRate + " · Tử: " + sp.deathRate);
    return sp;
  };

  window.cpv123EditSpecies = function(spId, prop, val) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    var sp = getSpecies().find(function(s) { return s.id === spId; });
    if (!sp) return;
    var old = sp[prop];
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { sp[prop] = old; saveSpecies(); }) : null;
    sp[prop] = val;
    saveSpecies();
    window.cpv123LogAction("life", "✏️ Chỉnh Sửa " + sp.name + "." + prop, "Từ " + old + " → " + val, snap);
  };

  window.cpv123BoostBirth = function(spId, multiplier) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    multiplier = multiplier || 2;
    var sp = getSpecies().find(function(s) { return s.id === spId; });
    if (!sp) { sp = getSpecies()[0]; }
    if (!sp) return;
    var old = sp.birthRate;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { sp.birthRate = old; saveSpecies(); }) : null;
    sp.birthRate = Math.min(0.5, sp.birthRate * multiplier);
    saveSpecies();
    window.cpv123LogAction("life", "🍼 Tăng Sinh Sản: " + sp.name, "Tỷ lệ sinh: " + old.toFixed(3) + " → " + sp.birthRate.toFixed(3), snap);
  };

  window.cpv123ReduceDeath = function(spId, multiplier) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    multiplier = multiplier || 0.5;
    var sp = getSpecies().find(function(s) { return s.id === spId; });
    if (!sp) { sp = getSpecies()[0]; }
    if (!sp) return;
    var old = sp.deathRate;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { sp.deathRate = old; saveSpecies(); }) : null;
    sp.deathRate = Math.max(0.001, sp.deathRate * multiplier);
    saveSpecies();
    window.cpv123LogAction("life", "💊 Giảm Tử Vong: " + sp.name, "Tỷ lệ tử: " + old.toFixed(3) + " → " + sp.deathRate.toFixed(3), snap);
  };

  window.cpv123BoostPopulation = function(spId, amount) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    amount = amount || 10000;
    var sp = getSpecies().find(function(s) { return s.id === spId; });
    if (!sp) { sp = getSpecies()[0]; }
    if (!sp) return;
    var old = sp.population;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { sp.population = old; saveSpecies(); }) : null;
    sp.population = Math.max(1, sp.population + amount);
    if (sp.population > sp.peakPop) sp.peakPop = sp.population;
    saveSpecies();
    window.cpv123LogAction("life", "📈 Tăng Dân Số: " + sp.name, "+" + amount.toLocaleString() + " → " + sp.population.toLocaleString(), snap);
  };

  window.cpv123ExtendLifespan = function(spId, years) {
    if (!window.cpv123IsEnabled()) return alert("Hãy bật Creator Mode trước!");
    years = years || 50;
    var sp = getSpecies().find(function(s) { return s.id === spId; });
    if (!sp) { sp = getSpecies()[0]; }
    if (!sp) return;
    var old = sp.lifespan || 70;
    var snap = window.cpv123MakeSnapshot ? window.cpv123MakeSnapshot(function() { sp.lifespan = old; saveSpecies(); }) : null;
    sp.lifespan = (sp.lifespan || 70) + years;
    saveSpecies();
    window.cpv123LogAction("life", "⏳ Tăng Tuổi Thọ: " + sp.name, "Tuổi thọ: " + old + " → " + sp.lifespan + " năm", snap);
  };

  window.cpv123SpeciesPresets = SPECIES_PRESETS;
  window.cpv123GetSpecies = getSpecies;

  function init() {
    console.log("[CreatorLifePowers V123] 🧬 Life Creation Powers khởi động — Tạo Loài · Chỉnh Sửa · Sinh Sản · Tuổi Thọ sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 29500); });
  } else {
    setTimeout(init, 29500);
  }
})();
