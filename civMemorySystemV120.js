(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI MEMORY SYSTEM (Phase 3)
  // Civilizations nhớ: ai giúp, ai tấn công, chiến tranh, hiệp ước
  // Memory ảnh hưởng quyết định tương lai
  // ============================================================

  var INIT_MS    = 27600;
  var MAX_MEM    = 60;    // max memories per civ
  var DECAY_RATE = 0.95;  // weight decay per century

  // ── Memory types ──────────────────────────────────────────────
  var MEM_TYPES = {
    betrayal:    { impact: -30, icon: "🗡️",  label: "Phản Bội" },
    war_attack:  { impact: -25, icon: "⚔️",  label: "Bị Tấn Công" },
    war_victory: { impact: +15, icon: "🏆",  label: "Chiến Thắng" },
    war_defeat:  { impact: -20, icon: "💀",  label: "Thất Bại" },
    alliance:    { impact: +25, icon: "🤝",  label: "Liên Minh" },
    trade:       { impact: +10, icon: "💰",  label: "Giao Thương" },
    aid:         { impact: +20, icon: "🤲",  label: "Được Giúp Đỡ" },
    treaty:      { impact: +15, icon: "📜",  label: "Hiệp Ước" },
    sanction:    { impact: -15, icon: "🚫",  label: "Trừng Phạt" },
    discover:    { impact:   0, icon: "🔭",  label: "Khám Phá" },
    research:    { impact:   0, icon: "🔬",  label: "Nghiên Cứu" },
    expand:      { impact:   0, icon: "🗺️",  label: "Mở Rộng" },
    religion:    { impact:   0, icon: "🙏",  label: "Tôn Giáo" },
    explore:     { impact:   0, icon: "🧭",  label: "Khám Phá" },
    success:     { impact: +5,  icon: "✨",  label: "Thành Công" },
  };

  // ── Thêm memory cho một civ ───────────────────────────────────
  window.civAIAddMemory = function(civId, memData) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return;
    var ai = D.civs[civId];

    var def = MEM_TYPES[memData.type] || { impact: 0, icon: "📌", label: memData.type };

    var mem = {
      year:      memData.year || window.year || 1,
      type:      memData.type || 'general',
      icon:      def.icon,
      label:     def.label,
      text:      memData.text || '',
      outcome:   memData.outcome || 'neutral',
      targetId:  memData.targetId || null,
      impact:    memData.impact !== undefined ? memData.impact : def.impact,
      weight:    1.0,   // decay over time
    };

    ai.memories = ai.memories || [];
    ai.memories.push(mem);

    // Trim to MAX_MEM (keep most impactful)
    if (ai.memories.length > MAX_MEM) {
      // Sort by |impact| * weight, keep top MAX_MEM
      ai.memories.sort(function(a, b) {
        return Math.abs(b.impact) * b.weight - Math.abs(a.impact) * a.weight;
      });
      ai.memories = ai.memories.slice(0, MAX_MEM);
      // Re-sort by year (chronological)
      ai.memories.sort(function(a, b) { return a.year - b.year; });
    }

    // Update relation score nếu memory liên quan đến một civ khác
    if (memData.targetId && def.impact !== 0) {
      updateRelationScore(civId, memData.targetId, def.impact);
    }
  };

  // ── Cập nhật relation score ───────────────────────────────────
  function updateRelationScore(civId, targetId, delta) {
    var D = window.civAIV120Data;
    if (!D || !D.civs[civId]) return;
    var ai = D.civs[civId];

    if (!ai.relations[targetId]) {
      ai.relations[targetId] = { relation: 'neutral', score: 0, history: [] };
    }

    var rel       = ai.relations[targetId];
    rel.score     = Math.max(-100, Math.min(100, (rel.score || 0) + delta));
    rel.history   = rel.history || [];
    rel.history.push({ year: window.year || 1, delta: delta });
    if (rel.history.length > 20) rel.history = rel.history.slice(-20);

    // Update relation label dựa trên score
    if (rel.score >= 60)       rel.relation = 'ally';
    else if (rel.score >= 20)  rel.relation = 'friendly';
    else if (rel.score <= -60) rel.relation = 'war';
    else if (rel.score <= -20) rel.relation = 'enemy';
    else                       rel.relation = 'neutral';
  }

  // ── Lấy memories ảnh hưởng đến quyết định ─────────────────────
  window.civAIGetRelevantMemories = function(civId, limit) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return [];
    var ai = D.civs[civId];
    limit  = limit || 10;

    return (ai.memories || [])
      .slice(-limit)
      .reverse();
  };

  // ── Lấy attitude với một civ cụ thể ─────────────────────────
  window.civAIGetAttitude = function(civId, targetId) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return 'neutral';
    return ((D.civs[civId].relations || {})[targetId] || {}).relation || 'neutral';
  };

  window.civAIGetRelationScore = function(civId, targetId) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return 0;
    return ((D.civs[civId].relations || {})[targetId] || {}).score || 0;
  };

  // ── Memory decay (mỗi thế kỷ, memories cũ mờ dần) ───────────
  function applyMemoryDecay(yr) {
    var D = window.civAIV120Data;
    if (!D) return;
    Object.values(D.civs).forEach(function(ai) {
      (ai.memories || []).forEach(function(mem) {
        var age = yr - (mem.year || 1);
        if (age > 100) {
          // Decay mỗi thế kỷ vượt qua
          var centuries = Math.floor(age / 100);
          mem.weight = Math.pow(DECAY_RATE, centuries);
        }
      });
    });
  }

  // ── Ghi lại sự kiện chiến tranh vào memory của cả 2 bên ───────
  window.civAIRecordWarEvent = function(attackerId, defenderId, outcome) {
    var yr = window.year || 1;
    var aName = ((window.civAIV120Data || {}).civs || {})[attackerId];
    var dName = ((window.civAIV120Data || {}).civs || {})[defenderId];
    var an = aName ? aName.name : attackerId;
    var dn = dName ? dName.name : defenderId;

    // Kẻ tấn công nhớ
    window.civAIAddMemory(attackerId, {
      year: yr, type: 'war_attack', targetId: defenderId,
      text: an + " tấn công " + dn,
      outcome: outcome,
    });

    // Bên phòng thủ nhớ
    window.civAIAddMemory(defenderId, {
      year: yr, type: 'betrayal', targetId: attackerId,
      text: dn + " bị " + an + " tấn công",
      outcome: 'negative',
    });
  };

  // ── Ghi lại liên minh vào memory ─────────────────────────────
  window.civAIRecordAlliance = function(civA, civB) {
    var yr = window.year || 1;
    var nameA = ((window.civAIV120Data || {}).civs || {})[civA];
    var nameB = ((window.civAIV120Data || {}).civs || {})[civB];
    nameA = nameA ? nameA.name : civA;
    nameB = nameB ? nameB.name : civB;

    window.civAIAddMemory(civA, {
      year: yr, type: 'alliance', targetId: civB,
      text: nameA + " kết minh với " + nameB,
      outcome: 'success',
    });
    window.civAIAddMemory(civB, {
      year: yr, type: 'alliance', targetId: civA,
      text: nameB + " kết minh với " + nameA,
      outcome: 'success',
    });
  };

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    console.log("[CivAI Memory V120] 🧠 Memory System khởi động — Max " + MAX_MEM
      + " ký ức · Decay " + DECAY_RATE + "x/century · Relation tracking.");

    // Decay mỗi 200 năm (trong gameTick)
    var lastDecayYear = window.year || 0;
    var _origGT = window.gameTick;
    window.gameTick = function() {
      if (_origGT) _origGT.apply(this, arguments);
      var yr = window.year || 1;
      if (yr - lastDecayYear >= 200) {
        lastDecayYear = yr;
        try { applyMemoryDecay(yr); } catch(e) {}
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
