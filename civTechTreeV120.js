(function() {
  "use strict";

  // ============================================================
  // V120 – CIV AI TECHNOLOGY RACE (Phase 5)
  // Mỗi civ có cây công nghệ riêng dựa trên: tài nguyên, văn hóa, vị trí
  // 8 branches · 5 levels each · Khám phá tạo emergent history
  // ============================================================

  var INIT_MS = 28000;

  // ── 8 Technology Branches ────────────────────────────────────
  var TECH_BRANCHES = {
    military: {
      name:  "Quân Sự",
      icon:  "⚔️",
      levels: [
        { level: 1, name: "Vũ Khí Nguyên Thủy",  cost: 30,  effects: { aggression: +5, production: +5 } },
        { level: 2, name: "Luyện Kim Đồng",       cost: 60,  effects: { aggression: +8, production: +10 } },
        { level: 3, name: "Thép Hóa Binh Khí",    cost: 120, effects: { aggression: +12, production: +15 } },
        { level: 4, name: "Kỵ Binh Tinh Nhuệ",   cost: 200, effects: { aggression: +15, production: +20 } },
        { level: 5, name: "Chiến Tranh Hiện Đại", cost: 350, effects: { aggression: +20, production: +30 } },
      ],
      primaryStat: "aggression",
    },
    science: {
      name:  "Khoa Học",
      icon:  "🔬",
      levels: [
        { level: 1, name: "Quan Sát Thiên Văn",  cost: 25,  effects: { science: +10, curiosity: +5 } },
        { level: 2, name: "Toán Học Cơ Bản",     cost: 50,  effects: { science: +20, curiosity: +8 } },
        { level: 3, name: "Triết Học Tự Nhiên",  cost: 100, effects: { science: +35, curiosity: +12 } },
        { level: 4, name: "Phương Pháp Khoa Học", cost: 180, effects: { science: +50, curiosity: +18 } },
        { level: 5, name: "Cách Mạng Khoa Học",  cost: 300, effects: { science: +80, curiosity: +25 } },
      ],
      primaryStat: "curiosity",
    },
    culture: {
      name:  "Văn Hóa",
      icon:  "🎨",
      levels: [
        { level: 1, name: "Nghệ Thuật Dân Gian",  cost: 20,  effects: { culture: +10, spirituality: +5 } },
        { level: 2, name: "Kiến Trúc Cổ Điển",    cost: 45,  effects: { culture: +20, spirituality: +8 } },
        { level: 3, name: "Văn Học Sử Thi",       cost: 90,  effects: { culture: +35, diplomacy: +10 } },
        { level: 4, name: "Trường Phái Nghệ Thuật",cost: 160, effects: { culture: +50, diplomacy: +15 } },
        { level: 5, name: "Đế Chế Mềm",           cost: 280, effects: { culture: +80, diplomacy: +25 } },
      ],
      primaryStat: "spirituality",
    },
    agriculture: {
      name:  "Nông Nghiệp",
      icon:  "🌾",
      levels: [
        { level: 1, name: "Canh Tác Thô Sơ",      cost: 20, effects: { food: +15, population: +100 } },
        { level: 2, name: "Thủy Lợi",             cost: 40, effects: { food: +25, population: +500 } },
        { level: 3, name: "Luân Canh Cây Trồng",  cost: 80, effects: { food: +40, population: +2000 } },
        { level: 4, name: "Nông Nghiệp Khoa Học",  cost: 150, effects: { food: +65, population: +5000 } },
        { level: 5, name: "Canh Tác Đô Thị",      cost: 260, effects: { food: +100, population: +10000 } },
      ],
      primaryStat: "conservatism",
    },
    maritime: {
      name:  "Hàng Hải",
      icon:  "⛵",
      levels: [
        { level: 1, name: "Thuyền Bè Đơn Giản",   cost: 25,  effects: { trade: +10, curiosity: +5 } },
        { level: 2, name: "Hàng Hải Ven Bờ",      cost: 55,  effects: { trade: +20, curiosity: +10 } },
        { level: 3, name: "Khám Phá Đại Dương",   cost: 110, effects: { trade: +35, curiosity: +18 } },
        { level: 4, name: "Tàu Chiến Hải Quân",   cost: 190, effects: { trade: +50, aggression: +10 } },
        { level: 5, name: "Đế Quốc Biển",         cost: 320, effects: { trade: +80, curiosity: +30 } },
      ],
      primaryStat: "mercantilism",
    },
    construction: {
      name:  "Kiến Trúc",
      icon:  "🏛️",
      levels: [
        { level: 1, name: "Gỗ & Đá Thô",          cost: 20,  effects: { production: +10, culture: +5 } },
        { level: 2, name: "Thành Lũy Đá",          cost: 45,  effects: { production: +20, culture: +8 } },
        { level: 3, name: "Kỳ Quan Cổ Đại",        cost: 90,  effects: { production: +35, culture: +20 } },
        { level: 4, name: "Đô Thị Quy Hoạch",      cost: 160, effects: { production: +55, culture: +30 } },
        { level: 5, name: "Siêu Đô Thị",           cost: 270, effects: { production: +80, culture: +50 } },
      ],
      primaryStat: "ambition",
    },
    magic: {
      name:  "Thần Thuật",
      icon:  "✨",
      levels: [
        { level: 1, name: "Bùa Chú Đơn Giản",     cost: 30,  effects: { faith: +15, spirituality: +8 } },
        { level: 2, name: "Triệu Hồi Thần Linh",  cost: 65,  effects: { faith: +30, spirituality: +15 } },
        { level: 3, name: "Ma Thuật Chiến Trận",   cost: 130, effects: { faith: +50, aggression: +8 } },
        { level: 4, name: "Phép Thuật Vũ Trụ",    cost: 220, effects: { faith: +80, spirituality: +25 } },
        { level: 5, name: "Sức Mạnh Nguyên Thủy",  cost: 380, effects: { faith: +120, spirituality: +40 } },
      ],
      primaryStat: "spirituality",
    },
    trade: {
      name:  "Thương Nghiệp",
      icon:  "💰",
      levels: [
        { level: 1, name: "Chợ Làng",             cost: 20,  effects: { gold: +10, mercantilism: +5 } },
        { level: 2, name: "Tuyến Thương Mại",      cost: 45,  effects: { gold: +25, mercantilism: +10 } },
        { level: 3, name: "Ngân Hàng Thành Thị",  cost: 90,  effects: { gold: +45, mercantilism: +15 } },
        { level: 4, name: "Công Ty Đông Ấn",       cost: 160, effects: { gold: +70, mercantilism: +22 } },
        { level: 5, name: "Đế Chế Thương Mại",    cost: 270, effects: { gold: +110, mercantilism: +35 } },
      ],
      primaryStat: "mercantilism",
    },
  };

  // ── Tính branch ưu tiên của civ dựa trên personality ─────────
  function getPrimaryBranches(ai) {
    var p = ai.personality;
    var scores = {
      military:     p.aggression + p.militarism,
      science:      p.curiosity * 2,
      culture:      p.spirituality + p.diplomacy,
      agriculture:  p.conservatism + (100 - p.aggression),
      maritime:     p.curiosity + p.mercantilism,
      construction: p.ambition + p.conservatism,
      magic:        p.spirituality * 2,
      trade:        p.mercantilism * 2,
    };

    return Object.keys(scores).sort(function(a, b) { return scores[b] - scores[a]; });
  }

  // ── Nghiên cứu 1 tech level trong branch ─────────────────────
  function researchTech(ai, branch) {
    if (!ai.technology) ai.technology = {};
    var currentLevel = ai.technology[branch] || 0;
    var branchDef    = TECH_BRANCHES[branch];
    if (!branchDef) return null;

    var nextLevel = currentLevel + 1;
    if (nextLevel > 5) return null;  // Max level

    var techDef = branchDef.levels.find(function(t) { return t.level === nextLevel; });
    if (!techDef) return null;

    // Kiểm tra có đủ science không
    if ((ai.resources.science || 0) < techDef.cost * 0.5) return null;

    // Khám phá tech!
    ai.technology[branch] = nextLevel;
    ai.resources.science  = Math.max(0, (ai.resources.science || 0) - techDef.cost * 0.5);
    ai.stats.technologiesDiscovered++;
    window.civAIV120Data.totalTechDiscoveries++;

    // Apply effects
    Object.keys(techDef.effects || {}).forEach(function(stat) {
      var val = techDef.effects[stat];
      if (stat in (ai.personality || {})) {
        ai.personality[stat] = Math.max(1, Math.min(99, (ai.personality[stat] || 50) + val));
      } else {
        ai.resources[stat] = Math.floor((ai.resources[stat] || 0) + val);
      }
    });

    return {
      branch:  branch,
      level:   nextLevel,
      name:    techDef.name,
      icon:    branchDef.icon,
      effects: techDef.effects,
    };
  }

  // ── Research tick cho một civ ─────────────────────────────────
  window.civAIResearchTech = function(civId) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return null;
    var ai = D.civs[civId];

    // Chọn branch theo priority
    var branches = getPrimaryBranches(ai);

    // Thử branch ưu tiên 1 hoặc 2
    for (var i = 0; i < Math.min(2, branches.length); i++) {
      var result = researchTech(ai, branches[i]);
      if (result) {
        // Emit history
        if (typeof window.civAIEmitHistory === 'function') {
          var text = ai.name + " phát minh " + result.name + " [" + TECH_BRANCHES[result.branch].name + " Lv." + result.level + "]";
          window.civAIEmitHistory(window.year || 1, "discover", ai.name, text);
        }
        // Add memory
        if (typeof window.civAIAddMemory === 'function') {
          window.civAIAddMemory(civId, {
            year:    window.year || 1,
            type:    "research",
            text:    "Phát minh: " + result.name,
            outcome: "success",
          });
        }
        return result;
      }
    }
    return null;
  };

  // ── Lấy danh sách tech của civ ───────────────────────────────
  window.civAIGetTechTree = function(civId) {
    var D  = window.civAIV120Data;
    if (!D || !D.civs[civId]) return {};
    var ai  = D.civs[civId];
    var out = {};
    Object.keys(TECH_BRANCHES).forEach(function(branch) {
      var level = ai.technology[branch] || 0;
      var def   = TECH_BRANCHES[branch];
      var nextTech = level < 5 ? def.levels.find(function(t) { return t.level === level + 1; }) : null;
      out[branch] = {
        name:     def.name,
        icon:     def.icon,
        level:    level,
        maxLevel: 5,
        currentName: level > 0 ? def.levels[level - 1].name : "Chưa nghiên cứu",
        nextName: nextTech ? nextTech.name : "Đã đạt tối đa",
        nextCost: nextTech ? nextTech.cost : 0,
      };
    });
    return out;
  };

  // ── TECH_BRANCHES expose ──────────────────────────────────────
  window.civAITechBranches = TECH_BRANCHES;

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    console.log("[CivAI TechTree V120] 🔬 Technology Race khởi động — 8 branches · 5 levels · Personality-driven research.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(init, INIT_MS); });
  } else {
    setTimeout(init, INIT_MS);
  }
})();
