(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI BRAIN (Phase 1)
  // Khởi tạo AI brain cho mỗi civilization từ cecV95Data
  // KHÔNG ghi đè cecV95Data · Lưu riêng window.civAIV120Data
  // ============================================================

  var SAVE_KEY = "cgv6_civ_ai_brain_v120";
  var INIT_MS  = 27200;

  // ── Master data structure ─────────────────────────────────────
  window.civAIV120Data = {
    civs:               {},     // civId → CivAI object
    totalDecisions:     0,
    totalAlliances:     0,
    totalWars:          0,
    totalTechDiscoveries: 0,
    history:            [],     // emergent history
    evaluationQueue:    [],     // civs chờ evaluate
    lastEvalYear:       0,
    initDone:           false,
  };

  var D = window.civAIV120Data;

  // ── Personality trait names (Vietnamese) ─────────────────────
  var TRAIT_NAMES = {
    aggression:    "Hiếu Chiến",
    curiosity:     "Tò Mò",
    spirituality:  "Tâm Linh",
    diplomacy:     "Ngoại Giao",
    ambition:      "Tham Vọng",
    conservatism:  "Bảo Thủ",
    militarism:    "Thượng Võ",
    mercantilism:  "Trọng Thương",
  };

  // ── Personality archetypes → trait presets ───────────────────
  var ARCHETYPES = [
    { name: "Chiến Binh",     aggression: 80, curiosity: 40, spirituality: 30, diplomacy: 20, ambition: 85, conservatism: 70, militarism: 90, mercantilism: 20 },
    { name: "Học Giả",        aggression: 20, curiosity: 90, spirituality: 50, diplomacy: 70, ambition: 60, conservatism: 30, militarism: 20, mercantilism: 50 },
    { name: "Thương Nhân",    aggression: 30, curiosity: 70, spirituality: 30, diplomacy: 80, ambition: 75, conservatism: 40, militarism: 25, mercantilism: 95 },
    { name: "Tín Đồ",         aggression: 40, curiosity: 50, spirituality: 95, diplomacy: 55, ambition: 50, conservatism: 80, militarism: 45, mercantilism: 30 },
    { name: "Nhà Ngoại Giao", aggression: 25, curiosity: 65, spirituality: 45, diplomacy: 95, ambition: 70, conservatism: 35, militarism: 20, mercantilism: 65 },
    { name: "Nhà Khám Phá",   aggression: 50, curiosity: 95, spirituality: 40, diplomacy: 60, ambition: 80, conservatism: 15, militarism: 40, mercantilism: 55 },
    { name: "Kẻ Chinh Phục",  aggression: 90, curiosity: 35, spirituality: 25, diplomacy: 15, ambition: 95, conservatism: 60, militarism: 95, mercantilism: 45 },
    { name: "Người Thủ Cựu",  aggression: 45, curiosity: 25, spirituality: 75, diplomacy: 50, ambition: 35, conservatism: 95, militarism: 55, mercantilism: 40 },
  ];

  // ── Seed RNG từ civId (deterministic) ────────────────────────
  function seedRand(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return function() {
      hash = ((hash << 13) ^ hash) >>> 0;
      hash = (hash * 1664525 + 1013904223) >>> 0;
      return (hash >>> 0) / 0xFFFFFFFF;
    };
  }

  // ── Tạo personality cho civ ───────────────────────────────────
  function generatePersonality(civ) {
    var rng = seedRand((civ.id || '') + (civ.name || ''));

    // Chọn archetype chủ đạo
    var archIdx = Math.floor(rng() * ARCHETYPES.length);
    var arch = ARCHETYPES[archIdx];

    // Thêm biến động ngẫu nhiên ±15
    function jitter(base) {
      return Math.max(5, Math.min(99, Math.round(base + (rng() - 0.5) * 30)));
    }

    return {
      archetype:    arch.name,
      aggression:   jitter(arch.aggression),
      curiosity:    jitter(arch.curiosity),
      spirituality: jitter(arch.spirituality),
      diplomacy:    jitter(arch.diplomacy),
      ambition:     jitter(arch.ambition),
      conservatism: jitter(arch.conservatism),
      militarism:   jitter(arch.militarism),
      mercantilism: jitter(arch.mercantilism),
    };
  }

  // ── Tạo resources ban đầu dựa trên civ.techStage ─────────────
  function generateResources(civ) {
    var stage   = civ.techStage || 0;
    var pop     = civ.population || civ.popEstimate || 1000;
    var base    = Math.floor(50 + stage * 20 + Math.log10(Math.max(1, pop)) * 10);
    return {
      food:       base,
      production: Math.floor(base * 0.8),
      gold:       Math.floor(base * 0.6),
      science:    Math.floor(base * 0.4 + stage * 10),
      culture:    Math.floor(base * 0.3 + stage * 5),
      faith:      Math.floor(base * 0.3),
    };
  }

  // ── Tạo một CivAI mới ─────────────────────────────────────────
  function createCivAI(civ) {
    var personality = generatePersonality(civ);
    var resources   = generateResources(civ);

    return {
      id:               civ.id || ('civ_' + Date.now()),
      name:             civ.name || "Văn Minh Vô Danh",
      personality:      personality,
      resources:        resources,
      technology: {
        military:     civ.techStage || 0,
        science:      civ.techStage || 0,
        culture:      0,
        agriculture:  Math.max(0, (civ.techStage || 0) - 1),
        maritime:     0,
        construction: 0,
        magic:        0,
        trade:        0,
      },
      goals:            [],
      memories:         [],
      currentStrategy:  "neutral",
      relations:        {},   // civId → { relation, score, history }
      stats: {
        decisionsThisEra:       0,
        totalDecisions:         0,
        technologiesDiscovered: 0,
        alliancesFormed:        0,
        warsStarted:            0,
        treatiesSigned:         0,
        yearFounded:            civ.foundYear || window.year || 1,
        lastDecisionYear:       0,
      },
      // Phase tracking
      _lastEvalYear: 0,
    };
  }

  // ── Sync civs từ cecV95Data ───────────────────────────────────
  function syncCivsFromV95() {
    var source = [];
    try {
      if (typeof window.cecV95GetAll === 'function') {
        source = window.cecV95GetAll() || [];
      } else if (window.cecV95Data && Array.isArray(window.cecV95Data.civs)) {
        source = window.cecV95Data.civs;
      }
    } catch(e) {}

    var added = 0;
    source.forEach(function(civ) {
      if (!civ || !civ.id) return;
      if (!D.civs[civ.id]) {
        D.civs[civ.id] = createCivAI(civ);
        added++;
      } else {
        // Cập nhật name nếu thay đổi
        D.civs[civ.id].name = civ.name || D.civs[civ.id].name;
      }
    });

    return added;
  }

  // ── Save / Load ───────────────────────────────────────────────
  function save() {
    try {
      // Chỉ save những gì quan trọng (không save cache lớn)
      var toSave = {
        civs:               D.civs,
        totalDecisions:     D.totalDecisions,
        totalAlliances:     D.totalAlliances,
        totalWars:          D.totalWars,
        totalTechDiscoveries: D.totalTechDiscoveries,
        history:            D.history.slice(-500),
        lastEvalYear:       D.lastEvalYear,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch(e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.assign(D, saved);
    } catch(e) {}
  }

  // ── Public API ────────────────────────────────────────────────
  window.civAIGetAll = function() { return Object.values(D.civs); };
  window.civAIGet    = function(id) { return D.civs[id]; };
  window.civAISave   = save;
  window.civAISyncFromV95 = syncCivsFromV95;
  window.civAIBrainData   = D;

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    load();
    var added = syncCivsFromV95();
    D.initDone = true;
    save();

    console.log("[CivAI Brain V120] 🧠 Khởi động — " + Object.keys(D.civs).length
      + " civs có AI brain (" + added + " mới).");

    // Nếu chưa có civ nào → đợi V95 seed civs rồi thử lại
    if (Object.keys(D.civs).length === 0) {
      var _retry = 0;
      var _wait = setInterval(function() {
        _retry++;
        var n = syncCivsFromV95();
        if (n > 0 || _retry > 10) {
          clearInterval(_wait);
          if (n > 0) save();
          console.log("[CivAI Brain V120] 🧠 " + n + " civs seeded sau khi đợi V95.");
        }
      }, 3000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
