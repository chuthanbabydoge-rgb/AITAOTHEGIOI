(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI DIPLOMACY (Phase 4)
  // Tự tạo: liên minh, hiệp ước, cấm vận, thù địch
  // Không cần người chơi can thiệp
  // ============================================================

  var INIT_MS = 27800;

  // ── Diplomatic action types ───────────────────────────────────
  var DIPLO_ACTIONS = {
    form_alliance: {
      label:      "Thành Lập Liên Minh",
      icon:       "🤝",
      minDiplo:   55,   // min diplomacy trait
      minScore:   20,   // min relation score
      cost:       { gold: 20 },
      effect: function(civA, civB) {
        civA.stats.alliancesFormed++;
        civB.stats.alliancesFormed++;
        window.civAIV120Data.totalAlliances++;
        if (typeof window.civAIRecordAlliance === 'function') {
          window.civAIRecordAlliance(civA.id, civB.id);
        }
        return "🤝 Liên Minh hình thành!";
      }
    },

    sign_treaty: {
      label:      "Ký Hiệp Ước Hòa Bình",
      icon:       "📜",
      minDiplo:   40,
      minScore:   0,
      cost:       { gold: 10 },
      effect: function(civA, civB) {
        civA.stats.treatiesSigned++;
        civB.stats.treatiesSigned++;
        if (typeof window.civAIAddMemory === 'function') {
          var yr = window.year || 1;
          window.civAIAddMemory(civA.id, { year: yr, type: 'treaty', targetId: civB.id, text: civA.name + " và " + civB.name + " ký hiệp ước hòa bình." });
          window.civAIAddMemory(civB.id, { year: yr, type: 'treaty', targetId: civA.id, text: civB.name + " và " + civA.name + " ký hiệp ước hòa bình." });
        }
        return "📜 Hiệp ước ký kết!";
      }
    },

    trade_agreement: {
      label:      "Thỏa Thuận Thương Mại",
      icon:       "💰",
      minDiplo:   30,
      minScore:   -10,
      cost:       {},
      effect: function(civA, civB) {
        civA.resources.gold = Math.floor((civA.resources.gold || 30) * 1.08);
        civB.resources.gold = Math.floor((civB.resources.gold || 30) * 1.08);
        if (typeof window.civAIAddMemory === 'function') {
          var yr = window.year || 1;
          window.civAIAddMemory(civA.id, { year: yr, type: 'trade', targetId: civB.id, outcome: 'success', text: civA.name + " giao thương với " + civB.name });
          window.civAIAddMemory(civB.id, { year: yr, type: 'trade', targetId: civA.id, outcome: 'success', text: civB.name + " giao thương với " + civA.name });
        }
        return "💰 Thỏa thuận thương mại!";
      }
    },

    declare_war: {
      label:      "Tuyên Chiến",
      icon:       "⚔️",
      minAggr:    65,
      minScore:   null,  // score phải < -30
      maxScore:   -30,
      cost:       {},
      effect: function(civA, civB) {
        civA.stats.warsStarted++;
        window.civAIV120Data.totalWars++;
        if (typeof window.civAIRecordWarEvent === 'function') {
          window.civAIRecordWarEvent(civA.id, civB.id, 'ongoing');
        }
        // Thêm vào warsActive nếu có
        try {
          if (Array.isArray(window.warsActive)) {
            window.warsActive.push({
              id:        "civai_war_" + civA.id + "_" + civB.id + "_" + (window.year || 1),
              attacker:  civA.name,
              defender:  civB.name,
              year:      window.year || 1,
              source:    "CivAI V120",
            });
          }
        } catch(e) {}
        return "⚔️ Chiến tranh bùng nổ!";
      }
    },

    impose_sanction: {
      label:      "Áp Đặt Cấm Vận",
      icon:       "🚫",
      minAggr:    40,
      maxScore:   -10,
      cost:       {},
      effect: function(civA, civB) {
        civB.resources.gold  = Math.floor((civB.resources.gold || 30) * 0.85);
        civB.resources.trade = (civB.resources.trade || 0) - 10;
        if (typeof window.civAIAddMemory === 'function') {
          var yr = window.year || 1;
          window.civAIAddMemory(civA.id, { year: yr, type: 'sanction', targetId: civB.id, text: civA.name + " áp đặt cấm vận lên " + civB.name });
          window.civAIAddMemory(civB.id, { year: yr, type: 'sanction', targetId: civA.id, impact: -20, text: civB.name + " bị " + civA.name + " cấm vận" });
        }
        return "🚫 Cấm vận áp đặt!";
      }
    },
  };

  // ── Evaluate diplomatic actions cho mỗi cặp civ ─────────────
  function evaluateDiplomacy() {
    var D    = window.civAIV120Data;
    if (!D || !D.initDone) return;

    var civList = Object.values(D.civs);
    if (civList.length < 2) return;

    var yr = window.year || 1;

    // Mỗi cặp civ có thể có diplomatic action
    for (var i = 0; i < civList.length; i++) {
      for (var j = i + 1; j < civList.length; j++) {
        var civA = civList[i];
        var civB = civList[j];

        // Chỉ xử lý mỗi 50 năm cho mỗi cặp (tránh spam)
        var pairKey = [civA.id, civB.id].sort().join('_');
        if (!D._diploLastYear) D._diploLastYear = {};
        if ((D._diploLastYear[pairKey] || 0) + 50 > yr) continue;
        D._diploLastYear[pairKey] = yr;

        tryDiplomatic(civA, civB, yr);
      }
    }
  }

  // ── Thử một diplomatic action giữa 2 civs ────────────────────
  function tryDiplomatic(civA, civB, yr) {
    var scoreAB = window.civAIGetRelationScore ? window.civAIGetRelationScore(civA.id, civB.id) : 0;
    var relAB   = window.civAIGetAttitude     ? window.civAIGetAttitude(civA.id, civB.id)      : 'neutral';

    // Logic ưu tiên:
    // 1. Nếu đang thù → xem xét tuyên chiến hoặc cấm vận
    // 2. Nếu trung lập với score thấp → cấm vận
    // 3. Nếu trung lập với score cao → liên minh hoặc hiệp ước
    // 4. Mặc định → thỏa thuận thương mại

    var action = null;
    var r      = Math.random();

    if (relAB === 'war') {
      // Đang chiến tranh: 20% chance ký hiệp ước hòa bình
      if (r < 0.20 && civA.personality.diplomacy > 50) {
        action = DIPLO_ACTIONS.sign_treaty;
      }
    } else if (relAB === 'enemy' || scoreAB < -30) {
      // Thù địch
      if (r < 0.15 && civA.personality.aggression >= 65) {
        action = DIPLO_ACTIONS.declare_war;
      } else if (r < 0.35) {
        action = DIPLO_ACTIONS.impose_sanction;
      }
    } else if (scoreAB >= 40 && civA.personality.diplomacy >= 55) {
      // Thân thiện → liên minh
      if (relAB !== 'ally' && r < 0.25) {
        action = DIPLO_ACTIONS.form_alliance;
      } else if (r < 0.40) {
        action = DIPLO_ACTIONS.trade_agreement;
      }
    } else if (scoreAB >= 10) {
      // Tương đối tốt → thỏa thuận
      if (r < 0.30) {
        action = DIPLO_ACTIONS.trade_agreement;
      } else if (r < 0.15) {
        action = DIPLO_ACTIONS.sign_treaty;
      }
    } else {
      // Trung lập → thỉnh thoảng trade
      if (r < 0.15) {
        action = DIPLO_ACTIONS.trade_agreement;
      }
    }

    if (!action) return;

    // Execute action
    var label = action.effect(civA, civB);

    // Emit history event
    if (typeof window.civAIEmitHistory === 'function') {
      window.civAIEmitHistory(yr, action.icon.replace(/[^a-z]/gi,'').toLowerCase() || 'diplo',
        civA.name, action.label + ": " + civA.name + " và " + civB.name + ". " + label);
    }
  }

  // ── Public: hình thành liên minh giữa 2 civs ─────────────────
  window.civAIFormAlliance = function(civAId, civBId) {
    var D = window.civAIV120Data;
    if (!D) return;
    var civA = D.civs[civAId];
    var civB = D.civs[civBId];
    if (!civA || !civB) return;
    DIPLO_ACTIONS.form_alliance.effect(civA, civB);
    // Update relation
    if (!civA.relations[civBId]) civA.relations[civBId] = { relation: 'neutral', score: 0, history: [] };
    if (!civB.relations[civAId]) civB.relations[civAId] = { relation: 'neutral', score: 0, history: [] };
    civA.relations[civBId].relation = 'ally';
    civA.relations[civBId].score    = 70;
    civB.relations[civAId].relation = 'ally';
    civB.relations[civAId].score    = 70;
  };

  // ── Public: tuyên chiến ───────────────────────────────────────
  window.civAIDeclareWar = function(attackerId, defenderId) {
    var D = window.civAIV120Data;
    if (!D) return;
    var civA = D.civs[attackerId];
    var civB = D.civs[defenderId];
    if (!civA || !civB) return;
    DIPLO_ACTIONS.declare_war.effect(civA, civB);
    // Update relation
    if (!civA.relations[defenderId]) civA.relations[defenderId] = { relation: 'neutral', score: 0, history: [] };
    if (!civB.relations[attackerId]) civB.relations[attackerId] = { relation: 'neutral', score: 0, history: [] };
    civA.relations[defenderId].relation = 'war';
    civA.relations[defenderId].score    = -80;
    civB.relations[attackerId].relation = 'war';
    civB.relations[attackerId].score    = -80;
  };

  // ── Hook vào gameTick ─────────────────────────────────────────
  function hookDiplo() {
    var lastDiploYear = 0;
    var _orig = window.gameTick;
    window.gameTick = function() {
      if (_orig) _orig.apply(this, arguments);
      var yr = window.year || 1;
      if (yr - lastDiploYear >= 50) {
        lastDiploYear = yr;
        try { evaluateDiplomacy(); } catch(e) {}
      }
    };
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    hookDiplo();
    console.log("[CivAI Diplomacy V120] 🌐 Ngoại Giao tự động — 5 loại hành động · Liên Minh · Chiến Tranh · Cấm Vận · Hiệp Ước · Thương Mại sẵn sàng.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
