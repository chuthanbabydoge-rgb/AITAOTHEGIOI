(function() {
  "use strict";
  var SAVE_KEY = "cgv6_personality_evo_v78";

  var EVOLUTION_TRIGGERS = [
    { id: "war",       label: "Chiến Tranh",   icon: "⚔️",  effects: { courage: +15, kindness: -10, trust: -12 } },
    { id: "loss",      label: "Mất Mát",       icon: "💔", effects: { empathy: +20, courage: -8,  trust: -15 } },
    { id: "victory",   label: "Chiến Thắng",   icon: "🏆", effects: { confidence: +18, humility: -12 } },
    { id: "betrayal",  label: "Phản Bội",      icon: "🗡️",  effects: { distrust: +25, caution: +15, openness: -20 } },
    { id: "discovery", label: "Khám Phá",      icon: "🔭", effects: { curiosity: +15, confidence: +10 } },
    { id: "teaching",  label: "Truyền Dạy",    icon: "📚", effects: { patience: +12, legacy: +10 } },
    { id: "disaster",  label: "Thiên Tai",     icon: "🌋", effects: { resilience: +18, fear: +10, materialism: -15 } },
    { id: "love",      label: "Tình Yêu",      icon: "❤️",  effects: { empathy: +15, vulnerability: +12, joy: +20 } },
    { id: "injustice", label: "Bất Công",      icon: "⚖️",  effects: { anger: +20, justice: +18, conformity: -15 } },
    { id: "spiritual", label: "Giác Ngộ",      icon: "🌟", effects: { spirituality: +25, materialism: -20, peace: +15 } }
  ];

  var PERSONALITY_DIMENSIONS = [
    { id: "courage",      label: "Dũng Cảm",    icon: "🔥" },
    { id: "empathy",      label: "Đồng Cảm",    icon: "💙" },
    { id: "curiosity",    label: "Tò Mò",       icon: "🔭" },
    { id: "resilience",   label: "Kiên Cường",  icon: "🗿" },
    { id: "justice",      label: "Công Lý",     icon: "⚖️"  },
    { id: "spirituality", label: "Tâm Linh",    icon: "✨" },
    { id: "ambition",     label: "Tham Vọng",   icon: "🎯" },
    { id: "creativity",   label: "Sáng Tạo",    icon: "🎨" }
  ];

  window.personalityEvoV78Data = {
    evolutions: {},
    totalEvolutions: 0,
    lastScanYear: 0
  };

  function save() {
    try {
      var compact = { evolutions: {}, totalEvolutions: window.personalityEvoV78Data.totalEvolutions, lastScanYear: window.personalityEvoV78Data.lastScanYear };
      var keys = Object.keys(window.personalityEvoV78Data.evolutions).slice(-60);
      keys.forEach(function(k) { compact.evolutions[k] = window.personalityEvoV78Data.evolutions[k]; });
      localStorage.setItem(SAVE_KEY, JSON.stringify(compact));
    } catch(e) {}
  }

  function load() {
    try {
      var d = localStorage.getItem(SAVE_KEY);
      if (d) window.personalityEvoV78Data = JSON.parse(d);
    } catch(e) {}
  }

  function getOrInitDimensions(npcName) {
    var data = window.personalityEvoV78Data;
    var id = "npc_" + npcName;
    if (!data.evolutions[id]) {
      var seed = 0;
      for (var i = 0; i < npcName.length; i++) seed = (seed * 31 + npcName.charCodeAt(i)) & 0xffffffff;
      seed = Math.abs(seed);
      var dims = {};
      PERSONALITY_DIMENSIONS.forEach(function(d, i) {
        dims[d.id] = 20 + ((seed * (i + 1) * 7) % 60);
      });
      data.evolutions[id] = {
        npcName: npcName,
        dimensions: dims,
        history: [],
        dominantTrait: null,
        evolutionCount: 0
      };
    }
    return data.evolutions[id];
  }

  window.pe78ApplyTrigger = function(npcName, triggerId, intensity) {
    var trigger = EVOLUTION_TRIGGERS.find(function(t) { return t.id === triggerId; });
    if (!trigger) return false;
    var evo = getOrInitDimensions(npcName);
    var changes = [];
    Object.keys(trigger.effects).forEach(function(dim) {
      if (evo.dimensions[dim] !== undefined) {
        var delta = Math.round(trigger.effects[dim] * ((intensity || 1.0)));
        var before = evo.dimensions[dim];
        evo.dimensions[dim] = Math.max(0, Math.min(100, evo.dimensions[dim] + delta));
        changes.push({ dim: dim, delta: delta, before: before, after: evo.dimensions[dim] });
      }
    });
    var dominant = PERSONALITY_DIMENSIONS.reduce(function(best, d) {
      return (evo.dimensions[d.id] || 0) > (evo.dimensions[best.id] || 0) ? d : best;
    }, PERSONALITY_DIMENSIONS[0]);
    evo.dominantTrait = dominant.label;
    evo.history.unshift({ year: window.year || 1, trigger: trigger.label, icon: trigger.icon, changes: changes });
    if (evo.history.length > 20) evo.history.length = 20;
    evo.evolutionCount++;
    window.personalityEvoV78Data.totalEvolutions++;

    if (typeof window.dl78AddExperience === "function") {
      window.dl78AddExperience(npcName, triggerId, trigger.label + " thay đổi tính cách", trigger.effects[Object.keys(trigger.effects)[0]] || 5);
    }
    save();
    return true;
  };

  window.pe78GetDimensions = function(npcName) {
    var evo = window.personalityEvoV78Data.evolutions["npc_" + npcName];
    return evo ? evo.dimensions : null;
  };

  window.pe78GetHistory = function(npcName) {
    var evo = window.personalityEvoV78Data.evolutions["npc_" + npcName];
    return evo ? evo.history : [];
  };

  window.pe78GetDominant = function(npcName) {
    var evo = window.personalityEvoV78Data.evolutions["npc_" + npcName];
    return evo ? evo.dominantTrait : null;
  };

  window.pe78GetTopEvolved = function(limit) {
    return Object.values(window.personalityEvoV78Data.evolutions)
      .sort(function(a, b) { return b.evolutionCount - a.evolutionCount; })
      .slice(0, limit || 8);
  };

  window.pe78GetStats = function() {
    var evos = Object.values(window.personalityEvoV78Data.evolutions);
    return {
      total: evos.length,
      totalEvolutions: window.personalityEvoV78Data.totalEvolutions,
      topEvolved: window.pe78GetTopEvolved(5),
      triggerTypes: EVOLUTION_TRIGGERS.map(function(t) { return { id: t.id, label: t.label, icon: t.icon }; })
    };
  };
  window.PE78_TRIGGERS = EVOLUTION_TRIGGERS;
  window.PE78_DIMENSIONS = PERSONALITY_DIMENSIONS;

  function autoScanWorld() {
    var data = window.personalityEvoV78Data;
    var year = window.year || 1;
    if (year - data.lastScanYear < 60) return;
    data.lastScanYear = year;

    if (!window.npcs || window.npcs.length === 0) return;
    var candidates = window.npcs.slice(0, 30);
    var triggered = 0;
    candidates.forEach(function(npc) {
      if (!npc || !npc.name) return;
      if (triggered >= 3) return;
      var roll = Math.random();
      if (roll < 0.15) {
        var triggerPool = EVOLUTION_TRIGGERS.slice();
        if (window.warsActive && window.warsActive.length > 0) triggerPool.push(EVOLUTION_TRIGGERS[0], EVOLUTION_TRIGGERS[0]);
        if (window.disasterData && window.disasterData.activeDisasters && window.disasterData.activeDisasters.length > 0) triggerPool.push(EVOLUTION_TRIGGERS[6]);
        var t = triggerPool[Math.floor(Math.random() * triggerPool.length)];
        window.pe78ApplyTrigger(npc.name, t.id, 0.5 + Math.random() * 0.8);
        triggered++;
      }
    });
  }

  function init() {
    load();
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig();
      if (Math.random() < 0.008) autoScanWorld();
    };
    console.log("[PersonalityEvolutionV78] 🧠 Tiến Hóa Tính Cách khởi động — 10 trigger · 8 chiều tính cách · Auto-scan chiến tranh/thiên tai sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, 19900); });
  } else {
    setTimeout(init, 19900);
  }
})();
