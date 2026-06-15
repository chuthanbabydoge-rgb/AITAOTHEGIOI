(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI DECISION ENGINE (Phase 2)
  // Mỗi năm civilization.evaluate() → chọn strategy → thực thi
  // 7 strategies: expand/research/trade/alliance/war/religion/explore
  // ============================================================

  var INIT_MS         = 27400;
  var DECISION_EVERY  = 25;   // mỗi 25 năm evaluate 1 lần

  // ── 7 Strategies ─────────────────────────────────────────────
  var STRATEGIES = {
    expand: {
      name: "Mở Rộng",
      icon: "🗺️",
      weight: function(ai) {
        return (ai.personality.ambition * 0.4 + ai.personality.aggression * 0.3
              + ai.resources.food * 0.2 + ai.resources.production * 0.1) / 100;
      },
      execute: function(ai, yr) {
        var bonus = Math.floor(ai.personality.ambition * 0.5 + 10);
        ai.resources.food       = Math.floor((ai.resources.food || 50) * 1.08);
        ai.resources.production = Math.floor((ai.resources.production || 50) * 1.06);
        return {
          type:    "expand",
          text:    ai.name + " mở rộng lãnh thổ về phía " + pickDirection() + ", khai phá " + bonus + " vùng đất mới.",
          effects: { food: "+8%", production: "+6%" },
        };
      }
    },

    research: {
      name: "Nghiên Cứu",
      icon: "🔬",
      weight: function(ai) {
        return (ai.personality.curiosity * 0.5 + ai.resources.science * 0.3
              + (100 - ai.personality.conservatism) * 0.2) / 100;
      },
      execute: function(ai, yr) {
        ai.resources.science = Math.floor((ai.resources.science || 20) * 1.15);
        // Unlock tech (via techTree)
        if (typeof window.civAIResearchTech === 'function') {
          window.civAIResearchTech(ai.id);
        }
        return {
          type:    "research",
          text:    ai.name + " tập trung vào tri thức và khoa học.",
          effects: { science: "+15%" },
        };
      }
    },

    trade: {
      name: "Giao Thương",
      icon: "💰",
      weight: function(ai) {
        return (ai.personality.mercantilism * 0.5 + ai.personality.diplomacy * 0.3
              + ai.resources.gold * 0.2) / 100;
      },
      execute: function(ai, yr) {
        var partners = findTradePartners(ai);
        ai.resources.gold    = Math.floor((ai.resources.gold || 30) * 1.12);
        ai.resources.culture = Math.floor((ai.resources.culture || 20) * 1.05);
        return {
          type:    "trade",
          text:    ai.name + " thiết lập tuyến thương mại với " + (partners.length > 0 ? partners[0] : "các vùng lân cận") + ".",
          effects: { gold: "+12%", culture: "+5%" },
        };
      }
    },

    alliance: {
      name: "Liên Minh",
      icon: "🤝",
      weight: function(ai) {
        return (ai.personality.diplomacy * 0.5 + (100 - ai.personality.aggression) * 0.3
              + ai.personality.mercantilism * 0.2) / 100;
      },
      execute: function(ai, yr) {
        var target = findAllianceTarget(ai);
        if (target && typeof window.civAIFormAlliance === 'function') {
          window.civAIFormAlliance(ai.id, target);
        }
        var targetName = target ? (window.civAIV120Data.civs[target] || {}).name || "Ẩn Danh" : "một thế lực";
        return {
          type:    "alliance",
          text:    ai.name + " đề xuất liên minh với " + targetName + ".",
          effects: { diplomacy: "↑", security: "↑" },
        };
      }
    },

    war: {
      name: "Chiến Tranh",
      icon: "⚔️",
      weight: function(ai) {
        // Chỉ chiến tranh khi đủ mạnh
        var strength = (ai.personality.aggression + ai.personality.militarism) / 2;
        var resource = (ai.resources.food + ai.resources.production) / 2;
        if (resource < 60) return 0.01;  // Quá yếu không đánh
        return (strength * 0.6 + ai.personality.ambition * 0.4) / 100;
      },
      execute: function(ai, yr) {
        var target = findWarTarget(ai);
        if (target && typeof window.civAIDeclareWar === 'function') {
          window.civAIDeclareWar(ai.id, target);
        }
        ai.personality.aggression = Math.min(99, ai.personality.aggression + 3);
        ai.resources.production   = Math.floor((ai.resources.production || 50) * 0.85);
        var targetName = target ? (window.civAIV120Data.civs[target] || {}).name || "kẻ thù" : "một thế lực thù địch";
        return {
          type:    "war",
          text:    ai.name + " tuyên chiến với " + targetName + "!",
          effects: { production: "-15%", aggression: "+3" },
        };
      }
    },

    religion: {
      name: "Tôn Giáo",
      icon: "🙏",
      weight: function(ai) {
        return (ai.personality.spirituality * 0.6 + ai.personality.conservatism * 0.3
              + ai.resources.faith * 0.1) / 100;
      },
      execute: function(ai, yr) {
        ai.resources.faith   = Math.floor((ai.resources.faith || 20) * 1.20);
        ai.resources.culture = Math.floor((ai.resources.culture || 20) * 1.08);
        return {
          type:    "religion",
          text:    ai.name + " truyền bá tín ngưỡng và xây dựng các thánh địa.",
          effects: { faith: "+20%", culture: "+8%" },
        };
      }
    },

    explore: {
      name: "Khám Phá",
      icon: "🧭",
      weight: function(ai) {
        return (ai.personality.curiosity * 0.5 + (100 - ai.personality.conservatism) * 0.3
              + ai.personality.ambition * 0.2) / 100;
      },
      execute: function(ai, yr) {
        ai.resources.gold    = Math.floor((ai.resources.gold || 30) * 1.08);
        ai.resources.science = Math.floor((ai.resources.science || 20) * 1.10);
        return {
          type:    "explore",
          text:    ai.name + " cử đội thám hiểm ra khám phá vùng đất chưa biết.",
          effects: { science: "+10%", gold: "+8%" },
        };
      }
    },
  };

  // ── Chọn direction ngẫu nhiên ─────────────────────────────────
  function pickDirection() {
    var dirs = ["phía Bắc","phía Nam","phía Đông","phía Tây","duyên hải","cao nguyên"];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  // ── Tìm đối tác thương mại ────────────────────────────────────
  function findTradePartners(ai) {
    var D    = window.civAIV120Data;
    var all  = Object.values(D.civs).filter(function(c) { return c.id !== ai.id; });
    return all
      .filter(function(c) { return (ai.relations[c.id] || {}).relation !== 'war'; })
      .slice(0, 2)
      .map(function(c) { return c.name; });
  }

  // ── Tìm mục tiêu liên minh ────────────────────────────────────
  function findAllianceTarget(ai) {
    var D   = window.civAIV120Data;
    var all = Object.values(D.civs).filter(function(c) { return c.id !== ai.id; });
    var candidates = all.filter(function(c) {
      var rel = (ai.relations[c.id] || {});
      return rel.relation !== 'war' && rel.relation !== 'ally';
    });
    if (candidates.length === 0) return null;
    // Ưu tiên civ có tính cách hòa bình tương đồng
    candidates.sort(function(a, b) {
      var scoreA = a.personality.diplomacy + (100 - a.personality.aggression);
      var scoreB = b.personality.diplomacy + (100 - b.personality.aggression);
      return scoreB - scoreA;
    });
    return candidates[0] ? candidates[0].id : null;
  }

  // ── Tìm mục tiêu chiến tranh ──────────────────────────────────
  function findWarTarget(ai) {
    var D   = window.civAIV120Data;
    var all = Object.values(D.civs).filter(function(c) { return c.id !== ai.id; });
    // Tìm kẻ thù (score âm) hoặc civ yếu nhất
    var enemies = all.filter(function(c) {
      return (ai.relations[c.id] || {}).relation === 'enemy';
    });
    if (enemies.length > 0) return enemies[0].id;
    // Hoặc civ nhỏ nhất
    var weak = all.filter(function(c) { return (c.resources.food || 50) < 60; });
    if (weak.length > 0) return weak[0].id;
    return null;
  }

  // ── evaluate(): Chọn strategy tốt nhất ───────────────────────
  window.civAIEvaluate = function(civId) {
    var D  = window.civAIV120Data;
    var ai = D.civs[civId];
    if (!ai) return null;

    var yr = window.year || 1;

    // Tính weight cho mỗi strategy
    var best     = null;
    var bestScore = -1;

    Object.keys(STRATEGIES).forEach(function(key) {
      var strat  = STRATEGIES[key];
      var score  = strat.weight(ai);

      // Memory influence: boost strategy nếu lần trước thành công
      var memBonus = 0;
      if (ai.memories && ai.memories.length > 0) {
        var lastSuccess = ai.memories.slice(-10).find(function(m) {
          return m.type === key && m.outcome === 'success';
        });
        if (lastSuccess) memBonus = 0.15;
      }

      score += memBonus;

      // Random noise nhỏ (5%)
      score += (Math.random() - 0.5) * 0.05;

      if (score > bestScore) {
        bestScore = score;
        best      = key;
      }
    });

    // Execute strategy
    var strat  = STRATEGIES[best];
    var result = strat.execute(ai, yr);

    // Update stats
    ai.currentStrategy         = best;
    ai.stats.totalDecisions++;
    ai.stats.decisionsThisEra++;
    ai.stats.lastDecisionYear  = yr;
    ai._lastEvalYear           = yr;
    D.totalDecisions++;

    // Add to memory
    if (typeof window.civAIAddMemory === 'function') {
      window.civAIAddMemory(civId, {
        year:    yr,
        type:    result.type,
        text:    result.text,
        outcome: 'success',
      });
    }

    // Emit to emergent history
    if (typeof window.civAIEmitHistory === 'function') {
      window.civAIEmitHistory(yr, result.type, ai.name, result.text);
    }

    return { civId: civId, strategy: best, result: result, year: yr };
  };

  // ── Evaluate tất cả civs mỗi N năm ───────────────────────────
  window.civAIEvaluateAll = function(yr) {
    var D = window.civAIV120Data;
    if (!D || !D.initDone) return;

    var civIds = Object.keys(D.civs);
    if (civIds.length === 0) {
      // Thử sync lại từ V95
      if (typeof window.civAISyncFromV95 === 'function') window.civAISyncFromV95();
      return;
    }

    var results = [];
    civIds.forEach(function(id) {
      var ai = D.civs[id];
      if (!ai) return;
      // Mỗi civ evaluate theo offset khác nhau (spread load)
      var offset = Math.abs(id.charCodeAt ? id.charCodeAt(0) % 20 : 0);
      if ((yr - offset) % DECISION_EVERY === 0) {
        var r = window.civAIEvaluate(id);
        if (r) results.push(r);
      }
    });

    D.lastEvalYear = yr;

    // Save mỗi 100 năm
    if (yr % 100 === 0 && typeof window.civAISave === 'function') {
      window.civAISave();
    }

    return results;
  };

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    console.log("[CivAI Decision V120] ⚙️ Decision Engine khởi động — 7 strategies · evaluate() mỗi "
      + DECISION_EVERY + " năm.");

    // Hook vào wacV92 year-change listener nếu có
    if (typeof window.wacV92AddListener === 'function') {
      window.wacV92AddListener(function(yr) {
        try { window.civAIEvaluateAll(yr); } catch(e) {}
      });
      console.log("[CivAI Decision V120] ✅ Hooked vào wacV92 year-change.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
